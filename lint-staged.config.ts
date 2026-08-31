import { defineConfig } from "lint-staged/config";

export default defineConfig({
	"*": ["pnpm db:export", "pnpm format --write --no-errors-on-unmatched"],
});
