-- Add support for 7 days/week frequency
-- First, drop the existing check constraint on frequency
ALTER TABLE routines DROP CONSTRAINT IF EXISTS routines_frequency_check;

-- Add new check constraint that includes 7 days/week
ALTER TABLE routines ADD CONSTRAINT routines_frequency_check 
CHECK (frequency IN ('2 days/week', '3 days/week', '4 days/week', '7 days/week'));

-- Also update user_profiles table if it has the same constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_frequency_check;

ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_frequency_check 
CHECK (frequency IN ('2 days/week', '3 days/week', '4 days/week', '7 days/week'));
