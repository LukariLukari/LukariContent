import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
  console.log("Cleaning up test data...");
  const { error } = await supabase.from('ideas').delete().like('id', 'test-idea-%');
  if (error) {
    console.error("DELETE ERROR:", error);
  } else {
    console.log("DELETE SUCCESS!");
  }
}

testDelete();
