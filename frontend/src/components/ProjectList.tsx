import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/client';
import { useStore } from '../store/useStore';
import { Plus, FolderOpen, Upload, FileText } from 'lucide-react';
import type { ProjectCreate } from '../types';

export const ProjectList: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { selectedProject, setSelectedProject, setSelectedSubProject } = useStore();
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
    },
  });

  if (isLoading) return <div className="loading">Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '18px', color: '#333' }}>Projects</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} style={{ marginRight: '5px', display: 'inline' }} />
          New
        </button>
      </div>

      {projects?.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create one to get started!</p>
        </div>
      ) : (
        projects?.map((project) => (
          <div
            key={project.id}
            className={`card ${selectedProject?.id === project.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedProject(project);
              setSelectedSubProject(null);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
              <FolderOpen size={18} style={{ marginRight: '8px', color: '#667eea' }} />
              <strong style={{ fontSize: '15px' }}>{project.name}</strong>
            </div>
            {project.description && (
              <p style={{ fontSize: '13px', color: '#666', marginLeft: '26px' }}>
                {project.description}
              </p>
            )}
            <div style={{ fontSize: '12px', color: '#999', marginLeft: '26px', marginTop: '5px' }}>
              {project.subprojects.length} vendor{project.subprojects.length !== 1 ? 's' : ''}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
};

interface CreateProjectModalProps {
  onClose: () => void;
  onSubmit: (data: ProjectCreate) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [schema, setSchema] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await projectsApi.uploadDestinationSchema(formData);
      const extractedSchema = response.data.schema;

      // Convert extracted schema to JSON string for display/editing
      setSchema(JSON.stringify(extractedSchema, null, 2));
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error parsing file. Please check the format and try again.');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const destination_schema = JSON.parse(schema);
      onSubmit({ name, description, destination_schema });
    } catch (error) {
      alert('Invalid JSON schema');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Purchase Orders"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div className="form-group">
            <label>Destination Schema *</label>
            <div style={{ marginBottom: '10px' }}>
              <label
                htmlFor="schema-file-upload"
                className="btn btn-secondary"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
              >
                <Upload size={16} style={{ marginRight: '5px' }} />
                {isUploading ? 'Uploading...' : 'Upload File'}
              </label>
              <input
                id="schema-file-upload"
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              {uploadedFile && (
                <span style={{ marginLeft: '10px', fontSize: '13px', color: '#666' }}>
                  <FileText size={14} style={{ display: 'inline', marginRight: '5px' }} />
                  {uploadedFile.name}
                </span>
              )}
            </div>
            <small style={{ color: '#666', display: 'block', marginBottom: '8px' }}>
              Upload CSV, Excel, or JSON file with your destination schema
            </small>
            <textarea
              value={schema}
              onChange={(e) => setSchema(e.target.value)}
              rows={10}
              placeholder="Upload a file or paste JSON schema here..."
              required
            />
            <small style={{ color: '#666' }}>
              Define your standard schema that all vendors will map to
            </small>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
