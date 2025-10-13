// Global state
let currentArtworks = [];//...artworkData];
let cart = JSON.parse(localStorage.getItem('artconnect_cart') || '[]');
let walletConnected = false;
let walletAddress = null;
let submittedArtworks = JSON.parse(localStorage.getItem('user_submitted_artwork') || '[]');
let isAdmin = false;
const USER_DISCONNECTED_KEY = 'walletDisconnectedByUser';
let unsubscribeArtworks = null;
let unsubscribePurchases = null;

// 🔹 Global wallet recovery after refresh (respects manual logout)
window.addEventListener("DOMContentLoaded", async () => {
  // If user intentionally disconnected earlier, don't auto-restore
  if (localStorage.getItem(USER_DISCONNECTED_KEY) === 'true') {
    console.log("User previously disconnected — skipping auto reconnect");
    return;
  }

  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });

      if (accounts.length > 0 && chainId === '0xaa36a7') {
        walletAddress = accounts[0];
        walletConnected = true;
        updateWalletUI();
        console.log("Wallet restored after refresh:", walletAddress);

        // Fire events so other code responds (emit both so older handlers still work)
        window.dispatchEvent(new CustomEvent('wallet_ready', { detail: walletAddress }));
        document.dispatchEvent(new Event('walletReady'));

        // Load profile now that wallet is present
        loadUserProfileFromDB(walletAddress);
      } else {
        console.log("No wallet connected yet or wrong chain.");
      }
    } catch (err) {
      console.error("Error restoring wallet:", err);
    }
  } else {
    console.warn("MetaMask not found");
  }
});


// Enhanced artwork data with blockchain details
const blockchainDetails = {
    1: {
        tokenId: "0x1a2b3c4d5e6f7890",
        contractAddress: "0x495f947276749Ce646f68AC8c248420045cb7b5e",
        chain: "Ethereum",
        status: "new",
        priceHistory: [
            { date: "2024-01-15", price: 2.5, event: "Minted" },
            { date: "2024-02-20", price: 2.8, event: "Price Update" },
            { date: "2024-03-10", price: 3.2, event: "Current Price" }
        ],
        ownershipHistory: [
            { owner: "0x1234...5678", date: "2024-01-15", event: "Minted" },
            { owner: "0xabcd...efgh", date: "2024-02-01", event: "Transferred" }
        ]
    },
    2: {
        tokenId: "0x2b3c4d5e6f789012",
        contractAddress: "0x495f947276749Ce646f68AC8c248420045cb7b5e",
        chain: "Ethereum",
        status: "resold",
        priceHistory: [
            { date: "2023-12-01", price: 1.8, event: "Minted" },
            { date: "2024-01-15", price: 2.2, event: "First Sale" },
            { date: "2024-02-28", price: 1.9, event: "Resale" },
            { date: "2024-03-15", price: 2.1, event: "Current Price" }
        ],
        ownershipHistory: [
            { owner: "0x9876...5432", date: "2023-12-01", event: "Minted" },
            { owner: "0x5678...9012", date: "2024-01-15", event: "First Sale" },
            { owner: "0x3456...7890", date: "2024-02-28", event: "Resold" }
        ]
    }
};


// window.addEventListener("load", async () => {
//   try {

//     const savedWallet = localStorage.getItem("walletAddress");
//     if (savedWallet) {
//       walletAddress = savedWallet.toLowerCase();
//       walletConnected = true;
//       console.log("Loaded saved wallet from localStorage:", walletAddress);
//       updateWalletUI();

//       // Preload user data immediately
//       await loadUserProfileFromDB(walletAddress);
//       await loadUserArtworksLive(walletAddress);
//       await loadUserPurchasesLive(walletAddress);
//     }

//     if (typeof window.ethereum !== "undefined") {
//       const accounts = await window.ethereum.request({ method: "eth_accounts" });

//       if (accounts.length > 0) {
//         walletAddress = accounts[0].toLowerCase();
//         walletConnected = true;
//         localStorage.setItem("walletAddress", walletAddress);
//         console.log("Reconnected wallet from MetaMask:", walletAddress);
//         updateWalletUI();

//         // Refresh user data if needed
//         await loadUserProfileFromDB(walletAddress);
//         await loadUserArtworksLive(walletAddress);
//         await loadUserPurchasesLive(walletAddress);
//       } else {
//         console.log("No wallet connected on reload.");
//       }
//     }
//   } catch (err) {
//     console.error("Auto-reconnect failed:", err);
//   }
// });


function initFirestoreListeners() {
    // 🔹 Unsubscribe previous listeners to avoid duplicates
    if (unsubscribeArtworks) unsubscribeArtworks();
    if (unsubscribePurchases) unsubscribePurchases();

    // 🔹 Live listener for all artworks (everyone sees)
    const artworksRef = collection(db, "artworks");
    unsubscribeArtworks = onSnapshot(artworksRef, (snapshot) => {
        const artworks = snapshot.docs.map(docSnap => ({
            id: docSnap.id,
            ...docSnap.data()
        }));
        renderArtworks(artworks); // safe render
        console.log(`✅ Real-time listener active for artworks: ${artworks.length} items`);
    }, (err) => console.error("Firestore artworks listener error:", err));

    // 🔹 Live listener for user purchases (requires wallet)
    if (window.walletConnected && window.walletAddress) {
        const purchasesRef = collection(db, "purchases");
        unsubscribePurchases = onSnapshot(purchasesRef, (snapshot) => {
            const purchases = snapshot.docs
                .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
                .filter(p => p.buyer === window.walletAddress); // only user's purchases
            renderUserPurchases(purchases);
            console.log(`✅ Real-time listener active for user purchases: ${purchases.length} items`);
        }, (err) => console.error("Firestore purchases listener error:", err));
    }
}


/**
 * Reset the UI to default state
 */
function resetUI() {

    const userArtworks = document.getElementById("userArtworks");
    if (userArtworks) userArtworks.innerHTML = "";

    const userPurchases = document.getElementById("userPurchases");
    if (userPurchases) userPurchases.innerHTML = "";

    const profileName = document.getElementById("profileName");
    if (profileName) profileName.textContent = "Guest User";

    const profileBio = document.getElementById("profileBio");
    if (profileBio) profileBio.textContent = "No bio yet.";

    const profileWallet = document.getElementById("profileWallet");
    if (profileWallet) profileWallet.textContent = "Wallet: Not Connected";
}

/**
 * Update wallet button/UI
 */
function updateWalletUI() {
    const walletBtn = document.getElementById("walletBtn");
    const walletWarning = document.getElementById("walletWarning");
    if (!walletBtn) return;

    if (window.walletConnected && window.walletAddress) {
        walletBtn.innerHTML = `<i class="fab fa-ethereum"></i> ${window.walletAddress.slice(0,6)}...${window.walletAddress.slice(-4)}`;
        walletBtn.classList.add("connected");  // green connected style
        walletBtn.title = `Connected to Ethereum: ${window.walletAddress}`;
        if (walletWarning) walletWarning.style.display = 'none';
    } else {
        walletBtn.innerHTML = `<i class="fab fa-ethereum"></i> Connect Ethereum Wallet`;
        walletBtn.classList.remove("connected");  // remove green
        walletBtn.title = 'Connect your Ethereum wallet via MetaMask';
        if (walletWarning) walletWarning.style.display = 'block';
    }
}



/**
 * Connect wallet
 */
async function connectWallet() { 
    // Toggle wallet connection
    if (window.walletConnected) {
        disconnectWallet();
        return;
    }

    if (typeof window.ethereum === 'undefined') { 
        showToast('Please install MetaMask to use this feature', 'error'); 
        return; 
    } 

    try { 
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }); 
        if (chainId !== '0xaa36a7') {
            showToast('Switching MetaMask to Sepolia...', 'warning');
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }]
                });
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: '0xaa36a7',
                            chainName: 'Sepolia Test Network',
                            rpcUrls: ['https://rpc.sepolia.org'],
                            nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                            blockExplorerUrls: ['https://sepolia.etherscan.io']
                        }]
                    });
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }]
                    });
                } else {
                    throw switchError;
                }
            }
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
            // ✅ Always update the global window state
            window.walletAddress = accounts[0];
            window.walletConnected = true;

            localStorage.removeItem(USER_DISCONNECTED_KEY);
            localStorage.setItem('connectedWallet', window.walletAddress);

            showToast('Wallet connected successfully!', 'success');

            // 🔹 Initialize Firestore listeners
            initFirestoreListeners();

            // 🔹 Update wallet UI immediately
            updateWalletUI();

            // 🔹 Update profile info to match wallet
            loadUserProfileFromDB(accounts[0]);

            window.dispatchEvent(new CustomEvent('wallet_ready', { detail: window.walletAddress }));
            document.dispatchEvent(new Event('walletReady'));
        }
    } catch (error) { 
        console.error('Wallet connection failed:', error); 
        showToast('Failed to connect wallet', 'error'); 
    } 
}



/**
 * Disconnect wallet
 */
function disconnectWallet() {
    // ✅ Clear wallet state
    window.walletConnected = false;
    window.walletAddress = null;

    // Clear localStorage
    localStorage.removeItem('connectedWallet');
    localStorage.setItem(USER_DISCONNECTED_KEY, 'true');

    // Unsubscribe Firestore listeners
    if (unsubscribeArtworks) unsubscribeArtworks();
    if (unsubscribePurchases) unsubscribePurchases();
    unsubscribeArtworks = null;
    unsubscribePurchases = null;

    // 🔹 Reset UI first
    resetUI();

    // 🔹 Update wallet button/UI after clearing state
    updateWalletUI();

    showToast('Wallet disconnected successfully!', 'info');
    console.log('Wallet manually disconnected.');

    window.dispatchEvent(new CustomEvent('wallet_disconnected'));
    document.dispatchEvent(new Event('walletDisconnected'));
}




// 🔹 Automatically reconnect wallet when page reloads
window.addEventListener('load', async () => {
    const savedWallet = localStorage.getItem('connectedWallet');

    if (savedWallet && typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });

           if (accounts.length > 0 && chainId === '0xaa36a7') {
    window.walletAddress = accounts[0];
    window.walletConnected = true;

    updateWalletUI(); // 🔹 ensures button reflects state
    showToast('Wallet reconnected automatically!', 'success');

    // Fire profile refresh after reconnect
    loadUserProfileFromDB(accounts[0]);

    document.dispatchEvent(new Event('walletReady'));
} else {
    localStorage.removeItem('connectedWallet');
}
            } catch (err) {
            console.error('Auto reconnect failed:', err);
        }
    }
});

// 🔹 Detect account or network changes
if (typeof window.ethereum !== 'undefined') {
window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length === 0) {
        // Wallet disconnected
        localStorage.removeItem('connectedWallet');
        window.walletConnected = false;
        window.walletAddress = null;

        updateWalletUI();
        showToast('Wallet disconnected', 'info');

        resetUI(); // reset profile info
    } else {
        // Wallet switched
        window.walletAddress = accounts[0];
        window.walletConnected = true;
        localStorage.setItem('connectedWallet', window.walletAddress);

        updateWalletUI();
        showToast('Wallet account changed', 'info');

        loadUserProfileFromDB(accounts[0]);
        document.dispatchEvent(new Event('walletReady'));
    }
});

    window.ethereum.on('chainChanged', (chainId) => {
        if (chainId !== '0xaa36a7') {
            showToast('Please switch back to Sepolia network', 'warning');
        }
    });
}

function isValidEthereumAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        walletConnected = false;
        walletAddress = null;
        updateWalletUI();
        showToast('Wallet disconnected', 'warning');
    } else {
        // User switched accounts
        if (isValidEthereumAddress(accounts[0])) {
            walletAddress = accounts[0];
            updateWalletUI();
            showToast('Account switched', 'success');
        }
    }
}

function handleChainChanged(chainId) {
    const allowedChains = ['0x1', '0x5', '0xaa36a7'];
    if (!allowedChains.includes(chainId)) {
        showToast('Please switch to Sepolia network', 'error');
        walletConnected = false;
        walletAddress = null;
        updateWalletUI();
    } else {
        showToast('Network switched to Sepolia', 'success');
    }
}

// save info in db
async function saveUserToFirestore(walletAddress) {
    const userRef = doc(db, "users", walletAddress);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            walletAddress: walletAddress,
            createdAt: new Date()
        });
        console.log("New user saved:", walletAddress);
    } else {
        console.log("User already exists:", walletAddress);
    }
}


async function sendPayment(toAddress, amount) {
    if (!walletConnected || !walletAddress) {
        return onWalletReady(async (address) => {
            console.log("Wallet was not ready — now connected:", address);
            return await sendPayment(toAddress, amount);
        });
    }

    showLoading();

    try {
        let chainId = await window.ethereum.request({ method: 'eth_chainId' });

        // ✅ Ensure we're on Sepolia
        if (chainId !== '0xaa36a7') {
            try {
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: '0xaa36a7' }]
                });
                chainId = '0xaa36a7';
            } catch (switchError) {
                if (switchError.code === 4902)
                    throw new Error('Sepolia not available in MetaMask. Please add it manually.');
                else
                    throw new Error('Please switch your MetaMask network to Sepolia');
            }
        }

        const ethValue = Number(amount);
        if (isNaN(ethValue) || ethValue <= 0) throw new Error("Invalid payment amount");

        const amountInWei = "0x" + BigInt(Math.floor(ethValue * 1e18)).toString(16);

        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: walletAddress,
                to: toAddress,
                value: amountInWei
            }]
        });

        console.log("Transaction sent:", txHash);
        return txHash;
    } catch (error) {
        if (error.code === 4001) throw new Error('Transaction rejected by user');
        throw error;
    } finally {
        hideLoading();
    }
}


// Navigation functionality
function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    const activeLink = document.querySelector(`[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

// Initialize navigation
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
        });
    });
    
    // Load initial data
    loadArtworksLive();
    loadArtists();
    updateCartUI();
    updateWalletUI();
    updateAdminStats();
    loadUserProfileFromDB();
    

    // Check for admin access (demo: wallet address contains "admin")
    if (walletAddress && walletAddress.toLowerCase().includes('admin')) {
        isAdmin = true;
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
    }
});

import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function loadArtworksLive() {
  try {
    // 🔹 Wait for Firebase initialization before using Firestore
    const db = await waitForFirebase();
    console.log("🔥 Firestore ready, initializing live listener...");

    const artworksRef = collection(db, "artworks");

    // Live listener for Firestore changes
    onSnapshot(artworksRef, (snapshot) => {
      const submittedArtworks = [];

      snapshot.forEach(docSnap => {
        const art = docSnap.data();
        submittedArtworks.push({
          id: art.id || docSnap.id,
          ...art
        });
      });

      // Save locally for offline cache
      localStorage.setItem('user_submitted_artwork', JSON.stringify(submittedArtworks));

      // Update global variable and re-render immediately
      currentArtworks = submittedArtworks;
      renderArtworks(currentArtworks);

      console.log(`✅ Real-time Firestore listener active. Loaded ${submittedArtworks.length} artworks.`);
    });
  } catch (error) {
    console.error("❌ Real-time loading failed:", error);
    showToast("Failed to connect live updates", "error");
  }
}

function getImageUrl(url) {
    if (!url) return '';

    // Check if it's a Google Drive link
    if (url.includes("drive.google.com")) {
        const match = url.match(/[-\w]{25,}/); // Extracts the file ID
        if (match) {
            return `https://drive.google.com/uc?export=view&id=${match[0]}`;
        }
    }
    return url; // return original if not Drive
}

function renderArtworks(artworks) {
    const artworkGrid = document.getElementById('artworkGrid');
    
    if (artworks.length === 0) {
        artworkGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <h3>No artworks found</h3>
                <p>Try adjusting your search or filter criteria</p>
            </div>
        `;
        return;
    }

    artworkGrid.innerHTML = artworks.map(artwork => `
        <div class="artwork-card">
            <div class="artwork-image">
                <img src="${getImageUrl(artwork.imageUrl)}" alt="${artwork.title}" loading="lazy">
                ${!artwork.inStock ? '<div class="stock-badge">Out of Stock</div>' : ''}
            </div>
            <div class="artwork-info">
                <div class="artwork-header">
                    <h3 class="artwork-title">${artwork.title}</h3>
                </div>
                <p class="artwork-artist">by ${artwork.artist}</p>
                <p class="artwork-meta">${artwork.category} • ${artwork.year} • ${artwork.dimensions}</p>
                <p class="artwork-description">${artwork.description}</p>
                <div class="artwork-footer">
                    <span class="artwork-price">${artwork.price} tETH</span>
                </div>
                <div class="artwork-actions">
                    <button class="btn btn-secondary" onclick="showArtworkDetail('${artwork.id}')">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary add-to-basket-btn" onclick="addToCart('${artwork.id}')" ${!artwork.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-basket"></i> ${artwork.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
                <div class="artwork-status">
                    <span class="status-badge ${getArtworkStatus(artwork.id)}">${getArtworkStatusText(artwork.id)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterArtworks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filtered = [...submittedArtworks]; //, ...artworkData];
    
    // Apply search filter
    if (searchTerm) {
        filtered = filtered.filter(artwork => 
            artwork.title.toLowerCase().includes(searchTerm) ||
            artwork.artist.toLowerCase().includes(searchTerm) ||
            artwork.description.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
        filtered = filtered.filter(artwork => artwork.category === categoryFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
        switch (sortFilter) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'year':
                return b.year - a.year;
            case 'artist':
                return a.artist.localeCompare(b.artist);
            default:
                return a.title.localeCompare(b.title);
        }
    });
    
    currentArtworks = filtered;
    renderArtworks(filtered);
}

function showArtworkDetail(artworkId) {
    const artwork = [...submittedArtworks].find(item => String(item.id) === String(artworkId));
    if (!artwork) return;
    
    const modal = document.getElementById('artworkModal');
    const detailContainer = document.getElementById('artworkDetail');

    detailContainer.innerHTML = `
        <img src="${getImageUrl(artwork.imageUrl)}" alt="${artwork.title}" class="artwork-detail-image">
        <div class="artwork-detail-info">
            <h2>${artwork.title}</h2>
            <p class="artwork-detail-artist">by ${artwork.artist}</p>
            <div class="artwork-detail-meta">
                <span>${artwork.category}</span>
                <span>${artwork.year}</span>
                <span>${artwork.dimension}</span>
            </div>
            <p class="artwork-detail-description">${artwork.description}</p>
            <div class="artwork-status-detail">
                <span class="status-badge ${getArtworkStatus(artwork.id)}">${getArtworkStatusText(artwork.id)}</span>
            </div>
            <div class="artwork-detail-footer">
                <span class="artwork-detail-price">${artwork.price} tETH</span>
                <div class="detail-actions">
                    <button class="btn btn-secondary" onclick="showArtistProfile('${(artwork.sellerId||'').toLowerCase()}')">
                        <i class="fas fa-user"></i> View Artist
                    </button>
                    <button class="btn btn-secondary" onclick="showBlockchainDetails(${artwork.id})">
                        <i class="fab fa-ethereum"></i> Blockchain
                    </button>
                    <button class="btn btn-primary enhanced-add-btn" onclick="addToCart(${artwork.id}); closeArtworkModal();" ${!artwork.inStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-basket"></i> ${artwork.inStock ? 'Add to Basket' : 'Out of Stock'}
                    </button>
                </div>
            </div></to_replace>
</Editor.edit_file_by_replace>

<Editor.edit_file_by_replace>
<file_name></file_name>
<to_replace>                <div class="cart-actions">
                    <button class="btn-primary" onclick="checkout()" id="checkoutBtn">Checkout</button>
                </div></to_replace>
<new_content>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeArtworkModal() {
    document.getElementById('artworkModal').style.display = 'none';
}

// Cart functionality
function addToCart(artworkId) {
    const artwork = [...submittedArtworks].find(item => String(item.id) === String(artworkId)); // , ...artworkData].find(item => item.id === artworkId);
    if (!artwork || !artwork.inStock) return;
    
    const existingItem = cart.find(item => item.id === artworkId);
    if (existingItem) {
        showToast('NFT already in cart! Each NFT is unique and can only be purchased once.', 'warning');
        return;
    } else {
        cart.push({
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist,
            price: artwork.price,
            imageUrl: artwork.imageUrl,
            sellerId: artwork.sellerId,
            category: artwork.category || "Uncategorized",
            description: artwork.description || "",
            dimension: artwork.dimensions || "",
            year: artwork.year || "",
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showToast('Added to cart successfully!', 'success');
}

function removeFromCart(artworkId) {
    cart = cart.filter(item => String(item.id) !== String(artworkId));
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast('Removed from cart', 'success');
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartUI();
    renderCartItems();
    showToast('Cart cleared', 'success');
}

function saveCart() {
    localStorage.setItem('artconnect_cart', JSON.stringify(cart));
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    const checkoutBtn = document.getElementById('checkoutBtn');
    const clearCartBtn = document.getElementById('clearCartBtn');

    if (totalItems === 0) {
        checkoutBtn.disabled = true;
        clearCartBtn.disabled = true;
    } else {
        checkoutBtn.disabled = false;
        clearCartBtn.disabled = false;
    }
}



function toggleCart() {
    const modal = document.getElementById('cartModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        renderCartItems();
    }
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-basket" style="font-size: 3rem; margin-bottom: 1rem; color: #94a3b8;"></i>
                <h3>Your basket is empty</h3>
                <p>Add some artworks to get started</p>
            </div>
        `;
        cartTotal.textContent = '0.000';
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(3);
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imageUrl}" alt="${item.title}" class="cart-item-image">
            <div class="cart-item-info">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-artist">by ${item.artist}</p>
                <p class="cart-item-price">${item.price} ETH</p>
                <span class="nft-badge">Unique Artwork</span>
            </div>
            <div class="cart-item-actions">
                <button class="remove-btn enhanced-remove-btn" onclick="removeFromCart('${item.id}')">
                    <i class="fas fa-times"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Close modals when clicking outside - Enhanced
window.addEventListener('click', function(event) {
    const modals = ['cartModal', 'artworkModal', 'blockchainModal', 'artistModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});
async function checkout() {
    if (!walletConnected || !walletAddress) {
        return onWalletReady(async (address) => {
            console.log("Wallet was not ready — now connected:", address);
            await checkout();
        });
    }

    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }

    showLoading();
    showLoadingText("Preparing your transactions...");
    showToast('Processing payment...', 'warning');

    try {
        for (let item of cart) {
            if (!item.sellerId || item.sellerId === "unknown") {
                console.warn(`Missing sellerId for artwork: ${item.title}`);
                continue;
            }

            const totalPrice = item.price * (item.quantity || 1);
            const sellerAmount = totalPrice; // 100% to artist
            const today = new Date().toISOString().split("T")[0];

            // 🔹 Pay Seller
            showLoadingText(`Waiting for MetaMask confirmation to pay seller for "${item.title}"...`);
            const txSeller = await sendPayment(item.sellerId, sellerAmount);
            console.log("Transaction sent to seller:", txSeller);

            // Common record for both buyer & seller
            const recordData = {
                artwork: {
                id: item.id,
                title: item.title,
                artist: item.artist || "Unknown Artist",
                price: item.price,
                category: item.category || "Uncategorized",
                description: item.description || "",
                dimension: item.dimension || "N/A",
                imageUrl: item.imageUrl,
                year: item.year || "",
                },
                buyerId: walletAddress.toLowerCase(),
                sellerId: item.sellerId.toLowerCase(),
                timestamp: new Date().toISOString(),
            };

            // For Seller: Simple sale record (no blockchain info)
            const sellerRef = doc(db, "users", item.sellerId.toLowerCase(), "artSold", String(item.id));
            await setDoc(sellerRef, recordData);

            // For Buyer: Enhanced version with blockchain history
            const artSnap = await getDoc(doc(db, "artworks", String(item.id)));
            let artData = artSnap.exists() ? artSnap.data() : item;

            const owner_history = Array.isArray(artData.owner_history)
                ? [...artData.owner_history, { owner: walletAddress.toLowerCase(), date: today, event: "Sold" }]
                : [
                    { owner: item.sellerId.toLowerCase(), date: today, event: "Listed" },
                    { owner: walletAddress.toLowerCase(), date: today, event: "Sold" },
                ];

            const price_history = Array.isArray(artData.price_history)
                ? [...artData.price_history, { price: parseFloat(item.price), date: today, event: "Sold" }]
                : [{ price: parseFloat(item.price), date: today, event: "Sold" }];

            const buyerRef = doc(db, "users", walletAddress.toLowerCase(), "artBought", String(item.id));
            await setDoc(buyerRef, {
                ...recordData,
                current_owner: walletAddress.toLowerCase(),
                original_owner: artData.original_owner || item.sellerId.toLowerCase(),
                owner_history,
                price_history,
                transaction_hash: txSeller || "",
            });

            // Delete sold art from seller + global
            await deleteDoc(doc(db, "artworks", String(item.id)));
            await deleteDoc(doc(db, "users", item.sellerId.toLowerCase(), "sellingArts", String(item.id)));

            clearCart();
            toggleCart();
            showLoadingText("Finalizing your order...");

            setTimeout(() => {
                hideLoading();
                showToast('Payment successful! Order confirmed.', 'success');
                loadArtworksLive();
            }, 800);
        }
    } catch (error) {
        console.error('Checkout failed:', error);
        hideLoading();
        showToast(`Payment failed: ${error.message}`, 'error');
    }
}



async function uploadToImgBB(file) {
    const apiKey = "84a54b2c03a399edaad3c48b3184201a";
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData
    });

    const data = await response.json();
    if (data.success) {
        return data.data.url; // direct image URL
    } else {
        console.error("ImgBB upload failed:", data);
        throw new Error("ImgBB upload failed");
    }
}


const yearInput = document.getElementById("artworkYear");
const currentYear = new Date().getFullYear();
yearInput.max = currentYear;


// Submit artwork functionality
async function submitArtwork(event) {
    event.preventDefault();
    
    if (!walletConnected || !walletAddress) {
        showToast('Please connect your wallet first', 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    

    try {
        const fileInput = document.getElementById('artworkImage');
        const file = fileInput.files[0];

        if (!file) {
            showToast('Please upload an image', 'error');
            return;
        }

        const imageUrl = await uploadToImgBB(file);


        const formData = {
            title: document.getElementById('artworkTitle').value.trim(),
            artist: currentUser?.username || "Unnamed Artist",
            description: document.getElementById('artworkDescription').value.trim(),
            price: parseFloat(document.getElementById('artworkPrice').value) || 0,
            category: document.getElementById('artworkCategory').value || "Uncategorized",
            dimension: document.getElementById('artworkDimensions').value || "Unspecified",
            year: parseInt(document.getElementById('artworkYear').value) || new Date().getFullYear(),
            imageUrl
        };
        
        // Validate form
        if (!validateSubmissionForm(formData)) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        const artDocId = String(Date.now());
        const today = new Date().toISOString().split('T')[0];
        
        const newArtwork = {
            id: artDocId,
            title: formData.title,
            artist:formData.artist,
            category: formData.category,
            dimension: formData.dimension,
            description: formData.description,
            imageUrl: formData.imageUrl,
            sellerId: walletAddress.toLowerCase(),
            original_owner: walletAddress.toLowerCase(),
            price: formData.price,
            year: formData.year,
            inStock: true,
            submittedAt: new Date().toISOString(),
            owner_history: [
                {
                owner: walletAddress.toLowerCase(),
                date: today,
                event: "Submitted"
                }
            ],
            price_history: [
                {
                price: parseFloat(formData.price) || 0,
                date: today,
                event: "Listed"
                }
            ]
        };

        // save to user's sellingArts with that id
        await setDoc(doc(db, "users", walletAddress.toLowerCase(), "sellingArts", artDocId), newArtwork);

        // save to global artworks with same doc id
        await setDoc(doc(db, "artworks", artDocId), newArtwork);

        submittedArtworks.push(newArtwork);
        localStorage.setItem('user_submitted_artwork', JSON.stringify(submittedArtworks));
        
        // Reset form
        document.getElementById('submitForm').reset();
        document.getElementById('artworkYear').value = new Date().getFullYear();
        
        showToast('Artwork submitted successfully!', 'success');
        showSection('gallery');
        loadArtworksLive();
        setTimeout(() => location.reload(), 1000);
        
    } catch (error) {
        console.error('Submission failed:', error);
        showToast('Failed to submit artwork. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

function validateSubmissionForm(formData) {
    if (!formData.title || !formData.artist || !formData.description || 
        !formData.imageUrl || !formData.category || !formData.dimension) {
        showToast('Please fill in all required fields', 'error');
        return false;
    }
    
    if (formData.dimension === "") {
        showToast('Please select a resolution/dimension', 'error');
        return false;
    }

    if (isNaN(formData.price) || formData.price <= 0) {
        showToast('Please enter a valid price', 'error');
        return false;
    }
    
    if (isNaN(formData.year) || formData.year < 1800 || formData.year > new Date().getFullYear()) {
        showToast('Please enter a valid year', 'error');
        return false;
    }

    if (!formData.imageUrl.startsWith("http")) {
        showToast('Invalid image link. Upload may have failed.', 'error');
        return false;
    }
    
    return true;
}

// Contact form functionality
function sendMessage(event) {
    event.preventDefault();
    
    const name = document.getElementById('contactName').value;
    const email = document.getElementById('contactEmail').value;
    const subject = document.getElementById('contactSubject').value;
    const message = document.getElementById('contactMessage').value;
    
    if (!name || !email || !subject || !message) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // In a real application, this would send to a backend
    showToast('Message sent successfully! We will get back to you soon.', 'success');
    event.target.reset();
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 4000);
    
    // Remove on click
    toast.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Close modals when clicking outside
window.addEventListener('click', function(event) {
    const cartModal = document.getElementById('cartModal');
    const artworkModal = document.getElementById('artworkModal');
    
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
    
    if (event.target === artworkModal) {
        artworkModal.style.display = 'none';
    }
});

// Initialize year field
document.addEventListener('DOMContentLoaded', function() {
    const yearField = document.getElementById('artworkYear');
    if (yearField && !yearField.value) {
        yearField.value = new Date().getFullYear();
    }
});

// Artist Profile Functions
// function loadArtists() {
//     const artistsGrid = document.getElementById('artistsGrid');
//     if (!artistsGrid) return;

//     // Group artworks by artist from submittedArtworks
//     const artistMap = {};
//     submittedArtworks.forEach(art => {
//         if (!artistMap[art.artist]) {
//             artistMap[art.artist] = {
//                 name: art.artist,
//                 avatar: art.artist.charAt(0).toUpperCase(), // first letter
//                 bio: art.bio || "This artist has not added a bio yet.",
//                 artworks: []
//             };
//         }
//         artistMap[art.artist].artworks.push(art);
//     });

//     const artists = Object.values(artistMap);

//     if (artists.length === 0) {
//         artistsGrid.innerHTML = `<p>No artists found</p>`;
//         return;
//     }
    
//     artistsGrid.innerHTML = artists.map(artist => `
//         <div class="artist-card" onclick="showArtistProfile('${artist.name}')">
//             <div class="artist-avatar-large">
//                 ${artist.avatar}
//             </div>
//             <div class="artist-info">
//                 <h3 class="artist-name">${artist.name}</h3>
//                 <p class="artist-bio">${artist.bio}</p>
//                 <div class="artist-stats">
//                     <div class="stat">
//                         <span class="stat-number">${artist.artworkCount}</span>
//                         <span class="stat-label">Artworks</span>
//                     </div>
//                     <div class="stat">
//                         <span class="stat-number">${artist.totalSales}</span>
//                         <span class="stat-label">ETH Sales</span>
//                     </div>
//                     <div class="stat">
//                         <span class="stat-number">${artist.joinDate}</span>
//                         <span class="stat-label">Joined</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `).join('');
// }

// 1) NEW loadArtists() - group by sellerId (wallet) and pull username & bio from users/{wallet}
async function loadArtists() {
  const artistsGrid = document.getElementById('artistsGrid');
  if (!artistsGrid) return;

  // If no artworks, short-circuit
  if (!submittedArtworks || submittedArtworks.length === 0) {
    artistsGrid.innerHTML = `<p>No artists found</p>`;
    return;
  }

  // Build a set of unique seller wallet addresses
  const sellerSet = new Set();
  submittedArtworks.forEach(a => {
    if (a.sellerId) sellerSet.add(a.sellerId.toLowerCase());
  });
  const sellers = Array.from(sellerSet).map(w => w.toLowerCase());

  try {
    // Fetch all user docs in parallel for those wallets
    const userDocPromises = sellers.map(w => getDoc(doc(db, 'users', w)));
    const userDocs = await Promise.all(userDocPromises);

    const artists = sellers.map((walletAddr, idx) => {
      const userSnap = userDocs[idx];
      const userData = (userSnap && userSnap.exists()) ? userSnap.data() : {};
      const username = userData.username ||
        (submittedArtworks.find(a => a.sellerId?.toLowerCase() === walletAddr)?.artist) ||
        'Unnamed Artist';
      const bio = userData.bio || 'This artist has not added a bio yet.';
      const artworks = submittedArtworks.filter(a => a.sellerId?.toLowerCase() === walletAddr);
      const totalSales = artworks.reduce((s, art) => s + (parseFloat(art.price) || 0), 0);
      const joinedDate = userData.joinedAt ? new Date(userData.joinedAt).getFullYear() : '—';

      return {
        walletAddr,
        username,
        bio,
        artworks,
        totalSales,
        joinedDate
      };
    });

    // Sort by artwork count (most active first)
    artists.sort((a, b) => b.artworks.length - a.artworks.length);

    // Render
    // <div class="artist-card" onclick="showArtistProfile('${artist.walletAddr}')">
    //     <div class="artist-header">
    //       <h3>${artist.username}</h3>
    //       <small class="wallet-display">${artist.walletAddr.slice(0,6)}...${artist.walletAddr.slice(-4)}</small>
    //     </div>
    //     <p>${artist.bio}</p>
    //     <div class="artist-meta">
    //       <small>${artist.artworks.length} Artworks</small>
    //       <small>${artist.totalSales.toFixed(2)} tETH Sales</small>
    //       <small>${artist.joinedDate} Joined</small>
    //     </div>
    //   </div>
artistsGrid.innerHTML = artists.map(artist => `
  <div class="artist-card" onclick="showArtistProfile('${artist.walletAddr}')">
    <div class="artist-header">
        <div class="artist-avatar">${artist.username.charAt(0).toUpperCase()}</div>
        <div class="artist-info">
          <h3>${artist.username}</h3>
          <p>${artist.bio ? artist.bio.slice(0, 40) + "..." : "No bio yet."}</p>
        </div>
    </div>

    <div class="artist-stats">
        <span><i class="fa-solid fa-image"></i> ${artist.artworks?.length || 0} Artworks</span>
        <span><i class="fa-brands fa-ethereum"></i> ${(artist.totalSales || 0).toFixed(3)} tETH</span>
    </div>

    <div class="artist-stats">
        <span><i class="fa-regular fa-calendar"></i> ${artist.joinedDate || "-"}</span>
    </div>
  </div>
`).join('');

  } catch (err) {
    console.error('Error loading artists:', err);
    artistsGrid.innerHTML = `<p style="color:red;">Failed to load artists.</p>`;
  }
}


// async function showArtistProfile(walletAddr) {
//     walletAddr = walletAddr.toLowerCase();
//     const modal = document.getElementById("artistModal");
//     const profileContainer = document.getElementById("artistProfile");

//     if (!modal) {
//         console.error("❌ artistModal element not found in HTML");
//         return;
//     }
//     if (!profileContainer) {
//         console.error("❌ artistProfile container not found in HTML");
//         modal.style.display = "none";
//         return;
//     }

//     modal.style.display = "block";
//     profileContainer.innerHTML = `
//         <div style="text-align:center; padding:2rem;">
//             <p>Loading artist details...</p>
//         </div>
//     `;

//     try {
//         const userRef = doc(db, "users", walletAddr);
//         const userSnap = await getDoc(userRef);
//         let userData = {};
//         if (userSnap.exists()) {
//             userData = userSnap.data();
//         } else {
//             // Try to match from submittedArtworks if Firestore doc is missing
//             const artMatch = submittedArtworks.find(a => a.sellerId?.toLowerCase() === walletAddr);
//             if (artMatch) {
//                 userData.username = artMatch.artist || "Unnamed Artist";
//             }
//         }

//         const username = userData.username || "Unknown Artist";
//         const bio = userData.bio || "This artist has not added a bio yet.";
//         const joined = userData.joinedAt ? new Date(userData.joinedAt).getFullYear() : "—";

//         // Fetch their artworks
//         const sellingArtsRef = collection(db, "users", walletAddr.toLowerCase(), "sellingArts");
//         const artSnap = await getDocs(sellingArtsRef);

//         if (!artSnap || artSnap.empty) {
//             profileContainer.innerHTML = `
//                 <div class="artist-profile">
//                     <h2>${username}</h2>
//                     <p class="artist-bio">${bio}</p>
//                     <p style="margin-top:1rem;">No artworks available yet.</p>
//                 </div>`;
//             return;
//         }

//         const artworksHTML = artSnap.docs.map(docSnap => {
//             const art = docSnap.data() || {};
//             const artId = docSnap.id;
//             const imageUrl = getImageUrl(art.imageUrl || "");
//             const title = art.title || "Untitled";
//             const price = art.price || "0.000";
//             const category = art.category || "Uncategorized";
//             const year = art.year || "—";
            
//             return `
//                 <div class="portfolio-item" style="cursor:pointer;" onclick="closeArtistModal(); showArtworkDetail('${artId}');">
//                     <img src="${imageUrl}" alt="${title}" loading="lazy" style="width:160px; height:110px; object-fit:cover; border-radius:8px;">
//                     <div class="portfolio-item-meta" style="margin-top:6px; text-align:left;">
//                         <strong style="font-size:0.95rem;">${title}</strong>
//                         <div style="font-size:0.85rem; color:#666;">${category} • ${year} • ${price} tETH</div>
//                     </div>
//                 </div>
//             `;
//         }).join("");

//         profileContainer.innerHTML = `
//             <div class="artist-profile" style="padding:1rem 1.5rem;">
//                 <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1rem;">
//                     <div style="width:64px; height:64px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:#f3f4f6; font-weight:700; font-size:1.4rem;">
//                         ${username.charAt(0).toUpperCase()}
//                     </div>
//                     <div>
//                         <h2 style="margin:0;">${username}</h2>
//                         <div style="color:#6b7280; font-size:0.95rem;">Joined ${joined}</div>
//                     </div>
//                 </div>

//                 <p class="artist-bio" style="color:#374151; margin-bottom:1rem;">${bio}</p>

//                 <h3 style="margin:0 0 0.5rem;">Portfolio</h3>
//                 <div class="artist-portfolio-grid" style="display:flex; gap:1rem; flex-wrap:wrap;">
//                     ${artworksHTML}
//                 </div>
//             </div>
//         `;

//     } catch (error) {
//         console.error("Error loading artist profile:", error);
//         modalContent.innerHTML = `
//             <div style="text-align:center; color:red; padding:2rem;">
//                 <p>Failed to load artist details.</p>
//             </div>`;
//     }
// }
async function showArtistProfile(walletAddr) {
  walletAddr = walletAddr.toLowerCase();
  const modal = document.getElementById("artistModal");
  const profileContainer = document.getElementById("artistProfile");

  if (!modal || !profileContainer) {
    console.error("❌ artist modal or profile container missing in HTML");
    return;
  }

  modal.style.display = "block";
  profileContainer.innerHTML = `
    <div style="text-align:center; padding:2rem;">
      <p>Loading artist details...</p>
    </div>
  `;

  try {
    // Step 1 — Try to load Firestore user data
    const userSnap = await getDoc(doc(db, "users", walletAddr));
    let userData = {};
    if (userSnap.exists()) {
      userData = userSnap.data();
    }

    // Step 2 — Try to supplement missing data from submittedArtworks
    const artistArts = submittedArtworks.filter(
      a => a.sellerId?.toLowerCase() === walletAddr
    );

    const username =
      userData.username ||
      artistArts[0]?.artist ||
      "Unknown Artist";

    const bio = userData.bio || "This artist has not added a bio yet.";
    const joined = userData.joinedAt
      ? new Date(userData.joinedAt).getFullYear()
      : "—";

    // Step 3 — Try to fetch artworks from Firestore (users/[wallet]/sellingArts)
    let artDocs = [];
    try {
      const sellingArtsRef = collection(db, "users", walletAddr.toLowerCase(), "sellingArts");
      const artSnap = await getDocs(sellingArtsRef);
      artSnap.forEach(docSnap => {
        artDocs.push({ id: docSnap.id, ...docSnap.data() });
      });
    } catch (e) {
      console.warn("⚠️ Could not load sellingArts, using submittedArtworks fallback", e);
    }

    // Step 4 — Fallback to submittedArtworks if Firestore collection is empty
    if (artDocs.length === 0 && artistArts.length > 0) {
      artDocs = artistArts;
    }

    // Step 5 — Generate artwork cards
    const artworksHTML =
      artDocs.length > 0
        ? artDocs.map(art => {
            const imageUrl = getImageUrl(art.imageUrl || "");
            const title = art.title || "Untitled";
            const price = art.price || "0.000";
            const category = art.category || "Uncategorized";
            const year = art.year || "—";
            const artId = art.id || "";

            return `
              <div class="portfolio-item" style="cursor:pointer;"
                  onclick="closeArtistModal(); showArtworkDetail('${artId}');">
                <img src="${imageUrl}" alt="${title}" loading="lazy"
                    style="width:160px; height:110px; object-fit:cover; border-radius:8px;">
                <div class="portfolio-item-meta" style="margin-top:6px; text-align:left;">
                  <strong style="font-size:0.95rem;">${title}</strong>
                  <div style="font-size:0.85rem; color:#666;">
                    ${category} • ${year} • ${price} tETH
                  </div>
                </div>
              </div>
            `;
          }).join("")
        : `<p style="margin-top:1rem;">No artworks available yet.</p>`;

    // Step 6 — Render the final modal content
    profileContainer.innerHTML = `
      <div class="artist-profile" style="padding:1rem 1.5rem;">
        <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1rem;">
          <div style="width:64px; height:64px; border-radius:12px; display:flex;
                      align-items:center; justify-content:center; background:#f3f4f6;
                      font-weight:700; font-size:1.4rem;">
            ${username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style="margin:0;">${username}</h2>
            <div style="color:#6b7280; font-size:0.95rem;">Joined ${joined}</div>
          </div>
        </div>

        <p class="artist-bio" style="color:#374151; margin-bottom:1rem;">${bio}</p>

        <h3 style="margin:0 0 0.5rem;">Portfolio</h3>
        <div class="artist-portfolio-grid" style="display:flex; gap:1rem; flex-wrap:wrap;">
          ${artworksHTML}
        </div>
      </div>
    `;
  } catch (error) {
    console.error("❌ Error loading artist profile:", error);
    profileContainer.innerHTML = `
      <div style="text-align:center; color:red; padding:2rem;">
        <p>Failed to load artist details.</p>
      </div>`;
  }
}


function closeArtistModal() {
    document.getElementById('artistModal').style.display = 'none';
}

// Blockchain Details Functions
function showBlockchainDetails(artworkId) {
    const artwork = [...submittedArtworks].find(item => item.id === artworkId); // , ...artworkData].find(item => item.id === artworkId);
    const blockchain = blockchainDetails[artworkId] || generateMockBlockchainData(artworkId);
    
    const modal = document.getElementById('blockchainModal');
    const detailContainer = document.getElementById('blockchainDetail');
    
    detailContainer.innerHTML = `
        <div class="blockchain-header">
            <h2><i class="fab fa-ethereum"></i> Blockchain Details</h2>
            <h3>${artwork.title}</h3>
        </div>
        
        <div class="blockchain-info">
            <div class="blockchain-section">
                <h4>Token Information</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Token ID:</label>
                        <span class="copyable" onclick="copyToClipboard('${blockchain.tokenId}')">${blockchain.tokenId}</span>
                    </div>
                    <div class="info-item">
                        <label>Contract Address:</label>
                        <span class="copyable" onclick="copyToClipboard('${blockchain.contractAddress}')">${blockchain.contractAddress}</span>
                    </div>
                    <div class="info-item">
                        <label>Chain:</label>
                        <span><i class="fab fa-ethereum"></i> ${blockchain.chain}</span>
                    </div>
                    <div class="info-item">
                        <label>Status:</label>
                        <span class="status-badge ${blockchain.status}">${blockchain.status.toUpperCase()}</span>
                    </div>
                </div>
            </div>
            
            <div class="blockchain-section">
                <h4>Price History</h4>
                <div class="price-chart">
                    ${blockchain.priceHistory.map(entry => `
                        <div class="price-entry">
                            <span class="price-date">${entry.date}</span>
                            <span class="price-amount">${entry.price} ETH</span>
                            <span class="price-event">${entry.event}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="blockchain-section">
                <h4>Ownership History</h4>
                <div class="ownership-history">
                    ${blockchain.ownershipHistory.map(entry => `
                        <div class="ownership-entry">
                            <span class="owner-address copyable" onclick="copyToClipboard('${entry.owner}')">${entry.owner}</span>
                            <span class="ownership-date">${entry.date}</span>
                            <span class="ownership-event">${entry.event}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeBlockchainModal() {
    document.getElementById('blockchainModal').style.display = 'none';
}

function generateMockBlockchainData(artworkId) {
    return {
        tokenId: `0x${artworkId.toString(16).padStart(16, '0')}`,
        contractAddress: "0x495f947276749Ce646f68AC8c248420045cb7b5e",
        chain: "Ethereum",
        status: Math.random() > 0.5 ? "new" : "resold",
        priceHistory: [
            { date: "2024-01-15", price: (Math.random() * 2 + 0.5).toFixed(3), event: "Minted" },
            { date: "2024-02-20", price: (Math.random() * 2 + 0.8).toFixed(3), event: "Price Update" }
        ],
        ownershipHistory: [
            { owner: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`, date: "2024-01-15", event: "Minted" }
        ]
    };
}

function getArtworkStatus(artworkId) {
    const blockchain = blockchainDetails[artworkId];
    return blockchain ? blockchain.status : 'new';
}

function getArtworkStatusText(artworkId) {
    const status = getArtworkStatus(artworkId);
    return status === 'new' ? 'Brand New' : 'Resold';
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success');
    });
}

// Admin Panel Functions
function updateAdminStats() {
    const totalArtworks = [...submittedArtworks].length;
    const totalArtists = new Set(submittedArtworks.map(a => (a.sellerId || '').toLowerCase())).size; 
    const totalVolume = [...submittedArtworks].reduce((sum, a) => sum + a.price, 0);
    const totalTransactions = Math.floor(Math.random() * 1000) + 500; // Mock data
    
    const elements = {
        totalArtworks: document.getElementById('totalArtworks'),
        totalArtists: document.getElementById('totalArtists'),
        totalVolume: document.getElementById('totalVolume'),
        totalTransactions: document.getElementById('totalTransactions')
    };
    
    if (elements.totalArtworks) elements.totalArtworks.textContent = totalArtworks;
    if (elements.totalArtists) elements.totalArtists.textContent = totalArtists;
    if (elements.totalVolume) elements.totalVolume.textContent = totalVolume.toFixed(1);
    if (elements.totalTransactions) elements.totalTransactions.textContent = totalTransactions;
}

function approveAllArtworks() {
    showToast('All pending artworks have been approved!', 'success');
    updateAdminStats();
}

function viewReports() {
    showToast('Opening reports dashboard...', 'info');
}

function exportData() {
    const data = {
        artworks: [...artworkData, ...submittedArtworks],
        artists: artistProfiles,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'artconnect-data-export.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

function viewAllUsers() {
    showToast('Opening user management panel...', 'info');
}

function viewTransactions() {
    showToast('Loading transaction history...', 'info');
}




let currentUser = null;
const USERNAME_COOLDOWN = 0; //60 * 24 * 60 * 60 * 1000; // 60 days

async function loadUserProfileFromDB(walletAddr) {
    if (!walletAddr) {
        console.warn("No wallet connected yet.");
        return;
    }

    try {
        const userRef = doc(db, "users", walletAddr.toLowerCase());
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
            currentUser = snapshot.data();

            if (!currentUser.username) {
                await setDoc(userRef, {
                    ...currentUser,
                    username: "New User",
                    lastUsernameUpdate: 0
                }, { merge: true });

                currentUser.username = "New User";
                currentUser.lastUsernameUpdate = 0;
            }
        } else {
            currentUser = {
                walletAddress: walletAddr,
                joinedAt: new Date().toISOString(),
                username: "New User",
                lastUsernameUpdate: 0
            };
            await setDoc(userRef, currentUser);
        }

        renderUserProfile();

    } catch (err) {
        console.error("Error loading profile:", err);
        showToast("Failed to load profile", "error");
    }

    // ✅ NEW: Ensure wallet connection is recognized after refresh
    onWalletReady((address) => {
        console.log("Wallet ready inside loadUserProfileFromDB:", address);

        // Reload profile only when wallet becomes ready again
        if (address && address.toLowerCase() !== walletAddr.toLowerCase()) {
            loadUserProfileFromDB(address);
        }
    });
}



function enableUsernameEdit() {
    if (!walletConnected || !currentUser) {
        showToast("Please connect your wallet first", "error");
        return;
    }

    const now = Date.now();
    const lastEdit = currentUser.lastUsernameUpdate || 0;

    if (now - lastEdit < USERNAME_COOLDOWN) {
        const remaining = Math.ceil((USERNAME_COOLDOWN - (now - lastEdit)) / (24 * 60 * 60 * 1000));
        showToast(`⏳ You can edit your username again in ${remaining} day(s).`, "warning");
        return;
    }

    // Cooldown expired → allow editing
    document.getElementById("usernameEdit").style.display = "block";
    document.getElementById("editNameBtn").style.display = "none";
    document.getElementById("usernameInput").value = currentUser.username || "";
}


// async function saveUsername() {
//     if (!walletConnected || !currentUser) {
//         showToast("Wallet not connected", "error");
//         return;
//     }

//     const newName = document.getElementById("usernameInput").value.trim();
//     if (!newName) {
//         showToast("Username cannot be empty", "error");
//         return;
//     }

//     const now = Date.now();

//     try {
//         const userRef = doc(db, "users", walletAddress.toLowerCase());
//         await setDoc(userRef, {
//             //...currentUser,
//             username: newName,
//             lastUsernameUpdate: now
//         }, { merge: true });

//         currentUser.username = newName;
//         currentUser.lastUsernameUpdate = now;

//         const sellingArtsRef = collection(db, "users", walletAddress.toLowerCase(), "sellingArts");
//         const sellingSnap = await getDocs(sellingArtsRef);

//         for (const docSnap of sellingSnap.docs) {
//             const artRef = doc(db, "users", walletAddress.toLowerCase(), "sellingArts", docSnap.id);
//             await updateDoc(artRef, { artist: newName });

//             const globalArtRef = doc(db, "artworks", docSnap.id);
//             const globalSnap = await getDoc(globalArtRef);
//             if (globalSnap.exists() && globalSnap.data().sellerId?.toLowerCase() === walletAddress.toLowerCase()) {
//                 await updateDoc(globalArtRef, { artist: newName });
//             }
//         }

//         document.getElementById("profileName").textContent = newName;
//         document.getElementById("usernameEdit").style.display = "none";
//         document.getElementById("editNameBtn").style.display = "inline-block";

//         showToast("Username updated successfully!", "success");

//         if (typeof loadFeaturedArtists === "function") {
//             loadFeaturedArtists();
//         }
//     } catch (error) {
//         console.error("Failed to update username:", error);
//         showToast("Error updating username", "error");
//     }
// }

function renderUserProfile() {
  if (!currentUser) return;

  // Display username and wallet
  document.getElementById("profileName").textContent =
    currentUser.username || "New User";
  document.getElementById("profileWallet").textContent =
    `Wallet: ${walletAddress || "Not Connected"}`;

  // Display bio (if element exists)
  const bioEl = document.getElementById("profileBio");
  if (bioEl) {
    bioEl.textContent = currentUser.bio || "No bio yet.";
  }

  // Pre-fill artist name on upload form
  const artistInput = document.getElementById("artistName");
  if (artistInput) {
    artistInput.value = currentUser.username || "Unnamed Artist";
  }

  // Optional cooldown check for username edits
  if (typeof checkUsernameCooldown === "function") {
    checkUsernameCooldown();
  }

  // Load user's artworks & purchases
  if (walletAddress) {
    loadUserArtworksLive(walletAddress);
    loadUserPurchasesLive(walletAddress);
  }

  // ✅ NEW: ensure wallet data is properly recognized after refresh
  onWalletReady((address) => {
    console.log("Wallet ready inside renderUserProfile:", address);
    document.getElementById("profileWallet").textContent = `Wallet: ${address}`;

    // Reload wallet-dependent data once the wallet reconnects
    loadUserArtworksLive(address);
    loadUserPurchasesLive(address);
  });
}





// function enableUsernameEdit() {
//     if (!walletConnected) {
//         showToast("Please connect your wallet first", "error");
//         return;
//     }

//     const canEdit = checkUsernameCooldown();
//     if (!canEdit) {
//         // Extra toast when user tries before cooldown expires
//         const lastUpdate = currentUser.lastUsernameUpdate || 0;
//         const elapsed = Date.now() - lastUpdate;
//         const remaining = USERNAME_COOLDOWN - elapsed;
//         const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));

//         showToast(`⏳ You can't change your username yet. Please wait ${daysLeft} day(s).`, "warning");
//         return;
//     }

//     document.getElementById("usernameEdit").style.display = "flex";
//     document.getElementById("editNameBtn").style.display = "none";
//     document.getElementById("usernameInput").value = currentUser.username;
// }



async function saveUsername() {
    if (!walletConnected || !currentUser) {
        showToast("Wallet not connected", "error");
        return;
    }

    const newName = document.getElementById("usernameInput").value.trim();
    if (!newName) {
        showToast("Username cannot be empty", "error");
        return;
    }

    const now = Date.now();
    const lowerWallet = walletAddress.toLowerCase();

    try {
        const userRef = doc(db, "users", lowerWallet);


        await setDoc(userRef, {
            username: newName,
            lastUsernameUpdate: now
        }, { merge: true });

        currentUser.username = newName;
        currentUser.lastUsernameUpdate = now;


        const sellingArtsRef = collection(db, "users", lowerWallet, "sellingArts");
        const sellingSnap = await getDocs(sellingArtsRef);

        for (const docSnap of sellingSnap.docs) {
            const artData = docSnap.data();
            const sellerId = artData.sellerId?.toLowerCase();

            // Only update if sellerId matches AND the artwork is NOT a resale
            if (sellerId === lowerWallet && artData.resale !== true) {
                // Update artist name in user's sellingArts subcollection
                const userArtRef = doc(db, "users", lowerWallet, "sellingArts", docSnap.id);
                await updateDoc(userArtRef, { artist: newName });

                // Update artist name in global artworks collection (only if original)
                const globalArtRef = doc(db, "artworks", docSnap.id);
                const globalSnap = await getDoc(globalArtRef);
                if (globalSnap.exists() && 
                    globalSnap.data().sellerId?.toLowerCase() === lowerWallet &&
                    globalSnap.data().resale !== true) {
                    await updateDoc(globalArtRef, { artist: newName });
                }
            }
        }

        document.getElementById("profileName").textContent = newName;
        document.getElementById("usernameEdit").style.display = "none";
        document.getElementById("editNameBtn").style.display = "inline-block";


        if (typeof loadFeaturedArtists === "function") {
            await loadFeaturedArtists();
        }
        else if (typeof loadArtists === "function") {
            await loadArtists();
        }

        showToast("Username and linked artworks updated successfully!", "success");
    } catch (error) {
        console.error("Failed to update username:", error);
        showToast("Error updating username", "error");
    }
}



function enableBioEdit() {
  const now = Date.now();
  const lastEdit = currentUser?.lastBioEdit || 0;
  const sixtyDays = 60 * 24 * 60 * 60 * 1000;

  if (now - lastEdit < sixtyDays) {
    const remaining = Math.ceil((sixtyDays - (now - lastEdit)) / (24 * 60 * 60 * 1000));
    showToast(`⏳ You can edit your bio again in ${remaining} day(s).`, "warning");
    return;
  }

  // Cooldown expired → show textarea
  document.getElementById("bioEdit").style.display = "block";

  // Pre-fill existing bio
  document.getElementById("bioInput").value = currentUser.bio || "";
}

async function saveBio() {
    if (!walletConnected || !currentUser) {
        showToast("Wallet not connected", "error");
        return;
    }

    const input = document.getElementById("bioInput");
    const newBio = input.value.trim();
    if (!newBio) {
        showToast("Please enter your bio.", "warning");
        return;
    }

    const now = Date.now();

    try {
        const userRef = doc(db, "users", walletAddress.toLowerCase());

        // Save new bio and update timestamp
        await setDoc(userRef, {
            bio: newBio,
            lastBioEdit: now
        }, { merge: true });

        // Update currentUser locally
        currentUser.bio = newBio;
        currentUser.lastBioEdit = now;

        // Update displayed text
        document.getElementById("profileBio").textContent = newBio;
        document.getElementById("bioEdit").style.display = "none";
        document.getElementById("editBioBtn").style.display = "inline-block";

        // Toast confirmation
        showToast("Bio updated successfully!", "success");

        // Refresh Featured Artists section if it exists
        if (typeof loadFeaturedArtists === "function") {
            loadFeaturedArtists();
        }

    } catch (err) {
        console.error("Error updating bio:", err);
        showToast("Failed to update bio.", "error");
    }
}


async function loadFeaturedArtists() {
    const container = document.getElementById("featuredArtistsContainer");
    if (!container) return;

    container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding:2rem;">
            <p>Loading artists...</p>
        </div>
    `;

    try {
        const usersRef = collection(db, "users");
        const usersSnap = await getDocs(usersRef);

        if (usersSnap.empty) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align:center; padding:2rem;">
                    <p>No artists found yet.</p>
                </div>`;
            return;
        }

        const artists = [];

        // Loop through each user (wallet)
        for (const userDoc of usersSnap.docs) {
            const walletAddr = userDoc.id;
            const userData = userDoc.data();

            const username = userData.username || "New User";
            const bio = userData.bio || "This artist has not added a bio yet.";
            const joinedDate = userData.joinedAt
                ? new Date(userData.joinedAt).getFullYear()
                : "—";

            // Get all their selling artworks
            const sellingArtsRef = collection(db, "users", walletAddr, "sellingArts");
            const artSnap = await getDocs(sellingArtsRef);

            const artCount = artSnap.size;
            let totalSales = 0;

            artSnap.forEach(doc => {
                const data = doc.data();
                totalSales += parseFloat(data.price || 0);
            });

            if (artCount > 0) {
                artists.push({
                    walletAddr,
                    username,
                    bio,
                    joinedDate,
                    artCount,
                    totalSales
                });
            }
        }

        // Sort: most artworks first
        artists.sort((a, b) => b.artCount - a.artCount);

        container.innerHTML = artists.map(artist => `
            <div class="artist-card" onclick="showArtistProfile('${artist.walletAddr}')">
                <div class="artist-header">
                    <h3>${artist.username}</h3>
                    <small class="wallet-display">${artist.walletAddr.slice(0, 6)}...${artist.walletAddr.slice(-4)}</small>
                </div>
                <p>${artist.bio}</p>
                <div class="artist-meta">
                    <small>${artist.artCount} Artworks</small>
                    <small>${artist.totalSales.toFixed(2)} tETH Sales</small>
                    <small>${artist.joinedDate} Joined</small>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Error loading featured artists:", error);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align:center; color:red; padding:2rem;">
                <p>Failed to load featured artists.</p>
            </div>`;
    }
}


function loadUserArtworksLive(walletAddr) {
  if (!walletAddr) return;
  const container = document.getElementById("userArtworks");
  container.innerHTML = "<p>Loading live data...</p>";

  try {
    const sellingRef = collection(window.db, "users", walletAddr, "sellingArts");
    console.log("👀 Listening to live updates for:", walletAddr);

    // 🔥 Firestore onSnapshot — listens for real-time updates
    onSnapshot(sellingRef, (snapshot) => {
      if (snapshot.empty) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding: 3rem;">
            <h3>No artworks submitted yet.</h3>
            <p>Upload new artworks to see them here.</p>
          </div>`;
        return;
      }

      container.innerHTML = "";
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const art = data.artwork ? data.artwork : data;
        art.id = docSnap.id;
        art.sellerId = data.sellerId || art.sellerId || walletAddr;

        container.innerHTML += `
          <div class="artwork-card">
              <div class="artwork-image">
                  <img src="${getImageUrl(art.imageUrl)}" alt="${art.title || "Untitled"}" loading="lazy">
              </div>
              <div class="artwork-info">
                  <h3>${art.title || "Untitled"}</h3>
                  <p>by ${art.artist || "Unknown Artist"}</p>
                  <p>${art.category || "Uncategorized"} • ${art.year || "—"}</p>
                  <p>${art.description || "No description"}</p>
                  <div class="artwork-footer">
                      <span class="artwork-price">${art.price || "0.000"} tETH</span>
                  </div>
                  <div class="artwork-actions">
                      <button class="btn-secondary" onclick="viewArtworkDetails('${art.id}', 'submissions')">
                          <i class="fas fa-eye"></i> View Details
                      </button>
                  </div>
              </div>
          </div>`;
      });
    });

    console.log("✅ Real-time listener active for user artworks:", walletAddr);

  } catch (err) {
    console.error("❌ Real-time user artworks failed:", err);
    container.innerHTML = "<p style='color:red;'>Error loading artworks live.</p>";
  }
}


function loadUserPurchasesLive(walletAddr) {
  if (!walletAddr) return;

  const container = document.getElementById("userPurchases");
  container.innerHTML = "<p>Loading your purchases...</p>";

  try {
    console.log("💸 Setting up real-time listener for user purchases:", walletAddr);

    // ✅ Always use window.db to ensure you’re referencing the global Firestore instance
    const userPurchasesRef = collection(window.db, "users", walletAddr.toLowerCase(), "artBought");

    // 🔁 Real-time listener
    onSnapshot(userPurchasesRef, (snapshot) => {
      if (snapshot.empty) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding: 3rem;">
              <h3>No purchased artworks yet</h3>
              <p>Buy from the gallery to see them here!</p>
          </div>`;
        return;
      }

      const purchasedArts = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const art = data.artwork ? data.artwork : data;
        purchasedArts.push({ id: docSnap.id, ...art });
      });

      // 🖼️ Render artworks exactly like your original version
      container.innerHTML = purchasedArts.map(art => `
        <div class="artwork-card">
          <div class="artwork-image">
            <img src="${getImageUrl(art.imageUrl)}" alt="${art.title || "Untitled"}" loading="lazy">
          </div>
          <div class="artwork-info">
            <div class="artwork-header">
              <h3 class="artwork-title">${art.title || "Untitled"}</h3>
            </div>
            <p class="artwork-artist">by ${art.artist || "Unknown Artist"}</p>
            <p class="artwork-meta">${art.category || "Uncategorized"} • ${art.year || "—"}</p>
            <p class="artwork-description">${art.description || "No description available."}</p>
            <div class="artwork-footer">
              <span class="artwork-price">${art.price || "0.000"} tETH</span>
            </div>
            <div class="artwork-actions">
              <button class="btn-primary" onclick="openResellModal('${art.id}', '${art.title}', ${art.price || 0})">
                <i class="fas fa-sync-alt"></i> Resell
              </button>
              <button class="btn-secondary" onclick="viewArtworkDetails('${art.id}', 'purchases')">
                <i class="fas fa-eye"></i> View Details
              </button>
            </div>
          </div>
        </div>
      `).join('');

      console.log(`✅ Live purchases updated: ${purchasedArts.length} items`);
    });

  } catch (err) {
    console.error("❌ Failed to set up real-time purchase listener:", err);
    container.innerHTML = "<p style='color:red;'>Error loading purchases.</p>";
  }
}


function renderArtworkCard(art) {
    return `
    <div class="artwork-card">
        <div class="artwork-image">
            <img src="${art.imageUrl}" alt="${art.title}">
        </div>
        <div class="artwork-info">
            <h3 class="artwork-title">${art.title}</h3>
            <p class="artwork-artist">by ${art.artist || "Unknown Artist"}</p>
            <p class="artwork-meta">${art.category || "Uncategorized"} • ${art.year || ""}</p>
            <p class="artwork-description">${art.description || ""}</p>
            <p class="artwork-price">${art.price} ETH</p>
        </div>
    </div>`;
}


let selectedResellArtId = null;

function openResellModal(artId, artTitle, currentPrice = 0) {
    selectedResellArtId = artId;
    document.getElementById("resellArtTitle").textContent = `Reselling: ${artTitle}`;
    document.getElementById("resellPrice").value = currentPrice || 0.001; // Auto-fill current price
    document.getElementById("resellModal").style.display = "flex";
}

// Close modal
function closeResellModal() {
    document.getElementById("resellModal").style.display = "none";
    selectedResellArtId = null;
}

// Confirm resale
async function confirmResell() {
    const newPrice = parseFloat(document.getElementById("resellPrice").value);
    if (isNaN(newPrice) || newPrice <= 0) {
        showToast("Please enter a valid price", "error");
        return;
    }

    await resellArtwork(selectedResellArtId, newPrice);
    closeResellModal();
}


async function resellArtwork(artId, newPrice) {
    if (!walletConnected || !walletAddress) {
        showToast("Please connect your wallet first.", "error");
        return;
    }
    
    try {
        showLoading();
        showLoadingText("Preparing your artwork for resale...");

        const artRef = doc(db, "users", walletAddress.toLowerCase(), "artBought", String(artId));
        const snapshot = await getDoc(artRef);

        if (!snapshot.exists()) {
            hideLoading();
            showToast("Artwork not found in your purchases", "error");
            return;
        }

        const artData = snapshot.data();
        const today = new Date().toISOString().split("T")[0];
        const parsedPrice = parseFloat(newPrice);

        const newPriceEvent = {
            price: parsedPrice,
            date: today,
            event: "Relisted",
        };

        const updatedPriceHistory = Array.isArray(artData.price_history)
        ? [...artData.price_history, newPriceEvent]
        : [newPriceEvent];


        // Build new resale record
        const relistedArt = {
            id: artData.artwork.id,
            title: artData.artwork.title,
            artist: artData.artwork.artist,
            description: artData.artwork.description,
            category: artData.artwork.category,
            dimension: artData.artwork.dimension || "N/A",
            imageUrl: artData.artwork.imageUrl,
            year: artData.artwork.year || "",
            price: parsedPrice,
            resale: true,
            inStock: true,
            sellerId: walletAddress.toLowerCase(),
            original_owner: artData.original_owner || walletAddress.toLowerCase(),
            current_owner: walletAddress.toLowerCase(),
            owner_history: artData.owner_history || [],
            price_history: updatedPriceHistory,
            timestamp: new Date().toISOString(),
        };

        // Save to user's sellingArts
        await setDoc(doc(db, "users", walletAddress.toLowerCase(), "sellingArts", String(artId)), relistedArt);

        // Save to global artworks
        await setDoc(doc(db, "artworks", String(artId)), relistedArt);

        // Remove from user's artBought
        await deleteDoc(artRef);

        showToast("Artwork listed for resale!", "success");

        // Update UI instantly
        loadUserPurchasesLive(); // refresh purchased list
        loadUserArtworksLive();   // refresh selling list
        loadArtworksLive();
        hideLoading();

    } catch (error) {
        console.error("Resell failed:", error);
        showToast("Resell failed: " + error.message, "error");
    }
}

async function viewArtworkDetails(artId, source) {
    try {
        let docRef;

        if (source === "submissions") {
            docRef = doc(db, "users", walletAddress.toLowerCase(), "sellingArts", artId);
        } 
        else if (source === "purchases") {
            docRef = doc(db, "users", walletAddress.toLowerCase(), "artBought", artId);
        } 
        else if (source === "gallery") {
            docRef = doc(db, "artworks", artId);
        } 
        else {
            console.error("Invalid source for viewArtworkDetails:", source);
            return;
        }

        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            showToast("Artwork details not found.", "error");
            return;
        }

        const art = docSnap.data().artwork || docSnap.data();

        // Populate modal
        document.getElementById("detailsImage").src = getImageUrl(art.imageUrl);
        document.getElementById("detailsTitle").textContent = art.title || "Untitled";
        document.getElementById("detailsArtist").textContent = art.artist || "Unknown Artist";
        document.getElementById("detailsDescription").textContent = art.description || "No description available";
        document.getElementById("detailsCategory").textContent = art.category || "Uncategorized";
        document.getElementById("detailsYear").textContent = art.year || "—";
        document.getElementById("detailsDimensions").textContent = art.dimensions || "—";
        document.getElementById("detailsPrice").textContent = `${art.price || "0.000"} tETH`;

        // Show modal
        document.getElementById("artDetailsModal").style.display = "flex";

    } catch (error) {
        console.error("Error viewing artwork details:", error);
        showToast("Failed to load artwork details.", "error");
    }
}

function openDetailsModal() {
  const modal = document.getElementById("artDetailsModal");
  modal.style.display = "flex";
}

function closeDetailsModal() {
  const modal = document.getElementById("artDetailsModal");
  modal.style.display = "none";
}

window.addEventListener("click", (event) => {
  const modal = document.getElementById("artDetailsModal");
  const content = document.getElementById("artDetailsContent");
  
  if (modal.style.display === "flex" && !content.contains(event.target)) {
    closeDetailsModal();
  }
});


function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'flex';
    showLoadingText("Processing your transaction...");
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showLoadingText(text) {
    const textElem = document.querySelector('.loading-text');
    if (textElem) textElem.textContent = text;
}
function onWalletReady(callback) {
    if (window.ethereum && window.ethereum.selectedAddress) {
        callback(window.ethereum.selectedAddress);
    } else {
        window.addEventListener('wallet_ready', () => {
            callback(window.ethereum.selectedAddress);
        });
    }
}
function waitForFirebase() {
  return new Promise(resolve => {
    const check = () => {
      if (window.db) resolve(window.db);
      else setTimeout(check, 100);
    };
    check();
  });
}
function renderUserPurchases(purchases) {
    const purchasesGrid = document.getElementById('userPurchases');
    if (!purchasesGrid) return;

    if (!Array.isArray(purchases)) purchases = [];
    
    purchasesGrid.innerHTML = purchases.map(p => `
        <div class="art-card">
            <img src="${p.image || ''}" alt="${p.title || 'Untitled'}">
            <h3>${p.title || 'Untitled'}</h3>
            <p>${p.artist || 'Unknown'}</p>
            <p>${p.price ? p.price + ' ETH' : ''}</p>
        </div>
    `).join('');
}



// script.js
window.connectWallet = connectWallet;
window.disconnectWallet = disconnectWallet;
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.showSection = showSection;
window.loadArtworksLive = loadArtworksLive;
window.filterArtworks = filterArtworks;
window.submitArtwork = submitArtwork;
window.approveAllArtworks = approveAllArtworks;
window.viewReports = viewReports;
window.exportData = exportData;
window.viewAllUsers = viewAllUsers;
window.viewTransactions = viewTransactions;
window.enableUsernameEdit = enableUsernameEdit;
window.saveUsername = saveUsername;
window.enableBioEdit = enableBioEdit;
window.saveBio = saveBio;
window.showArtworkDetail = showArtworkDetail;
window.closeArtworkModal = closeArtworkModal;
window.showArtistProfile = showArtistProfile;
window.closeResellModal = closeResellModal;
window.confirmResell = confirmResell;
window.closeBlockchainModal = closeBlockchainModal;
window.closeDetailsModal = closeDetailsModal;
window.closeArtistModal = closeArtistModal;
window.viewArtworkDetails = viewArtworkDetails;
window.openResellModal = openResellModal;
window.resellArtwork = resellArtwork;
window.loadUserPurchasesLive = loadUserPurchasesLive;
window.loadUserArtworksLive = loadUserArtworksLive;
window.hideLoading = hideLoading;
window.buyArtworkFromModal = buyArtworkFromModal;

// Make sure all functions are defined above this line
document.addEventListener("DOMContentLoaded", () => {
  Object.assign(window, {
    connectWallet,
    disconnectWallet,
    toggleCart,
    addToCart,
    removeFromCart,
    clearCart,
    checkout,
    showSection,
    loadArtworksLive,
    filterArtworks,
    submitArtwork,
    approveAllArtworks,
    viewReports,
    exportData,
    viewAllUsers,
    viewTransactions,
    enableUsernameEdit,
    saveUsername,
    enableBioEdit,
    saveBio,
    showArtworkDetail,
    closeArtworkModal,
    showArtistProfile,
    closeResellModal,
    confirmResell,
    closeBlockchainModal,
    closeDetailsModal,
    closeArtistModal,
    viewArtworkDetails,
    openResellModal,
    resellArtwork,
    loadUserPurchasesLive,
    loadUserArtworksLive,
    hideLoading,
    buyArtworkFromModal,
  });
});
































