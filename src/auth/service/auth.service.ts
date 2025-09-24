import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../../users/model/user.model';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';
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
}
