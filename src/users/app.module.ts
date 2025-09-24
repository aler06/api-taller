import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users.module';
import { ExerciseGeneratorModule } from '../exercise-generator/exercise-generator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${encodeURIComponent(configService.get('MONGODB_USER') || '')}:${encodeURIComponent(configService.get('MONGODB_PASSWORD') || '')}@${configService.get('MONGODB_HOST') || 'localhost'}:${configService.get('MONGODB_PORT') || '27017'}/${configService.get('MONGODB_DATABASE') || 'test'}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ExerciseGeneratorModule,
  ],
})
export class AppModule {}
