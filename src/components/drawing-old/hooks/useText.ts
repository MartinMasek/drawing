import type { KonvaEventObject } from "konva/lib/Node";
import { useState } from "react";
import type { CanvasTextData, CanvasText } from "~/types/drawing";
import { api } from "~/utils/api";

export const useText = (designId?: string) => {
	const utils = api.useUtils();

	const createText = api.design.createText.useMutation({
		onSuccess: () => utils.design.getAllTexts.invalidate(),
	});

	const updateText = api.design.updateText.useMutation({
		onSuccess: () => utils.design.getAllTexts.invalidate(),
	});

	const deleteText = api.design.deleteText.useMutation({
		onSuccess: () => utils.design.getAllTexts.invalidate(),
	});

	const changeTextPosition = api.design.changeTextPosition.useMutation({
		onSuccess: () => utils.design.getAllTexts.invalidate(),
	});

	const [newTextPos, setNewTextPos] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [editingText, setEditingText] = useState<CanvasText | null>(null);

	const currentTextPos = editingText
		? { x: editingText.xPos, y: editingText.yPos }
		: newTextPos
			? newTextPos
			: { x: 0, y: 0 };

	const handleDelete = () => {
		if (editingText) {
			deleteText.mutate({ id: editingText.id });
			setEditingText(null);
		}
		setNewTextPos(null);
	};

	const handleEscape = () => {
		setEditingText(null);
		setNewTextPos(null);
	};

	const handleSave = (textData: CanvasTextData) => {
		if (editingText) {
			updateText.mutate({ id: editingText.id, ...textData });
			setEditingText(null);
		} else {
			if (designId) {
				createText.mutate({ designId, ...textData });
				setNewTextPos(null);
			}
		}
	};

	const handleTextDragEnd = (
		e: KonvaEventObject<DragEvent>,
		textItem: CanvasText,
	) => {
		const newX = e.target.x();
		const newY = e.target.y();

		changeTextPosition.mutate({ id: textItem.id, xPos: newX, yPos: newY });
	};

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
