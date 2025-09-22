import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema()
export class Question {
    @Prop({ required: false })
    question?: string;

    @Prop({ required: false })
    sentence?: string;

    @Prop({ type: [String], required: false })
    options?: string[];

    @Prop({ required: true })
    correct_answer: string;

    @Prop({ required: true })
    explanation: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);