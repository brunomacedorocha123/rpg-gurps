// ===========================================
// CARACTERÍSTICAS - APARÊNCIA (VERSÃO ATUALIZADA)
// ===========================================

class SistemaAparencia {
    constructor() {
        this.niveisAparencia = {
            "-24": { // Horrendo
                nome: "Horrendo",
                pontos: -24,
                reacao: -6,
                descricao: "Indescritivelmente monstruoso ou repugnante",
                icone: "fas fa-frown",
                tipo: "desvantagem"
            },
            "-20": { // Monstruoso
                nome: "Monstruoso",
                pontos: -20,
                reacao: -5,
                descricao: "Horrível e obviamente anormal",
                icone: "fas fa-ghost",
                tipo: "desvantagem"
            },
            "-16": { // Hediondo
                nome: "Hediondo",
                pontos: -16,
                reacao: -4,
                descricao: "Característica repugnante na aparência",
                icone: "fas fa-meh-rolling-eyes",
                tipo: "desvantagem"
            },
            "-8": { // Feio
                nome: "Feio",
                pontos: -8,
                reacao: -2,
                descricao: "Cabelo seboso, dentes tortos, etc.",
                icone: "fas fa-meh",
                tipo: "desvantagem"
            },
            "-4": { // Sem Atrativos
                nome: "Sem Atrativos",
                pontos: -4,
                reacao: -1,
                descricao: "Algo antipático, mas não específico",
                icone: "fas fa-meh-blank",
                tipo: "desvantagem"
            },
            "0": { // Comum
                nome: "Comum",
                pontos: 0,
                reacao: 0,
                descricao: "Aparência padrão, sem modificadores",
                icone: "fas fa-user",
                tipo: "neutro"
            },
            "4": { // Atraente
                nome: "Atraente",
                pontos: 4,
                reacao: 1,
                descricao: "Boa aparência, +1 em testes de reação",
                icone: "fas fa-smile",
                tipo: "vantagem"
            },
            "12": { // Elegante
                nome: "Elegante",
                pontos: 12,
                reacao: { mesmoSexo: 2, outroSexo: 4 },
                descricao: "Poderia entrar em concursos de beleza",
                icone: "fas fa-grin-stars",
                tipo: "vantagem"
            },
            "16": { // Muito Elegante
                nome: "Muito Elegante",
                pontos: 16,
                reacao: { mesmoSexo: 2, outroSexo: 6 },
                descricao: "Poderia vencer concursos de beleza",
                icone: "fas fa-crown",
                tipo: "vantagem"
            },
            "20": { // Lindo
                nome: "Lindo",
                pontos: 20,
                reacao: { mesmoSexo: 2, outroSexo: 8 },
                descricao: "Espécime ideal, aparência divina",
                icone: "fas fa-star",
                tipo: "vantagem"
            }
        };

        this.nivelAtual = '0'; // ID do nível (0 para Comum)
        this.pontosAtuais = 0;
        this.inicializado = false;
        this.cacheValores = {
            ultimosPontos: 0,
            ultimoTipo: 'neutro'
        };
    }

    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarDisplayAparencia();
        this.inicializado = true;
        
        // Disparar evento inicial
        setTimeout(() => this.notificarSistemaPontos(), 100);
        
        console.log('SistemaAparencia inicializado com sucesso');
    }

    configurarEventos() {
        const selectAparencia = document.getElementById('nivelAparencia');
        if (!selectAparencia) {
            console.error('Elemento #nivelAparencia não encontrado');
            return;
        }

        selectAparencia.addEventListener('change', (e) => {
            const valorSelecionado = e.target.value;
            this.nivelAtual = valorSelecionado;
            this.pontosAtuais = parseInt(valorSelecionado);
            
            this.atualizarDisplayAparencia();
            this.notificarSistemaPontos();
            
            // Atualizar dashboard financeiro
            this.atualizarDashboardFinanceiro();
        });

        // Configurar opções do select com cores
        this.configurarOpcoesSelect(selectAparencia);
    }

    configurarOpcoesSelect(selectElement) {
        // Garantir que as opções tenham estilos apropriados
        Array.from(selectElement.options).forEach(option => {
            const valor = option.value;
            const nivel = this.niveisAparencia[valor];
            
            if (nivel) {
                if (nivel.tipo === 'vantagem') {
                    option.style.color = '#27ae60';
                    option.style.fontWeight = 'bold';
                } else if (nivel.tipo === 'desvantagem') {
                    option.style.color = '#e74c3c';
                    option.style.fontWeight = 'bold';
                } else {
                    option.style.color = '#7f8c8d';
                }
            }
        });
    }

    atualizarDisplayAparencia() {
        const select = document.getElementById('nivelAparencia');
        const display = document.getElementById('displayAparencia');
        const badge = document.getElementById('pontosAparencia');
        
        if (!select || !display || !badge) return;

        const valor = select.value;
        const nivel = this.niveisAparencia[valor];
        
        if (!nivel) {
            console.error(`Nível de aparência não encontrado: ${valor}`);
            return;
        }

        // Atualizar o badge de pontos
        this.atualizarBadgePontos(badge, nivel);

        // Atualizar o display de informação
        this.atualizarInfoDisplay(display, nivel);

        // Atualizar resumo na seção de características
        this.atualizarResumoCaracteristicas();
    }

    atualizarBadgePontos(badge, nivel) {
        const pontosTexto = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
        badge.textContent = pontosTexto;
        
        // Aplicar estilo baseado no tipo
        if (nivel.tipo === 'vantagem') {
            badge.style.background = 'linear-gradient(145deg, #27ae60, #2ecc71)';
            badge.style.color = 'white';
            badge.style.borderColor = '#27ae60';
        } else if (nivel.tipo === 'desvantagem') {
            badge.style.background = 'linear-gradient(145deg, #e74c3c, #c0392b)';
            badge.style.color = 'white';
            badge.style.borderColor = '#e74c3c';
        } else {
            badge.style.background = 'linear-gradient(145deg, #95a5a6, #7f8c8d)';
            badge.style.color = 'white';
            badge.style.borderColor = '#95a5a6';
        }
    }

    atualizarInfoDisplay(display, nivel) {
        let textoReacao = '';
        
        if (typeof nivel.reacao === 'object') {
            textoReacao = `Reação: +${nivel.reacao.outroSexo} (outro sexo), +${nivel.reacao.mesmoSexo} (mesmo sexo)`;
        } else {
            textoReacao = `Reação: ${nivel.reacao >= 0 ? '+' : ''}${nivel.reacao}`;
        }
        
        display.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <i class="${nivel.icone}" style="color: ${nivel.tipo === 'vantagem' ? '#27ae60' : nivel.tipo === 'desvantagem' ? '#e74c3c' : '#3498db'}; font-size: 1.2em;"></i>
                <strong style="color: #ffd700; font-size: 1.1em;">${nivel.nome}</strong>
            </div>
            <div style="font-size: 0.9em; color: #95a5a6;">
                <div>${textoReacao}</div>
                <div style="margin-top: 4px;">${nivel.descricao}</div>
            </div>
        `;
    }

    atualizarDashboardFinanceiro() {
        const nivel = this.niveisAparencia[this.nivelAtual];
        if (!nivel) return;

        // Atualizar no dashboard
        const nivelAparenciaElement = document.getElementById('nivelAparencia');
        if (nivelAparenciaElement) {
            nivelAparenciaElement.textContent = nivel.nome;
        }

        // Notificar sistema de pontos
        this.notificarSistemaPontos();
    }

    atualizarResumoCaracteristicas() {
        const resumoAparencia = document.getElementById('resumoAparencia');
        if (resumoAparencia) {
            const nivel = this.niveisAparencia[this.nivelAtual];
            if (nivel) {
                const pontosTexto = nivel.pontos >= 0 ? `+${nivel.pontos} pts` : `${nivel.pontos} pts`;
                resumoAparencia.textContent = pontosTexto;
                
                // Aplicar cor baseada no tipo
                if (nivel.tipo === 'vantagem') {
                    resumoAparencia.style.color = '#27ae60';
                    resumoAparencia.style.fontWeight = 'bold';
                } else if (nivel.tipo === 'desvantagem') {
                    resumoAparencia.style.color = '#e74c3c';
                    resumoAparencia.style.fontWeight = 'bold';
                } else {
                    resumoAparencia.style.color = '#7f8c8d';
                    resumoAparencia.style.fontWeight = 'normal';
                }
            }
        }
    }

    getPontosAparencia() {
        const select = document.getElementById('nivelAparencia');
        if (!select) return 0;
        
        return parseInt(select.value) || 0;
    }

    getTipoPontos() {
        const pontos = this.getPontosAparencia();
        if (pontos > 0) return 'vantagem';
        if (pontos < 0) return 'desvantagem';
        return 'neutro';
    }

    getDadosAparencia() {
        const pontos = this.getPontosAparencia();
        const nivel = this.niveisAparencia[pontos.toString()];
        
        return {
            pontos: pontos,
            tipo: this.getTipoPontos(),
            nome: nivel ? nivel.nome : 'Desconhecido',
            descricao: nivel ? nivel.descricao : '',
            reacao: nivel ? nivel.reacao : 0,
            icone: nivel ? nivel.icone : 'fas fa-user'
        };
    }

    notificarSistemaPontos() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        
        // Verificar se houve mudança
        if (pontos === this.cacheValores.ultimosPontos && 
            tipo === this.cacheValores.ultimoTipo) {
            return; // Nenhuma mudança
        }
        
        // Atualizar cache
        this.cacheValores.ultimosPontos = pontos;
        this.cacheValores.ultimoTipo = tipo;
        
        const evento = new CustomEvent('aparenciaPontosAtualizados', {
            detail: {
                pontos: pontos,
                tipo: tipo,
                nivel: this.niveisAparencia[pontos.toString()]?.nome || 'Desconhecido',
                timestamp: new Date().toISOString(),
                origem: 'sistemaAparencia'
            }
        });
        
        document.dispatchEvent(evento);
        
        // Disparar também evento para dashboard
        const eventoDashboard = new CustomEvent('vantagensDesvantagensAtualizadas', {
            detail: {
                tipo: 'aparencia',
                pontos: pontos,
                categoria: tipo === 'vantagem' ? 'vantagens' : 'desvantagens',
                descricao: `Aparência: ${this.niveisAparencia[pontos.toString()]?.nome || 'Desconhecido'}`
            }
        });
        
        document.dispatchEvent(eventoDashboard);
    }

    // MÉTODOS PARA FIREBASE
    prepararParaFirebase() {
        return {
            aparencia: {
                nivel: this.nivelAtual,
                pontos: this.pontosAtuais,
                dados: this.getDadosAparencia(),
                atualizadoEm: new Date().toISOString()
            }
        };
    }

    carregarDoFirebase(dados) {
        if (!dados || !dados.aparencia) return;
        
        const dadosAparencia = dados.aparencia;
        
        // Restaurar seleção
        const select = document.getElementById('nivelAparencia');
        if (select && dadosAparencia.nivel !== undefined) {
            select.value = dadosAparencia.nivel;
            this.nivelAtual = dadosAparencia.nivel;
            this.pontosAtuais = dadosAparencia.pontos || parseInt(dadosAparencia.nivel) || 0;
            
            this.atualizarDisplayAparencia();
            this.notificarSistemaPontos();
            
            console.log('Aparência carregada do Firebase:', dadosAparencia);
        }
    }

    // MÉTODOS DE VALIDAÇÃO
    validar() {
        const pontos = this.getPontosAparencia();
        const tipo = this.getTipoPontos();
        const nivel = this.niveisAparencia[pontos.toString()];
        
        return {
            valido: true,
            pontos: pontos,
            tipo: tipo,
            nome: nivel ? nivel.nome : 'Desconhecido',
            mensagem: `Aparência: ${nivel ? nivel.nome : 'Desconhecido'} (${pontos >= 0 ? '+' : ''}${pontos} pts)`
        };
    }

    // MÉTODO PARA ATUALIZAR TOTAL DE SEÇÃO
    atualizarTotalSecao() {
        const totalSecao1 = document.getElementById('totalSecao1');
        if (totalSecao1) {
            const pontos = this.getPontosAparencia();
            totalSecao1.textContent = `${pontos >= 0 ? '+' : ''}${pontos} pts`;
            
            // Aplicar estilo
            if (pontos > 0) {
                totalSecao1.style.background = 'linear-gradient(145deg, rgba(39, 174, 96, 0.8), rgba(46, 204, 113, 0.9))';
            } else if (pontos < 0) {
                totalSecao1.style.background = 'linear-gradient(145deg, rgba(231, 76, 60, 0.8), rgba(192, 57, 43, 0.9))';
            } else {
                totalSecao1.style.background = 'rgba(212, 175, 55, 0.1)';
            }
        }
    }

    // MÉTODO PARA RESET
    resetar() {
        const select = document.getElementById('nivelAparencia');
        if (select) {
            select.value = '0'; // Comum
            this.nivelAtual = '0';
            this.pontosAtuais = 0;
            
            this.atualizarDisplayAparencia();
            this.notificarSistemaPontos();
            this.atualizarTotalSecao();
        }
    }
}

// Gerenciador de instância única
let sistemaAparenciaInstance = null;

function inicializarSistemaAparencia() {
    if (!sistemaAparenciaInstance) {
        sistemaAparenciaInstance = new SistemaAparencia();
        
        // Aguardar um pouco para garantir que o DOM esteja pronto
        setTimeout(() => {
            sistemaAparenciaInstance.inicializar();
            
            // Integrar com dashboard manager se disponível
            if (window.dashboardManager) {
                const dashboard = window.dashboardManager.getInstance();
                
                // Escutar eventos do dashboard
                document.addEventListener('aparenciaPontosAtualizados', (e) => {
                    if (e.detail && e.detail.origem !== 'sistemaAparencia') {
                        sistemaAparenciaInstance.notificarSistemaPontos();
                    }
                });
            }
        }, 100);
    }
    return sistemaAparenciaInstance;
}

// Inicialização automática quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        inicializarSistemaAparencia();
    }, 300);
});

// Integração com sistema de abas
document.addEventListener('abaCarregada', function(e) {
    if (e.detail && e.detail.aba === 'caracteristicas') {
        setTimeout(() => {
            inicializarSistemaAparencia();
        }, 100);
    }
});

// Integração com sistema de salvamento
document.addEventListener('salvarPersonagem', function() {
    const sistema = inicializarSistemaAparencia();
    if (sistema) {
        return sistema.prepararParaFirebase();
    }
    return null;
});

document.addEventListener('carregarPersonagem', function(e) {
    if (e.detail && e.detail.dados) {
        const sistema = inicializarSistemaAparencia();
        if (sistema) {
            sistema.carregarDoFirebase(e.detail.dados);
        }
    }
});

// Exportar para uso global
window.SistemaAparencia = SistemaAparencia;
window.sistemaAparencia = {
    getInstance: function() {
        return inicializarSistemaAparencia();
    },
    
    getPontos: function() {
        const sistema = inicializarSistemaAparencia();
        return sistema ? sistema.getPontosAparencia() : 0;
    },
    
    getDados: function() {
        const sistema = inicializarSistemaAparencia();
        return sistema ? sistema.getDadosAparencia() : null;
    },
    
    resetar: function() {
        const sistema = inicializarSistemaAparencia();
        if (sistema) {
            sistema.resetar();
        }
    }
};

// Funções globais para compatibilidade
window.atualizarAparencia = function() {
    const sistema = inicializarSistemaAparencia();
    if (sistema) {
        sistema.atualizarDisplayAparencia();
        sistema.notificarSistemaPontos();
    }
};