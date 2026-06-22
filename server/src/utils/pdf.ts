import { jsPDF } from 'jspdf';
import { SiteAudit } from './analyzer';

type RGB = readonly [number, number, number];
const C: Record<string, RGB> = {
  primary: [30,58,138], green: [34,197,94],
  yellow: [234,179,8], red: [239,68,68],
  gray: [107,114,128], dark: [31,41,55],
  light: [249,250,251], white: [255,255,255]
};

function scoreColor(s: number): RGB { return s >= 80 ? C.green : s >= 50 ? C.yellow : C.red; }

export function generatePdf(audit: SiteAudit, plan: string, removeBranding = false): Buffer {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const W = 210, H = 297, M = 15;
  let y = 0;
  const addPage = () => { doc.addPage(); y = M; };
  const checkSpace = (n: number) => { if (y + n > H - M) addPage(); };

  // Cover
  doc.setFillColor(...C.primary); doc.rect(0,0,W,H,'F');
  doc.setFont('helvetica','bold'); doc.setFontSize(36); doc.setTextColor(255,255,255);
  doc.text('SEO AUDIT REPORT', W/2, 80, {align:'center'});
  doc.setFontSize(16); doc.text(audit.url, W/2, 100, {align:'center'});
  const sc = scoreColor(audit.overallScore);
  doc.setFillColor(...sc); doc.circle(W/2, 150, 30, 'F');
  doc.setFontSize(40); doc.text(String(audit.overallScore), W/2, 157, {align:'center'});
  doc.setFontSize(12); doc.text('Overall Score', W/2, 190, {align:'center'});
  doc.setFontSize(10);
  doc.text('Generated: ' + new Date(audit.crawledAt).toLocaleDateString(), W/2, 210, {align:'center'});
  doc.text(audit.totalPages + ' pages analyzed', W/2, 218, {align:'center'});
  if (!removeBranding) { doc.setFontSize(8); doc.text('Powered by Dabisoft IT Solutions', W/2, H-15, {align:'center'}); }

  // Summary
  addPage();
  doc.setFillColor(...C.primary); doc.rect(0,y-M,W,20,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
  doc.text('Executive Summary', M, y+2); y += 20;
  doc.setTextColor(...C.dark); doc.setFontSize(11);
  const items = [['Overall Score', audit.overallScore+'/100'],['Pages Analyzed', String(audit.totalPages)],
    ['Critical Issues', String(audit.summary.criticalIssues)],['Warnings', String(audit.summary.warnings)],
    ['Pages Passing (80+)', String(audit.summary.passed)],
    ['Avg Load Time', (audit.summary.avgLoadTime/1000).toFixed(1)+'s'],['Avg Word Count', String(audit.summary.avgWordCount)]];
  items.forEach(([l,v], i) => {
    doc.setFillColor(...(i%2===0 ? C.light : C.white)); doc.rect(M,y,W-2*M,8,'F');
    doc.setFont('helvetica','normal'); doc.text(l, M+3, y+5.5);
    doc.setFont('helvetica','bold'); doc.text(v, W-M-3, y+5.5, {align:'right'}); y += 8;
  });

  // Pages (paid only)
  if (plan !== 'free') {
    audit.pages.forEach((page, idx) => {
      addPage();
      doc.setFillColor(...scoreColor(page.score)); doc.rect(0,y-M,W,18,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
      const pt = page.url.length > 60 ? page.url.slice(0,57)+'...' : page.url;
      doc.text('Page '+(idx+1)+': '+pt, M, y);
      doc.setFontSize(20); doc.text(page.score+'/100', W-M, y, {align:'right'}); y += 14;
      doc.setTextColor(...C.dark); doc.setFontSize(9); doc.setFont('helvetica','normal');
      ['Title: '+(page.title||'MISSING')+' ('+page.titleLength+' chars)',
       'Meta: '+(page.metaDescription ? page.metaDescription.slice(0,80)+'...' : 'MISSING'),
       'H1: '+page.h1Count+' | H2: '+page.h2Count+' | Words: '+page.wordCount,
       'Images: '+page.imgTotal+' (missing alt: '+page.imgMissingAlt+') | Load: '+(page.loadTime/1000).toFixed(1)+'s',
       'Links: '+page.internalLinks+' internal, '+page.externalLinks+' external'
      ].forEach(l => { doc.text(l, M, y); y += 5; });
      y += 3;
      page.issues.forEach(issue => {
        checkSpace(20);
        const ic = issue.severity === 'critical' ? C.red : issue.severity === 'warning' ? C.yellow : C.green;
        doc.setFillColor(...ic); doc.rect(M,y,3,issue.fix?14:7,'F');
        doc.setTextColor(...C.dark); doc.setFontSize(9); doc.setFont('helvetica','bold');
        doc.text(issue.severity.toUpperCase()+': '+issue.message, M+5, y+4); y += 7;
        if (issue.fix) {
          doc.setFillColor(240,249,255); doc.rect(M+5,y,W-2*M-5,7,'F');
          doc.setFont('helvetica','normal'); doc.setFontSize(8); doc.setTextColor(30,64,175);
          doc.text('Fix: '+issue.fix, M+7, y+4.5); y += 9;
        }
      });
    });
  }

  // Keywords (paid)
  if (plan !== 'free') {
    addPage();
    doc.setFillColor(...C.primary); doc.rect(0,y-M,W,20,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('Keyword Strategy', M, y+2); y += 25;
    doc.setFillColor(...C.primary); doc.rect(M,y,W-2*M,8,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(10); doc.setFont('helvetica','bold');
    doc.text('Keyword', M+3, y+5.5); doc.text('Count', W/2, y+5.5, {align:'center'});
    doc.text('Density', W-M-3, y+5.5, {align:'right'}); y += 8;
    audit.topKeywords.forEach((kw, i) => {
      checkSpace(8);
      doc.setFillColor(...(i%2===0 ? C.light : C.white)); doc.rect(M,y,W-2*M,7,'F');
      doc.setTextColor(...C.dark); doc.setFont('helvetica','normal'); doc.setFontSize(9);
      doc.text(kw.word, M+3, y+5); doc.text(String(kw.count), W/2, y+5, {align:'center'});
      doc.text(kw.density+'%', W-M-3, y+5, {align:'right'}); y += 7;
    });
  }

  // 90-day plan (paid)
  if (plan !== 'free') {
    addPage();
    doc.setFillColor(...C.primary); doc.rect(0,y-M,W,20,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('90-Day Action Plan', M, y+2); y += 25;
    const phases = [
      { title: 'Days 1-30: Critical Fixes', color: C.red, items: ['Fix missing title tags and meta descriptions','Add H1 tags to pages missing them','Fix broken images and missing alt text','Ensure mobile viewport on all pages','Fix HTTP error pages'] },
      { title: 'Days 31-60: Optimization', color: C.yellow, items: ['Optimize page load speeds (< 2s)','Add canonical tags','Improve internal linking','Expand thin content to 500+ words','Implement structured data'] },
      { title: 'Days 61-90: Growth', color: C.green, items: ['Build quality backlinks','Create keyword-targeted content','Set up Search Console monitoring','Optimize social sharing','Schedule monthly re-audits'] }
    ];
    phases.forEach(phase => {
      checkSpace(50);
      doc.setFillColor(...phase.color); doc.rect(M,y,W-2*M,8,'F');
      doc.setTextColor(255,255,255); doc.setFontSize(11); doc.setFont('helvetica','bold');
      doc.text(phase.title, M+3, y+5.5); y += 10;
      doc.setTextColor(...C.dark); doc.setFont('helvetica','normal'); doc.setFontSize(9);
      phase.items.forEach(item => { checkSpace(7); doc.text('  \u2022 '+item, M+3, y+4); y += 6; });
      y += 4;
    });
  }

  if (!removeBranding) {
    doc.setFontSize(8); doc.setTextColor(...C.gray);
    doc.text('Powered by Dabisoft IT Solutions | RankPilot SEO Audit', W/2, H-10, {align:'center'});
  }
  return Buffer.from(doc.output('arraybuffer'));
}
