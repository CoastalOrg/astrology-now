-- Remove the unique constraint that prevents multiple horoscope readings per day
ALTER TABLE public.horoscope_readings 
DROP CONSTRAINT IF EXISTS horoscope_readings_user_id_reading_date_key;

-- Add a new unique constraint on id, user_id, and created_at to allow multiple readings per day
-- but ensure each specific reading entry is unique
CREATE UNIQUE INDEX IF NOT EXISTS horoscope_readings_unique_entry 
ON public.horoscope_readings (id, user_id, created_at);