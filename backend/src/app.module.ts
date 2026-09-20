import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { OrganizationResolveInterceptor } from './modules/organizations/organization-resolve.interceptor';
import { TeamModule } from './modules/team/team.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { RegistrationsModule } from './modules/registrations/registrations.module';
import { TournamentTeamsModule } from './modules/tournament-teams/tournament-teams.module';
import { PlayersModule } from './modules/players/players.module';
import { MatchesModule } from './modules/matches/matches.module';
import { SettingsModule } from './modules/settings/settings.module';
import { MediaModule } from './modules/media/media.module';
import { ServicesModule } from './modules/services/services.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { EventsModule } from './modules/events/events.module';
import { EventSeriesModule } from './modules/event-series/event-series.module';
import { SponsorsModule } from './modules/sponsors/sponsors.module';
import { RolesModule } from './modules/roles/roles.module';
import { ActivityLogsModule } from './modules/activity-logs/activity-logs.module';
import { LiveMatchesModule } from './modules/live-matches/live-matches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    PrismaModule,

    AuthModule,
    UsersModule,
    DashboardModule,
    OrganizationsModule,
    TeamModule,

    TournamentsModule,
    RegistrationsModule,
    TournamentTeamsModule,
    PlayersModule,
    MatchesModule,

    SettingsModule,
    MediaModule,
    ServicesModule,
    ProjectsModule,
    EventsModule,
    EventSeriesModule,
    SponsorsModule,

    RolesModule,
    ActivityLogsModule,
    LiveMatchesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: OrganizationResolveInterceptor,
    },
  ],
})
export class AppModule {}
