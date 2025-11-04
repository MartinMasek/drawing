const ShapeIcon = ({ isActive }: { isActive: boolean }) => {
    return (
        // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M2.3999 19.2735L7.1999 19.2735C7.1999 19.2735 7.1999 14.4 11.9999 14.4C16.7999 14.4 16.7999 19.2735 16.7999 19.2735L21.5999 19.2735M2.3999 9.67349L7.1999 9.67349L7.1999 4.80002L16.7999 4.80002L16.7999 9.67349L21.5999 9.67349"
                stroke={isActive ? "#2563EB" : "#6B7280"}
                stroke-width="1.67"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    )
}

export default ShapeIcon;