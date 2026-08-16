import { Module } from '@nestjs/common';

import { MediaController } from './media.controller';
import { PublicMediaController } from './public-media.controller';
import { MediaService } from './media.service';
import { MediaStorageService } from './media-storage.service';
import { LocalStorageService } from './storage/local-storage.service';
import { CloudinaryStorageService } from './storage/cloudinary-storage.service';

@Module({
  controllers: [MediaController, PublicMediaController],
  providers: [
    MediaService,
    MediaStorageService,
    LocalStorageService,
    CloudinaryStorageService,
  ],
})
export class MediaModule {}
