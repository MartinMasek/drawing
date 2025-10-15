import { api } from "~/utils/api";

export const useDeleteText = (designId: string) => {
	const utils = api.useUtils();

	return api.design.deleteText.useMutation({
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
		onError: (error, variables, context) => {
			// Revert optimistic update on error
			utils.design.getById.setData(
				{ id: designId },
				context?.previousData ?? null,
			);
		},
	});
};
