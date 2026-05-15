/**
 * Cloudflare Pages Function - GitHub OAuth redirect for Decap CMS
 * URL: /api/auth
 *
 * Khởi tạo OAuth flow: redirect user sang GitHub để authorize
 *
 * Yêu cầu environment variables (set trong Cloudflare Pages → Settings → Environment variables):
 *   GITHUB_CLIENT_ID     - Client ID của GitHub OAuth App
 *   GITHUB_CLIENT_SECRET - Client Secret (chỉ dùng ở /api/callback)
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (!env.GITHUB_CLIENT_ID) {
    return new Response('Missing GITHUB_CLIENT_ID env var', { status: 500 });
  }

  const redirectUri = `${url.origin}/api/callback`;
  const scope = 'repo,user';
  const state = crypto.randomUUID();

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);
  githubAuthUrl.searchParams.set('scope', scope);
  githubAuthUrl.searchParams.set('state', state);

  return Response.redirect(githubAuthUrl.toString(), 302);
}
