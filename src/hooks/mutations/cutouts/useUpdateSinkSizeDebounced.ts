import { useCallback } from "react";
import { api } from "~/utils/api";
import { useShape } from "~/context/ShapeContext";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";
import { useDebouncedCallback } from "use-debounce";

const useUpdateSinkSizeDebounced = (designId: string | undefined) => {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, selectedCutout, setSelectedCutout } =
		useShape();

	// Function to perform optimistic update immediately
	const performOptimisticUpdate = useCallback(
		(cutoutConfigId: string, length: number, width: number) => {
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
												length,
												width,
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
					sinkCutoutConfig: {
						...selectedCutout.sinkCutoutConfig,
						length,
						width,
					},
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
									sinkCutoutConfig: {
										...cutout.sinkCutoutConfig,
										length,
										width,
									},
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

	const mutation = api.design.updateSinkSize.useMutation({
		onSuccess: () => {
			// The optimistic update already shows the correct data, and the server confirms it
			// No additional action needed - the cache already has the correct data
		},
	});
	const debouncedMutation = useDebouncedCallback(
		(cutoutConfigId: string, length: number, width: number) => {
			mutation.mutate({ cutoutConfigId, length, width });
		},
		DEBOUNCE_DELAY,
	);

	const updateSinkSize = useCallback(
		(cutoutConfigId: string, length: number, width: number) => {
			performOptimisticUpdate(cutoutConfigId, length, width);
			debouncedMutation(cutoutConfigId, length, width);
		},
		[performOptimisticUpdate, debouncedMutation],
	);

	return {
		updateSinkSize,
		isLoading: mutation.isPending,
		error: mutation.error,
	};
};
export default useUpdateSinkSizeDebounced;
