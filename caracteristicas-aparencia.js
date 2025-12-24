// caracteristicas-aparencia.js
// ===== SISTEMA DE APARÊNCIA - GURPS =====
// Baseado no código original fornecido

class SistemaAparencia {
    constructor() {
        // Níveis de aparência do GURPS
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

        this.nivelAtual = 'comum';
        this.pontosAtuais = 0;
        this.inicializado = false;
        
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
        
        console.log('🎭 Sistema de Aparência inicializando...');
        
        this.configurarEventos();
        this.atualizarDisplayAparencia();
        this.inicializado = true;
        this.notificarSistemaPontos();
        
        console.log('✅ Sistema de Aparência inicializado');
    }

    configurarEventos() {
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            // Configurar valor padrão (comum = 0 pontos)
            selectAparencia.value = '0';
            
            selectAparencia.addEventListener('change', (e) => {
                this.nivelAtual = this.obterNomePorPontos(parseInt(e.target.value));
                this.pontosAtuais = parseInt(e.target.value);
                this.atualizarDisplayAparencia();
                this.notificarSistemaPontos();
            });
        }
    }

    atualizarDisplayAparencia() {
        const select = document.getElementById('nivelAparencia');
        const display = document.getElementById('displayAparencia');
        const badge = document.getElementById('pontosAparencia');
        
        if (!select || !display || !badge) {
            console.error('❌ Elementos de aparência não encontrados!');
            return;
        }

        const valor = parseInt(select.value) || 0;
        const nivel = this.obterNivelPorPontos(valor);
        
        if (nivel) {
            let textoReacao = '';
            if (typeof nivel.reacao === 'object') {
                textoReacao = `<strong>Reação:</strong> +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
            } else {
                const sinal = nivel.reacao >= 0 ? '+' : '';
                textoReacao = `<strong>Reação:</strong> ${sinal}${nivel.reacao}`;
            }
            
            const textoPontos = valor >= 0 ? `+${valor}` : `${valor}`;
            const tipoTexto = nivel.tipo === 'vantagem' ? 'VANTAGEM' : 
                              nivel.tipo === 'desvantagem' ? 'DESVANTAGEM' : 'NEUTRO';
            
            display.innerHTML = `
                <div class="aparencia-nivel">
                    <i class="${nivel.icone}" style="color: ${nivel.cor}; font-size: 1.8rem;"></i>
                    <div>
                        <strong style="font-size: 1.3rem; color: ${nivel.cor};">${this.obterNomePorPontos(valor)}</strong>
                        <div style="font-size: 0.9em; color: ${nivel.tipo === 'vantagem' ? '#27ae60' : nivel.tipo === 'desvantagem' ? '#e74c3c' : '#95a5a6'};">
                            ${tipoTexto} | ${textoPontos} pontos
                        </div>
                    </div>
                </div>
                <div class="aparencia-detalhes">
                    <div>${textoReacao}</div>
                    <div style="margin-top: 10px;">${nivel.descricao}</div>
                </div>
            `;

            // Atualizar badge
            const pontosTexto = valor >= 0 ? `+${valor} pts` : `${valor} pts`;
            badge.textContent = pontosTexto;
            badge.style.background = nivel.cor;
            badge.style.color = '#fff';
            badge.style.fontWeight = 'bold';
            
            // Destacar visualmente
            const card = document.querySelector('.aparencia-card');
            if (card) {
                card.style.borderColor = nivel.cor;
                card.style.boxShadow = `0 0 20px ${nivel.cor}40`;
            }
        }
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

    notificarSistemaPontos() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        
        const evento = new CustomEvent('aparenciaPontosAtualizados', {
            detail: {
                pontos: pontos,
                tipo: tipo,
                nivel: this.obterNomePorPontos(pontos),
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
        
        // Também notificar o sistema principal de pontos
        this.notificarPontosTotais();
    }
    
    notificarPontosTotais() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        
        const evento = new CustomEvent('caracteristicasPontosAtualizados', {
            detail: {
                tipo: 'aparencia',
                pontos: pontos,
                custoAbsoluto: Math.abs(pontos),
                isVantagem: tipo === 'vantagem',
                isDesvantagem: tipo === 'desvantagem'
            }
        });
        document.dispatchEvent(evento);
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

    // ===== MÉTODOS PARA INTEGRAÇÃO =====
    
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
                custoAbsoluto: Math.abs(pontos)
            }
        };
    }

    carregarDados(dados) {
        if (dados.aparencia && dados.aparencia.pontos !== undefined) {
            const select = document.getElementById('nivelAparencia');
            if (select) {
                select.value = dados.aparencia.pontos;
                this.nivelAtual = dados.aparencia.nome;
                this.pontosAtuais = dados.aparencia.pontos;
                this.atualizarDisplayAparencia();
                this.notificarSistemaPontos();
                return true;
            }
        }
        return false;
    }

    resetarParaPadrao() {
        const select = document.getElementById('nivelAparencia');
        if (select) {
            select.value = '0'; // Comum
            this.nivelAtual = 'comum';
            this.pontosAtuais = 0;
            this.atualizarDisplayAparencia();
            this.notificarSistemaPontos();
        }
    }

    validarAparencia() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        const nome = this.obterNomePorPontos(pontos);
        
        return {
            valido: true,
            pontos: pontos,
            tipo: tipo,
            nome: nome,
            mensagem: `Aparência: ${nome} (${pontos >= 0 ? '+' : ''}${pontos} pts) - ${tipo === 'vantagem' ? '✅ Vantagem' : tipo === 'desvantagem' ? '🚫 Desvantagem' : '⚪ Neutro'}`
        };
    }
    
    // ===== MÉTODOS ÚTEIS =====
    
    getDescricaoCompleta() {
        const pontos = this.getPontosAparencia();
        const nivel = this.obterNivelPorPontos(pontos);
        const nome = this.obterNomePorPontos(pontos);
        
        let reacaoTexto = '';
        if (typeof nivel.reacao === 'object') {
            reacaoTexto = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
        } else {
            const sinal = nivel.reacao >= 0 ? '+' : '';
            reacaoTexto = `Reação: ${sinal}${nivel.reacao}`;
        }
        
        return {
            nome: nome,
            pontos: pontos,
            reacao: reacaoTexto,
            descricao: nivel.descricao,
            tipo: nivel.tipo,
            icone: nivel.icone,
            cor: nivel.cor
        };
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaAparencia;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    sistemaAparencia = new SistemaAparencia();
    
    // Também inicializar se a aba já estiver ativa
    const caracteristicasTab = document.getElementById('caracteristicas-tab');
    if (caracteristicasTab && caracteristicasTab.style.display !== 'none') {
        setTimeout(() => {
            if (sistemaAparencia && !sistemaAparencia.inicializado) {
                sistemaAparencia.inicializar();
            }
        }, 300);
    }
});

// ===== FUNÇÕES GLOBAIS PARA ACESSO =====
window.getPontosAparencia = function() {
    return sistemaAparencia ? sistemaAparencia.getPontosAparencia() : 0;
};

window.getAparenciaDetalhes = function() {
    return sistemaAparencia ? sistemaAparencia.getDescricaoCompleta() : null;
};

window.validarAparencia = function() {
    return sistemaAparencia ? sistemaAparencia.validarAparencia() : { valido: false, mensagem: 'Sistema não inicializado' };
};

// Exportar para uso em outros sistemas
window.SistemaAparencia = SistemaAparencia;
window.sistemaAparencia = sistemaAparencia;

console.log('📦 Sistema de Aparência carregado e pronto!');