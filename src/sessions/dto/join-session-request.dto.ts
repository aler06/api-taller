import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'JoinSessionRequestDTO',
  description: 'Join session request DTO',
})
export class JoinSessionRequestDTO {
  @ApiProperty({
    description: 'ID of the student joining the session',
    example: '507f1f77bcf86cd799439013',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsMongoId({ message: 'Student ID must be a valid MongoDB ObjectId' })
  studentId: string;

  @ApiProperty({
    description: 'Access code for the session',
    example: 'ABC123',
    minLength: 6,
    maxLength: 10,
  })
  @IsString()
  @IsNotEmpty({ message: 'Access code is required' })
  @MinLength(6, { message: 'Access code must be at least 6 characters long' })
  @MaxLength(10, { message: 'Access code must not exceed 10 characters' })
  accessCode: string;
}
