import { createNextApiHandler } from "@trpc/server/adapters/next";
import type { NextApiRequest, NextApiResponse } from "next";

import { env } from "~/env";
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const handler = createNextApiHandler({
	router: appRouter,
	createContext: createTRPCContext,
	onError:
		env.NODE_ENV === "development"
			? ({ path, error }) => {
					console.error(
						`❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`,
					);
				}
			: undefined,
});

export default function apiRoute(
	req: NextApiRequest,
	res: NextApiResponse,
): void | Promise<void> {
	const result = handler(req, res);
	// handler may return void or Promise<void>; coerce unknown to expected union
	return result as unknown as void | Promise<void>;
}
