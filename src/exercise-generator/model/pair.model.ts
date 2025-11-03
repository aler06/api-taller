import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PairDocument = Pair & Document;

@Schema()
export class Pair {
  @Prop({ required: true })
  term: string;

  @Prop({ required: true })
  match: string;
}

export const PairSchema = SchemaFactory.createForClass(Pair);
