Here's a well-formatted README guide for your TrustTrade Web App, ready for your GitHub project:

-----

# TrustTrade Web App - Full Trade Execution Guide

This guide provides a step-by-step walkthrough for conducting a complete trade lifecycle, from creation to dispute resolution, using the TrustTrade web application.

-----

## Step 1: Start the Application

1.  **Open your terminal** in the `trust-trade-app` project folder.
2.  **Run the development server:**
    ```bash
    npm run dev
    ```
3.  **Open your browser** and navigate to `http://localhost:3000`.

-----

## Step 2: Create the Trade (as the Buyer)

1.  **Connect Wallet:** Click the "**Connect Wallet**" button in the top-right corner of the application and approve the connection in MetaMask. Ensure you're connected to the **Amoy Testnet**.
2.  **Fill Form:** Complete the "**Create a New Escrow Trade**" form with the seller's address and all relevant trade details.
3.  **Submit Transaction:** Click the "**Create Trade**" button and confirm the transaction in the MetaMask pop-up.
4.  **Get Contract Address:** Once the transaction successfully goes through, locate the new contract address. For testing purposes, you can typically find this in the console output where your Hardhat scripts were running.

-----

## Step 3: Confirm the Trade (as the Seller)

1.  **Switch Accounts:** In MetaMask, switch to the wallet account you designated as the **seller** for this trade.
2.  **Navigate to Trade Page:** Go to the URL for the newly created trade: `http://localhost:3000/trade/[the-new-contract-address]`. Remember to replace `[the-new-contract-address]` with the actual address you copied earlier.
3.  **Confirm Trade:** The page will display the trade details along with a prominent green "**Confirm Trade Details**" button. Click it and confirm the transaction in MetaMask.
    The status on the page will automatically update to `AWAITING_DELIVERY`.

-----

## Step 4: The Buyer's Next Move

1.  **Switch Accounts:** Switch back to the **Buyer's account** in MetaMask.
2.  **Refresh Page:** Refresh the trade details page in your browser.
3.  **Choose Action:** You will now see two possible actions:
      * **To complete the trade:** Click "**Confirm Delivery**" and approve the transaction. This will release the funds to the seller, and the trade status will become `COMPLETE`.
      * **To start a dispute:** Click "**Raise Dispute**" and approve the transaction. The trade status will then change to `DISPUTED`.

-----

## Step 5: Resolve a Dispute (Phase 1 & 2)

### Cast Votes (as a Voter)

1.  **Switch MetaMask** to any account that you included in the **voter list**.
2.  **Navigate to the trade page.** You'll find buttons to "**Vote to Refund Buyer**" or "**Vote to Pay Seller**".
3.  Click your desired vote and confirm the transaction. Repeat this process for any other voters you wish to simulate.

### Tally Votes (as Anyone)

1.  After all desired votes have been cast, click the "**Tally Votes & Resolve**" button on the trade page and confirm the transaction.
2.  The smart contract will either **resolve the dispute** and release the funds based on the votes, or the trade status will change to `AWAITING_PHASE_2` if the votes were inconclusive.

### Final Resolution (as Chief Arbitrator)

1.  If the trade status is `AWAITING_PHASE_2`, **switch MetaMask** to the **Chief Arbitrator's account**.
2.  **Navigate to the trade page.** You'll now see buttons to "**Resolve for Buyer**" or "**Resolve for Seller**".
3.  Click your final decision and confirm the transaction to release the funds and conclude the dispute.

-----
