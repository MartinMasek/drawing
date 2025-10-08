import { IconArrowLeft } from "@tabler/icons-react";
import type { FC } from "react";

import { useRouter } from "next/navigation";
import { useDrawing } from "../context/DrawingContext";
import Button from "./Button";
import { Divider } from "./Divider";
import { Icon } from "./Icon";

interface Props {
	title?: string;
}

const DrawingHeaderInfo: FC<Props> = ({ title }) => {
	const { totalArea } = useDrawing();
	const router = useRouter();

	const handleClick = () => {
		router.push("/"); // redirects to the homepage
	};

	return (
		<div className="flex min-w-[320px] flex-1 items-center gap-2 pr-4 pl-2">
			<Button
				color="neutral"
				iconOnly
				size="sm"
				variant="text"
				onClick={handleClick}
			>
				<Icon size="md">
					<IconArrowLeft />
				</Icon>
			</Button>
			<div className="flex flex-col gap-0.5">
				<p className="text-sm">{title ?? "Design"}</p>
				<span className="flex items-center gap-2 text-text-neutral-terciary text-xs">
					<p>
						Total area: <b>{totalArea} SF</b>
					</p>
					<Divider className="h-3" orientation="vertical" />
					<p>
						Packages: <b>1</b>
					</p>
				</span>
			</div>
		</div>
	);
};

export default DrawingHeaderInfo;
