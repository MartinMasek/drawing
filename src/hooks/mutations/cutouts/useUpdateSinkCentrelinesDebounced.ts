import { useCallback } from "react";
import { api } from "~/utils/api";
import { useShape } from "~/components/header/context/ShapeContext";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";
import { useDebouncedCallback } from "use-debounce";
import type { CentrelinesX, CentrelinesY } from "@prisma/client";

const useUpdateSinkCentrelinesDebounced = (designId: string | undefined) => {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, selectedCutout, setSelectedCutout } =
		useShape();

	// Function to perform optimistic update immediately
	const performOptimisticUpdate = useCallback(
		(
			cutoutConfigId: string,
			centrelinesX: CentrelinesX,
			centrelinesY: CentrelinesY,
		) => {
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
												centrelinesX,
												centrelinesY,
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
						centrelinesX,
						centrelinesY,
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
										centrelinesX,
										centrelinesY,
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

	const mutation = api.design.updateSinkCentrelines.useMutation({
		onSuccess: () => {
			// The optimistic update already shows the correct data, and the server confirms it
			// No additional action needed - the cache already has the correct data
		},
	});
	const debouncedMutation = useDebouncedCallback(
		(
			cutoutConfigId: string,
			centrelinesX: CentrelinesX,
			centrelinesY: CentrelinesY,
		) => {
			mutation.mutate({ cutoutConfigId, centrelinesX, centrelinesY });
		},
		DEBOUNCE_DELAY,
	);

	const updateSinkCentrelines = useCallback(
		(
			cutoutConfigId: string,
			centrelinesX: CentrelinesX,
			centrelinesY: CentrelinesY,
		) => {
			performOptimisticUpdate(cutoutConfigId, centrelinesX, centrelinesY);
			debouncedMutation(cutoutConfigId, centrelinesX, centrelinesY);
		},
		[performOptimisticUpdate, debouncedMutation],
	);

	return {
		updateSinkCentrelines,
		isLoading: mutation.isPending,
		error: mutation.error,
	};
};
export default useUpdateSinkCentrelinesDebounced;
