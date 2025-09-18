-- database/triggers/booking_notification_triggers.sql
-- Triggers for sending notifications on booking status changes

-- Trigger for booking confirmation notifications
CREATE TRIGGER trigger_booking_confirmed_notification
    AFTER INSERT OR UPDATE OF status ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION send_booking_confirmed_notification();

-- Trigger for booking cancellation notifications
CREATE TRIGGER trigger_booking_cancelled_notification
    AFTER UPDATE OF status ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION send_booking_cancelled_notification();

-- Trigger for check-in reminders (scheduled 1 day before check-in)
CREATE TRIGGER trigger_checkin_reminder
    AFTER INSERT OR UPDATE OF status, check_in ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION send_checkin_reminder();

-- Trigger for check-out reminders (scheduled on check-out day)
CREATE TRIGGER trigger_checkout_reminder
    AFTER INSERT OR UPDATE OF status, check_out ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION send_checkout_reminder();