import type { ReactNode } from "react";
import React from "react";
import { cn } from "~/lib/utils";
import type {
	ToggleButtonProps,
	ToggleButtonValidValueType,
} from "./ToggleButton";
import ToggleButton from "./ToggleButton";

interface ButtonGroupProps<T> {
	value: T;
	onChange: (newValue: T) => void;
	children: ReactNode;
	className?: string;
}

type StringOrNumber = string | number;

// Helper function to check if the value is an array
function isMultiSelect(
	value: ToggleButtonValidValueType,
): value is StringOrNumber[] {
	return Array.isArray(value);
}

// Helper function to check if the value is a string or number
function isStringOrNumber(
	value: ToggleButtonValidValueType,
): value is StringOrNumber {
	return typeof value === "string" || typeof value === "number";
}

// Helper function to check if the value is a boolean
function isBoolean(value: ToggleButtonValidValueType): value is boolean {
	return typeof value === "boolean";
}

// Check if the value is valid
function isValidValue(value: unknown): value is ToggleButtonValidValueType {
	return (
		isMultiSelect(value as ToggleButtonValidValueType) ||
		isStringOrNumber(value as ToggleButtonValidValueType) ||
		isBoolean(value as ToggleButtonValidValueType) ||
		value === null
	);
}

/**
 * ButtonGroup - A container for a set of ToggleButton components.
 * Manages the active state of each ToggleButton based on the provided value(s).
 */
const ButtonGroup = <T extends ToggleButtonValidValueType>({
	value,
	onChange,
	children,
	className,
}: ButtonGroupProps<T>) => {
	if (!isValidValue(value)) {
		return <div>Error: Invalid value provided!</div>;
	}

	const handleButtonClick = (clickedValue: ToggleButtonValidValueType) => {
		if (isMultiSelect(value)) {
			const newValue = (value as StringOrNumber[]).includes(
				clickedValue as StringOrNumber,
			)
				? (value as StringOrNumber[]).filter((val) => val !== clickedValue)
				: [...(value as StringOrNumber[]), clickedValue];
			onChange(newValue as T);
		} else if (isStringOrNumber(value) || isBoolean(value)) {
			onChange(clickedValue as T);
		}
	};

	const filteredChildren = React.Children.toArray(children).filter((child) => {
		return (
			React.isValidElement<ToggleButtonProps<ToggleButtonValidValueType>>(
				child,
			) && child.type === ToggleButton
		);
	}) as React.ReactElement<ToggleButtonProps<ToggleButtonValidValueType>>[];

	const enhancedChildren = filteredChildren.map((child, index) => {
		const childProps = child.props;
		const isActive = isMultiSelect(value)
			? (value as StringOrNumber[]).includes(childProps.value as StringOrNumber)
			: value === childProps.value;

		return React.cloneElement(child, {
			isActive,
			onClick: handleButtonClick,
			isStart: index === 0,
			isEnd: index === filteredChildren.length - 1,
		});
	});

	return (
		<div className={cn("flex w-full", className)}>
			{enhancedChildren}
		</div>
	);
};

export default ButtonGroup;

