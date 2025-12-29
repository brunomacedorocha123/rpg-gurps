// ============================================
// TECNICAS.JS - VERSÃO CORRIGIDA
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
        prereq: [
            { nome: "Arco", nivelMinimo: 1 },
            { nome: "Cavalgar", nivelMinimo: 1 }  // QUALQUER Cavalgar serve!
        ],
        custoTabela: { 2: 1, 3: 2, 4: 3, 5: 4 }
    }
];

// ESTADO
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');

// FUNÇÃO MELHORADA: BUSCAR PERÍCIAS
function buscarPericiasAprendidas() {
    // 1. Direto do seu sistema principal
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        return window.estadoPericias.periciasAprendidas;
    }
    
    // 2. Fallback do localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.periciasAprendidas) {
                return parsed.periciasAprendidas;
            }
        }
    } catch (e) {}
    
    return [];
}

// FUNÇÃO MELHORADA: VERIFICAR PERÍCIA
function temPericia(nomePericia) {
    const pericias = buscarPericiasAprendidas();
    
    for (const pericia of pericias) {
        if (!pericia || !pericia.nome) continue;
        
        // Verifica pelo NOME BASE (ignorando especialização)
        const nomeBase = pericia.nome;
        const nomeCompleto = pericia.nomeCompleto || pericia.nome;
        
        // Verifica se é a perícia que procuramos (ARCO ou CAVALGAR)
        if (nomeBase.toLowerCase() === nomePericia.toLowerCase()) {
            return { tem: true, nivel: pericia.nivel || 0, pericia: pericia };
        }
        
        // Verifica se o nome completo contém (útil para "Cavalgar (Cavalo)")
        if (nomeCompleto.toLowerCase().includes(nomePericia.toLowerCase())) {
            return { tem: true, nivel: pericia.nivel || 0, pericia: pericia };
        }
        
        // Para Cavalgar: verifica se começa com "Cavalgar"
        if (nomePericia.toLowerCase() === "cavalgar" && 
            nomeBase.toLowerCase().startsWith("cavalgar")) {
            return { tem: true, nivel: pericia.nivel || 0, pericia: pericia };
        }
    }
    
    return { tem: false, nivel: 0, pericia: null };
}

// VERIFICAR PRÉ-REQUISITOS SIMPLES
function verificarPreRequisitos(tecnica) {
    const resultados = [];
    let todosCumpridos = true;
    
    for (const req of tecnica.prereq) {
        const resultado = temPericia(req.nome);
        const cumprido = resultado.tem && resultado.nivel >= req.nivelMinimo;
        
        resultados.push({
            pericia: req.nome,
            tem: resultado.tem,
            nivel: resultado.nivel,
            requerido: req.nivelMinimo,
            cumprido: cumprido
        });
        
        if (!cumprido) todosCumpridos = false;
    }
    
    return { todosCumpridos, resultados };
}

// FUNÇÃO DE DEBUG (remova depois de testar)
function debugPericias() {
    console.log("=== DEBUG DE PERÍCIAS ===");
    console.log("Estado do sistema:", window.estadoPericias);
    
    const pericias = buscarPericiasAprendidas();
    console.log("Perícias encontradas:", pericias);
    
    console.log("Testando Arco:", temPericia("Arco"));
    console.log("Testando Cavalgar:", temPericia("Cavalgar"));
}

// RENDERIZAR CATÁLOGO (simplificado e funcional)
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (const tecnica of CATALOGO_TECNICAS) {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPreRequisitos(tecnica);
        
        // Status
        let status = 'disponivel';
        let btnTexto = 'Adquirir';
        let btnIcono = 'fa-plus-circle';
        
        if (jaAprendida) {
            status = 'aprendida';
            btnTexto = 'Editar';
            btnIcono = 'fa-edit';
        } else if (!prereq.todosCumpridos) {
            status = 'bloqueada';
            btnTexto = 'Ver Pré-requisitos';
            btnIcono = 'fa-lock';
        }
        
        // Card HTML
        const card = document.createElement('div');
        card.className = 'tecnica-item';
        card.dataset.id = tecnica.id;
        
        card.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome">
                    <i class="${tecnica.icone}"></i>
                    ${tecnica.nome}
                </div>
                <div class="tecnica-status ${status}">
                    ${status === 'disponivel' ? 'Disponível' : 
                      status === 'aprendida' ? 'Aprendida' : 'Bloqueada'}
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
                    <i class="fas fa-arrow-up"></i>
                    <span>Mod: ${tecnica.modificadorBase}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong>Pré-requisitos:</strong>
                <ul>
                    ${tecnica.prereq.map(req => {
                        const resultado = temPericia(req.nome);
                        const cumprido = resultado.tem && resultado.nivel >= req.nivelMinimo;
                        return `<li class="${cumprido ? 'cumprido' : 'pendente'}">
                            <i class="fas fa-${cumprido ? 'check' : 'times'}"></i>
                            ${req.nome} (Nível ${req.nivelMinimo}+)
                        </li>`;
                    }).join('')}
                </ul>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica ${status}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${status === 'bloqueada' ? 'disabled' : ''}>
                    <i class="fas ${btnIcono}"></i>
                    ${btnTexto}
                </button>
            </div>
        `;
        
        container.appendChild(card);
    }
}

// RENDERIZAR TÉCNICAS APRENDIDAS
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica-aprendida">
                <i class="fas fa-tools"></i>
                <p>Nenhuma técnica aprendida</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    for (const tecnicaAprendida of tecnicasAprendidas) {
        const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaBase) continue;
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida-item';
        card.dataset.id = tecnicaAprendida.id;
        
        card.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${tecnicaBase.icone}"></i>
                    ${tecnicaBase.nome}
                </div>
                <div class="tecnica-aprendida-niveis">
                    +${tecnicaAprendida.niveis || 0} níveis
                </div>
            </div>
            
            <div class="tecnica-aprendida-info">
                <div>Perícia Base: ${tecnicaBase.periciaBase}</div>
                <div>Pontos: ${tecnicaAprendida.pontos || 0} pts</div>
            </div>
            
            <div class="tecnica-aprendida-actions">
                <button class="btn-editar" onclick="editarTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover" onclick="removerTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    }
}

// MODAL SIMPLIFICADO
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const tecnicaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPreRequisitos(tecnica);
    
    // Se não cumprir pré-requisitos, mostra alerta
    if (!prereq.todosCumpridos && !tecnicaAprendida) {
        alert('Você precisa ter:\n- Arco (nível 1+)\n- Cavalgar (qualquer, nível 1+)');
        return;
    }
    
    // Modal básico
    const nivel = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
    const pontos = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
    
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <p>${tecnica.descricao}</p>
                
                <div class="modal-opcoes">
                    <h4>Escolha o nível:</h4>
                    <div class="opcoes-nivel">
                        <button class="opcao-nivel ${nivel === 1 ? 'selecionado' : ''}" 
                                onclick="selecionarNivelTecnica(1, 2, '${id}')">
                            +1 nível (2 pts)
                        </button>
                        <button class="opcao-nivel ${nivel === 2 ? 'selecionado' : ''}"
                                onclick="selecionarNivelTecnica(2, 3, '${id}')">
                            +2 níveis (3 pts)
                        </button>
                        <button class="opcao-nivel ${nivel === 3 ? 'selecionado' : ''}"
                                onclick="selecionarNivelTecnica(3, 4, '${id}')">
                            +3 níveis (4 pts)
                        </button>
                        <button class="opcao-nivel ${nivel === 4 ? 'selecionado' : ''}"
                                onclick="selecionarNivelTecnica(4, 5, '${id}')">
                            +4 níveis (5 pts)
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="modal-tecnica-footer">
                <div class="modal-custo">
                    <span>Custo: </span>
                    <strong id="custo-modal">${pontos}</strong>
                    <span> pontos</span>
                </div>
                <div class="modal-botoes">
                    <button class="btn-cancelar" onclick="fecharModalTecnica()">Cancelar</button>
                    <button class="btn-confirmar" onclick="confirmarTecnica('${id}')">
                        ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) modal.innerHTML = modalHTML;
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'flex';
    
    window.tecnicaSelecionada = { id, niveis: nivel, pontos };
}

// FUNÇÕES AUXILIARES
let tecnicaSelecionada = null;

function selecionarNivelTecnica(niveis, pontos, id) {
    document.querySelectorAll('.opcao-nivel').forEach(btn => {
        btn.classList.remove('selecionado');
    });
    
    event.target.classList.add('selecionado');
    
    const custoDisplay = document.getElementById('custo-modal');
    if (custoDisplay) custoDisplay.textContent = pontos;
    
    tecnicaSelecionada = { id, niveis, pontos };
}

function confirmarTecnica(id) {
    if (!tecnicaSelecionada || tecnicaSelecionada.id !== id) return;
    
    const { niveis, pontos } = tecnicaSelecionada;
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    
    // Verificar pré-requisitos novamente
    const prereq = verificarPreRequisitos(tecnica);
    if (!prereq.todosCumpridos) {
        alert('Pré-requisitos não cumpridos!');
        return;
    }
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos;
        pontosTecnicas += (pontos - pontosAntigos);
        
        tecnicasAprendidas[indexExistente] = {
            id,
            nome: tecnica.nome,
            niveis,
            pontos,
            periciaBase: tecnica.periciaBase
        };
    } else {
        // Adicionar nova
        tecnicasAprendidas.push({
            id,
            nome: tecnica.nome,
            niveis,
            pontos,
            periciaBase: tecnica.periciaBase
        });
        pontosTecnicas += pontos;
    }
    
    salvarTecnicas();
    fecharModalTecnica();
    renderizarTecnicas();
}

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Remover esta técnica?')) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    pontosTecnicas -= tecnicasAprendidas[index].pontos;
    tecnicasAprendidas.splice(index, 1);
    
    salvarTecnicas();
    renderizarTecnicas();
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    tecnicaSelecionada = null;
}

// INICIALIZAÇÃO
function inicializarTecnicas() {
    carregarTecnicas();
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    
    // Botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            renderizarCatalogoTecnicas();
            renderizarTecnicasAprendidas();
        };
    }
}

// INICIALIZAR QUANDO A ABA ABRIR
document.addEventListener('DOMContentLoaded', function() {
    // Clique nas abas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarTecnicas, 100);
                // DEBUG: Descomente para verificar
                // debugPericias();
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarTecnicas, 200);
    }
});

// Função pública para forçar atualização
window.renderizarTecnicas = function() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
};