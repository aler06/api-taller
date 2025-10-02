import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TrueFalseDocument = TrueFalse & Document;

@Schema()
export class TrueFalse {
    @Prop({ required: true })
    statement: string;

    @Prop({ required: true })
    correct_answer: boolean;

    @Prop({ required: true })
    explanation: string;
}

export const TrueFalseSchema = SchemaFactory.createForClass(TrueFalse);
