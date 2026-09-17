import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
  isAlert = false // If true, only shows 1 OK button
}) {
  if (!isOpen) return null;

  const getIcon = () => {
    return <AlertTriangle className="h-6 w-6 text-slate-900" />;
  };

  const getIconBg = () => {
    return 'bg-slate-100 border-slate-300';
  };

  const getConfirmBtnStyle = () => {
    return 'bg-slate-900 hover:bg-black text-white focus:ring-slate-900';
  };

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header with icon */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${getIconBg()}`}>
                {getIcon()}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          {!isAlert && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onConfirm && onConfirm();
              onClose && onClose();
            }}
            className={`px-5 py-2 text-xs font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${getConfirmBtnStyle()}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
