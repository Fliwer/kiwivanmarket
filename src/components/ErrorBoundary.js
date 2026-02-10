import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        // You can also log the error to an error reporting service
    }

    handleReload = () => {
        window.location.reload();
    };

    handleReset = () => {
        // Try to clear local storage if it's the cause
        try {
            window.localStorage.clear();
            window.sessionStorage.clear();
        } catch (e) {
            console.warn("Could not clear storage", e);
        }
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        </div>

                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>

                        <p className="text-gray-600 mb-6">
                            We encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
                        </p>

                        <div className="bg-gray-50 p-3 rounded-lg text-xs text-left overflow-auto max-h-32 mb-6 font-mono border border-gray-200 text-gray-500">
                            {this.state.error && this.state.error.toString()}
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={this.handleReload}
                                className="w-full bg-emerald-600 text-white font-semibold py-3 px-4 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                            >
                                <RotateCcw size={18} />
                                Reload Page
                            </button>

                            <button
                                onClick={this.handleReset}
                                className="w-full bg-white text-gray-600 font-semibold py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                            >
                                Clear Cache & Reset
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
