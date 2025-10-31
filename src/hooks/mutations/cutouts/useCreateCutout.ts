import { useShape } from "~/components/header/context/ShapeContext";
import { defaultSinkCutoutValues } from "~/types/defaultValues";
import { api } from "~/utils/api";

const useCreateCutout = (designId: string | undefined) => {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, setSelectedCutout, selectedCutout } =
		useShape();

	return api.design.createCutout.useMutation({
		onMutate: async (variables) => {
			if (!designId) return { previousData: undefined };

			await utils.design.getById.cancel({ id: designId });

			const previousData = utils.design.getById.getData({ id: designId });

			const tmpCutoutId = `temp-cutout-${Date.now()}`;
			const tmpCutoutConfigId = `temp-cutout-config-${Date.now()}`;

			if (previousData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...previousData,
						shapes: previousData.shapes.map((shape) => {
							if (shape.id !== variables.shapeId) return shape;

							return {
								...shape,
								sinkCutouts: [
									...shape.sinkCutouts,
									{
										id: tmpCutoutId,
										posX: variables.posX,
										posY: variables.posY,
										sinkCutoutConfig: {
											id: tmpCutoutConfigId,
											sinkType: variables.sinkType,
											shape: variables.shape,
											length: defaultSinkCutoutValues.length,
											width: defaultSinkCutoutValues.width,
											holeCount: defaultSinkCutoutValues.holeCount,
											centrelinesX: defaultSinkCutoutValues.centrelinesX,
											centrelinesY: defaultSinkCutoutValues.centrelinesY,
										},
									},
								],
							};
						}),
					},
				);
			}

			// Update selected shape and cutout in context for optimistic UX
			if (selectedShape && selectedShape.id === variables.shapeId) {
				const optimisticShape = {
					...selectedShape,
					sinkCutouts: [
						...selectedShape.sinkCutouts,
						{
							id: tmpCutoutId,
							posX: variables.posX,
							posY: variables.posY,
							sinkCutoutConfig: {
								id: tmpCutoutConfigId,
								sinkType: variables.sinkType,
								shape: variables.shape,
								length: defaultSinkCutoutValues.length,
								width: defaultSinkCutoutValues.width,
								holeCount: defaultSinkCutoutValues.holeCount,
								centrelinesX: defaultSinkCutoutValues.centrelinesX,
								centrelinesY: defaultSinkCutoutValues.centrelinesY,
							},
						},
					],
				};
				setSelectedShape(optimisticShape);

				// Update selected cutout
				setSelectedCutout({
					id: tmpCutoutId,
					posX: variables.posX,
					posY: variables.posY,
					sinkCutoutConfig: {
						id: tmpCutoutConfigId,
						sinkType: variables.sinkType,
						shape: variables.shape,
						length: defaultSinkCutoutValues.length,
						width: defaultSinkCutoutValues.width,
						holeCount: defaultSinkCutoutValues.holeCount,
						centrelinesX: defaultSinkCutoutValues.centrelinesX,
						centrelinesY: defaultSinkCutoutValues.centrelinesY,
					},
				});
			}

			return { previousData, tmpCutoutId, tmpCutoutConfigId };
		},
		onError: (_err, _variables, context) => {
			// If the mutation fails, use the context returned from onMutate to roll back
			if (context?.previousData && designId) {
				utils.design.getById.setData({ id: designId }, context.previousData);
			}
		},
		onSuccess: (data, variables, context) => {
			if (context?.tmpCutoutId && context?.tmpCutoutConfigId && designId) {
				const current = utils.design.getById.getData({ id: designId });
				if (!current) return;

				utils.design.getById.setData(
					{ id: designId },
					{
						...current,
						shapes: current.shapes.map((shape) => {
							if (shape.id !== variables.shapeId) return shape;
							return {
								...shape,
								sinkCutouts: shape.sinkCutouts.map((cutout) => {
									if (cutout.id !== context.tmpCutoutId) return cutout;
									return {
										...cutout,
										id: data.id, // Use the real cutout ID
										sinkCutoutConfig: {
											...cutout.sinkCutoutConfig,
											id: data.config.id, // Use the real cutout config ID
										},
									};
								}),
							};
						}),
					},
				);

				if (selectedShape && selectedShape.id === variables.shapeId) {
					setSelectedShape({
						...selectedShape,
						sinkCutouts: selectedShape.sinkCutouts.map((cutout) => {
							if (cutout.id !== context.tmpCutoutId) return cutout;
							return {
								...cutout,
								id: data.id,
								sinkCutoutConfig: {
									...cutout.sinkCutoutConfig,
									id: data.config.id,
								},
							};
						}),
					});
				}

				if (selectedCutout && selectedCutout.id === context.tmpCutoutId) {
					setSelectedCutout({
						...selectedCutout,
						id: data.id,
						sinkCutoutConfig: {
							...selectedCutout.sinkCutoutConfig,
							id: data.config.id,
						},
					});
				}
			}
		},
	});
};

export default useCreateCutout;
