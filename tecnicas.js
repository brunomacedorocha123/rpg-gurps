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
    { niveis: 1, pontos: 2, texto: "2 pontos (+1 nível)" },
    { niveis: 2, pontos: 3, texto: "3 pontos (+2 níveis)" },
    { niveis: 3, pontos: 4, texto: "4 pontos (+3 níveis)" },
    { niveis: 4, pontos: 5, texto: "5 pontos (+4 níveis)" }
];

// ===== 3. ESTADO DO SISTEMA =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');
let tecnicaModalSelecionada = null;

// ===== 4. BUSCA SIMPLES DE PERÍCIAS =====
function buscarPericiaParaTecnica(nomePericia) {
    console.log(`Buscando: ${nomePericia}`);
    
    // Tenta encontrar no localStorage primeiro
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            const pericias = parsed.periciasAprendidas || parsed.pericias || parsed;
            
            if (Array.isArray(pericias)) {
                for (const pericia of pericias) {
                    if (!pericia || !pericia.nome) continue;
                    
                    // Para Arco
                    if (nomePericia === "Arco") {
                        const nomeLower = pericia.nome.toLowerCase();
                        if (nomeLower.includes("arco") || 
                            pericia.id === "arco" ||
                            pericia.id === "arco-longa" ||
                            pericia.id === "arco-curto") {
                            console.log(`Arco encontrado: ${pericia.nome} (NH: ${pericia.nivel || 1})`);
                            return {
                                tem: true,
                                nivel: pericia.nivel || pericia.valor || 1,
                                nome: pericia.nome
                            };
                        }
                    }
                    
                    // Para Cavalgar
                    if (nomePericia === "Cavalgar") {
                        const nomeLower = pericia.nome.toLowerCase();
                        if (nomeLower.includes("cavalgar") || 
                            nomeLower.includes("cavalo") ||
                            pericia.id.includes("cavalgar")) {
                            console.log(`Cavalgar encontrado: ${pericia.nome} (NH: ${pericia.nivel || 1})`);
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
        console.log("Erro ao buscar perícias:", e);
    }
    
    // Não encontrada
    console.log(`${nomePericia} NÃO encontrada`);
    return { 
        tem: false, 
        nivel: 0, 
        nome: nomePericia 
    };
}

// ===== 5. VERIFICAÇÃO DE PRÉ-REQUISITOS =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    console.log("Verificação de pré-requisitos:");
    console.log("Arco:", arco);
    console.log("Cavalgar:", cavalgar);
    
    // Precisa ter ambas as perícias
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

// ===== 7. RENDERIZAR CATÁLOGO DE TÉCNICAS =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("Container #lista-tecnicas não encontrado!");
        return;
    }
    
    console.log("Renderizando catálogo de técnicas...");
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
        // Determinar status
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
            <div class="tecnica-item">
                <div class="tecnica-header">
                    <div class="tecnica-nome-container">
                        <div class="tecnica-nome">
                            <i class="${tecnica.icone}"></i>
                            ${tecnica.nome}
                        </div>
                        <div class="tecnica-tags">
                            <span class="tecnica-dificuldade ${tecnica.dificuldade}">
                                ${tecnica.dificuldade}
                            </span>
                            <span class="tecnica-tipo">Técnica</span>
                        </div>
                    </div>
                    <div class="tecnica-status">
                        <span class="tecnica-status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </div>
                </div>
                
                <div class="tecnica-descricao">
                    ${tecnica.descricao}
                </div>
                
                <div class="tecnica-info-rapida">
                    <div class="info-item">
                        <i class="fas fa-crosshairs"></i>
                        <span>Base: ${tecnica.periciaBase}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-chart-line"></i>
                        <span>Penalidade: ${tecnica.modificadorBase}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>NH: ${nhCalculo.nh > 0 ? nhCalculo.nh : '--'}</span>
                    </div>
                </div>
                
                <div class="tecnica-prereq">
                    <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                    <span>
                        ${prereq.arco.tem ? '✅' : '❌'} ${prereq.arco.nome} 
                        ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}
                    </span><br>
                    <span>
                        ${prereq.cavalgar.tem ? '✅' : '❌'} ${prereq.cavalgar.nome} 
                        ${prereq.cavalgar.tem ? `(NH ${prereq.cavalgar.nivel})` : ''}
                    </span>
                </div>
                
                <div class="tecnica-actions">
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
        
        const cardHTML = `
            <div class="tecnica-aprendida-item">
                <div class="tecnica-aprendida-header">
                    <div class="tecnica-aprendida-nome">
                        <i class="${base.icone}"></i>
                        ${base.nome}
                    </div>
                    <div class="tecnica-aprendida-nh">
                        <span class="nh-valor">NH: ${nh.nh}</span>
                    </div>
                </div>
                
                <div class="tecnica-aprendida-info">
                    <div class="info-row">
                        <span>Pontos</span>
                        <strong>${tecnica.pontos || 0} pts</strong>
                    </div>
                    <div class="info-row">
                        <span>Níveis</span>
                        <strong>+${tecnica.niveis || 0}</strong>
                    </div>
                    <div class="info-row">
                        <span>Base (Arco)</span>
                        <strong>NH ${nh.nhBase}</strong>
                    </div>
                </div>
                
                <div class="tecnica-aprendida-actions">
                    <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnica.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnica.id}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML += cardHTML;
    });
}

// ===== 9. CRIAR MODAL DE TÉCNICA =====
function criarModalTecnica() {
    // Remove modal existente se houver
    const modalExistente = document.getElementById('modal-tecnica-overlay');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Cria o overlay do modal
    const overlay = document.createElement('div');
    overlay.id = 'modal-tecnica-overlay';
    overlay.className = 'modal-tecnica-overlay';
    overlay.style.display = 'none';
    
    // Cria o conteúdo do modal
    overlay.innerHTML = `
        <div class="modal-tecnica">
            <div class="modal-tecnica-content" id="modal-tecnica-content">
                <!-- Conteúdo será injetado aqui -->
            </div>
        </div>
    `;
    
    // Adiciona ao body
    document.body.appendChild(overlay);
    
    // Configura fechamento ao clicar fora
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            fecharModalTecnica();
        }
    });
    
    return overlay;
}

// ===== 10. ABRIR MODAL DE TÉCNICA =====
function abrirModalTecnica(id) {
    console.log(`Abrindo modal para técnica: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error(`Técnica ${id} não encontrada!`);
        return;
    }
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    const nhArco = arco.nivel || 0;
    
    // Valores iniciais
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 0;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 0;
    
    // Verifica se está liberado
    const liberado = prereq.todosCumpridos && nhArco > 0;
    
    // Calcula NH inicial
    const nhInicial = Math.max(0, nhArco + tecnica.modificadorBase + niveisIniciais);
    
    // Cria ou obtém o modal
    let overlay = document.getElementById('modal-tecnica-overlay');
    if (!overlay) {
        overlay = criarModalTecnica();
    }
    
    // HTML do modal
    const modalHTML = `
        <div class="modal-tecnica-header">
            <h3>
                <i class="${tecnica.icone}"></i>
                ${tecnica.nome}
            </h3>
            <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
        </div>
        
        <div class="modal-tecnica-body">
            <div class="tecnica-modal-info">
                <div class="info-row">
                    <span><strong>Dificuldade:</strong> ${tecnica.dificuldade}</span>
                    <span><strong>Atributo:</strong> ${tecnica.atributo}</span>
                </div>
                <div class="info-row">
                    <span><strong>Base:</strong> ${tecnica.periciaBase}</span>
                    <span><strong>Penalidade:</strong> ${tecnica.modificadorBase}</span>
                </div>
            </div>
            
            <div class="tecnica-modal-descricao">
                <p>${tecnica.descricao}</p>
            </div>
            
            <div class="tecnica-modal-prereq">
                <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                
                <div class="prereq-item ${arco.tem ? 'cumprido' : 'nao-cumprido'}">
                    <i class="fas fa-${arco.tem ? 'check-circle' : 'times-circle'}"></i>
                    <span>Arco</span>
                    <small>${arco.tem ? `NH ${arco.nivel}` : 'Não aprendida'}</small>
                </div>
                
                <div class="prereq-item ${cavalgar.tem ? 'cumprido' : 'nao-cumprido'}">
                    <i class="fas fa-${cavalgar.tem ? 'check-circle' : 'times-circle'}"></i>
                    <span>Cavalgar (qualquer)</span>
                    <small>${cavalgar.tem ? `NH ${cavalgar.nivel}` : 'Não aprendida'}</small>
                </div>
            </div>
            
            ${liberado ? `
            <div class="tecnica-modal-pontos">
                <h4><i class="fas fa-coins"></i> Escolha os Níveis</h4>
                
                <p class="instrucao">
                    Selecione quantos níveis deseja investir na técnica. 
                    Cada nível reduz a penalidade em 1 ponto.
                </p>
                
                <div class="pontos-opcoes" id="pontos-opcoes">
                    ${CUSTOS_TECNICAS.map((opcao, index) => {
                        const nhBase = nhArco + tecnica.modificadorBase;
                        const nhFinal = Math.max(0, Math.min(nhBase + opcao.niveis, nhArco));
                        const selecionado = jaAprendida ? jaAprendida.niveis === opcao.niveis : index === 0;
                        
                        return `
                        <div class="opcao-pontos ${selecionado ? 'selecionado' : ''}" 
                             onclick="selecionarOpcaoTecnica('${tecnica.id}', ${opcao.pontos}, ${opcao.niveis})"
                             data-pontos="${opcao.pontos}"
                             data-niveis="${opcao.niveis}">
                            <div class="pontos-valor">${opcao.pontos} pontos</div>
                            <div class="nivel-valor">+${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</div>
                            <div class="nh-resultado">NH: ${nhFinal}</div>
                        </div>
                        `;
                    }).join('')}
                </div>
                
                <div class="tecnica-modal-resumo">
                    <h4><i class="fas fa-calculator"></i> Cálculo</h4>
                    
                    <div class="resumo-item">
                        <span>NH do Arco:</span>
                        <strong id="resumo-arco">${nhArco}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Penalidade base:</span>
                        <strong id="resumo-penalidade">${tecnica.modificadorBase}</span>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis (+):</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH final:</span>
                        <strong id="resumo-nh-final" style="color: var(--primary-gold); font-size: 1.3rem;">
                            ${nhInicial}
                        </strong>
                    </div>
                </div>
            </div>
            ` : `
            <div class="prereq-alerta">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Pré-requisitos não cumpridos</strong>
                    <p>Você precisa aprender Arco (com pelo menos 1 ponto) e Cavalgar (qualquer especialização).</p>
                </div>
            </div>
            `}
        </div>
        
        <div class="modal-tecnica-footer">
            <div class="modal-custo-total">
                <span class="label">Custo total:</span>
                <span class="valor" id="custo-total">${pontosIniciais} pts</span>
            </div>
            
            <div class="modal-actions">
                <button class="btn-modal-cancelar" onclick="fecharModalTecnica()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                
                ${liberado ? `
                <button class="btn-modal-confirmar" onclick="confirmarTecnicaModal('${tecnica.id}')" id="btn-confirmar-tecnica">
                    <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar' : 'Adquirir'}
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Injeta o conteúdo no modal
    const modalContent = document.getElementById('modal-tecnica-content');
    if (modalContent) {
        modalContent.innerHTML = modalHTML;
    }
    
    // Mostra o modal
    overlay.style.display = 'flex';
    
    // Armazena dados da técnica selecionada
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase,
        tecnica: tecnica
    };
    
    // Seleciona a primeira opção por padrão se não estiver aprendida
    if (!jaAprendida && liberado) {
        selecionarOpcaoTecnica(id, CUSTOS_TECNICAS[0].pontos, CUSTOS_TECNICAS[0].niveis);
    }
}

// ===== 11. SELECIONAR OPÇÃO DE NÍVEIS =====
function selecionarOpcaoTecnica(tecnicaId, pontos, niveis) {
    console.log(`Selecionando: ${pontos} pontos, ${niveis} níveis`);
    
    // Atualiza seleção visual
    const opcoes = document.querySelectorAll('.opcao-pontos');
    opcoes.forEach(opcao => {
        const opcaoPontos = parseInt(opcao.dataset.pontos);
        const opcaoNiveis = parseInt(opcao.dataset.niveis);
        
        if (opcaoPontos === pontos && opcaoNiveis === niveis) {
            opcao.classList.add('selecionado');
        } else {
            opcao.classList.remove('selecionado');
        }
    });
    
    // Atualiza dados da técnica selecionada
    if (tecnicaModalSelecionada) {
        tecnicaModalSelecionada.pontos = pontos;
        tecnicaModalSelecionada.niveis = niveis;
        
        // Calcula NH final
        const nhBase = tecnicaModalSelecionada.nhArco + tecnicaModalSelecionada.modificador;
        const nhFinal = Math.max(0, Math.min(nhBase + niveis, tecnicaModalSelecionada.nhArco));
        
        // Atualiza resumo
        const resumoNiveis = document.getElementById('resumo-niveis');
        const resumoNhFinal = document.getElementById('resumo-nh-final');
        const custoTotal = document.getElementById('custo-total');
        
        if (resumoNiveis) resumoNiveis.textContent = `+${niveis}`;
        if (resumoNhFinal) resumoNhFinal.textContent = nhFinal;
        if (custoTotal) custoTotal.textContent = `${pontos} pts`;
        
        console.log(`NH final calculado: ${nhFinal}`);
    }
}

// ===== 12. CONFIRMAR AQUISIÇÃO =====
function confirmarTecnicaModal(id) {
    if (!tecnicaModalSelecionada) {
        alert('Por favor, selecione uma opção de níveis primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    
    // Verifica pré-requisitos novamente
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('Pré-requisitos não cumpridos! Você precisa aprender Arco e Cavalgar primeiro.');
        return;
    }
    
    // Confirmação
    const acao = tecnicasAprendidas.find(t => t.id === id) ? 'atualizar' : 'adquirir';
    const confirmMsg = acao === 'adquirir' 
        ? `Deseja adquirir "${tecnica.nome}" por ${pontos} pontos?`
        : `Deseja atualizar "${tecnica.nome}" para ${pontos} pontos?`;
    
    if (!confirm(confirmMsg)) return;
    
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
    
    // Atualiza a interface
    renderizarTodasTecnicas();
    
    // Feedback
    mostrarNotificacao(`${tecnica.nome} ${acao === 'adquirir' ? 'adquirida' : 'atualizada'} com sucesso!`, 'success');
}

// ===== 13. MOSTRAR NOTIFICAÇÃO =====
function mostrarNotificacao(mensagem, tipo = 'success') {
    // Remove notificações anteriores
    const notificacoesAntigas = document.querySelectorAll('.notificacao-tecnica');
    notificacoesAntigas.forEach(n => n.remove());
    
    // Cria nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-tecnica ${tipo}`;
    
    let icone = 'fa-check-circle';
    if (tipo === 'error') icone = 'fa-times-circle';
    if (tipo === 'warning') icone = 'fa-exclamation-circle';
    
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <i class="fas ${icone}"></i>
            <span>${mensagem}</span>
        </div>
        <button class="notificacao-fechar" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notificacao);
    
    // Mostra com animação
    setTimeout(() => notificacao.classList.add('show'), 10);
    
    // Remove automaticamente após 3 segundos
    setTimeout(() => {
        if (notificacao.parentElement) {
            notificacao.classList.remove('show');
            setTimeout(() => notificacao.remove(), 300);
        }
    }, 3000);
}

// ===== 14. FUNÇÕES AUXILIARES =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Remover "${tecnica.nome}"? Esta ação não pode ser desfeita.`)) {
        return;
    }
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    // Remove pontos
    pontosTecnicas -= tecnicasAprendidas[index].pontos || 0;
    
    // Remove da lista
    tecnicasAprendidas.splice(index, 1);
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Atualiza interface
    renderizarTodasTecnicas();
    
    // Feedback
    mostrarNotificacao(`${tecnica.nome} removida com sucesso!`, 'warning');
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
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

// ===== 16. RENDERIZAR TUDO =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 17. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log('Inicializando sistema de técnicas...');
    
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
        console.log('Nenhum dado de técnicas encontrado');
    }
    
    // Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.onclick = renderizarTodasTecnicas;
    }
    
    // Adiciona estilos CSS específicos para técnicas
    adicionarEstilosTecnicas();
    
    // Renderiza
    renderizarTodasTecnicas();
}

// ===== 18. ADICIONAR ESTILOS CSS =====
function adicionarEstilosTecnicas() {
    if (document.getElementById('tecnicas-styles')) return;
    
    const styles = `
        /* ESTILOS ESPECÍFICOS PARA TÉCNICAS */
        .tecnica-dificuldade.Difícil {
            background: var(--accent-red);
            color: white;
        }
        
        .tecnica-dificuldade.Média {
            background: var(--primary-gold);
            color: #333;
        }
        
        .tecnica-dificuldade.Fácil {
            background: var(--accent-green);
            color: white;
        }
        
        .opcao-pontos.selecionado {
            background: rgba(46, 92, 58, 0.3);
            border-color: var(--accent-green);
        }
        
        /* NOTIFICAÇÕES */
        .notificacao-tecnica {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, rgba(26, 18, 0, 0.95), rgba(44, 32, 8, 0.95));
            border: 2px solid var(--primary-gold);
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            z-index: 1001;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            min-width: 300px;
            max-width: 400px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .notificacao-tecnica.show {
            transform: translateX(0);
        }
        
        .notificacao-tecnica.success {
            border-color: var(--accent-green);
        }
        
        .notificacao-tecnica.error {
            border-color: var(--accent-red);
        }
        
        .notificacao-tecnica.warning {
            border-color: var(--primary-gold);
        }
    `;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'tecnicas-styles';
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
}

// ===== 19. EXPORTAR FUNÇÕES =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

// ===== 20. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarSistemaTecnicas, 100);
            }
        });
    });
    
    // Verifica se já está na aba de técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarSistemaTecnicas, 100);
    }
});

console.log('✅ Sistema de técnicas carregado!');