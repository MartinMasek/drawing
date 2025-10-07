import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import { Geist, Inter } from "next/font/google";

import { api } from "~/utils/api";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import "~/styles/globals.css";

// const geist = Geist({
// 	subsets: ["latin"],
// });

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
})

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<>
		{/* This <style> tag is necesarry cause otherwise React Portals don't use our Inter font.
			@see https://github.com/vercel/next.js/issues/43674 */}
		<style global jsx>{`
			:root {
				--font-inter: ${inter.style.fontFamily};
			}
		`}</style>
		<SessionProvider session={session}>
			<NuqsAdapter>
			{/* <div className={geist.className}> */}
			<div >
				<Component {...pageProps} />
			</div>
			</NuqsAdapter>
		</SessionProvider>
		</>
	);
};

export default api.withTRPC(MyApp);
