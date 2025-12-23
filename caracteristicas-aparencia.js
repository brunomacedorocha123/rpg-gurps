class SistemaAparencia {
    constructor() {
        this.niveisAparencia = {
            "-24": {
                nome: "Horrendo",
                reacao: -6,
                desc: "Indescritivelmente monstruoso ou repugnante",
                cor: "#e74c3c",
                icone: "fas fa-frown",
                tipo: "desvantagem"
            },
            "-20": {
                nome: "Monstruoso",
                reacao: -5,
                desc: "Horrível e obviamente anormal",
                cor: "#e67e22",
                icone: "fas fa-ghost",
                tipo: "desvantagem"
            },
            "-16": {
                nome: "Hediondo",
                reacao: -4,
                desc: "Característica repugnante na aparência",
                cor: "#f39c12",
                icone: "fas fa-meh-rolling-eyes",
                tipo: "desvantagem"
            },
            "-8": {
                nome: "Feio",
                reacao: -2,
                desc: "Cabelo seboso, dentes tortos, etc.",
                cor: "#d35400",
                icone: "fas fa-meh",
                tipo: "desvantagem"
            },
            "-4": {
                nome: "Sem Atrativos",
                reacao: -1,
                desc: "Algo antipático, mas não específico",
                cor: "#95a5a6",
                icone: "fas fa-meh-blank",
                tipo: "desvantagem"
            },
            "0": {
                nome: "Comum",
                reacao: 0,
                desc: "Aparência padrão, sem modificadores",
                cor: "#3498db",
                icone: "fas fa-user",
                tipo: "neutro"
            },
            "4": {
                nome: "Atraente",
                reacao: 1,
                desc: "Boa aparência, +1 em testes de reação",
                cor: "#2ecc71",
                icone: "fas fa-smile",
                tipo: "vantagem"
            },
            "12": {
                nome: "Elegante",
                reacao: { mesmoSexo: 2, outroSexo: 4 },
                desc: "Poderia entrar em concursos de beleza",
                cor: "#9b59b6",
                icone: "fas fa-grin-stars",
                tipo: "vantagem"
            },
            "16": {
                nome: "Muito Elegante",
                reacao: { mesmoSexo: 2, outroSexo: 6 },
                desc: "Poderia vencer concursos de beleza",
                cor: "#f1c40f",
                icone: "fas fa-crown",
                tipo: "vantagem"
            },
            "20": {
                nome: "Lindo",
                reacao: { mesmoSexo: 2, outroSexo: 8 },
                desc: "Espécime ideal, aparência divina",
                cor: "#e74c3c",
                icone: "fas fa-star",
                tipo: "vantagem"
            }
        };

        this.pontosAtuais = 0;
        this.nivelAtual = 'Comum';
        
        this.inicializar();
    }

    inicializar() {
        const select = document.getElementById('nivelAparencia');
        if (!select) return;
        
        select.addEventListener('change', (e) => {
            this.atualizarAparencia(e.target.value);
        });
        
        this.atualizarAparencia(select.value);
    }

    atualizarAparencia(valor) {
        const nivel = this.niveisAparencia[valor];
        if (!nivel) return;
        
        this.pontosAtuais = parseInt(valor);
        this.nivelAtual = nivel.nome;
        
        this.atualizarDisplayAparencia(valor, nivel);
        this.atualizarBadgePontos();
        this.notificarMudancaPontos();
    }

    atualizarDisplayAparencia(valor, nivel) {
        const display = document.getElementById('displayAparencia');
        if (!display) return;
        
        let textoReacao = '';
        if (typeof nivel.reacao === 'object') {
            textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
        } else {
            const sinal = nivel.reacao >= 0 ? '+' : '';
            textoReacao = `Reação: ${sinal}${nivel.reacao}`;
        }
        
        display.innerHTML = `
            <strong>${nivel.nome}</strong>
            <br><small>${textoReacao} | ${nivel.desc}</small>
        `;
        
        display.style.background = nivel.tipo === 'vantagem' ? 'rgba(46, 204, 113, 0.1)' :
                                  nivel.tipo === 'desvantagem' ? 'rgba(231, 76, 60, 0.1)' :
                                  'rgba(52, 152, 219, 0.1)';
        display.style.border = `1px solid ${nivel.cor}`;
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) return;
        
        const nivel = this.niveisAparencia[this.pontosAtuais.toString()];
        const pontosTexto = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        
        badge.textContent = pontosTexto;
        badge.style.background = nivel.cor;
        badge.style.color = '#fff';
    }

    notificarMudancaPontos() {
        const evento = new CustomEvent('pontosAparenciaAtualizados', {
            detail: {
                pontos: this.pontosAtuais,
                nivel: this.nivelAtual
            }
        });
        document.dispatchEvent(evento);
        
        const resumo = document.getElementById('resumoAparencia');
        if (resumo) {
            resumo.textContent = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        }
    }

    getPontos() {
        return this.pontosAtuais;
    }

    getNivel() {
        return this.nivelAtual;
    }

    getDados() {
        const nivel = this.niveisAparencia[this.pontosAtuais.toString()];
        return {
            pontos: this.pontosAtuais,
            nivel: this.nivelAtual,
            nome: nivel?.nome || 'Desconhecido',
            reacao: nivel?.reacao || 0,
            tipo: nivel?.tipo || 'neutro'
        };
    }
}

let sistemaAparencia = null;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('nivelAparencia')) {
        sistemaAparencia = new SistemaAparencia();
    }
});

window.SistemaAparencia = SistemaAparencia;