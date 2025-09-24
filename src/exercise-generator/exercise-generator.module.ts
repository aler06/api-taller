import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExerciseGeneratorService } from './service/exercise-generator.service';
import { ExerciseGeneratorController } from './controller/exercise-generator.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Exercise, ExerciseSchema } from './model/exercise.model';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule, 
    MongooseModule.forFeature([{ name: Exercise.name, schema: ExerciseSchema }]),
    UsersModule
  ],
  providers: [ExerciseGeneratorService],
  exports: [ExerciseGeneratorService],
  controllers: [ExerciseGeneratorController]
})
export class ExerciseGeneratorModule {}
