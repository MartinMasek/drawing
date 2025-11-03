import { useCallback } from "react";
import { api } from "~/utils/api";
import { useShape } from "~/context/ShapeContext";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";
import { useDebouncedCallback } from "use-debounce";

const useUpdateSinkFaucetHolesDebounced = (designId: string | undefined) => {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, selectedCutout, setSelectedCutout } =
		useShape();

	// Function to perform optimistic update immediately
	const performOptimisticUpdate = useCallback(
		(cutoutConfigId: string, holeCount: number) => {
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
												holeCount,
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
					sinkCutoutConfig: { ...selectedCutout.sinkCutoutConfig, holeCount },
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
									sinkCutoutConfig: { ...cutout.sinkCutoutConfig, holeCount },
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

	const mutation = api.design.updateSinkFaucetHoles.useMutation({
		onSuccess: () => {
			// The optimistic update already shows the correct data, and the server confirms it
			// No additional action needed - the cache already has the correct data
		},
	});
	const debouncedMutation = useDebouncedCallback(
		(cutoutConfigId: string, holeCount: number) => {
			mutation.mutate({ cutoutConfigId, holeCount });
		},
		DEBOUNCE_DELAY,
	);

	const updateSinkFaucetHoles = useCallback(
		(cutoutConfigId: string, holeCount: number) => {
			performOptimisticUpdate(cutoutConfigId, holeCount);
			debouncedMutation(cutoutConfigId, holeCount);
		},
		[performOptimisticUpdate, debouncedMutation],
	);

	return {
		updateSinkFaucetHoles,
		isLoading: mutation.isPending,
		error: mutation.error,
	};
};
export default useUpdateSinkFaucetHolesDebounced;
