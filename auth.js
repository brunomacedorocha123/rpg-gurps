// Função para gerar ID único de 7 dígitos
function gerarIdUnico() {
    // Gera número aleatório de 7 dígitos (entre 1000000 e 9999999)
    const id = Math.floor(1000000 + Math.random() * 9000000);
    return id.toString();
}

// CADASTRO DE USUÁRIO
async function cadastrarUsuario(email, senha, username) {
    try {
        // 1. Cadastra no Supabase (envia e-mail de verificação)
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    username: username,
                    user_id: gerarIdUnico(), // Gera ID único
                    created_at: new Date().toISOString()
                }
            }
        });

        if (error) throw error;

        // 2. Salva dados adicionais na tabela 'profiles'
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email: email,
                        username: username,
                        user_code: data.user.user_metadata.user_id, // ID de 7 dígitos
                        verified: false,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (profileError) {
                console.error('Erro ao criar perfil:', profileError);
            }
        }

        return { success: true, message: 'Cadastro realizado! Verifique seu e-mail.' };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// LOGIN DE USUÁRIO
async function loginUsuario(email, senha) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) throw error;

        // Verifica se o e-mail foi confirmado
        if (!data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            return { 
                success: false, 
                message: 'E-mail não verificado! Verifique sua caixa de entrada.' 
            };
        }

        return { success: true, user: data.user };
    } catch (error) {
        return { success: false, message: error.message };
    }
}

// VERIFICA SE USUÁRIO ESTÁ LOGADO
async function verificarSessao() {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
        return null;
    }
    
    // Busca dados do perfil
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.session.user.id)
        .single();
    
    return { session: data.session, profile };
}

// LOGOUT
async function logoutUsuario() {
    await supabase.auth.signOut();
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