import { useState, useEffect, useRef, type FC, useLayoutEffect } from "react";
import type { CanvasText, CanvasTextData } from "~/types/drawing";
import TextInputToolbar from "./TextInputToolbar";
import { useDrawing } from "~/context/DrawingContext";
import { CursorTypes } from "~/types/drawing";

interface CanvasTextInputProps {
	position: { x: number; y: number };
	initialText: CanvasText | null;
	onSave: (text: CanvasTextData) => void;
	onDelete: () => void;
	onEscape: () => void;
}

const CanvasTextInput: FC<CanvasTextInputProps> = ({
	position,
	onSave,
	initialText,
	onDelete,
	onEscape,
}) => {
	const [inputValue, setInputValue] = useState(initialText?.text ?? "");
	const [fontSize, setFontSize] = useState(initialText?.fontSize ?? 24);
	const [isBold, setIsBold] = useState(initialText?.isBold ?? false);
	const [isItalic, setIsItalic] = useState(initialText?.isItalic ?? false);
	const [textColor, setTextColor] = useState(
		initialText?.textColor ?? "#000000",
	);
	const [backgroundColor, setBackgroundColor] = useState(
		initialText?.backgroundColor ?? "#ffffff",
	);
	const [inputWidth, setInputWidth] = useState(20);
	const [inputHeight, setInputHeight] = useState(24);
	const [manualResize, setManualResize] = useState(false); // track manual resize

	const { cursorType } = useDrawing();
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const spanRef = useRef<HTMLSpanElement>(null);

	// Autofocus on mount
	useLayoutEffect(() => {
		setTimeout(() => inputRef.current?.focus(), 0);
	}, []);

	// Auto-expand input width based on text
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!manualResize && spanRef.current) {
			setInputWidth(spanRef.current.offsetWidth + 20);
			setInputHeight(spanRef.current.offsetHeight + 2);
		}
	}, [inputValue, fontSize, isBold, isItalic]);


	// If we change the cursor type, escape the text input
	useEffect(() => {
		if (cursorType !== CursorTypes.Text) {
			onEscape();
		}
	}, [cursorType, onEscape]);

	const handleSaveText = () => {
		if (!inputValue.trim()) return;

		onSave({
			text: inputValue.trim(),
			fontSize,
			isBold,
			isItalic,
			textColor,
			backgroundColor,
			xPos: position.x,
			yPos: position.y,
		});

		setInputValue("");
	};

	const handleClearFormatting = () => {
		setFontSize(24);
		setIsBold(false);
		setIsItalic(false);
		setTextColor("#000000");
		setBackgroundColor("#ffffff");
		setManualResize(false);
		if (spanRef.current) {
			setInputWidth(spanRef.current.offsetWidth + 20);
			setInputHeight(spanRef.current.offsetHeight + 2);
		}
	};

	const handleResize = (
		e: React.MouseEvent<HTMLDivElement, MouseEvent>,
		corner: "SE" | "NE" | "SW" | "NW",
	) => {
		e.stopPropagation();
		setManualResize(true);

		const startX = e.clientX;
		const startY = e.clientY;
		const startWidth = inputWidth;
		const startHeight = inputHeight;
		const startPosX = position.x;
		const startPosY = position.y;

		const onMove = (moveEvent: MouseEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			let newWidth = startWidth;
			let newHeight = startHeight;
			let newPosX = startPosX;
			let newPosY = startPosY;

			switch (corner) {
				case "SE":
					newWidth = Math.max(20, startWidth + deltaX);
					newHeight = Math.max(20, startHeight + deltaY);
					break;
				case "NE":
					newWidth = Math.max(20, startWidth + deltaX);
					newHeight = Math.max(20, startHeight - deltaY);
					newPosY = startPosY + deltaY / 2;
					break;
				case "SW":
					newWidth = Math.max(20, startWidth - deltaX);
					newHeight = Math.max(20, startHeight + deltaY);
					newPosX = startPosX + deltaX / 2;
					break;
				case "NW":
					newWidth = Math.max(20, startWidth - deltaX);
					newHeight = Math.max(20, startHeight - deltaY);
					newPosX = startPosX + deltaX / 2;
					newPosY = startPosY + deltaY / 2;
					break;
			}

			setInputWidth(newWidth);
			setInputHeight(newHeight);
		};

		const onUp = () => {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
			inputRef.current?.focus();
		};

		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
	};

	return (
		<>
			<TextInputToolbar
				position={{ x: position.x, y: position.y - inputHeight / 2 - 80 }}
				fontSize={fontSize}
				isBold={isBold}
				isItalic={isItalic}
				onFontSizeChange={setFontSize}
				onToggleBold={() => setIsBold((b) => !b)}
				onToggleItalic={() => setIsItalic((i) => !i)}
				onClearFormatting={handleClearFormatting}
				onDelete={onDelete}
			/>

			{/* Text Input */}
			<textarea
				ref={inputRef}
				value={inputValue}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault(); // Prevent newline
						handleSaveText();
					}
					if (e.key === "Escape") {
						onEscape();
					}
				}}
				className="absolute z-[9] resize-none border border-icons-brand px-1 outline-none"
				style={{
					top: position.y,
					left: position.x,
					transform: "translate(-50%, -50%)",
					fontSize: `${fontSize}px`,
					fontWeight: isBold ? "bold" : "normal",
					fontStyle: isItalic ? "italic" : "normal",
					color: textColor,
					backgroundColor,
					width: inputWidth,
					height: inputHeight,
				}}
			/>
			{/* Hidden span for width measurement */}
			<span
				ref={spanRef}
				className="invisible absolute whitespace-pre"
				style={{
					fontSize: `${fontSize}px`,
					fontWeight: isBold ? "bold" : "normal",
					fontStyle: isItalic ? "italic" : "normal",
				}}
			>
				{inputValue || " "}
			</span>

			{/* Bottom-right resize handle */}
			<div
				className="absolute z-10 h-[10px] w-[10px] cursor-se-resize rounded-full border border-icons-brand bg-dataVisualisation-azureBlue-softest"
				style={{
					top: position.y + inputHeight / 2 - 5,
					left: position.x + inputWidth / 2 - 5,
				}}
				onMouseDown={(e) => handleResize(e, "SE")}
			/>
			{/* Top-right resize handle */}
			<div
				className="absolute z-10 h-[10px] w-[10px] cursor-ne-resize rounded-full border border-icons-brand bg-dataVisualisation-azureBlue-softest"
				style={{
					top: position.y - inputHeight / 2 - 5,
					left: position.x + inputWidth / 2 - 5,
				}}
				onMouseDown={(e) => handleResize(e, "NE")}
			/>

			{/* Top-left resize handle */}
			<div
				className="absolute z-10 h-[10px] w-[10px] cursor-nw-resize rounded-full border border-icons-brand bg-dataVisualisation-azureBlue-softest"
				style={{
					top: position.y - inputHeight / 2 - 5,
					left: position.x - inputWidth / 2 - 5,
				}}
				onMouseDown={(e) => handleResize(e, "NW")}
			/>
			{/* Bottom-left resize handle */}
			<div
				className="absolute z-10 h-[10px] w-[10px] cursor-sw-resize rounded-full border border-icons-brand bg-dataVisualisation-azureBlue-softest"
				style={{
					top: position.y + inputHeight / 2 - 5,
					left: position.x - inputWidth / 2 - 5,
				}}
				onMouseDown={(e) => handleResize(e, "SW")}
			/>
		</>
	);
};

export default CanvasTextInput;
