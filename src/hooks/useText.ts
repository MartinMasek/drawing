import type { KonvaEventObject } from "konva/lib/Node";
import { useState, useCallback } from "react";
import type { CanvasTextData, CanvasText } from "~/types/drawing";
import { useCreateText } from "./mutations/texts/useCreateText";
import { useUpdateText } from "./mutations/texts/useUpdateText";
import { useDeleteText } from "./mutations/texts/useDeleteText";
import { useChangeTextPosition } from "./mutations/texts/useChangeTextPosition";

export const useText = (designId: string) => {
	const createText = useCreateText(designId);
	const updateText = useUpdateText(designId);
	const deleteText = useDeleteText(designId);
	const changeTextPosition = useChangeTextPosition(designId);

	const [newTextPos, setNewTextPos] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [editingText, setEditingText] = useState<CanvasText | null>(null);

	const currentTextPos = editingText
		? { x: editingText.xPos, y: editingText.yPos }
		: newTextPos
			? newTextPos
			: { x: 0, y: 0 };

	const handleDelete = useCallback(() => {
		if (editingText) {
			deleteText.mutate({ id: editingText.id });
			setEditingText(null);
		}
		setNewTextPos(null);
	}, [editingText, deleteText]);

	const handleEscape = useCallback(() => {
		setEditingText(null);
		setNewTextPos(null);
	}, []);

	const handleSave = useCallback(
		(textData: CanvasTextData) => {
			if (editingText) {
				updateText.mutate({ id: editingText.id, ...textData });
				setEditingText(null);
			} else {
				createText.mutate({ designId, ...textData });
				setNewTextPos(null);
			}
		},
		[editingText, updateText, createText, designId],
	);

	const handleTextDragEnd = useCallback(
		(e: KonvaEventObject<DragEvent>, textItem: CanvasText) => {
			const newX = e.target.x();
			const newY = e.target.y();

			changeTextPosition.mutate({ id: textItem.id, xPos: newX, yPos: newY });
		},
		[changeTextPosition],
	);

	return {
		newTextPos,
		setNewTextPos,
		editingText,
		setEditingText,
		handleSave,
		handleDelete,
		handleEscape,
		handleTextDragEnd,
		currentTextPos,
	};
};
