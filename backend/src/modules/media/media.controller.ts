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
import { ActivityAction, type Organization } from '@prisma/client';

import { MediaService } from './media.service';
import { MediaStorageService } from './media-storage.service';

import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../../common/decorators/current-organization.decorator';
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
    @CurrentOrganization() organization: Organization,
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
      organization.slug,
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
    @CurrentOrganization() organization: Organization,
    @Body() createMediaDto: CreateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const media = await this.mediaService.create(organization, createMediaDto);

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
  findAll(@CurrentOrganization() organization: Organization) {
    return this.mediaService.findAll(organization);
  }

  @Get(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  findOne(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
  ) {
    return this.mediaService.findOne(organization, id);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @Body() updateMediaDto: UpdateMediaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const media = await this.mediaService.update(
      organization,
      id,
      updateMediaDto,
    );

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
    @CurrentOrganization() organization: Organization,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const existing = await this.mediaService.findOne(organization, id);
    const media = await this.mediaService.remove(organization, id);

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
