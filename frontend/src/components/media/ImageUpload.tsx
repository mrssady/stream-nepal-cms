"use client";

import {
  Link as LinkIcon,
  Upload,
} from "lucide-react";
import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import api from "@/services/api";

export type UploadResult = {
  provider: "local" | "cloudinary" | "link";
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

function looksLikeImageUrl(
  value: string,
) {
  return (
    /^https?:\/\/.+/i.test(value) ||
    /^\/.+/.test(value)
  );
}

export default function ImageUpload({
  value,
  folder = "general",
  onChange,
  disabled = false,
}: ImageUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [mode, setMode] =
    useState<"upload" | "link">(
      "upload",
    );

  const [link, setLink] = useState(
    value && looksLikeImageUrl(value)
      ? value
      : "",
  );

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  function switchMode(
    next: "upload" | "link",
  ) {
    setMode(next);
    setError("");

    if (next === "link") {
      setLink(
        value && looksLikeImageUrl(value)
          ? value
          : "",
      );
    }
  }

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

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      const response =
        await api.post(
          `/media/upload?folder=${encodeURIComponent(
            folder,
          )}`,
          formData,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
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

  function handleUseLink() {
    const trimmed = link.trim();

    if (!trimmed) {
      setError(
        "Paste an image link to use it.",
      );
      return;
    }

    if (
      !looksLikeImageUrl(
        trimmed,
      )
    ) {
      setError(
        "Enter a valid image link starting with http:// or https://",
      );
      return;
    }

    setError("");

    onChange({
      provider: "link",
      url: trimmed,
      publicId: "",
      resourceType: "image",
      originalName: "",
      mimeType: "",
      size: 0,
    });
  }

  return (
    <div className="space-y-2">
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

      <div className="flex items-start gap-4">
        {value ? (
          <img
            src={value}
            alt="Uploaded preview"
            className="h-24 w-24 rounded-xl border border-slate-300 object-cover dark:border-slate-700"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 dark:border-slate-700 dark:text-slate-500">
            No image
          </div>
        )}

        <div className="flex-1 space-y-2">
          <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700">
            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                switchMode(
                  "upload",
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === "upload"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <Upload size={13} />
              Upload
            </button>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                switchMode(
                  "link",
                )
              }
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                mode === "link"
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              <LinkIcon
                size={13}
              />
              Link
            </button>
          </div>

          {mode === "upload" ? (
            <div>
              <button
                type="button"
                disabled={
                  disabled ||
                  uploading
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

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                JPG, PNG, WebP or GIF ·
                Max 10 MB
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={link}
                onChange={(event) =>
                  setLink(
                    event.target
                      .value,
                  )
                }
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />

              <button
                type="button"
                disabled={disabled}
                onClick={handleUseLink}
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Use Link
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
