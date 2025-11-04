import { cva } from "class-variance-authority";
import React from "react";

import { cn } from "~/utils/ui-utils";
import { Icon, type IconProps } from "./Icon";

export type ButtonColors = "primary" | "neutral" | "danger" | "primary-inverse";
type OutlinedButtonColors = ButtonColors | "always-black" | "always-white";

interface ButtonCommonProps extends React.ComponentPropsWithoutRef<"button"> {
	/* Size of the button (micro, small, medium, large) */
	size?: "xs" | "sm" | "md" | "lg";

	/* HTML type attribute (button, submit) */
	type?: "button" | "submit";

	/* Whether the button is icon-only */
	iconOnly?: boolean;

	/* Optional icon to display on the left */
	iconLeft?: React.ReactNode;

	/* Optional icon to display on the right */
	iconRight?: React.ReactNode;

	/* Whether the button is disabled */
	disabled?: boolean;

	/* Additional CSS classes */
	className?: string;

	/* Reason the button is disabled, if applicable */
	disableReason?: string;

	/* Event handler for the onClick event */
	onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;

	/* Whether the button is in a loading state */
	loading?: boolean;

	/* Variant options for the button */
	variant?: "contained" | "outlined" | "text" | "link";

	/* Color options for the button */
	color?: ButtonColors | OutlinedButtonColors;
}

export interface ButtonProps extends ButtonCommonProps {
	/* Variant options for the button */
	variant?: "contained" | "outlined" | "text" | "link";

	/* Color options for the button */
	color?: ButtonColors | OutlinedButtonColors;
}

const buttonVariants = cva(
	"inline-flex items-center gap-2 rounded-lg font-semibold transition-all md:whitespace-nowrap",
	{
		variants: {
			size: {
				xs: "px-2 py-1 font-medium text-xs",
				sm: "px-3 py-2 text-sm",
				md: "px-4 py-[10px] text-sm",
				lg: "px-5 py-3 text-md",
			},
			color: {
				primary: "",
				"primary-inverse": "",
				danger: "",
				neutral: "",
				"always-black": "",
				"always-white": "",
			},
			iconOnly: {
				true: "p-2",
				false: "",
			},
			// Variants need to be after iconOnly so we can override
			// the padding for the link variants
			variant: {
				contained: "shadow-sm",
				outlined: "shadow-sm",
				text: "",
				link: "p-0",
			},
			loading: {
				true: "cursor-wait",
				false: "",
			},
			disabled: {
				true: "cursor-not-allowed",
				false: "",
			},
		},
		compoundVariants: [
			{ size: "xs", iconOnly: true, className: "max-h-[26px] p-[2px]" },
			{ size: "sm", iconOnly: true, className: "p-2" },
			{ size: "md", iconOnly: true, className: "p-[10px]" },
			{ size: "lg", iconOnly: true, className: "p-[14px]" },
			// Overriding the padding for the link variant because CVA library doesn't support NOT operator for
			// the variants above (to add `NOT link`)
			{ iconOnly: true, variant: "link", className: "p-0" },
			{
				variant: "contained",
				color: "primary",
				className:
					"bg-background-button-primary-brand-default text-text-button-primary hover:bg-background-button-primary-brand-hover disabled:bg-background-button-primary-brand-disabled",
			},
			{
				variant: "outlined",
				color: "primary",
				className:
					"border border-border-button-brand-default bg-background-button-secondary-brand-default text-text-button-secondary-brand hover:bg-background-button-secondary-brand-hover hover:text-text-button-secondary-hover disabled:border-border-button-brand-disabled disabled:bg-background-button-secondary-brand-disabled disabled:text-text-button-secondary-disabledOnWhiteBg",
			},
			{
				variant: "text",
				color: "primary",
				className:
					"text-text-button-secondary-brand hover:bg-background-button-secondary-brand-hover hover:text-text-button-secondary-hover disabled:bg-background-button-secondary-brand-disabled disabled:bg-transparent disabled:text-text-button-secondary-disabledOnWhiteBg dark:disabled:text-text-button-secondary-disabledOnColorBg",
			},
			{
				variant: "link",
				color: "primary",
				className:
					"text-text-button-secondary-brand hover:text-text-button-secondary-hover disabled:text-text-button-secondary-disabledOnWhiteBg dark:disabled:text-text-button-secondary-disabledOnColorBg",
			},
			{
				variant: "contained",
				color: "danger",
				className:
					"bg-background-button-primary-danger-default text-text-button-primary hover:bg-background-button-primary-danger-hover disabled:bg-background-button-primary-danger-disabled",
			},
			{
				variant: "outlined",
				color: "danger",
				className:
					"border border-border-button-danger-default bg-transparent text-text-button-danger-default hover:bg-background-button-secondary-dangerOutlined-hover/20 hover:text-text-button-danger-hover disabled:border-border-button-danger-disabled disabled:bg-transparent disabled:text-text-button-danger-disabledOnWhiteBg dark:disabled:text-text-button-danger-disabledOnColorBg",
			},
			{
				variant: "text",
				color: "danger",
				className:
					"text-text-button-danger-default hover:bg-background-button-terciary-danger-hover hover:text-text-button-danger-hover disabled:bg-background-button-danger-disabled disabled:bg-transparent disabled:text-text-button-danger-disabledOnWhiteBg dark:disabled:text-text-button-danger-disabledOnColorBg dark:hover:bg-background-button-terciary-danger-hover/16",
			},
			{
				variant: "link",
				color: "danger",
				className:
					"text-text-button-danger-default hover:text-text-button-danger-hover hover:text-text-danger-hover disabled:text-text-button-danger-disabledOnWhiteBg dark:disabled:text-text-button-danger-disabledOnColorBg",
			},
			{
				variant: "contained",
				color: "neutral",
				className:
					"border border-border-button-gray-default border-solid bg-background-button-secondary-grayOutlined-default text-text-button-gray-default hover:border-border-button-gray-hover hover:bg-background-button-secondary-grayOutlined-hover hover:text-text-button-gray-hover disabled:bg-background-button-secondary-grayOutlined-disabled disabled:text-text-button-gray-disabled",
			},
			{
				variant: "outlined",
				color: "neutral",
				className:
					"border border-border-button-gray-default border-solid bg-background-button-secondary-grayOutlined-default text-text-button-gray-default hover:border-border-button-gray-hover hover:bg-background-button-secondary-grayOutlined-hover hover:text-text-button-gray-hover disabled:bg-background-button-secondary-grayOutlined-disabled disabled:text-text-button-gray-disabled",
			},
			{
				variant: "text",
				color: "neutral",
				className:
					"text-text-button-gray-default hover:bg-background-button-secondary-grayOutlined-hover hover:text-text-button-gray-hover disabled:text-text-button-gray-disabled",
			},
			{
				variant: "link",
				color: "neutral",
				className:
					"text-text-button-gray-default hover:text-text-button-gray-hover disabled:bg-background-button-secondary-grayOutlined-disabled disabled:text-text-buttongray-disabled",
			},
			{
				variant: "outlined",
				color: "always-black",
				className:
					"border border-black text-black hover:bg-black/20 hover:text-black",
			},
			{
				variant: "link",
				color: "always-black",
				className: "text-black hover:text-gray-700",
			},
			{
				variant: "outlined",
				color: "always-white",
				className:
					"border border-white text-white hover:bg-white/20 hover:text-white",
			},
			{
				variant: "link",
				color: "always-white",
				className: "text-white hover:text-gray-200",
			},
		],
		defaultVariants: {
			size: "md",
			variant: "contained",
			color: "primary",
			iconOnly: false,
			loading: false,
			disabled: false,
		},
	},
);

const Button = React.forwardRef<
	HTMLButtonElement,
	React.PropsWithChildren<ButtonProps>
>(
	(
		{
			size = "md",
			variant = "contained",
			color = "primary",
			type = "button",
			iconOnly,
			iconLeft,
			iconRight,
			disabled = false,
			children,
			className = "",
			disableReason,
			onBlur,
			onClick,
			loading = false,
			...buttonProps
		},
		ref,
	) => {
		const iconSize: IconProps["size"] = size === "xs" ? "xs" : "md";

		return (
			<button
				{...buttonProps}
				className={cn(
					"cursor-pointer",
					buttonVariants({ size, variant, color, iconOnly, loading, disabled }),
					className,
				)}
				disabled={disabled || loading}
				onClick={(e) => {
					if (!(disabled || loading)) {
						onClick?.(e);
					}
				}}
				ref={ref}
				type={type}
			>
				{loading ? (
					<Icon size={iconSize}>Loading...</Icon>
				) : iconLeft ? (
					<Icon size={iconSize}>{iconLeft}</Icon>
				) : null}
				{children}
				{!!iconRight && <Icon size={iconSize}>{iconRight}</Icon>}
			</button>
		);
	},
);

Button.displayName = "Button";

export default Button;
