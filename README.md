# 🛡️ Authority Dashboard - Blockchain Document Verification System

A decentralized, tamper-proof document management and verification dashboard built with **React**, **Ethers.js (v6)**, and **Ethereum Smart Contracts (Sepolia Testnet)**.

This dashboard allows government/institutional authorities to issue, verify, view, and permanently revoke cryptographic document records on the Ethereum blockchain, while seamlessly syncing document metadata with an off-chain backend database.

---

## 📋 Table of Contents
- [Features](#-features)
- [Architecture & Workflow](#-architecture--workflow)
- [Smart Contract Details](#-smart-contract-details)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started / Quick Setup](#-getting-started--quick-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Configure Environment Variables](#3-configure-environment-variables)
  - [4. Start the Application](#4-start-the-application)
- [Web3 & MetaMask Setup](#-web3--metamask-setup)
  - [Connecting to Sepolia Testnet](#connecting-to-sepolia-testnet)
  - [Getting Free Sepolia ETH (Faucets)](#getting-free-sepolia-eth-faucets)
  - [First-Time Issuer Authorization](#first-time-issuer-authorization)
- [Backend API Integration](#-backend-api-integration)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## ✨ Features

- **🦊 Seamless MetaMask Integration**: Automatic wallet detection, account connection, and instant network validation with prompt to switch to the Ethereum Sepolia Testnet (`chainId: 11155111`).
- **🔐 Role-Based Access Control**: Verifies issuer authority on-chain (`isAuthorizedIssuer`). Unauthenticated or unauthorized addresses are restricted from issuing or revoking records.
- **📄 Client-Side Cryptographic Hashing**: Computes SHA-256 document digests locally in the browser via Web Crypto API before initiating blockchain transactions, preserving confidentiality.
- **🪪 Wide Document Type Support**: Handles birth certificates, death certificates, caste/domicile certificates, Aadhaar cards, PAN cards, education degrees, land deeds, and more.
- **🔗 Dual-Layer Storage**:
  - **On-chain (Ethereum Sepolia)**: Permanent document hash, issuer address, issuance timestamp, recipient details, and revocation status.
  - **Off-chain (Backend API)**: Instant synchronization with your team's backend database for fast indexing and query retrieval.
- **🔍 Instant Document Verification**: Validate any document by its Document ID and hash against the smart contract to detect authenticity, mismatch, or revocation.
- **📱 QR Code Generation**: Generates real-time verification QR codes linking Document ID and smart contract address.
- **🚫 Permanent Document Revocation**: Authorized issuers can permanently flag compromised or invalid documents on-chain.
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
                         │ 3. On Confirmation
                         ▼
             [ Backend API / Database ]
             (POST /documents - Aadhaar, Doc ID, Type, Hash)
```

---

## ⛓️ Smart Contract Details

| Parameter | Value |
|---|---|
| **Network** | Ethereum Sepolia Testnet |
| **Chain ID** | `11155111` (`0xaa36a7`) |
| **Contract Address** | [`0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18`](https://sepolia.etherscan.io/address/0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18) |
| **Explorer** | [Sepolia Etherscan](https://sepolia.etherscan.io/) |

### Contract Methods Used:
- `issueDocument(string _documentId, string _documentHash, string _documentType, string _recipientId, string _recipientName, string _ipfsHash)`
- `verifyDocument(string _documentId, string _documentHash)` &rarr; returns `(bool isValid, bool exists, bool revoked, address issuer, uint256 timestamp, string documentType, string recipientName)`
- `getDocument(string _documentId)` &rarr; returns document details and revocation state
- `revokeDocument(string _documentId)`
- `authorizeIssuer(address _issuer)`
- `isAuthorizedIssuer(address _address)` &rarr; returns `bool`

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/) (bootstrapped with Create React App)
- **Web3 Library**: [Ethers.js v6](https://docs.ethers.org/v6/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: Responsive Custom CSS (`index.css`)
- **Hashing**: Browser Web Crypto API (`crypto.subtle.digest`)
- **QR Engine**: [QR Server API](https://goqr.me/api/)

---

## 📦 Prerequisites

Ensure you have the following installed before setting up the project:

1. **Node.js**: v18.x or v20.x recommended ([Download Node.js](https://nodejs.org/))
2. **Package Manager**: `npm` (comes bundled with Node.js)
3. **MetaMask Extension**: Installed in your web browser (Chrome, Brave, Edge, or Firefox) &rarr; [Get MetaMask](https://metamask.io/)
4. **Git**: Installed on your system &rarr; [Download Git](https://git-scm.com/)

---

## 🚀 Getting Started / Quick Setup

Follow these steps to set up and run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/janhavi-gattani/documents.git
cd documents
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file:

**macOS / Linux / Git Bash:**
```bash
cp .env.example .env
```

**Windows Command Prompt:**
```cmd
copy .env.example .env
```

Open `.env` in your editor and configure your backend API URL:
```env
# Backend API Base URL
# Option A: Local backend server
REACT_APP_API_URL=http://localhost:8000/api

# Option B: Active ngrok tunnel or production URL (if running remotely)
# REACT_APP_API_URL=https://your-domain.ngrok-free.dev
```

> 💡 **Note**: If `REACT_APP_API_URL` is omitted, the app defaults to `http://localhost:8000/api`.

### 4. Start the Application
```bash
npm start
```
The app will automatically launch at [http://localhost:3000](http://localhost:3000).

---

## 🦊 Web3 & MetaMask Setup

### Connecting to Sepolia Testnet
When you click **Connect MetaMask** in the dashboard header:
1. MetaMask will prompt you to connect your account.
2. If your wallet is on Ethereum Mainnet or another network, the dashboard will **automatically request a switch** to the Sepolia Testnet (`0xaa36a7`).
3. If Sepolia is not configured in your MetaMask, the dashboard will prompt to add it automatically.

### Getting Free Sepolia ETH (Faucets)
Issuing and revoking documents are blockchain transactions that require a small amount of test ETH for gas. You can acquire free Sepolia ETH from:
- [Google Cloud Web3 Sepolia Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) (Requires Google Account)
- [Alchemy Sepolia Faucet](https://www.alchemy.com/faucets/ethereum-sepolia) (Requires free Alchemy account)
- [Sepolia PoW Faucet](https://sepolia-faucet.pk910.de/) (Mining faucet, no signup required)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### First-Time Issuer Authorization
To issue or revoke documents, your connected Ethereum address must be authorized:
1. Connect your MetaMask wallet.
2. If you see the warning *"Your address is not authorized"*, navigate to the **Authorize Issuer** tab.
3. Paste your Ethereum wallet address (or have an existing authority authorize you) and click **Authorize Issuer**.
4. Confirm the transaction in MetaMask.
5. Once confirmed, you will see the **Authorized Issuer** badge next to your wallet in the dashboard header!

---

## 🔌 Backend API Integration

When a document is issued on the blockchain, the dashboard automatically syncs document metadata to the configured backend API:

- **Endpoint**: `POST ${REACT_APP_API_URL}/documents`
- **Request Headers**:
  - `Content-Type: application/json`
  - `ngrok-skip-browser-warning: true` *(allows seamless tunneling via free ngrok accounts)*
- **Request Body (JSON)**:
  ```json
  {
    "aadhar_card_id": "AADHAR-1234-5678",
    "doc_id": "DOC-1718000000000-123",
    "doc_type": "birth_certificate",
    "doc_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```

> ⚠️ **Resilience Note**: If the backend API is unreachable or returns an error, the document is **still permanently secured on the blockchain**. The dashboard will display a warning notifying you of the database sync status without aborting the blockchain transaction.

---

## 📁 Project Structure

```text
authority-dashboard/
├── .env.example         # Template for environment configuration
├── .gitignore           # Git ignore rules (protects .env, node_modules, build)
├── package.json         # NPM dependencies and project scripts
├── package-lock.json    # Exact dependency lockfile
├── README.md            # Project documentation and setup guide
├── public/
│   ├── favicon.ico      # Dashboard favicon
│   ├── index.html       # HTML root template
│   ├── manifest.json    # Web app manifest
│   └── robots.txt
└── src/
    ├── App.css          # Optional supplementary styles
    ├── App.js           # Core Authority Dashboard application logic & Web3 handlers
    ├── App.test.js      # Unit test specifications
    ├── index.css        # Comprehensive UI styles & themes
    ├── index.js         # React root mounting entry point
    ├── logo.svg
    ├── reportWebVitals.js
    └── setupTests.js
```

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Action |
|---|---|
| `npm start` | Runs the app in development mode at `http://localhost:3000` with hot reloading. |
| `npm test` | Launches the test runner in interactive watch mode. |
| `npm run build` | Bundles and optimizes the app for production in the `build/` folder. |
| `npm run eject` | Copies build dependencies and configurations into the project (irreversible). |

---

## ❓ Troubleshooting & FAQs

<details>
<summary><b>1. "MetaMask is not installed!" error</b></summary>
Ensure the MetaMask browser extension is installed and enabled in your browser. Refresh the page after installing MetaMask.
</details>

<details>
<summary><b>2. "Please switch to Sepolia testnet manually"</b></summary>
Open your MetaMask extension, click the network dropdown at the top-left, toggle "Show test networks", and select **Sepolia**.
</details>

<details>
<summary><b>3. Transaction failed: "insufficient funds for gas * price + value"</b></summary>
Your wallet needs Sepolia test ETH to execute transactions. Use one of the free faucets listed in the [Getting Free Sepolia ETH](#getting-free-sepolia-eth-faucets) section.
</details>

<details>
<summary><b>4. "Your address is not authorized" warning</b></summary>
Only authorized issuers can issue or revoke documents. Go to the **Authorize Issuer** tab, enter your address, and sign the transaction to authorize your account.
</details>

<details>
<summary><b>5. Document issued on blockchain but failed to store in database</b></summary>
Verify that your backend API server is running and accessible at the URL configured in `.env` (`REACT_APP_API_URL`). If using ngrok, ensure the ngrok tunnel has not expired.
</details>

<details>
<summary><b>6. Environment variable changes not reflecting</b></summary>
Create React App only reads `.env` variables at startup. When modifying `.env`, stop the dev server (`Ctrl + C`) and restart it with `npm start`.
</details>

---

## 📄 License
This project is licensed under the MIT License - feel free to customize and extend for your institution.
