// ===========================================
// CARACTERÍSTICAS-APARENCIA.JS
// Sistema de aparência física com sub-abas
// ===========================================

class SistemaAparencia {
    constructor() {
        this.niveisAparencia = {
            "horrendo": { 
                pontos: -24, 
                reacao: -6, 
                descricao: "Indescritivelmente monstruoso ou repugnante",
                icone: "fas fa-frown",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "monstruoso": { 
                pontos: -20, 
                reacao: -5, 
                descricao: "Horrível e obviamente anormal",
                icone: "fas fa-ghost",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "hediondo": { 
                pontos: -16, 
                reacao: -4, 
                descricao: "Característica repugnante na aparência",
                icone: "fas fa-meh-rolling-eyes",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "feio": { 
                pontos: -8, 
                reacao: -2, 
                descricao: "Cabelo seboso, dentes tortos, etc.",
                icone: "fas fa-meh",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "sem-atrativos": { 
                pontos: -4, 
                reacao: -1, 
                descricao: "Algo antipático, mas não específico",
                icone: "fas fa-meh-blank",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "comum": { 
                pontos: 0, 
                reacao: 0, 
                descricao: "Aparência padrão, sem modificadores",
                icone: "fas fa-user",
                tipo: "neutro",
                cor: "#95a5a6"
            },
            "atraente": { 
                pontos: 4, 
                reacao: 1, 
                descricao: "Boa aparência, +1 em testes de reação",
                icone: "fas fa-smile",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "elegante": { 
                pontos: 12, 
                reacao: { mesmoSexo: 2, outroSexo: 4 },
                descricao: "Poderia entrar em concursos de beleza",
                icone: "fas fa-grin-stars",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "muito-elegante": { 
                pontos: 16, 
                reacao: { mesmoSexo: 2, outroSexo: 6 },
                descricao: "Poderia vencer concursos de beleza",
                icone: "fas fa-crown",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "lindo": { 
                pontos: 20, 
                reacao: { mesmoSexo: 2, outroSexo: 8 },
                descricao: "Espécime ideal, aparência divina",
                icone: "fas fa-star",
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
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            selectAparencia.addEventListener('change', (e) => {
                this.atualizarDisplay();
                this.salvarNoLocalStorage();
                this.notificarAtualizacao();
            });
        }
    }

    atualizarDisplay() {
        const select = document.getElementById('nivelAparencia');
        const display = document.getElementById('displayAparencia');
        const badge = document.getElementById('pontosAparencia');
        
        if (!select || !display || !badge) return;

        const valor = parseInt(select.value) || 0;
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            let textoReacao = '';
            if (typeof nivel.reacao === 'object') {
                textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
            } else {
                textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
            }
            
            display.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                    <i class="${nivel.icone}" style="color: ${nivel.cor}; font-size: 1.5rem;"></i>
                    <strong style="color: var(--text-gold);">${this.obterNomePorPontos(valor)}</strong>
                </div>
                <div style="font-size: 0.9em; color: var(--text-light); opacity: 0.8;">
                    <div>${textoReacao}</div>
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
        }
    }

    obterNivelPorPontos(pontos) {
        return Object.values(this.niveisAparencia).find(nivel => nivel.pontos === pontos);
    }

    obterNomePorPontos(pontos) {
        const entry = Object.entries(this.niveisAparencia).find(([key, nivel]) => nivel.pontos === pontos);
        return entry ? this.formatarNome(entry[0]) : 'Desconhecido';
    }

    formatarNome(key) {
        return key.split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
    }

    getPontosAparencia() {
        const select = document.getElementById('nivelAparencia');
        return select ? parseInt(select.value) || 0 : 0;
    }

    getTipoPontos() {
        const pontos = this.getPontosAparencia();
        if (pontos > 0) return 'vantagem';
        if (pontos < 0) return 'desvantagem';
        return 'neutro';
    }

    notificarAtualizacao() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        
        const evento = new CustomEvent('caracteristicasAtualizadas', {
            detail: {
                tipo: 'aparencia',
                pontos: pontos,
                tipoPontos: tipo,
                nivel: this.obterNomePorPontos(pontos),
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
    }

    // LOCAL STORAGE
    salvarNoLocalStorage() {
        try {
            const dados = {
                nivelAparencia: this.getPontosAparencia(),
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gurps_aparencia', JSON.stringify(dados));
        } catch (error) {
            console.warn('Não foi possível salvar aparência:', error);
        }
    }

    carregarDoLocalStorage() {
        try {
            const dadosSalvos = localStorage.getItem('gurps_aparencia');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                const select = document.getElementById('nivelAparencia');
                if (select && dados.nivelAparencia !== undefined) {
                    select.value = dados.nivelAparencia;
                    return true;
                }
            }
        } catch (error) {
            console.warn('Não foi possível carregar aparência:', error);
        }
        return false;
    }

    // EXPORTAÇÃO DE DADOS
    exportarDados() {
        const pontos = this.getPontosAparencia();
        const nivel = this.obterNivelPorPontos(pontos);
        
        return {
            aparencia: {
                pontos: pontos,
                tipo: this.getTipoPontos(),
                nome: this.obterNomePorPontos(pontos),
                descricao: nivel?.descricao || '',
                reacao: nivel?.reacao || 0,
                icone: nivel?.icone || 'fas fa-user'
            }
        };
    }

    carregarDados(dados) {
        if (dados.aparencia && dados.aparencia.pontos !== undefined) {
            const select = document.getElementById('nivelAparencia');
            if (select) {
                select.value = dados.aparencia.pontos;
                this.atualizarDisplay();
                return true;
            }
        }
        return false;
    }
}

// INICIALIZAÇÃO GLOBAL
let sistemaAparencia = null;

function inicializarSistemaAparencia() {
    if (!sistemaAparencia) {
        sistemaAparencia = new SistemaAparencia();
    }
    sistemaAparencia.inicializar();
    return sistemaAparencia;
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
                        setTimeout(inicializarSistemaAparencia, 100);
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
            setTimeout(inicializarSistemaAparencia, 100);
        }
    }
});

// EXPORTAR PARA USO GLOBAL
window.SistemaAparencia = SistemaAparencia;
window.inicializarSistemaAparencia = inicializarSistemaAparencia;
window.sistemaAparencia = sistemaAparencia;