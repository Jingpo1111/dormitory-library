import React, { useState } from 'react';
import { ArrowLeft, ExternalLink, Edit3, Trash2, FileText, Search, Plus } from 'lucide-react';

export const ThesisListView = ({ 
  department, 
  theses, 
  onBack, 
  onEdit, 
  onDelete,
  onAddThesisInDept 
}) => {
  const [search, setSearch] = useState('');

  const deptTheses = theses.filter(t => t.department === department && (
    search === '' || t.titleThesis.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div>
      {/* Back Button & Department Title Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button 
            onClick={onBack}
            className="btn-secondary"
            style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Back to Departments
          </button>
          <div>
            <h2 className="heading-font" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
              {department} <span className="gradient-text">Theses</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>
              Showing {deptTheses.length} thesis records
            </p>
          </div>
        </div>

        <button onClick={() => onAddThesisInDept(department)} className="btn-primary" style={{ padding: '0.55rem 1rem', fontSize: '0.85rem' }}>
          <Plus size={16} /> Add Thesis to {department}
        </button>
      </div>

      {/* Search Bar inside Department */}
      <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input 
          type="text"
          placeholder="Filter thesis title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.4rem', fontSize: '0.85rem' }}
        />
      </div>

      {/* Table displaying Title Thesis & Link PDF */}
      {deptTheses.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FileText size={42} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Thesis Found in {department}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Click "Add Thesis" above or sync from Google Sheets to add records.
          </p>
        </div>
      ) : (
        <div className="table-responsive glass-card">
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ 
                borderBottom: '1px solid var(--border-color)', 
                background: 'rgba(15, 23, 42, 0.4)',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}>
                <th style={{ padding: '1.1rem 1.25rem', width: '60%' }}>
                  Title Thesis
                </th>
                <th style={{ padding: '1.1rem 1.25rem', width: '25%' }}>
                  Link PDF
                </th>
                <th style={{ padding: '1.1rem 1.25rem', textAlign: 'right', width: '15%' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {deptTheses.map((thesis) => (
                <tr 
                  key={thesis.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    transition: 'background 0.2s',
                    fontSize: '0.925rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Title Thesis */}
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <FileText size={18} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
                      <span>{thesis.titleThesis}</span>
                    </div>
                  </td>

                  {/* Link PDF */}
                  <td style={{ padding: '1.1rem 1.25rem' }}>
                    {thesis.linkPdf ? (
                      <a 
                        href={thesis.linkPdf} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{
                          padding: '0.4rem 0.85rem',
                          fontSize: '0.8rem',
                          color: '#38bdf8',
                          borderColor: 'rgba(56, 189, 248, 0.3)',
                          background: 'rgba(56, 189, 248, 0.1)'
                        }}
                      >
                        <ExternalLink size={14} /> Open PDF
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>No Link</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                      <button 
                        onClick={() => onEdit(thesis)}
                        className="btn-icon"
                        style={{ width: '34px', height: '34px' }}
                        title="Edit Entry"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button 
                        onClick={() => onDelete(thesis.id)}
                        className="btn-icon"
                        style={{ width: '34px', height: '34px', color: '#fb7185' }}
                        title="Delete Entry"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
