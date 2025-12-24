// caracteristicas-riqueza.js - SOLUÇÃO DEFINITIVA
console.log("🎯 SISTEMA DE RIQUEZA - INICIANDO");

// Eu SEI o HTML, então vou usar os IDs EXATOS:
const DADOS_RIQUEZA = {
    "-25": { pontos: -25, mult: "0.1x", renda: "$50", desc: "Você não possui praticamente nada." },
    "-15": { pontos: -15, mult: "0.3x", renda: "$300", desc: "Possui apenas o essencial para sobreviver." },
    "-10": { pontos: -10, mult: "0.5x", renda: "$500", desc: "Consegue pagar suas contas, mas sem sobras." },
    "0": { pontos: 0, mult: "1x", renda: "$1.000", desc: "Possui uma vida confortável." },
    "10": { pontos: 10, mult: "2x", renda: "$2.000", desc: "Vive bem, pode se dar ao luxo de pequenos prazeres." },
    "20": { pontos: 20, mult: "5x", renda: "$5.000", desc: "Possui propriedades, investimentos e vida de luxo." },
    "30": { pontos: 30, mult: "10x", renda: "$10.000", desc: "Parte da elite econômica." },
    "50": { pontos: 50, mult: "20x", renda: "$20.000", desc: "Fortuna colossal." }
};

// Sistema principal
class SistemaRiqueza {
    constructor() {
        this.nivelAtual = "0";
        this.inicializado = false;
        console.log("🏗️ Sistema de riqueza criado");
    }
    
    inicializar() {
        console.log("🔧 Inicializando...");
        
        // Verificar se estamos na tab correta
        const tabCaracteristicas = document.getElementById('caracteristicas');
        if (!tabCaracteristicas || tabCaracteristicas.style.display === 'none') {
            console.log("📭 Tab características não visível, aguardando...");
            return false;
        }
        
        // Verificar elementos
        const select = document.getElementById('nivelRiqueza');
        const badge = document.getElementById('pontosRiqueza');
        
        if (!select || !badge) {
            console.error("❌ Elementos não encontrados!");
            return false;
        }
        
        console.log("✅ Elementos encontrados!");
        
        // Configurar evento
        this.configurarEvento(select);
        
        // Atualizar display inicial
        this.atualizarDisplay(select.value);
        
        this.inicializado = true;
        console.log("🎉 Sistema inicializado!");
        return true;
    }
    
    configurarEvento(select) {
        console.log("🔗 Configurando evento no select...");
        
        // Remover qualquer evento antigo (clone o elemento)
        const novoSelect = select.cloneNode(true);
        select.parentNode.replaceChild(novoSelect, select);
        
        // Adicionar novo evento
        novoSelect.addEventListener('change', (e) => {
            const valor = e.target.value;
            console.log(`🎛️ Select alterado: ${valor}`);
            this.atualizarDisplay(valor);
        });
        
        console.log("✅ Evento configurado!");
    }
    
    atualizarDisplay(valor) {
        console.log(`🔄 Atualizando display para: ${valor}`);
        
        const dados = DADOS_RIQUEZA[valor];
        if (!dados) {
            console.error(`❌ Dados não encontrados para: ${valor}`);
            return;
        }
        
        // 1. Atualizar badge de pontos
        const badge = document.getElementById('pontosRiqueza');
        if (badge) {
            badge.textContent = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            
            // Cor baseada no valor
            if (dados.pontos > 0) {
                badge.style.backgroundColor = '#2e7d32';
                badge.style.color = 'white';
            } else if (dados.pontos < 0) {
                badge.style.backgroundColor = '#c62828';
                badge.style.color = 'white';
            } else {
                badge.style.backgroundColor = '#37474f';
                badge.style.color = 'white';
            }
        }
        
        // 2. Atualizar multiplicador
        const mult = document.getElementById('multiplicadorRiqueza');
        if (mult) {
            mult.textContent = dados.mult;
            mult.style.color = '#ffd700';
        }
        
        // 3. Atualizar renda
        const renda = document.getElementById('rendaMensal');
        if (renda) {
            renda.textContent = dados.renda;
            renda.style.color = '#4caf50';
        }
        
        // 4. Atualizar descrição
        const desc = document.getElementById('descricaoRiqueza');
        if (desc) {
            desc.textContent = dados.desc;
        }
        
        console.log(`✅ Display atualizado: ${dados.pontos} pts, ${dados.mult}, ${dados.renda}`);
    }
}

// Criar instância global
window.riqueza = new SistemaRiqueza();

// Inicializar quando a tab for mostrada
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM carregado");
    
    // Observar quando a tab características for ativada
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class' || mutation.attributeName === 'style') {
                const tab = document.getElementById('caracteristicas');
                if (tab && (tab.classList.contains('active') || tab.style.display === 'block')) {
                    if (!window.riqueza.inicializado) {
                        console.log("🎯 Tab características ativada, inicializando...");
                        setTimeout(() => window.riqueza.inicializar(), 100);
                    }
                }
            }
        });
    });
    
    // Observar a tab
    const tab = document.getElementById('caracteristicas');
    if (tab) {
        observer.observe(tab, { attributes: true });
    }
    
    // Forçar inicialização após 2 segundos
    setTimeout(() => {
        if (!window.riqueza.inicializado) {
            console.log("⏰ Forçando inicialização...");
            window.riqueza.inicializar();
        }
    }, 2000);
});

// Teste manual
window.testarRiqueza = function() {
    console.log("🧪 Testando sistema de riqueza...");
    
    const select = document.getElementById('nivelRiqueza');
    if (!select) {
        console.error("❌ Select não encontrado!");
        return;
    }
    
    // Testar mudança para 20 (Rico)
    select.value = "20";
    const event = new Event('change', { bubbles: true });
    select.dispatchEvent(event);
    
    console.log("✅ Teste executado! Deve mostrar: +20 pts, 5x, $5.000");
};

console.log("✅ Sistema de riqueza carregado!");
console.log("💡 Comandos:");
console.log("- riqueza.atualizarDisplay('10') - Mudar para Confortável");
console.log("- testarRiqueza() - Testar sistema");