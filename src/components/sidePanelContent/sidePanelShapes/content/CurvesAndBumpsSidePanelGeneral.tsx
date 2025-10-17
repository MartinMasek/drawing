import type { FC } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { SheetHeader, SheetTitle } from "~/components/ui/sheet";
import ShapeCard from "../../components/ShapeCard";
import type { ShapeSidePanelView } from "../ShapeSidePanel";

interface CurvesAndBumpsSidePanelGeneralProps {
	setView: (value: ShapeSidePanelView) => void;
}

const CurvesAndBumpsSidePanelGeneral: FC<
	CurvesAndBumpsSidePanelGeneralProps
> = ({ setView }) => {
	const { selectedEdge } = useShape();

	return (
		<>
			<SheetHeader>
				<SheetTitle className="text-xl">Curves & Bumps</SheetTitle>
			</SheetHeader>
			{!selectedEdge ? (
				<div className="flex flex-col gap-4 p-4">
					<p className="text-gray-400 text-sm">
						Click on an edge or element in the canvas to see the available
						options and set up its parameters
					</p>
				</div>
			) : (
				<>
					<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
						GENERAL
					</p>
					<div className="grid grid-cols-2 gap-4 p-4">
						<ShapeCard
							name={"Bump-Out"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.75 41.1663H45.75V19.4997H37.0833L32.75 10.833H20.3947L16.0614 19.4997H6.75V41.1663Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCurves")}
							isActive={false}
						/>

						<ShapeCard
							name={"Bump-In"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.25 41.1667H46.25V19.5H37.5833L33.25 28.1667H20.8947L16.5614 19.5H7.25V41.1667Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCurves")}
							isActive={false}
						/>

						<ShapeCard
							name={"Bump-Out Curve"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.75 41.1663H45.75V19.4997H37.0833C37.0833 19.4997 34.9167 10.833 26.25 10.833C17.5833 10.833 16.0614 19.4997 16.0614 19.4997H6.75V41.1663Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCurves")}
							isActive={false}
						/>

						<ShapeCard
							name={"Bump-In Curve"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.25 41.1667H46.25V19.5H37.5833C37.5833 19.5 35.4167 28.1667 26.75 28.1667C18.0833 28.1667 16.5614 19.5 16.5614 19.5H7.25V41.1667Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCurves")}
							isActive={false}
						/>

						<ShapeCard
							name={"Full Curve"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M6.75 41.1663H45.75V19.4997C45.75 19.4997 40.3333 10.833 26.25 10.833C12.1667 10.833 6.75 19.4997 6.75 19.4997V41.1663Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCurves")}
							isActive={false}
						/>

						<ShapeCard
							name={"None"}
							icon={
								// biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
								<svg
									width="53"
									height="52"
									viewBox="0 0 53 52"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7.25 41.1667H46.25V19.5H7.25V41.1667Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							isActive={true}
						/>
					</div>
				</>
			)}
		</>
	);
};

export default CurvesAndBumpsSidePanelGeneral;
