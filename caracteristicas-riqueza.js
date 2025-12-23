/* =========================================== */
/* SISTEMA DE RIQUEZA - COM CONTROLE DE PONTOS */
/* =========================================== */

class SistemaRiqueza {
    constructor(sistemaPontos) {
        // Referência ao sistema de pontos global
        this.sistemaPontos = sistemaPontos;
        
        this.riquezaData = {
            '-25': { 
                label: 'Falido', 
                pontos: -25,
                multiplicador: 0.1,
                renda: 0,
                descricao: 'Sem recursos, dependendo da caridade'
            },
            '-15': { 
                label: 'Pobre', 
                pontos: -15,
                multiplicador: 0.3,
                renda: 300,
                descricao: 'Recursos mínimos para sobrevivência'
            },
            '-10': { 
                label: 'Batalhador', 
                pontos: -10,
                multiplicador: 0.6,
                renda: 800,
                descricao: 'Vive com dificuldade, mas se mantém'
            },
            '0': { 
                label: 'Médio', 
                pontos: 0,
                multiplicador: 1.0,
                renda: 1000,
                descricao: 'Nível de recursos pré-definido padrão'
            },
            '10': { 
                label: 'Confortável', 
                pontos: 10,
                multiplicador: 2.0,
                renda: 2500,
                descricao: 'Vive bem, sem grandes preocupações financeiras'
            },
            '20': { 
                label: 'Rico', 
                pontos: 20,
                multiplicador: 5.0,
                renda: 8000,
                descricao: 'Recursos abundantes, estilo de vida luxuoso'
            },
            '30': { 
                label: 'Muito Rico', 
                pontos: 30,
                multiplicador: 10.0,
                renda: 15000,
                descricao: 'Fortuna considerável, influência econômica'
            },
            '50': { 
                label: 'Podre de Rico', 
                pontos: 50,
                multiplicador: 25.0,
                renda: 40000,
                descricao: 'Riqueza excepcional, poder econômico significativo'
            }
        };
        
        this.nivelAtual = '0';
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.carregarSalvo();
        this.atualizarDisplay();
        this.bindEvents();
    }
    
    cacheElements() {
        this.elements = {
            nivelRiqueza: document.getElementById('nivelRiqueza'),
            pontosRiqueza: document.getElementById('pontosRiqueza'),
            multiplicadorRiqueza: document.getElementById('multiplicadorRiqueza'),
            rendaMensal: document.getElementById('rendaMensal'),
            descricaoRiqueza: document.getElementById('descricaoRiqueza')
        };
    }
    
    bindEvents() {
        this.elements.nivelRiqueza.addEventListener('change', (e) => {
            this.mudarNivel(e.target.value);
        });
        
        window.addEventListener('beforeunload', () => this.salvarEstado());
        
        // Se houver sistema de pontos, configurar atualização
        if (this.sistemaPontos) {
            this.configurarSistemaPontos();
        }
    }
    
    mudarNivel(novoNivel) {
        const nivelAntigo = this.nivelAtual;
        const dadosAntigos = this.riquezaData[nivelAntigo];
        const dadosNovos = this.riquezaData[novoNivel];
        
        if (!dadosNovos) {
            console.error('Nível de riqueza inválido:', novoNivel);
            return false;
        }
        
        // Calcular diferença de pontos
        const diferencaPontos = dadosNovos.pontos - dadosAntigos.pontos;
        
        // Verificar se há pontos suficientes (se for aumento)
        if (diferencaPontos > 0 && this.sistemaPontos) {
            if (!this.sistemaPontos.temPontosSuficientes(diferencaPontos, 'riqueza')) {
                console.warn('Pontos insuficientes para aumentar riqueza');
                // Reverter para o nível anterior
                this.elements.nivelRiqueza.value = nivelAntigo;
                return false;
            }
        }
        
        // Atualizar nível
        this.nivelAtual = novoNivel;
        
        // Atualizar display
        this.atualizarDisplay();
        
        // Atualizar pontos no sistema
        if (this.sistemaPontos) {
            if (diferencaPontos > 0) {
                // Gastar pontos
                this.sistemaPontos.gastarPontos(diferencaPontos, 'riqueza');
            } else if (diferencaPontos < 0) {
                // Receber pontos de volta (negativo significa receber)
                this.sistemaPontos.adicionarPontos(Math.abs(diferencaPontos), 'riqueza');
            }
        }
        
        // Salvar e disparar eventos
        this.salvarEstado();
        this.dispararEventoMudanca(dadosNovos, dadosAntigos);
        
        return true;
    }
    
    atualizarDisplay() {
        const dados = this.riquezaData[this.nivelAtual];
        
        if (!dados) return;
        
        // Atualizar elementos
        this.elements.pontosRiqueza.textContent = `${dados.pontos >= 0 ? '+' : ''}${dados.pontos} pts`;
        this.elements.multiplicadorRiqueza.textContent = `${dados.multiplicador.toFixed(1)}x`;
        this.elements.rendaMensal.textContent = this.formatarMoeda(dados.renda);
        this.elements.descricaoRiqueza.textContent = dados.descricao;
        
        // Atualizar estilo do badge
        this.atualizarEstiloBadge(dados.pontos);
        
        // Atualizar select
        this.elements.nivelRiqueza.value = this.nivelAtual;
    }
    
    atualizarEstiloBadge(pontos) {
        const badge = this.elements.pontosRiqueza;
        
        // Remover classes anteriores
        badge.classList.remove(
            'destaque-positivo', 
            'destaque-negativo', 
            'status-ok', 
            'status-warning', 
            'status-danger'
        );
        
        // Adicionar nova classe baseada nos pontos
        if (pontos >= 30) {
            badge.classList.add('destaque-positivo', 'status-ok');
        } else if (pontos >= 20) {
            badge.classList.add('status-ok');
        } else if (pontos >= 10) {
            badge.classList.add('status-ok');
        } else if (pontos >= 0) {
            badge.classList.add('status-warning');
        } else if (pontos >= -10) {
            badge.classList.add('status-warning');
        } else if (pontos >= -15) {
            badge.classList.add('status-danger');
        } else {
            badge.classList.add('destaque-negativo', 'status-danger');
        }
    }
    
    formatarMoeda(valor) {
        // Formatar como moeda (ajuste conforme sua preferência)
        return `$${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    configurarSistemaPontos() {
        // Configurar callback para quando os pontos mudarem
        if (typeof this.sistemaPontos.onPontosChange === 'function') {
            this.sistemaPontos.onPontosChange(() => {
                this.verificarDisponibilidade();
            });
        }
    }
    
    verificarDisponibilidade() {
        const dadosAtuais = this.riquezaData[this.nivelAtual];
        const opcoes = this.elements.nivelRiqueza.options;
        
        // Verificar cada opção se está disponível
        for (let i = 0; i < opcoes.length; i++) {
            const valor = opcoes[i].value;
            const dados = this.riquezaData[valor];
            const option = opcoes[i];
            
            if (dados) {
                const diferenca = dados.pontos - dadosAtuais.pontos;
                
                // Se for aumento, verificar se tem pontos
                if (diferenca > 0 && this.sistemaPontos) {
                    const temPontos = this.sistemaPontos.temPontosSuficientes(diferenca, 'riqueza');
                    
                    option.disabled = !temPontos;
                    option.style.opacity = temPontos ? '1' : '0.5';
                    option.style.cursor = temPontos ? 'pointer' : 'not-allowed';
                } else {
                    option.disabled = false;
                    option.style.opacity = '1';
                    option.style.cursor = 'pointer';
                }
            }
        }
    }
    
    salvarEstado() {
        try {
            const estado = {
                nivelRiqueza: this.nivelAtual,
                timestamp: Date.now()
            };
            localStorage.setItem('fichaRiqueza', JSON.stringify(estado));
        } catch (error) {
            console.error('Erro ao salvar riqueza:', error);
        }
    }
    
    carregarSalvo() {
        try {
            const salvo = localStorage.getItem('fichaRiqueza');
            if (salvo) {
                const estado = JSON.parse(salvo);
                
                // Verificar se o nível existe
                if (this.riquezaData[estado.nivelRiqueza]) {
                    this.nivelAtual = estado.nivelRiqueza;
                    this.elements.nivelRiqueza.value = estado.nivelRiqueza;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar riqueza:', error);
        }
    }
    
    dispararEventoMudanca(dadosNovos, dadosAntigos) {
        const evento = new CustomEvent('riquezaAlterada', {
            detail: {
                nivel: dadosNovos.label,
                valor: this.nivelAtual,
                pontos: dadosNovos.pontos,
                multiplicador: dadosNovos.multiplicador,
                renda: dadosNovos.renda,
                diferencaPontos: dadosNovos.pontos - dadosAntigos.pontos,
                anterior: dadosAntigos.label
            },
            bubbles: true
        });
        
        this.elements.nivelRiqueza.dispatchEvent(evento);
        
        // Animar mudança
        this.animarMudanca();
    }
    
    animarMudanca() {
        const info = document.querySelector('.riqueza-info');
        if (info) {
            info.style.animation = 'none';
            setTimeout(() => {
                info.style.animation = 'highlightChange 1s ease';
            }, 10);
        }
    }
    
    // Métodos públicos para integração
    getPontos() {
        return this.riquezaData[this.nivelAtual]?.pontos || 0;
    }
    
    getMultiplicador() {
        return this.riquezaData[this.nivelAtual]?.multiplicador || 1;
    }
    
    getRenda() {
        return this.riquezaData[this.nivelAtual]?.renda || 0;
    }
    
    getDados() {
        return { ...this.riquezaData[this.nivelAtual], valor: this.nivelAtual };
    }
    
    setNivelRiqueza(valor) {
        return this.mudarNivel(valor);
    }
    
    reset() {
        this.mudarNivel('0');
    }
}

/* =========================================== */
/* SIMULAÇÃO DE SISTEMA DE PONTOS (se não existir) */
/* =========================================== */

class SistemaPontosSimulado {
    constructor(pontosIniciais = 100) {
        this.pontosDisponiveis = pontosIniciais;
        this.pontosGastos = {
            riqueza: 0,
            atributos: 0,
            vantagens: 0,
            // ... outras categorias
        };
        
        this.callbacks = [];
        this.init();
    }
    
    init() {
        this.atualizarDisplayPontos();
    }
    
    temPontosSuficientes(pontos, categoria = 'geral') {
        return this.pontosDisponiveis >= pontos;
    }
    
    gastarPontos(pontos, categoria = 'geral') {
        if (this.temPontosSuficientes(pontos, categoria)) {
            this.pontosDisponiveis -= pontos;
            this.pontosGastos[categoria] = (this.pontosGastos[categoria] || 0) + pontos;
            this.atualizarDisplayPontos();
            this.executarCallbacks();
            return true;
        }
        return false;
    }
    
    adicionarPontos(pontos, categoria = 'geral') {
        this.pontosDisponiveis += pontos;
        this.pontosGastos[categoria] = Math.max(0, (this.pontosGastos[categoria] || 0) - pontos);
        this.atualizarDisplayPontos();
        this.executarCallbacks();
        return true;
    }
    
    atualizarDisplayPontos() {
        // Atualizar display global de pontos se existir
        const displayGlobal = document.getElementById('pontosTotais');
        if (displayGlobal) {
            displayGlobal.textContent = `${this.pontosDisponiveis} pts`;
            
            // Adicionar efeito visual
            displayGlobal.classList.add('destaque');
            setTimeout(() => {
                displayGlobal.classList.remove('destaque');
            }, 500);
        }
    }
    
    onPontosChange(callback) {
        this.callbacks.push(callback);
    }
    
    execututarCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback();
            } catch (error) {
                console.error('Erro em callback de pontos:', error);
            }
        });
    }
    
    getPontosDisponiveis() {
        return this.pontosDisponiveis;
    }
    
    getPontosGastos(categoria = null) {
        if (categoria) {
            return this.pontosGastos[categoria] || 0;
        }
        return Object.values(this.pontosGastos).reduce((a, b) => a + b, 0);
    }
}

/* =========================================== */
/* INICIALIZAÇÃO DO SISTEMA */
/* =========================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de características
    const secaoRiqueza = document.getElementById('nivelRiqueza');
    
    if (!secaoRiqueza) return;
    
    // Inicializar sistema de pontos (ou usar existente)
    let sistemaPontos;
    
    // Verificar se já existe um sistema de pontos global
    if (window.sistemaPontosFicha) {
        sistemaPontos = window.sistemaPontosFicha;
    } else {
        // Criar sistema simulado
        sistemaPontos = new SistemaPontosSimulado(100);
        window.sistemaPontosFicha = sistemaPontos;
    }
    
    // Inicializar sistema de riqueza
    const sistemaRiqueza = new SistemaRiqueza(sistemaPontos);
    window.sistemaRiqueza = sistemaRiqueza;
    
    // Adicionar controles extras
    adicionarControlesRiqueza(sistemaRiqueza);
    
    // Configurar sistema para verificar disponibilidade baseado em pontos
    setTimeout(() => {
        sistemaRiqueza.verificarDisponibilidade();
    }, 100);
    
    console.log('Sistema de Riqueza inicializado com sucesso!');
});

/* =========================================== */
/* CONTROLES EXTRAS DE NAVEGAÇÃO */
/* =========================================== */

function adicionarControlesRiqueza(sistemaRiqueza) {
    const riquezaContainer = document.querySelector('.riqueza-container');
    if (!riquezaContainer) return;
    
    // Verificar se já existem controles
    if (document.querySelector('.controles-riqueza')) return;
    
    const controlesHTML = `
        <div class="controles-riqueza" style="
            display: flex;
            gap: 10px;
            margin-top: 15px;
            justify-content: center;
            flex-wrap: wrap;
        ">
            <button type="button" class="btn-controle btn-riqueza-down" style="
                padding: 6px 12px;
                background: linear-gradient(145deg, var(--wood-dark), #4a352b);
                border: 1px solid var(--wood-light);
                border-radius: 6px;
                color: var(--text-light);
                cursor: pointer;
                font-family: 'Cinzel', serif;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.3s ease;
            ">
                <i class="fas fa-chevron-down"></i> Mais Pobre
            </button>
            <button type="button" class="btn-controle btn-riqueza-up" style="
                padding: 6px 12px;
                background: linear-gradient(145deg, var(--wood-dark), #4a352b);
                border: 1px solid var(--wood-light);
                border-radius: 6px;
                color: var(--text-light);
                cursor: pointer;
                font-family: 'Cinzel', serif;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.3s ease;
            ">
                Mais Rico <i class="fas fa-chevron-up"></i>
            </button>
            <button type="button" class="btn-controle btn-riqueza-reset" style="
                padding: 6px 12px;
                background: linear-gradient(145deg, rgba(26, 18, 0, 0.8), rgba(44, 32, 8, 0.9));
                border: 1px solid var(--primary-gold);
                border-radius: 6px;
                color: var(--text-gold);
                cursor: pointer;
                font-family: 'Cinzel', serif;
                font-size: 0.9rem;
                display: flex;
                align-items: center;
                gap: 5px;
                transition: all 0.3s ease;
            ">
                <i class="fas fa-undo-alt"></i> Resetar
            </button>
        </div>
    `;
    
    riquezaContainer.insertAdjacentHTML('beforeend', controlesHTML);
    
    // Adicionar eventos
    document.querySelector('.btn-riqueza-down')?.addEventListener('click', () => {
        const niveis = ['-25', '-15', '-10', '0', '10', '20', '30', '50'];
        const atual = sistemaRiqueza.nivelAtual;
        const indexAtual = niveis.indexOf(atual);
        
        if (indexAtual > 0) {
            const novoNivel = niveis[indexAtual - 1];
            sistemaRiqueza.setNivelRiqueza(novoNivel);
        }
    });
    
    document.querySelector('.btn-riqueza-up')?.addEventListener('click', () => {
        const niveis = ['-25', '-15', '-10', '0', '10', '20', '30', '50'];
        const atual = sistemaRiqueza.nivelAtual;
        const indexAtual = niveis.indexOf(atual);
        
        if (indexAtual < niveis.length - 1) {
            const novoNivel = niveis[indexAtual + 1];
            sistemaRiqueza.setNivelRiqueza(novoNivel);
        }
    });
    
    document.querySelector('.btn-riqueza-reset')?.addEventListener('click', () => {
        sistemaRiqueza.reset();
    });
    
    // Adicionar estilo de hover
    const botoes = riquezaContainer.querySelectorAll('.btn-controle');
    botoes.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 8px rgba(212, 175, 55, 0.2)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

/* =========================================== */
/* EVENTOS E INTEGRAÇÃO COM OUTRAS SEÇÕES */
/* =========================================== */

// Exemplo de como outras partes do sistema podem escutar mudanças
document.addEventListener('riquezaAlterada', function(e) {
    console.log('Riqueza alterada:', e.detail);
    
    // Atualizar informações em outras partes do sistema
    if (window.atualizarCustoVida) {
        window.atualizarCustoVida(e.detail.multiplicador);
    }
    
    if (window.atualizarEquipamentosIniciais) {
        window.atualizarEquipamentosIniciais(e.detail.renda);
    }
    
    // Atualizar display de pontos totais se existir
    if (window.sistemaPontosFicha) {
        window.sistemaPontosFicha.atualizarDisplayPontos();
    }
});

/* =========================================== */
/* FUNÇÕES DE UTILIDADE PARA O SISTEMA */
/* =========================================== */

// Função para obter dados da riqueza de forma global
function obterDadosRiqueza() {
    if (window.sistemaRiqueza) {
        return window.sistemaRiqueza.getDados();
    }
    return null;
}

// Função para verificar se pode aumentar riqueza
function podeAumentarRiqueza() {
    if (!window.sistemaRiqueza || !window.sistemaPontosFicha) return false;
    
    const dadosAtuais = window.sistemaRiqueza.getDados();
    const niveis = ['-25', '-15', '-10', '0', '10', '20', '30', '50'];
    const indexAtual = niveis.indexOf(window.sistemaRiqueza.nivelAtual);
    
    if (indexAtual < niveis.length - 1) {
        const proximoNivel = niveis[indexAtual + 1];
        const dadosProximo = window.sistemaRiqueza.riquezaData[proximoNivel];
        const diferenca = dadosProximo.pontos - dadosAtuais.pontos;
        
        return window.sistemaPontosFicha.temPontosSuficientes(diferenca, 'riqueza');
    }
    
    return false;
}

/* =========================================== */
/* ANIMAÇÕES CSS ADICIONAIS */
/* =========================================== */

// Adicionar animação CSS se não existir
if (!document.querySelector('#animacoes-riqueza')) {
    const style = document.createElement('style');
    style.id = 'animacoes-riqueza';
    style.textContent = `
        @keyframes highlightChange {
            0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
            100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        
        .riqueza-info.destaque {
            animation: highlightChange 1s ease;
        }
        
        #pontosRiqueza.destaque-positivo {
            animation: pulseGold 2s infinite;
        }
        
        #pontosRiqueza.destaque-negativo {
            animation: pulseDark 2s infinite;
        }
        
        @keyframes pulseGold {
            0% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
            100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        
        @keyframes pulseDark {
            0% { box-shadow: 0 0 0 0 rgba(139, 0, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(139, 0, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(139, 0, 0, 0); }
        }
    `;
    document.head.appendChild(style);
}