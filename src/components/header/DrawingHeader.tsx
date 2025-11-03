import type { FC } from "react";

import { Divider } from "~/components/Divider";
import DrawingHeaderActions from "./components/DrawingHeaderActions";
import DrawingHeaderInfo from "./components/DrawingHeaderInfo";
import DrawingTabs from "./components/DrawingTabs";

type Props = { title?: string };

const DrawingHeader: FC<Props> = ({ title }) => {
	return (
		<div className="flex h-[56px] w-full items-center overflow-x-auto border-border-neutral border-b bg-white">
			<DrawingHeaderInfo title={title} />
			<Divider className="h-full border-[0.5px]" orientation="vertical" />
			<DrawingTabs />
			<Divider className="h-full border-[0.5px]" orientation="vertical" />
			<DrawingHeaderActions />
		</div>
	);
};

export default DrawingHeader;
