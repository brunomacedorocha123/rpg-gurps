// ============================================
// TÉCNICAS.JS - SISTEMA COMPLETO
// ============================================

console.log("🎯 TÉCNICAS.JS - CARREGANDO SISTEMA DE TÉCNICAS");

// ===== 1. CATÁLOGO DE TÉCNICAS (DADOS) =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Permite atirar com arco enquanto cavalga. Penalidade base de -4 para usar arco montado. Cada ponto investido reduz esta penalidade. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        modificadorBase: -4, // Penalidade base
        prereq: [
            { tipo: "pericia", nome: "Arco", nivelMinimo: 4 },
            { tipo: "pericia", nome: "Cavalgar", nivelMinimo: 1 }
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

// ===== 3. INICIALIZAÇÃO =====
function inicializarTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar dados salvos
    carregarTecnicas();
    
    // Configurar botões das sub-abas
    configurarSubAbas();
    
    // Carregar templates
    carregarTemplates();
    
    // Inicializar se a aba estiver ativa
    if (isAbaTecnicasAtiva()) {
        renderizarTodasTecnicas();
    }
    
    console.log("✅ Sistema de técnicas inicializado");
}

// ===== 4. CONFIGURAÇÃO DAS SUB-ABAS =====
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
                    setTimeout(renderizarTodasTecnicas, 100);
                }
            }
        });
    });
}

// ===== 5. VERIFICAÇÃO DA ABA ATIVA =====
function isAbaTecnicasAtiva() {
    const painel = document.getElementById('subtab-tecnicas');
    return painel && (painel.classList.contains('active') || painel.style.display !== 'none');
}

// ===== 6. CARREGAMENTO DE DADOS =====
function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_personagem');
        if (salvo) {
            estadoTecnicas = JSON.parse(salvo);
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
        estadoTecnicas = { aprendidas: [], pontosTotais: 0, modalAberto: false, tecnicaEditando: null };
    }
}

function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicas_personagem', JSON.stringify(estadoTecnicas));
        console.log("💾 Técnicas salvas");
    } catch (e) {
        console.error("❌ Erro ao salvar técnicas:", e);
    }
}

// ===== 7. CARREGAR TEMPLATES =====
function carregarTemplates() {
    // Verificar se templates existem, se não criar
    if (!document.getElementById('template-item-tecnica')) {
        console.warn("⚠️ Templates não encontrados, criando dinamicamente...");
        criarTemplatesDinamicamente();
    }
}

function criarTemplatesDinamicamente() {
    // Criar template para item de técnica
    const template = document.createElement('template');
    template.id = 'template-item-tecnica';
    template.innerHTML = `
        <div class="tecnica-item" data-id="{id}">
            <div class="tecnica-header">
                <div class="tecnica-nome-container">
                    <div class="tecnica-nome">{nome}</div>
                    <div class="tecnica-tags">
                        <span class="tecnica-dificuldade {dificuldade-class}">{dificuldade}</span>
                        <span class="tecnica-tipo">{periciaBase}</span>
                    </div>
                </div>
                <div class="tecnica-status">
                    <span class="tecnica-status-badge {status-class}">{status-text}</span>
                </div>
            </div>
            
            <div class="tecnica-descricao">
                <p>{descricao}</p>
            </div>
            
            <div class="tecnica-info-rapida">
                <div class="info-item">
                    <i class="fas fa-bullseye"></i>
                    <span>Base: {periciaBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-arrow-up"></i>
                    <span>Mod: {modificadorBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-coins"></i>
                    <span>Custo: {custo-text}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                <span>{prereq-text}</span>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica btn-adquirir" onclick="abrirModalTecnica('{id}')">
                    <i class="fas fa-plus-circle"></i> {btn-text}
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(template);
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
    
    // Para cada técnica no catálogo
    CATALOGO_TECNICAS.forEach(tecnica => {
        const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        const prereqCumpridos = verificarPreRequisitos(tecnica);
        const todosPreRequisitos = prereqCumpridos.every(p => p.cumprido);
        
        // Determinar status
        let statusClass, statusText, btnText;
        
        if (tecnicaAprendida) {
            statusClass = 'aprendida';
            statusText = '✓ Aprendida';
            btnText = 'Editar';
        } else if (todosPreRequisitos) {
            statusClass = 'disponivel';
            statusText = 'Disponível';
            btnText = 'Adquirir';
        } else {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
        }
        
        // Formatar pré-requisitos para exibição
        const prereqText = tecnica.prereq.map(p => {
            if (p.tipo === 'pericia') {
                return p.nivelMinimo > 1 ? `${p.nome} ${p.nivelMinimo}+` : p.nome;
            }
            return p.nome;
        }).join(', ');
        
        // Formatar custo
        const custoText = tecnica.dificuldade === 'Difícil' ? 
            '2 pts/nível' : '1 pt/nível';
        
        // Criar elemento (usando template ou manualmente)
        const item = document.createElement('div');
        item.className = 'tecnica-item';
        item.dataset.id = tecnica.id;
        
        item.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome-container">
                    <div class="tecnica-nome">${tecnica.nome}</div>
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
                    <span>Mod: ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-coins"></i>
                    <span>Custo: ${custoText}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                <span>${prereqText}</span>
            </div>
            
            <div class="tecnica-actions">
                <button class="btn-tecnica btn-adquirir" onclick="abrirModalTecnica('${tecnica.id}')" ${!todosPreRequisitos && !tecnicaAprendida ? 'disabled' : ''}>
                    <i class="fas fa-plus-circle"></i> ${btnText}
                </button>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Atualizar contador
    const contador = document.getElementById('contador-tecnicas');
    if (contador) {
        contador.textContent = `${CATALOGO_TECNICAS.length} técnicas`;
    }
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
        
        // Calcular NH da perícia base (simulado - você precisará integrar com seu sistema de perícias)
        const nhPericiaBase = calcularNHPericiaBase(tecnicaBase.periciaBase);
        const nhTecnica = Math.min(nhPericiaBase + tecnicaAprendida.niveis, nhPericiaBase);
        
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
                    <strong>${tecnicaBase.periciaBase}</strong>
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
}

// ===== 9. FUNÇÕES AUXILIARES =====
function verificarPreRequisitos(tecnica) {
    const resultados = [];
    
    tecnica.prereq.forEach(prereq => {
        if (prereq.tipo === 'pericia') {
            // Aqui você precisa integrar com seu sistema de perícias
            // Por enquanto, simularemos
            const temPericia = true; // Supondo que tem
            const nivelPericia = 10; // Nível simulado
            
            const cumprido = temPericia && nivelPericia >= prereq.nivelMinimo;
            
            resultados.push({
                descricao: `${prereq.nome} ${prereq.nivelMinimo}+`,
                cumprido: cumprido,
                nivelAtual: nivelPericia,
                nivelNecessario: prereq.nivelMinimo
            });
        }
    });
    
    return resultados;
}

function calcularNHPericiaBase(nomePericia) {
    // INTEGRAÇÃO NECESSÁRIA: Você precisa conectar com seu sistema de perícias
    // Por enquanto, retornamos um valor simulado
    return 12; // NH simulado da perícia Arco
}

function atualizarEstatisticasTecnicas() {
    // Atualizar contadores
    const totalTecnicas = document.getElementById('total-tecnicas');
    const pontosTecnicas = document.getElementById('pontos-tecnicas');
    const pontosAprendidas = document.getElementById('pontos-tecnicas-aprendidas');
    const custoTotal = document.getElementById('custo-total-tecnicas');
    
    if (totalTecnicas) totalTecnicas.textContent = estadoTecnicas.aprendidas.length;
    if (pontosTecnicas) pontosTecnicas.textContent = estadoTecnicas.pontosTotais;
    if (pontosAprendidas) pontosAprendidas.textContent = `${estadoTecnicas.pontosTotais} pts`;
    
    // Calcular custo total
    const custoTotalValor = estadoTecnicas.aprendidas.reduce((total, t) => total + t.pontos, 0);
    if (custoTotal) custoTotal.textContent = custoTotalValor;
    
    // Calcular nível médio
    const nivelMedio = document.getElementById('nivel-medio-tecnicas');
    if (nivelMedio && estadoTecnicas.aprendidas.length > 0) {
        const media = estadoTecnicas.aprendidas.reduce((total, t) => total + t.niveis, 0) / estadoTecnicas.aprendidas.length;
        nivelMedio.textContent = media.toFixed(1);
    }
}

// ===== 10. MODAL DE TÉCNICA =====
function abrirModalTecnica(id, modoEdicao = false) {
    console.log(`📖 Abrindo modal para técnica: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error(`❌ Técnica ${id} não encontrada`);
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
        return;
    }
    
    // Carregar template do modal
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
            return p.nivelMinimo > 1 ? `${p.nome} ${p.nivelMinimo}+` : p.nome;
        }
        return p.nome;
    }).join(', ');
    modalContent.querySelector('.modal-tecnica-prereq').textContent = prereqText;
    
    // Descrição
    modalContent.querySelector('.modal-tecnica-descricao-texto').textContent = tecnica.descricao;
    
    // Verificar pré-requisitos
    const prereqStatus = verificarPreRequisitos(tecnica);
    const prereqContainer = modalContent.querySelector('.prereq-status-list');
    
    prereqStatus.forEach(status => {
        const item = document.createElement('div');
        item.className = `prereq-status-item ${status.cumprido ? 'cumprido' : 'nao-cumprido'}`;
        
        item.innerHTML = `
            <i class="fas fa-${status.cumprido ? 'check' : 'times'}"></i>
            <span class="prereq-status-text">${status.descricao}</span>
            <span class="prereq-status-nivel">(${status.nivelAtual}/${status.nivelNecessario})</span>
        `;
        
        prereqContainer.appendChild(item);
    });
    
    // Calcular NH da perícia base
    const nhBase = calcularNHPericiaBase(tecnica.periciaBase);
    modalContent.querySelector('#nh-base-tecnica').textContent = nhBase;
    
    // Configurar opções de pontos
    const opcoesPontos = modalContent.querySelectorAll('.opcao-pontos');
    opcoesPontos.forEach(opcao => {
        const pontos = parseInt(opcao.dataset.pontos);
        const niveis = parseInt(opcao.dataset.niveis);
        
        opcao.addEventListener('click', () => {
            // Remover seleção de todas
            opcoesPontos.forEach(o => o.classList.remove('selecionado'));
            // Selecionar esta
            opcao.classList.add('selecionado');
            
            // Calcular NH total
            const nhMod = tecnica.modificadorBase + niveis;
            const nhTotal = nhBase + nhMod;
            
            // Atualizar display
            modalContent.querySelector('#nh-mod-tecnica').textContent = nhMod >= 0 ? '+' + nhMod : nhMod;
            modalContent.querySelector('#nh-total-tecnica').textContent = nhTotal;
            modalContent.querySelector('#resumo-pontos').textContent = pontos;
            modalContent.querySelector('#resumo-niveis').textContent = '+' + niveis;
            modalContent.querySelector('#resumo-nh').textContent = nhTotal;
            modalContent.querySelector('#modal-custo-total-tecnica').textContent = pontos;
            
            // Habilitar botão se pré-requisitos cumpridos
            const todosCumpridos = prereqStatus.every(p => p.cumprido);
            const btnConfirmar = modalContent.querySelector('#btn-confirmar-tecnica');
            
            if (btnConfirmar) {
                btnConfirmar.disabled = !todosCumpridos;
                if (todosCumpridos) {
                    btnConfirmar.onclick = () => confirmarTecnica(id, pontos, niveis, nhTotal);
                }
            }
        });
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
    
    // Limpar modal anterior e inserir novo conteúdo
    modal.innerHTML = '';
    modal.appendChild(modalContent);
    
    // Mostrar modal
    overlay.style.display = 'flex';
    modal.querySelector('.modal-tecnica-content').style.display = 'block';
    
    console.log("✅ Modal de técnica aberto");
}

function confirmarTecnica(id, pontos, niveis, nhTotal) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    
    // Calcular custo total (subtrair pontos antigos se estiver editando)
    let custoDiferenca = pontos;
    if (indexExistente >= 0) {
        custoDiferenca = pontos - estadoTecnicas.aprendidas[indexExistente].pontos;
    }
    
    // Verificar se tem pontos suficientes (você precisa integrar com seu sistema de pontos)
    const pontosDisponiveis = 100; // Simulado - integre com seu sistema
    
    if (estadoTecnicas.pontosTotais + custoDiferenca > pontosDisponiveis) {
        mostrarNotificacao('Pontos insuficientes!', 'error');
        return;
    }
    
    // Criar/atualizar técnica aprendida
    const tecnicaAprendida = {
        id: id,
        nome: tecnica.nome,
        pontos: pontos,
        niveis: niveis,
        nh: nhTotal,
        dataAquisição: new Date().toISOString()
    };
    
    if (indexExistente >= 0) {
        estadoTecnicas.aprendidas[indexExistente] = tecnicaAprendida;
    } else {
        estadoTecnicas.aprendidas.push(tecnicaAprendida);
    }
    
    // Atualizar pontos totais
    estadoTecnicas.pontosTotais += custoDiferenca;
    
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
    if (!confirm('Tem certeza que deseja remover esta técnica?')) return;
    
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
    mostrarNotificacao(`🗑️ ${tecnicaRemovida.nome} removida!`, 'info');
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    const modal = document.getElementById('modal-tecnica');
    
    if (overlay) overlay.style.display = 'none';
    if (modal) modal.innerHTML = '<div class="modal-tecnica-loading"><i class="fas fa-spinner fa-spin"></i><p>Carregando técnica...</p></div>';
    
    estadoTecnicas.modalAberto = false;
    estadoTecnicas.tecnicaEditando = null;
}

// ===== 11. NOTIFICAÇÕES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-tecnica notificacao-${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    // Estilos inline para garantir funcionamento
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10003;
        font-family: 'Cinzel', serif;
        font-weight: bold;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        ${tipo === 'success' ? 'background: linear-gradient(145deg, #2E7D32, #1B5E20);' : 
          tipo === 'error' ? 'background: linear-gradient(145deg, #c62828, #b71c1c);' : 
          'background: linear-gradient(145deg, #0D47A1, #1565C0);'}
    `;
    
    document.body.appendChild(notificacao);
    
    // Mostrar
    setTimeout(() => {
        notificacao.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.transform = 'translateX(150%)';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// ===== 12. EVENT LISTENERS GLOBAIS =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando sistema de técnicas");
    
    // Inicializar após um pequeno delay para garantir que o DOM esteja pronto
    setTimeout(inicializarTecnicas, 500);
    
    // Configurar botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', renderizarTodasTecnicas);
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
});

// ===== 13. EXPORTAR FUNÇÕES PARA USO GLOBAL =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;

console.log("✅ TÉCNICAS.JS - SISTEMA PRONTO PARA USO");