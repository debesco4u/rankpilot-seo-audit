import * as cheerio from 'cheerio';
import { CrawledPage } from './crawler';

export interface PageAnalysis {
  url: string; statusCode: number; loadTime: number;
  title: string; titleLength: number; metaDescription: string; metaDescLength: number;
  h1Count: number; h1Text: string[]; h2Count: number;
  imgTotal: number; imgMissingAlt: number; wordCount: number;
  internalLinks: number; externalLinks: number;
  hasCanonical: boolean; hasViewport: boolean;
  issues: { severity: 'critical' | 'warning' | 'info'; message: string; fix?: string }[];
  score: number;
}

export interface SiteAudit {
  url: string; crawledAt: string; totalPages: number; overallScore: number;
  pages: PageAnalysis[];
  topKeywords: { word: string; count: number; density: number }[];
  summary: { criticalIssues: number; warnings: number; passed: number; avgLoadTime: number; avgWordCount: number; };
}

function analyzePage(page: CrawledPage): PageAnalysis {
  const issues: PageAnalysis['issues'] = [];
  if (page.error || !page.html) {
    return { url: page.url, statusCode: page.statusCode, loadTime: page.loadTime,
      title: '', titleLength: 0, metaDescription: '', metaDescLength: 0,
      h1Count: 0, h1Text: [], h2Count: 0, imgTotal: 0, imgMissingAlt: 0,
      wordCount: 0, internalLinks: 0, externalLinks: 0,
      hasCanonical: false, hasViewport: false,
      issues: [{ severity: 'critical', message: 'Page error: ' + (page.error || 'Empty response') }], score: 0 };
  }

  const $ = cheerio.load(page.html);
  const title = $('title').first().text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get();
  const h2Count = $('h2').length;
  const imgs = $('img');
  let imgMissingAlt = 0;
  imgs.each((_, el) => { if (!$(el).attr('alt')?.trim()) imgMissingAlt++; });
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  let internalLinks = 0, externalLinks = 0;
  const base = new URL(page.url);
  $('a[href]').each((_, el) => {
    try {
      const href = $(el).attr('href') || '';
      const u = new URL(href, page.url);
      if (u.hostname === base.hostname) internalLinks++; else externalLinks++;
    } catch {}
  });
  const hasCanonical = $('link[rel="canonical"]').length > 0;
  const hasViewport = $('meta[name="viewport"]').length > 0;

  let score = 100;
  if (!title) { issues.push({ severity: 'critical', message: 'Missing title tag', fix: 'Add a unique <title> tag (50-60 chars)' }); score -= 15; }
  else if (title.length < 30 || title.length > 65) { issues.push({ severity: 'warning', message: 'Title length: ' + title.length + ' chars (ideal: 50-60)', fix: 'Rewrite title to 50-60 characters' }); score -= 5; }
  if (!metaDesc) { issues.push({ severity: 'critical', message: 'Missing meta description', fix: 'Add meta description (150-160 chars)' }); score -= 15; }
  else if (metaDesc.length < 120 || metaDesc.length > 165) { issues.push({ severity: 'warning', message: 'Meta description: ' + metaDesc.length + ' chars (ideal: 150-160)', fix: 'Adjust to 150-160 characters' }); score -= 5; }
  if (h1s.length === 0) { issues.push({ severity: 'critical', message: 'Missing H1 heading', fix: 'Add one H1 with primary keyword' }); score -= 15; }
  else if (h1s.length > 1) { issues.push({ severity: 'warning', message: 'Multiple H1 tags (' + h1s.length + ')', fix: 'Keep only one H1 per page' }); score -= 5; }
  if (imgMissingAlt > 0) {
    issues.push({ severity: imgMissingAlt > 3 ? 'critical' : 'warning', message: imgMissingAlt + '/' + imgs.length + ' images missing alt text', fix: 'Add descriptive alt to all images' });
    score -= Math.min(imgMissingAlt * 2, 15);
  }
  if (page.loadTime > 3000) { issues.push({ severity: 'critical', message: 'Slow load: ' + (page.loadTime/1000).toFixed(1) + 's', fix: 'Optimize images, enable caching' }); score -= 10; }
  else if (page.loadTime > 2000) { issues.push({ severity: 'warning', message: 'Load time: ' + (page.loadTime/1000).toFixed(1) + 's' }); score -= 5; }
  if (wordCount < 300) { issues.push({ severity: 'warning', message: 'Low word count: ' + wordCount, fix: 'Add more content (aim 500+)' }); score -= 5; }
  if (!hasCanonical) { issues.push({ severity: 'info', message: 'No canonical tag', fix: 'Add <link rel="canonical">' }); score -= 3; }
  if (!hasViewport) { issues.push({ severity: 'critical', message: 'Missing viewport meta', fix: 'Add viewport meta tag' }); score -= 10; }
  if (page.statusCode >= 400) { issues.push({ severity: 'critical', message: 'HTTP ' + page.statusCode + ' error' }); score -= 20; }
  if (issues.length === 0) issues.push({ severity: 'info', message: 'Page looks great!' });

  return { url: page.url, statusCode: page.statusCode, loadTime: page.loadTime,
    title, titleLength: title.length, metaDescription: metaDesc, metaDescLength: metaDesc.length,
    h1Count: h1s.length, h1Text: h1s, h2Count, imgTotal: imgs.length, imgMissingAlt,
    wordCount, internalLinks, externalLinks, hasCanonical, hasViewport,
    issues, score: Math.max(0, Math.min(100, score)) };
}

export function analyzeSite(pages: CrawledPage[], baseUrl: string): SiteAudit {
  const analyses = pages.map(analyzePage);
  const overallScore = Math.round(analyses.reduce((s, a) => s + a.score, 0) / analyses.length);
  const stopWords = new Set(['the','a','an','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','then','once','here','there','when','where','why','how','all','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','just','because','but','and','or','if','while','that','this','it','its','i','me','my','we','our','you','your','he','him','his','she','her','they','them','their','what','which','who']);
  const freq: Record<string, number> = {};
  let total = 0;
  for (const a of analyses) {
    const words = (a.title + ' ' + a.metaDescription + ' ' + a.h1Text.join(' ')).toLowerCase()
      .split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w) && /^[a-z]+$/i.test(w));
    total += words.length;
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  }
  const topKeywords = Object.entries(freq).sort(([,a],[,b]) => b - a).slice(0, 20)
    .map(([word, count]) => ({ word, count, density: total > 0 ? Math.round(count/total*10000)/100 : 0 }));
  let crit = 0, warn = 0, passed = 0;
  analyses.forEach(a => {
    a.issues.forEach(i => { if (i.severity === 'critical') crit++; else if (i.severity === 'warning') warn++; });
    if (a.score >= 80) passed++;
  });
  return { url: baseUrl, crawledAt: new Date().toISOString(), totalPages: analyses.length,
    overallScore, pages: analyses, topKeywords,
    summary: { criticalIssues: crit, warnings: warn, passed,
      avgLoadTime: Math.round(analyses.reduce((s,a) => s + a.loadTime, 0) / analyses.length),
      avgWordCount: Math.round(analyses.reduce((s,a) => s + a.wordCount, 0) / analyses.length) }
  };
}
