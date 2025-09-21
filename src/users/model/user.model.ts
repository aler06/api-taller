import { Role } from "../enum/role.enum";
import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class User {

    @Prop({ required: true })
    firstName: string;
    @Prop({ required: true })
    lastName: string;
    @Prop({ required: true, unique: true })
    email: string;
    @Prop({ required: true, enum: Role })
    role: Role;
    @Prop({ required: true , select: false})
    password: string;
    @Prop({ required: true , default: false})
    isActive: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);
