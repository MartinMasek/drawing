
import type { FC } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "../ui/sheet"
import { useDrawing } from "../header/context/DrawingContext"



import Button from "../header/header/Button"
import SidePanelTriggerButton from "./SidePanelTriggerButton"


const SidePanel: FC = () => {
    const { isOpenSideDialog, setIsOpenSideDialog } = useDrawing()

    return(
        <Sheet open={isOpenSideDialog} onOpenChange={setIsOpenSideDialog}>
            <SidePanelTriggerButton />
            <SheetContent onInteractOutside={(e) => e.preventDefault()}>
                <SheetHeader>
                    <SheetTitle>Side Panel Title</SheetTitle>
                    <SheetDescription>
                        Work in progress...
                    </SheetDescription>
                </SheetHeader>
                <SheetFooter>
                    <SheetClose asChild>
                        <Button variant="outlined">Close</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
} 
export default SidePanel