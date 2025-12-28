// ============================================
// SISTEMA DE TÉCNICAS - ADAPTADO PARA NOVO PROJETO
// ============================================

console.log("🎯 SISTEMA DE TÉCNICAS - ADAPTADO PARA NOVO PROJETO");

// ===== 1. ESTADO DO SISTEMA =====
const estadoTecnicas = {
    aprendidas: [],     // Técnicas compradas
    pontosTotal: 0     // Pontos gastos
};

// ===== 2. FUNÇÕES DE CÁLCULO 100% CORRETAS FINAIS =====

// 2.1 Obter NH do Arco CORRETAMENTE - Adaptado
function obterNHArcoReal() {
    console.log("🎯 Buscando NH do Arco...");
    
    // Estratégia 1: Usar sistema de perícias se disponível
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const arco = window.estadoPericias.periciasAprendidas.find(p => 
            p.id === 'arco' || p.nome.toLowerCase().includes('arco')
        );
        
        if (arco) {
            // Calcular NH baseado em atributo + nível
            const dx = obterAtributoAtual('DX');
            const nh = dx + (arco.nivel || 0);
            console.log("✅ NH encontrado via sistema:", nh);
            return nh;
        }
    }
    
    // Estratégia 2: Buscar na interface do novo projeto
    const elementosNH = document.querySelectorAll('[class*="nh"], [class*="NH"], .nivel-display, .nh-display');
    for (let elemento of elementosNH) {
        const texto = (elemento.textContent || '').trim();
        if ((texto.includes('Arco') || texto.includes('arco')) && texto.includes('NH')) {
            const match = texto.match(/NH\s*[:\-]?\s*(\d+)/i);
            if (match && match[1]) {
                const nh = parseInt(match[1]);
                console.log("✅ NH encontrado na interface:", nh);
                return nh;
            }
        }
    }
    
    // Estratégia 3: Tentar extrair de perícias aprendidas
    const aprendidasContainer = document.getElementById('pericias-aprendidas');
    if (aprendidasContainer) {
        const itens = aprendidasContainer.querySelectorAll('.pericia-aprendida-item');
        for (let item of itens) {
            const texto = (item.textContent || '').trim();
            if (texto.includes('Arco') && !texto.includes('Montada')) {
                const numeros = texto.match(/\d+/g);
                if (numeros && numeros.length > 0) {
                    // Pega o maior número (geralmente é o NH)
                    const maiorNumero = Math.max(...numeros.map(n => parseInt(n)));
                    if (maiorNumero > 0 && maiorNumero <= 25) {
                        console.log("⚠️ NH inferido (fallback):", maiorNumero);
                        return maiorNumero;
                    }
                }
            }
        }
    }
    
    console.log("⚠️ Usando valor padrão 10 (não encontrou Arco)");
    return 10; // Default
}

// 2.2 Verificar se tem Cavalgar - Adaptado
function verificarTemCavalgar() {
    // Verificar no sistema de perícias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const temCavalgar = window.estadoPericias.periciasAprendidas.some(p => 
            p.id === 'grupo-cavalgar' || 
            p.nome.toLowerCase().includes('cavalgar') ||
            p.grupo === 'Cavalgar'
        );
        
        console.log(temCavalgar ? "✅ Cavalgar encontrado via sistema" : "⚠️ Cavalgar NÃO encontrado via sistema");
        return temCavalgar;
    }
    
    // Verificar na interface
    const aprendidasContainer = document.getElementById('pericias-aprendidas');
    if (!aprendidasContainer) {
        console.log("⚠️ Container pericias-aprendidas não encontrado");
        return false;
    }
    
    const elementos = aprendidasContainer.querySelectorAll('*');
    for (let elemento of elementos) {
        const texto = (elemento.textContent || '').toLowerCase();
        if (texto.includes('cavalgar') || texto.includes('cavalaria')) {
            console.log("✅ Cavalgar encontrado na interface");
            return true;
        }
    }
    
    console.log("⚠️ Cavalgar NÃO encontrado");
    return false;
}

// 2.3 FUNÇÃO 100% CORRETA FINAL: Calcular níveis baseado nos pontos (TÉCNICA DIFÍCIL)
function calcularNiveisParaPontos(pontos) {
    console.log(`📊 Calculando níveis para ${pontos} pontos (Técnica Difícil - CORRETO)`);
    
    // REGRA 100% CORRETA FINAL PARA TÉCNICA DIFÍCIL:
    // MENOS DE 2 PONTOS = 0 NÍVEIS
    // 2 pontos = 1 nível (+1)
    // 3 pontos = 2 níveis (+2)
    // 4 pontos = 3 níveis (+3)
    // 5 pontos = 4 níveis (+4)
    
    if (pontos < 2) {
        console.log(`❌ ${pontos} pontos → 0 níveis (mínimo 2 pontos para técnica difícil)`);
        return 0;
    }
    
    if (pontos >= 5) {
        console.log(`✅ ${pontos} pontos → 4 níveis`);
        return 4;
    }
    
    if (pontos >= 4) {
        console.log(`✅ ${pontos} pontos → 3 níveis`);
        return 3;
    }
    
    if (pontos >= 3) {
        console.log(`✅ ${pontos} pontos → 2 níveis`);
        return 2;
    }
    
    // pontos >= 2
    console.log(`✅ ${pontos} pontos → 1 nível`);
    return 1;
}

// 2.4 FUNÇÃO 100% CORRETA: Calcular pontos baseado nos níveis (TÉCNICA DIFÍCIL)
function calcularPontosParaNiveis(niveis) {
    console.log(`💰 Calculando pontos para ${niveis} níveis (Técnica Difícil - CORRETO)`);
    
    // REGRA INVERSA 100% CORRETA:
    // 0 níveis = 0 pontos
    // 1 nível = 2 pontos
    // 2 níveis = 3 pontos
    // 3 níveis = 4 pontos
    // 4 níveis = 5 pontos
    
    switch(niveis) {
        case 4:
            console.log("✅ 4 níveis → 5 pontos");
            return 5;
        case 3:
            console.log("✅ 3 níveis → 4 pontos");
            return 4;
        case 2:
            console.log("✅ 2 níveis → 3 pontos");
            return 3;
        case 1:
            console.log("✅ 1 nível → 2 pontos");
            return 2;
        case 0:
            console.log("✅ 0 níveis → 0 pontos");
            return 0;
        default:
            console.log(`⚠️ Nível inválido: ${niveis}, usando 0 pontos`);
            return 0;
    }
}

// 2.5 Calcular técnica COM CÁLCULO 100% CORRETO - Adaptado
function calcularTecnica() {
    console.log("🔧 Calculando técnica (CÁLCULO 100% CORRETO)...");
    
    const nhArco = obterNHArcoReal();
    const base = nhArco - 4;
    const temCavalgar = verificarTemCavalgar();
    
    console.log(`🎯 NH Arco: ${nhArco}, Base: ${base}, Tem Cavalgar: ${temCavalgar}`);
    
    // Verificar técnica aprendida
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    if (!aprendida) {
        const resultado = {
            base: base,
            atual: base,
            niveis: 0,
            pontos: 0,
            max: nhArco,
            podeComprar: temCavalgar && nhArco >= 5,
            temCavalgar: temCavalgar,
            nhArco: nhArco
        };
        
        console.log("📋 Resultado (não aprendida):", resultado);
        return resultado;
    }
    
    // CÁLCULO CORRETO: Usar nova função
    const pontos = aprendida.custoTotal || 0;
    const niveis = calcularNiveisParaPontos(pontos);
    const atual = base + niveis;
    
    const resultado = {
        base: base,
        atual: atual,
        niveis: niveis,
        pontos: pontos,
        max: nhArco,
        podeComprar: true,
        temCavalgar: temCavalgar,
        nhArco: nhArco
    };
    
    console.log("📋 Resultado (aprendida):", resultado);
    console.log(`✅ CORRETO: ${pontos} pontos → ${niveis} níveis → NH ${atual}`);
    return resultado;
}

// Função auxiliar: Obter atributo atual
function obterAtributoAtual(atributo) {
    if (window.obterAtributoAtual) {
        return window.obterAtributoAtual(atributo);
    }
    
    // Fallback: tenta obter dos inputs
    const input = document.getElementById(atributo);
    if (input) {
        return parseInt(input.value) || 10;
    }
    
    return 10; // Default
}

// ===== 3. INTERFACE DA TÉCNICA - ADAPTADA =====

function atualizarTecnicaNaTela() {
    console.log("🔄 Atualizando técnica na tela...");
    
    const container = document.getElementById('lista-tecnicas');
    if (!container) {
        console.log("❌ Container '#lista-tecnicas' não encontrado!");
        setTimeout(atualizarTecnicaNaTela, 1000);
        return;
    }
    
    const calculo = calcularTecnica();
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    
    console.log(`📊 Dados para display: NH Arco=${calculo.nhArco}, Base=${calculo.base}, Atual=${calculo.atual}, Níveis=${calculo.niveis}, Pontos=${calculo.pontos}`);
    
    // Criar ou atualizar card
    let card = document.getElementById('tecnica-arquearia-montada');
    if (!card) {
        card = document.createElement('div');
        card.id = 'tecnica-arquearia-montada';
        card.className = 'tecnica-item';
        container.insertBefore(card, container.firstChild);
        console.log("✅ Card criado");
    }
    
    // Determinar se pode comprar
    const podeComprar = calculo.temCavalgar && calculo.nhArco >= 5;
    
    // HTML da técnica adaptado para novo design
    card.innerHTML = `
        <div class="tecnica-header">
            <div class="tecnica-nome">
                <i class="fas fa-horse"></i> Arquearia Montada
                ${aprendida ? '<span class="aprendida-badge"><i class="fas fa-check"></i></span>' : ''}
            </div>
            <div class="tecnica-info">
                <span class="dificuldade-badge">Difícil</span>
                <span class="tecnica-nh">NH ${calculo.atual}</span>
                ${calculo.niveis > 0 ? `<span class="tecnica-bonus">+${calculo.niveis}</span>` : ''}
            </div>
        </div>
        
        <div class="tecnica-base">
            Arco-4 <span class="tecnica-limite">(Máx: Arco)</span>
        </div>
        
        <div class="tecnica-descricao">
            Usar arco enquanto cavalga. Penalidades para disparar montado não reduzem abaixo do NH desta técnica.
        </div>
        
        <div class="tecnica-prereq">
            <strong>Pré-requisitos:</strong>
            <div class="prereq-list">
                <span class="${calculo.nhArco >= 5 ? 'prereq-ok' : 'prereq-fail'}">
                    <i class="fas fa-${calculo.nhArco >= 5 ? 'check' : 'times'}"></i>
                    Arco NH ≥ 5 (Atual: ${calculo.nhArco})
                </span>
                <span class="${calculo.temCavalgar ? 'prereq-ok' : 'prereq-fail'}">
                    <i class="fas fa-${calculo.temCavalgar ? 'check' : 'times'}"></i>
                    Perícia Cavalgar
                </span>
            </div>
        </div>
        
        <div style="margin-top: 15px;">
            <div class="${aprendida ? 'tecnica-aprendida-indicator' : (podeComprar ? 'tecnica-disponivel' : 'tecnica-bloqueada')}">
                <i class="fas fa-${aprendida ? 'check-circle' : (podeComprar ? 'shopping-cart' : 'exclamation-triangle')}"></i>
                ${aprendida ? `Aprendida (${calculo.pontos} pontos = +${calculo.niveis} níveis)` :
                 podeComprar ? 'Disponível para adquirir' :
                 `PRÉ-REQUISITO: Precisa de Cavalgar (Arco: ${calculo.nhArco})`}
            </div>
        </div>
    `;
    
    // Evento de clique APENAS se pode comprar
    if (podeComprar) {
        card.style.cursor = 'pointer';
        card.onclick = abrirModalTecnica;
    } else {
        card.style.cursor = 'not-allowed';
        card.onclick = null;
    }
    
    console.log("✅ Técnica atualizada na tela");
}

// ===== 4. TÉCNICAS APRENDIDAS - ADAPTADA =====

function atualizarDisplayAprendidas() {
    console.log("🔄 Atualizando display de aprendidas...");
    
    const container = document.getElementById('tecnicas-aprendidas');
    if (!container) {
        console.log("❌ Container 'tecnicas-aprendidas' não encontrado");
        return;
    }
    
    container.innerHTML = '';
    
    if (estadoTecnicas.aprendidas.length === 0) {
        container.innerHTML = `
            <div class="nenhuma-pericia-aprendida">
                <i class="fas fa-tools"></i>
                <div>Nenhuma técnica aprendida</div>
                <small>As técnicas que você adquirir aparecerão aqui</small>
            </div>
        `;
        
        // Atualizar pontos no badge
        document.getElementById('pontos-tecnicas').textContent = '0 pts';
        console.log("✅ Nenhuma técnica aprendida (display limpo)");
        return;
    }
    
    estadoTecnicas.aprendidas.forEach(tecnica => {
        const calculo = calcularTecnica();
        
        const item = document.createElement('div');
        item.className = 'tecnica-aprendida-item';
        
        item.innerHTML = `
            <div class="tecnica-aprendida-header">
                <div class="tecnica-aprendida-nome">
                    <i class="fas fa-horse"></i> ${tecnica.nome}
                </div>
                <div class="tecnica-aprendida-info">
                    <span class="nivel-display">+${calculo.niveis}</span>
                    <span class="nh-display">NH ${calculo.atual}</span>
                </div>
            </div>
            
            <div class="tecnica-nivel-container">
                <div class="nivel-progresso">
                    <span class="nivel-base">${calculo.base}</span>
                    <i class="fas fa-arrow-right"></i>
                    <span class="nivel-atual">${calculo.atual}</span>
                    <span class="nivel-max">(Máx: ${calculo.nhArco})</span>
                </div>
                <div class="nivel-detalhes">
                    Arco-4 + ${calculo.niveis}
                </div>
            </div>
            
            <div class="tecnica-custo-info">
                <div class="custo-label">Investimento:</div>
                <div class="custo-valor">${tecnica.custoTotal || 0} pontos</div>
            </div>
            
            <button class="btn-remover-tecnica" data-id="${tecnica.id}">
                <i class="fas fa-times"></i> Remover
            </button>
        `;
        
        // Adicionar evento para remover
        const btnRemover = item.querySelector('.btn-remover-tecnica');
        btnRemover.addEventListener('click', (e) => {
            e.stopPropagation();
            excluirTecnica(tecnica.id);
        });
        
        // Adicionar evento para editar
        item.addEventListener('click', () => {
            abrirModalTecnica();
        });
        
        container.appendChild(item);
    });
    
    // Atualizar pontos no badge
    const total = estadoTecnicas.aprendidas.reduce((sum, t) => sum + (t.custoTotal || 0), 0);
    document.getElementById('pontos-tecnicas').textContent = `${total} pts`;
    
    console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s) exibida(s)`);
}

// ===== 5. EXCLUSÃO DE TÉCNICA =====

function excluirTecnica(id) {
    const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
    if (index === -1) return;
    
    const tecnica = estadoTecnicas.aprendidas[index];
    
    if (confirm(`Remover "${tecnica.nome}"?\n\nRecuperará ${tecnica.custoTotal || 0} pontos.`)) {
        estadoTecnicas.aprendidas.splice(index, 1);
        localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
        
        atualizarTodasTecnicas();
        showToastTecnica(`🗑️ "${tecnica.nome}" removida!`);
    }
}

// ===== 6. MODAL DE AQUISIÇÃO - ADAPTADO =====

function abrirModalTecnica() {
    console.log("🎪 Abrindo modal de técnica...");
    
    const calculo = calcularTecnica();
    const nhArco = calculo.nhArco;
    const base = calculo.base;
    
    if (nhArco < 5) {
        showToastTecnica('❌ Você precisa ter Arco NH 5 ou mais para usar esta técnica!', 'error');
        return;
    }
    
    if (!calculo.temCavalgar) {
        showToastTecnica('❌ Você precisa da perícia Cavalgar para usar esta técnica!', 'error');
        return;
    }
    
    const aprendida = estadoTecnicas.aprendidas.find(t => t.id === 'arquearia-montada');
    const pontosAtuais = aprendida ? aprendida.custoTotal || 0 : 0;
    
    // CORREÇÃO FINAL: SEMPRE começar com mínimo 2 pontos para técnica difícil
    let pontosSelecionados = pontosAtuais;
    if (pontosAtuais === 0) {
        pontosSelecionados = 2; // MÍNIMO ABSOLUTO: 2 PONTOS PARA TÉCNICA DIFÍCIL
    }
    
    const maxNiveis = nhArco - base;
    const maxPontos = calcularPontosParaNiveis(maxNiveis);
    
    console.log(`🎯 Modal: NH=${nhArco}, Base=${base}, PontosAtuais=${pontosAtuais}, PontosSelecionados=${pontosSelecionados}, MaxNíveis=${maxNiveis}, MaxPontos=${maxPontos}`);
    
    // Criar modal usando o estilo do novo projeto
    const modalOverlay = document.querySelector('.modal-tecnica-overlay') || criarModalTecnica();
    
    function atualizarModal() {
        const niveisSelecionados = calcularNiveisParaPontos(pontosSelecionados);
        const nhAtual = base + niveisSelecionados;
        const diferenca = pontosSelecionados - pontosAtuais;
        
        // Determinar texto do botão principal
        const temTecnica = pontosAtuais > 0;
        let textoBotaoPrincipal = "Adquirir";
        
        if (temTecnica) {
            if (diferenca > 0) {
                textoBotaoPrincipal = "Evoluir";
            } else if (diferenca < 0) {
                textoBotaoPrincipal = "Reduzir";
            } else {
                textoBotaoPrincipal = "Fechar";
            }
        }
        
        const modalContent = modalOverlay.querySelector('.modal-tecnica-content');
        modalContent.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-horse"></i> Arquearia Montada</h3>
                <button class="modal-close" onclick="fecharModalTecnica()">&times;</button>
            </div>
            
            <div class="modal-body">
                <div class="modal-info-grid">
                    <div class="info-card">
                        <div class="info-label">Seu Arco</div>
                        <div class="info-value">${nhArco}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Base (Arco-4)</div>
                        <div class="info-value">${base}</div>
                    </div>
                    <div class="info-card">
                        <div class="info-label">Máximo</div>
                        <div class="info-value">${nhArco}</div>
                    </div>
                </div>
                
                <div class="tecnica-calculadora">
                    <div class="calc-header">
                        <h4>Configurar Técnica</h4>
                    </div>
                    
                    <div class="calc-controles">
                        <div class="pontos-controle">
                            <div class="controle-label">Pontos de Técnica:</div>
                            <div class="controle-valor">${pontosSelecionados}</div>
                            <div class="controle-botoes">
                                <button class="btn-controle menos" ${pontosSelecionados <= 2 ? 'disabled' : ''}
                                        onclick="window.mudarPontosTecnica(-1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <button class="btn-controle mais" ${pontosSelecionados >= maxPontos ? 'disabled' : ''}
                                        onclick="window.mudarPontosTecnica(1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="niveis-info">
                            <div class="niveis-display">
                                <span class="niveis-label">Níveis:</span>
                                <span class="niveis-valor">+${niveisSelecionados}</span>
                            </div>
                            <div class="nh-display">
                                <span class="nh-label">NH Final:</span>
                                <span class="nh-valor">${nhAtual}</span>
                            </div>
                        </div>
                        
                        <div class="custo-tabela">
                            <small>Técnica Difícil:</small>
                            <div class="tabela-itens">
                                <span class="tabela-item ${pontosSelecionados === 2 ? 'ativo' : ''}">2 pts = +1</span>
                                <span class="tabela-item ${pontosSelecionados === 3 ? 'ativo' : ''}">3 pts = +2</span>
                                <span class="tabela-item ${pontosSelecionados === 4 ? 'ativo' : ''}">4 pts = +3</span>
                                <span class="tabela-item ${pontosSelecionados === 5 ? 'ativo' : ''}">5 pts = +4</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tecnica-custo-total">
                    <div class="custo-label">Custo Total:</div>
                    <div class="custo-valor">${pontosSelecionados} pontos</div>
                    ${diferenca !== 0 ? `
                        <div class="custo-diferenca ${diferenca > 0 ? 'positivo' : 'negativo'}">
                            ${diferenca > 0 ? '+' : ''}${diferenca} ponto${Math.abs(diferenca) !== 1 ? 's' : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="modal-footer">
                <div class="modal-actions">
                    <button class="btn-modal btn-cancelar" onclick="window.fecharModalTecnica()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button class="btn-modal btn-confirmar" onclick="window.adquirirTecnica(${pontosSelecionados})"
                            ${diferenca === 0 ? 'disabled' : ''}>
                        <i class="fas fa-check"></i> ${textoBotaoPrincipal}
                    </button>
                </div>
            </div>
        `;
    }
    
    // Configurar funções globais do modal
    window.fecharModalTecnica = () => {
        modalOverlay.style.display = 'none';
        console.log("🎪 Modal fechado");
    };
    
    window.mudarPontosTecnica = (mudanca) => {
        const novo = pontosSelecionados + mudanca;
        
        // REGRAS FINAIS:
        // 1. MÍNIMO: 2 pontos (NUNCA menos que 2 para técnica difícil)
        // 2. MÁXIMO: maxPontos (depende do NH do Arco)
        
        if (novo >= 2 && novo <= maxPontos) {
            pontosSelecionados = novo;
            atualizarModal();
            console.log(`🎯 Pontos alterados: ${pontosSelecionados} → Níveis: ${calcularNiveisParaPontos(pontosSelecionados)}`);
        } else {
            console.log(`❌ Tentativa inválida: ${novo} pontos (deve estar entre 2 e ${maxPontos})`);
        }
    };
    
    window.adquirirTecnica = (pontos) => {
        if (pontos === pontosAtuais) {
            fecharModalTecnica();
            return;
        }
        
        const niveis = calcularNiveisParaPontos(pontos);
        const nhFinal = base + niveis;
        const diferenca = pontos - pontosAtuais;
        
        let mensagem = '';
        if (aprendida) {
            if (diferenca > 0) {
                mensagem = `Evoluir técnica em ${diferenca} ponto${diferenca !== 1 ? 's' : ''}?\n\n`;
            } else {
                mensagem = `Reduzir técnica em ${Math.abs(diferenca)} ponto${Math.abs(diferenca) !== 1 ? 's' : ''}?\n\n`;
            }
        } else {
            mensagem = `Adquirir técnica por ${pontos} pontos?\n\n`;
        }
        
        mensagem += `Níveis: +${niveis}\n`;
        mensagem += `NH Final: ${nhFinal}\n`;
        mensagem += `Total: ${pontos} pontos`;
        
        if (confirm(mensagem)) {
            const index = estadoTecnicas.aprendidas.findIndex(t => t.id === 'arquearia-montada');
            
            if (index >= 0) {
                // Atualizar existente
                if (pontos > 0) {
                    estadoTecnicas.aprendidas[index] = {
                        id: 'arquearia-montada',
                        nome: 'Arquearia Montada',
                        custoTotal: pontos,
                        dificuldade: 'Difícil'
                    };
                } else {
                    // Remover se zerou os pontos (não deve acontecer porque mínimo é 2)
                    estadoTecnicas.aprendidas.splice(index, 1);
                }
            } else if (pontos > 0) {
                // Adicionar nova
                estadoTecnicas.aprendidas.push({
                    id: 'arquearia-montada',
                    nome: 'Arquearia Montada',
                    custoTotal: pontos,
                    dificuldade: 'Difícil'
                });
            }
            
            localStorage.setItem('tecnicasAprendidas', JSON.stringify(estadoTecnicas.aprendidas));
            
            atualizarTodasTecnicas();
            fecharModalTecnica();
            
            showToastTecnica(`✅ Técnica ${aprendida ? 'atualizada' : 'adquirida'} com sucesso!`, 'success');
        }
    };
    
    // Mostrar modal
    atualizarModal();
    modalOverlay.style.display = 'flex';
    console.log("🎪 Modal aberto");
}

// Criar modal se não existir
function criarModalTecnica() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-tecnica-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-tecnica-content';
    modalContent.style.cssText = `
        background: linear-gradient(145deg, rgba(26, 18, 0, 0.95), rgba(44, 32, 8, 0.95));
        border: 3px solid var(--primary-gold);
        border-radius: 15px;
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        animation: modalSlideIn 0.4s ease;
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Fechar ao clicar fora
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            window.fecharModalTecnica();
        }
    });
    
    return modalOverlay;
}

// ===== 7. ATUALIZAR TUDO =====

function atualizarTodasTecnicas() {
    console.log("🔄 Atualizando todas as técnicas...");
    atualizarTecnicaNaTela();
    atualizarDisplayAprendidas();
}

// ===== 8. INICIALIZAÇÃO =====

function inicializarSistemaTecnicas() {
    console.log("🚀 Inicializando sistema de técnicas...");
    
    // Carregar técnicas salvas
    try {
        const salvo = localStorage.getItem('tecnicasAprendidas');
        if (salvo) {
            estadoTecnicas.aprendidas = JSON.parse(salvo);
            console.log(`📂 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s) do localStorage`);
        }
    } catch (e) {
        console.error("❌ Erro ao carregar técnicas:", e);
    }
    
    // Aguardar página carregar e atualizar
    setTimeout(() => {
        console.log("⏳ Atualizando interface...");
        atualizarTodasTecnicas();
        
        // Atualizar periodicamente (caso mude o Arco)
        setInterval(() => {
            atualizarTodasTecnicas();
        }, 5000);
    }, 1500);
}

// ===== 9. TOAST =====

function showToastTecnica(mensagem, tipo = 'info') {
    if (window.showToast) {
        window.showToast(mensagem, tipo);
    } else {
        // Fallback simples
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${tipo === 'error' ? '#8b0000' : tipo === 'success' ? '#2e5c3a' : '#2c2008'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 4px solid var(--primary-gold);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = mensagem;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// ===== 10. EXPORTAR FUNÇÕES =====

window.initTecnicas = inicializarSistemaTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.excluirTecnica = excluirTecnica;
window.atualizarTodasTecnicas = atualizarTodasTecnicas;

// Função de teste pública
window.testarCalculoTecnicas = () => {
    console.log("=== TESTE DE CÁLCULO 100% CORRETO ===");
    const nh = obterNHArcoReal();
    const calculo = calcularTecnica();
    console.log("📊 RESULTADOS CORRETOS:");
    console.log("- NH Arco:", nh);
    console.log("- Base (Arco-4):", calculo.base);
    console.log("- Pontos atuais:", calculo.pontos);
    console.log("- Níveis:", calculo.niveis);
    console.log("- NH atual:", calculo.atual);
    console.log("- Máximo (Arco):", calculo.max);
    
    // Testar conversões
    console.log("\n🧪 TESTE DE CONVERSÕES (TÉCNICA DIFÍCIL):");
    console.log("0 pontos → Níveis:", calcularNiveisParaPontos(0));
    console.log("1 ponto → Níveis:", calcularNiveisParaPontos(1));
    console.log("2 pontos → Níveis:", calcularNiveisParaPontos(2));
    console.log("3 pontos → Níveis:", calcularNiveisParaPontos(3));
    console.log("4 pontos → Níveis:", calcularNiveisParaPontos(4));
    console.log("5 pontos → Níveis:", calcularNiveisParaPontos(5));
    
    console.log("\n🧪 TESTE DE CONVERSÕES INVERSAS:");
    console.log("0 níveis → Pontos:", calcularPontosParaNiveis(0));
    console.log("1 nível → Pontos:", calcularPontosParaNiveis(1));
    console.log("2 níveis → Pontos:", calcularPontosParaNiveis(2));
    console.log("3 níveis → Pontos:", calcularPontosParaNiveis(3));
    console.log("4 níveis → Pontos:", calcularPontosParaNiveis(4));
    console.log("=== FIM TESTE ===");
};

// ===== 11. CARREGAMENTO =====

document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM carregado, iniciando sistema de técnicas...");
    
    // Verificar se estamos na aba de técnicas
    const checkTab = () => {
        const tecnicaTab = document.querySelector('[data-subtab="tecnicas"]');
        if (tecnicaTab && tecnicaTab.classList.contains('active')) {
            setTimeout(inicializarSistemaTecnicas, 500);
        }
    };
    
    // Verificar inicialmente
    checkTab();
    
    // Observar mudanças nas abas
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                checkTab();
            }
        });
    });
    
    // Observar botões de sub-aba
    const subTabButtons = document.querySelectorAll('.subtab-btn-pericias');
    subTabButtons.forEach(btn => {
        observer.observe(btn, { attributes: true });
    });
});

console.log("✅ SISTEMA DE TÉCNICAS - ADAPTADO E PRONTO!");