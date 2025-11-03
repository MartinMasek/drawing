import { IconAlertCircleFilled } from "@tabler/icons-react";
import { Icon } from "~/components/header/header/Icon";

const WarningBanner = () => {
	return (
		<div className="flex gap-2 rounded-md bg-background-banners-warning-subtle p-3">
			<Icon size="md" color="warning">
				<IconAlertCircleFilled />
			</Icon>
			<div className="flex flex-col gap-1">
				<p className="font-bold text-sm text-text-neutral-primary">
					Unassigned Materials Detected
				</p>
				<p className="text-sm">
					Some shapes are still using this material option. To proceed with
					quote generation, please ensure{" "}
					<span className="font-bold">
						all shapes have an assigned material
					</span>
				</p>
			</div>
		</div>
	);
};

export default WarningBanner;
