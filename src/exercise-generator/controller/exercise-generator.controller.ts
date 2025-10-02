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
  Query,
  Put,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiQuery,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ExerciseGeneratorService } from '../service/exercise-generator.service';
import { ExerciseRequestDTO } from '../dto/exercise-request.dto';
import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { ExerciseByIdRequestDTO } from '../dto/exercise-by-id-request.dto';
import { ExerciseUpdateRequestDTO } from '../dto/exercise-update-request.dto';

@ApiTags('Exercise Generator')
@Controller('exercise-generator')
export class ExerciseGeneratorController {
  constructor(
    private readonly exerciseGeneratorService: ExerciseGeneratorService,
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
      - **Fill in the blank**: Sentences with blank spaces to complete using multiple choice options
      - **Flip cards**: Cards with front and back sides to flip and learn
      - **Drag and drop**: Elements to drag and drop in the correct order
        - **True or false**: True or false questions with explanations
        - **Roulette**: Interactive roulette with educational phrases
        - **Matching**: Match terms with their corresponding definitions
      
      **Features:**
      - AI-generated educational content
      - Adaptable to different difficulty levels
      - Customizable according to target audience
      - Structured responses in JSON format
    `,
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
          numberOfItems: 3,
        },
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
        },
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
          numberOfItems: 3,
        },
      },
      flip_cards_programming: {
        summary: 'Flip cards - Programming concepts',
        description: 'Interactive flip cards for learning programming concepts',
        value: {
          userId: '507f1f77bcf86cd799439014',
          topic: 'Python Programming Basics',
          gameType: 'flip_cards',
          difficulty: 'beginner',
          targetAudience: 'programming students',
          numberOfItems: 3,
        },
      },
      drag_and_drop_programming: {
        summary: 'Drag and drop - Programming flow',
        description: 'Drag and drop exercise for learning programming flow',
        value: {
          userId: '507f1f77bcf86cd799439015',
          topic: 'Python - Flujo de un programa',
          gameType: 'drag_and_drop',
          difficulty: 'beginner',
          targetAudience: 'programming students',
          numberOfItems: 4,
        },
      },
      true_or_false_programming: {
        summary: 'True or False - Programming concepts',
        description: 'True or False exercise for programming knowledge',
        value: {
          userId: '507f1f77bcf86cd799439016',
          topic: 'Python Programming Fundamentals',
          gameType: 'true_or_false',
          difficulty: 'intermediate',
          targetAudience: 'programming students',
          numberOfItems: 5,
        },
      },
      roulette_programming: {
        summary: 'Roulette - Programming concepts',
        description: 'Interactive roulette game for learning programming concepts',
        value: {
          userId: '507f1f77bcf86cd799439017',
          topic: 'Programming Fundamentals',
          gameType: 'roulette',
          difficulty: 'intermediate',
          targetAudience: 'university students',
          numberOfItems: 4,
        },
      },
      matching_programming: {
        summary: 'Matching - Programming concepts',
        description: 'Matching game for learning programming terms and definitions',
        value: {
          userId: '507f1f77bcf86cd799439018',
          topic: 'Programming Fundamentals',
          gameType: 'matching',
          difficulty: 'intermediate',
          targetAudience: 'university students',
          numberOfItems: 3,
        },
      },
    },
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
                  explanation:
                    'Paris is the capital and most populous city of France since the 10th century.',
                },
              ],
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          hangman_example: {
            summary: 'Hangman Response',
            value: {
              id: 'ex_xyz789ghi',
              game: 'hangman',
              word: 'programming',
              hint: 'The process of creating instructions for a computer to execute specific tasks',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          fill_in_the_blank_example: {
            summary: 'Fill in the Blank Response',
            value: {
              id: 'ex_fill123blank',
              game: 'fill_in_the_blank',
              questions: [
                {
                  sentence: 'The capital of France is ____.',
                  options: ['Madrid', 'Paris', 'Rome', 'Berlin'],
                  correct_answer: 'Paris',
                  explanation: 'Paris is the capital and most populous city of France since the 10th century.',
                },
              ],
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          flip_cards_example: {
            summary: 'Flip Cards Response',
            value: {
              id: 'ex_flip456cards',
              game: 'flip_cards',
              cards: [
                {
                  front: '¿Qué es Python?',
                  back: 'Es un lenguaje de programación interpretado, de alto nivel y con tipado dinámico.',
                },
                {
                  front: 'print()',
                  back: 'Función integrada de Python que se utiliza para mostrar información en pantalla.',
                },
              ],
              instructions: 'Da la vuelta a cada tarjeta para aprender o repasar conceptos clave de Python.',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          drag_and_drop_example: {
            summary: 'Drag and Drop Response',
            value: {
              id: 'ex_drag789drop',
              game: 'drag_and_drop',
              elements: [
                {
                  id: 1,
                  texto: 'Importar librerías necesarias',
                },
                {
                  id: 2,
                  texto: 'Definir variables',
                },
                {
                  id: 3,
                  texto: 'Escribir funciones',
                },
                {
                  id: 4,
                  texto: 'Ejecutar el programa',
                },
              ],
              correctOrder: [1, 2, 3, 4],
              instructions: 'Arrastra y suelta cada paso en el orden correcto para escribir y ejecutar un programa en Python.',
              explanation: 'El flujo lógico de un programa en Python comienza importando librerías, luego se definen variables, después se escriben las funciones y finalmente se ejecuta el programa.',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          true_or_false_example: {
            summary: 'True or False Response',
            value: {
              id: 'ex_tf123false',
              game: 'true_or_false',
              trueFalseQuestions: [
                {
                  statement: 'Python is a compiled programming language',
                  correct_answer: false,
                  explanation: 'Python is actually an interpreted programming language, not compiled. The code is executed line by line through an interpreter.',
                },
                {
                  statement: 'Variables in Python must be declared with a specific type',
                  correct_answer: false,
                  explanation: 'Python is dynamically typed, variables do not need explicit type declaration.',
                },
              ],
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          roulette_example: {
            summary: 'Roulette Response',
            value: {
              id: 'ex_roulette456',
              game: 'roulette',
              phrases: [
                {
                  text: 'Python es un lenguaje de tipado dinámico.',
                },
                {
                  text: 'La programación orientada a objetos se basa en clases y objetos.',
                },
                {
                  text: 'Java no permite herencia múltiple de clases, pero sí de interfaces.',
                },
                {
                  text: 'Las estructuras de control como bucles permiten ejecutar código repetidamente.',
                },
              ],
              instructions: 'Gira la ruleta y responde la pregunta que te toque. Cada pregunta está relacionada con conceptos básicos de programación.',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
          matching_example: {
            summary: 'Matching Response',
            value: {
              id: 'ex_matching789',
              game: 'matching',
              pairs: [
                {
                  term: 'Variable',
                  match: 'Espacio en memoria que almacena un valor',
                },
                {
                  term: 'Función',
                  match: 'Bloque de código reutilizable que realiza una tarea',
                },
                {
                  term: 'Clase',
                  match: 'Plantilla para crear objetos en programación orientada a objetos',
                },
              ],
              instructions: 'Empareja cada concepto con su definición correcta.',
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          },
        },
      },
    },
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
                'Game type must be one of: quiz, hangman, fill_in_the_blank',
              ],
              error: 'Bad Request',
            },
          },
        },
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Access denied - Only teachers can create exercises',
    content: {
      'application/json': {
        examples: {
          role_error: {
            summary: 'Role Access Error',
            value: {
              statusCode: 403,
              message: 'Only teachers can perform this action',
              error: 'Forbidden',
            },
          },
        },
      },
    },
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
              error: 'Internal Server Error',
            },
          },
          parsing_error: {
            summary: 'Parsing Error',
            value: {
              statusCode: 500,
              message:
                'Failed to generate exercise: Invalid JSON response from Gemini API',
              error: 'Internal Server Error',
            },
          },
        },
      },
    },
  })
  async generateExercise(@Body() request: ExerciseRequestDTO,): Promise<ExerciseResponseDto> {
    try {
      return await this.exerciseGeneratorService.generateExercise(request, request.userId,);
    } catch (error) {
      if (error.message === 'Only teachers can perform this action' || error.name === 'ForbiddenException') {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Only teachers can create exercises',
            error: 'Forbidden',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.FORBIDDEN,
        );
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error generating exercise: ${error.message}`,
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
          details:
            'Please verify input parameters and try again. If the problem persists, contact the administrator.',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-exercises')
  @ApiOperation({
    summary: 'Get user exercises',
    description: 'Retrieve all exercises created by the specified user',
  })
  @ApiQuery({
    name: 'userId',
    description: 'ID of the user to retrieve exercises for',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'User exercises retrieved successfully',
    type: [ExerciseResponseDto],
  })
  async getUserExercises(@Query('userId') userId: string,): Promise<ExerciseResponseDto[]> {
    try {
      const exercises =
        await this.exerciseGeneratorService.getUserExercises(userId);

      return exercises.map((exercise) => ({
        id: exercise._id.toString(),
        game: exercise.game,
        questions: exercise.questions?.map((q) => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
        word: exercise.word,
        hint: exercise.hint,
        cards: exercise.cards?.map((c) => ({
          front: c.front,
          back: c.back,
        })),
        instructions: exercise.instructions,
        elements: exercise.elements?.map((e) => ({
          id: e.id,
          texto: e.texto,
        })),
        correctOrder: exercise.correctOrder,
        explanation: exercise.explanation,
        trueFalseQuestions: exercise.trueFalseQuestions?.map((tf) => ({
          statement: tf.statement,
          correct_answer: tf.correct_answer,
          explanation: tf.explanation,
        })),
        phrases: exercise.phrases?.map((p) => ({
          text: p.text,
        })),
        pairs: exercise.pairs?.map((p) => ({
          term: p.term,
          match: p.match,
        })),
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
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('exercise')
  @ApiOperation({
    summary: 'Get exercise by ID',
    description: 'Retrieve a specific exercise by its ID',
  })
  @ApiQuery({
    name: 'exerciseId',
    description: 'ID of the exercise to retrieve',
    example: '507f1f77bcf86cd799439014',
    required: true,
  })
  @ApiQuery({
    name: 'userId',
    description: 'ID of the user requesting the exercise',
    example: '507f1f77bcf86cd799439011',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Exercise retrieved successfully',
    type: ExerciseResponseDto,
  })
  async getExerciseById(@Query('exerciseId') exerciseId: string, @Query('userId') userId: string,): Promise<ExerciseResponseDto> {
    try {
      const exercise = await this.exerciseGeneratorService.getExerciseById(
        exerciseId,
        userId,
      );

      return {
        id: exercise._id.toString(),
        game: exercise.game,
        questions: exercise.questions?.map((q) => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
        word: exercise.word,
        hint: exercise.hint,
        cards: exercise.cards?.map((c) => ({
          front: c.front,
          back: c.back,
        })),
        instructions: exercise.instructions,
        elements: exercise.elements?.map((e) => ({
          id: e.id,
          texto: e.texto,
        })),
        correctOrder: exercise.correctOrder,
        explanation: exercise.explanation,
        trueFalseQuestions: exercise.trueFalseQuestions?.map((tf) => ({
          statement: tf.statement,
          correct_answer: tf.correct_answer,
          explanation: tf.explanation,
        })),
        phrases: exercise.phrases?.map((p) => ({
          text: p.text,
        })),
        pairs: exercise.pairs?.map((p) => ({
          term: p.term,
          match: p.match,
        })),
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
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Delete('exercise')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete exercise',
    description: 'Delete a specific exercise by its ID (Teachers only)',
  })
  @ApiBody({
    type: ExerciseByIdRequestDTO,
    description: 'Exercise ID and User ID to delete exercise',
  })
  @ApiResponse({
    status: 204,
    description: 'Exercise deleted successfully',
  })
  @ApiForbiddenResponse({
    description: 'Access denied - Only teachers can delete exercises',
  })
  async deleteExercise(@Body() request: ExerciseByIdRequestDTO): Promise<void> {
    try {
      const deleted = await this.exerciseGeneratorService.deleteExercise(
        request.exerciseId,
        request.userId,
      );

      if (!deleted) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Exercise not found or access denied',
            error: 'Not Found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (error) {
      if (error.message === 'Only teachers can perform this action' || error.name === 'ForbiddenException') {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Only teachers can delete exercises',
            error: 'Forbidden',
          },
          HttpStatus.FORBIDDEN,
        );
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error deleting exercise: ${error.message}`,
          error: 'Internal Server Error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('exercise')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Update exercise',
    description: 'Update an AI-generated exercise (Teachers only)',
  })
  @ApiBody({
    type: ExerciseUpdateRequestDTO,
    description: 'Exercise update data',
    examples: {
      quiz_update: {
        summary: 'Update Quiz Exercise',
        description: 'Example of updating a quiz exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439014',
          userId: '507f1f77bcf86cd799439011',
          questions: [
            {
              question: 'What is the updated capital of France?',
              options: ['Madrid', 'Paris', 'Rome', 'Berlin'],
              correct_answer: 'Paris',
              explanation: 'Paris has been the capital of France since the 10th century.'
            }
          ],
          topic: 'Updated European Geography',
          difficulty: 'intermediate'
        },
      },
      hangman_update: {
        summary: 'Update Hangman Exercise',
        description: 'Example of updating a hangman exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439015',
          userId: '507f1f77bcf86cd799439011',
          word: 'algorithm',
          hint: 'A step-by-step procedure for solving a problem',
          topic: 'Computer Science Fundamentals'
        },
      },
      fill_blank_update: {
        summary: 'Update Fill-in-the-Blank Exercise',
        description: 'Example of updating a fill-in-the-blank exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439016',
          userId: '507f1f77bcf86cd799439011',
          questions: [
            {
              sentence: 'The capital of France is ____.',
              options: ['Madrid', 'Paris', 'Rome', 'Berlin'],
              correct_answer: 'Paris',
              explanation: 'Paris is the capital and most populous city of France since the 10th century.'
            },
            {
              sentence: 'The Industrial Revolution began in ____.',
              options: ['France', 'Germany', 'England', 'Spain'],
              correct_answer: 'England',
              explanation: 'The Industrial Revolution started in England in the late 18th century.'
            }
          ],
          topic: 'Updated European History',
          difficulty: 'intermediate'
        },
      },
      flip_cards_update: {
        summary: 'Update Flip Cards Exercise',
        description: 'Example of updating a flip cards exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439017',
          userId: '507f1f77bcf86cd799439011',
          cards: [
            {
              front: '¿Qué es Python? (ACTUALIZADA)',
              back: 'Es un lenguaje de programación interpretado, de alto nivel y con tipado dinámico que se caracteriza por su sintaxis clara y legible.'
            },
            {
              front: 'print()',
              back: 'Función integrada de Python que se utiliza para mostrar información en pantalla.'
            },
            {
              front: 'Variables en Python (NUEVA TARJETA)',
              back: 'Contenedores que almacenan valores de datos y pueden cambiar durante la ejecución del programa.'
            }
          ],
          instructions: 'Da la vuelta a cada tarjeta para aprender conceptos fundamentales de Python. (INSTRUCCIONES ACTUALIZADAS)',
          topic: 'Python Programming - Conceptos Básicos Actualizados'
        },
      },
      drag_and_drop_update: {
        summary: 'Update Drag and Drop Exercise',
        description: 'Example of updating a drag and drop exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439018',
          userId: '507f1f77bcf86cd799439011',
          elements: [
            {
              id: 1,
              texto: 'Instalar Python y configurar el entorno'
            },
            {
              id: 2,
              texto: 'Importar librerías necesarias'
            },
            {
              id: 3,
              texto: 'Definir variables y constantes'
            },
            {
              id: 4,
              texto: 'Escribir funciones principales'
            },
            {
              id: 5,
              texto: 'Implementar lógica de negocio'
            },
            {
              id: 6,
              texto: 'Ejecutar y probar el programa'
            }
          ],
          correctOrder: [1, 2, 3, 4, 5, 6],
          instructions: 'Arrastra y suelta cada paso en el orden correcto para desarrollar un programa completo en Python. (INSTRUCCIONES ACTUALIZADAS)',
          explanation: 'El flujo completo de desarrollo en Python incluye la configuración del entorno, importación de librerías, definición de variables, escritura de funciones, implementación de la lógica y finalmente la ejecución y pruebas del programa.',
          topic: 'Python - Ciclo Completo de Desarrollo de Software'
        },
      },
      true_or_false_update: {
        summary: 'Update True or False Exercise',
        description: 'Example of updating a true or false exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439019',
          userId: '507f1f77bcf86cd799439011',
          trueFalseQuestions: [
            {
              statement: 'Python es un lenguaje de programación compilado (ACTUALIZADA)',
              correct_answer: false,
              explanation: 'Python es un lenguaje interpretado, no compilado. El código se ejecuta línea por línea a través de un intérprete. (EXPLICACIÓN ACTUALIZADA)'
            },
            {
              statement: 'Las variables en Python deben declararse con un tipo específico',
              correct_answer: false,
              explanation: 'Python es un lenguaje de tipado dinámico, las variables no necesitan declaración de tipo explícita.'
            },
            {
              statement: 'Python soporta programación orientada a objetos (NUEVA PREGUNTA)',
              correct_answer: true,
              explanation: 'Python es un lenguaje multiparadigma que soporta programación orientada a objetos, funcional y procedural.'
            }
          ],
          topic: 'Python Programming - Conceptos Fundamentales Actualizados'
        },
      },
      roulette_update: {
        summary: 'Update Roulette Exercise',
        description: 'Example of updating a roulette exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439020',
          userId: '507f1f77bcf86cd799439011',
          phrases: [
            {
              text: 'Python es un lenguaje de tipado dinámico y interpretado (ACTUALIZADA).'
            },
            {
              text: 'La programación orientada a objetos se basa en clases y objetos.'
            },
            {
              text: 'Java no permite herencia múltiple de clases, pero sí de interfaces.'
            },
            {
              text: 'Las funciones en Python pueden retornar múltiples valores (NUEVA FRASE).'
            }
          ],
          instructions: 'Gira la ruleta y responde las preguntas sobre conceptos fundamentales de programación. (INSTRUCCIONES ACTUALIZADAS)',
          topic: 'Programming Fundamentals - Conceptos Actualizados'
        },
      },
      matching_update: {
        summary: 'Update Matching Exercise',
        description: 'Example of updating a matching exercise',
        value: {
          exerciseId: '507f1f77bcf86cd799439021',
          userId: '507f1f77bcf86cd799439011',
          pairs: [
            {
              term: 'Variable (ACTUALIZADA)',
              match: 'Espacio en memoria que almacena un valor y puede cambiar durante la ejecución'
            },
            {
              term: 'Función',
              match: 'Bloque de código reutilizable que realiza una tarea específica'
            },
            {
              term: 'Algoritmo (NUEVO TÉRMINO)',
              match: 'Secuencia de pasos lógicos para resolver un problema'
            }
          ],
          instructions: 'Empareja cada concepto de programación con su definición correcta. (INSTRUCCIONES ACTUALIZADAS)',
          topic: 'Programming Fundamentals - Conceptos y Definiciones Actualizados'
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Exercise updated successfully',
    type: ExerciseResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Access denied - Only teachers can update exercises',
    content: {
      'application/json': {
        examples: {
          role_error: {
            summary: 'Role Access Error',
            value: {
              statusCode: 403,
              message: 'Only teachers can perform this action',
              error: 'Forbidden',
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request parameters',
  })
  async updateExercise(@Body() request: ExerciseUpdateRequestDTO): Promise<ExerciseResponseDto> {
    try {
      return await this.exerciseGeneratorService.updateExercise(request);
    } catch (error) {
      if (error.message === 'Only teachers can perform this action' || error.name === 'ForbiddenException') {
        throw new HttpException(
          {
            statusCode: HttpStatus.FORBIDDEN,
            message: 'Only teachers can update exercises',
            error: 'Forbidden',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.FORBIDDEN,
        );
      }
      
      if (error.message === 'Exercise not found or access denied' || error.name === 'NotFoundException') {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Exercise not found or access denied',
            error: 'Not Found',
            timestamp: new Date().toISOString(),
          },
          HttpStatus.NOT_FOUND,
        );
      }
      
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: `Error updating exercise: ${error.message}`,
          error: 'Internal Server Error',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


}
