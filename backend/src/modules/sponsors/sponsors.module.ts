import { Module } from '@nestjs/common';

import { SponsorsController } from './sponsors.controller';
import { SponsorsService } from './sponsors.service';
import { PublicSponsorsController } from './public-sponsors.controller';

@Module({
  controllers: [SponsorsController, PublicSponsorsController],
  providers: [SponsorsService],
})
export class SponsorsModule {}
