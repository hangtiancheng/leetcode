/**
 * The single seam between the UI and its data source. `build:static` aliases this
 * module to `problems.static.ts`, which keeps Prisma out of the static bundle.
 */

export type {
	ProblemDetail,
	ProblemListItem,
	SolutionWithMeta,
} from "#/server/problems.ts";
export {
	createProblem,
	deleteProblem,
	getProblem,
	listProblems,
	rollbackSolution,
	saveSolution,
	updateProblem,
} from "#/server/problems.ts";
