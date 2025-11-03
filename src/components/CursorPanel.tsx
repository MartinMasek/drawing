import {
	IconBorderRadius,
	IconDimensions,
	IconMarquee2,
	IconTextSize,
} from "@tabler/icons-react";
import type { FC } from "react";
import { useDrawing } from "~/components/context/DrawingContext";
import { CursorTypes, DrawingTab } from "~/types/drawing";
import Button from "~/components/Button";
import { Icon } from "~/components/Icon";
import { Divider } from "~/components/Divider";
import { useShape } from "./context/ShapeContext";
import ShapeIcon from "./icons/ShapeIcon";
import EdgeIcon from "./icons/EdgeIcon";
import CutoutIcon from "./icons/CutoutIcon";
import PackageIcon from "./icons/PackageIcon";

const CursorPanel: FC = () => {
	const { activeTab, cursorType, setCursorType, setIsOpenSideDialog } = useDrawing();
	const { setSelectedEdge, setSelectedCorner, setSelectedShape } = useShape();

	return (
		<div className="absolute top-3 left-3 z-50 flex w-11 flex-col items-center gap-1 rounded-[10px] bg-white py-1 shadow-lg">
			{activeTab === DrawingTab.Dimensions && (
				<Button
					color={cursorType === CursorTypes.Dimesions ? "primary" : "neutral"}
					iconOnly
					size="sm"
					variant={cursorType === CursorTypes.Dimesions ? "outlined" : "text"}
					className="h-[36px] w-[36px]"
					onClick={() => setCursorType(CursorTypes.Dimesions)}
				>
					<Icon size="md">
						<IconDimensions />
					</Icon>
				</Button>
			)}
			{activeTab === DrawingTab.Shape && (
				<>
					<Button
						color={cursorType === CursorTypes.Curves ? "primary" : "neutral"}
						iconOnly
						size="sm"
						variant={cursorType === CursorTypes.Curves ? "outlined" : "text"}
						className="h-[36px] w-[36px]"
						onClick={() => {
							setCursorType(CursorTypes.Curves);
							setSelectedEdge(null);
							setSelectedCorner(null);
							setSelectedShape(null);
						}}
					>
						<Icon size="md">
							<ShapeIcon isActive={cursorType === CursorTypes.Curves} />
						</Icon>
					</Button>
					<Button
						color={cursorType === CursorTypes.Corners ? "primary" : "neutral"}
						iconOnly
						size="sm"
						variant={cursorType === CursorTypes.Corners ? "outlined" : "text"}
						className="h-[36px] w-[36px]"
						onClick={() => {
							setCursorType(CursorTypes.Corners);
							setSelectedEdge(null);
							setSelectedCorner(null);
							setSelectedShape(null);
						}}
					>
						<Icon size="md">
							<IconBorderRadius />
						</Icon>
					</Button>
				</>
			)}
			{activeTab === DrawingTab.Edges && (
				<Button
					color={cursorType === CursorTypes.Edges ? "primary" : "neutral"}
					iconOnly
					size="sm"
					variant={cursorType === CursorTypes.Edges ? "outlined" : "text"}
					className="h-[36px] w-[36px]"
					onClick={() => setCursorType(CursorTypes.Edges)}
				>
					<Icon size="md">
						<EdgeIcon isActive={cursorType === CursorTypes.Edges} />
					</Icon>
				</Button>
			)}
			{activeTab === DrawingTab.Cutouts && (
				<Button
					color={cursorType === CursorTypes.Cutouts ? "primary" : "neutral"}
					iconOnly
					size="sm"
					variant={cursorType === CursorTypes.Cutouts ? "outlined" : "text"}
					className="h-[36px] w-[36px]"
					onClick={() => setCursorType(CursorTypes.Cutouts)}
				>
					<Icon size="md">
						<CutoutIcon isActive={cursorType === CursorTypes.Cutouts} />
					</Icon>
				</Button>
			)}
			<Divider className="border-[0.5px]" />
			<Button
				color={cursorType === CursorTypes.Text ? "primary" : "neutral"}
				iconOnly
				size="sm"
				variant={cursorType === CursorTypes.Text ? "outlined" : "text"}
				className="h-[36px] w-[36px]"
				onClick={() => {
					setCursorType(CursorTypes.Text);
					setIsOpenSideDialog(false);
				}}
			>
				<Icon size="md">
					<IconTextSize />
				</Icon>
			</Button>
			<Button
				color={cursorType === CursorTypes.Area ? "primary" : "neutral"}
				iconOnly
				size="sm"
				disabled={true}
				variant={cursorType === CursorTypes.Area ? "outlined" : "text"}
				className="h-[36px] w-[36px]"
				onClick={() => setCursorType(CursorTypes.Area)}
			>
				<Icon size="md">
					<IconMarquee2 />
				</Icon>
			</Button>
			<Button
				color={cursorType === CursorTypes.Package ? "primary" : "neutral"}
				iconOnly
				size="sm"
				disabled={true}
				variant={cursorType === CursorTypes.Package ? "outlined" : "text"}
				className="h-[36px] w-[36px]"
				onClick={() => setCursorType(CursorTypes.Package)}
			>
				<Icon size="md">
					<PackageIcon isActive={cursorType === CursorTypes.Package} />
				</Icon>
			</Button>
		</div>
	);
};

export default CursorPanel;
