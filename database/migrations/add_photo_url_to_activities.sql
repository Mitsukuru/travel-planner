-- Add photo_url column to activities table
ALTER TABLE activities ADD COLUMN photo_url TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN activities.photo_url IS 'URL of the place photo from Google Places API';