import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, MessageSquare, Send, CheckCircle, Shield, Clock, MapPin, AlertCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import SeoHead from './SeoHead';
import { useHideLoader } from '../hooks/useHideLoader';

export default function ContactPage() {
    useHideLoader();
    const { t } = useTranslation();
    const [status, setStatus] = useState('idle'); // idle, sending, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '', company: '' });

    const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('sending');
        setErrorMsg('');
        try {
            const sendContactMessage = httpsCallable(functions, 'sendContactMessage');
            await sendContactMessage(form);
            setStatus('success');
            setForm({ name: '', email: '', subject: '', message: '', company: '' });
        } catch (err) {
            console.error('Contact form error:', err);
            setStatus('error');
            setErrorMsg(err?.message || 'Could not send your message. Please try again, or email us directly at kiwivanmarket.contact@gmail.com.');
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFC] pb-24">
            <SeoHead
                title={`${t('footer.contact')} | Kiwi Van Market`}
                description="Get in touch with the Kiwi Van Market team. We're here to help with your campervan journey in New Zealand."
                type="website"
            />

            {/* Premium Header */}
            <header className="relative bg-white pt-24 pb-20 overflow-hidden border-b border-gray-100">

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="h-px w-12 bg-emerald-600" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">Get in Touch</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
                            How can we <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 italic">
                                help you?
                            </span>
                        </h1>
                        <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                            Have questions about buying, selling, or just want to chat about vanlife in New Zealand? Our team is ready to assist.
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 mt-16">
                <div className="grid lg:grid-cols-2 gap-16 items-start">

                    {/* Left: Contact Info & Trust */}
                    <div className="space-y-12">
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                                    <Mail size={24} />
                                </div>
                                <h3 className="font-black text-slate-900 mb-2">Email Us</h3>
                                <p className="text-slate-500 text-sm mb-4">For general inquiries and support.</p>
                                <a href="mailto:kiwivanmarket.contact@gmail.com" className="text-emerald-600 font-bold hover:underline break-all">
                                    kiwivanmarket.contact@gmail.com
                                </a>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
                                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                    <Clock size={24} />
                                </div>
                                <h3 className="font-black text-slate-900 mb-2">Typical Response</h3>
                                <p className="text-slate-500 text-sm mb-4">We usually get back to you within</p>
                                <p className="text-blue-600 font-bold">24-48 Hours</p>
                            </div>
                        </div>

                        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                            <h3 className="text-2xl font-black mb-6 relative z-10">Safe & Trusted Marketplace</h3>
                            <div className="space-y-4 relative z-10">
                                <div className="flex items-start gap-3">
                                    <Shield size={20} className="text-emerald-400 mt-1 flex-shrink-0" />
                                    <p className="text-slate-400 text-sm italic">"We take fraud and safety seriously. Contact us immediately if you notice suspicious behavior."</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle size={20} className="text-emerald-400 mt-1 flex-shrink-0" />
                                    <p className="text-slate-400 text-sm italic">"Our guides are verified by experts to ensure you get the best advice for your journey."</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 inline-flex">
                            <MapPin size={20} className="text-emerald-600" />
                            <span className="text-emerald-800 font-bold text-sm uppercase tracking-widest">Base: Auckland, New Zealand</span>
                        </div>
                    </div>

                    {/* Right: Contact Form */}
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-12">
                        {status === 'success' ? (
                            <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-6">
                                    <CheckCircle size={40} />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Message Sent!</h2>
                                <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                    Thank you for reaching out. A team member will get back to you shortly at your provided email address.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center gap-3 mb-10 text-slate-400">
                                    <MessageSquare size={20} />
                                    <span className="text-xs font-black uppercase tracking-widest">Direct Message</span>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={form.name}
                                                onChange={setField('name')}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Your Email</label>
                                            <input
                                                required
                                                type="email"
                                                value={form.email}
                                                onChange={setField('email')}
                                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                                        <input
                                            required
                                            type="text"
                                            value={form.subject}
                                            onChange={setField('subject')}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all"
                                            placeholder="How can we help?"
                                        />
                                        {/* Honeypot anti-bot (invisible) */}
                                        <input
                                            type="text"
                                            name="company"
                                            value={form.company}
                                            onChange={setField('company')}
                                            tabIndex={-1}
                                            autoComplete="off"
                                            aria-hidden="true"
                                            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Message</label>
                                        <textarea
                                            required
                                            rows="5"
                                            value={form.message}
                                            onChange={setField('message')}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none"
                                            placeholder="Write your message here..."
                                        ></textarea>
                                    </div>

                                    {status === 'error' && (
                                        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
                                            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm text-red-700">{errorMsg}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'sending'}
                                        className={`w-full py-5 rounded-2xl font-black text-white shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group ${status === 'sending' ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-200'
                                            }`}
                                    >
                                        {status === 'sending' ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                SENDING...
                                            </>
                                        ) : (
                                            <>
                                                SEND MESSAGE
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
