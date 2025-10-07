import { Stage, Layer, Rect } from 'react-konva';
import CursorPanel from './drawing-old/CursorPanel';
import SidePanel from './drawing-old/SidePanel';
import { useCanvasNavigation } from './drawing-old/hooks/useCanvasNavigation';
import { useDrawing } from './header/context/DrawingContext';

const DrawingCanvas = () => {
  const { containerSize, containerRef, canvasPosition, zoom } = useDrawing();
  
  const { handleWheel, handleMouseDown, handleMouseMove, handleMouseUp } = useCanvasNavigation();
  
  const scale = zoom / 100;

  return (
    <div
      ref={containerRef}
      className="relative flex h-full min-h-0 w-full flex-1 overflow-hidden"
    >
      {/* Top left corner */}
      <CursorPanel />

      {/* Top right corner */}
      <SidePanel />

      <Stage
        width={containerSize.width}
        height={containerSize.height}
        x={canvasPosition.x}
        y={canvasPosition.y}
        scaleX={scale}
        scaleY={scale}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          backgroundColor: 'white',
          touchAction: 'none',
        }}
      >
        <Layer>
            <Rect x={0} y={0} width={100} height={100} fill="red" />
          {/* Empty layer - ready for content */}
        </Layer>
      </Stage>
    </div>
  );
};

export default DrawingCanvas;