import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import {
  StorageProvider,
  StorageService,
  UploadResult,
} from "./storage/storage.interface";
import { LocalStorageService } from "./storage/local-storage.service";
import { CloudinaryStorageService } from "./storage/cloudinary-storage.service";

@Injectable()
export class MediaService {
  private readonly provider: StorageProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly localStorage: LocalStorageService,
    private readonly cloudinaryStorage: CloudinaryStorageService,
  ) {
    this.provider =
      this.configService.get<StorageProvider>(
        "STORAGE_PROVIDER",
        "local",
      );
  }

  private getStorage(): StorageService {
    if (this.provider === "cloudinary") {
      return this.cloudinaryStorage;
    }

    if (this.provider === "local") {
      return this.localStorage;
    }

    throw new BadRequestException(
      `Unsupported storage provider: ${this.provider}`,
    );
  }

  async upload(
    file: Express.Multer.File,
    folder = "general",
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException(
        "File is required",
      );
    }

    return this.getStorage().upload(
      file,
      folder,
    );
  }

  async delete(
    publicId: string,
    resourceType:
      | "image"
      | "video"
      | "raw" = "image",
  ): Promise<void> {
    if (!publicId) {
      throw new BadRequestException(
        "Public ID is required",
      );
    }

    await this.getStorage().delete(
      publicId,
      resourceType,
    );
  }
}