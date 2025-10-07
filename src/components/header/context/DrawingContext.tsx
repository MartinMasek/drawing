import { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import type { InteractionMode, ToolMode } from '../../drawing-old/types'
import { useQueryState } from 'nuqs'
import { DrawingTab, DrawingTabList } from '../header/drawing-types'
import { CANVAS_DEFAULT_ZOOM } from '../../../utils/canvas-constants'


export enum CursorTypes {
    Dimesions = 1,
    Curves = 2,
    Corners = 3,
    Egdes = 4,
    Cutouts = 5,
    Layout = 6,
    Quote = 7,
    Text = 8,
    Select = 9,
    Package = 10
}

type DrawingContextType = {
    activeTab: number
    setActiveTab: (tab: number) => void
    zoom: number
    setZoom: (zoom: number) => void
    cursorType: number
    setCursorType: (type: number) => void
    // Canvas container size
    containerSize: { width: number; height: number }
    containerRef: (node: HTMLDivElement | null) => void
    // Canvas navigation state
    canvasPosition: { x: number; y: number }
    setCanvasPosition: (pos: { x: number; y: number }) => void
    isPanning: boolean
    setIsPanning: (panning: boolean) => void
    panStart: { x: number; y: number } | null
    setPanStart: (start: { x: number; y: number } | null) => void
    // Canvas actions
    exportJpeg: () => void
    exportJson: () => void
    importJsonToImage: () => void
    toggleLog: () => void
    spawn1k: () => void
    spawn5k: () => void
    clearRects: () => void
    setCanvasActions: (actions: Partial<{ exportJpeg: () => void; exportJson: () => void; importJsonToImage: () => void; toggleLog: () => void; spawn1k: () => void; spawn5k: () => void; clearRects: () => void }>) => void
    // Canvas state exposure for header UI
    mode: InteractionMode
    setMode: (m: InteractionMode) => void
    defaultEdgeColor: string
    setDefaultEdgeColor: (v: string) => void
    defaultCornerColor: string
    setDefaultCornerColor: (v: string) => void
    tool: ToolMode
    setTool: (t: ToolMode) => void
    selectedImageSrc: string
    setSelectedImageSrc: (src: string) => void
    // Canvas registers setters so header changes can propagate to canvas
    setCanvasSetters: (setters: Partial<{ setMode: (m: InteractionMode) => void; setDefaultEdgeColor: (v: string) => void; setDefaultCornerColor: (v: string) => void; setTool: (t: ToolMode) => void; setSelectedImageSrc: (src: string) => void }>) => void
    // Canvas pushes its current values into context snapshot
    setCanvasState: (state: Partial<{ mode: InteractionMode; defaultEdgeColor: string; defaultCornerColor: string; tool: ToolMode; selectedImageSrc: string }>) => void
}

const DrawingContext = createContext<DrawingContextType | null>(null)

export const DrawingProvider = ({ children }: { children: React.ReactNode }) => {
    const [zoom, setZoom] = useState(CANVAS_DEFAULT_ZOOM)
    const [activeTab, setActiveTab] = useQueryState('tab', {
        defaultValue: DrawingTab.Dimensions,
        parse: (v) => Number(v) as DrawingTab,
        serialize: String,
    })

    const [cursorType, setCursorType] = useState(CursorTypes.Dimesions)
    const [containerSize, setContainerSize] = useState({ width: 800, height: 600 })
    const resizeObserverRef = useRef<ResizeObserver | null>(null)
    
    // Canvas navigation state
    const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 })
    const [isPanning, setIsPanning] = useState(false)
    const [panStart, setPanStart] = useState<{ x: number; y: number } | null>(null)

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect()
        }
        
        if (node) {
            const updateSize = () => {
                const rect = node.getBoundingClientRect()
                setContainerSize({ 
                    width: Math.floor(rect.width), 
                    height: Math.floor(rect.height) 
                })
            }
            
            updateSize()
            resizeObserverRef.current = new ResizeObserver(updateSize)
            resizeObserverRef.current.observe(node)
        }
    }, [])
    
    const defaultCursorByTab: Record<DrawingTab, CursorTypes> = {
        [DrawingTab.Dimensions]: CursorTypes.Dimesions,
        [DrawingTab.Shape]: CursorTypes.Curves,
        [DrawingTab.Edges]: CursorTypes.Egdes,
        [DrawingTab.Cutouts]: CursorTypes.Cutouts,
        [DrawingTab.Layout]: CursorTypes.Layout,
        [DrawingTab.Quote]: CursorTypes.Quote,
    }
    
    // Update cursorType whenever tab changes 
    // Update browser tab name
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const defaultCursor = defaultCursorByTab[activeTab] ?? CursorTypes.Select
        setCursorType(defaultCursor)

        const currentTab = DrawingTabList.find((tab) => tab.id === activeTab);
        const tabLabel = currentTab?.label ?? "Drawings";
        document.title = `${tabLabel} | Stonify`;
    }, [activeTab])

    // ----- THIS IS JUST HELPERS, WILL NOT BE PROD CODE -------- // 
    const exportJpegRef = useRef<(() => void) | undefined>(undefined)
    const exportJsonRef = useRef<(() => void) | undefined>(undefined)
    const importJsonToImageRef = useRef<(() => void) | undefined>(undefined)
    const toggleLogRef = useRef<(() => void) | undefined>(undefined)
    const spawn1kRef = useRef<(() => void) | undefined>(undefined)
    const spawn5kRef = useRef<(() => void) | undefined>(undefined)
    const clearRectsRef = useRef<(() => void) | undefined>(undefined)

    // Canvas state mirrors (for header UI)
    const [mode, setModeState] = useState<InteractionMode>('edge')
    const [defaultEdgeColor, setDefaultEdgeColorState] = useState<string>('#000000')
    const [defaultCornerColor, setDefaultCornerColorState] = useState<string>('#000000')
    const [tool, setToolState] = useState<ToolMode>('rect')
    const [selectedImageSrc, setSelectedImageSrcState] = useState<string>('')

    // Canvas setter refs, so context can forward header changes back to canvas
    const setModeCanvasRef = useRef<((m: InteractionMode) => void) | undefined>(undefined)
    const setDefaultEdgeColorCanvasRef = useRef<((v: string) => void) | undefined>(undefined)
    const setDefaultCornerColorCanvasRef = useRef<((v: string) => void) | undefined>(undefined)
    const setToolCanvasRef = useRef<((t: ToolMode) => void) | undefined>(undefined)
    const setSelectedImageSrcCanvasRef = useRef<((src: string) => void) | undefined>(undefined)

    const setCanvasActions: DrawingContextType['setCanvasActions'] = useCallback((actions) => {
        if (Object.prototype.hasOwnProperty.call(actions, 'exportJpeg')) exportJpegRef.current = actions.exportJpeg
        if (Object.prototype.hasOwnProperty.call(actions, 'exportJson')) exportJsonRef.current = actions.exportJson
        if (Object.prototype.hasOwnProperty.call(actions, 'importJsonToImage')) importJsonToImageRef.current = actions.importJsonToImage
        if (Object.prototype.hasOwnProperty.call(actions, 'toggleLog')) toggleLogRef.current = actions.toggleLog
        if (Object.prototype.hasOwnProperty.call(actions, 'spawn1k')) spawn1kRef.current = actions.spawn1k
        if (Object.prototype.hasOwnProperty.call(actions, 'spawn5k')) spawn5kRef.current = actions.spawn5k
        if (Object.prototype.hasOwnProperty.call(actions, 'clearRects')) clearRectsRef.current = actions.clearRects
    }, [])

    const setCanvasSetters: DrawingContextType['setCanvasSetters'] = useCallback((setters) => {
        if (Object.prototype.hasOwnProperty.call(setters, 'setMode')) setModeCanvasRef.current = setters.setMode
        if (Object.prototype.hasOwnProperty.call(setters, 'setDefaultEdgeColor')) setDefaultEdgeColorCanvasRef.current = setters.setDefaultEdgeColor
        if (Object.prototype.hasOwnProperty.call(setters, 'setDefaultCornerColor')) setDefaultCornerColorCanvasRef.current = setters.setDefaultCornerColor
        if (Object.prototype.hasOwnProperty.call(setters, 'setTool')) setToolCanvasRef.current = setters.setTool
        if (Object.prototype.hasOwnProperty.call(setters, 'setSelectedImageSrc')) setSelectedImageSrcCanvasRef.current = setters.setSelectedImageSrc
    }, [])

    const setCanvasState: DrawingContextType['setCanvasState'] = useCallback((state) => {
        if (Object.prototype.hasOwnProperty.call(state, 'mode') && state.mode !== undefined) setModeState(state.mode)
        if (Object.prototype.hasOwnProperty.call(state, 'defaultEdgeColor') && state.defaultEdgeColor !== undefined) setDefaultEdgeColorState(state.defaultEdgeColor)
        if (Object.prototype.hasOwnProperty.call(state, 'defaultCornerColor') && state.defaultCornerColor !== undefined) setDefaultCornerColorState(state.defaultCornerColor)
        if (Object.prototype.hasOwnProperty.call(state, 'tool') && state.tool !== undefined) setToolState(state.tool)
        if (Object.prototype.hasOwnProperty.call(state, 'selectedImageSrc') && state.selectedImageSrc !== undefined) setSelectedImageSrcState(state.selectedImageSrc)
    }, [])
    // ------------------------------------- // 

    const value = useMemo<DrawingContextType>(() => ({
        activeTab,
        setActiveTab,
        zoom,
        setZoom,
        cursorType,
        setCursorType,
        containerSize,
        containerRef,
        canvasPosition,
        setCanvasPosition,
        isPanning,
        setIsPanning,
        panStart,
        setPanStart,
        exportJpeg: () => { exportJpegRef.current?.() },
        exportJson: () => { exportJsonRef.current?.() },
        importJsonToImage: () => { importJsonToImageRef.current?.() },
        toggleLog: () => { toggleLogRef.current?.() },
        spawn1k: () => { spawn1kRef.current?.() },
        spawn5k: () => { spawn5kRef.current?.() },
        clearRects: () => { clearRectsRef.current?.() },
        // header UI state and setters
        mode,
        setMode: (m) => { setModeState(m); setModeCanvasRef.current?.(m) },
        defaultEdgeColor,
        setDefaultEdgeColor: (v) => { setDefaultEdgeColorState(v); setDefaultEdgeColorCanvasRef.current?.(v) },
        defaultCornerColor,
        setDefaultCornerColor: (v) => { setDefaultCornerColorState(v); setDefaultCornerColorCanvasRef.current?.(v) },
        tool,
        setTool: (t) => { setToolState(t); setToolCanvasRef.current?.(t) },
        selectedImageSrc,
        setSelectedImageSrc: (src) => { setSelectedImageSrcState(src); setSelectedImageSrcCanvasRef.current?.(src) },
        setCanvasSetters,
        setCanvasState,
        setCanvasActions,
    }), [activeTab, setActiveTab, zoom, cursorType, containerSize, containerRef, canvasPosition, isPanning, panStart, setCanvasActions, setCanvasSetters, setCanvasState, defaultCornerColor, defaultEdgeColor, mode, selectedImageSrc, tool])

    return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>
}

export const useDrawing = () => {
    const ctx = useContext(DrawingContext)
    if (!ctx) throw new Error('useDrawing must be used inside DrawingProvider')
    return ctx
}
