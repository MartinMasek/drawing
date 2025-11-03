import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn } from "~/utils/ui-utils";

interface DividerProps extends VariantProps<typeof dividerVariants> {
	className?: string;
	text?: string;
}

const dividerVariants = cva("border border-gray-200", {
	variants: {
		orientation: {
			horizontal: "h-px w-full",
			vertical: "h-full w-px",
		},
	},
	defaultVariants: {
		orientation: "horizontal",
	},
});

export function Divider({
	orientation = "horizontal",
	text,
	className,
}: DividerProps) {
	if (text && orientation === "horizontal") {
		return (
			<div className={cn("flex w-full items-center gap-2", className)}>
				<div className="h-px flex-1 bg-border-neutral" />
				<span className="whitespace-nowrap text-sm text-text-neutral-secondary">
					{text}
				</span>
				<div className="h-px flex-1 bg-border-neutral" />
			</div>
		);
	}

	return <div className={cn(dividerVariants({ orientation }), className)} />;
}
