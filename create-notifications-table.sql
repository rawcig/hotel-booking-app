-- create-notifications-table.sql
-- Create notifications table

CREATE TABLE IF NOT EXISTS public.notifications (
    id SERIAL PRIMARY KEY,
    guest_id INTEGER NOT NULL REFERENCES public.guests(id),
    type TEXT NOT NULL CHECK (type IN ('email', 'sms')),
    subject TEXT,
    message TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_guest_id ON public.notifications(guest_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON public.notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON public.notifications(sent_at);

-- Enable RLS (Row Level Security)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.guests g
            JOIN public.users u ON g.email = u.email
            WHERE u.id = auth.uid() AND g.id = notifications.guest_id
        ) OR
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Staff and admins can insert notifications
CREATE POLICY "Staff and admins can insert notifications" 
    ON public.notifications FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (role_id = 1 OR role_id = 3 OR role_id = 4)
        )
    );

-- Staff and admins can update notifications
CREATE POLICY "Staff and admins can update notifications" 
    ON public.notifications FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND (role_id = 1 OR role_id = 3 OR role_id = 4)
        )
    );

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications" 
    ON public.notifications FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role_id = 1
        )
    );

-- Grant permissions
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;

-- Create trigger to update updated_at timestamp
-- Use a unique function name to avoid conflicts
CREATE OR REPLACE FUNCTION update_notifications_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON public.notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_notifications_updated_at_column();