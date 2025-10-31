import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { SessionScoreService } from '../service/session-score.service';
import { SubmitAnswerDTO } from '../dto/submit-answer.dto';
import { CompleteSessionDTO } from '../dto/complete-session.dto';
import { SessionScoreResponseDTO, SessionScoreSummaryDTO } from '../dto/session-score-response.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import { Role } from '../../users/enum/role.enum';

@ApiTags('session-scores')
@Controller('session-scores')
export class SessionScoreController {
  constructor(private readonly sessionScoreService: SessionScoreService) {}

  @Post('initialize')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initialize score record for a student',
    description: 'Create or retrieve a score record for a student joining a session',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Score record initialized successfully',
    type: SessionScoreResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async initializeScore(
    @Body() body: { sessionId: string; nombre?: string; correo?: string },
    @CurrentUser() user: any,
  ): Promise<SessionScoreResponseDTO> {
    // Para usuarios guest, usar el nombre y correo del token si no se proporcionan
    const nombre = body.nombre || user.nombre;
    const correo = body.correo || user.correo || user.email;
    
    // Para usuarios guest, no pasar el userId (sub) ya que es temporal
    const userId = user.isGuest ? undefined : user.sub;
    
    // 🔴 VALIDACIÓN: Usuarios guest DEBEN tener correo
    if (!userId && !correo) {
      throw new BadRequestException(
        'Email is required for guest users. Please provide "correo" or use POST /auth/guest with email.'
      );
    }
    
    return this.sessionScoreService.initializeScore(
      body.sessionId,
      userId,
      nombre,
      correo,
    );
  }

  @Post('submit-answer')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit an answer',
    description: 'Submit an answer to a question and update the score',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Answer submitted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session or exercise not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid answer or exercise type not scored',
  })
  async submitAnswer(
    @Body() submitAnswerDto: SubmitAnswerDTO,
    @CurrentUser() user: any,
  ): Promise<{
    scoreRecord: SessionScoreResponseDTO;
    isCorrect: boolean;
    points: number;
    correctAnswer?: string;
    explanation?: string;
  }> {
    // Para usuarios guest, usar datos del token si no se proporcionan
    if (!submitAnswerDto.nombre && user.nombre) {
      submitAnswerDto.nombre = user.nombre;
    }
    if (!submitAnswerDto.correo) {
      submitAnswerDto.correo = user.correo || user.email;
    }
    
    // Para usuarios guest, no pasar el userId (sub) ya que es temporal
    const userId = user.isGuest ? undefined : user.sub;
    
    // 🔴 VALIDACIÓN CRÍTICA: Usuarios guest DEBEN tener correo para rastrear puntaje
    if (!userId && !submitAnswerDto.correo) {
      throw new BadRequestException(
        'Email is required for guest users to track scores across multiple answers. ' +
        'Please provide "correo" in the request body or use POST /auth/guest to obtain a token with email.'
      );
    }
    
    return this.sessionScoreService.submitAnswer(submitAnswerDto, userId);
  }

  @Post('complete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete session and submit all results',
    description: 'Submit all session results in a single request when the student completes the session. Includes final score, total time, and all answers.',
  })
  @ApiBearerAuth()
  @ApiBody({
    type: CompleteSessionDTO,
    description: 'Complete session data including all answers',
    examples: {
      'Complete session with results': {
        value: {
          sessionId: '6903eeddd0c59f0aa0fc0dc4',
          nombre: 'Juan Pérez',
          correo: 'juan@example.com',
          puntajeFinal: 13.33,
          tiempoTotal: 45,
          respuestas: [
            {
              exerciseId: '68e7b78b80da60122813bdf7',
              questionId: '68e7b78980da60122813bdf3',
              answer: 'Selenium',
              isCorrect: true,
              timeSpent: 15
            },
            {
              exerciseId: '68e7b78b80da60122813bdf7',
              questionId: '68e7b78980da60122813bdf4',
              answer: 'Extraer información',
              isCorrect: true,
              timeSpent: 15
            },
            {
              exerciseId: '68e7b78b80da60122813bdf7',
              questionId: '68e7b78980da60122813bdf5',
              answer: 'Respuesta incorrecta',
              isCorrect: false,
              timeSpent: 15
            }
          ]
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session completed successfully with all results saved',
    type: SessionScoreResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async completeSession(
    @Body() completeSessionDto: CompleteSessionDTO,
    @CurrentUser() user: any,
  ): Promise<SessionScoreResponseDTO> {
    // Para usuarios guest, no pasar el userId (sub) ya que es temporal
    // El frontend ahora envía todos los datos necesarios (nombre, correo, puntajeFinal, etc.)
    const userId = user.isGuest ? undefined : user.sub;
    
    return this.sessionScoreService.completeSession(completeSessionDto, userId);
  }

  @Get('session/:sessionId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all scores for a session',
    description: 'Get summary and all scores for a specific session. Only accessible by teachers and admins.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scores retrieved successfully',
    type: SessionScoreSummaryDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only teachers and admins can access this endpoint',
  })
  async getSessionScores(
    @Param('sessionId') sessionId: string,
  ): Promise<SessionScoreSummaryDTO> {
    return this.sessionScoreService.getSessionScores(sessionId);
  }

  @Get('student/:sessionId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get student score for a session',
    description: 'Get the score record for the authenticated student in a specific session',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'correo',
    description: 'Email of the student (optional, for non-registered students)',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Score retrieved successfully',
    type: SessionScoreResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Score record not found',
  })
  async getStudentScore(
    @Param('sessionId') sessionId: string,
    @Query('correo') correo: string,
    @CurrentUser() user: any,
  ): Promise<SessionScoreResponseDTO> {
    // Para usuarios guest, no pasar el userId (sub) ya que es temporal
    const userId = user.isGuest ? undefined : user.sub;
    const userCorreo = correo || user.correo || user.email;
    
    // Validar que al menos tengamos userId o correo
    if (!userId && !userCorreo) {
      throw new BadRequestException('User ID or email is required to retrieve score');
    }
    
    return this.sessionScoreService.getStudentScore(
      sessionId,
      userId,
      userCorreo,
    );
  }

  @Get('user/my-scores')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get all scores for authenticated user',
    description: 'Get all score records for the authenticated user across all sessions. Not available for guest users.',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scores retrieved successfully',
    type: [SessionScoreResponseDTO],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Guest users cannot access historical scores',
  })
  async getUserScores(@CurrentUser() user: any): Promise<SessionScoreResponseDTO[]> {
    // Los usuarios guest no pueden obtener scores históricos
    if (user.isGuest) {
      throw new BadRequestException('Guest users cannot access historical scores. Please register for full access.');
    }
    return this.sessionScoreService.getUserScores(user.sub);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({
    summary: 'Get all scores for a specific user',
    description: 'Get all score records for a specific user. Only accessible by teachers and admins.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Scores retrieved successfully',
    type: [SessionScoreResponseDTO],
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only teachers and admins can access this endpoint',
  })
  async getUserScoresById(@Param('userId') userId: string): Promise<SessionScoreResponseDTO[]> {
    return this.sessionScoreService.getUserScores(userId);
  }

  @Delete(':scoreId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a score record',
    description: 'Delete a score record. Only accessible by admins.',
  })
  @ApiBearerAuth()
  @ApiParam({
    name: 'scoreId',
    description: 'ID of the score record',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Score record deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Score record not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only admins can delete score records',
  })
  async deleteScore(@Param('scoreId') scoreId: string): Promise<void> {
    await this.sessionScoreService.deleteScore(scoreId);
  }
}
