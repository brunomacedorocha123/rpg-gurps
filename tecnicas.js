// ============================================
// TECNICAS.JS - SISTEMA COMPLETO 100% CORRETO
// ============================================

// ===== 1. CATÁLOGO SIMPLES E CORRETO =====
const CATALOGO_TECNICAS = [
    {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto montado. Penalidade base de -4 no ARCO. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
        dificuldade: "Difícil",
        periciaBase: "Arco",        // MODIFICA O ARCO
        atributo: "DX",
        modificadorBase: -4,        // -4 NO ARCO
        prereq: ["Arco", "Cavalgar"] // Arco genérico, Cavalgar (qualquer)
    }
];

// ===== 2. ESTADO SIMPLES =====
let tecnicasAprendidas = JSON.parse(localStorage.getItem('tecnicas_aprendidas') || '[]');
let pontosTecnicas = parseInt(localStorage.getItem('pontos_tecnicas') || '0');

// ===== 3. BUSCA DE PERÍCIAS - 100% CORRETA =====
function buscarPericiaParaTecnica(nomePericia) {
    console.log(`🔍 Buscando perícia para técnica: ${nomePericia}`);
    
    // PARA ARCO: busca específico "Arco"
    if (nomePericia === "Arco") {
        // Tenta o sistema principal primeiro
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            
            // Busca EXATAMENTE "Arco" ou que contenha "Arco" no nome
            const arco = pericias.find(p => {
                if (!p || !p.nome) return false;
                const nomePer = p.nome.toLowerCase().trim();
                return nomePer === "arco" || 
                       nomePer.startsWith("arco ") ||
                       nomePer.includes("(arco)");
            });
            
            if (arco) {
                console.log(`✅ Arco encontrado no estado: ${arco.nome} - NH ${arco.nivel}`);
                return {
                    tem: true,
                    nivel: arco.nivel || 0,
                    nome: arco.nome
                };
            }
        }
        
        // Fallback para localStorage
        try {
            const dados = localStorage.getItem('gurps_pericias');
            if (dados) {
                const parsed = JSON.parse(dados);
                const pericias = parsed.periciasAprendidas || parsed;
                
                if (Array.isArray(pericias)) {
                    const arco = pericias.find(p => {
                        if (!p || !p.nome) return false;
                        const nomePer = p.nome.toLowerCase().trim();
                        return nomePer === "arco" || 
                               nomePer.startsWith("arco ") ||
                               nomePer.includes("(arco)");
                    });
                    
                    if (arco) {
                        console.log(`✅ Arco encontrado no localStorage: ${arco.nome} - NH ${arco.nivel}`);
                        return {
                            tem: true,
                            nivel: arco.nivel || 0,
                            nome: arco.nome
                        };
                    }
                }
            }
        } catch (e) {
            console.log("Erro ao buscar Arco:", e);
        }
        
        console.log(`❌ Arco não encontrado`);
        return { tem: false, nivel: 0, nome: "Arco" };
    }
    
    // PARA CAVALGAR: aceita QUALQUER especialização
    if (nomePericia === "Cavalgar") {
        // Tenta o sistema principal primeiro
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const pericias = window.estadoPericias.periciasAprendidas;
            
            // Busca QUALQUER perícia que contenha "cavalgar"
            const cavalgar = pericias.find(p => {
                if (!p || !p.nome) return false;
                const nomePer = p.nome.toLowerCase().trim();
                return nomePer.includes("cavalgar");
            });
            
            if (cavalgar) {
                console.log(`✅ Cavalgar encontrado no estado: ${cavalgar.nome} - NH ${cavalgar.nivel}`);
                return {
                    tem: true,
                    nivel: cavalgar.nivel || 0,
                    nome: cavalgar.nome
                };
            }
        }
        
        // Fallback para localStorage
        try {
            const dados = localStorage.getItem('gurps_pericias');
            if (dados) {
                const parsed = JSON.parse(dados);
                const pericias = parsed.periciasAprendidas || parsed;
                
                if (Array.isArray(pericias)) {
                    const cavalgar = pericias.find(p => {
                        if (!p || !p.nome) return false;
                        const nomePer = p.nome.toLowerCase().trim();
                        return nomePer.includes("cavalgar");
                    });
                    
                    if (cavalgar) {
                        console.log(`✅ Cavalgar encontrado no localStorage: ${cavalgar.nome} - NH ${cavalgar.nivel}`);
                        return {
                            tem: true,
                            nivel: cavalgar.nivel || 0,
                            nome: cavalgar.nome
                        };
                    }
                }
            }
        } catch (e) {
            console.log("Erro ao buscar Cavalgar:", e);
        }
        
        console.log(`❌ Cavalgar não encontrado`);
        return { tem: false, nivel: 0, nome: "Cavalgar (qualquer)" };
    }
    
    return { tem: false, nivel: 0, nome: nomePericia };
}

// ===== 4. VERIFICAR PRÉ-REQUISITOS - 100% CORRETO =====
function verificarPrereqTecnica(tecnica) {
    const arco = buscarPericiaParaTecnica("Arco");
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    
    console.log(`📋 Verificando pré-requisitos para ${tecnica.nome}:`);
    console.log(`   Arco: ${arco.tem ? '✅' : '❌'} ${arco.nome} (NH ${arco.nivel})`);
    console.log(`   Cavalgar: ${cavalgar.tem ? '✅' : '❌'} ${cavalgar.nome} (NH ${cavalgar.nivel})`);
    
    return {
        arco: arco,
        cavalgar: cavalgar,
        todosCumpridos: arco.tem && cavalgar.tem && arco.nivel > 0 && cavalgar.nivel > 0
    };
}

// ===== 5. CALCULAR NH - 100% CORRETO =====
function calcularNHTecnicaCorreto(tecnicaId, niveisInvestidos = 0) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
    if (!tecnica) return { nh: 0, nhBase: 0, calculo: "Erro" };
    
    // Busca o NH do ARCO
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    
    if (!arcoInfo.tem || arcoInfo.nivel <= 0) {
        return {
            nh: 0,
            nhBase: 0,
            calculo: "Arco não aprendido"
        };
    }
    
    const nhArco = arcoInfo.nivel;
    
    // CÁLCULO: NH Arco - 4 + níveis investidos
    let nhFinal = nhArco + tecnica.modificadorBase + niveisInvestidos;
    
    // NUNCA excede NH do Arco
    if (nhFinal > nhArco) nhFinal = nhArco;
    
    // Não pode ser negativo
    if (nhFinal < 0) nhFinal = 0;
    
    // String do cálculo para exibir
    const sinalMod = tecnica.modificadorBase >= 0 ? '+' : '';
    const sinalNiveis = niveisInvestidos > 0 ? '+' : '';
    const calculo = `${nhArco}${sinalMod}${tecnica.modificadorBase}${sinalNiveis}${niveisInvestidos > 0 ? niveisInvestidos : ''} = ${nhFinal}`;
    
    return {
        nh: nhFinal,
        nhBase: nhArco,
        calculo: calculo,
        periciaBase: arcoInfo
    };
}

// ===== 6. RENDERIZAR CATÁLOGO - 100% CORRETO =====
function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnicaCorreto(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
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
        
        // Card HTML - MOSTRANDO O ARCO COM -4
        const sinalMod = tecnica.modificadorBase >= 0 ? '+' : '';
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
                    <span class="valor">
                        ${tecnica.periciaBase} 
                        ${prereq.arco.tem ? `(NH ${nhCalculo.nhBase}${sinalMod}${tecnica.modificadorBase})` : ''}
                    </span>
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
                    ${prereq.cavalgar.tem ? prereq.cavalgar.nome : 'Cavalgar (qualquer)'}
                    ${prereq.cavalgar.tem ? `(NH ${prereq.cavalgar.nivel})` : ''}
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
}

// ===== 7. RENDERIZAR APRENDIDAS - 100% CORRETO (MOSTRANDO ARCO COM -4) =====
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
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
        if (!base) return;
        
        const nh = calcularNHTecnicaCorreto(tecnica.id, tecnica.niveis || 0);
        
        // CÁLCULO DETALHADO PARA MOSTRAR ARCO COM -4
        const nhArco = nh.nhBase;
        const penalidade = base.modificadorBase; // -4
        const nhAposPenalidade = nhArco + penalidade;
        const niveisBonus = tecnica.niveis || 0;
        
        // Formatação do cálculo
        const sinalPenalidade = penalidade >= 0 ? '+' : '';
        const sinalNiveis = niveisBonus > 0 ? '+' : '';
        const calculoDetalhado = `${nhArco} ${sinalPenalidade}${penalidade} ${sinalNiveis}${niveisBonus > 0 ? niveisBonus : ''} = ${nh.nh}`;
        
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
                    <span>Base:</span>
                    <strong>${base.periciaBase} (NH ${nhArco})</strong>
                </div>
                <div class="detalhe">
                    <span>Penalidade no Arco:</span>
                    <strong>${sinalPenalidade}${penalidade}</strong>
                </div>
                <div class="detalhe">
                    <span>Arco com penalidade:</span>
                    <strong>NH ${nhAposPenalidade}</strong>
                </div>
                <div class="detalhe">
                    <span>Níveis na técnica:</span>
                    <strong>${sinalNiveis}${niveisBonus}</strong>
                </div>
                <div class="detalhe">
                    <span>Pontos gastos:</span>
                    <strong>${tecnica.pontos || 0} pts</strong>
                </div>
            </div>
            
            <div class="aprendida-calculo">
                <small><strong>Cálculo:</strong> ${calculoDetalhado}</small>
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
}

// ===== 8. MODAL COMPLETO E FUNCIONAL =====
let tecnicaModalSelecionada = null;

function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    // Busca perícias
    const arcoInfo = buscarPericiaParaTecnica("Arco");
    const cavalgarInfo = buscarPericiaParaTecnica("Cavalgar");
    
    // Configurações iniciais
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    
    // Cálculos NH
    const nhArco = arcoInfo.nivel || 0;
    const nhBase = nhArco + tecnica.modificadorBase; // Arco -4
    const nhAtual = Math.min(nhBase + niveisIniciais, nhArco);
    
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
                        <div class="prereq ${cavalgarInfo.tem && cavalgarInfo.nivel > 0 ? 'ok' : 'falta'}">
                            <i class="fas fa-${cavalgarInfo.tem && cavalgarInfo.nivel > 0 ? 'check' : 'times'}"></i>
                            <span>${cavalgarInfo.tem ? cavalgarInfo.nome : 'Cavalgar (qualquer)'}</span>
                            <small>${cavalgarInfo.tem ? `NH ${cavalgarInfo.nivel}` : 'Não aprendido'}</small>
                        </div>
                    </div>
                </div>
                
                ${prereq.todosCumpridos && nhArco > 0 ? `
                <div class="modal-investimento">
                    <h4><i class="fas fa-coins"></i> Investir Pontos</h4>
                    <div class="opcoes-pontos">
                        <button class="opcao-pontos ${pontosIniciais === 2 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(2, 1, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">2 pontos</div>
                            <div class="niveis">+1 nível</div>
                            <div class="nh">NH: ${Math.min(nhBase + 1, nhArco)}</div>
                        </button>
                        
                        <button class="opcao-pontos ${pontosIniciais === 3 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(3, 2, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">3 pontos</div>
                            <div class="niveis">+2 níveis</div>
                            <div class="nh">NH: ${Math.min(nhBase + 2, nhArco)}</div>
                        </button>
                        
                        <button class="opcao-pontos ${pontosIniciais === 4 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(4, 3, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">4 pontos</div>
                            <div class="niveis">+3 níveis</div>
                            <div class="nh">NH: ${Math.min(nhBase + 3, nhArco)}</div>
                        </button>
                        
                        <button class="opcao-pontos ${pontosIniciais === 5 ? 'ativo' : ''}" 
                                onclick="selecionarOpcaoTecnica(5, 4, ${nhArco}, ${tecnica.modificadorBase})">
                            <div class="pontos">5 pontos</div>
                            <div class="niveis">+4 níveis</div>
                            <div class="nh">NH: ${Math.min(nhBase + 4, nhArco)}</div>
                        </button>
                    </div>
                </div>
                
                <div class="modal-resumo">
                    <h4><i class="fas fa-calculator"></i> Resumo</h4>
                    <div class="resumo-item">
                        <span>Arco:</span>
                        <strong>NH ${nhArco} ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase} = ${nhBase}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>Níveis adicionais:</span>
                        <strong id="resumo-niveis">+${niveisIniciais}</strong>
                    </div>
                    <div class="resumo-item">
                        <span>NH final:</span>
                        <strong id="resumo-nh">${nhAtual}</strong>
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
                        <p>Você precisa aprender Arco (qualquer) e Cavalgar (qualquer especialização) para adquirir esta técnica.</p>
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
    }
    
    // Mostra overlay
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    // Salva dados da técnica selecionada
    tecnicaModalSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
}

// ===== 9. SELEÇÃO DE OPÇÃO NO MODAL =====
function selecionarOpcaoTecnica(pontos, niveis, nhArco, modificador) {
    // Remove classe ativa de todos
    document.querySelectorAll('.opcao-pontos').forEach(btn => {
        btn.classList.remove('ativo');
    });
    
    // Adiciona ao clicado
    event.target.closest('.opcao-pontos').classList.add('ativo');
    
    // Atualiza seleção
    tecnicaModalSelecionada.pontos = pontos;
    tecnicaModalSelecionada.niveis = niveis;
    
    // Calcula NH
    const nhBase = nhArco + modificador;
    const nhFinal = Math.min(nhBase + niveis, nhArco);
    
    // Atualiza resumo
    document.getElementById('resumo-niveis').textContent = `+${niveis}`;
    document.getElementById('resumo-nh').textContent = nhFinal;
    document.getElementById('resumo-pontos').textContent = pontos;
}

// ===== 10. CONFIRMAR TÉCNICA =====
function confirmarTecnicaModal(id) {
    if (!tecnicaModalSelecionada) return;
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaModalSelecionada;
    
    // Verifica pré-requisitos novamente
    const prereq = verificarPrereqTecnica(tecnica);
    if (!prereq.todosCumpridos) {
        alert('❌ Pré-requisitos não cumpridos! Você precisa ter Arco e Cavalgar (qualquer).');
        return;
    }
    
    // Verifica se tem Arco com pelo menos 1 ponto
    if (prereq.arco.nivel <= 0) {
        alert('❌ Você precisa ter pelo menos 1 ponto em Arco!');
        return;
    }
    
    // Verifica se tem Cavalgar com pelo menos 1 ponto
    if (prereq.cavalgar.nivel <= 0) {
        alert('❌ Você precisa ter pelo menos 1 ponto em Cavalgar (qualquer especialização)!');
        return;
    }
    
    // Procura se já tem a técnica
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
        // Atualizar técnica existente
        const pontosAntigos = tecnicasAprendidas[indexExistente].pontos;
        pontosTecnicas += (pontos - pontosAntigos);
        
        tecnicasAprendidas[indexExistente] = {
            id: id,
            nome: tecnica.nome,
            icone: tecnica.icone,
            niveis: niveis,
            pontos: pontos,
            periciaBase: tecnica.periciaBase,
            modificadorBase: tecnica.modificadorBase,
            prereqArco: prereq.arco,
            prereqCavalgar: prereq.cavalgar
        };
        
        alert(`✅ ${tecnica.nome} atualizada!`);
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
            prereqArco: prereq.arco,
            prereqCavalgar: prereq.cavalgar
        });
        pontosTecnicas += pontos;
        
        alert(`✅ ${tecnica.nome} adquirida!`);
    }
    
    // Salva no localStorage
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Fecha modal e atualiza
    fecharModalTecnica();
    renderizarTodasTecnicas();
}

// ===== 11. EDIÇÃO E REMOÇÃO =====
function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    if (!confirm('Tem certeza que deseja remover esta técnica? Os pontos serão devolvidos.')) return;
    
    const index = tecnicasAprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnicaRemovida = tecnicasAprendidas[index];
    pontosTecnicas -= tecnicaRemovida.pontos || 0;
    tecnicasAprendidas.splice(index, 1);
    
    // Salva
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    // Atualiza
    renderizarTodasTecnicas();
    alert('✅ Técnica removida! Pontos devolvidos.');
}

// ===== 12. FECHAR MODAL =====
function fecharModalTecnica() {
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = '';
    }
    
    tecnicaModalSelecionada = null;
}

// ===== 13. ATUALIZAR ESTATÍSTICAS =====
function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
}

// ===== 14. FUNÇÃO PRINCIPAL =====
function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 15. INICIALIZAÇÃO =====
function inicializarSistemaTecnicas() {
    console.log('🔧 Inicializando sistema de técnicas...');
    
    // Carrega dados salvos
    carregarTecnicasDoStorage();
    
    // Configura botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', renderizarTodasTecnicas);
    }
    
    // Configura fechar modal ao clicar fora
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                fecharModalTecnica();
            }
        });
    }
    
    // Renderiza tudo
    renderizarTodasTecnicas();
    
    console.log('✅ Sistema de técnicas inicializado com sucesso!');
}

// ===== 16. CARREGAR DO STORAGE =====
function carregarTecnicasDoStorage() {
    try {
        const dados = localStorage.getItem('tecnicas_aprendidas');
        if (dados) {
            tecnicasAprendidas = JSON.parse(dados);
            console.log(`📁 Carregadas ${tecnicasAprendidas.length} técnicas do storage`);
        }
        
        const pontos = localStorage.getItem('pontos_tecnicas');
        if (pontos) {
            pontosTecnicas = parseInt(pontos);
            console.log(`📁 Carregados ${pontosTecnicas} pontos de técnicas`);
        }
    } catch (e) {
        console.log('📁 Nenhuma técnica salva encontrada, iniciando com lista vazia');
        tecnicasAprendidas = [];
        pontosTecnicas = 0;
    }
}

// ===== 17. FUNÇÃO AUXILIAR: VER TODAS AS PERÍCIAS (DEBUG) =====
function debugVerPericias() {
    console.log('🔍 DEBUG: Verificando todas as perícias...');
    
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        console.log('Perícias no estado:', window.estadoPericias.periciasAprendidas);
    }
    
    // Testa buscar Arco
    const arco = buscarPericiaParaTecnica("Arco");
    console.log('Resultado Arco:', arco);
    
    // Testa buscar Cavalgar
    const cavalgar = buscarPericiaParaTecnica("Cavalgar");
    console.log('Resultado Cavalgar:', cavalgar);
    
    return { arco, cavalgar };
}

// ===== 18. EXPORTAR FUNÇÕES =====
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarOpcaoTecnica = selecionarOpcaoTecnica;
window.confirmarTecnicaModal = confirmarTecnicaModal;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;
window.debugVerPericias = debugVerPericias;

// ===== 19. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, configurando sistema de técnicas...');
    
    // Quando clicar na aba de técnicas
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                console.log('🔍 Aba de técnicas clicada, inicializando...');
                setTimeout(inicializarSistemaTecnicas, 100);
            }
        });
    });
    
    // Se já estiver na aba técnicas
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        console.log('🔍 Já está na aba técnicas, inicializando...');
        setTimeout(inicializarSistemaTecnicas, 100);
    }
    
    // Inicializa debug se necessário
    if (window.location.hash === '#debug') {
        console.log('🐛 Modo debug ativado');
        setTimeout(debugVerPericias, 500);
    }
});

console.log('✅ SISTEMA DE TÉCNICAS 100% COMPLETO CARREGADO!');
console.log('🔧 Funcionalidades implementadas:');
console.log('   - Catálogo com Arquearia Montada');
console.log('   - Busca inteligente de Arco (genérico)');
console.log('   - Busca inteligente de Cavalgar (qualquer especialização)');
console.log('   - Cálculo correto: Arco (NH X) - 4 + níveis');
console.log('   - Interface mostrando cálculo detalhado');
console.log('   - Sistema de pré-requisitos completo');