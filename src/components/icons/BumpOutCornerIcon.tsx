const BumpOutCornerIcon = ({ isActive }: { isActive: boolean }) => {
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
                d="M6.51465 14.7604H26.6056L35.4692 6.59766L45.5146 16.8767L36.651 25.0395V45.5977H6.51465V14.7604Z"
                stroke={isActive ? "#2563EB" : "#9CA3AF"}
                stroke-width="2"
                stroke-linejoin="round"
            />
        </svg>
    );
};

export default BumpOutCornerIcon;