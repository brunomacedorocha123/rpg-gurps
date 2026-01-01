// ===========================================
// DASHBOARD-VANT.JS
// Sistema de vantagens/desvantagens para dashboard
// ===========================================

class DashboardVant {
    constructor() {
        console.log('🎮 DashboardVant iniciando...');
        
        this.vantagens = {
            total: 0,
            count: 0,
            itens: []
        };
        
        this.desvantagens = {
            total: 0,
            count: 0,
            itens: []
        };
        
        this.caracteristicas = {
            aparencia: 0,
            riqueza: 0,
            idiomas: 0,
            relacionamentos: 0
        };
        
        this.inicializado = false;
        this.observadores = [];
        
        this.carregarStorage();
    }
    
    inicializar() {
        if (this.inicializado) return;
        
        console.log('🚀 Inicializando DashboardVant...');
        
        this.configurarEventos();
        this.sincronizarComSistemas();
        this.atualizarDashboard();
        this.iniciarObservadores();
        
        this.inicializado = true;
        console.log('✅ DashboardVant pronto');
    }
    
    configurarEventos() {
        // Eventos de características
        document.addEventListener('caracteristicasAtualizadas', (e) => {
            this.atualizarCaracteristica(e.detail);
        });
        
        // Observar inputs da dashboard
        document.addEventListener('input', (e) => {
            if (e.target.id === 'start-points' || e.target.id === 'dis-limit') {
                setTimeout(() => this.atualizarSaldo(), 100);
            }
        });
        
        // Observar mudanças nos sistemas
        this.criarObservadorSistemas();
    }
    
    sincronizarComSistemas() {
        console.log('🔍 Sincronizando com sistemas...');
        
        // Aparência
        const selectAparencia = document.getElementById('nivelAparencia');
        if (selectAparencia) {
            this.caracteristicas.aparencia = parseInt(selectAparencia.value) || 0;
        }
        
        // Riqueza
        const selectRiqueza = document.getElementById('nivelRiqueza');
        if (selectRiqueza) {
            this.caracteristicas.riqueza = parseInt(selectRiqueza.value) || 0;
            this.atualizarNivelRiqueza();
        }
        
        // Vantagens/Desvantagens dos sistemas
        this.sincronizarVantagens();
        this.sincronizarDesvantagens();
        
        // Idiomas
        this.sincronizarIdiomas();
    }
    
    sincronizarVantagens() {
        let pontos = 0;
        let count = 0;
        
        // Do sistema de vantagens
        if (window.vantagensSystem?.vantagensAdquiridas) {
            pontos = window.vantagensSystem.vantagensAdquiridas.reduce((sum, v) => sum + (v.custo || 0), 0);
            count = window.vantagensSystem.vantagensAdquiridas.length;
        }
        
        // Da interface
        const totalElement = document.getElementById('total-pontos-vantagens');
        if (totalElement) {
            const texto = totalElement.textContent.replace('pts', '').trim();
            pontos = parseInt(texto) || pontos;
        }
        
        const custoElement = document.getElementById('custo-vantagens');
        if (custoElement && !totalElement) {
            const texto = custoElement.textContent;
            const match = texto.match(/(\d+)/);
            pontos = match ? parseInt(match[0]) : pontos;
        }
        
        this.vantagens.total = pontos;
        this.vantagens.count = count;
        
        // Atualizar na dashboard
        this.atualizarElemento('sum-advantages', count);
    }
    
    sincronizarDesvantagens() {
        let pontos = 0;
        let count = 0;
        
        // Do sistema de desvantagens
        if (window.desvantagensSystem?.desvantagensAdquiridas) {
            pontos = window.desvantagensSystem.desvantagensAdquiridas.reduce((sum, d) => sum + (d.custo || 0), 0);
            count = window.desvantagensSystem.desvantagensAdquiridas.length;
        }
        
        // Da interface
        const totalElement = document.getElementById('total-pontos-desvantagens');
        if (totalElement) {
            const texto = totalElement.textContent.replace('pts', '').trim();
            pontos = parseInt(texto) || pontos;
        }
        
        const custoElement = document.getElementById('custo-desvantagens');
        if (custoElement && !totalElement) {
            const texto = custoElement.textContent;
            const match = texto.match(/(\d+)/);
            pontos = match ? parseInt(match[0]) : pontos;
        }
        
        this.desvantagens.total = pontos;
        this.desvantagens.count = count;
        
        // Atualizar na dashboard
        this.atualizarElemento('sum-disadvantages', count);
    }
    
    sincronizarIdiomas() {
        let pontos = 0;
        let totalIdiomas = 1; // Idioma materno
        
        // Do sistema de idiomas
        if (window.sistemaIdiomas) {
            if (sistemaIdiomas.calcularPontosIdiomas) {
                pontos = sistemaIdiomas.calcularPontosIdiomas();
            }
            totalIdiomas += sistemaIdiomas.idiomasAdicionais?.length || 0;
        }
        
        // Do badge
        const badge = document.getElementById('pontosIdiomas');
        if (badge) {
            const texto = badge.textContent;
            const match = texto.match(/([+-]?\d+)/);
            pontos = match ? parseInt(match[0]) : pontos;
        }
        
        // Da lista
        const lista = document.getElementById('listaIdiomasAdicionais');
        if (lista) {
            const itens = lista.querySelectorAll('.idioma-item');
            totalIdiomas += itens.length;
        }
        
        this.caracteristicas.idiomas = pontos;
        
        // Atualizar contador
        this.atualizarElemento('sum-languages', totalIdiomas);
    }
    
    atualizarCaracteristica(detalhe) {
        if (!detalhe) return;
        
        switch(detalhe.tipo) {
            case 'aparencia':
                this.caracteristicas.aparencia = detalhe.pontos || 0;
                this.atualizarAparencia();
                break;
                
            case 'riqueza':
                this.caracteristicas.riqueza = detalhe.pontos || 0;
                this.atualizarNivelRiqueza();
                break;
                
            case 'idiomas':
                this.caracteristicas.idiomas = detalhe.pontos || 0;
                this.atualizarIdiomas();
                break;
        }
        
        this.atualizarDashboard();
        this.salvarStorage();
    }
    
    atualizarAparencia() {
        const appElement = document.getElementById('app-mod');
        if (appElement) {
            const pontos = this.caracteristicas.aparencia;
            appElement.textContent = pontos >= 0 ? `+${pontos}` : pontos;
            appElement.style.color = pontos >= 0 ? '#27ae60' : '#e74c3c';
        }
        this.atualizarReacaoTotal();
    }
    
    atualizarNivelRiqueza() {
        const pontos = this.caracteristicas.riqueza;
        const wealthElement = document.getElementById('wealth-level');
        
        if (wealthElement) {
            const niveis = {
                '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
                '0': 'Médio', '10': 'Confortável', '20': 'Rico',
                '30': 'Muito Rico', '50': 'Podre Rico'
            };
            
            wealthElement.textContent = niveis[pontos.toString()] || 'Médio';
        }
        
        const wealthCost = document.querySelector('.wealth-cost');
        if (wealthCost) {
            wealthCost.textContent = `[${pontos >= 0 ? '+' : ''}${pontos} pts]`;
        }
    }
    
    atualizarIdiomas() {
        // Já é atualizado em sincronizarIdiomas()
        this.sincronizarIdiomas();
    }
    
    atualizarDashboard() {
        this.atualizarPontos();
        this.atualizarSaldo();
        this.atualizarReacaoTotal();
        this.atualizarTimestamp();
        
        this.validarLimites();
    }
    
    atualizarPontos() {
        // Calcular vantagens totais (positivas)
        const vantagensTotal = this.vantagens.total +
            (this.caracteristicas.aparencia > 0 ? this.caracteristicas.aparencia : 0) +
            (this.caracteristicas.riqueza > 0 ? this.caracteristicas.riqueza : 0) +
            (this.caracteristicas.idiomas > 0 ? this.caracteristicas.idiomas : 0) +
            (this.caracteristicas.relacionamentos > 0 ? this.caracteristicas.relacionamentos : 0);
        
        // Calcular desvantagens totais (negativas)
        const desvantagensTotal = Math.abs(this.desvantagens.total) +
            (this.caracteristicas.aparencia < 0 ? Math.abs(this.caracteristicas.aparencia) : 0) +
            (this.caracteristicas.riqueza < 0 ? Math.abs(this.caracteristicas.riqueza) : 0) +
            (this.caracteristicas.idiomas < 0 ? Math.abs(this.caracteristicas.idiomas) : 0) +
            (this.caracteristicas.relacionamentos < 0 ? Math.abs(this.caracteristicas.relacionamentos) : 0);
        
        // Atualizar na dashboard
        this.atualizarElemento('points-adv', vantagensTotal);
        this.atualizarElemento('points-dis', -desvantagensTotal); // Negativo
    }
    
    atualizarSaldo() {
        const pontosIniciais = parseInt(document.getElementById('start-points')?.value || 100);
        
        const vantagensTotal = this.vantagens.total +
            (this.caracteristicas.aparencia > 0 ? this.caracteristicas.aparencia : 0) +
            (this.caracteristicas.riqueza > 0 ? this.caracteristicas.riqueza : 0) +
            (this.caracteristicas.idiomas > 0 ? this.caracteristicas.idiomas : 0) +
            (this.caracteristicas.relacionamentos > 0 ? this.caracteristicas.relacionamentos : 0);
        
        const desvantagensTotal = Math.abs(this.desvantagens.total) +
            (this.caracteristicas.aparencia < 0 ? Math.abs(this.caracteristicas.aparencia) : 0) +
            (this.caracteristicas.riqueza < 0 ? Math.abs(this.caracteristicas.riqueza) : 0) +
            (this.caracteristicas.idiomas < 0 ? Math.abs(this.caracteristicas.idiomas) : 0) +
            (this.caracteristicas.relacionamentos < 0 ? Math.abs(this.caracteristicas.relacionamentos) : 0);
        
        const pericias = parseInt(document.getElementById('points-skills')?.textContent || 0);
        const magias = parseInt(document.getElementById('points-spells')?.textContent || 0);
        
        const saldo = pontosIniciais - vantagensTotal - desvantagensTotal - pericias - magias;
        
        this.atualizarElemento('points-balance', saldo);
    }
    
    atualizarReacaoTotal() {
        const statusMod = parseInt(document.getElementById('status-mod')?.textContent || 0);
        const repMod = parseInt(document.getElementById('rep-mod')?.textContent || 0);
        const appMod = this.caracteristicas.aparencia || 0;
        
        const total = statusMod + repMod + appMod;
        const reactionElement = document.getElementById('reaction-total');
        
        if (reactionElement) {
            reactionElement.textContent = total >= 0 ? `+${total}` : total;
            reactionElement.style.color = total >= 0 ? '#27ae60' : '#e74c3c';
        }
    }
    
    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        
        elemento.textContent = valor;
        
        // Aplicar cores
        if (id.includes('adv') || id.includes('balance')) {
            elemento.style.color = valor >= 0 ? '#27ae60' : '#e74c3c';
        } else if (id.includes('dis')) {
            elemento.style.color = valor < 0 ? '#e74c3c' : '#95a5a6';
            if (valor < 0) {
                elemento.textContent = valor;
            }
        }
    }
    
    atualizarTimestamp() {
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            const now = new Date();
            timeElement.textContent = now.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    
    validarLimites() {
        const limiteInput = document.getElementById('dis-limit');
        if (!limiteInput) return;
        
        const limite = Math.abs(parseInt(limiteInput.value) || 75);
        
        // Calcular desvantagens totais
        const desvantagensTotal = Math.abs(this.desvantagens.total) +
            (this.caracteristicas.aparencia < 0 ? Math.abs(this.caracteristicas.aparencia) : 0) +
            (this.caracteristicas.riqueza < 0 ? Math.abs(this.caracteristicas.riqueza) : 0) +
            (this.caracteristicas.idiomas < 0 ? Math.abs(this.caracteristicas.idiomas) : 0) +
            (this.caracteristicas.relacionamentos < 0 ? Math.abs(this.caracteristicas.relacionamentos) : 0);
        
        if (desvantagensTotal > limite) {
            const disElement = document.getElementById('points-dis');
            if (disElement) {
                disElement.style.color = '#ff0000';
                disElement.style.fontWeight = 'bold';
                console.warn(`⚠️ Limite de desvantagens excedido: ${desvantagensTotal}/${limite}`);
            }
        }
    }
    
    // ===========================================
    // OBSERVADORES
    // ===========================================
    
    criarObservadorSistemas() {
        // Observar mudanças nos sistemas de vantagens/desvantagens
        const observer = new MutationObserver(() => {
            this.sincronizarVantagens();
            this.sincronizarDesvantagens();
            this.atualizarDashboard();
        });
        
        // Observar elementos das abas de vantagens/desvantagens
        const elementos = [
            document.getElementById('total-pontos-vantagens'),
            document.getElementById('custo-vantagens'),
            document.getElementById('total-pontos-desvantagens'),
            document.getElementById('custo-desvantagens'),
            document.querySelector('.vantagens-escolhidas-scroll'),
            document.querySelector('.desvantagens-escolhidas-scroll')
        ].filter(el => el !== null);
        
        elementos.forEach(el => {
            observer.observe(el, {
                childList: true,
                subtree: true,
                characterData: true
            });
        });
        
        this.observadores.push(observer);
    }
    
    iniciarObservadores() {
        // Verificar atualizações periódicas
        setInterval(() => {
            this.sincronizarComSistemas();
            this.atualizarDashboard();
        }, 3000);
    }
    
    // ===========================================
    // STORAGE
    // ===========================================
    
    salvarStorage() {
        try {
            const dados = {
                vantagens: this.vantagens,
                desvantagens: this.desvantagens,
                caracteristicas: this.caracteristicas,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('dashboard_vant', JSON.stringify(dados));
        } catch (error) {
            console.warn('Erro ao salvar:', error);
        }
    }
    
    carregarStorage() {
        try {
            const dados = localStorage.getItem('dashboard_vant');
            if (dados) {
                const parsed = JSON.parse(dados);
                
                if (parsed.vantagens) this.vantagens = parsed.vantagens;
                if (parsed.desvantagens) this.desvantagens = parsed.desvantagens;
                if (parsed.caracteristicas) this.caracteristicas = parsed.caracteristicas;
                
                console.log('📂 Dados carregados do storage');
                return true;
            }
        } catch (error) {
            console.warn('Erro ao carregar:', error);
        }
        return false;
    }
    
    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    obterResumo() {
        const vantagensTotal = this.vantagens.total +
            (this.caracteristicas.aparencia > 0 ? this.caracteristicas.aparencia : 0) +
            (this.caracteristicas.riqueza > 0 ? this.caracteristicas.riqueza : 0) +
            (this.caracteristicas.idiomas > 0 ? this.caracteristicas.idiomas : 0) +
            (this.caracteristicas.relacionamentos > 0 ? this.caracteristicas.relacionamentos : 0);
        
        const desvantagensTotal = Math.abs(this.desvantagens.total) +
            (this.caracteristicas.aparencia < 0 ? Math.abs(this.caracteristicas.aparencia) : 0) +
            (this.caracteristicas.riqueza < 0 ? Math.abs(this.caracteristicas.riqueza) : 0) +
            (this.caracteristicas.idiomas < 0 ? Math.abs(this.caracteristicas.idiomas) : 0) +
            (this.caracteristicas.relacionamentos < 0 ? Math.abs(this.caracteristicas.relacionamentos) : 0);
        
        const pontosIniciais = parseInt(document.getElementById('start-points')?.value || 100);
        const pericias = parseInt(document.getElementById('points-skills')?.textContent || 0);
        const magias = parseInt(document.getElementById('points-spells')?.textContent || 0);
        
        const saldo = pontosIniciais - vantagensTotal - desvantagensTotal - pericias - magias;
        
        return {
            vantagens: vantagensTotal,
            desvantagens: -desvantagensTotal,
            saldo: saldo,
            caracteristicas: { ...this.caracteristicas }
        };
    }
    
    exportarDados() {
        return {
            vantagens: this.vantagens,
            desvantagens: this.desvantagens,
            caracteristicas: this.caracteristicas,
            resumo: this.obterResumo(),
            metadata: {
                exportadoEm: new Date().toISOString(),
                versao: '1.0'
            }
        };
    }
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

let dashboardVant = null;

function inicializarDashboardVant() {
    if (!dashboardVant) {
        dashboardVant = new DashboardVant();
    }
    dashboardVant.inicializar();
    return dashboardVant;
}

// Inicializar quando a dashboard for aberta
document.addEventListener('DOMContentLoaded', function() {
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'dashboard' && tab.classList.contains('active')) {
                    setTimeout(() => {
                        if (!dashboardVant) {
                            dashboardVant = new DashboardVant();
                        }
                        dashboardVant.inicializar();
                    }, 100);
                }
            }
        });
    });
    
    const tabDashboard = document.getElementById('dashboard');
    if (tabDashboard) {
        observer.observe(tabDashboard, { attributes: true });
    }
});

// Inicializar também quando sistemas estiverem prontos
setTimeout(() => {
    if (!dashboardVant && document.getElementById('dashboard')?.classList.contains('active')) {
        dashboardVant = new DashboardVant();
        dashboardVant.inicializar();
    }
}, 2000);

// EXPORTAR PARA USO GLOBAL
window.DashboardVant = DashboardVant;
window.inicializarDashboardVant = inicializarDashboardVant;
window.dashboardVant = dashboardVant;

console.log('📦 DashboardVant carregado (aguardando inicialização)');