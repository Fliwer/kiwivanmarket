import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function ExpertBadge({ className = "" }) {
    return (
        <div className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 ${className}`}>
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-wider">Expert Verified</span>
        </div>
    );
}
