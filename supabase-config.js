// supabase-config.js - Salve este arquivo separadamente
const SUPABASE_URL = 'https://seu-projeto.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-publica';

// Criar cliente Supabase globalmente
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função para gerar ID de 7 dígitos
window.generateUserId = function() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// Função para mostrar alertas
window.showAlert = function(elementId, message, type = 'error') {
    const alertElement = document.getElementById(elementId);
    alertElement.textContent = message;
    alertElement.className = `alert alert-${type}`;
    alertElement.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 3000);
    }
};

// Função para limpar alerta
window.clearAlert = function(elementId) {
    const alertElement = document.getElementById(elementId);
    alertElement.style.display = 'none';
};