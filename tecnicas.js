// ============================================
// TECNICAS.JS - SISTEMA 100% COMPLETO
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
        prereq: ["Arco", "Cavalgar"] // Arco genérico, Cavalgar qualquer
    }
];

// ===== 2. TABELA DE CUSTOS PARA TÉCNICAS =====
const CUSTOS_TECNICAS = [
    { niveis: 1, pontos: 2 },  // +1 nível = 2 pontos
    { niveis: 2, pontos: 3 },  // +2 níveis = 3 pontos  
    { niveis: 3, pontos: 4 },  // +3 níveis = 4 pontos
    { niveis: 4, pontos: 5 }   // +4 níveis = 5 pontos
];

// ===== 3. ESTADO DO SISTEMA =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');
let tecnicaModalSelecionada = null;

// ===== 4. BUSCA DE PERÍCIAS - 100% FUNCIONAL =====
function buscarPericiaParaTecnica(nomePericia) {
    console.log(`🔍 Buscando: ${nomePericia}`);
    
    // ARCO: busca genérico
    if (nomePericia === "Arco") {
        // Tenta no estado global
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            
            // Procura por "Arco" exato
            for (let p of pericias) {
                if (!p || !p.nome) continue;
                
                // Nome exato "Arco"
                if (p.nome.trim().toLowerCase() === "arco") {
                    console.log("✅ Arco encontrado por nome:", p);
                    return {
                        tem: true,
                        nivel: p.nivel || p.valor || p.NH || 0,
                        nome: p.nome
                    };
                }
                
                // ID "arco"
                if (p.id && p.id === "arco") {
                    console.log("✅ Arco encontrado por ID:", p);
                    return {
                        tem: true,
                        nivel: p.nivel || p.valor || p.NH || 0,
                        nome: p.nome
                    };
                }
            }
            
            // Procura por nome que contenha "arco"
            for (let p of pericias) {
                if (!p || !p.nome) continue;
                if (p.nome.toLowerCase().includes("arco")) {
                    console.log("✅ Arco encontrado por nome parcial:", p);
                    return {
                        tem: true,
                        nivel: p.nivel || p.valor || p.NH || 0,
                        nome: p.nome
                    };
                }
            }
        }
        
        // Fallback para localStorage
        try {
            const dados = localStorage.getItem('gurps_pericias');
            if (dados) {
                const parsed = JSON.parse(dados);
                const pericias = parsed.periciasAprendidas || parsed;
                
                if (Array.isArray(pericias)) {
                    for (let p of pericias) {
                        if (!p || !p.nome) continue;
                        
                        if (p.nome.trim().toLowerCase() === "arco" || 
                            (p.id && p.id === "arco") ||
                            p.nome.toLowerCase().includes("arco")) {
                            return {
                                tem: true,
                                nivel: p.nivel || p.valor || p.NH || 0,
                                nome: p.nome
                            };
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Erro ao buscar Arco:", e);
        }
        
        console.log("❌ Arco não encontrado");
        return { tem: false, nivel: 0, nome: "Arco" };
    }
    
    // CAVALGAR: aceita QUALQUER especialização
    if (nomePericia === "Cavalgar") {
        // Tenta no estado global
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            
            for (let p of pericias) {
                if (!p || !p.nome) continue;
                if (p.nome.toLowerCase().includes("cavalgar")) {
                    console.log("✅ Cavalgar encontrado:", p);
                    return {
                        tem: true,
                        nivel: p.nivel || p.valor || p.NH || 0,
                        nome: p.nome
                    };
                }
            }
        }
        
        // Fallback para localStorage
        try {
            const dados = localStorage.getItem('gurps_pericias');
            if (dados) {
                const parsed = JSON.parse(dados);
                const pericias = parsed.periciasAprendidas || parsed;
                
                if (Array.isArray(pericias)) {
                    for (let p of pericias) {
                        if (!p || !p.nome) continue;
                        if (p.nome.toLowerCase().includes("cavalgar")) {
                            return {
                                tem: true,
                                nivel: p.nivel || p.valor || p.NH || 0,
                                nome: p.nome
                            };
                        }
                    }
                }
            }
        } catch (e) {
            console.error("Erro ao buscar Cavalgar:", e);
        }
        
        console.log("❌ Cavalgar não encontrado");
        return { tem: false, nivel: 0, nome: "Cavalgar (qualquer)" };
    }
    
    return { tem: false, nivel: 0, nome: nomePericia };
}

// ===== 5. VERIFICAR PRÉ-REQUISITOS =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    console.log(`📋 Verificando pré-requisitos para ${tecnica.nome}:`);
    console.log(`   Arco: ${arco.tem ? '✅' : '❌'} ${arco.nome} (NH ${arco.nivel})`);
    console.log(`   Cavalgar: ${cavalgar.tem ? '✅' : '❌'} ${cavalgar.nome} (NH ${cavalgar.nivel})`);
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: arco.tem && cavalgar.tem && arco.nivel > 0
    };
}

// ===== 6. CALCULAR NH DA TÉCNICA =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) {
        console.error("❌ Técnica não encontrada:", tecnicaId);
        return { nh: 0, nhBase: 0, calculo: "Técnica não encontrada" };
    }
    
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    
    if (!arcoInfo.tem || arcoInfo.nivel <= 0) {
        console.log("⚠️ Arco não aprendido ou NH 0");
        return {
            nh: 0,
            nhBase: 0,
            calculo: "Arco não aprendido"
        };
    }
    
    const nhArco = arcoInfo.nivel;
    console.log(`📊 Cálculo NH: Arco = ${nhArco}, Penalidade = ${tecnica.modificadorBase}, Níveis = ${niveisInvestidos}`);
    
    // CÁLCULO: NH Arco - 4 + níveis
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // Não pode exceder NH do Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não pode ser negativo
    if (nhFinal < 0) nhFinal = 0;
    
    // String do cálculo
    const sinalMod = tecnica.modificadorBase >= 0 ? '+' : '';
    const sinalNiveis = niveisInvestidos > 0 ? '+' : '';
    const calculo = `${nhArco}${sinalMod}${tecnica.modificadorBase}${sinalNiveis}${niveisInvestidos > 0 ? niveisInvestidos : ''} = ${nhFinal}`;
    
    console.log(`🧮 Cálculo final: ${calculo}`);
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        calculo: calculo
    };
}

// ===== 7. RENDERIZAR CATÁLOGO =====
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
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
        // Status
        let statusClass = 'disponivel';
        let statusText = 'Disponível';
        let btnText = 'Adquirir';
        let btnIcon = 'fa-plus-circle';
        
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
        }
        
        // Card HTML
        const card = document.createElement('div');
        card.className = 'tecnica-card';
        card.innerHTML = `
            <div class="tecnica-header">
                <div class="tecnica-titulo">
                    <i class="${tecnica.icone}"></i>
                    <h4>${tecnica.nome}</h4>
                </div>
                <span class="tecnica-status ${statusClass}">${statusText}</span>
            </div>
            
            <div class="tecnica-desc">${tecnica.descricao}</div>
            
            <div class="tecnica-info">
                <div class="info-item">
                    <span class="label">Base:</span>
                    <span class="valor">${tecnica.periciaBase} ${prereq.arco.tem ? `(NH ${nhCalculo.nhBase})` : ''}</span>
                </div>
                <div class="info-item">
                    <span class="label">Penalidade:</span>
                    <span class="valor">${tecnica.modificadorBase} (no Arco)</span>
                </div>
                <div class="info-item">
                    <span class="label">NH Técnica:</span>
                    <span class="valor">${nhCalculo.nh > 0 ? nhCalculo.nh : '--'}</span>
                </div>
            </div>
            
            <div class="tecnica-prereq">
                <div class="prereq-titulo">Pré-requisitos:</div>
                <div class="prereq-item ${prereq.arco.tem ? 'ok' : 'falta'}">
                    <i class="fas fa-${prereq.arco.tem ? 'check' : 'times'}"></i>
                    ${prereq.arco.nome} ${prereq.arco.tem ? `(NH ${prereq.arco.nivel})` : ''}
                </div>
                <div class="prereq-item ${prereq.cavalgar.tem ? 'ok' : 'falta'}">
                    <i class="fas fa-${prereq.cavalgar.tem ? 'check' : 'times'}"></i>
                    ${prereq.cavalgar.nome} ${prereq.cavalgar.tem ? `(NH ${prereq.cavalgar.nivel})` : ''}
                </div>
            </div>
            
            <div class="tecnica-acoes">
                <button class="btn-tecnica ${statusClass}" 
                        onclick="abrirModalTecnica('${tecnica.id}')"
                        ${statusClass === 'bloqueada' ? 'disabled' : ''}>
                    <i class="fas ${btnIcon}"></i> ${btnText}
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    console.log("✅ Catálogo renderizado");
}

// ===== 8. RENDERIZAR TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.error("❌ Container #tecnicas-aprendidas não encontrado");
        return;
    }
    
    if (tecnicasAprendidas.length === 0) {
        container.innerHTML = `
            <div class="vazio">
                <i class="fas fa-tools"></i>
                <p>Nenhuma técnica aprendida</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    tecnicasAprendidas.forEach(tecnica => {
        const base = CATALOGO_TECNICAS.find(t => t.id === tecnica.id);
        if (!base) {
            console.error("❌ Técnica base não encontrada para:", tecnica.id);
            return;
        }
        
        const nh = calcularNHTecnica(tecnica.id, tecnica.niveis || 0);
        console.log(`📊 Renderizando ${tecnica.nome}: NH = ${nh.nh}, Níveis = ${tecnica.niveis}`);
        
        const card = document.createElement('div');
        card.className = 'tecnica-aprendida';
        card.innerHTML = `
            <div class="aprendida-header">
                <div class="aprendida-titulo">
                    <i class="${base.icone}"></i>
                    <h4>${base.nome}</h4>
                </div>
                <div class="aprendida-nh">NH: ${nh.nh}</div>
            </div>
            
            <div class="aprendida-detalhes">
                <div class="detalhe">
                    <span>Pontos:</span>
                    <strong>${tecnica.pontos || 0} pts</strong>
                </div>
                <div class="detalhe">
                    <span>Níveis:</span>
                    <strong>+${tecnica.niveis || 0}</strong>
                </div>
            </div>
            
            <div class="aprendida-acoes">
                <button class="btn-editar" onclick="editarTecnica('${tecnica.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    console.log("✅ Técnicas aprendidas renderizadas");
}

// ===== 9. MODAL COMPLETO =====
function abrirModalTecnica(id) {
    console.log(`🔓 Abrindo modal para técnica: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error("❌ Técnica não encontrada:", id);
        return;
    }
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    const cavalgarInfo = buscarPericiaParaTecnica("Cavalgar");
    
    const nhArco = arcoInfo.nivel || 0;
    
    // Valores iniciais
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    const nhCalculo = calcularNHTecnica(id, niveisIniciais);
    
    console.log(`📋 Modal dados: Arco NH = ${nhArco}, Níveis = ${niveisIniciais}, Pontos = ${pontosIniciais}`);
    
    // HTML do modal
    const modalHTML = `
        <div class="modal-tecnica-conteudo">
            <div class="modal-cabecalho">
                <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
                <button class="modal-fechar" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-corpo">
                <div class="modal-descricao">
                    ${tecnica.descricao}
                </div>
                
                <div class="modal-prereq">
                    <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
                    <div class="prereq-lista">
                        <div class="prereq ${arcoInfo.tem && arcoInfo.nivel > 0 ? 'ok' : 'falta'}">
                            <i class="fas fa-${arcoInfo.tem && arcoInfo.nivel > 0 ? 'check' : 'times'}"></i>
                            <span>${arcoInfo.nome}</span>
                            <small>${arcoInfo.tem ? `NH ${arcoInfo.nivel}` : 'Não aprendido'}</small>
                        </div>
                        <div class="prereq ${cavalgarInfo.tem ? 'ok' : 'falta'}">
                            <i class="fas fa-${cavalgarInfo.tem ? 'check' : 'times'}"></i>
                            <span>${cavalgarInfo.nome}</span>
                            <small>${cavalgarInfo.tem ? `NH ${cavalgarInfo.nivel}` : 'Não aprendido'}</small>
                        </div>
                    </div>
                </div>
                
                ${prereq.todosCumpridos && nhArco > 0 ? `
                <div class="modal-investimento">
                    <h4><i class="fas fa-coins"></i> Escolha os Níveis</h4>
                    <div class="opcoes-pontos">
                        ${CUSTOS_TECNICAS.map((opcao, index) => {
                            const nhBase = nhArco + tecnica.modificadorBase;
                            const nhFinal = Math.min(nhBase + opcao.niveis, nhArco);
                            const selecionado = jaAprendida ? jaAprendida.niveis === opcao.niveis : index === 0;
                            
                            return `
                            <button class="opcao-pontos ${selecionado ? 'ativo' : ''}" 
                                    onclick="selecionarOpcaoTecnica(${opcao.pontos}, ${opcao.niveis}, ${nhArco}, ${tecnica.modificadorBase})">
                                <div class="pontos">${opcao.pontos} pontos</div>
                                <div class="niveis">+${opcao.niveis} nível${opcao.niveis > 1 ? 's' : ''}</div>
                                <div class="nh">NH: ${nhFinal}</div>
                            </button>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="modal-resumo">
                    <h4><i class="fas fa-calculator"></i> Resumo</h4>
                    <div class="resumo-item">
                        <span>Arco:</span>
                        <strong>NH ${nhArco} ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis adicionais:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH final:</span>
                        <strong id="resumo-nh">${nhCalculo.nh}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Pontos investidos:</span>
                        <strong id="resumo-pontos">${pontosIniciais}</strong>
                    </div>
                </div>
                ` : `
                <div class="modal-alerta">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div>
                        <strong>Pré-requisitos não cumpridos</strong>
                        <p>Você precisa aprender Arco (NH mínimo 1) e Cavalgar (qualquer) para adquirir esta técnica.</p>
                    </div>
                </div>
                `}
            </div>
            
            <div class="modal-rodape">
                <button class="btn-cancelar" onclick="fecharModalTecnica()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                
                ${prereq.todosCumpridos && nhArco > 0 ? `
                <button class="btn-confirmar" onclick="confirmarTecnicaModal('${id}')">
                    <i class="fas fa-check"></i> ${jaAprendida ? 'Atualizar' : 'Adquirir'}
                </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // Insere no modal
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
    } else {
        console.error("❌ Modal #modal-tecnica não encontrado");
        return;
    }
    
    // Mostra overlay
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    } else {
        console.error("❌ Overlay #modal-tecnica-overlay não encontrado");
        return;
    }
    
    // Salva seleção inicial
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
    
    console.log("✅ Modal aberto com sucesso");
}

// ===== 10. SELEÇÃO DE OPÇÃO NO MODAL =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    console.log(`🎯 Selecionado: ${pontos} pontos, +${niveis} níveis`);
    
    // Remove classe ativa de todos
    document.querySelectorAll('.opcao-pontos').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
    // Adiciona ao clicado
    const elemento = event.target.closest('.opcao-pontos');
    if (!elemento) {
        console.error("❌ Elemento .opcao-pontos não encontrado");
        return;
    }
    elemento.classList.add('ativo');
    
    // Atualiza seleção
    tecnicaModalSelecionada.pontos = pontos;
    tecnicaModalSelecionada.niveis = niveis;
    
    // Calcula NH
    const nhBase = nhArco + modificador;
    const nhFinal = Math.min(nhBase + niveis, nhArco);
    
    console.log(`🧮 NH calculado: ${nhFinal} (Base: ${nhBase} + ${niveis})`);
    
    // Atualiza resumo
    const resumoNiveis = document.getElementById('resumo-niveis');
    const resumoNh = document.getElementById('resumo-nh');
    const resumoPontos = document.getElementById('resumo-pontos');
    
    if (resumoNiveis) resumoNiveis.textContent = `+${niveis}`;
    if (resumoNh) resumoNh.textContent = nhFinal;
    if (resumoPontos) resumoPontos.textContent = pontos;
}

// ===== 11. CONFIRMAR TÉCNICA =====
function confirmarTecnicaModal(id) {
    console.log(`✅ Confirmando técnica: ${id}`);
    
    if (!tecnicaModalSelecionada) {
        alert('❌ Selecione uma opção primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error("❌ Técnica não encontrada:", id);
        return;
    }
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    console.log(`📊 Dados selecionados: ${pontos} pontos, +${niveis} níveis`);
    
    // Verifica pré-requisitos novamente
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('❌ Pré-requisitos não cumpridos! Você precisa de Arco e Cavalgar.');
        return;
    }
    
    // Verifica se tem Arco com pelo menos 1 ponto
    if (prereq.arco.nivel <= 0) {
        alert('❌ Você precisa ter pelo menos 1 ponto em Arco!');
        return;
    }
    
    // Calcula NH final
    const nhCalculo = calcularNHTecnica(id, niveis);
    console.log(`🧮 NH final calculado: ${nhCalculo.nh}`);
    
    // Procura técnica existente
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // ATUALIZAR técnica existente
        console.log(`🔄 Atualizando técnica existente`);
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos;
        const diferencaPontos = pontos - pontosAntigos;
        
        pontosTecnicas += diferencaPontos;
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            dificuldade: tecnica.dificuldade
        };
        
        alert(`✅ ${tecnica.nome} atualizada!\nNH: ${nhCalculo.nh}`);
    } else {
        // ADICIONAR nova técnica
        console.log(`✨ Adicionando nova técnica`);
        tecnicasAprendidas.push({
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            dificuldade: tecnica.dificuldade
        });
        pontosTecnicas += pontos;
        
        alert(`✅ ${tecnica.nome} adquirida!\nNH: ${nhCalculo.nh}`);
    }
    
    // Salva no localStorage
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    console.log(`💾 Dados salvos: ${tecnicasAprendidas.length} técnica(s), ${pontosTecnicas} pontos`);
    
    // Fecha modal e atualiza
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 12. EDIÇÃO =====
function editarTecnica(id) {
    console.log(`✏️ Editando técnica: ${id}`);
    abrirModalTecnica(id);
}

// ===== 13. REMOÇÃO =====
function removerTecnica(id) {
    console.log(`🗑️ Solicitando remoção: ${id}`);
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) {
        console.error("❌ Técnica não encontrada:", id);
        return;
    }
    
    const tecnicaAprendida = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnicaAprendida) {
        console.error("❌ Técnica aprendida não encontrada:", id);
        return;
    }
    
    if (!confirm(`Tem certeza que deseja remover a técnica "${tecnica.nome}"?\nPontos gastos: ${tecnicaAprendida.pontos || 0} pts\nOs pontos serão devolvidos.`)) {
        console.log("❌ Remoção cancelada pelo usuário");
        return;
    }
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) {
        console.error("❌ Índice não encontrado:", id);
        return;
    }
    
    const tecnicaRemovida = tecnicasAprendidas[index];
    pontosTecnicas -= tecnicaRemovida.pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    console.log(`✅ Técnica removida: ${tecnicaRemovida.nome}, ${tecnicaRemovida.pontos} pontos devolvidos`);
    
    // Atualiza
    renderizarTodasTecnicas();
    alert(`✅ ${tecnicaRemovida.nome} removida!\n${tecnicaRemovida.pontos || 0} pontos devolvidos.`);
}

// ===== 14. FECHAR MODAL =====
function fecharModalTecnica() {
    console.log("❌ Fechando modal de técnica");
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    } else {
        console.error("❌ Overlay não encontrado para fechar");
    }
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = '';
    } else {
        console.error("❌ Modal não encontrado para fechar");
    }
    
    tecnicaModalSelecionada = null;
}

// ===== 15. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    console.log(`📊 Atualizando estatísticas: ${tecnicasAprendidas.length} técnica(s), ${pontosTecnicas} pontos`);
    
    const elementos = [
        { id: 'total-tecnicas', valor: tecnicasAprendidas.length },
        { id: 'pontos-tecnicas', valor: pontosTecnicas },
        { id: 'pontos-tecnicas-aprendidas', valor: `${pontosTecnicas} pts` }
    ];
    
    elementos.forEach(elem => {
        const el = document.getElementById(elem.id);
        if (el) {
            el.textContent = elem.valor;
        } else {
            console.warn(`⚠️ Elemento #${elem.id} não encontrado`);
        }
    });
}

// ===== 16. CARREGAR DO STORAGE =====
function carregarTecnicasDoStorage() {
    console.log("📁 Carregando técnicas do storage...");
    
    try {
        const dados = localStorage.getItem('tecnicas_aprendidas');
        if (dados) {
            tecnicasAprendidas = JSON.parse(dados);
            console.log(`✅ ${tecnicasAprendidas.length} técnica(s) carregada(s)`);
        } else {
            console.log("📁 Nenhuma técnica encontrada no storage");
            tecnicasAprendidas = [];
        }
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) {
            pontosTecnicas = parseInt(pontos);
            console.log(`✅ ${pontosTecnicas} pontos carregados`);
        } else {
            console.log("📁 Nenhum ponto de técnica encontrado");
            pontosTecnicas = 0;
        }
    } catch (e) {
        console.error("❌ Erro ao carregar do storage:", e);
        tecnicasAprendidas = [];
        pontosTecnicas = 0;
    }
}

// ===== 17. FUNÇÃO PRINCIPAL =====
function renderizarTodasTecnicas() {
    console.log("🔄 Renderizando todas as técnicas...");
    
    // 1. Renderiza catálogo
    renderizarCatalogoTecnicas();
    
    // 2. Renderiza técnicas aprendidas
    renderizarTecnicasAprendidas();
    
    // 3. Atualiza estatísticas
    atualizarEstatisticasTecnicas();
    
    console.log("✅ Todas as técnicas renderizadas com sucesso");
}

// ===== 18. INICIALIZAÇÃO DO SISTEMA =====
function inicializarSistemaTecnicas() {
    console.log("🔧 Inicializando sistema de técnicas...");
    
    // 1. Carrega dados do storage
    carregarTecnicasDoStorage();
    
    // 2. Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', function() {
            console.log("🔄 Botão de atualizar clicado");
            renderizarTodasTecnicas();
        });
        console.log("✅ Botão de atualizar configurado");
    } else {
        console.warn("⚠️ Botão #btn-atualizar-tecnicas não encontrado");
    }
    
    // 3. Configura fechar modal ao clicar fora
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                console.log("👆 Clicou fora do modal, fechando...");
                fecharModalTecnica();
            }
        });
        console.log("✅ Overlay configurado para fechar ao clicar fora");
    } else {
        console.warn("⚠️ Overlay #modal-tecnica-overlay não encontrado");
    }
    
    // 4. Configura fechar modal com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay && overlay.style.display === 'flex') {
            console.log("⎋ Tecla ESC pressionada, fechando modal...");
            fecharModalTecnica();
        }
    });
    
    // 5. Renderiza tudo
    renderizarTodasTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado com sucesso!");
}

// ===== 19. FUNÇÃO DEBUG PARA TESTES =====
function debugTecnicas() {
    console.log("=== 🐛 DEBUG TÉCNICAS ===");
    
    // 1. Verifica estado
    console.log("📋 Estado do sistema:");
    console.log("- Técnicas aprendidas:", tecnicasAprendidas);
    console.log("- Pontos totais:", pontosTecnicas);
    console.log("- Técnica modal selecionada:", tecnicaModalSelecionada);
    
    // 2. Verifica perícias
    console.log("📋 Perícias encontradas:");
    console.log("- Arco:", buscarPericiaParaTecnica("Arco"));
    console.log("- Cavalgar:", buscarPericiaParaTecnica("Cavalgar"));
    
    // 3. Verifica estado global
    console.log("📋 Estado global:");
    console.log("- estadoPericias existe?", !!window.estadoPericias);
    if (window.estadoPericias) {
        console.log("- Perícias aprendidas:", window.estadoPericias.periciasAprendidas?.length || 0);
        if (window.estadoPericias.periciasAprendidas) {
            console.log("- Primeira perícia:", window.estadoPericias.periciasAprendidas[0]);
        }
    }
    
    // 4. Verifica HTML
    console.log("📋 Elementos HTML:");
    console.log("- #lista-tecnicas:", !!document.getElementById('lista-tecnicas'));
    console.log("- #tecnicas-aprendidas:", !!document.getElementById('tecnicas-aprendidas'));
    console.log("- #modal-tecnica:", !!document.getElementById('modal-tecnica'));
    console.log("- #modal-tecnica-overlay:", !!document.getElementById('modal-tecnica-overlay'));
    
    // 5. Calcula NH de todas as técnicas aprendidas
    if (tecnicasAprendidas.length > 0) {
        console.log("📋 Cálculos NH:");
        tecnicasAprendidas.forEach(t => {
            const calculo = calcularNHTecnica(t.id, t.niveis || 0);
            console.log(`- ${t.nome}: ${calculo.calculo}`);
        });
    }
    
    console.log("=== ✅ DEBUG COMPLETO ===");
}

// ===== 20. VERIFICAR DISPONIBILIDADE DO SISTEMA =====
function verificarSistemaTecnicas() {
    console.log("🔍 Verificando sistema de técnicas...");
    
    const problemas = [];
    
    // 1. Verifica catálogo
    if (!CATALOGO_TECNICAS || CATALOGO_TECNICAS.length === 0) {
        problemas.push("❌ Catálogo de técnicas vazio");
    }
    
    // 2. Verifica elementos HTML necessários
    const elementosNecessarios = [
        'lista-tecnicas',
        'tecnicas-aprendidas',
        'modal-tecnica',
        'modal-tecnica-overlay'
    ];
    
    elementosNecessarios.forEach(id => {
        if (!document.getElementById(id)) {
            problemas.push(`❌ Elemento #${id} não encontrado`);
        }
    });
    
    // 3. Verifica funções necessárias
    const funcoesNecessarias = [
        'buscarPericiaParaTecnica',
        'calcularNHTecnica',
        'renderizarCatalogoTecnicas',
        'renderizarTecnicasAprendidas'
    ];
    
    funcoesNecessarias.forEach(fn => {
        if (typeof window[fn] !== 'function') {
            problemas.push(`❌ Função ${fn}() não disponível`);
        }
    });
    
    // 4. Retorna resultado
    if (problemas.length === 0) {
        console.log("✅ Sistema de técnicas verificado com sucesso!");
        return true;
    } else {
        console.error("❌ Problemas encontrados:", problemas);
        return false;
    }
}

// ===== 21. RESETAR TÉCNICAS (PARA TESTES) =====
function resetarTecnicas() {
    if (!confirm("⚠️ TEM CERTEZA?\nIsso vai REMOVER TODAS as técnicas aprendidas e zerar os pontos.\nEsta ação NÃO pode ser desfeita.")) {
        return;
    }
    
    tecnicasAprendidas = [];
    pontosTecnicas = 0;
    
    localStorage.removeItem('tecnicas_aprendidas');
    localStorage.removeItem('pontos_tecnicas');
    
    console.log("♻️ Sistema de técnicas resetado");
    alert("✅ Sistema de técnicas resetado com sucesso!");
    
    renderizarTodasTecnicas();
}

// ===== 22. ADICIONAR TÉCNICA PARA TESTES =====
function adicionarTecnicaTeste() {
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    const cavalgarInfo = buscarPericiaParaTecnica("Cavalgar");
    
    if (!arcoInfo.tem || arcoInfo.nivel <= 0) {
        alert("❌ Para testar, você precisa aprender Arco primeiro!");
        return;
    }
    
    if (!cavalgarInfo.tem) {
        alert("❌ Para testar, você precisa aprender Cavalgar (qualquer) primeiro!");
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS[0];
    const niveis = 1;
    const pontos = 2;
    
    // Verifica se já tem
    const index = tecnicasAprendidas.findIndex(t => t.id === tecnica.id);
    
    if (index >= 0) {
        alert("❌ Você já tem esta técnica!");
        return;
    }
    
    // Adiciona
    tecnicasAprendidas.push({
        id: tecnica.id,
        nome: tecnica.nome,
        icone: tecnica.icone,
        niveis: niveis,
        pontos: pontos,
        periciaBase: tecnica.periciaBase,
        modificadorBase: tecnica.modificadorBase,
        dificuldade: tecnica.dificuldade
    });
    
    pontosTecnicas += pontos;
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Calcula NH
    const nhCalculo = calcularNHTecnica(tecnica.id, niveis);
    
    console.log(`🧪 Técnica de teste adicionada: ${tecnica.nome}, NH: ${nhCalculo.nh}`);
    alert(`🧪 Técnica de teste adicionada!\n${tecnica.nome}\nNH: ${nhCalculo.nh}\nPontos: ${pontos} pts`);
    
    renderizarTodasTecnicas();
}

// ===== 23. EXPORTAR FUNÇÕES PARA WINDOW =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.debugTecnicas = debugTecnicas;
window.verificarSistemaTecnicas = verificarSistemaTecnicas;
window.resetarTecnicas = resetarTecnicas;
window.adicionarTecnicaTeste = adicionarTecnicaTeste;

// ===== 24. EXPORTAR DADOS PARA DEBUG =====
window.tecnicasAprendidas = tecnicasAprendidas;
window.pontosTecnicas = pontosTecnicas;
window.CATALOGO_TECNICAS = CATALOGO_TECNICAS;
window.CUSTOS_TECNICAS = CUSTOS_TECNICAS;

// ===== 25. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado - Configurando sistema de técnicas");
    
    // Verifica se estamos na aba de técnicas
    const verificarAbaTecnicas = function() {
        const abaTecnicas = document.getElementById('subtab-tecnicas');
        const abaAtiva = document.querySelector('.subtab-pane-pericias.active');
        
        // Se a aba técnicas está visível OU se é a aba ativa
        const deveInicializar = (abaTecnicas && abaTecnicas.classList.contains('active')) ||
                               (abaAtiva && abaAtiva.id === 'subtab-tecnicas');
        
        return deveInicializar;
    };
    
    // Verifica agora
    if (verificarAbaTecnicas()) {
        console.log("✅ Aba de técnicas já está ativa");
        setTimeout(function() {
            if (verificarSistemaTecnicas()) {
                inicializarSistemaTecnicas();
            } else {
                console.warn("⚠️ Sistema de técnicas não passou na verificação, tentando mesmo assim...");
                setTimeout(inicializarSistemaTecnicas, 500);
            }
        }, 100);
    } else {
        console.log("⏳ Aba de técnicas não está ativa, aguardando clique...");
    }
    
    // Configura clique nas abas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            const subtab = this.dataset.subtab;
            
            if (subtab === 'tecnicas') {
                console.log("🎯 Aba de técnicas clicada, inicializando...");
                
                // Pequeno delay para garantir que a aba foi carregada
                setTimeout(function() {
                    if (verificarSistemaTecnicas()) {
                        inicializarSistemaTecnicas();
                    } else {
                        console.error("❌ Sistema de técnicas não está pronto");
                        // Tenta de novo depois
                        setTimeout(inicializarSistemaTecnicas, 300);
                    }
                }, 50);
            }
        });
    });
    
    // Configura observador de mutação para detectar mudanças nas abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (verificarAbaTecnicas()) {
                    console.log("👀 Detecção automática: aba técnicas ficou ativa");
                    setTimeout(function() {
                        if (!window._tecnicasInicializadas) {
                            window._tecnicasInicializadas = true;
                            inicializarSistemaTecnicas();
                        }
                    }, 100);
                }
            }
        });
    });
    
    // Observa mudanças na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas) {
        observer.observe(abaTecnicas, { attributes: true });
    }
    
    // Adiciona atalhos de teclado para debug
    document.addEventListener('keydown', function(e) {
        // Ctrl+Alt+T = Debug
        if (e.ctrlKey && e.altKey && e.key === 't') {
            e.preventDefault();
            console.log("🔧 Atalho de debug ativado (Ctrl+Alt+T)");
            debugTecnicas();
        }
        
        // Ctrl+Alt+R = Reset (apenas em desenvolvimento)
        if (e.ctrlKey && e.altKey && e.key === 'r' && window.location.hostname === 'localhost') {
            e.preventDefault();
            console.log("♻️ Atalho de reset ativado (Ctrl+Alt+R)");
            resetarTecnicas();
        }
    });
});

// ===== 26. MENSAGEM DE CARREGAMENTO =====
console.log("✅ TECNICAS.JS - SISTEMA 100% COMPLETO CARREGADO!");
console.log("📋 Funcionalidades:");
console.log("   • Catálogo de técnicas com NH real");
console.log("   • Modal com tabela de custos correta (2,3,4,5 pontos)");
console.log("   • Cálculo automático: Arco (NH X) - 4 + níveis = NH final");
console.log("   • Aceita Cavalgar genérico (qualquer especialização)");
console.log("   • Botões Cancelar e Confirmar funcionais");
console.log("   • Edição e remoção de técnicas");
console.log("   • Debug completo (Ctrl+Alt+T)");

// ===== 27. VERIFICAÇÃO FINAL =====
if (typeof window.estadoPericias === 'undefined') {
    console.warn("⚠️ ATENÇÃO: estadoPericias não está definido globalmente");
    console.warn("   O sistema de técnicas precisa do sistema de perícias carregado");
    console.warn("   Certifique-se de que:");
    console.warn("   1. O sistema de perícias está carregado primeiro");
    console.warn("   2. A aba de Perícias foi visitada pelo menos uma vez");
    console.warn("   3. A variável window.estadoPericias existe");
} else {
    console.log("✅ Estado de perícias detectado, sistema pronto para uso");
}

// ===== 28. INICIALIZAÇÃO MANUAL =====
// Para inicializar manualmente se necessário
window.inicializarTecnicasManual = function() {
    console.log("🔄 Inicialização manual solicitada");
    if (verificarSistemaTecnicas()) {
        inicializarSistemaTecnicas();
        return true;
    } else {
        console.error("❌ Inicialização manual falhou");
        return false;
    }
};

console.log("🚀 Sistema de técnicas pronto! Use inicializarSistemaTecnicas() para iniciar.");