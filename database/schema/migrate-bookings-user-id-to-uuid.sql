-- Migration Script to Change bookings.user_id from TEXT to UUID
-- This script safely converts the user_id column from text to uuid type

-- First, let's check if there are any invalid UUID values in the column
-- This will help us identify any potential issues before conversion
SELECT user_id 
FROM public.bookings 
WHERE user_id IS NOT NULL 
AND user_id != '' 
AND user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- If the above query returns any rows, you'll need to clean them up first
-- For example, you might need to:
-- DELETE FROM public.bookings WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL AND user_id != '';

-- Now, let's add a new column with the correct UUID type
ALTER TABLE public.bookings 
ADD COLUMN user_id_uuid UUID REFERENCES public.users(id);

-- Copy data from the old column to the new column
-- This will automatically convert valid UUID strings to UUID type
UPDATE public.bookings 
SET user_id_uuid = user_id::UUID
WHERE user_id IS NOT NULL 
AND user_id != '' 
AND user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Drop the old column
ALTER TABLE public.bookings 
DROP COLUMN user_id;

-- Rename the new column to the original name
ALTER TABLE public.bookings 
RENAME COLUMN user_id_uuid TO user_id;

-- Make the column NOT NULL if it should be (optional, depending on your requirements)
-- ALTER TABLE public.bookings ALTER COLUMN user_id SET NOT NULL;

-- Recreate the index on the user_id column
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);

-- Update the column comment (optional)
COMMENT ON COLUMN public.bookings.user_id IS 'References public.users.id as UUID';

-- Output success message
SELECT 'Bookings user_id column successfully converted to UUID type' as message;