// ===========================================
// DASHBOARD-FUNCIONAL.JS - FUNCIONA DE VERDADE
// ===========================================

console.log("🔥 DASHBOARD INICIANDO - VAI FUNCIONAR CARALHO!");

// CONFIGURAÇÃO INICIAL - MAS VOCÊ MUDA!
let config = {
    pontosIniciais: 100,
    limiteDesvantagens: -75
};

// ESTADO DO PERSONAGEM
let personagem = {
    nome: "",
    raca: "Humano",
    ocupacao: "",
    jogador: "",
    
    // Atributos (vão ser buscados das outras abas)
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    
    // Pontos gastos
    gastosAtributos: 0,
    gastosVantagens: 0,
    gastosDesvantagens: 0, // valor negativo
    gastosPericias: 0,
    gastosMagias: 0,
    gastosPeculiaridades: 0,
    gastosTecnicas: 0
};

// ===== FUNÇÕES QUE PEGAM OS VALORES REAIS =====

// PEGA ATRIBUTOS DA ABA ATRIBUTOS
function pegarAtributos() {
    // FORÇA pegar os valores ATUAIS
    const ST = obterValorNumero('ST') || 10;
    const DX = obterValorNumero('DX') || 10;
    const IQ = obterValorNumero('IQ') || 10;
    const HT = obterValorNumero('HT') || 10;
    
    return { ST, DX, IQ, HT };
}

// CALCULA QUANTO GASTOU NOS ATRIBUTOS
function calcularGastoAtributos() {
    const { ST, DX, IQ, HT } = pegarAtributos();
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    return custoST + custoDX + custoIQ + custoHT;
}

// PEGA VALOR NUMÉRICO DE UM ELEMENTO
function obterValorNumero(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    
    // Tenta pegar de várias formas
    let valor = el.value || el.textContent || el.innerText || "0";
    valor = valor.toString().replace(/[^\d-]/g, ''); // Remove tudo que não é número
    
    const num = parseInt(valor);
    return isNaN(num) ? 0 : num;
}

// ===== ATUALIZA A DASHBOARD =====

function atualizarDashboard() {
    console.log("🔄 ATUALIZANDO DASHBOARD...");
    
    // 1. PEGA ATRIBUTOS ATUAIS
    const atributos = pegarAtributos();
    personagem.ST = atributos.ST;
    personagem.DX = atributos.DX;
    personagem.IQ = atributos.IQ;
    personagem.HT = atributos.HT;
    
    // 2. CALCULA GASTO NOS ATRIBUTOS
    personagem.gastosAtributos = calcularGastoAtributos();
    
    // 3. ATUALIZA A TELA
    atualizarTela();
    
    // 4. SALVA
    salvarConfig();
    
    console.log("✅ DASHBOARD ATUALIZADA!");
    console.log(`📊 ST=${personagem.ST}, Gastos=${personagem.gastosAtributos}, Saldo=${calcularSaldo()}`);
}

// ATUALIZA A TELA
function atualizarTela() {
    // ATUALIZA ATRIBUTOS NO CARD
    atualizarElemento('#summary-st', personagem.ST);
    atualizarElemento('#summary-dx', personagem.DX);
    atualizarElemento('#summary-iq', personagem.IQ);
    atualizarElemento('#summary-ht', personagem.HT);
    
    // ATUALIZA GASTOS NOS ATRIBUTOS
    atualizarElemento('#points-attr', personagem.gastosAtributos);
    
    // ATUALIZA PONTOS INICIAIS (o que você colocou)
    atualizarElemento('#start-points', config.pontosIniciais);
    atualizarElemento('#quick-start-points', config.pontosIniciais);
    
    // ATUALIZA LIMITE
    atualizarElemento('#dis-limit', config.limiteDesvantagens);
    
    // CALCULA SALDO
    const saldo = calcularSaldo();
    atualizarElemento('#points-balance', saldo);
    atualizarElemento('#quick-balance', saldo);
    
    // ATUALIZA PORCENTAGENS
    atualizarPorcentagens();
    
    // ATUALIZA STATUS DO SALDO
    atualizarStatusSaldo(saldo);
    
    // ATUALIZA TIMESTAMP
    const agora = new Date();
    const hora = agora.getHours().toString().padStart(2, '0');
    const minuto = agora.getMinutes().toString().padStart(2, '0');
    atualizarElemento('#update-timestamp', `${hora}:${minuto}`);
    atualizarElemento('#last-update-time', `${hora}:${minuto}`);
}

// CALCULA SALDO DISPONÍVEL
function calcularSaldo() {
    const totalGastos = personagem.gastosAtributos + 
                       personagem.gastosVantagens + 
                       personagem.gastosPericias + 
                       personagem.gastosMagias + 
                       personagem.gastosPeculiaridades + 
                       personagem.gastosTecnicas;
    
    const ganhosDesvantagens = Math.abs(personagem.gastosDesvantagens); // valor negativo vira positivo
    
    return config.pontosIniciais - totalGastos + ganhosDesvantagens;
}

// ATUALIZA PORCENTAGENS
function atualizarPorcentagens() {
    const pontosIniciais = config.pontosIniciais;
    if (pontosIniciais === 0) return;
    
    // Porcentagem de cada gasto
    const percentAtributos = Math.round((personagem.gastosAtributos / pontosIniciais) * 100);
    const percentVantagens = Math.round((personagem.gastosVantagens / pontosIniciais) * 100);
    const percentDesvantagens = Math.round((Math.abs(personagem.gastosDesvantagens) / pontosIniciais) * 100);
    
    // Atualiza na tela
    atualizarElemento('#points-attr-percent', `${percentAtributos}%`);
    atualizarElemento('#points-adv-percent', `${percentVantagens}%`);
    atualizarElemento('#points-dis-percent', `${percentDesvantagens}%`);
    
    // Porcentagem do saldo
    const saldo = calcularSaldo();
    const percentSaldo = Math.round((saldo / pontosIniciais) * 100);
    atualizarElemento('#points-balance-percent', `${percentSaldo}%`);
}

// ATUALIZA STATUS DO SALDO (VERMELHO/AMARELO/VERDE)
function atualizarStatusSaldo(saldo) {
    const balanceElement = document.getElementById('points-balance');
    const statusIndicator = document.getElementById('points-status-indicator');
    const statusText = document.getElementById('points-status-text');
    
    if (!balanceElement || !statusIndicator || !statusText) return;
    
    // Remove classes antigas
    balanceElement.classList.remove('saldo-negativo', 'saldo-baixo', 'saldo-normal');
    
    if (saldo < 0) {
        // SALDO NEGATIVO - FUDEU
        balanceElement.classList.add('saldo-negativo');
        statusIndicator.style.backgroundColor = '#f44336';
        statusText.textContent = 'Personagem inválido!';
    } else if (saldo < 10) {
        // SALDO BAIXO - CUIDADO
        balanceElement.classList.add('saldo-baixo');
        statusIndicator.style.backgroundColor = '#FF9800';
        statusText.textContent = 'Poucos pontos restantes';
    } else {
        // SALDO OK - TÁ SUAVE
        balanceElement.classList.add('saldo-normal');
        statusIndicator.style.backgroundColor = '#4CAF50';
        statusText.textContent = 'Personagem válido';
    }
}

// FUNÇÃO GENÉRICA PARA ATUALIZAR ELEMENTO
function atualizarElemento(seletor, valor) {
    const el = document.querySelector(seletor);
    if (!el) {
        console.warn(`❌ Elemento não encontrado: ${seletor}`);
        return;
    }
    
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        el.value = valor;
    } else {
        el.textContent = valor;
    }
}

// ===== FUNÇÕES DE CONFIGURAÇÃO =====

// VOCÊ MUDA OS PONTOS INICIAIS AQUI!
function definirPontosIniciais(valor) {
    const pontos = parseInt(valor);
    if (isNaN(pontos) || pontos < 0) return;
    
    config.pontosIniciais = pontos;
    console.log(`🎯 VOCÊ MUDOU: Pontos iniciais = ${pontos}`);
    atualizarDashboard();
}

// VOCÊ MUDA O LIMITE AQUI!
function definirLimiteDesvantagens(valor) {
    const limite = parseInt(valor);
    if (isNaN(limite) || limite > 0) return;
    
    config.limiteDesvantagens = limite;
    console.log(`⚠️ VOCÊ MUDOU: Limite desvantagens = ${limite}`);
    atualizarDashboard();
}

// AJUSTA PONTOS INICIAIS COM BOTÃO +/-
function ajustarPontosIniciais(valor) {
    const novoValor = config.pontosIniciais + valor;
    if (novoValor < 0) return;
    
    config.pontosIniciais = novoValor;
    atualizarElemento('#start-points', novoValor);
    atualizarElemento('#quick-start-points', novoValor);
    atualizarDashboard();
}

// AJUSTA LIMITE COM BOTÃO +/-
function ajustarLimiteDesvantagens(valor) {
    const novoValor = config.limiteDesvantagens + valor;
    if (novoValor > 0) return;
    
    config.limiteDesvantagens = novoValor;
    atualizarElemento('#dis-limit', novoValor);
    atualizarDashboard();
}

// ===== STATUS SOCIAL =====

// MUDA STATUS SOCIAL
function ajustarModificador(tipo, valor) {
    const elementoValor = document.getElementById(`${tipo}-value`);
    if (!elementoValor) return;
    
    let valorAtual = parseInt(elementoValor.textContent) || 0;
    const novoValor = valorAtual + valor;
    
    // Limita entre -4 e +4
    if (novoValor < -4) return;
    if (novoValor > 4) return;
    
    elementoValor.textContent = novoValor;
    
    // Atualiza pontos (cada nível = 5 pontos)
    const elementoPontos = document.getElementById(`${tipo}-points-compact`);
    if (elementoPontos) {
        const pontos = novoValor * 5;
        elementoPontos.textContent = `[${pontos >= 0 ? '+' : ''}${pontos}]`;
    }
    
    // Atualiza total de reação
    atualizarReacaoTotal();
}

// ATUALIZA TOTAL DE REAÇÃO
function atualizarReacaoTotal() {
    const status = parseInt(document.getElementById('status-value')?.textContent) || 0;
    const reputacao = parseInt(document.getElementById('rep-value')?.textContent) || 0;
    const aparencia = parseInt(document.getElementById('app-value')?.textContent) || 0;
    
    const total = status + reputacao + aparencia;
    const elementoTotal = document.getElementById('reaction-total-compact');
    
    if (elementoTotal) {
        elementoTotal.textContent = total >= 0 ? `+${total}` : total;
    }
}

// ===== OBSERVADOR SIMPLES =====

// OBSERVA MUDANÇAS NOS ATRIBUTOS
function observarAtributos() {
    // IDs dos inputs de atributos
    const ids = ['ST', 'DX', 'IQ', 'HT'];
    
    ids.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // Observa quando o valor muda
            input.addEventListener('input', function() {
                console.log(`📝 ${id} mudou para: ${this.value}`);
                setTimeout(atualizarDashboard, 100);
            });
            
            // Também observa quando perde o foco (Enter/Tab)
            input.addEventListener('change', function() {
                console.log(`💾 ${id} confirmado: ${this.value}`);
                atualizarDashboard();
            });
        }
    });
    
    console.log("👀 Observador de atributos ATIVADO");
}

// ===== INICIALIZAÇÃO =====

function iniciarDashboard() {
    console.log("🚀 INICIANDO DASHBOARD FUNCIONAL!");
    
    // 1. CARREGA CONFIGURAÇÃO SALVA
    carregarConfig();
    
    // 2. CONFIGURA EVENTOS
    configurarEventos();
    
    // 3. INICIA OBSERVADOR
    observarAtributos();
    
    // 4. FAZ PRIMEIRA ATUALIZAÇÃO
    setTimeout(atualizarDashboard, 500);
    
    console.log("✅ DASHBOARD PRONTA PARA USAR!");
}

// CONFIGURA TODOS OS EVENTOS
function configurarEventos() {
    // PONTOS INICIAIS
    const inputPontos = document.getElementById('start-points');
    if (inputPontos) {
        inputPontos.addEventListener('change', function() {
            definirPontosIniciais(this.value);
        });
    }
    
    // PONTOS INICIAIS RÁPIDO
    const inputPontosRapido = document.getElementById('quick-start-points');
    if (inputPontosRapido) {
        inputPontosRapido.addEventListener('change', function() {
            definirPontosIniciais(this.value);
        });
    }
    
    // LIMITE DESVANTAGENS
    const inputLimite = document.getElementById('dis-limit');
    if (inputLimite) {
        inputLimite.addEventListener('change', function() {
            definirLimiteDesvantagens(this.value);
        });
    }
    
    // BOTÃO ATUALIZAR
    const btnAtualizar = document.querySelector('.refresh-btn');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            console.log("🔄 Atualização MANUAL solicitada!");
            atualizarDashboard();
        });
    }
    
    // BOTÕES +- DOS PONTOS
    const btnPlusPontos = document.querySelector('.setting-btn.plus');
    const btnMinusPontos = document.querySelector('.setting-btn.minus');
    
    if (btnPlusPontos) {
        btnPlusPontos.addEventListener('click', function() {
            ajustarPontosIniciais(10);
        });
    }
    
    if (btnMinusPontos) {
        btnMinusPontos.addEventListener('click', function() {
            ajustarPontosIniciais(-10);
        });
    }
    
    // BOTÕES +- DO LIMITE
    const btnPlusLimite = document.querySelectorAll('.setting-btn.plus')[1];
    const btnMinusLimite = document.querySelectorAll('.setting-btn.minus')[1];
    
    if (btnPlusLimite) {
        btnPlusLimite.addEventListener('click', function() {
            ajustarLimiteDesvantagens(5);
        });
    }
    
    if (btnMinusLimite) {
        btnMinusLimite.addEventListener('click', function() {
            ajustarLimiteDesvantagens(-5);
        });
    }
    
    console.log("🎮 Eventos configurados");
}

// ===== SALVAR/CARREGAR =====

function salvarConfig() {
    try {
        const dados = {
            config: config,
            personagem: personagem
        };
        localStorage.setItem('gurps_dashboard_config', JSON.stringify(dados));
    } catch (e) {
        console.warn("⚠️ Não foi possível salvar:", e);
    }
}

function carregarConfig() {
    try {
        const dados = localStorage.getItem('gurps_dashboard_config');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.config) Object.assign(config, parsed.config);
            if (parsed.personagem) Object.assign(personagem, parsed.personagem);
            console.log("📂 Configuração carregada");
        }
    } catch (e) {
        console.warn("⚠️ Não foi possível carregar:", e);
    }
}

// ===== INICIALIZA QUANDO A PÁGINA CARREGA =====

// Espera a página carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("📄 Página carregada, verificando dashboard...");
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            iniciarDashboard();
        }
    });
} else {
    // Página já carregada
    console.log("⚡ Página já carregada, iniciando...");
    if (document.getElementById('dashboard')?.classList.contains('active')) {
        iniciarDashboard();
    }
}

// Observa quando muda para a aba dashboard
document.addEventListener('tabChanged', function(e) {
    if (e.detail && e.detail.tabId === 'dashboard') {
        console.log("🔀 Mudou para a dashboard!");
        setTimeout(iniciarDashboard, 100);
    }
});

// Fallback: verifica a cada 2 segundos se a dashboard está ativa
setInterval(() => {
    const dashboard = document.getElementById('dashboard');
    if (dashboard?.classList.contains('active') && !window.dashboardIniciada) {
        window.dashboardIniciada = true;
        console.log("👁️ Dashboard detectada (fallback)");
        iniciarDashboard();
    }
}, 2000);

// ===== EXPORTA FUNÇÕES PARA O HTML =====

window.atualizarDashboard = atualizarDashboard;
window.definirPontosIniciais = definirPontosIniciais;
window.definirLimiteDesvantagens = definirLimiteDesvantagens;
window.ajustarPontosIniciais = ajustarPontosIniciais;
window.ajustarLimiteDesvantagens = ajustarLimiteDesvantagens;
window.ajustarModificador = ajustarModificador;

console.log("🎯 DASHBOARD.JS - CARREGADO E PRONTO!");