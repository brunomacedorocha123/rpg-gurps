// ===========================================
// SISTEMA DE APARÊNCIA - COMPLETO E FUNCIONAL
// ===========================================

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
        if (!select) {
            console.warn('Select nivelAparencia não encontrado');
            return;
        }
        
        // Configurar evento de mudança
        select.addEventListener('change', (e) => {
            this.atualizarAparencia(e.target.value);
        });
        
        // Inicializar com valor atual do select
        const valorInicial = select.value;
        if (valorInicial) {
            this.atualizarAparencia(valorInicial);
        } else {
            // Se não tem valor, forçar para "Comum"
            select.value = "0";
            this.atualizarAparencia("0");
        }
    }

    atualizarAparencia(valor) {
        const nivel = this.niveisAparencia[valor];
        if (!nivel) {
            console.error('Nível de aparência inválido:', valor);
            return;
        }
        
        this.pontosAtuais = parseInt(valor);
        this.nivelAtual = nivel.nome;
        
        this.atualizarDisplayAparencia(valor, nivel);
        this.atualizarBadgePontos();
        this.notificarMudancaPontos();
        this.atualizarResumoCaracteristicas();
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
        
        // Estilo baseado no tipo
        if (nivel.tipo === 'vantagem') {
            display.style.background = 'rgba(46, 204, 113, 0.1)';
            display.style.border = '1px solid #2ecc71';
        } else if (nivel.tipo === 'desvantagem') {
            display.style.background = 'rgba(231, 76, 60, 0.1)';
            display.style.border = '1px solid #e74c3c';
        } else {
            display.style.background = 'rgba(52, 152, 219, 0.1)';
            display.style.border = '1px solid #3498db';
        }
        
        display.style.padding = '10px';
        display.style.borderRadius = '6px';
        display.style.marginTop = '10px';
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) return;
        
        const nivel = this.niveisAparencia[this.pontosAtuais.toString()];
        if (!nivel) return;
        
        const pontosTexto = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
        
        badge.textContent = pontosTexto;
        badge.style.background = nivel.cor;
        badge.style.color = '#fff';
        badge.style.padding = '4px 8px';
        badge.style.borderRadius = '4px';
        badge.style.fontSize = '0.9em';
        badge.style.fontWeight = 'bold';
    }

    atualizarResumoCaracteristicas() {
        const resumo = document.getElementById('resumoAparencia');
        if (resumo) {
            resumo.textContent = this.pontosAtuais >= 0 ? `+${this.pontosAtuais} pts` : `${this.pontosAtuais} pts`;
            resumo.style.color = this.pontosAtuais >= 0 ? '#2ecc71' : '#e74c3c';
            resumo.style.fontWeight = 'bold';
        }
        
        // Atualizar total da seção 1
        this.atualizarTotalSecao1();
        
        // Atualizar total geral de características
        this.atualizarTotalCaracteristicas();
    }

    atualizarTotalSecao1() {
        const selectRiqueza = document.getElementById('nivelRiqueza');
        let pontosRiqueza = 0;
        
        if (selectRiqueza) {
            pontosRiqueza = parseInt(selectRiqueza.value) || 0;
        }
        
        const totalSecao1 = this.pontosAtuais + pontosRiqueza;
        const elSecao1 = document.getElementById('totalSecao1');
        
        if (elSecao1) {
            elSecao1.textContent = totalSecao1 >= 0 ? `+${totalSecao1} pts` : `${totalSecao1} pts`;
        }
    }

    atualizarTotalCaracteristicas() {
        // Calcular total considerando outras características
        let total = this.pontosAtuais;
        
        // Adicionar pontos de riqueza
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            total += parseInt(selectRiqueza.value) || 0;
        }
        
        // TODO: Adicionar pontos de idiomas e características físicas quando implementados
        
        const elTotal = document.getElementById('totalCaracteristicas');
        if (elTotal) {
            elTotal.textContent = total >= 0 ? `+${total} pts` : `${total} pts`;
        }
    }

    notificarMudancaPontos() {
        // Disparar evento para o dashboard
        const evento = new CustomEvent('pontosAparenciaAtualizados', {
            detail: {
                pontos: this.pontosAtuais,
                nivel: this.nivelAtual
            }
        });
        document.dispatchEvent(evento);
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

// ===========================================
// INICIALIZAÇÃO DO SISTEMA
// ===========================================

let sistemaAparenciaInstance = null;

function inicializarSistemaAparencia() {
    // Verificar se estamos na aba de características
    const selectAparencia = document.getElementById('nivelAparencia');
    
    if (selectAparencia && selectAparencia.tagName === 'SELECT') {
        if (!sistemaAparenciaInstance) {
            sistemaAparenciaInstance = new SistemaAparencia();
            window.sistemaAparencia = sistemaAparenciaInstance;
            
            // Forçar atualização inicial
            setTimeout(() => {
                const valor = selectAparencia.value;
                if (valor && sistemaAparenciaInstance) {
                    sistemaAparenciaInstance.atualizarAparencia(valor);
                }
            }, 100);
        }
    }
}

// Inicializar quando a aba de características for carregada
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar se já estiver na aba de características
    if (document.getElementById('caracteristicas')?.classList.contains('active')) {
        inicializarSistemaAparencia();
    }
    
    // Inicializar quando mudar para a aba de características
    document.addEventListener('tabChanged', function(e) {
        if (e.detail.tab === 'caracteristicas') {
            setTimeout(inicializarSistemaAparencia, 50);
        }
    });
});

// Exportar para uso global
window.SistemaAparencia = SistemaAparencia;
window.inicializarSistemaAparencia = inicializarSistemaAparencia;

// Função para forçar atualização se necessário
window.atualizarAparenciaManual = function(valor) {
    if (sistemaAparenciaInstance) {
        sistemaAparenciaInstance.atualizarAparencia(valor);
        return true;
    }
    return false;
};