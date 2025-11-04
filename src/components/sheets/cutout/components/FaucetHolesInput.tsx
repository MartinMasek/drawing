import type { FC } from "react";
import Button from "~/components/Button";

interface FaucetHolesInputProps {
    holes: number;
    onChange: (holes: number) => void;
}
const FaucetHolesInput: FC<FaucetHolesInputProps> = ({ holes, onChange }) => {
    const handleHolesChange = (value: number) => {
        onChange(value);
    };
    return (
        <div className="flex flex-col gap-2">
            <p className="text-sm text-text-input-label">
                Faucet Holes Count <span className="text-icons-danger">*</span>
            </p>
            <div className="flex h-[36px] w-[305px] items-center justify-between rounded-lg">
                <Button variant="outlined"
                    color={holes === 0 ? "primary" : "neutral"}
                    className="h-[36px] flex-1 justify-center rounded-r-none border-r-0"
                    onClick={() => handleHolesChange(0)}
                >
                    0
                </Button>
                <Button variant="outlined"
                    color={holes === 1 ? "primary" : "neutral"}
                    className="h-[36px] flex-1 justify-center rounded-none"
                    onClick={() => handleHolesChange(1)}
                >
                    1
                </Button>
                <Button variant="outlined"
                    color={holes === 2 ? "primary" : "neutral"}
                    className="h-[36px] flex-1 justify-center rounded-none"
                    onClick={() => handleHolesChange(2)}
                >
                    2
                </Button>
                <Button variant="outlined"
                    color={holes === 3 ? "primary" : "neutral"}
                    className="h-[36px] flex-1 justify-center rounded-none"
                    onClick={() => handleHolesChange(3)}
                >
                    3
                </Button>
                <Button variant="outlined"
                    color={holes === 4 ? "primary" : "neutral"}
                    className="h-[36px] flex-1 justify-center rounded-none"
                    onClick={() => handleHolesChange(4)}
                >
                    4
                </Button>
                <Button variant="outlined"
                    color={holes === 5 ? "primary" : "neutral"}
                    className="h-[36px] flex-1 justify-center rounded-none"
                    onClick={() => handleHolesChange(5)}
                >
                    5
                </Button>

                <Button variant="outlined"
                    color={holes === 6 ? "primary" : "neutral"}
                    className="h-[36px] flex-1 justify-center rounded-l-none border-l-0"
                    onClick={() => handleHolesChange(6)}
                >
                    6+
                </Button>
            </div>
        </div>
    )
}

export default FaucetHolesInput;