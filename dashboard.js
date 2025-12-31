// ===========================================
// DASHBOARD.JS - Sistema de Dashboard GURPS em Tempo Real
// ===========================================

class DashboardManager {
    constructor() {
        this.estado = {
            atributos: {
                ST: 10,
                DX: 10,
                IQ: 10,
                HT: 10,
                bonus: {
                    PV: 0,
                    PF: 0,
                    Vontade: 0,
                    Percepcao: 0,
                    Deslocamento: 0
                }
            },
            caracteristicas: {
                altura: 1.70,
                peso: 70,
                idade: 25,
                aparência: "Comum",
                descricao: ""
            },
            pontos: {
                inicial: 150,
                gastos: 0,
                vantagens: 0,
                desvantagens: 0,
                pericias: 0,
                magias: 0,
                caracteristicas: 0
            },
            statusSocial: {
                riqueza: "Médio",
                status: 0,
                reputacao: 0,
                aparência: 0,
                reacao: 0
            },
            equipamento: {
                peso: 0,
                valor: 0,
                nivelCarga: "Nenhuma"
            },
            resumo: {
                vantagens: 0,
                desvantagens: 0,
                pericias: 0,
                magias: 0,
                itens: 0,
                idiomas: 1
            },
            identificacao: {
                nome: "",
                tipo: ""
            },
            timestamp: null
        };

        this.intervaloAtualizacao = null;
        this.intervaloTempo = 2000; // 2 segundos
        this.inicializado = false;
    }

    // ===========================================
    // INICIALIZAÇÃO
    // ===========================================

    inicializar() {
        if (this.inicializado) return;
        
        console.log('🚀 Inicializando Dashboard Manager...');
        
        // 1. Configurar eventos
        this.configurarEventos();
        
        // 2. Carregar dados
        this.carregarDadosSalvos();
        
        // 3. Sincronizar com outros sistemas
        this.sincronizarComSistemas();
        
        // 4. Atualizar dashboard
        this.atualizarDashboard();
        
        // 5. Iniciar atualização automática
        this.iniciarAtualizacaoAutomatica();
        
        this.inicializado = true;
        console.log('✅ Dashboard Manager inicializado');
    }

    configurarEventos() {
        // Observar mudanças nos elementos da dashboard
        this.configurarObservadores();
        
        // Configurar eventos de entrada
        this.configurarEventosEntrada();
        
        // Eventos do sistema
        document.addEventListener('atributosAtualizados', () => {
            this.atualizarDeAtributos();
        });
        
        document.addEventListener('caracteristicasAtualizadas', () => {
            this.atualizarDeCaracteristicas();
        });
    }

    configurarObservadores() {
        // Observar mudanças nos elementos visíveis
        const observer = new MutationObserver(() => {
            if (this.elementosVisiveis()) {
                this.atualizarDashboard();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }

    configurarEventosEntrada() {
        // Identificação
        const nomeInput = document.getElementById('char-name');
        const tipoInput = document.getElementById('char-type');
        
        if (nomeInput) {
            nomeInput.addEventListener('input', (e) => {
                this.estado.identificacao.nome = e.target.value;
                this.salvarDados();
            });
        }
        
        if (tipoInput) {
            tipoInput.addEventListener('input', (e) => {
                this.estado.identificacao.tipo = e.target.value;
                this.salvarDados();
            });
        }
        
        // Descrição física
        const descInput = document.getElementById('phys-description');
        if (descInput) {
            descInput.addEventListener('input', (e) => {
                this.estado.caracteristicas.descricao = e.target.value;
                this.salvarDados();
            });
        }
    }

    // ===========================================
    // SINCRONIZAÇÃO COM OUTROS SISTEMAS
    // ===========================================

    sincronizarComSistemas() {
        // Sincronizar com sistema de atributos
        this.sincronizarAtributos();
        
        // Sincronizar com sistema de características físicas
        this.sincronizarCaracteristicas();
    }

    sincronizarAtributos() {
        // Verificar se o sistema de atributos está disponível
        if (typeof personagemAtributos !== 'undefined') {
            this.estado.atributos = { ...personagemAtributos };
        }
        
        // Observar mudanças no sistema de atributos
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('change', () => {
                    this.estado.atributos[atributo] = parseInt(input.value) || 10;
                    this.atualizarDashboard();
                });
            }
        });
        
        // Observar bônus
        ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'].forEach(bonus => {
            const input = document.getElementById('bonus' + bonus);
            if (input) {
                input.addEventListener('change', () => {
                    this.estado.atributos.bonus[bonus] = parseFloat(input.value) || 0;
                    this.atualizarDashboard();
                });
            }
        });
    }

    sincronizarCaracteristicas() {
        // Observar elementos de características físicas
        const alturaInput = document.getElementById('altura');
        const pesoInput = document.getElementById('peso');
        
        if (alturaInput) {
            alturaInput.addEventListener('change', () => {
                this.estado.caracteristicas.altura = parseFloat(alturaInput.value) || 1.70;
                this.atualizarDashboard();
            });
        }
        
        if (pesoInput) {
            pesoInput.addEventListener('change', () => {
                this.estado.caracteristicas.peso = parseInt(pesoInput.value) || 70;
                this.atualizarDashboard();
            });
        }
        
        // Se o sistema de características físicas estiver disponível
        if (window.sistemaCaracteristicasFisicas) {
            try {
                const dados = window.sistemaCaracteristicasFisicas.exportarDados();
                if (dados.caracteristicasFisicas) {
                    const fisicas = dados.caracteristicasFisicas;
                    this.estado.caracteristicas.altura = fisicas.altura || 1.70;
                    this.estado.caracteristicas.peso = fisicas.peso || 70;
                    this.estado.caracteristicas.idade = fisicas.visual?.idade || 25;
                    this.estado.caracteristicas.aparência = 
                        fisicas.conformidade?.dentroDaFaixa ? "Normal" : "Fora da Faixa";
                    
                    // Atualizar pontos
                    this.estado.pontos.caracteristicas = fisicas.pontosTotais || 0;
                }
            } catch (error) {
                console.warn('Erro ao sincronizar características físicas:', error);
            }
        }
    }

    // ===========================================
    // ATUALIZAÇÃO DOS DADOS
    // ===========================================

    atualizarDeAtributos() {
        if (typeof personagemAtributos !== 'undefined') {
            this.estado.atributos = { ...personagemAtributos };
            this.atualizarDashboard();
        }
    }

    atualizarDeCaracteristicas() {
        this.sincronizarCaracteristicas();
        this.atualizarDashboard();
    }

    // ===========================================
    // ATUALIZAÇÃO DO DASHBOARD
    // ===========================================

    atualizarDashboard() {
        if (!this.elementosVisiveis()) return;
        
        // 1. Atributos principais
        this.atualizarAtributosPrincipais();
        
        // 2. Atributos secundários
        this.atualizarAtributosSecundarios();
        
        // 3. Características físicas
        this.atualizarCaracteristicasFisicas();
        
        // 4. Sistema de pontos
        this.atualizarSistemaPontos();
        
        // 5. Status social
        this.atualizarStatusSocial();
        
        // 6. Equipamento
        this.atualizarEquipamento();
        
        // 7. Resumo
        this.atualizarResumo();
        
        // 8. Timestamp
        this.atualizarTimestamp();
        
        // 9. Salvar dados
        this.salvarDados();
    }

    atualizarAtributosPrincipais() {
        const { ST, DX, IQ, HT } = this.estado.atributos;
        
        // Atualizar valores
        this.atualizarElemento('attr-st', ST);
        this.atualizarElemento('attr-dx', DX);
        this.atualizarElemento('attr-iq', IQ);
        this.atualizarElemento('attr-ht', HT);
        
        // Atualizar detalhes
        this.atualizarDetalhesAtributos(ST, DX, IQ, HT);
    }

    atualizarDetalhesAtributos(ST, DX, IQ, HT) {
        // Dano base (usando a tabela do atributos.js)
        let danoGDP = '1d-2', danoGEB = '1d';
        if (window.danoTable && ST >= 1 && ST <= 40) {
            const stKey = Math.min(Math.max(ST, 1), 40);
            const dados = window.danoTable[stKey];
            if (dados) {
                danoGDP = dados.gdp;
                danoGEB = dados.geb;
            }
        }
        
        // Esquiva base (simplificada)
        const esquivaBase = Math.floor((DX + HT) / 4) + 3;
        
        // Atualizar
        this.atualizarElemento('attr-st-details', `Dano: ${danoGDP}/${danoGEB}`);
        this.atualizarElemento('attr-dx-details', `Esquiva: ${esquivaBase}`);
        this.atualizarElemento('attr-iq-details', `Vontade: ${IQ}`);
        this.atualizarElemento('attr-ht-details', `Resistência: ${HT}`);
    }

    atualizarAtributosSecundarios() {
        const { ST, DX, IQ, HT } = this.estado.atributos;
        const bonus = this.estado.atributos.bonus;
        
        // Calcular totais
        const pvTotal = Math.max(ST + (bonus.PV || 0), 1);
        const pfTotal = Math.max(HT + (bonus.PF || 0), 1);
        const vontadeTotal = Math.max(IQ + (bonus.Vontade || 0), 1);
        const percepcaoTotal = Math.max(IQ + (bonus.Percepcao || 0), 1);
        const deslocamentoBase = (HT + DX) / 4;
        const deslocamentoTotal = Math.max(deslocamentoBase + (bonus.Deslocamento || 0), 0).toFixed(2);
        
        // Atualizar elementos
        this.atualizarElemento('pv-current', pvTotal);
        this.atualizarElemento('pv-max', pvTotal);
        this.atualizarElemento('fp-current', pfTotal);
        this.atualizarElemento('fp-max', pfTotal);
        this.atualizarElemento('will-value', vontadeTotal);
        this.atualizarElemento('per-value', percepcaoTotal);
        this.atualizarElemento('move-value', deslocamentoTotal);
    }

    atualizarCaracteristicasFisicas() {
        const { altura, peso, idade, aparência } = this.estado.caracteristicas;
        
        // Atualizar elementos
        this.atualizarElemento('phys-height', `${altura.toFixed(2)} m`);
        this.atualizarElemento('phys-weight', `${peso} kg`);
        this.atualizarElemento('phys-age', `${idade} anos`);
        this.atualizarElemento('phys-appearance', aparência);
        
        // Descrição física
        const descElement = document.getElementById('phys-description');
        if (descElement && this.estado.caracteristicas.descricao !== undefined) {
            if (descElement.value !== this.estado.caracteristicas.descricao) {
                descElement.value = this.estado.caracteristicas.descricao;
            }
        }
    }

    atualizarSistemaPontos() {
        // Calcular gastos com atributos
        const { ST, DX, IQ, HT } = this.estado.atributos;
        const custoST = (ST - 10) * 10;
        const custoDX = (DX - 10) * 20;
        const custoIQ = (IQ - 10) * 20;
        const custoHT = (HT - 10) * 10;
        const gastosAtributos = custoST + custoDX + custoIQ + custoHT;
        
        // Total gasto
        const totalGastos = gastosAtributos + this.estado.pontos.caracteristicas;
        this.estado.pontos.gastos = totalGastos;
        
        // Calcular saldo
        const saldo = this.estado.pontos.inicial - totalGastos;
        
        // Atualizar elementos
        this.atualizarElemento('points-balance', saldo);
        
        // Estilo do saldo
        const balanceElement = document.getElementById('points-balance');
        if (balanceElement) {
            if (saldo > 0) {
                balanceElement.style.color = '#27ae60';
            } else if (saldo < 0) {
                balanceElement.style.color = '#e74c3c';
            } else {
                balanceElement.style.color = '#f39c12';
            }
        }
        
        // Outros gastos
        this.atualizarElemento('points-adv', this.estado.pontos.vantagens);
        this.atualizarElemento('points-dis', this.estado.pontos.desvantagens);
        this.atualizarElemento('points-skills', this.estado.pontos.pericias);
        this.atualizarElemento('points-spells', this.estado.pontos.magias);
    }

    atualizarStatusSocial() {
        // Atualizar elementos
        this.atualizarElemento('wealth-level', this.estado.statusSocial.riqueza);
        this.atualizarElemento('status-mod', this.estado.statusSocial.status);
        this.atualizarElemento('rep-mod', this.estado.statusSocial.reputacao);
        this.atualizarElemento('app-mod', this.estado.statusSocial.aparência);
        
        const reacao = this.estado.statusSocial.reacao;
        this.atualizarElemento('reaction-total', reacao >= 0 ? `+${reacao}` : reacao.toString());
    }

    atualizarEquipamento() {
        const peso = this.estado.equipamento.peso;
        const nivel = this.estado.equipamento.nivelCarga;
        
        // Atualizar elementos
        this.atualizarElemento('equip-weight', `${peso.toFixed(1)} kg`);
        this.atualizarElemento('equip-value', `$${this.estado.equipamento.valor}`);
        this.atualizarElemento('enc-level', nivel);
        
        // Atualizar barra de carga
        this.atualizarBarraCarga(peso);
    }

    atualizarBarraCarga(peso) {
        const barra = document.getElementById('enc-fill');
        const nota = document.getElementById('enc-note');
        
        if (!barra || !nota) return;
        
        const ST = this.estado.atributos.ST || 10;
        let nivel = 'Nenhuma';
        let porcentagem = 0;
        let limite = 10;
        let cor = '#2ecc71';
        
        // Simples cálculo base
        if (peso <= ST) {
            nivel = 'Nenhuma';
            porcentagem = (peso / ST) * 25;
            limite = ST;
            cor = '#2ecc71';
        } else if (peso <= ST * 2) {
            nivel = 'Leve';
            porcentagem = 25 + ((peso - ST) / ST) * 25;
            limite = ST * 2;
            cor = '#f1c40f';
        } else if (peso <= ST * 3) {
            nivel = 'Média';
            porcentagem = 50 + ((peso - ST * 2) / ST) * 25;
            limite = ST * 3;
            cor = '#e67e22';
        } else if (peso <= ST * 6) {
            nivel = 'Pesada';
            porcentagem = 75 + ((peso - ST * 3) / (ST * 3)) * 25;
            limite = ST * 6;
            cor = '#e74c3c';
        } else {
            nivel = 'Muito Pesada';
            porcentagem = 100;
            cor = '#c0392b';
        }
        
        // Atualizar barra
        barra.style.width = `${Math.min(100, porcentagem)}%`;
        barra.style.background = cor;
        barra.style.background = `linear-gradient(90deg, ${cor}, ${this.escurecerCor(cor)})`;
        
        // Atualizar nota
        if (nivel === 'Muito Pesada') {
            nota.textContent = 'Acima da capacidade';
        } else {
            nota.textContent = `Até ${limite.toFixed(1)} kg`;
        }
        
        // Atualizar nível no estado
        this.estado.equipamento.nivelCarga = nivel;
        this.atualizarElemento('enc-level', nivel);
    }

    atualizarResumo() {
        // Atualizar elementos
        this.atualizarElemento('sum-advantages', this.estado.resumo.vantagens);
        this.atualizarElemento('sum-disadvantages', this.estado.resumo.desvantagens);
        this.atualizarElemento('sum-skills', this.estado.resumo.pericias);
        this.atualizarElemento('sum-spells', this.estado.resumo.magias);
        this.atualizarElemento('sum-items', this.estado.resumo.itens);
        this.atualizarElemento('sum-languages', this.estado.resumo.idiomas);
    }

    atualizarTimestamp() {
        const agora = new Date();
        const timestamp = agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        this.estado.timestamp = timestamp;
        this.atualizarElemento('current-time', timestamp);
    }

    // ===========================================
    // UTILITÁRIOS
    // ===========================================

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.textContent !== valor.toString()) {
                elemento.textContent = valor;
                
                // Efeito visual de atualização
                elemento.classList.add('updated');
                setTimeout(() => elemento.classList.remove('updated'), 500);
            }
        }
    }

    elementosVisiveis() {
        const dashboard = document.querySelector('.dashboard-gurps');
        return dashboard && dashboard.offsetParent !== null;
    }

    escurecerCor(cor, percentual = 20) {
        // Função simples para escurecer uma cor
        return cor; // Simplificado para o exemplo
    }

    // ===========================================
    // ATUALIZAÇÃO AUTOMÁTICA
    // ===========================================

    iniciarAtualizacaoAutomatica() {
        if (this.intervaloAtualizacao) {
            clearInterval(this.intervaloAtualizacao);
        }
        
        this.intervaloAtualizacao = setInterval(() => {
            if (this.elementosVisiveis()) {
                this.atualizarDashboard();
            }
        }, this.intervaloTempo);
    }

    pararAtualizacaoAutomatica() {
        if (this.intervaloAtualizacao) {
            clearInterval(this.intervaloAtualizacao);
            this.intervaloAtualizacao = null;
        }
    }

    // ===========================================
    // SALVAMENTO E CARREGAMENTO
    // ===========================================

    carregarDadosSalvos() {
        try {
            const dados = localStorage.getItem('gurps_dashboard');
            if (dados) {
                const parsed = JSON.parse(dados);
                this.estado = { ...this.estado, ...parsed };
                
                // Restaurar valores nos inputs
                this.restaurarValores();
                return true;
            }
        } catch (error) {
            console.warn('Não foi possível carregar dados do dashboard:', error);
        }
        return false;
    }

    restaurarValores() {
        // Restaurar identificação
        const nomeInput = document.getElementById('char-name');
        const tipoInput = document.getElementById('char-type');
        
        if (nomeInput && this.estado.identificacao.nome) {
            nomeInput.value = this.estado.identificacao.nome;
        }
        
        if (tipoInput && this.estado.identificacao.tipo) {
            tipoInput.value = this.estado.identificacao.tipo;
        }
        
        // Restaurar descrição física
        const descInput = document.getElementById('phys-description');
        if (descInput && this.estado.caracteristicas.descricao) {
            descInput.value = this.estado.caracteristicas.descricao;
        }
    }

    salvarDados() {
        try {
            localStorage.setItem('gurps_dashboard', JSON.stringify(this.estado));
            return true;
        } catch (error) {
            console.warn('Não foi possível salvar dados do dashboard:', error);
            return false;
        }
    }

    // ===========================================
    // FUNÇÕES PÚBLICAS
    // ===========================================

    forcarAtualizacao() {
        this.atualizarDashboard();
    }

    obterEstado() {
        return { ...this.estado };
    }

    atualizarPontos(tipo, valor) {
        if (this.estado.pontos[tipo] !== undefined) {
            this.estado.pontos[tipo] = valor;
            this.atualizarDashboard();
            return true;
        }
        return false;
    }

    atualizarEquipamentoPeso(peso) {
        this.estado.equipamento.peso = parseFloat(peso) || 0;
        this.atualizarDashboard();
    }

    // ===========================================
    // DESTRUIDOR
    // ===========================================

    destruir() {
        this.pararAtualizacaoAutomatica();
        this.salvarDados();
        this.inicializado = false;
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

let dashboardManager = null;

function inicializarDashboardManager() {
    if (!dashboardManager) {
        dashboardManager = new DashboardManager();
    }
    
    dashboardManager.inicializar();
    return dashboardManager;
}

// Inicializar quando a aba dashboard for ativa
document.addEventListener('DOMContentLoaded', function() {
    // Observar mudanças de aba
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'dashboard' && tab.classList.contains('active')) {
                    setTimeout(inicializarDashboardManager, 100);
                }
            }
        });
    });
    
    const tabDashboard = document.getElementById('dashboard');
    if (tabDashboard) {
        observer.observe(tabDashboard, { attributes: true });
        
        // Se já estiver ativa, inicializar imediatamente
        if (tabDashboard.classList.contains('active')) {
            setTimeout(inicializarDashboardManager, 100);
        }
    }
});

// Funções globais
window.forcarAtualizacaoDashboard = function() {
    if (dashboardManager) {
        dashboardManager.forcarAtualizacao();
    }
};

window.obterEstadoDashboard = function() {
    return dashboardManager ? dashboardManager.obterEstado() : null;
};

window.atualizarPontosDashboard = function(tipo, valor) {
    if (dashboardManager) {
        return dashboardManager.atualizarPontos(tipo, valor);
    }
    return false;
};

window.atualizarPesoEquipamento = function(peso) {
    if (dashboardManager) {
        dashboardManager.atualizarEquipamentoPeso(peso);
    }
};

// CSS adicional para animações
const dashboardCSS = `
.updated {
    animation: pulse 0.5s ease;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

/* Estilos para a barra de carga */
.enc-fill {
    transition: width 0.5s ease, background 0.5s ease;
    border-radius: 5px;
}

/* Indicadores visuais */
.points-balance.positivo {
    color: #27ae60 !important;
}

.points-balance.negativo {
    color: #e74c3c !important;
}

.points-balance.neutro {
    color: #f39c12 !important;
}
`;

// Adicionar CSS
if (!document.getElementById('dashboard-css')) {
    const style = document.createElement('style');
    style.id = 'dashboard-css';
    style.textContent = dashboardCSS;
    document.head.appendChild(style);
}

// Exportar para uso global
window.DashboardManager = DashboardManager;
window.dashboardManager = dashboardManager;
window.inicializarDashboardManager = inicializarDashboardManager;