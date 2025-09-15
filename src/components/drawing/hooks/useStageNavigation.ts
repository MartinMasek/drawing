import { useCallback, useRef, useState } from "react";
import type Konva from "konva";
import type { Point } from "../types";
import { ZOOM_MAX, ZOOM_MIN } from "../constants";

export function useStageNavigation(stageRef: React.RefObject<Konva.Stage | null>) {
  const [stageScale, setStageScale] = useState<number>(1);
  const [stagePosition, setStagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const isPanning = useRef<boolean>(false);
  const panLastPoint = useRef<Point | null>(null);

  const clampScale = useCallback((value: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value)), []);

  const toScene = useCallback(
    (containerPoint: Point): Point => ({
      x: (containerPoint.x - stagePosition.x) / stageScale,
      y: (containerPoint.y - stagePosition.y) / stageScale,
    }),
    [stagePosition.x, stagePosition.y, stageScale]
  );

  const getContainerPointerPosition = useCallback((): Point | null => {
    const pos = stageRef.current?.getPointerPosition() ?? null;
    return pos ? { x: pos.x, y: pos.y } : null;
  }, [stageRef]);

  const getScenePointerPosition = useCallback((): Point | null => {
    const p = getContainerPointerPosition();
    return p ? toScene(p) : null;
  }, [getContainerPointerPosition, toScene]);

  const getContainerPointFromEvent = useCallback((evt: MouseEvent | PointerEvent): Point | null => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (pos) return { x: pos.x, y: pos.y };
    const containerRect = stage.container().getBoundingClientRect();
    return { x: evt.clientX - containerRect.left, y: evt.clientY - containerRect.top };
  }, [stageRef]);

  const zoomAtContainerPoint = useCallback((containerPoint: Point, factor: number) => {
    setStageScale((oldScale) => {
      const newScale = clampScale(oldScale * factor);
      setStagePosition((prevPos) => {
        const pointBefore = {
          x: (containerPoint.x - prevPos.x) / oldScale,
          y: (containerPoint.y - prevPos.y) / oldScale,
        };
        return {
          x: containerPoint.x - pointBefore.x * newScale,
          y: containerPoint.y - pointBefore.y * newScale,
        };
      });
      return newScale;
    });
  }, [clampScale]);

  const onWheel = useCallback((e: { evt: WheelEvent }) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const factor = e.evt.deltaY > 0 ? 1 / scaleBy : scaleBy;
    const containerPoint = getContainerPointFromEvent(e.evt);
    if (!containerPoint) return;
    zoomAtContainerPoint(containerPoint, factor);
  }, [getContainerPointFromEvent, zoomAtContainerPoint]);

  const beginPan = useCallback((containerPoint: Point) => {
    isPanning.current = true;
    panLastPoint.current = containerPoint;
  }, []);

  const panMove = useCallback((containerPoint: Point) => {
    if (!isPanning.current || !panLastPoint.current) return;
    const dx = containerPoint.x - panLastPoint.current.x;
    const dy = containerPoint.y - panLastPoint.current.y;
    setStagePosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    panLastPoint.current = containerPoint;
  }, []);

  const panBy = useCallback((dx: number, dy: number) => {
    setStagePosition((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const endPan = useCallback(() => {
    isPanning.current = false;
    panLastPoint.current = null;
  }, []);

  return {
    stageScale,
    stagePosition,
    setStageScale,
    setStagePosition,
    toScene,
    getContainerPointerPosition,
    getScenePointerPosition,
    getContainerPointFromEvent,
    zoomAtContainerPoint,
    onWheel,
    beginPan,
    panMove,
    endPan,
    isPanningRef: isPanning,
    panBy,
  } as const;
}


