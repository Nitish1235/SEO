import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://moreclicks.io";

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /api/
Disallow: /sign-in
Disallow: /sign-up

Sitemap: ${baseUrl}/sitemap.xml
`;

  return new NextResponse(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

