import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayloadDto } from '../dto/jwt-payload.dto';

export const CurrentUser = createParamDecorator(
  (
    data: keyof JwtPayloadDto | undefined,
    ctx: ExecutionContext,
  ): JwtPayloadDto | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
