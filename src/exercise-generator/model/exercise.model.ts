import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Question } from './question.model';
import { Game } from '../enum/game.enum';

export type ExerciseDocument = Exercise & Document;

@Schema({ timestamps: true })
export class Exercise {
    @Prop({ required: true, enum: Game })
    game: Game;

    @Prop({ type: [Question], required: false })
    questions?: Question[];

    @Prop({ required: false })
    word?: string;

    @Prop({ required: false })
    hint?: string;
}

export const ExerciseSchema = SchemaFactory.createForClass(Exercise);