// src/components/ConnectButton.tsx
'use client'

import { Button } from '@chakra-ui/react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <Button colorScheme='teal' onClick={() => disconnect()}>
        Disconnect {`${address?.slice(0, 6)}...${address?.slice(-4)}`}
      </Button>
    )
  }
  return (
    <Button colorScheme='blue' onClick={() => connect({ connector: injected() })}>
      Connect Wallet
    </Button>
  )
}