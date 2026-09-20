import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Organization } from '@prisma/client';
import { Observable } from 'rxjs';

import { OrganizationsService } from './organizations.service';

@Injectable()
export class OrganizationResolveInterceptor implements NestInterceptor {
  constructor(private readonly organizationsService: OrganizationsService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { organization?: Organization }>();

    request.organization =
      await this.organizationsService.resolveRequest(request);

    return next.handle();
  }
}
