import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Trash2, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const TYPES = {
    danger: {
        icon: <Trash2 size={24} className="text-red-500" />,
        bg: 'bg-red-50',
        border: 'border-red-100',
        button: 'bg-red-600 hover:bg-red-700 shadow-red-200',
        buttonText: 'text-white'
    },
    warning: {
        icon: <AlertTriangle size={24} className="text-amber-500" />,
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-200',
        buttonText: 'text-white'
    },
    info: {
        icon: <Info size={24} className="text-blue-500" />,
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
        buttonText: 'text-white'
    },
    success: {
        icon: <CheckCircle2 size={24} className="text-emerald-500" />,
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
        buttonText: 'text-white'
    }
};

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Are you sure?',
    message = 'This action cannot be undone.',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}) {
    // Lock scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && !isLoading) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose, isLoading]);

    const style = TYPES[type] || TYPES.danger;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => !isLoading && onClose()}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl shadow-slate-900/40 w-full max-w-md overflow-hidden border border-slate-100"
                    >
                        <div className="p-8 pb-4 flex flex-col items-center text-center">
                            {/* Icon Circle */}
                            <div className={`w-16 h-16 ${style.bg} rounded-3xl flex items-center justify-center mb-6 border-2 ${style.border}`}>
                                {style.icon}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
                                {title}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6">
                                {message}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="p-8 pt-4 bg-slate-50/50 flex gap-3">
                            <button
                                disabled={isLoading}
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {cancelText}
                            </button>
                            <button
                                disabled={isLoading}
                                onClick={onConfirm}
                                className={`flex-1 px-6 py-4 rounded-2xl ${style.button} ${style.buttonText} font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-50`}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    confirmText
                                )}
                            </button>
                        </div>

                        {/* Close button */}
                        <button
                            disabled={isLoading}
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
