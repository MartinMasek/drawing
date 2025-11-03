import { Icon } from "../../header/header/Icon";
import { IconDroplet, IconFlame, IconFrame } from "@tabler/icons-react";
import Button from "../../header/header/Button";
import type { CanvasShape } from "~/types/drawing";
import useCreateCutout from "~/hooks/mutations/cutouts/useCreateCutout";
import { CutoutShape, CutoutSinkType } from "@prisma/client";

interface CutoutContextMenuProps {
    x: number;
    y: number;
    shape: CanvasShape;
    designId?: string;
    onClose: () => void;
}


const CutoutContextMenu = ({ x, y, shape, designId, onClose }: CutoutContextMenuProps) => {
    const createCutoutMutation = useCreateCutout(designId);

    const handleAddSinkCutout = () => {
        createCutoutMutation.mutate({
            shapeId: shape.id,
            sinkType: CutoutSinkType.Undermount,
            shape: CutoutShape.Rectangle,
            posX: x,
            posY: y,
        });
        onClose()
    }

    const handleAddCooktopCutout = () => { }

    const handleAddOtherCutout = () => { }
    return (
        <div
            style={{
                position: "fixed",
                left: x + 102,
                top: y + 132,
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
                <Button
                    color="neutral"
                    size="sm"
                    variant="text"
                    className="font-normal"
                    iconLeft={<Icon size="sm"><IconDroplet /></Icon>}
                    onClick={handleAddSinkCutout}
                >
                    Add Sink Cutout
                </Button>
                <Button
                    color="neutral"
                    size="sm"
                    variant="text"
                    className="font-normal"
                    iconLeft={<Icon size="sm"><IconFlame /></Icon>}
                    onClick={handleAddCooktopCutout}
                    disabled
                >
                    Add Cooktop Cutout
                </Button>
                <Button
                    color="neutral"
                    size="sm"
                    variant="text"
                    className="font-normal"
                    iconLeft={<Icon size="sm"><IconFrame /></Icon>}
                    onClick={handleAddOtherCutout}
                    disabled
                >
                    Add Other Cutout
                </Button>
            </div>
        </div>
    );
};

export default CutoutContextMenu;