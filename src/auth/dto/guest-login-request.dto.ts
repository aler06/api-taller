import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class GuestLoginRequestDto {
    @ApiProperty({
        description: 'Nombre del usuario invitado',
        example: 'Juan Pérez',
        minLength: 2,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    nombre: string;

    @ApiPropertyOptional({
        description: 'Correo electrónico del usuario invitado (opcional)',
        example: 'juan.perez@ejemplo.com',
    })
    @IsEmail({}, { message: 'El correo debe ser válido' })
    @IsOptional()
    correo?: string;
}
