import type { FC } from "react";
import Button from "../header/header/Button";
import { Divider } from "../header/header/Divider";
import { Icon } from "../header/header/Icon";
import { IconMarquee2, IconPackage, IconTextSize, IconTools } from "@tabler/icons-react";

const EdgesPanel: FC = () => {
    return(
        <div className="absolute top-3 left-3 z-50 flex w-11 flex-col items-center gap-1 rounded-[10px] py-1 shadow-lg">
            <Button color='neutral' iconOnly size='sm' variant='outlined' className="h-[36px] w-[36px]">
                <Icon size='md'>
                {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14 12L16.0896 9.99999M14 12L16.0896 14M14 12L21 12M11 14L11 15M11 8.99999L11 9.99999M11 5.5L11 5C11 3.89543 10.1046 3 9 3L5 3C3.89543 3 3 3.89543 3 5L3 19C3 20.1046 3.89543 21 5 21L9 21C10.1046 21 11 20.1046 11 19L11 18.5" stroke="#6B7280" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                </Icon>
            </Button>
            <Divider />
            <Button color='neutral' iconOnly size='sm' variant='text' className="h-[36px] w-[36px]">
                <Icon size='md'>
                    <IconTextSize />
                </Icon>
            </Button>
            <Button color='neutral' iconOnly size='sm' variant='text' className="h-[36px] w-[36px]">
                <Icon size='md'>
                    <IconMarquee2 />
                </Icon>
            </Button>
            <Button color='neutral' iconOnly size='sm' variant='text' className="h-[36px] w-[36px]">
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

export default EdgesPanel;