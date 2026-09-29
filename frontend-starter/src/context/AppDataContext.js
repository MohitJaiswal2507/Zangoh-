// src/context/AppDataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getConversations, getAgents, getKnowledgeBases, interveneInConversation as apiIntervene } from '../api';
import { useWebSocket } from './WebSocketContext';

const AppDataContext = createContext(null);
export const useAppData = () => useContext(AppDataContext);

export const AppDataProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [knowledgeBases, setKnowledgeBases] = useState([]);
  const [loading, setLoading] = useState({
    conversations: true,
    agents: true,
    knowledgeBases: true,
  });
  const [error, setError] = useState({
    conversations: null,
    agents: null,
    knowledgeBases: null,
  });

  const { lastMessage } = useWebSocket();

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const conversationsData = await getConversations();
        setConversations(conversationsData.data || []);
        setLoading(prev => ({ ...prev, conversations: false }));
      } catch (err) {
        console.error('Error loading conversations:', err);
        setError(prev => ({ ...prev, conversations: err.message }));
        setLoading(prev => ({ ...prev, conversations: false }));
      }

      try {
        const agentsData = await getAgents();
        setAgents(agentsData || []);
        setLoading(prev => ({ ...prev, agents: false }));
      } catch (err) {
        console.error('Error loading agents:', err);
        setError(prev => ({ ...prev, agents: err.message }));
        setLoading(prev => ({ ...prev, agents: false }));
      }

      try {
        const knowledgeBasesData = await getKnowledgeBases();
        setKnowledgeBases(knowledgeBasesData || []);
        setLoading(prev => ({ ...prev, knowledgeBases: false }));
      } catch (err) {
        console.error('Error loading knowledge bases:', err);
        setError(prev => ({ ...prev, knowledgeBases: err.message }));
        setLoading(prev => ({ ...prev, knowledgeBases: false }));
      }
    };

    loadData();
  }, []);

  // Handle WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    try {
      switch (lastMessage.type) {
        case 'conversations_update':
          if (Array.isArray(lastMessage.data)) {
            setConversations(lastMessage.data);
          }
          break;

        case 'new_conversation':
          if (lastMessage.data) {
            setConversations(prev => {
              if (prev.some(c => c.id === lastMessage.data.id)) return prev;
              return [lastMessage.data, ...prev];
            });
          }
          break;

        case 'message_update':
          setConversations(prev =>
            prev.map(conv =>
              conv.id === lastMessage.conversationId
                ? {
                    ...conv,
                    hasNewMessage: true,
                    lastMessage: lastMessage.message,
                    messages: [...(conv.messages || []), lastMessage.message],
                  }
                : conv
            )
          );
          break;

        case 'metrics_update':
          setConversations(prev =>
            prev.map(conv =>
              conv.id === lastMessage.conversationId
                ? {
                    ...conv,
                    metrics: {
                      ...conv.metrics,
                      ...lastMessage.metrics,
                    },
                  }
                : conv
            )
          );
          break;

        case 'agent_update':
          setAgents(prev =>
            prev.map(agent =>
              agent.id === lastMessage.agentId
                ? { ...agent, ...lastMessage.data }
                : agent
            )
          );
          break;

        default:
          break;
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  }, [lastMessage]);

  const updateConversation = (id, data) => {
    setConversations(prev =>
      prev.map(conv => (conv.id === id || conv._id === id ? { ...conv, ...data } : conv))
    );
  };

  const updateAgent = (id, data) => {
    setAgents(prev =>
      prev.map(agent => (agent.id === id || agent._id === id ? { ...agent, ...data } : agent))
    );
  };

  const interveneInConversation = async (conversationId, supervisorId = 'supervisor-001', notes = '') => {
    try {
      await apiIntervene(conversationId, supervisorId, notes);
      updateConversation(conversationId, {
        status: 'escalated',
        humanIntervention: { occurred: true, supervisorId, timestamp: new Date(), notes }
      });
    } catch (error) {
      console.error('Failed to intervene:', error);
      throw error;
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        conversations,
        agents,
        knowledgeBases,
        loading,
        error,
        updateConversation,
        updateAgent,
        interveneInConversation,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export default AppDataContext;
