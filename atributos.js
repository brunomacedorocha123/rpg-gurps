// ===========================================
// ATRIBUTOS.JS - Sistema Completo GURPS com Firebase
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

// Tabela de cargas
const cargasTable = {
    1: { nenhuma: 0.1, leve: 0.2, media: 0.3, pesada: 0.6, muitoPesada: 1.0 },
    2: { nenhuma: 0.4, leve: 0.8, media: 1.2, pesada: 2.4, muitoPesada: 4.0 },
    3: { nenhuma: 0.9, leve: 1.8, media: 2.7, pesada: 5.4, muitoPesada: 9.0 },
    4: { nenhuma: 1.6, leve: 3.2, media: 4.8, pesada: 9.6, muitoPesada: 16.0 },
    5: { nenhuma: 2.5, leve: 5.0, media: 7.5, pesada: 15.0, muitoPesada: 25.5 },
    6: { nenhuma: 3.6, leve: 7.2, media: 10.8, pesada: 21.6, muitoPesada: 36.0 },
    7: { nenhuma: 4.9, leve: 9.8, media: 14.7, pesada: 29.4, muitoPesada: 49.0 },
    8: { nenhuma: 6.5, leve: 13.0, media: 19.5, pesada: 39.0, muitoPesada: 65.0 },
    9: { nenhuma: 8.0, leve: 16.0, media: 24.0, pesada: 48.0, muitoPesada: 80.0 },
    10: { nenhuma: 10.0, leve: 20.0, media: 30.0, pesada: 60.0, muitoPesada: 100.0 },
    11: { nenhuma: 12.0, leve: 24.0, media: 36.0, pesada: 72.0, muitoPesada: 120.0 },
    12: { nenhuma: 14.5, leve: 29.0, media: 43.5, pesada: 87.0, muitoPesada: 145.0 },
    13: { nenhuma: 17.0, leve: 34.0, media: 51.0, pesada: 102.0, muitoPesada: 170.0 },
    14: { nenhuma: 19.5, leve: 39.0, media: 58.5, pesada: 117.0, muitoPesada: 195.0 },
    15: { nenhuma: 22.5, leve: 45.0, media: 67.5, pesada: 135.0, muitoPesada: 225.0 },
    16: { nenhuma: 25.5, leve: 51.0, media: 76.5, pesada: 153.0, muitoPesada: 255.0 },
    17: { nenhuma: 29.0, leve: 58.0, media: 87.0, pesada: 174.0, muitoPesada: 294.0 },
    18: { nenhuma: 32.5, leve: 65.0, media: 97.5, pesada: 195.0, muitoPesada: 325.0 },
    19: { nenhuma: 36.0, leve: 72.0, media: 108.0, pesada: 216.0, muitoPesada: 360.0 },
    20: { nenhuma: 40.0, leve: 80.0, media: 120.0, pesada: 240.0, muitoPesada: 400.0 }
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
    salvarLocal();
}

// ===========================================
// FUNÇÕES DE ATUALIZAÇÃO
// ===========================================

function atualizarTudo() {
    const ST = personagemAtributos.ST;
    const DX = personagemAtributos.DX;
    const IQ = personagemAtributos.IQ;
    const HT = personagemAtributos.HT;

    document.getElementById('PVBase').textContent = ST;
    document.getElementById('PFBase').textContent = HT;
    document.getElementById('VontadeBase').textContent = IQ;
    document.getElementById('PercepcaoBase').textContent = IQ;

    const deslocamentoBase = (HT + DX) / 4;
    document.getElementById('DeslocamentoBase').textContent = deslocamentoBase.toFixed(2);

    atualizarDanoBase(ST);
    atualizarCargas(ST);
    calcularCustos();
    atualizarTotaisSecundarios();
    atualizarStatus();
    salvarLocal();
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

function atualizarCargas(ST) {
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;

    const cargas = cargasTable[stKey];
    if (cargas) {
        document.getElementById('cargaNenhuma').textContent = cargas.nenhuma.toFixed(1);
        document.getElementById('cargaLeve').textContent = cargas.leve.toFixed(1);
        document.getElementById('cargaMedia').textContent = cargas.media.toFixed(1);
        document.getElementById('cargaPesada').textContent = cargas.pesada.toFixed(1);
        document.getElementById('cargaMuitoPesada').textContent = cargas.muitoPesada.toFixed(1);
    }
}

function calcularCustos() {
    const ST = personagemAtributos.ST;
    const DX = personagemAtributos.DX;
    const IQ = personagemAtributos.IQ;
    const HT = personagemAtributos.HT;

    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;

    const totalGastos = custoST + custoDX + custoIQ + custoHT;

    document.getElementById('custoST').textContent = custoST;
    document.getElementById('custoDX').textContent = custoDX;
    document.getElementById('custoIQ').textContent = custoIQ;
    document.getElementById('custoHT').textContent = custoHT;

    const pontosElement = document.getElementById('pontosGastos');
    pontosElement.textContent = totalGastos;

    pontosElement.classList.remove('excedido');
    if (totalGastos > 150) {
        pontosElement.classList.add('excedido');
    }
    
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

// ===========================================
// SALVAMENTO E CARREGAMENTO (FIREBASE)
// ===========================================

function salvarLocal() {
    // Reportar pontos para o gerenciador
    const totalGastos = calcularCustos();
    if (typeof pontosManager !== 'undefined') {
        pontosManager.atualizarPontosAba('atributos', totalGastos);
    }
    
    // Salvar dados completos no Firebase se módulo registrado
    if (typeof firebaseService !== 'undefined' && firebaseService.characterId) {
        const dadosAtributos = obterDadosAtributos();
        firebaseService.saveModule('atributos', dadosAtributos);
    }
}

function obterDadosAtributos() {
    const totalGastos = parseInt(document.getElementById('pontosGastos').textContent) || 0;
    
    return {
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
        }
    };
}

function carregarDadosAtributos(dados) {
    if (!dados) return false;

    if (dados.ST !== undefined) personagemAtributos.ST = dados.ST;
    if (dados.DX !== undefined) personagemAtributos.DX = dados.DX;
    if (dados.IQ !== undefined) personagemAtributos.IQ = dados.IQ;
    if (dados.HT !== undefined) personagemAtributos.HT = dados.HT;
    
    if (dados.bonus) {
        personagemAtributos.bonus = { ...dados.bonus };
    }

    // Atualizar inputs
    document.getElementById('ST').value = personagemAtributos.ST;
    document.getElementById('DX').value = personagemAtributos.DX;
    document.getElementById('IQ').value = personagemAtributos.IQ;
    document.getElementById('HT').value = personagemAtributos.HT;

    // Atualizar bônus
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById('bonus' + atributo);
        if (input && personagemAtributos.bonus[atributo] !== undefined) {
            const valor = personagemAtributos.bonus[atributo];
            input.value = valor;
            atualizarEstiloBonusInput(input, valor);
        }
    });

    // Atualizar tudo
    atualizarTudo();
    return true;
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

function inicializarAtributos() {
    // Event listeners para atributos principais
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            input.addEventListener('input', function() {
                clearTimeout(window[atributo + 'Timeout']);
                window[atributo + 'Timeout'] = setTimeout(() => {
                    const valor = parseInt(this.value) || 10;
                    if (valor < 1) this.value = 1;
                    if (valor > 40) this.value = 40;
                    personagemAtributos[atributo] = valor;
                    atualizarTudo();
                }, 300);
            });
        }
    });

    // Event listeners para bônus
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById('bonus' + atributo);
        if (input) {
            input.addEventListener('input', function() {
                clearTimeout(window['bonus' + atributo + 'Timeout']);
                window['bonus' + atributo + 'Timeout'] = setTimeout(() => {
                    let valor;
                    if (atributo === 'Deslocamento') {
                        valor = parseFloat(this.value) || 0;
                    } else {
                        valor = parseInt(this.value) || 0;
                    }
                    
                    if (valor < -10) this.value = -10;
                    if (valor > 20) this.value = 20;
                    
                    personagemAtributos.bonus[atributo] = valor;
                    atualizarEstiloBonusInput(this, valor);
                    atualizarTotaisSecundarios();
                    atualizarStatus();
                    salvarLocal();
                }, 300);
            });
        }
    });

    // Valores iniciais
    personagemAtributos = {
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

    // Executa primeira atualização
    atualizarTudo();
}

// ===========================================
// FUNÇÃO PARA SER CHAMADA PELA ABA
// ===========================================

function initAtributosTab() {
    setTimeout(() => {
        inicializarAtributos();
    }, 100);
}

// ===========================================
// REGISTRAR MÓDULO NO FIREBASE
// ===========================================

if (typeof window.registerFirebaseModule === 'function') {
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
// EXPORTA FUNÇÕES
// ===========================================

window.alterarAtributo = alterarAtributo;
window.ajustarSecundario = ajustarSecundario;
window.initAtributosTab = initAtributosTab;
window.obterDadosAtributos = obterDadosAtributos;
window.carregarDadosAtributos = carregarDadosAtributos;
window.calcularCustos = calcularCustos;

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