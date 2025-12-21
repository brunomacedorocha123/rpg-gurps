// ============================================
// AUTH.JS - SISTEMA COMPLETO DE AUTENTICAÇÃO
// ============================================

// 1. CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = 'https://mdyohqtvswunkhefbrkr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1keW9ocXR2c3d1bmtoZWZicmtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyODA4NzYsImV4cCI6MjA4MTg1Njg3Nn0.bfc4sh8kDNhAXf9b1eRAlDuB0lGTfQIWNl6Sju1LViE';

// Cria o cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. FUNÇÃO PARA GERAR ID DE 7 DÍGITOS
function gerarId7Digitos() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
}

// 3. FUNÇÃO DE CADASTRO
async function cadastrarUsuario(email, senha, nome) {
    try {
        console.log('📝 Iniciando cadastro para:', email);
        
        // Gera o ID de 7 dígitos
        const userId7digitos = gerarId7Digitos();
        console.log('🔢 ID gerado:', userId7digitos);
        
        // Faz o cadastro no Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    nome: nome,
                    user_id_7digitos: userId7digitos,
                    data_cadastro: new Date().toISOString()
                }
            }
        });

        if (error) {
            console.error('❌ Erro no cadastro:', error.message);
            throw new Error(error.message);
        }

        console.log('✅ Usuário criado no Supabase:', data.user?.id);

        // Se o usuário foi criado, cria o perfil na tabela
        if (data.user) {
            // Tenta criar na tabela 'usuarios' (ou 'profiles')
            const { error: dbError } = await supabase
                .from('usuarios')
                .insert([{
                    id: data.user.id,
                    email: email,
                    nome: nome,
                    user_id_7digitos: userId7digitos,
                    verificado: false,
                    criado_em: new Date().toISOString()
                }]);

            if (dbError) {
                console.warn('⚠️ Não conseguiu salvar na tabela (pode não existir ainda):', dbError.message);
                // Não falha o cadastro por isso
            }
        }

        return {
            sucesso: true,
            mensagem: '✅ Cadastro realizado! Verifique seu e-mail para confirmar a conta.',
            id7digitos: userId7digitos,
            usuario: data.user
        };

    } catch (error) {
        console.error('💥 Erro completo no cadastro:', error);
        return {
            sucesso: false,
            mensagem: '❌ Erro: ' + error.message
        };
    }
}

// 4. FUNÇÃO DE LOGIN
async function fazerLogin(email, senha) {
    try {
        console.log('🔐 Tentando login:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            console.error('❌ Erro no login:', error.message);
            throw new Error(error.message);
        }

        // Verifica se o e-mail foi confirmado
        if (!data.user.email_confirmed_at) {
            console.warn('⚠️ E-mail não verificado');
            return {
                sucesso: false,
                mensagem: '❌ E-mail não verificado! Confirme seu e-mail antes de fazer login.'
            };
        }

        console.log('✅ Login bem-sucedido:', data.user.id);
        
        // Busca o ID de 7 dígitos do usuário
        let id7digitos = data.user.user_metadata?.user_id_7digitos;
        
        // Se não tiver no metadata, busca na tabela
        if (!id7digitos) {
            const { data: usuarioData } = await supabase
                .from('usuarios')
                .select('user_id_7digitos')
                .eq('id', data.user.id)
                .single();
            
            if (usuarioData) {
                id7digitos = usuarioData.user_id_7digitos;
            } else {
                // Se não encontrar, gera um novo
                id7digitos = gerarId7Digitos();
                
                // Salva na tabela
                await supabase
                    .from('usuarios')
                    .insert([{
                        id: data.user.id,
                        email: email,
                        user_id_7digitos: id7digitos,
                        criado_em: new Date().toISOString()
                    }]);
            }
        }

        return {
            sucesso: true,
            mensagem: '✅ Login realizado com sucesso!',
            usuario: data.user,
            id7digitos: id7digitos,
            sessao: data.session
        };

    } catch (error) {
        console.error('💥 Erro no login:', error);
        return {
            sucesso: false,
            mensagem: '❌ Erro: ' + error.message
        };
    }
}

// 5. VERIFICA SE O USUÁRIO ESTÁ LOGADO
async function verificarUsuarioLogado() {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
            console.log('👤 Nenhum usuário logado');
            return null;
        }

        console.log('👤 Usuário logado:', data.session.user.id);
        
        // Busca o ID de 7 dígitos
        let id7digitos = data.session.user.user_metadata?.user_id_7digitos;
        
        // Busca na tabela se não tiver
        if (!id7digitos) {
            const { data: usuarioData } = await supabase
                .from('usuarios')
                .select('user_id_7digitos, nome')
                .eq('id', data.session.user.id)
                .single();
            
            if (usuarioData) {
                id7digitos = usuarioData.user_id_7digitos;
            }
        }

        return {
            usuario: data.session.user,
            sessao: data.session,
            id7digitos: id7digitos || 'Não encontrado'
        };

    } catch (error) {
        console.error('💥 Erro ao verificar sessão:', error);
        return null;
    }
}

// 6. FUNÇÃO DE LOGOUT
async function fazerLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('❌ Erro no logout:', error.message);
            return {
                sucesso: false,
                mensagem: '❌ Erro ao sair: ' + error.message
            };
        }

        console.log('👋 Logout realizado');
        return {
            sucesso: true,
            mensagem: '✅ Saiu com sucesso!'
        };

    } catch (error) {
        console.error('💥 Erro no logout:', error);
        return {
            sucesso: false,
            mensagem: '❌ Erro: ' + error.message
        };
    }
}

// 7. FUNÇÃO PARA TESTE RÁPIDO
async function testeRapido() {
    console.log('🧪 Iniciando teste rápido...');
    
    const emailTeste = `teste${Date.now()}@gurps.com`;
    const senhaTeste = '123456';
    const nomeTeste = 'Aventureiro Teste';
    
    // 1. Cadastra
    const resultadoCadastro = await cadastrarUsuario(emailTeste, senhaTeste, nomeTeste);
    
    if (!resultadoCadastro.sucesso) {
        console.error('❌ Teste de cadastro falhou:', resultadoCadastro.mensagem);
        return resultadoCadastro;
    }
    
    console.log('✅ Cadastro teste OK');
    console.log('📧 Email:', emailTeste);
    console.log('🔑 Senha:', senhaTeste);
    console.log('🔢 ID:', resultadoCadastro.id7digitos);
    
    // 2. Faz login (para usuários já verificados)
    setTimeout(async () => {
        const resultadoLogin = await fazerLogin(emailTeste, senhaTeste);
        console.log('🔐 Resultado login:', resultadoLogin.mensagem);
    }, 1000);
    
    return resultadoCadastro;
}

// 8. CRIA A TABELA NO SUPABASE (se não existir)
async function criarTabelaSeNecessario() {
    try {
        // Tenta buscar da tabela para ver se existe
        const { error } = await supabase
            .from('usuarios')
            .select('id')
            .limit(1);
        
        if (error && error.code === '42P01') { // Tabela não existe
            console.log('📋 Tabela não existe. Você precisa criar no Supabase:');
            console.log(`
                Vá no Supabase -> SQL Editor e execute:
                
                CREATE TABLE usuarios (
                    id UUID REFERENCES auth.users(id) PRIMARY KEY,
                    email TEXT NOT NULL,
                    nome TEXT,
                    user_id_7digitos VARCHAR(7) UNIQUE,
                    verificado BOOLEAN DEFAULT FALSE,
                    criado_em TIMESTAMP DEFAULT NOW()
                );
            `);
        } else {
            console.log('✅ Tabela existe ou erro diferente:', error?.message || 'OK');
        }
    } catch (error) {
        console.log('ℹ️ Não foi possível verificar tabela:', error.message);
    }
}

// 9. INICIALIZAÇÃO
async function inicializarAuth() {
    console.log('🚀 Inicializando sistema de autenticação...');
    
    // Verifica se Supabase está carregado
    if (!window.supabase) {
        console.error('❌ Supabase não carregado!');
        return false;
    }
    
    console.log('✅ Supabase carregado');
    
    // Verifica tabela
    await criarTabelaSeNecessario();
    
    // Verifica se já está logado
    const usuario = await verificarUsuarioLogado();
    
    if (usuario) {
        console.log('👤 Já logado como:', usuario.usuario.email);
        console.log('🔢 ID do usuário:', usuario.id7digitos);
    }
    
    return true;
}

// 10. EXPORTA TUDO PARA USO GLOBAL
window.AuthSistema = {
    // Funções principais
    cadastrar: cadastrarUsuario,
    login: fazerLogin,
    logout: fazerLogout,
    verificarSessao: verificarUsuarioLogado,
    
    // Utilitários
    gerarId: gerarId7Digitos,
    teste: testeRapido,
    inicializar: inicializarAuth,
    
    // Cliente Supabase (se precisar acessar direto)
    supabase: supabase
};

// Auto-inicializa quando o script carrega
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        inicializarAuth();
        console.log('✅ Sistema Auth carregado! Use window.AuthSistema');
    }, 500);
});

console.log('✅ auth.js carregado com sucesso!');