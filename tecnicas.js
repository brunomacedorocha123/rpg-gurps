// ============================================
// TÉCNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

console.log("🔥 TÉCNICAS.JS - SISTEMA INICIANDO");

// ===== 1. VARIÁVEIS GLOBAIS =====
let tecnicasAprendidas = [];
let tecnicaSelecionada = null;
let nivelTecnicaAtual = 0;
let pontosTecnicaAtuais = 0;

// ===== 2. CATÁLOGO DE TÉCNICAS =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Esta técnica permite que o personagem utilize um arco com eficiência, ao mesmo tempo em que está cavalgando.",
        regraEspecial: "Os modificadores para disparar sobre um cavalo nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        modificadorBase: -4,
        prereq: {
            pericias: ["Arco", "Cavalgar"],
            nivelMinimo: 1
        },
        custoTabela: {
            "medio": { 1: 1, 2: 2, 3: 3, 4: 4 },       // Médio: +1 = 1 ponto, +2 = 2 pontos, etc.
            "dificil": { 1: 2, 2: 3, 3: 4, 4: 5 }      // Difícil: +1 = 2 pontos, +2 = 3 pontos, etc.
        }
    },
    {
        id: "atirar-movimento",
        nome: "Atirar em Movimento",
        icone: "fas fa-running",
        descricao: "Permite atirar enquanto se move sem penalidades severas.",
        dificuldade: "Média",
        periciaBase: "Arma de Fogo",
        atributo: "DX",
        modificadorBase: -2,
        prereq: {
            pericias: ["Arma de Fogo"],
            nivelMinimo: 1
        },
        custoTabela: {
            "medio": { 1: 1, 2: 2, 3: 3, 4: 4 },
            "dificil": { 1: 2, 2: 3, 3: 4, 4: 5 }
        }
    },
    {
        id: "combate-duas-armas",
        nome: "Combate com Duas Armas",
        icone: "fas fa-fist-raised",
        descricao: "Permite lutar eficientemente com uma arma em cada mão.",
        dificuldade: "Difícil",
        periciaBase: "Esgrima",
        atributo: "DX",
        modificadorBase: -4,
        prereq: {
            pericias: ["Esgrima", "Arma Curta"],
            nivelMinimo: 2
        },
        custoTabela: {
            "medio": { 1: 1, 2: 2, 3: 3, 4: 4 },
            "dificil": { 1: 2, 2: 3, 3: 4, 4: 5 }
        }
    }
];

// ===== 3. INICIALIZAÇÃO DO SISTEMA =====
function inicializarTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas aprendidas do localStorage
    carregarTecnicas();
    
    // Configurar eventos dos botões das sub-abas
    configurarSubAbas();
    
    // Verificar se a aba de técnicas já está ativa
    if (verificarAbaAtiva('tecnicas')) {
        renderizarTodasTecnicas();
    }
    
    console.log("✅ Sistema de técnicas inicializado!");
}

// ===== 4. CONFIGURAÇÃO DAS SUB-ABAS =====
function configurarSubAbas() {
    const botoesSubAbas = document.querySelectorAll('.subtab-btn-pericias');
    
    botoesSubAbas.forEach(botao => {
        botao.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            console.log(`🎯 Clicou na sub-aba: ${subtab}`);
            
            if (subtab === 'tecnicas') {
                // Pequeno delay para garantir que a aba foi renderizada
                setTimeout(() => {
                    renderizarTodasTecnicas();
                }, 100);
            }
        });
    });
    
    console.log("✅ Eventos das sub-abas configurados");
}

// ===== 5. RENDERIZAÇÃO DAS TÉCNICAS =====
function renderizarTodasTecnicas() {
    console.log("🎨 Renderizando todas as técnicas...");
    
    // Renderizar catálogo de técnicas
    renderizarCatalogoTecnicas();
    
    // Renderizar técnicas aprendidas
    renderizarTecnicasAprendidas();
    
    // Atualizar contadores
    atualizarContadoresTecnicas();
}

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    container.innerHTML = '';
    
    if (CATALOGO_TECNICAS.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tools"></i>
                <h4>Nenhuma técnica disponível</h4>
                <p>As técnicas aparecerão aqui quando disponíveis</p>
            </div>
        `;
        return;
    }
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const tecnicaElement = criarCardTecnica(tecnica);
        container.appendChild(tecnicaElement);
    });
    
    console.log(`✅ ${CATALOGO_TECNICAS.length} técnicas renderizadas no catálogo`);
}

function criarCardTecnica(tecnica) {
    const jaAprendida = tecnicasAprendidas.some(t => t.id === tecnica.id);
    const nivelAtual = jaAprendida ? 
        tecnicasAprendidas.find(t => t.id === tecnica.id).nivel : 0;
    
    const card = document.createElement('div');
    card.className = 'tecnica-item';
    card.dataset.id = tecnica.id;
    
    card.innerHTML = `
        <div class="tecnica-header">
            <div class="tecnica-info-principal">
                <div class="tecnica-titulo">
                    <i class="${tecnica.icone}"></i>
                    <h4>${tecnica.nome}</h4>
                    <span class="dificuldade-badge ${tecnica.dificuldade.toLowerCase()}">
                        ${tecnica.dificuldade}
                    </span>
                </div>
                <div class="tecnica-base">
                    <span class="base-label">Base:</span>
                    <span class="base-valor">${tecnica.periciaBase} (${tecnica.atributo})</span>
                </div>
            </div>
            <div class="tecnica-status">
                ${jaAprendida ? 
                    `<div class="status-aprendida">
                        <i class="fas fa-check-circle"></i>
                        <span>Nível ${nivelAtual}</span>
                    </div>` :
                    `<div class="status-disponivel">
                        <i class="fas fa-unlock"></i>
                        <span>Disponível</span>
                    </div>`
                }
            </div>
        </div>
        
        <div class="tecnica-descricao">
            <p>${tecnica.descricao}</p>
            ${tecnica.regraEspecial ? `<p class="regra-especial"><strong>Regra:</strong> ${tecnica.regraEspecial}</p>` : ''}
        </div>
        
        <div class="tecnica-detalhes">
            <div class="detalhe-item">
                <span class="detalhe-label"><i class="fas fa-balance-scale"></i> Dificuldade:</span>
                <span class="detalhe-valor">${tecnica.dificuldade}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label"><i class="fas fa-bullseye"></i> Mod. Base:</span>
                <span class="detalhe-valor">${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label"><i class="fas fa-coins"></i> Custo:</span>
                <span class="detalhe-valor">${tecnica.dificuldade === 'Difícil' ? '2 pts/nível' : '1 pt/nível'}</span>
            </div>
        </div>
        
        <div class="tecnica-prereq">
            <div class="prereq-titulo">
                <i class="fas fa-clipboard-check"></i>
                <strong>Pré-requisitos:</strong>
            </div>
            <div class="prereq-lista">
                ${tecnica.prereq.pericias.map(pericia => 
                    `<div class="prereq-item">
                        <i class="fas fa-check-circle"></i>
                        <span>${pericia}</span>
                    </div>`
                ).join('')}
            </div>
        </div>
        
        <div class="tecnica-acoes">
            ${jaAprendida ? 
                `<button class="btn-tecnica btn-editar" onclick="editarTecnica('${tecnica.id}')">
                    <i class="fas fa-edit"></i> Editar Nível
                </button>
                <button class="btn-tecnica btn-remover" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>` :
                `<button class="btn-tecnica btn-adquirir" onclick="abrirModalTecnica('${tecnica.id}')">
                    <i class="fas fa-plus-circle"></i> Adquirir Técnica
                </button>`
            }
        </div>
    `;
    
    return card;
}

// ===== 6. TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error("❌ Container #tecnicas-aprendidas não encontrado!");
        return;
    }
    
    container.innerHTML = '';
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você adquirir aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    tecnicasAprendidas.forEach(tecnicaAprendida => {
        const tecnicaOriginal = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaOriginal) return;
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida-item';
        
        card.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-titulo">
                    <i class="${tecnicaOriginal.icone}"></i>
                    <h4>${tecnicaOriginal.nome}</h4>
                </div>
                <div class="tecnica-aprendida-nivel">
                    <span class="nivel-label">Nível:</span>
                    <span class="nivel-valor">${tecnicaAprendida.nivel}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-info">
                <div class="info-item">
                    <span class="info-label">Perícia Base:</span>
                    <span class="info-valor">${tecnicaOriginal.periciaBase}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Investimento:</span>
                    <span class="info-valor">${tecnicaAprendida.pontos} pontos</span>
                </div>
                <div class="info-item">
                    <span class="info-label">NH Efetivo:</span>
                    <span class="info-valor">${calcularNHTecnica(tecnicaAprendida, tecnicaOriginal)}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-limite">
                <i class="fas fa-info-circle"></i>
                <small>Não pode exceder o NH em ${tecnicaOriginal.periciaBase}</small>
            </div>
            
            <div class="tecnica-aprendida-acoes">
                <button class="btn-nivel-controle btn-diminuir" onclick="alterarNivelTecnica('${tecnicaAprendida.id}', -1)">
                    <i class="fas fa-minus"></i>
                </button>
                <button class="btn-nivel-controle btn-aumentar" onclick="alterarNivelTecnica('${tecnicaAprendida.id}', 1)">
                    <i class="fas fa-plus"></i>
                </button>
                <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${tecnicasAprendidas.length} técnicas aprendidas renderizadas`);
}

// ===== 7. MODAL DE TÉCNICA =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    tecnicaSelecionada = tecnica;
    nivelTecnicaAtual = 0;
    pontosTecnicaAtuais = 0;
    
    // Criar overlay do modal
    const overlay = document.createElement('div');
    overlay.className = 'modal-tecnica-overlay';
    overlay.id = 'modal-tecnica-overlay';
    
    // Determinar custo por nível
    const custoPorNivel = tecnica.dificuldade === 'Difícil' ? 2 : 1;
    
    overlay.innerHTML = `
        <div class="modal-tecnica">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <div class="modal-tecnica-info">
                    <div class="info-row">
                        <span class="info-label">Perícia Base:</span>
                        <span class="info-value">${tecnica.periciaBase} (${tecnica.atributo})</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Dificuldade:</span>
                        <span class="info-value">${tecnica.dificuldade}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Custo por Nível:</span>
                        <span class="info-value">${custoPorNivel} ponto(s)</span>
                    </div>
                </div>
                
                <div class="modal-tecnica-descricao">
                    <h4>Descrição</h4>
                    <p>${tecnica.descricao}</p>
                    ${tecnica.regraEspecial ? `<p><strong>Regra Especial:</strong> ${tecnica.regraEspecial}</p>` : ''}
                </div>
                
                <div class="modal-tecnica-prereq">
                    <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                    <div class="prereq-lista">
                        ${tecnica.prereq.pericias.map(pericia => 
                            `<div class="prereq-item">
                                <i class="fas fa-check"></i>
                                <span>${pericia}</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                
                <div class="modal-tecnica-controles">
                    <div class="controle-nivel">
                        <h4>Nível da Técnica</h4>
                        <div class="controle-nivel-botoes">
                            <button class="btn-nivel btn-diminuir" onclick="alterarNivelModal(-1)" ${nivelTecnicaAtual === 0 ? 'disabled' : ''}>-</button>
                            <div class="nivel-atual">
                                <div class="valor" id="modal-nivel-tecnica">+0</div>
                                <div class="label">Nível</div>
                            </div>
                            <button class="btn-nivel btn-aumentar" onclick="alterarNivelModal(1)" ${nivelTecnicaAtual === 4 ? 'disabled' : ''}>+</button>
                        </div>
                        <div class="nivel-info">
                            <small>Máximo: +4 níveis</small>
                        </div>
                    </div>
                    
                    <div class="controle-pontos">
                        <div class="pontos-info">
                            <span>Custo: </span>
                            <span id="modal-pontos-tecnica">0</span>
                            <span> ponto(s)</span>
                        </div>
                        <div class="pontos-detalhes">
                            <small>${tecnica.dificuldade === 'Difícil' ? 
                                '2 pontos por nível (Difícil)' : 
                                '1 ponto por nível (Média)'}</small>
                        </div>
                    </div>
                </div>
                
                <div class="modal-tecnica-tabela">
                    <h4>Tabela de Custos</h4>
                    <div class="tabela-custos">
                        ${tecnica.dificuldade === 'Difícil' ? 
                            `<div class="tabela-item ${nivelTecnicaAtual === 0 ? 'ativo' : ''}">+0 = 0 pts</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 1 ? 'ativo' : ''}">+1 = 2 pts</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 2 ? 'ativo' : ''}">+2 = 3 pts</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 3 ? 'ativo' : ''}">+3 = 4 pts</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 4 ? 'ativo' : ''}">+4 = 5 pts</div>` :
                            `<div class="tabela-item ${nivelTecnicaAtual === 0 ? 'ativo' : ''}">+0 = 0 pts</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 1 ? 'ativo' : ''}">+1 = 1 pt</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 2 ? 'ativo' : ''}">+2 = 2 pts</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 3 ? 'ativo' : ''}">+3 = 3 pts</div>
                             <div class="tabela-item ${nivelTecnicaAtual === 4 ? 'ativo' : ''}">+4 = 4 pts</div>`
                        }
                    </div>
                </div>
            </div>
            
            <div class="modal-tecnica-footer">
                <div class="modal-custo-total">
                    <span class="label">Custo Total:</span>
                    <span class="valor" id="modal-custo-total-tecnica">0</span>
                    <span> pontos</span>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal btn-modal-cancelar" onclick="fecharModalTecnica()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-modal btn-modal-confirmar" onclick="confirmarTecnica()" id="btn-confirmar-tecnica">
                        <i class="fas fa-check"></i> Adquirir Técnica
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    overlay.style.display = 'flex';
    
    console.log(`✅ Modal aberto para: ${tecnica.nome}`);
}

function alterarNivelModal(quantidade) {
    const novoNivel = nivelTecnicaAtual + quantidade;
    
    if (novoNivel >= 0 && novoNivel <= 4) {
        nivelTecnicaAtual = novoNivel;
        
        // Calcular pontos baseado na dificuldade
        if (tecnicaSelecionada.dificuldade === 'Difícil') {
            // Difícil: +1 = 2 pts, +2 = 3 pts, +3 = 4 pts, +4 = 5 pts
            pontosTecnicaAtuais = nivelTecnicaAtual === 0 ? 0 : 
                                 nivelTecnicaAtual === 1 ? 2 :
                                 nivelTecnicaAtual === 2 ? 3 :
                                 nivelTecnicaAtual === 3 ? 4 : 5;
        } else {
            // Média: 1 ponto por nível
            pontosTecnicaAtuais = nivelTecnicaAtual;
        }
        
        // Atualizar interface
        atualizarModalTecnica();
    }
}

function atualizarModalTecnica() {
    // Atualizar nível
    const nivelElement = document.getElementById('modal-nivel-tecnica');
    const pontosElement = document.getElementById('modal-pontos-tecnica');
    const custoElement = document.getElementById('modal-custo-total-tecnica');
    
    if (nivelElement) nivelElement.textContent = `+${nivelTecnicaAtual}`;
    if (pontosElement) pontosElement.textContent = pontosTecnicaAtuais;
    if (custoElement) custoElement.textContent = pontosTecnicaAtuais;
    
    // Atualizar botões
    const btnDiminuir = document.querySelector('.btn-diminuir');
    const btnAumentar = document.querySelector('.btn-aumentar');
    const btnConfirmar = document.getElementById('btn-confirmar-tecnica');
    
    if (btnDiminuir) btnDiminuir.disabled = nivelTecnicaAtual === 0;
    if (btnAumentar) btnAumentar.disabled = nivelTecnicaAtual === 4;
    
    // Atualizar tabela
    document.querySelectorAll('.tabela-item').forEach((item, index) => {
        item.classList.toggle('ativo', index === nivelTecnicaAtual);
    });
    
    // Habilitar/desabilitar botão de confirmar
    if (btnConfirmar) {
        btnConfirmar.disabled = nivelTecnicaAtual === 0;
        btnConfirmar.textContent = nivelTecnicaAtual === 0 ? 
            'Selecione um nível' : 
            `Adquirir Técnica (${pontosTecnicaAtuais} pts)`;
    }
}

function confirmarTecnica() {
    if (!tecnicaSelecionada || nivelTecnicaAtual === 0) return;
    
    // Verificar se já existe
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === tecnicaSelecionada.id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        tecnicasAprendidas[indexExistente] = {
            id: tecnicaSelecionada.id,
            nome: tecnicaSelecionada.nome,
            nivel: nivelTecnicaAtual,
            pontos: pontosTecnicaAtuais,
            dataAdquisicao: new Date().toISOString()
        };
    } else {
        // Adicionar nova técnica
        tecnicasAprendidas.push({
            id: tecnicaSelecionada.id,
            nome: tecnicaSelecionada.nome,
            nivel: nivelTecnicaAtual,
            pontos: pontosTecnicaAtuais,
            dataAdquisicao: new Date().toISOString()
        });
    }
    
    // Salvar no localStorage
    salvarTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Atualizar interface
    renderizarTodasTecnicas();
    
    // Mostrar mensagem
    mostrarNotificacao(`✅ ${tecnicaSelecionada.nome} adquirida no nível +${nivelTecnicaAtual} por ${pontosTecnicaAtuais} pontos!`, 'success');
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.remove();
    }
    tecnicaSelecionada = null;
    nivelTecnicaAtual = 0;
    pontosTecnicaAtuais = 0;
}

// ===== 8. FUNÇÕES DE GERENCIAMENTO =====
function editarTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const tecnicaAprendida = tecnicasAprendidas.find(t => t.id === id);
    
    if (tecnica && tecnicaAprendida) {
        tecnicaSelecionada = tecnica;
        nivelTecnicaAtual = tecnicaAprendida.nivel;
        pontosTecnicaAtuais = tecnicaAprendida.pontos;
        abrirModalTecnica(id);
    }
}

function alterarNivelTecnica(id, quantidade) {
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const tecnicaAprendida = tecnicasAprendidas[index];
    
    let novoNivel = tecnicaAprendida.nivel + quantidade;
    
    // Limites: 1 a 4
    if (novoNivel < 1) novoNivel = 1;
    if (novoNivel > 4) novoNivel = 4;
    
    if (novoNivel !== tecnicaAprendida.nivel) {
        // Calcular novos pontos
        let novosPontos;
        if (tecnica.dificuldade === 'Difícil') {
            novosPontos = novoNivel === 1 ? 2 :
                         novoNivel === 2 ? 3 :
                         novoNivel === 3 ? 4 : 5;
        } else {
            novosPontos = novoNivel;
        }
        
        // Atualizar
        tecnicasAprendidas[index] = {
            ...tecnicaAprendida,
            nivel: novoNivel,
            pontos: novosPontos
        };
        
        // Salvar
        salvarTecnicas();
        
        // Atualizar interface
        renderizarTecnicasAprendidas();
        atualizarContadoresTecnicas();
        
        // Mostrar mensagem
        mostrarNotificacao(
            `📈 ${tecnica.nome} alterada para nível +${novoNivel} (${novosPontos} pts)`,
            'info'
        );
    }
}

function removerTecnica(id) {
    if (confirm('Tem certeza que deseja remover esta técnica?')) {
        tecnicasAprendidas = tecnicasAprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        renderizarTodasTecnicas();
        mostrarNotificacao('🗑️ Técnica removida!', 'info');
    }
}

// ===== 9. FUNÇÕES AUXILIARES =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_aprendidas');
        if (salvo) {
            tecnicasAprendidas = JSON.parse(saldo);
            console.log(`📂 ${tecnicasAprendidas.length} técnica(s) carregada(s)`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
        tecnicasAprendidas = [];
    }
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
        console.log("💾 Técnicas salvas:", tecnicasAprendidas);
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

function calcularNHTecnica(tecnicaAprendida, tecnicaOriginal) {
    // Simulação - na implementação real, buscar NH da perícia base
    const nhBase = 10; // Exemplo
    const modificador = tecnicaOriginal.modificadorBase + tecnicaAprendida.nivel;
    return nhBase + modificador;
}

function atualizarContadoresTecnicas() {
    const pontosElement = document.getElementById('pontos-tecnicas');
    const totalPontos = tecnicasAprendidas.reduce((total, t) => total + t.pontos, 0);
    
    if (pontosElement) {
        pontosElement.textContent = `${totalPontos} pts`;
    }
}

function verificarAbaAtiva(subtab) {
    const aba = document.getElementById(`subtab-${subtab}`);
    return aba && aba.classList.contains('active');
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    // Estilos
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 9999;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(notificacao);
    
    // Animação
    setTimeout(() => {
        notificacao.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(150%)';
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
}

// ===== 10. INJEÇÃO DE CSS =====
function injetarCSSTecnicas() {
    if (document.getElementById('css-tecnicas-injetado')) return;
    
    const css = `
        <style id="css-tecnicas-injetado">
        /* ESTILOS ESPECÍFICOS PARA TÉCNICAS */
        
        /* Item de técnica no catálogo */
        .tecnica-item {
            background: linear-gradient(145deg, rgba(26, 18, 0, 0.8), rgba(44, 32, 8, 0.8));
            border: 1px solid var(--wood-light);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .tecnica-item:hover {
            background: linear-gradient(145deg, rgba(44, 32, 8, 0.9), rgba(26, 18, 0, 0.9));
            border-color: var(--primary-gold);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }
        
        .tecnica-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .tecnica-info-principal {
            flex: 1;
        }
        
        .tecnica-titulo {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
        }
        
        .tecnica-titulo h4 {
            margin: 0;
            color: var(--text-light);
            font-size: 1.1rem;
        }
        
        .tecnica-titulo i {
            color: var(--primary-gold);
        }
        
        .tecnica-base {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.9rem;
        }
        
        .base-label {
            color: rgba(212, 175, 55, 0.8);
        }
        
        .base-valor {
            color: var(--text-light);
            font-weight: bold;
        }
        
        .tecnica-status {
            text-align: right;
        }
        
        .status-aprendida {
            background: rgba(46, 92, 58, 0.3);
            border: 1px solid var(--accent-green);
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 0.85rem;
            color: var(--text-light);
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .status-disponivel {
            background: rgba(212, 175, 55, 0.2);
            border: 1px solid var(--primary-gold);
            border-radius: 4px;
            padding: 5px 10px;
            font-size: 0.85rem;
            color: var(--text-gold);
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        
        .dificuldade-badge {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .dificuldade-badge.fácil {
            background: rgba(76, 175, 80, 0.2);
            border: 1px solid #4CAF50;
            color: #4CAF50;
        }
        
        .dificuldade-badge.media {
            background: rgba(33, 150, 243, 0.2);
            border: 1px solid #2196F3;
            color: #2196F3;
        }
        
        .dificuldade-badge.difícil {
            background: rgba(244, 67, 54, 0.2);
            border: 1px solid #f44336;
            color: #f44336;
        }
        
        .tecnica-descricao {
            color: rgba(245, 245, 220, 0.8);
            font-size: 0.9rem;
            line-height: 1.4;
            margin: 10px 0;
        }
        
        .regra-especial {
            background: rgba(212, 175, 55, 0.1);
            border-left: 3px solid var(--primary-gold);
            padding: 8px 12px;
            margin-top: 8px;
            font-size: 0.85rem;
            color: rgba(212, 175, 55, 0.9);
        }
        
        .tecnica-detalhes {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 15px 0;
            padding: 10px;
            background: rgba(44, 32, 8, 0.4);
            border-radius: 6px;
        }
        
        .detalhe-item {
            text-align: center;
        }
        
        .detalhe-label {
            display: block;
            font-size: 0.8rem;
            color: rgba(212, 175, 55, 0.7);
            margin-bottom: 3px;
        }
        
        .detalhe-valor {
            display: block;
            font-weight: bold;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .tecnica-prereq {
            background: rgba(44, 32, 8, 0.4);
            border-radius: 6px;
            padding: 10px;
            margin: 10px 0;
            border-left: 3px solid var(--accent-red);
        }
        
        .prereq-titulo {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            color: var(--text-gold);
            font-size: 0.9rem;
        }
        
        .prereq-lista {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .prereq-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
            color: var(--text-light);
        }
        
        .prereq-item i {
            color: var(--accent-green);
            font-size: 0.8rem;
        }
        
        .tecnica-acoes {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .btn-tecnica {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            font-family: 'Cinzel', serif;
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        
        .btn-adquirir {
            background: linear-gradient(145deg, var(--accent-green), #1e4028);
            color: white;
        }
        
        .btn-adquirir:hover {
            background: linear-gradient(145deg, #3a7c4a, #1e4028);
            transform: scale(1.05);
        }
        
        .btn-editar {
            background: linear-gradient(145deg, #2196F3, #0D47A1);
            color: white;
        }
        
        .btn-editar:hover {
            background: linear-gradient(145deg, #42A5F5, #1565C0);
            transform: scale(1.05);
        }
        
        .btn-remover {
            background: linear-gradient(145deg, #f44336, #c62828);
            color: white;
        }
        
        .btn-remover:hover {
            background: linear-gradient(145deg, #ef5350, #d32f2f);
            transform: scale(1.05);
        }
        
        /* Técnica aprendida */
        .tecnica-aprendida-item {
            background: linear-gradient(145deg, rgba(26, 18, 0, 0.9), rgba(44, 32, 8, 0.9));
            border: 2px solid var(--wood-light);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
        }
        
        .tecnica-aprendida-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .tecnica-aprendida-titulo {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .tecnica-aprendida-titulo h4 {
            margin: 0;
            color: var(--text-light);
            font-size: 1.1rem;
        }
        
        .tecnica-aprendida-titulo i {
            color: var(--primary-gold);
        }
        
        .tecnica-aprendida-nivel {
            background: rgba(44, 32, 8, 0.6);
            border: 2px solid var(--wood-light);
            border-radius: 6px;
            padding: 5px 15px;
        }
        
        .nivel-label {
            color: rgba(212, 175, 55, 0.8);
            font-size: 0.8rem;
            margin-right: 5px;
        }
        
        .nivel-valor {
            color: var(--text-light);
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .tecnica-aprendida-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 10px 0;
            padding: 10px;
            background: rgba(44, 32, 8, 0.4);
            border-radius: 6px;
        }
        
        .info-item {
            text-align: center;
        }
        
        .info-label {
            display: block;
            font-size: 0.8rem;
            color: rgba(212, 175, 55, 0.7);
            margin-bottom: 3px;
        }
        
        .info-valor {
            display: block;
            font-weight: bold;
            color: var(--text-light);
            font-size: 0.9rem;
        }
        
        .tecnica-aprendida-limite {
            background: rgba(212, 175, 55, 0.1);
            border: 1px solid var(--primary-gold);
            border-radius: 4px;
            padding: 8px;
            margin: 10px 0;
            font-size: 0.8rem;
            color: rgba(212, 175, 55, 0.8);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .tecnica-aprendida-acoes {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .btn-nivel-controle {
            background: rgba(44, 32, 8, 0.8);
            border: 2px solid var(--wood-light);
            border-radius: 6px;
            color: var(--text-light);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-nivel-controle:hover {
            border-color: var(--primary-gold);
            background: rgba(44, 32, 8, 1);
        }
        
        .btn-remover-tecnica {
            flex: 1;
            background: rgba(139, 0, 0, 0.2);
            border: 1px solid var(--accent-red);
            border-radius: 4px;
            padding: 10px;
            color: var(--text-light);
            font-size: 0.85rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        
        .btn-remover-tecnica:hover {
            background: rgba(139, 0, 0, 0.4);
        }
        
        /* Modal de técnica */
        .modal-tecnica-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        }
        
        .modal-tecnica {
            background: linear-gradient(145deg, rgba(26, 18, 0, 0.95), rgba(44, 32, 8, 0.95));
            border: 3px solid var(--primary-gold);
            border-radius: 15px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideIn 0.4s ease;
        }
        
        .modal-tecnica-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-bottom: 2px solid var(--primary-gold);
        }
        
        .modal-tecnica-header h3 {
            color: var(--text-gold);
            font-size: 1.5rem;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .modal-tecnica-close {
            background: none;
            border: none;
            color: var(--text-light);
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }
        
        .modal-tecnica-close:hover {
            background: rgba(139, 0, 0, 0.3);
            color: var(--accent-red);
        }
        
        .modal-tecnica-body {
            padding: 25px;
        }
        
        .modal-tecnica-info {
            background: rgba(44, 32, 8, 0.6);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid var(--wood-light);
        }
        
        .modal-tecnica-info .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(139, 0, 0, 0.1);
        }
        
        .modal-tecnica-info .info-row:last-child {
            border-bottom: none;
        }
        
        .modal-tecnica-descricao {
            color: rgba(245, 245, 220, 0.9);
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .modal-tecnica-descricao h4 {
            color: var(--text-gold);
            margin-bottom: 10px;
        }
        
        .modal-tecnica-prereq {
            background: rgba(44, 32, 8, 0.4);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            border-left: 4px solid var(--accent-red);
        }
        
        .modal-tecnica-prereq h4 {
            color: var(--text-gold);
            margin: 0 0 10px 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .modal-tecnica-controles {
            background: rgba(44, 32, 8, 0.8);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border: 1px solid var(--wood-light);
        }
        
        .modal-tecnica-controles h4 {
            color: var(--text-gold);
            margin: 0 0 15px 0;
            text-align: center;
        }
        
        .controle-nivel-botoes {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 15px;
        }
        
        .controle-nivel-botoes .btn-nivel {
            background: rgba(44, 32, 8, 0.8);
            border: 2px solid var(--wood-light);
            border-radius: 8px;
            width: 45px;
            height: 45px;
            color: var(--text-light);
            font-size: 1.3rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .controle-nivel-botoes .btn-nivel:hover:not(:disabled) {
            border-color: var(--primary-gold);
            background: rgba(44, 32, 8, 1);
        }
        
        .controle-nivel-botoes .btn-nivel:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
        
        .nivel-atual {
            background: rgba(26, 18, 0, 0.8);
            border: 3px solid var(--primary-gold);
            border-radius: 10px;
            padding: 15px 25px;
            min-width: 100px;
            text-align: center;
        }
        
        .nivel-atual .valor {
            font-size: 2rem;
            font-weight: bold;
            color: var(--text-gold);
            margin-bottom: 5px;
        }
        
        .nivel-atual .label {
            color: rgba(212, 175, 55, 0.8);
            font-size: 0.9rem;
        }
        
        .nivel-info {
            text-align: center;
            color: rgba(212, 175, 55, 0.7);
            font-size: 0.85rem;
        }
        
        .controle-pontos {
            text-align: center;
            margin-top: 15px;
        }
        
        .pontos-info {
            color: var(--text-gold);
            font-weight: bold;
            font-size: 1.2rem;
            margin-bottom: 5px;
        }
        
        .pontos-detalhes {
            color: rgba(212, 175, 55, 0.7);
            font-size: 0.85rem;
        }
        
        .modal-tecnica-tabela {
            background: rgba(44, 32, 8, 0.6);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .modal-tecnica-tabela h4 {
            color: var(--text-gold);
            margin: 0 0 10px 0;
            text-align: center;
        }
        
        .tabela-custos {
            display: flex;
            justify-content: center;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .tabela-item {
            background: rgba(26, 18, 0, 0.8);
            border: 2px solid var(--wood-light);
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 0.9rem;
            color: rgba(212, 175, 55, 0.8);
            min-width: 80px;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .tabela-item.ativo {
            background: rgba(46, 92, 58, 0.3);
            border-color: var(--accent-green);
            color: var(--text-light);
            font-weight: bold;
        }
        
        .modal-tecnica-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 25px;
            border-top: 2px solid var(--wood-dark);
        }
        
        .modal-custo-total {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .modal-custo-total .label {
            color: rgba(212, 175, 55, 0.9);
            font-weight: bold;
        }
        
        .modal-custo-total .valor {
            color: var(--text-gold);
            font-weight: bold;
            font-size: 1.3rem;
        }
        
        .modal-actions {
            display: flex;
            gap: 15px;
        }
        
        @keyframes modalSlideIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
            .tecnica-detalhes,
            .tecnica-aprendida-info {
                grid-template-columns: 1fr;
                gap: 5px;
            }
            
            .tecnica-acoes {
                flex-direction: column;
            }
            
            .tecnica-aprendida-acoes {
                flex-direction: column;
            }
            
            .btn-nivel-controle {
                width: 100%;
            }
            
            .tabela-custos {
                flex-direction: column;
                align-items: center;
            }
            
            .modal-tecnica-footer {
                flex-direction: column;
                gap: 15px;
            }
            
            .modal-actions {
                width: 100%;
            }
            
            .modal-actions button {
                flex: 1;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', css);
    console.log("🎨 CSS das técnicas injetado");
}

// ===== 11. INICIALIZAÇÃO COMPLETA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Preparando sistema de técnicas");
    
    // Injetar CSS
    injetarCSSTecnicas();
    
    // Inicializar sistema
    setTimeout(() => {
        inicializarTecnicas();
        
        // Adicionar botão de debug (remover em produção)
        const debugBtn = document.createElement('button');
        debugBtn.textContent = '🔧 Debug Técnicas';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 60px;
            left: 10px;
            background: #FF5722;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            z-index: 9998;
            font-weight: bold;
            font-size: 12px;
        `;
        debugBtn.onclick = function() {
            console.log("=== DEBUG TÉCNICAS ===");
            console.log("Técnicas aprendidas:", tecnicasAprendidas);
            console.log("Técnica selecionada:", tecnicaSelecionada);
            console.log("Nível atual:", nivelTecnicaAtual);
            console.log("Pontos atuais:", pontosTecnicaAtuais);
            renderizarTodasTecnicas();
        };
        document.body.appendChild(debugBtn);
        
        console.log("🎮 Sistema de técnicas pronto para uso!");
    }, 1000);
});

// ===== 12. EXPORTAÇÕES =====
window.initTecnicas = inicializarTecnicas;
window.renderTecnicas = renderizarTodasTecnicas;
window.abrirTecnica = abrirModalTecnica;
window.fecharTecnica = fecharModalTecnica;

console.log("✅ TÉCNICAS.JS - SISTEMA COMPLETO CARREGADO");