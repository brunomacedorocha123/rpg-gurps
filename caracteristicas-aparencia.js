// caracteristicas-aparencia.js - VERSÃO SIMPLES E FUNCIONAL
console.log('🎯 SISTEMA DE APARÊNCIA - INICIANDO');

// Executar quando a aba for carregada
function initAparencia() {
    console.log('🔧 Configurando aparência...');
    
    // 1. Elementos CRÍTICOS
    const select = document.getElementById('nivelAparencia');
    const badge = document.getElementById('pontosAparencia');
    const display = document.getElementById('displayAparencia');
    
    if (!select) {
        console.error('❌ ERRO: Select não encontrado!');
        // Procure manualmente no console: document.querySelector('select')
        return;
    }
    
    console.log('✅ Elementos encontrados!');
    console.log('- Select valor:', select.value);
    console.log('- Badge:', badge ? 'OK' : 'Não');
    console.log('- Display:', display ? 'OK' : 'Não');
    
    // 2. Função para ATUALIZAR TUDO
    function atualizarTudo() {
        const valor = select.value;
        const pontos = parseInt(valor);
        
        console.log(`🔄 Atualizando: valor=${valor}, pontos=${pontos}`);
        
        // A. Atualizar BADGE (MAIS IMPORTANTE!)
        if (badge) {
            // Formatar texto
            let textoPontos = pontos + ' pts';
            if (pontos > 0) textoPontos = '+' + textoPontos;
            
            badge.textContent = textoPontos;
            console.log('✅ Badge atualizado:', badge.textContent);
            
            // Cor dinâmica
            if (pontos > 0) {
                badge.style.backgroundColor = 'rgba(39, 174, 96, 0.2)';
                badge.style.borderColor = '#27ae60';
                badge.style.color = '#27ae60';
            } else if (pontos < 0) {
                badge.style.backgroundColor = 'rgba(231, 76, 60, 0.2)';
                badge.style.borderColor = '#e74c3c';
                badge.style.color = '#e74c3c';
            } else {
                badge.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
                badge.style.borderColor = '#d4af37';
                badge.style.color = '#d4af37';
            }
        }
        
        // B. Atualizar DISPLAY
        if (display) {
            // Dados baseados no valor
            const dados = {
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
            }[valor] || { nome: "Comum", reacao: "+0", desc: "Aparência padrão." };
            
            // Criar HTML
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
            
            console.log('✅ Display atualizado:', dados.nome);
        }
        
        // C. Salvar no LocalStorage
        try {
            localStorage.setItem('aparencia', valor);
            console.log('💾 Salvo no localStorage');
        } catch (e) {
            console.warn('⚠️ Não salvou no localStorage:', e);
        }
    }
    
    // 3. CONFIGURAR EVENTO (MÉTODO DIRETO)
    select.onchange = function() {
        console.log('🎯 EVENTO ONCHANGE DISPARADO!');
        console.log('Valor selecionado:', this.value);
        atualizarTudo();
    };
    
    // 4. Atualizar INICIALMENTE
    console.log('🔄 Atualizando estado inicial...');
    atualizarTudo();
    
    console.log('✅ Sistema pronto! Tente mudar o select.');
    
    // 5. EXPORTAR para debug
    window.debugAparencia = {
        atualizar: atualizarTudo,
        getValor: () => select.value,
        testar: (valor) => {
            select.value = valor;
            atualizarTudo();
        }
    };
}

// Executar IMEDIATAMENTE e quando DOM carregar
try {
    initAparencia();
} catch (e) {
    console.error('Erro inicial:', e);
    document.addEventListener('DOMContentLoaded', initAparencia);
}