// supabase-config.js
// Verificar se supabase já foi declarado
if (!window.supabase) {
    const SUPABASE_URL = 'https://sjajziurzcywpzpxbxap.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWp6aXVyemN5d3B6cHhieGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzYxNTksImV4cCI6MjA4MTg1MjE1OX0.OJwH1r7nNQ5Zas77oxdxkqFmZ1BkjTpoNhOrLAVZqQQ';

    // Inicializar Supabase
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Função para gerar ID único de 7 dígitos
function generateUserId() {
    // Gera um número de 7 dígitos começando com 1 para garantir 7 dígitos
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// Verificar se usuário está autenticado
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
}

// Sair
async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (!error) {
        window.location.href = 'index.html';
    }
}

// Função para criar usuário na tabela personalizada
async function createUserProfile(userId, email, nome) {
    const { data, error } = await supabase
        .from('usuarios')
        .insert([
            {
                user_id: userId,
                email: email,
                nome: nome,
                data_criacao: new Date(),
                ultimo_login: new Date()
            }
        ])
        .select()
        .single();

    return { data, error };
}

// Função para buscar usuário por ID
async function getUserById(userId) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('user_id', userId)
        .single();
    
    return { data, error };
}

// Função para buscar usuário por email
async function getUserByEmail(email) {
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();
    
    return { data, error };
}