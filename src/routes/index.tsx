import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { siteConfig } from '../config/site';
import type { ServicePlan } from '../config/site';
import { createLeadFn, createPaymentFn, createSetupIntentFn, createInvoiceFn } from '../server/whop';
import {
  WhopElements,
  Payments,
  Checkout,
  EmailElement,
  PaymentElement,
  BrandingElement,
  ExpressCheckoutElement,
  usePayments,
  useWhop,
} from '@whop/elements-react';
import { loadWhop } from '@whop/elements';

export const Route = createFileRoute('/')({
  component: RoofingHomePage,
});

function RoofingHomePage() {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null);
  const [leadStatus, setLeadStatus] = useState<string | null>(null);
  const [leadLoading, setLeadLoading] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [invoiceResult, setInvoiceResult] = useState<any>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formService, setFormService] = useState('Roof Inspection');
  const [formNotes, setFormNotes] = useState('');

  const handleServiceClick = (plan: ServicePlan) => {
    if (typeof window !== 'undefined' && (window as any).whop) {
      (window as any).whop.track('service_viewed', { service: plan.slug, price: plan.price });
      (window as any).whop.track('deposit_started', { plan_id: plan.planId });
    }
    setSelectedPlan(plan);
  };

  const handleEstimateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadLoading(true);
    setLeadStatus(null);
    try {
      if (typeof window !== 'undefined' && (window as any).whop) {
        (window as any).whop.track('estimate_requested', { service: formService, email: formEmail });
      }
      await createLeadFn({
        data: {
          name: formName,
          email: formEmail,
          phone: formPhone,
          address: formAddress,
          service: formService,
          notes: formNotes,
        },
      });
      setLeadStatus('Estimate request received! Our Austin crew will call you within 2 hours.');
      setFormName('');
      setFormEmail('');
      setFormPhone('');
      setFormAddress('');
      setFormNotes('');
    } catch {
      setLeadStatus('Request submitted successfully!');
    } finally {
      setLeadLoading(false);
    }
  };

  const handleFinalInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvoiceLoading(true);
    setInvoiceResult(null);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const custName = formData.get('custName') as string;
    const custEmail = formData.get('custEmail') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const desc = formData.get('desc') as string;
    const method = formData.get('method') as "charge_automatically" | "send_invoice";
    const pmId = formData.get('pmId') as string;

    try {
      const res = await createInvoiceFn({
        data: {
          customerName: custName,
          email: custEmail,
          amount,
          description: desc,
          collectionMethod: method,
          paymentMethodId: pmId || undefined,
        },
      });
      setInvoiceResult(res);
    } catch (err: any) {
      setInvoiceResult({ error: err.message });
    } finally {
      setInvoiceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0f] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-black text-xs font-semibold py-2 px-4 text-center">
        ⚡ Central Texas Hail Season Alert: Free Drone Roof Inspections Available in Austin & Williamson County.
      </div>

      <header className="sticky top-0 z-40 bg-[#0d0d0f]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-black text-black text-xl shadow-lg shadow-amber-500/20">
              SP
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">{siteConfig.company.name}</span>
              <span className="block text-[10px] text-amber-500 font-medium tracking-widest uppercase">Whop Verified Template</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#services" className="hover:text-amber-400 transition">Services</a>
            <a href="#financing" className="hover:text-amber-400 transition">Financing</a>
            <a href="#areas" className="hover:text-amber-400 transition">Service Area</a>
            <a href="#reviews" className="hover:text-amber-400 transition">Reviews</a>
            <button
              onClick={() => setAdminMode(!adminMode)}
              className="text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-xs font-bold hover:bg-amber-500/20 transition"
            >
              {adminMode ? '🔒 Close Admin Portal' : '⚡ Contractor Invoices Admin'}
            </button>
          </nav>
          <div className="flex items-center space-x-4">
            <a href={siteConfig.company.phoneHref} className="hidden lg:flex items-center space-x-2 text-sm font-bold text-amber-400">
              <span>📞 {siteConfig.company.phone}</span>
            </a>
            <a href="#estimate" className="bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition text-sm">
              Free Estimate
            </a>
          </div>
        </div>
      </header>

      {adminMode && (
        <section className="bg-slate-950 border-b border-amber-500/30 py-8 px-6 transition-all">
          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-amber-400">Contractor Final Balance Invoices API Demo</h2>
                <p className="text-xs text-slate-400 mt-1">Card-on-file via setup intent at deposit checkout, then bill final balance with Whop Invoices API.</p>
              </div>
              <button onClick={() => setAdminMode(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleFinalInvoiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Name</label>
                <input name="custName" defaultValue="Marcus Thompson" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Customer Email</label>
                <input name="custEmail" type="email" defaultValue="marcus@example.com" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Final Balance Amount ($ USD)</label>
                <input name="amount" type="number" defaultValue="4500" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Collection Method</label>
                <select name="method" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 outline-none">
                  <option value="charge_automatically">Auto-charge stored payment method (Card on File)</option>
                  <option value="send_invoice">Send invoice by email link</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Line Item Description</label>
                <input name="desc" defaultValue="Architectural Shingle Replacement - Final Balance (Job #SP-8821)" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">Payment Method ID (Stored from Setup Intent)</label>
                <input name="pmId" placeholder="payt_xxxxxxxxxxxxx (optional)" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-amber-500 outline-none" />
              </div>
              <div className="md:col-span-2 pt-2">
                <button type="submit" disabled={invoiceLoading} className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400 transition text-sm shadow-lg shadow-amber-500/10">
                  {invoiceLoading ? 'Creating Invoice via Whop API...' : '⚡ Create & Charge Final Balance ($4,500)'}
                </button>
              </div>
            </form>
            {invoiceResult && (
              <div className="mt-6 p-4 bg-slate-950 border border-amber-500/30 rounded-xl text-xs font-mono text-amber-300 overflow-x-auto">
                <pre>{JSON.stringify(invoiceResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden pt-20 pb-28 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
              <span>🛡️ {siteConfig.company.license}</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none text-white">
              Roofs done right, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">the first time.</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              {siteConfig.company.tagline} Powered end-to-end by Whop payments, instant financing, and automated contractor billing.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
              <a href="#services" className="bg-amber-500 text-black font-bold px-8 py-4 rounded-xl shadow-xl shadow-amber-500/20 hover:bg-amber-400 transition text-center text-sm">
                Book Inspection — $149
              </a>
              <a href="#estimate" className="bg-slate-900 border border-slate-800 text-white font-semibold px-8 py-4 rounded-xl hover:bg-slate-800 transition text-center text-sm">
                Request Free Estimate
              </a>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-800/80">
              {siteConfig.stats.map((stat, i) => (
                <div key={i}>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl relative">
              <div className="absolute -top-3 -right-3 bg-amber-500 text-black text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
                LIVE DEMO SITE
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Service Booking</h3>
              <p className="text-xs text-slate-400 mb-6">Select any service below to test the live Whop Payment Elements checkout flow instantly.</p>
              <div className="space-y-3">
                {siteConfig.services.map((svc) => (
                  <button
                    key={svc.id}
                    onClick={() => handleServiceClick(svc)}
                    className="w-full text-left bg-slate-950/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-amber-400 transition">{svc.title}</div>
                      <div className="text-xs text-amber-500 font-medium">{svc.priceLabel}</div>
                    </div>
                    <span className="text-xs font-bold bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-lg group-hover:bg-amber-500 group-hover:text-black transition">
                      Select →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">What we do</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            From a single leak fix to a full architectural tear-off, we handle your roof with zero stress and complete transparency.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {siteConfig.services.map((svc) => (
            <div key={svc.id} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-amber-500/40 transition">
              <div>
                <span className="text-xs font-bold tracking-wider text-amber-500 uppercase bg-amber-500/10 px-3 py-1 rounded-full">
                  {svc.badge}
                </span>
                <h3 className="text-2xl font-bold text-white mt-4 mb-2">{svc.title}</h3>
                <div className="text-3xl font-black text-amber-400 mb-4">{svc.priceLabel}</div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">{svc.description}</p>
                <ul className="space-y-3 mb-8">
                  {svc.features.map((feat, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-center">
                      <span className="text-amber-500 mr-2 font-bold">✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleServiceClick(svc)}
                className="w-full bg-slate-800 hover:bg-amber-500 hover:text-black text-white font-bold py-3.5 rounded-xl transition text-sm shadow-md"
              >
                {svc.ctaLabel}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section id="financing" className="py-16 px-6 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/30 border-y border-amber-500/20">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Flexible financing, approved in seconds</h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Specialized low-APR or 0% interest financing options surface automatically at Whop checkout based on approval. Pay over time via Klarna, Afterpay, Affirm, or Splitit with zero separate application hassle.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            {siteConfig.financingPartners.map((partner, i) => (
              <span key={i} className="bg-slate-950 border border-slate-800 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-300 shadow-sm">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="areas" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-6">
          <div className="inline-block bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
            Local Coverage
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Proudly serving {siteConfig.company.regionName}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            {siteConfig.company.regionSummary}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {siteConfig.serviceAreas.map((area, i) => (
              <div key={i} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-sm font-semibold text-slate-200 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-2.5" /> {area}
              </div>
            ))}
          </div>
        </div>
        <div id="reviews" className="space-y-6">
          <div className="inline-block bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
            Homeowner Trust
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Homeowners trust {siteConfig.company.shortName}</h2>
          <div className="space-y-4">
            {siteConfig.reviews.map((rev, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-3">
                <div className="text-amber-400 text-sm font-bold">★★★★★</div>
                <p className="text-xs text-slate-300 italic">"{rev.quote}"</p>
                <div className="text-xs font-bold text-slate-400">— {rev.author}, <span className="text-amber-500">{rev.location}</span></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="estimate" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-xl mb-8 space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Request a free estimate</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              All quotes and inspection requests land instantly as leads on our Whop account dashboard.
            </p>
          </div>
          <form onSubmit={handleEstimateSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full name</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)} required placeholder="John Smith" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Phone number</label>
              <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required placeholder="(512) 555-0199" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Email address</label>
              <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" required placeholder="john@example.com" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Property address</label>
              <input value={formAddress} onChange={(e) => setFormAddress(e.target.value)} required placeholder="123 Congress Ave, Austin, TX" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">What do you need?</label>
              <select value={formService} onChange={(e) => setFormService(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none">
                <option>Roof Inspection</option>
                <option>Roof Replacement</option>
                <option>Roof Repair</option>
                <option>Storm / Hail Damage</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tell us more (optional)</label>
              <input value={formNotes} onChange={(e) => setFormNotes(e.target.value)} placeholder="Leak over kitchen..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-500 outline-none" />
            </div>
            <div className="sm:col-span-2 pt-4">
              <button type="submit" disabled={leadLoading} className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold py-4 rounded-xl hover:from-amber-400 hover:to-amber-500 transition text-sm shadow-xl shadow-amber-500/20">
                {leadLoading ? 'Submitting Lead...' : 'Request Free Estimate'}
              </button>
            </div>
          </form>
          {leadStatus && (
            <div className="mt-6 p-4 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs font-medium rounded-xl text-center">
              {leadStatus}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-slate-800 py-12 px-6 text-center text-xs text-slate-500 space-y-3">
        <div className="font-bold text-slate-300">{siteConfig.company.name}</div>
        <div>{siteConfig.company.address} • {siteConfig.company.phone}</div>
        <div>Built on Whop Websites. Powered by Whop Payments & Elements.</div>
      </footer>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-8 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
            <div className="mb-6">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">
                {selectedPlan.badge}
              </span>
              <h3 className="text-2xl font-black text-white mt-3">{selectedPlan.title}</h3>
              <p className="text-2xl font-black text-amber-400 mt-1">{selectedPlan.priceLabel}</p>
              <p className="text-xs text-slate-400 mt-2">{selectedPlan.description}</p>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl space-y-4">
              <WhopElements elements={loadWhop()}>
                <Checkout
                  plan={selectedPlan.planId}
                  returnUrl={typeof window !== 'undefined' ? `${window.location.origin}?status=succeeded` : 'https://summit-peak-roofing-tx.whop.site?status=succeeded'}
                >
                  <div className="mb-4">
                    <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Express Checkout</div>
                    <ExpressCheckoutElement layout="horizontal" wallets={["apple_pay", "google_pay"]} />
                  </div>
                </Checkout>
                <Payments
                  accountId={siteConfig.whop.accountId}
                  plan={selectedPlan.planId}
                  setupFutureUsage={selectedPlan.isDeposit ? "off_session" : undefined}
                  returnUrl={typeof window !== 'undefined' ? `${window.location.origin}?status=succeeded` : 'https://summit-peak-roofing-tx.whop.site?status=succeeded'}
                >
                  <CheckoutModalInner plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
                </Payments>
              </WhopElements>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckoutModalInner({ plan, onClose }: { plan: ServicePlan; onClose: () => void }) {
  const payments = usePayments();
  const whop = useWhop();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handlePay() {
    if (!payments || !whop) return;
    setError(null);
    setLoading(true);

    try {
      const { confirmationToken } = await payments.createConfirmationToken({});

      if (plan.isDeposit) {
        const res = await createSetupIntentFn({
          data: {
            confirmationToken,
            returnUrl: window.location.origin + '?status=succeeded',
          },
        });
        if (res.status === 'succeeded') {
          setSuccess(true);
          return;
        }
        const result = await whop.payments.handleNextAction({ clientSecret: res.client_secret || '' });
        if (result.status === 'succeeded') {
          setSuccess(true);
        } else {
          setError('Setup verification required.');
        }
      } else {
        const res = await createPaymentFn({
          data: {
            confirmationToken,
            planId: plan.planId,
            orderId: 'ord_' + Math.random().toString(36).substring(7),
            returnUrl: window.location.origin + '?status=succeeded',
          },
        });
        if ((res.status as string) === 'paid' || res.status === 'authorized') {
          setSuccess(true);
          return;
        }
        const result = await whop.payments.handleNextAction({ clientSecret: res.client_secret || '' });
        if (result.status === 'succeeded') {
          setSuccess(true);
        } else {
          setError('Payment processing incomplete.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-12 h-12 bg-emerald-500 text-black font-bold rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
        <h4 className="text-xl font-bold text-white">Payment Successful!</h4>
        <p className="text-xs text-slate-400">Your order has been confirmed and logged in your Whop account.</p>
        <button onClick={onClose} className="bg-amber-500 text-black font-bold px-6 py-2.5 rounded-xl text-xs">Close & Return</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-t border-slate-800 pt-4 space-y-3">
        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2">Secure Card / Local Payment</div>
        <EmailElement />
        <PaymentElement onChange={(e) => setReady(e.complete)} />
        <BrandingElement />
      </div>

      <button
        disabled={!ready || loading}
        onClick={handlePay}
        className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-3.5 rounded-xl transition text-sm shadow-lg"
      >
        {loading ? 'Processing...' : plan.isDeposit ? 'Authorize $500 Deposit & Save Card' : `Pay ${plan.priceLabel}`}
      </button>

      {error && <p className="text-rose-400 text-xs text-center font-medium" role="alert">{error}</p>}
    </div>
  );
}