import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
    success: <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />,
    error: <XCircle size={20} className="text-red-500 flex-shrink-0" />,
    warning: <AlertTriangle size={20} className="text-amber-500 flex-shrink-0" />,
    info: <Info size={20} className="text-blue-500 flex-shrink-0" />,
};

const BORDER = {
    success: 'border-l-emerald-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    info: 'border-l-blue-500',
};

function ToastItem({ id, type = 'info', message, onRemove }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(id), 4000);
        return () => clearTimeout(timer);
    }, [id, onRemove]);

    return (
        <div
            className={`flex items-center gap-3 bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-slate-100 border-l-4 ${BORDER[type]} px-4 py-3 min-w-[280px] max-w-sm animate-slide-in-right`}
        >
            {ICONS[type]}
            <p className="flex-1 text-sm font-semibold text-slate-800 leading-snug">{message}</p>
            <button
                onClick={() => onRemove(id)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors flex-shrink-0"
            >
                <X size={14} />
            </button>
        </div>
    );
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const remove = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
    }, []);

    toast.success = (msg) => toast(msg, 'success');
    toast.error = (msg) => toast(msg, 'error');
    toast.warning = (msg) => toast(msg, 'warning');
    toast.info = (msg) => toast(msg, 'info');

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem {...t} onRemove={remove} />
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        // Fallback: return a no-op so old components don't crash if not wrapped
        const noop = () => { };
        noop.success = noop; noop.error = noop; noop.warning = noop; noop.info = noop;
        return noop;
    }
    return ctx;
}

export default ToastProvider;
