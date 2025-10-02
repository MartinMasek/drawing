import type { FC } from 'react'
import { useDrawing } from './context/DrawingContext'


const DrawingCanvas: FC = () => {
    const { activeTab, zoom } = useDrawing()

    return (
        <div>
            <p>Tab: {activeTab}</p>
            <p>Zoom: {zoom}</p>
        </div>
    )
}

export default DrawingCanvas
