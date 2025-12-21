// supabase.js - VERSÃO COMPLETA E FUNCIONAL
// Coloque isso em um arquivo chamado supabase.js

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
        storage: localStorage
    }
});

console.log('✅ Supabase inicializado com sucesso');

// 3. FUNÇÕES AUXILIARES

/**
 * Gera um código de 7 dígitos
 * @returns {string} Código de 7 dígitos
 */
function generatePlayerCode() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

/**
 * Verifica se um código já existe no banco
 * @param {string} code - Código a verificar
 * @returns {Promise<boolean>} True se for único
 */
async function isPlayerCodeUnique(code) {
    try {
        const { data, error } = await supabaseClient
            .from('profiles')
            .select('player_code')
            .eq('player_code', code)
            .maybeSingle();
        
        if (error) {
            console.warn('⚠️ Erro ao verificar código:', error.message);
            return true; // Assume único se houver erro
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
    const maxAttempts = 5;
    
    while (attempts < maxAttempts) {
        const code = generatePlayerCode();
        const isUnique = await isPlayerCodeUnique(code);
        
        if (isUnique) {
            console.log(`✅ Código único gerado: ${code}`);
            return code;
        }
        
        attempts++;
        console.log(`🔄 Tentativa ${attempts}: código ${code} já existe`);
    }
    
    // Fallback: timestamp
    const fallbackCode = Date.now().toString().slice(-7);
    console.log(`⚠️ Usando fallback: ${fallbackCode}`);
    return fallbackCode;
}

// 4. FUNÇÕES PRINCIPAIS

/**
 * Registra um novo usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha
 * @param {string} fullName - Nome completo
 * @returns {Promise<Object>} Resultado do registro
 */
async function registerUser(email, password, fullName) {
    try {
        console.log('🔄 Iniciando registro para:', email);
        
        // 1. Registrar no Auth do Supabase
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: `${window.location.origin}/cadastro.html?confirmed=true`
            }
        });

        if (authError) {
            console.error('❌ Erro no Auth:', authError);
            throw new Error(authError.message);
        }

        console.log('✅ Usuário criado no Auth, ID:', authData.user?.id);
        
        // 2. Gerar código único
        const playerCode = await generateUniquePlayerCode();
        console.log('🎯 Código gerado:', playerCode);
        
        // 3. Criar perfil do usuário
        if (authData.user?.id) {
            const { error: profileError } = await supabaseClient
                .from('profiles')
                .insert({
                    user_id: authData.user.id,
                    player_code: playerCode,
                    full_name: fullName
                });

            if (profileError) {
                console.error('❌ Erro ao criar perfil:', profileError);
                
                // Tentar sem user_id (algumas políticas permitem)
                const { error: fallbackError } = await supabaseClient
                    .from('profiles')
                    .insert({
                        player_code: playerCode,
                        full_name: fullName
                    });
                    
                if (fallbackError) {
                    console.warn('⚠️ Não foi possível criar perfil automaticamente');
                    console.warn('O perfil precisará ser criado manualmente após confirmação do email');
                }
            } else {
                console.log('✅ Perfil criado com sucesso');
            }
        } else {
            console.warn('⚠️ Usuário criado mas sem ID disponível');
        }

        return {
            success: true,
            message: 'Cadastro realizado! Verifique seu email para confirmar.',
            requiresConfirmation: true,
            playerCode: playerCode
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
        
        if (error) throw error;
        
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
 * Verifica se o usuário está autenticado
 * @returns {Promise<Object>} Status da autenticação
 */
async function checkAuth() {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        
        return {
            isAuthenticated: !!user && !error,
            user: user,
            error: error?.message
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
            error: error?.message
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
            error: error?.message
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Atualiza o perfil do usuário
 * @param {Object} updates - Campos para atualizar
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
        
        if (error) throw error;
        
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

// 5. EXPORTAR PARA USO GLOBAL
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
    
    // Utilitários
    generatePlayerCode,
    generateUniquePlayerCode,
    isPlayerCodeUnique
};

console.log('🔥 Supabase configurado e pronto para uso!');