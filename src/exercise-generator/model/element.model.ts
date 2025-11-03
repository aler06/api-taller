import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ElementDocument = Element & Document;

@Schema()
export class Element {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  texto: string;
}

export const ElementSchema = SchemaFactory.createForClass(Element);
