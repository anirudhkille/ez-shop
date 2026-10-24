export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image"));
    image.src = src;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not create the image"));
    }, "image/png");
  });
}

export async function cropImage(
  src: string,
  area: CropArea,
  maxSize = 1200
): Promise<Blob> {
  const image = await loadImage(src);
  const size = Math.min(maxSize, Math.round(area.width), Math.round(area.height));

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not create a canvas context");

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    size,
    size
  );

  return canvasToBlob(canvas);
}

export async function removeImageBackground(src: string): Promise<Blob> {
  const res = await fetch(src);
  if (!res.ok) throw new Error("Could not load the image");

  const blob = await res.blob();
  const { removeBackground } = await import("@imgly/background-removal");

  return removeBackground(blob, {
    model: "isnet_fp16",
    output: { format: "image/png" },
  });
}
