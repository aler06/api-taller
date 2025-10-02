import { ApiProperty, ApiSchema } from "@nestjs/swagger";
import { Game } from '../enum/game.enum';
import { QuestionResponseDto } from './question-response.dto';
import { CardResponseDto } from './card-response.dto';
import { ElementResponseDto } from './element-response.dto';
import { TrueFalseResponseDto } from './true-false-response.dto';

@ApiSchema({ name: 'ExerciseResponseDTO', description: 'Exercise response DTO' })
export class ExerciseResponseDto {
    @ApiProperty({
        description: 'Unique identifier of the exercise',
        example: '507f1f77bcf86cd799439011'
    })
    id: string;

    @ApiProperty({
        description: 'Type of game/exercise',
        example: 'quiz',
        enum: Game
    })
    game: Game;

    @ApiProperty({
        description: 'List of questions for the exercise',
        type: [QuestionResponseDto],
        required: false
    })
    questions?: QuestionResponseDto[];

    @ApiProperty({
        description: 'Word to guess (for hangman game)',
        example: 'programming',
        required: false
    })
    word?: string;

    @ApiProperty({
        description: 'Hint for the word or exercise',
        example: 'Related to computer science',
        required: false
    })
    hint?: string;

    @ApiProperty({
        description: 'Date when the exercise was created',
        example: '2024-01-15T10:30:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Date when the exercise was last updated',
        example: '2024-01-15T10:30:00.000Z'
    })
    updatedAt: Date;

    @ApiProperty({
        description: 'Cards for flip cards game',
        type: [CardResponseDto],
        required: false
    })
    cards?: CardResponseDto[];

    @ApiProperty({
        description: 'Instructions for the exercise',
        example: 'Da la vuelta a cada tarjeta para aprender o repasar conceptos clave.',
        required: false
    })
    instructions?: string;

    @ApiProperty({
        description: 'Elements for quick sort/drag and drop game',
        type: [ElementResponseDto],
        required: false
    })
    elements?: ElementResponseDto[];

    @ApiProperty({
        description: 'Correct order of elements (array of element IDs)',
        type: [Number],
        example: [1, 2, 3, 4],
        required: false
    })
    correctOrder?: number[];

    @ApiProperty({
        description: 'Explanation of the correct order or exercise solution',
        example: 'El flujo lógico de un programa en Python comienza importando librerías...',
        required: false
    })
    explanation?: string;

    @ApiProperty({
        description: 'True/False questions for the exercise',
        type: [TrueFalseResponseDto],
        required: false
    })
    trueFalseQuestions?: TrueFalseResponseDto[];

}
