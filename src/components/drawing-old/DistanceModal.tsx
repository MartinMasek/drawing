import type { ImageShape, RectShape } from "./types";

type Props = {
	isOpen: boolean;
	rects: ReadonlyArray<RectShape>;
	images: ReadonlyArray<ImageShape>;
	value: number;
	rectId: string | null;
	sinkId: string | null;
	onChange: (n: number) => void;
	onApply: (rect: RectShape, image: ImageShape, value: number) => void;
	onClose: () => void;
};

export default function DistanceModal({
	isOpen,
	rects,
	images,
	value,
	rectId,
	sinkId,
	onChange,
	onApply,
	onClose,
}: Props) {
	if (!isOpen || !rectId || !sinkId) return null;
	const r = rects.find((rr) => rr.id === rectId);
	const im = images.find((ii) => ii.id === sinkId);
	if (!r || !im) return null;
	return (
		<button
			type="button"
			className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
			onClick={onClose}
			onKeyDown={(e) => {
				if (e.key === "Escape" || e.key === "Enter") onClose();
			}}
			onKeyUp={(e) => {
				if (e.key === "Escape" || e.key === "Enter") onClose();
			}}
		>
			<dialog
				open
				className="w-full max-w-sm rounded-md border border-gray-200 bg-white p-4 shadow-lg"
				onClick={(e) => e.stopPropagation()}
				onKeyUp={(e) => {
					if (e.key === "Escape") onClose();
				}}
			>
				<div className="mb-3 font-semibold text-base text-gray-900">
					Adjust sink distance
				</div>
				<div className="mb-4 text-gray-700 text-sm">
					Distance from left edge (px)
				</div>
				<input
					type="number"
					value={value}
					onChange={(e) => {
						const n = Number(e.target.value);
						if (Number.isFinite(n)) onChange(n);
					}}
					className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<div className="flex items-center justify-end gap-2">
					<button
						type="button"
						className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						onClick={onClose}
					>
						Cancel
					</button>
					<button
						type="button"
						className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1 text-sm text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						onClick={() => onApply(r, im, value)}
					>
						Apply
					</button>
				</div>
			</dialog>
		</button>
	);
}
