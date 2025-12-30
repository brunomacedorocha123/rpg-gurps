// ============================================
// TECNICAS.JS - SISTEMA CORRIGIDO E FUNCIONAL
// ============================================

// ===== 1. CONFIGURAÇÃO INICIAL =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        modificadorBase: -4,
        prereq: ["Arco", "Cavalgar"]
    }
];

// ===== 2. ESTADO DO SISTEMA =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');
let tecnicaSelecionada = null;

// ===== 3. FUNÇÃO CRÍTICA: BUSCAR NH DO ARCO =====
function buscarNHArco() {
    console.log("🔍 Iniciando busca do NH do Arco...");
    
    // Estratégia 1: Verificar o sistema global de perícias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        console.log("📁 Buscando em window.estadoPericias...");
        const pericias = window.estadoPericias.periciasAprendidas;
        
        // Busca por ID exato
        let arco = pericias.find(p => p && p.id === "arco");
        
        // Busca por nome
        if (!arco) {
            arco = pericias.find(p => {
                if (!p) return false;
                const nome = (p.nome || '').toLowerCase();
                const nomeCompleto = (p.nomeCompleto || '').toLowerCase();
                return nome === "arco" || nomeCompleto === "arco" || 
                       nome.includes("arco") || nomeCompleto.includes("arco");
            });
        }
        
        if (arco) {
            const nivel = arco.nivel || arco.NH || arco.nivelHabilidade || 0;
            console.log(`✅ NH do Arco encontrado: ${nivel}`);
            return nivel;
        }
    }
    
    // Estratégia 2: Verificar localStorage do sistema de perícias
    try {
        const dadosPericias = localStorage.getItem('gurps_pericias');
        if (dadosPericias) {
            console.log("📁 Buscando em localStorage (gurps_pericias)...");
            const parsed = JSON.parse(dadosPericias);
            const pericias = parsed.periciasAprendidas || [];
            
            // Busca por ID exato
            let arco = pericias.find(p => p && p.id === "arco");
            
            // Busca por nome
            if (!arco) {
                arco = pericias.find(p => {
                    if (!p) return false;
                    const nome = (p.nome || '').toLowerCase();
                    const nomeCompleto = (p.nomeCompleto || '').toLowerCase();
                    return nome === "arco" || nomeCompleto === "arco" || 
                           nome.includes("arco") || nomeCompleto.includes("arco");
                });
            }
            
            if (arco) {
                const nivel = arco.nivel || arco.NH || arco.nivelHabilidade || 0;
                console.log(`✅ NH do Arco encontrado: ${nivel}`);
                return nivel;
            }
        }
    } catch (e) {
        console.log("⚠️ Erro ao ler localStorage:", e);
    }
    
    // Estratégia 3: Verificar localStorage direto
    try {
        const dadosArco = localStorage.getItem('pericia_arco');
        if (dadosArco) {
            console.log("📁 Buscando em localStorage direto...");
            const parsed = JSON.parse(dadosArco);
            if (parsed.nivel || parsed.NH) {
                const nivel = parsed.nivel || parsed.NH || 0;
                console.log(`✅ NH do Arco encontrado: ${nivel}`);
                return nivel;
            }
        }
    } catch (e) {
        // Ignorar erro
    }
    
    console.log("⚠️ NH do Arco não encontrado, usando default 10");
    return 10; // Default do sistema
}

// ===== 4. FUNÇÃO CRÍTICA: VERIFICAR SE TEM CAVALGAR =====
function verificarCavalgar() {
    // Verificar no sistema global
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        const temCavalgar = pericias.some(p => {
            if (!p) return false;
            const nome = (p.nome || '').toLowerCase();
            const nomeCompleto = (p.nomeCompleto || '').toLowerCase();
            const id = (p.id || '').toLowerCase();
            
            return nome.includes("cavalgar") || 
                   nomeCompleto.includes("cavalgar") || 
                   id.includes("cavalgar");
        });
        
        if (temCavalgar) {
            console.log("✅ Cavalgar encontrado no sistema global");
            return true;
        }
    }
    
    // Verificar no localStorage
    try {
        const dadosPericias = localStorage.getItem('gurps_pericias');
        if (dadosPericias) {
            const parsed = JSON.parse(dadosPericias);
            const pericias = parsed.periciasAprendidas || [];
            
            const temCavalgar = pericias.some(p => {
                if (!p) return false;
                const nome = (p.nome || '').toLowerCase();
                const nomeCompleto = (p.nomeCompleto || '').toLowerCase();
                const id = (p.id || '').toLowerCase();
                
                return nome.includes("cavalgar") || 
                       nomeCompleto.includes("cavalgar") || 
                       id.includes("cavalgar");
            });
            
            if (temCavalgar) {
                console.log("✅ Cavalgar encontrado no localStorage");
                return true;
            }
        }
    } catch (e) {
        // Ignorar erro
    }
    
    console.log("❌ Cavalgar não encontrado");
    return false;
}

// ===== 5. VERIFICAR PRÉ-REQUISITOS =====
function verificarPrereqTecnica(tecnica) {
    const temArco = buscarNHArco() > 0; // Se tem NH > 0, tem a perícia
    const temCavalgar = verificarCavalgar();
    
    return {
        arco: { tem: temArco, nivel: buscarNHArco() },
        cavalgar: { tem: temCavalgar },
        todosCumpridos: temArco && temCavalgar
    };
}

// ===== 6. CALCULAR NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0 };
    
    const nhArco = buscarNHArco();
    
    if (nhArco <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            bonusNiveis: 0
        };
    }
    
    const nhBaseCalculado = nhArco + tecnica.modificadorBase;
    const nhComNiveis = Math.min(nhBaseCalculado + niveisInvestidos, nhArco);
    const nhFinal = Math.max(nhComNiveis, 0);
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        bonusNiveis: niveisInvestidos,
        modificador: tecnica.modificadorBase
    };
}

// ===== 7. RENDERIZAR CATÁLOGO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (CATALOGO_TECNICAS.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tools"></i>
                <h4>Nenhuma técnica disponível</h4>
                <p>As técnicas aparecerão aqui quando você aprender as perícias necessárias</p>
            </div>
        `;
        return;
    }
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
        // Determinar status
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
        } else if (!prereq.todosCumpridos) {
            statusClass = 'bloqueada';
            statusText = 'Bloqueada';
            btnText = 'Ver Pré-requisitos';
            btnIcon = 'fa-lock';
            disabled = true;
        }
        
        // Criar card
        const cardHTML = `
            <div class="tecnica-item" data-id="${tecnica.id}">
                <div class="tecnica-header">
                    <div class="tecnica-nome-container">
                        <div class="tecnica-nome">
                            <i class="${tecnica.icone}"></i>
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
                        <span>Base: ${tecnica.periciaBase} ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-arrow-up"></i>
                        <span>Mod: ${tecnica.modificadorBase}</span>
                    </div>
                    <div class="info-item">
                        <i class="fas fa-coins"></i>
                        <span>${jaAprendida ? 'Investido: ' + jaAprendida.pontos + ' pts' : 'Custo: 2-5 pts'}</span>
                    </div>
                </div>
                
                <div class="tecnica-prereq">
                    <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
                    <span>
                        ${prereq.arco.tem ? '✅' : '❌'} Arco 
                        ${prereq.cavalgar.tem ? '✅' : '❌'} Cavalgar (qualquer)
                    </span>
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

// ===== 8. RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você adquirir aparecerão aqui</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasAprendidas.forEach(tecnicaAprendida => {
        const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
        if (!tecnicaBase) return;
        
        const nhCalculo = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis || 0);
        
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
                        <strong>${tecnicaBase.periciaBase} (NH ${nhCalculo.nhBase})</strong>
                    </div>
                    <div class="info-row">
                        <span>Níveis:</span>
                        <strong>+${tecnicaAprendida.niveis || 0}</strong>
                    </div>
                    <div class="info-row">
                        <span>Pontos:</span>
                        <strong>${tecnicaAprendida.pontos || 0} pts</strong>
                    </div>
                </div>
                
                <div class="tecnica-aprendida-controles">
                    <div class="nivel-info">
                        <span>Limite: NH ${tecnicaBase.periciaBase} = ${nhCalculo.nhBase}</span>
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
            </div>
        `;
        
        container.innerHTML += cardHTML;
    });
}

// ===== 9. ABRIR MODAL =====
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    // Configurar opções iniciais
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    const nhArco = buscarNHArco();
    
    // Calcular NH inicial
    const nhInicial = Math.min(nhArco + tecnica.modificadorBase + niveisIniciais, nhArco);
    
    // Criar modal
    const modalHTML = `
        <div class="modal-tecnica-content">
            <div class="modal-tecnica-header">
                <h3><i class="${tecnica.icone}"></i> <span class="modal-tecnica-nome">${tecnica.nome}</span></h3>
                <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-tecnica-body">
                <div class="modal-tecnica-info">
                    <div class="info-row">
                        <span class="info-label">Dificuldade:</span>
                        <span class="info-value modal-tecnica-dificuldade">${tecnica.dificuldade}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Perícia Base:</span>
                        <span class="info-value modal-tecnica-pericia">${tecnica.periciaBase}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Modificador Base:</span>
                        <span class="info-value modal-tecnica-modificador">${tecnica.modificadorBase}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Pré-requisitos:</span>
                        <span class="info-value modal-tecnica-prereq">Arco, Cavalgar (qualquer)</span>
                    </div>
                </div>
                
                <div class="modal-tecnica-descricao">
                    <h4>Descrição</h4>
                    <p class="modal-tecnica-descricao-texto">${tecnica.descricao}</p>
                </div>
                
                <!-- PRÉ-REQUISITOS STATUS -->
                <div class="modal-tecnica-prereq-status">
                    <h4>Status dos Pré-requisitos</h4>
                    <div class="prereq-status-list">
                        <div class="prereq-item ${prereq.arco.tem ? 'cumprido' : 'nao-cumprido'}">
                            <i class="fas fa-${prereq.arco.tem ? 'check' : 'times'}"></i>
                            <span>Arco ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}</span>
                            <small>${prereq.arco.tem ? 'Cumprido' : 'Não aprendido'}</small>
                        </div>
                        <div class="prereq-item ${prereq.cavalgar.tem ? 'cumprido' : 'nao-cumprido'}">
                            <i class="fas fa-${prereq.cavalgar.tem ? 'check' : 'times'}"></i>
                            <span>Cavalgar (qualquer)</span>
                            <small>${prereq.cavalgar.tem ? 'Cumprido' : 'Não aprendido'}</small>
                        </div>
                    </div>
                </div>
                
                ${prereq.todosCumpridos ? `
                <!-- CONTROLE DE PONTOS -->
                <div class="modal-tecnica-controles">
                    <div class="controle-pontos">
                        <h4>Investir Pontos</h4>
                        <div class="pontos-opcoes">
                            <div class="opcao-pontos ${niveisIniciais === 1 ? 'selecionado' : ''}" data-pontos="2" data-niveis="1">
                                <span class="pontos-valor">2 pts</span>
                                <span class="niveis-valor">= +1 nível</span>
                            </div>
                            <div class="opcao-pontos ${niveisIniciais === 2 ? 'selecionado' : ''}" data-pontos="3" data-niveis="2">
                                <span class="pontos-valor">3 pts</span>
                                <span class="niveis-valor">= +2 níveis</span>
                            </div>
                            <div class="opcao-pontos ${niveisIniciais === 3 ? 'selecionado' : ''}" data-pontos="4" data-niveis="3">
                                <span class="pontos-valor">4 pts</span>
                                <span class="niveis-valor">= +3 níveis</span>
                            </div>
                            <div class="opcao-pontos ${niveisIniciais === 4 ? 'selecionado' : ''}" data-pontos="5" data-niveis="4">
                                <span class="pontos-valor">5 pts</span>
                                <span class="niveis-valor">= +4 níveis</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- VISUALIZAÇÃO DO NH -->
                    <div class="visualizacao-nh">
                        <h4>Nível de Habilidade (NH)</h4>
                        <div class="nh-calculado">
                            <div class="nh-base">
                                <span>Arco (NH ${nhArco}):</span>
                                <strong>${nhArco}</strong>
                            </div>
                            <div class="nh-modificador">
                                <span>Penalidade base:</span>
                                <strong>${tecnica.modificadorBase}</strong>
                            </div>
                            <div class="nh-modificador">
                                <span>Níveis adquiridos:</span>
                                <strong id="nh-niveis-display">+${niveisIniciais}</strong>
                            </div>
                            <div class="nh-total">
                                <span>NH Final:</span>
                                <strong id="nh-total-display">${nhInicial}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- RESUMO DO CUSTO -->
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
                        <strong id="resumo-nh">${nhInicial}</strong>
                    </div>
                </div>
                ` : `
                <div class="prereq-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos não cumpridos</strong>
                        <p>Você precisa aprender Arco (com pelo menos 1 ponto) e qualquer especialização de Cavalgar.</p>
                    </div>
                </div>
                `}
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
                    ${prereq.todosCumpridos ? `
                    <button class="btn-modal btn-modal-confirmar" onclick="confirmarTecnica('${id}')" id="btn-confirmar-tecnica">
                        <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar' : 'Adquirir'}
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    // Inserir modal
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
    }
    
    // Mostrar modal
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Configurar seleção inicial
    tecnicaSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
    
    // Adicionar listeners para as opções
    if (prereq.todosCumpridos) {
        setTimeout(() => {
            document.querySelectorAll('.opcao-pontos').forEach(opcao => {
                opcao.addEventListener('click', function() {
                    const pontos = parseInt(this.dataset.pontos);
                    const niveis = parseInt(this.dataset.niveis);
                    
                    // Remover seleção anterior
                    document.querySelectorAll('.opcao-pontos').forEach(o => {
                        o.classList.remove('selecionado');
                    });
                    
                    // Selecionar esta opção
                    this.classList.add('selecionado');
                    
                    // Atualizar estado
                    tecnicaSelecionada.pontos = pontos;
                    tecnicaSelecionada.niveis = niveis;
                    
                    // Calcular novo NH
                    const nhCalculado = Math.min(
                        nhArco + tecnica.modificadorBase + niveis,
                        nhArco
                    );
                    
                    // Atualizar displays
                    document.getElementById('nh-niveis-display').textContent = `+${niveis}`;
                    document.getElementById('nh-total-display').textContent = nhCalculado;
                    document.getElementById('resumo-pontos').textContent = pontos;
                    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
                    document.getElementById('resumo-nh').textContent = nhCalculado;
                    document.getElementById('modal-custo-total-tecnica').textContent = pontos;
                });
            });
        }, 100);
    }
}

// ===== 10. CONFIRMAR TÉCNICA =====
function confirmarTecnica(id) {
    if (!tecnicaSelecionada) {
        alert('Por favor, selecione uma opção de níveis primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaSelecionada;
    
    // Verificar pré-requisitos novamente
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('Pré-requisitos não cumpridos!');
        return;
    }
    
    // Calcular NH final
    const nhArco = buscarNHArco();
    const nhFinal = Math.min(nhArco + tecnica.modificadorBase + niveis, nhArco);
    
    // Confirmar com o usuário
    if (!confirm(
        `Deseja ${tecnicasAprendidas.find(t => t.id === id) ? 'atualizar' : 'adquirir'} "${tecnica.nome}"?\n\n` +
        `• Pontos gastos: ${pontos}\n` +
        `• Níveis: +${niveis}\n` +
        `• NH final: ${nhFinal}`
    )) {
        return;
    }
    
    // Salvar técnica
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos || 0;
        pontosTecnicas += (pontos - pontosAntigos);
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            dataAtualizacao: new Date().toISOString()
        };
    } else {
        // Adicionar nova técnica
        tecnicasAprendidas.push({
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            dataAquisicao: new Date().toISOString()
        });
        pontosTecnicas += pontos;
    }
    
    // Salvar no localStorage
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fechar modal e atualizar display
    fecharModalTecnica();
    renderizarTodasTecnicas();
    
    // Mostrar confirmação
    alert(`${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'} com sucesso!`);
}

// ===== 11. FUNÇÕES AUXILIARES =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Tem certeza que deseja remover "${tecnica.nome}"?`)) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    pontosTecnicas -= tecnicasAprendidas[index].pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    renderizarTodasTecnicas();
    
    alert(`${tecnica.nome} removida com sucesso!`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    tecnicaSelecionada = null;
}

// ===== 12. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
    
    // Atualizar resumo
    const nivelMedioElement = document.getElementById('nivel-medio-tecnicas');
    const custoTotalElement = document.getElementById('custo-total-tecnicas');
    
    if (nivelMedioElement) {
        if (tecnicasAprendidas.length > 0) {
            const media = tecnicasAprendidas.reduce((sum, t) => sum + (t.niveis || 0), 0) / tecnicasAprendidas.length;
            nivelMedioElement.textContent = media.toFixed(1);
        } else {
            nivelMedioElement.textContent = '0';
        }
    }
    
    if (custoTotalElement) {
        custoTotalElement.textContent = pontosTecnicas;
    }
}

// ===== 13. FUNÇÃO PRINCIPAL =====
function renderizarTodasTecnicas() {
    console.log('🔄 Renderizando técnicas...');
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 14. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log('🚀 Inicializando sistema de técnicas...');
    
    // Carregar dados salvos
    try {
        const dadosTecnicas = localStorage.getItem('tecnicas_aprendidas');
        if (dadosTecnicas) {
            tecnicasAprendidas = JSON.parse(dadosTecnicas);
            console.log(`📁 Carregadas ${tecnicasAprendidas.length} técnicas do localStorage`);
        }
        
        const dadosPontos = localStorage.getItem('pontos_tecnicas');
        if (dadosPontos) {
            pontosTecnicas = parseInt(dadosPontos);
            console.log(`📁 Pontos totais: ${pontosTecnicas}`);
        }
    } catch (e) {
        console.error('❌ Erro ao carregar técnicas:', e);
    }
    
    // Configurar botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            console.log('🔄 Atualizando técnicas manualmente...');
            renderizarTodasTecnicas();
        });
    }
    
    // Renderizar inicial
    renderizarTodasTecnicas();
    
    console.log('✅ Sistema de técnicas inicializado!');
}

// ===== 15. EVENTOS =====
document.addEventListener('DOMContentLoaded', function() {
    // Quando clicar na sub-aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(() => {
                    console.log('📌 Acesso à aba de técnicas detectado');
                    inicializarSistemaTecnicas();
                }, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas ao carregar
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(() => {
            console.log('📌 Aba de técnicas já ativa ao carregar');
            inicializarSistemaTecnicas();
        }, 200);
    }
});

// ===== 16. EXPORTAR FUNÇÕES =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log('✅ TECNICAS.JS carregado e pronto!');