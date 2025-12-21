// supabase-config.js - Coloque na mesma pasta que index.html
const SUPABASE_URL = 'https://mdyohqtvswunkhefbrkr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keW9ocXR2c3d1bmtoZWZicmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODA4NzYsImV4cCI6MjA4MTg1Njg3Nn0.bfc4sh8kDNhAXf9b1eRAlDuB0lGTfQIWNl6Sju1LViE';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabase;