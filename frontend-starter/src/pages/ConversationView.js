// src/pages/ConversationView.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Textarea,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useToast,
  SimpleGrid,
  Select,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiChevronDown,
  FiChevronLeft,
  FiCheckCircle,
  FiSend,
  FiStar,
  FiMic,
  FiMicOff,
} from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';
import { addMessage, updateConversationStatus, getTemplates, interveneInConversation, releaseIntervention } from '../api';

const ConversationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { conversations = [], updateConversation } = useAppData();

  // Active conversation selection
  const activeId = id || (conversations[0]?.id || 'conv-84291');
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');
  const [isIntervened, setIsIntervened] = useState(false);
  const [supervisorNotes, setSupervisorNotes] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Web Speech API state for voice messaging
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Mobile responsive tabs
  const [mobileTab, setMobileTab] = useState('chat'); // 'chat' | 'customer' | 'queue'
  const [modalMobileTab, setModalMobileTab] = useState('templates'); // 'categories' | 'templates' | 'preview'

  // Template modal state & interactive variable filling
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templatesList, setTemplatesList] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateSearch, setTemplateSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All templates');
  const [selectedChannel, setSelectedChannel] = useState('All channels');
  const [previewPersona, setPreviewPersona] = useState('Elena Vasquez (Current Customer)');
  const [templateFormVars, setTemplateFormVars] = useState({
    customer_name: 'Elena Vasquez',
    order_number: 'ORD-84291',
    refund_amount: '8,420',
    tracking_number: 'TRK-992819',
    reason: 'damaged packaging',
    policy_window: '30 days',
  });

  // Toggle Web Speech API voice dictation
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Voice input not supported',
        description: 'Web Speech API is not supported in this browser. Please use Google Chrome or Edge.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast({
          title: 'Voice input active',
          description: 'Listening via Google Web Speech API... Speak clearly into your mic.',
          status: 'info',
          duration: 2500,
        });
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setReplyText(prev => (prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim()));
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsListening(false);
          toast({
            title: 'Speech recognition notice',
            description: `Voice input: ${event.error}`,
            status: 'warning',
            duration: 3000,
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start failed:', err);
      setIsListening(false);
      toast({
        title: 'Microphone access failed',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Load active conversation
  useEffect(() => {
    const found = conversations.find(c => c.id === activeId || c._id === activeId);
    if (found) {
      setActiveConversation(found);
      setIsIntervened(!!found.humanIntervention?.occurred && found.status === 'escalated');
      if (found.supervisorNotes) {
        setSupervisorNotes(found.supervisorNotes);
      }
      // Update default variable values from conversation
      setTemplateFormVars(prev => ({
        ...prev,
        customer_name: found.customer?.name || prev.customer_name,
        order_number: found.caseNumber ? `#${found.caseNumber}` : prev.order_number,
      }));
    }
  }, [activeId, conversations]);

  // Load templates for modal
  useEffect(() => {
    getTemplates()
      .then(res => {
        setTemplatesList(res);
        if (res.length > 0) setSelectedTemplate(res[0]);
      })
      .catch(err => console.error('Error fetching templates:', err));
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  // Handle Take Over / Intervene
  const handleToggleTakeover = async () => {
    if (!activeConversation) return;

    if (!isIntervened) {
      try {
        await interveneInConversation(activeConversation.id, 'supervisor-001', 'Supervisor taking control');
        setIsIntervened(true);
        updateConversation(activeConversation.id, {
          status: 'escalated',
          humanIntervention: { occurred: true, supervisorId: 'supervisor-001', timestamp: new Date() }
        });
        toast({
          title: 'Control assumed',
          description: 'You are now actively handling this customer conversation.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'Intervention failed',
          description: err.message,
          status: 'error',
          duration: 3000,
        });
      }
    } else {
      // Release control back to AI
      try {
        await releaseIntervention(activeConversation.id, supervisorNotes || 'Issue addressed with customer');
        setIsIntervened(false);
        updateConversation(activeConversation.id, {
          status: 'active',
          humanIntervention: { occurred: true, supervisorId: 'supervisor-001', released: true },
          supervisorNotes
        });
        toast({
          title: 'Returned to AI Agent',
          description: 'Autonomous handling resumed with supervisor guidance notes.',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: 'Release failed',
          description: err.message,
          status: 'error',
          duration: 3000,
        });
      }
    }
  };

  // Handle send supervisor message
  const handleSendMessage = async () => {
    if (!replyText.trim() || !activeConversation) return;
    setIsSending(true);

    try {
      const newMsg = await addMessage(activeConversation.id, {
        sender: 'supervisor',
        text: replyText.trim(),
      });

      const updatedMessages = [...(activeConversation.messages || []), newMsg];
      setActiveConversation(prev => ({
        ...prev,
        messages: updatedMessages,
      }));
      updateConversation(activeConversation.id, { messages: updatedMessages });
      setReplyText('');

      toast({
        title: 'Reply sent',
        status: 'success',
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: 'Failed to send message',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Co-pilot action approval
  const handleApproveCoPilot = () => {
    if (!activeConversation?.coPilotRecommendation) {
      setReplyText("Hi Elena — I've reviewed your case and approved the expedited refund of ₹8,420. The standard review period has been waived.");
    } else {
      setReplyText(activeConversation.coPilotRecommendation.suggestedReply || activeConversation.coPilotRecommendation.action);
    }
    toast({
      title: 'Co-pilot action adopted',
      description: 'Response populated into composer ready to send.',
      status: 'info',
      duration: 2500,
    });
  };

  // Mark as resolved
  const handleMarkResolved = async () => {
    if (!activeConversation) return;
    try {
      await updateConversationStatus(activeConversation.id, 'resolved');
      setActiveConversation(prev => ({ ...prev, status: 'resolved' }));
      updateConversation(activeConversation.id, { status: 'resolved' });
      toast({
        title: 'Conversation resolved',
        description: 'Case marked as successfully resolved.',
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Update failed',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Substitute template variables interactively
  const getSubstitutedContent = (template, customVars = templateFormVars) => {
    if (!template) return '';
    let text = template.content;
    const customerName = customVars.customer_name || activeConversation?.customer?.name || 'Elena Vasquez';
    const company = 'ABC Company';
    const orderId = customVars.order_number || (activeConversation?.caseNumber ? `#${activeConversation.caseNumber}` : 'ORD-84291');
    const refundAmount = customVars.refund_amount || '8,420';
    const trackingNumber = customVars.tracking_number || 'TRK-992819';
    const reasonText = customVars.reason || 'damaged packaging';
    const policyWindow = customVars.policy_window || '30 days';

    text = text.replace(/<user name>|{{name}}|{{customer_name}}/gi, customerName);
    text = text.replace(/<company name>|{{company}}|{{workspace}}/gi, company);
    text = text.replace(/{{order_number}}|{{orderId}}|{{case_number}}/gi, orderId);
    text = text.replace(/{{refund_amount}}|{{amount}}/gi, refundAmount);
    text = text.replace(/{{tracking_number}}|{{tracking}}/gi, trackingNumber);
    text = text.replace(/{{reason}}/gi, reasonText);
    text = text.replace(/{{policy_window}}|{{policyWindow}}/gi, policyWindow);
    text = text.replace(/{{product}}/gi, 'Premium Service');
    return text;
  };

  // Insert template into composer
  const handleInsertTemplate = (template) => {
    const substituted = getSubstitutedContent(template);
    setReplyText(substituted);
    setIsTemplateModalOpen(false);
    toast({
      title: 'Template inserted into composer',
      description: 'Variables filled and populated into reply box.',
      status: 'success',
      duration: 2500,
    });
  };

  // Send template directly to customer
  const handleSendTemplateDirectly = async (template) => {
    if (!activeConversation) return;
    const substituted = getSubstitutedContent(template);
    setIsSending(true);
    setIsTemplateModalOpen(false);

    try {
      const newMsg = await addMessage(activeConversation.id, {
        sender: 'supervisor',
        text: substituted,
      });

      const updatedMessages = [...(activeConversation.messages || []), newMsg];
      setActiveConversation(prev => ({
        ...prev,
        messages: updatedMessages,
      }));
      updateConversation(activeConversation.id, { messages: updatedMessages });
      setReplyText('');

      toast({
        title: 'Template reply sent directly',
        description: `Delivered to ${activeConversation.customer?.name || 'customer'}.`,
        status: 'success',
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: 'Failed to send template message',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSending(false);
    }
  };

  // Filtered templates for modal
  const filteredTemplates = templatesList.filter(t => {
    const matchesCategory = selectedCategory === 'All templates' ||
      t.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesChannel = selectedChannel === 'All channels' ||
      t.channel?.toLowerCase() === selectedChannel.toLowerCase() ||
      t.tags?.some(tag => tag.toLowerCase() === selectedChannel.toLowerCase());
    const matchesSearch = !templateSearch ||
      t.name?.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.content?.toLowerCase().includes(templateSearch.toLowerCase()) ||
      t.category?.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCategory && matchesChannel && matchesSearch;
  });

  // Filtered conversation list
  const filteredConversations = conversations.filter(c => {
    if (!searchTerm) return true;
    const name = c.customer?.name?.toLowerCase() || '';
    const caseId = c.caseNumber || c.id || '';
    return name.includes(searchTerm.toLowerCase()) || caseId.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const currentCustomer = activeConversation?.customer || {
    name: 'Elena Vasquez',
    tier: 'VIP',
    tenure: '3.8 years',
    location: 'Madrid',
    lifetimeValue: '₹1.24L',
    orders: 38,
    returnRate: '5.2%',
    sentiment: -0.62,
  };

  return (
    <Box>
      {/* Mobile Tab Switcher (Visible on mobile base, hidden on lg screens) */}
      <Flex
        display={{ base: 'flex', lg: 'none' }}
        bg="#f1f5f9"
        p={1}
        borderRadius="10px"
        gap={1}
        mb={3}
      >
        <Button
          size="sm"
          flex={1}
          variant={mobileTab === 'chat' ? 'solid' : 'ghost'}
          bg={mobileTab === 'chat' ? 'white' : 'transparent'}
          color={mobileTab === 'chat' ? '#483c72' : '#64748b'}
          fontWeight={mobileTab === 'chat' ? '700' : '500'}
          boxShadow={mobileTab === 'chat' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}
          onClick={() => setMobileTab('chat')}
        >
          💬 Chat
        </Button>
        <Button
          size="sm"
          flex={1}
          variant={mobileTab === 'customer' ? 'solid' : 'ghost'}
          bg={mobileTab === 'customer' ? 'white' : 'transparent'}
          color={mobileTab === 'customer' ? '#483c72' : '#64748b'}
          fontWeight={mobileTab === 'customer' ? '700' : '500'}
          boxShadow={mobileTab === 'customer' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}
          onClick={() => setMobileTab('customer')}
        >
          👤 Customer
        </Button>
        <Button
          size="sm"
          flex={1}
          variant={mobileTab === 'queue' ? 'solid' : 'ghost'}
          bg={mobileTab === 'queue' ? 'white' : 'transparent'}
          color={mobileTab === 'queue' ? '#483c72' : '#64748b'}
          fontWeight={mobileTab === 'queue' ? '700' : '500'}
          boxShadow={mobileTab === 'queue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}
          onClick={() => setMobileTab('queue')}
        >
          📋 Queue ({filteredConversations.length})
        </Button>
      </Flex>

      <Flex gap={4} direction={{ base: 'column', lg: 'row' }} h={{ base: 'auto', lg: 'calc(100vh - 100px)' }} minH={{ base: 'auto', lg: '700px' }}>
        {/* COLUMN 1: Customer Conversations List */}
        <Box
          w={{ base: '100%', lg: '280px' }}
          display={{ base: mobileTab === 'queue' ? 'flex' : 'none', lg: 'flex' }}
          bg="white"
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          p={3}
          flexDirection="column"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
          maxH={{ base: '75vh', lg: 'none' }}
        >
          <Text fontSize="15px" fontWeight="700" color="#1e293b" mb={3} px={1}>
            Customer Conversations
          </Text>

          <InputGroup size="sm" mb={3}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="#94a3b8" />
            </InputLeftElement>
            <Input
              placeholder="Search customer or case..."
              borderRadius="8px"
              bg="#f8fafc"
              borderColor="#e2e8f0"
              fontSize="12px"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <VStack spacing={2} align="stretch" overflowY="auto" flex="1">
            {filteredConversations.map((conv) => {
              const isSelected = conv.id === activeId;
              const isCrit = conv.alertLevel === 'high' || conv.risk >= 80;
              const isMed = conv.alertLevel === 'medium' || conv.risk >= 60;
              const badgeBg = isCrit ? '#fee2e2' : isMed ? '#fef3c7' : '#e0f2fe';
              const badgeText = isCrit ? '#dc2626' : isMed ? '#d97706' : '#0284c7';
              const badgeLabel = isCrit ? 'Critical' : isMed ? 'High' : 'Watch';

              return (
                <Box
                  key={conv.id}
                  p={3}
                  borderRadius="10px"
                  bg={isSelected ? '#faf8fc' : 'white'}
                  border="1.5px solid"
                  borderColor={isSelected ? '#483c72' : '#f1f5f9'}
                  cursor="pointer"
                  onClick={() => {
                    navigate(`/conversation/${conv.id}`);
                    setMobileTab('chat');
                  }}
                  transition="all 0.15s ease"
                  _hover={{ borderColor: '#483c72', bg: '#faf8fc' }}
                >
                  <Flex justify="space-between" align="flex-start" mb={1}>
                    <HStack spacing={2}>
                      <Avatar
                        size="xs"
                        name={conv.customer?.name}
                        bg="#d8a27a"
                        color="#3e220f"
                        fontWeight="700"
                        fontSize="11px"
                      />
                      <Box>
                        <Text fontSize="13px" fontWeight="700" color="#1e293b" lineHeight="1.2">
                          {conv.customer?.name || 'Customer'}
                        </Text>
                        <Text fontSize="11px" color="#64748b">
                          {conv.category || 'Refund blocked'}
                        </Text>
                      </Box>
                    </HStack>
                    <Text fontSize="11px" color="#94a3b8" fontFamily="monospace">
                      {conv.waitTime || '12:42'}
                    </Text>
                  </Flex>

                  <Flex justify="flex-start" mt={2}>
                    <Badge
                      bg={badgeBg}
                      color={badgeText}
                      fontSize="10px"
                      fontWeight="700"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                    >
                      {badgeLabel}
                    </Badge>
                  </Flex>
                </Box>
              );
            })}
          </VStack>
        </Box>

        {/* COLUMN 2: Center Conversation Stream */}
        <Box
          flex="1"
          w={{ base: '100%', lg: 'auto' }}
          minW={0}
          h={{ base: 'calc(100vh - 160px)', lg: 'auto' }}
          minH={{ base: '540px', lg: 'none' }}
          display={{ base: mobileTab === 'chat' ? 'flex' : 'none', lg: 'flex' }}
          bg="white"
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          flexDirection="column"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
          overflow="hidden"
        >
          {/* Header */}
          <Flex
            p={{ base: 3, md: 4 }}
            borderBottom="1px solid"
            borderColor="#f1f5f9"
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={2}
            bg="white"
          >
            <HStack spacing={3} minW={0} flex={1}>
              <Avatar
                size={{ base: 'sm', md: 'md' }}
                name={currentCustomer.name}
                bg="#d8a27a"
                color="#3e220f"
                fontWeight="700"
              />
              <Box minW={0}>
                <HStack spacing={2} align="center" wrap="wrap">
                  <Text fontSize={{ base: '14px', md: '16px' }} fontWeight="700" color="#1e293b" isTruncated>
                    {currentCustomer.name} • Case #{activeConversation?.caseNumber || '84291'}
                  </Text>
                  <Badge bg="#fee2e2" color="#dc2626" fontSize="10px" px={2} py={0.5} borderRadius="md" fontWeight="700">
                    ● Critical
                  </Badge>
                </HStack>
                <Text fontSize="11px" color="#64748b" isTruncated>
                  Returns • Web chat • EN-US • VIP tier
                </Text>
              </Box>
            </HStack>

            <HStack spacing={2}>
              <Button
                display={{ base: 'inline-flex', lg: 'none' }}
                size="xs"
                variant="outline"
                color="#483c72"
                borderColor="#cbd5e1"
                onClick={() => setMobileTab('customer')}
              >
                Customer Info
              </Button>
              <Button
                size="sm"
                bg={isIntervened ? '#dc2626' : '#483c72'}
                color="white"
                fontSize="13px"
                fontWeight="600"
                _hover={{ bg: isIntervened ? '#b91c1c' : '#3e3363' }}
                onClick={handleToggleTakeover}
              >
                {isIntervened ? 'Release to AI' : 'Take over'}
              </Button>
            </HStack>
          </Flex>

          {/* Yellow Alert Banner */}
          <Box bg="#fffbeb" px={4} py={2.5} borderBottom="1px solid" borderColor="#fef3c7">
            <HStack spacing={2} align="center">
              <Box w="8px" h="8px" borderRadius="full" bg="#f59e0b" />
              <Text fontSize="12px" fontWeight="600" color="#92400e">
                SLA breach likely in 03:18
              </Text>
              <Text fontSize="12px" color="#b45309">
                • AI confidence fell after policy exception request
              </Text>
            </HStack>
          </Box>

          {/* Messages Stream */}
          <Box
            flex="1"
            p={4}
            overflowY="auto"
            bg="#ffffff"
            data-testid="message-list"
            className="message-list conversation-messages"
          >
            <VStack spacing={4} align="stretch">
              {(activeConversation?.messages || [
                { sender: 'customer', text: 'I returned the item last week, but the refund is still blocked.', timestamp: new Date(Date.now() - 14 * 60000) },
                { sender: 'agent', text: "I found the return receipt and carrier confirmation. I'm checking the refund policy now.", timestamp: new Date(Date.now() - 13 * 60000) },
                { sender: 'customer', text: "I need the refund today. This is the second time I'm contacting support.", timestamp: new Date(Date.now() - 11 * 60000) },
                { sender: 'agent', text: "The amount exceeds my approval limit. I've prepared the evidence for supervisor review.", timestamp: new Date(Date.now() - 10 * 60000) }
              ]).map((msg, index) => {
                const isCustomer = msg.sender === 'customer';
                const isSupervisor = msg.sender === 'supervisor';
                const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:32';

                return (
                  <Box
                    key={index}
                    alignSelf={isCustomer ? 'flex-start' : 'flex-end'}
                    maxW="75%"
                  >
                    <Text
                      fontSize="10px"
                      fontWeight="700"
                      color="#94a3b8"
                      mb={1}
                      textAlign={isCustomer ? 'left' : 'right'}
                      letterSpacing="0.3px"
                    >
                      {isSupervisor ? 'SUPERVISOR' : isCustomer ? 'CUSTOMER' : 'AI AGENT'} · {dateStr}
                    </Text>
                    <Box
                      p={3.5}
                      borderRadius="12px"
                      bg={isSupervisor ? '#483c72' : isCustomer ? '#f1f5f9' : '#ede9f6'}
                      color={isSupervisor ? 'white' : '#1e293b'}
                      fontSize="13px"
                      lineHeight="1.5"
                    >
                      <Text>{msg.text}</Text>
                    </Box>
                  </Box>
                );
              })}
              <div ref={messagesEndRef} />
            </VStack>
          </Box>

          {/* Co-Pilot Recommendation Card */}
          <Box p={4} bg="#fdfdfe" borderTop="1px solid" borderColor="#f1f5f9">
            <Box
              bg="white"
              p={4}
              borderRadius="12px"
              border="1px solid"
              borderColor="#e2e8f0"
              boxShadow="0 1px 3px rgba(0,0,0,0.02)"
            >
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Box>
                  <Text fontSize="13px" fontWeight="700" color="#1e293b">
                    Co-pilot recommendation
                  </Text>
                  <Text fontSize="11px" color="#94a3b8">
                    Generated from policy, customer tier, and conversation sentiment
                  </Text>
                </Box>
                <Badge bg="#dcfce7" color="#15803d" px={2} py={0.5} borderRadius="full" fontSize="11px" fontWeight="700">
                  ● Confidence 88%
                </Badge>
              </Flex>

              <Text fontSize="13px" fontWeight="600" color="#1e293b" mb={1}>
                Approve expedited refund of ₹8,420 and waive the standard review period.
              </Text>
              <Text fontSize="11px" color="#64748b" mb={3}>
                Evidence: return scan received • item category eligible • customer lifetime value: high
              </Text>

              <HStack spacing={2}>
                <Button
                  size="xs"
                  bg="#483c72"
                  color="white"
                  fontWeight="600"
                  _hover={{ bg: '#3e3363' }}
                  onClick={handleApproveCoPilot}
                >
                  Approve action
                </Button>
                <Button size="xs" variant="outline" fontSize="11px" onClick={handleApproveCoPilot}>
                  Edit response
                </Button>
                <Button size="xs" variant="outline" fontSize="11px">
                  Escalate policy
                </Button>
              </HStack>
            </Box>
          </Box>

          {/* Supervisor Response Box */}
          <Box p={4} bg="white" borderTop="1px solid" borderColor="#f1f5f9">
            <Flex justify="space-between" align="center" mb={2}>
              <Text fontSize="12px" fontWeight="700" color="#475569">
                Supervisor response
              </Text>

              {/* Template dropdown button that triggers modal */}
              <Button
                size="xs"
                variant="outline"
                borderRadius="6px"
                fontSize="12px"
                color="#483c72"
                borderColor="#cbd5e1"
                leftIcon={<Avatar size="2xs" name="Neha Prasad" bg="#d8a27a" />}
                rightIcon={<FiChevronDown size={12} />}
                onClick={() => setIsTemplateModalOpen(true)}
                title="Response Templates"
                aria-label="template"
              >
                Template
              </Button>
            </Flex>

            {isListening && (
              <Flex align="center" gap={2} mb={2} px={3} py={1.5} bg="#fef2f2" borderRadius="8px" border="1px solid #fee2e2">
                <Box w="8px" h="8px" borderRadius="full" bg="#ef4444" />
                <Text fontSize="11px" fontWeight="600" color="#b91c1c">
                  Listening via Google Web Speech API... Speak clearly into your microphone
                </Text>
                <Button size="2xs" colorScheme="red" variant="ghost" onClick={toggleVoiceRecording} ml="auto">
                  Stop
                </Button>
              </Flex>
            )}

            <Flex gap={2} align="stretch" wrap={{ base: 'wrap', sm: 'nowrap' }}>
              <Textarea
                placeholder="Type your supervisor message, or click the microphone to dictate with Web Speech API..."
                size="sm"
                borderRadius="8px"
                fontSize="13px"
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                flex="1"
                minW={{ base: '100%', sm: '200px' }}
              />
              <HStack spacing={2} align="center" justify={{ base: 'flex-end', sm: 'center' }} w={{ base: '100%', sm: 'auto' }}>
                <Tooltip label={isListening ? "Stop voice dictation" : "Dictate via Google Web Speech API"} hasArrow>
                  <IconButton
                    aria-label="Voice input"
                    icon={isListening ? <FiMicOff size={16} /> : <FiMic size={16} />}
                    colorScheme={isListening ? "red" : "gray"}
                    variant={isListening ? "solid" : "outline"}
                    borderColor="#cbd5e1"
                    color={isListening ? "white" : "#483c72"}
                    h="38px"
                    px={3}
                    onClick={toggleVoiceRecording}
                    title="Voice Input (Google Web Speech API)"
                  />
                </Tooltip>
                <Button
                  bg="#483c72"
                  color="white"
                  h="38px"
                  px={4}
                  fontSize="13px"
                  fontWeight="600"
                  _hover={{ bg: '#3e3363' }}
                  onClick={handleSendMessage}
                  isLoading={isSending}
                  rightIcon={<FiSend size={13} />}
                >
                  Send reply
                </Button>
              </HStack>
            </Flex>
          </Box>
        </Box>

        {/* COLUMN 3: Customer Intelligence & Diagnostics */}
        <Box
          w={{ base: '100%', lg: '300px' }}
          display={{ base: mobileTab === 'customer' ? 'flex' : 'none', lg: 'flex' }}
          bg="white"
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          p={4}
          flexDirection="column"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
          overflowY="auto"
        >
          <Button
            display={{ base: 'inline-flex', lg: 'none' }}
            size="xs"
            variant="ghost"
            color="#483c72"
            mb={2}
            alignSelf="flex-start"
            leftIcon={<FiChevronLeft />}
            onClick={() => setMobileTab('chat')}
          >
            ← Back to conversation
          </Button>

          <Text fontSize="15px" fontWeight="700" color="#1e293b" mb={3}>
            Customer intelligence
          </Text>

          <HStack spacing={3} mb={4}>
            <Avatar
              size="md"
              name={currentCustomer.name}
              bg="#d8a27a"
              color="#3e220f"
              fontWeight="700"
            />
            <Box>
              <Text fontSize="14px" fontWeight="700" color="#1e293b">
                {currentCustomer.name} • Case #{activeConversation?.caseNumber || '84291'}
              </Text>
              <Text fontSize="11px" color="#64748b">
                VIP • 3.8 years • Madrid
              </Text>
            </Box>
          </HStack>

          {/* 4 Stat Grid */}
          <SimpleGrid columns={2} spacing={3} mb={5} p={3} bg="#f8fafc" borderRadius="10px">
            <Box>
              <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                LIFETIME VALUE
              </Text>
              <Text fontSize="16px" fontWeight="700" color="#1e293b">
                {currentCustomer.lifetimeValue || '₹1.24L'}
              </Text>
            </Box>
            <Box>
              <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                ORDERS
              </Text>
              <Text fontSize="16px" fontWeight="700" color="#1e293b">
                {currentCustomer.orders || '38'}
              </Text>
            </Box>
            <Box>
              <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                RETURN RATE
              </Text>
              <Text fontSize="16px" fontWeight="700" color="#1e293b">
                {currentCustomer.returnRate || '5.2%'}
              </Text>
            </Box>
            <Box>
              <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                SENTIMENT
              </Text>
              <Text fontSize="16px" fontWeight="700" color="#dc2626">
                {currentCustomer.sentiment || '-0.62'}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Case Diagnostics */}
          <Box mb={5}>
            <Text fontSize="13px" fontWeight="700" color="#1e293b" mb={1}>
              Case diagnostics
            </Text>
            <Text fontSize="11px" color="#94a3b8" mb={3}>
              Signals contributing to risk
            </Text>

            <VStack spacing={3} align="stretch">
              <Box>
                <Flex justify="space-between" fontSize="12px" mb={1}>
                  <Text color="#475569">Repeat contact</Text>
                  <Text fontWeight="700" color="#dc2626">92%</Text>
                </Flex>
                <Progress value={92} size="xs" colorScheme="red" borderRadius="full" />
              </Box>

              <Box>
                <Flex justify="space-between" fontSize="12px" mb={1}>
                  <Text color="#475569">Negative sentiment</Text>
                  <Text fontWeight="700" color="#d97706">78%</Text>
                </Flex>
                <Progress value={78} size="xs" colorScheme="orange" borderRadius="full" />
              </Box>

              <Box>
                <Flex justify="space-between" fontSize="12px" mb={1}>
                  <Text color="#475569">Policy exception</Text>
                  <Text fontWeight="700" color="#0284c7">66%</Text>
                </Flex>
                <Progress value={66} size="xs" colorScheme="blue" borderRadius="full" />
              </Box>

              <Box>
                <Flex justify="space-between" fontSize="12px" mb={1}>
                  <Text color="#475569">Churn propensity</Text>
                  <Text fontWeight="700" color="#7c3aed">58%</Text>
                </Flex>
                <Progress value={58} size="xs" colorScheme="purple" borderRadius="full" />
              </Box>
            </VStack>
          </Box>

          {/* Feedback Notes */}
          <Box mb={4} flex="1">
            <Text fontSize="12px" fontWeight="600" color="#64748b" mb={1.5}>
              Feedback Notes
            </Text>
            <Box
              bg="#fef08a"
              p={3}
              borderRadius="10px"
              boxShadow="inset 0 1px 3px rgba(0,0,0,0.05)"
              minH="120px"
            >
              <Textarea
                placeholder="Write supervisor notes or coaching tips for this case..."
                border="none"
                p={0}
                fontSize="12px"
                color="#713f12"
                bg="transparent"
                _focus={{ boxShadow: 'none' }}
                _placeholder={{ color: '#a16207' }}
                rows={4}
                value={supervisorNotes}
                onChange={(e) => setSupervisorNotes(e.target.value)}
              />
            </Box>
          </Box>

          {/* Mark as Resolved button */}
          <Button
            w="100%"
            bg="#483c72"
            color="white"
            fontWeight="600"
            fontSize="13px"
            py={5}
            _hover={{ bg: '#3e3363' }}
            onClick={handleMarkResolved}
          >
            Mark as Resolved
          </Button>
        </Box>
      </Flex>

      {/* RESPONSE TEMPLATES MODAL (Matches Figma 'Conversation Screen - Template.png') */}
      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        size="6xl"
        isCentered
      >
        <ModalOverlay bg="rgba(30, 20, 50, 0.45)" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="16px" overflow="hidden" maxH="90vh" m={{ base: 2, md: 'auto' }}>
          <ModalBody p={0}>
            {/* Mobile Tab Switcher inside Modal */}
            <Flex
              display={{ base: 'flex', md: 'none' }}
              bg="#f1f5f9"
              p={1}
              gap={1}
              borderBottom="1px solid #e2e8f0"
            >
              <Button
                size="xs"
                flex={1}
                variant={modalMobileTab === 'templates' ? 'solid' : 'ghost'}
                bg={modalMobileTab === 'templates' ? 'white' : 'transparent'}
                color={modalMobileTab === 'templates' ? '#483c72' : '#64748b'}
                fontWeight={modalMobileTab === 'templates' ? '700' : '500'}
                boxShadow={modalMobileTab === 'templates' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}
                onClick={() => setModalMobileTab('templates')}
              >
                Templates ({filteredTemplates.length})
              </Button>
              <Button
                size="xs"
                flex={1}
                variant={modalMobileTab === 'preview' ? 'solid' : 'ghost'}
                bg={modalMobileTab === 'preview' ? 'white' : 'transparent'}
                color={modalMobileTab === 'preview' ? '#483c72' : '#64748b'}
                fontWeight={modalMobileTab === 'preview' ? '700' : '500'}
                boxShadow={modalMobileTab === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}
                onClick={() => setModalMobileTab('preview')}
              >
                Variables & Preview
              </Button>
              <Button
                size="xs"
                flex={1}
                variant={modalMobileTab === 'categories' ? 'solid' : 'ghost'}
                bg={modalMobileTab === 'categories' ? 'white' : 'transparent'}
                color={modalMobileTab === 'categories' ? '#483c72' : '#64748b'}
                fontWeight={modalMobileTab === 'categories' ? '700' : '500'}
                boxShadow={modalMobileTab === 'categories' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'}
                onClick={() => setModalMobileTab('categories')}
              >
                Categories
              </Button>
            </Flex>

            <Flex h={{ base: '75vh', md: '680px' }} direction={{ base: 'column', md: 'row' }}>
              {/* Left Column: Template Library */}
              <Box
                w={{ base: '100%', md: '230px' }}
                display={{ base: modalMobileTab === 'categories' ? 'block' : 'none', md: 'block' }}
                borderRight={{ base: 'none', md: '1px solid' }}
                borderColor="#eef0f5"
                p={4}
                bg="#fafbfc"
                overflowY="auto"
              >
                <Text fontSize="11px" fontWeight="700" color="#94a3b8" letterSpacing="0.5px" textTransform="uppercase" mb={3}>
                  TEMPLATE LIBRARY
                </Text>

                <InputGroup size="sm" mb={4}>
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="#94a3b8" size={13} />
                  </InputLeftElement>
                  <Input
                    placeholder="Search categories"
                    borderRadius="8px"
                    bg="white"
                    fontSize="12px"
                    borderColor="#e2e8f0"
                  />
                </InputGroup>

                <VStack spacing={1} align="stretch" mb={4}>
                  <Flex
                    justify="space-between"
                    align="center"
                    px={3}
                    py={2}
                    borderRadius="8px"
                    bg={selectedCategory === 'All templates' ? '#ede9f6' : 'transparent'}
                    color={selectedCategory === 'All templates' ? '#483c72' : '#475569'}
                    fontWeight={selectedCategory === 'All templates' ? '700' : '500'}
                    fontSize="13px"
                    cursor="pointer"
                    onClick={() => {
                      setSelectedCategory('All templates');
                      setModalMobileTab('templates');
                    }}
                  >
                    <HStack spacing={2}>
                      <Box w="6px" h="6px" borderRadius="full" bg="#7c3aed" />
                      <Text>All templates</Text>
                    </HStack>
                    <Badge bg="#e9d5ff" color="#7c3aed" fontSize="10px" borderRadius="full" px={1.5}>
                      {templatesList.length || 24}
                    </Badge>
                  </Flex>

                  <Flex
                    px={3}
                    py={1.5}
                    fontSize="13px"
                    color="#64748b"
                    cursor="pointer"
                    onClick={() => {
                      setSelectedCategory('Popular');
                      setModalMobileTab('templates');
                    }}
                  >
                    <HStack spacing={2}>
                      <Box w="6px" h="6px" borderRadius="full" bg="#f59e0b" />
                      <Text>Popular</Text>
                    </HStack>
                  </Flex>
                  <Flex
                    px={3}
                    py={1.5}
                    fontSize="13px"
                    color="#64748b"
                    cursor="pointer"
                    onClick={() => {
                      setSelectedCategory('Low use');
                      setModalMobileTab('templates');
                    }}
                  >
                    <HStack spacing={2}>
                      <Box w="6px" h="6px" borderRadius="full" bg="#94a3b8" />
                      <Text>Low use</Text>
                    </HStack>
                  </Flex>
                </VStack>

                <Text fontSize="10px" fontWeight="700" color="#94a3b8" textTransform="uppercase" mb={2}>
                  BY JOURNEY
                </Text>
                <VStack spacing={1} align="stretch" mb={4}>
                  {['Onboarding', 'Billing', 'Engagement', 'Transaction'].map((j) => (
                    <Flex
                      key={j}
                      px={3}
                      py={1.5}
                      borderRadius="6px"
                      fontSize="13px"
                      bg={selectedCategory === j ? '#ede9f6' : 'transparent'}
                      color={selectedCategory === j ? '#483c72' : '#475569'}
                      fontWeight={selectedCategory === j ? '700' : '500'}
                      cursor="pointer"
                      onClick={() => {
                        setSelectedCategory(j);
                        setModalMobileTab('templates');
                      }}
                    >
                      <HStack spacing={2}>
                        <Box w="6px" h="6px" borderRadius="full" bg="#3b82f6" />
                        <Text>{j}</Text>
                      </HStack>
                    </Flex>
                  ))}
                </VStack>

                <Text fontSize="10px" fontWeight="700" color="#94a3b8" textTransform="uppercase" mb={2}>
                  BY CHANNEL
                </Text>
                <VStack spacing={1} align="stretch">
                  {['Email', 'Website', 'Mobile', 'Messenger'].map((ch) => (
                    <Flex
                      key={ch}
                      px={3}
                      py={1.5}
                      borderRadius="6px"
                      fontSize="13px"
                      bg={selectedChannel === ch ? '#ede9f6' : 'transparent'}
                      color={selectedChannel === ch ? '#483c72' : '#475569'}
                      fontWeight={selectedChannel === ch ? '700' : '500'}
                      cursor="pointer"
                      onClick={() => {
                        setSelectedChannel(ch);
                        setModalMobileTab('templates');
                      }}
                    >
                      <HStack spacing={2}>
                        <Box w="6px" h="6px" borderRadius="full" bg="#10b981" />
                        <Text>{ch}</Text>
                      </HStack>
                    </Flex>
                  ))}
                </VStack>
              </Box>

              {/* Center Column: Response Templates Grid */}
              <Box
                flex="1"
                w={{ base: '100%', md: 'auto' }}
                display={{ base: modalMobileTab === 'templates' ? 'flex' : 'none', md: 'flex' }}
                p={{ base: 3, md: 5 }}
                flexDirection="column"
                overflow="hidden"
              >
                <Box mb={4}>
                  <Text fontSize="18px" fontWeight="700" color="#1e293b">
                    Response Templates
                  </Text>
                  <Text fontSize="12px" color="#64748b">
                    Choose a reply and customize it before inserting.
                  </Text>
                </Box>

                <HStack spacing={3} mb={3} wrap="wrap">
                  <InputGroup size="sm" flex="1" minW="180px">
                    <InputLeftElement pointerEvents="none">
                      <FiSearch color="#94a3b8" size={13} />
                    </InputLeftElement>
                    <Input
                      placeholder="Search title, message, or tag"
                      borderRadius="8px"
                      fontSize="12px"
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                    />
                  </InputGroup>

                  <Select
                    size="sm"
                    w={{ base: '100%', sm: '130px' }}
                    borderRadius="8px"
                    fontSize="12px"
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                  >
                    <option value="All channels">All channels</option>
                    <option value="Website">Website</option>
                    <option value="Messenger">Messenger</option>
                    <option value="Email">Email</option>
                    <option value="Mobile">Mobile</option>
                  </Select>

                  <Select size="sm" w={{ base: '100%', sm: '120px' }} borderRadius="8px" fontSize="12px">
                    <option>Most used</option>
                    <option>Recently used</option>
                    <option>Alphabetical</option>
                  </Select>
                </HStack>

                <HStack justify="space-between" mb={3} wrap="wrap" gap={2}>
                  <HStack spacing={2} wrap="wrap">
                    <Button size="xs" borderRadius="full" bg="#ede9f6" color="#483c72" fontWeight="700">
                      All templates
                    </Button>
                    <Button size="xs" borderRadius="full" variant="outline" fontSize="11px">
                      My team
                    </Button>
                    <Button size="xs" borderRadius="full" variant="outline" fontSize="11px">
                      Recently used
                    </Button>
                  </HStack>
                  <Text fontSize="11px" color="#94a3b8">
                    {filteredTemplates.length} results
                  </Text>
                </HStack>

                {/* Templates Grid (responsive columns) */}
                <Box flex="1" overflowY="auto" pr={1}>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                    {filteredTemplates.map((tmpl) => {
                      const isSelected = selectedTemplate?.id === tmpl.id;
                      return (
                        <Box
                          key={tmpl.id}
                          p={3.5}
                          borderRadius="12px"
                          border="1.5px solid"
                          borderColor={isSelected ? '#483c72' : '#eef0f5'}
                          bg={isSelected ? '#faf8fc' : 'white'}
                          cursor="pointer"
                          onClick={() => {
                            setSelectedTemplate(tmpl);
                            setModalMobileTab('preview');
                          }}
                          transition="all 0.15s ease"
                          _hover={{ borderColor: '#483c72', bg: '#faf8fc' }}
                        >
                          {/* Skeleton banner icon */}
                          <Flex justify="space-between" align="center" mb={2}>
                            <HStack spacing={2}>
                              <Box w="12px" h="12px" borderRadius="full" bg="#b8a8d9" />
                              <Box w="80px" h="8px" borderRadius="full" bg="#f1f5f9" />
                            </HStack>
                            <FiStar size={14} color={tmpl.isFavorite ? '#f59e0b' : '#cbd5e1'} />
                          </Flex>

                          <Box w="60px" h="6px" borderRadius="full" bg="#f1f5f9" mb={3} />

                          <Text fontSize="13px" fontWeight="700" color="#1e293b" mb={1}>
                            {tmpl.name}
                          </Text>
                          <Text fontSize="11px" color="#64748b" noOfLines={2} mb={3}>
                            {tmpl.title || tmpl.content}
                          </Text>

                          <Flex justify="space-between" align="center">
                            <HStack spacing={1}>
                              <Badge bg="#ede9f6" color="#483c72" fontSize="10px" borderRadius="md" px={1.5}>
                                {tmpl.category}
                              </Badge>
                              {tmpl.channel && (
                                <Badge bg="#f1f5f9" color="#475569" fontSize="10px" borderRadius="md" px={1.5}>
                                  {tmpl.channel}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="11px" color="#94a3b8">
                              {tmpl.usageCount || 128} uses
                            </Text>
                          </Flex>
                        </Box>
                      );
                    })}
                  </SimpleGrid>
                </Box>
              </Box>

              {/* Right Column: Interactive Variable Filling & Live Preview */}
              <Box
                w={{ base: '100%', md: '360px' }}
                display={{ base: modalMobileTab === 'preview' ? 'flex' : 'none', md: 'flex' }}
                borderLeft={{ base: 'none', md: '1px solid' }}
                borderColor="#eef0f5"
                p={4}
                bg="white"
                flexDirection="column"
                overflowY="auto"
              >
                <Button
                  display={{ base: 'inline-flex', md: 'none' }}
                  size="xs"
                  variant="ghost"
                  color="#483c72"
                  mb={2}
                  alignSelf="flex-start"
                  leftIcon={<FiChevronLeft />}
                  onClick={() => setModalMobileTab('templates')}
                >
                  ← Back to templates
                </Button>

                <Text fontSize="15px" fontWeight="700" color="#1e293b" mb={0.5}>
                  Preview & Variables
                </Text>
                <Text fontSize="11px" color="#64748b" mb={3}>
                  Fill variables and preview before inserting or sending.
                </Text>

                <Box mb={3}>
                  <Text fontSize="10px" fontWeight="700" color="#94a3b8" letterSpacing="0.5px" textTransform="uppercase" mb={1}>
                    PREVIEW AS
                  </Text>
                  <Select
                    size="xs"
                    borderRadius="6px"
                    fontSize="12px"
                    value={previewPersona}
                    onChange={(e) => setPreviewPersona(e.target.value)}
                  >
                    <option value="Elena Vasquez (Current Customer)">Elena Vasquez (Current Customer)</option>
                    <option value="New visitor">New visitor</option>
                    <option value="Marcus Lee">Marcus Lee</option>
                  </Select>
                </Box>

                {/* Fill in Variables Form */}
                <Box mb={3} p={3} bg="#f8fafc" borderRadius="10px" border="1px solid" borderColor="#e2e8f0">
                  <Text fontSize="10px" fontWeight="700" color="#483c72" textTransform="uppercase" letterSpacing="0.5px" mb={2}>
                    Fill in Variables
                  </Text>
                  <VStack spacing={2} align="stretch">
                    <Box>
                      <Text fontSize="10px" fontWeight="600" color="#64748b" mb={0.5}>
                        Customer Name {"{{customer_name}}"}
                      </Text>
                      <Input
                        size="xs"
                        borderRadius="6px"
                        fontSize="12px"
                        bg="white"
                        value={templateFormVars.customer_name}
                        onChange={(e) => setTemplateFormVars({ ...templateFormVars, customer_name: e.target.value })}
                      />
                    </Box>
                    <Box>
                      <Text fontSize="10px" fontWeight="600" color="#64748b" mb={0.5}>
                        Order / Case # {"{{order_number}}"}
                      </Text>
                      <Input
                        size="xs"
                        borderRadius="6px"
                        fontSize="12px"
                        bg="white"
                        value={templateFormVars.order_number}
                        onChange={(e) => setTemplateFormVars({ ...templateFormVars, order_number: e.target.value })}
                      />
                    </Box>
                    <SimpleGrid columns={2} spacing={2}>
                      <Box>
                        <Text fontSize="10px" fontWeight="600" color="#64748b" mb={0.5}>
                          Amount {"{{refund_amount}}"}
                        </Text>
                        <Input
                          size="xs"
                          borderRadius="6px"
                          fontSize="12px"
                          bg="white"
                          value={templateFormVars.refund_amount}
                          onChange={(e) => setTemplateFormVars({ ...templateFormVars, refund_amount: e.target.value })}
                        />
                      </Box>
                      <Box>
                        <Text fontSize="10px" fontWeight="600" color="#64748b" mb={0.5}>
                          Tracking {"{{tracking_number}}"}
                        </Text>
                        <Input
                          size="xs"
                          borderRadius="6px"
                          fontSize="12px"
                          bg="white"
                          value={templateFormVars.tracking_number}
                          onChange={(e) => setTemplateFormVars({ ...templateFormVars, tracking_number: e.target.value })}
                        />
                      </Box>
                    </SimpleGrid>
                  </VStack>
                </Box>

                <Text fontSize="10px" fontWeight="700" color="#94a3b8" letterSpacing="0.5px" textTransform="uppercase" mb={1}>
                  LIVE MESSAGE PREVIEW
                </Text>

                {/* Substituted Card Preview */}
                <Box
                  p={3.5}
                  borderRadius="10px"
                  border="1px solid"
                  borderColor="#eef0f5"
                  bg="#fbfcfe"
                  mb={3}
                  flex="1"
                >
                  <HStack spacing={2} align="center" mb={2}>
                    <Avatar size="xs" name={templateFormVars.customer_name || currentCustomer.name} bg="#b8a8d9" />
                    <Text fontSize="12px" fontWeight="700" color="#1e293b">
                      Welcome, {(templateFormVars.customer_name || currentCustomer.name)?.split(' ')[0] || 'Elena'} 👋
                    </Text>
                  </HStack>

                  <Text fontSize="12px" color="#334155" lineHeight="1.6" mb={3} whiteSpace="pre-wrap">
                    {selectedTemplate ? getSubstitutedContent(selectedTemplate, templateFormVars) : 'Select a template on the left.'}
                  </Text>
                </Box>

                {/* Variable Substitution Indicator Banner */}
                <Box bg="#ecfdf5" p={2.5} borderRadius="8px" border="1px solid" borderColor="#d1fae5" mb={3}>
                  <HStack spacing={2} align="center">
                    <FiCheckCircle color="#059669" size={14} />
                    <Text fontSize="11px" fontWeight="700" color="#065f46">
                      Variables dynamically resolved
                    </Text>
                  </HStack>
                  <Text fontSize="10px" color="#047857" pl={5}>
                    Substituted into live message preview ready for dispatch
                  </Text>
                </Box>

                <HStack spacing={2} justify="flex-end" pt={1} wrap="wrap">
                  <Button size="xs" variant="outline" onClick={() => setIsTemplateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="xs"
                    variant="outline"
                    color="#483c72"
                    borderColor="#483c72"
                    fontWeight="600"
                    onClick={() => selectedTemplate && handleInsertTemplate(selectedTemplate)}
                  >
                    Insert to Composer
                  </Button>
                  <Button
                    size="xs"
                    bg="#483c72"
                    color="white"
                    fontWeight="600"
                    _hover={{ bg: '#3e3363' }}
                    onClick={() => selectedTemplate && handleSendTemplateDirectly(selectedTemplate)}
                    isLoading={isSending}
                  >
                    Send Direct
                  </Button>
                </HStack>
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ConversationView;
