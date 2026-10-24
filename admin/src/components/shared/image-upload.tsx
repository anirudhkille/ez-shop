"use client";

import { useCallback, useState } from "react";

import Image from "next/image";

import { useDropzone } from "react-dropzone";

import { toast } from "sonner";

import {
  Crop,
  Loader2,
  Trash2Icon,
  UploadIcon,
  Wand2,
} from "lucide-react";

import { uploadImage } from "@/lib/cloudinary";
import { cropImage, removeImageBackground } from "@/lib/image-editing";

import { Button } from "../ui/button";
import { Label } from "../ui/label";

import { ImageCropDialog } from "./image-crop-dialog";

interface ImageUploadProps {
  onUploadSuccess: (urls: string[]) => void;
  initialImages?: string[];
  folder?: string;
  enableEditing?: boolean;
}

type BusyAction = "crop" | "background";

interface BusyState {
  index: number;
  action: BusyAction;
}

export function ImageUpload({
  onUploadSuccess,
  initialImages = [],
  folder = "ez-shop/products",
  enableEditing = false,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(initialImages);
  const [busy, setBusy] = useState<BusyState | null>(null);
  const [cropIndex, setCropIndex] = useState<number | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadPromises = acceptedFiles.map(async (file) => {
        try {
          return await uploadImage(file, {
            folder,
            filename: file.name,
          });
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Image upload failed"
          );
          return null;
        }
      });

      const uploadedUrls = (await Promise.all(uploadPromises)).filter(
        Boolean
      ) as string[];

      if (uploadedUrls.length > 0) {
        const newPreviews = [...previews, ...uploadedUrls];
        setPreviews(newPreviews);
        onUploadSuccess(newPreviews);
      }
    },
    [previews, onUploadSuccess, folder]
  );

  const replaceImage = (index: number, url: string) => {
    const updated = previews.map((image, i) => (i === index ? url : image));
    setPreviews(updated);
    onUploadSuccess(updated);
  };

  const removeImage = (index: number) => {
    const updated = previews.filter((_, i) => i !== index);
    setPreviews(updated);
    onUploadSuccess(updated);
  };

  const handleRemoveBackground = async (index: number) => {
    setBusy({ index, action: "background" });
    const toastId = toast.loading(
      "Removing background... the first run downloads the model"
    );

    try {
      const blob = await removeImageBackground(previews[index]);
      const url = await uploadImage(blob, {
        folder,
        filename: "background-removed.png",
      });
      replaceImage(index, url);
      toast.success("Background removed", { id: toastId });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove background",
        { id: toastId }
      );
    } finally {
      setBusy(null);
    }
  };

  const handleCrop = async (area: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => {
    if (cropIndex === null) return;

    const index = cropIndex;
    setBusy({ index, action: "crop" });

    try {
      const blob = await cropImage(previews[index], area);
      const url = await uploadImage(blob, {
        folder,
        filename: "cropped.png",
      });
      replaceImage(index, url);
      setCropIndex(null);
      toast.success("Image cropped");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not crop the image"
      );
    } finally {
      setBusy(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  return (
    <div className="w-full space-y-3">
      <Label>Images</Label>

      <div
        {...getRootProps()}
        className="cursor-pointer rounded-lg border-2 border-dashed p-6 text-center"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full border p-3">
              <UploadIcon
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="text-gray-600">Drop the images here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full border p-3">
              <UploadIcon
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="text-gray-500">
              Drag & drop images here, or click to select
            </p>
          </div>
        )}
      </div>
      {previews.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {previews.map((src, index) => {
            const isBusy = busy?.index === index;

            return (
              <div key={`${src}-${index}`} className="relative w-fit">
                <Image
                  src={src}
                  alt="Preview"
                  height={120}
                  width={120}
                  className="size-24 rounded-lg border bg-muted object-contain"
                />
                {isBusy ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : null}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1 size-6"
                  aria-label="Remove image"
                  disabled={busy !== null}
                  onClick={() => removeImage(index)}
                >
                  <Trash2Icon className="size-4" />
                </Button>
                {enableEditing ? (
                  <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 p-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="size-6"
                      aria-label="Crop image"
                      title="Crop image"
                      disabled={busy !== null}
                      onClick={() => setCropIndex(index)}
                    >
                      <Crop className="size-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      className="size-6"
                      aria-label="Remove background"
                      title="Remove background"
                      disabled={busy !== null}
                      onClick={() => handleRemoveBackground(index)}
                    >
                      <Wand2 className="size-3.5" />
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {enableEditing && cropIndex !== null ? (
        <ImageCropDialog
          key={previews[cropIndex]}
          open
          image={previews[cropIndex]}
          busy={busy?.action === "crop"}
          onOpenChange={(open) => {
            if (!open) setCropIndex(null);
          }}
          onCropped={handleCrop}
        />
      ) : null}
    </div>
  );
}
