import * as cheerio from 'cheerio';

interface PageResult {
  url: string;
  score: number;
  title: string;
  meta: string;
  h1: string[];
  h2: string[];
  images: { total: number; missingAlt: number };
  links: { internal: number; external: number; broken: number };
  issues: { type: string; category: string; message: string; fix?: string }[];
  keywords: { word: string; count: number; density: number }[];
  wordCount: number;
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname; } catch { return url; }
}

function normalizeUrl(base: string, href: string): string | null {
  try {
    const u = new URL(href, base);
    if (!u.protocol.startsWith('http')) return null;
    u.hash = '';
    return u.href.replace(/\/$/, '');
  } catch { return null; }
}

async function fetchPage(url: string): Promise<{ html: string; status: number; loadTime: number } | null> {
  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'RankPilot-SEO-Bot/1.0' }
    });
    clearTimeout(timeout);
    const html = await res.text();
    return { html, status: res.status, loadTime: Date.now() - start };
  } catch { return null; }
}

function analyzePage(url: string, html: string, domain: string): PageResult {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim();
  const meta = $('meta[name="description"]').attr('content')?.trim() || '';
  const h1 = $('h1').map((_, el) => $(el).text().trim()).get();
  const h2 = $('h2').map((_, el) => $(el).text().trim()).get();

  const images = $('img');
  const totalImages = images.length;
  let missingAlt = 0;
  images.each((_, el) => { if (!$(el).attr('alt')?.trim()) missingAlt++; });

  let internal = 0, external = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const u = new URL(href, url);
      if (u.hostname === domain || u.hostname.endsWith('.' + domain)) internal++;
      else external++;
    } catch {}
  });

  // Word count & keywords
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const words = bodyText.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const wordCount = words.length;

  const freq: Record<string, number> = {};
  const stopWords = new Set(['that','this','with','have','from','they','been','were','their','which','would','there','about','will','each','make','like','than','more','some','very','when','what','your','into','also','just','could','other','over','after','most']);
  words.forEach(w => {
    const clean = w.replace(/[^a-z]/g, '');
    if (clean.length > 3 && !stopWords.has(clean)) freq[clean] = (freq[clean] || 0) + 1;
  });
  const keywords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word, count]) => ({ word, count, density: Math.round((count / Math.max(wordCount, 1)) * 10000) / 100 }));

  // Issues
  const issues: PageResult['issues'] = [];

  if (!title) issues.push({ type: 'critical', category: 'Title', message: 'Missing page title', fix: 'Add a unique <title> tag between 30-60 characters' });
  else if (title.length < 30) issues.push({ type: 'warning', category: 'Title', message: `Title too short (${title.length} chars)`, fix: 'Expand title to 30-60 characters with primary keyword' });
  else if (title.length > 60) issues.push({ type: 'warning', category: 'Title', message: `Title too long (${title.length} chars)`, fix: 'Shorten title to under 60 characters' });

  if (!meta) issues.push({ type: 'critical', category: 'Meta Description', message: 'Missing meta description', fix: 'Add <meta name="description"> with 120-160 characters' });
  else if (meta.length < 120) issues.push({ type: 'warning', category: 'Meta Description', message: `Meta description too short (${meta.length} chars)`, fix: 'Expand to 120-160 characters' });
  else if (meta.length > 160) issues.push({ type: 'warning', category: 'Meta Description', message: `Meta description too long (${meta.length} chars)`, fix: 'Trim to under 160 characters' });

  if (h1.length === 0) issues.push({ type: 'critical', category: 'Headings', message: 'Missing H1 tag', fix: 'Add exactly one H1 tag with your primary keyword' });
  else if (h1.length > 1) issues.push({ type: 'warning', category: 'Headings', message: `Multiple H1 tags (${h1.length})`, fix: 'Use only one H1 per page' });

  if (missingAlt > 0) issues.push({ type: 'warning', category: 'Images', message: `${missingAlt} of ${totalImages} images missing alt text`, fix: 'Add descriptive alt text to all images' });

  if (!$('link[rel="canonical"]').attr('href')) issues.push({ type: 'warning', category: 'Technical', message: 'Missing canonical tag', fix: 'Add <link rel="canonical" href="..."> to prevent duplicate content' });

  if (!$('meta[property="og:title"]').attr('content')) issues.push({ type: 'info', category: 'Social', message: 'Missing Open Graph tags', fix: 'Add og:title, og:description, og:image meta tags' });

  const hasSchema = html.includes('application/ld+json');
  if (!hasSchema) issues.push({ type: 'info', category: 'Structured Data', message: 'No structured data found', fix: 'Add JSON-LD schema markup for better search appearance' });

  if (wordCount < 300) issues.push({ type: 'warning', category: 'Content', message: `Low word count (${wordCount})`, fix: 'Aim for 300+ words of unique, valuable content' });

  // Score calculation
  let score = 100;
  issues.forEach(i => {
    if (i.type === 'critical') score -= 15;
    else if (i.type === 'warning') score -= 7;
    else score -= 2;
  });
  score = Math.max(0, Math.min(100, score));

  return { url, score, title, meta, h1, h2, images: { total: totalImages, missingAlt }, links: { internal, external, broken: 0 }, issues, keywords, wordCount };
}

export async function auditSite(inputUrl: string): Promise<{
  domain: string;
  pages: PageResult[];
  overallScore: number;
  timestamp: string;
}> {
  let baseUrl = inputUrl.trim();
  if (!baseUrl.startsWith('http')) baseUrl = 'https://' + baseUrl;
  const domain = extractDomain(baseUrl);

  const visited = new Set<string>();
  const toVisit = [baseUrl.replace(/\/$/, '')];
  const results: PageResult[] = [];
  const maxPages = 20;

  while (toVisit.length > 0 && results.length < maxPages) {
    const url = toVisit.shift()!;
    const normalized = url.replace(/\/$/, '');
    if (visited.has(normalized)) continue;
    visited.add(normalized);

    const page = await fetchPage(url);
    if (!page || page.status >= 400) continue;

    const result = analyzePage(url, page.html, domain);
    results.push(result);

    // Extract internal links
    const $ = cheerio.load(page.html);
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const abs = normalizeUrl(url, href);
      if (abs && extractDomain(abs) === domain && !visited.has(abs) && !toVisit.includes(abs)) {
        toVisit.push(abs);
      }
    });
  }

  if (results.length === 0) {
    throw new Error('Could not crawl any pages. Check that the URL is correct and accessible.');
  }

  const overallScore = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);

  return { domain, pages: results, overallScore, timestamp: new Date().toISOString() };
}
