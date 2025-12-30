// ===========================================
// pv-pf.js - VERSÃO COMPLETA E CORRIGIDA
// Compatível com seu HTML
// ===========================================

(function() {
    'use strict';

    // ========== CONFIGURAÇÃO ==========
    const CONFIG = {
        debug: true,
        atualizacaoAutomatica: true,
        intervaloAtualizacao: 1000,
        animacaoDuração: 300
    };

    // ========== ESTADO ==========
    let estado = {
        // Atributos base
        st: 10,
        ht: 10,
        
        // PV
        pv: {
            atual: 10,
            maximo: 10,
            modificador: 0,
            modificadores: []
        },
        
        // PF
        pf: {
            atual: 10,
            maximo: 10,
            modificador: 0,
            fadigaAtiva: false,
            modificadores: []
        },
        
        // Cache
        cache: {
            stAtual: 10,
            htAtual: 10
        }
    };

    // ========== FUNÇÕES PÚBLICAS (HTML) ==========

    // PV - Controles rápidos
    window.danoPV = (valor = 1) => alterarPV(-valor);
    window.curaPV = (valor = 1) => alterarPV(valor);
    
    // Botões específicos
    window.danoPV5 = () => alterarPV(-5);
    window.danoPV2 = () => alterarPV(-2);
    window.danoPV1 = () => alterarPV(-1);
    window.curaPV5 = () => alterarPV(5);
    window.curaPV2 = () => alterarPV(2);
    window.curaPV1 = () => alterarPV(1);
    
    // Modificadores e reset
    window.modificarPV = (delta) => modificarPV(delta);
    window.resetPV = () => resetPV();
    window.atualizarPVManual = () => atualizarPVManual();

    // PF - Controles rápidos
    window.fadigaPF = (valor = 1) => alterarPF(-valor);
    window.descansoPF = (valor = 1) => alterarPF(valor);
    
    // Botões específicos
    window.fadigaPF3 = () => alterarPF(-3);
    window.fadigaPF1 = () => alterarPF(-1);
    window.descansoPF3 = () => alterarPF(3);
    window.descansoPF1 = () => alterarPF(1);
    
    // Modificadores e reset
    window.modificarPF = (delta) => modificarPF(delta);
    window.resetPF = () => resetPF();
    window.atualizarPFManual = () => atualizarPFManual();

    // ========== FUNÇÕES PRINCIPAIS ==========

    function alterarPV(delta) {
        if (CONFIG.debug) console.log(`📉 PV: ${delta > 0 ? '+' : ''}${delta}`);
        
        const pvAntes = estado.pv.atual;
        const limiteMorte = -5 * estado.st;
        
        estado.pv.atual += delta;
        estado.pv.atual = Math.max(limiteMorte, Math.min(estado.pv.maximo, estado.pv.atual));
        
        // Animação
        if (delta < 0) {
            aplicarEfeito('pvFill', 'dano-recebido');
        } else if (delta > 0) {
            aplicarEfeito('pvFill', 'cura-recebida');
        }
        
        atualizarInterface();
        
        if (CONFIG.debug) {
            console.log(`PV: ${pvAntes} → ${estado.pv.atual} (max: ${estado.pv.maximo})`);
        }
    }

    function alterarPF(delta) {
        if (CONFIG.debug) console.log(`💨 PF: ${delta > 0 ? '+' : ''}${delta}`);
        
        const pfAntes = estado.pf.atual;
        const limiteExaustao = -estado.ht;
        
        estado.pf.atual += delta;
        estado.pf.atual = Math.max(limiteExaustao, Math.min(estado.pf.maximo, estado.pf.atual));
        
        // Verifica dano por exaustão
        if (estado.pf.atual <= 0 && pfAntes > 0) {
            aplicarDanoPorExaustao(Math.abs(estado.pf.atual));
        }
        
        // Animação
        if (delta < 0) {
            aplicarEfeito('pfFill', 'dano-recebido');
        } else if (delta > 0) {
            aplicarEfeito('pfFill', 'cura-recebida');
        }
        
        atualizarInterface();
        
        if (CONFIG.debug) {
            console.log(`PF: ${pfAntes} → ${estado.pf.atual} (max: ${estado.pf.maximo})`);
        }
    }

    function modificarPV(delta) {
        estado.pv.modificador += delta;
        estado.pv.modificador = Math.max(-10, Math.min(10, estado.pv.modificador));
        
        estado.pv.maximo = estado.st + estado.pv.modificador;
        
        if (estado.pv.atual > estado.pv.maximo) {
            estado.pv.atual = estado.pv.maximo;
        }
        
        if (CONFIG.debug) {
            console.log(`🔧 Modificador PV: ${estado.pv.modificador} (max: ${estado.pv.maximo})`);
        }
        
        atualizarInterface();
    }

    function modificarPF(delta) {
        estado.pf.modificador += delta;
        estado.pf.modificador = Math.max(-10, Math.min(10, estado.pf.modificador));
        
        estado.pf.maximo = estado.ht + estado.pf.modificador;
        
        if (estado.pf.atual > estado.pf.maximo) {
            estado.pf.atual = estado.pf.maximo;
        }
        
        if (CONFIG.debug) {
            console.log(`🔧 Modificador PF: ${estado.pf.modificador} (max: ${estado.pf.maximo})`);
        }
        
        atualizarInterface();
    }

    function resetPV() {
        if (CONFIG.debug) console.log('🔄 Resetando PV');
        
        const pvAntes = estado.pv.atual;
        estado.pv.atual = estado.pv.maximo;
        
        aplicarEfeito('pvFill', 'reset-aplicado');
        atualizarInterface();
        
        if (CONFIG.debug) {
            console.log(`PV resetado: ${pvAntes} → ${estado.pv.atual}`);
        }
    }

    function resetPF() {
        if (CONFIG.debug) console.log('🔄 Resetando PF');
        
        const pfAntes = estado.pf.atual;
        estado.pf.atual = estado.pf.maximo;
        estado.pf.fadigaAtiva = false;
        
        aplicarEfeito('pfFill', 'reset-aplicado');
        atualizarInterface();
        
        if (CONFIG.debug) {
            console.log(`PF resetado: ${pfAntes} → ${estado.pf.atual}`);
        }
    }

    function atualizarPVManual() {
        const input = document.getElementById('pvAtual');
        if (!input) {
            console.error('❌ Elemento #pvAtual não encontrado!');
            return;
        }
        
        const valor = parseInt(input.value);
        if (isNaN(valor)) {
            input.value = estado.pv.atual;
            return;
        }
        
        const limiteMorte = -5 * estado.st;
        const novoValor = Math.max(limiteMorte, Math.min(estado.pv.maximo, valor));
        
        estado.pv.atual = novoValor;
        input.value = novoValor;
        
        atualizarInterface();
        
        if (CONFIG.debug) {
            console.log(`📝 PV manual: ${novoValor}`);
        }
    }

    function atualizarPFManual() {
        const input = document.getElementById('pfAtual');
        if (!input) {
            console.error('❌ Elemento #pfAtual não encontrado!');
            return;
        }
        
        const valor = parseInt(input.value);
        if (isNaN(valor)) {
            input.value = estado.pf.atual;
            return;
        }
        
        const limiteExaustao = -estado.ht;
        const novoValor = Math.max(limiteExaustao, Math.min(estado.pf.maximo, valor));
        
        const pfAntes = estado.pf.atual;
        estado.pf.atual = novoValor;
        input.value = novoValor;
        
        // Verifica dano por exaustão
        if (estado.pf.atual <= 0 && pfAntes > 0) {
            aplicarDanoPorExaustao(Math.abs(estado.pf.atual));
        }
        
        atualizarInterface();
        
        if (CONFIG.debug) {
            console.log(`📝 PF manual: ${novoValor}`);
        }
    }

    function aplicarDanoPorExaustao(dano) {
        if (dano <= 0) return;
        
        const pvAntes = estado.pv.atual;
        const limiteMorte = -5 * estado.st;
        
        estado.pv.atual -= dano;
        estado.pv.atual = Math.max(limiteMorte, estado.pv.atual);
        
        if (CONFIG.debug) {
            console.log(`🔥 Dano por exaustão: ${dano} PV (${pvAntes} → ${estado.pv.atual})`);
        }
        
        aplicarEfeito('pvFill', 'exaustao-dano');
    }

    // ========== LÓGICA DE FADIGA ==========

    function verificarFadiga() {
        const limiteFadiga = Math.ceil(estado.pf.maximo / 3);
        const estavaFadigado = estado.pf.fadigaAtiva;
        const agoraFadigado = estado.pf.atual <= limiteFadiga;
        
        if (agoraFadigado && !estavaFadigado) {
            // Entrou em fadiga
            estado.pf.fadigaAtiva = true;
            
            if (CONFIG.debug) {
                console.log(`⚠️ FADIGA ATIVADA! PF (${estado.pf.atual}) ≤ ${limiteFadiga} (1/3 do máximo)`);
            }
            
            atualizarCondicaoFadigado(true);
            
        } else if (!agoraFadigado && estavaFadigado) {
            // Saiu da fadiga
            estado.pf.fadigaAtiva = false;
            
            if (CONFIG.debug) {
                console.log(`✅ Fadiga removida. PF (${estado.pf.atual}) > ${limiteFadiga}`);
            }
            
            atualizarCondicaoFadigado(false);
        }
        
        return agoraFadigado;
    }

    // ========== ATUALIZAÇÃO DE ATRIBUTOS EM TEMPO REAL ==========

    function obterAtributosTempoReal() {
        try {
            const stElement = document.getElementById('ST');
            const htElement = document.getElementById('HT');
            
            if (stElement && htElement) {
                const novoST = parseInt(stElement.value) || 10;
                const novoHT = parseInt(htElement.value) || 10;
                
                if (novoST !== estado.cache.stAtual || novoHT !== estado.cache.htAtual) {
                    estado.st = novoST;
                    estado.ht = novoHT;
                    estado.cache.stAtual = novoST;
                    estado.cache.htAtual = novoHT;
                    
                    // Recalcula máximos
                    estado.pv.maximo = estado.st + estado.pv.modificador;
                    estado.pf.maximo = estado.ht + estado.pf.modificador;
                    
                    if (CONFIG.debug) {
                        console.log(`📊 Atributos atualizados: ST=${estado.st}, HT=${estado.ht}`);
                    }
                    
                    return true;
                }
            }
        } catch (e) {
            if (CONFIG.debug) console.warn('⚠️ Erro ao ler atributos:', e);
        }
        
        return false;
    }

    // ========== ATUALIZAÇÃO DA INTERFACE ==========

    function atualizarInterface() {
        if (CONFIG.debug) console.log('🔄 Atualizando interface...');
        
        // 1. Pega ST/HT atualizados
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
        const baseEl = document.getElementById('pvBase');
        if (baseEl) baseEl.textContent = estado.st;
        
        // Máximo
        const maxEl = document.getElementById('pvMax');
        if (maxEl) maxEl.textContent = estado.pv.maximo;
        
        // Atual
        const atualEl = document.getElementById('pvAtual');
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
        if (!barra) {
            console.error('❌ Elemento #pvFill não encontrado!');
            return;
        }
        
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
        
        if (CONFIG.debug) {
            console.log(`📊 Barra PV: ${porcentagem.toFixed(1)}% (${estado.pv.atual}/${estado.pv.maximo})`);
        }
    }

    function atualizarEstadoPV() {
        const elemento = document.getElementById('pvEstado');
        if (!elemento) {
            console.error('❌ Elemento #pvEstado não encontrado!');
            return;
        }
        
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
        
        if (CONFIG.debug) {
            console.log(`🏥 Estado PV: ${estadoTexto}`);
        }
    }

    function atualizarDisplayPF() {
        // Base
        const baseEl = document.getElementById('pfBase');
        if (baseEl) baseEl.textContent = estado.ht;
        
        // Máximo
        const maxEl = document.getElementById('pfMax');
        if (maxEl) maxEl.textContent = estado.pf.maximo;
        
        // Atual
        const atualEl = document.getElementById('pfAtual');
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
        if (!barra) {
            console.error('❌ Elemento #pfFill não encontrado!');
            return;
        }
        
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
        
        if (CONFIG.debug) {
            console.log(`📊 Barra PF: ${porcentagem.toFixed(1)}% (${estado.pf.atual}/${estado.pf.maximo})`);
        }
    }

    function atualizarEstadoPF() {
        const elemento = document.getElementById('pfEstado');
        if (!elemento) {
            console.error('❌ Elemento #pfEstado não encontrado!');
            return;
        }
        
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
        
        if (CONFIG.debug) {
            console.log(`💨 Estado PF: ${estadoTexto}`);
        }
    }

    function atualizarMarcadorFadiga() {
        const marcador = document.querySelector('.fatigue-marker');
        if (!marcador) {
            console.error('❌ Elemento .fatigue-marker não encontrado!');
            return;
        }
        
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
        
        if (CONFIG.debug) {
            console.log(`📍 Marcador fadiga: ${porcentagem.toFixed(1)}% (PF ≤ ${limiteFadiga})`);
        }
    }

    function atualizarModificadores() {
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
        
        if (CONFIG.debug) {
            console.log(`📋 Condição "Fadigado": ${fadigado ? 'ATIVA' : 'INATIVA'}`);
        }
    }

    // ========== ANIMAÇÕES ==========

    function aplicarEfeito(elementoId, classe) {
        const elemento = document.getElementById(elementoId);
        if (!elemento) {
            console.error(`❌ Elemento #${elementoId} não encontrado para animação!`);
            return;
        }
        
        elemento.classList.remove(classe);
        void elemento.offsetWidth; // Força reflow
        elemento.classList.add(classe);
        
        setTimeout(() => {
            elemento.classList.remove(classe);
        }, CONFIG.animacaoDuração);
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializar() {
        if (CONFIG.debug) console.log('🚀 Inicializando sistema PV-PF...');
        
        // Verifica elementos críticos
        const elementosCriticos = ['pvAtual', 'pfAtual', 'pvFill', 'pfFill'];
        let elementosOk = true;
        
        elementosCriticos.forEach(id => {
            const el = document.getElementById(id);
            if (!el) {
                console.error(`❌ Elemento crítico #${id} não encontrado!`);
                elementosOk = false;
            }
        });
        
        if (!elementosOk) {
            console.error('❌ Sistema PV-PF não pode ser inicializado!');
            return;
        }
        
        // Configura eventos dos inputs
        const pvInput = document.getElementById('pvAtual');
        const pfInput = document.getElementById('pfAtual');
        
        if (pvInput) {
            pvInput.addEventListener('change', window.atualizarPVManual);
            pvInput.addEventListener('blur', window.atualizarPVManual);
        }
        
        if (pfInput) {
            pfInput.addEventListener('change', window.atualizarPFManual);
            pfInput.addEventListener('blur', window.atualizarPFManual);
        }
        
        // Atualização inicial
        atualizarInterface();
        
        // Atualização contínua
        if (CONFIG.atualizacaoAutomatica) {
            setInterval(() => {
                if (obterAtributosTempoReal()) {
                    atualizarInterface();
                }
            }, CONFIG.intervaloAtualizacao);
        }
        
        // Adiciona estilos CSS para animações
        adicionarEstilosAnimacoes();
        
        // Teste rápido
        if (CONFIG.debug) {
            console.log('✅ Sistema PV-PF inicializado com sucesso!');
            console.log('🎯 Teste os botões: danoPV(1), curaPV(1), fadigaPF(1), descansoPF(1)');
            
            // Exibe estado inicial no console
            console.log('📊 Estado inicial:', {
                ST: estado.st,
                HT: estado.ht,
                PV: estado.pv.atual + '/' + estado.pv.maximo,
                PF: estado.pf.atual + '/' + estado.pf.maximo,
                Fadiga: estado.pf.fadigaAtiva
            });
        }
    }

    function adicionarEstilosAnimacoes() {
        if (document.getElementById('estilos-pv-pf')) return;
        
        const estilo = document.createElement('style');
        estilo.id = 'estilos-pv-pf';
        estilo.textContent = `
            .dano-recebido {
                animation: flashVermelhoPV 0.3s ease;
            }
            
            .cura-recebida {
                animation: flashVerdePV 0.3s ease;
            }
            
            .reset-aplicado {
                animation: pulseDouradoPV 0.5s ease;
            }
            
            .exaustao-dano {
                animation: pulseRoxoPV 0.8s ease;
            }
            
            @keyframes flashVermelhoPV {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.5); }
            }
            
            @keyframes flashVerdePV {
                0%, 100% { filter: brightness(1); }
                50% { filter: brightness(1.3); }
            }
            
            @keyframes pulseDouradoPV {
                0%, 100% { box-shadow: 0 0 0 rgba(212, 175, 55, 0); }
                50% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.8); }
            }
            
            @keyframes pulseRoxoPV {
                0%, 100% { filter: brightness(1); }
                25% { filter: brightness(1.8); }
                50% { filter: brightness(1); }
                75% { filter: brightness(1.5); }
            }
        `;
        
        document.head.appendChild(estilo);
    }

    // ========== OBSERVADOR DA ABA COMBATE ==========

    function observarAbaCombate() {
        const combateTab = document.getElementById('combate');
        if (!combateTab) {
            if (CONFIG.debug) console.log('⏳ Aguardando aba de combate...');
            setTimeout(observarAbaCombate, 500);
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && combateTab.classList.contains('active')) {
                    if (CONFIG.debug) console.log('🎯 Aba Combate ativada');
                    setTimeout(inicializar, 100);
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
        
        // Inicializa se já estiver ativa
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
            testar: {
                danoPV: (valor) => alterarPV(-valor),
                curaPV: (valor) => alterarPV(valor),
                fadigaPF: (valor) => alterarPF(-valor),
                descansoPF: (valor) => alterarPF(valor)
            }
        };
        
        console.log('🔧 Sistema PV-PF carregado. Use window.sistemaPVPF para debug.');
    }

})();