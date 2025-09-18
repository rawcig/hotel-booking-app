-- database/functions/booking_notification_functions.sql
-- Database functions for sending notifications on booking status changes

-- Function to send notification when booking is confirmed
CREATE OR REPLACE FUNCTION send_booking_confirmed_notification()
RETURNS TRIGGER AS $$
DECLARE
    guest_id INTEGER;
    guest_email TEXT;
    guest_phone TEXT;
    notification_id INTEGER;
BEGIN
    -- Only send notification for newly confirmed bookings
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Get guest information from guests table using user_id
        SELECT g.id, g.email, g.phone_number 
        INTO guest_id, guest_email, guest_phone
        FROM public.guests g
        WHERE g.email = (
            SELECT u.email 
            FROM public.users u 
            WHERE u.id = NEW.user_id
        )
        LIMIT 1;
        
        -- If guest record found, create notification
        IF guest_id IS NOT NULL THEN
            INSERT INTO public.notifications (
                guest_id,
                type,
                subject,
                message,
                status,
                created_at,
                updated_at
            ) VALUES (
                guest_id,
                'email',
                'Booking Confirmed',
                'Your booking at ' || NEW.hotel_name || ' from ' || NEW.check_in || ' to ' || NEW.check_out || ' is confirmed. Total: ' || NEW.total_price || '. Booking ID: ' || NEW.id,
                'pending',
                NOW(),
                NOW()
            )
            RETURNING id INTO notification_id;
            
            RAISE NOTICE 'Booking confirmation notification created for booking ID %, notification ID %', NEW.id, notification_id;
        ELSE
            RAISE NOTICE 'No guest record found for user ID %, skipping notification', NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send notification when booking is cancelled
CREATE OR REPLACE FUNCTION send_booking_cancelled_notification()
RETURNS TRIGGER AS $$
DECLARE
    guest_id INTEGER;
    notification_id INTEGER;
BEGIN
    -- Only send notification for newly cancelled bookings
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        -- Get guest information from guests table using user_id
        SELECT g.id 
        INTO guest_id
        FROM public.guests g
        WHERE g.email = (
            SELECT u.email 
            FROM public.users u 
            WHERE u.id = NEW.user_id
        )
        LIMIT 1;
        
        -- If guest record found, create notification
        IF guest_id IS NOT NULL THEN
            INSERT INTO public.notifications (
                guest_id,
                type,
                subject,
                message,
                status,
                created_at,
                updated_at
            ) VALUES (
                guest_id,
                'email',
                'Booking Cancelled',
                'Your booking at ' || NEW.hotel_name || ' for ' || NEW.check_in || ' has been successfully cancelled. Booking ID: ' || NEW.id,
                'pending',
                NOW(),
                NOW()
            )
            RETURNING id INTO notification_id;
            
            RAISE NOTICE 'Booking cancellation notification created for booking ID %, notification ID %', NEW.id, notification_id;
        ELSE
            RAISE NOTICE 'No guest record found for user ID %, skipping notification', NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send check-in reminder
CREATE OR REPLACE FUNCTION send_checkin_reminder()
RETURNS TRIGGER AS $$
DECLARE
    guest_id INTEGER;
    notification_id INTEGER;
    checkin_date DATE;
BEGIN
    -- Only send reminder for confirmed bookings with future check-in dates
    IF NEW.status = 'confirmed' AND NEW.check_in > CURRENT_DATE THEN
        -- Get guest information from guests table using user_id
        SELECT g.id 
        INTO guest_id
        FROM public.guests g
        WHERE g.email = (
            SELECT u.email 
            FROM public.users u 
            WHERE u.id = NEW.user_id
        )
        LIMIT 1;
        
        -- If guest record found, create notification
        IF guest_id IS NOT NULL THEN
            INSERT INTO public.notifications (
                guest_id,
                type,
                subject,
                message,
                status,
                created_at,
                updated_at
            ) VALUES (
                guest_id,
                'email',
                'Check-in Reminder',
                'Don''t forget! Your check-in at ' || NEW.hotel_name || ' is tomorrow. We look forward to welcoming you!',
                'pending',
                NOW(),
                NOW()
            )
            RETURNING id INTO notification_id;
            
            RAISE NOTICE 'Check-in reminder notification created for booking ID %, notification ID %', NEW.id, notification_id;
        ELSE
            RAISE NOTICE 'No guest record found for user ID %, skipping notification', NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to send check-out reminder
CREATE OR REPLACE FUNCTION send_checkout_reminder()
RETURNS TRIGGER AS $$
DECLARE
    guest_id INTEGER;
    notification_id INTEGER;
BEGIN
    -- Send reminder on the day of check-out
    IF NEW.status = 'confirmed' AND NEW.check_out = CURRENT_DATE THEN
        -- Get guest information from guests table using user_id
        SELECT g.id 
        INTO guest_id
        FROM public.guests g
        WHERE g.email = (
            SELECT u.email 
            FROM public.users u 
            WHERE u.id = NEW.user_id
        )
        LIMIT 1;
        
        -- If guest record found, create notification
        IF guest_id IS NOT NULL THEN
            INSERT INTO public.notifications (
                guest_id,
                type,
                subject,
                message,
                status,
                created_at,
                updated_at
            ) VALUES (
                guest_id,
                'email',
                'Check-out Reminder',
                'Your stay at ' || NEW.hotel_name || ' ends today. Please check out by 12:00 PM. Thank you for choosing us!',
                'pending',
                NOW(),
                NOW()
            )
            RETURNING id INTO notification_id;
            
            RAISE NOTICE 'Check-out reminder notification created for booking ID %, notification ID %', NEW.id, notification_id;
        ELSE
            RAISE NOTICE 'No guest record found for user ID %, skipping notification', NEW.user_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;