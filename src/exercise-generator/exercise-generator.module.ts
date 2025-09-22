import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExerciseGeneratorService } from './service/exercise-generator.service';
import { ExerciseGeneratorController } from './controller/exercise-generator.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Exercise, ExerciseSchema } from './model/exercise.model';

@Module({
  imports: [ConfigModule, MongooseModule.forFeature([{ name: Exercise.name, schema: ExerciseSchema }])],
  providers: [ExerciseGeneratorService],
  exports: [ExerciseGeneratorService],
  controllers: [ExerciseGeneratorController]
})
export class ExerciseGeneratorModule {}
