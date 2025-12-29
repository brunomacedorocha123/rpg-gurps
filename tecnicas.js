// ============================================
// TECNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

console.log("🎯 SISTEMA DE TÉCNICAS INICIADO");

// ===== 1. CONFIGURAÇÃO =====
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
        prereq: ["Arco", "Cavalgar"],
        custoTabela: { 2: 1, 3: 2, 4: 3, 5: 4 }
    }
];

let estadoTecnicas = {
    aprendidas: [],
    pontosTotais: 0
};

let tecnicaSelecionada = null;

// ===== 2. FUNÇÕES BÁSICAS =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_aprendidas');
        if (salvo) estadoTecnicas.aprendidas = JSON.parse(salvo);
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) estadoTecnicas.pontosTotais = parseInt(pontos);
        
        console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
    } catch (e) {
        console.error("Erro ao carregar:", e);
    }
}

function salvarTecnicas() {
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
    localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
}

// ===== 3. CONEXÃO COM PERÍCIAS =====
function buscarPericiasAprendidas() {
    // Direto do seu sistema principal
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        return window.estadoPericias.periciasAprendidas;
    }
    
    // Fallback do localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.periciasAprendidas) return parsed.periciasAprendidas;
        }
    } catch (e) {}
    
    return [];
}

function temPericia(nomePericia) {
    const pericias = buscarPericiasAprendidas();
    
    for (const pericia of pericias) {
        if (!pericia || !pericia.nome) continue;
        
        const nomeBase = pericia.nome.trim();
        const nomeCompleto = pericia.nomeCompleto || nomeBase;
        
        // Verifica pelo nome
        if (nomeBase.toLowerCase() === nomePericia.toLowerCase()) {
            return { tem: true, nivel: pericia.nivel || 0 };
        }
        
        // Verifica se contém o nome (para Cavalgar)
        if (nomeCompleto.toLowerCase().includes(nomePericia.toLowerCase())) {
            return { tem: true, nivel: pericia.nivel || 0 };
        }
    }
    
    return { tem: false, nivel: 0 };
}

// ===== 4. RENDERIZAÇÃO =====
function renderizarCatalogoTecnicas() {
    console.log("🎨 Renderizando catálogo...");
    
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado");
        return;
    }
    
    container.innerHTML = '';
    
    if (CATALOGO_TECNICAS.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma técnica disponível</div>';
        return;
    }
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        
        // Verifica pré-requisitos
        const arco = temPericia("Arco");
        const cavalgar = temPericia("Cavalgar");
        const prereqCumpridos = arco.tem && cavalgar.tem;
        
        // Determina status
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
        } else if (!prereqCumpridos) {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            disabled = true;
        }
        
        // Cria o card
        const card = document.createElement('div');
        card.className = 'tecnica-item';
        card.dataset.id = tecnica.id;
        
        card.innerHTML = `
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
                <span>${tecnica.prereq.join(', ')}</span>
                <div class="prereq-status">
                    <span class="${arco.tem ? 'cumprido' : 'pendente'}">
                        <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i> Arco
                    </span>
                    <span class="${cavalgar.tem ? 'cumprido' : 'pendente'}">
                        <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i> Cavalgar
                    </span>
                </div>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica ${statusClass}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${disabled ? 'disabled' : ''}>
                    <i class="fas ${btnIcon}"></i>
                    ${btnText}
                </button>
            </div>
        `;
        
        if (statusClass === 'bloqueada') {
            card.style.opacity = '0.7';
            card.style.cursor = 'not-allowed';
        }
        
        container.appendChild(card);
    });
    
    console.log("✅ Catálogo renderizado");
}

function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
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
        
        const periciaBase = temPericia(tecnicaBase.periciaBase);
        const nhBase = periciaBase.tem ? periciaBase.nivel : 0;
        const nhTecnica = Math.min(
            nhBase + (tecnicaAprendida.niveis || 0) + tecnicaBase.modificadorBase,
            nhBase
        );
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida-item';
        card.dataset.id = tecnicaAprendida.id;
        
        card.innerHTML = `
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
                    <strong>${tecnicaBase.periciaBase} (NH ${nhBase})</strong>
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
        
        container.appendChild(card);
    });
}

function atualizarEstatisticas() {
    const elementos = [
        { id: 'total-tecnicas', valor: estadoTecnicas.aprendidas.length },
        { id: 'pontos-tecnicas', valor: estadoTecnicas.pontosTotais },
        { id: 'pontos-tecnicas-aprendidas', valor: `${estadoTecnicas.pontosTotais} pts` }
    ];
    
    elementos.forEach(elem => {
        const el = document.getElementById(elem.id);
        if (el) el.textContent = elem.valor;
    });
}

// ===== 5. MODAL =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    
    // Verifica pré-requisitos
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    const prereqCumpridos = arco.tem && cavalgar.tem;
    
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <div class="tecnica-modal-info">
                    <p><strong>Descrição:</strong> ${tecnica.descricao}</p>
                </div>
                
                <div class="tecnica-modal-prereq">
                    <h4>Pré-requisitos:</h4>
                    <div class="prereq-item ${arco.tem ? 'cumprido' : 'nao-cumprido'}">
                        <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i>
                        <span>Arco (${arco.nivel}/1)</span>
                    </div>
                    <div class="prereq-item ${cavalgar.tem ? 'cumprido' : 'nao-cumprido'}">
                        <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
                        <span>Cavalgar (${cavalgar.nivel}/1)</span>
                    </div>
                </div>
                
                ${prereqCumpridos ? `
                <div class="tecnica-modal-pontos">
                    <h4>Investir Pontos:</h4>
                    <div class="pontos-opcoes">
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 2 ? 'selecionado' : ''}" 
                                onclick="selecionarPontosTecnica(2, 1)">
                            2 pts = +1 nível
                        </button>
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 3 ? 'selecionado' : ''}"
                                onclick="selecionarPontosTecnica(3, 2)">
                            3 pts = +2 níveis
                        </button>
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 4 ? 'selecionado' : ''}"
                                onclick="selecionarPontosTecnica(4, 3)">
                            4 pts = +3 níveis
                        </button>
                        <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 5 ? 'selecionado' : ''}"
                                onclick="selecionarPontosTecnica(5, 4)">
                            5 pts = +4 níveis
                        </button>
                    </div>
                </div>
                
                <div class="tecnica-modal-resumo">
                    <div class="resumo-item">
                        <span>Custo:</span>
                        <strong id="custo-modal">${tecnicaAprendida ? tecnicaAprendida.pontos : 2}</strong>
                        <span> pontos</span>
                    </div>
                </div>
                ` : `
                <div class="prereq-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Você precisa ter Arco e Cavalgar para adquirir esta técnica</span>
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
                        ${prereqCumpridos ? '' : 'disabled'}>
                    <i class="fas fa-check"></i> ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
                </button>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
        
        // Seleciona opção inicial
        if (tecnicaAprendida) {
            const pontos = tecnicaAprendida.pontos;
            const opcao = document.querySelector(`.opcao-pontos${pontos ? `.selecionado` : ':first-child'}`);
            if (opcao) opcao.click();
        }
    }
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'flex';
    
    tecnicaSelecionada = {
        id: id,
        pontos: tecnicaAprendida ? tecnicaAprendida.pontos : 2,
        niveis: tecnicaAprendida ? tecnicaAprendida.niveis : 1
    };
}

function selecionarPontosTecnica(pontos, niveis) {
    tecnicaSelecionada = {
        ...tecnicaSelecionada,
        pontos: pontos,
        niveis: niveis
    };
    
    document.querySelectorAll('.opcao-pontos').forEach(opcao => {
        opcao.classList.remove('selecionado');
    });
    
    event.target.classList.add('selecionado');
    
    const custoDisplay = document.getElementById('custo-modal');
    if (custoDisplay) custoDisplay.textContent = pontos;
}

function confirmarTecnica(id) {
    if (!tecnicaSelecionada) return;
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const { pontos, niveis } = tecnicaSelecionada;
    
    // Verifica pré-requisitos novamente
    const arco = temPericia("Arco");
    const cavalgar = temPericia("Cavalgar");
    
    if (!arco.tem || !cavalgar.tem) {
        alert('❌ Pré-requisitos não cumpridos!');
        return;
    }
    
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar
        const pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
        estadoTecnicas.pontosTotais += (pontos - pontosAntigos);
        
        estadoTecnicas.aprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase
        };
        
        mostrarNotificacao(`${tecnica.nome} atualizada!`, 'success');
    } else {
        // Adicionar nova
        estadoTecnicas.aprendidas.push({
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase
        });
        estadoTecnicas.pontosTotais += pontos;
        
        mostrarNotificacao(`${tecnica.nome} adquirida!`, 'success');
    }
    
    salvarTecnicas();
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Remover esta técnica?')) return;
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    estadoTecnicas.pontosTotais -= estadoTecnicas.aprendidas[index].pontos;
    estadoTecnicas.aprendidas.splice(index, 1);
    
    salvarTecnicas();
    renderizarTodasTecnicas();
    
    mostrarNotificacao('Técnica removida!', 'warning');
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    tecnicaSelecionada = null;
}

// ===== 6. UTILIDADES =====
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

// ===== 7. INICIALIZAÇÃO =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticas();
}

function inicializarTecnicas() {
    console.log("🚀 Inicializando técnicas...");
    
    carregarTecnicas();
    
    // Botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            console.log("🔄 Atualizando técnicas...");
            renderizarTodasTecnicas();
        });
    }
    
    // Renderiza
    renderizarTodasTecnicas();
    
    console.log("✅ Técnicas inicializadas");
}

// ===== 8. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando técnicas");
    
    // Quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            
            if (subtab === 'tecnicas') {
                console.log("🎯 Aba de técnicas ativada");
                setTimeout(inicializarTecnicas, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        console.log("✅ Aba de técnicas já ativa");
        setTimeout(inicializarTecnicas, 200);
    }
});

// ===== 9. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.temPericia = temPericia;

console.log("✅ TECNICAS.JS - SISTEMA COMPLETO PRONTO");