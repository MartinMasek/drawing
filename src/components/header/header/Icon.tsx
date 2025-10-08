import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type React from "react";

const iconVariants = cva("", {
	variants: {
		size: {
			xxs: "[&>svg]:h-[10px] [&>svg]:w-[12px] [&>svg]:stroke-[1px]",
			xs: "[&>svg]:h-[14px] [&>svg]:w-[14px] [&>svg]:stroke-[1.17px]",
			sm: "[&>svg]:h-[15px] [&>svg]:w-[15px] [&>svg]:stroke-[1.33px]",
			md: "[&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-[1.67px]",
			lg: "[&>svg]:h-6 [&>svg]:w-6 [&>svg]:stroke-2",
			xl: "[&>svg]:h-7 [&>svg]:w-7 [&>svg]:stroke-[2.33px]",
			xxl: "[&>svg]:h-10 [&>svg]:w-10 [&>svg]:stroke-[2.33px]",
		},
		color: {
			default: "text-gray-500 dark:text-gray-300",
			bold: "text-gray-900 dark:text-white",
			subtle: "text-gray-400 dark:text-gray-500",
			brand: "text-primary-500 dark:text-primary-400",
			danger: "text-error-500 dark:text-error-400",
			success: "text-success-500 dark:text-success-400",
			warning: "text-warning-500 dark:text-warning-400",
			accent: "text-cyan-400 dark:text-cyan-500",
			informational: "text-brand-500 dark:text-brand-400",
			dark: "text-gray-900",
			light: "text-white",
			blueBold: "text-dataVisualisation-blue-bold",
			greenBold: "text-dataVisualisation-green-bold",
			// if not necessary don't add new colors here but just use className='text-xxxcolor'
		},
	},
});

export interface IconProps
	extends VariantProps<typeof iconVariants>,
		React.PropsWithChildren {
	className?: string;
}

export function Icon({ size, color, className, children }: IconProps) {
	return (
		<span className={iconVariants({ className, size, color })}>{children}</span>
	);
}
