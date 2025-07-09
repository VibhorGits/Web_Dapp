// src/app/trade/[address]/page.tsx - FINAL VERSION

'use client'

import { Box, Button, Card, CardBody, CardHeader, Code, Divider, Flex, Heading, Spinner, Stack, Tag, Text, useToast } from "@chakra-ui/react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import EscrowTradeAbi from '../../../contracts/EscrowTrade.json';
import { formatEther } from "../../../../node_modules/viem";

const states = [
    "AWAITING_SELLER_CONFIRMATION",
    "AWAITING_DELIVERY",
    "COMPLETE",
    "DISPUTED",
    "AWAITING_PHASE_2"
];

export default function TradeDetailsPage({ params }: { params: { address: string } }) {
    const { address: connectedAddress } = useAccount();
    const { writeContract, isPending } = useWriteContract();
    
    const escrowContractAddress = params.address as `0x${string}`;

    const { data: tradeData, isLoading, isError, refetch } = useReadContract({
        address: escrowContractAddress,
        abi: EscrowTradeAbi.abi,
        functionName: 'getTradeDetails',
    });

    // --- NEW: Handlers for all dispute actions ---
    const handleCastVote = (voteForBuyer: boolean) => {
        writeContract({ address: escrowContractAddress, abi: EscrowTradeAbi.abi, functionName: 'castVote', args: [voteForBuyer] });
    };

    const handleTallyVotes = () => {
        writeContract({ address: escrowContractAddress, abi: EscrowTradeAbi.abi, functionName: 'tallyVotesAndResolve' });
    };

    const handleResolvePhase2 = (refundBuyer: boolean) => {
        writeContract({ address: escrowContractAddress, abi: EscrowTradeAbi.abi, functionName: 'resolvePhase2Dispute', args: [refundBuyer] });
    };

    // Other handlers
    const handleConfirmTrade = () => writeContract({ address: escrowContractAddress, abi: EscrowTradeAbi.abi, functionName: 'confirmTradeDetails' });
    const handleConfirmDelivery = () => writeContract({ address: escrowContractAddress, abi: EscrowTradeAbi.abi, functionName: 'confirmDelivery' });
    const handleRaiseDispute = () => writeContract({ address: escrowContractAddress, abi: EscrowTradeAbi.abi, functionName: 'raiseDispute' });

    if (isLoading) {
        return <Flex justify="center" align="center" height="80vh"><Spinner size="xl" /></Flex>;
    }

    if (isError || !tradeData) {
        return <Text p={8}>Error loading trade data. Please check the address and network.</Text>;
    }
    
    const [buyer, seller, amount, stateIndex, details, votesForBuyer, votesForSeller, chiefArbitrator] = tradeData as any[];
    const currentState = states[Number(stateIndex)];

    const isSellerConnected = connectedAddress?.toLowerCase() === seller.toLowerCase();
    const isBuyerConnected = connectedAddress?.toLowerCase() === buyer.toLowerCase();
    const isArbitratorConnected = connectedAddress?.toLowerCase() === chiefArbitrator.toLowerCase();

    return (
        <Flex justify="center" p={8}>
            <Card width="100%" maxWidth="800px">
                <CardHeader>
                    <Heading size="lg">Trade Details</Heading>
                    <Text fontSize="sm" color="gray.500">Contract: <Code>{escrowContractAddress}</Code></Text>
                </CardHeader>
                <CardBody>
                    <Stack spacing={4}>
                        <Flex justify="space-between"><Text fontWeight="bold">Status:</Text><Tag>{currentState}</Tag></Flex>
                        <Divider />
                        <Text><strong>Item:</strong> {details.item}</Text>
                        <Text><strong>Total Value:</strong> {formatEther(amount)} ETH</Text>
                        <Text><strong>Buyer:</strong> <Code>{buyer}</Code></Text>
                        <Text><strong>Seller:</strong> <Code>{seller}</Code></Text>
                        {Number(stateIndex) >= 3 && <Text><strong>Chief Arbitrator:</strong> <Code>{chiefArbitrator}</Code></Text>}
                        <Divider />

                        {/* --- Action Buttons --- */}
                        <Box mt={4}>
                            {currentState === "AWAITING_SELLER_CONFIRMATION" && isSellerConnected && (
                                <Button colorScheme="green" onClick={handleConfirmTrade} isLoading={isPending}>Confirm Trade Details</Button>
                            )}

                            {currentState === "AWAITING_DELIVERY" && isBuyerConnected && (
                                <Flex gap={4}>
                                    <Button colorScheme="green" onClick={handleConfirmDelivery} isLoading={isPending}>Confirm Delivery</Button>
                                    <Button colorScheme="red" onClick={handleRaiseDispute} isLoading={isPending}>Raise Dispute</Button>
                                </Flex>
                            )}

                            {/* --- NEW: Phase 1 Voting UI --- */}
                            {currentState === "DISPUTED" && (
                                <Box>
                                    <Heading size="md" mb={4}>Phase 1 Voting</Heading>
                                    <Text mb={4}>Authorized voters can now vote on the outcome.</Text>
                                    <Flex gap={4}>
                                        <Button colorScheme="blue" onClick={() => handleCastVote(true)} isLoading={isPending}>Vote to Refund Buyer</Button>
                                        <Button colorScheme="orange" onClick={() => handleCastVote(false)} isLoading={isPending}>Vote to Pay Seller</Button>
                                    </Flex>
                                    <Divider my={4} />
                                    <Button onClick={handleTallyVotes} isLoading={isPending}>Tally Votes & Resolve</Button>
                                </Box>
                            )}

                            {/* --- NEW: Phase 2 Resolution UI --- */}
                            {currentState === "AWAITING_PHASE_2" && isArbitratorConnected && (
                                <Box>
                                    <Heading size="md" mb={4}>Phase 2 Arbitration</Heading>
                                    <Text mb={4}>As the Chief Arbitrator, you have the final say.</Text>
                                    <Flex gap={4}>
                                        <Button colorScheme="blue" onClick={() => handleResolvePhase2(true)} isLoading={isPending}>Resolve for Buyer</Button>
                                        <Button colorScheme="orange" onClick={() => handleResolvePhase2(false)} isLoading={isPending}>Resolve for Seller</Button>
                                    </Flex>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </CardBody>
            </Card>
        </Flex>
    );
}