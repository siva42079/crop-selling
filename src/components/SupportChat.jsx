import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// Simple keyword-matching dummy advisor — no backend needed
const BOT_RULES = [
  { match: ['paddy', 'rice'], answer: 'For kharif paddy: use Arize 6444 Gold (8–10 kg/acre, 20×15 cm spacing) and apply NPK per soil test. Want me to show paddy seeds?', link: '/shop?category=seeds&q=paddy', linkText: 'View paddy seeds' },
  { match: ['cotton', 'bollworm'], answer: 'Spray Ampligo (80 ml/acre) at first bollworm sighting and keep 5 pheromone traps/acre. Never spray in peak bee hours.', link: '/shop?category=crop-protection', linkText: 'View crop protection' },
  { match: ['urea', 'nano'], answer: 'IFFCO Nano Urea Plus: 2–4 ml per litre, spray at vegetative & flowering stages. It replaces up to 50% of urea need.', link: '/product/p-015', linkText: 'Buy Nano Urea' },
  { match: ['deliver', 'shipping', 'dispatch'], answer: 'We deliver in 1–4 days. Orders above ₹999 ship FREE; below that a flat ₹40 applies. Remote villages may take +1 day.' },
  { match: ['return', 'refund'], answer: 'Damaged/wrong item? Report within 48 hours via the helpline 1800-000-0000 with order ID + photos. Refund in 3–5 working days.' },
  { match: ['coupon', 'discount', 'offer'], answer: 'Try coupon FARM10 at cart for 10% off up to ₹500. New users get free delivery on their first order.' },
  { match: ['organic', 'neem'], answer: 'For organic fields, combine vermicompost (2–3 t/acre) with neem cake as basal. It suppresses soil pests naturally.', link: '/shop?category=organic', linkText: 'Shop organic' },
  { match: ['track', 'order'], answer: 'You can track your order anytime with the ID like FP1001 on the Track Order page.', link: '/track', linkText: 'Track order' },
];
const DEFAULT_ANSWER = 'Namaste! I can help with crops, products and orders. Try asking about paddy, cotton, Nano Urea, delivery or FARM10. For urgent help call 1800-000-0000 (8 AM–8 PM).';

const QUICK_CHIPS = ['Paddy advice', 'Nano Urea dosage', 'Delivery time', 'FARM10 coupon'];

/** Floating green support button + small chat popup with a dummy advisor */
export default function SupportChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Namaste! 🌱 I am Farmer Advisor, your free agronomy assistant. Ask me anything about crops or your orders.' },
  ]);
  const bodyRef = useRef(null);

  // Auto-scroll the chat body on new messages
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = (raw) => {
    const text = String(raw).trim();
    if (!text) return;
    const rule = BOT_RULES.find((r) => r.match.some((m) => text.toLowerCase().includes(m)));
    const reply = rule ? rule.answer : DEFAULT_ANSWER;
    setMessages((m) => [...m, { role: 'user', text }, { role: 'bot', text: reply, link: rule?.link, linkText: rule?.linkText }]);
    setInput('');
  };

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="farmer-advisor-popup"
        aria-label={open ? 'Close support chat' : 'Open support chat — Farmer Advisor'}
        className="fixed bottom-5 right-4 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-brand-700 text-3xl shadow-[var(--shadow-lift)] ring-4 ring-white transition hover:scale-105 hover:bg-brand-800 active:scale-95 dark:ring-stone-950"
      >
        {open ? <span aria-hidden="true" className="text-2xl text-white">✕</span> : <span aria-hidden="true">🧑‍🌾</span>}
        {!open && <span className="absolute -right-1 -top-1 flex h-5 w-5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-400 opacity-75" /><span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent-500 text-[9px] font-black text-amber-950">1</span></span>}
      </button>

      {/* Popup */}
      {open && (
        <div id="farmer-advisor-popup" role="dialog" aria-label="Farmer Advisor chat" className="fixed bottom-24 right-4 z-40 flex h-[480px] w-[min(92vw,360px)] flex-col overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-2xl dark:border-stone-800 dark:bg-stone-900">
          {/* Header */}
          <div className="flex items-center gap-2 bg-brand-800 p-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl" aria-hidden="true">🧑‍🌾</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold leading-tight">Farmer Advisor</p>
              <p className="text-[10px] text-brand-200">● Online · replies instantly (demo)</p>
            </div>
            <a href="tel:18000000000" className="rounded-xl bg-white/10 px-2.5 py-1.5 text-[10px] font-extrabold hover:bg-white/20">📞 1800-000-0000</a>
          </div>

          {/* Messages */}
          <div ref={bodyRef} className="nice-scroll flex-1 space-y-2 overflow-y-auto p-3" aria-live="polite">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === 'user' ? 'ml-auto rounded-br-md bg-brand-700 text-white' : 'rounded-bl-md bg-brand-50 text-stone-700 dark:bg-stone-800 dark:text-stone-100'}`}>
                {m.text}
                {m.link && <Link to={m.link} onClick={() => setOpen(false)} className="mt-1.5 block font-bold text-brand-800 underline dark:text-brand-300">{m.linkText} →</Link>}
              </div>
            ))}
          </div>

          {/* Quick chips */}
          <div className="flex gap-1.5 overflow-x-auto px-3 pb-1.5" aria-label="Suggested questions">
            {QUICK_CHIPS.map((chip) => (
              <button key={chip} type="button" onClick={() => send(chip)} className="whitespace-nowrap rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-900 transition hover:bg-brand-100 dark:border-stone-700 dark:bg-stone-800 dark:text-brand-200">{chip}</button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-center gap-2 border-t border-stone-200 p-2 dark:border-stone-800">
            <label htmlFor="chat-input" className="sr-only">Type your question</label>
            <input id="chat-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about crops, orders…" className="h-10 flex-1 rounded-full border border-stone-200 bg-stone-50 px-4 text-xs outline-none focus:border-brand-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100" />
            <button type="submit" aria-label="Send message" className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-white transition hover:bg-brand-800 active:scale-95">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M3.4 20.4l17.5-8.4a.8.8 0 000-1.4L3.4 2.2a.8.8 0 00-1 .8l1.8 7.3a.8.8 0 00.6.6l9.2 1.1-9.2 1.1a.8.8 0 00-.6.6l-1.8 7.3a.8.8 0 001 1z"/></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
