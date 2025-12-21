// supabase-config.js
const SUPABASE_URL = 'https://sjajziurzcywpzpxbxap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWp6aXVyemN5d3B6cHhieGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzYxNTksImV4cCI6MjA4MTg1MjE1OX0.OJwH1r7nNQ5Zas77oxdxkqFmZ1BkjTpoNhOrLAVZqQQ';

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase configurado:', { url: SUPABASE_URL });

// Função para gerar ID único de 7 dígitos
function gerarIDUnico() {
    const min = 1000000;
    const max = 9999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Exportar para uso global
window.supabaseClient = supabase;
window.gerarIDUnico = gerarIDUnico;