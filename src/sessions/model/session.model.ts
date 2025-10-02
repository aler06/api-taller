import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export enum SessionStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  FINISHED = 'finished',
  CANCELLED = 'cancelled'
}

@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Exercise' }], required: true })
  exerciseIds: Types.ObjectId[];

  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: true, unique: true })
  accessCode: string;

  @Prop({ required: true, enum: SessionStatus, default: SessionStatus.WAITING })
  status: SessionStatus;

  @Prop({ required: true })
  duration: number; // Duration in minutes

  @Prop({ required: false })
  startTime?: Date;

  @Prop({ required: false })
  endTime?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  participants: Types.ObjectId[];

  @Prop({ required: true, default: 50 })
  maxParticipants: number;

  @Prop({ required: false })
  shareableLink?: string;

  @Prop({ default: true })
  allowLateJoin: boolean;

  @Prop({ default: false })
  showLeaderboard: boolean;
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Create indexes for better performance
SessionSchema.index({ accessCode: 1 }, { unique: true });
SessionSchema.index({ teacherId: 1 });
SessionSchema.index({ status: 1 });
SessionSchema.index({ startTime: 1 });
