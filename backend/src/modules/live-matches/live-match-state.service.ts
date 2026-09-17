import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { TournamentGame, ScoringRule } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { LiveMatchScoringService } from './live-match-scoring.service';
import { MatchState } from './types/match-state.interface';

@Injectable()
export class LiveMatchStateService {
  private readonly logger = new Logger(LiveMatchStateService.name);

  private readonly cache = new Map<string, MatchState>();
  private readonly chains = new Map<string, Promise<unknown>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly scoring: LiveMatchScoringService,
  ) {}

  runExclusive<T>(matchId: string, task: () => Promise<T>): Promise<T> {
    const previous = this.chains.get(matchId) ?? Promise.resolve();

    const next = previous.then(task, task);

    this.chains.set(
      matchId,
      next.then(
        () => undefined,
        () => undefined,
      ),
    );

    return next;
  }

  async findMatch(matchId: string) {
    const match = await this.prisma.liveMatch.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            game: true,
            scoringRuleId: true,
          },
        },
      },
    });

    if (!match) {
      throw new NotFoundException('Live match not found');
    }

    return match;
  }

  private async resolveRule(tournament: {
    game: TournamentGame;
    scoringRuleId: string | null;
  }): Promise<ScoringRule | null> {
    if (tournament.scoringRuleId) {
      const rule = await this.prisma.scoringRule.findUnique({
        where: { id: tournament.scoringRuleId },
      });

      if (rule) {
        return rule;
      }
    }

    return this.prisma.scoringRule.findFirst({
      where: {
        isDefault: true,
        game: tournament.game,
      },
    });
  }

  async compute(matchId: string): Promise<MatchState> {
    const match = await this.findMatch(matchId);
    const rule = await this.resolveRule(match.tournament);

    const events = await this.prisma.matchEvent.findMany({
      where: { matchId },
      orderBy: { seq: 'asc' },
    });

    return this.scoring.computeState(match, rule, events);
  }

  async getState(matchId: string): Promise<MatchState> {
    const cached = this.cache.get(matchId);

    if (cached) {
      return cached;
    }

    const state = await this.recompute(matchId);
    return state;
  }

  async recompute(matchId: string): Promise<MatchState> {
    const state = await this.compute(matchId);
    this.cache.set(matchId, state);
    return state;
  }

  invalidate(matchId: string): void {
    this.cache.delete(matchId);
  }
}
