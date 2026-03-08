import { createClient } from '@supabase/supabase-js';


// Initialize database client
const supabaseUrl = 'https://nsmawhmhbwpylykevoxe.databasepad.com';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ijk4NjJjMDNhLTFjZDEtNDdhNy1iM2FhLTY4MWJmZGY0ZGNhMyJ9.eyJwcm9qZWN0SWQiOiJuc21hd2htaGJ3cHlseWtldm94ZSIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzcxMjg4MDIwLCJleHAiOjIwODY2NDgwMjAsImlzcyI6ImZhbW91cy5kYXRhYmFzZXBhZCIsImF1ZCI6ImZhbW91cy5jbGllbnRzIn0.POsmDFQcxQJGkK00nUTOjtUzVolHXTlpTEp_MX1Bsas';
const supabase = createClient(supabaseUrl, supabaseKey);


export { supabase };