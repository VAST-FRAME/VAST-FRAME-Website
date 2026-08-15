/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  SITE_ACCESS_PASSWORD?: string;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

const ACCESS_COOKIE = "__Host-vastframe_access";
const ACCESS_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7;
const ACCESS_MESSAGE = "vastframe-site-access:v1";

function isPublicAsset(pathname: string): boolean {
  return pathname.startsWith("/_next/") || pathname.startsWith("/assets/");
}

function safeReturnTo(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.length > 2048) {
    return "/";
  }
  if (value.startsWith("/__access")) return "/";
  return value;
}

function readCookie(request: Request, name: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return null;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

async function accessToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(ACCESS_MESSAGE));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function matchesSecret(candidate: string, expected: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const [candidateHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(candidate)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  const candidateBytes = new Uint8Array(candidateHash);
  const expectedBytes = new Uint8Array(expectedHash);
  let difference = candidateBytes.length ^ expectedBytes.length;
  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= (candidateBytes[index] ?? 0) ^ expectedBytes[index];
  }
  return difference === 0;
}

function escapeAttribute(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function accessPage(returnTo: string, invalid = false): Response {
  const error = invalid
    ? '<p class="error" role="alert">That password did not match. Try again.</p>'
    : "";
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <title>Private preview — VASTFRAME</title>
  <style>
    :root { color-scheme: dark; font-family: Arial, Helvetica, sans-serif; background: #0d0d10; color: #ededf1; }
    * { box-sizing: border-box; }
    body { min-height: 100svh; margin: 0; display: grid; grid-template-columns: minmax(5rem, 0.32fr) minmax(0, 1fr); background: #0d0d10; }
    .brand { display: flex; align-items: flex-start; justify-content: center; padding: 2rem 1rem; border-right: 1px solid #303038; color: #ff3fa6; font: 900 clamp(2.5rem, 6vw, 6rem)/0.8 Arial, sans-serif; letter-spacing: -0.09em; writing-mode: vertical-rl; transform: rotate(180deg); }
    main { display: grid; place-items: center; padding: clamp(1.5rem, 5vw, 5rem); }
    section { width: min(100%, 38rem); }
    .kicker { margin: 0 0 2rem; color: #9999a2; font: 0.68rem/1.4 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 0.12em; text-transform: uppercase; }
    h1 { max-width: 8ch; margin: 0 0 1.5rem; font: 400 clamp(4rem, 11vw, 8.5rem)/0.78 Georgia, serif; letter-spacing: -0.075em; }
    .intro { max-width: 33rem; margin: 0 0 2.5rem; color: #9999a2; font-size: 0.92rem; line-height: 1.65; }
    form { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.65rem; }
    label { grid-column: 1 / -1; color: #9999a2; font: 0.62rem/1 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 0.08em; text-transform: uppercase; }
    input { min-width: 0; min-height: 3.25rem; padding: 0 1rem; border: 1px solid #4a4a54; border-radius: 0; background: #15151a; color: #fff; font: inherit; }
    input:focus { outline: 2px solid #ff3fa6; outline-offset: 2px; }
    button { min-height: 3.25rem; padding: 0 1.25rem; border: 1px solid #ff3fa6; background: #ff3fa6; color: #0d0d10; font: 800 0.65rem/1 ui-monospace, SFMono-Regular, Consolas, monospace; letter-spacing: 0.07em; text-transform: uppercase; cursor: pointer; }
    .error { margin: 1rem 0 0; color: #ff9bcf; font-size: 0.8rem; }
    .note { margin: 2rem 0 0; color: #6f6f78; font: 0.6rem/1.5 ui-monospace, SFMono-Regular, Consolas, monospace; text-transform: uppercase; }
    @media (max-width: 620px) {
      body { grid-template-columns: 1fr; }
      .brand { min-height: 6rem; align-items: center; justify-content: flex-start; border-right: 0; border-bottom: 1px solid #303038; writing-mode: initial; transform: none; font-size: 2.7rem; }
      main { place-items: start; align-content: center; }
      h1 { font-size: clamp(4rem, 20vw, 6rem); }
      form { grid-template-columns: 1fr; }
      label { grid-column: auto; }
    }
  </style>
</head>
<body>
  <div class="brand" aria-label="VASTFRAME">VASTFRAME</div>
  <main>
    <section>
      <p class="kicker">Private studio preview / Authorized guests</p>
      <h1>Step inside.</h1>
      <p class="intro">VASTFRAME is still behind the workshop doors. Enter the shared preview password to view the studio site.</p>
      <form method="post" action="/__access/unlock">
        <label for="password">Preview password</label>
        <input id="password" name="password" type="password" required autofocus autocomplete="current-password">
        <input name="return_to" type="hidden" value="${escapeAttribute(returnTo)}">
        <button type="submit">Enter site</button>
      </form>
      ${error}
      <p class="note">Access stays unlocked on this device for seven days.</p>
    </section>
  </main>
</body>
</html>`;

  return new Response(html, {
    status: invalid ? 401 : 200,
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
      "content-type": "text/html; charset=utf-8",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

async function enforceSiteAccess(request: Request, env: Env): Promise<Response | null> {
  const password = env.SITE_ACCESS_PASSWORD?.trim();
  if (!password) return null;

  const url = new URL(request.url);
  if (isPublicAsset(url.pathname)) return null;

  if (url.pathname === "/__access" && request.method === "GET") {
    return accessPage(safeReturnTo(url.searchParams.get("return_to")));
  }

  if (url.pathname === "/__access/unlock" && request.method === "POST") {
    const origin = request.headers.get("origin");
    if (origin && origin !== url.origin) return new Response("Forbidden", { status: 403 });

    const body = await request.text();
    if (body.length > 4096) return new Response("Request too large", { status: 413 });
    const form = new URLSearchParams(body);
    const returnTo = safeReturnTo(form.get("return_to"));
    if (!(await matchesSecret(form.get("password") ?? "", password))) {
      return accessPage(returnTo, true);
    }

    const token = await accessToken(password);
    return new Response(null, {
      status: 303,
      headers: {
        location: new URL(returnTo, url.origin).toString(),
        "set-cookie": `${ACCESS_COOKIE}=${token}; Path=/; Max-Age=${ACCESS_COOKIE_TTL_SECONDS}; HttpOnly; Secure; SameSite=Lax`,
        "cache-control": "private, no-store, max-age=0",
      },
    });
  }

  const expectedToken = await accessToken(password);
  const providedToken = readCookie(request, ACCESS_COOKIE);
  if (!providedToken || !(await matchesSecret(providedToken, expectedToken))) {
    const returnTo = safeReturnTo(`${url.pathname}${url.search}`);
    const gateUrl = new URL("/__access", url.origin);
    gateUrl.searchParams.set("return_to", returnTo);
    return Response.redirect(gateUrl, 302);
  }

  return null;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    const accessResponse = await enforceSiteAccess(request, env);
    if (accessResponse) return accessResponse;

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      return handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    }

    const response = await handler.fetch(request, env, ctx);
    if (!env.SITE_ACCESS_PASSWORD?.trim() || isPublicAsset(url.pathname)) return response;

    const headers = new Headers(response.headers);
    headers.set("cache-control", "private, no-store, max-age=0");
    headers.set("vary", "Cookie");
    headers.set("x-robots-tag", "noindex, nofollow, noarchive");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  },
};

export default worker;
