
import { useState, type FC } from "react"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "../ui/sheet"
import { useDrawing } from "../header/context/DrawingContext"
import { DrawingTab } from "../header/header/drawing-types"
import { Icon } from "../header/header/Icon"
import { IconLayoutSidebarLeftExpand, IconLayoutSidebarRightExpand } from "@tabler/icons-react"
import Button from "../header/header/Button"


const SidePanel: FC = () => {
    const { activeTab } = useDrawing()
    const [open, setOpen] = useState(false) 

    return(
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger>
            {/* <div className="absolute top-3 right-3 z-50 flex h-[36px] cursor-pointer items-center gap-2 rounded-[10px] py-1 pr-3 pl-2 shadow-lg"> */}
            {/* biome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
                <div
                    onClick={() => setOpen(!open)} // 👈 manually toggle
                    className={`absolute top-3 z-50 flex h-[36px] cursor-pointer items-center gap-2 rounded-[10px] py-1 pr-3 pl-2 shadow-lg transition-all duration-300 ${
                        open ? "right-[396px]" : "right-3"
                    }`}
                >
                    <Icon size='md'>
                        {open ? 
                            <IconLayoutSidebarLeftExpand />
                        :
                            <IconLayoutSidebarRightExpand />
                        }
                    </Icon>
                    {!open && 
                        <>
                        {activeTab === DrawingTab.Dimensions && 
                                <p className="text-sm">Materials</p>
                            }
                            {activeTab === DrawingTab.Shape && 
                                <p className="text-sm">Curves & Bumps</p>
                            }
                            {activeTab === DrawingTab.Edges && 
                                <p className="text-sm">Edges</p>
                            }
                            {activeTab === DrawingTab.Cutouts && 
                                <p className="text-sm">Cutout Parameters</p>
                            }
                            </>
                        }
                
                </div>
            </SheetTrigger>
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