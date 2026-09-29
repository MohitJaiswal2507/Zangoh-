// src/App.js
import React from 'react';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import theme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AgentConfig from './pages/AgentConfig';
import ConversationView from './pages/ConversationView';
import Templates from './pages/Templates';
import Analysis from './pages/Analysis';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppDataProvider } from './context/AppDataContext';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <WebSocketProvider>
        <AppDataProvider>
          <Router>
            <Box minHeight="100vh" bg="#f4f5f9">
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/conversations" element={<ConversationView />} />
                  <Route path="/conversation" element={<ConversationView />} />
                  <Route path="/conversation/:id" element={<ConversationView />} />
                  <Route path="/agent-config" element={<AgentConfig />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/Analysis" element={<Analysis />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            </Box>
          </Router>
        </AppDataProvider>
      </WebSocketProvider>
    </ChakraProvider>
  );
}

export default App;