import { api } from "~/utils/api";

export const useDeleteText = (designId?: string) => {
	const utils = api.useUtils();

	return api.design.deleteText.useMutation({
		onMutate: async (variables) => {
			if (!designId) return;
			await utils.design.getById.cancel();

			const previousData = utils.design.getById.getData({ id: designId });

			utils.design.getById.setData({ id: designId }, (old) => {
				if (!old || !designId) return null;
				return {
					...old,
					texts: old.texts.filter((text) => text.id !== variables.id),
				};
			});

			return { previousData };
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
