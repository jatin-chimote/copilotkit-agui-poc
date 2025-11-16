import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, subProjectsApi } from '../api/client';
import { useStore } from '../store/useStore';
import { Plus, FolderOpen, Upload, FileText, Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import type { ProjectCreate, Project } from '../types';

export const ProjectList: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'project' | 'subproject', id: number } | null>(null);
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
      setShowCreateModal(false);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedProject(null);
      setSelectedSubProject(null);
      setDeleteConfirm(null);
    },
  });

  const deleteSubProjectMutation = useMutation({
    mutationFn: (id: number) => subProjectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setSelectedSubProject(null);
      setDeleteConfirm(null);
    },
  });

  const toggleExpand = (projectId: number) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleDeleteProject = (id: number) => {
    setDeleteConfirm({ type: 'project', id });
  };

  const handleDeleteSubProject = (id: number) => {
    setDeleteConfirm({ type: 'subproject', id });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;

    if (deleteConfirm.type === 'project') {
      deleteProjectMutation.mutate(deleteConfirm.id);
    } else {
      deleteSubProjectMutation.mutate(deleteConfirm.id);
    }
  };

  if (isLoading) return <div className="loading">Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ fontSize: '18px', color: '#333' }}>Projects & Vendors</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={16} style={{ marginRight: '5px', display: 'inline' }} />
          New Project
        </button>
      </div>

      {projects?.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {projects?.map((project) => (
            <div key={project.id} style={{ border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
              {/* Project Header */}
              <div
                style={{
                  padding: '12px 15px',
                  backgroundColor: selectedProject?.id === project.id ? '#f0f4ff' : '#fafafa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  borderBottom: expandedProjects.has(project.id) ? '1px solid #e0e0e0' : 'none'
                }}
                onClick={() => {
                  setSelectedProject(project);
                  setSelectedSubProject(null);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(project.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0 5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {expandedProjects.has(project.id) ? (
                      <ChevronDown size={16} color="#666" />
                    ) : (
                      <ChevronRight size={16} color="#666" />
                    )}
                  </button>
                  <FolderOpen size={18} style={{ marginRight: '8px', marginLeft: '5px', color: '#667eea' }} />
                  <div>
                    <strong style={{ fontSize: '15px', color: '#333' }}>{project.name}</strong>
                    {project.description && (
                      <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#999', marginRight: '10px' }}>
                    {project.subprojects.length} vendor{project.subprojects.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Delete project"
                  >
                    <Trash2 size={16} color="#ef4444" />
                  </button>
                </div>
              </div>

              {/* Subprojects List */}
              {expandedProjects.has(project.id) && (
                <div style={{ backgroundColor: '#fff' }}>
                  {project.subprojects.length === 0 ? (
                    <div style={{ padding: '15px 15px 15px 45px', fontSize: '13px', color: '#999', fontStyle: 'italic' }}>
                      No vendors yet. Select this project and click "Add Vendor" to get started.
                    </div>
                  ) : (
                    project.subprojects.map((subproject) => (
                      <div
                        key={subproject.id}
                        style={{
                          padding: '10px 15px 10px 45px',
                          borderTop: '1px solid #f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          backgroundColor: '#fff'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProject(project);
                          setSelectedSubProject(subproject);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <FileText size={16} style={{ marginRight: '8px', color: '#667eea' }} />
                          <div>
                            <div style={{ fontSize: '14px', color: '#333', fontWeight: 500 }}>
                              {subproject.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              Vendor: {subproject.vendor_name}
                              {subproject.mapping && (
                                <span style={{ marginLeft: '10px', color: '#10b981', fontSize: '11px' }}>
                                  ✓ Mapped
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSubProject(subproject.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '5px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                          title="Delete vendor"
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      {deleteConfirm && (
        <ConfirmDeleteModal
          type={deleteConfirm.type}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
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

interface ConfirmDeleteModalProps {
  type: 'project' | 'subproject';
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ type, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>
          {type === 'project' ? 'Delete Project?' : 'Delete Vendor?'}
        </h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          {type === 'project'
            ? 'This will permanently delete the project and all its vendor schemas. This action cannot be undone.'
            : 'This will permanently delete this vendor schema and its mappings. This action cannot be undone.'}
        </p>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onConfirm}
            style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
