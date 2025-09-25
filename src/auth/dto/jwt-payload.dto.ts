import { Role } from '../../users/enum/role.enum';

export interface JwtPayloadDto {
    sub: string; // Usuario ID
    email: string;
    role: Role;
    firstName: string;
    lastName: string;
    iat?: number; // Issued at
    exp?: number; // Expiration time
}
