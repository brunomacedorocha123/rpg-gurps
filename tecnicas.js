// ============================================
// TECNICAS.JS - VERSÃO CORRIGIDA (FUNCIONAL)
// ============================================

// CATÁLOGO CORRETO
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        periciaBase: "Arco",
        modificadorBase: -4,
        prereq: ["Arco", "Cavalgar"] // ← MUDADO: Cavalgar genérico, não específico
    }
];

// ESTADO
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');

// ===== FUNÇÃO CORRETA PARA PEGAR NH DO ARCO =====
function getNHArco() {
    // 1. Tenta no estado global
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        
        // Procura por "Arco" de várias formas
        for (let p of pericias) {
            if (!p) continue;
            
            // Procura por nome exato "Arco"
            if (p.nome && p.nome.trim().toLowerCase() === "arco") {
                console.log("✅ Arco encontrado por nome:", p);
                return p.nivel || 0;
            }
            
            // Procura por id "arco"
            if (p.id && p.id === "arco") {
                console.log("✅ Arco encontrado por ID:", p);
                return p.nivel || 0;
            }
        }
    }
    
    // 2. Fallback: localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.periciasAprendidas) {
                for (let p of parsed.periciasAprendidas) {
                    if (!p) continue;
                    
                    if ((p.nome && p.nome.trim().toLowerCase() === "arco") ||
                        (p.id && p.id === "arco")) {
                        console.log("✅ Arco encontrado no localStorage:", p);
                        return p.nivel || 0;
                    }
                }
            }
        }
    } catch (e) {
        console.error("Erro ao buscar Arco:", e);
    }
    
    console.log("❌ Arco não encontrado");
    return 0;
}

// ===== FUNÇÃO PARA CALCULAR NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return 0;
    
    const nhArco = getNHArco();
    console.log(`📊 Cálculo: NH Arco = ${nhArco}, Penalidade = ${tecnica.modificadorBase}, Níveis = ${niveisInvestidos}`);
    
    if (nhArco <= 0) return 0;
    
    // Fórmula: NH Arco + (-4) + níveis
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // Não pode exceder NH do Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não pode ser negativo
    if (nhFinal < 0) nhFinal = 0;
    
    console.log(`📊 NH Final da técnica: ${nhFinal}`);
    return nhFinal;
}

// ===== RENDERIZAR TÉCNICAS APRENDIDAS (SIMPLES E FUNCIONAL) =====
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
    
    tecnicasAprendidas.forEach(tecnicaAprendida => {
        const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaBase) return;
        
        // CALCULA O NH CORRETAMENTE
        const nhTecnica = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis || 0);
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida-item';
        card.dataset.id = tecnicaAprendida.id;
        
        card.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${tecnicaBase.icone}"></i>
                    ${tecnicaBase.nome}
                </div>
                <div class="tecnica-aprendida-nh">
                    NH: ${nhTecnica}
                </div>
            </div>
            
            <div class="tecnica-aprendida-info">
                <div>Pontos: ${tecnicaAprendida.pontos || 0} pts</div>
                <div>Níveis: +${tecnicaAprendida.niveis || 0}</div>
            </div>
            
            <div class="tecnica-aprendida-actions">
                <button class="btn-editar" onclick="editarTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover" onclick="removerTecnica('${tecnicaAprendida.id}')">
                    <i class="fas fa-times"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// ===== FUNÇÃO PARA VERIFICAR CAVALGAR GENÉRICO =====
function verificarCavalgar() {
    // Tenta no estado global
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        
        // Procura QUALQUER perícia que tenha "cavalgar" no nome
        for (let p of pericias) {
            if (!p || !p.nome) continue;
            
            if (p.nome.toLowerCase().includes("cavalgar")) {
                console.log("✅ Cavalgar encontrado:", p.nome);
                return { 
                    tem: true, 
                    nivel: p.nivel || 0,
                    nome: p.nome 
                };
            }
        }
    }
    
    // Fallback
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.periciasAprendidas) {
                for (let p of parsed.periciasAprendidas) {
                    if (p && p.nome && p.nome.toLowerCase().includes("cavalgar")) {
                        return { 
                            tem: true, 
                            nivel: p.nivel || 0,
                            nome: p.nome 
                        };
                    }
                }
            }
        }
    } catch (e) {
        console.error("Erro ao buscar Cavalgar:", e);
    }
    
    return { tem: false, nivel: 0, nome: "Cavalgar" };
}

// ===== FUNÇÃO ATUALIZADA DE VERIFICAÇÃO DE PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    let todosCumpridos = true;
    const resultados = [];
    
    tecnica.prereq.forEach(req => {
        if (req === "Arco") {
            const nhArco = getNHArco();
            const resultado = {
                pericia: "Arco",
                tem: nhArco > 0,
                nivel: nhArco
            };
            resultados.push(resultado);
            
            if (nhArco <= 0) todosCumpridos = false;
            
        } else if (req === "Cavalgar") {
            const cavalgar = verificarCavalgar();
            resultados.push({
                pericia: cavalgar.nome || "Cavalgar",
                tem: cavalgar.tem,
                nivel: cavalgar.nivel
            });
            
            if (!cavalgar.tem) todosCumpridos = false;
        }
    });
    
    return { todosCumpridos, resultados };
}

// ===== SUBSTITUA SUAS FUNÇÕES ANTIGAS POR ESTAS =====

// Na função confirmarTecnica, adicione o cálculo do NH:
function confirmarTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica || !window.tecnicaSelecionada) return;
    
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('Complete os pré-requisitos primeiro');
        return;
    }
    
    const { niveis, pontos } = window.tecnicaSelecionada;
    const nhArco = getNHArco();
    
    // Verifica se tem Arco suficiente
    if (nhArco <= 0) {
        alert('Você precisa aprender Arco primeiro!');
        return;
    }
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos;
        pontosTecnicas += (pontos - pontosAntigos);
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase
        };
    } else {
        // Adicionar nova
        tecnicasAprendidas.push({
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase
        });
        pontosTecnicas += pontos;
    }
    
    salvarTecnicas();
    fecharModalTecnica();
    renderizarTecnicas();
}

// ===== FUNÇÃO PRINCIPAL =====
function renderizarTecnicas() {
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