import type { ButtonHTMLAttributes, FC, ReactNode } from "react";
import { cn } from "~/lib/utils";

type StringOrNumber = string | number;
export type ToggleButtonValidValueType =
	| StringOrNumber
	| StringOrNumber[]
	| boolean
	| null;

export interface ToggleButtonProps<T extends ToggleButtonValidValueType>
	extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "onClick"> {
	value: T;
	isActive?: boolean;
	onClick?: (value: T) => void;
	children: ReactNode;
	isEnd?: boolean;
	isStart?: boolean;
	disabled?: boolean;
	size?: "small" | "medium" | "xs";
}

/**
 * A toggle button to be used within a ButtonGroup.
 * Renders a button with styles adjusted based on its position in the group.
 */
const ToggleButton: FC<ToggleButtonProps<ToggleButtonValidValueType>> = ({
	className,
	value,
	isActive,
	onClick,
	children,
	isEnd,
	isStart,
	disabled,
	size = "medium",
}) => {
	return (
		<button
			type="button"
			className={cn(
				"flex-1 whitespace-nowrap border-y text-sm shadow-sm",
				isStart ? "border-r border-l" : "border-r",
				isActive
					? "border-primary-500 bg-primary-50 font-semibold text-primary-700"
					: "border-border-input-default bg-white font-normal text-text-neutral-primary hover:bg-gray-50",
				isStart && "rounded-l-md",
				isEnd && "rounded-r-md",
				disabled && "cursor-not-allowed opacity-50",
				size === "small" && "px-2 py-1 text-xs",
				size === "medium" && "h-[36px] px-4 py-2",
				size === "xs" && "h-[26px] text-xs",
				className,
			)}
			disabled={disabled}
			onClick={(e) => {
				e.stopPropagation();
				onClick?.(value);
			}}
		>
			<span className="flex items-center justify-center gap-2">{children}</span>
		</button>
	);
};

export default ToggleButton;
