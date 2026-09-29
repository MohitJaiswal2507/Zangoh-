// src/pages/AgentConfig.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Progress,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import { FiPlay, FiSave, FiPlus, FiSliders } from 'react-icons/fi';
import { useAppData } from '../context/AppDataContext';
import { updateAgentConfig } from '../api';

const AgentConfig = () => {
  const toast = useToast();
  const { agents = [], updateAgent } = useAppData();

  const [selectedAgentId, setSelectedAgentId] = useState('CSR-Returns');
  const [activeTab, setActiveTab] = useState(0);

  // Configuration form state
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [creativity, setCreativity] = useState(0.68);
  const [speed, setSpeed] = useState('Fast');
  const [empathy, setEmpathy] = useState('High');
  const [stability, setStability] = useState(0.82);

  // Capabilities
  const [capabilities, setCapabilities] = useState({
    return_processing: true,
    refund_approval: true,
    carrier_integration: true,
    policy_exception: false,
  });

  // Knowledge bases
  const [knowledgeBases, setKnowledgeBases] = useState({
    'kb-return-policy': true,
    'kb-cs-general': true,
    'kb-product-catalog': false,
  });

  // Escalation policy thresholds
  const [noResponseSec, setNoResponseSec] = useState(90);
  const [sentimentThreshold, setSentimentThreshold] = useState(-0.55);
  const [refundThreshold, setRefundThreshold] = useState(5000);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.64);

  // Presets definition
  const initialPresets = [
    {
      id: 'balanced',
      name: 'Standard Production (Balanced)',
      temperature: 0.70,
      maxTokens: 1024,
      creativity: 0.68,
      speed: 'Fast',
      empathy: 'High',
      stability: 0.82,
      noResponseSec: 90,
      sentimentThreshold: -0.55,
      refundThreshold: 5000,
      confidenceThreshold: 0.64,
    },
    {
      id: 'empathy',
      name: 'Empathetic Retention (High Empathy)',
      temperature: 0.75,
      maxTokens: 1536,
      creativity: 0.82,
      speed: 'Fast',
      empathy: 'High',
      stability: 0.75,
      noResponseSec: 60,
      sentimentThreshold: -0.40,
      refundThreshold: 3000,
      confidenceThreshold: 0.70,
    },
    {
      id: 'strict',
      name: 'Strict Guardrails (Low Hallucination)',
      temperature: 0.20,
      maxTokens: 512,
      creativity: 0.25,
      speed: 'Measured',
      empathy: 'Neutral',
      stability: 0.95,
      noResponseSec: 45,
      sentimentThreshold: -0.35,
      refundThreshold: 2000,
      confidenceThreshold: 0.80,
    },
    {
      id: 'triage',
      name: 'Fast Triage & Deflection',
      temperature: 0.50,
      maxTokens: 256,
      creativity: 0.50,
      speed: 'Fast',
      empathy: 'Neutral',
      stability: 0.88,
      noResponseSec: 120,
      sentimentThreshold: -0.65,
      refundThreshold: 10000,
      confidenceThreshold: 0.55,
    },
  ];

  const [presets, setPresets] = useState(() => {
    try {
      const saved = localStorage.getItem('agent_presets');
      return saved ? JSON.parse(saved) : initialPresets;
    } catch {
      return initialPresets;
    }
  });
  const [selectedPresetId, setSelectedPresetId] = useState('balanced');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  // Simulation scenario state
  const [scenarioIndex, setScenarioIndex] = useState(18);
  const [isRunningEvals, setIsRunningEvals] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const activeAgent = agents.find(a => a.id === selectedAgentId) || {
    id: 'CSR-Returns',
    name: 'CSR-Returns',
    model: 'v4.3',
  };

  useEffect(() => {
    if (activeAgent) {
      if (activeAgent.parameters?.temperature !== undefined) setTemperature(activeAgent.parameters.temperature);
      if (activeAgent.parameters?.maxTokens !== undefined) setMaxTokens(activeAgent.parameters.maxTokens);
      if (activeAgent.parameters?.top_p !== undefined) setCreativity(activeAgent.parameters.top_p);
      if (activeAgent.parameters?.stability !== undefined) setStability(activeAgent.parameters.stability);
    }
  }, [selectedAgentId]);

  const handleSelectPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const p = presets.find(item => item.id === presetId);
    if (!p) return;
    if (p.temperature !== undefined) setTemperature(p.temperature);
    if (p.maxTokens !== undefined) setMaxTokens(p.maxTokens);
    if (p.creativity !== undefined) setCreativity(p.creativity);
    if (p.speed !== undefined) setSpeed(p.speed);
    if (p.empathy !== undefined) setEmpathy(p.empathy);
    if (p.stability !== undefined) setStability(p.stability);
    if (p.noResponseSec !== undefined) setNoResponseSec(p.noResponseSec);
    if (p.sentimentThreshold !== undefined) setSentimentThreshold(p.sentimentThreshold);
    if (p.refundThreshold !== undefined) setRefundThreshold(p.refundThreshold);
    if (p.confidenceThreshold !== undefined) setConfidenceThreshold(p.confidenceThreshold);
    toast({
      title: `Preset loaded: ${p.name}`,
      status: 'info',
      duration: 2500,
    });
  };

  const handleSavePreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset = {
      id: `preset-${Date.now()}`,
      name: newPresetName.trim(),
      temperature,
      maxTokens,
      creativity,
      speed,
      empathy,
      stability,
      noResponseSec,
      sentimentThreshold,
      refundThreshold,
      confidenceThreshold,
    };
    const updated = [...presets, newPreset];
    setPresets(updated);
    setSelectedPresetId(newPreset.id);
    try {
      localStorage.setItem('agent_presets', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage failed:', e);
    }
    setNewPresetName('');
    setIsPresetModalOpen(false);
    toast({
      title: 'Preset Saved',
      description: `Configuration saved as preset "${newPreset.name}".`,
      status: 'success',
      duration: 3000,
    });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateAgentConfig(selectedAgentId, {
        parameters: {
          temperature,
          maxTokens,
          top_p: creativity,
          stability,
        },
        capabilities: Object.entries(capabilities).map(([id, enabled]) => ({ id, enabled })),
        knowledgeBases: Object.entries(knowledgeBases).map(([id, enabled]) => ({ id, enabled })),
        escalationThresholds: {
          lowConfidence: confidenceThreshold,
          negativeSentiment: sentimentThreshold,
          responseTime: noResponseSec,
          refundThreshold,
        }
      });
      updateAgent(selectedAgentId, {
        parameters: { temperature, maxTokens, top_p: creativity, stability }
      });
      toast({
        title: 'Configuration saved',
        description: 'Governed change request updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Save failed',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunEvals = () => {
    setIsRunningEvals(true);
    setTimeout(() => {
      setIsRunningEvals(false);
      toast({
        title: 'Evaluations completed',
        description: '124 scenarios tested: 98% pass rate across policy adherence and tone.',
        status: 'success',
        duration: 3500,
      });
    }, 1200);
  };

  const handleNextScenario = () => {
    setScenarioIndex(prev => (prev < 24 ? prev + 1 : 1));
  };

  return (
    <Box>
      {/* Top Header */}
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <HStack spacing={3} align="center">
            <Heading as="h1" size="lg" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
              {activeAgent.name || 'CSR-Returns'} • Control Room
            </Heading>
            <Select
              size="sm"
              w="180px"
              borderRadius="8px"
              bg="white"
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              data-testid="agent-selector"
              aria-label="agent selector"
            >
              <option value="CSR-Returns">CSR-Returns (v4.3)</option>
              <option value="CSR-Identity">CSR-Identity (v4.2)</option>
              <option value="CSR-Logistics">CSR-Logistics (v4.3)</option>
              <option value="CSR-Tech">CSR-Tech (v4.3)</option>
              <option value="CSR-Finance">CSR-Finance (v4.2)</option>
              <option value="agent-cs-1">Customer Service (v3.5)</option>
            </Select>
          </HStack>
          <Text fontSize="13px" color="#64748b" mt={1}>
            Configure, evaluate, and deploy agent behavior with governed change controls
          </Text>
        </Box>

        <HStack spacing={3}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FiPlay size={13} />}
            fontSize="13px"
            onClick={handleRunEvals}
            isLoading={isRunningEvals}
          >
            Run evals
          </Button>

          <Button
            size="sm"
            bg="#483c72"
            color="white"
            fontSize="13px"
            fontWeight="600"
            _hover={{ bg: '#3e3363' }}
            leftIcon={<FiSave size={13} />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            Review & deploy
          </Button>
        </HStack>
      </Flex>

      {/* Main 3-Column Layout */}
      <SimpleGrid columns={{ base: 1, xl: 3 }} spacing={5}>
        {/* PANEL 1: Behavior Configuration */}
        <Box
          as="form"
          role="form"
          data-testid="agent-config-form"
          onSubmit={handleSave}
          bg="white"
          p={5}
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="15px" fontWeight="700" color="#1e293b">
              Behavior configuration
            </Text>
            <Badge bg="#fef3c7" color="#b45309" px={2} py={0.5} borderRadius="md" fontSize="11px" fontWeight="700">
              Draft changes
            </Badge>
          </Flex>

          {/* Configuration Presets Selector */}
          <Box mb={4} p={3} bg="#f8fafc" borderRadius="10px" border="1px solid" borderColor="#e2e8f0">
            <Flex justify="space-between" align="center" mb={2}>
              <HStack spacing={1.5}>
                <FiSliders size={13} color="#483c72" />
                <Text fontSize="12px" fontWeight="700" color="#334155">
                  Configuration Preset
                </Text>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                color="#483c72"
                fontWeight="600"
                fontSize="11px"
                leftIcon={<FiPlus size={11} />}
                onClick={() => setIsPresetModalOpen(true)}
              >
                Save as preset
              </Button>
            </Flex>
            <Select
              size="xs"
              borderRadius="6px"
              bg="white"
              value={selectedPresetId}
              onChange={(e) => handleSelectPreset(e.target.value)}
              fontWeight="600"
              color="#1e293b"
            >
              {presets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Box>

          <Tabs index={activeTab} variant="soft-rounded" colorScheme="purple" size="sm" mb={5} onChange={setActiveTab}>
            <TabList bg="#f8fafc" p={1} borderRadius="8px">
              <Tab fontSize="12px" fontWeight="600" _selected={{ bg: '#483c72', color: 'white' }}>
                Parameters
              </Tab>
              <Tab fontSize="12px" fontWeight="600" _selected={{ bg: '#483c72', color: 'white' }}>
                Capabilities
              </Tab>
              <Tab fontSize="12px" fontWeight="600" _selected={{ bg: '#483c72', color: 'white' }}>
                Knowledge
              </Tab>
            </TabList>

            <TabPanels mt={3}>
              {/* Tab 1: Sliders */}
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  {/* Temperature */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="13px" fontWeight="600" color="#334155">
                        Temperature
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {temperature.toFixed(2)}
                      </Text>
                    </Flex>
                    <Slider
                      value={temperature * 100}
                      onChange={(v) => setTemperature(Number((v / 100).toFixed(2)))}
                      min={0}
                      max={100}
                    >
                      <SliderTrack bg="#f1f5f9" h="6px" borderRadius="full">
                        <SliderFilledTrack bg="#483c72" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="#483c72" />
                    </Slider>
                    <Flex justify="space-between" fontSize="10px" color="#94a3b8" mt={1}>
                      <Text>Deterministic (0.0)</Text>
                      <Text>Creative (1.0)</Text>
                    </Flex>
                  </Box>

                  {/* Max Tokens */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="13px" fontWeight="600" color="#334155">
                        Max tokens
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {maxTokens} tokens
                      </Text>
                    </Flex>
                    <Slider
                      value={maxTokens}
                      onChange={(v) => setMaxTokens(v)}
                      min={128}
                      max={4096}
                      step={64}
                    >
                      <SliderTrack bg="#f1f5f9" h="6px" borderRadius="full">
                        <SliderFilledTrack bg="#483c72" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="#483c72" />
                    </Slider>
                    <Flex justify="space-between" fontSize="10px" color="#94a3b8" mt={1}>
                      <Text>Short (128)</Text>
                      <Text>Detailed (4096)</Text>
                    </Flex>
                  </Box>

                  {/* Creativity / Top-p */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="13px" fontWeight="600" color="#334155">
                        Creativity / Top-p
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {creativity}
                      </Text>
                    </Flex>
                    <Slider
                      value={creativity * 100}
                      onChange={(v) => setCreativity(Number((v / 100).toFixed(2)))}
                      min={0}
                      max={100}
                    >
                      <SliderTrack bg="#f1f5f9" h="6px" borderRadius="full">
                        <SliderFilledTrack bg="#483c72" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="#483c72" />
                    </Slider>
                    <Flex justify="space-between" fontSize="10px" color="#94a3b8" mt={1}>
                      <Text>Precise</Text>
                      <Text>Exploratory</Text>
                    </Flex>
                  </Box>

                  {/* Response Speed */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="13px" fontWeight="600" color="#334155">
                        Response speed
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {speed}
                      </Text>
                    </Flex>
                    <Slider defaultValue={80} min={0} max={100}>
                      <SliderTrack bg="#f1f5f9" h="6px" borderRadius="full">
                        <SliderFilledTrack bg="#483c72" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="#483c72" />
                    </Slider>
                    <Flex justify="space-between" fontSize="10px" color="#94a3b8" mt={1}>
                      <Text>Measured</Text>
                      <Text>Fast</Text>
                    </Flex>
                  </Box>

                  {/* Empathy */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="13px" fontWeight="600" color="#334155">
                        Empathy
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {empathy}
                      </Text>
                    </Flex>
                    <Slider defaultValue={85} min={0} max={100}>
                      <SliderTrack bg="#f1f5f9" h="6px" borderRadius="full">
                        <SliderFilledTrack bg="#483c72" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="#483c72" />
                    </Slider>
                    <Flex justify="space-between" fontSize="10px" color="#94a3b8" mt={1}>
                      <Text>Neutral</Text>
                      <Text>High</Text>
                    </Flex>
                  </Box>

                  {/* Stability */}
                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="13px" fontWeight="600" color="#334155">
                        Stability
                      </Text>
                      <Text fontSize="13px" fontWeight="700" color="#1e293b">
                        {stability}
                      </Text>
                    </Flex>
                    <Slider
                      value={stability * 100}
                      onChange={(v) => setStability(Number((v / 100).toFixed(2)))}
                      min={0}
                      max={100}
                    >
                      <SliderTrack bg="#f1f5f9" h="6px" borderRadius="full">
                        <SliderFilledTrack bg="#483c72" />
                      </SliderTrack>
                      <SliderThumb boxSize={4} bg="#483c72" />
                    </Slider>
                    <Flex justify="space-between" fontSize="10px" color="#94a3b8" mt={1}>
                      <Text>Adaptive</Text>
                      <Text>Stable</Text>
                    </Flex>
                  </Box>
                </VStack>
              </TabPanel>

              {/* Tab 2: Capabilities */}
              <TabPanel p={0}>
                <VStack spacing={3} align="stretch">
                  <Checkbox
                    isChecked={capabilities.return_processing}
                    onChange={(e) => setCapabilities({ ...capabilities, return_processing: e.target.checked })}
                    colorScheme="purple"
                    fontSize="13px"
                  >
                    Return Processing
                  </Checkbox>
                  <Checkbox
                    isChecked={capabilities.refund_approval}
                    onChange={(e) => setCapabilities({ ...capabilities, refund_approval: e.target.checked })}
                    colorScheme="purple"
                    fontSize="13px"
                  >
                    Refund Approval Limit ₹5,000
                  </Checkbox>
                  <Checkbox
                    isChecked={capabilities.carrier_integration}
                    onChange={(e) => setCapabilities({ ...capabilities, carrier_integration: e.target.checked })}
                    colorScheme="purple"
                    fontSize="13px"
                  >
                    Carrier Scan Verification
                  </Checkbox>
                  <Checkbox
                    isChecked={capabilities.policy_exception}
                    onChange={(e) => setCapabilities({ ...capabilities, policy_exception: e.target.checked })}
                    colorScheme="purple"
                    fontSize="13px"
                  >
                    Policy Exception Override
                  </Checkbox>
                </VStack>
              </TabPanel>

              {/* Tab 3: Knowledge */}
              <TabPanel p={0}>
                <VStack spacing={3} align="stretch">
                  <Checkbox
                    isChecked={knowledgeBases['kb-return-policy']}
                    onChange={(e) => setKnowledgeBases({ ...knowledgeBases, 'kb-return-policy': e.target.checked })}
                    colorScheme="purple"
                    fontSize="13px"
                  >
                    Return & Refund Policy (kb-return-policy)
                  </Checkbox>
                  <Checkbox
                    isChecked={knowledgeBases['kb-cs-general']}
                    onChange={(e) => setKnowledgeBases({ ...knowledgeBases, 'kb-cs-general': e.target.checked })}
                    colorScheme="purple"
                    fontSize="13px"
                  >
                    Customer Service Guidelines (kb-cs-general)
                  </Checkbox>
                  <Checkbox
                    isChecked={knowledgeBases['kb-product-catalog']}
                    onChange={(e) => setKnowledgeBases({ ...knowledgeBases, 'kb-product-catalog': e.target.checked })}
                    colorScheme="purple"
                    fontSize="13px"
                  >
                    Product Catalog & Pricing (kb-product-catalog)
                  </Checkbox>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Escalation Policy */}
          <Box pt={4} borderTop="1px solid" borderColor="#f1f5f9" mb={5}>
            <Text fontSize="14px" fontWeight="700" color="#1e293b" mb={1}>
              Escalation policy
            </Text>
            <Text fontSize="11px" color="#94a3b8" mb={3}>
              Trigger supervisor takeover when any threshold is met
            </Text>

            <VStack spacing={2.5} align="stretch">
              <Flex justify="space-between" align="center">
                <Text fontSize="13px" color="#475569">No agent response</Text>
                <HStack spacing={1}>
                  <Button size="xs" variant="outline" onClick={() => setNoResponseSec(prev => Math.max(15, prev - 15))}>-</Button>
                  <Button size="xs" variant="outline" borderRadius="6px" fontSize="12px" fontWeight="600" minW="72px">
                    {noResponseSec} sec
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setNoResponseSec(prev => Math.min(300, prev + 15))}>+</Button>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text fontSize="13px" color="#475569">Customer sentiment</Text>
                <HStack spacing={1}>
                  <Button size="xs" variant="outline" onClick={() => setSentimentThreshold(prev => Number((Math.min(-0.1, prev + 0.05)).toFixed(2)))}>+</Button>
                  <Button size="xs" variant="outline" borderRadius="6px" fontSize="12px" fontWeight="600" minW="72px">
                    ≤ {sentimentThreshold}
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setSentimentThreshold(prev => Number((Math.max(-0.95, prev - 0.05)).toFixed(2)))}>-</Button>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text fontSize="13px" color="#475569">Refund value</Text>
                <HStack spacing={1}>
                  <Button size="xs" variant="outline" onClick={() => setRefundThreshold(prev => Math.max(1000, prev - 1000))}>-</Button>
                  <Button size="xs" variant="outline" borderRadius="6px" fontSize="12px" fontWeight="600" minW="72px">
                    ≥ ₹{refundThreshold.toLocaleString()}
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setRefundThreshold(prev => prev + 1000)}>+</Button>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center">
                <Text fontSize="13px" color="#475569">Confidence score</Text>
                <HStack spacing={1}>
                  <Button size="xs" variant="outline" onClick={() => setConfidenceThreshold(prev => Number((Math.max(0.3, prev - 0.05)).toFixed(2)))}>-</Button>
                  <Button size="xs" variant="outline" borderRadius="6px" fontSize="12px" fontWeight="600" minW="72px">
                    ≤ {confidenceThreshold}
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setConfidenceThreshold(prev => Number((Math.min(0.95, prev + 0.05)).toFixed(2)))}>+</Button>
                </HStack>
              </Flex>
            </VStack>
          </Box>

          {/* Change Request Info Box */}
          <Box bg="#fffbeb" p={3.5} borderRadius="10px" border="1px solid" borderColor="#fef3c7">
            <Flex justify="space-between" align="center" mb={1}>
              <Text fontSize="11px" fontWeight="700" color="#92400e" textTransform="uppercase">
                CHANGE REQUEST
              </Text>
              <Badge bg="#fde68a" color="#78350f" fontSize="10px" fontWeight="700">
                Risk: Moderate
              </Badge>
            </Flex>
            <Text fontSize="13px" fontWeight="700" color="#78350f" mb={1}>
              CR-1842 • 6 fields modified
            </Text>
            <Text fontSize="11px" color="#92400e">
              Owner: Neha Prasad • Reviewer: Ops Governance
            </Text>
          </Box>
        </Box>

        {/* PANEL 2: Performance & Guardrails */}
        <Box
          bg="white"
          p={5}
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="15px" fontWeight="700" color="#1e293b">
              Performance & guardrails
            </Text>
            <Button size="xs" variant="outline" borderRadius="6px" fontSize="11px">
              Last 7 days
            </Button>
          </Flex>

          {/* 4 Metric Cards */}
          <SimpleGrid columns={2} spacing={3} mb={5}>
            <Box bg="#f8fafc" p={3} borderRadius="10px" border="1px solid" borderColor="#f1f5f9">
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                  CONTAINMENT
                </Text>
                <Badge bg="#dcfce7" color="#15803d" fontSize="10px" fontWeight="700">
                  +3.2%
                </Badge>
              </Flex>
              <Text fontSize="20px" fontWeight="700" color="#1e293b">
                74.6%
              </Text>
            </Box>

            <Box bg="#f8fafc" p={3} borderRadius="10px" border="1px solid" borderColor="#f1f5f9">
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                  CSAT
                </Text>
                <Badge bg="#dcfce7" color="#15803d" fontSize="10px" fontWeight="700">
                  +0.4
                </Badge>
              </Flex>
              <Text fontSize="20px" fontWeight="700" color="#1e293b">
                8.8
              </Text>
            </Box>

            <Box bg="#f8fafc" p={3} borderRadius="10px" border="1px solid" borderColor="#f1f5f9">
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                  FALLBACK
                </Text>
                <Badge bg="#dcfce7" color="#15803d" fontSize="10px" fontWeight="700">
                  -2.1%
                </Badge>
              </Flex>
              <Text fontSize="20px" fontWeight="700" color="#1e293b">
                11.2%
              </Text>
            </Box>

            <Box bg="#f8fafc" p={3} borderRadius="10px" border="1px solid" borderColor="#f1f5f9">
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase">
                  HALLUCINATION
                </Text>
                <Badge bg="#dcfce7" color="#15803d" fontSize="10px" fontWeight="700">
                  -0.3%
                </Badge>
              </Flex>
              <Text fontSize="20px" fontWeight="700" color="#1e293b">
                0.7%
              </Text>
            </Box>
          </SimpleGrid>

          {/* Evaluation suite */}
          <Box mb={5}>
            <Text fontSize="14px" fontWeight="700" color="#1e293b" mb={1}>
              Evaluation suite
            </Text>
            <Text fontSize="11px" color="#94a3b8" mb={3}>
              124 scenarios across policy, tone, safety, and task completion
            </Text>

            <VStack spacing={3} align="stretch">
              <Flex justify="space-between" align="center" fontSize="12px">
                <Text color="#475569" w="120px">Policy adherence</Text>
                <Progress value={96} size="xs" colorScheme="green" flex="1" mx={3} borderRadius="full" />
                <HStack spacing={2} w="80px" justify="flex-end">
                  <Text fontWeight="700">96%</Text>
                  <Badge bg="#dcfce7" color="#15803d" fontSize="10px">Pass</Badge>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center" fontSize="12px">
                <Text color="#475569" w="120px">Refund reasoning</Text>
                <Progress value={91} size="xs" colorScheme="green" flex="1" mx={3} borderRadius="full" />
                <HStack spacing={2} w="80px" justify="flex-end">
                  <Text fontWeight="700">91%</Text>
                  <Badge bg="#dcfce7" color="#15803d" fontSize="10px">Pass</Badge>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center" fontSize="12px">
                <Text color="#475569" w="120px">Empathy & tone</Text>
                <Progress value={86} size="xs" colorScheme="orange" flex="1" mx={3} borderRadius="full" />
                <HStack spacing={2} w="80px" justify="flex-end">
                  <Text fontWeight="700">86%</Text>
                  <Badge bg="#fef3c7" color="#d97706" fontSize="10px">Review</Badge>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center" fontSize="12px">
                <Text color="#475569" w="120px">Prompt injection</Text>
                <Progress value={100} size="xs" colorScheme="green" flex="1" mx={3} borderRadius="full" />
                <HStack spacing={2} w="80px" justify="flex-end">
                  <Text fontWeight="700">100%</Text>
                  <Badge bg="#dcfce7" color="#15803d" fontSize="10px">Pass</Badge>
                </HStack>
              </Flex>

              <Flex justify="space-between" align="center" fontSize="12px">
                <Text color="#475569" w="120px">Knowledge freshness</Text>
                <Progress value={79} size="xs" colorScheme="red" flex="1" mx={3} borderRadius="full" />
                <HStack spacing={2} w="80px" justify="flex-end">
                  <Text fontWeight="700">79%</Text>
                  <Badge bg="#fee2e2" color="#dc2626" fontSize="10px">Risk</Badge>
                </HStack>
              </Flex>
            </VStack>
          </Box>

          {/* Routing Matrix */}
          <Box pt={3} borderTop="1px solid" borderColor="#f1f5f9">
            <Text fontSize="14px" fontWeight="700" color="#1e293b" mb={1}>
              Routing matrix
            </Text>
            <Text fontSize="11px" color="#94a3b8" mb={3}>
              Traffic split by intent and customer tier
            </Text>

            <Box overflowX="auto">
              <Table variant="simple" size="xs">
                <Thead bg="#f8fafc">
                  <Tr>
                    <Th fontSize="9px">INTENT</Th>
                    <Th fontSize="9px">MODEL</Th>
                    <Th fontSize="9px">TIER</Th>
                    <Th fontSize="9px">TRAFFIC</Th>
                    <Th fontSize="9px">FAILOVER</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  <Tr>
                    <Td py={2} fontWeight="600">Returns</Td>
                    <Td py={2}>v4.3</Td>
                    <Td py={2}>VIP</Td>
                    <Td py={2}>100%</Td>
                    <Td py={2} color="#dc2626" fontWeight="600">Human</Td>
                  </Tr>
                  <Tr>
                    <Td py={2} fontWeight="600">Returns</Td>
                    <Td py={2}>v4.3</Td>
                    <Td py={2}>Standard</Td>
                    <Td py={2}>80%</Td>
                    <Td py={2}>v4.2</Td>
                  </Tr>
                  <Tr>
                    <Td py={2} fontWeight="600">Damaged item</Td>
                    <Td py={2}>v4.2</Td>
                    <Td py={2}>All</Td>
                    <Td py={2}>100%</Td>
                    <Td py={2} color="#dc2626" fontWeight="600">Human</Td>
                  </Tr>
                  <Tr>
                    <Td py={2} fontWeight="600">Policy exception</Td>
                    <Td py={2}>Human</Td>
                    <Td py={2}>All</Td>
                    <Td py={2}>100%</Td>
                    <Td py={2}>—</Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Box>

        {/* PANEL 3: Simulation Console */}
        <Box
          bg="white"
          p={5}
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
          display="flex"
          flexDirection="column"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="15px" fontWeight="700" color="#1e293b">
              Simulation console
            </Text>
            <Badge bg="#e0f2fe" color="#0369a1" px={2} py={0.5} borderRadius="md" fontSize="11px" fontWeight="700">
              Scenario {scenarioIndex}/24
            </Badge>
          </Flex>

          {/* Customer Prompt */}
          <Box bg="#f8fafc" p={3.5} borderRadius="10px" mb={3} border="1px solid" borderColor="#e2e8f0">
            <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" mb={1}>
              CUSTOMER PROMPT
            </Text>
            <Text fontSize="13px" color="#1e293b" fontStyle="italic">
              “My refund is delayed and I need the money today. Can you override policy?”
            </Text>
          </Box>

          {/* Agent Response */}
          <Box bg="#ede9f6" p={3.5} borderRadius="10px" mb={3}>
            <Text fontSize="10px" fontWeight="700" color="#483c72" textTransform="uppercase" mb={1}>
              AGENT RESPONSE · v4.3
            </Text>
            <Text fontSize="13px" color="#1e293b" lineHeight="1.5" mb={3}>
              I'm sorry this delay is creating stress. I found your return evidence. Because the amount exceeds my approval threshold, I've prepared an expedited review for a supervisor.
            </Text>
            <HStack spacing={2}>
              <Badge bg="white" color="#483c72" fontSize="10px" px={2} py={0.5} borderRadius="full">
                Policy cited
              </Badge>
              <Badge bg="white" color="#dc2626" fontSize="10px" px={2} py={0.5} borderRadius="full">
                Escalated
              </Badge>
            </HStack>
          </Box>

          {/* Decision trace */}
          <Box mb={4} p={3} bg="#fafbfc" borderRadius="10px" border="1px solid" borderColor="#f1f5f9">
            <Text fontSize="12px" fontWeight="700" color="#1e293b" mb={2}>
              Decision trace
            </Text>
            <Text fontSize="10px" color="#94a3b8" mb={2}>
              Why the agent chose escalation
            </Text>

            <VStack spacing={1.5} align="stretch" fontSize="12px">
              <Flex justify="space-between">
                <Text color="#64748b">Intent</Text>
                <Text fontWeight="600" color="#1e293b">refund_delay • 0.96</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="#64748b">Sentiment</Text>
                <Text fontWeight="600" color="#dc2626">urgent_negative • 0.82</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="#64748b">Policy node</Text>
                <Text fontWeight="600" color="#1e293b">REF-12.4 exception</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="#64748b">Risk gate</Text>
                <Text fontWeight="600" color="#d97706">value &gt; autonomous limit</Text>
              </Flex>
            </VStack>
          </Box>

          {/* Evaluation result */}
          <Box bg="#ecfdf5" p={3.5} borderRadius="10px" border="1px solid" borderColor="#d1fae5" mb={4}>
            <Text fontSize="10px" fontWeight="700" color="#047857" textTransform="uppercase" mb={1}>
              EVALUATION RESULT
            </Text>
            <Text fontSize="14px" fontWeight="800" color="#065f46" mb={1}>
              PASS · 92/100
            </Text>
            <Text fontSize="12px" color="#047857">
              Strong empathy and correct escalation. Improve: state expected review time.
            </Text>
          </Box>

          {/* Action buttons */}
          <HStack spacing={3} mt="auto">
            <Button size="sm" variant="outline" flex="1" fontSize="12px" onClick={handleNextScenario}>
              Compare v4.2
            </Button>
            <Button
              size="sm"
              bg="#483c72"
              color="white"
              flex="1"
              fontSize="12px"
              fontWeight="600"
              _hover={{ bg: '#3e3363' }}
              onClick={handleNextScenario}
            >
              Run next case
            </Button>
          </HStack>
        </Box>
      </SimpleGrid>

      {/* Save Preset Modal */}
      <Modal isOpen={isPresetModalOpen} onClose={() => setIsPresetModalOpen(false)} isCentered size="sm">
        <ModalOverlay bg="blackAlpha.400" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="12px" p={2}>
          <ModalHeader fontSize="15px" fontWeight="700" color="#1e293b" pb={1}>
            Save Configuration Preset
          </ModalHeader>
          <ModalBody>
            <Text fontSize="12px" color="#64748b" mb={3}>
              Save the current temperature ({temperature}), max tokens ({maxTokens}), creativity ({creativity}), and escalation thresholds as a named preset.
            </Text>
            <Input
              placeholder="e.g. VIP Concierge Support"
              fontSize="13px"
              borderRadius="8px"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              autoFocus
            />
          </ModalBody>
          <ModalFooter>
            <Button size="sm" variant="ghost" mr={2} onClick={() => setIsPresetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              bg="#483c72"
              color="white"
              _hover={{ bg: '#3e3363' }}
              onClick={handleSavePreset}
              isDisabled={!newPresetName.trim()}
            >
              Save Preset
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AgentConfig;
