import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectList } from './components/ProjectList';
import { SubProjectList } from './components/SubProjectList';
import { MappingChat } from './components/MappingChat';
import { useStore } from './store/useStore';
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
  const { selectedSubProject } = useStore();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <div className="container">
          <div className="header">
            <h1>Data Mapper Agent</h1>
            <p>AI-powered intelligent column mapping for data integration</p>
          </div>

          <div className="main-layout">
            <div className="sidebar">
              <ProjectList />
            </div>

            <div className="content">
              {selectedSubProject ? (
                <MappingChat />
              ) : (
                <SubProjectList />
              )}
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
