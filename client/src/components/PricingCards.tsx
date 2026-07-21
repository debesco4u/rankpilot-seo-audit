import React, { useState, useEffect, useRef } from 'react';
import { PAYPAL_EMAIL, User } from '../types';

interface Props {
  token: string;
  currentPlan: string;
  user: User | null;
  onPlanChange: (plan: string) => void;
  onSignup: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    priceNum: 0,
    period: '/month',
    features: ['General SEO audit', '5 audits per day', 'Basic recommendations', 'Score overview'],
    cta: 'Current Plan',
  },
  {
    id: 'diy',
    name: 'DIY SEO',
    price: '$15',
    priceNum: 15,
    period: '/month',
    features: ['Advanced SEO audit', 'Unlimited audits', 'Detailed fix recommendations', 'Page-by-page analysis', 'Keyword strategy', '90-day action plan'],
    cta: 'Upgrade Now',
    popular: true,
  },
  {
    id: 'whitelabel',
    name: 'White Label',
    price: '$20',
    priceNum: 20,
    period: '/month',
    features: ['Everything in DIY SEO', 'Detailed PDF download', 'Remove Dabisoft branding', 'Custom branding support', 'Priority support', 'Client-ready reports'],
    cta: 'Upgrade Now',
  },
];

export const PricingCards: React.FC<Props> = ({ token, currentPlan, user, onPlanChange, onSignup }) => {
  const [processing, setProcessing] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [paypalWindow, setPaypalWindow] = useState<Window | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!paypalWindow || !showConfirm) return;
    const interval = setInterval(() => {
      if (paypalWindow.closed) {
        clearInterval(interval);
        setPaypalWindow(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [paypalWindow, showConfirm]);

  const handleUpgrade = (planId: string) => {
    if (planId === 'free' || planId === currentPlan) return;

    // Gate: must be logged in
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    setProcessing(planId);

    const returnUrl = `${window.location.origin}?payment=success&plan=${planId}`;
    const cancelUrl = `${window.location.origin}?payment=cancelled`;
    const params = new URLSearchParams({
      cmd: '_xclick',
      business: PAYPAL_EMAIL,
      item_name: `SEO Audit Tool - ${plan.name} Plan (Monthly)`,
      amount: String(plan.priceNum),
      currency_code: 'USD',
      return: returnUrl,
      cancel_return: cancelUrl,
      no_shipping: '1',
      no_note: '1',
    });

    const ppWindow = window.open(
      `https://www.paypal.com/cgi-bin/webscr?${params.toString()}`,
      '_blank',
      'width=800,height=600,scrollbars=yes'
    );

    setPaypalWindow(ppWindow);
    setProcessing(null);
    setShowConfirm(planId);
  };

  const handleConfirmPayment = async (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;
    setConfirming(true);
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ plan: planId, amount: plan.priceNum, txnRef: `paypal-${Date.now()}` }),
      });
      const data = await res.json();
      if (res.ok) {
        onPlanChange(planId);
        setShowConfirm(null);
        alert('🎉 Plan upgraded successfully!');
      } else {
        alert(data.error || 'Failed to upgrade plan.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const plan = params.get('plan');
    if (payment === 'success' && plan) {
      setShowConfirm(plan);
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (payment === 'cancelled') {
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <div className="py-8 px-4">
      <h2 className="text-2xl font-bold text-center mb-2">Choose Your Plan</h2>
      <p className="text-center text-base-content/60 mb-8">Unlock advanced SEO features to boost your rankings</p>

      {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-xl shadow-2xl max-w-sm w-full p-6 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h3 className="text-lg font-bold mb-2">Account Required</h3>
            <p className="text-base-content/70 mb-6">
              You need to create an account or sign in before upgrading to a paid plan.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPrompt(false);
                  onSignup();
                }}
                className="btn btn-primary btn-sm text-white"
              >
                Create Account / Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map(plan => (
          <div
            key={plan.id}
            className={`card bg-base-100 shadow-md hover:shadow-lg transition-shadow border-2 ${
              plan.popular ? 'border-primary' : 'border-base-200'
            } ${currentPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                MOST POPULAR
              </div>
            )}
            <div className="card-body relative pt-6">
              <h3 className="text-lg font-bold text-base-content">{plan.name}</h3>
              <div className="mt-1 mb-4">
                <span className="text-3xl font-bold text-base-content">{plan.price}</span>
                <span className="text-base-content/50 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-success mt-0.5">✓</span>
                    <span className="text-base-content/80">{f}</span>
                  </li>
                ))}
              </ul>

              {showConfirm === plan.id ? (
                <div className="space-y-2">
                  <p className="text-xs text-center text-base-content/60">
                    Completed your PayPal payment?
                  </p>
                  <button
                    onClick={() => handleConfirmPayment(plan.id)}
                    disabled={confirming}
                    className="btn btn-success btn-sm w-full text-white"
                  >
                    {confirming ? 'Confirming...' : '✓ I\'ve Paid — Activate Plan'}
                  </button>
                  <button
                    onClick={() => setShowConfirm(null)}
                    className="btn btn-ghost btn-xs w-full"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={currentPlan === plan.id || processing === plan.id}
                  className={`btn btn-sm w-full ${
                    currentPlan === plan.id
                      ? 'btn-disabled'
                      : plan.popular
                      ? 'btn-primary text-white'
                      : 'btn-neutral text-white'
                  }`}
                >
                  {processing === plan.id ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : currentPlan === plan.id ? (
                    '✓ Current Plan'
                  ) : (
                    plan.cta
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-base-content/40 mt-6">
        Payments are securely processed through PayPal. Plans renew monthly.
      </p>
    </div>
  );
};
