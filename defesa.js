// defesa.js - Sistema Dinâmico de Defesas Ativas - VERSÃO CORRIGIDA
class SistemaDefesas {
    constructor() {
        this.estado = {
            atributos: { dx: 10, ht: 10 },
            bonus: { 
                reflexos: 0, 
                escudo: 0, 
                capa: 0, 
                outros: 0 
            },
            modificadores: { 
                esquiva: 0, 
                bloqueio: 0, 
                aparar: 0, 
                deslocamento: 0 
            },
            defesas: { 
                esquiva: 0, 
                bloqueio: 0, 
                aparar: 0, 
                deslocamento: 0 
            },
            nivelCarga: 'nenhuma',
            nh: { escudo: null, arma: null },
            fadiga: { 
                ativa: false, 
                pfAtual: 10, 
                pfMaximo: 10, 
                limiteFadiga: 4 
            }
        };
        
        this.elementos = {};
        this.observadores = [];
        this.atualizando = false;
        this.iniciado = false;
        this.tentativaAtualizacao = 0;
    }
    
    iniciar() {
        if (this.iniciado) return;
        
        try {
            console.log('🛡️ Iniciando sistema de defesas...');
            
            this.carregarElementos();
            this.forcarCarregamentoAtributos(); // NOVO: força carregamento imediato
            this.carregarValoresIniciais();
            this.configurarEventos();
            this.configurarEventosExternos(); // NOVO: escuta eventos de outros sistemas
            this.calcularTudo();
            this.iniciarMonitoramento();
            
            this.iniciado = true;
            
            console.log('✅ Sistema de defesas iniciado com DX=', this.estado.atributos.dx, 'HT=', this.estado.atributos.ht);
            
        } catch (error) {
            console.error('Erro ao iniciar sistema de defesas:', error);
        }
    }
    
    carregarElementos() {
        // Atributos (vêm do sistema de atributos)
        this.elementos.dx = document.getElementById('DX');
        this.elementos.ht = document.getElementById('HT');
        
        // Inputs de bônus
        this.elementos.bonusReflexos = document.getElementById('bonusReflexos');
        this.elementos.bonusEscudo = document.getElementById('bonusEscudo');
        this.elementos.bonusCapa = document.getElementById('bonusCapa');
        this.elementos.bonusOutros = document.getElementById('bonusOutros');
        
        // Totais de defesa
        this.elementos.esquivaTotal = document.getElementById('esquivaTotal');
        this.elementos.bloqueioTotal = document.getElementById('bloqueioTotal');
        this.elementos.apararTotal = document.getElementById('apararTotal');
        this.elementos.deslocamentoTotal = document.getElementById('deslocamentoTotal');
        
        // Total de bônus
        this.elementos.totalBonus = document.getElementById('totalBonus');
    }
    
    // NOVO: Força carregamento de atributos de várias fontes
    forcarCarregamentoAtributos() {
        console.log('📊 Forçando carregamento de atributos...');
        
        // Tentativa 1: Sistema de atributos já calculado
        if (window.personagemAtributos) {
            console.log('🎯 Usando atributos do sistema global');
            this.estado.atributos.dx = window.personagemAtributos.DX || 10;
            this.estado.atributos.ht = window.personagemAtributos.HT || 10;
        }
        
        // Tentativa 2: Inputs da aba atributos
        if (this.elementos.dx && this.elementos.dx.value) {
            const dxVal = parseInt(this.elementos.dx.value);
            if (!isNaN(dxVal) && dxVal !== this.estado.atributos.dx) {
                console.log('📝 Atualizando DX do input:', dxVal);
                this.estado.atributos.dx = dxVal;
            }
        }
        
        if (this.elementos.ht && this.elementos.ht.value) {
            const htVal = parseInt(this.elementos.ht.value);
            if (!isNaN(htVal) && htVal !== this.estado.atributos.ht) {
                console.log('📝 Atualizando HT do input:', htVal);
                this.estado.atributos.ht = htVal;
            }
        }
        
        // Tentativa 3: Valores salvos no localStorage
        if (this.estado.atributos.dx === 10 || this.estado.atributos.ht === 10) {
            try {
                const dadosSalvos = localStorage.getItem('gurps_atributos');
                if (dadosSalvos) {
                    const dados = JSON.parse(dadosSalvos);
                    if (dados.atributos) {
                        console.log('💾 Carregando atributos do localStorage');
                        this.estado.atributos.dx = dados.atributos.DX || this.estado.atributos.dx;
                        this.estado.atributos.ht = dados.atributos.HT || this.estado.atributos.ht;
                    }
                }
            } catch (e) {
                console.log('⚠️ Não foi possível carregar do localStorage');
            }
        }
        
        console.log('🎯 Atributos carregados: DX=', this.estado.atributos.dx, 'HT=', this.estado.atributos.ht);
    }
    
    carregarValoresIniciais() {
        // Já carregamos os atributos no método anterior
        // Carrega bônus
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                this.estado.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
            }
        });
        
        // Carrega modificadores
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                this.estado.modificadores[defesa] = parseInt(input.value) || 0;
            }
        });
        
        // Detecta nível de carga
        this.detectarNivelCarga();
    }
    
    // NOVO: Configurar eventos de outros sistemas
    configurarEventosExternos() {
        // Escuta eventos do sistema de atributos
        document.addEventListener('atributosAlterados', (e) => {
            console.log('🔄 Evento de atributos recebido:', e.detail);
            
            if (e.detail && e.detail.DX !== undefined) {
                this.estado.atributos.dx = e.detail.DX;
                console.log('🎯 DX atualizado para:', e.detail.DX);
            }
            
            if (e.detail && e.detail.HT !== undefined) {
                this.estado.atributos.ht = e.detail.HT;
                console.log('🎯 HT atualizado para:', e.detail.HT);
            }
            
            this.calcularTudo();
        });
        
        // Atualiza periodicamente nos primeiros segundos (catch-up)
        if (this.tentativaAtualizacao < 5) {
            setTimeout(() => {
                this.forcarCarregamentoAtributos();
                this.calcularTudo();
                this.tentativaAtualizacao++;
            }, 1000);
        }
    }
    
    calcularTudo() {
        if (this.atualizando) return;
        
        this.atualizando = true;
        
        try {
            console.log('🧮 Calculando defesas com DX=', this.estado.atributos.dx, 'HT=', this.estado.atributos.ht);
            
            // Verifica se os atributos estão corretos
            if (this.estado.atributos.dx === 10 && this.elementos.dx && this.elementos.dx.value) {
                const dxVal = parseInt(this.elementos.dx.value);
                if (!isNaN(dxVal) && dxVal !== 10) {
                    console.log('⚠️ Corrigindo DX de 10 para:', dxVal);
                    this.estado.atributos.dx = dxVal;
                }
            }
            
            if (this.estado.atributos.ht === 10 && this.elementos.ht && this.elementos.ht.value) {
                const htVal = parseInt(this.elementos.ht.value);
                if (!isNaN(htVal) && htVal !== 10) {
                    console.log('⚠️ Corrigindo HT de 10 para:', htVal);
                    this.estado.atributos.ht = htVal;
                }
            }
            
            // Busca NH das perícias aprendidas
            this.buscarNHs();
            
            // Calcula cada defesa
            this.calcularEsquiva();
            this.calcularBloqueio();
            this.calcularAparar();
            this.calcularDeslocamento();
            
            // Atualiza interface
            this.atualizarInterface();
            
        } catch (error) {
            console.error('Erro nos cálculos:', error);
        } finally {
            this.atualizando = false;
        }
    }
    
    // ... resto dos métodos (calcularEsquiva, calcularBloqueio, etc.) permanecem iguais ...
    
    calcularEsquiva() {
        const { dx, ht } = this.estado.atributos;
        
        // Fórmula: (DX + HT) / 4 + 3 (arredondado para baixo)
        const base = Math.floor((dx + ht) / 4) + 3;
        const modificador = this.estado.modificadores.esquiva;
        const bonusTotal = this.calcularBonusTotal();
        
        // Redutor de carga
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        
        let total = base + modificador + bonusTotal + redutorCarga;
        
        // Aplica penalidade de fadiga
        total = this.aplicarPenalidadeFadiga(total, 'esquiva');
        
        // Mínimo 1
        this.estado.defesas.esquiva = Math.max(total, 1);
        
        console.log(`🏃 Esquiva: base=${base}, mod=${modificador}, bonus=${bonusTotal}, carga=${redutorCarga}, total=${this.estado.defesas.esquiva}`);
    }
    
    calcularBloqueio() {
        // Se não tem NH de escudo ou ainda não buscou
        if (this.estado.nh.escudo === null) {
            this.buscarNHEscudo();
        }
        
        const nhEscudo = this.estado.nh.escudo;
        
        // Se não tem escudo (NH é igual ao DX ou menos), bloqueio = 0
        if (!nhEscudo || nhEscudo <= this.estado.atributos.dx) {
            this.estado.defesas.bloqueio = 0;
            console.log('🛡️ Bloqueio: Sem escudo equipado ou perícia');
            return;
        }
        
        // Fórmula: (NH Escudo) / 2 + 3 (arredondado para baixo)
        const base = Math.floor(nhEscudo / 2) + 3;
        const modificador = this.estado.modificadores.bloqueio;
        const bonusTotal = this.calcularBonusTotal();
        
        const total = base + modificador + bonusTotal;
        
        // Mínimo 1
        this.estado.defesas.bloqueio = Math.max(total, 1);
        
        console.log(`🛡️ Bloqueio: NH=${nhEscudo}, base=${base}, mod=${modificador}, bonus=${bonusTotal}, total=${this.estado.defesas.bloqueio}`);
    }
    
    calcularAparar() {
        // Se não tem NH de arma ou ainda não buscou
        if (this.estado.nh.arma === null) {
            this.buscarNHArma();
        }
        
        const nhArma = this.estado.nh.arma;
        
        // Se não tem arma (NH é igual ao DX ou não tem perícia), aparar = 0
        if (!nhArma || nhArma <= this.estado.atributos.dx) {
            this.estado.defesas.aparar = 0;
            console.log('⚔️ Aparar: Sem arma equipada ou perícia');
            return;
        }
        
        // Fórmula: (NH Arma) / 2 + 3 (arredondado para baixo)
        const base = Math.floor(nhArma / 2) + 3;
        const modificador = this.estado.modificadores.aparar;
        const bonusTotal = this.calcularBonusTotal();
        
        const total = base + modificador + bonusTotal;
        
        // Mínimo 1
        this.estado.defesas.aparar = Math.max(total, 1);
        
        console.log(`⚔️ Aparar: NH=${nhArma}, base=${base}, mod=${modificador}, bonus=${bonusTotal}, total=${this.estado.defesas.aparar}`);
    }
    
    calcularDeslocamento() {
        const { dx, ht } = this.estado.atributos;
        
        // Fórmula: (DX + HT) / 4
        const base = (dx + ht) / 4;
        const modificador = this.estado.modificadores.deslocamento;
        
        // Redutor de carga
        const redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
        
        let total = base + modificador + redutorCarga;
        
        // Aplica penalidade de fadiga
        total = this.aplicarPenalidadeFadiga(total, 'deslocamento');
        
        // Mínimo 0
        this.estado.defesas.deslocamento = Math.max(total, 0);
        
        console.log(`🚶 Deslocamento: base=${base.toFixed(2)}, mod=${modificador}, carga=${redutorCarga}, total=${this.estado.defesas.deslocamento.toFixed(2)}`);
    }
    
    // ... resto dos métodos permanecem iguais ...
    
    atualizarAtributos() {
        if (this.elementos.dx) {
            const novoDx = parseInt(this.elementos.dx.value) || 10;
            if (novoDx !== this.estado.atributos.dx) {
                this.estado.atributos.dx = novoDx;
                console.log('🎯 DX atualizado via input:', novoDx);
            }
        }
        
        if (this.elementos.ht) {
            const novoHt = parseInt(this.elementos.ht.value) || 10;
            if (novoHt !== this.estado.atributos.ht) {
                this.estado.atributos.ht = novoHt;
                console.log('🎯 HT atualizado via input:', novoHt);
            }
        }
    }
    
    monitorarAtributos() {
        ['DX', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                let timeout;
                
                input.addEventListener('input', () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.atualizarAtributos();
                        this.calcularTudo();
                    }, 300);
                });
                
                // Também monitora mudanças programáticas
                input.addEventListener('change', () => {
                    this.atualizarAtributos();
                    this.calcularTudo();
                });
            }
        });
    }
    
    // NOVO: Método para verificar e corrigir atributos
    verificarECorrigirAtributos() {
        let corrigiu = false;
        
        // Verifica DX
        if (this.elementos.dx && this.elementos.dx.value) {
            const dxVal = parseInt(this.elementos.dx.value);
            if (!isNaN(dxVal) && dxVal !== this.estado.atributos.dx) {
                this.estado.atributos.dx = dxVal;
                corrigiu = true;
                console.log('🔧 DX corrigido para:', dxVal);
            }
        }
        
        // Verifica HT
        if (this.elementos.ht && this.elementos.ht.value) {
            const htVal = parseInt(this.elementos.ht.value);
            if (!isNaN(htVal) && htVal !== this.estado.atributos.ht) {
                this.estado.atributos.ht = htVal;
                corrigiu = true;
                console.log('🔧 HT corrigido para:', htVal);
            }
        }
        
        if (corrigiu) {
            this.calcularTudo();
        }
        
        return corrigiu;
    }
    
    iniciarAtualizacaoPeriodica() {
        // Atualiza a cada 1 segundo nos primeiros 10 segundos
        let tentativas = 0;
        const intervaloInicial = setInterval(() => {
            if (tentativas < 10) {
                const corrigiu = this.verificarECorrigirAtributos();
                if (corrigiu) {
                    console.log('✅ Atributos corrigidos na tentativa', tentativas + 1);
                }
                tentativas++;
            } else {
                clearInterval(intervaloInicial);
                // Troca para intervalo mais longo
                setInterval(() => {
                    if (!this.atualizando) {
                        this.calcularTudo();
                    }
                }, 5000);
            }
        }, 1000);
        
        this.observadores.push({ intervalo: intervaloInicial });
    }
    
    forcarRecalculo() {
        console.log('🔄 Forçando recálculo completo...');
        this.estado.nh.escudo = null;
        this.estado.nh.arma = null;
        
        this.forcarCarregamentoAtributos();
        this.calcularTudo();
    }
    
    // Adicionar este método para limpar observadores
    limpar() {
        this.observadores.forEach(obs => {
            if (obs.intervalo) clearInterval(obs.intervalo);
            if (obs.observer) obs.observer.disconnect();
        });
        this.observadores = [];
    }
}

// Sistema global
let sistemaDefesasGlobal = null;

function iniciarSistemaDefesas() {
    if (sistemaDefesasGlobal) {
        sistemaDefesasGlobal.limpar();
    }
    
    sistemaDefesasGlobal = new SistemaDefesas();
    
    // Aguarda um pouco para garantir que o sistema de atributos carregue
    setTimeout(() => {
        sistemaDefesasGlobal.iniciar();
    }, 800);
    
    return sistemaDefesasGlobal;
}

// Inicialização automática melhorada
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    function verificarEIniciar() {
        if (combateTab && combateTab.classList.contains('active')) {
            console.log('⚔️ Aba combate ativa - iniciando defesas');
            setTimeout(iniciarSistemaDefesas, 300);
        }
    }
    
    verificarEIniciar();
    
    if (combateTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    setTimeout(verificarEIniciar, 200);
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
    }
    
    // Também escuta eventos gerais de mudança de atributos
    document.addEventListener('atributosAlterados', function() {
        if (sistemaDefesasGlobal) {
            setTimeout(() => sistemaDefesasGlobal.calcularTudo(), 100);
        }
    });
});

// Funções globais para console
window.defesa = {
    iniciar: () => iniciarSistemaDefesas(),
    status: () => {
        if (sistemaDefesasGlobal) {
            sistemaDefesasGlobal.mostrarStatus();
        } else {
            console.log('❌ Sistema de defesas não iniciado');
        }
    },
    recalcular: () => {
        if (sistemaDefesasGlobal) {
            sistemaDefesasGlobal.forcarRecalculo();
        } else {
            console.log('❌ Sistema de defesas não iniciado');
        }
    },
    getEstado: () => {
        if (sistemaDefesasGlobal) {
            return sistemaDefesasGlobal.estado;
        }
        return null;
    }
};

// Atalhos de console
window.DS = () => defesa.status();
window.DR = () => defesa.recalcular();
window.DE = () => defesa.getEstado();

console.log('✅ Sistema de Defesas dinâmico carregado!');
console.log('💡 Comandos:');
console.log('   DS() - Status do sistema');
console.log('   DR() - Recalcular tudo');
console.log('   DE() - Ver estado interno');