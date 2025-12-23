// caracteristicas-riqueza.js - VERSÃO FUNCIONAL
console.log('💰 caracteristicas-riqueza.js CARREGANDO...');

const sistemaRiqueza = {
    // CONFIGURAÇÕES
    niveis: [
        { valor: -25, nome: 'Falido', mult: '0x', renda: '$0', desc: 'Sem bens, depende da caridade', pontos: -25 },
        { valor: -15, nome: 'Pobre', mult: '0.2x', renda: '$200', desc: 'Sempre com dificuldades financeiras', pontos: -15 },
        { valor: -10, nome: 'Batalhador', mult: '0.5x', renda: '$500', desc: 'Consegue pagar o básico', pontos: -10 },
        { valor: 0, nome: 'Médio', mult: '1x', renda: '$1.000', desc: 'Nível de recursos pré-definido padrão', pontos: 0 },
        { valor: 10, nome: 'Confortável', mult: '2x', renda: '$2.000', desc: 'Pode comprar alguns luxos', pontos: 10 },
        { valor: 20, nome: 'Rico', mult: '5x', renda: '$5.000', desc: 'Tem muito dinheiro', pontos: 20 },
        { valor: 30, nome: 'Muito Rico', mult: '10x', renda: '$10.000', desc: 'Fortuna significativa', pontos: 30 },
        { valor: 50, nome: 'Podre de Rico', mult: '20x', renda: '$20.000', desc: 'Uma das pessoas mais ricas do mundo', pontos: 50 }
    ],
    
    // ESTADO
    estado: {
        nivel: 0,
        nome: 'Médio',
        pontos: 0
    },
    
    // INICIALIZAR - Método PRINCIPAL
    inicializar: function() {
        console.log('🎯 INICIALIZANDO SISTEMA DE RIQUEZA');
        
        // 1. ENCONTRAR ELEMENTOS
        this.encontrarElementos();
        
        // 2. CONFIGURAR EVENTOS
        this.configurarEventos();
        
        // 3. ATUALIZAR VALOR INICIAL
        this.atualizarDoSelect();
        
        console.log('✅ SISTEMA DE RIQUEZA INICIALIZADO');
    },
    
    // ENCONTRAR ELEMENTOS NO DOM
    encontrarElementos: function() {
        console.log('🔍 PROCURANDO ELEMENTOS DE RIQUEZA...');
        
        // Buscar na seção de riqueza
        const sections = document.querySelectorAll('#caracteristicas .dashboard-section');
        
        for (let section of sections) {
            const header = section.querySelector('.section-header h4');
            if (header && header.textContent.includes('Riqueza')) {
                console.log('✅ ENCONTREI A SEÇÃO DE RIQUEZA');
                
                // Salvar a seção inteira
                this.secao = section;
                
                // Procurar elementos dentro dela
                this.select = section.querySelector('select');
                this.badge = section.querySelector('.pontos-badge');
                
                // Procurar elementos de informação
                const infoItems = section.querySelectorAll('.info-item');
                infoItems.forEach(item => {
                    const span = item.querySelector('span');
                    if (span) {
                        if (span.textContent.includes('Multiplicador')) {
                            this.elemMult = item.querySelector('strong');
                        }
                        if (span.textContent.includes('Renda Mensal')) {
                            this.elemRenda = item.querySelector('strong');
                        }
                        if (span.textContent.includes('Descrição')) {
                            this.elemDesc = item.querySelector('small');
                        }
                    }
                });
                
                break;
            }
        }
        
        console.log('📊 ELEMENTOS ENCONTRADOS:', {
            select: this.select ? '✅' : '❌',
            badge: this.badge ? '✅' : '❌',
            elemMult: this.elemMult ? '✅' : '❌',
            elemRenda: this.elemRenda ? '✅' : '❌',
            elemDesc: this.elemDesc ? '✅' : '❌'
        });
    },
    
    // CONFIGURAR EVENTOS
    configurarEventos: function() {
        if (!this.select) {
            console.error('❌ SELECT NÃO ENCONTRADO! Não posso configurar eventos.');
            return;
        }
        
        console.log('🎯 CONFIGURANDO EVENTO NO SELECT');
        
        // Remover eventos antigos (clone)
        const novoSelect = this.select.cloneNode(true);
        this.select.parentNode.replaceChild(novoSelect, this.select);
        this.select = novoSelect;
        
        // Adicionar novo evento
        this.select.addEventListener('change', (e) => {
            console.log('🔄 SELECT ALTERADO:', e.target.value);
            this.atualizarDoSelect();
        });
    },
    
    // ATUALIZAR A PARTIR DO SELECT
    atualizarDoSelect: function() {
        if (!this.select) return;
        
        const valor = parseInt(this.select.value);
        console.log('💰 VALOR SELECIONADO:', valor);
        
        this.atualizar(valor);
    },
    
    // ATUALIZAR TUDO
    atualizar: function(valor) {
        // Encontrar nível
        const nivel = this.niveis.find(n => n.valor === valor) || this.niveis[3];
        
        console.log('🎯 ATUALIZANDO PARA:', nivel.nome);
        
        // Atualizar estado
        this.estado.nivel = nivel.valor;
        this.estado.nome = nivel.nome;
        this.estado.pontos = nivel.pontos;
        
        // Atualizar UI
        this.atualizarUI(nivel);
        
        // Atualizar pontos
        this.atualizarPontos();
        
        // Notificar outros sistemas
        this.notificar();
    },
    
    // ATUALIZAR INTERFACE
    atualizarUI: function(nivel) {
        console.log('🎨 ATUALIZANDO UI...');
        
        // Atualizar elementos de informação
        if (this.elemMult) {
            console.log('📊 Multiplicador:', nivel.mult);
            this.elemMult.textContent = nivel.mult;
            this.animarElemento(this.elemMult);
        }
        
        if (this.elemRenda) {
            console.log('💵 Renda:', nivel.renda);
            this.elemRenda.textContent = nivel.renda;
            this.animarElemento(this.elemRenda);
        }
        
        if (this.elemDesc) {
            console.log('📝 Descrição:', nivel.desc);
            this.elemDesc.textContent = nivel.desc;
        }
        
        // Atualizar select (garantir que está selecionado)
        if (this.select) {
            this.select.value = nivel.valor;
        }
    },
    
    // ANIMAR ELEMENTO (efeito visual)
    animarElemento: function(elem) {
        elem.style.transition = 'all 0.3s ease';
        elem.style.transform = 'scale(1.2)';
        elem.style.color = '#f4d03f';
        
        setTimeout(() => {
            elem.style.transform = 'scale(1)';
            elem.style.color = '';
        }, 300);
    },
    
    // ATUALIZAR BADGE DE PONTOS
    atualizarPontos: function() {
        if (!this.badge) {
            console.warn('⚠️ BADGE NÃO ENCONTRADO');
            // Tentar encontrar novamente
            this.badge = this.secao ? this.secao.querySelector('.pontos-badge') : null;
            if (!this.badge) return;
        }
        
        const pontos = this.estado.pontos;
        const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        console.log('💰 PONTOS:', texto);
        
        // Atualizar texto
        this.badge.textContent = texto;
        
        // Estilo baseado no valor
        if (pontos > 0) {
            this.badge.style.background = 'linear-gradient(145deg, rgba(46, 125, 50, 0.3), rgba(27, 94, 32, 0.4))';
            this.badge.style.borderColor = '#2e7d32';
            this.badge.style.color = '#81c784';
        } else if (pontos < 0) {
            this.badge.style.background = 'linear-gradient(145deg, rgba(183, 28, 28, 0.3), rgba(136, 14, 79, 0.4))';
            this.badge.style.borderColor = '#b71c1c';
            this.badge.style.color = '#ef5350';
        } else {
            this.badge.style.background = 'linear-gradient(145deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.3))';
            this.badge.style.borderColor = '#d4af37';
            this.badge.style.color = '#f4d03f';
        }
        
        // Efeito de destaque
        this.badge.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.badge.style.transform = 'scale(1)';
        }, 200);
    },
    
    // NOTIFICAR OUTROS SISTEMAS
    notificar: function() {
        // Atualizar no dashboard
        const dashRiqueza = document.getElementById('nivelRiqueza');
        if (dashRiqueza) {
            dashRiqueza.textContent = this.estado.nome;
        }
        
        // Notificar sistema principal
        if (window.dashboardManager && window.dashboardManager.atualizarPontos) {
            window.dashboardManager.atualizarPontos('riqueza', this.estado.pontos);
        }
    },
    
    // MÉTODOS PARA TESTE
    testar: function() {
        console.log('=== 🧪 TESTANDO RIQUEZA ===');
        console.log('Select:', this.select ? '✅' : '❌');
        console.log('Estado:', this.estado);
        
        // Testar mudança para Rico
        this.atualizar(20);
        console.log('✅ Testado: Mudado para Rico');
        
        // Testar mudança para Pobre
        setTimeout(() => {
            this.atualizar(-15);
            console.log('✅ Testado: Mudado para Pobre');
        }, 1000);
    }
};

// EXPOR PARA USO GLOBAL
window.riqueza = sistemaRiqueza;

// INICIALIZAÇÃO AUTOMÁTICA
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM CARREGADO - Preparando riqueza...');
    
    // Esperar um pouco
    setTimeout(() => {
        // Verificar se estamos na tab certa
        const tab = document.getElementById('caracteristicas');
        if (tab && tab.classList.contains('active')) {
            sistemaRiqueza.inicializar();
        }
        
        // Monitorar cliques nas tabs
        document.addEventListener('click', function(e) {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
                console.log('👆 Tab características clicada');
                setTimeout(() => {
                    sistemaRiqueza.inicializar();
                }, 100);
            }
        });
    }, 500);
});

// FUNÇÃO DE TESTE NO CONSOLE
window.testarRiqueza = function() {
    console.log('⚡ TESTANDO RIQUEZA MANUALMENTE');
    
    if (!window.riqueza) {
        console.error('❌ Sistema não carregado!');
        return;
    }
    
    // Verificar se está inicializado
    if (!window.riqueza.select) {
        console.log('🔄 Inicializando primeiro...');
        window.riqueza.inicializar();
    }
    
    // Testar
    window.riqueza.testar();
};

console.log('💰 SISTEMA DE RIQUEZA PRONTO! Use window.testarRiqueza() para testar.');