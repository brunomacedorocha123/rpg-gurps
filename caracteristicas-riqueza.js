// caracteristicas-riqueza.js - MÉTODO DIRETO
console.log("💰 INJETANDO SISTEMA DE RIQUEZA DIRETAMENTE");

// ==================== 1. LIMPAR TUDO ====================
localStorage.clear();
console.log("🧹 localStorage limpo!");

// ==================== 2. DADOS ====================
const DADOS = {
    "-25": { pontos: -25, mult: "0.1x", renda: "$50", desc: "Falido - Não possui nada" },
    "-15": { pontos: -15, mult: "0.3x", renda: "$300", desc: "Pobre - Apenas o essencial" },
    "-10": { pontos: -10, mult: "0.5x", renda: "$500", desc: "Batalhador - Contas pagas sem sobras" },
    "0": { pontos: 0, mult: "1x", renda: "$1.000", desc: "Médio - Vida confortável" },
    "10": { pontos: 10, mult: "2x", renda: "$2.000", desc: "Confortável - Vive bem" },
    "20": { pontos: 20, mult: "5x", renda: "$5.000", desc: "Rico - Propriedades e investimentos" },
    "30": { pontos: 30, mult: "10x", renda: "$10.000", desc: "Muito Rico - Elite econômica" },
    "50": { pontos: 50, mult: "20x", renda: "$20.000", desc: "Podre de Rico - Fortuna colossal" }
};

// ==================== 3. FUNÇÃO QUE INJETA OS VALORES ====================
function injetarValores(valor) {
    console.log(`🎯 Injetando valores para: ${valor}`);
    
    const dados = DADOS[valor];
    if (!dados) {
        console.error("❌ Dados não encontrados para:", valor);
        return;
    }
    
    // 1. INJETAR NO BADGE DE PONTOS
    const badge = document.getElementById('pontosRiqueza');
    if (badge) {
        badge.textContent = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
        console.log("✅ Badge atualizado:", badge.textContent);
        
        // Cor baseada no valor
        if (dados.pontos > 0) {
            badge.style.cssText = `
                background: linear-gradient(135deg, #2ecc71, #27ae60) !important;
                border-color: #27ae60 !important;
                color: white !important;
                font-weight: bold !important;
            `;
        } else if (dados.pontos < 0) {
            badge.style.cssText = `
                background: linear-gradient(135deg, #e74c3c, #c0392b) !important;
                border-color: #c0392b !important;
                color: white !important;
                font-weight: bold !important;
            `;
        } else {
            badge.style.cssText = `
                background: linear-gradient(135deg, #95a5a6, #7f8c8d) !important;
                border-color: #7f8c8d !important;
                color: white !important;
                font-weight: bold !important;
            `;
        }
    }
    
    // 2. INJETAR NO MULTIPLICADOR
    const mult = document.getElementById('multiplicadorRiqueza');
    if (mult) {
        mult.textContent = dados.mult;
        mult.style.cssText = `
            color: #ffd700 !important;
            font-weight: bold !important;
            font-size: 1.3rem !important;
        `;
        console.log("✅ Multiplicador atualizado:", mult.textContent);
    }
    
    // 3. INJETAR NA RENDA
    const renda = document.getElementById('rendaMensal');
    if (renda) {
        renda.textContent = dados.renda;
        renda.style.cssText = `
            color: #4caf50 !important;
            font-weight: bold !important;
            font-size: 1.3rem !important;
        `;
        console.log("✅ Renda atualizada:", renda.textContent);
    }
    
    // 4. INJETAR NA DESCRIÇÃO
    const desc = document.getElementById('descricaoRiqueza');
    if (desc) {
        desc.textContent = dados.desc;
        console.log("✅ Descrição atualizada");
    }
    
    // 5. INJETAR NO SELECT
    const select = document.getElementById('nivelRiqueza');
    if (select) {
        select.value = valor;
        console.log("✅ Select atualizado para:", valor);
    }
}

// ==================== 4. CONFIGURAR EVENTO NO SELECT ====================
function configurarSelect() {
    console.log("🔗 Configurando select...");
    
    const select = document.getElementById('nivelRiqueza');
    if (!select) {
        console.error("❌ Select não encontrado!");
        return false;
    }
    
    // Remover qualquer evento antigo
    const novoSelect = select.cloneNode(true);
    select.parentNode.replaceChild(novoSelect, select);
    
    // Adicionar novo evento DIRETO
    novoSelect.addEventListener('change', function(e) {
        console.log("🎛️ Evento change disparado! Valor:", e.target.value);
        injetarValores(e.target.value);
    });
    
    console.log("✅ Select configurado!");
    return true;
}

// ==================== 5. INICIALIZAÇÃO ====================
function inicializar() {
    console.log("🚀 INICIANDO SISTEMA...");
    
    // Procurar elementos
    const select = document.getElementById('nivelRiqueza');
    const badge = document.getElementById('pontosRiqueza');
    
    if (!select || !badge) {
        console.error("❌ Elementos não encontrados!");
        console.log("Select:", select ? "✅" : "❌");
        console.log("Badge:", badge ? "✅" : "❌");
        
        // Tentar novamente em 500ms
        setTimeout(inicializar, 500);
        return;
    }
    
    console.log("✅ Elementos encontrados!");
    
    // Configurar select
    configurarSelect();
    
    // Injetar valores iniciais (Médio)
    injetarValores("0");
    
    console.log("🎉 SISTEMA PRONTO! Mude o select para testar.");
}

// ==================== 6. EXECUTAR ====================
// Quando DOM carregar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log("📄 DOM carregado");
        setTimeout(inicializar, 300);
    });
} else {
    console.log("⚡ DOM já carregado");
    setTimeout(inicializar, 300);
}

// Observar quando a tab for clicada
document.addEventListener('click', function(e) {
    const tabBtn = e.target.closest('.tab-btn');
    if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
        console.log("🎯 Tab características clicada");
        setTimeout(inicializar, 200);
    }
});

// Forçar após 2 segundos
setTimeout(function() {
    console.log("⏰ Forçando inicialização...");
    inicializar();
}, 2000);

// ==================== 7. FUNÇÕES DE TESTE ====================
window.testeRiqueza = function() {
    console.group("🧪 TESTE DIRETO");
    
    const select = document.getElementById('nivelRiqueza');
    if (!select) {
        console.error("❌ Select não encontrado!");
        return;
    }
    
    // Testar cada valor
    const valores = ["-25", "-15", "-10", "0", "10", "20", "30", "50"];
    
    console.log("Testando todos os valores...");
    
    valores.forEach((valor, index) => {
        setTimeout(() => {
            console.log(`Teste ${index + 1}: ${valor}`);
            
            // Mudar valor
            select.value = valor;
            
            // Disparar evento
            const event = new Event('change', { bubbles: true });
            select.dispatchEvent(event);
            
            // Verificar resultado
            setTimeout(() => {
                const badge = document.getElementById('pontosRiqueza');
                if (badge) {
                    console.log(`✅ Badge mostra: ${badge.textContent}`);
                }
            }, 100);
        }, index * 300);
    });
    
    console.groupEnd();
};

window.resetRiqueza = function() {
    console.log("🔄 Resetando riqueza para Médio (0)...");
    injetarValores("0");
};

// ==================== 8. LOG FINAL ====================
console.log("✅ Sistema carregado! Comandos:");
console.log("- testeRiqueza() - Testar todos valores");
console.log("- resetRiqueza() - Resetar para Médio");
console.log("- injetarValores('20') - Mudar para Rico");