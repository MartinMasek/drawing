import type { FC } from "react"
import { useDrawing } from "../header/context/DrawingContext"
import Button from "../header/header/Button"
import { Icon } from "../header/header/Icon"
import { IconBorderRadius, IconDimensions, IconMarquee2, IconTextSize } from "@tabler/icons-react"
import { Divider } from "../header/header/Divider"
import { CursorTypes, DrawingTab } from "../header/header/drawing-types"

const CursorPanel: FC = () => {
    const { activeTab, cursorType, setCursorType } = useDrawing()
    
    return(
        <div className="absolute top-3 left-3 z-50 flex w-11 flex-col items-center gap-1 rounded-[10px] bg-white py-1 shadow-lg">
        {activeTab === DrawingTab.Dimensions && 
            <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Dimesions ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Dimesions)}>
                <Icon size='md'>
                    <IconDimensions />
                </Icon>
            </Button>
        }
        {activeTab === DrawingTab.Shape && 
            <>
            <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Curves ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Curves)}>
                <Icon size='md'>
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.3999 19.2735L7.1999 19.2735C7.1999 19.2735 7.1999 14.4 11.9999 14.4C16.7999 14.4 16.7999 19.2735 16.7999 19.2735L21.5999 19.2735M2.3999 9.67349L7.1999 9.67349L7.1999 4.80002L16.7999 4.80002L16.7999 9.67349L21.5999 9.67349" stroke="#6B7280" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </Icon>
            </Button>
            <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Corners ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Corners)}>
                <Icon size='md'>
                    <IconBorderRadius />
                </Icon>
            </Button>
            </>
        }
        {activeTab === DrawingTab.Edges && 
            <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Egdes ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Egdes)}>
                <Icon size='md'>
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 12L16.0896 9.99999M14 12L16.0896 14M14 12L21 12M11 14L11 15M11 8.99999L11 9.99999M11 5.5L11 5C11 3.89543 10.1046 3 9 3L5 3C3.89543 3 3 3.89543 3 5L3 19C3 20.1046 3.89543 21 5 21L9 21C10.1046 21 11 20.1046 11 19L11 18.5" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </Icon>
            </Button>
        }
        {activeTab === DrawingTab.Cutouts && 
         <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Cutouts ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Cutouts)}>
            <Icon size='md'>
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 11V5C21 4.46957 20.7893 3.96086 20.4142 3.58579C20.0391 3.21071 19.5304 3 19 3H5C4.46957 3 3.96086 3.21071 3.58579 3.58579C3.21071 3.96086 3 4.46957 3 5V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H11M15.9497 20.1924V11.7071M20.1924 15.9497H11.7071M12 11V12H11M6 7V6H7M7 12H6V11M11 6H12V7M19.4853 16.6569C19.6728 16.8444 19.9272 16.9497 20.1924 16.9497C20.4576 16.9497 20.712 16.8444 20.8995 16.6569C21.087 16.4693 21.1924 16.215 21.1924 15.9497C21.1924 15.6845 21.087 15.4302 20.8995 15.2426C20.712 15.0551 20.4576 14.9497 20.1924 14.9497C19.9272 14.9497 19.6728 15.0551 19.4853 15.2426C19.2977 15.4302 19.1924 15.6845 19.1924 15.9497C19.1924 16.215 19.2977 16.4693 19.4853 16.6569ZM15.2426 20.8995C15.4302 21.087 15.6845 21.1924 15.9497 21.1924C16.215 21.1924 16.4693 21.087 16.6569 20.8995C16.8444 20.712 16.9497 20.4576 16.9497 20.1924C16.9497 19.9272 16.8444 19.6728 16.6569 19.4853C16.4693 19.2977 16.215 19.1924 15.9497 19.1924C15.6845 19.1924 15.4302 19.2977 15.2426 19.4853C15.0551 19.6728 14.9497 19.9272 14.9497 20.1924C14.9497 20.4576 15.0551 20.712 15.2426 20.8995Z" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </Icon>
        </Button>
        }
        <Divider />
        <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Text ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Text)}>
            <Icon size='md'>
                <IconTextSize />
            </Icon>
        </Button>
        <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Select ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Select)}>
            <Icon size='md'>
                <IconMarquee2 />
            </Icon>
        </Button>
        <Button color='neutral' iconOnly size='sm' variant={cursorType === CursorTypes.Package ? 'outlined' : 'text'} className="h-[36px] w-[36px]" onClick={()=>setCursorType(CursorTypes.Package)}>
            <Icon size='md'>
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12.5V7.99099C20.9994 7.64206 20.9066 7.29949 20.731 6.99797C20.5554 6.69645 20.3032 6.44669 20 6.27399L16.5 4.26999M12 21.9995C11.6492 21.9995 11.3046 21.908 11 21.734L4 17.726C3.381 17.372 3 16.718 3 16.009V7.99099C3 7.28299 3.381 6.62799 4 6.27299L11 2.26599C11.3046 2.092 11.6492 2.00049 12 2.00049C12.3508 2.00049 12.6954 2.092 13 2.26599L16.5 4.26999M12 21.9995C12.3508 21.9995 12.6954 21.908 13 21.734M12 21.9995V12M12 12L20.73 6.95996M12 12L7.63501 9.47998M3.27002 6.95996L7.63501 9.47998M16 19H22M19 16V22M7.63501 9.47998L16.5 4.26999" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </Icon>
        </Button>
        </div>
    )
}

export default CursorPanel