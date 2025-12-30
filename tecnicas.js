// ============================================
// TECNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

// ===== 1. CATÁLOGO DE TÉCNICAS =====
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

// ===== 2. CUSTOS DE TÉCNICAS =====
const CUSTOS_TECNICAS = [
    { niveis: 1, pontos: 2 },
    { niveis: 2, pontos: 3 },
    { niveis: 3, pontos: 4 },
    { niveis: 4, pontos: 5 }
];

// ===== 3. ESTADO DO SISTEMA =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');
let tecnicaSelecionada = null;

// ===== 4. SISTEMA DE BUSCA INTELIGENTE DE PERÍCIAS =====

/**
 * BUSCA UNIVERSAL - Encontra perícia em QUALQUER lugar do sistema
 */
function buscarPericiaUniversal(nomePericia) {
    console.log(`🔍 Buscando perícia: ${nomePericia}`);
    
    // Converter para padrão de busca
    const busca = nomePericia.toLowerCase();
    let resultado = { tem: false, nivel: 0, dados: null };
    
    // ESTRATÉGIA 1: Buscar no CATÁLOGO DE PERÍCIAS (seu arquivo catalogo-pericias.js)
    if (window.catalogoPericias) {
        console.log("📚 Buscando no catálogo de perícias...");
        const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
        
        for (const pericia of todasPericias) {
            if (!pericia) continue;
            
            const nome = (pericia.nome || '').toLowerCase();
            const id = (pericia.id || '').toLowerCase();
            
            if (nome.includes(busca) || id.includes(busca)) {
                console.log(`✅ Encontrada no catálogo: ${pericia.nome}`);
                
                // Agora buscar se está aprendida
                const aprendida = buscarPericiaAprendida(pericia.id || pericia.nome);
                if (aprendida.tem) {
                    return aprendida;
                }
            }
        }
    }
    
    // ESTRATÉGIA 2: Buscar em PERÍCIAS APRENDIDAS (sistema principal)
    resultado = buscarPericiaAprendida(nomePericia);
    if (resultado.tem) {
        console.log(`✅ ${nomePericia} encontrada nas perícias aprendidas: NH ${resultado.nivel}`);
        return resultado;
    }
    
    // ESTRATÉGIA 3: Buscar em window.estadoPericias (se existir)
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        console.log("💾 Buscando em window.estadoPericias...");
        const pericias = window.estadoPericias.periciasAprendidas || [];
        
        for (const pericia of pericias) {
            if (!pericia) continue;
            
            const nome = (pericia.nome || '').toLowerCase();
            const nomeCompleto = (pericia.nomeCompleto || '').toLowerCase();
            const id = (pericia.id || '').toLowerCase();
            
            if (nome.includes(busca) || nomeCompleto.includes(busca) || id.includes(busca)) {
                const nivel = pericia.nivel || pericia.NH || pericia.nivelHabilidade || 0;
                console.log(`✅ Encontrada em estadoPericias: ${pericia.nome || pericia.nomeCompleto} - NH ${nivel}`);
                return { 
                    tem: true, 
                    nivel: nivel,
                    dados: pericia
                };
            }
        }
    }
    
    // ESTRATÉGIA 4: Buscar em localStorage do sistema de perícias
    console.log("💾 Buscando em localStorage...");
    const chaves = [
        'gurps_pericias',
        'pericias_aprendidas',
        'pericias_personagem',
        'personagem_pericias'
    ];
    
    for (const chave of chaves) {
        try {
            const dados = localStorage.getItem(chave);
            if (!dados) continue;
            
            const parsed = JSON.parse(dados);
            const resultadoLocal = buscarPericiaEmDados(parsed, nomePericia, chave);
            
            if (resultadoLocal.tem) {
                console.log(`✅ Encontrada em ${chave}: NH ${resultadoLocal.nivel}`);
                return resultadoLocal;
            }
        } catch (e) {
            // Ignorar erro
        }
    }
    
    // ESTRATÉGIA 5: Buscar na DOM (último recurso)
    console.log("🌐 Buscando na DOM...");
    const resultadoDOM = buscarPericiaNaDOM(nomePericia);
    if (resultadoDOM.tem) {
        console.log(`✅ Encontrada na DOM: NH ${resultadoDOM.nivel}`);
        return resultadoDOM;
    }
    
    console.log(`❌ ${nomePericia} não encontrada em nenhum lugar`);
    return { tem: false, nivel: 0, dados: null };
}

/**
 * Busca perícia aprendida específica
 */
function buscarPericiaAprendida(nomeOuId) {
    const busca = nomeOuId.toLowerCase();
    
    // Primeiro, verificar se há função global para obter perícias aprendidas
    if (window.obterPericiasAprendidas && typeof window.obterPericiasAprendidas === 'function') {
        try {
            const pericias = window.obterPericiasAprendidas();
            if (pericias && Array.isArray(pericias)) {
                for (const pericia of pericias) {
                    if (!pericia) continue;
                    
                    const nome = (pericia.nome || '').toLowerCase();
                    const id = (pericia.id || '').toLowerCase();
                    const nomeCompleto = (pericia.nomeCompleto || '').toLowerCase();
                    
                    if (nome.includes(busca) || id.includes(busca) || nomeCompleto.includes(busca)) {
                        const nivel = pericia.nivel || pericia.NH || pericia.nivelHabilidade || 10;
                        return { tem: true, nivel: nivel, dados: pericia };
                    }
                }
            }
        } catch (e) {
            console.log("⚠️ Erro ao chamar obterPericiasAprendidas:", e);
        }
    }
    
    // Se não encontrar, retornar falso
    return { tem: false, nivel: 0, dados: null };
}

/**
 * Busca perícia em dados estruturados
 */
function buscarPericiaEmDados(dados, nomePericia, origem) {
    const busca = nomePericia.toLowerCase();
    
    if (!dados || typeof dados !== 'object') {
        return { tem: false, nivel: 0 };
    }
    
    // Se for array de perícias
    if (Array.isArray(dados)) {
        for (const item of dados) {
            if (!item) continue;
            
            // Verificar se é objeto de perícia
            if (typeof item === 'object') {
                const nome = (item.nome || '').toLowerCase();
                const id = (item.id || '').toLowerCase();
                const nomeCompleto = (item.nomeCompleto || '').toLowerCase();
                
                if (nome.includes(busca) || id.includes(busca) || nomeCompleto.includes(busca)) {
                    const nivel = item.nivel || item.NH || item.nivelHabilidade || 10;
                    return { tem: true, nivel: nivel, dados: item };
                }
            }
        }
    }
    
    // Se for objeto, buscar recursivamente
    if (typeof dados === 'object' && dados !== null) {
        for (const key in dados) {
            if (key.toLowerCase().includes('pericia') || key.toLowerCase().includes('skill')) {
                const resultado = buscarPericiaEmDados(dados[key], nomePericia, `${origem}.${key}`);
                if (resultado.tem) return resultado;
            }
            
            // Buscar recursivamente em todas as propriedades
            if (dados[key] && typeof dados[key] === 'object') {
                const resultado = buscarPericiaEmDados(dados[key], nomePericia, `${origem}.${key}`);
                if (resultado.tem) return resultado;
            }
        }
    }
    
    return { tem: false, nivel: 0 };
}

/**
 * Busca perícia diretamente na DOM (para quando os dados estão visíveis)
 */
function buscarPericiaNaDOM(nomePericia) {
    const busca = nomePericia.toLowerCase();
    const container = document.getElementById('pericias-aprendidas');
    
    if (!container) return { tem: false, nivel: 0 };
    
    // Procurar por elementos que contenham o nome da perícia
    const elementos = container.querySelectorAll('[class*="pericia"], [class*="skill"], .pericia-item, .pericia-aprendida-item');
    
    for (const elemento of elementos) {
        const texto = elemento.textContent || '';
        if (texto.toLowerCase().includes(busca)) {
            console.log("📄 Encontrado na DOM:", texto.substring(0, 100));
            
            // Tentar extrair o nível
            const niveis = elemento.querySelectorAll('.nivel-display, .nh-valor, .nivel-valor, .valor, strong');
            for (const nivelEl of niveis) {
                const textoNivel = nivelEl.textContent || '';
                const match = textoNivel.match(/\d+/);
                if (match) {
                    const nivel = parseInt(match[0]);
                    if (!isNaN(nivel) && nivel > 0) {
                        return { tem: true, nivel: nivel };
                    }
                }
            }
        }
    }
    
    return { tem: false, nivel: 0 };
}

// ===== 5. FUNÇÕES ESPECÍFICAS PARA AS TÉCNICAS =====

/**
 * Buscar NH do Arco (otimizada)
 */
function buscarNHArco() {
    console.log("🎯 Buscando NH do Arco...");
    
    // Buscar usando o sistema universal
    const resultado = buscarPericiaUniversal("Arco");
    
    if (resultado.tem && resultado.nivel > 0) {
        console.log(`✅ NH do Arco encontrado: ${resultado.nivel}`);
        return resultado.nivel;
    }
    
    // Se não encontrar, usar valor padrão do GURPS
    console.log("⚠️ NH do Arco não encontrado, usando default 12");
    return 12;
}

/**
 * Verificar se tem Cavalgar (qualquer especialização)
 */
function verificarCavalgar() {
    console.log("🎯 Verificando Cavalgar...");
    
    // Buscar usando o sistema universal
    const resultado = buscarPericiaUniversal("Cavalgar");
    
    if (resultado.tem) {
        console.log("✅ Cavalgar encontrado");
        return true;
    }
    
    // Também procurar por especializações específicas
    const especializacoes = ["Cavalgar (Cavalo)", "Cavalgar (Mula)", "Cavalgar (Camelo)", "Cavalgar (Dragão)"];
    
    for (const esp of especializacoes) {
        const resultadoEsp = buscarPericiaUniversal(esp);
        if (resultadoEsp.tem) {
            console.log(`✅ ${esp} encontrado`);
            return true;
        }
    }
    
    console.log("❌ Cavalgar não encontrado");
    return false;
}

/**
 * Verificar pré-requisitos de uma técnica
 */
function verificarPrereqTecnica(tecnica) {
    const resultados = {
        arco: { tem: false, nivel: 0 },
        cavalgar: { tem: false },
        todosCumpridos: false
    };
    
    // Verificar Arco
    const arcoResult = buscarPericiaUniversal("Arco");
    resultados.arco = {
        tem: arcoResult.tem && arcoResult.nivel > 0,
        nivel: arcoResult.nivel
    };
    
    // Verificar Cavalgar
    resultados.cavalgar.tem = verificarCavalgar();
    
    // Verificar se todos estão cumpridos
    resultados.todosCumpridos = resultados.arco.tem && resultados.cavalgar.tem;
    
    console.log("📋 Resultados dos pré-requisitos:", resultados);
    return resultados;
}

/**
 * Calcular NH da técnica
 */
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0 };
    
    const nhArco = buscarNHArco();
    
    if (nhArco <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            bonusNiveis: 0,
            modificador: tecnica.modificadorBase
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

// ===== 6. SISTEMA DE RENDERIZAÇÃO =====

/**
 * Renderizar catálogo de técnicas
 */
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container lista-tecnicas não encontrado!");
        return;
    }
    
    console.log("🔄 Renderizando catálogo de técnicas...");
    
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
    
    container.innerHTML = '';
    
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
        
        // Criar card HTML
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
                        <span>Base: ${tecnica.periciaBase}</span>
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
                        ${prereq.arco.tem ? '✅' : '❌'} Arco ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}
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

/**
 * Renderizar técnicas aprendidas
 */
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error("❌ Container tecnicas-aprendidas não encontrado!");
        return;
    }
    
    console.log("🔄 Renderizando técnicas aprendidas...");
    
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

// ===== 7. SISTEMA DE MODAL =====

/**
 * Abrir modal da técnica
 */
function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    // Configurar valores iniciais
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    const nhArco = buscarNHArco();
    
    // Calcular NH inicial
    const nhInicial = Math.min(nhArco + tecnica.modificadorBase + niveisIniciais, nhArco);
    
    // Criar modal HTML
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
                <div class="modal-tecnica-controles">
                    <div class="controle-pontos">
                        <h4>Investir Pontos</h4>
                        <p class="instrucao">Cada nível investido reduz a penalidade em 1. O NH final não pode exceder o NH em Arco.</p>
                        <div class="pontos-opcoes">
                            ${CUSTOS_TECNICAS.map((opcao, index) => {
                                const selecionado = niveisIniciais === opcao.niveis;
                                const nhOpcao = Math.min(nhArco + tecnica.modificadorBase + opcao.niveis, nhArco);
                                return `
                                <div class="opcao-pontos ${selecionado ? 'selecionado' : ''}" 
                                     data-pontos="${opcao.pontos}" 
                                     data-niveis="${opcao.niveis}">
                                    <span class="pontos-valor">${opcao.pontos} pts</span>
                                    <span class="niveis-valor">= +${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</span>
                                    <span class="nh-resultado">NH: ${nhOpcao}</span>
                                </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
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
                        <p class="dica-nh">Nota: O NH final não pode exceder o NH em Arco (${nhArco}).</p>
                    </div>
                </div>
                
                <div class="modal-tecnica-resumo">
                    <div class="resumo-item">
                        <span>Pontos Investidos:</span>
                        <strong id="resumo-pontos">${pontosIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis Adquiridos:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item total">
                        <span>NH da Técnica:</span>
                        <strong id="resumo-nh">${nhInicial}</strong>
                    </div>
                </div>
                ` : `
                <div class="prereq-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos não cumpridos</strong>
                        <p>Você precisa aprender Arco (com pelo menos 1 ponto) e qualquer especialização de Cavalgar antes de adquirir esta técnica.</p>
                        <p class="dica-alerta">Dica: Vá para a aba "Perícias" e adquira essas perícias primeiro.</p>
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
    
    // Mostrar overlay
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Configurar estado inicial
    tecnicaSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
    
    // Configurar eventos das opções (se pré-requisitos cumpridos)
    if (prereq.todosCumpridos) {
        setTimeout(() => {
            document.querySelectorAll('.opcao-pontos').forEach(opcao => {
                opcao.addEventListener('click', function() {
                    selecionarOpcaoTecnica(this);
                });
            });
        }, 100);
    }
}

/**
 * Selecionar opção de pontos no modal
 */
function selecionarOpcaoTecnica(elemento) {
    const pontos = parseInt(elemento.dataset.pontos);
    const niveis = parseInt(elemento.dataset.niveis);
    
    if (!tecnicaSelecionada) return;
    
    // Remover seleção anterior
    document.querySelectorAll('.opcao-pontos').forEach(o => {
        o.classList.remove('selecionado');
    });
    
    // Selecionar esta opção
    elemento.classList.add('selecionado');
    
    // Atualizar estado
    tecnicaSelecionada.pontos = pontos;
    tecnicaSelecionada.niveis = niveis;
    
    // Calcular novo NH
    const nhCalculado = Math.min(
        tecnicaSelecionada.nhArco + tecnicaSelecionada.modificador + niveis,
        tecnicaSelecionada.nhArco
    );
    
    // Atualizar displays
    const elementosAtualizar = {
        'nh-niveis-display': `+${niveis}`,
        'nh-total-display': nhCalculado,
        'resumo-pontos': pontos,
        'resumo-niveis': `+${niveis}`,
        'resumo-nh': nhCalculado,
        'modal-custo-total-tecnica': pontos
    };
    
    for (const [id, valor] of Object.entries(elementosAtualizar)) {
        const elemento = document.getElementById(id);
        if (elemento) elemento.textContent = valor;
    }
}

/**
 * Confirmar aquisição/atualização da técnica
 */
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
        alert('Pré-requisitos não cumpridos! Aprenda Arco e Cavalgar primeiro.');
        return;
    }
    
    // Calcular NH final para mostrar na confirmação
    const nhArco = buscarNHArco();
    const nhFinal = Math.min(nhArco + tecnica.modificadorBase + niveis, nhArco);
    
    // Confirmar com usuário
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const confirmMsg = jaAprendida 
        ? `Atualizar "${tecnica.nome}"?\n\n• Pontos gastos: ${pontos} (${pontos - jaAprendida.pontos > 0 ? '+' : ''}${pontos - jaAprendida.pontos})\n• Níveis: +${niveis}\n• NH final: ${nhFinal}`
        : `Adquirir "${tecnica.nome}"?\n\n• Pontos gastos: ${pontos}\n• Níveis: +${niveis}\n• NH final: ${nhFinal}`;
    
    if (!confirm(confirmMsg)) return;
    
    // Encontrar ou criar técnica
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos || 0;
        pontosTecnicas += (pontos - pontosAntigos);
        
        tecnicasAprendidas[indexExistente] = {
            ...tecnicasAprendidas[indexExistente],
            niveis: niveis,
            pontos: pontos,
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
    
    // Fechar modal e atualizar
    fecharModalTecnica();
    renderizarTodasTecnicas();
    
    // Mostrar mensagem de sucesso
    const mensagem = jaAprendida ? 'Técnica atualizada com sucesso!' : 'Técnica adquirida com sucesso!';
    alert(mensagem);
    
    console.log(`✅ ${tecnica.nome} salva: ${pontos} pts, +${niveis} níveis, NH ${nhFinal}`);
}

// ===== 8. FUNÇÕES AUXILIARES =====

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Tem certeza que deseja remover "${tecnica.nome}"?\n\nIsso liberará ${tecnica.pontos} pontos.`)) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    pontosTecnicas -= tecnicasAprendidas[index].pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    renderizarTodasTecnicas();
    
    alert(`${tecnica.nome} removida com sucesso! ${tecnica.pontos} pontos liberados.`);
}

function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    tecnicaSelecionada = null;
}

function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
    
    // Calcular nível médio
    const nivelMedioElement = document.getElementById('nivel-medio-tecnicas');
    if (nivelMedioElement) {
        if (tecnicasAprendidas.length > 0) {
            const totalNiveis = tecnicasAprendidas.reduce((sum, t) => sum + (t.niveis || 0), 0);
            nivelMedioElement.textContent = (totalNiveis / tecnicasAprendidas.length).toFixed(1);
        } else {
            nivelMedioElement.textContent = '0';
        }
    }
    
    // Atualizar custo total (já é pontosTecnicas)
    const custoTotalElement = document.getElementById('custo-total-tecnicas');
    if (custoTotalElement) custoTotalElement.textContent = pontosTecnicas;
}

// ===== 9. FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO =====

function renderizarTodasTecnicas() {
    console.log("🎨 Renderizando todas as técnicas...");
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 10. INICIALIZAÇÃO DO SISTEMA =====

function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar dados salvos
    try {
        const dadosTecnicas = localStorage.getItem('tecnicas_aprendidas');
        if (dadosTecnicas) {
            tecnicasAprendidas = JSON.parse(dadosTecnicas);
            console.log(`📁 ${tecnicasAprendidas.length} técnicas carregadas do localStorage`);
        }
        
        const dadosPontos = localStorage.getItem('pontos_tecnicas');
        if (dadosPontos) {
            pontosTecnicas = parseInt(dadosPontos);
            console.log(`📁 ${pontosTecnicas} pontos totais em técnicas`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
        tecnicasAprendidas = [];
        pontosTecnicas = 0;
    }
    
    // Configurar botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            console.log("🔄 Atualizando manualmente...");
            renderizarTodasTecnicas();
        });
    }
    
    // Renderizar inicialmente
    renderizarTodasTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado!");
}

// ===== 11. EVENT LISTENERS =====

document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, configurando eventos...");
    
    // Quando clicar na sub-aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            console.log(`📌 Clicado na sub-aba: ${subtab}`);
            
            if (subtab === 'tecnicas') {
                setTimeout(() => {
                    console.log("🎯 Inicializando sistema de técnicas...");
                    inicializarSistemaTecnicas();
                }, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        console.log("📌 Aba de técnicas já está ativa");
        setTimeout(() => {
            inicializarSistemaTecnicas();
        }, 200);
    }
    
    // Testar busca de perícias após inicialização
    setTimeout(() => {
        console.log("🧪 Testando busca de perícias...");
        const nhArco = buscarNHArco();
        const temCavalgar = verificarCavalgar();
        
        console.log("📊 Resultados do teste:");
        console.log(`   NH do Arco: ${nhArco}`);
        console.log(`   Tem Cavalgar: ${temCavalgar}`);
        console.log(`   Técnicas configuradas: ${CATALOGO_TECNICAS.length}`);
        console.log(`   Técnicas aprendidas: ${tecnicasAprendidas.length}`);
    }, 3000);
});

// ===== 12. EXPORTAR FUNÇÕES PARA USO GLOBAL =====

window.TECNICAS_SISTEMA = {
    buscarNHArco,
    verificarCavalgar,
    buscarPericiaUniversal,
    abrirModalTecnica,
    fecharModalTecnica,
    confirmarTecnica,
    editarTecnica,
    removerTecnica,
    renderizarTodasTecnicas,
    inicializarSistemaTecnicas
};

console.log("✅ TECNICAS.JS carregado e pronto para uso!");

// ===== 13. FUNÇÃO DE DEBUG (opcional) =====

window.debugTecnicas = function() {
    console.log("🔍 DEBUG DO SISTEMA DE TÉCNICAS 🔍");
    console.log("======================================");
    console.log("CATÁLOGO:", CATALOGO_TECNICAS);
    console.log("APRENDIDAS:", tecnicasAprendidas);
    console.log("PONTOS:", pontosTecnicas);
    console.log("NH ARCO:", buscarNHArco());
    console.log("TEM CAVALGAR:", verificarCavalgar());
    console.log("======================================");
};