import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { QuestionResponseDto } from '../dto/question-response.dto';
import { CardResponseDto } from '../dto/card-response.dto';
import { ElementResponseDto } from '../dto/element-response.dto';
import { TrueFalseResponseDto } from '../dto/true-false-response.dto';
import { PhraseResponseDto } from '../dto/phrase-response.dto';
import { PairResponseDto } from '../dto/pair-response.dto';
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
    alternativas: string[];
    respuesta_correcta: string;
    explicacion: string;
  }>;
}

export interface GeminiFlipCardsResponse {
  juego: string;
  tarjetas: Array<{
    anverso: string;
    reverso: string;
  }>;
  instrucciones: string;
}

export interface GeminiDragAndDropResponse {
  juego: string;
  tema: string;
  dificultad: string;
  instrucciones: string;
  elementos: Array<{
    id: number;
    texto: string;
  }>;
  orden_correcto: number[];
  explicacion: string;
}

export interface GeminiTrueFalseResponse {
  juego: string;
  preguntas: Array<{
    afirmacion: string;
    respuesta_correcta: boolean;
    explicacion: string;
  }>;
}

export interface GeminiRouletteResponse {
  juego: string;
  tema: string;
  dificultad: string;
  audiencia: string;
  instrucciones: string;
  frases: string[];
}

export interface GeminiMatchingResponse {
  juego: string;
  tema: string;
  dificultad: string;
  audiencia: string;
  instrucciones: string;
  pares: Array<{
    termino: string;
    coincidencia: string;
  }>;
}

export type GeminiResponse =
  | GeminiQuizResponse
  | GeminiHangmanResponse
  | GeminiFillInTheBlankResponse
  | GeminiFlipCardsResponse
  | GeminiDragAndDropResponse
  | GeminiTrueFalseResponse
  | GeminiRouletteResponse
  | GeminiMatchingResponse;

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
        return this.mapQuizResponse(
          exercise,
          geminiResponse as GeminiQuizResponse,
        );

      case Game.HANGMAN:
        return this.mapHangmanResponse(
          exercise,
          geminiResponse as GeminiHangmanResponse,
        );

      case Game.FILL_IN_THE_BLANK:
        return this.mapFillInTheBlankResponse(
          exercise,
          geminiResponse as GeminiFillInTheBlankResponse,
        );

      case Game.FLIP_CARDS:
        return this.mapFlipCardsResponse(
          exercise,
          geminiResponse as GeminiFlipCardsResponse,
        );

      case Game.DRAG_AND_DROP:
        return this.mapDragAndDropResponse(
          exercise,
          geminiResponse as GeminiDragAndDropResponse,
        );

      case Game.TRUE_OR_FALSE:
        return this.mapTrueFalseResponse(
          exercise,
          geminiResponse as GeminiTrueFalseResponse,
        );

      case Game.ROULETTE:
        return this.mapRouletteResponse(
          exercise,
          geminiResponse as GeminiRouletteResponse,
        );

      case Game.MATCHING:
        return this.mapMatchingResponse(
          exercise,
          geminiResponse as GeminiMatchingResponse,
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
      quizResponse.preguntas?.map(
        (pregunta): QuestionResponseDto => ({
          question: pregunta.pregunta,
          options: pregunta.alternativas,
          correct_answer: pregunta.respuesta_correcta,
          explanation: pregunta.explicacion,
        }),
      ) || [];

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
      fillBlankResponse.preguntas?.map(
        (pregunta): QuestionResponseDto => ({
          sentence: pregunta.oracion,
          options: pregunta.alternativas,
          correct_answer: pregunta.respuesta_correcta,
          explanation: pregunta.explicacion,
        }),
      ) || [];

    return exercise;
  }

  private static mapFlipCardsResponse(
    exercise: ExerciseResponseDto,
    flipCardsResponse: GeminiFlipCardsResponse,
  ): ExerciseResponseDto {
    exercise.cards =
      flipCardsResponse.tarjetas?.map(
        (tarjeta): CardResponseDto => ({
          front: tarjeta.anverso,
          back: tarjeta.reverso,
        }),
      ) || [];

    exercise.instructions = flipCardsResponse.instrucciones;

    return exercise;
  }

  private static mapDragAndDropResponse(
    exercise: ExerciseResponseDto,
    dragAndDropResponse: GeminiDragAndDropResponse,
  ): ExerciseResponseDto {
    exercise.elements =
      dragAndDropResponse.elementos?.map(
        (elemento): ElementResponseDto => ({
          id: elemento.id,
          texto: elemento.texto,
        }),
      ) || [];

    exercise.correctOrder = dragAndDropResponse.orden_correcto;
    exercise.instructions = dragAndDropResponse.instrucciones;
    exercise.explanation = dragAndDropResponse.explicacion;

    return exercise;
  }

  private static mapTrueFalseResponse(
    exercise: ExerciseResponseDto,
    trueFalseResponse: GeminiTrueFalseResponse,
  ): ExerciseResponseDto {
    exercise.trueFalseQuestions =
      trueFalseResponse.preguntas?.map(
        (pregunta): TrueFalseResponseDto => ({
          statement: pregunta.afirmacion,
          correct_answer: pregunta.respuesta_correcta,
          explanation: pregunta.explicacion,
        }),
      ) || [];

    return exercise;
  }

  private static mapRouletteResponse(
    exercise: ExerciseResponseDto,
    rouletteResponse: GeminiRouletteResponse,
  ): ExerciseResponseDto {
    exercise.phrases =
      rouletteResponse.frases?.map(
        (frase): PhraseResponseDto => ({
          text: frase,
        }),
      ) || [];

    exercise.instructions = rouletteResponse.instrucciones;

    return exercise;
  }

  private static mapMatchingResponse(
    exercise: ExerciseResponseDto,
    matchingResponse: GeminiMatchingResponse,
  ): ExerciseResponseDto {
    exercise.pairs =
      matchingResponse.pares?.map(
        (par): PairResponseDto => ({
          term: par.termino,
          match: par.coincidencia,
        }),
      ) || [];

    exercise.instructions = matchingResponse.instrucciones;

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
      // Log raw response to help debug invalid JSON from Gemini
      // (Solo para diagnóstico; en producción considerar bajar el nivel de detalle)
      // eslint-disable-next-line no-console
      console.error('Gemini raw response that failed to parse:', response);

      throw new Error(
        `Invalid JSON response from Gemini API: ${error.message}`,
      );
    }
  }
}
