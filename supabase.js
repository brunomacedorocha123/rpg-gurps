// supabase.js - VERSÃO ATUALIZADA
const SUPABASE_URL = 'https://czysizvvnzxwsxqheogx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXNpenZ2bnp4d3N4cWhlb2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjQ5NjcsImV4cCI6MjA4MTg0MDk2N30.SdT-vsY-XSNwxRTxKHQD-zpeojgQSOFdhSSLet8cpyo';

// 1. VERIFICAR SE A BIBLIOTECA CARREGOU
if (typeof supabase === 'undefined') {
    console.error('❌ ERRO: Biblioteca Supabase não carregada!');
    console.error('Adicione no HTML:');
    console.error('<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
    throw new Error('Biblioteca Supabase não encontrada');
}

// 2. INICIALIZAR O CLIENTE
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: localStorage,
        flowType: 'pkce' // IMPORTANTE para verificação de e-mail
    }
});

console.log('✅ Supabase inicializado com sucesso');

// 3. FUNÇÕES AUXILIARES

/**
 * Gera um código de 7 dígitos único
 * @returns {string} Código de 7 dígitos
 */
function generate7DigitCode() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

/**
 * Verifica se um código já existe no banco
 * @param {string} code - Código a verificar
 * @returns {Promise<boolean>} True se for único
 */
async function isCodeUnique(code) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('player_code')
            .eq('player_code', code)
            .maybeSingle();
        
        if (error) {
            console.warn('⚠️ Erro ao verificar código:', error.message);
            return true;
        }
        
        return !data; // True se não encontrar (código único)
    } catch (error) {
        console.error('❌ Erro inesperado:', error);
        return true;
    }
}

/**
 * Gera um código único de 7 dígitos
 * @returns {Promise<string>} Código único
 */
async function generateUniquePlayerCode() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const code = generate7DigitCode();
        const isUnique = await isCodeUnique(code);
        
        if (isUnique) {
            console.log(`✅ Código único gerado: ${code}`);
            return code;
        }
        
        attempts++;
        console.log(`🔄 Tentativa ${attempts}: código ${code} já existe`);
    }
    
    // Fallback: usar timestamp + random
    const timestamp = Date.now().toString();
    const randomNum = Math.floor(Math.random() * 1000);
    const fallbackCode = (parseInt(timestamp.slice(-6)) + randomNum).toString().slice(-7).padStart(7, '1');
    console.log(`⚠️ Usando fallback: ${fallbackCode}`);
    return fallbackCode;
}

/**
 * Cria ou atualiza perfil do usuário
 * @param {string} userId - ID do usuário
 * @param {string} fullName - Nome completo
 * @param {string} playerCode - Código do jogador
 * @returns {Promise<Object>} Resultado
 */
async function createOrUpdateProfile(userId, fullName, playerCode) {
    try {
        // Primeiro, verificar se já existe um perfil
        const { data: existingProfile, error: checkError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();
        
        if (checkError) {
            console.error('❌ Erro ao verificar perfil:', checkError);
        }
        
        if (existingProfile) {
            // Atualizar perfil existente
            const { data, error } = await supabaseClient
                .from('profiles')
                .update({
                    full_name: fullName,
                    player_code: playerCode,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', userId)
                .select();
            
            if (error) throw error;
            
            console.log('✅ Perfil atualizado:', data);
            return { success: true, profile: data[0], isNew: false };
        } else {
            // Criar novo perfil
            const { data, error } = await supabaseClient
                .from('profiles')
                .insert({
                    user_id: userId,
                    full_name: fullName,
                    player_code: playerCode
                })
                .select();
            
            if (error) throw error;
            
            console.log('✅ Perfil criado:', data);
            return { success: true, profile: data[0], isNew: true };
        }
    } catch (error) {
        console.error('❌ Erro ao criar/atualizar perfil:', error);
        throw error;
    }
}

// 4. FUNÇÕES PRINCIPAIS

/**
 * Registra um novo usuário com código de 7 dígitos
 * @param {string} email - Email do usuário
 * @param {string} password - Senha
 * @param {string} fullName - Nome completo
 * @returns {Promise<Object>} Resultado do registro
 */
async function registerUser(email, password, fullName) {
    try {
        console.log('🔄 Iniciando registro para:', email);
        
        // 1. Gerar código único ANTES do registro
        const playerCode = await generateUniquePlayerCode();
        console.log('🎯 Código gerado antes do registro:', playerCode);
        
        // 2. Registrar no Auth do Supabase
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName,
                    player_code: playerCode
                },
                emailRedirectTo: `${window.location.origin}/cadastro.html?confirmed=true&code=${playerCode}`
            }
        });

        if (authError) {
            console.error('❌ Erro no Auth:', authError);
            throw new Error(authError.message);
        }

        console.log('✅ Usuário criado no Auth, ID:', authData.user?.id);
        console.log('📧 Email de confirmação enviado:', authData.user?.confirmation_sent_at);
        
        // 3. Salvar código temporariamente para uso após confirmação
        if (authData.user?.id) {
            localStorage.setItem('pending_user_email', email);
            localStorage.setItem('pending_user_name', fullName);
            localStorage.setItem('pending_user_code', playerCode);
            localStorage.setItem('pending_user_id', authData.user.id);
        }
        
        return {
            success: true,
            message: 'Cadastro realizado! Verifique seu email para confirmar.',
            requiresConfirmation: true,
            playerCode: playerCode,
            userId: authData.user?.id
        };
        
    } catch (error) {
        console.error('❌ Erro geral no registro:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verifica se o e-mail foi confirmado e cria o perfil
 * @returns {Promise<Object>} Resultado
 */
async function checkAndCompleteRegistration() {
    try {
        // Verificar se há dados pendentes
        const pendingEmail = localStorage.getItem('pending_user_email');
        const pendingName = localStorage.getItem('pending_user_name');
        const pendingCode = localStorage.getItem('pending_user_code');
        const pendingUserId = localStorage.getItem('pending_user_id');
        
        if (!pendingEmail || !pendingName || !pendingCode) {
            console.log('ℹ️ Nenhum registro pendente encontrado');
            return { success: false, message: 'Nenhum registro pendente' };
        }
        
        // Tentar fazer login para verificar se o e-mail foi confirmado
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
            console.log('⚠️ Nenhuma sessão ativa:', sessionError.message);
            return { success: false, message: 'Usuário não autenticado' };
        }
        
        if (sessionData.session?.user) {
            const user = sessionData.session.user;
            
            // Verificar se o e-mail foi confirmado
            if (user.email_confirmed_at || user.confirmed_at) {
                console.log('✅ Email confirmado em:', user.email_confirmed_at);
                
                // Criar perfil com o código gerado anteriormente
                const result = await createOrUpdateProfile(
                    user.id,
                    pendingName,
                    pendingCode
                );
                
                // Limpar dados pendentes
                localStorage.removeItem('pending_user_email');
                localStorage.removeItem('pending_user_name');
                localStorage.removeItem('pending_user_code');
                localStorage.removeItem('pending_user_id');
                
                return {
                    success: true,
                    message: 'Cadastro completado com sucesso!',
                    playerCode: pendingCode,
                    profile: result.profile
                };
            }
        }
        
        return { success: false, message: 'Aguardando confirmação do email' };
        
    } catch (error) {
        console.error('❌ Erro ao verificar cadastro:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Faz login de um usuário
 * @param {string} email - Email
 * @param {string} password - Senha
 * @returns {Promise<Object>} Resultado do login
 */
async function loginUser(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            // Verificar se é erro de email não confirmado
            if (error.message.includes('Email not confirmed')) {
                throw new Error('Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
            }
            throw error;
        }
        
        return {
            success: true,
            user: data.user,
            session: data.session
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Obtém o perfil do usuário atual
 * @returns {Promise<Object>} Perfil do usuário
 */
async function getCurrentUserProfile() {
    try {
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) {
            throw new Error('Usuário não autenticado');
        }
        
        // Buscar perfil
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
        
        if (profileError) {
            console.error('❌ Erro ao buscar perfil:', profileError);
            throw profileError;
        }
        
        if (!profile) {
            console.warn('⚠️ Perfil não encontrado para usuário:', user.id);
            
            // Criar perfil se não existir
            const playerCode = await generateUniquePlayerCode();
            const { data: newProfile, error: createError } = await supabaseClient
                .from('profiles')
                .insert({
                    user_id: user.id,
                    player_code: playerCode,
                    full_name: user.user_metadata?.full_name || 'Jogador'
                })
                .select()
                .single();
            
            if (createError) throw createError;
            
            return {
                success: true,
                profile: newProfile,
                user: user
            };
        }
        
        return {
            success: true,
            profile: profile,
            user: user
        };
    } catch (error) {
        console.error('❌ Erro ao obter perfil:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verifica autenticação e status do cadastro
 * @returns {Promise<Object>} Status
 */
async function checkAuthStatus() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        if (error || !user) {
            return {
                isAuthenticated: false,
                emailConfirmed: false,
                user: null
            };
        }
        
        return {
            isAuthenticated: true,
            emailConfirmed: !!user.email_confirmed_at,
            user: user
        };
    } catch (error) {
        return {
            isAuthenticated: false,
            emailConfirmed: false,
            error: error.message
        };
    }
}

/**
 * Reenvia email de confirmação
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Resultado
 */
async function resendConfirmationEmail(email) {
    try {
        const { error } = await supabaseClient.auth.resend({
            type: 'signup',
            email: email,
            options: {
                emailRedirectTo: `${window.location.origin}/cadastro.html?confirmed=true`
            }
        });
        
        if (error) throw error;
        
        return {
            success: true,
            message: 'Email de confirmação reenviado com sucesso!'
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Faz logout do usuário
 * @returns {Promise<Object>} Resultado do logout
 */
async function logoutUser() {
    try {
        const { error } = await supabaseClient.auth.signOut();
        
        // Limpar dados locais
        localStorage.removeItem('pending_user_email');
        localStorage.removeItem('pending_user_name');
        localStorage.removeItem('pending_user_code');
        localStorage.removeItem('pending_user_id');
        
        return {
            success: !error,
            error: error?.message
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// 5. EXPORTAR PARA USO GLOBAL
window.supabaseClient = supabaseClient;
window.supabaseAuth = {
    // Autenticação
    registerUser,
    loginUser,
    logoutUser,
    checkAuthStatus,
    resendConfirmationEmail,
    
    // Perfil
    getCurrentUserProfile,
    createOrUpdateProfile,
    
    // Registro completo
    checkAndCompleteRegistration,
    
    // Utilitários
    generate7DigitCode,
    generateUniquePlayerCode,
    isCodeUnique
};

console.log('🔥 Supabase configurado e pronto para uso!');

// 6. VERIFICAÇÃO AUTOMÁTICA AO CARREGAR
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar URL parameters para confirmação de email
    const urlParams = new URLSearchParams(window.location.search);
    const confirmed = urlParams.get('confirmed');
    const code = urlParams.get('code');
    
    if (confirmed === 'true') {
        console.log('📧 Email confirmado via URL');
        
        // Tentar completar o registro
        setTimeout(async () => {
            const result = await checkAndCompleteRegistration();
            if (result.success) {
                console.log('✅ Registro completado:', result.playerCode);
                
                // Mostrar modal de sucesso
                if (window.showEmailConfirmedModal) {
                    window.showEmailConfirmedModal(result.playerCode);
                }
            }
        }, 1500);
    }
});