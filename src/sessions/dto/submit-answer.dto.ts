import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SubmitAnswerDTO {
  @ApiProperty({
    description: 'ID of the session',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'ID of the exercise',
    example: '507f1f77bcf86cd799439012',
  })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({
    description: 'ID of the question',
    example: '507f1f77bcf86cd799439013',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Student answer',
    example: 'Paris',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'Time spent on this question in seconds',
    example: 15,
  })
  @IsNumber()
  @Min(0)
  timeSpent: number;

  // Optional: for non-registered students
  @ApiProperty({
    description: 'Student name (for non-registered students)',
    example: 'Juan Pérez',
    required: false,
  })
  nombre?: string;

  @ApiProperty({
    description: 'Student email (for registered students)',
    example: 'juan@example.com',
    required: false,
  })
  correo?: string;
}
