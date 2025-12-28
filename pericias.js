// ============================================
// SISTEMA DE PERÍCIAS - VERSÃO ATUALIZADA
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
    atributos: {
        DX: 10,
        IQ: 10,
        HT: 10,
        PERC: 10
    },
    modalPericiaAtiva: null,
    modalEspecializacaoAtiva: null,
    especializacaoSelecionada: null,
    nivelPericia: 0
};

// ===== INICIALIZAÇÃO =====
function initPericiasTab() {
    console.log('🎯 Inicializando sistema de perícias...');
    
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
    renderizarStatusPericias();
    renderizarFiltros();
    renderizarCatalogo();
    renderizarPericiasAprendidas();
    
    console.log('✅ Sistema de perícias inicializado');
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
    
    // Salva no Firebase se houver personagem ativo
    if (window.currentCharacterId && typeof window.saveDraft === 'function') {
        setTimeout(() => window.saveDraft(), 100);
    }
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventos() {
    // Busca
    document.getElementById('busca-pericias').addEventListener('input', (e) => {
        estadoPericias.buscaAtiva = e.target.value.toLowerCase();
        renderizarCatalogo();
    });
    
    // Filtros rápidos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            estadoPericias.filtroAtivo = btn.dataset.filtro;
            renderizarCatalogo();
        });
    });
    
    // Cards de estatísticas
    document.querySelectorAll('.stat-card').forEach(card => {
        card.addEventListener('click', () => {
            const filtro = card.dataset.filtro;
            filtrarPor(filtro);
        });
    });
    
    // Modal overlay
    document.querySelector('.modal-pericia-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            fecharModalPericia();
        }
    });
    
    document.querySelector('.modal-especializacao-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            fecharModalEspecializacao();
        }
    });
    
    // Tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            fecharModalPericia();
            fecharModalEspecializacao();
        }
    });
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

// ===== OBTER ATRIBUTOS ATUAIS =====
function obterAtributoAtual(atributo) {
    // Tenta obter dos atributos da aba de atributos
    if (window.obterAtributoPrincipal) {
        return window.obterAtributoPrincipal(atributo) || 10;
    }
    
    // Fallback para valores padrão
    return estadoPericias.atributos[atributo] || 10;
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
    document.getElementById('qtd-total').textContent = estadoPericias.totalPericias;
    document.getElementById('pts-total').textContent = `(${estadoPericias.pontosPericias + estadoPericias.pontosCombate} pts)`;
    
    document.getElementById('qtd-dx').textContent = estadoPericias.totalDX;
    document.getElementById('pts-dx').textContent = `(${estadoPericias.pontosDX} pts)`;
    
    document.getElementById('qtd-iq').textContent = estadoPericias.totalIQ;
    document.getElementById('pts-iq').textContent = `(${estadoPericias.pontosIQ} pts)`;
    
    document.getElementById('qtd-ht').textContent = estadoPericias.totalHT;
    document.getElementById('pts-ht').textContent = `(${estadoPericias.pontosHT} pts)`;
    
    document.getElementById('qtd-perc').textContent = estadoPericias.totalPERC;
    document.getElementById('pts-perc').textContent = `(${estadoPericias.pontosPERC} pts)`;
    
    document.getElementById('qtd-combate').textContent = estadoPericias.totalCombate;
    document.getElementById('pts-combate').textContent = `(${estadoPericias.pontosCombate} pts)`;
    
    // Update main badge
    const totalPontos = estadoPericias.pontosPericias + estadoPericias.pontosCombate;
    document.getElementById('pontos-pericias-total').textContent = `[${totalPontos} pts]`;
    
    // Update learned skills summary
    document.getElementById('total-pericias').textContent = estadoPericias.totalPericias;
    document.getElementById('pontos-total').textContent = totalPontos + ' pts';
    document.getElementById('pontos-aprendidas').textContent = totalPontos + ' pts';
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
        document.getElementById('contador-pericias').textContent = '0';
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
        
        periciaElement.addEventListener('click', () => {
            abrirModalPericia(pericia);
        });
        
        container.appendChild(periciaElement);
    });
    
    document.getElementById('contador-pericias').textContent = periciasFiltradas.length;
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
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            removerPericia(pericia.id);
        });
        
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

// ===== MODAL DE PERÍCIA =====
function abrirModalPericia(pericia, periciaExistente = null) {
    estadoPericias.modalPericiaAtiva = pericia;
    
    // Determine initial level
    let nivelInicial = 0;
    if (periciaExistente) {
        nivelInicial = periciaExistente.nivel || 0;
    } else {
        // Default to first level in cost table
        const tabela = obterTabelaCusto(pericia.dificuldade);
        if (tabela && tabela.length > 0) {
            nivelInicial = tabela[0].nivel;
        }
    }
    
    estadoPericias.nivelPericia = nivelInicial;
    
    // Get available levels
    const niveisDisponiveis = getNiveisDisponiveis(pericia.dificuldade, periciaExistente);
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + nivelInicial;
    
    // Create modal content
    const modal = document.querySelector('.modal-pericia');
    modal.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-book-open"></i> ${pericia.nome}</h3>
            <button class="modal-close" onclick="fecharModalPericia()">&times;</button>
        </div>
        
        <div class="modal-body">
            <div class="modal-info-grid">
                <div class="info-card">
                    <div class="info-label">Atributo/Dificuldade</div>
                    <div class="info-value">${pericia.atributo}/${pericia.dificuldade}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Categoria</div>
                    <div class="info-value">${pericia.categoria || 'Geral'}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Custo Base</div>
                    <div class="info-value">${pericia.custoBase || 'Varia'} pontos</div>
                </div>
            </div>
            
            <div class="modal-descricao">
                <h4>Descrição</h4>
                <p>${pericia.descricao || 'Sem descrição disponível.'}</p>
            </div>
            
            ${pericia.default ? `
            <div class="modal-default">
                <h4>Default</h4>
                <p>${pericia.default}</p>
            </div>
            ` : ''}
            
            <div class="modal-controles">
                <div class="nivel-selecao">
                    <h4>Selecionar Nível</h4>
                    <div class="nivel-options">
                        ${niveisDisponiveis.map(nivel => `
                            <div class="nivel-option ${nivel.nivel === nivelInicial ? 'selected' : ''}" 
                                 data-nivel="${nivel.nivel}"
                                 onclick="selecionarNivelPericia(${nivel.nivel})">
                                <div class="nivel-valor">${nivel.nivel >= 0 ? '+' : ''}${nivel.nivel}</div>
                                <div class="nivel-custo">${nivel.custo} ponto${nivel.custo !== 1 ? 's' : ''}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="nh-calculado">
                    <h4>Número de Habilidade (NH)</h4>
                    <div class="nh-display">
                        <span class="nh-valor" id="nh-modal-valor">${nhAtual}</span>
                        <span class="nh-detalhes" id="nh-modal-detalhes">
                            ${atributoBase} (${pericia.atributo}) + ${nivelInicial >= 0 ? '+' : ''}${nivelInicial}
                        </span>
                    </div>
                </div>
            </div>
            
            ${pericia.tipo === 'grupo-especializacao' || pericia.grupo ? `
            <div class="modal-especializacao-nota">
                <i class="fas fa-info-circle"></i>
                Esta perícia requer especialização. Você poderá escolher após confirmar.
            </div>
            ` : ''}
        </div>
        
        <div class="modal-footer">
            <div class="custo-total">
                <span>Custo Total:</span>
                <span class="custo-valor" id="custo-modal-total">0</span>
                <span>pontos</span>
            </div>
            <div class="modal-actions">
                <button class="btn-modal btn-cancelar" onclick="fecharModalPericia()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button class="btn-modal btn-confirmar" onclick="confirmarPericia()" id="btn-confirmar-pericia">
                    <i class="fas fa-check"></i> ${periciaExistente ? 'Atualizar' : 'Adquirir'}
                </button>
            </div>
        </div>
    `;
    
    // Show modal
    document.querySelector('.modal-pericia-overlay').style.display = 'flex';
    
    // Update cost
    atualizarCustoModal();
}

function selecionarNivelPericia(nivel) {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    estadoPericias.nivelPericia = nivel;
    
    // Update selected state
    document.querySelectorAll('.nivel-option').forEach(opt => {
        opt.classList.remove('selected');
        if (parseInt(opt.dataset.nivel) === nivel) {
            opt.classList.add('selected');
        }
    });
    
    // Update NH display
    const pericia = estadoPericias.modalPericiaAtiva;
    const atributoBase = obterAtributoAtual(pericia.atributo);
    const nhAtual = atributoBase + nivel;
    
    document.getElementById('nh-modal-valor').textContent = nhAtual;
    document.getElementById('nh-modal-detalhes').textContent = 
        `${atributoBase} (${pericia.atributo}) + ${nivel >= 0 ? '+' : ''}${nivel}`;
    
    // Update cost
    atualizarCustoModal();
}

function atualizarCustoModal() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const nivel = estadoPericias.nivelPericia;
    const periciaExistente = estadoPericias.periciasAprendidas.find(p => p.id === pericia.id);
    
    const infoEvolucao = obterInfoEvolucao(periciaExistente, nivel, pericia.dificuldade);
    
    const custoElement = document.getElementById('custo-modal-total');
    const btnConfirmar = document.getElementById('btn-confirmar-pericia');
    
    if (infoEvolucao) {
        if (infoEvolucao.jaPossui) {
            custoElement.textContent = '0';
            custoElement.className = 'custo-valor custo-zero';
            if (btnConfirmar) {
                btnConfirmar.disabled = true;
                btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Já Possui';
            }
        } else if (infoEvolucao.ehEvolucao) {
            custoElement.textContent = `+${infoEvolucao.custoAPagar}`;
            custoElement.className = 'custo-valor custo-evolucao';
            if (btnConfirmar) {
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = `<i class="fas fa-arrow-up"></i> Evoluir (+${infoEvolucao.custoAPagar} pts)`;
            }
        } else {
            custoElement.textContent = infoEvolucao.custoAPagar;
            custoElement.className = 'custo-valor custo-novo';
            if (btnConfirmar) {
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = `<i class="fas fa-plus"></i> Adquirir (${infoEvolucao.custoAPagar} pts)`;
            }
        }
    }
}

function getNiveisDisponiveis(dificuldade, periciaEditando = null) {
    const tabela = obterTabelaCusto(dificuldade);
    
    if (!periciaEditando) {
        return tabela.map(item => ({
            nivel: item.nivel,
            custo: item.custo,
            texto: `${item.nivel >= 0 ? '+' : ''}${item.nivel} (${item.custo} ponto${item.custo !== 1 ? 's' : ''})`
        }));
    }
    
    const nivelAtual = periciaEditando.nivel || 0;
    const niveisDisponiveis = [];
    
    // Add current level
    const entradaAtual = tabela.find(item => item.nivel === nivelAtual);
    if (entradaAtual) {
        niveisDisponiveis.push({
            nivel: nivelAtual,
            custo: entradaAtual.custo,
            texto: `${nivelAtual >= 0 ? '+' : ''}${nivelAtual} (Atual)`,
            ehAtual: true
        });
    }
    
    // Add higher levels
    tabela.forEach(item => {
        if (item.nivel > nivelAtual) {
            niveisDisponiveis.push({
                nivel: item.nivel,
                custo: item.custo,
                diferenca: item.custo - (entradaAtual ? entradaAtual.custo : 0),
                texto: `${item.nivel >= 0 ? '+' : ''}${item.nivel} (+${item.custo - (entradaAtual ? entradaAtual.custo : 0)} pontos)`,
                ehEvolucao: true
            });
        }
    });
    
    return niveisDisponiveis;
}

function obterInfoEvolucao(periciaEditando = null, nivelDesejado, dificuldade) {
    const tabelaCusto = obterTabelaCusto(dificuldade);
    const entradaDesejada = tabelaCusto.find(item => item.nivel === nivelDesejado);
    
    if (!entradaDesejada) return null;
    
    if (!periciaEditando) {
        return {
            nivelDesejado: nivelDesejado,
            custoTotal: entradaDesejada.custo,
            custoAPagar: entradaDesejada.custo,
            ehNovaPericia: true,
            ehEvolucao: false,
            jaPossui: false
        };
    }
    
    const nivelAtual = periciaEditando.nivel || 0;
    
    if (nivelDesejado <= nivelAtual) {
        return {
            nivelDesejado: nivelDesejado,
            nivelAtual: nivelAtual,
            custoTotal: entradaDesejada.custo,
            custoAPagar: 0,
            ehNovaPericia: false,
            ehEvolucao: false,
            jaPossui: true
        };
    }
    
    const entradaAtual = tabelaCusto.find(item => item.nivel === nivelAtual);
    const custoAtual = entradaAtual ? entradaAtual.custo : 0;
    const custoAPagar = entradaDesejada.custo - custoAtual;
    
    return {
        nivelDesejado: nivelDesejado,
        nivelAtual: nivelAtual,
        custoTotal: entradaDesejada.custo,
        custoAPagar: custoAPagar,
        investimentoAtual: custoAtual,
        ehNovaPericia: false,
        ehEvolucao: custoAPagar > 0,
        jaPossui: false
    };
}

// ===== CONFIRMAR PERÍCIA =====
function confirmarPericia() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const nivel = estadoPericias.nivelPericia;
    
    // Check if this is a specialization group
    if (pericia.tipo === 'grupo-especializacao' || pericia.grupo) {
        abrirModalEspecializacao(pericia);
        return;
    }
    
    const periciaExistente = estadoPericias.periciasAprendidas.find(p => p.id === pericia.id);
    const infoEvolucao = obterInfoEvolucao(periciaExistente, nivel, pericia.dificuldade);
    
    if (!infoEvolucao || infoEvolucao.jaPossui) {
        fecharModalPericia();
        return;
    }
    
    // Add or update skill
    if (periciaExistente) {
        // Update existing
        const index = estadoPericias.periciasAprendidas.indexOf(periciaExistente);
        estadoPericias.periciasAprendidas[index] = {
            ...periciaExistente,
            nivel: nivel,
            custo: infoEvolucao.custoAPagar,
            investimentoAcumulado: (periciaExistente.investimentoAcumulado || 0) + infoEvolucao.custoAPagar
        };
    } else {
        // Add new
        estadoPericias.periciasAprendidas.push({
            id: pericia.id,
            nome: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: infoEvolucao.custoAPagar,
            investimentoAcumulado: infoEvolucao.custoAPagar,
            categoria: pericia.categoria || 'Geral',
            descricao: pericia.descricao,
            default: pericia.default,
            prereq: pericia.prereq,
            grupo: pericia.grupo,
            especializacao: pericia.especializacao
        });
    }
    
    // Save and update UI
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
    fecharModalPericia();
    
    // Show success message
    showToastPericia('✅ Perícia ' + (periciaExistente ? 'atualizada' : 'adquirida') + ' com sucesso!');
}

// ===== MODAL DE ESPECIALIZAÇÃO =====
function abrirModalEspecializacao(pericia) {
    estadoPericias.modalEspecializacaoAtiva = pericia;
    
    // Get specializations from catalog
    const especializacoes = window.obterEspecializacoesPorGrupo ? 
        window.obterEspecializacoesPorGrupo(pericia.grupo || pericia.nome) : [];
    
    const modal = document.querySelector('.modal-especializacao');
    modal.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-star"></i> Especialização: ${pericia.nome}</h3>
            <button class="modal-close" onclick="fecharModalEspecializacao()">&times;</button>
        </div>
        
        <div class="modal-body">
            <div class="modal-descricao">
                <p>Selecione uma especialização para ${pericia.nome}:</p>
            </div>
            
            <div class="especializacoes-grid">
                ${especializacoes.map(espec => `
                    <div class="especializacao-item" data-id="${espec.id}" onclick="selecionarEspecializacao('${espec.id}')">
                        <div class="especializacao-header">
                            <div class="especializacao-nome">${espec.nome}</div>
                            <div class="especializacao-custo">${espec.custoBase || 2} pts</div>
                        </div>
                        <div class="especializacao-descricao">${espec.descricao || ''}</div>
                        ${espec.default ? `<div class="especializacao-default">Default: ${espec.default}</div>` : ''}
                    </div>
                `).join('')}
                
                ${especializacoes.length === 0 ? `
                    <div class="no-especializacoes">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Nenhuma especialização disponível para este grupo.</p>
                        <button class="btn-digitar-especializacao" onclick="digitarEspecializacaoPersonalizada()">
                            <i class="fas fa-edit"></i> Digitar Especialização
                        </button>
                    </div>
                ` : ''}
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
        
        <div class="modal-footer">
            <div class="modal-actions">
                <button class="btn-modal btn-cancelar" onclick="fecharModalEspecializacao()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button class="btn-modal btn-confirmar" id="btn-confirmar-especializacao" onclick="confirmarEspecializacao()" disabled>
                    <i class="fas fa-check"></i> Confirmar Especialização
                </button>
            </div>
        </div>
    `;
    
    document.querySelector('.modal-especializacao-overlay').style.display = 'flex';
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
    
    document.getElementById('btn-confirmar-especializacao').disabled = false;
}

function digitarEspecializacaoPersonalizada() {
    estadoPericias.especializacaoSelecionada = 'personalizado';
    document.getElementById('especializacao-personalizada').style.display = 'block';
    document.getElementById('btn-confirmar-especializacao').disabled = false;
}

function confirmarEspecializacaoPersonalizada() {
    const input = document.getElementById('input-especializacao-personalizada');
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
    const especializacoes = window.obterEspecializacoesPorGrupo ? 
        window.obterEspecializacoesPorGrupo(pericia.grupo || pericia.nome) : [];
    
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
    
    // Add skill with specialization
    estadoPericias.periciasAprendidas.push({
        id: `${pericia.id}-${especializacaoNome.toLowerCase().replace(/\s+/g, '-')}`,
        nome: pericia.nome,
        atributo: pericia.atributo,
        dificuldade: pericia.dificuldade,
        nivel: nivel,
        custo: 2, // Base cost for specialized skills
        investimentoAcumulado: 2,
        categoria: pericia.categoria || 'Geral',
        descricao: pericia.descricao,
        grupo: pericia.grupo || pericia.nome,
        especializacao: especializacaoNome
    });
    
    // Save and update UI
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
    fecharModalEspecializacao();
    
    showToastPericia(`✅ ${pericia.nome} (${especializacaoNome}) adquirida com sucesso!`);
}

// ===== FUNÇÕES AUXILIARES =====
function removerPericia(id) {
    if (!confirm('Tem certeza que deseja remover esta perícia?')) return;
    
    estadoPericias.periciasAprendidas = estadoPericias.periciasAprendidas.filter(p => p.id !== id);
    salvarDados();
    atualizarEstatisticas();
    renderizarPericiasAprendidas();
    renderizarCatalogo();
    
    showToastPericia('🗑️ Perícia removida com sucesso!');
}

function fecharModalPericia() {
    document.querySelector('.modal-pericia-overlay').style.display = 'none';
    estadoPericias.modalPericiaAtiva = null;
    estadoPericias.nivelPericia = 0;
}

function fecharModalEspecializacao() {
    document.querySelector('.modal-especializacao-overlay').style.display = 'none';
    estadoPericias.modalEspecializacaoAtiva = null;
    estadoPericias.especializacaoSelecionada = null;
}

function showToastPericia(mensagem) {
    if (window.showToast) {
        window.showToast(mensagem, 'success');
    } else {
        alert(mensagem);
    }
}

// ===== RENDERIZAR FILTROS =====
function renderizarFiltros() {
    const filtros = document.querySelectorAll('.filtro-btn');
    filtros.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filtro === estadoPericias.filtroAtivo);
    });
}

// ===== EXPORTAR FUNÇÕES =====
window.initPericiasTab = initPericiasTab;
window.filtrarPor = filtrarPor;
window.abrirModalPericia = abrirModalPericia;
window.fecharModalPericia = fecharModalPericia;
window.fecharModalEspecializacao = fecharModalEspecializacao;
window.selecionarNivelPericia = selecionarNivelPericia;
window.selecionarEspecializacao = selecionarEspecializacao;
window.confirmarEspecializacao = confirmarEspecializacao;
window.digitarEspecializacaoPersonalizada = digitarEspecializacaoPersonalizada;
window.confirmarEspecializacaoPersonalizada = confirmarEspecializacaoPersonalizada;

console.log('✅ Sistema de Perícias carregado!');