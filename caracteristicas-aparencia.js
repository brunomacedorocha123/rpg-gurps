// ===========================================
// SISTEMA DE APARÊNCIA FÍSICA - 100% FUNCIONAL
// ===========================================

class SistemaAparencia {
    constructor() {
        // Configuração dos níveis de aparência
        this.niveis = {
            '-24': { 
                nome: 'Horrendo', 
                pontos: -24, 
                tipo: 'desvantagem', 
                reacao: -6,
                descricao: 'Aparência extremamente repulsiva'
            },
            '-20': { 
                nome: 'Monstruoso', 
                pontos: -20, 
                tipo: 'desvantagem', 
                reacao: -5,
                descricao: 'Aparência monstruosa'
            },
            '-16': { 
                nome: 'Hediondo', 
                pontos: -16, 
                tipo: 'desvantagem', 
                reacao: -4,
                descricao: 'Aparência muito feia'
            },
            '-8': { 
                nome: 'Feio', 
                pontos: -8, 
                tipo: 'desvantagem', 
                reacao: -2,
                descricao: 'Aparência abaixo da média'
            },
            '-4': { 
                nome: 'Sem Atrativos', 
                pontos: -4, 
                tipo: 'desvantagem', 
                reacao: -1,
                descricao: 'Pouco atrativo'
            },
            '0': { 
                nome: 'Comum', 
                pontos: 0, 
                tipo: 'neutro', 
                reacao: 0,
                descricao: 'Aparência padrão'
            },
            '4': { 
                nome: 'Atraente', 
                pontos: 4, 
                tipo: 'vantagem', 
                reacao: 1,
                descricao: 'Aparência agradável'
            },
            '12': { 
                nome: 'Elegante', 
                pontos: 12, 
                tipo: 'vantagem', 
                reacao: { mesmo: 2, outro: 4 },
                descricao: 'Aparência marcante'
            },
            '16': { 
                nome: 'Muito Elegante', 
                pontos: 16, 
                tipo: 'vantagem', 
                reacao: { mesmo: 2, outro: 6 },
                descricao: 'Aparência impressionante'
            },
            '20': { 
                nome: 'Lindo', 
                pontos: 20, 
                tipo: 'vantagem', 
                reacao: { mesmo: 2, outro: 8 },
                descricao: 'Beleza excepcional'
            }
        };
        
        // Estado atual
        this.valorAtual = '0';
        this.dadosAtuais = this.niveis['0'];
        
        // Inicializar sistema
        this.inicializar();
    }

    // ===========================================
    // INICIALIZAÇÃO
    // ===========================================

    inicializar() {
        console.log('🎭 Inicializando Sistema de Aparência...');
        
        // Verificar se já estamos no DOM carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.configurar());
            console.log('⏳ Aguardando DOM carregar...');
        } else {
            console.log('⚡ DOM já carregado, configurando...');
            this.configurar();
        }
    }

    configurar() {
        console.log('🔧 Configurando elementos...');
        
        // 1. ENCONTRAR ELEMENTOS CRÍTICOS
        const elementos = {
            select: document.getElementById('nivelAparencia'),
            badge: document.getElementById('pontosAparencia'),
            display: document.getElementById('displayAparencia'),
            resumo: document.getElementById('resumoAparencia'),
            totalSecao: document.getElementById('totalSecao1')
        };
        
        // Verificar se todos os elementos existem
        let elementosFaltantes = [];
        for (const [nome, elemento] of Object.entries(elementos)) {
            if (!elemento) {
                elementosFaltantes.push(nome);
                console.error(`❌ Elemento "${nome}" não encontrado!`);
            }
        }
        
        if (elementosFaltantes.length > 0) {
            console.error('⚠️ Alguns elementos não foram encontrados. Verifique os IDs no HTML.');
            this.mostrarAlertaErro(elementosFaltantes);
            return;
        }
        
        console.log('✅ Todos elementos encontrados:', Object.keys(elementos));
        
        // 2. CONFIGURAR EVENTO NO SELECT
        elementos.select.addEventListener('change', (e) => {
            console.log('🔄 Select alterado para:', e.target.value);
            this.valorAtual = e.target.value;
            this.atualizarTudo();
        });
        
        // 3. CONFIGURAR VALOR INICIAL
        this.valorAtual = elementos.select.value;
        console.log('🎯 Valor inicial definido como:', this.valorAtual);
        
        // 4. FORÇAR ATUALIZAÇÃO INICIAL
        setTimeout(() => {
            console.log('🚀 Executando primeira atualização...');
            this.atualizarTudo();
            console.log('✅ Sistema de Aparência configurado com sucesso!');
        }, 100);
    }

    // ===========================================
    // ATUALIZAÇÃO DA INTERFACE
    // ===========================================

    atualizarTudo() {
        // Obter dados do nível selecionado
        this.dadosAtuais = this.niveis[this.valorAtual];
        
        if (!this.dadosAtuais) {
            console.error('❌ Dados não encontrados para valor:', this.valorAtual);
            return;
        }
        
        console.log('📊 Atualizando com:', this.dadosAtuais.nome, this.dadosAtuais.pontos + 'pts');
        
        // Atualizar cada elemento
        this.atualizarBadgePontos();
        this.atualizarDisplayAparencia();
        this.atualizarResumoAparencia();
        this.atualizarTotalSecao1();
        
        // Disparar evento para outros sistemas
        this.dispararEventoAtualizacao();
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosAparencia');
        if (!badge) return;
        
        // Formatar texto dos pontos
        let textoPontos;
        if (this.dadosAtuais.pontos > 0) {
            textoPontos = `+${this.dadosAtuais.pontos} pts`;
        } else if (this.dadosAtuais.pontos < 0) {
            textoPontos = `${this.dadosAtuais.pontos} pts`;
        } else {
            textoPontos = '0 pts';
        }
        
        // Atualizar texto
        badge.textContent = textoPontos;
        
        // Aplicar estilos baseados no tipo
        badge.classList.remove('vantagem', 'desvantagem', 'neutro');
        
        if (this.dadosAtuais.tipo === 'vantagem') {
            badge.classList.add('vantagem');
            badge.style.background = 'linear-gradient(145deg, #2e5c3a, #27ae60)';
            badge.style.color = 'white';
            badge.style.borderColor = '#27ae60';
        } else if (this.dadosAtuais.tipo === 'desvantagem') {
            badge.classList.add('desvantagem');
            badge.style.background = 'linear-gradient(145deg, #8b0000, #e74c3c)';
            badge.style.color = 'white';
            badge.style.borderColor = '#e74c3c';
        } else {
            badge.classList.add('neutro');
            badge.style.background = 'linear-gradient(145deg, var(--primary-gold), var(--secondary-gold))';
            badge.style.color = 'var(--primary-dark)';
            badge.style.borderColor = 'var(--primary-gold)';
        }
        
        console.log('🏷️ Badge atualizado:', textoPontos);
    }

    atualizarDisplayAparencia() {
        const display = document.getElementById('displayAparencia');
        if (!display) return;
        
        // Preparar texto da reação
        let textoReacao = '';
        if (typeof this.dadosAtuais.reacao === 'object') {
            textoReacao = `Reação: +${this.dadosAtuais.reacao.mesmo} (mesmo sexo), +${this.dadosAtuais.reacao.outro} (outro sexo)`;
        } else if (this.dadosAtuais.reacao > 0) {
            textoReacao = `Reação: +${this.dadosAtuais.reacao}`;
        } else if (this.dadosAtuais.reacao < 0) {
            textoReacao = `Reação: ${this.dadosAtuais.reacao}`;
        } else {
            textoReacao = 'Reação: +0';
        }
        
        // Criar conteúdo HTML
        display.innerHTML = `
            <div class="display-content">
                <div class="display-titulo">
                    <span class="display-icone">
                        ${this.dadosAtuais.tipo === 'vantagem' ? '⭐' : 
                          this.dadosAtuais.tipo === 'desvantagem' ? '⚠️' : '👤'}
                    </span>
                    <strong class="display-nome">${this.dadosAtuais.nome}</strong>
                </div>
                <div class="display-info">
                    <small class="display-reacao">${textoReacao}</small>
                    <br>
                    <small class="display-desc">${this.dadosAtuais.descricao}</small>
                </div>
            </div>
        `;
        
        // Aplicar estilo ao nome baseado no tipo
        const nomeElement = display.querySelector('.display-nome');
        if (nomeElement) {
            if (this.dadosAtuais.tipo === 'vantagem') {
                nomeElement.style.color = '#27ae60';
            } else if (this.dadosAtuais.tipo === 'desvantagem') {
                nomeElement.style.color = '#e74c3c';
            } else {
                nomeElement.style.color = 'var(--text-gold)';
            }
        }
        
        console.log('📱 Display atualizado:', this.dadosAtuais.nome);
    }

    atualizarResumoAparencia() {
        const resumo = document.getElementById('resumoAparencia');
        if (!resumo) return;
        
        // Formatar texto dos pontos
        let textoPontos;
        if (this.dadosAtuais.pontos > 0) {
            textoPontos = `+${this.dadosAtuais.pontos} pts`;
        } else if (this.dadosAtuais.pontos < 0) {
            textoPontos = `${this.dadosAtuais.pontos} pts`;
        } else {
            textoPontos = '0 pts';
        }
        
        // Atualizar texto
        resumo.textContent = textoPontos;
        
        // Aplicar cor
        if (this.dadosAtuais.tipo === 'vantagem') {
            resumo.style.color = '#27ae60';
            resumo.style.fontWeight = 'bold';
        } else if (this.dadosAtuais.tipo === 'desvantagem') {
            resumo.style.color = '#e74c3c';
            resumo.style.fontWeight = 'bold';
        } else {
            resumo.style.color = 'var(--text-gold)';
        }
        
        console.log('📋 Resumo atualizado:', textoPontos);
    }

    atualizarTotalSecao1() {
        const total = document.getElementById('totalSecao1');
        if (!total) return;
        
        // Formatar texto dos pontos
        let textoPontos;
        if (this.dadosAtuais.pontos > 0) {
            textoPontos = `+${this.dadosAtuais.pontos} pts`;
        } else if (this.dadosAtuais.pontos < 0) {
            textoPontos = `${this.dadosAtuais.pontos} pts`;
        } else {
            textoPontos = '0 pts';
        }
        
        // Atualizar texto
        total.textContent = textoPontos;
        
        // Aplicar estilos
        if (this.dadosAtuais.tipo === 'vantagem') {
            total.style.background = 'rgba(46, 92, 58, 0.8)';
            total.style.color = 'white';
            total.style.border = '1px solid #27ae60';
        } else if (this.dadosAtuais.tipo === 'desvantagem') {
            total.style.background = 'rgba(139, 0, 0, 0.8)';
            total.style.color = 'white';
            total.style.border = '1px solid #e74c3c';
        } else {
            total.style.background = 'rgba(212, 175, 55, 0.1)';
            total.style.color = 'var(--text-gold)';
            total.style.border = '1px solid rgba(212, 175, 55, 0.3)';
        }
        
        console.log('📊 Total seção atualizado:', textoPontos);
    }

    // ===========================================
    // EVENTOS E COMUNICAÇÃO
    // ===========================================

    dispararEventoAtualizacao() {
        const evento = new CustomEvent('aparenciaAtualizada', {
            detail: {
                valor: this.valorAtual,
                pontos: this.dadosAtuais.pontos,
                tipo: this.dadosAtuais.tipo,
                nome: this.dadosAtuais.nome,
                reacao: this.dadosAtuais.reacao,
                descricao: this.dadosAtuais.descricao
            }
        });
        
        document.dispatchEvent(evento);
        console.log('📡 Evento disparado: aparenciaAtualizada');
    }

    // ===========================================
    // MÉTODOS PÚBLICOS
    // ===========================================

    getPontos() {
        return this.dadosAtuais.pontos;
    }

    getTipo() {
        return this.dadosAtuais.tipo;
    }

    getNome() {
        return this.dadosAtuais.nome;
    }

    getReacao() {
        return this.dadosAtuais.reacao;
    }

    getDados() {
        return {
            valor: this.valorAtual,
            pontos: this.dadosAtuais.pontos,
            tipo: this.dadosAtuais.tipo,
            nome: this.dadosAtuais.nome,
            reacao: this.dadosAtuais.reacao,
            descricao: this.dadosAtuais.descricao
        };
    }

    carregarDados(dados) {
        if (!dados || !dados.valor) {
            console.warn('⚠️ Dados inválidos para carregar');
            return false;
        }
        
        const select = document.getElementById('nivelAparencia');
        if (!select) return false;
        
        // Verificar se o valor existe nas opções
        if (!this.niveis[dados.valor]) {
            console.warn('⚠️ Valor inválido para carregar:', dados.valor);
            return false;
        }
        
        // Atualizar select
        select.value = dados.valor;
        this.valorAtual = dados.valor;
        
        // Atualizar interface
        this.atualizarTudo();
        
        console.log('💾 Dados carregados:', dados.nome);
        return true;
    }

    // ===========================================
    // UTILIDADES E DEBUG
    // ===========================================

    mostrarAlertaErro(elementosFaltantes) {
        console.error('🚨 ERRO CRÍTICO - Elementos faltando:', elementosFaltantes);
        
        // Criar alerta visual
        const alerta = document.createElement('div');
        alerta.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, #8b0000, #e74c3c);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            border-left: 5px solid #ffcc00;
            z-index: 9999;
            font-family: Arial, sans-serif;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;
        
        alerta.innerHTML = `
            <strong>⚠️ ERRO NO SISTEMA DE APARÊNCIA</strong>
            <p style="margin: 8px 0; font-size: 14px;">
                Elementos não encontrados: ${elementosFaltantes.join(', ')}
            </p>
            <small style="opacity: 0.8;">
                Verifique os IDs no HTML: nivelAparencia, pontosAparencia, displayAparencia, etc.
            </small>
        `;
        
        document.body.appendChild(alerta);
        
        // Remover após 10 segundos
        setTimeout(() => {
            if (alerta.parentNode) {
                alerta.parentNode.removeChild(alerta);
            }
        }, 10000);
    }

    testarSistema() {
        console.group('🧪 TESTE DO SISTEMA DE APARÊNCIA');
        
        // Testar cada nível
        const valores = Object.keys(this.niveis);
        let testePassou = true;
        
        valores.forEach(valor => {
            console.log(`\n🔍 Testando: ${this.niveis[valor].nome}`);
            
            // Simular mudança
            this.valorAtual = valor;
            this.atualizarTudo();
            
            // Verificar se elementos foram atualizados
            const badge = document.getElementById('pontosAparencia');
            const display = document.getElementById('displayAparencia');
            
            if (!badge || !badge.textContent.includes(this.niveis[valor].pontos.toString())) {
                console.error(`❌ Badge não atualizado para ${this.niveis[valor].nome}`);
                testePassou = false;
            }
            
            if (!display || !display.textContent.includes(this.niveis[valor].nome)) {
                console.error(`❌ Display não atualizado para ${this.niveis[valor].nome}`);
                testePassou = false;
            }
        });
        
        // Voltar ao normal
        this.valorAtual = '0';
        this.atualizarTudo();
        
        if (testePassou) {
            console.log('\n✅ TODOS TESTES PASSARAM! Sistema funcionando perfeitamente.');
        } else {
            console.log('\n❌ ALGUNS TESTES FALHARAM! Verifique o sistema.');
        }
        
        console.groupEnd();
        return testePassou;
    }

    // Método rápido para verificar configuração
    verificarConfiguracao() {
        console.group('🔍 VERIFICAÇÃO DE CONFIGURAÇÃO');
        
        const elementos = {
            'nivelAparencia': document.getElementById('nivelAparencia'),
            'pontosAparencia': document.getElementById('pontosAparencia'),
            'displayAparencia': document.getElementById('displayAparencia'),
            'resumoAparencia': document.getElementById('resumoAparencia'),
            'totalSecao1': document.getElementById('totalSecao1')
        };
        
        for (const [id, elemento] of Object.entries(elementos)) {
            if (elemento) {
                console.log(`✅ ${id}: ENCONTRADO`, elemento);
            } else {
                console.error(`❌ ${id}: NÃO ENCONTRADO`);
            }
        }
        
        console.log('📊 Valor atual do select:', elementos.nivelAparencia ? elementos.nivelAparencia.value : 'N/A');
        console.log('🎭 Dados atuais:', this.dadosAtuais);
        
        console.groupEnd();
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

// Criar instância global quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🏗️ DOM Carregado - Iniciando Sistema de Aparência...');
    
    // Inicializar sistema
    window.sistemaAparencia = new SistemaAparencia();
    
    // Expor métodos úteis para debug
    window.debugAparencia = () => window.sistemaAparencia.verificarConfiguracao();
    window.testarAparencia = () => window.sistemaAparencia.testarSistema();
    window.getAparencia = () => window.sistemaAparencia.getDados();
    
    console.log('🎉 Sistema de Aparência inicializado!');
    console.log('📝 Comandos disponíveis no console:');
    console.log('   debugAparencia() - Verificar configuração');
    console.log('   testarAparencia() - Testar todos os níveis');
    console.log('   getAparencia() - Ver dados atuais');
});

// Fallback para caso o DOM já esteja carregado
if (document.readyState !== 'loading') {
    console.log('⚡ DOM já carregado - Inicializando sistema...');
    window.sistemaAparencia = new SistemaAparencia();
}

// ===========================================
// ESTILOS ADICIONAIS (opcional, para melhor visualização)
// ===========================================

// Adicionar alguns estilos inline para melhor visualização
const estiloAparencia = document.createElement('style');
estiloAparencia.textContent = `
    /* Estilos para o badge */
    .pontos-badge.vantagem {
        background: linear-gradient(145deg, #2e5c3a, #27ae60) !important;
        color: white !important;
        border-color: #27ae60 !important;
    }
    
    .pontos-badge.desvantagem {
        background: linear-gradient(145deg, #8b0000, #e74c3c) !important;
        color: white !important;
        border-color: #e74c3c !important;
    }
    
    .pontos-badge.neutro {
        background: linear-gradient(145deg, var(--primary-gold), var(--secondary-gold)) !important;
        color: var(--primary-dark) !important;
        border-color: var(--primary-gold) !important;
    }
    
    /* Estilos para o display */
    .display-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    
    .display-titulo {
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .display-icone {
        font-size: 1.2rem;
    }
    
    .display-nome {
        font-size: 1.1rem;
        font-weight: bold;
    }
    
    .display-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }
    
    .display-reacao {
        color: var(--text-light);
        opacity: 0.95;
        font-size: 0.9rem;
    }
    
    .display-desc {
        color: var(--text-light);
        opacity: 0.8;
        font-size: 0.85rem;
        font-style: italic;
    }
    
    /* Animação suave para mudanças */
    .pontos-badge, .info-display, .resumo-valor, .section-pontos {
        transition: all 0.3s ease;
    }
`;

document.head.appendChild(estiloAparencia);

console.log('🎨 Estilos de aparência carregados');