import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${encodeURIComponent(configService.get('MONGODB_USER') || '')}:${encodeURIComponent(configService.get('MONGODB_PASSWORD') || '')}@${configService.get('MONGODB_HOST') || 'localhost'}:${configService.get('MONGODB_PORT') || '27017'}/${configService.get('MONGODB_DATABASE') || 'test'}?authSource=admin`,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
