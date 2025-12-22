// SISTEMA DE APARÊNCIA - VERSÃO FUNCIONAL COMPLETA
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
    }

    atualizarTudo(valor) {
        const nivel = this.niveis[valor];
        if (!nivel) return;

        const pontos = parseInt(valor);
        
        // 1. Atualizar badge de pontos
        this.atualizarBadgePontos(pontos, nivel.tipo);
        
        // 2. Atualizar display da aparência
        this.atualizarDisplayAparencia(nivel);
        
        // 3. Atualizar resumo na parte inferior
        this.atualizarResumoAparencia(pontos, nivel.tipo);
        
        // 4. Atualizar total da seção 1
        this.atualizarTotalSecao1(pontos, nivel.tipo);
        
        // 5. Notificar sistema de pontos
        this.notificarSistema(pontos, nivel.tipo, nivel.nome);
    }

    atualizarBadgePontos(pontos, tipo) {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) return;
        
        badge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        // Aplicar cores
        if (tipo === 'vantagem') {
            badge.style.background = 'linear-gradient(145deg, #27ae60, #2ecc71)';
            badge.style.color = 'white';
        } else if (tipo === 'desvantagem') {
            badge.style.background = 'linear-gradient(145deg, #e74c3c, #c0392b)';
            badge.style.color = 'white';
        } else {
            badge.style.background = 'linear-gradient(145deg, #95a5a6, #7f8c8d)';
            badge.style.color = 'white';
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
            <strong style="color: #ffd700;">${nivel.nome}</strong>
            <br><small style="color: #95a5a6;">${textoReacao}</small>
            <br><small style="color: #95a5a6;">${this.getDescricao(nivel.nome)}</small>
        `;
    }

    atualizarResumoAparencia(pontos, tipo) {
        const resumo = document.getElementById('resumoAparencia');
        if (!resumo) return;
        
        resumo.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        if (tipo === 'vantagem') {
            resumo.style.color = '#27ae60';
            resumo.style.fontWeight = 'bold';
        } else if (tipo === 'desvantagem') {
            resumo.style.color = '#e74c3c';
            resumo.style.fontWeight = 'bold';
        } else {
            resumo.style.color = '#95a5a6';
            resumo.style.fontWeight = 'normal';
        }
    }

    atualizarTotalSecao1(pontos, tipo) {
        const total = document.getElementById('totalSecao1');
        if (!total) return;
        
        total.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        if (tipo === 'vantagem') {
            total.style.background = 'rgba(39, 174, 96, 0.8)';
        } else if (tipo === 'desvantagem') {
            total.style.background = 'rgba(231, 76, 60, 0.8)';
        } else {
            total.style.background = 'rgba(212, 175, 55, 0.1)';
        }
    }

    notificarSistema(pontos, tipo, nome) {
        // Disparar evento para o dashboard
        const evento = new CustomEvent('pontosAparenciaAtualizados', {
            detail: {
                pontos: pontos,
                tipo: tipo,
                nome: nome,
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

    // Para integração com o dashboard
    getPontos() {
        const select = document.getElementById('nivelAparencia');
        return select ? parseInt(select.value) || 0 : 0;
    }

    getDados() {
        const valor = document.getElementById('nivelAparencia')?.value || '0';
        const nivel = this.niveis[valor];
        return {
            valor: valor,
            pontos: parseInt(valor),
            nome: nivel?.nome || 'Comum',
            tipo: nivel?.tipo || 'neutro'
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

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    window.sistemaAparencia = new SistemaAparencia();
});

// Para acesso global
window.SistemaAparencia = SistemaAparencia;