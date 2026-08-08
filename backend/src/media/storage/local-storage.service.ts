import {
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { existsSync } from "fs";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join, extname } from "path";

import {
  StorageService,
  UploadResult,
} from "./storage.interface";

@Injectable()
export class LocalStorageService
  implements StorageService
{
  private readonly uploadDir: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.uploadDir =
      this.configService.get<string>(
        "UPLOAD_DIR",
        "uploads",
      );
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException(
        "File is required",
      );
    }

    const safeFolder =
      this.sanitizeFolder(folder);

    const extension = extname(
      file.originalname,
    );

    const filename = `${randomUUID()}${extension}`;

    const directory = join(
      process.cwd(),
      this.uploadDir,
      safeFolder,
    );

    if (!existsSync(directory)) {
      await mkdir(directory, {
        recursive: true,
      });
    }

    const filePath = join(
      directory,
      filename,
    );

    await writeFile(
      filePath,
      file.buffer,
    );

    const url = `/${this.uploadDir}/${safeFolder}/${filename}`;

    return {
      provider: "local",
      url,
      publicId: `${safeFolder}/${filename}`,
      resourceType: this.getResourceType(
        file.mimetype,
      ),
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async delete(
    publicId: string,
    _resourceType:
      | "image"
      | "video"
      | "raw",
  ): Promise<void> {
    const safePath =
      this.sanitizePublicId(publicId);

    const filePath = join(
      process.cwd(),
      this.uploadDir,
      safePath,
    );

    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  }

  private sanitizeFolder(
    folder: string,
  ): string {
    return folder
      .replace(/\\/g, "/")
      .replace(/\.\./g, "")
      .replace(/^\/+|\/+$/g, "")
      .replace(/[^a-zA-Z0-9/_-]/g, "");
  }

  private sanitizePublicId(
    publicId: string,
  ): string {
    return publicId
      .replace(/\\/g, "/")
      .replace(/\.\./g, "")
      .replace(/^\/+/, "")
      .replace(/[^a-zA-Z0-9/_.-]/g, "");
  }

  private getResourceType(
    mimeType: string,
  ): "image" | "video" | "raw" {
    if (mimeType.startsWith("image/")) {
      return "image";
    }

    if (mimeType.startsWith("video/")) {
      return "video";
    }

    return "raw";
  }
}