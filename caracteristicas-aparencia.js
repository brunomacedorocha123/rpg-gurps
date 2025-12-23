// caracteristicas-aparencia.js
// Sistema de Aparência - Níveis de aparência física

const sistemaAparencia = {
    // Estado
    dados: {
        nivelAparencia: 0,       // valor numérico dos pontos
        tipoAparencia: 'Comum',  // descrição
        reacao: '+0',           // modificador de reação
        pontos: 0               // pontos gastos/ganhos
    },
    
    // Configurações dos níveis de aparência
    niveisAparencia: [
        { valor: -24, nome: 'Horrendo', reacao: '-4', desc: 'Provoca medo e repulsa', pontos: -24 },
        { valor: -20, nome: 'Monstruoso', reacao: '-4', desc: 'Aparência assustadora', pontos: -20 },
        { valor: -16, nome: 'Hediondo', reacao: '-3', desc: 'Muito desagradável de ver', pontos: -16 },
        { valor: -8, nome: 'Feio', reacao: '-2', desc: 'Aparência desfavorável', pontos: -8 },
        { valor: -4, nome: 'Sem Atrativos', reacao: '-1', desc: 'Abaixo da média', pontos: -4 },
        { valor: 0, nome: 'Comum', reacao: '+0', desc: 'Aparência padrão, sem modificadores', pontos: 0 },
        { valor: 4, nome: 'Atraente', reacao: '+1', desc: 'Acima da média', pontos: 4 },
        { valor: 12, nome: 'Elegante', reacao: '+2', desc: 'Bem acima da média', pontos: 12 },
        { valor: 16, nome: 'Muito Elegante', reacao: '+3', desc: 'Excepcionalmente atraente', pontos: 16 },
        { valor: 20, nome: 'Lindo', reacao: '+4', desc: 'Beleza impressionante', pontos: 20 }
    ],
    
    // Elementos do DOM
    elementos: {},
    inicializado: false,
    
    // Inicialização
    inicializar: function() {
        if (this.inicializado) {
            console.log('✅ Sistema de aparência já inicializado');
            return;
        }
        
        console.log('🎭 Inicializando sistema de aparência...');
        
        try {
            this.carregarElementos();
            this.setupEventListeners();
            this.atualizarAparencia(0); // Valor padrão
            this.inicializado = true;
            
            console.log('✅ Sistema de aparência inicializado com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao inicializar sistema de aparência:', error);
            this.mostrarMensagem('Erro ao inicializar sistema de aparência', 'error');
        }
    },
    
    carregarElementos: function() {
        console.log('🔍 Carregando elementos de aparência...');
        
        this.elementos = {
            // Select de nível de aparência
            selectAparencia: document.getElementById('nivelAparencia'),
            
            // Display de aparência
            displayAparencia: document.getElementById('displayAparencia'),
            
            // Badge de pontos
            pontosBadge: document.getElementById('pontosAparencia')
        };
        
        console.log('✅ Elementos carregados:', this.elementos);
    },
    
    setupEventListeners: function() {
        console.log('🎯 Configurando eventos de aparência...');
        
        if (this.elementos.selectAparencia) {
            this.elementos.selectAparencia.addEventListener('change', (e) => {
                const valor = parseInt(e.target.value);
                this.atualizarAparencia(valor);
            });
        }
    },
    
    atualizarAparencia: function(valor) {
        console.log(`🔄 Atualizando aparência para valor: ${valor}`);
        
        // Encontrar o nível correspondente
        const nivel = this.niveisAparencia.find(n => n.valor === valor) || this.niveisAparencia[5]; // Padrão: Comum
        
        // Atualizar dados
        this.dados.nivelAparencia = nivel.valor;
        this.dados.tipoAparencia = nivel.nome;
        this.dados.reacao = nivel.reacao;
        this.dados.pontos = nivel.pontos;
        
        // Atualizar UI
        this.atualizarUI(nivel);
        this.atualizarPontos();
        
        // Notificar outros sistemas (se necessário)
        this.notificarMudancas();
        
        console.log('✅ Aparência atualizada:', this.dados);
    },
    
    atualizarUI: function(nivel) {
        // Atualizar display
        if (this.elementos.displayAparencia) {
            const display = this.elementos.displayAparencia;
            
            // Encontrar ou criar elementos do display
            let header = display.querySelector('.display-header');
            let desc = display.querySelector('.display-desc');
            
            if (!header) {
                header = document.createElement('div');
                header.className = 'display-header';
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-user-circle';
                
                const textDiv = document.createElement('div');
                const strong = document.createElement('strong');
                const small = document.createElement('small');
                
                header.appendChild(icon);
                header.appendChild(textDiv);
                textDiv.appendChild(strong);
                textDiv.appendChild(small);
                display.innerHTML = '';
                display.appendChild(header);
            }
            
            if (!desc) {
                desc = document.createElement('p');
                desc.className = 'display-desc';
                display.appendChild(desc);
            }
            
            // Atualizar conteúdo
            const strong = header.querySelector('strong');
            const small = header.querySelector('small');
            
            strong.textContent = nivel.nome;
            small.textContent = `Reação: ${nivel.reacao}`;
            desc.textContent = nivel.desc;
            
            // Adicionar classe de destaque para animação
            display.classList.add('destaque');
            setTimeout(() => {
                display.classList.remove('destaque');
            }, 1000);
        }
        
        // Atualizar select (caso não esteja já selecionado)
        if (this.elementos.selectAparencia) {
            this.elementos.selectAparencia.value = nivel.valor;
        }
    },
    
    atualizarPontos: function() {
        if (!this.elementos.pontosBadge) return;
        
        const pontos = this.dados.pontos;
        const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        this.elementos.pontosBadge.textContent = texto;
        
        // Adicionar classes para destaque
        this.elementos.pontosBadge.classList.remove('destaque-positivo', 'destaque-negativo');
        
        if (pontos > 0) {
            this.elementos.pontosBadge.classList.add('destaque-positivo');
        } else if (pontos < 0) {
            this.elementos.pontosBadge.classList.add('destaque-negativo');
        }
        
        // Atualizar no dashboard (se estiver visível)
        this.atualizarDashboard();
    },
    
    atualizarDashboard: function() {
        // Atualizar no dashboard principal (se estiver aberto)
        const dashboardAparencia = document.getElementById('nivelAparencia');
        if (dashboardAparencia) {
            dashboardAparencia.textContent = this.dados.tipoAparencia;
        }
    },
    
    notificarMudancas: function() {
        // Disparar evento customizado para que outros sistemas saibam da mudança
        const evento = new CustomEvent('aparencia-alterada', {
            detail: {
                dados: this.dados
            }
        });
        
        document.dispatchEvent(evento);
        
        // Atualizar pontos totais no sistema principal
        if (window.dashboardManager && typeof window.dashboardManager.atualizarPontos === 'function') {
            window.dashboardManager.atualizarPontos('aparencia', this.dados.pontos);
        }
    },
    
    // Métodos para salvar/carregar
    coletarDadosParaSalvar: function() {
        return {
            nivelAparencia: this.dados.nivelAparencia,
            tipoAparencia: this.dados.tipoAparencia,
            reacao: this.dados.reacao,
            pontos: this.dados.pontos
        };
    },
    
    carregarDados: function(dados) {
        if (!dados) return;
        
        console.log('📂 Carregando dados de aparência:', dados);
        
        // Carregar dados
        if (dados.nivelAparencia !== undefined) {
            this.atualizarAparencia(dados.nivelAparencia);
        }
        
        // Se não tiver valor numérico, mas tiver o tipo
        if (!dados.nivelAparencia && dados.tipoAparencia) {
            const nivel = this.niveisAparencia.find(n => n.nome === dados.tipoAparencia);
            if (nivel) {
                this.atualizarAparencia(nivel.valor);
            }
        }
    },
    
    // Método para obter os dados atuais (usado por outros sistemas)
    getDetalhesPontos: function() {
        return {
            tipo: 'Aparência',
            nome: this.dados.tipoAparencia,
            pontos: this.dados.pontos,
            descricao: `Aparência: ${this.dados.tipoAparencia} (${this.dados.reacao})`
        };
    },
    
    // Helper para mostrar mensagens
    mostrarMensagem: function(texto, tipo = 'info') {
        console.log(`💬 ${tipo}: ${texto}`);
        
        // Tentar usar o sistema de toast global se existir
        if (typeof showMessage === 'function') {
            showMessage(texto, tipo);
        } else {
            // Fallback local
            alert(texto);
        }
    },
    
    // Debug
    debug: function() {
        console.log('=== 🎭 DEBUG SISTEMA APARÊNCIA ===');
        console.log('Inicializado:', this.inicializado);
        console.log('Dados:', this.dados);
        console.log('Elementos carregados:', Object.keys(this.elementos).length);
        console.log('Select:', this.elementos.selectAparencia ? '✅' : '❌');
        console.log('Display:', this.elementos.displayAparencia ? '✅' : '❌');
        console.log('Badge:', this.elementos.pontosBadge ? '✅' : '❌');
        console.log('=== FIM DEBUG ===');
    }
};

// Expor para o escopo global
window.sistemaAparencia = sistemaAparencia;

// Inicializar automaticamente quando a tab for aberta
document.addEventListener('DOMContentLoaded', function() {
    // Aguardar um momento para garantir que o DOM está totalmente carregado
    setTimeout(() => {
        // Verificar se estamos na tab de características
        const caracteristicasTab = document.getElementById('caracteristicas');
        if (caracteristicasTab && caracteristicasTab.classList.contains('active')) {
            sistemaAparencia.inicializar();
        }
        
        // Monitorar quando a tab for aberta
        document.addEventListener('click', function(e) {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
                setTimeout(() => {
                    if (!sistemaAparencia.inicializado) {
                        sistemaAparencia.inicializar();
                    }
                }, 100);
            }
        });
    }, 500);
});

console.log('🎮 Sistema de aparência carregado!');