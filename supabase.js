// supabase.js - VERSÃO FINAL E FUNCIONAL
const SUPABASE_URL = 'https://czysizvvnzxwsxqheogx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXNpenZ2bnp4d3N4cWhlb2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjQ5NjcsImV4cCI6MjA4MTg0MDk2N30.SdT-vsY-XSNwxRTxKHQD-zpeojgQSOFdhSSLet8cpyo';

if (typeof supabase === 'undefined') {
    throw new Error('Biblioteca Supabase não carregada');
}

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function generatePlayerCode() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

async function isPlayerCodeUnique(code) {
    try {
        const { data } = await supabaseClient
            .from('profiles')
            .select('player_code')
            .eq('player_code', code)
            .maybeSingle();
        
        return !data;
    } catch {
        return true;
    }
}

async function generateUniquePlayerCode() {
    let code = generatePlayerCode();
    let attempts = 0;
    
    while (attempts < 5) {
        if (await isPlayerCodeUnique(code)) return code;
        code = generatePlayerCode();
        attempts++;
    }
    return code;
}

async function createUserProfile(userId, fullName) {
    try {
        const playerCode = await generateUniquePlayerCode();
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .insert({
                user_id: userId,
                player_code: playerCode,
                full_name: fullName
            })
            .select();
        
        if (error) throw error;
        
        return { 
            success: true, 
            playerCode: playerCode,
            data: data[0]
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.message 
        };
    }
}

async function registerUser(email, password, fullName) {
    try {
        const baseUrl = window.location.origin;
        
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { full_name: fullName },
                emailRedirectTo: `${baseUrl}/cadastro.html?confirmed=true`
            }
        });
        
        if (authError) throw authError;
        
        if (authData.user) {
            const profileResult = await createUserProfile(authData.user.id, fullName);
            
            if (!profileResult.success) {
                throw new Error(profileResult.error);
            }
            
            return {
                success: true,
                message: 'Cadastro realizado! Verifique seu email.',
                playerCode: profileResult.playerCode,
                requiresConfirmation: true
            };
        }
        
        return {
            success: true,
            message: 'Email de confirmação enviado!',
            requiresConfirmation: true
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

async function loginUser(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        return { 
            success: true,
            user: data.user
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.message 
        };
    }
}

async function getCurrentUserProfile() {
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) throw new Error('Usuário não autenticado');
        
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (profileError) throw new Error('Perfil não encontrado');
        
        return { 
            success: true, 
            profile: profile
        };
    } catch (error) {
        return { 
            success: false, 
            error: error.message 
        };
    }
}

async function checkAuth() {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        return { isAuthenticated: !!user, user: user };
    } catch {
        return { isAuthenticated: false };
    }
}

async function logoutUser() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        return { success: !error, error: error };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function resetPassword(email) {
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        
        return { success: !error, error: error };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

window.supabaseClient = supabaseClient;
window.supabaseAuth = {
    registerUser,
    loginUser,
    logoutUser,
    checkAuth,
    resetPassword,
    getCurrentUserProfile,
    generatePlayerCode
};