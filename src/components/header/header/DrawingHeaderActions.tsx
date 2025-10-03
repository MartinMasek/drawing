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
import { IMAGE_OPTIONS } from '../../drawing/constants'

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
                <Popover>
                    <PopoverButton as="div">
                        <Button color='neutral' iconOnly size='sm' variant='outlined'>
                            <Icon size='md'>
                                <IconSettings />
                            </Icon>
                        </Button>
                    </PopoverButton>
                    <PopoverPanel anchor='top' className="mt-1 flex min-w-[320px] flex-col gap-3 rounded-md border border-gray-200 bg-white px-3 py-3">
                        <div className='flex items-center gap-2'>
                            <label htmlFor='mode-select' className='text-gray-600 text-sm'>Mode</label>
                            <select
                                id='mode-select'
                                className='rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                                value={mode}
                                onChange={(e) => setMode(e.target.value as typeof mode)}
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
                        <div className='flex items-center gap-2'>
                            <span className='text-gray-600 text-sm'>Defaults</span>
                            <label className='text-gray-600 text-sm' htmlFor='def-edge'>Edge</label>
                            <input id='def-edge' type='color' value={defaultEdgeColor} onChange={(e) => setDefaultEdgeColor(e.target.value)} className='h-6 w-10 cursor-pointer' />
                            <label className='text-gray-600 text-sm' htmlFor='def-corner'>Corner</label>
                            <input id='def-corner' type='color' value={defaultCornerColor} onChange={(e) => setDefaultCornerColor(e.target.value)} className='h-6 w-10 cursor-pointer' />
                        </div>
                        <div className='flex items-center gap-2'>
                            <label htmlFor='tool-select' className='text-gray-600 text-sm'>Tool</label>
                            <select
                                id='tool-select'
                                className='rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                                value={tool}
                                onChange={(e) => setTool(e.target.value as 'rect' | 'image' | 'seam')}
                            >
                                <option value="rect">Rectangle</option>
                                <option value="image">Image</option>
                                <option value="seam">Seam</option>
                            </select>
                            {tool === 'image' && (
                                <>
                                    <label htmlFor='image-select' className='text-gray-600 text-sm'>Image</label>
                                    <select
                                        id='image-select'
                                        className='rounded-md border border-gray-200 bg-white px-2 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
                                        value={selectedImageSrc}
                                        onChange={(e) => setSelectedImageSrc(e.target.value)}
                                    >
                                        {IMAGE_OPTIONS.map((opt) => (
                                            <option key={opt.src} value={opt.src}>{opt.label}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                        </div>
                        <div className='flex items-center gap-2'>
                            <Button type='button' color='neutral' size='sm' variant='outlined' onClick={clearRects}>Clear</Button>
                        </div>
                    </PopoverPanel>
                </Popover>
                <Popover>
                    <PopoverButton as="div">
                        <Button color='neutral' iconOnly size='sm' variant='outlined'>
                            <Icon size='md'>
                                <IconHelp />
                            </Icon>
                        </Button>
                </PopoverButton>
                <PopoverPanel anchor='top' className="mt-1 flex flex-col gap-2 rounded-md border border-gray-200 bg-white px-2 py-3">
                    <Button
                        className='h-[38px]'
                        color='primary'
                        variant='outlined'
                        iconLeft={
                            <Icon size='md'>
                                <IconCreativeCommons />
                            </Icon>
                        }
                        size='sm'
                        onClick={spawn1k}
                    >
                        Spawn 1k
                    </Button>
                    <Button
                        className='h-[38px]'
                        color='primary'
                        variant='outlined'
                        iconLeft={
                            <Icon size='md'>
                                <IconCreativeCommons />
                            </Icon>
                        }
                        size='sm'
                        onClick={spawn5k}
                    >
                       Spawn 5k
                    </Button>
                    <Button
                        className='h-[38px]'
                        color='primary'
                        variant='outlined'
                        iconLeft={
                            <Icon size='md'>
                                <IconTableExport />
                            </Icon>
                        }
                        size='sm'
                        onClick={exportJpeg}
                    >
                        Export JPEG
                    </Button>
                    <Button
                        className='h-[38px]'
                        color='primary'
                        variant='outlined'
                        iconLeft={
                            <Icon size='md'>
                                <IconFile />
                            </Icon>
                        }
                        size='sm'
                        onClick={exportJson}
                    >
                        Log JSON
                    </Button>
                    <Button
                        className='h-[38px]'
                        color='primary'
                        variant='outlined'
                        iconLeft={
                            <Icon size='md'>
                                <IconTableImport />
                            </Icon>
                        }
                        size='sm'
                        onClick={importJsonToImage}
                    >
                        Paste JSON
                    </Button>
                    <Button
                        className='h-[38px]'
                        color='primary'
                        variant='outlined'
                        iconLeft={
                            <Icon size='md'>
                                <IconFolderOpen />
                            </Icon>
                        }
                        size='sm'
                        onClick={toggleLog}
                    >
                        Show log
                    </Button>
                </PopoverPanel>
                </Popover>
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
