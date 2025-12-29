// ============================================
// TECNICAS.JS - SISTEMA COMPLETO E CORRETO
// ============================================

// CATÁLOGO DE TÉCNICAS
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
        prereq: ["Arco", "Cavalgar (Cavalo)"]
    }
];

// ESTADO
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');

// ===== 1. FUNÇÃO PARA BUSCAR PERÍCIA CORRETAMENTE =====
function verificarPericia(nomePericia) {
    // 1. PRIMEIRO: Verifica se há um sistema principal de perícias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        
        // Busca por nome exato
        const periciaEncontrada = pericias.find(p => {
            if (!p || !p.nome) return false;
            
            const nomePericiaAtual = p.nome.toLowerCase().trim();
            const nomeBuscado = nomePericia.toLowerCase().trim();
            
            // Busca exata
            if (nomePericiaAtual === nomeBuscado) return true;
            
            // Para casos especiais
            if (nomeBuscado === "arco" && nomePericiaAtual.includes("arco")) return true;
            if (nomeBuscado === "cavalgar" && (nomePericiaAtual.includes("cavalgar") || nomePericiaAtual.includes("cavalo"))) return true;
            
            return false;
        });
        
        if (periciaEncontrada) {
            return { 
                tem: true, 
                nivel: periciaEncontrada.nivel || 0,
                nome: periciaEncontrada.nome,
                detalhes: periciaEncontrada
            };
        }
    }
    
    // 2. SEGUNDO: Tenta buscar do localStorage direto
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.periciasAprendidas && Array.isArray(parsed.periciasAprendidas)) {
                const pericias = parsed.periciasAprendidas;
                
                const periciaEncontrada = pericias.find(p => {
                    if (!p || !p.nome) return false;
                    
                    const nomePericiaAtual = p.nome.toLowerCase().trim();
                    const nomeBuscado = nomePericia.toLowerCase().trim();
                    
                    // Busca exata
                    if (nomePericiaAtual === nomeBuscado) return true;
                    
                    // Para casos especiais
                    if (nomeBuscado === "arco" && nomePericiaAtual.includes("arco")) return true;
                    if (nomeBuscado === "cavalgar" && (nomePericiaAtual.includes("cavalgar") || nomePericiaAtual.includes("cavalo"))) return true;
                    
                    return false;
                });
                
                if (periciaEncontrada) {
                    return { 
                        tem: true, 
                        nivel: periciaEncontrada.nivel || 0,
                        nome: periciaEncontrada.nome,
                        detalhes: periciaEncontrada
                    };
                }
            }
        }
    } catch (e) {
        console.error("Erro ao buscar perícia:", e);
    }
    
    // 3. SE NÃO ENCONTRAR: retorna falso
    return { 
        tem: false, 
        nivel: 0,
        nome: nomePericia,
        detalhes: null
    };
}

// ===== 2. CÁLCULO DO NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return 0;
    
    // Busca a perícia base
    const periciaBase = verificarPericia(tecnica.periciaBase);
    
    // Se não tem a perícia base, retorna 0
    if (!periciaBase.tem) return 0;
    
    const nhBase = periciaBase.nivel;
    
    // Calcula NH: NH base + penalidade + níveis investidos
    let nhFinal = nhBase + tecnica.modificadorBase + niveisInvestidos;
    
    // Limite: nunca pode exceder o NH base
    if (nhFinal > nhBase) {
        nhFinal = nhBase;
    }
    
    return nhFinal;
}

// ===== 3. FUNÇÕES DE CARREGAMENTO E SALVAMENTO =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_aprendidas');
        if (salvo) {
            tecnicasAprendidas = JSON.parse(salvo);
        }
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) {
            pontosTecnicas = parseInt(pontos);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
        localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    } catch (e) {
        console.error("Erro ao salvar técnicas:", e);
    }
}

// ===== 4. VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    let todosCumpridos = true;
    const resultados = [];
    
    tecnica.prereq.forEach(req => {
        const resultado = verificarPericia(req);
        resultados.push({
            pericia: req,
            tem: resultado.tem,
            nivel: resultado.nivel,
            nome: resultado.nome
        });
        
        if (!resultado.tem) todosCumpridos = false;
    });
    
    return { todosCumpridos, resultados };
}

// ===== 5. RENDERIZAÇÃO DO CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereqStatus = verificarPreRequisitos(tecnica);
        
        // Busca informação da perícia base
        const periciaBaseInfo = verificarPericia(tecnica.periciaBase);
        
        // Calcula NH da técnica
        const nhTecnica = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
        const card = document.createElement('div');
        card.className = 'tecnica-item';
        card.dataset.id = tecnica.id;
        
        let statusClass = 'disponivel';
        let statusText = 'Disponível';
        let btnText = 'Adquirir';
        let btnIcon = 'fa-plus-circle';
        let btnDisabled = false;
        
        if (jaAprendida) {
            statusClass = 'aprendida';
            statusText = 'Aprendida';
            btnText = 'Editar';
            btnIcon = 'fa-edit';
        } else if (!prereqStatus.todosCumpridos) {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            btnDisabled = true;
        }
        
        card.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome">
                    <i class="${tecnica.icone}"></i>
                    ${tecnica.nome}
                </div>
                <div class="tecnica-status ${statusClass}">
                    ${statusText}
                </div>
            </div>
            
            <div class="tecnica-descricao">
                ${tecnica.descricao}
            </div>
            
            <div class="tecnica-info">
                <div class="info-item">
                    <i class="fas fa-bullseye"></i>
                    <span>Base: ${tecnica.periciaBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-arrow-down"></i>
                    <span>Penalidade: ${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calculator"></i>
                    <span>NH: ${nhTecnica}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong>Pré-requisitos:</strong>
                <div class="prereq-lista">
                    ${tecnica.prereq.map(req => {
                        const status = prereqStatus.resultados.find(r => r.pericia === req);
                        return `<span class="${status && status.tem ? 'cumprido' : 'pendente'}">
                            <i class="fas fa-${status && status.tem ? 'check' : 'times'}"></i>
                            ${req} ${status && status.tem ? `(NH ${status.nivel})` : ''}
                        </span>`;
                    }).join('')}
                </div>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica ${statusClass}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${btnDisabled ? 'disabled' : ''}>
                    <i class="fas ${btnIcon}"></i>
                    ${btnText}
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== 6. RENDERIZAÇÃO DAS TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica">
                <i class="fas fa-tools"></i>
                <p>Nenhuma técnica aprendida</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasAprendidas.forEach(tecnicaAprendida => {
        const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaBase) return;
        
        // Busca informação da perícia base
        const periciaBaseInfo = verificarPericia(tecnicaBase.periciaBase);
        
        // Calcula NH da técnica
        const nhTecnica = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis);
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida-item';
        card.dataset.id = tecnicaAprendida.id;
        
        card.innerHTML = `
            <div class="tecnica-aprendida-header">
                <h3>${tecnicaBase.nome.toUpperCase()}</h3>
            </div>
            
            <div class="tecnica-aprendida-info">
                <div class="info-row">
                    <span class="info-label">PERÍCIA BASE:</span>
                    <span class="info-value">${tecnicaBase.periciaBase} (NH ${periciaBaseInfo.nivel})</span>
                </div>
                <div class="info-row">
                    <span class="info-label">PENALIDADE BASE:</span>
                    <span class="info-value">${tecnicaBase.modificadorBase}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">NÍVEIS ADICIONAIS:</span>
                    <span class="info-value">+${tecnicaAprendida.niveis || 0}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-resultado">
                <div class="resultado-label">PONTOS INVESTIDOS:</div>
                <div class="resultado-valor">${tecnicaAprendida.pontos || 0} PTS</div>
            </div>
            
            <div class="tecnica-aprendida-nh">
                <div class="nh-label">NH DA TÉCNICA:</div>
                <div class="nh-valor">${nhTecnica}</div>
            </div>
            
            <div class="tecnica-aprendida-actions">
                <button class="btn-editar" onclick="editarTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-edit"></i> EDITAR
                </button>
                <button class="btn-remover" onclick="removerTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-times"></i> REMOVER
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== 7. MODAL DA TÉCNICA =====
let tecnicaSelecionada = null;

function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const tecnicaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereqStatus = verificarPreRequisitos(tecnica);
    
    // Busca perícia base
    const periciaBaseInfo = verificarPericia(tecnica.periciaBase);
    const nhBase = periciaBaseInfo.nivel;
    const nhInicial = nhBase + tecnica.modificadorBase;
    
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <div class="modal-descricao">
                    ${tecnica.descricao}
                </div>
                
                <div class="modal-info">
                    <div class="info-item">
                        <span>Perícia Base:</span>
                        <strong>${tecnica.periciaBase} (NH ${nhBase})</strong>
                    </div>
                    <div class="info-item">
                        <span>Penalidade Base:</span>
                        <strong>${tecnica.modificadorBase}</strong>
                    </div>
                    <div class="info-item">
                        <span>NH Inicial:</span>
                        <strong>${nhInicial}</strong>
                    </div>
                </div>
                
                <div class="modal-prereq">
                    <h4>Pré-requisitos:</h4>
                    <div class="prereq-lista">
                        ${prereqStatus.resultados.map(resultado => {
                            return `<div class="prereq-item ${resultado.tem ? 'cumprido' : 'pendente'}">
                                <i class="fas fa-${resultado.tem ? 'check' : 'times'}"></i>
                                <span>${resultado.pericia}</span>
                                <small>${resultado.tem ? `NH ${resultado.nivel}` : 'Faltando'}</small>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                
                ${prereqStatus.todosCumpridos ? `
                <div class="modal-opcoes">
                    <h4>Investir Pontos:</h4>
                    <div class="opcoes-nivel">
                        <button class="opcao-nivel ${tecnicaAprendida && tecnicaAprendida.niveis === 1 ? 'selecionado' : ''}" 
                                onclick="selecionarNivelTecnica('${id}', 1, 2, ${nhBase}, ${tecnica.modificadorBase})">
                            <div class="pontos">2 pontos</div>
                            <div class="nivel">+1 nível</div>
                            <div class="nh">NH: ${Math.min(nhInicial + 1, nhBase)}</div>
                        </button>
                        <button class="opcao-nivel ${tecnicaAprendida && tecnicaAprendida.niveis === 2 ? 'selecionado' : ''}"
                                onclick="selecionarNivelTecnica('${id}', 2, 3, ${nhBase}, ${tecnica.modificadorBase})">
                            <div class="pontos">3 pontos</div>
                            <div class="nivel">+2 níveis</div>
                            <div class="nh">NH: ${Math.min(nhInicial + 2, nhBase)}</div>
                        </button>
                        <button class="opcao-nivel ${tecnicaAprendida && tecnicaAprendida.niveis === 3 ? 'selecionado' : ''}"
                                onclick="selecionarNivelTecnica('${id}', 3, 4, ${nhBase}, ${tecnica.modificadorBase})">
                            <div class="pontos">4 pontos</div>
                            <div class="nivel">+3 níveis</div>
                            <div class="nh">NH: ${Math.min(nhInicial + 3, nhBase)}</div>
                        </button>
                        <button class="opcao-nivel ${tecnicaAprendida && tecnicaAprendida.niveis === 4 ? 'selecionado' : ''}"
                                onclick="selecionarNivelTecnica('${id}', 4, 5, ${nhBase}, ${tecnica.modificadorBase})">
                            <div class="pontos">5 pontos</div>
                            <div class="nivel">+4 níveis</div>
                            <div class="nh">NH: ${Math.min(nhInicial + 4, nhBase)}</div>
                        </button>
                    </div>
                </div>
                
                <div class="modal-resumo">
                    <h4>Resumo:</h4>
                    <div class="resumo-item">
                        <span>Pontos:</span>
                        <strong id="resumo-pontos">${tecnicaAprendida ? tecnicaAprendida.pontos : 2}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis:</span>
                        <strong id="resumo-niveis">+${tecnicaAprendida ? tecnicaAprendida.niveis : 1}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH Final:</span>
                        <strong id="resumo-nh">${calcularNHTecnica(id, tecnicaAprendida ? tecnicaAprendida.niveis : 1)}</strong>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Complete os pré-requisitos para adquirir esta técnica.</p>
                </div>
                `}
            </div>
            
            <div class="modal-tecnica-footer">
                ${prereqStatus.todosCumpridos ? `
                <div class="modal-custo">
                    <span>Custo Total: </span>
                    <strong id="custo-total">${tecnicaAprendida ? tecnicaAprendida.pontos : 2}</strong>
                    <span> pontos</span>
                </div>
                <div class="modal-botoes">
                    <button class="btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
                    <button class="btn-confirmar" onclick="confirmarTecnica('${id}')">
                        ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
                    </button>
                </div>
                ` : `
                <div class="modal-botoes">
                    <button class="btn-cancelar" onclick="fecharModalTecnica()">Fechar</button>
                </div>
                `}
            </div>
        </div>
    `;
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
    }
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Inicializa técnica selecionada
    tecnicaSelecionada = {
        id: id,
        niveis: tecnicaAprendida ? tecnicaAprendida.niveis : 1,
        pontos: tecnicaAprendida ? tecnicaAprendida.pontos : 2,
        nhBase: nhBase,
        modificador: tecnica.modificadorBase
    };
}

function selecionarNivelTecnica(id, niveis, pontos, nhBase, modificador) {
    // Remove seleção de todos
    document.querySelectorAll('.opcao-nivel').forEach(btn => {
        btn.classList.remove('selecionado');
    });
    
    // Adiciona seleção ao clicado
    event.target.closest('.opcao-nivel').classList.add('selecionado');
    
    // Calcula NH final
    const nhInicial = nhBase + modificador;
    const nhFinal = Math.min(nhInicial + niveis, nhBase);
    
    // Atualiza técnica selecionada
    tecnicaSelecionada = {
        id: id,
        niveis: niveis,
        pontos: pontos,
        nhBase: nhBase,
        modificador: modificador,
        nhInicial: nhInicial
    };
    
    // Atualiza displays
    document.getElementById('resumo-pontos').textContent = pontos;
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('custo-total').textContent = pontos;
}

function confirmarTecnica(id) {
    if (!tecnicaSelecionada) return;
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const { niveis, pontos } = tecnicaSelecionada;
    
    // Verifica pré-requisitos novamente
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('Complete os pré-requisitos primeiro!');
        return;
    }
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos;
        pontosTecnicas += (pontos - pontosAntigos);
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase
        };
    } else {
        // Adicionar nova técnica
        tecnicasAprendidas.push({
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase
        });
        pontosTecnicas += pontos;
    }
    
    salvarTecnicas();
    fecharModalTecnica();
    renderizarTodasTecnicas();
    
    // Notificação
    alert(`Técnica ${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'}! NH: ${calcularNHTecnica(id, niveis)}`);
}

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica?')) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnicaRemovida = tecnicasAprendidas[index];
    pontosTecnicas -= tecnicaRemovida.pontos;
    tecnicasAprendidas.splice(index, 1);
    
    salvarTecnicas();
    renderizarTodasTecnicas();
    
    alert(`Técnica ${tecnicaRemovida.nome} removida!`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    tecnicaSelecionada = null;
}

// ===== 8. FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    // Atualiza contadores
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
}

// ===== 9. INICIALIZAÇÃO =====
function inicializarTecnicas() {
    carregarTecnicas();
    renderizarTodasTecnicas();
    
    // Evento para botão de atualizar (se existir)
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            renderizarTodasTecnicas();
            alert('Técnicas atualizadas!');
        });
    }
}

// ===== 10. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarTecnicas, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarTecnicas, 200);
    }
});

// ===== 11. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarNivelTecnica = selecionarNivelTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.calcularNHTecnica = calcularNHTecnica;

console.log('✅ Sistema de técnicas carregado e pronto!');