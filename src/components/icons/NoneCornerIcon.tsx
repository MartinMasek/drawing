const NoneCornerIcon = ({ isActive }: { isActive: boolean }) => {
    return (
        // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
        <svg
            width="53"
            height="52"
            viewBox="0 0 53 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M6.75 6.5H45.75V45.5H6.75V6.5Z"
                stroke={isActive ? "#2563EB" : "#9CA3AF"}
                stroke-width="2"
                stroke-linejoin="round"
            />
        </svg>
    );
};

export default NoneCornerIcon;