import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CardDocument = Card & Document;

@Schema()
export class Card {
  @Prop({ required: true })
  front: string;

  @Prop({ required: true })
  back: string;
}

export const CardSchema = SchemaFactory.createForClass(Card);
