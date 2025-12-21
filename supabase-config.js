// supabase-config.js
const SUPABASE_URL = 'https://sjajziurzcywpzpxbxap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWp6aXVyemN5d3B6cHhieGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzYxNTksImV4cCI6MjA4MTg1MjE1OX0.OJwH1r7nNQ5Zas77oxdxkqFmZ1BkjTpoNhOrLAVZqQQ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Função para gerar ID único de 7 dígitos
function gerarIDUnico() {
    // Gera um número entre 1000000 e 9999999 (7 dígitos)
    const min = 1000000;
    const max = 9999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Verificar se o usuário está autenticado
function verificarAutenticacao() {
    const user = supabase.auth.getUser();
    return user;
}

// Redirecionar para dashboard se já estiver logado
function verificarSessao() {
    const user = supabase.auth.getUser();
    if (user) {
        window.location.href = 'dashboard.html';
    }
}