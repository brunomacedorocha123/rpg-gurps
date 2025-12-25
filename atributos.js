// ===========================================
// ATRIBUTOS.JS - Sistema Completo de Atributos GURPS - 100% FUNCIONAL
// ===========================================

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

// Estado do personagem
let personagemAtributos = {
    pontos: { total: 150, gastos: 0 },
    atributos: { ST: 10, DX: 10, IQ: 10, HT: 10 },
    bonus: {
        PV: 0,
        PF: 0,
        Vontade: 0,
        Percepcao: 0,
        Deslocamento: 0
    }
};

// ===== FUNÇÕES PRINCIPAIS =====

function alterarAtributo(atributo, valor) {
    const input = document.getElementById(atributo);
    if (!input) return;
    
    let novoValor = parseInt(input.value) + valor;
    
    if (novoValor < 1) novoValor = 1;
    if (novoValor > 40) novoValor = 40;
    
    input.value = novoValor;
    input.classList.add('changed');
    setTimeout(() => input.classList.remove('changed'), 500);
    
    atualizarAtributos();
}

function atualizarAtributos() {
    // Obtém valores atuais
    const ST = parseInt(document.getElementById('ST').value) || 10;
    const DX = parseInt(document.getElementById('DX').value) || 10;
    const IQ = parseInt(document.getElementById('IQ').value) || 10;
    const HT = parseInt(document.getElementById('HT').value) || 10;
    
    // Atualiza estado
    personagemAtributos.atributos.ST = ST;
    personagemAtributos.atributos.DX = DX;
    personagemAtributos.atributos.IQ = IQ;
    personagemAtributos.atributos.HT = HT;
    
    // Executa todos os cálculos
    calcularAtributosSecundarios(ST, DX, IQ, HT);
    calcularDanoBase(ST);
    calcularCargas(ST);
    calcularPontos();
    atualizarCustos();
    atualizarTotaisComBonus();
    atualizarStatusAtributos();
    
    // Salvar automaticamente
    salvarAtributosLocal();
}

function calcularAtributosSecundarios(ST, DX, IQ, HT) {
    // Atualiza bases dos atributos secundários
    document.getElementById('PVBase').textContent = ST;      // PV = ST
    document.getElementById('PFBase').textContent = HT;      // PF = HT
    document.getElementById('VontadeBase').textContent = IQ; // Vontade = IQ
    document.getElementById('PercepcaoBase').textContent = IQ; // Percepção = IQ
    
    // Deslocamento = (HT + DX) / 4
    const deslocamentoBase = (HT + DX) / 4;
    document.getElementById('DeslocamentoBase').textContent = deslocamentoBase.toFixed(2);
    
    // Atualiza ST nas tabelas
    document.getElementById('currentST').textContent = ST;
    document.getElementById('currentST2').textContent = ST;
}

function calcularDanoBase(ST) {
    let stKey = ST;
    if (ST > 40) stKey = 40;
    if (ST < 1) stKey = 1;
    
    const dano = danoTable[stKey];
    if (dano) {
        document.getElementById('danoGDP').textContent = dano.gdp;
        document.getElementById('danoGEB').textContent = dano.geb;
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
    const ST = personagemAtributos.atributos.ST;
    const DX = personagemAtributos.atributos.DX;
    const IQ = personagemAtributos.atributos.IQ;
    const HT = personagemAtributos.atributos.HT;
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const totalGastos = custoST + custoDX + custoIQ + custoHT;
    
    personagemAtributos.pontos.gastos = totalGastos;
    
    // Atualiza display dos pontos
    const pontosElement = document.getElementById('pontosGastos');
    if (pontosElement) {
        pontosElement.textContent = totalGastos;
        
        // Adiciona classe se exceder pontos
        pontosElement.classList.remove('excedido');
        if (totalGastos > 150) {
            pontosElement.classList.add('excedido');
        }
    }
}

function atualizarCustos() {
    const ST = personagemAtributos.atributos.ST;
    const DX = personagemAtributos.atributos.DX;
    const IQ = personagemAtributos.atributos.IQ;
    const HT = personagemAtributos.atributos.HT;
    
    // Atualiza custos individuais
    document.getElementById('custoST').textContent = (ST - 10) * 10;
    document.getElementById('custoDX').textContent = (DX - 10) * 20;
    document.getElementById('custoIQ').textContent = (IQ - 10) * 20;
    document.getElementById('custoHT').textContent = (HT - 10) * 10;
}

function atualizarTotaisComBonus() {
    // PV: Base (ST) + Bônus/Redutor
    const pvBase = personagemAtributos.atributos.ST;
    const pvBonus = personagemAtributos.bonus.PV;
    const pvTotal = Math.max(pvBase + pvBonus, 1);
    document.getElementById('PVTotal').textContent = pvTotal;
    
    // PF: Base (HT) + Bônus/Redutor
    const pfBase = personagemAtributos.atributos.HT;
    const pfBonus = personagemAtributos.bonus.PF;
    const pfTotal = Math.max(pfBase + pfBonus, 1);
    document.getElementById('PFTotal').textContent = pfTotal;
    
    // Vontade: Base (IQ) + Bônus/Redutor
    const vontadeBase = personagemAtributos.atributos.IQ;
    const vontadeBonus = personagemAtributos.bonus.Vontade;
    const vontadeTotal = Math.max(vontadeBase + vontadeBonus, 1);
    document.getElementById('VontadeTotal').textContent = vontadeTotal;
    
    // Percepção: Base (IQ) + Bônus/Redutor
    const percepcaoBase = personagemAtributos.atributos.IQ;
    const percepcaoBonus = personagemAtributos.bonus.Percepcao;
    const percepcaoTotal = Math.max(percepcaoBase + percepcaoBonus, 1);
    document.getElementById('PercepcaoTotal').textContent = percepcaoTotal;
    
    // Deslocamento: Base ((HT+DX)/4) + Bônus/Redutor
    const deslocamentoBase = (personagemAtributos.atributos.HT + personagemAtributos.atributos.DX) / 4;
    const deslocamentoBonus = personagemAtributos.bonus.Deslocamento;
    const deslocamentoTotal = Math.max(deslocamentoBase + deslocamentoBonus, 0).toFixed(2);
    document.getElementById('DeslocamentoTotal').textContent = deslocamentoTotal;
}

function atualizarBonusInput(atributo) {
    const input = document.getElementById('bonus' + atributo);
    if (!input) return;
    
    // Converte valor
    let valor;
    if (atributo === 'Deslocamento') {
        valor = parseFloat(input.value) || 0;
    } else {
        valor = parseInt(input.value) || 0;
    }
    
    // Atualiza estado
    personagemAtributos.bonus[atributo] = valor;
    
    // Atualiza estilo do input
    input.classList.remove('positivo', 'negativo');
    if (valor > 0) {
        input.classList.add('positivo');
    } else if (valor < 0) {
        input.classList.add('negativo');
    }
    
    // Atualiza totais
    atualizarTotaisComBonus();
    
    // Atualiza status
    atualizarStatusAtributos();
    
    // Salva localmente
    salvarAtributosLocal();
}

// ===== FUNÇÕES DE STATUS =====

function atualizarStatusAtributos() {
    const statusElement = document.getElementById('statusAtributos');
    if (!statusElement) return;
    
    const gastos = personagemAtributos.pontos.gastos;
    
    // Limpa e atualiza status
    statusElement.className = 'status-mensagem';
    
    if (gastos > 150) {
        statusElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ATENÇÃO: Você excedeu ${gastos - 150} pontos nos atributos!`;
        statusElement.style.background = 'linear-gradient(145deg, rgba(139, 0, 0, 0.4), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '2px solid #f44336';
        statusElement.style.color = '#ffabab';
    } else if (gastos === 150) {
        statusElement.innerHTML = `<i class="fas fa-check-circle"></i> Perfeito! Você usou todos os pontos disponíveis.`;
        statusElement.style.background = 'linear-gradient(145deg, rgba(46, 92, 58, 0.4), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '2px solid #4CAF50';
        statusElement.style.color = '#a5d6a7';
    } else if (gastos > 0) {
        statusElement.innerHTML = `<i class="fas fa-info-circle"></i> Gastou ${gastos} pontos dos 150 disponíveis.`;
        statusElement.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '2px solid var(--primary-gold)';
        statusElement.style.color = 'var(--secondary-gold)';
    } else {
        statusElement.innerHTML = `<i class="fas fa-info-circle"></i> Atributos no valor padrão (0 pontos gastos).`;
        statusElement.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.1), rgba(44, 32, 8, 0.9))';
        statusElement.style.border = '1px solid var(--primary-gold)';
        statusElement.style.color = 'var(--secondary-gold)';
    }
}

// ===== SALVAMENTO LOCAL =====

function salvarAtributosLocal() {
    try {
        const dados = obterDadosAtributos();
        localStorage.setItem('gurps_atributos', JSON.stringify(dados));
    } catch (error) {
        console.warn('Não foi possível salvar atributos localmente:', error);
    }
}

function carregarAtributosLocal() {
    try {
        const dadosSalvos = localStorage.getItem('gurps_atributos');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            carregarDadosAtributos(dados);
            return true;
        }
    } catch (error) {
        console.warn('Não foi possível carregar atributos salvos:', error);
    }
    return false;
}

// ===== INICIALIZAÇÃO =====

function inicializarAtributos() {
    console.log('⚔️ Inicializando sistema de atributos...');
    
    configurarEventListeners();
    
    // Tenta carregar dados salvos
    if (!carregarAtributosLocal()) {
        // Se não houver dados salvos, inicializa com valores padrão
        atualizarAtributos();
    }
    
    console.log('✅ Sistema de atributos inicializado');
}

function configurarEventListeners() {
    // Event listeners para atributos principais (ST, DX, IQ, HT)
    ['ST', 'DX', 'IQ', 'HT'].forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // Debounce para input (atualiza após 300ms sem digitar)
            input.addEventListener('input', () => {
                clearTimeout(window.inputTimeout);
                window.inputTimeout = setTimeout(atualizarAtributos, 300);
            });
            
            // Atualiza imediatamente ao sair do campo
            input.addEventListener('change', atualizarAtributos);
        }
    });
    
    // Event listeners para bônus/redutores - CORRETO!
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById('bonus' + atributo);
        if (input) {
            // Debounce para input
            input.addEventListener('input', function() {
                clearTimeout(window.bonusTimeout);
                window.bonusTimeout = setTimeout(() => {
                    atualizarBonusInput(atributo);
                }, 300);
            });
            
            // Atualiza imediatamente ao sair do campo
            input.addEventListener('change', function() {
                atualizarBonusInput(atributo);
            });
            
            // Aplica estilo inicial baseado no valor atual
            const valorInicial = parseInt(input.value) || 0;
            input.classList.remove('positivo', 'negativo');
            if (valorInicial > 0) {
                input.classList.add('positivo');
            } else if (valorInicial < 0) {
                input.classList.add('negativo');
            }
        }
    });
}

// ===== INTEGRAÇÃO COM O SISTEMA PRINCIPAL =====

function obterDadosAtributos() {
    return {
        ST: personagemAtributos.atributos.ST,
        DX: personagemAtributos.atributos.DX,
        IQ: personagemAtributos.atributos.IQ,
        HT: personagemAtributos.atributos.HT,
        PV: personagemAtributos.atributos.ST + personagemAtributos.bonus.PV,
        PF: personagemAtributos.atributos.HT + personagemAtributos.bonus.PF,
        Vontade: personagemAtributos.atributos.IQ + personagemAtributos.bonus.Vontade,
        Percepcao: personagemAtributos.atributos.IQ + personagemAtributos.bonus.Percepcao,
        Deslocamento: parseFloat(document.getElementById('DeslocamentoTotal').textContent || "5.00"),
        DanoGDP: document.getElementById('danoGDP')?.textContent || "1d-2",
        DanoGEB: document.getElementById('danoGEB')?.textContent || "1d",
        PontosGastos: personagemAtributos.pontos.gastos,
        Bonus: { ...personagemAtributos.bonus }
    };
}

function carregarDadosAtributos(dados) {
    // Carrega atributos principais
    if (dados.ST) {
        document.getElementById('ST').value = dados.ST;
        personagemAtributos.atributos.ST = dados.ST;
    }
    if (dados.DX) {
        document.getElementById('DX').value = dados.DX;
        personagemAtributos.atributos.DX = dados.DX;
    }
    if (dados.IQ) {
        document.getElementById('IQ').value = dados.IQ;
        personagemAtributos.atributos.IQ = dados.IQ;
    }
    if (dados.HT) {
        document.getElementById('HT').value = dados.HT;
        personagemAtributos.atributos.HT = dados.HT;
    }
    
    // Carrega bônus/redutores se existirem
    if (dados.Bonus) {
        personagemAtributos.bonus = { ...personagemAtributos.bonus, ...dados.Bonus };
        
        // Atualiza inputs de bônus
        ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
            const input = document.getElementById('bonus' + atributo);
            if (input && personagemAtributos.bonus[atributo] !== undefined) {
                input.value = personagemAtributos.bonus[atributo];
                
                // Aplica estilo
                input.classList.remove('positivo', 'negativo');
                if (personagemAtributos.bonus[atributo] > 0) {
                    input.classList.add('positivo');
                } else if (personagemAtributos.bonus[atributo] < 0) {
                    input.classList.add('negativo');
                }
            }
        });
    }
    
    // Força atualização completa
    atualizarAtributos();
}

// ===== FUNÇÃO PARA INICIALIZAR ABA =====

function initAtributosTab() {
    console.log('🔧 Inicializando aba de Atributos...');
    
    // Aguarda um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        inicializarAtributos();
    }, 100);
}

// ===== EXPORTAÇÃO DE FUNÇÕES =====

window.alterarAtributo = alterarAtributo;
window.atualizarAtributos = atualizarAtributos;
window.obterDadosAtributos = obterDadosAtributos;
window.carregarDadosAtributos = carregarDadosAtributos;
window.inicializarAtributos = inicializarAtributos;
window.initAtributosTab = initAtributosTab;

// Inicialização automática quando o script é carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Se a aba de atributos já estiver visível, inicializa
        if (document.getElementById('atributos')?.classList.contains('active')) {
            initAtributosTab();
        }
    });
} else {
    // DOM já carregado
    if (document.getElementById('atributos')?.classList.contains('active')) {
        initAtributosTab();
    }
}