import React, { useState } from 'react';

interface Props {
  token: string;
  currentPlan: string;
  onPlanChange: (plan: string) => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['General SEO audit', '5 audits per day', 'Basic recommendations', 'Score overview'],
    cta: 'Current Plan',
  },
  {
    id: 'diy',
    name: 'DIY SEO',
    price: '$15',
    period: '/month',
    features: ['Advanced SEO audit', 'Unlimited audits', 'Detailed fix recommendations', 'Page-by-page analysis', 'Keyword strategy', '90-day action plan'],
    cta: 'Upgrade Now',
    popular: true,
  },
  {
    id: 'whitelabel',
    name: 'White Label',
    price: '$20',
    period: '/month',
    features: ['Everything in DIY SEO', 'Detailed PDF download', 'Remove Dabisoft branding', 'Custom branding support', 'Priority support', 'Client-ready reports'],
    cta: 'Upgrade Now',
  },
];

export const PricingCards: React.FC<Props> = ({ token, currentPlan, onPlanChange }) => {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free' || planId === currentPlan) return;
    setProcessing(planId);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId }),
      });
      const data = await res.json();
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else if (data.success) {
        onPlanChange(planId);
      }
    } catch (e) {
      alert('Payment error. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h2>
      <p className="text-center text-gray-600 mb-8">Unlock advanced SEO features to boost your rankings</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`relative rounded-xl border-2 p-6 bg-white transition-shadow hover:shadow-lg ${
              plan.popular ? 'border-green-500 shadow-md' : 'border-gray-200'
            } ${currentPlan === plan.id ? 'ring-2 ring-green-500' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <h3 className="text-lg font-bold mt-2">{plan.name}</h3>
            <div className="mt-2 mb-4">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-gray-500 text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={currentPlan === plan.id || processing === plan.id}
              className={`w-full py-2 rounded-lg font-semibold text-sm transition ${
                currentPlan === plan.id
                  ? 'bg-gray-100 text-gray-500 cursor-default'
                  : plan.popular
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {processing === plan.id ? 'Processing...' : currentPlan === plan.id ? '✓ Current Plan' : plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
