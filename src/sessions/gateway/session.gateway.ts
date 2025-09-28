import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';
import { SessionService } from '../service/session.service';
import { Role } from '../../users/enum/role.enum';

interface ConnectedUser {
  userId: string;
  sessionId: string;
  role: 'teacher' | 'student';
  socketId: string;
}

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:8080'
    ],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/sessions',
})
export class SessionGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('SessionGateway');
  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(private readonly sessionService: SessionService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    
    // Find and remove the disconnected user
    const user = Array.from(this.connectedUsers.values()).find(
      u => u.socketId === client.id
    );
    
    if (user) {
      this.connectedUsers.delete(user.userId);
      
      // Notify other participants in the session
      client.to(`session-${user.sessionId}`).emit('userLeft', {
        userId: user.userId,
        timestamp: new Date(),
      });
      
      // Update participant count
      this.updateParticipantCount(user.sessionId);
    }
  }

  @SubscribeMessage('joinSession')
  async handleJoinSession(
    @MessageBody() data: { sessionId: string; userId: string; accessCode: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, userId, accessCode } = data;
      
      this.logger.log(`🔍 Received joinSession: ${JSON.stringify(data)}`);
      
      // Validate session exists and is active
      const session = await this.sessionService.findSessionByAccessCode(accessCode);
      if (!session) {
        this.logger.error(`❌ Session not found with access code: ${accessCode}`);
        client.emit('joinError', { message: 'Session not found' });
        return;
      }

      this.logger.log(`✅ Session found: ${session._id}, status: ${session.status}`);
      
      // Handle temporary vs registered users
      let user;
      if (userId.startsWith('temp_')) {
        // Create temporary user object
        user = {
          _id: userId,
          firstName: 'Estudiante',
          lastName: 'Temporal',
          email: `${userId}@temp.local`,
          role: Role.STUDENT,
          isActive: true,
          isTemporary: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.logger.log(`👤 Created temporary user: ${userId}`);
      } else {
        // Get registered user from database
        user = await this.sessionService.getUserById(userId);
        if (!user) {
          this.logger.error(`❌ Registered user not found: ${userId}`);
          client.emit('joinError', { message: 'User not found' });
          return;
        }
        this.logger.log(`👤 Found registered user: ${userId}`);
      }

      // Use the actual session ID from the database
      const actualSessionId = session._id.toString();
      
      // Join the session room
      await client.join(`session-${actualSessionId}`);
      
      // Store connected user info
      const connectedUser: ConnectedUser = {
        userId,
        sessionId: actualSessionId,
        role: user.role === Role.TEACHER ? 'teacher' : 'student',
        socketId: client.id,
      };
      this.connectedUsers.set(userId, connectedUser);

      // Add participant to session (if student and not temporary)
      if (user.role === Role.STUDENT && !user.isTemporary) {
        await this.sessionService.addParticipant(actualSessionId, userId);
        this.logger.log(`📝 Added registered student to session participants`);
      } else if (user.isTemporary) {
        this.logger.log(`👻 Temporary user joined - not persisting to database`);
      }

      // Notify the user they joined successfully
      client.emit('sessionJoined', {
        sessionId: actualSessionId,
        session,
        timestamp: new Date(),
      });

      // Notify other participants
      client.to(`session-${actualSessionId}`).emit('userJoined', {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        timestamp: new Date(),
      });

      // Update participant count
      this.updateParticipantCount(actualSessionId);

      this.logger.log(`✅ User ${userId} joined session ${actualSessionId} successfully`);
    } catch (error) {
      this.logger.error(`❌ Error joining session: ${error.message}`);
      this.logger.error(`❌ Stack trace: ${error.stack}`);
      client.emit('joinError', { 
        message: error.message || 'Failed to join session',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  @SubscribeMessage('leaveSession')
  async handleLeaveSession(
    @MessageBody() data: { sessionId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, userId } = data;
      
      // Leave the session room
      await client.leave(`session-${sessionId}`);
      
      // Remove from connected users
      this.connectedUsers.delete(userId);
      
      // Remove participant from session (if student and not temporary)
      if (userId.startsWith('temp_')) {
        this.logger.log(`👻 Temporary user left - no database cleanup needed`);
      } else {
        const user = await this.sessionService.getUserById(userId);
        if (user && user.role === Role.STUDENT) {
          await this.sessionService.removeParticipant(sessionId, userId);
          this.logger.log(`📝 Removed registered student from session participants`);
        }
      }

      // Notify other participants
      client.to(`session-${sessionId}`).emit('userLeft', {
        userId,
        timestamp: new Date(),
      });

      // Update participant count
      this.updateParticipantCount(sessionId);

      client.emit('sessionLeft', { sessionId, timestamp: new Date() });

      this.logger.log(`User ${userId} left session ${sessionId}`);
    } catch (error) {
      this.logger.error(`Error leaving session: ${error.message}`);
    }
  }

  @SubscribeMessage('startSession')
  async handleStartSession(
    @MessageBody() data: { sessionId: string; teacherId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, teacherId } = data;
      
      // Validate teacher and start session
      const session = await this.sessionService.startSession(sessionId, teacherId);
      
      // Notify all participants
      this.server.to(`session-${sessionId}`).emit('sessionStarted', {
        session,
        timestamp: new Date(),
      });

      this.logger.log(`Session ${sessionId} started by teacher ${teacherId}`);
    } catch (error) {
      this.logger.error(`Error starting session: ${error.message}`);
      client.emit('startError', { message: 'Failed to start session' });
    }
  }

  @SubscribeMessage('endSession')
  async handleEndSession(
    @MessageBody() data: { sessionId: string; teacherId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, teacherId } = data;
      
      // Validate teacher and end session
      const session = await this.sessionService.endSession(sessionId, teacherId);
      
      // Notify all participants
      this.server.to(`session-${sessionId}`).emit('sessionEnded', {
        session,
        timestamp: new Date(),
      });

      // Disconnect all users from the session
      const connectedInSession = Array.from(this.connectedUsers.values())
        .filter(u => u.sessionId === sessionId);
        
      for (const user of connectedInSession) {
        const socket = this.server.sockets.sockets.get(user.socketId);
        if (socket) {
          await socket.leave(`session-${sessionId}`);
        }
        this.connectedUsers.delete(user.userId);
      }

      this.logger.log(`Session ${sessionId} ended by teacher ${teacherId}`);
    } catch (error) {
      this.logger.error(`Error ending session: ${error.message}`);
      client.emit('endError', { message: 'Failed to end session' });
    }
  }

  @SubscribeMessage('submitAnswer')
  async handleSubmitAnswer(
    @MessageBody() data: { 
      sessionId: string; 
      userId: string; 
      questionId: string; 
      answer: string;
      timeSpent: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId, userId, questionId, answer, timeSpent } = data;
      
      // Process the answer (this could be implemented in SessionService)
      const result = await this.sessionService.processAnswer(
        sessionId, 
        userId, 
        questionId, 
        answer, 
        timeSpent
      );

      // Notify the student of their result
      client.emit('answerResult', {
        questionId,
        correct: result.correct,
        score: result.score,
        correctAnswer: result.correctAnswer,
        explanation: result.explanation,
        timestamp: new Date(),
      });

      // Notify teacher of student progress (optional)
      const user = this.connectedUsers.get(userId);
      if (user) {
        const teacherSockets = Array.from(this.connectedUsers.values())
          .filter(u => u.sessionId === sessionId && u.role === 'teacher')
          .map(u => u.socketId);

        for (const socketId of teacherSockets) {
          this.server.to(socketId).emit('studentProgress', {
            userId,
            questionId,
            correct: result.correct,
            timeSpent,
            timestamp: new Date(),
          });
        }
      }

      this.logger.log(`Answer submitted for session ${sessionId} by user ${userId}`);
    } catch (error) {
      this.logger.error(`Error processing answer: ${error.message}`);
      client.emit('answerError', { message: 'Failed to process answer' });
    }
  }

  @SubscribeMessage('getSessionStatus')
  async handleGetSessionStatus(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { sessionId } = data;
      
      const session = await this.sessionService.getSessionById(sessionId);
      const participantCount = Array.from(this.connectedUsers.values())
        .filter(u => u.sessionId === sessionId).length;

      client.emit('sessionStatus', {
        session,
        participantCount,
        connectedUsers: Array.from(this.connectedUsers.values())
          .filter(u => u.sessionId === sessionId)
          .map(u => ({ userId: u.userId, role: u.role })),
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error(`Error getting session status: ${error.message}`);
    }
  }

  private updateParticipantCount(sessionId: string) {
    const count = Array.from(this.connectedUsers.values())
      .filter(u => u.sessionId === sessionId).length;

    this.server.to(`session-${sessionId}`).emit('participantCountUpdate', {
      count,
      timestamp: new Date(),
    });
  }

  // Method to send custom messages from the service
  public sendToSession(sessionId: string, event: string, data: any) {
    this.server.to(`session-${sessionId}`).emit(event, data);
  }

  // Method to send to specific user
  public sendToUser(userId: string, event: string, data: any) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.server.to(user.socketId).emit(event, data);
    }
  }
}
