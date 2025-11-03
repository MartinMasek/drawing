import type { KonvaEventObject } from "konva/lib/Node";
import { useState, useCallback } from "react";
import type { CanvasTextData, CanvasText } from "~/types/drawing";
import { useCreateText } from "./mutations/texts/useCreateText";
import { useUpdateText } from "./mutations/texts/useUpdateText";
import { useDeleteText } from "./mutations/texts/useDeleteText";
import { useChangeTextPosition } from "./mutations/texts/useChangeTextPosition";

interface UseTextProps {
	designId?: string;
	selectedText: CanvasText | null;
	setSelectedText: (text: CanvasText | null) => void;
}

export const useText = ({
	designId,
	selectedText,
	setSelectedText,
}: UseTextProps) => {
	const createText = useCreateText(designId);
	const updateText = useUpdateText(designId);
	const deleteText = useDeleteText(designId);
	const changeTextPosition = useChangeTextPosition(designId);

	const [newTextPos, setNewTextPos] = useState<{ x: number; y: number } | null>(
		null,
	);

	const currentTextPos = selectedText
		? { x: selectedText.xPos, y: selectedText.yPos }
		: newTextPos
			? newTextPos
			: { x: 0, y: 0 };

	const handleDelete = useCallback(() => {
		if (selectedText) {
			deleteText.mutate({ id: selectedText.id });
			setSelectedText(null);
		}
		setNewTextPos(null);
	}, [selectedText, deleteText, setSelectedText]);

	const handleEscape = useCallback(() => {
		setSelectedText(null);
		setNewTextPos(null);
	}, [setSelectedText]);

	const handleSave = useCallback(
		(textData: CanvasTextData) => {
			if (selectedText) {
				updateText.mutate({ id: selectedText.id, ...textData });
				setSelectedText(null);
			} else {
				if (!designId) return;
				createText.mutate({ designId, ...textData });
				setNewTextPos(null);
			}
		},
		[selectedText, updateText, createText, designId, setSelectedText],
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
		handleSave,
		handleDelete,
		handleEscape,
		handleTextDragEnd,
		currentTextPos,
	};
};
