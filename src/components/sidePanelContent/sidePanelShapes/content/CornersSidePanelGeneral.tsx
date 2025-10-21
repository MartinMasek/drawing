import type { FC } from "react";
import { useShape } from "~/components/header/context/ShapeContext";
import { SheetHeader, SheetTitle } from "~/components/ui/sheet";
import ShapeCard from "../../components/ShapeCard";
import type { ShapeSidePanelView } from "../ShapeSidePanel";

interface CornersSidePanelGeneralProps {
	setView: (value: ShapeSidePanelView) => void;
}

const CornersSidePanelGeneral: FC<CornersSidePanelGeneralProps> = ({
	setView,
}) => {
	const { selectedPoint } = useShape();

	return (
		<>
			<SheetHeader>
				<SheetTitle className="text-xl">Corners</SheetTitle>
			</SheetHeader>
			{!selectedPoint ? (
				<div className="flex flex-col gap-4 p-4">
					<p className="text-gray-400 text-sm">
						Click on a corner in the canvas to set up its parameters
					</p>
				</div>
			) : (
				<>
					<p className=" px-4 pt-4 font-semibold text-text-neutral-secondary text-xs">
						GENERAL
					</p>
					<div className="grid grid-cols-2 gap-4 p-4">
						<ShapeCard
							id='Radius'
							name={"Radius"}
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
										d="M6.75 45.5H45.75V26C45.75 15.1667 37.0833 6.5 26.25 6.5H6.75V45.5Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='Clip'
							name={"Clip"}
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
										d="M7.25 45.5H46.25V26L26.75 6.5H7.25V45.5Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='BumpOut'
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
										d="M6.51465 14.7604H26.6056L35.4692 6.59766L45.5146 16.8767L36.651 25.0395V45.5977H6.51465V14.7604Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='Notch'
							name={"Notch"}
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
										d="M7.25 6.5H31.0833V21.6667H46.25V45.5H7.25V6.5Z"
										stroke="#9CA3AF"
										stroke-width="2"
										stroke-linejoin="round"
									/>
								</svg>
							}
							onClick={() => setView("editCorners")}
							isActive={false}
						/>

						<ShapeCard
							id='None'
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
										d="M6.75 6.5H45.75V45.5H6.75V6.5Z"
										stroke="#2563EB"
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

export default CornersSidePanelGeneral;
