# Supabase Storage Setup

To enable hotel image uploads, you need to set up a storage bucket in Supabase.

## Creating the "hotel-images" Bucket

1. Log in to your Supabase project dashboard
2. In the left sidebar, click on "Storage"
3. Click on "Create bucket" button
4. Enter "hotel-images" as the bucket name
5. Choose the appropriate options for your needs:
   - Public URLs: Check this if you want images to be publicly accessible
   - File size limit: Set according to your needs (default is usually fine)
6. Click "Create bucket"

## Setting up Storage Policies

After creating the bucket, you need to set up policies to allow uploading and accessing images:

1. Click on the "hotel-images" bucket
2. Click on the "Settings" tab
3. In the "Policies" section, you'll need to add policies for:
   - Insert (upload)
   - Select (read)

### Example Policies

For testing purposes, you can use these simple policies:

**Insert Policy (for uploading images):**
```sql
INSERT policy:
FOR INSERT TO authenticated, anon WITH CHECK (true)
```

**Select Policy (for reading images):**
```sql
SELECT policy:
FOR SELECT TO authenticated, anon USING (true)
```

For production, you should use more restrictive policies based on your security requirements.

## Testing the Setup

After setting up the bucket and policies, restart your server and try uploading a hotel image again.