import { defineMiddleware } from 'astro:middleware';
import * as jose from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-heatperu-key-2026-fallback'
);

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // Protect all routes under /admin EXCEPT /admin/login
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const token = cookies.get('admin_session')?.value;

    if (!token) {
      return redirect('/admin/login');
    }

    try {
      // Verify JWT
      const { payload } = await jose.jwtVerify(token, JWT_SECRET);
      
      // Refresh token to extend session by 30 minutes on activity
      const newToken = await new jose.SignJWT({ id: payload.id, email: payload.email, name: payload.name })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('30m')
        .sign(JWT_SECRET);
        
      cookies.set('admin_session', newToken, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 30, // 30 minutes
      });
      
      // Allow request to continue
      return next();
    } catch (err) {
      // If token is invalid or expired
      return redirect('/admin/login');
    }
  }

  // If we are already logged in and try to go to /admin/login, redirect to /admin
  if (url.pathname === '/admin/login') {
    const token = cookies.get('admin_session')?.value;
    if (token) {
      try {
        await jose.jwtVerify(token, JWT_SECRET);
        return redirect('/admin');
      } catch (err) {
        // Token invalid, let them see the login page
      }
    }
  }

  // Allow other routes (public website)
  return next();
});
