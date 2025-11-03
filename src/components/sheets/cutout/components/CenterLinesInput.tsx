import { CentrelinesX, CentrelinesY } from "@prisma/client";
import type { FC } from "react";
import Button from "~/components/Button";

interface CenterLinesInputProps {
    centerLinesX: CentrelinesX;
    centerLinesY: CentrelinesY;
    onChange: (centerLines: { centerLinesX: CentrelinesX; centerLinesY: CentrelinesY }) => void;
}

const CenterLinesInput: FC<CenterLinesInputProps> = ({ centerLinesY, centerLinesX, onChange }) => {
    const handleCenterLinesYChange = (value: CentrelinesY) => {
        onChange({ centerLinesX, centerLinesY: value });
    };
    const handleCenterLinesXChange = (value: CentrelinesX) => {
        onChange({ centerLinesX: value, centerLinesY });
    };
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">Centrelines</p>
            <div className="flex items-center justify-between gap-2">
                <div className="flex flex-1 items-center">
                    <Button variant="outlined"
                        color={centerLinesX === CentrelinesX.Left ? "primary" : "neutral"}
                        className="h-[36px] flex-1 justify-center rounded-r-none border-r-0"
                        onClick={() => handleCenterLinesXChange(CentrelinesX.Left)}
                    >
                        Left
                    </Button>
                    <Button variant="outlined"
                        color={centerLinesX === CentrelinesX.Right ? "primary" : "neutral"}
                        className="h-[36px] flex-1 justify-center rounded-l-none border-l-0"
                        onClick={() => handleCenterLinesXChange(CentrelinesX.Right)}
                    >
                        Right
                    </Button>
                </div>
                <div className="flex flex-1 items-center">

                    <Button variant="outlined"
                        color={centerLinesY === CentrelinesY.Top ? "primary" : "neutral"}
                        className="h-[36px] flex-1 justify-center rounded-r-none border-r-0"
                        onClick={() => handleCenterLinesYChange(CentrelinesY.Top)}
                    >
                        Top
                    </Button>
                    <Button variant="outlined"
                        color={centerLinesY === CentrelinesY.Bottom ? "primary" : "neutral"}
                        className="h-[36px] flex-1 justify-center rounded-l-none border-l-0"
                        onClick={() => handleCenterLinesYChange(CentrelinesY.Bottom)}
                    >
                        Bottom
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default CenterLinesInput;