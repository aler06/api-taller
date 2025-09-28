import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Session, SessionSchema } from './model/session.model';
import { SessionService } from './service/session.service';
import { SessionController } from './controller/session.controller';
import { SessionPublicController } from './controller/session-public.controller';
import { SessionGateway } from './gateway/session.gateway';
import { Exercise, ExerciseSchema } from '../exercise-generator/model/exercise.model';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Exercise.name, schema: ExerciseSchema },
    ]),
    AuthModule, // Import for authentication guards
    UsersModule, // Import for User model access
  ],
  controllers: [SessionController, SessionPublicController],
  providers: [SessionService, SessionGateway],
  exports: [SessionService, SessionGateway],
})
export class SessionsModule {}
