import { IconArrowLeft, IconCopy, IconTrash } from "@tabler/icons-react";
import type { FC } from "react";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { ShapeSidePanelView } from "../ShapeSidePanel";
import LengthInput from "../components/LengthInput";
import { CornerModificationList } from "~/types/drawing";
import { useShape } from "~/components/header/context/ShapeContext";

interface EditCornerProps {
	setView: (value: ShapeSidePanelView) => void;
}

const EditCorner: FC<EditCornerProps> = ({ setView }) => {
	const { selectedCorner } = useShape();

	return (
		<>
			<SheetHeader>
				<SheetTitle className="flex items-center gap-2 text-xl">
					<Button
						color="neutral"
						iconOnly
						size="sm"
						variant="text"
						onClick={() => setView("generalCorners")}
					>
						<Icon size="md">
							<IconArrowLeft />
						</Icon>
					</Button>
					Corner Parameters
				</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p>
					Corner Type:{" "}
					<span className="text-text-colors-secondary">
						{CornerModificationList.find((c) => c.id === selectedCorner?.type)?.label}
					</span>
				</p>
				<div className="flex h-[170px] items-center justify-center rounded-md border border-border-neutral">
					<span className="text-sm text-text-neutral-disabled">TBD.</span>
				</div>
				<LengthInput onChange={() => { }} length={0} />
			</div>
			<SheetFooter>
				<div className="flex w-full items-center gap-2">
					<Button
						variant="outlined"
						iconLeft={
							<Icon size="md">
								<IconCopy />
							</Icon>
						}
						color="neutral"
						disabled
						className="flex-1 justify-center"
					>
						Duplicate
					</Button>
					<Button
						variant="outlined"
						iconLeft={
							<Icon size="md">
								<IconTrash />
							</Icon>
						}
						color="danger"
						className="flex-1 justify-center"
					>
						Remove
					</Button>
				</div>
			</SheetFooter>
		</>
	);
};

export default EditCorner;
