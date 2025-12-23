/* =========================================== */
/* SEÇÃO: NÍVEL DE RIQUEZA - COMPLETO */
/* =========================================== */

class SistemaRiqueza {
    constructor() {
        this.riquezaData = {
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
                multiplicador: 1,
                renda: 1000,
                descricao: 'Nível de recursos pré-definido padrão'
            },
            '10': { 
                label: 'Confortável', 
                pontos: 10,
                multiplicador: 2,
                renda: 2500,
                descricao: 'Vive bem, sem grandes preocupações financeiras'
            },
            '20': { 
                label: 'Rico', 
                pontos: 20,
                multiplicador: 5,
                renda: 8000,
                descricao: 'Recursos abundantes, estilo de vida luxuoso'
            },
            '30': { 
                label: 'Muito Rico', 
                pontos: 30,
                multiplicador: 10,
                renda: 15000,
                descricao: 'Fortuna considerável, influência econômica'
            },
            '50': { 
                label: 'Podre de Rico', 
                pontos: 50,
                multiplicador: 25,
                renda: 40000,
                descricao: 'Riqueza excepcional, poder econômico significativo'
            }
        };
        
        this.init();
    }
    
    init() {
        this.cacheElements();
        this.bindEvents();
        this.carregarSalvo();
        this.atualizarDisplay();
    }
    
    cacheElements() {
        this.elements = {
            nivelRiqueza: document.getElementById('nivelRiqueza'),
            pontosRiqueza: document.getElementById('pontosRiqueza'),
            multiplicadorRiqueza: document.getElementById('multiplicadorRiqueza'),
            rendaMensal: document.getElementById('rendaMensal'),
            descricaoRiqueza: document.getElementById('descricaoRiqueza')
        };
    }
    
    bindEvents() {
        // Evento quando seleciona um nível de riqueza
        this.elements.nivelRiqueza.addEventListener('change', (e) => {
            this.atualizarDisplay();
            this.salvarEstado();
            this.dispararEventoMudanca();
        });
        
        // Salvar estado quando a página é fechada/recarregada
        window.addEventListener('beforeunload', () => this.salvarEstado());
    }
    
    atualizarDisplay() {
        const nivelSelecionado = this.elements.nivelRiqueza.value;
        const dados = this.riquezaData[nivelSelecionado];
        
        if (!dados) return;
        
        // Atualizar todos os elementos
        this.elements.pontosRiqueza.textContent = `${dados.pontos >= 0 ? '+' : ''}${dados.pontos} pts`;
        
        // Formatar multiplicador
        this.elements.multiplicadorRiqueza.textContent = `${dados.multiplicador}x`;
        
        // Formatar renda em formato de dinheiro
        this.elements.rendaMensal.textContent = this.formatarMoeda(dados.renda);
        
        // Atualizar descrição
        this.elements.descricaoRiqueza.textContent = dados.descricao;
        
        // Atualizar classe do badge baseado no valor
        this.atualizarEstiloBadge(dados.pontos);
    }
    
    atualizarEstiloBadge(pontos) {
        const badge = this.elements.pontosRiqueza;
        
        // Remover classes anteriores
        badge.classList.remove('destaque-positivo', 'destaque-negativo', 'status-ok', 'status-warning', 'status-danger');
        
        // Adicionar classe apropriada
        if (pontos >= 30) {
            badge.classList.add('destaque-positivo');
        } else if (pontos >= 10) {
            badge.classList.add('status-ok');
        } else if (pontos > -10) {
            badge.classList.add('status-warning');
        } else {
            badge.classList.add('status-danger', 'destaque-negativo');
        }
    }
    
    formatarMoeda(valor) {
        // Formatar como moeda brasileira
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2
        }).format(valor);
    }
    
    salvarEstado() {
        try {
            const estado = {
                nivelRiqueza: this.elements.nivelRiqueza.value,
                timestamp: new Date().getTime()
            };
            
            localStorage.setItem('fichaRiqueza', JSON.stringify(estado));
        } catch (error) {
            console.error('Erro ao salvar estado da riqueza:', error);
        }
    }
    
    carregarSalvo() {
        try {
            const salvo = localStorage.getItem('fichaRiqueza');
            
            if (salvo) {
                const estado = JSON.parse(salvo);
                
                // Verificar se é recente (últimos 7 dias)
                const umaSemana = 7 * 24 * 60 * 60 * 1000;
                const agora = new Date().getTime();
                
                if (!estado.timestamp || (agora - estado.timestamp) < umaSemana) {
                    this.elements.nivelRiqueza.value = estado.nivelRiqueza;
                }
            }
        } catch (error) {
            console.error('Erro ao carregar estado da riqueza:', error);
        }
    }
    
    dispararEventoMudanca() {
        const nivelSelecionado = this.elements.nivelRiqueza.value;
        const dados = this.riquezaData[nivelSelecionado];
        
        // Disparar evento personalizado
        const evento = new CustomEvent('riquezaAlterada', {
            detail: {
                nivel: dados.label,
                pontos: dados.pontos,
                multiplicador: dados.multiplicador,
                renda: dados.renda
            },
            bubbles: true
        });
        
        this.elements.nivelRiqueza.dispatchEvent(evento);
        
        // Animação de destaque
        this.animarDestaque();
    }
    
    animarDestaque() {
        const display = document.querySelector('.riqueza-info');
        
        // Adicionar classe de destaque
        display.classList.add('destaque');
        
        // Remover após animação
        setTimeout(() => {
            display.classList.remove('destaque');
        }, 1000);
    }
    
    // Métodos públicos para acessar dados
    getNivelAtual() {
        const nivel = this.elements.nivelRiqueza.value;
        return this.riquezaData[nivel];
    }
    
    getPontos() {
        const nivel = this.elements.nivelRiqueza.value;
        return this.riquezaData[nivel]?.pontos || 0;
    }
    
    getMultiplicador() {
        const nivel = this.elements.nivelRiqueza.value;
        return this.riquezaData[nivel]?.multiplicador || 1;
    }
    
    getRenda() {
        const nivel = this.elements.nivelRiqueza.value;
        return this.riquezaData[nivel]?.renda || 0;
    }
    
    // Método para alterar programaticamente
    setNivelRiqueza(valor) {
        if (this.riquezaData.hasOwnProperty(valor)) {
            this.elements.nivelRiqueza.value = valor;
            this.atualizarDisplay();
            this.salvarEstado();
            this.dispararEventoMudanca();
            return true;
        }
        return false;
    }
    
    // Método para incrementar/decrementar
    ajustarNivel(direcao = 'up') {
        const valores = Object.keys(this.riquezaData);
        const atual = this.elements.nivelRiqueza.value;
        const indiceAtual = valores.indexOf(atual);
        
        if (direcao === 'up' && indiceAtual < valores.length - 1) {
            const proximo = valores[indiceAtual + 1];
            this.setNivelRiqueza(proximo);
            return true;
        } else if (direcao === 'down' && indiceAtual > 0) {
            const anterior = valores[indiceAtual - 1];
            this.setNivelRiqueza(anterior);
            return true;
        }
        
        return false;
    }
    
    // Método para resetar ao padrão
    resetar() {
        this.setNivelRiqueza('0');
    }
    
    // Método para exportar dados
    exportarDados() {
        const nivel = this.elements.nivelRiqueza.value;
        const dados = this.riquezaData[nivel];
        
        return {
            ...dados,
            nivel: parseInt(nivel),
            valorSelecionado: nivel
        };
    }
}

/* =========================================== */
/* INICIALIZAÇÃO E INTEGRAÇÃO */
/* =========================================== */

let sistemaRiqueza = null;

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de características
    const abaCaracteristicas = document.getElementById('caracteristicas');
    
    if (abaCaracteristicas) {
        sistemaRiqueza = new SistemaRiqueza();
        
        // Adicionar ao escopo global se necessário
        window.sistemaRiqueza = sistemaRiqueza;
        
        // Adicionar controles extras de navegação
        adicionarControlesExtras();
    }
});

// Função para adicionar controles de navegação por setas
function adicionarControlesExtras() {
    const riquezaContainer = document.querySelector('.riqueza-container');
    
    if (!riquezaContainer) return;
    
    // Criar botões de navegação
    const navegacaoHTML = `
        <div class="riqueza-navegacao" style="
            display: flex;
            gap: 10px;
            margin-top: 10px;
            justify-content: center;
        ">
            <button type="button" class="btn-controle riqueza-btn-down" style="
                padding: 5px 15px;
                background: linear-gradient(145deg, #4a352b, #2c2008);
                border: 1px solid var(--wood-light);
                border-radius: 4px;
                color: var(--text-light);
                cursor: pointer;
                font-family: 'Cinzel', serif;
            ">
                <i class="fas fa-arrow-down"></i> Menos Rico
            </button>
            <button type="button" class="btn-controle riqueza-btn-up" style="
                padding: 5px 15px;
                background: linear-gradient(145deg, #4a352b, #2c2008);
                border: 1px solid var(--wood-light);
                border-radius: 4px;
                color: var(--text-light);
                cursor: pointer;
                font-family: 'Cinzel', serif;
            ">
                Mais Rico <i class="fas fa-arrow-up"></i>
            </button>
            <button type="button" class="btn-controle riqueza-btn-reset" style="
                padding: 5px 15px;
                background: linear-gradient(145deg, #2c2008, #1a1200);
                border: 1px solid var(--primary-gold);
                border-radius: 4px;
                color: var(--text-gold);
                cursor: pointer;
                font-family: 'Cinzel', serif;
            ">
                <i class="fas fa-undo"></i> Resetar
            </button>
        </div>
    `;
    
    riquezaContainer.insertAdjacentHTML('beforeend', navegacaoHTML);
    
    // Adicionar eventos aos botões
    document.querySelector('.riqueza-btn-down')?.addEventListener('click', () => {
        sistemaRiqueza.ajustarNivel('down');
    });
    
    document.querySelector('.riqueza-btn-up')?.addEventListener('click', () => {
        sistemaRiqueza.ajustarNivel('up');
    });
    
    document.querySelector('.riqueza-btn-reset')?.addEventListener('click', () => {
        sistemaRiqueza.resetar();
    });
}

/* =========================================== */
/* INTEGRAÇÃO COM OUTRAS PARTES DO SISTEMA */
/* =========================================== */

// Exemplo de como outras partes podem ouvir mudanças na riqueza
document.addEventListener('riquezaAlterada', function(e) {
    console.log('Riqueza alterada:', e.detail);
    
    // Atualizar total de pontos da ficha
    atualizarTotalPontosFicha();
    
    // Atualizar alguma outra seção que dependa da riqueza
    atualizarSecoesDependentes(e.detail);
});

function atualizarTotalPontosFicha() {
    // Esta função seria implementada em um sistema maior
    // que soma todos os pontos da ficha
    const pontosRiqueza = sistemaRiqueza.getPontos();
    console.log(`Pontos de riqueza atualizados: ${pontosRiqueza}`);
}

function atualizarSecoesDependentes(dadosRiqueza) {
    // Exemplo: atualizar custo de vida, equipamentos iniciais, etc.
    // Depende da implementação do seu sistema
    console.log('Atualizando seções dependentes da riqueza:', dadosRiqueza);
}

/* =========================================== */
/* DEBUG E UTILIDADES */
/* =========================================== */

// Para debug: log do estado atual
console.log('Sistema de Riqueza carregado. Use window.sistemaRiqueza para acessar métodos.');

// Métodos disponíveis:
// - sistemaRiqueza.getNivelAtual()
// - sistemaRiqueza.getPontos()
// - sistemaRiqueza.getMultiplicador()
// - sistemaRiqueza.getRenda()
// - sistemaRiqueza.setNivelRiqueza(valor)
// - sistemaRiqueza.ajustarNivel(direcao)
// - sistemaRiqueza.resetar()
// - sistemaRiqueza.exportarDados()