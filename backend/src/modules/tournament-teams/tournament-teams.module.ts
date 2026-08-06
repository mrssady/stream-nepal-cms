import { Module } from '@nestjs/common';

import { PrismaModule } from '../../prisma/prisma.module';

import { TournamentTeamsController } from './tournament-teams.controller';
import { TournamentTeamsService } from './tournament-teams.service';

@Module({
  imports: [PrismaModule],
  controllers: [TournamentTeamsController],
  providers: [TournamentTeamsService],
  exports: [TournamentTeamsService],
})
export class TournamentTeamsModule {}