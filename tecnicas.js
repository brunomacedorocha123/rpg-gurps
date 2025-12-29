// ============================================
// TECNICAS.JS - SISTEMA CORRETO 100%
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
        prereq: ["Arco", "Cavalgar"] // Arco genérico, Cavalgar qualquer
    }
];

// ===== 2. TABELA DE CUSTOS FIXA PARA TÉCNICAS =====
// Custo fixo para TÉCNICAS (não é como perícias!)
const CUSTOS_TECNICAS = [
    { niveis: 1, pontos: 2 },  // +1 nível = 2 pontos
    { niveis: 2, pontos: 3 },  // +2 níveis = 3 pontos  
    { niveis: 3, pontos: 4 },  // +3 níveis = 4 pontos
    { niveis: 4, pontos: 5 }   // +4 níveis = 5 pontos
];

// ===== 3. ESTADO DO SISTEMA =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');
let tecnicaModalSelecionada = null;

// ===== 4. BUSCA DE PERÍCIAS - FUNCIONAL =====
function buscarPericiaParaTecnica(nomePericia) {
    // ARCO: busca genérico
    if (nomePericia === "Arco") {
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            
            // Procura por "Arco"
            for (let p of pericias) {
                if (!p || !p.nome) continue;
                
                // Nome exato "Arco"
                if (p.nome.trim().toLowerCase() === "arco") {
                    return {
                        tem: true,
                        nivel: p.nivel || p.valor || 0,
                        nome: p.nome
                    };
                }
                
                // ID "arco"
                if (p.id && p.id === "arco") {
                    return {
                        tem: true,
                        nivel: p.nivel || p.valor || 0,
                        nome: p.nome
                    };
                }
            }
            
            // Procura parcial
            for (let p of pericias) {
                if (!p || !p.nome) continue;
                if (p.nome.toLowerCase().includes("arco")) {
                    return {
                        tem: true,
                        nivel: p.nivel || p.valor || 0,
                        nome: p.nome
                    };
                }
            }
        }
        return { tem: false, nivel: 0, nome: "Arco" };
    }
    
    // CAVALGAR: aceita QUALQUER
    if (nomePericia === "Cavalgar") {
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            const cavalgar = pericias.find(p => p && p.nome && p.nome.toLowerCase().includes("cavalgar"));
            if (cavalgar) {
                return {
                    tem: true,
                    nivel: cavalgar.nivel || cavalgar.valor || 0,
                    nome: cavalgar.nome
                };
            }
        }
        return { tem: false, nivel: 0, nome: "Cavalgar (qualquer)" };
    }
    
    return { tem: false, nivel: 0, nome: nomePericia };
}

// ===== 5. VERIFICAR PRÉ-REQUISITOS =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: arco.tem && cavalgar.tem && arco.nivel > 0
    };
}

// ===== 6. CALCULAR NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0, calculo: "Erro" };
    
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    
    if (!arcoInfo.tem || arcoInfo.nivel <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            calculo: "Arco não aprendido"
        };
    }
    
    const nhArco = arcoInfo.nivel;
    
    // Cálculo: NH Arco - 4 + níveis
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // Não pode exceder NH do Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não pode ser negativo
    if (nhFinal < 0) nhFinal = 0;
    
    // String do cálculo
    const sinalMod = tecnica.modificadorBase >= 0 ? '+' : '';
    const sinalNiveis = niveisInvestidos > 0 ? '+' : '';
    const calculo = `${nhArco}${sinalMod}${tecnica.modificadorBase}${sinalNiveis}${niveisInvestidos > 0 ? niveisInvestidos : ''} = ${nhFinal}`;
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        calculo: calculo
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
        }
        
        // Card HTML
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
                    <span class="valor">${tecnica.periciaBase} ${prereq.arco.tem ? `(NH ${nhCalculo.nhBase})` : ''}</span>
                </div>
                <div class="info-item">
                    <span class="label">Penalidade:</span>
                    <span class="valor">${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <span class="label">NH Técnica:</span>
                    <span class="valor">${nhCalculo.nh > 0 ? nhCalculo.nh : '--'}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <div class="prereq-titulo">Pré-requisitos:</div>
                <div class="prereq-item ${prereq.arco.tem ? 'ok' : 'falta'}">
                    <i class="fas fa-${prereq.arco.tem ? 'check' : 'times'}"></i>
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
                        ${statusClass === 'bloqueada' ? 'disabled' : ''}>
                    <i class="fas ${btnIcon}"></i> ${btnText}
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== 8. RENDERIZAR TÉCNICAS APRENDIDAS =====
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

// ===== 9. MODAL COMPLETO =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    const cavalgarInfo = buscarPericiaParaTecnica("Cavalgar");
    
    const nhArco = arcoInfo.nivel || 0;
    
    // Valores iniciais
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    const nhCalculo = calcularNHTecnica(id, niveisIniciais);
    
    // HTML do modal
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
                        <div class="prereq ${arcoInfo.tem ? 'ok' : 'falta'}">
                            <i class="fas fa-${arcoInfo.tem ? 'check' : 'times'}"></i>
                            <span>${arcoInfo.nome}</span>
                            <small>${arcoInfo.tem ? `NH ${arcoInfo.nivel}` : 'Não aprendido'}</small>
                        </div>
                        <div class="prereq ${cavalgarInfo.tem ? 'ok' : 'falta'}">
                            <i class="fas fa-${cavalgarInfo.tem ? 'check' : 'times'}"></i>
                            <span>${cavalgarInfo.nome}</span>
                            <small>${cavalgarInfo.tem ? `NH ${cavalgarInfo.nivel}` : 'Não aprendido'}</small>
                        </div>
                    </div>
                </div>
                
                ${prereq.todosCumpridos && nhArco > 0 ? `
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
                        <strong>${nhArco} ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis adquiridos:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH final:</span>
                        <strong id="resumo-nh">${nhCalculo.nh}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Pontos a gastar:</span>
                        <strong id="resumo-pontos">${pontosIniciais}</strong>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos não cumpridos</strong>
                        <p>Você precisa aprender Arco (NH mínimo 1) e Cavalgar (qualquer) para adquirir esta técnica.</p>
                    </div>
                </div>
                `}
            </div>
            
            <div class="modal-rodape">
                <button class="btn-cancelar" onclick="fecharModalTecnica()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                
                ${prereq.todosCumpridos && nhArco > 0 ? `
                <button class="btn-confirmar" onclick="confirmarTecnicaModal('${id}')">
                    <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar' : 'Adquirir'}
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Insere no modal
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
    }
    
    // Mostra overlay
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Salva seleção
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
}

// ===== 10. SELEÇÃO DE OPÇÃO NO MODAL =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    // Remove classe ativa
    document.querySelectorAll('.opcao-pontos').forEach(btn => btn.classList.remove('ativo'));
    
    // Adiciona ao clicado
    event.target.closest('.opcao-pontos').classList.add('ativo');
    
    // Atualiza seleção
    tecnicaModalSelecionada.pontos = pontos;
    tecnicaModalSelecionada.niveis = niveis;
    
    // Calcula NH
    const nhBase = nhArco + modificador;
    const nhFinal = Math.min(nhBase + niveis, nhArco);
    
    // Atualiza resumo
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('resumo-pontos').textContent = pontos;
}

// ===== 11. CONFIRMAR TÉCNICA =====
function confirmarTecnicaModal(id) {
    if (!tecnicaModalSelecionada) {
        alert('❌ Selecione uma opção primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    
    // Verifica pré-requisitos
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('❌ Pré-requisitos não cumpridos!');
        return;
    }
    
    // Verifica Arco com NH mínimo
    if (prereq.arco.nivel <= 0) {
        alert('❌ Você precisa ter pelo menos 1 ponto em Arco!');
        return;
    }
    
    // Calcula NH para verificação
    const nhCalculo = calcularNHTecnica(id, niveis);
    
    // Procura técnica existente
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // ATUALIZAR técnica existente
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos;
        const diferencaPontos = pontos - pontosAntigos;
        
        pontosTecnicas += diferencaPontos;
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase
        };
        
        alert(`✅ ${tecnica.nome} atualizada!\nNH: ${nhCalculo.nh}`);
    } else {
        // ADICIONAR nova técnica
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
        
        alert(`✅ ${tecnica.nome} adquirida!\nNH: ${nhCalculo.nh}`);
    }
    
    // Salva no localStorage
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fecha modal e atualiza
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 12. EDIÇÃO =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

// ===== 13. REMOÇÃO =====
function removerTecnica(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica?\nOs pontos serão devolvidos.')) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnicaRemovida = tecnicasAprendidas[index];
    pontosTecnicas -= tecnicaRemovida.pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Atualiza
    renderizarTodasTecnicas();
    alert('✅ Técnica removida!');
}

// ===== 14. FECHAR MODAL =====
function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) modal.innerHTML = '';
    
    tecnicaModalSelecionada = null;
}

// ===== 15. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
}

// ===== 16. FUNÇÃO PRINCIPAL =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 17. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log('🔧 Inicializando técnicas...');
    
    try {
        const dados = localStorage.getItem('tecnicas_aprendidas');
        if (dados) tecnicasAprendidas = JSON.parse(dados);
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) pontosTecnicas = parseInt(pontos);
    } catch (e) {
        console.log('Nenhuma técnica salva');
    }
    
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', renderizarTodasTecnicas);
    }
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) fecharModalTecnica();
        });
    }
    
    renderizarTodasTecnicas();
}

// ===== 18. EXPORTAR FUNÇÕES =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== 19. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarSistemaTecnicas, 100);
            }
        });
    });
    
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarSistemaTecnicas, 100);
    }
});

console.log('✅ TECNICAS.JS - SISTEMA CORRETO CARREGADO');