import React, { useState } from 'react';
import { INITIAL_THESES, INITIAL_DEPARTMENTS } from './data/initialData';
import { exportToCSV, postThesis } from './utils/googleSheets';
import { Header } from './components/Header';
import { DepartmentView } from './components/DepartmentView';
import { ThesisListView } from './components/ThesisListView';
import { AddEditModal } from './components/AddEditModal';
import { Toast } from './components/Toast';

export default function App() {
  // Thesis Data — always starts from initialData.js
  const [theses, setTheses] = useState(INITIAL_THESES);

  // Selected Department State (null = show all departments, string = selected department)
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingThesis, setEditingThesis] = useState(null);

  // Toast Alerts
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
  };



// Save / Update Thesis
const handleSaveThesis = async (thesisData) => {
  if (editingThesis) {
    // Update locally (no server-side edit support yet)
    setTheses(prev => prev.map(t => t.id === thesisData.id ? { ...t, ...thesisData } : t));
    showToast('success', 'Updated thesis record.');
  } else {
    // New thesis – first send to Google Sheet via POST
    try {
      await postThesis(undefined, {
        department: thesisData.department,
        titleThesis: thesisData.titleThesis,
        linkPdf: thesisData.linkPdf,
      });
      setTheses(prev => [thesisData, ...prev]);
      showToast('success', 'Added thesis record and synced to Google Sheet!');
    } catch (err) {
      showToast('error', `Failed to sync to Google Sheet: ${err.message}`);
      // Abort local add if server write fails
      return;
    }
  }
  setEditingThesis(null);
};
  // Delete Thesis
  const handleDeleteThesis = (thesisId) => {
    const target = theses.find(t => t.id === thesisId);
    if (window.confirm(`Delete "${target?.titleThesis}"?`)) {
      setTheses(prev => prev.filter(t => t.id !== thesisId));
      showToast('info', 'Thesis deleted.');
    }
  };

  // Dynamically extract unique departments from both initial list & existing theses
  const availableDepartments = Array.from(
    new Set([...INITIAL_DEPARTMENTS, ...theses.map(t => t.department)])
  );

  return (
    <div className="app-container" style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <Header 
        onOpenAddModal={() => { setEditingThesis(null); setIsAddEditModalOpen(true); }}
      />

      {/* View Logic: Select Department -> Show Theses */}
      {selectedDepartment === null ? (
        <DepartmentView 
          departments={availableDepartments}
          theses={theses}
          onSelectDepartment={(deptName) => setSelectedDepartment(deptName)}
        />
      ) : (
        <ThesisListView 
          department={selectedDepartment}
          theses={theses}
          onBack={() => setSelectedDepartment(null)}
          onEdit={(thesis) => { setEditingThesis(thesis); setIsAddEditModalOpen(true); }}
          onDelete={handleDeleteThesis}
          onAddThesisInDept={(dept) => {
            setEditingThesis({ department: dept, titleThesis: '', linkPdf: '' });
            setIsAddEditModalOpen(true);
          }}
        />
      )}


      {/* Add / Edit Form Dialog */}
      <AddEditModal 
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        onSaveThesis={handleSaveThesis}
        editingThesis={editingThesis}
      />

      {/* Feedback Toast */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
