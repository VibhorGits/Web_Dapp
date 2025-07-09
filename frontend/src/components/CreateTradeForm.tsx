// src/components/CreateTradeForm.tsx - FINAL CORRECTED VERSION
'use client'

import { useState, useEffect } from 'react'; // <-- Make sure useEffect is imported
import { Box, Button, FormControl, FormLabel, Input, Link, NumberInput, NumberInputField, VStack, useToast, Text, Alert, AlertIcon } from '@chakra-ui/react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi, parseEther, Log } from 'viem';
import NextLink from 'next/link';

// --- NEW: Define the ABI directly for parsing ---
const factoryAbi = parseAbi([
    'event TradeCreated(address indexed buyer, address indexed seller, uint256 amount, address indexed escrowContractAddress, uint256 tradeId)',
    'function createTrade(address _seller, (string item, uint256 units, uint256 pricePerUnit) memory _details, address[] memory _voters, address _chiefArbitrator) external payable returns (address newEscrowAddress)',
]);

const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

export function CreateTradeForm() {
    const { address: accountAddress, isConnected } = useAccount();
    const { writeContract, isPending, data: hash, reset } = useWriteContract();

    const [sellerAddress, setSellerAddress] = useState('');
    const [item, setItem] = useState('');
    const [units, setUnits] = useState(1);
    const [price, setPrice] = useState('');
    const [newTradeAddress, setNewTradeAddress] = useState<string | null>(null);

    const toast = useToast();

    const { data: receipt, isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

    // --- CORRECTED useEffect HOOK ---
    useEffect(() => {
        if (receipt) {
            // Find the log safely
            const tradeCreatedLog = receipt.logs.find(
                (log: any) => log.topics[0] === '0xe6590d553dfe4e8168c8542cdcea58d217ecf014a1b127e13e896388286de64f'
            );

            // Check if the log was found before trying to access it
            if (tradeCreatedLog) {
                // The address is the 4th topic of our event
                const newAddress = `0x${tradeCreatedLog.topics[3]?.slice(26)}`;
                setNewTradeAddress(newAddress);
                toast({ title: "Trade successfully created!", status: "success" });
            }
        }
    // We remove `toast` from the dependency array because it's a stable function
    // and we only want this effect to run when `receipt` changes.
    }, [receipt]); 

     const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    reset(); 
    setNewTradeAddress(null);

    // --- Type Safety Checks ---
    if (!FACTORY_ADDRESS) {
        toast({ title: "Factory address not configured.", status: "error" });
        return;
    }
    if (!accountAddress) {
        toast({ title: "Please connect your wallet first.", status: "error" });
        return;
    }

    const pricePerUnitInWei = parseEther(price);
    const totalAmountInWei = BigInt(units) * pricePerUnitInWei;

    // --- THIS IS THE FIX ---
    // We explicitly cast all address strings to the `0x${string}` type
    // and ensure no undefined values are passed.

    const finalSellerAddress = sellerAddress as `0x${string}`;
    
    // We create the voters array and ensure all addresses are valid before casting.
    const finalVoters = [
      accountAddress,
      "0xc6706a29435640E008a613aE3Cd409F9CC2e654B",
      "0xb8d18BA726F9Dcd3D67d10fC0044b0ccB15A40cb"
    ].filter(Boolean) as `0x${string}`[];

    const finalChiefArbitrator = accountAddress as `0x${string}`;


    writeContract({
        address: FACTORY_ADDRESS,
        abi: factoryAbi,
        functionName: 'createTrade',
        args: [
            finalSellerAddress,
            { item, units:BigInt(units), pricePerUnit: pricePerUnitInWei },
            finalVoters,
            finalChiefArbitrator
        ],
        value: totalAmountInWei,
    });
};

    if (!isConnected) {
        return <Text>Please connect your wallet to create a trade.</Text>;
    }

    return (
        <Box as="form" onSubmit={handleSubmit} width="100%" maxWidth="500px" mt={8}>
            <VStack spacing={4}>
                {/* Form Controls... */}
                <FormControl isRequired><FormLabel>Seller Address</FormLabel><Input placeholder="0x..." value={sellerAddress} onChange={(e) => setSellerAddress(e.target.value)} /></FormControl>
                <FormControl isRequired><FormLabel>Item Description</FormLabel><Input placeholder="e.g., 10x Graphics Cards" value={item} onChange={(e) => setItem(e.target.value)} /></FormControl>
                <FormControl isRequired><FormLabel>Number of Units</FormLabel><NumberInput min={1} value={units} onChange={(_, val) => setUnits(val)}><NumberInputField /></NumberInput></FormControl>
                <FormControl isRequired><FormLabel>Price Per Unit (in ETH)</FormLabel><Input placeholder="e.g., 0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></FormControl>
                
                <Button type="submit" colorScheme="teal" width="full" isLoading={isPending || isConfirming}>
                    {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Creating Trade...' : 'Create Trade'}
                </Button>

                {newTradeAddress && hash && (
                    <Alert status="success" flexDirection="column" alignItems="start" mt={4} borderRadius="md">
                        <AlertIcon />
                        <Text fontWeight="bold">Trade Created!</Text>
                        <Text fontSize="sm" wordBreak="break-all">Tx Hash: {hash}</Text>
                        <Text fontSize="sm">Contract Address: {newTradeAddress}</Text>
                        
                        {/* --- THIS IS THE FIX --- */}
                        {/* We now construct the URL dynamically */}
                        <Link 
                          as={NextLink} 
                          href={`${process.env.NEXT_PUBLIC_APP_URL}/trade/${newTradeAddress}`} 
                          color="teal.500" 
                          fontWeight="bold"
                        >
                            Click here to view your trade
                        </Link>
                    </Alert>
                )}
            </VStack>
        </Box>
    );
}
