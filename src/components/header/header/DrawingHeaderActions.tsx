import type { FC } from 'react'
import {
    IconArrowBackUp,
    IconArrowForwardUp,
    IconCreativeCommons,
    IconDeviceFloppy,
    IconFile,
    IconFolderOpen,
    IconHelp,
    IconSettings,
    IconTableExport,
    IconTableImport,
    
} from '@tabler/icons-react'

import { Divider } from './Divider'
import Zoom from './Zoom'
import { useDrawing } from '../context/DrawingContext'
import Button from './Button'
import { Icon } from './Icon'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { IMAGE_OPTIONS } from '../../drawing-old/constants'

const DrawingHeaderActions: FC = () => {
    const {
        zoom,
        setZoom,
        exportJpeg,
        exportJson,
        importJsonToImage,
        toggleLog,
        spawn1k,
        spawn5k,
        mode,
        setMode,
        defaultEdgeColor,
        setDefaultEdgeColor,
        defaultCornerColor,
        setDefaultCornerColor,
        tool,
        setTool,
        selectedImageSrc,
        setSelectedImageSrc,
        clearRects,
    } = useDrawing()

    return (
        <div className='flex h-full items-center'>
            <Zoom className='flex px-3' onChange={setZoom} value={zoom} />
            <Divider className='h-full' orientation='vertical' />
            {/* Undo / Redo */}
            <div className='flex items-center gap-2 px-3'>
                <Button color='neutral' iconOnly size='sm' variant='outlined'>
                    <Icon size='md'>
                        <IconArrowBackUp />
                    </Icon>
                </Button>
                <Button color='neutral' iconOnly size='sm' variant='outlined'>
                    <Icon size='md'>
                        <IconArrowForwardUp />
                    </Icon>
                </Button>
            </div>
            <Divider className='h-full' orientation='vertical' />
            {/* Settings / Help / Save */}
            <div className='flex items-center gap-2 px-3'>
                <Button color='neutral' iconOnly size='sm' variant='outlined'>
                    <Icon size='md'>
                        <IconSettings />
                    </Icon>
                </Button>
                <Button color='neutral' iconOnly size='sm' variant='outlined'>
                    <Icon size='md'>
                        <IconHelp />
                    </Icon>
                </Button>
                <Button
                    className='h-[38px]'
                    color='primary'
                    iconLeft={
                        <Icon size='md'>
                            <IconDeviceFloppy />
                        </Icon>
                    }
                    size='sm'
                >
                    Save
                </Button>
            </div>
        </div>
    )
}

export default DrawingHeaderActions
