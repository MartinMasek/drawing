"use client";

import * as Headless from "@headlessui/react";

import { cn } from "../utils/ui-utils";

const Popover = Headless.Popover;

const PopoverButton = Headless.PopoverButton;

const PopoverCloseButton = Headless.CloseButton;
PopoverCloseButton.displayName = "PopoverCloseButton";

/**
 * GOTCHA: If the popover panel breaks the layout if opened, try setting the `anchor`
 * which automatically sets the `portal` prop and renders the panel outside of your layout.
 * @see https://headlessui.com/react/popover
 *
 * anchor='bottom' is set by default
 */
function PopoverPanel({
	className,
	...props
}: { className?: string } & Omit<
	Headless.PopoverPanelProps,
	"as" | "className"
>) {
	return (
		<Headless.PopoverPanel
			anchor="bottom"
			as="div"
			className={cn(
				"z-[100] rounded-xl bg-background-neutral-primary-default p-2 shadow-general-lg outline-none sm:p-2",
				className,
			)}
			modal={false}
			{...props}
		/>
	);
}

export { Popover, PopoverButton, PopoverCloseButton, PopoverPanel };
