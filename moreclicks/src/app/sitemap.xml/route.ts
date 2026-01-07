import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://moreclicks.io'
  const lastModified = new Date().toISOString()

  // Public pages only (exclude dashboard pages that require authentication)
  const urls = [
    { path: '', priority: '1.0', changefreq: 'weekly' },
    { path: '/pricing', priority: '0.9', changefreq: 'monthly' },
    { path: '/about', priority: '0.8', changefreq: 'monthly' },
    { path: '/blog', priority: '0.8', changefreq: 'weekly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/compare/moreclicks-vs-ahrefs', priority: '0.7', changefreq: 'monthly' },
    { path: '/sign-in', priority: '0.6', changefreq: 'monthly' },
    { path: '/sign-up', priority: '0.6', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { path: '/terms', priority: '0.5', changefreq: 'yearly' },
    { path: '/cookies', priority: '0.5', changefreq: 'yearly' },
    { path: '/disclaimer', priority: '0.5', changefreq: 'yearly' },
  ]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${baseUrl}${url.path}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new NextResponse(xml.trim(), {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}

