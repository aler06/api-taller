import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiSchema } from '@nestjs/swagger';

@ApiSchema({
  name: 'CreateSessionRequestDTO',
  description: 'Create session request DTO',
})
export class CreateSessionRequestDTO {
  @ApiProperty({
    description: 'ID of the teacher creating the session',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Teacher ID is required' })
  @IsMongoId({ message: 'Teacher ID must be a valid MongoDB ObjectId' })
  teacherId: string;

  @ApiProperty({
    description: 'IDs of the exercises to be used in the session',
    example: ['507f1f77bcf86cd799439012', '507f1f77bcf86cd799439013'],
    type: [String],
    required: true,
    minItems: 1,
    maxItems: 10,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one exercise is required' })
  @ArrayMaxSize(10, { message: 'Maximum 10 exercises allowed per session' })
  @IsMongoId({
    each: true,
    message: 'Each exercise ID must be a valid MongoDB ObjectId',
  })
  exerciseIds: string[];

  @ApiProperty({
    description: 'Name of the session',
    example: 'Geografia de Europa - Sesión 1',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Session name is required' })
  @MinLength(3, { message: 'Session name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Session name must not exceed 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Description of the session',
    example: 'Sesión interactiva sobre la geografía europea',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Session description must not exceed 500 characters',
  })
  description?: string;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    example: 30,
    minimum: 5,
    maximum: 180,
  })
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(5, { message: 'Session duration must be at least 5 minutes' })
  @Max(180, { message: 'Session duration must not exceed 180 minutes' })
  duration: number;

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    example: 30,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max participants must be a number' })
  @Min(1, { message: 'Max participants must be at least 1' })
  @Max(100, { message: 'Max participants must not exceed 100' })
  maxParticipants?: number;

  @ApiProperty({
    description:
      'Whether to allow students to join after the session has started',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowLateJoin?: boolean;

  @ApiProperty({
    description: 'Whether to show leaderboard during and after the session',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  showLeaderboard?: boolean;
}
