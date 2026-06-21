export interface User { id: string; email: string; name: string; plan: 'free' | 'diy' | 'whitelabel'; }
export interface Issue { severity: 'critical' | 'warning' | 'info'; message: string; fix?: string; }
export interface PageAnalysis {
  url: string; statusCode: number; loadTime: number;
  title: string; titleLength: number; metaDescription: string; metaDescLength: number;
  h1Count: number; h1Text: string[]; h2Count: number;
  imgTotal: number; imgMissingAlt: number; wordCount: number;
  internalLinks: number; externalLinks: number;
  hasCanonical: boolean; hasViewport: boolean;
  issues: Issue[]; score: number;
}
export interface SiteAudit {
  url: string; crawledAt: string; totalPages: number; overallScore: number;
  pages: PageAnalysis[];
  topKeywords: { word: string; count: number; density: number }[];
  summary: { criticalIssues: number; warnings: number; passed: number; avgLoadTime: number; avgWordCount: number; };
}
