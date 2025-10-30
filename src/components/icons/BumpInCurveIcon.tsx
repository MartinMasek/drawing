const BumpInCurveIcon = ({ isActive }: { isActive: boolean }) => {
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
                d="M7.25 41.1667H46.25V19.5H37.5833C37.5833 19.5 35.4167 28.1667 26.75 28.1667C18.0833 28.1667 16.5614 19.5 16.5614 19.5H7.25V41.1667Z"
                stroke={isActive ? "#2563EB" : "#9CA3AF"}
                stroke-width="2"
                stroke-linejoin="round"
            />
        </svg>
    );
};

export default BumpInCurveIcon;