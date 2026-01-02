// ===========================================
// DASHBOARD.JS - Sistema de Sincronização REAL-TIME
// ===========================================

// Estado global do personagem
let dashboardPersonagem = {
    nome: '',
    raca: 'Humano',
    ocupacao: '',
    jogador: '',
    
    // Atributos
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    PV: 10,
    PF: 10,
    Vontade: 10,
    Percepcao: 10,
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
    
    // Contadores
    totalVantagens: 0,
    totalDesvantagens: 0,
    totalPericias: 0,
    totalMagias: 0,
    totalIdiomas: 1,
    totalRelacionamentos: 0,
    
    ultimaAtualizacao: null
};

// ===== SISTEMA DE OBSERVAÇÃO EM TEMPO REAL =====

// Observar mudanças nos atributos de forma agressiva
let observadoresAtivos = [];

function iniciarObservadoresAgressivos() {
    console.log('🚀 Iniciando observadores agressivos...');
    
    // Limpar observadores antigos
    observadoresAtivos.forEach(obs => {
        if (obs.disconnect) obs.disconnect();
    });
    observadoresAtivos = [];
    
    // Função para observar mudanças em qualquer elemento
    function observarMudancas(seletor, callback) {
        const elementos = document.querySelectorAll(seletor);
        elementos.forEach(elemento => {
            if (elemento) {
                // Observar mudanças no valor
                const observer = new MutationObserver(callback);
                observer.observe(elemento, {
                    attributes: true,
                    attributeFilter: ['value', 'textContent', 'innerText', 'data-value']
                });
                
                // Também observar input events
                elemento.addEventListener('input', callback);
                elemento.addEventListener('change', callback);
                
                observadoresAtivos.push(observer);
                
                // Configurar para remover o event listener quando desconectar
                elemento._dashboardCallback = callback;
            }
        });
    }
    
    // Observar atributos principais
    observarMudancas('#ST, #DX, #IQ, #HT', () => {
        console.log('📈 Atributo principal alterado, sincronizando...');
        sincronizarAtributosImediato();
    });
    
    // Observar bônus
    observarMudancas('#bonusPV, #bonusPF, #bonusVontade, #bonusPercepcao, #bonusDeslocamento', () => {
        console.log('📊 Bônus alterado, sincronizando...');
        sincronizarAtributosImediato();
    });
    
    // Observar custos de atributos (que já estão calculados)
    observarMudancas('#custoST, #custoDX, #custoIQ, #custoHT', () => {
        console.log('💰 Custo alterado, atualizando pontos...');
        setTimeout(sincronizarPontosAtributos, 100);
    });
    
    // Observar pontos totais gastos
    observarMudancas('#pontosGastos', () => {
        console.log('💳 Pontos gastos alterados');
        setTimeout(sincronizarPontosAtributos, 100);
    });
    
    // Verificar periodicamente também (fallback)
    setInterval(sincronizarTudoComForca, 3000);
    
    console.log(`✅ ${observadoresAtivos.length} observadores ativos`);
}

// ===== SINCRONIZAÇÃO IMEDIATA DOS ATRIBUTOS =====

function sincronizarAtributosImediato() {
    console.log('⚡ Sincronização IMEDIATA de atributos');
    
    try {
        // Forçar leitura dos valores ATUAIS
        const ST = obterValorAtual('#ST');
        const DX = obterValorAtual('#DX');
        const IQ = obterValorAtual('#IQ');
        const HT = obterValorAtual('#HT');
        
        const bonusPV = obterValorAtual('#bonusPV');
        const bonusPF = obterValorAtual('#bonusPF');
        const bonusVontade = obterValorAtual('#bonusVontade');
        const bonusPercepcao = obterValorAtual('#bonusPercepcao');
        const bonusDeslocamento = obterValorAtual('#bonusDeslocamento');
        
        // Atualizar estado
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
        
        // Recalcular custos usando a mesma lógica do atributos.js
        const custoST = (ST - 10) * 10;
        const custoDX = (DX - 10) * 20;
        const custoIQ = (IQ - 10) * 20;
        const custoHT = (HT - 10) * 10;
        
        dashboardPersonagem.pontosGastosAtributos = custoST + custoDX + custoIQ + custoHT;
        
        console.log(`📊 Atributos atualizados: ST=${ST} (${custoST} pts), DX=${DX} (${custoDX} pts)`);
        
        // Atualizar UI imediatamente
        atualizarDashboardUIRapido();
        
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
    }
}

function obterValorAtual(seletor) {
    const elemento = document.querySelector(seletor);
    if (!elemento) return elemento.defaultValue || 0;
    
    // Tentar diferentes métodos para obter o valor
    const valor = elemento.value || elemento.textContent || elemento.innerText;
    const tipo = elemento.type;
    
    if (tipo === 'number' || tipo === 'text') {
        const num = parseFloat(valor);
        return isNaN(num) ? 0 : num;
    } else {
        const num = parseFloat(valor);
        return isNaN(num) ? 0 : num;
    }
}

function sincronizarPontosAtributos() {
    try {
        // Tentar pegar o valor já calculado do atributos.js
        const pontosGastosElement = document.querySelector('#pontosGastos');
        if (pontosGastosElement) {
            const texto = pontosGastosElement.textContent || pontosGastosElement.innerText;
            const pontos = parseInt(texto.replace(/[^\d-]/g, '')) || 0;
            
            if (pontos !== dashboardPersonagem.pontosGastosAtributos) {
                console.log(`💡 Pontos gastos atualizados: ${pontos} (anterior: ${dashboardPersonagem.pontosGastosAtributos})`);
                dashboardPersonagem.pontosGastosAtributos = pontos;
                atualizarDashboardUIRapido();
            }
        }
    } catch (error) {
        console.warn('⚠️ Não foi possível sincronizar pontos:', error);
    }
}

// ===== SINCRONIZAÇÃO COMPLETA COM FORÇA =====

function sincronizarTudoComForca() {
    console.log('💪 Sincronização FORÇADA');
    
    // Sincronizar atributos
    sincronizarAtributosImediato();
    
    // Buscar outras informações
    buscarOutrasInformacoes();
    
    // Atualizar timestamp
    dashboardPersonagem.ultimaAtualizacao = new Date();
    
    // Atualizar UI completa
    atualizarDashboardUI();
    
    // Salvar
    salvarDashboardLocal();
}

function buscarOutrasInformacoes() {
    // Buscar custos individuais para verificação
    const custoST = obterValorTexto('#custoST') || 0;
    const custoDX = obterValorTexto('#custoDX') || 0;
    const custoIQ = obterValorTexto('#custoIQ') || 0;
    const custoHT = obterValorTexto('#custoHT') || 0;
    
    const totalCalculado = parseInt(custoST) + parseInt(custoDX) + parseInt(custoIQ) + parseInt(custoHT);
    
    console.log(`🧮 Verificação: ST=${custoST}, DX=${custoDX}, IQ=${custoIQ}, HT=${custoHT}, Total=${totalCalculado}`);
    
    // Se houver diferença, usar o valor calculado
    if (totalCalculado !== 0 && totalCalculado !== dashboardPersonagem.pontosGastosAtributos) {
        dashboardPersonagem.pontosGastosAtributos = totalCalculado;
    }
}

function obterValorTexto(seletor) {
    const el = document.querySelector(seletor);
    if (!el) return '0';
    
    const texto = el.textContent || el.innerText || '0';
    return texto.replace(/[^\d-]/g, '');
}

// ===== ATUALIZAÇÃO RÁPIDA DA UI =====

function atualizarDashboardUIRapido() {
    // Atualizar apenas os valores críticos primeiro
    const saldo = calcularSaldoDisponivel();
    
    // Atributos no resumo
    atualizarElemento('#summary-st', dashboardPersonagem.ST);
    atualizarElemento('#summary-dx', dashboardPersonagem.DX);
    atualizarElemento('#summary-iq', dashboardPersonagem.IQ);
    atualizarElemento('#summary-ht', dashboardPersonagem.HT);
    atualizarElemento('#summary-hp', dashboardPersonagem.PV);
    atualizarElemento('#summary-fp', dashboardPersonagem.PF);
    atualizarElemento('#summary-will', dashboardPersonagem.Vontade);
    atualizarElemento('#summary-per', dashboardPersonagem.Percepcao);
    
    // Pontos gastos em atributos
    atualizarElemento('#points-attr', dashboardPersonagem.pontosGastosAtributos);
    
    // Saldo
    atualizarElemento('#points-balance', saldo);
    
    // Atualizar status do saldo
    atualizarStatusSaldo(saldo);
    
    // Status rápido
    atualizarElemento('#quick-hp', dashboardPersonagem.PV);
    atualizarElemento('#quick-fp', dashboardPersonagem.PF);
    
    // Timestamp
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour12: false });
    atualizarElemento('#update-timestamp', timeStr);
    atualizarElemento('#last-update-time', timeStr);
}

function atualizarElemento(seletor, valor) {
    const el = document.querySelector(seletor);
    if (el) {
        if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
            if (el.value !== String(valor)) {
                el.value = valor;
            }
        } else {
            if (el.textContent !== String(valor)) {
                el.textContent = valor;
            }
        }
    }
}

function calcularSaldoDisponivel() {
    const pontosIniciais = dashboardPersonagem.pontosIniciais;
    const gastosAtributos = dashboardPersonagem.pontosGastosAtributos;
    const gastosVantagens = dashboardPersonagem.pontosGastosVantagens;
    const ganhosDesvantagens = Math.abs(dashboardPersonagem.pontosGanhosDesvantagens);
    const gastosPeculiaridades = dashboardPersonagem.pontosGastosPeculiaridades;
    const gastosPericias = dashboardPersonagem.pontosGastosPericias;
    const gastosTecnicas = dashboardPersonagem.pontosGastosTecnicas;
    const gastosMagias = dashboardPersonagem.pontosGastosMagias;
    
    const totalGastos = gastosAtributos + gastosVantagens + gastosPeculiaridades + 
                       gastosPericias + gastosTecnicas + gastosMagias;
    
    return pontosIniciais - totalGastos + ganhosDesvantagens;
}

function atualizarStatusSaldo(saldo) {
    const balanceElement = document.querySelector('#points-balance');
    const statusElement = document.querySelector('#points-status-indicator');
    const statusText = document.querySelector('#points-status-text');
    
    if (!balanceElement || !statusElement || !statusText) return;
    
    // Remover classes anteriores
    balanceElement.classList.remove('saldo-negativo', 'saldo-baixo', 'saldo-normal');
    
    // Calcular porcentagem
    const pontosIniciais = dashboardPersonagem.pontosIniciais;
    const percentual = Math.round((saldo / pontosIniciais) * 100);
    document.querySelector('#points-balance-percent')?.textContent = percentual + '%';
    
    // Definir status
    if (saldo < 0) {
        balanceElement.classList.add('saldo-negativo');
        statusElement.style.background = '#f44336';
        statusText.textContent = 'Personagem inválido (pontos negativos)';
    } else if (saldo < pontosIniciais * 0.1) { // Menos de 10%
        balanceElement.classList.add('saldo-baixo');
        statusElement.style.background = '#FF9800';
        statusText.textContent = 'Poucos pontos restantes';
    } else {
        balanceElement.classList.add('saldo-normal');
        statusElement.style.background = '#4CAF50';
        statusText.textContent = 'Personagem válido';
    }
}

// ===== FUNÇÕES DE CONTROLE (mantidas do anterior) =====

function atualizarDashboardUI() {
    // ... (mantenha o mesmo código da versão anterior)
    console.log('🎨 Atualizando UI completa da dashboard');
    
    // Chama a rápida primeiro
    atualizarDashboardUIRapido();
    
    // Depois atualiza o resto
    const saldo = calcularSaldoDisponivel();
    const pontosIniciais = dashboardPersonagem.pontosIniciais;
    
    // Porcentagens
    const percentAttr = Math.round((dashboardPersonagem.pontosGastosAtributos / pontosIniciais) * 100);
    const percentAdv = Math.round((dashboardPersonagem.pontosGastosVantagens / pontosIniciais) * 100);
    const percentDis = Math.round((Math.abs(dashboardPersonagem.pontosGanhosDesvantagens) / pontosIniciais) * 100);
    const percentSkills = Math.round((dashboardPersonagem.pontosGastosPericias / pontosIniciais) * 100);
    const percentSpells = Math.round((dashboardPersonagem.pontosGastosMagias / pontosIniciais) * 100);
    
    atualizarElemento('#points-attr-percent', percentAttr + '%');
    atualizarElemento('#points-adv-percent', percentAdv + '%');
    atualizarElemento('#points-dis-percent', percentDis + '%');
    atualizarElemento('#points-skills-percent', percentSkills + '%');
    atualizarElemento('#points-spells-percent', percentSpells + '%');
    
    // Status social
    atualizarElemento('#status-value', dashboardPersonagem.status);
    atualizarElemento('#rep-value', dashboardPersonagem.reputacao);
    atualizarElemento('#app-value', dashboardPersonagem.aparencia);
    
    const modReacao = dashboardPersonagem.status + dashboardPersonagem.reputacao + dashboardPersonagem.aparencia;
    const modStr = (modReacao >= 0 ? '+' : '') + modReacao;
    atualizarElemento('#reaction-total-compact', modStr);
    
    // Contadores
    atualizarElemento('#counter-advantages', dashboardPersonagem.totalVantagens);
    atualizarElemento('#counter-disadvantages', dashboardPersonagem.totalDesvantagens);
    atualizarElemento('#counter-skills', dashboardPersonagem.totalPericias);
    atualizarElemento('#counter-spells', dashboardPersonagem.totalMagias);
    atualizarElemento('#counter-languages', dashboardPersonagem.totalIdiomas);
    atualizarElemento('#counter-relationships', dashboardPersonagem.totalRelacionamentos);
}

function atualizarPontosIniciais(valor) {
    const pontos = parseInt(valor) || 100;
    if (pontos < 0) return;
    
    dashboardPersonagem.pontosIniciais = pontos;
    atualizarDashboardUIRapido();
    salvarDashboardLocal();
    
    console.log(`🎯 Pontos iniciais atualizados: ${pontos}`);
}

function atualizarLimiteDesvantagens(valor) {
    const limite = parseInt(valor) || -75;
    if (limite > 0) return;
    
    dashboardPersonagem.limiteDesvantagens = limite;
    salvarDashboardLocal();
    
    console.log(`⚠️ Limite de desvantagens atualizado: ${limite}`);
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
    
    dashboardPersonagem.modificadorReacao = 
        dashboardPersonagem.status + 
        dashboardPersonagem.reputacao + 
        dashboardPersonagem.aparencia;
    
    atualizarDashboardUIRapido();
    salvarDashboardLocal();
    
    console.log(`👑 Status social atualizado: ${tipo}=${numValor}`);
}

// ===== INICIALIZAÇÃO FORTE =====

function iniciarDashboardForte() {
    console.log('💪 Iniciando DASHBOARD FORTE...');
    
    // Carregar dados
    carregarDashboardLocal();
    
    // Configurar eventos
    const startPointsInput = document.querySelector('#start-points');
    const disLimitInput = document.querySelector('#dis-limit');
    
    if (startPointsInput) {
        startPointsInput.addEventListener('change', function() {
            atualizarPontosIniciais(this.value);
        });
    }
    
    if (disLimitInput) {
        disLimitInput.addEventListener('change', function() {
            atualizarLimiteDesvantagens(this.value);
        });
    }
    
    // Botões de status social
    document.querySelectorAll('.mod-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.mod-compact-row');
            const tipo = row?.querySelector('.mod-compact-label span')?.textContent;
            
            let tipoKey = '';
            if (tipo?.includes('Status')) tipoKey = 'status';
            else if (tipo?.includes('Reputação')) tipoKey = 'reputacao';
            else if (tipo?.includes('Aparência')) tipoKey = 'aparencia';
            
            if (tipoKey) {
                const valorAtual = dashboardPersonagem[tipoKey] || 0;
                const direcao = this.classList.contains('plus') ? 1 : -1;
                const novoValor = Math.max(Math.min(valorAtual + direcao, 4), -4);
                
                // Atualizar o input correspondente
                const input = row.querySelector('.mod-value');
                if (input) input.textContent = novoValor;
                
                atualizarStatusSocial(tipoKey, novoValor);
            }
        });
    });
    
    // Botão de refresh
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            console.log('🔄 Atualização manual solicitada');
            sincronizarTudoComForca();
        });
    }
    
    // Iniciar observadores AGORA
    setTimeout(() => {
        iniciarObservadoresAgressivos();
        
        // Forçar primeira sincronização
        setTimeout(sincronizarTudoComForca, 500);
    }, 100);
    
    console.log('✅ Dashboard FORTE inicializada!');
}

// ===== EXPORTAR E INICIALIZAR =====

window.atualizarDashboard = sincronizarTudoComForca;
window.definirPontosIniciais = atualizarPontosIniciais;
window.definirLimiteDesvantagens = atualizarLimiteDesvantagens;
window.ajustarModificador = atualizarStatusSocial;
window.sincronizarDashboard = sincronizarTudoComForca;

// Inicialização imediata
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.querySelector('#dashboard.active')) {
            console.log('📱 Dashboard ativa ao carregar, inicializando...');
            iniciarDashboardForte();
        }
    });
} else {
    if (document.querySelector('#dashboard.active')) {
        console.log('📱 Dashboard já carregada e ativa, inicializando...');
        iniciarDashboardForte();
    }
}

// Também observar quando a aba for ativada
document.addEventListener('tabChanged', function(event) {
    if (event.detail && event.detail.tabId === 'dashboard') {
        console.log('🔁 Aba dashboard ativada via evento');
        setTimeout(iniciarDashboardForte, 100);
    }
});

// Fallback: verificar a cada segundo se a dashboard está visível
setInterval(() => {
    const dashboardActive = document.querySelector('#dashboard.active');
    if (dashboardActive && !window.dashboardIniciada) {
        window.dashboardIniciada = true;
        console.log('👁️ Dashboard detectada como ativa (fallback)');
        iniciarDashboardForte();
    }
}, 1000);

console.log('📊 Dashboard.js carregado e pronto para ação!');