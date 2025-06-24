
-- Add missing DELETE policy for ai_conversations table
CREATE POLICY "Users can delete their own AI conversations" 
  ON public.ai_conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);
