import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDTO {
  @ApiProperty({
    description: 'ID of the exercise',
    example: '68e7b78b80da60122813bdf7',
  })
  @IsString()
  @IsNotEmpty()
  exerciseId: string;

  @ApiProperty({
    description: 'ID of the question',
    example: '68e7b78980da60122813bdf3',
  })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({
    description: 'Student answer',
    example: 'Selenium',
  })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'Whether the answer is correct',
    example: true,
  })
  @IsBoolean()
  isCorrect: boolean;

  @ApiProperty({
    description: 'Time spent on this question in seconds',
    example: 15,
  })
  @IsNumber()
  timeSpent: number;
}

export class CompleteSessionDTO {
  @ApiProperty({
    description: 'ID of the session',
    example: '507f1f77bcf86cd799439011',
  })
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @ApiProperty({
    description: 'Student name',
    example: 'Juan Pérez',
  })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    description: 'Student email',
    example: 'juan@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @ApiProperty({
    description: 'Final score (0-20)',
    example: 13.33,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  puntajeFinal?: number;

  @ApiProperty({
    description: 'Total time spent in seconds',
    example: 45,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  tiempoTotal?: number;

  @ApiProperty({
    description: 'Array of all answers submitted during the session',
    type: [AnswerDTO],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDTO)
  respuestas?: AnswerDTO[];
}
