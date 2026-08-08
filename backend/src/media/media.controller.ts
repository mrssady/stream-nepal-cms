import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileInterceptor,
} from "@nestjs/platform-express";
import { memoryStorage } from "multer";

import { MediaService } from "./media.service";

// Use your existing auth guard here if your project
// already has one. Do not create a duplicate guard.
import { JwtAuthGuard } from "../modules/auth/jwt-auth.guard";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];

@Controller("media")
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
  ) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (
        _request,
        file,
        callback,
      ) => {
        if (
          !ALLOWED_MIME_TYPES.includes(
            file.mimetype,
          )
        ) {
          callback(
            new BadRequestException(
              "Unsupported file type.",
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile()
    file: Express.Multer.File,
    @Query("folder")
    folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        "File is required.",
      );
    }

    const result =
      await this.mediaService.upload(
        file,
        folder || "general",
      );

    return {
      success: true,
      data: result,
    };
  }

  @Delete(":publicId")
  async delete(
    @Param("publicId")
    publicId: string,
    @Query("resourceType")
    resourceType:
      | "image"
      | "video"
      | "raw" = "image",
  ) {
    await this.mediaService.delete(
      publicId,
      resourceType,
    );

    return {
      success: true,
      message: "Media deleted successfully",
    };
  }
}