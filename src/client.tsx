import { init } from "@swifty.js/sentry";
import { StartClient } from "@tanstack/react-start/client";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { env } from "./env";

if (env.VITE_SWIFTY_SENTRY_DSN) {
	init({
		dsn: env.VITE_SWIFTY_SENTRY_DSN,
		projectId: "leetcode",
	});
}

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<StartClient />
		</StrictMode>,
	);
});
