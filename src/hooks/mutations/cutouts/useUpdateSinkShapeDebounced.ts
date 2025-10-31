import { useCallback } from "react";
import { api } from "~/utils/api";
import type { CutoutShape } from "@prisma/client";
import { useShape } from "~/components/header/context/ShapeContext";
import { DEBOUNCE_DELAY } from "~/utils/canvas-constants";
import { useDebouncedCallback } from "use-debounce";

const useUpdateSinkShapeDebounced = (designId: string | undefined) => {
	const utils = api.useUtils();
	const { selectedShape, setSelectedShape, selectedCutout, setSelectedCutout } =
		useShape();

	// Function to perform optimistic update immediately
	const performOptimisticUpdate = useCallback(
		(cutoutConfigId: string, cutoutShape: CutoutShape) => {
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
												shape: cutoutShape,
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
						shape: cutoutShape,
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
										shape: cutoutShape,
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

	const mutation = api.design.updateSinkShape.useMutation({
		onSuccess: () => {
			// The optimistic update already shows the correct data, and the server confirms it
			// No additional action needed - the cache already has the correct data
		},
	});
	const debouncedMutation = useDebouncedCallback(
		(cutoutConfigId: string, cutoutShape: CutoutShape) => {
			mutation.mutate({ cutoutConfigId, cutoutShape });
		},
		DEBOUNCE_DELAY,
	);

	const updateSinkShape = useCallback(
		(cutoutConfigId: string, cutoutShape: CutoutShape) => {
			performOptimisticUpdate(cutoutConfigId, cutoutShape);
			debouncedMutation(cutoutConfigId, cutoutShape);
		},
		[performOptimisticUpdate, debouncedMutation],
	);

	return {
		updateSinkShape,
		isLoading: mutation.isPending,
		error: mutation.error,
	};
};
export default useUpdateSinkShapeDebounced;
