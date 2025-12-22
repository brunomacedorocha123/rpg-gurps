// ===== SISTEMA DE ATRIBUTOS - GURPS =====
g

// Tabelas de referência (mantidas do projeto anterior)
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

// Estado do personagem
let personagem = {
    pontosGastosAtributos: 0,
    atributos: { ST: 10, DX: 10, IQ: 10, HT: 10 },
    bonus: {
        PV: 0,
        PF: 0,
        Vontade: 0,
        Percepcao: 0,
        Deslocamento: 0
    },
    calculados: {
        PV: 10,
        PF: 10,
        Vontade: 10,
        Percepcao: 10,
        Deslocamento: 5.00,
        danoGDP: "1d-2",
        danoGEB: "1d"
    }
};

// ===== FUNÇÕES PRINCIPAIS =====

function alterarAtributo(atributo, valor) {
    const input = document.getElementById(atributo);
    let novoValor = parseInt(input.value) + valor;
    
    if (novoValor < 1) novoValor = 1;
    if (novoValor > 40) novoValor = 40;
    
    input.value = novoValor;
    atualizarAtributos();
}

function atualizarAtributos() {
    // Obter valores atuais
    const ST = parseInt(document.getElementById('ST').value) || 10;
    const DX = parseInt(document.getElementById('DX').value) || 10;
    const IQ = parseInt(document.getElementById('IQ').value) || 10;
    const HT = parseInt(document.getElementById('HT').value) || 10;
    
    // Atualizar estado
    personagem.atributos.ST = ST;
    personagem.atributos.DX = DX;
    personagem.atributos.IQ = IQ;
    personagem.atributos.HT = HT;
    
    // Executar cálculos
    calcularAtributosSecundarios(ST, DX, IQ, HT);
    calcularDanoBase(ST);
    calcularCargas(ST);
    calcularPontos();
    atualizarCustos();
    atualizarTotaisComBonus();
    
    // Disparar evento para integração
    dispararEventoAtributosAlterados();
}

function calcularAtributosSecundarios(ST, DX, IQ, HT) {
    // Atualizar bases
    document.getElementById('PVBase').textContent = ST;
    document.getElementById('PFBase').textContent = HT;
    document.getElementById('VontadeBase').textContent = IQ;
    document.getElementById('PercepcaoBase').textContent = IQ;
    
    const deslocamentoBase = (HT + DX) / 4;
    document.getElementById('DeslocamentoBase').textContent = deslocamentoBase.toFixed(2);
    
    // Salvar nos cálculos
    personagem.calculados.Deslocamento = parseFloat(deslocamentoBase.toFixed(2));
}

function calcularDanoBase(ST) {
    let stKey = ST;
    if (ST > 40) stKey = 40;
    if (ST < 1) stKey = 1;
    
    const dano = danoTable[stKey];
    if (dano) {
        document.getElementById('danoGDP').textContent = dano.gdp;
        document.getElementById('danoGEB').textContent = dano.geb;
        
        // Salvar nos cálculos
        personagem.calculados.danoGDP = dano.gdp;
        personagem.calculados.danoGEB = dano.geb;
    }
}

function calcularCargas(ST) {
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

function calcularPontos() {
    const ST = personagem.atributos.ST;
    const DX = personagem.atributos.DX;
    const IQ = personagem.atributos.IQ;
    const HT = personagem.atributos.HT;
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const totalGastos = custoST + custoDX + custoIQ + custoHT;
    
    personagem.pontosGastosAtributos = totalGastos;
    
    document.getElementById('pontosGastos').textContent = totalGastos;
}

function atualizarCustos() {
    const ST = personagem.atributos.ST;
    const DX = personagem.atributos.DX;
    const IQ = personagem.atributos.IQ;
    const HT = personagem.atributos.HT;
    
    document.getElementById('custoST').textContent = (ST - 10) * 10;
    document.getElementById('custoDX').textContent = (DX - 10) * 20;
    document.getElementById('custoIQ').textContent = (IQ - 10) * 20;
    document.getElementById('custoHT').textContent = (HT - 10) * 10;
}

function atualizarTotaisComBonus() {
    // PV: Base (ST) + Bônus
    const pvBase = parseInt(document.getElementById('PVBase').textContent);
    const pvBonus = personagem.bonus.PV;
    const pvTotal = Math.max(pvBase + pvBonus, 1);
    document.getElementById('PVTotal').textContent = pvTotal;
    personagem.calculados.PV = pvTotal;
    
    // PF: Base (HT) + Bônus
    const pfBase = parseInt(document.getElementById('PFBase').textContent);
    const pfBonus = personagem.bonus.PF;
    const pfTotal = Math.max(pfBase + pfBonus, 1);
    document.getElementById('PFTotal').textContent = pfTotal;
    personagem.calculados.PF = pfTotal;
    
    // Vontade: Base (IQ) + Bônus
    const vontadeBase = parseInt(document.getElementById('VontadeBase').textContent);
    const vontadeBonus = personagem.bonus.Vontade;
    const vontadeTotal = Math.max(vontadeBase + vontadeBonus, 1);
    document.getElementById('VontadeTotal').textContent = vontadeTotal;
    personagem.calculados.Vontade = vontadeTotal;
    
    // Percepção: Base (IQ) + Bônus
    const percepcaoBase = parseInt(document.getElementById('PercepcaoBase').textContent);
    const percepcaoBonus = personagem.bonus.Percepcao;
    const percepcaoTotal = Math.max(percepcaoBase + percepcaoBonus, 1);
    document.getElementById('PercepcaoTotal').textContent = percepcaoTotal;
    personagem.calculados.Percepcao = percepcaoTotal;
    
    // Deslocamento: Base + Bônus
    const deslocamentoBase = parseFloat(document.getElementById('DeslocamentoBase').textContent);
    const deslocamentoBonus = personagem.bonus.Deslocamento;
    const deslocamentoTotal = Math.max(deslocamentoBase + deslocamentoBonus, 0).toFixed(2);
    document.getElementById('DeslocamentoTotal').textContent = deslocamentoTotal;
    personagem.calculados.Deslocamento = parseFloat(deslocamentoTotal);
}

function atualizarBonus(atributo, valor) {
    const numValor = parseInt(valor) || 0;
    personagem.bonus[atributo] = numValor;
    atualizarEstiloBonusInput(atributo, numValor);
    atualizarTotaisComBonus();
}

function atualizarEstiloBonusInput(atributo, valor) {
    const input = document.getElementById(`bonus${atributo}`);
    if (input) {
        input.classList.remove('positivo', 'negativo');
        
        if (valor > 0) {
            input.classList.add('positivo');
        } else if (valor < 0) {
            input.classList.add('negativo');
        }
    }
}

// ===== EVENTOS PARA INTEGRAÇÃO =====

function dispararEventoAtributosAlterados() {
    const evento = new CustomEvent('atributosAlterados', {
        detail: {
            ST: personagem.atributos.ST,
            DX: personagem.atributos.DX,
            IQ: personagem.atributos.IQ,
            HT: personagem.atributos.HT,
            PV: personagem.calculados.PV,
            PF: personagem.calculados.PF,
            Vontade: personagem.calculados.Vontade,
            Percepcao: personagem.calculados.Percepcao,
            Deslocamento: personagem.calculados.Deslocamento,
            pontosGastosAtributos: personagem.pontosGastosAtributos
        }
    });
    document.dispatchEvent(evento);
}

// ===== INTEGRAÇÃO COM FIREBASE =====

function salvarAtributosFirebase(personagemId) {
    if (typeof firebase === 'undefined' || !firebase.apps.length) {
        console.error('Firebase não inicializado');
        return Promise.reject('Firebase não disponível');
    }
    
    const dadosAtributos = {
        atributos: personagem.atributos,
        bonus: personagem.bonus,
        calculados: personagem.calculados,
        pontosGastosAtributos: personagem.pontosGastosAtributos,
        atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    return firebase.firestore()
        .collection('personagens')
        .doc(personagemId)
        .update({
            atributos: dadosAtributos
        });
}

function carregarAtributosFirebase(dadosFirebase) {
    if (!dadosFirebase || !dadosFirebase.atributos) return;
    
    const dados = dadosFirebase.atributos;
    
    // Carregar atributos principais
    if (dados.atributos) {
        personagem.atributos = { ...personagem.atributos, ...dados.atributos };
        
        document.getElementById('ST').value = personagem.atributos.ST;
        document.getElementById('DX').value = personagem.atributos.DX;
        document.getElementById('IQ').value = personagem.atributos.IQ;
        document.getElementById('HT').value = personagem.atributos.HT;
    }
    
    // Carregar bônus
    if (dados.bonus) {
        personagem.bonus = { ...personagem.bonus, ...dados.bonus };
        
        document.getElementById('bonusPV').value = personagem.bonus.PV;
        document.getElementById('bonusPF').value = personagem.bonus.PF;
        document.getElementById('bonusVontade').value = personagem.bonus.Vontade;
        document.getElementById('bonusPercepcao').value = personagem.bonus.Percepcao;
        document.getElementById('bonusDeslocamento').value = personagem.bonus.Deslocamento;
        
        // Atualizar estilos
        Object.keys(personagem.bonus).forEach(atributo => {
            atualizarEstiloBonusInput(atributo, personagem.bonus[atributo]);
        });
    }
    
    // Carregar pontos gastos
    if (dados.pontosGastosAtributos !== undefined) {
        personagem.pontosGastosAtributos = dados.pontosGastosAtributos;
    }
    
    // Atualizar interface
    atualizarAtributos();
}

// ===== INICIALIZAÇÃO =====

function inicializarAtributos() {
    configurarEventListeners();
    atualizarAtributos();
}

function configurarEventListeners() {
    // Event listeners para atributos principais
    const inputsAtributos = ['ST', 'DX', 'IQ', 'HT'];
    
    inputsAtributos.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(window.inputTimeout);
                window.inputTimeout = setTimeout(() => {
                    atualizarAtributos();
                }, 300);
            });
            
            input.addEventListener('change', () => {
                atualizarAtributos();
            });
        }
    });
    
    // Event listeners para bônus manuais
    const inputsBonus = ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'];
    
    inputsBonus.forEach(atributo => {
        const input = document.getElementById(`bonus${atributo}`);
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(window.bonusTimeout);
                window.bonusTimeout = setTimeout(() => {
                    atualizarBonus(atributo, input.value);
                }, 300);
            });
            
            input.addEventListener('change', () => {
                atualizarBonus(atributo, input.value);
            });
            
            // Inicializar estilo do input
            atualizarEstiloBonusInput(atributo, input.value);
        }
    });
}

// ===== FUNÇÕES DE EXPORTAÇÃO =====

function obterDadosAtributos() {
    return {
        atributos: personagem.atributos,
        bonus: personagem.bonus,
        calculados: personagem.calculados,
        pontosGastosAtributos: personagem.pontosGastosAtributos
    };
}

function carregarDadosAtributos(dados) {
    if (dados.atributos) {
        personagem.atributos = { ...personagem.atributos, ...dados.atributos };
        
        document.getElementById('ST').value = personagem.atributos.ST;
        document.getElementById('DX').value = personagem.atributos.DX;
        document.getElementById('IQ').value = personagem.atributos.IQ;
        document.getElementById('HT').value = personagem.atributos.HT;
    }
    
    if (dados.bonus) {
        personagem.bonus = { ...personagem.bonus, ...dados.bonus };
        
        document.getElementById('bonusPV').value = personagem.bonus.PV;
        document.getElementById('bonusPF').value = personagem.bonus.PF;
        document.getElementById('bonusVontade').value = personagem.bonus.Vontade;
        document.getElementById('bonusPercepcao').value = personagem.bonus.Percepcao;
        document.getElementById('bonusDeslocamento').value = personagem.bonus.Deslocamento;
        
        Object.keys(personagem.bonus).forEach(atributo => {
            atualizarEstiloBonusInput(atributo, personagem.bonus[atributo]);
        });
    }
    
    if (dados.pontosGastosAtributos !== undefined) {
        personagem.pontosGastosAtributos = dados.pontosGastosAtributos;
    }
    
    atualizarAtributos();
}

// ===== EXPORTAÇÃO PARA WINDOW =====

window.alterarAtributo = alterarAtributo;
window.atualizarAtributos = atualizarAtributos;
window.obterDadosAtributos = obterDadosAtributos;
window.carregarDadosAtributos = carregarDadosAtributos;
window.inicializarAtributos = inicializarAtributos;
window.salvarAtributosFirebase = salvarAtributosFirebase;
window.carregarAtributosFirebase = carregarAtributosFirebase;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se a aba de atributos está ativa
    const atributosTab = document.getElementById('atributos');
    if (atributosTab && atributosTab.classList.contains('active')) {
        setTimeout(() => {
            inicializarAtributos();
        }, 100);
    }
    
    // Observar mudanças nas abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'atributos' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        inicializarAtributos();
                    }, 100);
                }
            }
        });
    });
    
    // Observar todas as abas
    document.querySelectorAll('.tab-pane').forEach(tab => {
        observer.observe(tab, { attributes: true });
    });
});