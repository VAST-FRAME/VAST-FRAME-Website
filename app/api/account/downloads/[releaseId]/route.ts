import { getCustomerAccount } from "@/lib/customer/auth";

export async function GET(_request: Request, context: { params: Promise<{ releaseId: string }> }) {
  const account = await getCustomerAccount();
  if (!account) return new Response("Authentication required", { status: 401 });

  const { getEntitledRelease, recordProductDownload } = await import("@/lib/customer/database");
  const { releaseId } = await context.params;
  const release = await getEntitledRelease(account.organization.id, releaseId);
  if (!release) return new Response("Release not found", { status: 404 });

  const { env } = await import("cloudflare:workers");
  const object = await env.PRODUCTS.get(release.objectKey);
  if (!object) return new Response("Release artifact unavailable", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", release.contentType);
  headers.set("content-disposition", `attachment; filename="${release.filename.replaceAll('"', "")}"`);
  headers.set("cache-control", "private, no-store, max-age=0");
  headers.set("etag", object.httpEtag);
  await recordProductDownload(account.organization.id, account.identity.id, release.id);
  return new Response(object.body, { headers });
}
