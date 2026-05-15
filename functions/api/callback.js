/**
 * Cloudflare Pages Function - GitHub OAuth callback for Decap CMS
 * URL: /api/callback
 *
 * GitHub redirect về đây sau khi user authorize.
 * Đổi authorization code → access token, gửi về Decap CMS qua postMessage.
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (!code) {
    return new Response('Missing authorization code', { status: 400 });
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('Missing GitHub OAuth env vars', { status: 500 });
  }

  // Đổi code → access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: code,
    }),
  });

  const data = await tokenResponse.json();

  if (data.error) {
    return new Response(
      `OAuth error: ${data.error_description || data.error}`,
      { status: 400 }
    );
  }

  const content = {
    token: data.access_token,
    provider: 'github',
  };

  // Trả về HTML chạy postMessage gửi token về cửa sổ cha (Decap CMS)
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Authorizing...</title>
</head>
<body>
  <p style="font-family: system-ui, sans-serif; padding: 24px;">Đang xử lý đăng nhập, vui lòng đợi...</p>
  <script>
    (function() {
      function receiveMessage(e) {
        // Gửi authorization data về cửa sổ cha (Decap CMS popup opener)
        window.opener.postMessage(
          'authorization:github:success:' + JSON.stringify(${JSON.stringify(content)}),
          e.origin
        );
      }
      window.addEventListener('message', receiveMessage, false);
      // Trigger ngay khi load
      window.opener.postMessage('authorizing:github', '*');
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
