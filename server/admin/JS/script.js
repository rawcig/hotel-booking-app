// Application Data
let appData = {
    hotelsForCards: [],
    availableRooms: [],
    bookings: []
};

// Application State
let currentPage = 'login';
let currentUser = null;

// State persistence functions
function saveAppState() {
    const state = {
        currentPage: currentPage,
        currentUser: currentUser
    };
    try {
        localStorage.setItem('adminAppState', JSON.stringify(state));
    } catch (error) {
        console.error('Error saving app state:', error);
    }
}

function loadAppState() {
    try {
        const state = localStorage.getItem('adminAppState');
        if (state) {
            const parsedState = JSON.parse(state);
            if (parsedState.currentPage) currentPage = parsedState.currentPage;
            if (parsedState.currentUser) currentUser = parsedState.currentUser;
        }
    } catch (error) {
        console.error('Error loading app state:', error);
    }
}

function clearAppState() {
    try {
        localStorage.removeItem('adminAppState');
    } catch (error) {
        console.error('Error clearing app state:', error);
    }
}



// DOM Elements
const loginPage = document.getElementById('loginPage');
const registerPage = document.getElementById('registerPage');
const dashboard = document.getElementById('dashboard');
const navItems = document.querySelectorAll('.nav-item');
const pageContents = document.querySelectorAll('.page-content');

// API Configuration
const API_BASE_URL = '/api';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Application Initialization
async function initializeApp() {
    setupEventListeners();
    setupImageUploadListeners();
    
    // Load previously saved state
    loadAppState();
    
    // Check if user is already logged in (in a real app, check localStorage/sessionStorage)
    const savedUser = getStoredUser();
    if (savedUser && savedUser.token) {
        // Verify that the token is still valid by making a test API call
        currentUser = savedUser;
        try {
            // Test if the user token is still valid by making a simple API call
            const response = await fetch(`${API_BASE_URL}/users?page=1&limit=1`, {
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                }
            });
            
            if (response.ok) {
                // If token is valid, restore the page state
                if (currentPage && currentPage !== 'login' && currentPage !== 'register') {
                    showPage(currentPage);
                } else {
                    showDashboard();
                }
                // Update user profile in header
                updateUserProfileInHeader();
            } else {
                // If token is invalid, clear stored user and redirect to login
                clearStoredUser();
                clearAppState();
                showPage('login');
            }
        } catch (error) {
            console.error('Error validating user token:', error);
            // If there's an error validating the token, clear stored user and redirect to login
            clearStoredUser();
            clearAppState();
            showPage('login');
        }
    } else {
        // If user is not logged in, always start at login page
        showPage('login');
    }
}

// User Storage Functions
function getStoredUser() {
    try {
        const user = localStorage.getItem('adminUser');
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error retrieving user from storage:', error);
        return null;
    }
}

function storeUser(user) {
    try {
        localStorage.setItem('adminUser', JSON.stringify(user));
    } catch (error) {
        console.error('Error storing user:', error);
    }
}

function clearStoredUser() {
    try {
        localStorage.removeItem('adminUser');
    } catch (error) {
        console.error('Error clearing stored user:', error);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Authentication forms
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Navigation
    navItems.forEach(item => {
        item.addEventListener('click', handleNavigation);
    });
    
    // Logout
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);
    
    // Search functionality
    document.getElementById('globalSearch').addEventListener('input', handleGlobalSearch);
    document.getElementById('roomSearch')?.addEventListener('input', handleRoomSearch);
    
    
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Set up modal close handlers
    setupModalCloseHandlers();
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberPassword').checked;
    
    // Simple validation
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            currentUser = {
                email: result.user.email,
                name: result.user.name,
                role: result.user.role || 'admin',
                token: result.token
            };
            
            if (remember) {
                storeUser(currentUser);
            }
            
            showNotification('Login successful!', 'success');
            showDashboard();
            
            // Update user profile in header
            updateUserProfileInHeader();
            saveAppState(); // Save state after login
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please check your connection and try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    // Simple validation
    if (!email || !username || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (!acceptTerms) {
        showNotification('Please accept terms and conditions', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: username, email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            currentUser = {
                email: result.user.email,
                name: result.user.name,
                role: 'admin',
                token: result.token
            };
            
            showNotification('Account created successfully!', 'success');
            showDashboard();
            
            // Update user profile in header
            updateUserProfileInHeader();
            saveAppState(); // Save state after registration
        } else {
            showNotification(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please check your connection and try again.', 'error');
    }
}

async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser?.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
        
        currentUser = null;
        clearStoredUser();
        clearAppState(); // Clear saved state on logout
        showNotification('Logged out successfully', 'info');
        showPage('login');
    }
}

// Page Navigation
function showLogin() {
    showPage('login');
}

function showRegister() {
    showPage('register');
}

function showDashboard() {
    showPage('dashboard');
    // Make sure the dashboard content is displayed
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        // Hide all other content sections
        pageContents.forEach(content => {
            if (content.id !== 'dashboardContent') {
                content.style.display = 'none';
            }
        });
        // Show dashboard content
        dashboardContent.style.display = 'block';
        // Update active nav item
        navItems.forEach(item => {
            item.classList.remove('active');
            item.classList.remove('bg-blue-600');
        });
        // Find and activate the dashboard nav item
        const dashboardNavItem = Array.from(navItems).find(item => item.getAttribute('data-page') === 'dashboard');
        if (dashboardNavItem) {
            dashboardNavItem.classList.add('active');
            dashboardNavItem.classList.add('bg-blue-600');
        }
    }
    
    // Update user profile in header with current user information
    updateUserProfileInHeader();
    
    loadDashboardData();
    saveAppState(); // Save the current page state
}

// Update user profile information in the header
function updateUserProfileInHeader() {
    if (currentUser) {
        // Update user name
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name || 'User';
        }
        
        // Update user role
        const userRoleElement = document.getElementById('userRole');
        if (userRoleElement) {
            userRoleElement.textContent = currentUser.role || 'User';
        }
        
        // Update user avatar initials
        const userAvatarElement = document.getElementById('userAvatar');
        if (userAvatarElement) {
            // Get first letter of first name and last name
            const nameParts = (currentUser.name || 'U').split(' ');
            const initials = nameParts.length > 1 
                ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                : nameParts[0][0];
            userAvatarElement.textContent = initials.toUpperCase();
        }
    }
}

function showPage(page) {
    // Hide all pages
    loginPage.style.display = 'none';
    registerPage.style.display = 'none';
    dashboard.style.display = 'none';
    
    // Show requested page
    switch(page) {
        case 'login':
            loginPage.style.display = 'flex';
            break;
        case 'register':
            registerPage.style.display = 'flex';
            break;
        case 'dashboard':
            dashboard.style.display = 'flex';
            break;
    }
    
    currentPage = page;
    saveAppState(); // Save the current page state
}

// Navigation Handler
// Navigation Handler
function handleNavigation(e) {
    const page = e.target.getAttribute('data-page');
    
    // Update active nav item
    navItems.forEach(item => {
        item.classList.remove('active');
        item.classList.remove('bg-blue-600');
    });
    e.target.classList.add('active');
    e.target.classList.add('bg-blue-600');
    
    // Hide all page contents
    pageContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected page content
    const targetContent = document.getElementById(page + 'Content');
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Load page-specific content
        switch(page) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'rooms':  // This displays hotels as cards
                loadHotelsAsCards();
                break;
            case 'roomAvailable':
                loadAvailableRoomsData();
                break;
            case 'bookingList':
                loadBookingListData();
                break;
            case 'users':
                loadUsersData();
                break;
            case 'bookings':
                loadBookingsData();
                break;
            
            default:
                break;
        }
    }
    
    // Save the current section/page in the state
    currentPage = page;
    saveAppState();
}

// Data Loading Functions
async function loadDashboardData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('dashboardTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="loading"><div class="spinner"></div>Loading bookings...</td></tr>';
        }
        
        // Load dashboard statistics
        const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
            const stats = statsResult.stats;
            // Update dashboard stats
            document.getElementById('totalCustomers').textContent = stats.customers || 0;
            document.getElementById('totalBookings').textContent = stats.bookings || 0;
            document.getElementById('totalRevenue').textContent = stats.revenue || 0; // Approximate revenue
            document.getElementById('totalHotels').textContent = stats.hotels || 0;
        }
        
        // Fetch bookings data for the table
        const response = await fetch(`${API_BASE_URL}/admin/bookings/overview`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Transform booking data to match room structure for dashboard display
            appData.bookings = result.bookings.map((booking, index) => ({
                id: booking.id || index,
                number: booking.id,
                type: booking.guest_name || 'N/A',
                floor: 'N/A',
                bedType: 'N/A',
                price: parseFloat(booking.total_price) || 0,
                status: booking.status || 'Unknown',
                rating: 'N/A',
                reviews: 'N/A',
                checkIn: booking.check_in,
                checkOut: booking.check_out
            }));
            
            renderDashboardContent();
        } else {
            showNotification('Failed to load booking data', 'error');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading booking data', 'error');
    }
}

// Global variables for card view pagination
let cardViewSearchTerm = '';
let currentCardViewPage = 1;
let totalCardViewPages = 1;
const hotelsPerPage = 12; // Number of hotels to show per page in card view

async function loadHotelsAsCards() {
    try {
        // Show loading state
        const roomsGrid = document.getElementById('roomsGrid');
        if (roomsGrid) {
            roomsGrid.innerHTML = '<div class="loading w-full flex justify-center items-center"><div class="justify-center items-center"><div class="spinner"></div><div class="ml-2">Loading hotels...</div></div></div>';
        }
        
        // Fetch hotels data with pagination
        const searchParam = cardViewSearchTerm ? `&search=${encodeURIComponent(cardViewSearchTerm)}` : '';
        const response = await fetch(`${API_BASE_URL}/hotels?page=${currentCardViewPage}&limit=${hotelsPerPage}${searchParam}`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Transform hotel data for card display - use only the main image
            appData.hotelsForCards = result.hotels.map((hotel, index) => ({
                id: hotel.id || index,
                hname: hotel.name,
                number: `${hotel.id || index}`,
                type: hotel.name,
                floor: 'N/A',
                bedType: 'N/A',
                price: parseFloat(hotel.price),
                status: 'Available',
                rating: parseFloat(hotel.rating),
                reviews: hotel.reviews ? hotel.reviews.length : 0,
                images: [hotel.image || ''], // Use only the main image
                // Store original hotel reference for search
                originalHotel: hotel
            }));
            
            // Update pagination info
            if (result.pagination) {
                totalCardViewPages = Math.ceil(result.pagination.totalCount / hotelsPerPage);
                currentCardViewPage = result.pagination.currentPage || 1;
            } else {
                // Fallback if server doesn't return pagination
                totalCardViewPages = 1;
            }
            
            // Render hotels and pagination controls
            renderHotelsAsCards();
            renderCardViewPagination();
        } else {
            showNotification('Failed to load hotels data', 'error');
        }
    } catch (error) {
        console.error('Error loading hotels data:', error);
        showNotification('Error loading hotels data', 'error');
    }
}



// Render pagination controls for card view
function renderCardViewPagination() {
    // Update pagination elements
    const currentStart = (currentCardViewPage - 1) * hotelsPerPage + 1;
    const currentEnd = currentCardViewPage === totalCardViewPages 
        ? currentStart + appData.hotelsForCards.length - 1 
        : Math.min(currentCardViewPage * hotelsPerPage, totalCardViewPages * hotelsPerPage);
    
    const totalCount = totalCardViewPages * hotelsPerPage;
    
    document.getElementById('cardViewCurrentStart').textContent = currentStart;
    document.getElementById('cardViewCurrentEnd').textContent = currentEnd;
    document.getElementById('cardViewTotalCount').textContent = totalCount;
    document.getElementById('currentCardViewPage').textContent = currentCardViewPage;
    document.getElementById('totalCardViewPages').textContent = totalCardViewPages;
    
    // Update button states
    const prevBtn = document.getElementById('prevCardViewPage');
    const nextBtn = document.getElementById('nextCardViewPage');
    
    if (prevBtn) prevBtn.disabled = currentCardViewPage <= 1;
    if (nextBtn) nextBtn.disabled = currentCardViewPage >= totalCardViewPages;
}

// Load a specific page of hotels in card view
function loadCardViewPage(page) {
    if (page < 1 || page > totalCardViewPages) return;
    
    currentCardViewPage = page;
    loadHotelsAsCards();
}

// Search handler for card view - resets to page 1 when searching
function handleHotelCardSearch(searchTerm) {
    cardViewSearchTerm = searchTerm;
    currentCardViewPage = 1; // Reset to first page when searching
    loadHotelsAsCards();
}

async function loadBookingListData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('bookingTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading"><div class="spinner"></div>Loading bookings...</td></tr>';
        }
        
        // Fetch bookings data
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            appData.bookings = result.bookings.map(booking => ({
                id: booking.id,
                roomId: booking.id,
                checkIn: booking.check_in,
                checkOut: booking.check_out,
                bookingStatus: booking.status,
                paymentStatus: 'Paid' // For now, we'll assume all bookings are paid
            }));
            
            renderBookingListContent();
        } else {
            showNotification('Failed to load bookings data', 'error');
        }
    } catch (error) {
        console.error('Error loading bookings data:', error);
        showNotification('Error loading bookings data', 'error');
    }
}

async function loadAvailableRoomsData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('availableRoomsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><div class="justify-center items-center"><td colspan="6" class="loading"><div class="spinner"></div>Loading available rooms...</td></div></tr>';
        }
        
        // Fetch hotels data
        const response = await fetch(`${API_BASE_URL}/hotels?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Transform hotel data to match available rooms structure
            appData.availableRooms = result.hotels.map((hotel, index) => ({
                id: hotel.id || index,
                hname: hotel.name,
                type: hotel.name || 'Standard Room',
                price: parseFloat(hotel.price),
                floor: Math.floor((hotel.id || index) / 10) + 1,
                image: hotel.image
            }));
            
            renderAvailableRoomsContent();
        } else {
            showNotification('Failed to load available rooms data', 'error');
        }
    } catch (error) {
        console.error('Error loading available rooms data:', error);
        showNotification('Error loading available rooms data', 'error');
    }
}

// Content Rendering Functions
function renderDashboardContent() {
    const tableBody = document.getElementById('dashboardTableBody');
    if (!tableBody) return;
    
    if (appData.bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-left p-4">No bookings found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    appData.bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-left p-4 border-b">${booking.id}</td>
            <td class="text-left p-4 border-b">${booking.type}</td>
            <td class="text-left p-4 border-b">${booking.checkIn ? formatDate(booking.checkIn) : 'N/A'}</td>
            <td class="text-left p-4 border-b">${booking.checkOut ? formatDate(booking.checkOut) : 'N/A'}</td>
            <td class="text-left p-4 border-b">Standard Room</td>
            <td class="text-left p-4 border-b">${booking.price.toFixed(2)}</td>
            <td class="text-left p-4 border-b"><span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span></td>
        `;
        tableBody.appendChild(row);
    });
    
    // Reinitialize Lucide icons after content is added
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function renderHotelsAsCards() {
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) return;
    
    if (appData.hotelsForCards.length === 0) {
        roomsGrid.innerHTML = '<p>No hotels found</p>';
        return;
    }
    
    roomsGrid.innerHTML = '';
    
    appData.hotelsForCards.forEach(hotel => {
        const hotelCard = createHotelCard(hotel);
        roomsGrid.appendChild(hotelCard);
    });
}

function renderBookingListContent() {
    const tableBody = document.getElementById('bookingTableBody');
    if (!tableBody) return;
    
    if (appData.bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-left p-4">No bookings found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    appData.bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-left p-4 border-b">${booking.id}</td>
            <td class="text-left p-4 border-b">${booking.roomId}</td>
            <td class="text-left p-4 border-b">${booking.checkIn}</td>
            <td class="text-left p-4 border-b">${booking.checkOut}</td>
            <td class="text-left p-4 border-b"><span class="status-badge status-${booking.bookingStatus.toLowerCase()}">${booking.bookingStatus}</span></td>
            <td class="text-left p-4 border-b"><span class="status-badge status-${booking.paymentStatus.toLowerCase().replace(' ', '-')}">${booking.paymentStatus}</span></td>
            <td class="text-left p-4 border-b">
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="updateBookingStatus(${booking.id}, 'confirmed')" title="Confirm"><i data-lucide="check" class="w-4 h-4"></i></button>
                    <button class="action-btn delete" onclick="cancelBooking(${booking.id})" title="Cancel"><i data-lucide="x" class="w-4 h-4"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderAvailableRoomsContent() {
    const tableBody = document.getElementById('availableRoomsTableBody');
    if (!tableBody) return;
    
    if (appData.availableRooms.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-left p-4">No available rooms found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    appData.availableRooms.forEach(room => {
        // Use full hotel name without truncation
        const fullHotelName = `${room.type || 'Standard Room'} (ID: ${room.id})`;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-left p-4 border-b"><div class="room-thumb" style="background-image: url('${room.image}')"></div></td>
            <td class="text-left p-4 border-b">${room.id}</td>
            <td class="text-left p-4 border-b">${fullHotelName}</td>
            <td class="text-left p-4 border-b">${room.price.toFixed(2)}</td>
            <td class="text-left p-4 border-b">${room.floor}</td>
            <td class="text-left p-4 border-b">
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="editHotel(${room.id})" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button class="action-btn delete" onclick="deleteHotelFromAvailableRooms(${room.id})" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}



function createHotelCard(hotel) {
    const card = document.createElement('div');
    card.className = 'room-card bg-white rounded-2xl overflow-hidden shadow-md';
    
    const stars = '★'.repeat(Math.floor(hotel.rating)) + '☆'.repeat(5 - Math.floor(hotel.rating));
    
    // Use the full hotel name
    const hotelName = hotel.hname || `Hotel ${hotel.id}`;
    
    card.innerHTML = `
        <div class="room-image hotel-card-image-${hotel.id}" style="background-image: url('${hotel.images[0]}')">
        </div>
        <div class="room-info p-6">
            <div class="room-header">
                <div class="room-number font-bold text-lg">ID: ${hotel.id} - ${hotelName}</div>
                <div class="room-price font-bold text-blue-600">${hotel.price.toFixed(2)}/night</div>
            </div>
            <div class="room-rating">
                <span class="stars text-amber-500">${stars}</span>
                <span class="rating-count text-gray-500">(${hotel.reviews} reviews)</span>
            </div>
            <div class="room-actions mt-4 flex gap-2 justify-center">
                <div id="modify-btn" class="flex gap-1">
                  <button class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300 text-sm min-w-[60px]" onclick="editHotel(${hotel.id})">Edit</button>
                  <button class="delete-btn" onclick="deleteHotelFromCard(${hotel.id})">Del</button>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Form Validation for Add User
function validateAddUserForm() {
    const name = document.getElementById('addUserName').value.trim();
    const email = document.getElementById('addUserEmail').value.trim();
    const role = document.getElementById('addUserRole').value;
    const status = document.getElementById('addUserStatus').value;
    
    if (!name) {
        showNotification('User name is required', 'error');
        return false;
    }
    
    if (!email) {
        showNotification('Email is required', 'error');
        return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!role) {
        showNotification('Role is required', 'error');
        return false;
    }
    
    if (!status) {
        showNotification('Status is required', 'error');
        return false;
    }
    
    return true;
}

// Form Validation for Edit User
function validateEditUserForm() {
    const name = document.getElementById('editUserName').value.trim();
    const email = document.getElementById('editUserEmail').value.trim();
    const role = document.getElementById('editUserRole').value;
    const status = document.getElementById('editUserStatus').value;
    
    if (!name) {
        showNotification('User name is required', 'error');
        return false;
    }
    
    if (!email) {
        showNotification('Email is required', 'error');
        return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return false;
    }
    
    if (!role) {
        showNotification('Role is required', 'error');
        return false;
    }
    
    if (!status) {
        showNotification('Status is required', 'error');
        return false;
    }
    
    return true;
}

// Form Validation for Add Booking
function validateAddBookingForm() {
    const hotelSelect = document.getElementById('addBookingHotel');
    const hotelId = hotelSelect.value;
    const guestName = document.getElementById('addBookingGuest').value.trim();
    const guestEmail = document.getElementById('addBookingEmail').value.trim();
    const checkIn = document.getElementById('addBookingCheckIn').value;
    const checkOut = document.getElementById('addBookingCheckOut').value;
    const guests = parseInt(document.getElementById('addBookingGuests').value);
    const rooms = parseInt(document.getElementById('addBookingRooms').value);
    const totalPrice = parseFloat(document.getElementById('addBookingTotal').value);
    const status = document.getElementById('addBookingStatus').value;
    
    // Basic required field validation only
    if (!hotelId) {
        showNotification('Please select a hotel', 'error');
        return false;
    }
    
    if (!guestName) {
        showNotification('Guest name is required', 'error');
        return false;
    }
    
    if (!guestEmail) {
        showNotification('Guest email is required', 'error');
        return false;
    }
    
    if (!checkIn || !checkOut) {
        showNotification('Check-in and check-out dates are required', 'error');
        return false;
    }
    
    if (isNaN(guests) || guests <= 0) {
        showNotification('Valid number of guests is required', 'error');
        return false;
    }
    
    if (isNaN(rooms) || rooms <= 0) {
        showNotification('Valid number of rooms is required', 'error');
        return false;
    }
    
    if (isNaN(totalPrice) || totalPrice <= 0) {
        showNotification('Valid total price is required', 'error');
        return false;
    }
    
    if (!status) {
        showNotification('Booking status is required', 'error');
        return false;
    }
    
    return true;
}

// Form Validation for Edit Booking
function validateEditBookingForm() {
    const hotelSelect = document.getElementById('editBookingHotel');
    const hotelId = hotelSelect.value;
    const guestName = document.getElementById('editBookingGuest').value.trim();
    const guestEmail = document.getElementById('editBookingEmail').value.trim();
    const checkIn = document.getElementById('editBookingCheckIn').value;
    const checkOut = document.getElementById('editBookingCheckOut').value;
    const guests = parseInt(document.getElementById('editBookingGuests').value);
    const rooms = parseInt(document.getElementById('editBookingRooms').value);
    const totalPrice = parseFloat(document.getElementById('editBookingTotal').value);
    const status = document.getElementById('editBookingStatus').value;
    
    // Basic required field validation only
    if (!hotelId || hotelId === 'null' || isNaN(parseInt(hotelId))) {
        showNotification('Please select a valid hotel', 'error');
        return false;
    }
    
    if (!guestName) {
        showNotification('Guest name is required', 'error');
        return false;
    }
    
    if (!guestEmail) {
        showNotification('Guest email is required', 'error');
        return false;
    }
    
    if (!checkIn || !checkOut) {
        showNotification('Check-in and check-out dates are required', 'error');
        return false;
    }
    
    if (isNaN(guests) || guests <= 0) {
        showNotification('Valid number of guests is required', 'error');
        return false;
    }
    
    if (isNaN(rooms) || rooms <= 0) {
        showNotification('Valid number of rooms is required', 'error');
        return false;
    }
    
    if (isNaN(totalPrice) || totalPrice <= 0) {
        showNotification('Valid total price is required', 'error');
        return false;
    }
    
    if (!status) {
        showNotification('Booking status is required', 'error');
        return false;
    }
    
    return true;
}

// Form Validation for Add Hotel
function validateAddHotelForm() {
    // Get form elements directly from the form
    const form = document.getElementById('addHotelForm');
    if (!form) {
        showNotification('Add hotel form not found', 'error');
        return false;
    }
    
    const name = form.addHotelName ? form.addHotelName.value.trim() : '';
    const location = form.addHotelLocation ? form.addHotelLocation.value.trim() : '';
    const price = form.addHotelPrice ? parseFloat(form.addHotelPrice.value) : NaN;
    
    if (!name) {
        showNotification('Hotel name is required', 'error');
        if (form.addHotelName) form.addHotelName.focus();
        return false;
    }
    
    if (!location) {
        showNotification('Location is required', 'error');
        if (form.addHotelLocation) form.addHotelLocation.focus();
        return false;
    }
    
    if (isNaN(price) || price <= 0) {
        showNotification('Valid price is required', 'error');
        if (form.addHotelPrice) form.addHotelPrice.focus();
        return false;
    }
    
    return true;
}

// Setup image upload preview listeners
function setupImageUploadListeners() {
    // Add hotel image preview
    const addHotelImageInput = document.getElementById('addHotelImage');
    if (addHotelImageInput) {
        addHotelImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('addHotelImagePreview');
                    const img = preview.querySelector('img');
                    img.src = e.target.result;
                    preview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Edit hotel image preview
    const editHotelImageInput = document.getElementById('editHotelImage');
    if (editHotelImageInput) {
        editHotelImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const preview = document.getElementById('editHotelImagePreview');
                    const img = preview.querySelector('img');
                    img.src = e.target.result;
                    preview.classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Form Validation for Edit Hotel
function validateEditHotelForm() {
    // Get form elements directly from the form
    const form = document.getElementById('editHotelForm');
    if (!form) {
        showNotification('Edit hotel form not found', 'error');
        return false;
    }
    
    // Get form values
    const name = form.editHotelName ? form.editHotelName.value.trim() : '';
    const location = form.editHotelLocation ? form.editHotelLocation.value.trim() : '';
    const price = form.editHotelPrice ? parseFloat(form.editHotelPrice.value) : NaN;
    
    // Validate required fields only
    if (!name) {
        showNotification('Hotel name is required', 'error');
        if (form.editHotelName) form.editHotelName.focus();
        return false;
    }
    
    if (!location) {
        showNotification('Location is required', 'error');
        if (form.editHotelLocation) form.editHotelLocation.focus();
        return false;
    }
    
    if (isNaN(price) || price <= 0) {
        showNotification('Valid price is required', 'error');
        if (form.editHotelPrice) form.editHotelPrice.focus();
        return false;
    }
    
    return true;
}

// Room Actions
async function editHotel(hotelId) {
    try {
        // Validate hotel ID
        if (!hotelId) {
            showNotification('Invalid hotel ID', 'error');
            return;
        }
        
        // Show loading indicator
        showNotification('Loading hotel data...', 'info');
        
        // Fetch current hotel data
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotel API error response:', errorText);
            const errorMessage = `Failed to fetch hotel data: ${response.status} - ${errorText}`;
            showNotification(errorMessage, 'error');
            return;
        }
        
        const result = await response.json();
        
        if (result.success && result.hotel) {
            // Open edit modal with current data
            openEditHotelModal(result.hotel);
        } else {
            const errorMessage = result.message || 'Failed to fetch hotel data';
            showNotification(errorMessage, 'error');
        }
    } catch (error) {
        console.error('Error fetching hotel data:', error);
        const errorMessage = `Error fetching hotel data: ${error.message || error}`;
        showNotification(errorMessage, 'error');
    }
}





function closeEditHotelModal() {
    const modal = document.getElementById('editHotelModal');
    if (modal) {
        modal.style.display = 'none';
        // Hide image preview
        const preview = document.getElementById('editHotelImagePreview');
        if (preview) {
            preview.classList.add('hidden');
        }
        // Clear image data to prevent cross-contamination between hotels
        const editHotelImageInput = document.getElementById('editHotelImage');
        if (editHotelImageInput) {
            delete editHotelImageInput.dataset.currentImageUrl;
            delete editHotelImageInput.dataset.currentGallery;
        }
    }
}

async function deleteHotelFromAvailableRooms(hotelId) {
    if (confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser?.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(`Hotel ${hotelId} deleted successfully`, 'success');
                // Refresh the available rooms list
                loadAvailableRoomsData();
            } else {
                showNotification(result.message || 'Failed to delete hotel', 'error');
            }
        } catch (error) {
            console.error('Error deleting hotel:', error);
            showNotification('Error deleting hotel', 'error');
        }
    }
}

async function toggleFavorite(roomId) {
    showNotification(`Room ${roomId} added to favorites`, 'success');
    // In a real app, update favorites in backend
}

// Track current image index for each hotel








// Booking Management Functions
async function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${currentUser?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(`Booking ${bookingId} cancelled successfully`, 'success');
                // Refresh the booking list
                loadBookingListData();
            } else {
                showNotification(result.message || 'Failed to cancel booking', 'error');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            showNotification('Error cancelling booking', 'error');
        }
    }
}

async function updateBookingStatus(bookingId, newStatus) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Booking ${bookingId} status updated to ${newStatus}`, 'success');
            // Refresh the booking list
            loadBookingListData();
        } else {
            showNotification(result.message || 'Failed to update booking status', 'error');
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        showNotification('Error updating booking status', 'error');
    }
}

// Hotel Management Functions
async function uploadHotelImage(file) {
    // Create FormData for file upload with additional metadata
    const formData = new FormData();
    formData.append('file', file);
    
    // Generate a unique filename based on timestamp to prevent conflicts
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `hotels/hotel-${timestamp}.${fileExtension}`;
    formData.append('fileName', fileName); // Optionally pass filename to backend
    
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/upload-image`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            },
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            return result.imageUrl;
        } else {
            throw new Error(result.message || 'Failed to upload image');
        }
    } catch (error) {
        console.error('Error uploading hotel image:', error);
        throw error;
    }
}

async function createNewHotel(hotelData) {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hotelData)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotel creation error response:', errorText);
            showNotification(`Failed to create hotel: ${response.status} - ${errorText}`, 'error');
            return null;
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel created successfully', 'success');
            // Refresh the hotel list
            loadHotelsData();
            return result.hotel;
        } else {
            showNotification(result.message || 'Failed to create hotel', 'error');
            return null;
        }
    } catch (error) {
        console.error('Error creating hotel:', error);
        showNotification(`Error creating hotel: ${error.message}`, 'error');
        return null;
    }
}

// Update hotel information
async function updateHotel(hotelId, hotelData) {
    try {
        // Validate input
        if (!hotelId) {
            showNotification('Hotel ID is required', 'error');
            return null;
        }
        
        if (!hotelData || typeof hotelData !== 'object') {
            showNotification('Hotel data is required', 'error');
            return null;
        }
        
        // Make API call to update hotel
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hotelData)
        });
        
        // Handle HTTP errors
        if (!response.ok) {
            const errorText = await response.text();
            const errorMessage = `Failed to update hotel: ${response.status} - ${errorText}`;
            console.error('Hotel update error:', errorMessage);
            showNotification(errorMessage, 'error');
            return null;
        }
        
        // Parse response
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel updated successfully', 'success');
            
            // Refresh both views to show updated data
            await Promise.all([
                loadHotelsData(), // Refresh table view
                loadHotelsAsCards() // Refresh card view
            ]);
            
            return result.hotel;
        } else {
            const errorMessage = result.message || result.error || 'Failed to update hotel';
            showNotification(errorMessage, 'error');
            return null;
        }
    } catch (error) {
        console.error('Error updating hotel:', error);
        showNotification(`Error updating hotel: ${error.message}`, 'error');
        return null;
    }
}


// Room Availability Functions
// Delete hotel from card view - refreshes the card view after deletion
async function deleteHotelFromCard(hotelId) {
    if (confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser?.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Hotel deleted successfully', 'success');
                // Refresh the hotel cards view
                loadHotelsAsCards(); // This will refresh the card view
            } else {
                showNotification(result.message || 'Failed to delete hotel', 'error');
            }
        } catch (error) {
            console.error('Error deleting hotel:', error);
            showNotification('Error deleting hotel', 'error');
        }
    }
}

async function updateRoomAvailability(roomId, isAvailable) {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ is_active: isAvailable })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Room ${roomId} availability updated`, 'success');
            // Refresh the available rooms list
            loadAvailableRoomsData();
        } else {
            showNotification(result.message || 'Failed to update room availability', 'error');
        }
    } catch (error) {
        console.error('Error updating room availability:', error);
        showNotification('Error updating room availability', 'error');
    }
}

// Handle window resize
function handleResize() {
    // Implement responsive behavior if needed
}

// Close modal when clicking outside
function setupModalCloseHandlers() {
    // Add click handlers for all modals to close when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

// Search Functions
function handleGlobalSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Implement global search across all data
}

function handleRoomSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    // Filter available rooms based on search
    const filteredRooms = appData.availableRooms.filter(room =>
        room.type.toLowerCase().includes(searchTerm) ||
        room.id.toString().includes(searchTerm)
    );
    
    // Re-render table with filtered data
    const tableBody = document.getElementById('availableRoomsTableBody');
    if (tableBody) {
        tableBody.innerHTML = '';
        filteredRooms.forEach(room => {
            const row = document.createElement('tr');
            // Use full hotel name without truncation
            const fullHotelName = `${room.type || 'Standard Room'} (ID: ${room.id})`;
            
            row.innerHTML = `
                <td><div class="room-thumb" style="background-image: url('${room.image}')"></div></td>
                <td>${room.id}</td>
                <td>${fullHotelName}</td>
                <td>${room.price.toFixed(2)}</td>
                <td>${room.floor}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="editHotel(${room.id})" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                        <button class="action-btn delete" onclick="deleteHotelFromAvailableRooms(${room.id})" title="Delete"><div class="icon-trash-2"></div></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
}



function showNotification(message, type = 'info', duration = 3000) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notification => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after duration
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    return notification;
}




// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Export functions for external use (if needed)
// User Management Functions
let currentUsersPage = 1;
let totalUsersPages = 1;

async function loadUsersData() {
    try {
        const response = await fetch(`${API_BASE_URL}/users?page=${currentUsersPage}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const users = result.users || [];
            const pagination = result.pagination || {};
            
            renderUsersTable(users);
            updateUsersPagination(pagination);
        } else {
            showNotification(result.message || 'Failed to load users', 'error');
        }
    } catch (error) {
        console.error('Error loading users:', error);
        showNotification('Error loading users', 'error');
    }
}

function renderUsersTable(users) {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-left p-4">No users found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    users.forEach(user => {
        const statusClass = `status-${user.status}`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-left p-4 border-b">${user.id}</td>
            <td class="text-left p-4 border-b">${user.name}</td>
            <td class="text-left p-4 border-b">${user.email}</td>
            <td class="text-left p-4 border-b">${user.role}</td>
            <td class="text-left p-4 border-b"><span class="status-badge ${statusClass}">${user.status}</span></td>
            <td class="text-left p-4 border-b">${formatDate(user.joined_date)}</td>
            <td class="text-left p-4 border-b">
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="openEditUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Reinitialize Lucide icons after content is added
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateUsersPagination(pagination) {
    const totalCount = pagination.totalCount || 0;
    const currentPage = pagination.currentPage || 1;
    const totalPages = pagination.totalPages || 1;
    
    document.getElementById('usersTotalCount').textContent = totalCount;
    document.getElementById('currentUsersPage').textContent = currentPage;
    document.getElementById('totalUsersPages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prevUsersPage');
    const nextBtn = document.getElementById('nextUsersPage');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    currentUsersPage = currentPage;
    totalUsersPages = totalPages;
}

function loadUsersPage(page) {
    if (page < 1 || page > totalUsersPages) return;
    currentUsersPage = page;
    loadUsersData();
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('User deleted successfully', 'success');
            loadUsersData(); // Refresh the user list
        } else {
            showNotification(result.message || 'Failed to delete user', 'error');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
        showNotification('Error deleting user', 'error');
    }
}

// User Modal Functions
function openAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'flex';
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('addUserForm');
        if (form) {
            form.reset();
        }
    }
}

function openEditUserModal(user) {
    const modal = document.getElementById('editUserModal');
    if (modal && user) {
        // Populate form with user data
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserName').value = user.name || '';
        document.getElementById('editUserEmail').value = user.email || '';
        document.getElementById('editUserPhone').value = user.phone || '';
        document.getElementById('editUserRole').value = user.role || 'customer';
        document.getElementById('editUserStatus').value = user.status || 'active';
        
        modal.style.display = 'flex';
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('editUserForm');
        if (form) {
            form.reset();
        }
    }
}

// Booking Management Functions
let currentBookingsPage = 1;
let totalBookingsPages = 1;

async function loadBookingsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings?page=${currentBookingsPage}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const bookings = result.bookings || [];
            const pagination = result.pagination || {};
            
            renderBookingsTable(bookings);
            updateBookingsPagination(pagination);
        } else {
            showNotification(result.message || 'Failed to load bookings', 'error');
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        showNotification('Error loading bookings', 'error');
    }
}

function renderBookingsTable(bookings) {
    const tableBody = document.getElementById('bookingsTableBody');
    if (!tableBody) return;
    
    if (!bookings || bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-left p-4">No bookings found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    bookings.forEach(booking => {
        // Create a clean copy of the booking object with only the necessary properties
        const cleanBooking = {
            id: booking.id || null,
            hotel_id: booking.hotel_id || null,
            hotel_name: booking.hotel_name || '',
            guest_name: booking.guest_name || '',
            guest_email: booking.guest_email || '',
            guest_phone: booking.guest_phone || '',
            check_in: booking.check_in || '',
            check_out: booking.check_out || '',
            guests: booking.guests || 1,
            rooms: booking.rooms || 1,
            total_price: booking.total_price || '0',
            status: booking.status || 'pending',
            location: booking.location || ''
        };
        
        const statusClass = `status-${booking.status}`;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-left p-4 border-b">${booking.id || ''}</td>
            <td class="text-left p-4 border-b">${booking.hotel_name || ''}</td>
            <td class="text-left p-4 border-b">${booking.guest_name || ''}</td>
            <td class="text-left p-4 border-b">${formatDate(booking.check_in) || ''}</td>
            <td class="text-left p-4 border-b">${formatDate(booking.check_out) || ''}</td>
            <td class="text-left p-4 border-b"><span class="status-badge ${statusClass}">${booking.status || ''}</span></td>
            <td class="text-left p-4 border-b">${parseFloat(booking.total_price || 0).toFixed(2)}</td>
            <td class="text-left p-4 border-b">
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="openEditBookingModal(${JSON.stringify(cleanBooking).replace(/"/g, '&quot;')})" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button class="action-btn delete" onclick="deleteBooking(${booking.id})" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Reinitialize Lucide icons after content is added
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateBookingsPagination(pagination) {
    const totalCount = pagination.totalCount || 0;
    const currentPage = pagination.currentPage || 1;
    const totalPages = pagination.totalPages || 1;
    
    document.getElementById('bookingsTotalCount').textContent = totalCount;
    document.getElementById('currentBookingsPage').textContent = currentPage;
    document.getElementById('totalBookingsPages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prevBookingsPage');
    const nextBtn = document.getElementById('nextBookingsPage');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    currentBookingsPage = currentPage;
    totalBookingsPages = totalPages;
}

function loadBookingsPage(page) {
    if (page < 1 || page > totalBookingsPages) return;
    currentBookingsPage = page;
    loadBookingsData();
}

async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Booking deleted successfully', 'success');
            loadBookingsData(); // Refresh the booking list
        } else {
            showNotification(result.message || 'Failed to delete booking', 'error');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showNotification('Error deleting booking', 'error');
    }
}

// Booking Modal Functions
function openAddBookingModal() {
    const modal = document.getElementById('addBookingModal');
    if (modal) {
        // Clear any previous form data
        const form = document.getElementById('addBookingForm');
        if (form) {
            form.reset();
        }
        
        // Clear search inputs
        document.getElementById('addBookingHotelSearch').value = '';
        
        // Populate hotel dropdown
        populateHotelDropdown('addBookingHotel');
        
        modal.style.display = 'flex';
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeAddBookingModal() {
    const modal = document.getElementById('addBookingModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('addBookingForm');
        if (form) {
            form.reset();
        }
    }
}

function openEditBookingModal(booking) {
    const modal = document.getElementById('editBookingModal');
    if (modal && booking) {
        // Validate required booking data
        if (!booking.id) {
            console.error('Booking ID is missing');
            showNotification('Error: Invalid booking data - missing ID', 'error');
            return;
        }
        
        // Clear search inputs
        document.getElementById('editBookingHotelSearch').value = '';
        
        // Populate form with booking data, with fallbacks for missing values
        document.getElementById('editBookingId').value = booking.id || '';
        document.getElementById('editBookingGuest').value = booking.guest_name || '';
        document.getElementById('editBookingEmail').value = booking.guest_email || '';
        document.getElementById('editBookingPhone').value = booking.guest_phone || '';
        document.getElementById('editBookingCheckIn').value = booking.check_in || '';
        document.getElementById('editBookingCheckOut').value = booking.check_out || '';
        document.getElementById('editBookingGuests').value = booking.guests || 1;
        document.getElementById('editBookingRooms').value = booking.rooms || 1;
        document.getElementById('editBookingTotal').value = booking.total_price || '';
        document.getElementById('editBookingStatus').value = booking.status || 'pending';
        
        // Populate hotel dropdown and set the selected value after it's loaded
        populateHotelDropdown('editBookingHotel').then(() => {
            // Set the hotel value after the dropdown is populated
            const hotelSelect = document.getElementById('editBookingHotel');
            if (hotelSelect && booking.hotel_id) {
                hotelSelect.value = booking.hotel_id;
            }
        }).catch((error) => {
            // If there's an error populating hotels, show error and still set the value
            console.error('Error populating hotel dropdown:', error);
            const hotelSelect = document.getElementById('editBookingHotel');
            if (hotelSelect && booking.hotel_id) {
                hotelSelect.value = booking.hotel_id;
            }
        });
        
        modal.style.display = 'flex';
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    } else {
        console.error('Cannot open edit booking modal: modal or booking data missing');
        showNotification('Error: Cannot open booking edit modal', 'error');
    }
}

function closeEditBookingModal() {
    const modal = document.getElementById('editBookingModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('editBookingForm');
        if (form) {
            form.reset();
        }
    }
}





// Helper function to populate hotel dropdown
async function populateHotelDropdown(selectId) {
    try {
        // Check if user is logged in
        if (!currentUser || !currentUser.token) {
            console.error('User not logged in or token missing');
            showNotification('Please log in to access hotel data', 'error');
            return Promise.reject(new Error('User not authenticated'));
        }
        
        const response = await fetch(`${API_BASE_URL}/hotels?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotel API error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            const selectElement = document.getElementById(selectId);
            if (selectElement) {
                // Store all hotels data for filtering
                selectElement.hotelData = result.hotels || [];
                
                // Populate the dropdown
                selectElement.innerHTML = '<option value="">Select a hotel</option>';
                if (result.hotels && Array.isArray(result.hotels)) {
                    result.hotels.forEach(hotel => {
                        const option = document.createElement('option');
                        option.value = hotel.id;
                        option.textContent = `${hotel.name} (${hotel.location})`;
                        option.setAttribute('data-hotel-name', hotel.name);
                        option.setAttribute('data-hotel-location', hotel.location);
                        selectElement.appendChild(option);
                    });
                } else {
                    console.error('Invalid hotels data received:', result);
                    showNotification('Error loading hotels: Invalid data format', 'error');
                }
            } else {
                console.error('Select element not found:', selectId);
                showNotification(`Error: Select element not found (${selectId})`, 'error');
            }
        } else {
            console.error('Error loading hotels:', result.message);
            showNotification(`Error loading hotels: ${result.message || 'Unknown error'}`, 'error');
        }
        
        return Promise.resolve(); // Resolve the promise when done
    } catch (error) {
        console.error('Error loading hotels for dropdown:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // More specific error handling
        let errorMessage = 'Network error';
        if (error.name === 'TypeError') {
            if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Failed to connect to server. Please make sure the server is running and you have an internet connection.';
            } else if (error.message.includes('ERR_INTERNET_DISCONNECTED')) {
                errorMessage = 'Internet connection error. Please check your network connection.';
            } else {
                errorMessage = error.message || 'Connection error';
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showNotification(`Error loading hotels: ${errorMessage}`, 'error');
        return Promise.reject(error); // Reject the promise on error
    }
}





// Form Submission Handlers
document.addEventListener('DOMContentLoaded', function() {
    // Add Hotel Form Submission
    const addHotelForm = document.getElementById('addHotelForm');
    if (addHotelForm) {
        addHotelForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (!validateAddHotelForm()) {
                return;
            }
            
            const formData = new FormData(this);
            const imageFile = formData.get('addHotelImage');
            
            // Upload image if provided
            let imageUrl = '';
            if (imageFile && imageFile.size > 0) {
                try {
                    imageUrl = await uploadHotelImage(imageFile);
                    if (!imageUrl) {
                        showNotification('Failed to upload image, but hotel will still be created', 'warning');
                        // Continue without image
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    showNotification('Failed to upload image, but hotel will still be created', 'warning');
                    // Continue without image
                }
            }
            
            const hotelData = {
                name: formData.get('addHotelName'),
                location: formData.get('addHotelLocation'),
                distance: formData.get('addHotelDistance') || '',
                rating: parseFloat(formData.get('addHotelRating')) || null,
                price: parseFloat(formData.get('addHotelPrice')) || 0,
                image: imageUrl,
                description: formData.get('addHotelDescription') || '',
                amenities: formData.get('addHotelAmenities') ? formData.get('addHotelAmenities').split(',').map(a => a.trim()).filter(a => a) : []
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/hotels`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(hotelData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Hotel added successfully', 'success');
                    closeAddHotelModal();
                    loadHotelsData(); // Refresh the hotel list
                } else {
                    showNotification(result.message || 'Failed to add hotel', 'error');
                }
            } catch (error) {
                console.error('Error adding hotel:', error);
                showNotification('Error adding hotel', 'error');
            }
        });
    }
    
    // Edit Hotel Form Submission
    const editHotelForm = document.getElementById('editHotelForm');
    if (editHotelForm) {
        editHotelForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (!validateEditHotelForm()) {
                return;
            }
            
            const formData = new FormData(this);
            const hotelId = formData.get('editHotelId');
            // const imageFile = formData.get('editHotelImage');
            
            // Get form values
            const name = document.getElementById('editHotelName').value;
            const location = document.getElementById('editHotelLocation').value;
            const distance = document.getElementById('editHotelDistance').value || 'unknown - distance not specified';
            const rating = parseFloat(document.getElementById('editHotelRating').value) || null;
            const price = parseFloat(document.getElementById('editHotelPrice').value) || 0;
            const description = document.getElementById('editHotelDescription').value || 'No description provided';
            const amenitiesText = document.getElementById('editHotelAmenities').value || '';
            const amenities = amenitiesText ? amenitiesText.split(',').map(a => a.trim()).filter(a => a) : [];
            
            try {
                // Prepare hotel data
                let hotelData = {
                    name: name,
                    location: location,
                    distance: distance,
                    rating: rating,
                    price: price,
                    description: description,
                    amenities: amenities
                };
                
                // Handle image upload if a new image is selected
                const imageInput = document.getElementById('editHotelImage');
                
                // Check if a new file has been selected
                if (imageInput && imageInput.files && imageInput.files.length > 0) {
                    const newImageFile = imageInput.files[0];
                    if (newImageFile && newImageFile.size > 0) {
                        try {
                            const imageUrl = await uploadHotelImage(newImageFile);
                            if (imageUrl) {
                                hotelData.image = imageUrl;
                                // Don't set gallery - just use the main image
                                console.log('New image uploaded successfully:', imageUrl);
                            } else {
                                showNotification('Failed to upload new image, but hotel details will still be updated', 'warning');
                            }
                        } catch (uploadError) {
                            console.error('Image upload error:', uploadError);
                            showNotification('Failed to upload image, but hotel details will still be updated', 'warning');
                        }
                    }
                } else {
                    // If no new image selected, use existing image data
                    if (imageInput && imageInput.dataset.currentImageUrl) {
                        hotelData.image = imageInput.dataset.currentImageUrl;
                    }
                }
                
                // Don't include gallery in the update - only use the main image
                
                // Make the API call to update the hotel
                const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(hotelData)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    showNotification('Hotel updated successfully', 'success');
                    closeEditHotelModal();
                    
                    // Refresh both views to reflect changes
                    loadHotelsData(); // For table view
                    loadHotelsAsCards(); // For card view
                    
                    // Force refresh of current view to show updated image immediately
                    if (currentPage === 'rooms' || currentPage === 'hotels') {
                        loadHotelsAsCards();
                    } else if (currentPage === 'hotel-management') {  // if this page exists
                        loadHotelsData();
                    }
                } else {
                    const errorMessage = result.message || result.error || 'Failed to update hotel';
                    showNotification(errorMessage, 'error');
                    console.error('Hotel update failed:', result);
                }
            } catch (error) {
                console.error('Error in hotel update process:', error);
                showNotification(`Error updating hotel: ${error.message}`, 'error');
            }
        });
    }
    
    // Add User Form Submission
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (!validateAddUserForm()) {
                return;
            }
            
            const formData = new FormData(this);
            const userData = {
                name: formData.get('addUserName'),
                email: formData.get('addUserEmail'),
                phone: formData.get('addUserPhone') || '',
                role: formData.get('addUserRole'),
                status: formData.get('addUserStatus')
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/users`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('User added successfully', 'success');
                    closeAddUserModal();
                    loadUsersData(); // Refresh the user list
                } else {
                    showNotification(result.message || 'Failed to add user', 'error');
                }
            } catch (error) {
                console.error('Error adding user:', error);
                showNotification('Error adding user', 'error');
            }
        });
    }
    
    // Edit User Form Submission
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (!validateEditUserForm()) {
                return;
            }
            
            const formData = new FormData(this);
            const userId = formData.get('editUserId');
            const userData = {
                name: formData.get('editUserName'),
                email: formData.get('editUserEmail'),
                phone: formData.get('editUserPhone') || '',
                role: formData.get('editUserRole'),
                status: formData.get('editUserStatus')
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('User updated successfully', 'success');
                    closeEditUserModal();
                    loadUsersData(); // Refresh the user list
                } else {
                    showNotification(result.message || 'Failed to update user', 'error');
                }
            } catch (error) {
                console.error('Error updating user:', error);
                showNotification('Error updating user', 'error');
            }
        });
    }
    
    // Add Booking Form Submission
    const addBookingForm = document.getElementById('addBookingForm');
    if (addBookingForm) {
        addBookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (!validateAddBookingForm()) {
                return;
            }
            
            const formData = new FormData(this);
            const bookingData = {
                hotel_id: parseInt(formData.get('addBookingHotel')),
                guest_name: formData.get('addBookingGuest'),
                guest_email: formData.get('addBookingEmail'),
                guest_phone: formData.get('addBookingPhone') || '',
                check_in: formData.get('addBookingCheckIn'),
                check_out: formData.get('addBookingCheckOut'),
                guests: parseInt(formData.get('addBookingGuests')),
                rooms: parseInt(formData.get('addBookingRooms')),
                total_price: parseFloat(formData.get('addBookingTotal')),
                status: formData.get('addBookingStatus')
            };
            
            // We need to fetch hotel details to populate hotel_name, location, and image
            try {
                const hotelResponse = await fetch(`${API_BASE_URL}/hotels/${bookingData.hotel_id}`, {
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`
                    }
                });
                
                if (hotelResponse.ok) {
                    const hotelResult = await hotelResponse.json();
                    if (hotelResult.success && hotelResult.hotel) {
                        bookingData.hotel_name = hotelResult.hotel.name;
                        bookingData.location = hotelResult.hotel.location;
                        bookingData.image = hotelResult.hotel.image || '';
                    }
                }
            } catch (error) {
                console.error('Error fetching hotel details:', error);
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookingData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Booking created successfully', 'success');
                    closeAddBookingModal();
                    loadBookingsData(); // Refresh the booking list
                } else {
                    showNotification(result.message || 'Failed to create booking', 'error');
                }
            } catch (error) {
                console.error('Error creating booking:', error);
                showNotification('Error creating booking', 'error');
            }
        });
    }
    
    // Edit Booking Form Submission
    const editBookingForm = document.getElementById('editBookingForm');
    if (editBookingForm) {
        editBookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate form before submission
            if (!validateEditBookingForm()) {
                return;
            }
            
            // Get form values directly from the elements instead of FormData
            const bookingId = document.getElementById('editBookingId').value;
            const hotelId = document.getElementById('editBookingHotel').value;
            const guestName = document.getElementById('editBookingGuest').value;
            const guestEmail = document.getElementById('editBookingEmail').value;
            const guestPhone = document.getElementById('editBookingPhone').value;
            const checkIn = document.getElementById('editBookingCheckIn').value;
            const checkOut = document.getElementById('editBookingCheckOut').value;
            const guests = document.getElementById('editBookingGuests').value;
            const rooms = document.getElementById('editBookingRooms').value;
            const totalPrice = document.getElementById('editBookingTotal').value;
            const status = document.getElementById('editBookingStatus').value;
            
            // Validate required fields
            if (!bookingId || bookingId === 'null') {
                console.error('Invalid booking ID:', bookingId);
                showNotification('Error: Invalid booking ID', 'error');
                return;
            }
            
            if (!hotelId || hotelId === 'null') {
                console.error('Invalid hotel ID:', hotelId);
                showNotification('Error: Please select a hotel', 'error');
                return;
            }
            
            // Parse numeric values
            const parsedBookingId = parseInt(bookingId);
            const parsedHotelId = parseInt(hotelId);
            const parsedGuests = parseInt(guests);
            const parsedRooms = parseInt(rooms);
            const parsedTotalPrice = parseFloat(totalPrice);
            
            // Validate parsed values
            if (isNaN(parsedBookingId)) {
                console.error('Booking ID is not a valid number:', bookingId);
                showNotification('Error: Invalid booking ID format', 'error');
                return;
            }
            
            if (isNaN(parsedHotelId)) {
                console.error('Hotel ID is not a valid number:', hotelId);
                showNotification('Error: Invalid hotel ID format', 'error');
                return;
            }
            
            if (isNaN(parsedGuests) || parsedGuests <= 0) {
                console.error('Invalid number of guests:', guests);
                showNotification('Error: Invalid number of guests', 'error');
                return;
            }
            
            if (isNaN(parsedRooms) || parsedRooms <= 0) {
                console.error('Invalid number of rooms:', rooms);
                showNotification('Error: Invalid number of rooms', 'error');
                return;
            }
            
            if (isNaN(parsedTotalPrice) || parsedTotalPrice <= 0) {
                console.error('Invalid total price:', totalPrice);
                showNotification('Error: Invalid total price', 'error');
                return;
            }
            
            const bookingData = {
                hotel_id: parsedHotelId,
                guest_name: guestName || '',
                guest_email: guestEmail || '',
                guest_phone: guestPhone || '',
                check_in: checkIn || '',
                check_out: checkOut || '',
                guests: parsedGuests,
                rooms: parsedRooms,
                total_price: parsedTotalPrice,
                status: status || 'pending'
            };
            
            try {
                // Try to fetch hotel name for the booking data
                try {
                    // Only fetch hotel details if hotel_id is valid
                    if (parsedHotelId && !isNaN(parsedHotelId)) {
                        const hotelResponse = await fetch(`${API_BASE_URL}/hotels/${parsedHotelId}`, {
                            headers: {
                                'Authorization': `Bearer ${currentUser?.token}`
                            }
                        });
                        
                        if (hotelResponse.ok) {
                            const hotelResult = await hotelResponse.json();
                            if (hotelResult.success && hotelResult.hotel) {
                                bookingData.hotel_name = hotelResult.hotel.name;
                                bookingData.location = hotelResult.hotel.location;
                                bookingData.image = hotelResult.hotel.image || '';
                            }
                        } else {
                            console.warn('Failed to fetch hotel details, status:', hotelResponse.status);
                        }
                    }
                } catch (hotelError) {
                    console.warn('Could not fetch hotel details, proceeding with update:', hotelError);
                }
                
                const response = await fetch(`${API_BASE_URL}/bookings/${parsedBookingId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookingData)
                });
                
                const responseText = await response.text();
                
                // Try to parse as JSON, but handle if it's not valid JSON
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (Error) {
                    console.error('Could not parse response as JSON:', responseText);
                    throw new Error(`Server returned non-JSON response: ${responseText}`);
                }
                
                if (!response.ok) {
                    const errorMessage = result.message || result.error || 'Unknown error';
                    const errorDetails = result.details ? `Details: ${result.details}` : '';
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage} ${errorDetails}`);
                }
                
                if (result.success) {
                    showNotification('Booking updated successfully', 'success');
                    closeEditBookingModal();
                    loadBookingsData(); // Refresh the booking list
                } else {
                    showNotification(result.message || 'Failed to update booking', 'error');
                }
            } catch (error) {
                console.error('Error updating booking:', error);
                console.error('Error name:', error.name);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                
                // More detailed error handling
                if (error instanceof TypeError) {
                    if (error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                        showNotification('Network error: Unable to connect to server. Please make sure the server is running and you have an internet connection.', 'error');
                    } else if (error.message.includes('ERR_INTERNET_DISCONNECTED')) {
                        showNotification('Internet connection error: Please check your network connection.', 'error');
                    } else {
                        showNotification('Connection error: ' + error.message, 'error');
                    }
                } else if (error.message) {
                    showNotification('Error updating booking: ' + error.message, 'error');
                } else {
                    showNotification('An unknown error occurred while updating the booking.', 'error');
                }
            }
        });
    }
});

// Hotel Management Functions
let currentHotelsPage = 1;
let totalHotelsPages = 1;

// Global variable to store search term for table view
let tableViewSearchTerm = '';

async function loadHotelsData() {
    try {
        // Add search parameter if there's a search term
        const searchParam = tableViewSearchTerm ? `&search=${encodeURIComponent(tableViewSearchTerm)}` : '';
        const response = await fetch(`${API_BASE_URL}/hotels?page=${currentHotelsPage}&limit=10${searchParam}`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const hotels = result.hotels || [];
            const pagination = result.pagination || {};
            
            renderHotelsTable(hotels);
            updateHotelsPagination(pagination);
        } else {
            showNotification(result.message || 'Failed to load hotels', 'error');
        }
    } catch (error) {
        console.error('Error loading hotels:', error);
        showNotification('Error loading hotels', 'error');
    }
}

// Search handler for table view
function handleHotelTableSearch(searchTerm) {
    tableViewSearchTerm = searchTerm;
    currentHotelsPage = 1; // Reset to first page when searching
    loadHotelsData();
}

function renderHotelsTable(hotels) {
    const tableBody = document.getElementById('hotelsTableBody');
    if (!tableBody) return;
    
    if (!hotels || hotels.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-left p-4">No hotels found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    hotels.forEach(hotel => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-left p-4 border-b">${hotel.id}</td>
            <td class="text-left p-4 border-b">${hotel.name}</td>
            <td class="text-left p-4 border-b">${hotel.location}</td>
            <td class="text-left p-4 border-b">${hotel.rating || 'N/A'}</td>
            <td class="text-left p-4 border-b">${parseFloat(hotel.price).toFixed(2)}</td>
            <td class="text-left p-4 border-b">
                <div class="action-buttons">
                    <button class="action-btn edit" onclick="openEditHotelModal(${JSON.stringify(hotel).replace(/"/g, '&quot;')})" title="Edit"><i data-lucide="edit" class="w-4 h-4"></i></button>
                    <button class="action-btn delete" onclick="deleteHotel(${hotel.id})" title="Delete"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    // Reinitialize Lucide icons after content is added
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function updateHotelsPagination(pagination) {
    const totalCount = pagination.totalCount || 0;
    const currentPage = pagination.currentPage || 1;
    const totalPages = pagination.totalPages || 1;
    
    document.getElementById('hotelsTotalCount').textContent = totalCount;
    document.getElementById('currentHotelsPage').textContent = currentPage;
    document.getElementById('totalHotelsPages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prevHotelsPage');
    const nextBtn = document.getElementById('nextHotelsPage');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    currentHotelsPage = currentPage;
    totalHotelsPages = totalPages;
}

function loadHotelsPage(page) {
    if (page < 1 || page > totalHotelsPages) return;
    currentHotelsPage = page;
    loadHotelsData();
}

async function deleteHotel(hotelId) {
    if (!confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel deleted successfully', 'success');
            loadHotelsData(); // Refresh the hotel list
        } else {
            showNotification(result.message || 'Failed to delete hotel', 'error');
        }
    } catch (error) {
        console.error('Error deleting hotel:', error);
        showNotification('Error deleting hotel', 'error');
    }
}

// Hotel Modal Functions
function openAddHotelModal() {
    const modal = document.getElementById('addHotelModal');
    if (modal) {
        modal.style.display = 'flex';
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeAddHotelModal() {
    const modal = document.getElementById('addHotelModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('addHotelForm');
        if (form) {
            form.reset();
            // Hide image preview
            const preview = document.getElementById('addHotelImagePreview');
            if (preview) {
                preview.classList.add('hidden');
            }
        }
    }
}

function openEditHotelModal(hotel) {
    const modal = document.getElementById('editHotelModal');
    if (modal && hotel) {
        // Populate form with hotel data
        document.getElementById('editHotelId').value = hotel.id;
        document.getElementById('editHotelName').value = hotel.name || '';
        document.getElementById('editHotelLocation').value = hotel.location || '';
        document.getElementById('editHotelDistance').value = hotel.distance || '';
        document.getElementById('editHotelRating').value = hotel.rating || '';
        document.getElementById('editHotelPrice').value = hotel.price || '';
        // Note: We don't set the value of file inputs for security reasons, but we store the current image URL and gallery
        const editHotelImageInput = document.getElementById('editHotelImage');
        if (editHotelImageInput) {
            // Clear previous data first to avoid confusion
            delete editHotelImageInput.dataset.currentImageUrl;
            delete editHotelImageInput.dataset.currentGallery;
            
            // Set data for this specific hotel
            if (hotel.image) {
                editHotelImageInput.dataset.currentImageUrl = hotel.image;
            }
            if (hotel.gallery) {
                editHotelImageInput.dataset.currentGallery = JSON.stringify(hotel.gallery);
            } else if (hotel.image) {
                // Create a default gallery if none exists
                editHotelImageInput.dataset.currentGallery = JSON.stringify([hotel.image]);
            }
        }
        document.getElementById('editHotelDescription').value = hotel.description || '';
        document.getElementById('editHotelAmenities').value = hotel.amenities ? hotel.amenities.join(', ') : '';
        
        modal.style.display = 'flex';
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Placeholder for exportBookingData function
function exportBookingData() {
    showNotification('Booking data export functionality would be implemented here', 'info');
}

// Helper function to refresh Lucide icons
function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

window.HotelApp = {
    showNotification,
    exportBookingData,
    editHotel,
    deleteHotelFromAvailableRooms,
    toggleFavorite,
    cancelBooking,
    updateBookingStatus,
    createNewHotel,
    updateHotel,
    updateRoomAvailability,
    openAddHotelModal,
    closeAddHotelModal,
    openEditHotelModal,
    closeEditHotelModal,
    loadHotelsData,
    deleteHotel,
    // New functions
    loadUsersData,
    loadBookingsData,
    loadHotelsAsCards,
    deleteHotelFromCard,
    handleHotelTableSearch,
    handleHotelCardSearch,
    loadCardViewPage,
    openAddUserModal,
    closeAddUserModal,
    openEditUserModal,
    closeEditUserModal,
    deleteUser,
    openAddBookingModal,
    closeAddBookingModal,
    openEditBookingModal,
    closeEditBookingModal,
    deleteBooking,
    // State management functions
    saveAppState,
    loadAppState,
    clearAppState
};