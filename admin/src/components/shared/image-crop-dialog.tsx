"use client";

import { useCallback, useState } from "react";

import Cropper, { type Area } from "react-easy-crop";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ImageCropDialogProps {
  open: boolean;
  image: string;
  busy?: boolean;
  onOpenChange: (open: boolean) => void;
  onCropped: (area: Area) => void | Promise<void>;
}

export function ImageCropDialog({
  open,
  image,
  busy = false,
  onOpenChange,
  onCropped,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<Area | null>(null);

  const handleCropComplete = useCallback((_area: Area, pixels: Area) => {
    setArea(pixels);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Drag to reposition and zoom until the product fits the square frame.
          </DialogDescription>
        </DialogHeader>

        <div className="relative h-80 w-full overflow-hidden rounded-md bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            objectFit="contain"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="crop-zoom">Zoom</Label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={busy}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => area && onCropped(area)}
            disabled={!area || busy}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
