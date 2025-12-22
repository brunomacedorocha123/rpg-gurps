// ===========================================
// SISTEMA DE APARÊNCIA - COMPLETO E FUNCIONAL
// ===========================================
class SistemaAparencia {
    constructor() {
        this.niveis = {
            '-24': { nome: 'Horrendo', reacao: -6, tipo: 'desvantagem' },
            '-20': { nome: 'Monstruoso', reacao: -5, tipo: 'desvantagem' },
            '-16': { nome: 'Hediondo', reacao: -4, tipo: 'desvantagem' },
            '-8': { nome: 'Feio', reacao: -2, tipo: 'desvantagem' },
            '-4': { nome: 'Sem Atrativos', reacao: -1, tipo: 'desvantagem' },
            '0': { nome: 'Comum', reacao: 0, tipo: 'neutro' },
            '4': { nome: 'Atraente', reacao: 1, tipo: 'vantagem' },
            '12': { nome: 'Elegante', reacao: { mesmo: 2, outro: 4 }, tipo: 'vantagem' },
            '16': { nome: 'Muito Elegante', reacao: { mesmo: 2, outro: 6 }, tipo: 'vantagem' },
            '20': { nome: 'Lindo', reacao: { mesmo: 2, outro: 8 }, tipo: 'vantagem' }
        };
        
        this.pontos = 0;
        this.tipo = 'neutro';
        this.inicializar();
    }

    inicializar() {
        // Configurar evento do select
        const select = document.getElementById('nivelAparencia');
        if (select) {
            select.addEventListener('change', (e) => this.atualizarTudo(e.target.value));
            // Atualizar estado inicial
            this.atualizarTudo(select.value);
        }
        
        // Configurar eventos do dashboard
        this.configurarEventosDashboard();
    }
    
    configurarEventosDashboard() {
        // Atualizar quando os pontos totais mudarem
        const pontosInput = document.getElementById('pontosTotais');
        if (pontosInput) {
            pontosInput.addEventListener('change', () => this.atualizarDashboard());
        }
    }

    atualizarTudo(valor) {
        const nivel = this.niveis[valor];
        if (!nivel) return;

        this.pontos = parseInt(valor);
        this.tipo = nivel.tipo;
        
        // 1. Atualizar badge de pontos
        this.atualizarBadgePontos();
        
        // 2. Atualizar display da aparência
        this.atualizarDisplayAparencia(nivel);
        
        // 3. Atualizar resumo na parte inferior
        this.atualizarResumoAparencia();
        
        // 4. Atualizar total da seção 1
        this.atualizarTotalSecao1();
        
        // 5. Atualizar dashboard
        this.atualizarDashboard();
        
        // 6. Disparar evento global
        this.dispararEventoGlobal();
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) return;
        
        badge.textContent = this.pontos >= 0 ? `+${this.pontos} pts` : `${this.pontos} pts`;
        
        // Aplicar cores
        if (this.tipo === 'vantagem') {
            badge.style.background = 'linear-gradient(145deg, var(--accent-green), #1e4028)';
            badge.style.color = 'white';
        } else if (this.tipo === 'desvantagem') {
            badge.style.background = 'linear-gradient(145deg, var(--accent-red), #6b0000)';
            badge.style.color = 'white';
        } else {
            badge.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(139, 0, 0, 0.1))';
            badge.style.color = 'var(--text-light)';
        }
    }

    atualizarDisplayAparencia(nivel) {
        const display = document.getElementById('displayAparencia');
        if (!display) return;
        
        let textoReacao = '';
        if (typeof nivel.reacao === 'object') {
            textoReacao = `Reação: +${nivel.reacao.outro} (outro sexo), +${nivel.reacao.mesmo} (mesmo sexo)`;
        } else {
            textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
        }
        
        display.innerHTML = `
            <strong style="color: var(--text-gold);">${nivel.nome}</strong>
            <br><small style="color: var(--wood-light);">${textoReacao}</small>
            <br><small style="color: var(--wood-light);">${this.getDescricao(nivel.nome)}</small>
        `;
    }

    atualizarResumoAparencia() {
        const resumo = document.getElementById('resumoAparencia');
        if (!resumo) return;
        
        resumo.textContent = this.pontos >= 0 ? `+${this.pontos} pts` : `${this.pontos} pts`;
        
        if (this.tipo === 'vantagem') {
            resumo.style.color = 'var(--accent-green)';
            resumo.style.fontWeight = 'bold';
        } else if (this.tipo === 'desvantagem') {
            resumo.style.color = 'var(--accent-red)';
            resumo.style.fontWeight = 'bold';
        } else {
            resumo.style.color = 'var(--wood-light)';
            resumo.style.fontWeight = 'normal';
        }
    }

    atualizarTotalSecao1() {
        const total = document.getElementById('totalSecao1');
        if (!total) return;
        
        total.textContent = this.pontos >= 0 ? `+${this.pontos} pts` : `${this.pontos} pts`;
        
        if (this.tipo === 'vantagem') {
            total.style.background = 'rgba(46, 92, 58, 0.8)';
        } else if (this.tipo === 'desvantagem') {
            total.style.background = 'rgba(139, 0, 0, 0.8)';
        } else {
            total.style.background = 'rgba(212, 175, 55, 0.1)';
        }
    }
    
    atualizarDashboard() {
        // Atualizar gastos em características no dashboard
        const gastosCaracteristicas = document.getElementById('gastosPeculiaridades');
        if (gastosCaracteristicas) {
            gastosCaracteristicas.textContent = this.pontos;
        }
        
        // Atualizar total líquido
        this.atualizarTotalLiquido();
        
        // Atualizar saldo disponível
        this.atualizarSaldoDisponivel();
        
        // Atualizar distribuição de pontos
        this.atualizarDistribuicao();
    }
    
    atualizarTotalLiquido() {
        const totalElement = document.getElementById('totalLiquido');
        if (!totalElement) return;
        
        // Pega os pontos totais configurados
        const pontosTotais = parseInt(document.getElementById('pontosTotais')?.value || 150);
        
        // Aqui vamos calcular com base em todos os gastos
        // Por enquanto, apenas aparência
        const totalGasto = this.pontos;
        
        totalElement.textContent = totalGasto;
        
        // Marcar se está acima do limite
        if (this.pontos < 0 && Math.abs(this.pontos) > 50) {
            totalElement.style.color = 'var(--accent-red)';
        } else if (this.pontos > pontosTotais) {
            totalElement.style.color = 'var(--accent-red)';
        } else {
            totalElement.style.color = 'var(--text-gold)';
        }
    }
    
    atualizarSaldoDisponivel() {
        const saldoElement = document.getElementById('saldoDisponivel');
        if (!saldoElement) return;
        
        const pontosTotais = parseInt(document.getElementById('pontosTotais')?.value || 150);
        const saldo = pontosTotais - this.pontos;
        
        saldoElement.textContent = saldo;
        
        if (saldo < 0) {
            saldoElement.style.color = 'var(--accent-red)';
        } else if (saldo < 30) {
            saldoElement.style.color = 'var(--secondary-gold)';
        } else {
            saldoElement.style.color = 'var(--text-light)';
        }
    }
    
    atualizarDistribuicao() {
        const pontosTotais = parseInt(document.getElementById('pontosTotais')?.value || 150);
        
        // Atualizar barra de distribuição para características
        const barra = document.getElementById('distribOutros');
        const valor = document.getElementById('distribOutrosValor');
        
        if (barra && valor) {
            const percentual = Math.abs(this.pontos) / pontosTotais * 100;
            const percentualLimitado = Math.min(percentual, 100);
            
            barra.style.width = `${percentualLimitado}%`;
            
            if (this.tipo === 'vantagem') {
                barra.style.background = 'linear-gradient(90deg, var(--accent-green), #27ae60)';
            } else if (this.tipo === 'desvantagem') {
                barra.style.background = 'linear-gradient(90deg, var(--accent-red), #c0392b)';
            } else {
                barra.style.background = 'var(--wood-light)';
            }
            
            valor.textContent = `${percentualLimitado.toFixed(1)}%`;
        }
    }

    dispararEventoGlobal() {
        const select = document.getElementById('nivelAparencia');
        const valor = select ? select.value : '0';
        const nivel = this.niveis[valor];
        
        // Evento para o sistema principal
        const evento = new CustomEvent('aparenciaAtualizada', {
            detail: {
                pontos: this.pontos,
                tipo: this.tipo,
                nome: nivel?.nome || 'Comum',
                valor: valor,
                reacao: nivel?.reacao || 0,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
    }

    getDescricao(nome) {
        const descricoes = {
            'Horrendo': 'Indescritivelmente monstruoso ou repugnante',
            'Monstruoso': 'Horrível e obviamente anormal',
            'Hediondo': 'Característica repugnante na aparência',
            'Feio': 'Cabelo seboso, dentes tortos, etc.',
            'Sem Atrativos': 'Algo antipático, mas não específico',
            'Comum': 'Aparência padrão, sem modificadores',
            'Atraente': 'Boa aparência, +1 em testes de reação',
            'Elegante': 'Poderia entrar em concursos de beleza',
            'Muito Elegante': 'Poderia vencer concursos de beleza',
            'Lindo': 'Espécime ideal, aparência divina'
        };
        return descricoes[nome] || '';
    }

    // Para integração com o sistema principal
    getPontos() {
        return this.pontos;
    }

    getTipo() {
        return this.tipo;
    }

    getDados() {
        const valor = document.getElementById('nivelAparencia')?.value || '0';
        const nivel = this.niveis[valor];
        return {
            valor: valor,
            pontos: this.pontos,
            nome: nivel?.nome || 'Comum',
            tipo: this.tipo,
            reacao: nivel?.reacao || 0,
            descricao: this.getDescricao(nivel?.nome)
        };
    }

    carregarDados(dados) {
        if (!dados || !dados.valor) return;
        
        const select = document.getElementById('nivelAparencia');
        if (select) {
            select.value = dados.valor;
            this.atualizarTudo(dados.valor);
        }
    }
}

// ===========================================
// INTEGRAÇÃO COM O SISTEMA PRINCIPAL
// ===========================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar sistema de aparência
    window.sistemaAparencia = new SistemaAparencia();
    
    // Configurar integração com o sistema principal
    configurarIntegracaoPrincipal();
});

function configurarIntegracaoPrincipal() {
    // Quando aparência mudar, atualizar sistema de vantagens/desvantagens
    document.addEventListener('aparenciaAtualizada', (e) => {
        const detalhes = e.detail;
        
        // Atualizar na aba de vantagens/desvantagens
        atualizarVantagensDesvantagens(detalhes);
        
        // Atualizar no resumo do personagem
        atualizarResumoPersonagem(detalhes);
    });
    
    // Quando os pontos totais mudarem no dashboard
    const pontosTotaisInput = document.getElementById('pontosTotais');
    if (pontosTotaisInput) {
        pontosTotaisInput.addEventListener('change', () => {
            if (window.sistemaAparencia) {
                window.sistemaAparencia.atualizarDashboard();
            }
        });
    }
}

function atualizarVantagensDesvantagens(detalhes) {
    // Esta função será chamada quando tivermos a aba de vantagens/desvantagens
    // Por enquanto, apenas marca que temos dados
    console.log('Aparência atualizada para:', detalhes);
}

function atualizarResumoPersonagem(detalhes) {
    // Atualizar o nome da aparência no dashboard
    const nivelAparenciaElement = document.getElementById('nivelAparencia');
    if (nivelAparenciaElement) {
        nivelAparenciaElement.textContent = detalhes.nome;
    }
}

// Para acesso global
window.SistemaAparencia = SistemaAparencia;