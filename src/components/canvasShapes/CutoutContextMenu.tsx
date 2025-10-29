import { Icon } from "../header/header/Icon";
import { IconDroplet, IconFlame, IconFrame } from "@tabler/icons-react";
import Button from "../header/header/Button";

interface CutoutContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
}


const CutoutContextMenu = ({ x, y, onClose }: CutoutContextMenuProps) => {
    return (
        <div
            style={{
                position: "fixed",
                left: x + 116,
                top: y + 142,
                zIndex: 1000,
                transform: window.innerWidth >= 768 ? "translate(-50%, -100%)" : "none",
                marginTop: window.innerWidth >= 768 ? "-8px" : "0",
            }}
            className="flex h-auto flex-col items-center gap-1 rounded-[10px] border bg-white font-semibold text-sm shadow-lg"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
                if (e.key === "Escape") {
                    onClose();
                }
                e.stopPropagation();
            }}
        >
            <div className="flex flex-col">
                <Button color="neutral" size="sm" variant="text" className="font-normal" iconLeft={<Icon size="sm"><IconDroplet /></Icon>}>
                    Add Sink Cutout
                </Button>
                <Button color="neutral" size="sm" variant="text" className="font-normal" iconLeft={<Icon size="sm"><IconFlame /></Icon>}>
                    Add Cooktop Cutout
                </Button>
                <Button color="neutral" size="sm" variant="text" className="font-normal" iconLeft={<Icon size="sm"><IconFrame /></Icon>}>
                    Add Other Cutout
                </Button>
            </div>
        </div>
    );
};

export default CutoutContextMenu;