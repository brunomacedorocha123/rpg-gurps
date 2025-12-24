// caracteristicas-riqueza.js - VERSÃO CORRIGIDA
console.log("💰 SISTEMA DE RIQUEZA - CARREGANDO...");

// ============================================
// 1. DADOS COMPLETOS DOS NÍVEIS DE RIQUEZA
// ============================================
const DADOS_RIQUEZA = {
    "-25": {
        nome: "Falido",
        pontos: -25,
        multiplicador: 0.1,
        renda: "$50",
        descricao: "Você não possui praticamente nada. Vive de ajuda alheia ou da caridade pública. Necessita de assistência para sobreviver."
    },
    "-15": {
        nome: "Pobre",
        pontos: -15,
        multiplicador: 0.3,
        renda: "$300",
        descricao: "Possui apenas o essencial para sobreviver. Trabalha muito para ganhar pouco. Qualquer despesa inesperada é um problema sério."
    },
    "-10": {
        nome: "Batalhador",
        pontos: -10,
        multiplicador: 0.5,
        renda: "$500",
        descricao: "Consegue pagar suas contas, mas sem sobras. Precisa trabalhar constantemente. Pode economizar pouco, se muito."
    },
    "0": {
        nome: "Médio",
        pontos: 0,
        multiplicador: 1.0,
        renda: "$1.000",
        descricao: "Possui uma vida confortável, com casa própria e capacidade de poupar um pouco. Pode comprar alguns luxos ocasionais."
    },
    "10": {
        nome: "Confortável",
        pontos: 10,
        multiplicador: 2.0,
        renda: "$2.000",
        descricao: "Vive bem, pode se dar ao luxo de pequenos prazeres e tem economias. Não se preocupa com contas básicas."
    },
    "20": {
        nome: "Rico",
        pontos: 20,
        multiplicador: 5.0,
        renda: "$5.000",
        descricao: "Possui propriedades, investimentos e uma vida de luxo moderado. Pode viajar e comprar bens de valor considerável."
    },
    "30": {
        nome: "Muito Rico",
        pontos: 30,
        multiplicador: 10.0,
        renda: "$10.000",
        descricao: "Parte da elite econômica. Tem influência política e social. Pode sustentar um estilo de vida extravagante."
    },
    "50": {
        nome: "Podre de Rico",
        pontos: 50,
        multiplicador: 20.0,
        renda: "$20.000",
        descricao: "Fortuna colossal. Pode comprar praticamente qualquer coisa que desejar. Dinheiro não é mais uma preocupação."
    }
};

// ============================================
// 2. VARIÁVEIS GLOBAIS DO SISTEMA
// ============================================
let nivelAtualRiqueza = "0";
let elementosRiqueza = {};
let sistemaInicializado = false;
let eventListenerAdicionado = false; // CONTROLE DE EVENT LISTENER

// ============================================
// 3. FUNÇÃO PARA INJETAR CSS NECESSÁRIO
// ============================================
function injetarCSSRiqueza() {
    // Verificar se o CSS já foi injetado
    if (document.getElementById('css-riqueza')) {
        return;
    }
    
    const css = `
        /* ESTILOS ESPECÍFICOS PARA RIQUEZA */
        #pontosRiqueza.riqueza-positiva {
            background: linear-gradient(135deg, #2ecc71, #27ae60) !important;
            border-color: #27ae60 !important;
            color: white !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        #pontosRiqueza.riqueza-negativa {
            background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
            border-color: #c0392b !important;
            color: white !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        #pontosRiqueza.riqueza-neutra {
            background: linear-gradient(135deg, #95a5a6, #7f8c8d) !important;
            border-color: #7f8c8d !important;
            color: white !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }
        
        .riqueza-destaque {
            animation: destaque-riqueza 0.6s ease;
        }
        
        @keyframes destaque-riqueza {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
            50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(212, 175, 55, 0); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        
        #multiplicadorRiqueza {
            color: #f4d03f !important;
            font-weight: bold !important;
            font-size: 1.3rem !important;
        }
        
        #rendaMensal {
            color: #2ecc71 !important;
            font-weight: bold !important;
            font-size: 1.3rem !important;
        }
    `;
    
    const style = document.createElement('style');
    style.id = 'css-riqueza';
    style.textContent = css;
    document.head.appendChild(style);
    console.log("🎨 CSS da riqueza injetado");
}

// ============================================
// 4. FUNÇÃO PARA ENCONTRAR ELEMENTOS
// ============================================
function encontrarElementosRiqueza() {
    elementosRiqueza = {
        select: document.getElementById('nivelRiqueza'),
        badge: document.getElementById('pontosRiqueza'),
        multiplicador: document.getElementById('multiplicadorRiqueza'),
        renda: document.getElementById('rendaMensal'),
        descricao: document.getElementById('descricaoRiqueza')
    };
    
    console.log("🔍 Elementos encontrados:", {
        select: elementosRiqueza.select ? "✅" : "❌",
        badge: elementosRiqueza.badge ? "✅" : "❌",
        multiplicador: elementosRiqueza.multiplicador ? "✅" : "❌",
        renda: elementosRiqueza.renda ? "✅" : "❌",
        descricao: elementosRiqueza.descricao ? "✅" : "❌"
    });
    
    return elementosRiqueza.select && elementosRiqueza.badge;
}

// ============================================
// 5. FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
// ============================================
function atualizarRiqueza() {
    console.log("🔄 Atualizando riqueza para nível:", nivelAtualRiqueza);
    
    const dados = DADOS_RIQUEZA[nivelAtualRiqueza];
    if (!dados) {
        console.error("❌ Dados não encontrados para nível:", nivelAtualRiqueza);
        return;
    }
    
    // 1. ATUALIZAR BADGE DE PONTOS
    if (elementosRiqueza.badge) {
        elementosRiqueza.badge.textContent = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
        
        // Aplicar classe de cor
        elementosRiqueza.badge.className = 'pontos-badge'; // Reset classes
        if (dados.pontos > 0) {
            elementosRiqueza.badge.classList.add('riqueza-positiva');
        } else if (dados.pontos < 0) {
            elementosRiqueza.badge.classList.add('riqueza-negativa');
        } else {
            elementosRiqueza.badge.classList.add('riqueza-neutra');
        }
        
        // Efeito visual
        elementosRiqueza.badge.classList.add('riqueza-destaque');
        setTimeout(() => {
            elementosRiqueza.badge.classList.remove('riqueza-destaque');
        }, 600);
    }
    
    // 2. ATUALIZAR MULTIPLICADOR
    if (elementosRiqueza.multiplicador) {
        elementosRiqueza.multiplicador.textContent = dados.multiplicador + 'x';
    }
    
    // 3. ATUALIZAR RENDA MENSAL
    if (elementosRiqueza.renda) {
        elementosRiqueza.renda.textContent = dados.renda;
    }
    
    // 4. ATUALIZAR DESCRIÇÃO
    if (elementosRiqueza.descricao) {
        elementosRiqueza.descricao.textContent = dados.descricao;
    }
    
    // 5. ATUALIZAR SELECT (se necessário)
    if (elementosRiqueza.select && elementosRiqueza.select.value !== nivelAtualRiqueza) {
        elementosRiqueza.select.value = nivelAtualRiqueza;
    }
    
    // 6. SALVAR NO LOCALSTORAGE
    try {
        localStorage.setItem('gurps_riqueza_nivel', nivelAtualRiqueza);
    } catch (e) {
        console.warn("⚠️ Não foi possível salvar no localStorage");
    }
    
    console.log("✅ Riqueza atualizada:", dados.nome, dados.pontos, "pts");
}

// ============================================
// 6. FUNÇÃO PARA CONFIGURAR EVENTOS (CORRIGIDA)
// ============================================
function configurarEventosRiqueza() {
    console.log("🔗 Configurando eventos da riqueza...");
    
    if (!elementosRiqueza.select) {
        console.error("❌ Select não encontrado para configurar eventos");
        return;
    }
    
    // REMOVER TODOS OS EVENT LISTENERS ANTIGOS
    if (eventListenerAdicionado) {
        console.log("⚠️ Removendo event listener antigo...");
        const novoSelect = elementosRiqueza.select.cloneNode(true);
        elementosRiqueza.select.parentNode.replaceChild(novoSelect, elementosRiqueza.select);
        elementosRiqueza.select = novoSelect;
        eventListenerAdicionado = false;
    }
    
    // ADICIONAR NOVO EVENT LISTENER (APENAS UM)
    elementosRiqueza.select.addEventListener('change', function(e) {
        console.log("🎛️ Evento change disparado! Valor:", e.target.value);
        
        const novoValor = e.target.value;
        if (DADOS_RIQUEZA[novoValor]) {
            nivelAtualRiqueza = novoValor;
            atualizarRiqueza();
        } else {
            console.error("❌ Valor inválido:", novoValor);
        }
    }, { once: false }); // Importante: once: false para não remover após primeira execução
    
    eventListenerAdicionado = true;
    console.log("✅ Event listener configurado (apenas um)");
}

// ============================================
// 7. FUNÇÃO PARA CARREGAR DADOS SALVOS
// ============================================
function carregarDadosSalvos() {
    console.log("📂 Carregando dados salvos...");
    
    try {
        const salvo = localStorage.getItem('gurps_riqueza_nivel');
        if (salvo && DADOS_RIQUEZA[salvo]) {
            nivelAtualRiqueza = salvo;
            console.log("✅ Dados carregados:", salvo);
            return true;
        }
    } catch (e) {
        console.warn("⚠️ Erro ao carregar dados salvos:", e);
    }
    
    console.log("📂 Usando valor padrão:", nivelAtualRiqueza);
    return false;
}

// ============================================
// 8. FUNÇÃO DE INICIALIZAÇÃO PRINCIPAL
// ============================================
function inicializarSistemaRiqueza() {
    console.log("=".repeat(50));
    console.log("🚀 INICIALIZANDO SISTEMA DE RIQUEZA");
    console.log("=".repeat(50));
    
    // Evitar múltiplas inicializações
    if (sistemaInicializado) {
        console.log("⚠️ Sistema já inicializado, pulando...");
        return true;
    }
    
    // 1. Injetar CSS (apenas uma vez)
    injetarCSSRiqueza();
    
    // 2. Encontrar elementos
    if (!encontrarElementosRiqueza()) {
        console.error("❌ Elementos essenciais não encontrados!");
        return false;
    }
    
    // 3. Carregar dados salvos
    carregarDadosSalvos();
    
    // 4. Configurar eventos (apenas uma vez)
    configurarEventosRiqueza();
    
    // 5. Atualizar display inicial
    atualizarRiqueza();
    
    sistemaInicializado = true;
    console.log("=".repeat(50));
    console.log("🎉 SISTEMA DE RIQUEZA INICIALIZADO COM SUCESSO!");
    console.log("Nível atual:", nivelAtualRiqueza);
    console.log("=".repeat(50));
    
    return true;
}

// ============================================
// 9. DETECÇÃO SIMPLES DE TAB ATIVA
// ============================================
function verificarEInicializar() {
    // Verificar se estamos na tab características
    const tabCaracteristicas = document.getElementById('caracteristicas');
    const tabAtiva = tabCaracteristicas && tabCaracteristicas.classList.contains('active');
    
    // Verificar se os elementos existem
    const selectExiste = !!document.getElementById('nivelRiqueza');
    const badgeExiste = !!document.getElementById('pontosRiqueza');
    
    if (tabAtiva && selectExiste && badgeExiste && !sistemaInicializado) {
        console.log("🎯 Condições perfeitas para inicializar riqueza!");
        inicializarSistemaRiqueza();
        return true;
    }
    
    return false;
}

// ============================================
// 10. INICIALIZAÇÃO SIMPLES E DIRETA
// ============================================
// Estratégia principal: Inicializar quando DOM carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM carregado, tentando inicializar riqueza...");
    
    // Tentar imediatamente
    setTimeout(function() {
        if (!verificarEInicializar()) {
            console.log("⏳ Aguardando condições para inicializar...");
            
            // Tentar novamente a cada 500ms por 5 segundos
            let tentativas = 0;
            const interval = setInterval(function() {
                tentativas++;
                console.log(`🔄 Tentativa ${tentativas} de inicialização...`);
                
                if (verificarEInicializar() || tentativas >= 10) {
                    clearInterval(interval);
                    if (tentativas >= 10) {
                        console.error("❌ Não foi possível inicializar após 10 tentativas");
                    }
                }
            }, 500);
        }
    }, 300);
});

// ============================================
// 11. CAPTURAR CLIQUE NAS TABS
// ============================================
document.addEventListener('click', function(e) {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
        console.log("🎯 Tab características clicada!");
        setTimeout(function() {
            if (!sistemaInicializado) {
                verificarEInicializar();
            }
        }, 100);
    }
});

// ============================================
// 12. FUNÇÕES PÚBLICAS SIMPLIFICADAS
// ============================================
window.riquezaSystem = {
    // Atualizar manualmente
    atualizar: function() {
        if (!sistemaInicializado) {
            console.log("⚠️ Sistema não inicializado, inicializando agora...");
            inicializarSistemaRiqueza();
        }
        atualizarRiqueza();
    },
    
    // Mudar nível manualmente (SEM USAR EVENTO)
    mudarNivel: function(novoNivel) {
        console.log("🎯 Mudando nível manualmente para:", novoNivel);
        
        if (DADOS_RIQUEZA[novoNivel]) {
            nivelAtualRiqueza = novoNivel;
            
            // Atualizar select diretamente
            if (elementosRiqueza.select) {
                elementosRiqueza.select.value = novoNivel;
            }
            
            // Atualizar display
            atualizarRiqueza();
            return true;
        }
        
        console.error("❌ Nível inválido:", novoNivel);
        return false;
    },
    
    // Obter dados atuais
    getDados: function() {
        return DADOS_RIQUEZA[nivelAtualRiqueza];
    },
    
    // Debug
    debug: function() {
        console.group("🔧 DEBUG RIQUEZA");
        console.log("Inicializado:", sistemaInicializado);
        console.log("Nível atual:", nivelAtualRiqueza);
        console.log("Dados:", DADOS_RIQUEZA[nivelAtualRiqueza]);
        console.log("Event listener:", eventListenerAdicionado);
        console.log("Select atual:", elementosRiqueza.select?.value);
        console.groupEnd();
    }
};

// ============================================
// 13. TESTE MANUAL DIRETO
// ============================================
window.testarRiquezaCompleto = function() {
    console.group("🧪 TESTE COMPLETO DA RIQUEZA");
    
    // 1. Verificar elementos
    const select = document.getElementById('nivelRiqueza');
    const badge = document.getElementById('pontosRiqueza');
    
    console.log("1. Elementos:", {
        select: select ? `✅ (valor: ${select.value})` : "❌",
        badge: badge ? `✅ (texto: ${badge.textContent})` : "❌"
    });
    
    if (!select || !badge) {
        console.error("❌ Elementos não encontrados!");
        console.groupEnd();
        return false;
    }
    
    // 2. Testar cada valor manualmente
    const niveisParaTestar = ["-25", "-15", "-10", "0", "10", "20", "30", "50"];
    
    console.log("2. Testando todos os níveis:");
    
    niveisParaTestar.forEach((nivel, index) => {
        setTimeout(() => {
            console.log(`   Teste ${index + 1}: Nível ${nivel}`);
            
            // Mudar valor diretamente
            select.value = nivel;
            
            // Disparar evento manualmente
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
            
            // Verificar resultado
            setTimeout(() => {
                const dados = DADOS_RIQUEZA[nivel];
                const pontosEsperados = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
                const multiplicadorEsperado = dados.multiplicador + 'x';
                
                console.log(`   → Esperado: ${pontosEsperados}, ${multiplicadorEsperado}, ${dados.renda}`);
                console.log(`   → Badge: ${badge.textContent}`);
                
                if (badge.textContent === pontosEsperados) {
                    console.log(`   ✅ OK!`);
                } else {
                    console.log(`   ❌ FALHOU!`);
                }
                
                if (index === niveisParaTestar.length - 1) {
                    console.log("✅ Todos os testes concluídos!");
                    console.groupEnd();
                }
            }, 100);
        }, index * 500);
    });
    
    return true;
};

// ============================================
// 14. FALLBACK DIRETO (SEMPRE FUNCIONA)
// ============================================
// Esta função SEMPRE funciona, independente de tudo
function setupRiquezaDireto() {
    console.log("⚡ CONFIGURAÇÃO DIRETA DA RIQUEZA");
    
    const select = document.getElementById('nivelRiqueza');
    const badge = document.getElementById('pontosRiqueza');
    const mult = document.getElementById('multiplicadorRiqueza');
    const renda = document.getElementById('rendaMensal');
    const desc = document.getElementById('descricaoRiqueza');
    
    if (!select || !badge) {
        console.error("❌ Elementos não encontrados para setup direto");
        return false;
    }
    
    // Configurar evento DIRETAMENTE
    select.onchange = function() {
        const valor = this.value;
        const dados = DADOS_RIQUEZA[valor];
        
        if (!dados) return;
        
        console.log("🎛️ Setup direto: Mudando para", valor);
        
        // Atualizar tudo diretamente
        badge.textContent = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
        
        // Cor do badge
        badge.style.backgroundColor = dados.pontos > 0 ? '#27ae60' : 
                                     dados.pontos < 0 ? '#c0392b' : '#7f8c8d';
        badge.style.color = 'white';
        badge.style.fontWeight = 'bold';
        
        if (mult) mult.textContent = dados.multiplicador + 'x';
        if (renda) renda.textContent = dados.renda;
        if (desc) desc.textContent = dados.descricao;
        
        // Salvar
        localStorage.setItem('gurps_riqueza_direto', valor);
    };
    
    // Carregar valor salvo
    const salvo = localStorage.getItem('gurps_riqueza_direto') || '0';
    if (DADOS_RIQUEZA[salvo]) {
        select.value = salvo;
        select.onchange(); // Disparar para atualizar
    }
    
    console.log("✅ Setup direto configurado!");
    return true;
}

// Configurar setup direto após 1 segundo
setTimeout(setupRiquezaDireto, 1000);

// ============================================
// 15. MENSAGEM FINAL
// ============================================
console.log("✅ Sistema de riqueza carregado!");
console.log("💡 Comandos disponíveis:");
console.log("1. riquezaSystem.mudarNivel('20') - Mudar para Rico");
console.log("2. riquezaSystem.atualizar() - Forçar atualização");
console.log("3. riquezaSystem.debug() - Ver status");
console.log("4. testarRiquezaCompleto() - Testar todos os níveis");