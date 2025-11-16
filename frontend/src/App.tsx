import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import '@copilotkit/react-ui/styles.css';
import { ProjectList } from './components/ProjectList';
import { DataMapperContent } from './components/DataMapperContent';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CopilotKit runtimeUrl="/api/copilotkit">
        <CopilotSidebar
          instructions={`You are an AI assistant for a Data Mapping application. You help users:

1. **Create Projects**: Projects have a destination schema (the target format)
2. **Add Vendors**: Each vendor has a source schema that needs to be mapped to the destination
3. **Map Columns**: Use AI to intelligently map vendor columns to destination columns

Available actions:
- create_project: Create a new project with destination schema
- create_subproject: Add a vendor with source schema to a project
- list_projects: Show all projects and their vendors
- get_project_details: Get detailed information about a project
- map_columns: Automatically map vendor columns to destination
- delete_project: Delete a project
- delete_vendor: Delete a vendor

Be helpful, concise, and guide users through the workflow. When users upload files, help them create projects or vendors with the parsed schema.

Example interactions:
- "Create a project called Purchase Orders"
- "Add vendor Acme Corp to project 1"
- "List all my projects"
- "Map columns for vendor 2"
- "Show me details for project 1"`}
          labels={{
            title: "Data Mapper Assistant",
            placeholder: "Ask me to create projects, add vendors, or map columns..."
          }}
          defaultOpen={true}
        >
          <div className="app">
            <div className="container">
              <div className="header">
                <h1>Data Mapper Agent</h1>
                <p>Create projects and map vendor schemas through AI chat</p>
              </div>

              <div className="main-layout">
                <div className="sidebar">
                  <ProjectList />
                </div>

                <div className="content">
                  <DataMapperContent />
                </div>
              </div>
            </div>
          </div>
        </CopilotSidebar>
      </CopilotKit>
    </QueryClientProvider>
  );
}

export default App;
