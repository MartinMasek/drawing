import type { InteractionMode, ToolMode } from "./types";
import { IMAGE_OPTIONS } from "./constants";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSpawn1k: () => void;
  onSpawn5k: () => void;
  onClearRects: () => void;
  onExportJpeg: () => void;
  onExportJson: () => void;
  onImportJsonToImage: () => void;
  showLog: boolean;
  onToggleLog: () => void;
  mode: InteractionMode;
  onModeChange: (mode: InteractionMode) => void;
  defaultEdgeColor: string;
  defaultCornerColor: string;
  onDefaultEdgeColorChange: (value: string) => void;
  onDefaultCornerColorChange: (value: string) => void;
  tool: ToolMode;
  onToolChange: (tool: ToolMode) => void;
  selectedImageSrc: string;
  onSelectedImageChange: (src: string) => void;
};

export default function Toolbar(props: Props) {
  const {
    onZoomIn,
    onZoomOut,
    onSpawn1k,
    onSpawn5k,
    onClearRects,
    onExportJpeg,
    onExportJson,
    onImportJsonToImage,
    showLog,
    onToggleLog,
    mode,
    onModeChange,
    defaultEdgeColor,
    defaultCornerColor,
    onDefaultEdgeColorChange,
    onDefaultCornerColorChange,
    tool,
    onToolChange,
    selectedImageSrc,
    onSelectedImageChange,
  } = props;

  return (
    <div className="mb-2 flex items-center gap-2">
      <button
        type="button"
        onClick={onZoomOut}
        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        -
      </button>
      <button
        type="button"
        onClick={onZoomIn}
        className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        +
      </button>
      <div className="ml-2 flex items-center gap-2">
        <button
          type="button"
          onClick={onSpawn1k}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Spawn 1k
        </button>
        <button
          type="button"
          onClick={onSpawn5k}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Spawn 5k
        </button>
        <button
          type="button"
          onClick={onClearRects}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onExportJpeg}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Export JPEG
        </button>
        <button
          type="button"
          onClick={onExportJson}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Log JSON
        </button>
        <button
          type="button"
          onClick={onImportJsonToImage}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Paste JSON → Image
        </button>
        <button
          type="button"
          onClick={onToggleLog}
          className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {showLog ? "Hide Log" : "Show Log"}
        </button>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <label htmlFor="mode-select" className="text-gray-600 text-sm">
          Mode
        </label>
        <select
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          id="mode-select"
          value={mode}
          onChange={(e) => onModeChange(e.target.value as typeof mode)}
        >
          <option value="edge">Edge</option>
          <option value="edge-new">Edge (custom)</option>
          <option value="corner">Corner</option>
          <option value="corner-new">Corner (custom)</option>
          <option value="sink">Sink</option>
          <option value="line">Line</option>
          <option value="reshape">Reshape</option>
          <option value="vain-match">Vain Match</option>
        </select>
      </div>
      <div className="ml-4 flex items-center gap-2">
        <span className="text-gray-600 text-sm">Defaults</span>
        <label className="text-gray-600 text-sm" htmlFor="def-edge">Edge</label>
        <input id="def-edge" type="color" value={defaultEdgeColor} onChange={(e) => onDefaultEdgeColorChange(e.target.value)} className="h-6 w-10 cursor-pointer" />
        <label className="text-gray-600 text-sm" htmlFor="def-corner">Corner</label>
        <input id="def-corner" type="color" value={defaultCornerColor} onChange={(e) => onDefaultCornerColorChange(e.target.value)} className="h-6 w-10 cursor-pointer" />
      </div>
      <div className="ml-4 flex items-center gap-2">
        <label htmlFor="tool-select" className="text-gray-600 text-sm">
          Tool
        </label>
        <select
          id="tool-select"
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          value={tool}
          onChange={(e) => onToolChange(e.target.value as ToolMode)}
        >
          <option value="rect">Rectangle</option>
          <option value="image">Image</option>
          <option value="seam">Seam</option>
        </select>
        {tool === "image" && (
          <>
            <label htmlFor="image-select" className="text-gray-600 text-sm">
              Image
            </label>
            <select
              id="image-select"
              className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={selectedImageSrc}
              onChange={(e) => onSelectedImageChange(e.target.value)}
            >
              {IMAGE_OPTIONS.map((opt) => (
                <option key={opt.src} value={opt.src}>
                  {opt.label}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}


