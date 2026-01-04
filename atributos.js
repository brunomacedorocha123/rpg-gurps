// ===========================================
// ATRIBUTOS.JS - SISTEMA COMPLETO DE ATRIBUTOS GURPS
// ===========================================

// TABELA DE CARGAS CORRETA (COM DECIMAIS EXATOS)
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

// TABELA DE DANO BASE CORRETA (GDP e GEB)
const tabelaDanoST = {
    1: { gdp: "1d-6", geb: "1d-5" }, 2: { gdp: "1d-6", geb: "1d-5" },
    3: { gdp: "1d-5", geb: "1d-4" }, 4: { gdp: "1d-5", geb: "1d-4" },
    5: { gdp: "1d-4", geb: "1d-3" }, 6: { gdp: "1d-4", geb: "1d-3" },
    7: { gdp: "1d-3", geb: "1d-2" }, 8: { gdp: "1d-3", geb: "1d-2" },
    9: { gdp: "1d-2", geb: "1d-1" }, 10: { gdp: "1d-2", geb: "1d" },
    11: { gdp: "1d-1", geb: "1d+1" }, 12: { gdp: "1d", geb: "1d+2" },
    13: { gdp: "1d", geb: "2d-1" }, 14: { gdp: "1d", geb: "2d" },
    15: { gdp: "1d+1", geb: "2d+1" }, 16: { gdp: "1d+1", geb: "2d+2" },
    17: { gdp: "1d+2", geb: "3d-1" }, 18: { gdp: "1d+2", geb: "3d" },
    19: { gdp: "2d-1", geb: "3d+1" }, 20: { gdp: "2d-1", geb: "3d+2" },
    21: { gdp: "2d", geb: "4d-1" }, 22: { gdp: "2d", geb: "4d" },
    23: { gdp: "2d+1", geb: "4d+1" }, 24: { gdp: "2d+1", geb: "4d+2" },
    25: { gdp: "2d+2", geb: "5d-1" }, 26: { gdp: "2d+2", geb: "5d" },
    27: { gdp: "3d-1", geb: "5d+1" }, 28: { gdp: "3d-1", geb: "5d+1" },
    29: { gdp: "3d", geb: "5d+2" }, 30: { gdp: "3d", geb: "5d+2" },
    31: { gdp: "3d+1", geb: "6d-1" }, 32: { gdp: "3d+1", geb: "6d" },
    33: { gdp: "3d+2", geb: "6d+1" }, 34: { gdp: "3d+2", geb: "6d+2" },
    35: { gdp: "4d-1", geb: "7d-1" }, 36: { gdp: "4d-1", geb: "7d" },
    37: { gdp: "4d", geb: "7d+1" }, 38: { gdp: "4d", geb: "7d+2" },
    39: { gdp: "4d+1", geb: "8d-1" }, 40: { gdp: "4d+1", geb: "8d" }
};

// ESTADO DO PERSONAGEM
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

// VARIÁVEIS DE CONTROLE
let isSalvando = false;
let ultimoSave = null;

// ===========================================
// FUNÇÕES DE FORMATAÇÃO CORRETA
// ===========================================

// FUNÇÃO CORRIGIDA: Formatar números com decimais exatos
function formatarCarga(valor) {
    // Se for número inteiro, mostra sem decimal
    if (Number.isInteger(valor)) {
        return valor.toString();
    }
    
    // Para números decimais, mostrar com 1 casa decimal
    const strValor = valor.toString();
    const partes = strValor.split('.');
    
    if (partes.length === 1) {
        return strValor;
    }
    
    // Se a parte decimal for só ".0", mostra sem decimal
    if (partes[1] === '0') {
        return partes[0];
    }
    
    // Mostra com 1 casa decimal (14.5, não 14.50)
    const decimal = partes[1].length > 1 ? partes[1].substring(0, 1) : partes[1];
    return partes[0] + '.' + decimal;
}

// ===========================================
// FUNÇÕES PRINCIPAIS DE ATRIBUTOS
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
    salvarLocalAtributos();
    mostrarStatus(`Atributo ${atributo} alterado para ${novoValor}`, 'success');
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
    salvarLocalAtributos();
    mostrarStatus(`Bônus ${atributo} alterado para ${novoValor}`, 'info');
}

// ===========================================
// FUNÇÕES DE ATUALIZAÇÃO (CORRIGIDAS)
// ===========================================

function atualizarTudo() {
    const ST = personagemAtributos.ST;
    const DX = personagemAtributos.DX;
    const IQ = personagemAtributos.IQ;
    const HT = personagemAtributos.HT;

    // Atualizar ST nos lugares onde aparece
    document.querySelectorAll('#currentST, #currentST2').forEach(el => {
        el.textContent = ST;
    });

    // Atualizar bases dos atributos secundários
    document.getElementById('PVBase').textContent = ST;
    document.getElementById('PFBase').textContent = HT;
    document.getElementById('VontadeBase').textContent = IQ;
    document.getElementById('PercepcaoBase').textContent = IQ;

    const deslocamentoBase = (HT + DX) / 4;
    document.getElementById('DeslocamentoBase').textContent = deslocamentoBase.toFixed(2);

    // Atualizar tabela de dano
    atualizarDanoBase(ST);
    
    // Atualizar cargas (COM FORMATAÇÃO CORRETA)
    atualizarCargas(ST);
    
    // Calcular custos
    calcularCustos();
    
    // Atualizar totais
    atualizarTotaisSecundarios();
}

// FUNÇÃO CORRIGIDA: Mostrar cargas com decimais exatos
function atualizarCargas(ST) {
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;

    const cargas = cargasTable[stKey];
    if (cargas) {
        // USAR FUNÇÃO DE FORMATAÇÃO CORRETA
        document.getElementById('cargaNenhuma').textContent = formatarCarga(cargas.nenhuma);
        document.getElementById('cargaLeve').textContent = formatarCarga(cargas.leve);
        document.getElementById('cargaMedia').textContent = formatarCarga(cargas.media);
        document.getElementById('cargaPesada').textContent = formatarCarga(cargas.pesada);
        document.getElementById('cargaMuitoPesada').textContent = formatarCarga(cargas.muitoPesada);
    }
}

function atualizarDanoBase(ST) {
    let stKey = ST;
    if (ST > 40) stKey = 40;
    if (ST < 1) stKey = 1;
    
    const dano = tabelaDanoST[stKey] || tabelaDanoST[10];
    
    if (dano) {
        document.getElementById('danoGDP').textContent = dano.gdp;
        document.getElementById('danoGEB').textContent = dano.geb;
    }
}

function calcularCustos() {
    const ST = personagemAtributos.ST;
    const DX = personagemAtributos.DX;
    const IQ = personagemAtributos.IQ;
    const HT = personagemAtributos.HT;

    // Cálculo GURPS
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
        mostrarStatus(`ATENÇÃO: ${totalGastos} pontos gastos (limite: 150)`, 'warning');
    }
    
    // Reportar para pontos manager
    if (window.pontosManager && typeof window.pontosManager.atualizarPontosAba === 'function') {
        window.pontosManager.atualizarPontosAba('atributos', totalGastos);
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
// SISTEMA DE SALVAMENTO HÍBRIDO
// ===========================================

// SALVAMENTO LOCAL (automático)
function salvarLocalAtributos() {
    const dados = {
        atributos: {
            ST: personagemAtributos.ST,
            DX: personagemAtributos.DX,
            IQ: personagemAtributos.IQ,
            HT: personagemAtributos.HT,
            bonus: { ...personagemAtributos.bonus }
        },
        totais: {
            PV: Math.max(personagemAtributos.ST + (personagemAtributos.bonus.PV || 0), 1),
            PF: Math.max(personagemAtributos.HT + (personagemAtributos.bonus.PF || 0), 1),
            Vontade: Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Vontade || 0), 1),
            Percepcao: Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Percepcao || 0), 1),
            Deslocamento: calcularDeslocamentoTotal()
        },
        cargas: obterCargasAtuais(),
        danoBase: obterDanoBase(),
        custos: {
            ST: (personagemAtributos.ST - 10) * 10,
            DX: (personagemAtributos.DX - 10) * 20,
            IQ: (personagemAtributos.IQ - 10) * 20,
            HT: (personagemAtributos.HT - 10) * 10
        },
        ultimaAtualizacao: new Date().toISOString()
    };
    
    localStorage.setItem('gurps_atributos', JSON.stringify(dados));
}

// SALVAMENTO NO FIREBASE (apenas no botão)
async function salvarAtributosNoFirebase() {
    if (isSalvando) return;
    
    isSalvando = true;
    mostrarStatus('Salvando no Firebase...', 'loading');
    
    try {
        // Preparar dados separados por coleções
        const dadosParaFirebase = {
            atributos: {
                ...personagemAtributos,
                ultimaAtualizacao: new Date().toISOString()
            },
            pontos: {
                atributos: calcularCustos(),
                total: calcularCustos(),
                atualizadoEm: new Date().toISOString()
            },
            status: {
                PV: Math.max(personagemAtributos.ST + (personagemAtributos.bonus.PV || 0), 1),
                PF: Math.max(personagemAtributos.HT + (personagemAtributos.bonus.PF || 0), 1),
                Vontade: Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Vontade || 0), 1),
                Percepcao: Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Percepcao || 0), 1),
                Deslocamento: calcularDeslocamentoTotal()
            },
            cargas: obterCargasAtuais(),
            danoBase: obterDanoBase(),
            atualizadoEm: new Date().toISOString()
        };
        
        // Salvar usando o firebaseService
        if (window.firebaseService && typeof window.firebaseService.saveModule === 'function') {
            await window.firebaseService.saveModule('atributos_completos', dadosParaFirebase);
            ultimoSave = new Date();
            mostrarStatus('✅ Atributos salvos no Firebase!', 'success');
            
            // Atualizar dados locais também
            salvarLocalAtributos();
            
            // Disparar evento para outras abas
            document.dispatchEvent(new CustomEvent('atributos-salvos', {
                detail: dadosParaFirebase
            }));
        } else {
            throw new Error('Firebase não disponível');
        }
        
    } catch (error) {
        console.error('❌ Erro ao salvar no Firebase:', error);
        mostrarStatus('❌ Erro ao salvar: ' + error.message, 'error');
    } finally {
        isSalvando = false;
    }
}

// CARREGAMENTO DOS DADOS
function carregarAtributos() {
    console.log('📥 Carregando atributos...');
    
    // 1. Tentar LocalStorage primeiro
    const localData = localStorage.getItem('gurps_atributos');
    if (localData) {
        try {
            const dados = JSON.parse(localData);
            aplicarDadosAtributos(dados);
            console.log('✅ Atributos carregados do LocalStorage');
            return;
        } catch (error) {
            console.error('❌ Erro ao carregar LocalStorage:', error);
        }
    }
    
    // 2. Tentar carregar do Firebase se disponível
    if (window.firebaseService && window.firebaseService.characterData) {
        const firebaseData = window.firebaseService.characterData;
        
        // Verificar em várias estruturas possíveis
        if (firebaseData.atributos_completos) {
            aplicarDadosAtributos(firebaseData.atributos_completos);
            console.log('✅ Atributos carregados do Firebase (completo)');
        } else if (firebaseData.atributos) {
            aplicarDadosAtributos(firebaseData);
            console.log('✅ Atributos carregados do Firebase (simples)');
        }
    }
}

// APLICAR DADOS CARREGADOS
function aplicarDadosAtributos(dados) {
    console.log('🔄 Aplicando dados:', dados);
    
    // Atributos principais
    if (dados.atributos) {
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            if (dados.atributos[atributo] !== undefined) {
                personagemAtributos[atributo] = dados.atributos[atributo];
                const input = document.getElementById(atributo);
                if (input) input.value = dados.atributos[atributo];
            }
        });
        
        // Bônus
        if (dados.atributos.bonus) {
            Object.keys(personagemAtributos.bonus).forEach(key => {
                if (dados.atributos.bonus[key] !== undefined) {
                    personagemAtributos.bonus[key] = dados.atributos.bonus[key];
                    const input = document.getElementById('bonus' + key);
                    if (input) {
                        input.value = dados.atributos.bonus[key];
                        input.classList.remove('positivo', 'negativo');
                        if (dados.atributos.bonus[key] > 0) input.classList.add('positivo');
                        else if (dados.atributos.bonus[key] < 0) input.classList.add('negativo');
                    }
                }
            });
        }
    }
    
    // Atualizar interface
    atualizarTudo();
}

// ===========================================
// FUNÇÕES AUXILIARES
// ===========================================

function calcularDeslocamentoTotal() {
    const base = (personagemAtributos.HT + personagemAtributos.DX) / 4;
    return Math.max(base + (personagemAtributos.bonus.Deslocamento || 0), 0).toFixed(2);
}

function obterCargasAtuais() {
    const ST = personagemAtributos.ST;
    let stKey = ST > 20 ? 20 : (ST < 1 ? 1 : ST);
    return cargasTable[stKey] || cargasTable[10];
}

function obterDanoBase() {
    const ST = personagemAtributos.ST;
    let stKey = ST;
    if (ST > 40) stKey = 40;
    if (ST < 1) stKey = 1;
    return tabelaDanoST[stKey] || tabelaDanoST[10];
}

function mostrarStatus(mensagem, tipo = 'info') {
    const statusElement = document.getElementById('statusAtributos');
    if (!statusElement) return;
    
    const icon = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle',
        'loading': 'fa-spinner fa-spin'
    }[tipo] || 'fa-info-circle';
    
    statusElement.innerHTML = `<i class="fas ${icon}"></i> <span>${mensagem}</span>`;
    statusElement.className = `status-mensagem ${tipo}`;
    
    // Auto-remover após 5 segundos (exceto loading)
    if (tipo !== 'loading') {
        setTimeout(() => {
            statusElement.innerHTML = '<i class="fas fa-info-circle"></i> <span>Sistema de atributos pronto.</span>';
            statusElement.className = 'status-mensagem';
        }, 5000);
    }
}

// ===========================================
// INICIALIZAÇÃO COMPLETA
// ===========================================

function inicializarAtributos() {
    console.log('🚀 Inicializando sistema de atributos...');
    
    // 1. Adicionar botão de salvar
    criarBotaoSalvar();
    
    // 2. Configurar eventos dos inputs
    configurarEventosInputs();
    
    // 3. Carregar dados salvos
    carregarAtributos();
    
    // 4. Atualizar interface
    atualizarTudo();
    
    // 5. Escutar eventos do Firebase
    configurarEventListeners();
    
    mostrarStatus('Sistema de atributos inicializado', 'success');
}

function criarBotaoSalvar() {
    const header = document.querySelector('.atributos-header');
    if (!header) return;
    
    // Remover botão existente
    const botaoExistente = document.getElementById('btnSalvarAtributos');
    if (botaoExistente) botaoExistente.remove();
    
    // Criar novo botão
    const botaoSalvar = document.createElement('button');
    botaoSalvar.id = 'btnSalvarAtributos';
    botaoSalvar.className = 'btn-salvar-atributos';
    botaoSalvar.innerHTML = '<i class="fas fa-save"></i> Salvar no Firebase';
    botaoSalvar.title = 'Clique para salvar todos os atributos no Firebase';
    botaoSalvar.onclick = salvarAtributosNoFirebase;
    
    // Adicionar ao header
    header.appendChild(botaoSalvar);
}

function configurarEventosInputs() {
    // Inputs principais (ST, DX, IQ, HT)
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            // Remover listeners antigos
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            // Adicionar novo listener
            newInput.addEventListener('change', function() {
                let valor = parseInt(this.value) || 10;
                if (valor < 1) valor = 1;
                if (valor > 40) valor = 40;
                
                this.value = valor;
                personagemAtributos[atributo] = valor;
                atualizarTudo();
                salvarLocalAtributos();
            });
            
            // Setas do teclado
            newInput.addEventListener('keydown', function(e) {
                if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    alterarAtributo(atributo, 1);
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    alterarAtributo(atributo, -1);
                }
            });
        }
    });
    
    // Bônus
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById('bonus' + atributo);
        if (input) {
            const newInput = input.cloneNode(true);
            input.parentNode.replaceChild(newInput, input);
            
            newInput.addEventListener('change', function() {
                let valor;
                if (atributo === 'Deslocamento') {
                    valor = parseFloat(this.value) || 0;
                    valor = Math.round(valor * 100) / 100;
                } else {
                    valor = parseInt(this.value) || 0;
                }
                
                if (valor < -10) valor = -10;
                if (valor > 20) valor = 20;
                
                this.value = valor;
                personagemAtributos.bonus[atributo] = valor;
                atualizarTotaisSecundarios();
                salvarLocalAtributos();
                
                this.classList.remove('positivo', 'negativo');
                if (valor > 0) this.classList.add('positivo');
                else if (valor < 0) this.classList.add('negativo');
            });
        }
    });
    
    // Botões de incremento
    document.querySelectorAll('.btn-atributo, .btn-secundario').forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
    });
}

function configurarEventListeners() {
    // Quando Firebase carregar dados
    document.addEventListener('firebase-loaded', function(e) {
        console.log('📡 Dados do Firebase recebidos em atributos.js');
        if (e.detail?.atributos_completos || e.detail?.atributos) {
            aplicarDadosAtributos(e.detail);
        }
    });
    
    // Quando outra aba salvar algo
    document.addEventListener('character-data-changed', function() {
        console.log('🔄 Dados do personagem atualizados, recarregando atributos...');
        carregarAtributos();
    });
}

// ===========================================
// EXPORTAR PARA O SISTEMA PRINCIPAL
// ===========================================

window.obterDadosAtributos = function() {
    return {
        atributos: { ...personagemAtributos },
        totais: {
            PV: Math.max(personagemAtributos.ST + (personagemAtributos.bonus.PV || 0), 1),
            PF: Math.max(personagemAtributos.HT + (personagemAtributos.bonus.PF || 0), 1),
            Vontade: Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Vontade || 0), 1),
            Percepcao: Math.max(personagemAtributos.IQ + (personagemAtributos.bonus.Percepcao || 0), 1),
            Deslocamento: calcularDeslocamentoTotal()
        },
        cargas: obterCargasAtuais(),
        danoBase: obterDanoBase(),
        pontos: calcularCustos(),
        ultimaAtualizacao: new Date().toISOString()
    };
};

window.salvarAtributosNoFirebase = salvarAtributosNoFirebase;
window.initAtributosTab = function() {
    setTimeout(() => {
        if (document.getElementById('ST')) {
            inicializarAtributos();
        } else {
            console.warn('⚠️ Elementos não encontrados, tentando novamente...');
            setTimeout(initAtributosTab, 500);
        }
    }, 100);
};

// ===========================================
// ESTILOS CSS ADICIONAIS (para o botão)
// ===========================================

const adicionarEstilos = () => {
    const style = document.createElement('style');
    style.textContent = `
        .btn-salvar-atributos {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(76, 175, 80, 0.2);
        }
        
        .btn-salvar-atributos:hover {
            background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 8px rgba(76, 175, 80, 0.3);
        }
        
        .btn-salvar-atributos:active {
            transform: translateY(0);
        }
        
        .status-mensagem {
            padding: 12px;
            border-radius: 8px;
            margin-top: 15px;
            transition: all 0.3s ease;
        }
        
        .status-mensagem.success {
            background-color: #d4edda;
            color: #155724;
            border-left: 4px solid #28a745;
        }
        
        .status-mensagem.error {
            background-color: #f8d7da;
            color: #721c24;
            border-left: 4px solid #dc3545;
        }
        
        .status-mensagem.warning {
            background-color: #fff3cd;
            color: #856404;
            border-left: 4px solid #ffc107;
        }
        
        .status-mensagem.loading {
            background-color: #e7f3ff;
            color: #004085;
            border-left: 4px solid #007bff;
        }
        
        .positivo {
            color: #28a745 !important;
            font-weight: bold;
        }
        
        .negativo {
            color: #dc3545 !important;
            font-weight: bold;
        }
        
        .excedido {
            color: #dc3545 !important;
            font-weight: bold;
            animation: pulse 1s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
};

// ===========================================
// INICIAR QUANDO A PÁGINA CARREGAR
// ===========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        adicionarEstilos();
        if (document.getElementById('atributos')?.classList.contains('active')) {
            window.initAtributosTab();
        }
    });
} else {
    adicionarEstilos();
    if (document.getElementById('atributos')?.classList.contains('active')) {
        window.initAtributosTab();
    }
}

console.log('✅ atributos.js carregado - SISTEMA HÍBRIDO ATIVADO');