// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }

import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import baseConfig from "./src/tailwind/base";

export default {
	// We need to append the path to the UI package to the content array so that
	// those classes are included correctly.
	content: [...baseConfig.content],
	presets: [baseConfig],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-inter)", ...fontFamily.sans],
				mono: ["var(--font-roboto-mono)", ...fontFamily.mono],
			},
		},
	},
} satisfies Config;
