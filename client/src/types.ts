export interface AuditResult {
  url: string;
  score: number;
  title: string;
  meta: string;
  h1: string[];
  h2: string[];
  images: { total: number; missingAlt: number };
  links: { internal: number; external: number; broken: number };
  issues: Issue[];
  keywords: { word: string; count: number; density: number }[];
  loadTime?: number;
  mobile?: { friendly: boolean; viewport: boolean };
  ssl?: boolean;
  canonical?: string;
  structured?: boolean;
  ogTags?: Record<string, string>;
  wordCount?: number;
  readability?: number;
}

export interface Issue {
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  fix?: string;
}

export interface SiteAudit {
  domain: string;
  pages: AuditResult[];
  overallScore: number;
  timestamp: string;
  keywordStrategy?: KeywordRec[];
  actionPlan?: ActionItem[];
}

export interface KeywordRec {
  keyword: string;
  volume?: string;
  difficulty?: string;
  priority: 'high' | 'medium' | 'low';
  targetPage?: string;
}

export interface ActionItem {
  week: string;
  task: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'done';
}

export type Tier = 'free' | 'diy' | 'whitelabel';

export interface User {
  id: number;
  email: string;
  name: string;
  tier: Tier;
}
