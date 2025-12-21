// supabase.js - CONFIGURAÇÃO COMPLETA E FUNCIONAL
const SUPABASE_URL = 'https://czysizvvnzxwsxqheogx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXNpenZ2bnp4d3N4cWhlb2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjQ5NjcsImV4cCI6MjA4MTg0MDk2N30.SdT-vsY-XSNwxRTxKHQD-zpeojgQSOFdhSSLet8cpyo';

// Verificar se biblioteca carregou
if (typeof supabase === 'undefined') {
    console.error('❌ ERRO: Biblioteca Supabase não carregada');
} else {
    // Criar cliente
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // ================= FUNÇÕES AUXILIARES =================
    
    // Gerar código de 7 dígitos
    function generatePlayerCode() {
        return Math.floor(1000000 + Math.random() * 9000000).toString();
    }
    
    // Verificar se código é único
    async function isPlayerCodeUnique(code) {
        try {
            const { data, error } = await supabaseClient
                .from('profiles')
                .select('player_code')
                .eq('player_code', code)
                .single();
            
            // Se não encontrou, é único
            return !data;
        } catch (error) {
            // Se erro 406 (PGRST116), não encontrou, então é único
            if (error.code === 'PGRST116' || error.message?.includes('0 rows')) {
                return true;
            }
            return false;
        }
    }
    
    // Gerar código único
    async function generateUniquePlayerCode() {
        let code = generatePlayerCode();
        let attempts = 0;
        
        while (attempts < 5) {
            const isUnique = await isPlayerCodeUnique(code);
            if (isUnique) return code;
            
            code = generatePlayerCode();
            attempts++;
        }
        return code;
    }
    
    // ================= FUNÇÕES PRINCIPAIS =================
    
    // Criar perfil do usuário
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
                .select()
                .single();
            
            if (error) {
                console.error('Erro criar perfil:', error);
                return { success: false, error: error.message };
            }
            
            return { 
                success: true, 
                data: data, 
                playerCode: playerCode 
            };
        } catch (error) {
            console.error('Exceção criar perfil:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Registrar novo usuário
    async function registerUser(email, password, fullName) {
        try {
            const baseUrl = window.location.origin;
            console.log('🔗 URL Base:', baseUrl);
            
            // 1. Registrar no Supabase Auth
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: fullName
                    },
                    emailRedirectTo: `${baseUrl}/cadastro.html?confirmed=true`
                }
            });
            
            if (authError) {
                console.error('❌ Erro auth:', authError);
                return { 
                    success: false, 
                    error: authError.message 
                };
            }
            
            console.log('✅ Auth criado:', authData);
            
            // 2. Se usuário foi criado, criar perfil
            if (authData.user) {
                const profileResult = await createUserProfile(authData.user.id, fullName);
                
                if (!profileResult.success) {
                    return { 
                        success: false, 
                        error: profileResult.error 
                    };
                }
                
                return { 
                    success: true, 
                    message: '🎉 Cadastro realizado! Verifique seu email.',
                    user: authData.user,
                    playerCode: profileResult.playerCode,
                    requiresConfirmation: true
                };
            }
            
            // 3. Se chegou aqui, email foi enviado
            return { 
                success: true, 
                message: '📧 Email de confirmação enviado!',
                requiresConfirmation: true
            };
            
        } catch (error) {
            console.error('💥 Erro registro:', error);
            return { 
                success: false, 
                error: error.message 
            };
        }
    }
    
    // Fazer login
    async function loginUser(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) {
                return { success: false, error: error.message };
            }
            
            return { 
                success: true, 
                user: data.user,
                session: data.session 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Obter perfil do usuário atual
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
            
            return { 
                success: true, 
                profile: profile, 
                user: user 
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Verificar autenticação
    async function checkAuth() {
        try {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            return { 
                isAuthenticated: !!user && !error, 
                user: user, 
                error: error 
            };
        } catch (error) {
            return { isAuthenticated: false, error: error.message };
        }
    }
    
    // Fazer logout
    async function logoutUser() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            return { success: !error, error: error };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Redefinir senha
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
    
    // ================= EXPORTAR =================
    window.supabaseClient = supabaseClient;
    window.supabaseAuth = {
        // Autenticação
        registerUser,
        loginUser,
        logoutUser,
        checkAuth,
        resetPassword,
        
        // Perfil
        getCurrentUserProfile,
        createUserProfile,
        
        // Utilitários
        generatePlayerCode,
        generateUniquePlayerCode
    };
    
    console.log('✅ Supabase configurado com sucesso!');
}