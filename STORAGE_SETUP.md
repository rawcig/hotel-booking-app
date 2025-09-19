# Supabase Storage Setup for Hotel Images

This document explains how to set up Supabase Storage for uploading hotel images in the admin panel.

## Creating the Storage Bucket

1. Log in to your Supabase project dashboard
2. Navigate to **Storage** → **Buckets**
3. Click **New Bucket**
4. Enter the following details:
   - **Name**: `hotel-images`
   - **Public URLs**: Check this option to allow public access to images
5. Click **Create Bucket**

## Setting Up Bucket Policies

After creating the bucket, you need to set up policies to control access:

1. In the bucket list, click on the `hotel-images` bucket
2. Go to the **Policies** tab
3. Ensure the following policies are set:

### For Public Read Access (for displaying images):
```sql
-- Allow public read access to hotel images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'hotel-images' );
```

### For Admin Upload Access:
```sql
-- Allow authenticated users with admin role to upload
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'hotel-images' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role_id = 1
  )
);
```

### For Admin Update/Delete Access:
```sql
-- Allow authenticated users with admin role to update/delete
CREATE POLICY "Admin Update/Delete"
ON storage.objects FOR ALL
USING (
  bucket_id = 'hotel-images' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role_id = 1
  )
);
```

## Installing Dependencies

Make sure to install the required dependencies in the server directory:

```bash
cd server
npm install multer uuid
```

## Testing the Implementation

1. Start the server:
   ```bash
   cd server
   npm start
   ```

2. Log in to the admin panel at `http://localhost:3000/admin`
3. Navigate to the Hotels section
4. Click "Add New Hotel"
5. Select an image file for the hotel
6. Fill in the other details and submit
7. The image should be uploaded to Supabase Storage and displayed in the hotel list

## Troubleshooting

If you encounter issues:

1. **Check bucket permissions**: Ensure the bucket policies are correctly set
2. **Verify environment variables**: Make sure `SUPABASE_SERVICE_ROLE_KEY` is correctly set in your `.env` file
3. **Check file size limits**: The current implementation limits uploads to 5MB
4. **Verify bucket name**: Ensure the bucket is named exactly `hotel-images`

## Security Notes

- The `hotel-images` bucket is set to public to allow images to be displayed in the app
- Only authenticated admin users can upload, update, or delete images
- File type validation is implemented to only allow image files
- File size limits help prevent abuse