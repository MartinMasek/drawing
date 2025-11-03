import { useShape } from "~/context/ShapeContext";
import { api } from "~/utils/api";

const useRemoveCutout = (designId: string | undefined) => {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, setSelectedCutout, selectedCutout } =
		useShape();

	return api.design.removeCutout.useMutation({
		onMutate: async (variables) => {
			if (!designId) return { previousData: undefined };

			await utils.design.getById.cancel({ id: designId });

			const previousData = utils.design.getById.getData({ id: designId });

			if (previousData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...previousData,
						shapes: previousData.shapes.map((shape) => {
							if (
								shape.sinkCutouts.some(
									(cutout) => cutout.id === variables.cutoutId,
								)
							) {
								return {
									...shape,
									sinkCutouts: shape.sinkCutouts.filter(
										(cutout) => cutout.id !== variables.cutoutId,
									),
								};
							}
							return shape;
						}),
					},
				);
			}

			// Update selected shape and cutout in context for optimistic UX
			if (
				selectedShape?.sinkCutouts.some(
					(cutout) => cutout.id === variables.cutoutId,
				)
			) {
				const optimisticShape = {
					...selectedShape,
					sinkCutouts: selectedShape.sinkCutouts.filter(
						(cutout) => cutout.id !== variables.cutoutId,
					),
				};
				setSelectedShape(optimisticShape);
				setSelectedCutout(null);
			}

			return { previousData, cutoutId: variables.cutoutId };
		},
		onError: (_err, _variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousData && designId) {
				utils.design.getById.setData({ id: designId }, context.previousData);
			}
		},
		onSuccess: (data, variables, context) => {},
	});
};

export default useRemoveCutout;
