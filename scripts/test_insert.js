const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://rutzgbwziinixdrryirv.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imptd2R4b3BqeW90dnJ2aWZjcHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjkzOTQxMiwiZXhwIjoyMDg4NTE1NDEyfQ.IlKYxrl1P1L_oN5U2QMzaCJ82K6A0Q9q-hRuHMbnQgM'
);

async function test() {
  const { data: conv } = await supabase.from('conversations').select('id, business_id').limit(1).single();
  console.log('Conversation:', conv);
  
  const { error } = await supabase.from('suggestions').insert([{
      business_id: conv.business_id,
      conversation_id: conv.id,
      content: 'This is a test suggestion',
      confidence: 0.95,
      confidence_tier: 'high',
      status: 'pending'
  }]);
  
  console.log('Insert error:', error);
  
  const { data: res } = await supabase.from('suggestions').select('id, content');
  console.log('Suggestions:', res);
}
test();
