import { FastLayer, Rect, Shape } from "react-konva";
import type { RectShape } from "../types";
import { getEffectiveCornerOffsets } from "../utils/geometry";

type Props = {
	rects: ReadonlyArray<RectShape>;
};

export default function OutlineLayer({ rects }: Props) {
	return (
		<FastLayer listening={false} hitGraphEnabled={false}>
			{rects.map((r) => {
				const o = getEffectiveCornerOffsets(r);
				const tl = o["top-left"];
				const tr = o["top-right"];
				const bl = o["bottom-left"];
				const br = o["bottom-right"];
				return (
					<>
						<Shape
							key={`shape-${r.id}`}
							listening={false}
							sceneFunc={(ctx) => {
								ctx.save();
								ctx.lineWidth = 2;
								ctx.setLineDash([]);
								// Top
								ctx.beginPath();
								ctx.moveTo(r.x + tl, r.y);
								ctx.lineTo(r.x + r.width - tr, r.y);
								ctx.strokeStyle = r.edges.top;
								ctx.stroke();
								// Right
								ctx.beginPath();
								ctx.moveTo(r.x + r.width, r.y + tr);
								ctx.lineTo(r.x + r.width, r.y + r.height - br);
								ctx.strokeStyle = r.edges.right;
								ctx.stroke();
								// Bottom
								ctx.beginPath();
								ctx.moveTo(r.x + r.width - br, r.y + r.height);
								ctx.lineTo(r.x + bl, r.y + r.height);
								ctx.strokeStyle = r.edges.bottom;
								ctx.stroke();
								// Left
								ctx.beginPath();
								ctx.moveTo(r.x, r.y + r.height - bl);
								ctx.lineTo(r.x, r.y + tl);
								ctx.strokeStyle = r.edges.left;
								ctx.stroke();

								// Corner transitions prefer radius arcs over bevels
								const radii = r.radii ?? {
									"top-left": 0,
									"top-right": 0,
									"bottom-left": 0,
									"bottom-right": 0,
								};
								const clips = r.clips ?? {
									"top-left": 0,
									"top-right": 0,
									"bottom-left": 0,
									"bottom-right": 0,
								};

								if (radii["top-left"] > 0 && clips["top-left"] === 0) {
									ctx.beginPath();
									ctx.arc(
										r.x + radii["top-left"],
										r.y + radii["top-left"],
										radii["top-left"],
										Math.PI,
										1.5 * Math.PI,
									);
									ctx.strokeStyle = r.edges.top;
									ctx.stroke();
								} else if (tl > 0) {
									ctx.beginPath();
									ctx.moveTo(r.x, r.y + tl);
									ctx.lineTo(r.x + tl, r.y);
									ctx.strokeStyle = r.edges.top;
									ctx.stroke();
								}

								if (radii["top-right"] > 0 && clips["top-right"] === 0) {
									ctx.beginPath();
									ctx.arc(
										r.x + r.width - radii["top-right"],
										r.y + radii["top-right"],
										radii["top-right"],
										-Math.PI / 2,
										0,
									);
									ctx.strokeStyle = r.edges.top;
									ctx.stroke();
								} else if (tr > 0) {
									ctx.beginPath();
									ctx.moveTo(r.x + r.width - tr, r.y);
									ctx.lineTo(r.x + r.width, r.y + tr);
									ctx.strokeStyle = r.edges.top;
									ctx.stroke();
								}

								if (radii["bottom-left"] > 0 && clips["bottom-left"] === 0) {
									ctx.beginPath();
									ctx.arc(
										r.x + radii["bottom-left"],
										r.y + r.height - radii["bottom-left"],
										radii["bottom-left"],
										Math.PI / 2,
										Math.PI,
									);
									ctx.strokeStyle = r.edges.bottom;
									ctx.stroke();
								} else if (bl > 0) {
									ctx.beginPath();
									ctx.moveTo(r.x, r.y + r.height - bl);
									ctx.lineTo(r.x + bl, r.y + r.height);
									ctx.strokeStyle = r.edges.bottom;
									ctx.stroke();
								}

								if (radii["bottom-right"] > 0 && clips["bottom-right"] === 0) {
									ctx.beginPath();
									ctx.arc(
										r.x + r.width - radii["bottom-right"],
										r.y + r.height - radii["bottom-right"],
										radii["bottom-right"],
										0,
										Math.PI / 2,
									);
									ctx.strokeStyle = r.edges.bottom;
									ctx.stroke();
								} else if (br > 0) {
									ctx.beginPath();
									ctx.moveTo(r.x + r.width - br, r.y + r.height);
									ctx.lineTo(r.x + r.width, r.y + r.height - br);
									ctx.strokeStyle = r.edges.bottom;
									ctx.stroke();
								}

								ctx.restore();
							}}
						/>
						{/* Corner markers */}
						<Rect
							key={`${r.id}-c-tl`}
							x={r.x - 2}
							y={r.y - 2}
							width={4}
							height={4}
							fill={r.corners["top-left"]}
							listening={false}
						/>
						<Rect
							key={`${r.id}-c-tr`}
							x={r.x + r.width - 2}
							y={r.y - 2}
							width={4}
							height={4}
							fill={r.corners["top-right"]}
							listening={false}
						/>
						<Rect
							key={`${r.id}-c-bl`}
							x={r.x - 2}
							y={r.y + r.height - 2}
							width={4}
							height={4}
							fill={r.corners["bottom-left"]}
							listening={false}
						/>
						<Rect
							key={`${r.id}-c-br`}
							x={r.x + r.width - 2}
							y={r.y + r.height - 2}
							width={4}
							height={4}
							fill={r.corners["bottom-right"]}
							listening={false}
						/>
					</>
				);
			})}
		</FastLayer>
	);
}
