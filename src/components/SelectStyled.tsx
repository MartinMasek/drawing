import { Label } from "@headlessui/react";
import { IconX } from "@tabler/icons-react";
import clsx from "clsx";
import { CheckIcon } from "lucide-react";
import React from "react";
import type {
	ActionMeta,
	ClearIndicatorProps,
	ControlProps,
	GroupBase,
	OnChangeValue,
	OptionProps,
	Props as ReactSelectProps,
	SelectInstance,
} from "react-select";
import ReactSelect, { components, createFilter } from "react-select";

export interface ReactSelectStyledProps<
	Option = unknown,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
> extends ReactSelectProps<Option, IsMulti, Group> {
	label?: React.ReactNode;
	helperText?: string;
	tooltipContent?: string;
	error?: unknown;
	inputSize?: "sm" | "md";
	id?: string;
	/** For customizing filters - see use case in PurchaseOrderByProductIdSelect */
	filterValue?: string;
	/** When true, shows the required asterisk on the label without enabling native HTML validation */
	requiredAsterisk?: boolean;
	isClearable?: boolean;
	/** When true, uses rounded-md instead of rounded-none */
	rounded?: boolean;
}

/**
 * React Select component with custom styles for our application.
 * Use if you want to have a simple select.
 * This component is only slightly modified from the original ReactSelect component. It automatically closes
 * the menu when the multi select mode is enabled and the last option is selected.
 */

// NOTE: if this looks weird to you (it does to me too), see https://fettblog.eu/typescript-react-generic-forward-refs/
export const SelectStyled = React.forwardRef(ReactSelectStyledInner) as <
	Option = unknown,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
>(
	props: ReactSelectStyledProps<Option, IsMulti, Group> & {
		ref?: React.ForwardedRef<typeof ReactSelect>;
	},
) => ReturnType<typeof ReactSelectStyledInner>;

function ReactSelectStyledInner<
	Option = unknown,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
>(
	{
		label,
		helperText,
		tooltipContent,
		error,
		inputSize = "md",
		rounded = false,
		filterOption,
		classNames: customClassNames,
		...reactSelectProps
	}: ReactSelectStyledProps<Option, IsMulti, Group>,
	ref?: React.ForwardedRef<SelectInstance<Option, IsMulti, Group>>,
) {
	const [menuOpen, setMenuOpen] = React.useState<boolean | undefined>(
		undefined,
	);

	const onOptionChange = (
		selectedOptions: OnChangeValue<Option, IsMulti>,
		actionMeta: ActionMeta<Option>,
	) => {
		reactSelectProps.onChange?.(selectedOptions, actionMeta);

		if (
			reactSelectProps.isMulti &&
			reactSelectProps.options?.length ===
				(selectedOptions as OnChangeValue<Option, true>).length
		) {
			setMenuOpen(false);
		}
	};

	const onMenuOpen = () => {
		if (menuOpen !== undefined) setMenuOpen(undefined);
		if (reactSelectProps.onMenuOpen) reactSelectProps.onMenuOpen();
	};

	const inputId =
		reactSelectProps.inputId ?? reactSelectProps.id ?? reactSelectProps.name;

	// Merge default classNames with custom ones
	const defaultClassNames = {
		control: (state: ControlProps<Option, IsMulti, Group>) =>
			clsx(
				"!cursor-pointer !bg-background-input-default border shadow-none focus:border focus:border-border-input-active focus:outline-none",
				rounded ? "!rounded-md" : "!rounded-none",
				state.isFocused
					? "!shadow-general-focus dark:!shadow-general-focus-dark !border-border-input-focus"
					: "!border-border-input-default",
				state.isDisabled &&
					"!text-text-neutral-disabled !border-border-input-disabled !bg-background-input-disabled",
				error
					? "border-border-input-error"
					: "border-border-input-default hover:border-border-input-hover",
				inputSize !== "sm" && "px-[4px] py-[3px]",
			),
		input: () =>
			clsx("!text-text-neutral-primary", inputSize === "sm" && "text-sm"),
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		singleValue: (state: any) =>
			clsx(
				inputSize === "sm" && "h-[20px] text-sm",
				state.isDisabled
					? "!text-text-input-disabled bg-red"
					: "!text-text-neutral-primary",
			),
		indicatorSeparator: () => "hidden",
		menuList: () =>
			clsx(
				"!bg-background-neutral-primary-default",
				inputSize === "sm" && "text-sm",
			),
		menuPortal: () => "!z-[100]",
		option: () => "!cursor-pointer",
		placeholder: () => clsx(inputSize === "sm" && "text-sm"),
	};

	const mergedClassNames = customClassNames
		? {
				...defaultClassNames,
				...Object.fromEntries(
					Object.entries(customClassNames).map(([key, value]) => [
						key,
						typeof value === "function"
							? (
									state: Parameters<
										NonNullable<
											(typeof defaultClassNames)[keyof typeof defaultClassNames]
										>
									>[0],
								) =>
									clsx(
										defaultClassNames[key as keyof typeof defaultClassNames]?.(
											state,
										),
										value(state),
									)
							: value,
					]),
				),
			}
		: defaultClassNames;

	return (
		<div>
			<ReactSelect
				classNames={mergedClassNames}
				closeMenuOnSelect={!reactSelectProps.isMulti}
				components={{ Option: OptionComponent, ClearIndicator: ClearIndicator }}
				menuIsOpen={menuOpen}
				menuPortalTarget={
					typeof window !== "undefined" ? document.body : undefined
				}
				menuPosition="fixed"
				placeholder="Select"
				ref={ref}
				{...reactSelectProps}
				id={undefined} // ID is omitted since it clashes with `inputId` and then we can't use it in tests
				inputId={inputId}
				onChange={onOptionChange}
				onMenuOpen={onMenuOpen}
				blurInputOnSelect
			/>
		</div>
	);
}

export function OptionComponent<
	Option = unknown,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
>(props: OptionProps<Option, IsMulti, Group>) {
	/*
	 * Behavior: if a consumer provides a custom node via formatOptionLabel (children), render it verbatim.
	 * Otherwise fall back to the plain text label with the legacy neutral-secondary style.
	 * This keeps simple text-only options working while enabling richer layouts where needed.
	 */
	const hasChildren = props.children !== undefined && props.children !== null;
	const content = (
		hasChildren ? props.children : (props.label as React.ReactNode)
	) as React.ReactNode;
	const isElement = React.isValidElement(content);
	return (
		<components.Option
			{...props}
			className={clsx(
				"!flex !items-center !justify-between !bg-background-neutral-primary-default hover:!bg-background-neutral-primary-hover cursor-pointer",
				props.isFocused && "!bg-background-neutral-primary-hover",
			)}
		>
			<div
				className={clsx("flex-1", !isElement && "text-text-neutral-secondary")}
			>
				{content}
			</div>
			{props.isSelected && (
				<div className="text-icons-brand">
					<CheckIcon />
				</div>
			)}
		</components.Option>
	);
}

export function ClearIndicator<
	Option = unknown,
	IsMulti extends boolean = false,
	Group extends GroupBase<Option> = GroupBase<Option>,
>(props: ClearIndicatorProps<Option, IsMulti, Group>) {
	return (
		<span
			className={clsx(
				"modal-content cursor-pointer hover:brightness-75",
				props.isFocused ? "text-icons-default" : "text-icons-disabled",
			)}
			{...props.innerProps}
		>
			<IconX className="h-5 w-5" />
		</span>
	);
}
