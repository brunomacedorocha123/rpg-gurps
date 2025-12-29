// ============================================
// TECNICAS.JS - VERSÃO CORRETA
// ============================================

// ===== 1. CATÁLOGO =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        periciaBaseNome: "Arco",
        periciaBaseId: "arco",             // Para pegar NH
        prereq: ["arco", "cavalgar-cavalo"],  // AMBOS são pré-requisitos!
        modificadorBase: -4,
        custoTabela: { 1: 2, 2: 3, 3: 4, 4: 5 }
    }
];

// ===== 2. ESTADO =====
let estadoTecnicas = {
    aprendidas: JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]'),
    pontosTotais: parseInt(localStorage.getItem('pontos_tecnicas') || '0')
};

// ===== 3. BUSCA QUE VAI FUNCIONAR =====
function buscarPericiaDireta(id) {
    console.log(`🔍 Buscando: "${id}"`);
    
    // Tenta estado global primeiro
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const encontrada = window.estadoPericias.periciasAprendidas.find(p => 
            p && p.id === id
        );
        if (encontrada) {
            console.log(`✅ Achou em estadoPericias: NH ${encontrada.nivel}`);
            return { tem: true, nivel: encontrada.nivel || 0, nome: encontrada.nome };
        }
    }
    
    // Tenta localStorage com todas as chaves
    const chaves = Object.keys(localStorage);
    for (let chave of chaves) {
        try {
            const dados = localStorage.getItem(chave);
            if (!dados) continue;
            
            const parsed = JSON.parse(dados);
            
            // Verifica se é um array de perícias
            let periciasArray = [];
            if (Array.isArray(parsed)) {
                periciasArray = parsed;
            } else if (parsed.periciasAprendidas && Array.isArray(parsed.periciasAprendidas)) {
                periciasArray = parsed.periciasAprendidas;
            } else if (parsed.pericias && Array.isArray(parsed.pericias)) {
                periciasArray = parsed.pericias;
            }
            
            // Busca pelo ID
            const encontrada = periciasArray.find(p => p && p.id === id);
            if (encontrada) {
                console.log(`✅ Achou em ${chave}: NH ${encontrada.nivel}`);
                return { tem: true, nivel: encontrada.nivel || 0, nome: encontrada.nome };
            }
        } catch (e) {
            // Ignora erro
        }
    }
    
    console.log(`❌ Não encontrou: "${id}"`);
    return { tem: false, nivel: 0, nome: id };
}

// ===== 4. VERIFICA PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    console.log(`📋 Verificando pré-requisitos para ${tecnica.nome}`);
    
    const resultados = tecnica.prereq.map(id => {
        return buscarPericiaDireta(id);
    });
    
    const todosCumpridos = resultados.every(r => r.tem);
    
    console.log(`Resultado: ${todosCumpridos ? '✅ TODOS' : '❌ FALTAM'} pré-requisitos`);
    
    return {
        todosCumpridos: todosCumpridos,
        resultados: resultados
    };
}

// ===== 5. CALCULA NH =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, calculo: "Técnica não encontrada" };
    
    // Pega NH de Arco
    const infoArco = buscarPericiaDireta(tecnica.periciaBaseId);
    const nhArco = infoArco.nivel;
    
    // Cálculo: NH Arco -4 + níveis
    const nhBase = nhArco + tecnica.modificadorBase;
    let nhFinal = nhBase + niveisInvestidos;
    
    // Limite máximo: NH de Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    if (nhFinal < 0) nhFinal = 0;
    
    // Monta cálculo
    const calculo = `${nhArco}${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}${niveisInvestidos > 0 ? ` + ${niveisInvestidos}` : ''} = ${nhFinal}`;
    
    console.log(`🧮 ${tecnica.nome}: ${calculo}`);
    
    return {
        nh: nhFinal,
        nhArco: nhArco,
        nhBase: nhBase,
        calculo: calculo
    };
}

// ===== 6. RENDERIZA CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
        const prereqStatus = verificarPreRequisitos(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
        // Status da técnica
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
        
        // Cria o card
        const cardHTML = `
            <div class="tecnica-item" data-id="${tecnica.id}">
                <div class="tecnica-header">
                    <div class="tecnica-nome-container">
                        <div class="tecnica-nome">
                            <i class="${tecnica.icone}"></i>
                            ${tecnica.nome}
                        </div>
                        <div class="tecnica-tags">
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
                        <span>NH Arco: ${nhCalculo.nhArco}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-calculator"></i>
                        <span>NH Técnica: ${nhCalculo.nh}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-coins"></i>
                        <span>Penalidade: ${tecnica.modificadorBase}</span>
                    </div>
                </div>
                
                <div class="tecnica-prereq">
                    <strong>Pré-requisitos:</strong>
                    ${prereqStatus.resultados.map(r => `
                        <span class="${r.tem ? 'cumprido' : 'pendente'}">
                            <i class="fas fa-${r.tem ? 'check' : 'times'}"></i>
                            ${r.nome}
                        </span>
                    `).join('')}
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
        
        container.innerHTML += cardHTML;
    });
}

// ===== 7. RENDERIZA APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
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
            <div class="tecnica-aprendida-item">
                <div class="tecnica-aprendida-header">
                    <div class="tecnica-aprendida-nome">
                        <i class="${tecnicaBase.icone}"></i>
                        <span>${tecnicaBase.nome}</span>
                    </div>
                    <div class="tecnica-aprendida-nh">
                        NH: ${nhCalculo.nh}
                    </div>
                </div>
                
                <div class="tecnica-aprendida-info">
                    <div class="info-row">
                        <span>Base:</span>
                        <strong>${tecnicaBase.periciaBaseNome} (NH ${nhCalculo.nhArco})</strong>
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
                
                <div class="tecnica-aprendida-calc">
                    <code>${nhCalculo.calculo}</code>
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
        
        container.innerHTML += cardHTML;
    });
}

// ===== 8. MODAL =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    const prereqStatus = verificarPreRequisitos(tecnica);
    
    // Pega NH de Arco
    const infoArco = buscarPericiaDireta(tecnica.periciaBaseId);
    const nhArco = infoArco.nivel;
    
    // Valores iniciais
    const niveisIniciais = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
    const pontosIniciais = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
    const nhCalculo = calcularNHTecnica(id, niveisIniciais);
    
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <!-- NH DA PERÍCIA BASE -->
                <div class="modal-nh-pericia">
                    <h4><i class="fas fa-bullseye"></i> NH da Perícia Base</h4>
                    <div class="nh-pericia-info">
                        <span>${tecnica.periciaBaseNome}:</span>
                        <strong>${nhArco}</strong>
                    </div>
                </div>
                
                <!-- CÁLCULO DO NH -->
                <div class="modal-calc-nh">
                    <h4><i class="fas fa-calculator"></i> Cálculo do NH da Técnica</h4>
                    <div class="formula-nh">
                        <code>${nhArco} (${tecnica.periciaBaseNome}) ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase} (penalidade)</code>
                    </div>
                </div>
                
                <!-- PRÉ-REQUISITOS -->
                <div class="modal-prereq">
                    <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                    <div class="prereq-list">
                        ${prereqStatus.resultados.map((r, i) => `
                            <div class="prereq-item ${r.tem ? 'cumprido' : 'pendente'}">
                                <i class="fas fa-${r.tem ? 'check' : 'times'}"></i>
                                <span>${r.nome}</span>
                                <small>${r.tem ? 'OK' : 'FALTANDO'}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${prereqStatus.todosCumpridos ? `
                <!-- OPÇÕES DE PONTOS -->
                <div class="modal-opcoes-pontos">
                    <h4><i class="fas fa-coins"></i> Níveis da Técnica</h4>
                    <div class="pontos-opcoes">
                        <div class="opcao-pontos ${niveisIniciais === 1 ? 'selecionado' : ''}" 
                             onclick="selecionarOpcaoTecnica(this, '${id}')"
                             data-niveis="1" data-pontos="2">
                            <div class="pontos">2 pts</div>
                            <div class="niveis">+1 nível</div>
                            <div class="nh">NH: ${nhArco - 4 + 1}</div>
                        </div>
                        <div class="opcao-pontos ${niveisIniciais === 2 ? 'selecionado' : ''}" 
                             onclick="selecionarOpcaoTecnica(this, '${id}')"
                             data-niveis="2" data-pontos="3">
                            <div class="pontos">3 pts</div>
                            <div class="niveis">+2 níveis</div>
                            <div class="nh">NH: ${nhArco - 4 + 2}</div>
                        </div>
                        <div class="opcao-pontos ${niveisIniciais === 3 ? 'selecionado' : ''}" 
                             onclick="selecionarOpcaoTecnica(this, '${id}')"
                             data-niveis="3" data-pontos="4">
                            <div class="pontos">4 pts</div>
                            <div class="niveis">+3 níveis</div>
                            <div class="nh">NH: ${nhArco - 4 + 3}</div>
                        </div>
                        <div class="opcao-pontos ${niveisIniciais === 4 ? 'selecionado' : ''}" 
                             onclick="selecionarOpcaoTecnica(this, '${id}')"
                             data-niveis="4" data-pontos="5">
                            <div class="pontos">5 pts</div>
                            <div class="niveis">+4 níveis</div>
                            <div class="nh">NH: ${nhArco - 4 + 4}</div>
                        </div>
                    </div>
                </div>
                
                <!-- RESUMO -->
                <div class="modal-resumo">
                    <h4><i class="fas fa-chart-bar"></i> Resumo</h4>
                    <div class="resumo-itens">
                        <div class="resumo-item">
                            <span>Pontos:</span>
                            <strong id="resumo-pontos">${pontosIniciais}</strong>
                        </div>
                        <div class="resumo-item">
                            <span>Níveis:</span>
                            <strong id="resumo-niveis">+${niveisIniciais}</strong>
                        </div>
                        <div class="resumo-item">
                            <span>NH Final:</span>
                            <strong id="resumo-nh">${nhCalculo.nh}</strong>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p><strong>Pré-requisitos não cumpridos!</strong><br>
                    Você precisa aprender as perícias acima para adquirir esta técnica.</p>
                </div>
                `}
            </div>
            
            <div class="modal-tecnica-footer">
                <div class="footer-custo">
                    <span>Custo Total:</span>
                    <strong id="custo-total">${pontosIniciais}</strong>
                    <span> pontos</span>
                </div>
                <div class="footer-botoes">
                    <button class="btn-cancelar" onclick="fecharModalTecnica()">
                        Cancelar
                    </button>
                    <button class="btn-confirmar" 
                            onclick="confirmarTecnica('${id}')"
                            ${prereqStatus.todosCumpridos ? '' : 'disabled'}
                            id="btn-confirmar-tecnica">
                        ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) modal.innerHTML = modalHTML;
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'flex';
    
    // Guarda dados da técnica selecionada
    tecnicaSelecionada = {
        id: id,
        niveis: niveisIniciais,
        pontos: pontosIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
}

// ===== 9. FUNÇÕES DO MODAL =====
function selecionarOpcaoTecnica(elemento, tecnicaId) {
    // Remove seleções anteriores
    elemento.parentElement.querySelectorAll('.opcao-pontos').forEach(op => {
        op.classList.remove('selecionado');
    });
    
    // Seleciona nova
    elemento.classList.add('selecionado');
    
    // Pega dados
    const niveis = parseInt(elemento.dataset.niveis);
    const pontos = parseInt(elemento.dataset.pontos);
    
    // Calcula NH
    const nhFinal = Math.min(tecnicaSelecionada.nhArco - 4 + niveis, tecnicaSelecionada.nhArco);
    
    // Atualiza interface
    document.getElementById('resumo-pontos').textContent = pontos;
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('custo-total').textContent = pontos;
    
    // Atualiza dados
    tecnicaSelecionada.niveis = niveis;
    tecnicaSelecionada.pontos = pontos;
}

function confirmarTecnica(id) {
    if (!tecnicaSelecionada) return;
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    // Verifica pré-requisitos
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('❌ Falta pré-requisitos!');
        return;
    }
    
    const { pontos, niveis } = tecnicaSelecionada;
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualiza
        const pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
        estadoTecnicas.pontosTotais += (pontos - pontosAntigos);
        
        estadoTecnicas.aprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBaseNome
        };
        
        alert(`✅ ${tecnica.nome} atualizada!`);
    } else {
        // Adiciona nova
        estadoTecnicas.aprendidas.push({
            id: id,
            nome: tecnica.nome,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBaseNome
        });
        estadoTecnicas.pontosTotais += pontos;
        
        alert(`✨ ${tecnica.nome} adquirida!`);
    }
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
    localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
    
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) overlay.style.display = 'none';
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) modal.innerHTML = '';
    
    tecnicaSelecionada = null;
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
    
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
    localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
    
    renderizarTodasTecnicas();
}

// ===== 10. FUNÇÕES PRINCIPAIS =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticas();
}

function atualizarEstatisticas() {
    const total = document.getElementById('total-tecnicas');
    const pontos = document.getElementById('pontos-tecnicas');
    const pontosAprendidas = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (total) total.textContent = estadoTecnicas.aprendidas.length;
    if (pontos) pontos.textContent = estadoTecnicas.pontosTotais;
    if (pontosAprendidas) pontosAprendidas.textContent = `${estadoTecnicas.pontosTotais} pts`;
}

function inicializarTecnicas() {
    console.log('🚀 Iniciando sistema de técnicas...');
    renderizarTodasTecnicas();
    
    // Botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.onclick = renderizarTodasTecnicas;
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
}

// ===== 11. INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarTecnicas, 100);
            }
        });
    });
    
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarTecnicas, 200);
    }
});

// ===== 12. EXPORTAR =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;

console.log('✅ Sistema de técnicas carregado!');