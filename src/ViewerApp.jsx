import React, { useState, useEffect } from 'react';
import { BookOpen, Building2, FileText, ChevronRight, ArrowLeft, ExternalLink, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';

// --- Config: your Apps Script web app URL ---
const SHEET_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyELVNLYVFg8aofn9MQTmYiVLvaenkuJlUkyzF4fqGguTMLsfE5fK3bAmRCwmoyGlF-/exec';

/**
 * Maps a raw Google Sheet row object to a Thesis object.
 */
const mapRowToThesis = (row, index) => {
  const keys = Object.keys(row);

  const findValue = (possibleNames, colIdx, defaultValue = '') => {
    for (const key of keys) {
      const normalizedKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      for (const target of possibleNames) {
        if (normalizedKey.includes(target)) {
          if (row[key] !== undefined && row[key] !== null && String(row[key]).trim() !== '') {
            return String(row[key]).trim();
          }
        }
      }
    }
    if (keys[colIdx] !== undefined && row[keys[colIdx]] !== undefined && row[keys[colIdx]] !== null) {
      const indexVal = String(row[keys[colIdx]]).trim();
      if (indexVal !== '') return indexVal;
    }
    return defaultValue;
  };

  const department = findValue(['department', 'dept', 'faculty', 'major', 'branch'], 0, 'General');
  const titleThesis = findValue(['titlethesis', 'title', 'thesis', 'name', 'topic', 'subject', 'paper'], 1, `Thesis Title ${index + 1}`);
  let linkPdf = findValue(['linkpdf', 'pdf', 'link', 'url', 'file', 'drive'], 2, '');

  if (linkPdf && !linkPdf.startsWith('http://') && !linkPdf.startsWith('https://')) {
    linkPdf = `https://${linkPdf}`;
  }

  return {
    id: `thesis-${Date.now()}-${index}`,
    department,
    titleThesis,
    linkPdf,
  };
};

// ─── Viewer Header (no action buttons) ─────────────────────────────
const ViewerHeader = ({ totalCount, onRefresh, isLoading }) => (
  <header style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    paddingBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)'
  }}>
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
          Department Thesis Repository • {totalCount} Records
        </p>
      </div>
    </div>

    <button
      onClick={onRefresh}
      className="btn-secondary"
      disabled={isLoading}
      style={{ fontSize: '0.85rem' }}
    >
      <RefreshCw size={16} className={isLoading ? 'spin-anim' : ''} />
      {isLoading ? 'Refreshing…' : 'Refresh'}
    </button>
  </header>
);

// ─── Department Cards (read-only) ──────────────────────────────────
const ViewerDepartments = ({ departments, theses, onSelect }) => (
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
        const count = theses.filter(t => t.department === dept).length;
        return (
          <div
            key={dept}
            onClick={() => onSelect(dept)}
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
                  <span>{count} Thesis {count === 1 ? 'Paper' : 'Papers'}</span>
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

// ─── Thesis List (read-only, no edit/delete/add) ───────────────────
const ViewerThesisList = ({ department, theses, onBack }) => {
  const [search, setSearch] = useState('');

  const deptTheses = theses.filter(t =>
    t.department === department &&
    (search === '' || t.titleThesis.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      {/* Back + Title */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onBack} className="btn-secondary" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem' }}>
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
      </div>

      {/* Search */}
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

      {/* Table (no Actions column) */}
      {deptTheses.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
          <FileText size={42} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No Thesis Found in {department}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            There are no thesis records for this department yet.
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
                <th style={{ padding: '1.1rem 1.25rem', width: '70%' }}>Title Thesis</th>
                <th style={{ padding: '1.1rem 1.25rem', width: '30%' }}>Link PDF</th>
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
                  <td style={{ padding: '1.1rem 1.25rem', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
                      <FileText size={18} style={{ color: 'var(--accent-primary)', marginTop: '2px', flexShrink: 0 }} />
                      <span>{thesis.titleThesis}</span>
                    </div>
                  </td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main Viewer App ───────────────────────────────────────────────
export default function ViewerApp() {
  const [theses, setTheses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(SHEET_WEBAPP_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const jsonData = await response.json();
      const rows = Array.isArray(jsonData) ? jsonData : (jsonData.data || jsonData.rows || []);
      if (!rows || rows.length === 0) {
        setTheses([]);
        setError('No data found in the Google Sheet.');
        return;
      }
      const mapped = rows.map((row, idx) => mapRowToThesis(row, idx));
      setTheses(mapped);
    } catch (err) {
      setError(err.message || 'Failed to load data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const departments = Array.from(new Set(theses.map(t => t.department)));

  return (
    <div className="app-container" style={{ maxWidth: '1100px' }}>
      <ViewerHeader totalCount={theses.length} onRefresh={fetchData} isLoading={isLoading} />

      {/* Loading State */}
      {isLoading && theses.length === 0 && (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <Loader2 size={42} className="spin-anim" style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading thesis data…</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
            Fetching from Google Sheet
          </p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div style={{
          padding: '1rem 1.15rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.35)',
          color: '#fb7185',
          fontSize: '0.85rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      {!isLoading && theses.length > 0 && (
        selectedDepartment === null ? (
          <ViewerDepartments
            departments={departments}
            theses={theses}
            onSelect={(dept) => setSelectedDepartment(dept)}
          />
        ) : (
          <ViewerThesisList
            department={selectedDepartment}
            theses={theses}
            onBack={() => setSelectedDepartment(null)}
          />
        )
      )}
    </div>
  );
}
