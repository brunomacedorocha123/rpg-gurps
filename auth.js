// auth.js - ARQUIVO ATUALIZADO E SIMPLIFICADO

// Função para gerar ID único de 7 dígitos
function gerarIdUnico() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// CADASTRO - FUNÇÃO CORRIGIDA
async function cadastrarUsuario(email, senha, username) {
    try {
        console.log('🔧 Tentando cadastrar:', email);
        
        // Usa window.supabaseClient que foi configurado no supabase-config.js
        if (!window.supabaseClient) {
            throw new Error('Supabase não está configurado!');
        }

        // 1. Cadastra no Auth do Supabase
        const { data, error } = await window.supabaseClient.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    username: username,
                    user_code: gerarIdUnico(),
                    created_at: new Date().toISOString()
                },
                emailRedirectTo: window.location.origin + '/verify.html'
            }
        });

        if (error) {
            console.error('❌ Erro no signUp:', error);
            throw error;
        }

        console.log('✅ Usuário criado:', data.user);

        // 2. Cria o perfil na tabela 'profiles'
        if (data.user) {
            const userCode = gerarIdUnico();
            
            const { error: profileError } = await window.supabaseClient
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: email,
                        username: username,
                        user_code: userCode,
                        verified: false,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (profileError) {
                console.warn('⚠️ Erro ao criar perfil (mas o usuário foi criado):', profileError);
                // Não falha o cadastro por causa disso
            }

            // Atualiza o metadata com o código
            await window.supabaseClient.auth.updateUser({
                data: { user_code: userCode }
            });
        }

        return { 
            success: true, 
            message: '✅ Cadastro realizado! Verifique seu e-mail para ativar a conta.' 
        };
    } catch (error) {
        console.error('❌ Erro completo:', error);
        return { 
            success: false, 
            message: '❌ Erro: ' + error.message 
        };
    }
}

// LOGIN - FUNÇÃO CORRIGIDA
async function loginUsuario(email, senha) {
    try {
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) throw error;

        // Verifica se o e-mail foi confirmado
        if (!data.user.email_confirmed_at) {
            await window.supabaseClient.auth.signOut();
            return { 
                success: false, 
                message: '❌ E-mail não verificado! Verifique sua caixa de entrada.' 
            };
        }

        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, message: '❌ Erro: ' + error.message };
    }
}

// VERIFICA SESSÃO
async function verificarSessao() {
    try {
        const { data, error } = await window.supabaseClient.auth.getSession();
        
        if (error || !data.session) {
            return null;
        }
        
        // Busca dados do perfil
        const { data: profile } = await window.supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();
        
        return { 
            session: data.session, 
            profile: profile || { 
                user_code: data.session.user.user_metadata?.user_code || gerarIdUnico() 
            } 
        };
    } catch (error) {
        return null;
    }
}

// LOGOUT
async function logoutUsuario() {
    await window.supabaseClient.auth.signOut();
    window.location.href = 'index.html';
}

// Exporta as funções
window.authFunctions = {
    cadastrarUsuario,
    loginUsuario,
    verificarSessao,
    logoutUsuario,
    gerarIdUnico
};

console.log('✅ auth.js carregado com sucesso!');