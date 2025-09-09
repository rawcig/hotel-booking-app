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
    document.getElementById('editRoomForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateEditRoomForm()) {
            return;
        }
        
        const roomId = document.getElementById('editRoomId').value;
        const hotelData = {
            name: document.getElementById('editRoomName').value,
            location: document.getElementById('editRoomLocation').value,
            price: document.getElementById('editRoomPrice').value,
            rating: document.getElementById('editRoomRating').value,
            image: document.getElementById('editRoomImage').value,
            description: document.getElementById('editRoomDescription').value,
            amenities: document.getElementById('editRoomAmenities').value.split(',').map(item => item.trim()).filter(item => item)
        };
        
        // Add loading state to submit button
        const submitButton = document.querySelector('#editRoomForm .auth-btn');
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
            const result = await updateHotel(roomId, hotelData);
            if (result) {
                closeEditRoomModal();
                showNotification('Room updated successfully', 'success');
            }
        } catch (error) {
            console.error('Error updating room:', error);
            showNotification('Error updating room', 'error');
        } finally {
            // Restore submit button state
            const submitButton = document.querySelector('#editRoomForm .auth-btn');
            if (submitButton && submitButton.classList.contains('loading')) {
                submitButton.classList.remove('loading');
                submitButton.innerHTML = submitButton.dataset.originalContent || 'Update Room';
                delete submitButton.dataset.originalContent;
                submitButton.disabled = false;
            }
        }
    });
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Close modal when clicking outside
    document.getElementById('editRoomModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditRoomModal();
        }
    });
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberPassword').checked;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
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
        showNotification('Login failed. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
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
        
        if (result.success) {
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
        showNotification('Registration failed. Please try again.', 'error');
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
function handleNavigation(e) {
    const page = e.target.getAttribute('data-page');
    
    // Update active nav item
    navItems.forEach(item => item.classList.remove('active'));
    e.target.classList.add('active');
    
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
            case 'rooms':
                loadRoomsData();
                break;
            case 'bookingList':
                loadBookingListData();
                break;
            case 'roomAvailable':
                loadAvailableRoomsData();
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
            tableBody.innerHTML = '<tr><td colspan="7" class="loading"><div class="spinner"></div>Loading rooms...</td></tr>';
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
                number: `${100 + (hotel.id || index)}`,
                type: hotel.name.split(' ')[0] || 'Standard',
                floor: Math.floor((hotel.id || index) / 10) + 1,
                bedType: 'Queen',
                price: parseFloat(hotel.price),
                status: 'Available',
                rating: parseFloat(hotel.rating),
                reviews: hotel.reviews ? hotel.reviews.length : 0,
                images: hotel.gallery || [hotel.image]
            }));
            
            renderDashboardContent();
        } else {
            showNotification('Failed to load room data', 'error');
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('Error loading room data', 'error');
    }
}

async function loadRoomsData() {
    try {
        // Show loading state
        const roomsGrid = document.getElementById('roomsGrid');
        if (roomsGrid) {
            roomsGrid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading rooms...</div>';
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
                number: `${100 + (hotel.id || index)}`,
                type: hotel.name.split(' ')[0] || 'Standard',
                floor: Math.floor((hotel.id || index) / 10) + 1,
                bedType: 'Queen',
                price: parseFloat(hotel.price),
                status: 'Available',
                rating: parseFloat(hotel.rating),
                reviews: hotel.reviews ? hotel.reviews.length : 0,
                images: hotel.gallery || [hotel.image]
            }));
            
            renderRoomsContent();
        } else {
            showNotification('Failed to load rooms data', 'error');
        }
    } catch (error) {
        console.error('Error loading rooms data:', error);
        showNotification('Error loading rooms data', 'error');
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
                type: hotel.name.split(' ')[0] || 'Standard',
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
    
    if (appData.rooms.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7">No rooms found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    appData.rooms.forEach(room => {
        const row = createTableRow([
            room.id,
            `${room.number} (${room.type})`,
            room.type,
            room.floor,
            room.bedType,
            `${room.price.toFixed(2)}`,
            `<span class="status-badge status-${room.status.toLowerCase().replace(' ', '-')}">${room.status}</span>`
        ]);
        tableBody.appendChild(row);
    });
}

function renderRoomsContent() {
    const roomsGrid = document.getElementById('roomsGrid');
    if (!roomsGrid) return;
    
    if (appData.rooms.length === 0) {
        roomsGrid.innerHTML = '<p>No rooms found</p>';
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
        tableBody.innerHTML = '<tr><td colspan="6">No bookings found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    appData.bookings.forEach(booking => {
        const row = createTableRow([
            booking.id,
            booking.roomId,
            booking.checkIn,
            booking.checkOut,
            `<span class="status-badge status-${booking.bookingStatus.toLowerCase()}">${booking.bookingStatus}</span>`,
            `<span class="status-badge status-${booking.paymentStatus.toLowerCase().replace(' ', '-')}">${booking.paymentStatus}</span>`,
            `<div class="action-buttons">
                <button class="action-btn edit" onclick="updateBookingStatus(${booking.id}, 'confirmed')" title="Confirm">✓</button>
                <button class="action-btn delete" onclick="cancelBooking(${booking.id})" title="Cancel">✕</button>
            </div>`
        ]);
        tableBody.appendChild(row);
    });
}

function renderAvailableRoomsContent() {
    const tableBody = document.getElementById('availableRoomsTableBody');
    if (!tableBody) return;
    
    if (appData.availableRooms.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6">No available rooms found</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    appData.availableRooms.forEach(room => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><div class="room-thumb" style="background-image: url('${room.image}')"></div></td>
            <td>${room.id}</td>
            <td>${room.type} (ID: ${room.id})</td>
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

// Helper Functions
function createTableRow(cells) {
    const row = document.createElement('tr');
    cells.forEach(cellContent => {
        const cell = document.createElement('td');
        cell.innerHTML = cellContent;
        row.appendChild(cell);
    });
    return row;
}

function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
    
    const stars = '★'.repeat(Math.floor(room.rating)) + '☆'.repeat(5 - Math.floor(room.rating));
    
    card.innerHTML = `
        <div class="room-image" style="background-image: url('${room.images[0]}')">
            <button class="room-carousel prev" onclick="previousImage(${room.id})">‹</button>
            <button class="room-carousel next" onclick="nextImage(${room.id})">›</button>
        </div>
        <div class="room-info">
            <div class="room-header">
                <div class="room-number">ID: ${room.id} - ${room.type || room.name}</div>
                <div class="room-price">${room.price.toFixed(2)}</div>
            </div>
            <div class="room-rating">
                <span class="stars">${stars}</span>
                <span class="rating-count">(${room.reviews})</span>
            </div>
            <div class="room-actions">
                <button class="btn-secondary" onclick="editRoom(${room.id})">Edit Room</button>
                <button class="favorite-btn" onclick="toggleFavorite(${room.id})">♡</button>
            </div>
        </div>
    `;
    
    return card;
}

// Form Validation
function validateEditRoomForm() {
    const name = document.getElementById('editRoomName').value.trim();
    const location = document.getElementById('editRoomLocation').value.trim();
    const price = parseFloat(document.getElementById('editRoomPrice').value);
    
    if (!name) {
        showNotification('Room name is required', 'error');
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
        // Fetch current room data
        const response = await fetch(`${API_BASE_URL}/hotels/${roomId}`, {
            headers: {
                'Authorization': `Bearer ${currentUser?.token}`
            }
        });
        const result = await response.json();
        
        if (result.success) {
            // Open edit modal with current data
            openEditRoomModal(result.hotel);
        } else {
            showNotification(result.message || 'Failed to fetch room data', 'error');
        }
    } catch (error) {
        console.error('Error fetching room data:', error);
        showNotification('Error fetching room data', 'error');
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
            row.innerHTML = `
                <td><div class="room-thumb" style="background-image: url('${room.image}')"></div></td>
                <td>${room.id}</td>
                <td>${room.type}</td>
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
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
}

// Local Storage Functions (for demo purposes)
function storeUser(user) {
    // In a real app, you wouldn't store user data in localStorage like this
    // This is just for demo persistence
    const userData = JSON.stringify(user);
    // localStorage.setItem('hotelUser', userData);
    console.log('User data would be stored:', userData);
}

function getStoredUser() {
    // const userData = localStorage.getItem('hotelUser');
    // return userData ? JSON.parse(userData) : null;
    return null; // Always return null for demo
}

function clearStoredUser() {
    // localStorage.removeItem('hotelUser');
    console.log('User data cleared');
}

// Responsive Handling
function handleResize() {
    const width = window.innerWidth;
    
    // Handle mobile navigation
    if (width <= 768) {
        // Mobile-specific adjustments
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && currentPage === 'dashboard') {
            // Mobile sidebar adjustments
        }
    }
}

// Data Export Functions (bonus feature)
function exportBookingData() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + "ID,RoomID,CheckIn,CheckOut,BookingStatus,PaymentStatus\n"
        + appData.bookings.map(booking => 
            `${booking.id},${booking.roomId},${booking.checkIn},${booking.checkOut},${booking.bookingStatus},${booking.paymentStatus}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "booking_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Booking data exported successfully', 'success');
}

// Analytics Functions (placeholder)
function trackUserAction(action, data) {
    console.log('Analytics:', action, data);
    // In a real app, send to analytics service
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Application error:', e.error);
    showNotification('An error occurred. Please try again.', 'error');
});

// Keyboard Shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + K for search focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Escape to close modals/notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification-toast');
        notifications.forEach(notification => {
            notification.classList.remove('show');
        });
    }
});

// Initialize tooltips and other UI enhancements
function initializeUIEnhancements() {
    // Add loading states to buttons
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            // Only add loading state to buttons that don't already have it
            if (!this.classList.contains('loading')) {
                // Store original content
                if (!this.dataset.originalContent) {
                    this.dataset.originalContent = this.innerHTML;
                }
                
                // Add loading class
                this.classList.add('loading');
                
                // For buttons, we don't change the display or padding
                // Just add a visual indicator
                const spinner = document.createElement('div');
                spinner.className = 'button-spinner';
                spinner.innerHTML = '...';
                this.innerHTML = '';
                this.appendChild(spinner);
                
                // Remove loading state after 1 second
                setTimeout(() => {
                    if (this.classList.contains('loading')) {
                        this.classList.remove('loading');
                        this.innerHTML = this.dataset.originalContent || this.innerHTML;
                        delete this.dataset.originalContent;
                    }
                }, 1000);
            }
        });
    });
}

// Call UI enhancements after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeUIEnhancements, 100);
});

// Export functions for external use (if needed)
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
    updateRoomAvailability
};