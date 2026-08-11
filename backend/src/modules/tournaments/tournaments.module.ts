import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { PublicTournamentsController } from "./public-tournaments.controller";

@Module({
  imports: [PrismaModule],
  controllers: [TournamentsController, PublicTournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}