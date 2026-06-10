import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .limit(1)
    .single();

  if (error) {
    console.error('Error fetching guide:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

main();
