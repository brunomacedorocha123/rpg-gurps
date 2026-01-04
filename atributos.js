// ===========================================
// ATRIBUTOS.JS - FUNCIONAL E TESTADO
// ===========================================

// Tabela de cargas CORRETA
const cargasTable = {
    1: { nenhuma: 0.1, leve: 0.2, media: 0.3, pesada: 0.6, muitoPesada: 1.0 },
    2: { nenhuma: 0.4, leve: 0.8, media: 1.2, pesada: 2.4, muitoPesada: 4.0 },
    3: { nenhuma: 0.9, leve: 1.8, media: 2.7, pesada: 5.4, muitoPesada: 9.0 },
    4: { nenhuma: 1.6, leve: 3.2, media: 4.8, pesada: 9.6, muitoPesada: 16.0 },
    5: { nenhuma: 2.5, leve: 5.0, media: 7.5, pesada: 15.0, muitoPesada: 25.0 },
    6: { nenhuma: 3.6, leve: 7.2, media: 10.8, pesada: 21.6, muitoPesada: 36.0 },
    7: { nenhuma: 4.9, leve: 9.8, media: 14.7, pesada: 29.4, muitoPesada: 49.0 },
    8: { nenhuma: 6.4, leve: 12.8, media: 19.2, pesada: 38.4, muitoPesada: 64.0 },
    9: { nenhuma: 8.1, leve: 16.2, media: 24.3, pesada: 48.6, muitoPesada: 81.0 },
    10: { nenhuma: 10.0, leve: 20.0, media: 30.0, pesada: 60.0, muitoPesada: 100.0 },
    11: { nenhuma: 12.0, leve: 24.0, media: 36.0, pesada: 72.0, muitoPesada: 120.0 },
    12: { nenhuma: 14.5, leve: 29.0, media: 43.5, pesada: 87.0, muitoPesada: 145.0 },
    13: { nenhuma: 17.0, leve: 34.0, media: 51.0, pesada: 102.0, muitoPesada: 170.0 },
    14: { nenhuma: 19.5, leve: 39.0, media: 58.5, pesada: 117.0, muitoPesada: 195.0 },
    15: { nenhuma: 22.5, leve: 45.0, media: 67.5, pesada: 135.0, muitoPesada: 225.0 },
    16: { nenhuma: 25.5, leve: 51.0, media: 76.5, pesada: 153.0, muitoPesada: 255.0 },
    17: { nenhuma: 29.0, leve: 58.0, media: 87.0, pesada: 174.0, muitoPesada: 290.0 },
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
// FUNÇÕES SIMPLES E DIRETAS
// ===========================================

function alterarAtributo(atributo, valor) {
    const input = document.getElementById(atributo);
    if (!input) return;

    let novoValor = parseInt(input.value) + valor;
    if (novoValor < 1) novoValor = 1;
    if (novoValor > 40) novoValor = 40;

    input.value = novoValor;
    personagemAtributos[atributo] = novoValor;

    atualizarTudo();
    salvarNoFirebase();
}

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

    // Aplicar cor
    input.classList.remove('positivo', 'negativo');
    if (novoValor > 0) input.classList.add('positivo');
    else if (novoValor < 0) input.classList.add('negativo');

    atualizarTotaisSecundarios();
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

    // Atualizar bases
    document.getElementById('PVBase').textContent = ST;
    document.getElementById('PFBase').textContent = HT;
    document.getElementById('VontadeBase').textContent = IQ;
    document.getElementById('PercepcaoBase').textContent = IQ;

    const deslocamentoBase = (HT + DX) / 4;
    document.getElementById('DeslocamentoBase').textContent = deslocamentoBase.toFixed(2);

    // Atualizar cargas - FUNÇÃO CRÍTICA
    atualizarCargas(ST);
    
    // Calcular custos
    calcularCustos();
    
    // Atualizar totais
    atualizarTotaisSecundarios();
}

// FUNÇÃO CRÍTICA - CARGAS CORRETAS
function atualizarCargas(ST) {
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;

    const cargas = cargasTable[stKey];
    if (cargas) {
        // Apenas 1 casa decimal para valores pequenos
        const formatar = (valor) => {
            if (valor < 10) return valor.toFixed(1);
            return valor.toFixed(0);
        };

        document.getElementById('cargaNenhuma').textContent = formatar(cargas.nenhuma);
        document.getElementById('cargaLeve').textContent = formatar(cargas.leve);
        document.getElementById('cargaMedia').textContent = formatar(cargas.media);
        document.getElementById('cargaPesada').textContent = formatar(cargas.pesada);
        document.getElementById('cargaMuitoPesada').textContent = formatar(cargas.muitoPesada);
        
        console.log('🏋️ Cargas para ST ' + ST + ':', cargas);
    }
}

// CÁLCULO DE CUSTOS - CORRETO
function calcularCustos() {
    const ST = personagemAtributos.ST;
    const DX = personagemAtributos.DX;
    const IQ = personagemAtributos.IQ;
    const HT = personagemAtributos.HT;

    // Cálculo CORRETO GURPS
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

    // Estilo
    pontosElement.classList.remove('excedido');
    if (totalGastos > 150) {
        pontosElement.classList.add('excedido');
    }
    
    // Reportar para pontos manager
    if (typeof pontosManager !== 'undefined') {
        pontosManager.atualizarPontosAba('atributos', totalGastos);
    }
    
    return totalGastos;
}

function atualizarTotaisSecundarios() {
    const pvTotal = Math.max(personagemAtributos.ST + (personagemAtributos.bonus.PV || 0), 1);
    document.getElementById('PVTotal').textContent = pvTotal;

    const pfTotal = Math.max(personagemAtributos.HT + (personagemAtributos.bonus.PF || 0), 1);
    document.getElementById('PFTotal').textContent = pfTotal;

    const vontadeTotal = Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Vontade || 0), 1);
    document.getElementById('VontadeTotal').textContent = vontadeTotal;

    const percepcaoTotal = Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Percepcao || 0), 1);
    document.getElementById('PercepcaoTotal').textContent = percepcaoTotal;

    const deslocamentoBase = (personagemAtributos.HT + personagemAtributos.DX) / 4;
    const deslocamentoTotal = Math.max(deslocamentoBase + (personagemAtributos.bonus.Deslocamento || 0), 0).toFixed(2);
    document.getElementById('DeslocamentoTotal').textContent = deslocamentoTotal;
}

// ===========================================
// FIREBASE - FUNÇÕES SIMPLES
// ===========================================

async function salvarNoFirebase() {
    console.log('💾 Salvando atributos...');
    
    // Preparar dados
    const dados = {
        ST: personagemAtributos.ST,
        DX: personagemAtributos.DX,
        IQ: personagemAtributos.IQ,
        HT: personagemAtributos.HT,
        bonus: { ...personagemAtributos.bonus },
        ultimaAtualizacao: new Date().toISOString()
    };
    
    // Salvar no Firebase se disponível
    if (typeof firebaseService !== 'undefined' && firebaseService.saveModule) {
        try {
            await firebaseService.saveModule('atributos', dados);
            console.log('✅ Atributos salvos no Firebase');
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
        }
    }
}

async function carregarDoFirebase() {
    console.log('📥 Carregando atributos...');
    
    if (typeof firebaseService !== 'undefined' && firebaseService.loadCharacter) {
        try {
            const dados = await firebaseService.loadCharacter();
            if (dados?.atributos) {
                const att = dados.atributos;
                
                // Carregar valores
                if (att.ST !== undefined) {
                    personagemAtributos.ST = att.ST;
                    document.getElementById('ST').value = att.ST;
                }
                if (att.DX !== undefined) {
                    personagemAtributos.DX = att.DX;
                    document.getElementById('DX').value = att.DX;
                }
                if (att.IQ !== undefined) {
                    personagemAtributos.IQ = att.IQ;
                    document.getElementById('IQ').value = att.IQ;
                }
                if (att.HT !== undefined) {
                    personagemAtributos.HT = att.HT;
                    document.getElementById('HT').value = att.HT;
                }
                
                // Carregar bônus
                if (att.bonus) {
                    Object.keys(personagemAtributos.bonus).forEach(key => {
                        if (att.bonus[key] !== undefined) {
                            personagemAtributos.bonus[key] = att.bonus[key];
                            const input = document.getElementById('bonus' + key);
                            if (input) input.value = att.bonus[key];
                        }
                    });
                }
                
                console.log('✅ Atributos carregados:', personagemAtributos);
                atualizarTudo();
                return true;
            }
        } catch (error) {
            console.error('❌ Erro ao carregar:', error);
        }
    }
    return false;
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

function inicializarAtributos() {
    console.log('🚀 Inicializando atributos...');
    
    // Configurar eventos dos inputs
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            input.addEventListener('change', function() {
                let valor = parseInt(this.value) || 10;
                if (valor < 1) valor = 1;
                if (valor > 40) valor = 40;
                
                personagemAtributos[atributo] = valor;
                atualizarTudo();
                salvarNoFirebase();
            });
        }
    });
    
    // Configurar bônus
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById('bonus' + atributo);
        if (input) {
            input.addEventListener('change', function() {
                let valor;
                if (atributo === 'Deslocamento') {
                    valor = parseFloat(this.value) || 0;
                } else {
                    valor = parseInt(this.value) || 0;
                }
                
                personagemAtributos.bonus[atributo] = valor;
                atualizarTotaisSecundarios();
                salvarNoFirebase();
            });
        }
    });
    
    // Carregar dados salvos
    setTimeout(() => {
        carregarDoFirebase();
    }, 1000);
    
    // Primeira atualização
    atualizarTudo();
}

// ===========================================
// INICIAR QUANDO A ABA FOR ATIVADA
// ===========================================

function initAtributosTab() {
    console.log('🎯 Iniciando aba de atributos');
    
    // Pequeno delay para garantir que o DOM está pronto
    setTimeout(() => {
        if (document.getElementById('ST')) {
            inicializarAtributos();
        } else {
            console.warn('⚠️ Elementos não encontrados, tentando novamente...');
            setTimeout(initAtributosTab, 500);
        }
    }, 100);
}

// ===========================================
// EXPORTAR FUNÇÕES
// ===========================================

window.alterarAtributo = alterarAtributo;
window.ajustarSecundario = ajustarSecundario;
window.initAtributosTab = initAtributosTab;
window.getAtributosPersonagem = () => ({ ...personagemAtributos });
window.getCargasPersonagem = () => {
    const ST = personagemAtributos.ST;
    let stKey = ST > 20 ? 20 : (ST < 1 ? 1 : ST);
    return cargasTable[stKey] || cargasTable[10];
};

// Iniciar se a aba já estiver ativa
if (document.getElementById('atributos')?.classList.contains('active')) {
    initAtributosTab();
}

console.log('✅ atributos.js carregado - TABELA CORRIGIDA');