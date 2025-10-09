import {
	IconArrowBackUp,
	IconArrowForwardUp,
	IconDeviceFloppy,
	IconHelp,
	IconSettings,
} from "@tabler/icons-react";
import type { FC } from "react";

import { useDrawing } from "../context/DrawingContext";
import Button from "./Button";
import { Divider } from "./Divider";
import { Icon } from "./Icon";
import Zoom from "./Zoom";

const DrawingHeaderActions: FC = () => {
	const { zoom, setZoom } = useDrawing();

	return (
		<div className="flex h-full items-center w-[507px]">
			<Zoom className="flex px-3" onChange={setZoom} value={zoom} />
			<Divider className="h-full border-[0.5px]" orientation="vertical" />
			{/* Undo / Redo */}
			<div className="flex items-center gap-2 px-3">
				<Button color="neutral" iconOnly size="sm" variant="outlined">
					<Icon size="md">
						<IconArrowBackUp />
					</Icon>
				</Button>
				<Button color="neutral" iconOnly size="sm" variant="outlined">
					<Icon size="md">
						<IconArrowForwardUp />
					</Icon>
				</Button>
			</div>
			<Divider className="h-full border-[0.5px]" orientation="vertical" />
			{/* Settings / Help / Save */}
			<div className="flex items-center gap-2 px-3">
				<Button color="neutral" iconOnly size="sm" variant="outlined">
					<Icon size="md">
						<IconSettings />
					</Icon>
				</Button>
				<Button color="neutral" iconOnly size="sm" variant="outlined">
					<Icon size="md">
						<IconHelp />
					</Icon>
				</Button>
				<Button
					className="h-[38px]"
					color="primary"
					iconLeft={
						<Icon size="md">
							<IconDeviceFloppy />
						</Icon>
					}
					size="sm"
				>
					Save
				</Button>
			</div>
		</div>
	);
};

export default DrawingHeaderActions;
