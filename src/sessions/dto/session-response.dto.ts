import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { SessionStatus } from '../model/session.model';
import { ExerciseResponseDto } from '../../exercise-generator/dto/exercise-response.dto';
import { UserResponseDTO } from '../../users/dto/user-response.dto';

@ApiSchema({ name: 'SessionResponseDTO', description: 'Session response DTO' })
export class SessionResponseDTO {
  @ApiProperty({
    description: 'Unique identifier of the session',
    example: '507f1f77bcf86cd799439014',
  })
  id: string;

  @ApiProperty({
    description: 'Teacher who created the session',
    type: () => UserResponseDTO,
  })
  teacher: UserResponseDTO;

  @ApiProperty({
    description: 'Exercises associated with the session',
    type: [ExerciseResponseDto],
  })
  exercises: ExerciseResponseDto[];

  @ApiProperty({
    description: 'Name of the session',
    example: 'Geografia de Europa - Sesión 1',
  })
  name: string;

  @ApiProperty({
    description: 'Description of the session',
    example: 'Sesión interactiva sobre la geografía europea',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Access code for students to join',
    example: 'ABC123',
  })
  accessCode: string;

  @ApiProperty({
    description: 'Current status of the session',
    example: 'waiting',
    enum: SessionStatus,
  })
  status: SessionStatus;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    example: 30,
  })
  duration: number;

  @ApiProperty({
    description: 'When the session started',
    example: '2024-01-15T10:30:00.000Z',
    required: false,
  })
  startTime?: Date;

  @ApiProperty({
    description: 'When the session ended',
    example: '2024-01-15T11:00:00.000Z',
    required: false,
  })
  endTime?: Date;

  @ApiProperty({
    description: 'List of participants in the session',
    type: [UserResponseDTO],
  })
  participants: UserResponseDTO[];

  @ApiProperty({
    description: 'Maximum number of participants allowed',
    example: 30,
  })
  maxParticipants: number;

  @ApiProperty({
    description: 'Shareable link for the session',
    example: 'https://app.com/session/join/ABC123',
    required: false,
  })
  shareableLink?: string;

  @ApiProperty({
    description: 'Whether late join is allowed',
    example: true,
  })
  allowLateJoin: boolean;

  @ApiProperty({
    description: 'Whether leaderboard is shown',
    example: true,
  })
  showLeaderboard: boolean;

  @ApiProperty({
    description: 'Date when the session was created',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the session was last updated',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: Date;
}
