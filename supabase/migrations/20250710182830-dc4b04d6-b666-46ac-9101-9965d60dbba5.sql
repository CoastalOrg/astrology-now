-- Clean up existing horoscope records by removing unwanted prefixes
UPDATE public.horoscope_readings 
SET daily_horoscope = TRIM(
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        daily_horoscope,
        '^\*\*Daily Horoscope for \w+\*\*\s*(Today,?\s*)?',
        '',
        'i'
      ),
      '^Daily Horoscope for \w+:?\s*(Today,?\s*)?',
      '',
      'i'
    ),
    '^Today,?\s*',
    '',
    'i'
  )
)
WHERE daily_horoscope IS NOT NULL 
AND (
  daily_horoscope ~* '^\*\*Daily Horoscope for \w+\*\*'
  OR daily_horoscope ~* '^Daily Horoscope for \w+:?'
  OR daily_horoscope ~* '^Today,?\s*'
);