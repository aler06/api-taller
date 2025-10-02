import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PhraseDocument = Phrase & Document;

@Schema()
export class Phrase {
    @Prop({ required: true })
    text: string;
}

export const PhraseSchema = SchemaFactory.createForClass(Phrase);
