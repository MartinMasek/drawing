import React, { type FC } from 'react'
import {
    IconSquareRoundedNumber1,
    IconSquareRoundedNumber1Filled,
    IconSquareRoundedNumber2,
    IconSquareRoundedNumber2Filled,
    IconSquareRoundedNumber3,
    IconSquareRoundedNumber3Filled,
    IconSquareRoundedNumber4,
    IconSquareRoundedNumber4Filled,
    IconSquareRoundedNumber5,
    IconSquareRoundedNumber5Filled,
    IconSquareRoundedNumber6,
    IconSquareRoundedNumber6Filled,
} from '@tabler/icons-react'


import { cn } from '~/utils/ui-utils'
import { useDrawing } from '../context/DrawingContext'
import { DrawingTabList } from './drawing-types'
import { Icon } from './Icon'

const DrawingTabs: FC = () => {
    const { activeTab, setActiveTab } = useDrawing()

    const tabIcons = {
        1: IconSquareRoundedNumber1,
        2: IconSquareRoundedNumber2,
        3: IconSquareRoundedNumber3,
        4: IconSquareRoundedNumber4,
        5: IconSquareRoundedNumber5,
        6: IconSquareRoundedNumber6,
    }

    const tabIconsFilled = {
        1: IconSquareRoundedNumber1Filled,
        2: IconSquareRoundedNumber2Filled,
        3: IconSquareRoundedNumber3Filled,
        4: IconSquareRoundedNumber4Filled,
        5: IconSquareRoundedNumber5Filled,
        6: IconSquareRoundedNumber6Filled,
    }

    return (
        <div className='flex h-full'>
            {DrawingTabList.map(({ id, label }) => {
                const IconComponent = activeTab === id ? tabIconsFilled[id] : tabIcons[id]

                return (
                    // biome-ignore lint/a11y/useButtonType: <explanation>
                    <button
                        className={cn(
                            activeTab === id
                                ? 'border-icons-brand bg-background-checkboxes-selectedBorder text-text-colors-brand'
                                : 'border-transparent',
                            'w-24 border-b-4 cursor-pointer'
                        )}
                        key={id}
                        onClick={() => setActiveTab(id)}
                    >
                        <div className='flex flex-col items-center justify-center'>
                            <Icon size='md'>
                                <IconComponent />
                            </Icon>
                            <p className='text-sm'>{label}</p>
                        </div>
                    </button>
                )
            })}
        </div>
    )
}

export default DrawingTabs
