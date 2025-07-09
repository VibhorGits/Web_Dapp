// src/components/CreateTradeForm.tsx
'use client'

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, VStack, useToast, Text } from '@chakra-ui/react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from '../../node_modules/viem';

// We need to import the ABI of our factory contract
import EscrowTradeFactoryAbi from '../contracts/EscrowTradeFactory.json';

// The address of your deployed factory contract
const FACTORY_ADDRESS = "0xBFbdf406D3a208eB42A1f94c1EE891dA4A3c9C5f"; // <-- IMPORTANT: Update this!

export function CreateTradeForm() {
  // Wagmi hooks to get user's account and to write to contracts
  const { address: accountAddress, isConnected } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();

  // Form state
  const [sellerAddress, setSellerAddress] = useState('');
  const [item, setItem] = useState('');
  const [units, setUnits] = useState(1);
  const [price, setPrice] = useState('');

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // --- Simple Form Validation ---
    if (!sellerAddress || !item || !units || !price) {
      toast({ title: "All fields are required.", status: "error", duration: 3000, isClosable: true });
      return;
    }

    const pricePerUnitInWei = parseEther(price);
    const totalAmountInWei = BigInt(units) * pricePerUnitInWei;

    // --- Hardcoded voters and arbitrator for now ---
    const voters = [accountAddress, "0xc6706a29435640E008a613aE3Cd409F9CC2e654B", "0xb8d18BA726F9Dcd3D67d10fC0044b0ccB15A40cb"];
    const chiefArbitrator = accountAddress; // Using buyer as arbitrator for simplicity

    // --- Call the Smart Contract ---
    writeContract({
      address: `0x${FACTORY_ADDRESS.slice(2)}`, // Wagmi requires '0x' prefix
      abi: EscrowTradeFactoryAbi.abi,
      functionName: 'createTrade',
      args: [
        sellerAddress,
        { item, units, pricePerUnit: pricePerUnitInWei }, // The TradeDetails struct
        voters,
        chiefArbitrator,
      ],
      value: totalAmountInWei, // The total amount to be escrowed
    });
  };

  // If wallet is not connected, show a message instead of the form
  if (!isConnected) {
    return <Text>Please connect your wallet to create a trade.</Text>;
  }

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="500px" mt={8}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Seller Address</FormLabel>
          <Input placeholder="0x..." value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Item Description</FormLabel>
          <Input placeholder="e.g., 10x Graphics Cards" value={item} onChange={(e) => setItem(e.target.value)} />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Number of Units</FormLabel>
          <NumberInput min={1} value={units} onChange={(_, valueAsNumber) => setUnits(valueAsNumber)}>
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Price Per Unit (in ETH)</FormLabel>
          <Input placeholder="e.g., 0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
        </FormControl>

        <Button type="submit" colorScheme="teal" width="full" isLoading={isPending}>
          {isPending ? 'Confirming in Wallet...' : 'Create Trade'}
        </Button>

        {hash && <Text>Trade created! Tx hash: {hash}</Text>}
      </VStack>
    </Box>
  );
}