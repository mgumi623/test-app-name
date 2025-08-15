-- Add advanced settings columns to admin_settings table
ALTER TABLE admin_settings
ADD COLUMN weekly_five_shifts BOOLEAN DEFAULT true,
ADD COLUMN week_starts_sunday BOOLEAN DEFAULT true,
ADD COLUMN senior_staff_adjustment BOOLEAN DEFAULT true;