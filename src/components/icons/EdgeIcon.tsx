const EdgeIcon = ({ isActive }: { isActive: boolean }) => {
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
                d="M14 12L16.0896 9.99999M14 12L16.0896 14M14 12L21 12M11 14L11 15M11 8.99999L11 9.99999M11 5.5L11 5C11 3.89543 10.1046 3 9 3L5 3C3.89543 3 3 3.89543 3 5L3 19C3 20.1046 3.89543 21 5 21L9 21C10.1046 21 11 20.1046 11 19L11 18.5"
                stroke={isActive ? "#2563EB" : "#9CA3AF"}
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    )
}

export default EdgeIcon;