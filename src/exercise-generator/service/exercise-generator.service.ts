import { Injectable, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExerciseRequestDTO } from '../dto/exercise-request.dto';
import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { ExerciseUpdateRequestDTO } from '../dto/exercise-update-request.dto';
import { Game } from '../enum/game.enum';
import { GeminiResponseMapper } from '../mapper';
import { Exercise, ExerciseDocument } from '../model/exercise.model';
import { UsersService } from '../../users/service/users.service';
import { Role } from '../../users/enum/role.enum';

@Injectable()
export class ExerciseGeneratorService {
  private readonly logger = new Logger(ExerciseGeneratorService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
    private readonly usersService: UsersService,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_KEY is not configured in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateExercise(request: ExerciseRequestDTO, userId: string,): Promise<ExerciseResponseDto> {
    try {
      
      this.logger.log(
        `Generating ${request.gameType} exercise for topic: ${request.topic} by user: ${userId}`,
      );

      const prompt = this.buildPrompt(request);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      this.logger.debug(`Generated response: ${generatedText}`);

      // Parse the JSON response and map to DTOs
      const parsedResponse = GeminiResponseMapper.parseGeminiResponse(generatedText);
      const exerciseDto = GeminiResponseMapper.mapToExerciseResponseDto(parsedResponse, request.gameType);
      
      // Save exercise to database
      const exercise = new this.exerciseModel({
        userId,
        game: exerciseDto.game,
        questions: exerciseDto.questions?.map(q => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
        word: exerciseDto.word,
        hint: exerciseDto.hint,
        cards: exerciseDto.cards?.map(c => ({
          front: c.front,
          back: c.back,
        })),
        instructions: exerciseDto.instructions,
        topic: request.topic,
        difficulty: request.difficulty,
        targetAudience: request.targetAudience,
        published: false,
      });

      const savedExercise = await exercise.save();
      
      // Update DTO with database info
      exerciseDto.id = savedExercise._id.toString();
      exerciseDto.createdAt = savedExercise.createdAt;
      exerciseDto.updatedAt = savedExercise.updatedAt;
      exerciseDto.published = savedExercise.published;

      this.logger.log(`Exercise saved with ID: ${exerciseDto.id}`);
      
      return exerciseDto;
    } catch (error) {
      this.logger.error('Error generating exercise:', error);
      
      // Manejo específico de errores de la API de Gemini
      if (error.message.includes('GoogleGenerativeAI Error')) {
        if (error.message.includes('404')) {
          throw new Error('El modelo de IA no está disponible. Verifique la configuración de la API.');
        } else if (error.message.includes('403')) {
          throw new Error('Acceso denegado a la API de Gemini. Verifique su clave de API.');
        } else if (error.message.includes('429')) {
          throw new Error('Límite de solicitudes excedido. Intente de nuevo en unos minutos.');
        }
      }
      
      throw new Error(`Error al generar ejercicio: ${error.message}`);
    }
  }

  private buildPrompt(request: ExerciseRequestDTO): string {  
    const difficultyText = request.difficulty
      ? ` con nivel de dificultad ${request.difficulty}`
      : '';
    const audienceText = request.targetAudience
      ? ` dirigido a ${request.targetAudience}`
      : '';
    const itemsText = request.numberOfItems
      ? ` con ${request.numberOfItems} elementos`
      : '';
    const instructionsText = request.additionalInstructions
      ? ` Instrucciones adicionales: ${request.additionalInstructions}`
      : '';

    let gameInstructions = '';
    switch (request.gameType) {
      case Game.QUIZ:
        gameInstructions = `
Ejemplo de schema para un quiz:
{
  "juego": "quiz",
  "preguntas": [
    {
      "pregunta": "¿Cuál es la capital de Francia?",
      "alternativas": ["Madrid", "París", "Roma", "Berlín"],
      "respuesta_correcta": "París",
      "explicacion": "París es la capital de Francia desde el siglo X."
    }
  ]
}`;
        break;
      case Game.HANGMAN:
        gameInstructions = `
Ejemplo de schema para un ahorcado:
{
  "juego": "ahorcado",
  "palabra": "computadora",
  "pista": "Dispositivo electrónico de uso cotidiano"
}`;
        break;
      case Game.FILL_IN_THE_BLANK:
        gameInstructions = `
Ejemplo de schema para llenar espacios en blanco:
{
  "juego": "fill_in_the_blank",
  "preguntas": [
    {
      "oracion": "La capital de Francia es ____.",
      "alternativas": ["Madrid", "París", "Roma", "Berlín"],
      "respuesta_correcta": "París",
      "explicacion": "París es la capital de Francia desde el siglo X."
    }
  ]
}`;
        break;
      case Game.FLIP_CARDS:
        gameInstructions = `
Ejemplo de schema para tarjetas volteables:
{
  "juego": "flip_cards",
  "tarjetas": [
    {
      "anverso": "¿Qué es Python?",
      "reverso": "Es un lenguaje de programación interpretado, de alto nivel y con tipado dinámico."
    },
    {
      "anverso": "print()",
      "reverso": "Función integrada de Python que se utiliza para mostrar información en pantalla."
    }
  ],
  "instrucciones": "Da la vuelta a cada tarjeta para aprender o repasar conceptos clave."
}`;
        break;
    }

    return `El usuario te pedirá que elabores una sesión educativa sobre un tema específico.
1. Primero, desarrolla la sesión con explicaciones claras, organizadas y fáciles de entender.
2. Después, crea un juego interactivo relacionado con la sesión. Debe ser un ${request.gameType}.
3. La salida del juego debe estar en formato schema estructurado en JSON, de manera que sea fácil de procesar por otro sistema.

${gameInstructions}

Tema: ${request.topic}${difficultyText}${audienceText}${itemsText}${instructionsText}

Responde SOLO con el JSON del juego, sin texto adicional.`;
  }

  async getUserExercises(userId: string): Promise<ExerciseDocument[]> {
    try {
      this.logger.log(`Fetching exercises for user: ${userId}`);
      
      return await this.exerciseModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error('Error fetching user exercises:', error);
      throw new Error(`Failed to fetch exercises: ${error.message}`);
    }
  }

  async getExerciseById(exerciseId: string, userId: string): Promise<ExerciseDocument> {
    try {
      this.logger.log(`Fetching exercise: ${exerciseId} for user: ${userId}`);
      
      const exercise = await this.exerciseModel
        .findOne({ _id: exerciseId, userId })
        .exec();

      if (!exercise) {
        throw new Error('Exercise not found or access denied');
      }

      return exercise;
    } catch (error) {
      this.logger.error('Error fetching exercise:', error);
      throw new Error(`Failed to fetch exercise: ${error.message}`);
    }
  }

  async deleteExercise(exerciseId: string, userId: string): Promise<boolean> {
    try {
      
      this.logger.log(`Deleting exercise: ${exerciseId} for user: ${userId}`);
      
      const result = await this.exerciseModel
        .deleteOne({ _id: exerciseId, userId })
        .exec();

      return result.deletedCount > 0;
    } catch (error) {
      this.logger.error('Error deleting exercise:', error);
      throw new Error(`Failed to delete exercise: ${error.message}`);
    }
  }

  async updateExercise(request: ExerciseUpdateRequestDTO): Promise<ExerciseResponseDto> {
    try {
            
      this.logger.log(`Updating exercise: ${request.exerciseId} by user: ${request.userId}`);
      
      // Find the exercise to ensure it exists and belongs to the user
      const existingExercise = await this.exerciseModel
        .findOne({ _id: request.exerciseId, userId: request.userId })
        .exec();

      if (!existingExercise) {
        throw new NotFoundException('Exercise not found or access denied');
      }

      // Prepare update data
      const updateData: Partial<Exercise> = {};
      
      if (request.questions !== undefined) {
        updateData.questions = request.questions.map(q => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        }));
      }
      
      if (request.word !== undefined) {
        updateData.word = request.word;
      }
      
      if (request.hint !== undefined) {
        updateData.hint = request.hint;
      }
      
      if (request.topic !== undefined) {
        updateData.topic = request.topic;
      }
      
      if (request.difficulty !== undefined) {
        updateData.difficulty = request.difficulty;
      }
      
      if (request.targetAudience !== undefined) {
        updateData.targetAudience = request.targetAudience;
      }

      if (request.cards !== undefined) {
        updateData.cards = request.cards.map(c => ({
          front: c.front,
          back: c.back,
        }));
      }

      if (request.instructions !== undefined) {
        updateData.instructions = request.instructions;
      }

      // Update the exercise
      const updatedExercise = await this.exerciseModel
        .findByIdAndUpdate(request.exerciseId, updateData, { new: true })
        .exec();

      if (!updatedExercise) {
        throw new NotFoundException('Exercise not found');
      }

      // Convert to response DTO
      const responseDto: ExerciseResponseDto = {
        id: updatedExercise._id.toString(),
        game: updatedExercise.game,
        questions: updatedExercise.questions?.map((q) => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
        word: updatedExercise.word,
        hint: updatedExercise.hint,
        cards: updatedExercise.cards?.map((c) => ({
          front: c.front,
          back: c.back,
        })),
        instructions: updatedExercise.instructions,
        published: updatedExercise.published,
        createdAt: updatedExercise.createdAt,
        updatedAt: updatedExercise.updatedAt,
      };

      this.logger.log(`Exercise updated successfully: ${request.exerciseId}`);
      
      return responseDto;
    } catch (error) {
      this.logger.error('Error updating exercise:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to update exercise: ${error.message}`);
    }
  }

  async publishExercise(exerciseId: string): Promise<ExerciseResponseDto> {
    try {
      this.logger.log(`Publishing exercise: ${exerciseId}`);
      
      // Find the exercise to ensure it exists
      const existingExercise = await this.exerciseModel
        .findById(exerciseId)
        .exec();

      if (!existingExercise) {
        throw new NotFoundException('Exercise not found');
      }

      // Update the published status
      const updatedExercise = await this.exerciseModel
        .findByIdAndUpdate(exerciseId, { published: true }, { new: true })
        .exec();

      if (!updatedExercise) {
        throw new NotFoundException('Exercise not found');
      }

      // Convert to response DTO
      const responseDto: ExerciseResponseDto = {
        id: updatedExercise._id.toString(),
        game: updatedExercise.game,
        questions: updatedExercise.questions?.map((q) => ({
          question: q.question,
          sentence: q.sentence,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        })),
        word: updatedExercise.word,
        hint: updatedExercise.hint,
        cards: updatedExercise.cards?.map((c) => ({
          front: c.front,
          back: c.back,
        })),
        instructions: updatedExercise.instructions,
        published: updatedExercise.published,
        createdAt: updatedExercise.createdAt,
        updatedAt: updatedExercise.updatedAt,
      };

      this.logger.log(`Exercise published successfully: ${exerciseId}`);
      
      return responseDto;
    } catch (error) {
      this.logger.error('Error publishing exercise:', error);
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error(`Failed to publish exercise: ${error.message}`);
    }
  }
}