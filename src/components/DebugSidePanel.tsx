import { IconBug } from "@tabler/icons-react";
import { XIcon } from "lucide-react";
import { type FC, useState } from "react";
import type { CardinalDirection, Coordinate, EdgeModification } from "~/types/drawing";
import type { PreviewShape } from "~/hooks/useShapeDrawing";

import { Icon } from "./header/header/Icon";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useDrawing } from "./header/context/DrawingContext";
import { cn } from "~/lib/utils";

interface DebugSidePanelProps {
	previewBounds: Coordinate[] | null;
	previewShape: PreviewShape | null;
	canChangeDirectionNow: boolean;
	lastDirection: CardinalDirection | null;
	onDebugModeChange: (enabled: boolean) => void;
	allModifications: EdgeModification[];
	shapePointsCount?: number;
}

const DebugSidePanel: FC<DebugSidePanelProps> = ({
	previewBounds,
	previewShape,
	canChangeDirectionNow,
	lastDirection,
	onDebugModeChange,
	allModifications,
	shapePointsCount = 0,
}) => {
		const { isOpenSideDialog} = useDrawing();

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
				className={cn("w-[400px] gap-0 overflow-y-auto", isOpenSideDialog ? "right-[339px]" : "right-0")}
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
						<h3 className="mb-2 font-semibold text-lg">Points Visualization</h3>
						<div className="space-y-2">
							<div className="flex items-center justify-between rounded bg-white px-3 py-2">
								<span className="font-medium text-sm">
									<span className="mr-2 inline-block size-3 rounded-full bg-[#00BFFF]" />
									Shape Points:
								</span>
								<span className="font-mono text-sm">
									{shapePointsCount}
								</span>
							</div>
							<div className="flex items-center justify-between rounded bg-white px-3 py-2">
								<span className="font-medium text-sm">
									<span className="mr-2 inline-block size-3 rounded-full bg-[#FF00FF]" />
									Modification Points:
								</span>
								<span className="font-mono text-sm">
									{allModifications.reduce((sum, mod) => sum + (mod.points?.length || 0), 0)}
								</span>
							</div>
							<div className="flex items-center justify-between rounded bg-white px-3 py-2">
								<span className="font-medium text-sm">Total Modifications:</span>
								<span className="font-mono text-sm">
									{allModifications.length}
								</span>
							</div>
							{allModifications.map((mod, idx) => (
								<div key={mod.id || idx} className="rounded bg-white px-3 py-2">
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm">Mod {idx + 1}:</span>
										<span className="font-mono text-gray-600 text-xs">
											{mod.type}
										</span>
									</div>
									<div className="mt-1 flex items-center justify-between">
										<span className="text-gray-600 text-xs">Points:</span>
										<span className="font-mono text-xs">
											{mod.points?.length || 0}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-lg bg-gray-100 p-4">
						<h3 className="mb-2 font-semibold text-lg">All Modifications (Raw)</h3>
						<pre className="overflow-auto rounded bg-white p-3 text-xs">
							{JSON.stringify(allModifications, null, 2)}
						</pre>
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
										{lastDirection ?? "N/A"}
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
									<span className="font-medium text-sm">
										Direction Changes:
									</span>
									<span className="font-mono text-sm">
										{previewShape.changedDirectionPoints.length}
									</span>
								</div>
								<div className="flex items-center justify-between rounded bg-white px-3 py-2">
									<span className="font-medium text-sm">
										Can Change Direction:
									</span>
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
