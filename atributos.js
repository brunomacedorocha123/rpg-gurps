// ===========================================
// ATRIBUTOS.JS - Sistema Completo GURPS com Firebase
// VERSÃO CORRIGIDA: Firebase, Pontos e Cargas
// ===========================================

// Tabela de dano base
const danoTable = {
    1: { gdp: "1d-6", geb: "1d-5" },
    2: { gdp: "1d-6", geb: "1d-5" },
    3: { gdp: "1d-5", geb: "1d-4" },
    4: { gdp: "1d-5", geb: "1d-4" },
    5: { gdp: "1d-4", geb: "1d-3" },
    6: { gdp: "1d-4", geb: "1d-3" },
    7: { gdp: "1d-3", geb: "1d-2" },
    8: { gdp: "1d-3", geb: "1d-2" },
    9: { gdp: "1d-2", geb: "1d-1" },
    10: { gdp: "1d-2", geb: "1d" },
    11: { gdp: "1d-1", geb: "1d+1" },
    12: { gdp: "1d", geb: "1d+2" },
    13: { gdp: "1d", geb: "2d-1" },
    14: { gdp: "1d", geb: "2d" },
    15: { gdp: "1d+1", geb: "2d+1" },
    16: { gdp: "1d+1", geb: "2d+2" },
    17: { gdp: "1d+2", geb: "3d-1" },
    18: { gdp: "1d+2", geb: "3d" },
    19: { gdp: "2d-1", geb: "3d+1" },
    20: { gdp: "2d-1", geb: "3d+2" },
    21: { gdp: "2d", geb: "4d-1" },
    22: { gdp: "2d", geb: "4d" },
    23: { gdp: "2d+1", geb: "4d+1" },
    24: { gdp: "2d+1", geb: "4d+2" },
    25: { gdp: "2d+2", geb: "5d-1" },
    26: { gdp: "2d+2", geb: "5d" },
    27: { gdp: "3d-1", geb: "5d+1" },
    28: { gdp: "3d-1", geb: "5d+1" },
    29: { gdp: "3d", geb: "5d+2" },
    30: { gdp: "3d", geb: "5d+2" },
    31: { gdp: "3d+1", geb: "6d-1" },
    32: { gdp: "3d+1", geb: "6d-1" },
    33: { gdp: "3d+2", geb: "6d" },
    34: { gdp: "3d+2", geb: "6d" },
    35: { gdp: "4d-1", geb: "6d+1" },
    36: { gdp: "4d-1", geb: "6d+1" },
    37: { gdp: "4d", geb: "6d+2" },
    38: { gdp: "4d", geb: "6d+2" },
    39: { gdp: "4d+1", geb: "7d-1" },
    40: { gdp: "4d+1", geb: "7d-1" }
};

// Tabela de cargas (em kg) - CORRIGIDA
const cargasTable = {
    1: { nenhuma: 1.0, leve: 2.0, media: 3.0, pesada: 6.0, muitoPesada: 10.0 },
    2: { nenhuma: 4.0, leve: 8.0, media: 12.0, pesada: 24.0, muitoPesada: 40.0 },
    3: { nenhuma: 9.0, leve: 18.0, media: 27.0, pesada: 54.0, muitoPesada: 90.0 },
    4: { nenhuma: 16.0, leve: 32.0, media: 48.0, pesada: 96.0, muitoPesada: 160.0 },
    5: { nenhuma: 25.0, leve: 50.0, media: 75.0, pesada: 150.0, muitoPesada: 255.0 },
    6: { nenhuma: 36.0, leve: 72.0, media: 108.0, pesada: 216.0, muitoPesada: 360.0 },
    7: { nenhuma: 49.0, leve: 98.0, media: 147.0, pesada: 294.0, muitoPesada: 490.0 },
    8: { nenhuma: 65.0, leve: 130.0, media: 195.0, pesada: 390.0, muitoPesada: 650.0 },
    9: { nenhuma: 80.0, leve: 160.0, media: 240.0, pesada: 480.0, muitoPesada: 800.0 },
    10: { nenhuma: 100.0, leve: 200.0, media: 300.0, pesada: 600.0, muitoPesada: 1000.0 },
    11: { nenhuma: 120.0, leve: 240.0, media: 360.0, pesada: 720.0, muitoPesada: 1200.0 },
    12: { nenhuma: 145.0, leve: 290.0, media: 435.0, pesada: 870.0, muitoPesada: 1450.0 },
    13: { nenhuma: 170.0, leve: 340.0, media: 510.0, pesada: 1020.0, muitoPesada: 1700.0 },
    14: { nenhuma: 195.0, leve: 390.0, media: 585.0, pesada: 1170.0, muitoPesada: 1950.0 },
    15: { nenhuma: 225.0, leve: 450.0, media: 675.0, pesada: 1350.0, muitoPesada: 2250.0 },
    16: { nenhuma: 255.0, leve: 510.0, media: 765.0, pesada: 1530.0, muitoPesada: 2550.0 },
    17: { nenhuma: 290.0, leve: 580.0, media: 870.0, pesada: 1740.0, muitoPesada: 2940.0 },
    18: { nenhuma: 325.0, leve: 650.0, media: 975.0, pesada: 1950.0, muitoPesada: 3250.0 },
    19: { nenhuma: 360.0, leve: 720.0, media: 1080.0, pesada: 2160.0, muitoPesada: 3600.0 },
    20: { nenhuma: 400.0, leve: 800.0, media: 1200.0, pesada: 2400.0, muitoPesada: 4000.0 }
};

// Estado do personagem
let personagemAtributos = {
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    bonus: {
        PV: 0,
        PF: 0,
        Vontade: 0,
        Percepcao: 0,
        Deslocamento: 0
    }
};

// Variável para controle de nível de carga
let nivelCargaAtual = 'nenhuma';

// ===========================================
// FUNÇÕES PRINCIPAIS
// ===========================================

// Alterar atributos principais
function alterarAtributo(atributo, valor) {
    const input = document.getElementById(atributo);
    if (!input) return;

    let novoValor = parseInt(input.value) + valor;

    if (novoValor < 1) novoValor = 1;
    if (novoValor > 40) novoValor = 40;

    input.value = novoValor;
    personagemAtributos[atributo] = novoValor;

    input.classList.add('changed');
    setTimeout(() => input.classList.remove('changed'), 300);

    // Recalcular TUDO
    atualizarTudo();
}

// Ajustar atributos secundários
function ajustarSecundario(atributo, valor) {
    const input = document.getElementById('bonus' + atributo);
    if (!input) return;

    let novoValor;

    if (atributo === 'Deslocamento') {
        novoValor = parseFloat(input.value) + parseFloat(valor);
        novoValor = Math.round(novoValor * 100) / 100;
    } else {
        novoValor = parseInt(input.value) + parseInt(valor);
    }

    if (novoValor < -10) novoValor = -10;
    if (novoValor > 20) novoValor = 20;

    input.value = novoValor;
    personagemAtributos.bonus[atributo] = novoValor;

    input.classList.add('changed');
    setTimeout(() => input.classList.remove('changed'), 300);

    atualizarEstiloBonusInput(input, novoValor);
    atualizarTotaisSecundarios();
    atualizarStatus();
    
    // Salvar no Firebase
    salvarNoFirebase();
}

// ===========================================
// FUNÇÕES DE ATUALIZAÇÃO
// ===========================================

function atualizarTudo() {
    const ST = personagemAtributos.ST;
    const DX = personagemAtributos.DX;
    const IQ = personagemAtributos.IQ;
    const HT = personagemAtributos.HT;

    console.log('🔧 Atualizando TUDO:', { ST, DX, IQ, HT });

    // Atualizar bases dos secundários
    document.getElementById('PVBase').textContent = ST;
    document.getElementById('PFBase').textContent = HT;
    document.getElementById('VontadeBase').textContent = IQ;
    document.getElementById('PercepcaoBase').textContent = IQ;

    const deslocamentoBase = (HT + DX) / 4;
    document.getElementById('DeslocamentoBase').textContent = deslocamentoBase.toFixed(2);

    // Atualizar dano e cargas
    atualizarDanoBase(ST);
    atualizarCargas(ST);
    
    // Calcular custos e atualizar pontos
    calcularCustos();
    
    // Atualizar totais
    atualizarTotaisSecundarios();
    atualizarStatus();
    
    // Atualizar dashboard
    atualizarDashboardAtributos();
    
    // Salvar no Firebase
    salvarNoFirebase();
}

function atualizarDanoBase(ST) {
    let stKey = ST;
    if (ST > 40) stKey = 40;
    if (ST < 1) stKey = 1;

    const dano = danoTable[stKey];
    if (dano) {
        document.getElementById('danoGDP').textContent = dano.gdp;
        document.getElementById('danoGEB').textContent = dano.geb;
        document.getElementById('currentST').textContent = ST;
        document.getElementById('currentST2').textContent = ST;
    }
}

// FUNÇÃO CRÍTICA: Atualizar cargas baseado no ST
function atualizarCargas(ST) {
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;

    const cargas = cargasTable[stKey];
    if (cargas) {
        // Formatar com 1 casa decimal
        document.getElementById('cargaNenhuma').textContent = cargas.nenhuma.toFixed(1);
        document.getElementById('cargaLeve').textContent = cargas.leve.toFixed(1);
        document.getElementById('cargaMedia').textContent = cargas.media.toFixed(1);
        document.getElementById('cargaPesada').textContent = cargas.pesada.toFixed(1);
        document.getElementById('cargaMuitoPesada').textContent = cargas.muitoPesada.toFixed(1);
        
        console.log('🏋️ Cargas atualizadas ST=' + ST + ':', cargas);
        
        // Atualizar também no dashboard
        if (typeof atualizarCargasDashboard === 'function') {
            atualizarCargasDashboard(cargas);
        }
    }
}

// FUNÇÃO CRÍTICA: Calcular custos dos atributos
function calcularCustos() {
    const ST = personagemAtributos.ST;
    const DX = personagemAtributos.DX;
    const IQ = personagemAtributos.IQ;
    const HT = personagemAtributos.HT;

    // Cálculo CORRETO dos custos
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;

    const totalGastos = custoST + custoDX + custoIQ + custoHT;

    // Atualizar display
    document.getElementById('custoST').textContent = custoST;
    document.getElementById('custoDX').textContent = custoDX;
    document.getElementById('custoIQ').textContent = custoIQ;
    document.getElementById('custoHT').textContent = custoHT;

    const pontosElement = document.getElementById('pontosGastos');
    pontosElement.textContent = totalGastos;

    // Adicionar classe de excedido se passar de 150
    pontosElement.classList.remove('excedido');
    if (totalGastos > 150) {
        pontosElement.classList.add('excedido');
    }
    
    console.log('💰 Custos calculados:', {
        ST: custoST, DX: custoDX, IQ: custoIQ, HT: custoHT,
        total: totalGastos
    });
    
    // Reportar pontos para o gerenciador
    if (typeof pontosManager !== 'undefined') {
        pontosManager.atualizarPontosAba('atributos', totalGastos);
    }
    
    return totalGastos;
}

function atualizarTotaisSecundarios() {
    const pvBase = personagemAtributos.ST;
    const pvBonus = personagemAtributos.bonus.PV || 0;
    const pvTotal = Math.max(pvBase + pvBonus, 1);
    document.getElementById('PVTotal').textContent = pvTotal;

    const pfBase = personagemAtributos.HT;
    const pfBonus = personagemAtributos.bonus.PF || 0;
    const pfTotal = Math.max(pfBase + pfBonus, 1);
    document.getElementById('PFTotal').textContent = pfTotal;

    const vontadeBase = personagemAtributos.IQ;
    const vontadeBonus = personagemAtributos.bonus.Vontade || 0;
    const vontadeTotal = Math.max(vontadeBase + vontadeBonus, 1);
    document.getElementById('VontadeTotal').textContent = vontadeTotal;

    const percepcaoBase = personagemAtributos.IQ;
    const percepcaoBonus = personagemAtributos.bonus.Percepcao || 0;
    const percepcaoTotal = Math.max(percepcaoBase + percepcaoBonus, 1);
    document.getElementById('PercepcaoTotal').textContent = percepcaoTotal;

    const deslocamentoBase = (personagemAtributos.HT + personagemAtributos.DX) / 4;
    const deslocamentoBonus = personagemAtributos.bonus.Deslocamento || 0;
    const deslocamentoTotal = Math.max(deslocamentoBase + deslocamentoBonus, 0).toFixed(2);
    document.getElementById('DeslocamentoTotal').textContent = deslocamentoTotal;
}

function atualizarEstiloBonusInput(input, valor) {
    input.classList.remove('positivo', 'negativo');
    if (valor > 0) {
        input.classList.add('positivo');
    } else if (valor < 0) {
        input.classList.add('negativo');
    }
}

function atualizarStatus() {
    const statusElement = document.getElementById('statusAtributos');
    if (!statusElement) return;

    const pontosGastos = parseInt(document.getElementById('pontosGastos').textContent) || 0;

    statusElement.className = 'status-mensagem';

    if (pontosGastos > 150) {
        statusElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> ATENÇÃO: Você excedeu ' + (pontosGastos - 150) + ' pontos!';
        statusElement.style.background = 'linear-gradient(145deg, rgba(139, 0, 0, 0.4), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '2px solid #f44336';
        statusElement.style.color = '#ffabab';
    } else if (pontosGastos === 150) {
        statusElement.innerHTML = '<i class="fas fa-check-circle"></i> Perfeito! Todos os pontos usados.';
        statusElement.style.background = 'linear-gradient(145deg, rgba(46, 92, 58, 0.4), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '2px solid #4CAF50';
        statusElement.style.color = '#a5d6a7';
    } else if (pontosGastos > 0) {
        statusElement.innerHTML = '<i class="fas fa-info-circle"></i> Gastou ' + pontosGastos + ' pontos dos 150 disponíveis.';
        statusElement.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '2px solid var(--primary-gold)';
        statusElement.style.color = 'var(--secondary-gold)';
    } else {
        statusElement.innerHTML = '<i class="fas fa-info-circle"></i> Atributos no valor padrão.';
        statusElement.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.1), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '1px solid var(--primary-gold)';
        statusElement.style.color = 'var(--secondary-gold)';
    }
}

// Atualizar dashboard com dados dos atributos
function atualizarDashboardAtributos() {
    // Atualizar sumário de atributos no dashboard
    if (document.getElementById('summary-st')) {
        document.getElementById('summary-st').textContent = personagemAtributos.ST;
        document.getElementById('summary-dx').textContent = personagemAtributos.DX;
        document.getElementById('summary-iq').textContent = personagemAtributos.IQ;
        document.getElementById('summary-ht').textContent = personagemAtributos.HT;
        
        // Atributos secundários
        const pvTotal = parseInt(document.getElementById('PVTotal').textContent) || personagemAtributos.ST;
        const pfTotal = parseInt(document.getElementById('PFTotal').textContent) || personagemAtributos.HT;
        const vontadeTotal = parseInt(document.getElementById('VontadeTotal').textContent) || personagemAtributos.IQ;
        const percepcaoTotal = parseInt(document.getElementById('PercepcaoTotal').textContent) || personagemAtributos.IQ;
        
        document.getElementById('summary-hp').textContent = pvTotal;
        document.getElementById('summary-fp').textContent = pfTotal;
        document.getElementById('summary-will').textContent = vontadeTotal;
        document.getElementById('summary-per').textContent = percepcaoTotal;
    }
}

// ===========================================
// SALVAMENTO E CARREGAMENTO (FIREBASE)
// ===========================================

// SALVAR no Firebase
function salvarNoFirebase() {
    console.log('💾 Salvando atributos no Firebase...');
    
    // Reportar pontos para o gerenciador
    const totalGastos = parseInt(document.getElementById('pontosGastos').textContent) || 0;
    if (typeof pontosManager !== 'undefined') {
        pontosManager.atualizarPontosAba('atributos', totalGastos);
    }
    
    // Salvar dados completos no Firebase se módulo registrado
    if (typeof firebaseService !== 'undefined' && firebaseService.characterId) {
        const dadosAtributos = obterDadosAtributos();
        firebaseService.saveModule('atributos', dadosAtributos)
            .then(() => console.log('✅ Atributos salvos no Firebase'))
            .catch(error => console.error('❌ Erro ao salvar atributos:', error));
    }
}

function obterDadosAtributos() {
    const totalGastos = parseInt(document.getElementById('pontosGastos').textContent) || 0;
    
    // Obter cargas atuais
    const ST = personagemAtributos.ST;
    let stKey = ST > 20 ? 20 : (ST < 1 ? 1 : ST);
    const cargas = cargasTable[stKey];
    
    const dados = {
        ST: personagemAtributos.ST,
        DX: personagemAtributos.DX,
        IQ: personagemAtributos.IQ,
        HT: personagemAtributos.HT,
        bonus: { ...personagemAtributos.bonus },
        custos: {
            ST: (personagemAtributos.ST - 10) * 10,
            DX: (personagemAtributos.DX - 10) * 20,
            IQ: (personagemAtributos.IQ - 10) * 20,
            HT: (personagemAtributos.HT - 10) * 10,
            total: totalGastos
        },
        derivados: {
            PV: parseInt(document.getElementById('PVTotal').textContent) || 10,
            PF: parseInt(document.getElementById('PFTotal').textContent) || 10,
            Vontade: parseInt(document.getElementById('VontadeTotal').textContent) || 10,
            Percepcao: parseInt(document.getElementById('PercepcaoTotal').textContent) || 10,
            Deslocamento: parseFloat(document.getElementById('DeslocamentoTotal').textContent) || 5.00
        },
        dano: {
            gdp: document.getElementById('danoGDP').textContent,
            geb: document.getElementById('danoGEB').textContent
        },
        cargas: cargas || cargasTable[10],
        nivelCarga: nivelCargaAtual,
        ultimaAtualizacao: new Date().toISOString()
    };
    
    console.log('📦 Dados dos atributos para Firebase:', dados);
    return dados;
}

// CARREGAR do Firebase
function carregarDadosAtributos(dados) {
    if (!dados) {
        console.log('⚠️ Nenhum dado para carregar');
        return false;
    }

    console.log('📥 Carregando dados do Firebase:', dados);

    try {
        // Carregar atributos principais
        if (dados.ST !== undefined && dados.ST !== null) {
            personagemAtributos.ST = parseInt(dados.ST);
            document.getElementById('ST').value = personagemAtributos.ST;
        }
        
        if (dados.DX !== undefined && dados.DX !== null) {
            personagemAtributos.DX = parseInt(dados.DX);
            document.getElementById('DX').value = personagemAtributos.DX;
        }
        
        if (dados.IQ !== undefined && dados.IQ !== null) {
            personagemAtributos.IQ = parseInt(dados.IQ);
            document.getElementById('IQ').value = personagemAtributos.IQ;
        }
        
        if (dados.HT !== undefined && dados.HT !== null) {
            personagemAtributos.HT = parseInt(dados.HT);
            document.getElementById('HT').value = personagemAtributos.HT;
        }
        
        // Carregar bônus
        if (dados.bonus) {
            personagemAtributos.bonus.PV = dados.bonus.PV || 0;
            personagemAtributos.bonus.PF = dados.bonus.PF || 0;
            personagemAtributos.bonus.Vontade = dados.bonus.Vontade || 0;
            personagemAtributos.bonus.Percepcao = dados.bonus.Percepcao || 0;
            personagemAtributos.bonus.Deslocamento = dados.bonus.Deslocamento || 0;
            
            // Atualizar inputs dos bônus
            const bonusInputs = {
                'PV': 'bonusPV',
                'PF': 'bonusPF',
                'Vontade': 'bonusVontade',
                'Percepcao': 'bonusPercepcao',
                'Deslocamento': 'bonusDeslocamento'
            };
            
            Object.entries(bonusInputs).forEach(([key, id]) => {
                const input = document.getElementById(id);
                if (input && personagemAtributos.bonus[key] !== undefined) {
                    input.value = personagemAtributos.bonus[key];
                    atualizarEstiloBonusInput(input, personagemAtributos.bonus[key]);
                }
            });
        }
        
        // Carregar nível de carga
        if (dados.nivelCarga) {
            nivelCargaAtual = dados.nivelCarga;
        }
        
        console.log('✅ Dados carregados:', personagemAtributos);
        
        // Atualizar tudo
        atualizarTudo();
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        return false;
    }
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

function inicializarAtributos() {
    console.log('🚀 Inicializando sistema de atributos...');
    
    // Event listeners para atributos principais
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            // Limpar qualquer timeout existente
            if (window[atributo + 'Timeout']) {
                clearTimeout(window[atributo + 'Timeout']);
            }
            
            input.addEventListener('input', function() {
                clearTimeout(window[atributo + 'Timeout']);
                window[atributo + 'Timeout'] = setTimeout(() => {
                    let valor = parseInt(this.value);
                    if (isNaN(valor)) valor = 10;
                    if (valor < 1) valor = 1;
                    if (valor > 40) valor = 40;
                    
                    this.value = valor;
                    personagemAtributos[atributo] = valor;
                    
                    console.log(`📝 ${atributo} alterado para:`, valor);
                    atualizarTudo();
                }, 500);
            });
        }
    });

    // Event listeners para bônus
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById('bonus' + atributo);
        if (input) {
            // Limpar qualquer timeout existente
            if (window['bonus' + atributo + 'Timeout']) {
                clearTimeout(window['bonus' + atributo + 'Timeout']);
            }
            
            input.addEventListener('input', function() {
                clearTimeout(window['bonus' + atributo + 'Timeout']);
                window['bonus' + atributo + 'Timeout'] = setTimeout(() => {
                    let valor;
                    if (atributo === 'Deslocamento') {
                        valor = parseFloat(this.value);
                        if (isNaN(valor)) valor = 0;
                        valor = Math.round(valor * 100) / 100; // 2 casas decimais
                    } else {
                        valor = parseInt(this.value);
                        if (isNaN(valor)) valor = 0;
                    }
                    
                    if (valor < -10) valor = -10;
                    if (valor > 20) valor = 20;
                    
                    this.value = valor;
                    personagemAtributos.bonus[atributo] = valor;
                    
                    atualizarEstiloBonusInput(this, valor);
                    atualizarTotaisSecundarios();
                    atualizarStatus();
                    salvarNoFirebase();
                    
                    console.log(`📝 Bônus ${atributo} alterado para:`, valor);
                }, 500);
            });
            
            // Aplicar estilo inicial
            const valorInicial = parseFloat(input.value) || 0;
            atualizarEstiloBonusInput(input, valorInicial);
        }
    });

    // Valores iniciais garantidos
    personagemAtributos = {
        ST: parseInt(document.getElementById('ST').value) || 10,
        DX: parseInt(document.getElementById('DX').value) || 10,
        IQ: parseInt(document.getElementById('IQ').value) || 10,
        HT: parseInt(document.getElementById('HT').value) || 10,
        bonus: {
            PV: parseInt(document.getElementById('bonusPV').value) || 0,
            PF: parseInt(document.getElementById('bonusPF').value) || 0,
            Vontade: parseInt(document.getElementById('bonusVontade').value) || 0,
            Percepcao: parseInt(document.getElementById('bonusPercepcao').value) || 0,
            Deslocamento: parseFloat(document.getElementById('bonusDeslocamento').value) || 0
        }
    };

    // Executa primeira atualização
    console.log('🔄 Primeira atualização dos atributos...');
    atualizarTudo();
    
    // Se houver dados no Firebase, tentar carregar
    if (typeof firebaseService !== 'undefined' && firebaseService.characterData?.atributos) {
        setTimeout(() => {
            console.log('📂 Carregando atributos do Firebase...');
            carregarDadosAtributos(firebaseService.characterData.atributos);
        }, 1000);
    }
}

// ===========================================
// FUNÇÃO PARA SER CHAMADA PELA ABA
// ===========================================

function initAtributosTab() {
    console.log('🎯 Iniciando aba de atributos...');
    
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
        if (document.getElementById('ST')) {
            inicializarAtributos();
        } else {
            console.warn('⚠️ Elementos de atributos não encontrados, tentando novamente...');
            setTimeout(initAtributosTab, 500);
        }
    }, 300);
}

// ===========================================
// REGISTRAR MÓDULO NO FIREBASE SERVICE
// ===========================================

if (typeof window.registerFirebaseModule === 'function') {
    console.log('🔧 Registrando módulo de atributos no Firebase...');
    
    window.registerFirebaseModule(
        'atributos',
        () => {
            return obterDadosAtributos();
        },
        (dados) => {
            carregarDadosAtributos(dados);
        }
    );
}

// ===========================================
// EXPORTA FUNÇÕES PARA USO EXTERNO
// ===========================================

window.alterarAtributo = alterarAtributo;
window.ajustarSecundario = ajustarSecundario;
window.initAtributosTab = initAtributosTab;
window.obterDadosAtributos = obterDadosAtributos;
window.carregarDadosAtributos = carregarDadosAtributos;
window.calcularCustos = calcularCustos;

// Funções para dashboard
window.getAtributosPersonagem = () => ({ ...personagemAtributos });
window.getCargasPersonagem = () => {
    const ST = personagemAtributos.ST;
    let stKey = ST > 20 ? 20 : (ST < 1 ? 1 : ST);
    return cargasTable[stKey] || cargasTable[10];
};
window.getNivelCargaAtual = () => nivelCargaAtual;

// Inicializa se a aba já estiver ativa
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('atributos')?.classList.contains('active')) {
            initAtributosTab();
        }
    });
} else {
    if (document.getElementById('atributos')?.classList.contains('active')) {
        initAtributosTab();
    }
}

// ===========================================
// CONSOLE DEBUG
// ===========================================
console.log('✅ atributos.js carregado com Firebase');