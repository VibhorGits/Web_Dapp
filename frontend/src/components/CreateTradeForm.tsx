// src/components/CreateTradeForm.tsx
'use client'

import { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, NumberInput, NumberInputField, VStack, useToast, Text } from '@chakra-ui/react';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';

import EscrowTradeFactoryAbi from '../contracts/EscrowTradeFactory.json';

// --- UPDATED: Read address from environment variables ---
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

export function CreateTradeForm() {
  const { address: accountAddress, isConnected } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();

  const [sellerAddress, setSellerAddress] = useState('');
  const [item, setItem] = useState('');
  const [units, setUnits] = useState(1);
  const [price, setPrice] = useState('');

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!FACTORY_ADDRESS) {
        toast({ title: "Factory address not configured.", status: "error", duration: 5000 });
        return;
    }
    // ... (rest of the validation and logic)

    const pricePerUnitInWei = parseEther(price);
    const totalAmountInWei = BigInt(units) * pricePerUnitInWei;
    
    // For now, these are hardcoded for simplicity
    const voters = [accountAddress, "0xc6706a29435640E008a613aE3Cd409F9CC2e654B", "0xb8d18BA726F9Dcd3D67d10fC0044b0ccB15A40cb"];
    const chiefArbitrator = accountAddress;

    writeContract({
      address: FACTORY_ADDRESS,
      abi: EscrowTradeFactoryAbi.abi,
      functionName: 'createTrade',
      args: [
        sellerAddress,
        { item, units, pricePerUnit: pricePerUnitInWei },
        voters,
        chiefArbitrator,
      ],
      value: totalAmountInWei,
    });
  };

  if (!isConnected) {
    return <Text>Please connect your wallet to create a trade.</Text>;
  }

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="500px" mt={8}>
        {/* The form JSX remains the same */}
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
