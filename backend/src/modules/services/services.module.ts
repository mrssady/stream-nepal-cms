import { Module } from "@nestjs/common";

import { ServicesController } from "./services.controller";
import { ServicesService } from "./services.service";
import { PublicServicesController } from "./public-services.controller";

@Module({
  controllers: [ServicesController,PublicServicesController,],
  providers: [ServicesService],
})
export class ServicesModule {}