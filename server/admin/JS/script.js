// Application State
let currentPage = 'login';
let currentUser = null;
let currentMonth = new Date().getMonth() + 1; // Current month (1-12)
let currentYear = new Date().getFullYear(); // Current year

// Pagination state
let currentHotelsPage = 1;
let currentUsersPage = 1;
let currentBookingsPage = 1;
let currentTransactionsPage = 1;

// Application Data
let appData = {
    rooms: [],
    availableRooms: [],
    bookings: []
};

// DOM Elements - these will be initialized after DOM loads
let loginPage, registerPage, dashboard, navItems, pageContents;

// API Configuration
const API_BASE_URL = '/api';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Application Initialization
function initializeApp() {
    // Initialize DOM elements after DOM is loaded
    loginPage = document.getElementById('loginPage');
    registerPage = document.getElementById('registerPage');
    dashboard = document.getElementById('dashboard');
    navItems = document.querySelectorAll('.nav-item');
    pageContents = document.querySelectorAll('.page-content');

    // Check if required elements exist
    if (!loginPage || !registerPage || !dashboard) {
        console.error('Required page elements not found in DOM');
        return;
    }

    setupEventListeners();
    setupImageUploadListeners();
    
    // Check if user is already logged in
    const savedUser = getStoredUser();
    if (savedUser) {
        currentUser = savedUser;
        console.log('Found saved user:', currentUser);
        showDashboard();
        updateUserProfileInHeader();
    } else {
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
        // Store in memory only for Claude.ai compatibility
        console.log('User would be stored:', user);
    } catch (error) {
        console.error('Error storing user:', error);
    }
}

function clearStoredUser() {
    try {
        // Clear from memory
        console.log('User storage cleared');
    } catch (error) {
        console.error('Error clearing stored user:', error);
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Authentication forms
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Navigation
    if (navItems && navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', handleNavigation);
        });
    }
    
    // Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Search functionality
    const globalSearch = document.getElementById('globalSearch');
    const roomSearch = document.getElementById('roomSearch');
    
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }
    if (roomSearch) {
        roomSearch.addEventListener('input', handleRoomSearch);
    }
    
    // Dashboard month/year selectors
    const dashboardMonthSelector = document.querySelector('#dashboardContent .month-selector');
    if (dashboardMonthSelector) {
        // Populate month options
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        months.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = month;
            option.selected = index + 1 === currentMonth;
            dashboardMonthSelector.appendChild(option);
        });
        
        dashboardMonthSelector.addEventListener('change', function() {
            currentMonth = parseInt(this.value);
            loadDashboardData();
        });
    }
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Set up modal close handlers
    setupModalCloseHandlers();
    
    // Form Submission Handlers
    setupFormSubmissionHandlers();
    
    // Hotel Search Functionality
    setupHotelSearchListeners();
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const rememberInput = document.getElementById('rememberPassword');
    
    if (!emailInput || !passwordInput) {
        showNotification('Login form fields not found', 'error');
        return;
    }
    
    const email = emailInput.value;
    const password = passwordInput.value;
    const remember = rememberInput ? rememberInput.checked : false;
    
    // Simple validation
    if (!email || !password) {
        showNotification('Please enter both email and password', 'error');
        return;
    }
    
    try {
        console.log('Attempting login for:', email);
        
        // Make actual API call to auth endpoint
        const response = await fetch(API_BASE_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        console.log('Login response status:', response.status);
        
        const result = await response.json();
        console.log('Login response data:', result);
        
        if (response.ok && result.success) {
            currentUser = {
                email: result.user.email,
                name: result.user.name,
                role: result.user.role || 'user',
                token: result.token
            };
            
            if (remember) {
                storeUser(currentUser);
            }
            
            showNotification('Login successful!', 'success');
            showDashboard();
            updateUserProfileInHeader();
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please make sure the server is running and try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('registerEmail');
    const usernameInput = document.getElementById('registerUsername');
    const passwordInput = document.getElementById('registerPassword');
    const acceptTermsInput = document.getElementById('acceptTerms');
    
    if (!emailInput || !usernameInput || !passwordInput) {
        showNotification('Registration form fields not found', 'error');
        return;
    }
    
    const email = emailInput.value;
    const username = usernameInput.value;
    const password = passwordInput.value;
    const acceptTerms = acceptTermsInput ? acceptTermsInput.checked : false;
    
    // Simple validation
    if (!email || !username || !password) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (acceptTermsInput && !acceptTerms) {
        showNotification('Please accept terms and conditions', 'error');
        return;
    }
    
    // Validate password strength
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long', 'error');
        return;
    }
    
    try {
        console.log('Attempting registration for:', email);
        
        // Make actual API call to register endpoint
        const response = await fetch(API_BASE_URL + '/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: username, email, password })
        });
        
        console.log('Registration response status:', response.status);
        
        const result = await response.json();
        console.log('Registration response data:', result);
        
        if (response.ok && result.success) {
            currentUser = {
                email: result.user.email,
                name: result.user.name,
                role: result.user.role || 'user',
                token: result.token
            };
            
            showNotification('Account created successfully!', 'success');
            showDashboard();
            updateUserProfileInHeader();
        } else {
            showNotification(result.message || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please make sure the server is running and try again.', 'error');
    }
}

async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Make API call to logout endpoint
            if (currentUser && currentUser.token) {
                await fetch(API_BASE_URL + '/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`
                    }
                });
            }
        } catch (error) {
            console.error('Logout API error:', error);
        }
        
        currentUser = null;
        clearStoredUser();
        showNotification('Logged out successfully', 'info');
        showPage('login');
    }
}

function showDashboard() {
    console.log('showDashboard called');
    showPage('dashboard');
    
    // Make sure the dashboard content is displayed
    const dashboardContent = document.getElementById('dashboardContent');
    if (dashboardContent) {
        console.log('Dashboard content found, showing it');
        // Hide all other content sections
        if (pageContents && pageContents.length > 0) {
            pageContents.forEach(content => {
                if (content.id !== 'dashboardContent') {
                    content.style.display = 'none';
                }
            });
        }
        // Show dashboard content
        dashboardContent.style.display = 'block';
        
        // Update active nav item
        if (navItems && navItems.length > 0) {
            navItems.forEach(item => {
                item.classList.remove('active');
                item.classList.remove('bg-blue-600');
            });
            // Find and activate the dashboard nav item
            const dashboardNavItem = Array.from(navItems).find(item => 
                item.getAttribute('data-page') === 'dashboard'
            );
            if (dashboardNavItem) {
                dashboardNavItem.classList.add('active');
                dashboardNavItem.classList.add('bg-blue-600');
            }
        }
    } else {
        console.error('Dashboard content element not found');
        // Create a basic dashboard content if it doesn't exist
        const dashboardContainer = document.querySelector('#dashboard .main-content');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = `
                <div id="dashboardContent" class="page-content">
                    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div class="stat-card bg-white p-6 rounded-lg shadow">
                            <h3 class="text-sm font-medium text-gray-500">Total Customers</h3>
                            <p class="text-2xl font-bold text-gray-900" id="totalCustomers">0</p>
                        </div>
                        <div class="stat-card bg-white p-6 rounded-lg shadow">
                            <h3 class="text-sm font-medium text-gray-500">Total Bookings</h3>
                            <p class="text-2xl font-bold text-gray-900" id="totalBookings">0</p>
                        </div>
                        <div class="stat-card bg-white p-6 rounded-lg shadow">
                            <h3 class="text-sm font-medium text-gray-500">Total Revenue</h3>
                            <p class="text-2xl font-bold text-gray-900" id="totalRevenue">$0.00</p>
                        </div>
                        <div class="stat-card bg-white p-6 rounded-lg shadow">
                            <h3 class="text-sm font-medium text-gray-500">Total Hotels</h3>
                            <p class="text-2xl font-bold text-gray-900" id="totalHotels">0</p>
                        </div>
                    </div>
                    <div class="bg-white p-6 rounded-lg shadow">
                        <h2 class="text-lg font-semibold mb-4">Recent Bookings</h2>
                        <div class="overflow-x-auto">
                            <table class="min-w-full">
                                <thead>
                                    <tr class="border-b">
                                        <th class="text-left p-4">Booking ID</th>
                                        <th class="text-left p-4">Guest Name</th>
                                        <th class="text-left p-4">Check In</th>
                                        <th class="text-left p-4">Check Out</th>
                                        <th class="text-left p-4">Hotel</th>
                                        <th class="text-left p-4">Amount</th>
                                        <th class="text-left p-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody id="dashboardTableBody">
                                    <tr>
                                        <td colspan="7" class="text-center p-4">Welcome! Your dashboard is ready.</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Update user profile in header
    updateUserProfileInHeader();
    
    // Load dashboard data (this might fail if API not available, but dashboard should still show)
    loadDashboardData().catch(error => {
        console.log('Dashboard data loading failed, but dashboard is visible:', error);
    });
}

// Update user profile information in the header
function updateUserProfileInHeader() {
    console.log('Updating user profile in header:', currentUser);
    
    if (currentUser) {
        // Update user name
        const userNameElement = document.getElementById('userName');
        if (userNameElement) {
            userNameElement.textContent = currentUser.name || 'User';
            console.log('Updated user name element');
        }
        
        // Update user role
        const userRoleElement = document.getElementById('userRole');
        if (userRoleElement) {
            userRoleElement.textContent = currentUser.role || 'User';
            console.log('Updated user role element');
        }
        
        // Update user avatar initials
        const userAvatarElement = document.getElementById('userAvatar');
        if (userAvatarElement) {
            const nameParts = (currentUser.name || 'U').split(' ');
            const initials = nameParts.length > 1 
                ? nameParts[0][0] + nameParts[nameParts.length - 1][0]
                : nameParts[0][0];
            userAvatarElement.textContent = initials.toUpperCase();
            console.log('Updated user avatar element');
        }
    }
}

function showPage(page) {
    console.log('showPage called with:', page);
    
    if (!loginPage || !registerPage || !dashboard) {
        console.error('Page elements not initialized');
        return;
    }
    
    // Hide all pages
    loginPage.style.display = 'none';
    registerPage.style.display = 'none';
    dashboard.style.display = 'none';
    
    // Show requested page
    switch(page) {
        case 'login':
            loginPage.style.display = 'flex';
            console.log('Showing login page');
            break;
        case 'register':
            registerPage.style.display = 'flex';
            console.log('Showing register page');
            break;
        case 'dashboard':
            dashboard.style.display = 'flex';
            console.log('Showing dashboard page');
            break;
        default:
            console.log('Unknown page:', page);
            loginPage.style.display = 'flex';
            break;
    }
    
    currentPage = page;
}

// Navigation Handler
function handleNavigation(e) {
    const page = e.target.getAttribute('data-page');
    console.log('Navigation clicked:', page);
    
    if (!navItems) return;
    
    // Update active nav item
    navItems.forEach(item => {
        item.classList.remove('active');
        item.classList.remove('bg-blue-600');
    });
    e.target.classList.add('active');
    e.target.classList.add('bg-blue-600');
    
    // Hide all page contents
    if (pageContents && pageContents.length > 0) {
        pageContents.forEach(content => {
            content.style.display = 'none';
        });
    }
    
    // Show selected page content
    const targetContent = document.getElementById(page + 'Content');
    if (targetContent) {
        targetContent.style.display = 'block';
        console.log('Showing content for:', page);
        
        // Load page-specific content
        switch(page) {
            case 'dashboard':
                loadDashboardData().catch(console.log);
                break;
            case 'rooms':
                loadRoomsData().catch(console.log);
                break;
            case 'roomAvailable':
                loadAvailableRoomsData().catch(console.log);
                break;
            case 'bookingList':
                loadBookingListData().catch(console.log);
                break;
            case 'users':
                loadUsersData().catch(console.log);
                break;
            case 'bookings':
                loadBookingsData().catch(console.log);
                break;
            case 'reports':
                loadReportsData().catch(console.log);
                break;
            case 'financials':
                loadFinancialsData().catch(console.log);
                break;
            case 'hotels':
                loadHotelsData().catch(console.log);
                break;
            default:
                break;
        }
    } else {
        console.log('Content element not found for:', page + 'Content');
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

// Data Loading Functions (with error handling for demo)
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Fetch dashboard statistics from API with month/year filtering
        let url = API_BASE_URL + '/admin/dashboard/stats';
        const params = new URLSearchParams();
        
        // Add month/year parameters if selected
        if (currentMonth && currentYear) {
            params.append('month', currentMonth);
            params.append('year', currentYear);
        } else if (currentYear) {
            params.append('year', currentYear);
        }
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update dashboard statistics
            const totalCustomersEl = document.getElementById('totalCustomers');
            const totalBookingsEl = document.getElementById('totalBookings');
            const totalRevenueEl = document.getElementById('totalRevenue');
            const totalHotelsEl = document.getElementById('totalHotels');
            
            if (totalCustomersEl) totalCustomersEl.textContent = 'N/A'; // API doesn't provide customer count directly
            if (totalBookingsEl) totalBookingsEl.textContent = result.stats.bookings || '0';
            if (totalRevenueEl) totalRevenueEl.textContent = formatCurrency(result.stats.totalRevenue || 0);
            if (totalHotelsEl) totalHotelsEl.textContent = result.stats.hotels || '0';
            
            // Update recent bookings table
            renderDashboardTable(result.recentBookings || []);
        } else {
            throw new Error(result.message || 'Failed to load dashboard data');
        }
        
        console.log('Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Show error notification
        showNotification('Failed to load dashboard data. Using demo data.', 'warning');
        
        // Set demo data as fallback
        const totalCustomersEl = document.getElementById('totalCustomers');
        const totalBookingsEl = document.getElementById('totalBookings');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const totalHotelsEl = document.getElementById('totalHotels');
        
        if (totalCustomersEl) totalCustomersEl.textContent = '150';
        if (totalBookingsEl) totalBookingsEl.textContent = '45';
        if (totalRevenueEl) totalRevenueEl.textContent = '$12,450.00';
        if (totalHotelsEl) totalHotelsEl.textContent = '8';
        
        // Set demo table data
        renderDashboardTable([
            {
                id: '001',
                guest_name: 'John Doe',
                check_in: '2024-01-15',
                check_out: '2024-01-18',
                hotel_name: 'Grand Hotel',
                total_price: '450.00',
                status: 'confirmed'
            },
            {
                id: '002',
                guest_name: 'Jane Smith',
                check_in: '2024-01-20',
                check_out: '2024-01-22',
                hotel_name: 'Ocean View Resort',
                total_price: '280.00',
                status: 'pending'
            }
        ]);
    }
}

// Render dashboard table with booking data
function renderDashboardTable(bookings) {
    const tableBody = document.getElementById('dashboardTableBody');
    if (!tableBody) {
        console.error('Dashboard table body element not found');
        return;
    }
    
    if (!bookings || bookings.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No recent bookings found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = bookings.map(booking => `
        <tr>
            <td class="text-left p-4 border-b">${booking.id}</td>
            <td class="text-left p-4 border-b">${booking.guest_name}</td>
            <td class="text-left p-4 border-b">${formatDate(booking.check_in)}</td>
            <td class="text-left p-4 border-b">${formatDate(booking.check_out)}</td>
            <td class="text-left p-4 border-b">${booking.hotel_name}</td>
            <td class="text-left p-4 border-b">${formatCurrency(booking.total_price)}</td>
            <td class="text-left p-4 border-b"><span class="status-badge status-${booking.status}">${booking.status}</span></td>
        </tr>
    `).join('');
}

// Hotel Management Functions
async function loadRoomsData() {
    try {
        // Show loading state
        const roomsGrid = document.getElementById('roomsGrid');
        if (roomsGrid) {
            roomsGrid.innerHTML = '<div class="loading w-full flex justify-center items-center"><div class="spinner"></div><div class="ml-2">Loading hotels...</div></div>';
        }
        
        // Fetch hotels data
        const response = await fetch(`${API_BASE_URL}/hotels?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Transform hotel data to match room structure
            appData.rooms = result.hotels.map((hotel, index) => ({
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
                image: hotel.image, // Use the image field directly
                images: hotel.gallery || [hotel.image] // Keep for backward compatibility
            }));
            
            renderRoomsContent();
            
            // Also populate the hotels table if it exists
            populateHotelsTable(result.hotels);
        } else {
            showNotification('Failed to load hotels data', 'error');
        }
    } catch (error) {
        console.error('Error loading hotels data:', error);
        showNotification('Error loading hotels data', 'error');
    }
}

// Load hotels data for table view
async function loadHotelsData() {
    try {
        // Show loading state
        const tableBody = document.getElementById('hotelsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">Loading hotels...</td></tr>';
        }
        
        // Fetch hotels data
        const response = await fetch(`${API_BASE_URL}/hotels?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Populate the hotels table
            populateHotelsTable(result.hotels);
        } else {
            showNotification('Failed to load hotels data', 'error');
        }
    } catch (error) {
        console.error('Error loading hotels data:', error);
        showNotification('Error loading hotels data', 'error');
    }
}

// Populate hotels table with data
function populateHotelsTable(hotels) {
    const tableBody = document.getElementById('hotelsTableBody');
    if (!tableBody) return;
    
    if (!hotels || hotels.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center p-4">No hotels found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = hotels.map(hotel => `
        <tr class="border-b hover:bg-gray-50">
            <td class="text-left p-4">${hotel.id}</td>
            <td class="text-left p-4">${hotel.name}</td>
            <td class="text-left p-4">${hotel.location}</td>
            <td class="text-left p-4">
                <div class="flex items-center">
                    <span class="stars text-amber-500 mr-1">${'★'.repeat(Math.floor(hotel.rating))}</span>
                    <span>${hotel.rating}</span>
                </div>
            </td>
            <td class="text-left p-4">${formatCurrency(hotel.price)}</td>
            <td class="text-left p-4">
                <div class="flex gap-2">
                    <button class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors" onclick="editHotel(${hotel.id})">Edit</button>
                    <button class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onclick="deleteHotel(${hotel.id})">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderRoomsContent() {
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) return;
    
    if (appData.rooms.length === 0) {
        roomsGrid.innerHTML = '<p>No hotels found</p>';
        return;
    }
    
    roomsGrid.innerHTML = '';
    
    appData.rooms.forEach(room => {
        const roomCard = createRoomCard(room);
        roomsGrid.appendChild(roomCard);
    });
}

function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card bg-white rounded-2xl overflow-hidden shadow-md';
    const stars = '★'.repeat(Math.floor(room.rating)) + '☆'.repeat(5 - Math.floor(room.rating));
    // Use the full hotel name
    const hotelName = room.hname || `Hotel ${room.id}`;
    
    // Use the image field if available, otherwise fallback to images[0] or a placeholder
    const imageUrl = room.image || (room.images && room.images[0]) || 'https://placehold.co/600x400';
    
    card.innerHTML = `
        <div class="room-image" style="background-image: url('${imageUrl}')">
            <button class="room-carousel prev" onclick="previousImage(${room.id})">‹</button>
            <button class="room-carousel next" onclick="nextImage(${room.id})">›</button>
        </div>
        <div class="room-info p-6">
            <div class="room-header">
                <div class="room-number font-bold text-lg">ID: ${room.id} - ${hotelName}</div>
                <div class="room-price font-bold text-blue-600">${room.price.toFixed(2)}/night</div>
            </div>
            <div class="room-rating">
                <span class="stars text-amber-500">${stars}</span>
                <span class="rating-count text-gray-500">(${room.reviews} reviews)</span>
            </div>
            <div class="room-actions mt-4 flex gap-2">
                <button class="btn-secondary px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300" onclick="editHotel(${room.id})">Edit Hotel</button>
                <button class="btn-danger px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-300" onclick="deleteHotel(${room.id})">Delete Hotel</button>
                <button class="favorite-btn text-2xl" onclick="toggleFavorite(${room.id})">♡</button>
            </div>
        </div>
    `;
    
    return card;
}

// Image carousel functions
function previousImage(roomId) {
    console.log('Previous image for room:', roomId);
    showNotification(`Previous image functionality for room ID: ${roomId} would be implemented here`, 'info');
    
    // In a real implementation, this would cycle to the previous image in the room's gallery
    // For now, we'll just show a notification
    alert(`Previous image for room ID: ${roomId}\nIn a full implementation, this would show the previous image.`);
}

function nextImage(roomId) {
    console.log('Next image for room:', roomId);
    showNotification(`Next image functionality for room ID: ${roomId} would be implemented here`, 'info');
    
    // In a real implementation, this would cycle to the next image in the room's gallery
    // For now, we'll just show a notification
    alert(`Next image for room ID: ${roomId}\nIn a full implementation, this would show the next image.`);
}

// Toggle favorite
function toggleFavorite(roomId) {
    console.log('Toggling favorite for room:', roomId);
    showNotification(`Toggle favorite functionality for room ID: ${roomId} would be implemented here`, 'info');
    
    // In a real implementation, this would toggle the room as a favorite
    // For now, we'll just show a notification
    alert(`Toggling favorite for room ID: ${roomId}\nIn a full implementation, this would mark the room as a favorite.`);
}

// View hotel details
async function viewHotel(hotelId) {
    console.log('Viewing hotel:', hotelId);
    
    try {
        // Show loading indicator
        showNotification('Loading hotel data...', 'info', 1000);
        
        // Fetch hotel data from API
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch hotel data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            const hotel = result.hotel;
            
            // Show hotel details in an alert for now
            // In a real implementation, this would open a modal with hotel details
            let hotelDetails = `Hotel Details:\n\n`;
            hotelDetails += `ID: ${hotel.id}\n`;
            hotelDetails += `Name: ${hotel.name}\n`;
            hotelDetails += `Location: ${hotel.location}\n`;
            hotelDetails += `Distance: ${hotel.distance}\n`;
            hotelDetails += `Rating: ${hotel.rating}\n`;
            hotelDetails += `Price: ${hotel.price}\n`;
            hotelDetails += `Description: ${hotel.description}\n`;
            hotelDetails += `Amenities: ${(hotel.amenities || []).join(', ')}\n`;
            
            alert(hotelDetails);
        } else {
            throw new Error(result.message || 'Failed to load hotel data');
        }
    } catch (error) {
        console.error('Error loading hotel data:', error);
        showNotification('Failed to load hotel data: ' + error.message, 'error');
    }
}

// Edit hotel details
async function editHotel(hotelId) {
    console.log('Editing hotel:', hotelId);
    
    try {
        // Show loading indicator
        showNotification('Loading hotel data...', 'info', 1000);
        
        // Fetch hotel data from API
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch hotel data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            const hotel = result.hotel;
            
            // Populate the edit hotel form with hotel data
            document.getElementById('editHotelId').value = hotel.id;
            document.getElementById('editHotelName').value = hotel.name || '';
            document.getElementById('editHotelLocation').value = hotel.location || '';
            document.getElementById('editHotelDistance').value = hotel.distance || '';
            document.getElementById('editHotelRating').value = hotel.rating || '';
            document.getElementById('editHotelPrice').value = hotel.price || '';
            document.getElementById('editHotelDescription').value = hotel.description || '';
            document.getElementById('editHotelAmenities').value = (hotel.amenities || []).join(', ') || '';
            
            // Update image preview if hotel has an image
            if (hotel.image) {
                const preview = document.getElementById('editHotelImagePreview');
                if (preview) {
                    const img = preview.querySelector('img');
                    if (img) {
                        img.src = hotel.image;
                        preview.classList.remove('hidden');
                    }
                }
            }
            
            // Show the edit hotel modal
            const modal = document.getElementById('editHotelModal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Focus on the first input
                const firstInput = modal.querySelector('input, textarea, select');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        } else {
            throw new Error(result.message || 'Failed to load hotel data');
        }
    } catch (error) {
        console.error('Error loading hotel data:', error);
        showNotification('Failed to load hotel data: ' + error.message, 'error');
    }
}

// Delete hotel
async function deleteHotel(hotelId) {
    if (!confirm('Are you sure you want to delete this hotel? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete hotel');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel deleted successfully!', 'success');
            // Reload hotel data
            loadRoomsData();
        } else {
            throw new Error(result.message || 'Failed to delete hotel');
        }
    } catch (error) {
        console.error('Error deleting hotel:', error);
        showNotification('Failed to delete hotel.', 'error');
    }
}

// User Management Functions

// View user details
async function viewUser(userId) {
    console.log('Viewing user:', userId);
    
    try {
        // Show loading indicator
        showNotification('Loading user data...', 'info', 1000);
        
        // Fetch user data from API
        const response = await fetch(`${API_BASE_URL}/auth/${userId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            const user = result.user;
            
            // Show user details in an alert for now
            // In a real implementation, this would open a modal with user details
            let userDetails = `User Details:\n\n`;
            userDetails += `ID: ${user.id}\n`;
            userDetails += `Name: ${user.name}\n`;
            userDetails += `Email: ${user.email}\n`;
            userDetails += `Phone: ${user.phone || 'N/A'}\n`;
            userDetails += `Role: ${user.role}\n`;
            userDetails += `Created At: ${formatDate(user.created_at)}\n`;
            
            alert(userDetails);
        } else {
            throw new Error(result.message || 'Failed to load user data');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load user data: ' + error.message, 'error');
    }
}

// Edit user details
async function editUser(userId) {
    console.log('Editing user:', userId);
    
    try {
        // Show loading indicator
        showNotification('Loading user data...', 'info', 1000);
        
        // Fetch user data from API
        const response = await fetch(`${API_BASE_URL}/auth/${userId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            const user = result.user;
            
            // Populate the edit user form with user data
            document.getElementById('editUserId').value = user.id;
            document.getElementById('editUserName').value = user.name || '';
            document.getElementById('editUserEmail').value = user.email || '';
            document.getElementById('editUserPhone').value = user.phone || '';
            
            // Show the edit user modal
            const modal = document.getElementById('editUserModal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Focus on the first input
                const firstInput = modal.querySelector('input, textarea, select');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        } else {
            throw new Error(result.message || 'Failed to load user data');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load user data: ' + error.message, 'error');
    }
}

// Pagination Functions

// Load hotels page
async function loadHotelsPage(pageNumber) {
    console.log('Loading hotels page:', pageNumber);
    
    try {
        // Update current page
        currentHotelsPage = pageNumber;
        
        // Show loading indicator
        const roomsGrid = document.getElementById('roomsGrid');
        if (roomsGrid) {
            roomsGrid.innerHTML = '<div class="loading w-full flex justify-center items-center"><div class="spinner"></div><div class="ml-2">Loading hotels...</div></div>';
        }
        
        // Fetch hotels data with pagination
        const response = await fetch(`${API_BASE_URL}/hotels?page=${pageNumber}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Transform hotel data to match room structure
            appData.rooms = result.hotels.map((hotel, index) => ({
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
                image: hotel.image, // Use the image field directly
                images: hotel.gallery || [hotel.image] // Keep for backward compatibility
            }));
            
            renderRoomsContent();
            
            // Also populate the hotels table if it exists
            populateHotelsTable(result.hotels);
            
            // Update pagination controls
            updateHotelsPagination(result.pagination);
        } else {
            showNotification('Failed to load hotels data', 'error');
        }
    } catch (error) {
        console.error('Error loading hotels data:', error);
        showNotification('Error loading hotels data', 'error');
    }
}

// Update hotels pagination controls
function updateHotelsPagination(pagination) {
    const prevBtn = document.getElementById('prevHotelsPage');
    const nextBtn = document.getElementById('nextHotelsPage');
    const pageInfo = document.getElementById('hotelsPageInfo');
    const currentPageEl = document.getElementById('currentHotelsPage');
    const totalPagesEl = document.getElementById('totalHotelsPages');
    const totalCountEl = document.getElementById('hotelsTotalCount');
    
    if (prevBtn) {
        prevBtn.disabled = pagination.currentPage <= 1;
        prevBtn.onclick = () => loadHotelsPage(pagination.currentPage - 1);
    }
    
    if (nextBtn) {
        nextBtn.disabled = pagination.currentPage >= pagination.totalPages;
        nextBtn.onclick = () => loadHotelsPage(pagination.currentPage + 1);
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    }
    
    if (currentPageEl) {
        currentPageEl.textContent = pagination.currentPage;
    }
    
    if (totalPagesEl) {
        totalPagesEl.textContent = pagination.totalPages;
    }
    
    if (totalCountEl) {
        totalCountEl.textContent = pagination.totalCount;
    }
}

// Load users page
async function loadUsersPage(pageNumber) {
    console.log('Loading users page:', pageNumber);
    
    try {
        // Update current page
        currentUsersPage = pageNumber;
        
        // Show loading state
        const tableBody = document.getElementById('usersTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Loading users...</td></tr>';
        }
        
        // Fetch users from API with pagination
        const response = await fetch(`${API_BASE_URL}/auth?page=${pageNumber}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update users table
            if (tableBody) {
                if (result.users && result.users.length > 0) {
                    tableBody.innerHTML = result.users.map(user => `
                        <tr>
                            <td class="text-left p-4 border-b">${user.id}</td>
                            <td class="text-left p-4 border-b">${user.name}</td>
                            <td class="text-left p-4 border-b">${user.email}</td>
                            <td class="text-left p-4 border-b">${user.role}</td>
                            <td class="text-left p-4 border-b"><span class="status-badge status-active">Active</span></td>
                            <td class="text-left p-4 border-b">${formatDate(user.created_at)}</td>
                            <td class="text-left p-4 border-b">
                                <div class="action-buttons">
                                    <button class="action-btn view" onclick="viewUser(${user.id})" title="View">
                                        <span>👁️</span>
                                    </button>
                                    <button class="action-btn edit" onclick="editUser(${user.id})" title="Edit">
                                        <span>✏️</span>
                                    </button>
                                    <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete">
                                        <span>🗑️</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No users found</td></tr>';
                }
            }
            
            // Update pagination info
            const totalCountEl = document.getElementById('usersTotalCount');
            const currentPageEl = document.getElementById('currentUsersPage');
            const totalPagesEl = document.getElementById('totalUsersPages');
            
            if (totalCountEl) totalCountEl.textContent = result.pagination.totalCount || '0';
            if (currentPageEl) currentPageEl.textContent = result.pagination.currentPage || '1';
            if (totalPagesEl) totalPagesEl.textContent = result.pagination.totalPages || '1';
            
            // Update pagination buttons
            const prevBtn = document.getElementById('prevUsersPage');
            const nextBtn = document.getElementById('nextUsersPage');
            
            if (prevBtn) {
                prevBtn.disabled = result.pagination.currentPage <= 1;
                prevBtn.onclick = () => loadUsersPage(result.pagination.currentPage - 1);
            }
            if (nextBtn) {
                nextBtn.disabled = result.pagination.currentPage >= result.pagination.totalPages;
                nextBtn.onclick = () => loadUsersPage(result.pagination.currentPage + 1);
            }
        } else {
            throw new Error(result.message || 'Failed to load users');
        }
        
        console.log('Users page loaded successfully');
        
    } catch (error) {
        console.error('Error loading users page:', error);
        showNotification('Failed to load users page.', 'error');
        
        // Show error in table
        const tableBody = document.getElementById('usersTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-red-500">Failed to load users</td></tr>';
        }
    }
}

// Load bookings page
async function loadBookingsPage(pageNumber) {
    console.log('Loading bookings page:', pageNumber);
    
    try {
        // Update current page
        currentBookingsPage = pageNumber;
        
        // Show loading state
        const tableBody = document.getElementById('bookingsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center p-4">Loading bookings...</td></tr>';
        }
        
        // Fetch bookings from API with pagination
        const response = await fetch(`${API_BASE_URL}/bookings?page=${pageNumber}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update bookings table
            if (tableBody) {
                if (result.bookings && result.bookings.length > 0) {
                    tableBody.innerHTML = result.bookings.map(booking => `
                        <tr>
                            <td class="text-left p-4 border-b">${booking.id}</td>
                            <td class="text-left p-4 border-b">${booking.hotel_name}</td>
                            <td class="text-left p-4 border-b">${booking.guest_name}</td>
                            <td class="text-left p-4 border-b">${formatDate(booking.check_in)}</td>
                            <td class="text-left p-4 border-b">${formatDate(booking.check_out)}</td>
                            <td class="text-left p-4 border-b"><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                            <td class="text-left p-4 border-b">${formatCurrency(booking.total_price)}</td>
                            <td class="text-left p-4 border-b">
                                <div class="action-buttons">
                                    <button class="action-btn view" onclick="viewBooking(${booking.id})" title="View">
                                        <span>👁️</span>
                                    </button>
                                    <button class="action-btn edit" onclick="editBooking(${booking.id})" title="Edit">
                                        <span>✏️</span>
                                    </button>
                                    ${booking.status === 'pending' ? 
                                        `<button class="action-btn edit bg-green-500 text-white hover:bg-green-600" onclick="processBookingPayment(${booking.id}, ${booking.total_price})" title="Process Payment">
                                            <span>💳</span>
                                        </button>` : ''}
                                    <button class="action-btn delete" onclick="deleteBooking(${booking.id})" title="Delete">
                                        <span>🗑️</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="8" class="text-center p-4">No bookings found</td></tr>';
                }
            }
            
            // Update pagination info
            const totalCountEl = document.getElementById('bookingsTotalCount');
            const currentPageEl = document.getElementById('currentBookingsPage');
            const totalPagesEl = document.getElementById('totalBookingsPages');
            
            if (totalCountEl) totalCountEl.textContent = result.pagination.totalCount || '0';
            if (currentPageEl) currentPageEl.textContent = result.pagination.currentPage || '1';
            if (totalPagesEl) totalPagesEl.textContent = result.pagination.totalPages || '1';
            
            // Update pagination buttons
            const prevBtn = document.getElementById('prevBookingsPage');
            const nextBtn = document.getElementById('nextBookingsPage');
            
            if (prevBtn) {
                prevBtn.disabled = result.pagination.currentPage <= 1;
                prevBtn.onclick = () => loadBookingsPage(result.pagination.currentPage - 1);
            }
            if (nextBtn) {
                nextBtn.disabled = result.pagination.currentPage >= result.pagination.totalPages;
                nextBtn.onclick = () => loadBookingsPage(result.pagination.currentPage + 1);
            }
        } else {
            throw new Error(result.message || 'Failed to load bookings');
        }
        
        console.log('Bookings page loaded successfully');
        
    } catch (error) {
        console.error('Error loading bookings page:', error);
        showNotification('Failed to load bookings page.', 'error');
        
        // Show error in table
        const tableBody = document.getElementById('bookingsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="8" class="text-center p-4 text-red-500">Failed to load bookings</td></tr>';
        }
    }
}

// User Management Functions
async function loadUsersData() {
    try {
        console.log('Loading users data...');
        
        // Fetch users from API
        const response = await fetch(API_BASE_URL + '/auth', {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update users table
            const tableBody = document.getElementById('usersTableBody');
            if (tableBody) {
                tableBody.innerHTML = result.users.map(user => `
                    <tr>
                        <td class="text-left p-4 border-b">${user.id}</td>
                        <td class="text-left p-4 border-b">${user.name}</td>
                        <td class="text-left p-4 border-b">${user.email}</td>
                        <td class="text-left p-4 border-b">${user.role}</td>
                        <td class="text-left p-4 border-b"><span class="status-badge status-active">Active</span></td>
                        <td class="text-left p-4 border-b">${formatDate(user.created_at)}</td>
                        <td class="text-left p-4 border-b">
                            <div class="action-buttons">
                                <button class="action-btn view" onclick="viewUser(${user.id})" title="View">
                                    <span>👁️</span>
                                </button>
                                <button class="action-btn edit" onclick="editUser(${user.id})" title="Edit">
                                    <span>✏️</span>
                                </button>
                                <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete">
                                    <span>🗑️</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Update pagination info
            const totalCountEl = document.getElementById('usersTotalCount');
            const currentPageEl = document.getElementById('currentUsersPage');
            const totalPagesEl = document.getElementById('totalUsersPages');
            
            if (totalCountEl) totalCountEl.textContent = result.users.length || '0';
            if (currentPageEl) currentPageEl.textContent = '1';
            if (totalPagesEl) totalPagesEl.textContent = '1';
        } else {
            throw new Error(result.message || 'Failed to load users');
        }
        
        console.log('Users data loaded successfully');
        
    } catch (error) {
        console.error('Error loading users data:', error);
        showNotification('Failed to load users data.', 'error');
    }
}

// Close add user modal
function closeAddUserModal() {
    const modal = document.getElementById('addUserModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Close edit user modal
function closeEditUserModal() {
    const modal = document.getElementById('editUserModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Booking Management Functions
async function loadBookingsData() {
    try {
        console.log('Loading bookings data...');
        
        // Fetch bookings from API
        const response = await fetch(API_BASE_URL + '/bookings', {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update bookings table
            const tableBody = document.getElementById('bookingsTableBody');
            if (tableBody) {
                tableBody.innerHTML = result.bookings.map(booking => `
                    <tr>
                        <td class="text-left p-4 border-b">${booking.id}</td>
                        <td class="text-left p-4 border-b">${booking.hotel_name}</td>
                        <td class="text-left p-4 border-b">${booking.guest_name}</td>
                        <td class="text-left p-4 border-b">${formatDate(booking.check_in)}</td>
                        <td class="text-left p-4 border-b">${formatDate(booking.check_out)}</td>
                        <td class="text-left p-4 border-b"><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                        <td class="text-left p-4 border-b">${formatCurrency(booking.total_price)}</td>
                        <td class="text-left p-4 border-b">
                            <div class="action-buttons">
                                <button class="action-btn view" onclick="viewBooking(${booking.id})" title="View">
                                    <span>👁️</span>
                                </button>
                                <button class="action-btn edit" onclick="editBooking(${booking.id})" title="Edit">
                                    <span>✏️</span>
                                </button>
                                ${booking.status === 'pending' ? 
                                    `<button class="action-btn edit bg-green-500 text-white hover:bg-green-600" onclick="processBookingPayment(${booking.id}, ${booking.total_price})" title="Process Payment">
                                        <span>💳</span>
                                    </button>` : ''}
                                <button class="action-btn delete" onclick="deleteBooking(${booking.id})" title="Delete">
                                    <span>🗑️</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
            }
            
            // Update pagination info
            const totalCountEl = document.getElementById('bookingsTotalCount');
            const currentPageEl = document.getElementById('currentBookingsPage');
            const totalPagesEl = document.getElementById('totalBookingsPages');
            
            if (totalCountEl) totalCountEl.textContent = result.pagination.totalCount || '0';
            if (currentPageEl) currentPageEl.textContent = result.pagination.currentPage || '1';
            if (totalPagesEl) totalPagesEl.textContent = result.pagination.totalPages || '1';
            
            // Update pagination buttons
            const prevBtn = document.getElementById('prevBookingsPage');
            const nextBtn = document.getElementById('nextBookingsPage');
            
            if (prevBtn) {
                prevBtn.disabled = result.pagination.currentPage <= 1;
            }
            if (nextBtn) {
                nextBtn.disabled = result.pagination.currentPage >= result.pagination.totalPages;
            }
        } else {
            throw new Error(result.message || 'Failed to load bookings');
        }
        
        console.log('Bookings data loaded successfully');
        
    } catch (error) {
        console.error('Error loading bookings data:', error);
        showNotification('Failed to load bookings data.', 'error');
    }
}

// Handle add booking form submission
async function handleAddBooking(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Get form values
    const bookingData = {
        hotel_id: parseInt(formData.get('addBookingHotel')),
        guest_name: formData.get('addBookingGuest'),
        guest_email: formData.get('addBookingEmail'),
        guest_phone: formData.get('addBookingPhone'),
        check_in: formData.get('addBookingCheckIn'),
        check_out: formData.get('addBookingCheckOut'),
        guests: parseInt(formData.get('addBookingGuests')),
        rooms: parseInt(formData.get('addBookingRooms')),
        total_price: parseFloat(formData.get('addBookingTotal')),
        status: formData.get('addBookingStatus')
    };
    
    // Validate hotel selection
    if (!bookingData.hotel_id || isNaN(bookingData.hotel_id)) {
        showNotification('Please select a valid hotel', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add booking');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Booking added successfully!', 'success');
            closeAddBookingModal();
            // Reload bookings data
            loadBookingsData();
        } else {
            throw new Error(result.message || 'Failed to add booking');
        }
    } catch (error) {
        console.error('Error adding booking:', error);
        showNotification('Failed to add booking: ' + error.message, 'error');
    }
}

// Handle edit booking form submission
async function handleEditBooking(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const bookingId = formData.get('editBookingId');
    
    // Get form values
    const bookingData = {
        hotel_id: parseInt(formData.get('editBookingHotel')),
        guest_name: formData.get('editBookingGuest'),
        guest_email: formData.get('editBookingEmail'),
        guest_phone: formData.get('editBookingPhone'),
        check_in: formData.get('editBookingCheckIn'),
        check_out: formData.get('editBookingCheckOut'),
        guests: parseInt(formData.get('editBookingGuests')),
        rooms: parseInt(formData.get('editBookingRooms')),
        total_price: parseFloat(formData.get('editBookingTotal')),
        status: formData.get('editBookingStatus')
    };
    
    // Validate hotel selection
    if (!bookingData.hotel_id || isNaN(bookingData.hotel_id)) {
        showNotification('Please select a valid hotel', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(bookingData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update booking');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Booking updated successfully!', 'success');
            closeEditBookingModal();
            // Reload bookings data
            loadBookingsData();
        } else {
            throw new Error(result.message || 'Failed to update booking');
        }
    } catch (error) {
        console.error('Error updating booking:', error);
        showNotification('Failed to update booking: ' + error.message, 'error');
    }
}

// Open add booking modal
function openAddBookingModal() {
    const modal = document.getElementById('addBookingModal');
    if (modal) {
        modal.style.display = 'flex';
        // Populate hotel dropdown
        populateHotelDropdowns();
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Close add booking modal
function closeAddBookingModal() {
    const modal = document.getElementById('addBookingModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Open edit booking modal
function openEditBookingModal(bookingId) {
    const modal = document.getElementById('editBookingModal');
    if (modal) {
        modal.style.display = 'flex';
        // Populate hotel dropdown
        populateHotelDropdowns();
        // Focus on the first input
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

// Close edit booking modal
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

// Reports and Analytics Functions
async function loadReportsData() {
    try {
        console.log('Loading reports data...');
        
        // Show loading state
        const tableBody = document.getElementById('bookingsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Loading...</td></tr>';
        }
        
        // Fetch bookings report data
        const response = await fetch(API_BASE_URL + '/reports/bookings', {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch reports data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update reports table
            if (tableBody) {
                if (result.bookings && result.bookings.length > 0) {
                    tableBody.innerHTML = result.bookings.map(booking => `
                        <tr>
                            <td class="text-left p-4 border-b">${booking.id}</td>
                            <td class="text-left p-4 border-b">${booking.hotel_name}</td>
                            <td class="text-left p-4 border-b">${booking.guest_name}</td>
                            <td class="text-left p-4 border-b">${formatDate(booking.check_in)}</td>
                            <td class="text-left p-4 border-b">${formatDate(booking.check_out)}</td>
                            <td class="text-left p-4 border-b"><span class="status-badge status-${booking.status}">${booking.status}</span></td>
                            <td class="text-left p-4 border-b">${formatCurrency(booking.total_price)}</td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No bookings found</td></tr>';
                }
            }
            
            // Update stats
            const totalBookingsEl = document.getElementById('totalBookings');
            const totalRevenueEl = document.getElementById('totalRevenue');
            
            if (totalBookingsEl) totalBookingsEl.textContent = result.count || '0';
            if (totalRevenueEl) {
                // Calculate total revenue from bookings
                const totalRevenue = result.bookings ? result.bookings.reduce((sum, booking) => {
                    const price = parseFloat(booking.total_price);
                    return sum + (isNaN(price) ? 0 : price);
                }, 0) : 0;
                totalRevenueEl.textContent = formatCurrency(totalRevenue);
            }
        } else {
            throw new Error(result.message || 'Failed to load reports data');
        }
        
        console.log('Reports data loaded successfully');
        
    } catch (error) {
        console.error('Error loading reports data:', error);
        showNotification('Failed to load reports data.', 'error');
        
        // Show error in table
        const tableBody = document.getElementById('bookingsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-red-500">Failed to load reports</td></tr>';
        }
    }
}

// Financial Management Functions
async function loadFinancialsData() {
    try {
        console.log('Loading financials data...');
        
        // Show loading state
        const tableBody = document.getElementById('transactionsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">Loading financial data...</td></tr>';
        }
        
        // Fetch financial summary data
        const response = await fetch(API_BASE_URL + '/financial/summary', {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch financial data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Update financial stats
            const monthlyRevenueEl = document.getElementById('monthlyRevenue');
            const pendingPaymentsEl = document.getElementById('pendingPayments');
            const refundedAmountEl = document.getElementById('refundedAmount');
            const commissionEarnedEl = document.getElementById('commissionEarned');
            
            if (monthlyRevenueEl) monthlyRevenueEl.textContent = formatCurrency(result.summary.totalRevenue || 0);
            if (pendingPaymentsEl) pendingPaymentsEl.textContent = Math.floor((result.summary.pendingRevenue || 0) / 50) || '0'; // Estimating based on avg booking
            if (refundedAmountEl) refundedAmountEl.textContent = formatCurrency(0);
            if (commissionEarnedEl) commissionEarnedEl.textContent = formatCurrency(result.summary.totalRevenue * 0.1 || 0); // Assuming 10% commission
            
            // Update transactions table with revenue by month
            if (tableBody && result.summary.revenueByMonth) {
                const revenueEntries = Object.entries(result.summary.revenueByMonth);
                if (revenueEntries.length > 0) {
                    tableBody.innerHTML = revenueEntries.map(([period, amount]) => `
                        <tr>
                            <td class="text-left p-4 border-b">REV-${period.replace('-', '')}</td>
                            <td class="text-left p-4 border-b">${period}</td>
                            <td class="text-left p-4 border-b">Monthly Revenue</td>
                            <td class="text-left p-4 border-b">Revenue</td>
                            <td class="text-left p-4 border-b">${formatCurrency(amount)}</td>
                            <td class="text-left p-4 border-b"><span class="status-badge status-confirmed">Completed</span></td>
                            <td class="text-left p-4 border-b">
                                <div class="action-buttons">
                                    <button class="action-btn view bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600" title="View">
                                        <span>👁️</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('');
                } else {
                    tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4">No financial transactions found</td></tr>';
                }
            }
            
            // Update pagination info
            const totalCountEl = document.getElementById('transactionsTotalCount');
            const currentPageEl = document.getElementById('currentTransactionsPage');
            const totalPagesEl = document.getElementById('totalTransactionsPages');
            
            if (totalCountEl && result.summary.revenueByMonth) {
                totalCountEl.textContent = Object.keys(result.summary.revenueByMonth).length || '0';
            }
            if (currentPageEl) currentPageEl.textContent = '1';
            if (totalPagesEl && result.summary.revenueByMonth) {
                totalPagesEl.textContent = Math.ceil(Object.keys(result.summary.revenueByMonth).length / 10) || '1';
            }
            
            // Update charts
            updateFinancialCharts(result);
        } else {
            throw new Error(result.message || 'Failed to load financial data');
        }
        
        console.log('Financial data loaded successfully');
        
    } catch (error) {
        console.error('Error loading financial data:', error);
        showNotification('Failed to load financial data.', 'error');
        
        // Show error in transactions table
        const tableBody = document.getElementById('transactionsTableBody');
        if (tableBody) {
            tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-4 text-red-500">Failed to load financial data</td></tr>';
        }
    }
}

// Process payment for a booking (fake implementation)
async function processBookingPayment(bookingId, amount) {
    try {
        // Set the booking ID and amount in the payment form
        document.getElementById('paymentBookingId').value = bookingId;
        document.getElementById('paymentAmount').value = amount;
        
        // Show the payment modal
        const modal = document.getElementById('processPaymentModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // Focus on the first input
            const firstInput = modal.querySelector('input, textarea, select');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    } catch (error) {
        console.error('Error opening payment modal:', error);
        showNotification('Failed to open payment modal: ' + error.message, 'error');
    }
}

// Close process payment modal
function closeProcessPaymentModal() {
    const modal = document.getElementById('processPaymentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Handle payment form submission
async function handleProcessPayment(e) {
    e.preventDefault();
    
    try {
        const bookingId = document.getElementById('paymentBookingId').value;
        const paymentMethod = document.getElementById('paymentMethod').value;
        const amount = document.getElementById('paymentAmount').value;
        
        // Show loading indicator
        showNotification('Processing payment...', 'info');
        closeProcessPaymentModal();
        
        // Simulate payment processing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Generate a fake transaction ID
        const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
        
        // Update booking status to 'completed' and add transaction ID
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify({
                status: 'completed',
                transaction_id: transactionId
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update booking');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification(`Payment processed successfully! Transaction ID: ${transactionId}`, 'success');
            // Reload bookings data
            loadBookingsData();
        } else {
            throw new Error(result.message || 'Failed to update booking');
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        showNotification('Payment processing failed: ' + error.message, 'error');
    }
}

// Show/hide card details based on payment method
function toggleCardDetails() {
    const paymentMethod = document.getElementById('paymentMethod').value;
    const cardDetails = document.getElementById('cardDetails');
    
    if (paymentMethod === 'card') {
        cardDetails.style.display = 'block';
    } else {
        cardDetails.style.display = 'none';
    }
}

function openEditRoomModal(hotel) {
    // Populate the form with hotel data
    document.getElementById('editRoomId').value = hotel.id;
    document.getElementById('editRoomName').value = hotel.name;
    document.getElementById('editRoomLocation').value = hotel.location;
    document.getElementById('editRoomPrice').value = hotel.price;
    document.getElementById('editRoomRating').value = hotel.rating;
    document.getElementById('editRoomImage').value = hotel.image;
    document.getElementById('editRoomDescription').value = hotel.description || '';
    document.getElementById('editRoomAmenities').value = hotel.amenities ? hotel.amenities.join(', ') : '';
    
    // Show the modal
    document.getElementById('editRoomModal').style.display = 'flex';
}

function closeEditRoomModal() {
    document.getElementById('editRoomModal').style.display = 'none';
}

// Update financial charts with data
function updateFinancialCharts(financialData) {
    try {
        // Update revenue chart
        const revenueCtx = document.getElementById('financialRevenueChart');
        if (revenueCtx) {
            // Destroy existing chart if it exists
            if (revenueCtx.chart) {
                revenueCtx.chart.destroy();
            }
            
            // Create sample data for the chart
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const revenueData = months.map((_, index) => {
                const monthKey = `${new Date().getFullYear()}-${String(index + 1).padStart(2, '0')}`;
                return financialData.summary.revenueByMonth?.[monthKey] || 0;
            });
            
            revenueCtx.chart = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Revenue',
                        data: revenueData,
                        borderColor: 'rgb(75, 192, 192)',
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Monthly Revenue'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
        
        // Update payment methods chart
        const paymentCtx = document.getElementById('paymentMethodsChart');
        if (paymentCtx) {
            // Destroy existing chart if it exists
            if (paymentCtx.chart) {
                paymentCtx.chart.destroy();
            }
            
            // Create sample data for payment methods chart
            const paymentMethods = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer'];
            const paymentData = [45, 30, 15, 10]; // Sample data
            
            paymentCtx.chart = new Chart(paymentCtx, {
                type: 'doughnut',
                data: {
                    labels: paymentMethods,
                    datasets: [{
                        label: 'Payment Methods',
                        data: paymentData,
                        backgroundColor: [
                            'rgb(255, 99, 132)',
                            'rgb(54, 162, 235)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)'
                        ],
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Payment Methods Distribution'
                        }
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating financial charts:', error);
        showNotification('Failed to update financial charts.', 'error');
    }
}

// Utility Functions
function showNotification(message, type = 'info', duration = 3000) {
    console.log(`Notification [${type}]: ${message}`);
    
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
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.backgroundColor = '#10b981';
            break;
        case 'error':
            notification.style.backgroundColor = '#ef4444';
            break;
        case 'warning':
            notification.style.backgroundColor = '#f59e0b';
            break;
        default:
            notification.style.backgroundColor = '#3b82f6';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove notification after duration
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.remove('show');
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
    
    return notification;
}

// Image upload listeners
function setupImageUploadListeners() {
    console.log('Setting up image upload listeners');
    
    // Add hotel form image upload
    const addHotelImage = document.getElementById('addHotelImage');
    const addHotelImagePreview = document.getElementById('addHotelImagePreview');
    
    if (addHotelImage && addHotelImagePreview) {
        addHotelImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = addHotelImagePreview.querySelector('img');
                    if (img) {
                        img.src = e.target.result;
                        addHotelImagePreview.classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Edit hotel form image upload
    const editHotelImage = document.getElementById('editHotelImage');
    const editHotelImagePreview = document.getElementById('editHotelImagePreview');
    
    if (editHotelImage && editHotelImagePreview) {
        editHotelImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = editHotelImagePreview.querySelector('img');
                    if (img) {
                        img.src = e.target.result;
                        editHotelImagePreview.classList.remove('hidden');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

function setupModalCloseHandlers() {
    console.log('Modal close handlers would be set up here');
}

// Global search handler
async function handleGlobalSearch(e) {
    const searchTerm = e.target.value.trim();
    console.log('Global search:', searchTerm);
    
    // Debounce search to avoid too many API calls
    clearTimeout(window.globalSearchTimeout);
    window.globalSearchTimeout = setTimeout(async () => {
        if (searchTerm.length > 0) {
            showNotification('Searching...', 'info', 1000);
            
            try {
                // Search across multiple endpoints
                const searchPromises = [
                    fetch(`${API_BASE_URL}/hotels?search=${encodeURIComponent(searchTerm)}`, {
                        headers: {
                            'Authorization': `Bearer ${currentUser.token}`
                        }
                    }),
                    fetch(`${API_BASE_URL}/auth?search=${encodeURIComponent(searchTerm)}`, {
                        headers: {
                            'Authorization': `Bearer ${currentUser.token}`
                        }
                    }),
                    fetch(`${API_BASE_URL}/bookings?search=${encodeURIComponent(searchTerm)}`, {
                        headers: {
                            'Authorization': `Bearer ${currentUser.token}`
                        }
                    })
                ];
                
                const responses = await Promise.all(searchPromises);
                const results = await Promise.all(responses.map(r => r.json()));
                
                // Process results
                const hotels = results[0].success ? results[0].hotels : [];
                const users = results[1].success ? results[1].users : [];
                const bookings = results[2].success ? results[2].bookings : [];
                
                console.log('Search results:', { hotels, users, bookings });
                
                // Show notification with results count
                const totalResults = hotels.length + users.length + bookings.length;
                showNotification(`Found ${totalResults} results for "${searchTerm}"`, 'success');
                
                // In a real implementation, this would update the UI with search results
                // For now, we'll just show an alert
                alert(`Search Results for "${searchTerm}":
Hotels: ${hotels.length}
Users: ${users.length}
Bookings: ${bookings.length}`);
                
            } catch (error) {
                console.error('Search error:', error);
                showNotification('Search failed: ' + error.message, 'error');
            }
        }
    }, 300); // 300ms debounce
}

function handleRoomSearch(e) {
    console.log('Room search:', e.target.value);
}

function handleResize() {
    console.log('Window resized');
}

// Format functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
}

// Form Submission Handlers
function setupFormSubmissionHandlers() {
    console.log('Setting up form submission handlers');
    
    // Add hotel form
    const addHotelForm = document.getElementById('addHotelForm');
    if (addHotelForm) {
        addHotelForm.addEventListener('submit', handleAddHotel);
    }
    
    // Edit hotel form
    const editHotelForm = document.getElementById('editHotelForm');
    if (editHotelForm) {
        editHotelForm.addEventListener('submit', handleEditHotel);
    }
    
    // Add user form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
    
    // Edit user form
    const editUserForm = document.getElementById('editUserForm');
    if (editUserForm) {
        editUserForm.addEventListener('submit', handleEditUser);
    }
    
    // Add booking form
    const addBookingForm = document.getElementById('addBookingForm');
    if (addBookingForm) {
        addBookingForm.addEventListener('submit', handleAddBooking);
    }
    
    // Edit booking form
    const editBookingForm = document.getElementById('editBookingForm');
    if (editBookingForm) {
        editBookingForm.addEventListener('submit', handleEditBooking);
    }
    
    // Process payment form
    const processPaymentForm = document.getElementById('processPaymentForm');
    if (processPaymentForm) {
        processPaymentForm.addEventListener('submit', handleProcessPayment);
    }
}

// Handle add hotel form submission
async function handleAddHotel(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    try {
        // First, upload the image to Supabase storage if provided
        let imageUrl = '';
        const imageFile = formData.get('addHotelImage');
        
        if (imageFile && imageFile.size > 0) {
            const imageFormData = new FormData();
            imageFormData.append('file', imageFile);
            
            // Upload image to Supabase storage
            const imageResponse = await fetch(API_BASE_URL + '/hotels/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: imageFormData
            });
            
            const imageResult = await imageResponse.json();
            
            if (!imageResult.success) {
                throw new Error(imageResult.message || 'Failed to upload image');
            }
            
            imageUrl = imageResult.imageUrl;
        }
        
        // Get form values
        const hotelData = {
            name: formData.get('addHotelName'),
            location: formData.get('addHotelLocation'),
            distance: formData.get('addHotelDistance'),
            rating: parseFloat(formData.get('addHotelRating')) || 0,
            price: parseFloat(formData.get('addHotelPrice')) || 0,
            description: formData.get('addHotelDescription'),
            image: imageUrl, // Add the image URL to hotel data
            amenities: formData.get('addHotelAmenities') ? formData.get('addHotelAmenities').split(',').map(a => a.trim()) : []
        };
        
        const response = await fetch(API_BASE_URL + '/hotels', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(hotelData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add hotel');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel added successfully!', 'success');
            closeAddHotelModal();
            // Reload hotel data
            loadRoomsData();
        } else {
            throw new Error(result.message || 'Failed to add hotel');
        }
    } catch (error) {
        console.error('Error adding hotel:', error);
        showNotification('Failed to add hotel: ' + error.message, 'error');
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

// Handle edit hotel form submission
async function handleEditHotel(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const hotelId = formData.get('editHotelId');
    
    try {
        // First, upload the image to Supabase storage if provided
        let imageUrl = '';
        const imageFile = formData.get('editHotelImage');
        
        if (imageFile && imageFile.size > 0) {
            const imageFormData = new FormData();
            imageFormData.append('file', imageFile);
            
            // Upload image to Supabase storage
            const imageResponse = await fetch(API_BASE_URL + '/hotels/upload-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${currentUser.token}`
                },
                body: imageFormData
            });
            
            const imageResult = await imageResponse.json();
            
            if (!imageResult.success) {
                throw new Error(imageResult.message || 'Failed to upload image');
            }
            
            imageUrl = imageResult.imageUrl;
        }
        
        // Get form values
        const hotelData = {
            name: formData.get('editHotelName'),
            location: formData.get('editHotelLocation'),
            distance: formData.get('editHotelDistance'),
            rating: parseFloat(formData.get('editHotelRating')) || 0,
            price: parseFloat(formData.get('editHotelPrice')) || 0,
            description: formData.get('editHotelDescription'),
            amenities: formData.get('editHotelAmenities') ? formData.get('editHotelAmenities').split(',').map(a => a.trim()) : []
        };
        
        // Only add image to hotelData if a new image was uploaded
        if (imageUrl) {
            hotelData.image = imageUrl;
        }
        
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(hotelData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update hotel');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel updated successfully!', 'success');
            closeEditHotelModal();
            // Reload hotel data
            loadRoomsData();
        } else {
            throw new Error(result.message || 'Failed to update hotel');
        }
    } catch (error) {
        console.error('Error updating hotel:', error);
        showNotification('Failed to update hotel: ' + error.message, 'error');
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
    }
}

// Handle add user form submission
async function handleAddUser(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Get form values
    const userData = {
        name: formData.get('addUserName'),
        email: formData.get('addUserEmail'),
        phone: formData.get('addUserPhone'),
        role_id: getRoleIdFromRoleName(formData.get('addUserRole')),
        // Note: In a real implementation, you would also handle password creation
    };
    
    try {
        const response = await fetch(API_BASE_URL + '/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to add user');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('User added successfully!', 'success');
            closeAddUserModal();
            // Reload users data
            loadUsersData();
        } else {
            throw new Error(result.message || 'Failed to add user');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        showNotification('Failed to add user.', 'error');
    }
}

// Handle edit user form submission
async function handleEditUser(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const userId = formData.get('editUserId');
    
    // Get form values
    const userData = {
        name: formData.get('editUserName'),
        email: formData.get('editUserEmail'),
        phone: formData.get('editUserPhone')
        // Note: In a real implementation, you might also allow changing user roles
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.token}`
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update user');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('User updated successfully!', 'success');
            closeEditUserModal();
            // Reload users data
            loadUsersData();
        } else {
            throw new Error(result.message || 'Failed to update user');
        }
    } catch (error) {
        console.error('Error updating user:', error);
        showNotification('Failed to update user.', 'error');
    }
}

// Helper function to convert role name to role ID
function getRoleIdFromRoleName(roleName) {
    switch (roleName) {
        case 'admin':
            return 1;
        case 'user':
            return 2;
        default:
            return 2; // Default to user role
    }
}

// Populate hotel dropdowns in booking forms
async function populateHotelDropdowns() {
    try {
        // Fetch hotels data
        const response = await fetch(API_BASE_URL + '/hotels?limit=1000', {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch hotels');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Populate add booking hotel dropdown
            const addBookingHotelSelect = document.getElementById('addBookingHotel');
            if (addBookingHotelSelect) {
                addBookingHotelSelect.innerHTML = '<option value="">Select a hotel</option>';
                result.hotels.forEach(hotel => {
                    const option = document.createElement('option');
                    option.value = hotel.id;
                    option.textContent = hotel.name;
                    addBookingHotelSelect.appendChild(option);
                });
            }
            
            // Populate edit booking hotel dropdown
            const editBookingHotelSelect = document.getElementById('editBookingHotel');
            if (editBookingHotelSelect) {
                editBookingHotelSelect.innerHTML = '<option value="">Select a hotel</option>';
                result.hotels.forEach(hotel => {
                    const option = document.createElement('option');
                    option.value = hotel.id;
                    option.textContent = hotel.name;
                    editBookingHotelSelect.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error populating hotel dropdowns:', error);
        showNotification('Failed to load hotel list: ' + error.message, 'error');
    }
}

// Hotel search functionality for booking forms
function setupHotelSearchListeners() {
    // Add booking hotel search
    const addHotelSearch = document.getElementById('addBookingHotelSearch');
    const addHotelSelect = document.getElementById('addBookingHotel');
    
    if (addHotelSearch && addHotelSelect) {
        addHotelSearch.addEventListener('input', debounce(async function(e) {
            const searchTerm = e.target.value.trim();
            await filterHotelOptions(addHotelSelect, searchTerm);
        }, 300));
    }
    
    // Edit booking hotel search
    const editHotelSearch = document.getElementById('editBookingHotelSearch');
    const editHotelSelect = document.getElementById('editBookingHotel');
    
    if (editHotelSearch && editHotelSelect) {
        editHotelSearch.addEventListener('input', debounce(async function(e) {
            const searchTerm = e.target.value.trim();
            await filterHotelOptions(editHotelSelect, searchTerm);
        }, 300));
    }
}

// Filter hotel options based on search term
async function filterHotelOptions(selectElement, searchTerm) {
    try {
        // If search term is empty, populate with all hotels
        if (!searchTerm) {
            await populateHotelDropdown(selectElement.id);
            return;
        }
        
        // Fetch filtered hotels from API
        const response = await fetch(`${API_BASE_URL}/hotels?search=${encodeURIComponent(searchTerm)}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch hotels');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Clear existing options except the default one
            while (selectElement.options.length > 1) {
                selectElement.remove(1);
            }
            
            // Add filtered hotel options
            result.hotels.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.id;
                option.textContent = hotel.name;
                selectElement.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error filtering hotel options:', error);
        showNotification('Failed to filter hotels: ' + error.message, 'error');
    }
}

// Helper function to populate hotel dropdown
async function populateHotelDropdown(selectElementId) {
    try {
        const hotelSelect = document.getElementById(selectElementId);
        if (!hotelSelect) {
            console.warn(`Hotel select element with ID '${selectElementId}' not found`);
            return;
        }
        
        // Clear existing options except the default one
        while (hotelSelect.options.length > 1) {
            hotelSelect.remove(1);
        }
        
        // Fetch hotels from API
        const response = await fetch(`${API_BASE_URL}/hotels?limit=1000`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch hotels');
        }
        
        const result = await response.json();
        
        if (result.success && result.hotels) {
            // Add hotel options to the dropdown
            result.hotels.forEach(hotel => {
                const option = document.createElement('option');
                option.value = hotel.id;
                option.textContent = hotel.name;
                hotelSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error populating hotel dropdown:', error);
        showNotification('Failed to load hotel list: ' + error.message, 'error');
    }
}

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// Room search handler
async function handleRoomSearch(e) {
    const searchTerm = e.target.value.trim();
    console.log('Room search:', searchTerm);
    
    // Debounce search to avoid too many API calls
    clearTimeout(window.roomSearchTimeout);
    window.roomSearchTimeout = setTimeout(async () => {
        if (searchTerm.length > 0) {
            try {
                // Search hotels
                const response = await fetch(`${API_BASE_URL}/hotels?search=${encodeURIComponent(searchTerm)}`, {
                    headers: {
                        'Authorization': `Bearer ${currentUser.token}`
                    }
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Transform hotel data to match room structure
                    appData.rooms = result.hotels.map((hotel, index) => ({
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
                        image: hotel.image, // Use the image field directly
                        images: hotel.gallery || [hotel.image] // Keep for backward compatibility
                    }));
                    
                    renderRoomsContent();
                    showNotification(`Found ${result.hotels.length} hotels matching "${searchTerm}"`, 'success');
                } else {
                    showNotification('Search failed: ' + (result.message || 'Unknown error'), 'error');
                }
            } catch (error) {
                console.error('Room search error:', error);
                showNotification('Room search failed: ' + error.message, 'error');
            }
        } else {
            // If search term is empty, reload all rooms
            loadRoomsData();
        }
    }, 300); // 300ms debounce
}

// Booking Management Functions

// View booking details
async function viewBooking(bookingId) {
    console.log('Viewing booking:', bookingId);
    
    try {
        // Show loading indicator
        showNotification('Loading booking data...', 'info', 1000);
        
        // Fetch booking data from API
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch booking data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            const booking = result.booking;
            
            // Show booking details in an alert for now
            // In a real implementation, this would open a modal with booking details
            let bookingDetails = `Booking Details:\n\n`;
            bookingDetails += `ID: ${booking.id}\n`;
            bookingDetails += `Hotel: ${booking.hotel_name}\n`;
            bookingDetails += `Guest: ${booking.guest_name}\n`;
            bookingDetails += `Email: ${booking.guest_email}\n`;
            bookingDetails += `Phone: ${booking.guest_phone || 'N/A'}\n`;
            bookingDetails += `Check-in: ${formatDate(booking.check_in)}\n`;
            bookingDetails += `Check-out: ${formatDate(booking.check_out)}\n`;
            bookingDetails += `Guests: ${booking.guests}\n`;
            bookingDetails += `Rooms: ${booking.rooms}\n`;
            bookingDetails += `Total Price: ${formatCurrency(booking.total_price)}\n`;
            bookingDetails += `Status: ${booking.status}\n`;
            bookingDetails += `Created At: ${formatDate(booking.created_at)}\n`;
            
            alert(bookingDetails);
        } else {
            throw new Error(result.message || 'Failed to load booking data');
        }
    } catch (error) {
        console.error('Error loading booking data:', error);
        showNotification('Failed to load booking data: ' + error.message, 'error');
    }
}

// Edit booking details
async function editBooking(bookingId) {
    console.log('Editing booking:', bookingId);
    
    try {
        // Show loading indicator
        showNotification('Loading booking data...', 'info', 1000);
        
        // Fetch booking data from API
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch booking data');
        }
        
        const result = await response.json();
        
        if (result.success) {
            const booking = result.booking;
            
            // First, populate the hotel dropdown with available hotels
            await populateHotelDropdown('editBookingHotel');
            
            // Populate the edit booking form with booking data
            document.getElementById('editBookingId').value = booking.id;
            document.getElementById('editBookingGuest').value = booking.guest_name || '';
            document.getElementById('editBookingEmail').value = booking.guest_email || '';
            document.getElementById('editBookingPhone').value = booking.guest_phone || '';
            document.getElementById('editBookingCheckIn').value = booking.check_in ? booking.check_in.split('T')[0] : '';
            document.getElementById('editBookingCheckOut').value = booking.check_out ? booking.check_out.split('T')[0] : '';
            document.getElementById('editBookingGuests').value = booking.guests || '';
            document.getElementById('editBookingRooms').value = booking.rooms || '';
            document.getElementById('editBookingTotal').value = booking.total_price || '';
            document.getElementById('editBookingStatus').value = booking.status || 'pending';
            
            // Set the hotel selection - we need to find the hotel ID that matches the hotel name
            const hotelSelect = document.getElementById('editBookingHotel');
            if (hotelSelect && booking.hotel_name) {
                // Try to find an option that matches the hotel name
                for (let i = 0; i < hotelSelect.options.length; i++) {
                    if (hotelSelect.options[i].text === booking.hotel_name) {
                        hotelSelect.selectedIndex = i;
                        break;
                    }
                }
                // If we can't find a matching option, we might need to add it
                // But for now, we'll just leave it as is
            }
            
            // Show the edit booking modal
            const modal = document.getElementById('editBookingModal');
            if (modal) {
                modal.style.display = 'flex';
                
                // Focus on the first input
                const firstInput = modal.querySelector('input, textarea, select');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 100);
                }
            }
        } else {
            throw new Error(result.message || 'Failed to load booking data');
        }
    } catch (error) {
        console.error('Error loading booking data:', error);
        showNotification('Failed to load booking data: ' + error.message, 'error');
    }
}

// Delete booking
async function deleteBooking(bookingId) {
    if (!confirm('Are you sure you want to delete this booking?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete booking');
        }
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Booking deleted successfully!', 'success');
            // Reload bookings data
            loadBookingsData();
        } else {
            throw new Error(result.message || 'Failed to delete booking');
        }
    } catch (error) {
        console.error('Error deleting booking:', error);
        showNotification('Failed to delete booking: ' + error.message, 'error');
    }
}