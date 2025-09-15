import {  useCallback, useEffect, useRef, useState } from "react";
import { Layer,  Stage, Text } from "react-konva";
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
import { MIN_SIZE, DEFAULT_SIZE, SNAP_TO_ORIGIN, SNAP_SIZE, EDGE_TOLERANCE, IMAGE_OPTIONS, STAGE_WIDTH, STAGE_HEIGHT } from "./drawing/constants";
import { generateRandomRects } from "./drawing/utils/dev";
import type { Point, RectDraft, EdgeName, CornerName, RectShape, ImageShape, DragDirection, InteractionMode, ToolMode, ContextMenuState, LineShape } from "./drawing/types";
import { findEdgeAtPointer as htFindEdge, findCornerAtPointer as htFindCorner, findRectAtPoint as htFindRect } from "./drawing/utils/hitTest";
import { draftForDrag as utilDraftForDrag } from "./drawing/utils/draft";

export default function SquareStretchCanvas() {
  const [rects, setRects] = useState<RectShape[]>([]);
  const [newRect, setNewRect] = useState<RectDraft | null>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
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

  const isDrawing = useRef<boolean>(false);
  const startPoint = useRef<Point | null>(null);
  const direction = useRef<DragDirection>(null);

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
      if (findImageAtScenePoint(scenePoint)) return; // don't open over images
      // Find top-most rect that contains the point
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

    // In edge (both) mode: if clicking inside an existing rect (not image), start dragging that rect
    if (mode === "edge" || mode === "edge-new") {
      const containerPoint = getContainerPointFromEvent(e.evt);
      if (containerPoint) {
        const scenePoint = toScene(containerPoint);
        const img = findImageAtScenePoint(scenePoint);
        if (!img) {
          const rect = findRectAtPoint(scenePoint);
          if (rect) {
            draggingRectId.current = rect.id;
            draggingRectOffset.current = { x: scenePoint.x - rect.x, y: scenePoint.y - rect.y };
            // Also remember last position for delta calculation
            draggingRectLastPos.current = { x: rect.x, y: rect.y };
            // prevent new-rect drawing
            isDrawing.current = false;
            startPoint.current = null;
            direction.current = null;
            return;
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

    isDrawing.current = true;
    startPoint.current = pos;
    direction.current = null;

    setNewRect({
      x: pos.x,
      y: pos.y - DEFAULT_SIZE / 2,
      width: DEFAULT_SIZE,
      height: DEFAULT_SIZE,
    });
  }, [getScenePointerPosition, getContainerPointFromEvent, nextImageId, nextLineId, selectedImageSrc, toScene, tool, mode, rects, openAtContainerPoint, beginPan]);

  const handleMouseMove = useCallback(() => {
    // handle rect dragging in EDGE mode
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

    if (mode === "sink") return;
    if (!isDrawing.current || !startPoint.current) return;

    const pos = getScenePointerPosition();
    if (!pos) return;

    const dx = pos.x - startPoint.current.x;
    const dy = pos.y - startPoint.current.y;

    const draft = draftForDrag(startPoint.current, dx, dy, direction.current);
    setNewRect(draft);
  }, [draftForDrag, getContainerPointerPosition, getScenePointerPosition, mode, isPanningRef.current, panMove]);

  const handleMouseUp = useCallback(() => {
    // stop panning if active
    if (isPanningRef.current) { endPan(); }
    // stop rect dragging if active
    if (draggingRectId.current) {
      draggingRectId.current = null;
      draggingRectOffset.current = null;
      draggingRectLastPos.current = null;
      return;
    }
    if (mode === "sink") return;
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
          clips: { 'top-left': 0, 'top-right': 0, 'bottom-left': 0, 'bottom-right': 0 },
        },
      ]);
      setNewRect(null);
    }
    isDrawing.current = false;
    startPoint.current = null;
    direction.current = null;
  }, [newRect, nextRectId, mode, defaultEdgeColor, defaultCornerColor, endPan, isPanningRef.current]);

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

  const handleZoomIn = useCallback(() => {
    const stage = stageRef.current;
    const width = stage?.width() ?? 800;
    const height = stage?.height() ?? 600;
    const centerContainer = { x: width / 2, y: height / 2 };
    zoomAtContainerPoint(centerContainer, 1.2);
  }, [zoomAtContainerPoint]);
  const handleZoomOut = useCallback(() => {
    const stage = stageRef.current;
    const width = stage?.width() ?? 800;
    const height = stage?.height() ?? 600;
    const centerContainer = { x: width / 2, y: height / 2 };
    zoomAtContainerPoint(centerContainer, 1 / 1.2);
  }, [zoomAtContainerPoint]);


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

  // --- Testing helpers: spawn lots of random rectangles for performance checks
  const spawnRandomRects = useCallback((count: number) => {
      const stage = stageRef.current;
    const width = stage?.width() ?? STAGE_WIDTH;
    const height = stage?.height() ?? STAGE_HEIGHT;
    const generated = generateRandomRects(count, toScene, nextRectId, defaultEdgeColor, defaultCornerColor, width, height, MIN_SIZE);
      setRects((prev) => [...prev, ...generated]);
  }, [defaultCornerColor, defaultEdgeColor, nextRectId, toScene]);

  const handleSpawn1k = useCallback(() => spawnRandomRects(1000), [spawnRandomRects]);
  const handleSpawn5k = useCallback(() => spawnRandomRects(5000), [spawnRandomRects]);
  const handleClearRects = useCallback(() => setRects([]), []);

  

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
    <>
      <Toolbar
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSpawn1k={handleSpawn1k}
        onSpawn5k={handleSpawn5k}
        onClearRects={handleClearRects}
        showLog={showLog}
        onToggleLog={() => setShowLog((v) => !v)}
        mode={mode}
        onModeChange={(m) => setMode(m)}
        defaultEdgeColor={defaultEdgeColor}
        defaultCornerColor={defaultCornerColor}
        onDefaultEdgeColorChange={(v) => setDefaultEdgeColor(v)}
        onDefaultCornerColorChange={(v) => setDefaultCornerColor(v)}
        tool={tool}
        onToolChange={(t) => setTool(t)}
        selectedImageSrc={selectedImageSrc}
        onSelectedImageChange={(v) => setSelectedImageSrc(v)}
      />
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        style={{
          border: "1px solid #ccc",
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
    </>
  );
}
