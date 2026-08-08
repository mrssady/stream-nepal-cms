import { Module } from "@nestjs/common";

import { MediaController } from "./media.controller";
import { MediaService } from "./media.service";
import { LocalStorageService } from "./storage/local-storage.service";
import { CloudinaryStorageService } from "./storage/cloudinary-storage.service";

@Module({
  controllers: [MediaController],
  providers: [
    MediaService,
    LocalStorageService,
    CloudinaryStorageService,
  ],
  exports: [MediaService],
})
export class MediaModule {}