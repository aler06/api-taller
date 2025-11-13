import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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
import { GuestLoginRequestDto } from '../dto/guest-login-request.dto';
import { GuestLoginResponseDto } from '../dto/guest-login-response.dto';
import { Role } from '../../users/enum/role.enum';

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
      throw new UnauthorizedException(
        'Usuario inactivo. Contacta al administrador.',
      );
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
      sub: user._id.toString(),
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
        id: user._id.toString(),
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

  async refreshToken(
    userId: string,
  ): Promise<{ accessToken: string; expiresIn: number }> {
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

  /**
   * MÉTODO DE GUARDADO EN BD: Registrar nuevo usuario
   * 
   * OPERACIÓN: CREATE (new this.userModel() + save())
   * TABLA: User (MongoDB Collection)
   * 
   * Este método crea un nuevo usuario cuando:
   * - Un usuario se registra en la plataforma
   * - Se valida que el email no exista
   * - Se hashea la contraseña por seguridad
   * 
   * CAMPOS GUARDADOS:
   * - firstName: Nombre del usuario
   * - lastName: Apellido del usuario
   * - email: Email (debe ser único)
   * - role: Rol (TEACHER o STUDENT)
   * - password: Contraseña hasheada
   * - isActive: true (activo por defecto)
   * - createdAt/updatedAt: Timestamps automáticos
   * 
   * @param registerDto Datos de registro del usuario
   * @returns Token JWT y datos del usuario registrado
   */
  async register(
    registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userModel.findOne({
        email: registerDto.email,
      });
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);

      // GUARDADO EN BD: Crear nuevo usuario
      // MÉTODO MONGOOSE: new Model() + save()
      // OPERACIÓN: CREATE en MongoDB
      const newUser = new this.userModel({
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        email: registerDto.email,
        role: registerDto.role,
        password: hashedPassword, // 🔒 Contraseña hasheada con bcrypt
        isActive: true, // Activar automáticamente al registrarse
      });

      // PERSISTENCIA: Guardar usuario en MongoDB
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

  /**
   * Guest login - Genera un token JWT temporal para usuarios no registrados
   * El token tiene una duración corta (1 hora) y permite acceso limitado
   */
  async guestLogin(
    guestLoginDto: GuestLoginRequestDto,
  ): Promise<GuestLoginResponseDto> {
    const { nombre, correo } = guestLoginDto;

    // Generar un ID temporal único para el usuario guest
    // Usamos una combinación de timestamp y hash del nombre/correo para unicidad
    const timestamp = Date.now();
    const uniqueString = `${nombre}_${correo || 'no-email'}_${timestamp}`;
    const guestId = `guest_${Buffer.from(uniqueString).toString('base64').substring(0, 20)}_${timestamp}`;

    // Crear payload JWT para usuario guest
    const payload: JwtPayloadDto = {
      sub: guestId,
      role: Role.STUDENT,
      nombre: nombre,
      correo: correo,
      isGuest: true,
    };

    // Generar token con expiración corta (1 hora)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '1h', // Token de corta duración para guests
    });

    const expiresIn = 3600; // 1 hora en segundos

    return {
      accessToken,
      user: {
        id: guestId,
        nombre: nombre,
        correo: correo,
        role: Role.STUDENT,
        isGuest: true,
      },
      tokenType: 'Bearer',
      expiresIn,
    };
  }
}
