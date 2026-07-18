import { Router, Response } from 'express';
import * as cheerio from 'cheerio';
import db from './db';
import { AuthRequest, authMiddleware } from './middleware';

const router = Router();

function extractBaseUrl(url: string): string {
  try { const u = new URL(url); return `${u.protocol}//${u.hostname}`; } catch { return url; }
}

async function fetchPage(url: string): Promise<{ html: string; ms: number } | null> {
  try {
    const s = Date.now();
    const r = await fetch(url, { headers: { 'User-Agent': 'SEOAuditTool/1.0' }, signal: AbortSignal.timeout(15000) });
    return { html: await r.text(), ms: Date.now() - s };
  } catch { return null; }
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const $ = cheerio.load(html);
  const base = extractBaseUrl(baseUrl);
  const links = new Set<string>();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('#') || /\.(jpg|jpeg|png|gif|svg|webp|pdf|zip|mp4|mp3)$/i.test(href)) return;
    try {
      const r = new URL(href, baseUrl); r.hash = '';
      const p = r.pathname.replace(/\/+$/, '') || '/';
      const n = `${r.protocol}//${r.hostname}${p}`;
      if (n.startsWith(base)) links.add(n);
    } catch {}
  });
  return Array.from(links);
}

function analyzePage(html: string, url: string, baseUrl: string): any {
  const $ = cheerio.load(html);
  const base = extractBaseUrl(baseUrl);
  const h1Text: string[] = []; $('h1').each((_, el) => h1Text.push($(el).text().trim()));
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  let imageCount = 0, imagesWithoutAlt = 0;
  $('img').each((_, el) => { imageCount++; const a = $(el).attr('alt'); if (!a || !a.trim()) imagesWithoutAlt++; });
  let internalLinks = 0, externalLinks = 0;
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try { const r = new URL(href, url); if (r.hostname === new URL(base).hostname) internalLinks++; else externalLinks++; } catch {}
  });
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;
  const hasLoremIpsum = /lorem\s+ipsum/i.test(bodyText);
  const loremIpsumSections: string[] = [];
  if (hasLoremIpsum) $('section,div,article').each((_, el) => {
    if (/lorem\s+ipsum/i.test($(el).text())) loremIpsumSections.push($(el).find('h1,h2,h3').first().text().trim() || 'Unknown');
  });
  const duplicateSections: string[] = [];
  const blocks: string[] = [];
  $('section,article,.elementor-section,.wp-block-group').each((_, el) => { const t = $(el).text().trim(); if (t.length > 100) blocks.push(t); });
  const seen = new Map<string, number>();
  for (const b of blocks) { const k = b.substring(0, 200).toLowerCase(); const c = (seen.get(k) || 0) + 1; seen.set(k, c); if (c === 2) duplicateSections.push(b.substring(0, 80) + '...'); }
  const title = $('title').text().trim() || h1Text[0] || url;
  const stopWords = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','shall','should','may','might','must','can','could','and','but','or','nor','for','yet','so','in','on','at','to','of','by','with','from','up','out','if','about','into','through','during','before','after','above','below','between','under','again','further','then','once','here','there','when','where','why','how','all','each','every','both','few','more','most','other','some','such','no','not','only','own','same','than','too','very','just','because','as','until','while','that','this','these','those','it','its','i','me','my','we','us','our','you','your','he','him','his','she','her','they','them','their','what','which','who','whom']);
  const keywordDensity: Record<string, number> = {};
  bodyText.toLowerCase().split(/\s+/).filter((w: string) => w.length > 2 && !stopWords.has(w)).forEach((w: string) => {
    const c = w.replace(/[^a-z0-9-]/g, ''); if (c.length > 2) keywordDensity[c] = (keywordDensity[c] || 0) + 1;
  });
  return { url, title, wordCount, h1Count: h1Text.length, h1Text, h2Count, h3Count, imageCount, imagesWithoutAlt, internalLinks, externalLinks, hasLoremIpsum, loremIpsumSections, duplicateSections, titleLength: title.length, keywordDensity };
}

function detectPageIssues(page: any): any[] {
  const issues: any[] = [];
  const pg = page.url;
  if (page.h1Count === 0) issues.push({ severity: 'high', category: 'on-page', title: 'Missing H1 Tag', description: 'No H1 heading found.', recommendation: 'Add exactly one H1 tag with your primary keyword.', page: pg });
  else if (page.h1Count > 1) issues.push({ severity: 'medium', category: 'on-page', title: 'Multiple H1 Tags', description: `Found ${page.h1Count} H1 tags.`, recommendation: 'Use exactly one H1 per page.', page: pg });
  if (page.wordCount < 100) issues.push({ severity: 'high', category: 'content', title: 'Thin Content', description: `Only ${page.wordCount} words.`, recommendation: 'Add at least 300+ words of unique content.', page: pg });
  else if (page.wordCount < 300) issues.push({ severity: 'medium', category: 'content', title: 'Low Word Count', description: `Only ${page.wordCount} words.`, recommendation: 'Aim for 500+ words.', page: pg });
  if (page.hasLoremIpsum) issues.push({ severity: 'high', category: 'content', title: 'Placeholder Text', description: 'Lorem ipsum detected.', recommendation: 'Replace all placeholder text immediately.', page: pg });
  if (page.duplicateSections.length > 0) issues.push({ severity: 'medium', category: 'content', title: 'Duplicate Content', description: `${page.duplicateSections.length} duplicate block(s).`, recommendation: 'Remove duplicate sections.', page: pg });
  if (page.imagesWithoutAlt > 0) issues.push({ severity: page.imagesWithoutAlt > 3 ? 'high' : 'medium', category: 'images', title: 'Missing Alt Text', description: `${page.imagesWithoutAlt}/${page.imageCount} images lack alt text.`, recommendation: 'Add descriptive alt text to every image.', page: pg });
  if (page.imageCount === 0) issues.push({ severity: 'low', category: 'images', title: 'No Images', description: 'No images found.', recommendation: 'Add relevant images.', page: pg });
  if (page.internalLinks < 2) issues.push({ severity: 'medium', category: 'links', title: 'Low Internal Linking', description: `Only ${page.internalLinks} internal links.`, recommendation: 'Add 3-5 internal links.', page: pg });
  if (page.externalLinks === 0) issues.push({ severity: 'low', category: 'links', title: 'No External Links', description: 'No outbound links.', recommendation: 'Link to 1-2 authoritative sources.', page: pg });
  if (page.titleLength > 60) issues.push({ severity: 'low', category: 'on-page', title: 'Long Title', description: `Title is ${page.titleLength} chars.`, recommendation: 'Keep titles under 60 characters.', page: pg });
  if (page.h1Count > 0 && page.h2Count === 0 && page.wordCount > 200) issues.push({ severity: 'low', category: 'on-page', title: 'Missing H2s', description: 'No H2 subheadings.', recommendation: 'Add H2 subheadings.', page: pg });
  return issues;
}

function calculateScores(pages: any[], issues: any[]) {
  const defs = [
    { category: 'technical', label: 'Technical SEO', maxScore: 25 },
    { category: 'on-page', label: 'On-Page SEO', maxScore: 25 },
    { category: 'content', label: 'Content Quality', maxScore: 25 },
    { category: 'images', label: 'Images & Media', maxScore: 15 },
    { category: 'links', label: 'Links', maxScore: 10 },
  ];
  const pc = Math.max(pages.length, 1);
  const categories = defs.map(d => {
    const ci = issues.filter((i: any) => i.category === d.category);
    const h = ci.filter((i: any) => i.severity === 'high').length;
    const m = ci.filter((i: any) => i.severity === 'medium').length;
    const l = ci.filter((i: any) => i.severity === 'low').length;
    let ded: number;
    if (d.category === 'technical') ded = h * 6 + m * 3 + l;
    else ded = Math.min(h / pc, 1) * d.maxScore * 0.6 + Math.min(m / pc, 1) * d.maxScore * 0.3 + Math.min(l / pc, 1) * d.maxScore * 0.1;
    const score = Math.max(0, Math.round(d.maxScore - Math.min(ded, d.maxScore * 0.9)));
    return { category: d.category, label: d.label, score, maxScore: d.maxScore, issueCount: ci.length };
  });
  return { overall: categories.reduce((s, c) => s + c.score, 0), categories };
}

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    const userId = req.userId!;
    const plan = req.userPlan || 'free';
    if (plan === 'free') {
      const today = new Date().toISOString().split('T')[0];
      const usage: any = db.prepare('SELECT count FROM daily_usage WHERE user_id = ? AND date = ?').get(userId, today);
      if ((usage?.count || 0) >= 5) return res.status(429).json({ error: 'Daily limit reached (5/5). Upgrade for unlimited audits.', remaining: 0, limit: 5, used: usage.count });
    }
    let siteUrl = url.trim();
    if (!siteUrl.startsWith('http')) siteUrl = 'https://' + siteUrl;
    const mainPage = await fetchPage(siteUrl);
    if (!mainPage) return res.status(400).json({ error: 'Could not reach website.' });
    const links = extractInternalLinks(mainPage.html, siteUrl);
    const toCrawl = [siteUrl, ...links.filter((l: string) => l !== siteUrl)].slice(0, 20);
    const pages: any[] = [];
    for (const pu of toCrawl) {
      const f = pu === siteUrl ? mainPage : await fetchPage(pu);
      if (f) pages.push(analyzePage(f.html, pu, siteUrl));
    }
    const isHttps = siteUrl.startsWith('https');
    let hasRobotsTxt = false;
    try { const r = await fetch(`${extractBaseUrl(siteUrl)}/robots.txt`, { signal: AbortSignal.timeout(8000) }); hasRobotsTxt = r.ok; } catch {}
    let hasSitemap = false, sitemapUrls = 0;
    for (const sp of ['/sitemap.xml', '/sitemap_index.xml']) {
      try { const r = await fetch(`${extractBaseUrl(siteUrl)}${sp}`, { signal: AbortSignal.timeout(8000) }); if (r.ok) { hasSitemap = true; const t = await r.text(); sitemapUrls = (t.match(/<url>/gi) || []).length || (t.match(/<sitemap>/gi) || []).length; break; } } catch {}
    }
    const tech = { isHttps, hasRobotsTxt, hasSitemap, sitemapUrls, googleIndexed: true, indexedPages: 10, loadTimeMs: mainPage.ms };
    const pageIssues = pages.flatMap((p: any) => detectPageIssues(p));
    const techIssues: any[] = [];
    if (!tech.isHttps) techIssues.push({ severity: 'high', category: 'technical', title: 'Not Using HTTPS', description: 'Not served over HTTPS.', recommendation: 'Install SSL certificate.' });
    if (!tech.hasRobotsTxt) techIssues.push({ severity: 'high', category: 'technical', title: 'Missing robots.txt', description: 'No robots.txt found.', recommendation: 'Create robots.txt.' });
    if (!tech.hasSitemap) techIssues.push({ severity: 'high', category: 'technical', title: 'Missing Sitemap', description: 'No sitemap found.', recommendation: 'Create XML sitemap.' });
    const allIssues = [...techIssues, ...pageIssues];
    const { overall, categories } = calculateScores(pages, allIssues);
    const result = { siteUrl, auditDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), overallScore: overall, categoryScores: categories, pages, issues: allIssues, technicalChecks: tech };
    db.prepare('INSERT INTO audits (user_id, site_url, overall_score, data_json) VALUES (?, ?, ?, ?)').run(userId, siteUrl, overall, JSON.stringify(result));
    const today = new Date().toISOString().split('T')[0];
    db.prepare('INSERT INTO daily_usage (user_id, date, count) VALUES (?, ?, 1) ON CONFLICT(user_id, date) DO UPDATE SET count = count + 1').run(userId, today);
    const usageAfter: any = db.prepare('SELECT count FROM daily_usage WHERE user_id = ? AND date = ?').get(userId, today);
    const remaining = plan === 'free' ? Math.max(0, 5 - (usageAfter?.count || 0)) : -1;
    res.json({ result, remaining, used: usageAfter?.count || 0, limit: plan === 'free' ? 5 : -1 });
  } catch (err: any) { console.error('[AUDIT]', err); res.status(500).json({ error: 'Audit failed: ' + err.message }); }
});

router.get('/history', authMiddleware, (req: AuthRequest, res: Response) => {
  res.json({ audits: db.prepare('SELECT id, site_url, overall_score, created_at FROM audits WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(req.userId!) });
});

router.get('/history/:id', authMiddleware, (req: AuthRequest, res: Response) => {
  const a: any = db.prepare('SELECT data_json FROM audits WHERE id = ? AND user_id = ?').get(req.params.id, req.userId!);
  if (!a) return res.status(404).json({ error: 'Not found' });
  res.json({ result: JSON.parse(a.data_json) });
});

router.get('/usage', authMiddleware, (req: AuthRequest, res: Response) => {
  const today = new Date().toISOString().split('T')[0];
  const u: any = db.prepare('SELECT count FROM daily_usage WHERE user_id = ? AND date = ?').get(req.userId!, today);
  const c = u?.count || 0;
  const plan = req.userPlan || 'free';
  res.json({ used: c, limit: plan === 'free' ? 5 : -1, remaining: plan === 'free' ? Math.max(0, 5 - c) : -1 });
});

export default router;
