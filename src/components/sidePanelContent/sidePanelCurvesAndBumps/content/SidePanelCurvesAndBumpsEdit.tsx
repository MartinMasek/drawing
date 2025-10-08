
import { IconArrowLeft, IconCopy, IconPlus, IconTrash } from "@tabler/icons-react"
import type { FC } from "react"
import Button from "~/components/header/header/Button"
import { Divider } from "~/components/header/header/Divider"
import { Icon } from "~/components/header/header/Icon"
import  { SheetHeader, SheetTitle, SheetFooter } from "~/components/ui/sheet"


interface SidePanelCurvesAndBumpsEditProps {
    setView: (value: 'general' | 'editCurves') => void
}

const SidePanelCurvesAndBumpsEdit: FC<SidePanelCurvesAndBumpsEditProps> = ({ setView }) => {
    return(
    <>
        <SheetHeader>
        <SheetTitle className="flex items-center gap-2 text-xl">
                    <Button color='neutral' iconOnly size='sm' variant='text' onClick={()=>setView('general')}>
                        <Icon size='md'>
                            <IconArrowLeft />
                        </Icon>
                    </Button>
                    Bump Parameters
                </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 p-4">
            <p className="text-gray-400 text-sm">Work in progress...</p>
        </div>
        <SheetFooter>
                <div className="flex w-full items-center gap-2">
                    <Button 
                        variant="outlined" 
                        iconLeft={
                            <Icon size='md'>
                                <IconCopy />
                            </Icon>
                        }
                        color='neutral' 
                        disabled
                        className="flex-1 justify-center"
                        >
                            Duplicate
                    </Button>
                    <Button 
                        variant="outlined" 
                        iconLeft={
                            <Icon size='md'>
                                <IconTrash />
                            </Icon>
                        }
                        color='danger' 
                        className="flex-1 justify-center"
                        >
                            Remove
                    </Button>
                </div>
            </SheetFooter>
    </>
    )
}

export default SidePanelCurvesAndBumpsEdit