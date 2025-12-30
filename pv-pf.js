// ===========================================
// pv-pf.js - Sistema de Pontos de Vida e Fadiga
// ===========================================

(function() {
    'use strict';

    // ========== CONFIGURAÇÃO ==========
    const CONFIG = {
        debug: true,
        atualizacaoAutomatica: true,
        intervaloAtualizacao: 1000, // ms
        animacaoDuração: 300
    };

    // ========== ESTADO GLOBAL ==========
    let estado = {
        // Atributos base (serão atualizados em tempo real)
        st: 10,
        ht: 10,
        
        // PV
        pv: {
            atual: 10,
            maximo: 10,
            modificador: 0,
            modificadores: [] // Array de modificadores temporários
        },
        
        // PF
        pf: {
            atual: 10,
            maximo: 10,
            modificador: 0,
            fadigaAtiva: false,
            modificadores: []
        },
        
        // Cache para performance
        cache: {
            stAtual: 10,
            htAtual: 10,
            ultimaAtualizacao: Date.now()
        }
    };

    // ========== SISTEMA DE EVENTOS ==========
    const Eventos = {
        listeners: {},
        
        on(evento, callback) {
            if (!this.listeners[evento]) this.listeners[evento] = [];
            this.listeners[evento].push(callback);
        },
        
        emit(evento, dados) {
            if (CONFIG.debug) console.log(`📢 Evento: ${evento}`, dados);
            
            if (this.listeners[evento]) {
                this.listeners[evento].forEach(callback => {
                    try {
                        callback(dados);
                    } catch (e) {
                        console.error(`Erro no evento ${evento}:`, e);
                    }
                });
            }
        }
    };

    // ========== FUNÇÕES PÚBLICAS (chamadas pelo HTML) ==========

    // PV
    window.danoPV5 = () => alterarPV(-5);
    window.danoPV2 = () => alterarPV(-2);
    window.danoPV1 = () => alterarPV(-1);
    window.curaPV5 = () => alterarPV(5);
    window.curaPV2 = () => alterarPV(2);
    window.curaPV1 = () => alterarPV(1);
    window.modPVMais = () => modificarPV(1);
    window.modPVMenos = () => modificarPV(-1);
    window.resetPV = () => resetPV();

    // PF
    window.fadigaPF3 = () => alterarPF(-3);
    window.fadigaPF1 = () => alterarPF(-1);
    window.descansoPF3 = () => alterarPF(3);
    window.descansoPF1 = () => alterarPF(1);
    window.modPFMais = () => modificarPF(1);
    window.modPFMenos = () => modificarPF(-1);
    window.resetPF = () => resetPF();

    // Inputs manuais
    window.atualizarPVInput = function() {
        const input = document.getElementById('pvAtualDisplay');
        if (!input) return;
        
        const valor = parseInt(input.value);
        if (isNaN(valor)) return;
        
        const limiteMorte = -5 * estado.st;
        const novoValor = Math.max(limiteMorte, Math.min(estado.pv.maximo, valor));
        
        estado.pv.atual = novoValor;
        input.value = novoValor;
        
        Eventos.emit('pv-alterado', { 
            valor: novoValor,
            tipo: 'manual',
            diferenca: novoValor - estado.pv.atual
        });
        
        atualizarInterface();
    };

    window.atualizarPFInput = function() {
        const input = document.getElementById('pfAtualDisplay');
        if (!input) return;
        
        const valor = parseInt(input.value);
        if (isNaN(valor)) return;
        
        const limiteExaustao = -estado.ht;
        const novoValor = Math.max(limiteExaustao, Math.min(estado.pf.maximo, valor));
        
        const pfAntes = estado.pf.atual;
        estado.pf.atual = novoValor;
        input.value = novoValor;
        
        // Verifica dano por exaustão
        if (novoValor <= 0 && pfAntes > 0) {
            aplicarDanoPorExaustao(Math.abs(novoValor));
        }
        
        Eventos.emit('pf-alterado', { 
            valor: novoValor,
            tipo: 'manual',
            diferenca: novoValor - pfAntes
        });
        
        atualizarInterface();
    };

    // ========== FUNÇÕES INTERNAS ==========

    function alterarPV(delta) {
        const pvAntes = estado.pv.atual;
        const limiteMorte = -5 * estado.st;
        
        estado.pv.atual += delta;
        estado.pv.atual = Math.max(limiteMorte, Math.min(estado.pv.maximo, estado.pv.atual));
        
        // Animações
        if (delta < 0) {
            aplicarEfeitoDano('pv');
        } else if (delta > 0) {
            aplicarEfeitoCura('pv');
        }
        
        Eventos.emit('pv-alterado', {
            valor: estado.pv.atual,
            tipo: delta < 0 ? 'dano' : 'cura',
            diferenca: delta,
            antes: pvAntes
        });
        
        atualizarInterface();
    }

    function alterarPF(delta) {
        const pfAntes = estado.pf.atual;
        const limiteExaustao = -estado.ht;
        
        estado.pf.atual += delta;
        estado.pf.atual = Math.max(limiteExaustao, Math.min(estado.pf.maximo, estado.pf.atual));
        
        // Verifica se entrou em exaustão
        if (estado.pf.atual <= 0 && pfAntes > 0) {
            aplicarDanoPorExaustao(Math.abs(estado.pf.atual));
        }
        
        // Animações
        if (delta < 0) {
            aplicarEfeitoDano('pf');
        } else if (delta > 0) {
            aplicarEfeitoCura('pf');
        }
        
        Eventos.emit('pf-alterado', {
            valor: estado.pf.atual,
            tipo: delta < 0 ? 'fadiga' : 'descanso',
            diferenca: delta,
            antes: pfAntes
        });
        
        atualizarInterface();
    }

    function modificarPV(delta) {
        estado.pv.modificador += delta;
        estado.pv.modificador = Math.max(-10, Math.min(10, estado.pv.modificador));
        
        // Recalcula máximo
        estado.pv.maximo = estado.st + estado.pv.modificador;
        
        // Ajusta PV atual se necessário
        if (estado.pv.atual > estado.pv.maximo) {
            estado.pv.atual = estado.pv.maximo;
        }
        
        Eventos.emit('pv-modificador-alterado', {
            modificador: estado.pv.modificador,
            maximo: estado.pv.maximo
        });
        
        atualizarInterface();
    }

    function modificarPF(delta) {
        estado.pf.modificador += delta;
        estado.pf.modificador = Math.max(-10, Math.min(10, estado.pf.modificador));
        
        // Recalcula máximo
        estado.pf.maximo = estado.ht + estado.pf.modificador;
        
        // Ajusta PF atual se necessário
        if (estado.pf.atual > estado.pf.maximo) {
            estado.pf.atual = estado.pf.maximo;
        }
        
        Eventos.emit('pf-modificador-alterado', {
            modificador: estado.pf.modificador,
            maximo: estado.pf.maximo
        });
        
        atualizarInterface();
    }

    function resetPV() {
        const pvAntes = estado.pv.atual;
        estado.pv.atual = estado.pv.maximo;
        
        Eventos.emit('pv-reset', {
            antes: pvAntes,
            agora: estado.pv.atual
        });
        
        aplicarEfeitoReset('pv');
        atualizarInterface();
    }

    function resetPF() {
        const pfAntes = estado.pf.atual;
        estado.pf.atual = estado.pf.maximo;
        estado.pf.fadigaAtiva = false;
        
        Eventos.emit('pf-reset', {
            antes: pfAntes,
            agora: estado.pf.atual
        });
        
        aplicarEfeitoReset('pf');
        atualizarInterface();
    }

    function aplicarDanoPorExaustao(dano) {
        if (dano <= 0) return;
        
        const pvAntes = estado.pv.atual;
        const limiteMorte = -5 * estado.st;
        
        estado.pv.atual -= dano;
        estado.pv.atual = Math.max(limiteMorte, estado.pv.atual);
        
        Eventos.emit('dano-exaustao', {
            dano: dano,
            pvAntes: pvAntes,
            pvAgora: estado.pv.atual,
            pfAtual: estado.pf.atual
        });
        
        // Animação especial para dano por exaustão
        aplicarEfeitoExaustao();
    }

    // ========== LÓGICA DE FADIGA (1/3 dos PF) ==========

    function verificarFadiga() {
        const limiteFadiga = Math.ceil(estado.pf.maximo / 3);
        const estavaFadigado = estado.pf.fadigaAtiva;
        const agoraFadigado = estado.pf.atual <= limiteFadiga;
        
        if (agoraFadigado && !estavaFadigado) {
            // Entrou em fadiga
            estado.pf.fadigaAtiva = true;
            Eventos.emit('fadiga-ativada', {
                pfAtual: estado.pf.atual,
                limite: limiteFadiga
            });
            
            // Atualiza condição na lista
            atualizarCondicaoFadigado(true);
            
        } else if (!agoraFadigado && estavaFadigado) {
            // Saiu da fadiga
            estado.pf.fadigaAtiva = false;
            Eventos.emit('fadiga-desativada', {
                pfAtual: estado.pf.atual,
                limite: limiteFadiga
            });
            
            // Atualiza condição na lista
            atualizarCondicaoFadigado(false);
        }
        
        return agoraFadigado;
    }

    // ========== ATUALIZAÇÃO EM TEMPO REAL DOS ATRIBUTOS ==========

    function obterAtributosTempoReal() {
        try {
            // Tenta pegar ST e HT da aba de atributos
            const stElement = document.getElementById('ST');
            const htElement = document.getElementById('HT');
            
            if (stElement && htElement) {
                const novoST = parseInt(stElement.value) || 10;
                const novoHT = parseInt(htElement.value) || 10;
                
                // Verifica se houve mudança
                if (novoST !== estado.cache.stAtual || novoHT !== estado.cache.htAtual) {
                    estado.st = novoST;
                    estado.ht = novoHT;
                    estado.cache.stAtual = novoST;
                    estado.cache.htAtual = novoHT;
                    
                    // Recalcula máximos
                    estado.pv.maximo = estado.st + estado.pv.modificador;
                    estado.pf.maximo = estado.ht + estado.pf.modificador;
                    
                    Eventos.emit('atributos-atualizados', {
                        st: estado.st,
                        ht: estado.ht,
                        pvMaximo: estado.pv.maximo,
                        pfMaximo: estado.pf.maximo
                    });
                    
                    return true;
                }
            }
        } catch (e) {
            if (CONFIG.debug) console.warn('Erro ao ler atributos:', e);
        }
        
        return false;
    }

    // ========== ATUALIZAÇÃO DA INTERFACE ==========

    function atualizarInterface() {
        // 1. Atualiza atributos em tempo real
        obterAtributosTempoReal();
        
        // 2. Verifica fadiga
        verificarFadiga();
        
        // 3. Atualiza PV
        atualizarDisplayPV();
        atualizarBarraPV();
        atualizarEstadoPV();
        
        // 4. Atualiza PF
        atualizarDisplayPF();
        atualizarBarraPF();
        atualizarEstadoPF();
        atualizarMarcadorFadiga();
        
        // 5. Atualiza modificadores
        atualizarModificadores();
    }

    function atualizarDisplayPV() {
        // Base
        const baseEl = document.getElementById('pvBaseDisplay');
        if (baseEl) baseEl.textContent = estado.st;
        
        // Máximo
        const maxEl = document.getElementById('pvMaxDisplay');
        if (maxEl) maxEl.textContent = estado.pv.maximo;
        
        // Atual
        const atualEl = document.getElementById('pvAtualDisplay');
        if (atualEl) atualEl.value = estado.pv.atual;
        
        // Modificador
        const modEl = document.getElementById('pvModificador');
        if (modEl) modEl.value = estado.pv.modificador;
        
        // Texto (10/10)
        const textoEl = document.getElementById('pvTexto');
        if (textoEl) textoEl.textContent = `${estado.pv.atual}/${estado.pv.maximo}`;
    }

    function atualizarBarraPV() {
        const barra = document.getElementById('pvFill');
        if (!barra) return;
        
        const limiteMorte = -5 * estado.st;
        const rangeTotal = estado.st - limiteMorte;
        const posicao = estado.pv.atual - limiteMorte;
        const porcentagem = Math.max(0, Math.min(100, (posicao / rangeTotal) * 100));
        
        barra.style.width = `${porcentagem}%`;
        
        // Cores baseadas no estado
        let cor = '#27ae60'; // Verde - Saudável
        
        if (estado.pv.atual <= 0) cor = '#f1c40f'; // Amarelo - Machucado
        if (estado.pv.atual <= -estado.st) cor = '#e67e22'; // Laranja - Ferido
        if (estado.pv.atual <= -2 * estado.st) cor = '#e74c3c'; // Vermelho - Crítico
        if (estado.pv.atual <= -3 * estado.st) cor = '#8e44ad'; // Roxo - Morrendo
        if (estado.pv.atual <= -4 * estado.st) cor = '#95a5a6'; // Cinza - Inconsciente
        if (estado.pv.atual <= -5 * estado.st) cor = '#7f8c8d'; // Cinza escuro - Morto
        
        barra.style.background = cor;
    }

    function atualizarEstadoPV() {
        const elemento = document.getElementById('pvEstadoDisplay');
        if (!elemento) return;
        
        let estadoTexto = 'Saudável';
        let cor = '#27ae60';
        
        if (estado.pv.atual <= 0) {
            estadoTexto = 'Machucado';
            cor = '#f1c40f';
        }
        if (estado.pv.atual <= -estado.st) {
            estadoTexto = 'Ferido';
            cor = '#e67e22';
        }
        if (estado.pv.atual <= -2 * estado.st) {
            estadoTexto = 'Crítico';
            cor = '#e74c3c';
        }
        if (estado.pv.atual <= -3 * estado.st) {
            estadoTexto = 'Morrendo';
            cor = '#8e44ad';
        }
        if (estado.pv.atual <= -4 * estado.st) {
            estadoTexto = 'Inconsciente';
            cor = '#95a5a6';
        }
        if (estado.pv.atual <= -5 * estado.st) {
            estadoTexto = 'Morto';
            cor = '#7f8c8d';
        }
        
        elemento.textContent = estadoTexto;
        elemento.style.color = cor;
    }

    function atualizarDisplayPF() {
        // Base
        const baseEl = document.getElementById('pfBaseDisplay');
        if (baseEl) baseEl.textContent = estado.ht;
        
        // Máximo
        const maxEl = document.getElementById('pfMaxDisplay');
        if (maxEl) maxEl.textContent = estado.pf.maximo;
        
        // Atual
        const atualEl = document.getElementById('pfAtualDisplay');
        if (atualEl) atualEl.value = estado.pf.atual;
        
        // Modificador
        const modEl = document.getElementById('pfModificador');
        if (modEl) modEl.value = estado.pf.modificador;
        
        // Texto (10/10)
        const textoEl = document.getElementById('pfTexto');
        if (textoEl) textoEl.textContent = `${estado.pf.atual}/${estado.pf.maximo}`;
    }

    function atualizarBarraPF() {
        const barra = document.getElementById('pfFill');
        if (!barra) return;
        
        const limiteExaustao = -estado.ht;
        const rangeTotal = estado.ht - limiteExaustao;
        const posicao = estado.pf.atual - limiteExaustao;
        const porcentagem = Math.max(0, Math.min(100, (posicao / rangeTotal) * 100));
        
        barra.style.width = `${porcentagem}%`;
        
        // Cores baseadas no estado
        let cor = '#3498db'; // Azul - Normal
        
        if (estado.pf.fadigaAtiva) {
            cor = '#f39c12'; // Laranja - Fadigado
        }
        
        if (estado.pf.atual <= 0) {
            cor = '#e74c3c'; // Vermelho - Exausto
        }
        
        barra.style.background = cor;
    }

    function atualizarEstadoPF() {
        const elemento = document.getElementById('pfEstadoDisplay');
        if (!elemento) return;
        
        let estadoTexto = 'Normal';
        let cor = '#3498db';
        
        if (estado.pf.fadigaAtiva) {
            estadoTexto = 'Fadigado';
            cor = '#f39c12';
        }
        
        if (estado.pf.atual <= 0) {
            estadoTexto = 'Exausto';
            cor = '#e74c3c';
        }
        
        if (estado.pf.atual < 0) {
            estadoTexto = 'Perdendo PV!';
            cor = '#8e44ad';
        }
        
        elemento.textContent = estadoTexto;
        elemento.style.color = cor;
    }

    function atualizarMarcadorFadiga() {
        const marcador = document.querySelector('.marcador-fadiga');
        if (!marcador) return;
        
        // Calcula a posição (1/3 dos PF máximos)
        const limiteFadiga = Math.ceil(estado.pf.maximo / 3);
        const porcentagem = (limiteFadiga / estado.pf.maximo) * 100;
        
        marcador.style.left = `${Math.min(100, Math.max(0, porcentagem))}%`;
        
        // Muda a aparência se estiver em fadiga
        if (estado.pf.fadigaAtiva) {
            marcador.style.backgroundColor = '#e74c3c';
            marcador.style.boxShadow = '0 0 8px rgba(231, 76, 60, 0.8)';
        } else {
            marcador.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
            marcador.style.boxShadow = 'none';
        }
    }

    function atualizarModificadores() {
        // Atualiza os inputs de modificadores
        const modPVEl = document.getElementById('pvModificador');
        if (modPVEl) modPVEl.value = estado.pv.modificador;
        
        const modPFEl = document.getElementById('pfModificador');
        if (modPFEl) modPFEl.value = estado.pf.modificador;
    }

    function atualizarCondicaoFadigado(fadigado) {
        const condicaoItem = document.querySelector('[data-condicao="fadigado"]');
        if (!condicaoItem) return;
        
        const checkbox = condicaoItem.querySelector('.condicao-checkbox');
        if (!checkbox) return;
        
        if (fadigado) {
            checkbox.classList.add('checked');
            condicaoItem.classList.add('ativa');
        } else {
            checkbox.classList.remove('checked');
            condicaoItem.classList.remove('ativa');
        }
    }

    // ========== ANIMAÇÕES ==========

    function aplicarEfeitoDano(tipo) {
        const elemento = document.getElementById(tipo === 'pv' ? 'pvFill' : 'pfFill');
        if (!elemento) return;
        
        elemento.classList.remove('dano-recebido');
        void elemento.offsetWidth; // Força reflow
        elemento.classList.add('dano-recebido');
        
        setTimeout(() => {
            elemento.classList.remove('dano-recebido');
        }, CONFIG.animacaoDuração);
    }

    function aplicarEfeitoCura(tipo) {
        const elemento = document.getElementById(tipo === 'pv' ? 'pvFill' : 'pfFill');
        if (!elemento) return;
        
        elemento.classList.remove('cura-recebida');
        void elemento.offsetWidth;
        elemento.classList.add('cura-recebida');
        
        setTimeout(() => {
            elemento.classList.remove('cura-recebida');
        }, CONFIG.animacaoDuração);
    }

    function aplicarEfeitoReset(tipo) {
        const elemento = document.getElementById(tipo === 'pv' ? 'pvFill' : 'pfFill');
        if (!elemento) return;
        
        elemento.classList.remove('reset-aplicado');
        void elemento.offsetWidth;
        elemento.classList.add('reset-aplicado');
        
        setTimeout(() => {
            elemento.classList.remove('reset-aplicado');
        }, CONFIG.animacaoDuração);
    }

    function aplicarEfeitoExaustao() {
        const elemento = document.getElementById('pvFill');
        if (!elemento) return;
        
        elemento.classList.remove('exaustao-dano');
        void elemento.offsetWidth;
        elemento.classList.add('exaustao-dano');
        
        setTimeout(() => {
            elemento.classList.remove('exaustao-dano');
        }, CONFIG.animacaoDuração * 2);
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializar() {
        if (CONFIG.debug) console.log('🚀 Inicializando sistema PV-PF...');
        
        // Configura eventos dos inputs
        const pvInput = document.getElementById('pvAtualDisplay');
        const pfInput = document.getElementById('pfAtualDisplay');
        
        if (pvInput) {
            pvInput.addEventListener('change', window.atualizarPVInput);
            pvInput.addEventListener('blur', window.atualizarPVInput);
        }
        
        if (pfInput) {
            pfInput.addEventListener('change', window.atualizarPFInput);
            pfInput.addEventListener('blur', window.atualizarPFInput);
        }
        
        // Atualização inicial
        atualizarInterface();
        
        // Atualização contínua (se configurado)
        if (CONFIG.atualizacaoAutomatica) {
            setInterval(() => {
                if (obterAtributosTempoReal()) {
                    atualizarInterface();
                }
            }, CONFIG.intervaloAtualizacao);
        }
        
        // Adiciona classes CSS para animações
        adicionarEstilosAnimacoes();
        
        if (CONFIG.debug) console.log('✅ Sistema PV-PF inicializado!');
    }

    function adicionarEstilosAnimacoes() {
        const estilo = document.createElement('style');
        estilo.textContent = `
            .dano-recebido {
                animation: flashVermelho 0.3s ease;
            }
            
            .cura-recebida {
                animation: flashVerde 0.3s ease;
            }
            
            .reset-aplicado {
                animation: pulseDourado 0.5s ease;
            }
            
            .exaustao-dano {
                animation: pulseRoxo 0.8s ease;
            }
            
            @keyframes flashVermelho {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.5); }
            }
            
            @keyframes flashVerde {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3); }
            }
            
            @keyframes pulseDourado {
                0%, 100% { box-shadow: 0 0 0 rgba(212, 175, 55, 0); }
                50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.8); }
            }
            
            @keyframes pulseRoxo {
                0%, 100% { filter: brightness(1); }
                25% { filter: brightness(1.8); }
                50% { filter: brightness(1); }
                75% { filter: brightness(1.5); }
            }
        `;
        document.head.appendChild(estilo);
    }

    // ========== OBSERVADOR DA ABA DE COMBATE ==========

    function observarAbaCombate() {
        const combateTab = document.getElementById('combate');
        if (!combateTab) {
            if (CONFIG.debug) console.log('Aguardando aba de combate...');
            setTimeout(observarAbaCombate, 500);
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && 
                    combateTab.classList.contains('active')) {
                    
                    if (CONFIG.debug) console.log('🎯 Aba Combate ativada');
                    setTimeout(inicializar, 100);
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
        
        // Inicializa imediatamente se já estiver ativa
        if (combateTab.classList.contains('active')) {
            setTimeout(inicializar, 300);
        }
    }

    // ========== INICIALIZAÇÃO GLOBAL ==========

    document.addEventListener('DOMContentLoaded', observarAbaCombate);

    // ========== EXPORTAÇÕES PARA DEBUG ==========

    if (CONFIG.debug) {
        window.sistemaPVPF = {
            estado: () => ({ ...estado }),
            atualizar: atualizarInterface,
            eventos: Eventos,
            config: CONFIG
        };
    }

})();