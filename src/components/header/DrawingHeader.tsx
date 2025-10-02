import type { FC } from 'react'

import { Divider } from './header/Divider'
import DrawingHeaderInfo from './header/DrawingHeaderInfo'
import DrawingTabs from './header/DrawingTabs'
import DrawingHeaderActions from './header/DrawingHeaderActions'

const DrawingHeader: FC = () => {
    return (
        <div className='flex h-[56px] w-full items-center overflow-x-hidden border-border-neutral border-b bg-white'>
            <DrawingHeaderInfo />
            <Divider className='h-full' orientation='vertical' />
            <DrawingTabs />
            <Divider className='h-full' orientation='vertical' />
            <DrawingHeaderActions />
        </div>
    )
}

export default DrawingHeader
