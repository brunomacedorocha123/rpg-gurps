// ============================================
// TECNICAS.JS - SISTEMA COMPLETO COM MODAL FUNCIONAL
// ============================================

console.log("🎯 SISTEMA DE TÉCNICAS INICIADO");

// ===== 1. CONFIGURAÇÃO =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        modificadorBase: -4,
        prereq: ["Arco", "Cavalgar"],
        custoTabela: { 2: 1, 3: 2, 4: 3, 5: 4 }
    }
];

let estadoTecnicas = {
    aprendidas: [],
    pontosTotais: 0
};

let tecnicaSelecionada = null;

// ===== 2. FUNÇÕES BÁSICAS =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_aprendidas');
        if (salvo) estadoTecnicas.aprendidas = JSON.parse(salvo);
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) estadoTecnicas.pontosTotais = parseInt(pontos);
        
        console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

function salvarTecnicas() {
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
    localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
}

// ===== 3. CONEXÃO COM PERÍCIAS =====
function buscarPericiasAprendidas() {
    // Direto do seu sistema principal
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        return window.estadoPericias.periciasAprendidas;
    }
    
    // Fallback do localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.periciasAprendidas) return parsed.periciasAprendidas;
        }
    } catch (e) {}
    
    return [];
}

function temPericia(nomePericia) {
    const pericias = buscarPericiasAprendidas();
    
    for (const pericia of pericias) {
        if (!pericia || !pericia.nome) continue;
        
        const nomeBase = pericia.nome.trim();
        const nomeCompleto = pericia.nomeCompleto || nomeBase;
        
        // Verifica pelo nome
        if (nomeBase.toLowerCase() === nomePericia.toLowerCase()) {
            return { tem: true, nivel: pericia.nivel || 0 };
        }
        
        // Verifica se contém o nome (para Cavalgar)
        if (nomeCompleto.toLowerCase().includes(nomePericia.toLowerCase())) {
            return { tem: true, nivel: pericia.nivel || 0 };
        }
    }
    
    return { tem: false, nivel: 0 };
}

// ===== 4. RENDERIZAÇÃO =====
function renderizarCatalogoTecnicas() {
    console.log("🎨 Renderizando catálogo...");
    
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado");
        return;
    }
    
    container.innerHTML = '';
    
    if (CATALOGO_TECNICAS.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma técnica disponível</div>';
        return;
    }
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        
        // Verifica pré-requisitos
        const arco = temPericia("Arco");
        const cavalgar = temPericia("Cavalgar");
        const prereqCumpridos = arco.tem && cavalgar.tem;
        
        // Determina status
        let statusClass = 'disponivel';
        let statusText = 'Disponível';
        let btnText = 'Adquirir';
        let btnIcon = 'fa-plus-circle';
        let disabled = false;
        
        if (jaAprendida) {
            statusClass = 'aprendida';
            statusText = 'Aprendida';
            btnText = 'Editar';
            btnIcon = 'fa-edit';
        } else if (!prereqCumpridos) {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            disabled = true;
        }
        
        // Cria o card
        const card = document.createElement('div');
        card.className = 'tecnica-item';
        card.dataset.id = tecnica.id;
        
        card.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome-container">
                    <div class="tecnica-nome">
                        <i class="${tecnica.icone}"></i>
                        ${tecnica.nome}
                    </div>
                    <div class="tecnica-tags">
                        <span class="tecnica-dificuldade ${tecnica.dificuldade.toLowerCase()}">${tecnica.dificuldade}</span>
                        <span class="tecnica-tipo">${tecnica.periciaBase}</span>
                    </div>
                </div>
                <div class="tecnica-status">
                    <span class="tecnica-status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
            
            <div class="tecnica-descricao">
                <p>${tecnica.descricao}</p>
            </div>
            
            <div class="tecnica-info-rapida">
                <div class="info-item">
                    <i class="fas fa-bullseye"></i>
                    <span>Base: ${tecnica.periciaBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-arrow-up"></i>
                    <span>Mod: ${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-coins"></i>
                    <span>Custo: 2 pts/nível</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                <span>${tecnica.prereq.join(', ')}</span>
                <div class="prereq-status">
                    <span class="${arco.tem ? 'cumprido' : 'pendente'}">
                        <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i> Arco
                    </span>
                    <span class="${cavalgar.tem ? 'cumprido' : 'pendente'}">
                        <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i> Cavalgar
                    </span>
                </div>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica ${statusClass}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${disabled ? 'disabled' : ''}>
                    <i class="fas ${btnIcon}"></i>
                    ${btnText}
                </button>
            </div>
        `;
        
        if (statusClass === 'bloqueada') {
            card.style.opacity = '0.7';
            card.style.cursor = 'not-allowed';
        }
        
        container.appendChild(card);
    });
    
    console.log("✅ Catálogo renderizado");
}

function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você adquirir aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    estadoTecnicas.aprendidas.forEach(tecnicaAprendida => {
        const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaBase) return;
        
        const periciaBase = temPericia(tecnicaBase.periciaBase);
        const nhBase = periciaBase.tem ? periciaBase.nivel : 0;
        const nhTecnica = Math.min(
            nhBase + (tecnicaAprendida.niveis || 0) + tecnicaBase.modificadorBase,
            nhBase
        );
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida-item';
        card.dataset.id = tecnicaAprendida.id;
        
        card.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${tecnicaBase.icone}"></i>
                    <span>${tecnicaBase.nome}</span>
                </div>
                <div class="tecnica-aprendida-nh">
                    NH <span class="nh-valor">${nhTecnica}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-info">
                <div class="info-row">
                    <span>Perícia Base:</span>
                    <strong>${tecnicaBase.periciaBase} (NH ${nhBase})</strong>
                </div>
                <div class="info-row">
                    <span>Níveis:</span>
                    <strong>+${tecnicaAprendida.niveis || 0}</strong>
                </div>
                <div class="info-row">
                    <span>Pontos:</span>
                    <strong>${tecnicaAprendida.pontos || 0} pts</strong>
                </div>
            </div>
            
            <div class="tecnica-aprendida-actions">
                <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function atualizarEstatisticas() {
    const elementos = [
        { id: 'total-tecnicas', valor: estadoTecnicas.aprendidas.length },
        { id: 'pontos-tecnicas', valor: estadoTecnicas.pontosTotais },
        { id: 'pontos-tecnicas-aprendidas', valor: `${estadoTecnicas.pontosTotais} pts` }
    ];
    
    elementos.forEach(elem => {
        const el = document.getElementById(elem.id);
        if (el) el.textContent = elem.valor;
    });
}

// ===== 5. MODAL COMPLETO E FUNCIONAL =====
function abrirModalTecnica(id) {
    console.log(`📖 Abrindo modal para: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error("Técnica não encontrada:", id);
        return;
    }
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    
    // Verifica pré-requisitos
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    const prereqCumpridos = arco.tem && cavalgar.tem;
    
    // Obtém NH da perícia base
    const periciaBaseInfo = temPericia(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.tem ? periciaBaseInfo.nivel : 0;
    
    // Cria modal HTML completo
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <!-- DESCRIÇÃO -->
                <div class="modal-tecnica-descricao">
                    <h4>Descrição</h4>
                    <p class="modal-tecnica-descricao-texto">${tecnica.descricao}</p>
                </div>
                
                <!-- INFORMAÇÕES BÁSICAS -->
                <div class="modal-tecnica-info">
                    <div class="info-row">
                        <span class="info-label">Dificuldade:</span>
                        <span class="info-value modal-tecnica-dificuldade">${tecnica.dificuldade}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Perícia Base:</span>
                        <span class="info-value modal-tecnica-pericia">${tecnica.periciaBase} (NH ${nhPericiaBase})</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Modificador Base:</span>
                        <span class="info-value modal-tecnica-modificador">${tecnica.modificadorBase}</span>
                    </div>
                </div>
                
                <!-- PRÉ-REQUISITOS -->
                <div class="modal-tecnica-prereq-status" id="modal-prereq-status">
                    <h4>Status dos Pré-requisitos</h4>
                    <div class="prereq-status-list">
                        <div class="prereq-status-item ${arco.tem ? 'cumprido' : 'nao-cumprido'}">
                            <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i>
                            <div class="prereq-status-text">
                                <span>Arco</span>
                                <small>Nível atual: ${arco.nivel} | Necessário: 1+</small>
                            </div>
                        </div>
                        <div class="prereq-status-item ${cavalgar.tem ? 'cumprido' : 'nao-cumprido'}">
                            <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
                            <div class="prereq-status-text">
                                <span>Cavalgar</span>
                                <small>Nível atual: ${cavalgar.nivel} | Necessário: 1+</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${prereqCumpridos ? `
                <!-- CONTROLE DE PONTOS -->
                <div class="modal-tecnica-controles">
                    <div class="controle-pontos">
                        <h4>Investir Pontos</h4>
                        <div class="pontos-opcoes">
                            <div class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 2 ? 'selecionado' : ''}" 
                                 data-pontos="2" data-niveis="1" onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">2 pts</span>
                                <span class="niveis-valor">= +1 nível</span>
                            </div>
                            <div class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 3 ? 'selecionado' : ''}"
                                 data-pontos="3" data-niveis="2" onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">3 pts</span>
                                <span class="niveis-valor">= +2 níveis</span>
                            </div>
                            <div class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 4 ? 'selecionado' : ''}"
                                 data-pontos="4" data-niveis="3" onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">4 pts</span>
                                <span class="niveis-valor">= +3 níveis</span>
                            </div>
                            <div class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 5 ? 'selecionado' : ''}"
                                 data-pontos="5" data-niveis="4" onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">5 pts</span>
                                <span class="niveis-valor">= +4 níveis</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- VISUALIZAÇÃO DO NH -->
                    <div class="visualizacao-nh">
                        <h4>Nível de Habilidade (NH)</h4>
                        <div class="nh-calculado">
                            <div class="nh-base">
                                <span>Perícia Base: </span>
                                <strong id="nh-base-tecnica">${nhPericiaBase}</strong>
                            </div>
                            <div class="nh-modificador">
                                <span>Modificador Técnica: </span>
                                <strong id="nh-mod-tecnica">${tecnica.modificadorBase}</strong>
                            </div>
                            <div class="nh-total">
                                <span>NH Final: </span>
                                <strong id="nh-total-tecnica">${Math.min(nhPericiaBase + tecnica.modificadorBase, nhPericiaBase)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- RESUMO DO CUSTO -->
                <div class="modal-tecnica-resumo">
                    <div class="resumo-item">
                        <span>Pontos Investidos:</span>
                        <strong id="resumo-pontos">${tecnicaAprendida ? tecnicaAprendida.pontos : 0}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis Adquiridos:</span>
                        <strong id="resumo-niveis">+${tecnicaAprendida ? tecnicaAprendida.niveis : 0}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH da Técnica:</span>
                        <strong id="resumo-nh">${tecnicaAprendida ? 
                            Math.min(nhPericiaBase + tecnicaAprendida.niveis + tecnica.modificadorBase, nhPericiaBase) : 
                            Math.min(nhPericiaBase + tecnica.modificadorBase, nhPericiaBase)}</strong>
                    </div>
                </div>
                ` : `
                <!-- MENSAGEM DE BLOQUEIO -->
                <div class="prereq-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Você precisa cumprir todos os pré-requisitos para adquirir esta técnica</span>
                </div>
                `}
            </div>
            
            <div class="modal-tecnica-footer">
                <div class="modal-custo-total">
                    <span class="label">Custo Total:</span>
                    <span class="valor" id="modal-custo-total-tecnica">${tecnicaAprendida ? tecnicaAprendida.pontos : 0}</span>
                    <span> pontos</span>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancelar" onclick="fecharModalTecnica()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-modal btn-modal-confirmar" 
                            onclick="confirmarTecnica('${id}')"
                            id="btn-confirmar-tecnica"
                            ${prereqCumpridos ? '' : 'disabled'}>
                        <i class="fas fa-check"></i> ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Insere no modal
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
        
        // Seleciona opção inicial se já tiver a técnica
        if (tecnicaAprendida) {
            const opcao = document.querySelector(`.opcao-pontos[data-pontos="${tecnicaAprendida.pontos}"]`);
            if (opcao) {
                opcao.classList.add('selecionado');
                tecnicaSelecionada = {
                    id: id,
                    pontos: tecnicaAprendida.pontos,
                    niveis: tecnicaAprendida.niveis
                };
            }
        } else {
            // Seleciona primeira opção por padrão
            const primeiraOpcao = document.querySelector('.opcao-pontos');
            if (primeiraOpcao) {
                primeiraOpcao.classList.add('selecionado');
                tecnicaSelecionada = {
                    id: id,
                    pontos: parseInt(primeiraOpcao.dataset.pontos),
                    niveis: parseInt(primeiraOpcao.dataset.niveis)
                };
            }
        }
    }
    
    // Mostra o modal
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    console.log("✅ Modal aberto com sucesso");
}

function selecionarOpcaoTecnica(elemento, id) {
    // Remove seleção de todas as opções
    document.querySelectorAll('.opcao-pontos').forEach(op => {
        op.classList.remove('selecionado');
    });
    
    // Adiciona seleção na opção clicada
    elemento.classList.add('selecionado');
    
    // Atualiza os dados da técnica selecionada
    tecnicaSelecionada = {
        id: id,
        pontos: parseInt(elemento.dataset.pontos),
        niveis: parseInt(elemento.dataset.niveis)
    };
    
    // Atualiza os displays
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const periciaBaseInfo = temPericia(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.tem ? periciaBaseInfo.nivel : 0;
    
    // Calcula NH da técnica (nunca excede o NH da perícia base)
    const nhTecnica = Math.min(
        nhPericiaBase + tecnicaSelecionada.niveis + tecnica.modificadorBase,
        nhPericiaBase
    );
    
    // Atualiza os elementos do modal
    const custoTotal = document.getElementById('modal-custo-total-tecnica');
    const resumoPontos = document.getElementById('resumo-pontos');
    const resumoNiveis = document.getElementById('resumo-niveis');
    const resumoNh = document.getElementById('resumo-nh');
    const nhTotal = document.getElementById('nh-total-tecnica');
    
    if (custoTotal) custoTotal.textContent = tecnicaSelecionada.pontos;
    if (resumoPontos) resumoPontos.textContent = tecnicaSelecionada.pontos;
    if (resumoNiveis) resumoNiveis.textContent = `+${tecnicaSelecionada.niveis}`;
    if (resumoNh) resumoNh.textContent = nhTecnica;
    if (nhTotal) nhTotal.textContent = nhTecnica;
}

function confirmarTecnica(id) {
    if (!tecnicaSelecionada || tecnicaSelecionada.id !== id) {
        console.error("Nenhuma técnica selecionada");
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const { pontos, niveis } = tecnicaSelecionada;
    
    // Verifica pré-requisitos novamente
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    
    if (!arco.tem || !cavalgar.tem) {
        alert('❌ Você ainda não cumpriu todos os pré-requisitos!');
        return;
    }
    
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    const novaTecnica = {
        id: id,
        nome: tecnica.nome,
        pontos: pontos,
        niveis: niveis,
        periciaBase: tecnica.periciaBase,
        modificadorBase: tecnica.modificadorBase,
        data: new Date().toISOString()
    };
    
    let mensagem = '';
    
    if (indexExistente >= 0) {
        // Atualiza técnica existente
        const pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
        const diferencaPontos = pontos - pontosAntigos;
        
        estadoTecnicas.aprendidas[indexExistente] = novaTecnica;
        estadoTecnicas.pontosTotais += diferencaPontos;
        
        mensagem = `📝 ${tecnica.nome} atualizada!`;
        console.log(`Técnica atualizada: ${tecnica.nome} (+${diferencaPontos} pts)`);
    } else {
        // Adiciona nova técnica
        estadoTecnicas.aprendidas.push(novaTecnica);
        estadoTecnicas.pontosTotais += pontos;
        
        mensagem = `✅ ${tecnica.nome} adquirida!`;
        console.log(`Nova técnica: ${tecnica.nome} (${pontos} pts)`);
    }
    
    // Salva no localStorage
    salvarTecnicas();
    
    // Fecha o modal
    fecharModalTecnica();
    
    // Atualiza a interface
    renderizarTodasTecnicas();
    
    // Mostra notificação
    mostrarNotificacao(mensagem, 'success');
}

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica?')) return;
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    // Remove os pontos
    const pontosRemovidos = estadoTecnicas.aprendidas[index].pontos;
    estadoTecnicas.pontosTotais -= pontosRemovidos;
    
    // Remove do array
    estadoTecnicas.aprendidas.splice(index, 1);
    
    // Salva no localStorage
    salvarTecnicas();
    
    // Atualiza a interface
    renderizarTodasTecnicas();
    
    // Mostra notificação
    mostrarNotificacao('🗑️ Técnica removida!', 'warning');
    
    console.log(`Técnica removida: ${id}`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    tecnicaSelecionada = null;
}

// ===== 6. UTILIDADES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remove notificação anterior se existir
    const notificacaoAnterior = document.querySelector('.notificacao-tecnica');
    if (notificacaoAnterior) notificacaoAnterior.remove();
    
    // Cria nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-tecnica ${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    // Mostra a notificação
    setTimeout(() => notificacao.classList.add('show'), 10);
    
    // Remove após 3 segundos
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => {
            if (notificacao.parentNode) notificacao.parentNode.removeChild(notificacao);
        }, 300);
    }, 3000);
}

// ===== 7. INICIALIZAÇÃO =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticas();
}

function inicializarTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carrega dados salvos
    carregarTecnicas();
    
    // Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            console.log("🔄 Atualizando técnicas manualmente...");
            renderizarTodasTecnicas();
        });
    }
    
    // Renderiza inicialmente
    renderizarTodasTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado");
}

// ===== 8. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando técnicas");
    
    // Quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            
            if (subtab === 'tecnicas') {
                console.log("🎯 Aba de técnicas ativada");
                setTimeout(inicializarTecnicas, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        console.log("✅ Aba de técnicas já ativa");
        setTimeout(inicializarTecnicas, 200);
    }
});

// ===== 9. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;

console.log("✅ TECNICAS.JS - SISTEMA COMPLETO CARREGADO");