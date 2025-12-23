// caracteristicas-riqueza.js - SUPER SIMPLES E FUNCIONAL
console.log('💰 RIQUEZA - CARREGANDO SCRIPT...');

// Sistema ultra simples
function inicializarRiqueza() {
    console.log('🎯 INICIALIZANDO SISTEMA DE RIQUEZA...');
    
    // 1. PEGAR OS ELEMENTOS PELO ID (garantido que existe pelo HTML)
    const select = document.getElementById('nivelRiqueza');
    const badge = document.getElementById('pontosRiqueza');
    const mult = document.getElementById('multiplicadorRiqueza');
    const renda = document.getElementById('rendaMensal');
    const desc = document.getElementById('descricaoRiqueza');
    
    console.log('✅ Elementos encontrados:', {
        select: select ? 'SIM' : 'NÃO',
        badge: badge ? 'SIM' : 'NÃO',
        mult: mult ? 'SIM' : 'NÃO',
        renda: renda ? 'SIM' : 'NÃO',
        desc: desc ? 'SIM' : 'NÃO'
    });
    
    if (!select) {
        console.error('❌ Select não encontrado!');
        return;
    }
    
    // 2. CONFIGURAÇÕES DOS NÍVEIS
    const niveis = {
        '-25': { nome: 'Falido', mult: '0x', renda: '$0', desc: 'Sem bens, depende da caridade', pontos: '-25' },
        '-15': { nome: 'Pobre', mult: '0.2x', renda: '$200', desc: 'Sempre com dificuldades financeiras', pontos: '-15' },
        '-10': { nome: 'Batalhador', mult: '0.5x', renda: '$500', desc: 'Consegue pagar o básico', pontos: '-10' },
        '0': { nome: 'Médio', mult: '1x', renda: '$1.000', desc: 'Nível de recursos pré-definido padrão', pontos: '0' },
        '10': { nome: 'Confortável', mult: '2x', renda: '$2.000', desc: 'Pode comprar alguns luxos', pontos: '+10' },
        '20': { nome: 'Rico', mult: '5x', renda: '$5.000', desc: 'Tem muito dinheiro', pontos: '+20' },
        '30': { nome: 'Muito Rico', mult: '10x', renda: '$10.000', desc: 'Fortuna significativa', pontos: '+30' },
        '50': { nome: 'Podre de Rico', mult: '20x', renda: '$20.000', desc: 'Uma das pessoas mais ricas do mundo', pontos: '+50' }
    };
    
    // 3. FUNÇÃO PARA ATUALIZAR TUDO
    function atualizarRiqueza() {
        const valor = select.value;
        console.log('🔄 Valor selecionado:', valor);
        
        const nivel = niveis[valor];
        if (!nivel) {
            console.error('❌ Nível não encontrado para valor:', valor);
            return;
        }
        
        console.log('🎯 Nível selecionado:', nivel.nome);
        
        // Atualizar badge de pontos
        if (badge) {
            badge.textContent = nivel.pontos + ' pts';
            
            // Estilo baseado no valor
            const pontosNum = parseInt(nivel.pontos);
            if (pontosNum > 0) {
                badge.style.background = 'linear-gradient(145deg, rgba(46, 125, 50, 0.3), rgba(27, 94, 32, 0.4))';
                badge.style.borderColor = '#2e7d32';
                badge.style.color = '#81c784';
            } else if (pontosNum < 0) {
                badge.style.background = 'linear-gradient(145deg, rgba(183, 28, 28, 0.3), rgba(136, 14, 79, 0.4))';
                badge.style.borderColor = '#b71c1c';
                badge.style.color = '#ef5350';
            } else {
                badge.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.3))';
                badge.style.borderColor = '#d4af37';
                badge.style.color = '#f4d03f';
            }
            
            // Efeito visual
            badge.style.transform = 'scale(1.1)';
            setTimeout(() => {
                badge.style.transform = 'scale(1)';
            }, 200);
            
            console.log('✅ Badge atualizado:', badge.textContent);
        }
        
        // Atualizar multiplicador
        if (mult) {
            mult.textContent = nivel.mult;
            mult.style.color = '#f4d03f';
            setTimeout(() => {
                mult.style.color = '';
            }, 300);
            console.log('✅ Multiplicador atualizado:', nivel.mult);
        }
        
        // Atualizar renda
        if (renda) {
            renda.textContent = nivel.renda;
            renda.style.color = '#f4d03f';
            setTimeout(() => {
                renda.style.color = '';
            }, 300);
            console.log('✅ Renda atualizada:', nivel.renda);
        }
        
        // Atualizar descrição
        if (desc) {
            desc.textContent = nivel.desc;
            console.log('✅ Descrição atualizada');
        }
        
        // Atualizar no dashboard (se existir)
        const dashRiqueza = document.getElementById('nivelRiqueza');
        if (dashRiqueza && dashRiqueza.id !== 'nivelRiqueza') { // Evitar conflito com o select
            dashRiqueza.textContent = nivel.nome;
        }
        
        // Atualizar saldo no dashboard
        const saldo = document.getElementById('saldoPersonagem');
        if (saldo) {
            const rendaNum = parseInt(nivel.renda.replace(/[^0-9]/g, ''));
            const saldoCalculado = rendaNum * 3; // 3 meses de renda
            saldo.textContent = '$' + saldoCalculado.toLocaleString();
            console.log('✅ Saldo atualizado:', saldo.textContent);
        }
        
        // Notificar sistema principal
        if (window.dashboardManager && window.dashboardManager.atualizarPontos) {
            window.dashboardManager.atualizarPontos('riqueza', parseInt(nivel.pontos));
        }
        
        console.log('✅ RIQUEZA ATUALIZADA COM SUCESSO!');
    }
    
    // 4. ADICIONAR EVENTO AO SELECT
    select.addEventListener('change', atualizarRiqueza);
    
    // 5. EXECUTAR UMA VEZ PARA INICIALIZAR
    atualizarRiqueza();
    
    console.log('✅ SISTEMA DE RIQUEZA INICIALIZADO COM SUCESSO!');
    
    // 6. EXPOR FUNÇÕES PARA TESTE
    window.atualizarRiquezaTeste = function(valor) {
        select.value = valor;
        atualizarRiqueza();
    };
}

// AGUARDAR O DOM CARREGAR
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📄 DOM carregado - verificando riqueza...');
        setTimeout(inicializarRiqueza, 1000);
    });
} else {
    // DOM já carregado
    setTimeout(inicializarRiqueza, 1000);
}

// MONITORAR QUANDO A TAB FOR ABERTA
document.addEventListener('click', function(e) {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
        console.log('👆 Tab características clicada');
        setTimeout(function() {
            // Verificar se já está inicializado
            const select = document.getElementById('nivelRiqueza');
            if (select && !select.hasAttribute('data-riqueza-inicializado')) {
                select.setAttribute('data-riqueza-inicializado', 'true');
                inicializarRiqueza();
            }
        }, 300);
    }
});

// FUNÇÃO DE TESTE PARA O CONSOLE
window.testarRiqueza = function() {
    console.log('🧪 TESTANDO RIQUEZA...');
    
    const select = document.getElementById('nivelRiqueza');
    if (!select) {
        console.error('❌ Select não encontrado!');
        return;
    }
    
    console.log('1. Testando Rico (+20 pts)');
    select.value = '20';
    select.dispatchEvent(new Event('change'));
    
    setTimeout(() => {
        console.log('2. Testando Pobre (-15 pts)');
        select.value = '-15';
        select.dispatchEvent(new Event('change'));
    }, 1000);
    
    setTimeout(() => {
        console.log('3. Testando Médio (0 pts)');
        select.value = '0';
        select.dispatchEvent(new Event('change'));
    }, 2000);
};

console.log('💰 RIQUEZA - SCRIPT CARREGADO. Use testarRiqueza() no console para testar.');