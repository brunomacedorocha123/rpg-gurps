// ===========================================
// DASHBOARD.JS - VERSÃO ORIGINAL CORRIGIDA
// Mantém TUDO que estava funcionando
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
            
            // Características (vamos manter como estava)
            aparencia: 0,
            riqueza: 0,
            
            // Cache dos últimos valores (MANTIDO)
            ultimaAparencia: null,
            ultimaRiqueza: null,
            
            // Configurações (MANTIDO)
            limiteDesvantagens: 75
        };
        
        this.inicializado = false;
        this.intervaloMonitoramento = null;
        
        console.log("🔄 Dashboard GURPS criado (modo original)");
    }

    // ===== INICIALIZAÇÃO COMPLETA (MANTIDA) =====
    inicializar() {
        if (this.inicializado) return;
        
        console.log("🚀 Iniciando Dashboard GURPS...");
        
        // 1. Configurar listeners dos elementos DA DASHBOARD (MANTIDO)
        this.configurarListenersDashboard();
        
        // 2. Carregar estado salvo (MANTIDO)
        this.carregarEstado();
        
        // 3. Iniciar monitoramento das características (MANTIDO)
        this.iniciarMonitoramentoCaracteristicas();
        
        // 4. Calcular pontos iniciais (MANTIDO)
        this.calcularPontosCompletos();
        
        // 5. Atualizar atributos secundários (MANTIDO)
        this.atualizarAtributosSecundarios();
        
        this.inicializado = true;
        console.log("✅ Dashboard GURPS pronto!");
    }

    // ===== CONFIGURAR LISTENERS DA DASHBOARD (MANTIDO) =====
    configurarListenersDashboard() {
        // Pontos iniciais (MANTIDO)
        const startPoints = document.getElementById('start-points');
        if (startPoints) {
            startPoints.addEventListener('change', (e) => {
                this.estado.iniciais = parseInt(e.target.value) || 100;
                this.calcularPontosCompletos();
            });
        }
        
        // Limite desvantagens (MANTIDO)
        const disLimit = document.getElementById('dis-limit');
        if (disLimit) {
            disLimit.addEventListener('change', (e) => {
                this.estado.limiteDesvantagens = Math.abs(parseInt(e.target.value) || 75);
                this.calcularPontosCompletos();
            });
        }
        
        // Atributos principais (ST, DX, IQ, HT) - MANTIDO
        ['ST', 'DX', 'IQ', 'HT'].forEach(attr => {
            const input = document.getElementById(attr);
            if (input) {
                input.addEventListener('change', () => {
                    this.calcularPontosCompletos();
                    this.atualizarAtributosSecundarios();
                });
            }
        });
    }

    // ===== MONITORAMENTO DAS CARACTERÍSTICAS (MANTIDO) =====
    iniciarMonitoramentoCaracteristicas() {
        console.log("👁️ Iniciando monitoramento das características...");
        
        // Monitorar a cada 500ms (MANTIDO)
        this.intervaloMonitoramento = setInterval(() => {
            this.verificarMudancasCaracteristicas();
        }, 500);
    }

    verificarMudancasCaracteristicas() {
        // APARÊNCIA - VOU CORRIGIR AQUI
        const pontosAparencia = this.pegarPontosAparenciaCorrigido();
        if (pontosAparencia !== this.estado.ultimaAparencia) {
            this.estado.ultimaAparencia = pontosAparencia;
            this.estado.aparencia = pontosAparencia;
            console.log(`🎭 Aparência detectada: ${pontosAparencia}`);
            
            // Atualizar display da aparência na dashboard (MANTIDO)
            this.atualizarDisplayAparencia(pontosAparencia);
            
            // Recalcular pontos (MANTIDO)
            this.calcularPontosCompletos();
        }
        
        // RIQUEZA - VOU CORRIGIR AQUI
        const pontosRiqueza = this.pegarPontosRiquezaCorrigido();
        if (pontosRiqueza !== this.estado.ultimaRiqueza) {
            this.estado.ultimaRiqueza = pontosRiqueza;
            this.estado.riqueza = pontosRiqueza;
            console.log(`💰 Riqueza detectada: ${pontosRiqueza}`);
            
            // Atualizar display da riqueza na dashboard (MANTIDO)
            this.atualizarDisplayRiqueza(pontosRiqueza);
            
            // Recalcular pontos (MANTIDO)
            this.calcularPontosCompletos();
        }
    }

    // ===== MÉTODOS CORRIGIDOS PARA PEGAR PONTOS =====
    pegarPontosAparenciaCorrigido() {
        // TENTA EM ORDEM:
        
        // 1. localStorage específico (do código que você adicionou)
        try {
            const pontos = localStorage.getItem('gurps_pontos_aparencia');
            if (pontos !== null) {
                return parseInt(pontos) || 0;
            }
        } catch (e) { /* ignora */ }
        
        // 2. localStorage do sistema original
        try {
            const dados = localStorage.getItem('gurps_aparencia');
            if (dados) {
                const parsed = JSON.parse(dados);
                return parsed.nivelAparencia || 0;
            }
        } catch (e) { /* ignora */ }
        
        // 3. Select direto (se estiver na mesma página)
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            return parseInt(selectAparencia.value) || 0;
        }
        
        return 0;
    }

    pegarPontosRiquezaCorrigido() {
        // TENTA EM ORDEM:
        
        // 1. localStorage específico (do código que você adicionou)
        try {
            const pontos = localStorage.getItem('gurps_pontos_riqueza');
            if (pontos !== null) {
                return parseInt(pontos) || 0;
            }
        } catch (e) { /* ignora */ }
        
        // 2. localStorage do sistema original
        try {
            const dados = localStorage.getItem('gurps_riqueza');
            if (dados) {
                const parsed = JSON.parse(dados);
                return parsed.nivelRiqueza || 0;
            }
        } catch (e) { /* ignora */ }
        
        // 3. Select direto (se estiver na mesma página)
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            return parseInt(selectRiqueza.value) || 0;
        }
        
        return 0;
    }

    // ===== ATUALIZAR DISPLAY DAS CARACTERÍSTICAS (MANTIDO) =====
    atualizarDisplayAparencia(pontos) {
        // Atualizar modificador de aparência (MANTIDO)
        const appMod = document.getElementById('app-mod');
        if (appMod) {
            appMod.textContent = pontos >= 0 ? `+${pontos}` : `${pontos}`;
            appMod.style.color = pontos >= 0 ? '#27ae60' : '#e74c3c';
        }
        
        // Atualizar aparência física no card (MANTIDO)
        const physAppearance = document.getElementById('phys-appearance');
        if (physAppearance) {
            const niveis = {
                '-24': 'Horrendo', '-20': 'Monstruoso', '-16': 'Hediondo',
                '-8': 'Feio', '-4': 'Sem Atrativos', '0': 'Comum',
                '4': 'Atraente', '12': 'Elegante', '16': 'Muito Elegante', '20': 'Lindo'
            };
            const nivel = niveis[pontos.toString()] || 'Comum';
            const sinal = pontos >= 0 ? '+' : '';
            physAppearance.textContent = `${nivel} [${sinal}${pontos} pts]`;
        }
    }

    atualizarDisplayRiqueza(pontos) {
        const niveisRiqueza = {
            '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
            '0': 'Médio', '10': 'Confortável', '20': 'Rico',
            '30': 'Muito Rico', '50': 'Podre de Rico'
        };
        
        const nivel = niveisRiqueza[pontos.toString()] || 'Médio';
        const sinal = pontos >= 0 ? '+' : '';
        
        // Atualizar nível de riqueza (MANTIDO)
        const wealthLevel = document.getElementById('wealth-level');
        if (wealthLevel) {
            wealthLevel.textContent = nivel;
        }
        
        // Atualizar custo (MANTIDO)
        const wealthCost = document.getElementById('wealth-cost') || document.querySelector('.wealth-cost');
        if (wealthCost) {
            wealthCost.textContent = `[${sinal}${pontos} pts]`;
            wealthCost.style.color = pontos >= 0 ? '#27ae60' : '#e74c3c';
        }
    }

    // ===== CÁLCULO DE PONTOS (MANTIDO MAS CORRIGIDO) =====
    calcularPontosCompletos() {
        console.log("🧮 Calculando pontos...");
        
        // 1. Calcular atributos (MANTIDO)
        this.calcularAtributos();
        
        // 2. Pegar aparência e riqueza CORRETAMENTE
        this.estado.aparencia = this.pegarPontosAparenciaCorrigido();
        this.estado.riqueza = this.pegarPontosRiquezaCorrigido();
        
        // 3. Calcular características (vantagens/desvantagens) CORRETAMENTE
        this.calcularCaracteristicasCorrigido();
        
        // 4. Pegar perícias e magias dos cards (MANTIDO)
        this.obterPericiasMagias();
        
        // 5. Calcular saldo final CORRETAMENTE
        this.calcularSaldoFinalCorrigido();
        
        // 6. Atualizar interface (MANTIDO)
        this.atualizarDisplayPontos();
        this.verificarLimitesDesvantagens();
        
        // 7. Salvar estado (MANTIDO)
        this.salvarEstado();
        
        return this.estado.saldo;
    }

    calcularAtributos() {
        try {
            const st = parseInt(document.getElementById('ST')?.value || 10);
            const dx = parseInt(document.getElementById('DX')?.value || 10);
            const iq = parseInt(document.getElementById('IQ')?.value || 10);
            const ht = parseInt(document.getElementById('HT')?.value || 10);
            
            this.estado.atributos = (st - 10) * 10 + (dx - 10) * 20 + (iq - 10) * 20 + (ht - 10) * 10;
        } catch (error) {
            this.estado.atributos = 0;
        }
    }

    calcularCaracteristicasCorrigido() {
        let vantagens = 0;
        let desvantagens = 0;
        
        console.log(`📝 Características atuais: Aparência=${this.estado.aparencia}, Riqueza=${this.estado.riqueza}`);
        
        // APARÊNCIA - CORRIGIDO
        if (this.estado.aparencia > 0) {
            vantagens += this.estado.aparencia; // VANTAGEM (GASTA)
            console.log(`✨ Aparência: +${this.estado.aparencia} vantagens (GASTA)`);
        } else if (this.estado.aparencia < 0) {
            desvantagens += Math.abs(this.estado.aparencia); // DESVANTAGEM (GANHA)
            console.log(`⚠️ Aparência: +${Math.abs(this.estado.aparencia)} desvantagens (GANHA)`);
        }
        
        // RIQUEZA - CORRIGIDO
        if (this.estado.riqueza > 0) {
            vantagens += this.estado.riqueza; // VANTAGEM (GASTA)
            console.log(`💰 Riqueza: +${this.estado.riqueza} vantagens (GASTA)`);
        } else if (this.estado.riqueza < 0) {
            desvantagens += Math.abs(this.estado.riqueza); // DESVANTAGEM (GANHA)
            console.log(`💸 Riqueza: +${Math.abs(this.estado.riqueza)} desvantagens (GANHA)`);
        }
        
        this.estado.vantagens = vantagens;
        this.estado.desvantagens = desvantagens;
        
        console.log(`📊 Total: Vantagens=${vantagens} (GASTA), Desvantagens=${desvantagens} (GANHA)`);
    }

    obterPericiasMagias() {
        const pontosSkills = document.getElementById('points-skills');
        const pontosSpells = document.getElementById('points-spells');
        
        if (pontosSkills) {
            this.estado.pericias = parseInt(pontosSkills.textContent) || 0;
        }
        
        if (pontosSpells) {
            this.estado.magias = parseInt(pontosSpells.textContent) || 0;
        }
    }

    calcularSaldoFinalCorrigido() {
        // FÓRMULA CORRETA: Saldo = Iniciais - Atributos - Vantagens - Perícias - Magias + Desvantagens
        const gastos = this.estado.atributos + this.estado.vantagens + this.estado.pericias + this.estado.magias;
        const ganhos = this.estado.desvantagens;
        
        this.estado.saldo = this.estado.iniciais - gastos + ganhos;
        
        console.log(`🧾 Cálculo: ${this.estado.iniciais} - ${gastos} + ${ganhos} = ${this.estado.saldo}`);
    }

    // ===== ATUALIZAR INTERFACE (MANTIDO) =====
    atualizarDisplayPontos() {
        // Função helper para atualizar cards (MANTIDO)
        const atualizarCard = (id, valor) => {
            const card = document.getElementById(id);
            if (card) {
                card.textContent = valor;
                this.animarAtualizacao(id);
            }
        };
        
        // Atualizar todos os cards de pontos (MANTIDO)
        atualizarCard('points-adv', this.estado.vantagens);
        atualizarCard('points-dis', -this.estado.desvantagens); // Mostrar negativo
        
        // Saldo disponível (MANTIDO)
        const saldoCard = document.getElementById('points-balance');
        if (saldoCard) {
            saldoCard.textContent = this.estado.saldo;
            
            // Destacar saldo negativo (MANTIDO)
            if (this.estado.saldo < 0) {
                saldoCard.classList.add('saldo-negativo');
                saldoCard.style.color = '#e74c3c';
            } else {
                saldoCard.classList.remove('saldo-negativo');
                saldoCard.style.color = '';
            }
            
            this.animarAtualizacao('points-balance');
        }
    }

    atualizarAtributosSecundarios() {
        try {
            const st = parseInt(document.getElementById('ST')?.value || 10);
            const dx = parseInt(document.getElementById('DX')?.value || 10);
            const iq = parseInt(document.getElementById('IQ')?.value || 10);
            const ht = parseInt(document.getElementById('HT')?.value || 10);
            
            // Atributos principais (MANTIDO)
            const atualizarValor = (id, valor) => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.textContent = valor;
            };
            
            atualizarValor('attr-st', st);
            atualizarValor('attr-dx', dx);
            atualizarValor('attr-iq', iq);
            atualizarValor('attr-ht', ht);
            
            // Atributos secundários (MANTIDO)
            atualizarValor('pv-current', Math.max(st, 1));
            atualizarValor('pv-max', Math.max(st, 1));
            atualizarValor('fp-current', Math.max(ht, 1));
            atualizarValor('fp-max', Math.max(ht, 1));
            atualizarValor('will-value', Math.max(iq, 1));
            atualizarValor('per-value', Math.max(iq, 1));
            atualizarValor('move-value', ((ht + dx) / 4).toFixed(2));
            
        } catch (error) {
            console.error('Erro nos atributos secundários:', error);
        }
    }

    verificarLimitesDesvantagens() {
        const pontosDis = document.getElementById('points-dis');
        if (!pontosDis) return;
        
        const limite = this.estado.limiteDesvantagens || 75;
        
        if (this.estado.desvantagens > limite) {
            pontosDis.classList.add('limite-excedido');
            pontosDis.title = `Limite excedido! (${this.estado.desvantagens}/${limite})`;
        } else {
            pontosDis.classList.remove('limite-excedido');
            pontosDis.title = `Desvantagens: ${this.estado.desvantagens}/${limite}`;
        }
    }

    // ===== ANIMAÇÕES (MANTIDO) =====
    animarAtualizacao(id) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add('atualizando');
            setTimeout(() => elemento.classList.remove('atualizando'), 300);
        }
    }

    // ===== STORAGE (MANTIDO) =====
    salvarEstado() {
        try {
            localStorage.setItem('gurps_dashboard_estado', JSON.stringify(this.estado));
        } catch (error) {
            // Ignorar erros
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
            // Ignorar erros
        }
        return false;
    }

    // ===== LIMPEZA (MANTIDO) =====
    destruir() {
        if (this.intervaloMonitoramento) {
            clearInterval(this.intervaloMonitoramento);
        }
        this.inicializado = false;
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL (MANTIDO)
// ===========================================

// Criar instância global (MANTIDO)
window.DashboardGURPS = new DashboardGURPS();

// Inicializar quando dashboard for carregada (MANTIDO)
document.addEventListener('DOMContentLoaded', () => {
    window.DashboardGURPS.inicializar();
});

// Inicializar quando clicar na aba dashboard (MANTIDO)
document.addEventListener('click', (e) => {
    if (e.target.closest('#tabDashboard')) {
        setTimeout(() => {
            if (window.DashboardGURPS) {
                console.log('🔄 Aba dashboard ativada - recalculando...');
                window.DashboardGURPS.calcularPontosCompletos();
            }
        }, 300);
    }
});

// Fallback de inicialização (MANTIDO)
setTimeout(() => {
    if (window.DashboardGURPS && !window.DashboardGURPS.inicializado) {
        console.log('🔄 Inicialização via timeout...');
        window.DashboardGURPS.inicializar();
    }
}, 1000);

// ===========================================
// CSS DINÂMICO PARA ANIMAÇÕES (MANTIDO)
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
            color: #e74c3c !important;
            font-weight: bold;
        }
        
        .limite-excedido {
            color: #ff0000 !important;
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);
}

// ===========================================
// FUNÇÕES GLOBAIS DE CONTROLE (MANTIDO)
// ===========================================

window.calcularPontosDashboard = () => {
    if (window.DashboardGURPS) {
        return window.DashboardGURPS.calcularPontosCompletos();
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
        return window.DashboardGURPS.estado.saldo;
    }
    return 0;
};

// Teste manual no console (MANTIDO)
window.testarDashboard = () => {
    console.log('🧪 TESTANDO DASHBOARD:');
    console.log('1. Aparência Atraente (4) -> window.DashboardGURPS.estado.aparencia = 4');
    console.log('2. Riqueza Pobre (-15) -> window.DashboardGURPS.estado.riqueza = -15');
    console.log('3. Recalcular -> window.DashboardGURPS.calcularPontosCompletos()');
};