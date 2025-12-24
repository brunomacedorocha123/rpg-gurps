// caracteristicas-riqueza.js - VERSÃO COMPLETA E FUNCIONAL
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

// ============================================
// 3. FUNÇÃO PARA INJETAR CSS NECESSÁRIO
// ============================================
function injetarCSSRiqueza() {
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
        descricao: document.getElementById('descricaoRiqueza'),
        container: document.querySelector('.riqueza-container'),
        info: document.querySelector('.riqueza-info')
    };
    
    console.log("🔍 Buscando elementos da riqueza:");
    console.log("- Select:", elementosRiqueza.select ? "✅" : "❌");
    console.log("- Badge:", elementosRiqueza.badge ? "✅" : "❌");
    console.log("- Multiplicador:", elementosRiqueza.multiplicador ? "✅" : "❌");
    console.log("- Renda:", elementosRiqueza.renda ? "✅" : "❌");
    console.log("- Descrição:", elementosRiqueza.descricao ? "✅" : "❌");
    
    return elementosRiqueza.select && elementosRiqueza.badge;
}

// ============================================
// 5. FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
// ============================================
function atualizarRiqueza() {
    console.log("🔄 Atualizando sistema de riqueza...");
    
    const dados = DADOS_RIQUEZA[nivelAtualRiqueza];
    if (!dados) {
        console.error("❌ Dados não encontrados para nível:", nivelAtualRiqueza);
        return;
    }
    
    console.log("📊 Nível atual:", dados.nome);
    console.log("📊 Pontos:", dados.pontos);
    console.log("📊 Multiplicador:", dados.multiplicador);
    console.log("📊 Renda:", dados.renda);
    
    // 1. ATUALIZAR BADGE DE PONTOS
    if (elementosRiqueza.badge) {
        elementosRiqueza.badge.textContent = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
        
        // Aplicar classe de cor
        elementosRiqueza.badge.classList.remove('riqueza-positiva', 'riqueza-negativa', 'riqueza-neutra');
        
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
        
        console.log("✅ Badge atualizado:", elementosRiqueza.badge.textContent);
    }
    
    // 2. ATUALIZAR MULTIPLICADOR
    if (elementosRiqueza.multiplicador) {
        elementosRiqueza.multiplicador.textContent = dados.multiplicador + 'x';
        console.log("✅ Multiplicador atualizado:", elementosRiqueza.multiplicador.textContent);
    }
    
    // 3. ATUALIZAR RENDA MENSAL
    if (elementosRiqueza.renda) {
        elementosRiqueza.renda.textContent = dados.renda;
        console.log("✅ Renda atualizada:", elementosRiqueza.renda.textContent);
    }
    
    // 4. ATUALIZAR DESCRIÇÃO
    if (elementosRiqueza.descricao) {
        elementosRiqueza.descricao.textContent = dados.descricao;
        console.log("✅ Descrição atualizada");
    }
    
    // 5. ATUALIZAR SELECT (se necessário)
    if (elementosRiqueza.select && elementosRiqueza.select.value !== nivelAtualRiqueza) {
        elementosRiqueza.select.value = nivelAtualRiqueza;
    }
    
    // 6. SALVAR NO LOCALSTORAGE
    try {
        localStorage.setItem('gurps_riqueza_nivel', nivelAtualRiqueza);
        console.log("💾 Dados salvos no localStorage");
    } catch (e) {
        console.warn("⚠️ Não foi possível salvar no localStorage");
    }
    
    // 7. NOTIFICAR SISTEMAS EXTERNOS (se existirem)
    if (window.atualizarPontosCaracteristicas) {
        window.atualizarPontosCaracteristicas('riqueza', dados.pontos);
    }
    
    console.log("✅ Sistema de riqueza atualizado completamente!");
}

// ============================================
// 6. FUNÇÃO PARA CONFIGURAR EVENTOS
// ============================================
function configurarEventosRiqueza() {
    console.log("🔗 Configurando eventos da riqueza...");
    
    if (!elementosRiqueza.select) {
        console.error("❌ Select não encontrado para configurar eventos");
        return;
    }
    
    // Remover event listeners antigos (clone do elemento)
    const novoSelect = elementosRiqueza.select.cloneNode(true);
    elementosRiqueza.select.parentNode.replaceChild(novoSelect, elementosRiqueza.select);
    elementosRiqueza.select = novoSelect;
    
    // Adicionar novo event listener
    elementosRiqueza.select.addEventListener('change', function(e) {
        console.log("🎛️ Nível de riqueza alterado:", e.target.value);
        
        const novoValor = e.target.value;
        if (DADOS_RIQUEZA[novoValor]) {
            nivelAtualRiqueza = novoValor;
            atualizarRiqueza();
        } else {
            console.error("❌ Valor inválido:", novoValor);
        }
    });
    
    console.log("✅ Eventos configurados");
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
    console.log("🚀 INICIALIZANDO SISTEMA DE RIQUEZA...");
    
    // 1. Injetar CSS
    injetarCSSRiqueza();
    
    // 2. Encontrar elementos
    if (!encontrarElementosRiqueza()) {
        console.error("❌ Elementos essenciais não encontrados!");
        console.log("Tentando novamente em 500ms...");
        setTimeout(inicializarSistemaRiqueza, 500);
        return false;
    }
    
    // 3. Carregar dados salvos
    carregarDadosSalvos();
    
    // 4. Configurar eventos
    configurarEventosRiqueza();
    
    // 5. Atualizar display inicial
    atualizarRiqueza();
    
    sistemaInicializado = true;
    console.log("🎉 SISTEMA DE RIQUEZA INICIALIZADO COM SUCESSO!");
    
    return true;
}

// ============================================
// 9. SISTEMA DE DETECÇÃO DE TAB ATIVA
// ============================================
function verificarTabCaracteristicasAtiva() {
    const tab = document.getElementById('caracteristicas');
    if (tab && tab.classList.contains('active')) {
        console.log("📋 Tab características está ativa!");
        return true;
    }
    return false;
}

// Observador para quando a tab for ativada
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (verificarTabCaracteristicasAtiva() && !sistemaInicializado) {
                console.log("🎯 Tab características ativada, inicializando riqueza...");
                setTimeout(inicializarSistemaRiqueza, 100);
            }
        }
    });
});

// ============================================
// 10. INICIALIZAÇÃO AUTOMÁTICA
// ============================================
// Estratégia 1: Quando DOM carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log("📄 DOM completamente carregado");
    
    // Iniciar observador
    const tab = document.getElementById('caracteristicas');
    if (tab) {
        observer.observe(tab, { attributes: true });
        console.log("👁️ Observador configurado para tab características");
    }
    
    // Se já estiver na tab características, inicializar
    if (verificarTabCaracteristicasAtiva()) {
        console.log("🎯 Inicializando imediatamente (tab já ativa)");
        setTimeout(inicializarSistemaRiqueza, 300);
    }
});

// Estratégia 2: Quando clicar em qualquer tab
document.addEventListener('click', function(e) {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
        console.log("🎯 Tab características clicada!");
        if (!sistemaInicializado) {
            setTimeout(inicializarSistemaRiqueza, 200);
        }
    }
});

// Estratégia 3: Forçar inicialização após 3 segundos
setTimeout(function() {
    if (!sistemaInicializado) {
        console.log("⏰ Forçando inicialização após timeout...");
        inicializarSistemaRiqueza();
    }
}, 3000);

// ============================================
// 11. FUNÇÕES PÚBLICAS PARA USO EXTERNO
// ============================================
window.riquezaSystem = {
    // Reinicializar sistema
    reiniciar: function() {
        console.log("🔄 Reiniciando sistema de riqueza...");
        sistemaInicializado = false;
        return inicializarSistemaRiqueza();
    },
    
    // Obter dados atuais
    getDados: function() {
        return {
            nivel: nivelAtualRiqueza,
            dados: DADOS_RIQUEZA[nivelAtualRiqueza]
        };
    },
    
    // Definir nível manualmente
    setNivel: function(novoNivel) {
        if (DADOS_RIQUEZA[novoNivel]) {
            nivelAtualRiqueza = novoNivel;
            if (elementosRiqueza.select) {
                elementosRiqueza.select.value = novoNivel;
            }
            atualizarRiqueza();
            return true;
        }
        return false;
    },
    
    // Carregar dados externos
    carregarDados: function(dadosExternos) {
        if (dadosExternos && dadosExternos.nivel && DADOS_RIQUEZA[dadosExternos.nivel]) {
            return this.setNivel(dadosExternos.nivel);
        }
        return false;
    },
    
    // Resetar para padrão
    resetar: function() {
        return this.setNivel("0");
    },
    
    // Obter pontos atuais
    getPontos: function() {
        return DADOS_RIQUEZA[nivelAtualRiqueza]?.pontos || 0;
    },
    
    // Obter multiplicador atual
    getMultiplicador: function() {
        return DADOS_RIQUEZA[nivelAtualRiqueza]?.multiplicador || 1.0;
    },
    
    // Verificar status
    status: function() {
        return {
            inicializado: sistemaInicializado,
            nivel: nivelAtualRiqueza,
            elementos: !!elementosRiqueza.select
        };
    },
    
    // Debug
    debug: function() {
        console.group("🔧 DEBUG SISTEMA RIQUEZA");
        console.log("Status:", this.status());
        console.log("Dados atuais:", this.getDados());
        console.log("Elementos:", elementosRiqueza);
        console.log("LocalStorage:", localStorage.getItem('gurps_riqueza_nivel'));
        console.groupEnd();
    }
};

// ============================================
// 12. TESTE AUTOMÁTICO
// ============================================
console.log("🧪 SISTEMA DE RIQUEZA PRONTO PARA TESTE");
console.log("💡 Comandos disponíveis no console:");
console.log("- riquezaSystem.debug() - Ver status do sistema");
console.log("- riquezaSystem.reiniciar() - Reiniciar sistema");
console.log("- riquezaSystem.setNivel('10') - Mudar para Confortável");
console.log("- testarRiqueza() - Teste rápido");

// Função de teste rápido
window.testarRiqueza = function() {
    console.group("🧪 TESTE RÁPIDO DA RIQUEZA");
    
    // Verificar elementos
    const elementos = {
        select: document.getElementById('nivelRiqueza'),
        badge: document.getElementById('pontosRiqueza'),
        mult: document.getElementById('multiplicadorRiqueza'),
        renda: document.getElementById('rendaMensal')
    };
    
    console.log("Elementos encontrados:", elementos);
    
    // Testar mudança
    if (elementos.select) {
        console.log("Select atual:", elementos.select.value);
        
        // Testar mudança para '10'
        elementos.select.value = '10';
        elementos.select.dispatchEvent(new Event('change'));
        
        console.log("Select alterado para: 10");
        console.log("Badge deve mostrar: +10 pts");
        console.log("Multiplicador deve mostrar: 2x");
        console.log("Renda deve mostrar: $2.000");
    }
    
    console.groupEnd();
    return "Teste executado!";
};

console.log("✅ caracteristicas-riqueza.js CARREGADO COM SUCESSO");