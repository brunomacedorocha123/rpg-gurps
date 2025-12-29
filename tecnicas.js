// ============================================
// TECNICAS.JS - SISTEMA 100% FUNCIONAL (CORRIGIDO)
// ============================================

// ===== 1. CATÁLOGO DE TÉCNICAS =====
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
        prereq: ["Arco", "Cavalgar"]
    }
];

// ===== 2. TABELA DE CUSTOS =====
const CUSTOS_TECNICAS = [
    { niveis: 1, pontos: 2 },
    { niveis: 2, pontos: 3 },
    { niveis: 3, pontos: 4 },
    { niveis: 4, pontos: 5 }
];

// ===== 3. ESTADO DO SISTEMA =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');
let tecnicaModalSelecionada = null;

// ===== 4. BUSCA SIMPLIFICADA DE PERÍCIAS =====
function buscarPericiaParaTecnica(nomePericia) {
    // Primeiro, tenta obter do sistema principal de perícias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        
        // Para Arco - busca exata ou que contenha "Arco"
        if (nomePericia === "Arco") {
            for (const pericia of pericias) {
                if (!pericia || !pericia.nome) continue;
                
                // Verifica se é exatamente "Arco" ou contém "Arco"
                if (pericia.nome === "Arco" || 
                    pericia.nome.includes("Arco") || 
                    pericia.id === "arco") {
                    return {
                        tem: true,
                        nivel: pericia.nivel || pericia.valor || 1,
                        nome: pericia.nome
                    };
                }
            }
        }
        
        // Para Cavalgar - busca qualquer que contenha "Cavalgar"
        if (nomePericia === "Cavalgar") {
            for (const pericia of pericias) {
                if (!pericia || !pericia.nome) continue;
                
                if (pericia.nome.includes("Cavalgar")) {
                    return {
                        tem: true,
                        nivel: pericia.nivel || pericia.valor || 1,
                        nome: pericia.nome
                    };
                }
            }
        }
    }
    
    // Fallback: verifica no localStorage direto
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            const pericias = parsed.periciasAprendidas || [];
            
            if (Array.isArray(pericias)) {
                for (const pericia of pericias) {
                    if (!pericia || !pericia.nome) continue;
                    
                    // Para Arco
                    if (nomePericia === "Arco" && 
                        (pericia.nome === "Arco" || 
                         pericia.nome.includes("Arco") || 
                         pericia.id === "arco")) {
                        return {
                            tem: true,
                            nivel: pericia.nivel || pericia.valor || 1,
                            nome: pericia.nome
                        };
                    }
                    
                    // Para Cavalgar
                    if (nomePericia === "Cavalgar" && 
                        pericia.nome.includes("Cavalgar")) {
                        return {
                            tem: true,
                            nivel: pericia.nivel || pericia.valor || 1,
                            nome: pericia.nome
                        };
                    }
                }
            }
        }
    } catch (e) {
        // Ignora erro
    }
    
    // Não encontrada
    return { 
        tem: false, 
        nivel: 0, 
        nome: nomePericia 
    };
}

// ===== 5. VERIFICAÇÃO SIMPLES =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    // Precisa ter ambas as perícias e Arco com pelo menos nível 1
    const todosCumpridos = arco.tem && cavalgar.tem && arco.nivel > 0;
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: todosCumpridos
    };
}

// ===== 6. CALCULAR NH ATUAL =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0 };
    
    const arco = buscarPericiaParaTecnica("Arco");
    
    if (!arco.tem || arco.nivel <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            bonusNiveis: 0
        };
    }
    
    const nhArco = arco.nivel;
    const bonus = tecnica.modificadorBase + niveisInvestidos;
    let nhFinal = nhArco + bonus;
    
    // Não pode exceder o nível de Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não pode ser negativo
    if (nhFinal < 0) nhFinal = 0;
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        bonusNiveis: niveisInvestidos,
        calculo: `${nhArco} ${tecnica.modificadorBase} + ${niveisInvestidos} = ${nhFinal}`
    };
}

// ===== 7. RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
        // Status
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
        } else if (!prereq.todosCumpridos) {
            statusClass = 'bloqueada';
            statusText = 'Bloqueada';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            disabled = true;
        }
        
        // Calcula NH em tempo real para exibição
        const nhArco = prereq.arco.nivel || 0;
        const nhTecnica = jaAprendida ? 
            nhCalculo.nh : 
            Math.min(nhArco + tecnica.modificadorBase, nhArco);
        
        const card = document.createElement('div');
        card.className = 'tecnica-card';
        card.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-titulo">
                    <i class="${tecnica.icone}"></i>
                    <h4>${tecnica.nome}</h4>
                </div>
                <span class="tecnica-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="tecnica-desc">${tecnica.descricao}</div>
            
            <div class="tecnica-info">
                <div class="info-item">
                    <span class="label">Base:</span>
                    <span class="valor">${tecnica.periciaBase} (NH ${nhArco})</span>
                </div>
                <div class="info-item">
                    <span class="label">Penalidade:</span>
                    <span class="valor">${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <span class="label">NH Atual:</span>
                    <span class="valor">${nhTecnica > 0 ? nhTecnica : '--'}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <div class="prereq-titulo">Pré-requisitos:</div>
                <div class="prereq-item ${prereq.arco.tem && prereq.arco.nivel > 0 ? 'ok' : 'falta'}">
                    <i class="fas fa-${prereq.arco.tem && prereq.arco.nivel > 0 ? 'check' : 'times'}"></i>
                    ${prereq.arco.nome} ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}
                </div>
                <div class="prereq-item ${prereq.cavalgar.tem ? 'ok' : 'falta'}">
                    <i class="fas fa-${prereq.cavalgar.tem ? 'check' : 'times'}"></i>
                    ${prereq.cavalgar.nome} ${prereq.cavalgar.tem ? `(NH ${prereq.cavalgar.nivel})` : ''}
                </div>
            </div>
            
            <div class="tecnica-acoes">
                <button class="btn-tecnica ${statusClass}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${disabled ? 'disabled' : ''}>
                    <i class="fas ${btnIcon}"></i> ${btnText}
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== 8. RENDERIZAR APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="vazio">
                <i class="fas fa-tools"></i>
                <p>Nenhuma técnica aprendida</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasAprendidas.forEach(tecnica => {
        const base = CATALOGO_TECNICAS.find(t => t.id === tecnica.id);
        if (!base) return;
        
        const nh = calcularNHTecnica(tecnica.id, tecnica.niveis || 0);
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida';
        card.innerHTML = `
            <div class="aprendida-header">
                <div class="aprendida-titulo">
                    <i class="${base.icone}"></i>
                    <h4>${base.nome}</h4>
                </div>
                <div class="aprendida-nh">NH: ${nh.nh}</div>
            </div>
            
            <div class="aprendida-detalhes">
                <div class="detalhe">
                    <span>Pontos:</span>
                    <strong>${tecnica.pontos || 0} pts</strong>
                </div>
                <div class="detalhe">
                    <span>Níveis:</span>
                    <strong>+${tecnica.niveis || 0}</strong>
                </div>
                <div class="detalhe">
                    <span>Base (Arco):</span>
                    <strong>NH ${nh.nhBase}</strong>
                </div>
            </div>
            
            <div class="aprendida-acoes">
                <button class="btn-editar" onclick="editarTecnica('${tecnica.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== 9. MODAL FUNCIONAL =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    const nhArco = arco.nivel || 0;
    
    // Valores iniciais
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    
    // Verifica se está liberado
    const liberado = prereq.todosCumpridos && nhArco > 0;
    
    const modalHTML = `
        <div class="modal-tecnica-conteudo">
            <div class="modal-cabecalho">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-fechar" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-corpo">
                <div class="modal-descricao">
                    ${tecnica.descricao}
                </div>
                
                <div class="modal-prereq">
                    <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                    <div class="prereq-lista">
                        <div class="prereq ${arco.tem && arco.nivel > 0 ? 'ok' : 'falta'}">
                            <i class="fas fa-${arco.tem && arco.nivel > 0 ? 'check' : 'times'}"></i>
                            <span>${arco.nome}</span>
                            <small>${arco.tem ? `NH ${arco.nivel}` : 'Não aprendido'}</small>
                        </div>
                        <div class="prereq ${cavalgar.tem ? 'ok' : 'falta'}">
                            <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
                            <span>${cavalgar.nome}</span>
                            <small>${cavalgar.tem ? `NH ${cavalgar.nivel}` : 'Não aprendido'}</small>
                        </div>
                    </div>
                </div>
                
                ${liberado ? `
                <div class="modal-investimento">
                    <h4><i class="fas fa-coins"></i> Escolha os Níveis</h4>
                    <div class="opcoes-pontos">
                        ${CUSTOS_TECNICAS.map((opcao, index) => {
                            const nhBase = nhArco + tecnica.modificadorBase;
                            const nhFinal = Math.min(nhBase + opcao.niveis, nhArco);
                            const selecionado = jaAprendida ? jaAprendida.niveis === opcao.niveis : index === 0;
                            
                            return `
                            <button class="opcao-pontos ${selecionado ? 'ativo' : ''}" 
                                    onclick="selecionarOpcaoTecnica(${opcao.pontos}, ${opcao.niveis}, ${nhArco}, ${tecnica.modificadorBase})">
                                <div class="pontos">${opcao.pontos} pontos</div>
                                <div class="niveis">+${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</div>
                                <div class="nh">NH: ${nhFinal}</div>
                            </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="modal-resumo">
                    <h4><i class="fas fa-calculator"></i> Resumo</h4>
                    <div class="resumo-item">
                        <span>Arco (NH ${nhArco}):</span>
                        <strong>${nhArco}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Penalidade base:</span>
                        <strong>${tecnica.modificadorBase}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item total">
                        <span>NH final:</span>
                        <strong id="resumo-nh">${Math.min(nhArco + tecnica.modificadorBase + niveisIniciais, nhArco)}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Pontos gastos:</span>
                        <strong id="resumo-pontos">${pontosIniciais}</strong>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos não cumpridos</strong>
                        <p>Você precisa aprender Arco (com pelo menos 1 ponto) e Cavalgar (qualquer).</p>
                    </div>
                </div>
                `}
            </div>
            
            <div class="modal-rodape">
                <button class="btn-cancelar" onclick="fecharModalTecnica()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                
                ${liberado ? `
                <button class="btn-confirmar" onclick="confirmarTecnicaModal('${id}')">
                    <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar' : 'Adquirir'}
                </button>
                ` : ''}
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
    
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
}

// ===== 10. SELEÇÃO DE OPÇÃO (COM ATUALIZAÇÃO DE NH) =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    document.querySelectorAll('.opcao-pontos').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
    event.target.closest('.opcao-pontos').classList.add('ativo');
    
    tecnicaModalSelecionada.pontos = pontos;
    tecnicaModalSelecionada.niveis = niveis;
    
    // Calcula NH final
    const nhBase = nhArco + modificador;
    const nhFinal = Math.min(nhBase + niveis, nhArco);
    
    // Atualiza resumo
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('resumo-pontos').textContent = pontos;
}

// ===== 11. CONFIRMAR TÉCNICA =====
function confirmarTecnicaModal(id) {
    if (!tecnicaModalSelecionada) return;
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    
    // Verifica pré-requisitos
    const prereq = verificarPrereqTecnica(tecnica);
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
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase
        };
    } else {
        // Adicionar nova
        tecnicasAprendidas.push({
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase
        });
        pontosTecnicas += pontos;
    }
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fecha e atualiza
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 12. FUNÇÕES AUXILIARES =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Remover esta técnica?')) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    pontosTecnicas -= tecnicasAprendidas[index].pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    renderizarTodasTecnicas();
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) modal.innerHTML = '';
    
    tecnicaModalSelecionada = null;
}

// ===== 13. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
}

// ===== 14. FUNÇÃO PRINCIPAL =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 15. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    // Carrega dados salvos
    try {
        const dados = localStorage.getItem('tecnicas_aprendidas');
        if (dados) tecnicasAprendidas = JSON.parse(dados);
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) pontosTecnicas = parseInt(pontos);
    } catch (e) {
        // Ignora erro
    }
    
    // Botão atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', renderizarTodasTecnicas);
    }
    
    // Fechar modal ao clicar fora
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                fecharModalTecnica();
            }
        });
    }
    
    // Renderiza
    renderizarTodasTecnicas();
}

// ===== 16. EXPORTAR FUNÇÕES =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== 17. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa quando a aba de técnicas for clicada
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarSistemaTecnicas, 100);
            }
        });
    });
    
    // Inicializa se já estiver na aba de técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarSistemaTecnicas, 100);
    }
});