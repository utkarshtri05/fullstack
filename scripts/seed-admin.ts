#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const SUPABASE_URL = 'https://natmzcqxvcvjmtmpwgrw.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdG16amNxdmN2am10bXB3Z3J3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjcwOTk4NywiZXhwIjoyMDkyMjg1OTg3fQ.IxVMQqsgI6wFnah_JsEfSMFU8hyOlefOCK4rV7oNCFY';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase env vars');
  process.exit(1);
}

async function seedAdmin() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  const email = 'utkarsh@gmail.com';
  const password = 'utkarsh@12345';
  
  console.log('🔄 Creating admin user...');
  
  // Create user with service role (bypasses RLS/email confirm)
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Admin User' }
  });
  
  if (userError) {
    console.error('User creation error:', userError.message);
    return;
  }
  
  const userId = userData.user.id;
  console.log('✅ Admin user created:', userId);
  
  // Update profile role
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, role: 'admin', name: 'Admin User' }, { onConflict: 'user_id' });
  
  if (profileError) {
    console.error('Profile error:', profileError.message);
  } else {
    console.log('✅ Admin role set!');
  }
  
  console.log('\n🎉 ADMIN READY!');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\nTest: http://localhost:3000/admin/login');
  console.log('\nSupabase Dashboard → Authentication → Users → Verify');
  
  const hashed = await bcrypt.hash(password, 12);
  console.log('Hashed:', hashed);
}

seedAdmin().catch(console.error);

