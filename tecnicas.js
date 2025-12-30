// ============================================
// TECNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
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

// ===== 4. BUSCA SIMPLES DE PERÍCIAS =====
function buscarPericiaParaTecnica(nomePericia) {
    // Tenta no localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            const pericias = parsed.periciasAprendidas || parsed.pericias || parsed;
            
            if (Array.isArray(pericias)) {
                for (const pericia of pericias) {
                    if (!pericia || !pericia.nome) continue;
                    
                    // Arco
                    if (nomePericia === "Arco") {
                        const nomeLower = pericia.nome.toLowerCase();
                        if (nomeLower.includes("arco") || 
                            pericia.id === "arco" ||
                            pericia.id === "arco-longa" ||
                            pericia.id === "arco-curto") {
                            return {
                                tem: true,
                                nivel: pericia.nivel || pericia.valor || 1,
                                nome: pericia.nome
                            };
                        }
                    }
                    
                    // Cavalgar
                    if (nomePericia === "Cavalgar") {
                        const nomeLower = pericia.nome.toLowerCase();
                        if (nomeLower.includes("cavalgar") || 
                            nomeLower.includes("cavalo") ||
                            pericia.id.includes("cavalgar")) {
                            return {
                                tem: true,
                                nivel: pericia.nivel || pericia.valor || 1,
                                nome: pericia.nome
                            };
                        }
                    }
                }
            }
        }
    } catch (e) {
        console.log("Erro ao buscar:", e);
    }
    
    // Tenta no window.estadoPericias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        
        for (const pericia of pericias) {
            if (!pericia || !pericia.nome) continue;
            
            // Arco
            if (nomePericia === "Arco" && 
                (pericia.nome.includes("Arco") || pericia.id === "arco")) {
                return {
                    tem: true,
                    nivel: pericia.nivel || pericia.valor || 1,
                    nome: pericia.nome
                };
            }
            
            // Cavalgar
            if (nomePericia === "Cavalgar" && pericia.nome.includes("Cavalgar")) {
                return {
                    tem: true,
                    nivel: pericia.nivel || pericia.valor || 1,
                    nome: pericia.nome
                };
            }
        }
    }
    
    return { tem: false, nivel: 0, nome: nomePericia };
}

// ===== 5. VERIFICAÇÃO DE PRÉ-REQUISITOS =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: arco.tem && cavalgar.tem
    };
}

// ===== 6. CALCULAR NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0 };
    
    const arco = buscarPericiaParaTecnica("Arco");
    
    if (!arco.tem || arco.nivel <= 0) {
        return { nh: 0, nhBase: 0 };
    }
    
    const nhArco = arco.nivel;
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // Limites
    if (nhFinal > nhArco) nhFinal = nhArco;
    if (nhFinal < 0) nhFinal = 0;
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        bonusNiveis: niveisInvestidos
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
        let statusClass = '';
        let statusText = '';
        let btnText = '';
        let btnIcon = '';
        let disabled = false;
        
        if (jaAprendida) {
            statusClass = 'aprendida';
            statusText = 'Aprendida';
            btnText = 'Editar';
            btnIcon = 'fa-edit';
        } else if (prereq.todosCumpridos) {
            statusClass = 'disponivel';
            statusText = 'Disponível';
            btnText = 'Adquirir';
            btnIcon = 'fa-plus-circle';
        } else {
            statusClass = 'bloqueada';
            statusText = 'Bloqueada';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            disabled = true;
        }
        
        const card = `
            <div class="tecnica-item">
                <div class="tecnica-header">
                    <div class="tecnica-nome">
                        <i class="${tecnica.icone}"></i>
                        ${tecnica.nome}
                    </div>
                    <div class="tecnica-status">
                        <span class="${statusClass}">${statusText}</span>
                    </div>
                </div>
                
                <div class="tecnica-descricao">
                    ${tecnica.descricao}
                </div>
                
                <div class="tecnica-info">
                    <div class="info-item">
                        <span class="label">Base:</span>
                        <span class="valor">${tecnica.periciaBase} ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Penalidade:</span>
                        <span class="valor">${tecnica.modificadorBase}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">NH Atual:</span>
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
                            ${disabled ? 'disabled' : ''}>
                        <i class="fas ${btnIcon}"></i> ${btnText}
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML += card;
    });
}

// ===== 8. RENDERIZAR APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>Adquira técnicas para vê-las aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasAprendidas.forEach(tecnica => {
        const base = CATALOGO_TECNICAS.find(t => t.id === tecnica.id);
        if (!base) return;
        
        const nh = calcularNHTecnica(tecnica.id, tecnica.niveis || 0);
        
        const card = `
            <div class="tecnica-aprendida-item">
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
            </div>
        `;
        
        container.innerHTML += card;
    });
}

// ===== 9. ABRIR MODAL (USANDO SEU SISTEMA) =====
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
    
    // HTML do modal usando SEUS estilos
    const modalHTML = `
        <div class="modal-pericia-conteudo">
            <div class="modal-pericia-cabecalho">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-pericia-fechar" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-pericia-corpo">
                <div class="modal-pericia-descricao">
                    ${tecnica.descricao}
                </div>
                
                <div class="modal-pericia-info">
                    <div class="info-row">
                        <span class="info-label">Dificuldade:</span>
                        <span class="info-value">${tecnica.dificuldade}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Atributo:</span>
                        <span class="info-value">${tecnica.atributo}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Perícia Base:</span>
                        <span class="info-value">${tecnica.periciaBase}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Penalidade Base:</span>
                        <span class="info-value">${tecnica.modificadorBase}</span>
                    </div>
                </div>
                
                <div class="modal-prereq">
                    <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                    <div class="prereq-lista">
                        <div class="prereq ${arco.tem && arco.nivel > 0 ? 'ok' : 'falta'}">
                            <i class="fas fa-${arco.tem && arco.nivel > 0 ? 'check' : 'times'}"></i>
                            <span>Arco</span>
                            <small>${arco.tem ? `NH ${arco.nivel}` : 'Não aprendido'}</small>
                        </div>
                        <div class="prereq ${cavalgar.tem ? 'ok' : 'falta'}">
                            <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
                            <span>Cavalgar (qualquer)</span>
                            <small>${cavalgar.tem ? `NH ${cavalgar.nivel}` : 'Não aprendido'}</small>
                        </div>
                    </div>
                </div>
                
                ${liberado ? `
                <div class="modal-pericia-controles">
                    <h4><i class="fas fa-chart-line"></i> Níveis de Investimento</h4>
                    
                    <div class="opcoes-pontos-container" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin: 15px 0;">
                        ${CUSTOS_TECNICAS.map((opcao, index) => {
                            const nhBase = nhArco + tecnica.modificadorBase;
                            const nhFinal = Math.min(nhBase + opcao.niveis, nhArco);
                            const selecionado = jaAprendida ? jaAprendida.niveis === opcao.niveis : index === 0;
                            
                            return `
                            <div class="opcao-pontos-wrapper" style="margin: 5px;">
                                <button class="especializacao-option ${selecionado ? 'selected' : ''}" 
                                        onclick="selecionarOpcaoTecnica(${opcao.pontos}, ${opcao.niveis}, ${nhArco}, ${tecnica.modificadorBase})"
                                        style="width: 100%; padding: 12px; text-align: center; background: ${selecionado ? 'rgba(46, 92, 58, 0.3)' : 'rgba(44, 32, 8, 0.6)'}; border: 2px solid ${selecionado ? 'var(--accent-green)' : 'var(--wood-light)'}; border-radius: 6px; color: var(--text-light); cursor: pointer;">
                                    <div style="font-size: 1.2rem; font-weight: bold; color: var(--primary-gold);">${opcao.pontos} pts</div>
                                    <div style="font-size: 1rem; margin: 5px 0;">+${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</div>
                                    <div style="font-size: 0.9rem; color: var(--text-gold);">NH: ${nhFinal}</div>
                                </button>
                            </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="calculo-nh" style="background: rgba(44, 32, 8, 0.6); padding: 15px; border-radius: 8px; margin-top: 20px; border: 1px solid var(--wood-light);">
                        <h4 style="margin-top: 0; color: var(--text-gold);"><i class="fas fa-calculator"></i> Cálculo do NH</h4>
                        
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                            <span style="color: rgba(212, 175, 55, 0.9);">NH do Arco:</span>
                            <span style="color: var(--text-light); font-weight: bold;">${nhArco}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                            <span style="color: rgba(212, 175, 55, 0.9);">Penalidade base:</span>
                            <span style="color: var(--text-light); font-weight: bold;">${tecnica.modificadorBase}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.1);">
                            <span style="color: rgba(212, 175, 55, 0.9);">Níveis:</span>
                            <span style="color: var(--text-light); font-weight: bold;" id="resumo-niveis">+${niveisIniciais}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 8px 0; margin-top: 8px; border-top: 2px solid var(--primary-gold);">
                            <span style="color: var(--text-gold); font-weight: bold; font-size: 1.1rem;">NH final:</span>
                            <span style="color: var(--primary-gold); font-weight: bold; font-size: 1.3rem;" id="resumo-nh">${Math.min(nhArco + tecnica.modificadorBase + niveisIniciais, nhArco)}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; padding: 5px 0; margin-top: 10px;">
                            <span style="color: rgba(212, 175, 55, 0.9);">Pontos gastos:</span>
                            <span style="color: var(--text-light); font-weight: bold;" id="resumo-pontos">${pontosIniciais}</span>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta" style="background: rgba(139, 0, 0, 0.1); border: 1px solid var(--accent-red); border-radius: 8px; padding: 15px; margin: 20px 0; display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-exclamation-triangle" style="color: var(--accent-red); font-size: 1.5rem;"></i>
                    <div>
                        <strong style="color: var(--text-light); display: block; margin-bottom: 5px;">Pré-requisitos não cumpridos</strong>
                        <p style="color: rgba(245, 245, 220, 0.8); margin: 0; font-size: 0.95rem;">
                            Você precisa aprender Arco (com pelo menos 1 ponto) e Cavalgar (qualquer especialização).
                        </p>
                    </div>
                </div>
                `}
            </div>
            
            <div class="modal-pericia-rodape">
                <button class="btn-cancelar" onclick="fecharModalTecnica()" style="background: rgba(139, 0, 0, 0.3); border: 2px solid var(--wood-light); color: var(--text-light); padding: 10px 20px; border-radius: 6px; cursor: pointer; font-family: 'Cinzel', serif;">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                
                ${liberado ? `
                <button class="btn-confirmar" onclick="confirmarTecnicaModal('${id}')" style="background: linear-gradient(145deg, var(--accent-green), #1e4028); border: none; color: white; padding: 10px 20px; border-radius: 6px; cursor: pointer; font-family: 'Cinzel', serif; font-weight: bold;">
                    <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar Técnica' : 'Adquirir Técnica'}
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Usa o modal existente das perícias
    const modal = document.getElementById('modal-pericia');
    const overlay = document.getElementById('modal-pericia-overlay');
    
    if (modal && overlay) {
        modal.innerHTML = modalHTML;
        overlay.style.display = 'flex';
        
        // Armazena dados da técnica selecionada
        tecnicaModalSelecionada = {
            id: id,
            pontos: pontosIniciais,
            niveis: niveisIniciais,
            nhArco: nhArco,
            modificador: tecnica.modificadorBase
        };
    } else {
        // Fallback: cria modal temporário
        criarModalTemporario(modalHTML, id, pontosIniciais, niveisIniciais, nhArco, tecnica.modificadorBase);
    }
}

// ===== 10. FUNÇÃO FALLBACK SE NÃO EXISTIR MODAL =====
function criarModalTemporario(html, id, pontos, niveis, nhArco, modificador) {
    // Remove modal temporário anterior se existir
    const modalAntigo = document.getElementById('modal-tecnica-temp');
    if (modalAntigo) modalAntigo.remove();
    
    // Cria overlay
    const overlay = document.createElement('div');
    overlay.id = 'modal-tecnica-temp';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    // Cria conteúdo
    const conteudo = document.createElement('div');
    conteudo.style.cssText = `
        background: linear-gradient(145deg, rgba(26, 18, 0, 0.95), rgba(44, 32, 8, 0.95));
        border: 3px solid var(--primary-gold);
        border-radius: 15px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        color: var(--text-light);
        font-family: 'Cinzel', serif;
    `;
    
    conteudo.innerHTML = html;
    
    overlay.appendChild(conteudo);
    document.body.appendChild(overlay);
    
    // Configura fechamento
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            overlay.remove();
            tecnicaModalSelecionada = null;
        }
    });
    
    // Armazena dados
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontos,
        niveis: niveis,
        nhArco: nhArco,
        modificador: modificador
    };
}

// ===== 11. SELEÇÃO DE OPÇÃO =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    if (!tecnicaModalSelecionada) return;
    
    // Atualiza seleção visual
    document.querySelectorAll('.especializacao-option').forEach(btn => {
        const btnPontos = parseInt(btn.textContent.match(/(\d+)\s*pts/)?.[1] || 0);
        if (btnPontos === pontos) {
            btn.classList.add('selected');
            btn.style.background = 'rgba(46, 92, 58, 0.3)';
            btn.style.borderColor = 'var(--accent-green)';
        } else {
            btn.classList.remove('selected');
            btn.style.background = 'rgba(44, 32, 8, 0.6)';
            btn.style.borderColor = 'var(--wood-light)';
        }
    });
    
    // Atualiza dados
    tecnicaModalSelecionada.pontos = pontos;
    tecnicaModalSelecionada.niveis = niveis;
    
    // Calcula NH
    const nhBase = nhArco + modificador;
    const nhFinal = Math.min(nhBase + niveis, nhArco);
    
    // Atualiza resumo
    const resumoNiveis = document.getElementById('resumo-niveis');
    const resumoNh = document.getElementById('resumo-nh');
    const resumoPontos = document.getElementById('resumo-pontos');
    
    if (resumoNiveis) resumoNiveis.textContent = `+${niveis}`;
    if (resumoNh) resumoNh.textContent = nhFinal;
    if (resumoPontos) resumoPontos.textContent = pontos;
}

// ===== 12. CONFIRMAR TÉCNICA =====
function confirmarTecnicaModal(id) {
    if (!tecnicaModalSelecionada) {
        alert('Selecione uma opção primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    
    // Verifica pré-requisitos
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('Pré-requisitos não cumpridos!');
        return;
    }
    
    // Confirma
    const confirmar = confirm(
        `${tecnica.nome}\n\n` +
        `Pontos: ${pontos}\n` +
        `Níveis: +${niveis}\n` +
        `NH final: ${calcularNHTecnica(id, niveis).nh}\n\n` +
        `Deseja ${tecnicaModalSelecionada.pontos === 0 ? 'adquirir' : 'atualizar'} esta técnica?`
    );
    
    if (!confirmar) return;
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualiza
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos || 0;
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
        // Adiciona nova
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
    
    // Fecha modal
    fecharModalTecnica();
    
    // Atualiza interface
    renderizarTodasTecnicas();
    
    // Mostra mensagem
    alert(`Técnica ${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'} com sucesso!`);
}

// ===== 13. FECHAR MODAL =====
function fecharModalTecnica() {
    // Tenta fechar modal das perícias
    const modalPericia = document.getElementById('modal-pericia-overlay');
    if (modalPericia) {
        modalPericia.style.display = 'none';
    }
    
    // Tenta fechar modal temporário
    const modalTemp = document.getElementById('modal-tecnica-temp');
    if (modalTemp) {
        modalTemp.remove();
    }
    
    // Limpa dados
    tecnicaModalSelecionada = null;
}

// ===== 14. FUNÇÕES AUXILIARES =====
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
    alert('Técnica removida!');
}

function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
}

// ===== 15. FUNÇÃO PRINCIPAL =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 16. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log('Inicializando técnicas...');
    
    // Carrega dados
    try {
        const dados = localStorage.getItem('tecnicas_aprendidas');
        if (dados) tecnicasAprendidas = JSON.parse(dados);
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) pontosTecnicas = parseInt(pontos);
    } catch (e) {
        console.log('Nenhuma técnica salva');
    }
    
    // Botão atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.onclick = renderizarTodasTecnicas;
    }
    
    // Configura tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
    
    // Renderiza
    renderizarTodasTecnicas();
}

// ===== 17. EXPORTAR =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== 18. INICIALIZAÇÃO AUTOMÁTICA =====
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

console.log('✅ TECNICAS.JS CARREGADO');