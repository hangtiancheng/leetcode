import { StartClient } from "@tanstack/react-start/client";
import { init } from "@yukino.js/sentry";
import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { env } from "./env";

if (env.VITE_YUKINO_SENTRY_DSN) {
	init({
		dsn: env.VITE_YUKINO_SENTRY_DSN,
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
