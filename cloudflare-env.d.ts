interface D1Meta {
  changes: number;
}

interface D1Result<T = unknown> {
  results: T[];
  success: boolean;
  meta: D1Meta;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>;
  run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}

interface R2ObjectBody {
  body: ReadableStream;
  httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
}

declare module "cloudflare:workers" {
  export const env: {
    DB: D1Database;
    PRODUCTS: R2Bucket;
    ASSETS: Fetcher;
    WORKBENCH_BOOTSTRAP_EMAIL?: string;
  };
}
