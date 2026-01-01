// ===========================================
// DASHBOARD.JS - VERSÃO QUE FUNCIONA
// Sistema completo sem alternância
// ===========================================

// ESTADO GLOBAL ÚNICO
window.DASHBOARD_ESTADO = {
    // Pontos
    iniciais: 200,
    atributos: 0,
    vantagens: 0,
    desvantagens: 0,
    pericias: 0,
    magias: 0,
    saldo: 200,
    
    // Características
    aparencia: 0,
    riqueza: 0,
    
    // Controle
    calculando: false,
    ultimoCalculo: 0
};

// ===== FUNÇÕES PARA PEGAR VALORES =====

function pegarPontosAparencia() {
    // Método 1: localStorage do connector
    try {
        const pontos = localStorage.getItem('gurps_pontos_aparencia');
        if (pontos !== null) {
            const valor = parseInt(pontos);
            return isNaN(valor) ? 0 : valor;
        }
    } catch (e) {}
    
    // Método 2: localStorage original
    try {
        const dados = localStorage.getItem('gurps_aparencia');
        if (dados) {
            const parsed = JSON.parse(dados);
            return parsed.nivelAparencia || 0;
        }
    } catch (e) {}
    
    return 0;
}

function pegarPontosRiqueza() {
    // Método 1: localStorage do connector
    try {
        const pontos = localStorage.getItem('gurps_pontos_riqueza');
        if (pontos !== null) {
            const valor = parseInt(pontos);
            return isNaN(valor) ? 0 : valor;
        }
    } catch (e) {}
    
    // Método 2: localStorage original
    try {
        const dados = localStorage.getItem('gurps_riqueza');
        if (dados) {
            const parsed = JSON.parse(dados);
            return parsed.nivelRiqueza || 0;
        }
    } catch (e) {}
    
    return 0;
}

function pegarPontosAtributos() {
    try {
        const dados = localStorage.getItem('gurps_atributos');
        if (dados) {
            const parsed = JSON.parse(dados);
            const st = parsed.atributos?.ST || 10;
            const dx = parsed.atributos?.DX || 10;
            const iq = parsed.atributos?.IQ || 10;
            const ht = parsed.atributos?.HT || 10;
            
            // Cálculo GURPS
            return (st - 10) * 10 + (dx - 10) * 20 + (iq - 10) * 20 + (ht - 10) * 10;
        }
    } catch (e) {}
    
    return 0;
}

// ===== CÁLCULO PRINCIPAL =====

function calcularPontosCompletos(forcar = false) {
    const agora = Date.now();
    
    // Evitar cálculos muito seguidos (mínimo 1 segundo)
    if (!forcar && agora - DASHBOARD_ESTADO.ultimoCalculo < 1000) {
        return DASHBOARD_ESTADO.saldo;
    }
    
    if (DASHBOARD_ESTADO.calculando) {
        return DASHBOARD_ESTADO.saldo;
    }
    
    DASHBOARD_ESTADO.calculando = true;
    DASHBOARD_ESTADO.ultimoCalculo = agora;
    
    console.log("⚡ CALCULANDO PONTOS...");
    
    // 1. PEGAR VALORES ATUAIS
    DASHBOARD_ESTADO.aparencia = pegarPontosAparencia();
    DASHBOARD_ESTADO.riqueza = pegarPontosRiqueza();
    DASHBOARD_ESTADO.atributos = pegarPontosAtributos();
    
    // 2. PEGAR PONTOS INICIAIS DA DASHBOARD
    const pontosIniciaisInput = document.getElementById('start-points');
    if (pontosIniciaisInput) {
        DASHBOARD_ESTADO.iniciais = parseInt(pontosIniciaisInput.value) || 200;
    }
    
    // 3. CALCULAR VANTAGENS/DESVANTAGENS
    let vantagens = 0;
    let desvantagens = 0;
    
    // Aparência
    if (DASHBOARD_ESTADO.aparencia > 0) {
        vantagens += DASHBOARD_ESTADO.aparencia;
    } else if (DASHBOARD_ESTADO.aparencia < 0) {
        desvantagens += Math.abs(DASHBOARD_ESTADO.aparencia);
    }
    
    // Riqueza
    if (DASHBOARD_ESTADO.riqueza > 0) {
        vantagens += DASHBOARD_ESTADO.riqueza;
    } else if (DASHBOARD_ESTADO.riqueza < 0) {
        desvantagens += Math.abs(DASHBOARD_ESTADO.riqueza);
    }
    
    DASHBOARD_ESTADO.vantagens = vantagens;
    DASHBOARD_ESTADO.desvantagens = desvantagens;
    
    // 4. CALCULAR SALDO FINAL
    const gastoTotal = DASHBOARD_ESTADO.atributos + DASHBOARD_ESTADO.vantagens + 
                      DASHBOARD_ESTADO.pericias + DASHBOARD_ESTADO.magias;
    const ganhoTotal = DASHBOARD_ESTADO.desvantagens;
    
    DASHBOARD_ESTADO.saldo = DASHBOARD_ESTADO.iniciais - gastoTotal + ganhoTotal;
    
    console.log("📊 RESULTADO:", {
        "Iniciais": DASHBOARD_ESTADO.iniciais,
        "Atributos": DASHBOARD_ESTADO.atributos,
        "Aparência": DASHBOARD_ESTADO.aparencia,
        "Riqueza": DASHBOARD_ESTADO.riqueza,
        "Vantagens": DASHBOARD_ESTADO.vantagens,
        "Desvantagens": DASHBOARD_ESTADO.desvantagens,
        "SALDO": DASHBOARD_ESTADO.saldo
    });
    
    // 5. ATUALIZAR DISPLAY
    atualizarDisplay();
    
    DASHBOARD_ESTADO.calculando = false;
    return DASHBOARD_ESTADO.saldo;
}

// ===== ATUALIZAR DISPLAY =====

function atualizarDisplay() {
    // Atualizar cards de pontos
    atualizarElemento('points-adv', DASHBOARD_ESTADO.vantagens);
    atualizarElemento('points-dis', -DASHBOARD_ESTADO.desvantagens);
    atualizarElemento('points-balance', DASHBOARD_ESTADO.saldo);
    
    // Atualizar aparência
    const appMod = document.getElementById('app-mod');
    if (appMod) {
        const valor = DASHBOARD_ESTADO.aparencia;
        appMod.textContent = valor >= 0 ? `+${valor}` : `${valor}`;
        appMod.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
    }
    
    // Atualizar riqueza
    const wealthLevel = document.getElementById('wealth-level');
    const wealthCost = document.getElementById('wealth-cost');
    
    if (wealthLevel || wealthCost) {
        const niveisRiqueza = {
            '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
            '0': 'Médio', '10': 'Confortável', '20': 'Rico',
            '30': 'Muito Rico', '50': 'Podre de Rico'
        };
        
        const valor = DASHBOARD_ESTADO.riqueza;
        const nivel = niveisRiqueza[valor.toString()] || 'Médio';
        const sinal = valor >= 0 ? '+' : '';
        
        if (wealthLevel) wealthLevel.textContent = nivel;
        if (wealthCost) {
            wealthCost.textContent = `[${sinal}${valor} pts]`;
            wealthCost.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
        }
    }
}

function atualizarElemento(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
        
        // Cor para saldo negativo
        if (id === 'points-balance') {
            if (valor < 0) {
                elemento.style.color = '#e74c3c';
                elemento.style.fontWeight = 'bold';
            } else {
                elemento.style.color = '';
                elemento.style.fontWeight = '';
            }
        }
    }
}

// ===== MONITORAMENTO SIMPLES =====

function iniciarMonitoramento() {
    console.log("👁️ Monitoramento iniciado");
    
    let ultimaAparencia = null;
    let ultimaRiqueza = null;
    let ultimosAtributos = null;
    
    // Verificar mudanças a cada 2 segundos
    setInterval(() => {
        const aparenciaAtual = pegarPontosAparencia();
        const riquezaAtual = pegarPontosRiqueza();
        const atributosAtual = pegarPontosAtributos();
        
        let mudou = false;
        
        if (aparenciaAtual !== ultimaAparencia) {
            ultimaAparencia = aparenciaAtual;
            mudou = true;
        }
        
        if (riquezaAtual !== ultimaRiqueza) {
            ultimaRiqueza = riquezaAtual;
            mudou = true;
        }
        
        if (atributosAtual !== ultimosAtributos) {
            ultimosAtributos = atributosAtual;
            mudou = true;
        }
        
        if (mudou) {
            calcularPontosCompletos();
        }
    }, 2000);
}

// ===== INICIALIZAÇÃO =====

function inicializarDashboard() {
    console.log("🚀 Inicializando dashboard...");
    
    // Configurar input de pontos iniciais
    const startPoints = document.getElementById('start-points');
    if (startPoints) {
        startPoints.value = DASHBOARD_ESTADO.iniciais;
        startPoints.addEventListener('change', () => {
            calcularPontosCompletos(true);
        });
    }
    
    // Primeiro cálculo
    setTimeout(() => {
        calcularPontosCompletos(true);
        iniciarMonitoramento();
        console.log("✅ Dashboard pronto!");
    }, 1000);
}

// ===== EVENTOS GLOBAIS =====

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(inicializarDashboard, 500);
});

// Funções globais para teste
window.recalcularDashboard = function() {
    return calcularPontosCompletos(true);
};

window.verificarEstado = function() {
    console.log("🔍 ESTADO ATUAL:", DASHBOARD_ESTADO);
    console.log("📦 localStorage aparencia:", localStorage.getItem('gurps_pontos_aparencia'));
    console.log("📦 localStorage riqueza:", localStorage.getItem('gurps_pontos_riqueza'));
    console.log("📦 localStorage atributos:", localStorage.getItem('gurps_atributos'));
};

// Exportar função principal
window.calcularDashboard = calcularPontosCompletos;

console.log("🎯 Dashboard.js carregado - Use recalcularDashboard()");