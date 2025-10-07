import { Injectable, UnauthorizedException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/model/user.model';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userModel.findOne({ email }).select('+password');
        
        if (!user) {
            return null;
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Usuario inactivo. Contacta al administrador.');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return null;
        }

        // Retornar usuario sin la contraseña
        const { password: userPassword, ...result } = user.toObject();
        return result;
    }

    async login(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const payload: JwtPayloadDto = {
            sub: (user as any)._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        const accessToken = this.jwtService.sign(payload);
        const expiresIn = 3600; // 1 hora en segundos

        return {
            accessToken,
            user: {
                id: (user as any)._id.toString(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
            },
            tokenType: 'Bearer',
            expiresIn,
        };
    }

    async getUserFromToken(userId: string): Promise<User> {
        const user = await this.userModel.findById(userId).select('-password');
        
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('Usuario inactivo');
        }

        return user;
    }

    async refreshToken(userId: string): Promise<{ accessToken: string; expiresIn: number }> {
        const user = await this.getUserFromToken(userId);

        const payload: JwtPayloadDto = {
            sub: (user as any)._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName,
        };

        const accessToken = this.jwtService.sign(payload);
        const expiresIn = 3600; // 1 hora en segundos

        return {
            accessToken,
            expiresIn,
        };
    }

    async register(registerDto: RegisterRequestDto): Promise<RegisterResponseDto> {
        try {
            // Verificar si el usuario ya existe
            const existingUser = await this.userModel.findOne({ email: registerDto.email });
            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(registerDto.password, 10);

            // Crear nuevo usuario
            const newUser = new this.userModel({
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                email: registerDto.email,
                role: registerDto.role,
                password: hashedPassword,
                isActive: true, // Activar automáticamente al registrarse
            });

            const savedUser = await newUser.save();

            // Generar token JWT
            const payload: JwtPayloadDto = {
                sub: (savedUser as any)._id.toString(),
                email: savedUser.email,
                role: savedUser.role,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
            };

            const accessToken = this.jwtService.sign(payload);
            const expiresIn = 3600; // 1 hora en segundos

            return {
                accessToken,
                user: {
                    id: (savedUser as any)._id.toString(),
                    firstName: savedUser.firstName,
                    lastName: savedUser.lastName,
                    email: savedUser.email,
                    role: savedUser.role,
                    isActive: savedUser.isActive,
                },
                tokenType: 'Bearer',
                expiresIn,
            };
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new BadRequestException('Failed to register user');
        }
    }
}
