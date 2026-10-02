import { NextResponse, NextRequest } from 'next/server';

const USER_PROTECTED_PATHS = ['/payment', '/account', '/bookings', '/sankalp'];

function isUserProtectedPath(pathname: string) {
  return USER_PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin and /api/admin routes, but allow login endpoints
  const isAdminPath = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isAdminApi = pathname.startsWith('/api/admin') && pathname !== '/api/admin/login';
  if (isAdminPath || isAdminApi) {
    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    // We rely on backend validation for real requests. Here we just do a surface-level check.
    return NextResponse.next();
  }

  if (isUserProtectedPath(pathname)) {
    const isUserLoggedIn = request.cookies.get('userLogin')?.value === 'true';

    if (!isUserLoggedIn) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set(
        'callbackUrl',
        `${request.nextUrl.pathname}${request.nextUrl.search}`
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/booking/:path*', '/bookings/:path*', '/payment/:path*'],
};
