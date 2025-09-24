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
            
            // Open the edit booking modal
            openEditBookingModal(bookingId);
            
            // Populate the edit booking form with booking data
            document.getElementById('editBookingId').value = booking.id;
            document.getElementById('editBookingHotel').value = booking.hotel_id || '';
            document.getElementById('editBookingGuest').value = booking.guest_name || '';
            document.getElementById('editBookingEmail').value = booking.guest_email || '';
            document.getElementById('editBookingPhone').value = booking.guest_phone || '';
            document.getElementById('editBookingCheckIn').value = booking.check_in ? booking.check_in.split('T')[0] : '';
            document.getElementById('editBookingCheckOut').value = booking.check_out ? booking.check_out.split('T')[0] : '';
            document.getElementById('editBookingGuests').value = booking.guests || '';
            document.getElementById('editBookingRooms').value = booking.rooms || '';
            document.getElementById('editBookingTotal').value = booking.total_price || '';
            document.getElementById('editBookingStatus').value = booking.status || 'pending';
        } else {
            throw new Error(result.message || 'Failed to load booking data');
        }
    } catch (error) {
        console.error('Error loading booking data:', error);
        showNotification('Failed to load booking data: ' + error.message, 'error');
    }
}

// Delete booking\nasync function deleteBooking(bookingId) {\n    if (!confirm('Are you sure you want to delete this booking?')) {\n        return;\n    }\n    \n    try {\n        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {\n            method: 'DELETE',\n            headers: {\n                'Authorization': `Bearer ${currentUser.token}`\n            }\n        });\n        \n        if (!response.ok) {\n            throw new Error('Failed to delete booking');\n        }\n        \n        const result = await response.json();\n        \n        if (result.success) {\n            showNotification('Booking deleted successfully!', 'success');\n            // Reload bookings data\n            loadBookingsData();\n        } else {\n            throw new Error(result.message || 'Failed to delete booking');\n        }\n    } catch (error) {\n        console.error('Error deleting booking:', error);\n        showNotification('Failed to delete booking: ' + error.message, 'error');\n    }\n}\n\n// Process payment for a booking (fake implementation)
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