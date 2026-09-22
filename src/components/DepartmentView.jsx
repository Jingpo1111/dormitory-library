import React from 'react';
import { Building2, FileText, ChevronRight } from 'lucide-react';

export const DepartmentView = ({ departments, theses, onSelectDepartment }) => {
  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
          Select a Department
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
          Click on any department below to view its theses.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {departments.map((dept) => {
          const deptThesesCount = theses.filter(t => t.department === dept).length;

          return (
            <div 
              key={dept}
              onClick={() => onSelectDepartment(dept)}
              className="glass-card"
              style={{
                padding: '1.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, border-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Building2 size={24} />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    {dept}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={14} />
                    <span>{deptThesesCount} Thesis {deptThesesCount === 1 ? 'Paper' : 'Papers'}</span>
                  </div>
                </div>
              </div>

              <ChevronRight size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
