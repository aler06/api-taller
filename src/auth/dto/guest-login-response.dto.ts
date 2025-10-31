import { ApiProperty } from '@nestjs/swagger';

export class GuestLoginResponseDto {
    @ApiProperty({
        description: 'Token JWT de acceso para el usuario invitado',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Información del usuario invitado',
        type: 'object',
        properties: {
            id: { type: 'string', example: '66c1a2b3d4e5f6g7h8i9j0k1' },
            nombre: { type: 'string', example: 'Juan Pérez' },
            correo: { type: 'string', example: 'juan.perez@ejemplo.com', nullable: true },
            role: { type: 'string', example: 'student' },
            isGuest: { type: 'boolean', example: true },
        },
    })
    user: {
        id: string;
        nombre: string;
        correo?: string;
        role: string;
        isGuest: boolean;
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
