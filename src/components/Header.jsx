import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

export const Header = ({ 
  onOpenAddModal
}) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
      paddingBottom: '1.25rem',
      borderBottom: '1px solid var(--border-color)'
    }}>
      {/* Brand Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <BookOpen size={24} />
        </div>
        <div>
          <h1 className="heading-font" style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.1 }}>
            Dormitory <span className="gradient-text">Library</span>
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Department Thesis Repository
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <button onClick={onOpenAddModal} className="btn-primary">
          <Plus size={18} /> Add Thesis
        </button>
      </div>
    </header>
  );
};
