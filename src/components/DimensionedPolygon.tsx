import {  useCallback, useEffect, useRef, useState } from "react";
import { Layer,  Stage, Text, Group, Rect, Image as KonvaImage, Line } from "react-konva";
import OutlineLayer from "./drawing/layers/OutlineLayer";
import DragOverlayLayer from "./drawing/layers/DragOverlayLayer";
import LabelsLayer from "./drawing/layers/LabelsLayer";
import { useSinkDrag } from "./drawing/hooks/useSinkDrag";
import { useStageNavigation } from "./drawing/hooks/useStageNavigation";
import { useTouchInteractions } from "./drawing/hooks/useTouchInteractions";
import { useContextMenuController } from "./drawing/hooks/useContextMenuController";
import type Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import Toolbar from "./drawing/Toolbar";
import URLImage from "./drawing/URLImage";
import ContextMenu from "./drawing/ContextMenu";
import CornerClipModal from "./drawing/CornerClipModal";
import CornerRadiusModal from "./drawing/CornerRadiusModal";
import DistanceModal from "./drawing/DistanceModal";
import InfoLog from "./drawing/InfoLog";
import { MIN_SIZE, DEFAULT_SIZE, SNAP_TO_ORIGIN, SNAP_SIZE, EDGE_TOLERANCE, IMAGE_OPTIONS, STAGE_WIDTH, STAGE_HEIGHT, L_TURN_MIN_PX, L_TURN_DEADBAND_PX } from "./drawing/constants";
import { generateRandomRects } from "./drawing/utils/dev";
import type { Point, RectDraft, EdgeName, CornerName, RectShape, ImageShape, DragDirection, InteractionMode, ToolMode, ContextMenuState, LineShape } from "./drawing/types";
import { findEdgeAtPointer as htFindEdge, findCornerAtPointer as htFindCorner, findRectAtPoint as htFindRect } from "./drawing/utils/hitTest";
import { draftForDrag as utilDraftForDrag } from "./drawing/utils/draft";
import { collectGroups, getBounds, getGroupRectsForRect } from "./drawing/utils/groups";
import { hitTestBoundsEdge } from "./drawing/utils/edges";
import { exportJsonToImage } from "./drawing/utils/print";
import useImage from "use-image";
import { addRectPathWithCorners } from "./drawing/utils/geometry";
import { useDrawing } from "./header/context/DrawingContext";
import Button from "./header/header/Button";
import { Icon } from "./header/header/Icon";
import { IconDimensions, IconMarquee2, IconPackage, IconTextSize } from "@tabler/icons-react";
import { Divider } from "./header/header/Divider";

export default function SquareStretchCanvas() {
  const [rects, setRects] = useState<RectShape[]>([]);
  const [newRect, setNewRect] = useState<RectDraft | null>(null);
  const [draftSegments, setDraftSegments] = useState<ReadonlyArray<RectDraft>>([]);
  const [draftMetas, setDraftMetas] = useState<ReadonlyArray<{ axis: "h" | "v"; origin: Point; end: Point; dir: 1 | -1 }>>([]);
  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: STAGE_WIDTH, height: STAGE_HEIGHT });
  const {
    stageScale,
    stagePosition,
    toScene,
    getContainerPointerPosition,
    getScenePointerPosition,
    getContainerPointFromEvent,
    zoomAtContainerPoint,
    onWheel: handleWheel,
    beginPan,
    panMove,
    endPan,
    isPanningRef,
    panBy,
  } = useStageNavigation(stageRef);
  const [images, setImages] = useState<ImageShape[]>([]);
  const [lines, setLines] = useState<ReadonlyArray<LineShape>>([]);
  // Seam tool hover preview (single cut line through hovered group)
  const [seamPreview, setSeamPreview] = useState<null | { groupKey: string; orientation: "v" | "h"; at: number; bounds: { left: number; top: number; right: number; bottom: number } }>(null);
  const { zoom: currentZoomLevel, setCanvasActions, setCanvasSetters, setCanvasState } = useDrawing();
  const isDrawing = useRef<boolean>(false);
  const startPoint = useRef<Point | null>(null);
  const direction = useRef<DragDirection>(null);

  // L-shape in-gesture state (mouse only)
  const lTurnCommittedRef = useRef<boolean>(false);
  const currentAxisRef = useRef<"h" | "v">("h");
  const segmentStartRef = useRef<Point | null>(null);

  // id generator for stable keys
  const rectIdCounter = useRef<number>(0);
  const nextRectId = useCallback((): string => {
    rectIdCounter.current += 1;
    return `rect-${rectIdCounter.current}`;
  }, []);

  const imageIdCounter = useRef<number>(0);
  const nextImageId = useCallback((): string => {
    imageIdCounter.current += 1;
    return `img-${imageIdCounter.current}`;
  }, []);
  const lineIdCounter = useRef<number>(0);
  const nextLineId = useCallback((): string => {
    lineIdCounter.current += 1;
    return `line-${lineIdCounter.current}`;
  }, []);

  // context menu state
  const [mode, setMode] = useState<InteractionMode>("edge");
  const [tool, setTool] = useState<ToolMode>("rect");
 
  const [selectedImageSrc, setSelectedImageSrc] = useState<string>(IMAGE_OPTIONS[0].src);
  const popoverButtonRef = useRef<HTMLButtonElement | null>(null);
  const [showLog, setShowLog] = useState<boolean>(false);
  const [editDistance, setEditDistance] = useState<{
    isOpen: boolean;
    rectId: string | null;
    sinkId: string | null;
    value: number;
  }>({ isOpen: false, rectId: null, sinkId: null, value: 0 });
  const [defaultEdgeColor, setDefaultEdgeColor] = useState<string>("#000000");
  const [defaultCornerColor, setDefaultCornerColor] = useState<string>("#000000");
  const rafHandle = useRef<number | null>(null);
  const [clipModal, setClipModal] = useState<{ isOpen: boolean; rectId: string | null; corner: CornerName | null; value: number; max: number }>(
    { isOpen: false, rectId: null, corner: null, value: 0, max: 0 }
  );
  const [radiusModal, setRadiusModal] = useState<{ isOpen: boolean; rectId: string | null; corner: CornerName | null; value: number; max: number }>(
    { isOpen: false, rectId: null, corner: null, value: 0, max: 0 }
  );

  // Vain Match mode state
  const [vainBgSrc, setVainBgSrc] = useState<string | null>(null);
  const [vainBgEl] = useImage(vainBgSrc ?? "");
  const [vainGroupTransforms, setVainGroupTransforms] = useState<Map<string, { x: number; y: number; scale: number; rotation: number }>>(new Map());
  const [vainActiveGroupKey, setVainActiveGroupKey] = useState<string | null>(null);

  useEffect(() => {
    const groups = collectGroups(rects);
    setVainGroupTransforms((prev) => {
      const next = new Map(prev);
      for (const [key] of groups) {
        if (!next.has(key)) next.set(key, { x: 0, y: 0, scale: 1, rotation: 0 });
      }
      // prune removed groups
      for (const key of Array.from(next.keys())) {
        if (!groups.has(key)) next.delete(key);
      }
      return next;
    });
    setVainActiveGroupKey((prev) => {
      if (prev && groups.has(prev)) return prev;
      const first = groups.keys().next().value as string | undefined;
      return first ?? null;
    });
  }, [rects]);

  // Context menu controller (provides menu state and helpers)
  const { menu, setMenu, closeMenu, openAtContainerPoint } = useContextMenuController({
    mode,
    rects,
    toScene: (p) => ({ x: (p.x - stagePosition.x) / stageScale, y: (p.y - stagePosition.y) / stageScale }),
    findImageAtScenePoint: (pt) => {
      for (let i = images.length - 1; i >= 0; i -= 1) {
        const img = images[i];
        if (!img) continue;
        const inside = pt.x >= img.x && pt.x <= img.x + img.width && pt.y >= img.y && pt.y <= img.y + img.height;
        if (inside) return img;
      }
      return null;
    },
    findEdgeAtPointer: (pt) => htFindEdge(rects, pt, EDGE_TOLERANCE),
    findCornerAtPointer: (pt) => htFindCorner(rects, pt, EDGE_TOLERANCE),
  });

  // Sink dragging UX state
  const { sinkDrag, onSinkDragStart, onSinkDragMove, onSinkDragEnd } = useSinkDrag(rects, images, setImages, stageRef);

  useEffect(() => {
    return () => {
      if (rafHandle.current != null) {
        window.cancelAnimationFrame(rafHandle.current);
      }
    };
  }, []);
  useEffect(() => {
    if (menu.isOpen) {
      popoverButtonRef.current?.click();
    }
  }, [menu.isOpen]);

  const draftForDrag = useCallback(
    (origin: Point, dx: number, dy: number, currentDirection: DragDirection): RectDraft =>
      utilDraftForDrag(origin, dx, dy, currentDirection, { SNAP_TO_ORIGIN, DEFAULT_SIZE, MIN_SIZE, SNAP_SIZE }),
    []
  );

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // only respond to left click
    if (e.evt.button !== 0) return;

    // Seam: one-click split at nearest axis inside hovered group
    if (tool === "seam") {
      const p = getScenePointerPosition();
      if (!p) return;
      const groups = collectGroups(rects);
      // find top-most rect under pointer to identify its group
      let hitRect: RectShape | null = null;
      for (let i = rects.length - 1; i >= 0; i -= 1) {
        const r = rects[i];
        if (!r) continue;
        if (p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height) { hitRect = r; break; }
      }
      if (!hitRect) return;
      const gKey = hitRect.groupId ?? `single:${hitRect.id}`;
      const gRects = groups.get(gKey) ?? [hitRect];
      const b = getBounds(gRects);
      // decide cut orientation by closer axis to pointer
      const dxCenter = Math.abs(p.x - (b.left + (b.right - b.left) / 2));
      const dyCenter = Math.abs(p.y - (b.top + (b.bottom - b.top) / 2));
      const orientation: "v" | "h" = dxCenter < dyCenter ? "v" : "h";
      const at = orientation === "v" ? p.x : p.y;
      const newKeyA = `${gKey}-A-${Date.now()}`;
      const newKeyB = `${gKey}-B-${Date.now()}`;

      // Build new rects array with actual geometric splits where needed
      setRects((prev) => {
        const result: RectShape[] = [];
        // map oldRectId -> {aId, bId} for images reassignment
        const splitMap = new Map<string, { aId: string; bId: string }>();
        for (const r of prev) {
          const member = (r.groupId ?? `single:${r.id}`) === gKey;
          if (!member) { result.push(r); continue; }
          if (orientation === "v") {
            const leftEdge = r.x; const rightEdge = r.x + r.width;
            if (rightEdge <= at) {
              result.push({ ...r, groupId: newKeyA });
            } else if (leftEdge >= at) {
              result.push({ ...r, groupId: newKeyB });
            } else {
              // split
              const leftWidth = Math.max(0, at - leftEdge);
              const rightWidth = Math.max(0, rightEdge - at);
              if (leftWidth > 0) {
                const leftRect: RectShape = { ...r, id: nextRectId(), width: leftWidth, groupId: newKeyA };
                result.push(leftRect);
                splitMap.set(r.id, { ...(splitMap.get(r.id) ?? { aId: leftRect.id, bId: "" }), aId: leftRect.id });
              }
              if (rightWidth > 0) {
                const rightRect: RectShape = { ...r, id: nextRectId(), x: at, width: rightWidth, groupId: newKeyB };
                result.push(rightRect);
                splitMap.set(r.id, { ...(splitMap.get(r.id) ?? { aId: "", bId: rightRect.id }), bId: rightRect.id });
              }
            }
          } else {
            const topEdge = r.y; const bottomEdge = r.y + r.height;
            if (bottomEdge <= at) {
              result.push({ ...r, groupId: newKeyA });
            } else if (topEdge >= at) {
              result.push({ ...r, groupId: newKeyB });
            } else {
              // split horizontally
              const topHeight = Math.max(0, at - topEdge);
              const bottomHeight = Math.max(0, bottomEdge - at);
              if (topHeight > 0) {
                const topRect: RectShape = { ...r, id: nextRectId(), height: topHeight, groupId: newKeyA };
                result.push(topRect);
                splitMap.set(r.id, { ...(splitMap.get(r.id) ?? { aId: topRect.id, bId: "" }), aId: topRect.id });
              }
              if (bottomHeight > 0) {
                const bottomRect: RectShape = { ...r, id: nextRectId(), y: at, height: bottomHeight, groupId: newKeyB };
                result.push(bottomRect);
                splitMap.set(r.id, { ...(splitMap.get(r.id) ?? { aId: "", bId: bottomRect.id }), bId: bottomRect.id });
              }
            }
          }
        }
        // Reassign images attached to split rects to the nearest piece
        setImages((imgs) => imgs.map((im) => {
          const pair = im.parentRectId ? splitMap.get(im.parentRectId) : undefined;
          if (!pair) return im;
          if (orientation === "v") {
            const cx = im.x + im.width / 2;
            return { ...im, parentRectId: cx >= at ? (pair.bId || pair.aId) : (pair.aId || pair.bId) };
          }
          const cy = im.y + im.height / 2;
          return { ...im, parentRectId: cy >= at ? (pair.bId || pair.aId) : (pair.aId || pair.bId) };
        }));
        return result;
      });

      // Initialize transforms for new groups from old
      setVainGroupTransforms((prev) => {
        const next = new Map(prev);
        const base = prev.get(gKey) ?? { x: 0, y: 0, scale: 1, rotation: 0 };
        next.set(newKeyA, { ...base });
        next.set(newKeyB, { ...base });
        next.delete(gKey);
        return next;
      });
      setVainActiveGroupKey(newKeyA);
      setSeamPreview(null);
      return;
    }

    // SHIFT + left click => start panning instead of drawing
    if (e.evt.shiftKey) {
      const p = getContainerPointFromEvent(e.evt);
      if (!p) return;
      beginPan(p);
      return;
    }

    // In sink mode, open popover if clicking inside a rect; do not draw
    if (mode === "sink") {
      const containerPoint = getContainerPointFromEvent(e.evt);
      if (!containerPoint) return;
      const scenePoint = toScene(containerPoint);
      // inline image hit-test to avoid forward ref
      const img = (() => {
        for (let i = images.length - 1; i >= 0; i -= 1) {
          const it = images[i];
          if (!it) continue;
          const inside = scenePoint.x >= it.x && scenePoint.x <= it.x + it.width && scenePoint.y >= it.y && scenePoint.y <= it.y + it.height;
          if (inside) return it;
        }
        return null;
      })();
      if (!img) {
      let payload: { rectId: string; target: ContextMenuState["target"] } | null = null;
        for (let i = rects.length - 1; i >= 0; i -= 1) {
          const r = rects[i];
          if (!r) continue;
          const inside = scenePoint.x >= r.x && scenePoint.x <= r.x + r.width && scenePoint.y >= r.y && scenePoint.y <= r.y + r.height;
          if (inside) {
            payload = { rectId: r.id, target: { kind: "rect", scenePoint } };
            break;
          }
        }
        if (!payload) return;
        // delegate to controller
        openAtContainerPoint(containerPoint, e.evt.clientX, e.evt.clientY);
        return;
      }
      return;
    }

    // In edge (both) mode: if clicking inside an existing rect (not image), start dragging that rect
    if (mode === "edge" || mode === "edge-new" || mode === "reshape") {
      const containerPoint = getContainerPointFromEvent(e.evt);
      if (containerPoint) {
        const scenePoint = toScene(containerPoint);
        // inline image hit-test to avoid forward ref
        const img = (() => {
          for (let i = images.length - 1; i >= 0; i -= 1) {
            const it = images[i];
            if (!it) continue;
            const inside = scenePoint.x >= it.x && scenePoint.x <= it.x + it.width && scenePoint.y >= it.y && scenePoint.y <= it.y + it.height;
            if (inside) return it;
          }
          return null;
        })();
        if (!img) {
          const rect = htFindRect(rects, scenePoint);
          if (rect) {
            // Check for group edge resize hit before drag
            const groupRects = getGroupRectsForRect(rects, rect);
            const b = getBounds(groupRects);
            const hit = hitTestBoundsEdge(b, scenePoint, EDGE_TOLERANCE);
            if (hit) {
              beginGroupResize(scenePoint, groupRects, hit, b);
              return;
            }
            // If in reshape mode and not on this group's edge, try other groups' edges
            if (mode === "reshape") {
              const groups = new Map<string | null, ReadonlyArray<RectShape>>();
              for (const r of rects) {
                const key = r.groupId ?? r.id;
                groups.set(key, (groups.get(key) ?? []).concat([r]));
              }
              for (const [, gRects] of groups) {
                const gl = Math.min(...gRects.map((r) => r.x));
                const gt = Math.min(...gRects.map((r) => r.y));
                const gr = Math.max(...gRects.map((r) => r.x + r.width));
                const gb = Math.max(...gRects.map((r) => r.y + r.height));
                let gh: "left" | "right" | "top" | "bottom" | null = null;
                if (Math.abs(scenePoint.x - gl) <= EDGE_TOLERANCE && scenePoint.y >= gt - EDGE_TOLERANCE && scenePoint.y <= gb + EDGE_TOLERANCE) gh = "left";
                else if (Math.abs(scenePoint.x - gr) <= EDGE_TOLERANCE && scenePoint.y >= gt - EDGE_TOLERANCE && scenePoint.y <= gb + EDGE_TOLERANCE) gh = "right";
                else if (Math.abs(scenePoint.y - gt) <= EDGE_TOLERANCE && scenePoint.x >= gl - EDGE_TOLERANCE && scenePoint.x <= gr + EDGE_TOLERANCE) gh = "top";
                else if (Math.abs(scenePoint.y - gb) <= EDGE_TOLERANCE && scenePoint.x >= gl - EDGE_TOLERANCE && scenePoint.x <= gr + EDGE_TOLERANCE) gh = "bottom";
                if (gh) {
                  beginGroupResize(scenePoint, gRects, gh, { left: gl, top: gt, right: gr, bottom: gb });
                  return;
                }
              }
            }
            // In reshape mode, don't start drawing; allow group drag inside
            if (mode === "edge" || mode === "edge-new") {
              // Begin group drag: move only this rect's group
              const group = rect.groupId ? rects.filter((r) => r.groupId === rect.groupId) : [rect];
              beginGroupDrag(scenePoint, group);
              return;
            }
          } else if (mode === "reshape") {
            // No rect hit; try hit-testing edges of overall groups
            const groupsMap = collectGroups(rects);
            for (const [, groupRects] of groupsMap) {
              const bounds = getBounds(groupRects);
              const hit = hitTestBoundsEdge(bounds, scenePoint, EDGE_TOLERANCE);
              if (hit) {
                beginGroupResize(scenePoint, groupRects, hit, bounds);
                return;
              }
            }
          }
        }
      }
    }

    // If tool is image, place image at click location
    if (tool === "image") {
      const containerPoint = getContainerPointFromEvent(e.evt);
      if (!containerPoint) return;
      const scenePoint = toScene(containerPoint);
      const defaultW = 140;
      const defaultH = 100;
      setImages((prev) => [
        ...prev,
        { id: nextImageId(), x: scenePoint.x, y: scenePoint.y, width: defaultW, height: defaultH, src: selectedImageSrc },
      ]);
      return;
    }

    const pos = getScenePointerPosition();
    if (!pos) return;

    // In line mode: add infinite line (vertical/horizontal) at click based on modifier
    if (mode === "line") {
      // Alt/Option => horizontal line, otherwise vertical
      const kind: "v" | "h" = e.evt.altKey ? "h" : "v";
      const at = kind === "v" ? pos.x : pos.y;
      setLines((prev) => [...prev, { id: nextLineId(), kind, at }]);
      return;
    }

    if (mode === "reshape") {
      // In reshape mode do not start drawing
      return;
    }

    isDrawing.current = true;
    startPoint.current = pos;
    direction.current = null;
    lTurnCommittedRef.current = false;
    currentAxisRef.current = "h";
    segmentStartRef.current = pos;
    setDraftSegments([]);
    setDraftMetas([]);
    setNewRect({
      x: pos.x,
      y: pos.y - DEFAULT_SIZE / 2,
      width: DEFAULT_SIZE,
      height: DEFAULT_SIZE,
    });
  }, [getScenePointerPosition, getContainerPointFromEvent, nextImageId, nextLineId, selectedImageSrc, toScene, tool, mode, rects, images, openAtContainerPoint, beginPan, nextRectId]);

  const handleMouseMove = useCallback(() => {
    // seam hover preview
    if (tool === "seam") {
      const p = getScenePointerPosition();
      if (!p) { setSeamPreview(null); return; }
      // find hovered group
      let hitRect: RectShape | null = null;
      for (let i = rects.length - 1; i >= 0; i -= 1) {
        const r = rects[i];
        if (!r) continue;
        if (p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height) { hitRect = r; break; }
      }
      if (!hitRect) { setSeamPreview(null); return; }
      const gKey = hitRect.groupId ?? `single:${hitRect.id}`;
      const gRects = collectGroups(rects).get(gKey) ?? [hitRect];
      const b = getBounds(gRects);
      const dxCenter = Math.abs(p.x - (b.left + (b.right - b.left) / 2));
      const dyCenter = Math.abs(p.y - (b.top + (b.bottom - b.top) / 2));
      const orientation: "v" | "h" = dxCenter < dyCenter ? "v" : "h";
      const at = orientation === "v" ? p.x : p.y;
      setSeamPreview({ groupKey: gKey, orientation, at, bounds: b });
      return;
    }
    // handle group resizing first
    if ((mode === "edge" || mode === "edge-new" || mode === "reshape") && resizingGroupRef.current) {
      const pos = getScenePointerPosition();
      const bounds = resizeInitialBoundsRef.current;
      if (!pos || !bounds || !resizeStartSceneRef.current) return;
      const dx = pos.x - resizeStartSceneRef.current.x;
      const dy = pos.y - resizeStartSceneRef.current.y;
      const edge = resizeGroupEdgeRef.current;
      const gid = resizeGroupIdRef.current;
      if (!edge) return;
      const rectBase = resizeInitialRectsByIdRef.current;
      const orderedIds = resizeInitialOrderedIdsRef.current;
      if (!orderedIds || orderedIds.length === 0) return;
      const memberIdSet = new Set(orderedIds);

      // Determine inward shrink and outward grow distances for the dragged edge
      let shrink = 0;
      let grow = 0;
      if (edge === "right") { shrink = Math.max(0, -dx); grow = Math.max(0, dx); }
      else if (edge === "left") { shrink = Math.max(0, dx); grow = Math.max(0, -dx); }
      else if (edge === "bottom") { shrink = Math.max(0, -dy); grow = Math.max(0, dy); }
      else if (edge === "top") { shrink = Math.max(0, dy); grow = Math.max(0, -dy); }

      const isHorizontalEdge = edge === "left" || edge === "right";
      const touchAt = (r: RectShape): boolean => {
        if (edge === "right") return Math.abs((r.x + r.width) - bounds.right) <= EDGE_TOLERANCE;
        if (edge === "left") return Math.abs(r.x - bounds.left) <= EDGE_TOLERANCE;
        if (edge === "top") return Math.abs(r.y - bounds.top) <= EDGE_TOLERANCE;
        return Math.abs((r.y + r.height) - bounds.bottom) <= EDGE_TOLERANCE;
      };
      // pick end index touching the edge (prefer last or first that touches)
      let endIdx = -1;
      const bases = orderedIds.map((id) => rectBase.get(id)).filter((v): v is RectShape => !!v);
      if (edge === "right" || edge === "bottom") {
        for (let i = bases.length - 1; i >= 0; i -= 1) { if (touchAt(bases[i] as RectShape)) { endIdx = i; break; } }
        if (endIdx === -1) endIdx = bases.length - 1;
      } else {
        for (let i = 0; i < bases.length; i += 1) { if (touchAt(bases[i] as RectShape)) { endIdx = i; break; } }
        if (endIdx === -1) endIdx = 0;
      }

      const updatedById = new Map<string, RectShape>();
      const removedIds = new Set<string>();
      // start from initial base shapes
      for (const b of bases) { if (b) updatedById.set(b.id, { ...b }); }

      // Handle inward shrink first (consume and remove)
      if (shrink > 0) {
        let remaining = shrink;
        let idx = endIdx;
        const step = (edge === "right" || edge === "bottom") ? -1 : 1;
        while (remaining > 0 && idx >= 0 && idx < bases.length) {
          const seg = bases[idx] as RectShape;
          const horizontalSeg = Math.abs(seg.height - DEFAULT_SIZE) < 1e-6;
          const verticalSeg = Math.abs(seg.width - DEFAULT_SIZE) < 1e-6;
          if (isHorizontalEdge) {
            if (horizontalSeg) {
              const take = Math.min(remaining, seg.width);
              remaining -= take;
              if (edge === "right") {
                const nw = seg.width - take;
                if (nw <= MIN_SIZE) { removedIds.add(seg.id); idx += step; remaining = Math.max(remaining, 1); continue; }
                const upd = updatedById.get(seg.id);
                if (upd) { upd.width = nw; }
                break;
              }
              {
                const nw = seg.width - take;
                if (nw <= MIN_SIZE) { removedIds.add(seg.id); idx += step; remaining = Math.max(remaining, 1); continue; }
                const upd = updatedById.get(seg.id);
                if (upd) { upd.x = seg.x + take; upd.width = nw; }
              }
              break;
            }
            if (verticalSeg) {
              // vertical contributes DEFAULT_SIZE to width; remove only in whole steps
              if (remaining >= DEFAULT_SIZE - 1e-6) { removedIds.add(seg.id); remaining = Math.max(remaining - DEFAULT_SIZE, 1); idx += step; continue; }
              // not enough to remove
              break;
            }
            idx += step;
          } else {
            if (verticalSeg) {
              const take = Math.min(remaining, seg.height);
              remaining -= take;
              if (edge === "bottom") {
                const nh = seg.height - take;
                if (nh <= MIN_SIZE) { removedIds.add(seg.id); idx += step; remaining = Math.max(remaining, 1); continue; }
                const upd = updatedById.get(seg.id);
                if (upd) { upd.height = nh; }
                break;
              }
              const nh = seg.height - take;
              if (nh <= MIN_SIZE) { removedIds.add(seg.id); idx += step; remaining = Math.max(remaining, 1); continue; }
              const upd = updatedById.get(seg.id);
              if (upd) { upd.y = seg.y + take; upd.height = nh; }
              break;
            }
            if (horizontalSeg) {
              if (remaining >= DEFAULT_SIZE - 1e-6) { removedIds.add(seg.id); remaining = Math.max(remaining - DEFAULT_SIZE, 1); idx += step; continue; }
              break;
            }
            idx += step;
          }
        }
      }

      // Handle outward growth (extend terminal or append new leg)
      setDraftSegments([]);
      setNewRect(null);
      if (grow > 0) {
        const term = bases[endIdx] as RectShape;
        const horizontalTerm = Math.abs(term.height - DEFAULT_SIZE) < 1e-6;
        const verticalTerm = Math.abs(term.width - DEFAULT_SIZE) < 1e-6;
        if (isHorizontalEdge) {
          if (horizontalTerm) {
            // Extend terminal horizontal segment
            const base = rectBase.get(term.id);
            if (base) {
              const upd = updatedById.get(term.id);
              if (upd) {
                if (edge === "right") { upd.width = base.width + grow; }
                else { upd.x = base.x - grow; upd.width = base.width + grow; }
              }
            }
          } else if (verticalTerm) {
            // Append a new horizontal draft leg
            const base = rectBase.get(term.id);
            if (base) {
              const endX = edge === "right" ? bounds.right : bounds.left - DEFAULT_SIZE;
              const centerY = base.y + (base.height - DEFAULT_SIZE) / 2;
              const newSeg: RectDraft = { x: endX, y: centerY, width: Math.max(DEFAULT_SIZE, grow), height: DEFAULT_SIZE };
              setDraftSegments([newSeg]);
              // Allow turn into vertical after threshold
              const ortho = Math.abs(isHorizontalEdge ? dy : dx);
              if (grow >= L_TURN_MIN_PX && ortho > L_TURN_DEADBAND_PX) {
                const goingDown = dy >= 0;
                const vY = goingDown ? centerY : (centerY - Math.abs(ortho));
                setNewRect({ x: endX + (edge === "right" ? newSeg.width - DEFAULT_SIZE : 0), y: vY, width: DEFAULT_SIZE, height: Math.max(MIN_SIZE, Math.abs(ortho)) });
              }
            }
          }
        } else {
          if (verticalTerm) {
            // Extend terminal vertical segment
            const base = rectBase.get(term.id);
            if (base) {
              const upd = updatedById.get(term.id);
              if (upd) {
                if (edge === "bottom") { upd.height = base.height + grow; }
                else { upd.y = base.y - grow; upd.height = base.height + grow; }
              }
            }
          } else if (horizontalTerm) {
            // Append a new vertical draft leg
            const base = rectBase.get(term.id);
            if (base) {
              const endY = edge === "bottom" ? bounds.bottom : bounds.top - DEFAULT_SIZE;
              const centerX = (bounds.right + bounds.left) / 2; // approximate along group
              const newSeg: RectDraft = { x: centerX, y: endY, width: DEFAULT_SIZE, height: Math.max(DEFAULT_SIZE, grow) };
              setDraftSegments([newSeg]);
              const ortho = Math.abs(isHorizontalEdge ? dy : dx);
              if (grow >= L_TURN_MIN_PX && ortho > L_TURN_DEADBAND_PX) {
                const goingRight = dx >= 0;
                const hX = goingRight ? centerX : (centerX - Math.abs(ortho));
                setNewRect({ x: hX, y: endY + (edge === "bottom" ? newSeg.height - DEFAULT_SIZE : 0), width: Math.max(MIN_SIZE, Math.abs(ortho)), height: DEFAULT_SIZE });
              }
            }
          }
        }
      }

      // Apply updates/removals for shrink and extend existing segment sizes
      setRects((prev) => {
        return prev.map((r) => {
          const isMember = gid ? (r.groupId === gid) : memberIdSet.has(r.id);
          if (!isMember) return r;
          if (removedIds.has(r.id)) return r; // will filter in a second pass
          const upd = updatedById.get(r.id);
          return upd ? { ...r, x: upd.x, y: upd.y, width: upd.width, height: upd.height } : r;
        }).filter((r) => {
          const isMember = gid ? (r.groupId === gid) : memberIdSet.has(r.id);
          return !(isMember && removedIds.has(r.id));
        });
      });

      // Move sinks to preserve distance from left edge of parent rect
      const rectFinalById = new Map<string, RectShape>();
      // compose final rects map from base + updates - removals
      for (const [id, base] of rectBase.entries()) {
        if (removedIds.has(id)) continue;
        const upd = updatedById.get(id) ?? base;
        rectFinalById.set(id, { ...upd });
      }
      const imgBase = resizeInitialImagesByIdRef.current;
      setImages((prev) => prev.reduce<ImageShape[]>((acc, im) => {
        const baseIm = imgBase.get(im.id);
        const parentId = im.parentRectId;
        if (!baseIm || !parentId) { acc.push(im); return acc; }
        const baseParent = rectBase.get(parentId);
        if (!baseParent) { acc.push(im); return acc; }
        const baseCenterX = baseIm.x + baseIm.width / 2;
        const baseDistance = baseCenterX - baseParent.x;
        const updatedParent = rectFinalById.get(parentId);
        if (!updatedParent) { return acc; }
        // Adjust x to preserve distance
        const desiredCenterX = updatedParent.x + baseDistance;
        const newXRaw = desiredCenterX - im.width / 2;
        const minX = updatedParent.x - im.width / 2;
        const maxX = updatedParent.x + updatedParent.width - im.width / 2;
        const clampedX = Math.min(Math.max(newXRaw, minX), maxX);
        acc.push({ ...im, x: clampedX });
        return acc;
      }, []));
      return;
    }
    // handle group dragging next
    if ((mode === "edge" || mode === "edge-new") && draggingAllRef.current) {
      const pos = getScenePointerPosition();
      if (!pos || !dragAllStartSceneRef.current) return;
      const dx = pos.x - dragAllStartSceneRef.current.x;
      const dy = pos.y - dragAllStartSceneRef.current.y;
      const baseRects = dragAllInitialRectsRef.current;
      const baseImages = dragAllInitialImagesRef.current;
      const dragGid = dragAllGroupIdRef.current;
      if (dragGid) {
        // Move only members of this group, anchored to initial positions
        const rectBaseMap = dragAllInitialRectsByIdRef.current;
        const imgBaseMap = dragAllInitialImagesByIdRef.current;
        setRects((prev) => prev.map((r) => {
          if (r.groupId === dragGid) {
            const base = rectBaseMap.get(r.id);
            if (base) return { ...r, x: base.x + dx, y: base.y + dy };
          }
          return r;
        }));
        setImages((prev) => prev.map((im) => {
          const base = imgBaseMap.get(im.id);
          if (base) return { ...im, x: base.x + dx, y: base.y + dy };
          return im;
        }));
      } else {
        // No groupId -> move everything relative to initial snapshot
        setRects(baseRects.map((r) => ({ ...r, x: r.x + dx, y: r.y + dy })));
        setImages(baseImages.map((im) => ({ ...im, x: im.x + dx, y: im.y + dy })));
      }
      return;
    }
    // handle rect dragging in EDGE mode (legacy single-rect)
    if ((mode === "edge" || mode === "edge-new") && draggingRectId.current && draggingRectOffset.current) {
      const pos = getScenePointerPosition();
      if (!pos) return;
      const offset = draggingRectOffset.current;
      const newX = pos.x - offset.x;
      const newY = pos.y - offset.y;
      const rectId = draggingRectId.current;
      setRects((prev) => prev.map((r) => (r.id === rectId ? { ...r, x: newX, y: newY } : r)));
      // Move child sinks by the same delta (compute from previous rect position)
      const last = draggingRectLastPos.current;
      if (last) {
        const dx = newX - last.x;
        const dy = newY - last.y;
        if (dx !== 0 || dy !== 0) {
          setImages((prev) => prev.map((im) => (im.parentRectId === rectId ? { ...im, x: im.x + dx, y: im.y + dy } : im)));
          draggingRectLastPos.current = { x: newX, y: newY };
        }
      }
      return;
    }
    // handle panning first
    if (isPanningRef.current) {
      const p = getContainerPointerPosition();
      if (!p) return;
      panMove(p);
      return;
    }

    if (mode === "sink" || mode === "reshape") return;
    if (!isDrawing.current || !startPoint.current) return;

    const pos = getScenePointerPosition();
    if (!pos) return;

    const origin = segmentStartRef.current ?? startPoint.current;
    if (!origin) return;
    const dx = pos.x - origin.x;
    const dy = pos.y - origin.y;

    // Backtrack removal: if moving opposite along the last committed axis near the joint, pop one segment
    const lastMeta = draftMetas[draftMetas.length - 1];
    if (lastMeta) {
      if (currentAxisRef.current === "h" && lastMeta.axis === "v") {
        const verticalOpposite = (dy >= 0 ? 1 : -1) === (lastMeta.dir === 1 ? -1 : 1);
        if (verticalOpposite && Math.abs(dy) > L_TURN_DEADBAND_PX && Math.abs(dx) <= L_TURN_DEADBAND_PX) {
          setDraftSegments((prev) => prev.slice(0, -1));
          setDraftMetas((prev) => prev.slice(0, -1));
          currentAxisRef.current = lastMeta.axis; // revert to last axis
          segmentStartRef.current = lastMeta.origin;
          // After popping, wait for next move to draft from restored origin
          return;
        }
      } else if (currentAxisRef.current === "v" && lastMeta.axis === "h") {
        const horizontalOpposite = (dx >= 0 ? 1 : -1) === (lastMeta.dir === 1 ? -1 : 1);
        if (horizontalOpposite && Math.abs(dx) > L_TURN_DEADBAND_PX && Math.abs(dy) <= L_TURN_DEADBAND_PX) {
          setDraftSegments((prev) => prev.slice(0, -1));
          setDraftMetas((prev) => prev.slice(0, -1));
          currentAxisRef.current = lastMeta.axis; // revert to last axis
          segmentStartRef.current = lastMeta.origin;
          return;
        }
      }
    }

    if (currentAxisRef.current === "h") {
      // Horizontal segment
      const hDraft = draftForDrag(origin, dx, 0, direction.current);
      setNewRect(hDraft);
      const canTurn = Math.abs(dx) >= L_TURN_MIN_PX;
      const verticalMotion = Math.abs(dy);
      if (canTurn && verticalMotion > L_TURN_DEADBAND_PX) {
        // lock this horizontal segment, switch axis, start next from its end
        lTurnCommittedRef.current = true;
        setDraftSegments((prev) => [...prev, hDraft]);
        setDraftMetas((prev) => [...prev, { axis: "h", origin: segmentStartRef.current as Point, end: nextOrigin, dir: goingRight ? 1 : -1 }]);
        currentAxisRef.current = "v";
        // new origin at end of horizontal depending on direction
        const goingRight = dx >= 0;
        const nextOrigin: Point = { x: goingRight ? (hDraft.x + hDraft.width - DEFAULT_SIZE) : hDraft.x, y: hDraft.y + DEFAULT_SIZE / 2 };
        segmentStartRef.current = { x: nextOrigin.x, y: nextOrigin.y };
      }
    } else {
      // Vertical segment
      const absDy = Math.abs(dy);
      const h = Math.max(MIN_SIZE, MIN_SIZE + absDy);
      const goingDown = dy >= 0;
      const baseY = (segmentStartRef.current?.y ?? origin.y) - DEFAULT_SIZE / 2;
      const y = goingDown ? baseY : (baseY + DEFAULT_SIZE - h);
      const x = (segmentStartRef.current?.x ?? origin.x);
      const vDraft: RectDraft = { x, y, width: DEFAULT_SIZE, height: h };
      setNewRect(vDraft);

      // Turn back to horizontal when enough vertical length and enough horizontal deviation appears
      const canTurn = Math.abs(dy) >= L_TURN_MIN_PX;
      const horizontalMotion = Math.abs(dx);
      if (canTurn && horizontalMotion > L_TURN_DEADBAND_PX) {
        setDraftSegments((prev) => [...prev, vDraft]);
        currentAxisRef.current = "h";
        const goingRight = dx >= 0;
        const nextOrigin: Point = { x: goingRight ? (x + DEFAULT_SIZE) : x, y: goingDown ? (y + h) : y };
        setDraftMetas((prev) => [...prev, { axis: "v", origin: segmentStartRef.current as Point, end: nextOrigin, dir: goingDown ? 1 : -1 }]);
        // normalize next origin to center line for horizontal draft
        segmentStartRef.current = { x: nextOrigin.x, y: (goingDown ? (y + h) : y) + DEFAULT_SIZE / 2 };
      }
    }
  }, [draftForDrag, getContainerPointerPosition, getScenePointerPosition, mode, isPanningRef.current, panMove, draftMetas, tool, rects]);

  const handleMouseUp = useCallback(() => {
    // stop panning if active
    if (isPanningRef.current) { endPan(); }
    // stop group resizing if active
    if (resizingGroupRef.current) {
      // finalize any drafted new segments into the same group
      finalizeResizeDrafts(draftSegments, newRect, resizeGroupIdRef.current);
      setDraftSegments([]);
      setNewRect(null);
      resizingGroupRef.current = false;
      resizeGroupEdgeRef.current = null;
      resizeGroupIdRef.current = null;
      resizeStartSceneRef.current = null;
      resizeInitialBoundsRef.current = null;
      resizeInitialRectsByIdRef.current = new Map();
      resizeInitialImagesByIdRef.current = new Map();
      return;
    }
    // stop group dragging if active
    if (draggingAllRef.current) {
      draggingAllRef.current = false;
      dragAllStartSceneRef.current = null;
      dragAllInitialRectsRef.current = [];
      dragAllInitialImagesRef.current = [];
      dragAllGroupIdRef.current = null;
      dragAllInitialRectsByIdRef.current = new Map();
      dragAllInitialImagesByIdRef.current = new Map();
      return;
    }
    // stop rect dragging if active
    if (draggingRectId.current) {
      draggingRectId.current = null;
      draggingRectOffset.current = null;
      draggingRectLastPos.current = null;
      return;
    }
    if (mode === "sink") return;
    if (newRect) {
      const finalSegments = [...draftSegments, newRect];
      const newGroupId = `grp-${Date.now()}-${Math.floor(Math.random()*1000)}`;
      setRects((prev) => ([
        ...prev,
        ...finalSegments.map((seg) => ({
          id: nextRectId(),
          x: seg.x,
          y: seg.y,
          width: seg.width,
          height: seg.height,
          edges: { left: defaultEdgeColor, right: defaultEdgeColor, top: defaultEdgeColor, bottom: defaultEdgeColor },
          corners: { 'top-left': defaultCornerColor, 'top-right': defaultCornerColor, 'bottom-left': defaultCornerColor, 'bottom-right': defaultCornerColor },
          clips: { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 },
          groupId: newGroupId,
        }))
      ]));
      setNewRect(null);
      setDraftSegments([]);
    }
    isDrawing.current = false;
    startPoint.current = null;
    direction.current = null;
  }, [newRect, draftSegments, nextRectId, mode, defaultEdgeColor, defaultCornerColor, endPan, isPanningRef.current]);

  const findImageAtScenePoint = useCallback(
    (point: Point): ImageShape | null => {
      for (let i = images.length - 1; i >= 0; i -= 1) {
        const img = images[i];
        if (!img) continue;
        const inside = point.x >= img.x && point.x <= img.x + img.width && point.y >= img.y && point.y <= img.y + img.height;
        if (inside) return img;
      }
      return null;
    },
    [images]
  );

  const setEdgeColor = useCallback((rectId: string, edge: EdgeName, color: string) => {
    setRects((prev) =>
      prev.map((r) => (r.id === rectId ? { ...r, edges: { ...r.edges, [edge]: color } } : r))
    );
    closeMenu();
  }, [closeMenu]);

  const setCornerColor = useCallback((rectId: string, corner: CornerName, color: string) => {
    setRects((prev) =>
      prev.map((r) => (r.id === rectId ? { ...r, corners: { ...r.corners, [corner]: color } } : r))
    );
    closeMenu();
  }, [closeMenu]);

  const handleMenuAction = useCallback(
    (action: string) => {
      if (!menu.rectId || !menu.target) {
        return;
      }
      const rect = rects.find((r) => r.id === menu.rectId);
      if (!rect) {
        return;
      }
      if ((mode === "corner" || mode === "corner-new") && action === "Clip Corner" && menu.target.kind === "corner") {
        const c = menu.target.corner;
        // max clip is limited by local width/height from that corner
        const maxX = c.endsWith("right") ? rect.width : rect.width;
        const maxY = c.startsWith("bottom") ? rect.height : rect.height;
        const max = Math.min(rect.width, rect.height) / 2; // conservative limit
        const current = rect.clips?.[c] ?? 0;
        setClipModal({ isOpen: true, rectId: rect.id, corner: c, value: current, max });
        closeMenu();
        return;
      }
      if ((mode === "corner" || mode === "corner-new") && action === "Round Corner" && menu.target.kind === "corner") {
        const c = menu.target.corner;
        const max = Math.min(rect.width, rect.height) / 2;
        const current = rect.radii?.[c] ?? 0;
        setRadiusModal({ isOpen: true, rectId: rect.id, corner: c, value: current, max });
        closeMenu();
        return;
      }
      if (mode === "sink" && action === "Add Sink" && menu.target.kind === "rect") {
        const PLACEHOLDER_SRC = "/favicon.ico";
        const defaultW = 60;
        const defaultH = 60;
        // Place centered at click point
        const px = menu.target.scenePoint.x - defaultW / 2;
        const py = menu.target.scenePoint.y - defaultH / 2;
        setImages((prev) => [
          ...prev,
          { id: nextImageId(), x: px, y: py, width: defaultW, height: defaultH, src: PLACEHOLDER_SRC, parentRectId: rect.id },
        ]);
        closeMenu();
        return;
      }
      // eslint-disable-next-line no-console
      console.log("Context action", {
        action,
        target: menu.target,
        rect: { id: rect.id, x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      });
      closeMenu();
    },
    [menu.rectId, menu.target, rects, closeMenu, mode, nextImageId]
  );

  // const handleZoomIn = useCallback(() => {
  //   const stage = stageRef.current;
  //   const width = stage?.width() ?? 800;
  //   const height = stage?.height() ?? 600;
  //   const centerContainer = { x: width / 2, y: height / 2 };
  //   zoomAtContainerPoint(centerContainer, 1.2);
  // }, [zoomAtContainerPoint]);

  // const handleZoomOut = useCallback(() => {
  //   const stage = stageRef.current;
  //   const width = stage?.width() ?? 800;
  //   const height = stage?.height() ?? 600;
  //   const centerContainer = { x: width / 2, y: height / 2 };
  //   zoomAtContainerPoint(centerContainer, 1 / 1.2);
  // }, [zoomAtContainerPoint]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
  
    const width = stage.width() ?? 800;
    const height = stage.height() ?? 600;
    const centerContainer = { x: width / 2, y: height / 2 };
  
    // Absolute scale factor (based on percentage)
    const scaleFactor = currentZoomLevel / 100;
  
    // Get current scale
    const oldScale = stage.scaleX();
  
    // Compute pointer relative to current scale
    const pointerTo = {
      x: (centerContainer.x - stage.x()) / oldScale,
      y: (centerContainer.y - stage.y()) / oldScale,
    };
  
    // Set new absolute scale
    stage.scale({ x: scaleFactor, y: scaleFactor });
  
    // Adjust position so center stays in place
    stage.position({
      x: centerContainer.x - pointerTo.x * scaleFactor,
      y: centerContainer.y - pointerTo.y * scaleFactor,
    });
  
    stage.batchDraw();
  }, [currentZoomLevel]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      setContainerSize({ width: Math.max(0, Math.floor(cr.width)), height: Math.max(0, Math.floor(cr.height)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleExportJpeg = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Render stage to a high-res PNG first to keep vector sharpness
    const pixelRatio = 2; // 2x for crisper export; adjust if needed
    const dataUrl = stage.toDataURL({ pixelRatio, mimeType: 'image/png' });
    // Draw on an offscreen canvas with white background, then export as JPEG
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const jpegUrl = canvas.toDataURL('image/jpeg', 0.92);
      const a = document.createElement('a');
      a.href = jpegUrl;
      a.download = 'drawing.jpg';
      document.body.appendChild(a);
      a.click();
      a.remove();
    };
    img.src = dataUrl;
  }, []);
  const handleExportJson = useCallback(() => {
    const payload = {
      stage: { position: stagePosition, scale: stageScale },
      rects,
      images,
      lines,
    };
    // eslint-disable-next-line no-console
    console.log("Canvas JSON:", JSON.stringify(payload));
    alert("Canvas JSON logged to console.");
  }, [images, lines, rects, stagePosition, stageScale]);

  const handleImportJsonToImage = useCallback(async () => {
    const input = prompt("Paste canvas JSON:");
    if (!input) return;
    try {
      const data = JSON.parse(input) as { rects?: ReadonlyArray<RectShape>; images?: ReadonlyArray<ImageShape>; lines?: ReadonlyArray<LineShape>; stage?: { position?: { x: number; y: number }; scale?: number; width?: number; height?: number } };
      const url = await exportJsonToImage({ rects: data.rects ?? [], images: data.images ?? [], lines: data.lines ?? [], stage: { width: containerSize.width, height: containerSize.height } });
      const a = document.createElement('a');
      a.href = url;
      a.download = 'imported-canvas.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Invalid JSON.");
    }
  }, [containerSize.height, containerSize.width]);
  // --- Testing helpers: spawn lots of random rectangles for performance checks
  const spawnRandomRects = useCallback((count: number) => {
    const stage = stageRef.current;
  const width = stage?.width() ?? STAGE_WIDTH;
  const height = stage?.height() ?? STAGE_HEIGHT;
  const generated = generateRandomRects(count, toScene, nextRectId, defaultEdgeColor, defaultCornerColor, width, height, MIN_SIZE);
    setRects((prev) => [...prev, ...generated]);
}, [defaultCornerColor, defaultEdgeColor, nextRectId, toScene]);



  const toggleLogCb = useCallback(() => setShowLog((v) => !v), []);
  const handleSpawn1k = useCallback(() => spawnRandomRects(1000), [spawnRandomRects]);
  const handleSpawn5k = useCallback(() => spawnRandomRects(5000), [spawnRandomRects]);
  const handleClearRects = useCallback(() => setRects([]), []);

  useEffect(() => {
    setCanvasActions({
      exportJpeg: handleExportJpeg,
      exportJson: handleExportJson,
      importJsonToImage: handleImportJsonToImage,
      toggleLog: toggleLogCb,
      spawn1k: handleSpawn1k,
      spawn5k: handleSpawn5k,
      clearRects: handleClearRects,
    });
    // Register once per handler identity; handlers are memoized
  }, [handleClearRects, handleExportJpeg, handleExportJson, handleImportJsonToImage, handleSpawn1k, handleSpawn5k, setCanvasActions, toggleLogCb]);

  // Provide canvas setters so header changes can propagate
  useEffect(() => {
    setCanvasSetters({
      setMode: (m) => setMode(m),
      setDefaultEdgeColor: (v) => setDefaultEdgeColor(v),
      setDefaultCornerColor: (v) => setDefaultCornerColor(v),
      setTool: (t) => setTool(t),
      setSelectedImageSrc: (src) => setSelectedImageSrc(src),
    });
  }, [setCanvasSetters]);

  // Push current canvas state snapshot into context for header UI
  useEffect(() => {
    setCanvasState({
      mode,
      defaultEdgeColor,
      defaultCornerColor,
      tool,
      selectedImageSrc,
    });
  }, [defaultCornerColor, defaultEdgeColor, mode, selectedImageSrc, setCanvasState, tool]);

  const pinchLastDistance = useRef<number | null>(null);
  const getScenePointFromTouchIndex = useCallback((evt: TouchEvent, index: number): Point | null => {
    const t = evt.touches.item(index);
    if (!t) return null;
    const containerPoint = getContainerPointFromEvent({ clientX: t.clientX, clientY: t.clientY } as unknown as MouseEvent);
    return containerPoint ? toScene(containerPoint) : null;
  }, [getContainerPointFromEvent, toScene]);

  // Touch interactions moved to hook (single-finger flow). Multi-touch pinch below remains local.
  const { onTouchStart, onTouchMove: onTouchMoveSingle, onTouchEnd: onTouchEndSingle } = useTouchInteractions({
    tool,
    toScene,
    getContainerPointFromEvent: (evt) => getContainerPointFromEvent(evt),
    getScenePointFromTouchIndex: (evt, index) => getScenePointFromTouchIndex(evt, index),
    draftForDrag,
    setNewRect,
    isDrawingRef: isDrawing,
    startPointRef: startPoint,
    directionRef: direction,
    openAtContainerPoint,
  });

  const pinchLastCenter = useRef<Point | null>(null);
  // Rect dragging in EDGE mode
  const draggingRectId = useRef<string | null>(null);
  const draggingRectOffset = useRef<Point | null>(null);
  const draggingRectLastPos = useRef<Point | null>(null);
  // Group dragging (move entire drawing as one)
  const draggingAllRef = useRef<boolean>(false);
  const dragAllStartSceneRef = useRef<Point | null>(null);
  const dragAllInitialRectsRef = useRef<ReadonlyArray<RectShape>>([]);
  const dragAllInitialImagesRef = useRef<ReadonlyArray<ImageShape>>([]);
  const dragAllGroupIdRef = useRef<string | null>(null);
  const dragAllInitialRectsByIdRef = useRef<Map<string, RectShape>>(new Map());
  const dragAllInitialImagesByIdRef = useRef<Map<string, ImageShape>>(new Map());
  // Group resizing (drag group bounding box edges)
  const resizingGroupRef = useRef<boolean>(false);
  const resizeGroupEdgeRef = useRef<"left" | "right" | "top" | "bottom" | null>(null);
  const resizeGroupIdRef = useRef<string | null>(null);
  const resizeStartSceneRef = useRef<Point | null>(null);
  const resizeInitialBoundsRef = useRef<{ left: number; top: number; right: number; bottom: number } | null>(null);
  const resizeInitialRectsByIdRef = useRef<Map<string, RectShape>>(new Map());
  const resizeInitialImagesByIdRef = useRef<Map<string, ImageShape>>(new Map());
  const resizeInitialOrderedIdsRef = useRef<ReadonlyArray<string>>([]);

  // Inner helpers (avoid forward-ref issues and keep logic tidy)
  function beginGroupResize(scenePoint: Point, groupRects: ReadonlyArray<RectShape>, edge: "left" | "right" | "top" | "bottom", bounds: { left: number; top: number; right: number; bottom: number }) {
    resizingGroupRef.current = true;
    resizeGroupEdgeRef.current = edge;
    resizeGroupIdRef.current = groupRects[0]?.groupId ?? null;
    resizeStartSceneRef.current = scenePoint;
    resizeInitialBoundsRef.current = bounds;
    resizeInitialRectsByIdRef.current = new Map(groupRects.map((r) => [r.id, r] as const));
    const memberRectIds = new Set(groupRects.map((r) => r.id));
    const gid = groupRects[0]?.groupId ?? null;
    const memberImages = images.filter((im) => (gid ? (im.groupId === gid || (im.parentRectId && memberRectIds.has(im.parentRectId))) : (im.parentRectId ? memberRectIds.has(im.parentRectId) : false)));
    resizeInitialImagesByIdRef.current = new Map(memberImages.map((im) => [im.id, im] as const));
    resizeInitialOrderedIdsRef.current = [...groupRects]
      .sort((a, b) => (a.x + a.y) - (b.x + b.y))
      .map((r) => r.id);
    isDrawing.current = false;
    startPoint.current = null;
    direction.current = null;
  }

  function beginGroupDrag(scenePoint: Point, groupRects: ReadonlyArray<RectShape>) {
    draggingAllRef.current = true;
    dragAllStartSceneRef.current = scenePoint;
    const gid = groupRects[0]?.groupId ?? null;
    dragAllGroupIdRef.current = gid;
    dragAllInitialRectsRef.current = groupRects;
    const memberRectIds = new Set(groupRects.map((r) => r.id));
    dragAllInitialImagesRef.current = gid ? images.filter((im) => (im.groupId === gid || (im.parentRectId && memberRectIds.has(im.parentRectId)))) : images;
    dragAllInitialRectsByIdRef.current = new Map(dragAllInitialRectsRef.current.map((r) => [r.id, r] as const));
    dragAllInitialImagesByIdRef.current = new Map(dragAllInitialImagesRef.current.map((im) => [im.id, im] as const));
    isDrawing.current = false;
    startPoint.current = null;
    direction.current = null;
    draggingRectId.current = null;
    draggingRectOffset.current = null;
    draggingRectLastPos.current = null;
  }

  function finalizeResizeDrafts(drafts: ReadonlyArray<RectDraft>, maybeNewRect: RectDraft | null, groupId: string | null) {
    const toCommit: RectDraft[] = [...drafts, ...(maybeNewRect ? [maybeNewRect] : [])];
    if (toCommit.length === 0) return;
    const gid = groupId ?? `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setRects((prev) => ([
      ...prev,
      ...toCommit.map((seg) => ({
        id: nextRectId(),
        x: seg.x,
        y: seg.y,
        width: seg.width,
        height: seg.height,
        edges: { left: defaultEdgeColor, right: defaultEdgeColor, top: defaultEdgeColor, bottom: defaultEdgeColor },
        corners: { 'top-left': defaultCornerColor, 'top-right': defaultCornerColor, 'bottom-left': defaultCornerColor, 'bottom-right': defaultCornerColor },
        clips: { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 },
        groupId: gid,
      }))
    ]));
  }

  const findRectAtPoint = useCallback((point: Point): RectShape | null => htFindRect(rects, point), [rects]);
  const handleTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length === 1) {
      onTouchMoveSingle({ evt: e.evt });
      return;
    }
    if (e.evt.touches.length !== 2) return;
    // two-finger pan + pinch zoom
    e.evt.preventDefault();
    const t1 = e.evt.touches.item(0);
    const t2 = e.evt.touches.item(1);
    if (!t1 || !t2) return;
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const centerClient: Point = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    const centerContainer = getContainerPointFromEvent({ clientX: centerClient.x, clientY: centerClient.y } as unknown as MouseEvent);
    if (!centerContainer) return;
    if (pinchLastDistance.current == null || pinchLastCenter.current == null) {
      pinchLastDistance.current = dist;
      pinchLastCenter.current = centerContainer;
      return;
    }
    // pan by center movement
    const panDx = centerContainer.x - pinchLastCenter.current.x;
    const panDy = centerContainer.y - pinchLastCenter.current.y;
    if (panDx !== 0 || panDy !== 0) {
      panBy(panDx, panDy);
    }
    pinchLastCenter.current = centerContainer;
    // zoom by distance change
    const factor = dist / pinchLastDistance.current;
    pinchLastDistance.current = dist;
    const clampedFactor = (stageScale * factor) / stageScale;
    zoomAtContainerPoint(centerContainer, clampedFactor);
  }, [getContainerPointFromEvent, zoomAtContainerPoint, stageScale, panBy, onTouchMoveSingle]);

  const handleTouchEnd = useCallback((e: KonvaEventObject<TouchEvent>) => {
    if (e.evt.touches.length === 0) {
      onTouchEndSingle({ evt: e.evt, target: e.target as { getStage?: () => { container: () => { getBoundingClientRect: () => DOMRect } } } });

      if (tool === "image") {
        // Tap places image if movement is small
        // Coordinated by local flags within hook; here we keep image placement
        // only when tap distance small: reuse last cached container point if available
        // For simplicity, we skip extra checks here since hook handles menu tap
        const p = getContainerPointerPosition();
        if (p) {
          const scenePoint = toScene(p);
          const defaultW = 140;
          const defaultH = 100;
          setImages((prev) => [
            ...prev,
            { id: nextImageId(), x: scenePoint.x, y: scenePoint.y, width: defaultW, height: defaultH, src: selectedImageSrc },
          ]);
        }
      } else {
        if (isDrawing.current) {
          if (newRect) {
            setRects((prev) => [
              ...prev,
              {
                id: nextRectId(),
                x: newRect.x,
                y: newRect.y,
                width: newRect.width,
                height: newRect.height,
                edges: { left: defaultEdgeColor, right: defaultEdgeColor, top: defaultEdgeColor, bottom: defaultEdgeColor },
                corners: { 'top-left': defaultCornerColor, 'top-right': defaultCornerColor, 'bottom-left': defaultCornerColor, 'bottom-right': defaultCornerColor },
              },
            ]);
            setNewRect(null);
          }
          isDrawing.current = false;
          startPoint.current = null;
          direction.current = null;
        }
      }

      // reset pinch state
      pinchLastDistance.current = null;
      pinchLastCenter.current = null;
    }
  }, [newRect, nextRectId, onTouchEndSingle, nextImageId, selectedImageSrc, toScene, tool, defaultEdgeColor, defaultCornerColor, getContainerPointerPosition]);


  const renderLabels = (r: RectDraft) => (
    <>
      <Text
        x={r.x + r.width / 2}
        y={r.y - 15}
        text={`${r.width.toFixed(0)} px`}
        fontSize={14}
        fill="blue"
        align="center"
        offsetX={20}
        scaleX={1 / stageScale}
        scaleY={1 / stageScale}
        listening={false}
      />
      <Text
        x={r.x - 40}
        y={r.y + r.height / 2}
        text={`${r.height.toFixed(0)} px`}
        fontSize={14}
        fill="blue"
        rotation={-90}
        scaleX={1 / stageScale}
        scaleY={1 / stageScale}
        listening={false}
      />
    </>
  );

  return (
    <div ref={containerRef} className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <div className="absolute top-1 left-1 z-50 flex w-11 flex-col items-center gap-1 rounded-[10px] py-1 shadow-lg">
          <Button color='neutral' iconOnly size='sm' variant='outlined' className="h-[36px] w-[36px]">
            <Icon size='md'>
                <IconDimensions />
            </Icon>
        </Button>
        <Divider />
        <Button color='neutral' iconOnly size='sm' variant='text' className="h-[36px] w-[36px]">
            <Icon size='md'>
                <IconTextSize />
            </Icon>
        </Button>
        <Button color='neutral' iconOnly size='sm' variant='text' className="h-[36px] w-[36px]">
            <Icon size='md'>
                <IconMarquee2 />
            </Icon>
        </Button>
        <Button color='neutral' iconOnly size='sm' variant='text' className="h-[36px] w-[36px]">
            <Icon size='md'>
                <IconPackage />
            </Icon>
        </Button>
      </div>
      {/* Toolbar moved to header Settings popover */}
      {mode === "vain-match" && (
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <label className="text-gray-700 text-sm" htmlFor="vain-bg-input">Match Image</label>
          <input
            id="vain-bg-input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setVainBgSrc(url);
            }}
          />
          {/* Active group selector */}
          <label className="text-gray-700 text-sm" htmlFor="vain-group">Group</label>
          <select
            id="vain-group"
            className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            value={vainActiveGroupKey ?? ""}
            onChange={(e) => setVainActiveGroupKey(e.target.value || null)}
          >
            {Array.from(collectGroups(rects).keys()).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          {/* Scale */}
          <label className="text-gray-700 text-sm" htmlFor="vain-scale">Scale</label>
          <input
            id="vain-scale"
            type="range"
            min={0.2}
            max={3}
            step={0.01}
            value={(vainActiveGroupKey && vainGroupTransforms.get(vainActiveGroupKey)?.scale) ?? 1}
            onChange={(e) => {
              const v = Number.parseFloat(e.target.value);
              setVainGroupTransforms((prev) => {
                const next = new Map(prev);
                const key = vainActiveGroupKey ?? "";
                const cur = next.get(key) ?? { x: 0, y: 0, scale: 1, rotation: 0 };
                next.set(key, { ...cur, scale: v });
                return next;
              });
            }}
          />
          {/* Rotation */}
          <label className="text-gray-700 text-sm" htmlFor="vain-rotation">Rotation</label>
          <input
            id="vain-rotation"
            type="range"
            min={-180}
            max={180}
            step={1}
            value={(vainActiveGroupKey && vainGroupTransforms.get(vainActiveGroupKey)?.rotation) ?? 0}
            onChange={(e) => {
              const v = Number.parseFloat(e.target.value);
              setVainGroupTransforms((prev) => {
                const next = new Map(prev);
                const key = vainActiveGroupKey ?? "";
                const cur = next.get(key) ?? { x: 0, y: 0, scale: 1, rotation: 0 };
                next.set(key, { ...cur, rotation: v });
                return next;
              });
            }}
          />
          <button
            type="button"
            className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => {
              if (!vainActiveGroupKey) return;
              setVainGroupTransforms((prev) => {
                const next = new Map(prev);
                next.set(vainActiveGroupKey, { x: 0, y: 0, scale: 1, rotation: 0 });
                return next;
              });
            }}
          >
            Reset Overlay
          </button>
        </div>
      )}
      {mode !== "vain-match" && (
        <Stage
          width={containerSize.width}
          height={containerSize.height}
          style={{
            // border: "2px solid red",
            backgroundColor: "white",
            touchAction: "none",
          }}
          x={stagePosition.x}
          y={stagePosition.y}
          scaleX={stageScale}
          scaleY={stageScale}
          onWheel={handleWheel}
          onTouchStart={(e) => onTouchStart({ evt: e.evt as TouchEvent, target: e.target as { getStage?: () => { container: () => { getBoundingClientRect: () => DOMRect } } } })}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={(e) => {
            e.evt.preventDefault();
            const pos = getContainerPointFromEvent(e.evt);
            if (!pos) return;
            openAtContainerPoint(pos, e.evt.clientX, e.evt.clientY);
          }}
          ref={stageRef}
        >
          {/* Images layer (interactive) */}
          <Layer>
            {images.map((img) => (
              <URLImage
                key={img.id}
                image={img}
                rects={rects}
                stageScale={stageScale}
                stagePosition={stagePosition}
                setImages={setImages}
                onSinkDragStart={onSinkDragStart}
                onSinkDragMove={onSinkDragMove}
                onSinkDragEnd={onSinkDragEnd}
              />
            ))}
          </Layer>

          <OutlineLayer rects={rects} />

          {/* Labels and draft overlay in a lightweight layer; labels conditionally rendered */}
          <LabelsLayer
            rects={rects}
            lines={lines}
            newRect={newRect}
            draftSegments={draftSegments}
            stageScale={stageScale}
            renderLabels={renderLabels}
            distanceClick={(rectId, sinkId, value) => setEditDistance({ isOpen: true, rectId, sinkId, value })}
            images={images}
          />
          <DragOverlayLayer rects={rects} active={sinkDrag.active} candidateRectId={sinkDrag.candidateRectId} />
          {/* Interactive layer just for sink distance labels (clickable) */}
          {(rects.length <= 300 || stageScale > 1.5) && (
            <Layer>
              {rects.map((r) => {
                const sinks = images.filter((img) => img.parentRectId === r.id);
                return sinks.map((img, idx) => {
                  const centerX = img.x + img.width / 2;
                  const distancePx = Math.round(centerX - r.x);
                  return (
                    <Text
                      key={`sinkdist-${r.id}-${img.id}`}
                      x={r.x + 4}
                      y={r.y + r.height + 4 + idx * 14}
                      text={`${distancePx} px`}
                      fontSize={12}
                      fill="purple"
                      scaleX={1 / stageScale}
                      scaleY={1 / stageScale}
                      listening
                      onClick={() => {
                        setEditDistance({ isOpen: true, rectId: r.id, sinkId: img.id, value: Math.max(0, centerX - r.x) });
                      }}
                    />
                  );
                });
              })}
            </Layer>
          )}
        </Stage>
      )}
      {mode === "vain-match" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Preview stage with ghost overlay */}
          <Stage
            width={containerSize.width}
            height={containerSize.height}
            style={{ 
              // border: "2px solid red", 
              backgroundColor: "white", touchAction: "none" }}
            x={stagePosition.x}
            y={stagePosition.y}
            scaleX={stageScale}
            scaleY={stageScale}
            onWheel={handleWheel}
            onTouchStart={(e) => onTouchStart({ evt: e.evt as TouchEvent, target: e.target as { getStage?: () => { container: () => { getBoundingClientRect: () => DOMRect } } } })}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={(e) => {
              e.evt.preventDefault();
              const pos = getContainerPointFromEvent(e.evt);
              if (!pos) return;
              openAtContainerPoint(pos, e.evt.clientX, e.evt.clientY);
            }}
            ref={stageRef}
          >
            {/* Clipped preview: for each group, clip rects and draw inverse-transformed image around group's top-left pivot */}
            {vainBgEl && (
              <Layer listening={false}>
                {Array.from(collectGroups(rects).entries()).map(([key, gRects]) => {
                  const t = vainGroupTransforms.get(key) ?? { x: 0, y: 0, scale: 1, rotation: 0 };
                  const b = getBounds(gRects);
                  return (
                    <Group key={`clip-${key}`}
                      clipFunc={(ctx) => {
                        ctx.beginPath();
                        for (const r of gRects) { addRectPathWithCorners(ctx as unknown as CanvasRenderingContext2D, r); }
                        ctx.closePath();
                      }}
                    >
                      {/* Pivot at group's top-left (b.left, b.top) */}
                      <Group x={b.left} y={b.top}>
                        <Group
                          x={-t.x}
                          y={-t.y}
                          rotation={-t.rotation}
                          scaleX={1 / (t.scale || 1)}
                          scaleY={1 / (t.scale || 1)}
                        >
                          <KonvaImage
                            image={vainBgEl}
                            x={-b.left}
                            y={-b.top}
                            width={STAGE_WIDTH}
                            height={STAGE_HEIGHT}
                            listening={false}
                          />
                        </Group>
                      </Group>
                    </Group>
                  );
                })}
              </Layer>
            )}
            {/* Seam hover guide in preview */}
            {seamPreview && (
              <Layer listening={false}>
                <Line
                  points={seamPreview.orientation === "v" ? [seamPreview.at, seamPreview.bounds.top, seamPreview.at, seamPreview.bounds.bottom] : [seamPreview.bounds.left, seamPreview.at, seamPreview.bounds.right, seamPreview.at]}
                  stroke="#ef4444"
                  strokeWidth={2}
                  dash={[6, 4]}
                  listening={false}
                />
              </Layer>
            )}
          </Stage>
          {/* Matching stage with background and draggable overlay per group */}
          <Stage
            width={containerSize.width}
            height={containerSize.height}
            style={{ 
              // border: "2px solid red", 
              backgroundColor: "white", touchAction: "none" }}
            onContextMenu={(e) => e.evt.preventDefault()}
          >
            <Layer>
              {vainBgEl && (
                <KonvaImage image={vainBgEl} x={0} y={0} width={containerSize.width} height={containerSize.height} listening={false} />
              )}
              {/* Seam hover guide in matching */}
              {seamPreview && (
                <Line
                  points={seamPreview.orientation === "v" ? [seamPreview.at, seamPreview.bounds.top, seamPreview.at, seamPreview.bounds.bottom] : [seamPreview.bounds.left, seamPreview.at, seamPreview.bounds.right, seamPreview.at]}
                  stroke="#ef4444"
                  strokeWidth={2}
                  dash={[6, 4]}
                  listening={false}
                />
              )}
              {Array.from(collectGroups(rects).entries()).map(([key, gRects]) => {
                const t = vainGroupTransforms.get(key) ?? { x: 0, y: 0, scale: 1, rotation: 0 };
                const b = getBounds(gRects);
                return (
                  <Group key={`vmgrp-${key}`} x={b.left} y={b.top}>
                    <Group
                      x={t.x}
                      y={t.y}
                      rotation={t.rotation}
                      scaleX={t.scale}
                      scaleY={t.scale}
                      draggable
                      onDragStart={() => setVainActiveGroupKey(key)}
                      onDragMove={(e) => setVainGroupTransforms((prev) => { const next = new Map(prev); const cur = next.get(key) ?? t; next.set(key, { ...cur, x: e.target.x(), y: e.target.y() }); return next; })}
                      onDragEnd={(e) => setVainGroupTransforms((prev) => { const next = new Map(prev); const cur = next.get(key) ?? t; next.set(key, { ...cur, x: e.target.x(), y: e.target.y() }); return next; })}
                    >
                      {gRects.map((r) => (
                        <Rect key={`vm-${key}-${r.id}`} x={r.x - b.left} y={r.y - b.top} width={r.width} height={r.height} stroke="#0ea5e9" strokeWidth={2} />
                      ))}
                    </Group>
                  </Group>
                );
              })}
            </Layer>
          </Stage>
        </div>
      )}

      <InfoLog
        show={showLog}
        stagePosition={stagePosition}
        stageScale={stageScale}
        rects={rects}
        images={images}
        lines={lines}
        onOpenDistance={(rectId, imageId, value) => setEditDistance({ isOpen: true, rectId, sinkId: imageId, value })}
      />
      <DistanceModal
        isOpen={editDistance.isOpen}
        rects={rects}
        images={images}
        value={editDistance.value}
        rectId={editDistance.rectId}
        sinkId={editDistance.sinkId}
        onChange={(n) => setEditDistance((s) => ({ ...s, value: n }))}
        onApply={(r, im, value) => {
          const desiredCenterX = r.x + Math.max(0, value);
          const newX = desiredCenterX - im.width / 2;
          const minX = r.x - im.width / 2;
          const maxX = r.x + r.width - im.width / 2;
                  const clampedX = Math.min(Math.max(newX, minX), maxX);
          setImages((prev) => prev.map((img) => (img.id === im.id ? { ...img, x: clampedX } : img)));
                  setEditDistance({ isOpen: false, rectId: null, sinkId: null, value: 0 });
                }}
        onClose={() => setEditDistance({ isOpen: false, rectId: null, sinkId: null, value: 0 })}
      />
      <ContextMenu
        menu={menu}
        mode={mode}
        popoverButtonRef={popoverButtonRef}
        onClose={closeMenu}
        onSetEdgeColor={(rectId, edge, color) => setEdgeColor(rectId, edge, color)}
        onSetCornerColor={(rectId, corner, color) => setCornerColor(rectId, corner, color)}
        onAction={(action) => handleMenuAction(action)}
      />
      <CornerClipModal
        isOpen={clipModal.isOpen}
        cornerLabel={clipModal.corner}
        value={clipModal.value}
        maxValue={clipModal.max}
        onChange={(n) => setClipModal((s) => ({ ...s, value: Math.max(0, Math.min(n, s.max)) }))}
        onCancel={() => setClipModal({ isOpen: false, rectId: null, corner: null, value: 0, max: 0 })}
        onApply={() => {
          if (!clipModal.isOpen || !clipModal.rectId || !clipModal.corner) return;
          const cornerKey = clipModal.corner as CornerName;
          setRects((prev) => prev.map((r) => r.id === clipModal.rectId ? {
            ...r,
            clips: { ...(r.clips ?? { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 }), [cornerKey]: Math.max(0, Math.min(clipModal.value, clipModal.max)) }
          } : r));
          setClipModal({ isOpen: false, rectId: null, corner: null, value: 0, max: 0 });
        }}
      />
      <CornerRadiusModal
        isOpen={radiusModal.isOpen}
        cornerLabel={radiusModal.corner}
        value={radiusModal.value}
        maxValue={radiusModal.max}
        onChange={(n) => setRadiusModal((s) => ({ ...s, value: Math.max(0, Math.min(n, s.max)) }))}
        onCancel={() => setRadiusModal({ isOpen: false, rectId: null, corner: null, value: 0, max: 0 })}
        onApply={() => {
          if (!radiusModal.isOpen || !radiusModal.rectId || !radiusModal.corner) return;
          const cornerKey = radiusModal.corner as CornerName;
          setRects((prev) => prev.map((r) => r.id === radiusModal.rectId ? {
            ...r,
            // radius wins: reset clip for that corner to 0
            clips: { ...(r.clips ?? { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 }), [cornerKey]: 0 },
            radii: { ...(r.radii ?? { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 }), [cornerKey]: Math.max(0, Math.min(radiusModal.value, radiusModal.max)) }
          } : r));
          setRadiusModal({ isOpen: false, rectId: null, corner: null, value: 0, max: 0 });
        }}
      />
    </div>
  );
}
