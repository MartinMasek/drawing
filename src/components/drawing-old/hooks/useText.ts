import type { KonvaEventObject } from "konva/lib/Node";
import { useState, useCallback } from "react";
import type { CanvasTextData, CanvasText } from "~/types/drawing";
import { api } from "~/utils/api";

export const useText = (designId?: string) => {
	const utils = api.useUtils();

	const { data: serverTexts = [] } = api.design.getAllTexts.useQuery(
		{ id: designId ?? "" },
		{ enabled: !!designId },
	);

	const allTexts: CanvasText[] = serverTexts.map((text) => ({
		id: text.id,
		xPos: text.xPos,
		yPos: text.yPos,
		text: text.text,
		fontSize: text.fontSize,
		isBold: text.isBold,
		isItalic: text.isItalic,
		textColor: text.textColor,
		backgroundColor: text.backgroundColor,
	}));

	const createText = api.design.createText.useMutation({
		onMutate: async (variables) => {
			if (!designId) return;

			await utils.design.getAllTexts.cancel();

			const previousTexts = utils.design.getAllTexts.getData({ id: designId });

			// Generate temporary ID for optimistic update
			const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
			const optimisticText = {
				id: tempId,
				...variables,
				designId,
			};

			utils.design.getAllTexts.setData({ id: designId }, (old) => [
				...(old || []),
				optimisticText,
			]);

			return { previousTexts, optimisticText };
		},
		onError: (error, variables, context) => {
			if (!designId) return;

			if (context?.previousTexts) {
				utils.design.getAllTexts.setData(
					{ id: designId },
					context.previousTexts,
				);
			}
		},
		onSuccess: (data, variables, context) => {
			if (!designId) return;

			// Update the optimistic text with the real ID from server
			utils.design.getAllTexts.setData(
				{ id: designId },
				(old) =>
					old?.map((text) =>
						text.id === context?.optimisticText.id
							? { ...text, id: data.id }
							: text,
					) || [],
			);
		},
		onSettled: () => {
			utils.design.getAllTexts.invalidate();
		},
	});

	const updateText = api.design.updateText.useMutation({
		onMutate: async (variables) => {
			if (!designId) return;

			await utils.design.getAllTexts.cancel();

			const previousTexts = utils.design.getAllTexts.getData({ id: designId });

			utils.design.getAllTexts.setData(
				{ id: designId },
				(old) =>
					old?.map((text) =>
						text.id === variables.id ? { ...text, ...variables } : text,
					) || [],
			);

			return { previousTexts };
		},
		onError: (error, variables, context) => {
			if (!designId) return;

			if (context?.previousTexts) {
				utils.design.getAllTexts.setData(
					{ id: designId },
					context.previousTexts,
				);
			}
		},
		onSettled: () => {
			utils.design.getAllTexts.invalidate();
		},
	});

	const deleteText = api.design.deleteText.useMutation({
		onMutate: async (variables) => {
			if (!designId) return;

			await utils.design.getAllTexts.cancel();

			const previousTexts = utils.design.getAllTexts.getData({ id: designId });

			utils.design.getAllTexts.setData(
				{ id: designId },
				(old) => old?.filter((text) => text.id !== variables.id) || [],
			);

			return { previousTexts };
		},
		onError: (error, variables, context) => {
			if (!designId) return;

			if (context?.previousTexts) {
				utils.design.getAllTexts.setData(
					{ id: designId },
					context.previousTexts,
				);
			}
		},
		onSettled: () => {
			utils.design.getAllTexts.invalidate();
		},
	});

	const changeTextPosition = api.design.changeTextPosition.useMutation({
		onMutate: async (variables) => {
			if (!designId) return;

			await utils.design.getAllTexts.cancel();

			const previousTexts = utils.design.getAllTexts.getData({ id: designId });

			utils.design.getAllTexts.setData(
				{ id: designId },
				(old) =>
					old?.map((text) =>
						text.id === variables.id
							? { ...text, xPos: variables.xPos, yPos: variables.yPos }
							: text,
					) || [],
			);

			return { previousTexts };
		},
		onError: (error, variables, context) => {
			if (!designId) return;

			if (context?.previousTexts) {
				utils.design.getAllTexts.setData(
					{ id: designId },
					context.previousTexts,
				);
			}
		},
		onSettled: () => {
			utils.design.getAllTexts.invalidate();
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
				if (designId) {
					createText.mutate({ designId, ...textData });
					setNewTextPos(null);
				}
			}
		},
		[editingText, designId, updateText, createText],
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
		allTexts,
	};
};
