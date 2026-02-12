// Next.js Instrumentation for Sentry
// This file initializes Sentry for both server and edge runtimes

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

// This is called when an error happens in a Server Component
export const onRequestError = async (
  err: Error,
  request: {
    path: string;
    method: string;
    headers: Record<string, string>;
  },
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
    renderSource?: 'react-server-components' | 'react-server-components-payload';
    revalidateReason?: 'on-demand' | 'stale';
    serverComponentType?: 'not-found' | 'redirect' | 'dynamic-error';
  }
) => {
  // Only import Sentry when needed
  const Sentry = await import('@sentry/nextjs');
  
  Sentry.captureException(err, {
    extra: {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
      routeType: context.routeType,
    },
  });
};
