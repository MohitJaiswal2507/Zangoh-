// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  SimpleGrid,
  HStack,
  VStack,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Progress,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FiExternalLink, FiChevronDown, FiDownload, FiActivity } from 'react-icons/fi';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from 'recharts';
import { useAppData } from '../context/AppDataContext';

const volumeChartData = [
  { time: '11:00', live: 38, sla: 22 },
  { time: '11:05', live: 46, sla: 28 },
  { time: '11:10', live: 44, sla: 24 },
  { time: '11:15', live: 58, sla: 32 },
  { time: '11:20', live: 55, sla: 30 },
  { time: '11:25', live: 68, sla: 42 },
  { time: '11:30', live: 65, sla: 38 },
  { time: '11:35', live: 82, sla: 50 },
  { time: '11:40', live: 94, sla: 56 },
  { time: '11:45', live: 90, sla: 48 },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { conversations = [] } = useAppData();
  const [timeFilter, setTimeFilter] = useState('Last 30 min');
  const [regionFilter, setRegionFilter] = useState('All regions');
  const [queueFilter, setQueueFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('risk');

  // Real-time SSE Metrics (Updates every 2 seconds)
  const [metrics, setMetrics] = useState({
    activeLoad: '1,284',
    activeLoadDelta: '+8.2%',
    slaAtRisk: 47,
    slaAtRiskDelta: '+12',
    containment: '73.4%',
    containmentDelta: '+1.8%',
    aht: '06:18',
    ahtDelta: '-0:42',
    csat: '8.7',
    csatDelta: '+0.6',
    isLive: false,
  });

  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
    let eventSource = null;

    const timer = setTimeout(() => {
      try {
        eventSource = new EventSource(`${apiUrl}/api/analytics/live-metrics`);
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setMetrics(prev => ({
              ...prev,
              ...data,
              isLive: true,
            }));
          } catch (err) {
            console.error('Error parsing SSE data:', err);
          }
        };
        eventSource.onerror = (err) => {
          console.warn('SSE stream reconnecting...');
        };
      } catch (e) {
        console.error('Failed to establish SSE connection:', e);
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  const liveEvents = [
    { id: 1, time: '11:42:18', title: 'Takeover approved', desc: 'Elena V. • by Neha P.', dotColor: '#ef4444' },
    { id: 2, time: '11:41:53', title: 'Knowledge fallback', desc: 'CSR-Returns • policy gap', dotColor: '#f59e0b' },
    { id: 3, time: '11:40:26', title: 'SLA alert raised', desc: 'Returns • 9 conversations', dotColor: '#ef4444' },
    { id: 4, time: '11:39:11', title: 'Template inserted', desc: 'Refund delay v3 • Marcus L.', dotColor: '#3b82f6' },
    { id: 5, time: '11:37:45', title: 'Agent version routed', desc: 'CSR-Tech v4.3 • 20% traffic', dotColor: '#8b5cf6' },
    { id: 6, time: '11:35:09', title: 'QA sample flagged', desc: 'Low empathy score • #84211', dotColor: '#f59e0b' },
  ];

  // Priority conversations default matching Figma if not loaded
  const defaultPriorityQueue = [
    {
      id: 'conv-84291',
      customerName: 'Elena Vasquez',
      caseNum: '#84291',
      queue: 'Refund',
      aiOwner: 'CSR-Returns',
      risk: 96,
      wait: '12:42',
      recommendedAction: 'Take over',
    },
    {
      id: 'conv-84275',
      customerName: 'Marcus Lee',
      caseNum: '#84275',
      queue: 'Account',
      aiOwner: 'CSR-Identity',
      risk: 84,
      wait: '09:18',
      recommendedAction: 'Approve override',
    },
    {
      id: 'conv-84263',
      customerName: 'Noah Williams',
      caseNum: '#84263',
      queue: 'Delivery',
      aiOwner: 'CSR-Logistics',
      risk: 72,
      wait: '08:09',
      recommendedAction: 'Review evidence',
    },
    {
      id: 'conv-84241',
      customerName: 'Ava Thompson',
      caseNum: '#84241',
      queue: 'Product',
      aiOwner: 'CSR-Tech',
      risk: 58,
      wait: '06:34',
      recommendedAction: 'Monitor',
    },
    {
      id: 'conv-84230',
      customerName: 'Oliver Chen',
      caseNum: '#84230',
      queue: 'Billing',
      aiOwner: 'CSR-Finance',
      risk: 47,
      wait: '04:51',
      recommendedAction: 'Send template',
    },
  ];

  // Merge live conversations with defaults
  const tableData = conversations.length > 0
    ? conversations.map(c => ({
        id: c.id,
        customerName: c.customer?.name || 'Customer',
        caseNum: c.caseNumber ? `#${c.caseNumber}` : `#${c.id.replace('conv-', '')}`,
        queue: c.queue || 'General',
        aiOwner: c.agent?.name || 'CSR Agent',
        risk: c.risk || (c.alertLevel === 'high' ? 88 : c.alertLevel === 'medium' ? 60 : 35),
        wait: c.waitTime || '05:20',
        recommendedAction: c.recommendedAction || (c.alertLevel === 'high' ? 'Take over' : 'Monitor'),
      }))
    : defaultPriorityQueue;

  const filteredData = tableData.filter(item => {
    if (queueFilter !== 'all' && item.queue.toLowerCase() !== queueFilter.toLowerCase()) {
      return false;
    }
    return true;
  });

  const getRiskBadgeColor = (risk) => {
    if (risk >= 80) return { bg: '#fee2e2', text: '#dc2626' };
    if (risk >= 65) return { bg: '#fef3c7', text: '#d97706' };
    if (risk >= 50) return { bg: '#e0f2fe', text: '#0284c7' };
    return { bg: '#f1f5f9', text: '#475569' };
  };

  return (
    <Box>
      {/* Top Header Row */}
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <HStack spacing={3} align="center" flexWrap="wrap">
            <Heading as="h1" size="lg" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
              Dashboard
            </Heading>
            <Badge
              bg={metrics.isLive ? '#dcfce7' : '#fef3c7'}
              color={metrics.isLive ? '#15803d' : '#b45309'}
              fontSize="11px"
              px={2.5}
              py={1}
              borderRadius="full"
              fontWeight="700"
              display="inline-flex"
              alignItems="center"
              gap={1.5}
            >
              <Box w="6px" h="6px" borderRadius="full" bg={metrics.isLive ? '#22c55e' : '#f59e0b'} />
              {metrics.isLive ? 'Live SSE (2s updates)' : 'Connecting stream...'}
            </Badge>
          </HStack>
          <Text fontSize="13px" color="#64748b" mt={1}>
            Live supervision across 24 queues, 8 regions, and 42 AI agents
          </Text>
        </Box>

        <Flex wrap="wrap" gap={2} align="center">
          <Menu>
            <MenuButton as={Button} size={{ base: 'xs', sm: 'sm' }} variant="outline" rightIcon={<FiChevronDown size={14} />} fontSize="12px" bg="white">
              {timeFilter}
            </MenuButton>
            <MenuList fontSize="12px">
              <MenuItem onClick={() => setTimeFilter('Last 30 min')}>Last 30 min</MenuItem>
              <MenuItem onClick={() => setTimeFilter('Last 1 hour')}>Last 1 hour</MenuItem>
              <MenuItem onClick={() => setTimeFilter('Today')}>Today</MenuItem>
            </MenuList>
          </Menu>

          <Menu>
            <MenuButton as={Button} size={{ base: 'xs', sm: 'sm' }} variant="outline" rightIcon={<FiChevronDown size={14} />} fontSize="12px" bg="white">
              {regionFilter}
            </MenuButton>
            <MenuList fontSize="12px">
              <MenuItem onClick={() => setRegionFilter('All regions')}>All regions</MenuItem>
              <MenuItem onClick={() => setRegionFilter('North America')}>North America</MenuItem>
              <MenuItem onClick={() => setRegionFilter('Europe')}>Europe</MenuItem>
              <MenuItem onClick={() => setRegionFilter('Asia-Pacific')}>Asia-Pacific</MenuItem>
            </MenuList>
          </Menu>

          <Button
            size={{ base: 'xs', sm: 'sm' }}
            bg="#483c72"
            color="white"
            fontSize="12px"
            fontWeight="600"
            _hover={{ bg: '#3e3363' }}
            leftIcon={<FiDownload size={13} />}
          >
            Export report
          </Button>
        </Flex>
      </Flex>

      {/* 5 KPI Metric Cards - Fully Mobile Responsive */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
        {/* Active Load */}
        <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
              Active Load
            </Text>
            <Badge bg="#dcfce7" color="#15803d" fontSize="11px" px={2} py={0.5} borderRadius="full" fontWeight="700">
              {metrics.activeLoadDelta}
            </Badge>
          </Flex>
          <Text fontSize="26px" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
            {metrics.activeLoad}
          </Text>
        </Box>

        {/* SLA at Risk */}
        <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
              SLA at Risk
            </Text>
            <Badge bg="#fee2e2" color="#b91c1c" fontSize="11px" px={2} py={0.5} borderRadius="full" fontWeight="700">
              {metrics.slaAtRiskDelta}
            </Badge>
          </Flex>
          <Text fontSize="26px" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
            {metrics.slaAtRisk}
          </Text>
        </Box>

        {/* AI Containment */}
        <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
              AI Containment
            </Text>
            <Badge bg="#dcfce7" color="#15803d" fontSize="11px" px={2} py={0.5} borderRadius="full" fontWeight="700">
              {metrics.containmentDelta}
            </Badge>
          </Flex>
          <Text fontSize="26px" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
            {metrics.containment}
          </Text>
        </Box>

        {/* Avg. Handle Time */}
        <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
              Avg. Handle Time
            </Text>
            <Badge bg="#dcfce7" color="#15803d" fontSize="11px" px={2} py={0.5} borderRadius="full" fontWeight="700">
              {metrics.ahtDelta}
            </Badge>
          </Flex>
          <Text fontSize="26px" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
            {metrics.aht}
          </Text>
        </Box>

        {/* CSAT */}
        <Box bg="white" p={4} borderRadius="12px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Flex justify="space-between" align="center" mb={2}>
            <Text fontSize="11px" fontWeight="700" color="#64748b" textTransform="uppercase" letterSpacing="0.5px">
              CSAT
            </Text>
            <Badge bg="#dcfce7" color="#15803d" fontSize="11px" px={2} py={0.5} borderRadius="full" fontWeight="700">
              {metrics.csatDelta}
            </Badge>
          </Flex>
          <Text fontSize="26px" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
            {metrics.csat}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Middle Row: Volume Chart, Queue Health, Critical Signals */}
      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={4} mb={6}>
        {/* Conversation volume & SLA exposure chart */}
        <Box gridColumn={{ base: 'span 1', lg: 'span 5' }} bg="white" p={5} borderRadius="14px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Box mb={4}>
            <Text fontSize="15px" fontWeight="700" color="#1e293b">
              Conversation volume & SLA exposure
            </Text>
            <Text fontSize="12px" color="#94a3b8">
              Live vs forecast • 5-minute resolution
            </Text>
          </Box>

          <Box h="180px" w="100%">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="live" stroke="#483c72" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="sla" stroke="#d97706" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          <HStack spacing={6} justify="flex-start" pt={3} borderTop="1px solid" borderColor="#f8fafc">
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="#483c72" />
              <Text fontSize="12px" fontWeight="600" color="#475569">Live</Text>
            </HStack>
            <HStack spacing={2}>
              <Box w="8px" h="8px" borderRadius="full" bg="#d97706" />
              <Text fontSize="12px" fontWeight="600" color="#475569">SLA exposure</Text>
            </HStack>
          </HStack>
        </Box>

        {/* Queue health */}
        <Box gridColumn={{ base: 'span 1', lg: 'span 4' }} bg="white" p={5} borderRadius="14px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Box mb={4}>
            <Text fontSize="15px" fontWeight="700" color="#1e293b">
              Queue health
            </Text>
            <Text fontSize="12px" color="#94a3b8">
              Prioritized by breach probability
            </Text>
          </Box>

          <VStack spacing={4} align="stretch">
            <Box>
              <Flex justify="space-between" fontSize="13px" mb={1}>
                <Text fontWeight="500" color="#334155">Returns & refunds</Text>
                <Text fontWeight="700" color="#dc2626">92%</Text>
              </Flex>
              <Progress value={92} size="xs" colorScheme="red" borderRadius="full" />
            </Box>

            <Box>
              <Flex justify="space-between" fontSize="13px" mb={1}>
                <Text fontWeight="500" color="#334155">Order tracking</Text>
                <Text fontWeight="600" color="#d97706">(Watch) 76%</Text>
              </Flex>
              <Progress value={76} size="xs" colorScheme="orange" borderRadius="full" />
            </Box>

            <Box>
              <Flex justify="space-between" fontSize="13px" mb={1}>
                <Text fontWeight="500" color="#334155">Product support</Text>
                <Text fontWeight="600" color="#0284c7">(Watch) 61%</Text>
              </Flex>
              <Progress value={61} size="xs" colorScheme="blue" borderRadius="full" />
            </Box>

            <Box>
              <Flex justify="space-between" fontSize="13px" mb={1}>
                <Text fontWeight="500" color="#334155">Account access</Text>
                <Text fontWeight="600" color="#15803d">(Healthy) 34%</Text>
              </Flex>
              <Progress value={34} size="xs" colorScheme="green" borderRadius="full" />
            </Box>
          </VStack>
        </Box>

        {/* Critical signals */}
        <Box gridColumn={{ base: 'span 1', lg: 'span 3' }} bg="white" p={5} borderRadius="14px" border="1px solid" borderColor="#eef0f5" boxShadow="0 1px 3px rgba(0,0,0,0.02)">
          <Box mb={4}>
            <Text fontSize="15px" fontWeight="700" color="#1e293b">
              Critical signals
            </Text>
            <Text fontSize="12px" color="#94a3b8">
              Needs supervisor action
            </Text>
          </Box>

          <VStack spacing={3} align="stretch">
            {/* Signal 1 */}
            <Box bg="#fef2f2" p={3} borderRadius="10px" border="1px solid" borderColor="#fee2e2">
              <HStack spacing={2} align="center" mb={1}>
                <Box w="7px" h="7px" borderRadius="full" bg="#ef4444" />
                <Text fontSize="13px" fontWeight="700" color="#991b1b">
                  SLA breach cluster
                </Text>
              </HStack>
              <Text fontSize="12px" color="#7f1d1d" pl={4}>
                Returns queue • 9 conversations
              </Text>
            </Box>

            {/* Signal 2 */}
            <Box bg="#fffbeb" p={3} borderRadius="10px" border="1px solid" borderColor="#fef3c7">
              <HStack spacing={2} align="center" mb={1}>
                <Box w="7px" h="7px" borderRadius="full" bg="#f59e0b" />
                <Text fontSize="13px" fontWeight="700" color="#92400e">
                  Sentiment anomaly
                </Text>
              </HStack>
              <Text fontSize="12px" color="#78350f" pl={4}>
                North America • -18% in 10 min
              </Text>
            </Box>

            {/* Signal 3 */}
            <Box bg="#f8fafc" p={3} borderRadius="10px" border="1px solid" borderColor="#f1f5f9">
              <HStack spacing={2} align="center" mb={1}>
                <Box w="7px" h="7px" borderRadius="full" bg="#d97706" />
                <Text fontSize="13px" fontWeight="700" color="#334155">
                  Agent degradation
                </Text>
              </HStack>
              <Text fontSize="12px" color="#64748b" pl={4}>
                CSR Agent v4.2 • Fallback rate 24%
              </Text>
            </Box>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Bottom Row: Priority Queue & Live Supervisor Feed */}
      <SimpleGrid columns={{ base: 1, lg: 12 }} spacing={4}>
        {/* Priority conversation queue */}
        <Box
          gridColumn={{ base: 'span 1', lg: 'span 8' }}
          bg="white"
          p={5}
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
          data-testid="conversation-list"
        >
          <Flex justify="space-between" align="center" mb={4} flexWrap="wrap" gap={2}>
            <Box>
              <Text fontSize="15px" fontWeight="700" color="#1e293b">
                Priority conversation queue
              </Text>
              <Text fontSize="12px" color="#94a3b8">
                AI-ranked by urgency, value, and breach risk
              </Text>
            </Box>

            <HStack spacing={2}>
              <Select
                size="xs"
                w="110px"
                borderRadius="6px"
                value={queueFilter}
                onChange={(e) => setQueueFilter(e.target.value)}
                fontSize="12px"
              >
                <option value="all">All queues</option>
                <option value="refund">Refund</option>
                <option value="account">Account</option>
                <option value="delivery">Delivery</option>
                <option value="product">Product</option>
                <option value="billing">Billing</option>
              </Select>

              <Select
                size="xs"
                w="105px"
                borderRadius="6px"
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
                fontSize="12px"
              >
                <option value="risk">Sort: risk</option>
                <option value="wait">Sort: wait</option>
              </Select>

              <IconButton
                size="xs"
                icon={<FiExternalLink size={13} />}
                variant="outline"
                aria-label="Expand view"
                onClick={() => navigate('/conversation/conv-84291')}
              />
            </HStack>
          </Flex>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="#f8fafc">
                <Tr>
                  <Th fontSize="10px" color="#64748b" py={2.5}>CUSTOMER / CASE</Th>
                  <Th fontSize="10px" color="#64748b" py={2.5}>QUEUE</Th>
                  <Th fontSize="10px" color="#64748b" py={2.5}>AI OWNER</Th>
                  <Th fontSize="10px" color="#64748b" py={2.5}>RISK</Th>
                  <Th fontSize="10px" color="#64748b" py={2.5}>WAIT</Th>
                  <Th fontSize="10px" color="#64748b" py={2.5} textAlign="right">RECOMMENDED ACTION</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredData.map((row) => {
                  const badge = getRiskBadgeColor(row.risk);
                  return (
                    <Tr
                      key={row.id}
                      _hover={{ bg: '#f8fafc', cursor: 'pointer' }}
                      transition="background 0.1s ease"
                      onClick={() => navigate(`/conversation/${row.id}`)}
                    >
                      <Td py={3}>
                        <Text fontSize="13px" fontWeight="700" color="#1e293b">
                          {row.customerName} <Text as="span" color="#64748b" fontWeight="500">• {row.caseNum}</Text>
                        </Text>
                      </Td>
                      <Td fontSize="13px" color="#475569" py={3}>
                        {row.queue}
                      </Td>
                      <Td fontSize="13px" color="#475569" py={3}>
                        {row.aiOwner}
                      </Td>
                      <Td py={3}>
                        <Badge
                          bg={badge.bg}
                          color={badge.text}
                          borderRadius="md"
                          px={2}
                          py={0.5}
                          fontSize="12px"
                          fontWeight="700"
                        >
                          {row.risk}
                        </Badge>
                      </Td>
                      <Td fontSize="13px" color="#64748b" py={3}>
                        {row.wait}
                      </Td>
                      <Td py={3} textAlign="right">
                        <Button
                          size="xs"
                          variant="ghost"
                          color="#483c72"
                          fontWeight="700"
                          fontSize="12px"
                          _hover={{ bg: '#ede9f6' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/conversation/${row.id}`);
                          }}
                        >
                          {row.recommendedAction}
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Live supervisor feed */}
        <Box
          gridColumn={{ base: 'span 1', lg: 'span 4' }}
          bg="white"
          p={5}
          borderRadius="14px"
          border="1px solid"
          borderColor="#eef0f5"
          boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Box>
              <Text fontSize="15px" fontWeight="700" color="#1e293b">
                Live supervisor feed
              </Text>
              <Text fontSize="12px" color="#94a3b8">
                Decisions, handoffs, and model events
              </Text>
            </Box>

            <Badge bg="#dcfce7" color="#15803d" px={2} py={0.5} borderRadius="full" fontSize="11px" fontWeight="600" display="flex" alignItems="center">
              <Box w="6px" h="6px" borderRadius="full" bg="#22c55e" mr={1.5} />
              Auto-refresh
            </Badge>
          </Flex>

          <VStack spacing={4} align="stretch" position="relative" pl={2}>
            {/* Timeline vertical bar */}
            <Box
              position="absolute"
              left="10px"
              top="10px"
              bottom="10px"
              w="1.5px"
              bg="#f1f5f9"
              zIndex={0}
            />

            {liveEvents.map((ev) => (
              <HStack key={ev.id} spacing={3} align="flex-start" zIndex={1}>
                <Box
                  w="9px"
                  h="9px"
                  borderRadius="full"
                  bg={ev.dotColor}
                  mt="5px"
                  border="2px solid white"
                  boxShadow="0 0 0 1px #cbd5e1"
                  flexShrink={0}
                />
                <Box flex="1">
                  <HStack justify="space-between" align="baseline">
                    <Text fontSize="13px" fontWeight="700" color="#1e293b">
                      {ev.title}
                    </Text>
                    <Text fontSize="11px" color="#94a3b8" fontFamily="monospace">
                      {ev.time}
                    </Text>
                  </HStack>
                  <Text fontSize="12px" color="#64748b">
                    {ev.desc}
                  </Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Dashboard;