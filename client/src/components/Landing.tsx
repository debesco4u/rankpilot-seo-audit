import React from 'react';
import { Search, Shield, Zap, FileText, BarChart3, Globe } from 'lucide-react';
import { SUPPORT_EMAIL } from '../types';

interface LandingProps {
  onAnalyse: () => void;
  onSignup: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onAnalyse, onSignup }) => (
  <div>
    {/* Hero */}
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-4">
          Boost Your Website&apos;s SEO with AI-Powered Audits
        </h1>
        <p className="text-lg md:text-xl text-base-content/70 mb-8 max-w-2xl mx-auto">
          Get a comprehensive SEO analysis of your entire website. Discover issues, get fix recommendations, and boost your search rankings.
        </p>
        <button onClick={onAnalyse} className="btn btn-primary btn-lg text-white gap-2">
          <Search size={20} /> Analyse Now
        </button>
      </div>
    </section>

    {/* Features */}
    <section className="bg-base-200 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-base-content">
          Everything You Need for Better Rankings
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Globe, title: 'Full Site Crawl', desc: 'Audits ALL pages — not just the homepage. Discover hidden issues across your entire site.' },
            { icon: Shield, title: 'Technical SEO', desc: 'Check HTTPS, robots.txt, sitemaps, and more. Fix critical technical issues holding you back.' },
            { icon: Zap, title: 'AI-Powered Analysis', desc: 'Smart scoring and prioritized recommendations so you know exactly what to fix first.' },
            { icon: FileText, title: 'Detailed Reports', desc: 'Color-coded reports with page-by-page analysis, keyword density, and fix recommendations.' },
            { icon: BarChart3, title: 'Score Tracking', desc: 'Track your SEO score over time. See how your fixes improve your rankings.' },
            { icon: Search, title: '90-Day Action Plan', desc: 'Get a structured roadmap with quick wins, foundation building, and growth strategies.' },
          ].map((f, i) => (
            <div key={i} className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="card-body items-center text-center">
                <f.icon size={32} className="text-primary mb-2" />
                <h3 className="card-title text-base-content">{f.title}</h3>
                <p className="text-sm text-base-content/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="bg-primary py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Ready to Improve Your SEO?
        </h2>
        <p className="text-white/80 mb-8">
          Sign up free and get 5 audits per day. No credit card required.
        </p>
        <button onClick={onSignup} className="btn btn-lg bg-white text-primary hover:bg-base-200 border-0">
          Get Started Free
        </button>
        <p className="text-white/60 text-sm mt-4">
          Need help? <a href={`mailto:${SUPPORT_EMAIL}`} className="underline text-white">{SUPPORT_EMAIL}</a>
        </p>
      </div>
    </section>
  </div>
);
