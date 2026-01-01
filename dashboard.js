// ===========================================
// DASHBOARD.JS - VERSÃO ORIGINAL FUNCIONAL
// ===========================================

class DashboardGURPS {
    constructor() {
        this.estado = {
            iniciais: 100,
            atributos: 0,
            vantagens: 0,
            desvantagens: 0,
            pericias: 0,
            magias: 0,
            saldo: 100,
            
            aparencia: 0,
            riqueza: 0,
            
            ultimaAparencia: null,
            ultimaRiqueza: null,
            
            limiteDesvantagens: 75
        };
        
        this.inicializado = false;
        this.intervaloMonitoramento = null;
        
        console.log("Dashboard GURPS criado");
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log("Iniciando Dashboard GURPS...");
        
        this.configurarListenersDashboard();
        this.carregarEstado();
        this.iniciarMonitoramentoCaracteristicas();
        this.calcularPontosCompletos();
        this.atualizarAtributosSecundarios();
        
        this.inicializado = true;
        console.log("Dashboard GURPS pronto!");
    }

    configurarListenersDashboard() {
        const startPoints = document.getElementById('start-points');
        if (startPoints) {
            startPoints.addEventListener('change', (e) => {
                this.estado.iniciais = parseInt(e.target.value) || 100;
                this.calcularPontosCompletos();
            });
        }
        
        const disLimit = document.getElementById('dis-limit');
        if (disLimit) {
            disLimit.addEventListener('change', (e) => {
                this.estado.limiteDesvantagens = Math.abs(parseInt(e.target.value) || 75);
                this.calcularPontosCompletos();
            });
        }
        
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

    iniciarMonitoramentoCaracteristicas() {
        console.log("Monitorando características...");
        
        this.intervaloMonitoramento = setInterval(() => {
            this.verificarMudancasCaracteristicas();
        }, 500);
    }

    verificarMudancasCaracteristicas() {
        // APARÊNCIA
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            const valorAtual = parseInt(selectAparencia.value);
            if (valorAtual !== this.estado.ultimaAparencia) {
                this.estado.ultimaAparencia = valorAtual;
                this.estado.aparencia = valorAtual;
                console.log(`Aparência detectada: ${valorAtual}`);
                
                this.atualizarDisplayAparencia(valorAtual);
                this.calcularPontosCompletos();
            }
        }
        
        // RIQUEZA
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            const valorAtual = parseInt(selectRiqueza.value);
            if (valorAtual !== this.estado.ultimaRiqueza) {
                this.estado.ultimaRiqueza = valorAtual;
                this.estado.riqueza = valorAtual;
                console.log(`Riqueza detectada: ${valorAtual}`);
                
                this.atualizarDisplayRiqueza(valorAtual);
                this.calcularPontosCompletos();
            }
        }
    }

    atualizarDisplayAparencia(pontos) {
        const appMod = document.getElementById('app-mod');
        if (appMod) {
            appMod.textContent = pontos >= 0 ? `+${pontos}` : `${pontos}`;
            appMod.style.color = pontos >= 0 ? '#27ae60' : '#e74c3c';
        }
        
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
        
        const wealthLevel = document.getElementById('wealth-level');
        if (wealthLevel) {
            wealthLevel.textContent = nivel;
        }
        
        const wealthCost = document.getElementById('wealth-cost') || document.querySelector('.wealth-cost');
        if (wealthCost) {
            wealthCost.textContent = `[${sinal}${pontos} pts]`;
            wealthCost.style.color = pontos >= 0 ? '#27ae60' : '#e74c3c';
        }
    }

    calcularPontosCompletos() {
        console.log("Calculando pontos...");
        
        this.calcularAtributos();
        this.calcularCaracteristicas();
        this.obterPericiasMagias();
        this.calcularSaldoFinal();
        
        this.atualizarDisplayPontos();
        this.verificarLimitesDesvantagens();
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

    calcularCaracteristicas() {
        let vantagens = 0;
        let desvantagens = 0;
        
        console.log(`Características: Aparência=${this.estado.aparencia}, Riqueza=${this.estado.riqueza}`);
        
        // APARÊNCIA
        if (this.estado.aparencia > 0) {
            vantagens += this.estado.aparencia;
            console.log(`Aparência: +${this.estado.aparencia} vantagens`);
        } else if (this.estado.aparencia < 0) {
            desvantagens += Math.abs(this.estado.aparencia);
            console.log(`Aparência: +${Math.abs(this.estado.aparencia)} desvantagens`);
        }
        
        // RIQUEZA
        if (this.estado.riqueza > 0) {
            vantagens += this.estado.riqueza;
            console.log(`Riqueza: +${this.estado.riqueza} vantagens`);
        } else if (this.estado.riqueza < 0) {
            desvantagens += Math.abs(this.estado.riqueza);
            console.log(`Riqueza: +${Math.abs(this.estado.riqueza)} desvantagens`);
        }
        
        this.estado.vantagens = vantagens;
        this.estado.desvantagens = desvantagens;
        
        console.log(`Total: Vantagens=${vantagens}, Desvantagens=${desvantagens}`);
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

    calcularSaldoFinal() {
        const gastos = this.estado.atributos + this.estado.vantagens + this.estado.pericias + this.estado.magias;
        const ganhos = this.estado.desvantagens;
        
        this.estado.saldo = this.estado.iniciais - gastos + ganhos;
        
        console.log(`Cálculo: ${this.estado.iniciais} - ${gastos} + ${ganhos} = ${this.estado.saldo}`);
    }

    atualizarDisplayPontos() {
        const atualizarCard = (id, valor) => {
            const card = document.getElementById(id);
            if (card) {
                card.textContent = valor;
                this.animarAtualizacao(id);
            }
        };
        
        atualizarCard('points-adv', this.estado.vantagens);
        atualizarCard('points-dis', -this.estado.desvantagens);
        
        const saldoCard = document.getElementById('points-balance');
        if (saldoCard) {
            saldoCard.textContent = this.estado.saldo;
            
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
            
            const atualizarValor = (id, valor) => {
                const elemento = document.getElementById(id);
                if (elemento) elemento.textContent = valor;
            };
            
            atualizarValor('attr-st', st);
            atualizarValor('attr-dx', dx);
            atualizarValor('attr-iq', iq);
            atualizarValor('attr-ht', ht);
            
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

    animarAtualizacao(id) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add('atualizando');
            setTimeout(() => elemento.classList.remove('atualizando'), 300);
        }
    }

    salvarEstado() {
        try {
            localStorage.setItem('gurps_dashboard_estado', JSON.stringify(this.estado));
        } catch (error) {
            // Ignorar
        }
    }

    carregarEstado() {
        try {
            const dados = localStorage.getItem('gurps_dashboard_estado');
            if (dados) {
                const parsed = JSON.parse(dados);
                this.estado = { ...this.estado, ...parsed };
                console.log('Estado carregado:', this.estado);
                return true;
            }
        } catch (error) {
            // Ignorar
        }
        return false;
    }

    destruir() {
        if (this.intervaloMonitoramento) {
            clearInterval(this.intervaloMonitoramento);
        }
        this.inicializado = false;
    }
}

// INICIALIZAÇÃO
window.DashboardGURPS = new DashboardGURPS();

document.addEventListener('DOMContentLoaded', () => {
    window.DashboardGURPS.inicializar();
});

document.addEventListener('click', (e) => {
    if (e.target.closest('#tabDashboard')) {
        setTimeout(() => {
            if (window.DashboardGURPS) {
                console.log('Aba dashboard ativada');
                window.DashboardGURPS.calcularPontosCompletos();
            }
        }, 300);
    }
});

setTimeout(() => {
    if (window.DashboardGURPS && !window.DashboardGURPS.inicializado) {
        window.DashboardGURPS.inicializar();
    }
}, 1000);

// CSS
if (!document.querySelector('#dashboard-estilos-dinamicos')) {
    const style = document.createElement('style');
    style.id = 'dashboard-estilos-dinamicos';
    style.textContent = `
        .atualizando { animation: pulse 0.3s ease; }
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        .saldo-negativo { color: #e74c3c !important; font-weight: bold; }
        .limite-excedido { color: #ff0000 !important; animation: blink 1s infinite; }
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);
}

// FUNÇÕES GLOBAIS
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

window.testarDashboard = () => {
    console.log('TESTE DASHBOARD:');
    console.log('1. Aparência 4 -> window.DashboardGURPS.estado.aparencia = 4');
    console.log('2. Riqueza -15 -> window.DashboardGURPS.estado.riqueza = -15');
    console.log('3. Recalcular -> window.DashboardGURPS.calcularPontosCompletos()');
};