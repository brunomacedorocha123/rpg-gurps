// peculiaridades.js - Sistema Completo de Peculiaridades para GURPS
// Cada peculiaridade custa -1 ponto, máximo de 5

// ===========================================
// SISTEMA DE PECULIARIDADES
// ===========================================
class SistemaPeculiaridades {
    constructor() {
        this.peculiaridades = [];
        this.maxPeculiaridades = 5;
        this.custoPorPeculiaridade = -1; // -1 ponto cada
        this.estaInicializado = false;
        
        // Bind dos métodos
        this.adicionarPeculiaridade = this.adicionarPeculiaridade.bind(this);
        this.removerPeculiaridade = this.removerPeculiaridade.bind(this);
        
        console.log('🔧 Sistema de Peculiaridades criado');
    }

    inicializar() {
        if (this.estaInicializado) {
            console.log('⚠️ Sistema já inicializado');
            return;
        }

        console.log('🔧 Inicializando sistema de peculiaridades...');
        
        // Referências aos elementos DOM
        this.inputPeculiaridade = document.getElementById('inputPeculiaridade');
        this.btnAdicionar = document.getElementById('btnAdicionarPeculiaridade');
        this.listaPeculiaridades = document.getElementById('listaPeculiaridades');
        this.alertaLimite = document.getElementById('alertaLimite');
        this.contadorElement = document.getElementById('contador-peculiaridades');
        this.pontosElement = document.getElementById('pontos-peculiaridades');
        
        // Verifica se todos os elementos existem
        if (!this.inputPeculiaridade || !this.btnAdicionar || !this.listaPeculiaridades) {
            console.error('❌ Elementos DOM não encontrados para peculiaridades');
            return;
        }
        
        // Carrega dados salvos
        this.carregarDoLocalStorage();
        
        // Configura eventos
        this.configurarEventos();
        
        // Atualiza interface inicial
        this.atualizarInterface();
        
        this.estaInicializado = true;
        console.log('✅ Sistema de peculiaridades inicializado com sucesso');
    }

    configurarEventos() {
        // Botão de adicionar
        this.btnAdicionar.addEventListener('click', this.adicionarPeculiaridade);
        
        // Enter no input
        this.inputPeculiaridade.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.adicionarPeculiaridade();
            }
        });
        
        // Foco no input quando clicar em qualquer lugar da área
        document.querySelector('.peculiaridades-input-area').addEventListener('click', () => {
            this.inputPeculiaridade.focus();
        });
    }

    adicionarPeculiaridade() {
        const texto = this.inputPeculiaridade.value.trim();
        
        // Validações
        if (!texto) {
            this.mostrarMensagem('Digite uma peculiaridade primeiro', 'warning');
            this.inputPeculiaridade.focus();
            return;
        }
        
        if (texto.length < 3) {
            this.mostrarMensagem('A peculiaridade deve ter pelo menos 3 caracteres', 'warning');
            this.inputPeculiaridade.focus();
            return;
        }
        
        if (texto.length > 150) {
            this.mostrarMensagem('A peculiaridade deve ter no máximo 150 caracteres', 'warning');
            return;
        }
        
        if (this.peculiaridades.length >= this.maxPeculiaridades) {
            this.mostrarMensagem(`Limite de ${this.maxPeculiaridades} peculiaridades atingido!`, 'error');
            return;
        }
        
        // Verifica duplicatas (case insensitive)
        const textoLower = texto.toLowerCase();
        if (this.peculiaridades.some(p => p.texto.toLowerCase() === textoLower)) {
            this.mostrarMensagem('Esta peculiaridade já foi adicionada', 'warning');
            return;
        }
        
        // Cria nova peculiaridade
        const novaPeculiaridade = {
            id: Date.now() + Math.random(), // ID único
            texto: texto,
            data: new Date().toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        // Adiciona à lista
        this.peculiaridades.push(novaPeculiaridade);
        
        // Limpa o input
        this.inputPeculiaridade.value = '';
        
        // Salva e atualiza
        this.salvarNoLocalStorage();
        this.atualizarInterface();
        
        // Mensagem de sucesso
        this.mostrarMensagem('Peculiaridade adicionada! -1 ponto', 'success');
        
        // Atualiza contadores globais
        this.atualizarContadoresGlobais();
        
        // Foca no input novamente
        this.inputPeculiaridade.focus();
    }

    removerPeculiaridade(id) {
        if (!confirm('Tem certeza que deseja remover esta peculiaridade?')) {
            return;
        }
        
        const index = this.peculiaridades.findIndex(p => p.id === id);
        if (index !== -1) {
            // Remove da lista
            const removida = this.peculiaridades.splice(index, 1)[0];
            
            // Salva e atualiza
            this.salvarNoLocalStorage();
            this.atualizarInterface();
            
            // Mensagem
            this.mostrarMensagem(`"${removida.texto.substring(0, 30)}..." removida`, 'info');
            
            // Atualiza contadores globais
            this.atualizarContadoresGlobais();
        }
    }

    atualizarInterface() {
        // Atualiza contadores
        const total = this.peculiaridades.length;
        const pontos = this.calcularPontos();
        
        this.contadorElement.textContent = total;
        this.pontosElement.textContent = pontos;
        
        // Atualiza estado do botão
        this.btnAdicionar.disabled = total >= this.maxPeculiaridades;
        if (this.btnAdicionar.disabled) {
            this.btnAdicionar.innerHTML = '<i class="fas fa-ban"></i> Limite Atingido';
        } else {
            this.btnAdicionar.innerHTML = '<i class="fas fa-plus"></i> Adicionar';
        }
        
        // Mostra/oculta alerta de limite
        this.alertaLimite.style.display = total >= this.maxPeculiaridades ? 'block' : 'none';
        
        // Renderiza a lista
        this.renderizarLista();
    }

    renderizarLista() {
        if (this.peculiaridades.length === 0) {
            this.listaPeculiaridades.innerHTML = `
                <div class="lista-vazia">
                    <i class="fas fa-question-circle"></i>
                    <p>Nenhuma peculiaridade adicionada</p>
                    <small>Comece digitando uma peculiaridade acima</small>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        this.peculiaridades.forEach((peculiaridade, index) => {
            html += `
                <div class="peculiaridade-item" data-id="${peculiaridade.id}">
                    <div class="peculiaridade-texto">
                        <div class="peculiaridade-numero">${index + 1}.</div>
                        <div class="peculiaridade-conteudo">
                            <div class="peculiaridade-descricao">${this.escapeHtml(peculiaridade.texto)}</div>
                            <div class="peculiaridade-meta">
                                <i class="far fa-clock"></i> Adicionada em: ${peculiaridade.data}
                            </div>
                        </div>
                    </div>
                    <div class="peculiaridade-acoes">
                        <div class="peculiaridade-custo">
                            ${this.custoPorPeculiaridade} pt
                        </div>
                        <button class="btn-remover-peculiaridade" 
                                onclick="sistemaPeculiaridades.removerPeculiaridade(${peculiaridade.id})"
                                title="Remover peculiaridade">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.listaPeculiaridades.innerHTML = html;
    }

    calcularPontos() {
        return this.peculiaridades.length * this.custoPorPeculiaridade;
    }

    salvarNoLocalStorage() {
        try {
            localStorage.setItem('gurps_peculiaridades', JSON.stringify({
                peculiaridades: this.peculiaridades,
                timestamp: new Date().getTime()
            }));
        } catch (error) {
            console.error('❌ Erro ao salvar peculiaridades:', error);
        }
    }

    carregarDoLocalStorage() {
        try {
            const dados = localStorage.getItem('gurps_peculiaridades');
            if (dados) {
                const parsed = JSON.parse(dados);
                // Verifica se os dados não são muito antigos (7 dias)
                const umaSemana = 7 * 24 * 60 * 60 * 1000;
                if (!parsed.timestamp || (new Date().getTime() - parsed.timestamp) < umaSemana) {
                    this.peculiaridades = parsed.peculiaridades || [];
                }
            }
        } catch (error) {
            console.error('❌ Erro ao carregar peculiaridades:', error);
            this.peculiaridades = [];
        }
    }

    carregarPeculiaridades(dadosExternos) {
        if (dadosExternos && Array.isArray(dadosExternos)) {
            this.peculiaridades = dadosExternos;
            this.salvarNoLocalStorage();
            this.atualizarInterface();
            console.log('📥 Peculiaridades carregadas externamente:', dadosExternos.length);
        }
    }

    obterPeculiaridades() {
        return [...this.peculiaridades]; // Retorna cópia
    }

    limparTudo() {
        if (this.peculiaridades.length === 0) {
            this.mostrarMensagem('Não há peculiaridades para limpar', 'info');
            return;
        }
        
        if (confirm(`Tem certeza que deseja remover todas as ${this.peculiaridades.length} peculiaridades?`)) {
            this.peculiaridades = [];
            this.salvarNoLocalStorage();
            this.atualizarInterface();
            this.mostrarMensagem('Todas as peculiaridades foram removidas', 'success');
            this.atualizarContadoresGlobais();
        }
    }

    atualizarContadoresGlobais() {
        // Esta função será chamada pelo sistema principal se existir
        if (typeof window.atualizarTotalDesvantagens === 'function') {
            window.atualizarTotalDesvantagens();
        }
    }

    mostrarMensagem(texto, tipo = 'info') {
        if (typeof showToast === 'function') {
            showToast(texto, tipo);
        } else {
            console.log(`${tipo}: ${texto}`);
            // Fallback visual
            const mensagem = document.createElement('div');
            mensagem.className = `peculiaridade-mensagem ${tipo}`;
            mensagem.textContent = texto;
            mensagem.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${tipo === 'error' ? '#8b0000' : tipo === 'success' ? '#2e5c3a' : '#2c2008'};
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            `;
            
            document.body.appendChild(mensagem);
            
            setTimeout(() => {
                mensagem.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => mensagem.remove(), 300);
            }, 3000);
        }
    }

    escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    // Método para debug
    debug() {
        console.group('🔍 Debug - Sistema de Peculiaridades');
        console.log('Inicializado:', this.estaInicializado);
        console.log('Total:', this.peculiaridades.length);
        console.log('Peculiaridades:', this.peculiaridades);
        console.log('Pontos:', this.calcularPontos());
        console.groupEnd();
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================
let sistemaPeculiaridades;

function iniciarSistemaPeculiaridades() {
    console.log('🚀 Iniciando sistema de peculiaridades...');
    
    // Verifica se a sub-aba de peculiaridades existe
    const subtabPeculiaridades = document.getElementById('subtab-peculiaridades');
    if (!subtabPeculiaridades) {
        console.error('❌ Sub-aba de peculiaridades não encontrada');
        return null;
    }
    
    if (!sistemaPeculiaridades) {
        sistemaPeculiaridades = new SistemaPeculiaridades();
    }
    
    // Inicializa apenas se não estiver inicializado
    if (!sistemaPeculiaridades.estaInicializado) {
        sistemaPeculiaridades.inicializar();
    }
    
    return sistemaPeculiaridades;
}

// ===========================================
// FUNÇÕES GLOBAIS PARA INTEGRAÇÃO
// ===========================================
window.obterPeculiaridades = function() {
    if (sistemaPeculiaridades) {
        return sistemaPeculiaridades.obterPeculiaridades();
    }
    return [];
};

window.carregarPeculiaridades = function(dados) {
    if (sistemaPeculiaridades) {
        sistemaPeculiaridades.carregarPeculiaridades(dados);
    }
};

window.calcularPontosPeculiaridades = function() {
    if (sistemaPeculiaridades) {
        return sistemaPeculiaridades.calcularPontos();
    }
    return 0;
};

window.limparPeculiaridades = function() {
    if (sistemaPeculiaridades) {
        sistemaPeculiaridades.limparTudo();
    }
};

window.debugPeculiaridades = function() {
    if (sistemaPeculiaridades) {
        sistemaPeculiaridades.debug();
    }
};

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - verificando peculiaridades...');
    
    // Espera um pouco para garantir que tudo está carregado
    setTimeout(() => {
        // Verifica se estamos na aba de vantagens e na sub-aba de peculiaridades
        const vantagensTab = document.getElementById('vantagens');
        const peculiaridadesSubtab = document.getElementById('subtab-peculiaridades');
        
        if (vantagensTab && vantagensTab.classList.contains('active') &&
            peculiaridadesSubtab && peculiaridadesSubtab.classList.contains('active')) {
            
            console.log('🎯 Inicializando peculiaridades automaticamente...');
            iniciarSistemaPeculiaridades();
        }
    }, 500);
});

// Inicializa quando a sub-aba é ativada
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-subtab="peculiaridades"]')) {
        console.log('🎯 Sub-aba de peculiaridades clicada');
        // Pequeno delay para a transição de aba completar
        setTimeout(() => {
            iniciarSistemaPeculiaridades();
        }, 300);
    }
});

// ===========================================
// ADICIONA ESTILOS DINÂMICOS
// ===========================================
(function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .peculiaridade-numero {
            background: var(--primary-gold);
            color: var(--primary-dark);
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
            flex-shrink: 0;
        }
        
        .peculiaridade-conteudo {
            flex: 1;
        }
        
        .peculiaridade-descricao {
            color: var(--text-light);
            margin-bottom: 5px;
            line-height: 1.4;
        }
        
        .peculiaridade-meta {
            color: rgba(212, 175, 55, 0.7);
            font-size: 0.85rem;
        }
        
        .peculiaridade-meta i {
            margin-right: 5px;
        }
        
        .peculiaridade-texto {
            display: flex;
            align-items: flex-start;
            flex: 1;
        }
        
        .peculiaridade-acoes {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .btn-remover-peculiaridade {
            background: rgba(139, 0, 0, 0.2);
            border: 1px solid var(--accent-red);
            border-radius: 4px;
            padding: 6px 10px;
            color: var(--text-light);
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-remover-peculiaridade:hover {
            background: rgba(139, 0, 0, 0.4);
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
})();

console.log('✅ peculiaridades.js carregado com sucesso');