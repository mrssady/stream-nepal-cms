"use client";

import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import api from "@/services/api";

type UploadResult = {
  provider: "local" | "cloudinary";
  url: string;
  publicId: string;
  resourceType: "image" | "video" | "raw";
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
};

type ImageUploadProps = {
  value?: string;
  folder?: string;
  onChange: (
    result: UploadResult | null,
  ) => void;
  disabled?: boolean;
};

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function ImageUpload({
  value,
  folder = "general",
  onChange,
  disabled = false,
}: ImageUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleFile(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    setError("");

    if (
      !ALLOWED_TYPES.includes(
        file.type,
      )
    ) {
      setError(
        "Only JPG, PNG, WebP and GIF images are allowed.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Image must be smaller than 10 MB.",
      );
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("file", file);

      const response = await api.post(
  `/media/upload?folder=${encodeURIComponent(
    folder,
  )}`,
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  },
);

      const result: UploadResult =
        response.data.data.data;

      onChange(result);
    } catch (err) {
      console.error(err);

      setError(
        "Image upload failed. Please try again.",
      );
      onChange(null);
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        disabled={
          disabled || uploading
        }
        className="hidden"
      />

      <div className="flex items-center gap-4">
        {value ? (
          <img
            src={value}
            alt="Uploaded preview"
            className="h-24 w-24 rounded-xl border object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed text-xs text-slate-400">
            No image
          </div>
        )}

        <button
          type="button"
          disabled={
            disabled || uploading
          }
          onClick={() =>
            inputRef.current?.click()
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading
            ? "Uploading..."
            : value
            ? "Change Image"
            : "Upload Image"}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        JPG, PNG, WebP or GIF · Max 10 MB
      </p>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
