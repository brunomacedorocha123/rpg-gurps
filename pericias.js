// ============================================
// SISTEMA DE PERÍCIAS - VERSÃO ESTÁVEL SEM QUEBRAS
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
    periciaEditando: null,
    fluxoEspecializacao: false
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

function calcularCustoAtualizacao(dificuldade, nivelAtual, novoNivel) {
    try {
        const custoAtual = calcularCustoParaNivel(dificuldade, nivelAtual);
        const custoNovo = calcularCustoParaNivel(dificuldade, novoNivel);
        return Math.max(0, custoNovo - custoAtual);
    } catch (error) {
        console.error('Erro calcularCustoAtualizacao:', error);
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

// ===== INICIALIZAÇÃO =====
function initPericiasTab() {
    console.log('🎯 Inicializando sistema de perícias...');
    
    try {
        configurarSubAbasPericias();
        carregarDadosSalvos();
        configurarEventosPericias();
        atualizarEstatisticas();
        
        if (typeof window.carregarCatalogoPericias === 'function') {
            window.carregarCatalogoPericias();
        }
        
        renderizarStatusDisplay();
        renderizarFiltros();
        renderizarCatalogoPericias();
        renderizarPericiasAprendidas();
        
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
        
        // Modais overlay
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
        
        // Escape para fechar modais
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                fecharModalPericia();
                fecharModalEspecializacao();
            }
        });
        
        console.log('✅ Eventos configurados');
    } catch (error) {
        console.error('❌ Erro configurar eventos:', error);
    }
}

// ===== CLIQUE EM PERÍCIAS - VERSÃO À PROVA DE ERROS =====
function configurarCliquePericias() {
    console.log('🎯 Configurando clique perícias...');
    
    try {
        const listaPericias = document.getElementById('lista-pericias');
        if (listaPericias) {
            // Remove listeners antigos para evitar duplicação
            listaPericias.removeEventListener('click', handleCliquePericia);
            // Adiciona novo listener
            listaPericias.addEventListener('click', handleCliquePericia);
            console.log('✅ Listener configurado em lista-pericias');
        } else {
            console.warn('⚠️ lista-pericias não encontrado, tentando novamente em 500ms');
            setTimeout(configurarCliquePericias, 500);
        }
    } catch (error) {
        console.error('❌ Erro configurar clique:', error);
    }
}

function handleCliquePericia(event) {
    try {
        if (!event || !event.target) return;
        
        let elemento = event.target;
        let periciaElement = null;
        
        // Procura elemento .pericia-item
        while (elemento && elemento !== document.body) {
            if (elemento.classList && elemento.classList.contains('pericia-item')) {
                periciaElement = elemento;
                break;
            }
            elemento = elemento.parentElement;
        }
        
        if (!periciaElement || !periciaElement.dataset || !periciaElement.dataset.id) {
            console.log('⚠️ Clique não foi em uma perícia');
            return;
        }
        
        const periciaId = periciaElement.dataset.id;
        console.log('🎯 Clique na perícia:', periciaId);
        
        // Busca a perícia
        const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
        const pericia = todasPericias.find(p => p && p.id === periciaId);
        
        if (pericia) {
            console.log(`✅ Perícia encontrada: ${pericia.nome}`);
            
            // Verifica se precisa de especialização
            const precisaEspecializacao = pericia.tipo === 'grupo-especializacao' || pericia.grupo;
            
            if (precisaEspecializacao) {
                // Primeiro escolhe especialização
                abrirModalEspecializacaoInicial(pericia);
            } else {
                // Vai direto para o modal de nível
                abrirModalPericia(pericia);
            }
        } else {
            console.error('❌ Perícia não encontrada:', periciaId);
            showNotification('Perícia não encontrada no catálogo', 'error');
        }
    } catch (error) {
        console.error('❌ Erro handleCliquePericia:', error);
        showNotification('Erro ao processar perícia', 'error');
    }
}

// ===== FLUXO CORRETO: PRIMEIRO ESPECIALIZAÇÃO, DEPOIS NÍVEL =====
function abrirModalEspecializacaoInicial(pericia) {
    try {
        estadoPericias.modalPericiaAtiva = pericia;
        estadoPericias.fluxoEspecializacao = true;
        
        // Pega especializações do grupo
        const grupo = pericia.grupo || pericia.nome;
        const especializacoes = window.obterEspecializacoes ? window.obterEspecializacoes(grupo) : [];
        
        const modal = document.getElementById('modal-especializacao');
        if (!modal) {
            console.error('❌ Modal de especialização não encontrado');
            return;
        }
        
        let especializacoesHTML = '';
        
        if (especializacoes && especializacoes.length > 0) {
            especializacoesHTML = especializacoes.map(espec => {
                if (!espec || !espec.nome) return '';
                return `
                    <div class="especializacao-item" onclick="selecionarEspecializacaoInicial('${espec.nome.replace(/'/g, "\\'")}', '${espec.id || ''}')">
                        <div class="especializacao-header">
                            <div class="especializacao-nome">${espec.nome}</div>
                            <div class="especializacao-custo">${espec.custoBase || 2} pts</div>
                        </div>
                        ${espec.descricao ? `<div class="especializacao-descricao">${espec.descricao}</div>` : ''}
                    </div>
                `;
            }).join('');
        }
        
        modal.innerHTML = `
            <div class="modal-especializacao-content">
                <div class="modal-especializacao-header">
                    <h3><i class="fas fa-star"></i> ${pericia.nome}</h3>
                    <button class="modal-especializacao-close" onclick="fecharModalEspecializacao()">&times;</button>
                </div>
                
                <div class="modal-especializacao-body">
                    <div class="modal-especializacao-info">
                        <p>Primeiro, escolha uma especialização para <strong>${pericia.nome}</strong>:</p>
                    </div>
                    
                    <div class="especializacoes-lista" id="especializacoes-lista-inicial">
                        ${especializacoesHTML}
                        
                        <!-- Opção para digitar especialização -->
                        <div class="especializacao-item especializacao-personalizada" onclick="abrirInputEspecializacaoPersonalizada()">
                            <div class="especializacao-header">
                                <div class="especializacao-nome"><i class="fas fa-edit"></i> Digitar especialização</div>
                            </div>
                            <div class="especializacao-descricao">Clique para digitar uma especialização personalizada</div>
                        </div>
                        
                        <!-- Input para especialização personalizada (inicialmente oculto) -->
                        <div class="especializacao-personalizada-input" id="especializacao-personalizada-input" style="display: none; margin-top: 15px;">
                            <input type="text" id="input-especializacao-custom" placeholder="Ex: Cavalgar (Pégaso), Armas de Esgrima (Florete)...">
                            <button class="btn-confirmar-custom" onclick="confirmarEspecializacaoPersonalizada()">
                                <i class="fas fa-check"></i> Usar esta especialização
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="modal-especializacao-footer">
                    <div class="modal-actions">
                        <button class="btn-modal btn-modal-cancelar" onclick="fecharModalEspecializacao()">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button class="btn-modal btn-modal-confirmar" id="btn-confirmar-especializacao-inicial" disabled onclick="confirmarEspecializacaoInicial()">
                            <i class="fas fa-check"></i> Continuar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalOverlay = document.getElementById('modal-especializacao-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            console.log('✅ Modal de especialização inicial aberto');
        }
    } catch (error) {
        console.error('❌ Erro abrirModalEspecializacaoInicial:', error);
    }
}

function selecionarEspecializacaoInicial(nomeEspecializacao, idEspecializacao) {
    try {
        estadoPericias.especializacaoSelecionada = { 
            nome: nomeEspecializacao, 
            id: idEspecializacao || nomeEspecializacao.toLowerCase().replace(/[^a-z0-9]/g, '-')
        };
        
        // Atualiza UI
        document.querySelectorAll('.especializacao-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Encontra e seleciona o item clicado
        document.querySelectorAll('.especializacao-item').forEach(item => {
            const nomeElement = item.querySelector('.especializacao-nome');
            if (nomeElement && nomeElement.textContent.includes(nomeEspecializacao)) {
                item.classList.add('selected');
            }
        });
        
        // Habilita botão de continuar
        const btnContinuar = document.getElementById('btn-confirmar-especializacao-inicial');
        if (btnContinuar) btnContinuar.disabled = false;
        
        console.log('✅ Especialização selecionada:', nomeEspecializacao);
    } catch (error) {
        console.error('❌ Erro selecionarEspecializacaoInicial:', error);
    }
}

function abrirInputEspecializacaoPersonalizada() {
    try {
        // Esconde a lista
        document.querySelectorAll('.especializacao-item').forEach(item => {
            item.style.display = 'none';
        });
        
        // Mostra o input
        const inputContainer = document.getElementById('especializacao-personalizada-input');
        if (inputContainer) {
            inputContainer.style.display = 'block';
        }
    } catch (error) {
        console.error('❌ Erro abrirInputEspecializacaoPersonalizada:', error);
    }
}

function confirmarEspecializacaoPersonalizada() {
    try {
        const input = document.getElementById('input-especializacao-custom');
        if (!input || !input.value.trim()) {
            showNotification('Digite uma especialização', 'error');
            return;
        }
        
        const nomeEspecializacao = input.value.trim();
        selecionarEspecializacaoInicial(nomeEspecializacao, null);
    } catch (error) {
        console.error('❌ Erro confirmarEspecializacaoPersonalizada:', error);
    }
}

function confirmarEspecializacaoInicial() {
    try {
        if (!estadoPericias.especializacaoSelecionada || !estadoPericias.modalPericiaAtiva) {
            showNotification('Selecione uma especialização primeiro', 'error');
            return;
        }
        
        // Fecha modal de especialização
        fecharModalEspecializacao();
        
        // Aguarda um momento e abre modal de nível
        setTimeout(() => {
            abrirModalPericiaComEspecializacao();
        }, 100);
        
    } catch (error) {
        console.error('❌ Erro confirmarEspecializacaoInicial:', error);
    }
}

function abrirModalPericiaComEspecializacao() {
    try {
        const pericia = estadoPericias.modalPericiaAtiva;
        if (!pericia) return;
        
        // Cria uma cópia da perícia com a especialização
        const periciaComEspecializacao = {
            ...pericia,
            nomeCompleto: `${pericia.nome} (${estadoPericias.especializacaoSelecionada.nome})`,
            especializacao: estadoPericias.especializacaoSelecionada.nome,
            idEspecializacao: estadoPericias.especializacaoSelecionada.id
        };
        
        // Verifica se já existe para editar
        const periciaExistente = estadoPericias.periciasAprendidas.find(p => 
            p.id === periciaComEspecializacao.idEspecializacao || 
            (p.nome === pericia.nome && p.especializacao === periciaComEspecializacao.especializacao)
        );
        
        // Abre modal normal com a perícia+especialização
        abrirModalPericia(periciaComEspecializacao, periciaExistente);
        
    } catch (error) {
        console.error('❌ Erro abrirModalPericiaComEspecializacao:', error);
    }
}

// ===== MODAL PRINCIPAL DE PERÍCIA (com cálculos CORRETOS) =====
function abrirModalPericia(pericia, periciaExistente = null) {
    try {
        if (!pericia) {
            console.error('❌ Nenhuma perícia fornecida');
            return;
        }
        
        console.log(`🟢 Abrindo modal para: ${pericia.nome}`);
        
        estadoPericias.modalPericiaAtiva = pericia;
        estadoPericias.periciaEditando = periciaExistente;
        
        // Determina nível inicial
        let nivelInicial = 0;
        if (periciaExistente) {
            nivelInicial = periciaExistente.nivel || 0;
        }
        
        estadoPericias.nivelPericia = nivelInicial;
        
        // Obtém atributo atual
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + nivelInicial;
        const custoAtual = calcularCustoParaNivel(pericia.dificuldade, nivelInicial);
        const niveisDisponiveis = obterNiveisDisponiveis(pericia.dificuldade);
        
        // Gera opções de nível
        let opcoesNivelHTML = '';
        niveisDisponiveis.forEach(nivel => {
            const custo = calcularCustoParaNivel(pericia.dificuldade, nivel);
            if (custo > 0) {
                const nivelDisplay = nivel >= 0 ? `+${nivel}` : nivel;
                const selecionado = nivel === nivelInicial ? 'selected' : '';
                opcoesNivelHTML += `<option value="${nivel}" ${selecionado}>${nivelDisplay} (${custo} pontos)</option>`;
            }
        });
        
        // Monta HTML do modal
        const modalHTML = `
            <div class="modal-pericia-content">
                <div class="modal-pericia-header">
                    <h3><i class="fas fa-book-open"></i> ${pericia.nomeCompleto || pericia.nome}</h3>
                    <button class="modal-pericia-close" onclick="fecharModalPericia()">&times;</button>
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
                    
                    ${pericia.default ? `
                    <div class="modal-pericia-default">
                        <h4>Default</h4>
                        <p>${pericia.default}</p>
                    </div>
                    ` : ''}
                    
                    <div class="modal-pericia-controles">
                        <div class="controle-nivel">
                            <h4>Nível da Perícia</h4>
                            <select class="nivel-select" id="nivel-pericia-select" onchange="alterarNivelPericiaDropdown(this.value)">
                                ${opcoesNivelHTML}
                            </select>
                            
                            <div class="nivel-nh-info">
                                <span>NH Atual: </span>
                                <span id="modal-nh-valor">${nhAtual}</span>
                                <small id="modal-nh-calculo">(${atributoBase} ${nivelInicial >= 0 ? '+' : ''}${nivelInicial})</small>
                            </div>
                        </div>
                        
                        <!-- Informação de custo de atualização -->
                        ${periciaExistente ? `
                        <div class="custo-atualizacao-info" id="custo-atualizacao-info" style="margin-top: 15px; padding: 10px; background: rgba(44,32,8,0.6); border-radius: 6px;">
                            <div style="font-size: 0.9rem; color: rgba(212,175,55,0.8);">Atualização:</div>
                            <div style="font-size: 1.1rem; color: var(--text-gold);">
                                <span id="custo-atual-text">${periciaExistente.custo || 0}</span> pts → 
                                <span id="custo-novo-text">${custoAtual}</span> pts = 
                                <span id="custo-diferenca-text" style="color: ${custoAtual > (periciaExistente.custo || 0) ? 'var(--accent-green)' : 'var(--accent-red)'}">
                                    ${custoAtual > (periciaExistente.custo || 0) ? '+' : ''}${custoAtual - (periciaExistente.custo || 0)}
                                </span> pts
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
        
        // Mostra modal
        const modalOverlay = document.getElementById('modal-pericia-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('❌ Erro abrirModalPericia:', error);
        showNotification('Erro ao abrir perícia', 'error');
    }
}

function alterarNivelPericiaDropdown(valorSelecionado) {
    try {
        if (!estadoPericias.modalPericiaAtiva) return;
        
        const novoNivel = parseInt(valorSelecionado);
        estadoPericias.nivelPericia = novoNivel;
        
        const pericia = estadoPericias.modalPericiaAtiva;
        const periciaExistente = estadoPericias.periciaEditando;
        const atributoBase = obterAtributoAtual(pericia.atributo);
        const nhAtual = atributoBase + novoNivel;
        const custoAtual = calcularCustoParaNivel(pericia.dificuldade, novoNivel);
        
        // Atualiza display
        const nhElement = document.getElementById('modal-nh-valor');
        const nhCalculoElement = document.getElementById('modal-nh-calculo');
        const custoElement = document.getElementById('modal-custo-atual');
        const custoTotalElement = document.getElementById('modal-custo-total');
        
        if (nhElement) nhElement.textContent = nhAtual;
        if (nhCalculoElement) nhCalculoElement.textContent = `(${atributoBase} ${novoNivel >= 0 ? '+' : ''}${novoNivel})`;
        if (custoElement) custoElement.textContent = `${custoAtual} pontos`;
        if (custoTotalElement) custoTotalElement.textContent = custoAtual;
        
        // Se estiver editando, mostra custo de atualização
        if (periciaExistente) {
            const custoAtualElement = document.getElementById('custo-atual-text');
            const custoNovoElement = document.getElementById('custo-novo-text');
            const custoDiferencaElement = document.getElementById('custo-diferenca-text');
            
            if (custoAtualElement && custoNovoElement && custoDiferencaElement) {
                const custoAnterior = periciaExistente.custo || 0;
                const diferenca = custoAtual - custoAnterior;
                
                custoAtualElement.textContent = custoAnterior;
                custoNovoElement.textContent = custoAtual;
                custoDiferencaElement.textContent = `${diferenca >= 0 ? '+' : ''}${diferenca}`;
                custoDiferencaElement.style.color = diferenca > 0 ? 'var(--accent-green)' : 
                                                    diferenca < 0 ? 'var(--accent-red)' : 
                                                    'var(--text-light)';
            }
        }
        
    } catch (error) {
        console.error('❌ Erro alterarNivelPericiaDropdown:', error);
    }
}

// ===== FUNÇÃO DE CONFIRMAÇÃO =====
function confirmarPericia() {
    try {
        if (!estadoPericias.modalPericiaAtiva) {
            console.error('❌ Nenhuma perícia ativa');
            return;
        }
        
        const pericia = estadoPericias.modalPericiaAtiva;
        const nivel = estadoPericias.nivelPericia;
        const periciaExistente = estadoPericias.periciaEditando;
        
        const custoTotal = calcularCustoParaNivel(pericia.dificuldade, nivel);
        
        // ID único para a perícia
        let skillId = pericia.id;
        if (pericia.especializacao) {
            skillId = `${pericia.id}-${pericia.especializacao.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        }
        if (pericia.idEspecializacao) {
            skillId = pericia.idEspecializacao;
        }
        
        const novaPericia = {
            id: skillId,
            nome: pericia.nome,
            nomeCompleto: pericia.nomeCompleto || pericia.nome,
            atributo: pericia.atributo,
            dificuldade: pericia.dificuldade,
            nivel: nivel,
            custo: custoTotal,
            investimentoAcumulado: custoTotal,
            categoria: pericia.categoria || 'Geral',
            descricao: pericia.descricao || '',
            grupo: pericia.grupo || null,
            especializacao: pericia.especializacao || null,
            tipo: pericia.tipo || 'pericia-simples'
        };
        
        // Se já existe, ATUALIZA (não soma!)
        const indexExistente = estadoPericias.periciasAprendidas.findIndex(p => p.id === skillId);
        if (indexExistente >= 0) {
            estadoPericias.periciasAprendidas[indexExistente] = novaPericia;
            console.log(`📝 Perícia atualizada: ${pericia.nome} (Nível: ${nivel})`);
        } else {
            estadoPericias.periciasAprendidas.push(novaPericia);
            console.log(`➕ Nova perícia: ${pericia.nome} (Nível: ${nivel})`);
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

// ===== FUNÇÕES AUXILIARES =====
function obterAtributoAtual(atributo) {
    try {
        // Tenta do estado local
        if (estadoPericias.atributos && estadoPericias.atributos[atributo]) {
            return estadoPericias.atributos[atributo];
        }
        
        // Fallback
        const valoresPadrao = {
            'DX': 10, 'IQ': 10, 'HT': 10, 'PERC': 10
        };
        
        return valoresPadrao[atributo] || 10;
        
    } catch (error) {
        console.error('❌ Erro obterAtributoAtual:', error);
        return 10;
    }
}

function fecharModalPericia() {
    try {
        const modalOverlay = document.getElementById('modal-pericia-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
        estadoPericias.modalPericiaAtiva = null;
        estadoPericias.periciaEditando = null;
        estadoPericias.nivelPericia = 0;
        estadoPericias.fluxoEspecializacao = false;
    } catch (error) {
        console.error('❌ Erro fecharModalPericia:', error);
    }
}

function fecharModalEspecializacao() {
    try {
        const modalOverlay = document.getElementById('modal-especializacao-overlay');
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
        }
        estadoPericias.modalEspecializacaoAtiva = null;
        estadoPericias.especializacaoSelecionada = null;
        estadoPericias.fluxoEspecializacao = false;
    } catch (error) {
        console.error('❌ Erro fecharModalEspecializacao:', error);
    }
}

// ===== RENDERIZAÇÃO DO CATÁLOGO =====
function renderizarCatalogoPericias() {
    try {
        const container = document.getElementById('lista-pericias');
        if (!container) {
            console.warn('⚠️ Container lista-pericias não encontrado');
            return;
        }
        
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
        
        // Aplica filtros
        let periciasFiltradas = todasPericias.filter(p => p); // Remove null/undefined
        
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
        
        // Aplica busca
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
            if (!pericia) return;
            
            const jaAprendida = estadoPericias.periciasAprendidas.some(p => 
                p && p.id === pericia.id
            );
            
            const periciaElement = document.createElement('div');
            periciaElement.className = 'pericia-item';
            periciaElement.dataset.id = pericia.id;
            
            periciaElement.innerHTML = `
                <div class="pericia-header">
                    <div class="pericia-nome">${pericia.nome || 'Sem nome'}</div>
                    <div class="pericia-info">
                        <span class="atributo-badge">${pericia.atributo || 'DX'}</span>
                        <span class="dificuldade-badge">${pericia.dificuldade || 'Média'}</span>
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
        
        // Ordena por nome
        const periciasOrdenadas = [...estadoPericias.periciasAprendidas]
            .filter(p => p)
            .sort((a, b) => (a.nome || '').localeCompare(b.nome || ''));
        
        periciasOrdenadas.forEach(pericia => {
            const atributoBase = obterAtributoAtual(pericia.atributo);
            const nhAtual = atributoBase + (pericia.nivel || 0);
            
            const periciaElement = document.createElement('div');
            periciaElement.className = 'pericia-aprendida-item';
            
            let nomeDisplay = pericia.nomeCompleto || pericia.nome;
            if (pericia.especializacao && !nomeDisplay.includes('(')) {
                nomeDisplay += ` (${pericia.especializacao})`;
            }
            
            periciaElement.innerHTML = `
                <div class="pericia-aprendida-header">
                    <div class="pericia-aprendida-nome">${nomeDisplay}</div>
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
                    <button class="btn-editar-pericia" onclick="event.stopPropagation(); editarPericia('${pericia.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-remover-pericia" onclick="event.stopPropagation(); removerPericia('${pericia.id}')">
                        <i class="fas fa-times"></i> Remover
                    </button>
                </div>
            `;
            
            // Click para editar
            periciaElement.addEventListener('click', () => {
                editarPericia(pericia.id);
            });
            
            container.appendChild(periciaElement);
        });
        
    } catch (error) {
        console.error('❌ Erro renderizarPericiasAprendidas:', error);
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

// ===== FUNÇÕES DE GERENCIAMENTO =====
function editarPericia(id) {
    try {
        const periciaAprendida = estadoPericias.periciasAprendidas.find(p => p && p.id === id);
        if (!periciaAprendida) {
            console.error('❌ Perícia não encontrada:', id);
            return;
        }
        
        // Busca no catálogo
        const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
        const periciaOriginal = todasPericias.find(p => 
            p && (p.id === periciaAprendida.id || 
                 (p.grupo && periciaAprendida.grupo && p.grupo === periciaAprendida.grupo))
        );
        
        if (periciaOriginal) {
            // Adiciona especialização se tiver
            const periciaParaEditar = {
                ...periciaOriginal,
                especializacao: periciaAprendida.especializacao,
                nomeCompleto: periciaAprendida.nomeCompleto || periciaAprendida.nome
            };
            
            abrirModalPericia(periciaParaEditar, periciaAprendida);
        } else {
            // Fallback: usa a própria perícia aprendida
            abrirModalPericia(periciaAprendida, periciaAprendida);
        }
        
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
            if (dados.DX !== undefined) estadoPericias.atributos.DX = dados.DX;
            if (dados.IQ !== undefined) estadoPericias.atributos.IQ = dados.IQ;
            if (dados.HT !== undefined) estadoPericias.atributos.HT = dados.HT;
            if (dados.PERC !== undefined) estadoPericias.atributos.PERC = dados.PERC;
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
        
        if (estadoPericias.atributos) {
            localStorage.setItem('gurps_atributos', JSON.stringify(estadoPericias.atributos));
        }
        
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

// ===== EXPORTAR FUNÇÕES =====
window.initPericiasTab = initPericiasTab;
window.abrirModalPericia = abrirModalPericia;
window.fecharModalPericia = fecharModalPericia;
window.alterarNivelPericiaDropdown = alterarNivelPericiaDropdown;
window.confirmarPericia = confirmarPericia;
window.selecionarEspecializacaoInicial = selecionarEspecializacaoInicial;
window.abrirInputEspecializacaoPersonalizada = abrirInputEspecializacaoPersonalizada;
window.confirmarEspecializacaoPersonalizada = confirmarEspecializacaoPersonalizada;
window.confirmarEspecializacaoInicial = confirmarEspecializacaoInicial;
window.fecharModalEspecializacao = fecharModalEspecializacao;
window.removerPericia = removerPericia;
window.editarPericia = editarPericia;
window.renderizarCatalogoPericias = renderizarCatalogoPericias;
window.renderizarPericiasAprendidas = renderizarPericiasAprendidas;
window.filtrarPericiasPor = filtrarPericiasPor;
window.obterTabelaCusto = obterTabelaCusto;
window.calcularCustoParaNivel = calcularCustoParaNivel;
window.calcularCustoAtualizacao = calcularCustoAtualizacao;

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de Perícias carregado');
    
    setTimeout(() => {
        const periciasTab = document.getElementById('pericias');
        if (periciasTab && (periciasTab.classList.contains('active') || 
            periciasTab.style.display !== 'none')) {
            if (typeof window.initPericiasTab === 'function') {
                window.initPericiasTab();
            }
        } else {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && 
                        mutation.attributeName === 'class' &&
                        periciasTab.classList.contains('active')) {
                        if (typeof window.initPericiasTab === 'function') {
                            window.initPericiasTab();
                        }
                        observer.disconnect();
                    }
                });
            });
            
            if (periciasTab) observer.observe(periciasTab, { attributes: true });
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

console.log('🎮 Sistema de Perícias (VERSÃO ESTÁVEL) carregado!');