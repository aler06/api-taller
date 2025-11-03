import { ApiProperty } from '@nestjs/swagger';

export class AnswerDetailDTO {
  @ApiProperty({ description: 'Exercise ID' })
  exerciseId: string;

  @ApiProperty({ description: 'Question ID' })
  questionId: string;

  @ApiProperty({ description: 'Student answer' })
  answer: string;

  @ApiProperty({ description: 'Whether the answer is correct' })
  isCorrect: boolean;

  @ApiProperty({ description: 'Points earned for this answer' })
  points: number;

  @ApiProperty({ description: 'Time spent on this question in seconds' })
  timeSpent: number;

  @ApiProperty({ description: 'Timestamp when the answer was submitted' })
  timestamp: Date;
}

export class SessionScoreResponseDTO {
  @ApiProperty({ description: 'Score record ID' })
  id: string;

  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'User ID (if registered)', required: false })
  userId?: string;

  @ApiProperty({
    description: 'Student name (if not registered)',
    required: false,
  })
  nombre?: string;

  @ApiProperty({ description: 'Student email', required: false })
  correo?: string;

  @ApiProperty({ description: 'Final score (max 20 points)', example: 15.5 })
  puntajeFinal: number;

  @ApiProperty({ description: 'Total time spent in seconds', example: 300 })
  tiempoTotal: number;

  @ApiProperty({
    description: 'Date when the session was completed',
    required: false,
  })
  fechaResolucion?: Date;

  @ApiProperty({ description: 'Whether the student completed the session' })
  completado: boolean;

  @ApiProperty({
    description: 'Detailed answers',
    type: [AnswerDetailDTO],
    required: false,
  })
  respuestas?: AnswerDetailDTO[];

  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

export class SessionScoreSummaryDTO {
  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Session name' })
  sessionName: string;

  @ApiProperty({ description: 'Total participants' })
  totalParticipants: number;

  @ApiProperty({ description: 'Participants who completed' })
  completedCount: number;

  @ApiProperty({ description: 'Average score' })
  averageScore: number;

  @ApiProperty({ description: 'Highest score' })
  highestScore: number;

  @ApiProperty({ description: 'Lowest score' })
  lowestScore: number;

  @ApiProperty({
    description: 'List of all scores',
    type: [SessionScoreResponseDTO],
  })
  scores: SessionScoreResponseDTO[];
}
