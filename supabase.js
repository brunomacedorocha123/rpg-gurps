// supabase.js - CONFIGURAÇÃO COMPLETA
const SUPABASE_URL = 'https://czysizvvnzxwsxqheogx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXNpenZ2bnp4d3N4cWhlb2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjQ5NjcsImV4cCI6MjA4MTg0MDk2N30.SdT-vsY-XSNwxRTxKHQD-zpeojgQSOFdhSSLet8cpyo';

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Gerar código de 7 dígitos
function generatePlayerCode() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// Verificar se código é único
async function isPlayerCodeUnique(code) {
    const { data, error } = await supabase
        .from('profiles')
        .select('player_code')
        .eq('player_code', code)
        .single();
    
    return !data;
}

// Gerar código único
async function generateUniquePlayerCode() {
    let code;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
        code = generatePlayerCode();
        isUnique = await isPlayerCodeUnique(code);
        attempts++;
    }
    
    return code || generatePlayerCode();
}

// Criar perfil do usuário
async function createUserProfile(userId, fullName, playerCode) {
    const { data, error } = await supabase
        .from('profiles')
        .insert({
            user_id: userId,
            player_code: playerCode,
            full_name: fullName
        });
    
    return { data, error };
}

// Exportar
window.supabaseTools = {
    supabase,
    generateUniquePlayerCode,
    createUserProfile
};