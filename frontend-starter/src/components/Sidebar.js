// src/components/Sidebar.js
import React from 'react';
import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Tooltip,
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiMessageSquare,
  FiBriefcase,
  FiZap,
  FiSettings,
} from 'react-icons/fi';

const Sidebar = ({ onNavigate, isMobile = false }) => {
  const location = useLocation();

  const isNavActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/conversations') return location.pathname.startsWith('/conversation');
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { name: 'Dashboard', icon: FiHome, path: '/' },
    { name: 'Conversations', icon: FiMessageSquare, path: '/conversation/conv-84291' },
    { name: 'AI Agents', icon: FiBriefcase, path: '/agent-config' },
    { name: 'Templates', icon: FiZap, path: '/templates' },
  ];

  const isCompact = !isMobile && (location.pathname.startsWith('/conversation/') || location.pathname.startsWith('/agent-config'));

  return (
    <Box
      as="nav"
      w={isMobile ? '100%' : isCompact ? '72px' : '200px'}
      bg="white"
      h={isMobile ? 'auto' : 'calc(100vh - 60px)'}
      position={isMobile ? 'static' : 'sticky'}
      top={isMobile ? 'auto' : '60px'}
      py={4}
      px={isCompact ? 2 : 3}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      borderRight={isMobile ? 'none' : '1px solid'}
      borderColor="#eef0f5"
      boxShadow={isMobile ? 'none' : '0 1px 3px rgba(0,0,0,0.02)'}
      transition="width 0.2s ease"
      zIndex={50}
    >
      <VStack spacing={2} align="stretch">
        {navItems.map((item) => {
          const active = isNavActive(item.path);
          return (
            <Tooltip
              key={item.name}
              label={item.name}
              placement="right"
              isDisabled={!isCompact}
            >
              <Flex
                as={Link}
                to={item.path}
                onClick={() => onNavigate && onNavigate()}
                align="center"
                justify={isCompact ? 'center' : 'flex-start'}
                px={isCompact ? 2 : 4}
                py={3}
                borderRadius="10px"
                bg={active ? '#ede9f6' : 'transparent'}
                color={active ? '#483c72' : '#64748b'}
                fontWeight={active ? '600' : '500'}
                fontSize="13px"
                cursor="pointer"
                transition="all 0.15s ease"
                _hover={{
                  bg: active ? '#ede9f6' : '#f8fafc',
                  color: active ? '#483c72' : '#334155',
                }}
              >
                <Icon as={item.icon} boxSize={isCompact ? 5 : 4} mr={isCompact ? 0 : 3} />
                {!isCompact && <Text>{item.name}</Text>}
              </Flex>
            </Tooltip>
          );
        })}
      </VStack>

      <Box pt={4} borderTop="1px solid" borderColor="#f1f5f9">
        <Tooltip label="Settings" placement="right" isDisabled={!isCompact}>
          <Flex
            as={Link}
            to="/agent-config"
            onClick={() => onNavigate && onNavigate()}
            align="center"
            justify={isCompact ? 'center' : 'flex-start'}
            px={isCompact ? 2 : 4}
            py={3}
            borderRadius="10px"
            color="#64748b"
            fontWeight="500"
            fontSize="13px"
            cursor="pointer"
            _hover={{
              bg: '#f8fafc',
              color: '#334155',
            }}
          >
            <Icon as={FiSettings} boxSize={isCompact ? 5 : 4} mr={isCompact ? 0 : 3} />
            {!isCompact && <Text>Settings</Text>}
          </Flex>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default Sidebar;