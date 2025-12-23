/* =========================================== */
/* SISTEMA DE RIQUEZA - SIMPLES E FUNCIONAL */
/* =========================================== */

// Dados dos níveis de riqueza
const RIQUEZA_DATA = {
    '-25': {
        label: 'Falido',
        pontos: -25,
        multiplicador: 0.1,
        renda: 0,
        descricao: 'Sem recursos, dependendo da caridade'
    },
    '-15': {
        label: 'Pobre',
        pontos: -15,
        multiplicador: 0.3,
        renda: 300,
        descricao: 'Recursos mínimos para sobrevivência'
    },
    '-10': {
        label: 'Batalhador',
        pontos: -10,
        multiplicador: 0.6,
        renda: 800,
        descricao: 'Vive com dificuldade, mas se mantém'
    },
    '0': {
        label: 'Médio',
        pontos: 0,
        multiplicador: 1.0,
        renda: 1000,
        descricao: 'Nível de recursos pré-definido padrão'
    },
    '10': {
        label: 'Confortável',
        pontos: 10,
        multiplicador: 2.0,
        renda: 2500,
        descricao: 'Vive bem, sem grandes preocupações financeiras'
    },
    '20': {
        label: 'Rico',
        pontos: 20,
        multiplicador: 5.0,
        renda: 8000,
        descricao: 'Recursos abundantes, estilo de vida luxuoso'
    },
    '30': {
        label: 'Muito Rico',
        pontos: 30,
        multiplicador: 10.0,
        renda: 15000,
        descricao: 'Fortuna considerável, influência econômica'
    },
    '50': {
        label: 'Podre de Rico',
        pontos: 50,
        multiplicador: 25.0,
        renda: 40000,
        descricao: 'Riqueza excepcional, poder econômico significativo'
    }
};

// Sistema de pontos global (simulação)
let pontosDisponiveis = 100;

// Função para atualizar todos os valores da riqueza
function atualizarRiqueza() {
    // Pegar o elemento select
    const selectRiqueza = document.getElementById('nivelRiqueza');
    
    if (!selectRiqueza) {
        console.error('Elemento nivelRiqueza não encontrado!');
        return;
    }
    
    // Pegar o valor selecionado
    const valorSelecionado = selectRiqueza.value;
    
    // Pegar dados do nível selecionado
    const dadosRiqueza = RIQUEZA_DATA[valorSelecionado];
    
    if (!dadosRiqueza) {
        console.error('Dados de riqueza não encontrados para:', valorSelecionado);
        return;
    }
    
    // Atualizar todos os elementos da interface
    const pontosElement = document.getElementById('pontosRiqueza');
    const multiplicadorElement = document.getElementById('multiplicadorRiqueza');
    const rendaElement = document.getElementById('rendaMensal');
    const descricaoElement = document.getElementById('descricaoRiqueza');
    
    if (pontosElement) {
        pontosElement.textContent = `${dadosRiqueza.pontos >= 0 ? '+' : ''}${dadosRiqueza.pontos} pts`;
        aplicarEstiloPontos(pontosElement, dadosRiqueza.pontos);
    }
    
    if (multiplicadorElement) {
        multiplicadorElement.textContent = `${dadosRiqueza.multiplicador.toFixed(1)}x`;
    }
    
    if (rendaElement) {
        rendaElement.textContent = formatarMoeda(dadosRiqueza.renda);
    }
    
    if (descricaoElement) {
        descricaoElement.textContent = dadosRiqueza.descricao;
    }
    
    // Salvar no localStorage
    salvarRiqueza(valorSelecionado);
    
    // Log para debug
    console.log('Riqueza atualizada:', {
        nivel: dadosRiqueza.label,
        pontos: dadosRiqueza.pontos,
        multiplicador: dadosRiqueza.multiplicador,
        renda: dadosRiqueza.renda
    });
}

// Aplicar estilo visual baseado nos pontos
function aplicarEstiloPontos(elemento, pontos) {
    // Remover todas as classes de estilo
    elemento.classList.remove(
        'destaque-positivo',
        'destaque-negativo',
        'status-ok',
        'status-warning',
        'status-danger'
    );
    
    // Aplicar novas classes baseadas nos pontos
    if (pontos >= 30) {
        elemento.classList.add('destaque-positivo', 'status-ok');
    } else if (pontos >= 20) {
        elemento.classList.add('status-ok');
    } else if (pontos >= 10) {
        elemento.classList.add('status-ok');
    } else if (pontos >= 0) {
        elemento.classList.add('status-warning');
    } else if (pontos >= -10) {
        elemento.classList.add('status-warning');
    } else if (pontos >= -15) {
        elemento.classList.add('status-danger');
    } else {
        elemento.classList.add('destaque-negativo', 'status-danger');
    }
}

// Formatar valor como moeda
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// Salvar estado no localStorage
function salvarRiqueza(valor) {
    try {
        const estado = {
            nivelRiqueza: valor,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('riquezaFicha', JSON.stringify(estado));
    } catch (e) {
        console.error('Erro ao salvar riqueza:', e);
    }
}

// Carregar estado salvo
function carregarRiqueza() {
    try {
        const salvo = localStorage.getItem('riquezaFicha');
        if (salvo) {
            const estado = JSON.parse(salvo);
            const select = document.getElementById('nivelRiqueza');
            if (select && RIQUEZA_DATA[estado.nivelRiqueza]) {
                select.value = estado.nivelRiqueza;
                atualizarRiqueza();
            }
        }
    } catch (e) {
        console.error('Erro ao carregar riqueza:', e);
    }
}

// Inicializar sistema quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando sistema de riqueza...');
    
    // Carregar configuração salva
    carregarRiqueza();
    
    // Adicionar evento ao select
    const selectRiqueza = document.getElementById('nivelRiqueza');
    if (selectRiqueza) {
        selectRiqueza.addEventListener('change', atualizarRiqueza);
        console.log('Evento adicionado ao select de riqueza');
    } else {
        console.error('Select de riqueza não encontrado no DOM!');
    }
    
    // Adicionar botões de controle
    adicionarBotoesControle();
    
    // Verificar se os elementos existem
    verificarElementos();
});

// Adicionar botões de navegação
function adicionarBotoesControle() {
    const container = document.querySelector('.riqueza-container');
    if (!container) return;
    
    // Criar div para botões
    const divBotoes = document.createElement('div');
    divBotoes.className = 'riqueza-botoes';
    divBotoes.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 15px;
        justify-content: center;
        flex-wrap: wrap;
    `;
    
    // Criar botões
    divBotoes.innerHTML = `
        <button type="button" class="btn-riqueza-menor" style="
            padding: 8px 15px;
            background: linear-gradient(145deg, #2c2008, #1a1200);
            border: 1px solid var(--wood-light);
            border-radius: 6px;
            color: var(--text-light);
            cursor: pointer;
            font-family: 'Cinzel', serif;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        ">
            <i class="fas fa-arrow-down"></i> Nível Anterior
        </button>
        <button type="button" class="btn-riqueza-reset" style="
            padding: 8px 15px;
            background: linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.3));
            border: 1px solid var(--primary-gold);
            border-radius: 6px;
            color: var(--text-gold);
            cursor: pointer;
            font-family: 'Cinzel', serif;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        ">
            <i class="fas fa-home"></i> Padrão (Médio)
        </button>
        <button type="button" class="btn-riqueza-maior" style="
            padding: 8px 15px;
            background: linear-gradient(145deg, #2c2008, #1a1200);
            border: 1px solid var(--wood-light);
            border-radius: 6px;
            color: var(--text-light);
            cursor: pointer;
            font-family: 'Cinzel', serif;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
        ">
            Próximo Nível <i class="fas fa-arrow-up"></i>
        </button>
    `;
    
    container.appendChild(divBotoes);
    
    // Adicionar eventos aos botões
    document.querySelector('.btn-riqueza-menor')?.addEventListener('click', diminuirRiqueza);
    document.querySelector('.btn-riqueza-reset')?.addEventListener('click', resetarRiqueza);
    document.querySelector('.btn-riqueza-maior')?.addEventListener('click', aumentarRiqueza);
    
    // Adicionar efeitos hover
    const botoes = container.querySelectorAll('button');
    botoes.forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        
        btn.addEventListener('click', function() {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
}

// Função para diminuir nível de riqueza
function diminuirRiqueza() {
    const select = document.getElementById('nivelRiqueza');
    const niveis = ['-25', '-15', '-10', '0', '10', '20', '30', '50'];
    const indexAtual = niveis.indexOf(select.value);
    
    if (indexAtual > 0) {
        select.value = niveis[indexAtual - 1];
        atualizarRiqueza();
        
        // Animar mudança
        animarMudanca('down');
    }
}

// Função para aumentar nível de riqueza
function aumentarRiqueza() {
    const select = document.getElementById('nivelRiqueza');
    const niveis = ['-25', '-15', '-10', '0', '10', '20', '30', '50'];
    const indexAtual = niveis.indexOf(select.value);
    
    if (indexAtual < niveis.length - 1) {
        select.value = niveis[indexAtual + 1];
        atualizarRiqueza();
        
        // Animar mudança
        animarMudanca('up');
    }
}

// Função para resetar para o nível padrão
function resetarRiqueza() {
    const select = document.getElementById('nivelRiqueza');
    select.value = '0';
    atualizarRiqueza();
    
    // Animar mudança
    animarMudanca('reset');
}

// Animação de mudança
function animarMudanca(direcao) {
    const info = document.querySelector('.riqueza-info');
    if (info) {
        info.classList.remove('animar-up', 'animar-down', 'animar-reset');
        
        void info.offsetWidth; // Trigger reflow
        
        info.classList.add(`animar-${direcao}`);
        
        setTimeout(() => {
            info.classList.remove(`animar-${direcao}`);
        }, 600);
    }
}

// Verificar se todos os elementos existem
function verificarElementos() {
    const elementosNecessarios = [
        'nivelRiqueza',
        'pontosRiqueza',
        'multiplicadorRiqueza',
        'rendaMensal',
        'descricaoRiqueza'
    ];
    
    console.log('Verificando elementos da riqueza:');
    elementosNecessarios.forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            console.log(`✓ ${id}: Encontrado`);
        } else {
            console.error(`✗ ${id}: NÃO ENCONTRADO`);
        }
    });
}

// Adicionar estilos CSS para animações
function adicionarEstilosAnimacao() {
    if (!document.getElementById('estilos-riqueza')) {
        const style = document.createElement('style');
        style.id = 'estilos-riqueza';
        style.textContent = `
            /* Animações para mudanças de riqueza */
            .animar-up {
                animation: pulseUp 0.6s ease;
            }
            
            .animar-down {
                animation: pulseDown 0.6s ease;
            }
            
            .animar-reset {
                animation: pulseReset 0.6s ease;
            }
            
            @keyframes pulseUp {
                0% { transform: translateY(0); }
                50% { 
                    transform: translateY(-5px); 
                    box-shadow: 0 10px 25px rgba(46, 204, 113, 0.3);
                }
                100% { transform: translateY(0); }
            }
            
            @keyframes pulseDown {
                0% { transform: translateY(0); }
                50% { 
                    transform: translateY(5px); 
                    box-shadow: 0 10px 25px rgba(231, 76, 60, 0.3);
                }
                100% { transform: translateY(0); }
            }
            
            @keyframes pulseReset {
                0% { transform: scale(1); }
                50% { 
                    transform: scale(1.05); 
                    box-shadow: 0 10px 25px rgba(241, 196, 15, 0.3);
                }
                100% { transform: scale(1); }
            }
            
            /* Estilo para o select quando focado */
            #nivelRiqueza:focus {
                outline: none;
                border-color: var(--primary-gold);
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
            }
            
            /* Estilo para opções desabilitadas */
            #nivelRiqueza option:disabled {
                color: #666;
                background-color: #333;
            }
        `;
        document.head.appendChild(style);
    }
}

// Adicionar estilos de animação
adicionarEstilosAnimacao();

// Expor funções para debug
window.riqueza = {
    atualizar: atualizarRiqueza,
    diminuir: diminuirRiqueza,
    aumentar: aumentarRiqueza,
    resetar: resetarRiqueza,
    getNivel: function() {
        const select = document.getElementById('nivelRiqueza');
        return select ? select.value : null;
    },
    getDados: function() {
        const nivel = this.getNivel();
        return nivel ? RIQUEZA_DATA[nivel] : null;
    }
};

console.log('Sistema de Riqueza carregado. Use window.riqueza para acessar funções.');