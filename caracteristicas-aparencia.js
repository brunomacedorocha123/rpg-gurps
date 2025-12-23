// caracteristicas-aparencia.js - VERSÃO CORRIGIDA
console.log('🎯 SISTEMA DE APARÊNCIA - INICIANDO');

// Dados fixos
const APARENCIA_DADOS = {
    "-24": { nome: "Horrendo", reacao: "-6", desc: "Aparência que causa repulsa." },
    "-20": { nome: "Monstruoso", reacao: "-5", desc: "Aparência não humana." },
    "-16": { nome: "Hediondo", reacao: "-4", desc: "Extremamente feio." },
    "-8": { nome: "Feio", reacao: "-2", desc: "Abaixo da média." },
    "-4": { nome: "Sem Atrativos", reacao: "-1", desc: "Abaixo da média." },
    "0": { nome: "Comum", reacao: "+0", desc: "Aparência padrão." },
    "4": { nome: "Atraente", reacao: "+1", desc: "Acima da média." },
    "12": { nome: "Elegante", reacao: "+2", desc: "Muito bonito(a)." },
    "16": { nome: "Muito Elegante", reacao: "+4", desc: "Excepcional." },
    "20": { nome: "Lindo", reacao: "+6", desc: "Beleza deslumbrante." }
};

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando sistema de aparência...');
    
    const select = document.getElementById('nivelAparencia');
    const badge = document.getElementById('pontosAparencia');
    const display = document.getElementById('displayAparencia');
    
    // Verificação
    if (!select) {
        console.error('❌ ERRO: Elemento "nivelAparencia" não encontrado!');
        console.log('Elementos disponíveis:', document.querySelectorAll('[id*="aparencia"], select'));
        return;
    }
    
    console.log('✅ Select encontrado:', select);
    console.log('✅ Badge encontrado:', badge);
    console.log('✅ Display encontrado:', display);
    
    // Função principal
    function atualizarAparencia() {
        const valor = select.value;
        const pontos = parseInt(valor);
        const dados = APARENCIA_DADOS[valor] || APARENCIA_DADOS["0"];
        
        console.log(`📊 Atualizando aparência: ${dados.nome} (${pontos} pontos)`);
        
        // 1. ATUALIZAR BADGE
        if (badge) {
            let texto = pontos + ' pts';
            if (pontos > 0) texto = '+' + texto;
            badge.textContent = texto;
            
            // Cor baseada no valor
            if (pontos > 0) {
                badge.style.background = 'linear-gradient(145deg, rgba(39, 174, 96, 0.2), rgba(39, 174, 96, 0.3))';
                badge.style.borderColor = '#27ae60';
                badge.style.color = '#27ae60';
            } else if (pontos < 0) {
                badge.style.background = 'linear-gradient(145deg, rgba(231, 76, 60, 0.2), rgba(231, 76, 60, 0.3))';
                badge.style.borderColor = '#e74c3c';
                badge.style.color = '#e74c3c';
            }
        }
        
        // 2. ATUALIZAR DISPLAY
        if (display) {
            display.innerHTML = `
                <div class="display-header">
                    <i class="fas fa-user${pontos > 0 ? '-tie' : pontos < 0 ? '-injured' : ''}"></i>
                    <div>
                        <strong>${dados.nome}</strong>
                        <small>Reação: ${dados.reacao}</small>
                    </div>
                </div>
                <p class="display-desc">${dados.desc}</p>
            `;
        }
        
        // 3. SALVAR
        try {
            localStorage.setItem('gurps_aparencia', valor);
        } catch (e) {
            console.warn('Não salvou no localStorage:', e);
        }
    }
    
    // Configurar evento
    select.addEventListener('change', atualizarAparencia);
    
    // Carregar valor salvo
    try {
        const salvo = localStorage.getItem('gurps_aparencia');
        if (salvo && APARENCIA_DADOS[salvo]) {
            select.value = salvo;
            console.log('💾 Valor carregado:', salvo);
        }
    } catch (e) {
        console.warn('Não carregou do localStorage:', e);
    }
    
    // Atualizar inicialmente
    atualizarAparencia();
    
    console.log('✅ Sistema pronto! Teste mudando o select.');
    
    // Expor para debug
    window.debugAparencia = {
        atualizar: atualizarAparencia,
        valorAtual: () => select.value,
        testar: (valor) => {
            if (APARENCIA_DADOS[valor]) {
                select.value = valor;
                atualizarAparencia();
                console.log(`Teste: ${APARENCIA_DADOS[valor].nome}`);
            }
        }
    };
});

// Se já carregado, executar
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!window.debugAparencia) {
            console.log('Forçando inicialização...');
            const event = new Event('DOMContentLoaded');
            document.dispatchEvent(event);
        }
    }, 100);
}