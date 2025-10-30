import {
	IconCopy,
	IconRotate2,
	IconRotateClockwise2,
	IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";
import type { CanvasShape } from "~/types/drawing";
import { useCreateShape, isTempShapeId, registerPendingUpdate } from "../../../hooks/mutations/useCreateShape";
import { useDeleteShape } from "../../../hooks/mutations/useDeleteShape";
import { useUpdateShape } from "../../../hooks/mutations/useUpdateShape";
import { SelectStyled } from "../../SelectStyled";
import ButtonGroup from "../../ui/ButtonGroup";
import ToggleButton from "../../ui/ToggleButton";
import { api } from "~/utils/api";

interface RotationOption {
	label: string;
	value: number;
}

const DEFAULT_ROTATION: RotationOption = { label: "22.5°", value: 22.5 };

const ROTATION_OPTIONS: RotationOption[] = [
	DEFAULT_ROTATION,
	{ label: "90°", value: 90 },
	{ label: "180°", value: 180 },
];

interface ShapeContextMenuProps {
	x: number;
	y: number;
	shape: CanvasShape;
	designId: string;
	selectedShapeId: string | null;
	onShapeDeleted: (shapeId: string) => void;
	onClose: () => void;
}

const ShapeContextMenu = ({
	x,
	y,
	shape,
	designId,
	selectedShapeId,
	onShapeDeleted,
	onClose,
}: ShapeContextMenuProps) => {
	const [selectedAngle, setSelectedAngle] =
		useState<RotationOption>(DEFAULT_ROTATION);

	const utils = api.useUtils();
	const createShapeMutation = useCreateShape(designId);
	const updateShapeMutation = useUpdateShape(designId);
	const deleteShapeMutation = useDeleteShape(designId);

	const handleRotate = (degrees: number) => {
		// Calculate new rotation (normalize to 0-360 range)
		const newRotation = (shape.rotation + degrees + 360) % 360;

		// If shape has temp ID, register pending update and update cache
		if (isTempShapeId(shape.id)) {
			registerPendingUpdate(shape.id, {
				xPos: shape.xPos,
				yPos: shape.yPos,
				rotation: newRotation,
				points: shape.points.map((point) => ({
					id: point.id,
					xPos: point.xPos,
					yPos: point.yPos,
				})),
			});

			// Update cache optimistically
			const currentData = utils.design.getById.getData({ id: designId });
			if (currentData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...currentData,
						shapes: currentData.shapes.map((s) =>
							s.id === shape.id ? { ...s, rotation: newRotation } : s,
						),
					},
				);
			}
			return;
		}

		updateShapeMutation.mutate({
			shapeId: shape.id,
			xPos: shape.xPos,
			yPos: shape.yPos,
			rotation: newRotation,
			points: [...shape.points],
		});
	};

	const handleDuplicate = () => {
		// Create duplicate with slight offset (20px right and down)
		createShapeMutation.mutate({
			designId,
			xPos: shape.xPos + 20,
			yPos: shape.yPos + 20,
			rotation: shape.rotation,
			points: [...shape.points],
		});
		onClose();
	};

	const handleDelete = () => {
		// If shape has temp ID, just remove from cache (no server call needed)
		if (isTempShapeId(shape.id)) {
			const currentData = utils.design.getById.getData({ id: designId });
			if (currentData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...currentData,
						shapes: currentData.shapes.filter((s) => s.id !== shape.id),
					},
				);
			}

			// Notify parent if this was the selected shape
			if (selectedShapeId === shape.id) {
				onShapeDeleted(shape.id);
			}
			onClose();
			return;
		}

		deleteShapeMutation.mutate({ shapeId: shape.id });

		// Notify parent if this was the selected shape
		if (selectedShapeId === shape.id) {
			onShapeDeleted(shape.id);
		}
		onClose();
	};
	return (
		<div
			style={{
				position: "fixed",
				left: x,
				top: y,
				zIndex: 1000,
				transform: window.innerWidth >= 768 ? "translate(-50%, -100%)" : "none",
				marginTop: window.innerWidth >= 768 ? "-8px" : "0",
			}}
			className="flex h-auto flex-col items-center gap-1 rounded-[10px] border bg-white p-1 font-semibold text-sm shadow-lg md:h-[44px] md:flex-row"
			onClick={(e) => e.stopPropagation()}
			onKeyDown={(e) => {
				if (e.key === "Escape") {
					onClose();
				}
				e.stopPropagation();
			}}
		>
			<div className="flex w-full flex-col items-center gap-1 md:flex-row">
				{/* Mobile/Tablet: ButtonGroup on top */}
				<div className="w-full md:hidden">
					<ButtonGroup
						value={selectedAngle.value}
						onChange={(newValue) => {
							const option = ROTATION_OPTIONS.find(
								(opt) => opt.value === newValue,
							);
							if (option) setSelectedAngle(option);
						}}
					>
						<ToggleButton value={22.5}>22.5°</ToggleButton>
						<ToggleButton value={90}>90°</ToggleButton>
						<ToggleButton value={180}>180°</ToggleButton>
					</ButtonGroup>
				</div>

				{/* Mobile/Tablet: Left and Right buttons side by side, Desktop: all in row */}
				<div className="flex w-full flex-row items-center gap-1">
					<button
						type="button"
						onClick={() => handleRotate(-selectedAngle.value)}
						onKeyUp={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								handleRotate(-selectedAngle.value);
							}
						}}
						className="flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
					>
						<IconRotate2 size={18} />
						<span>Left</span>
					</button>

					{/* Desktop: SelectStyled in the middle */}
					<div className="hidden md:block md:min-w-[120px]">
						<SelectStyled
							options={ROTATION_OPTIONS}
							value={selectedAngle}
							onChange={(option) => setSelectedAngle(option as RotationOption)}
							inputSize="sm"
							isSearchable={false}
							menuPlacement="auto"
						/>
					</div>

					<button
						type="button"
						onClick={() => handleRotate(selectedAngle.value)}
						onKeyUp={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								handleRotate(selectedAngle.value);
							}
						}}
						className="flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-text-neutral-primary"
					>
						<span>Right</span>
						<IconRotateClockwise2 size={18} />
					</button>
				</div>
			</div>
			<div className="h-auto w-full border-gray-200 border-t md:h-full md:w-[2px] md:border-t-0 md:border-l" />
			<button
				type="button"
				onClick={handleDuplicate}
				onKeyUp={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handleDuplicate();
					}
				}}
				className="flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-gray-700"
			>
				<IconCopy size={18} />
				<span>Duplicate Shape</span>
			</button>
			<div className="h-auto w-full border-gray-200 border-t md:h-full md:w-[2px] md:border-t-0 md:border-l" />
			<button
				type="button"
				onClick={handleDelete}
				onKeyUp={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						handleDelete();
					}
				}}
				className="flex w-full items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-red-600"
			>
				<IconTrash size={18} />
				<span>Delete Shape</span>
			</button>
		</div>
	);
};

export default ShapeContextMenu;
