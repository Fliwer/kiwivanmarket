import React from 'react';

// Use the same questions and answers as SeoHead and the server-rendered page.
export default function SeoFaqSection({ title, faqs, className = '' }) {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className={`bg-white rounded-2xl border border-slate-100 p-6 md:p-8 ${className}`} aria-labelledby="listing-faqs-title">
      <h2 id="listing-faqs-title" className="text-2xl font-black text-slate-900 mb-6">{title}</h2>
      <div className="space-y-6">
        {faqs.map(({ q, a }) => (
          <div key={q}>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{q}</h3>
            <p className="text-slate-600 leading-relaxed">{a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
