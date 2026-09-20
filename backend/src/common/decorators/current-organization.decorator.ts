import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Organization } from '@prisma/client';

export const CurrentOrganization = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Organization | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ organization?: Organization }>();

    return request.organization;
  },
);
