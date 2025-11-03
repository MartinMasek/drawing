const PackageIcon = ({ isActive }: { isActive: boolean }) => {
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
                d="M21 12.5V7.99099C20.9994 7.64206 20.9066 7.29949 20.731 6.99797C20.5554 6.69645 20.3032 6.44669 20 6.27399L16.5 4.26999M12 21.9995C11.6492 21.9995 11.3046 21.908 11 21.734L4 17.726C3.381 17.372 3 16.718 3 16.009V7.99099C3 7.28299 3.381 6.62799 4 6.27299L11 2.26599C11.3046 2.092 11.6492 2.00049 12 2.00049C12.3508 2.00049 12.6954 2.092 13 2.26599L16.5 4.26999M12 21.9995C12.3508 21.9995 12.6954 21.908 13 21.734M12 21.9995V12M12 12L20.73 6.95996M12 12L7.63501 9.47998M3.27002 6.95996L7.63501 9.47998M16 19H22M19 16V22M7.63501 9.47998L16.5 4.26999"
                stroke={isActive ? "#2563EB" : "#9CA3AF"}
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
        </svg>
    )
}

export default PackageIcon;