import {
  Controller,
  Get,
  Param,
  HttpStatus,
  NotFoundException,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { SessionService } from '../service/session.service';
import { SessionResponseDTO } from '../dto/session-response.dto';

@ApiTags('session-public')
@Controller('session')
export class SessionPublicController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('join/:accessCode')
  @ApiOperation({ 
    summary: 'Join session page',
    description: 'Public endpoint to access session join page using shareable link' 
  })
  @ApiParam({
    name: 'accessCode',
    description: 'Access code of the session',
    example: 'LXQ7TM',
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
  async joinSessionPage(@Param('accessCode') accessCode: string): Promise<SessionResponseDTO> {
    const session = await this.sessionService.findSessionByAccessCode(accessCode);
    if (!session) {
      throw new NotFoundException('Session not found with the provided access code');
    }
    return this.sessionService.mapToSessionResponse(session, session.teacherId, session.exerciseIds);
  }

  @Get('redirect/:accessCode')
  @ApiOperation({ 
    summary: 'Redirect to frontend join page',
    description: 'Redirects to the frontend application with session information' 
  })
  @ApiParam({
    name: 'accessCode',
    description: 'Access code of the session',
    example: 'LXQ7TM',
  })
  async redirectToFrontend(
    @Param('accessCode') accessCode: string,
    @Res() res: Response
  ): Promise<void> {
    const session = await this.sessionService.findSessionByAccessCode(accessCode);
    if (!session) {
      throw new NotFoundException('Session not found with the provided access code');
    }
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/session/join/${accessCode}`;
    
    res.redirect(302, redirectUrl);
  }

  @Get('test/users')
  @ApiOperation({ 
    summary: 'Get test users for development',
    description: 'Get a list of users for testing WebSocket connections' 
  })
  async getTestUsers() {
    // This is for development/testing only
    const users = await this.sessionService.getTestUsers();
    return {
      message: 'Test users for WebSocket connection',
      users: users.map(user => ({
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        email: user.email
      }))
    };
  }
}
