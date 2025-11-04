import { useCallback } from "react";
import { api } from "~/utils/api";
import type { CutoutSinkType } from "@prisma/client";
import { useShape } from "~/context/ShapeContext";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";
import { useDebouncedCallback } from "use-debounce";

const useUpdateSinkTypeDebounced = (designId: string | undefined) => {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, selectedCutout, setSelectedCutout } =
		useShape();

	// Function to perform optimistic update immediately
	const performOptimisticUpdate = useCallback(
		(cutoutConfigId: string, sinkType: CutoutSinkType) => {
			if (!designId) return;

			// Update cache immediately
			const previousData = utils.design.getById.getData({ id: designId });
			if (previousData) {
				utils.design.getById.setData(
					{ id: designId },
					{
						...previousData,
						shapes: previousData.shapes.map((shape) => ({
							...shape,
							sinkCutouts: shape.sinkCutouts.map((cutout) =>
								cutout.sinkCutoutConfig.id === cutoutConfigId
									? {
											...cutout,
											sinkCutoutConfig: {
												...cutout.sinkCutoutConfig,
												sinkType,
											},
										}
									: cutout,
							),
						})),
					},
				);
			}

			// Update selected edge immediately
			if (
				selectedCutout &&
				selectedCutout.sinkCutoutConfig.id === cutoutConfigId
			) {
				setSelectedCutout({
					...selectedCutout,
					sinkCutoutConfig: { ...selectedCutout.sinkCutoutConfig, sinkType },
				});
			}

			// Update selected shape immediately
			if (selectedShape) {
				setSelectedShape({
					...selectedShape,
					sinkCutouts: selectedShape.sinkCutouts.map((cutout) =>
						cutout.sinkCutoutConfig.id === cutoutConfigId
							? {
									...cutout,
									sinkCutoutConfig: { ...cutout.sinkCutoutConfig, sinkType },
								}
							: cutout,
					),
				});
			}
		},
		[
			designId,
			utils,
			selectedCutout,
			setSelectedCutout,
			selectedShape,
			setSelectedShape,
		],
	);

	const mutation = api.design.updateSinkType.useMutation({
		onSuccess: () => {
			// The optimistic update already shows the correct data, and the server confirms it
			// No additional action needed - the cache already has the correct data
		},
	});
	const debouncedMutation = useDebouncedCallback(
		(cutoutConfigId: string, sinkType: CutoutSinkType) => {
			mutation.mutate({ cutoutConfigId, sinkType });
		},
		DEBOUNCE_DELAY,
	);

	const updateSinkType = useCallback(
		(cutoutConfigId: string, sinkType: CutoutSinkType) => {
			performOptimisticUpdate(cutoutConfigId, sinkType);
			debouncedMutation(cutoutConfigId, sinkType);
		},
		[performOptimisticUpdate, debouncedMutation],
	);

	return {
		updateSinkType,
		isLoading: mutation.isPending,
		error: mutation.error,
	};
};
export default useUpdateSinkTypeDebounced;
