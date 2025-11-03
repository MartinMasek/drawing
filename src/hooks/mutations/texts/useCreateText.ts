import { api } from "~/utils/api";
import type { CanvasText } from "~/types/drawing";

export const useCreateText = (designId?: string) => {
	const utils = api.useUtils();

	return api.design.createText.useMutation({
		onMutate: async (variables) => {
			if (!designId) return;
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

			return { previousData, tempId };
		},
		onSuccess: (data, variables, context) => {
			// Replace temp ID with real ID from backend
			if (!designId) return;
			utils.design.getById.setData({ id: designId }, (old) => {
				if (!old) return null;
				return {
					...old,
					texts: old.texts.map((text) =>
						text.id === context?.tempId ? { ...text, id: data.id } : text,
					),
				};
			});
		},
		onError: (error, variables, context) => {
			// Revert optimistic update on error
			if (!designId) return;
			utils.design.getById.setData(
				{ id: designId },
				context?.previousData ?? null,
			);
		},
	});
};
