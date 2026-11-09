# 🛡️ Authority Dashboard - Blockchain Document Verification System

A decentralized, tamper-proof document management and verification dashboard built with **React**, **Ethers.js (v6)**, and **Ethereum Smart Contracts (Sepolia Testnet)**.

This dashboard allows government/institutional authorities to issue, verify, view, and permanently revoke cryptographic document records on the Ethereum blockchain, while seamlessly syncing document metadata with an off-chain backend database.

---

## 📋 Table of Contents
- [Features](#-features)
- [Architecture & Workflow](#-architecture--workflow)
- [Blockchain 101: Understanding the System](#-blockchain-101-understanding-the-system)
  - [Why Blockchain for Document Verification?](#why-blockchain-for-document-verification)
  - [What is the Sepolia Testnet?](#what-is-the-sepolia-testnet)
  - [Read Operations vs Write Operations](#read-operations-vs-write-operations)
- [Smart Contract Reference](#-smart-contract-reference)
  - [Contract Information](#contract-information)
  - [Functions & Gas Costs](#functions--gas-costs)
- [MetaMask & Web3 Setup Guide](#-metamask--web3-setup-guide)
  - [Step 1: Install & Set Up MetaMask](#step-1-install--set-up-metamask)
  - [Step 2: Enable & Connect to Sepolia Testnet](#step-2-enable--connect-to-sepolia-testnet)
  - [Step 3: Get Free Sepolia Test ETH (Faucets)](#step-3-get-free-sepolia-test-eth-faucets)
  - [Step 4: Authorize Your Wallet as an Issuer (Crucial First Step)](#step-4-authorize-your-wallet-as-an-issuer-crucial-first-step)
- [Getting Started / Local Installation](#-getting-started--local-installation)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Start the Application](#4-start-the-application)
- [End-to-End Workflow Guide](#-end-to-end-workflow-guide)
  - [How to Issue a Document](#1-issuing-a-document)
  - [How to Verify a Document](#2-verifying-a-document)
  - [How to View Document Details & Generate QR](#3-viewing-document-details--generating-qr-code)
  - [How to Revoke a Document](#4-revoking-a-document)
- [Backend API Integration](#-backend-api-integration)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Comprehensive Web3 & Blockchain Troubleshooting](#-comprehensive-web3--blockchain-troubleshooting)

---

## ✨ Features

- **🦊 Seamless MetaMask Integration**: Automatic wallet detection, account connection, and automatic network switching to the Ethereum Sepolia Testnet (`chainId: 11155111`).
- **🔐 Role-Based Access Control**: Verifies issuer authority on-chain via `isAuthorizedIssuer`. Unauthenticated or unauthorized addresses cannot alter blockchain state.
- **📄 Client-Side Cryptographic Hashing**: Computes SHA-256 document digests locally in the browser using the Web Crypto API (`crypto.subtle.digest`) before sending to blockchain — the actual document never leaves the browser unhashed.
- **🪪 Wide Document Type Support**: Handles birth certificates, death certificates, caste/domicile certificates, Aadhaar cards, PAN cards, education degrees, land deeds, and more.
- **🔗 Dual-Layer Architecture**:
  - **On-chain (Ethereum Sepolia)**: Permanent document hash, issuer address, issuance timestamp, recipient details, and revocation status.
  - **Off-chain (Backend API)**: Instant synchronization with your team's backend database for fast indexing and query retrieval.
- **🔍 Instant Document Verification**: Validate any document by its Document ID and hash against the smart contract to detect authenticity, mismatch, or revocation.
- **📱 Real-time QR Code Generation**: Generates verification QR codes linking Document ID and smart contract address.
- **🚫 Permanent Document Revocation**: Authorized authorities can permanently flag compromised or invalid documents on-chain.
- **👥 Authority Management**: Add new Ethereum wallet addresses as authorized issuers directly from the dashboard.

---

## 🏛️ Architecture & Workflow

```
[ User / Authority ]
        │
        ▼
[ Authority Dashboard (React) ]
   │                     │
   │ 1. Local SHA-256    │ 2. Issue Document Transaction
   │    via Web Crypto   │    (Sepolia Testnet)
   ▼                     ▼
[ Browser Hash ]  [ Smart Contract ] (0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18)
                         │
                         │ 3. On Block Confirmation (~12-15s)
                         ▼
             [ Backend API / Database ]
             (POST /documents - Aadhaar, Doc ID, Type, Hash)
```

---

## 💡 Blockchain 101: Understanding the System

If you or your teammate are new to Web3 and Ethereum, here are the essential concepts to understand:

### Why Blockchain for Document Verification?
Traditional document verification relies on centralized databases that can be hacked, modified, or forged. By calculating a **cryptographic SHA-256 hash** of a document file and recording it on the Ethereum blockchain:
1. **Immutability**: Once written to the blockchain, no one (not even the system administrator) can change or forge the issuance date or hash.
2. **Confidentiality**: The actual document file is never stored publicly. Only its mathematical fingerprint (hash) is on-chain.
3. **Tamper Detection**: If even a single byte or pixel in a PDF/image changes, its SHA-256 hash completely changes, instantly failing verification.

### What is the Sepolia Testnet?
- **Sepolia** is Ethereum's official Proof-of-Stake test network.
- It operates identically to the Ethereum Mainnet, but its currency (**SepoliaETH**) is **completely free** from faucets.
- All transactions, gas calculations, and smart contract executions mimic real-world production Ethereum without risking real money.

### Read Operations vs Write Operations
Understanding this prevents confusion with MetaMask pop-ups:

| Operation Type | Examples in App | Needs Gas? | MetaMask Pop-up? | Speed |
|---|---|---|---|---|
| **Read (View)** | *Verify Document*, *View Document*, *Check Authorization* | **No (100% Free)** | **No** | Instant (< 1s) |
| **Write (State Change)** | *Issue Document*, *Revoke Document*, *Authorize Issuer* | **Yes (Test ETH)** | **Yes (requires approval)** | ~12–15s (block time) |

---

## ⛓️ Smart Contract Reference

### Contract Information
| Parameter | Value |
|---|---|
| **Network** | Ethereum Sepolia Testnet |
| **Chain ID (Decimal)** | `11155111` |
| **Chain ID (Hex)** | `0xaa36a7` |
| **Contract Address** | [`0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18`](https://sepolia.etherscan.io/address/0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18) |
| **Block Explorer** | [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18) |

### Functions & Gas Costs

```solidity
// WRITE: Issues document on-chain (requires authorized issuer + gas)
function issueDocument(
    string _documentId,
    string _documentHash,
    string _documentType,
    string _recipientId,
    string _recipientName,
    string _ipfsHash
) public

// READ: Verifies document validity (free, no gas, no popup)
function verifyDocument(
    string _documentId,
    string _documentHash
) public view returns (
    bool isValid,
    bool exists,
    bool revoked,
    address issuer,
    uint256 timestamp,
    string documentType,
    string recipientName
)

// READ: Retrieves full document metadata (free, no gas, no popup)
function getDocument(string _documentId) public view returns (
    string documentHash,
    address issuer,
    uint256 timestamp,
    string documentType,
    string recipientId,
    string recipientName,
    bool isRevoked,
    string ipfsHash
)

// WRITE: Marks document as revoked (requires authorized issuer + gas)
function revokeDocument(string _documentId) public

// WRITE: Grants an address issuer privileges (requires gas)
function authorizeIssuer(address _issuer) public

// READ: Checks if an address is authorized (free, no gas, no popup)
function isAuthorizedIssuer(address _address) public view returns (bool)
```

---

## 🦊 MetaMask & Web3 Setup Guide

Follow this guide step-by-step to prepare your browser for interacting with the blockchain.

### Step 1: Install & Set Up MetaMask
1. Install the official **[MetaMask Extension](https://metamask.io/download/)** on Chrome, Brave, Edge, or Firefox.
2. Click **Create a new wallet** (or import an existing one).
3. Set a strong password and write down your **Secret Recovery Phrase** in a safe place.
4. Pin the MetaMask icon to your browser toolbar for easy access.

---

### Step 2: Enable & Connect to Sepolia Testnet

#### Method A: Automatic (Recommended)
1. Open the dashboard at `http://localhost:3000`.
2. Click the **Connect MetaMask** button in the top right.
3. If your wallet is on Ethereum Mainnet or another network, the dashboard will **automatically trigger a prompt** in MetaMask:
   - Click **Switch network** to switch to Sepolia.
   - If Sepolia isn't added yet, MetaMask will display a dialog saying *"Allow this site to add a network?"* &rarr; Click **Approve**, then **Switch Network**.

#### Method B: Manual Network Configuration (Fallback)
If your MetaMask doesn't show Sepolia:
1. Open the MetaMask extension.
2. Click the network selector dropdown in the top-left corner.
3. Toggle on **"Show test networks"**.
4. Select **Sepolia**.

If you need to enter the RPC parameters manually:
| Field | Value |
|---|---|
| **Network Name** | `Sepolia test network` |
| **New RPC URL** | `https://rpc.sepolia.org` or `https://ethereum-sepolia-rpc.publicnode.com` |
| **Chain ID** | `11155111` |
| **Currency Symbol** | `ETH` |
| **Block Explorer URL** | `https://sepolia.etherscan.io` |

---

### Step 3: Get Free Sepolia Test ETH (Faucets)

Issuing documents and authorizing issuers are blockchain write transactions that consume a fraction of a cent in **gas** (paid in SepoliaETH).

Grab free SepoliaETH from any of these faucets:

| Faucet | Requirements | Best For | Link |
|---|---|---|---|
| **Google Cloud Web3 Faucet** | Google Account | **Fastest & Easiest** (0.05 SepoliaETH/day, zero wallet history required) | [Open Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) |
| **Sepolia PoW Faucet** | None (runs in browser) | No accounts or signups needed. Mines test ETH using CPU for a few minutes. | [Open Faucet](https://sepolia-faucet.pk910.de/) |
| **Alchemy Sepolia Faucet** | Free Alchemy account | 0.5 SepoliaETH/day | [Open Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) |
| **Infura Sepolia Faucet** | Free Infura account | 0.5 SepoliaETH/day | [Open Faucet](https://www.infura.io/faucet/sepolia) |
| **QuickNode Faucet** | Free account or Twitter | Quick small amount | [Open Faucet](https://faucet.quicknode.com/ethereum/sepolia) |

> 💡 **How to copy your wallet address**: Open MetaMask and click on the account name at the top (e.g., `Account 1 - 0x123...`) to copy your full address to your clipboard. Paste it into the faucet.

---

### Step 4: Authorize Your Wallet as an Issuer (Crucial First Step!)

When you connect your wallet for the first time, you will see a yellow warning banner:
> ⚠️ *"Your address is not authorized. Please authorize yourself first in the 'Authorize Issuer' tab."*

Before you can issue or revoke documents, your Ethereum address must be recorded as an authorized issuer in the smart contract:

1. Copy your connected wallet address from the header (or from MetaMask).
2. Click on the **Authorize Issuer** tab in the dashboard navigation.
3. Paste your Ethereum address (`0x...`) into the input box.
4. Click **Authorize Issuer**.
5. MetaMask will pop up showing the contract call `authorizeIssuer`. Click **Confirm**.
6. Wait ~12–15 seconds for the block to be mined on Sepolia.
7. A green success message will appear: *"Issuer authorized successfully!"*
8. Look at the top right header: a green badge **Authorized Issuer** will now appear next to your address!

🎉 **You are now fully configured to issue and manage documents on the blockchain!**

---

## 🚀 Getting Started / Local Installation

### 1. Clone Repository
```bash
git clone https://github.com/janhavi-gattani/documents.git
cd documents
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example template to create your `.env` file:

**macOS / Linux / Git Bash:**
```bash
cp .env.example .env
```

**Windows Command Prompt:**
```cmd
copy .env.example .env
```

Open `.env` and verify your backend API URL:
```env
# Backend API Base URL
# Option A: Local backend server
REACT_APP_API_URL=http://localhost:8000/api

# Option B: Public ngrok tunnel (if collaborating remotely)
# REACT_APP_API_URL=https://your-subdomain.ngrok-free.dev
```

> 💡 If `.env` is omitted, the application defaults to `http://localhost:8000/api`.

### 4. Start the Application
```bash
npm start
```
The app will launch in your browser at `http://localhost:3000`.

---

## 📖 End-to-End Workflow Guide

### 1. Issuing a Document
1. Navigate to the **Issue Document** tab.
2. Select the **Document Type** (e.g., *Birth Certificate*, *Aadhaar Card*, *Education Certificate*).
3. Fill in the **Recipient ID (Aadhaar)** and **Recipient Name**.
4. Choose the document file (`.pdf`, `.jpg`, `.png`).
5. Click **Issue Document**.
   - **What happens behind the scenes**:
     1. The browser computes the document's SHA-256 hash locally.
     2. A unique Document ID is generated (`DOC-<timestamp>-<rand>`).
     3. MetaMask prompts you to approve the `issueDocument` transaction.
     4. Once confirmed on Sepolia, the dashboard sends the record to the backend API (`POST /documents`).
     5. The new Document ID is displayed in a success banner. **Save this ID for verification!**

### 2. Verifying a Document
1. Navigate to the **Verify Document** tab.
2. Enter the **Document ID** (e.g., `DOC-1718000000000-123`).
3. Enter the document's **SHA-256 Hash**.
4. Click **Verify Document**.
5. The result card displays:
   - ✅ **Valid Document**: Matches on-chain hash and status is Active.
   - ❌ **Invalid Document**: Hash mismatch or document does not exist.
   - ❌ **Revoked Document**: Document exists on-chain but has been revoked by an authority.

> 💡 *Tip: This is a read operation (`view`). It costs **zero gas** and does **not** open a MetaMask prompt.*

### 3. Viewing Document Details & Generating QR Code
1. Navigate to the **View Document** tab.
2. Enter the **Document ID**.
3. Click **View Document**.
4. Displays on-chain metadata: Recipient Name, Recipient ID, Issuance Date, Status, and Hash.
5. Click **Generate QR** to generate and open a scannable QR code containing `{ documentId, contractAddress }` for instant mobile verification.

### 4. Revoking a Document
1. Navigate to the **Revoke Document** tab.
2. Enter the **Document ID** you wish to invalidate.
3. Click **Revoke Document**.
4. Confirm the transaction in MetaMask.
5. Once mined, the document is permanently marked as revoked on the blockchain. Any future verification checks will flag it as revoked.

---

## 🔌 Backend API Integration

After a document is successfully confirmed on the Ethereum blockchain, the dashboard syncs record metadata with your backend:

- **Route**: `POST ${REACT_APP_API_URL}/documents`
- **Headers**:
  - `Content-Type: application/json`
  - `ngrok-skip-browser-warning: true` *(prevents ngrok warning pages from breaking fetch requests)*
- **Payload**:
  ```json
  {
    "aadhar_card_id": "AADHAR-1234-5678",
    "doc_id": "DOC-1718000000000-123",
    "doc_type": "birth_certificate",
    "doc_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```

> 🛡️ **Fault Tolerance**: If the backend server is offline, the document is **still permanently secured on the blockchain**. The UI will alert you with a warning that blockchain issuance succeeded but database sync failed, preserving data integrity.

---

## 📁 Project Structure

```text
documents/
├── .env.example         # Template for environment configuration
├── .gitignore           # Git ignore rules (protects .env, node_modules, build)
├── package.json         # NPM dependencies and project scripts
├── package-lock.json    # Exact dependency lockfile
├── README.md            # Comprehensive project & blockchain documentation
├── public/
│   ├── favicon.ico      # Dashboard favicon
│   ├── index.html       # HTML root template
│   ├── manifest.json    # Web app manifest
│   └── robots.txt
└── src/
    ├── App.css          # Supplementary styles
    ├── App.js           # Core Authority Dashboard application logic & Web3 handlers
    ├── App.test.js      # Unit tests
    ├── index.css        # Comprehensive UI theme and component styles
    ├── index.js         # React DOM mounting entry point
    ├── logo.svg
    ├── reportWebVitals.js
    └── setupTests.js
```

---

## 📜 Available Scripts

| Command | Action |
|---|---|
| `npm start` | Runs the development server at `http://localhost:3000` with hot reloading. |
| `npm test` | Launches the test runner in interactive watch mode. |
| `npm run build` | Bundles and optimizes the app for production in the `build/` folder. |
| `npm run eject` | Ejects Create React App configuration (one-way operation). |

---

## ❓ Comprehensive Web3 & Blockchain Troubleshooting

<details>
<summary><b>1. "MetaMask is not installed!" error</b></summary>

- Make sure you have installed the [MetaMask browser extension](https://metamask.io/download/).
- If you just installed it, **close and reopen your browser tab** (or refresh `http://localhost:3000`) so the `window.ethereum` object is injected into the page.
- Make sure MetaMask is unlocked (enter your password).
</details>

<details>
<summary><b>2. MetaMask pop-up doesn't show when clicking "Issue Document" or "Authorize"</b></summary>

- Check the top right of your browser: MetaMask might have a pending notification badge with a previous unconfirmed transaction. Open MetaMask directly and reject or confirm the pending request.
- Ensure your browser hasn't blocked pop-ups for `localhost:3000`.
</details>

<details>
<summary><b>3. Transaction failed: "insufficient funds for gas * price + value"</b></summary>

- Blockchain write operations require SepoliaETH to pay for gas.
- Your wallet currently has 0 SepoliaETH.
- Visit any of the faucets in the [Get Free Sepolia Test ETH](#step-3-get-free-sepolia-test-eth-faucets) section (Google Cloud Faucet is recommended) to get free test ETH, then try again.
</details>

<details>
<summary><b>4. "Your address is not authorized" warning</b></summary>

- Only authorized issuer wallets can issue or revoke documents.
- Head to the **Authorize Issuer** tab.
- Paste your wallet address, click **Authorize Issuer**, and approve the transaction in MetaMask.
- Once confirmed on-chain (~15s), the green **Authorized Issuer** badge will appear in the header.
</details>

<details>
<summary><b>5. Transaction stuck on "Pending" in MetaMask</b></summary>

- Ethereum testnet congestion can occasionally delay block mining.
- In MetaMask, you can click on the pending transaction and select **Speed Up** (adds a higher gas fee).
- If a nonce issue occurs: In MetaMask, go to **Settings &rarr; Advanced &rarr; Clear activity tab data** (this resets pending transactions without affecting your balance or keys).
</details>

<details>
<summary><b>6. "Chain switch rejected" or "Sepolia network missing"</b></summary>

- Open MetaMask, click the network dropdown at the top left, toggle on **"Show test networks"**, and manually select **Sepolia**.
- Alternatively, check [Method B: Manual Network Configuration](#method-b-manual-network-configuration-fallback) above to verify the RPC endpoint.
</details>

<details>
<summary><b>7. "Document issued on blockchain but failed to store in database"</b></summary>

- This means the smart contract transaction succeeded (your document is safe on-chain!), but the HTTP `POST` request to `REACT_APP_API_URL` failed.
- Check that your backend server is running (e.g. at `http://localhost:8000`).
- If you are using ngrok, verify that your ngrok tunnel is still active and has not expired.
</details>

<details>
<summary><b>8. How to verify a transaction on Etherscan?</b></summary>

- Whenever you issue or revoke a document, you can check the transaction status on the blockchain explorer:
- Visit **[https://sepolia.etherscan.io/address/0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18](https://sepolia.etherscan.io/address/0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18)**.
- Under the **Transactions** tab, you will see your latest transaction with its status, timestamp, and gas used!
</details>

---

## 📄 License
This project is licensed under the MIT License - feel free to customize and extend for your institution.
