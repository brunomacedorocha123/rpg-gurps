// caracteristicas-riqueza.js
// Sistema de Riqueza - Níveis financeiros do personagem

console.log('💰 caracteristicas-riqueza.js carregando...');

const sistemaRiqueza = {
    // Estado
    dados: {
        nivelRiqueza: 0,         // valor numérico dos pontos
        tipoRiqueza: 'Médio',    // descrição
        multiplicador: '1x',     // multiplicador de riqueza
        renda: '$1.000',        // renda mensal
        descricao: 'Nível de recursos pré-definido padrão',
        pontos: 0               // pontos gastos/ganhos
    },
    
    // Configurações dos níveis de riqueza
    niveisRiqueza: [
        { valor: -25, nome: 'Falido', mult: '0x', renda: '$0', desc: 'Sem bens, depende da caridade', pontos: -25 },
        { valor: -15, nome: 'Pobre', mult: '0.2x', renda: '$200', desc: 'Sempre com dificuldades financeiras', pontos: -15 },
        { valor: -10, nome: 'Batalhador', mult: '0.5x', renda: '$500', desc: 'Consegue pagar o básico', pontos: -10 },
        { valor: 0, nome: 'Médio', mult: '1x', renda: '$1.000', desc: 'Nível de recursos pré-definido padrão', pontos: 0 },
        { valor: 10, nome: 'Confortável', mult: '2x', renda: '$2.000', desc: 'Pode comprar alguns luxos', pontos: 10 },
        { valor: 20, nome: 'Rico', mult: '5x', renda: '$5.000', desc: 'Tem muito dinheiro', pontos: 20 },
        { valor: 30, nome: 'Muito Rico', mult: '10x', renda: '$10.000', desc: 'Fortuna significativa', pontos: 30 },
        { valor: 50, nome: 'Podre de Rico', mult: '20x', renda: '$20.000', desc: 'Uma das pessoas mais ricas do mundo', pontos: 50 }
    ],
    
    // Elementos do DOM
    elementos: {},
    inicializado: false,
    
    // Inicialização
    inicializar: function() {
        console.log('💰 Inicializando sistema de riqueza...');
        
        if (this.inicializado) {
            console.log('✅ Sistema de riqueza já inicializado');
            return true;
        }
        
        try {
            this.carregarElementos();
            
            if (!this.elementos.selectRiqueza) {
                console.error('❌ Elemento selectRiqueza não encontrado!');
                return false;
            }
            
            this.setupEventListeners();
            this.atualizarRiqueza(0); // Valor padrão
            this.inicializado = true;
            
            console.log('✅ Sistema de riqueza inicializado com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar riqueza:', error);
            return false;
        }
    },
    
    carregarElementos: function() {
        console.log('🔍 Procurando elementos de riqueza...');
        
        // Buscar por ID primeiro
        let nivelRiqueza = document.getElementById('nivelRiqueza');
        let pontosRiqueza = document.getElementById('pontosRiqueza');
        let multiplicador = document.getElementById('multiplicadorRiqueza');
        let rendaMensal = document.getElementById('rendaMensal');
        let descricaoRiqueza = document.getElementById('descricaoRiqueza');
        
        console.log('Elementos por ID:', {
            nivelRiqueza: !!nivelRiqueza,
            pontosRiqueza: !!pontosRiqueza,
            multiplicador: !!multiplicador,
            rendaMensal: !!rendaMensal,
            descricaoRiqueza: !!descricaoRiqueza
        });
        
        // Se não encontrou por ID, buscar na estrutura do DOM
        if (!nivelRiqueza) {
            const caracteristicasContent = document.querySelector('#caracteristicas .caracteristicas-dashboard');
            if (caracteristicasContent) {
                const sections = caracteristicasContent.querySelectorAll('.dashboard-section');
                
                for (let section of sections) {
                    const header = section.querySelector('.section-header');
                    if (header && header.textContent.includes('Riqueza')) {
                        console.log('✅ Seção de riqueza encontrada');
                        
                        // Procurar elementos dentro desta seção
                        nivelRiqueza = section.querySelector('select');
                        pontosRiqueza = section.querySelector('.pontos-badge');
                        
                        const infoItems = section.querySelectorAll('.info-item');
                        infoItems.forEach(item => {
                            const span = item.querySelector('span');
                            if (span) {
                                if (span.textContent.includes('Multiplicador')) {
                                    multiplicador = item.querySelector('strong');
                                } else if (span.textContent.includes('Renda Mensal')) {
                                    rendaMensal = item.querySelector('strong');
                                } else if (span.textContent.includes('Descrição')) {
                                    descricaoRiqueza = item.querySelector('small');
                                }
                            }
                        });
                        
                        break;
                    }
                }
            }
        }
        
        this.elementos = {
            selectRiqueza: nivelRiqueza,
            pontosBadge: pontosRiqueza,
            multiplicadorElem: multiplicador,
            rendaElem: rendaMensal,
            descricaoElem: descricaoRiqueza
        };
        
        console.log('📋 Elementos de riqueza carregados:', this.elementos);
    },
    
    setupEventListeners: function() {
        console.log('🎯 Configurando eventos de riqueza...');
        
        if (this.elementos.selectRiqueza) {
            // Clonar para evitar duplicação de eventos
            const novoSelect = this.elementos.selectRiqueza.cloneNode(true);
            this.elementos.selectRiqueza.parentNode.replaceChild(novoSelect, this.elementos.selectRiqueza);
            this.elementos.selectRiqueza = novoSelect;
            
            this.elementos.selectRiqueza.addEventListener('change', (e) => {
                console.log('💰 Select riqueza alterado:', e.target.value);
                const valor = parseInt(e.target.value);
                this.atualizarRiqueza(valor);
            });
            
            // Atualizar com valor inicial
            setTimeout(() => {
                const valorAtual = parseInt(this.elementos.selectRiqueza.value);
                console.log('Valor inicial da riqueza:', valorAtual);
                this.atualizarRiqueza(valorAtual);
            }, 100);
        }
    },
    
    atualizarRiqueza: function(valor) {
        console.log(`💰 Atualizando riqueza para: ${valor}`);
        
        // Encontrar nível
        const nivel = this.niveisRiqueza.find(n => n.valor === valor) || this.niveisRiqueza[3]; // Padrão: Médio
        
        // Atualizar dados
        this.dados.nivelRiqueza = nivel.valor;
        this.dados.tipoRiqueza = nivel.nome;
        this.dados.multiplicador = nivel.mult;
        this.dados.renda = nivel.renda;
        this.dados.descricao = nivel.desc;
        this.dados.pontos = nivel.pontos;
        
        // Atualizar UI
        this.atualizarUI(nivel);
        this.atualizarPontos();
        
        console.log('✅ Dados de riqueza atualizados:', this.dados);
    },
    
    atualizarUI: function(nivel) {
        // Atualizar elementos de informação
        if (this.elementos.multiplicadorElem) {
            this.elementos.multiplicadorElem.textContent = nivel.mult;
        }
        
        if (this.elementos.rendaElem) {
            this.elementos.rendaElem.textContent = nivel.renda;
        }
        
        if (this.elementos.descricaoElem) {
            this.elementos.descricaoElem.textContent = nivel.desc;
        }
        
        // Atualizar select (caso não esteja)
        if (this.elementos.selectRiqueza) {
            this.elementos.selectRiqueza.value = nivel.valor;
        }
        
        // Efeito visual nos elementos
        this.aplicarEfeitoVisual();
    },
    
    aplicarEfeitoVisual: function() {
        // Animação nos elementos numéricos
        const elementos = [this.elementos.multiplicadorElem, this.elementos.rendaElem];
        
        elementos.forEach(elem => {
            if (elem) {
                elem.style.transition = 'all 0.3s ease';
                elem.style.transform = 'scale(1.1)';
                elem.style.color = '#f4d03f';
                
                setTimeout(() => {
                    elem.style.transform = 'scale(1)';
                    elem.style.color = '';
                }, 300);
            }
        });
    },
    
    atualizarPontos: function() {
        if (!this.elementos.pontosBadge) {
            console.warn('⚠️ Badge de pontos de riqueza não encontrado');
            
            // Tentar encontrar novamente
            const badge = document.querySelector('#caracteristicas .pontos-badge');
            if (badge) {
                this.elementos.pontosBadge = badge;
            }
            
            if (!this.elementos.pontosBadge) return;
        }
        
        const pontos = this.dados.pontos;
        const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        console.log(`💰 Pontos de riqueza: ${texto}`);
        this.elementos.pontosBadge.textContent = texto;
        
        // Estilo baseado no valor
        this.atualizarEstiloBadge(pontos);
        
        // Atualizar no dashboard principal
        this.atualizarDashboard();
        
        // Notificar sistema principal
        this.notificarMudancas();
    },
    
    atualizarEstiloBadge: function(pontos) {
        const badge = this.elementos.pontosBadge;
        
        if (pontos > 0) {
            // Positivo (vantagem)
            badge.style.backgroundColor = 'rgba(46, 125, 50, 0.3)';
            badge.style.borderColor = '#2e7d32';
            badge.style.color = '#81c784';
        } else if (pontos < 0) {
            // Negativo (desvantagem)
            badge.style.backgroundColor = 'rgba(183, 28, 28, 0.3)';
            badge.style.borderColor = '#b71c1c';
            badge.style.color = '#ef5350';
        } else {
            // Neutro
            badge.style.backgroundColor = 'rgba(212, 175, 55, 0.2)';
            badge.style.borderColor = '#d4af37';
            badge.style.color = '#f4d03f';
        }
    },
    
    atualizarDashboard: function() {
        // Atualizar no dashboard principal se existir
        const dashboardRiqueza = document.getElementById('nivelRiqueza');
        const saldoPersonagem = document.getElementById('saldoPersonagem');
        
        if (dashboardRiqueza) {
            dashboardRiqueza.textContent = this.dados.tipoRiqueza;
        }
        
        if (saldoPersonagem) {
            // Converter renda para saldo (exemplo: 3 meses de renda)
            const rendaNumerica = parseInt(this.dados.renda.replace(/[^0-9]/g, ''));
            const saldo = rendaNumerica * 3;
            saldoPersonagem.textContent = `$${saldo.toLocaleString()}`;
        }
    },
    
    notificarMudancas: function() {
        // Evento customizado para outros sistemas
        const evento = new CustomEvent('riqueza-alterada', {
            detail: {
                dados: this.dados
            }
        });
        
        document.dispatchEvent(evento);
        
        // Notificar sistema principal de pontos
        if (window.dashboardManager && typeof window.dashboardManager.atualizarPontos === 'function') {
            window.dashboardManager.atualizarPontos('riqueza', this.dados.pontos);
        }
    },
    
    // Métodos para salvar/carregar
    coletarDadosParaSalvar: function() {
        return {
            nivelRiqueza: this.dados.nivelRiqueza,
            tipoRiqueza: this.dados.tipoRiqueza,
            multiplicador: this.dados.multiplicador,
            renda: this.dados.renda,
            pontos: this.dados.pontos
        };
    },
    
    carregarDados: function(dados) {
        if (!dados) return;
        
        console.log('📂 Carregando dados de riqueza:', dados);
        
        if (dados.nivelRiqueza !== undefined) {
            this.atualizarRiqueza(dados.nivelRiqueza);
        } else if (dados.tipoRiqueza) {
            const nivel = this.niveisRiqueza.find(n => n.nome === dados.tipoRiqueza);
            if (nivel) {
                this.atualizarRiqueza(nivel.valor);
            }
        }
    },
    
    // Método para obter os dados atuais
    getDetalhesPontos: function() {
        return {
            tipo: 'Riqueza',
            nome: this.dados.tipoRiqueza,
            pontos: this.dados.pontos,
            descricao: `Riqueza: ${this.dados.tipoRiqueza} (${this.dados.multiplicador}, ${this.dados.renda}/mês)`
        };
    },
    
    // Utilitários
    calcularSaldoInicial: function() {
        // Calcula saldo inicial baseado na renda (ex: 3 meses de renda)
        const rendaNumerica = parseInt(this.dados.renda.replace(/[^0-9]/g, ''));
        return rendaNumerica * 3;
    },
    
    // Debug e testes
    forcarInicializacao: function() {
        console.log('⚡ Forçando inicialização do sistema de riqueza...');
        this.inicializado = false;
        return this.inicializar();
    },
    
    testarSistema: function() {
        console.log('=== 🧪 TESTE SISTEMA RIQUEZA ===');
        console.log('Inicializado:', this.inicializado);
        console.log('Dados atuais:', this.dados);
        
        // Testar mudança para "Rico"
        this.atualizarRiqueza(20);
        console.log('Testado: Mudado para Rico');
        
        console.log('=== FIM TESTE ===');
    }
};

// Expor para o escopo global
window.sistemaRiqueza = sistemaRiqueza;

// Função de teste global
window.testarRiqueza = function() {
    if (window.sistemaRiqueza) {
        window.sistemaRiqueza.testarSistema();
    } else {
        console.error('❌ Sistema de riqueza não carregado!');
    }
};

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - Inicializando riqueza...');
    
    setTimeout(() => {
        // Verificar se estamos na tab de características
        const tabCaracteristicas = document.getElementById('caracteristicas');
        const estaAtiva = tabCaracteristicas && tabCaracteristicas.classList.contains('active');
        
        if (estaAtiva) {
            sistemaRiqueza.inicializar();
        }
        
        // Monitorar quando a tab for aberta
        document.addEventListener('click', function(e) {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
                console.log('👆 Tab características clicada - Inicializando riqueza...');
                setTimeout(() => {
                    if (!sistemaRiqueza.inicializado) {
                        sistemaRiqueza.inicializar();
                    }
                }, 300);
            }
        });
        
        // Inicialização de fallback
        setTimeout(() => {
            if (!sistemaRiqueza.inicializado) {
                console.log('🔄 Tentando inicialização de fallback...');
                sistemaRiqueza.forcarInicializacao();
            }
        }, 2000);
        
        // Teste automático
        setTimeout(() => {
            console.log('🧪 Teste automático de riqueza...');
            if (sistemaRiqueza.inicializado) {
                sistemaRiqueza.testarSistema();
            }
        }, 3500);
    }, 1000);
});

// Event listener para quando a aparência mudar (se houver dependência)
document.addEventListener('aparencia-alterada', function(e) {
    console.log('🎭 Aparência alterada, verificando se afeta riqueza...');
    // Aqui você pode adicionar lógica se a aparência afeta a riqueza
});

console.log('💰 Sistema de riqueza carregado e pronto!');