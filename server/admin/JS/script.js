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
        // Use regular variables instead of localStorage for Claude.ai compatibility
        return null; // For now, don't persist login state
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
    
    // Window resize handler
    window.addEventListener('resize', handleResize);
    
    // Set up modal close handlers
    setupModalCloseHandlers();
    
    // Form Submission Handlers
    setupFormSubmissionHandlers();
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
        
        // For demo purposes, simulate successful login
        // In production, this would make an actual API call
        if (email && password) {
            currentUser = {
                email: email,
                name: email.split('@')[0], // Use part before @ as name
                role: 'admin',
                token: 'demo-token-' + Date.now()
            };
            
            if (remember) {
                storeUser(currentUser);
            }
            
            showNotification('Login successful!', 'success');
            console.log('Login successful, showing dashboard...');
            showDashboard();
            updateUserProfileInHeader();
        }
        
        // Uncomment below for actual API integration
        /*
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
            updateUserProfileInHeader();
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
        */
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please try again.', 'error');
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
    
    try {
        // For demo purposes, simulate successful registration
        currentUser = {
            email: email,
            name: username,
            role: 'admin',
            token: 'demo-token-' + Date.now()
        };
        
        showNotification('Account created successfully!', 'success');
        showDashboard();
        updateUserProfileInHeader();
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Registration failed. Please try again.', 'error');
    }
}

async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
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
            default:
                break;
        }
    } else {
        console.log('Content element not found for:', page + 'Content');
    }
}

// Data Loading Functions (with error handling for demo)
async function loadDashboardData() {
    try {
        console.log('Loading dashboard data...');
        
        // Set some demo data for dashboard
        const totalCustomersEl = document.getElementById('totalCustomers');
        const totalBookingsEl = document.getElementById('totalBookings');
        const totalRevenueEl = document.getElementById('totalRevenue');
        const totalHotelsEl = document.getElementById('totalHotels');
        
        if (totalCustomersEl) totalCustomersEl.textContent = '150';
        if (totalBookingsEl) totalBookingsEl.textContent = '45';
        if (totalRevenueEl) totalRevenueEl.textContent = '$12,450.00';
        if (totalHotelsEl) totalHotelsEl.textContent = '8';
        
        // Set demo table data
        const tableBody = document.getElementById('dashboardTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td class="text-left p-4 border-b">001</td>
                    <td class="text-left p-4 border-b">John Doe</td>
                    <td class="text-left p-4 border-b">2024-01-15</td>
                    <td class="text-left p-4 border-b">2024-01-18</td>
                    <td class="text-left p-4 border-b">Grand Hotel</td>
                    <td class="text-left p-4 border-b">$450.00</td>
                    <td class="text-left p-4 border-b"><span class="status-badge status-confirmed">Confirmed</span></td>
                </tr>
                <tr>
                    <td class="text-left p-4 border-b">002</td>
                    <td class="text-left p-4 border-b">Jane Smith</td>
                    <td class="text-left p-4 border-b">2024-01-20</td>
                    <td class="text-left p-4 border-b">2024-01-22</td>
                    <td class="text-left p-4 border-b">Ocean View Resort</td>
                    <td class="text-left p-4 border-b">$280.00</td>
                    <td class="text-left p-4 border-b"><span class="status-badge status-pending">Pending</span></td>
                </tr>
            `;
        }
        
        console.log('Dashboard data loaded successfully');
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Don't throw error, just log it
    }
}

// Placeholder functions for other data loading
async function loadRoomsData() {
    console.log('Loading rooms data...');
}

async function loadAvailableRoomsData() {
    console.log('Loading available rooms data...');
}

async function loadBookingListData() {
    console.log('Loading booking list data...');
}

async function loadUsersData() {
    console.log('Loading users data...');
}

async function loadBookingsData() {
    console.log('Loading bookings data...');
}

async function loadReportsData() {
    console.log('Loading reports data...');
}

async function loadFinancialsData() {
    console.log('Loading financials data...');
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

// Placeholder functions
function setupImageUploadListeners() {
    console.log('Image upload listeners would be set up here');
}

function setupModalCloseHandlers() {
    console.log('Modal close handlers would be set up here');
}

function setupFormSubmissionHandlers() {
    console.log('Form submission handlers would be set up here');
}

function handleGlobalSearch(e) {
    console.log('Global search:', e.target.value);
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