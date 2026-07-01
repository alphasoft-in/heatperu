import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Delete the session cookie
  cookies.delete('admin_session', { path: '/' });
  
  return new Response(JSON.stringify({ message: 'Logged out successfully' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
