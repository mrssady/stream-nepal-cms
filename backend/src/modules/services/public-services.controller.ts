import { Controller, Get } from "@nestjs/common";

import { ServicesService } from "./services.service";

@Controller("public/services")
export class PublicServicesController {
  constructor(
    private readonly servicesService: ServicesService,
  ) {}

  @Get()
  findAll() {
    return this.servicesService.findPublic();
  }
}