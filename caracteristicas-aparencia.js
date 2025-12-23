// ===========================================
// SISTEMA DE APARÊNCIA - COMPLETO E INTEGRADO
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
                tipo: "desvantagem",
                bônusReacao: "-6"
            },
            "-20": {
                nome: "Monstruoso",
                reacao: -5,
                desc: "Horrível e obviamente anormal",
                cor: "#e67e22",
                icone: "fas fa-ghost",
                tipo: "desvantagem",
                bônusReacao: "-5"
            },
            "-16": {
                nome: "Hediondo",
                reacao: -4,
                desc: "Característica repugnante na aparência",
                cor: "#f39c12",
                icone: "fas fa-meh-rolling-eyes",
                tipo: "desvantagem",
                bônusReacao: "-4"
            },
            "-8": {
                nome: "Feio",
                reacao: -2,
                desc: "Cabelo seboso, dentes tortos, etc.",
                cor: "#d35400",
                icone: "fas fa-meh",
                tipo: "desvantagem",
                bônusReacao: "-2"
            },
            "-4": {
                nome: "Sem Atrativos",
                reacao: -1,
                desc: "Algo antipático, mas não específico",
                cor: "#95a5a6",
                icone: "fas fa-meh-blank",
                tipo: "desvantagem",
                bônusReacao: "-1"
            },
            "0": {
                nome: "Comum",
                reacao: 0,
                desc: "Aparência padrão, sem modificadores",
                cor: "#3498db",
                icone: "fas fa-user",
                tipo: "neutro",
                bônusReacao: "+0"
            },
            "4": {
                nome: "Atraente",
                reacao: 1,
                desc: "Boa aparência, +1 em testes de reação",
                cor: "#2ecc71",
                icone: "fas fa-smile",
                tipo: "vantagem",
                bônusReacao: "+1"
            },
            "12": {
                nome: "Elegante",
                reacao: { mesmoSexo: 2, outroSexo: 4 },
                desc: "Poderia entrar em concursos de beleza",
                cor: "#9b59b6",
                icone: "fas fa-grin-stars",
                tipo: "vantagem",
                bônusReacao: "+2/+4"
            },
            "16": {
                nome: "Muito Elegante",
                reacao: { mesmoSexo: 2, outroSexo: 6 },
                desc: "Poderia vencer concursos de beleza",
                cor: "#f1c40f",
                icone: "fas fa-crown",
                tipo: "vantagem",
                bônusReacao: "+2/+6"
            },
            "20": {
                nome: "Lindo",
                reacao: { mesmoSexo: 2, outroSexo: 8 },
                desc: "Espécime ideal, aparência divina",
                cor: "#e74c3c",
                icone: "fas fa-star",
                tipo: "vantagem",
                bônusReacao: "+2/+8"
            }
        };

        this.pontosAtuais = 0;
        this.nivelAtual = 'Comum';
        
        this.inicializar();
        this.configurarListenerDashboard();
    }

    inicializar() {
        const select = document.getElementById('nivelAparencia');
        if (!select) {
            console.warn('Elemento nivelAparencia não encontrado!');
            return;
        }
        
        // Carregar valor salvo se existir
        this.carregarValorSalvo();
        
        // Configurar evento de mudança
        select.addEventListener('change', (e) => {
            this.atualizarAparencia(e.target.value);
            this.salvarValor(e.target.value);
        });
        
        // Inicializar com valor atual
        this.atualizarAparencia(select.value);
        
        console.log('✅ Sistema de Aparência inicializado');
    }

    configurarListenerDashboard() {
        // Escutar atualizações do dashboard
        document.addEventListener('dashboardCaracteristicasAtualizadas', (e) => {
            if (e.detail) {
                console.log('📊 Dashboard atualizou características:', e.detail);
                // Pode atualizar UI se necessário
            }
        });
    }

    carregarValorSalvo() {
        try {
            const saved = localStorage.getItem('gurps_aparencia');
            if (saved) {
                const data = JSON.parse(saved);
                const select = document.getElementById('nivelAparencia');
                if (select && data.valor) {
                    select.value = data.valor;
                }
            }
        } catch (e) {
            console.warn('Não foi possível carregar aparência salva');
        }
    }

    salvarValor(valor) {
        try {
            localStorage.setItem('gurps_aparencia', JSON.stringify({
                valor: valor,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('Não foi possível salvar aparência');
        }
    }

    atualizarAparencia(valor) {
        const nivel = this.niveisAparencia[valor];
        if (!nivel) {
            console.error('Nível de aparência não encontrado:', valor);
            return;
        }
        
        // Atualizar valores locais
        this.pontosAtuais = parseInt(valor);
        this.nivelAtual = nivel.nome;
        
        console.log(`🎭 Aparência alterada: ${nivel.nome} (${this.pontosAtuais} pts)`);
        
        // Atualizar display
        this.atualizarDisplayAparencia(valor, nivel);
        
        // Atualizar badge de pontos
        this.atualizarBadgePontos();
        
        // NOTIFICAR O DASHBOARD (CRÍTICO!)
        this.notificarMudancaPontos();
    }

    atualizarDisplayAparencia(valor, nivel) {
        const display = document.getElementById('displayAparencia');
        if (!display) {
            console.warn('Elemento displayAparencia não encontrado');
            return;
        }
        
        let textoReacao = '';
        if (typeof nivel.reacao === 'object') {
            textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
        } else {
            const sinal = nivel.reacao >= 0 ? '+' : '';
            textoReacao = `Reação: ${sinal}${nivel.reacao}`;
        }
        
        display.innerHTML = `
            <strong style="color: ${nivel.cor}">${nivel.nome}</strong>
            <br><small>${textoReacao} | ${nivel.desc}</small>
        `;
        
        // Estilo baseado no tipo (vantagem/desvantagem/neutro)
        if (nivel.tipo === 'vantagem') {
            display.style.background = 'rgba(46, 204, 113, 0.1)';
            display.style.border = '2px solid #2ecc71';
            display.style.color = '#27ae60';
        } else if (nivel.tipo === 'desvantagem') {
            display.style.background = 'rgba(231, 76, 60, 0.1)';
            display.style.border = '2px solid #e74c3c';
            display.style.color = '#c0392b';
        } else {
            display.style.background = 'rgba(52, 152, 219, 0.1)';
            display.style.border = '2px solid #3498db';
            display.style.color = '#2980b9';
        }
        
        display.style.padding = '10px';
        display.style.borderRadius = '8px';
        display.style.marginTop = '10px';
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) {
            console.warn('Badge pontosAparencia não encontrado');
            return;
        }
        
        const nivel = this.niveisAparencia[this.pontosAtuais.toString()];
        if (!nivel) return;
        
        const pontosTexto = this.pontosAtuais >= 0 ? 
            `<i class="fas fa-plus-circle"></i> +${this.pontosAtuais} pts` : 
            `<i class="fas fa-minus-circle"></i> ${this.pontosAtuais} pts`;
        
        badge.innerHTML = pontosTexto;
        
        // Estilizar baseado no tipo
        if (nivel.tipo === 'vantagem') {
            badge.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
            badge.style.color = '#fff';
            badge.style.border = '2px solid #27ae60';
        } else if (nivel.tipo === 'desvantagem') {
            badge.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            badge.style.color = '#fff';
            badge.style.border = '2px solid #c0392b';
        } else {
            badge.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
            badge.style.color = '#fff';
            badge.style.border = '2px solid #2980b9';
        }
        
        badge.style.padding = '6px 12px';
        badge.style.borderRadius = '20px';
        badge.style.fontWeight = 'bold';
        badge.style.fontSize = '0.9em';
        badge.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    }

    // MÉTODO CRÍTICO: Notificar o dashboard sobre a mudança
    notificarMudancaPontos() {
        console.log(`📤 Notificando dashboard: ${this.pontosAtuais} pontos`);
        
        // Disparar evento personalizado para o dashboard
        const evento = new CustomEvent('pontosAparenciaAtualizados', {
            detail: {
                pontos: this.pontosAtuais,
                nivel: this.nivelAtual,
                timestamp: new Date().toISOString()
            },
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(evento);
        
        // Atualizar também o resumo local na aba de características
        const resumo = document.getElementById('resumoAparencia');
        if (resumo) {
            resumo.textContent = this.pontosAtuais >= 0 ? 
                `<i class="fas fa-plus-circle"></i> +${this.pontosAtuais} pts` : 
                `<i class="fas fa-minus-circle"></i> ${this.pontosAtuais} pts`;
            resumo.style.color = this.pontosAtuais >= 0 ? '#2ecc71' : '#e74c3c';
            resumo.style.fontWeight = 'bold';
        }
        
        // Atualizar total da seção 1
        this.atualizarTotalSecao1();
    }

    atualizarTotalSecao1() {
        // Tentar obter pontos de riqueza para calcular total
        const selectRiqueza = document.getElementById('nivelRiqueza');
        let pontosRiqueza = 0;
        
        if (selectRiqueza) {
            pontosRiqueza = parseInt(selectRiqueza.value) || 0;
        }
        
        const totalSecao1 = this.pontosAtuais + pontosRiqueza;
        const elSecao1 = document.getElementById('totalSecao1');
        
        if (elSecao1) {
            elSecao1.textContent = totalSecao1 >= 0 ? 
                `<i class="fas fa-plus-circle"></i> +${totalSecao1} pts` : 
                `<i class="fas fa-minus-circle"></i> ${totalSecao1} pts`;
            
            // Estilizar baseado no total
            if (totalSecao1 > 0) {
                elSecao1.style.color = '#2ecc71';
                elSecao1.style.background = 'rgba(46, 204, 113, 0.1)';
            } else if (totalSecao1 < 0) {
                elSecao1.style.color = '#e74c3c';
                elSecao1.style.background = 'rgba(231, 76, 60, 0.1)';
            } else {
                elSecao1.style.color = '#3498db';
                elSecao1.style.background = 'rgba(52, 152, 219, 0.1)';
            }
            
            elSecao1.style.padding = '5px 10px';
            elSecao1.style.borderRadius = '15px';
            elSecao1.style.fontWeight = 'bold';
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
            tipo: nivel?.tipo || 'neutro',
            cor: nivel?.cor || '#3498db',
            icone: nivel?.icone || 'fas fa-user'
        };
    }

    // Método para sincronizar com dashboard existente
    sincronizarComDashboard() {
        const dashboard = window.dashboardManager;
        if (dashboard) {
            dashboard.atualizarPontosCaracteristicas('aparência', this.pontosAtuais);
        } else {
            // Se dashboard não estiver pronto, disparar evento
            this.notificarMudancaPontos();
        }
    }
}

// Inicialização global do Sistema de Aparência
let sistemaAparenciaInstance = null;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba de características
    const tabCaracteristicas = document.getElementById('caracteristicas');
    const selectAparencia = document.getElementById('nivelAparencia');
    
    if (selectAparencia) {
        setTimeout(() => {
            sistemaAparenciaInstance = new SistemaAparencia();
            window.SistemaAparencia = SistemaAparencia;
            window.sistemaAparencia = sistemaAparenciaInstance;
            
            console.log('✅ Sistema de Aparência carregado');
            
            // Forçar sincronização inicial com dashboard
            setTimeout(() => {
                if (sistemaAparenciaInstance) {
                    sistemaAparenciaInstance.sincronizarComDashboard();
                }
            }, 1000);
        }, 300);
    }
});

// Funções globais para acesso externo
window.getPontosAparencia = function() {
    return sistemaAparenciaInstance ? sistemaAparenciaInstance.getPontos() : 0;
};

window.getDadosAparencia = function() {
    return sistemaAparenciaInstance ? sistemaAparenciaInstance.getDados() : null;
};

window.atualizarAparenciaManual = function(valor) {
    if (sistemaAparenciaInstance) {
        sistemaAparenciaInstance.atualizarAparencia(valor);
        return true;
    }
    return false;
};