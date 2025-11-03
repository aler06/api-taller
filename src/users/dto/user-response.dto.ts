import { Role } from '../enum/role.enum';
import { ApiProperty, ApiSchema } from '@nestjs/swagger';

@ApiSchema({ name: 'UserResponseDTO', description: 'User response DTO' })
export class UserResponseDTO {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '507f1f77bcf86cd799439011',
  })
  _id: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    example: 'student',
    enum: Role,
  })
  role: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
