const ClipIcon = ({ isActive }: { isActive: boolean }) => {
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
                d="M7.25 45.5H46.25V26L26.75 6.5H7.25V45.5Z"
                stroke={isActive ? "#2563EB" : "#9CA3AF"}
                stroke-width="2"
                stroke-linejoin="round"
            />
        </svg>
    );
};

export default ClipIcon;