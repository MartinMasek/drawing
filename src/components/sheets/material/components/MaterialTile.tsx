import { IconEdit } from "@tabler/icons-react";
import type { FC } from "react";
import Button from "~/components/Button";
import { Icon } from "~/components/Icon";
import { cn } from "~/lib/utils";

interface MaterialTileProps {
	name: string;
	description: React.ReactNode;
	img: string | null;
	isSelected: boolean;
	onSelect: () => void;
	onEdit: () => void;
}

const MaterialTile: FC<MaterialTileProps> = ({
	name,
	img,
	description,
	isSelected,
	onSelect,
	onEdit,
}) => {
	const borderColor = isSelected
		? "border-border-checkboxes-active"
		: "border-border-button-gray-default";

	const editButtonClassName = cn(
		"absolute top-[-1px] right-[2px] h-[36px] w-[36px] rounded-md rounded-tl-none rounded-br-none",
		borderColor,
	);

	const backgroundColor = isSelected
		? "bg-dataVisualisation-azureBlue-softest"
		: "bg-white";

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			className={cn(
				"flex cursor-pointer flex-col overflow-hidden rounded-md border",
				borderColor,
				backgroundColor,
			)}
			onClick={onSelect}
		>
			<div className={cn("relative w-[305px]", img ? "h-[130px]" : "h-[36px]")}>
				<input
					type="radio"
					checked={isSelected}
					className="[&:checked]:before:-translate-x-1/2 [&:checked]:before:-translate-y-1/2 absolute top-2 left-2 h-5 w-5 cursor-pointer rounded-full border border-border-button-gray-default [&:checked]:before:absolute [&:checked]:before:top-1/2 [&:checked]:before:left-1/2 [&:checked]:before:h-2 [&:checked]:before:w-2 [&:checked]:before:rounded-full [&:checked]:before:bg-blue-600 [&:checked]:before:content-['']"
					readOnly
				/>
				<Button
					variant="outlined"
					iconOnly
					size="sm"
					color="neutral"
					className={editButtonClassName}
					onClick={(e) => {
						e.stopPropagation();
						onEdit();
					}}
				>
					<Icon size="md">
						<IconEdit />
					</Icon>
				</Button>
				{img && (
					<img
						src={img}
						alt="Material"
						className="h-full w-full object-cover"
					/>
				)}
			</div>
			<div
				className={cn(
					"flex flex-col gap-1 px-3 py-2",
					img && "border-t",
					borderColor,
				)}
			>
				<p className="text-sm text-text-neutral-primary">{name}</p>
				<p className="text-text-neutral-terciary text-xs">{description}</p>
			</div>
		</div>
	);
};

export default MaterialTile;
