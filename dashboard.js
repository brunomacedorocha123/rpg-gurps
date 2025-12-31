// ===========================================
// DASHBOARD.JS - Pega valores DIRETO dos atributos
// ===========================================

console.log('🎯 Inicializando Dashboard Direto...');

// Função para pegar valores DOS ATRIBUTOS
function pegarValoresAtributos() {
    // Pega DIRETO dos inputs ou do objeto personagemAtributos
    return {
        ST: getValorAtributo('ST'),
        DX: getValorAtributo('DX'), 
        IQ: getValorAtributo('IQ'),
        HT: getValorAtributo('HT'),
        bonus: {
            PV: getValorBonus('PV'),
            PF: getValorBonus('PF'),
            Vontade: getValorBonus('Vontade'),
            Percepcao: getValorBonus('Percepcao'),
            Deslocamento: getValorBonus('Deslocamento')
        }
    };
}

function getValorAtributo(atributo) {
    // Tenta pegar do input
    const input = document.getElementById(atributo);
    if (input && input.value) {
        const valor = parseInt(input.value);
        return isNaN(valor) ? 10 : valor;
    }
    
    // Tenta pegar do objeto personagemAtributos
    if (window.personagemAtributos && window.personagemAtributos[atributo]) {
        return window.personagemAtributos[atributo];
    }
    
    return 10; // Valor padrão
}

function getValorBonus(bonus) {
    const input = document.getElementById('bonus' + bonus);
    if (input && input.value !== '') {
        if (bonus === 'Deslocamento') {
            return parseFloat(input.value) || 0;
        }
        return parseInt(input.value) || 0;
    }
    
    if (window.personagemAtributos && window.personagemAtributos.bonus) {
        return window.personagemAtributos.bonus[bonus] || 0;
    }
    
    return 0;
}

// ===========================================
// ATUALIZAÇÃO DO DASHBOARD
// ===========================================

function atualizarDashboard() {
    console.log('🔄 Atualizando Dashboard...');
    
    // Pega os valores ATUAIS
    const atributos = pegarValoresAtributos();
    
    // 1. ATRIBUTOS PRINCIPAIS
    document.getElementById('attr-st').textContent = atributos.ST;
    document.getElementById('attr-dx').textContent = atributos.DX;
    document.getElementById('attr-iq').textContent = atributos.IQ;
    document.getElementById('attr-ht').textContent = atributos.HT;
    
    // 2. DETALHES DOS ATRIBUTOS
    atualizarDetalhesAtributos(atributos);
    
    // 3. ATRIBUTOS SECUNDÁRIOS
    atualizarAtributosSecundarios(atributos);
    
    // 4. CARACTERÍSTICAS FÍSICAS (opcional)
    atualizarCaracteristicasFisicas();
    
    // 5. SISTEMA DE PONTOS
    atualizarSistemaPontos(atributos);
    
    // 6. TIMESTAMP
    atualizarTimestamp();
    
    console.log('✅ Dashboard atualizado!');
}

function atualizarDetalhesAtributos(atributos) {
    const { ST, DX, IQ, HT } = atributos;
    
    // Dano base
    let danoGDP = '1d-2', danoGEB = '1d';
    if (ST >= 1 && ST <= 40) {
        const stKey = Math.min(Math.max(ST, 1), 40);
        if (window.danoTable && window.danoTable[stKey]) {
            danoGDP = window.danoTable[stKey].gdp;
            danoGEB = window.danoTable[stKey].geb;
        }
    }
    
    // Esquiva: (DX + HT)/4 + 3
    const esquivaBase = Math.floor((DX + HT) / 4) + 3;
    
    // Atualizar
    document.getElementById('attr-st-details').textContent = `Dano: ${danoGDP}/${danoGEB}`;
    document.getElementById('attr-dx-details').textContent = `Esquiva: ${esquivaBase}`;
    document.getElementById('attr-iq-details').textContent = `Vontade: ${IQ}`;
    document.getElementById('attr-ht-details').textContent = `Resistência: ${HT}`;
}

function atualizarAtributosSecundarios(atributos) {
    const { ST, DX, IQ, HT, bonus } = atributos;
    
    // Calcular totais
    const pvTotal = Math.max(ST + (bonus.PV || 0), 1);
    const pfTotal = Math.max(HT + (bonus.PF || 0), 1);
    const vontadeTotal = Math.max(IQ + (bonus.Vontade || 0), 1);
    const percepcaoTotal = Math.max(IQ + (bonus.Percepcao || 0), 1);
    const deslocamentoBase = (HT + DX) / 4;
    const deslocamentoTotal = Math.max(deslocamentoBase + (bonus.Deslocamento || 0), 0).toFixed(2);
    
    // Atualizar elementos
    document.getElementById('pv-current').textContent = pvTotal;
    document.getElementById('pv-max').textContent = pvTotal;
    document.getElementById('fp-current').textContent = pfTotal;
    document.getElementById('fp-max').textContent = pfTotal;
    document.getElementById('will-value').textContent = vontadeTotal;
    document.getElementById('per-value').textContent = percepcaoTotal;
    document.getElementById('move-value').textContent = deslocamentoTotal;
}

function atualizarCaracteristicasFisicas() {
    // Tenta pegar do sistema de características físicas
    if (window.sistemaCaracteristicasFisicas) {
        try {
            const dados = window.sistemaCaracteristicasFisicas.exportarDados();
            if (dados.caracteristicasFisicas) {
                const fisicas = dados.caracteristicasFisicas;
                
                document.getElementById('phys-height').textContent = `${(fisicas.altura || 1.70).toFixed(2)} m`;
                document.getElementById('phys-weight').textContent = `${fisicas.peso || 70} kg`;
                document.getElementById('phys-age').textContent = `${(fisicas.visual?.idade || 25)} anos`;
                document.getElementById('phys-appearance').textContent = 
                    fisicas.conformidade?.dentroDaFaixa ? "Normal" : "Fora da Faixa";
                
                // Descrição física
                const descElement = document.getElementById('phys-description');
                if (descElement && fisicas.descricaoVisual) {
                    descElement.value = fisicas.descricaoVisual;
                }
                return;
            }
        } catch (error) {
            console.warn('Erro ao pegar características físicas:', error);
        }
    }
    
    // Valores padrão
    document.getElementById('phys-height').textContent = '1.70 m';
    document.getElementById('phys-weight').textContent = '70 kg';
    document.getElementById('phys-age').textContent = '25 anos';
    document.getElementById('phys-appearance').textContent = 'Comum';
}

function atualizarSistemaPontos(atributos) {
    const { ST, DX, IQ, HT } = atributos;
    
    // Calcular custos
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    const gastosAtributos = custoST + custoDX + custoIQ + custoHT;
    
    // Pontos de características físicas
    let pontosCaracteristicas = 0;
    if (window.sistemaCaracteristicasFisicas) {
        try {
            pontosCaracteristicas = window.sistemaCaracteristicasFisicas.calcularPontosCaracteristicas() || 0;
        } catch (error) {
            console.warn('Erro ao calcular pontos das características:', error);
        }
    }
    
    // Total gasto
    const totalGastos = gastosAtributos + pontosCaracteristicas;
    const pontosIniciais = 150;
    const saldo = pontosIniciais - totalGastos;
    
    // Atualizar
    document.getElementById('points-balance').textContent = saldo;
    
    // Cor do saldo
    const balanceElement = document.getElementById('points-balance');
    if (balanceElement) {
        if (saldo > 0) {
            balanceElement.style.color = '#27ae60';
        } else if (saldo < 0) {
            balanceElement.style.color = '#e74c3c';
        } else {
            balanceElement.style.color = '#f39c12';
        }
    }
}

function atualizarTimestamp() {
    const agora = new Date();
    const timestamp = agora.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    document.getElementById('current-time').textContent = timestamp;
}

// ===========================================
// OBSERVADOR PARA ATUALIZAÇÃO EM TEMPO REAL
// ===========================================

let dashboardInterval = null;

function iniciarObservadorDashboard() {
    console.log('👀 Iniciando observador do dashboard...');
    
    // Para qualquer intervalo anterior
    if (dashboardInterval) {
        clearInterval(dashboardInterval);
    }
    
    // Atualizar a cada 1 segundo
    dashboardInterval = setInterval(() => {
        if (document.querySelector('#dashboard.active')) {
            atualizarDashboard();
        }
    }, 1000);
    
    // Também observar eventos de mudança nos atributos
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            input.addEventListener('change', atualizarDashboard);
            input.addEventListener('input', () => {
                clearTimeout(window[`dash_${atributo}_timeout`]);
                window[`dash_${atributo}_timeout`] = setTimeout(atualizarDashboard, 500);
            });
        }
    });
    
    // Observar bônus
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(bonus => {
        const input = document.getElementById('bonus' + bonus);
        if (input) {
            input.addEventListener('change', atualizarDashboard);
            input.addEventListener('input', () => {
                clearTimeout(window[`dash_bonus_${bonus}_timeout`]);
                window[`dash_bonus_${bonus}_timeout`] = setTimeout(atualizarDashboard, 500);
            });
        }
    });
    
    // Primeira atualização
    atualizarDashboard();
}

function pararObservadorDashboard() {
    if (dashboardInterval) {
        clearInterval(dashboardInterval);
        dashboardInterval = null;
    }
}

// ===========================================
// INICIALIZAÇÃO QUANDO A ABA FOR ATIVA
// ===========================================

function inicializarDashboard() {
    console.log('🎯 Inicializando sistema de dashboard...');
    
    // Verificar se a aba dashboard está ativa
    const tabDashboard = document.getElementById('dashboard');
    
    if (tabDashboard && tabDashboard.classList.contains('active')) {
        iniciarObservadorDashboard();
    }
    
    // Observar mudanças na aba
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'dashboard') {
                    if (tab.classList.contains('active')) {
                        iniciarObservadorDashboard();
                    } else {
                        pararObservadorDashboard();
                    }
                }
            }
        });
    });
    
    if (tabDashboard) {
        observer.observe(tabDashboard, { attributes: true });
    }
}

// ===========================================
// EVENTOS DE TESTE E DEBUG
// ===========================================

function testarDashboard() {
    console.log('🧪 Testando dashboard...');
    console.log('Valores atuais:', pegarValoresAtributos());
    atualizarDashboard();
}

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Pequeno delay para garantir que tudo carregou
    setTimeout(inicializarDashboard, 500);
});

// ===========================================
// EXPORTAÇÃO PARA USO GLOBAL
// ===========================================

window.atualizarDashboard = atualizarDashboard;
window.testarDashboard = testarDashboard;
window.inicializarDashboard = inicializarDashboard;
window.pegarValoresAtributos = pegarValoresAtributos;

console.log('✅ dashboard.js carregado - pronto para conectar!');