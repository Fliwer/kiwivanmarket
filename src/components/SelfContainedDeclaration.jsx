import React from 'react';
import { useTranslation } from 'react-i18next';
import selfContained from '../data/seo/self-contained';

export default function SelfContainedDeclaration({ value, onChange, originalVan = null, isEditMode = false }) {
    const { t, i18n } = useTranslation();
    const language = (i18n?.resolvedLanguage || i18n?.language || 'en').split('-')[0];
    const copy = selfContained.COPY[language] || selfContained.COPY.en;
    const keepLegacy = isEditMode && originalVan?.selfContained === true && originalVan.selfContainedType === 'blue';
    const keepUnspecified = isEditMode && originalVan?.selfContained === true && !['green', 'blue'].includes(originalVan.selfContainedType);
    const updateType = (type) => onChange({ selfContained: true, selfContainedType: type });

    return (
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={value.selfContained === true}
                    onChange={(event) => onChange({
                        selfContained: event.target.checked,
                        selfContainedType: !isEditMode && event.target.checked ? 'green' : value.selfContainedType,
                    })}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-medium text-gray-700">{copy.label}</span>
            </label>

            {value.selfContained === true && (
                <div className="space-y-3 ml-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="selfContainedType" value="green" checked={value.selfContainedType === 'green'} onChange={() => updateType('green')} />
                        <span>{t('self_contained_form.green', { defaultValue: 'Current green warrant (seller declaration)' })}</span>
                    </label>
                    {keepLegacy && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="selfContainedType" value="blue" checked={value.selfContainedType === 'blue'} onChange={() => updateType('blue')} />
                            <span>{t('self_contained_form.keep_blue', { defaultValue: 'Keep existing blue sticker record (legacy, not current certification)' })}</span>
                        </label>
                    )}
                    {keepUnspecified && (
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="selfContainedType" value="unspecified" checked={!['green', 'blue'].includes(value.selfContainedType)} onChange={() => updateType(originalVan.selfContainedType ?? '')} />
                            <span>{t('self_contained_form.keep_unspecified', { defaultValue: 'Keep existing record — certificate type unconfirmed' })}</span>
                        </label>
                    )}
                    <p className="text-sm text-slate-600">{selfContained.describe(value, language)}</p>
                </div>
            )}

            <p className="text-sm text-slate-600 leading-relaxed">{copy.guidance}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{t('self_contained_form.transition', { defaultValue: 'Blue warrants ceased to be recognised on 7 June 2026. A sticker alone does not prove current certification.' })}</p>
            {isEditMode && (
                <p className="text-xs text-slate-500">{t('self_contained_form.edit_note', { defaultValue: 'Your saved declaration stays unchanged unless you change these options. Only select a green warrant after checking your current documents.' })}</p>
            )}
            <a href={selfContained.SOURCE} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-emerald-700 underline">{copy.sourceLabel}</a>
        </div>
    );
}
