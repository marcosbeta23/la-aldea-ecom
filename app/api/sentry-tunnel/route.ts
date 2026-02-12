// Sentry Tunnel - Proxies Sentry requests to avoid ad blockers
// https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option

import { NextRequest, NextResponse } from 'next/server';

// Your Sentry project's host (from DSN)
const SENTRY_HOST = 'o4510870980657152.ingest.us.sentry.io';
const SENTRY_PROJECT_ID = '4510870986031104';

export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const pieces = envelope.split('\n');
    
    // Parse the envelope header to get the DSN
    const header = JSON.parse(pieces[0]);
    const dsn = new URL(header.dsn);
    
    // Validate the project ID matches
    const projectId = dsn.pathname.replace('/', '');
    if (projectId !== SENTRY_PROJECT_ID) {
      return NextResponse.json(
        { error: 'Invalid project' },
        { status: 403 }
      );
    }

    // Forward to Sentry
    const sentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;
    
    const response = await fetch(sentryUrl, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Sentry tunnel error:', error);
    return NextResponse.json(
      { error: 'Tunnel error' },
      { status: 500 }
    );
  }
}
