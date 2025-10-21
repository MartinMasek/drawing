import { IconArrowLeft, IconCopy, IconTrash } from "@tabler/icons-react";
import type { FC } from "react";
import Button from "~/components/header/header/Button";
import { Icon } from "~/components/header/header/Icon";
import { SheetFooter, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import type { ShapeSidePanelView } from "../ShapeSidePanel";
import CurvesSizeInput from "../components/CurvesSizeInput";
import CurvesAnglesInput from "../components/CurvesAnglesInput";
import PositioningInput from "../components/PositioningInput";
import DistanceInput from "../components/DistanceInput";
import { useShape } from "~/components/header/context/ShapeContext";
import { EdgeModificationList } from "~/types/drawing";
import { EdgeShapePosition } from "@prisma/client";

interface EditCurvesAndBumpsProps {
	setView: (value: ShapeSidePanelView) => void;
}

const EditCurvesAndBumps: FC<EditCurvesAndBumpsProps> = ({ setView }) => {
	const { selectedEdge } = useShape();

	const handleSizeChange = (value: { depth: number; width: number }) => {
		// Mutation + optimistic update
	};

	const handleAnglesChange = (value: { left: number; right: number }) => {
		// Mutation + optimistic update
	};

	const handlePositionChange = (value: string) => {
		// Mutation + optimistic update
	};

	const handleDistanceChange = (value: number) => {
		// Mutation + optimistic update
	};

	return (
		<>
			<SheetHeader>
				<SheetTitle className="flex items-center gap-2 text-xl">
					<Button
						color="neutral"
						iconOnly
						size="sm"
						variant="text"
						onClick={() => setView("generalCurves")}
					>
						<Icon size="md">
							<IconArrowLeft />
						</Icon>
					</Button>
					Bump Parameters
				</SheetTitle>
			</SheetHeader>
			<div className="flex flex-col gap-4 p-4">
				<p>
					Bump Type:{" "}
					<span className="text-text-colors-secondary">
						{EdgeModificationList.find((em) => em.id === selectedEdge?.edgeModification?.type)?.label}
					</span>
				</p>
				<div className="flex h-[170px] items-center justify-center rounded-md border border-border-neutral">
					<span className="text-sm text-text-neutral-disabled">TBD.</span>
				</div>
				<CurvesSizeInput
					onChange={handleSizeChange}
					depth={selectedEdge?.edgeModification?.depth ?? 0}
					width={selectedEdge?.edgeModification?.width ?? 0}
				/>
				<CurvesAnglesInput
					onChange={handleAnglesChange}
					left={selectedEdge?.edgeModification?.sideAngleLeft ?? 0}
					right={selectedEdge?.edgeModification?.sideAngleRight ?? 0}
				/>
				<PositioningInput
					onChange={handlePositionChange}
					position={selectedEdge?.edgeModification?.position ?? EdgeShapePosition.Center}
				/>
				<DistanceInput
					onChange={handleDistanceChange}
					distance={selectedEdge?.edgeModification?.distance ?? 0}
				/>
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

export default EditCurvesAndBumps;
