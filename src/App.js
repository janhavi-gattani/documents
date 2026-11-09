// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { AlertCircle, CheckCircle, Upload, FileText, Users, Shield, QrCode, XCircle } from 'lucide-react';
// import './App.css';

// const CONTRACT_ADDRESS = "0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18";
// const CONTRACT_ABI = [
//   "function issueDocument(string _documentId, string _documentHash, string _documentType, string _recipientId, string _recipientName, string _ipfsHash) public",
//   "function verifyDocument(string _documentId, string _documentHash) public view returns (bool isValid, bool exists, bool revoked, address issuer, uint256 timestamp, string documentType, string recipientName)",
//   "function getDocument(string _documentId) public view returns (string documentHash, address issuer, uint256 timestamp, string documentType, string recipientId, string recipientName, bool isRevoked, string ipfsHash)",
//   "function revokeDocument(string _documentId) public",
//   "function authorizeIssuer(address _issuer) public",
//   "function isAuthorizedIssuer(address _address) public view returns (bool)",
//   "event DocumentIssued(string indexed documentId, string documentHash, address indexed issuer, string recipientId, string documentType, uint256 timestamp)",
//   "event DocumentRevoked(string indexed documentId, address indexed revokedBy, uint256 timestamp)"
// ];

// export default function AuthorityDashboard() {
//   const [account, setAccount] = useState('');
//   const [contract, setContract] = useState(null);
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [activeTab, setActiveTab] = useState('issue');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   const [issueForm, setIssueForm] = useState({
//     documentId: '',
//     documentType: 'birth_certificate',
//     recipientId: '',
//     recipientName: '',
//     file: null
//   });

//   const [verifyForm, setVerifyForm] = useState({
//     documentId: '',
//     documentHash: ''
//   });
//   const [verifyResult, setVerifyResult] = useState(null);
//   const [revokeDocId, setRevokeDocId] = useState('');
//   const [viewDocId, setViewDocId] = useState('');
//   const [viewResult, setViewResult] = useState(null);
//   const [newIssuerAddress, setNewIssuerAddress] = useState('');

//   useEffect(() => {
//     checkWalletConnection();
//   }, []);

//   const checkWalletConnection = async () => {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//         if (accounts.length > 0) {
//           await connectWallet();
//         }
//       } catch (error) {
//         console.error('Error checking wallet:', error);
//       }
//     }
//   };

//   const connectWallet = async () => {
//   try {
//     if (typeof window.ethereum === 'undefined') {
//       setMessage({ type: 'error', text: 'MetaMask is not installed!' });
//       return;
//     }

//     const provider = new ethers.BrowserProvider(window.ethereum);
    
//     // Check current network
//     const network = await provider.getNetwork();
//     const sepoliaChainId = 11155111n;
    
//     // If not on Sepolia, request network switch
//     if (network.chainId !== sepoliaChainId) {
//       try {
//         // Try to switch to Sepolia
//         await window.ethereum.request({
//           method: 'wallet_switchEthereumChain',
//           params: [{ chainId: '0xaa36a7' }], // 11155111 in hex
//         });
//       } catch (switchError) {
//         // If Sepolia is not added, add it
//         if (switchError.code === 4902) {
//           try {
//             await window.ethereum.request({
//               method: 'wallet_addEthereumChain',
//               params: [
//                 {
//                   chainId: '0xaa36a7',
//                   chainName: 'Sepolia test network',
//                   nativeCurrency: {
//                     name: 'SepoliaETH',
//                     symbol: 'ETH',
//                     decimals: 18,
//                   },
//                   rpcUrls: ['https://sepolia.infura.io/v3/'],
//                   blockExplorerUrls: ['https://sepolia.etherscan.io'],
//                 },
//               ],
//             });
//           } catch (addError) {
//             setMessage({ type: 'error', text: 'Failed to add Sepolia network' });
//             return;
//           }
//         } else {
//           setMessage({ type: 'error', text: 'Please switch to Sepolia testnet manually' });
//           return;
//         }
//       }
//     }

//     // Now connect wallet
//     const accounts = await provider.send("eth_requestAccounts", []);
//     const signer = await provider.getSigner();
//     const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

//     setAccount(accounts[0]);
//     setContract(contract);

//     // Check authorization with error handling
//     try {
//       const authorized = await contract.isAuthorizedIssuer(accounts[0]);
//       setIsAuthorized(authorized);
      
//       if (!authorized) {
//         setMessage({ type: 'warning', text: 'Your address is not authorized. Please authorize yourself first in the "Authorize Issuer" tab.' });
//       }
//     } catch (error) {
//       console.error('Authorization check failed:', error);
//       setIsAuthorized(false);
//       setMessage({ type: 'warning', text: 'Could not check authorization. You may need to authorize yourself first.' });
//     }

//   } catch (error) {
//     setMessage({ type: 'error', text: `Connection failed: ${error.message}` });
//   }
// };

//   const generateDocumentHash = async (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const buffer = e.target.result;
//         const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
//         const hashArray = Array.from(new Uint8Array(hashBuffer));
//         const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//         resolve(hashHex);
//       };
//       reader.onerror = reject;
//       reader.readAsArrayBuffer(file);
//     });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setIssueForm({ ...issueForm, file });
//     }
//   };

//   const issueDocument = async () => {
//     if (!contract || !isAuthorized) {
//       setMessage({ type: 'error', text: 'Not authorized to issue documents' });
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const documentHash = await generateDocumentHash(issueForm.file);
//       const ipfsHash = `ipfs://demo_${documentHash.substring(0, 16)}`;

//       const tx = await contract.issueDocument(
//         issueForm.documentId,
//         documentHash,
//         issueForm.documentType,
//         issueForm.recipientId,
//         issueForm.recipientName,
//         ipfsHash
//       );

//       setMessage({ type: 'info', text: 'Transaction submitted. Waiting for confirmation...' });
//       await tx.wait();

//       setMessage({ 
//         type: 'success', 
//         text: `Document issued successfully! Document ID: ${issueForm.documentId}` 
//       });

//       setIssueForm({
//         documentId: '',
//         documentType: 'birth_certificate',
//         recipientId: '',
//         recipientName: '',
//         file: null
//       });
//     } catch (error) {
//       setMessage({ type: 'error', text: `Failed to issue document: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyDocument = async () => {
//     if (!contract) return;

//     setLoading(true);
//     setMessage({ type: '', text: '' });
//     setVerifyResult(null);

//     try {
//       const result = await contract.verifyDocument(
//         verifyForm.documentId,
//         verifyForm.documentHash
//       );

//       setVerifyResult({
//         isValid: result[0],
//         exists: result[1],
//         revoked: result[2],
//         issuer: result[3],
//         timestamp: Number(result[4]),
//         documentType: result[5],
//         recipientName: result[6]
//       });

//       if (!result[1]) {
//         setMessage({ type: 'error', text: 'Document does not exist' });
//       } else if (result[2]) {
//         setMessage({ type: 'error', text: 'Document has been revoked' });
//       } else if (!result[0]) {
//         setMessage({ type: 'error', text: 'Document hash does not match' });
//       } else {
//         setMessage({ type: 'success', text: 'Document is valid!' });
//       }
//     } catch (error) {
//       setMessage({ type: 'error', text: `Verification failed: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewDocument = async () => {
//     if (!contract) return;

//     setLoading(true);
//     setMessage({ type: '', text: '' });
//     setViewResult(null);

//     try {
//       const result = await contract.getDocument(viewDocId);
      
//       setViewResult({
//         documentHash: result[0],
//         issuer: result[1],
//         timestamp: Number(result[2]),
//         documentType: result[3],
//         recipientId: result[4],
//         recipientName: result[5],
//         isRevoked: result[6],
//         ipfsHash: result[7]
//       });
//     } catch (error) {
//       setMessage({ type: 'error', text: `Failed to fetch document: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const revokeDocument = async () => {
//     if (!contract || !isAuthorized) {
//       setMessage({ type: 'error', text: 'Not authorized' });
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const tx = await contract.revokeDocument(revokeDocId);
//       setMessage({ type: 'info', text: 'Transaction submitted...' });
//       await tx.wait();
//       setMessage({ type: 'success', text: 'Document revoked successfully!' });
//       setRevokeDocId('');
//     } catch (error) {
//       setMessage({ type: 'error', text: `Revocation failed: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const authorizeIssuer = async () => {
//     if (!contract) return;

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const tx = await contract.authorizeIssuer(newIssuerAddress);
//       setMessage({ type: 'info', text: 'Transaction submitted...' });
//       await tx.wait();
//       setMessage({ type: 'success', text: 'Issuer authorized successfully!' });
//       setNewIssuerAddress('');
//     } catch (error) {
//       setMessage({ type: 'error', text: `Authorization failed: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateQRCode = (documentId) => {
//     const qrData = JSON.stringify({ documentId, contractAddress: CONTRACT_ADDRESS });
//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
//     return qrUrl;
//   };

//   return (
//     <div className="app-container">
//       <div className="container">
//         <div className="header-card">
//           <div className="header-content">
//             <div>
//               <h1 className="header-title">
//                 <Shield size={32} style={{color: '#6366f1'}} />
//                 Document Verification Authority Dashboard
//               </h1>
//               <p className="header-subtitle">Blockchain-based Document Management System</p>
//             </div>
//             <div className="wallet-section">
//               {account ? (
//                 <div>
//                   <p className="wallet-label">Connected Account</p>
//                   <p className="wallet-address">
//                     {account.substring(0, 6)}...{account.substring(38)}
//                   </p>
//                   {isAuthorized && (
//                     <span className="badge-authorized">Authorized Issuer</span>
//                   )}
//                 </div>
//               ) : (
//                 <button onClick={connectWallet} className="btn-connect">
//                   Connect MetaMask
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {message.text && (
//           <div className={`message message-${message.type}`}>
//             {message.type === 'success' && <CheckCircle size={20} />}
//             {message.type === 'error' && <XCircle size={20} />}
//             {message.type === 'warning' && <AlertCircle size={20} />}
//             {message.text}
//           </div>
//         )}

//         <div className="tabs-container">
//           <div className="tabs">
//             {[
//               { id: 'issue', label: 'Issue Document', icon: Upload },
//               { id: 'verify', label: 'Verify Document', icon: CheckCircle },
//               { id: 'view', label: 'View Document', icon: FileText },
//               { id: 'revoke', label: 'Revoke Document', icon: XCircle },
//               { id: 'authorize', label: 'Authorize Issuer', icon: Users }
//             ].map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
//               >
//                 <tab.icon size={16} />
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           <div className="tab-content">
//             {activeTab === 'issue' && (
//               <div>
//                 <h2 className="section-title">Issue New Document</h2>
                
//                 <div className="form-grid">
//                   <div className="form-group">
//                     <label>Document ID</label>
//                     <input
//                       type="text"
//                       value={issueForm.documentId}
//                       onChange={(e) => setIssueForm({...issueForm, documentId: e.target.value})}
//                       placeholder="DOC-2024-001"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Document Type</label>
//                     <select
//                       value={issueForm.documentType}
//                       onChange={(e) => setIssueForm({...issueForm, documentType: e.target.value})}
//                     >
//                       <option value="birth_certificate">Birth Certificate</option>
//                       <option value="land_deed">Land Deed</option>
//                       <option value="identity_card">Identity Card</option>
//                       <option value="education_certificate">Education Certificate</option>
//                       <option value="marriage_certificate">Marriage Certificate</option>
//                     </select>
//                   </div>

//                   <div className="form-group">
//                     <label>Recipient ID</label>
//                     <input
//                       type="text"
//                       value={issueForm.recipientId}
//                       onChange={(e) => setIssueForm({...issueForm, recipientId: e.target.value})}
//                       placeholder="AADHAR-1234-5678"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Recipient Name</label>
//                     <input
//                       type="text"
//                       value={issueForm.recipientName}
//                       onChange={(e) => setIssueForm({...issueForm, recipientName: e.target.value})}
//                       placeholder="John Doe"
//                     />
//                   </div>
//                 </div>

//                 <div className="form-group">
//                   <label>Upload Document</label>
//                   <input
//                     type="file"
//                     onChange={handleFileChange}
//                     accept=".pdf,.jpg,.png"
//                   />
//                   <p className="file-hint">Accepted formats: PDF, JPG, PNG</p>
//                 </div>

//                 <button
//                   onClick={issueDocument}
//                   disabled={loading || !isAuthorized}
//                   className="btn-primary"
//                 >
//                   {loading ? 'Processing...' : 'Issue Document'}
//                 </button>
//               </div>
//             )}

//             {activeTab === 'verify' && (
//               <div>
//                 <h2 className="section-title">Verify Document Authenticity</h2>
                
//                 <div className="form-group">
//                   <label>Document ID</label>
//                   <input
//                     type="text"
//                     value={verifyForm.documentId}
//                     onChange={(e) => setVerifyForm({...verifyForm, documentId: e.target.value})}
//                     placeholder="DOC-2024-001"
//                   />
//                 </div>

//                 <div className="form-group">
//                   <label>Document Hash</label>
//                   <input
//                     type="text"
//                     value={verifyForm.documentHash}
//                     onChange={(e) => setVerifyForm({...verifyForm, documentHash: e.target.value})}
//                     placeholder="Enter SHA-256 hash of the document"
//                   />
//                   <p className="file-hint">Upload the document file to calculate its hash automatically</p>
//                 </div>

//                 <button onClick={verifyDocument} disabled={loading} className="btn-success">
//                   {loading ? 'Verifying...' : 'Verify Document'}
//                 </button>

//                 {verifyResult && (
//                   <div className={`result-card ${verifyResult.isValid ? 'result-valid' : 'result-invalid'}`}>
//                     <h3>{verifyResult.isValid ? '✓ Valid Document' : '✗ Invalid Document'}</h3>
//                     {verifyResult.exists && (
//                       <div className="result-details">
//                         <p><strong>Type:</strong> {verifyResult.documentType}</p>
//                         <p><strong>Recipient:</strong> {verifyResult.recipientName}</p>
//                         <p><strong>Issued:</strong> {new Date(verifyResult.timestamp * 1000).toLocaleString()}</p>
//                         <p><strong>Status:</strong> {verifyResult.revoked ? 'Revoked' : 'Active'}</p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'view' && (
//               <div>
//                 <h2 className="section-title">View Document Details</h2>
                
//                 <div className="form-group">
//                   <label>Document ID</label>
//                   <input
//                     type="text"
//                     value={viewDocId}
//                     onChange={(e) => setViewDocId(e.target.value)}
//                     placeholder="DOC-2024-001"
//                   />
//                 </div>

//                 <button onClick={viewDocument} disabled={loading} className="btn-info">
//                   {loading ? 'Loading...' : 'View Document'}
//                 </button>

//                 {viewResult && (
//                   <div className="document-card">
//                     <div className="document-header">
//                       <h3>{viewResult.documentType}</h3>
//                       <button
//                         onClick={() => window.open(generateQRCode(viewDocId), '_blank')}
//                         className="btn-qr"
//                       >
//                         <QrCode size={16} />
//                         Generate QR
//                       </button>
//                     </div>
//                     <div className="document-details">
//                       <div className="detail-row">
//                         <span className="detail-label">Recipient Name:</span>
//                         <span>{viewResult.recipientName}</span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">Recipient ID:</span>
//                         <span>{viewResult.recipientId}</span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">Issued:</span>
//                         <span>{new Date(viewResult.timestamp * 1000).toLocaleString()}</span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">Status:</span>
//                         <span className={viewResult.isRevoked ? 'status-revoked' : 'status-active'}>
//                           {viewResult.isRevoked ? '❌ Revoked' : '✅ Active'}
//                         </span>
//                       </div>
//                       <div className="detail-row">
//                         <span className="detail-label">Hash:</span>
//                         <span className="hash-value">{viewResult.documentHash}</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'revoke' && (
//               <div>
//                 <h2 className="section-title">Revoke Document</h2>
//                 <div className="warning-box">
//                   ⚠️ Warning: Revoking a document is permanent and cannot be undone.
//                 </div>
                
//                 <div className="form-group">
//                   <label>Document ID</label>
//                   <input
//                     type="text"
//                     value={revokeDocId}
//                     onChange={(e) => setRevokeDocId(e.target.value)}
//                     placeholder="DOC-2024-001"
//                   />
//                 </div>

//                 <button
//                   onClick={revokeDocument}
//                   disabled={loading || !isAuthorized}
//                   className="btn-danger"
//                 >
//                   {loading ? 'Processing...' : 'Revoke Document'}
//                 </button>
//               </div>
//             )}

//             {activeTab === 'authorize' && (
//               <div>
//                 <h2 className="section-title">Authorize New Issuer</h2>
//                 <p className="section-description">
//                   Add a new Ethereum address as an authorized document issuer.
//                 </p>
                
//                 <div className="form-group">
//                   <label>Ethereum Address</label>
//                   <input
//                     type="text"
//                     value={newIssuerAddress}
//                     onChange={(e) => setNewIssuerAddress(e.target.value)}
//                     placeholder="0x..."
//                   />
//                 </div>

//                 <button onClick={authorizeIssuer} disabled={loading} className="btn-primary">
//                   {loading ? 'Processing...' : 'Authorize Issuer'}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="footer">
//           <p>Contract Address: <span className="contract-address">{CONTRACT_ADDRESS}</span></p>
//           <p>Network: Ethereum Sepolia Testnet</p>
//         </div>
//       </div>
//     </div>
//   );
// }





















































































// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { AlertCircle, CheckCircle, Upload, FileText, Users, Shield, QrCode, XCircle } from 'lucide-react';

// const CONTRACT_ADDRESS = "0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18";
// const API_BASE_URL = "http://localhost:8000/api";

// const CONTRACT_ABI = [
//   "function issueDocument(string _documentId, string _documentHash, string _documentType, string _recipientId, string _recipientName, string _ipfsHash) public",
//   "function verifyDocument(string _documentId, string _documentHash) public view returns (bool isValid, bool exists, bool revoked, address issuer, uint256 timestamp, string documentType, string recipientName)",
//   "function getDocument(string _documentId) public view returns (string documentHash, address issuer, uint256 timestamp, string documentType, string recipientId, string recipientName, bool isRevoked, string ipfsHash)",
//   "function revokeDocument(string _documentId) public",
//   "function authorizeIssuer(address _issuer) public",
//   "function isAuthorizedIssuer(address _address) public view returns (bool)",
//   "event DocumentIssued(string indexed documentId, string documentHash, address indexed issuer, string recipientId, string documentType, uint256 timestamp)",
//   "event DocumentRevoked(string indexed documentId, address indexed revokedBy, uint256 timestamp)"
// ];

// export default function AuthorityDashboard() {
//   const [account, setAccount] = useState('');
//   const [contract, setContract] = useState(null);
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [activeTab, setActiveTab] = useState('issue');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   const [issueForm, setIssueForm] = useState({
//     documentId: '',
//     documentType: 'birth_certificate',
//     recipientId: '',
//     recipientName: '',
//     file: null
//   });

//   const [verifyForm, setVerifyForm] = useState({
//     documentId: '',
//     documentHash: ''
//   });
//   const [verifyResult, setVerifyResult] = useState(null);
//   const [revokeDocId, setRevokeDocId] = useState('');
//   const [viewDocId, setViewDocId] = useState('');
//   const [viewResult, setViewResult] = useState(null);
//   const [newIssuerAddress, setNewIssuerAddress] = useState('');

//   useEffect(() => {
//     checkWalletConnection();
//   }, []);

//   const checkWalletConnection = async () => {
//     if (typeof window.ethereum !== 'undefined') {
//       try {
//         const accounts = await window.ethereum.request({ method: 'eth_accounts' });
//         if (accounts.length > 0) {
//           await connectWallet();
//         }
//       } catch (error) {
//         console.error('Error checking wallet:', error);
//       }
//     }
//   };

//   const connectWallet = async () => {
//     try {
//       if (typeof window.ethereum === 'undefined') {
//         setMessage({ type: 'error', text: 'MetaMask is not installed!' });
//         return;
//       }

//       const provider = new ethers.BrowserProvider(window.ethereum);
      
//       const network = await provider.getNetwork();
//       const sepoliaChainId = 11155111n;
      
//       if (network.chainId !== sepoliaChainId) {
//         try {
//           await window.ethereum.request({
//             method: 'wallet_switchEthereumChain',
//             params: [{ chainId: '0xaa36a7' }],
//           });
//         } catch (switchError) {
//           if (switchError.code === 4902) {
//             try {
//               await window.ethereum.request({
//                 method: 'wallet_addEthereumChain',
//                 params: [
//                   {
//                     chainId: '0xaa36a7',
//                     chainName: 'Sepolia test network',
//                     nativeCurrency: {
//                       name: 'SepoliaETH',
//                       symbol: 'ETH',
//                       decimals: 18,
//                     },
//                     rpcUrls: ['https://sepolia.infura.io/v3/'],
//                     blockExplorerUrls: ['https://sepolia.etherscan.io'],
//                   },
//                 ],
//               });
//             } catch (addError) {
//               setMessage({ type: 'error', text: 'Failed to add Sepolia network' });
//               return;
//             }
//           } else {
//             setMessage({ type: 'error', text: 'Please switch to Sepolia testnet manually' });
//             return;
//           }
//         }
//       }

//       const accounts = await provider.send("eth_requestAccounts", []);
//       const signer = await provider.getSigner();
//       const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

//       setAccount(accounts[0]);
//       setContract(contract);

//       try {
//         const authorized = await contract.isAuthorizedIssuer(accounts[0]);
//         setIsAuthorized(authorized);
        
//         if (!authorized) {
//           setMessage({ type: 'warning', text: 'Your address is not authorized. Please authorize yourself first in the "Authorize Issuer" tab.' });
//         }
//       } catch (error) {
//         console.error('Authorization check failed:', error);
//         setIsAuthorized(false);
//         setMessage({ type: 'warning', text: 'Could not check authorization. You may need to authorize yourself first.' });
//       }

//     } catch (error) {
//       setMessage({ type: 'error', text: `Connection failed: ${error.message}` });
//     }
//   };

//   const generateDocumentHash = async (file) => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = async (e) => {
//         const buffer = e.target.result;
//         const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
//         const hashArray = Array.from(new Uint8Array(hashBuffer));
//         const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//         resolve(hashHex);
//       };
//       reader.onerror = reject;
//       reader.readAsArrayBuffer(file);
//     });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setIssueForm({ ...issueForm, file });
//     }
//   };

//   // Store document in database
//   const storeDocumentInDatabase = async (aadharCardId, docId, docType, docHash) => {
//     try {
//       const response = await fetch(`${API_BASE_URL}/documents`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           aadhar_card_id: aadharCardId,
//           doc_id: docId,
//           doc_type: docType,
//           doc_hash: docHash
//         })
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to store in database');
//       }
      
//       return data;
//     } catch (error) {
//       console.error('Database storage error:', error);
//       throw error;
//     }
//   };

//   const issueDocument = async () => {
//     if (!contract || !isAuthorized) {
//       setMessage({ type: 'error', text: 'Not authorized to issue documents' });
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const documentHash = await generateDocumentHash(issueForm.file);
//       const ipfsHash = `ipfs://demo_${documentHash.substring(0, 16)}`;

//       // Issue document on blockchain
//       const tx = await contract.issueDocument(
//         issueForm.documentId,
//         documentHash,
//         issueForm.documentType,
//         issueForm.recipientId,
//         issueForm.recipientName,
//         ipfsHash
//       );

//       setMessage({ type: 'info', text: 'Blockchain transaction submitted. Waiting for confirmation...' });
//       await tx.wait();

//       // Store in database after successful blockchain transaction
//       try {
//         await storeDocumentInDatabase(
//           issueForm.recipientId,
//           issueForm.documentId,
//           issueForm.documentType,
//           documentHash
//         );
        
//         setMessage({ 
//           type: 'success', 
//           text: `Document issued successfully on blockchain and stored in database! Document ID: ${issueForm.documentId}` 
//         });
//       } catch (dbError) {
//         setMessage({ 
//           type: 'warning', 
//           text: `Document issued on blockchain but failed to store in database: ${dbError.message}. Document ID: ${issueForm.documentId}` 
//         });
//       }

//       setIssueForm({
//         documentId: '',
//         documentType: 'birth_certificate',
//         recipientId: '',
//         recipientName: '',
//         file: null
//       });
      
//       // Reset file input
//       const fileInput = document.querySelector('input[type="file"]');
//       if (fileInput) fileInput.value = '';
      
//     } catch (error) {
//       setMessage({ type: 'error', text: `Failed to issue document: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyDocument = async () => {
//     if (!contract) return;

//     setLoading(true);
//     setMessage({ type: '', text: '' });
//     setVerifyResult(null);

//     try {
//       const result = await contract.verifyDocument(
//         verifyForm.documentId,
//         verifyForm.documentHash
//       );

//       setVerifyResult({
//         isValid: result[0],
//         exists: result[1],
//         revoked: result[2],
//         issuer: result[3],
//         timestamp: Number(result[4]),
//         documentType: result[5],
//         recipientName: result[6]
//       });

//       if (!result[1]) {
//         setMessage({ type: 'error', text: 'Document does not exist' });
//       } else if (result[2]) {
//         setMessage({ type: 'error', text: 'Document has been revoked' });
//       } else if (!result[0]) {
//         setMessage({ type: 'error', text: 'Document hash does not match' });
//       } else {
//         setMessage({ type: 'success', text: 'Document is valid!' });
//       }
//     } catch (error) {
//       setMessage({ type: 'error', text: `Verification failed: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const viewDocument = async () => {
//     if (!contract) return;

//     setLoading(true);
//     setMessage({ type: '', text: '' });
//     setViewResult(null);

//     try {
//       const result = await contract.getDocument(viewDocId);
      
//       setViewResult({
//         documentHash: result[0],
//         issuer: result[1],
//         timestamp: Number(result[2]),
//         documentType: result[3],
//         recipientId: result[4],
//         recipientName: result[5],
//         isRevoked: result[6],
//         ipfsHash: result[7]
//       });
//     } catch (error) {
//       setMessage({ type: 'error', text: `Failed to fetch document: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const revokeDocument = async () => {
//     if (!contract || !isAuthorized) {
//       setMessage({ type: 'error', text: 'Not authorized' });
//       return;
//     }

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const tx = await contract.revokeDocument(revokeDocId);
//       setMessage({ type: 'info', text: 'Transaction submitted...' });
//       await tx.wait();
//       setMessage({ type: 'success', text: 'Document revoked successfully!' });
//       setRevokeDocId('');
//     } catch (error) {
//       setMessage({ type: 'error', text: `Revocation failed: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const authorizeIssuer = async () => {
//     if (!contract) return;

//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const tx = await contract.authorizeIssuer(newIssuerAddress);
//       setMessage({ type: 'info', text: 'Transaction submitted...' });
//       await tx.wait();
//       setMessage({ type: 'success', text: 'Issuer authorized successfully!' });
//       setNewIssuerAddress('');
//     } catch (error) {
//       setMessage({ type: 'error', text: `Authorization failed: ${error.message}` });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateQRCode = (documentId) => {
//     const qrData = JSON.stringify({ documentId, contractAddress: CONTRACT_ADDRESS });
//     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
//     return qrUrl;
//   };

//   return (
//     <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem' }}>
//       <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
//         <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
//             <div>
//               <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.75rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
//                 <Shield size={32} style={{color: '#6366f1'}} />
//                 Document Verification Authority Dashboard
//               </h1>
//               <p style={{ color: '#6b7280' }}>Blockchain-based Document Management System</p>
//             </div>
//             <div>
//               {account ? (
//                 <div style={{ textAlign: 'right' }}>
//                   <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>Connected Account</p>
//                   <p style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#1f2937', fontWeight: '600', marginBottom: '0.5rem' }}>
//                     {account.substring(0, 6)}...{account.substring(38)}
//                   </p>
//                   {isAuthorized && (
//                     <span style={{ display: 'inline-block', background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>
//                       Authorized Issuer
//                     </span>
//                   )}
//                 </div>
//               ) : (
//                 <button onClick={connectWallet} style={{ background: '#6366f1', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
//                   Connect MetaMask
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {message.text && (
//           <div style={{ 
//             background: message.type === 'success' ? '#d1fae5' : message.type === 'error' ? '#fee2e2' : message.type === 'warning' ? '#fef3c7' : '#dbeafe',
//             border: `1px solid ${message.type === 'success' ? '#10b981' : message.type === 'error' ? '#ef4444' : message.type === 'warning' ? '#f59e0b' : '#3b82f6'}`,
//             color: message.type === 'success' ? '#065f46' : message.type === 'error' ? '#991b1b' : message.type === 'warning' ? '#92400e' : '#1e40af',
//             padding: '1rem',
//             borderRadius: '8px',
//             marginBottom: '1.5rem',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '0.75rem'
//           }}>
//             {message.type === 'success' && <CheckCircle size={20} />}
//             {message.type === 'error' && <XCircle size={20} />}
//             {message.type === 'warning' && <AlertCircle size={20} />}
//             {message.text}
//           </div>
//         )}

//         <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
//           <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
//             {[
//               { id: 'issue', label: 'Issue Document', icon: Upload },
//               { id: 'verify', label: 'Verify Document', icon: CheckCircle },
//               { id: 'view', label: 'View Document', icon: FileText },
//               { id: 'revoke', label: 'Revoke Document', icon: XCircle },
//               { id: 'authorize', label: 'Authorize Issuer', icon: Users }
//             ].map(tab => (
//               <button
//                 key={tab.id}
//                 onClick={() => setActiveTab(tab.id)}
//                 style={{
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '0.5rem',
//                   padding: '1rem 1.5rem',
//                   border: 'none',
//                   background: activeTab === tab.id ? '#f3f4f6' : 'transparent',
//                   borderBottom: activeTab === tab.id ? '2px solid #6366f1' : '2px solid transparent',
//                   color: activeTab === tab.id ? '#6366f1' : '#6b7280',
//                   fontWeight: activeTab === tab.id ? '600' : '400',
//                   cursor: 'pointer',
//                   whiteSpace: 'nowrap',
//                   transition: 'all 0.2s'
//                 }}
//               >
//                 <tab.icon size={16} />
//                 {tab.label}
//               </button>
//             ))}
//           </div>

//           <div style={{ padding: '2rem' }}>
//             {activeTab === 'issue' && (
//               <div>
//                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Issue New Document</h2>
                
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Document ID</label>
//                     <input
//                       type="text"
//                       value={issueForm.documentId}
//                       onChange={(e) => setIssueForm({...issueForm, documentId: e.target.value})}
//                       placeholder="DOC-2024-001"
//                       style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                     />
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Document Type</label>
//                     <select
//                       value={issueForm.documentType}
//                       onChange={(e) => setIssueForm({...issueForm, documentType: e.target.value})}
//                       style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                     >
//                       {/* <option value="birth_certificate">Birth Certificate</option>
//                       <option value="land_deed">Land Deed</option>
//                       <option value="identity_card">Identity Card</option>
//                       <option value="education_certificate">Education Certificate</option>
//                       <option value="marriage_certificate">Marriage Certificate</option> */}

//                       <option value="birth_certificate">Birth Certificate</option>
//                       <option value="death_certificate">Death Certificate</option>
//                       <option value="caste_certificate">Caste Certificate</option>
//                       <option value="domicile_certificate">Domicile Certificate</option>
//                       <option value="income_certificate">Income Certificate</option>
//                       <option value="residence_certificate">Residence Certificate</option>
//                       <option value="land_deed">Land Deed</option>
//                       <option value="ration_card">Ration Card</option>
//                       <option value="identity_card">Identity Card</option>
//                       <option value="aadhar_card">Aadhaar Card</option>
//                       <option value="pan_card">PAN Card</option>
//                       <option value="voter_id">Voter ID</option>
//                       <option value="driving_license">Driving License</option>
//                       <option value="passport">Passport</option>
//                       <option value="education_certificate">Education Certificate</option>
//                       <option value="marriage_certificate">Marriage Certificate</option>
//                       <option value="disability_certificate">Disability Certificate</option>
//                       <option value="property_tax_receipt">Property Tax Receipt</option>
//                       <option value="vehicle_registration">Vehicle Registration Certificate</option>
//                       <option value="pension_certificate">Pension Certificate</option>
//                       <option value="employment_certificate">Employment Certificate</option>

//                     </select>
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Recipient ID (Aadhar)</label>
//                     <input
//                       type="text"
//                       value={issueForm.recipientId}
//                       onChange={(e) => setIssueForm({...issueForm, recipientId: e.target.value})}
//                       placeholder="AADHAR-1234-5678"
//                       style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                     />
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Recipient Name</label>
//                     <input
//                       type="text"
//                       value={issueForm.recipientName}
//                       onChange={(e) => setIssueForm({...issueForm, recipientName: e.target.value})}
//                       placeholder="John Doe"
//                       style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                     />
//                   </div>
//                 </div>

//                 <div style={{ marginBottom: '1.5rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Upload Document</label>
//                   <input
//                     type="file"
//                     onChange={handleFileChange}
//                     accept=".pdf,.jpg,.png"
//                     style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px' }}
//                   />
//                   <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Accepted formats: PDF, JPG, PNG</p>
//                 </div>

//                 <button
//                   onClick={issueDocument}
//                   disabled={loading || !isAuthorized}
//                   style={{
//                     background: loading || !isAuthorized ? '#9ca3af' : '#6366f1',
//                     color: 'white',
//                     padding: '0.875rem 2rem',
//                     borderRadius: '8px',
//                     border: 'none',
//                     fontWeight: '600',
//                     cursor: loading || !isAuthorized ? 'not-allowed' : 'pointer',
//                     fontSize: '1rem'
//                   }}
//                 >
//                   {loading ? 'Processing...' : 'Issue Document'}
//                 </button>
//               </div>
//             )}

//             {activeTab === 'verify' && (
//               <div>
//                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Verify Document Authenticity</h2>
                
//                 <div style={{ marginBottom: '1rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Document ID</label>
//                   <input
//                     type="text"
//                     value={verifyForm.documentId}
//                     onChange={(e) => setVerifyForm({...verifyForm, documentId: e.target.value})}
//                     placeholder="DOC-2024-001"
//                     style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                   />
//                 </div>

//                 <div style={{ marginBottom: '1.5rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Document Hash</label>
//                   <input
//                     type="text"
//                     value={verifyForm.documentHash}
//                     onChange={(e) => setVerifyForm({...verifyForm, documentHash: e.target.value})}
//                     placeholder="Enter SHA-256 hash of the document"
//                     style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                   />
//                   <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Upload the document file to calculate its hash automatically</p>
//                 </div>

//                 <button 
//                   onClick={verifyDocument} 
//                   disabled={loading}
//                   style={{
//                     background: loading ? '#9ca3af' : '#10b981',
//                     color: 'white',
//                     padding: '0.875rem 2rem',
//                     borderRadius: '8px',
//                     border: 'none',
//                     fontWeight: '600',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     fontSize: '1rem'
//                   }}
//                 >
//                   {loading ? 'Verifying...' : 'Verify Document'}
//                 </button>

//                 {verifyResult && (
//                   <div style={{ 
//                     marginTop: '1.5rem', 
//                     padding: '1.5rem', 
//                     borderRadius: '8px',
//                     background: verifyResult.isValid ? '#d1fae5' : '#fee2e2',
//                     border: `2px solid ${verifyResult.isValid ? '#10b981' : '#ef4444'}`
//                   }}>
//                     <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: verifyResult.isValid ? '#065f46' : '#991b1b' }}>
//                       {verifyResult.isValid ? '✓ Valid Document' : '✗ Invalid Document'}
//                     </h3>
//                     {verifyResult.exists && (
//                       <div style={{ fontSize: '0.875rem', color: '#1f2937' }}>
//                         <p style={{ marginBottom: '0.5rem' }}><strong>Type:</strong> {verifyResult.documentType}</p>
//                         <p style={{ marginBottom: '0.5rem' }}><strong>Recipient:</strong> {verifyResult.recipientName}</p>
//                         <p style={{ marginBottom: '0.5rem' }}><strong>Issued:</strong> {new Date(verifyResult.timestamp * 1000).toLocaleString()}</p>
//                         <p><strong>Status:</strong> {verifyResult.revoked ? 'Revoked' : 'Active'}</p>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'view' && (
//               <div>
//                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>View Document Details</h2>
                
//                 <div style={{ marginBottom: '1.5rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Document ID</label>
//                   <input
//                     type="text"
//                     value={viewDocId}
//                     onChange={(e) => setViewDocId(e.target.value)}
//                     placeholder="DOC-2024-001"
//                     style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                   />
//                 </div>

//                 <button 
//                   onClick={viewDocument} 
//                   disabled={loading}
//                   style={{
//                     background: loading ? '#9ca3af' : '#3b82f6',
//                     color: 'white',
//                     padding: '0.875rem 2rem',
//                     borderRadius: '8px',
//                     border: 'none',
//                     fontWeight: '600',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     fontSize: '1rem'
//                   }}
//                 >
//                   {loading ? 'Loading...' : 'View Document'}
//                 </button>

//                 {viewResult && (
//                   <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
//                       <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937' }}>{viewResult.documentType}</h3>
//                       <button
//                         onClick={() => window.open(generateQRCode(viewDocId), '_blank')}
//                         style={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           gap: '0.5rem',
//                           background: '#6366f1',
//                           color: 'white',
//                           padding: '0.5rem 1rem',
//                           borderRadius: '6px',
//                           border: 'none',
//                           cursor: 'pointer',
//                           fontSize: '0.875rem'
//                         }}
//                       >
//                         <QrCode size={16} />
//                         Generate QR
//                       </button>
//                     </div>
//                     <div style={{ fontSize: '0.875rem' }}>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
//                         <span style={{ fontWeight: '600', color: '#6b7280' }}>Recipient Name:</span>
//                         <span style={{ color: '#1f2937' }}>{viewResult.recipientName}</span>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
//                         <span style={{ fontWeight: '600', color: '#6b7280' }}>Recipient ID:</span>
//                         <span style={{ color: '#1f2937' }}>{viewResult.recipientId}</span>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
//                         <span style={{ fontWeight: '600', color: '#6b7280' }}>Issued:</span>
//                         <span style={{ color: '#1f2937' }}>{new Date(viewResult.timestamp * 1000).toLocaleString()}</span>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
//                         <span style={{ fontWeight: '600', color: '#6b7280' }}>Status:</span>
//                         <span style={{ color: viewResult.isRevoked ? '#ef4444' : '#10b981', fontWeight: '600' }}>
//                           {viewResult.isRevoked ? '❌ Revoked' : '✅ Active'}
//                         </span>
//                       </div>
//                       <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0' }}>
//                         <span style={{ fontWeight: '600', color: '#6b7280' }}>Hash:</span>
//                         <span style={{ color: '#1f2937', fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>{viewResult.documentHash}</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'revoke' && (
//               <div>
//                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#1f2937' }}>Revoke Document</h2>
//                 <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', color: '#92400e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
//                   ⚠️ Warning: Revoking a document is permanent and cannot be undone.
//                 </div>
                
//                 <div style={{ marginBottom: '1.5rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Document ID</label>
//                   <input
//                     type="text"
//                     value={revokeDocId}
//                     onChange={(e) => setRevokeDocId(e.target.value)}
//                     placeholder="DOC-2024-001"
//                     style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                   />
//                 </div>

//                 <button
//                   onClick={revokeDocument}
//                   disabled={loading || !isAuthorized}
//                   style={{
//                     background: loading || !isAuthorized ? '#9ca3af' : '#ef4444',
//                     color: 'white',
//                     padding: '0.875rem 2rem',
//                     borderRadius: '8px',
//                     border: 'none',
//                     fontWeight: '600',
//                     cursor: loading || !isAuthorized ? 'not-allowed' : 'pointer',
//                     fontSize: '1rem'
//                   }}
//                 >
//                   {loading ? 'Processing...' : 'Revoke Document'}
//                 </button>
//               </div>
//             )}

//             {activeTab === 'authorize' && (
//               <div>
//                 <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>Authorize New Issuer</h2>
//                 <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
//                   Add a new Ethereum address as an authorized document issuer.
//                 </p>
                
//                 <div style={{ marginBottom: '1.5rem' }}>
//                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>Ethereum Address</label>
//                   <input
//                     type="text"
//                     value={newIssuerAddress}
//                     onChange={(e) => setNewIssuerAddress(e.target.value)}
//                     placeholder="0x..."
//                     style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '1rem' }}
//                   />
//                 </div>

//                 <button 
//                   onClick={authorizeIssuer} 
//                   disabled={loading}
//                   style={{
//                     background: loading ? '#9ca3af' : '#6366f1',
//                     color: 'white',
//                     padding: '0.875rem 2rem',
//                     borderRadius: '8px',
//                     border: 'none',3
//                     fontWeight: '600',
//                     cursor: loading ? 'not-allowed' : 'pointer',
//                     fontSize: '1rem'
//                   }}
//                 >
//                   {loading ? 'Processing...' : 'Authorize Issuer'}
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255,255,255,0.9)', borderRadius: '12px', textAlign: 'center' }}>
//           <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
//             Contract Address: <span style={{ fontFamily: 'monospace', color: '#1f2937', fontWeight: '600' }}>{CONTRACT_ADDRESS}</span>
//           </p>
//           <p style={{ color: '#6b7280' }}>Network: Ethereum Sepolia Testnet</p>
//         </div>
//       </div>
//     </div>
//   );
// }










































































































import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { AlertCircle, CheckCircle, Upload, FileText, Users, Shield, QrCode, XCircle } from 'lucide-react';
import './index.css';

const CONTRACT_ADDRESS = "0x3fbCaCf68Ba0e10147820BB4cb2f063ADEDA4e18";
const API_BASE_URL = (process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim()) || "http://localhost:8000/api";

const CONTRACT_ABI = [
  "function issueDocument(string _documentId, string _documentHash, string _documentType, string _recipientId, string _recipientName, string _ipfsHash) public",
  "function verifyDocument(string _documentId, string _documentHash) public view returns (bool isValid, bool exists, bool revoked, address issuer, uint256 timestamp, string documentType, string recipientName)",
  "function getDocument(string _documentId) public view returns (string documentHash, address issuer, uint256 timestamp, string documentType, string recipientId, string recipientName, bool isRevoked, string ipfsHash)",
  "function revokeDocument(string _documentId) public",
  "function authorizeIssuer(address _issuer) public",
  "function isAuthorizedIssuer(address _address) public view returns (bool)",
  "event DocumentIssued(string indexed documentId, string documentHash, address indexed issuer, string recipientId, string documentType, uint256 timestamp)",
  "event DocumentRevoked(string indexed documentId, address indexed revokedBy, uint256 timestamp)"
];

export default function AuthorityDashboard() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('issue');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [issueForm, setIssueForm] = useState({
    documentType: 'birth_certificate',
    recipientId: '',
    recipientName: '',
    file: null
  });

  const [verifyForm, setVerifyForm] = useState({
    documentId: '',
    documentHash: ''
  });
  const [verifyResult, setVerifyResult] = useState(null);
  const [revokeDocId, setRevokeDocId] = useState('');
  const [viewDocId, setViewDocId] = useState('');
  const [viewResult, setViewResult] = useState(null);
  const [newIssuerAddress, setNewIssuerAddress] = useState('');

  useEffect(() => {
    checkWalletConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum === 'undefined') {
        setMessage({ type: 'error', text: 'MetaMask is not installed!' });
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      const network = await provider.getNetwork();
      const sepoliaChainId = 11155111n;
      
      if (network.chainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia test network',
                    nativeCurrency: {
                      name: 'SepoliaETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://sepolia.infura.io/v3/'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              });
            } catch (addError) {
              setMessage({ type: 'error', text: 'Failed to add Sepolia network' });
              return;
            }
          } else {
            setMessage({ type: 'error', text: 'Please switch to Sepolia testnet manually' });
            return;
          }
        }
      }

      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setAccount(accounts[0]);
      setContract(contract);

      try {
        const authorized = await contract.isAuthorizedIssuer(accounts[0]);
        setIsAuthorized(authorized);
        
        if (!authorized) {
          setMessage({ type: 'warning', text: 'Your address is not authorized. Please authorize yourself first in the "Authorize Issuer" tab.' });
        }
      } catch (error) {
        console.error('Authorization check failed:', error);
        setIsAuthorized(false);
        setMessage({ type: 'warning', text: 'Could not check authorization. You may need to authorize yourself first.' });
      }

    } catch (error) {
      setMessage({ type: 'error', text: `Connection failed: ${error.message}` });
    }
  };

  // Generate automatic document ID
  const generateDocumentId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `DOC-${timestamp}-${random}`;
  };

  const generateDocumentHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target.result;
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        resolve(hashHex);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIssueForm({ ...issueForm, file });
    }
  };

  // Store document in database
  const storeDocumentInDatabase = async (aadharCardId, docId, docType, docHash) => {
    try {
      const response = await fetch(`${API_BASE_URL}/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: JSON.stringify({
          aadhar_card_id: aadharCardId,
          doc_id: docId,
          doc_type: docType,
          doc_hash: docHash
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to store in database');
      }
      
      return data;
    } catch (error) {
      console.error('Database storage error:', error);
      throw error;
    }
  };

  const issueDocument = async () => {
    if (!contract || !isAuthorized) {
      setMessage({ type: 'error', text: 'Not authorized to issue documents' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Generate automatic document ID
      const documentId = generateDocumentId();
      
      const documentHash = await generateDocumentHash(issueForm.file);
      const ipfsHash = `ipfs://demo_${documentHash.substring(0, 16)}`;

      // Issue document on blockchain
      const tx = await contract.issueDocument(
        documentId,
        documentHash,
        issueForm.documentType,
        issueForm.recipientId,
        issueForm.recipientName,
        ipfsHash
      );

      setMessage({ type: 'info', text: 'Blockchain transaction submitted. Waiting for confirmation...' });
      await tx.wait();

      // Store in database after successful blockchain transaction
      try {
        await storeDocumentInDatabase(
          issueForm.recipientId,
          documentId,
          issueForm.documentType,
          documentHash
        );
        
        setMessage({ 
          type: 'success', 
          text: `Document issued successfully on blockchain and stored in database! Document ID: ${documentId}` 
        });
      } catch (dbError) {
        setMessage({ 
          type: 'warning', 
          text: `Document issued on blockchain but failed to store in database: ${dbError.message}. Document ID: ${documentId}` 
        });
      }

      setIssueForm({
        documentType: 'birth_certificate',
        recipientId: '',
        recipientName: '',
        file: null
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to issue document: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const verifyDocument = async () => {
    if (!contract) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    setVerifyResult(null);

    try {
      const result = await contract.verifyDocument(
        verifyForm.documentId,
        verifyForm.documentHash
      );

      setVerifyResult({
        isValid: result[0],
        exists: result[1],
        revoked: result[2],
        issuer: result[3],
        timestamp: Number(result[4]),
        documentType: result[5],
        recipientName: result[6]
      });

      if (!result[1]) {
        setMessage({ type: 'error', text: 'Document does not exist' });
      } else if (result[2]) {
        setMessage({ type: 'error', text: 'Document has been revoked' });
      } else if (!result[0]) {
        setMessage({ type: 'error', text: 'Document hash does not match' });
      } else {
        setMessage({ type: 'success', text: 'Document is valid!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Verification failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = async () => {
    if (!contract) return;

    setLoading(true);
    setMessage({ type: '', text: '' });
    setViewResult(null);

    try {
      const result = await contract.getDocument(viewDocId);
      
      setViewResult({
        documentHash: result[0],
        issuer: result[1],
        timestamp: Number(result[2]),
        documentType: result[3],
        recipientId: result[4],
        recipientName: result[5],
        isRevoked: result[6],
        ipfsHash: result[7]
      });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to fetch document: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const revokeDocument = async () => {
    if (!contract || !isAuthorized) {
      setMessage({ type: 'error', text: 'Not authorized' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const tx = await contract.revokeDocument(revokeDocId);
      setMessage({ type: 'info', text: 'Transaction submitted...' });
      await tx.wait();
      setMessage({ type: 'success', text: 'Document revoked successfully!' });
      setRevokeDocId('');
    } catch (error) {
      setMessage({ type: 'error', text: `Revocation failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const authorizeIssuer = async () => {
    if (!contract) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const tx = await contract.authorizeIssuer(newIssuerAddress);
      setMessage({ type: 'info', text: 'Transaction submitted...' });
      await tx.wait();
      setMessage({ type: 'success', text: 'Issuer authorized successfully!' });
      setNewIssuerAddress('');
    } catch (error) {
      setMessage({ type: 'error', text: `Authorization failed: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = (documentId) => {
    const qrData = JSON.stringify({ documentId, contractAddress: CONTRACT_ADDRESS });
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    return qrUrl;
  };

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header-card">
        <div className="header-content">
          <div className="header-left">
            <div className="govt-logo">
              <Shield size={32} />
            </div>
            <div className="header-info">
              <h1>Document Verification Authority Dashboard</h1>
              <p className="header-subtitle">Blockchain-based Document Management System</p>
            </div>
          </div>
          
          <div className="header-right">
            {account ? (
              <div className="wallet-section">
                <div className="wallet-label">Connected Account</div>
                <div className="wallet-address">
                  {account.substring(0, 6)}...{account.substring(38)}
                </div>
                {isAuthorized && (
                  <span className="badge-authorized">Authorized Issuer</span>
                )}
              </div>
            ) : (
              <button 
                onClick={connectWallet}
                className="btn-connect"
              >
                Connect MetaMask
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Message Display */}
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.type === 'success' && <CheckCircle size={20} />}
            {message.type === 'error' && <XCircle size={20} />}
            {message.type === 'warning' && <AlertCircle size={20} />}
            {message.type === 'info' && <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button 
              className={`tab ${activeTab === 'issue' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('issue')}
            >
              <Upload size={18} />
              Issue Document
            </button>
            <button 
              className={`tab ${activeTab === 'verify' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('verify')}
            >
              <CheckCircle size={18} />
              Verify Document
            </button>
            <button 
              className={`tab ${activeTab === 'view' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('view')}
            >
              <FileText size={18} />
              View Document
            </button>
            <button 
              className={`tab ${activeTab === 'revoke' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('revoke')}
            >
              <XCircle size={18} />
              Revoke Document
            </button>
            <button 
              className={`tab ${activeTab === 'authorize' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('authorize')}
            >
              <Users size={18} />
              Authorize Issuer
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Issue Document Tab */}
            {activeTab === 'issue' && (
              <div>
                <h2 className="section-title">Issue New Document</h2>
                <div className="message-info" style={{ marginBottom: '1.5rem' }}>
                  ℹ️ Document ID will be automatically generated when you submit the form.
                </div>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Document Type</label>
                    <select
                      value={issueForm.documentType}
                      onChange={(e) => setIssueForm({...issueForm, documentType: e.target.value})}
                      className="form-input"
                    >
                      <option value="birth_certificate">Birth Certificate</option>
                      <option value="death_certificate">Death Certificate</option>
                      <option value="caste_certificate">Caste Certificate</option>
                      <option value="domicile_certificate">Domicile Certificate</option>
                      <option value="income_certificate">Income Certificate</option>
                      <option value="residence_certificate">Residence Certificate</option>
                      <option value="land_deed">Land Deed</option>
                      <option value="ration_card">Ration Card</option>
                      <option value="identity_card">Identity Card</option>
                      <option value="aadhar_card">Aadhaar Card</option>
                      <option value="pan_card">PAN Card</option>
                      <option value="voter_id">Voter ID</option>
                      <option value="driving_license">Driving License</option>
                      <option value="passport">Passport</option>
                      <option value="education_certificate">Education Certificate</option>
                      <option value="marriage_certificate">Marriage Certificate</option>
                      <option value="disability_certificate">Disability Certificate</option>
                      <option value="property_tax_receipt">Property Tax Receipt</option>
                      <option value="vehicle_registration">Vehicle Registration Certificate</option>
                      <option value="pension_certificate">Pension Certificate</option>
                      <option value="employment_certificate">Employment Certificate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Recipient ID (Aadhar)</label>
                    <input
                      type="text"
                      value={issueForm.recipientId}
                      onChange={(e) => setIssueForm({...issueForm, recipientId: e.target.value})}
                      placeholder="AADHAR-1234-5678"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Recipient Name</label>
                    <input
                      type="text"
                      value={issueForm.recipientName}
                      onChange={(e) => setIssueForm({...issueForm, recipientName: e.target.value})}
                      placeholder="John Doe"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Upload Document</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.png"
                    className="file-input"
                  />
                  <p className="file-hint">Accepted formats: PDF, JPG, PNG</p>
                </div>

                <button
                  onClick={issueDocument}
                  disabled={loading || !isAuthorized}
                  className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                >
                  {loading ? 'Processing...' : 'Issue Document'}
                </button>
              </div>
            )}

            {/* Verify Document Tab */}
            {activeTab === 'verify' && (
              <div>
                <h2 className="section-title">Verify Document Authenticity</h2>
                
                <div className="form-group">
                  <label>Document ID</label>
                  <input
                    type="text"
                    value={verifyForm.documentId}
                    onChange={(e) => setVerifyForm({...verifyForm, documentId: e.target.value})}
                    placeholder="DOC-2024-001"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Document Hash</label>
                  <input
                    type="text"
                    value={verifyForm.documentHash}
                    onChange={(e) => setVerifyForm({...verifyForm, documentHash: e.target.value})}
                    placeholder="Enter SHA-256 hash of the document"
                    className="form-input"
                  />
                  <p className="file-hint">Upload the document file to calculate its hash automatically</p>
                </div>

                <button 
                  onClick={verifyDocument} 
                  disabled={loading}
                  className={`btn-success ${loading ? 'btn-loading' : ''}`}
                >
                  {loading ? 'Verifying...' : 'Verify Document'}
                </button>

                {verifyResult && (
                  <div className={`result-card ${verifyResult.isValid ? 'result-valid' : 'result-invalid'}`}>
                    <h3>
                      {verifyResult.isValid ? '✓ Valid Document' : '✗ Invalid Document'}
                    </h3>
                    {verifyResult.exists && (
                      <div className="result-details">
                        <p><strong>Type:</strong> {verifyResult.documentType}</p>
                        <p><strong>Recipient:</strong> {verifyResult.recipientName}</p>
                        <p><strong>Issued:</strong> {new Date(verifyResult.timestamp * 1000).toLocaleString()}</p>
                        <p><strong>Status:</strong> {verifyResult.revoked ? 'Revoked' : 'Active'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* View Document Tab */}
            {activeTab === 'view' && (
              <div>
                <h2 className="section-title">View Document Details</h2>
                
                <div className="form-group">
                  <label>Document ID</label>
                  <input
                    type="text"
                    value={viewDocId}
                    onChange={(e) => setViewDocId(e.target.value)}
                    placeholder="DOC-2024-001"
                    className="form-input"
                  />
                </div>

                <button 
                  onClick={viewDocument} 
                  disabled={loading}
                  className={`btn-info ${loading ? 'btn-loading' : ''}`}
                >
                  {loading ? 'Loading...' : 'View Document'}
                </button>

                {viewResult && (
                  <div className="document-card">
                    <div className="document-header">
                      <h3>{viewResult.documentType}</h3>
                      <button
                        onClick={() => window.open(generateQRCode(viewDocId), '_blank')}
                        className="btn-qr btn-with-icon"
                      >
                        <QrCode size={16} />
                        Generate QR
                      </button>
                    </div>
                    <div className="document-details">
                      <div className="detail-row">
                        <span className="detail-label">Recipient Name:</span>
                        <span>{viewResult.recipientName}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Recipient ID:</span>
                        <span>{viewResult.recipientId}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Issued:</span>
                        <span>{new Date(viewResult.timestamp * 1000).toLocaleString()}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={viewResult.isRevoked ? 'status-revoked' : 'status-active'}>
                          {viewResult.isRevoked ? '❌ Revoked' : '✅ Active'}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Hash:</span>
                        <span className="hash-value">{viewResult.documentHash}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Revoke Document Tab */}
            {activeTab === 'revoke' && (
              <div>
                <h2 className="section-title">Revoke Document</h2>
                <div className="warning-box">
                  ⚠️ Warning: Revoking a document is permanent and cannot be undone.
                </div>
                
                <div className="form-group">
                  <label>Document ID</label>
                  <input
                    type="text"
                    value={revokeDocId}
                    onChange={(e) => setRevokeDocId(e.target.value)}
                    placeholder="DOC-2024-001"
                    className="form-input"
                  />
                </div>

                <button
                  onClick={revokeDocument}
                  disabled={loading || !isAuthorized}
                  className={`btn-danger ${loading ? 'btn-loading' : ''}`}
                >
                  {loading ? 'Processing...' : 'Revoke Document'}
                </button>
              </div>
            )}

            {/* Authorize Issuer Tab */}
            {activeTab === 'authorize' && (
              <div>
                <h2 className="section-title">Authorize New Issuer</h2>
                <p className="section-description">
                  Add a new Ethereum address as an authorized document issuer.
                </p>
                
                <div className="form-group">
                  <label>Ethereum Address</label>
                  <input
                    type="text"
                    value={newIssuerAddress}
                    onChange={(e) => setNewIssuerAddress(e.target.value)}
                    placeholder="0x..."
                    className="form-input"
                  />
                </div>

                <button 
                  onClick={authorizeIssuer} 
                  disabled={loading}
                  className={`btn-primary ${loading ? 'btn-loading' : ''}`}
                >
                  {loading ? 'Processing...' : 'Authorize Issuer'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <p>
            Contract Address: <span className="contract-address">{CONTRACT_ADDRESS}</span>
          </p>
          <p>Network: Ethereum Sepolia Testnet</p>
        </div>
      </div>
    </div>
  );
}