// supabase.js - VERSÃO COMPLETA E DEFINITIVA
const SUPABASE_URL = 'https://czysizvvnzxwsxqheogx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6eXNpenZ2bnp4d3N4cWhlb2d4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNjQ5NjcsImV4cCI6MjA4MTg0MDk2N30.SdT-vsY-XSNwxRTxKHQD-zpeojgQSOFdhSSLet8cpyo';

// Verificar se biblioteca carregou
if (typeof supabase === 'undefined') {
    console.error('ERRO: Biblioteca Supabase não carregada');
    throw new Error('Biblioteca Supabase não está disponível');
}

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==================== FUNÇÕES AUXILIARES ====================

/**
 * Gera um código de jogador de 7 dígitos
 * @returns {string} Código de 7 dígitos
 */
function generatePlayerCode() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

/**
 * Verifica se um código de jogador já existe no banco
 * @param {string} code - Código a verificar
 * @returns {Promise<boolean>} True se for único
 */
async function isPlayerCodeUnique(code) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('player_code')
            .eq('player_code', code)
            .single();
        
        // Se não encontrou dados, o código é único
        return !data;
    } catch (error) {
        // Se erro é "nenhuma linha retornada", código é único
        return true;
    }
}

/**
 * Gera um código de jogador único
 * @returns {Promise<string>} Código único de 7 dígitos
 */
async function generateUniquePlayerCode() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const code = generatePlayerCode();
        const isUnique = await isPlayerCodeUnique(code);
        
        if (isUnique) {
            return code;
        }
        
        attempts++;
    }
    
    // Fallback: usa timestamp
    return Date.now().toString().slice(-7);
}

/**
 * Cria perfil do usuário na tabela profiles
 * @param {string} userId - ID do usuário do Auth
 * @param {string} fullName - Nome completo do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
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
        
        if (error) {
            throw new Error(`Erro ao criar perfil: ${error.message}`);
        }
        
        return {
            success: true,
            playerCode: playerCode,
            profile: data[0]
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ==================== FUNÇÕES PRINCIPAIS ====================

/**
 * Registra um novo usuário no sistema
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @param {string} fullName - Nome completo do usuário
 * @returns {Promise<Object>} Resultado do registro
 */
async function registerUser(email, password, fullName) {
    try {
        const baseUrl = window.location.origin;
        
        // Registrar no Supabase Auth
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
            throw new Error(`Erro no cadastro: ${authError.message}`);
        }
        
        // Se usuário foi criado, criar perfil
        if (authData.user) {
            const profileResult = await createUserProfile(authData.user.id, fullName);
            
            if (!profileResult.success) {
                throw new Error(profileResult.error);
            }
            
            return {
                success: true,
                message: 'Cadastro realizado com sucesso! Verifique seu email para confirmar.',
                user: authData.user,
                playerCode: profileResult.playerCode,
                requiresConfirmation: true
            };
        }
        
        // Email de confirmação enviado
        return {
            success: true,
            message: 'Email de confirmação enviado! Verifique sua caixa de entrada.',
            requiresConfirmation: true
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Faz login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} Resultado do login
 */
async function loginUser(email, password) {
    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) {
            throw new Error(error.message);
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
        // Obter usuário atual
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        
        if (userError || !user) {
            throw new Error('Usuário não autenticado');
        }
        
        // Buscar perfil
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (profileError) {
            throw new Error('Perfil não encontrado');
        }
        
        return {
            success: true,
            profile: profile,
            user: user
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Verifica se o usuário está autenticado
 * @returns {Promise<Object>} Status da autenticação
 */
async function checkAuth() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        return {
            isAuthenticated: !!user && !error,
            user: user,
            error: error
        };
    } catch (error) {
        return {
            isAuthenticated: false,
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
        
        return {
            success: !error,
            error: error
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Envia email para redefinir senha
 * @param {string} email - Email do usuário
 * @returns {Promise<Object>} Resultado da operação
 */
async function resetPassword(email) {
    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });
        
        return {
            success: !error,
            error: error
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Atualiza perfil do usuário
 * @param {Object} updates - Dados para atualizar
 * @returns {Promise<Object>} Resultado da atualização
 */
async function updateUserProfile(updates) {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            throw new Error('Usuário não autenticado');
        }
        
        const { data, error } = await supabaseClient
            .from('profiles')
            .update(updates)
            .eq('user_id', user.id)
            .select();
        
        if (error) {
            throw new Error(error.message);
        }
        
        return {
            success: true,
            profile: data[0]
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// ==================== EXPORTAÇÃO ====================

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
    updateUserProfile,
    createUserProfile,
    
    // Utilitários
    generatePlayerCode,
    generateUniquePlayerCode,
    isPlayerCodeUnique
};

// Inicialização completa
console.log('Supabase configurado com sucesso');