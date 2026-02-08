import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    type = "danger"
}) => {
    if (!isOpen) return null;

    const themes = {
        danger: {
            icon: <Trash2 className="w-6 h-6 text-danger" />,
            button: "bg-danger hover:bg-danger/80 text-white",
            bg: "bg-danger/10",
            border: "border-danger/20"
        },
        warning: {
            icon: <AlertCircle className="w-6 h-6 text-warning" />,
            button: "bg-warning hover:bg-warning/80 text-black",
            bg: "bg-warning/10",
            border: "border-warning/20"
        }
    };

    const theme = themes[type] || themes.danger;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md glass-card p-8 shadow-2xl animate-in zoom-in-95 fade-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-full ${theme.bg} ${theme.border} border`}>
                        {theme.icon}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-black tracking-tight uppercase">{title}</h3>
                        <p className="text-white/40 text-sm leading-relaxed">{message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full pt-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors font-bold text-xs uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`px-6 py-3 rounded-xl transition-colors font-bold text-xs uppercase tracking-widest ${theme.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
