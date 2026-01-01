// ===========================================
// DASHBOARD.JS - COMPLETO E FUNCIONAL
// Sistema que se integra com todos os outros módulos
// ===========================================

class DashboardGURPS {
    constructor() {
        this.estado = {
            // Sistema de pontos
            iniciais: 100,
            atributos: 0,
            vantagens: 0,
            desvantagens: 0,
            pericias: 0,
            magias: 0,
            saldo: 100,
            
            // Características
            aparencia: 0,
            riqueza: 0,
            
            // Cache
            cache: {
                ultimaAparencia: null,
                ultimaRiqueza: null,
                ultimaVantagens: null,
                ultimaDesvantagens: null
            },
            
            // Configurações
            limiteDesvantagens: 75
        };
        
        this.inicializado = false;
        this.monitorAtivo = false;
        this.intervaloMonitor = null;
        
        console.log("🔄 Dashboard GURPS criado");
    }

    // ===== INICIALIZAÇÃO COMPLETA =====
    inicializar() {
        if (this.inicializado) return;
        
        console.log("🚀 Inicializando Dashboard GURPS...");
        
        // 1. Configurar listeners dos elementos DA DASHBOARD
        this.configurarListenersDashboard();
        
        // 2. Carregar estado salvo
        this.carregarEstado();
        
        // 3. Forçar cálculo inicial
        this.calcularPontosCompletos(true);
        
        // 4. Iniciar monitoramento seguro
        this.iniciarMonitoramentoSeguro();
        
        // 5. Configurar eventos de outras abas
        this.configurarEventosExternos();
        
        this.inicializado = true;
        console.log("✅ Dashboard GURPS pronto!");
    }

    // ===== CONFIGURAR LISTENERS DA DASHBOARD =====
    configurarListenersDashboard() {
        // Pontos iniciais
        const startPoints = document.getElementById('start-points');
        if (startPoints) {
            startPoints.addEventListener('change', (e) => {
                this.estado.iniciais = parseInt(e.target.value) || 100;
                this.calcularPontosCompletos();
                this.salvarEstado();
            });
        }
        
        // Limite desvantagens
        const disLimit = document.getElementById('dis-limit');
        if (disLimit) {
            disLimit.addEventListener('change', (e) => {
                this.estado.limiteDesvantagens = Math.abs(parseInt(e.target.value) || 75);
                this.calcularPontosCompletos();
                this.salvarEstado();
            });
        }
        
        // Atributos principais (se existirem inputs na dashboard)
        ['ST', 'DX', 'IQ', 'HT'].forEach(attr => {
            const input = document.getElementById(attr);
            if (input && input.tagName === 'INPUT') {
                input.addEventListener('change', () => {
                    this.calcularAtributos();
                    this.calcularPontosCompletos();
                });
            }
        });
    }

    // ===== CONFIGURAR EVENTOS EXTERNOS =====
    configurarEventosExternos() {
        // Evento para quando abas externas forem carregadas
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.calcularPontosCompletos();
            }, 1000);
        });
        
        // Evento para quando a aba dashboard for ativada
        document.addEventListener('click', (e) => {
            if (e.target.closest('#tabDashboard') || e.target.closest('[data-tab="dashboard"]')) {
                setTimeout(() => {
                    console.log('🔍 Dashboard ativada - recalculando...');
                    this.calcularPontosCompletos(true);
                }, 300);
            }
        });
    }

    // ===== MONITORAMENTO SEGURO =====
    iniciarMonitoramentoSeguro() {
        console.log("👁️ Iniciando monitoramento seguro...");
        
        // Monitorar apenas periodicamente para não sobrecarregar
        this.intervaloMonitor = setInterval(() => {
            this.verificarMudancasCaracteristicas();
        }, 1000); // Apenas 1 vez por segundo
    }

    verificarMudancasCaracteristicas() {
        if (!this.monitorAtivo) return;
        
        let houveMudanca = false;
        
        // APARÊNCIA - método mais confiável
        const pontosAparencia = this.obterPontosAparencia();
        if (pontosAparencia !== this.estado.cache.ultimaAparencia) {
            this.estado.cache.ultimaAparencia = pontosAparencia;
            this.estado.aparencia = pontosAparencia;
            houveMudanca = true;
            console.log(`🎭 Aparência atualizada: ${pontosAparencia}`);
        }
        
        // RIQUEZA - método mais confiável
        const pontosRiqueza = this.obterPontosRiqueza();
        if (pontosRiqueza !== this.estado.cache.ultimaRiqueza) {
            this.estado.cache.ultimaRiqueza = pontosRiqueza;
            this.estado.riqueza = pontosRiqueza;
            houveMudanca = true;
            console.log(`💰 Riqueza atualizada: ${pontosRiqueza}`);
        }
        
        if (houveMudanca) {
            this.calcularPontosCompletos();
        }
    }

    // ===== MÉTODOS PARA OBTER PONTOS =====
    obterPontosAparencia() {
        // TENTA 4 MÉTODOS DIFERENTES (um vai funcionar)
        
        // 1. Método mais direto: via sistema global
        if (window.sistemaAparencia && typeof window.sistemaAparencia.getPontosAparencia === 'function') {
            return window.sistemaAparencia.getPontosAparencia();
        }
        
        // 2. Via SistemaCaracteristicas
        if (window.sistemaCaracteristicas && window.sistemaCaracteristicas.sistemas.aparencia) {
            return window.sistemaCaracteristicas.sistemas.aparencia.getPontosAparencia();
        }
        
        // 3. Via select direto
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            return parseInt(selectAparencia.value) || 0;
        }
        
        // 4. Via localStorage (último recurso)
        try {
            const dados = localStorage.getItem('gurps_aparencia');
            if (dados) {
                const parsed = JSON.parse(dados);
                return parsed.nivelAparencia || 0;
            }
        } catch (e) { /* ignora */ }
        
        return 0;
    }

    obterPontosRiqueza() {
        // TENTA 4 MÉTODOS DIFERENTES
        
        // 1. Método mais direto
        if (window.sistemaRiqueza && typeof window.sistemaRiqueza.getPontosRiqueza === 'function') {
            return window.sistemaRiqueza.getPontosRiqueza();
        }
        
        // 2. Via SistemaCaracteristicas
        if (window.sistemaCaracteristicas && window.sistemaCaracteristicas.sistemas.riqueza) {
            return window.sistemaCaracteristicas.sistemas.riqueza.getPontosRiqueza();
        }
        
        // 3. Via select direto
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            return parseInt(selectRiqueza.value) || 0;
        }
        
        // 4. Via localStorage
        try {
            const dados = localStorage.getItem('gurps_riqueza');
            if (dados) {
                const parsed = JSON.parse(dados);
                return parsed.nivelRiqueza || 0;
            }
        } catch (e) { /* ignora */ }
        
        return 0;
    }

    // ===== CÁLCULO DE PONTOS =====
    calcularPontosCompletos(forcar = false) {
        const agora = Date.now();
        
        // Evita cálculos muito frequentes (mínimo 500ms entre cálculos)
        if (!forcar && agora - this.estado.cache.ultimoCalculo < 500) {
            return this.estado.saldo;
        }
        
        this.estado.cache.ultimoCalculo = agora;
        console.log("🧮 Calculando pontos completos...");
        
        // 1. Calcular atributos
        this.calcularAtributos();
        
        // 2. Atualizar valores das características
        this.estado.aparencia = this.obterPontosAparencia();
        this.estado.riqueza = this.obterPontosRiqueza();
        
        // 3. Calcular vantagens e desvantagens
        this.calcularVantagensDesvantagens();
        
        // 4. Pegar perícias e magias
        this.obterPericiasMagias();
        
        // 5. Calcular saldo final
        this.calcularSaldoFinal();
        
        // 6. Atualizar interface
        this.atualizarDisplayPontos();
        this.atualizarDisplayCaracteristicas();
        this.verificarLimitesDesvantagens();
        
        // 7. Salvar estado
        this.salvarEstado();
        
        console.log(`💰 Saldo final: ${this.estado.saldo}`);
        return this.estado.saldo;
    }

    calcularAtributos() {
        try {
            // Tenta pegar dos inputs da dashboard primeiro
            const st = parseInt(document.getElementById('ST')?.value || 
                           document.getElementById('attr-st')?.textContent || 10);
            const dx = parseInt(document.getElementById('DX')?.value || 
                           document.getElementById('attr-dx')?.textContent || 10);
            const iq = parseInt(document.getElementById('IQ')?.value || 
                           document.getElementById('attr-iq')?.textContent || 10);
            const ht = parseInt(document.getElementById('HT')?.value || 
                           document.getElementById('attr-ht')?.textContent || 10);
            
            this.estado.atributos = (st - 10) * 10 + (dx - 10) * 20 + (iq - 10) * 20 + (ht - 10) * 10;
        } catch (error) {
            this.estado.atributos = 0;
        }
    }

    calcularVantagensDesvantagens() {
        let vantagens = 0;
        let desvantagens = 0;
        
        console.log(`📝 Analisando características: Aparência=${this.estado.aparencia}, Riqueza=${this.estado.riqueza}`);
        
        // APARÊNCIA
        if (this.estado.aparencia > 0) {
            vantagens += this.estado.aparencia;
            console.log(`✨ Aparência: +${this.estado.aparencia} vantagens`);
        } else if (this.estado.aparencia < 0) {
            desvantagens += Math.abs(this.estado.aparencia);
            console.log(`⚠️ Aparência: +${Math.abs(this.estado.aparencia)} desvantagens`);
        }
        
        // RIQUEZA
        if (this.estado.riqueza > 0) {
            vantagens += this.estado.riqueza;
            console.log(`💰 Riqueza: +${this.estado.riqueza} vantagens`);
        } else if (this.estado.riqueza < 0) {
            desvantagens += Math.abs(this.estado.riqueza);
            console.log(`💸 Riqueza: +${Math.abs(this.estado.riqueza)} desvantagens`);
        }
        
        // Verificar se há sistema de vantagens/desvantagens separado
        this.tentarBuscarVantagensDesvantagensExternas(vantagens, desvantagens);
        
        this.estado.vantagens = vantagens;
        this.estado.desvantagens = desvantagens;
        
        console.log(`📊 Totais: Vantagens=${vantagens}, Desvantagens=${desvantagens}`);
    }

    tentarBuscarVantagensDesvantagensExternas(vantagens, desvantagens) {
        // Tenta buscar de sistemas externos se existirem
        try {
            // Verificar se há cards de vantagens/desvantagens na página
            const vantagensCards = document.querySelectorAll('.vantagem-item, .advantage-item');
            const desvantagensCards = document.querySelectorAll('.desvantagem-item, .disadvantage-item');
            
            if (vantagensCards.length > 0 || desvantagensCards.length > 0) {
                console.log(`🔍 Encontrados ${vantagensCards.length} vantagens e ${desvantagensCards.length} desvantagens`);
            }
            
            // Verificar localStorage para vantagens/desvantagens
            const vantagensSalvas = localStorage.getItem('gurps_vantagens');
            const desvantagensSalvas = localStorage.getItem('gurps_desvantagens');
            
            if (vantagensSalvas) {
                try {
                    const dados = JSON.parse(vantagensSalvas);
                    if (dados.totalPontos) {
                        vantagens += dados.totalPontos;
                    }
                } catch (e) { /* ignora */ }
            }
            
            if (desvantagensSalvas) {
                try {
                    const dados = JSON.parse(desvantagensSalvas);
                    if (dados.totalPontos) {
                        desvantagens += Math.abs(dados.totalPontos);
                    }
                } catch (e) { /* ignora */ }
            }
        } catch (error) {
            console.warn('Erro ao buscar vantagens/desvantagens externas:', error);
        }
        
        return { vantagens, desvantagens };
    }

    obterPericiasMagias() {
        // Tenta pegar dos elementos da dashboard
        const pontosSkills = document.getElementById('points-skills');
        const pontosSpells = document.getElementById('points-spells');
        
        if (pontosSkills) {
            const valor = parseInt(pontosSkills.textContent) || 0;
            this.estado.pericias = valor;
        }
        
        if (pontosSpells) {
            const valor = parseInt(pontosSpells.textContent) || 0;
            this.estado.magias = valor;
        }
        
        // Se não encontrou, tenta localStorage
        if (this.estado.pericias === 0) {
            try {
                const dados = localStorage.getItem('gurps_pericias');
                if (dados) {
                    const parsed = JSON.parse(dados);
                    this.estado.pericias = parsed.totalPontos || 0;
                }
            } catch (e) { /* ignora */ }
        }
        
        if (this.estado.magias === 0) {
            try {
                const dados = localStorage.getItem('gurps_magias');
                if (dados) {
                    const parsed = JSON.parse(dados);
                    this.estado.magias = parsed.totalPontos || 0;
                }
            } catch (e) { /* ignora */ }
        }
    }

    calcularSaldoFinal() {
        // FÓRMULA: Saldo = Iniciais - Atributos - Vantagens - Perícias - Magias + Desvantagens
        const gastos = this.estado.atributos + this.estado.vantagens + this.estado.pericias + this.estado.magias;
        const ganhos = this.estado.desvantagens;
        
        this.estado.saldo = this.estado.iniciais - gastos + ganhos;
        
        console.log(`🧾 Cálculo: ${this.estado.iniciais} - ${gastos} + ${ganhos} = ${this.estado.saldo}`);
        console.log(`📋 Detalhes: Atributos=${this.estado.atributos}, Vantagens=${this.estado.vantagens}, Desvantagens=${this.estado.desvantagens}, Perícias=${this.estado.pericias}, Magias=${this.estado.magias}`);
    }

    // ===== ATUALIZAR INTERFACE =====
    atualizarDisplayPontos() {
        // Atualizar todos os elementos de pontos
        this.atualizarElemento('points-adv', this.estado.vantagens);
        this.atualizarElemento('points-dis', -this.estado.desvantagens); // Mostra negativo
        
        // Elementos opcionais (se existirem)
        this.atualizarElemento('points-attributes', this.estado.atributos);
        this.atualizarElemento('points-skills', this.estado.pericias);
        this.atualizarElemento('points-spells', this.estado.magias);
        
        // Saldo disponível (MAIS IMPORTANTE)
        const saldoCard = document.getElementById('points-balance');
        if (saldoCard) {
            saldoCard.textContent = this.estado.saldo;
            
            // Destacar saldo negativo
            if (this.estado.saldo < 0) {
                saldoCard.classList.add('saldo-negativo');
                saldoCard.style.color = '#e74c3c';
                saldoCard.style.fontWeight = 'bold';
            } else {
                saldoCard.classList.remove('saldo-negativo');
                saldoCard.style.color = '';
                saldoCard.style.fontWeight = '';
            }
            
            this.animarAtualizacao('points-balance');
        }
        
        // Atualizar cards de resumo
        this.atualizarElemento('sum-advantages', this.estado.vantagens > 0 ? '1+' : '0');
        this.atualizarElemento('sum-disadvantages', this.estado.desvantagens > 0 ? '1+' : '0');
    }

    atualizarDisplayCaracteristicas() {
        // Atualizar display da aparência no card de Status Social
        const appMod = document.getElementById('app-mod');
        if (appMod) {
            const valor = this.estado.aparencia;
            appMod.textContent = valor >= 0 ? `+${valor}` : `${valor}`;
            appMod.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
        }
        
        // Atualizar display da riqueza no card de Status Social
        const wealthLevel = document.getElementById('wealth-level');
        const wealthCost = document.getElementById('wealth-cost') || document.querySelector('.wealth-cost');
        
        if (wealthLevel || wealthCost) {
            const niveisRiqueza = {
                '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
                '0': 'Médio', '10': 'Confortável', '20': 'Rico',
                '30': 'Muito Rico', '50': 'Podre de Rico'
            };
            
            const valor = this.estado.riqueza;
            const nivel = niveisRiqueza[valor.toString()] || 'Médio';
            const sinal = valor >= 0 ? '+' : '';
            
            if (wealthLevel) wealthLevel.textContent = nivel;
            if (wealthCost) {
                wealthCost.textContent = `[${sinal}${valor} pts]`;
                wealthCost.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
            }
        }
        
        // Atualizar aparência física no card de características físicas
        const physAppearance = document.getElementById('phys-appearance');
        if (physAppearance) {
            const niveisAparencia = {
                '-24': 'Horrendo', '-20': 'Monstruoso', '-16': 'Hediondo',
                '-8': 'Feio', '-4': 'Sem Atrativos', '0': 'Comum',
                '4': 'Atraente', '12': 'Elegante', '16': 'Muito Elegante', '20': 'Lindo'
            };
            const nivel = niveisAparencia[this.estado.aparencia.toString()] || 'Comum';
            const sinal = this.estado.aparencia >= 0 ? '+' : '';
            physAppearance.textContent = `${nivel} [${sinal}${this.estado.aparencia} pts]`;
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            this.animarAtualizacao(id);
        }
    }

    verificarLimitesDesvantagens() {
        const pontosDis = document.getElementById('points-dis');
        if (!pontosDis) return;
        
        const limite = this.estado.limiteDesvantagens || 75;
        
        if (this.estado.desvantagens > limite) {
            pontosDis.classList.add('limite-excedido');
            pontosDis.title = `Limite excedido! (${this.estado.desvantagens}/${limite})`;
            pontosDis.style.color = '#ff0000';
        } else {
            pontosDis.classList.remove('limite-excedido');
            pontosDis.title = `Desvantagens: ${this.estado.desvantagens}/${limite}`;
            pontosDis.style.color = '';
        }
    }

    // ===== ANIMAÇÕES =====
    animarAtualizacao(id) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add('atualizando');
            setTimeout(() => elemento.classList.remove('atualizando'), 300);
        }
    }

    // ===== STORAGE =====
    salvarEstado() {
        try {
            localStorage.setItem('gurps_dashboard_estado', JSON.stringify(this.estado));
        } catch (error) {
            console.warn('Não foi possível salvar estado:', error);
        }
    }

    carregarEstado() {
        try {
            const dados = localStorage.getItem('gurps_dashboard_estado');
            if (dados) {
                const parsed = JSON.parse(dados);
                this.estado = { ...this.estado, ...parsed };
                console.log('✅ Estado carregado:', this.estado);
                return true;
            }
        } catch (error) {
            console.warn('Não foi possível carregar estado:', error);
        }
        return false;
    }

    // ===== CONTROLE =====
    habilitarMonitoramento() {
        this.monitorAtivo = true;
    }

    desabilitarMonitoramento() {
        this.monitorAtivo = false;
    }

    destruir() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
        }
        this.monitorAtivo = false;
        this.inicializado = false;
    }

    // ===== FUNÇÕES PÚBLICAS =====
    recalcularTudo() {
        return this.calcularPontosCompletos(true);
    }

    getSaldo() {
        return this.estado.saldo;
    }

    getDetalhes() {
        return {
            atributos: this.estado.atributos,
            vantagens: this.estado.vantagens,
            desvantagens: this.estado.desvantagens,
            pericias: this.estado.pericias,
            magias: this.estado.magias,
            aparencia: this.estado.aparencia,
            riqueza: this.estado.riqueza,
            saldo: this.estado.saldo
        };
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

// Criar instância global
window.DashboardGURPS = new DashboardGURPS();

// Inicializar quando a dashboard for carregada
document.addEventListener('DOMContentLoaded', () => {
    // Esperar um pouco para garantir que tudo esteja carregado
    setTimeout(() => {
        window.DashboardGURPS.inicializar();
        window.DashboardGURPS.habilitarMonitoramento();
    }, 500);
});

// Fallback de inicialização
setTimeout(() => {
    if (window.DashboardGURPS && !window.DashboardGURPS.inicializado) {
        console.log('⏰ Fallback de inicialização...');
        window.DashboardGURPS.inicializar();
        window.DashboardGURPS.habilitarMonitoramento();
    }
}, 2000);

// ===========================================
// CSS DINÂMICO PARA ANIMAÇÕES
// ===========================================

if (!document.querySelector('#dashboard-estilos-dinamicos')) {
    const style = document.createElement('style');
    style.id = 'dashboard-estilos-dinamicos';
    style.textContent = `
        .atualizando {
            animation: pulse 0.3s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .saldo-negativo {
            animation: blink-red 1s infinite;
        }
        
        .limite-excedido {
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
        
        @keyframes blink-red {
            0%, 100% { color: #e74c3c; }
            50% { color: #ff6b6b; }
        }
        
        /* Estilo para valores positivos e negativos */
        .valor-positivo { color: #27ae60 !important; }
        .valor-negativo { color: #e74c3c !important; }
    `;
    document.head.appendChild(style);
}

// ===========================================
// FUNÇÕES GLOBAIS DE CONTROLE
// ===========================================

window.calcularPontosDashboard = () => {
    if (window.DashboardGURPS) {
        return window.DashboardGURPS.calcularPontosCompletos(true);
    }
    return 0;
};

window.atualizarPericiasDashboard = (pontos) => {
    if (window.DashboardGURPS) {
        window.DashboardGURPS.estado.pericias = pontos || 0;
        window.DashboardGURPS.calcularPontosCompletos();
    }
};

window.atualizarMagiasDashboard = (pontos) => {
    if (window.DashboardGURPS) {
        window.DashboardGURPS.estado.magias = pontos || 0;
        window.DashboardGURPS.calcularPontosCompletos();
    }
};

window.getSaldoDashboard = () => {
    if (window.DashboardGURPS) {
        return window.DashboardGURPS.getSaldo();
    }
    return 0;
};

window.getDetalhesDashboard = () => {
    if (window.DashboardGURPS) {
        return window.DashboardGURPS.getDetalhes();
    }
    return {};
};

// Função para forçar recálculo de outras abas
window.forcarAtualizacaoDashboard = () => {
    if (window.DashboardGURPS) {
        window.DashboardGURPS.recalcularTudo();
        return true;
    }
    return false;
};

// ===========================================
// TESTES NO CONSOLE
// ===========================================

window.testarDashboard = () => {
    console.log('🧪 TESTANDO DASHBOARD GURPS:');
    console.log('1. dashboard.recalcularTudo() - Força cálculo completo');
    console.log('2. dashboard.getSaldo() - Mostra saldo atual');
    console.log('3. dashboard.getDetalhes() - Mostra todos os detalhes');
    console.log('4. forcarAtualizacaoDashboard() - Atualiza via função global');
    
    if (window.DashboardGURPS) {
        const detalhes = window.DashboardGURPS.getDetalhes();
        console.log('📊 Estado atual:', detalhes);
    }
};

console.log('📋 Dashboard.js carregado - Use testarDashboard() para testar');