// src/components/Header.js
import React from 'react';
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Text,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { FiSearch, FiMenu } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Header = ({ onOpenNav }) => {
  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      bg="#3d3464"
      px={{ base: 3, md: 6 }}
      py={3}
      zIndex={100}
      boxShadow="0 1px 4px rgba(0,0,0,0.15)"
    >
      <Flex justify="space-between" align="center" maxW="100%">
        <HStack spacing={{ base: 2, md: 4 }}>
          {/* Hamburger button for mobile screens */}
          <IconButton
            display={{ base: 'inline-flex', md: 'none' }}
            icon={<FiMenu size={20} />}
            variant="ghost"
            color="white"
            _hover={{ bg: 'rgba(255, 255, 255, 0.15)' }}
            _active={{ bg: 'rgba(255, 255, 255, 0.25)' }}
            onClick={onOpenNav}
            aria-label="Open mobile navigation"
            size="sm"
          />

          <Link to="/">
            <Text
              fontSize={{ base: 'md', md: 'lg' }}
              fontWeight="700"
              color="white"
              letterSpacing="-0.3px"
              cursor="pointer"
              _hover={{ opacity: 0.9 }}
            >
              ABC Company
            </Text>
          </Link>
        </HStack>

        <HStack spacing={{ base: 2, md: 4 }} flex="1" maxW="480px" justify="flex-end">
          <InputGroup maxW="360px" size="sm" display={{ base: 'none', md: 'block' }}>
            <InputLeftElement pointerEvents="none" h="100%">
              <FiSearch color="rgba(255, 255, 255, 0.65)" size={15} />
            </InputLeftElement>
            <Input
              placeholder="Search conversations, agents..."
              bg="rgba(255, 255, 255, 0.12)"
              color="white"
              border="none"
              borderRadius="8px"
              fontSize="13px"
              _placeholder={{ color: 'rgba(255, 255, 255, 0.6)' }}
              _hover={{ bg: 'rgba(255, 255, 255, 0.18)' }}
              _focus={{
                bg: 'rgba(255, 255, 255, 0.22)',
                boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.4)',
              }}
            />
          </InputGroup>

          <Avatar
            size="sm"
            name="Neha Prasad"
            getInitials={() => 'NP'}
            bg="#e5a97d"
            color="#3d220f"
            fontWeight="bold"
            fontSize="12px"
            cursor="pointer"
            _hover={{ transform: 'scale(1.05)' }}
            transition="transform 0.15s ease"
          />
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;
