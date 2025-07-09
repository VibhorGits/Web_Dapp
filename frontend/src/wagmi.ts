// src/wagmi.ts

import { http, createConfig } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'

export const config = createConfig({
  chains: [polygonAmoy], // We are targeting the Amoy testnet
  transports: {
    [polygonAmoy.id]: http(),
  },
})