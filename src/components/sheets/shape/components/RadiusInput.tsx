import type { FC } from "react";
import { NumberInput } from "~/components/NumberInput";

interface RadiusInputProps {
    onChange: (value: number) => void;
    radius: number;
}

const RadiusInput: FC<RadiusInputProps> = ({ onChange, radius }) => {

    const handleRadiusChange = (value: number) => {
        onChange(value);
    };
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">Radius</p>

            <NumberInput className="h-[36px]"
                fullWidth={true}
                value={radius}
                inputSize="sm"
                endAdornment={<p className="text-sm">in</p>}
                onChange={handleRadiusChange}
            />
        </div>
    );
};

export default RadiusInput;
