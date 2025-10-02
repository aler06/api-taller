import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Question } from './question.model';
import { Card } from './card.model';
import { Element } from './element.model';
import { Game } from '../enum/game.enum';

export type ExerciseDocument = Exercise & Document & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({ timestamps: true })
export class Exercise {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, enum: Game })
    game: Game;

    @Prop({ type: [Question], required: false })
    questions?: Question[];

    @Prop({ required: false })
    word?: string;

    @Prop({ required: false })
    hint?: string;

    @Prop({ required: false })
    topic?: string;

    @Prop({ required: false })
    difficulty?: string;

    @Prop({ required: false })
    targetAudience?: string;

    @Prop({ type: [Card], required: false })
    cards?: Card[];

    @Prop({ required: false })
    instructions?: string;

    @Prop({ type: [Element], required: false })
    elements?: Element[];

    @Prop({ type: [Number], required: false })
    correctOrder?: number[];

    @Prop({ required: false })
    explanation?: string;

}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);