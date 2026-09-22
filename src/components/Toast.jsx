import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const { type, message } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: '#34d399' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: '#fb7185' }} />;
      default:
        return <Info size={18} style={{ color: '#38bdf8' }} />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 2000,
      background: 'rgba(30, 41, 59, 0.95)',
      backdropFilter: 'blur(12px)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-md)',
      padding: '0.85rem 1.25rem',
      boxShadow: 'var(--shadow-lg)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: 'var(--text-main)',
      fontSize: '0.9rem',
      fontWeight: 500,
      animation: 'slideUp 0.3s ease-out'
    }}>
      {getIcon()}
      <span>{message}</span>
      <button onClick={onClose} style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
        <X size={16} />
      </button>
    </div>
  );
};
