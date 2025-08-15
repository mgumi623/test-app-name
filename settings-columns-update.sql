-- Add settings columns to the teams table
ALTER TABLE teams
ADD COLUMN weekly_five_shifts BOOLEAN DEFAULT true,
ADD COLUMN week_starts_sunday BOOLEAN DEFAULT true,
ADD COLUMN senior_staff_adjustment BOOLEAN DEFAULT true;

-- Update the trigger to include new columns
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';