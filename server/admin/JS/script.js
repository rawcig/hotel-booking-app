// Application Data
let appData = {
    rooms: [],
    availableRooms: [],
    bookings: []
};

// Application State
let currentPage = 'login';
let currentUser = null;
let searchFilters = {};

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
function initializeApp() {
    setupEventListeners();
    showPage('login');
    
    // Check if user is already logged in (in a real app, check localStorage/sessionStorage)
    const savedUser = getStoredUser();
    if (savedUser) {
        currentUser = savedUser;
        showDashboard();
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
    
    // Edit room form
    document.getElementById('editHotelForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateEditHotelForm()) {
            return;
        }
        
        const hotelId = document.getElementById('editHotelId').value;
        const hotelData = {
            name: document.getElementById('editHotelName').value,
            location: document.getElementById('editHotelLocation').value,
            distance: document.getElementById('editHotelDistance').value,
            rating: document.getElementById('editHotelRating').value,
            price: document.getElementById('editHotelPrice').value,
            image: document.getElementById('editHotelImage').value,
            description: document.getElementById('editHotelDescription').value,
            amenities: document.getElementById('editHotelAmenities').value.split(',').map(item => item.trim()).filter(item => item)
        };
        
        // Add loading state to submit button
        const submitButton = document.querySelector('#editHotelForm .auth-btn');
        if (submitButton && !submitButton.classList.contains('loading')) {
            // Store original content
            if (!submitButton.dataset.originalContent) {
                submitButton.dataset.originalContent = submitButton.innerHTML;
            }
            
            // Add loading class
            submitButton.classList.add('loading');
            
            // Add visual indicator
            const spinner = document.createElement('div');
            spinner.className = 'button-spinner';
            spinner.innerHTML = 'Saving...';
            submitButton.innerHTML = '';
            submitButton.appendChild(spinner);
            submitButton.disabled = true;
        }
        
        try {
            const result = await updateHotel(hotelId, hotelData);
            if (result) {
                closeEditHotelModal();
                showNotification('Hotel updated successfully', 'success');
            }
        } catch (error) {
            console.error('Error updating hotel:', error);
            showNotification('Error updating hotel', 'error');
        } finally {
            // Restore submit button state
            const submitButton = document.querySelector('#editHotelForm .auth-btn');
            if (submitButton && submitButton.classList.contains('loading')) {
                submitButton.classList.remove('loading');
                submitButton.innerHTML = submitButton.dataset.originalContent || 'Update Hotel';
                delete submitButton.dataset.originalContent;
                submitButton.disabled = false;
            }
        }
    });
    
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
    loadDashboardData();
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
            case 'rooms':  // This is now Hotel Management
                loadRoomsData();
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
            case 'reports':
                loadReportsData();
                break;
            case 'financials':
                loadFinancialsData();
                break;
            default:
                break;
        }
    }
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
            document.getElementById('totalRevenue').textContent = `${(stats.bookings * 100 || 0).toLocaleString()}`; // Approximate revenue
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
                images: hotel.gallery || [hotel.image]
            }));
            
            renderRoomsContent();
        } else {
            showNotification('Failed to load hotels data', 'error');
        }
    } catch (error) {
        console.error('Error loading hotels data:', error);
        showNotification('Error loading hotels data', 'error');
    }
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
            tableBody.innerHTML = '<tr><td colspan="6" class="loading"><div class="spinner"></div>Loading available rooms...</td></tr>';
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
                    <button class="action-btn edit" onclick="updateBookingStatus(${booking.id}, 'confirmed')" title="Confirm">✓</button>
                    <button class="action-btn delete" onclick="cancelBooking(${booking.id})" title="Cancel">✕</button>
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
                    <button class="action-btn edit" onclick="editRoom(${room.id})" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteRoom(${room.id})" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Helper Functions
function createTableRow(cells) {
    const row = document.createElement('tr');
    cells.forEach(cellContent => {
        const cell = document.createElement('td');
        cell.className = 'text-left p-4 border-b';
        cell.innerHTML = cellContent;
        row.appendChild(cell);
    });
    return row;
}

function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card bg-white rounded-2xl overflow-hidden shadow-md';
    
    const stars = '★'.repeat(Math.floor(room.rating)) + '☆'.repeat(5 - Math.floor(room.rating));
    
    // Use the full hotel name
    const hotelName = room.hname || `Hotel ${room.id}`;
    
    card.innerHTML = `
        <div class="room-image" style="background-image: url('${room.images[0]}')">
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
            <div class="room-actions mt-4">
                <button class="btn-secondary px-4 py-2 bg-gray-200 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-300" onclick="editRoom(${room.id})">Edit Hotel</button>
                <button class="favorite-btn text-2xl" onclick="toggleFavorite(${room.id})">♡</button>
            </div>
        </div>
    `;
    
    return card;
}

// Form Validation
function validateEditHotelForm() {
    const name = document.getElementById('editHotelName').value.trim();
    const location = document.getElementById('editHotelLocation').value.trim();
    const price = parseFloat(document.getElementById('editHotelPrice').value);
    
    if (!name) {
        showNotification('Hotel name is required', 'error');
        return false;
    }
    
    if (!location) {
        showNotification('Location is required', 'error');
        return false;
    }
    
    if (isNaN(price) || price <= 0) {
        showNotification('Valid price is required', 'error');
        return false;
    }
    
    return true;
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
    
    // Check if hotel dropdown has options
    if (hotelSelect.options.length <= 1) {
        showNotification('No hotels available. Please create a hotel first.', 'error');
        return false;
    }
    
    if (!hotelId) {
        showNotification('Please select a hotel', 'error');
        hotelSelect.focus();
        return false;
    }
    
    if (!guestName) {
        showNotification('Guest name is required', 'error');
        document.getElementById('addBookingGuest').focus();
        return false;
    }
    
    if (!guestEmail) {
        showNotification('Guest email is required', 'error');
        document.getElementById('addBookingEmail').focus();
        return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
        showNotification('Please enter a valid email address', 'error');
        document.getElementById('addBookingEmail').focus();
        return false;
    }
    
    if (!checkIn) {
        showNotification('Check-in date is required', 'error');
        document.getElementById('addBookingCheckIn').focus();
        return false;
    }
    
    if (!checkOut) {
        showNotification('Check-out date is required', 'error');
        document.getElementById('addBookingCheckOut').focus();
        return false;
    }
    
    // Check if check-out is after check-in
    if (new Date(checkOut) <= new Date(checkIn)) {
        showNotification('Check-out date must be after check-in date', 'error');
        document.getElementById('addBookingCheckOut').focus();
        return false;
    }
    
    if (isNaN(guests) || guests <= 0) {
        showNotification('Valid number of guests is required', 'error');
        document.getElementById('addBookingGuests').focus();
        return false;
    }
    
    if (isNaN(rooms) || rooms <= 0) {
        showNotification('Valid number of rooms is required', 'error');
        document.getElementById('addBookingRooms').focus();
        return false;
    }
    
    if (isNaN(totalPrice) || totalPrice <= 0) {
        showNotification('Valid total price is required', 'error');
        document.getElementById('addBookingTotal').focus();
        return false;
    }
    
    if (!status) {
        showNotification('Booking status is required', 'error');
        document.getElementById('addBookingStatus').focus();
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
    
    // Check if hotel dropdown has options
    if (hotelSelect.options.length <= 1) {
        showNotification('No hotels available. Please create a hotel first.', 'error');
        return false;
    }
    
    if (!hotelId || hotelId === 'null' || isNaN(parseInt(hotelId))) {
        showNotification('Please select a valid hotel', 'error');
        hotelSelect.focus();
        return false;
    }
    
    if (!guestName) {
        showNotification('Guest name is required', 'error');
        document.getElementById('editBookingGuest').focus();
        return false;
    }
    
    if (!guestEmail) {
        showNotification('Guest email is required', 'error');
        document.getElementById('editBookingEmail').focus();
        return false;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
        showNotification('Please enter a valid email address', 'error');
        document.getElementById('editBookingEmail').focus();
        return false;
    }
    
    if (!checkIn) {
        showNotification('Check-in date is required', 'error');
        document.getElementById('editBookingCheckIn').focus();
        return false;
    }
    
    if (!checkOut) {
        showNotification('Check-out date is required', 'error');
        document.getElementById('editBookingCheckOut').focus();
        return false;
    }
    
    // Check if check-out is after check-in
    if (new Date(checkOut) <= new Date(checkIn)) {
        showNotification('Check-out date must be after check-in date', 'error');
        document.getElementById('editBookingCheckOut').focus();
        return false;
    }
    
    if (isNaN(guests) || guests <= 0) {
        showNotification('Valid number of guests is required', 'error');
        document.getElementById('editBookingGuests').focus();
        return false;
    }
    
    if (isNaN(rooms) || rooms <= 0) {
        showNotification('Valid number of rooms is required', 'error');
        document.getElementById('editBookingRooms').focus();
        return false;
    }
    
    if (isNaN(totalPrice) || totalPrice <= 0) {
        showNotification('Valid total price is required', 'error');
        document.getElementById('editBookingTotal').focus();
        return false;
    }
    
    if (!status) {
        showNotification('Booking status is required', 'error');
        document.getElementById('editBookingStatus').focus();
        return false;
    }
    
    return true;
}

// Form Validation for Add Hotel
function validateAddHotelForm() {
    const name = document.getElementById('addHotelName').value.trim();
    const location = document.getElementById('addHotelLocation').value.trim();
    const price = parseFloat(document.getElementById('addHotelPrice').value);
    
    if (!name) {
        showNotification('Hotel name is required', 'error');
        return false;
    }
    
    if (!location) {
        showNotification('Location is required', 'error');
        return false;
    }
    
    if (isNaN(price) || price <= 0) {
        showNotification('Valid price is required', 'error');
        return false;
    }
    
    return true;
}

// Form Validation for Edit Hotel
function validateEditHotelForm() {
    const name = document.getElementById('editHotelName').value.trim();
    const location = document.getElementById('editHotelLocation').value.trim();
    const price = parseFloat(document.getElementById('editHotelPrice').value);
    
    if (!name) {
        showNotification('Hotel name is required', 'error');
        return false;
    }
    
    if (!location) {
        showNotification('Location is required', 'error');
        return false;
    }
    
    if (isNaN(price) || price <= 0) {
        showNotification('Valid price is required', 'error');
        return false;
    }
    
    return true;
}

// Room Actions
async function editRoom(roomId) {
    try {
        // Fetch current hotel data
        const response = await fetch(`${API_BASE_URL}/hotels/${roomId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Open edit modal with current data
            openEditHotelModal(result.hotel);
        } else {
            showNotification(result.message || 'Failed to fetch hotel data', 'error');
        }
    } catch (error) {
        console.error('Error fetching hotel data:', error);
        showNotification('Error fetching hotel data', 'error');
    }
}

function openEditHotelModal(hotel) {
    // Populate the form with hotel data
    document.getElementById('editHotelId').value = hotel.id;
    document.getElementById('editHotelName').value = hotel.name;
    document.getElementById('editHotelLocation').value = hotel.location;
    document.getElementById('editHotelDistance').value = hotel.distance || '';
    document.getElementById('editHotelRating').value = hotel.rating || '';
    document.getElementById('editHotelPrice').value = hotel.price || '';
    document.getElementById('editHotelImage').value = hotel.image || '';
    document.getElementById('editHotelDescription').value = hotel.description || '';
    document.getElementById('editHotelAmenities').value = hotel.amenities ? hotel.amenities.join(', ') : '';
    
    // Show the modal
    document.getElementById('editHotelModal').style.display = 'flex';
}

function closeEditHotelModal() {
    document.getElementById('editHotelModal').style.display = 'none';
}

async function deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/hotels/${roomId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${currentUser?.token}`
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification(`Room ${roomId} deleted successfully`, 'success');
                // Refresh the room list
                loadAvailableRoomsData();
            } else {
                showNotification(result.message || 'Failed to delete room', 'error');
            }
        } catch (error) {
            console.error('Error deleting room:', error);
            showNotification('Error deleting room', 'error');
        }
    }
}

async function toggleFavorite(roomId) {
    showNotification(`Room ${roomId} added to favorites`, 'success');
    // In a real app, update favorites in backend
}

function previousImage(roomId) {
    // Image carousel functionality
    console.log(`Previous image for room ${roomId}`);
}

function nextImage(roomId) {
    // Image carousel functionality
    console.log(`Next image for room ${roomId}`);
}

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
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel created successfully', 'success');
            // Refresh the hotel list
            loadRoomsData();
            return result.hotel;
        } else {
            showNotification(result.message || 'Failed to create hotel', 'error');
            return null;
        }
    } catch (error) {
        console.error('Error creating hotel:', error);
        showNotification('Error creating hotel', 'error');
        return null;
    }
}

async function updateHotel(hotelId, hotelData) {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(hotelData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showNotification('Hotel updated successfully', 'success');
            // Refresh the hotel list
            loadRoomsData();
            return result.hotel;
        } else {
            showNotification(result.message || 'Failed to update hotel', 'error');
            return null;
        }
    } catch (error) {
        console.error('Error updating hotel:', error);
        showNotification('Error updating hotel', 'error');
        return null;
    }
}

// Room Availability Functions
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
    console.log('Window resized');
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
    console.log('Global search:', searchTerm);
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
                        <button class="action-btn edit" onclick="editRoom(${room.id})" title="Edit">✏️</button>
                        <button class="action-btn delete" onclick="deleteRoom(${room.id})" title="Delete">🗑️</button>
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

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount || 0);
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

function hideNotification(notification) {
    if (notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// API Error Handling
function handleApiError(error, operation = 'operation') {
    console.error(`${operation} error:`, error);
    
    let title = 'Error';
    let message = 'An unexpected error occurred. Please try again.';
    
    // Handle different types of errors
    if (error.name === 'NetworkError' || 
        (error.message && (error.message.includes('Network Error') || error.message.includes('Failed to fetch')))) {
        title = 'Network Error';
        message = 'Please check your internet connection and try again.';
    } else if (error.name === 'ValidationError') {
        title = 'Validation Error';
        message = error.message;
    } else if (error.name === 'AuthenticationError') {
        title = 'Authentication Error';
        message = 'Please log in again.';
    } else if (error.code === '42501') {
        title = 'Access Denied';
        message = 'You do not have permission to perform this action.';
    } else if (error.code === '23505') {
        title = 'Duplicate Entry';
        message = 'This item already exists.';
    } else if (error.message) {
        // Use the error message if available
        message = error.message;
    }
    
    showNotification(message, 'error');
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
                    <button class="action-btn edit" onclick="openEditUserModal(${JSON.stringify(user).replace(/"/g, '&quot;')})" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteUser(${user.id})" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
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
                    <button class="action-btn edit" onclick="openEditBookingModal(${JSON.stringify(cleanBooking).replace(/"/g, '&quot;')})" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteBooking(${booking.id})" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
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
        console.log('Opening edit booking modal with booking data:', booking);
        
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
        
        // Log the booking ID that was set
        console.log('Set editBookingId value to:', booking.id);
        console.log('Type of booking.id:', typeof booking.id);
        
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

// Test function to check if the booking API is working
async function testBookingAPI() {
    try {
        console.log('Testing booking API connection...');
        console.log('Current user:', currentUser);
        console.log('API Base URL:', API_BASE_URL);
        
        if (!currentUser || !currentUser.token) {
            console.error('User not authenticated');
            showNotification('Please log in first', 'error');
            return false;
        }
        
        // Test getting bookings
        const response = await fetch(`${API_BASE_URL}/bookings?limit=5`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Booking API test response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Booking API test failed with status:', response.status, 'Response:', errorText);
            showNotification(`Booking API test failed: ${response.status} - ${errorText}`, 'error');
            return false;
        }
        
        const result = await response.json();
        console.log('Booking API test result:', result);
        
        if (result.success) {
            console.log(`Successfully fetched ${result.bookings ? result.bookings.length : 0} bookings`);
            showNotification(`Successfully connected to booking API. Found ${result.bookings ? result.bookings.length : 0} bookings.`, 'success');
            return true;
        } else {
            console.error('Booking API test failed:', result.message);
            showNotification(`Booking API test failed: ${result.message || 'Unknown error'}`, 'error');
            return false;
        }
    } catch (error) {
        console.error('Booking API test error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
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
        
        showNotification(`Booking API test error: ${errorMessage}`, 'error');
        return false;
    }
}

// Test function to check if hotels API is working
async function testHotelAPI() {
    try {
        console.log('Testing hotel API connection...');
        console.log('Current user:', currentUser);
        console.log('API Base URL:', API_BASE_URL);
        
        if (!currentUser || !currentUser.token) {
            console.error('User not authenticated');
            showNotification('Please log in first', 'error');
            return false;
        }
        
        const response = await fetch(`${API_BASE_URL}/hotels?limit=5`, {
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Hotel API test response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotel API test failed with status:', response.status, 'Response:', errorText);
            showNotification(`Hotel API test failed: ${response.status} - ${errorText}`, 'error');
            return false;
        }
        
        const result = await response.json();
        console.log('Hotel API test result:', result);
        
        if (result.success && result.hotels) {
            console.log(`Successfully fetched ${result.hotels.length} hotels`);
            showNotification(`Successfully connected to hotel API. Found ${result.hotels.length} hotels.`, 'success');
            return true;
        } else {
            console.error('Hotel API test failed:', result.message);
            showNotification(`Hotel API test failed: ${result.message || 'Unknown error'}`, 'error');
            return false;
        }
    } catch (error) {
        console.error('Hotel API test error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
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
        
        showNotification(`Hotel API test error: ${errorMessage}`, 'error');
        return false;
    }
}

// Helper function to populate hotel dropdown
async function populateHotelDropdown(selectId) {
    try {
        // Debug information
        console.log('populateHotelDropdown called with selectId:', selectId);
        console.log('Current user:', currentUser);
        console.log('API Base URL:', API_BASE_URL);
        console.log('Full URL being called:', `${window.location.origin}${API_BASE_URL}/hotels?limit=1000`);
        
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
        
        console.log('Hotel API response status:', response.status);
        console.log('Hotel API response headers:', [...response.headers.entries()]);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Hotel API error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Hotel API response data:', result);
        
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

// Helper function to filter hotels in dropdown
function filterHotels(selectId, searchTerm) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement || !selectElement.hotelData) return;
    
    // Clear current options except the default
    selectElement.innerHTML = '<option value="">Select a hotel</option>';
    
    // Filter and add matching hotels
    if (searchTerm) {
        const filteredHotels = selectElement.hotelData.filter(hotel => 
            hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        filteredHotels.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.id;
            option.textContent = `${hotel.name} (${hotel.location})`;
            option.setAttribute('data-hotel-name', hotel.name);
            option.setAttribute('data-hotel-location', hotel.location);
            selectElement.appendChild(option);
        });
    } else {
        // If no search term, show all hotels
        selectElement.hotelData.forEach(hotel => {
            const option = document.createElement('option');
            option.value = hotel.id;
            option.textContent = `${hotel.name} (${hotel.location})`;
            option.setAttribute('data-hotel-name', hotel.name);
            option.setAttribute('data-hotel-location', hotel.location);
            selectElement.appendChild(option);
        });
    }
}

// Report and Analytics Functions
async function loadReportsData() {
    try {
        // Load dashboard statistics
        const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
            const stats = statsResult.stats;
            document.getElementById('totalCustomers').textContent = stats.customers || 0;
            document.getElementById('totalBookings').textContent = stats.bookings || 0;
            document.getElementById('totalRevenue').textContent = `${(stats.payments || 0).toLocaleString()}`;
            document.getElementById('totalHotels').textContent = stats.hotels || 0;
        }
        
        // Load chart data (mock data for now)
        renderCharts();
    } catch (error) {
        console.error('Error loading reports data:', error);
        showNotification('Error loading reports data', 'error');
    }
}

function renderCharts() {
    // For now, we'll mock the charts
    // In a real app, you would use Chart.js or another charting library
    console.log('Rendering charts...');
}

// Financial Management Functions
async function loadFinancialsData() {
    try {
        // Load financial statistics
        const statsResponse = await fetch(`${API_BASE_URL}/admin/financials/stats`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const statsResult = await statsResponse.json();
        
        if (statsResult.success) {
            const stats = statsResult.stats;
            document.getElementById('monthlyRevenue').textContent = `${(stats.monthlyRevenue || 0).toLocaleString()}`;
            document.getElementById('pendingPayments').textContent = stats.pendingPayments || 0;
            document.getElementById('refundedAmount').textContent = `${(stats.refundedAmount || 0).toLocaleString()}`;
            document.getElementById('commissionEarned').textContent = `${(stats.commissionEarned || 0).toLocaleString()}`;
        }
        
        // Load transactions
        loadTransactionsData();
    } catch (error) {
        console.error('Error loading financials data:', error);
        showNotification('Error loading financials data', 'error');
    }
}

let currentTransactionsPage = 1;
let totalTransactionsPages = 1;

async function loadTransactionsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/admin/transactions?page=${currentTransactionsPage}&limit=10`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            const transactions = result.transactions || [];
            const pagination = result.pagination || {};
            
            renderTransactionsTable(transactions);
            updateTransactionsPagination(pagination);
        } else {
            showNotification(result.message || 'Failed to load transactions', 'error');
        }
    } catch (error) {
        console.error('Error loading transactions:', error);
        showNotification('Error loading transactions', 'error');
    }
}

function renderTransactionsTable(transactions) {
    const tableBody = document.getElementById('transactionsTableBody');
    if (!tableBody) return;
    
    if (!transactions || transactions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-left p-4">No transactions found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    transactions.forEach(transaction => {
        const statusClass = `status-${transaction.status}`;
        const typeClass = transaction.type === 'credit' ? 'text-success' : 'text-danger';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-left p-4 border-b">${transaction.id}</td>
            <td class="text-left p-4 border-b">${formatDate(transaction.date)}</td>
            <td class="text-left p-4 border-b">${transaction.description}</td>
            <td class="text-left p-4 border-b"><span class="${typeClass}">${transaction.type}</span></td>
            <td class="text-left p-4 border-b">${parseFloat(transaction.amount).toFixed(2)}</td>
            <td class="text-left p-4 border-b"><span class="status-badge ${statusClass}">${transaction.status}</span></td>
            <td class="text-left p-4 border-b">
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewTransaction(${transaction.id})" title="View">👁️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateTransactionsPagination(pagination) {
    const totalCount = pagination.totalCount || 0;
    const currentPage = pagination.currentPage || 1;
    const totalPages = pagination.totalPages || 1;
    
    document.getElementById('transactionsTotalCount').textContent = totalCount;
    document.getElementById('currentTransactionsPage').textContent = currentPage;
    document.getElementById('totalTransactionsPages').textContent = totalPages;
    
    const prevBtn = document.getElementById('prevTransactionsPage');
    const nextBtn = document.getElementById('nextTransactionsPage');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
    }
    
    currentTransactionsPage = currentPage;
    totalTransactionsPages = totalPages;
}

function loadTransactionsPage(page) {
    if (page < 1 || page > totalTransactionsPages) return;
    currentTransactionsPage = page;
    loadTransactionsData();
}

function viewTransaction(transactionId) {
    showNotification(`Viewing details for transaction ${transactionId}`, 'info');
    // In a real app, you would open a modal with transaction details
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
            const hotelData = {
                name: formData.get('addHotelName'),
                location: formData.get('addHotelLocation'),
                distance: formData.get('addHotelDistance') || '',
                rating: parseFloat(formData.get('addHotelRating')) || null,
                price: parseFloat(formData.get('addHotelPrice')) || 0,
                image: formData.get('addHotelImage') || '',
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
            const hotelData = {
                name: formData.get('editHotelName'),
                location: formData.get('editHotelLocation'),
                distance: formData.get('editHotelDistance') || '',
                rating: parseFloat(formData.get('editHotelRating')) || null,
                price: parseFloat(formData.get('editHotelPrice')) || 0,
                image: formData.get('editHotelImage') || '',
                description: formData.get('editHotelDescription') || '',
                amenities: formData.get('editHotelAmenities') ? formData.get('editHotelAmenities').split(',').map(a => a.trim()).filter(a => a) : []
            };
            
            try {
                const response = await fetch(`${API_BASE_URL}/hotels/${hotelId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(hotelData)
                });
                
                const result = await response.json();
                
                if (result.success) {
                    showNotification('Hotel updated successfully', 'success');
                    closeEditHotelModal();
                    loadHotelsData(); // Refresh the hotel list
                } else {
                    showNotification(result.message || 'Failed to update hotel', 'error');
                }
            } catch (error) {
                console.error('Error updating hotel:', error);
                showNotification('Error updating hotel', 'error');
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
            
            // Log the data being sent for debugging
            console.log('Creating booking with data:', bookingData);
            
            try {
                const response = await fetch(`${API_BASE_URL}/bookings`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentUser?.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(bookingData)
                });
                
                // Log the response for debugging
                console.log('Booking creation response status:', response.status);
                
                const result = await response.json();
                console.log('Booking creation response data:', result);
                
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
            
            // Log the values for debugging
            console.log('Form values:', {
                bookingId,
                hotelId,
                guestName,
                guestEmail,
                guestPhone,
                checkIn,
                checkOut,
                guests,
                rooms,
                totalPrice,
                status
            });
            
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
            
            console.log('Sending booking update request:', {
                url: `${API_BASE_URL}/bookings/${parsedBookingId}`,
                method: 'PUT',
                data: bookingData
            });
            
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
                
                console.log('Booking update response status:', response.status);
                
                const responseText = await response.text();
                console.log('Booking update response text:', responseText);
                
                // Try to parse as JSON, but handle if it's not valid JSON
                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error('Could not parse response as JSON:', responseText);
                    throw new Error(`Server returned non-JSON response: ${responseText}`);
                }
                
                if (!response.ok) {
                    const errorMessage = result.message || result.error || 'Unknown error';
                    const errorDetails = result.details ? `Details: ${result.details}` : '';
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage} ${errorDetails}`);
                }
                
                console.log('Booking update result:', result);
                
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

async function loadHotelsData() {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels?page=${currentHotelsPage}&limit=10`, {
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
                    <button class="action-btn edit" onclick="openEditHotelModal(${JSON.stringify(hotel).replace(/"/g, '&quot;')})" title="Edit">✏️</button>
                    <button class="action-btn delete" onclick="deleteHotel(${hotel.id})" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
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
        document.getElementById('editHotelImage').value = hotel.image || '';
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

function closeEditHotelModal() {
    const modal = document.getElementById('editHotelModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        const form = document.getElementById('editHotelForm');
        if (form) {
            form.reset();
        }
    }
}

// Placeholder for exportBookingData function
function exportBookingData() {
    showNotification('Booking data export functionality would be implemented here', 'info');
}

window.HotelApp = {
    showNotification,
    exportBookingData,
    editRoom,
    deleteRoom,
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
    loadReportsData,
    loadFinancialsData,
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
    viewTransaction
};