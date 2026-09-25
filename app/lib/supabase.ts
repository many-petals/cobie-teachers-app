import { createClient } from '@supabase/supabase-js';


// Canonical teacher/MANC50 Supabase project.
// Production builds should override these with EXPO_PUBLIC_* environment values.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://jllqowbqwenlosjwktff.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_UcMZ-HKA0HH6DZ7z6c2hjw_D0oRd-Jj';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };
