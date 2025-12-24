// caracteristicas-riqueza.js - VERSÃO QUE RESETA O LOCALSTORAGE
console.log("🔄 RESETANDO SISTEMA DE RIQUEZA...");

// ==================== PASSO 1: LIMPAR LOCALSTORAGE ====================
console.log("🧹 Limpando localStorage...");
localStorage.removeItem('gurps_riqueza_nivel');
localStorage.removeItem('riqueza_atual');
localStorage.removeItem('gurps_riqueza_direto');
console.log("✅ localStorage limpo!");

// ==================== PASSO 2: DADOS ====================
const RIQUEZA_DADOS = {
    "-25": {
        nome: "Falido",
        pontos: -25,
        multiplicador: 0.1,
        renda: "$50",
        descricao: "Você não possui praticamente nada. Vive de ajuda alheia ou da caridade pública."
    },
    "-15": {
        nome: "Pobre",
        pontos: -15,
        multiplicador: 0.3,
        renda: "$300",
        descricao: "Possui apenas o essencial para sobreviver. Trabalha muito para ganhar pouco."
    },
    "-10": {
        nome: "Batalhador",
        pontos: -10,
        multiplicador: 0.5,
        renda: "$500",
        descricao: "Consegue pagar suas contas, mas sem sobras. Precisa trabalhar constantemente."
    },
    "0": {
        nome: "Médio",
        pontos: 0,
        multiplicador: 1.0,
        renda: "$1.000",
        descricao: "Possui uma vida confortável, com casa própria e capacidade de poupar um pouco."
    },
    "10": {
        nome: "Confortável",
        pontos: 10,
        multiplicador: 2.0,
        renda: "$2.000",
        descricao: "Vive bem, pode se dar ao luxo de pequenos prazeres e tem economias."
    },
    "20": {
        nome: "Rico",
        pontos: 20,
        multiplicador: 5.0,
        renda: "$5.000",
        descricao: "Possui propriedades, investimentos e uma vida de luxo moderado."
    },
    "30": {
        nome: "Muito Rico",
        pontos: 30,
        multiplicador: 10.0,
        renda: "$10.000",
        descricao: "Parte da elite econômica. Tem influência política e social."
    },
    "50": {
        nome: "Podre de Rico",
        pontos: 50,
        multiplicador: 20.0,
        renda: "$20.000",
        descricao: "Fortuna colossal. Pode comprar praticamente qualquer coisa que desejar."
    }
};

// ==================== PASSO 3: SISTEMA PRINCIPAL ====================
class RiquezaManager {
    constructor() {
        this.nivelAtual = "0"; // SEMPRE começa com 0
        this.elementos = {};
        this.initialized = false;
        
        console.log("🏗️ Criando RiquezaManager...");
        this.init();
    }
    
    init() {
        console.log("🔧 Inicializando...");
        
        // Tentar encontrar elementos várias vezes
        this.tentarEncontrarElementos();
        
        // Configurar observer para quando a tab for ativada
        this.configurarObserver();
        
        // Forçar inicialização após 1 segundo
        setTimeout(() => {
            if (!this.initialized) {
                console.log("⏰ Forçando inicialização...");
                this.forceInit();
            }
        }, 1000);
    }
    
    tentarEncontrarElementos() {
        console.log("🔍 Buscando elementos...");
        
        this.elementos = {
            select: document.getElementById('nivelRiqueza'),
            badge: document.getElementById('pontosRiqueza'),
            multiplicador: document.getElementById('multiplicadorRiqueza'),
            renda: document.getElementById('rendaMensal'),
            descricao: document.getElementById('descricaoRiqueza')
        };
        
        const todosEncontrados = this.elementos.select && this.elementos.badge;
        
        if (todosEncontrados) {
            console.log("✅ Todos elementos encontrados!");
            this.configurarSistema();
        } else {
            console.log("⚠️ Elementos não encontrados, tentando novamente em 500ms...");
            setTimeout(() => this.tentarEncontrarElementos(), 500);
        }
    }
    
    configurarSistema() {
        if (this.initialized) return;
        
        console.log("⚙️ Configurando sistema...");
        
        // 1. RESETAR SELECT para valor 0
        if (this.elementos.select) {
            this.elementos.select.value = "0";
            console.log("🔄 Select resetado para: 0");
        }
        
        // 2. Configurar evento de mudança
        this.configurarEventos();
        
        // 3. Atualizar display
        this.atualizarDisplay();
        
        // 4. Marcar como inicializado
        this.initialized = true;
        
        console.log("🎉 SISTEMA CONFIGURADO E PRONTO!");
        console.log("👉 Agora mude o select para testar!");
    }
    
    configurarEventos() {
        if (!this.elementos.select) return;
        
        console.log("🔗 Configurando eventos...");
        
        // Remover qualquer evento antigo (clone o elemento)
        const novoSelect = this.elementos.select.cloneNode(true);
        this.elementos.select.parentNode.replaceChild(novoSelect, this.elementos.select);
        this.elementos.select = novoSelect;
        
        // Adicionar NOVO evento
        this.elementos.select.addEventListener('change', (e) => {
            const novoValor = e.target.value;
            console.log(`🎛️ SELECT ALTERADO: ${this.nivelAtual} → ${novoValor}`);
            
            if (RIQUEZA_DADOS[novoValor]) {
                this.nivelAtual = novoValor;
                this.atualizarDisplay();
                
                // Salvar no localStorage (opcional)
                try {
                    localStorage.setItem('riqueza_novo', novoValor);
                } catch (e) {}
            }
        });
    }
    
    atualizarDisplay() {
        const dados = RIQUEZA_DADOS[this.nivelAtual];
        if (!dados) {
            console.error(`❌ Dados não encontrados para nível: ${this.nivelAtual}`);
            return;
        }
        
        console.log(`📊 Atualizando display: ${dados.nome} (${dados.pontos} pts)`);
        
        // Atualizar BADGE
        if (this.elementos.badge) {
            this.elementos.badge.textContent = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            
            // Estilização dinâmica
            this.elementos.badge.style.backgroundColor = dados.pontos > 0 ? '#2e7d32' :
                                                        dados.pontos < 0 ? '#c62828' : '#37474f';
            this.elementos.badge.style.color = 'white';
            this.elementos.badge.style.borderColor = dados.pontos > 0 ? '#1b5e20' :
                                                     dados.pontos < 0 ? '#b71c1c' : '#263238';
            this.elementos.badge.style.fontWeight = 'bold';
        }
        
        // Atualizar MULTIPLICADOR
        if (this.elementos.multiplicador) {
            this.elementos.multiplicador.textContent = dados.multiplicador + 'x';
            this.elementos.multiplicador.style.color = '#ffd700';
            this.elementos.multiplicador.style.fontWeight = 'bold';
        }
        
        // Atualizar RENDA
        if (this.elementos.renda) {
            this.elementos.renda.textContent = dados.renda;
            this.elementos.renda.style.color = '#4caf50';
            this.elementos.renda.style.fontWeight = 'bold';
        }
        
        // Atualizar DESCRIÇÃO
        if (this.elementos.descricao) {
            this.elementos.descricao.textContent = dados.descricao;
        }
    }
    
    configurarObserver() {
        // Observar quando a tab características for mostrada
        const tab = document.getElementById('caracteristicas');
        if (!tab) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'style' || mutation.attributeName === 'class') {
                    const isVisible = tab.style.display !== 'none' || tab.classList.contains('active');
                    if (isVisible && !this.initialized) {
                        console.log("🎯 Tab características visível, inicializando...");
                        this.configurarSistema();
                    }
                }
            });
        });
        
        observer.observe(tab, { 
            attributes: true, 
            attributeFilter: ['style', 'class'] 
        });
    }
    
    forceInit() {
        // Método força bruta para inicializar
        console.log("💥 FORÇANDO INICIALIZAÇÃO...");
        
        // Buscar elementos novamente
        this.elementos = {
            select: document.getElementById('nivelRiqueza'),
            badge: document.getElementById('pontosRiqueza'),
            multiplicador: document.getElementById('multiplicadorRiqueza'),
            renda: document.getElementById('rendaMensal'),
            descricao: document.getElementById('descricaoRiqueza')
        };
        
        if (this.elementos.select && this.elementos.badge) {
            // Forçar valor 0
            this.elementos.select.value = "0";
            this.nivelAtual = "0";
            
            // Configurar evento DIRETO
            this.elementos.select.onchange = (e) => {
                this.nivelAtual = e.target.value;
                this.atualizarDisplay();
            };
            
            // Atualizar
            this.atualizarDisplay();
            this.initialized = true;
            
            console.log("✅ INICIALIZAÇÃO FORÇADA COM SUCESSO!");
        } else {
            console.error("❌ Elementos não encontrados mesmo forçando!");
        }
    }
    
    // Métodos públicos
    debug() {
        console.group("🔍 DEBUG RIQUEZA");
        console.log("Nível atual:", this.nivelAtual);
        console.log("Inicializado:", this.initialized);
        console.log("Elementos:", this.elementos);
        console.log("Select value:", this.elementos.select?.value);
        console.log("Badge text:", this.elementos.badge?.textContent);
        console.groupEnd();
    }
    
    reset() {
        console.log("🔄 Resetando para nível 0...");
        this.nivelAtual = "0";
        if (this.elementos.select) {
            this.elementos.select.value = "0";
        }
        this.atualizarDisplay();
    }
}

// ==================== PASSO 4: INICIALIZAÇÃO ====================
// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM carregado, criando sistema...");
    window.riquezaManager = new RiquezaManager();
});

// Se já estiver carregado
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log("⚡ DOM já pronto, inicializando agora...");
    window.riquezaManager = new RiquezaManager();
}

// ==================== PASSO 5: FUNÇÕES DE TESTE SEGURAS ====================
window.testarRiquezaSeguro = function() {
    console.group("🧪 TESTE SEGURO DA RIQUEZA");
    
    if (!window.riquezaManager) {
        console.error("❌ Sistema não inicializado!");
        console.groupEnd();
        return;
    }
    
    // Testar mudança para -25
    console.log("Testando mudança para Falido (-25)...");
    window.riquezaManager.nivelAtual = "-25";
    window.riquezaManager.atualizarDisplay();
    
    setTimeout(() => {
        console.log("Testando mudança para 20...");
        window.riquezaManager.nivelAtual = "20";
        window.riquezaManager.atualizarDisplay();
        
        setTimeout(() => {
            console.log("Resetando para 0...");
            window.riquezaManager.reset();
            console.log("✅ Teste completo!");
            console.groupEnd();
        }, 1000);
    }, 1000);
};

// ==================== PASSO 6: VERIFICAÇÃO MANUAL ====================
console.log("✅ Sistema de riqueza carregado!");
console.log("💡 Comandos disponíveis:");
console.log("1. riquezaManager.debug() - Ver status");
console.log("2. riquezaManager.reset() - Resetar para 0");
console.log("3. testarRiquezaSeguro() - Teste seguro");
console.log("");
console.log("🔄 AGORA: Recarregue a página (Ctrl+F5) e vá na tab Características");
console.log("🎯 O select deve começar em 'Médio [0 pts]' e funcionar normalmente!");