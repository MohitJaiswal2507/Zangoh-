// src/components/Layout.js
import React from 'react';
import {
  Box,
  Flex,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
} from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box minH="100vh" bg="#f4f5f9" overflowX="hidden">
      <Header onOpenNav={onOpen} />

      {/* Slide-out Mobile Navigation Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay bg="rgba(20, 15, 35, 0.5)" backdropFilter="blur(2px)" />
        <DrawerContent bg="white" maxW="260px">
          <DrawerCloseButton />
          <DrawerHeader borderBottom="1px solid #eef0f5" fontSize="15px" fontWeight="700" color="#1e293b" py={4}>
            Menu Navigation
          </DrawerHeader>
          <DrawerBody p={0}>
            <Sidebar onNavigate={onClose} isMobile />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Flex direction="row" minH="calc(100vh - 60px)" w="100%">
        {/* Desktop Sidebar (Hidden on mobile) */}
        <Box display={{ base: 'none', md: 'block' }}>
          <Sidebar />
        </Box>

        {/* Main Content Area: Takes full width on mobile devices */}
        <Box
          as="main"
          flex="1"
          w={{ base: '100%', md: 'calc(100% - 200px)' }}
          maxW="100%"
          p={{ base: 3, sm: 4, md: 6 }}
          overflowX="auto"
        >
          {children}
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;