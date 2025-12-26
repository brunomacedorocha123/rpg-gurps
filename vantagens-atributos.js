// vantagens-atributos.js - VERSÃO CORRIGIDA
// Sistema completo para Atributos Complementares + Status & Reputação

// ===========================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÕES
// ===========================================

class SistemaAtributos {
    constructor() {
        console.log('🏗️ Construtor SistemaAtributos iniciado');
        
        // Configuração dos Atributos Complementares
        this.atributos = {
            'forca-vontade': { 
                nome: 'Força de Vontade',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5,
                icone: 'fas fa-brain',
                descricao: 'Resistência mental a medo, dor e influência'
            },
            'percepcao': { 
                nome: 'Percepção',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5,
                icone: 'fas fa-eye',
                descricao: 'Habilidade de perceber detalhes e perigos'
            },
            'pv': { 
                nome: 'Pontos de Vida',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 2,
                icone: 'fas fa-heartbeat',
                descricao: 'Resistência física e vitalidade'
            },
            'pf': { 
                nome: 'Pontos de Fadiga',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 3,
                icone: 'fas fa-wind',
                descricao: 'Energia para ações físicas e mentais'
            },
            'velocidade': { 
                nome: 'Velocidade Básica',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5, 
                fator: 0.25,
                icone: 'fas fa-tachometer-alt',
                descricao: 'Velocidade de movimento e iniciativa'
            },
            'deslocamento': { 
                nome: 'Deslocamento Básico',
                nivel: 0, 
                direcao: null, 
                custoPorNivel: 5, 
                fator: 1,
                icone: 'fas fa-running',
                descricao: 'Distância percorrida por turno'
            }
        };
        
        // Configuração de Status & Reputação
        this.status = {
            'status': { 
                nome: 'Status',
                nivel: 0, 
                direcao: 'neutro', 
                custoPorNivel: 5,
                descricoes: {
                    positivo: ['Respeitado', 'Honrado', 'Prestigiado', 'Ilustre'],
                    negativo: ['Desprezado', 'Humilhado', 'Infame', 'Pária']
                }
            },
            'reputacao': { 
                nome: 'Reputação',
                nivel: 0, 
                direcao: 'neutro', 
                custoPorNivel: 5,
                descricoes: {
                    positivo: ['Conhecido', 'Respeitado', 'Famoso', 'Lendário'],
                    negativo: ['Notório', 'Temido', 'Odiado', 'Infame']
                }
            }
        };
        
        // Adiciona um pequeno delay para garantir que o DOM está pronto
        setTimeout(() => {
            this.init();
        }, 100);
    }
    
    // ===========================================
    // INICIALIZAÇÃO - VERSÃO CORRIGIDA
    // ===========================================
    
    init() {
        console.log('🚀 SistemaAtributos.init() chamado');
        
        // DEBUG: Verificar se os elementos existem
        const atributosCount = document.querySelectorAll('.atributo-item').length;
        const statusCount = document.querySelectorAll('.status-item').length;
        console.log(`🔍 Encontrados ${atributosCount} atributos e ${statusCount} status`);
        
        if (atributosCount === 0) {
            console.error('❌ Nenhum elemento .atributo-item encontrado!');
            console.log('🔍 Tentando novamente em 500ms...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        this.setupAtributos();
        this.setupStatus();
        this.calcularTotais();
        this.setupEventListeners();
        this.carregarDoLocalStorage();
        
        console.log('✅ SistemaAtributos inicializado com sucesso');
    }
    
    setupEventListeners() {
        // Evento para salvar automaticamente
        document.addEventListener('vantagensAlteradas', () => {
            this.salvarNoLocalStorage();
            this.calcularTotais();
        });
    }
    
    // ===========================================
    // ATRIBUTOS COMPLEMENTARES - VERSÃO CORRIGIDA
    // ===========================================
    
    setupAtributos() {
        const atributosItems = document.querySelectorAll('.atributo-item');
        console.log(`🔧 Configurando ${atributosItems.length} atributos...`);
        
        atributosItems.forEach((item, index) => {
            const tipo = item.dataset.tipo;
            console.log(`  ${index + 1}. ${tipo}`);
            
            // Elementos DOM
            const elementos = {
                btnVantagem: item.querySelector('.btn-vantagem'),
                btnDesvantagem: item.querySelector('.btn-desvantagem'),
                btnMenos: item.querySelector('.btn-nivel.menos'),
                btnMais: item.querySelector('.btn-nivel.mais'),
                displayNivel: item.querySelector('.nivel-display'),
                statusDirecao: item.querySelector('.status-direcao'),
                custoDisplay: item.querySelector('.custo-valor')
            };
            
            // DEBUG: Verificar se elementos foram encontrados
            if (!elementos.btnVantagem) {
                console.error(`❌ Botão vantagem não encontrado para ${tipo}`);
            }
            
            // Eventos de direção - COM DEBUG
            elementos.btnVantagem.addEventListener('click', (e) => {
                console.log(`🎯 Vantagem clicada: ${tipo}`, e.target);
                this.setDirecaoAtributo(tipo, 'positivo');
            });
            
            elementos.btnDesvantagem.addEventListener('click', (e) => {
                console.log(`🎯 Desvantagem clicada: ${tipo}`, e.target);
                this.setDirecaoAtributo(tipo, 'negativo');
            });
            
            // Eventos de nível
            elementos.btnMenos.addEventListener('click', () => {
                console.log(`➖ Menos clicado: ${tipo}`);
                this.ajustarNivelAtributo(tipo, -1);
            });
            
            elementos.btnMais.addEventListener('click', () => {
                console.log(`➕ Mais clicado: ${tipo}`);
                this.ajustarNivelAtributo(tipo, 1);
            });
            
            // Tooltip
            const icon = item.querySelector('.atributo-header i');
            if (icon) {
                icon.title = this.atributos[tipo]?.descricao || '';
            }
        });
    }
    
    setDirecaoAtributo(tipo, direcao) {
        console.log(`🔄 setDirecaoAtributo: ${tipo} -> ${direcao}`);
        
        const atributo = this.atributos[tipo];
        if (!atributo) {
            console.error(`❌ Atributo ${tipo} não encontrado`);
            return;
        }
        
        // Se clicar na mesma direção, desativa
        if (atributo.direcao === direcao) {
            atributo.direcao = null;
            atributo.nivel = 0;
            console.log(`  ↪ Desativado ${tipo}`);
        } else {
            // Nova direção
            atributo.direcao = direcao;
            atributo.nivel = direcao === 'positivo' ? 1 : -1;
            console.log(`  ↪ Nova direção: ${direcao}, nível: ${atributo.nivel}`);
        }
        
        this.atualizarDisplayAtributo(tipo);
        this.dispatchAlteracao();
    }
    
    ajustarNivelAtributo(tipo, delta) {
        console.log(`📊 ajustarNivelAtributo: ${tipo} ${delta > 0 ? '+' : ''}${delta}`);
        
        const atributo = this.atributos[tipo];
        
        if (!atributo.direcao) {
            console.log(`  ⚠️ Precisa escolher direção primeiro`);
            return; // Precisa ter direção primeiro
        }
        
        let novoNivel = atributo.nivel + delta;
        
        // Limites por direção
        if (atributo.direcao === 'positivo') {
            if (novoNivel < 1) novoNivel = 1;
            if (novoNivel > 10) novoNivel = 10;
        } else {
            if (novoNivel > -1) novoNivel = -1;
            if (novoNivel < -10) novoNivel = -10;
        }
        
        console.log(`  ↪ Novo nível: ${novoNivel}`);
        atributo.nivel = novoNivel;
        this.atualizarDisplayAtributo(tipo);
        this.dispatchAlteracao();
    }
    
    atualizarDisplayAtributo(tipo) {
        const item = document.querySelector(`.atributo-item[data-tipo="${tipo}"]`);
        if (!item) {
            console.error(`❌ Item não encontrado: ${tipo}`);
            return;
        }
        
        const atributo = this.atributos[tipo];
        const elementos = {
            btnVantagem: item.querySelector('.btn-vantagem'),
            btnDesvantagem: item.querySelector('.btn-desvantagem'),
            btnMenos: item.querySelector('.btn-nivel.menos'),
            btnMais: item.querySelector('.btn-nivel.mais'),
            displayNivel: item.querySelector('.nivel-display'),
            statusDirecao: item.querySelector('.status-direcao'),
            custoDisplay: item.querySelector('.custo-valor')
        };
        
        // Estado dos botões de direção
        elementos.btnVantagem.classList.toggle('active', atributo.direcao === 'positivo');
        elementos.btnDesvantagem.classList.toggle('active', atributo.direcao === 'negativo');
        
        // Estado dos botões de nível
        const podeDiminuir = atributo.direcao && 
            ((atributo.direcao === 'positivo' && atributo.nivel > 1) ||
             (atributo.direcao === 'negativo' && atributo.nivel < -1));
        
        const podeAumentar = atributo.direcao && 
            ((atributo.direcao === 'positivo' && atributo.nivel < 10) ||
             (atributo.direcao === 'negativo' && atributo.nivel > -10));
        
        elementos.btnMenos.disabled = !podeDiminuir;
        elementos.btnMais.disabled = !podeAumentar;
        
        // Display do nível
        let nivelDisplay = Math.abs(atributo.nivel);
        if (tipo === 'velocidade') {
            elementos.displayNivel.textContent = (nivelDisplay * atributo.fator).toFixed(2);
        } else if (tipo === 'deslocamento') {
            elementos.displayNivel.textContent = nivelDisplay * atributo.fator;
        } else {
            elementos.displayNivel.textContent = nivelDisplay;
        }
        
        // Status da direção
        let direcaoTexto = 'Neutro';
        if (atributo.direcao === 'positivo') direcaoTexto = 'Vantagem';
        if (atributo.direcao === 'negativo') direcaoTexto = 'Desvantagem';
        
        elementos.statusDirecao.textContent = direcaoTexto;
        elementos.statusDirecao.className = 'status-direcao ' + (atributo.direcao || 'neutro');
        
        // Cálculo do custo
        let custo = 0;
        if (atributo.direcao) {
            const niveisAbs = Math.abs(atributo.nivel);
            custo = niveisAbs * atributo.custoPorNivel;
            custo = atributo.direcao === 'negativo' ? -custo : custo;
        }
        
        elementos.custoDisplay.textContent = custo > 0 ? `+${custo}` : custo;
        elementos.custoDisplay.className = 'custo-valor ' + 
            (custo > 0 ? 'positivo' : custo < 0 ? 'negativo' : '');
        
        // Atualiza a classe do item
        item.classList.toggle('ativo', atributo.direcao !== null);
        
        console.log(`  ✅ ${tipo} atualizado: nível=${atributo.nivel}, custo=${custo}`);
    }
    
    // ===========================================
    // STATUS & REPUTAÇÃO - VERSÃO CORRIGIDA
    // ===========================================
    
    setupStatus() {
        const statusItems = document.querySelectorAll('.status-item');
        console.log(`🔧 Configurando ${statusItems.length} status...`);
        
        statusItems.forEach((item, index) => {
            const tipo = item.dataset.tipo;
            console.log(`  ${index + 1}. ${tipo}`);
            
            // Elementos DOM
            const elementos = {
                radios: item.querySelectorAll('input[type="radio"]'),
                btnMenos: item.querySelector('.btn-nivel-status.menos'),
                btnMais: item.querySelector('.btn-nivel-status.mais'),
                nivelDisplay: item.querySelector('.nivel-valor'),
                descDisplay: item.querySelector(`#desc${this.capitalize(tipo)}`),
                custoDisplay: item.querySelector(`#custo${this.capitalize(tipo)}`)
            };
            
            // Eventos para radios
            elementos.radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        console.log(`🎯 Radio ${tipo}: ${e.target.value}`);
                        this.setDirecaoStatus(tipo, e.target.value);
                    }
                });
            });
            
            // Eventos para botões de nível
            elementos.btnMenos.addEventListener('click', () => {
                console.log(`➖ Status ${tipo} menos`);
                this.ajustarNivelStatus(tipo, -1);
            });
            
            elementos.btnMais.addEventListener('click', () => {
                console.log(`➕ Status ${tipo} mais`);
                this.ajustarNivelStatus(tipo, 1);
            });
            
            // Atualizar display inicial
            this.atualizarDisplayStatus(tipo);
        });
    }
    
    setDirecaoStatus(tipo, direcao) {
        console.log(`🔄 setDirecaoStatus: ${tipo} -> ${direcao}`);
        
        const status = this.status[tipo];
        
        if (direcao === 'neutro') {
            status.direcao = 'neutro';
            status.nivel = 0;
        } else {
            status.direcao = direcao;
            status.nivel = direcao === 'positivo' ? 1 : -1;
        }
        
        this.atualizarDisplayStatus(tipo);
        this.dispatchAlteracao();
    }
    
    ajustarNivelStatus(tipo, delta) {
        console.log(`📊 ajustarNivelStatus: ${tipo} ${delta > 0 ? '+' : ''}${delta}`);
        
        const status = this.status[tipo];
        
        if (status.direcao === 'neutro') {
            console.log(`  ⚠️ Precisa escolher direção primeiro`);
            return; // Precisa escolher direção primeiro
        }
        
        let novoNivel = status.nivel + delta;
        
        // Limites: 1 a 4 para positivo, -1 a -4 para negativo
        if (status.direcao === 'positivo') {
            if (novoNivel < 1) novoNivel = 1;
            if (novoNivel > 4) novoNivel = 4;
        } else {
            if (novoNivel > -1) novoNivel = -1;
            if (novoNivel < -4) novoNivel = -4;
        }
        
        console.log(`  ↪ Novo nível: ${novoNivel}`);
        status.nivel = novoNivel;
        this.atualizarDisplayStatus(tipo);
        this.dispatchAlteracao();
    }
    
    atualizarDisplayStatus(tipo) {
        const item = document.querySelector(`.status-item[data-tipo="${tipo}"]`);
        if (!item) {
            console.error(`❌ Status item não encontrado: ${tipo}`);
            return;
        }
        
        const status = this.status[tipo];
        const elementos = {
            radios: item.querySelectorAll('input[type="radio"]'),
            btnMenos: item.querySelector('.btn-nivel-status.menos'),
            btnMais: item.querySelector('.btn-nivel-status.mais'),
            nivelDisplay: item.querySelector('.nivel-valor'),
            descDisplay: item.querySelector(`#desc${this.capitalize(tipo)}`),
            custoDisplay: item.querySelector(`#custo${this.capitalize(tipo)}`)
        };
        
        // Ativar radio correto
        elementos.radios.forEach(radio => {
            radio.checked = radio.value === status.direcao;
        });
        
        // Estado dos botões de nível
        const podeDiminuir = status.direcao !== 'neutro' && 
            ((status.direcao === 'positivo' && status.nivel > 1) ||
             (status.direcao === 'negativo' && status.nivel < -1));
        
        const podeAumentar = status.direcao !== 'neutro' && 
            ((status.direcao === 'positivo' && status.nivel < 4) ||
             (status.direcao === 'negativo' && status.nivel > -4));
        
        elementos.btnMenos.disabled = !podeDiminuir;
        elementos.btnMais.disabled = !podeAumentar;
        
        // Display do nível
        const nivelAbs = Math.abs(status.nivel);
        elementos.nivelDisplay.textContent = nivelAbs;
        
        // Descrição baseada no nível
        let descricao = '';
        if (status.direcao === 'neutro') {
            descricao = `${status.nome} padrão, sem modificadores`;
        } else {
            const descricoes = status.descricoes[status.direcao];
            const indice = nivelAbs - 1;
            if (indice >= 0 && indice < descricoes.length) {
                descricao = `${descricoes[indice]}: ${status.nome} ${status.direcao === 'positivo' ? 'elevado' : 'baixo'} (nível ${nivelAbs})`;
            }
        }
        
        if (elementos.descDisplay) {
            elementos.descDisplay.textContent = descricao;
        }
        
        // Cálculo do custo
        let custo = 0;
        if (status.direcao !== 'neutro') {
            custo = nivelAbs * status.custoPorNivel;
            custo = status.direcao === 'negativo' ? -custo : custo;
        }
        
        if (elementos.custoDisplay) {
            elementos.custoDisplay.textContent = custo > 0 ? `+${custo}` : custo;
            elementos.custoDisplay.className = 'custo-total ' + 
                (custo > 0 ? 'positivo' : custo < 0 ? 'negativo' : '');
        }
    }
    
    // ===========================================
    // CÁLCULOS E TOTAIS - VERSÃO CORRIGIDA
    // ===========================================
    
    calcularTotais() {
        console.log('🧮 Calculando totais...');
        
        let totalAtributos = 0;
        let totalStatus = 0;
        
        // Soma atributos
        Object.values(this.atributos).forEach(atributo => {
            if (atributo.direcao) {
                const custo = Math.abs(atributo.nivel) * atributo.custoPorNivel;
                totalAtributos += atributo.direcao === 'positivo' ? custo : -custo;
            }
        });
        
        // Soma status
        Object.values(this.status).forEach(status => {
            if (status.direcao !== 'neutro') {
                const custo = Math.abs(status.nivel) * status.custoPorNivel;
                totalStatus += status.direcao === 'positivo' ? custo : -custo;
            }
        });
        
        // Atualiza displays
        const totalAtributosEl = document.getElementById('totalAtributos');
        const totalStatusRepEl = document.getElementById('totalStatusRep');
        const totalGeralEl = document.getElementById('totalGeral');
        const pontosAtributosEl = document.getElementById('pontosAtributos');
        const pontosStatusEl = document.getElementById('pontosStatus');
        
        if (totalAtributosEl) {
            totalAtributosEl.textContent = totalAtributos > 0 ? `+${totalAtributos}` : totalAtributos;
        }
        
        if (totalStatusRepEl) {
            totalStatusRepEl.textContent = totalStatus > 0 ? `+${totalStatus}` : totalStatus;
        }
        
        const totalGeral = totalAtributos + totalStatus;
        if (totalGeralEl) {
            totalGeralEl.textContent = totalGeral > 0 ? `+${totalGeral}` : totalGeral;
        }
        
        // Atualiza badges individuais
        if (pontosAtributosEl) {
            pontosAtributosEl.textContent = `${totalAtributos > 0 ? '+' : ''}${totalAtributos} pts`;
            pontosAtributosEl.className = 'pontos-badge ' + 
                (totalAtributos > 0 ? 'positivo' : totalAtributos < 0 ? 'negativo' : 'neutro');
        }
        
        if (pontosStatusEl) {
            pontosStatusEl.textContent = `${totalStatus > 0 ? '+' : ''}${totalStatus} pts`;
            pontosStatusEl.className = 'pontos-badge ' + 
                (totalStatus > 0 ? 'positivo' : totalStatus < 0 ? 'negativo' : 'neutro');
        }
        
        console.log(`  📊 Atributos: ${totalAtributos}, Status: ${totalStatus}, Total: ${totalGeral}`);
        
        return { totalAtributos, totalStatus, totalGeral };
    }
    
    // ===========================================
    // PERSISTÊNCIA (LocalStorage)
    // ===========================================
    
    salvarNoLocalStorage() {
        const dados = {
            atributos: this.atributos,
            status: this.status,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('vantagensAtributos', JSON.stringify(dados));
        console.log('💾 Dados salvos no localStorage');
    }
    
    carregarDoLocalStorage() {
        try {
            const dados = localStorage.getItem('vantagensAtributos');
            if (dados) {
                const parsed = JSON.parse(dados);
                
                // Carrega atributos
                if (parsed.atributos) {
                    Object.keys(parsed.atributos).forEach(key => {
                        if (this.atributos[key]) {
                            Object.assign(this.atributos[key], parsed.atributos[key]);
                            this.atualizarDisplayAtributo(key);
                        }
                    });
                }
                
                // Carrega status
                if (parsed.status) {
                    Object.keys(parsed.status).forEach(key => {
                        if (this.status[key]) {
                            Object.assign(this.status[key], parsed.status[key]);
                            this.atualizarDisplayStatus(key);
                        }
                    });
                }
                
                this.calcularTotais();
                console.log('✅ Dados de atributos carregados do localStorage');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar do localStorage:', error);
        }
    }
    
    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    dispatchAlteracao() {
        console.log('🔄 Disparando evento vantagensAlteradas');
        const evento = new Event('vantagensAlteradas');
        document.dispatchEvent(evento);
    }
    
    // ===========================================
    // MÉTODOS PÚBLICOS
    // ===========================================
    
    getDadosParaSalvar() {
        return {
            atributos: this.atributos,
            status: this.status,
            totais: this.calcularTotais()
        };
    }
    
    resetar() {
        console.log('🔄 Resetando sistema de atributos');
        
        // Reseta atributos
        Object.values(this.atributos).forEach(atributo => {
            atributo.nivel = 0;
            atributo.direcao = null;
        });
        
        // Reseta status
        Object.values(this.status).forEach(status => {
            status.nivel = 0;
            status.direcao = 'neutro';
        });
        
        // Atualiza displays
        Object.keys(this.atributos).forEach(tipo => this.atualizarDisplayAtributo(tipo));
        Object.keys(this.status).forEach(tipo => this.atualizarDisplayStatus(tipo));
        
        this.calcularTotais();
        this.salvarNoLocalStorage();
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL - VERSÃO SIMPLIFICADA
// ===========================================

let sistemaAtributos = null;

// Função para inicializar quando a aba estiver pronta
function initVantagensAtributosTab() {
    console.log('🔧 initVantagensAtributosTab() chamada');
    
    if (!sistemaAtributos) {
        // Espera um pouco para garantir que o DOM está totalmente carregado
        setTimeout(() => {
            sistemaAtributos = new SistemaAtributos();
            console.log('🎉 Sistema de Atributos inicializado com sucesso!');
        }, 300);
    }
    
    return sistemaAtributos;
}

// Exporta para uso global
window.SistemaAtributos = SistemaAtributos;
window.initVantagensAtributosTab = initVantagensAtributosTab;
window.sistemaAtributos = null; // Variável global

// Inicialização automática quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM completamente carregado');
    
    // Verifica se estamos na aba de vantagens
    const vantagensTab = document.getElementById('vantagens');
    if (vantagensTab) {
        console.log('📍 Aba vantagens encontrada');
        
        // Inicializa imediatamente se a aba já estiver ativa
        if (vantagensTab.classList.contains('active')) {
            console.log('🚀 Aba vantagens ativa - inicializando...');
            initVantagensAtributosTab();
        }
        
        // Observa mudanças na aba (caso use sistema de tabs)
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    if (vantagensTab.classList.contains('active')) {
                        console.log('🔄 Aba vantagens tornou-se ativa');
                        if (!sistemaAtributos) {
                            initVantagensAtributosTab();
                        }
                    }
                }
            });
        });
        
        observer.observe(vantagensTab, { attributes: true });
    }
    
    // Também inicializa se o usuário clicar na aba
    document.addEventListener('click', function(e) {
        if (e.target.closest('.tab-btn') && e.target.closest('.tab-btn').dataset.tab === 'vantagens') {
            console.log('🎯 Usuário clicou na aba vantagens');
            setTimeout(() => {
                if (!sistemaAtributos) {
                    initVantagensAtributosTab();
                }
            }, 100);
        }
    });
});

// Função para forçar inicialização (útil para debugging)
window.forcarInicializacaoVantagens = function() {
    console.log('🛠️ Forçando inicialização do sistema de vantagens');
    sistemaAtributos = null;
    initVantagensAtributosTab();
};