// src/app/page.tsx - CORRECTED

import { Box, Flex, Heading, Spacer } from "@chakra-ui/react";
import dynamic from 'next/dynamic';

// --- DYNAMIC IMPORTS FOR ALL CLIENT-SIDE COMPONENTS ---

const ConnectButton = dynamic(
  () => import('../components/ConnectButton').then(mod => mod.ConnectButton),
  { ssr: false } // Disable Server-Side Rendering
);

const CreateTradeForm = dynamic(
  () => import('../components/CreateTradeForm').then(mod => mod.CreateTradeForm),
  { ssr: false } // Disable Server-Side Rendering for this component too
);

export default function Home() {
  return (
    <Box>
      <Flex as="nav" bg="teal.500" color="white" padding={4} alignItems="center">
        <Heading size="md">TrustTrade</Heading>
        <Spacer />
        <ConnectButton />
      </Flex>

      <Flex direction="column" align="center" padding={8}>
        <Heading as="h2" size="lg" mb={6}>Create a New Escrow Trade</Heading>
        <CreateTradeForm />
      </Flex>
    </Box>
  );
}