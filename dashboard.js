// ===========================================
// DASHBOARD.JS - Sistema de Sincronização da Dashboard
// ===========================================

// Estado global do personagem para a dashboard
let dashboardPersonagem = {
    // Identificação (sincronizado com a própria dashboard)
    nome: '',
    raca: 'Humano',
    ocupacao: '',
    jogador: '',
    
    // Atributos (sincronizado com atributos.js)
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    PV: 10,  // ST base + bônus
    PF: 10,  // HT base + bônus
    Vontade: 10,  // IQ base + bônus
    Percepcao: 10, // IQ base + bônus
    Deslocamento: 5.00,
    
    // Pontos
    pontosIniciais: 100,
    limiteDesvantagens: -75,
    pontosGastosAtributos: 0,
    pontosGastosVantagens: 0,
    pontosGanhosDesvantagens: 0,
    pontosGastosPeculiaridades: 0,
    pontosGastosPericias: 0,
    pontosGastosTecnicas: 0,
    pontosGastosMagias: 0,
    
    // Status Social
    status: 0,
    reputacao: 0,
    aparencia: 0,
    modificadorReacao: 0,
    
    // Finanças
    dinheiro: 0,
    nivelRiqueza: 'Médio',
    pesoEquipamentos: 0,
    nivelCarga: 'Nenhuma',
    
    // Contadores
    totalVantagens: 0,
    totalDesvantagens: 0,
    totalPericias: 0,
    totalMagias: 0,
    totalIdiomas: 1,
    totalRelacionamentos: 0,
    
    // Timestamp
    ultimaAtualizacao: null
};

// ===== SISTEMA DE PONTOS =====

// Calcular custo dos atributos (mesma lógica do atributos.js)
function calcularCustoAtributos() {
    const ST = dashboardPersonagem.ST;
    const DX = dashboardPersonagem.DX;
    const IQ = dashboardPersonagem.IQ;
    const HT = dashboardPersonagem.HT;
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    return custoST + custoDX + custoIQ + custoHT;
}

// Calcular saldo disponível
function calcularSaldoDisponivel() {
    const pontosIniciais = dashboardPersonagem.pontosIniciais;
    const gastosAtributos = dashboardPersonagem.pontosGastosAtributos;
    const gastosVantagens = dashboardPersonagem.pontosGastosVantagens;
    const ganhosDesvantagens = Math.abs(dashboardPersonagem.pontosGanhosDesvantagens); // Valor positivo
    const gastosPeculiaridades = dashboardPersonagem.pontosGastosPeculiaridades;
    const gastosPericias = dashboardPersonagem.pontosGastosPericias;
    const gastosTecnicas = dashboardPersonagem.pontosGastosTecnicas;
    const gastosMagias = dashboardPersonagem.pontosGastosMagias;
    
    const totalGastos = gastosAtributos + gastosVantagens + gastosPeculiaridades + 
                       gastosPericias + gastosTecnicas + gastosMagias;
    
    const totalGanhos = ganhosDesvantagens;
    
    return pontosIniciais - totalGastos + totalGanhos;
}

// Calcular porcentagem
function calcularPorcentagem(valor, total) {
    if (total === 0) return 0;
    return Math.round((valor / total) * 100);
}

// ===== SINCRONIZAÇÃO COM ATRIBUTOS =====

function sincronizarAtributos() {
    // Buscar valores da aba Atributos
    const ST = parseInt(document.getElementById('ST')?.value) || 10;
    const DX = parseInt(document.getElementById('DX')?.value) || 10;
    const IQ = parseInt(document.getElementById('IQ')?.value) || 10;
    const HT = parseInt(document.getElementById('HT')?.value) || 10;
    
    // Buscar bônus
    const bonusPV = parseInt(document.getElementById('bonusPV')?.value) || 0;
    const bonusPF = parseInt(document.getElementById('bonusPF')?.value) || 0;
    const bonusVontade = parseInt(document.getElementById('bonusVontade')?.value) || 0;
    const bonusPercepcao = parseInt(document.getElementById('bonusPercepcao')?.value) || 0;
    const bonusDeslocamento = parseFloat(document.getElementById('bonusDeslocamento')?.value) || 0;
    
    // Atualizar dashboard
    dashboardPersonagem.ST = ST;
    dashboardPersonagem.DX = DX;
    dashboardPersonagem.IQ = IQ;
    dashboardPersonagem.HT = HT;
    
    // Calcular atributos secundários
    dashboardPersonagem.PV = Math.max(ST + bonusPV, 1);
    dashboardPersonagem.PF = Math.max(HT + bonusPF, 1);
    dashboardPersonagem.Vontade = Math.max(IQ + bonusVontade, 1);
    dashboardPersonagem.Percepcao = Math.max(IQ + bonusPercepcao, 1);
    
    const deslocamentoBase = (HT + DX) / 4;
    dashboardPersonagem.Deslocamento = Math.max(deslocamentoBase + bonusDeslocamento, 0).toFixed(2);
    
    // Atualizar custos
    dashboardPersonagem.pontosGastosAtributos = calcularCustoAtributos();
    
    console.log('✅ Atributos sincronizados:', dashboardPersonagem.ST, dashboardPersonagem.DX);
}

// ===== SINCRONIZAÇÃO COM VANTAGENS/DESVANTAGENS =====

function sincronizarVantagensDesvantagens() {
    // Buscar lista de vantagens (exemplo - ajustar conforme sua estrutura)
    const vantagensList = document.querySelectorAll('.vantagem-item') || [];
    let totalPontosVantagens = 0;
    
    vantagensList.forEach(item => {
        const pontos = parseInt(item.dataset.pontos) || 0;
        totalPontosVantagens += pontos;
    });
    
    // Buscar lista de desvantagens
    const desvantagensList = document.querySelectorAll('.desvantagem-item') || [];
    let totalPontosDesvantagens = 0;
    
    desvantagensList.forEach(item => {
        const pontos = parseInt(item.dataset.pontos) || 0;
        totalPontosDesvantagens += pontos;
    });
    
    // Atualizar dashboard
    dashboardPersonagem.pontosGastosVantagens = totalPontosVantagens;
    dashboardPersonagem.pontosGanhosDesvantagens = totalPontosDesvantagens; // Negativo
    dashboardPersonagem.totalVantagens = vantagensList.length;
    dashboardPersonagem.totalDesvantagens = desvantagensList.length;
    
    console.log('✅ Vantagens/Desvantagens sincronizadas');
}

// ===== SINCRONIZAÇÃO COM PERÍCIAS =====

function sincronizarPericias() {
    // Buscar lista de perícias (exemplo)
    const periciasList = document.querySelectorAll('.pericia-item') || [];
    let totalPontosPericias = 0;
    
    periciasList.forEach(item => {
        const pontos = parseInt(item.dataset.pontos) || 0;
        totalPontosPericias += pontos;
    });
    
    dashboardPersonagem.pontosGastosPericias = totalPontosPericias;
    dashboardPersonagem.totalPericias = periciasList.length;
    
    console.log('✅ Perícias sincronizadas');
}

// ===== SINCRONIZAÇÃO COM MAGIAS =====

function sincronizarMagias() {
    // Buscar lista de magias (exemplo)
    const magiasList = document.querySelectorAll('.magia-item') || [];
    let totalPontosMagias = 0;
    
    magiasList.forEach(item => {
        const pontos = parseInt(item.dataset.pontos) || 0;
        totalPontosMagias += pontos;
    });
    
    dashboardPersonagem.pontosGastosMagias = totalPontosMagias;
    dashboardPersonagem.totalMagias = magiasList.length;
    
    console.log('✅ Magias sincronizadas');
}

// ===== SINCRONIZAÇÃO COM EQUIPAMENTOS =====

function sincronizarEquipamentos() {
    // Exemplo - ajustar conforme sua estrutura
    const pesoTotal = parseFloat(document.getElementById('peso-total')?.textContent) || 0;
    const dinheiro = parseFloat(document.getElementById('dinheiro-atual')?.value) || 0;
    
    dashboardPersonagem.pesoEquipamentos = pesoTotal;
    dashboardPersonagem.dinheiro = dinheiro;
    
    // Calcular nível de carga baseado na ST e peso
    const ST = dashboardPersonagem.ST;
    let nivelCarga = 'Nenhuma';
    
    if (ST <= 10) {
        const limites = [1, 2, 3, 6, 10]; // Para ST 10
        if (pesoTotal <= limites[0]) nivelCarga = 'Nenhuma';
        else if (pesoTotal <= limites[1]) nivelCarga = 'Leve';
        else if (pesoTotal <= limites[2]) nivelCarga = 'Média';
        else if (pesoTotal <= limites[3]) nivelCarga = 'Pesada';
        else if (pesoTotal <= limites[4]) nivelCarga = 'Extrema';
    }
    // Adicionar mais cálculos para outros valores de ST...
    
    dashboardPersonagem.nivelCarga = nivelCarga;
    
    console.log('✅ Equipamentos sincronizados');
}

// ===== SINCRONIZAÇÃO COMPLETA =====

function sincronizarTudo() {
    console.log('🔄 Sincronizando dashboard...');
    
    // Sincronizar todas as seções
    sincronizarAtributos();
    sincronizarVantagensDesvantagens();
    sincronizarPericias();
    sincronizarMagias();
    sincronizarEquipamentos();
    
    // Atualizar timestamp
    dashboardPersonagem.ultimaAtualizacao = new Date();
    
    // Atualizar UI da dashboard
    atualizarDashboardUI();
    
    // Salvar no localStorage
    salvarDashboardLocal();
    
    console.log('✅ Dashboard sincronizada!');
}

// ===== ATUALIZAR UI DA DASHBOARD =====

function atualizarDashboardUI() {
    // Atualizar identificação
    document.getElementById('char-name').value = dashboardPersonagem.nome || '';
    document.getElementById('char-race').value = dashboardPersonagem.raca || '';
    document.getElementById('char-type').value = dashboardPersonagem.ocupacao || '';
    document.getElementById('char-player').value = dashboardPersonagem.jogador || '';
    
    // Atualizar atributos no resumo
    document.getElementById('summary-st').textContent = dashboardPersonagem.ST;
    document.getElementById('summary-dx').textContent = dashboardPersonagem.DX;
    document.getElementById('summary-iq').textContent = dashboardPersonagem.IQ;
    document.getElementById('summary-ht').textContent = dashboardPersonagem.HT;
    document.getElementById('summary-hp').textContent = dashboardPersonagem.PV;
    document.getElementById('summary-fp').textContent = dashboardPersonagem.PF;
    document.getElementById('summary-will').textContent = dashboardPersonagem.Vontade;
    document.getElementById('summary-per').textContent = dashboardPersonagem.Percepcao;
    
    // Atualizar pontos iniciais e limite
    document.getElementById('start-points').value = dashboardPersonagem.pontosIniciais;
    document.getElementById('dis-limit').value = dashboardPersonagem.limiteDesvantagens;
    
    // Calcular saldo disponível
    const saldoDisponivel = calcularSaldoDisponivel();
    const pontosIniciais = dashboardPersonagem.pontosIniciais;
    
    // Atualizar distribuição de pontos
    document.getElementById('points-attr').textContent = dashboardPersonagem.pontosGastosAtributos;
    document.getElementById('points-adv').textContent = dashboardPersonagem.pontosGastosVantagens;
    document.getElementById('points-dis').textContent = dashboardPersonagem.pontosGanhosDesvantagens; // Negativo
    document.getElementById('points-pec').textContent = dashboardPersonagem.pontosGastosPeculiaridades || 0;
    document.getElementById('points-skills').textContent = dashboardPersonagem.pontosGastosPericias;
    document.getElementById('points-tech').textContent = dashboardPersonagem.pontosGastosTecnicas || 0;
    document.getElementById('points-spells').textContent = dashboardPersonagem.pontosGastosMagias;
    
    // Atualizar porcentagens
    document.getElementById('points-attr-percent').textContent = 
        calcularPorcentagem(dashboardPersonagem.pontosGastosAtributos, pontosIniciais) + '%';
    document.getElementById('points-adv-percent').textContent = 
        calcularPorcentagem(dashboardPersonagem.pontosGastosVantagens, pontosIniciais) + '%';
    document.getElementById('points-dis-percent').textContent = 
        calcularPorcentagem(Math.abs(dashboardPersonagem.pontosGanhosDesvantagens), pontosIniciais) + '%';
    document.getElementById('points-skills-percent').textContent = 
        calcularPorcentagem(dashboardPersonagem.pontosGastosPericias, pontosIniciais) + '%';
    document.getElementById('points-spells-percent').textContent = 
        calcularPorcentagem(dashboardPersonagem.pontosGastosMagias, pontosIniciais) + '%';
    
    // Atualizar saldo
    document.getElementById('points-balance').textContent = saldoDisponivel;
    document.getElementById('points-balance-percent').textContent = 
        calcularPorcentagem(saldoDisponivel, pontosIniciais) + '%';
    
    // Status do saldo
    const balanceElement = document.getElementById('points-balance');
    const statusElement = document.getElementById('points-status-indicator');
    const statusText = document.getElementById('points-status-text');
    
    balanceElement.classList.remove('saldo-negativo', 'saldo-baixo', 'saldo-normal');
    
    if (saldoDisponivel < 0) {
        balanceElement.classList.add('saldo-negativo');
        statusElement.style.background = '#f44336';
        statusText.textContent = 'Personagem inválido (pontos negativos)';
    } else if (saldoDisponivel < 10) {
        balanceElement.classList.add('saldo-baixo');
        statusElement.style.background = '#FF9800';
        statusText.textContent = 'Poucos pontos restantes';
    } else {
        balanceElement.classList.add('saldo-normal');
        statusElement.style.background = '#4CAF50';
        statusText.textContent = 'Personagem válido';
    }
    
    // Atualizar status social
    document.getElementById('status-value').textContent = dashboardPersonagem.status;
    document.getElementById('rep-value').textContent = dashboardPersonagem.reputacao;
    document.getElementById('app-value').textContent = dashboardPersonagem.aparencia;
    document.getElementById('reaction-total-compact').textContent = 
        (dashboardPersonagem.modificadorReacao >= 0 ? '+' : '') + dashboardPersonagem.modificadorReacao;
    
    // Atualizar finanças
    document.getElementById('current-money').textContent = '$' + dashboardPersonagem.dinheiro.toFixed(2);
    document.getElementById('wealth-level-display').textContent = dashboardPersonagem.nivelRiqueza;
    document.getElementById('equip-weight').textContent = dashboardPersonagem.pesoEquipamentos.toFixed(1) + ' kg';
    document.getElementById('enc-level-display').textContent = dashboardPersonagem.nivelCarga;
    
    // Atualizar contadores
    document.getElementById('counter-advantages').textContent = dashboardPersonagem.totalVantagens;
    document.getElementById('counter-disadvantages').textContent = dashboardPersonagem.totalDesvantagens;
    document.getElementById('counter-skills').textContent = dashboardPersonagem.totalPericias;
    document.getElementById('counter-spells').textContent = dashboardPersonagem.totalMagias;
    document.getElementById('counter-languages').textContent = dashboardPersonagem.totalIdiomas;
    document.getElementById('counter-relationships').textContent = dashboardPersonagem.totalRelacionamentos;
    
    // Atualizar status rápido (PV/PF)
    document.getElementById('quick-hp').textContent = dashboardPersonagem.PV;
    document.getElementById('quick-fp').textContent = dashboardPersonagem.PF;
    
    // Atualizar timestamp
    const timeStr = dashboardPersonagem.ultimaAtualizacao 
        ? dashboardPersonagem.ultimaAtualizacao.toLocaleTimeString('pt-BR', { hour12: false })
        : '--:--';
    
    document.getElementById('update-timestamp').textContent = timeStr;
    document.getElementById('last-update-time').textContent = timeStr;
    
    console.log('✅ UI da dashboard atualizada');
}

// ===== SALVAR/CARREGAR LOCAL =====

function salvarDashboardLocal() {
    try {
        localStorage.setItem('gurps_dashboard', JSON.stringify(dashboardPersonagem));
    } catch (error) {
        console.warn('Não foi possível salvar dashboard:', error);
    }
}

function carregarDashboardLocal() {
    try {
        const dados = localStorage.getItem('gurps_dashboard');
        if (dados) {
            const parsed = JSON.parse(dados);
            Object.assign(dashboardPersonagem, parsed);
            
            // Converter string de data de volta para objeto Date
            if (parsed.ultimaAtualizacao) {
                dashboardPersonagem.ultimaAtualizacao = new Date(parsed.ultimaAtualizacao);
            }
            
            return true;
        }
    } catch (error) {
        console.warn('Não foi possível carregar dashboard:', error);
    }
    return false;
}

// ===== FUNÇÕES DE CONTROLE DA DASHBOARD =====

function atualizarPontosIniciais(valor) {
    const pontos = parseInt(valor) || 100;
    if (pontos < 0) return;
    
    dashboardPersonagem.pontosIniciais = pontos;
    atualizarDashboardUI();
    salvarDashboardLocal();
}

function atualizarLimiteDesvantagens(valor) {
    const limite = parseInt(valor) || -75;
    if (limite > 0) return;
    
    dashboardPersonagem.limiteDesvantagens = limite;
    salvarDashboardLocal();
}

function atualizarStatusSocial(tipo, valor) {
    const numValor = parseInt(valor) || 0;
    
    switch(tipo) {
        case 'status':
            dashboardPersonagem.status = numValor;
            break;
        case 'reputacao':
            dashboardPersonagem.reputacao = numValor;
            break;
        case 'aparencia':
            dashboardPersonagem.aparencia = numValor;
            break;
    }
    
    // Calcular modificador total de reação
    dashboardPersonagem.modificadorReacao = 
        dashboardPersonagem.status + 
        dashboardPersonagem.reputacao + 
        dashboardPersonagem.aparencia;
    
    atualizarDashboardUI();
    salvarDashboardLocal();
}

// ===== OBSERVADOR DE MUDANÇAS =====

// Observar mudanças nos atributos
function iniciarObservadorAtributos() {
    // Observar inputs de atributos principais
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            input.addEventListener('input', () => {
                setTimeout(sincronizarTudo, 100);
            });
        }
    });
    
    // Observar bônus de atributos secundários
    ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(atributo => {
        const input = document.getElementById('bonus' + atributo);
        if (input) {
            input.addEventListener('input', () => {
                setTimeout(sincronizarTudo, 100);
            });
        }
    });
    
    console.log('👀 Observador de atributos iniciado');
}

// ===== INICIALIZAÇÃO =====

function iniciarDashboard() {
    console.log('📊 Inicializando dashboard...');
    
    // Carregar dados salvos
    carregarDashboardLocal();
    
    // Configurar eventos da dashboard
    document.getElementById('start-points')?.addEventListener('change', function() {
        atualizarPontosIniciais(this.value);
    });
    
    document.getElementById('dis-limit')?.addEventListener('change', function() {
        atualizarLimiteDesvantagens(this.value);
    });
    
    // Configurar botões de status social
    document.querySelectorAll('.mod-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tipo = this.closest('.mod-compact-row')?.dataset.tipo;
            const direcao = this.classList.contains('plus') ? 1 : -1;
            if (tipo) {
                const valorAtual = dashboardPersonagem[tipo] || 0;
                const novoValor = Math.max(Math.min(valorAtual + direcao, 4), -4);
                atualizarStatusSocial(tipo, novoValor);
            }
        });
    });
    
    // Configurar botão de atualização manual
    document.querySelector('.refresh-btn')?.addEventListener('click', sincronizarTudo);
    
    // Iniciar observador de mudanças
    iniciarObservadorAtributos();
    
    // Fazer primeira sincronização
    setTimeout(sincronizarTudo, 500);
    
    console.log('✅ Dashboard inicializada');
}

// ===== EXPORTAR FUNÇÕES =====

window.atualizarDashboard = sincronizarTudo;
window.definirPontosIniciais = atualizarPontosIniciais;
window.definirLimiteDesvantagens = atualizarLimiteDesvantagens;
window.ajustarModificador = atualizarStatusSocial;

// Inicializar quando a aba dashboard estiver ativa
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            iniciarDashboard();
        }
    });
} else {
    if (document.getElementById('dashboard')?.classList.contains('active')) {
        iniciarDashboard();
    }
}

// Inicializar quando mudar para a aba dashboard
document.addEventListener('tabChanged', function(event) {
    if (event.detail.tabId === 'dashboard') {
        iniciarDashboard();
    }
});