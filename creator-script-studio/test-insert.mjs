import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log("Testing insert into ideas...");
  
  const dummyIdea = {
    id: `test-idea-${Date.now()}`,
    order: 1,
    platform: "Tất cả",
    contentType: "Khác",
    content: "Test insert from node script",
    hook: "Test hook",
    details: "Test details",
    createdAt: new Date().toISOString()
  };

  const { data, error } = await supabase.from('ideas').upsert([dummyIdea]);
  
  if (error) {
    console.error("UPSERT ERROR:", error);
  } else {
    console.log("UPSERT SUCCESS!");
  }
}

testInsert();
