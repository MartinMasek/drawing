import type { FC } from "react";
import Button from "~/components/Button";
import { Icon } from "~/components/Icon";
import {
	IconMinus,
	IconPlus,
	IconBold,
	IconItalic,
	IconTextColor,
	IconHighlight,
	IconClearFormatting,
	IconTrash,
} from "@tabler/icons-react";
import { Divider } from "~/components/Divider";

interface TextInputToolbarProps {
	position: { x: number; y: number };
	fontSize: number;
	isBold: boolean;
	isItalic: boolean;

	onFontSizeChange: (size: number) => void;
	onToggleBold: () => void;
	onToggleItalic: () => void;

	onClearFormatting: () => void;
	onDelete: () => void;
}
const TextInputToolbar: FC<TextInputToolbarProps> = ({
	position,
	fontSize,
	isBold,
	isItalic,
	onFontSizeChange,
	onToggleBold,
	onToggleItalic,
	onClearFormatting,
	onDelete,
}) => {
	return (
		<div
			className="-translate-x-1/2 absolute z-10 flex h-11 items-center gap-1 rounded-[10px] bg-white px-1 shadow-general-lg"
			style={{
				top: position.y,
				left: position.x,
			}}
		>
			{/* Font size controls */}
			<div className="flex gap-1">
				<Button
					color="neutral"
					iconOnly
					size="sm"
					variant="text"
					onClick={() => onFontSizeChange(Math.max(1, fontSize - 1))}
				>
					<Icon size="md">
						<IconMinus />
					</Icon>
				</Button>
				<input
					type="number"
					value={fontSize}
					onChange={(e) => {
						const value = Number.parseInt(e.target.value, 10);
						if (!Number.isNaN(value) && value > 0) {
							onFontSizeChange(value);
						} else if (e.target.value === "") {
							onFontSizeChange(0);
						}
					}}
					className="h-[36px] w-[50px] rounded-lg border border-border-input-default text-center text-sm"
				/>
				<Button
					color="neutral"
					iconOnly
					size="sm"
					variant="text"
					onClick={() => onFontSizeChange(fontSize + 1)}
				>
					<Icon size="md">
						<IconPlus />
					</Icon>
				</Button>
			</div>

			<Divider className="h-full border-[0.5px]" orientation="vertical" />

			{/* Bold / Italic */}
			<Button
				color="neutral"
				iconOnly
				className="h-[36px] w-[36px]"
				size="sm"
				variant={isBold ? "outlined" : "text"}
				onClick={onToggleBold}
			>
				<Icon size="md">
					<IconBold />
				</Icon>
			</Button>
			<Button
				color="neutral"
				iconOnly
				className="h-[36px] w-[36px]"
				size="sm"
				variant={isItalic ? "outlined" : "text"}
				onClick={onToggleItalic}
			>
				<Icon size="md">
					<IconItalic />
				</Icon>
			</Button>

			<Divider className="h-full border-[0.5px]" orientation="vertical" />

			{/* Text color / highlight placeholders */}
			<Button color="neutral" iconOnly size="sm" variant="text">
				<Icon size="md">
					<IconTextColor />
				</Icon>
			</Button>
			<Button color="neutral" iconOnly size="sm" variant="text">
				<Icon size="md">
					<IconHighlight />
				</Icon>
			</Button>

			<Divider className="h-full border-[0.5px]" orientation="vertical" />

			{/* Clear formatting */}
			<Button
				color="neutral"
				iconOnly
				size="sm"
				variant="text"
				onClick={onClearFormatting}
			>
				<Icon size="md">
					<IconClearFormatting />
				</Icon>
			</Button>
			<Button
				color="danger"
				iconOnly
				size="sm"
				variant="text"
				onClick={onDelete}
			>
				<Icon size="md">
					<IconTrash />
				</Icon>
			</Button>
		</div>
	);
};

export default TextInputToolbar;
