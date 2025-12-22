// ===========================================
// SISTEMA DE APARÊNCIA COMPLETO
// ===========================================

class SistemaAparencia {
    constructor() {
        this.niveis = {
            '-24': { nome: 'Horrendo', pontos: -24, tipo: 'desvantagem', reacao: -6 },
            '-20': { nome: 'Monstruoso', pontos: -20, tipo: 'desvantagem', reacao: -5 },
            '-16': { nome: 'Hediondo', pontos: -16, tipo: 'desvantagem', reacao: -4 },
            '-8': { nome: 'Feio', pontos: -8, tipo: 'desvantagem', reacao: -2 },
            '-4': { nome: 'Sem Atrativos', pontos: -4, tipo: 'desvantagem', reacao: -1 },
            '0': { nome: 'Comum', pontos: 0, tipo: 'neutro', reacao: 0 },
            '4': { nome: 'Atraente', pontos: 4, tipo: 'vantagem', reacao: 1 },
            '12': { nome: 'Elegante', pontos: 12, tipo: 'vantagem', reacao: { mesmo: 2, outro: 4 } },
            '16': { nome: 'Muito Elegante', pontos: 16, tipo: 'vantagem', reacao: { mesmo: 2, outro: 6 } },
            '20': { nome: 'Lindo', pontos: 20, tipo: 'vantagem', reacao: { mesmo: 2, outro: 8 } }
        };
        
        this.valorAtual = '0';
        this.inicializar();
    }

    inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurar());
        } else {
            this.configurar();
        }
    }

    configurar() {
        const selectAparencia = document.getElementById('nivelAparencia');
        
        if (!selectAparencia) {
            return;
        }

        selectAparencia.addEventListener('change', (e) => {
            this.valorAtual = e.target.value;
            this.atualizarTudo();
        });

        this.valorAtual = selectAparencia.value;
        this.atualizarTudo();
    }

    atualizarTudo() {
        const nivel = this.niveis[this.valorAtual];
        if (!nivel) return;

        this.atualizarBadgePontos(nivel);
        this.atualizarDisplayAparencia(nivel);
        this.atualizarResumoAparencia(nivel);
        this.atualizarTotalSecao1(nivel);
        this.dispararEventoAtualizacao(nivel);
    }

    atualizarBadgePontos(nivel) {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) return;

        const textoPontos = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        badge.textContent = textoPontos;

        if (nivel.tipo === 'vantagem') {
            badge.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
            badge.style.color = 'var(--text-light)';
        } else if (nivel.tipo === 'desvantagem') {
            badge.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
            badge.style.color = 'var(--text-light)';
        } else {
            badge.style.background = 'linear-gradient(145deg, var(--primary-gold), var(--secondary-gold))';
            badge.style.color = 'var(--primary-dark)';
        }
    }

    atualizarDisplayAparencia(nivel) {
        const display = document.getElementById('displayAparencia');
        if (!display) return;

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
        `;
    }

    atualizarResumoAparencia(nivel) {
        const resumo = document.getElementById('resumoAparencia');
        if (!resumo) return;

        const textoPontos = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        resumo.textContent = textoPontos;

        if (nivel.tipo === 'vantagem') {
            resumo.style.color = '#27ae60';
        } else if (nivel.tipo === 'desvantagem') {
            resumo.style.color = '#e74c3c';
        } else {
            resumo.style.color = 'var(--wood-light)';
        }
    }

    atualizarTotalSecao1(nivel) {
        const total = document.getElementById('totalSecao1');
        if (!total) return;

        const textoPontos = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        total.textContent = textoPontos;

        if (nivel.tipo === 'vantagem') {
            total.style.background = 'rgba(46, 92, 58, 0.8)';
        } else if (nivel.tipo === 'desvantagem') {
            total.style.background = 'rgba(139, 0, 0, 0.8)';
        } else {
            total.style.background = 'rgba(212, 175, 55, 0.1)';
        }
    }

    dispararEventoAtualizacao(nivel) {
        const evento = new CustomEvent('aparenciaAtualizada', {
            detail: {
                valor: this.valorAtual,
                pontos: nivel.pontos,
                tipo: nivel.tipo,
                nome: nivel.nome
            }
        });
        
        document.dispatchEvent(evento);
    }

    getDados() {
        const nivel = this.niveis[this.valorAtual];
        return {
            valor: this.valorAtual,
            pontos: nivel.pontos,
            tipo: nivel.tipo,
            nome: nivel.nome,
            reacao: nivel.reacao
        };
    }

    getPontos() {
        return this.niveis[this.valorAtual].pontos;
    }

    getTipo() {
        return this.niveis[this.valorAtual].tipo;
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
// INICIALIZAÇÃO
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    window.sistemaAparencia = new SistemaAparencia();
});

// ===========================================
// SISTEMA DE RIQUEZA
// ===========================================

class SistemaRiqueza {
    constructor() {
        this.niveis = {
            '-25': { nome: 'Falido', pontos: -25, multiplicador: 0.2 },
            '-15': { nome: 'Pobre', pontos: -15, multiplicador: 0.4 },
            '-10': { nome: 'Batalhador', pontos: -10, multiplicador: 0.6 },
            '0': { nome: 'Médio', pontos: 0, multiplicador: 1 },
            '10': { nome: 'Confortável', pontos: 10, multiplicador: 2 },
            '20': { nome: 'Rico', pontos: 20, multiplicador: 5 },
            '30': { nome: 'Muito Rico', pontos: 30, multiplicador: 10 },
            '50': { nome: 'Podre de Rico', pontos: 50, multiplicador: 20 }
        };
        
        this.valorAtual = '0';
        this.inicializar();
    }

    inicializar() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurar());
        } else {
            this.configurar();
        }
    }

    configurar() {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        
        if (!selectRiqueza) {
            return;
        }

        selectRiqueza.addEventListener('change', (e) => {
            this.valorAtual = e.target.value;
            this.atualizarTudo();
        });

        this.valorAtual = selectRiqueza.value;
        this.atualizarTudo();
    }

    atualizarTudo() {
        const nivel = this.niveis[this.valorAtual];
        if (!nivel) return;

        this.atualizarBadgePontos(nivel);
        this.atualizarDisplayRiqueza(nivel);
        this.atualizarResumoRiqueza(nivel);
        this.atualizarRendaMensal(nivel);
        this.dispararEventoAtualizacao(nivel);
    }

    atualizarBadgePontos(nivel) {
        const badge = document.getElementById('pontosRiqueza');
        if (!badge) return;

        const textoPontos = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        badge.textContent = textoPontos;

        if (nivel.pontos > 0) {
            badge.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
            badge.style.color = 'var(--text-light)';
        } else if (nivel.pontos < 0) {
            badge.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
            badge.style.color = 'var(--text-light)';
        } else {
            badge.style.background = 'linear-gradient(145deg, var(--primary-gold), var(--secondary-gold))';
            badge.style.color = 'var(--primary-dark)';
        }
    }

    atualizarDisplayRiqueza(nivel) {
        const display = document.getElementById('displayRiqueza');
        if (!display) return;

        display.innerHTML = `
            <strong style="color: var(--text-gold); font-size: 1.1rem;">${nivel.nome}</strong>
            <br>
            <small style="color: var(--text-light); opacity: 0.95;">Multiplicador: ${nivel.multiplicador}x | ${this.getDescricaoRiqueza(nivel.nome)}</small>
        `;
    }

    atualizarResumoRiqueza(nivel) {
        const resumo = document.getElementById('resumoRiqueza');
        if (!resumo) return;

        const textoPontos = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        resumo.textContent = textoPontos;

        if (nivel.pontos > 0) {
            resumo.style.color = '#27ae60';
        } else if (nivel.pontos < 0) {
            resumo.style.color = '#e74c3c';
        } else {
            resumo.style.color = 'var(--wood-light)';
        }
    }

    atualizarRendaMensal(nivel) {
        const rendaElement = document.getElementById('rendaMensal');
        if (!rendaElement) return;

        const rendaBase = 1000;
        const rendaCalculada = rendaBase * nivel.multiplicador;
        rendaElement.textContent = `$${rendaCalculada.toLocaleString()}`;
    }

    getDescricaoRiqueza(nome) {
        const descricoes = {
            'Falido': 'Vive de ajuda, sem recursos',
            'Pobre': 'Luta para sobreviver',
            'Batalhador': 'Ganha o suficiente',
            'Médio': 'Padrão de vida comum',
            'Confortável': 'Vida tranquila',
            'Rico': 'Muito bem de vida',
            'Muito Rico': 'Extremamente rico',
            'Podre de Rico': 'Fortuna colossal'
        };
        return descricoes[nome] || '';
    }

    dispararEventoAtualizacao(nivel) {
        const evento = new CustomEvent('riquezaAtualizada', {
            detail: {
                valor: this.valorAtual,
                pontos: nivel.pontos,
                nome: nivel.nome,
                multiplicador: nivel.multiplicador
            }
        });
        
        document.dispatchEvent(evento);
    }

    getDados() {
        const nivel = this.niveis[this.valorAtual];
        return {
            valor: this.valorAtual,
            pontos: nivel.pontos,
            nome: nivel.nome,
            multiplicador: nivel.multiplicador
        };
    }

    getPontos() {
        return this.niveis[this.valorAtual].pontos;
    }
}

// ===========================================
// INICIALIZAÇÃO COMPLETA
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistemas
    window.sistemaAparencia = new SistemaAparencia();
    window.sistemaRiqueza = new SistemaRiqueza();
    
    // Configurar evento para atualizar total
    document.addEventListener('aparenciaAtualizada', atualizarTotalCaracteristicas);
    document.addEventListener('riquezaAtualizada', atualizarTotalCaracteristicas);
    
    // Atualizar total inicial
    setTimeout(atualizarTotalCaracteristicas, 200);
});

function atualizarTotalCaracteristicas() {
    const totalElement = document.getElementById('totalCaracteristicas');
    if (!totalElement) return;

    // Calcular total
    let total = 0;
    
    if (window.sistemaAparencia) {
        total += window.sistemaAparencia.getPontos();
    }
    
    if (window.sistemaRiqueza) {
        total += window.sistemaRiqueza.getPontos();
    }
    
    // Atualizar display
    totalElement.textContent = total >= 0 ? `+${total} pts` : `${total} pts`;
    
    if (total > 0) {
        totalElement.style.color = '#27ae60';
    } else if (total < 0) {
        totalElement.style.color = '#e74c3c';
    } else {
        totalElement.style.color = 'var(--text-light)';
    }
}