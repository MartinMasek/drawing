import type { FC, ReactNode } from "react";
import { cn } from "~/utils/ui-utils";

interface ShapeCardProps {
	id: string
	name: string;
	icon: ReactNode;
	onClick?: () => void;
	isActive: boolean;
}
const ShapeCard: FC<ShapeCardProps> = ({ name, icon, onClick, isActive }) => {
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className={cn(
				"flex h-[116px] cursor-pointer flex-col rounded-md border border-border-button-gray-default",
				isActive &&
				"border-border-checkboxes-active bg-background-button-secondary-brand-active",
			)}
			onClick={onClick}
		>
			<div className="flex h-[80px] flex-col items-center justify-center">
				{icon}
			</div>
			<div
				className={cn(
					"flex h-[36px] items-center border-border-button-gray-default border-t px-3",
					isActive && "border-border-button-brand-active",
				)}
			>
				<p className="text-sm">{name}</p>
			</div>
		</div>
	);
};

export default ShapeCard;
