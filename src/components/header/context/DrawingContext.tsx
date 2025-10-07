import { createContext, useContext, useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { useQueryState } from 'nuqs'
import { CursorTypes, defaultCursorByTab, DrawingTab, DrawingTabList } from '../header/drawing-types'
import { CANVAS_DEFAULT_ZOOM } from '../../../utils/canvas-constants'


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

    isOpenSideDialog: boolean
    setIsOpenSideDialog: (isOpen: boolean) => void
    totalArea: number
    setTotalArea: (area: number) => void
}

const DrawingContext = createContext<DrawingContextType | null>(null)

export const DrawingProvider = ({ children }: { children: React.ReactNode }) => {
    const [zoom, setZoom] = useState(CANVAS_DEFAULT_ZOOM)
    const [isOpenSideDialog, setIsOpenSideDialog] = useState(false)
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

    // This will be used in future to display the total area of the canvas shapes
    const [totalArea, setTotalArea] = useState(0);

    const containerRef = useCallback((node: HTMLDivElement | null) => {
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect()
        }
        
        // Keep canvas size synced with page size
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

    // On tab change
    // Update cursorType
    // Update browser tab name
    // Close side dialog
    useEffect(() => {
        const defaultCursor = defaultCursorByTab[activeTab] ?? CursorTypes.Select
        setCursorType(defaultCursor)

        const currentTab = DrawingTabList.find((tab) => tab.id === activeTab);
        const tabLabel = currentTab?.label ?? "Drawings";
        document.title = `${tabLabel} | Stonify`;

        setIsOpenSideDialog(false)
    }, [activeTab])

    // On curosr type change
    // Close side dialog
    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        setIsOpenSideDialog(false)
    }, [cursorType])


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
        isOpenSideDialog,
        setIsOpenSideDialog,
        totalArea,
        setTotalArea
    }), [activeTab, setActiveTab, zoom, cursorType, containerSize, containerRef, canvasPosition, isPanning, panStart, isOpenSideDialog, totalArea])

    return <DrawingContext.Provider value={value}>{children}</DrawingContext.Provider>
}

export const useDrawing = () => {
    const ctx = useContext(DrawingContext)
    if (!ctx) throw new Error('useDrawing must be used inside DrawingProvider')
    return ctx
}
