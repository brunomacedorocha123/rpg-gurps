// ============================================
// TÉCNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

console.log("🎯 TÉCNICAS.JS - INICIANDO SISTEMA");

// ===== 1. CATÁLOGO DE TÉCNICAS =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Permite atirar com arco enquanto cavalga. Penalidade base de -4 para usar arco montado. Cada ponto investido reduz esta penalidade. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "arco", // ID da perícia base
        atributo: "DX",
        modificadorBase: -4,
        prereq: [
            { 
                tipo: "pericia", 
                id: "arco",
                nome: "Arco",
                nivelMinimo: 1
            },
            { 
                tipo: "pericia", 
                id: "cavalgar-cavalo", 
                nome: "Cavalgar",
                especializacao: "Cavalo",
                nivelMinimo: 1 
            }
        ],
        custoTabela: {
            2: 1,  // 2 pontos = +1 nível
            3: 2,  // 3 pontos = +2 níveis
            4: 3,  // 4 pontos = +3 níveis
            5: 4   // 5 pontos = +4 níveis
        },
        regraEspecial: "Os modificadores para disparar sobre um cavalo nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada."
    }
];

// ===== 2. ESTADO DO SISTEMA =====
let estadoTecnicas = {
    aprendidas: [],
    pontosTotais: 0
};

// ===== 3. FUNÇÕES DE CONEXÃO COM PERÍCIAS =====

// Função para obter perícias aprendidas DIRETAMENTE da DOM
function obterPericiasAprendidas() {
    const pericias = [];
    
    // Buscar do container de perícias aprendidas
    const container = document.getElementById('pericias-aprendidas');
    if (!container) {
        console.warn("⚠️ Container de perícias não encontrado");
        return pericias;
    }
    
    // Verificar se está vazio
    const nenhumaElement = container.querySelector('.nenhuma-pericia-aprendida');
    if (nenhumaElement) {
        console.log("📊 Nenhuma perícia aprendida encontrada");
        return pericias;
    }
    
    // Buscar todas as perícias aprendidas
    const elementos = container.querySelectorAll('.pericia-aprendida-item');
    
    elementos.forEach(elemento => {
        // Obter nome da perícia
        const nomeElement = elemento.querySelector('.pericia-aprendida-nome');
        const nome = nomeElement ? nomeElement.textContent.trim() : '';
        
        // Obter nível (do span dentro do nível display)
        const nivelElement = elemento.querySelector('.nivel-display .valor');
        const nivel = nivelElement ? parseInt(nivelElement.textContent) || 0 : 0;
        
        // Obter especialização (se houver)
        let especializacao = null;
        const especializacaoElement = elemento.querySelector('.especializacao-badge');
        if (especializacaoElement) {
            especializacao = especializacaoElement.textContent.trim();
        }
        
        // Criar ID consistente
        let id = nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        // Adicionar especialização ao ID se existir
        if (especializacao) {
            id = `${id}-${especializacao.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        }
        
        if (nome && nivel > 0) {
            pericias.push({
                id: id,
                nome: nome,
                nivel: nivel,
                especializacao: especializacao,
                elemento: elemento
            });
        }
    });
    
    console.log(`📊 ${pericias.length} perícia(s) encontrada(s) na DOM:`, pericias.map(p => `${p.nome} (${p.nivel})`));
    return pericias;
}

// Função para obter o NH de uma perícia específica
function obterNHPericia(nomePericia, especializacaoDesejada = null) {
    const pericias = obterPericiasAprendidas();
    
    // Buscar a perícia
    const pericia = pericias.find(p => {
        // Verificar pelo nome (sem case sensitive)
        const nomeMatch = p.nome.toLowerCase().includes(nomePericia.toLowerCase()) || 
                          nomePericia.toLowerCase().includes(p.nome.toLowerCase());
        
        if (!nomeMatch) return false;
        
        // Se precisa de especialização específica
        if (especializacaoDesejada) {
            return p.especializacao === especializacaoDesejada;
        }
        
        return true;
    });
    
    if (pericia) {
        console.log(`✅ Perícia encontrada: ${pericia.nome} (${pericia.especializacao || 'sem especialização'}) = NH ${pericia.nivel}`);
        return pericia.nivel;
    }
    
    console.log(`❌ Perícia não encontrada: ${nomePericia}${especializacaoDesejada ? ` (${especializacaoDesejada})` : ''}`);
    return 0; // Retorna 0 se não tiver a perícia
}

// Função para verificar pré-requisitos
function verificarPreRequisitosTecnica(tecnica) {
    const resultados = [];
    let todosCumpridos = true;
    
    tecnica.prereq.forEach(prereq => {
        if (prereq.tipo === 'pericia') {
            const nhAtual = obterNHPericia(prereq.nome, prereq.especializacao);
            const cumprido = nhAtual >= prereq.nivelMinimo;
            
            if (!cumprido) {
                todosCumpridos = false;
            }
            
            resultados.push({
                descricao: prereq.especializacao ? 
                    `${prereq.nome} (${prereq.especializacao})` : 
                    prereq.nome,
                cumprido: cumprido,
                nivelAtual: nhAtual,
                nivelMinimo: prereq.nivelMinimo
            });
            
            console.log(`📋 Pré-requisito: ${prereq.nome}${prereq.especializacao ? ` (${prereq.especializacao})` : ''} = ${cumprido ? '✅' : '❌'} (${nhAtual} >= ${prereq.nivelMinimo})`);
        }
    });
    
    return {
        resultados: resultados,
        todosCumpridos: todosCumpridos
    };
}

// ===== 4. CARREGAMENTO E SALVAMENTO =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_aprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
        }
        
        // Carregar pontos totais
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) {
            estadoTecnicas.pontosTotais = parseInt(pontos) || 0;
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
        estadoTecnicas = { aprendidas: [], pontosTotais: 0 };
    }
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
        console.log("💾 Técnicas salvas");
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

// ===== 5. RENDERIZAÇÃO =====
function renderizarTecnicas() {
    console.log("🎨 Renderizando técnicas...");
    
    // Verificar se a aba de técnicas está visível
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (!abaTecnicas || abaTecnicas.style.display === 'none') {
        console.log("ℹ️ Aba de técnicas não está visível");
        return;
    }
    
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticas();
}

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ #lista-tecnicas não encontrado");
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
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
    
    // Para cada técnica
    CATALOGO_TECNICAS.forEach(tecnica => {
        const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        const prereqStatus = verificarPreRequisitosTecnica(tecnica);
        
        // Determinar status
        let statusClass = '';
        let statusText = '';
        let btnText = '';
        let btnClass = '';
        let btnDisabled = false;
        
        if (tecnicaAprendida) {
            statusClass = 'aprendida';
            statusText = '✓ Aprendida';
            btnText = 'Editar';
            btnClass = 'btn-editar';
        } else if (prereqStatus.todosCumpridos) {
            statusClass = 'disponivel';
            statusText = 'Disponível';
            btnText = 'Adquirir';
            btnClass = 'btn-adquirir';
        } else {
            statusClass = 'bloqueada';
            statusText = 'Bloqueado';
            btnText = 'Pré-requisitos';
            btnClass = 'btn-bloqueado';
            btnDisabled = true;
        }
        
        // Criar card
        const card = document.createElement('div');
        card.className = 'tecnica-item';
        card.dataset.id = tecnica.id;
        
        // Formatar pré-requisitos para exibição
        const prereqText = tecnica.prereq.map(p => {
            if (p.especializacao) {
                return `${p.nome} (${p.especializacao})`;
            }
            return p.nome;
        }).join(', ');
        
        card.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome-container">
                    <div class="tecnica-nome">
                        <i class="${tecnica.icone}"></i>
                        ${tecnica.nome}
                    </div>
                    <div class="tecnica-tags">
                        <span class="tecnica-dificuldade ${tecnica.dificuldade.toLowerCase()}">${tecnica.dificuldade}</span>
                        <span class="tecnica-base">${tecnica.periciaBase}</span>
                    </div>
                </div>
                <div class="tecnica-status">
                    <span class="tecnica-status-badge ${statusClass}">${statusText}</span>
                </div>
            </div>
            
            <div class="tecnica-descricao">
                <p>${tecnica.descricao}</p>
            </div>
            
            <div class="tecnica-info">
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
                <span>${prereqText}</span>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica ${btnClass}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${btnDisabled ? 'disabled' : ''}>
                    <i class="fas fa-${tecnicaAprendida ? 'edit' : 'plus-circle'}"></i>
                    ${btnText}
                </button>
            </div>
        `;
        
        // Adicionar estilo visual para bloqueado
        if (btnDisabled) {
            card.style.opacity = '0.7';
            card.style.cursor = 'not-allowed';
        }
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${CATALOGO_TECNICAS.length} técnica(s) renderizada(s) no catálogo`);
}

function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error("❌ #tecnicas-aprendidas não encontrado");
        return;
    }
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica-aprendida">
                <i class="fas fa-tools"></i>
                <h4>Nenhuma técnica aprendida</h4>
                <p>As técnicas que você adquirir aparecerão aqui</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    estadoTecnicas.aprendidas.forEach(tecnicaAprendida => {
        const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaBase) return;
        
        // Obter NH da perícia base
        const nhBase = obterNHPericia(tecnicaBase.periciaBase);
        
        // Calcular NH da técnica
        const nhTecnica = Math.min(
            nhBase + tecnicaAprendida.niveis + tecnicaBase.modificadorBase,
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
                    <span>Base:</span>
                    <strong>${tecnicaBase.periciaBase} (NH ${nhBase})</strong>
                </div>
                <div class="info-row">
                    <span>Níveis:</span>
                    <strong>+${tecnicaAprendida.niveis}</strong>
                </div>
                <div class="info-row">
                    <span>Pontos:</span>
                    <strong>${tecnicaAprendida.pontos} pts</strong>
                </div>
            </div>
            
            <div class="tecnica-aprendida-actions">
                <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function atualizarEstatisticas() {
    const totalTecnicas = document.getElementById('total-tecnicas');
    const pontosTecnicas = document.getElementById('pontos-tecnicas');
    const pontosAprendidas = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalTecnicas) totalTecnicas.textContent = estadoTecnicas.aprendidas.length;
    if (pontosTecnicas) pontosTecnicas.textContent = estadoTecnicas.pontosTotais;
    if (pontosAprendidas) pontosAprendidas.textContent = `${estadoTecnicas.pontosTotais} pts`;
}

// ===== 6. MODAL E AÇÕES =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    const prereqStatus = verificarPreRequisitosTecnica(tecnica);
    
    // Obter overlay e modal
    const overlay = document.getElementById('modal-tecnica-overlay');
    const modal = document.getElementById('modal-tecnica');
    
    if (!overlay || !modal) {
        console.error("❌ Modal não encontrado");
        return;
    }
    
    // Obter template
    const template = document.getElementById('template-modal-tecnica');
    if (!template) {
        console.error("❌ Template não encontrado");
        return;
    }
    
    // Obter NH da perícia base
    const nhBase = obterNHPericia(tecnica.periciaBase);
    
    // Clonar template
    const modalContent = template.content.cloneNode(true);
    
    // Preencher dados
    modalContent.querySelector('.modal-tecnica-nome').textContent = tecnica.nome;
    modalContent.querySelector('.modal-tecnica-dificuldade').textContent = tecnica.dificuldade;
    modalContent.querySelector('.modal-tecnica-pericia').textContent = tecnica.periciaBase;
    modalContent.querySelector('.modal-tecnica-modificador').textContent = tecnica.modificadorBase;
    
    // Pré-requisitos
    const prereqText = tecnica.prereq.map(p => {
        if (p.especializacao) {
            return `${p.nome} (${p.especializacao})`;
        }
        return p.nome;
    }).join(', ');
    modalContent.querySelector('.modal-tecnica-prereq').textContent = prereqText;
    
    // Descrição
    modalContent.querySelector('.modal-tecnica-descricao-texto').textContent = tecnica.descricao;
    
    // Status dos pré-requisitos
    const prereqContainer = modalContent.querySelector('.prereq-status-list');
    prereqContainer.innerHTML = '';
    
    prereqStatus.resultados.forEach(status => {
        const item = document.createElement('div');
        item.className = `prereq-status-item ${status.cumprido ? 'cumprido' : 'nao-cumprido'}`;
        
        item.innerHTML = `
            <i class="fas fa-${status.cumprido ? 'check' : 'times'}"></i>
            <span class="prereq-status-text">${status.descricao}</span>
            <span class="prereq-status-nivel">(${status.nivelAtual}/${status.nivelMinimo})</span>
        `;
        
        prereqContainer.appendChild(item);
    });
    
    // Configurar NH base
    modalContent.querySelector('#nh-base-tecnica').textContent = nhBase;
    
    // Configurar opções de pontos
    const opcoesPontos = modalContent.querySelectorAll('.opcao-pontos');
    let opcaoSelecionada = null;
    
    opcoesPontos.forEach(opcao => {
        const pontos = parseInt(opcao.dataset.pontos);
        const niveis = parseInt(opcao.dataset.niveis);
        
        opcao.addEventListener('click', () => {
            // Remover seleção anterior
            opcoesPontos.forEach(o => o.classList.remove('selecionado'));
            
            // Selecionar esta
            opcao.classList.add('selecionado');
            opcaoSelecionada = { pontos, niveis };
            
            // Calcular NH
            const nhMod = tecnica.modificadorBase + niveis;
            const nhTotal = Math.min(nhBase + nhMod, nhBase);
            
            // Atualizar display
            modalContent.querySelector('#nh-mod-tecnica').textContent = nhMod;
            modalContent.querySelector('#nh-total-tecnica').textContent = nhTotal;
            modalContent.querySelector('#resumo-pontos').textContent = pontos;
            modalContent.querySelector('#resumo-niveis').textContent = `+${niveis}`;
            modalContent.querySelector('#resumo-nh').textContent = nhTotal;
            modalContent.querySelector('#modal-custo-total-tecnica').textContent = pontos;
            
            // Configurar botão de confirmação
            const btnConfirmar = modalContent.querySelector('#btn-confirmar-tecnica');
            if (btnConfirmar) {
                btnConfirmar.disabled = !prereqStatus.todosCumpridos;
                if (prereqStatus.todosCumpridos) {
                    btnConfirmar.onclick = () => confirmarTecnica(id, pontos, niveis, nhTotal);
                }
            }
        });
    });
    
    // Se estiver editando, selecionar valores atuais
    if (tecnicaAprendida) {
        const opcaoCorrespondente = Array.from(opcoesPontos).find(o => 
            parseInt(o.dataset.pontos) === tecnicaAprendida.pontos
        );
        
        if (opcaoCorrespondente) {
            setTimeout(() => opcaoCorrespondente.click(), 100);
        }
        
        // Atualizar texto do botão
        const btnConfirmar = modalContent.querySelector('#btn-confirmar-tecnica');
        if (btnConfirmar) {
            btnConfirmar.innerHTML = '<i class="fas fa-save"></i> Atualizar Técnica';
            btnConfirmar.onclick = () => confirmarTecnica(id, tecnicaAprendida.pontos, tecnicaAprendida.niveis, tecnicaAprendida.nh);
        }
    } else {
        // Selecionar primeira opção por padrão
        if (opcoesPontos.length > 0) {
            setTimeout(() => {
                opcoesPontos[0].click();
            }, 100);
        }
    }
    
    // Configurar botão de cancelar
    modalContent.querySelector('.modal-tecnica-close').onclick = fecharModalTecnica;
    modalContent.querySelector('.btn-modal-cancelar').onclick = fecharModalTecnica;
    
    // Limpar e inserir conteúdo
    modal.innerHTML = '';
    modal.appendChild(modalContent);
    
    // Mostrar modal
    overlay.style.display = 'flex';
}

function confirmarTecnica(id, pontos, niveis, nhTotal) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    // Verificar pré-requisitos novamente
    const prereqStatus = verificarPreRequisitosTecnica(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('Pré-requisitos não cumpridos!');
        return;
    }
    
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    const tecnicaAprendida = {
        id: id,
        nome: tecnica.nome,
        pontos: pontos,
        niveis: niveis,
        nh: nhTotal,
        periciaBase: tecnica.periciaBase,
        data: new Date().toISOString()
    };
    
    if (indexExistente >= 0) {
        // Atualizar
        estadoTecnicas.aprendidas[indexExistente] = tecnicaAprendida;
    } else {
        // Adicionar nova
        estadoTecnicas.aprendidas.push(tecnicaAprendida);
    }
    
    // Atualizar pontos totais
    estadoTecnicas.pontosTotais = estadoTecnicas.aprendidas.reduce((total, t) => total + t.pontos, 0);
    
    // Salvar
    salvarTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Atualizar interface
    renderizarTecnicas();
    
    // Feedback visual
    const card = document.querySelector(`.tecnica-item[data-id="${id}"]`);
    if (card) {
        card.style.animation = 'pulse 0.5s';
        setTimeout(() => card.style.animation = '', 500);
    }
}

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Remover esta técnica?')) return;
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    estadoTecnicas.aprendidas.splice(index, 1);
    
    // Recalcular pontos
    estadoTecnicas.pontosTotais = estadoTecnicas.aprendidas.reduce((total, t) => total + t.pontos, 0);
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar interface
    renderizarTecnicas();
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    const modal = document.getElementById('modal-tecnica');
    
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.innerHTML = '<div class="modal-tecnica-loading"><i class="fas fa-spinner fa-spin"></i><p>Carregando técnica...</p></div>';
}

// ===== 7. INICIALIZAÇÃO =====
function inicializarTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar dados
    carregarTecnicas();
    
    // Configurar botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', renderizarTecnicas);
    }
    
    // Observar mudanças nas perícias
    observarPericias();
    
    // Renderizar inicialmente
    renderizarTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado");
}

// Observar mudanças nas perícias aprendidas
function observarPericias() {
    // Usar MutationObserver para detectar mudanças nas perícias
    const observer = new MutationObserver((mutations) => {
        let deveAtualizar = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' || mutation.type === 'characterData') {
                deveAtualizar = true;
            }
        });
        
        if (deveAtualizar && isAbaTecnicasAtiva()) {
            console.log("🔄 Mudanças detectadas nas perícias, atualizando técnicas...");
            renderizarTecnicas();
        }
    });
    
    // Observar o container de perícias aprendidas
    const containerPericias = document.getElementById('pericias-aprendidas');
    if (containerPericias) {
        observer.observe(containerPericias, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }
}

function isAbaTecnicasAtiva() {
    const aba = document.getElementById('subtab-tecnicas');
    return aba && aba.classList.contains('active');
}

// ===== 8. EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando técnicas");
    
    // Configurar clique nas abas
    document.querySelectorAll('.subtab-btn-pericias').forEach(botao => {
        botao.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(() => {
                    console.log("🔄 Aba técnicas ativada");
                    inicializarTecnicas();
                }, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas, inicializar
    if (isAbaTecnicasAtiva()) {
        setTimeout(inicializarTecnicas, 500);
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            fecharModalTecnica();
        }
    });
});

// ===== 9. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.renderizarTecnicas = renderizarTecnicas;
window.obterPericiasAprendidas = obterPericiasAprendidas;
window.verificarPreRequisitosTecnica = verificarPreRequisitosTecnica;

console.log("✅ TÉCNICAS.JS - PRONTO PARA USAR");