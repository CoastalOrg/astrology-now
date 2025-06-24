
-- Drop existing policies that might conflict and recreate them properly
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own horoscope readings" ON public.horoscope_readings;
DROP POLICY IF EXISTS "Users can create their own horoscope readings" ON public.horoscope_readings;
DROP POLICY IF EXISTS "Users can update their own horoscope readings" ON public.horoscope_readings;
DROP POLICY IF EXISTS "Users can view their own AI conversations" ON public.ai_conversations;
DROP POLICY IF EXISTS "Users can create their own AI conversations" ON public.ai_conversations;

-- Now create all policies fresh
-- Profiles table policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- AI conversations table policies
CREATE POLICY "Users can view their own AI conversations" 
  ON public.ai_conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI conversations" 
  ON public.ai_conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Horoscope readings table policies
CREATE POLICY "Users can view their own horoscope readings" 
  ON public.horoscope_readings 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own horoscope readings" 
  ON public.horoscope_readings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own horoscope readings" 
  ON public.horoscope_readings 
  FOR UPDATE 
  USING (auth.uid() = user_id);
