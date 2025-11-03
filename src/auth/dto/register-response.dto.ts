import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
    properties: {
      id: { type: 'string', example: '66c1a2b3d4e5f6g7h8i9j0k1' },
      firstName: { type: 'string', example: 'Juan' },
      lastName: { type: 'string', example: 'Pérez' },
      email: { type: 'string', example: 'juan.perez@ejemplo.com' },
      role: { type: 'string', example: 'student' },
      isActive: { type: 'boolean', example: false },
    },
  })
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
  };

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expiresIn: number;
}
