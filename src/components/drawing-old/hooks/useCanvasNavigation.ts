import type { KonvaEventObject } from "konva/lib/Node";
import { useDrawing } from "../../header/context/DrawingContext";
import { CANVAS_ZOOM_SPEED, CANVAS_PAN_BUTTON_LEFT, CANVAS_PAN_BUTTON_MIDDLE, CANVAS_MIN_ZOOM, CANVAS_MAX_ZOOM } from "../../../utils/canvas-constants";

/**
 * Provides event handlers for canvas navigation (pan and zoom).
 * - Mouse wheel: zoom towards cursor
 * - Middle click or Shift+left click: pan by dragging
 * State is managed in DrawingContext.
 */
export function useCanvasNavigation() {
  const {
    setZoom,
    canvasPosition,
    setCanvasPosition,
    isPanning,
    setIsPanning,
    panStart,
    setPanStart,
  } = useDrawing();

  /** Zoom towards cursor on mouse wheel */
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    // Calculate which point on the canvas is under the cursor
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * CANVAS_ZOOM_SPEED : oldScale / CANVAS_ZOOM_SPEED;
    const newZoom = Math.round(newScale * 100);
    
    // Clamp zoom to min/max limits
    const clampedZoom = Math.min(Math.max(newZoom, CANVAS_MIN_ZOOM), CANVAS_MAX_ZOOM);
    
    // Don't zoom if we're already at the limit
    if (clampedZoom === Math.round(oldScale * 100)) return;

    setZoom(clampedZoom);
    
    // Use the clamped scale for position adjustment
    const clampedScale = clampedZoom / 100;

    // Adjust position so the point under cursor stays in the same screen position
    setCanvasPosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  };

  /** Start panning on middle click or Shift+left click */
  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    const isMiddleClick = e.evt.button === CANVAS_PAN_BUTTON_MIDDLE;
    const isShiftLeftClick = e.evt.button === CANVAS_PAN_BUTTON_LEFT && e.evt.shiftKey;
    
    if (isMiddleClick || isShiftLeftClick) {
      e.evt.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.evt.clientX - canvasPosition.x, y: e.evt.clientY - canvasPosition.y });
    }
  };

  /** Update canvas position while panning */
  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    if (!isPanning || !panStart) return;
    setCanvasPosition({
      x: e.evt.clientX - panStart.x,
      y: e.evt.clientY - panStart.y,
    });
  };

  /** End panning on mouse release */
  const handleMouseUp = () => {
    setIsPanning(false);
    setPanStart(null);
  };

  return {
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}

