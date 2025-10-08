type Props = {
	isOpen: boolean;
	cornerLabel: "top-left" | "top-right" | "bottom-left" | "bottom-right" | null;
	value: number;
	maxValue: number;
	onChange: (n: number) => void;
	onCancel: () => void;
	onApply: () => void;
};

export default function CornerClipModal({
	isOpen,
	cornerLabel,
	value,
	maxValue,
	onChange,
	onCancel,
	onApply,
}: Props) {
	if (!isOpen || !cornerLabel) return null;
	return (
		<button
			type="button"
			className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40"
			onClick={onCancel}
			onKeyDown={(e) => {
				if (e.key === "Escape" || e.key === "Enter") onCancel();
			}}
			onKeyUp={(e) => {
				if (e.key === "Escape" || e.key === "Enter") onCancel();
			}}
		>
			<dialog
				open
				className="w-full max-w-sm rounded-md border border-gray-200 bg-white p-4 shadow-lg"
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => {
					// Prevent dialog from closing on Enter/Escape if focus is inside
					e.stopPropagation();
				}}
				onKeyUp={(e) => {
					// Prevent dialog from closing on Enter/Escape if focus is inside
					e.stopPropagation();
				}}
			>
				<div className="mb-3 font-semibold text-base text-gray-900">
					Clip corner: {cornerLabel}
				</div>
				<div className="mb-2 text-gray-700 text-sm">
					Distance (px) — 0 to {Math.floor(maxValue)}
				</div>
				<input
					type="number"
					min={0}
					max={Math.max(0, Math.floor(maxValue))}
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
						onClick={onCancel}
					>
						Cancel
					</button>
					<button
						type="button"
						className="rounded-md border border-blue-600 bg-blue-600 px-3 py-1 text-sm text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						onClick={onApply}
					>
						Apply
					</button>
				</div>
			</dialog>
		</button>
	);
}
