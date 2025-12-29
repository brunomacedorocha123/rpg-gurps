// ============================================
// SISTEMA COMPLETO DE TÉCNICAS - AUTOCONTIDO
// ============================================

console.log("🔥 SISTEMA DE TÉCNICAS - INICIANDO");

// ===== 1. CATÁLOGO DE TÉCNICAS =====
const TECNICAS_DISPONIVEIS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Permite atirar com arco enquanto cavalga. Penalidade base de -4.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        prereq: "Arco e Cavalgar",
        custoPorNivel: 2,
        maxNivel: 4,
        regras: "Não pode exceder o NH em Arco. Penalidades para disparar a cavalo não reduzem abaixo do NH desta técnica."
    },
    {
        id: "ataque-poderoso",
        nome: "Ataque Poderoso",
        icone: "fas fa-fist-raised",
        descricao: "Aumenta o dano em troca de precisão.",
        dificuldade: "Média",
        periciaBase: "Espada",
        atributo: "DX",
        prereq: "Espada",
        custoPorNivel: 1,
        maxNivel: 4,
        regras: "-2 na jogada de ataque, +2 no dano por nível"
    },
    {
        id: "defesa-com-escudo",
        nome: "Defesa com Escudo",
        icone: "fas fa-shield-alt",
        descricao: "Aumenta a defesa ao usar escudo.",
        dificuldade: "Fácil",
        periciaBase: "Escudo",
        atributo: "DX",
        prereq: "Escudo",
        custoPorNivel: 1,
        maxNivel: 3,
        regras: "+1 na defesa por nível"
    }
];

// ===== 2. ESTADO DO SISTEMA =====
let tecnicasAprendidas = [];
let tecnicaEmEdicao = null;
let pontosTotais = 0;

// ===== 3. INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM Carregado");
    
    // Injetar CSS automaticamente
    injetarCSSTecnicas();
    
    // Carregar dados salvos
    carregarDados();
    
    // Configurar eventos
    configurarEventos();
    
    // Renderizar inicial
    setTimeout(() => {
        if (isAbaTecnicasAtiva()) {
            renderizarSistema();
        }
    }, 100);
});

// ===== 4. INJEÇÃO DE CSS =====
function injetarCSSTecnicas() {
    const estiloId = 'estilo-tecnicas-injetado';
    if (document.getElementById(estiloId)) return;
    
    const estilo = `
        <style id="${estiloId}">
        /* ESTILOS PARA TÉCNICAS */
        
        /* Item de técnica */
        .item-tecnica {
            background: linear-gradient(135deg, rgba(26, 18, 0, 0.9), rgba(44, 32, 8, 0.9));
            border: 2px solid #8B4513;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
            color: #F5DEB3;
            transition: all 0.3s;
            cursor: pointer;
        }
        
        .item-tecnica:hover {
            border-color: #D4AF37;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(212, 175, 55, 0.2);
        }
        
        .cabecalho-tecnica {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .nome-tecnica {
            font-size: 1.2em;
            font-weight: bold;
            color: #D4AF37;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .dificuldade-tecnica {
            background: #8B0000;
            color: white;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 0.8em;
            font-weight: bold;
        }
        
        .descricao-tecnica {
            color: #DEB887;
            font-size: 0.9em;
            line-height: 1.4;
            margin-bottom: 10px;
        }
        
        .info-tecnica {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin: 10px 0;
            padding: 10px;
            background: rgba(139, 0, 0, 0.1);
            border-radius: 5px;
        }
        
        .info-item {
            text-align: center;
        }
        
        .info-label {
            font-size: 0.8em;
            color: #B8860B;
            display: block;
        }
        
        .info-valor {
            font-weight: bold;
            color: #F5DEB3;
            display: block;
        }
        
        /* Botões */
        .botoes-tecnica {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .btn-tecnica {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            font-family: 'Cinzel', serif;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
        }
        
        .btn-adquirir {
            background: linear-gradient(135deg, #228B22, #006400);
            color: white;
        }
        
        .btn-adquirir:hover {
            background: linear-gradient(135deg, #32CD32, #228B22);
        }
        
        .btn-editar {
            background: linear-gradient(135deg, #1E90FF, #00008B);
            color: white;
        }
        
        .btn-editar:hover {
            background: linear-gradient(135deg, #87CEEB, #1E90FF);
        }
        
        .btn-remover {
            background: linear-gradient(135deg, #DC143C, #8B0000);
            color: white;
        }
        
        .btn-remover:hover {
            background: linear-gradient(135deg, #FF6347, #DC143C);
        }
        
        /* Técnicas aprendidas */
        .tecnica-aprendida {
            background: linear-gradient(135deg, rgba(34, 139, 34, 0.1), rgba(0, 100, 0, 0.1));
            border: 2px solid #228B22;
            border-radius: 10px;
            padding: 15px;
            margin: 10px 0;
        }
        
        .nivel-tecnica {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 10px 0;
        }
        
        .controles-nivel {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .btn-nivel {
            width: 30px;
            height: 30px;
            border: 2px solid #8B4513;
            background: rgba(139, 69, 19, 0.2);
            color: #F5DEB3;
            border-radius: 50%;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .btn-nivel:hover {
            border-color: #D4AF37;
            background: rgba(212, 175, 55, 0.3);
        }
        
        .display-nivel {
            font-size: 1.5em;
            font-weight: bold;
            color: #D4AF37;
            min-width: 40px;
            text-align: center;
        }
        
        /* Modal */
        .overlay-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        }
        
        .modal-tecnica {
            background: linear-gradient(135deg, #2C2008, #1A1200);
            border: 3px solid #D4AF37;
            border-radius: 15px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 25px;
            color: #F5DEB3;
        }
        
        .cabecalho-modal {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #D4AF37;
        }
        
        .btn-fechar {
            background: none;
            border: none;
            color: #F5DEB3;
            font-size: 1.5em;
            cursor: pointer;
            padding: 5px;
        }
        
        .btn-fechar:hover {
            color: #FFD700;
        }
        
        .seletor-nivel {
            background: rgba(139, 0, 0, 0.2);
            border-radius: 10px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .opcoes-nivel {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 15px 0;
        }
        
        .opcao-nivel {
            width: 60px;
            height: 60px;
            border: 3px solid #8B4513;
            background: rgba(139, 69, 19, 0.3);
            color: #F5DEB3;
            border-radius: 10px;
            font-size: 1.2em;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .opcao-nivel:hover {
            border-color: #D4AF37;
            background: rgba(212, 175, 55, 0.3);
        }
        
        .opcao-nivel.selecionada {
            border-color: #228B22;
            background: rgba(34, 139, 34, 0.3);
            color: #90EE90;
        }
        
        .rodape-modal {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #8B4513;
        }
        
        /* Mensagens */
        .mensagem-sistema {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 9999;
            animation: slideIn 0.3s, fadeOut 0.3s 2.7s;
        }
        
        .mensagem-sucesso {
            background: linear-gradient(135deg, #228B22, #006400);
        }
        
        .mensagem-erro {
            background: linear-gradient(135deg, #DC143C, #8B0000);
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        /* Estado vazio */
        .estado-vazio {
            text-align: center;
            padding: 40px 20px;
            color: #B8860B;
        }
        
        .estado-vazio i {
            font-size: 3em;
            margin-bottom: 15px;
            display: block;
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', estilo);
}

// ===== 5. FUNÇÕES PRINCIPAIS =====
function isAbaTecnicasAtiva() {
    const aba = document.getElementById('subtab-tecnicas');
    return aba && aba.classList.contains('active');
}

function configurarEventos() {
    // Eventos dos botões das sub-abas
    document.querySelectorAll('.subtab-btn-pericias').forEach(botao => {
        botao.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            console.log(`Clicou em: ${subtab}`);
            
            if (subtab === 'tecnicas') {
                // Pequeno delay para garantir renderização
                setTimeout(() => {
                    renderizarSistema();
                }, 150);
            }
        });
    });
    
    console.log("✅ Eventos configurados");
}

function carregarDados() {
    try {
        const dados = localStorage.getItem('tecnicas_personagem');
        if (dados) {
            tecnicasAprendidas = JSON.parse(dados);
            console.log(`📂 Carregadas ${tecnicasAprendidas.length} técnicas`);
        }
    } catch (e) {
        console.error("Erro ao carregar:", e);
        tecnicasAprendidas = [];
    }
}

function salvarDados() {
    try {
        localStorage.setItem('tecnicas_personagem', JSON.stringify(tecnicasAprendidas));
        console.log("💾 Dados salvos");
    } catch (e) {
        console.error("Erro ao salvar:", e);
    }
}

// ===== 6. RENDERIZAÇÃO =====
function renderizarSistema() {
    console.log("🎨 Renderizando sistema de técnicas...");
    
    // Verificar se estamos na aba correta
    if (!isAbaTecnicasAtiva()) {
        console.log("⚠️ Aba de técnicas não está ativa");
        return;
    }
    
    // Renderizar catálogo
    renderizarCatalogo();
    
    // Renderizar aprendidas
    renderizarAprendidas();
    
    // Atualizar pontos
    atualizarPontos();
}

function renderizarCatalogo() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado!");
        
        // Tentar criar
        criarContainerCatalogo();
        return;
    }
    
    console.log(`📚 Renderizando ${TECNICAS_DISPONIVEIS.length} técnicas`);
    
    // Limpar container
    container.innerHTML = '';
    
    // Se não houver técnicas
    if (TECNICAS_DISPONIVEIS.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <i class="fas fa-tools"></i>
                <h3>Nenhuma técnica disponível</h3>
                <p>As técnicas aparecerão aqui quando disponíveis</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada técnica
    TECNICAS_DISPONIVEIS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.some(t => t.id === tecnica.id);
        const elemento = criarElementoTecnica(tecnica, jaAprendida);
        container.appendChild(elemento);
    });
}

function criarElementoTecnica(tecnica, jaAprendida) {
    const div = document.createElement('div');
    div.className = 'item-tecnica';
    div.dataset.id = tecnica.id;
    
    div.innerHTML = `
        <div class="cabecalho-tecnica">
            <div class="nome-tecnica">
                <i class="${tecnica.icone}"></i>
                ${tecnica.nome}
            </div>
            <div class="dificuldade-tecnica">${tecnica.dificuldade}</div>
        </div>
        
        <div class="descricao-tecnica">
            ${tecnica.descricao}
            <div style="margin-top: 8px; font-size: 0.85em; color: #B8860B;">
                <strong>Regra:</strong> ${tecnica.regras}
            </div>
        </div>
        
        <div class="info-tecnica">
            <div class="info-item">
                <span class="info-label">Base</span>
                <span class="info-valor">${tecnica.periciaBase}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Atributo</span>
                <span class="info-valor">${tecnica.atributo}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Custo/Nível</span>
                <span class="info-valor">${tecnica.custoPorNivel} pts</span>
            </div>
        </div>
        
        <div class="info-tecnica">
            <div class="info-item">
                <span class="info-label">Pré-requisito</span>
                <span class="info-valor">${tecnica.prereq}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Máximo</span>
                <span class="info-valor">+${tecnica.maxNivel}</span>
            </div>
        </div>
        
        <div class="botoes-tecnica">
            ${jaAprendida ? 
                `<button class="btn-tecnica btn-editar" onclick="editarTecnica('${tecnica.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-tecnica btn-remover" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>` :
                `<button class="btn-tecnica btn-adquirir" onclick="adquirirTecnica('${tecnica.id}')">
                    <i class="fas fa-plus-circle"></i> Adquirir
                </button>`
            }
        </div>
    `;
    
    return div;
}

function renderizarAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error("❌ Container #tecnicas-aprendidas não encontrado!");
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    // Se não houver técnicas aprendidas
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="estado-vazio">
                <i class="fas fa-graduation-cap"></i>
                <h3>Nenhuma técnica aprendida</h3>
                <p>Adquira técnicas para aprimorar suas habilidades</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada técnica aprendida
    tecnicasAprendidas.forEach(tecnicaAprendida => {
        const tecnicaOriginal = TECNICAS_DISPONIVEIS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaOriginal) return;
        
        const elemento = criarElementoTecnicaAprendida(tecnicaAprendida, tecnicaOriginal);
        container.appendChild(elemento);
    });
}

function criarElementoTecnicaAprendida(tecnicaAprendida, tecnicaOriginal) {
    const div = document.createElement('div');
    div.className = 'tecnica-aprendida';
    div.dataset.id = tecnicaAprendida.id;
    
    const custoTotal = tecnicaAprendida.nivel * tecnicaOriginal.custoPorNivel;
    
    div.innerHTML = `
        <div class="cabecalho-tecnica">
            <div class="nome-tecnica">
                <i class="${tecnicaOriginal.icone}"></i>
                ${tecnicaOriginal.nome}
            </div>
            <div class="dificuldade-tecnica">${tecnicaOriginal.dificuldade}</div>
        </div>
        
        <div class="nivel-tecnica">
            <div>
                <span style="color: #B8860B;">Nível da Técnica:</span>
                <span style="font-weight: bold; color: #D4AF37;"> +${tecnicaAprendida.nivel}</span>
            </div>
            
            <div class="controles-nivel">
                <button class="btn-nivel" onclick="alterarNivelTecnica('${tecnicaAprendida.id}', -1)" 
                    ${tecnicaAprendida.nivel <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                
                <div class="display-nivel">+${tecnicaAprendida.nivel}</div>
                
                <button class="btn-nivel" onclick="alterarNivelTecnica('${tecnicaAprendida.id}', 1)"
                    ${tecnicaAprendida.nivel >= tecnicaOriginal.maxNivel ? 'disabled' : ''}>
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        </div>
        
        <div class="info-tecnica">
            <div class="info-item">
                <span class="info-label">Perícia Base</span>
                <span class="info-valor">${tecnicaOriginal.periciaBase}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Custo Total</span>
                <span class="info-valor" style="color: #90EE90;">${custoTotal} pts</span>
            </div>
            <div class="info-item">
                <span class="info-label">Máximo</span>
                <span class="info-valor">+${tecnicaOriginal.maxNivel}</span>
            </div>
        </div>
        
        <div style="margin-top: 10px; font-size: 0.9em; color: #DEB887;">
            <i class="fas fa-info-circle"></i>
            Não pode exceder o NH em ${tecnicaOriginal.periciaBase}
        </div>
        
        <div class="botoes-tecnica">
            <button class="btn-tecnica btn-remover" onclick="removerTecnica('${tecnicaAprendida.id}')">
                <i class="fas fa-trash"></i> Remover Técnica
            </button>
        </div>
    `;
    
    return div;
}

// ===== 7. FUNÇÕES DE GERENCIAMENTO =====
function adquirirTecnica(id) {
    const tecnica = TECNICAS_DISPONIVEIS.find(t => t.id === id);
    if (!tecnica) return;
    
    tecnicaEmEdicao = { ...tecnica, nivel: 1 };
    abrirModalTecnica();
}

function editarTecnica(id) {
    const tecnicaOriginal = TECNICAS_DISPONIVEIS.find(t => t.id === id);
    const tecnicaAprendida = tecnicasAprendidas.find(t => t.id === id);
    
    if (tecnicaOriginal && tecnicaAprendida) {
        tecnicaEmEdicao = {
            ...tecnicaOriginal,
            nivel: tecnicaAprendida.nivel
        };
        abrirModalTecnica();
    }
}

function alterarNivelTecnica(id, mudanca) {
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnicaOriginal = TECNICAS_DISPONIVEIS.find(t => t.id === id);
    if (!tecnicaOriginal) return;
    
    let novoNivel = tecnicasAprendidas[index].nivel + mudanca;
    
    // Limites
    if (novoNivel < 1) novoNivel = 1;
    if (novoNivel > tecnicaOriginal.maxNivel) novoNivel = tecnicaOriginal.maxNivel;
    
    if (novoNivel !== tecnicasAprendidas[index].nivel) {
        tecnicasAprendidas[index].nivel = novoNivel;
        tecnicasAprendidas[index].dataAtualizacao = new Date().toISOString();
        
        salvarDados();
        renderizarSistema();
        mostrarMensagem(`Nível alterado para +${novoNivel}`, 'sucesso');
    }
}

function removerTecnica(id) {
    if (confirm('Tem certeza que deseja remover esta técnica?')) {
        tecnicasAprendidas = tecnicasAprendidas.filter(t => t.id !== id);
        salvarDados();
        renderizarSistema();
        mostrarMensagem('Técnica removida', 'sucesso');
    }
}

// ===== 8. MODAL =====
function abrirModalTecnica() {
    if (!tecnicaEmEdicao) return;
    
    // Criar overlay
    let overlay = document.getElementById('overlay-tecnicas');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay-tecnicas';
        overlay.className = 'overlay-modal';
        document.body.appendChild(overlay);
    }
    
    const custoTotal = tecnicaEmEdicao.nivel * tecnicaEmEdicao.custoPorNivel;
    
    overlay.innerHTML = `
        <div class="modal-tecnica">
            <div class="cabecalho-modal">
                <h2 style="margin: 0; color: #D4AF37;">
                    <i class="${tecnicaEmEdicao.icone}"></i>
                    ${tecnicaEmEdicao.nome}
                </h2>
                <button class="btn-fechar" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div style="margin-bottom: 20px;">
                <p style="color: #DEB887;">${tecnicaEmEdicao.descricao}</p>
                <div style="background: rgba(139, 0, 0, 0.1); padding: 10px; border-radius: 5px; margin-top: 10px;">
                    <small style="color: #B8860B;"><strong>Regra:</strong> ${tecnicaEmEdicao.regras}</small>
                </div>
            </div>
            
            <div class="seletor-nivel">
                <h3 style="margin-top: 0; color: #D4AF37; text-align: center;">
                    Selecionar Nível da Técnica
                </h3>
                
                <div class="opcoes-nivel">
                    ${Array.from({length: tecnicaEmEdicao.maxNivel}, (_, i) => {
                        const nivel = i + 1;
                        const selecionada = nivel === tecnicaEmEdicao.nivel ? 'selecionada' : '';
                        return `
                            <div class="opcao-nivel ${selecionada}" 
                                 onclick="selecionarNivelModal(${nivel})">
                                +${nivel}
                            </div>
                        `;
                    }).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 15px;">
                    <div style="color: #B8860B; font-size: 0.9em;">Custo por nível: ${tecnicaEmEdicao.custoPorNivel} ponto(s)</div>
                    <div style="font-size: 1.2em; font-weight: bold; color: #90EE90; margin-top: 5px;">
                        Custo total: ${custoTotal} ponto(s)
                    </div>
                </div>
            </div>
            
            <div class="info-tecnica">
                <div class="info-item">
                    <span class="info-label">Dificuldade</span>
                    <span class="info-valor">${tecnicaEmEdicao.dificuldade}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Perícia Base</span>
                    <span class="info-valor">${tecnicaEmEdicao.periciaBase}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Pré-requisito</span>
                    <span class="info-valor">${tecnicaEmEdicao.prereq}</span>
                </div>
            </div>
            
            <div class="rodape-modal">
                <div>
                    <span style="color: #B8860B;">Total: </span>
                    <span style="font-weight: bold; color: #D4AF37; font-size: 1.2em;">
                        ${custoTotal} ponto(s)
                    </span>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button onclick="fecharModalTecnica()" style="
                        padding: 10px 20px;
                        background: rgba(139, 0, 0, 0.3);
                        border: 2px solid #8B0000;
                        color: #F5DEB3;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: 'Cinzel', serif;
                    ">
                        Cancelar
                    </button>
                    
                    <button onclick="confirmarTecnica()" style="
                        padding: 10px 20px;
                        background: linear-gradient(135deg, #228B22, #006400);
                        border: none;
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                        font-family: 'Cinzel', serif;
                        font-weight: bold;
                    ">
                        <i class="fas fa-check"></i>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    overlay.style.display = 'flex';
}

function selecionarNivelModal(nivel) {
    if (!tecnicaEmEdicao) return;
    
    tecnicaEmEdicao.nivel = nivel;
    
    // Atualizar modal
    const overlay = document.getElementById('overlay-tecnicas');
    if (overlay) {
        // Simplesmente reabrir o modal com novos dados
        abrirModalTecnica();
    }
}

function confirmarTecnica() {
    if (!tecnicaEmEdicao) {
        fecharModalTecnica();
        return;
    }
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === tecnicaEmEdicao.id);
    
    if (indexExistente >= 0) {
        // Atualizar existente
        tecnicasAprendidas[indexExistente] = {
            id: tecnicaEmEdicao.id,
            nome: tecnicaEmEdicao.nome,
            nivel: tecnicaEmEdicao.nivel,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Adicionar nova
        tecnicasAprendidas.push({
            id: tecnicaEmEdicao.id,
            nome: tecnicaEmEdicao.nome,
            nivel: tecnicaEmEdicao.nivel,
            dataAdquisicao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        });
    }
    
    salvarDados();
    fecharModalTecnica();
    renderizarSistema();
    
    const mensagem = indexExistente >= 0 ? 
        `Técnica atualizada para nível +${tecnicaEmEdicao.nivel}` :
        `Técnica adquirida no nível +${tecnicaEmEdicao.nivel}`;
    
    mostrarMensagem(mensagem, 'sucesso');
}

function fecharModalTecnica() {
    const overlay = document.getElementById('overlay-tecnicas');
    if (overlay) {
        overlay.style.display = 'none';
    }
    tecnicaEmEdicao = null;
}

// ===== 9. FUNÇÕES AUXILIARES =====
function criarContainerCatalogo() {
    // Tentar encontrar onde colocar
    const tecnicaTab = document.getElementById('subtab-tecnicas');
    if (!tecnicaTab) return;
    
    // Verificar se já existe
    let container = document.getElementById('lista-tecnicas');
    if (!container) {
        container = document.createElement('div');
        container.id = 'lista-tecnicas';
        container.style.cssText = 'padding: 20px; min-height: 200px;';
        tecnicaTab.appendChild(container);
    }
    
    // Tentar renderizar novamente
    setTimeout(renderizarCatalogo, 100);
}

function atualizarPontos() {
    // Calcular pontos totais
    pontosTotais = tecnicasAprendidas.reduce((total, tecnicaAprendida) => {
        const tecnicaOriginal = TECNICAS_DISPONIVEIS.find(t => t.id === tecnicaAprendida.id);
        if (tecnicaOriginal) {
            return total + (tecnicaAprendida.nivel * tecnicaOriginal.custoPorNivel);
        }
        return total;
    }, 0);
    
    // Atualizar display
    const elementoPontos = document.getElementById('pontos-tecnicas');
    if (elementoPontos) {
        elementoPontos.textContent = `${pontosTotais} pts`;
    }
}

function mostrarMensagem(texto, tipo = 'sucesso') {
    // Remover mensagens anteriores
    const mensagensAntigas = document.querySelectorAll('.mensagem-sistema');
    mensagensAntigas.forEach(msg => msg.remove());
    
    // Criar nova mensagem
    const mensagem = document.createElement('div');
    mensagem.className = `mensagem-sistema mensagem-${tipo}`;
    mensagem.textContent = texto;
    
    document.body.appendChild(mensagem);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (mensagem.parentNode) {
            mensagem.remove();
        }
    }, 3000);
}

// ===== 10. BOTÃO DE DEBUG =====
function criarBotaoDebug() {
    const botao = document.createElement('button');
    botao.innerHTML = '<i class="fas fa-bug"></i>';
    botao.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #FF5722, #E64A19);
        color: white;
        border: none;
        border-radius: 50%;
        cursor: pointer;
        z-index: 9998;
        font-size: 20px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    `;
    
    botao.onclick = function() {
        console.log("=== DEBUG TÉCNICAS ===");
        console.log("Técnicas aprendidas:", tecnicasAprendidas);
        console.log("Técnica em edição:", tecnicaEmEdicao);
        console.log("Pontos totais:", pontosTotais);
        console.log("Aba ativa?", isAbaTecnicasAtiva());
        
        // Forçar renderização
        renderizarSistema();
        
        mostrarMensagem("Debug executado - Verifique console", 'sucesso');
    };
    
    document.body.appendChild(botao);
}

// ===== 11. EXPORTAR FUNÇÕES =====
window.renderizarTecnicas = renderizarSistema;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;

// ===== 12. INICIALIZAÇÃO FINAL =====
setTimeout(() => {
    criarBotaoDebug();
    console.log("✅ Sistema de técnicas pronto!");
    
    // Verificar se deve renderizar agora
    if (isAbaTecnicasAtiva()) {
        console.log("🔄 Aba já ativa - Renderizando agora...");
        renderizarSistema();
    }
}, 1000);