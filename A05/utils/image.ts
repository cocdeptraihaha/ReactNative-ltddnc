import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export async function resizeToSquare500(uri: string, width?: number | null, height?: number | null) {
  const w = width ?? 0;
  const h = height ?? 0;

  const actions =
    w > 0 && h > 0
      ? [
          {
            crop: (() => {
              const side = Math.min(w, h);
              const originX = Math.max(0, Math.floor((w - side) / 2));
              const originY = Math.max(0, Math.floor((h - side) / 2));
              return { originX, originY, width: side, height: side };
            })(),
          },
          { resize: { width: 500, height: 500 } },
        ]
      : [{ resize: { width: 500, height: 500 } }];

  return manipulateAsync(uri, actions as any, {
    compress: 0.9,
    format: SaveFormat.JPEG,
  });
}

