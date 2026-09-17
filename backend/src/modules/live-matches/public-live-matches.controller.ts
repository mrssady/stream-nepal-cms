import { Controller, Get, Param } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { LiveMatchStateService } from './live-match-state.service';
import { SnapshotPayload } from './types/match-state.interface';

@Controller('live-matches')
export class PublicLiveMatchesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateService: LiveMatchStateService,
  ) {}

  @Get(':id/snapshot')
  async snapshot(@Param('id') id: string): Promise<SnapshotPayload> {
    const state = await this.stateService.getState(id);
    const match = await this.stateService.findMatch(id);

    let rule = {
      name: 'Default',
      killPoint: 1,
      booyahBonus: 0,
      placementPoints: {} as Record<string, number>,
    };

    if (match.tournament.scoringRuleId) {
      const scoringRule = await this.prisma.scoringRule.findUnique({
        where: { id: match.tournament.scoringRuleId },
      });

      if (scoringRule) {
        rule = {
          name: scoringRule.name,
          killPoint: scoringRule.killPoint,
          booyahBonus: scoringRule.booyahBonus,
          placementPoints:
            (scoringRule.placementPoints as Record<string, number>) ?? {},
        };
      }
    } else {
      const defaultRule = await this.prisma.scoringRule.findFirst({
        where: {
          isDefault: true,
          game: match.tournament.game,
        },
      });

      if (defaultRule) {
        rule = {
          name: defaultRule.name,
          killPoint: defaultRule.killPoint,
          booyahBonus: defaultRule.booyahBonus,
          placementPoints:
            (defaultRule.placementPoints as Record<string, number>) ?? {},
        };
      }
    }

    return {
      match: {
        id: match.id,
        name: match.name,
        tournamentId: match.tournamentId,
        tournamentName: match.tournament.name,
        game: match.tournament.game,
        matchNumber: match.matchNumber,
        round: match.round,
      },
      rule,
      state,
      participantCount: Object.keys(state.teams).length,
    };
  }

  @Get(':id/events')
  async events(@Param('id') id: string) {
    const state = await this.stateService.getState(id);
    return state.events;
  }
}
