import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import { Geist } from "next/font/google";

import { api } from "~/utils/api";
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import "~/styles/globals.css";

const geist = Geist({
	subsets: ["latin"],
});

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	return (
		<SessionProvider session={session}>
			<NuqsAdapter>
			<div className={geist.className}>
				<Component {...pageProps} />
			</div>
			</NuqsAdapter>
		</SessionProvider>
	);
};

export default api.withTRPC(MyApp);
