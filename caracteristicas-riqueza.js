// ===========================================
// CARACTERÍSTICAS-RIQUEZA.JS
// Sistema de nível de riqueza com sub-abas
// ===========================================

class SistemaRiqueza {
    constructor() {
        this.niveisRiqueza = {
            "falido": { 
                pontos: -25, 
                multiplicador: 0, 
                rendaBase: 0,
                descricao: "Sem emprego, fonte de renda, dinheiro ou bens",
                recursos: "Nenhum",
                icone: "fas fa-skull-crossbones",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "pobre": { 
                pontos: -15, 
                multiplicador: 0.2, 
                rendaBase: 200,
                descricao: "1/5 da riqueza média da sociedade",
                recursos: "Muito limitados",
                icone: "fas fa-house-damage",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "batalhador": { 
                pontos: -10, 
                multiplicador: 0.5, 
                rendaBase: 500,
                descricao: "Metade da riqueza média",
                recursos: "Limitados",
                icone: "fas fa-hands-helping",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "medio": { 
                pontos: 0, 
                multiplicador: 1, 
                rendaBase: 1000,
                descricao: "Nível de recursos pré-definido padrão",
                recursos: "Padrão",
                icone: "fas fa-user",
                tipo: "neutro",
                cor: "#95a5a6"
            },
            "confortavel": { 
                pontos: 10, 
                multiplicador: 2, 
                rendaBase: 2000,
                descricao: "O dobro da riqueza média",
                recursos: "Confortáveis",
                icone: "fas fa-smile",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "rico": { 
                pontos: 20, 
                multiplicador: 5, 
                rendaBase: 5000,
                descricao: "5 vezes a riqueza média",
                recursos: "Abundantes",
                icone: "fas fa-grin-stars",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "muito-rico": { 
                pontos: 30, 
                multiplicador: 20, 
                rendaBase: 20000,
                descricao: "20 vezes a riqueza média", 
                recursos: "Extremamente abundantes",
                icone: "fas fa-crown",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "podre-rico": { 
                pontos: 50, 
                multiplicador: 100, 
                rendaBase: 100000,
                descricao: "100 vezes a riqueza média",
                recursos: "Ilimitados para necessidades comuns",
                icone: "fas fa-gem",
                tipo: "vantagem",
                cor: "#27ae60"
            }
        };

        this.inicializado = false;
        this.carregarDoLocalStorage();
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarDisplay();
        this.inicializado = true;
        
        // Notificar sistema de pontos
        this.notificarAtualizacao();
    }

    configurarEventos() {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            selectRiqueza.addEventListener('change', (e) => {
                this.atualizarDisplay();
                this.salvarNoLocalStorage();
                this.notificarAtualizacao();
            });
        }
    }

    atualizarDisplay() {
        const select = document.getElementById('nivelRiqueza');
        const display = document.getElementById('displayRiqueza');
        const badge = document.getElementById('pontosRiqueza');
        const rendaElement = document.getElementById('rendaMensal');
        
        if (!select || !display || !badge || !rendaElement) return;

        const valor = parseInt(select.value) || 0;
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            const rendaMensal = this.calcularRendaMensal(valor);
            
            display.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="${nivel.icone}" style="color: ${nivel.cor}; font-size: 1.5rem;"></i>
                    <strong style="color: var(--text-gold);">${this.obterNomePorPontos(valor)}</strong>
                </div>
                <div style="font-size: 0.9em; color: var(--text-light); opacity: 0.8;">
                    <div>Multiplicador: ${nivel.multiplicador}x | Recursos: ${nivel.recursos}</div>
                    <div style="margin-top: 4px;">${nivel.descricao}</div>
                </div>
            `;

            const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
            badge.textContent = pontosTexto;
            
            // Aplicar classe de cor
            badge.className = 'pontos-badge';
            if (valor > 0) {
                badge.classList.add('positivo');
            } else if (valor < 0) {
                badge.classList.add('negativo');
            }

            // Formatando a renda
            rendaElement.textContent = this.formatarMoeda(rendaMensal);
            rendaElement.style.color = nivel.cor;
        }
    }

    calcularRendaMensal(pontosRiqueza) {
        const nivel = this.obterNivelPorPontos(pontosRiqueza);
        return nivel ? nivel.rendaBase : 1000;
    }

    formatarMoeda(valor) {
        if (valor >= 1000000) {
            return `$${(valor / 1000000).toFixed(2)}M`;
        } else if (valor >= 1000) {
            return `$${(valor / 1000).toFixed(2)}K`;
        } else {
            return `$${valor.toLocaleString('en-US')}`;
        }
    }

    obterNivelPorPontos(pontos) {
        return Object.values(this.niveisRiqueza).find(nivel => nivel.pontos === pontos);
    }

    obterNomePorPontos(pontos) {
        const entry = Object.entries(this.niveisRiqueza).find(([key, nivel]) => nivel.pontos === pontos);
        return entry ? this.formatarNome(entry[0]) : 'Desconhecido';
    }

    formatarNome(key) {
        return key.split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    }

    getPontosRiqueza() {
        const select = document.getElementById('nivelRiqueza');
        return select ? parseInt(select.value) || 0 : 0;
    }

    getRendaMensal() {
        return this.calcularRendaMensal(this.getPontosRiqueza());
    }

    getTipoPontos() {
        const pontos = this.getPontosRiqueza();
        if (pontos > 0) return 'vantagem';
        if (pontos < 0) return 'desvantagem';
        return 'neutro';
    }

    notificarAtualizacao() {
        const pontos = this.getPontosRiqueza();
        const tipo = this.getTipoPontos();
        const renda = this.getRendaMensal();
        
        const evento = new CustomEvent('caracteristicasAtualizadas', {
            detail: {
                tipo: 'riqueza',
                pontos: pontos,
                tipoPontos: tipo,
                nivel: this.obterNomePorPontos(pontos),
                rendaMensal: renda,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
    }

    // LOCAL STORAGE
    salvarNoLocalStorage() {
        try {
            const dados = {
                nivelRiqueza: this.getPontosRiqueza(),
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gurps_riqueza', JSON.stringify(dados));
        } catch (error) {
            console.warn('Não foi possível salvar riqueza:', error);
        }
    }

    carregarDoLocalStorage() {
        try {
            const dadosSalvos = localStorage.getItem('gurps_riqueza');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                const select = document.getElementById('nivelRiqueza');
                if (select && dados.nivelRiqueza !== undefined) {
                    select.value = dados.nivelRiqueza;
                    return true;
                }
            }
        } catch (error) {
            console.warn('Não foi possível carregar riqueza:', error);
        }
        return false;
    }

    // EXPORTAÇÃO DE DADOS
    exportarDados() {
        const pontos = this.getPontosRiqueza();
        const nivel = this.obterNivelPorPontos(pontos);
        
        return {
            riqueza: {
                pontos: pontos,
                tipo: this.getTipoPontos(),
                nome: this.obterNomePorPontos(pontos),
                multiplicador: nivel?.multiplicador || 1,
                rendaMensal: this.getRendaMensal(),
                descricao: nivel?.descricao || '',
                icone: nivel?.icone || 'fas fa-user'
            }
        };
    }

    carregarDados(dados) {
        if (dados.riqueza && dados.riqueza.pontos !== undefined) {
            const select = document.getElementById('nivelRiqueza');
            if (select) {
                select.value = dados.riqueza.pontos;
                this.atualizarDisplay();
                return true;
            }
        }
        return false;
    }
}

// INICIALIZAÇÃO GLOBAL
let sistemaRiqueza = null;

function inicializarSistemaRiqueza() {
    if (!sistemaRiqueza) {
        sistemaRiqueza = new SistemaRiqueza();
    }
    sistemaRiqueza.inicializar();
    return sistemaRiqueza;
}

// EVENTOS DO DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar quando a aba de características for ativa
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'caracteristicas' && tab.classList.contains('active')) {
                    // Verificar se é a sub-aba correta
                    const subtabAtiva = document.querySelector('#subtab-social-aparencia.active');
                    if (subtabAtiva) {
                        setTimeout(inicializarSistemaRiqueza, 100);
                    }
                }
            }
        });
    });

    // Observar a aba principal
    const tabCaracteristicas = document.getElementById('caracteristicas');
    if (tabCaracteristicas) {
        observer.observe(tabCaracteristicas, { attributes: true });
    }
});

// Evento para troca de sub-abas
document.addEventListener('click', function(e) {
    if (e.target.closest('.subtab-btn')) {
        const btn = e.target.closest('.subtab-btn');
        const subtabId = btn.dataset.subtab;
        
        if (subtabId === 'social-aparencia') {
            setTimeout(inicializarSistemaRiqueza, 100);
        }
    }
});

// EXPORTAR PARA USO GLOBAL
window.SistemaRiqueza = SistemaRiqueza;
window.inicializarSistemaRiqueza = inicializarSistemaRiqueza;
window.sistemaRiqueza = sistemaRiqueza;