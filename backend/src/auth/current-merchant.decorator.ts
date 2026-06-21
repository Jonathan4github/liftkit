import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type AuthMerchant = { id: string; email: string };

export const CurrentMerchant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthMerchant => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthMerchant }>();
    return request.user;
  },
);
