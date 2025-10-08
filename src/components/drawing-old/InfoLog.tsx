import type { ImageShape, LineShape, RectShape } from "./types";

type Props = {
	show: boolean;
	stagePosition: { x: number; y: number };
	stageScale: number;
	rects: ReadonlyArray<RectShape>;
	images: ReadonlyArray<ImageShape>;
	lines: ReadonlyArray<LineShape>;
	onOpenDistance: (rectId: string, imageId: string, value: number) => void;
};

export default function InfoLog({
	show,
	stagePosition,
	stageScale,
	rects,
	images,
	lines,
	onOpenDistance: _onOpenDistance,
}: Props) {
	if (!show) return null;
	return (
		<div className="mt-3 rounded-md border border-gray-200 bg-white p-3 shadow-sm">
			<div className="mb-2 flex flex-wrap items-center gap-3 text-gray-700 text-sm">
				<div>
					<span className="font-semibold">Stage:</span> pos (
					{stagePosition.x.toFixed(1)}, {stagePosition.y.toFixed(1)}) • scale{" "}
					{stageScale.toFixed(2)}
				</div>
				<div>
					<span className="font-semibold">Rects:</span> {rects.length}
				</div>
				<div>
					<span className="font-semibold">Sinks:</span> {images.length}
				</div>
				<div>
					<span className="font-semibold">Lines:</span> V{" "}
					{lines.filter((l) => l.kind === "v").length} • H{" "}
					{lines.filter((l) => l.kind === "h").length}
				</div>
			</div>

			{lines.length > 0 && (
				<div className="mb-3 rounded-md border border-gray-100 bg-white p-2 text-gray-700 text-sm">
					<div className="mb-1 font-medium text-gray-800">Dividers</div>
					<div className="flex flex-wrap gap-2">
						{lines
							.filter((l) => l.kind === "v")
							.sort((a, b) => a.at - b.at)
							.map((l) => (
								<span key={l.id} className="rounded bg-gray-50 px-2 py-0.5">
									V x={l.at.toFixed(1)}
								</span>
							))}
						{lines
							.filter((l) => l.kind === "h")
							.sort((a, b) => a.at - b.at)
							.map((l) => (
								<span key={l.id} className="rounded bg-gray-50 px-2 py-0.5">
									H y={l.at.toFixed(1)}
								</span>
							))}
					</div>
				</div>
			)}

			{(() => {
				const vLines = lines
					.filter((l) => l.kind === "v")
					.map((l) => l.at)
					.sort((a, b) => a - b);
				if (vLines.length === 0) {
					return null;
				}
				const groups: RectShape[][] = Array.from(
					{ length: vLines.length + 1 },
					() => [] as RectShape[],
				);
				for (const r of rects) {
					const centerX = r.x + r.width / 2;
					let seg = vLines.findIndex((x) => centerX < x);
					if (seg === -1) seg = vLines.length;
					groups[seg]?.push(r);
				}
				return (
					<div className="mb-3 rounded-md border border-gray-100 bg-white p-3">
						<div className="mb-2 font-semibold text-gray-900 text-sm">
							Rect groups by vertical lines
						</div>
						<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
							{groups.map((grp, idx) => {
								const label =
									idx === 0
										? `Left of x=${vLines[0]?.toFixed(1)}`
										: idx === vLines.length
											? `Right of x=${vLines[vLines.length - 1]?.toFixed(1)}`
											: `Between x=${vLines[idx - 1]?.toFixed(1)} and x=${vLines[idx]?.toFixed(1)}`;
								return (
									<div
										key={`grp-${vLines[idx - 1] ?? -1}-${vLines[idx] ?? -1}`}
										className="rounded border border-gray-100 bg-white p-2"
									>
										<div className="mb-1 font-medium text-gray-800 text-sm">
											{label}
										</div>
										{grp.length === 0 ? (
											<div className="rounded bg-gray-50 px-2 py-1 text-gray-500 text-sm">
												none
											</div>
										) : (
											<div className="flex flex-wrap gap-2 text-gray-700 text-sm">
												{grp.map((r) => (
													<span
														key={`grp-${idx}-${r.id}`}
														className="rounded bg-gray-50 px-2 py-0.5"
													>
														{r.id} ({r.x.toFixed(0)},{r.y.toFixed(0)})
													</span>
												))}
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				);
			})()}

			<div className="grid grid-cols-1 gap-3">
				{rects.map((r) => {
					const left = r.x;
					const right = r.x + r.width;
					const top = r.y;
					const bottom = r.y + r.height;
					const corners: ReadonlyArray<{
						label: string;
						x: number;
						y: number;
					}> = [
						{ label: "top-left", x: r.x, y: r.y },
						{ label: "top-right", x: r.x + r.width, y: r.y },
						{ label: "bottom-left", x: r.x, y: r.y + r.height },
						{ label: "bottom-right", x: r.x + r.width, y: r.y + r.height },
					];
					const sinks = images.filter((img) => img.parentRectId === r.id);
					return (
						<div
							key={`log-rect-${r.id}`}
							className="rounded-md border border-gray-100 bg-white p-3"
						>
							<div className="mb-1 font-semibold text-gray-800 text-sm">
								Rect {r.id}
							</div>
							<div className="mb-2 grid grid-cols-2 gap-2 text-gray-700 text-sm">
								<div>
									pos: ({r.x.toFixed(1)}, {r.y.toFixed(1)})
								</div>
								<div>
									size: {r.width.toFixed(1)} × {r.height.toFixed(1)}
								</div>
								<div>
									edges: L {left.toFixed(1)}, R {right.toFixed(1)}
								</div>
								<div>
									edges: T {top.toFixed(1)}, B {bottom.toFixed(1)}
								</div>
							</div>
							<div className="mb-2 text-gray-700 text-sm">
								<div className="font-medium text-gray-800">
									sinks ({sinks.length})
								</div>
								{sinks.length === 0 ? (
									<div className="mt-1 rounded bg-gray-50 px-2 py-1 text-gray-500">
										none
									</div>
								) : (
									<div className="mt-1 grid grid-cols-1 gap-1">
										{sinks.map((img) => {
											const centerX = img.x + img.width / 2;
											const centerY = img.y + img.height / 2;
											const distLeft = centerX - r.x;
											return (
												<div
													key={`sink-${img.id}`}
													className="rounded bg-gray-50 px-2 py-1"
												>
													<span className="font-semibold">{img.id}</span> • pos:
													({img.x.toFixed(1)}, {img.y.toFixed(1)}) • center: (
													{centerX.toFixed(1)}, {centerY.toFixed(1)}) • from
													left: {Math.round(distLeft)} px
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
