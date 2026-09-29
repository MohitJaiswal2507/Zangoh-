// src/pages/Templates.js
import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Avatar,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  SimpleGrid,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Textarea,
  useToast,
  Tooltip,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import {
  FiSearch,
  FiStar,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiArrowRight,
  FiCheckCircle,
  FiCheck,
  FiMoreVertical,
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiRotateCcw,
  FiRotateCw,
} from 'react-icons/fi';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from '../api';

const Templates = () => {
  const toast = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All templates');
  const [selectedChannel, setSelectedChannel] = useState('All channels');
  const [sortOption, setSortOption] = useState('Most used');
  const [activeTab, setActiveTab] = useState('All templates');
  const [mobileTab, setMobileTab] = useState('templates'); // 'templates' | 'preview' | 'categories'

  // Edit / Create Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Onboarding');
  const [formContent, setFormContent] = useState('');
  const [formIsShared, setFormIsShared] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load templates
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data || []);
      if (data && data.length > 0 && !selectedTemplate) {
        setSelectedTemplate(data[0]);
      }
    } catch (err) {
      console.error('Error loading templates:', err);
      toast({
        title: 'Error loading templates',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Filter templates
  const filteredTemplates = templates.filter((tmpl) => {
    const matchesCategory =
      selectedCategory === 'All templates' ||
      tmpl.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesChannel =
      selectedChannel === 'All channels' ||
      tmpl.channel?.toLowerCase() === selectedChannel.toLowerCase() ||
      tmpl.tags?.some(tag => tag.toLowerCase() === selectedChannel.toLowerCase());
    const matchesSearch =
      !searchTerm ||
      tmpl.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tmpl.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tmpl.content?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesChannel && matchesSearch;
  });

  // Open Create Modal
  const handleOpenCreate = () => {
    setIsCreating(true);
    setFormId('');
    setFormName('');
    setFormTitle('Shipping & Delivery Status Update');
    setFormCategory('Shipping');
    setFormContent('Hi {{customer_name}}! We are following up regarding your shipment for order {{order_number}}. Your package with tracking {{tracking_number}} is currently in transit and scheduled for delivery today.');
    setFormIsShared(true);
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (tmpl, e) => {
    if (e) e.stopPropagation();
    setIsCreating(false);
    setFormId(tmpl.id);
    setFormName(tmpl.name);
    setFormTitle(tmpl.title || tmpl.name);
    setFormCategory(tmpl.category || 'Chat');
    setFormContent(tmpl.content);
    setFormIsShared(tmpl.isShared !== false);
    setIsEditModalOpen(true);
  };

  // Handle Delete
  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(templates.find(t => t.id !== id) || null);
      }
      toast({
        title: 'Template deleted',
        status: 'success',
        duration: 2500,
      });
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: err.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Extract variables automatically from content e.g. <user name> or {{name}}
  const extractVariables = (text) => {
    const vars = [];
    const angleMatches = text.match(/<([^>]+)>/g) || [];
    angleMatches.forEach(m => {
      const v = m.replace(/[<>]/g, '').trim();
      if (!vars.some(x => x.name === v)) {
        vars.push({ name: v, description: `${v.charAt(0).toUpperCase() + v.slice(1)} value` });
      }
    });
    const curlyMatches = text.match(/\{\{([^}]+)\}\}/g) || [];
    curlyMatches.forEach(m => {
      const v = m.replace(/[{}]/g, '').trim();
      if (!vars.some(x => x.name === v)) {
        vars.push({ name: v, description: `${v.charAt(0).toUpperCase() + v.slice(1)} value` });
      }
    });
    return vars;
  };

  // Save (Create or Update)
  const handleSaveTemplate = async () => {
    if (!formName.trim()) {
      toast({ title: 'Please provide a template name', status: 'warning', duration: 2500 });
      return;
    }
    setIsSaving(true);
    try {
      const variables = extractVariables(formContent);
      if (isCreating) {
        const created = await createTemplate({
          name: formName,
          title: formTitle,
          category: formCategory,
          content: formContent,
          variables,
          isShared: formIsShared,
        });
        setTemplates(prev => [created, ...prev]);
        setSelectedTemplate(created);
        toast({ title: 'Template created', status: 'success', duration: 2500 });
      } else {
        const updated = await updateTemplate(formId, {
          name: formName,
          title: formTitle,
          category: formCategory,
          content: formContent,
          variables,
          isShared: formIsShared,
        });
        setTemplates(prev => prev.map(t => (t.id === formId ? updated : t)));
        setSelectedTemplate(updated);
        toast({ title: 'Template updated', status: 'success', duration: 2500 });
      }
      setIsEditModalOpen(false);
    } catch (err) {
      toast({ title: 'Error saving template', description: err.message, status: 'error', duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  // Replace variables for preview
  const renderPreviewContent = (tmpl) => {
    if (!tmpl) return 'Select a template to preview';
    let text = tmpl.content;
    text = text.replace(/<user name>|{{name}}|{{customer_name}}/gi, 'Avery');
    text = text.replace(/<company name>|{{company}}|{{workspace}}/gi, 'Acme');
    text = text.replace(/{{order_number}}|{{case_number}}/gi, '#84291');
    text = text.replace(/{{refund_amount}}/gi, '₹8,420');
    text = text.replace(/{{tracking_number}}/gi, 'TRK-992819');
    text = text.replace(/{{product}}/gi, 'Premium Plan');
    return text;
  };

  return (
    <Box>
      {/* Top Header */}
      <Flex justify="space-between" align={{ base: 'flex-start', md: 'center' }} mb={6} flexWrap="wrap" gap={3}>
        <Box>
          <Heading as="h1" size="lg" fontWeight="700" color="#1e293b" letterSpacing="-0.5px">
            Template Governance Workspace
          </Heading>
          <Text fontSize="13px" color="#64748b" mt={1}>
            Manage content quality, approvals, localization, performance, and lifecycle
          </Text>
        </Box>

        <Button
          bg="#483c72"
          color="white"
          fontSize="13px"
          fontWeight="600"
          _hover={{ bg: '#3e3363' }}
          leftIcon={<FiPlus size={14} />}
          onClick={handleOpenCreate}
        >
          Create template
        </Button>
      </Flex>

      {/* Mobile Tab Switcher */}
      <Flex display={{ base: 'flex', lg: 'none' }} bg="#ede9f6" p={1} borderRadius="10px" mb={4} gap={1}>
        <Button
          size="sm"
          flex="1"
          borderRadius="8px"
          bg={mobileTab === 'templates' ? '#483c72' : 'transparent'}
          color={mobileTab === 'templates' ? 'white' : '#483c72'}
          fontWeight="600"
          fontSize="12px"
          onClick={() => setMobileTab('templates')}
        >
          Templates ({filteredTemplates.length})
        </Button>
        <Button
          size="sm"
          flex="1"
          borderRadius="8px"
          bg={mobileTab === 'preview' ? '#483c72' : 'transparent'}
          color={mobileTab === 'preview' ? 'white' : '#483c72'}
          fontWeight="600"
          fontSize="12px"
          onClick={() => setMobileTab('preview')}
        >
          Preview
        </Button>
        <Button
          size="sm"
          flex="1"
          borderRadius="8px"
          bg={mobileTab === 'categories' ? '#483c72' : 'transparent'}
          color={mobileTab === 'categories' ? 'white' : '#483c72'}
          fontWeight="600"
          fontSize="12px"
          onClick={() => setMobileTab('categories')}
        >
          Categories
        </Button>
      </Flex>

      {/* 3-Column Workspace (Responsive) */}
      <Flex
        bg="white"
        borderRadius="16px"
        border="1px solid"
        borderColor="#eef0f5"
        boxShadow="0 1px 3px rgba(0,0,0,0.02)"
        h={{ base: 'auto', lg: 'calc(100vh - 170px)' }}
        minH={{ base: 'auto', lg: '620px' }}
        direction={{ base: 'column', lg: 'row' }}
        overflow="hidden"
      >
        {/* COLUMN 1: Category Sidebar */}
        <Box
          w={{ base: '100%', lg: '230px' }}
          display={{ base: mobileTab === 'categories' ? 'block' : 'none', lg: 'block' }}
          borderRight={{ base: 'none', lg: '1px solid' }}
          borderBottom={{ base: '1px solid #eef0f5', lg: 'none' }}
          borderColor="#eef0f5"
          p={4}
          bg="#fafbfc"
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
                setMobileTab('templates');
              }}
            >
              <HStack spacing={2}>
                <Box w="6px" h="6px" borderRadius="full" bg="#7c3aed" />
                <Text>All templates</Text>
              </HStack>
              <Badge bg="#e9d5ff" color="#7c3aed" fontSize="10px" borderRadius="full" px={1.5}>
                {templates.length || 24}
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
                setMobileTab('templates');
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
                setMobileTab('templates');
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
            {['Shipping', 'Returns', 'Billing', 'Onboarding', 'Support', 'Engagement', 'Transaction'].map((j) => (
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
                  setMobileTab('templates');
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
                  setMobileTab('templates');
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

        {/* COLUMN 2: Response Templates List */}
        <Box
          flex="1"
          w={{ base: '100%', lg: 'auto' }}
          display={{ base: mobileTab === 'templates' ? 'flex' : 'none', lg: 'flex' }}
          p={{ base: 3, sm: 5 }}
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

          <Flex wrap="wrap" gap={2} mb={3}>
            <InputGroup size="sm" flex="1" minW={{ base: '100%', sm: '180px' }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="#94a3b8" size={13} />
              </InputLeftElement>
              <Input
                placeholder="Search title, message, or tag"
                borderRadius="8px"
                fontSize="12px"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              size="sm"
              w={{ base: '48%', sm: '130px' }}
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

            <Select
              size="sm"
              w={{ base: '48%', sm: '120px' }}
              borderRadius="8px"
              fontSize="12px"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="Most used">Most used</option>
              <option value="Recently used">Recently used</option>
              <option value="Alphabetical">Alphabetical</option>
            </Select>
          </Flex>

          <HStack justify="space-between" mb={3}>
            <HStack spacing={2}>
              <Button
                size="xs"
                borderRadius="full"
                bg={activeTab === 'All templates' ? '#ede9f6' : 'transparent'}
                color={activeTab === 'All templates' ? '#483c72' : '#64748b'}
                fontWeight={activeTab === 'All templates' ? '700' : '500'}
                onClick={() => setActiveTab('All templates')}
              >
                All templates
              </Button>
              <Button
                size="xs"
                borderRadius="full"
                variant="outline"
                fontSize="11px"
                bg={activeTab === 'My team' ? '#ede9f6' : 'white'}
                color={activeTab === 'My team' ? '#483c72' : '#64748b'}
                onClick={() => setActiveTab('My team')}
              >
                My team
              </Button>
              <Button
                size="xs"
                borderRadius="full"
                variant="outline"
                fontSize="11px"
                bg={activeTab === 'Recently used' ? '#ede9f6' : 'white'}
                color={activeTab === 'Recently used' ? '#483c72' : '#64748b'}
                onClick={() => setActiveTab('Recently used')}
              >
                Recently used
              </Button>
            </HStack>
            <Text fontSize="11px" color="#94a3b8">
              {filteredTemplates.length} results
            </Text>
          </HStack>

          {/* Cards Grid (2 columns) */}
          <Box flex="1" overflowY="auto" pr={1}>
            {loading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner color="#483c72" size="lg" />
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <Box
                    key={tmpl.id}
                    p={4}
                    borderRadius="12px"
                    border="1.5px solid"
                    borderColor={isSelected ? '#483c72' : '#eef0f5'}
                    bg={isSelected ? '#faf8fc' : 'white'}
                    cursor="pointer"
                    position="relative"
                    role="group"
                    onClick={() => {
                      setSelectedTemplate(tmpl);
                      setMobileTab('preview');
                    }}
                    transition="all 0.15s ease"
                    _hover={{ borderColor: '#483c72', bg: '#faf8fc' }}
                  >
                    {/* Top Skeleton bar and favorite */}
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

                    {/* Hover Actions matching Figma: Delete, Edit, Insert */}
                    <HStack
                      position="absolute"
                      bottom="-16px"
                      left="50%"
                      transform="translateX(-50%)"
                      spacing={2}
                      opacity={0}
                      _groupHover={{ opacity: 1, bottom: "-12px" }}
                      transition="all 0.15s ease"
                      zIndex={10}
                    >
                      <Tooltip label="Delete template">
                        <IconButton
                          size="xs"
                          borderRadius="full"
                          bg="#fee2e2"
                          color="#dc2626"
                          icon={<FiTrash2 size={12} />}
                          aria-label="delete"
                          boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                          _hover={{ bg: '#fecaca' }}
                          onClick={(e) => handleDelete(tmpl.id, e)}
                        />
                      </Tooltip>
                      <Tooltip label="Edit template">
                        <IconButton
                          size="xs"
                          borderRadius="full"
                          bg="#e0f2fe"
                          color="#0284c7"
                          icon={<FiEdit2 size={12} />}
                          aria-label="edit"
                          boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                          _hover={{ bg: '#bae6fd' }}
                          onClick={(e) => handleOpenEdit(tmpl, e)}
                        />
                      </Tooltip>
                      <Tooltip label="Use template">
                        <IconButton
                          size="xs"
                          borderRadius="full"
                          bg="#dcfce7"
                          color="#15803d"
                          icon={<FiArrowRight size={12} />}
                          aria-label="use"
                          boxShadow="0 2px 5px rgba(0,0,0,0.1)"
                          _hover={{ bg: '#bbf7d0' }}
                          onClick={() => {
                            setSelectedTemplate(tmpl);
                            setMobileTab('preview');
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                );
              })}
            </SimpleGrid>
            )}
          </Box>
        </Box>

        {/* COLUMN 3: Preview Panel */}
        <Box
          w={{ base: '100%', lg: '310px' }}
          display={{ base: mobileTab === 'preview' ? 'flex' : 'none', lg: 'flex' }}
          borderLeft={{ base: 'none', lg: '1px solid' }}
          borderTop={{ base: '1px solid #eef0f5', lg: 'none' }}
          borderColor="#eef0f5"
          p={{ base: 4, sm: 5 }}
          bg="white"
          flexDirection="column"
        >
          <Button
            display={{ base: 'inline-flex', lg: 'none' }}
            size="xs"
            variant="ghost"
            color="#483c72"
            alignSelf="flex-start"
            mb={2}
            onClick={() => setMobileTab('templates')}
          >
            ← Back to templates
          </Button>

          <Text fontSize="15px" fontWeight="700" color="#1e293b" mb={1}>
            Preview
          </Text>
          <Text fontSize="12px" color="#64748b" mb={4}>
            Review the selected reply before inserting.
          </Text>

          <Box mb={4}>
            <Text fontSize="11px" fontWeight="700" color="#94a3b8" letterSpacing="0.5px" textTransform="uppercase" mb={1.5}>
              PREVIEW AS
            </Text>
            <Select size="sm" borderRadius="8px" fontSize="12px" defaultValue="New visitor">
              <option value="New visitor">New visitor</option>
              <option value="Elena Vasquez">Elena Vasquez (VIP)</option>
              <option value="Marcus Lee">Marcus Lee</option>
            </Select>
          </Box>

          <Text fontSize="11px" color="#94a3b8" mb={2}>
            Live preview
          </Text>

          {/* Substituted Card Preview */}
          <Box p={4} borderRadius="12px" border="1px solid" borderColor="#eef0f5" bg="#fbfcfe" mb={4} flex="1">
            <HStack spacing={2} align="center" mb={2}>
              <Avatar size="xs" name="Avery" bg="#b8a8d9" />
              <Text fontSize="13px" fontWeight="700" color="#1e293b">
                Welcome, Avery 👋
              </Text>
            </HStack>

            <Text fontSize="12px" color="#334155" lineHeight="1.6" mb={4}>
              {selectedTemplate ? renderPreviewContent(selectedTemplate) : 'Select a template.'}
            </Text>

            <Button size="xs" bg="#483c72" color="white" fontWeight="600" _hover={{ bg: '#3e3363' }}>
              View getting started
            </Button>
          </Box>

          {/* Variable substitution indicator */}
          <Box bg="#ecfdf5" p={3} borderRadius="10px" border="1px solid" borderColor="#d1fae5" mb={3}>
            <HStack spacing={2} align="center">
              <FiCheckCircle color="#059669" size={15} />
              <Text fontSize="12px" fontWeight="700" color="#065f46">
                {selectedTemplate?.variables?.length || 2} variables resolved
              </Text>
            </HStack>
            <Text fontSize="11px" color="#047857" pl={6}>
              {selectedTemplate?.variables?.map(v => v.description || v.name).join(' and ') || 'Visitor name and workspace'}
            </Text>
          </Box>

          <Text fontSize="11px" color="#94a3b8" mb={4}>
            You can edit the message after inserting.
          </Text>

          <HStack spacing={2} justify="flex-end">
            <Button size="sm" variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              bg="#483c72"
              color="white"
              fontWeight="600"
              _hover={{ bg: '#3e3363' }}
              onClick={() => {
                toast({
                  title: 'Template ready',
                  description: 'Template selected for supervisor use.',
                  status: 'info',
                  duration: 2000,
                });
              }}
            >
              Insert
            </Button>
          </HStack>
        </Box>
      </Flex>

      {/* EDIT / CREATE TEMPLATE MODAL (Matches 'Edit Template Screen.png') */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="5xl" isCentered>
        <ModalOverlay bg="rgba(30, 20, 50, 0.45)" backdropFilter="blur(3px)" />
        <ModalContent borderRadius="18px" overflow="hidden" maxH="90vh">
          <ModalBody p={6}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Left Column: Form */}
              <Box>
                <Heading size="md" fontWeight="700" color="#1e293b" mb={4}>
                  {isCreating ? 'Create Template' : 'Edit Template'}
                </Heading>

                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="12px" fontWeight="600" color="#64748b" mb={1}>
                      Name
                    </Text>
                    <Input
                      placeholder="Template name"
                      borderRadius="8px"
                      fontSize="13px"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="12px" fontWeight="600" color="#64748b" mb={1}>
                      Title
                    </Text>
                    <Input
                      placeholder="Say Hi to welcome new visitors!"
                      borderRadius="8px"
                      fontSize="13px"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="12px" fontWeight="600" color="#64748b" mb={1}>
                      Category
                    </Text>
                    <Select
                      borderRadius="8px"
                      fontSize="13px"
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                    >
                      <option value="Shipping">Shipping</option>
                      <option value="Returns">Returns</option>
                      <option value="Billing">Billing</option>
                      <option value="Support">Support</option>
                      <option value="Chat">Chat</option>
                      <option value="Onboarding">Onboarding</option>
                      <option value="Transaction">Transaction</option>
                    </Select>
                  </Box>

                  <Box>
                    <Flex justify="space-between" align="center" mb={1}>
                      <Text fontSize="12px" fontWeight="600" color="#64748b">
                        Content
                      </Text>
                      <Text fontSize="11px" color="#7c3aed" fontWeight="600">
                        Format: &#123;&#123;variable_name&#125;&#125;
                      </Text>
                    </Flex>

                    {/* Quick Variable Insertion Chips */}
                    <Box mb={2} p={2} bg="#f8fafc" borderRadius="8px" border="1px solid #eef0f5">
                      <Text fontSize="10px" fontWeight="700" color="#64748b" textTransform="uppercase" mb={1}>
                        Click to insert variable placeholder:
                      </Text>
                      <Flex wrap="wrap" gap={1.5}>
                        {[
                          '{{customer_name}}',
                          '{{order_number}}',
                          '{{tracking_number}}',
                          '{{refund_amount}}',
                          '{{shipping_carrier}}',
                          '{{return_reason}}',
                          '{{policy_window}}',
                        ].map((chip) => (
                          <Badge
                            key={chip}
                            as="button"
                            type="button"
                            fontSize="10px"
                            px={2}
                            py={0.5}
                            borderRadius="full"
                            bg="#ede9f6"
                            color="#483c72"
                            fontWeight="600"
                            cursor="pointer"
                            _hover={{ bg: '#dcd5ed' }}
                            onClick={() => setFormContent(prev => `${prev} ${chip}`)}
                          >
                            + {chip}
                          </Badge>
                        ))}
                      </Flex>
                    </Box>

                    <Box border="1px solid" borderColor="#e2e8f0" borderRadius="8px" overflow="hidden">
                      <Textarea
                        placeholder="Hi {{customer_name}}! We are following up on your order {{order_number}}..."
                        fontSize="13px"
                        border="none"
                        rows={5}
                        _focus={{ boxShadow: 'none' }}
                        value={formContent}
                        onChange={(e) => setFormContent(e.target.value)}
                      />
                      {/* Rich Text Toolbar */}
                      <Flex p={2} bg="#f8fafc" borderTop="1px solid" borderColor="#eef0f5" gap={2} align="center">
                        <IconButton size="xs" variant="ghost" icon={<FiRotateCcw />} aria-label="undo" />
                        <IconButton size="xs" variant="ghost" icon={<FiRotateCw />} aria-label="redo" />
                        <Divider orientation="vertical" h="14px" />
                        <IconButton size="xs" variant="ghost" icon={<FiBold />} aria-label="bold" />
                        <IconButton size="xs" variant="ghost" icon={<FiItalic />} aria-label="italic" />
                        <IconButton size="xs" variant="ghost" icon={<FiUnderline />} aria-label="underline" />
                        <IconButton size="xs" variant="ghost" icon={<FiList />} aria-label="list" />
                        <Text fontSize="11px" color="#94a3b8" ml="auto">
                          Dynamic &#123;&#123;var&#125;&#125; supported
                        </Text>
                      </Flex>
                    </Box>
                  </Box>

                  <Flex justify="space-between" align="center" pt={4}>
                    <Button
                      size="sm"
                      bg={formIsShared ? '#483c72' : 'white'}
                      color={formIsShared ? 'white' : '#483c72'}
                      border="1px solid"
                      borderColor="#483c72"
                      leftIcon={<FiCheck size={14} />}
                      onClick={() => setFormIsShared(!formIsShared)}
                      _hover={{ bg: formIsShared ? '#3e3363' : '#ede9f6' }}
                    >
                      Share with Team ✓
                    </Button>

                    <HStack spacing={3}>
                      <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        bg="#483c72"
                        color="white"
                        fontWeight="600"
                        _hover={{ bg: '#3e3363' }}
                        onClick={handleSaveTemplate}
                        isLoading={isSaving}
                      >
                        Save
                      </Button>
                    </HStack>
                  </Flex>
                </VStack>
              </Box>

              {/* Right Column: Preview with variable highlight */}
              <Box borderLeft={{ md: '1px solid' }} borderColor="#eef0f5" pl={{ md: 6 }}>
                <Heading size="md" fontWeight="700" color="#1e293b" mb={4}>
                  Preview
                </Heading>

                <Box
                  p={4}
                  borderRadius="14px"
                  border="1px solid"
                  borderColor="#eef0f5"
                  bg="#ffffff"
                  boxShadow="0 2px 6px rgba(0,0,0,0.03)"
                  mt={10}
                >
                  <Flex justify="space-between" align="center" mb={3}>
                    <Badge bg="#ede9f6" color="#483c72" px={2.5} py={0.5} borderRadius="full" fontSize="11px" fontWeight="600">
                      ✦ {formCategory}
                    </Badge>
                    <FiMoreVertical color="#94a3b8" />
                  </Flex>

                  <Box fontSize="13px" color="#334155" lineHeight="1.7">
                    {/* Render variable tags in purple badges */}
                    {formContent ? (
                      formContent.split(/(<[^>]+>|\{\{[^}]+\}\})/g).map((chunk, idx) => {
                        if (chunk.startsWith('<') && chunk.endsWith('>')) {
                          return (
                            <Badge key={idx} bg="#ede9f6" color="#483c72" px={1.5} py={0.5} mx={0.5} borderRadius="md" fontSize="12px" fontWeight="600">
                              {chunk}
                            </Badge>
                          );
                        }
                        if (chunk.startsWith('{{') && chunk.endsWith('}}')) {
                          return (
                            <Badge key={idx} bg="#ede9f6" color="#483c72" px={1.5} py={0.5} mx={0.5} borderRadius="md" fontSize="12px" fontWeight="600">
                              {chunk}
                            </Badge>
                          );
                        }
                        return <span key={idx}>{chunk}</span>;
                      })
                    ) : (
                      <Text color="#94a3b8">Template content preview...</Text>
                    )}
                  </Box>
                </Box>
              </Box>
            </SimpleGrid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Templates;
