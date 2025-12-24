/* =========================================== */
/* SISTEMA DE RIQUEZA - COMPLETO E FUNCIONAL */
/* =========================================== */

class SistemaRiqueza {
    constructor() {
        this.init();
    }

    init() {
        console.log('🚀 Inicializando Sistema de Riqueza...');
        
        // Cache de elementos
        this.elementos = {
            select: document.getElementById('nivelRiqueza'),
            pontos: document.getElementById('pontosRiqueza'),
            multiplicador: document.getElementById('multiplicadorRiqueza'),
            renda: document.getElementById('rendaMensal'),
            descricao: document.getElementById('descricaoRiqueza'),
            container: document.querySelector('.riqueza-container')
        };

        // Verificar elementos críticos
        if (!this.elementos.select) {
            console.error('❌ ERRO CRÍTICO: Elemento #nivelRiqueza não encontrado!');
            this.debugElementos();
            return;
        }

        // Configurar sistema
        this.configurarDados();
        this.configurarEventos();
        this.configurarUI();
        this.atualizarTudo();

        console.log('✅ Sistema de Riqueza inicializado com sucesso!');
    }

    debugElementos() {
        console.log('🔍 Debug - Procurando elementos:');
        
        // Procurar por qualquer select na seção de características
        const selects = document.querySelectorAll('#caracteristicas select');
        console.log('Selects encontrados:', selects.length);
        selects.forEach((s, i) => {
            console.log(`Select ${i}:`, s.id || 'sem id', '- Value:', s.value);
        });

        // Procurar elementos por texto
        const elementosTexto = document.querySelectorAll('[id*="riqueza"], [id*="Riqueza"]');
        console.log('Elementos com "riqueza" no ID:', elementosTexto.length);
    }

    configurarDados() {
        this.dados = {
            '-25': {
                pontos: -25,
                multiplicador: 0.1,
                renda: 0,
                descricao: 'Falido - Sem recursos, dependendo da caridade',
                cor: '#dc2626',
                icone: 'fa-skull-crossbones'
            },
            '-15': {
                pontos: -15,
                multiplicador: 0.3,
                renda: 300,
                descricao: 'Pobre - Recursos mínimos para sobrevivência',
                cor: '#ef4444',
                icone: 'fa-house-damage'
            },
            '-10': {
                pontos: -10,
                multiplicador: 0.6,
                renda: 800,
                descricao: 'Batalhador - Vive com dificuldade, mas se mantém',
                cor: '#f97316',
                icone: 'fa-hard-hat'
            },
            '0': {
                pontos: 0,
                multiplicador: 1.0,
                renda: 1000,
                descricao: 'Médio - Nível de recursos pré-definido padrão',
                cor: '#eab308',
                icone: 'fa-home'
            },
            '10': {
                pontos: 10,
                multiplicador: 2.0,
                renda: 2500,
                descricao: 'Confortável - Vive bem, sem grandes preocupações financeiras',
                cor: '#22c55e',
                icone: 'fa-couch'
            },
            '20': {
                pontos: 20,
                multiplicador: 5.0,
                renda: 8000,
                descricao: 'Rico - Recursos abundantes, estilo de vida luxuoso',
                cor: '#0ea5e9',
                icone: 'fa-gem'
            },
            '30': {
                pontos: 30,
                multiplicador: 10.0,
                renda: 15000,
                descricao: 'Muito Rico - Fortuna considerável, influência econômica',
                cor: '#8b5cf6',
                icone: 'fa-crown'
            },
            '50': {
                pontos: 50,
                multiplicador: 25.0,
                renda: 40000,
                descricao: 'Podre de Rico - Riqueza excepcional, poder econômico significativo',
                cor: '#ec4899',
                icone: 'fa-landmark'
            }
        };
    }

    configurarEventos() {
        // Evento principal do select
        this.elementos.select.addEventListener('change', (e) => {
            this.selecionarNivel(e.target.value);
        });

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.altKey) {
                switch(e.key) {
                    case 'ArrowUp': e.preventDefault(); this.aumentarNivel(); break;
                    case 'ArrowDown': e.preventDefault(); this.diminuirNivel(); break;
                    case 'r': e.preventDefault(); this.resetarNivel(); break;
                }
            }
        });

        // Auto-save
        window.addEventListener('beforeunload', () => this.salvarEstado());
    }

    configurarUI() {
        this.criarIndicadorStatus();
        this.criarControlesAvancados();
        this.criarTooltips();
        this.aplicarEstilosDinamicos();
    }

    criarIndicadorStatus() {
        const header = this.elementos.container?.querySelector('.section-header');
        if (!header) return;

        const status = document.createElement('div');
        status.className = 'riqueza-status-indicator';
        status.innerHTML = `
            <div class="status-dot"></div>
            <span class="status-text">Sistema Ativo</span>
        `;
        header.appendChild(status);
    }

    criarControlesAvancados() {
        const container = this.elementos.container;
        if (!container) return;

        // Painel de controle avançado
        const painelHTML = `
            <div class="riqueza-controle-avancado">
                <div class="controle-header">
                    <i class="fas fa-sliders-h"></i>
                    <span>Controles Avançados</span>
                </div>
                <div class="controle-botoes">
                    <button class="btn-controle btn-diminuir" title="Diminuir nível (Ctrl+Alt+↓)">
                        <i class="fas fa-arrow-down"></i>
                        <span>Mais Pobre</span>
                    </button>
                    <button class="btn-controle btn-reset" title="Resetar para médio (Ctrl+Alt+R)">
                        <i class="fas fa-undo"></i>
                        <span>Resetar</span>
                    </button>
                    <button class="btn-controle btn-aumentar" title="Aumentar nível (Ctrl+Alt+↑)">
                        <i class="fas fa-arrow-up"></i>
                        <span>Mais Rico</span>
                    </button>
                </div>
                <div class="controle-info">
                    <div class="info-item">
                        <span>Pontos Gastos:</span>
                        <strong id="pontosGastosRiqueza">0</strong>
                    </div>
                    <div class="info-item">
                        <span>Próximo Custo:</span>
                        <strong id="proximoCustoRiqueza">-</strong>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', painelHTML);

        // Eventos dos botões
        container.querySelector('.btn-diminuir').addEventListener('click', () => this.diminuirNivel());
        container.querySelector('.btn-aumentar').addEventListener('click', () => this.aumentarNivel());
        container.querySelector('.btn-reset').addEventListener('click', () => this.resetarNivel());
    }

    criarTooltips() {
        const select = this.elementos.select;
        const options = select.querySelectorAll('option');
        
        options.forEach(option => {
            const dados = this.dados[option.value];
            if (dados) {
                option.title = `${dados.descricao}\nRenda: ${this.formatarMoeda(dados.renda)}\nMultiplicador: ${dados.multiplicador}x`;
            }
        });
    }

    aplicarEstilosDinamicos() {
        const style = document.createElement('style');
        style.id = 'riqueza-estilos-dinamicos';
        style.textContent = `
            .riqueza-status-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 12px;
                background: rgba(212, 175, 55, 0.1);
                border: 1px solid rgba(212, 175, 55, 0.3);
                border-radius: 20px;
                font-size: 0.85rem;
                color: var(--text-gold);
            }
            
            .status-dot {
                width: 8px;
                height: 8px;
                background: #22c55e;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .riqueza-controle-avancado {
                margin-top: 20px;
                padding: 15px;
                background: linear-gradient(145deg, rgba(26, 18, 0, 0.8), rgba(44, 32, 8, 0.9));
                border: 1px solid rgba(212, 175, 55, 0.4);
                border-radius: 8px;
            }
            
            .controle-header {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 15px;
                color: var(--text-gold);
                font-weight: bold;
            }
            
            .controle-botoes {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .btn-controle {
                padding: 10px;
                background: linear-gradient(145deg, var(--wood-dark), #4a352b);
                border: 1px solid var(--wood-light);
                border-radius: 6px;
                color: var(--text-light);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
                transition: all 0.3s ease;
            }
            
            .btn-controle:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
            }
            
            .btn-diminuir {
                background: linear-gradient(145deg, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.4));
                border-color: #dc2626;
            }
            
            .btn-aumentar {
                background: linear-gradient(145deg, rgba(34, 197, 94, 0.3), rgba(21, 128, 61, 0.4));
                border-color: #22c55e;
            }
            
            .btn-reset {
                background: linear-gradient(145deg, rgba(212, 175, 55, 0.3), rgba(184, 134, 11, 0.4));
                border-color: var(--primary-gold);
            }
            
            .controle-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                padding-top: 15px;
                border-top: 1px solid rgba(212, 175, 55, 0.2);
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .info-item span {
                color: var(--wood-light);
                font-size: 0.9rem;
            }
            
            .info-item strong {
                color: var(--text-gold);
                font-family: 'Cinzel', serif;
                font-size: 1.1rem;
            }
            
            /* Efeitos para mudanças */
            .riqueza-atualizando {
                animation: riquezaPulse 0.5s ease;
            }
            
            @keyframes riquezaPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.02); }
                100% { transform: scale(1); }
            }
            
            /* Destaque para valores */
            .valor-destaque {
                font-weight: bold;
                text-shadow: 0 0 10px currentColor;
            }
        `;
        
        document.head.appendChild(style);
    }

    selecionarNivel(nivel) {
        console.log(`🎯 Selecionando nível: ${nivel}`);
        
        const dados = this.dados[nivel];
        if (!dados) {
            console.error(`Nível não encontrado: ${nivel}`);
            return;
        }

        // Atualizar interface
        this.atualizarInterface(dados);
        
        // Efeitos visuais
        this.animarMudanca();
        
        // Salvar estado
        this.salvarEstado();
        
        // Disparar evento customizado
        this.dispararEvento('riqueza-alterada', { nivel, dados });
        
        console.log(`✅ Nível alterado para: ${this.getLabelPorValor(nivel)}`);
    }

    atualizarInterface(dados) {
        // Pontos
        if (this.elementos.pontos) {
            this.elementos.pontos.textContent = `${dados.pontos >= 0 ? '+' : ''}${dados.pontos} pts`;
            this.elementos.pontos.style.color = dados.cor;
        }

        // Multiplicador
        if (this.elementos.multiplicador) {
            this.elementos.multiplicador.textContent = `${dados.multiplicador.toFixed(1)}x`;
            this.elementos.multiplicador.classList.add('valor-destaque');
            setTimeout(() => this.elementos.multiplicador.classList.remove('valor-destaque'), 1000);
        }

        // Renda
        if (this.elementos.renda) {
            this.elementos.renda.textContent = this.formatarMoeda(dados.renda);
        }

        // Descrição
        if (this.elementos.descricao) {
            this.elementos.descricao.textContent = dados.descricao;
        }

        // Atualizar informações do painel de controle
        this.atualizarPainelControle(dados);
    }

    atualizarPainelControle(dadosAtuais) {
        const pontosGastos = document.getElementById('pontosGastosRiqueza');
        const proximoCusto = document.getElementById('proximoCustoRiqueza');
        
        if (pontosGastos) {
            // Calcular pontos gastos (só positivos)
            const pontos = Math.max(0, dadosAtuais.pontos);
            pontosGastos.textContent = pontos;
            pontosGastos.style.color = pontos > 0 ? '#22c55e' : '#6b7280';
        }
        
        if (proximoCusto) {
            const niveis = Object.keys(this.dados);
            const indexAtual = niveis.indexOf(this.elementos.select.value);
            
            if (indexAtual < niveis.length - 1) {
                const proximoNivel = niveis[indexAtual + 1];
                const dadosProximo = this.dados[proximoNivel];
                const custo = dadosProximo.pontos - dadosAtuais.pontos;
                
                proximoCusto.textContent = custo;
                proximoCusto.style.color = custo <= 10 ? '#22c55e' : custo <= 20 ? '#eab308' : '#ef4444';
            } else {
                proximoCusto.textContent = 'MÁX';
                proximoCusto.style.color = '#8b5cf6';
            }
        }
    }

    aumentarNivel() {
        const niveis = Object.keys(this.dados);
        const indexAtual = niveis.indexOf(this.elementos.select.value);
        
        if (indexAtual < niveis.length - 1) {
            const proximoNivel = niveis[indexAtual + 1];
            this.elementos.select.value = proximoNivel;
            this.selecionarNivel(proximoNivel);
            return true;
        }
        
        this.mostrarNotificacao('Nível máximo alcançado!', 'info');
        return false;
    }

    diminuirNivel() {
        const niveis = Object.keys(this.dados);
        const indexAtual = niveis.indexOf(this.elementos.select.value);
        
        if (indexAtual > 0) {
            const nivelAnterior = niveis[indexAtual - 1];
            this.elementos.select.value = nivelAnterior;
            this.selecionarNivel(nivelAnterior);
            return true;
        }
        
        this.mostrarNotificacao('Nível mínimo alcançado!', 'info');
        return false;
    }

    resetarNivel() {
        this.elementos.select.value = '0';
        this.selecionarNivel('0');
        this.mostrarNotificacao('Nível de riqueza resetado para Médio', 'success');
    }

    atualizarTudo() {
        const nivelAtual = this.elementos.select.value;
        const dados = this.dados[nivelAtual] || this.dados['0'];
        this.atualizarInterface(dados);
        
        // Carregar estado salvo
        this.carregarEstado();
    }

    animarMudanca() {
        const container = this.elementos.container;
        if (container) {
            container.classList.add('riqueza-atualizando');
            setTimeout(() => {
                container.classList.remove('riqueza-atualizando');
            }, 500);
        }
    }

    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(valor);
    }

    getLabelPorValor(valor) {
        const opcoes = this.elementos.select.options;
        for (let option of opcoes) {
            if (option.value === valor) {
                return option.text.split('[')[0].trim();
            }
        }
        return 'Desconhecido';
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        // Criar notificação
        const notificacao = document.createElement('div');
        notificacao.className = `riqueza-notificacao riqueza-notificacao-${tipo}`;
        notificacao.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        `;
        
        // Estilos
        notificacao.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${tipo === 'success' ? '#22c55e' : tipo === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notificacao);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notificacao.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notificacao.remove(), 300);
        }, 3000);
    }

    salvarEstado() {
        try {
            const estado = {
                nivel: this.elementos.select.value,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('sistema-riqueza-estado', JSON.stringify(estado));
        } catch (e) {
            console.error('Erro ao salvar estado:', e);
        }
    }

    carregarEstado() {
        try {
            const salvo = localStorage.getItem('sistema-riqueza-estado');
            if (salvo) {
                const estado = JSON.parse(salvo);
                if (this.dados[estado.nivel]) {
                    this.elementos.select.value = estado.nivel;
                    this.selecionarNivel(estado.nivel);
                }
            }
        } catch (e) {
            console.error('Erro ao carregar estado:', e);
        }
    }

    dispararEvento(nome, detalhes) {
        const evento = new CustomEvent(`riqueza:${nome}`, {
            detail: detalhes,
            bubbles: true
        });
        this.elementos.select.dispatchEvent(evento);
    }

    // Métodos públicos para integração
    getNivelAtual() {
        return {
            valor: this.elementos.select.value,
            dados: this.dados[this.elementos.select.value]
        };
    }

    setNivel(valor) {
        if (this.dados[valor]) {
            this.elementos.select.value = valor;
            this.selecionarNivel(valor);
            return true;
        }
        return false;
    }
}

/* =========================================== */
/* INICIALIZAÇÃO DO SISTEMA */
/* =========================================== */

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Esperar um pouco para garantir que tudo carregou
    setTimeout(() => {
        console.log('⚡ Inicializando Sistema de Riqueza...');
        
        try {
            // Criar instância do sistema
            window.sistemaRiqueza = new SistemaRiqueza();
            
            // Expor API global
            window.RiquezaAPI = {
                aumentar: () => window.sistemaRiqueza.aumentarNivel(),
                diminuir: () => window.sistemaRiqueza.diminuirNivel(),
                resetar: () => window.sistemaRiqueza.resetarNivel(),
                getNivel: () => window.sistemaRiqueza.getNivelAtual(),
                setNivel: (nivel) => window.sistemaRiqueza.setNivel(nivel)
            };
            
            console.log('✅ Sistema de Riqueza inicializado com sucesso!');
            console.log('📚 API disponível em: window.RiquezaAPI');
            
        } catch (error) {
            console.error('❌ Erro na inicialização do sistema:', error);
            
            // Fallback básico
            iniciarFallbackBasico();
        }
    }, 100);
});

/* =========================================== */
/* FALLBACK BÁSICO (se o sistema principal falhar) */
/* =========================================== */

function iniciarFallbackBasico() {
    console.log('⚠️ Iniciando fallback básico...');
    
    const select = document.getElementById('nivelRiqueza');
    if (!select) {
        console.error('❌ Elemento #nivelRiqueza não encontrado!');
        return;
    }
    
    // Dados básicos
    const dados = {
        '-25': { p: '-25 pts', m: '0.1x', r: '$0', d: 'Falido' },
        '-15': { p: '-15 pts', m: '0.3x', r: '$300', d: 'Pobre' },
        '-10': { p: '-10 pts', m: '0.6x', r: '$800', d: 'Batalhador' },
        '0': { p: '0 pts', m: '1.0x', r: '$1.000', d: 'Médio' },
        '10': { p: '+10 pts', m: '2.0x', r: '$2.500', d: 'Confortável' },
        '20': { p: '+20 pts', m: '5.0x', r: '$8.000', d: 'Rico' },
        '30': { p: '+30 pts', m: '10.0x', r: '$15.000', d: 'Muito Rico' },
        '50': { p: '+50 pts', m: '25.0x', r: '$40.000', d: 'Podre de Rico' }
    };
    
    // Função de atualização
    function atualizar() {
        const valor = select.value;
        const info = dados[valor] || dados['0'];
        
        // Atualizar elementos
        const elementos = [
            { id: 'pontosRiqueza', valor: info.p },
            { id: 'multiplicadorRiqueza', valor: info.m },
            { id: 'rendaMensal', valor: info.r },
            { id: 'descricaoRiqueza', valor: info.d }
        ];
        
        elementos.forEach(item => {
            const el = document.getElementById(item.id);
            if (el) el.textContent = item.valor;
        });
        
        // Efeito visual
        select.style.borderColor = '#D4AF37';
        select.style.boxShadow = '0 0 10px rgba(212, 175, 55, 0.5)';
        setTimeout(() => {
            select.style.borderColor = '';
            select.style.boxShadow = '';
        }, 300);
    }
    
    // Adicionar evento
    select.addEventListener('change', atualizar);
    
    // Atualizar inicial
    atualizar();
    
    console.log('✅ Fallback básico ativado');
}

/* =========================================== */
/* POLYFILLS E UTILITÁRIOS */
/* =========================================== */

// Garantir compatibilidade
if (!window.CustomEvent) {
    window.CustomEvent = function(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    };
    window.CustomEvent.prototype = window.Event.prototype;
}

// Adicionar estilos de animação
const animacoesCSS = document.createElement('style');
animacoesCSS.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(animacoesCSS);

/* =========================================== */
/* LOG DE INICIALIZAÇÃO */
/* =========================================== */

console.log('📦 Sistema de Riqueza carregado. Aguardando inicialização...');