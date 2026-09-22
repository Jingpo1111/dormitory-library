import React, { useState, useEffect } from 'react';
import { X, Save, FileText, Link, Building } from 'lucide-react';
import { INITIAL_DEPARTMENTS } from '../data/initialData';

export const AddEditModal = ({ 
  isOpen, 
  onClose, 
  onSaveThesis, 
  editingThesis 
}) => {
  const [formData, setFormData] = useState({
    department: INITIAL_DEPARTMENTS[0] || '',
    titleThesis: '',
    linkPdf: ''
  });

  useEffect(() => {
    if (editingThesis) {
      setFormData({
        department: editingThesis.department || INITIAL_DEPARTMENTS[0] || '',
        titleThesis: editingThesis.titleThesis || '',
        linkPdf: editingThesis.linkPdf || ''
      });
    } else {
      setFormData({
        department: INITIAL_DEPARTMENTS[0] || '',
        titleThesis: '',
        linkPdf: ''
      });
    }
  }, [editingThesis, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titleThesis.trim() || !formData.department.trim()) return;

    onSaveThesis({
      ...formData,
      id: editingThesis ? editingThesis.id : `thesis-${Date.now()}`,
      addedDate: editingThesis ? editingThesis.addedDate : new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.5)'
        }}>
          <h2 className="heading-font" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {editingThesis ? 'Edit Thesis Entry' : 'Add New Thesis Record'}
          </h2>
          <button onClick={onClose} className="btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Department */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Building size={16} style={{ color: 'var(--accent-primary)' }} /> Department *
              </label>
              <select 
                className="form-select"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                {INITIAL_DEPARTMENTS.filter(d => d !== 'All').map(dept => (
                  <option key={dept} value={dept} style={{ background: '#1e293b' }}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Thesis */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FileText size={16} style={{ color: 'var(--accent-primary)' }} /> Title Thesis *
              </label>
              <textarea 
                required
                rows="3"
                className="form-textarea" 
                placeholder="e.g. Machine Learning Models for Microgrid Load Forecasting"
                value={formData.titleThesis}
                onChange={(e) => setFormData({ ...formData, titleThesis: e.target.value })}
              />
            </div>

            {/* Link PDF */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link size={16} style={{ color: 'var(--accent-primary)' }} /> Link PDF *
              </label>
              <input 
                type="url" 
                required
                className="form-input" 
                placeholder="https://example.com/thesis.pdf or Google Drive PDF Link"
                value={formData.linkPdf}
                onChange={(e) => setFormData({ ...formData, linkPdf: e.target.value })}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                Paste direct URL or Google Drive / Cloud PDF link.
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Save size={18} /> {editingThesis ? 'Update Entry' : 'Save Thesis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
