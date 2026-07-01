import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: ideas } = await supabase.from('ideas').select('*');
  console.log('Ideas:', JSON.stringify(ideas, null, 2));

  const { data: projects } = await supabase.from('projects').select('*');
  console.log('Projects:', JSON.stringify(projects, null, 2));

  const { data: campaigns } = await supabase.from('campaigns').select('*');
  console.log('Campaigns:', JSON.stringify(campaigns, null, 2));
}

check();
