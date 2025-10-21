import { api } from "~/utils/api";

export const useUpdateEdgeModificationSize = (designId: string | undefined) => {
    const utils = api.useUtils();
    return api.design.edgeModificationUpdateSize.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined };

            await utils.design.getById.cancel({ id: designId });

            const previousData = utils.design.getById.getData({ id: designId });
        },
    });
};