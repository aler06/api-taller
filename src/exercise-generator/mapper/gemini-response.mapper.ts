import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { QuestionResponseDto } from '../dto/question-response.dto';
import { Game } from '../enum/game.enum';

export interface GeminiQuizResponse {
  juego: string;
  preguntas: Array<{
    pregunta: string;
    alternativas: string[];
    respuesta_correcta: string;
    explicacion: string;
  }>;
}

export interface GeminiHangmanResponse {
  juego: string;
  palabra: string;
  pista: string;
}

export interface GeminiFillInTheBlankResponse {
  juego: string;
  preguntas: Array<{
    oracion: string;
    respuesta_correcta: string;
    explicacion: string;
  }>;
}

export type GeminiResponse =
  | GeminiQuizResponse
  | GeminiHangmanResponse
  | GeminiFillInTheBlankResponse;

export class GeminiResponseMapper {
  static mapToExerciseResponseDto(
    geminiResponse: GeminiResponse,
    gameType: Game,
  ): ExerciseResponseDto {
    const exercise: ExerciseResponseDto = {
      id: this.generateTempId(),
      game: gameType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    switch (gameType) {
      case Game.QUIZ:
        return this.mapQuizResponse(exercise, geminiResponse as GeminiQuizResponse);

      case Game.HANGMAN:
        return this.mapHangmanResponse(exercise, geminiResponse as GeminiHangmanResponse);

      case Game.FILL_IN_THE_BLANK:
        return this.mapFillInTheBlankResponse(
          exercise,
          geminiResponse as GeminiFillInTheBlankResponse,
        );

      default:
        throw new Error(`Unsupported game type: ${gameType}`);
    }
  }

  private static mapQuizResponse(
    exercise: ExerciseResponseDto,
    quizResponse: GeminiQuizResponse,
  ): ExerciseResponseDto {
    exercise.questions =
      quizResponse.preguntas?.map((pregunta): QuestionResponseDto => ({
        question: pregunta.pregunta,
        options: pregunta.alternativas,
        correct_answer: pregunta.respuesta_correcta,
        explanation: pregunta.explicacion,
      })) || [];

    return exercise;
  }

  private static mapHangmanResponse(
    exercise: ExerciseResponseDto,
    hangmanResponse: GeminiHangmanResponse,
  ): ExerciseResponseDto {
    exercise.word = hangmanResponse.palabra;
    exercise.hint = hangmanResponse.pista;

    return exercise;
  }

  private static mapFillInTheBlankResponse(
    exercise: ExerciseResponseDto,
    fillBlankResponse: GeminiFillInTheBlankResponse,
  ): ExerciseResponseDto {
    exercise.questions =
      fillBlankResponse.preguntas?.map((pregunta): QuestionResponseDto => ({
        sentence: pregunta.oracion,
        correct_answer: pregunta.respuesta_correcta,
        explanation: pregunta.explicacion,
      })) || [];

    return exercise;
  }

  private static generateTempId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  static parseGeminiResponse(response: string): GeminiResponse {
    try {
      // Clean the response to extract only the JSON part
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Invalid JSON response from Gemini API: ${error.message}`);
    }
  }
}
