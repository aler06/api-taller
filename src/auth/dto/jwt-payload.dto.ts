import { Role } from '../../users/enum/role.enum';

export interface JwtPayloadDto {
  sub: string; // Usuario ID (para usuarios registrados) o ID temporal (para guests)
  email?: string; // Opcional para usuarios guest
  role: Role;
  firstName?: string; // Opcional para usuarios guest
  lastName?: string; // Opcional para usuarios guest
  nombre?: string; // Para usuarios guest
  correo?: string; // Para usuarios guest
  isGuest?: boolean; // Indica si es un usuario invitado
  iat?: number; // Issued at
  exp?: number; // Expiration time
}
