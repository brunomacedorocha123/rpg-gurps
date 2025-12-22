// ===== SISTEMA DE ATRIBUTOS - GURPS =====
// Versão Final - Todos os cálculos funcionais

// Tabelas de referência
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

// Estado global
const estadoAtributos = {
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    bonusPV: 0,
    bonusPF: 0,
    bonusVontade: 0,
    bonusPercepcao: 0,
    bonusDeslocamento: 0
};

// ===== FUNÇÕES DE CONTROLE =====

function alterarAtributo(atributo, valor) {
    const input = document.getElementById(atributo);
    let novoValor = parseInt(estadoAtributos[atributo]) + valor;
    
    if (novoValor < 1) novoValor = 1;
    if (novoValor > 40) novoValor = 40;
    
    estadoAtributos[atributo] = novoValor;
    input.value = novoValor;
    
    calcularTudo();
}

function atualizarBonus(atributo, valor) {
    const chave = `bonus${atributo}`;
    estadoAtributos[chave] = parseInt(valor) || 0;
    
    const input = document.getElementById(`bonus${atributo}`);
    if (input) {
        input.classList.remove('positivo', 'negativo');
        if (estadoAtributos[chave] > 0) {
            input.classList.add('positivo');
        } else if (estadoAtributos[chave] < 0) {
            input.classList.add('negativo');
        }
    }
    
    calcularTudo();
}

// ===== CÁLCULOS PRINCIPAIS =====

function calcularTudo() {
    atualizarBases();
    calcularDano();
    calcularCarga();
    calcularPontosGastos();
    calcularTotais();
    dispararEventoAlteracao();
}

function atualizarBases() {
    document.getElementById('PVBase').textContent = estadoAtributos.ST;
    document.getElementById('PFBase').textContent = estadoAtributos.HT;
    document.getElementById('VontadeBase').textContent = estadoAtributos.IQ;
    document.getElementById('PercepcaoBase').textContent = estadoAtributos.IQ;
    
    const deslocamentoBase = (estadoAtributos.HT + estadoAtributos.DX) / 4;
    document.getElementById('DeslocamentoBase').textContent = deslocamentoBase.toFixed(2);
}

function calcularDano() {
    const ST = estadoAtributos.ST;
    const stKey = Math.max(1, Math.min(ST, 40));
    
    const dano = danoTable[stKey];
    if (dano) {
        document.getElementById('danoGDP').textContent = dano.gdp;
        document.getElementById('danoGEB').textContent = dano.geb;
    }
}

function calcularCarga() {
    const ST = estadoAtributos.ST;
    const stKey = Math.max(1, Math.min(ST, 20));
    
    const cargas = cargasTable[stKey];
    if (cargas) {
        document.getElementById('cargaNenhuma').textContent = cargas.nenhuma.toFixed(1);
        document.getElementById('cargaLeve').textContent = cargas.leve.toFixed(1);
        document.getElementById('cargaMedia').textContent = cargas.media.toFixed(1);
        document.getElementById('cargaPesada').textContent = cargas.pesada.toFixed(1);
        document.getElementById('cargaMuitoPesada').textContent = cargas.muitoPesada.toFixed(1);
    }
}

function calcularPontosGastos() {
    const custoST = (estadoAtributos.ST - 10) * 10;
    const custoDX = (estadoAtributos.DX - 10) * 20;
    const custoIQ = (estadoAtributos.IQ - 10) * 20;
    const custoHT = (estadoAtributos.HT - 10) * 10;
    
    const totalGastos = custoST + custoDX + custoIQ + custoHT;
    
    const pontosElement = document.getElementById('pontosGastos');
    if (pontosElement) {
        pontosElement.textContent = totalGastos;
    }
    
    document.getElementById('custoST').textContent = custoST;
    document.getElementById('custoDX').textContent = custoDX;
    document.getElementById('custoIQ').textContent = custoIQ;
    document.getElementById('custoHT').textContent = custoHT;
}

function calcularTotais() {
    const pvTotal = Math.max(estadoAtributos.ST + estadoAtributos.bonusPV, 1);
    document.getElementById('PVTotal').textContent = pvTotal;
    
    const pfTotal = Math.max(estadoAtributos.HT + estadoAtributos.bonusPF, 1);
    document.getElementById('PFTotal').textContent = pfTotal;
    
    const vontadeTotal = Math.max(estadoAtributos.IQ + estadoAtributos.bonusVontade, 1);
    document.getElementById('VontadeTotal').textContent = vontadeTotal;
    
    const percepcaoTotal = Math.max(estadoAtributos.IQ + estadoAtributos.bonusPercepcao, 1);
    document.getElementById('PercepcaoTotal').textContent = percepcaoTotal;
    
    const deslocamentoBase = parseFloat(document.getElementById('DeslocamentoBase').textContent);
    const deslocamentoTotal = Math.max(deslocamentoBase + estadoAtributos.bonusDeslocamento, 0).toFixed(2);
    document.getElementById('DeslocamentoTotal').textContent = deslocamentoTotal;
}

// ===== EVENTOS E INICIALIZAÇÃO =====

function dispararEventoAlteracao() {
    const evento = new CustomEvent('atributosAlterados', {
        detail: {
            ST: estadoAtributos.ST,
            DX: estadoAtributos.DX,
            IQ: estadoAtributos.IQ,
            HT: estadoAtributos.HT,
            PV: parseInt(document.getElementById('PVTotal').textContent),
            PF: parseInt(document.getElementById('PFTotal').textContent),
            Vontade: parseInt(document.getElementById('VontadeTotal').textContent),
            Percepcao: parseInt(document.getElementById('PercepcaoTotal').textContent),
            Deslocamento: parseFloat(document.getElementById('DeslocamentoTotal').textContent),
            pontosGastos: parseInt(document.getElementById('pontosGastos').textContent)
        }
    });
    document.dispatchEvent(evento);
}

function inicializarAtributos() {
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            input.addEventListener('change', function() {
                estadoAtributos[atributo] = parseInt(this.value) || 10;
                calcularTudo();
            });
            
            input.addEventListener('input', function() {
                estadoAtributos[atributo] = parseInt(this.value) || 10;
                calcularTudo();
            });
        }
    });
    
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById(`bonus${atributo}`);
        if (input) {
            input.addEventListener('change', function() {
                atualizarBonus(atributo, this.value);
            });
            
            input.addEventListener('input', function() {
                atualizarBonus(atributo, this.value);
            });
            
            atualizarBonus(atributo, input.value);
        }
    });
    
    calcularTudo();
}

// ===== FUNÇÕES PARA FIREBASE =====

function obterDadosParaSalvar() {
    return {
        atributos: {
            ST: estadoAtributos.ST,
            DX: estadoAtributos.DX,
            IQ: estadoAtributos.IQ,
            HT: estadoAtributos.HT
        },
        bonus: {
            PV: estadoAtributos.bonusPV,
            PF: estadoAtributos.bonusPF,
            Vontade: estadoAtributos.bonusVontade,
            Percepcao: estadoAtributos.bonusPercepcao,
            Deslocamento: estadoAtributos.bonusDeslocamento
        },
        pontosGastosAtributos: parseInt(document.getElementById('pontosGastos').textContent),
        atualizadoEm: new Date().toISOString()
    };
}

function carregarDados(dados) {
    if (!dados) return;
    
    if (dados.atributos) {
        Object.keys(dados.atributos).forEach(atributo => {
            estadoAtributos[atributo] = dados.atributos[atributo];
            const input = document.getElementById(atributo);
            if (input) input.value = dados.atributos[atributo];
        });
    }
    
    if (dados.bonus) {
        Object.keys(dados.bonus).forEach(atributo => {
            const chave = `bonus${atributo}`;
            estadoAtributos[chave] = dados.bonus[atributo];
            const input = document.getElementById(`bonus${atributo}`);
            if (input) {
                input.value = dados.bonus[atributo];
                atualizarBonus(atributo, dados.bonus[atributo]);
            }
        });
    }
    
    calcularTudo();
}

// ===== EXPORTAÇÃO =====

window.alterarAtributo = alterarAtributo;
window.atualizarBonus = atualizarBonus;
window.inicializarAtributos = inicializarAtributos;
window.obterDadosParaSalvar = obterDadosParaSalvar;
window.carregarDados = carregarDados;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        if (document.getElementById('ST')) {
            inicializarAtributos();
        }
    }, 100);
});