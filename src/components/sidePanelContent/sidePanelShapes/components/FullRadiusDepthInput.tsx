import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface FullRadiusDepthInputProps {
    onChange: (value: number) => void;
    fullRadiusDepth: number;
}

const FullRadiusDepthInput: FC<FullRadiusDepthInputProps> = ({ onChange, fullRadiusDepth }) => {
    const handleFullRadiusDepthChange = (value: number) => {
        onChange(value);
    };
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">Full Radius Depth</p>

            <NumberInput className="h-[36px]"
                fullWidth={true}
                value={fullRadiusDepth}
                inputSize="sm"
                endAdornment={<p className="text-sm">in</p>}
                onChange={handleFullRadiusDepthChange}
            />
        </div>
    );
};

export default FullRadiusDepthInput;
