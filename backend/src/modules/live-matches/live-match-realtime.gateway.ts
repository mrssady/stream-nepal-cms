import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Logger } from '@nestjs/common';

import { Server, Socket } from 'socket.io';

import { LiveMatchStateService } from './live-match-state.service';
import { MatchEventRecord } from './types/match-state.interface';

const STATE_DEBOUNCE_MS = 100;

@WebSocketGateway({
  namespace: '/live',
  cors: {
    origin: true,
    credentials: true,
  },
})
export class LiveMatchRealtimeGateway {
  private readonly logger = new Logger(LiveMatchRealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  private readonly pendingState = new Map<string, NodeJS.Timeout>();

  constructor(private readonly stateService: LiveMatchStateService) {}

  private room(matchId: string): string {
    return `live:${matchId}`;
  }

  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, matchId: string): Promise<void> {
    if (typeof matchId !== 'string' || matchId.length === 0) {
      return;
    }

    void client.join(this.room(matchId));

    try {
      const state = await this.stateService.getState(matchId);
      client.emit('match:init', { state });
    } catch (error) {
      this.logger.warn(
        `Socket subscribe failed for ${matchId}: ${(error as Error).message}`,
      );
    }
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(client: Socket, matchId: string): void {
    if (typeof matchId !== 'string') {
      return;
    }

    void client.leave(this.room(matchId));
  }

  handleDisconnect(client: Socket): void {
    client.rooms.forEach((room) => {
      if (room.startsWith('live:')) {
        void client.leave(room);
      }
    });
  }

  emitEvent(matchId: string, event: MatchEventRecord): void {
    this.server.to(this.room(matchId)).emit('match:event', event);
  }

  emitAnalysis(matchId: string, payload: unknown): void {
    this.server.to(this.room(matchId)).emit('match:ocr:analysis', payload);
  }

  notify(matchId: string): void {
    const existing = this.pendingState.get(matchId);

    if (existing) {
      clearTimeout(existing);
    }

    const timer = setTimeout(() => {
      this.pendingState.delete(matchId);

      void this.stateService
        .getState(matchId)
        .then((state) => {
          this.server.to(this.room(matchId)).emit('match:state', state);
        })
        .catch((error) => {
          this.logger.warn(
            `State broadcast failed for ${matchId}: ${(error as Error).message}`,
          );
        });
    }, STATE_DEBOUNCE_MS);

    this.pendingState.set(matchId, timer);
  }
}
