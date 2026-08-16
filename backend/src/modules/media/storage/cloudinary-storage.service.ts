import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

import { StorageService, UploadResult } from './storage.interface';

@Injectable()
export class CloudinaryStorageService implements StorageService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.getOrThrow<string>(
        'CLOUDINARY_CLOUD_NAME',
      ),
      api_key: this.configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.getOrThrow<string>(
        'CLOUDINARY_API_SECRET',
      ),
    });
  }

  async upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const resourceType = this.getResourceType(file.mimetype);

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `stream-nepal/${this.sanitizeFolder(folder)}`,
          resource_type: resourceType,
          use_filename: false,
          unique_filename: true,
        },
        (error, uploadResult) => {
          if (error) {
            reject(error);
            return;
          }

          if (!uploadResult) {
            reject(new Error('Cloudinary upload failed'));
            return;
          }

          resolve(uploadResult);
        },
      );

      stream.end(file.buffer);
    });

    return {
      provider: 'cloudinary',
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type as 'image' | 'video' | 'raw',
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: result.width,
      height: result.height,
    };
  }

  async delete(
    publicId: string,
    resourceType: 'image' | 'video' | 'raw',
  ): Promise<void> {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }

  private sanitizeFolder(folder: string): string {
    return folder
      .replace(/\\/g, '/')
      .replace(/\.\./g, '')
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9/_-]/g, '');
  }

  private getResourceType(mimeType: string): 'image' | 'video' | 'raw' {
    if (mimeType.startsWith('image/')) {
      return 'image';
    }

    if (mimeType.startsWith('video/')) {
      return 'video';
    }

    return 'raw';
  }
}
