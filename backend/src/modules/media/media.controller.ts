import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ActivityAction } from '@prisma/client';

import { MediaService } from './media.service';
import { MediaStorageService } from './media-storage.service';

import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
];

@Controller('media')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly mediaStorageService: MediaStorageService,
    private readonly activityLogs: ActivityLogsService,
  ) {}

  @Post('upload')
  @Roles(Role.OWNER, Role.ADMIN)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (_request, file, callback) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(new BadRequestException('Unsupported file type.'), false);
          return;
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile()
    file: Express.Multer.File,
    @Query('folder')
    folder?: string,
    @CurrentUser() user?: AuthenticatedUser,
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    const result = await this.mediaStorageService.upload(
      file,
      folder || 'general',
    );

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'media',
      null,
      `Uploaded "${file.originalname}" to ${folder || 'general'}`,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body() createMediaDto: CreateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const media = await this.mediaService.create(createMediaDto);

    await this.activityLogs.record(
      user,
      ActivityAction.CREATE,
      'media',
      media.id,
      `Added media "${media.title || 'Untitled'}"`,
    );

    return media;
  }

  @Get()
  @Roles(Role.OWNER, Role.ADMIN)
  findAll() {
    return this.mediaService.findAll();
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.mediaService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const media = await this.mediaService.update(id, updateMediaDto);

    await this.activityLogs.record(
      user,
      ActivityAction.UPDATE,
      'media',
      media.id,
      `Updated media "${media.title || 'Untitled'}"`,
    );

    return media;
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.mediaService.findOne(id);
    const media = await this.mediaService.remove(id);

    await this.activityLogs.record(
      user,
      ActivityAction.DELETE,
      'media',
      media.id,
      `Removed media "${existing.title || 'Untitled'}"`,
    );

    return media;
  }
}
