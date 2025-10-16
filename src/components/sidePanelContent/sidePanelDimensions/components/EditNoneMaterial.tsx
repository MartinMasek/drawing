import type { FC } from "react";
import { Divider } from "~/components/header/header/Divider";
import PackagesBreakdown from "./PackagesBreakdown";
import WarningBanner from "./WarningBanner";

interface EditNoneMaterialProps {
	numberOfShapesWithoutMaterial: number;
}

const EditNoneMaterial: FC<EditNoneMaterialProps> = ({
	numberOfShapesWithoutMaterial,
}) => {
	return (
		<div className="flex flex-col gap-4 p-4">
			<p>
				Material: <span className="text-text-colors-secondary">None</span>
			</p>
			<Divider className="border-[0.5px]" />

			<PackagesBreakdown numberOfShapes={numberOfShapesWithoutMaterial} />
			<Divider className="border-[0.5px]" />

			{/* Replace with normal Stonify banner */}
			{numberOfShapesWithoutMaterial > 0 && <WarningBanner />}
		</div>
	);
};

export default EditNoneMaterial;
