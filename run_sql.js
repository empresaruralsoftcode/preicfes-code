const fs = require('fs');

async function runSQL(scriptPath) {
  const sql = fs.readFileSync(scriptPath, 'utf8');
  const token = 'sbp_2a5402de1fc44aa3324a083038874c3a6238ea85';
  const ref = 'xlyguqtuxoccvlrmfeoe';
  
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });
  
  const text = await res.text();
  console.log(`Response for ${scriptPath}:`, text);
}

async function main() {
  await runSQL('init_database.sql');
  await runSQL('fix_users.sql');
}

main().catch(console.error);
