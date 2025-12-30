// ============================================
// TECNICAS.JS - SISTEMA COMPLETO COM MONITORAMENTO EM TEMPO REAL
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

// ===== 2. TABELA DE CUSTOS =====
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

// ===== 4. SISTEMA DE MONITORAMENTO EM TEMPO REAL =====

/**
 * MONITOR DE MUTAÇÃO - Detecta mudanças nos cards de perícias
 */
class MonitorPericias {
    constructor() {
        this.observers = [];
        this.ultimoNHArco = 0;
        this.intervaloCheck = null;
    }
    
    iniciar() {
        console.log("👁️ Iniciando monitor de perícias...");
        
        // Observador de mutação para detectar mudanças na DOM
        this.configurarObserver();
        
        // Verificação periódica como fallback
        this.configurarIntervalo();
        
        // Verificação inicial
        this.verificarMudancas();
    }
    
    configurarObserver() {
        const container = document.getElementById('pericias-aprendidas');
        if (!container) {
            console.log("⚠️ Container de perícias não encontrado, usando fallback");
            return;
        }
        
        const observer = new MutationObserver((mutations) => {
            let mudou = false;
            
            for (const mutation of mutations) {
                if (mutation.type === 'childList' || mutation.type === 'characterData' || mutation.type === 'subtree') {
                    mudou = true;
                    break;
                }
            }
            
            if (mudou) {
                console.log("🔄 Mudança detectada na DOM das perícias");
                this.verificarMudancas();
            }
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true
        });
        
        console.log("✅ Observer configurado para monitorar perícias");
    }
    
    configurarIntervalo() {
        // Verificar a cada 2 segundos como fallback
        this.intervaloCheck = setInterval(() => {
            this.verificarMudancas();
        }, 2000);
    }
    
    verificarMudancas() {
        const nhAtual = this.extrairNHArcoDaDOM();
        
        if (nhAtual !== this.ultimoNHArco) {
            console.log(`🔄 NH do Arco mudou: ${this.ultimoNHArco} → ${nhAtual}`);
            this.ultimoNHArco = nhAtual;
            this.notificarObservers();
        }
    }
    
    extrairNHArcoDaDOM() {
        console.log("🔍 Extraindo NH do Arco da DOM...");
        
        // Estratégia 1: Buscar cards de perícia aprendida
        const container = document.getElementById('pericias-aprendidas');
        if (!container) {
            console.log("❌ Container não encontrado");
            return 0;
        }
        
        // Buscar todos os cards de perícia
        const cardsPericia = container.querySelectorAll('.pericia-aprendida-item, [class*="pericia"], [class*="skill"]');
        console.log(`📊 Encontrados ${cardsPericia.length} cards de perícia`);
        
        for (const card of cardsPericia) {
            // Verificar se é o card do Arco
            const textoCard = card.textContent || '';
            if (textoCard.toLowerCase().includes('arco')) {
                console.log("🎯 Card do Arco encontrado!");
                
                // Tentar extrair NH de várias formas
                const nh = this.extrairNHDoCard(card);
                if (nh > 0) {
                    console.log(`✅ NH extraído do card: ${nh}`);
                    return nh;
                }
            }
        }
        
        // Estratégia 2: Buscar em spans e divs específicas
        const elementosTexto = container.querySelectorAll('span, div, p, strong, em');
        for (const elemento of elementosTexto) {
            const texto = elemento.textContent || '';
            if (texto.toLowerCase().includes('arco')) {
                console.log("📝 Texto 'Arco' encontrado:", texto.substring(0, 50));
                
                // Procurar número próximo (NH)
                const parent = elemento.parentElement;
                const nh = this.procurarNumeroProximo(parent || elemento);
                if (nh > 0) {
                    console.log(`✅ NH encontrado próximo ao texto: ${nh}`);
                    return nh;
                }
            }
        }
        
        console.log("❌ NH do Arco não encontrado na DOM");
        return 0;
    }
    
    extrairNHDoCard(card) {
        // Padrões comuns de exibição de NH
        const seletores = [
            '.nivel-display',
            '.nh-valor',
            '.nivel-valor',
            '.valor',
            '.pericia-nivel',
            '.skill-level',
            '[class*="nivel"]',
            '[class*="level"]',
            'strong',
            'b'
        ];
        
        for (const seletor of seletores) {
            const elementos = card.querySelectorAll(seletor);
            for (const el of elementos) {
                const texto = el.textContent || '';
                const match = texto.match(/\d+/);
                if (match) {
                    const numero = parseInt(match[0]);
                    if (!isNaN(numero) && numero > 0 && numero < 100) { // NH válido
                        return numero;
                    }
                }
            }
        }
        
        // Se não encontrar com seletores, buscar no texto do card
        const textoCard = card.textContent || '';
        return this.extrairNumeroDoTexto(textoCard);
    }
    
    procurarNumeroProximo(elemento, profundidade = 3) {
        if (profundidade <= 0 || !elemento) return 0;
        
        // Verificar no elemento atual
        const numero = this.extrairNumeroDoTexto(elemento.textContent || '');
        if (numero > 0) return numero;
        
        // Verificar nos irmãos
        if (elemento.previousElementSibling) {
            const numAntes = this.extrairNumeroDoTexto(elemento.previousElementSibling.textContent || '');
            if (numAntes > 0) return numAntes;
        }
        
        if (elemento.nextElementSibling) {
            const numDepois = this.extrairNumeroDoTexto(elemento.nextElementSibling.textContent || '');
            if (numDepois > 0) return numDepois;
        }
        
        // Verificar nos filhos
        const filhos = elemento.children;
        for (const filho of filhos) {
            const numFilho = this.procurarNumeroProximo(filho, profundidade - 1);
            if (numFilho > 0) return numFilho;
        }
        
        return 0;
    }
    
    extrairNumeroDoTexto(texto) {
        // Procurar padrões comuns de NH
        const padroes = [
            /NH\s*[:\-]?\s*(\d+)/i,
            /Nível\s*[:\-]?\s*(\d+)/i,
            /Level\s*[:\-]?\s*(\d+)/i,
            /(\d+)\s*(?:NH|nível|level)/i,
            /Arco\s*[\(]?\s*(\d+)/i,
            /\((\d+)\)/ // Número entre parênteses
        ];
        
        for (const padrao of padroes) {
            const match = texto.match(padrao);
            if (match) {
                const numero = parseInt(match[1]);
                if (!isNaN(numero) && numero > 0 && numero < 100) {
                    return numero;
                }
            }
        }
        
        // Último recurso: pegar o primeiro número que pareça ser um NH
        const numeros = texto.match(/\b\d{1,2}\b/g);
        if (numeros) {
            for (const numStr of numeros) {
                const num = parseInt(numStr);
                if (num >= 8 && num <= 20) { // Faixa típica de NH
                    return num;
                }
            }
        }
        
        return 0;
    }
    
    adicionarObserver(callback) {
        this.observers.push(callback);
    }
    
    notificarObservers() {
        console.log(`📢 Notificando ${this.observers.length} observadores sobre mudança no NH`);
        for (const observer of this.observers) {
            try {
                observer(this.ultimoNHArco);
            } catch (e) {
                console.error("Erro ao notificar observer:", e);
            }
        }
    }
    
    getNHArco() {
        return this.ultimoNHArco || this.extrairNHArcoDaDOM();
    }
    
    parar() {
        if (this.intervaloCheck) {
            clearInterval(this.intervaloCheck);
            this.intervaloCheck = null;
        }
    }
}

// ===== 5. INSTÂNCIA GLOBAL DO MONITOR =====
const monitorPericias = new MonitorPericias();

// ===== 6. FUNÇÕES DE BUSCA INTELIGENTE =====

function buscarNHArco() {
    console.log("🎯 BUSCANDO NH DO ARCO (sistema completo)...");
    
    // Primeiro usar o monitor em tempo real
    const nhMonitor = monitorPericias.getNHArco();
    if (nhMonitor > 0) {
        console.log(`✅ NH do Arco do monitor: ${nhMonitor}`);
        return nhMonitor;
    }
    
    // Fallback 1: Buscar no sistema de perícias
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        for (const pericia of pericias) {
            if (pericia && (pericia.nome || '').toLowerCase().includes('arco')) {
                const nivel = pericia.nivel || pericia.NH || 0;
                if (nivel > 0) {
                    console.log(`✅ NH do Arco do estadoPericias: ${nivel}`);
                    return nivel;
                }
            }
        }
    }
    
    // Fallback 2: Buscar no localStorage
    try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
            const parsed = JSON.parse(dados);
            if (parsed.periciasAprendidas) {
                for (const pericia of parsed.periciasAprendidas) {
                    if (pericia && (pericia.nome || '').toLowerCase().includes('arco')) {
                        const nivel = pericia.nivel || pericia.NH || 0;
                        if (nivel > 0) {
                            console.log(`✅ NH do Arco do localStorage: ${nivel}`);
                            return nivel;
                        }
                    }
                }
            }
        }
    } catch (e) {
        // Ignorar erro
    }
    
    // Fallback 3: Valor padrão
    console.log("⚠️ NH do Arco não encontrado, usando default 12");
    return 12;
}

function verificarCavalgar() {
    console.log("🎯 VERIFICANDO CAVALGAR...");
    
    // Usar o monitor para buscar na DOM
    const container = document.getElementById('pericias-aprendidas');
    if (container) {
        const texto = container.textContent || '';
        if (texto.toLowerCase().includes('cavalgar')) {
            console.log("✅ Cavalgar encontrado na DOM");
            return true;
        }
    }
    
    // Fallback para sistemas
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
        const pericias = window.estadoPericias.periciasAprendidas;
        for (const pericia of pericias) {
            if (pericia && (pericia.nome || '').toLowerCase().includes('cavalgar')) {
                console.log("✅ Cavalgar encontrado em estadoPericias");
                return true;
            }
        }
    }
    
    console.log("❌ Cavalgar não encontrado");
    return false;
}

function verificarPrereqTecnica(tecnica) {
    const arco = buscarNHArco();
    const cavalgar = verificarCavalgar();
    
    const resultado = {
        arco: { tem: arco > 0, nivel: arco },
        cavalgar: { tem: cavalgar },
        todosCumpridos: arco > 0 && cavalgar
    };
    
    console.log("📋 Pré-requisitos:", resultado);
    return resultado;
}

// ===== 7. FUNÇÕES DE CÁLCULO E RENDERIZAÇÃO =====

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

function renderizarCatalogoTecnicas() {
    const container = document.getElementById('lista-tecnicas');
    if (!container) return;
    
    container.innerHTML = '';
    
    CATALOGO_TECNICAS.forEach(tecnica => {
        const jaAprendida = tecnicasAprendidas.find(t => t.id === tecnica.id);
        const prereq = verificarPrereqTecnica(tecnica);
        const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
        
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

// ===== 8. SISTEMA DE MODAL COMPLETO =====

function abrirModalTecnica(id) {
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const jaAprendida = tecnicasAprendidas.find(t => t.id === id);
    const prereq = verificarPrereqTecnica(tecnica);
    
    const niveisIniciais = jaAprendida ? jaAprendida.niveis : 1;
    const pontosIniciais = jaAprendida ? jaAprendida.pontos : 2;
    const nhArco = buscarNHArco();
    const nhInicial = Math.min(nhArco + tecnica.modificadorBase + niveisIniciais, nhArco);
    
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
    
    const modal = document.getElementById('modal-tecnica');
    if (modal) {
        modal.innerHTML = modalHTML;
    }
    
    const overlay = document.getElementById('modal-tecnica-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
    
    tecnicaSelecionada = {
        id: id,
        pontos: pontosIniciais,
        niveis: niveisIniciais,
        nhArco: nhArco,
        modificador: tecnica.modificadorBase
    };
    
    if (prereq.todosCumpridos) {
        setTimeout(() => {
            document.querySelectorAll('.opcao-pontos').forEach(opcao => {
                opcao.addEventListener('click', function() {
                    const pontos = parseInt(this.dataset.pontos);
                    const niveis = parseInt(this.dataset.niveis);
                    
                    document.querySelectorAll('.opcao-pontos').forEach(o => {
                        o.classList.remove('selecionado');
                    });
                    
                    this.classList.add('selecionado');
                    
                    tecnicaSelecionada.pontos = pontos;
                    tecnicaSelecionada.niveis = niveis;
                    
                    const nhCalculado = Math.min(
                        nhArco + tecnica.modificadorBase + niveis,
                        nhArco
                    );
                    
                    const elementos = {
                        'nh-niveis-display': `+${niveis}`,
                        'nh-total-display': nhCalculado,
                        'resumo-pontos': pontos,
                        'resumo-niveis': `+${niveis}`,
                        'resumo-nh': nhCalculado,
                        'modal-custo-total-tecnica': pontos
                    };
                    
                    for (const [id, valor] of Object.entries(elementos)) {
                        const el = document.getElementById(id);
                        if (el) el.textContent = valor;
                    }
                });
            });
        }, 100);
    }
}

function confirmarTecnica(id) {
    if (!tecnicaSelecionada) {
        alert('Por favor, selecione uma opção de níveis primeiro!');
        return;
    }
    
    const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
    if (!tecnica) return;
    
    const { pontos, niveis } = tecnicaSelecionada;
    const prereq = verificarPrereqTecnica(tecnica);
    
    if (!prereq.todosCumpridos) {
        alert('Pré-requisitos não cumpridos!');
        return;
    }
    
    const nhArco = buscarNHArco();
    const nhFinal = Math.min(nhArco + tecnica.modificadorBase + niveis, nhArco);
    
    const confirmacao = confirm(
        `Deseja ${tecnicasAprendidas.find(t => t.id === id) ? 'atualizar' : 'adquirir'} ${tecnica.nome}?\n\n` +
        `• Pontos gastos: ${pontos}\n` +
        `• Níveis: +${niveis}\n` +
        `• NH final: ${nhFinal}`
    );
    
    if (!confirmacao) return;
    
    const indexExistente = tecnicasAprendidas.findIndex(t => t.id === id);
    
    if (indexExistente >= 0) {
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
    
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(tecnicasAprendidas));
    localStorage.setItem('pontos_tecnicas', pontosTecnicas.toString());
    
    fecharModalTecnica();
    renderizarTodasTecnicas();
    
    alert(`${tecnica.nome} ${indexExistente >= 0 ? 'atualizada' : 'adquirida'} com sucesso!`);
}

// ===== 9. FUNÇÕES AUXILIARES =====

function editarTecnica(id) {
    abrirModalTecnica(id);
}

function removerTecnica(id) {
    const tecnica = tecnicasAprendidas.find(t => t.id === id);
    if (!tecnica) return;
    
    if (!confirm(`Tem certeza que deseja remover ${tecnica.nome}?`)) return;
    
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

function atualizarEstatisticasTecnicas() {
    const totalElement = document.getElementById('total-tecnicas');
    const pontosElement = document.getElementById('pontos-tecnicas');
    const pontosAprendidasElement = document.getElementById('pontos-tecnicas-aprendidas');
    
    if (totalElement) totalElement.textContent = tecnicasAprendidas.length;
    if (pontosElement) pontosElement.textContent = pontosTecnicas;
    if (pontosAprendidasElement) pontosAprendidasElement.textContent = `${pontosTecnicas} pts`;
}

function renderizarTodasTecnicas() {
    renderizarCatalogoTecnicas();
    renderizarTecnicasAprendidas();
    atualizarEstatisticasTecnicas();
}

// ===== 10. INICIALIZAÇÃO COMPLETA =====

function inicializarSistemaTecnicas() {
    console.log("🚀 INICIALIZANDO SISTEMA DE TÉCNICAS...");
    
    // Carregar dados
    try {
        const dadosTecnicas = localStorage.getItem('tecnicas_aprendidas');
        if (dadosTecnicas) {
            tecnicasAprendidas = JSON.parse(dadosTecnicas);
            console.log(`📁 ${tecnicasAprendidas.length} técnicas carregadas`);
        }
        
        const dadosPontos = localStorage.getItem('pontos_tecnicas');
        if (dadosPontos) {
            pontosTecnicas = parseInt(dadosPontos);
            console.log(`📁 ${pontosTecnicas} pontos totais`);
        }
    } catch (e) {
        console.error("Erro ao carregar técnicas:", e);
    }
    
    // Configurar botão de atualizar
    const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', () => {
            console.log("🔄 Atualizando manualmente...");
            renderizarTodasTecnicas();
        });
    }
    
    // Iniciar monitor de perícias
    monitorPericias.iniciar();
    
    // Configurar observer para atualizar técnicas quando NH mudar
    monitorPericias.adicionarObserver((novoNH) => {
        console.log(`🔄 NH do Arco mudou para ${novoNH}, atualizando técnicas...`);
        renderizarTodasTecnicas();
    });
    
    // Renderizar inicial
    renderizarTodasTecnicas();
    
    console.log("✅ Sistema de técnicas inicializado com monitoramento em tempo real!");
}

// ===== 11. EVENTOS E EXPORTAÇÃO =====

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.subtab === 'tecnicas') {
                setTimeout(inicializarSistemaTecnicas, 100);
            }
        });
    });
    
    const abaTecnicas = document.getElementById('subtab-tecnicas');
    if (abaTecnicas && abaTecnicas.classList.contains('active')) {
        setTimeout(inicializarSistemaTecnicas, 200);
    }
});

// Exportar funções para uso global
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.inicializarSistemaTecnicas = inicializarSistemaTecnicas;

console.log("✅ TECNICAS.JS COMPLETO CARREGADO - COM MONITORAMENTO EM TEMPO REAL!");