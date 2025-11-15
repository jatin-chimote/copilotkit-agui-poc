import React, { useState } from 'react';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { useStore } from '../store/useStore';
import { agentApi } from '../api/client';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check } from 'lucide-react';

export const MappingChat: React.FC = () => {
  const { selectedProject, selectedSubProject } = useStore();
  const [mapping, setMapping] = useState<Record<string, string> | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [agentResponse, setAgentResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  if (!selectedProject || !selectedSubProject) {
    return (
      <div className="empty-state">
        <h3>No Vendor Schema Selected</h3>
        <p>Select a vendor schema from the list to start mapping columns</p>
      </div>
    );
  }

  const handleMap = async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await agentApi.mapColumns({
        subproject_id: selectedSubProject.id,
        user_message: userMessage,
      });

      setMapping(response.data.suggested_mapping || null);
      setConfidence(response.data.confidence || null);
      setAgentResponse(response.data.response);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (error) {
      console.error('Mapping error:', error);
      setAgentResponse('Error: Failed to generate mapping. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceClass = (conf: number) => {
    if (conf >= 0.8) return 'confidence-high';
    if (conf >= 0.5) return 'confidence-medium';
    return 'confidence-low';
  };

  const getConfidenceText = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.5) return 'Medium';
    return 'Low';
  };

  const currentMapping = mapping || selectedSubProject.mapping || {};

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', color: '#333', marginBottom: '5px' }}>
          {selectedSubProject.name}
        </h2>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Vendor: {selectedSubProject.vendor_name}
        </p>
      </div>

      {confidence !== null && (
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', color: '#333' }}>Mapping Confidence:</span>
          <span className={`confidence-badge ${getConfidenceClass(confidence)}`}>
            {getConfidenceText(confidence)} ({Math.round(confidence * 100)}%)
          </span>
        </div>
      )}

      <div className="mapping-container">
        <div className="schema-column">
          <h3>Source Schema (Vendor)</h3>
          {Object.entries(selectedSubProject.source_schema).map(([key, value]) => (
            <div
              key={key}
              className={`field-item ${Object.values(currentMapping).includes(key) ? 'mapped' : ''}`}
            >
              <strong>{key}</strong>
              <div style={{ fontSize: '12px', color: '#666' }}>{String(value)}</div>
            </div>
          ))}
        </div>

        <div className="arrow-container">
          <ArrowRight size={32} />
        </div>

        <div className="schema-column">
          <h3>Destination Schema (Target)</h3>
          {Object.entries(selectedProject.destination_schema).map(([key, value]) => (
            <div
              key={key}
              className={`field-item ${currentMapping[key] ? 'mapped' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{key}</strong>
                  <div style={{ fontSize: '12px', color: '#666' }}>{String(value)}</div>
                </div>
                {currentMapping[key] && (
                  <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#48bb78' }}>
                    <Check size={14} style={{ marginRight: '4px' }} />
                    {currentMapping[key]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {agentResponse && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#edf2f7', borderRadius: '8px' }}>
          <h4 style={{ marginBottom: '10px', fontSize: '14px', color: '#333' }}>Agent Response:</h4>
          <p style={{ fontSize: '14px', color: '#555', whiteSpace: 'pre-wrap' }}>{agentResponse}</p>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', color: '#333' }}>
          Chat with AI Agent
        </h3>
        <MapperChatInterface
          onSendMessage={handleMap}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

interface MapperChatInterfaceProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const MapperChatInterface: React.FC<MapperChatInterfaceProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <div style={{ marginBottom: '15px' }}>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
          Ask the AI agent to help you map columns. For example:
        </p>
        <ul style={{ fontSize: '13px', color: '#666', paddingLeft: '20px' }}>
          <li>Map all columns intelligently</li>
          <li>Map vendor_date to purchase_date</li>
          <li>Show me which columns don't have matches</li>
          <li>Suggest transformations for incompatible fields</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group" style={{ marginBottom: '10px' }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message to the AI agent..."
            rows={3}
            disabled={isLoading}
            style={{ fontFamily: 'inherit' }}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading || !message.trim()}
        >
          {isLoading ? 'Processing...' : 'Send to Agent'}
        </button>
      </form>
    </div>
  );
};
