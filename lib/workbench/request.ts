export const WORKBENCH_MUTATION_HEADER = "x-vastframe-workbench";

export const workbenchMutationHeaders = {
  "content-type": "application/json",
  [WORKBENCH_MUTATION_HEADER]: "1",
} as const;
