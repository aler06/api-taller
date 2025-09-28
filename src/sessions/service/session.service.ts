import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import { Session, SessionDocument, SessionStatus } from '../model/session.model';
import { CreateSessionRequestDTO } from '../dto/create-session-request.dto';
import { JoinSessionRequestDTO } from '../dto/join-session-request.dto';
import { SessionResponseDTO } from '../dto/session-response.dto';
import { UserResponseDTO } from '../../users/dto/user-response.dto';
import { ExerciseResponseDto } from '../../exercise-generator/dto/exercise-response.dto';
import { Role } from '../../users/enum/role.enum';
import { User } from '../../users/model/user.model';
import { Exercise, ExerciseDocument } from '../../exercise-generator/model/exercise.model';

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(User.name) private userModel: Model<User & Document>,
    @InjectModel(Exercise.name) private exerciseModel: Model<ExerciseDocument>,
  ) {}

  async createSession(createSessionDto: CreateSessionRequestDTO): Promise<SessionResponseDTO> {
    // Validate teacher exists and has teacher role
    const teacher = await this.userModel.findById(createSessionDto.teacherId).select('firstName lastName email role isActive createdAt updatedAt');
    if (!teacher || teacher.role !== Role.TEACHER) {
      throw new BadRequestException('Invalid teacher ID or user is not a teacher');
    }

    // Validate exercise exists and is published
    const exercise = await this.exerciseModel.findById(createSessionDto.exerciseId);
    if (!exercise || !exercise.published) {
      throw new BadRequestException('Exercise not found or not published');
    }

    // Verify the exercise belongs to the teacher
    if (exercise.userId.toString() !== createSessionDto.teacherId) {
      throw new ForbiddenException('You can only create sessions for your own exercises');
    }

    // Generate unique access code
    const accessCode = this.generateAccessCode();
    
    // Create shareable link
    const shareableLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/session/join/${accessCode}`;

    const sessionData = {
      teacherId: new Types.ObjectId(createSessionDto.teacherId),
      exerciseId: new Types.ObjectId(createSessionDto.exerciseId),
      name: createSessionDto.name,
      description: createSessionDto.description,
      accessCode,
      duration: createSessionDto.duration,
      maxParticipants: createSessionDto.maxParticipants || 50,
      allowLateJoin: createSessionDto.allowLateJoin ?? true,
      showLeaderboard: createSessionDto.showLeaderboard ?? false,
      shareableLink,
      status: SessionStatus.WAITING,
      participants: [],
    };

    const session = new this.sessionModel(sessionData);
    const savedSession = await session.save();

    return this.mapToSessionResponse(savedSession, teacher, exercise);
  }

  async joinSession(joinSessionDto: JoinSessionRequestDTO): Promise<SessionResponseDTO> {
    // Find session by access code
    const session = await this.sessionModel
      .findOne({ accessCode: joinSessionDto.accessCode })
      .populate('teacherId')
      .populate('exerciseId')
      .populate('participants');

    if (!session) {
      throw new NotFoundException('Session not found with the provided access code');
    }

    // Validate student exists and has student role
    const student = await this.userModel.findById(joinSessionDto.studentId).select('firstName lastName email role isActive createdAt updatedAt');
    if (!student || student.role !== Role.STUDENT) {
      throw new BadRequestException('Invalid student ID or user is not a student');
    }

    // Check if session allows late join
    if (session.status === SessionStatus.ACTIVE && !session.allowLateJoin) {
      throw new BadRequestException('Session has already started and late join is not allowed');
    }

    // Check if session is still joinable
    if (session.status === SessionStatus.FINISHED || session.status === SessionStatus.CANCELLED) {
      throw new BadRequestException('Session has ended or been cancelled');
    }

    // Check if student is already in the session
    const isAlreadyParticipant = session.participants.some(
      (participantId) => participantId.toString() === joinSessionDto.studentId
    );

    if (isAlreadyParticipant) {
      // Return current session state if already joined
      return this.mapToSessionResponse(session, session.teacherId, session.exerciseId);
    }

    // Check if session is full
    if (session.participants.length >= session.maxParticipants) {
      throw new BadRequestException('Session is full');
    }

    // Add student to participants
    session.participants.push(new Types.ObjectId(joinSessionDto.studentId));
    await session.save();

    // Reload session with populated data
    const updatedSession = await this.sessionModel
      .findById(session._id)
      .populate('teacherId')
      .populate('exerciseId')
      .populate('participants');

    if (!updatedSession) {
      throw new NotFoundException('Session not found after update');
    }

    return this.mapToSessionResponse(updatedSession, updatedSession.teacherId, updatedSession.exerciseId);
  }

  async getSessionsByTeacher(teacherId: string): Promise<SessionResponseDTO[]> {
    const sessions = await this.sessionModel
      .find({ teacherId: new Types.ObjectId(teacherId) })
      .populate('teacherId')
      .populate('exerciseId')
      .populate('participants')
      .sort({ createdAt: -1 });

    return sessions.map(session => 
      this.mapToSessionResponse(session, session.teacherId, session.exerciseId)
    );
  }

  async getSessionsByStudent(studentId: string): Promise<SessionResponseDTO[]> {
    const sessions = await this.sessionModel
      .find({ participants: new Types.ObjectId(studentId) })
      .populate('teacherId')
      .populate('exerciseId')
      .populate('participants')
      .sort({ createdAt: -1 });

    return sessions.map(session => 
      this.mapToSessionResponse(session, session.teacherId, session.exerciseId)
    );
  }

  async getSessionById(sessionId: string): Promise<SessionResponseDTO> {
    const session = await this.sessionModel
      .findById(sessionId)
      .populate('teacherId')
      .populate('exerciseId')
      .populate('participants');

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.mapToSessionResponse(session, session.teacherId, session.exerciseId);
  }

  async startSession(sessionId: string, teacherId: string): Promise<SessionResponseDTO> {
    const session = await this.sessionModel.findById(sessionId);
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Only the session creator can start the session');
    }

    if (session.status !== SessionStatus.WAITING) {
      throw new BadRequestException('Session cannot be started');
    }

    session.status = SessionStatus.ACTIVE;
    session.startTime = new Date();
    session.endTime = new Date(Date.now() + session.duration * 60 * 1000); // Add duration in milliseconds
    
    await session.save();

    return this.getSessionById(sessionId);
  }

  async endSession(sessionId: string, teacherId: string): Promise<SessionResponseDTO> {
    const session = await this.sessionModel.findById(sessionId);
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Only the session creator can end the session');
    }

    if (session.status !== SessionStatus.ACTIVE) {
      throw new BadRequestException('Session is not active');
    }

    session.status = SessionStatus.FINISHED;
    session.endTime = new Date();
    
    await session.save();

    return this.getSessionById(sessionId);
  }

  async cancelSession(sessionId: string, teacherId: string): Promise<SessionResponseDTO> {
    const session = await this.sessionModel.findById(sessionId);
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.teacherId.toString() !== teacherId) {
      throw new ForbiddenException('Only the session creator can cancel the session');
    }

    if (session.status === SessionStatus.FINISHED) {
      throw new BadRequestException('Cannot cancel a finished session');
    }

    session.status = SessionStatus.CANCELLED;
    
    await session.save();

    return this.getSessionById(sessionId);
  }

  async addParticipant(sessionId: string, studentId: string): Promise<void> {
    const session = await this.sessionModel.findById(sessionId);
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const studentObjectId = new Types.ObjectId(studentId);
    
    if (!session.participants.includes(studentObjectId)) {
      session.participants.push(studentObjectId);
      await session.save();
    }
  }

  async removeParticipant(sessionId: string, studentId: string): Promise<void> {
    const session = await this.sessionModel.findById(sessionId);
    
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.participants = session.participants.filter(
      participantId => participantId.toString() !== studentId
    );
    
    await session.save();
  }

  // Helper methods for WebSocket gateway
  async validateSessionAccess(sessionId: string, accessCode: string): Promise<any> {
    const session = await this.sessionModel
      .findOne({ _id: sessionId, accessCode })
      .populate('exerciseId');
    
    return session;
  }

  async findSessionByAccessCode(accessCode: string): Promise<any> {
    const session = await this.sessionModel
      .findOne({ accessCode })
      .populate('teacherId')
      .populate('exerciseId')
      .populate('participants');
    
    return session;
  }

  async findActiveSessionByAccessCode(accessCode: string): Promise<any> {
    const session = await this.sessionModel
      .findOne({ 
        accessCode,
        status: { $in: [SessionStatus.WAITING, SessionStatus.ACTIVE] }
      })
      .populate('teacherId')
      .populate('exerciseId')
      .populate('participants');
    
    return session;
  }

  async getUserById(userId: string): Promise<any> {
    return this.userModel.findById(userId).select('firstName lastName email role isActive createdAt updatedAt');
  }

  async getTestUsers(): Promise<any[]> {
    // For development/testing only - get a few users
    return this.userModel.find().select('firstName lastName email role isActive createdAt updatedAt').limit(10);
  }

  // Method to process answers (placeholder - would need more complex logic)
  async processAnswer(
    sessionId: string, 
    userId: string, 
    questionId: string, 
    answer: string, 
    timeSpent: number
  ): Promise<{ correct: boolean; score: number; correctAnswer: string; explanation: string }> {
    // This is a simplified implementation
    // In a real app, you'd want to:
    // 1. Get the correct answer from the exercise
    // 2. Calculate score based on correctness and time
    // 3. Store the answer in a separate collection
    // 4. Update user progress/statistics
    
    const session = await this.sessionModel.findById(sessionId).populate('exerciseId');
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Find the question in the exercise
    const exercise = session.exerciseId as any;
    const question = exercise.questions?.find((q: any) => q._id.toString() === questionId);
    
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    const correct = question.correct_answer.toLowerCase() === answer.toLowerCase();
    const baseScore = correct ? 100 : 0;
    
    // Calculate time bonus (faster answers get more points)
    const timeBonus = correct ? Math.max(0, 50 - timeSpent) : 0;
    const finalScore = baseScore + timeBonus;

    return {
      correct,
      score: finalScore,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
    };
  }

  private generateAccessCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  public mapToSessionResponse(session: any, teacher: any, exercise: any): SessionResponseDTO {
    return {
      id: session._id.toString(),
      teacher: {
        _id: teacher._id.toString(),
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        email: teacher.email,
        role: teacher.role,
        isActive: teacher.isActive,
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt,
      },
      exercise: {
        id: exercise._id.toString(),
        game: exercise.game,
        questions: exercise.questions,
        word: exercise.word,
        hint: exercise.hint,
        cards: exercise.cards,
        instructions: exercise.instructions,
        published: exercise.published,
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
      },
      name: session.name,
      description: session.description,
      accessCode: session.accessCode,
      status: session.status,
      duration: session.duration,
      startTime: session.startTime,
      endTime: session.endTime,
      participants: session.participants?.map((participant: any) => ({
        _id: participant._id?.toString() || participant.toString(),
        firstName: participant.firstName || '',
        lastName: participant.lastName || '',
        email: participant.email || '',
        role: participant.role || 'student',
        isActive: participant.isActive || true,
        createdAt: participant.createdAt || new Date(),
        updatedAt: participant.updatedAt || new Date(),
      })) || [],
      maxParticipants: session.maxParticipants,
      shareableLink: session.shareableLink,
      allowLateJoin: session.allowLateJoin,
      showLeaderboard: session.showLeaderboard,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }
}
