// ============================================
// TECNICAS.JS - SISTEMA COMPLETO
// ============================================

console.log("⚙️ SISTEMA DE TÉCNICAS INICIANDO");

// ===== 1. CONFIGURAÇÃO INICIAL =====
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
            { tipo: "pericia", nome: "Arco", nivelMinimo: 1 },
            { tipo: "pericia", nome: "Cavalgar", nivelMinimo: 1 }
        ],
        custoTabela: { 2: 1, 3: 2, 4: 3, 5: 4 }
    }
];

// ===== 2. ESTADO DO SISTEMA =====
let estadoTecnicas = {
    aprendidas: [],
    pontosTotais: 0
};

// ===== 3. CARREGAMENTO INICIAL =====
function carregarEstadoInicial() {
    console.log("📥 Carregando estado inicial...");
    
    // Tenta carregar do localStorage
    try {
        const salvo = localStorage.getItem('tecnicas_aprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
        }
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) {
            estadoTecnicas.pontosTotais = parseInt(pontos);
        }
    } catch (error) {
        console.error("❌ Erro ao carregar técnicas:", error);
    }
}

// ===== 4. FUNÇÃO CHAVE: VERIFICAR PERÍCIAS =====
function verificarSeTemPericia(nomePericia) {
    console.log(`🔍 Verificando se tem: "${nomePericia}"`);
    
    // Verifica se o sistema de perícias está carregado
    if (!window.estadoPericias) {
        console.warn("⚠️ Sistema de perícias não carregado");
        return { tem: false, nivel: 0 };
    }
    
    // Busca na lista de perícias aprendidas
    const periciasAprendidas = window.estadoPericias.periciasAprendidas || [];
    
    for (const pericia of periciasAprendidas) {
        if (!pericia || !pericia.nome) continue;
        
        // Verifica pelo nome base
        const nomeBase = pericia.nome.trim();
        const nomeCompleto = pericia.nomeCompleto || nomeBase;
        
        console.log(`   Comparando com: "${nomeBase}" (completo: "${nomeCompleto}")`);
        
        // Para Arco: verifica exatamente "Arco"
        if (nomePericia === "Arco" && nomeBase === "Arco") {
            console.log(`   ✅ Encontrou Arco! Nível: ${pericia.nivel || 0}`);
            return { tem: true, nivel: pericia.nivel || 0 };
        }
        
        // Para Cavalgar: verifica se começa com "Cavalgar"
        if (nomePericia === "Cavalgar" && 
            (nomeBase.startsWith("Cavalgar") || nomeCompleto.includes("Cavalgar"))) {
            console.log(`   ✅ Encontrou Cavalgar! Nível: ${pericia.nivel || 0}`);
            return { tem: true, nivel: pericia.nivel || 0 };
        }
    }
    
    console.log(`   ❌ Não encontrou "${nomePericia}"`);
    return { tem: false, nivel: 0 };
}

// ===== 5. VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    console.log(`🎯 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const resultados = [];
    let todosCumpridos = true;
    
    for (const req of tecnica.prereq) {
        const resultado = verificarSeTemPericia(req.nome);
        const cumprido = resultado.tem && resultado.nivel >= req.nivelMinimo;
        
        resultados.push({
            pericia: req.nome,
            tem: resultado.tem,
            nivelAtual: resultado.nivel,
            nivelRequerido: req.nivelMinimo,
            cumprido: cumprido
        });
        
        if (!cumprido) {
            todosCumpridos = false;
            console.log(`   ❌ Falta: ${req.nome} (tem: ${resultado.nivel}, precisa: ${req.nivelMinimo})`);
        } else {
            console.log(`   ✅ Tem: ${req.nome} (nível ${resultado.nivel})`);
        }
    }
    
    console.log(`📊 Resultado: ${todosCumpridos ? 'TODOS CUMPRIDOS' : 'FALTANDO PRÉ-REQUISITOS'}`);
    return { resultados, todosCumpridos };
}

// ===== 6. RENDERIZAÇÃO DO CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    console.log("🎨 Renderizando catálogo de técnicas...");
    
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        return;
    }
    
    // Limpa o container
    container.innerHTML = '';
    
    // Se não houver técnicas no catálogo
    if (CATALOGO_TECNICAS.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tools"></i>
                <h4>Nenhuma técnica disponível</h4>
                <p>As técnicas serão adicionadas em breve</p>
            </div>
        `;
        return;
    }
    
    // Renderiza cada técnica
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        const prereqStatus = verificarPreRequisitos(tecnica);
        
        // Determina o status
        let statusClass, statusText, btnText, btnIcon, btnDisabled;
        
        if (jaAprendida) {
            statusClass = 'aprendida';
            statusText = '✓ Aprendida';
            btnText = 'Editar Técnica';
            btnIcon = 'fa-edit';
            btnDisabled = false;
        } else if (prereqStatus.todosCumpridos) {
            statusClass = 'disponivel';
            statusText = 'Disponível';
            btnText = 'Adquirir Técnica';
            btnIcon = 'fa-plus-circle';
            btnDisabled = false;
        } else {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            btnDisabled = true;
        }
        
        // Cria o elemento da técnica
        const tecnicaElement = document.createElement('div');
        tecnicaElement.className = 'tecnica-item';
        tecnicaElement.dataset.id = tecnica.id;
        
        tecnicaElement.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome-container">
                    <div class="tecnica-nome">
                        <i class="${tecnica.icone}"></i>
                        ${tecnica.nome}
                    </div>
                    <div class="tecnica-tags">
                        <span class="tecnica-dificuldade ${tecnica.dificuldade.toLowerCase()}">${tecnica.dificuldade}</span>
                        <span class="tecnica-tipo">${tecnica.periciaBase}</span>
                    </div>
                </div>
                <div class="tecnica-status">
                    <span class="tecnica-status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
            
            <div class="tecnica-descricao">
                <p>${tecnica.descricao}</p>
            </div>
            
            <div class="tecnica-info-rapida">
                <div class="info-item">
                    <i class="fas fa-bullseye"></i>
                    <span>Base: ${tecnica.periciaBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-arrow-up"></i>
                    <span>Mod: ${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-coins"></i>
                    <span>Custo: 2 pts/nível</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                <span>${tecnica.prereq.map(r => `${r.nome} (nível ${r.nivelMinimo}+)`).join(', ')}</span>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica ${statusClass === 'bloqueada' ? 'btn-bloqueada' : (statusClass === 'aprendida' ? 'btn-editar' : 'btn-adquirir')}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${btnDisabled ? 'disabled' : ''}>
                    <i class="fas ${btnIcon}"></i>
                    ${btnText}
                </button>
            </div>
        `;
        
        // Adiciona estilo se estiver bloqueada
        if (statusClass === 'bloqueada') {
            tecnicaElement.style.opacity = '0.7';
            tecnicaElement.style.cursor = 'not-allowed';
            tecnicaElement.title = "Pré-requisitos não cumpridos";
        }
        
        container.appendChild(tecnicaElement);
    });
    
    console.log(`✅ ${CATALOGO_TECNICAS.length} técnica(s) renderizada(s)`);
    
    // Atualiza contador
    const contador = document.getElementById('contador-tecnicas');
    if (contador) {
        contador.textContent = `${CATALOGO_TECNICAS.length} técnica(s)`;
    }
}

// ===== 7. RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    console.log("📚 Renderizando técnicas aprendidas...");
    
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error("❌ Container #tecnicas-aprendidas não encontrado!");
        return;
    }
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você adquirir aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    estadoTecnicas.aprendidas.forEach(tecnicaAprendida => {
        const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaBase) return;
        
        const periciaBase = verificarSeTemPericia(tecnicaBase.periciaBase);
        const nhPericiaBase = periciaBase.tem ? periciaBase.nivel : 0;
        const nhTecnica = Math.min(
            nhPericiaBase + (tecnicaAprendida.niveis || 0) + tecnicaBase.modificadorBase,
            nhPericiaBase
        );
        
        const tecnicaElement = document.createElement('div');
        tecnicaElement.className = 'tecnica-aprendida-item';
        tecnicaElement.dataset.id = tecnicaAprendida.id;
        
        tecnicaElement.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${tecnicaBase.icone}"></i>
                    <span>${tecnicaBase.nome}</span>
                </div>
                <div class="tecnica-aprendida-nh">
                    NH <span class="nh-valor">${nhTecnica}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-info">
                <div class="info-row">
                    <span>Perícia Base:</span>
                    <strong>${tecnicaBase.periciaBase} (NH ${nhPericiaBase})</strong>
                </div>
                <div class="info-row">
                    <span>Níveis:</span>
                    <strong>+${tecnicaAprendida.niveis || 0}</strong>
                </div>
                <div class="info-row">
                    <span>Pontos:</span>
                    <strong>${tecnicaAprendida.pontos || 0} pts</strong>
                </div>
            </div>
            
            <div class="tecnica-aprendida-actions">
                <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(tecnicaElement);
    });
    
    console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s) renderizada(s)`);
}

// ===== 8. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    console.log("📊 Atualizando estatísticas...");
    
    const elementos = [
        { id: 'total-tecnicas', valor: estadoTecnicas.aprendidas.length },
        { id: 'pontos-tecnicas', valor: estadoTecnicas.pontosTotais },
        { id: 'pontos-tecnicas-aprendidas', valor: `${estadoTecnicas.pontosTotais} pts` }
    ];
    
    elementos.forEach(elem => {
        const elemento = document.getElementById(elem.id);
        if (elemento) {
            elemento.textContent = elem.valor;
        }
    });
    
    // Atualizar nível médio e custo total
    const nivelMedio = document.getElementById('nivel-medio-tecnicas');
    const custoTotal = document.getElementById('custo-total-tecnicas');
    
    if (nivelMedio && estadoTecnicas.aprendidas.length > 0) {
        const somaNiveis = estadoTecnicas.aprendidas.reduce((acc, t) => acc + (t.niveis || 0), 0);
        nivelMedio.textContent = (somaNiveis / estadoTecnicas.aprendidas.length).toFixed(1);
    }
    
    if (custoTotal) {
        custoTotal.textContent = estadoTecnicas.pontosTotais;
    }
}

// ===== 9. MODAL DE TÉCNICA =====
function abrirModalTecnica(id) {
    console.log(`📖 Abrindo modal para técnica: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error("❌ Técnica não encontrada:", id);
        return;
    }
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    const prereqStatus = verificarPreRequisitos(tecnica);
    
    // Verifica perícia base
    const periciaBaseInfo = verificarSeTemPericia(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.tem ? periciaBaseInfo.nivel : 0;
    
    // Cria o conteúdo do modal
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <div class="tecnica-modal-info">
                    <p><strong>Descrição:</strong> ${tecnica.descricao}</p>
                    <p><strong>Perícia Base:</strong> ${tecnica.periciaBase} (NH ${nhPericiaBase})</p>
                    <p><strong>Dificuldade:</strong> ${tecnica.dificuldade}</p>
                    <p><strong>Modificador Base:</strong> ${tecnica.modificadorBase}</p>
                </div>
                
                <div class="tecnica-modal-prereq">
                    <h4>Pré-requisitos:</h4>
                    ${prereqStatus.resultados.map(r => `
                        <div class="prereq-item ${r.cumprido ? 'cumprido' : 'nao-cumprido'}">
                            <i class="fas fa-${r.cumprido ? 'check' : 'times'}"></i>
                            <span>${r.pericia} (${r.nivelAtual}/${r.nivelRequerido})</span>
                        </div>
                    `).join('')}
                </div>
                
                ${prereqStatus.todosCumpridos ? `
                <div class="tecnica-modal-pontos">
                    <h4>Investir Pontos:</h4>
                    <div class="pontos-opcoes">
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 2 ? 'selecionado' : ''}" 
                                onclick="selecionarPontosTecnica('${id}', 2, 1)">
                            2 pts = +1 nível
                        </button>
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 3 ? 'selecionado' : ''}"
                                onclick="selecionarPontosTecnica('${id}', 3, 2)">
                            3 pts = +2 níveis
                        </button>
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 4 ? 'selecionado' : ''}"
                                onclick="selecionarPontosTecnica('${id}', 4, 3)">
                            4 pts = +3 níveis
                        </button>
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 5 ? 'selecionado' : ''}"
                                onclick="selecionarPontosTecnica('${id}', 5, 4)">
                            5 pts = +4 níveis
                        </button>
                    </div>
                </div>
                
                <div class="tecnica-modal-resumo">
                    <div class="resumo-item">
                        <span>NH ${tecnica.periciaBase}:</span>
                        <strong>${nhPericiaBase}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis Técnica:</span>
                        <strong id="niveis-tecnica-display">${tecnicaAprendida ? tecnicaAprendida.niveis : '0'}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH Técnica:</span>
                        <strong id="nh-tecnica-display">${tecnicaAprendida ? 
                            Math.min(nhPericiaBase + tecnicaAprendida.niveis + tecnica.modificadorBase, nhPericiaBase) :
                            Math.min(nhPericiaBase + tecnica.modificadorBase, nhPericiaBase)
                        }</strong>
                    </div>
                </div>
                ` : `
                <div class="prereq-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Você precisa cumprir todos os pré-requisitos para adquirir esta técnica</span>
                </div>
                `}
            </div>
            
            <div class="modal-tecnica-footer">
                <button class="btn-modal btn-modal-cancelar" onclick="fecharModalTecnica()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button class="btn-modal btn-modal-confirmar" 
                        onclick="confirmarTecnica('${id}')"
                        id="btn-confirmar-tecnica"
                        ${prereqStatus.todosCumpridos ? '' : 'disabled'}>
                    <i class="fas fa-check"></i> ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
                </button>
            </div>
        </div>
    `;
    
    // Insere no modal
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
        
        // Seleciona opção inicial se já tiver a técnica
        if (tecnicaAprendida) {
            const pontos = tecnicaAprendida.pontos;
            const opcao = document.querySelector(`.opcao-pontos${pontos ? `.selecionado` : ':first-child'}`);
            if (opcao) opcao.click();
        }
    }
    
    // Mostra o modal
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Guarda a técnica atual
    window.tecnicaSelecionada = {
        id: id,
        pontos: tecnicaAprendida ? tecnicaAprendida.pontos : 2,
        niveis: tecnicaAprendida ? tecnicaAprendida.niveis : 1
    };
    
    console.log("✅ Modal de técnica aberto");
}

// ===== 10. FUNÇÕES DO MODAL =====
function selecionarPontosTecnica(id, pontos, niveis) {
    window.tecnicaSelecionada = {
        id: id,
        pontos: pontos,
        niveis: niveis
    };
    
    // Atualiza visual
    document.querySelectorAll('.opcao-pontos').forEach(opcao => {
        opcao.classList.remove('selecionado');
    });
    
    if (event && event.target) {
        event.target.classList.add('selecionado');
    }
    
    // Atualiza displays
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const periciaBaseInfo = verificarSeTemPericia(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.tem ? periciaBaseInfo.nivel : 0;
    const nhTecnica = Math.min(nhPericiaBase + niveis + tecnica.modificadorBase, nhPericiaBase);
    
    const nhDisplay = document.getElementById('nh-tecnica-display');
    const niveisDisplay = document.getElementById('niveis-tecnica-display');
    
    if (nhDisplay) nhDisplay.textContent = nhTecnica;
    if (niveisDisplay) niveisDisplay.textContent = niveis;
}

function confirmarTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica || !window.tecnicaSelecionada) return;
    
    // Verifica pré-requisitos novamente
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('❌ Pré-requisitos não cumpridos!');
        return;
    }
    
    const { pontos, niveis } = window.tecnicaSelecionada;
    
    // Encontra ou cria a técnica aprendida
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    const novaTecnica = {
        id: id,
        nome: tecnica.nome,
        pontos: pontos,
        niveis: niveis,
        periciaBase: tecnica.periciaBase,
        data: new Date().toISOString()
    };
    
    if (indexExistente >= 0) {
        // Atualiza existente
        const pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
        const diferencaPontos = pontos - pontosAntigos;
        
        estadoTecnicas.aprendidas[indexExistente] = novaTecnica;
        estadoTecnicas.pontosTotais += diferencaPontos;
        
        console.log(`📝 Técnica atualizada: ${tecnica.nome} (+${diferencaPontos} pts)`);
        mostrarNotificacao(`${tecnica.nome} atualizada!`, 'success');
    } else {
        // Adiciona nova
        estadoTecnicas.aprendidas.push(novaTecnica);
        estadoTecnicas.pontosTotais += pontos;
        
        console.log(`➕ Nova técnica: ${tecnica.nome} (${pontos} pts)`);
        mostrarNotificacao(`${tecnica.nome} adquirida!`, 'success');
    }
    
    // Salva
    salvarTecnicas();
    
    // Fecha modal
    fecharModalTecnica();
    
    // Atualiza interface
    renderizarTodasTecnicas();
}

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica?')) return;
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    // Remove pontos
    const pontosRemovidos = estadoTecnicas.aprendidas[index].pontos;
    estadoTecnicas.pontosTotais -= pontosRemovidos;
    
    // Remove do array
    estadoTecnicas.aprendidas.splice(index, 1);
    
    // Salva
    salvarTecnicas();
    
    // Atualiza interface
    renderizarTodasTecnicas();
    
    // Feedback
    mostrarNotificacao('🗑️ Técnica removida!', 'warning');
    
    console.log(`🗑️ Técnica removida: ${id}`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    window.tecnicaSelecionada = null;
}

// ===== 11. SALVAR DADOS =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
        console.log("💾 Técnicas salvas");
    } catch (error) {
        console.error("❌ Erro ao salvar técnicas:", error);
    }
}

// ===== 12. NOTIFICAÇÕES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-tecnica ${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        </div>
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => notificacao.classList.add('show'), 10);
    
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => {
            if (notificacao.parentNode) notificacao.parentNode.removeChild(notificacao);
        }, 300);
    }, 3000);
}

// ===== 13. RENDERIZAR TUDO =====
function renderizarTodasTecnicas() {
    console.log("🔄 Renderizando todas as técnicas...");
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 14. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carrega estado
    carregarEstadoInicial();
    
    // Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            console.log("🔄 Atualizando técnicas manualmente...");
            renderizarTodasTecnicas();
        });
    }
    
    // Renderiza inicialmente
    renderizarTodasTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado");
}

// ===== 15. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 Sistema de Técnicas pronto para inicializar");
    
    // Quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(botao => {
        botao.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            
            if (subtab === 'tecnicas') {
                console.log("🎯 Aba de técnicas ativada");
                setTimeout(inicializarSistemaTecnicas, 200);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        console.log("✅ Aba de técnicas já está ativa");
        setTimeout(inicializarSistemaTecnicas, 300);
    }
});

// ===== 16. EXPORTAR FUNÇÕES =====
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.verificarSeTemPericia = verificarSeTemPericia; // Para debug

console.log("✅ TECNICAS.JS - SISTEMA COMPLETO CARREGADO");