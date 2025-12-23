// caracteristicas-aparencia.js - CÓDIGO 100% FUNCIONAL
console.log('🎮 SISTEMA DE APARÊNCIA INICIADO');

// NÃO espera o DOMContentLoaded - executa IMEDIATAMENTE
function iniciarSistemaAparencia() {
    console.log('⚙️ Configurando aparência física...');
    
    // 1. Elementos CRÍTICOS
    const select = document.getElementById('nivelAparencia');
    const badge = document.getElementById('pontosAparencia');
    const display = document.getElementById('displayAparencia');
    
    if (!select) {
        console.error('❌ ERRO CRÍTICO: select "nivelAparencia" NÃO encontrado!');
        console.log('📌 Procurando elementos com esse ID:', document.querySelectorAll('[id*="aparencia"]'));
        return;
    }
    
    console.log('✅ Elementos encontrados:');
    console.log('   - Select:', select);
    console.log('   - Badge:', badge);
    console.log('   - Display:', display);
    console.log('   - Valor atual do select:', select.value);
    
    // 2. DADOS DAS APARÊNCIAS
    const aparicoes = {
        "-24": { nome: "Horrendo", reacao: "-6", desc: "Aparência que causa repulsa imediata." },
        "-20": { nome: "Monstruoso", reacao: "-5", desc: "Aparência claramente não humana." },
        "-16": { nome: "Hediondo", reacao: "-4", desc: "Extremamente feio e desagradável." },
        "-8": { nome: "Feio", reacao: "-2", desc: "Claramente abaixo da média." },
        "-4": { nome: "Sem Atrativos", reacao: "-1", desc: "Abaixo da média, mas não chocante." },
        "0": { nome: "Comum", reacao: "+0", desc: "Aparência padrão, sem modificadores." },
        "4": { nome: "Atraente", reacao: "+1", desc: "Acima da média. Chama atenção positiva." },
        "12": { nome: "Elegante", reacao: "+2", desc: "Muito bonito(a). Destaque social." },
        "16": { nome: "Muito Elegante", reacao: "+4", desc: "Excepcionalmente bonito(a)." },
        "20": { nome: "Lindo", reacao: "+6", desc: "Beleza deslumbrante. Impacto visual." }
    };
    
    // 3. FUNÇÃO para ATUALIZAR TUDO
    function atualizarTudo(valor) {
        console.log(`🔄 Atualizando aparência para valor: ${valor}`);
        
        const pontos = parseInt(valor);
        const dados = aparicoes[valor];
        
        if (!dados) {
            console.error(`❌ Dados não encontrados para valor: ${valor}`);
            return;
        }
        
        // A. Atualizar BADGE de pontos
        if (badge) {
            badge.textContent = `${pontos > 0 ? '+' : ''}${pontos} pts`;
            
            // Cores dinâmicas
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
            
            console.log(`✅ Badge atualizado: ${badge.textContent}`);
        }
        
        // B. Atualizar DISPLAY
        if (display) {
            display.innerHTML = `
                <div class="display-header">
                    <i class="fas ${pontos >= 12 ? 'fa-crown' : pontos > 0 ? 'fa-user-tie' : pontos < 0 ? 'fa-user-injured' : 'fa-user'}"></i>
                    <div>
                        <strong>${dados.nome}</strong>
                        <small>Reação: ${dados.reacao}</small>
                    </div>
                </div>
                <p class="display-desc">${dados.desc}</p>
                <div class="display-details">
                    <small><i class="fas fa-star"></i> ${pontos > 0 ? 'VANTAGEM' : pontos < 0 ? 'DESVANTAGEM' : 'NEUTRO'}</small>
                </div>
            `;
            
            console.log(`✅ Display atualizado para: ${dados.nome}`);
        }
        
        // C. Disparar EVENTO para outros sistemas
        try {
            const evento = new CustomEvent('aparencia-alterada', { 
                detail: { 
                    pontos: pontos,
                    nivel: dados.nome,
                    reacao: dados.reacao 
                } 
            });
            document.dispatchEvent(evento);
            console.log('📢 Evento disparado para outros sistemas');
        } catch (e) {
            console.warn('⚠️ Não foi possível disparar evento:', e);
        }
        
        console.log('🎉 Atualização COMPLETA!');
    }
    
    // 4. CONFIGURAR EVENTO no select
    select.addEventListener('change', function(e) {
        console.log('🎯 EVENTO CHANGE DETECTADO!');
        console.log('   Valor selecionado:', this.value);
        console.log('   Texto:', this.options[this.selectedIndex].text);
        
        atualizarTudo(this.value);
    });
    
    // 5. ATUALIZAR estado inicial
    console.log('🔄 Atualizando estado inicial...');
    atualizarTudo(select.value);
    
    console.log('✅ Sistema de aparência CONFIGURADO com SUCESSO!');
    console.log('👉 Experimente mudar o select para ver em ação');
}

// EXECUTAR IMEDIATAMENTE
iniciarSistemaAparencia();

// Fallback: também executar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarSistemaAparencia);
}