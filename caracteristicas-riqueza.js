// caracteristicas-riqueza.js - VERSÃO CORRIGIDA

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

// Elementos DOM - VERSÃO SEGURA (sem depender do DOMContentLoaded)
let selectNivelRiqueza, pontosRiquezaBadge, multiplicadorElement, rendaMensalElement, descricaoRiquezaElement;

// Variável para armazenar o nível atual
let nivelRiquezaAtual = "0";

// Função para inicializar - deve ser chamada quando o DOM estiver pronto
function inicializarModuloRiqueza() {
    console.log("Inicializando módulo de riqueza...");
    
    // Pegar elementos DOM
    selectNivelRiqueza = document.getElementById('nivelRiqueza');
    pontosRiquezaBadge = document.getElementById('pontosRiqueza');
    multiplicadorElement = document.getElementById('multiplicadorRiqueza');
    rendaMensalElement = document.getElementById('rendaMensal');
    descricaoRiquezaElement = document.getElementById('descricaoRiqueza');
    
    // Verificar se os elementos foram encontrados
    if (!selectNivelRiqueza || !pontosRiquezaBadge) {
        console.error("Elementos do módulo de riqueza não encontrados!");
        return false;
    }
    
    console.log("Elementos encontrados:", {
        select: selectNivelRiqueza,
        badge: pontosRiquezaBadge,
        mult: multiplicadorElement,
        renda: rendaMensalElement,
        desc: descricaoRiquezaElement
    });
    
    // Carregar valor salvo ou usar padrão
    const salvo = localStorage.getItem('personagem_riqueza');
    if (salvo !== null && niveisRiqueza[salvo]) {
        nivelRiquezaAtual = salvo;
        selectNivelRiqueza.value = nivelRiquezaAtual;
    }
    
    // Configurar event listeners
    selectNivelRiqueza.addEventListener('change', handleMudancaRiqueza);
    
    // Atualizar display inicial
    atualizarDisplayRiqueza();
    
    // Mostrar mensagem de sucesso
    console.log("Módulo de riqueza inicializado com sucesso!");
    
    return true;
}

// Função para lidar com mudança no select
function handleMudancaRiqueza(event) {
    nivelRiquezaAtual = event.target.value;
    console.log("Nível de riqueza alterado para:", nivelRiquezaAtual);
    
    // Atualizar display
    atualizarDisplayRiqueza();
    
    // Salvar no localStorage
    localStorage.setItem('personagem_riqueza', nivelRiquezaAtual);
    
    // Adicionar efeito visual
    if (pontosRiquezaBadge) {
        pontosRiquezaBadge.classList.add('destaque-mudanca');
        setTimeout(() => {
            pontosRiquezaBadge.classList.remove('destaque-mudanca');
        }, 1000);
    }
    
    // Chamar função global de atualização de pontos se existir
    if (typeof window.atualizarPontosTotais === 'function') {
        window.atualizarPontosTotais();
    }
}

// Função principal para atualizar o display
function atualizarDisplayRiqueza() {
    console.log("Atualizando display para nível:", nivelRiquezaAtual);
    
    const nivel = niveisRiqueza[nivelRiquezaAtual];
    if (!nivel) {
        console.error("Nível não encontrado:", nivelRiquezaAtual);
        return;
    }
    
    console.log("Dados do nível:", nivel);
    
    // Atualizar todos os elementos
    if (multiplicadorElement) {
        multiplicadorElement.textContent = nivel.multiplicador + 'x';
        console.log("Multiplicador atualizado:", multiplicadorElement.textContent);
    }
    
    if (rendaMensalElement) {
        rendaMensalElement.textContent = nivel.renda;
        console.log("Renda atualizada:", rendaMensalElement.textContent);
    }
    
    if (descricaoRiquezaElement) {
        descricaoRiquezaElement.textContent = nivel.descricao;
    }
    
    // Atualizar badge de pontos
    atualizarBadgePontos(nivel.pontos);
}

// Função para atualizar o badge de pontos
function atualizarBadgePontos(pontos) {
    if (!pontosRiquezaBadge) return;
    
    // Formatar texto dos pontos
    const textoPontos = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
    pontosRiquezaBadge.textContent = textoPontos;
    console.log("Badge atualizado:", textoPontos);
    
    // Atualizar cor baseada no valor
    pontosRiquezaBadge.classList.remove('destaque-positivo', 'destaque-negativo', 'destaque-neutro');
    
    if (pontos > 0) {
        pontosRiquezaBadge.classList.add('destaque-positivo');
    } else if (pontos < 0) {
        pontosRiquezaBadge.classList.add('destaque-negativo');
    } else {
        pontosRiquezaBadge.classList.add('destaque-neutro');
    }
}

// Função para obter os pontos atuais
function obterPontosRiqueza() {
    const nivel = niveisRiqueza[nivelRiquezaAtual];
    return nivel ? nivel.pontos : 0;
}

// Função para obter o multiplicador atual
function obterMultiplicadorRiqueza() {
    const nivel = niveisRiqueza[nivelRiquezaAtual];
    return nivel ? nivel.multiplicador : 1.0;
}

// Função para exportar dados
function exportarDadosRiqueza() {
    return {
        nivel: nivelRiquezaAtual,
        pontos: obterPontosRiqueza(),
        multiplicador: obterMultiplicadorRiqueza()
    };
}

// Função para importar dados
function importarDadosRiqueza(dados) {
    if (dados && dados.nivel && niveisRiqueza[dados.nivel]) {
        nivelRiquezaAtual = dados.nivel;
        if (selectNivelRiqueza) {
            selectNivelRiqueza.value = nivelRiquezaAtual;
        }
        atualizarDisplayRiqueza();
        localStorage.setItem('personagem_riqueza', nivelRiquezaAtual);
        return true;
    }
    return false;
}

// Função para resetar
function resetarRiqueza() {
    nivelRiquezaAtual = "0";
    if (selectNivelRiqueza) {
        selectNivelRiqueza.value = "0";
    }
    atualizarDisplayRiqueza();
    localStorage.removeItem('personagem_riqueza');
}

// Expor funções globalmente
window.riquezaModule = {
    inicializar: inicializarModuloRiqueza,
    getPontos: obterPontosRiqueza,
    getMultiplicador: obterMultiplicadorRiqueza,
    exportar: exportarDadosRiqueza,
    importar: importarDadosRiqueza,
    resetar: resetarRiqueza
};

// Inicialização automática quando a aba características for ativada
document.addEventListener('DOMContentLoaded', function() {
    // Observar mudanças nas abas
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const caracteristicasTab = document.getElementById('caracteristicas');
                if (caracteristicasTab && caracteristicasTab.classList.contains('active')) {
                    // Inicializar módulo quando a aba for ativada
                    if (!window.riquezaModuleInicializado) {
                        window.riquezaModuleInicializado = true;
                        setTimeout(inicializarModuloRiqueza, 100);
                    }
                }
            }
        });
    });
    
    // Observar a aba características
    const caracteristicasTab = document.getElementById('caracteristicas');
    if (caracteristicasTab) {
        observer.observe(caracteristicasTab, { attributes: true });
        
        // Inicializar imediatamente se já estiver ativa
        if (caracteristicasTab.classList.contains('active')) {
            window.riquezaModuleInicializado = true;
            setTimeout(inicializarModuloRiqueza, 100);
        }
    }
});

// CSS dinâmico para os efeitos visuais
(function adicionarCSSRiqueza() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para os badges de riqueza */
        .destaque-positivo {
            background: linear-gradient(145deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.3)) !important;
            border-color: #27ae60 !important;
            color: #2ecc71 !important;
        }
        
        .destaque-negativo {
            background: linear-gradient(145deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.3)) !important;
            border-color: #c0392b !important;
            color: #e74c3c !important;
        }
        
        .destaque-neutro {
            background: linear-gradient(145deg, rgba(149, 165, 166, 0.2), rgba(127, 140, 141, 0.3)) !important;
            border-color: #7f8c8d !important;
            color: #95a5a6 !important;
        }
        
        .destaque-mudanca {
            animation: pulse-riqueza 0.5s ease-in-out;
        }
        
        @keyframes pulse-riqueza {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
})();