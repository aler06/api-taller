import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'defaultSecretKey',
    });
  }

  async validate(payload: JwtPayloadDto): Promise<JwtPayloadDto> {
    // Validar que al menos tenga sub (ID de usuario o guest)
    if (!payload.sub) {
      throw new UnauthorizedException('Token inválido');
    }

    // Para usuarios guest, el email es opcional
    if (!payload.isGuest && !payload.email) {
      throw new UnauthorizedException('Token inválido');
    }

    // Retornar todos los campos del payload para soportar usuarios guest
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      firstName: payload.firstName,
      lastName: payload.lastName,
      nombre: payload.nombre,
      correo: payload.correo,
      isGuest: payload.isGuest,
    };
  }
}
