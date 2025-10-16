import type { FC } from "react";
import { Divider } from "~/components/header/header/Divider";
import PackagesBreakdown from "./PackagesBreakdown";
import WarningBanner from "./WarningBanner";
import { getTotalAreaOfShapes } from "~/utils/ui-utils";
import type { CanvasShape } from "~/types/drawing";

interface EditNoneMaterialProps {
	numberOfShapesWithoutMaterial: number;
	getAllShapesWithMaterial: (materialId?: string) => CanvasShape[];
}

const EditNoneMaterial: FC<EditNoneMaterialProps> = ({
	numberOfShapesWithoutMaterial,
	getAllShapesWithMaterial,
}) => {
	return (
		<div className="flex flex-col gap-4 p-4">
			<p>
				Material: <span className="text-text-colors-secondary">None</span>
			</p>
			<Divider className="border-[0.5px]" />

			<PackagesBreakdown
				numberOfShapes={numberOfShapesWithoutMaterial}
				totalArea={getTotalAreaOfShapes(getAllShapesWithMaterial())}
			/>
			<Divider className="border-[0.5px]" />

			{/* Replace with normal Stonify banner */}
			{numberOfShapesWithoutMaterial > 0 && <WarningBanner />}
		</div>
	);
};

export default EditNoneMaterial;
