export type PlanType = 'free' | 'diy' | 'whitelabel';
export type AppView = 'landing' | 'audit' | 'dashboard' | 'account' | 'history' | 'pricing' | 'reset-password';

export interface User {
  id: number;
  email: string;
  name: string;
  plan: PlanType;
  created_at: string;
}

export interface Issue {
  severity: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  recommendation: string;
  page?: string;
}

export interface PageStats {
  url: string;
  title: string;
  wordCount: number;
  h1Count: number;
  h1Text: string[];
  h2Count: number;
  h3Count: number;
  imageCount: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasLoremIpsum: boolean;
  loremIpsumSections: string[];
  duplicateSections: string[];
  titleLength: number;
  keywordDensity: Record<string, number>;
}

export interface CategoryScore {
  category: string;
  label: string;
  score: number;
  maxScore: number;
  issueCount: number;
}

export interface TechnicalChecks {
  isHttps: boolean;
  hasRobotsTxt: boolean;
  hasSitemap: boolean;
  sitemapUrls: number;
  googleIndexed: boolean;
  indexedPages: number;
  loadTimeMs: number;
}

export interface AuditResult {
  siteUrl: string;
  auditDate: string;
  overallScore: number;
  categoryScores: CategoryScore[];
  pages: PageStats[];
  issues: Issue[];
  technicalChecks: TechnicalChecks;
}

export interface AuditHistoryEntry {
  id: number;
  site_url: string;
  overall_score: number;
  created_at: string;
}

export const PLAN_CONFIG = {
  free: { name: 'Free', price: 0, auditsPerDay: 5, features: ['General SEO audit', '5 audits per day', 'Basic score report'] },
  diy: { name: 'DIY SEO', price: 15, auditsPerDay: -1, features: ['Unlimited audits', 'Full fix recommendations', 'Keyword analysis', '90-day action plan', 'Priority support'] },
  whitelabel: { name: 'White Label', price: 20, auditsPerDay: -1, features: ['Everything in DIY SEO', 'Detailed PDF download', 'Remove branding', 'Custom reports', 'Priority support'] },
};

export const PAYPAL_EMAIL = 'dumbele23@gmail.com';
export const SUPPORT_EMAIL = 'seo@dabisoftsolutions.com';
