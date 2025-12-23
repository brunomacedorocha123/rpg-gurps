// ===== SISTEMA DE ATRIBUTOS - GURPS =====
// Versão Completa com Comunicação com Dashboard

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
    if (!input) return; // Se elemento não existe, não faz nada
    
    let novoValor = parseInt(estadoAtributos[atributo]) + valor;
    
    if (novoValor < 1) novoValor = 1;
    if (novoValor > 40) novoValor = 40;
    
    estadoAtributos[atributo] = novoValor;
    input.value = novoValor;
    
    calcularTudo();
}

function atualizarBonus(atributo, valor) {
    const input = document.getElementById(`bonus${atributo}`);
    if (!input) return; // Se elemento não existe, não faz nada
    
    const chave = `bonus${atributo}`;
    estadoAtributos[chave] = parseInt(valor) || 0;
    
    input.classList.remove('positivo', 'negativo');
    if (estadoAtributos[chave] > 0) {
        input.classList.add('positivo');
    } else if (estadoAtributos[chave] < 0) {
        input.classList.add('negativo');
    }
    
    calcularTudo();
}

// ===== CÁLCULOS PRINCIPAIS =====

function calcularTudo() {
    // Verificar se estamos na aba de atributos
    const abaAtributos = document.getElementById('atributos');
    if (!abaAtributos || !abaAtributos.classList.contains('active')) {
        return; // Não calcular se não estiver na aba de atributos
    }
    
    atualizarBases();
    calcularDano();
    calcularCarga();
    calcularPontosGastos();
    calcularTotais();
    notificarDashboard();
}

function atualizarBases() {
    const pvBase = document.getElementById('PVBase');
    const pfBase = document.getElementById('PFBase');
    const vontadeBase = document.getElementById('VontadeBase');
    const percepcaoBase = document.getElementById('PercepcaoBase');
    const deslocamentoBase = document.getElementById('DeslocamentoBase');
    
    if (pvBase) pvBase.textContent = estadoAtributos.ST;
    if (pfBase) pfBase.textContent = estadoAtributos.HT;
    if (vontadeBase) vontadeBase.textContent = estadoAtributos.IQ;
    if (percepcaoBase) percepcaoBase.textContent = estadoAtributos.IQ;
    
    if (deslocamentoBase) {
        const deslocamentoBaseValor = (estadoAtributos.HT + estadoAtributos.DX) / 4;
        deslocamentoBase.textContent = deslocamentoBaseValor.toFixed(2);
    }
}

function calcularDano() {
    const danoGDP = document.getElementById('danoGDP');
    const danoGEB = document.getElementById('danoGEB');
    if (!danoGDP || !danoGEB) return;
    
    const ST = estadoAtributos.ST;
    const stKey = Math.max(1, Math.min(ST, 40));
    
    const dano = danoTable[stKey];
    if (dano) {
        danoGDP.textContent = dano.gdp;
        danoGEB.textContent = dano.geb;
    }
}

function calcularCarga() {
    const cargaNenhuma = document.getElementById('cargaNenhuma');
    const cargaLeve = document.getElementById('cargaLeve');
    const cargaMedia = document.getElementById('cargaMedia');
    const cargaPesada = document.getElementById('cargaPesada');
    const cargaMuitoPesada = document.getElementById('cargaMuitoPesada');
    
    if (!cargaNenhuma || !cargaLeve || !cargaMedia || !cargaPesada || !cargaMuitoPesada) return;
    
    const ST = estadoAtributos.ST;
    const stKey = Math.max(1, Math.min(ST, 20));
    
    const cargas = cargasTable[stKey];
    if (cargas) {
        cargaNenhuma.textContent = cargas.nenhuma.toFixed(1);
        cargaLeve.textContent = cargas.leve.toFixed(1);
        cargaMedia.textContent = cargas.media.toFixed(1);
        cargaPesada.textContent = cargas.pesada.toFixed(1);
        cargaMuitoPesada.textContent = cargas.muitoPesada.toFixed(1);
    }
}

function calcularPontosGastos() {
    const custoST = (estadoAtributos.ST - 10) * 10;
    const custoDX = (estadoAtributos.DX - 10) * 20;
    const custoIQ = (estadoAtributos.IQ - 10) * 20;
    const custoHT = (estadoAtributos.HT - 10) * 10;
    
    const totalGastos = custoST + custoDX + custoIQ + custoHT;
    
    // Atualizar o elemento principal
    const pontosElement = document.getElementById('pontosGastos');
    if (pontosElement) {
        pontosElement.textContent = totalGastos;
    }
    
    // Atualizar também o card (se existir com ID diferente)
    const cardElement = document.getElementById('pontosGastosCard');
    if (cardElement) {
        cardElement.textContent = totalGastos;
    }
    
    // Atualizar custos individuais
    const custoSTElement = document.getElementById('custoST');
    const custoDXElement = document.getElementById('custoDX');
    const custoIQElement = document.getElementById('custoIQ');
    const custoHTElement = document.getElementById('custoHT');
    
    if (custoSTElement) custoSTElement.textContent = custoST;
    if (custoDXElement) custoDXElement.textContent = custoDX;
    if (custoIQElement) custoIQElement.textContent = custoIQ;
    if (custoHTElement) custoHTElement.textContent = custoHT;
}

function calcularTotais() {
    const pvTotalElement = document.getElementById('PVTotal');
    const pfTotalElement = document.getElementById('PFTotal');
    const vontadeTotalElement = document.getElementById('VontadeTotal');
    const percepcaoTotalElement = document.getElementById('PercepcaoTotal');
    const deslocamentoTotalElement = document.getElementById('DeslocamentoTotal');
    const deslocamentoBaseElement = document.getElementById('DeslocamentoBase');
    
    if (pvTotalElement) {
        const pvTotal = Math.max(estadoAtributos.ST + estadoAtributos.bonusPV, 1);
        pvTotalElement.textContent = pvTotal;
    }
    
    if (pfTotalElement) {
        const pfTotal = Math.max(estadoAtributos.HT + estadoAtributos.bonusPF, 1);
        pfTotalElement.textContent = pfTotal;
    }
    
    if (vontadeTotalElement) {
        const vontadeTotal = Math.max(estadoAtributos.IQ + estadoAtributos.bonusVontade, 1);
        vontadeTotalElement.textContent = vontadeTotal;
    }
    
    if (percepcaoTotalElement) {
        const percepcaoTotal = Math.max(estadoAtributos.IQ + estadoAtributos.bonusPercepcao, 1);
        percepcaoTotalElement.textContent = percepcaoTotal;
    }
    
    if (deslocamentoTotalElement && deslocamentoBaseElement) {
        const deslocamentoBase = parseFloat(deslocamentoBaseElement.textContent) || 0;
        const deslocamentoTotal = Math.max(deslocamentoBase + estadoAtributos.bonusDeslocamento, 0).toFixed(2);
        deslocamentoTotalElement.textContent = deslocamentoTotal;
    }
}

// ===== COMUNICAÇÃO COM DASHBOARD =====

function notificarDashboard() {
    // Calcular pontos gastos em atributos
    const pontosAtributos = (estadoAtributos.ST - 10) * 10 +
                           (estadoAtributos.DX - 10) * 20 +
                           (estadoAtributos.IQ - 10) * 20 +
                           (estadoAtributos.HT - 10) * 10;
    
    // Criar evento para o dashboard
    const eventoAtributos = new CustomEvent('atributosAlterados', {
        detail: {
            ST: estadoAtributos.ST,
            DX: estadoAtributos.DX,
            IQ: estadoAtributos.IQ,
            HT: estadoAtributos.HT,
            PV: Math.max(estadoAtributos.ST + estadoAtributos.bonusPV, 1),
            PF: Math.max(estadoAtributos.HT + estadoAtributos.bonusPF, 1),
            pontosAtributos: pontosAtributos,
            atualizadoEm: new Date().toISOString()
        }
    });
    
    // Disparar evento para o dashboard
    document.dispatchEvent(eventoAtributos);
    
    console.log('📤 Dados enviados para Dashboard:', eventoAtributos.detail);
    
    // Se o dashboard manager estiver disponível, atualizar diretamente
    if (window.dashboardManager && typeof window.dashboardManager.atualizarAtributos === 'function') {
        window.dashboardManager.atualizarAtributos(
            estadoAtributos.ST,
            estadoAtributos.DX,
            estadoAtributos.IQ,
            estadoAtributos.HT
        );
    } else {
        // Se não existir ainda, tentar função global
        if (window.atualizarDashboardAtributos) {
            window.atualizarDashboardAtributos(
                estadoAtributos.ST,
                estadoAtributos.DX,
                estadoAtributos.IQ,
                estadoAtributos.HT
            );
        }
    }
}

// ===== EVENTOS E INICIALIZAÇÃO =====

function inicializarAtributos() {
    // Verificar se estamos na aba de atributos
    const abaAtributos = document.getElementById('atributos');
    if (!abaAtributos || !abaAtributos.classList.contains('active')) {
        return; // Não inicializar se não estiver na aba de atributos
    }
    
    // Verificar se os elementos principais existem
    const elementosNecessarios = ['ST', 'DX', 'IQ', 'HT'];
    for (const id of elementosNecessarios) {
        if (!document.getElementById(id)) {
            // Tentar novamente depois
            setTimeout(inicializarAtributos, 100);
            return;
        }
    }
    
    console.log('🎯 Inicializando sistema de atributos...');
    
    // Inicializar inputs dos atributos principais
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            // Salvar valor inicial
            estadoAtributos[atributo] = parseInt(input.value) || 10;
            
            // Configurar eventos
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
    
    // Inicializar inputs dos bônus
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById(`bonus${atributo}`);
        if (input) {
            // Salvar valor inicial
            const chave = `bonus${atributo}`;
            estadoAtributos[chave] = parseInt(input.value) || 0;
            
            // Configurar eventos
            input.addEventListener('change', function() {
                atualizarBonus(atributo, this.value);
            });
            
            input.addEventListener('input', function() {
                atualizarBonus(atributo, this.value);
            });
            
            // Aplicar formatação inicial
            atualizarBonus(atributo, input.value);
        }
    });
    
    // Calcular tudo pela primeira vez
    calcularTudo();
    
    // Forçar notificação inicial para o dashboard
    setTimeout(notificarDashboard, 300);
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
        pontosGastosAtributos: (estadoAtributos.ST - 10) * 10 +
                              (estadoAtributos.DX - 10) * 20 +
                              (estadoAtributos.IQ - 10) * 20 +
                              (estadoAtributos.HT - 10) * 10,
        atualizadoEm: new Date().toISOString()
    };
}

function carregarDados(dados) {
    if (!dados) return;
    
    // Carregar atributos principais
    if (dados.atributos) {
        Object.keys(dados.atributos).forEach(atributo => {
            estadoAtributos[atributo] = dados.atributos[atributo];
            const input = document.getElementById(atributo);
            if (input) input.value = dados.atributos[atributo];
        });
    }
    
    // Carregar bônus
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
    
    // Recalcular tudo
    calcularTudo();
}

// ===== EXPORTAÇÃO =====

window.alterarAtributo = alterarAtributo;
window.atualizarBonus = atualizarBonus;
window.inicializarAtributos = inicializarAtributos;
window.obterDadosParaSalvar = obterDadosParaSalvar;
window.carregarDados = carregarDados;
window.notificarDashboard = notificarDashboard; // Exportar para testes

// ===== INICIALIZAÇÃO AUTOMÁTICA =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM Carregado - Sistema de Atributos pronto');
    
    // Aguardar um pouco e verificar se estamos na aba de atributos
    setTimeout(() => {
        const abaAtributos = document.getElementById('atributos');
        if (abaAtributos && abaAtributos.classList.contains('active')) {
            inicializarAtributos();
        }
    }, 500);
});

// Escutar quando a aba mudar para inicializar atributos
document.addEventListener('tabChanged', function(e) {
    if (e.detail && e.detail.tab === 'atributos') {
        console.log('🔄 Tab mudou para Atributos, inicializando...');
        setTimeout(inicializarAtributos, 100);
    }
});

// Escutar se o dashboard pedir dados
document.addEventListener('dashboardSolicitaAtributos', function() {
    console.log('📨 Dashboard solicitou dados de atributos');
    notificarDashboard();
});

// ===== COMPATIBILIDADE COM O CARD DE PONTOS =====

function verificarEAtualizarCardPontos() {
    const totalGastos = (estadoAtributos.ST - 10) * 10 +
                       (estadoAtributos.DX - 10) * 20 +
                       (estadoAtributos.IQ - 10) * 20 +
                       (estadoAtributos.HT - 10) * 10;
    
    // Tentar atualizar vários possíveis IDs
    const possiveisIds = ['pontosGastosCard', 'pontosGastos', 'displayPontosGastos'];
    
    possiveisIds.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = totalGastos;
        }
    });
}

// Adicionar verificação de card quando calcular
calcularTudo = (function(original) {
    return function() {
        original();
        verificarEAtualizarCardPontos();
    };
})(calcularTudo);

// Executar uma vez quando a página carregar
setTimeout(verificarEAtualizarCardPontos, 300);

// ===== TESTE AUTOMÁTICO =====
// Testar comunicação após 1 segundo
setTimeout(() => {
    console.log('🔍 Testando comunicação com Dashboard...');
    // Criar um evento de teste
    const eventoTeste = new Event('atributosAlterados');
    document.dispatchEvent(eventoTeste);
    console.log('✅ Evento de teste disparado');
}, 1000);