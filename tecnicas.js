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

// ===== 4. BUSCA SIMPLIFICADA DE PERÍCIAS =====
function buscarPericiaParaTecnica(nomePericia) {
    // Tenta encontrar em múltiplos locais
    const locaisParaBuscar = [
        { nome: 'gurps_pericias', tipo: 'localStorage' },
        { nome: 'pericias_salvas', tipo: 'localStorage' },
        { nome: 'estadoPericias', tipo: 'window' }
    ];
    
    for (const local of locaisParaBuscar) {
        try {
            let pericias = [];
            
            if (local.tipo === 'localStorage') {
                const dados = localStorage.getItem(local.nome);
                if (dados) {
                    const parsed = JSON.parse(dados);
                    pericias = parsed.periciasAprendidas || parsed.pericias || parsed;
                }
            } else if (local.tipo === 'window' && window.estadoPericias) {
                pericias = window.estadoPericias.periciasAprendidas || [];
            }
            
            if (!Array.isArray(pericias)) continue;
            
            for (const pericia of pericias) {
                if (!pericia || !pericia.nome) continue;
                
                // Para Arco - aceita várias formas
                if (nomePericia === "Arco") {
                    const nomePericiaLower = pericia.nome.toLowerCase();
                    if (nomePericiaLower === "arco" || 
                        nomePericiaLower.includes("arco") || 
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
                
                // Para Cavalgar - aceita várias formas
                if (nomePericia === "Cavalgar") {
                    const nomePericiaLower = pericia.nome.toLowerCase();
                    if (nomePericiaLower.includes("cavalgar") || 
                        nomePericiaLower.includes("cavalo") ||
                        pericia.id.includes("cavalgar")) {
                        return {
                            tem: true,
                            nivel: pericia.nivel || pericia.valor || 1,
                            nome: pericia.nome
                        };
                    }
                }
            }
        } catch (e) {
            continue; // Tenta o próximo local
        }
    }
    
    // Não encontrada
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

// ===== 7. RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("Container de técnicas não encontrado");
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

// ===== 9. MODAL ORGANIZADO E ESTILIZADO =====
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
    
    // Calcula NH inicial
    const nhInicial = Math.min(nhArco + tecnica.modificadorBase + niveisIniciais, nhArco);
    
    const modalHTML = `
        <div class="modal-tecnica-conteudo">
            <div class="modal-cabecalho">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-fechar" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-corpo">
                <div class="modal-secao">
                    <h4><i class="fas fa-info-circle"></i> Descrição</h4>
                    <div class="modal-descricao">${tecnica.descricao}</div>
                </div>
                
                <div class="modal-secao">
                    <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                    <div class="prereq-lista">
                        <div class="prereq ${arco.tem && arco.nivel > 0 ? 'ok' : 'falta'}">
                            <div class="prereq-icon">
                                <i class="fas fa-${arco.tem && arco.nivel > 0 ? 'check-circle' : 'times-circle'}"></i>
                            </div>
                            <div class="prereq-info">
                                <div class="prereq-nome">${arco.nome}</div>
                                <div class="prereq-status">${arco.tem ? `NH ${arco.nivel}` : 'Não aprendida'}</div>
                            </div>
                        </div>
                        <div class="prereq ${cavalgar.tem ? 'ok' : 'falta'}">
                            <div class="prereq-icon">
                                <i class="fas fa-${cavalgar.tem ? 'check-circle' : 'times-circle'}"></i>
                            </div>
                            <div class="prereq-info">
                                <div class="prereq-nome">${cavalgar.nome}</div>
                                <div class="prereq-status">${cavalgar.tem ? `NH ${cavalgar.nivel}` : 'Não aprendida'}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                ${liberado ? `
                <div class="modal-secao">
                    <h4><i class="fas fa-chart-line"></i> Níveis de Investimento</h4>
                    <div class="opcoes-pontos-container">
                        ${CUSTOS_TECNICAS.map((opcao, index) => {
                            const nhBase = nhArco + tecnica.modificadorBase;
                            const nhFinal = Math.min(nhBase + opcao.niveis, nhArco);
                            const selecionado = jaAprendida ? jaAprendida.niveis === opcao.niveis : index === 0;
                            
                            return `
                            <div class="opcao-pontos-wrapper">
                                <button class="opcao-pontos ${selecionado ? 'ativo' : ''}" 
                                        onclick="selecionarOpcaoTecnica(${opcao.pontos}, ${opcao.niveis}, ${nhArco}, ${tecnica.modificadorBase})">
                                    <div class="opcao-header">
                                        <div class="opcao-pontos-num">${opcao.pontos} pts</div>
                                        <div class="opcao-niveis">+${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</div>
                                    </div>
                                    <div class="opcao-nh">NH: ${nhFinal}</div>
                                    <div class="opcao-selecionado">
                                        <i class="fas fa-check"></i>
                                    </div>
                                </button>
                            </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="modal-secao">
                    <h4><i class="fas fa-calculator"></i> Cálculo do NH</h4>
                    <div class="calculo-nh">
                        <div class="calculo-linha">
                            <span class="calculo-label">NH do Arco:</span>
                            <span class="calculo-valor">${nhArco}</span>
                        </div>
                        <div class="calculo-linha">
                            <span class="calculo-label">Penalidade base:</span>
                            <span class="calculo-valor">${tecnica.modificadorBase}</span>
                        </div>
                        <div class="calculo-linha">
                            <span class="calculo-label">Níveis investidos:</span>
                            <span class="calculo-valor" id="resumo-niveis">+${niveisIniciais}</span>
                        </div>
                        <div class="calculo-linha total">
                            <span class="calculo-label">NH Final:</span>
                            <span class="calculo-valor" id="resumo-nh">${nhInicial}</span>
                        </div>
                        <div class="calculo-linha">
                            <span class="calculo-label">Pontos gastos:</span>
                            <span class="calculo-valor" id="resumo-pontos">${pontosIniciais}</span>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta">
                    <div class="alerta-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="alerta-conteudo">
                        <h4>Pré-requisitos não cumpridos</h4>
                        <p>Para aprender ${tecnica.nome}, você precisa:</p>
                        <ul class="alerta-lista">
                            <li class="${arco.tem ? 'ok' : 'falta'}">
                                <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i>
                                Aprender Arco (atual: ${arco.tem ? `NH ${arco.nivel}` : 'Não aprendido'})
                            </li>
                            <li class="${cavalgar.tem ? 'ok' : 'falta'}">
                                <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
                                Aprender Cavalgar (atual: ${cavalgar.tem ? `NH ${cavalgar.nivel}` : 'Não aprendido'})
                            </li>
                        </ul>
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
                    <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar Técnica' : 'Adquirir Técnica'}
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
        overlay.style.opacity = '1';
    }
    
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
}

// CONTINUA NO PRÓXIMO COMENTÁRIO...
// ===== 10. SELEÇÃO DE OPÇÃO COM ESTILO =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    // Remove classe ativa de todos os botões
    document.querySelectorAll('.opcao-pontos').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
    // Adiciona classe ativa ao botão clicado
    const botaoClicado = event.target.closest('.opcao-pontos');
    if (botaoClicado) {
        botaoClicado.classList.add('ativo');
    }
    
    // Atualiza dados da técnica selecionada
    if (tecnicaModalSelecionada) {
        tecnicaModalSelecionada.pontos = pontos;
        tecnicaModalSelecionada.niveis = niveis;
        
        // Calcula NH final
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
}

// ===== 11. CONFIRMAR AQUISIÇÃO DA TÉCNICA =====
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
    
    // Calcula NH final para confirmar
    const arco = buscarPericiaParaTecnica("Arco");
    const nhArco = arco.nivel || 0;
    const nhFinal = Math.min(nhArco + tecnica.modificadorBase + niveis, nhArco);
    
    // Confirmação final
    const confirmacao = confirm(
        `Deseja ${tecnicaModalSelecionada.pontosIniciais ? 'atualizar' : 'adquirir'} ${tecnica.nome}?\n\n` +
        `Detalhes:\n` +
        `• Pontos gastos: ${pontos}\n` +
        `• Níveis: +${niveis}\n` +
        `• NH final: ${nhFinal}\n` +
        `• Base (Arco): NH ${nhArco}`
    );
    
    if (!confirmacao) return;
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos || 0;
        const diferencaPontos = pontos - pontosAntigos;
        pontosTecnicas += diferencaPontos;
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            dataAtualizacao: new Date().toISOString(),
            nhCalculado: nhFinal
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
            dataAquisicao: new Date().toISOString(),
            nhCalculado: nhFinal
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
    
    // Feedback visual
    setTimeout(() => {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-sucesso';
        feedback.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'} com sucesso!</span>
        `;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }, 100);
}

// ===== 12. FUNÇÕES AUXILIARES =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    const confirmacao = confirm(
        `Tem certeza que deseja remover ${tecnica.nome}?\n\n` +
        `Esta ação removerá ${tecnica.pontos || 0} pontos gastos nesta técnica.`
    );
    
    if (!confirmacao) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    // Remove pontos gastos
    pontosTecnicas -= tecnicasAprendidas[index].pontos || 0;
    
    // Remove da lista
    tecnicasAprendidas.splice(index, 1);
    
    // Salva alterações
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Atualiza interface
    renderizarTodasTecnicas();
    
    // Feedback
    setTimeout(() => {
        alert(`${tecnica.nome} removida com sucesso!`);
    }, 100);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
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

// ===== 14. RENDERIZAR TUDO =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 15. INICIALIZAÇÃO COMPLETA =====
function inicializarSistemaTecnicas() {
    console.log('🔧 Inicializando sistema de técnicas...');
    
    // Carrega dados salvos
    try {
        const dadosTecnicas = localStorage.getItem('tecnicas_aprendidas');
        if (dadosTecnicas) {
            tecnicasAprendidas = JSON.parse(dadosTecnicas);
            console.log(`📊 ${tecnicasAprendidas.length} técnicas carregadas`);
        }
        
        const dadosPontos = localStorage.getItem('pontos_tecnicas');
        if (dadosPontos) {
            pontosTecnicas = parseInt(dadosPontos);
            console.log(`💰 ${pontosTecnicas} pontos em técnicas`);
        }
    } catch (e) {
        console.log('📁 Nenhum dado de técnicas encontrado');
    }
    
    // Configura botões
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.onclick = function() {
            renderizarTodasTecnicas();
            const btn = this;
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Atualizando...';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
                
                // Feedback
                const feedback = document.createElement('div');
                feedback.textContent = 'Técnicas atualizadas!';
                feedback.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: #2196F3;
                    color: white;
                    padding: 10px 15px;
                    border-radius: 4px;
                    font-size: 14px;
                    z-index: 1000;
                    animation: fadeInOut 2s ease;
                `;
                document.body.appendChild(feedback);
                setTimeout(() => feedback.remove(), 2000);
            }, 500);
        };
    }
    
    // Configura modal overlay
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.onclick = function(e) {
            if (e.target === overlay) {
                fecharModalTecnica();
            }
        };
        
        // Fecha com ESC
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && overlay.style.display === 'flex') {
                fecharModalTecnica();
            }
        });
    }
    
    // Adiciona estilos CSS dinamicamente
    adicionarEstilosTecnicas();
    
    // Renderiza pela primeira vez
    renderizarTodasTecnicas();
    
    console.log('✅ Sistema de técnicas inicializado!');
}

// ===== 16. ADICIONAR ESTILOS CSS =====
function adicionarEstilosTecnicas() {
    const estilos = `
        /* ANIMAÇÕES */
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeInOut {
            0%, 100% { opacity: 0; transform: translateY(10px); }
            10%, 90% { opacity: 1; transform: translateY(0); }
        }
        
        /* MODAL TÉCNICAS */
        .modal-tecnica-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 9998;
            transition: opacity 0.3s ease;
        }
        
        .modal-tecnica-conteudo {
            background: #2d3748;
            color: white;
            border-radius: 10px;
            width: 90%;
            max-width: 600px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: modalFadeIn 0.3s ease;
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        
        .modal-cabecalho {
            background: #1a202c;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #4a5568;
        }
        
        .modal-cabecalho h3 {
            margin: 0;
            color: #fff;
            font-size: 1.4rem;
        }
        
        .modal-cabecalho h3 i {
            margin-right: 10px;
            color: #68d391;
        }
        
        .modal-fechar {
            background: #4a5568;
            color: white;
            border: none;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        
        .modal-fechar:hover {
            background: #718096;
        }
        
        .modal-corpo {
            padding: 20px;
        }
        
        .modal-secao {
            margin-bottom: 25px;
            background: #374151;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #68d391;
        }
        
        .modal-secao h4 {
            margin-top: 0;
            margin-bottom: 15px;
            color: #e2e8f0;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
        }
        
        .modal-secao h4 i {
            margin-right: 8px;
            color: #68d391;
        }
        
        .modal-descricao {
            color: #cbd5e0;
            line-height: 1.6;
            font-size: 0.95rem;
        }
        
        /* PRÉ-REQUISITOS */
        .prereq-lista {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .prereq {
            display: flex;
            align-items: center;
            padding: 12px;
            border-radius: 6px;
            background: #4a5568;
            transition: transform 0.2s;
        }
        
        .prereq:hover {
            transform: translateX(5px);
        }
        
        .prereq.ok {
            background: #2d5433;
            border-left: 4px solid #48bb78;
        }
        
        .prereq.falta {
            background: #553333;
            border-left: 4px solid #f56565;
        }
        
        .prereq-icon {
            margin-right: 15px;
            font-size: 1.3rem;
        }
        
        .prereq.ok .prereq-icon {
            color: #48bb78;
        }
        
        .prereq.falta .prereq-icon {
            color: #f56565;
        }
        
        .prereq-info {
            flex: 1;
        }
        
        .prereq-nome {
            font-weight: bold;
            color: white;
            margin-bottom: 4px;
        }
        
        .prereq-status {
            font-size: 0.9rem;
            color: #cbd5e0;
        }
        
        /* OPÇÕES DE PONTOS */
        .opcoes-pontos-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        
        .opcao-pontos-wrapper {
            perspective: 1000px;
        }
        
        .opcao-pontos {
            background: #4a5568;
            border: 2px solid #718096;
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s;
            position: relative;
            color: white;
            width: 100%;
            min-height: 100px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        
        .opcao-pontos:hover {
            background: #5a6578;
            border-color: #68d391;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(104, 211, 145, 0.2);
        }
        
        .opcao-pontos.ativo {
            background: #2d5433;
            border-color: #68d391;
            box-shadow: 0 0 0 2px rgba(104, 211, 145, 0.3);
        }
        
        .opcao-pontos.ativo .opcao-selecionado {
            display: block;
        }
        
        .opcao-header {
            margin-bottom: 10px;
        }
        
        .opcao-pontos-num {
            font-size: 1.4rem;
            font-weight: bold;
            color: #68d391;
            margin-bottom: 5px;
        }
        
        .opcao-niveis {
            font-size: 1rem;
            color: #e2e8f0;
            font-weight: 500;
        }
        
        .opcao-nh {
            font-size: 1rem;
            color: #cbd5e0;
            background: rgba(0, 0, 0, 0.2);
            padding: 4px 10px;
            border-radius: 4px;
            margin-top: 5px;
        }
        
        .opcao-selecionado {
            position: absolute;
            top: -10px;
            right: -10px;
            background: #68d391;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }
        
        /* CÁLCULO DO NH */
        .calculo-nh {
            background: #4a5568;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #4299e1;
        }
        
        .calculo-linha {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #718096;
        }
        
        .calculo-linha:last-child {
            border-bottom: none;
        }
        
        .calculo-linha.total {
            border-top: 2px solid #68d391;
            border-bottom: none;
            margin-top: 8px;
            padding-top: 12px;
            font-weight: bold;
        }
        
        .calculo-label {
            color: #cbd5e0;
        }
        
        .calculo-valor {
            color: white;
            font-weight: 500;
        }
        
        .calculo-linha.total .calculo-valor {
            color: #68d391;
            font-size: 1.2rem;
        }
        
        /* ALERTA */
        .modal-alerta {
            background: #553333;
            border-left: 4px solid #f56565;
            padding: 20px;
            border-radius: 8px;
            display: flex;
            align-items: flex-start;
        }
        
        .alerta-icon {
            margin-right: 15px;
            font-size: 1.5rem;
            color: #f56565;
        }
        
        .alerta-conteudo h4 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #fed7d7;
        }
        
        .alerta-conteudo p {
            margin-bottom: 10px;
            color: #e2e8f0;
        }
        
        .alerta-lista {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .alerta-lista li {
            padding: 6px 0;
            display: flex;
            align-items: center;
            color: white;
        }
        
        .alerta-lista li i {
            margin-right: 8px;
        }
        
        .alerta-lista li.ok {
            color: #9ae6b4;
        }
        
        .alerta-lista li.falta {
            color: #fc8181;
        }
        
        /* RODAPÉ DO MODAL */
        .modal-rodape {
            padding: 20px;
            background: #1a202c;
            border-radius: 0 0 10px 10px;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            border-top: 2px solid #4a5568;
        }
        
        .btn-cancelar, .btn-confirmar {
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-size: 0.95rem;
            transition: all 0.2s;
        }
        
        .btn-cancelar {
            background: #4a5568;
            color: #e2e8f0;
        }
        
        .btn-cancelar:hover {
            background: #718096;
            color: white;
        }
        
        .btn-confirmar {
            background: #2d5433;
            color: white;
        }
        
        .btn-confirmar:hover {
            background: #38a169;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(56, 161, 105, 0.3);
        }
        
        /* RESPONSIVIDADE */
        @media (max-width: 768px) {
            .opcoes-pontos-container {
                grid-template-columns: 1fr;
            }
            
            .modal-corpo {
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
    
    // Adiciona estilos se não existirem
    if (!document.getElementById('tecnicas-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'tecnicas-styles';
        styleSheet.textContent = estilos;
        document.head.appendChild(styleSheet);
    }
}

// ===== 17. FUNÇÃO DE DIAGNÓSTICO =====
function diagnosticoTecnicas() {
    console.log('🔍 DIAGNÓSTICO DO SISTEMA DE TÉCNICAS');
    console.log('====================================');
    
    // Verifica pré-requisitos
    const prereq = verificarPrereqTecnica(CATALOGO_TECNICAS[0]);
    console.log('Pré-requisitos:', prereq);
    
    // Verifica dados salvos
    console.log('Técnicas aprendidas:', tecnicasAprendidas);
    console.log('Pontos em técnicas:', pontosTecnicas);
    
    // Verifica localStorage
    console.log('LocalStorage gurps_pericias:', localStorage.getItem('gurps_pericias'));
    
    // Sugestões
    if (!prereq.arco.tem) {
        console.log('❌ PROBLEMA: Arco não encontrado');
        console.log('✅ SOLUÇÃO: Aprenda a perícia "Arco" primeiro no sistema de perícias');
    }
    
    if (!prereq.cavalgar.tem) {
        console.log('❌ PROBLEMA: Cavalgar não encontrado');
        console.log('✅ SOLUÇÃO: Aprenda "Cavalgar (Cavalo)" ou outra especialização');
    }
    
    if (prereq.todosCumpridos) {
        console.log('✅ TUDO OK: Pré-requisitos cumpridos! A técnica deve estar disponível.');
    }
}

// ===== 18. EXPORTAÇÃO DE FUNÇÕES =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.diagnosticoTecnicas = diagnosticoTecnicas;

// ===== 19. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(() => {
                    inicializarSistemaTecnicas();
                }, 100);
            }
        });
    });
    
    // Verifica se já está na aba de técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(() => {
            inicializarSistemaTecnicas();
        }, 100);
    }
    
    // Botão de diagnóstico (para desenvolvimento)
    const btnDiagnostico = document.getElementById('btn-diagnostico-tecnicas');
    if (btnDiagnostico) {
        btnDiagnostico.addEventListener('click', diagnosticoTecnicas);
    }
});

console.log('🎯 Sistema de técnicas carregado e pronto!');