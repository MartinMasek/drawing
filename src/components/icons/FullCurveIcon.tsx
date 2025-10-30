const FullCurveIcon = ({ isActive }: { isActive: boolean }) => {
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
                d="M6.75 41.1663H45.75V19.4997C45.75 19.4997 40.3333 10.833 26.25 10.833C12.1667 10.833 6.75 19.4997 6.75 19.4997V41.1663Z"
                stroke={isActive ? "#2563EB" : "#9CA3AF"}
                stroke-width="2"
                stroke-linejoin="round"
            />
        </svg>
    );
};

export default FullCurveIcon;