// ===========================================
// DASHBOARD.JS - Sistema Central de Controle
// ===========================================

// Estado global do dashboard
let dashboardState = {
    // Sistema de Pontos
    pontosIniciais: 100,
    limiteDesvantagens: -75,
    
    // Status Social
    status: 0,
    reputacao: 0,
    aparencia: 0,
    
    // Finanças
    dinheiro: 0,
    nivelRiqueza: 'Médio',
    pesoEquipamentos: 0,
    
    // Contadores
    vantagens: 0,
    desvantagens: 0,
    pericias: 0,
    magias: 0,
    idiomas: 1,
    relacionamentos: 0,
    
    // Atributos (serão sincronizados)
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    PV: 10,
    PF: 10,
    Vontade: 10,
    Percepcao: 10
};

// ===========================================
// SISTEMA DE PONTOS - CÁLCULOS E CONTROLE
// ===========================================

function definirPontosIniciais(valor) {
    if (valor < 0) valor = 0;
    if (valor > 1000) valor = 1000;
    
    dashboardState.pontosIniciais = parseInt(valor);
    document.getElementById('start-points').value = valor;
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

function definirLimiteDesvantagens(valor) {
    if (valor > 0) valor = 0;
    
    dashboardState.limiteDesvantagens = parseInt(valor);
    document.getElementById('dis-limit').value = valor;
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

function calcularPontosGastos() {
    // 1. Pontos em Atributos (do atributos.js)
    const ST = dashboardState.ST || 10;
    const DX = dashboardState.DX || 10;
    const IQ = dashboardState.IQ || 10;
    const HT = dashboardState.HT || 10;
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const pontosAtributos = custoST + custoDX + custoIQ + custoHT;
    
    // 2. Pontos em Status Social
    const pontosStatus = dashboardState.status * 5; // Cada nível de status custa 5 pontos
    const pontosReputacao = Math.abs(dashboardState.reputacao) * 5; // Cada nível custa 5
    const pontosAparencia = dashboardState.aparencia * 5; // Cada nível custa 5
    
    const pontosSociais = pontosStatus + pontosReputacao + pontosAparencia;
    
    // 3. Outros (valores fictícios - serão substituídos por dados reais)
    const pontosVantagens = dashboardState.vantagens * 5; // Estimativa
    const pontosDesvantagens = dashboardState.desvantagens * -5; // Negativo
    const pontosPericias = dashboardState.pericias * 2; // Estimativa
    const pontosMagias = dashboardState.magias * 3; // Estimativa
    
    // Atualizar display
    document.getElementById('points-attr').textContent = pontosAtributos;
    document.getElementById('points-adv').textContent = pontosVantagens;
    document.getElementById('points-dis').textContent = pontosDesvantagens;
    document.getElementById('points-skills').textContent = pontosPericias;
    document.getElementById('points-spells').textContent = pontosMagias;
    
    // Calcular total gasto
    const totalGasto = pontosAtributos + pontosVantagens + pontosDesvantagens + 
                      pontosPericias + pontosMagias + pontosSociais;
    
    document.getElementById('total-points-spent').textContent = `${totalGasto} pts`;
    
    // Calcular saldo
    const saldo = dashboardState.pontosIniciais - totalGasto;
    document.getElementById('points-balance').textContent = saldo;
    
    // Atualizar status do saldo
    atualizarStatusSaldo(saldo);
    
    return totalGasto;
}

function atualizarStatusSaldo(saldo) {
    const indicator = document.getElementById('points-status-indicator');
    const text = document.getElementById('points-status-text');
    
    if (saldo > 0) {
        indicator.style.backgroundColor = '#4CAF50'; // Verde
        text.textContent = 'Personagem válido - pontos disponíveis';
        text.style.color = '#4CAF50';
    } else if (saldo === 0) {
        indicator.style.backgroundColor = '#FFC107'; // Amarelo
        text.textContent = 'Personagem completo - todos pontos usados';
        text.style.color = '#FFC107';
    } else {
        indicator.style.backgroundColor = '#f44336'; // Vermelho
        text.textContent = 'ATENÇÃO: Pontos excedidos!';
        text.style.color = '#f44336';
    }
}

// ===========================================
// STATUS SOCIAL - CONTROLE
// ===========================================

function ajustarModificador(tipo, valor) {
    const currentSpan = document.getElementById(`${tipo}-value`);
    const currentPoints = document.getElementById(`${tipo}-points-compact`);
    
    let currentValue = parseInt(currentSpan.textContent);
    let newValue = currentValue + valor;
    
    // Limites
    if (tipo === 'status') {
        if (newValue < -5) newValue = -5;
        if (newValue > 8) newValue = 8;
    } else if (tipo === 'reputacao') {
        if (newValue < -4) newValue = -4;
        if (newValue > 4) newValue = 4;
    } else if (tipo === 'aparencia') {
        if (newValue < -4) newValue = -4;
        if (newValue > 4) newValue = 4;
    }
    
    // Atualizar estado
    dashboardState[tipo] = newValue;
    
    // Atualizar display
    currentSpan.textContent = newValue;
    
    // Calcular pontos (cada nível custa 5 pontos)
    const pontos = newValue * 5;
    currentPoints.textContent = `[${pontos}]`;
    
    // Atualizar total de pontos sociais
    const totalSocial = (dashboardState.status + dashboardState.reputacao + dashboardState.aparencia) * 5;
    document.getElementById('social-total-points').textContent = `${totalSocial} pts`;
    
    // Atualizar modificador total de reação
    const reacaoTotal = dashboardState.status + dashboardState.reputacao + dashboardState.aparencia;
    const display = reacaoTotal >= 0 ? `+${reacaoTotal}` : reacaoTotal;
    document.getElementById('reaction-total-compact').textContent = display;
    
    // Recalcular sistema de pontos
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

// ===========================================
// SINCRONIZAÇÃO COM ATRIBUTOS.JS
// ===========================================

function sincronizarAtributos() {
    try {
        // Verificar se atributos.js está carregado e tem dados
        if (typeof personagemAtributos !== 'undefined') {
            // Pegar valores principais
            dashboardState.ST = personagemAtributos.ST || 10;
            dashboardState.DX = personagemAtributos.DX || 10;
            dashboardState.IQ = personagemAtributos.IQ || 10;
            dashboardState.HT = personagemAtributos.HT || 10;
            
            // Calcular valores secundários
            const pvBase = dashboardState.ST;
            const pvBonus = personagemAtributos.bonus?.PV || 0;
            dashboardState.PV = Math.max(pvBase + pvBonus, 1);
            
            const pfBase = dashboardState.HT;
            const pfBonus = personagemAtributos.bonus?.PF || 0;
            dashboardState.PF = Math.max(pfBase + pfBonus, 1);
            
            const vontadeBase = dashboardState.IQ;
            const vontadeBonus = personagemAtributos.bonus?.Vontade || 0;
            dashboardState.Vontade = Math.max(vontadeBase + vontadeBonus, 1);
            
            const percepcaoBase = dashboardState.IQ;
            const percepcaoBonus = personagemAtributos.bonus?.Percepcao || 0;
            dashboardState.Percepcao = Math.max(percepcaoBase + percepcaoBonus, 1);
            
            // Atualizar dashboard
            atualizarDashboardAtributos();
        } else {
            console.warn('atributos.js não carregado, usando valores padrão');
        }
    } catch (error) {
        console.error('Erro ao sincronizar atributos:', error);
    }
}

function atualizarDashboardAtributos() {
    // Atualizar resumo de atributos
    document.getElementById('summary-st').textContent = dashboardState.ST;
    document.getElementById('summary-dx').textContent = dashboardState.DX;
    document.getElementById('summary-iq').textContent = dashboardState.IQ;
    document.getElementById('summary-ht').textContent = dashboardState.HT;
    
    // Atualizar valores secundários
    document.getElementById('summary-hp').textContent = dashboardState.PV;
    document.getElementById('summary-fp').textContent = dashboardState.PF;
    document.getElementById('summary-will').textContent = dashboardState.Vontade;
    document.getElementById('summary-per').textContent = dashboardState.Percepcao;
    
    // Atualizar status rápido
    document.getElementById('quick-hp').textContent = dashboardState.PV;
    document.getElementById('quick-fp').textContent = dashboardState.PF;
    
    // Calcular limites de carga baseados em ST
    calcularLimitesCarga(dashboardState.ST);
    
    // Recalcular sistema de pontos
    atualizarSistemaPontos();
}

function calcularLimitesCarga(ST) {
    // Usar a mesma tabela do atributos.js
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;
    
    const cargasTable = {
        1: { nenhuma: 0.1, leve: 0.2, media: 0.3, pesada: 0.6, muitoPesada: 1.0 },
        2: { nenhuma: 0.4, leve: 0.8, media: 1.2, pesada: 2.4, muitoPesada: 4.0 },
        // ... (mesma tabela do atributos.js)
        10: { nenhuma: 10.0, leve: 20.0, media: 30.0, pesada: 60.0, muitoPesada: 100.0 },
        20: { nenhuma: 40.0, leve: 80.0, media: 120.0, pesada: 240.0, muitoPesada: 400.0 }
    };
    
    const cargas = cargasTable[stKey] || cargasTable[10];
    
    // Atualizar display
    document.getElementById('limit-light').textContent = cargas.leve.toFixed(1) + ' kg';
    document.getElementById('limit-medium').textContent = cargas.media.toFixed(1) + ' kg';
    document.getElementById('limit-heavy').textContent = cargas.pesada.toFixed(1) + ' kg';
    document.getElementById('limit-extreme').textContent = cargas.muitoPesada.toFixed(1) + ' kg';
    
    // Calcular nível de carga atual
    atualizarNivelCarga(dashboardState.pesoEquipamentos, cargas);
}

function atualizarNivelCarga(peso, limites) {
    const encLevel = document.getElementById('enc-level-display');
    
    if (peso <= limites.nenhuma) {
        encLevel.textContent = 'Nenhuma';
        encLevel.className = 'enc-value safe';
    } else if (peso <= limites.leve) {
        encLevel.textContent = 'Leve';
        encLevel.className = 'enc-value light';
    } else if (peso <= limites.media) {
        encLevel.textContent = 'Média';
        encLevel.className = 'enc-value medium';
    } else if (peso <= limites.pesada) {
        encLevel.textContent = 'Pesada';
        encLevel.className = 'enc-value heavy';
    } else {
        encLevel.textContent = 'Extrema';
        encLevel.className = 'enc-value extreme';
    }
}

// ===========================================
// FINANÇAS E CARGA
// ===========================================

function atualizarFinancas() {
    // Dinheiro
    const dinheiro = dashboardState.dinheiro;
    document.getElementById('current-money').textContent = `$${dinheiro}`;
    
    // Nível de riqueza
    document.getElementById('wealth-level-display').textContent = 
        `${dashboardState.nivelRiqueza} [${calcularPontosRiqueza()} pts]`;
    
    // Peso
    document.getElementById('equip-weight').textContent = 
        `${dashboardState.pesoEquipamentos.toFixed(1)} kg`;
    
    // Status financeiro
    atualizarStatusFinanceiro();
}

function calcularPontosRiqueza() {
    const niveis = {
        'Miserável': -25,
        'Muito Pobre': -15,
        'Pobre': -10,
        'Abaixo da média': -5,
        'Médio': 0,
        'Confortável': 10,
        'Rico': 20,
        'Muito Rico': 30,
        'Opulento': 50
    };
    
    return niveis[dashboardState.nivelRiqueza] || 0;
}

function atualizarStatusFinanceiro() {
    const statusElement = document.getElementById('finance-status');
    
    if (dashboardState.dinheiro < 100) {
        statusElement.textContent = 'Baixo';
        statusElement.style.backgroundColor = '#f44336';
    } else if (dashboardState.dinheiro < 1000) {
        statusElement.textContent = 'Médio';
        statusElement.style.backgroundColor = '#FFC107';
    } else {
        statusElement.textContent = 'Alto';
        statusElement.style.backgroundColor = '#4CAF50';
    }
}

// ===========================================
// CONTADORES
// ===========================================

function atualizarContadores() {
    // Atualizar todos os contadores
    document.getElementById('counter-advantages').textContent = dashboardState.vantagens;
    document.getElementById('counter-disadvantages').textContent = dashboardState.desvantagens;
    document.getElementById('counter-skills').textContent = dashboardState.pericias;
    document.getElementById('counter-spells').textContent = dashboardState.magias;
    document.getElementById('counter-languages').textContent = dashboardState.idiomas;
    document.getElementById('counter-relationships').textContent = dashboardState.relacionamentos;
    
    // Atualizar horário da última atualização
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('last-update-time').textContent = timeString;
}

// ===========================================
// FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
// ===========================================

function atualizarSistemaPontos() {
    calcularPontosGastos();
}

function atualizarDashboard() {
    console.log('🔄 Atualizando dashboard...');
    
    // Sincronizar com atributos.js
    sincronizarAtributos();
    
    // Atualizar todos os sistemas
    atualizarSistemaPontos();
    atualizarFinancas();
    atualizarContadores();
    
    // Salvar estado
    salvarEstadoDashboard();
    
    console.log('✅ Dashboard atualizado');
}

// ===========================================
// SALVAMENTO E CARREGAMENTO
// ===========================================

function salvarEstadoDashboard() {
    try {
        localStorage.setItem('gurps_dashboard', JSON.stringify(dashboardState));
    } catch (error) {
        console.warn('Não foi possível salvar dashboard:', error);
    }
}

function carregarEstadoDashboard() {
    try {
        const dados = localStorage.getItem('gurps_dashboard');
        if (dados) {
            const savedState = JSON.parse(dados);
            
            // Mesclar com estado atual (preservando valores padrão)
            dashboardState = { ...dashboardState, ...savedState };
            
            // Restaurar configurações
            document.getElementById('start-points').value = dashboardState.pontosIniciais;
            document.getElementById('dis-limit').value = dashboardState.limiteDesvantagens;
            
            // Restaurar status social
            document.getElementById('status-value').textContent = dashboardState.status;
            document.getElementById('rep-value').textContent = dashboardState.reputacao;
            document.getElementById('app-value').textContent = dashboardState.aparencia;
            
            // Atualizar pontos sociais
            document.getElementById('status-points-compact').textContent = 
                `[${dashboardState.status * 5}]`;
            document.getElementById('reputacao-points-compact').textContent = 
                `[${dashboardState.reputacao * 5}]`;
            document.getElementById('aparencia-points-compact').textContent = 
                `[${dashboardState.aparencia * 5}]`;
            
            return true;
        }
    } catch (error) {
        console.warn('Não foi possível carregar dashboard:', error);
    }
    return false;
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

function inicializarDashboard() {
    console.log('📊 Inicializando dashboard...');
    
    // Carregar estado salvo
    carregarEstadoDashboard();
    
    // Configurar event listeners
    document.getElementById('start-points').addEventListener('change', function() {
        definirPontosIniciais(this.value);
    });
    
    document.getElementById('dis-limit').addEventListener('change', function() {
        definirLimiteDesvantagens(this.value);
    });
    
    // Configurar botão de atualização
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', atualizarDashboard);
    }
    
    // Configurar foto do personagem
    const uploadInput = document.getElementById('char-upload');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const preview = document.getElementById('photo-preview');
                    preview.innerHTML = `<img src="${event.target.result}" alt="Foto do Personagem">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Sincronizar com outras abas periodicamente
    setInterval(sincronizarAtributos, 2000);
    
    // Primeira atualização
    setTimeout(atualizarDashboard, 500);
    
    console.log('✅ Dashboard inicializado');
}

// ===========================================
// FUNÇÕES DE SIMULAÇÃO (PARA TESTES)
// ===========================================

// Funções para simular dados (remover na versão final)
function simularDadosAleatorios() {
    // Simular contadores
    dashboardState.vantagens = Math.floor(Math.random() * 10) + 1;
    dashboardState.desvantagens = Math.floor(Math.random() * 8) + 1;
    dashboardState.pericias = Math.floor(Math.random() * 20) + 5;
    dashboardState.magias = Math.floor(Math.random() * 15);
    dashboardState.idiomas = Math.floor(Math.random() * 3) + 1;
    dashboardState.relacionamentos = Math.floor(Math.random() * 5);
    
    // Simular finanças
    dashboardState.dinheiro = Math.floor(Math.random() * 5000);
    dashboardState.pesoEquipamentos = Math.random() * 50;
    
    atualizarDashboard();
}

// ===========================================
// EXPORTAR FUNÇÕES
// ===========================================

window.definirPontosIniciais = definirPontosIniciais;
window.definirLimiteDesvantagens = definirLimiteDesvantagens;
window.ajustarModificador = ajustarModificador;
window.atualizarDashboard = atualizarDashboard;
window.sincronizarAtributos = sincronizarAtributos;
window.inicializarDashboard = inicializarDashboard;
window.simularDadosAleatorios = simularDadosAleatorios;

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================

// Inicializar quando a aba dashboard estiver ativa
document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        setTimeout(inicializarDashboard, 300);
    }
});

// Alternativa: observar mudanças de aba
document.addEventListener('tabChange', function(e) {
    if (e.detail && e.detail.tab === 'dashboard') {
        setTimeout(inicializarDashboard, 100);
    }
});

// Inicializar se já estiver na aba dashboard
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        setTimeout(inicializarDashboard, 100);
    }
}