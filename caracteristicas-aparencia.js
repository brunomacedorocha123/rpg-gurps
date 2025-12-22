/**
 * SISTEMA DE APARÊNCIA FÍSICA
 * Sistema completo para gerenciamento de níveis de aparência
 */

class SistemaAparencia {
    constructor() {
        this.niveis = {
            '-24': {
                nome: 'Horrendo',
                pontos: -24,
                reacao: -6,
                descricao: 'Indescritivelmente monstruoso ou repugnante',
                icone: 'fas fa-frown',
                tipo: 'desvantagem'
            },
            '-20': {
                nome: 'Monstruoso',
                pontos: -20,
                reacao: -5,
                descricao: 'Horrível e obviamente anormal',
                icone: 'fas fa-ghost',
                tipo: 'desvantagem'
            },
            '-16': {
                nome: 'Hediondo',
                pontos: -16,
                reacao: -4,
                descricao: 'Característica repugnante na aparência',
                icone: 'fas fa-meh-rolling-eyes',
                tipo: 'desvantagem'
            },
            '-8': {
                nome: 'Feio',
                pontos: -8,
                reacao: -2,
                descricao: 'Cabelo seboso, dentes tortos, etc.',
                icone: 'fas fa-meh',
                tipo: 'desvantagem'
            },
            '-4': {
                nome: 'Sem Atrativos',
                pontos: -4,
                reacao: -1,
                descricao: 'Algo antipático, mas não específico',
                icone: 'fas fa-meh-blank',
                tipo: 'desvantagem'
            },
            '0': {
                nome: 'Comum',
                pontos: 0,
                reacao: 0,
                descricao: 'Aparência padrão, sem modificadores',
                icone: 'fas fa-user',
                tipo: 'neutro'
            },
            '4': {
                nome: 'Atraente',
                pontos: 4,
                reacao: 1,
                descricao: 'Boa aparência, +1 em testes de reação',
                icone: 'fas fa-smile',
                tipo: 'vantagem'
            },
            '12': {
                nome: 'Elegante',
                pontos: 12,
                reacao: { mesmoSexo: 2, outroSexo: 4 },
                descricao: 'Poderia entrar em concursos de beleza',
                icone: 'fas fa-grin-stars',
                tipo: 'vantagem'
            },
            '16': {
                nome: 'Muito Elegante',
                pontos: 16,
                reacao: { mesmoSexo: 2, outroSexo: 6 },
                descricao: 'Poderia vencer concursos de beleza',
                icone: 'fas fa-crown',
                tipo: 'vantagem'
            },
            '20': {
                nome: 'Lindo',
                pontos: 20,
                reacao: { mesmoSexo: 2, outroSexo: 8 },
                descricao: 'Espécime ideal, aparência divina',
                icone: 'fas fa-star',
                tipo: 'vantagem'
            }
        };

        this.valorAtual = '0';
        this.pontosAtuais = 0;
        this.inicializado = false;
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarInterface();
        this.atualizarResumo();
        this.atualizarTotalSecao();
        
        this.inicializado = true;
    }

    configurarEventos() {
        const select = document.getElementById('nivelAparencia');
        if (!select) return;

        select.addEventListener('change', (e) => {
            this.valorAtual = e.target.value;
            this.pontosAtuais = parseInt(this.valorAtual);
            
            this.atualizarInterface();
            this.atualizarResumo();
            this.atualizarTotalSecao();
            this.notificarSistemaPontos();
        });
    }

    atualizarInterface() {
        const select = document.getElementById('nivelAparencia');
        const display = document.getElementById('displayAparencia');
        const badge = document.getElementById('pontosAparencia');
        
        if (!select || !display || !badge) return;

        const nivel = this.niveis[this.valorAtual];
        if (!nivel) return;

        // Atualizar badge de pontos
        const pontosTexto = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        badge.textContent = pontosTexto;
        
        // Aplicar cor baseada no tipo
        if (nivel.tipo === 'vantagem') {
            badge.style.background = 'linear-gradient(145deg, #27ae60, #2ecc71)';
            badge.style.color = 'white';
        } else if (nivel.tipo === 'desvantagem') {
            badge.style.background = 'linear-gradient(145deg, #e74c3c, #c0392b)';
            badge.style.color = 'white';
        } else {
            badge.style.background = 'linear-gradient(145deg, #95a5a6, #7f8c8d)';
            badge.style.color = 'white';
        }

        // Atualizar display de informação
        let textoReacao = '';
        if (typeof nivel.reacao === 'object') {
            textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
        } else {
            textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
        }
        
        display.innerHTML = `
            <strong style="color: #ffd700;">${nivel.nome}</strong>
            <br><small style="color: #95a5a6;">${textoReacao}</small>
            <br><small style="color: #95a5a6;">${nivel.descricao}</small>
        `;
    }

    atualizarResumo() {
        const resumoElement = document.getElementById('resumoAparencia');
        if (!resumoElement) return;

        const nivel = this.niveis[this.valorAtual];
        if (!nivel) return;

        const pontosTexto = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        resumoElement.textContent = pontosTexto;
        
        // Aplicar cor baseada no tipo
        if (nivel.tipo === 'vantagem') {
            resumoElement.style.color = '#27ae60';
            resumoElement.style.fontWeight = 'bold';
        } else if (nivel.tipo === 'desvantagem') {
            resumoElement.style.color = '#e74c3c';
            resumoElement.style.fontWeight = 'bold';
        } else {
            resumoElement.style.color = '#95a5a6';
            resumoElement.style.fontWeight = 'normal';
        }
    }

    atualizarTotalSecao() {
        const totalElement = document.getElementById('totalSecao1');
        if (!totalElement) return;

        const nivel = this.niveis[this.valorAtual];
        if (!nivel) return;

        const totalPontos = nivel.pontos;
        totalElement.textContent = totalPontos >= 0 ? `+${totalPontos} pts` : `${totalPontos} pts`;
        
        // Aplicar cor baseada no tipo
        if (nivel.tipo === 'vantagem') {
            totalElement.style.background = 'rgba(39, 174, 96, 0.8)';
        } else if (nivel.tipo === 'desvantagem') {
            totalElement.style.background = 'rgba(231, 76, 60, 0.8)';
        } else {
            totalElement.style.background = 'rgba(212, 175, 55, 0.1)';
        }
    }

    notificarSistemaPontos() {
        const nivel = this.niveis[this.valorAtual];
        if (!nivel) return;

        const evento = new CustomEvent('aparenciaPontosAtualizados', {
            detail: {
                pontos: nivel.pontos,
                tipo: nivel.tipo,
                nome: nivel.nome
            }
        });
        
        document.dispatchEvent(evento);
    }

    getPontos() {
        return this.pontosAtuais;
    }

    getDados() {
        const nivel = this.niveis[this.valorAtual];
        return {
            valor: this.valorAtual,
            pontos: this.pontosAtuais,
            nome: nivel ? nivel.nome : 'Desconhecido',
            tipo: nivel ? nivel.tipo : 'neutro'
        };
    }

    carregarDados(dados) {
        if (!dados || !dados.valor) return;
        
        const select = document.getElementById('nivelAparencia');
        if (!select) return;

        select.value = dados.valor;
        this.valorAtual = dados.valor;
        this.pontosAtuais = parseInt(dados.valor);
        
        this.atualizarInterface();
        this.atualizarResumo();
        this.atualizarTotalSecao();
    }
}

// Inicialização automática
let sistemaAparencia;

document.addEventListener('DOMContentLoaded', function() {
    sistemaAparencia = new SistemaAparencia();
    
    // Aguardar um pouco para garantir que todos os elementos estejam carregados
    setTimeout(() => {
        sistemaAparencia.inicializar();
    }, 100);
});

// Exportar para uso global
window.SistemaAparencia = SistemaAparencia;
window.sistemaAparencia = sistemaAparencia;