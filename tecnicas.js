// ============================================
// TECNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
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

// TABELA DE CUSTOS
const CUSTOS_TECNICAS = [
    { niveis: 1, pontos: 2 },
    { niveis: 2, pontos: 3 },
    { niveis: 3, pontos: 4 },
    { niveis: 4, pontos: 5 }
];

// ESTADO
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');
let tecnicaSelecionada = null;

// ============================================
// FUNÇÕES PRINCIPAIS - CORRIGIDAS
// ============================================

// FUNÇÃO VERIFICAR PERÍCIA - VERSÃO QUE FUNCIONA
function verificarPericia(nomePericia) {
    try {
        // Busca DIRETAMENTE no localStorage
        const dados = localStorage.getItem('gurps_pericias');
        if (!dados) {
            console.log("❌ Não encontrou 'gurps_pericias'");
            return { tem: false, nivel: 0 };
        }
        
        const parsed = JSON.parse(dados);
        const periciasAprendidas = parsed.periciasAprendidas || [];
        
        // PARA ARCO
        if (nomePericia === "Arco") {
            const arcoEncontrado = periciasAprendidas.find(p => {
                if (!p) return false;
                // Procura por ID "arco" ou nome "Arco"
                return (p.id === "arco") || (p.nome === "Arco");
            });
            
            if (arcoEncontrado) {
                // Pega o NH do campo correto
                const nivel = arcoEncontrado.nivel || arcoEncontrado.valor || 10;
                return { tem: true, nivel: nivel };
            }
        }
        
        // PARA CAVALGAR - QUALQUER especialização serve
        if (nomePericia.includes("Cavalgar")) {
            const cavalgarEncontrado = periciasAprendidas.find(p => {
                if (!p || !p.id) return false;
                // Aceita qualquer cavalgar (cavalgar-cavalo, cavalgar-mula, etc.)
                return p.id.includes("cavalgar");
            });
            
            if (cavalgarEncontrado) {
                const nivel = cavalgarEncontrado.nivel || cavalgarEncontrado.valor || 10;
                return { tem: true, nivel: nivel };
            }
        }
        
    } catch (e) {
        console.error("Erro ao verificar perícia:", e);
    }
    
    return { tem: false, nivel: 0 };
}

// VERIFICAR PRÉ-REQUISITOS
function verificarPreRequisitos(tecnica) {
    let todosCumpridos = true;
    const resultados = [];
    
    tecnica.prereq.forEach(req => {
        // Para "Cavalgar (Cavalo)", busca qualquer Cavalgar
        const nomeBusca = req.includes("Cavalgar") ? "Cavalgar" : req;
        const resultado = verificarPericia(nomeBusca);
        
        resultados.push({
            pericia: req,
            tem: resultado.tem,
            nivel: resultado.nivel
        });
        
        if (!resultado.tem) todosCumpridos = false;
    });
    
    return { todosCumpridos, resultados };
}

// CALCULAR NH DA TÉCNICA
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0 };
    
    const arco = verificarPericia("Arco");
    
    if (!arco.tem || arco.nivel <= 0) {
        return { nh: 0, nhBase: 0, bonusNiveis: 0 };
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

// ============================================
// FUNÇÕES DE RENDERIZAÇÃO
// ============================================

// RENDERIZAR CATÁLOGO
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereqStatus = verificarPreRequisitos(tecnica);
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
        } else if (!prereqStatus.todosCumpridos) {
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
                        <span class="valor">${tecnica.periciaBase} ${prereqStatus.resultados[0]?.tem ? `(NH ${prereqStatus.resultados[0].nivel})` : ''}</span>
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
                    ${prereqStatus.resultados.map(resultado => `
                        <div class="prereq-item ${resultado.tem ? 'ok' : 'falta'}">
                            <i class="fas fa-${resultado.tem ? 'check' : 'times'}"></i>
                            ${resultado.pericia} ${resultado.tem ? `(NH ${resultado.nivel})` : ''}
                        </div>
                    `).join('')}
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

// RENDERIZAR TÉCNICAS APRENDIDAS
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

// ============================================
// MODAL DA TÉCNICA
// ============================================

// ABRIR MODAL
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const tecnicaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereqStatus = verificarPreRequisitos(tecnica);
    
    const arco = verificarPericia("Arco");
    const cavalgar = verificarPericia("Cavalgar");
    
    const nhArco = arco.nivel || 0;
    const niveisIniciais = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
    const pontosIniciais = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
    const liberado = prereqStatus.todosCumpridos && nhArco > 0;
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
                                    const selecionado = tecnicaAprendida ? tecnicaAprendida.niveis === opcao.niveis : index === 0;
                                    
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
                            <i class="fas fa-check"></i> ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
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

// SELEÇÃO DE OPÇÃO NO MODAL
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

// CONFIRMAR TÉCNICA
function confirmarTecnicaModal(id) {
    if (!tecnicaSelecionada) {
        alert('Por favor, selecione uma opção de níveis primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaSelecionada;
    
    // Verifica pré-requisitos
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
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
    setTimeout(() => {
        renderizarTodasTecnicas();
        alert(`${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'} com sucesso!`);
    }, 50);
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Tem certeza que deseja remover ${tecnica.nome}?`)) return;
    
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
    if (overlay) overlay.remove();
    tecnicaSelecionada = null;
}

// ============================================
// FUNÇÕES DE INICIALIZAÇÃO
// ============================================

function carregarTecnicas() {
    try {
        const dadosTecnicas = localStorage.getItem('tecnicas_aprendidas');
        if (dadosTecnicas) tecnicasAprendidas = JSON.parse(dadosTecnicas);
        
        const dadosPontos = localStorage.getItem('pontos_tecnicas');
        if (dadosPontos) pontosTecnicas = parseInt(dadosPontos);
    } catch (e) {
        console.log('Nenhuma técnica salva anteriormente');
    }
}

function salvarTecnicas() {
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
}

function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
}

// INICIALIZAR
function inicializarTecnicas() {
    console.log('🎯 Inicializando sistema de técnicas...');
    
    carregarTecnicas();
    
    // Botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            renderizarTodasTecnicas();
            alert('Técnicas atualizadas!');
        });
    }
    
    // Renderiza pela primeira vez
    renderizarTodasTecnicas();
}

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================

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

// ============================================
// EXPORTAR FUNÇÕES PARA USO GLOBAL
// ============================================

window.verificarPericia = verificarPericia;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarTecnicas = inicializarTecnicas;

console.log('✅ Sistema de técnicas COMPLETO carregado!');