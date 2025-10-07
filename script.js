// Sample artwork data
// const artworkData = [
//     {
//         id: 1,
//         title: "Ethereal Dreams",
//         artist: "Maya Chen",
//         description: "A mesmerizing blend of digital artistry and traditional painting techniques, exploring the boundaries between reality and dreams.",
//         price: 0.85,
//         imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=400&fit=crop",
//         category: "Abstract",
//         dimensions: "24\" x 36\"",
//         year: 2024,
//         inStock: true
//     },
//     {
//         id: 2,
//         title: "Urban Solitude",
//         artist: "Marcus Rodriguez",
//         description: "A powerful commentary on modern city life, capturing the isolation within the bustling urban landscape.",
//         price: 1.2,
//         imageUrl: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=500&h=400&fit=crop",
//         category: "Urban",
//         dimensions: "30\" x 40\"",
//         year: 2023,
//         inStock: true
//     },
//     {
//         id: 3,
//         title: "Mystic Waters",
//         artist: "Elena Kowalski",
//         description: "An enchanting seascape that transports viewers to a mystical underwater realm filled with wonder and tranquility.",
//         price: 0.95,
//         imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=400&fit=crop",
//         category: "Seascape",
//         dimensions: "28\" x 22\"",
//         year: 2024,
//         inStock: false
//     },
//     {
//         id: 4,
//         title: "Golden Hour Valley",
//         artist: "James Thompson",
//         description: "A breathtaking landscape capturing the magical moment when golden sunlight bathes a serene valley in warm hues.",
//         price: 0.75,
//         imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop",
//         category: "Landscape",
//         dimensions: "32\" x 24\"",
//         year: 2023,
//         inStock: true
//     },
//     {
//         id: 5,
//         title: "Digital Renaissance",
//         artist: "Aria Nakamura",
//         description: "A modern interpretation of classical portraiture, blending Renaissance techniques with contemporary digital art.",
//         price: 1.5,
//         imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop",
//         category: "Portrait",
//         dimensions: "20\" x 24\"",
//         year: 2024,
//         inStock: true
//     },
//     {
//         id: 6,
//         title: "Neon Nights",
//         artist: "Alex Rivera",
//         description: "A vibrant exploration of cyberpunk aesthetics, featuring neon-lit cityscapes and futuristic architecture.",
//         price: 1.1,
//         imageUrl: "/images/cyberpunk.jpg",
//         category: "Abstract",
//         dimensions: "36\" x 24\"",
//         year: 2024,
//         inStock: true
//     }
// ];

// Global state
let currentArtworks = [];//...artworkData];
let cart = JSON.parse(localStorage.getItem('artconnect_cart') || '[]');
let walletConnected = false;
let walletAddress = null;
let submittedArtworks = JSON.parse(localStorage.getItem('user_submitted_artwork') || '[]');
let isAdmin = false;

// Artist profiles data
// const artistProfiles = [
//     {
//         id: 1,
//         name: "Maya Chen",
//         avatar: "MC",
//         bio: "Digital artist specializing in surreal landscapes and abstract compositions. My work explores the intersection of nature and technology.",
//         artworkCount: 12,
//         totalSales: 45.2,
//         joinDate: "2023",
//         portfolio: [1] // artwork IDs
//     },
//     {
//         id: 2,
//         name: "Marcus Rodriguez",
//         avatar: "MR",
//         bio: "Contemporary artist focused on urban culture and street art. Each piece tells a story of modern city life.",
//         artworkCount: 8,
//         totalSales: 32.1,
//         joinDate: "2023",
//         portfolio: [2] // artwork IDs
//     },
//     {
//         id: 3,
//         name: "Elena Kowalski",
//         avatar: "EK",
//         bio: "Fine art photographer turned digital creator. I capture moments and transform them into timeless NFT artworks.",
//         artworkCount: 15,
//         totalSales: 67.8,
//         joinDate: "2022",
//         portfolio: [3] // artwork IDs
//     },
//     {
//         id: 4,
//         name: "James Thompson",
//         avatar: "JT",
//         bio: "Landscape photographer and digital artist capturing the beauty of natural environments.",
//         artworkCount: 10,
//         totalSales: 28.5,
//         joinDate: "2023",
//         portfolio: [4] // artwork IDs
//     },
//     {
//         id: 5,
//         name: "Aria Nakamura",
//         avatar: "AN",
//         bio: "Modern interpretation artist blending Renaissance techniques with contemporary digital art.",
//         artworkCount: 18,
//         totalSales: 52.3,
//         joinDate: "2022",
//         portfolio: [5] // artwork IDs
//     },
//     {
//         id: 6,
//         name: "Alex Rivera",
//         avatar: "AR",
//         bio: "Cyberpunk and futuristic digital artist exploring neon-lit cityscapes and advanced technology themes.",
//         artworkCount: 14,
//         totalSales: 41.7,
//         joinDate: "2023",
//         portfolio: [6] // artwork IDs
//     }
// ];

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


// Web3 and MetaMask functionality & add in db 
async function connectWallet() { 
    if (typeof window.ethereum === 'undefined') { 
        showToast('Please install MetaMask to use this feature', 'error'); 
        return; 
    } 
    
    try { 
        // Check if connected to Ethereum network 
        const chainId = await window.ethereum.request({ method: 'eth_chainId' }); 
        
        // Ethereum Mainnet: 0x1, Goerli: 0x5, Sepolia: 0xaa36a7 
        const allowedChains = ['0x1', '0x5', '0xaa36a7'];
        
        if (!allowedChains.includes(chainId)) { 
            showToast('Please switch to Sepolia network in MetaMask', 'error'); 
            try { 
                // Request to switch to Ethereum mainnet 
                await window.ethereum.request({ 
                    method: 'wallet_switchEthereumChain', 
                    params: [{ chainId: '0xaa36a7' }] 
                }); 
            } catch (switchError) { 
                console.error('Failed to switch network:', switchError); 
                showToast('Please manually switch to Ethereum network in MetaMask', 'error'); 
                return; 
            } 
        } 
        
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        }); 
        
        if (accounts.length > 0) { 
            // Validate that it's an Ethereum address 
            if (!isValidEthereumAddress(accounts[0])) { 
                showToast('Invalid Ethereum address detected', 'error'); 
                return; 
            } 
            
            walletAddress = accounts[0]; 
            walletConnected = true; 
            updateWalletUI(); 

            await loadUserProfileFromDB(walletAddress);

            showToast('Wallet connected successfully!', 'success'); 
            
            // Listen for account changes 
            window.ethereum.on('accountsChanged', handleAccountsChanged); 
            window.ethereum.on('chainChanged', handleChainChanged); 

            // calls function to save user info in db 
            await saveUserToFirestore(walletAddress); 
        } 
    } catch (error) { 
        console.error('Failed to connect wallet:', error); 
        if (error.code === 4001) { 
            showToast('Connection rejected by user', 'error'); 
        } else { 
            showToast('Failed to connect Ethereum wallet', 'error'); 
        } 
    } 
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


function updateWalletUI() {
    const walletBtn = document.getElementById('walletBtn');
    const walletWarning = document.getElementById('walletWarning');
    
    if (walletConnected) {
        walletBtn.innerHTML = `<i class="fas fa-wallet"></i> ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
        walletBtn.classList.add('connected');
        walletBtn.title = `Connected to Ethereum: ${walletAddress}`;
        if (walletWarning) walletWarning.style.display = 'none';
    } else {
        walletBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
        walletBtn.classList.remove('connected');
        walletBtn.title = 'Connect your Ethereum wallet via MetaMask'
        if (walletWarning) walletWarning.style.display = 'block';
    }
}

// async function sendPayment(toAddress, amount) {
//     if (!walletConnected) throw new Error('Wallet not connected');

//     try {
//         const amountInWei = (amount * 1e18).toString(16); //BigInt(Math.floor(amount * 1e18)).toString(16);

//         const txHash = await window.ethereum.request({
//             method: 'eth_sendTransaction',
//             params: [{
//                 from: walletAddress,
//                 to: toAddress,
//                 value: "0x" + amountInWei
//             }]
//         });

//         // Wait for confirmation using Etherscan or provider
//         return txHash;

//     } catch (error) {
//         if (error.code === 4001) throw new Error('Transaction rejected by user');
//         throw error;
//     }
// }

async function sendPayment(toAddress, amount) {
    if (!walletConnected) throw new Error('Wallet not connected');

    // Get current chain ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });

    // Allow only Sepolia (0xaa36a7)
    if (chainId !== '0xaa36a7') {
        throw new Error('Please switch your MetaMask network to Sepolia before making payments');
    }

    try {
        // Convert ETH → Wei (hex)
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

        return txHash;
    } catch (error) {
        if (error.code === 4001) throw new Error('Transaction rejected by user');
        throw error;
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
    loadArtworks();
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

// Artwork functionality
async function loadArtworks() {
    try {
        // Fetch artworks from Firestore
        const snapshot = await getDocs(collection(db, "artworks"));

        submittedArtworks = []; // reset before reloading
        snapshot.forEach(docSnap => {
            const art = docSnap.data();
            // Ensure each doc has an id (use Firestore's id if not present)
            submittedArtworks.push({
                id: art.id || docSnap.id,
                ...art
            });
        });

        // Save to localStorage for offline support
        localStorage.setItem('user_submitted_artwork', JSON.stringify(submittedArtworks));

        // Merge static demo + db artworks (optional)
        //const combinedArtworks = [...artworkData, ...submittedArtworks];
        //currentArtworks = combinedArtworks;

        // If you want ONLY db artworks, comment out the line above and use this:
        currentArtworks = submittedArtworks;

        renderArtworks(currentArtworks);

    } catch (error) {
        console.error("Error loading artworks:", error);
        showToast("Failed to load artworks from server", "error");
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
                    <button class="btn btn-secondary" onclick="showArtworkDetail(${artwork.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary add-to-basket-btn" onclick="addToCart(${artwork.id})" ${!artwork.inStock ? 'disabled' : ''}>
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
    const artwork = [...submittedArtworks].find(item => item.id === artworkId); // , ...artworkData].find(item => item.id === artworkId);
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
                <span>${artwork.dimensions}</span>
            </div>
            <p class="artwork-detail-description">${artwork.description}</p>
            <div class="artwork-status-detail">
                <span class="status-badge ${getArtworkStatus(artwork.id)}">${getArtworkStatusText(artwork.id)}</span>
            </div>
            <div class="artwork-detail-footer">
                <span class="artwork-detail-price">${artwork.price} tETH</span>
                <div class="detail-actions">
                    <button class="btn btn-secondary" onclick="showArtistProfile('${artwork.artist}')">
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
<file_name>script.js</file_name>
<to_replace>                <div class="cart-actions">
                    <button class="btn-secondary" onclick="clearCart()">Clear Cart</button>
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
    const artwork = [...submittedArtworks].find(item => item.id === artworkId); // , ...artworkData].find(item => item.id === artworkId);
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
            quantity: 1
        });
    }
    
    saveCart();
    updateCartUI();
    showToast('Added to cart successfully!', 'success');
}

function removeFromCart(artworkId) {
    cart = cart.filter(item => item.id !== artworkId);
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
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; color: #94a3b8;"></i>
                <h3>Your cart is empty</h3>
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
                <p class="cart-item-price">${item.price} tETH</p>
            </div>
            <div class="cart-item-actions">
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// async function checkout() {
//     if (cart.length === 0) {
//         showToast('Your cart is empty', 'error');
//         return;
//     }

//     if (!walletConnected || !walletAddress) {
//         showToast('Please connect your MetaMask wallet first', 'error');
//         return;
//     }

//     const platformWallet = '0xcE9D5CC73015c2b5c0A2b83af210cA53117AE430'; // default platform wallet

//     try {
//         showToast('Processing payment...', 'warning');

//         for (let item of cart) {
//             if (!item.sellerId || item.sellerId === "unknown") {
//                 console.warn(`Missing sellerId for artwork: ${item.title}`);
//                 continue;
//             }

//             const timestamp = new Date();
//             const totalPrice = item.price * item.quantity;

//             // Split: 90% seller, 10% platform
//             const sellerAmount = totalPrice * 0.9;
//             const platformAmount = totalPrice * 0.1;

//             // Pay seller
//             const txSeller = await sendPayment(item.sellerId, sellerAmount);

//             // Pay platform fee
//             const txPlatform = await sendPayment(platformWallet, platformAmount);

//             // Save under buyer -> artBought
//             await setDoc(collection(db, "users", walletAddress, "artBought"), {
//                 artwork: {
//                     id: item.id,
//                     title: item.title,
//                     imageUrl: item.imageUrl
//                 },
//                 price: item.price,
//                 quantity: item.quantity,
//                 sellerId: item.sellerId,
//                 buyerId: walletAddress,
//                 purchasedAt: timestamp,
//                 txSeller,
//                 txPlatform,
//                 status: "completed"
//             });

//             // Save under seller -> artSold
//             await setDoc(collection(db, "users", item.sellerId, "artSold"), {
//                 artwork: {
//                     id: item.id,
//                     title: item.title,
//                     imageUrl: item.imageUrl
//                 },
//                 price: item.price,
//                 quantity: item.quantity,
//                 buyerId: walletAddress,
//                 sellerId: item.sellerId,
//                 soldAt: timestamp,
//                 txSeller,
//                 status: "completed"
//             });

//             // Remove from global marketplace
//             await deleteDoc(doc(db, "artworks", item.id));

//             // Remove from seller's sellingArts
//             await deleteDoc(doc(db, "users", item.sellerId, "sellingArts", item.id));
//         }

//         // Clear cart after successful payment
//         clearCart();
//         toggleCart();

//         showToast('Payment successful! Order confirmed.', 'success');
//     } catch (error) {
//         console.error('Checkout failed:', error);
//         showToast('Payment failed. Please try again.', 'error');
//     }
// }

async function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty', 'error');
        return;
    }

    if (!walletConnected || !walletAddress) {
        showToast('Please connect your MetaMask wallet first', 'error');
        return;
    }

    const platformWallet = '0x742d35Cc6686C59fCC3e544961fcdeEeC4d91dc3'; // platform wallet

    try {
        showToast('Processing payment...', 'warning');

        for (let item of cart) {
            if (!item.sellerId || item.sellerId === "unknown") {
                console.warn(`Missing sellerId for artwork: ${item.title}`);
                continue;
            }

            const timestamp = new Date();
            const totalPrice = item.price * (item.quantity || 1);

            // Split payment
            const sellerAmount = totalPrice * 0.9;
            const platformAmount = totalPrice * 0.1;

            // Pay seller
            const txSeller = await sendPayment(item.sellerId, sellerAmount);

            // Pay platform
            const txPlatform = await sendPayment(platformWallet, platformAmount);

            // Save under buyer -> artBought
            await setDoc(doc(db, "users", walletAddress, "artBought", item.id), {
                artwork: {
                    id: item.id,
                    title: item.title,
                    imageUrl: item.imageUrl
                },
                price: item.price,
                quantity: item.quantity || 1,
                sellerId: item.sellerId,
                buyerId: walletAddress,
                purchasedAt: timestamp,
                txSeller,
                txPlatform,
                status: "completed"
            });

            // Save under seller -> artSold
            await setDoc(doc(db, "users", item.sellerId, "artSold", item.id), {
                artwork: {
                    id: item.id,
                    title: item.title,
                    imageUrl: item.imageUrl
                },
                price: item.price,
                quantity: item.quantity || 1,
                buyerId: walletAddress,
                sellerId: item.sellerId,
                soldAt: timestamp,
                txSeller,
                status: "completed"
            });

            // Remove from global marketplace
            await deleteDoc(doc(db, "artworks", item.id));

            // Remove from seller's sellingArts
            await deleteDoc(doc(db, "users", item.sellerId, "sellingArts", item.id));
        }

        clearCart();
        toggleCart();

        showToast('Payment successful! Order confirmed.', 'success');

    } catch (error) {
        console.error('Checkout failed:', error);
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
            title: document.getElementById('artworkTitle').value,
            artist: currentUser?.username || "Unnamed Artist",
            description: document.getElementById('artworkDescription').value,
            price: parseFloat(document.getElementById('artworkPrice').value),
            category: document.getElementById('artworkCategory').value,
            dimensions: document.getElementById('artworkDimensions').value,
            year: parseInt(document.getElementById('artworkYear').value),
            imageUrl
        };
        
        // Validate form
        if (!validateSubmissionForm(formData)) {
            return;
        }
        
        const newArtwork = {
            id: Date.now(),
            ...formData,
            inStock: true,
            submittedAt: new Date().toISOString()
        };

        // 1. Save to Firestore under user's sellingArts
        await addDoc(collection(db, "users", walletAddress, "sellingArts"), newArtwork);

        // 2. Also save to global artworks collection
        await addDoc(collection(db, "artworks"), {
            ...newArtwork,
            sellerId: walletAddress
        });

        submittedArtworks.push(newArtwork);
        localStorage.setItem('user_submitted_artwork', JSON.stringify(submittedArtworks));
        
        // Reset form
        document.getElementById('submitForm').reset();
        document.getElementById('artworkYear').value = new Date().getFullYear();
        
        showToast('Artwork submitted successfully!', 'success');
        showSection('gallery');
        loadArtworks();
        
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
        !formData.imageUrl || !formData.category || !formData.dimensions) {
        showToast('Please fill in all required fields', 'error');
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

function loadArtists() {
    const artistsGrid = document.getElementById('artistsGrid');
    if (!artistsGrid) return;

    // Group artworks by artist from submittedArtworks
    const artistMap = {};
    submittedArtworks.forEach(art => {
        if (!artistMap[art.artist]) {
            artistMap[art.artist] = {
                name: art.artist,
                avatar: art.artist.charAt(0).toUpperCase(), // first letter
                bio: art.bio || "This artist has not added a bio yet.",
                artworks: [],
                totalSales: 0,
                joinDate: null
            };
        }

        // Add artwork
        artistMap[art.artist].artworks.push(art);

        // Add to sales sum
        artistMap[art.artist].totalSales += parseFloat(art.price) || 0;

        // Track earliest join date
        if (art.submittedAt) {
            const date = new Date(art.submittedAt);
            if (!artistMap[art.artist].joinDate || date < new Date(artistMap[art.artist].joinDate)) {
                artistMap[art.artist].joinDate = date;
            }
        }
    });

    const artists = Object.values(artistMap);

    if (artists.length === 0) {
        artistsGrid.innerHTML = `<p>No artists found</p>`;
        return;
    }

    artistsGrid.innerHTML = artists.map(artist => `
        <div class="artist-card" onclick="showArtistProfile('${artist.name}')">
            <div class="artist-avatar-large">${artist.avatar}</div>
            <div class="artist-info">
                <h3 class="artist-name">${artist.name}</h3>
                <p class="artist-bio">${artist.bio}</p>
                <div class="artist-stats">
                    <div class="stat">
                        <span class="stat-number">${artist.artworks.length}</span>
                        <span class="stat-label">Artworks</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${artist.totalSales.toFixed(2)}</span>
                        <span class="stat-label">tETH Sales</span>
                    </div>
                    <div class="stat">
                        <span class="stat-number">${artist.joinDate ? artist.joinDate.getFullYear() : "—"}</span>
                        <span class="stat-label">Joined</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}


function showArtistProfile(artistName) {
    const artistArtworks = submittedArtworks.filter(artwork => artwork.artist === artistName);
    if (artistArtworks.length === 0) return;

    // Calculate stats
    const totalSales = artistArtworks.reduce((sum, art) => sum + (parseFloat(art.price) || 0), 0);
    const joinDate = artistArtworks.reduce((earliest, art) => {
        if (!art.submittedAt) return earliest;
        const date = new Date(art.submittedAt);
        return !earliest || date < earliest ? date : earliest;
    }, null);

    const modal = document.getElementById('artistModal');
    const profileContainer = document.getElementById('artistProfile');

    profileContainer.innerHTML = `
        <div class="artist-profile-header">
            <div class="artist-avatar-xl">${artistName.charAt(0).toUpperCase()}</div>
            <div class="artist-profile-info">
                <h2>${artistName}</h2>
                <p class="artist-profile-bio">This artist has not added a bio yet.</p>
                <div class="artist-profile-stats">
                    <div class="profile-stat">
                        <i class="fas fa-palette"></i>
                        <span>${artistArtworks.length} Artworks</span>
                    </div>
                    <div class="profile-stat">
                        <i class="fab fa-ethereum"></i>
                        <span>${totalSales.toFixed(2)} tETH Total Sales</span>
                    </div>
                    <div class="profile-stat">
                        <i class="fas fa-calendar"></i>
                        <span>Joined ${joinDate ? joinDate.getFullYear() : "—"}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="artist-portfolio">
            <h3>Portfolio</h3>
            <div class="portfolio-grid">
                ${artistArtworks.map(artwork => `
                    <div class="portfolio-item" onclick="showArtworkDetail(${artwork.id}); closeArtistModal();">
                        <img src="${getImageUrl(artwork.imageUrl)}" alt="${artwork.title}">
                        <div class="portfolio-overlay">
                            <h4>${artwork.title}</h4>
                            <p>${artwork.price} tETH</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    modal.style.display = 'block';
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
    const totalArtworks = [...submittedArtworks].length; // , ...artworkData].length;
    const totalArtists = new Set([...submittedArtworks].map(a => a.artist)).size; // , ...artworkData].map(a => a.artist)).size;
    const totalVolume = [...submittedArtworks].reduce((sum, a) => sum + a.price, 0); // , ...artworkData].reduce((sum, a) => sum + a.price, 0);
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

// Enhanced cart functionality with basket branding
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
                <span class="nft-badge">Unique NFT</span>
            </div>
            <div class="cart-item-actions">
                <button class="remove-btn enhanced-remove-btn" onclick="removeFromCart(${item.id})">
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





let currentUser = null;
const USERNAME_COOLDOWN = 60 * 24 * 60 * 60 * 1000; // 60 days

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
}

function renderUserProfile() {
    if (!currentUser) return;
    document.getElementById("profileName").textContent = currentUser.username;
    document.getElementById("profileWallet").textContent = `Wallet: ${walletAddress}`;

    const artistInput = document.getElementById("artistName");
    if (artistInput) {
        artistInput.value = currentUser.username || "Unnamed Artist";
    }

    checkUsernameCooldown();

    loadUserArtworks(walletAddress);
    loadUserPurchases(walletAddress);
}

function enableUsernameEdit() {
    if (!walletConnected) {
        showToast("Please connect your wallet first", "error");
        return;
    }

    const canEdit = checkUsernameCooldown();
    if (!canEdit) {
        // Extra toast when user tries before cooldown expires
        const lastUpdate = currentUser.lastUsernameUpdate || 0;
        const elapsed = Date.now() - lastUpdate;
        const remaining = USERNAME_COOLDOWN - elapsed;
        const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));

        showToast(`⏳ You can't change your username yet. Please wait ${daysLeft} day(s).`, "warning");
        return;
    }

    document.getElementById("usernameEdit").style.display = "flex";
    document.getElementById("editNameBtn").style.display = "none";
    document.getElementById("usernameInput").value = currentUser.username;
}


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
    if (now - currentUser.lastUsernameUpdate < USERNAME_COOLDOWN) {
        showToast("You can only change your username every 60 days", "warning");
        return;
    }

    try {
        const userRef = doc(db, "users", walletAddress.toLowerCase());
        await setDoc(userRef, {
            ...currentUser,
            username: newName,
            lastUsernameUpdate: now
        }, { merge: true });

        currentUser.username = newName;
        currentUser.lastUsernameUpdate = now;

        document.getElementById("profileName").textContent = newName;
        document.getElementById("usernameEdit").style.display = "none";
        document.getElementById("editNameBtn").style.display = "inline-block";

        showToast("Username updated successfully!", "success");
        checkUsernameCooldown();
    } catch (error) {
        console.error("Failed to update username:", error);
        showToast("Error updating username", "error");
    }
}

function checkUsernameCooldown() {
    if (!currentUser) return false;

    const lastUpdate = currentUser.lastUsernameUpdate || 0;
    const elapsed = Date.now() - lastUpdate;

    const editBtn = document.getElementById("editNameBtn");
    const notice = document.getElementById("usernameNotice");

    if (!editBtn || !notice) return false;

    if (elapsed < USERNAME_COOLDOWN && lastUpdate > 0) {
        const remaining = USERNAME_COOLDOWN - elapsed;
        const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
        editBtn.disabled = true;
        notice.textContent = `⏳ You can't change your username yet. Please wait ${daysLeft} day(s).`;
        return false;
    } else {
        editBtn.disabled = false;
        notice.textContent = "✔ You can update your username.";
        return true;
    }
}

async function loadUserArtworks(walletAddr) {
    if (!walletAddr) return;
    const container = document.getElementById("userArtworks");
    container.innerHTML = "<p>Loading...</p>";

    try {
        const qSnap = await getDocs(collection(db, "users", walletAddr, "sellingArts"));
        if (qSnap.empty) {
            container.innerHTML = "<p>No artworks submitted yet.</p>";
            return;
        }

        container.innerHTML = "";
        qSnap.forEach(docSnap => {
            const art = docSnap.data();
            container.innerHTML += renderArtworkCard(art);
        });
    } catch (err) {
        console.error("Error loading user artworks:", err);
        container.innerHTML = "<p>Error loading artworks.</p>";
    }
}

async function loadUserPurchases(walletAddr) {
    if (!walletAddr) return;
    const container = document.getElementById("userPurchases");
    container.innerHTML = "<p>Loading...</p>";

    try {
        const qSnap = await getDocs(collection(db, "users", walletAddr, "artBought"));
        if (qSnap.empty) {
            container.innerHTML = "<p>No purchases yet.</p>";
            return;
        }

        container.innerHTML = "";
        qSnap.forEach(docSnap => {
            const art = docSnap.data();
            container.innerHTML += renderArtworkCard(art);
        });
    } catch (err) {
        console.error("Error loading purchases:", err);
        container.innerHTML = "<p>Error loading purchases.</p>";
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
            <p class="artwork-artist">by ${art.artist}</p>
            <span class="artwork-price">${art.price} ETH</span>
        </div>
    </div>`;
}
