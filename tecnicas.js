// ============================================
// TECNICAS.JS - SISTEMA 100% FUNCIONAL
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

// ===== 4. BUSCA SIMPLES E FUNCIONAL =====
function buscarPericiaParaTecnica(nomePericia) {
    console.log(`🔍 Buscando: "${nomePericia}"`);
    
    // PRIMEIRO: Verifica no sistema principal
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        console.log(`📊 Sistema tem ${pericias.length} perícias`);
        
        // PARA ARCO
        if (nomePericia === "Arco") {
            // Procura por nome exato
            const arcoExato = pericias.find(p => p && p.nome && p.nome === "Arco");
            if (arcoExato) {
                console.log(`✅ Arco encontrado: "${arcoExato.nome}" - NH ${arcoExato.nivel || 0}`);
                return {
                    tem: true,
                    nivel: arcoExato.nivel || arcoExato.valor || 0,
                    nome: arcoExato.nome
                };
            }
            
            // Procura por ID
            const arcoId = pericias.find(p => p && p.id && p.id === "arco");
            if (arcoId) {
                console.log(`✅ Arco por ID: "${arcoId.nome}" - NH ${arcoId.nivel || 0}`);
                return {
                    tem: true,
                    nivel: arcoId.nivel || arcoId.valor || 0,
                    nome: arcoId.nome
                };
            }
            
            // Procura por nome que contém
            const arcoParcial = pericias.find(p => p && p.nome && p.nome.includes("Arco"));
            if (arcoParcial) {
                console.log(`✅ Arco parcial: "${arcoParcial.nome}" - NH ${arcoParcial.nivel || 0}`);
                return {
                    tem: true,
                    nivel: arcoParcial.nivel || arcoParcial.valor || 0,
                    nome: arcoParcial.nome
                };
            }
        }
        
        // PARA CAVALGAR
        if (nomePericia === "Cavalgar") {
            // Procura QUALQUER que tenha cavalgar
            const cavalgar = pericias.find(p => p && p.nome && p.nome.includes("Cavalgar"));
            if (cavalgar) {
                console.log(`✅ Cavalgar encontrado: "${cavalgar.nome}" - NH ${cavalgar.nivel || 0}`);
                return {
                    tem: true,
                    nivel: cavalgar.nivel || cavalgar.valor || 0,
                    nome: cavalgar.nome
                };
            }
        }
    }
    
    // SEGUNDO: Fallback para localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            const pericias = parsed.periciasAprendidas || parsed;
            
            if (Array.isArray(pericias)) {
                // PARA ARCO
                if (nomePericia === "Arco") {
                    const arco = pericias.find(p => 
                        (p && p.nome && p.nome === "Arco") ||
                        (p && p.id && p.id === "arco") ||
                        (p && p.nome && p.nome.includes("Arco"))
                    );
                    
                    if (arco) {
                        console.log(`✅ Arco no localStorage: "${arco.nome}"`);
                        return {
                            tem: true,
                            nivel: arco.nivel || arco.valor || 0,
                            nome: arco.nome
                        };
                    }
                }
                
                // PARA CAVALGAR
                if (nomePericia === "Cavalgar") {
                    const cavalgar = pericias.find(p => 
                        p && p.nome && p.nome.includes("Cavalgar")
                    );
                    
                    if (cavalgar) {
                        console.log(`✅ Cavalgar no localStorage: "${cavalgar.nome}"`);
                        return {
                            tem: true,
                            nivel: cavalgar.nivel || cavalgar.valor || 0,
                            nome: cavalgar.nome
                        };
                    }
                }
            }
        }
    } catch (e) {
        console.error("Erro ao ler localStorage:", e);
    }
    
    console.log(`❌ "${nomePericia}" não encontrada`);
    return { 
        tem: false, 
        nivel: 0, 
        nome: nomePericia === "Cavalgar" ? "Cavalgar (qualquer)" : nomePericia 
    };
}

// ===== 5. VERIFICAÇÃO SIMPLES =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    console.log(`📋 Verificando "${tecnica.nome}":`);
    console.log(`   Arco: ${arco.tem ? '✅' : '❌'} NH ${arco.nivel}`);
    console.log(`   Cavalgar: ${cavalgar.tem ? '✅' : '❌'} NH ${cavalgar.nivel}`);
    
    // SÓ precisa ter as perícias, não precisa de nível mínimo (exceto Arco > 0)
    const todosCumpridos = arco.tem && cavalgar.tem && arco.nivel > 0;
    
    console.log(`   Resultado: ${todosCumpridos ? '✅ LIBERADO' : '❌ BLOQUEADO'}`);
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: todosCumpridos
    };
}

// ===== 6. CALCULAR NH SIMPLES =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0, calculo: "Erro" };
    
    const arco = buscarPericiaParaTecnica("Arco");
    
    if (!arco.tem || arco.nivel <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            calculo: "Arco não aprendido"
        };
    }
    
    const nhArco = arco.nivel;
    
    // Cálculo simples: Arco - 4 + níveis
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // Não passa do Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não negativo
    if (nhFinal < 0) nhFinal = 0;
    
    const calculo = `${nhArco} ${tecnica.modificadorBase} ${niveisInvestidos > 0 ? '+' + niveisInvestidos : ''} = ${nhFinal}`;
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        calculo: calculo
    };
}

// ===== 7. RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container não encontrado");
        return;
    }
    
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
                    <span class="valor">${tecnica.periciaBase} ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}</span>
                </div>
                <div class="info-item">
                    <span class="label">Penalidade:</span>
                    <span class="valor">${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <span class="label">NH:</span>
                    <span class="valor">${nhCalculo.nh > 0 ? nhCalculo.nh : '--'}</span>
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

// ===== 9. MODAL SIMPLES E FUNCIONAL =====
function abrirModalTecnica(id) {
    console.log(`📱 Abrindo modal: ${id}`);
    
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
    const nhCalculo = calcularNHTecnica(id, niveisIniciais);
    
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
                        <strong>${nhArco} ${tecnica.modificadorBase} = ${nhArco + tecnica.modificadorBase}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH final:</span>
                        <strong id="resumo-nh">${nhCalculo.nh}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Pontos:</span>
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

// ===== 10. SELEÇÃO DE OPÇÃO =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    document.querySelectorAll('.opcao-pontos').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
    event.target.closest('.opcao-pontos').classList.add('ativo');
    
    tecnicaModalSelecionada.pontos = pontos;
    tecnicaModalSelecionada.niveis = niveis;
    
    const nhBase = nhArco + modificador;
    const nhFinal = Math.min(nhBase + niveis, nhArco);
    
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('resumo-pontos').textContent = pontos;
}

// ===== 11. CONFIRMAR TÉCNICA =====
function confirmarTecnicaModal(id) {
    if (!tecnicaModalSelecionada) {
        alert('Selecione uma opção primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    
    // Verifica novamente
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
        
        alert(`${tecnica.nome} atualizada!`);
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
        
        alert(`${tecnica.nome} adquirida!`);
    }
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fecha e atualiza
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 12. EDIÇÃO =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

// ===== 13. REMOÇÃO =====
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

// ===== 14. FECHAR MODAL =====
function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) modal.innerHTML = '';
    
    tecnicaModalSelecionada = null;
}

// ===== 15. ESTATÍSTICAS =====
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
        btnAtualizar.addEventListener('click', renderizarTodasTecnicas);
    }
    
    // Fechar modal
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

// ===== 18. FUNÇÃO DEBUG =====
function debugTecnicas() {
    console.log('=== 🐛 DEBUG ===');
    console.log('Técnicas aprendidas:', tecnicasAprendidas);
    console.log('Pontos:', pontosTecnicas);
    console.log('Arco:', buscarPericiaParaTecnica("Arco"));
    console.log('Cavalgar:', buscarPericiaParaTecnica("Cavalgar"));
    console.log('Estado perícias:', window.estadoPericias);
}

// ===== 19. EXPORTAR =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.debugTecnicas = debugTecnicas;

// ===== 20. INICIALIZAÇÃO AUTOMÁTICA =====
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

console.log('✅ TECNICAS.JS - SISTEMA 100% FUNCIONAL CARREGADO');