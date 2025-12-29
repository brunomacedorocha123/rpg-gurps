// ============================================
// TÉCNICAS.JS - SISTEMA CORRETO E NATURAL
// CONECTADO COM SEU SISTEMA DE PERÍCIAS
// ============================================

console.log("🎯 TÉCNICAS.JS - VERSÃO CORRETA");

// ===== 1. CATÁLOGO SIMPLES =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada ponto investido reduz esta penalidade. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        modificadorBase: -4,
        prereq: [
            {
                tipo: "pericia",
                nome: "Arco",
                nivelMinimo: 1
            },
            {
                tipo: "pericia",
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
        }
    }
];

// ===== 2. ESTADO SIMPLES =====
let estadoTecnicas = {
    aprendidas: [],
    pontosTotais: 0
};

// ===== 3. CONEXÃO COM SEU SISTEMA DE PERÍCIAS =====

// Função para OBTER PERÍCIAS DIRETAMENTE do seu sistema
function obterPericiasDoSeuSistema() {
    try {
        // Método 1: Do localStorage do seu sistema
        const dadosPericias = localStorage.getItem('gurps_pericias');
        if (dadosPericias) {
            const dados = JSON.parse(dadosPericias);
            if (dados.periciasAprendidas && Array.isArray(dados.periciasAprendidas)) {
                return dados.periciasAprendidas;
            }
        }
        
        // Método 2: Da DOM
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            return extrairPericiasDaDOM(container);
        }
        
        // Método 3: Da sua variável global
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            return window.estadoPericias.periciasAprendidas;
        }
        
        console.warn("⚠️ Não encontrou perícias, retornando array vazio");
        return [];
        
    } catch (error) {
        console.error("❌ Erro ao obter perícias:", error);
        return [];
    }
}

// Função para extrair perícias da DOM
function extrairPericiasDaDOM(container) {
    const pericias = [];
    
    // Procura elementos de perícia aprendida (de acordo com SEU HTML)
    const elementos = container.querySelectorAll('.pericia-aprendida-item');
    
    elementos.forEach(elemento => {
        // Verifica como SUA perícia está estruturada
        const nomeElement = elemento.querySelector('.pericia-aprendida-nome');
        const nivelElement = elemento.querySelector('.nivel-display .valor, .nivel-display');
        const especializacaoElement = elemento.querySelector('.especializacao-badge');
        
        if (nomeElement) {
            const pericia = {
                id: elemento.dataset.id || nomeElement.textContent.toLowerCase().replace(/\s+/g, '-'),
                nome: nomeElement.textContent.trim(),
                nivel: nivelElement ? parseInt(nivelElement.textContent) || 0 : 0,
                especializacao: especializacaoElement ? especializacaoElement.textContent.trim() : null
            };
            
            console.log(`📊 Perícia encontrada na DOM: ${pericia.nome} (${pericia.nivel})`);
            pericias.push(pericia);
        }
    });
    
    return pericias;
}

// Função para VERIFICAR UMA PERÍCIA específica
function verificarTemPericia(nomePericia, especializacaoDesejada = null) {
    const pericias = obterPericiasDoSeuSistema();
    
    const periciaEncontrada = pericias.find(pericia => {
        // Compara nomes (sem case sensitive)
        const nomeMatch = pericia.nome.toLowerCase().includes(nomePericia.toLowerCase()) ||
                         nomePericia.toLowerCase().includes(pericia.nome.toLowerCase());
        
        if (!nomeMatch) return false;
        
        // Se precisa de especialização específica
        if (especializacaoDesejada) {
            return pericia.especializacao === especializacaoDesejada;
        }
        
        return true;
    });
    
    if (periciaEncontrada) {
        console.log(`✅ Encontrou ${nomePericia}${especializacaoDesejada ? ` (${especializacaoDesejada})` : ''}: Nível ${periciaEncontrada.nivel}`);
        return {
            encontrada: true,
            nivel: periciaEncontrada.nivel,
            pericia: periciaEncontrada
        };
    }
    
    console.log(`❌ Não encontrou ${nomePericia}${especializacaoDesejada ? ` (${especializacaoDesejada})` : ''}`);
    return {
        encontrada: false,
        nivel: 0,
        pericia: null
    };
}

// Função para verificar TODOS os pré-requisitos
function verificarPreRequisitos(tecnica) {
    console.log(`🔍 Verificando pré-requisitos para: ${tecnica.nome}`);
    
    const resultados = [];
    let todosCumpridos = true;
    
    tecnica.prereq.forEach(prereq => {
        const resultado = verificarTemPericia(prereq.nome, prereq.especializacao);
        
        const cumprido = resultado.encontrada && resultado.nivel >= prereq.nivelMinimo;
        
        if (!cumprido) {
            todosCumpridos = false;
        }
        
        resultados.push({
            descricao: prereq.especializacao ? 
                `${prereq.nome} (${prereq.especializacao})` : 
                prereq.nome,
            cumprido: cumprido,
            nivelAtual: resultado.nivel,
            nivelNecessario: prereq.nivelMinimo
        });
    });
    
    console.log(`📋 Resultado: ${todosCumpridos ? '✅ TODOS cumpridos' : '❌ Faltam pré-requisitos'}`);
    
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
    
    // Verifica se a aba de técnicas está visível
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (!abaTecnicas || window.getComputedStyle(abaTecnicas).display === 'none') {
        console.log("ℹ️ Aba de técnicas não está visível");
        return;
    }
    
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ #lista-tecnicas não encontrado");
        return;
    }
    
    // Limpa o container
    container.innerHTML = '';
    
    // Para cada técnica no catálogo
    CATALOGO_TECNICAS.forEach(tecnica => {
        const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        const prereqStatus = verificarPreRequisitos(tecnica);
        
        // Determina status
        let statusClass, statusText, btnText, btnDisabled;
        
        if (tecnicaAprendida) {
            statusClass = 'aprendida';
            statusText = '✓ Aprendida';
            btnText = 'Editar Técnica';
            btnDisabled = false;
        } else if (prereqStatus.todosCumpridos) {
            statusClass = 'disponivel';
            statusText = 'Disponível';
            btnText = 'Adquirir Técnica';
            btnDisabled = false;
        } else {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnDisabled = true;
        }
        
        // Formata pré-requisitos para exibição
        const prereqText = tecnica.prereq.map(p => {
            if (p.especializacao) {
                return `${p.nome} (${p.especializacao})`;
            }
            return p.nome;
        }).join(', ');
        
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
                <button class="btn-tecnica ${statusClass === 'aprendida' ? 'btn-editar' : 'btn-adquirir'}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${btnDisabled ? 'disabled' : ''}>
                    <i class="fas fa-${statusClass === 'aprendida' ? 'edit' : 'plus-circle'}"></i>
                    ${btnText}
                </button>
            </div>
        `;
        
        // Adiciona efeito visual se estiver bloqueada
        if (btnDisabled) {
            card.style.opacity = '0.7';
            card.style.cursor = 'not-allowed';
            card.title = "Pré-requisitos não cumpridos";
        }
        
        container.appendChild(card);
    });
    
    console.log(`✅ ${CATALOGO_TECNICAS.length} técnica(s) renderizada(s)`);
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
        
        // Obtém a perícia base do SEU sistema
        const periciaBase = verificarTemPericia(tecnicaBase.periciaBase);
        const nhPericiaBase = periciaBase.encontrada ? periciaBase.nivel : 0;
        
        // Calcula NH da técnica (nunca pode exceder o NH da perícia base)
        const nhTecnica = Math.min(
            nhPericiaBase + tecnicaAprendida.niveis + tecnicaBase.modificadorBase,
            nhPericiaBase
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
                    <strong>${tecnicaBase.periciaBase} (NH ${nhPericiaBase})</strong>
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
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function atualizarEstatisticasTecnicas() {
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
    const prereqStatus = verificarPreRequisitos(tecnica);
    
    // Obtém perícia base
    const periciaBaseInfo = verificarTemPericia(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.encontrada ? periciaBaseInfo.nivel : 0;
    
    // Cria modal simples
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
                            <span>${r.descricao} (${r.nivelAtual}/${r.nivelNecessario})</span>
                        </div>
                    `).join('')}
                </div>
                
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
                        <span>NH Técnica:</span>
                        <strong id="nh-tecnica-display">${nhPericiaBase + tecnica.modificadorBase}</strong>
                    </div>
                </div>
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
    event.target.classList.add('selecionado');
    
    // Atualiza NH display
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    const periciaBaseInfo = verificarTemPericia(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.encontrada ? periciaBaseInfo.nivel : 0;
    const nhTecnica = Math.min(nhPericiaBase + niveis + tecnica.modificadorBase, nhPericiaBase);
    
    const nhDisplay = document.getElementById('nh-tecnica-display');
    if (nhDisplay) {
        nhDisplay.textContent = nhTecnica;
    }
}

function confirmarTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica || !window.tecnicaSelecionada) return;
    
    // Verifica pré-requisitos novamente
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('Pré-requisitos não cumpridos!');
        return;
    }
    
    const { pontos, niveis } = window.tecnicaSelecionada;
    
    // Encontra ou cria a técnica aprendida
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    const tecnicaAprendida = {
        id: id,
        nome: tecnica.nome,
        pontos: pontos,
        niveis: niveis,
        periciaBase: tecnica.periciaBase,
        data: new Date().toISOString()
    };
    
    if (indexExistente >= 0) {
        // Atualiza existente
        estadoTecnicas.aprendidas[indexExistente] = tecnicaAprendida;
        console.log(`📝 Técnica atualizada: ${tecnica.nome}`);
    } else {
        // Adiciona nova
        estadoTecnicas.aprendidas.push(tecnicaAprendida);
        estadoTecnicas.pontosTotais += pontos;
        console.log(`➕ Nova técnica: ${tecnica.nome}`);
    }
    
    // Salva
    salvarTecnicas();
    
    // Fecha modal
    fecharModalTecnica();
    
    // Atualiza interface
    renderizarTecnicas();
    
    // Feedback
    alert(`✅ ${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'}!`);
}

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Remover esta técnica?')) return;
    
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
    renderizarTecnicas();
    
    console.log(`🗑️ Técnica removida: ${id}`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    window.tecnicaSelecionada = null;
}

// ===== 7. INICIALIZAÇÃO =====
function inicializarTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carrega dados
    carregarTecnicas();
    
    // Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            console.log("🔄 Atualizando técnicas...");
            renderizarTecnicas();
        });
    }
    
    // Renderiza inicialmente
    renderizarTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado");
}

// ===== 8. OBSERVAR MUDANÇAS NAS PERÍCIAS =====
// Observa quando perícias são adicionadas/removidas
function observarPericias() {
    // Observa mudanças no container de perícias
    const observer = new MutationObserver(function(mutations) {
        let deveAtualizar = false;
        
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                deveAtualizar = true;
            }
        });
        
        if (deveAtualizar) {
            console.log("🔄 Mudanças nas perícias detectadas, atualizando técnicas...");
            renderizarTecnicas();
        }
    });
    
    const containerPericias = document.getElementById('pericias-aprendidas');
    if (containerPericias) {
        observer.observe(containerPericias, {
            childList: true,
            subtree: true
        });
    }
}

// ===== 9. INICIALIZAÇÃO AO CARREGAR =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando técnicas");
    
    // Configura clique nas abas
    document.querySelectorAll('.subtab-btn-pericias').forEach(botao => {
        botao.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            
            if (subtab === 'tecnicas') {
                // Espera um pouco para a aba carregar
                setTimeout(() => {
                    console.log("🔄 Aba técnicas ativada");
                    inicializarTecnicas();
                    observarPericias(); // Começa a observar mudanças
                }, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas, inicializa agora
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && window.getComputedStyle(abaTecnicas).display !== 'none') {
        console.log("✅ Aba de técnicas já está visível");
        setTimeout(() => {
            inicializarTecnicas();
            observarPericias();
        }, 500);
    }
});

// ===== 10. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.renderizarTecnicas = renderizarTecnicas;

console.log("✅ TÉCNICAS.JS - SISTEMA NATURAL PRONTO");