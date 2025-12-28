// ============================================
// SISTEMA DE PERÍCIAS - COMPLETO E FUNCIONAL
// COM SINCRONIZAÇÃO EM TEMPO REAL
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
    nivelPericia: 0,
    periciaEditando: null
};

// ===== TABELA DE CUSTOS REAL DO GURPS =====
const TABELA_CUSTO_PERICIAS = {
    'Fácil': [
        { nivel: -1, custo: 0 },
        { nivel: 0, custo: 1 },
        { nivel: 1, custo: 2 },
        { nivel: 2, custo: 4 },
        { nivel: 3, custo: 8 },
        { nivel: 4, custo: 12 },
        { nivel: 5, custo: 16 },
        { nivel: 6, custo: 20 },
        { nivel: 7, custo: 24 },
        { nivel: 8, custo: 28 },
        { nivel: 9, custo: 32 },
        { nivel: 10, custo: 36 }
    ],
    'Média': [
        { nivel: -1, custo: 1 },
        { nivel: 0, custo: 2 },
        { nivel: 1, custo: 4 },
        { nivel: 2, custo: 8 },
        { nivel: 3, custo: 12 },
        { nivel: 4, custo: 16 },
        { nivel: 5, custo: 20 },
        { nivel: 6, custo: 24 },
        { nivel: 7, custo: 28 },
        { nivel: 8, custo: 32 },
        { nivel: 9, custo: 36 },
        { nivel: 10, custo: 40 }
    ],
    'Difícil': [
        { nivel: -2, custo: 1 },
        { nivel: -1, custo: 2 },
        { nivel: 0, custo: 4 },
        { nivel: 1, custo: 8 },
        { nivel: 2, custo: 12 },
        { nivel: 3, custo: 16 },
        { nivel: 4, custo: 20 },
        { nivel: 5, custo: 24 },
        { nivel: 6, custo: 28 },
        { nivel: 7, custo: 32 },
        { nivel: 8, custo: 36 },
        { nivel: 9, custo: 40 },
        { nivel: 10, custo: 44 }
    ],
    'Muito Difícil': [
        { nivel: -3, custo: 1 },
        { nivel: -2, custo: 2 },
        { nivel: -1, custo: 4 },
        { nivel: 0, custo: 8 },
        { nivel: 1, custo: 12 },
        { nivel: 2, custo: 16 },
        { nivel: 3, custo: 20 },
        { nivel: 4, custo: 24 },
        { nivel: 5, custo: 28 },
        { nivel: 6, custo: 32 },
        { nivel: 7, custo: 36 },
        { nivel: 8, custo: 40 },
        { nivel: 9, custo: 44 },
        { nivel: 10, custo: 48 }
    ]
};

// ===== SISTEMA DE SINCRONIZAÇÃO EM TEMPO REAL =====
let sincronizadorAtributos = null;

function iniciarSincronizacaoAtributos() {
    if (sincronizadorAtributos) {
        clearInterval(sincronizadorAtributos);
    }
    
    // Verifica mudanças nos atributos a cada 500ms
    sincronizadorAtributos = setInterval(() => {
        atualizarAtributosEmTempoReal();
    }, 500);
    
    console.log('🔄 Sincronizador de atributos iniciado');
}

function pararSincronizacaoAtributos() {
    if (sincronizadorAtributos) {
        clearInterval(sincronizadorAtributos);
        sincronizadorAtributos = null;
        console.log('🛑 Sincronizador de atributos parado');
    }
}

function atualizarAtributosEmTempoReal() {
    try {
        const dadosAtributosSalvos = localStorage.getItem('gurps_atributos');
        
        if (dadosAtributosSalvos) {
            const dados = JSON.parse(dadosAtributosSalvos);
            
            if (dados.atributos && dados.bonus) {
                const novosAtributos = {
                    DX: dados.atributos.DX || 10,
                    IQ: dados.atributos.IQ || 10,
                    HT: dados.atributos.HT || 10,
                    PERC: (dados.atributos.IQ || 10) + (dados.bonus.Percepcao || 0)
                };
                
                // Verifica se houve mudança
                const mudou = 
                    novosAtributos.DX !== estadoPericias.atributos.DX ||
                    novosAtributos.IQ !== estadoPericias.atributos.IQ ||
                    novosAtributos.HT !== estadoPericias.atributos.HT ||
                    novosAtributos.PERC !== estadoPericias.atributos.PERC;
                
                if (mudou) {
                    console.log('📊 Atributos atualizados em tempo real:', novosAtributos);
                    estadoPericias.atributos = { ...novosAtributos };
                    
                    // Atualiza cálculos se necessário
                    if (estadoPericias.modalPericiaAtiva) {
                        atualizarCalculosModal();
                    }
                    
                    // Atualiza estatísticas
                    atualizarEstatisticas();
                    
                    // Atualiza display
                    renderizarStatusDisplay();
                    
                    // Atualiza perícias aprendidas (para mostrar NH correto)
                    renderizarPericiasAprendidas();
                }
            }
        }
    } catch (error) {
        console.error('❌ Erro ao sincronizar atributos:', error);
    }
}

// ===== FUNÇÕES DE CÁLCULO =====
function obterTabelaCusto(dificuldade) {
    return TABELA_CUSTO_PERICIAS[dificuldade] || TABELA_CUSTO_PERICIAS['Média'];
}

function calcularCustoParaNivel(dificuldade, nivel) {
    try {
        const tabela = obterTabelaCusto(dificuldade);
        const entrada = tabela.find(item => item.nivel === nivel);
        return entrada ? entrada.custo : 0;
    } catch (error) {
        console.error('Erro calcularCustoParaNivel:', error);
        return 0;
    }
}

function obterNiveisDisponiveis(dificuldade) {
    try {
        const tabela = obterTabelaCusto(dificuldade);
        return tabela.map(item => item.nivel);
    } catch (error) {
        console.error('Erro obterNiveisDisponiveis:', error);
        return [0];
    }
}

function obterAtributoAtual(atributo) {
    try {
        // SEMPRE lê do estado atualizado
        return estadoPericias.atributos[atributo] || 10;
        
    } catch (error) {
        console.error('❌ Erro obterAtributoAtual:', error);
        return 10;
    }
}

// ===== FUNÇÕES DO MODAL =====
function atualizarCalculosModal() {
    try {
        const pericia = estadoPericias.modalPericiaAtiva;
        if (!pericia) return;
        
        const nivel = estadoPericias.nivelPericia;
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + nivel;
        const custoAtual = calcularCustoParaNivel(pericia.dificuldade, nivel);
        
        // Atualiza elementos do modal
        const nhElement = document.getElementById('modal-nh-valor');
        const nhCalculoElement = document.getElementById('modal-nh-calculo');
        const custoElement = document.getElementById('modal-custo-atual');
        const custoTotalElement = document.getElementById('modal-custo-total');
        
        if (nhElement) nhElement.textContent = nhAtual;
        if (nhCalculoElement) nhCalculoElement.textContent = `(${atributoBase} ${nivel >= 0 ? '+' : ''}${nivel})`;
        if (custoElement) custoElement.textContent = `${custoAtual} pontos`;
        if (custoTotalElement) custoTotalElement.textContent = custoAtual;
        
        // Atualiza custo de atualização se existir
        if (estadoPericias.periciaEditando) {
            const custoAnterior = estadoPericias.periciaEditando.custo || 0;
            const diferenca = custoAtual - custoAnterior;
            
            const custoNovoDisplay = document.getElementById('custo-novo-display');
            const custoDiferencaDisplay = document.getElementById('custo-diferenca-display');
            
            if (custoNovoDisplay) custoNovoDisplay.textContent = `${custoAtual} pts`;
            if (custoDiferencaDisplay) {
                custoDiferencaDisplay.textContent = `${diferenca > 0 ? '+' : ''}${diferenca} pts`;
                custoDiferencaDisplay.style.color = diferenca > 0 ? 'var(--accent-green)' : 
                                                     diferenca < 0 ? 'var(--accent-red)' : 
                                                     'var(--text-light)';
            }
        }
        
    } catch (error) {
        console.error('❌ Erro atualizarCalculosModal:', error);
    }
}

// CONTINUA NA PARTE 2...
// ===== INICIALIZAÇÃO =====
function initPericiasTab() {
    console.log('🎯 Inicializando sistema de perícias...');
    
    try {
        configurarSubAbasPericias();
        carregarDadosSalvos();
        configurarEventosPericias();
        iniciarSincronizacaoAtributos(); // INICIA SINCRONIZAÇÃO
        atualizarAtributosEmTempoReal(); // ATUALIZA IMEDIATAMENTE
        atualizarEstatisticas();
        
        if (typeof window.carregarCatalogoPericias === 'function') {
            window.carregarCatalogoPericias();
        }
        
        renderizarStatusDisplay();
        renderizarFiltros();
        renderizarCatalogoPericias();
        renderizarPericiasAprendidas();
        
        // Configurar clique após tudo carregado
        setTimeout(() => {
            configurarCliquePericias();
        }, 100);
        
        console.log('✅ Sistema de perícias inicializado');
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
}

// ===== CONFIGURAR EVENTOS =====
function configurarEventosPericias() {
    console.log('🔧 Configurando eventos...');
    
    try {
        // Busca
        const buscaInput = document.getElementById('busca-pericias');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                estadoPericias.buscaAtiva = e.target.value.toLowerCase();
                renderizarCatalogoPericias();
            });
        }
        
        // Filtros rápidos
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            if (btn && btn.dataset) {
                btn.addEventListener('click', () => {
                    const filtro = btn.dataset.filtro;
                    if (filtro) filtrarPericiasPor(filtro);
                });
            }
        });
        
        // Cards de estatísticas
        document.querySelectorAll('.stat-card[data-filtro]').forEach(card => {
            if (card && card.dataset) {
                card.addEventListener('click', () => {
                    const filtro = card.dataset.filtro;
                    if (filtro) filtrarPericiasPor(filtro);
                });
            }
        });
        
        // Limpar busca
        const btnLimparBusca = document.getElementById('btn-limpar-busca');
        if (btnLimparBusca) {
            btnLimparBusca.addEventListener('click', () => {
                if (buscaInput) buscaInput.value = '';
                estadoPericias.buscaAtiva = '';
                renderizarCatalogoPericias();
            });
        }
        
        console.log('✅ Eventos configurados');
    } catch (error) {
        console.error('❌ Erro configurar eventos:', error);
    }
}

// ===== CLIQUE EM PERÍCIAS =====
function configurarCliquePericias() {
    console.log('🎯 Configurando clique perícias...');
    
    try {
        const listaPericias = document.getElementById('lista-pericias');
        if (listaPericias) {
            // Remove listener antigo se existir
            listaPericias.removeEventListener('click', handleClickPericia);
            
            // Adiciona novo listener
            listaPericias.addEventListener('click', handleClickPericia);
            
            console.log('✅ Listener configurado em lista-pericias');
        } else {
            console.warn('⚠️ lista-pericias não encontrado');
        }
    } catch (error) {
        console.error('❌ Erro configurar clique:', error);
    }
}

function handleClickPericia(e) {
    // Encontra o elemento da perícia clicada
    let elemento = e.target;
    
    // Sobe na árvore até encontrar .pericia-item
    while (elemento && elemento !== document.body) {
        if (elemento.classList && elemento.classList.contains('pericia-item')) {
            break;
        }
        elemento = elemento.parentElement;
    }
    
    if (!elemento || !elemento.classList || !elemento.classList.contains('pericia-item')) {
        return; // Não foi clique em uma perícia
    }
    
    // Obtém o ID da perícia
    const periciaId = elemento.dataset.id;
    if (!periciaId) return;
    
    console.log('🎯 Clique na perícia:', periciaId);
    
    // Busca a perícia no catálogo
    const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
    const pericia = todasPericias.find(p => p && p.id === periciaId);
    
    if (pericia) {
        console.log(`✅ Perícia encontrada: ${pericia.nome} (tipo: ${pericia.tipo})`);
        
        // Se for um grupo que precisa escolher especialização
        if (pericia.tipo === 'grupo-especializacao' || pericia.grupo) {
            // Mostrar opções de especializações
            mostrarModalEspecializacao(pericia);
        } else {
            // Já é uma perícia específica (como Acrobacia)
            abrirModalPericia(pericia);
        }
    } else {
        console.error('❌ Perícia não encontrada:', periciaId);
        showNotification('Perícia não encontrada no catálogo', 'error');
    }
}

// ===== MODAL DE ESPECIALIZAÇÃO =====
function mostrarModalEspecializacao(periciaGrupo) {
    console.log(`🔫 Mostrando especializações para: ${periciaGrupo.nome}`);
    
    try {
        // Guarda a perícia grupo no estado
        estadoPericias.modalPericiaAtiva = periciaGrupo;
        
        // Pega as especializações do grupo
        const grupo = periciaGrupo.grupo || periciaGrupo.nome;
        const especializacoes = window.obterEspecializacoes ? window.obterEspecializacoes(grupo) : [];
        
        if (!especializacoes || especializacoes.length === 0) {
            // Se não tiver especializações, abre direto
            abrirModalPericia(periciaGrupo);
            return;
        }
        
        // Cria HTML das opções
        let especializacoesHTML = '';
        
        especializacoes.forEach((arma, index) => {
            if (!arma || !arma.nome) return;
            
            especializacoesHTML += `
                <div class="especializacao-item" data-index="${index}">
                    <div class="especializacao-header">
                        <div class="especializacao-nome">${arma.nome}</div>
                        <div class="especializacao-custo">${arma.custoBase || 2} pts</div>
                    </div>
                    ${arma.descricao ? `<div class="especializacao-descricao">${arma.descricao}</div>` : ''}
                    ${arma.default ? `<div class="especializacao-default">Default: ${arma.default}</div>` : ''}
                </div>
            `;
        });
        
        // HTML completo do modal
        const modalHTML = `
            <div class="modal-especializacao-content">
                <div class="modal-especializacao-header">
                    <h3><i class="fas fa-swords"></i> ${periciaGrupo.nome}</h3>
                    <button class="modal-especializacao-close" id="btn-fechar-modal-especializacao">&times;</button>
                </div>
                
                <div class="modal-especializacao-body">
                    <div class="modal-especializacao-info">
                        <p>Escolha uma especialização:</p>
                    </div>
                    
                    <div class="especializacoes-grid">
                        ${especializacoesHTML}
                    </div>
                </div>
                
                <div class="modal-especializacao-footer">
                    <button class="btn-modal btn-modal-cancelar" id="btn-cancelar-especializacao">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        `;
        
        const modal = document.getElementById('modal-especializacao');
        if (modal) {
            modal.innerHTML = modalHTML;
            
            // Configurar eventos do modal
            const closeBtn = document.getElementById('btn-fechar-modal-especializacao');
            const cancelBtn = document.getElementById('btn-cancelar-especializacao');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', fecharModalEspecializacao);
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', fecharModalEspecializacao);
            }
            
            // Configurar clique nas especializações
            document.querySelectorAll('.especializacao-item').forEach(item => {
                item.addEventListener('click', function() {
                    const index = this.dataset.index;
                    selecionarEspecializacao(index);
                });
            });
        }
        
        // Mostra o modal
        const modalOverlay = document.getElementById('modal-especializacao-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    fecharModalEspecializacao();
                }
            });
        }
        
        console.log('✅ Modal de especialização aberto');
        
    } catch (error) {
        console.error('❌ Erro mostrarModalEspecializacao:', error);
    }
}

// CONTINUA NA PARTE 3...
// ===== SELECIONAR ESPECIALIZAÇÃO =====
function selecionarEspecializacao(index) {
    try {
        const periciaGrupo = estadoPericias.modalPericiaAtiva;
        if (!periciaGrupo) return;
        
        // Pega a especialização selecionada
        const grupo = periciaGrupo.grupo || periciaGrupo.nome;
        const especializacoes = window.obterEspecializacoes ? window.obterEspecializacoes(grupo) : [];
        
        if (!especializacoes[index]) return;
        
        const especializacao = especializacoes[index];
        
        console.log(`✅ Especialização selecionada: ${especializacao.nome}`);
        
        // Fecha modal de especialização
        fecharModalEspecializacao();
        
        // Cria objeto da perícia com a especialização
        const periciaComEspecializacao = {
            ...periciaGrupo,
            nomeOriginal: periciaGrupo.nome,
            nome: `${periciaGrupo.nome} (${especializacao.nome})`,
            especializacao: especializacao.nome,
            id: `${periciaGrupo.id}-${especializacao.nome.replace(/\s+/g, '-').toLowerCase()}`,
            dificuldade: especializacao.dificuldade || periciaGrupo.dificuldade,
            atributo: periciaGrupo.atributo,
            custoBase: especializacao.custoBase || periciaGrupo.custoBase || 2,
            descricao: especializacao.descricao || periciaGrupo.descricao,
            grupo: periciaGrupo.grupo
        };
        
        // Verifica se já existe
        const jaAprendida = estadoPericias.periciasAprendidas.find(p => 
            p && p.id === periciaComEspecializacao.id
        );
        
        // Abre modal de nível DEPOIS de fechar o primeiro
        setTimeout(() => {
            abrirModalPericia(periciaComEspecializacao, jaAprendida);
        }, 300);
        
    } catch (error) {
        console.error('❌ Erro selecionarEspecializacao:', error);
    }
}

// ===== FECHAR MODAL DE ESPECIALIZAÇÃO =====
function fecharModalEspecializacao() {
    try {
        const modalOverlay = document.getElementById('modal-especializacao-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
        
        estadoPericias.modalPericiaAtiva = null;
        
        console.log('✅ Modal de especialização fechado');
        
    } catch (error) {
        console.error('❌ Erro fecharModalEspecializacao:', error);
    }
}

// ===== MODAL PRINCIPAL DE PERÍCIA =====
function abrirModalPericia(pericia, periciaExistente = null) {
    try {
        console.log(`📖 Abrindo modal para: ${pericia.nome}`);
        
        estadoPericias.modalPericiaAtiva = pericia;
        estadoPericias.periciaEditando = periciaExistente;
        
        // Nível inicial
        let nivelInicial = 0;
        if (periciaExistente) {
            nivelInicial = periciaExistente.nivel || 0;
        }
        estadoPericias.nivelPericia = nivelInicial;
        
        // Cálculos com atributos ATUAIS
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + nivelInicial;
        const custoAtual = calcularCustoParaNivel(pericia.dificuldade, nivelInicial);
        const niveisDisponiveis = obterNiveisDisponiveis(pericia.dificuldade);
        
        // Opções de nível
        let opcoesNivelHTML = '';
        niveisDisponiveis.forEach(nivel => {
            const custo = calcularCustoParaNivel(pericia.dificuldade, nivel);
            const nivelDisplay = nivel >= 0 ? `+${nivel}` : nivel;
            const selecionado = nivel === nivelInicial ? 'selected' : '';
            
            opcoesNivelHTML += `<option value="${nivel}" ${selecionado}>${nivelDisplay} (${custo} pts)</option>`;
        });
        
        // HTML do modal
        const modalHTML = `
            <div class="modal-pericia-content">
                <div class="modal-pericia-header">
                    <h3><i class="fas fa-book-open"></i> ${pericia.nome}</h3>
                    <button class="modal-pericia-close" id="btn-fechar-modal-pericia">&times;</button>
                </div>
                
                <div class="modal-pericia-body">
                    <div class="modal-pericia-info">
                        <div class="info-row">
                            <span class="info-label">Atributo:</span>
                            <span class="info-value">${pericia.atributo || 'DX'} (${atributoBase})</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Dificuldade:</span>
                            <span class="info-value">${pericia.dificuldade || 'Média'}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Custo atual:</span>
                            <span class="info-value" id="modal-custo-atual">${custoAtual} pontos</span>
                        </div>
                        ${pericia.especializacao ? `
                        <div class="info-row">
                            <span class="info-label">Especialização:</span>
                            <span class="info-value">${pericia.especializacao}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    ${pericia.descricao ? `
                    <div class="modal-pericia-descricao">
                        <h4>Descrição</h4>
                        <p>${pericia.descricao}</p>
                    </div>
                    ` : ''}
                    
                    <div class="modal-pericia-controles">
                        <div class="controle-nivel">
                            <h4>Nível da Perícia</h4>
                            <select class="nivel-select" id="nivel-pericia-select">
                                ${opcoesNivelHTML}
                            </select>
                            
                            <div class="nivel-nh-info">
                                <span>NH Atual: </span>
                                <span id="modal-nh-valor">${nhAtual}</span>
                                <small id="modal-nh-calculo">(${atributoBase} ${nivelInicial >= 0 ? '+' : ''}${nivelInicial})</small>
                            </div>
                        </div>
                        
                        ${periciaExistente ? `
                        <div class="custo-atualizacao">
                            <div class="custo-atualizacao-label">Custo de atualização:</div>
                            <div class="custo-atualizacao-valores">
                                <span class="custo-anterior">${periciaExistente.custo || 0} pts</span>
                                <span class="seta">→</span>
                                <span class="custo-novo" id="custo-novo-display">${custoAtual} pts</span>
                                <span class="igual">=</span>
                                <span class="custo-diferenca" id="custo-diferenca-display">
                                    ${custoAtual > (periciaExistente.custo || 0) ? '+' : ''}${custoAtual - (periciaExistente.custo || 0)} pts
                                </span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="modal-pericia-footer">
                    <div class="modal-custo-total">
                        <span class="label">Custo Total:</span>
                        <span class="valor" id="modal-custo-total">${custoAtual}</span>
                        <span> pontos</span>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-modal btn-modal-cancelar" id="btn-cancelar-pericia">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button class="btn-modal btn-modal-confirmar" id="btn-confirmar-pericia">
                            <i class="fas fa-check"></i> ${periciaExistente ? 'Atualizar' : 'Adquirir'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modal = document.getElementById('modal-pericia');
        if (modal) {
            modal.innerHTML = modalHTML;
            
            // Configurar eventos do modal
            const closeBtn = document.getElementById('btn-fechar-modal-pericia');
            const cancelBtn = document.getElementById('btn-cancelar-pericia');
            const confirmBtn = document.getElementById('btn-confirmar-pericia');
            const nivelSelect = document.getElementById('nivel-pericia-select');
            
            if (closeBtn) {
                closeBtn.addEventListener('click', fecharModalPericia);
            }
            
            if (cancelBtn) {
                cancelBtn.addEventListener('click', fecharModalPericia);
            }
            
            if (confirmBtn) {
                confirmBtn.addEventListener('click', confirmarPericia);
            }
            
            if (nivelSelect) {
                nivelSelect.addEventListener('change', function(e) {
                    alterarNivelPericia(e.target.value);
                });
            }
        }
        
        // Mostra modal
        const modalOverlay = document.getElementById('modal-pericia-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            modalOverlay.addEventListener('click', function(e) {
                if (e.target === this) {
                    fecharModalPericia();
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Erro abrirModalPericia:', error);
        showNotification('Erro ao abrir perícia', 'error');
    }
}

// ===== ALTERAR NÍVEL NO MODAL =====
function alterarNivelPericia(valor) {
    try {
        const novoNivel = parseInt(valor);
        estadoPericias.nivelPericia = novoNivel;
        
        atualizarCalculosModal();
        
    } catch (error) {
        console.error('❌ Erro alterarNivelPericia:', error);
    }
}

// ===== CONFIRMAR PERÍCIA =====
function confirmarPericia() {
    try {
        const pericia = estadoPericias.modalPericiaAtiva;
        const nivel = estadoPericias.nivelPericia;
        const periciaExistente = estadoPericias.periciaEditando;
        
        if (!pericia) return;
        
        const custoTotal = calcularCustoParaNivel(pericia.dificuldade, nivel);
        
        // ID único
        const skillId = pericia.id || `${pericia.nome}-${Date.now()}`;
        
        const novaPericia = {
            id: skillId,
            nome: pericia.nomeOriginal || pericia.nome,
            nomeCompleto: pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: custoTotal,
            categoria: pericia.categoria || 'Geral',
            descricao: pericia.descricao || '',
            grupo: pericia.grupo || null,
            especializacao: pericia.especializacao || null,
            tipo: pericia.tipo || 'pericia-simples'
        };
        
        // Verifica se já existe
        const indexExistente = estadoPericias.periciasAprendidas.findIndex(p => p.id === skillId);
        
        if (indexExistente >= 0) {
            // Atualiza
            estadoPericias.periciasAprendidas[indexExistente] = novaPericia;
            console.log(`📝 Perícia atualizada: ${pericia.nome}`);
        } else {
            // Adiciona nova
            estadoPericias.periciasAprendidas.push(novaPericia);
            console.log(`➕ Nova perícia: ${pericia.nome}`);
        }
        
        // Salva e atualiza
        salvarDados();
        atualizarEstatisticas();
        renderizarPericiasAprendidas();
        renderizarCatalogoPericias();
        fecharModalPericia();
        
        showNotification(`✅ ${pericia.nome} ${periciaExistente ? 'atualizada' : 'adquirida'}!`, 'success');
        
    } catch (error) {
        console.error('❌ Erro confirmarPericia:', error);
        showNotification('Erro ao confirmar perícia', 'error');
    }
}

// ===== FECHAR MODAL PERÍCIA =====
function fecharModalPericia() {
    try {
        const modalOverlay = document.getElementById('modal-pericia-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
        
        estadoPericias.modalPericiaAtiva = null;
        estadoPericias.periciaEditando = null;
        estadoPericias.nivelPericia = 0;
        
        console.log('✅ Modal de perícia fechado');
        
    } catch (error) {
        console.error('❌ Erro fecharModalPericia:', error);
    }
}

// ===== RENDERIZAÇÃO DO CATÁLOGO =====
function renderizarCatalogoPericias() {
    try {
        const container = document.getElementById('lista-pericias');
        if (!container) return;
        
        const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
        
        if (!todasPericias || todasPericias.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <h4>Carregando catálogo...</h4>
                </div>
            `;
            return;
        }
        
        // Filtra
        let periciasFiltradas = todasPericias.filter(p => p);
        
        if (estadoPericias.filtroAtivo !== 'todas') {
            switch(estadoPericias.filtroAtivo) {
                case 'dx': periciasFiltradas = periciasFiltradas.filter(p => p.atributo === 'DX'); break;
                case 'iq': periciasFiltradas = periciasFiltradas.filter(p => p.atributo === 'IQ'); break;
                case 'ht': periciasFiltradas = periciasFiltradas.filter(p => p.atributo === 'HT'); break;
                case 'perc': periciasFiltradas = periciasFiltradas.filter(p => p.atributo === 'PERC'); break;
                case 'combate': periciasFiltradas = periciasFiltradas.filter(p => 
                    p.categoria === 'Combate' || p.tipo === 'combate'
                ); break;
                case 'facil': periciasFiltradas = periciasFiltradas.filter(p => p.dificuldade === 'Fácil'); break;
                case 'media': periciasFiltradas = periciasFiltradas.filter(p => p.dificuldade === 'Média'); break;
                case 'dificil': periciasFiltradas = periciasFiltradas.filter(p => 
                    p.dificuldade === 'Difícil' || p.dificuldade === 'Muito Difícil'
                ); break;
            }
        }
        
        // Busca
        if (estadoPericias.buscaAtiva.trim() !== '') {
            const termo = estadoPericias.buscaAtiva.toLowerCase();
            periciasFiltradas = periciasFiltradas.filter(p => 
                (p.nome && p.nome.toLowerCase().includes(termo)) ||
                (p.descricao && p.descricao.toLowerCase().includes(termo))
            );
        }
        
        // Renderiza
        if (periciasFiltradas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h4>Nenhuma perícia encontrada</h4>
                </div>
            `;
            const contador = document.getElementById('contador-pericias');
            if (contador) contador.textContent = '0';
            return;
        }
        
        container.innerHTML = '';
        
        periciasFiltradas.forEach(pericia => {
            const jaAprendida = estadoPericias.periciasAprendidas.some(p => 
                p && (p.id === pericia.id || 
                     (p.grupo && pericia.grupo && p.grupo === pericia.grupo))
            );
            
            const periciaElement = document.createElement('div');
            periciaElement.className = 'pericia-item';
            periciaElement.dataset.id = pericia.id;
            
            periciaElement.innerHTML = `
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
                <div class="pericia-descricao">${pericia.descricao || 'Sem descrição.'}</div>
                ${jaAprendida ? `<div class="pericia-aprendida-indicator"><i class="fas fa-check-circle"></i> Já aprendida</div>` : ''}
            `;
            
            container.appendChild(periciaElement);
        });
        
        const contador = document.getElementById('contador-pericias');
        if (contador) contador.textContent = periciasFiltradas.length;
        
    } catch (error) {
        console.error('❌ Erro renderizarCatalogoPericias:', error);
    }
}

// ===== RENDERIZAÇÃO PERÍCIAS APRENDIDAS =====
function renderizarPericiasAprendidas() {
    try {
        const container = document.getElementById('pericias-aprendidas');
        if (!container) return;
        
        if (!estadoPericias.periciasAprendidas || estadoPericias.periciasAprendidas.length === 0) {
            container.innerHTML = `
                <div class="nenhuma-pericia-aprendida">
                    <i class="fas fa-graduation-cap"></i>
                    <div>Nenhuma perícia aprendida</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        const periciasOrdenadas = [...estadoPericias.periciasAprendidas]
            .filter(p => p)
            .sort((a, b) => (a.nomeCompleto || a.nome || '').localeCompare(b.nomeCompleto || b.nome || ''));
        
        periciasOrdenadas.forEach(pericia => {
            const atributoBase = obterAtributoAtual(pericia.atributo);
            const nhAtual = atributoBase + (pericia.nivel || 0);
            
            const periciaElement = document.createElement('div');
            periciaElement.className = 'pericia-aprendida-item';
            periciaElement.dataset.id = pericia.id;
            
            periciaElement.innerHTML = `
                <div class="pericia-aprendida-header">
                    <div class="pericia-aprendida-nome">${pericia.nomeCompleto || pericia.nome}</div>
                    <div class="pericia-aprendida-info">
                        <span class="nivel-display">${pericia.nivel >= 0 ? '+' : ''}${pericia.nivel || 0}</span>
                        <span class="nh-display">NH ${nhAtual}</span>
                    </div>
                </div>
                <div class="pericia-info-adicional">
                    <span class="pericia-dificuldade">${pericia.dificuldade || 'Média'}</span>
                    <span class="pericia-custo">${pericia.custo || 0} pts</span>
                </div>
                <div class="pericia-actions">
                    <button class="btn-editar-pericia" data-id="${pericia.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-remover-pericia" data-id="${pericia.id}">
                        <i class="fas fa-times"></i> Remover
                    </button>
                </div>
            `;
            
            container.appendChild(periciaElement);
        });
        
        // Configurar eventos dos botões
        container.querySelectorAll('.btn-editar-pericia').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                editarPericia(this.dataset.id);
            });
        });
        
        container.querySelectorAll('.btn-remover-pericia').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                removerPericia(this.dataset.id);
            });
        });
        
        // Clique na perícia para editar
        container.querySelectorAll('.pericia-aprendida-item').forEach(item => {
            item.addEventListener('click', function() {
                editarPericia(this.dataset.id);
            });
        });
        
    } catch (error) {
        console.error('❌ Erro renderizarPericiasAprendidas:', error);
    }
}

// ===== FUNÇÕES DE EDIÇÃO/REMOÇÃO =====
function editarPericia(id) {
    try {
        const periciaAprendida = estadoPericias.periciasAprendidas.find(p => p && p.id === id);
        if (!periciaAprendida) return;
        
        // Se for uma perícia com especialização, recria o objeto
        if (periciaAprendida.especializacao && periciaAprendida.grupo) {
            const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
            const periciaOriginal = todasPericias.find(p => p && p.grupo === periciaAprendida.grupo);
            
            if (periciaOriginal) {
                const periciaComEspecializacao = {
                    ...periciaOriginal,
                    nomeOriginal: periciaOriginal.nome,
                    nome: `${periciaOriginal.nome} (${periciaAprendida.especializacao})`,
                    especializacao: periciaAprendida.especializacao,
                    id: periciaAprendida.id
                };
                
                abrirModalPericia(periciaComEspecializacao, periciaAprendida);
                return;
            }
        }
        
        // Se não for especialização, abre direto
        abrirModalPericia(periciaAprendida, periciaAprendida);
        
    } catch (error) {
        console.error('❌ Erro editarPericia:', error);
    }
}

function removerPericia(id) {
    try {
        if (!confirm('Tem certeza que deseja remover esta perícia?')) return;
        
        estadoPericias.periciasAprendidas = estadoPericias.periciasAprendidas.filter(p => p && p.id !== id);
        
        salvarDados();
        atualizarEstatisticas();
        renderizarPericiasAprendidas();
        renderizarCatalogoPericias();
        
        showNotification('🗑️ Perícia removida!', 'warning');
        
    } catch (error) {
        console.error('❌ Erro removerPericia:', error);
    }
}

// ===== FUNÇÕES DE SUB-ABAS =====
function configurarSubAbasPericias() {
    try {
        const subTabBtns = document.querySelectorAll('.subtab-btn-pericias');
        
        subTabBtns.forEach(btn => {
            if (btn && btn.dataset) {
                btn.addEventListener('click', () => {
                    const subtab = btn.dataset.subtab;
                    if (!subtab) return;
                    
                    estadoPericias.subAbaAtiva = subtab;
                    
                    // Remove active de todos
                    document.querySelectorAll('.subtab-btn-pericias').forEach(b => {
                        if (b) b.classList.remove('active');
                    });
                    
                    document.querySelectorAll('.subtab-pane-pericias').forEach(p => {
                        if (p) p.classList.remove('active');
                    });
                    
                    // Adiciona active
                    btn.classList.add('active');
                    
                    const pane = document.getElementById(`subtab-${subtab}`);
                    if (pane) {
                        pane.classList.add('active');
                        
                        if (subtab === 'pericias') {
                            renderizarCatalogoPericias();
                            renderizarPericiasAprendidas();
                        }
                    }
                    
                    localStorage.setItem('ultimaSubAbaPericias', subtab);
                });
            }
        });
        
        // Restaura última sub-aba
        const ultimaSubAba = localStorage.getItem('ultimaSubAbaPericias') || 'pericias';
        const btnInicial = document.querySelector(`.subtab-btn-pericias[data-subtab="${ultimaSubAba}"]`);
        if (btnInicial) {
            setTimeout(() => btnInicial.click(), 100);
        }
        
    } catch (error) {
        console.error('❌ Erro configurarSubAbasPericias:', error);
    }
}

// ===== CARREGAR E SALVAR DADOS =====
function carregarDadosSalvos() {
    try {
        const dadosPericiasSalvos = localStorage.getItem('gurps_pericias');
        const dadosAtributosSalvos = localStorage.getItem('gurps_atributos');
        
        if (dadosPericiasSalvos) {
            const dados = JSON.parse(dadosPericiasSalvos);
            if (dados.periciasAprendidas && Array.isArray(dados.periciasAprendidas)) {
                estadoPericias.periciasAprendidas = dados.periciasAprendidas;
            }
        }
        
        if (dadosAtributosSalvos) {
            const dados = JSON.parse(dadosAtributosSalvos);
            estadoPericias.atributos = {
                DX: dados.atributos?.DX || 10,
                IQ: dados.atributos?.IQ || 10,
                HT: dados.atributos?.HT || 10,
                PERC: (dados.atributos?.IQ || 10) + (dados.bonus?.Percepcao || 0)
            };
        }
        
        const ultimaSubAba = localStorage.getItem('ultimaSubAbaPericias');
        if (ultimaSubAba) estadoPericias.subAbaAtiva = ultimaSubAba;
        
    } catch (error) {
        console.error('❌ Erro carregar dados:', error);
        estadoPericias.periciasAprendidas = [];
        estadoPericias.atributos = { DX: 10, IQ: 10, HT: 10, PERC: 10 };
    }
}

function salvarDados() {
    try {
        const dadosPericias = {
            periciasAprendidas: estadoPericias.periciasAprendidas,
            pontosTotais: estadoPericias.pontosPericias + estadoPericias.pontosCombate,
            dataSalvamento: new Date().toISOString()
        };
        
        localStorage.setItem('gurps_pericias', JSON.stringify(dadosPericias));
        
    } catch (error) {
        console.error('❌ Erro salvar dados:', error);
    }
}

// ===== ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticas() {
    try {
        // Reset
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
        
        // Calcula
        estadoPericias.periciasAprendidas.forEach(pericia => {
            if (!pericia) return;
            
            const custo = pericia.custo || 0;
            const atributo = pericia.atributo;
            
            // Atributos
            switch(atributo) {
                case 'DX': estadoPericias.totalDX++; estadoPericias.pontosDX += custo; break;
                case 'IQ': estadoPericias.totalIQ++; estadoPericias.pontosIQ += custo; break;
                case 'HT': estadoPericias.totalHT++; estadoPericias.pontosHT += custo; break;
                case 'PERC': estadoPericias.totalPERC++; estadoPericias.pontosPERC += custo; break;
            }
            
            // Combate
            if (pericia.categoria === 'Combate' || pericia.tipo === 'combate') {
                estadoPericias.pontosCombate += custo;
                estadoPericias.totalCombate++;
            } else {
                estadoPericias.pontosPericias += custo;
            }
            
            estadoPericias.totalPericias++;
        });
        
        renderizarStatusDisplay();
        
    } catch (error) {
        console.error('❌ Erro atualizarEstatisticas:', error);
    }
}

function renderizarStatusDisplay() {
    try {
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
            if (elemento) elemento.textContent = elem.valor;
        });
        
        const totalPontos = estadoPericias.pontosPericias + estadoPericias.pontosCombate;
        const pontosPericiasTotal = document.getElementById('pontos-pericias-total');
        if (pontosPericiasTotal) pontosPericiasTotal.textContent = `[${totalPontos} pts]`;
        
    } catch (error) {
        console.error('❌ Erro renderizarStatusDisplay:', error);
    }
}

// ===== FUNÇÕES DE UTILIDADE =====
function filtrarPericiasPor(filtro) {
    try {
        estadoPericias.filtroAtivo = filtro;
        
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            if (btn && btn.dataset) {
                btn.classList.toggle('active', btn.dataset.filtro === filtro);
            }
        });
        
        renderizarCatalogoPericias();
        
    } catch (error) {
        console.error('❌ Erro filtrarPericiasPor:', error);
    }
}

function showNotification(mensagem, tipo = 'info') {
    try {
        const notificacaoAnterior = document.querySelector('.pericia-notification');
        if (notificacaoAnterior) notificacaoAnterior.remove();
        
        const notificacao = document.createElement('div');
        notificacao.className = `pericia-notification pericia-notification-${tipo}`;
        notificacao.innerHTML = `
            <div class="pericia-notification-content">
                <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${mensagem}</span>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => notificacao.classList.add('show'), 10);
        
        setTimeout(() => {
            notificacao.classList.remove('show');
            setTimeout(() => {
                if (notificacao.parentNode) notificacao.parentNode.removeChild(notificacao);
            }, 300);
        }, 3000);
        
    } catch (error) {
            console.error('❌ Erro showNotification:', error);
    }
}

function renderizarFiltros() {
    try {
        const filtros = document.querySelectorAll('.filtro-btn');
        filtros.forEach(btn => {
            if (btn && btn.dataset) {
                btn.classList.toggle('active', btn.dataset.filtro === estadoPericias.filtroAtivo);
            }
        });
    } catch (error) {
        console.error('❌ Erro renderizarFiltros:', error);
    }
}

// ===== LIMPEZA AO SAIR DA ABA =====
function limparSincronizacao() {
    pararSincronizacaoAtributos();
    estadoPericias.modalPericiaAtiva = null;
    estadoPericias.periciaEditando = null;
    estadoPericias.nivelPericia = 0;
}

// ===== EXPORTAR FUNÇÕES =====
window.initPericiasTab = initPericiasTab;
window.abrirModalPericia = abrirModalPericia;
window.fecharModalPericia = fecharModalPericia;
window.alterarNivelPericia = alterarNivelPericia;
window.confirmarPericia = confirmarPericia;
window.removerPericia = removerPericia;
window.editarPericia = editarPericia;
window.renderizarCatalogoPericias = renderizarCatalogoPericias;
window.renderizarPericiasAprendidas = renderizarPericiasAprendidas;
window.filtrarPericiasPor = filtrarPericiasPor;
window.limparSincronizacao = limparSincronizacao;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Perícias carregado');
    
    // Inicializar quando a aba de perícias for ativada
    setTimeout(() => {
        if (typeof window.initPericiasTab === 'function') {
            window.initPericiasTab();
        }
    }, 500);
});

console.log('🎮 Sistema de Perícias (COMPLETO COM SINCRONIZAÇÃO) carregado!');