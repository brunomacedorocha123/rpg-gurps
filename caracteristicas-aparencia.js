// ===========================================
// SISTEMA DE APARÊNCIA - CARACTERÍSTICAS-APARENCIA.JS
// ===========================================

class SistemaAparencia {
    constructor() {
        this.niveis = {
            '-24': { 
                nome: 'Horrendo', 
                pontos: -24, 
                tipo: 'desvantagem', 
                reacao: -6 
            },
            '-20': { 
                nome: 'Monstruoso', 
                pontos: -20, 
                tipo: 'desvantagem', 
                reacao: -5 
            },
            '-16': { 
                nome: 'Hediondo', 
                pontos: -16, 
                tipo: 'desvantagem', 
                reacao: -4 
            },
            '-8': { 
                nome: 'Feio', 
                pontos: -8, 
                tipo: 'desvantagem', 
                reacao: -2 
            },
            '-4': { 
                nome: 'Sem Atrativos', 
                pontos: -4, 
                tipo: 'desvantagem', 
                reacao: -1 
            },
            '0': { 
                nome: 'Comum', 
                pontos: 0, 
                tipo: 'neutro', 
                reacao: 0 
            },
            '4': { 
                nome: 'Atraente', 
                pontos: 4, 
                tipo: 'vantagem', 
                reacao: 1 
            },
            '12': { 
                nome: 'Elegante', 
                pontos: 12, 
                tipo: 'vantagem', 
                reacao: { 
                    mesmo: 2, 
                    outro: 4 
                } 
            },
            '16': { 
                nome: 'Muito Elegante', 
                pontos: 16, 
                tipo: 'vantagem', 
                reacao: { 
                    mesmo: 2, 
                    outro: 6 
                } 
            },
            '20': { 
                nome: 'Lindo', 
                pontos: 20, 
                tipo: 'vantagem', 
                reacao: { 
                    mesmo: 2, 
                    outro: 8 
                } 
            }
        };
        
        this.valorAtual = '0';
        this.pontos = 0;
        this.nomeAtual = 'Comum';
        this.reacaoAtual = 0;
        this.tipoAtual = 'neutro';
        
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
        console.log('🔧 Configurando Sistema de Aparência...');
        
        const selectAparencia = document.getElementById('nivelAparencia');
        
        if (!selectAparencia) {
            console.error('❌ ERRO: Elemento "nivelAparencia" não encontrado!');
            console.log('📌 Procurando elementos com ID:', {
                nivelAparencia: document.getElementById('nivelAparencia'),
                pontosAparencia: document.getElementById('pontosAparencia'),
                displayAparencia: document.getElementById('displayAparencia'),
                resumoAparencia: document.getElementById('resumoAparencia'),
                totalSecao1: document.getElementById('totalSecao1')
            });
            return;
        }

        console.log('✅ Elemento "nivelAparencia" encontrado:', selectAparencia);

        // Configurar evento de mudança
        selectAparencia.addEventListener('change', (e) => {
            console.log('🔄 Aparência alterada para:', e.target.value);
            this.valorAtual = e.target.value;
            this.atualizarTudo();
        });

        // Configurar valor inicial
        this.valorAtual = selectAparencia.value;
        console.log('🎯 Valor inicial:', this.valorAtual);

        // Forçar atualização inicial
        setTimeout(() => {
            console.log('🚀 Iniciando atualização...');
            this.atualizarTudo();
        }, 100);
    }

    atualizarTudo() {
        console.log('📊 Atualizando aparência com valor:', this.valorAtual);
        
        const nivel = this.niveis[this.valorAtual];
        if (!nivel) {
            console.error('❌ Nível não encontrado para valor:', this.valorAtual);
            return;
        }

        console.log('🎨 Nível encontrado:', nivel);

        // Atualizar propriedades
        this.pontos = nivel.pontos;
        this.nomeAtual = nivel.nome;
        this.reacaoAtual = nivel.reacao;
        this.tipoAtual = nivel.tipo;

        // Atualizar elementos da interface
        this.atualizarBadgePontos();
        this.atualizarDisplayAparencia();
        this.atualizarResumoAparencia();
        this.atualizarTotalSecao1();

        // Disparar evento
        this.dispararEventoAtualizacao();

        console.log('✅ Aparência atualizada:', {
            nome: this.nomeAtual,
            pontos: this.pontos,
            tipo: this.tipoAtual,
            reacao: this.reacaoAtual
        });
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) {
            console.warn('⚠️ Badge "pontosAparencia" não encontrado');
            return;
        }

        const textoPontos = this.pontos >= 0 ? `+${this.pontos} pts` : `${this.pontos} pts`;
        console.log('🏷️ Atualizando badge:', textoPontos);
        badge.textContent = textoPontos;

        // Aplicar estilos baseados no tipo
        if (this.tipoAtual === 'vantagem') {
            badge.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
            badge.style.color = 'white';
            badge.style.border = '1px solid #27ae60';
            console.log('🎨 Badge: Vantagem (verde)');
        } else if (this.tipoAtual === 'desvantagem') {
            badge.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
            badge.style.color = 'white';
            badge.style.border = '1px solid #e74c3c';
            console.log('🎨 Badge: Desvantagem (vermelho)');
        } else {
            badge.style.background = 'linear-gradient(145deg, #D4AF37, #FFD700)';
            badge.style.color = '#1a1200';
            badge.style.border = '1px solid #D4AF37';
            console.log('🎨 Badge: Neutro (dourado)');
        }
    }

    atualizarDisplayAparencia() {
        const display = document.getElementById('displayAparencia');
        if (!display) {
            console.warn('⚠️ Display "displayAparencia" não encontrado');
            return;
        }

        let textoReacao = '';
        let descricaoReacao = '';
        
        if (typeof this.reacaoAtual === 'object') {
            textoReacao = `Reação: +${this.reacaoAtual.mesmo} (mesmo sexo), +${this.reacaoAtual.outro} (outro sexo)`;
            descricaoReacao = `Bônus de reação variável`;
            console.log('🎭 Reação: Objeto (diferente por sexo)');
        } else {
            textoReacao = `Reação: ${this.reacaoAtual >= 0 ? '+' : ''}${this.reacaoAtual}`;
            descricaoReacao = this.reacaoAtual > 0 ? 'Bônus de reação' : 
                            this.reacaoAtual < 0 ? 'Redutor de reação' : 'Reação normal';
            console.log('🎭 Reação: Número único');
        }

        display.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="
                    background: ${this.tipoAtual === 'vantagem' ? '#27ae60' : 
                               this.tipoAtual === 'desvantagem' ? '#e74c3c' : '#D4AF37'};
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 0.9rem;
                ">
                    ${this.pontos >= 0 ? '+' : ''}${this.pontos}
                </span>
                <div>
                    <strong style="color: #D4AF37; font-size: 1.1rem;">${this.nomeAtual}</strong>
                    <br>
                    <small style="color: white; opacity: 0.95;">${textoReacao}</small>
                </div>
            </div>
        `;

        console.log('📱 Display atualizado:', {
            nome: this.nomeAtual,
            reacao: textoReacao
        });
    }

    atualizarResumoAparencia() {
        const resumo = document.getElementById('resumoAparencia');
        if (!resumo) {
            console.warn('⚠️ Resumo "resumoAparencia" não encontrado');
            return;
        }

        const textoPontos = this.pontos >= 0 ? `+${this.pontos} pts` : `${this.pontos} pts`;
        console.log('📋 Atualizando resumo:', textoPontos);
        resumo.textContent = textoPontos;

        // Aplicar cores
        if (this.tipoAtual === 'vantagem') {
            resumo.style.color = '#27ae60';
            resumo.style.fontWeight = 'bold';
            console.log('🎨 Resumo: Vantagem (verde)');
        } else if (this.tipoAtual === 'desvantagem') {
            resumo.style.color = '#e74c3c';
            resumo.style.fontWeight = 'bold';
            console.log('🎨 Resumo: Desvantagem (vermelho)');
        } else {
            resumo.style.color = '#D4AF37';
            console.log('🎨 Resumo: Neutro (dourado)');
        }
    }

    atualizarTotalSecao1() {
        const total = document.getElementById('totalSecao1');
        if (!total) {
            console.warn('⚠️ Total "totalSecao1" não encontrado');
            return;
        }

        const textoPontos = this.pontos >= 0 ? `+${this.pontos} pts` : `${this.pontos} pts`;
        console.log('📊 Atualizando total seção 1:', textoPontos);
        total.textContent = textoPontos;

        // Aplicar estilos
        if (this.tipoAtual === 'vantagem') {
            total.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
            total.style.color = 'white';
            total.style.border = '1px solid #27ae60';
            console.log('🎨 Total: Vantagem (verde)');
        } else if (this.tipoAtual === 'desvantagem') {
            total.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
            total.style.color = 'white';
            total.style.border = '1px solid #e74c3c';
            console.log('🎨 Total: Desvantagem (vermelho)');
        } else {
            total.style.background = 'rgba(212, 175, 55, 0.1)';
            total.style.color = '#D4AF37';
            total.style.border = '1px solid rgba(212, 175, 55, 0.3)';
            console.log('🎨 Total: Neutro (dourado transparente)');
        }
    }

    dispararEventoAtualizacao() {
        const evento = new CustomEvent('aparenciaAtualizada', {
            detail: {
                valor: this.valorAtual,
                pontos: this.pontos,
                tipo: this.tipoAtual,
                nome: this.nomeAtual,
                reacao: this.reacaoAtual
            }
        });
        
        document.dispatchEvent(evento);
        
        console.log('📡 Evento disparado:', {
            nome: 'aparenciaAtualizada',
            detalhes: evento.detail
        });
    }

    // ===========================================
    // MÉTODOS PÚBLICOS
    // ===========================================

    getPontos() {
        return this.pontos;
    }

    getTipo() {
        return this.tipoAtual;
    }

    getNome() {
        return this.nomeAtual;
    }

    getReacao() {
        return this.reacaoAtual;
    }

    getDados() {
        return {
            valor: this.valorAtual,
            pontos: this.pontos,
            tipo: this.tipoAtual,
            nome: this.nomeAtual,
            reacao: this.reacaoAtual
        };
    }

    carregarDados(dados) {
        if (!dados || !dados.valor) {
            console.warn('⚠️ Dados inválidos para carregar');
            return;
        }
        
        console.log('💾 Carregando dados salvos:', dados);
        
        const select = document.getElementById('nivelAparencia');
        if (select) {
            select.value = dados.valor;
            this.valorAtual = dados.valor;
            this.atualizarTudo();
        }
    }

    // ===========================================
    // MÉTODOS DE DEBUG/HELPERS
    // ===========================================

    debug() {
        console.group('🔍 DEBUG - Sistema de Aparência');
        console.log('Valor atual:', this.valorAtual);
        console.log('Pontos:', this.pontos);
        console.log('Nome:', this.nomeAtual);
        console.log('Tipo:', this.tipoAtual);
        console.log('Reação:', this.reacaoAtual);
        console.log('Níveis disponíveis:', Object.keys(this.niveis).length);
        
        // Verificar elementos
        const elementos = {
            select: document.getElementById('nivelAparencia'),
            badge: document.getElementById('pontosAparencia'),
            display: document.getElementById('displayAparencia'),
            resumo: document.getElementById('resumoAparencia'),
            total: document.getElementById('totalSecao1')
        };
        
        console.log('Elementos encontrados:');
        Object.entries(elementos).forEach(([nome, elemento]) => {
            console.log(`  ${nome}:`, elemento ? '✅' : '❌');
        });
        
        console.groupEnd();
    }

    testarTodosNiveis() {
        console.group('🧪 TESTANDO TODOS OS NÍVEIS');
        const valores = Object.keys(this.niveis);
        
        valores.forEach((valor, index) => {
            console.log(`\nTeste ${index + 1}/${valores.length}: ${this.niveis[valor].nome}`);
            this.valorAtual = valor;
            this.atualizarTudo();
        });
        
        // Voltar ao normal
        this.valorAtual = '0';
        this.atualizarTudo();
        console.groupEnd();
    }
}

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏗️ DOM Carregado - Iniciando Sistema de Aparência');
    
    // Criar instância global
    window.sistemaAparencia = new SistemaAparencia();
    
    // Expor métodos globais para debug
    window.debugAparencia = () => window.sistemaAparencia.debug();
    window.testarAparencia = () => window.sistemaAparencia.testarTodosNiveis();
    
    console.log('✅ Sistema de Aparência inicializado. Use:');
    console.log('   window.sistemaAparencia.debug() para verificar');
    console.log('   window.sistemaAparencia.testarTodosNiveis() para testar');
});

// Fallback: Se o DOM já estiver carregado
if (document.readyState !== 'loading') {
    console.log('⚡ DOM já carregado - Iniciando imediatamente');
    window.sistemaAparencia = new SistemaAparencia();
}

// ===========================================
// FUNÇÃO PARA ATUALIZAR TOTAL GERAL (SE NECESSÁRIO)
// ===========================================

// Esta função pode ser chamada por outros sistemas para atualizar o total
function atualizarTotalAparencia() {
    if (window.sistemaAparencia) {
        const totalElement = document.getElementById('totalCaracteristicas');
        if (!totalElement) return;
        
        const pontos = window.sistemaAparencia.getPontos();
        const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        totalElement.textContent = texto;
        
        if (pontos > 0) {
            totalElement.style.color = '#27ae60';
        } else if (pontos < 0) {
            totalElement.style.color = '#e74c3c';
        } else {
            totalElement.style.color = '#D4AF37';
        }
    }
}

// Listener para evento de atualização
document.addEventListener('aparenciaAtualizada', () => {
    console.log('📣 Evento de aparência capturado - Atualizando total');
    atualizarTotalAparencia();
});