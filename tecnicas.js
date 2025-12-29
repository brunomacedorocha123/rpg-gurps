// ============================================
// TECNICAS.JS - SISTEMA 100% INTEGRADO E FUNCIONAL
// ============================================

// ===== 1. CATÁLOGO DE TÉCNICAS =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "Arco", // Nome EXATO da perícia base
        atributo: "DX",
        modificadorBase: -4,
        prereq: ["Arco", "Cavalgar (Cavalo)"], // Nomes EXATOS das perícias
        custoTabela: { 1: 2, 2: 3, 3: 4, 4: 5 } // níveis: pontos
    }
];

// ===== 2. ESTADO DO SISTEMA =====
let estadoTecnicas = {
    aprendidas: JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]'),
    pontosTotais: parseInt(localStorage.getItem('pontos_tecnicas') || '0')
};

let tecnicaSelecionada = null;

// ===== 3. FUNÇÃO CRÍTICA: BUSCAR PERÍCIA ESPECÍFICA =====
function buscarPericiaEspecifica(nomeExato) {
    console.log(`🔍 Buscando perícia: "${nomeExato}"`);
    
    // 1. Tenta buscar no estado global
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const encontrada = window.estadoPericias.periciasAprendidas.find(p => {
            if (!p) return false;
            
            // Verifica por nome completo
            const nomePericia = p.nomeCompleto || p.nome || '';
            console.log(`  Comparando com: "${nomePericia}"`);
            
            // Verificação precisa
            const matchExato = nomePericia.toLowerCase() === nomeExato.toLowerCase();
            const matchContem = nomePericia.toLowerCase().includes(nomeExato.toLowerCase());
            const matchArco = nomeExato.toLowerCase() === 'arco' && 
                             (nomePericia.toLowerCase().includes('arco') || 
                              p.nome?.toLowerCase().includes('arco'));
            const matchCavalgar = nomeExato.toLowerCase().includes('cavalgar') && 
                                 (nomePericia.toLowerCase().includes('cavalgar') || 
                                  p.nome?.toLowerCase().includes('cavalgar'));
            
            return matchExato || matchContem || matchArco || matchCavalgar;
        });
        
        if (encontrada) {
            console.log(`✅ Encontrada no estado: ${encontrada.nomeCompleto || encontrada.nome}, NH: ${encontrada.nivel}`);
            return {
                tem: true,
                nivel: encontrada.nivel || 0,
                nome: encontrada.nome,
                nomeCompleto: encontrada.nomeCompleto || encontrada.nome
            };
        }
    }
    
    // 2. Tenta buscar no localStorage
    try {
        const dadosPericias = localStorage.getItem('gurps_pericias');
        if (dadosPericias) {
            const parsed = JSON.parse(dadosPericias);
            if (parsed.periciasAprendidas && Array.isArray(parsed.periciasAprendidas)) {
                const encontrada = parsed.periciasAprendidas.find(p => {
                    if (!p) return false;
                    
                    const nomePericia = p.nomeCompleto || p.nome || '';
                    const matchExato = nomePericia.toLowerCase() === nomeExato.toLowerCase();
                    const matchContem = nomePericia.toLowerCase().includes(nomeExato.toLowerCase());
                    
                    return matchExato || matchContem;
                });
                
                if (encontrada) {
                    console.log(`✅ Encontrada no localStorage: ${encontrada.nomeCompleto || encontrada.nome}`);
                    return {
                        tem: true,
                        nivel: encontrada.nivel || 0,
                        nome: encontrada.nome,
                        nomeCompleto: encontrada.nomeCompleto || encontrada.nome
                    };
                }
            }
        }
    } catch (e) {
        console.warn('⚠️ Erro ao buscar no localStorage:', e);
    }
    
    // 3. Tenta buscar no catálogo
    if (window.obterTodasPericiasSimples) {
        const todasPericias = window.obterTodasPericiasSimples();
        const noCatalogo = todasPericias.find(p => {
            const nomeCatalogo = p.nome || '';
            return nomeCatalogo.toLowerCase() === nomeExato.toLowerCase() || 
                   nomeCatalogo.toLowerCase().includes(nomeExato.toLowerCase());
        });
        
        if (noCatalogo) {
            console.log(`📚 Existe no catálogo, mas não aprendida: ${noCatalogo.nome}`);
            return {
                tem: false,
                nivel: 0,
                nome: noCatalogo.nome,
                noCatalogo: true,
                nomeCompleto: noCatalogo.nome
            };
        }
    }
    
    console.warn(`❌ Perícia não encontrada: "${nomeExato}"`);
    return {
        tem: false,
        nivel: 0,
        nome: nomeExato,
        nomeCompleto: nomeExato
    };
}

// ===== 4. CÁLCULO DO NH - VERSÃO CORRETA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) {
        return { 
            nh: 0, 
            nhPericiaBase: 0,
            nhBaseTecnica: 0,
            calculo: "Técnica não encontrada",
            niveisInvestidos: 0
        };
    }
    
    // Busca o NH da perícia base (Arco)
    const periciaBaseInfo = buscarPericiaEspecifica(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.nivel || 0;
    
    // NH base da técnica: NH da perícia + penalidade (-4)
    const nhBaseTecnica = nhPericiaBase + tecnica.modificadorBase;
    
    // Cada nível investido reduz a penalidade em 1
    // NH final: NH base da técnica + níveis investidos
    let nhFinal = nhBaseTecnica + niveisInvestidos;
    
    // IMPORTANTE: Nunca pode exceder o NH da perícia base
    if (nhFinal > nhPericiaBase) {
        nhFinal = nhPericiaBase;
    }
    
    // Garante que não seja menor que 0
    nhFinal = Math.max(nhFinal, 0);
    
    // Cálculo para exibição
    let calculo = `${nhPericiaBase}${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}`;
    if (niveisInvestidos > 0) {
        calculo += ` + ${niveisInvestidos} nível${niveisInvestidos > 1 ? 's' : ''}`;
    }
    calculo += ` = ${nhFinal}`;
    
    return {
        nh: nhFinal,                    // NH real da técnica
        nhPericiaBase: nhPericiaBase,   // NH da perícia Arco
        nhBaseTecnica: nhBaseTecnica,   // NH base (Arco -4)
        calculo: calculo,               // Cálculo completo
        niveisInvestidos: niveisInvestidos,
        periciaBaseInfo: periciaBaseInfo
    };
}

// ===== 5. VERIFICAR PRÉ-REQUISITOS =====
function verificarPreRequisitos(tecnica) {
    const resultados = tecnica.prereq.map(req => {
        const info = buscarPericiaEspecifica(req);
        return {
            pericia: req,
            tem: info.tem,
            nivel: info.nivel,
            nomeCompleto: info.nomeCompleto,
            info: info
        };
    });
    
    const todosCumpridos = resultados.every(r => r.tem);
    
    return {
        todosCumpridos,
        resultados
    };
}

// ===== 6. RENDERIZAR CATÁLOGO COM NH REAL =====
function renderizarCatalogoTecnicas() {
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
        const prereqStatus = verificarPreRequisitos(tecnica);
        
        // Calcula NH
        const nhCalculo = calcularNHTecnica(
            tecnica.id, 
            jaAprendida ? jaAprendida.niveis : 0
        );
        
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
        } else if (!prereqStatus.todosCumpridos) {
            statusClass = 'bloqueada';
            statusText = 'Pré-requisitos';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            disabled = true;
        }
        
        // Cria o card
        const card = document.createElement('div');
        card.className = 'tecnica-item';
        if (!prereqStatus.todosCumpridos) card.classList.add('bloqueada');
        card.dataset.id = tecnica.id;
        
        card.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-nome-container">
                    <div class="tecnica-nome">
                        <i class="${tecnica.icone}"></i>
                        ${tecnica.nome}
                    </div>
                    <div class="tecnica-tags">
                        <span class="tecnica-dificuldade ${tecnica.dificuldade.toLowerCase()}">
                            ${tecnica.dificuldade}
                        </span>
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
                    <span>Base: ${tecnica.periciaBase} (NH ${nhCalculo.nhPericiaBase})</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calculator"></i>
                    <span>Base Técnica: ${nhCalculo.nhBaseTecnica}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-chart-line"></i>
                    <span>NH: ${nhCalculo.nh}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                <div class="prereq-status">
                    ${prereqStatus.resultados.map(result => `
                        <span class="${result.tem ? 'cumprido' : 'pendente'}">
                            <i class="fas fa-${result.tem ? 'check' : 'times'}"></i> 
                            ${result.nomeCompleto} 
                            ${result.tem ? `(NH ${result.nivel})` : ''}
                        </span>
                    `).join('')}
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
        
        container.appendChild(card);
    });
    
    // Atualiza contador
    const contador = document.getElementById('contador-tecnicas');
    if (contador) {
        contador.textContent = `${CATALOGO_TECNICAS.length} técnica`;
    }
    
    console.log("✅ Catálogo renderizado com NH real");
}

// ===== 7. RENDERIZAR TÉCNICAS APRENDIDAS COM NH REAL =====
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
        
        // Calcula NH com os níveis investidos
        const nhCalculo = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis);
        
        // Busca info da perícia base
        const periciaBaseInfo = buscarPericiaEspecifica(tecnicaBase.periciaBase);
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida-item';
        card.dataset.id = tecnicaAprendida.id;
        
        card.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${tecnicaBase.icone}"></i>
                    <h3>${tecnicaBase.nome}</h3>
                </div>
                <div class="tecnica-aprendida-nh">
                    NH <span class="nh-valor">${nhCalculo.nh}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-info">
                <div class="info-row">
                    <span>Perícia Base:</span>
                    <strong>${tecnicaBase.periciaBase} (NH ${nhCalculo.nhPericiaBase})</strong>
                </div>
                <div class="info-row">
                    <span>Penalidade Base:</span>
                    <strong>${tecnicaBase.modificadorBase}</strong>
                </div>
                <div class="info-row">
                    <span>Níveis Investidos:</span>
                    <strong>+${tecnicaAprendida.niveis}</strong>
                </div>
            </div>
            
            <div class="tecnica-aprendida-calculadora">
                <div class="calc-item">
                    <span>Cálculo:</span>
                    <code>${nhCalculo.calculo}</code>
                </div>
            </div>
            
            <div class="tecnica-aprendida-custo">
                <div class="custo-item">
                    <span>Pontos Investidos:</span>
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
    
    console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s) renderizada(s)`);
}

// ===== 8. MODAL DA TÉCNICA COM CÁLCULOS EM TEMPO REAL =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error("❌ Técnica não encontrada:", id);
        return;
    }
    
    const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
    const prereqStatus = verificarPreRequisitos(tecnica);
    
    // Busca NH da perícia base
    const periciaBaseInfo = buscarPericiaEspecifica(tecnica.periciaBase);
    const nhPericiaBase = periciaBaseInfo.nivel || 0;
    
    // Valores iniciais
    const niveisIniciais = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
    const pontosIniciais = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
    
    // Cálculo inicial
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
                        <strong>${tecnica.periciaBase}</strong>
                    </div>
                    <div class="info-row">
                        <span>NH da Perícia Base:</span>
                        <strong id="nh-pericia-base">${nhPericiaBase}</strong>
                    </div>
                    <div class="info-row">
                        <span>Penalidade Base:</span>
                        <strong>${tecnica.modificadorBase}</strong>
                    </div>
                    <div class="info-row">
                        <span>NH Base da Técnica:</span>
                        <strong id="nh-base-tecnica">${nhCalculo.nhBaseTecnica}</strong>
                    </div>
                </div>
                
                <div class="modal-tecnica-descricao">
                    <p>${tecnica.descricao}</p>
                </div>
                
                <div class="modal-tecnica-prereq">
                    <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                    ${prereqStatus.resultados.map(result => `
                        <div class="prereq-item ${result.tem ? 'cumprido' : 'nao-cumprido'}">
                            <i class="fas fa-${result.tem ? 'check' : 'times'}"></i>
                            <span>${result.nomeCompleto}</span>
                            <small>${result.tem ? `NH ${result.nivel}` : 'Não aprendida'}</small>
                        </div>
                    `).join('')}
                </div>
                
                ${prereqStatus.todosCumpridos ? `
                <div class="modal-tecnica-controles">
                    <div class="controle-pontos">
                        <h4><i class="fas fa-coins"></i> Investir Pontos</h4>
                        <div class="pontos-opcoes">
                            <button class="opcao-pontos ${niveisIniciais === 1 ? 'selecionado' : ''}"
                                    data-niveis="1" data-pontos="2">
                                <span class="pontos-valor">2 pts</span>
                                <span class="niveis-valor">+1 nível</span>
                            </button>
                            <button class="opcao-pontos ${niveisIniciais === 2 ? 'selecionado' : ''}"
                                    data-niveis="2" data-pontos="3">
                                <span class="pontos-valor">3 pts</span>
                                <span class="niveis-valor">+2 níveis</span>
                            </button>
                            <button class="opcao-pontos ${niveisIniciais === 3 ? 'selecionado' : ''}"
                                    data-niveis="3" data-pontos="4">
                                <span class="pontos-valor">4 pts</span>
                                <span class="niveis-valor">+3 níveis</span>
                            </button>
                            <button class="opcao-pontos ${niveisIniciais === 4 ? 'selecionado' : ''}"
                                    data-niveis="4" data-pontos="5">
                                <span class="pontos-valor">5 pts</span>
                                <span class="niveis-valor">+4 níveis</span>
                            </button>
                        </div>
                    </div>
                    
                    <div class="visualizacao-nh">
                        <h4><i class="fas fa-calculator"></i> Cálculo do NH</h4>
                        <div class="nh-calculado">
                            <div class="nh-item">
                                <span>NH da Perícia:</span>
                                <strong>${nhPericiaBase}</strong>
                            </div>
                            <div class="nh-item">
                                <span>Penalidade:</span>
                                <strong>${tecnica.modificadorBase}</strong>
                            </div>
                            <div class="nh-item">
                                <span>Níveis Adicionais:</span>
                                <strong id="nh-niveis-adicionais">+${niveisIniciais}</strong>
                            </div>
                            <div class="nh-item total">
                                <span>NH Final:</span>
                                <strong id="nh-final-tecnica">${nhCalculo.nh}</strong>
                            </div>
                        </div>
                        <div class="formula-nh">
                            <code>${nhPericiaBase} ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase} + ${niveisIniciais} = ${nhCalculo.nh}</code>
                        </div>
                    </div>
                </div>
                ` : `
                <div class="prereq-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos não cumpridos!</strong>
                        <p>Você precisa aprender as perícias abaixo para adquirir esta técnica.</p>
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
                    <span class="valor" id="modal-custo-total-tecnica">${pontosIniciais}</span>
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
        
        // Adiciona event listeners para as opções
        modal.querySelectorAll('.opcao-pontos').forEach(opcao => {
            opcao.addEventListener('click', function() {
                selecionarOpcaoTecnica(this, id);
            });
        });
    }
    
    // Mostra o modal
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Inicializa dados da técnica selecionada
    tecnicaSelecionada = {
        id: id,
        niveis: niveisIniciais,
        pontos: pontosIniciais,
        nhPericiaBase: nhPericiaBase,
        modificador: tecnica.modificadorBase
    };
    
    console.log(`📋 Modal aberto: ${tecnica.nome}, NH base: ${nhPericiaBase}`);
}

// ===== 9. SELEÇÃO DE OPÇÕES NO MODAL =====
function selecionarOpcaoTecnica(elemento, tecnicaId) {
    // Remove seleção de todas as opções
    elemento.closest('.pontos-opcoes').querySelectorAll('.opcao-pontos').forEach(opcao => {
        opcao.classList.remove('selecionado');
    });
    
    // Adiciona seleção à opção clicada
    elemento.classList.add('selecionado');
    
    // Pega dados da opção
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
    
    // Atualiza a interface
    document.getElementById('resumo-pontos').textContent = pontos;
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal.nh;
    document.getElementById('modal-custo-total-tecnica').textContent = pontos;
    
    // Atualiza cálculo
    document.getElementById('nh-niveis-adicionais').textContent = `+${niveis}`;
    document.getElementById('nh-final-tecnica').textContent = nhFinal.nh;
    
    // Atualiza fórmula
    const formula = document.querySelector('.formula-nh code');
    if (formula) {
        formula.textContent = `${tecnicaSelecionada.nhPericiaBase} ${tecnicaSelecionada.modificador >= 0 ? '+' : ''}${tecnicaSelecionada.modificador} + ${niveis} = ${nhFinal.nh}`;
    }
    
    console.log(`⚙️ Selecionado: ${pontos} pts, +${niveis} níveis, NH: ${nhFinal.nh}`);
}

// ===== 10. CONFIRMAR/AQUIRIR TÉCNICA =====
function confirmarTecnica(id) {
    if (!tecnicaSelecionada) {
        alert('❌ Erro: Nenhuma opção selecionada');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        alert('❌ Erro: Técnica não encontrada');
        return;
    }
    
    // Verifica pré-requisitos novamente
    const prereqStatus = verificarPreRequisitos(tecnica);
    if (!prereqStatus.todosCumpridos) {
        alert('❌ Pré-requisitos não cumpridos!');
        return;
    }
    
    const { pontos, niveis } = tecnicaSelecionada;
    const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
        estadoTecnicas.pontosTotais += (pontos - pontosAntigos);
        
        estadoTecnicas.aprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase
        };
        
        mostrarNotificacao(`✅ ${tecnica.nome} atualizada! NH: ${calcularNHTecnica(id, niveis).nh}`, 'success');
        console.log(`🔄 Técnica atualizada: ${tecnica.nome}`);
    } else {
        // Adicionar nova técnica
        estadoTecnicas.aprendidas.push({
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase
        });
        estadoTecnicas.pontosTotais += pontos;
        
        mostrarNotificacao(`✨ ${tecnica.nome} adquirida! NH: ${calcularNHTecnica(id, niveis).nh}`, 'success');
        console.log(`✨ Técnica adquirida: ${tecnica.nome}`);
    }
    
    salvarTecnicas();
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 11. FUNÇÕES ADICIONAIS =====
function editarTecnica(id) {
    console.log(`✏️ Editando técnica: ${id}`);
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Tem certeza que deseja remover a técnica "${tecnica.nome}"?`)) {
        return;
    }
    
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) {
        console.error("❌ Técnica não encontrada para remover:", id);
        return;
    }
    
    const tecnicaRemovida = estadoTecnicas.aprendidas[index];
    estadoTecnicas.pontosTotais -= tecnicaRemovida.pontos;
    estadoTecnicas.aprendidas.splice(index, 1);
    
    salvarTecnicas();
    renderizarTodasTecnicas();
    
    mostrarNotificacao(`🗑️ ${tecnicaRemovida.nome} removida!`, 'info');
    console.log(`🗑️ Técnica removida: ${tecnica.nome}`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = `
            <div class="modal-tecnica-loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Carregando técnica...</p>
            </div>
        `;
    }
    
    tecnicaSelecionada = null;
    console.log("🚪 Modal fechado");
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

// ===== 12. NOTIFICAÇÕES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao-tecnica ${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-conteudo">
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-triangle' : tipo === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${mensagem}</span>
        </div>
        <button class="notificacao-fechar" onclick="this.parentElement.remove()">&times;</button>
    `;
    
    document.body.appendChild(notificacao);
    
    // Anima entrada
    setTimeout(() => notificacao.classList.add('show'), 10);
    
    // Remove após 5 segundos
    setTimeout(() => {
        if (notificacao.parentNode) {
            notificacao.classList.remove('show');
            setTimeout(() => {
                if (notificacao.parentNode) notificacao.parentNode.removeChild(notificacao);
            }, 300);
        }
    }, 5000);
}

// ===== 13. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    const elementos = [
        { id: 'total-tecnicas', valor: estadoTecnicas.aprendidas.length },
        { id: 'pontos-tecnicas', valor: estadoTecnicas.pontosTotais },
        { id: 'pontos-tecnicas-aprendidas', valor: `${estadoTecnicas.pontosTotais} pts` }
    ];
    
    elementos.forEach(elem => {
        const el = document.getElementById(elem.id);
        if (el) el.textContent = elem.valor;
    });
    
    console.log("📊 Estatísticas de técnicas atualizadas");
}

// ===== 14. RENDERIZAR TUDO =====
function renderizarTodasTecnicas() {
    console.log("🔄 Renderizando todas as técnicas...");
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
    console.log("✅ Técnicas renderizadas com sucesso");
}

// ===== 15. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log("🔧 Inicializando sistema de técnicas...");
    
    // Botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            console.log("🔄 Atualizando técnicas manualmente...");
            renderizarTodasTecnicas();
            mostrarNotificacao('Técnicas atualizadas!', 'info');
        });
    }
    
    // Fechar modal ao clicar fora
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                fecharModalTecnica();
            }
        });
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
    
    // Renderiza tudo
    renderizarTodasTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado");
}

// ===== 16. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando sistema de técnicas");
    
    // Quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            
            if (subtab === 'tecnicas') {
                console.log("🎯 Aba de técnicas ativada");
                setTimeout(inicializarSistemaTecnicas, 50);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        console.log("✅ Aba de técnicas já ativa");
        setTimeout(inicializarSistemaTecnicas, 100);
    }
});

// ===== 17. EXPORTAR FUNÇÕES PARA USO GLOBAL =====
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.calcularNHTecnica = calcularNHTecnica;
window.buscarPericiaEspecifica = buscarPericiaEspecifica;

console.log("✅ SISTEMA DE TÉCNICAS 100% INTEGRADO CARREGADO");