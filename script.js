// Sample artwork data
const artworkData = [
    {
        id: 1,
        title: "Ethereal Dreams",
        artist: "Maya Chen",
        description: "A mesmerizing blend of digital artistry and traditional painting techniques, exploring the boundaries between reality and dreams.",
        price: 0.85,
        imageUrl: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=400&fit=crop",
        category: "Abstract",
        dimensions: "24\" x 36\"",
        year: 2024,
        inStock: true
    },
    {
        id: 2,
        title: "Urban Solitude",
        artist: "Marcus Rodriguez",
        description: "A powerful commentary on modern city life, capturing the isolation within the bustling urban landscape.",
        price: 1.2,
        imageUrl: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=500&h=400&fit=crop",
        category: "Urban",
        dimensions: "30\" x 40\"",
        year: 2023,
        inStock: true
    },
    {
        id: 3,
        title: "Mystic Waters",
        artist: "Elena Kowalski",
        description: "An enchanting seascape that transports viewers to a mystical underwater realm filled with wonder and tranquility.",
        price: 0.95,
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=400&fit=crop",
        category: "Seascape",
        dimensions: "28\" x 22\"",
        year: 2024,
        inStock: false
    },
    {
        id: 4,
        title: "Golden Hour Valley",
        artist: "James Thompson",
        description: "A breathtaking landscape capturing the magical moment when golden sunlight bathes a serene valley in warm hues.",
        price: 0.75,
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=400&fit=crop",
        category: "Landscape",
        dimensions: "32\" x 24\"",
        year: 2023,
        inStock: true
    },
    {
        id: 5,
        title: "Digital Renaissance",
        artist: "Aria Nakamura",
        description: "A modern interpretation of classical portraiture, blending Renaissance techniques with contemporary digital art.",
        price: 1.5,
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500&h=400&fit=crop",
        category: "Portrait",
        dimensions: "20\" x 24\"",
        year: 2024,
        inStock: true
    },
    {
        id: 6,
        title: "Neon Nights",
        artist: "Alex Rivera",
        description: "A vibrant exploration of cyberpunk aesthetics, featuring neon-lit cityscapes and futuristic architecture.",
        price: 1.1,
        imageUrl: "/images/cyberpunk.jpg",
        category: "Abstract",
        dimensions: "36\" x 24\"",
        year: 2024,
        inStock: true
    }
];

// Global state
let currentArtworks = [...artworkData];
let cart = JSON.parse(localStorage.getItem('artconnect_cart') || '[]');
let walletConnected = false;
let walletAddress = null;
let submittedArtworks = JSON.parse(localStorage.getItem('user_submitted_artwork') || '[]');

// Web3 and MetaMask functionality & add in db 
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showToast('Please install MetaMask to use this feature', 'error');
        return;
    }

    try {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
            walletAddress = accounts[0];
            walletConnected = true;
            updateWalletUI();
            showToast('Wallet connected successfully!', 'success');

            // calls function to save user info in db
            await saveUserToFirestore(walletAddress);
        }
    } catch (error) {
        console.error('Failed to connect wallet:', error);
        showToast('Failed to connect wallet', 'error');
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
        if (walletWarning) walletWarning.style.display = 'none';
    } else {
        walletBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
        walletBtn.classList.remove('connected');
        if (walletWarning) walletWarning.style.display = 'block';
    }
}

async function sendPayment(toAddress, amount) {
    if (!walletConnected) {
        throw new Error('Wallet not connected');
    }

    try {
        const amountInWei = (amount * 1e18).toString(16);
        
        const transactionHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: walletAddress,
                to: toAddress,
                value: '0x' + amountInWei
            }]
        });
        
        return transactionHash;
    } catch (error) {
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
    updateCartUI();
    updateWalletUI();
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
        const combinedArtworks = [...artworkData, ...submittedArtworks];
        currentArtworks = combinedArtworks;

        // If you want ONLY db artworks, comment out the line above and use this:
        // currentArtworks = submittedArtworks;

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

    //<img src="${artwork.imageUrl}" alt="${artwork.title}" loading="lazy">

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
                    <span class="artwork-price">${artwork.price} ETH</span>
                </div>
                <div class="artwork-actions">
                    <button class="btn btn-secondary" onclick="showArtworkDetail(${artwork.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button class="btn btn-primary" onclick="addToCart(${artwork.id})" ${!artwork.inStock ? 'disabled' : ''}>
                        <i class="fas fa-cart-plus"></i> ${artwork.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterArtworks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    let filtered = [...artworkData, ...submittedArtworks];
    
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
    const artwork = [...artworkData, ...submittedArtworks].find(item => item.id === artworkId);
    if (!artwork) return;
    
    const modal = document.getElementById('artworkModal');
    const detailContainer = document.getElementById('artworkDetail');
    
    //<img src="${artwork.imageUrl}" alt="${artwork.title}" class="artwork-detail-image">

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
            <div class="artwork-detail-footer">
                <span class="artwork-detail-price">${artwork.price} ETH</span>
                <button class="btn btn-primary" onclick="addToCart(${artwork.id}); closeArtworkModal();" ${!artwork.inStock ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i> ${artwork.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function closeArtworkModal() {
    document.getElementById('artworkModal').style.display = 'none';
}

// Cart functionality
function addToCart(artworkId) {
    const artwork = [...artworkData, ...submittedArtworks].find(item => item.id === artworkId);
    if (!artwork || !artwork.inStock) return;
    
    const existingItem = cart.find(item => item.id === artworkId);
    if (existingItem) {
        existingItem.quantity += 1;
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

function updateQuantity(artworkId, change) {
    const item = cart.find(item => item.id === artworkId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(artworkId);
            return;
        }
        saveCart();
        updateCartUI();
        renderCartItems();
    }
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
                <p class="cart-item-price">${item.price} ETH</p>
            </div>
            <div class="cart-item-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        </div>
    `).join('');
}

// I add db here
// async function checkout() {
//     if (cart.length === 0) {
//         showToast('Your cart is empty', 'error');
//         return;
//     }
    
//     if (!walletConnected || !walletAddress) {
//         showToast('Please connect your MetaMask wallet first', 'error');
//         return;
//     }
    
//     const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//     const storeWalletAddress = '0x742d35Cc6686C59fCC3e544961fcdeEeC4d91dc3';
    
//     try {
//         showToast('Processing payment...', 'warning');
//         const txHash = await sendPayment(storeWalletAddress, total);
        
//         // Save purchase details to db
//         for (let item of cart) {
//             await addDoc(collection(db, "users", walletAddress, "buyingArts"), {
//                 ...item,
//                 buyerId: walletAddress,
//                 sellerId: item.sellerId || "unknown", // add seller info if available
//                 purchasedAt: new Date(),
//                 status: "completed",
//                 transactionHash: txHash
//             });
//         }

//         // Clear cart after successful payment
//         clearCart();
//         toggleCart();
        
//         showToast('Payment successful! Order confirmed.', 'success');
//         console.log('Transaction Hash:', txHash);
        
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
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const storeWalletAddress = '0x742d35Cc6686C59fCC3e544961fcdeEeC4d91dc3';
    
    try {
        showToast('Processing payment...', 'warning');
        const txHash = await sendPayment(storeWalletAddress, total);
        
        for (let item of cart) {
            const timestamp = new Date();

            // Save under buyer -> artBought
            await addDoc(collection(db, "users", walletAddress, "artBought"), {
                artwork: {
                    id: item.id,
                    title: item.title,
                    imageUrl: item.imageUrl
                },
                price: item.price,
                sellerId: item.sellerId || "unknown",
                buyerId: walletAddress,
                purchasedAt: timestamp,
                transactionHash: txHash,
                status: "completed"
            });

            // Save under seller -> artSold
            if (item.sellerId && item.sellerId !== "unknown") {
                await addDoc(collection(db, "users", item.sellerId, "artSold"), {
                    artwork: {
                        id: item.id,
                        title: item.title,
                        imageUrl: item.imageUrl
                    },
                    price: item.price,
                    buyerId: walletAddress,
                    sellerId: item.sellerId,
                    soldAt: timestamp,
                    transactionHash: txHash,
                    status: "completed"
                });
            }
        }

        // Clear cart after successful payment
        clearCart();
        toggleCart();
        
        showToast('Payment successful! Order confirmed.', 'success');
        console.log('Transaction Hash:', txHash);
        
    } catch (error) {
        console.error('Checkout failed:', error);
        showToast('Payment failed. Please try again.', 'error');
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
        const formData = {
            title: document.getElementById('artworkTitle').value,
            artist: document.getElementById('artistName').value,
            description: document.getElementById('artworkDescription').value,
            price: parseFloat(document.getElementById('artworkPrice').value),
            imageUrl: document.getElementById('imageUrl').value,
            category: document.getElementById('artworkCategory').value,
            dimensions: document.getElementById('artworkDimensions').value,
            year: parseInt(document.getElementById('artworkYear').value)
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
    
    try {
        new URL(formData.imageUrl);
    } catch {
        showToast('Please enter a valid image URL', 'error');
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