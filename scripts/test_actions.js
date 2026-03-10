const supabaseUrl = 'https://rutzgbwziinixdrryirv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1dHpnYnd6aWluaXhkcnJ5aXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMzE5MzQsImV4cCI6MjA4ODYwNzkzNH0.71QawE7wUnspORMBYEDH7e9PNEj4UL3BZghulg4BEkg';


// Minimal Supabase client using fetch
const supabase = {
    async query(path, method = 'GET', body = null) {
        const url = `${supabaseUrl}/rest/v1/${path}`;
        const headers = {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };
        const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
        return await res.json();
    },
    async invoke(functionName, body) {
        const url = `${supabaseUrl}/functions/v1/${functionName}`;
        const headers = {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        };
        const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(`Function failed ${res.status}: ${await res.text()}`);
        return await res.json();
    }
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  console.log("=== AGENTI Action Loop Tests ===");

  // Setup: Find a suggestion to work with
  const suggestions = await supabase.query('suggestions?status=eq.pending&order=created_at.desc&limit=1');
  const suggestion = suggestions[0];

  if (!suggestion) {
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
  try {
      const editData = await supabase.invoke('suggestion-actions', {
        suggestion_id: suggestionId,
        action: 'edit',
        final_content: finalContent
      });
      console.log("✅ Edit success. Response:", editData);
  } catch (editError) {
      console.error("❌ Edit failed:", editError.message);
  }

  // Verify Status Update
  console.log("Verifying suggestion status in DB...");
  const updatedSug = await supabase.query(`suggestions?id=eq.${suggestionId}&select=status,resolved_at,resolved_by_owner`);
  console.log(`Updated Status: ${updatedSug[0]?.status} (Expected: edited)`);
  
  // Verify Conversation Resolution
  const convs = await supabase.query(`conversations?id=eq.${suggestion.conversation_id}&select=status,resolved_by`);
  console.log(`Conversation Status: ${convs[0]?.status} (Expected: resolved)`);
  console.log(`Conversation Resolved By: ${convs[0]?.resolved_by} (Expected: owner_manual)`);

  // Verify Knowledge Source created
  console.log("Waiting 3 seconds for async classify-correction to process...");
  await wait(3000);

  const ksList = await supabase.query(`knowledge_sources?business_id=eq.${suggestion.business_id}&type=eq.correction&order=created_at.desc&limit=1`);
  if (ksList && ksList.length > 0) {
      console.log(`✅ Knowledge Source created: ${ksList[0].id}`);
      // Find the corresponding structured knowledge item
      const kiList = await supabase.query(`knowledge_items?source_id=eq.${ksList[0].id}&select=id,layer,content,confirmed_by_owner`);
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
