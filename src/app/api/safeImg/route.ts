import { NextRequest } from "next/server";

export const runtime = "edge";

/*
 * Given a hostname, proxy the request (to avoid exposing the user's IP address)
 * adding cache headers (for 1 day) if missing.  Restrict to /favicon.ico for now.
 */
export async function GET(request: NextRequest) {
  const _url = request.nextUrl.searchParams.get("url");
  if (!_url) {
    return new Response(null, { status: 400 });
  }

  const url = new URL(_url);
  if (url.pathname !== "/favicon.ico") {
    return new Response(null, { status: 400 });
  }

  const response = await fetch(url);

  if (!response.headers.get("Cache-Control")) {
    // 1 day in seconds
    response.headers.set("Cache-Control", "public, max-age=86400, immutable");
  }

  return response;
}
