// ============================================
// SISTEMA DE PERÍCIAS - VERSÃO COMPLETA E CORRIGIDA
// ============================================

// Estado do sistema
let estadoPericias = {
    pontosPericias: 0,
    pontosCombate: 0,
    totalPericias: 0,
    totalCombate: 0,
    totalDX: 0,
    totalIQ: 0,
    totalHT: 0,
    totalPERC: 0,
    pontosDX: 0,
    pontosIQ: 0,
    pontosHT: 0,
    pontosPERC: 0,
    periciasAprendidas: [],
    filtroAtivo: 'todas',
    buscaAtiva: '',
    subAbaAtiva: 'pericias',
    atributos: {
        DX: 10,
        IQ: 10,
        HT: 10,
        PERC: 10
    },
    modalPericiaAtiva: null,
    modalEspecializacaoAtiva: null,
    especializacaoSelecionada: null,
    nivelPericia: 0,
    periciaEditando: null
};

// ===== TABELA DE CUSTOS REAL DO GURPS =====
const TABELA_CUSTO_PERICIAS = {
    'Fácil': [
        { nivel: -1, custo: 0 },  // Não aprendido (default DX-4)
        { nivel: 0, custo: 1 },   // 1 ponto = Atributo+0
        { nivel: 1, custo: 2 },   // 2 pontos = Atributo+1
        { nivel: 2, custo: 4 },   // 4 pontos = Atributo+2
        { nivel: 3, custo: 8 },   // 8 pontos = Atributo+3
        { nivel: 4, custo: 12 },  // 12 pontos = Atributo+4
        { nivel: 5, custo: 16 },
        { nivel: 6, custo: 20 },
        { nivel: 7, custo: 24 },
        { nivel: 8, custo: 28 },
        { nivel: 9, custo: 32 },
        { nivel: 10, custo: 36 }
    ],
    'Média': [
        { nivel: -1, custo: 1 },  // 1 ponto = Atributo-1
        { nivel: 0, custo: 2 },   // 2 pontos = Atributo+0
        { nivel: 1, custo: 4 },   // 4 pontos = Atributo+1
        { nivel: 2, custo: 8 },   // 8 pontos = Atributo+2
        { nivel: 3, custo: 12 },  // 12 pontos = Atributo+3
        { nivel: 4, custo: 16 },  // 16 pontos = Atributo+4
        { nivel: 5, custo: 20 },
        { nivel: 6, custo: 24 },
        { nivel: 7, custo: 28 },
        { nivel: 8, custo: 32 },
        { nivel: 9, custo: 36 },
        { nivel: 10, custo: 40 }
    ],
    'Difícil': [
        { nivel: -2, custo: 1 },  // 1 ponto = Atributo-2
        { nivel: -1, custo: 2 },  // 2 pontos = Atributo-1
        { nivel: 0, custo: 4 },   // 4 pontos = Atributo+0
        { nivel: 1, custo: 8 },   // 8 pontos = Atributo+1
        { nivel: 2, custo: 12 },  // 12 pontos = Atributo+2
        { nivel: 3, custo: 16 },  // 16 pontos = Atributo+3
        { nivel: 4, custo: 20 },  // 20 pontos = Atributo+4
        { nivel: 5, custo: 24 },
        { nivel: 6, custo: 28 },
        { nivel: 7, custo: 32 },
        { nivel: 8, custo: 36 },
        { nivel: 9, custo: 40 },
        { nivel: 10, custo: 44 }
    ],
    'Muito Difícil': [
        { nivel: -3, custo: 1 },  // 1 ponto = Atributo-3
        { nivel: -2, custo: 2 },  // 2 pontos = Atributo-2
        { nivel: -1, custo: 4 },  // 4 pontos = Atributo-1
        { nivel: 0, custo: 8 },   // 8 pontos = Atributo+0
        { nivel: 1, custo: 12 },  // 12 pontos = Atributo+1
        { nivel: 2, custo: 16 },  // 16 pontos = Atributo+2
        { nivel: 3, custo: 20 },  // 20 pontos = Atributo+3
        { nivel: 4, custo: 24 },  // 24 pontos = Atributo+4
        { nivel: 5, custo: 28 },
        { nivel: 6, custo: 32 },
        { nivel: 7, custo: 36 },
        { nivel: 8, custo: 40 },
        { nivel: 9, custo: 44 },
        { nivel: 10, custo: 48 }
    ]
};

// ===== FUNÇÕES DE CÁLCULO CORRETAS =====
function obterTabelaCusto(dificuldade) {
    return TABELA_CUSTO_PERICIAS[dificuldade] || TABELA_CUSTO_PERICIAS['Média'];
}

function calcularCustoParaNivel(dificuldade, nivel) {
    const tabela = obterTabelaCusto(dificuldade);
    const entrada = tabela.find(item => item.nivel === nivel);
    return entrada ? entrada.custo : 0;
}

function calcularCustoBase(dificuldade) {
    // Retorna o custo do nível 0 (ou nível mais baixo positivo)
    const tabela = obterTabelaCusto(dificuldade);
    const entradaZero = tabela.find(item => item.nivel === 0);
    return entradaZero ? entradaZero.custo : 2;
}

function obterNiveisDisponiveis(dificuldade) {
    const tabela = obterTabelaCusto(dificuldade);
    return tabela.map(item => item.nivel);
}

function getNivelPorCusto(dificuldade, custo) {
    const tabela = obterTabelaCusto(dificuldade);
    const entrada = tabela.find(item => item.custo === custo);
    return entrada ? entrada.nivel : 0;
}

// ===== INICIALIZAÇÃO =====
function initPericiasTab() {
    console.log('🎯 Inicializando sistema de perícias...');
    
    // Configura as sub-abas
    configurarSubAbasPericias();
    
    // Carrega dados salvos
    carregarDadosSalvos();
    
    // Configura eventos
    configurarEventosPericias();
    
    // Inicializa estatísticas
    atualizarEstatisticas();
    
    // Carrega o catálogo
    if (typeof window.carregarCatalogoPericias === 'function') {
        window.carregarCatalogoPericias();
    }
    
    // Renderiza tudo
    renderizarStatusDisplay();
    renderizarFiltros();
    renderizarCatalogoPericias();
    renderizarPericiasAprendidas();
    
    console.log('✅ Sistema de perícias inicializado');
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventosPericias() {
    console.log('🔧 Configurando eventos de perícias...');
    
    // Busca de perícias
    const buscaInput = document.getElementById('busca-pericias');
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            estadoPericias.buscaAtiva = e.target.value.toLowerCase();
            renderizarCatalogoPericias();
        });
    }
    
    // Filtros rápidos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filtro = btn.dataset.filtro;
            filtrarPericiasPor(filtro);
        });
    });
    
    // Cards de estatísticas
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', () => {
            const filtro = card.dataset.filtro;
            filtrarPericiasPor(filtro);
        });
    });
    
    // Modal overlay
    const modalPericiaOverlay = document.getElementById('modal-pericia-overlay');
    if (modalPericiaOverlay) {
        modalPericiaOverlay.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                fecharModalPericia();
            }
        });
    }
    
    const modalEspecializacaoOverlay = document.getElementById('modal-especializacao-overlay');
    if (modalEspecializacaoOverlay) {
        modalEspecializacaoOverlay.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                fecharModalEspecializacao();
            }
        });
    }
    
    // Tecla Escape para fechar modais
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalPericia();
            fecharModalEspecializacao();
        }
    });
    
    // Configura evento de clique nas perícias
    configurarCliquePericias();
    
    console.log('✅ Eventos de perícias configurados');
}

// ===== CONFIGURAR CLIQUE EM PERÍCIAS =====
function configurarCliquePericias() {
    console.log('🎯 Configurando eventos de clique para perícias...');
    
    // DELEGAÇÃO DE EVENTOS PARA PERÍCIAS DO CATÁLOGO - VERSÃO CORRIGIDA
    const listaPericias = document.getElementById('lista-pericias');
    if (listaPericias) {
        // Remove evento anterior para evitar duplicação
        listaPericias.removeEventListener('click', handleCliquePericia);
        // Adiciona novo evento
        listaPericias.addEventListener('click', handleCliquePericia);
        console.log('✅ Evento de clique configurado para lista-pericias');
    } else {
        console.error('❌ Elemento lista-pericias não encontrado!');
    }
}

// Função para lidar com o clique em uma perícia
function handleCliquePericia(event) {
    // Encontra o elemento de perícia clicado
    let periciaElement = event.target;
    
    // Suba na árvore até encontrar o elemento .pericia-item
    while (periciaElement && !periciaElement.classList?.contains('pericia-item')) {
        periciaElement = periciaElement.parentElement;
        if (!periciaElement) break;
    }
    
    if (!periciaElement || !periciaElement.dataset?.id) {
        console.log('⚠️ Clique não foi em uma perícia');
        return;
    }
    
    const periciaId = periciaElement.dataset.id;
    console.log('🎯 Clique na perícia ID:', periciaId);
    
    // Busca a perícia no catálogo
    const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
    const pericia = todasPericias.find(p => p.id === periciaId);
    
    if (pericia) {
        console.log(`✅ Encontrada perícia: ${pericia.nome}`);
        
        // Verifica se já está aprendida
        const jaAprendida = estadoPericias.periciasAprendidas.some(p => p.id === pericia.id);
        const periciaExistente = jaAprendida ? 
            estadoPericias.periciasAprendidas.find(p => p.id === pericia.id) : null;
        
        // Abre o modal
        abrirModalPericia(pericia, periciaExistente);
    } else {
        console.error('❌ Perícia não encontrada no catálogo:', periciaId);
    }
}

// ===== OBTER ATRIBUTO ATUAL =====
function obterAtributoAtual(atributo) {
    try {
        // Tenta obter do estado local primeiro
        if (estadoPericias.atributos && estadoPericias.atributos[atributo]) {
            return estadoPericias.atributos[atributo];
        }
        
        // Tenta obter do sistema principal (se existir)
        if (window.obterValorAtributo && typeof window.obterValorAtributo === 'function') {
            const valor = window.obterValorAtributo(atributo);
            if (valor !== undefined && valor !== null) {
                return valor;
            }
        }
        
        // Fallback: valores padrão
        const valoresPadrao = {
            'DX': 10, 'IQ': 10, 'HT': 10, 'PERC': 10,
            'FOR': 10, 'VIT': 10, 'VON': 10
        };
        
        return valoresPadrao[atributo] || 10;
        
    } catch (error) {
        console.error('❌ Erro ao obter atributo:', error);
        return 10;
    }
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogoPericias() {
    const container = document.getElementById('lista-pericias');
    if (!container) {
        console.error('❌ Container lista-pericias não encontrado');
        return;
    }
    
    // Get catalog from the catalog file
    const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
    
    if (todasPericias.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-spinner fa-spin"></i>
                <h4>Carregando catálogo...</h4>
                <p>Aguarde enquanto as perícias são carregadas</p>
            </div>
        `;
        return;
    }
    
    // Apply filters
    let periciasFiltradas = todasPericias;
    
    if (estadoPericias.filtroAtivo !== 'todas') {
        switch(estadoPericias.filtroAtivo) {
            case 'dx':
                periciasFiltradas = todasPericias.filter(p => p.atributo === 'DX');
                break;
            case 'iq':
                periciasFiltradas = todasPericias.filter(p => p.atributo === 'IQ');
                break;
            case 'ht':
                periciasFiltradas = todasPericias.filter(p => p.atributo === 'HT');
                break;
            case 'perc':
                periciasFiltradas = todasPericias.filter(p => p.atributo === 'PERC');
                break;
            case 'combate':
                periciasFiltradas = todasPericias.filter(p => 
                    p.categoria === 'Combate' || p.tipo === 'combate' || 
                    p.nome.toLowerCase().includes('arma') || 
                    p.nome.toLowerCase().includes('combate')
                );
                break;
            case 'facil':
                periciasFiltradas = todasPericias.filter(p => p.dificuldade === 'Fácil');
                break;
            case 'media':
                periciasFiltradas = todasPericias.filter(p => p.dificuldade === 'Média');
                break;
            case 'dificil':
                periciasFiltradas = todasPericias.filter(p => p.dificuldade === 'Difícil' || p.dificuldade === 'Muito Difícil');
                break;
        }
    }
    
    // Apply search
    if (estadoPericias.buscaAtiva.trim() !== '') {
        const termo = estadoPericias.buscaAtiva.toLowerCase();
        periciasFiltradas = periciasFiltradas.filter(p => 
            p.nome.toLowerCase().includes(termo) || 
            (p.descricao && p.descricao.toLowerCase().includes(termo)) ||
            (p.grupo && p.grupo.toLowerCase().includes(termo))
        );
    }
    
    // Render
    if (periciasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h4>Nenhuma perícia encontrada</h4>
                <p>Tente outro filtro ou termo de busca</p>
            </div>
        `;
        const contador = document.getElementById('contador-pericias');
        if (contador) contador.textContent = '0';
        return;
    }
    
    container.innerHTML = '';
    
    periciasFiltradas.forEach(pericia => {
        const jaAprendida = estadoPericias.periciasAprendidas.some(p => p.id === pericia.id);
        const jaAprendidaGrupo = pericia.grupo && 
            estadoPericias.periciasAprendidas.some(p => p.grupo === pericia.grupo && p.especializacao);
        
        const periciaElement = document.createElement('div');
        periciaElement.className = 'pericia-item';
        periciaElement.dataset.id = pericia.id;
        
        let html = `
            <div class="pericia-header">
                <div class="pericia-nome">${pericia.nome}</div>
                <div class="pericia-info">
                    <span class="atributo-badge">${pericia.atributo}</span>
                    <span class="dificuldade-badge">${pericia.dificuldade}</span>
                    ${pericia.custoBase ? `<span class="pericia-custo">${pericia.custoBase} pts</span>` : ''}
                </div>
            </div>
            <div class="pericia-base">
                ${pericia.atributo}/${pericia.dificuldade}
                ${pericia.grupo ? ` · Grupo: ${pericia.grupo}` : ''}
            </div>
            <div class="pericia-descricao">${pericia.descricao || 'Sem descrição disponível.'}</div>
        `;
        
        if (jaAprendida || jaAprendidaGrupo) {
            html += `<div class="pericia-aprendida-indicator"><i class="fas fa-check-circle"></i> Já aprendida</div>`;
        }
        
        periciaElement.innerHTML = html;
        container.appendChild(periciaElement);
    });
    
    const contador = document.getElementById('contador-pericias');
    if (contador) contador.textContent = periciasFiltradas.length;
    
    console.log(`✅ Catálogo renderizado: ${periciasFiltradas.length} perícias`);
}

// ===== MODAL DE PERÍCIA - VERSÃO CORRIGIDA =====
function abrirModalPericia(pericia, periciaExistente = null) {
    console.log(`🟢 Abrindo modal para: ${pericia.nome} (${pericia.dificuldade})`);
    
    estadoPericias.modalPericiaAtiva = pericia;
    estadoPericias.periciaEditando = periciaExistente;
    
    // Determina nível inicial
    let nivelInicial = 0;
    if (periciaExistente) {
        nivelInicial = periciaExistente.nivel || 0;
    } else {
        // Para nova perícia, pega o primeiro nível positivo (normalmente 0)
        const tabela = obterTabelaCusto(pericia.dificuldade);
        const entradaZero = tabela.find(item => item.nivel === 0);
        nivelInicial = entradaZero ? entradaZero.nivel : 0;
    }
    
    estadoPericias.nivelPericia = nivelInicial;
    
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + nivelInicial;
    const custoAtual = calcularCustoParaNivel(pericia.dificuldade, nivelInicial);
    const niveisDisponiveis = obterNiveisDisponiveis(pericia.dificuldade);
    
    // Gera opções de nível
    let opcoesNivelHTML = '';
    niveisDisponiveis.forEach(nivel => {
        const custo = calcularCustoParaNivel(pericia.dificuldade, nivel);
        if (custo > 0) { // Só mostra níveis que custam pontos
            const nivelDisplay = nivel >= 0 ? `+${nivel}` : nivel;
            const selecionado = nivel === nivelInicial ? 'selected' : '';
            opcoesNivelHTML += `<option value="${nivel}" ${selecionado}>${nivelDisplay} (${custo} pontos)</option>`;
        }
    });
    
    // MODAL CONTENT - VERSÃO CORRIGIDA
    const modalHTML = `
        <div class="modal-pericia-content">
            <div class="modal-pericia-header">
                <h3><i class="fas fa-book-open"></i> ${pericia.nome}</h3>
                <button class="modal-pericia-close" onclick="window.fecharModalPericia()">&times;</button>
            </div>
            
            <div class="modal-pericia-body">
                <div class="modal-pericia-info">
                    <div class="info-row">
                        <span class="info-label">Atributo:</span>
                        <span class="info-value">${pericia.atributo}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Dificuldade:</span>
                        <span class="info-value pericia-dificuldade-${pericia.dificuldade.toLowerCase().replace(/ /g, '-')}">${pericia.dificuldade}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Custo:</span>
                        <span class="info-value" id="modal-custo-atual">${custoAtual} pontos</span>
                    </div>
                </div>
                
                <div class="modal-pericia-descricao">
                    <h4>Descrição</h4>
                    <p>${pericia.descricao || 'Sem descrição disponível.'}</p>
                </div>
                
                ${pericia.default ? `
                <div class="modal-pericia-default">
                    <h4>Default</h4>
                    <p>${pericia.default}</p>
                </div>
                ` : ''}
                
                ${pericia.prereq ? `
                <div class="modal-pericia-prereq">
                    <h4>Pré-requisito</h4>
                    <p>${pericia.prereq}</p>
                </div>
                ` : ''}
                
                <div class="modal-pericia-controles">
                    <div class="controle-nivel">
                        <h4>Nível da Perícia</h4>
                        <select class="nivel-select" id="nivel-pericia-select" onchange="window.alterarNivelPericiaDropdown(this.value)">
                            ${opcoesNivelHTML}
                        </select>
                        
                        <div class="nivel-nh-info">
                            <span>NH Atual: </span>
                            <span id="modal-nh-valor">${nhAtual}</span>
                            <small id="modal-nh-calculo">(${atributoBase} ${nivelInicial >= 0 ? '+' : ''}${nivelInicial})</small>
                        </div>
                    </div>
                    
                    <div class="tabela-custo-rapida">
                        <h5>Tabela de Custo (${pericia.dificuldade})</h5>
                        <div class="tabela-custo-grid" id="tabela-custo-rapida">
                            <!-- A tabela será gerada dinamicamente -->
                        </div>
                    </div>
                </div>
                
                ${pericia.tipo === 'grupo-especializacao' && !periciaExistente?.especializacao ? `
                <div class="modal-pericia-especializacao-alerta">
                    <h4><i class="fas fa-star"></i> Especialização Necessária</h4>
                    <p>Esta perícia requer escolha de especialização.</p>
                </div>
                ` : ''}
            </div>
            
            <div class="modal-pericia-footer">
                <div class="modal-custo-total">
                    <span class="label">Custo Total:</span>
                    <span class="valor" id="modal-custo-total">${custoAtual}</span>
                    <span> pontos</span>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancelar" onclick="window.fecharModalPericia()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    ${pericia.tipo === 'grupo-especializacao' && !periciaExistente?.especializacao ? `
                    <button class="btn-modal btn-modal-especializacao" onclick="window.abrirModalEspecializacao()">
                        <i class="fas fa-star"></i> Escolher Especialização
                    </button>
                    ` : `
                    <button class="btn-modal btn-modal-confirmar" onclick="window.confirmarPericia()" id="btn-confirmar-pericia">
                        <i class="fas fa-check"></i> ${periciaExistente ? 'Atualizar' : 'Adquirir'}
                    </button>
                    `}
                </div>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('modal-pericia');
    if (modal) {
        modal.innerHTML = modalHTML;
        // Gera a tabela de custos rápida
        gerarTabelaCustoRapida(pericia.dificuldade, nivelInicial);
    }
    
    // Show modal
    const modalOverlay = document.getElementById('modal-pericia-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        console.log('✅ Modal exibido com cálculos corretos');
    }
}

// ===== FUNÇÕES AUXILIARES DO MODAL =====
function alterarNivelPericiaDropdown(valorSelecionado) {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const novoNivel = parseInt(valorSelecionado);
    estadoPericias.nivelPericia = novoNivel;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + novoNivel;
    const custoAtual = calcularCustoParaNivel(pericia.dificuldade, novoNivel);
    
    // Update display
    const nhElement = document.getElementById('modal-nh-valor');
    const nhCalculoElement = document.getElementById('modal-nh-calculo');
    const custoElement = document.getElementById('modal-custo-atual');
    const custoTotalElement = document.getElementById('modal-custo-total');
    
    if (nhElement) nhElement.textContent = nhAtual;
    if (nhCalculoElement) nhCalculoElement.textContent = `(${atributoBase} ${novoNivel >= 0 ? '+' : ''}${novoNivel})`;
    if (custoElement) custoElement.textContent = `${custoAtual} pontos`;
    if (custoTotalElement) custoTotalElement.textContent = custoAtual;
    
    // Update cost table
    gerarTabelaCustoRapida(pericia.dificuldade, novoNivel);
}

function gerarTabelaCustoRapida(dificuldade, nivelAtual) {
    const container = document.getElementById('tabela-custo-rapida');
    if (!container) return;
    
    const tabela = obterTabelaCusto(dificuldade);
    let tabelaHTML = '';
    
    // Mostra apenas os primeiros 6 níveis para não sobrecarregar
    const niveisParaMostrar = tabela.slice(0, 6);
    
    niveisParaMostrar.forEach(item => {
        if (item.custo > 0) { // Não mostra custo 0
            const nivelDisplay = item.nivel >= 0 ? `+${item.nivel}` : item.nivel;
            const isAtual = item.nivel === nivelAtual;
            tabelaHTML += `
                <div class="tabela-custo-item ${isAtual ? 'ativo' : ''}">
                    <div class="tabela-nivel">${nivelDisplay}</div>
                    <div class="tabela-custo">${item.custo}</div>
                    ${isAtual ? '<div class="tabela-atual">✓</div>' : ''}
                </div>
            `;
        }
    });
    
    container.innerHTML = tabelaHTML;
}

// ===== MODAL DE ESPECIALIZAÇÃO =====
function abrirModalEspecializacao() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    console.log(`🟡 Abrindo especialização para: ${pericia.nome}`);
    
    // Get specializations ONLY for the specific group
    const especializacoes = pericia.grupo ? 
        (window.obterEspecializacoes ? window.obterEspecializacoes(pericia.grupo) : []) : [];
    
    const modal = document.getElementById('modal-especializacao');
    if (!modal) return;
    
    let especializacoesHTML = '';
    
    if (especializacoes && especializacoes.length > 0) {
        especializacoesHTML = especializacoes.map(espec => {
            return `
                <div class="especializacao-item" onclick="window.selecionarEspecializacaoModal('${espec.nome}', '${espec.id}')">
                    <div class="especializacao-header">
                        <div class="especializacao-nome">${espec.nome}</div>
                        <div class="especializacao-custo">${espec.custoBase || 2} pts</div>
                    </div>
                    <div class="especializacao-descricao">${espec.descricao || ''}</div>
                    ${espec.default ? `<div class="especializacao-default">Default: ${espec.default}</div>` : ''}
                </div>
            `;
        }).join('');
    } else {
        especializacoesHTML = `
            <div class="no-especializacoes">
                <i class="fas fa-info-circle"></i>
                <p>Esta perícia não tem especializações pré-definidas.</p>
                <p>Clique em "Confirmar" para adquirir a perícia geral.</p>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-especializacao-content">
            <div class="modal-especializacao-header">
                <h3><i class="fas fa-star"></i> ${pericia.nome}</h3>
                <button class="modal-especializacao-close" onclick="window.fecharModalEspecializacao()">&times;</button>
            </div>
            
            <div class="modal-especializacao-body">
                <div class="modal-especializacao-info">
                    <p>Selecione uma especialização para <strong>${pericia.nome}</strong>:</p>
                    <small>Todas as especializações seguem a mesma tabela de custos.</small>
                </div>
                
                <div class="especializacoes-lista" id="especializacoes-lista">
                    ${especializacoesHTML}
                </div>
            </div>
            
            <div class="modal-especializacao-footer">
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancelar" onclick="window.fecharModalEspecializacao()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-modal btn-modal-confirmar" onclick="window.confirmarPericiaComEspecializacao()">
                        <i class="fas fa-check"></i> Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalOverlay = document.getElementById('modal-especializacao-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        console.log('✅ Modal de especialização exibido');
    }
}

function selecionarEspecializacaoModal(nomeEspecializacao, idEspecializacao) {
    estadoPericias.especializacaoSelecionada = { nome: nomeEspecializacao, id: idEspecializacao };
    
    // Update UI
    document.querySelectorAll('.especializacao-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Find and select the clicked item
    const items = document.querySelectorAll('.especializacao-item');
    items.forEach(item => {
        const nomeElement = item.querySelector('.especializacao-nome');
        if (nomeElement && nomeElement.textContent === nomeEspecializacao) {
            item.classList.add('selected');
        }
    });
}

function confirmarPericiaComEspecializacao() {
    const pericia = estadoPericias.modalPericiaAtiva;
    const nivel = estadoPericias.nivelPericia;
    const especializacao = estadoPericias.especializacaoSelecionada || { nome: pericia.nome, id: pericia.id };
    
    const custoTotal = calcularCustoParaNivel(pericia.dificuldade, nivel);
    
    // Create unique ID
    const skillId = especializacao.id || `${pericia.id}-${especializacao.nome.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    const novaPericia = {
        id: skillId,
        nome: pericia.nome,
        atributo: pericia.atributo,
        dificuldade: pericia.dificuldade,
        nivel: nivel,
        custo: custoTotal,
        investimentoAcumulado: custoTotal,
        categoria: pericia.categoria || 'Geral',
        descricao: pericia.descricao,
        grupo: pericia.grupo,
        especializacao: especializacao.nome !== pericia.nome ? especializacao.nome : null,
        tipo: pericia.tipo
    };
    
    // Verifica se já existe (para atualização)
    const indexExistente = estadoPericias.periciasAprendidas.findIndex(p => p.id === skillId);
    if (indexExistente >= 0) {
        estadoPericias.periciasAprendidas[indexExistente] = novaPericia;
    } else {
        estadoPericias.periciasAprendidas.push(novaPericia);
    }
    
    // Save and update
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogoPericias();
    fecharModalEspecializacao();
    fecharModalPericia();
    
    showNotification(`✅ ${pericia.nome}${especializacao.nome !== pericia.nome ? ` (${especializacao.nome})` : ''} adquirida!`, 'success');
}

// ===== FUNÇÃO DE CONFIRMAÇÃO DE PERÍCIA =====
function confirmarPericia() {
    if (!estadoPericias.modalPericiaAtiva) {
        console.error('❌ Nenhuma perícia ativa no modal');
        return;
    }
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const nivel = estadoPericias.nivelPericia;
    const periciaExistente = estadoPericias.periciaEditando;
    
    const custoTotal = calcularCustoParaNivel(pericia.dificuldade, nivel);
    
    if (periciaExistente) {
        // Update existing
        const index = estadoPericias.periciasAprendidas.findIndex(p => p.id === periciaExistente.id);
        if (index !== -1) {
            estadoPericias.periciasAprendidas[index] = {
                ...periciaExistente,
                nivel: nivel,
                custo: custoTotal,
                investimentoAcumulado: (periciaExistente.investimentoAcumulado || 0) + custoTotal
            };
            console.log(`📝 Perícia atualizada: ${pericia.nome} (Nível: ${nivel})`);
        }
    } else {
        // Add new
        const novaPericia = {
            id: pericia.id,
            nome: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: custoTotal,
            investimentoAcumulado: custoTotal,
            categoria: pericia.categoria || 'Geral',
            descricao: pericia.descricao,
            grupo: pericia.grupo,
            tipo: pericia.tipo
        };
        
        estadoPericias.periciasAprendidas.push(novaPericia);
        console.log(`➕ Nova perícia adquirida: ${pericia.nome} (Nível: ${nivel})`);
    }
    
    // Save and update UI
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogoPericias();
    fecharModalPericia();
    
    // Show success message
    showNotification(`✅ Perícia ${pericia.nome} ${periciaExistente ? 'atualizada' : 'adquirida'}!`, 'success');
}

function fecharModalPericia() {
    const modalOverlay = document.getElementById('modal-pericia-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoPericias.modalPericiaAtiva = null;
    estadoPericias.periciaEditando = null;
    estadoPericias.nivelPericia = 0;
    console.log('🔒 Modal de perícia fechado');
}

function fecharModalEspecializacao() {
    const modalOverlay = document.getElementById('modal-especializacao-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoPericias.modalEspecializacaoAtiva = null;
    estadoPericias.especializacaoSelecionada = null;
    console.log('🔒 Modal de especialização fechado');
}

// ===== FUNÇÕES DE SUB-ABAS =====
function configurarSubAbasPericias() {
    console.log('🔄 Configurando sub-abas de perícias...');
    
    const subTabBtns = document.querySelectorAll('.subtab-btn-pericias');
    
    subTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const subtab = btn.dataset.subtab;
            console.log(`Mudando para sub-aba: ${subtab}`);
            
            // Atualiza estado
            estadoPericias.subAbaAtiva = subtab;
            
            // Remove active de todos os botões
            document.querySelectorAll('.subtab-btn-pericias').forEach(b => {
                b.classList.remove('active');
            });
            
            // Remove active de todos os painéis
            document.querySelectorAll('.subtab-pane-pericias').forEach(p => {
                p.classList.remove('active');
            });
            
            // Adiciona active no botão clicado
            btn.classList.add('active');
            
            // Mostra o painel correspondente
            const pane = document.getElementById(`subtab-${subtab}`);
            if (pane) {
                pane.classList.add('active');
                
                // Se for a aba de técnicas, inicializa ela
                if (subtab === 'tecnicas' && typeof window.initTecnicasTab === 'function') {
                    setTimeout(() => {
                        window.initTecnicasTab();
                    }, 100);
                }
                
                // Se for a aba de perícias, garante que está inicializada
                if (subtab === 'pericias') {
                    renderizarCatalogoPericias();
                    renderizarPericiasAprendidas();
                }
            }
            
            // Salva última sub-aba acessada
            localStorage.setItem('ultimaSubAbaPericias', subtab);
        });
    });
    
    console.log(`✅ ${subTabBtns.length} sub-abas configuradas`);
    
    // Restaura última sub-aba acessada
    const ultimaSubAba = localStorage.getItem('ultimaSubAbaPericias') || 'pericias';
    const btnInicial = document.querySelector(`.subtab-btn-pericias[data-subtab="${ultimaSubAba}"]`);
    if (btnInicial) {
        setTimeout(() => {
            btnInicial.click();
        }, 100);
    }
}

// ===== CARREGAR DADOS SALVOS =====
function carregarDadosSalvos() {
    try {
        // Tenta carregar do localStorage
        const dadosPericiasSalvos = localStorage.getItem('gurps_pericias');
        const dadosAtributosSalvos = localStorage.getItem('gurps_atributos');
        
        // Carrega perícias
        if (dadosPericiasSalvos) {
            const dados = JSON.parse(dadosPericiasSalvos);
            if (dados.periciasAprendidas && Array.isArray(dados.periciasAprendidas)) {
                estadoPericias.periciasAprendidas = dados.periciasAprendidas;
                console.log(`📂 Carregadas ${dados.periciasAprendidas.length} perícias do save`);
            }
            if (dados.pontosTotais !== undefined) {
                estadoPericias.pontosPericias = dados.pontosTotais;
            }
        }
        
        // Carrega atributos
        if (dadosAtributosSalvos) {
            const dados = JSON.parse(dadosAtributosSalvos);
            if (dados.DX !== undefined) estadoPericias.atributos.DX = dados.DX;
            if (dados.IQ !== undefined) estadoPericias.atributos.IQ = dados.IQ;
            if (dados.HT !== undefined) estadoPericias.atributos.HT = dados.HT;
            if (dados.PERC !== undefined) estadoPericias.atributos.PERC = dados.PERC;
            console.log('📂 Atributos carregados do save:', estadoPericias.atributos);
        }
        
        // Carrega última sub-aba
        const ultimaSubAba = localStorage.getItem('ultimaSubAbaPericias');
        if (ultimaSubAba) {
            estadoPericias.subAbaAtiva = ultimaSubAba;
        }
        
        console.log('✅ Dados salvos carregados com sucesso');
    } catch (error) {
        console.error('❌ Erro ao carregar dados salvos:', error);
        // Inicializa com dados padrão
        estadoPericias.periciasAprendidas = [];
        estadoPericias.atributos = { DX: 10, IQ: 10, HT: 10, PERC: 10 };
    }
}

// ===== SALVAR DADOS =====
function salvarDados() {
    try {
        const dadosPericias = {
            periciasAprendidas: estadoPericias.periciasAprendidas,
            pontosTotais: estadoPericias.pontosPericias + estadoPericias.pontosCombate,
            dataSalvamento: new Date().toISOString()
        };
        
        localStorage.setItem('gurps_pericias', JSON.stringify(dadosPericias));
        
        // Salva também os atributos se estiverem no estado
        if (estadoPericias.atributos) {
            localStorage.setItem('gurps_atributos', JSON.stringify(estadoPericias.atributos));
        }
        
        console.log('💾 Dados de perícias salvos');
    } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
    }
}

// ===== FUNÇÕES DE FILTRO =====
function filtrarPericiasPor(filtro) {
    estadoPericias.filtroAtivo = filtro;
    
    // Atualiza botões de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filtro === filtro);
    });
    
    // Atualiza catálogo
    renderizarCatalogoPericias();
    
    console.log(`🔍 Filtro aplicado: ${filtro}`);
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticas() {
    // Reset counters
    estadoPericias.pontosPericias = 0;
    estadoPericias.pontosCombate = 0;
    estadoPericias.totalPericias = 0;
    estadoPericias.totalCombate = 0;
    estadoPericias.totalDX = 0;
    estadoPericias.totalIQ = 0;
    estadoPericias.totalHT = 0;
    estadoPericias.totalPERC = 0;
    estadoPericias.pontosDX = 0;
    estadoPericias.pontosIQ = 0;
    estadoPericias.pontosHT = 0;
    estadoPericias.pontosPERC = 0;
    
    // Calculate from learned skills
    estadoPericias.periciasAprendidas.forEach(pericia => {
        const custo = pericia.investimentoAcumulado || pericia.custo || 0;
        const atributo = pericia.atributo;
        const categoria = pericia.categoria;
        
        // Update attribute counts
        switch(atributo) {
            case 'DX':
                estadoPericias.totalDX++;
                estadoPericias.pontosDX += custo;
                break;
            case 'IQ':
                estadoPericias.totalIQ++;
                estadoPericias.pontosIQ += custo;
                break;
            case 'HT':
                estadoPericias.totalHT++;
                estadoPericias.pontosHT += custo;
                break;
            case 'PERC':
                estadoPericias.totalPERC++;
                estadoPericias.pontosPERC += custo;
                break;
        }
        
        // Update combat counts
        if (categoria === 'Combate' || pericia.tipo === 'combate' || 
            (pericia.nome && (pericia.nome.includes('Arma') || pericia.nome.includes('Espada') || 
                             pericia.nome.includes('Escudo') || pericia.nome.includes('Arco')))) {
            estadoPericias.pontosCombate += custo;
            estadoPericias.totalCombate++;
        } else {
            estadoPericias.pontosPericias += custo;
        }
        
        estadoPericias.totalPericias++;
    });
    
    // Update display
    renderizarStatusDisplay();
    
    console.log(`📊 Estatísticas atualizadas: ${estadoPericias.totalPericias} perícias, ${estadoPericias.pontosPericias + estadoPericias.pontosCombate} pontos`);
}

function renderizarStatusDisplay() {
    // Update stat cards
    const elementos = [
        { id: 'qtd-total', valor: estadoPericias.totalPericias },
        { id: 'pts-total', valor: `(${estadoPericias.pontosPericias + estadoPericias.pontosCombate} pts)` },
        { id: 'qtd-dx', valor: estadoPericias.totalDX },
        { id: 'pts-dx', valor: `(${estadoPericias.pontosDX} pts)` },
        { id: 'qtd-iq', valor: estadoPericias.totalIQ },
        { id: 'pts-iq', valor: `(${estadoPericias.pontosIQ} pts)` },
        { id: 'qtd-ht', valor: estadoPericias.totalHT },
        { id: 'pts-ht', valor: `(${estadoPericias.pontosHT} pts)` },
        { id: 'qtd-perc', valor: estadoPericias.totalPERC },
        { id: 'pts-perc', valor: `(${estadoPericias.pontosPERC} pts)` },
        { id: 'qtd-combate', valor: estadoPericias.totalCombate },
        { id: 'pts-combate', valor: `(${estadoPericias.pontosCombate} pts)` },
        { id: 'total-pericias', valor: estadoPericias.totalPericias },
        { id: 'pontos-total', valor: (estadoPericias.pontosPericias + estadoPericias.pontosCombate) + ' pts' },
        { id: 'pontos-aprendidas', valor: (estadoPericias.pontosPericias + estadoPericias.pontosCombate) + ' pts' }
    ];
    
    elementos.forEach(elem => {
        const elemento = document.getElementById(elem.id);
        if (elemento) {
            elemento.textContent = elem.valor;
        }
    });
    
    // Update main badge
    const totalPontos = estadoPericias.pontosPericias + estadoPericias.pontosCombate;
    const pontosPericiasTotal = document.getElementById('pontos-pericias-total');
    if (pontosPericiasTotal) {
        pontosPericiasTotal.textContent = `[${totalPontos} pts]`;
    }
}

// ===== RENDERIZAR PERÍCIAS APRENDIDAS =====
function renderizarPericiasAprendidas() {
    const container = document.getElementById('pericias-aprendidas');
    if (!container) {
        console.error('❌ Container pericias-aprendidas não encontrado');
        return;
    }
    
    if (estadoPericias.periciasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-graduation-cap"></i>
                <div>Nenhuma perícia aprendida</div>
                <small>As perícias que você aprender aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    // Ordena por nome
    const periciasOrdenadas = [...estadoPericias.periciasAprendidas].sort((a, b) => 
        a.nome.localeCompare(b.nome)
    );
    
    periciasOrdenadas.forEach(pericia => {
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + (pericia.nivel || 0);
        
        const periciaElement = document.createElement('div');
        periciaElement.className = 'pericia-aprendida-item';
        periciaElement.dataset.id = pericia.id;
        
        let nomeDisplay = pericia.nome;
        if (pericia.especializacao) {
            nomeDisplay += ` <span class="pericia-especializacao">(${pericia.especializacao})</span>`;
        }
        
        const custoDisplay = pericia.investimentoAcumulado || pericia.custo || 0;
        
        const html = `
            <div class="pericia-aprendida-header">
                <div class="pericia-aprendida-nome">${nomeDisplay}</div>
                <div class="pericia-aprendida-info">
                    <span class="nivel-display">${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel}</span>
                    <span class="nh-display">NH ${nhAtual}</span>
                </div>
            </div>
            <div class="pericia-nivel-container">
                <div class="nivel-label">Nível: ${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel}</div>
                <div class="nivel-detalhes">
                    ${atributoBase} (${pericia.atributo}) + ${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel}
                </div>
            </div>
            <div class="pericia-info-adicional">
                <span class="pericia-dificuldade">${pericia.dificuldade}</span>
                <span class="pericia-custo">${custoDisplay} pts</span>
            </div>
            ${pericia.especializacao ? `
            <div class="especializacoes">
                <h5><i class="fas fa-star"></i> Especialização</h5>
                <div class="especializacao-list">
                    <div class="especializacao-badge">
                        ${pericia.especializacao}
                    </div>
                </div>
            </div>
            ` : ''}
            <div class="pericia-actions">
                <button class="btn-editar-pericia" data-id="${pericia.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover-pericia" data-id="${pericia.id}">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `;
        
        periciaElement.innerHTML = html;
        
        // Add event listeners
        const btnEditar = periciaElement.querySelector('.btn-editar-pericia');
        const btnRemover = periciaElement.querySelector('.btn-remover-pericia');
        
        if (btnEditar) {
            btnEditar.addEventListener('click', (e) => {
                e.stopPropagation();
                editarPericia(pericia.id);
            });
        }
        
        if (btnRemover) {
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                removerPericia(pericia.id);
            });
        }
        
        // Add click to edit
        periciaElement.addEventListener('click', () => {
            editarPericia(pericia.id);
        });
        
        container.appendChild(periciaElement);
    });
    
    console.log(`✅ ${estadoPericias.periciasAprendidas.length} perícias aprendidas renderizadas`);
}

// ===== FUNÇÕES AUXILIARES =====
function editarPericia(id) {
    const periciaAprendida = estadoPericias.periciasAprendidas.find(p => p.id === id);
    if (!periciaAprendida) {
        console.error('❌ Perícia não encontrada para editar:', id);
        return;
    }
    
    // Busca a perícia original no catálogo
    const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
    const periciaOriginal = todasPericias.find(p => 
        p.id === periciaAprendida.id || 
        (p.grupo && periciaAprendida.grupo && p.grupo === periciaAprendida.grupo)
    );
    
    if (periciaOriginal) {
        abrirModalPericia(periciaOriginal, periciaAprendida);
    } else {
        // Fallback: cria objeto básico
        const periciaBasica = {
            id: periciaAprendida.id,
            nome: periciaAprendida.nome,
            atributo: periciaAprendida.atributo,
            dificuldade: periciaAprendida.dificuldade,
            categoria: periciaAprendida.categoria,
            descricao: periciaAprendida.descricao || 'Sem descrição',
            grupo: periciaAprendida.grupo
        };
        abrirModalPericia(periciaBasica, periciaAprendida);
    }
}

function removerPericia(id) {
    if (!confirm('Tem certeza que deseja remover esta perícia?')) return;
    
    const pericia = estadoPericias.periciasAprendidas.find(p => p.id === id);
    if (!pericia) {
        console.error('❌ Perícia não encontrada para remover:', id);
        return;
    }
    
    // Remove do array
    estadoPericias.periciasAprendidas = estadoPericias.periciasAprendidas.filter(p => p.id !== id);
    
    // Save and update UI
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogoPericias();
    
    showNotification(`🗑️ Perícia ${pericia.nome} removida com sucesso!`, 'warning');
    console.log(`➖ Perícia removida: ${pericia.nome}`);
}

// ===== FUNÇÕES DE NOTIFICAÇÃO =====
function showNotification(mensagem, tipo = 'info') {
    // Remove notificação anterior se existir
    const notificacaoAnterior = document.querySelector('.pericia-notification');
    if (notificacaoAnterior) {
        notificacaoAnterior.remove();
    }
    
    // Cria nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `pericia-notification pericia-notification-${tipo}`;
    notificacao.innerHTML = `
        <div class="pericia-notification-content">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    // Adiciona ao body
    document.body.appendChild(notificacao);
    
    // Anima entrada
    setTimeout(() => {
        notificacao.classList.add('show');
    }, 10);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
}

// ===== RENDERIZAR FILTROS =====
function renderizarFiltros() {
    const filtros = document.querySelectorAll('.filtro-btn');
    filtros.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filtro === estadoPericias.filtroAtivo);
    });
}

// ===== LIMPAR DADOS =====
function limparDadosPericias() {
    if (confirm('Tem certeza que deseja limpar TODAS as perícias aprendidas? Esta ação não pode ser desfeita.')) {
        estadoPericias.periciasAprendidas = [];
        salvarDados();
        atualizarEstatisticas();
        renderizarPericiasAprendidas();
        renderizarCatalogoPericias();
        showNotification('🧹 Todas as perícias foram removidas!', 'warning');
    }
}

// ===== EXPORTAR TODAS AS FUNÇÕES =====
window.initPericiasTab = initPericiasTab;
window.abrirModalPericia = abrirModalPericia;
window.fecharModalPericia = fecharModalPericia;
window.alterarNivelPericiaDropdown = alterarNivelPericiaDropdown;
window.confirmarPericia = confirmarPericia;
window.selecionarEspecializacaoModal = selecionarEspecializacaoModal;
window.abrirModalEspecializacao = abrirModalEspecializacao;
window.confirmarPericiaComEspecializacao = confirmarPericiaComEspecializacao;
window.fecharModalEspecializacao = fecharModalEspecializacao;
window.removerPericia = removerPericia;
window.editarPericia = editarPericia;
window.renderizarCatalogoPericias = renderizarCatalogoPericias;
window.renderizarPericiasAprendidas = renderizarPericiasAprendidas;
window.filtrarPericiasPor = filtrarPericiasPor;
window.limparDadosPericias = limparDadosPericias;
window.obterTabelaCusto = obterTabelaCusto;
window.calcularCustoParaNivel = calcularCustoParaNivel;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Perícias carregado e pronto!');
    
    // Aguarda um momento para garantir que tudo está carregado
    setTimeout(() => {
        const periciasTab = document.getElementById('pericias');
        if (periciasTab && (periciasTab.classList.contains('active') || 
            periciasTab.style.display !== 'none')) {
            console.log('🔄 Inicializando aba de perícias...');
            if (typeof window.initPericiasTab === 'function') {
                window.initPericiasTab();
            }
        } else {
            console.log('⚠️ Aba de perícias não está ativa, aguardando...');
            
            // Monitora quando a aba é ativada
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        mutation.attributeName === 'class' &&
                        periciasTab.classList.contains('active')) {
                        console.log('🎉 Aba de perícias ativada, inicializando...');
                        if (typeof window.initPericiasTab === 'function') {
                            window.initPericiasTab();
                        }
                        observer.disconnect();
                    }
                });
            });
            
            observer.observe(periciasTab, { attributes: true });
        }
    }, 500);
});

// ===== CSS PARA NOTIFICAÇÕES =====
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .pericia-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(44, 32, 8, 0.95);
        border: 2px solid var(--primary-gold);
        border-radius: 8px;
        padding: 15px 20px;
        color: var(--text-light);
        font-family: 'Cinzel', serif;
        z-index: 10002;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 300px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }
    
    .pericia-notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .pericia-notification-success {
        border-color: var(--accent-green);
        background: rgba(46, 92, 58, 0.95);
    }
    
    .pericia-notification-error {
        border-color: var(--accent-red);
        background: rgba(139, 0, 0, 0.95);
    }
    
    .pericia-notification-warning {
        border-color: #ff9800;
        background: rgba(255, 152, 0, 0.95);
    }
    
    .pericia-notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .pericia-notification-content i {
        font-size: 1.2rem;
    }
`;

document.head.appendChild(notificationStyles);

console.log('🎮 Sistema de Perícias (versão completa e corrigida) carregado!');