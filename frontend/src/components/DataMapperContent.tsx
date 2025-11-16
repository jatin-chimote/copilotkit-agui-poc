import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';
import { projectsApi, subProjectsApi } from '../api/client';
import { useStore } from '../store/useStore';
import { Upload, FileText, Database } from 'lucide-react';

export const DataMapperContent: React.FC = () => {
  const { selectedProject, selectedSubProject } = useStore();
  const [uploadedSchema, setUploadedSchema] = useState<any>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch all projects to share with AI
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsApi.getAll();
      return response.data;
    },
  });

  // Share projects list with AI
  useCopilotReadable({
    description: "List of all projects and their vendors",
    value: projects || []
  });

  // Share uploaded schema with AI
  useCopilotReadable({
    description: "Recently uploaded schema file (if any). User can use this to create projects or vendors.",
    value: uploadedSchema ? {
      filename: uploadedFile?.name,
      schema: uploadedSchema,
      column_count: uploadedSchema.columns?.length || 0
    } : null
  });

  // Share currently selected project with AI
  useCopilotReadable({
    description: "Currently selected project details",
    value: selectedProject || null
  });

  // Share currently selected vendor with AI
  useCopilotReadable({
    description: "Currently selected vendor/subproject details",
    value: selectedSubProject || null
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload to parse schema
      const response = await projectsApi.uploadDestinationSchema(formData);
      const extractedSchema = response.data.schema;

      setUploadedSchema(extractedSchema);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error parsing file. Please check the format and try again.');
      setUploadedFile(null);
      setUploadedSchema(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* File Upload Area */}
      <div style={{
        border: '2px dashed #667eea',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        marginBottom: '30px',
        backgroundColor: '#f8f9ff'
      }}>
        <Upload size={48} color="#667eea" style={{ margin: '0 auto 20px' }} />
        <h3 style={{ fontSize: '18px', marginBottom: '10px', color: '#333' }}>Upload Schema File</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Upload a CSV, Excel, or JSON file to extract schema
        </p>

        <label
          htmlFor="file-upload"
          className="btn btn-primary"
          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
        >
          <Upload size={16} style={{ marginRight: '8px' }} />
          {isUploading ? 'Uploading...' : 'Choose File'}
        </label>
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
          disabled={isUploading}
        />

        {uploadedFile && uploadedSchema && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <FileText size={18} color="#10b981" style={{ marginRight: '8px' }} />
              <strong style={{ color: '#10b981' }}>File Uploaded: {uploadedFile.name}</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              ✓ Extracted {uploadedSchema.columns?.length || 0} columns
            </div>
            <div style={{ fontSize: '13px', color: '#667eea', marginTop: '8px' }}>
              💬 Now ask the AI to create a project or vendor with this schema!
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '25px',
        marginBottom: '20px'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333', display: 'flex', alignItems: 'center' }}>
          <Database size={20} style={{ marginRight: '8px', color: '#667eea' }} />
          How to Use (via Chat)
        </h3>

        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '12px' }}>
            <strong>1. Create a Project:</strong>
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Upload a destination schema file above</li>
            <li>Ask: "Create a project called Purchase Orders with the uploaded schema"</li>
            <li>Or: "Create a project named Customer Data" (then provide schema in chat)</li>
          </ul>

          <p style={{ marginBottom: '12px' }}>
            <strong>2. Add Vendors:</strong>
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Upload a vendor's source schema file</li>
            <li>Ask: "Add vendor Acme Corp to project 1 with the uploaded schema"</li>
            <li>Or: "List projects" to see available project IDs</li>
          </ul>

          <p style={{ marginBottom: '12px' }}>
            <strong>3. Map Columns:</strong>
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Ask: "Map columns for vendor 1"</li>
            <li>Or: "Show me details for project 1 and map all vendors"</li>
          </ul>

          <p style={{ marginBottom: '12px' }}>
            <strong>Example Commands:</strong>
          </p>
          <ul style={{ marginLeft: '20px' }}>
            <li>"List all my projects"</li>
            <li>"Show details for project 2"</li>
            <li>"Delete vendor 3"</li>
            <li>"Map columns for Acme Corp vendor"</li>
          </ul>
        </div>
      </div>

      {/* Current Selection */}
      {(selectedProject || selectedSubProject) && (
        <div style={{
          backgroundColor: '#f0f4ff',
          border: '1px solid #667eea',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>
            Current Selection
          </h3>

          {selectedProject && (
            <div style={{ marginBottom: '10px' }}>
              <strong style={{ fontSize: '14px', color: '#667eea' }}>Project:</strong>{' '}
              <span style={{ fontSize: '14px', color: '#333' }}>{selectedProject.name}</span>
              {selectedProject.description && (
                <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                  {selectedProject.description}
                </div>
              )}
            </div>
          )}

          {selectedSubProject && (
            <div>
              <strong style={{ fontSize: '14px', color: '#667eea' }}>Vendor:</strong>{' '}
              <span style={{ fontSize: '14px', color: '#333' }}>{selectedSubProject.vendor_name}</span>
              {selectedSubProject.mapping && (
                <div style={{ fontSize: '13px', color: '#10b981', marginTop: '5px' }}>
                  ✓ Mapping complete
                </div>
              )}
            </div>
          )}

          <div style={{ fontSize: '13px', color: '#667eea', marginTop: '15px' }}>
            💬 Ask the AI about this selection in the chat!
          </div>
        </div>
      )}
    </div>
  );
};
