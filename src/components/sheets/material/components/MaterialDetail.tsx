import type { FC } from "react";
import { cn } from "~/lib/utils";
import type { MaterialExtended } from "~/types/drawing";

interface MaterialDetailProps {
	material?: MaterialExtended;
}

const MaterialDetail: FC<MaterialDetailProps> = ({ material }) => {
	return (
		<>
			<div
				className={cn(
					"flex h-[170px] w-[305px] flex-col items-center justify-center overflow-hidden rounded-md",
					material?.img ? "" : "border border-dashed",
				)}
			>
				{material?.img ? (
					<img
						src={material.img}
						alt="Material"
						className="h-full w-full object-cover"
					/>
				) : (
					<p className="text-sm text-text-neutral-terciary">No image</p>
				)}
			</div>
			{material && (
				<div className="flex flex-col gap-1">
					<span className="flex w-full items-center justify-between">
						<p className="text-sm text-text-neutral-secondary">SKU:</p>
						<p className="text-sm text-text-neutral-primary">{material.SKU}</p>
					</span>
					<span className="flex w-full items-center justify-between">
						<p className="text-sm text-text-neutral-secondary">Category:</p>
						<p className="text-sm text-text-neutral-primary">
							{material.category}
						</p>
					</span>
					<span className="flex w-full items-center justify-between">
						<p className="text-sm text-text-neutral-secondary">Sub Category:</p>
						<p className="text-sm text-text-neutral-primary">
							{material.subcategory}
						</p>
					</span>
				</div>
			)}
		</>
	);
};

export default MaterialDetail;
