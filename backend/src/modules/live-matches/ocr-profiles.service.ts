import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TournamentGame } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

import { CreateOcrProfileDto } from './dto/create-ocr-profile.dto';
import { UpdateOcrProfileDto } from './dto/update-ocr-profile.dto';

@Injectable()
export class OcrProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOcrProfileDto) {
    const existing = await this.prisma.ocrProfile.findUnique({
      where: {
        game_name: {
          game: dto.game,
          name: dto.name,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        'An OCR profile with this name already exists for the game',
      );
    }

    const totalForGame = await this.prisma.ocrProfile.count({
      where: {
        game: dto.game,
      },
    });

    const makeDefault = dto.isDefault ?? totalForGame === 0;

    if (makeDefault) {
      await this.prisma.ocrProfile.updateMany({
        where: {
          game: dto.game,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return this.prisma.ocrProfile.create({
      data: {
        game: dto.game,
        name: dto.name,
        width: dto.width,
        height: dto.height,
        config: dto.config,
        isDefault: makeDefault,
      },
    });
  }

  async findAll(game?: TournamentGame) {
    return this.prisma.ocrProfile.findMany({
      where: game
        ? {
            game,
          }
        : undefined,
      orderBy: [
        {
          game: 'asc',
        },
        {
          isDefault: 'desc',
        },
        {
          name: 'asc',
        },
      ],
    });
  }

  async findOne(id: string) {
    const profile = await this.prisma.ocrProfile.findUnique({
      where: {
        id,
      },
    });

    if (!profile) {
      throw new NotFoundException('OCR profile not found');
    }

    return profile;
  }

  async update(id: string, dto: UpdateOcrProfileDto) {
    const profile = await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.ocrProfile.findUnique({
        where: {
          game_name: {
            game: dto.game ?? profile.game,
            name: dto.name,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          'An OCR profile with this name already exists for the game',
        );
      }
    }

    const data: Prisma.OcrProfileUpdateInput = {};

    if (dto.game !== undefined) {
      data.game = dto.game;
    }

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.width !== undefined) {
      data.width = dto.width;
    }

    if (dto.height !== undefined) {
      data.height = dto.height;
    }

    if (dto.config !== undefined) {
      data.config = dto.config;
    }

    if (dto.isDefault !== undefined) {
      if (dto.isDefault) {
        await this.prisma.ocrProfile.updateMany({
          where: {
            game: dto.game ?? profile.game,
            isDefault: true,
            NOT: {
              id,
            },
          },
          data: {
            isDefault: false,
          },
        });
      } else {
        const defaultCount = await this.prisma.ocrProfile.count({
          where: {
            game: dto.game ?? profile.game,
            isDefault: true,
            NOT: {
              id,
            },
          },
        });

        if (defaultCount === 0) {
          throw new ConflictException(
            'A game must keep at least one default OCR profile',
          );
        }
      }

      data.isDefault = dto.isDefault;
    }

    return this.prisma.ocrProfile.update({
      where: {
        id,
      },
      data,
    });
  }

  async setDefault(id: string) {
    const profile = await this.findOne(id);

    await this.prisma.$transaction([
      this.prisma.ocrProfile.updateMany({
        where: {
          game: profile.game,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      }),
      this.prisma.ocrProfile.update({
        where: {
          id,
        },
        data: {
          isDefault: true,
        },
      }),
    ]);

    return this.findOne(id);
  }

  async remove(id: string) {
    const profile = await this.findOne(id);

    const defaultCount = await this.prisma.ocrProfile.count({
      where: {
        game: profile.game,
        isDefault: true,
      },
    });

    if (profile.isDefault && defaultCount <= 1) {
      throw new ConflictException(
        'Cannot delete the last default OCR profile for the game',
      );
    }

    return this.prisma.ocrProfile.delete({
      where: {
        id,
      },
    });
  }
}
