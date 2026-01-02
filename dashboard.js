// ===========================================
// DASHBOARD.JS - Sistema Central de Controle
// Versão Corrigida e Funcional
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
    
    // Atributos
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    PV: 10,
    PF: 10,
    Vontade: 10,
    Percepcao: 10
};

// Cache de elementos
let elementos = {};

// ===========================================
// INICIALIZAÇÃO
// ===========================================

function inicializarDashboard() {
    console.log('📊 Inicializando dashboard...');
    
    // Cache dos elementos importantes
    cacheElementos();
    
    // Configurar event listeners
    configurarEventListeners();
    
    // Configurar upload de foto
    configurarUploadFoto();
    
    // Carregar estado salvo
    carregarEstadoDashboard();
    
    // Primeira sincronização
    setTimeout(() => {
        sincronizarAtributos();
        sincronizarFinancas();
        sincronizarContadores();
        atualizarDashboard();
    }, 500);
    
    // Sincronizar periodicamente
    setInterval(atualizarDashboard, 3000);
    
    console.log('✅ Dashboard inicializado');
}

function cacheElementos() {
    elementos = {
        // Sistema de Pontos
        startPoints: document.getElementById('start-points'),
        disLimit: document.getElementById('dis-limit'),
        totalPointsSpent: document.getElementById('total-points-spent'),
        pointsAttr: document.getElementById('points-attr'),
        pointsAdv: document.getElementById('points-adv'),
        pointsDis: document.getElementById('points-dis'),
        pointsPec: document.getElementById('points-pec'),
        pointsSkills: document.getElementById('points-skills'),
        pointsSpells: document.getElementById('points-spells'),
        pointsTech: document.getElementById('points-tech'),
        pointsBalance: document.getElementById('points-balance'),
        pointsStatusIndicator: document.getElementById('points-status-indicator'),
        pointsStatusText: document.getElementById('points-status-text'),
        
        // Status Social
        statusValue: document.getElementById('status-value'),
        repValue: document.getElementById('rep-value'),
        appValue: document.getElementById('app-value'),
        statusPointsCompact: document.getElementById('status-points-compact'),
        reputacaoPointsCompact: document.getElementById('reputacao-points-compact'),
        aparenciaPointsCompact: document.getElementById('aparencia-points-compact'),
        socialTotalPoints: document.getElementById('social-total-points'),
        reactionTotalCompact: document.getElementById('reaction-total-compact'),
        
        // Atributos
        summarySt: document.getElementById('summary-st'),
        summaryDx: document.getElementById('summary-dx'),
        summaryIq: document.getElementById('summary-iq'),
        summaryHt: document.getElementById('summary-ht'),
        summaryHp: document.getElementById('summary-hp'),
        summaryFp: document.getElementById('summary-fp'),
        summaryWill: document.getElementById('summary-will'),
        summaryPer: document.getElementById('summary-per'),
        quickHp: document.getElementById('quick-hp'),
        quickFp: document.getElementById('quick-fp'),
        
        // Finanças
        currentMoney: document.getElementById('current-money'),
        wealthLevelDisplay: document.getElementById('wealth-level-display'),
        financeStatus: document.getElementById('finance-status'),
        equipWeight: document.getElementById('equip-weight'),
        encLevelDisplay: document.getElementById('enc-level-display'),
        limitLight: document.getElementById('limit-light'),
        limitMedium: document.getElementById('limit-medium'),
        limitHeavy: document.getElementById('limit-heavy'),
        limitExtreme: document.getElementById('limit-extreme'),
        
        // Contadores
        counterAdvantages: document.getElementById('counter-advantages'),
        counterDisadvantages: document.getElementById('counter-disadvantages'),
        counterSkills: document.getElementById('counter-skills'),
        counterSpells: document.getElementById('counter-spells'),
        counterLanguages: document.getElementById('counter-languages'),
        counterRelationships: document.getElementById('counter-relationships'),
        lastUpdateTime: document.getElementById('last-update-time'),
        
        // Foto
        photoPreview: document.getElementById('photo-preview'),
        charUpload: document.getElementById('char-upload'),
        
        // Inputs de identificação
        charName: document.getElementById('char-name'),
        charRace: document.getElementById('char-race'),
        charType: document.getElementById('char-type'),
        charPlayer: document.getElementById('char-player')
    };
}

function configurarEventListeners() {
    // Sistema de Pontos
    if (elementos.startPoints) {
        elementos.startPoints.addEventListener('change', function() {
            definirPontosIniciais(this.value);
        });
    }
    
    if (elementos.disLimit) {
        elementos.disLimit.addEventListener('change', function() {
            definirLimiteDesvantagens(this.value);
        });
    }
    
    // Botão de atualização
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', atualizarDashboard);
    }
    
    // Nome do personagem
    const charNameInput = document.getElementById('characterName');
    if (charNameInput) {
        charNameInput.addEventListener('input', function() {
            if (elementos.charName) {
                elementos.charName.value = this.value;
            }
        });
    }
}

// ===========================================
// SISTEMA DE PONTOS
// ===========================================

function definirPontosIniciais(valor) {
    if (valor < 0) valor = 0;
    if (valor > 1000) valor = 1000;
    
    dashboardState.pontosIniciais = parseInt(valor);
    if (elementos.startPoints) {
        elementos.startPoints.value = valor;
    }
    
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

function definirLimiteDesvantagens(valor) {
    if (valor > 0) valor = 0;
    
    dashboardState.limiteDesvantagens = parseInt(valor);
    if (elementos.disLimit) {
        elementos.disLimit.value = valor;
    }
    
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

function calcularPontosGastos() {
    // 1. Pontos em Atributos
    const pontosAtributos = calcularPontosAtributos();
    
    // 2. Pontos em Status Social
    const pontosStatus = dashboardState.status * 5;
    const pontosReputacao = dashboardState.reputacao * 5;
    const pontosAparencia = dashboardState.aparencia * 5;
    const pontosSociais = pontosStatus + pontosReputacao + pontosAparencia;
    
    // 3. Outros (valores estimados)
    const pontosVantagens = dashboardState.vantagens * 5;
    const pontosDesvantagens = dashboardState.desvantagens * -5;
    const pontosPericias = dashboardState.pericias * 2;
    const pontosMagias = dashboardState.magias * 3;
    const pontosPeculiaridades = 0; // Placeholder
    const pontosTecnicas = 0; // Placeholder
    
    // Atualizar display
    if (elementos.pointsAttr) elementos.pointsAttr.textContent = pontosAtributos;
    if (elementos.pointsAdv) elementos.pointsAdv.textContent = pontosVantagens;
    if (elementos.pointsDis) elementos.pointsDis.textContent = pontosDesvantagens;
    if (elementos.pointsSkills) elementos.pointsSkills.textContent = pontosPericias;
    if (elementos.pointsSpells) elementos.pointsSpells.textContent = pontosMagias;
    if (elementos.pointsPec) elementos.pointsPec.textContent = pontosPeculiaridades;
    if (elementos.pointsTech) elementos.pointsTech.textContent = pontosTecnicas;
    
    // Calcular total gasto
    const totalGasto = pontosAtributos + pontosVantagens + pontosDesvantagens + 
                      pontosPericias + pontosMagias + pontosSociais +
                      pontosPeculiaridades + pontosTecnicas;
    
    if (elementos.totalPointsSpent) {
        elementos.totalPointsSpent.textContent = `${totalGasto} pts`;
    }
    
    // Calcular saldo
    const saldo = dashboardState.pontosIniciais - totalGasto;
    if (elementos.pointsBalance) {
        elementos.pointsBalance.textContent = saldo;
    }
    
    // Atualizar status do saldo
    atualizarStatusSaldo(saldo);
    
    return totalGasto;
}

function calcularPontosAtributos() {
    const ST = dashboardState.ST || 10;
    const DX = dashboardState.DX || 10;
    const IQ = dashboardState.IQ || 10;
    const HT = dashboardState.HT || 10;
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    return custoST + custoDX + custoIQ + custoHT;
}

function atualizarStatusSaldo(saldo) {
    if (!elementos.pointsStatusIndicator || !elementos.pointsStatusText) return;
    
    if (saldo > 0) {
        elementos.pointsStatusIndicator.style.backgroundColor = '#4CAF50';
        elementos.pointsStatusText.textContent = 'Personagem válido - pontos disponíveis';
        elementos.pointsStatusText.style.color = '#4CAF50';
    } else if (saldo === 0) {
        elementos.pointsStatusIndicator.style.backgroundColor = '#FFC107';
        elementos.pointsStatusText.textContent = 'Personagem completo - todos pontos usados';
        elementos.pointsStatusText.style.color = '#FFC107';
    } else {
        elementos.pointsStatusIndicator.style.backgroundColor = '#f44336';
        elementos.pointsStatusText.textContent = 'ATENÇÃO: Pontos excedidos!';
        elementos.pointsStatusText.style.color = '#f44336';
    }
}

// ===========================================
// STATUS SOCIAL
// ===========================================

function ajustarModificador(tipo, valor) {
    console.log(`Ajustando ${tipo} por ${valor}`);
    
    let currentValue;
    let currentElement;
    
    switch(tipo) {
        case 'status':
            currentElement = elementos.statusValue;
            currentValue = parseInt(currentElement?.textContent || 0);
            break;
        case 'reputacao':
            currentElement = elementos.repValue;
            currentValue = parseInt(currentElement?.textContent || 0);
            break;
        case 'aparencia':
            currentElement = elementos.appValue;
            currentValue = parseInt(currentElement?.textContent || 0);
            break;
        default:
            console.error('Tipo inválido:', tipo);
            return;
    }
    
    let newValue = currentValue + valor;
    
    // Limites
    if (tipo === 'status') {
        if (newValue < -5) newValue = -5;
        if (newValue > 8) newValue = 8;
    } else if (tipo === 'reputacao' || tipo === 'aparencia') {
        if (newValue < -4) newValue = -4;
        if (newValue > 4) newValue = 4;
    }
    
    // Atualizar estado
    dashboardState[tipo] = newValue;
    
    // Atualizar display
    if (currentElement) {
        currentElement.textContent = newValue;
    }
    
    // Calcular pontos
    const pontos = newValue * 5;
    
    // Atualizar pontos compactos
    switch(tipo) {
        case 'status':
            if (elementos.statusPointsCompact) {
                elementos.statusPointsCompact.textContent = `[${pontos}]`;
            }
            break;
        case 'reputacao':
            if (elementos.reputacaoPointsCompact) {
                elementos.reputacaoPointsCompact.textContent = `[${pontos}]`;
            }
            break;
        case 'aparencia':
            if (elementos.aparenciaPointsCompact) {
                elementos.aparenciaPointsCompact.textContent = `[${pontos}]`;
            }
            break;
    }
    
    // Atualizar total de pontos sociais
    const totalSocial = (dashboardState.status + dashboardState.reputacao + dashboardState.aparencia) * 5;
    if (elementos.socialTotalPoints) {
        elementos.socialTotalPoints.textContent = `${Math.abs(totalSocial)} pts`;
    }
    
    // Atualizar modificador total de reação
    const reacaoTotal = dashboardState.status + dashboardState.reputacao + dashboardState.aparencia;
    const display = reacaoTotal >= 0 ? `+${reacaoTotal}` : reacaoTotal.toString();
    if (elementos.reactionTotalCompact) {
        elementos.reactionTotalCompact.textContent = display;
    }
    
    // Recalcular sistema de pontos
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

// ===========================================
// SINCRONIZAÇÃO COM ATRIBUTOS
// ===========================================

function sincronizarAtributos() {
    console.log('🔄 Sincronizando atributos...');
    
    // Tenta múltiplas abordagens para pegar atributos
    let dadosAtributos = null;
    
    // Abordagem 1: Objeto global do atributos.js
    if (typeof personagemAtributos !== 'undefined') {
        console.log('✅ Encontrado personagemAtributos global');
        dadosAtributos = personagemAtributos;
    } 
    // Abordagem 2: Inputs na página
    else if (document.getElementById('ST')) {
        console.log('✅ Encontrado atributos nos inputs');
        dadosAtributos = {
            ST: parseInt(document.getElementById('ST').value) || 10,
            DX: parseInt(document.getElementById('DX').value) || 10,
            IQ: parseInt(document.getElementById('IQ').value) || 10,
            HT: parseInt(document.getElementById('HT').value) || 10,
            bonus: {
                PV: parseInt(document.getElementById('bonusPV')?.value) || 0,
                PF: parseInt(document.getElementById('bonusPF')?.value) || 0,
                Vontade: parseInt(document.getElementById('bonusVontade')?.value) || 0,
                Percepcao: parseInt(document.getElementById('bonusPercepcao')?.value) || 0,
                Deslocamento: parseFloat(document.getElementById('bonusDeslocamento')?.value) || 0
            }
        };
    }
    // Abordagem 3: localStorage
    else {
        try {
            const dados = localStorage.getItem('gurps_atributos');
            if (dados) {
                dadosAtributos = JSON.parse(dados);
                console.log('✅ Atributos carregados do localStorage');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao ler atributos do localStorage:', e);
        }
    }
    
    if (dadosAtributos) {
        // Extrair valores
        if (dadosAtributos.atributos) {
            // Formato do atributos.js
            dashboardState.ST = dadosAtributos.atributos.ST || 10;
            dashboardState.DX = dadosAtributos.atributos.DX || 10;
            dashboardState.IQ = dadosAtributos.atributos.IQ || 10;
            dashboardState.HT = dadosAtributos.atributos.HT || 10;
        } else {
            // Formato direto
            dashboardState.ST = dadosAtributos.ST || 10;
            dashboardState.DX = dadosAtributos.DX || 10;
            dashboardState.IQ = dadosAtributos.IQ || 10;
            dashboardState.HT = dadosAtributos.HT || 10;
        }
        
        // Calcular valores secundários
        const bonus = dadosAtributos.bonus || {};
        const pvBase = dashboardState.ST;
        const pvBonus = bonus.PV || 0;
        dashboardState.PV = Math.max(pvBase + pvBonus, 1);
        
        const pfBase = dashboardState.HT;
        const pfBonus = bonus.PF || 0;
        dashboardState.PF = Math.max(pfBase + pfBonus, 1);
        
        const vontadeBase = dashboardState.IQ;
        const vontadeBonus = bonus.Vontade || 0;
        dashboardState.Vontade = Math.max(vontadeBase + vontadeBonus, 1);
        
        const percepcaoBase = dashboardState.IQ;
        const percepcaoBonus = bonus.Percepcao || 0;
        dashboardState.Percepcao = Math.max(percepcaoBase + percepcaoBonus, 1);
        
        atualizarDashboardAtributos();
        return true;
    }
    
    console.warn('⚠️ Não foi possível encontrar dados de atributos');
    return false;
}

function atualizarDashboardAtributos() {
    console.log('📊 Atualizando atributos no dashboard:', {
        ST: dashboardState.ST,
        DX: dashboardState.DX,
        IQ: dashboardState.IQ,
        HT: dashboardState.HT,
        PV: dashboardState.PV,
        PF: dashboardState.PF
    });
    
    // Atualizar resumo de atributos
    if (elementos.summarySt) elementos.summarySt.textContent = dashboardState.ST;
    if (elementos.summaryDx) elementos.summaryDx.textContent = dashboardState.DX;
    if (elementos.summaryIq) elementos.summaryIq.textContent = dashboardState.IQ;
    if (elementos.summaryHt) elementos.summaryHt.textContent = dashboardState.HT;
    
    // Atualizar valores secundários
    if (elementos.summaryHp) elementos.summaryHp.textContent = dashboardState.PV;
    if (elementos.summaryFp) elementos.summaryFp.textContent = dashboardState.PF;
    if (elementos.summaryWill) elementos.summaryWill.textContent = dashboardState.Vontade;
    if (elementos.summaryPer) elementos.summaryPer.textContent = dashboardState.Percepcao;
    
    // Atualizar status rápido
    if (elementos.quickHp) elementos.quickHp.textContent = dashboardState.PV;
    if (elementos.quickFp) elementos.quickFp.textContent = dashboardState.PF;
    
    // Calcular limites de carga
    calcularLimitesCarga(dashboardState.ST);
    
    // Recalcular sistema de pontos
    atualizarSistemaPontos();
}

function calcularLimitesCarga(ST) {
    // Tabela simplificada de cargas
    const cargasTable = {
        1: { leve: 0.2, media: 0.3, pesada: 0.6, extrema: 1.0 },
        2: { leve: 0.8, media: 1.2, pesada: 2.4, extrema: 4.0 },
        3: { leve: 1.8, media: 2.7, pesada: 5.4, extrema: 9.0 },
        4: { leve: 3.2, media: 4.8, pesada: 9.6, extrema: 16.0 },
        5: { leve: 5.0, media: 7.5, pesada: 15.0, extrema: 25.5 },
        6: { leve: 7.2, media: 10.8, pesada: 21.6, extrema: 36.0 },
        7: { leve: 9.8, media: 14.7, pesada: 29.4, extrema: 49.0 },
        8: { leve: 13.0, media: 19.5, pesada: 39.0, extrema: 65.0 },
        9: { leve: 16.0, media: 24.0, pesada: 48.0, extrema: 80.0 },
        10: { leve: 20.0, media: 30.0, pesada: 60.0, extrema: 100.0 },
        11: { leve: 24.0, media: 36.0, pesada: 72.0, extrema: 120.0 },
        12: { leve: 29.0, media: 43.5, pesada: 87.0, extrema: 145.0 },
        13: { leve: 34.0, media: 51.0, pesada: 102.0, extrema: 170.0 },
        14: { leve: 39.0, media: 58.5, pesada: 117.0, extrema: 195.0 },
        15: { leve: 45.0, media: 67.5, pesada: 135.0, extrema: 225.0 },
        16: { leve: 51.0, media: 76.5, pesada: 153.0, extrema: 255.0 },
        17: { leve: 58.0, media: 87.0, pesada: 174.0, extrema: 294.0 },
        18: { leve: 65.0, media: 97.5, pesada: 195.0, extrema: 325.0 },
        19: { leve: 72.0, media: 108.0, pesada: 216.0, extrema: 360.0 },
        20: { leve: 80.0, media: 120.0, pesada: 240.0, extrema: 400.0 }
    };
    
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;
    
    const cargas = cargasTable[stKey] || cargasTable[10];
    
    // Atualizar display
    if (elementos.limitLight) elementos.limitLight.textContent = cargas.leve.toFixed(1) + ' kg';
    if (elementos.limitMedium) elementos.limitMedium.textContent = cargas.media.toFixed(1) + ' kg';
    if (elementos.limitHeavy) elementos.limitHeavy.textContent = cargas.pesada.toFixed(1) + ' kg';
    if (elementos.limitExtreme) elementos.limitExtreme.textContent = cargas.extrema.toFixed(1) + ' kg';
    
    // Calcular nível de carga atual
    atualizarNivelCarga(dashboardState.pesoEquipamentos, cargas);
}

function atualizarNivelCarga(peso, limites) {
    if (!elementos.encLevelDisplay) return;
    
    elementos.encLevelDisplay.classList.remove('safe', 'light', 'medium', 'heavy', 'extreme');
    
    if (peso <= 0) {
        elementos.encLevelDisplay.textContent = 'Nenhuma';
        elementos.encLevelDisplay.classList.add('safe');
    } else if (peso <= limites.leve) {
        elementos.encLevelDisplay.textContent = 'Leve';
        elementos.encLevelDisplay.classList.add('light');
    } else if (peso <= limites.media) {
        elementos.encLevelDisplay.textContent = 'Média';
        elementos.encLevelDisplay.classList.add('medium');
    } else if (peso <= limites.pesada) {
        elementos.encLevelDisplay.textContent = 'Pesada';
        elementos.encLevelDisplay.classList.add('heavy');
    } else {
        elementos.encLevelDisplay.textContent = 'Extrema';
        elementos.encLevelDisplay.classList.add('extreme');
    }
}

// ===========================================
// FINANÇAS
// ===========================================

function sincronizarFinancas() {
    console.log('💰 Sincronizando finanças...');
    
    // Tentar pegar dados do sistema de equipamentos
    try {
        // Abordagem 1: Sistema de equipamentos
        if (typeof window.dinheiroAtual !== 'undefined') {
            dashboardState.dinheiro = window.dinheiroAtual || 0;
        }
        // Abordagem 2: localStorage
        else {
            const dados = localStorage.getItem('gurps_equipamentos');
            if (dados) {
                const equipData = JSON.parse(dados);
                dashboardState.dinheiro = equipData.dinheiro || 0;
                dashboardState.pesoEquipamentos = equipData.pesoTotal || 0;
            }
        }
    } catch (e) {
        console.warn('⚠️ Erro ao sincronizar finanças:', e);
    }
    
    atualizarFinancas();
}

function atualizarFinancas() {
    // Dinheiro
    if (elementos.currentMoney) {
        elementos.currentMoney.textContent = `$${dashboardState.dinheiro}`;
    }
    
    // Nível de riqueza
    const pontosRiqueza = calcularPontosRiqueza();
    if (elementos.wealthLevelDisplay) {
        elementos.wealthLevelDisplay.textContent = 
            `${dashboardState.nivelRiqueza} [${pontosRiqueza} pts]`;
    }
    
    // Peso
    if (elementos.equipWeight) {
        elementos.equipWeight.textContent = 
            `${dashboardState.pesoEquipamentos.toFixed(1)} kg`;
    }
    
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
    if (!elementos.financeStatus) return;
    
    if (dashboardState.dinheiro < 100) {
        elementos.financeStatus.textContent = 'Baixo';
        elementos.financeStatus.style.backgroundColor = '#f44336';
    } else if (dashboardState.dinheiro < 1000) {
        elementos.financeStatus.textContent = 'Médio';
        elementos.financeStatus.style.backgroundColor = '#FFC107';
    } else {
        elementos.financeStatus.textContent = 'Alto';
        elementos.financeStatus.style.backgroundColor = '#4CAF50';
    }
}

// ===========================================
// CONTADORES
// ===========================================

function sincronizarContadores() {
    console.log('🔢 Sincronizando contadores...');
    
    // Aqui você pode sincronizar com outros sistemas
    // Por enquanto, mantém os valores atuais
    
    atualizarContadores();
}

function atualizarContadores() {
    // Atualizar todos os contadores
    if (elementos.counterAdvantages) elementos.counterAdvantages.textContent = dashboardState.vantagens;
    if (elementos.counterDisadvantages) elementos.counterDisadvantages.textContent = dashboardState.desvantagens;
    if (elementos.counterSkills) elementos.counterSkills.textContent = dashboardState.pericias;
    if (elementos.counterSpells) elementos.counterSpells.textContent = dashboardState.magias;
    if (elementos.counterLanguages) elementos.counterLanguages.textContent = dashboardState.idiomas;
    if (elementos.counterRelationships) elementos.counterRelationships.textContent = dashboardState.relacionamentos;
    
    // Atualizar horário da última atualização
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    if (elementos.lastUpdateTime) {
        elementos.lastUpdateTime.textContent = timeString;
    }
}

// ===========================================
// UPLOAD DE FOTO
// ===========================================

function configurarUploadFoto() {
    if (!elementos.charUpload || !elementos.photoPreview) {
        console.warn('⚠️ Elementos de foto não encontrados');
        return;
    }
    
    elementos.charUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Limpar placeholder
                elementos.photoPreview.innerHTML = '';
                
                // Criar imagem
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = "Foto do Personagem";
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                
                // Adicionar à preview
                elementos.photoPreview.appendChild(img);
                
                // Adicionar botão de remover
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.className = 'remove-photo-btn';
                removeBtn.title = 'Remover foto';
                removeBtn.onclick = function(e) {
                    e.stopPropagation();
                    elementos.photoPreview.innerHTML = `
                        <div class="photo-placeholder">
                            <i class="fas fa-user-circle"></i>
                            <span>Foto do Personagem</span>
                            <small>Opcional</small>
                        </div>`;
                    elementos.charUpload.value = '';
                };
                
                elementos.photoPreview.appendChild(removeBtn);
                
                // Salvar no estado
                salvarEstadoDashboard();
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Clique na área de upload
    if (elementos.photoPreview.parentElement) {
        elementos.photoPreview.parentElement.addEventListener('click', function(e) {
            if (!e.target.closest('.remove-photo-btn')) {
                elementos.charUpload.click();
            }
        });
    }
}

// ===========================================
// FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
// ===========================================

function atualizarSistemaPontos() {
    calcularPontosGastos();
}

function atualizarDashboard() {
    console.log('🔄 Atualizando dashboard...');
    
    // Sincronizar com todos os sistemas
    sincronizarAtributos();
    sincronizarFinancas();
    sincronizarContadores();
    
    // Atualizar todos os sistemas
    atualizarSistemaPontos();
    atualizarFinancas();
    atualizarContadores();
    
    // Sincronizar nome do personagem
    const charNameInput = document.getElementById('characterName');
    if (charNameInput && elementos.charName) {
        elementos.charName.value = charNameInput.value;
    }
    
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
        console.log('💾 Estado do dashboard salvo');
    } catch (error) {
        console.warn('Não foi possível salvar dashboard:', error);
    }
}

function carregarEstadoDashboard() {
    try {
        const dados = localStorage.getItem('gurps_dashboard');
        if (dados) {
            const savedState = JSON.parse(dados);
            
            // Mesclar com estado atual
            Object.keys(savedState).forEach(key => {
                if (dashboardState.hasOwnProperty(key)) {
                    dashboardState[key] = savedState[key];
                }
            });
            
            console.log('📂 Estado do dashboard carregado');
            
            // Restaurar configurações
            if (elementos.startPoints) {
                elementos.startPoints.value = dashboardState.pontosIniciais;
            }
            if (elementos.disLimit) {
                elementos.disLimit.value = dashboardState.limiteDesvantagens;
            }
            
            // Restaurar status social
            if (elementos.statusValue) elementos.statusValue.textContent = dashboardState.status;
            if (elementos.repValue) elementos.repValue.textContent = dashboardState.reputacao;
            if (elementos.appValue) elementos.appValue.textContent = dashboardState.aparencia;
            
            // Atualizar pontos sociais
            if (elementos.statusPointsCompact) {
                elementos.statusPointsCompact.textContent = `[${dashboardState.status * 5}]`;
            }
            if (elementos.reputacaoPointsCompact) {
                elementos.reputacaoPointsCompact.textContent = `[${dashboardState.reputacao * 5}]`;
            }
            if (elementos.aparenciaPointsCompact) {
                elementos.aparenciaPointsCompact.textContent = `[${dashboardState.aparencia * 5}]`;
            }
            
            // Atualizar modificador total de reação
            const reacaoTotal = dashboardState.status + dashboardState.reputacao + dashboardState.aparencia;
            const display = reacaoTotal >= 0 ? `+${reacaoTotal}` : reacaoTotal.toString();
            if (elementos.reactionTotalCompact) {
                elementos.reactionTotalCompact.textContent = display;
            }
            
            if (elementos.socialTotalPoints) {
                elementos.socialTotalPoints.textContent = `${Math.abs(reacaoTotal * 5)} pts`;
            }
            
            return true;
        }
    } catch (error) {
        console.warn('Não foi possível carregar dashboard:', error);
    }
    return false;
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

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba dashboard
    setTimeout(() => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            inicializarDashboard();
        } else if (document.querySelector('.dashboard-gurps')) {
            inicializarDashboard();
        }
    }, 1000);
});

// Observar mudanças de aba
document.addEventListener('tabChange', function(e) {
    if (e.detail && e.detail.tab === 'dashboard') {
        setTimeout(inicializarDashboard, 100);
    }
});