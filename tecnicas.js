// ============================================
// TECNICAS.JS - SISTEMA COMPLETO 100%
// ============================================

// ===== 1. CATÁLOGO SIMPLES E CORRETO =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto montado. Penalidade base de -4 no ARCO. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "Arco",        // MODIFICA O ARCO
        atributo: "DX",
        modificadorBase: -4,        // -4 NO ARCO
        prereq: ["Arco", "Cavalgar"] // Arco específico, qualquer Cavalgar
    }
];

// ===== 2. ESTADO SIMPLES =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');

// ===== 3. BUSCA DE PERÍCIAS - CORRETA =====
function buscarPericiaParaTecnica(nomePericia) {
    console.log(`🔍 Buscando: ${nomePericia}`);
    
    // Tenta o sistema principal primeiro
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        
        // PARA ARCO: busca específico
        if (nomePericia === "Arco") {
            const arco = pericias.find(p => 
                p && p.nome && 
                (p.nome === "Arco" || p.nome.includes("Arco"))
            );
            if (arco) {
                return {
                    tem: true,
                    nivel: arco.nivel || 0,
                    nome: arco.nome
                };
            }
        }
        
        // PARA CAVALGAR: aceita QUALQUER
        if (nomePericia === "Cavalgar") {
            const cavalgar = pericias.find(p => 
                p && p.nome && 
                p.nome.toLowerCase().includes("cavalgar")
            );
            if (cavalgar) {
                return {
                    tem: true,
                    nivel: cavalgar.nivel || 0,
                    nome: cavalgar.nome
                };
            }
        }
    }
    
    // Fallback para localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            const pericias = parsed.periciasAprendidas || parsed;
            
            if (Array.isArray(pericias)) {
                // Arco específico
                if (nomePericia === "Arco") {
                    const arco = pericias.find(p => 
                        p && p.nome && 
                        (p.nome === "Arco" || p.nome.includes("Arco"))
                    );
                    if (arco) {
                        return {
                            tem: true,
                            nivel: arco.nivel || 0,
                            nome: arco.nome
                        };
                    }
                }
                
                // Qualquer Cavalgar
                if (nomePericia === "Cavalgar") {
                    const cavalgar = pericias.find(p => 
                        p && p.nome && 
                        p.nome.toLowerCase().includes("cavalgar")
                    );
                    if (cavalgar) {
                        return {
                            tem: true,
                            nivel: cavalgar.nivel || 0,
                            nome: cavalgar.nome
                        };
                    }
                }
            }
        }
    } catch (e) {
        console.log("Erro ao buscar perícias:", e);
    }
    
    return { tem: false, nivel: 0, nome: nomePericia };
}

// ===== 4. VERIFICAR PRÉ-REQUISITOS =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: arco.tem && cavalgar.tem
    };
}

// ===== 5. CALCULAR NH - 100% CORRETO =====
function calcularNHTecnicaCorreto(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0, calculo: "Erro" };
    
    // Busca o NH do ARCO
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    
    if (!arcoInfo.tem || arcoInfo.nivel <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            calculo: "Arco não aprendido"
        };
    }
    
    const nhArco = arcoInfo.nivel;
    
    // CÁLCULO: NH Arco - 4 + níveis investidos
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // NUNCA excede NH do Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não pode ser negativo
    if (nhFinal < 0) nhFinal = 0;
    
    // String do cálculo para exibir
    const sinalMod = tecnica.modificadorBase >= 0 ? '+' : '';
    const sinalNiveis = niveisInvestidos > 0 ? '+' : '';
    const calculo = `${nhArco}${sinalMod}${tecnica.modificadorBase}${sinalNiveis}${niveisInvestidos > 0 ? niveisInvestidos : ''} = ${nhFinal}`;
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        calculo: calculo,
        periciaBase: arcoInfo
    };
}

// ===== 6. RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnicaCorreto(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
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
                    <span class="valor">${tecnica.modificadorBase} (no Arco)</span>
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
                    Arco ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}
                </div>
                <div class="prereq-item ${prereq.cavalgar.tem ? 'ok' : 'falta'}">
                    <i class="fas fa-${prereq.cavalgar.tem ? 'check' : 'times'}"></i>
                    ${prereq.cavalgar.tem ? prereq.cavalgar.nome : 'Cavalgar (qualquer)'}
                    ${prereq.cavalgar.tem ? `(NH ${prereq.cavalgar.nivel})` : ''}
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

// ===== 7. RENDERIZAR APRENDIDAS =====
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
        
        const nh = calcularNHTecnicaCorreto(tecnica.id, tecnica.niveis || 0);
        
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
                    <span>Perícia Base:</span>
                    <strong>${base.periciaBase} (NH ${nh.nhBase})</strong>
                </div>
                <div class="detalhe">
                    <span>Penalidade:</span>
                    <strong>${base.modificadorBase}</strong>
                </div>
                <div class="detalhe">
                    <span>Níveis:</span>
                    <strong>+${tecnica.niveis || 0}</strong>
                </div>
                <div class="detalhe">
                    <span>Pontos:</span>
                    <strong>${tecnica.pontos || 0} pts</strong>
                </div>
            </div>
            
            <div class="aprendida-calculo">
                <small>${nh.calculo}</small>
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
// ===== 8. MODAL COMPLETO E FUNCIONAL =====
let tecnicaModalSelecionada = null;

function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    // Busca perícias
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    const cavalgarInfo = buscarPericiaParaTecnica("Cavalgar");
    
    // Configurações iniciais
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    
    // Cálculos NH
    const nhArco = arcoInfo.nivel || 0;
    const nhBase = nhArco + tecnica.modificadorBase; // Arco -4
    const nhAtual = Math.min(nhBase + niveisIniciais, nhArco);
    
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
                            <span>Arco</span>
                            <small>${arcoInfo.tem ? `NH ${arcoInfo.nivel}` : 'Não aprendido'}</small>
                        </div>
                        <div class="prereq ${cavalgarInfo.tem ? 'ok' : 'falta'}">
                            <i class="fas fa-${cavalgarInfo.tem ? 'check' : 'times'}"></i>
                            <span>${cavalgarInfo.tem ? cavalgarInfo.nome : 'Cavalgar'}</span>
                            <small>${cavalgarInfo.tem ? `NH ${cavalgarInfo.nivel}` : 'Não aprendido'}</small>
                        </div>
                    </div>
                </div>
                
                ${prereq.todosCumpridos && nhArco > 0 ? `
                <div class="modal-investimento">
                    <h4><i class="fas fa-coins"></i> Investir Pontos</h4>
                    <div class="opcoes-pontos">
                        <button class="opcao-pontos ${pontosIniciais === 2 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(2, 1, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">2 pontos</div>
                            <div class="niveis">+1 nível</div>
                            <div class="nh">NH: ${Math.min(nhBase + 1, nhArco)}</div>
                        </button>
                        
                        <button class="opcao-pontos ${pontosIniciais === 3 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(3, 2, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">3 pontos</div>
                            <div class="niveis">+2 níveis</div>
                            <div class="nh">NH: ${Math.min(nhBase + 2, nhArco)}</div>
                        </button>
                        
                        <button class="opcao-pontos ${pontosIniciais === 4 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(4, 3, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">4 pontos</div>
                            <div class="niveis">+3 níveis</div>
                            <div class="nh">NH: ${Math.min(nhBase + 3, nhArco)}</div>
                        </button>
                        
                        <button class="opcao-pontos ${pontosIniciais === 5 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(5, 4, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">5 pontos</div>
                            <div class="niveis">+4 níveis</div>
                            <div class="nh">NH: ${Math.min(nhBase + 4, nhArco)}</div>
                        </button>
                    </div>
                </div>
                
                <div class="modal-resumo">
                    <h4><i class="fas fa-calculator"></i> Resumo</h4>
                    <div class="resumo-item">
                        <span>Arco:</span>
                        <strong>NH ${nhArco} ${tecnica.modificadorBase} = ${nhBase}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis adicionais:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH final:</span>
                        <strong id="resumo-nh">${nhAtual}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Pontos investidos:</span>
                        <strong id="resumo-pontos">${pontosIniciais}</strong>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos não cumpridos</strong>
                        <p>Você precisa aprender Arco e Cavalgar para adquirir esta técnica.</p>
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
    
    // Salva dados da técnica selecionada
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
}

// ===== 9. SELEÇÃO DE OPÇÃO NO MODAL =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    // Remove classe ativa de todos
    document.querySelectorAll('.opcao-pontos').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
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

// ===== 10. CONFIRMAR TÉCNICA =====
function confirmarTecnicaModal(id) {
    if (!tecnicaModalSelecionada) return;
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    
    // Verifica pré-requisitos novamente
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('❌ Pré-requisitos não cumpridos!');
        return;
    }
    
    // Verifica se tem Arco com pelo menos 1 ponto
    if (prereq.arco.nivel <= 0) {
        alert('❌ Você precisa ter pelo menos 1 ponto em Arco!');
        return;
    }
    
    // Procura se já tem a técnica
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
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
        
        alert(`✅ ${tecnica.nome} atualizada!`);
    } else {
        // Adicionar nova técnica
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
        
        alert(`✅ ${tecnica.nome} adquirida!`);
    }
    
    // Salva no localStorage
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fecha modal e atualiza
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 11. EDIÇÃO E REMOÇÃO =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica?')) return;
    
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
    alert('Técnica removida!');
}

// ===== 12. FECHAR MODAL =====
function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = '';
    }
    
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
    console.log('🔧 Inicializando sistema de técnicas...');
    
    // Carrega dados salvos
    carregarTecnicasDoStorage();
    
    // Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', renderizarTodasTecnicas);
    }
    
    // Configura fechar modal ao clicar fora
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                fecharModalTecnica();
            }
        });
    }
    
    // Renderiza tudo
    renderizarTodasTecnicas();
}

// ===== 16. CARREGAR DO STORAGE =====
function carregarTecnicasDoStorage() {
    try {
        const dados = localStorage.getItem('tecnicas_aprendidas');
        if (dados) {
            tecnicasAprendidas = JSON.parse(dados);
        }
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) {
            pontosTecnicas = parseInt(pontos);
        }
    } catch (e) {
        console.log('Nenhuma técnica salva encontrada');
    }
}

// ===== 17. EXPORTAR FUNÇÕES =====
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
    // Quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarSistemaTecnicas, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarSistemaTecnicas, 100);
    }
});

console.log('✅ SISTEMA DE TÉCNICAS 100% COMPLETO CARREGADO!');