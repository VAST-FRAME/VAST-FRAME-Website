import { WorkbenchAuthError } from "./auth";
import { WORKBENCH_MUTATION_HEADER } from "./request";

export class WorkbenchRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function requireWorkbenchMutation(request: Request): void {
  if (request.headers.get(WORKBENCH_MUTATION_HEADER) !== "1") {
    throw new WorkbenchRequestError("Workbench mutation header required.", 403);
  }

  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    throw new WorkbenchRequestError("Cross-origin Workbench mutations are not allowed.", 403);
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new WorkbenchRequestError("Cross-origin Workbench mutations are not allowed.", 403);
  }
}

export function workbenchFailure(error: unknown): Response {
  if (error instanceof WorkbenchAuthError || error instanceof WorkbenchRequestError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Unexpected Workbench error", error);
  return Response.json({ error: "The Workbench could not complete that request." }, { status: 500 });
}
