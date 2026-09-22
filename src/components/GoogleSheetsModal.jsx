import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';
import { fetchGoogleSheetData, parseCSVFile } from '../utils/googleSheets';

export const GoogleSheetsModal = ({ 
  isOpen, 
  onClose, 
  onSyncTheses, 
  onExportTheses,
  onLoadSampleData,
  currentCount
}) => {
  const [sheetUrl, setSheetUrl] = useState('https://script.google.com/macros/s/AKfycbyb7gc11RcRrhYvLGUshu2dS_TsMpPPDi86UwBc569kIaCsRo4XxyrPBOWKTOL3eizf/exec');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'upload' | 'export' | 'guide'

  if (!isOpen) return null;

  const handleFetchUrl = async (e) => {
    e.preventDefault();
    if (!sheetUrl.trim()) {
      setErrorMsg('Please enter a valid Google Sheet or Apps Script URL.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { theses, rawCount } = await fetchGoogleSheetData(sheetUrl);
      onSyncTheses(theses, 'append');
      setSuccessMsg(`Synced ${rawCount} thesis records successfully!`);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to sync data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { theses, count } = await parseCSVFile(file);
      onSyncTheses(theses, 'replace');
      setSuccessMsg(`Loaded ${count} records from uploaded CSV file!`);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      setErrorMsg(`CSV Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileSpreadsheet size={22} style={{ color: '#34d399' }} />
            <h2 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Google Sheets / Apps Script Sync
            </h2>
          </div>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid var(--border-color)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <button 
            onClick={() => setActiveTab('url')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderBottom: activeTab === 'url' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'url' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            Google Apps Script / Sheet Link
          </button>
          <button 
            onClick={() => setActiveTab('upload')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderBottom: activeTab === 'upload' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'upload' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            Import CSV
          </button>
          <button 
            onClick={() => setActiveTab('export')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderBottom: activeTab === 'export' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'export' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            Export CSV
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            style={{
              flex: 1,
              padding: '0.85rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              borderBottom: activeTab === 'guide' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === 'guide' ? 'var(--text-main)' : 'var(--text-muted)'
            }}
          >
            Guide
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              padding: '1rem 1.15rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid rgba(244, 63, 94, 0.35)',
              color: '#fb7185',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              lineHeight: 1.5
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                <AlertCircle size={18} />
                <span>Sync Alert</span>
              </div>
              <p>{errorMsg}</p>
              
              {errorMsg.includes('Deploy') && (
                <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(244, 63, 94, 0.3)', fontSize: '0.8rem', color: '#fca5a5' }}>
                  <strong>Quick Fix in Google Apps Script:</strong>
                  <ol style={{ paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                    <li>Open your Google Apps Script editor.</li>
                    <li>Click <strong>Deploy</strong> &gt; <strong>Manage deployments</strong>.</li>
                    <li>Set <strong>Who has access</strong> to <strong>Anyone</strong>.</li>
                    <li>Click <strong>Deploy</strong> and try again!</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={18} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleFetchUrl}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Paste your Google Apps Script Web App URL or Google Sheet link:
              </p>

              <div className="form-group">
                <label className="form-label">Apps Script / Sheet URL</label>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  disabled={isLoading}
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="spin-anim" /> Syncing Data...
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} /> Sync Data From Apps Script / Sheet
                  </>
                )}
              </button>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={() => {
                    onLoadSampleData();
                    setSuccessMsg('Sample thesis data loaded!');
                    setTimeout(() => onClose(), 1200);
                  }}
                  className="btn-secondary"
                  style={{ margin: '0 auto', fontSize: '0.85rem' }}
                >
                  <Sparkles size={16} style={{ color: '#a855f7' }} /> Pre-fill Demo Thesis Catalog
                </button>
              </div>
            </form>
          )}

          {activeTab === 'upload' && (
            <div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Upload a <code>.csv</code> file with columns <code>Department</code>, <code>Title Thesis</code>, and <code>Link PDF</code>.
              </p>

              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2.5rem 1.5rem',
                border: '2px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <Upload size={36} style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem' }} />
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Choose CSV File</span>
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileUpload} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          )}

          {activeTab === 'export' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <Download size={42} style={{ color: '#34d399', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Export Table Data ({currentCount} Records)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Download CSV formatted with headers: <code>Department</code>, <code>Title Thesis</code>, <code>Link PDF</code>.
              </p>

              <button 
                onClick={onExportTheses}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', margin: '0 auto' }}
              >
                <Download size={18} /> Download Thesis CSV
              </button>
            </div>
          )}

          {activeTab === 'guide' && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Lock size={16} style={{ color: 'var(--accent-amber)' }} /> Setting Up Google Apps Script Access:
              </h4>
              <ol style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li>In Google Apps Script, click <strong>Deploy &gt; Manage deployments</strong>.</li>
                <li>Click <strong>Edit (✏️)</strong> on your active deployment.</li>
                <li>Set <strong>Who has access</strong> to <strong>Anyone</strong> (this allows public API calls without requiring Google sign-in).</li>
                <li>Click <strong>Deploy</strong>, copy the Web App URL, and paste it here!</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
