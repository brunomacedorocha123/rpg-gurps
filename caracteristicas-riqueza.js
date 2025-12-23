class SistemaRiqueza {
    constructor() {
        this.niveisRiqueza = {
            "-25": {
                nome: "Falido",
                multiplicador: 0.0,
                desc: "Sem emprego, fonte de renda, dinheiro ou bens",
                cor: "#e74c3c",
                icone: "fas fa-skull-crossbones",
                tipo: "desvantagem"
            },
            "-15": {
                nome: "Pobre",
                multiplicador: 0.2,
                desc: "1/5 da riqueza média da sociedade",
                cor: "#e67e22",
                icone: "fas fa-house-damage",
                tipo: "desvantagem"
            },
            "-10": {
                nome: "Batalhador",
                multiplicador: 0.5,
                desc: "Metade da riqueza média",
                cor: "#f39c12",
                icone: "fas fa-hands-helping",
                tipo: "desvantagem"
            },
            "0": {
                nome: "Médio",
                multiplicador: 1.0,
                desc: "Nível de recursos pré-definido padrão",
                cor: "#3498db",
                icone: "fas fa-user",
                tipo: "neutro"
            },
            "10": {
                nome: "Confortável",
                multiplicador: 2.0,
                desc: "O dobro da riqueza média",
                cor: "#2ecc71",
                icone: "fas fa-smile",
                tipo: "vantagem"
            },
            "20": {
                nome: "Rico",
                multiplicador: 5.0,
                desc: "5 vezes a riqueza média",
                cor: "#9b59b6",
                icone: "fas fa-grin-stars",
                tipo: "vantagem"
            },
            "30": {
                nome: "Muito Rico",
                multiplicador: 20.0,
                desc: "20 vezes a riqueza média",
                cor: "#f1c40f",
                icone: "fas fa-crown",
                tipo: "vantagem"
            },
            "50": {
                nome: "Podre de Rico",
                multiplicador: 100.0,
                desc: "100 vezes a riqueza média",
                cor: "#e74c3c",
                icone: "fas fa-gem",
                tipo: "vantagem"
            }
        };

        this.rendaBase = 1000;
        this.pontosAtuais = 0;
        this.nivelAtual = 'Médio';
        this.rendaAtual = 1000;
        
        this.inicializar();
    }

    inicializar() {
        const select = document.getElementById('nivelRiqueza');
        if (!select) return;
        
        select.addEventListener('change', (e) => {
            this.atualizarRiqueza(e.target.value);
        });
        
        this.atualizarRiqueza(select.value);
    }

    atualizarRiqueza(valor) {
        const nivel = this.niveisRiqueza[valor];
        if (!nivel) return;
        
        this.pontosAtuais = parseInt(valor);
        this.nivelAtual = nivel.nome;
        this.rendaAtual = this.calcularRendaMensal(parseInt(valor));
        
        this.atualizarDisplayRiqueza(valor, nivel);
        this.atualizarBadgePontos();
        this.atualizarDisplayRenda();
        this.notificarMudancaPontos();
    }

    calcularRendaMensal(pontos) {
        const nivel = this.niveisRiqueza[pontos.toString()];
        if (!nivel) return 0;
        return Math.floor(this.rendaBase * nivel.multiplicador);
    }

    formatarMoeda(valor) {
        return `$${valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    atualizarDisplayRiqueza(valor, nivel) {
        const display = document.getElementById('displayRiqueza');
        if (!display) return;
        
        display.innerHTML = `
            <strong>${nivel.nome}</strong>
            <br><small>Multiplicador: ${nivel.multiplicador}x | Recursos: ${nivel.tipo === 'vantagem' ? 'Abundantes' : nivel.tipo === 'desvantagem' ? 'Limitados' : 'Padrão'}</small>
            <br><small>${nivel.desc}</small>
        `;
        
        display.style.background = nivel.tipo === 'vantagem' ? 'rgba(46, 204, 113, 0.1)' :
                                  nivel.tipo === 'desvantagem' ? 'rgba(231, 76, 60, 0.1)' :
                                  'rgba(52, 152, 219, 0.1)';
        display.style.border = `1px solid ${nivel.cor}`;
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosRiqueza');
        if (!badge) return;
        
        const nivel = this.niveisRiqueza[this.pontosAtuais.toString()];
        const pontosTexto = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        
        badge.textContent = pontosTexto;
        badge.style.background = nivel.cor;
        badge.style.color = '#fff';
    }

    atualizarDisplayRenda() {
        const rendaElement = document.getElementById('rendaMensal');
        if (!rendaElement) return;
        
        rendaElement.textContent = this.formatarMoeda(this.rendaAtual);
        
        const nivel = this.niveisRiqueza[this.pontosAtuais.toString()];
        if (nivel) {
            rendaElement.style.color = nivel.cor;
            rendaElement.style.fontWeight = 'bold';
        }
    }

    notificarMudancaPontos() {
        const evento = new CustomEvent('pontosRiquezaAtualizados', {
            detail: {
                pontos: this.pontosAtuais,
                nivel: this.nivelAtual,
                rendaMensal: this.rendaAtual
            }
        });
        document.dispatchEvent(evento);
        
        const resumo = document.getElementById('resumoRiqueza');
        if (resumo) {
            resumo.textContent = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        }
        
        const nivelRiquezaDashboard = document.getElementById('nivelRiqueza');
        if (nivelRiquezaDashboard) {
            nivelRiquezaDashboard.textContent = this.nivelAtual;
        }
        
        const saldoDashboard = document.getElementById('saldoPersonagem');
        if (saldoDashboard) {
            saldoDashboard.textContent = this.formatarMoeda(this.rendaAtual);
        }
    }

    getPontos() {
        return this.pontosAtuais;
    }

    getNivel() {
        return this.nivelAtual;
    }

    getRenda() {
        return this.rendaAtual;
    }

    getDados() {
        const nivel = this.niveisRiqueza[this.pontosAtuais.toString()];
        return {
            pontos: this.pontosAtuais,
            nivel: this.nivelAtual,
            nome: nivel?.nome || 'Desconhecido',
            multiplicador: nivel?.multiplicador || 1,
            rendaMensal: this.rendaAtual
        };
    }
}

let sistemaRiqueza = null;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('nivelRiqueza')) {
        sistemaRiqueza = new SistemaRiqueza();
    }
});

window.SistemaRiqueza = SistemaRiqueza;