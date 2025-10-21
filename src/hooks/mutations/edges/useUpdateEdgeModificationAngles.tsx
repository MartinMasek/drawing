import { api } from "~/utils/api";

export const useUpdateEdgeModificationAngles = (designId: string | undefined) => {
    const utils = api.useUtils();
    return api.design.edgeModificationUpdateAngles.useMutation({
        onMutate: async (variables) => {
            if (!designId) return { previousData: undefined };

            await utils.design.getById.cancel({ id: designId });

            const previousData = utils.design.getById.getData({ id: designId });
        },
    });
};