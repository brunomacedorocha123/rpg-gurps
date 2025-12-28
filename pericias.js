// ============================================
// SISTEMA DE PERÍCIAS - VERSÃO CORRIGIDA
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

// ===== INICIALIZAÇÃO =====
function initPericiasTab() {
    console.log('🎯 Inicializando sistema de perícias...');
    
    // Configura as sub-abas
    configurarSubAbasPericias();
    
    // Carrega dados salvos
    carregarDadosSalvos();
    
    // Configura eventos
    configurarEventos();
    
    // Inicializa estatísticas
    atualizarEstatisticas();
    
    // Carrega o catálogo
    if (typeof carregarCatalogoPericias === 'function') {
        carregarCatalogoPericias();
    }
    
    // Renderiza tudo
    renderizarStatusDisplay();
    renderizarFiltros();
    renderizarCatalogo();
    renderizarPericiasAprendidas();
    
    console.log('✅ Sistema de perícias inicializado');
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventos() {
    // Busca de perícias
    const buscaInput = document.getElementById('busca-pericias');
    if (buscaInput) {
        buscaInput.addEventListener('input', (e) => {
            estadoPericias.buscaAtiva = e.target.value.toLowerCase();
            renderizarCatalogo();
        });
    }
    
    // Filtros rápidos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const filtro = btn.dataset.filtro;
            filtrarPor(filtro);
        });
    });
    
    // Cards de estatísticas
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', () => {
            const filtro = card.dataset.filtro;
            filtrarPor(filtro);
        });
    });
    
    // Modal overlay - USANDO OS NOVOS IDs
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
    
    // Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalPericia();
            fecharModalEspecializacao();
        }
    });
    
    // DELEGAÇÃO DE EVENTOS PARA PERÍCIAS DO CATÁLOGO
    const listaPericias = document.getElementById('lista-pericias');
    if (listaPericias) {
        listaPericias.addEventListener('click', function(event) {
            const periciaElement = event.target.closest('.pericia-item');
            if (!periciaElement) return;
            
            const periciaId = periciaElement.dataset.id;
            console.log('🎯 Clique delegado na perícia:', periciaId);
            
            // Busca a perícia no catálogo
            const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
            const pericia = todasPericias.find(p => p.id === periciaId);
            
            if (pericia) {
                abrirModalPericia(pericia);
            }
        });
    }
    
    console.log('✅ Eventos configurados');
}

// ===== FUNÇÃO CORRIGIDA obterAtributoAtual =====
function obterAtributoAtual(atributo) {
    // EVITA CONFLITO COM A FUNÇÃO DE TÉCNICAS
    // Se estiver em loop, retorna valor padrão
    if (window.__evitandoLoopPericias) {
        console.warn('⚠️ Prevenido loop em obterAtributoAtual');
        return 10;
    }
    
    try {
        window.__evitandoLoopPericias = true;
        
        // 1. Tenta obter do estado local primeiro
        if (estadoPericias.atributos && estadoPericias.atributos[atributo]) {
            return estadoPericias.atributos[atributo];
        }
        
        // 2. Tenta obter do sistema principal (se existir)
        if (window.obterValorAtributo && typeof window.obterValorAtributo === 'function') {
            const valor = window.obterValorAtributo(atributo);
            if (valor !== undefined && valor !== null) {
                return valor;
            }
        }
        
        // 3. Fallback: valores padrão
        const valoresPadrao = {
            'DX': 10, 'IQ': 10, 'HT': 10, 'PERC': 10,
            'FOR': 10, 'VIT': 10, 'VON': 10
        };
        
        return valoresPadrao[atributo] || 10;
        
    } catch (error) {
        console.error('❌ Erro ao obter atributo:', error);
        return 10;
    } finally {
        window.__evitandoLoopPericias = false;
    }
}

// ===== RENDERIZAR CATÁLOGO =====
function renderizarCatalogo() {
    const container = document.getElementById('lista-pericias');
    if (!container) return;
    
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
}

// ===== MODAL DE PERÍCIA - VERSÃO SIMPLIFICADA =====
function abrirModalPericia(pericia, periciaExistente = null) {
    console.log(`🟢 Abrindo modal para: ${pericia.nome}`);
    
    estadoPericias.modalPericiaAtiva = pericia;
    estadoPericias.periciaEditando = periciaExistente;
    
    // Determine initial level
    let nivelInicial = 0;
    if (periciaExistente) {
        nivelInicial = periciaExistente.nivel || 0;
    }
    
    estadoPericias.nivelPericia = nivelInicial;
    
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + nivelInicial;
    
    // SIMPLE MODAL CONTENT - funciona sempre
    const modalHTML = `
        <div class="modal-pericia-content">
            <div class="modal-pericia-header">
                <h3><i class="fas fa-book-open"></i> ${pericia.nome}</h3>
                <button class="modal-pericia-close" onclick="fecharModalPericia()">&times;</button>
            </div>
            
            <div class="modal-pericia-body">
                <div class="modal-pericia-info">
                    <div class="info-row">
                        <span class="info-label">Atributo/Dificuldade:</span>
                        <span class="info-value">${pericia.atributo}/${pericia.dificuldade}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Categoria:</span>
                        <span class="info-value">${pericia.categoria || 'Geral'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Custo Base:</span>
                        <span class="info-value">${pericia.custoBase || 'Varia'} pontos</span>
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
                
                <div class="modal-pericia-controles">
                    <div class="controle-nivel">
                        <h4>Nível da Perícia</h4>
                        <div class="controle-nivel-botoes">
                            <button class="btn-nivel btn-diminuir" onclick="diminuirNivelPericia()">-</button>
                            <div class="nivel-atual">
                                <div class="valor" id="modal-nivel-valor">${nivelInicial >= 0 ? '+' : ''}${nivelInicial}</div>
                                <div class="label">Nível</div>
                            </div>
                            <button class="btn-nivel btn-aumentar" onclick="aumentarNivelPericia()">+</button>
                        </div>
                        <div class="nivel-nh-info">
                            <span>NH: </span>
                            <span id="modal-nh-valor">${nhAtual}</span>
                            <small id="modal-nh-calculo">(${atributoBase} + ${nivelInicial >= 0 ? '+' : ''}${nivelInicial})</small>
                        </div>
                    </div>
                    
                    <div class="custo-nivel">
                        <span>Custo: </span>
                        <span id="modal-custo-valor">2</span>
                        <span> ponto(s)</span>
                    </div>
                </div>
            </div>
            
            <div class="modal-pericia-footer">
                <div class="modal-custo-total">
                    <span class="label">Custo Total:</span>
                    <span class="valor" id="modal-custo-total">2</span>
                    <span> pontos</span>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancelar" onclick="fecharModalPericia()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-modal btn-modal-confirmar" onclick="confirmarPericia()" id="btn-confirmar-pericia">
                        <i class="fas fa-check"></i> ${periciaExistente ? 'Atualizar' : 'Adquirir'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('modal-pericia');
    if (modal) {
        modal.innerHTML = modalHTML;
    }
    
    // Show modal
    const modalOverlay = document.getElementById('modal-pericia-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        console.log('✅ Modal exibido');
    }
}

// ===== FUNÇÕES AUXILIARES SIMPLES =====
function diminuirNivelPericia() {
    if (estadoPericias.nivelPericia > -5) { // Limite mínimo
        estadoPericias.nivelPericia--;
        atualizarDisplayModal();
    }
}

function aumentarNivelPericia() {
    if (estadoPericias.nivelPericia < 10) { // Limite máximo
        estadoPericias.nivelPericia++;
        atualizarDisplayModal();
    }
}

function atualizarDisplayModal() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + estadoPericias.nivelPericia;
    
    // Update display
    const nivelElement = document.getElementById('modal-nivel-valor');
    const nhElement = document.getElementById('modal-nh-valor');
    const nhCalculoElement = document.getElementById('modal-nh-calculo');
    
    if (nivelElement) nivelElement.textContent = `${estadoPericias.nivelPericia >= 0 ? '+' : ''}${estadoPericias.nivelPericia}`;
    if (nhElement) nhElement.textContent = nhAtual;
    if (nhCalculoElement) nhCalculoElement.textContent = `(${atributoBase} + ${estadoPericias.nivelPericia >= 0 ? '+' : ''}${estadoPericias.nivelPericia})`;
    
    // Simple cost calculation
    const custoBase = pericia.custoBase || 2;
    const multiplicador = estadoPericias.nivelPericia >= 0 ? estadoPericias.nivelPericia + 1 : 1;
    const custoTotal = custoBase * multiplicador;
    
    const custoElement = document.getElementById('modal-custo-valor');
    const custoTotalElement = document.getElementById('modal-custo-total');
    
    if (custoElement) custoElement.textContent = custoBase;
    if (custoTotalElement) custoTotalElement.textContent = custoTotal;
}

function confirmarPericia() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const nivel = estadoPericias.nivelPericia;
    const periciaExistente = estadoPericias.periciaEditando;
    
    // Simple cost calculation
    const custoBase = pericia.custoBase || 2;
    const multiplicador = nivel >= 0 ? nivel + 1 : 1;
    const custoTotal = custoBase * multiplicador;
    
    if (periciaExistente) {
        // Update existing
        const index = estadoPericias.periciasAprendidas.indexOf(periciaExistente);
        estadoPericias.periciasAprendidas[index] = {
            ...periciaExistente,
            nivel: nivel,
            custo: custoTotal,
            investimentoAcumulado: (periciaExistente.investimentoAcumulado || 0) + custoTotal
        };
    } else {
        // Add new
        estadoPericias.periciasAprendidas.push({
            id: pericia.id,
            nome: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: custoTotal,
            investimentoAcumulado: custoTotal,
            categoria: pericia.categoria || 'Geral',
            descricao: pericia.descricao
        });
    }
    
    // Save and update UI
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
    fecharModalPericia();
    
    alert(`✅ Perícia ${pericia.nome} ${periciaExistente ? 'atualizada' : 'adquirida'}!`);
}

function fecharModalPericia() {
    const modalOverlay = document.getElementById('modal-pericia-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoPericias.modalPericiaAtiva = null;
    estadoPericias.periciaEditando = null;
    estadoPericias.nivelPericia = 0;
}

// ===== EXPORTAR FUNÇÕES =====
window.initPericiasTab = initPericiasTab;
window.abrirModalPericia = abrirModalPericia;
window.fecharModalPericia = fecharModalPericia;
window.diminuirNivelPericia = diminuirNivelPericia;
window.aumentarNivelPericia = aumentarNivelPericia;
window.confirmarPericia = confirmarPericia;

console.log('✅ Sistema de Perícias (versão simplificada) carregado!');

// ===== CONFIGURAR SUB-ABAS =====
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
                if (subtab === 'tecnicas') {
                    setTimeout(() => {
                        if (typeof window.initTecnicasTab === 'function') {
                            window.initTecnicasTab();
                        }
                    }, 100);
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
        btnInicial.click();
    }
}

// ===== CARREGAR DADOS =====
function carregarDadosSalvos() {
    const dadosSalvos = localStorage.getItem('gurps_pericias');
    if (dadosSalvos) {
        try {
            const dados = JSON.parse(dadosSalvos);
            estadoPericias.periciasAprendidas = dados.periciasAprendidas || [];
            estadoPericias.pontosPericias = dados.pontosTotais || 0;
        } catch (e) {
            console.error('Erro ao carregar perícias:', e);
        }
    }
}

// ===== SALVAR DADOS =====
function salvarDados() {
    const dados = {
        periciasAprendidas: estadoPericias.periciasAprendidas,
        pontosTotais: estadoPericias.pontosPericias + estadoPericias.pontosCombate,
        dataSalvamento: new Date().toISOString()
    };
    
    localStorage.setItem('gurps_pericias', JSON.stringify(dados));
}

// ===== FUNÇÕES DE FILTRO =====
function filtrarPor(filtro) {
    estadoPericias.filtroAtivo = filtro;
    
    // Atualiza botões de filtro
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.filtro === filtro) {
            btn.classList.add('active');
        }
    });
    
    // Atualiza catálogo
    renderizarCatalogo();
}

// ===== TABELA DE CUSTOS =====
function obterTabelaCusto(dificuldade) {
    const tabela = {
        'Fácil': [
            { nivel: 0, custo: 1 }, { nivel: 1, custo: 2 }, { nivel: 2, custo: 4 },
            { nivel: 3, custo: 8 }, { nivel: 4, custo: 12 }, { nivel: 5, custo: 16 },
            { nivel: 6, custo: 20 }, { nivel: 7, custo: 24 }, { nivel: 8, custo: 28 },
            { nivel: 9, custo: 32 }, { nivel: 10, custo: 36 }
        ],
        'Média': [
            { nivel: -1, custo: 1 }, { nivel: 0, custo: 2 }, { nivel: 1, custo: 4 },
            { nivel: 2, custo: 8 }, { nivel: 3, custo: 12 }, { nivel: 4, custo: 16 },
            { nivel: 5, custo: 20 }, { nivel: 6, custo: 24 }, { nivel: 7, custo: 28 },
            { nivel: 8, custo: 32 }, { nivel: 9, custo: 36 }, { nivel: 10, custo: 40 }
        ],
        'Difícil': [
            { nivel: -2, custo: 1 }, { nivel: -1, custo: 2 }, { nivel: 0, custo: 4 },
            { nivel: 1, custo: 8 }, { nivel: 2, custo: 12 }, { nivel: 3, custo: 16 },
            { nivel: 4, custo: 20 }, { nivel: 5, custo: 24 }, { nivel: 6, custo: 28 },
            { nivel: 7, custo: 32 }, { nivel: 8, custo: 36 }, { nivel: 9, custo: 40 },
            { nivel: 10, custo: 44 }
        ],
        'Muito Difícil': [
            { nivel: -3, custo: 1 }, { nivel: -2, custo: 2 }, { nivel: -1, custo: 4 },
            { nivel: 0, custo: 8 }, { nivel: 1, custo: 12 }, { nivel: 2, custo: 16 },
            { nivel: 3, custo: 20 }, { nivel: 4, custo: 24 }, { nivel: 5, custo: 28 },
            { nivel: 6, custo: 32 }, { nivel: 7, custo: 36 }, { nivel: 8, custo: 40 },
            { nivel: 9, custo: 44 }, { nivel: 10, custo: 48 }
        ]
    };
    
    return tabela[dificuldade] || tabela['Média'];
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
        const custo = pericia.custo || pericia.investimentoAcumulado || 0;
        const atributo = pericia.atributo;
        
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
        if (pericia.categoria === 'Combate' || pericia.tipo === 'combate') {
            estadoPericias.pontosCombate += custo;
            estadoPericias.totalCombate++;
        } else {
            estadoPericias.pontosPericias += custo;
        }
        
        estadoPericias.totalPericias++;
    });
    
    // Update display
    renderizarStatusDisplay();
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
    if (!container) return;
    
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
    
    estadoPericias.periciasAprendidas.forEach(pericia => {
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + (pericia.nivel || 0);
        
        const periciaElement = document.createElement('div');
        periciaElement.className = 'pericia-aprendida-item';
        
        let nomeDisplay = pericia.nome;
        if (pericia.especializacao) {
            nomeDisplay += ` <span class="pericia-especializacao">(${pericia.especializacao})</span>`;
        }
        
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
            <button class="btn-remover-pericia" data-id="${pericia.id}">
                <i class="fas fa-times"></i> Remover
            </button>
        `;
        
        periciaElement.innerHTML = html;
        
        // Add event listener for remove button
        const btnRemover = periciaElement.querySelector('.btn-remover-pericia');
        if (btnRemover) {
            btnRemover.addEventListener('click', (e) => {
                e.stopPropagation();
                removerPericia(pericia.id);
            });
        }
        
        // Add click to edit
        periciaElement.addEventListener('click', () => {
            const periciaOriginal = window.buscarPericiaPorId ? window.buscarPericiaPorId(pericia.id) : null;
            if (periciaOriginal) {
                abrirModalPericia(periciaOriginal, pericia);
            }
        });
        
        container.appendChild(periciaElement);
    });
}

// ===== MODAL DE ESPECIALIZAÇÃO =====
function abrirModalEspecializacao(pericia) {
    estadoPericias.modalEspecializacaoAtiva = pericia;
    
    // Get specializations from catalog
    const especializacoes = window.obterEspecializacoes ? 
        window.obterEspecializacoes(pericia.grupo || pericia.nome) : [];
    
    const modal = document.getElementById('modal-especializacao');
    if (!modal) return;
    
    let especializacoesHTML = '';
    if (especializacoes.length > 0) {
        especializacoesHTML = especializacoes.map(espec => `
            <div class="especializacao-item" data-id="${espec.id}" onclick="selecionarEspecializacao('${espec.id}')">
                <div class="especializacao-header">
                    <div class="especializacao-nome">${espec.nome}</div>
                    <div class="especializacao-custo">${espec.custoBase || 2} pts</div>
                </div>
                <div class="especializacao-descricao">${espec.descricao || ''}</div>
                ${espec.default ? `<div class="especializacao-default">Default: ${espec.default}</div>` : ''}
            </div>
        `).join('');
    } else {
        especializacoesHTML = `
            <div class="no-especializacoes">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Nenhuma especialização disponível para este grupo.</p>
                <button class="btn-digitar-especializacao" onclick="digitarEspecializacaoPersonalizada()">
                    <i class="fas fa-edit"></i> Digitar Especialização
                </button>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div class="modal-especializacao-content">
            <div class="modal-especializacao-header">
                <h3><i class="fas fa-star"></i> Especialização: ${pericia.nome}</h3>
                <button class="modal-especializacao-close" onclick="fecharModalEspecializacao()">&times;</button>
            </div>
            
            <div class="modal-especializacao-body">
                <div class="modal-especializacao-descricao">
                    <p>Selecione uma especialização para ${pericia.nome}:</p>
                </div>
                
                <div class="especializacoes-grid" id="especializacoes-grid">
                    ${especializacoesHTML}
                </div>
                
                <div class="especializacao-personalizada" id="especializacao-personalizada" style="display: none;">
                    <h4>Especialização Personalizada</h4>
                    <input type="text" id="input-especializacao-personalizada" 
                           placeholder="Digite o nome da especialização...">
                    <button class="btn-confirmar-especializacao" onclick="confirmarEspecializacaoPersonalizada()">
                        <i class="fas fa-check"></i> Confirmar
                    </button>
                </div>
            </div>
            
            <div class="modal-especializacao-footer">
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancelar" onclick="fecharModalEspecializacao()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-modal btn-modal-confirmar" onclick="confirmarEspecializacao()" id="btn-confirmar-especializacao" disabled>
                        <i class="fas fa-check"></i> Confirmar Especialização
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalOverlay = document.getElementById('modal-especializacao-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
    }
}

function selecionarEspecializacao(id) {
    estadoPericias.especializacaoSelecionada = id;
    
    // Update UI
    document.querySelectorAll('.especializacao-item').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.id === id) {
            item.classList.add('selected');
        }
    });
    
    const btnConfirmar = document.getElementById('btn-confirmar-especializacao');
    if (btnConfirmar) btnConfirmar.disabled = false;
}

function digitarEspecializacaoPersonalizada() {
    estadoPericias.especializacaoSelecionada = 'personalizado';
    const container = document.getElementById('especializacao-personalizada');
    if (container) container.style.display = 'block';
    
    const btnConfirmar = document.getElementById('btn-confirmar-especializacao');
    if (btnConfirmar) btnConfirmar.disabled = false;
}

function confirmarEspecializacaoPersonalizada() {
    const input = document.getElementById('input-especializacao-personalizada');
    if (!input) return;
    
    const nome = input.value.trim();
    
    if (!nome) {
        alert('Por favor, digite um nome para a especialização.');
        return;
    }
    
    confirmarPericiaComEspecializacao(nome);
}

function confirmarEspecializacao() {
    if (!estadoPericias.modalEspecializacaoAtiva || !estadoPericias.especializacaoSelecionada) {
        alert('Por favor, selecione uma especialização.');
        return;
    }
    
    if (estadoPericias.especializacaoSelecionada === 'personalizado') {
        confirmarEspecializacaoPersonalizada();
        return;
    }
    
    // Get specialization name from catalog
    const pericia = estadoPericias.modalEspecializacaoAtiva;
    const especializacoes = window.obterEspecializacoes ? 
        window.obterEspecializacoes(pericia.grupo || pericia.nome) : [];
    
    const especializacao = especializacoes.find(e => e.id === estadoPericias.especializacaoSelecionada);
    
    if (!especializacao) {
        alert('Especialização não encontrada.');
        return;
    }
    
    confirmarPericiaComEspecializacao(especializacao.nome);
}

function confirmarPericiaComEspecializacao(especializacaoNome) {
    const pericia = estadoPericias.modalEspecializacaoAtiva;
    const nivel = estadoPericias.nivelPericia;
    const periciaExistente = estadoPericias.periciaEditando;
    
    const skillId = `${pericia.id}-${especializacaoNome.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Simple cost calculation
    const custoBase = pericia.custoBase || 2;
    const multiplicador = nivel >= 0 ? nivel + 1 : 1;
    const custoTotal = custoBase * multiplicador;
    
    if (periciaExistente) {
        // Update existing
        const index = estadoPericias.periciasAprendidas.indexOf(periciaExistente);
        estadoPericias.periciasAprendidas[index] = {
            ...periciaExistente,
            id: skillId,
            especializacao: especializacaoNome,
            grupo: pericia.grupo || pericia.nome
        };
    } else {
        // Add new
        estadoPericias.periciasAprendidas.push({
            id: skillId,
            nome: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: custoTotal,
            investimentoAcumulado: custoTotal,
            categoria: pericia.categoria || 'Geral',
            descricao: pericia.descricao,
            grupo: pericia.grupo || pericia.nome,
            especializacao: especializacaoNome
        });
    }
    
    // Save and update UI
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
    fecharModalEspecializacao();
    
    alert(`✅ ${pericia.nome} (${especializacaoNome}) adquirida com sucesso!`);
}

function fecharModalEspecializacao() {
    const modalOverlay = document.getElementById('modal-especializacao-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoPericias.modalEspecializacaoAtiva = null;
    estadoPericias.especializacaoSelecionada = null;
}

// ===== FUNÇÕES AUXILIARES =====
function removerPericia(id) {
    if (!confirm('Tem certeza que deseja remover esta perícia?')) return;
    
    estadoPericias.periciasAprendidas = estadoPericias.periciasAprendidas.filter(p => p.id !== id);
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
    
    alert('🗑️ Perícia removida com sucesso!');
}

// ===== RENDERIZAR FILTROS =====
function renderizarFiltros() {
    const filtros = document.querySelectorAll('.filtro-btn');
    filtros.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filtro === estadoPericias.filtroAtivo);
    });
}

// ===== EXPORTAR FUNÇÕES RESTANTES =====
window.selecionarEspecializacao = selecionarEspecializacao;
window.confirmarEspecializacao = confirmarEspecializacao;
window.digitarEspecializacaoPersonalizada = digitarEspecializacaoPersonalizada;
window.confirmarEspecializacaoPersonalizada = confirmarEspecializacaoPersonalizada;
window.fecharModalEspecializacao = fecharModalEspecializacao;
window.removerPericia = removerPericia;

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Perícias carregado e pronto!');
    
    // Aguarda um momento para garantir que tudo está carregado
    setTimeout(() => {
        const periciasTab = document.getElementById('pericias');
        if (periciasTab && periciasTab.classList.contains('active')) {
            if (typeof window.initPericiasTab === 'function') {
                window.initPericiasTab();
            }
        }
    }, 500);
});

console.log('✅ Sistema de Perícias (versão completa) carregado!');