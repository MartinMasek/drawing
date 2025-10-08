import {
	Popover,
	PopoverButton,
	PopoverCloseButton,
	PopoverPanel,
} from "../Popover";
import { EDGE_COLOR_OPTIONS } from "./constants";
import type { ContextMenuState, InteractionMode } from "./types";

type Props = {
	menu: ContextMenuState;
	mode: InteractionMode;
	popoverButtonRef: React.RefObject<HTMLButtonElement | null>;
	onClose: () => void;
	onSetEdgeColor: (
		rectId: string,
		edge: "left" | "right" | "top" | "bottom",
		color: string,
	) => void;
	onSetCornerColor: (
		rectId: string,
		corner: "top-left" | "top-right" | "bottom-left" | "bottom-right",
		color: string,
	) => void;
	onAction: (action: string) => void;
};

export default function ContextMenu({
	menu,
	mode,
	popoverButtonRef,
	onClose,
	onSetEdgeColor,
	onSetCornerColor,
	onAction,
}: Props) {
	if (!menu.isOpen) return null;
	return (
		<div
			style={{
				position: "fixed",
				left: menu.clientX,
				top: menu.clientY,
				zIndex: 1000,
			}}
		>
			<Popover>
				<PopoverButton ref={popoverButtonRef} className="sr-only" type="button">
					open
				</PopoverButton>
				<PopoverPanel className="min-w-[180px] rounded-md border border-gray-200 bg-white p-1 shadow-lg">
					<div className="px-3 py-1 text-gray-500 text-xs">
						{menu.target?.kind === "edge" && (
							<>
								Rect: {menu.rectId} • Edge: {menu.target.edge}
							</>
						)}
						{menu.target?.kind === "corner" && (
							<>
								Rect: {menu.rectId} • Corner: {menu.target.corner}
							</>
						)}
						{mode === "sink" && menu.target?.kind === "rect" && (
							<>Rect: {menu.rectId} • Inside</>
						)}
					</div>
					{mode !== "sink" && menu.target?.kind === "edge" && (
						<div className="mb-1 px-3 py-1 text-gray-500 text-xs">
							Edge color
						</div>
					)}
					{mode !== "sink" && menu.target?.kind === "edge" && (
						<div className="mb-1 grid grid-cols-6 gap-1 px-2">
							{EDGE_COLOR_OPTIONS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => {
										if (
											!menu.rectId ||
											!menu.target ||
											menu.target.kind !== "edge"
										)
											return;
										onSetEdgeColor(menu.rectId, menu.target.edge, c);
									}}
									className="h-6 w-6 rounded border border-gray-200"
									style={{ backgroundColor: c }}
								/>
							))}
						</div>
					)}
					{mode !== "sink" && menu.target?.kind === "corner" && (
						<div className="mb-1 px-3 py-1 text-gray-500 text-xs">
							Corner color
						</div>
					)}
					{mode !== "sink" && menu.target?.kind === "corner" && (
						<div className="mb-1 grid grid-cols-6 gap-1 px-2">
							{EDGE_COLOR_OPTIONS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => {
										if (
											!menu.rectId ||
											!menu.target ||
											menu.target.kind !== "corner"
										)
											return;
										onSetCornerColor(menu.rectId, menu.target.corner, c);
									}}
									className="h-6 w-6 rounded border border-gray-200"
									style={{ backgroundColor: c }}
								/>
							))}
						</div>
					)}
					{mode !== "sink" && (
						<>
							<button
								className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								type="button"
								onClick={() => onAction("Option A")}
							>
								Option A
							</button>
							<button
								className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
								type="button"
								onClick={() => onAction("Option B")}
							>
								Option B
							</button>
							{mode.startsWith("corner") && menu.target?.kind === "corner" && (
								<button
									className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									type="button"
									onClick={() => onAction("Clip Corner")}
								>
									Clip this corner
								</button>
							)}
							{mode.startsWith("corner") && menu.target?.kind === "corner" && (
								<button
									className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
									type="button"
									onClick={() => onAction("Round Corner")}
								>
									Round this corner
								</button>
							)}
						</>
					)}
					{mode === "sink" && menu.target?.kind === "rect" && (
						<button
							className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
							type="button"
							onClick={() => onAction("Add Sink")}
						>
							Add Sink
						</button>
					)}
					<div className="flex justify-end">
						<PopoverCloseButton
							className="rounded-md px-2 py-1 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
							onClick={onClose}
						>
							Close
						</PopoverCloseButton>
					</div>
				</PopoverPanel>
			</Popover>
		</div>
	);
}
