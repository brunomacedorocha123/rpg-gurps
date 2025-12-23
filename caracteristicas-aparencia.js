// caracteristicas-aparencia.js - VERSÃO CORRIGIDA
console.log('🔧 caracteristicas-aparencia.js carregando...');

const sistemaAparencia = {
    dados: {
        nivelAparencia: 0,
        tipoAparencia: 'Comum',
        reacao: '+0',
        pontos: 0
    },
    
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
    
    elementos: {},
    inicializado: false,
    
    inicializar: function() {
        console.log('🎭 Tentando inicializar sistema de aparência...');
        
        // Verificar se já estamos na tab de características
        if (!this.verificarSeEstaNaTabCorreta()) {
            console.log('⚠️ Não está na tab de características, aguardando...');
            return false;
        }
        
        try {
            this.carregarElementos();
            
            // Verificar se os elementos principais existem
            if (!this.elementos.selectAparencia) {
                console.error('❌ Elemento selectAparencia não encontrado!');
                console.log('Procurando por #nivelAparencia no DOM...');
                
                // Tentar encontrar de outra forma
                const elementos = document.querySelectorAll('[id*="aparencia"], [id*="Aparencia"]');
                console.log('Elementos encontrados com "aparencia":', elementos);
                
                // Procurar pelo select manualmente
                const todosSelects = document.querySelectorAll('select');
                console.log('Todos os selects:', todosSelects);
                
                return false;
            }
            
            this.setupEventListeners();
            this.atualizarAparencia(0);
            this.inicializado = true;
            
            console.log('✅ Sistema de aparência inicializado com sucesso!');
            console.log('Elementos encontrados:', this.elementos);
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar:', error);
            this.mostrarMensagem('Erro ao inicializar aparência: ' + error.message, 'error');
            return false;
        }
    },
    
    verificarSeEstaNaTabCorreta: function() {
        const tabCaracteristicas = document.getElementById('caracteristicas');
        return tabCaracteristicas && tabCaracteristicas.classList.contains('active');
    },
    
    carregarElementos: function() {
        console.log('🔍 Procurando elementos...');
        
        // Procurar elementos de várias formas
        const nivelAparencia = document.getElementById('nivelAparencia');
        const displayAparencia = document.getElementById('displayAparencia');
        const pontosAparencia = document.getElementById('pontosAparencia');
        
        console.log('Elemento #nivelAparencia encontrado?', !!nivelAparencia);
        console.log('Elemento #displayAparencia encontrado?', !!displayAparencia);
        console.log('Elemento #pontosAparencia encontrado?', !!pontosAparencia);
        
        this.elementos = {
            selectAparencia: nivelAparencia,
            displayAparencia: displayAparencia,
            pontosBadge: pontosAparencia
        };
        
        // Se não encontrou, tentar buscar por outras formas
        if (!nivelAparencia) {
            console.log('⚠️ #nivelAparencia não encontrado, tentando outras buscas...');
            
            // Buscar por texto no label
            const labels = document.querySelectorAll('label');
            for (let label of labels) {
                if (label.textContent.includes('Aparência') || label.textContent.includes('aparência')) {
                    console.log('Label encontrado:', label);
                    // Verificar se tem um select próximo
                    const select = label.nextElementSibling;
                    if (select && select.tagName === 'SELECT') {
                        this.elementos.selectAparencia = select;
                        console.log('✅ Select encontrado via label:', select);
                        break;
                    }
                }
            }
        }
        
        // Verificar estrutura do DOM onde deveria estar
        const caracteristicasContent = document.querySelector('#caracteristicas .caracteristicas-dashboard');
        if (caracteristicasContent) {
            console.log('✅ Conteúdo de características encontrado');
            
            // Verificar todas as seções dentro
            const sections = caracteristicasContent.querySelectorAll('.dashboard-section');
            console.log('Seções encontradas:', sections.length);
            
            for (let section of sections) {
                const header = section.querySelector('.section-header');
                if (header && header.textContent.includes('Aparência')) {
                    console.log('✅ Seção de aparência encontrada!');
                    
                    // Procurar elementos dentro desta seção
                    const select = section.querySelector('select');
                    const display = section.querySelector('.aparencia-display');
                    const badge = section.querySelector('.pontos-badge');
                    
                    if (select) {
                        console.log('✅ Select encontrado na seção:', select);
                        this.elementos.selectAparencia = select;
                        // Atribuir ID se não tiver
                        if (!select.id) select.id = 'nivelAparencia';
                    }
                    
                    if (display) {
                        console.log('✅ Display encontrado na seção:', display);
                        this.elementos.displayAparencia = display;
                        if (!display.id) display.id = 'displayAparencia';
                    }
                    
                    if (badge) {
                        console.log('✅ Badge encontrado na seção:', badge);
                        this.elementos.pontosBadge = badge;
                        if (!badge.id) badge.id = 'pontosAparencia';
                    }
                    
                    break;
                }
            }
        }
        
        console.log('📋 Elementos finais:', this.elementos);
    },
    
    setupEventListeners: function() {
        console.log('🎯 Configurando eventos...');
        
        if (this.elementos.selectAparencia) {
            // Remover event listeners antigos para evitar duplicação
            const novoSelect = this.elementos.selectAparencia.cloneNode(true);
            this.elementos.selectAparencia.parentNode.replaceChild(novoSelect, this.elementos.selectAparencia);
            this.elementos.selectAparencia = novoSelect;
            
            // Adicionar novo event listener
            this.elementos.selectAparencia.addEventListener('change', (e) => {
                console.log('🔄 Select alterado para:', e.target.value);
                const valor = parseInt(e.target.value);
                this.atualizarAparencia(valor);
            });
            
            // Forçar atualização inicial
            setTimeout(() => {
                const valorAtual = parseInt(this.elementos.selectAparencia.value);
                console.log('Valor atual do select:', valorAtual);
                this.atualizarAparencia(valorAtual);
            }, 100);
        } else {
            console.error('❌ Não foi possível configurar eventos - select não encontrado');
        }
    },
    
    atualizarAparencia: function(valor) {
        console.log(`🔄 Atualizando aparência para: ${valor}`);
        
        // Encontrar nível
        const nivel = this.niveisAparencia.find(n => n.valor === valor) || this.niveisAparencia[5];
        
        // Atualizar dados
        this.dados.nivelAparencia = nivel.valor;
        this.dados.tipoAparencia = nivel.nome;
        this.dados.reacao = nivel.reacao;
        this.dados.pontos = nivel.pontos;
        
        // Atualizar UI
        this.atualizarUI(nivel);
        this.atualizarPontos();
        
        console.log('✅ Dados atualizados:', this.dados);
    },
    
    atualizarUI: function(nivel) {
        // Atualizar display
        if (this.elementos.displayAparencia) {
            console.log('🎨 Atualizando display...');
            
            // Limpar e recriar o conteúdo para garantir que funciona
            this.elementos.displayAparencia.innerHTML = '';
            
            // Criar header
            const header = document.createElement('div');
            header.className = 'display-header';
            
            const icon = document.createElement('i');
            icon.className = 'fas fa-user-circle';
            
            const textDiv = document.createElement('div');
            const strong = document.createElement('strong');
            strong.textContent = nivel.nome;
            
            const small = document.createElement('small');
            small.textContent = `Reação: ${nivel.reacao}`;
            
            textDiv.appendChild(strong);
            textDiv.appendChild(small);
            header.appendChild(icon);
            header.appendChild(textDiv);
            
            // Criar descrição
            const desc = document.createElement('p');
            desc.className = 'display-desc';
            desc.textContent = nivel.desc;
            
            // Adicionar ao display
            this.elementos.displayAparencia.appendChild(header);
            this.elementos.displayAparencia.appendChild(desc);
            
            // Efeito visual
            this.elementos.displayAparencia.style.animation = 'none';
            setTimeout(() => {
                this.elementos.displayAparencia.style.animation = 'highlightChange 1s ease';
            }, 10);
        } else {
            console.warn('⚠️ displayAparencia não encontrado para atualizar');
        }
    },
    
    atualizarPontos: function() {
        if (!this.elementos.pontosBadge) {
            console.warn('⚠️ Elemento pontosBadge não encontrado!');
            
            // Tentar encontrar novamente
            const badge = document.getElementById('pontosAparencia');
            if (badge) {
                this.elementos.pontosBadge = badge;
                console.log('✅ Badge encontrado novamente:', badge);
            } else {
                console.error('❌ Não foi possível encontrar o badge de pontos');
                return;
            }
        }
        
        const pontos = this.dados.pontos;
        const texto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        
        console.log(`💰 Atualizando pontos: ${texto}`);
        this.elementos.pontosBadge.textContent = texto;
        
        // Estilo baseado no valor
        this.elementos.pontosBadge.style.backgroundColor = pontos >= 0 
            ? 'rgba(46, 125, 50, 0.3)' 
            : 'rgba(183, 28, 28, 0.3)';
        this.elementos.pontosBadge.style.color = pontos >= 0 
            ? '#81c784' 
            : '#ef5350';
        
        // Atualizar no dashboard principal
        this.atualizarDashboard();
    },
    
    atualizarDashboard: function() {
        const dashboardAparencia = document.getElementById('nivelAparencia');
        if (dashboardAparencia) {
            dashboardAparencia.textContent = this.dados.tipoAparencia;
        }
    },
    
    // Método para forçar inicialização
    forcarInicializacao: function() {
        console.log('⚡ Forçando inicialização do sistema de aparência...');
        this.inicializado = false;
        return this.inicializar();
    }
};

// Expor para o escopo global
window.sistemaAparencia = sistemaAparencia;

// Função para testar se o sistema está funcionando
window.testarAparencia = function() {
    console.log('=== 🧪 TESTE DO SISTEMA APARÊNCIA ===');
    console.log('Sistema:', window.sistemaAparencia ? '✅ Existe' : '❌ Não existe');
    console.log('Inicializado:', sistemaAparencia.inicializado);
    console.log('Elementos select:', sistemaAparencia.elementos.selectAparencia ? '✅' : '❌');
    
    // Testar mudança de valor
    if (sistemaAparencia.elementos.selectAparencia) {
        console.log('Valor atual do select:', sistemaAparencia.elementos.selectAparencia.value);
        
        // Testar mudar para "Atraente" (valor 4)
        sistemaAparencia.atualizarAparencia(4);
        console.log('Teste: Mudado para Atraente');
    }
    
    // Verificar se o badge foi atualizado
    const badge = document.getElementById('pontosAparencia');
    console.log('Badge encontrado?', !!badge);
    console.log('Texto do badge:', badge ? badge.textContent : 'N/A');
    
    console.log('=== FIM DO TESTE ===');
};

// Inicialização automática quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM totalmente carregado');
    
    // Esperar um pouco para garantir que tudo está carregado
    setTimeout(() => {
        // Verificar se estamos na tab de características
        const tabCaracteristicas = document.getElementById('caracteristicas');
        const estaAtiva = tabCaracteristicas && tabCaracteristicas.classList.contains('active');
        
        console.log('Tab características ativa?', estaAtiva);
        
        if (estaAtiva) {
            sistemaAparencia.inicializar();
        }
        
        // Monitorar mudanças de tab
        document.addEventListener('click', function(e) {
            const tabBtn = e.target.closest('.tab-btn');
            if (tabBtn && tabBtn.getAttribute('data-tab') === 'caracteristicas') {
                console.log('👆 Tab características clicada');
                setTimeout(() => {
                    if (!sistemaAparencia.inicializado) {
                        sistemaAparencia.inicializar();
                    }
                }, 300);
            }
        });
        
        // Forçar inicialização para debug
        setTimeout(() => {
            if (!sistemaAparencia.inicializado) {
                console.log('🔄 Tentando forçar inicialização...');
                sistemaAparencia.forcarInicializacao();
            }
        }, 2000);
        
        // Teste automático após 3 segundos
        setTimeout(() => {
            console.log('🧪 Executando teste automático...');
            window.testarAparencia();
        }, 3000);
    }, 1000);
});

console.log('🎮 caracteristicas-aparencia.js carregado e pronto!');