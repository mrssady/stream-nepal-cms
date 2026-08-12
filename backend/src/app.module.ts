import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { PrismaModule } from "./prisma/prisma.module";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { TeamModule } from "./modules/team/team.module";
import { TournamentsModule } from "./modules/tournaments/tournaments.module";
import { RegistrationsModule } from "./modules/registrations/registrations.module";
import { TournamentTeamsModule } from "./modules/tournament-teams/tournament-teams.module";
import { PlayersModule } from "./modules/players/players.module";
import { MatchesModule } from "./modules/matches/matches.module";
import { SettingsModule } from "./modules/settings/settings.module";
import { MediaModule } from "./modules/media/media.module";
import { ServicesModule } from "./modules/services/services.module";
import { ProjectsModule } from "./modules/projects/projects.module";
import { EventsModule } from "./modules/events/events.module";
import { EventSeriesModule } from "./modules/event-series/event-series.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    PrismaModule,

    AuthModule,
    UsersModule,
    DashboardModule,
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}