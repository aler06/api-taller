import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Game } from '../enum/game.enum';

export class QuestionUpdateDto {
  @ApiProperty({
    description: 'The question text (for quiz)',
    example: 'What is the capital of France?',
    required: false
  })
  @IsOptional()
  @IsString()
  question?: string;

  @ApiProperty({
    description: 'Sentence with blank to fill (for fill_in_the_blank)',
    example: 'The capital of France is ____.',
    required: false
  })
  @IsOptional()
  @IsString()
  sentence?: string;

  @ApiProperty({
    description: 'Multiple choice options',
    example: ['Paris', 'London', 'Madrid', 'Berlin'],
    type: [String],
    required: false
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @ApiProperty({
    description: 'The correct answer',
    example: 'Paris'
  })
  @IsString()
  @IsNotEmpty()
  correct_answer: string;

  @ApiProperty({
    description: 'Explanation for the correct answer',
    example: 'Paris is the capital and largest city of France.'
  })
  @IsString()
  @IsNotEmpty()
  explanation: string;
}

export class CardUpdateDto {
  @ApiProperty({
    description: 'Front text of the card',
    example: '¿Qué es Python?'
  })
  @IsString()
  @IsNotEmpty()
  front: string;

  @ApiProperty({
    description: 'Back text of the card (answer/explanation)',
    example: 'Es un lenguaje de programación interpretado, de alto nivel y con tipado dinámico.'
  })
  @IsString()
  @IsNotEmpty()
  back: string;
}

export class ExerciseUpdateRequestDTO {
  @ApiProperty({
    description: 'ID of the exercise to update',
    example: '507f1f77bcf86cd799439014',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'Exercise ID is required' })
  @IsMongoId({ message: 'Exercise ID must be a valid MongoDB ObjectId' })
  exerciseId: string;

  @ApiProperty({
    description: 'ID of the user (professor) updating the exercise',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsMongoId({ message: 'User ID must be a valid MongoDB ObjectId' })
  userId: string;

  @ApiProperty({
    description: 'Updated questions for the exercise',
    type: [QuestionUpdateDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionUpdateDto)
  questions?: QuestionUpdateDto[];

  @ApiProperty({
    description: 'Updated word (for hangman game)',
    example: 'programming',
    required: false
  })
  @IsOptional()
  @IsString()
  word?: string;

  @ApiProperty({
    description: 'Updated hint for the word or exercise',
    example: 'Related to computer science',
    required: false
  })
  @IsOptional()
  @IsString()
  hint?: string;

  @ApiProperty({
    description: 'Updated topic for the exercise',
    example: 'Advanced Programming Concepts',
    required: false
  })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiProperty({
    description: 'Updated difficulty level',
    example: 'advanced',
    enum: ['beginner', 'intermediate', 'advanced'],
    required: false
  })
  @IsOptional()
  @IsString()
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({
    description: 'Updated target audience',
    example: 'university students',
    required: false
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiProperty({
    description: 'Updated cards for flip cards game',
    type: [CardUpdateDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardUpdateDto)
  cards?: CardUpdateDto[];

  @ApiProperty({
    description: 'Updated instructions for the exercise',
    example: 'Da la vuelta a cada tarjeta para aprender o repasar conceptos clave.',
    required: false
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}
