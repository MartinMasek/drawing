import type { FC } from "react";
import Button from "../header/header/Button";
import { Divider } from "../header/header/Divider";
import { Icon } from "../header/header/Icon";
import { IconBorderRadius, IconMarquee2, IconPackage, IconTextSize} from "@tabler/icons-react";

const ShapePanel: FC = () => {
    return(
        <div className="absolute top-3 left-3 z-50 flex w-11 flex-col items-center gap-1 rounded-[10px] py-1 shadow-lg">
            <Button color='neutral' iconOnly size='sm' variant='outlined' className="h-[36px] w-[36px]">
                <Icon size='md'>
                    {/* biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2.3999 19.2735L7.1999 19.2735C7.1999 19.2735 7.1999 14.4 11.9999 14.4C16.7999 14.4 16.7999 19.2735 16.7999 19.2735L21.5999 19.2735M2.3999 9.67349L7.1999 9.67349L7.1999 4.80002L16.7999 4.80002L16.7999 9.67349L21.5999 9.67349" stroke="#6B7280" stroke-width="1.67" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

                </Icon>
            </Button>
            <Button color='neutral' iconOnly size='sm' variant='text' className="h-[36px] w-[36px]">
                <Icon size='md'>
                    <IconBorderRadius />
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

export default ShapePanel;