import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionScoreDocument = SessionScore &
  Document & {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
  };

@Schema({ timestamps: true })
export class SessionScore {
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true })
  sessionId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop({ required: false })
  nombre?: string; // For students who join without registration

  @Prop({ required: false })
  correo?: string; // Email for registered students

  @Prop({ required: true, default: 0, min: 0, max: 20 })
  puntajeFinal: number; // Final score (max 20 points)

  @Prop({ required: true, default: 0 })
  tiempoTotal: number; // Total time in seconds

  @Prop({ required: false })
  fechaResolucion?: Date; // Date when the session was completed

  @Prop({ type: Map, of: Object, default: {} })
  respuestas: Map<
    string,
    {
      exerciseId: string;
      questionId: string;
      answer: string;
      isCorrect: boolean;
      points: number;
      timeSpent: number;
      timestamp: Date;
    }
  >; // Detailed answers for each question

  @Prop({ required: true, default: false })
  completado: boolean; // Whether the student completed the session
}

export const SessionScoreSchema = SchemaFactory.createForClass(SessionScore);

// Create indexes for better performance and prevent duplicates
SessionScoreSchema.index(
  { sessionId: 1, userId: 1 },
  { unique: true, sparse: true },
);
SessionScoreSchema.index(
  { sessionId: 1, correo: 1 },
  { unique: true, sparse: true },
);
SessionScoreSchema.index({ sessionId: 1 });
SessionScoreSchema.index({ userId: 1 });
