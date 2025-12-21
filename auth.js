// auth.js - ÚNICO arquivo JS que você precisa

// Configuração do Supabase
const SUPABASE_URL = 'https://sjajziurzcywpzpxbxap.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqYWp6aXVyemN5d3B6cHhieGFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYyNzYxNTksImV4cCI6MjA4MTg1MjE1OX0.OJwH1r7nNQ5Zas77oxdxkqFmZ1BkjTpoNhOrLAVZqQQ';

// Criar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('Supabase configurado:', SUPABASE_URL);

// Função para gerar ID de 7 dígitos
function gerarIDUsuario() {
    const min = 1000000;
    const max = 9999999;
    const id = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log('ID gerado:', id);
    return id.toString();
}

// Função para mostrar mensagens
function mostrarMensagem(elementoId, texto, tipo = 'info') {
    const elemento = document.getElementById(elementoId);
    if (!elemento) {
        console.error('Elemento não encontrado:', elementoId);
        return;
    }
    
    elemento.textContent = texto;
    elemento.className = `message ${tipo}`;
    elemento.style.display = 'block';
    
    // Auto-esconder
    setTimeout(() => {
        elemento.style.display = 'none';
    }, 5000);
}

// Função para registrar usuário
async function registrarUsuario(nome, email, senha) {
    try {
        console.log('Registrando usuário:', { nome, email });
        
        // Gerar ID único
        const userId = gerarIDUsuario();
        
        // Registrar no Supabase
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: {
                    nome: nome,
                    user_id: userId,
                    data_cadastro: new Date().toISOString()
                },
                emailRedirectTo: window.location.origin + '/login.html'
            }
        });

        if (error) {
            console.error('Erro no registro:', error);
            throw error;
        }

        console.log('Registro bem-sucedido:', data);
        return { success: true, userId: userId, data: data };

    } catch (error) {
        console.error('Erro completo:', error);
        return { success: false, error: error.message };
    }
}

// Função para fazer login
async function fazerLogin(email, senha) {
    try {
        console.log('Fazendo login com:', email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            console.error('Erro no login:', error);
            throw error;
        }

        console.log('Login bem-sucedido:', data);
        return { success: true, data: data };

    } catch (error) {
        console.error('Erro completo:', error);
        return { success: false, error: error.message };
    }
}

// Função para verificar sessão
async function verificarSessao() {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Erro na sessão:', error);
            return { autenticado: false };
        }
        
        if (!data.session) {
            return { autenticado: false };
        }
        
        return { 
            autenticado: true, 
            usuario: data.session.user 
        };
        
    } catch (error) {
        console.error('Erro:', error);
        return { autenticado: false };
    }
}

// Função para logout
async function fazerLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Erro no logout:', error);
        return { success: false, error: error.message };
    }
}

// Testar conexão
async function testarConexao() {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        console.log('✅ Conexão com Supabase OK!');
        return true;
    } catch (error) {
        console.error('❌ Falha na conexão:', error);
        return false;
    }
}

// Exportar funções para uso global
window.Auth = {
    supabase: supabase,
    registrarUsuario,
    fazerLogin,
    verificarSessao,
    fazerLogout,
    gerarIDUsuario,
    mostrarMensagem,
    testarConexao
};

// Testar conexão ao carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth.js carregado com sucesso!');
    testarConexao();
});