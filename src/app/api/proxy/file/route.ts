import { NextRequest, NextResponse } from 'next/server';

import { getUserInfo } from '@/shared/models/user';

// The proxy exists so the browser can download generated media from provider
// CDNs. Restrict it to signed-in users, https URLs and media content so it
// cannot serve arbitrary HTML from this origin or reach internal hosts.
const ALLOWED_CONTENT_TYPE = /^(video|image|audio)\//i;

export async function GET(req: NextRequest) {
  const user = await getUserInfo();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return new NextResponse('Invalid url', { status: 400 });
  }
  if (target.protocol !== 'https:') {
    return new NextResponse('Invalid url', { status: 400 });
  }

  try {
    const response = await fetch(target);

    if (!response.ok) {
      return new NextResponse(`Failed to fetch file: ${response.statusText}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!ALLOWED_CONTENT_TYPE.test(contentType)) {
      return new NextResponse('Unsupported file type', { status: 415 });
    }

    return new NextResponse(response.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': 'attachment',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox",
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
