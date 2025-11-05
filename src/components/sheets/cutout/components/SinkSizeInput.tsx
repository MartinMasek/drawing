import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface SinkSizeInputProps {
    length: number;
    width: number;
    onChange: (value: { length: number; width: number }) => void;
}
const SinkSizeInput: FC<SinkSizeInputProps> = ({ length, width, onChange }) => {
    const handleLengthChange = (value: number) => {
        onChange({ length: value, width });
    };

    const handleWidthChange = (value: number) => {
        onChange({ length, width: value });
    };
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">
                Size (LxW) <span className="text-icons-danger">*</span>
            </p>
            <div className="flex w-[305px] items-center justify-between">
                <NumberInput className="h-[36px] w-[140px]"
                    value={length}
                    inputSize="sm"
                    endAdornment={<p className="text-sm">in</p>}
                    onChange={handleLengthChange}
                    onlyPositive
                />
                <p className="text-sm text-text-neutral-disabled">x</p>
                <NumberInput className="h-[36px] w-[140px]"
                    value={width}
                    inputSize="sm"
                    endAdornment={<p className="text-sm">in</p>}
                    onChange={handleWidthChange}
                    onlyPositive
                />
            </div>
        </div>
    );
};

export default SinkSizeInput;