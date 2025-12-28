// ============================================
// TÉCNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

console.log("🎯 SISTEMA DE TÉCNICAS - CARREGANDO...");

// ===== 1. CATÁLOGO DE TÉCNICAS =====
const CATALOGO_TECNICAS = {
    // TÉCNICA PRINCIPAL: ARQUEARIA MONTADA
    "arquearia-montada": {
        id: "arquearia-montada",
        nome: "Arquearia Montada",
        icone: "fas fa-horse",
        descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4, que pode ser reduzida com pontos de técnica.",
        dificuldade: "Difícil",
        periciaBase: "Arco",
        atributo: "DX",
        modificadorBase: -4,  // Começa 4 níveis abaixo do Arco
        prereq: {
            arcoMinimo: 5,    // Precisa de Arco NH 5+
            temCavalgar: true // Precisa da perícia Cavalgar
        },
        // Tabela de custo para técnicas Difíceis
        tabelaCusto: {
            2: 1,  // 2 pontos = +1 nível
            3: 2,  // 3 pontos = +2 níveis
            4: 3,  // 4 pontos = +3 níveis
            5: 4   // 5 pontos = +4 níveis (MÁXIMO)
        }
    }
};

// ===== 2. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],           // Técnicas compradas pelo jogador
    modalAtivo: false,        // Se o modal está aberto
    tecnicaEditando: null,    // ID da técnica sendo editada
    pontosSelecionados: 2,    // Pontos selecionados (mínimo 2)
    ultimaTecnicaId: null     // Última técnica clicada
};

// ===== 3. FUNÇÕES DO CATÁLOGO =====
function obterTodasTecnicas() {
    return Object.values(CATALOGO_TECNICAS);
}

function buscarTecnicaPorId(id) {
    return CATALOGO_TECNICAS[id] || null;
}

// ===== 4. FUNÇÕES DE VERIFICAÇÃO =====

// 4.1 Obter NH do Arco do jogador
function obterNHArcoJogador() {
    console.log("🔍 Buscando NH do Arco...");
    
    // Se o sistema de perícias estiver disponível
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        // Procurar perícia de Arco
        const periciasArco = window.estadoPericias.periciasAprendidas.filter(p => 
            p && p.nome && p.nome.toLowerCase().includes('arco')
        );
        
        if (periciasArco.length > 0) {
            const periciaArco = periciasArco[0];
            // Obter atributo DX atual
            const dxAtual = window.obterAtributoAtual ? 
                window.obterAtributoAtual('DX') : 10;
            
            // Calcular NH: DX + nível da perícia
            const nhArco = dxAtual + (periciaArco.nivel || 0);
            console.log(`✅ NH Arco encontrado: ${nhArco} (DX: ${dxAtual} + nível: ${periciaArco.nivel || 0})`);
            return nhArco;
        }
    }
    
    console.warn("⚠️ Perícia de Arco não encontrada. Usando NH 10.");
    return 10; // Valor padrão
}

// 4.2 Verificar se tem Cavalgar
function verificarTemCavalgar() {
    console.log("🔍 Verificando perícia Cavalgar...");
    
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            p && p.nome && p.nome.toLowerCase().includes('cavalgar')
        );
        console.log(temCavalgar ? "✅ Tem Cavalgar" : "❌ Não tem Cavalgar");
        return temCavalgar;
    }
    
    return false;
}

// 4.3 Verificar pré-requisitos da técnica
function verificarPreRequisitosArquearia() {
    const nhArco = obterNHArcoJogador();
    const temCavalgar = verificarTemCavalgar();
    
    return {
        nhArco: nhArco,
        temCavalgar: temCavalgar,
        arcoOk: nhArco >= 5,
        podeAprender: nhArco >= 5 && temCavalgar,
        mensagem: !temCavalgar ? "❌ Precisa de Cavalgar" :
                  nhArco < 5 ? `❌ Arco precisa NH 5+ (atual: ${nhArco})` :
                  "✅ Pré-requisitos OK"
    };
}

// ===== 5. CÁLCULOS DA TÉCNICA =====

// 5.1 Calcular níveis baseado nos pontos
function calcularNiveisParaPontos(pontos) {
    if (pontos < 2) return 0;
    if (pontos >= 5) return 4;
    if (pontos >= 4) return 3;
    if (pontos >= 3) return 2;
    return 1; // 2 pontos = 1 nível
}

// 5.2 Calcular pontos baseado nos níveis
function calcularPontosParaNiveis(niveis) {
    switch(niveis) {
        case 4: return 5;
        case 3: return 4;
        case 2: return 3;
        case 1: return 2;
        case 0: return 0;
        default: return 0;
    }
}

// 5.3 Calcular estado completo da técnica
function calcularTecnicaArquearia() {
    const tecnica = CATALOGO_TECNICAS["arquearia-montada"];
    const prereq = verificarPreRequisitosArquearia();
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === "arquearia-montada");
    
    // NH base (Arco - 4)
    let nhBase = prereq.nhArco + tecnica.modificadorBase;
    if (nhBase < 3) nhBase = 3; // Mínimo NH 3
    
    let resultado = {
        id: tecnica.id,
        nome: tecnica.nome,
        prereq: prereq,
        nhBase: nhBase,
        niveis: 0,
        pontos: 0,
        nhAtual: nhBase,
        aprendida: false,
        podeComprar: prereq.podeAprender,
        maxNiveis: Math.max(0, prereq.nhArco - nhBase), // Máximo que pode subir
        maxPontos: calcularPontosParaNiveis(Math.max(0, prereq.nhArco - nhBase))
    };
    
    // Se já está aprendida
    if (aprendida) {
        resultado.aprendida = true;
        resultado.pontos = aprendida.pontos || 0;
        resultado.niveis = calcularNiveisParaPontos(resultado.pontos);
        resultado.nhAtual = nhBase + resultado.niveis;
        
        // Limitar ao NH do Arco
        if (resultado.nhAtual > prereq.nhArco) {
            resultado.nhAtual = prereq.nhArco;
        }
    }
    
    return resultado;
}

// ===== 6. INTERFACE =====

// 6.1 Renderizar técnica na lista
function renderizarTecnicaNaLista() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.error("❌ Container #lista-tecnicas não encontrado");
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS["arquearia-montada"];
    const calculo = calcularTecnicaArquearia();
    
    container.innerHTML = '';
    
    const elemento = document.createElement('div');
    elemento.className = 'tecnica-item';
    elemento.dataset.id = tecnica.id;
    
    // Status da técnica
    let statusHTML = '';
    let botoesHTML = '';
    
    if (calculo.aprendida) {
        statusHTML = `
            <div class="tecnica-status aprendida">
                <i class="fas fa-check-circle"></i> APRENDIDA
                <span class="tecnica-nh">NH ${calculo.nhAtual}</span>
                <span class="tecnica-pontos">${calculo.pontos} pts</span>
            </div>
        `;
        botoesHTML = `
            <button class="btn-tecnica btn-editar" onclick="abrirModalTecnica('${tecnica.id}')">
                <i class="fas fa-edit"></i> Editar
            </button>
        `;
    } else if (calculo.podeComprar) {
        statusHTML = `
            <div class="tecnica-status disponivel">
                <i class="fas fa-unlock"></i> DISPONÍVEL
            </div>
        `;
        botoesHTML = `
            <button class="btn-tecnica btn-adquirir" onclick="abrirModalTecnica('${tecnica.id}')">
                <i class="fas fa-plus-circle"></i> Adquirir
            </button>
        `;
    } else {
        statusHTML = `
            <div class="tecnica-status bloqueada">
                <i class="fas fa-lock"></i> BLOQUEADA
                <div class="tecnica-erro">${calculo.prereq.mensagem}</div>
            </div>
        `;
    }
    
    elemento.innerHTML = `
        <div class="tecnica-header">
            <div class="tecnica-titulo">
                <i class="${tecnica.icone}"></i> ${tecnica.nome}
                <span class="tecnica-dificuldade">${tecnica.dificuldade}</span>
            </div>
            ${statusHTML}
        </div>
        
        <div class="tecnica-descricao">
            <p>${tecnica.descricao}</p>
        </div>
        
        <div class="tecnica-prereq">
            <div class="prereq-item ${calculo.prereq.arcoOk ? 'ok' : 'falha'}">
                <i class="fas fa-${calculo.prereq.arcoOk ? 'check' : 'times'}"></i>
                Arco NH ≥ 5 <span class="valor-atual">(${calculo.prereq.nhArco})</span>
            </div>
            <div class="prereq-item ${calculo.prereq.temCavalgar ? 'ok' : 'falha'}">
                <i class="fas fa-${calculo.prereq.temCavalgar ? 'check' : 'times'}"></i>
                Perícia Cavalgar
            </div>
        </div>
        
        ${calculo.aprendida ? `
        <div class="tecnica-progresso">
            <div class="progresso-bar">
                <div class="progresso-fill" style="width: ${(calculo.niveis / calculo.maxNiveis) * 100}%"></div>
            </div>
            <div class="progresso-texto">
                <span>Base: NH ${calculo.nhBase}</span>
                <span>→</span>
                <span>Atual: NH ${calculo.nhAtual}</span>
                <span>→</span>
                <span>Máx: NH ${calculo.prereq.nhArco}</span>
            </div>
        </div>
        ` : ''}
        
        <div class="tecnica-footer">
            ${botoesHTML}
        </div>
    `;
    
    container.appendChild(elemento);
}

// 6.2 Renderizar técnicas aprendidas
function renderizarTecnicasAprendidas() {
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-tecnica">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>Adquira técnicas para aprimorar suas habilidades</small>
            </div>
        `;
        return;
    }
    
    estadoTecnicas.aprendidas.forEach(tecnicaAprendida => {
        const tecnica = CATALOGO_TECNICAS[tecnicaAprendida.id];
        if (!tecnica) return;
        
        const calculo = calcularTecnicaArquearia();
        
        const elemento = document.createElement('div');
        elemento.className = 'tecnica-aprendida-item';
        
        elemento.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="${tecnica.icone}"></i> ${tecnica.nome}
                </div>
                <div class="tecnica-aprendida-info">
                    <span class="nivel">+${calculo.niveis}</span>
                    <span class="nh">NH ${calculo.nhAtual}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-detalhes">
                <div class="detalhe-item">
                    <span class="label">Investimento:</span>
                    <span class="valor">${tecnicaAprendida.pontos} pontos</span>
                </div>
                <div class="detalhe-item">
                    <span class="label">Base:</span>
                    <span class="valor">${tecnica.periciaBase} ${tecnica.modificadorBase}</span>
                </div>
                <div class="detalhe-item">
                    <span class="label">Limite:</span>
                    <span class="valor">NH ${calculo.prereq.nhArco}</span>
                </div>
            </div>
            
            <div class="tecnica-aprendida-acoes">
                <button class="btn-editar-tecnica" onclick="abrirModalTecnica('${tecnica.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnica.id}')">
                    <i class="fas fa-trash"></i> Remover
                </button>
            </div>
        `;
        
        container.appendChild(elemento);
    });
    
    // Atualizar pontos totais
    atualizarPontosTecnicas();
}

// 6.3 Atualizar pontos totais
function atualizarPontosTecnicas() {
    const total = estadoTecnicas.aprendidas.reduce((sum, t) => sum + (t.pontos || 0), 0);
    
    const badge = document.getElementById('pontos-tecnicas');
    if (badge) {
        badge.textContent = `${total} pts`;
    }
    
    return total;
}

// ===== 7. MODAL DE TÉCNICA =====

// 7.1 Abrir modal
function abrirModalTecnica(idTecnica) {
    const tecnica = CATALOGO_TECNICAS[idTecnica];
    if (!tecnica) return;
    
    const calculo = calcularTecnicaArquearia();
    
    // Verificar pré-requisitos
    if (!calculo.podeComprar) {
        mostrarNotificacao(calculo.prereq.mensagem, 'error');
        return;
    }
    
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === idTecnica);
    const pontosAtuais = aprendida ? aprendida.pontos : 0;
    
    // Configurar estado
    estadoTecnicas.modalAtivo = true;
    estadoTecnicas.tecnicaEditando = idTecnica;
    estadoTecnicas.pontosSelecionados = pontosAtuais > 0 ? pontosAtuais : 2; // Começa com mínimo
    
    // Criar ou atualizar modal
    let modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (!modalOverlay) {
        modalOverlay = criarModalTecnica();
    }
    
    // Atualizar conteúdo do modal
    atualizarConteudoModal(tecnica, calculo, pontosAtuais);
    
    // Mostrar modal
    modalOverlay.style.display = 'flex';
}

// 7.2 Criar modal
function criarModalTecnica() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-tecnica-overlay';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-tecnica-content';
    modalContent.innerHTML = `
        <div class="modal-tecnica-loading">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregando técnica...</p>
        </div>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Fechar ao clicar fora
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === this) {
            fecharModalTecnica();
        }
    });
    
    return modalOverlay;
}

// 7.3 Atualizar conteúdo do modal
function atualizarConteudoModal(tecnica, calculo, pontosAtuais) {
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (!modalOverlay) return;
    
    const modalContent = modalOverlay.querySelector('.modal-tecnica-content');
    if (!modalContent) return;
    
    const niveisSelecionados = calcularNiveisParaPontos(estadoTecnicas.pontosSelecionados);
    const nhAtual = calculo.nhBase + niveisSelecionados;
    const diferenca = estadoTecnicas.pontosSelecionados - pontosAtuais;
    
    // Determinar texto do botão
    let textoBotao = "Adquirir";
    if (pontosAtuais > 0) {
        if (diferenca > 0) textoBotao = "Evoluir";
        else if (diferenca < 0) textoBotao = "Reduzir";
        else textoBotao = "Fechar";
    }
    
    modalContent.innerHTML = `
        <div class="modal-tecnica-header">
            <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
            <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
        </div>
        
        <div class="modal-tecnica-body">
            <div class="tecnica-info-cards">
                <div class="info-card">
                    <div class="info-label">Seu ${tecnica.periciaBase}</div>
                    <div class="info-value">NH ${calculo.prereq.nhArco}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Base (${tecnica.periciaBase}${tecnica.modificadorBase})</div>
                    <div class="info-value">NH ${calculo.nhBase}</div>
                </div>
                <div class="info-card">
                    <div class="info-label">Limite Máximo</div>
                    <div class="info-value">NH ${calculo.prereq.nhArco}</div>
                </div>
            </div>
            
            <div class="tecnica-descricao-modal">
                <p>${tecnica.descricao}</p>
            </div>
            
            <div class="tecnica-controle-pontos">
                <div class="controle-header">
                    <h4>Pontos de Técnica</h4>
                    <div class="pontos-display">${estadoTecnicas.pontosSelecionados} pontos</div>
                </div>
                
                <div class="controle-botoes">
                    <button class="btn-controle ${estadoTecnicas.pontosSelecionados <= 2 ? 'disabled' : ''}" 
                            onclick="mudarPontosTecnica(-1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <div class="pontos-opcoes">
                        <span class="opcao ${estadoTecnicas.pontosSelecionados === 2 ? 'ativo' : ''}">2 pts</span>
                        <span class="opcao ${estadoTecnicas.pontosSelecionados === 3 ? 'ativo' : ''}">3 pts</span>
                        <span class="opcao ${estadoTecnicas.pontosSelecionados === 4 ? 'ativo' : ''}">4 pts</span>
                        <span class="opcao ${estadoTecnicas.pontosSelecionados === 5 ? 'ativo' : ''}">5 pts</span>
                    </div>
                    <button class="btn-controle ${estadoTecnicas.pontosSelecionados >= calculo.maxPontos ? 'disabled' : ''}" 
                            onclick="mudarPontosTecnica(1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <div class="controle-resultado">
                    <div class="resultado-item">
                        <span>Níveis: </span>
                        <strong>+${niveisSelecionados}</strong>
                    </div>
                    <div class="resultado-item">
                        <span>NH Final: </span>
                        <strong class="nh-final">${nhAtual}</strong>
                    </div>
                </div>
                
                <div class="controle-tabela">
                    <small>Técnica ${tecnica.dificuldade}:</small>
                    <div class="tabela-linha">
                        <span>2 pts = +1 nível</span>
                        <span>3 pts = +2 níveis</span>
                        <span>4 pts = +3 níveis</span>
                        <span>5 pts = +4 níveis</span>
                    </div>
                </div>
            </div>
            
            <div class="tecnica-custo-total">
                <div class="custo-label">Custo Total:</div>
                <div class="custo-valor">${estadoTecnicas.pontosSelecionados} pontos</div>
                ${diferenca !== 0 ? `
                <div class="custo-diferenca ${diferenca > 0 ? 'positivo' : 'negativo'}">
                    ${diferenca > 0 ? '+' : ''}${diferenca}
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="modal-tecnica-footer">
            <div class="modal-acoes">
                <button class="btn-modal btn-cancelar" onclick="fecharModalTecnica()">
                    <i class="fas fa-times"></i> Cancelar
                </button>
                <button class="btn-modal btn-confirmar" onclick="confirmarTecnica(${estadoTecnicas.pontosSelecionados})"
                        ${diferenca === 0 ? 'disabled' : ''}>
                    <i class="fas fa-check"></i> ${textoBotao}
                </button>
            </div>
        </div>
    `;
}

// 7.4 Mudar pontos no modal
function mudarPontosTecnica(mudanca) {
    const tecnica = CATALOGO_TECNICAS[estadoTecnicas.tecnicaEditando];
    if (!tecnica) return;
    
    const calculo = calcularTecnicaArquearia();
    const novo = estadoTecnicas.pontosSelecionados + mudanca;
    
    // Validar limites
    if (novo >= 2 && novo <= calculo.maxPontos) {
        estadoTecnicas.pontosSelecionados = novo;
        const aprendida = estadoTecnicas.aprendidas.find(t => t.id === estadoTecnicas.tecnicaEditando);
        const pontosAtuais = aprendida ? aprendida.pontos : 0;
        atualizarConteudoModal(tecnica, calculo, pontosAtuais);
    }
}

// 7.5 Confirmar técnica
function confirmarTecnica(pontosSelecionados) {
    const idTecnica = estadoTecnicas.tecnicaEditando;
    const tecnica = CATALOGO_TECNICAS[idTecnica];
    if (!tecnica) return;
    
    const aprendidaIndex = estadoTecnicas.aprendidas.findIndex(t => t.id === idTecnica);
    const aprendida = aprendidaIndex >= 0 ? estadoTecnicas.aprendidas[aprendidaIndex] : null;
    const pontosAtuais = aprendida ? aprendida.pontos : 0;
    
    const niveis = calcularNiveisParaPontos(pontosSelecionados);
    const calculo = calcularTecnicaArquearia();
    const nhFinal = calculo.nhBase + niveis;
    
    let mensagem = '';
    if (aprendida) {
        if (pontosSelecionados > pontosAtuais) {
            mensagem = `Evoluir técnica?\n\n+${pontosSelecionados - pontosAtuais} pontos\nNH: ${nhFinal}\nTotal: ${pontosSelecionados} pts`;
        } else {
            mensagem = `Reduzir técnica?\n\n-${pontosAtuais - pontosSelecionados} pontos\nNH: ${nhFinal}\nTotal: ${pontosSelecionados} pts`;
        }
    } else {
        mensagem = `Adquirir técnica?\n\n${pontosSelecionados} pontos\nNH: ${nhFinal}`;
    }
    
    if (!confirm(mensagem)) return;
    
    if (aprendidaIndex >= 0) {
        if (pontosSelecionados > 0) {
            // Atualizar técnica existente
            estadoTecnicas.aprendidas[aprendidaIndex] = {
                id: idTecnica,
                nome: tecnica.nome,
                pontos: pontosSelecionados,
                niveis: niveis,
                nhAtual: nhFinal
            };
        } else {
            // Remover técnica (se pontos = 0)
            estadoTecnicas.aprendidas.splice(aprendidaIndex, 1);
        }
    } else if (pontosSelecionados > 0) {
        // Adicionar nova técnica
        estadoTecnicas.aprendidas.push({
            id: idTecnica,
            nome: tecnica.nome,
            pontos: pontosSelecionados,
            niveis: niveis,
            nhAtual: nhFinal
        });
    }
    
    // Salvar e atualizar
    salvarTecnicas();
    atualizarInterfaceTecnicas();
    fecharModalTecnica();
    
    mostrarNotificacao(
        pontosSelecionados > pontosAtuais ? '✅ Técnica evoluída!' :
        pontosSelecionados < pontosAtuais ? '📉 Técnica reduzida!' :
        '✅ Técnica adquirida!',
        'success'
    );
}

// 7.6 Fechar modal
function fecharModalTecnica() {
    estadoTecnicas.modalAtivo = false;
    estadoTecnicas.tecnicaEditando = null;
    estadoTecnicas.pontosSelecionados = 2;
    
    const modalOverlay = document.querySelector('.modal-tecnica-overlay');
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
    }
}

// 7.7 Remover técnica
function removerTecnica(idTecnica) {
    const tecnica = CATALOGO_TECNICAS[idTecnica];
    if (!tecnica) return;
    
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === idTecnica);
    if (!aprendida) return;
    
    if (confirm(`Remover "${tecnica.nome}"?\n\nVocê recuperará ${aprendida.pontos} pontos.`)) {
        estadoTecnicas.aprendidas = estadoTecnicas.aprendidas.filter(t => t.id !== idTecnica);
        salvarTecnicas();
        atualizarInterfaceTecnicas();
        mostrarNotificacao('🗑️ Técnica removida!', 'info');
    }
}

// ===== 8. SALVAMENTO E CARREGAMENTO =====

function salvarTecnicas() {
    try {
        const dados = {
            aprendidas: estadoTecnicas.aprendidas,
            dataSalvamento: new Date().toISOString()
        };
        localStorage.setItem('gurps_tecnicas', JSON.stringify(dados));
    } catch (error) {
        console.error('❌ Erro ao salvar técnicas:', error);
    }
}

function carregarTecnicas() {
    try {
        const dadosSalvos = localStorage.getItem('gurps_tecnicas');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            estadoTecnicas.aprendidas = dados.aprendidas || [];
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
        }
    } catch (error) {
        console.error('❌ Erro ao carregar técnicas:', error);
        estadoTecnicas.aprendidas = [];
    }
}

// ===== 9. ATUALIZAR INTERFACE COMPLETA =====

function atualizarInterfaceTecnicas() {
    renderizarTecnicaNaLista();
    renderizarTecnicasAprendidas();
}

// ===== 10. NOTIFICAÇÕES =====

function mostrarNotificacao(mensagem, tipo = 'info') {
    // Se houver sistema de notificação, use-o
    if (window.showNotification) {
        window.showNotification(mensagem, tipo);
        return;
    }
    
    // Fallback simples
    const notificacao = document.createElement('div');
    notificacao.className = `tecnica-notificacao tecnica-notificacao-${tipo}`;
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

// ===== 11. INICIALIZAÇÃO =====

function inicializarSistemaTecnicas() {
    console.log('🚀 Inicializando sistema de técnicas...');
    
    try {
        // Carregar dados salvos
        carregarTecnicas();
        
        // Atualizar interface
        atualizarInterfaceTecnicas();
        
        // Configurar atualização automática
        setInterval(() => {
            if (!estadoTecnicas.modalAtivo) {
                atualizarInterfaceTecnicas();
            }
        }, 5000);
        
        console.log('✅ Sistema de técnicas inicializado');
        
    } catch (error) {
        console.error('❌ Erro na inicialização:', error);
    }
}

// ===== 12. EXPORTAR FUNÇÕES =====

window.initTecnicas = inicializarSistemaTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.mudarPontosTecnica = mudarPontosTecnica;
window.confirmarTecnica = confirmarTecnica;
window.removerTecnica = removerTecnica;
window.atualizarInterfaceTecnicas = atualizarInterfaceTecnicas;
window.obterTodasTecnicas = obterTodasTecnicas;

// ===== 13. INICIAR QUANDO A ABA FOR ATIVADA =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado, sistema de técnicas pronto');
    
    // Observar quando a aba de técnicas ficar ativa
    const tecnicaTab = document.getElementById('subtab-tecnicas');
    if (tecnicaTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' && 
                    tecnicaTab.classList.contains('active')) {
                    
                    // Pequeno delay para garantir carregamento
                    setTimeout(function() {
                        if (!window.tecnicasInicializadas) {
                            inicializarSistemaTecnicas();
                            window.tecnicasInicializadas = true;
                        }
                    }, 200);
                }
            });
        });
        
        observer.observe(tecnicaTab, { attributes: true });
        
        // Se já estiver ativa, inicializar
        if (tecnicaTab.classList.contains('active')) {
            setTimeout(inicializarSistemaTecnicas, 500);
        }
    }
});

console.log('✅ TECNICAS.JS - SISTEMA COMPLETO CARREGADO');