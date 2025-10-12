import type { KonvaEventObject } from "konva/lib/Node";
import { useState, useCallback } from "react";
import type { CanvasTextData, CanvasText } from "~/types/drawing";
import { api } from "~/utils/api";

export const useText = (designId?: string) => {
	const utils = api.useUtils();

	// Optimistic state for texts
	const [optimisticTexts, setOptimisticTexts] = useState<CanvasText[]>([]);
	const [optimisticDeletedIds, setOptimisticDeletedIds] = useState<Set<string>>(
		new Set(),
	);

	// Get server texts
	const { data: serverTexts = [] } = api.design.getAllTexts.useQuery(
		{ id: designId ?? "" },
		{ enabled: !!designId },
	);

	// Convert server texts to CanvasText format
	const serverTextsAsCanvasText: CanvasText[] = serverTexts
		.filter((text) => !optimisticDeletedIds.has(text.id))
		.map((text) => ({
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
		onSuccess: (data, variables) => {
			// Update the optimistic text with the real ID from server
			setOptimisticTexts((prev) =>
				prev.map((text) =>
					text.text === variables.text &&
					text.xPos === variables.xPos &&
					text.yPos === variables.yPos &&
					text.id.startsWith("temp-")
						? { ...text, id: data.id }
						: text,
				),
			);
			// Invalidate to get the server data, but the optimistic text now has the correct ID
			utils.design.getAllTexts.invalidate();
		},
		onError: (error, variables) => {
			// Remove failed optimistic text - find by matching text data
			setOptimisticTexts((prev) =>
				prev.filter(
					(text) =>
						!(
							text.text === variables.text &&
							text.xPos === variables.xPos &&
							text.yPos === variables.yPos &&
							text.id.startsWith("temp-")
						),
				),
			);
		},
	});

	const updateText = api.design.updateText.useMutation({
		onSuccess: () => {
			// Remove from optimistic state since server now has it
			setOptimisticTexts((prev) =>
				prev.filter((text) => text.id !== editingText?.id),
			);
			utils.design.getAllTexts.invalidate();
		},
		onError: (error, variables) => {
			// Remove failed optimistic update
			setOptimisticTexts((prev) =>
				prev.filter((text) => text.id !== variables.id),
			);
		},
	});

	const deleteText = api.design.deleteText.useMutation({
		onSuccess: () => {
			utils.design.getAllTexts.invalidate();
			// Remove from optimistic deleted set since server now has it
			setOptimisticDeletedIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(editingText?.id || "");
				return newSet;
			});
		},
		onError: (error, variables) => {
			// Remove from optimistic deleted set on error
			setOptimisticDeletedIds((prev) => {
				const newSet = new Set(prev);
				newSet.delete(variables.id);
				return newSet;
			});
		},
	});

	const changeTextPosition = api.design.changeTextPosition.useMutation({
		onSuccess: () => {
			// Remove from optimistic state since server now has it
			setOptimisticTexts((prev) =>
				prev.filter((text) => text.id !== editingText?.id),
			);
			utils.design.getAllTexts.invalidate();
		},
		onError: (error, variables) => {
			// Remove failed optimistic update
			setOptimisticTexts((prev) =>
				prev.filter((text) => text.id !== variables.id),
			);
		},
	});

	const [newTextPos, setNewTextPos] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [editingText, setEditingText] = useState<CanvasText | null>(null);

	// Filter out texts that have optimistic updates to avoid duplicates
	// Also filter out texts that are currently being edited (to avoid showing both original and edited version)
	const serverTextsWithoutOptimistic = serverTextsAsCanvasText.filter(
		(serverText) =>
			!optimisticTexts.some(
				(optimisticText) => optimisticText.id === serverText.id,
			) && serverText.id !== editingText?.id,
	);

	// Filter out optimistic texts that are currently being edited to avoid showing both versions
	const optimisticTextsWithoutEditing = optimisticTexts.filter(
		(optimisticText) => optimisticText.id !== editingText?.id,
	);

	const allTexts = [
		...serverTextsWithoutOptimistic,
		...optimisticTextsWithoutEditing,
	];

	const currentTextPos = editingText
		? { x: editingText.xPos, y: editingText.yPos }
		: newTextPos
			? newTextPos
			: { x: 0, y: 0 };

	const handleDelete = useCallback(() => {
		if (editingText) {
			// Check if this text exists in server data (original text before any edits)
			const isInServerData = serverTexts.some(
				(text) => text.id === editingText.id,
			);

			// Always remove from optimistic state first
			setOptimisticTexts((prev) =>
				prev.filter((text) => text.id !== editingText.id),
			);

			if (isInServerData) {
				// For server texts, add to deleted set and call server
				setOptimisticDeletedIds((prev) => new Set(prev).add(editingText.id));
				deleteText.mutate({ id: editingText.id });
			}
			// If not in server data, it was optimistic-only, so we're done

			setEditingText(null);
		}
		setNewTextPos(null);
	}, [editingText, deleteText, serverTexts]);

	const handleEscape = useCallback(() => {
		setEditingText(null);
		setNewTextPos(null);
	}, []);

	const handleSave = useCallback(
		(textData: CanvasTextData) => {
			if (editingText) {
				// Optimistically update UI
				const optimisticText: CanvasText = {
					...editingText,
					...textData,
				};
				setOptimisticTexts((prev) => [
					...prev.filter((t) => t.id !== editingText.id),
					optimisticText,
				]);

				// Update server
				updateText.mutate({ id: editingText.id, ...textData });
				setEditingText(null);
			} else {
				if (designId) {
					// Generate temporary ID for optimistic update
					const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
					const optimisticText: CanvasText = {
						id: tempId,
						...textData,
					};

					// Optimistically add to UI
					setOptimisticTexts((prev) => [...prev, optimisticText]);

					// Create on server
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

			// Optimistically update position
			const optimisticText: CanvasText = {
				...textItem,
				xPos: newX,
				yPos: newY,
			};
			setOptimisticTexts((prev) => [
				...prev.filter((t) => t.id !== textItem.id),
				optimisticText,
			]);

			// Update server
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
		allTexts, // Return the merged texts with optimistic updates
	};
};
