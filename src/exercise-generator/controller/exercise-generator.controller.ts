import { 
  Controller, 
  Post, 
  Body, 
  HttpException, 
  HttpStatus,
  HttpCode,
  Get,
  Delete,
  Param,
  Query
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiQuery
} from '@nestjs/swagger';
import { ExerciseGeneratorService } from '../service/exercise-generator.service';
import { ExerciseRequestDTO } from '../dto/exercise-request.dto';
import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { ExerciseByIdRequestDTO } from '../dto/exercise-by-id-request.dto';

@ApiTags('Exercise Generator')
@Controller('exercise-generator')
export class ExerciseGeneratorController {
  constructor(
    private readonly exerciseGeneratorService: ExerciseGeneratorService
  ) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ 
    summary: 'Generate interactive educational exercise',
    description: `
      Generates an interactive educational exercise using artificial intelligence (Gemini API).
      
      **Available game types:**
      - **Quiz**: Multiple choice questions with explanations
      - **Hangman**: Words to guess with hints
      - **Fill in the blank**: Sentences with blank spaces to complete
      
      **Features:**
      - AI-generated educational content
      - Adaptable to different difficulty levels
      - Customizable according to target audience
      - Structured responses in JSON format
    `
  })
  @ApiBody({ 
    type: ExerciseRequestDTO,
    description: 'Parameters for educational exercise generation',
    examples: {
      basic_quiz: {
        summary: 'Basic geography quiz',
        description: 'Example of a simple quiz about European geography',
        value: {
          userId: '507f1f77bcf86cd799439011',
          topic: 'European Geography',
          gameType: 'quiz',
          difficulty: 'beginner',
          targetAudience: 'high school students',
          numberOfItems: 5
        }
      },
      intermediate_hangman: {
        summary: 'Programming hangman game',
        description: 'Hangman game with programming terms',
        value: {
          userId: '507f1f77bcf86cd799439012',
          topic: 'Programming Concepts',
          gameType: 'hangman',
          difficulty: 'intermediate',
          targetAudience: 'university students',
          additionalInstructions: 'Focus on fundamental terms like variables, functions, algorithms'
        }
      },
      advanced_fill_blank: {
        summary: 'Fill in the blank - History',
        description: 'Advanced exercise for completing historical sentences',
        value: {
          userId: '507f1f77bcf86cd799439013',
          topic: 'Industrial Revolution',
          gameType: 'fill_in_the_blank',
          difficulty: 'advanced',
          targetAudience: 'university students',
          numberOfItems: 8,
          additionalInstructions: 'Include important dates and key figures'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Exercise generated successfully',
    type: ExerciseResponseDto,
    content: {
      'application/json': {
        examples: {
          quiz_example: {
            summary: 'Quiz Response',
            value: {
              id: 'ex_abc123def',
              game: 'quiz',
              questions: [
                {
                  question: 'What is the capital of France?',
                  options: ['Madrid', 'Paris', 'Rome', 'Berlin'],
                  correct_answer: 'Paris',
                  explanation: 'Paris is the capital and most populous city of France since the 10th century.'
                }
              ],
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z'
            }
          },
          hangman_example: {
            summary: 'Hangman Response',
            value: {
              id: 'ex_xyz789ghi',
              game: 'hangman',
              word: 'programming',
              hint: 'The process of creating instructions for a computer to execute specific tasks',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z'
            }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid request parameters',
    content: {
      'application/json': {
        examples: {
          validation_error: {
            summary: 'Validation Error',
            value: {
              statusCode: 400,
              message: [
                'Topic is required',
                'Game type must be one of: quiz, hangman, fill_in_the_blank'
              ],
              error: 'Bad Request'
            }
          }
        }
      }
    }
  })
  @ApiInternalServerErrorResponse({ 
    description: 'Internal server error during generation',
    content: {
      'application/json': {
        examples: {
          api_error: {
            summary: 'External API Error',
            value: {
              statusCode: 500,
              message: 'Failed to generate exercise: API rate limit exceeded',
              error: 'Internal Server Error'
            }
          },
          parsing_error: {
            summary: 'Parsing Error',
            value: {
              statusCode: 500,
              message: 'Failed to generate exercise: Invalid JSON response from Gemini API',
              error: 'Internal Server Error'
            }
          }
        }
      }
    }
  })
  async generateExercise(
    @Body() request: ExerciseRequestDTO
  ): Promise<ExerciseResponseDto> {
    try {
      return await this.exerciseGeneratorService.generateExercise(request, request.userId);
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error generating exercise: ${error.message}`,
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          details: 'Please verify input parameters and try again. If the problem persists, contact the administrator.'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('my-exercises')
  @ApiOperation({ 
    summary: 'Get user exercises',
    description: 'Retrieve all exercises created by the specified user'
  })
  @ApiQuery({
    name: 'userId',
    description: 'ID of the user to retrieve exercises for',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User exercises retrieved successfully',
    type: [ExerciseResponseDto]
  })
  async getUserExercises(@Query('userId') userId: string): Promise<ExerciseResponseDto[]> {
    try {
      const exercises = await this.exerciseGeneratorService.getUserExercises(userId);
      
      return exercises.map(exercise => ({
        id: exercise._id.toString(),
        game: exercise.game,
        questions: exercise.questions?.map(q => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
        word: exercise.word,
        hint: exercise.hint,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      }));
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error retrieving exercises: ${error.message}`,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('exercise')
  @ApiOperation({ 
    summary: 'Get exercise by ID',
    description: 'Retrieve a specific exercise by its ID'
  })
  @ApiQuery({
    name: 'exerciseId',
    description: 'ID of the exercise to retrieve',
    example: '507f1f77bcf86cd799439014',
    required: true
  })
  @ApiQuery({
    name: 'userId',
    description: 'ID of the user requesting the exercise',
    example: '507f1f77bcf86cd799439011',
    required: true
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Exercise retrieved successfully',
    type: ExerciseResponseDto
  })
  async getExerciseById(
    @Query('exerciseId') exerciseId: string,
    @Query('userId') userId: string
  ): Promise<ExerciseResponseDto> {
    try {
      const exercise = await this.exerciseGeneratorService.getExerciseById(exerciseId, userId);
      
      return {
        id: exercise._id.toString(),
        game: exercise.game,
        questions: exercise.questions?.map(q => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
        word: exercise.word,
        hint: exercise.hint,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      };
    } catch (error) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          message: `Exercise not found: ${error.message}`,
          error: 'Not Found',
        },
        HttpStatus.NOT_FOUND
      );
    }
  }

  @Delete('exercise')
  @HttpCode(204)
  @ApiOperation({ 
    summary: 'Delete exercise',
    description: 'Delete a specific exercise by its ID'
  })
  @ApiBody({ 
    type: ExerciseByIdRequestDTO,
    description: 'Exercise ID and User ID to delete exercise'
  })
  @ApiResponse({ 
    status: 204, 
    description: 'Exercise deleted successfully'
  })
  async deleteExercise(@Body() request: ExerciseByIdRequestDTO): Promise<void> {
    try {
      const deleted = await this.exerciseGeneratorService.deleteExercise(request.exerciseId, request.userId);
      
      if (!deleted) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Exercise not found or access denied',
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error deleting exercise: ${error.message}`,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
