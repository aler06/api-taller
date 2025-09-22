import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExerciseRequestDTO } from '../dto/exercise-request.dto';
import { ExerciseResponseDto } from '../dto/exercise-response.dto';
import { Game } from '../enum/game.enum';
import { GeminiResponseMapper } from '../mapper';

@Injectable()
export class ExerciseGeneratorService {
  private readonly logger = new Logger(ExerciseGeneratorService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_KEY is not configured in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateExercise(
    request: ExerciseRequestDTO,
  ): Promise<ExerciseResponseDto> {
    try {
      this.logger.log(
        `Generating ${request.gameType} exercise for topic: ${request.topic}`,
      );

      const prompt = this.buildPrompt(request);
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = response.text();

      this.logger.debug(`Generated response: ${generatedText}`);

      // Parse the JSON response and map to DTOs
      const parsedResponse = GeminiResponseMapper.parseGeminiResponse(generatedText);
      return GeminiResponseMapper.mapToExerciseResponseDto(parsedResponse, request.gameType);
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
      "respuesta_correcta": "París",
      "explicacion": "París es la capital de Francia desde el siglo X."
    }
  ]
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

}