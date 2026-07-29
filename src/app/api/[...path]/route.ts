import { NextRequest, NextResponse } from 'next/server';

const API_HOST = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://active.test/api/v2'
).replace(/\/api\/v2\/?$/, '');

const SYSTEM_KEY = process.env.SYSTEM_KEY || process.env.NEXT_PUBLIC_SYSTEM_KEY || '';

async function proxyRequest(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join('/');
  const targetUrl = new URL(`${API_HOST}/api/${path}`);

  // Forward query parameters
  req.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  // Build headers to forward
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'System-Key': SYSTEM_KEY,
  };

  // Forward auth token
  const authorization = req.headers.get('authorization');
  if (authorization) {
    headers['Authorization'] = authorization;
  }

  // Forward content type
  const contentType = req.headers.get('content-type');
  if (contentType) {
    headers['Content-Type'] = contentType;
  }

  console.log(`[Proxy] ${req.method} ${path}`);
  console.log(`[Proxy] Auth header present: ${!!authorization}`);
  console.log(`[Proxy] System-Key present: ${!!SYSTEM_KEY}`);
  console.log(`[Proxy] Target: ${targetUrl.toString()}`);

  // Forward request body for non-GET methods
  let body: string | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      body = await req.text();
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(targetUrl.toString(), {
      method: req.method,
      headers,
      body,
    });

    const responseText = await res.text();
    console.log(`[Proxy] Response: ${res.status} | ${responseText.slice(0, 200)}`);

    return new NextResponse(responseText, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error:', error);
    return NextResponse.json(
      { result: false, message: 'Failed to connect to backend API' },
      { status: 502 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(req, path);
}
