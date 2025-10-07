import type { FC } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'

import { Divider } from './Divider'
import Button from './Button'
import { Icon } from './Icon'
import { useDrawing } from '../context/DrawingContext'

const DrawingHeaderInfo: FC = () => {
    const { totalArea } = useDrawing()
    return (
        <div className='flex min-w-[320px] flex-1 items-center gap-2 pr-4 pl-2'>
            <Button color='neutral' iconOnly size='sm' variant='text'>
                <Icon size='md'>
                    <IconArrowLeft />
                </Icon>
            </Button>
            <div className='flex flex-col gap-0.5'>
                <p className='text-sm'>Quote title</p>
                <span className='flex items-center gap-2 text-text-neutral-terciary text-xs'>
                    <p>
                        Total area: <b>{totalArea} SF</b>
                    </p>
                    <Divider className='h-3' orientation='vertical' />
                    <p>
                        Packages: <b>1</b>
                    </p>
                </span>
            </div>
        </div>
    )
}

export default DrawingHeaderInfo
