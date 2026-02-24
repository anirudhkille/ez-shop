"use client";

import { UploadIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import Image from "next/image";

interface ImageUploadProps {
  onUploadSuccess: (urls: string[]) => void;
  initialImages?: string[];
}

export function ImageUpload({
  onUploadSuccess,
  initialImages = [],
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>(initialImages);

  useEffect(() => {
    if (initialImages.length > 0) {
      setPreviews(initialImages);
    }
  }, [initialImages]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_UPLOAD_PRESET!
        );

        try {
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );
          const data = await res.json();
          return data.secure_url;
        } catch (error) {
          console.error("Upload error:", error);
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
    [previews, onUploadSuccess]
  );

  const removeImage = (url: string) => {
    const updatedImages = previews.filter((img) => img !== url);
    setPreviews(updatedImages);
    onUploadSuccess(updatedImages);
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
        className="p-6 text-center border-2 border-dashed rounded-lg cursor-pointer"
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 border rounded-full">
              <UploadIcon
                className="size-7 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <p className="text-gray-600">Drop the images here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="p-3 border rounded-full">
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
          {previews.map((src, index) => (
            <div key={index} className="relative w-fit">
              <Image
                src={src}
                alt="Preview"
                height={120}
                width={120}
                className="object-cover rounded-lg size-24"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 size-6"
                onClick={() => removeImage(src)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
