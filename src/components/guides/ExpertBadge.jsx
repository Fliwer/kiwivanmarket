import React from 'react';
import { BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ExpertBadge({ className = "" }) {
    const { t } = useTranslation();
    return (
        <div title={t('guides.hub.guide_note', { defaultValue: 'A Kiwi Van Market guide. Check current official rules and vehicle documents before buying.' })} className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100 ${className}`}>
            <BookOpen size={14} className="text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-wider">{t('guides.hub.tag_verified', { defaultValue: 'Practical guide' })}</span>
        </div>
    );
}
