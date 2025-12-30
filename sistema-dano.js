// sistema-dano.js - VERSÃO CORRIGIDA - Mostra APENAS os danos que a arma realmente possui
(function() {
    'use strict';

    const estado = {
        stAtual: 10,
        danoBase: { gdp: '1d-2', geb: '1d' },
        armasEquipadas: [],
        fadigaAtiva: false,
        sistemaPronto: false
    };

    const tabelaDanoST = {
        1: { gdp: "1d-6", geb: "1d-5" }, 2: { gdp: "1d-6", geb: "1d-5" },
        3: { gdp: "1d-5", geb: "1d-4" }, 4: { gdp: "1d-5", geb: "1d-4" },
        5: { gdp: "1d-4", geb: "1d-3" }, 6: { gdp: "1d-4", geb: "1d-3" },
        7: { gdp: "1d-3", geb: "1d-2" }, 8: { gdp: "1d-3", geb: "1d-2" },
        9: { gdp: "1d-2", geb: "1d-1" }, 10: { gdp: "1d-2", geb: "1d" },
        11: { gdp: "1d-1", geb: "1d+1" }, 12: { gdp: "1d", geb: "1d+2" },
        13: { gdp: "1d", geb: "2d-1" }, 14: { gdp: "1d", geb: "2d" },
        15: { gdp: "1d+1", geb: "2d+1" }, 16: { gdp: "1d+1", geb: "2d+2" },
        17: { gdp: "1d+2", geb: "3d-1" }, 18: { gdp: "1d+2", geb: "3d" },
        19: { gdp: "2d-1", geb: "3d+1" }, 20: { gdp: "2d-1", geb: "3d+2" },
        21: { gdp: "2d", geb: "4d-1" }, 22: { gdp: "2d", geb: "4d" },
        23: { gdp: "2d+1", geb: "4d+1" }, 24: { gdp: "2d+1", geb: "4d+2" },
        25: { gdp: "2d+2", geb: "5d-1" }, 26: { gdp: "2d+2", geb: "5d" },
        27: { gdp: "3d-1", geb: "5d+1" }, 28: { gdp: "3d-1", geb: "5d+1" },
        29: { gdp: "3d", geb: "5d+2" }, 30: { gdp: "3d", geb: "5d+2" }
    };

    // ========== FUNÇÕES AUXILIARES ==========

    function calcularModificadorDano(base, modificador) {
        if (!modificador || modificador.trim() === '') return base.trim();
        
        base = base.trim();
        modificador = modificador.trim();
        
        // Se já for uma fórmula direta (ex: "2d+2"), retorna como está
        if (!modificador.startsWith('GeB') && !modificador.startsWith('GdP') && 
            !modificador.startsWith('geb') && !modificador.startsWith('gdp')) {
            return modificador;
        }
        
        // Extrai o sinal e número do modificador
        const match = modificador.match(/(GeB|GdP|geb|gdp)\s*([+-]\d+)?/i);
        if (!match) return base;
        
        const tipo = match[1].toLowerCase();
        const valorMod = match[2] ? parseInt(match[2]) : 0;
        
        // Pega a base correta
        const baseDados = tipo === 'gdp' ? estado.danoBase.gdp : estado.danoBase.geb;
        
        // Calcula a nova fórmula
        const matchBase = baseDados.match(/(\d+d)([+-]\d+)?/);
        if (matchBase) {
            const dados = matchBase[1];
            const baseMod = matchBase[2] ? parseInt(matchBase[2]) : 0;
            let novoMod = baseMod + valorMod;
            
            if (novoMod === 0) return dados;
            else if (novoMod > 0) return dados + '+' + novoMod;
            else return dados + novoMod;
        }
        
        return baseDados;
    }

    function determinarTipoDanoFormula(formula) {
        // Verifica se a fórmula é GeB ou GdP
        if (formula.toLowerCase().startsWith('geb')) return 'GEB';
        if (formula.toLowerCase().startsWith('gdp')) return 'GDP';
        
        // Para fórmulas diretas, tenta determinar pelo contexto
        if (formula.includes('corte') || formula.includes('perfuração')) return 'GEB';
        return 'GDP'; // Padrão
    }

    // ========== MONITORAMENTO DE ST ==========

    function monitorarST() {
        const stInput = document.getElementById('ST');
        if (!stInput) {
            console.warn('❌ Campo ST não encontrado');
            return;
        }
        
        // Valor inicial
        estado.stAtual = parseInt(stInput.value) || 10;
        
        // Atualiza quando o usuário altera
        stInput.addEventListener('change', () => {
            const novoST = parseInt(stInput.value) || 10;
            if (novoST !== estado.stAtual) {
                estado.stAtual = novoST;
                atualizarDanoBasePorST();
                calcularEAtualizarInterface();
                console.log(`🔧 ST atualizado: ${estado.stAtual}`);
            }
        });
        
        // Monitora alterações via input (tempo real)
        stInput.addEventListener('input', () => {
            setTimeout(() => {
                const novoST = parseInt(stInput.value) || 10;
                if (novoST !== estado.stAtual) {
                    estado.stAtual = novoST;
                    atualizarDanoBasePorST();
                    calcularEAtualizarInterface();
                }
            }, 300);
        });
        
        // Escuta eventos de mudança de atributos
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail?.ST !== undefined) {
                estado.stAtual = e.detail.ST;
                atualizarDanoBasePorST();
                calcularEAtualizarInterface();
            }
        });
        
        // Atualiza inicial
        atualizarDanoBasePorST();
        console.log(`✅ Monitoramento ST iniciado (ST=${estado.stAtual})`);
    }

    function atualizarDanoBasePorST() {
        const stKey = Math.min(Math.max(estado.stAtual, 1), 30);
        const dadosST = tabelaDanoST[stKey];
        
        if (dadosST) {
            estado.danoBase.gdp = dadosST.gdp;
            estado.danoBase.geb = dadosST.geb;
        } else {
            // Fallback
            estado.danoBase.gdp = '1d-2';
            estado.danoBase.geb = '1d';
        }
        
        console.log(`📊 Dano base atualizado: GdP=${estado.danoBase.gdp}, GeB=${estado.danoBase.geb}`);
    }

    // ========== DETECÇÃO DE ARMAS EQUIPADAS ==========

    function obterArmasEquipadas() {
        estado.armasEquipadas = [];
        
        // Verifica se o sistema de equipamentos está disponível
        if (!window.sistemaEquipamentos) {
            console.warn('⚠️ Sistema de equipamentos não disponível');
            return estado.armasEquipadas;
        }
        
        try {
            // Tenta obter armas equipadas do sistema
            const equipamentos = window.sistemaEquipamentos.equipamentosEquipados;
            
            // Armaduras equipadas nas mãos
            if (equipamentos.maos && equipamentos.maos.length > 0) {
                equipamentos.maos.forEach(item => {
                    if (item.tipo === 'arma-cc' || item.tipo === 'arma-dist') {
                        estado.armasEquipadas.push(item);
                    }
                });
            }
            
            // Armaduras no corpo
            if (equipamentos.corpo && equipamentos.corpo.length > 0) {
                equipamentos.corpo.forEach(item => {
                    if ((item.tipo === 'arma-cc' || item.tipo === 'arma-dist') && 
                        !estado.armasEquipadas.some(a => a.idUnico === item.idUnico)) {
                        estado.armasEquipadas.push(item);
                    }
                });
            }
            
            console.log(`🔍 ${estado.armasEquipadas.length} arma(s) equipada(s) encontrada(s)`);
            
        } catch (error) {
            console.error('❌ Erro ao obter armas equipadas:', error);
        }
        
        return estado.armasEquipadas;
    }

    // ========== CÁLCULO DE DANO DAS ARMAS ==========

    function calcularDanoArma(arma) {
        if (!arma) return [];
        
        const resultados = [];
        
        // Processa dano principal (GEB) - SE EXISTIR
        if (arma.dano && arma.tipoDano) {
            const danoCalculado = calcularModificadorDano(arma.dano, arma.dano);
            const tipoDano = determinarTipoDanoFormula(arma.dano);
            
            resultados.push({
                tipo: tipoDano, // 'GEB' ou 'GDP'
                formula: danoCalculado,
                danoTipo: arma.tipoDano,
                armaNome: arma.nome,
                fonte: 'principal'
            });
        }
        
        // Processa dano GDP SEPARADO - SE EXISTIR
        if (arma.danoGDP && arma.tipoDanoGDP) {
            const danoCalculado = calcularModificadorDano(arma.danoGDP, arma.danoGDP);
            
            resultados.push({
                tipo: 'GDP',
                formula: danoCalculado,
                danoTipo: arma.tipoDanoGDP,
                armaNome: arma.nome,
                fonte: 'gdp'
            });
        }
        
        // Verifica duplicados (remover se houver tipo duplicado)
        const tiposUnicos = new Set();
        const resultadosFiltrados = [];
        
        resultados.forEach(resultado => {
            if (!tiposUnicos.has(resultado.tipo)) {
                tiposUnicos.add(resultado.tipo);
                resultadosFiltrados.push(resultado);
            }
        });
        
        console.log(`🎯 Arma "${arma.nome}": ${resultadosFiltrados.length} tipo(s) de dano (${resultadosFiltrados.map(r => r.tipo).join(', ')})`);
        
        return resultadosFiltrados;
    }

    // ========== ATUALIZAÇÃO DA INTERFACE ==========

    function atualizarDanoBaseDisplay() {
        const gdpDisplay = document.getElementById('danoGdp');
        const gebDisplay = document.getElementById('danoGeb');
        
        if (gdpDisplay) {
            gdpDisplay.textContent = estado.danoBase.gdp;
            gdpDisplay.classList.add('updated');
            setTimeout(() => gdpDisplay.classList.remove('updated'), 500);
        }
        
        if (gebDisplay) {
            gebDisplay.textContent = estado.danoBase.geb;
            gebDisplay.classList.add('updated');
            setTimeout(() => gebDisplay.classList.remove('updated'), 500);
        }
    }

    function atualizarDanoArmaDisplay() {
        const armaDanoContainer = document.getElementById('armaDano');
        const semArmaDiv = document.getElementById('semArma');
        const comArmaDiv = document.getElementById('comArma');
        
        if (!armaDanoContainer || !semArmaDiv || !comArmaDiv) {
            console.error('❌ Elementos da interface não encontrados');
            return;
        }
        
        const armas = obterArmasEquipadas();
        
        if (armas.length === 0) {
            // Modo sem arma - mostra dano corporal
            semArmaDiv.style.display = 'flex';
            comArmaDiv.style.display = 'none';
            
            // Atualiza o dano corporal base
            const danoCorporal = document.querySelector('.sem-arma .arma-mensagem');
            if (danoCorporal) {
                danoCorporal.textContent = `Dano corporal: GdP ${estado.danoBase.gdp} / GeB ${estado.danoBase.geb}`;
            }
            
        } else {
            // Modo com arma
            semArmaDiv.style.display = 'none';
            comArmaDiv.style.display = 'block';
            
            // Limpa o container
            armaDanoContainer.innerHTML = '';
            
            // Cria container principal
            const containerPrincipal = document.createElement('div');
            containerPrincipal.className = 'armas-equipadas-container';
            containerPrincipal.style.cssText = `
                width: 100%;
                display: flex;
                flex-direction: column;
                gap: 15px;
            `;
            
            // Para cada arma equipada
            armas.forEach((arma, index) => {
                const danosCalculados = calcularDanoArma(arma);
                
                if (!danosCalculados || danosCalculados.length === 0) {
                    console.warn(`⚠️ Não foi possível calcular dano para ${arma.nome}`);
                    return;
                }
                
                // Container da arma
                const containerArma = document.createElement('div');
                containerArma.className = 'arma-equipada-item';
                containerArma.style.cssText = `
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    border: 2px solid ${index === 0 ? '#FFD700' : '#4ECDC4'};
                    padding: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                `;
                
                // Cabeçalho da arma
                const cabecalho = document.createElement('div');
                cabecalho.style.cssText = `
                    font-size: 1.1em;
                    font-weight: bold;
                    color: ${index === 0 ? '#FFD700' : '#4ECDC4'};
                    margin-bottom: 10px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                `;
                
                const iconeArma = document.createElement('i');
                iconeArma.className = arma.tipo === 'arma-dist' ? 'fas fa-crosshairs' : 'fas fa-gavel';
                
                const nomeArma = document.createElement('span');
                nomeArma.textContent = arma.nome;
                
                cabecalho.appendChild(iconeArma);
                cabecalho.appendChild(nomeArma);
                
                // Container dos danos
                const containerDanos = document.createElement('div');
                containerDanos.style.cssText = `
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                `;
                
                // Para cada tipo de dano da arma
                danosCalculados.forEach(dano => {
                    const linhaDano = document.createElement('div');
                    linhaDano.style.cssText = `
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        background: rgba(255, 255, 255, 0.05);
                        border-radius: 6px;
                        padding: 8px 12px;
                    `;
                    
                    // Tipo (GEB/GDP)
                    const tipoSpan = document.createElement('span');
                    tipoSpan.style.cssText = `
                        font-weight: bold;
                        color: ${dano.tipo === 'GEB' ? '#FF6B6B' : '#4ECDC4'};
                        min-width: 50px;
                        font-size: 0.9em;
                    `;
                    tipoSpan.textContent = dano.tipo;
                    
                    // Fórmula do dano
                    const formulaSpan = document.createElement('span');
                    formulaSpan.style.cssText = `
                        font-family: 'Courier New', monospace;
                        font-weight: bold;
                        color: #FFFFFF;
                        font-size: 1.1em;
                        flex-grow: 1;
                        text-align: center;
                    `;
                    formulaSpan.textContent = dano.formula;
                    
                    // Tipo de dano (corte, perfuração, etc.)
                    const tipoDanoSpan = document.createElement('span');
                    tipoDanoSpan.style.cssText = `
                        color: #AAAAAA;
                        font-size: 0.85em;
                        font-style: italic;
                        min-width: 80px;
                        text-align: right;
                    `;
                    tipoDanoSpan.textContent = dano.danoTipo;
                    
                    linhaDano.appendChild(tipoSpan);
                    linhaDano.appendChild(formulaSpan);
                    linhaDano.appendChild(tipoDanoSpan);
                    containerDanos.appendChild(linhaDano);
                });
                
                // Adiciona informações adicionais se for arma à distância
                if (arma.tipo === 'arma-dist') {
                    if (arma.alcance) {
                        const infoAlcance = document.createElement('div');
                        infoAlcance.style.cssText = `
                            font-size: 0.85em;
                            color: #88C0D0;
                            margin-top: 6px;
                            padding: 4px 8px;
                            background: rgba(136, 192, 208, 0.1);
                            border-radius: 4px;
                        `;
                        infoAlcance.innerHTML = `<i class="fas fa-ruler"></i> Alcance: ${arma.alcance}`;
                        containerDanos.appendChild(infoAlcance);
                    }
                    
                    if (arma.cdt) {
                        const infoCDT = document.createElement('div');
                        infoCDT.style.cssText = `
                            font-size: 0.85em;
                            color: #EBCB8B;
                            margin-top: 4px;
                            padding: 4px 8px;
                            background: rgba(235, 203, 139, 0.1);
                            border-radius: 4px;
                        `;
                        infoCDT.innerHTML = `<i class="fas fa-bolt"></i> CDT: ${arma.cdt}`;
                        containerDanos.appendChild(infoCDT);
                    }
                }
                
                // Informação de mãos necessárias
                if (arma.maos) {
                    const infoMaos = document.createElement('div');
                    infoMaos.style.cssText = `
                        font-size: 0.85em;
                        color: #A3BE8C;
                        margin-top: 4px;
                        padding: 4px 8px;
                        background: rgba(163, 190, 140, 0.1);
                        border-radius: 4px;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    `;
                    
                    const textoMaos = arma.maos === 1 ? '1 mão' : 
                                     arma.maos === 1.5 ? '1 ou 2 mãos' : 
                                     arma.maos === 2 ? '2 mãos' : `${arma.maos} mãos`;
                    
                    infoMaos.innerHTML = `<i class="fas fa-hand-paper"></i> ${textoMaos}`;
                    containerDanos.appendChild(infoMaos);
                }
                
                containerArma.appendChild(cabecalho);
                containerArma.appendChild(containerDanos);
                containerPrincipal.appendChild(containerArma);
            });
            
            armaDanoContainer.appendChild(containerPrincipal);
            
            // Ajusta altura do container
            const containerPai = comArmaDiv.closest('.arma-info');
            if (containerPai) {
                const alturaBase = 160;
                const alturaPorArma = 100;
                containerPai.style.minHeight = `${alturaBase + (armas.length - 1) * alturaPorArma}px`;
            }
            
            console.log(`🎯 ${armas.length} arma(s) exibida(s) no card de dano`);
        }
    }

    function calcularEAtualizarInterface() {
        atualizarDanoBaseDisplay();
        atualizarDanoArmaDisplay();
        
        // Dispara evento para outros sistemas
        const evento = new CustomEvent('danoAtualizado', {
            detail: {
                st: estado.stAtual,
                danoBase: estado.danoBase,
                armasEquipadas: estado.armasEquipadas.length
            }
        });
        document.dispatchEvent(evento);
    }

    // ========== MONITORAMENTO DE MUDANÇAS ==========

    function configurarObservadores() {
        // Observa mudanças no sistema de equipamentos
        document.addEventListener('equipamentosAtualizados', () => {
            console.log('🔄 Equipamentos atualizados - recalculando dano');
            setTimeout(calcularEAtualizarInterface, 100);
        });
        
        // Observa mudanças na lista de equipamentos adquiridos
        const listaEquipamentos = document.getElementById('lista-equipamentos-adquiridos');
        if (listaEquipamentos) {
            const observer = new MutationObserver(() => {
                setTimeout(calcularEAtualizarInterface, 200);
            });
            observer.observe(listaEquipamentos, { 
                childList: true, 
                subtree: true 
            });
        }
        
        // Monitora fadiga se existir
        const elementoPF = document.getElementById('pfEstadoDisplay');
        if (elementoPF) {
            const fadigaObserver = new MutationObserver(() => {
                const texto = elementoPF.textContent;
                estado.fadigaAtiva = texto === 'Fadigado' || texto === 'Exausto';
                if (estado.fadigaAtiva) {
                    console.log('⚠️ Personagem fadigado - ajustando dano');
                    // Aqui você pode adicionar penalidades de fadiga se necessário
                }
            });
            fadigaObserver.observe(elementoPF, { 
                childList: true, 
                characterData: true, 
                subtree: true 
            });
        }
    }

    // ========== INICIALIZAÇÃO ==========

    function inicializarSistema() {
        console.log('🎯 Inicializando sistema de dano...');
        
        // Aguarda um pouco para garantir que outros sistemas carreguem
        setTimeout(() => {
            monitorarST();
            configurarObservadores();
            calcularEAtualizarInterface();
            
            estado.sistemaPronto = true;
            
            console.log('✅ Sistema de dano inicializado com sucesso!');
        }, 500);
    }

    function observarAbaCombate() {
        const combateTab = document.getElementById('combate');
        if (!combateTab) {
            console.error('❌ Aba de combate não encontrada');
            return;
        }
        
        // Observa quando a aba fica ativa
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class' && combateTab.classList.contains('active')) {
                    console.log('⚔️ Aba de combate ativada');
                    setTimeout(inicializarSistema, 300);
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
        
        // Inicializa imediatamente se já estiver ativa
        if (combateTab.classList.contains('active')) {
            console.log('⚔️ Aba de combate já está ativa');
            setTimeout(inicializarSistema, 500);
        }
    }

    // ========== INICIALIZAÇÃO GLOBAL ==========

    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM carregado - preparando sistema de dano');
        observarAbaCombate();
    });

    // ========== API PÚBLICA ==========

    window.sistemaDano = {
        getEstado: () => ({ ...estado }),
        getDanoBase: () => ({ ...estado.danoBase }),
        getArmasEquipadas: () => [...estado.armasEquipadas],
        atualizarManual: calcularEAtualizarInterface,
        
        // Função para calcular dano de uma arma específica
        calcularDanoParaArma: (arma) => {
            return calcularDanoArma(arma);
        },
        
        // Função para forçar atualização de ST
        atualizarST: (novoST) => {
            estado.stAtual = novoST;
            atualizarDanoBasePorST();
            calcularEAtualizarInterface();
        }
    };

    console.log('🔧 sistema-dano.js carregado e pronto');

})();