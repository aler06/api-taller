import { 
  Controller, 
  Post, 
  Body, 
  HttpException, 
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse
} from '@nestjs/swagger';
import { ExerciseGeneratorService } from '../service/exercise-generator.service';
import { ExerciseRequestDTO } from '../dto/exercise-request.dto';
import { ExerciseResponseDto } from '../dto/exercise-response.dto';

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
      return await this.exerciseGeneratorService.generateExercise(request);
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
}
