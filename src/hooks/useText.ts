import type { KonvaEventObject } from "konva/lib/Node";
import { useState, useCallback } from "react";
import type { CanvasTextData, CanvasText } from "~/types/drawing";
import { api } from "~/utils/api";

export const useText = (designId: string) => {
	const utils = api.useUtils();

	const createText = api.design.createText.useMutation({
		onMutate: async (variables) => {
			await utils.design.getById.cancel();

			const previousData = utils.design.getById.getData({ id: designId });

			// Generate temporary ID for optimistic update
			const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const optimisticText: CanvasText = {
				id: tempId,
				...variables,
			};

			utils.design.getById.setData({ id: designId }, (old) => {
				if (!old) return null;
				return {
					...old,
					texts: [...old.texts, optimisticText],
				};
			});

			return { previousData };
		},
	});

	const updateText = api.design.updateText.useMutation({
		onMutate: async (variables) => {
			await utils.design.getById.cancel();

			const previousData = utils.design.getById.getData({ id: designId });

			utils.design.getById.setData({ id: designId }, (old) => {
				if (!old) return null;
				return {
					...old,
					texts: old.texts.map((text) =>
						text.id === variables.id ? { ...text, ...variables } : text,
					),
				};
			});

			return { previousData };
		},
	});

	const deleteText = api.design.deleteText.useMutation({
		onMutate: async (variables) => {
			await utils.design.getById.cancel();

			const previousData = utils.design.getById.getData({ id: designId });

			utils.design.getById.setData({ id: designId }, (old) => {
				if (!old) return null;
				return {
					...old,
					texts: old.texts.filter((text) => text.id !== variables.id),
				};
			});

			return { previousData };
		},
	});

	const changeTextPosition = api.design.changeTextPosition.useMutation({
		onMutate: async (variables) => {
			await utils.design.getById.cancel();

			const previousData = utils.design.getById.getData({ id: designId });

			utils.design.getById.setData({ id: designId }, (old) => {
				if (!old) return null;
				return {
					...old,
					texts: old.texts.map((text) =>
						text.id === variables.id
							? { ...text, xPos: variables.xPos, yPos: variables.yPos }
							: text,
					),
				};
			});

			return { previousData };
		},
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
