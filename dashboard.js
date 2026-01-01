// ===========================================
// DASHBOARD.JS - VERSÃO DEFINITIVA
// Sistema que FUNCIONA com localStorage
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
            
            // Características (vão pegar do localStorage)
            aparencia: 0,
            riqueza: 0,
            
            // Configurações
            limiteDesvantagens: 75,
            
            // Cache
            ultimaAparencia: null,
            ultimaRiqueza: null,
            ultimoCalculo: 0
        };
        
        this.inicializado = false;
        this.monitorAtivo = true;
        
        console.log("🔄 Dashboard GURPS criado (modo localStorage)");
    }

    // ===== INICIALIZAÇÃO =====
    inicializar() {
        if (this.inicializado) return;
        
        console.log("🚀 Inicializando Dashboard GURPS...");
        
        // 1. Configurar listeners da dashboard
        this.configurarListenersDashboard();
        
        // 2. Carregar estado salvo
        this.carregarEstado();
        
        // 3. Forçar cálculo inicial
        this.calcularPontosCompletos(true);
        
        // 4. Iniciar monitoramento do localStorage
        this.iniciarMonitoramentoLocalStorage();
        
        // 5. Atualizar atributos secundários
        this.atualizarAtributosSecundarios();
        
        this.inicializado = true;
        console.log("✅ Dashboard GURPS pronto!");
        
        // Mostrar valores carregados
        console.log("📊 Valores carregados:", {
            aparencia: this.estado.aparencia,
            riqueza: this.estado.riqueza,
            saldo: this.estado.saldo
        });
    }

    // ===== CONFIGURAR LISTENERS =====
    configurarListenersDashboard() {
        // Pontos iniciais
        const startPoints = document.getElementById('start-points');
        if (startPoints) {
            startPoints.addEventListener('change', (e) => {
                this.estado.iniciais = parseInt(e.target.value) || 100;
                this.calcularPontosCompletos();
                this.salvarEstado();
            });
            
            // Definir valor inicial
            startPoints.value = this.estado.iniciais;
        }
        
        // Limite desvantagens
        const disLimit = document.getElementById('dis-limit');
        if (disLimit) {
            disLimit.addEventListener('change', (e) => {
                this.estado.limiteDesvantagens = Math.abs(parseInt(e.target.value) || 75);
                this.calcularPontosCompletos();
                this.salvarEstado();
            });
            
            // Definir valor inicial
            disLimit.value = -this.estado.limiteDesvantagens;
        }
    }

    // ===== MONITORAMENTO DO LOCALSTORAGE =====
    iniciarMonitoramentoLocalStorage() {
        console.log("👁️ Monitorando localStorage...");
        
        // Verificar a cada segundo
        setInterval(() => {
            this.verificarMudancasLocalStorage();
        }, 1000);
        
        // Também monitorar eventos de storage (entre abas)
        window.addEventListener('storage', (e) => {
            console.log(`📡 Evento storage: ${e.key} = ${e.newValue}`);
            
            if (e.key === 'gurps_pontos_aparencia' || 
                e.key === 'gurps_pontos_riqueza' ||
                e.key === 'gurps_aparencia' ||
                e.key === 'gurps_riqueza') {
                
                setTimeout(() => {
                    this.calcularPontosCompletos();
                }, 100);
            }
        });
    }

    verificarMudancasLocalStorage() {
        if (!this.monitorAtivo) return;
        
        let mudou = false;
        
        // VERIFICAR APARÊNCIA (4 métodos diferentes)
        const novaAparencia = this.obterPontosAparencia();
        if (novaAparencia !== this.estado.ultimaAparencia) {
            this.estado.ultimaAparencia = novaAparencia;
            this.estado.aparencia = novaAparencia;
            mudou = true;
            console.log(`🎭 Aparência atualizada: ${novaAparencia}`);
        }
        
        // VERIFICAR RIQUEZA (4 métodos diferentes)
        const novaRiqueza = this.obterPontosRiqueza();
        if (novaRiqueza !== this.estado.ultimaRiqueza) {
            this.estado.ultimaRiqueza = novaRiqueza;
            this.estado.riqueza = novaRiqueza;
            mudou = true;
            console.log(`💰 Riqueza atualizada: ${novaRiqueza}`);
        }
        
        if (mudou) {
            this.calcularPontosCompletos();
        }
    }

    // ===== MÉTODOS PARA OBTER PONTOS =====
    obterPontosAparencia() {
        // TENTA EM ORDEM DE PRIORIDADE:
        
        // 1. localStorage específico (do connector que você adicionou)
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
        
        // 3. Sistema global (se estiver na mesma página)
        if (window.sistemaAparencia && typeof window.sistemaAparencia.getPontosAparencia === 'function') {
            return window.sistemaAparencia.getPontosAparencia();
        }
        
        // 4. Select direto (se estiver na mesma página)
        const select = document.getElementById('nivelAparencia');
        if (select) {
            return parseInt(select.value) || 0;
        }
        
        return 0;
    }

    obterPontosRiqueza() {
        // TENTA EM ORDEM DE PRIORIDADE:
        
        // 1. localStorage específico (do connector que você adicionou)
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
        
        // 3. Sistema global (se estiver na mesma página)
        if (window.sistemaRiqueza && typeof window.sistemaRiqueza.getPontosRiqueza === 'function') {
            return window.sistemaRiqueza.getPontosRiqueza();
        }
        
        // 4. Select direto (se estiver na mesma página)
        const select = document.getElementById('nivelRiqueza');
        if (select) {
            return parseInt(select.value) || 0;
        }
        
        return 0;
    }

    // ===== CÁLCULO DE PONTOS =====
    calcularPontosCompletos(forcar = false) {
        const agora = Date.now();
        
        // Evitar cálculos muito frequentes
        if (!forcar && agora - this.estado.ultimoCalculo < 500) {
            return this.estado.saldo;
        }
        
        this.estado.ultimoCalculo = agora;
        console.log("🧮 Calculando pontos...");
        
        // 1. Calcular atributos (se existirem na dashboard)
        this.calcularAtributos();
        
        // 2. Atualizar características (vai pegar do localStorage)
        this.estado.aparencia = this.obterPontosAparencia();
        this.estado.riqueza = this.obterPontosRiqueza();
        
        // 3. Calcular vantagens e desvantagens
        this.calcularVantagensDesvantagens();
        
        // 4. Pegar perícias e magias
        this.obterPericiasMagias();
        
        // 5. Calcular saldo final
        this.calcularSaldoFinal();
        
        // 6. Atualizar interface
        this.atualizarDisplayCompleto();
        
        // 7. Salvar estado
        this.salvarEstado();
        
        console.log(`💰 Saldo: ${this.estado.saldo}`);
        console.log(`📊 Detalhes:`, {
            aparencia: this.estado.aparencia,
            riqueza: this.estado.riqueza,
            vantagens: this.estado.vantagens,
            desvantagens: this.estado.desvantagens
        });
        
        return this.estado.saldo;
    }

    calcularAtributos() {
        try {
            // Tenta pegar dos elementos da dashboard
            const st = parseInt(document.getElementById('attr-st')?.textContent || 10);
            const dx = parseInt(document.getElementById('attr-dx')?.textContent || 10);
            const iq = parseInt(document.getElementById('attr-iq')?.textContent || 10);
            const ht = parseInt(document.getElementById('attr-ht')?.textContent || 10);
            
            // Se não encontrar, tenta inputs
            const stInput = parseInt(document.getElementById('ST')?.value || st);
            const dxInput = parseInt(document.getElementById('DX')?.value || dx);
            const iqInput = parseInt(document.getElementById('IQ')?.value || iq);
            const htInput = parseInt(document.getElementById('HT')?.value || ht);
            
            const stFinal = stInput || st;
            const dxFinal = dxInput || dx;
            const iqFinal = iqInput || iq;
            const htFinal = htInput || ht;
            
            this.estado.atributos = (stFinal - 10) * 10 + (dxFinal - 10) * 20 + (iqFinal - 10) * 20 + (htFinal - 10) * 10;
            
        } catch (error) {
            console.warn('Erro ao calcular atributos:', error);
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
        
        this.estado.vantagens = vantagens;
        this.estado.desvantagens = desvantagens;
        
        console.log(`📊 Totais: Vantagens=${vantagens}, Desvantagens=${desvantagens}`);
    }

    obterPericiasMagias() {
        // Tenta pegar dos elementos da dashboard
        const pontosSkills = document.getElementById('points-skills');
        const pontosSpells = document.getElementById('points-spells');
        
        if (pontosSkills) {
            this.estado.pericias = parseInt(pontosSkills.textContent) || 0;
        }
        
        if (pontosSpells) {
            this.estado.magias = parseInt(pontosSpells.textContent) || 0;
        }
        
        // Se não encontrou, usa 0
        this.estado.pericias = this.estado.pericias || 0;
        this.estado.magias = this.estado.magias || 0;
    }

    calcularSaldoFinal() {
        // FÓRMULA: Saldo = Iniciais - Atributos - Vantagens - Perícias - Magias + Desvantagens
        const gastos = this.estado.atributos + this.estado.vantagens + this.estado.pericias + this.estado.magias;
        const ganhos = this.estado.desvantagens;
        
        this.estado.saldo = this.estado.iniciais - gastos + ganhos;
        
        console.log(`🧾 Cálculo: ${this.estado.iniciais} - ${gastos} + ${ganhos} = ${this.estado.saldo}`);
    }

    // ===== ATUALIZAR INTERFACE =====
    atualizarDisplayCompleto() {
        // 1. Atualizar pontos
        this.atualizarDisplayPontos();
        
        // 2. Atualizar características
        this.atualizarDisplayCaracteristicas();
        
        // 3. Verificar limites
        this.verificarLimitesDesvantagens();
        
        // 4. Atualizar hora
        this.atualizarHora();
    }

    atualizarDisplayPontos() {
        // Atualizar cards de pontos
        this.atualizarElemento('points-adv', this.estado.vantagens);
        this.atualizarElemento('points-dis', -this.estado.desvantagens); // Mostra negativo
        this.atualizarElemento('points-skills', this.estado.pericias);
        this.atualizarElemento('points-spells', this.estado.magias);
        
        // Saldo disponível
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
        
        // Atualizar resumo
        this.atualizarElemento('sum-advantages', this.estado.vantagens > 0 ? '1+' : '0');
        this.atualizarElemento('sum-disadvantages', this.estado.desvantagens > 0 ? '1+' : '0');
        this.atualizarElemento('sum-skills', this.estado.pericias > 0 ? '1+' : '0');
        this.atualizarElemento('sum-spells', this.estado.magias > 0 ? '1+' : '0');
    }

    atualizarDisplayCaracteristicas() {
        // Atualizar aparência no card de Status Social
        const appMod = document.getElementById('app-mod');
        if (appMod) {
            const valor = this.estado.aparencia;
            appMod.textContent = valor >= 0 ? `+${valor}` : `${valor}`;
            appMod.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
        }
        
        // Atualizar riqueza no card de Status Social
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
        
        // Atualizar aparência física
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
        
        // Atualizar modificador de reação
        const reactionTotal = document.getElementById('reaction-total');
        if (reactionTotal) {
            const total = this.estado.aparencia + this.estado.riqueza;
            reactionTotal.textContent = total >= 0 ? `+${total}` : `${total}`;
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            this.animarAtualizacao(id);
        }
    }

    atualizarAtributosSecundarios() {
        try {
            // Pega dos elementos da dashboard
            const st = parseInt(document.getElementById('attr-st')?.textContent || 10);
            const dx = parseInt(document.getElementById('attr-dx')?.textContent || 10);
            const iq = parseInt(document.getElementById('attr-iq')?.textContent || 10);
            const ht = parseInt(document.getElementById('attr-ht')?.textContent || 10);
            
            // Atualiza valores
            this.atualizarElemento('pv-current', Math.max(st, 1));
            this.atualizarElemento('pv-max', Math.max(st, 1));
            this.atualizarElemento('fp-current', Math.max(ht, 1));
            this.atualizarElemento('fp-max', Math.max(ht, 1));
            this.atualizarElemento('will-value', Math.max(iq, 1));
            this.atualizarElemento('per-value', Math.max(iq, 1));
            this.atualizarElemento('move-value', ((ht + dx) / 4).toFixed(2));
            
        } catch (error) {
            console.warn('Erro nos atributos secundários:', error);
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

    atualizarHora() {
        const currentTime = document.getElementById('current-time');
        if (currentTime) {
            const agora = new Date();
            const hora = agora.getHours().toString().padStart(2, '0');
            const minuto = agora.getMinutes().toString().padStart(2, '0');
            currentTime.textContent = `${hora}:${minuto}`;
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

// Inicializar quando dashboard for carregada
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.DashboardGURPS.inicializar();
        console.log('✅ Dashboard inicializada automaticamente');
    }, 500);
});

// Fallback de inicialização
setTimeout(() => {
    if (window.DashboardGURPS && !window.DashboardGURPS.inicializado) {
        console.log('⏰ Fallback de inicialização...');
        window.DashboardGURPS.inicializar();
    }
}, 2000);

// ===========================================
// FUNÇÕES GLOBAIS DE CONTROLE
// ===========================================

window.calcularPontosDashboard = () => {
    if (window.DashboardGURPS) {
        return window.DashboardGURPS.calcularPontosCompletos(true);
    }
    return 0;
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

// Função para forçar recálculo
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
    console.log('🧪 TESTANDO DASHBOARD:');
    console.log('1. Verificar localStorage:');
    console.log('   Aparência:', localStorage.getItem('gurps_pontos_aparencia'));
    console.log('   Riqueza:', localStorage.getItem('gurps_pontos_riqueza'));
    console.log('   gurps_aparencia:', localStorage.getItem('gurps_aparencia'));
    console.log('   gurps_riqueza:', localStorage.getItem('gurps_riqueza'));
    
    console.log('2. Métodos dashboard:');
    console.log('   obterPontosAparencia():', window.DashboardGURPS.obterPontosAparencia());
    console.log('   obterPontosRiqueza():', window.DashboardGURPS.obterPontosRiqueza());
    
    console.log('3. Estado atual:');
    console.log('   Saldo:', window.DashboardGURPS.getSaldo());
    console.log('   Detalhes:', window.DashboardGURPS.getDetalhes());
    
    console.log('4. Forçar recálculo: forcarAtualizacaoDashboard()');
};

console.log('📋 Dashboard.js carregado - Use testarDashboard() para testar');