// caracteristicas-riqueza.js
// ===== SISTEMA DE RIQUEZA - GURPS =====
// Baseado no código original fornecido

class SistemaRiqueza {
    constructor() {
        // Níveis de riqueza do GURPS
        this.niveisRiqueza = {
            "falido": { 
                pontos: -25, 
                multiplicador: 0, 
                descricao: "Sem emprego, fonte de renda, dinheiro ou bens",
                recursos: "Nenhum",
                icone: "fas fa-skull-crossbones",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "pobre": { 
                pontos: -15, 
                multiplicador: 0.2, 
                descricao: "1/5 da riqueza média da sociedade",
                recursos: "Muito limitados",
                icone: "fas fa-house-damage",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "batalhador": { 
                pontos: -10, 
                multiplicador: 0.5, 
                descricao: "Metade da riqueza média",
                recursos: "Limitados",
                icone: "fas fa-hands-helping",
                tipo: "desvantagem",
                cor: "#e74c3c"
            },
            "medio": { 
                pontos: 0, 
                multiplicador: 1, 
                descricao: "Nível de recursos pré-definido padrão",
                recursos: "Padrão",
                icone: "fas fa-user",
                tipo: "neutro",
                cor: "#95a5a6"
            },
            "confortavel": { 
                pontos: 10, 
                multiplicador: 2, 
                descricao: "O dobro da riqueza média",
                recursos: "Confortáveis",
                icone: "fas fa-smile",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "rico": { 
                pontos: 20, 
                multiplicador: 5, 
                descricao: "5 vezes a riqueza média",
                recursos: "Abundantes",
                icone: "fas fa-grin-stars",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "muito-rico": { 
                pontos: 30, 
                multiplicador: 20, 
                descricao: "20 vezes a riqueza média", 
                recursos: "Extremamente abundantes",
                icone: "fas fa-crown",
                tipo: "vantagem",
                cor: "#27ae60"
            },
            "podre-rico": { 
                pontos: 50, 
                multiplicador: 100, 
                descricao: "100 vezes a riqueza média",
                recursos: "Ilimitados para necessidades comuns",
                icone: "fas fa-gem",
                tipo: "vantagem",
                cor: "#27ae60"
            }
        };

        this.rendaBase = 1000; // Renda base para cálculo
        this.inicializado = false;
        
        // Começa no padrão (médio)
        this.nivelAtual = 'medio';
        this.pontosAtuais = 0;
        
        // Inicializa quando a aba for carregada
        this.inicializarQuandoPronto();
    }

    inicializarQuandoPronto() {
        // Espera a aba de características ser carregada
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const tab = mutation.target;
                    if (tab.id === 'caracteristicas-tab' && tab.style.display !== 'none') {
                        setTimeout(() => {
                            if (!this.inicializado) {
                                this.inicializar();
                            }
                        }, 100);
                    }
                }
            });
        });

        const caracteristicasTab = document.getElementById('caracteristicas-tab');
        if (caracteristicasTab) {
            observer.observe(caracteristicasTab, { attributes: true });
        }
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('💰 Sistema de Riqueza inicializando...');
        
        this.configurarEventos();
        this.atualizarDisplayRiqueza();
        this.inicializado = true;
        this.notificarSistemaPontos();
        
        console.log('✅ Sistema de Riqueza inicializado');
    }

    configurarEventos() {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            // Configurar valor padrão (médio = 0 pontos)
            selectRiqueza.value = '0';
            
            selectRiqueza.addEventListener('change', () => {
                this.atualizarDisplayRiqueza();
                this.notificarSistemaPontos();
            });
        }
    }

    atualizarDisplayRiqueza() {
        const select = document.getElementById('nivelRiqueza');
        const display = document.getElementById('displayRiqueza');
        const badge = document.getElementById('pontosRiqueza');
        const rendaElement = document.getElementById('rendaMensal');
        
        if (!select || !display || !badge || !rendaElement) {
            console.error('❌ Elementos de riqueza não encontrados!');
            return;
        }

        const valor = parseInt(select.value) || 0;
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            const rendaMensal = this.calcularRendaMensal(valor);
            
            // Atualizar variáveis internas
            this.nivelAtual = this.obterNomePorPontos(valor);
            this.pontosAtuais = valor;
            
            const textoPontos = valor >= 0 ? `+${valor}` : `${valor}`;
            const tipoTexto = nivel.tipo === 'vantagem' ? 'VANTAGEM' : 
                              nivel.tipo === 'desvantagem' ? 'DESVANTAGEM' : 'NEUTRO';
            
            display.innerHTML = `
                <div class="riqueza-nivel">
                    <i class="${nivel.icone}" style="color: ${nivel.cor}; font-size: 1.8rem;"></i>
                    <div>
                        <strong style="font-size: 1.3rem; color: ${nivel.cor};">${this.obterNomePorPontos(valor)}</strong>
                        <div style="font-size: 0.9em; color: ${nivel.tipo === 'vantagem' ? '#27ae60' : nivel.tipo === 'desvantagem' ? '#e74c3c' : '#95a5a6'};">
                            ${tipoTexto} | ${textoPontos} pontos
                        </div>
                    </div>
                </div>
                <div class="riqueza-detalhes">
                    <div><strong>Multiplicador:</strong> ${nivel.multiplicador}x</div>
                    <div><strong>Recursos:</strong> ${nivel.recursos}</div>
                    <div style="margin-top: 10px;">${nivel.descricao}</div>
                </div>
            `;

            // Atualizar badge
            const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
            badge.textContent = pontosTexto;
            badge.style.background = nivel.cor;
            badge.style.color = '#fff';
            badge.style.fontWeight = 'bold';

            // Atualizar renda
            rendaElement.textContent = this.formatarMoeda(rendaMensal);
            rendaElement.style.color = nivel.cor;
            rendaElement.style.fontWeight = 'bold';
            
            // Destacar visualmente
            const card = document.querySelector('.riqueza-card');
            if (card) {
                card.style.borderColor = nivel.cor;
                card.style.boxShadow = `0 0 20px ${nivel.cor}40`;
            }
            
            this.ultimoPontos = valor;
        }
    }

    calcularRendaMensal(pontosRiqueza) {
        const nivel = this.obterNivelPorPontos(pontosRiqueza);
        if (!nivel) return 0;
        return Math.floor(this.rendaBase * nivel.multiplicador);
    }

    formatarMoeda(valor) {
        return `$${valor.toLocaleString('pt-BR')}`;
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

    notificarSistemaPontos() {
        const pontos = this.getPontosRiqueza();
        const tipo = this.getTipoPontos();
        
        const evento = new CustomEvent('riquezaPontosAtualizados', {
            detail: {
                pontos: pontos,
                tipo: tipo,
                nivel: this.obterNomePorPontos(pontos),
                rendaMensal: this.getRendaMensal(),
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
        
        // Também notificar o sistema principal de pontos
        this.notificarPontosTotais();
    }
    
    notificarPontosTotais() {
        const pontos = this.getPontosRiqueza();
        const tipo = this.getTipoPontos();
        
        const evento = new CustomEvent('caracteristicasPontosAtualizados', {
            detail: {
                tipo: 'riqueza',
                pontos: pontos,
                custoAbsoluto: Math.abs(pontos),
                isVantagem: tipo === 'vantagem',
                isDesvantagem: tipo === 'desvantagem',
                rendaMensal: this.getRendaMensal()
            }
        });
        document.dispatchEvent(evento);
    }

    // ===== MÉTODOS PARA INTEGRAÇÃO =====
    
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
                custoAbsoluto: Math.abs(pontos)
            }
        };
    }

    carregarDados(dados) {
        if (dados.riqueza && dados.riqueza.pontos !== undefined) {
            const select = document.getElementById('nivelRiqueza');
            if (select) {
                select.value = dados.riqueza.pontos;
                this.nivelAtual = dados.riqueza.nome;
                this.pontosAtuais = dados.riqueza.pontos;
                this.atualizarDisplayRiqueza();
                this.notificarSistemaPontos();
                return true;
            }
        }
        return false;
    }

    resetarParaPadrao() {
        const select = document.getElementById('nivelRiqueza');
        if (select) {
            select.value = '0'; // Médio
            this.nivelAtual = 'medio';
            this.pontosAtuais = 0;
            this.atualizarDisplayRiqueza();
            this.notificarSistemaPontos();
        }
    }

    validarRiqueza() {
        const pontos = this.getPontosRiqueza();
        const tipo = this.getTipoPontos();
        const nome = this.obterNomePorPontos(pontos);
        const renda = this.getRendaMensal();
        
        return {
            valido: true,
            pontos: pontos,
            tipo: tipo,
            nome: nome,
            rendaMensal: renda,
            mensagem: `Riqueza: ${nome} (${pontos >= 0 ? '+' : ''}${pontos} pts) | Renda: ${this.formatarMoeda(renda)} - ${tipo === 'vantagem' ? '✅ Vantagem' : tipo === 'desvantagem' ? '🚫 Desvantagem' : '⚪ Neutro'}`
        };
    }
    
    // ===== MÉTODOS ÚTEIS =====
    
    getDescricaoCompleta() {
        const pontos = this.getPontosRiqueza();
        const nivel = this.obterNivelPorPontos(pontos);
        const nome = this.obterNomePorPontos(pontos);
        
        return {
            nome: nome,
            pontos: pontos,
            multiplicador: nivel?.multiplicador || 1,
            rendaMensal: this.getRendaMensal(),
            recursos: nivel?.recursos || '',
            descricao: nivel?.descricao || '',
            tipo: nivel?.tipo || 'neutro',
            icone: nivel?.icone || 'fas fa-coins',
            cor: nivel?.cor || '#95a5a6'
        };
    }

    setRendaBase(novaRendaBase) {
        this.rendaBase = novaRendaBase;
        this.atualizarDisplayRiqueza();
        this.notificarSistemaPontos();
    }

    getRendaBase() {
        return this.rendaBase;
    }
    
    forcarAtualizacao() {
        this.atualizarDisplayRiqueza();
        this.notificarSistemaPontos();
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaRiqueza;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    sistemaRiqueza = new SistemaRiqueza();
    
    // Também inicializar se a aba já estiver ativa
    const caracteristicasTab = document.getElementById('caracteristicas-tab');
    if (caracteristicasTab && caracteristicasTab.style.display !== 'none') {
        setTimeout(() => {
            if (sistemaRiqueza && !sistemaRiqueza.inicializado) {
                sistemaRiqueza.inicializar();
            }
        }, 300);
    }
});

// ===== FUNÇÕES GLOBAIS PARA ACESSO =====
window.getPontosRiqueza = function() {
    return sistemaRiqueza ? sistemaRiqueza.getPontosRiqueza() : 0;
};

window.getRendaMensal = function() {
    return sistemaRiqueza ? sistemaRiqueza.getRendaMensal() : 0;
};

window.getRiquezaDetalhes = function() {
    return sistemaRiqueza ? sistemaRiqueza.getDescricaoCompleta() : null;
};

window.validarRiqueza = function() {
    return sistemaRiqueza ? sistemaRiqueza.validarRiqueza() : { valido: false, mensagem: 'Sistema não inicializado' };
};

// Exportar para uso em outros sistemas
window.SistemaRiqueza = SistemaRiqueza;
window.sistemaRiqueza = sistemaRiqueza;

console.log('📦 Sistema de Riqueza carregado e pronto!');