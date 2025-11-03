import { CutoutSinkTypeList } from "~/types/drawing";
import { SelectStyled } from "~/components/SelectStyled";
import type { CutoutSinkType } from "@prisma/client";
import type { FC } from "react";

interface SinkTypeOption {
    label: string;
    value: CutoutSinkType;
}

interface SinkTypeInputProps {
    value: CutoutSinkType;
    onChange: (value: CutoutSinkType) => void;
}

const SinkTypeInput: FC<SinkTypeInputProps> = ({ value, onChange }) => {


    const handleSinkTypeChange = (value?: CutoutSinkType) => {
        if (value) onChange(value);
    };

    const sinkTypeOptions = CutoutSinkTypeList.map((type) => ({
        label: type.label,
        value: type.id,
    }));
    const selectedOption = sinkTypeOptions.find((opt) => opt.value === value);

    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">
                Sink Type <span className="text-icons-danger">*</span>
            </p>
            <SelectStyled<SinkTypeOption>
                options={sinkTypeOptions}
                inputSize="sm"
                rounded
                className="h-[36px] w-[148.5px]"
                value={selectedOption}
                onChange={(option) => handleSinkTypeChange(option?.value)}
            />
        </div>
    )
}

export default SinkTypeInput;