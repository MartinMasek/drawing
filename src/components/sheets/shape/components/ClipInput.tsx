import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface ClipInputProps {
    onChange: (value: number) => void;
    clip: number;
}

const ClipInput: FC<ClipInputProps> = ({ onChange, clip }) => {

    const handleClipChange = (value: number) => {
        onChange(value);
    };
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">Clip</p>

            <NumberInput className="h-[36px]"
                fullWidth={true}
                value={clip}
                inputSize="sm"
                endAdornment={<p className="text-sm">in</p>}
                onChange={handleClipChange}
                onlyPositive
            />
        </div>
    );
};

export default ClipInput;
