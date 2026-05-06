import React from 'react';

const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Delete', 
  type = 'danger' 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative glass rounded-2xl p-6 w-full max-w-sm animate-slide-up shadow-2xl text-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 
          ${type === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-primary-500/10 text-primary-400'}`}
        >
          {type === 'danger' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-dark-100 mb-2">{title}</h2>
        <p className="text-dark-400 text-sm mb-6">{message}</p>

        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="btn-secondary flex-1 py-2.5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-[0.97]
              ${type === 'danger' 
                ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/25 hover:from-red-600 hover:to-rose-700' 
                : 'btn-primary'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
