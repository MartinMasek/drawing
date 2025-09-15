/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	/**
	 * If you are using `appDir` then you must comment the below `i18n` config out.
	 *
	 * @see https://github.com/vercel/next.js/issues/41980
	 */
	// i18n: {
	// 	locales: ["en"],
	// 	defaultLocale: "en",
	// },
	transpilePackages: ["next-auth"],
	webpack: (cfg) => {
		cfg.resolve = cfg.resolve || {};
		cfg.resolve.alias = {
			...(cfg.resolve.alias || {}),
			"next/server$": "next/server.js",
			"next/headers$": "next/headers.js",
			"next/navigation$": "next/navigation.js",
		};
		return cfg;
	},
};

export default config;
