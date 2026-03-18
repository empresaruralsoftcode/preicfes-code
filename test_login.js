const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xlyguqtuxoccvlrmfeoe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhseWd1cXR1eG9jY3Zscm1mZW9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3NjkyNzcsImV4cCI6MjA4OTM0NTI3N30.Hz6F5Zl8vJ5FpyZZhevo9a30mTSNryZrn5DJGgOSXhs';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'carlos.hurtado@preicfes.com',
    password: 'docente123'
  });

  if (error) {
    console.log('Login failed Error Output:', error.message);
  } else {
    console.log('Login successful!', data.user.email);
  }
}

testLogin();
