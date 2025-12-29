// ============================================
// TECNICAS.JS - VERSÃO 100% FUNCIONAL
// ============================================

// ===== 1. CATÁLOGO DE TÉCNICAS =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        periciaBaseNome: "Arco",           // Para exibição
        periciaBaseId: "arco",             // ID para buscar o NH
        atributo: "DX",
        modificadorBase: -4,
        prereq: [
            { nome: "Arco", id: "arco" },                // Para verificar pré-requisito
            { nome: "Cavalgar (Cavalo)", id: "cavalgar-cavalo" }  // Só pré-requisito
        ],
        custoTabela: { 1: 2, 2: 3, 3: 4, 4: 5 }  // Níveis: Pontos
    }
];

// ===== 2. ESTADO DO SISTEMA =====
let estadoTecnicas = {
    aprendidas: JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]'),
    pontosTotais: parseInt(localStorage.getItem('pontos_tecnicas') || '0')
};

// ===== 3. BUSCA DIRETA NO LOCALSTORAGE =====
function buscarPericiaNoStorage(idBuscado) {
    console.log(`🎯 Buscando perícia ID: "${idBuscado}"`);
    
    // Chaves possíveis onde as perícias podem estar
    const chaves = ['gurps_pericias', 'pericias_aprendidas', 'pericias_personagem'];
    
    for (let chave of chaves) {
        try {
            const dados = localStorage.getItem(chave);
            if (!dados) continue;
            
            const parsed = JSON.parse(dados);
            
            // Verifica diferentes formatos
            let arrayPericias = [];
            
            if (Array.isArray(parsed)) {
                arrayPericias = parsed;
            } else if (parsed.periciasAprendidas && Array.isArray(parsed.periciasAprendidas)) {
                arrayPericias = parsed.periciasAprendidas;
            } else if (parsed.pericias && Array.isArray(parsed.pericias)) {
                arrayPericias = parsed.pericias;
            }
            
            // Busca pelo ID
            const encontrada = arrayPericias.find(p => p && p.id === idBuscado);
            
            if (encontrada) {
                console.log(`✅ Encontrada em ${chave}: ${encontrada.nome} (NH: ${encontrada.nivel || 0})`);
                return {
                    tem: true,
                    nivel: encontrada.nivel || 0,
                    nome: encontrada.nome || 'Sem nome',
                    nomeCompleto: encontrada.nomeCompleto || encontrada.nome
                };
            }
        } catch (e) {
            console.warn(`⚠️ Erro em ${chave}:`, e);
        }
    }
    
    console.warn(`❌ Perícia não encontrada: ${idBuscado}`);
    return {
        tem: false,
        nivel: 0,
        nome: idBuscado
    };
}

// ===== 4. VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    console.log(`📋 Verificando pré-requisitos para ${tecnica.nome}`);
    
    const resultados = tecnica.prereq.map(req => {
        const info = buscarPericiaNoStorage(req.id);
        return {
            ...info,
            pericia: req.nome,
            id: req.id
        };
    });
    
    const todosCumpridos = resultados.every(r => r.tem);
    
    console.log(`📊 Resultados: ${resultados.map(r => `${r.pericia}: ${r.tem ? 'OK' : 'FALTA'}`).join(', ')}`);
    
    return { todosCumpridos, resultados };
}

// ===== 5. CÁLCULO DO NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) {
        return { nh: 0, calculo: "Técnica não encontrada" };
    }
    
    // Busca o NH da perícia base (Arco)
    const infoArco = buscarPericiaNoStorage(tecnica.periciaBaseId);
    const nhArco = infoArco.nivel;
    
    // Cálculo: NH Arco + penalidade (-4) + níveis investidos
    const nhBase = nhArco + tecnica.modificadorBase;
    let nhFinal = nhBase + niveisInvestidos;
    
    // Limite: nunca excede o NH de Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    if (nhFinal < 0) nhFinal = 0;
    
    // Monta a fórmula
    let calculo = `${nhArco}`;
    if (tecnica.modificadorBase < 0) {
        calculo += ` - ${Math.abs(tecnica.modificadorBase)}`;
    } else {
        calculo += ` + ${tecnica.modificadorBase}`;
    }
    if (niveisInvestidos > 0) {
        calculo += ` + ${niveisInvestidos}`;
    }
    calculo += ` = ${nhFinal}`;
    
    console.log(`🧮 Cálculo NH: ${calculo}`);
    
    return {
        nh: nhFinal,
        nhArco: nhArco,
        nhBase: nhBase,
        calculo: calculo,
        infoArco: infoArco,
        niveisInvestidos: niveisInvestidos
    };
}

// ===== 6. RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado");
        return;
    }
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        const prereqStatus = verificarPreRequisitos(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
        // Status
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
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            disabled = true;
        }
        
        // HTML do card
        const cardHTML = `
            <div class="tecnica-item ${!prereqStatus.todosCumpridos ? 'bloqueada' : ''}" data-id="${tecnica.id}">
                <div class="tecnica-header">
                    <div class="tecnica-nome-container">
                        <div class="tecnica-nome">
                            <i class="${tecnica.icone}"></i>
                            ${tecnica.nome}
                        </div>
                        <div class="tecnica-tags">
                            <span class="tecnica-dificuldade">${tecnica.atributo}</span>
                            <span class="tecnica-tipo">${tecnica.periciaBaseNome}</span>
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
                        <span>${tecnica.periciaBaseNome}: ${nhCalculo.nhArco}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calculator"></i>
                        <span>Cálculo: ${nhCalculo.calculo}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-trophy"></i>
                        <span>NH: ${nhCalculo.nh}</span>
                    </div>
                </div>
                
                <div class="tecnica-prereq">
                    <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                    <div class="prereq-status">
                        ${prereqStatus.resultados.map(r => `
                            <span class="${r.tem ? 'cumprido' : 'pendente'}">
                                <i class="fas fa-${r.tem ? 'check' : 'times'}"></i> 
                                ${r.pericia}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <div class="tecnica-actions">
                    <button class="btn-tecnica ${statusClass}" 
                            onclick="abrirModalTecnica('${tecnica.id}')"
                            ${disabled ? 'disabled' : ''}>
                        <i class="fas ${btnIcon}"></i> ${btnText}
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    console.log("✅ Catálogo renderizado");
}

// ===== 7. RENDERIZAR TÉCNICAS APRENDIDAS =====
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
        
        const nhCalculo = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis);
        
        const cardHTML = `
            <div class="tecnica-aprendida-item" data-id="${tecnicaAprendida.id}">
                <div class="tecnica-aprendida-header">
                    <div class="tecnica-aprendida-nome">
                        <i class="${tecnicaBase.icone}"></i>
                        <span>${tecnicaBase.nome}</span>
                    </div>
                    <div class="tecnica-aprendida-nh">
                        NH <span class="nh-valor">${nhCalculo.nh}</span>
                    </div>
                </div>
                
                <div class="tecnica-aprendida-info">
                    <div class="info-row">
                        <span>Perícia Base:</span>
                        <strong>${tecnicaBase.periciaBaseNome}</strong>
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
                
                <div class="tecnica-aprendida-calculadora">
                    <div class="calc-item">
                        <span>Cálculo:</span>
                        <code>${nhCalculo.calculo}</code>
                    </div>
                </div>
                
                <div class="tecnica-aprendida-limite">
                    <small>Limite: NH ${tecnicaBase.periciaBaseNome} = ${nhCalculo.nhArco}</small>
                </div>
                
                <div class="tecnica-aprendida-actions">
                    <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
    
    console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s)`);
}

// ===== 8. MODAL DA TÉCNICA =====
let tecnicaSelecionada = null;

function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    const prereqStatus = verificarPreRequisitos(tecnica);
    
    // Busca NH atual de Arco
    const infoArco = buscarPericiaNoStorage(tecnica.periciaBaseId);
    const nhArco = infoArco.nivel;
    
    // Valores iniciais
    const niveisIniciais = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
    const pontosIniciais = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
    const nhCalculo = calcularNHTecnica(id, niveisIniciais);
    
    // HTML do modal
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <div class="modal-tecnica-info">
                    <div class="info-row">
                        <span>Perícia Base:</span>
                        <span class="info-value">${tecnica.periciaBaseNome}</span>
                    </div>
                    <div class="info-row">
                        <span>NH da Perícia:</span>
                        <span class="info-value" id="nh-pericia-base">${nhArco}</span>
                    </div>
                    <div class="info-row">
                        <span>Penalidade Base:</span>
                        <span class="info-value">${tecnica.modificadorBase}</span>
                    </div>
                </div>
                
                <div class="modal-tecnica-descricao">
                    <p>${tecnica.descricao}</p>
                </div>
                
                <div class="modal-tecnica-prereq">
                    <h4>Pré-requisitos:</h4>
                    <div class="prereq-status-list">
                        ${prereqStatus.resultados.map(r => `
                            <div class="prereq-item ${r.tem ? 'cumprido' : 'pendente'}">
                                <i class="fas fa-${r.tem ? 'check-circle' : 'times-circle'}"></i>
                                <span>${r.pericia}</span>
                                <small>${r.tem ? 'Cumprido' : 'Faltando'}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${prereqStatus.todosCumpridos ? `
                <div class="modal-tecnica-controles">
                    <div class="controle-pontos">
                        <h4>Investir Pontos</h4>
                        <div class="pontos-opcoes">
                            <div class="opcao-pontos ${niveisIniciais === 1 ? 'selecionado' : ''}" 
                                 data-pontos="2" data-niveis="1"
                                 onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">2 pts</span>
                                <span class="niveis-valor">= +1 nível</span>
                            </div>
                            <div class="opcao-pontos ${niveisIniciais === 2 ? 'selecionado' : ''}" 
                                 data-pontos="3" data-niveis="2"
                                 onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">3 pts</span>
                                <span class="niveis-valor">= +2 níveis</span>
                            </div>
                            <div class="opcao-pontos ${niveisIniciais === 3 ? 'selecionado' : ''}" 
                                 data-pontos="4" data-niveis="3"
                                 onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">4 pts</span>
                                <span class="niveis-valor">= +3 níveis</span>
                            </div>
                            <div class="opcao-pontos ${niveisIniciais === 4 ? 'selecionado' : ''}" 
                                 data-pontos="5" data-niveis="4"
                                 onclick="selecionarOpcaoTecnica(this, '${id}')">
                                <span class="pontos-valor">5 pts</span>
                                <span class="niveis-valor">= +4 níveis</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="visualizacao-nh">
                        <h4>Cálculo do NH</h4>
                        <div class="nh-calculado">
                            <div class="nh-item">
                                <span>NH ${tecnica.periciaBaseNome}:</span>
                                <strong>${nhArco}</strong>
                            </div>
                            <div class="nh-item">
                                <span>Penalidade:</span>
                                <strong>${tecnica.modificadorBase}</strong>
                            </div>
                            <div class="nh-item">
                                <span>Níveis:</span>
                                <strong id="nh-niveis">+${niveisIniciais}</strong>
                            </div>
                            <div class="nh-item total">
                                <span>NH Final:</span>
                                <strong id="nh-final">${nhCalculo.nh}</strong>
                            </div>
                        </div>
                        <div class="formula-nh">
                            <code id="formula-texto">${nhCalculo.calculo}</code>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="modal-tecnica-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos incompletos!</strong>
                        <p>Aprenda as perícias acima para adquirir esta técnica.</p>
                    </div>
                </div>
                `}
                
                <div class="modal-tecnica-resumo">
                    <div class="resumo-item">
                        <span>Pontos Investidos:</span>
                        <strong id="resumo-pontos">${pontosIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis Adquiridos:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH da Técnica:</span>
                        <strong id="resumo-nh">${nhCalculo.nh}</strong>
                    </div>
                </div>
            </div>
            
            <div class="modal-tecnica-footer">
                <div class="modal-custo-total">
                    <span class="label">Custo Total:</span>
                    <span class="valor" id="modal-custo-total">${pontosIniciais}</span>
                    <span> pontos</span>
                </div>
                <div class="modal-actions">
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
        </div>
    `;
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
    }
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Inicializa técnica selecionada
    tecnicaSelecionada = {
        id: id,
        niveis: niveisIniciais,
        pontos: pontosIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
    
    console.log(`📋 Modal aberto: ${tecnica.nome}`);
}

// ===== 9. SELEÇÃO DE OPÇÕES =====
function selecionarOpcaoTecnica(elemento, tecnicaId) {
    // Remove seleção anterior
    elemento.parentElement.querySelectorAll('.opcao-pontos').forEach(opcao => {
        opcao.classList.remove('selecionado');
    });
    
    // Seleciona nova opção
    elemento.classList.add('selecionado');
    
    // Pega dados
    const niveis = parseInt(elemento.dataset.niveis);
    const pontos = parseInt(elemento.dataset.pontos);
    
    // Atualiza técnica selecionada
    tecnicaSelecionada = {
        ...tecnicaSelecionada,
        niveis: niveis,
        pontos: pontos
    };
    
    // Calcula novo NH
    const nhFinal = calcularNHTecnica(tecnicaId, niveis);
    
    // Atualiza interface
    document.getElementById('resumo-pontos').textContent = pontos;
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal.nh;
    document.getElementById('modal-custo-total').textContent = pontos;
    document.getElementById('nh-niveis').textContent = `+${niveis}`;
    document.getElementById('nh-final').textContent = nhFinal.nh;
    document.getElementById('formula-texto').textContent = nhFinal.calculo;
    
    console.log(`⚙️ Selecionado: ${pontos} pts, +${niveis} níveis`);
}

// ===== 10. CONFIRMAR TÉCNICA =====
function confirmarTecnica(id) {
    if (!tecnicaSelecionada) {
        alert('❌ Selecione uma opção primeiro');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        alert('❌ Técnica não encontrada');
        return;
    }
    
    // Verifica pré-requisitos
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('❌ Pré-requisitos não cumpridos!');
        return;
    }
    
    const { pontos, niveis } = tecnicaSelecionada;
    const nhCalculo = calcularNHTecnica(id, niveis);
    
    // Encontra se já existe
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualiza existente
        const pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
        estadoTecnicas.pontosTotais += (pontos - pontosAntigos);
        
        estadoTecnicas.aprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBaseNome
        };
        
        alert(`✅ ${tecnica.nome} atualizada! NH: ${nhCalculo.nh}`);
    } else {
        // Adiciona nova
        estadoTecnicas.aprendidas.push({
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBaseNome
        });
        estadoTecnicas.pontosTotais += pontos;
        
        alert(`✨ ${tecnica.nome} adquirida! NH: ${nhCalculo.nh}`);
    }
    
    // Salva
    salvarTecnicas();
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 11. FUNÇÕES AUXILIARES =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Remover ${tecnica.nome}?`)) return;
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    estadoTecnicas.pontosTotais -= estadoTecnicas.aprendidas[index].pontos;
    estadoTecnicas.aprendidas.splice(index, 1);
    
    salvarTecnicas();
    renderizarTodasTecnicas();
    
    alert(`🗑️ ${tecnica.nome} removida!`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) modal.innerHTML = `<div class="modal-tecnica-loading">Carregando...</div>`;
    
    tecnicaSelecionada = null;
}

function salvarTecnicas() {
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
    localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
}

// ===== 12. ATUALIZAR ESTATÍSTICAS =====
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

// ===== 13. RENDERIZAR TUDO =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticas();
}

// ===== 14. INICIALIZAÇÃO =====
function inicializarTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.onclick = () => {
            renderizarTodasTecnicas();
            alert('✅ Técnicas atualizadas!');
        };
    }
    
    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const overlay = document.getElementById('modal-tecnica-overlay');
            if (overlay && overlay.style.display === 'flex') {
                fecharModalTecnica();
            }
        }
    });
    
    // Fechar modal ao clicar fora
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                fecharModalTecnica();
            }
        };
    }
    
    // Primeira renderização
    renderizarTodasTecnicas();
}

// ===== 15. INICIALIZAÇÃO AUTOMÁTICA =====
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

// ===== 16. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;

console.log("✅ SISTEMA DE TÉCNICAS 100% FUNCIONAL CARREGADO!");