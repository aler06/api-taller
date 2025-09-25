import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../users/enum/role.enum';

export class LoginResponseDto {
    @ApiProperty({
        description: 'Token JWT de acceso',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Información del usuario autenticado',
    })
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: Role;
        isActive: boolean;
    };

    @ApiProperty({
        description: 'Tipo de token',
        example: 'Bearer',
    })
    tokenType: string;

    @ApiProperty({
        description: 'Tiempo de expiración del token en segundos',
        example: 3600,
    })
    expiresIn: number;
}
