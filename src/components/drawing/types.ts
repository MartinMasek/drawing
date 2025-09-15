import type { RefObject } from "react";

export type Point = Readonly<{ x: number; y: number }>;

export type RectDraft = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Edge = "left" | "right" | "top" | "bottom" | null;
export type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right" | null;
export type EdgeName = Exclude<Edge, null>;
export type CornerName = Exclude<Corner, null>;

export type EdgeColors = Readonly<{ left: string; right: string; top: string; bottom: string }>;
export type CornerColors = Readonly<{ "top-left": string; "top-right": string; "bottom-left": string; "bottom-right": string }>;

export type CornerClips = Readonly<{ "top-left": number; "top-right": number; "bottom-left": number; "bottom-right": number }>;
export type CornerRadii = Readonly<{ "top-left": number; "top-right": number; "bottom-left": number; "bottom-right": number }>;

export type RectShape = RectDraft & { id: string; edges: EdgeColors; corners: CornerColors; clips?: CornerClips; radii?: CornerRadii };

export type ImageShape = Readonly<{
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  parentRectId?: string;
}>;

export type DragDirection = "right" | "left" | "up" | "down" | null;

export type InteractionMode = "edge" | "edge-new" | "corner" | "corner-new" | "sink" | "line";
export type ToolMode = "rect" | "image";

export type ContextMenuTarget =
  | { kind: "edge"; edge: Exclude<Edge, null> }
  | { kind: "corner"; corner: Exclude<Corner, null> }
  | { kind: "rect"; scenePoint: Point };

export type ContextMenuState = {
  isOpen: boolean;
  clientX: number; // viewport coordinates for fixed positioning
  clientY: number;
  rectId: string | null;
  target: ContextMenuTarget | null;
};

export type LineShape = Readonly<{ id: string; kind: "v" | "h"; at: number }>;

export type HtmlButtonRef = RefObject<HTMLButtonElement>;


