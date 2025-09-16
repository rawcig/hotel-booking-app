# Supabase Database Deployment Guide (Complete Solution)

This guide provides step-by-step instructions for deploying the database schema to your Supabase instance with proper UUID handling.

## Prerequisites

1. Access to your Supabase project dashboard
2. Admin privileges for your Supabase project
3. Existing `users`, `user_roles`, and `bookings` tables (may need updates)

## Deployment Steps

### Step 1: Fix bookings.user_id Data Type

First, we need to correct the data type of `bookings.user_id` from TEXT to UUID to match `users.id`:

1. Log in to your Supabase dashboard
2. Navigate to the "SQL Editor" section
3. Copy and paste the contents of `migrate-bookings-user-id-to-uuid.sql`
4. Click "Run" to execute the script

This will:
- Safely convert the `user_id` column from text to UUID type
- Preserve existing data that contains valid UUID strings
- Maintain the foreign key relationship with `users.id`

### Step 2: Verify Table Structure

After migration, verify that your tables have the correct structure:
1. `users.id` should be UUID type
2. `bookings.user_id` should now be UUID type (matching the reference)
3. All other foreign key relationships should use matching data types

### Step 3: Create Additional Tables (if needed)

1. In the same SQL Editor (or a new query), copy and paste the contents of `supabase-complete-setup.sql` or `supabase-migration.sql`
2. Click "Run" to execute the script

This will:
- Create all missing tables with proper data types
- Set up correct foreign key relationships
- Create necessary triggers
- Grant appropriate permissions

### Step 4: Apply RLS Policies

1. In the same SQL Editor (or a new query), copy and paste the contents of `supabase-rls-policies-uuid-corrected.sql`
2. Click "Run" to execute the script

This will:
- Enable Row Level Security on all tables
- Apply security policies with proper UUID handling
- Set up access controls without unnecessary type casting

## Important Notes

### Data Migration Considerations

The migration script includes safety checks:
- It validates that existing `user_id` values are valid UUID strings
- It only converts valid UUID strings to prevent data loss
- It preserves the foreign key relationship with `users.id`

### Proper UUID Handling

This implementation properly handles UUID comparisons:
- No unnecessary casting between text and UUID types
- Direct comparisons between `auth.uid()` and UUID columns
- Cleaner, more efficient policies

### Policy Implementation

The policies follow these patterns:
1. Direct use of `auth.uid()` for UUID comparisons
2. Use of `auth.uid() IS NOT NULL` for authenticated-only checks
3. Proper indexes for performance optimization

## Troubleshooting

### Common Issues

1. **Invalid UUID values in bookings.user_id**:
   - The migration script includes a check query to identify invalid values
   - You may need to clean up these records before migration
   - Example cleanup: `DELETE FROM public.bookings WHERE user_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AND user_id IS NOT NULL AND user_id != '';`

2. **"relation already exists" errors**:
   - These are safe to ignore as the scripts use `IF NOT EXISTS`
   - They just indicate the table is already created

3. **Permission errors**:
   - Ensure you're running as a user with sufficient privileges
   - You may need to run scripts as the database owner

4. **Foreign key constraint errors**:
   - Make sure base tables (`users`, `user_roles`) exist
   - Verify data types match (UUID to UUID)

### Verifying Deployment

1. Check the "Table Editor" to confirm all tables were created
2. Verify relationships between tables in the "Table Editor"
3. Test RLS policies by:
   - Creating a test user
   - Attempting to access data with different roles
   - Confirming access restrictions work as expected

## Order of Execution

Execute the scripts in this order:

1. `migrate-bookings-user-id-to-uuid.sql` (fixes data type)
2. `supabase-complete-setup.sql` or `supabase-migration.sql` (creates additional tables)
3. `supabase-rls-policies-uuid-corrected.sql` (applies security policies)

## Post-Deployment Steps

1. **Test Data Insertion**:
   - Try inserting sample data into each table
   - Verify foreign key relationships work

2. **Test Queries**:
   - Run sample SELECT queries to ensure data retrieval works
   - Test JOIN queries between related tables

3. **Test RLS Policies**:
   - Log in as different user types
   - Verify access restrictions work correctly

4. **Backup Your Database**:
   - Create a backup of your database after successful deployment

## Benefits of This Approach

1. **Data Integrity**: Consistent UUID data types across related tables
2. **Performance**: Direct UUID comparisons are more efficient than text casting
3. **Type Safety**: No risk of type conversion errors
4. **Maintainability**: Cleaner, more readable policies
5. **Best Practices**: Following proper database design principles

This approach provides a complete solution that fixes the underlying data type inconsistency while implementing proper security policies.