import Konva from "konva";
import type { ImageShape, LineShape, RectShape } from "../types";

export type CanvasJson = Readonly<{
  stage?: Readonly<{ position?: { x: number; y: number }; scale?: number; width?: number; height?: number }>;
  rects?: ReadonlyArray<RectShape>;
  images?: ReadonlyArray<ImageShape>;
  lines?: ReadonlyArray<LineShape>;
}>;

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

export async function exportJsonToImage(json: CanvasJson): Promise<string> {
  const width = json.stage?.width ?? 800;
  const height = json.stage?.height ?? 600;
  const container = document.createElement("div");
  const stage = new Konva.Stage({ container, width, height });

  // Background layer
  const bgLayer = new Konva.Layer({ listening: false });
  const bgRect = new Konva.Rect({ x: 0, y: 0, width, height, fill: "#ffffff", listening: false });
  bgLayer.add(bgRect);
  stage.add(bgLayer);

  // Rects as edge-colored outlines
  const rectLayer = new Konva.Layer({ listening: false });
  for (const r of json.rects ?? []) {
    // Top
    rectLayer.add(new Konva.Line({ points: [r.x, r.y, r.x + r.width, r.y], stroke: r.edges.top, listening: false }));
    // Right
    rectLayer.add(new Konva.Line({ points: [r.x + r.width, r.y, r.x + r.width, r.y + r.height], stroke: r.edges.right, listening: false }));
    // Bottom
    rectLayer.add(new Konva.Line({ points: [r.x + r.width, r.y + r.height, r.x, r.y + r.height], stroke: r.edges.bottom, listening: false }));
    // Left
    rectLayer.add(new Konva.Line({ points: [r.x, r.y + r.height, r.x, r.y], stroke: r.edges.left, listening: false }));
  }
  stage.add(rectLayer);

  // Lines
  const linesLayer = new Konva.Layer({ listening: false });
  for (const ln of json.lines ?? []) {
    if (ln.kind === "v") {
      linesLayer.add(new Konva.Line({ points: [ln.at, -100000, ln.at, 100000], stroke: "#94a3b8", dash: [6, 4], listening: false }));
    } else {
      linesLayer.add(new Konva.Line({ points: [-100000, ln.at, 100000, ln.at], stroke: "#94a3b8", dash: [6, 4], listening: false }));
    }
  }
  stage.add(linesLayer);

  // Images
  const imgLayer = new Konva.Layer();
  const images = json.images ?? [];
  for (const im of images) {
    try {
      const el = await loadHtmlImage(im.src);
      const node = new Konva.Image({ x: im.x, y: im.y, width: im.width, height: im.height, image: el, listening: false });
      imgLayer.add(node);
    } catch {
      // ignore failures
    }
  }
  stage.add(imgLayer);

  stage.draw();
  const url = stage.toDataURL({ pixelRatio: 2, mimeType: "image/png" });
  stage.destroy();
  return url;
}

