export interface Env {
  ALLOWED_ORIGINS: string;
}

interface FetchResult {
  url: string;
  status: number;
  content: string | null;
  error: string | null;
  responseTime: number;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',');
    const origin = request.headers.get('Origin') || '';
    const isAllowed = allowedOrigins.some(o => origin === o.trim());

    const corsHeaders = {
      'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const { domain } = await request.json() as { domain: string };

      if (!domain) {
        return Response.json({ error: 'Domain required' }, { status: 400, headers: corsHeaders });
      }

      const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '').split('/')[0];

      // Block private/local domains
      const blockedPatterns = [
        /^localhost$/i,
        /^127\./,
        /^10\./,
        /^172\.(1[6-9]|2\d|3[01])\./,
        /^192\.168\./,
        /^0\./,
        /^169\.254\./,
        /^\[/,           // IPv6
        /\.local$/i,
        /\.internal$/i,
      ];

      if (blockedPatterns.some(p => p.test(cleanDomain))) {
        return Response.json(
          { error: 'Domain not allowed' },
          { status: 400, headers: corsHeaders }
        );
      }

      const results = await Promise.all([
        fetchResource(`https://${cleanDomain}/llms.txt`),
        fetchResource(`https://${cleanDomain}/llms-full.txt`),
        fetchResource(`https://${cleanDomain}/robots.txt`),
        fetchResource(`https://${cleanDomain}/sitemap.xml`),
        fetchResource(`https://${cleanDomain}/`),
      ]);

      return Response.json({
        domain: cleanDomain,
        llmsTxt: results[0],
        llmsFullTxt: results[1],
        robotsTxt: results[2],
        sitemapXml: results[3],
        homepage: results[4],
      }, { headers: corsHeaders });

    } catch {
      return Response.json(
        { error: 'Internal error' },
        { status: 500, headers: corsHeaders }
      );
    }
  },
};

async function fetchResource(url: string): Promise<FetchResult> {
  const startTime = Date.now();
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'HealthScoreBot/1.0 (+https://vlasdobry.ru)' },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;
    const content = response.ok ? await response.text() : null;

    return {
      url,
      status: response.status,
      content: content?.slice(0, 50000) || null,
      error: null,
      responseTime,
    };
  } catch (error) {
    return {
      url,
      status: 0,
      content: null,
      error: error instanceof Error ? error.message : 'Fetch failed',
      responseTime: Date.now() - startTime,
    };
  }
}
