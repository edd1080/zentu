import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Load .env.local manually for Deno testing
const envFile = await Deno.readTextFile('.env.local');
const env: Record<string, string> = {};
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(supabaseUrl, supabaseKey);

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("=== AGENTI Action Loop Tests ===");

  // Setup: Find a suggestion to work with
  const { data: suggestion, error: sErr } = await supabase
    .from('suggestions')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (sErr || !suggestion) {
    console.error("No pending suggestion found. Please run simulate_webhook.js first to generate one.");
    return;
  }

  const suggestionId = suggestion.id;
  const originalContent = suggestion.content;
  console.log(`\nFound pending suggestion: ${suggestionId}`);
  console.log(`Original Content: "${originalContent}"`);
  console.log(`Intent: ${suggestion.metadata?.detected_intent_label}`);

  console.log("\n--- TEST: Edit Suggestion ---");
  const finalContent = "Editado via test_actions: " + originalContent + " (Horario: 8:00 AM)";
  
  // Call the suggestion-actions Edge Function
  console.log("Invoking suggestion-actions with 'edit'...");
  const { data: editData, error: editError } = await supabase.functions.invoke('suggestion-actions', {
    body: {
      suggestion_id: suggestionId,
      action: 'edit',
      final_content: finalContent
    },
    headers: { 'Authorization': `Bearer ${supabaseKey}` }
  });

  if (editError) {
    console.error("❌ Edit failed:", editError);
  } else {
    console.log("✅ Edit success. Response:", editData);
  }

  // Verify Status Update
  console.log("Verifying suggestion status in DB...");
  const { data: updatedSug } = await supabase.from('suggestions').select('status, resolved_at, resolved_by_owner').eq('id', suggestionId).single();
  console.log(`Updated Status: ${updatedSug?.status} (Expected: edited)`);
  
  // Verify Conversation Resolution
  const { data: conv } = await supabase.from('conversations').select('status, resolved_by').eq('id', suggestion.conversation_id).single();
  console.log(`Conversation Status: ${conv?.status} (Expected: resolved)`);
  console.log(`Conversation Resolved By: ${conv?.resolved_by} (Expected: owner_manual)`);

  // Verify Knowledge Source created
  console.log("Waiting 3 seconds for async classify-correction to process...");
  await wait(3000);

  const { data: ksList } = await supabase.from('knowledge_sources').select('id, raw_content').eq('business_id', suggestion.business_id).eq('type', 'correction').order('created_at', { ascending: false }).limit(1);
  if (ksList && ksList.length > 0) {
      console.log(`✅ Knowledge Source created: ${ksList[0].id}`);
      // Find the corresponding structured knowledge item
      const { data: kiList } = await supabase.from('knowledge_items').select('id, layer, content, confirmed_by_owner').eq('source_id', ksList[0].id);
      if (kiList && kiList.length > 0) {
          console.log(`✅ Knowledge Item created from correction! Layer: ${kiList[0].layer}, Content: "${kiList[0].content}", Confirmed manually: ${kiList[0].confirmed_by_owner}`);
      } else {
          console.warn("⚠️ Knowledge Item not found for the source. classify-correction might have failed or is slow.");
      }
  } else {
      console.error("❌ Knowledge Source not found. Edit logic failed.");
  }
}

runTests().catch(console.error);
