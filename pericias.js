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

// ===== CONFIGURAR SUB-ABAS =====
function configurarSubAbasPericias() {
    console.log('🔄 Configurando sub-abas de perícias...');
    
    const subTabBtns = document.querySelectorAll('.subtab-btn-pericias');
    const subTabPanes = document.querySelectorAll('.subtab-pane-pericias');
    
    subTabBtns.forEach(btn => {
        // Remove event listeners antigos
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        // Adiciona novo event listener
        newBtn.addEventListener('click', () => {
            const subtab = newBtn.dataset.subtab;
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
            newBtn.classList.add('active');
            
            // Mostra o painel correspondente
            const pane = document.getElementById(`subtab-${subtab}`);
            if (pane) {
                pane.classList.add('active');
                
                // Se for a aba de técnicas, inicializa ela
                if (subtab === 'tecnicas') {
                    setTimeout(() => {
                        if (typeof window.initTecnicasTab === 'function') {
                            window.initTecnicasTab();
                        } else {
                            console.log('⚠️ Sistema de técnicas não carregado');
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
    
    // Salva no Firebase se houver personagem ativo
    if (window.currentCharacterId && typeof window.saveDraft === 'function') {
        setTimeout(() => window.saveDraft(), 100);
    }
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
    
    console.log('✅ Eventos configurados');
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
    
    console.log(`Filtro aplicado: ${filtro}`);
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
        
        // EVENT LISTENER SIMPLIFICADO E CORRETO
        periciaElement.addEventListener('click', function() {
            console.log(`🔵 Clicou na perícia: ${pericia.nome}`);
            abrirModalPericia(pericia);
        });
        
        container.appendChild(periciaElement);
    });
    
    const contador = document.getElementById('contador-pericias');
    if (contador) contador.textContent = periciasFiltradas.length;
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
                estadoPericias.periciaEditando = pericia;
                abrirModalPericia(periciaOriginal, pericia);
            }
        });
        
        container.appendChild(periciaElement);
    });
}

// ===== MODAL DE PERÍCIA - VERSÃO SIMPLIFICADA E FUNCIONAL =====
function abrirModalPericia(pericia, periciaExistente = null) {
    console.log(`🟢 Abrindo modal para: ${pericia.nome}`);
    
    estadoPericias.modalPericiaAtiva = pericia;
    estadoPericias.periciaEditando = periciaExistente;
    
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
    
    // Get the template
    const template = document.getElementById('template-modal-pericia');
    if (!template) {
        console.error('❌ Template do modal não encontrado!');
        return;
    }
    
    // Clone the template
    const modalContent = document.importNode(template.content, true);
    
    // Fill in the data
    modalContent.querySelector('.modal-pericia-nome').textContent = pericia.nome;
    modalContent.querySelector('.modal-pericia-atributo').textContent = `${pericia.atributo}/${pericia.dificuldade}`;
    modalContent.querySelector('.modal-pericia-categoria').textContent = pericia.categoria || 'Geral';
    modalContent.querySelector('.modal-pericia-custo').textContent = `${pericia.custoBase || 'Varia'} pontos`;
    modalContent.querySelector('.modal-pericia-descricao-texto').textContent = pericia.descricao || 'Sem descrição disponível.';
    
    // Show default if exists
    if (pericia.default) {
        const defaultSection = modalContent.querySelector('.modal-pericia-default');
        defaultSection.style.display = 'block';
        modalContent.querySelector('.modal-pericia-default-texto').textContent = pericia.default;
    }
    
    // Set initial values
    modalContent.querySelector('#modal-nivel-valor').textContent = `${nivelInicial >= 0 ? '+' : ''}${nivelInicial}`;
    modalContent.querySelector('#modal-nh-valor').textContent = nhAtual;
    modalContent.querySelector('#modal-nh-calculo').textContent = `(${atributoBase} + ${nivelInicial >= 0 ? '+' : ''}${nivelInicial})`;
    
    // Calculate initial cost
    const infoEvolucao = obterInfoEvolucao(periciaExistente, nivelInicial, pericia.dificuldade);
    if (infoEvolucao) {
        modalContent.querySelector('#modal-custo-valor').textContent = infoEvolucao.custoAPagar || 0;
        modalContent.querySelector('#modal-custo-total').textContent = infoEvolucao.custoTotal || 0;
        
        const btnConfirmar = modalContent.querySelector('#btn-confirmar-pericia');
        if (btnConfirmar) {
            if (infoEvolucao.jaPossui) {
                btnConfirmar.disabled = true;
                btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Já Possui';
            } else if (periciaExistente) {
                btnConfirmar.innerHTML = `<i class="fas fa-sync-alt"></i> Atualizar (${infoEvolucao.custoAPagar} pts)`;
            } else {
                btnConfirmar.innerHTML = `<i class="fas fa-plus"></i> Adquirir (${infoEvolucao.custoAPagar} pts)`;
            }
        }
    }
    
    // Clear the modal and add new content
    const modal = document.getElementById('modal-pericia');
    if (modal) {
        modal.innerHTML = '';
        modal.appendChild(modalContent);
        
        // Add event listeners to buttons
        const btnDiminuir = modal.querySelector('.btn-diminuir');
        const btnAumentar = modal.querySelector('.btn-aumentar');
        
        if (btnDiminuir) {
            btnDiminuir.addEventListener('click', () => {
                diminuirNivelPericia();
            });
        }
        
        if (btnAumentar) {
            btnAumentar.addEventListener('click', () => {
                aumentarNivelPericia();
            });
        }
    }
    
    // Show modal
    const modalOverlay = document.getElementById('modal-pericia-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        console.log('✅ Modal exibido');
    } else {
        console.error('❌ Modal overlay não encontrado!');
    }
}

function diminuirNivelPericia() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const tabela = obterTabelaCusto(pericia.dificuldade);
    
    // Find current position
    const currentIndex = tabela.findIndex(item => item.nivel === estadoPericias.nivelPericia);
    if (currentIndex > 0) {
        estadoPericias.nivelPericia = tabela[currentIndex - 1].nivel;
        atualizarDisplayModal();
    }
}

function aumentarNivelPericia() {
    if (!estadoPericias.modalPericiaAtiva) return;
    
    const pericia = estadoPericias.modalPericiaAtiva;
    const tabela = obterTabelaCusto(pericia.dificuldade);
    
    // Find current position
    const currentIndex = tabela.findIndex(item => item.nivel === estadoPericias.nivelPericia);
    if (currentIndex < tabela.length - 1) {
        estadoPericias.nivelPericia = tabela[currentIndex + 1].nivel;
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
    
    // Update cost
    const periciaExistente = estadoPericias.periciaEditando;
    const infoEvolucao = obterInfoEvolucao(periciaExistente, estadoPericias.nivelPericia, pericia.dificuldade);
    
    const custoElement = document.getElementById('modal-custo-valor');
    const custoTotalElement = document.getElementById('modal-custo-total');
    const btnConfirmar = document.getElementById('btn-confirmar-pericia');
    
    if (infoEvolucao) {
        if (custoElement) custoElement.textContent = infoEvolucao.custoAPagar || 0;
        if (custoTotalElement) custoTotalElement.textContent = infoEvolucao.custoTotal || 0;
        
        if (btnConfirmar) {
            if (infoEvolucao.jaPossui) {
                btnConfirmar.disabled = true;
                btnConfirmar.innerHTML = '<i class="fas fa-check"></i> Já Possui';
            } else if (periciaExistente) {
                btnConfirmar.disabled = false;
                btnConfirmar.innerHTML = `<i class="fas fa-sync-alt"></i> Atualizar (${infoEvolucao.custoAPagar} pts)`;
            } else {
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
    const periciaExistente = estadoPericias.periciaEditando;
    
    // Check if this is a specialization group
    if (pericia.tipo === 'grupo-especializacao' || pericia.grupo) {
        abrirModalEspecializacao(pericia);
        return;
    }
    
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
    console.log(`🟢 Abrindo modal de especialização para: ${pericia.nome}`);
    
    estadoPericias.modalEspecializacaoAtiva = pericia;
    
    // Get specializations from catalog
    const especializacoes = window.obterEspecializacoes ? 
        window.obterEspecializacoes(pericia.grupo || pericia.nome) : [];
    
    // Get the template
    const template = document.getElementById('template-modal-especializacao');
    if (!template) {
        console.error('❌ Template do modal de especialização não encontrado!');
        return;
    }
    
    // Clone the template
    const modalContent = document.importNode(template.content, true);
    
    // Fill in the data
    modalContent.querySelector('.modal-especializacao-nome').textContent = `Especialização: ${pericia.nome}`;
    
    const listaElement = modalContent.getElementById('modal-especializacao-lista');
    if (listaElement) {
        if (especializacoes.length === 0) {
            listaElement.innerHTML = `
                <div class="no-especializacoes">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Nenhuma especialização disponível para este grupo.</p>
                    <button class="btn-digitar-especializacao" onclick="window.digitarEspecializacaoPersonalizada()">
                        <i class="fas fa-edit"></i> Digitar Especialização
                    </button>
                </div>
            `;
        } else {
            listaElement.innerHTML = especializacoes.map(espec => `
                <div class="especializacao-item" data-id="${espec.id}">
                    <div class="especializacao-header">
                        <div class="especializacao-nome">${espec.nome}</div>
                        <div class="especializacao-custo">${espec.custoBase || 2} pts</div>
                    </div>
                    ${espec.descricao ? `<div class="especializacao-descricao">${espec.descricao}</div>` : ''}
                    ${espec.default ? `<div class="especializacao-default">Default: ${espec.default}</div>` : ''}
                </div>
            `).join('');
            
            // Add event listeners to specialization items
            listaElement.querySelectorAll('.especializacao-item').forEach(item => {
                item.addEventListener('click', function() {
                    selecionarEspecializacao(this.dataset.id);
                });
            });
        }
    }
    
    // Clear the modal and add new content
    const modal = document.getElementById('modal-especializacao');
    if (modal) {
        modal.innerHTML = '';
        modal.appendChild(modalContent);
    }
    
    // Show modal
    const modalOverlay = document.getElementById('modal-especializacao-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'flex';
        console.log('✅ Modal de especialização exibido');
    }
}

function selecionarEspecializacao(id) {
    estadoPericias.especializacaoSelecionada = id;
    
    // Update UI
    const modal = document.getElementById('modal-especializacao');
    if (modal) {
        modal.querySelectorAll('.especializacao-item').forEach(item => {
            item.classList.remove('selected');
            if (item.dataset.id === id) {
                item.classList.add('selected');
            }
        });
    }
    
    const btnConfirmar = document.getElementById('btn-confirmar-especializacao');
    if (btnConfirmar) btnConfirmar.disabled = false;
}

function digitarEspecializacaoPersonalizada() {
    estadoPericias.especializacaoSelecionada = 'personalizado';
    const container = document.getElementById('modal-especializacao-personalizada');
    if (container) {
        container.style.display = 'block';
        container.querySelector('input').focus();
    }
    
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
    
    // Add or update skill with specialization
    const skillId = `${pericia.id}-${especializacaoNome.toLowerCase().replace(/\s+/g, '-')}`;
    
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
            custo: pericia.custoBase || 2,
            investimentoAcumulado: pericia.custoBase || 2,
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
    const modalOverlay = document.getElementById('modal-pericia-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoPericias.modalPericiaAtiva = null;
    estadoPericias.periciaEditando = null;
    estadoPericias.nivelPericia = 0;
    console.log('🔴 Modal de perícia fechado');
}

function fecharModalEspecializacao() {
    const modalOverlay = document.getElementById('modal-especializacao-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
    estadoPericias.modalEspecializacaoAtiva = null;
    estadoPericias.especializacaoSelecionada = null;
    console.log('🔴 Modal de especialização fechado');
}

function showToastPericia(mensagem) {
    if (window.showToast) {
        window.showToast(mensagem, 'success');
    } else {
        console.log('Toast:', mensagem);
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
window.diminuirNivelPericia = diminuirNivelPericia;
window.aumentarNivelPericia = aumentarNivelPericia;
window.selecionarEspecializacao = selecionarEspecializacao;
window.confirmarEspecializacao = confirmarEspecializacao;
window.digitarEspecializacaoPersonalizada = digitarEspecializacaoPersonalizada;
window.confirmarEspecializacaoPersonalizada = confirmarEspecializacaoPersonalizada;
window.confirmarPericia = confirmarPericia;
window.removerPericia = removerPericia;

// Inicialização automática quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Perícias carregado e pronto!');
    
    // Inicializa quando a aba de perícias é ativada
    if (typeof window.initPericiasTab === 'function') {
        // Aguarda um momento para garantir que tudo está carregado
        setTimeout(() => {
            const periciasTab = document.getElementById('pericias');
            if (periciasTab && periciasTab.classList.contains('active')) {
                window.initPericiasTab();
            }
        }, 500);
    }
});

console.log('✅ Sistema de Perícias carregado!');