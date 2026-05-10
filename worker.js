// PROJECT D.I.M.K.A. — Cloudflare Worker (with static assets binding).
// Routes:
//   GET  /api/chat → health (provider, model, hasKey)
//   POST /api/chat → proxy to Gemini API
//   *              → static assets (public/)

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat') {
      if (request.method === 'POST') return handleChat(request, env);
      if (request.method === 'GET')  return jsonResp({
        ok: true,
        provider: 'gemini',
        model: env.GEMINI_MODEL || 'gemini-2.5-flash',
        hasKey: Boolean(env.GEMINI_API_KEY)
      });
      return jsonResp({ error: 'Method not allowed' }, 405);
    }

    // Everything else → static assets (public/index.html, etc.)
    return env.ASSETS.fetch(request);
  }
};

async function handleChat(request, env) {
  let body;
  try { body = await request.json(); }
  catch { return jsonResp({ error: 'invalid JSON body' }, 400); }

  const { system, user, max_tokens } = body || {};
  if (!system || !user) return jsonResp({ error: 'system and user required' }, 400);

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) return jsonResp({ error: 'Missing GEMINI_API_KEY (set as Secret in Cloudflare dashboard)' }, 500);

  const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  let upstream;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: {
          maxOutputTokens: max_tokens || 4096,
          temperature: 0.9,
          responseMimeType: 'application/json'
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
        ]
      })
    });
  } catch (err) {
    return jsonResp({ error: 'upstream fetch failed: ' + String(err) }, 502);
  }

  const data = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return jsonResp({ error: data?.error?.message || 'Upstream error' }, upstream.status);

  const cand = data?.candidates?.[0];
  if (!cand) return jsonResp({ error: 'Empty response from model' }, 502);
  if (cand.finishReason === 'SAFETY' || cand.finishReason === 'PROHIBITED_CONTENT') {
    return jsonResp({ error: 'Blocked by safety filters' }, 400);
  }

  const text = (cand.content?.parts || []).map(p => p.text || '').join('');
  return jsonResp({ text });
}

function jsonResp(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}
