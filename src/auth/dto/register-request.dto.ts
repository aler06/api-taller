import { IsString, IsNotEmpty, IsEmail, IsEnum, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../users/enum/role.enum';

export class RegisterRequestDto {
    @ApiProperty({
        description: 'First name of the user',
        example: 'John',
        minLength: 3
    })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MinLength(3, { message: 'First name must be at least 3 characters long' })
    firstName: string;

    @ApiProperty({
        description: 'Last name of the user',
        example: 'Doe',
        minLength: 3
    })
    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MinLength(3, { message: 'Last name must be at least 3 characters long' })
    lastName: string;

    @ApiProperty({
        description: 'Email address of the user. Must be from @gmail.com or @upao.edu.pe domain',
        example: 'john.doe@gmail.com',
        pattern: '^[a-zA-Z0-9._%+-]+@(gmail\\.com|upao\\.edu\\.pe)$'
    })
    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    @MinLength(3, { message: 'Email must be at least 3 characters long' })
    @IsEmail({}, { message: 'Invalid email' })
    @Matches(/^[a-zA-Z0-9._%+-]+@(gmail\.com|upao\.edu\.pe)$/, { 
        message: 'Email must be from @gmail.com or @upao.edu.pe domain' 
    })
    email: string;

    @ApiProperty({
        description: 'Role of the user (only teacher or student allowed for registration)',
        example: 'student',
        enum: [Role.TEACHER, Role.STUDENT]
    })
    @IsEnum([Role.TEACHER, Role.STUDENT], { 
        message: 'Role must be either teacher or student' 
    })
    @IsNotEmpty({ message: 'Role is required' })
    role: Role.TEACHER | Role.STUDENT;

    @ApiProperty({
        description: 'Password for the user account',
        example: 'SecurePassword123',
        minLength: 8
    })
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}

