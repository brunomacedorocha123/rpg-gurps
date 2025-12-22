// ===========================================
// SISTEMA DE CARACTERÍSTICAS - APARÊNCIA E RIQUEZA
// ===========================================

class SistemaCaracteristicas {
    constructor() {
        // Sistemas individuais
        this.aparencia = null;
        this.riqueza = null;
        
        // Elementos do HTML
        this.elementos = {
            totalCaracteristicas: null,
            resumoAparencia: null,
            resumoRiqueza: null,
            totalSecao1: null
        };
        
        this.inicializado = false;
        this.pontosTotais = 0;
        
        this.inicializar();
    }

    inicializar() {
        console.log('🎭 Iniciando Sistema de Características...');
        
        // Aguardar DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupSistema());
        } else {
            setTimeout(() => this.setupSistema(), 100);
        }
    }

    setupSistema() {
        // Procurar elementos
        this.buscarElementos();
        
        // Verificar se encontramos os elementos principais
        if (!this.elementos.totalCaracteristicas) {
            console.warn('⚠️ Elementos de características não encontrados, tentando novamente...');
            setTimeout(() => this.setupSistema(), 300);
            return;
        }

        // Inicializar sistemas individuais
        this.inicializarSistemasIndividuais();
        
        // Configurar eventos
        this.configurarEventos();
        
        // Atualizar inicialmente
        this.atualizarTotal();
        
        this.inicializado = true;
        console.log('✅ Sistema de Características inicializado!');
    }

    buscarElementos() {
        // Buscar todos os elementos necessários
        this.elementos = {
            // Elementos principais
            totalCaracteristicas: document.getElementById('totalCaracteristicas'),
            resumoAparencia: document.getElementById('resumoAparencia'),
            resumoRiqueza: document.getElementById('resumoRiqueza'),
            totalSecao1: document.getElementById('totalSecao1'),
            
            // Elementos de aparência
            nivelAparencia: document.getElementById('nivelAparencia'),
            pontosAparencia: document.getElementById('pontosAparencia'),
            displayAparencia: document.getElementById('displayAparencia'),
            
            // Elementos de riqueza
            nivelRiqueza: document.getElementById('nivelRiqueza'),
            pontosRiqueza: document.getElementById('pontosRiqueza'),
            displayRiqueza: document.getElementById('displayRiqueza'),
            rendaMensal: document.getElementById('rendaMensal')
        };
    }

    inicializarSistemasIndividuais() {
        // Sistema de Aparência
        if (this.elementos.nivelAparencia) {
            this.inicializarAparencia();
        }
        
        // Sistema de Riqueza
        if (this.elementos.nivelRiqueza) {
            this.inicializarRiqueza();
        }
    }

    inicializarAparencia() {
        const niveisAparencia = {
            '-24': { nome: 'Horrendo', pontos: -24, reacao: -6, tipo: 'desvantagem' },
            '-20': { nome: 'Monstruoso', pontos: -20, reacao: -5, tipo: 'desvantagem' },
            '-16': { nome: 'Hediondo', pontos: -16, reacao: -4, tipo: 'desvantagem' },
            '-8': { nome: 'Feio', pontos: -8, reacao: -2, tipo: 'desvantagem' },
            '-4': { nome: 'Sem Atrativos', pontos: -4, reacao: -1, tipo: 'desvantagem' },
            '0': { nome: 'Comum', pontos: 0, reacao: 0, tipo: 'neutro' },
            '4': { nome: 'Atraente', pontos: 4, reacao: 1, tipo: 'vantagem' },
            '12': { nome: 'Elegante', pontos: 12, reacao: { mesmo: 2, outro: 4 }, tipo: 'vantagem' },
            '16': { nome: 'Muito Elegante', pontos: 16, reacao: { mesmo: 2, outro: 6 }, tipo: 'vantagem' },
            '20': { nome: 'Lindo', pontos: 20, reacao: { mesmo: 2, outro: 8 }, tipo: 'vantagem' }
        };

        // Configurar aparência
        this.elementos.nivelAparencia.addEventListener('change', (e) => {
            const valor = e.target.value;
            const dados = niveisAparencia[valor] || niveisAparencia['0'];
            
            // Atualizar badge
            const textoPontos = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            this.elementos.pontosAparencia.textContent = textoPontos;
            
            // Cor do badge
            if (dados.tipo === 'vantagem') {
                this.elementos.pontosAparencia.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
                this.elementos.pontosAparencia.style.color = 'white';
            } else if (dados.tipo === 'desvantagem') {
                this.elementos.pontosAparencia.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
                this.elementos.pontosAparencia.style.color = 'white';
            } else {
                this.elementos.pontosAparencia.style.background = 'linear-gradient(145deg, #D4AF37, #FFD700)';
                this.elementos.pontosAparencia.style.color = '#1a1200';
            }
            
            // Atualizar display
            let textoReacao = '';
            if (typeof dados.reacao === 'object') {
                textoReacao = `Reação: +${dados.reacao.mesmo} (mesmo sexo), +${dados.reacao.outro} (outro sexo)`;
            } else {
                const sinal = dados.reacao >= 0 ? '+' : '';
                textoReacao = `Reação: ${sinal}${dados.reacao}`;
            }
            
            this.elementos.displayAparencia.innerHTML = `
                <strong style="color: ${dados.tipo === 'vantagem' ? '#27ae60' : dados.tipo === 'desvantagem' ? '#e74c3c' : '#D4AF37'}">
                    ${dados.nome}
                </strong>
                <br><small>${textoReacao}</small>
            `;
            
            // Atualizar resumo
            this.elementos.resumoAparencia.textContent = textoPontos;
            this.elementos.resumoAparencia.style.color = dados.tipo === 'vantagem' ? '#27ae60' : 
                                                       dados.tipo === 'desvantagem' ? '#e74c3c' : '#D4AF37';
            
            // Atualizar total
            this.atualizarTotal();
        });
    }

    inicializarRiqueza() {
        const niveisRiqueza = {
            '-25': { nome: 'Falido', pontos: -25, multiplicador: 0.2, tipo: 'desvantagem' },
            '-15': { nome: 'Pobre', pontos: -15, multiplicador: 0.4, tipo: 'desvantagem' },
            '-10': { nome: 'Batalhador', pontos: -10, multiplicador: 0.6, tipo: 'desvantagem' },
            '0': { nome: 'Médio', pontos: 0, multiplicador: 1, tipo: 'neutro' },
            '10': { nome: 'Confortável', pontos: 10, multiplicador: 2, tipo: 'vantagem' },
            '20': { nome: 'Rico', pontos: 20, multiplicador: 5, tipo: 'vantagem' },
            '30': { nome: 'Muito Rico', pontos: 30, multiplicador: 10, tipo: 'vantagem' },
            '50': { nome: 'Podre de Rico', pontos: 50, multiplicador: 20, tipo: 'vantagem' }
        };

        // Configurar riqueza
        this.elementos.nivelRiqueza.addEventListener('change', (e) => {
            const valor = e.target.value;
            const dados = niveisRiqueza[valor] || niveisRiqueza['0'];
            
            // Atualizar badge
            const textoPontos = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            this.elementos.pontosRiqueza.textContent = textoPontos;
            
            // Cor do badge
            if (dados.tipo === 'vantagem') {
                this.elementos.pontosRiqueza.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
                this.elementos.pontosRiqueza.style.color = 'white';
            } else if (dados.tipo === 'desvantagem') {
                this.elementos.pontosRiqueza.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
                this.elementos.pontosRiqueza.style.color = 'white';
            } else {
                this.elementos.pontosRiqueza.style.background = 'linear-gradient(145deg, #D4AF37, #FFD700)';
                this.elementos.pontosRiqueza.style.color = '#1a1200';
            }
            
            // Atualizar display
            this.elementos.displayRiqueza.innerHTML = `
                <strong style="color: ${dados.tipo === 'vantagem' ? '#27ae60' : dados.tipo === 'desvantagem' ? '#e74c3c' : '#D4AF37'}">
                    ${dados.nome}
                </strong>
                <br><small>Multiplicador: ${dados.multiplicador}x | Recursos padrão</small>
            `;
            
            // Atualizar renda
            const rendaBase = 1000;
            const renda = rendaBase * dados.multiplicador;
            this.elementos.rendaMensal.textContent = `$${renda.toLocaleString()}`;
            
            // Atualizar resumo
            this.elementos.resumoRiqueza.textContent = textoPontos;
            this.elementos.resumoRiqueza.style.color = dados.tipo === 'vantagem' ? '#27ae60' : 
                                                     dados.tipo === 'desvantagem' ? '#e74c3c' : '#D4AF37';
            
            // Atualizar total
            this.atualizarTotal();
        });
    }

    configurarEventos() {
        // Evento quando a aba de características é ativada
        document.addEventListener('tabChanged', (e) => {
            if (e.detail.tab === 'caracteristicas') {
                this.atualizarTotal();
            }
        });
    }

    atualizarTotal() {
        // Calcular pontos de aparência
        let pontosAparencia = 0;
        if (this.elementos.resumoAparencia) {
            const texto = this.elementos.resumoAparencia.textContent;
            const match = texto.match(/[+-]?\d+/);
            if (match) {
                pontosAparencia = parseInt(match[0]);
            }
        }
        
        // Calcular pontos de riqueza
        let pontosRiqueza = 0;
        if (this.elementos.resumoRiqueza) {
            const texto = this.elementos.resumoRiqueza.textContent;
            const match = texto.match(/[+-]?\d+/);
            if (match) {
                pontosRiqueza = parseInt(match[0]);
            }
        }
        
        // Calcular total
        this.pontosTotais = pontosAparencia + pontosRiqueza;
        
        // Atualizar displays
        this.atualizarDisplays();
    }

    atualizarDisplays() {
        // Atualizar total geral
        if (this.elementos.totalCaracteristicas) {
            const textoTotal = this.pontosTotais >= 0 ? `+${this.pontosTotais} pts` : `${this.pontosTotais} pts`;
            this.elementos.totalCaracteristicas.textContent = textoTotal;
            
            // Cor do total
            if (this.pontosTotais > 0) {
                this.elementos.totalCaracteristicas.style.color = '#27ae60';
            } else if (this.pontosTotais < 0) {
                this.elementos.totalCaracteristicas.style.color = '#e74c3c';
            } else {
                this.elementos.totalCaracteristicas.style.color = '#D4AF37';
            }
        }
        
        // Atualizar total da seção 1
        if (this.elementos.totalSecao1) {
            const textoSecao = this.pontosTotais >= 0 ? `+${this.pontosTotais} pts` : `${this.pontosTotais} pts`;
            this.elementos.totalSecao1.textContent = textoSecao;
            
            // Cor da seção
            if (this.pontosTotais > 0) {
                this.elementos.totalSecao1.style.background = 'rgba(46, 92, 58, 0.8)';
                this.elementos.totalSecao1.style.color = 'white';
            } else if (this.pontosTotais < 0) {
                this.elementos.totalSecao1.style.background = 'rgba(139, 0, 0, 0.8)';
                this.elementos.totalSecao1.style.color = 'white';
            } else {
                this.elementos.totalSecao1.style.background = 'rgba(212, 175, 55, 0.1)';
                this.elementos.totalSecao1.style.color = '#D4AF37';
            }
        }
    }

    // Métodos públicos
    getPontosTotais() {
        return this.pontosTotais;
    }

    getPontosAparencia() {
        if (this.elementos.resumoAparencia) {
            const texto = this.elementos.resumoAparencia.textContent;
            const match = texto.match(/[+-]?\d+/);
            return match ? parseInt(match[0]) : 0;
        }
        return 0;
    }

    getPontosRiqueza() {
        if (this.elementos.resumoRiqueza) {
            const texto = this.elementos.resumoRiqueza.textContent;
            const match = texto.match(/[+-]?\d+/);
            return match ? parseInt(match[0]) : 0;
        }
        return 0;
    }

    // Para integração com outros sistemas
    exportarDados() {
        return {
            aparencia: this.getPontosAparencia(),
            riqueza: this.getPontosRiqueza(),
            total: this.pontosTotais
        };
    }
}

// Inicialização automática
(function() {
    let sistemaCaracteristicas = null;
    
    function inicializar() {
        // Esperar até que a aba de características exista
        const checkInterval = setInterval(() => {
            const tabCaracteristicas = document.getElementById('caracteristicas');
            if (tabCaracteristicas) {
                clearInterval(checkInterval);
                sistemaCaracteristicas = new SistemaCaracteristicas();
            }
        }, 100);
    }
    
    // Iniciar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializar);
    } else {
        setTimeout(inicializar, 300);
    }
    
    // Exportar para uso global
    window.SistemaCaracteristicas = SistemaCaracteristicas;
    window.sistemaCaracteristicas = {
        getInstance: function() {
            if (!sistemaCaracteristicas) {
                sistemaCaracteristicas = new SistemaCaracteristicas();
            }
            return sistemaCaracteristicas;
        }
    };
})();

// Funções globais para acesso fácil
window.atualizarCaracteristicas = function() {
    const sistema = window.sistemaCaracteristicas.getInstance();
    if (sistema) {
        sistema.atualizarTotal();
    }
};

window.getPontosCaracteristicas = function() {
    const sistema = window.sistemaCaracteristicas.getInstance();
    return sistema ? sistema.getPontosTotais() : 0;
};