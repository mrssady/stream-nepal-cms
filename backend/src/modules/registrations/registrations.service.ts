import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateRegistrationDto } from './dto/create-registration.dto';
import { UpdateRegistrationDto } from './dto/update-registration.dto';

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createRegistrationDto: CreateRegistrationDto) {
    const tournament = await this.prisma.tournament.findUnique({
      where: {
        id: createRegistrationDto.tournamentId,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        tournamentId: createRegistrationDto.tournamentId,
        teamName: createRegistrationDto.teamName,
      },
    });

    if (existingRegistration) {
      throw new ConflictException(
        'Team is already registered for this tournament',
      );
    }

    return this.prisma.registration.create({
      data: createRegistrationDto,
      include: {
        tournament: true,
      },
    });
  }

  async findAll() {
    return this.prisma.registration.findMany({
      include: {
        tournament: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const registration = await this.prisma.registration.findUnique({
      where: {
        id,
      },
      include: {
        tournament: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    return registration;
  }

  async update(id: string, updateRegistrationDto: UpdateRegistrationDto) {
    await this.findOne(id);

    if (updateRegistrationDto.tournamentId) {
      const tournament = await this.prisma.tournament.findUnique({
        where: {
          id: updateRegistrationDto.tournamentId,
        },
      });

      if (!tournament) {
        throw new NotFoundException('Tournament not found');
      }
    }

    return this.prisma.registration.update({
      where: {
        id,
      },
      data: updateRegistrationDto,
      include: {
        tournament: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.registration.delete({
      where: {
        id,
      },
    });
  }
}
