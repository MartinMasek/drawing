import { CutoutShapeList, CutoutSinkTypeList } from "~/types/drawing";
import { SelectStyled } from "~/components/SelectStyled";
import type { CutoutShape, CutoutSinkType } from "@prisma/client";
import type { FC } from "react";

interface SinkShapeOption {
    label: string;
    value: CutoutShape;
}

interface SinkShapeInputProps {
    value: CutoutShape;
    onChange: (value: CutoutShape) => void;
}

const SinkShapeInput: FC<SinkShapeInputProps> = ({ value, onChange }) => {


    const handleSinkShapeChange = (value?: CutoutShape) => {
        if (value) onChange(value);
    };

    const sinkShapeOptions = CutoutShapeList.map((shape) => ({
        label: shape.label,
        value: shape.id,
    }));
    const selectedOption = sinkShapeOptions.find((opt) => opt.value === value);

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">
                Shape <span className="text-icons-danger">*</span>
            </p>
            <SelectStyled<SinkShapeOption>
                options={sinkShapeOptions}
                inputSize="sm"
                rounded
                className="h-[36px] w-[148.5px]"
                value={selectedOption}
                onChange={(option) => handleSinkShapeChange(option?.value)}
            />
        </div>
    )
}

export default SinkShapeInput;