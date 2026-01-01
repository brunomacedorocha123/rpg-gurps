// ===========================================
// DASHBOARD.JS - COMPLETO E FUNCIONAL
// Sistema completo sem quebrar nada
// ===========================================

// ESTADO GLOBAL COMPLETO
window.DASHBOARD_GURPS = {
    // Sistema de pontos
    pontos: {
        iniciais: 200,
        atributos: 0,
        vantagens: 0,
        desvantagens: 0,
        pericias: 0,
        magias: 0,
        saldo: 200,
        limiteDesvantagens: 75
    },
    
    // Características
    caracteristicas: {
        aparencia: 0,
        riqueza: 0,
        altura: '1.70 m',
        peso: '70 kg',
        idade: '25 anos',
        aparenciaFisica: 'Comum'
    },
    
    // Identificação
    identificacao: {
        nome: '',
        ocupacao: '',
        jogador: ''
    },
    
    // Atributos principais
    atributos: {
        ST: 10,
        DX: 10,
        IQ: 10,
        HT: 10
    },
    
    // Atributos secundários
    secundarios: {
        PV: { base: 10, bonus: 0, total: 10 },
        PF: { base: 10, bonus: 0, total: 10 },
        vontade: { base: 10, bonus: 0, total: 10 },
        percepcao: { base: 10, bonus: 0, total: 10 },
        deslocamento: { base: 5.00, bonus: 0, total: 5.00 }
    },
    
    // Status social
    status: {
        riquezaNivel: 'Médio',
        riquezaPontos: 0,
        statusMod: 0,
        reputacaoMod: 0,
        aparenciaMod: 0,
        reacaoTotal: 0
    },
    
    // Equipamento
    equipamento: {
        pesoTotal: '0.0 kg',
        valorTotal: '$0',
        nivelCarga: 'Nenhuma'
    },
    
    // Resumo
    resumo: {
        vantagens: 0,
        desvantagens: 0,
        pericias: 0,
        magias: 0,
        itens: 0,
        idiomas: 1
    },
    
    // Controle
    controle: {
        inicializado: false,
        calculando: false,
        ultimoCalculo: 0,
        ultimaAtualizacao: null
    }
};

// ===========================================
// FUNÇÕES PARA PEGAR VALORES
// ===========================================

function pegarValorAparencia() {
    console.log("🔍 Buscando valor de aparência...");
    
    // TENTA TODOS OS MÉTODOS POSSÍVEIS
    let valor = 0;
    
    // 1. localStorage do connector (que você adicionou)
    try {
        const pontos = localStorage.getItem('gurps_pontos_aparencia');
        if (pontos !== null) {
            valor = parseInt(pontos);
            console.log("✅ Aparência do connector:", valor);
            return isNaN(valor) ? 0 : valor;
        }
    } catch (e) {
        console.warn("❌ Erro no connector:", e);
    }
    
    // 2. localStorage do sistema original
    try {
        const dados = localStorage.getItem('gurps_aparencia');
        if (dados) {
            const parsed = JSON.parse(dados);
            valor = parsed.nivelAparencia || 0;
            console.log("✅ Aparência do sistema:", valor);
            return valor;
        }
    } catch (e) {
        console.warn("❌ Erro no sistema:", e);
    }
    
    // 3. Sistema global (se estiver na mesma página)
    if (window.sistemaAparencia && typeof window.sistemaAparencia.getPontosAparencia === 'function') {
        valor = window.sistemaAparencia.getPontosAparencia();
        console.log("✅ Aparência do sistema global:", valor);
        return valor;
    }
    
    // 4. Select direto (se estiver na mesma página)
    const selectAparencia = document.getElementById('nivelAparencia');
    if (selectAparencia) {
        valor = parseInt(selectAparencia.value) || 0;
        console.log("✅ Aparência do select:", valor);
        return valor;
    }
    
    console.log("⚠️ Aparência não encontrada, usando 0");
    return 0;
}

function pegarValorRiqueza() {
    console.log("🔍 Buscando valor de riqueza...");
    
    let valor = 0;
    
    // 1. localStorage do connector
    try {
        const pontos = localStorage.getItem('gurps_pontos_riqueza');
        if (pontos !== null) {
            valor = parseInt(pontos);
            console.log("✅ Riqueza do connector:", valor);
            return isNaN(valor) ? 0 : valor;
        }
    } catch (e) {
        console.warn("❌ Erro no connector:", e);
    }
    
    // 2. localStorage do sistema original
    try {
        const dados = localStorage.getItem('gurps_riqueza');
        if (dados) {
            const parsed = JSON.parse(dados);
            valor = parsed.nivelRiqueza || 0;
            console.log("✅ Riqueza do sistema:", valor);
            return valor;
        }
    } catch (e) {
        console.warn("❌ Erro no sistema:", e);
    }
    
    // 3. Sistema global
    if (window.sistemaRiqueza && typeof window.sistemaRiqueza.getPontosRiqueza === 'function') {
        valor = window.sistemaRiqueza.getPontosRiqueza();
        console.log("✅ Riqueza do sistema global:", valor);
        return valor;
    }
    
    // 4. Select direto
    const selectRiqueza = document.getElementById('nivelRiqueza');
    if (selectRiqueza) {
        valor = parseInt(selectRiqueza.value) || 0;
        console.log("✅ Riqueza do select:", valor);
        return valor;
    }
    
    console.log("⚠️ Riqueza não encontrada, usando 0");
    return 0;
}

function pegarValorAtributos() {
    console.log("🔍 Buscando valor de atributos...");
    
    let valor = 0;
    
    // 1. localStorage do sistema de atributos
    try {
        const dados = localStorage.getItem('gurps_atributos');
        if (dados) {
            const parsed = JSON.parse(dados);
            const st = parsed.atributos?.ST || 10;
            const dx = parsed.atributos?.DX || 10;
            const iq = parsed.atributos?.IQ || 10;
            const ht = parsed.atributos?.HT || 10;
            
            // Fórmula GURPS: ST=10pts, DX=20pts, IQ=20pts, HT=10pts
            valor = (st - 10) * 10 + (dx - 10) * 20 + (iq - 10) * 20 + (ht - 10) * 10;
            
            console.log("✅ Atributos calculados:", {
                ST: st, DX: dx, IQ: iq, HT: ht,
                custo: valor
            });
            
            // Atualizar também os valores dos atributos na dashboard
            DASHBOARD_GURPS.atributos.ST = st;
            DASHBOARD_GURPS.atributos.DX = dx;
            DASHBOARD_GURPS.atributos.IQ = iq;
            DASHBOARD_GURPS.atributos.HT = ht;
            
            return valor;
        }
    } catch (e) {
        console.warn("❌ Erro ao pegar atributos:", e);
    }
    
    // 2. Tenta pegar dos elementos da dashboard
    try {
        const stElement = document.getElementById('attr-st');
        const dxElement = document.getElementById('attr-dx');
        const iqElement = document.getElementById('attr-iq');
        const htElement = document.getElementById('attr-ht');
        
        if (stElement && dxElement && iqElement && htElement) {
            const st = parseInt(stElement.textContent) || 10;
            const dx = parseInt(dxElement.textContent) || 10;
            const iq = parseInt(iqElement.textContent) || 10;
            const ht = parseInt(htElement.textContent) || 10;
            
            valor = (st - 10) * 10 + (dx - 10) * 20 + (iq - 10) * 20 + (ht - 10) * 10;
            console.log("✅ Atributos da dashboard:", valor);
            
            DASHBOARD_GURPS.atributos.ST = st;
            DASHBOARD_GURPS.atributos.DX = dx;
            DASHBOARD_GURPS.atributos.IQ = iq;
            DASHBOARD_GURPS.atributos.HT = ht;
            
            return valor;
        }
    } catch (e) {
        console.warn("❌ Erro na dashboard:", e);
    }
    
    // 3. Tenta pegar dos inputs (se existirem)
    try {
        const stInput = document.getElementById('ST');
        const dxInput = document.getElementById('DX');
        const iqInput = document.getElementById('IQ');
        const htInput = document.getElementById('HT');
        
        if (stInput || dxInput || iqInput || htInput) {
            const st = parseInt(stInput?.value || 10);
            const dx = parseInt(dxInput?.value || 10);
            const iq = parseInt(iqInput?.value || 10);
            const ht = parseInt(htInput?.value || 10);
            
            valor = (st - 10) * 10 + (dx - 10) * 20 + (iq - 10) * 20 + (ht - 10) * 10;
            console.log("✅ Atributos dos inputs:", valor);
            
            DASHBOARD_GURPS.atributos.ST = st;
            DASHBOARD_GURPS.atributos.DX = dx;
            DASHBOARD_GURPS.atributos.IQ = iq;
            DASHBOARD_GURPS.atributos.HT = ht;
            
            return valor;
        }
    } catch (e) {
        console.warn("❌ Erro nos inputs:", e);
    }
    
    console.log("⚠️ Atributos não encontrados, usando 0");
    return 0;
}

function pegarPontosIniciais() {
    const startPoints = document.getElementById('start-points');
    if (startPoints) {
        const valor = parseInt(startPoints.value) || 200;
        return valor;
    }
    return 200;
}

// ===========================================
// CÁLCULO COMPLETO DE PONTOS
// ===========================================

function calcularPontosCompletos(forcarRecalculo = false) {
    // Evitar múltiplos cálculos simultâneos
    if (DASHBOARD_GURPS.controle.calculando && !forcarRecalculo) {
        console.log("⏳ Já está calculando...");
        return DASHBOARD_GURPS.pontos.saldo;
    }
    
    const agora = Date.now();
    
    // Evitar cálculos muito seguidos (mínimo 1 segundo entre cálculos)
    if (!forcarRecalculo && agora - DASHBOARD_GURPS.controle.ultimoCalculo < 1000) {
        return DASHBOARD_GURPS.pontos.saldo;
    }
    
    DASHBOARD_GURPS.controle.calculando = true;
    DASHBOARD_GURPS.controle.ultimoCalculo = agora;
    
    console.log("=".repeat(50));
    console.log("🧮 INICIANDO CÁLCULO COMPLETO DE PONTOS");
    console.log("=".repeat(50));
    
    // 1. ATUALIZAR VALORES
    console.log("📥 Atualizando valores...");
    
    // Pontos iniciais
    DASHBOARD_GURPS.pontos.iniciais = pegarPontosIniciais();
    console.log(`💰 Pontos iniciais: ${DASHBOARD_GURPS.pontos.iniciais}`);
    
    // Atributos
    DASHBOARD_GURPS.pontos.atributos = pegarValorAtributos();
    console.log(`⚔️ Atributos: ${DASHBOARD_GURPS.pontos.atributos} pts`);
    
    // Aparência
    DASHBOARD_GURPS.caracteristicas.aparencia = pegarValorAparencia();
    console.log(`🎭 Aparência: ${DASHBOARD_GURPS.caracteristicas.aparencia} pts`);
    
    // Riqueza
    DASHBOARD_GURPS.caracteristicas.riqueza = pegarValorRiqueza();
    console.log(`💰 Riqueza: ${DASHBOARD_GURPS.caracteristicas.riqueza} pts`);
    
    // 2. CALCULAR VANTAGENS E DESVANTAGENS
    console.log("📊 Calculando vantagens/desvantagens...");
    
    let vantagens = 0;
    let desvantagens = 0;
    
    // Aparência
    if (DASHBOARD_GURPS.caracteristicas.aparencia > 0) {
        vantagens += DASHBOARD_GURPS.caracteristicas.aparencia;
        console.log(`✨ Aparência: +${DASHBOARD_GURPS.caracteristicas.aparencia} vantagens (GASTA)`);
    } else if (DASHBOARD_GURPS.caracteristicas.aparencia < 0) {
        desvantagens += Math.abs(DASHBOARD_GURPS.caracteristicas.aparencia);
        console.log(`⚠️ Aparência: +${Math.abs(DASHBOARD_GURPS.caracteristicas.aparencia)} desvantagens (GANHA)`);
    }
    
    // Riqueza
    if (DASHBOARD_GURPS.caracteristicas.riqueza > 0) {
        vantagens += DASHBOARD_GURPS.caracteristicas.riqueza;
        console.log(`💎 Riqueza: +${DASHBOARD_GURPS.caracteristicas.riqueza} vantagens (GASTA)`);
    } else if (DASHBOARD_GURPS.caracteristicas.riqueza < 0) {
        desvantagens += Math.abs(DASHBOARD_GURPS.caracteristicas.riqueza);
        console.log(`💸 Riqueza: +${Math.abs(DASHBOARD_GURPS.caracteristicas.riqueza)} desvantagens (GANHA)`);
    }
    
    DASHBOARD_GURPS.pontos.vantagens = vantagens;
    DASHBOARD_GURPS.pontos.desvantagens = desvantagens;
    
    console.log(`📈 Total Vantagens: ${vantagens} pts`);
    console.log(`📉 Total Desvantagens: ${desvantagens} pts`);
    
    // 3. PEGAR PERÍCIAS E MAGIAS (se existirem na dashboard)
    console.log("🛠️ Buscando perícias e magias...");
    
    const pontosSkills = document.getElementById('points-skills');
    const pontosSpells = document.getElementById('points-spells');
    
    if (pontosSkills) {
        DASHBOARD_GURPS.pontos.pericias = parseInt(pontosSkills.textContent) || 0;
    }
    
    if (pontosSpells) {
        DASHBOARD_GURPS.pontos.magias = parseInt(pontosSpells.textContent) || 0;
    }
    
    console.log(`🔧 Perícias: ${DASHBOARD_GURPS.pontos.pericias} pts`);
    console.log(`🔮 Magias: ${DASHBOARD_GURPS.pontos.magias} pts`);
    
    // 4. CALCULAR SALDO FINAL
    console.log("🧾 Calculando saldo final...");
    
    const gastoTotal = DASHBOARD_GURPS.pontos.atributos + 
                      DASHBOARD_GURPS.pontos.vantagens + 
                      DASHBOARD_GURPS.pontos.pericias + 
                      DASHBOARD_GURPS.pontos.magias;
    
    const ganhoTotal = DASHBOARD_GURPS.pontos.desvantagens;
    
    DASHBOARD_GURPS.pontos.saldo = DASHBOARD_GURPS.pontos.iniciais - gastoTotal + ganhoTotal;
    
    console.log(`📐 Fórmula: ${DASHBOARD_GURPS.pontos.iniciais} - ${gastoTotal} + ${ganhoTotal} = ${DASHBOARD_GURPS.pontos.saldo}`);
    console.log("=".repeat(50));
    
    // 5. ATUALIZAR ATRIBUTOS SECUNDÁRIOS
    atualizarAtributosSecundarios();
    
    // 6. ATUALIZAR DISPLAY COMPLETO
    atualizarDisplayCompleto();
    
    // 7. VERIFICAR LIMITES
    verificarLimitesDesvantagens();
    
    // 8. SALVAR ESTADO
    salvarEstadoDashboard();
    
    DASHBOARD_GURPS.controle.calculando = false;
    DASHBOARD_GURPS.controle.ultimaAtualizacao = new Date().toLocaleTimeString();
    
    console.log("✅ CÁLCULO COMPLETO FINALIZADO");
    console.log(`💰 SALDO FINAL: ${DASHBOARD_GURPS.pontos.saldo} pts`);
    
    return DASHBOARD_GURPS.pontos.saldo;
}

// ===========================================
// ATUALIZAR ATRIBUTOS SECUNDÁRIOS
// ===========================================

function atualizarAtributosSecundarios() {
    console.log("🔄 Atualizando atributos secundários...");
    
    const st = DASHBOARD_GURPS.atributos.ST;
    const dx = DASHBOARD_GURPS.atributos.DX;
    const iq = DASHBOARD_GURPS.atributos.IQ;
    const ht = DASHBOARD_GURPS.atributos.HT;
    
    // Calcular valores base
    const pvBase = Math.max(st, 1);
    const pfBase = Math.max(ht, 1);
    const vontadeBase = Math.max(iq, 1);
    const percepcaoBase = Math.max(iq, 1);
    const deslocamentoBase = ((ht + dx) / 4).toFixed(2);
    
    // Atualizar estado
    DASHBOARD_GURPS.secundarios.PV.base = pvBase;
    DASHBOARD_GURPS.secundarios.PV.total = pvBase + DASHBOARD_GURPS.secundarios.PV.bonus;
    
    DASHBOARD_GURPS.secundarios.PF.base = pfBase;
    DASHBOARD_GURPS.secundarios.PF.total = pfBase + DASHBOARD_GURPS.secundarios.PF.bonus;
    
    DASHBOARD_GURPS.secundarios.vontade.base = vontadeBase;
    DASHBOARD_GURPS.secundarios.vontade.total = vontadeBase + DASHBOARD_GURPS.secundarios.vontade.bonus;
    
    DASHBOARD_GURPS.secundarios.percepcao.base = percepcaoBase;
    DASHBOARD_GURPS.secundarios.percepcao.total = percepcaoBase + DASHBOARD_GURPS.secundarios.percepcao.bonus;
    
    DASHBOARD_GURPS.secundarios.deslocamento.base = parseFloat(deslocamentoBase);
    DASHBOARD_GURPS.secundarios.deslocamento.total = parseFloat(deslocamentoBase) + DASHBOARD_GURPS.secundarios.deslocamento.bonus;
    
    console.log("📊 Atributos secundários atualizados:", {
        PV: DASHBOARD_GURPS.secundarios.PV.total,
        PF: DASHBOARD_GURPS.secundarios.PF.total,
        Vontade: DASHBOARD_GURPS.secundarios.vontade.total,
        Percepção: DASHBOARD_GURPS.secundarios.percepcao.total,
        Deslocamento: DASHBOARD_GURPS.secundarios.deslocamento.total
    });
}

// ===========================================
// ATUALIZAR DISPLAY COMPLETO
// ===========================================

function atualizarDisplayCompleto() {
    console.log("🖥️ Atualizando display...");
    
    // 1. ATUALIZAR CARDS DE PONTOS
    atualizarElementoDisplay('points-adv', DASHBOARD_GURPS.pontos.vantagens);
    atualizarElementoDisplay('points-dis', -DASHBOARD_GURPS.pontos.desvantagens);
    atualizarElementoDisplay('points-skills', DASHBOARD_GURPS.pontos.pericias);
    atualizarElementoDisplay('points-spells', DASHBOARD_GURPS.pontos.magias);
    atualizarElementoDisplay('points-balance', DASHBOARD_GURPS.pontos.saldo);
    
    // Saldo negativo em vermelho
    const saldoElement = document.getElementById('points-balance');
    if (saldoElement) {
        if (DASHBOARD_GURPS.pontos.saldo < 0) {
            saldoElement.classList.add('saldo-negativo');
            saldoElement.style.color = '#e74c3c';
            saldoElement.style.fontWeight = 'bold';
        } else {
            saldoElement.classList.remove('saldo-negativo');
            saldoElement.style.color = '';
            saldoElement.style.fontWeight = '';
        }
    }
    
    // 2. ATUALIZAR ATRIBUTOS PRINCIPAIS
    atualizarElementoDisplay('attr-st', DASHBOARD_GURPS.atributos.ST);
    atualizarElementoDisplay('attr-dx', DASHBOARD_GURPS.atributos.DX);
    atualizarElementoDisplay('attr-iq', DASHBOARD_GURPS.atributos.IQ);
    atualizarElementoDisplay('attr-ht', DASHBOARD_GURPS.atributos.HT);
    
    // 3. ATUALIZAR ATRIBUTOS SECUNDÁRIOS
    atualizarElementoDisplay('pv-current', DASHBOARD_GURPS.secundarios.PV.total);
    atualizarElementoDisplay('pv-max', DASHBOARD_GURPS.secundarios.PV.total);
    atualizarElementoDisplay('fp-current', DASHBOARD_GURPS.secundarios.PF.total);
    atualizarElementoDisplay('fp-max', DASHBOARD_GURPS.secundarios.PF.total);
    atualizarElementoDisplay('will-value', DASHBOARD_GURPS.secundarios.vontade.total);
    atualizarElementoDisplay('per-value', DASHBOARD_GURPS.secundarios.percepcao.total);
    atualizarElementoDisplay('move-value', DASHBOARD_GURPS.secundarios.deslocamento.total.toFixed(2));
    
    // 4. ATUALIZAR STATUS SOCIAL
    atualizarStatusSocial();
    
    // 5. ATUALIZAR RESUMO
    atualizarResumo();
    
    console.log("✅ Display atualizado completo");
}

function atualizarElementoDisplay(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

function atualizarStatusSocial() {
    console.log("👑 Atualizando status social...");
    
    // Atualizar aparência no card
    const appMod = document.getElementById('app-mod');
    if (appMod) {
        const valor = DASHBOARD_GURPS.caracteristicas.aparencia;
        appMod.textContent = valor >= 0 ? `+${valor}` : `${valor}`;
        appMod.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
    }
    
    // Atualizar riqueza
    const wealthLevel = document.getElementById('wealth-level');
    const wealthCost = document.getElementById('wealth-cost') || document.querySelector('.wealth-cost');
    
    if (wealthLevel || wealthCost) {
        const niveisRiqueza = {
            '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
            '0': 'Médio', '10': 'Confortável', '20': 'Rico',
            '30': 'Muito Rico', '50': 'Podre de Rico'
        };
        
        const valor = DASHBOARD_GURPS.caracteristicas.riqueza;
        const nivel = niveisRiqueza[valor.toString()] || 'Médio';
        const sinal = valor >= 0 ? '+' : '';
        
        if (wealthLevel) wealthLevel.textContent = nivel;
        if (wealthCost) {
            wealthCost.textContent = `[${sinal}${valor} pts]`;
            wealthCost.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
        }
    }
    
    // Atualizar aparência física
    const physAppearance = document.getElementById('phys-appearance');
    if (physAppearance) {
        const niveisAparencia = {
            '-24': 'Horrendo', '-20': 'Monstruoso', '-16': 'Hediondo',
            '-8': 'Feio', '-4': 'Sem Atrativos', '0': 'Comum',
            '4': 'Atraente', '12': 'Elegante', '16': 'Muito Elegante', '20': 'Lindo'
        };
        const valor = DASHBOARD_GURPS.caracteristicas.aparencia;
        const nivel = niveisAparencia[valor.toString()] || 'Comum';
        const sinal = valor >= 0 ? '+' : '';
        physAppearance.textContent = `${nivel} [${sinal}${valor} pts]`;
    }
    
    // Atualizar modificador de reação
    const reactionTotal = document.getElementById('reaction-total');
    if (reactionTotal) {
        const total = DASHBOARD_GURPS.caracteristicas.aparencia;
        reactionTotal.textContent = total >= 0 ? `+${total}` : `${total}`;
    }
}

function atualizarResumo() {
    console.log("📋 Atualizando resumo...");
    
    // Contar vantagens/desvantagens
    let vantagensCount = 0;
    let desvantagensCount = 0;
    
    if (DASHBOARD_GURPS.caracteristicas.aparencia > 0) vantagensCount++;
    else if (DASHBOARD_GURPS.caracteristicas.aparencia < 0) desvantagensCount++;
    
    if (DASHBOARD_GURPS.caracteristicas.riqueza > 0) vantagensCount++;
    else if (DASHBOARD_GURPS.caracteristicas.riqueza < 0) desvantagensCount++;
    
    // Atualizar resumo
    atualizarElementoDisplay('sum-advantages', vantagensCount);
    atualizarElementoDisplay('sum-disadvantages', desvantagensCount);
    atualizarElementoDisplay('sum-skills', DASHBOARD_GURPS.pontos.pericias > 0 ? '1+' : '0');
    atualizarElementoDisplay('sum-spells', DASHBOARD_GURPS.pontos.magias > 0 ? '1+' : '0');
}

// ===========================================
// VERIFICAÇÃO DE LIMITES
// ===========================================

function verificarLimitesDesvantagens() {
    const pontosDis = document.getElementById('points-dis');
    if (!pontosDis) return;
    
    const limite = DASHBOARD_GURPS.pontos.limiteDesvantagens || 75;
    
    if (DASHBOARD_GURPS.pontos.desvantagens > limite) {
        pontosDis.classList.add('limite-excedido');
        pontosDis.title = `Limite excedido! (${DASHBOARD_GURPS.pontos.desvantagens}/${limite})`;
        pontosDis.style.color = '#ff0000';
    } else {
        pontosDis.classList.remove('limite-excedido');
        pontosDis.title = `Desvantagens: ${DASHBOARD_GURPS.pontos.desvantagens}/${limite}`;
        pontosDis.style.color = '';
    }
}

// ===========================================
// MONITORAMENTO
// ===========================================

function iniciarMonitoramentoDashboard() {
    console.log("👁️ Iniciando monitoramento da dashboard...");
    
    let valoresAnteriores = {
        aparencia: null,
        riqueza: null,
        atributos: null
    };
    
    // Monitorar mudanças a cada 2 segundos
    const intervaloMonitor = setInterval(() => {
        if (DASHBOARD_GURPS.controle.calculando) return;
        
        const aparenciaAtual = pegarValorAparencia();
        const riquezaAtual = pegarValorRiqueza();
        const atributosAtual = pegarValorAtributos();
        
        let mudou = false;
        
        if (aparenciaAtual !== valoresAnteriores.aparencia) {
            valoresAnteriores.aparencia = aparenciaAtual;
            mudou = true;
            console.log("🔄 Aparência mudou:", aparenciaAtual);
        }
        
        if (riquezaAtual !== valoresAnteriores.riqueza) {
            valoresAnteriores.riqueza = riquezaAtual;
            mudou = true;
            console.log("🔄 Riqueza mudou:", riquezaAtual);
        }
        
        if (atributosAtual !== valoresAnteriores.atributos) {
            valoresAnteriores.atributos = atributosAtual;
            mudou = true;
            console.log("🔄 Atributos mudaram:", atributosAtual);
        }
        
        if (mudou) {
            calcularPontosCompletos();
        }
    }, 2000);
    
    // Monitorar localStorage (entre abas)
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.includes('gurps')) {
            console.log(`📡 Storage alterado: ${e.key} = ${e.newValue}`);
            setTimeout(() => calcularPontosCompletos(), 500);
        }
    });
    
    console.log("✅ Monitoramento iniciado");
}

// ===========================================
// SALVAR/CARREGAR ESTADO
// ===========================================

function salvarEstadoDashboard() {
    try {
        localStorage.setItem('dashboard_gurps_estado', JSON.stringify(DASHBOARD_GURPS));
    } catch (error) {
        console.warn("⚠️ Não foi possível salvar estado:", error);
    }
}

function carregarEstadoDashboard() {
    try {
        const dados = localStorage.getItem('dashboard_gurps_estado');
        if (dados) {
            const parsed = JSON.parse(dados);
            Object.assign(DASHBOARD_GURPS, parsed);
            console.log("✅ Estado da dashboard carregado");
            return true;
        }
    } catch (error) {
        console.warn("⚠️ Não foi possível carregar estado:", error);
    }
    return false;
}

// ===========================================
// INICIALIZAÇÃO COMPLETA
// ===========================================

function inicializarDashboardCompleto() {
    if (DASHBOARD_GURPS.controle.inicializado) {
        console.log("⚠️ Dashboard já está inicializado");
        return;
    }
    
    console.log("=".repeat(50));
    console.log("🚀 INICIALIZANDO DASHBOARD GURPS COMPLETO");
    console.log("=".repeat(50));
    
    // 1. Carregar estado salvo
    carregarEstadoDashboard();
    
    // 2. Configurar listeners dos inputs da dashboard
    configurarListenersDashboard();
    
    // 3. Primeiro cálculo completo
    setTimeout(() => {
        calcularPontosCompletos(true);
    }, 1000);
    
    // 4. Iniciar monitoramento
    setTimeout(() => {
        iniciarMonitoramentoDashboard();
    }, 2000);
    
    // 5. Configurar eventos de abas
    configurarEventosAbas();
    
    DASHBOARD_GURPS.controle.inicializado = true;
    
    console.log("=".repeat(50));
    console.log("✅ DASHBOARD GURPS INICIALIZADO COM SUCESSO!");
    console.log("=".repeat(50));
}

function configurarListenersDashboard() {
    console.log("🔧 Configurando listeners da dashboard...");
    
    // Pontos iniciais
    const startPoints = document.getElementById('start-points');
    if (startPoints) {
        startPoints.value = DASHBOARD_GURPS.pontos.iniciais;
        startPoints.addEventListener('change', function() {
            DASHBOARD_GURPS.pontos.iniciais = parseInt(this.value) || 200;
            calcularPontosCompletos();
        });
    }
    
    // Limite desvantagens
    const disLimit = document.getElementById('dis-limit');
    if (disLimit) {
        disLimit.value = -DASHBOARD_GURPS.pontos.limiteDesvantagens;
        disLimit.addEventListener('change', function() {
            DASHBOARD_GURPS.pontos.limiteDesvantagens = Math.abs(parseInt(this.value) || 75);
            verificarLimitesDesvantagens();
        });
    }
    
    console.log("✅ Listeners configurados");
}

function configurarEventosAbas() {
    // Quando clicar na aba dashboard
    document.addEventListener('click', function(e) {
        if (e.target.closest('#tabDashboard') || e.target.closest('[data-tab="dashboard"]')) {
            console.log("🎯 Aba dashboard ativada - recalculando...");
            setTimeout(() => calcularPontosCompletos(true), 300);
        }
    });
}

// ===========================================
// FUNÇÕES GLOBAIS PARA TESTE
// ===========================================

window.dashboardTestar = function() {
    console.log("🧪 TESTE COMPLETO DO DASHBOARD");
    console.log("=".repeat(40));
    
    console.log("📦 localStorage aparência:", localStorage.getItem('gurps_pontos_aparencia'));
    console.log("📦 localStorage riqueza:", localStorage.getItem('gurps_pontos_riqueza'));
    console.log("📦 localStorage atributos:", localStorage.getItem('gurps_atributos'));
    
    console.log("🎯 Estado atual:");
    console.log("- Atributos:", DASHBOARD_GURPS.pontos.atributos);
    console.log("- Aparência:", DASHBOARD_GURPS.caracteristicas.aparencia);
    console.log("- Riqueza:", DASHBOARD_GURPS.caracteristicas.riqueza);
    console.log("- Vantagens:", DASHBOARD_GURPS.pontos.vantagens);
    console.log("- Desvantagens:", DASHBOARD_GURPS.pontos.desvantagens);
    console.log("- SALDO:", DASHBOARD_GURPS.pontos.saldo);
    
    console.log("=".repeat(40));
    
    // Forçar recálculo
    calcularPontosCompletos(true);
    
    return DASHBOARD_GURPS.pontos.saldo;
};

window.dashboardRecalcular = function() {
    return calcularPontosCompletos(true);
};

window.dashboardEstado = function() {
    return JSON.parse(JSON.stringify(DASHBOARD_GURPS));
};

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - inicializando dashboard...");
    
    // Esperar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        inicializarDashboardCompleto();
    }, 1500);
});

// Fallback de inicialização
setTimeout(() => {
    if (!DASHBOARD_GURPS.controle.inicializado) {
        console.log("⏰ Fallback de inicialização...");
        inicializarDashboardCompleto();
    }
}, 3000);

// ===========================================
// MENSAGEM DE CARREGAMENTO
// ===========================================

console.log("🎮 DASHBOARD GURPS COMPLETO CARREGADO");
console.log("👉 Use dashboardTestar() para testar");
console.log("👉 Use dashboardRecalcular() para forçar recálculo");
console.log("👉 Use dashboardEstado() para ver estado completo");

// ===========================================
// FIM DO ARQUIVO
// ===========================================