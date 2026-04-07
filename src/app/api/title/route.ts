import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'missing url' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; OpenClaw/1.0)',
      },
      cache: 'no-store',
    });

    const html = await response.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
      || html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["'][^>]*>/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["'][^>]*>/i)
      || html.match(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']*)["'][^>]*>/i);
    const descriptionMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i)
      || html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["'][^>]*>/i)
      || html.match(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']*)["'][^>]*>/i);

    const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() || url;
    const description = descriptionMatch?.[1]?.replace(/\s+/g, ' ').trim() || '';

    return NextResponse.json({ title, description });
  } catch {
    return NextResponse.json({ title: url, description: '' });
  }
}
