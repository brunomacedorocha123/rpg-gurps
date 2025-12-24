// caracteristicas-riqueza.js - VERSÃO FUNCIONAL IMEDIATA

(function() {
    console.log("🚀 INICIANDO SISTEMA DE RIQUEZA...");
    
    // Dados dos níveis de riqueza
    const niveisRiqueza = {
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
    
    // Estado do sistema
    let nivelAtual = "0";
    let elementosCarregados = false;
    
    // Função para inicializar
    function inicializarSistemaRiqueza() {
        console.log("📦 Inicializando sistema de riqueza...");
        
        // Buscar elementos
        const select = document.getElementById('nivelRiqueza');
        const badge = document.getElementById('pontosRiqueza');
        const multiplicador = document.getElementById('multiplicadorRiqueza');
        const renda = document.getElementById('rendaMensal');
        const descricao = document.getElementById('descricaoRiqueza');
        
        console.log("🔍 Procurando elementos:", {
            select: select ? "✅ Encontrado" : "❌ Não encontrado",
            badge: badge ? "✅ Encontrado" : "❌ Não encontrado",
            multiplicador: multiplicador ? "✅ Encontrado" : "❌ Não encontrado",
            renda: renda ? "✅ Encontrado" : "❌ Não encontrado",
            descricao: descricao ? "✅ Encontrado" : "❌ Não encontrado"
        });
        
        // Verificar se encontrou todos os elementos
        if (!select || !badge) {
            console.error("❌ Elementos essenciais não encontrados!");
            return false;
        }
        
        console.log("✅ Todos elementos encontrados!");
        
        // Carregar valor salvo
        const salvo = localStorage.getItem('gurps_riqueza');
        if (salvo !== null && niveisRiqueza[salvo]) {
            nivelAtual = salvo;
            select.value = nivelAtual;
        }
        
        // Configurar evento de mudança
        select.addEventListener('change', function(e) {
            const novoValor = e.target.value;
            console.log("🔄 Riqueza alterada para:", novoValor);
            nivelAtual = novoValor;
            atualizarDisplayRiqueza();
            localStorage.setItem('gurps_riqueza', novoValor);
            
            // Efeito visual
            const badge = document.getElementById('pontosRiqueza');
            if (badge) {
                badge.classList.add('destaque-riqueza');
                setTimeout(() => badge.classList.remove('destaque-riqueza'), 500);
            }
        });
        
        // Atualizar display inicial
        atualizarDisplayRiqueza();
        
        elementosCarregados = true;
        console.log("✅ Sistema de riqueza inicializado com sucesso!");
        return true;
    }
    
    // Função principal de atualização
    function atualizarDisplayRiqueza() {
        const nivel = niveisRiqueza[nivelAtual];
        if (!nivel) {
            console.error("❌ Nível de riqueza não encontrado:", nivelAtual);
            return;
        }
        
        console.log("📊 Atualizando display com:", nivel);
        
        // Atualizar badge de pontos
        const badge = document.getElementById('pontosRiqueza');
        if (badge) {
            const texto = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
            badge.textContent = texto;
            
            // Aplicar cor baseada no valor
            badge.classList.remove('positivo', 'negativo', 'neutro');
            if (nivel.pontos > 0) {
                badge.classList.add('positivo');
            } else if (nivel.pontos < 0) {
                badge.classList.add('negativo');
            } else {
                badge.classList.add('neutro');
            }
        }
        
        // Atualizar multiplicador
        const multiplicador = document.getElementById('multiplicadorRiqueza');
        if (multiplicador) {
            multiplicador.textContent = nivel.multiplicador + 'x';
        }
        
        // Atualizar renda
        const renda = document.getElementById('rendaMensal');
        if (renda) {
            renda.textContent = nivel.renda;
        }
        
        // Atualizar descrição
        const descricao = document.getElementById('descricaoRiqueza');
        if (descricao) {
            descricao.textContent = nivel.descricao;
        }
        
        console.log("✅ Display atualizado!");
    }
    
    // Funções públicas
    window.sistemaRiqueza = {
        inicializar: function() {
            return inicializarSistemaRiqueza();
        },
        
        getPontos: function() {
            const nivel = niveisRiqueza[nivelAtual];
            return nivel ? nivel.pontos : 0;
        },
        
        getMultiplicador: function() {
            const nivel = niveisRiqueza[nivelAtual];
            return nivel ? nivel.multiplicador : 1.0;
        },
        
        getDados: function() {
            return {
                nivel: nivelAtual,
                dados: niveisRiqueza[nivelAtual]
            };
        },
        
        carregarDados: function(dados) {
            if (dados && dados.nivel && niveisRiqueza[dados.nivel]) {
                nivelAtual = dados.nivel;
                const select = document.getElementById('nivelRiqueza');
                if (select) select.value = nivelAtual;
                atualizarDisplayRiqueza();
                localStorage.setItem('gurps_riqueza', nivelAtual);
                return true;
            }
            return false;
        },
        
        resetar: function() {
            nivelAtual = "0";
            const select = document.getElementById('nivelRiqueza');
            if (select) select.value = "0";
            atualizarDisplayRiqueza();
            localStorage.removeItem('gurps_riqueza');
        }
    };
    
    // Adicionar CSS dinâmico
    function adicionarCSSRiqueza() {
        const style = document.createElement('style');
        style.textContent = `
            /* Estilos para a seção de riqueza */
            .dashboard-section .riqueza-container {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .riqueza-control {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            
            .riqueza-control label {
                color: var(--secondary-gold);
                font-family: 'Cinzel', serif;
                font-size: 1rem;
                font-weight: bold;
            }
            
            .riqueza-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                background: rgba(26, 18, 0, 0.6);
                border: 1px solid var(--wood-light);
                border-radius: 8px;
                padding: 15px;
            }
            
            .info-item {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .info-item span {
                color: var(--secondary-gold);
                font-size: 0.9rem;
                font-weight: bold;
            }
            
            .info-item strong {
                color: var(--text-gold);
                font-size: 1.2rem;
                font-family: 'Cinzel', serif;
            }
            
            .info-item small {
                color: var(--wood-light);
                font-size: 0.85rem;
                line-height: 1.3;
            }
            
            /* Badge de pontos com cores dinâmicas */
            #pontosRiqueza.positivo {
                background: linear-gradient(145deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.3));
                border-color: #27ae60;
                color: #2ecc71;
            }
            
            #pontosRiqueza.negativo {
                background: linear-gradient(145deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.3));
                border-color: #c0392b;
                color: #e74c3c;
            }
            
            #pontosRiqueza.neutro {
                background: linear-gradient(145deg, rgba(149, 165, 166, 0.2), rgba(127, 140, 141, 0.3));
                border-color: #7f8c8d;
                color: #95a5a6;
            }
            
            .destaque-riqueza {
                animation: pulse-riqueza 0.5s ease;
            }
            
            @keyframes pulse-riqueza {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            /* Estilo do select */
            #nivelRiqueza {
                background: rgba(26, 18, 0, 0.8);
                border: 1px solid var(--primary-gold);
                color: var(--text-light);
                font-family: 'Cinzel', serif;
                font-size: 1rem;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            #nivelRiqueza:focus {
                outline: 2px solid var(--secondary-gold);
                box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
            }
            
            #nivelRiqueza option {
                background: rgba(26, 18, 0, 0.95);
                color: var(--text-light);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Inicializar quando a página estiver pronta
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log("📄 DOM carregado, inicializando riqueza...");
            adicionarCSSRiqueza();
            
            // Tentar inicializar imediatamente
            setTimeout(function() {
                if (!inicializarSistemaRiqueza()) {
                    console.warn("⚠️ Falha na primeira tentativa, tentando novamente...");
                    setTimeout(inicializarSistemaRiqueza, 1000);
                }
            }, 300);
        });
    } else {
        console.log("📄 DOM já carregado, inicializando riqueza...");
        adicionarCSSRiqueza();
        setTimeout(inicializarSistemaRiqueza, 300);
    }
    
    // Observar quando a tab de características for aberta
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
            console.log("🎯 Tab características clicada, verificando riqueza...");
            setTimeout(function() {
                if (!elementosCarregados) {
                    console.log("🔄 Inicializando riqueza na tab características...");
                    inicializarSistemaRiqueza();
                }
            }, 100);
        }
    });
    
    // Também observar mudanças via showTab
    const showTabOriginal = window.showTab;
    if (showTabOriginal) {
        window.showTab = function(tabId) {
            showTabOriginal(tabId);
            if (tabId === 'caracteristicas') {
                setTimeout(function() {
                    if (!elementosCarregados) {
                        console.log("🔄 Inicializando riqueza via showTab...");
                        inicializarSistemaRiqueza();
                    }
                }, 100);
            }
        };
    }
    
    console.log("✅ Sistema de riqueza carregado, pronto para inicializar!");
})();