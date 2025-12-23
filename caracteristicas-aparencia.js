// caracteristicas-aparencia.js - VERSÃO CORRIGIDA (NaN FIX)
console.log('🎯 SISTEMA DE APARÊNCIA - INICIANDO');

// Dados fixos - garantindo que são strings como chaves
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
        return;
    }
    
    console.log('✅ Select encontrado, valor:', select.value);
    console.log('Tipo do valor:', typeof select.value);
    
    // Função principal CORRIGIDA
    function atualizarAparencia() {
        const valor = select.value;
        console.log('📊 Valor do select:', valor, 'Tipo:', typeof valor);
        
        // CONVERSÃO SEGURA para número
        let pontos = 0;
        if (valor !== null && valor !== undefined && valor !== '') {
            pontos = parseInt(valor, 10);
            if (isNaN(pontos)) {
                console.warn('⚠️ Valor não é número, usando 0:', valor);
                pontos = 0;
            }
        }
        
        console.log('📊 Pontos calculados:', pontos);
        
        // Buscar dados - usando string como chave
        const dados = APARENCIA_DADOS[valor] || APARENCIA_DADOS["0"];
        console.log('📊 Dados encontrados:', dados.nome);
        
        // 1. ATUALIZAR BADGE (CORRIGIDO)
        if (badge) {
            // Formatação segura
            let textoPontos = '';
            if (!isNaN(pontos)) {
                textoPontos = pontos + ' pts';
                if (pontos > 0) textoPontos = '+' + textoPontos;
            } else {
                textoPontos = '0 pts';
            }
            
            badge.textContent = textoPontos;
            console.log('✅ Badge atualizado:', textoPontos);
            
            // Cor baseada no valor
            badge.style.cssText = ''; // Limpar estilos
            
            if (pontos > 0) {
                badge.style.background = 'linear-gradient(145deg, rgba(39, 174, 96, 0.2), rgba(39, 174, 96, 0.3))';
                badge.style.borderColor = '#27ae60';
                badge.style.color = '#27ae60';
            } else if (pontos < 0) {
                badge.style.background = 'linear-gradient(145deg, rgba(231, 76, 60, 0.2), rgba(231, 76, 60, 0.3))';
                badge.style.borderColor = '#e74c3c';
                badge.style.color = '#e74c3c';
            } else {
                badge.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.3))';
                badge.style.borderColor = '#d4af37';
                badge.style.color = '#d4af37';
            }
            
            // Estilos fixos
            badge.style.padding = '4px 12px';
            badge.style.borderRadius = '20px';
            badge.style.fontWeight = 'bold';
            badge.style.display = 'inline-block';
            badge.style.border = '1px solid';
        }
        
        // 2. ATUALIZAR DISPLAY
        if (display) {
            // Ícone baseado nos pontos
            let icone = 'fa-user';
            if (pontos > 0) icone = 'fa-user-tie';
            if (pontos < 0) icone = 'fa-user-injured';
            
            display.innerHTML = `
                <div class="display-header">
                    <i class="fas ${icone}"></i>
                    <div>
                        <strong>${dados.nome}</strong>
                        <small>Reação: ${dados.reacao}</small>
                    </div>
                </div>
                <p class="display-desc">${dados.desc}</p>
            `;
            console.log('✅ Display atualizado para:', dados.nome);
        }
        
        // 3. SALVAR
        try {
            localStorage.setItem('gurps_aparencia', valor);
            console.log('💾 Salvo no localStorage:', valor);
        } catch (e) {
            console.warn('Não salvou no localStorage:', e);
        }
    }
    
    // Configurar evento
    select.addEventListener('change', atualizarAparencia);
    
    // Carregar valor salvo
    try {
        const salvo = localStorage.getItem('gurps_aparencia');
        if (salvo !== null && APARENCIA_DADOS[salvo]) {
            select.value = salvo;
            console.log('💾 Valor carregado do localStorage:', salvo);
        }
    } catch (e) {
        console.warn('Não carregou do localStorage:', e);
    }
    
    // Atualizar inicialmente
    setTimeout(() => {
        atualizarAparencia();
        console.log('✅ Sistema pronto!');
    }, 100);
    
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

// DEBUG NO CONSOLE - Para testar manualmente
console.log('📝 Comandos disponíveis:');
console.log('1. debugAparencia.testar("4")  // Testar "Atraente"');
console.log('2. debugAparencia.testar("12") // Testar "Elegante"');
console.log('3. debugAparencia.atualizar()  // Forçar atualização');