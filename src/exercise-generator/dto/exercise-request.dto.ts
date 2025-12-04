import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MinLength,
  MaxLength,
  IsMongoId,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ApiSchema } from '@nestjs/swagger';
import { Game } from '../enum/game.enum';

@ApiSchema({
  name: 'ExerciseRequestDTO',
  description: 'Exercise generation request DTO',
})
export class ExerciseRequestDTO {
  @ApiProperty({
    description: 'ID of the user creating the exercise',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  @IsMongoId({ message: 'User ID must be a valid MongoDB ObjectId' })
  userId: string;

  @ApiProperty({
    description: 'Topic for the educational session that will be generated',
    example: 'Geografía de Europa',
    minLength: 3,
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty({ message: 'El tema es obligatorio' })
  @MinLength(3, { message: 'El tema debe tener al menos 3 caracteres.' })
  @MaxLength(200, { message: 'Topic must not exceed 200 characters' })
  @Matches(/[A-Za-zÁÉÍÓÚÜÑ0-9]/, {
    message: 'El tema debe contener al menos una letra o número',
  })
  topic: string;

  @ApiProperty({
    description:
      'Type of interactive game to generate for the educational session',
    example: 'quiz',
    enum: Game,
  })
  @IsEnum(Game, {
    message:
      'Game type must be one of: quiz, hangman, fill_in_the_blank, flip_cards, drag_and_drop, true_or_false, roulette, matching',
  })
  @IsNotEmpty({ message: 'Game type is required' })
  gameType: Game;

  @ApiProperty({
    description: 'Difficulty level for the educational content and game',
    example: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'], {
    message: 'Difficulty must be one of: beginner, intermediate, advanced',
  })
  difficulty?: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({
    description: 'Target audience for the educational session',
    example: 'university students',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Target audience must not exceed 100 characters' })
  targetAudience?: string;

  @ApiProperty({
    description:
      'Additional instructions or specific requirements for the session',
    example: 'Focus on European capitals and include historical context',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Additional instructions must not exceed 500 characters',
  })
  additionalInstructions?: string;

  @ApiProperty({
    description:
      'Number of questions/items to generate for the game (for quiz, number of questions; for hangman, number of words)',
    example: 5,
    minimum: 1,
    maximum: 20,
    required: false,
  })
  @IsOptional()
  numberOfItems?: number;
}
