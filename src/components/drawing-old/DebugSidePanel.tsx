import { IconBug } from "@tabler/icons-react";
import { XIcon } from "lucide-react";
import { type FC, useState } from "react";
import type { CardinalDirection, Coordinate } from "~/types/drawing";
import type { PreviewShape } from "~/hooks/useShapeDrawing";
import { Icon } from "../header/header/Icon";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";

interface DebugSidePanelProps {
	previewBounds: Coordinate[] | null;
	previewShape: PreviewShape | null;
	canChangeDirectionNow: boolean;
	lastDirection: CardinalDirection | null;
	onDebugModeChange: (enabled: boolean) => void;
}

const DebugSidePanel: FC<DebugSidePanelProps> = ({
	previewBounds,
	previewShape,
	canChangeDirectionNow,
	lastDirection,
	onDebugModeChange,
}) => {
	const [debugMode, setDebugMode] = useState(false);

	const handleToggleDebugMode = (enabled: boolean) => {
		setDebugMode(enabled);
		onDebugModeChange(enabled);
	};

	return (
		<Sheet>
			<SheetTrigger asChild>
				<button
					type="button"
					className="absolute top-16 right-3 z-50 flex size-[36px] items-center justify-center rounded-full bg-gray-800 shadow-lg hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-white focus:ring-offset-2"
					aria-label="Toggle debug panel"
				>
					<Icon size="md" className="text-white">
						<IconBug />
					</Icon>
				</button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-[400px] gap-0 overflow-y-auto"
				onInteractOutside={(e) => {
					// Prevent the sheet from closing when clicking outside
					e.preventDefault();
				}}
			>
				<div className="space-y-4 p-4">
					<div className="flex items-center justify-between">
						<h2 className="font-bold text-xl">Debug Panel</h2>
						<SheetTrigger asChild>
							<button
								type="button"
								className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-offset-background"
								aria-label="Close debug panel"
							>
								<XIcon className="size-4" />
							</button>
						</SheetTrigger>
					</div>

					<div className="rounded-lg bg-gray-100 p-4">
						<div className="mb-3 flex items-center justify-between">
							<h3 className="font-semibold text-lg">Visualize Points</h3>
							<label className="flex cursor-pointer items-center gap-2">
								<input
									type="checkbox"
									checked={debugMode}
									onChange={(e) => handleToggleDebugMode(e.target.checked)}
									className="size-4 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								/>
								<span className="text-sm">Show Points</span>
							</label>
						</div>
					</div>

					{previewShape && (
						<div className="rounded-lg bg-gray-100 p-4">
							<h3 className="mb-2 font-semibold text-lg">Draft Shape State</h3>
							<div className="space-y-2">
								<div className="flex items-center justify-between rounded bg-white px-3 py-2">
									<span className="font-medium text-sm">Direction:</span>
									<span className="font-mono text-sm">
										{previewShape.direction}
									</span>
								</div>
								<div className="flex items-center justify-between rounded bg-white px-3 py-2">
									<span className="font-medium text-sm">Last Direction:</span>
									<span className="font-mono text-sm">
										{lastDirection ?? 'N/A'}
									</span>
								</div>
								<div className="flex items-center justify-between rounded bg-white px-3 py-2">
									<span className="font-medium text-sm">Current X:</span>
									<span className="font-mono text-sm">
										{previewShape.currentX.toFixed(2)}
									</span>
								</div>
								<div className="flex items-center justify-between rounded bg-white px-3 py-2">
									<span className="font-medium text-sm">Current Y:</span>
									<span className="font-mono text-sm">
										{previewShape.currentY.toFixed(2)}
									</span>
								</div>
								<div className="flex items-center justify-between rounded bg-white px-3 py-2">
									<span className="font-medium text-sm">Direction Changes:</span>
									<span className="font-mono text-sm">
										{previewShape.changedDirectionPoints.length}
									</span>
								</div>
								<div className="flex items-center justify-between rounded bg-white px-3 py-2">
									<span className="font-medium text-sm">Can Change Direction:</span>
									<span
										className={`font-mono text-sm ${canChangeDirectionNow ? "text-green-600" : "text-red-600"}`}
									>
										{canChangeDirectionNow ? "✓ Yes" : "✗ No"}
									</span>
								</div>
							</div>
						</div>
					)}

					<div className="rounded-lg bg-gray-100 p-4">
						<h3 className="mb-2 font-semibold text-lg">Preview Bounds</h3>
						{previewBounds ? (
							<div className="space-y-2">
								<p className="text-gray-600 text-sm">
									Points count: {previewBounds.length}
								</p>
								<pre className="overflow-auto rounded bg-white p-3 text-xs">
									{JSON.stringify(previewBounds, null, 2)}
								</pre>
							</div>
						) : (
							<p className="text-gray-600 text-sm">No preview shape</p>
						)}
					</div>

					{previewShape && previewShape.changedDirectionPoints.length > 0 && (
						<div className="rounded-lg bg-gray-100 p-4">
							<h3 className="mb-2 font-semibold text-lg">
								Direction Change Points
							</h3>
							<pre className="overflow-auto rounded bg-white p-3 text-xs">
								{JSON.stringify(previewShape.changedDirectionPoints, null, 2)}
							</pre>
						</div>
					)}

					{/* Add more debug sections here as needed */}
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default DebugSidePanel;
