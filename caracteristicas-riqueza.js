// caracteristicas-riqueza.js - VERSÃO COMPLETA E AUTÔNOMA
(function() {
    'use strict';
    
    console.log('🎯 INICIANDO SISTEMA DE RIQUEZA - VERSÃO AUTÔNOMA');
    
    // ====================== CONFIGURAÇÃO ======================
    const CONFIG = {
        niveis: {
            "-25": { nome: "Falido", pontos: -25, mult: 0.1, renda: "$50", desc: "Você não possui praticamente nada." },
            "-15": { nome: "Pobre", pontos: -15, mult: 0.3, renda: "$300", desc: "Possui apenas o essencial para sobreviver." },
            "-10": { nome: "Batalhador", pontos: -10, mult: 0.5, renda: "$500", desc: "Consegue pagar suas contas, mas sem sobras." },
            "0": { nome: "Médio", pontos: 0, mult: 1.0, renda: "$1.000", desc: "Possui uma vida confortável, com casa própria." },
            "10": { nome: "Confortável", pontos: 10, mult: 2.0, renda: "$2.000", desc: "Vive bem, pode se dar ao luxo de pequenos prazeres." },
            "20": { nome: "Rico", pontos: 20, mult: 5.0, renda: "$5.000", desc: "Possui propriedades, investimentos e vida de luxo moderado." },
            "30": { nome: "Muito Rico", pontos: 30, mult: 10.0, renda: "$10.000", desc: "Parte da elite econômica. Tem influência política e social." },
            "50": { nome: "Podre de Rico", pontos: 50, mult: 20.0, renda: "$20.000", desc: "Fortuna colossal. Pode comprar praticamente qualquer coisa." }
        },
        localStorageKey: 'gurps_riqueza_atual',
        debug: true
    };
    
    // ====================== ESTADO ======================
    let estado = {
        nivelAtual: "0",
        elementos: {
            select: null,
            badge: null,
            multiplicador: null,
            renda: null,
            descricao: null
        },
        inicializado: false
    };
    
    // ====================== FUNÇÕES PRINCIPAIS ======================
    
    function log(mensagem, tipo = 'info') {
        if (CONFIG.debug) {
            const cores = { info: '📦', success: '✅', error: '❌', warning: '⚠️' };
            console.log(`${cores[tipo] || '📝'} ${mensagem}`);
        }
    }
    
    function buscarElementos() {
        log('Buscando elementos DOM...');
        
        estado.elementos = {
            select: document.getElementById('nivelRiqueza'),
            badge: document.getElementById('pontosRiqueza'),
            multiplicador: document.getElementById('multiplicadorRiqueza'),
            renda: document.getElementById('rendaMensal'),
            descricao: document.getElementById('descricaoRiqueza')
        };
        
        // Verificar quais elementos foram encontrados
        Object.entries(estado.elementos).forEach(([nome, elemento]) => {
            log(`${nome}: ${elemento ? '✅ Encontrado' : '❌ Não encontrado'}`);
        });
        
        return estado.elementos.select && estado.elementos.badge;
    }
    
    function aplicarEstilos() {
        log('Aplicando estilos dinâmicos...');
        
        const estilo = `
            /* ESTILOS DINÂMICOS PARA RIQUEZA */
            #pontosRiqueza.riqueza-positivo {
                background: linear-gradient(145deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.3)) !important;
                border-color: #27ae60 !important;
                color: #2ecc71 !important;
            }
            
            #pontosRiqueza.riqueza-negativo {
                background: linear-gradient(145deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.3)) !important;
                border-color: #c0392b !important;
                color: #e74c3c !important;
            }
            
            #pontosRiqueza.riqueza-neutro {
                background: linear-gradient(145deg, rgba(149, 165, 166, 0.2), rgba(127, 140, 141, 0.3)) !important;
                border-color: #7f8c8d !important;
                color: #95a5a6 !important;
            }
            
            .riqueza-animacao {
                animation: riquezaPulse 0.5s ease;
            }
            
            @keyframes riquezaPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            /* Melhorar aparência do select */
            #nivelRiqueza:focus {
                outline: 2px solid var(--secondary-gold) !important;
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.3) !important;
            }
        `;
        
        const styleElement = document.createElement('style');
        styleElement.textContent = estilo;
        document.head.appendChild(styleElement);
        
        log('Estilos aplicados!');
    }
    
    function carregarEstadoSalvo() {
        try {
            const salvo = localStorage.getItem(CONFIG.localStorageKey);
            if (salvo !== null && CONFIG.niveis[salvo]) {
                estado.nivelAtual = salvo;
                log(`Estado carregado: ${salvo}`);
                return true;
            }
        } catch (e) {
            log(`Erro ao carregar estado: ${e.message}`, 'error');
        }
        return false;
    }
    
    function salvarEstado() {
        try {
            localStorage.setItem(CONFIG.localStorageKey, estado.nivelAtual);
            log(`Estado salvo: ${estado.nivelAtual}`);
        } catch (e) {
            log(`Erro ao salvar estado: ${e.message}`, 'error');
        }
    }
    
    function atualizarDisplay() {
        const { select, badge, multiplicador, renda, descricao } = estado.elementos;
        const nivel = CONFIG.niveis[estado.nivelAtual];
        
        if (!nivel) {
            log(`Nível ${estado.nivelAtual} não encontrado!`, 'error');
            return;
        }
        
        log(`Atualizando display para: ${nivel.nome} (${nivel.pontos} pts)`);
        
        // Atualizar select
        if (select && select.value !== estado.nivelAtual) {
            select.value = estado.nivelAtual;
        }
        
        // Atualizar badge de pontos
        if (badge) {
            badge.textContent = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
            
            // Remover classes antigas
            badge.classList.remove('riqueza-positivo', 'riqueza-negativo', 'riqueza-neutro');
            
            // Adicionar classe apropriada
            if (nivel.pontos > 0) {
                badge.classList.add('riqueza-positivo');
            } else if (nivel.pontos < 0) {
                badge.classList.add('riqueza-negativo');
            } else {
                badge.classList.add('riqueza-neutro');
            }
            
            // Adicionar animação
            badge.classList.add('riqueza-animacao');
            setTimeout(() => badge.classList.remove('riqueza-animacao'), 500);
        }
        
        // Atualizar multiplicador
        if (multiplicador) {
            multiplicador.textContent = `${nivel.mult}x`;
        }
        
        // Atualizar renda
        if (renda) {
            renda.textContent = nivel.renda;
        }
        
        // Atualizar descrição
        if (descricao) {
            descricao.textContent = nivel.desc;
        }
        
        log('Display atualizado com sucesso!', 'success');
    }
    
    function configurarEventos() {
        const { select } = estado.elementos;
        
        if (!select) {
            log('Select não encontrado para configurar eventos', 'error');
            return;
        }
        
        // Remover event listeners antigos (se houver)
        const novoSelect = select.cloneNode(true);
        select.parentNode.replaceChild(novoSelect, select);
        estado.elementos.select = novoSelect;
        
        // Adicionar novo event listener
        novoSelect.addEventListener('change', function(e) {
            const novoValor = e.target.value;
            log(`Select alterado para: ${novoValor}`);
            
            if (CONFIG.niveis[novoValor]) {
                estado.nivelAtual = novoValor;
                atualizarDisplay();
                salvarEstado();
                
                // Atualizar sistema global de pontos (se existir)
                if (window.atualizarPontosTotais) {
                    window.atualizarPontosTotais();
                }
                
                // Atualizar dashboard (se existir)
                if (window.dashboardManager && window.dashboardManager.atualizarRiqueza) {
                    window.dashboardManager.atualizarRiqueza(nivel);
                }
            } else {
                log(`Valor inválido: ${novoValor}`, 'error');
            }
        });
        
        log('Eventos configurados!');
    }
    
    function verificarTabAtiva() {
        const caracteristicasTab = document.getElementById('caracteristicas');
        if (caracteristicasTab && caracteristicasTab.classList.contains('active')) {
            log('Tab características está ativa!');
            return true;
        }
        return false;
    }
    
    function inicializarSistema() {
        log('=== INICIALIZANDO SISTEMA DE RIQUEZA ===');
        
        // Tentar buscar elementos
        if (!buscarElementos()) {
            log('Elementos essenciais não encontrados, tentando novamente em 500ms...', 'warning');
            setTimeout(tentarInicializacao, 500);
            return false;
        }
        
        // Aplicar estilos
        aplicarEstilos();
        
        // Carregar estado salvo
        carregarEstadoSalvo();
        
        // Configurar eventos
        configurarEventos();
        
        // Atualizar display
        atualizarDisplay();
        
        estado.inicializado = true;
        log('=== SISTEMA DE RIQUEZA INICIALIZADO COM SUCESSO ===', 'success');
        
        return true;
    }
    
    function tentarInicializacao() {
        if (!estado.inicializado) {
            log('Tentando inicialização...');
            inicializarSistema();
        }
    }
    
    // ====================== INICIALIZAÇÃO AUTOMÁTICA ======================
    
    // Estratégia 1: Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            log('DOM completamente carregado');
            setTimeout(tentarInicializacao, 300);
        });
    } else {
        log('DOM já carregado');
        setTimeout(tentarInicializacao, 300);
    }
    
    // Estratégia 2: Observar quando a tab de características for ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (verificarTabAtiva() && !estado.inicializado) {
                    log('Tab características foi ativada, inicializando sistema...');
                    setTimeout(tentarInicializacao, 100);
                }
            }
        });
    });
    
    // Iniciar observação
    const caracteristicasTab = document.getElementById('caracteristicas');
    if (caracteristicasTab) {
        observer.observe(caracteristicasTab, { attributes: true });
        log('Observador configurado para tab características');
    }
    
    // Estratégia 3: Forçar inicialização após alguns segundos
    setTimeout(function() {
        if (!estado.inicializado) {
            log('Forçando inicialização após timeout...');
            tentarInicializacao();
        }
    }, 3000);
    
    // Estratégia 4: Capturar cliques em tabs
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
            log('Tab características clicada');
            setTimeout(tentarInicializacao, 200);
        }
    });
    
    // ====================== API PÚBLICA ======================
    
    window.sistemaRiqueza = {
        // Métodos principais
        inicializar: function() {
            return inicializarSistema();
        },
        
        getPontos: function() {
            const nivel = CONFIG.niveis[estado.nivelAtual];
            return nivel ? nivel.pontos : 0;
        },
        
        getMultiplicador: function() {
            const nivel = CONFIG.niveis[estado.nivelAtual];
            return nivel ? nivel.mult : 1.0;
        },
        
        getDados: function() {
            return {
                nivel: estado.nivelAtual,
                dados: CONFIG.niveis[estado.nivelAtual]
            };
        },
        
        setNivel: function(novoNivel) {
            if (CONFIG.niveis[novoNivel]) {
                estado.nivelAtual = novoNivel;
                if (estado.elementos.select) {
                    estado.elementos.select.value = novoNivel;
                }
                atualizarDisplay();
                salvarEstado();
                return true;
            }
            return false;
        },
        
        carregarDados: function(dados) {
            if (dados && dados.nivel && CONFIG.niveis[dados.nivel]) {
                return this.setNivel(dados.nivel);
            }
            return false;
        },
        
        resetar: function() {
            return this.setNivel("0");
        },
        
        // Status
        estaInicializado: function() {
            return estado.inicializado;
        },
        
        // Debug
        debug: function() {
            console.log('=== DEBUG SISTEMA RIQUEZA ===');
            console.log('Estado:', estado);
            console.log('Elementos encontrados:', estado.elementos);
            console.log('Nível atual:', estado.nivelAtual);
            console.log('Dados nível:', CONFIG.niveis[estado.nivelAtual]);
            console.log('LocalStorage:', localStorage.getItem(CONFIG.localStorageKey));
            console.log('============================');
        }
    };
    
    log('Sistema de riqueza carregado e pronto!');
    
    // Forçar inicialização imediata se estiver na tab certa
    if (verificarTabAtiva()) {
        setTimeout(tentarInicializacao, 100);
    }
    
})();