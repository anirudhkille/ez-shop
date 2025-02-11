"use client";

import { UploadIcon, Trash2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import Image from "next/image";

interface ImageUploadProps {
  onUploadSuccess: (url: string) => void;
  initialImage?: string;
}

export function ImageUpload({
  onUploadSuccess,
  initialImage,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);

  useEffect(() => {
    if (initialImage) {
      setPreview(initialImage);
    }
  }, [initialImage]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_UPLOAD_PRESET!);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          setPreview(data.secure_url);
          onUploadSuccess(data.secure_url);
        }
      } catch (error) {
        console.error("Upload error:", error);
      }
    },
    [onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <div className="w-full space-y-3">
      <Label>Images</Label>

      {preview ? (
        <div className="relative w-fit">
          <Image src={preview} alt="Preview" height={288} width={288} className="rounded-lg size-72" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 size-10"
            onClick={() => setPreview(null)}
          >
            <Trash2Icon className="size-5" />
          </Button>
        </div>
      ) : (
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
              <p className="text-gray-600">Drop the image here...</p>
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
                Drag & drop an image here, or click to select one
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
