// ============================================
// TÉCNICAS.JS - SISTEMA INTEGRADO COM PERÍCIAS
// ============================================

console.log("🎯 TÉCNICAS.JS - INICIANDO SISTEMA INTEGRADO");

// ===== 1. CATÁLOGO DE TÉCNICAS =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Permite atirar com arco enquanto cavalga. Penalidade base de -4 para usar arco montado. Cada ponto investido reduz esta penalidade. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "arco", // ID da perícia base (em minúsculas)
        atributo: "DX",
        modificadorBase: -4, // Penalidade base
        prereq: [
            { 
                tipo: "pericia", 
                id: "arco", // ID da perícia Arco
                nivelMinimo: 1 // Precisa ter a perícia (qualquer nível)
            },
            { 
                tipo: "pericia", 
                id: "grupo-cavalgar", // ID do grupo Cavalgar
                nomeEspecializacao: "Cavalo", // Especialização específica
                nivelMinimo: 1 
            }
        ],
        custoTabela: {
            1: 1,  // 1 ponto = +1 nível (Média)
            2: 1,  // 2 pontos = +1 nível (Difícil)
            3: 2,  // 3 pontos = +2 níveis (Difícil)
            4: 3,  // 4 pontos = +3 níveis (Difícil)
            5: 4   // 5 pontos = +4 níveis (Difícil)
        },
        regraEspecial: "Os modificadores para disparar sobre um cavalo nunca podem reduzir o NH em Arco abaixo do NH do personagem em Arquearia Montada."
    }
];

// ===== 2. ESTADO DO SISTEMA =====
let estadoTecnicas = {
    aprendidas: [],
    pontosTotais: 0,
    modalAberto: false,
    tecnicaEditando: null
};

// ===== 3. CONEXÃO COM O SISTEMA DE PERÍCIAS =====

// Função para buscar perícias aprendidas do seu sistema
function obterPericiasAprendidas() {
    try {
        // TENTATIVA 1: Buscar do localStorage (provavelmente onde suas perícias estão)
        const periciasSalvas = localStorage.getItem('pericias_aprendidas');
        if (periciasSalvas) {
            return JSON.parse(periciasSalvas);
        }
        
        // TENTATIVA 2: Buscar da variável global do seu sistema
        if (window.periciasPersonagem && Array.isArray(window.periciasPersonagem)) {
            return window.periciasPersonagem;
        }
        
        // TENTATIVA 3: Extrair da DOM
        const container = document.getElementById('pericias-aprendidas');
        if (container) {
            return extrairPericiasDaDOM(container);
        }
        
        console.warn("⚠️ Não encontrei perícias aprendidas, retornando array vazio");
        return [];
        
    } catch (error) {
        console.error("❌ Erro ao obter perícias:", error);
        return [];
    }
}

// Função para extrair perícias da DOM (caso estejam renderizadas)
function extrairPericiasDaDOM(container) {
    const pericias = [];
    const elementos = container.querySelectorAll('.pericia-aprendida-item');
    
    elementos.forEach(elemento => {
        const nomeElement = elemento.querySelector('.pericia-aprendida-nome');
        const nivelElement = elemento.querySelector('.nivel-display');
        const nomeEspecializacaoElement = elemento.querySelector('.especializacao-badge');
        
        if (nomeElement && nivelElement) {
            const pericia = {
                id: elemento.dataset.id || nomeElement.textContent.toLowerCase().replace(/ /g, '-'),
                nome: nomeElement.textContent.trim(),
                nivel: parseInt(nivelElement.textContent) || 0,
                especializacao: nomeEspecializacaoElement ? nomeEspecializacaoElement.textContent.trim() : null
            };
            pericias.push(pericia);
        }
    });
    
    return pericias;
}

// Função para obter o NH de uma perícia específica
function obterNHPericia(idPericia, especializacao = null) {
    const periciasAprendidas = obterPericiasAprendidas();
    
    // Buscar a perícia pelo ID ou nome
    const pericia = periciasAprendidas.find(p => {
        // Comparar por ID
        if (p.id === idPericia) return true;
        
        // Comparar por nome (sem acentos e minúsculas)
        const nomePericia = p.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const nomeBuscado = idPericia.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        if (nomePericia.includes(nomeBuscado) || nomeBuscado.includes(nomePericia)) {
            return true;
        }
        
        return false;
    });
    
    if (!pericia) {
        console.log(`📊 Perícia "${idPericia}" não encontrada, retornando default`);
        return 10; // Default se não tiver a perícia
    }
    
    // Se a perícia tem especialização, verificar se é a correta
    if (especializacao && pericia.especializacao) {
        if (pericia.especializacao.toLowerCase() !== especializacao.toLowerCase()) {
            console.log(`📊 Especialização incorreta: tem "${pericia.especializacao}", precisa "${especializacao}"`);
            return 10 - 2; // Penalidade por especialização errada
        }
    }
    
    return pericia.nivel;
}

// Função para verificar se tem os pré-requisitos
function verificarPreRequisitos(tecnica) {
    const resultados = [];
    const periciasAprendidas = obterPericiasAprendidas();
    
    tecnica.prereq.forEach(prereq => {
        if (prereq.tipo === 'pericia') {
            // Buscar a perícia
            const periciaEncontrada = periciasAprendidas.find(p => {
                // Comparar por ID
                if (p.id === prereq.id) return true;
                
                // Comparar por nome
                const nomePericia = p.nome.toLowerCase();
                const nomeBuscado = prereq.id.toLowerCase();
                
                return nomePericia.includes(nomeBuscado) || nomeBuscado.includes(nomePericia);
            });
            
            // Verificar especialização se necessário
            let cumprido = false;
            let nivelAtual = 0;
            
            if (periciaEncontrada) {
                nivelAtual = periciaEncontrada.nivel;
                
                // Verificar especialização
                if (prereq.nomeEspecializacao) {
                    cumprido = periciaEncontrada.especializacao === prereq.nomeEspecializacao;
                } else {
                    cumprido = nivelAtual >= prereq.nivelMinimo;
                }
            }
            
            resultados.push({
                descricao: prereq.nomeEspecializacao ? 
                    `${prereq.id} (${prereq.nomeEspecializacao})` : 
                    prereq.id,
                cumprido: cumprido,
                nivelAtual: nivelAtual,
                nivelNecessario: prereq.nivelMinimo,
                tipo: 'pericia'
            });
        }
    });
    
    return resultados;
}

// ===== 4. INICIALIZAÇÃO =====
function inicializarTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas integrado...");
    
    // Carregar dados salvos
    carregarTecnicas();
    
    // Configurar botões das sub-abas
    configurarSubAbas();
    
    // Configurar botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            console.log("🔄 Atualizando técnicas...");
            renderizarTodasTecnicas();
            mostrarNotificacao("Técnicas atualizadas!", "info");
        });
    }
    
    // Inicializar se a aba estiver ativa
    if (isAbaTecnicasAtiva()) {
        renderizarTodasTecnicas();
    }
    
    console.log("✅ Sistema de técnicas integrado inicializado");
}

// ===== 5. CONFIGURAÇÃO DAS SUB-ABAS =====
function configurarSubAbas() {
    const botoes = document.querySelectorAll('.subtab-btn-pericias');
    botoes.forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.preventDefault();
            const subtab = this.dataset.subtab;
            
            // Remover classe active de todos
            botoes.forEach(b => b.classList.remove('active'));
            // Adicionar ao clicado
            this.classList.add('active');
            
            // Esconder todos os painéis
            document.querySelectorAll('.subtab-pane-pericias').forEach(pane => {
                pane.classList.remove('active');
                pane.style.display = 'none';
            });
            
            // Mostrar painel correto
            const painel = document.getElementById(`subtab-${subtab}`);
            if (painel) {
                painel.classList.add('active');
                painel.style.display = 'block';
                
                // Se for a aba de técnicas, renderizar
                if (subtab === 'tecnicas') {
                    setTimeout(() => {
                        console.log("🔄 Renderizando técnicas na aba ativa...");
                        renderizarTodasTecnicas();
                    }, 100);
                }
            }
        });
    });
}

// ===== 6. VERIFICAÇÃO DA ABA ATIVA =====
function isAbaTecnicasAtiva() {
    const painel = document.getElementById('subtab-tecnicas');
    return painel && (painel.classList.contains('active') || window.getComputedStyle(painel).display !== 'none');
}

// ===== 7. CARREGAMENTO E SALVAMENTO =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_personagem');
        if (salvo) {
            const dados = JSON.parse(salvo);
            estadoTecnicas.aprendidas = dados.aprendidas || [];
            estadoTecnicas.pontosTotais = dados.pontosTotais || 0;
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
        estadoTecnicas = { aprendidas: [], pontosTotais: 0, modalAberto: false, tecnicaEditando: null };
    }
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicas_personagem', JSON.stringify({
            aprendidas: estadoTecnicas.aprendidas,
            pontosTotais: estadoTecnicas.pontosTotais
        }));
        console.log("💾 Técnicas salvas");
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

// ===== 8. RENDERIZAÇÃO PRINCIPAL =====
function renderizarTodasTecnicas() {
    console.log("🎨 Renderizando todas as técnicas...");
    
    if (!isAbaTecnicasAtiva()) {
        console.log("ℹ️ Aba de técnicas não está ativa");
        return;
    }
    
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado");
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
    
    // Para cada técnica no catálogo
    CATALOGO_TECNICAS.forEach(tecnica => {
        const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        const prereqCumpridos = verificarPreRequisitos(tecnica);
        const todosPreRequisitos = prereqCumpridos.every(p => p.cumprido);
        
        // Determinar status
        let statusClass, statusText, btnText, btnDisabled = false;
        
        if (tecnicaAprendida) {
            statusClass = 'aprendida';
            statusText = '✓ Aprendida';
            btnText = 'Editar Técnica';
        } else if (todosPreRequisitos) {
            statusClass = 'disponivel';
            statusText = 'Disponível';
            btnText = 'Adquirir Técnica';
        } else {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnDisabled = true;
        }
        
        // Formatar pré-requisitos para exibição
        const prereqText = tecnica.prereq.map(p => {
            if (p.tipo === 'pericia') {
                if (p.nomeEspecializacao) {
                    return `${p.id} (${p.nomeEspecializacao})`;
                }
                return p.id;
            }
            return p.nome;
        }).join(', ');
        
        // Formatar custo baseado na dificuldade
        let custoText;
        if (tecnica.dificuldade === 'Difícil') {
            custoText = '2 pts por +1 nível';
        } else if (tecnica.dificuldade === 'Média') {
            custoText = '1 pt por +1 nível';
        } else {
            custoText = '1/2 pt por +1 nível';
        }
        
        // Criar elemento
        const item = document.createElement('div');
        item.className = 'tecnica-item';
        item.dataset.id = tecnica.id;
        
        item.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome-container">
                    <div class="tecnica-nome">
                        <i class="${tecnica.icone || 'fas fa-tools'}"></i>
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
                    <span>Perícia: ${tecnica.periciaBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-chart-line"></i>
                    <span>Mod: ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-coins"></i>
                    <span>${custoText}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                <span>${prereqText}</span>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica ${tecnicaAprendida ? 'btn-editar' : 'btn-adquirir'}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${btnDisabled ? 'disabled' : ''}>
                    <i class="fas fa-${tecnicaAprendida ? 'edit' : 'plus-circle'}"></i> 
                    ${btnText}
                </button>
            </div>
        `;
        
        // Adicionar tooltip se estiver bloqueada
        if (!todosPreRequisitos && !tecnicaAprendida) {
            item.title = "Pré-requisitos não cumpridos";
            item.style.opacity = "0.7";
            item.style.cursor = "not-allowed";
        }
        
        container.appendChild(item);
    });
    
    // Atualizar contador
    const contador = document.getElementById('contador-tecnicas');
    if (contador) {
        contador.textContent = `${CATALOGO_TECNICAS.length} técnicas`;
    }
    
    console.log(`✅ ${CATALOGO_TECNICAS.length} técnica(s) renderizada(s) no catálogo`);
}

function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error("❌ Container #tecnicas-aprendidas não encontrado");
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
        
        // Obter NH da perícia base REAL
        const nhPericiaBase = obterNHPericia(tecnicaBase.periciaBase);
        
        // Calcular NH da técnica (nunca pode exceder o NH da perícia base)
        const nhTecnica = Math.min(
            nhPericiaBase + tecnicaAprendida.niveis + tecnicaBase.modificadorBase,
            nhPericiaBase
        );
        
        // Calcular limite (máximo que pode ter considerando o NH atual)
        const limiteNiveis = Math.max(0, nhPericiaBase - (nhPericiaBase + tecnicaBase.modificadorBase));
        
        const item = document.createElement('div');
        item.className = 'tecnica-aprendida-item';
        item.dataset.id = tecnicaAprendida.id;
        
        item.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${tecnicaBase.icone || 'fas fa-tools'}"></i>
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
            
            <div class="tecnica-aprendida-controles">
                <div class="nivel-info">
                    <span>Limite: NH ${tecnicaBase.periciaBase} = ${nhPericiaBase}</span>
                </div>
                <div class="tecnica-actions">
                    <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s) renderizada(s)`);
}

function atualizarEstatisticasTecnicas() {
    // Atualizar contadores
    const totalTecnicas = document.getElementById('total-tecnicas');
    const pontosTecnicas = document.getElementById('pontos-tecnicas');
    const pontosAprendidas = document.getElementById('pontos-tecnicas-aprendidas');
    const custoTotal = document.getElementById('custo-total-tecnicas');
    const nivelMedio = document.getElementById('nivel-medio-tecnicas');
    
    if (totalTecnicas) totalTecnicas.textContent = estadoTecnicas.aprendidas.length;
    if (pontosTecnicas) pontosTecnicas.textContent = estadoTecnicas.pontosTotais;
    if (pontosAprendidas) pontosAprendidas.textContent = `${estadoTecnicas.pontosTotais} pts`;
    
    // Calcular custo total e nível médio
    const custoTotalValor = estadoTecnicas.aprendidas.reduce((total, t) => total + t.pontos, 0);
    if (custoTotal) custoTotal.textContent = custoTotalValor;
    
    if (nivelMedio && estadoTecnicas.aprendidas.length > 0) {
        const media = estadoTecnicas.aprendidas.reduce((total, t) => total + t.niveis, 0) / estadoTecnicas.aprendidas.length;
        nivelMedio.textContent = media.toFixed(1);
    }
}

// ===== 9. MODAL DE TÉCNICA =====
function abrirModalTecnica(id, modoEdicao = false) {
    console.log(`📖 Abrindo modal para técnica: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error(`❌ Técnica ${id} não encontrada`);
        mostrarNotificacao("Técnica não encontrada!", "error");
        return;
    }
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    estadoTecnicas.tecnicaEditando = tecnica;
    estadoTecnicas.modalAberto = true;
    
    // Obter overlay e modal
    const overlay = document.getElementById('modal-tecnica-overlay');
    const modal = document.getElementById('modal-tecnica');
    
    if (!overlay || !modal) {
        console.error("❌ Modal de técnica não encontrado no HTML");
        mostrarNotificacao("Erro: Modal não encontrado!", "error");
        return;
    }
    
    // Obter NH da perícia base REAL
    const nhPericiaBase = obterNHPericia(tecnica.periciaBase);
    
    // Verificar pré-requisitos
    const prereqStatus = verificarPreRequisitos(tecnica);
    const todosPreRequisitos = prereqStatus.every(p => p.cumprido);
    
    // Carregar template
    const template = document.getElementById('template-modal-tecnica');
    if (!template) {
        console.error("❌ Template do modal não encontrado");
        return;
    }
    
    // Clonar template
    const modalContent = template.content.cloneNode(true);
    
    // Preencher dados básicos
    modalContent.querySelector('.modal-tecnica-nome').textContent = tecnica.nome;
    modalContent.querySelector('.modal-tecnica-dificuldade').textContent = tecnica.dificuldade;
    modalContent.querySelector('.modal-tecnica-pericia').textContent = tecnica.periciaBase;
    modalContent.querySelector('.modal-tecnica-modificador').textContent = tecnica.modificadorBase >= 0 ? '+' + tecnica.modificadorBase : tecnica.modificadorBase;
    
    // Formatar pré-requisitos
    const prereqText = tecnica.prereq.map(p => {
        if (p.tipo === 'pericia') {
            if (p.nomeEspecializacao) {
                return `${p.id} (${p.nomeEspecializacao})`;
            }
            return p.id;
        }
        return p.nome;
    }).join(', ');
    modalContent.querySelector('.modal-tecnica-prereq').textContent = prereqText;
    
    // Descrição
    modalContent.querySelector('.modal-tecnica-descricao-texto').textContent = tecnica.descricao;
    
    // Status dos pré-requisitos
    const prereqContainer = modalContent.querySelector('.prereq-status-list');
    prereqContainer.innerHTML = '';
    
    prereqStatus.forEach(status => {
        const item = document.createElement('div');
        item.className = `prereq-status-item ${status.cumprido ? 'cumprido' : 'nao-cumprido'}`;
        
        item.innerHTML = `
            <i class="fas fa-${status.cumprido ? 'check' : 'times'}"></i>
            <span class="prereq-status-text">${status.descricao}</span>
            <span class="prereq-status-nivel">${status.tipo === 'pericia' ? `(NH ${status.nivelAtual})` : ''}</span>
        `;
        
        prereqContainer.appendChild(item);
    });
    
    // Configurar NH base
    modalContent.querySelector('#nh-base-tecnica').textContent = nhPericiaBase;
    
    // Configurar opções de pontos
    const opcoesPontos = modalContent.querySelectorAll('.opcao-pontos');
    let opcaoSelecionada = null;
    
    opcoesPontos.forEach(opcao => {
        const pontos = parseInt(opcao.dataset.pontos);
        const niveis = parseInt(opcao.dataset.niveis);
        
        // Verificar se esta opção é válida para a dificuldade
        const custoPorNivel = tecnica.dificuldade === 'Difícil' ? 2 : 1;
        const pontosNecessarios = niveis * custoPorNivel;
        
        if (pontos === pontosNecessarios) {
            opcao.style.display = 'block';
            
            opcao.addEventListener('click', () => {
                // Remover seleção de todas
                opcoesPontos.forEach(o => o.classList.remove('selecionado'));
                // Selecionar esta
                opcao.classList.add('selecionado');
                opcaoSelecionada = { pontos, niveis };
                
                // Calcular NH total
                const nhMod = tecnica.modificadorBase + niveis;
                const nhTotal = Math.min(nhPericiaBase + nhMod, nhPericiaBase);
                
                // Atualizar display
                modalContent.querySelector('#nh-mod-tecnica').textContent = nhMod >= 0 ? '+' + nhMod : nhMod;
                modalContent.querySelector('#nh-total-tecnica').textContent = nhTotal;
                modalContent.querySelector('#resumo-pontos').textContent = pontos;
                modalContent.querySelector('#resumo-niveis').textContent = '+' + niveis;
                modalContent.querySelector('#resumo-nh').textContent = nhTotal;
                modalContent.querySelector('#modal-custo-total-tecnica').textContent = pontos;
                
                // Habilitar/desabilitar botão
                const btnConfirmar = modalContent.querySelector('#btn-confirmar-tecnica');
                if (btnConfirmar) {
                    btnConfirmar.disabled = !todosPreRequisitos;
                    if (todosPreRequisitos) {
                        btnConfirmar.onclick = () => confirmarTecnica(id, pontos, niveis, nhTotal);
                    }
                }
            });
        } else {
            opcao.style.display = 'none';
        }
    });
    
    // Se estiver editando, selecionar valores atuais
    if (tecnicaAprendida && modoEdicao) {
        const pontosAtuais = tecnicaAprendida.pontos;
        const opcaoCorrespondente = Array.from(opcoesPontos).find(o => 
            parseInt(o.dataset.pontos) === pontosAtuais
        );
        
        if (opcaoCorrespondente) {
            setTimeout(() => opcaoCorrespondente.click(), 100);
        }
        
        // Atualizar texto do botão
        const btnConfirmar = modalContent.querySelector('#btn-confirmar-tecnica');
        if (btnConfirmar) {
            btnConfirmar.innerHTML = '<i class="fas fa-save"></i> Atualizar Técnica';
        }
    }
    
    // Configurar botão de confirmação
    const btnConfirmar = modalContent.querySelector('#btn-confirmar-tecnica');
    if (btnConfirmar) {
        if (!todosPreRequisitos) {
            btnConfirmar.disabled = true;
            btnConfirmar.title = "Pré-requisitos não cumpridos";
        } else if (modoEdicao) {
            btnConfirmar.innerHTML = '<i class="fas fa-save"></i> Atualizar Técnica';
        }
    }
    
    // Limpar modal anterior e inserir novo conteúdo
    modal.innerHTML = '';
    modal.appendChild(modalContent);
    
    // Mostrar modal
    overlay.style.display = 'flex';
    modal.querySelector('.modal-tecnica-content').style.display = 'block';
    
    // Selecionar primeira opção por padrão
    if (opcoesPontos.length > 0 && !opcaoSelecionada) {
        setTimeout(() => {
            const primeiraOpcao = modal.querySelector('.opcao-pontos[style*="block"]');
            if (primeiraOpcao) primeiraOpcao.click();
        }, 100);
    }
    
    console.log("✅ Modal de técnica aberto");
}

function confirmarTecnica(id, pontos, niveis, nhTotal) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    // Verificar pré-requisitos novamente
    const prereqStatus = verificarPreRequisitos(tecnica);
    const todosPreRequisitos = prereqStatus.every(p => p.cumprido);
    
    if (!todosPreRequisitos) {
        mostrarNotificacao("Pré-requisitos não cumpridos!", "error");
        return;
    }
    
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    
    // Calcular diferença de pontos
    let pontosAntigos = 0;
    if (indexExistente >= 0) {
        pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
    }
    
    const diferencaPontos = pontos - pontosAntigos;
    
    // Verificar se tem pontos suficientes (você precisa integrar com seu sistema)
    // Por enquanto, assumimos que tem pontos ilimitados
    const podeComprar = true; // Altere para sua verificação real
    
    if (!podeComprar) {
        mostrarNotificacao("Pontos insuficientes!", "error");
        return;
    }
    
    // Criar/atualizar técnica aprendida
    const tecnicaAprendida = {
        id: id,
        nome: tecnica.nome,
        pontos: pontos,
        niveis: niveis,
        nh: nhTotal,
        periciaBase: tecnica.periciaBase,
        dataAquisição: new Date().toISOString()
    };
    
    if (indexExistente >= 0) {
        estadoTecnicas.aprendidas[indexExistente] = tecnicaAprendida;
        console.log(`📝 Técnica ${tecnica.nome} atualizada`);
    } else {
        estadoTecnicas.aprendidas.push(tecnicaAprendida);
        console.log(`🎯 Técnica ${tecnica.nome} adquirida`);
    }
    
    // Atualizar pontos totais
    estadoTecnicas.pontosTotais += diferencaPontos;
    
    // Salvar
    salvarTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Atualizar interface
    renderizarTodasTecnicas();
    
    // Mostrar notificação
    const acao = indexExistente >= 0 ? 'atualizada' : 'adquirida';
    mostrarNotificacao(`✅ ${tecnica.nome} ${acao} por ${pontos} pontos!`, 'success');
}

function editarTecnica(id) {
    abrirModalTecnica(id, true);
}

function removerTecnica(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica? Os pontos serão devolvidos.')) return;
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnicaRemovida = estadoTecnicas.aprendidas[index];
    
    // Remover pontos
    estadoTecnicas.pontosTotais -= tecnicaRemovida.pontos;
    
    // Remover do array
    estadoTecnicas.aprendidas.splice(index, 1);
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar interface
    renderizarTodasTecnicas();
    
    // Notificação
    mostrarNotificacao(`🗑️ ${tecnicaRemovida.nome} removida! ${tecnicaRemovida.pontos} pontos devolvidos.`, 'info');
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    const modal = document.getElementById('modal-tecnica');
    
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.innerHTML = '<div class="modal-tecnica-loading"><i class="fas fa-spinner fa-spin"></i><p>Carregando técnica...</p></div>';
    
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaEditando = null;
}

// ===== 10. NOTIFICAÇÕES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remover notificações antigas
    document.querySelectorAll('.notificacao-tecnica').forEach(n => n.remove());
    
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-tecnica notificacao-${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notificacao);
    
    // Mostrar com animação
    setTimeout(() => {
        notificacao.classList.add('show');
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// ===== 11. INICIALIZAÇÃO AO CARREGAR =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando sistema de técnicas");
    
    // Configurar clique nas abas
    const botoesAbas = document.querySelectorAll('.subtab-btn-pericias');
    botoesAbas.forEach(botao => {
        botao.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(() => {
                    console.log("🔄 Inicializando técnicas na aba...");
                    inicializarTecnicas();
                }, 200);
            }
        });
    });
    
    // Se a aba já estiver ativa, inicializar agora
    if (isAbaTecnicasAtiva()) {
        console.log("✅ Aba de técnicas já ativa - inicializando...");
        setTimeout(inicializarTecnicas, 500);
    }
    
    // Fechar modal ao clicar no overlay
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal-tecnica-overlay')) {
            fecharModalTecnica();
        }
    });
    
    // Fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && estadoTecnicas.modalAberto) {
            fecharModalTecnica();
        }
    });
    
    // Botão de debug (remova em produção)
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🔧 Debug Técnicas';
    debugBtn.style.cssText = `
        position: fixed;
        bottom: 60px;
        left: 10px;
        background: #FF9800;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9998;
        font-family: 'Cinzel', serif;
        font-size: 12px;
    `;
    debugBtn.onclick = () => {
        console.log("🔍 DEBUG TÉCNICAS:");
        console.log("- Estado:", estadoTecnicas);
        console.log("- Perícias aprendidas:", obterPericiasAprendidas());
        console.log("- Pré-req Arquearia Montada:", verificarPreRequisitos(CATALOGO_TECNICAS[0]));
        mostrarNotificacao("Debug: verifique o console!", "info");
    };
    document.body.appendChild(debugBtn);
});

// ===== 12. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.obterPericiasAprendidas = obterPericiasAprendidas;
window.verificarPreRequisitos = verificarPreRequisitos;

console.log("✅ TÉCNICAS.JS - SISTEMA INTEGRADO PRONTO");