// caracteristicas-riqueza.js

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

// Variáveis globais
let nivelRiquezaAtual = "0"; // Valor padrão

// Elementos DOM
const selectNivelRiqueza = document.getElementById('nivelRiqueza');
const pontosRiquezaBadge = document.getElementById('pontosRiqueza');
const multiplicadorElement = document.getElementById('multiplicadorRiqueza');
const rendaMensalElement = document.getElementById('rendaMensal');
const descricaoRiquezaElement = document.getElementById('descricaoRiqueza');

// Sistema de pontos global (referência)
let sistemaPontos = window.sistemaPontos || {
    pontosDisponiveis: 0,
    pontosGastos: 0,
    atualizarPontos: function() { /* função global */ }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba correta
    if (!document.getElementById('caracteristicas').classList.contains('active')) {
        return;
    }
    
    inicializarRiqueza();
    configurarEventListeners();
    atualizarDisplayRiqueza();
});

function inicializarRiqueza() {
    // Carregar do localStorage se existir
    const salvo = localStorage.getItem('personagemRiqueza');
    if (salvo) {
        nivelRiquezaAtual = salvo;
        selectNivelRiqueza.value = nivelRiquezaAtual;
    }
    
    // Atualizar pontos iniciais
    atualizarPontosRiqueza();
}

function configurarEventListeners() {
    // Event listener para mudança no select
    selectNivelRiqueza.addEventListener('change', function(e) {
        nivelRiquezaAtual = e.target.value;
        atualizarDisplayRiqueza();
        salvarNoLocalStorage();
        
        // Adicionar efeito visual de destaque
        const badge = document.getElementById('pontosRiqueza');
        badge.classList.add('destaque-mudanca');
        setTimeout(() => badge.classList.remove('destaque-mudanca'), 1000);
    });
    
    // Event listener para tooltip ao passar o mouse
    selectNivelRiqueza.addEventListener('mouseenter', mostrarTooltipRiqueza);
    selectNivelRiqueza.addEventListener('mouseleave', esconderTooltipRiqueza);
    
    // Event listener para teclado
    selectNivelRiqueza.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            this.blur();
        }
    });
}

function atualizarDisplayRiqueza() {
    const nivel = niveisRiqueza[nivelRiquezaAtual];
    
    if (!nivel) return;
    
    // Atualizar elementos
    multiplicadorElement.textContent = nivel.multiplicador + 'x';
    rendaMensalElement.textContent = nivel.renda;
    descricaoRiquezaElement.textContent = nivel.descricao;
    
    // Atualizar badge de pontos
    atualizarPontosRiqueza();
    
    // Aplicar classes CSS baseadas no valor
    atualizarEstiloPorNivel(nivel.pontos);
}

function atualizarPontosRiqueza() {
    const nivel = niveisRiqueza[nivelRiquezaAtual];
    const pontos = nivel ? nivel.pontos : 0;
    
    // Atualizar badge
    pontosRiquezaBadge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
    
    // Atualizar no sistema global de pontos
    if (window.atualizarPontosCaracteristicas) {
        window.atualizarPontosCaracteristicas('riqueza', pontos);
    }
    
    return pontos;
}

function atualizarEstiloPorNivel(pontos) {
    const badge = pontosRiquezaBadge;
    
    // Remover classes anteriores
    badge.classList.remove('destaque-positivo', 'destaque-negativo', 'destaque-neutro');
    
    // Adicionar classe apropriada
    if (pontos > 0) {
        badge.classList.add('destaque-positivo');
        badge.style.color = '#27ae60'; // Verde
        badge.style.borderColor = '#27ae60';
    } else if (pontos < 0) {
        badge.classList.add('destaque-negativo');
        badge.style.color = '#e74c3c'; // Vermelho
        badge.style.borderColor = '#e74c3c';
    } else {
        badge.classList.add('destaque-neutro');
        badge.style.color = '#95a5a6'; // Cinza
        badge.style.borderColor = '#95a5a6';
    }
}

function mostrarTooltipRiqueza() {
    const tooltip = document.createElement('div');
    tooltip.id = 'tooltip-riqueza';
    tooltip.className = 'custom-tooltip';
    tooltip.innerHTML = `
        <strong>Nível de Riqueza</strong><br>
        <small>Define sua situação financeira inicial. Valores positivos custam pontos, 
        valores negativos dão pontos extras. A renda mensal é um multiplicador 
        para gastos iniciais com equipamentos.</small>
    `;
    
    // Posicionar tooltip
    const rect = this.getBoundingClientRect();
    tooltip.style.position = 'fixed';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
    tooltip.style.left = (rect.left + rect.width / 2 - 150) + 'px';
    tooltip.style.width = '300px';
    
    document.body.appendChild(tooltip);
}

function esconderTooltipRiqueza() {
    const tooltip = document.getElementById('tooltip-riquega');
    if (tooltip) {
        tooltip.remove();
    }
}

function salvarNoLocalStorage() {
    localStorage.setItem('personagemRiqueza', nivelRiquezaAtual);
}

// Funções para exportação/importação
function exportarDadosRiqueza() {
    return {
        nivelRiqueza: nivelRiquezaAtual,
        dados: niveisRiqueza[nivelRiquezaAtual]
    };
}

function importarDadosRiqueza(dados) {
    if (dados && dados.nivelRiqueza) {
        nivelRiquezaAtual = dados.nivelRiqueza;
        selectNivelRiqueza.value = nivelRiquezaAtual;
        atualizarDisplayRiqueza();
        salvarNoLocalStorage();
        return true;
    }
    return false;
}

// Função para resetar
function resetarRiqueza() {
    nivelRiquezaAtual = "0";
    selectNivelRiqueza.value = "0";
    atualizarDisplayRiqueza();
    localStorage.removeItem('personagemRiqueza');
}

// Função para obter o multiplicador de riqueza (útil para outras seções)
function obterMultiplicadorRiqueza() {
    return niveisRiqueza[nivelRiquezaAtual]?.multiplicador || 1.0;
}

// Expor funções para uso global
window.riquezaModule = {
    atualizarDisplay: atualizarDisplayRiqueza,
    exportar: exportarDadosRiqueza,
    importar: importarDadosRiqueza,
    resetar: resetarRiqueza,
    getMultiplicador: obterMultiplicadorRiqueza,
    getNivelAtual: () => nivelRiquezaAtual
};

// Adicionar CSS dinâmico para os destaques
(function adicionarEstilosDinamicos() {
    const styles = `
        .destaque-mudanca {
            animation: pulseDestaque 1s ease;
        }
        
        @keyframes pulseDestaque {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .custom-tooltip {
            background: linear-gradient(145deg, rgba(44, 32, 8, 0.95), rgba(26, 18, 0, 0.98));
            border: 2px solid var(--primary-gold);
            border-radius: 8px;
            padding: 12px;
            color: var(--text-light);
            font-family: 'Cinzel', serif;
            font-size: 0.9rem;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
            pointer-events: none;
        }
        
        .custom-tooltip strong {
            color: var(--text-gold);
            display: block;
            margin-bottom: 5px;
            font-size: 1rem;
        }
        
        .custom-tooltip small {
            color: var(--wood-light);
            line-height: 1.4;
        }
        
        .custom-tooltip::before {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid var(--primary-gold);
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
})();

// Inicializar imediatamente se o DOM já estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarRiqueza);
} else {
    inicializarRiqueza();
}

console.log('Módulo de Riqueza carregado com sucesso!');