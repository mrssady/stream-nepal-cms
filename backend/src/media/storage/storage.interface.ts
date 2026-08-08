import type { Express } from "express";

export type StorageProvider =
  "local" | "cloudinary";

export type ResourceType =
  "image" | "video" | "raw";

export interface UploadResult {
  provider: StorageProvider;
  url: string;
  publicId: string;
  resourceType: ResourceType;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface StorageService {
  upload(
    file: Express.Multer.File,
    folder: string,
  ): Promise<UploadResult>;

  delete(
    publicId: string,
    resourceType: ResourceType,
  ): Promise<void>;
}