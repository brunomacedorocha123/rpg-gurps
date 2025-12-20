// supabase.js - Configuração completa
const SUPABASE_URL = 'https://czysizvvnzxwsxqheogx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXNpenZ2bnp4d3N4cWhlb2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjQ5NjcsImV4cCI6MjA4MTg0MDk2N30.SdT-vsY-XSNwxRTxKHQD-zpeojgQSOFdhSSLet8cpyo';

// Inicializar Supabase apenas se a biblioteca estiver disponível
if (typeof supabase !== 'undefined') {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Função para gerar código de 7 dígitos
    function generatePlayerCode() {
        return Math.floor(1000000 + Math.random() * 9000000).toString();
    }
    
    // Função para verificar se código já existe
    async function isPlayerCodeUnique(code) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('player_code')
                .eq('player_code', code)
                .single();
            
            // Se não encontrar dados, o código é único
            return !data;
        } catch (error) {
            return true; // Considera único em caso de erro
        }
    }
    
    // Função para gerar código único
    async function generateUniquePlayerCode() {
        let code = generatePlayerCode();
        let isUnique = await isPlayerCodeUnique(code);
        let attempts = 0;
        
        while (!isUnique && attempts < 5) {
            code = generatePlayerCode();
            isUnique = await isPlayerCodeUnique(code);
            attempts++;
        }
        
        return code;
    }
    
    // Função para criar perfil do usuário
    async function createUserProfile(userId, fullName) {
        try {
            const playerCode = await generateUniquePlayerCode();
            
            const { data, error } = await supabaseClient
                .from('profiles')
                .insert({
                    user_id: userId,
                    player_code: playerCode,
                    full_name: fullName
                });
            
            return { success: !error, data: data, error: error, playerCode: playerCode };
        } catch (error) {
            return { success: false, error: error };
        }
    }
    
    // Função para obter perfil do usuário atual
    async function getCurrentUserProfile() {
        try {
            const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
            
            if (userError || !user) {
                return { success: false, error: 'Usuário não autenticado' };
            }
            
            const { data: profile, error: profileError } = await supabaseClient
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
            
            if (profileError) {
                return { success: false, error: 'Perfil não encontrado' };
            }
            
            return { success: true, profile: profile, user: user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Função para fazer login
    async function loginUser(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            return { success: !error, data: data, error: error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Função para registrar novo usuário
    async function registerUser(email, password, fullName) {
        try {
            // Registrar no auth
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    },
                    emailRedirectTo: window.location.origin + '/cadastro.html?confirmed=true'
                }
            });
            
            if (authError) {
                return { success: false, error: authError.message };
            }
            
            // Criar perfil apenas se o usuário foi criado
            if (authData.user) {
                const profileResult = await createUserProfile(authData.user.id, fullName);
                return { 
                    success: profileResult.success, 
                    data: authData, 
                    profile: profileResult,
                    error: profileResult.error 
                };
            }
            
            return { success: true, data: authData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Função para fazer logout
    async function logoutUser() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            return { success: !error, error: error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Função para verificar se usuário está autenticado
    async function checkAuth() {
        try {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            return { isAuthenticated: !!user && !error, user: user, error: error };
        } catch (error) {
            return { isAuthenticated: false, error: error.message };
        }
    }
    
    // Função para redefinir senha
    async function resetPassword(email) {
        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/reset-password.html'
            });
            
            return { success: !error, error: error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Exportar todas as funções para uso global
    window.supabaseClient = supabaseClient;
    window.supabaseAuth = {
        registerUser,
        loginUser,
        logoutUser,
        checkAuth,
        resetPassword,
        getCurrentUserProfile,
        generatePlayerCode,
        generateUniquePlayerCode,
        createUserProfile
    };
    
} else {
    // Criar funções dummy para evitar erros
    window.supabaseClient = null;
    window.supabaseAuth = {
        registerUser: async () => ({ success: false, error: 'Supabase não carregado' }),
        loginUser: async () => ({ success: false, error: 'Supabase não carregado' }),
        logoutUser: async () => ({ success: false, error: 'Supabase não carregado' }),
        checkAuth: async () => ({ isAuthenticated: false, error: 'Supabase não carregado' }),
        getCurrentUserProfile: async () => ({ success: false, error: 'Supabase não carregado' }),
        generatePlayerCode: () => '0000000',
        generateUniquePlayerCode: async () => '0000000',
        createUserProfile: async () => ({ success: false, error: 'Supabase não carregado' })
    };
}