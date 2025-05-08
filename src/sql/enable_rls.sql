
-- Enable Row Level Security for the tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security for the user_tasks table
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- Update the streak bonus to 50 instead of 5 in the update_user_streak function
CREATE OR REPLACE FUNCTION public.update_user_streak(user_addr text)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  last_login_date DATE;
  current_date DATE := CURRENT_DATE;
  streak INTEGER;
  streak_bonus INTEGER := 50; -- Updated from 5 to 50
BEGIN
  -- Get the user's current streak and last login
  SELECT streak_count, last_login INTO streak, last_login_date
  FROM public.users 
  WHERE address = user_addr;
  
  -- If user has never logged in before
  IF last_login_date IS NULL THEN
    streak := 1;
  -- If user logged in yesterday, increment streak
  ELSIF last_login_date = current_date - INTERVAL '1 day' THEN
    streak := streak + 1;
  -- If user already logged in today, don't change streak
  ELSIF last_login_date = current_date THEN
    -- Do nothing, return current streak
    RETURN streak;
  -- Otherwise (missed a day or more), reset streak
  ELSE
    streak := 1;
  END IF;
  
  -- Update the user's streak and last login
  UPDATE public.users
  SET 
    streak_count = streak,
    last_login = current_date,
    balance = balance + streak_bonus,
    total_earned = total_earned + streak_bonus
  WHERE address = user_addr;
  
  RETURN streak;
END;
$function$
