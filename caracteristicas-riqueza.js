// caracteristicas-riqueza.js - SISTEMA COMPLETO E FUNCIONAL
class SistemaRiqueza {
    constructor() {
        console.log('🎯 SISTEMA DE RIQUEZA - INICIALIZANDO');
        
        // Dados completos
        this.dados = {
            '-25': { nome: 'Falido', pontos: -25, mult: 0.1, renda: '$50', desc: 'Você não possui praticamente nada.' },
            '-15': { nome: 'Pobre', pontos: -15, mult: 0.3, renda: '$300', desc: 'Possui apenas o essencial.' },
            '-10': { nome: 'Batalhador', pontos: -10, mult: 0.5, renda: '$500', desc: 'Consegue pagar suas contas.' },
            '0': { nome: 'Médio', pontos: 0, mult: 1.0, renda: '$1.000', desc: 'Vida confortável.' },
            '10': { nome: 'Confortável', pontos: 10, mult: 2.0, renda: '$2.000', desc: 'Vive bem.' },
            '20': { nome: 'Rico', pontos: 20, mult: 5.0, renda: '$5.000', desc: 'Possui propriedades.' },
            '30': { nome: 'Muito Rico', pontos: 30, mult: 10.0, renda: '$10.000', desc: 'Parte da elite.' },
            '50': { nome: 'Podre de Rico', pontos: 50, mult: 20.0, renda: '$20.000', desc: 'Fortuna colossal.' }
        };
        
        // Estado
        this.nivelAtual = '0';
        this.inicializado = false;
        this.elementos = {};
        
        // Inicializar
        this.inicializar();
    }
    
    inicializar() {
        console.log('🔧 Inicializando componentes...');
        
        // 1. Buscar elementos
        this.buscarElementos();
        
        // 2. Se não encontrou, tentar novamente
        if (!this.elementos.select || !this.elementos.badge) {
            console.warn('⚠️ Elementos não encontrados, tentando novamente...');
            setTimeout(() => this.inicializar(), 500);
            return;
        }
        
        console.log('✅ Elementos encontrados:', this.elementos);
        
        // 3. Carregar dados salvos
        this.carregarDados();
        
        // 4. Configurar eventos
        this.configurarEventos();
        
        // 5. Atualizar interface
        this.atualizarInterface();
        
        // 6. Configurar observador de tabs
        this.configurarObservadorTabs();
        
        this.inicializado = true;
        console.log('🎉 SISTEMA DE RIQUEZA INICIALIZADO COM SUCESSO');
    }
    
    buscarElementos() {
        this.elementos = {
            select: document.getElementById('nivelRiqueza'),
            badge: document.getElementById('pontosRiqueza'),
            multiplicador: document.getElementById('multiplicadorRiqueza'),
            renda: document.getElementById('rendaMensal'),
            descricao: document.getElementById('descricaoRiqueza')
        };
    }
    
    carregarDados() {
        try {
            const salvo = localStorage.getItem('gurps_riqueza_nivel');
            if (salvo && this.dados[salvo]) {
                this.nivelAtual = salvo;
                if (this.elementos.select) {
                    this.elementos.select.value = salvo;
                }
                console.log('📂 Dados carregados:', salvo);
            }
        } catch (e) {
            console.warn('⚠️ Erro ao carregar dados:', e);
        }
    }
    
    configurarEventos() {
        if (!this.elementos.select) return;
        
        // Remover event listeners antigos
        const novoSelect = this.elementos.select.cloneNode(true);
        this.elementos.select.parentNode.replaceChild(novoSelect, this.elementos.select);
        this.elementos.select = novoSelect;
        
        // Adicionar novo event listener
        this.elementos.select.addEventListener('change', (e) => {
            this.mudarNivel(e.target.value);
        });
        
        console.log('🔗 Eventos configurados');
    }
    
    configurarObservadorTabs() {
        // Observar quando a tab características for ativada
        const tab = document.getElementById('caracteristicas');
        if (!tab) return;
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    if (tab.classList.contains('active') && !this.inicializado) {
                        console.log('🎯 Tab características ativada, reinicializando...');
                        setTimeout(() => this.inicializar(), 100);
                    }
                }
            });
        });
        
        observer.observe(tab, { attributes: true });
        console.log('👁️ Observador de tabs configurado');
    }
    
    mudarNivel(novoNivel) {
        console.log(`🎛️ Mudando nível: ${this.nivelAtual} → ${novoNivel}`);
        
        if (!this.dados[novoNivel]) {
            console.error('❌ Nível inválido:', novoNivel);
            return false;
        }
        
        this.nivelAtual = novoNivel;
        this.atualizarInterface();
        this.salvarDados();
        
        // Notificar outros sistemas
        this.notificarSistemasExternos();
        
        return true;
    }
    
    atualizarInterface() {
        const dados = this.dados[this.nivelAtual];
        if (!dados) return;
        
        console.log('🔄 Atualizando interface:', dados);
        
        // 1. Atualizar badge de pontos
        if (this.elementos.badge) {
            this.elementos.badge.textContent = dados.pontos >= 0 ? `+${dados.pontos} pts` : `${dados.pontos} pts`;
            
            // Estilizar badge
            this.elementos.badge.style.backgroundColor = dados.pontos > 0 ? '#2e7d32' :
                                                         dados.pontos < 0 ? '#c62828' : '#37474f';
            this.elementos.badge.style.color = 'white';
            this.elementos.badge.style.borderColor = dados.pontos > 0 ? '#1b5e20' :
                                                     dados.pontos < 0 ? '#b71c1c' : '#263238';
            this.elementos.badge.style.fontWeight = 'bold';
        }
        
        // 2. Atualizar multiplicador
        if (this.elementos.multiplicador) {
            this.elementos.multiplicador.textContent = `${dados.mult}x`;
            this.elementos.multiplicador.style.color = '#ffd700';
            this.elementos.multiplicador.style.fontWeight = 'bold';
        }
        
        // 3. Atualizar renda
        if (this.elementos.renda) {
            this.elementos.renda.textContent = dados.renda;
            this.elementos.renda.style.color = '#4caf50';
            this.elementos.renda.style.fontWeight = 'bold';
        }
        
        // 4. Atualizar descrição
        if (this.elementos.descricao) {
            this.elementos.descricao.textContent = dados.desc;
        }
        
        // 5. Atualizar select (se necessário)
        if (this.elementos.select && this.elementos.select.value !== this.nivelAtual) {
            this.elementos.select.value = this.nivelAtual;
        }
        
        console.log('✅ Interface atualizada');
    }
    
    salvarDados() {
        try {
            localStorage.setItem('gurps_riqueza_nivel', this.nivelAtual);
            console.log('💾 Dados salvos:', this.nivelAtual);
        } catch (e) {
            console.warn('⚠️ Erro ao salvar dados:', e);
        }
    }
    
    notificarSistemasExternos() {
        // Notificar sistema de pontos
        if (window.atualizarPontosCaracteristicas) {
            window.atualizarPontosCaracteristicas('riqueza', this.dados[this.nivelAtual].pontos);
        }
        
        // Notificar dashboard
        if (window.dashboardManager && window.dashboardManager.atualizarRiqueza) {
            window.dashboardManager.atualizarRiqueza(this.dados[this.nivelAtual]);
        }
    }
    
    // Métodos públicos
    getPontos() {
        return this.dados[this.nivelAtual]?.pontos || 0;
    }
    
    getMultiplicador() {
        return this.dados[this.nivelAtual]?.mult || 1.0;
    }
    
    getDados() {
        return {
            nivel: this.nivelAtual,
            ...this.dados[this.nivelAtual]
        };
    }
    
    setNivelManual(nivel) {
        return this.mudarNivel(nivel);
    }
    
    // Debug
    debug() {
        console.group('🔍 DEBUG SISTEMA RIQUEZA');
        console.log('Nível atual:', this.nivelAtual);
        console.log('Dados:', this.dados[this.nivelAtual]);
        console.log('Elementos:', this.elementos);
        console.log('Inicializado:', this.inicializado);
        console.groupEnd();
    }
}

// Inicializar sistema quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM pronto, criando sistema de riqueza...');
    window.sistemaRiqueza = new SistemaRiqueza();
});

// Forçar inicialização se já estiver pronto
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('⚡ DOM já pronto, inicializando imediatamente...');
    window.sistemaRiqueza = new SistemaRiqueza();
}

// Adicionar CSS para melhor visualização
(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para badges dinâmicos */
        #pontosRiqueza {
            transition: all 0.3s ease;
        }
        
        /* Destaque para mudanças */
        .riqueza-destaque {
            animation: destaqueRiqueza 0.5s ease;
        }
        
        @keyframes destaqueRiqueza {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
})();

// Exportar para uso global
console.log('✅ Sistema de riqueza carregado e pronto!');
console.log('💡 Use window.sistemaRiqueza para acessar o sistema');
console.log('📝 Comandos disponíveis:');
console.log('- sistemaRiqueza.debug()');
console.log('- sistemaRiqueza.setNivelManual("20")');
console.log('- sistemaRiqueza.getPontos()');