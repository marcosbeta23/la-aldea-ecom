import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function run() {
  const { data, error } = await supabase.from('guides').select('*').limit(1).single();
  const out = [];
  out.push('Error: ' + JSON.stringify(error));
  if (data) {
    out.push('sections type: ' + typeof data.sections + ' isArray: ' + Array.isArray(data.sections));
    out.push('related_categories type: ' + typeof data.related_categories + ' isArray: ' + Array.isArray(data.related_categories));
    out.push('keywords type: ' + typeof data.keywords + ' isArray: ' + Array.isArray(data.keywords));
    out.push('data: ' + JSON.stringify(data, null, 2));
  } else {
    out.push('no data');
  }
  fs.writeFileSync('check-output.txt', out.join('\n'));
}
run();
