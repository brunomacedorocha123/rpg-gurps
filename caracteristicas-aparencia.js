// ===========================================
// SISTEMA DE APARÊNCIA COMPLETO - GURPS
// ===========================================

class SistemaAparencia {
    constructor() {
        // Configuração dos níveis de aparência
        this.niveis = {
            '-24': { 
                nome: 'Horrendo', 
                pontos: -24, 
                tipo: 'desvantagem',
                reacao: -6,
                descricao: 'Indescritivelmente monstruoso ou repugnante'
            },
            '-20': { 
                nome: 'Monstruoso', 
                pontos: -20, 
                tipo: 'desvantagem',
                reacao: -5,
                descricao: 'Horrível e obviamente anormal'
            },
            '-16': { 
                nome: 'Hediondo', 
                pontos: -16, 
                tipo: 'desvantagem',
                reacao: -4,
                descricao: 'Característica repugnante na aparência'
            },
            '-8': { 
                nome: 'Feio', 
                pontos: -8, 
                tipo: 'desvantagem',
                reacao: -2,
                descricao: 'Cabelo seboso, dentes tortos, etc.'
            },
            '-4': { 
                nome: 'Sem Atrativos', 
                pontos: -4, 
                tipo: 'desvantagem',
                reacao: -1,
                descricao: 'Algo antipático, mas não específico'
            },
            '0': { 
                nome: 'Comum', 
                pontos: 0, 
                tipo: 'neutro',
                reacao: 0,
                descricao: 'Aparência padrão, sem modificadores'
            },
            '4': { 
                nome: 'Atraente', 
                pontos: 4, 
                tipo: 'vantagem',
                reacao: 1,
                descricao: 'Boa aparência, +1 em testes de reação'
            },
            '12': { 
                nome: 'Elegante', 
                pontos: 12, 
                tipo: 'vantagem',
                reacao: { mesmo: 2, outro: 4 },
                descricao: 'Poderia entrar em concursos de beleza'
            },
            '16': { 
                nome: 'Muito Elegante', 
                pontos: 16, 
                tipo: 'vantagem',
                reacao: { mesmo: 2, outro: 6 },
                descricao: 'Poderia vencer concursos de beleza'
            },
            '20': { 
                nome: 'Lindo', 
                pontos: 20, 
                tipo: 'vantagem',
                reacao: { mesmo: 2, outro: 8 },
                descricao: 'Espécime ideal, aparência divina'
            }
        };

        this.valorAtual = '0';
        this.pontosAtuais = 0;
        this.tipoAtual = 'neutro';
        
        this.inicializar();
    }

    inicializar() {
        // Esperar o DOM estar completamente pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurarSistema());
        } else {
            this.configurarSistema();
        }
    }

    configurarSistema() {
        // Verificar se estamos na aba de características
        const selectAparencia = document.getElementById('nivelAparencia');
        
        if (!selectAparencia) {
            console.warn('Elemento nivelAparencia não encontrado. Sistema de aparência não inicializado.');
            return;
        }

        // Configurar evento de mudança
        selectAparencia.addEventListener('change', (e) => {
            this.valorAtual = e.target.value;
            this.atualizarTudo();
        });

        // Configurar estado inicial
        this.valorAtual = selectAparencia.value;
        this.atualizarTudo();
    }

    atualizarTudo() {
        const nivel = this.niveis[this.valorAtual];
        if (!nivel) return;

        this.pontosAtuais = nivel.pontos;
        this.tipoAtual = nivel.tipo;

        // Atualizar todos os componentes
        this.atualizarBadgePontos();
        this.atualizarDisplayAparencia();
        this.atualizarResumoAparencia();
        this.atualizarTotalSecao1();
        this.verificarLimites();
        
        // Disparar evento para sistema principal
        this.dispararEventoAtualizacao();
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) return;

        const textoPontos = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        badge.textContent = textoPontos;

        // Aplicar cores baseadas no tipo
        if (this.tipoAtual === 'vantagem') {
            badge.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
            badge.style.color = 'var(--text-light)';
            badge.style.borderColor = '#27ae60';
        } else if (this.tipoAtual === 'desvantagem') {
            badge.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
            badge.style.color = 'var(--text-light)';
            badge.style.borderColor = '#e74c3c';
        } else {
            badge.style.background = 'linear-gradient(145deg, var(--primary-gold), var(--secondary-gold))';
            badge.style.color = 'var(--primary-dark)';
            badge.style.borderColor = 'var(--primary-gold)';
        }
    }

    atualizarDisplayAparencia() {
        const display = document.getElementById('displayAparencia');
        const nivel = this.niveis[this.valorAtual];
        
        if (!display || !nivel) return;

        let textoReacao = '';
        if (typeof nivel.reacao === 'object') {
            textoReacao = `Reação: +${nivel.reacao.mesmo} (mesmo sexo), +${nivel.reacao.outro} (outro sexo)`;
        } else {
            textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
        }

        display.innerHTML = `
            <strong style="color: var(--text-gold); font-size: 1.1rem;">${nivel.nome}</strong>
            <br>
            <small style="color: var(--text-light); opacity: 0.95;">${textoReacao}</small>
            <br>
            <small style="color: var(--text-light); opacity: 0.85; font-style: italic;">${nivel.descricao}</small>
        `;
    }

    atualizarResumoAparencia() {
        const resumo = document.getElementById('resumoAparencia');
        if (!resumo) return;

        const textoPontos = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        resumo.textContent = textoPontos;

        if (this.tipoAtual === 'vantagem') {
            resumo.style.color = '#27ae60';
            resumo.style.fontWeight = 'bold';
        } else if (this.tipoAtual === 'desvantagem') {
            resumo.style.color = '#e74c3c';
            resumo.style.fontWeight = 'bold';
        } else {
            resumo.style.color = 'var(--wood-light)';
            resumo.style.fontWeight = 'normal';
        }
    }

    atualizarTotalSecao1() {
        const total = document.getElementById('totalSecao1');
        if (!total) return;

        const textoPontos = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        total.textContent = textoPontos;

        if (this.tipoAtual === 'vantagem') {
            total.style.background = 'rgba(46, 92, 58, 0.8)';
            total.style.borderColor = '#27ae60';
        } else if (this.tipoAtual === 'desvantagem') {
            total.style.background = 'rgba(139, 0, 0, 0.8)';
            total.style.borderColor = '#e74c3c';
        } else {
            total.style.background = 'rgba(212, 175, 55, 0.1)';
            total.style.borderColor = 'var(--primary-gold)';
        }
    }

    verificarLimites() {
        // Verificar se excede o limite de desvantagens (-50)
        if (this.pontosAtuais < -50) {
            this.mostrarAlertaLimite();
        }
    }

    mostrarAlertaLimite() {
        // Criar ou atualizar alerta
        let alerta = document.getElementById('alertaLimiteAparencia');
        
        if (!alerta) {
            alerta = document.createElement('div');
            alerta.id = 'alertaLimiteAparencia';
            alerta.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                background: linear-gradient(145deg, #8b0000, #e74c3c);
                color: var(--text-light);
                padding: 15px 20px;
                border-radius: 8px;
                border-left: 4px solid var(--text-gold);
                box-shadow: 0 5px 15px rgba(139, 0, 0, 0.4);
                z-index: 9999;
                max-width: 350px;
                font-family: 'Cinzel', serif;
                animation: slideInRight 0.3s ease;
            `;
            
            document.body.appendChild(alerta);
        }

        alerta.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.3rem;">⚠️</span>
                <div>
                    <strong style="color: var(--text-gold);">Limite Excedido!</strong>
                    <p style="margin: 5px 0 0 0; font-size: 0.9em;">
                        Aparência excede o limite de -50 pontos para desvantagens.
                    </p>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; cursor: pointer; margin-left: auto;">
                    ✕
                </button>
            </div>
        `;

        // Remover alerta após 5 segundos
        setTimeout(() => {
            if (alerta && alerta.parentElement) {
                alerta.remove();
            }
        }, 5000);
    }

    dispararEventoAtualizacao() {
        const nivel = this.niveis[this.valorAtual];
        
        const evento = new CustomEvent('aparenciaAtualizada', {
            detail: {
                valor: this.valorAtual,
                pontos: this.pontosAtuais,
                tipo: this.tipoAtual,
                nome: nivel.nome,
                reacao: nivel.reacao,
                descricao: nivel.descricao,
                timestamp: new Date().toISOString()
            }
        });
        
        document.dispatchEvent(evento);
    }

    // Métodos públicos para integração
    getDados() {
        const nivel = this.niveis[this.valorAtual];
        return {
            valor: this.valorAtual,
            pontos: this.pontosAtuais,
            tipo: this.tipoAtual,
            nome: nivel.nome,
            reacao: nivel.reacao,
            descricao: nivel.descricao
        };
    }

    getPontos() {
        return this.pontosAtuais;
    }

    getTipo() {
        return this.tipoAtual;
    }

    carregarDados(dados) {
        if (!dados || !dados.valor) return;
        
        const select = document.getElementById('nivelAparencia');
        if (select) {
            select.value = dados.valor;
            this.valorAtual = dados.valor;
            this.atualizarTudo();
        }
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página correta
    const caracteristicasTab = document.getElementById('caracteristicas');
    const selectAparencia = document.getElementById('nivelAparencia');
    
    if (caracteristicasTab || selectAparencia) {
        window.sistemaAparencia = new SistemaAparencia();
        console.log('✅ Sistema de Aparência inicializado com sucesso');
    }
});

// Exportar para uso global
window.SistemaAparencia = SistemaAparencia;

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    /* Badge de pontos com animação */
    #pontosAparencia {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);