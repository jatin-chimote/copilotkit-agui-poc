import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { subProjectsApi } from '../api/client';
import { useStore } from '../store/useStore';
import { Plus, FileText } from 'lucide-react';
import type { SubProjectCreate } from '../types';

export const SubProjectList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { selectedProject, selectedSubProject, setSelectedSubProject } = useStore();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: SubProjectCreate) => subProjectsApi.create(selectedProject!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
    },
  });

  if (!selectedProject) {
    return (
      <div className="empty-state">
        <h3>No Project Selected</h3>
        <p>Select a project from the sidebar to view vendors</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '22px', color: '#333', marginBottom: '5px' }}>
            {selectedProject.name}
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            {selectedProject.description || 'Manage vendor schemas and mappings'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '5px', display: 'inline' }} />
          Add Vendor
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>
          Destination Schema
        </h3>
        <div className="schema-display">
          <pre>{JSON.stringify(selectedProject.destination_schema, null, 2)}</pre>
        </div>
      </div>

      <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>
        Vendor Schemas ({selectedProject.subprojects.length})
      </h3>

      {selectedProject.subprojects.length === 0 ? (
        <div className="empty-state">
          <p>No vendor schemas yet. Add a vendor to start mapping!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {selectedProject.subprojects.map((subproject) => (
            <div
              key={subproject.id}
              className={`card ${selectedSubProject?.id === subproject.id ? 'active' : ''}`}
              onClick={() => setSelectedSubProject(subproject)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FileText size={18} style={{ marginRight: '8px', color: '#667eea' }} />
                  <div>
                    <strong style={{ fontSize: '15px' }}>{subproject.name}</strong>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      Vendor: {subproject.vendor_name}
                    </div>
                  </div>
                </div>
                {subproject.mapping && (
                  <span className="confidence-badge confidence-high">
                    Mapped
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateSubProjectModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
};

interface CreateSubProjectModalProps {
  onClose: () => void;
  onSubmit: (data: SubProjectCreate) => void;
}

const CreateSubProjectModal: React.FC<CreateSubProjectModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [schema, setSchema] = useState('{\n  "vendor_col1": "string",\n  "vendor_col2": "number"\n}');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const source_schema = JSON.parse(schema);
      onSubmit({ name, vendor_name: vendorName, source_schema });
    } catch (error) {
      alert('Invalid JSON schema');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Add Vendor Schema</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Schema Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vendor A Purchase Schema"
              required
            />
          </div>
          <div className="form-group">
            <label>Vendor Name *</label>
            <input
              type="text"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g., Acme Corp"
              required
            />
          </div>
          <div className="form-group">
            <label>Source Schema (JSON) *</label>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              rows={10}
              required
            />
            <small style={{ color: '#666' }}>
              Paste the vendor's schema structure
            </small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Vendor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
