import { Module } from '@nestjs/common';

import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationResolveInterceptor } from './organization-resolve.interceptor';

@Module({
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationResolveInterceptor],
  exports: [OrganizationsService, OrganizationResolveInterceptor],
})
export class OrganizationsModule {}
