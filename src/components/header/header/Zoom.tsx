import { IconMinus, IconPlus } from '@tabler/icons-react'

import { cn } from '~/utils/ui-utils'
import { Icon } from './Icon'
import Button from './Button'
import { CANVAS_MIN_ZOOM, CANVAS_MAX_ZOOM } from '~/utils/canvas-constants'
import { Select } from '@headlessui/react'

type ZoomProps = {
    min?: number
    max?: number
    step?: number
    value: number
    onChange: (zoom: number) => void
    className?: string
}

const Zoom: React.FC<ZoomProps> = ({ min = CANVAS_MIN_ZOOM, max = CANVAS_MAX_ZOOM, step = 10, value, onChange, className }) => {
    const updateZoom = (newZoom: number) => {
        const clamped = Math.min(max, Math.max(min, newZoom))
        onChange(clamped)
    }

    const baseLevels = Array.from({ length: Math.floor((max - min) / step) + 1 }, (_, i) => min + i * step)
    
    // Include current value if it's not in the predefined levels
    const zoomLevels = baseLevels.includes(value) 
        ? baseLevels 
        : [...baseLevels, value].sort((a, b) => a - b)

    return (
        <div className={cn('flex', className)}>
            <Button
                className='rounded-r-none'
                color='neutral'
                iconOnly
                onClick={() => updateZoom(value - step)}
                size='sm'
                variant='outlined'
            >
                <Icon size='md'>
                    <IconMinus />
                </Icon>
            </Button>
            
            <Select
                value={value}
                onChange={(e) => updateZoom(Number(e.target.value))}
                className={cn(
                    "w-24 border-neutral-300 border-y bg-white px-2 py-1 text-black text-sm",
                    'focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2'
                )}
                >
                {zoomLevels.map((level) => (
                    <option key={level} value={level}>
                    {level}%
                    </option>
                ))}
            </Select>

            <Button
                className='rounded-l-none'
                color='neutral'
                iconOnly
                onClick={() => updateZoom(value + step)}
                size='sm'
                variant='outlined'
            >
                <Icon size='md'>
                    <IconPlus />
                </Icon>
            </Button>
        </div>
    )
}

export default Zoom
