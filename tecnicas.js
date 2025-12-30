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
        prereq: ["Arco", "Cavalgar (Cavalo)"]
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
let tecnicaSelecionada = null;

// ===== 4. FUNÇÃO VERIFICAR PERÍCIA - CORRIGIDA =====
function verificarPericia(nomePericia) {
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (!dados) return { tem: false, nivel: 0 };
        
        const parsed = JSON.parse(dados);
        const periciasAprendidas = parsed.periciasAprendidas || [];
        
        // PARA ARCO
        if (nomePericia === "Arco") {
            const arcoEncontrado = periciasAprendidas.find(p => 
                p && (p.id === "arco" || p.nome === "Arco" || (p.nome && p.nome.includes("Arco")))
            );
            
            if (arcoEncontrado) {
                // TENTA TODOS OS CAMPOS POSSÍVEIS PARA NH
                let nivelEncontrado = null;
                
                // Verifica campo por campo
                if (arcoEncontrado.nivel !== undefined && arcoEncontrado.nivel !== null) {
                    nivelEncontrado = arcoEncontrado.nivel;
                } else if (arcoEncontrado.valor !== undefined && arcoEncontrado.valor !== null) {
                    nivelEncontrado = arcoEncontrado.valor;
                } else if (arcoEncontrado.nivelHabilidade !== undefined && arcoEncontrado.nivelHabilidade !== null) {
                    nivelEncontrado = arcoEncontrado.nivelHabilidade;
                } else if (arcoEncontrado.NH !== undefined && arcoEncontrado.NH !== null) {
                    nivelEncontrado = arcoEncontrado.NH;
                } else if (arcoEncontrado.habilidade !== undefined && arcoEncontrado.habilidade !== null) {
                    nivelEncontrado = arcoEncontrado.habilidade;
                } else {
                    // Se não encontrou nenhum campo de nível, tenta calcular
                    if (arcoEncontrado.custo && arcoEncontrado.dificuldade) {
                        // Cálculo aproximado do GURPS
                        const custo = arcoEncontrado.custo || 0;
                        if (arcoEncontrado.dificuldade === "Fácil") {
                            nivelEncontrado = 10 + custo;
                        } else if (arcoEncontrado.dificuldade === "Média") {
                            nivelEncontrado = 9 + custo;
                        } else if (arcoEncontrado.dificuldade === "Difícil") {
                            nivelEncontrado = 8 + custo;
                        }
                    }
                }
                
                return { 
                    tem: true, 
                    nivel: nivelEncontrado || 10  // Fallback para 10 se tudo falhar
                };
            }
        }
        
        // PARA CAVALGAR - QUALQUER ESPECIALIZAÇÃO SERVE
        if (nomePericia.includes("Cavalgar")) {
            const qualquerCavalgar = periciasAprendidas.find(p => 
                p && p.id && (p.id.includes("cavalgar") || (p.nome && p.nome.includes("Cavalgar")))
            );
            
            if (qualquerCavalgar) {
                // Mesma lógica de busca do NH
                let nivelEncontrado = null;
                
                if (qualquerCavalgar.nivel !== undefined && qualquerCavalgar.nivel !== null) {
                    nivelEncontrado = qualquerCavalgar.nivel;
                } else if (qualquerCavalgar.valor !== undefined && qualquerCavalgar.valor !== null) {
                    nivelEncontrado = qualquerCavalgar.valor;
                } else if (qualquerCavalgar.nivelHabilidade !== undefined && qualquerCavalgar.nivelHabilidade !== null) {
                    nivelEncontrado = qualquerCavalgar.nivelHabilidade;
                }
                
                return { 
                    tem: true, 
                    nivel: nivelEncontrado || 10
                };
            }
        }
        
    } catch (e) {
        console.error("Erro ao verificar perícia:", e);
    }
    
    return { tem: false, nivel: 0 };
}

// ===== 5. VERIFICAÇÃO DE PRÉ-REQUISITOS =====
function verificarPrereqTecnica(tecnica) {
    const arco = verificarPericia("Arco");
    const cavalgar = verificarPericia("Cavalgar");
    
    const todosCumpridos = arco.tem && cavalgar.tem;
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: todosCumpridos
    };
}

// ===== 6. CALCULAR NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0 };
    
    const arco = verificarPericia("Arco");
    
    if (!arco.tem || arco.nivel <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            bonusNiveis: 0
        };
    }
    
    const nhArco = arco.nivel;
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // Não pode exceder o nível de Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não pode ser negativo
    if (nhFinal < 0) nhFinal = 0;
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        bonusNiveis: niveisInvestidos
    };
}

// ===== 7. RENDERIZAR CATÁLOGO DE TÉCNICAS =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
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
        
        const cardHTML = `
            <div class="tecnica-card">
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
                        <span class="label">NH Atual:</span>
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
                        Cavalgar ${prereq.cavalgar.tem ? `(NH ${prereq.cavalgar.nivel})` : ''}
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
        
        container.innerHTML += cardHTML;
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
        
        const cardHTML = `
            <div class="tecnica-aprendida-card">
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
        
        container.innerHTML += cardHTML;
    });
}

// ===== 9. CRIAR E MOSTRAR MODAL =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    const arco = verificarPericia("Arco");
    const cavalgar = verificarPericia("Cavalgar");
    
    const nhArco = arco.nivel || 0;
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    
    const liberado = prereq.todosCumpridos && nhArco > 0;
    const nhInicial = Math.min(nhArco + tecnica.modificadorBase + niveisIniciais, nhArco);
    
    const modalHTML = `
        <div class="modal-tecnica-overlay" id="modal-tecnica-overlay">
            <div class="modal-tecnica">
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
                                <div class="prereq ${arco.tem ? 'ok' : 'falta'}">
                                    <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i>
                                    <span>Arco</span>
                                    <small>${arco.tem ? `NH ${arco.nivel}` : 'Não aprendido'}</small>
                                </div>
                                <div class="prereq ${cavalgar.tem ? 'ok' : 'falta'}">
                                    <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
                                    <span>Cavalgar</span>
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
                                <strong id="resumo-nh">${nhInicial}</strong>
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
                                <p>Você precisa aprender Arco (com pelo menos 1 ponto) e qualquer especialização de Cavalgar.</p>
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
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    tecnicaSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
}

// ===== 10. SELEÇÃO DE OPÇÃO NO MODAL =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    document.querySelectorAll('.opcao-pontos').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
    event.target.closest('.opcao-pontos').classList.add('ativo');
    
    if (tecnicaSelecionada) {
        tecnicaSelecionada.pontos = pontos;
        tecnicaSelecionada.niveis = niveis;
        
        const nhBase = nhArco + modificador;
        const nhFinal = Math.min(nhBase + niveis, nhArco);
        
        const resumoNiveis = document.getElementById('resumo-niveis');
        const resumoNh = document.getElementById('resumo-nh');
        const resumoPontos = document.getElementById('resumo-pontos');
        
        if (resumoNiveis) resumoNiveis.textContent = `+${niveis}`;
        if (resumoNh) resumoNh.textContent = nhFinal;
        if (resumoPontos) resumoPontos.textContent = pontos;
    }
}

// ===== 11. CONFIRMAR AQUISIÇÃO DA TÉCNICA - CORRIGIDA =====
function confirmarTecnicaModal(id) {
    if (!tecnicaSelecionada) {
        alert('Por favor, selecione uma opção de níveis primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaSelecionada;
    
    // Verifica pré-requisitos
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('Pré-requisitos não cumpridos!');
        return;
    }
    
    const confirmacao = confirm(
        `Deseja ${tecnicaSelecionada.pontos === 2 ? 'adquirir' : 'atualizar'} ${tecnica.nome}?\n\n` +
        `• Pontos gastos: ${pontos}\n` +
        `• Níveis: +${niveis}\n` +
        `• NH final: ${Math.min(tecnicaSelecionada.nhArco + tecnica.modificadorBase + niveis, tecnicaSelecionada.nhArco)}`
    );
    
    if (!confirmacao) return;
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos || 0;
        pontosTecnicas += (pontos - pontosAntigos);
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Adicionar nova técnica
        tecnicasAprendidas.push({
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            dataAquisicao: new Date().toISOString()
        });
        pontosTecnicas += pontos;
    }
    
    // Salva no localStorage
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fecha o modal
    fecharModalTecnica();
    
    // ATUALIZA A INTERFACE IMEDIATAMENTE - CORREÇÃO AQUI
    setTimeout(() => {
        renderizarTodasTecnicas();
        alert(`${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'} com sucesso!`);
    }, 50);
}

// ===== 12. FUNÇÕES AUXILIARES =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Tem certeza que deseja remover ${tecnica.nome}?`)) {
        return;
    }
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    pontosTecnicas -= tecnicasAprendidas[index].pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    renderizarTodasTecnicas();
    
    setTimeout(() => {
        alert(`${tecnica.nome} removida com sucesso!`);
    }, 100);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.remove();
    }
    tecnicaSelecionada = null;
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

// ===== 14. FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 15. INICIALIZAÇÃO DO SISTEMA =====
function inicializarSistemaTecnicas() {
    console.log('🎯 Inicializando sistema de técnicas...');
    
    // Carrega dados salvos
    try {
        const dadosTecnicas = localStorage.getItem('tecnicas_aprendidas');
        if (dadosTecnicas) {
            tecnicasAprendidas = JSON.parse(dadosTecnicas);
        }
        
        const dadosPontos = localStorage.getItem('pontos_tecnicas');
        if (dadosPontos) {
            pontosTecnicas = parseInt(dadosPontos);
        }
    } catch (e) {
        console.log('Nenhuma técnica salva anteriormente');
    }
    
    // Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            renderizarTodasTecnicas();
            alert('Técnicas atualizadas!');
        });
    }
    
    // Adiciona estilos CSS se necessário
    adicionarEstilosTecnicas();
    
    // Renderiza pela primeira vez
    renderizarTodasTecnicas();
}

// ===== 16. ADICIONAR ESTILOS CSS =====
function adicionarEstilosTecnicas() {
    const estilos = `
        /* TÉCNICAS - ESTILOS GERAIS */
        .tecnica-card {
            background: rgba(44, 32, 8, 0.8);
            border: 2px solid var(--wood-light);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            transition: all 0.3s ease;
        }
        
        .tecnica-card:hover {
            border-color: var(--primary-gold);
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
        }
        
        .tecnica-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .tecnica-titulo {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-light);
        }
        
        .tecnica-titulo h4 {
            margin: 0;
            font-size: 1.2rem;
        }
        
        .tecnica-titulo i {
            color: var(--primary-gold);
            font-size: 1.2rem;
        }
        
        .tecnica-status {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
        }
        
        .tecnica-status.disponivel {
            background: rgba(46, 92, 58, 0.3);
            color: var(--accent-green);
            border: 1px solid var(--accent-green);
        }
        
        .tecnica-status.aprendida {
            background: rgba(212, 175, 55, 0.2);
            color: var(--text-gold);
            border: 1px solid var(--primary-gold);
        }
        
        .tecnica-status.bloqueada {
            background: rgba(139, 0, 0, 0.2);
            color: var(--accent-red);
            border: 1px solid var(--accent-red);
        }
        
        .tecnica-desc {
            color: rgba(245, 245, 220, 0.8);
            line-height: 1.5;
            margin-bottom: 15px;
            font-size: 0.95rem;
        }
        
        .tecnica-info {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
            background: rgba(26, 18, 0, 0.4);
            padding: 10px;
            border-radius: 6px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .info-item .label {
            color: rgba(212, 175, 55, 0.8);
            font-size: 0.85rem;
            margin-bottom: 3px;
        }
        
        .info-item .valor {
            color: var(--text-light);
            font-weight: bold;
            font-size: 1rem;
        }
        
        .tecnica-prereq {
            margin-bottom: 15px;
        }
        
        .prereq-titulo {
            color: var(--text-gold);
            font-size: 0.9rem;
            margin-bottom: 8px;
            font-weight: bold;
        }
        
        .prereq-item {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 5px;
            padding: 8px;
            border-radius: 6px;
            font-size: 0.9rem;
        }
        
        .prereq-item.ok {
            background: rgba(46, 92, 58, 0.2);
            color: var(--accent-green);
            border-left: 3px solid var(--accent-green);
        }
        
        .prereq-item.falta {
            background: rgba(139, 0, 0, 0.2);
            color: var(--accent-red);
            border-left: 3px solid var(--accent-red);
        }
        
        .tecnica-acoes {
            text-align: center;
        }
        
        .btn-tecnica {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-family: 'Cinzel', serif;
            font-weight: bold;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            width: 100%;
            justify-content: center;
        }
        
        .btn-tecnica.disponivel {
            background: linear-gradient(145deg, var(--accent-green), #1e4028);
            color: white;
        }
        
        .btn-tecnica.aprendida {
            background: linear-gradient(145deg, var(--primary-gold), #b8860b);
            color: #333;
        }
        
        .btn-tecnica.bloqueada {
            background: rgba(139, 0, 0, 0.3);
            color: var(--text-light);
            border: 1px solid var(--accent-red);
            cursor: not-allowed;
        }
        
        .btn-tecnica:hover:not(.bloqueada) {
            transform: scale(1.05);
        }
        
        /* TÉCNICAS APRENDIDAS */
        .tecnica-aprendida-card {
            background: rgba(26, 18, 0, 0.8);
            border: 2px solid var(--wood-light);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
        }
        
        .aprendida-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .aprendida-titulo {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-light);
        }
        
        .aprendida-titulo h4 {
            margin: 0;
            font-size: 1.2rem;
        }
        
        .aprendida-nh {
            background: rgba(212, 175, 55, 0.2);
            border: 2px solid var(--primary-gold);
            border-radius: 8px;
            padding: 8px 15px;
            color: var(--text-gold);
            font-weight: bold;
            font-size: 1.1rem;
        }
        
        .aprendida-detalhes {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 15px;
            background: rgba(44, 32, 8, 0.4);
            padding: 10px;
            border-radius: 6px;
        }
        
        .detalhe {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }
        
        .detalhe span {
            color: rgba(212, 175, 55, 0.8);
            font-size: 0.85rem;
            margin-bottom: 3px;
        }
        
        .detalhe strong {
            color: var(--text-light);
            font-size: 1rem;
        }
        
        .aprendida-acoes {
            display: flex;
            gap: 10px;
        }
        
        .btn-editar, .btn-remover {
            flex: 1;
            padding: 8px 15px;
            border-radius: 6px;
            font-family: 'Cinzel', serif;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-editar {
            background: rgba(212, 175, 55, 0.2);
            border: 1px solid var(--primary-gold);
            color: var(--text-gold);
        }
        
        .btn-editar:hover {
            background: rgba(212, 175, 55, 0.4);
        }
        
        .btn-remover {
            background: rgba(139, 0, 0, 0.2);
            border: 1px solid var(--accent-red);
            color: var(--text-light);
        }
        
        .btn-remover:hover {
            background: rgba(139, 0, 0, 0.4);
        }
        
        /* MODAL DE TÉCNICA */
        .modal-tecnica-overlay {
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
        }
        
        .modal-tecnica {
            background: linear-gradient(145deg, rgba(26, 18, 0, 0.95), rgba(44, 32, 8, 0.95));
            border: 3px solid var(--primary-gold);
            border-radius: 15px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-tecnica-conteudo {
            padding: 0;
        }
        
        .modal-cabecalho {
            background: rgba(44, 32, 8, 0.9);
            padding: 20px;
            border-bottom: 2px solid var(--primary-gold);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-cabecalho h3 {
            color: var(--text-gold);
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.5rem;
        }
        
        .modal-fechar {
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
        
        .modal-fechar:hover {
            background: rgba(139, 0, 0, 0.3);
            color: var(--accent-red);
        }
        
        .modal-corpo {
            padding: 25px;
        }
        
        .modal-descricao {
            color: rgba(245, 245, 220, 0.9);
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .modal-prereq {
            background: rgba(26, 18, 0, 0.6);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid var(--wood-light);
        }
        
        .modal-prereq h4 {
            color: var(--text-gold);
            margin: 0 0 15px 0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .prereq-lista {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .prereq {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 10px;
            background: rgba(44, 32, 8, 0.4);
            border-radius: 6px;
        }
        
        .prereq.ok {
            border-left: 4px solid var(--accent-green);
        }
        
        .prereq.falta {
            border-left: 4px solid var(--accent-red);
        }
        
        .prereq i {
            font-size: 1.2rem;
            width: 24px;
        }
        
        .prereq.ok i {
            color: var(--accent-green);
        }
        
        .prereq.falta i {
            color: var(--accent-red);
        }
        
        .prereq span {
            color: var(--text-light);
            font-size: 0.95rem;
            flex: 1;
        }
        
        .prereq small {
            color: rgba(212, 175, 55, 0.8);
            font-size: 0.85rem;
        }
        
        .modal-investimento {
            margin-bottom: 20px;
        }
        
        .modal-investimento h4 {
            color: var(--text-gold);
            margin: 0 0 15px 0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .opcoes-pontos {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin: 15px 0;
        }
        
        .opcao-pontos {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid var(--wood-light);
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s;
            text-align: center;
        }
        
        .opcao-pontos:hover {
            border-color: var(--primary-gold);
            background: rgba(44, 32, 8, 0.8);
        }
        
        .opcao-pontos.ativo {
            background: rgba(46, 92, 58, 0.3);
            border-color: var(--accent-green);
            transform: translateY(-2px);
        }
        
        .opcao-pontos .pontos {
            font-size: 1.2rem;
            font-weight: bold;
            color: var(--text-gold);
            margin-bottom: 5px;
        }
        
        .opcao-pontos .niveis {
            font-size: 1rem;
            color: rgba(245, 245, 220, 0.9);
            margin-bottom: 5px;
        }
        
        .opcao-pontos .nh {
            font-size: 0.9rem;
            color: rgba(212, 175, 55, 0.8);
        }
        
        .modal-resumo {
            background: rgba(44, 32, 8, 0.8);
            border-radius: 8px;
            padding: 20px;
            border: 1px solid var(--wood-light);
        }
        
        .modal-resumo h4 {
            color: var(--text-gold);
            margin: 0 0 15px 0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .resumo-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(212, 175, 55, 0.1);
        }
        
        .resumo-item.total {
            border-top: 2px solid var(--primary-gold);
            border-bottom: none;
            margin-top: 8px;
            padding-top: 12px;
            font-weight: bold;
        }
        
        .resumo-item span {
            color: rgba(212, 175, 55, 0.9);
        }
        
        .resumo-item strong {
            color: var(--text-light);
            font-size: 1.1rem;
        }
        
        .resumo-item.total strong {
            color: var(--primary-gold);
            font-size: 1.3rem;
        }
        
        .modal-alerta {
            background: rgba(139, 0, 0, 0.1);
            border: 1px solid var(--accent-red);
            border-radius: 8px;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .modal-alerta i {
            font-size: 2rem;
            color: var(--accent-red);
        }
        
        .modal-alerta div {
            flex: 1;
        }
        
        .modal-alerta div strong {
            color: var(--text-light);
            display: block;
            margin-bottom: 5px;
        }
        
        .modal-alerta div p {
            color: rgba(245, 245, 220, 0.8);
            margin: 0;
            font-size: 0.95rem;
        }
        
        .modal-rodape {
            background: rgba(44, 32, 8, 0.8);
            padding: 20px;
            border-top: 2px solid var(--wood-dark);
            display: flex;
            justify-content: flex-end;
            gap: 15px;
        }
        
        .btn-cancelar, .btn-confirmar {
            padding: 12px 24px;
            border-radius: 6px;
            border: none;
            font-family: 'Cinzel', serif;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s ease;
        }
        
        .btn-cancelar {
            background: rgba(139, 0, 0, 0.3);
            border: 2px solid var(--wood-light);
            color: var(--text-light);
        }
        
        .btn-cancelar:hover {
            background: rgba(139, 0, 0, 0.5);
            border-color: var(--accent-red);
        }
        
        .btn-confirmar {
            background: linear-gradient(145deg, var(--accent-green), #1e4028);
            color: white;
        }
        
        .btn-confirmar:hover {
            background: linear-gradient(145deg, #3a7c4a, #1e4028);
            transform: translateY(-2px);
        }
        
        /* RESPONSIVIDADE */
        @media (max-width: 768px) {
            .tecnica-info, .aprendida-detalhes {
                grid-template-columns: 1fr;
                gap: 8px;
            }
            
            .opcoes-pontos {
                grid-template-columns: 1fr;
            }
            
            .modal-tecnica {
                width: 95%;
                padding: 15px;
            }
            
            .modal-rodape {
                flex-direction: column;
            }
            
            .btn-cancelar, .btn-confirmar {
                width: 100%;
            }
        }
    `;
    
    if (!document.getElementById('tecnicas-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'tecnicas-styles';
        styleSheet.textContent = estilos;
        document.head.appendChild(styleSheet);
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

console.log('✅ Sistema de técnicas COMPLETO e FUNCIONAL carregado!');