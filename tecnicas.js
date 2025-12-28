// ============================================
// TÉCNICAS.JS - SISTEMA COMPLETO
// ============================================

console.log("🔥 TÉCNICAS.JS - INICIANDO");

// ===== 1. DETECTAR SE ESTÁ NA ABA CERTA =====
function verificarAbaTecnicas() {
    console.log("🔍 Verificando aba de técnicas...");
    
    // Procurar a aba de técnicas
    const tecnicaTab = document.getElementById('subtab-tecnicas');
    if (!tecnicaTab) {
        console.error("❌ Aba 'Técnicas' não encontrada!");
        console.log("Procurando elementos com 'tecnicas' no ID...");
        
        const elementos = document.querySelectorAll('[id*="tecnic"]');
        elementos.forEach(el => {
            console.log(`  Encontrado: #${el.id}`);
        });
        return false;
    }
    
    console.log("✅ Aba de técnicas encontrada!");
    
    // Verificar se está visível/ativa
    const estaAtiva = tecnicaTab.classList.contains('active') || 
                      tecnicaTab.style.display !== 'none';
    
    if (estaAtiva) {
        console.log("✅ Aba de técnicas está ativa!");
        return true;
    } else {
        console.log("ℹ️ Aba de técnicas não está ativa no momento");
        return false;
    }
}

// ===== 2. CATÁLOGO DE TÉCNICAS =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada ponto investido reduz esta penalidade.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        modificadorBase: -4,
        prereq: {
            arcoMinimo: 5,
            temCavalgar: true
        },
        custoTabela: {
            2: 1,  // 2 pontos = +1 nível
            3: 2,  // 3 pontos = +2 níveis
            4: 3,  // 4 pontos = +3 níveis
            5: 4   // 5 pontos = +4 níveis
        }
    }
];

// ===== 3. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],
    modalAtivo: false
};

// ===== 4. FUNÇÃO PRINCIPAL - RENDERIZAR TÉCNICAS =====
function renderizarTecnicas() {
    console.log("🎨 Renderizando técnicas...");
    
    // PRIMEIRO: Encontrar o container correto
    let container = document.getElementById('lista-tecnicas');
    
    // Se não encontrar, procurar alternativas
    if (!container) {
        console.warn("⚠️ #lista-tecnicas não encontrado, procurando alternativas...");
        
        // Procurar qualquer container que possa ser
        const possiveis = [
            '#lista-tecnicas',
            '#tecnicas-disponiveis',
            '[class*="lista-tecnicas"]',
            '[class*="catalogo-tecnicas"]',
            '#subtab-tecnicas .catalogo-card',
            '#subtab-tecnicas .lista-pericias-scroll'
        ];
        
        possiveis.forEach(seletor => {
            const el = document.querySelector(seletor);
            if (el && !container) {
                console.log(`✅ Usando alternativa: ${seletor}`);
                container = el;
            }
        });
    }
    
    if (!container) {
        console.error("❌ NÃO FOI POSSÍVEL ENCONTRAR O CONTAINER!");
        
        // Criar um container de emergência
        criarContainerEmergencia();
        return;
    }
    
    console.log(`✅ Container encontrado:`, container);
    
    // LIMPAR O CONTAINER
    container.innerHTML = '';
    
    // ADICIONAR CSS SE NECESSÁRIO
    adicionarCSStecnicas();
    
    // RENDERIZAR CADA TÉCNICA
    CATALOGO_TECNICAS.forEach(tecnica => {
        const tecnicaElement = criarElementoTecnica(tecnica);
        container.appendChild(tecnicaElement);
    });
    
    console.log(`✅ ${CATALOGO_TECNICAS.length} técnica(s) renderizada(s)`);
    
    // Atualizar técnicas aprendidas também
    renderizarTecnicasAprendidas();
}

// ===== 5. CRIAR ELEMENTO HTML DA TÉCNICA =====
function criarElementoTecnica(tecnica) {
    console.log(`🎨 Criando elemento para: ${tecnica.nome}`);
    
    const elemento = document.createElement('div');
    elemento.className = 'tecnica-item';
    elemento.dataset.id = tecnica.id;
    
    // Verificar se já foi aprendida
    const jaAprendida = estadoTecnicas.aprendidas.some(t => t.id === tecnica.id);
    
    elemento.innerHTML = `
        <div class="tecnica-header">
            <div class="tecnica-titulo">
                <i class="${tecnica.icone}"></i>
                <span class="tecnica-nome">${tecnica.nome}</span>
                <span class="tecnica-dificuldade-badge">${tecnica.dificuldade}</span>
            </div>
            ${jaAprendida ? 
                '<div class="tecnica-aprendida-badge"><i class="fas fa-check-circle"></i> Aprendida</div>' : 
                '<div class="tecnica-disponivel-badge"><i class="fas fa-unlock"></i> Disponível</div>'
            }
        </div>
        
        <div class="tecnica-descricao">
            <p>${tecnica.descricao}</p>
        </div>
        
        <div class="tecnica-detalhes">
            <div class="detalhe-item">
                <span class="detalhe-label">Perícia Base:</span>
                <span class="detalhe-valor">${tecnica.periciaBase}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label">Atributo:</span>
                <span class="detalhe-valor">${tecnica.atributo}</span>
            </div>
            <div class="detalhe-item">
                <span class="detalhe-label">Modificador Base:</span>
                <span class="detalhe-valor">${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</span>
            </div>
        </div>
        
        <div class="tecnica-prereq">
            <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
            <div class="prereq-item">
                <i class="fas fa-bullseye"></i>
                <span>${tecnica.periciaBase} NH ≥ ${tecnica.prereq.arcoMinimo}</span>
                <span class="prereq-status">(Verificando...)</span>
            </div>
            <div class="prereq-item">
                <i class="fas fa-horse-head"></i>
                <span>Perícia Cavalgar</span>
                <span class="prereq-status">(Verificando...)</span>
            </div>
        </div>
        
        <div class="tecnica-custo">
            <h4><i class="fas fa-coins"></i> Custo</h4>
            <div class="custo-tabela">
                <div class="custo-item"><span class="pontos">2 pts</span> = <span class="niveis">+1 nível</span></div>
                <div class="custo-item"><span class="pontos">3 pts</span> = <span class="niveis">+2 níveis</span></div>
                <div class="custo-item"><span class="pontos">4 pts</span> = <span class="niveis">+3 níveis</span></div>
                <div class="custo-item"><span class="pontos">5 pts</span> = <span class="niveis">+4 níveis</span></div>
            </div>
        </div>
        
        <div class="tecnica-acoes">
            ${jaAprendida ? 
                `<button class="btn-tecnica btn-editar" onclick="abrirModalTecnica('${tecnica.id}')">
                    <i class="fas fa-edit"></i> Editar Técnica
                </button>
                <button class="btn-tecnica btn-remover" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>` :
                `<button class="btn-tecnica btn-adquirir" onclick="abrirModalTecnica('${tecnica.id}')">
                    <i class="fas fa-plus-circle"></i> Adquirir Técnica
                </button>`
            }
        </div>
    `;
    
    // Adicionar evento de clique em toda a técnica
    elemento.addEventListener('click', function(e) {
        if (!e.target.closest('.btn-tecnica')) {
            abrirModalTecnica(tecnica.id);
        }
    });
    
    return elemento;
}

// ===== 6. RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    console.log("📚 Renderizando técnicas aprendidas...");
    
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.warn("⚠️ #tecnicas-aprendidas não encontrado");
        return;
    }
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica-aprendida">
                <i class="fas fa-tools"></i>
                <h4>Nenhuma técnica aprendida</h4>
                <p>Adquira técnicas para aprimorar suas habilidades especiais</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    estadoTecnicas.aprendidas.forEach(tecnica => {
        const dadosTecnica = CATALOGO_TECNICAS.find(t => t.id === tecnica.id);
        if (!dadosTecnica) return;
        
        const elemento = document.createElement('div');
        elemento.className = 'tecnica-aprendida-item';
        
        elemento.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${dadosTecnica.icone}"></i> ${dadosTecnica.nome}
                </div>
                <div class="tecnica-aprendida-nh">
                    NH ${tecnica.nhAtual || 10}
                </div>
            </div>
            
            <div class="tecnica-aprendida-detalhes">
                <div class="detalhe">
                    <span class="label">Investimento:</span>
                    <span class="valor">${tecnica.pontos} pontos</span>
                </div>
                <div class="detalhe">
                    <span class="label">Níveis:</span>
                    <span class="valor">+${tecnica.niveis || 0}</span>
                </div>
                <div class="detalhe">
                    <span class="label">Perícia Base:</span>
                    <span class="valor">${dadosTecnica.periciaBase}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-acoes">
                <button class="btn-aprendida-editar" onclick="abrirModalTecnica('${tecnica.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-aprendida-remover" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.appendChild(elemento);
    });
}

// ===== 7. FUNÇÕES DO MODAL =====
function abrirModalTecnica(id) {
    console.log(`📖 Abrindo modal para: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    estadoTecnicas.modalAtivo = true;
    
    // Criar modal
    const modalHTML = `
        <div class="modal-tecnica-overlay">
            <div class="modal-tecnica-content">
                <div class="modal-tecnica-header">
                    <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                    <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
                </div>
                
                <div class="modal-tecnica-body">
                    <div class="modal-info">
                        <p><strong>Descrição:</strong> ${tecnica.descricao}</p>
                        <p><strong>Dificuldade:</strong> ${tecnica.dificuldade}</p>
                        <p><strong>Perícia Base:</strong> ${tecnica.periciaBase} (${tecnica.atributo})</p>
                        <p><strong>Modificador Base:</strong> ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</p>
                    </div>
                    
                    <div class="modal-controle-pontos">
                        <h4>Selecionar Pontos</h4>
                        <div class="pontos-opcoes">
                            <button class="opcao-pontos" data-pontos="2" onclick="selecionarPontos(2)">2 pts = +1</button>
                            <button class="opcao-pontos" data-pontos="3" onclick="selecionarPontos(3)">3 pts = +2</button>
                            <button class="opcao-pontos" data-pontos="4" onclick="selecionarPontos(4)">4 pts = +3</button>
                            <button class="opcao-pontos" data-pontos="5" onclick="selecionarPontos(5)">5 pts = +4</button>
                        </div>
                    </div>
                    
                    <div class="modal-resumo">
                        <h4>Resumo</h4>
                        <p>Total: <strong id="pontos-selecionados">2</strong> pontos</p>
                        <p>Níveis: <strong id="niveis-selecionados">+1</strong></p>
                    </div>
                </div>
                
                <div class="modal-tecnica-footer">
                    <button class="btn-modal-cancelar" onclick="fecharModalTecnica()">
                        Cancelar
                    </button>
                    <button class="btn-modal-confirmar" onclick="confirmarCompraTecnica('${id}', 2)">
                        Confirmar - 2 pontos
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modalDiv = document.createElement('div');
    modalDiv.innerHTML = modalHTML;
    modalDiv.id = 'modal-tecnica-atual';
    document.body.appendChild(modalDiv);
    
    console.log("✅ Modal criado");
}

function selecionarPontos(pontos) {
    const botaoConfirmar = document.querySelector('.btn-modal-confirmar');
    if (botaoConfirmar) {
        botaoConfirmar.textContent = `Confirmar - ${pontos} pontos`;
        botaoConfirmar.onclick = () => confirmarCompraTecnica(estadoTecnicas.modalTecnicaId, pontos);
    }
    
    // Atualizar resumo
    const pontosElement = document.getElementById('pontos-selecionados');
    const niveisElement = document.getElementById('niveis-selecionados');
    
    if (pontosElement && niveisElement) {
        pontosElement.textContent = pontos;
        const niveis = CATALOGO_TECNICAS[0].custoTabela[pontos] || 0;
        niveisElement.textContent = `+${niveis}`;
    }
}

function confirmarCompraTecnica(id, pontos) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const niveis = tecnica.custoTabela[pontos] || 0;
    
    // Verificar se já existe
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    
    if (index >= 0) {
        // Atualizar técnica existente
        estadoTecnicas.aprendidas[index] = {
            id: id,
            nome: tecnica.nome,
            pontos: pontos,
            niveis: niveis,
            nhAtual: 10 + niveis // SIMULAÇÃO - depois calcula com base real
        };
    } else {
        // Adicionar nova técnica
        estadoTecnicas.aprendidas.push({
            id: id,
            nome: tecnica.nome,
            pontos: pontos,
            niveis: niveis,
            nhAtual: 10 + niveis // SIMULAÇÃO
        });
    }
    
    // Salvar
    salvarTecnicas();
    
    // Atualizar interface
    renderizarTecnicas();
    
    // Fechar modal
    fecharModalTecnica();
    
    // Mostrar mensagem
    mostrarNotificacao(`✅ ${tecnica.nome} adquirida por ${pontos} pontos!`, 'success');
}

function fecharModalTecnica() {
    const modal = document.getElementById('modal-tecnica-atual');
    if (modal) {
        modal.remove();
    }
    estadoTecnicas.modalAtivo = false;
}

function removerTecnica(id) {
    if (confirm('Remover esta técnica?')) {
        estadoTecnicas.aprendidas = estadoTecnicas.aprendidas.filter(t => t.id !== id);
        salvarTecnicas();
        renderizarTecnicas();
        mostrarNotificacao('🗑️ Técnica removida!', 'info');
    }
}

// ===== 8. FUNÇÕES AUXILIARES =====
function salvarTecnicas() {
    try {
        localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        console.log("💾 Técnicas salvas");
    } catch (e) {
        console.error("❌ Erro ao salvar:", e);
    }
}

function carregarTecnicas() {
    try {
        const salvo = localStorage.getItem('tecnicas_aprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar:", e);
    }
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-tecnica notificacao-${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => notificacao.classList.add('show'), 10);
    setTimeout(() => {
        notificacao.classList.remove('show');
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
}

// ===== 9. CSS PARA AS TÉCNICAS =====
function adicionarCSStecnicas() {
    if (document.getElementById('css-tecnicas')) return;
    
    const css = `
        <style id="css-tecnicas">
        /* ESTILOS PARA TÉCNICAS */
        .tecnica-item {
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border: 1px solid #0f3460;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
            color: #e6e6e6;
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .tecnica-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            border-color: #4cc9f0;
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
            font-size: 1.2em;
            font-weight: bold;
        }
        
        .tecnica-titulo i {
            color: #4cc9f0;
            font-size: 1.3em;
        }
        
        .tecnica-dificuldade-badge {
            background: #4361ee;
            color: white;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .tecnica-aprendida-badge {
            background: #4CAF50;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .tecnica-disponivel-badge {
            background: #2196F3;
            color: white;
            padding: 5px 10px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        
        .tecnica-descricao {
            margin: 15px 0;
            line-height: 1.5;
            color: #b8b8b8;
        }
        
        .tecnica-detalhes {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 15px 0;
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
        }
        
        .detalhe-item {
            text-align: center;
        }
        
        .detalhe-label {
            display: block;
            font-size: 0.9em;
            color: #8a8a8a;
            margin-bottom: 5px;
        }
        
        .detalhe-valor {
            display: block;
            font-weight: bold;
            color: #4cc9f0;
        }
        
        .tecnica-prereq {
            background: rgba(255, 255, 255, 0.03);
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
            border-left: 4px solid #4361ee;
        }
        
        .tecnica-prereq h4 {
            margin: 0 0 10px 0;
            color: #8a8a8a;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .prereq-item {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 8px 0;
            padding: 8px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 5px;
        }
        
        .prereq-item i {
            color: #4361ee;
            width: 20px;
        }
        
        .prereq-status {
            margin-left: auto;
            font-size: 0.9em;
            color: #8a8a8a;
        }
        
        .tecnica-custo {
            margin: 20px 0;
        }
        
        .tecnica-custo h4 {
            margin: 0 0 10px 0;
            color: #8a8a8a;
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .custo-tabela {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
        }
        
        .custo-item {
            background: linear-gradient(135deg, #4361ee, #3a0ca3);
            padding: 10px;
            border-radius: 5px;
            text-align: center;
        }
        
        .custo-item .pontos {
            font-weight: bold;
            color: #ffd166;
        }
        
        .custo-item .niveis {
            font-weight: bold;
            color: #06d6a0;
        }
        
        .tecnica-acoes {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        
        .btn-tecnica {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }
        
        .btn-adquirir {
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
            color: white;
        }
        
        .btn-adquirir:hover {
            background: linear-gradient(135deg, #66BB6A, #388E3C);
            transform: scale(1.05);
        }
        
        .btn-editar {
            background: linear-gradient(135deg, #2196F3, #0D47A1);
            color: white;
        }
        
        .btn-editar:hover {
            background: linear-gradient(135deg, #42A5F5, #1565C0);
            transform: scale(1.05);
        }
        
        .btn-remover {
            background: linear-gradient(135deg, #f44336, #c62828);
            color: white;
        }
        
        .btn-remover:hover {
            background: linear-gradient(135deg, #ef5350, #d32f2f);
            transform: scale(1.05);
        }
        
        /* TÉCNICAS APRENDIDAS */
        .tecnica-aprendida-item {
            background: linear-gradient(145deg, #1b3a4b, #144552);
            border: 1px solid #006466;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 10px;
            color: #e6e6e6;
        }
        
        .tecnica-aprendida-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .tecnica-aprendida-nome {
            font-weight: bold;
            font-size: 1.1em;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .tecnica-aprendida-nome i {
            color: #4cc9f0;
        }
        
        .tecnica-aprendida-nh {
            background: #006466;
            color: white;
            padding: 5px 10px;
            border-radius: 20px;
            font-weight: bold;
        }
        
        .tecnica-aprendida-detalhes {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
        }
        
        .tecnica-aprendida-detalhes .detalhe {
            text-align: center;
        }
        
        .tecnica-aprendida-detalhes .label {
            display: block;
            font-size: 0.8em;
            color: #8a8a8a;
            margin-bottom: 3px;
        }
        
        .tecnica-aprendida-detalhes .valor {
            display: block;
            font-weight: bold;
            color: #4cc9f0;
        }
        
        .tecnica-aprendida-acoes {
            display: flex;
            gap: 5px;
            justify-content: flex-end;
        }
        
        .btn-aprendida-editar, .btn-aprendida-remover {
            width: 35px;
            height: 35px;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .btn-aprendida-editar {
            background: #2196F3;
            color: white;
        }
        
        .btn-aprendida-editar:hover {
            background: #42A5F5;
            transform: scale(1.1);
        }
        
        .btn-aprendida-remover {
            background: #f44336;
            color: white;
        }
        
        .btn-aprendida-remover:hover {
            background: #ef5350;
            transform: scale(1.1);
        }
        
        /* MODAL */
        .modal-tecnica-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        
        .modal-tecnica-content {
            background: linear-gradient(145deg, #1a1a2e, #16213e);
            border: 2px solid #0f3460;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            color: #e6e6e6;
        }
        
        .modal-tecnica-header {
            padding: 20px;
            border-bottom: 1px solid #0f3460;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .modal-tecnica-header h3 {
            margin: 0;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .modal-tecnica-close {
            background: none;
            border: none;
            color: #8a8a8a;
            font-size: 1.5em;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
        }
        
        .modal-tecnica-close:hover {
            background: rgba(255, 255, 255, 0.1);
            color: white;
        }
        
        .modal-tecnica-body {
            padding: 20px;
        }
        
        .modal-tecnica-footer {
            padding: 20px;
            border-top: 1px solid #0f3460;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }
        
        .btn-modal-cancelar, .btn-modal-confirmar {
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-modal-cancelar {
            background: #6c757d;
            color: white;
        }
        
        .btn-modal-cancelar:hover {
            background: #5a6268;
        }
        
        .btn-modal-confirmar {
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
            color: white;
        }
        
        .btn-modal-confirmar:hover {
            background: linear-gradient(135deg, #66BB6A, #388E3C);
        }
        
        /* NOTIFICAÇÕES */
        .notificacao-tecnica {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10001;
            transform: translateX(150%);
            transition: transform 0.3s ease;
        }
        
        .notificacao-tecnica.show {
            transform: translateX(0);
        }
        
        .notificacao-success {
            background: linear-gradient(135deg, #4CAF50, #2E7D32);
        }
        
        .notificacao-info {
            background: linear-gradient(135deg, #2196F3, #0D47A1);
        }
        
        .notificacao-error {
            background: linear-gradient(135deg, #f44336, #c62828);
        }
        
        /* ESTADO VAZIO */
        .nenhuma-tecnica-aprendida {
            text-align: center;
            padding: 40px 20px;
            color: #8a8a8a;
        }
        
        .nenhuma-tecnica-aprendida i {
            font-size: 3em;
            margin-bottom: 15px;
            color: #4361ee;
        }
        
        .nenhuma-tecnica-aprendida h4 {
            margin: 0 0 10px 0;
            color: #e6e6e6;
        }
        
        .nenhuma-tecnica-aprendida p {
            margin: 0;
            font-size: 0.9em;
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', css);
    console.log("🎨 CSS das técnicas adicionado");
}

// ===== 10. CONTAINER DE EMERGÊNCIA =====
function criarContainerEmergencia() {
    console.log("🚨 Criando container de emergência...");
    
    // Procurar a aba de técnicas
    const tecnicaTab = document.getElementById('subtab-tecnicas');
    if (!tecnicaTab) {
        console.error("❌ Não encontrou nem a aba!");
        return;
    }
    
    // Criar container emergencial
    const container = document.createElement('div');
    container.id = 'tecnicas-emergencia';
    container.style.cssText = `
        padding: 20px;
        background: #1a1a2e;
        color: white;
        border-radius: 10px;
        margin: 20px;
    `;
    
    container.innerHTML = `
        <h3 style="color: #4cc9f0; margin-top: 0;">
            <i class="fas fa-tools"></i> Técnicas Especiais
        </h3>
        <div id="lista-tecnicas-emergencia"></div>
    `;
    
    tecnicaTab.appendChild(container);
    
    // Agora renderizar as técnicas
    const subContainer = document.getElementById('lista-tecnicas-emergencia');
    if (subContainer) {
        CATALOGO_TECNICAS.forEach(tecnica => {
            const elemento = criarElementoTecnica(tecnica);
            subContainer.appendChild(elemento);
        });
    }
}

// ===== 11. INICIALIZAÇÃO COMPLETA =====
function inicializarTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS");
    
    // 1. Carregar dados salvos
    carregarTecnicas();
    
    // 2. Adicionar CSS
    adicionarCSStecnicas();
    
    // 3. Renderizar
    renderizarTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado!");
}

// ===== 12. ESCUTAR MUDANÇAS NA ABA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando técnicas");
    
    // Carregar dados imediatamente
    carregarTecnicas();
    
    // Configurar observador para cliques nas abas
    const botoes = document.querySelectorAll('.subtab-btn-pericias');
    botoes.forEach(botao => {
        botao.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            console.log(`🎯 Clicou em: ${subtab}`);
            
            if (subtab === 'tecnicas') {
                setTimeout(() => {
                    console.log("🔄 Inicializando técnicas após clique...");
                    inicializarTecnicas();
                }, 300);
            }
        });
    });
    
    // Se a aba já estiver ativa, inicializar agora
    const tecnicaTab = document.getElementById('subtab-tecnicas');
    if (tecnicaTab && tecnicaTab.classList.contains('active')) {
        console.log("✅ Aba de técnicas já está ativa - inicializando...");
        setTimeout(inicializarTecnicas, 500);
    }
    
    // Botão de força para debug
    const forceBtn = document.createElement('button');
    forceBtn.textContent = 'FORÇAR TÉCNICAS';
    forceBtn.style.cssText = `
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: #FF5722;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 5px;
        cursor: pointer;
        z-index: 9999;
        font-weight: bold;
    `;
    forceBtn.onclick = inicializarTecnicas;
    document.body.appendChild(forceBtn);
});

// ===== 13. EXPORTAR FUNÇÕES =====
window.initTecnicas = inicializarTecnicas;
window.renderizarTecnicas = renderizarTecnicas;

console.log("✅ TÉCNICAS.JS - CARREGADO E PRONTO");