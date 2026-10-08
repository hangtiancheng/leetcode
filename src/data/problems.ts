/**
 * The single seam between the UI and its data source. `build:static` aliases this
 * module to `problems.static.ts`, which keeps MongoDB out of the static bundle.
 */

export type {
	ProblemDetail,
	ProblemListItem,
	SolutionRecord,
} from "#/server/problems.ts";
export {
	createProblem,
	deleteProblem,
	getProblem,
	listProblems,
	saveSolution,
	updateProblem,
} from "#/server/problems.ts";
