import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface DepthInputProps {
    onChange: (value: number) => void;
    depth: number;
}

const DepthInput: FC<DepthInputProps> = ({ onChange, depth }) => {

    const handleDepthChange = (value: number) => {
        onChange(value);
    };
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">Depth</p>

            <NumberInput className="h-[36px]"
                fullWidth={true}
                value={depth}
                inputSize="sm"
                endAdornment={<p className="text-sm">in</p>}
                onChange={handleDepthChange}
                onlyPositive
            />
        </div>
    );
};

export default DepthInput;
