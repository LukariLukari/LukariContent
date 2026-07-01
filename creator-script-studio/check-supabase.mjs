import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Checking Supabase tables...");
  
  const { data: ideas, error: err1 } = await supabase.from('ideas').select('*');
  console.log('Ideas:', err1 ? 'ERROR: ' + err1.message : (ideas?.length + ' rows'));

  const { data: projects, error: err2 } = await supabase.from('projects').select('*');
  console.log('Projects:', err2 ? 'ERROR: ' + err2.message : (projects?.length + ' rows'));

  const { data: campaigns, error: err3 } = await supabase.from('campaigns').select('*');
  console.log('Campaigns:', err3 ? 'ERROR: ' + err3.message : (campaigns?.length + ' rows'));
}

check();
