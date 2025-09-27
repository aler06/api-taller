import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SessionService } from '../service/session.service';
import { CreateSessionRequestDTO } from '../dto/create-session-request.dto';
import { JoinSessionRequestDTO } from '../dto/join-session-request.dto';
import { SessionControlRequestDTO } from '../dto/session-control-request.dto';
import { SessionResponseDTO } from '../dto/session-response.dto';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { Roles } from '../../auth/decorator/roles.decorator';
import { CurrentUser } from '../../auth/decorator/current-user.decorator';
import { Role } from '../../users/enum/role.enum';

@ApiTags('sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new session',
    description: 'Create a new interactive session for students. Only teachers can create sessions.' 
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Session created successfully',
    type: SessionResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or exercise not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'User is not a teacher or exercise does not belong to the teacher',
  })
  async createSession(
    @Body() createSessionDto: CreateSessionRequestDTO,
    @CurrentUser() user: any,
  ): Promise<SessionResponseDTO> {
    // Ensure the teacher ID matches the authenticated user
    createSessionDto.teacherId = user.sub;
    return this.sessionService.createSession(createSessionDto);
  }

  @Post('join')
  @UseGuards(RolesGuard)
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Join a session',
    description: 'Join an existing session using an access code. Only students can join sessions.' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully joined the session',
    type: SessionResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid access code, session full, or session not joinable',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async joinSession(
    @Body() joinSessionDto: JoinSessionRequestDTO,
    @CurrentUser() user: any,
  ): Promise<SessionResponseDTO> {
    // Ensure the student ID matches the authenticated user
    joinSessionDto.studentId = user.sub;
    return this.sessionService.joinSession(joinSessionDto);
  }

  @Get('my-sessions')
  @ApiOperation({ 
    summary: 'Get user sessions',
    description: 'Get all sessions for the authenticated user. Teachers get their created sessions, students get their joined sessions.' 
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessions retrieved successfully',
    type: [SessionResponseDTO],
  })
  async getMySessions(@CurrentUser() user: any): Promise<SessionResponseDTO[]> {
    if (user.role === Role.TEACHER) {
      return this.sessionService.getSessionsByTeacher(user.sub);
    } else {
      return this.sessionService.getSessionsByStudent(user.sub);
    }
  }

  @Get('teacher/:teacherId')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ 
    summary: 'Get sessions by teacher',
    description: 'Get all sessions created by a specific teacher. Only accessible by the teacher themselves or admins.' 
  })
  @ApiParam({
    name: 'teacherId',
    description: 'ID of the teacher',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sessions retrieved successfully',
    type: [SessionResponseDTO],
  })
  async getSessionsByTeacher(
    @Param('teacherId') teacherId: string,
    @CurrentUser() user: any,
  ): Promise<SessionResponseDTO[]> {
    // Ensure teachers can only see their own sessions (unless admin)
    if (user.role === Role.TEACHER && user.sub !== teacherId) {
      throw new Error('You can only view your own sessions');
    }
    return this.sessionService.getSessionsByTeacher(teacherId);
  }

  @Get(':sessionId')
  @ApiOperation({ 
    summary: 'Get session by ID',
    description: 'Get detailed information about a specific session' 
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session',
    example: '507f1f77bcf86cd799439014',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session retrieved successfully',
    type: SessionResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async getSessionById(@Param('sessionId') sessionId: string): Promise<SessionResponseDTO> {
    return this.sessionService.getSessionById(sessionId);
  }

  @Put(':sessionId/start')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  @ApiOperation({ 
    summary: 'Start a session',
    description: 'Start a waiting session. Only the session creator can start it.' 
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session to start',
    example: '507f1f77bcf86cd799439014',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session started successfully',
    type: SessionResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Session cannot be started',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only session creator can start the session',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async startSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: any,
  ): Promise<SessionResponseDTO> {
    return this.sessionService.startSession(sessionId, user.sub);
  }

  @Put(':sessionId/end')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  @ApiOperation({ 
    summary: 'End a session',
    description: 'End an active session. Only the session creator can end it.' 
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session to end',
    example: '507f1f77bcf86cd799439014',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session ended successfully',
    type: SessionResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Session is not active',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only session creator can end the session',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async endSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: any,
  ): Promise<SessionResponseDTO> {
    return this.sessionService.endSession(sessionId, user.sub);
  }

  @Put(':sessionId/cancel')
  @UseGuards(RolesGuard)
  @Roles(Role.TEACHER)
  @ApiOperation({ 
    summary: 'Cancel a session',
    description: 'Cancel a session that has not finished yet. Only the session creator can cancel it.' 
  })
  @ApiParam({
    name: 'sessionId',
    description: 'ID of the session to cancel',
    example: '507f1f77bcf86cd799439014',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session cancelled successfully',
    type: SessionResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot cancel a finished session',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only session creator can cancel the session',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async cancelSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: any,
  ): Promise<SessionResponseDTO> {
    return this.sessionService.cancelSession(sessionId, user.sub);
  }

  @Get('access-code/:accessCode')
  @ApiOperation({ 
    summary: 'Get session by access code',
    description: 'Get session information using an access code (for join page preview)' 
  })
  @ApiParam({
    name: 'accessCode',
    description: 'Access code of the session',
    example: 'ABC123',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session information retrieved successfully',
    type: SessionResponseDTO,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Session not found',
  })
  async getSessionByAccessCode(@Param('accessCode') accessCode: string): Promise<SessionResponseDTO> {
    const session = await this.sessionService.validateSessionAccess('', accessCode);
    if (!session) {
      throw new Error('Session not found');
    }
    return this.sessionService.getSessionById(session._id.toString());
  }
}
