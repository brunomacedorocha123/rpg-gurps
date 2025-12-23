// caracteristicas-riqueza.js - SISTEMA COMPLETO E FUNCIONAL
console.log('🔥 SISTEMA DE RIQUEZA - CARREGANDO...');

// Sistema principal
const SistemaRiqueza = {
    // Configurações
    config: {
        niveis: {
            '-25': { nome: 'Falido', mult: '0x', renda: '$0', desc: 'Sem bens, depende da caridade' },
            '-15': { nome: 'Pobre', mult: '0.2x', renda: '$200', desc: 'Sempre com dificuldades financeiras' },
            '-10': { nome: 'Batalhador', mult: '0.5x', renda: '$500', desc: 'Consegue pagar o básico' },
            '0': { nome: 'Médio', mult: '1x', renda: '$1.000', desc: 'Nível de recursos pré-definido padrão' },
            '10': { nome: 'Confortável', mult: '2x', renda: '$2.000', desc: 'Pode comprar alguns luxos' },
            '20': { nome: 'Rico', mult: '5x', renda: '$5.000', desc: 'Tem muito dinheiro' },
            '30': { nome: 'Muito Rico', mult: '10x', renda: '$10.000', desc: 'Fortuna significativa' },
            '50': { nome: 'Podre de Rico', mult: '20x', renda: '$20.000', desc: 'Uma das pessoas mais ricas do mundo' }
        }
    },
    
    // Elementos DOM
    elementos: {},
    
    // Estado
    estado: {
        nivelAtual: '0',
        pontos: 0
    },
    
    // Inicializar - Método PRINCIPAL
    inicializar: function() {
        console.log('🎯 INICIANDO SISTEMA DE RIQUEZA...');
        
        try {
            // 1. Buscar elementos
            this.buscarElementos();
            
            // 2. Verificar se encontrou tudo
            if (!this.verificarElementos()) {
                console.error('❌ Elementos não encontrados!');
                this.tentarBuscarNovamente();
                return;
            }
            
            // 3. Configurar eventos
            this.configurarEventos();
            
            // 4. Inicializar estado
            this.inicializarEstado();
            
            // 5. Atualizar interface
            this.atualizarInterface();
            
            // 6. Integrar com outros sistemas
            this.integrarComDashboard();
            
            console.log('✅ SISTEMA DE RIQUEZA INICIALIZADO COM SUCESSO!');
            
            // Auto-teste
            setTimeout(() => this.testarSistema(), 500);
            
        } catch (error) {
            console.error('💥 ERRO CRÍTICO:', error);
        }
    },
    
    // Buscar elementos no DOM
    buscarElementos: function() {
        console.log('🔍 BUSCANDO ELEMENTOS...');
        
        // Buscar por ID (seu HTML tem esses IDs)
        this.elementos = {
            select: document.getElementById('nivelRiqueza'),
            badgePontos: document.getElementById('pontosRiqueza'),
            elemMultiplicador: document.getElementById('multiplicadorRiqueza'),
            elemRenda: document.getElementById('rendaMensal'),
            elemDescricao: document.getElementById('descricaoRiqueza'),
            dashboardRiqueza: document.getElementById('nivelRiqueza'), // Para o dashboard
            saldoPersonagem: document.getElementById('saldoPersonagem') // No dashboard
        };
        
        console.log('📋 Elementos encontrados:', this.elementos);
    },
    
    // Tentar buscar elementos de outras formas
    tentarBuscarNovamente: function() {
        console.log('🔄 Tentando buscar elementos de forma alternativa...');
        
        // Buscar na seção de riqueza
        const secoes = document.querySelectorAll('#caracteristicas .dashboard-section');
        
        for (let secao of secoes) {
            const titulo = secao.querySelector('h4');
            if (titulo && titulo.textContent.includes('Riqueza')) {
                console.log('✅ Encontrei seção de riqueza!');
                
                // Buscar elementos dentro desta seção
                this.elementos.select = secao.querySelector('select');
                this.elementos.badgePontos = secao.querySelector('.pontos-badge');
                
                // Buscar info-items
                const infoItems = secao.querySelectorAll('.info-item');
                infoItems.forEach(item => {
                    const texto = item.textContent;
                    if (texto.includes('Multiplicador')) {
                        this.elementos.elemMultiplicador = item.querySelector('strong');
                    }
                    if (texto.includes('Renda Mensal')) {
                        this.elementos.elemRenda = item.querySelector('strong');
                    }
                    if (texto.includes('Descrição')) {
                        this.elementos.elemDescricao = item.querySelector('small');
                    }
                });
                
                break;
            }
        }
        
        console.log('📋 Elementos após busca alternativa:', this.elementos);
    },
    
    // Verificar se todos os elementos necessários existem
    verificarElementos: function() {
        const essenciais = ['select', 'badgePontos', 'elemMultiplicador', 'elemRenda'];
        
        for (let elemento of essenciais) {
            if (!this.elementos[elemento]) {
                console.error(`❌ Elemento ${elemento} não encontrado!`);
                return false;
            }
        }
        
        return true;
    },
    
    // Configurar eventos
    configurarEventos: function() {
        console.log('🎯 CONFIGURANDO EVENTOS...');
        
        if (!this.elementos.select) {
            console.error('❌ Não posso configurar eventos - select não encontrado!');
            return;
        }
        
        // Remover event listeners antigos
        const novoSelect = this.elementos.select.cloneNode(true);
        this.elementos.select.parentNode.replaceChild(novoSelect, this.elementos.select);
        this.elementos.select = novoSelect;
        
        // Adicionar event listener
        this.elementos.select.addEventListener('change', (e) => {
            this.onSelectChange(e);
        });
        
        console.log('✅ Eventos configurados!');
    },
    
    // Handler para mudança no select
    onSelectChange: function(event) {
        const valor = event.target.value;
        console.log(`🔄 Select alterado: ${valor}`);
        
        this.estado.nivelAtual = valor;
        this.atualizarInterface();
        this.atualizarDashboard();
        this.notificarMudanca();
    },
    
    // Inicializar estado
    inicializarEstado: function() {
        if (this.elementos.select) {
            this.estado.nivelAtual = this.elementos.select.value;
            const pontos = parseInt(this.estado.nivelAtual);
            this.estado.pontos = isNaN(pontos) ? 0 : pontos;
        }
        
        console.log('📊 Estado inicial:', this.estado);
    },
    
    // Atualizar interface COMPLETA
    atualizarInterface: function() {
        console.log('🎨 ATUALIZANDO INTERFACE...');
        
        const nivel = this.config.niveis[this.estado.nivelAtual];
        if (!nivel) {
            console.error(`❌ Nível ${this.estado.nivelAtual} não encontrado!`);
            return;
        }
        
        console.log('📊 Dados do nível:', nivel);
        
        // 1. Atualizar badge de pontos
        if (this.elementos.badgePontos) {
            const pontosNum = parseInt(this.estado.nivelAtual);
            const textoPontos = pontosNum >= 0 ? `+${pontosNum} pts` : `${pontosNum} pts`;
            
            this.elementos.badgePontos.textContent = textoPontos;
            
            // Estilo dinâmico
            this.aplicarEstiloBadge(pontosNum);
            
            // Animação
            this.animarElemento(this.elementos.badgePontos);
            
            console.log(`✅ Badge atualizado: ${textoPontos}`);
        }
        
        // 2. Atualizar multiplicador
        if (this.elementos.elemMultiplicador) {
            this.elementos.elemMultiplicador.textContent = nivel.mult;
            this.animarElemento(this.elementos.elemMultiplicador);
            console.log(`✅ Multiplicador: ${nivel.mult}`);
        }
        
        // 3. Atualizar renda
        if (this.elementos.elemRenda) {
            this.elementos.elemRenda.textContent = nivel.renda;
            this.animarElemento(this.elementos.elemRenda);
            console.log(`✅ Renda: ${nivel.renda}`);
        }
        
        // 4. Atualizar descrição
        if (this.elementos.elemDescricao) {
            this.elementos.elemDescricao.textContent = nivel.desc;
            console.log(`✅ Descrição: ${nivel.desc}`);
        }
        
        // 5. Atualizar select (se não estiver)
        if (this.elementos.select && this.elementos.select.value !== this.estado.nivelAtual) {
            this.elementos.select.value = this.estado.nivelAtual;
        }
        
        console.log('✅ INTERFACE ATUALIZADA COM SUCESSO!');
    },
    
    // Aplicar estilo ao badge baseado nos pontos
    aplicarEstiloBadge: function(pontos) {
        if (!this.elementos.badgePontos) return;
        
        const badge = this.elementos.badgePontos;
        
        if (pontos > 0) {
            // Positivo - Verde
            badge.style.background = 'linear-gradient(145deg, #2e7d32, #1b5e20)';
            badge.style.border = '2px solid #4caf50';
            badge.style.color = '#c8e6c9';
            badge.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
        } else if (pontos < 0) {
            // Negativo - Vermelho
            badge.style.background = 'linear-gradient(145deg, #c62828, #b71c1c)';
            badge.style.border = '2px solid #ef5350';
            badge.style.color = '#ffcdd2';
            badge.style.textShadow = '0 1px 2px rgba(0,0,0,0.5)';
        } else {
            // Neutro - Dourado
            badge.style.background = 'linear-gradient(145deg, #d4af37, #b8941f)';
            badge.style.border = '2px solid #f4d03f';
            badge.style.color = '#1a1200';
            badge.style.textShadow = '0 1px 1px rgba(255,255,255,0.3)';
        }
    },
    
    // Animação para elementos
    animarElemento: function(elemento) {
        if (!elemento) return;
        
        elemento.style.transition = 'all 0.3s ease';
        elemento.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
            elemento.style.transform = 'scale(1)';
        }, 300);
    },
    
    // Atualizar dashboard
    atualizarDashboard: function() {
        console.log('📊 ATUALIZANDO DASHBOARD...');
        
        const nivel = this.config.niveis[this.estado.nivelAtual];
        if (!nivel) return;
        
        // 1. Atualizar nível de riqueza no dashboard
        if (this.elementos.dashboardRiqueza && this.elementos.dashboardRiqueza.id !== 'nivelRiqueza') {
            this.elementos.dashboardRiqueza.textContent = nivel.nome;
        }
        
        // 2. Atualizar saldo do personagem
        if (this.elementos.saldoPersonagem) {
            const rendaNum = parseInt(nivel.renda.replace(/[^0-9]/g, ''));
            const saldo = rendaNum * 3; // 3 meses de renda
            this.elementos.saldoPersonagem.textContent = `$${saldo.toLocaleString()}`;
            console.log(`✅ Saldo atualizado: $${saldo.toLocaleString()}`);
        }
        
        // 3. Atualizar pontos no sistema principal
        this.atualizarPontosSistema();
    },
    
    // Integrar com sistema de pontos
    atualizarPontosSistema: function() {
        if (window.dashboardManager && typeof window.dashboardManager.atualizarPontos === 'function') {
            window.dashboardManager.atualizarPontos('riqueza', this.estado.pontos);
            console.log(`✅ Pontos notificados ao sistema: ${this.estado.pontos}`);
        }
    },
    
    // Notificar mudança para outros sistemas
    notificarMudanca: function() {
        // Evento customizado
        const evento = new CustomEvent('riqueza-alterada', {
            detail: {
                nivel: this.estado.nivelAtual,
                pontos: this.estado.pontos,
                dados: this.config.niveis[this.estado.nivelAtual]
            }
        });
        
        document.dispatchEvent(evento);
        console.log('📢 Evento de riqueza disparado');
    },
    
    // Integrar com dashboard
    integrarComDashboard: function() {
        console.log('🔗 INTEGRANDO COM DASHBOARD...');
        
        // Se já existe sistema de dashboard
        if (window.dashboardManager) {
            console.log('✅ Sistema de dashboard encontrado!');
        }
    },
    
    // Métodos públicos para controle
    setNivel: function(valor) {
        console.log(`🎯 Definindo nível manualmente: ${valor}`);
        
        if (!this.config.niveis[valor]) {
            console.error(`❌ Valor inválido: ${valor}`);
            return false;
        }
        
        this.estado.nivelAtual = valor;
        this.estado.pontos = parseInt(valor);
        
        if (this.elementos.select) {
            this.elementos.select.value = valor;
        }
        
        this.atualizarInterface();
        this.atualizarDashboard();
        
        return true;
    },
    
    getDados: function() {
        return {
            ...this.estado,
            ...this.config.niveis[this.estado.nivelAtual]
        };
    },
    
    // Sistema de teste
    testarSistema: function() {
        console.log('🧪 INICIANDO TESTE DO SISTEMA...');
        
        // Teste 1: Verificar elementos
        console.log('1. Verificando elementos...');
        console.table({
            'Select': this.elementos.select ? '✅' : '❌',
            'Badge': this.elementos.badgePontos ? '✅' : '❌',
            'Multiplicador': this.elementos.elemMultiplicador ? '✅' : '❌',
            'Renda': this.elementos.elemRenda ? '✅' : '❌'
        });
        
        // Teste 2: Mudar para Rico
        console.log('2. Testando mudança para Rico (+20 pts)...');
        this.setNivel('20');
        
        // Teste 3: Mudar para Pobre
        setTimeout(() => {
            console.log('3. Testando mudança para Pobre (-15 pts)...');
            this.setNivel('-15');
        }, 1500);
        
        // Teste 4: Voltar para Médio
        setTimeout(() => {
            console.log('4. Testando mudança para Médio (0 pts)...');
            this.setNivel('0');
            console.log('✅ TESTE CONCLUÍDO!');
        }, 3000);
    },
    
    // Método para debug
    debug: function() {
        console.log('=== 🔧 DEBUG SISTEMA RIQUEZA ===');
        console.log('Estado:', this.estado);
        console.log('Elementos:', this.elementos);
        console.log('Select value:', this.elementos.select ? this.elementos.select.value : 'N/A');
        console.log('Badge text:', this.elementos.badgePontos ? this.elementos.badgePontos.textContent : 'N/A');
        console.log('Multiplicador:', this.elementos.elemMultiplicador ? this.elementos.elemMultiplicador.textContent : 'N/A');
        console.log('Renda:', this.elementos.elemRenda ? this.elementos.elemRenda.textContent : 'N/A');
        console.log('=== FIM DEBUG ===');
    }
};

// Inicialização automática quando o DOM carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - preparando sistema de riqueza...');
    
    // Inicializar após um breve delay
    setTimeout(() => {
        SistemaRiqueza.inicializar();
    }, 500);
});

// Inicializar quando a tab for aberta
document.addEventListener('click', function(e) {
    if (e.target.closest('.tab-btn[data-tab="caracteristicas"]')) {
        console.log('👆 Tab características clicada - verificando riqueza...');
        
        setTimeout(() => {
            // Se ainda não foi inicializado, inicializar
            if (!SistemaRiqueza.elementos.select) {
                SistemaRiqueza.inicializar();
            } else {
                // Já inicializado, apenas atualizar
                SistemaRiqueza.atualizarInterface();
            }
        }, 100);
    }
});

// Expor para uso global
window.SistemaRiqueza = SistemaRiqueza;
window.riqueza = SistemaRiqueza; // Alias mais curto

// Funções globais para teste
window.testarRiqueza = function() {
    SistemaRiqueza.testarSistema();
};

window.debugRiqueza = function() {
    SistemaRiqueza.debug();
};

console.log('🔥 SISTEMA DE RIQUEZA CARREGADO - Use window.SistemaRiqueza ou window.riqueza');
console.log('🎮 Comandos disponíveis:');
console.log('  window.riqueza.inicializar() - Reinicializar sistema');
console.log('  window.riqueza.setNivel("20") - Mudar para Rico');
console.log('  window.riqueza.setNivel("-15") - Mudar para Pobre');
console.log('  window.riqueza.debug() - Ver estado do sistema');
console.log('  window.testarRiqueza() - Executar teste completo');