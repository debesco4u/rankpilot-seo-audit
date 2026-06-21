import * as cheerio from 'cheerio';

export interface CrawledPage {
  url: string; html: string; statusCode: number; loadTime: number; error?: string;
}

export async function crawlSite(baseUrl: string, maxPages = 30): Promise<CrawledPage[]> {
  const visited = new Set<string>();
  const results: CrawledPage[] = [];
  const queue: string[] = [baseUrl];
  const base = new URL(baseUrl);

  while (queue.length > 0 && results.length < maxPages) {
    const url = queue.shift()!;
    const normalized = url.split('#')[0].split('?')[0].replace(/\/$/, '') || url;
    if (visited.has(normalized)) continue;
    visited.add(normalized);

    try {
      const start = Date.now();
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'RankPilot-SEO-Auditor/1.0' },
        signal: AbortSignal.timeout(15000)
      });
      const html = await resp.text();
      const loadTime = Date.now() - start;
      results.push({ url: normalized, html, statusCode: resp.status, loadTime });

      const $ = cheerio.load(html);
      $('a[href]').each((_, el) => {
        try {
          const href = $(el).attr('href');
          if (!href) return;
          const abs = new URL(href, url);
          if (abs.hostname === base.hostname && !visited.has(abs.pathname.replace(/\/$/, ''))) {
            queue.push(abs.href);
          }
        } catch {}
      });
    } catch (e: any) {
      results.push({ url: normalized, html: '', statusCode: 0, loadTime: 0, error: e.message });
    }
  }
  return results;
}
