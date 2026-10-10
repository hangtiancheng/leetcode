import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		SERVER_URL: z.string().url().optional(),
		MONGODB_URI: z.string().min(1).optional(),
		MONGODB_DB: z.string().min(1).optional(),
	},

	clientPrefix: "VITE_",

	client: {
		VITE_APP_TITLE: z.string().min(1).optional(),
		VITE_YUKINO_SENTRY_DSN: z.string().min(1).optional(),
	},

	runtimeEnv: import.meta.env,

	emptyStringAsUndefined: true,
});
