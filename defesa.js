// defesa.js - Sistema de Defesas Ativas
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
            },
            bloqueioForcado: false,
            carregado: false
        };
        
        this.elementos = {};
        this.observadores = [];
        this.atualizando = false;
        
        this.config = {
            base: {
                esquiva: 3,
                bloqueio: 3,
                aparar: 3,
                deslocamento: 0
            },
            redutorCarga: {
                'nenhuma': 0,
                'leve': -1,
                'média': -2,
                'pesada': -3,
                'muito pesada': -4
            }
        };
        
        this.iniciado = false;
    }
    
    iniciar() {
        if (this.iniciado) return;
        
        try {
            this.carregarElementos();
            this.carregarValoresIniciais();
            this.configurarEventos();
            this.buscarNHs();
            this.calcularTudo();
            this.iniciarMonitoramento();
            this.verificarFadiga();
            
            this.iniciado = true;
            
            // Correção inicial do bloqueio
            setTimeout(() => this.corrigirBloqueioInicial(), 500);
            
        } catch (error) {
            console.error('Erro ao iniciar sistema de defesas:', error);
        }
    }
    
    carregarElementos() {
        this.elementos.dx = document.getElementById('DX');
        this.elementos.ht = document.getElementById('HT');
        this.elementos.bonusReflexos = document.getElementById('bonusReflexos');
        this.elementos.bonusEscudo = document.getElementById('bonusEscudo');
        this.elementos.bonusCapa = document.getElementById('bonusCapa');
        this.elementos.bonusOutros = document.getElementById('bonusOutros');
        this.elementos.esquivaTotal = document.getElementById('esquivaTotal');
        this.elementos.bloqueioTotal = document.getElementById('bloqueioTotal');
        this.elementos.apararTotal = document.getElementById('apararTotal');
        this.elementos.deslocamentoTotal = document.getElementById('deslocamentoTotal');
        this.elementos.totalBonus = document.getElementById('totalBonus');
    }
    
    carregarValoresIniciais() {
        if (this.elementos.dx) {
            this.estado.atributos.dx = parseInt(this.elementos.dx.value) || 10;
        }
        
        if (this.elementos.ht) {
            this.estado.atributos.ht = parseInt(this.elementos.ht.value) || 10;
        }
        
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                this.estado.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
            }
        });
        
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                this.estado.modificadores[defesa] = parseInt(input.value) || 0;
            }
        });
        
        this.detectarNivelCarga();
    }
    
    configurarEventos() {
        this.configurarEventosBonus();
        this.configurarEventosModificadores();
        this.configurarEventosAtributos();
        this.configurarEventosBotoes();
    }
    
    configurarEventosBonus() {
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                let timeout;
                
                const handler = () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        this.estado.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
                        this.calcularTudo();
                        this.atualizarTotalBonus();
                    }, 300);
                };
                
                input.addEventListener('input', handler);
                input.addEventListener('change', handler);
            }
        });
    }
    
    configurarEventosModificadores() {
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                input.addEventListener('change', () => {
                    this.estado.modificadores[defesa] = parseInt(input.value) || 0;
                    this.calcularTudo();
                });
            }
        });
    }
    
    configurarEventosAtributos() {
        ['DX', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                let timeout;
                
                input.addEventListener('input', () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const valor = parseInt(input.value) || 10;
                        this.estado.atributos[atributo.toLowerCase()] = valor;
                        this.calcularTudo();
                    }, 500);
                });
            }
        });
    }
    
    configurarEventosBotoes() {
        document.querySelectorAll('.defesa-controle').forEach(container => {
            const minus = container.querySelector('.minus');
            const plus = container.querySelector('.plus');
            const input = container.querySelector('.mod-input');
            
            if (minus && plus && input) {
                const id = input.id;
                const defesa = id.replace('Mod', '');
                
                minus.addEventListener('click', () => {
                    const valorAtual = parseInt(input.value) || 0;
                    input.value = valorAtual - 1;
                    this.estado.modificadores[defesa] = valorAtual - 1;
                    this.calcularTudo();
                });
                
                plus.addEventListener('click', () => {
                    const valorAtual = parseInt(input.value) || 0;
                    input.value = valorAtual + 1;
                    this.estado.modificadores[defesa] = valorAtual + 1;
                    this.calcularTudo();
                });
            }
        });
    }
    
    calcularTudo() {
        if (this.atualizando) return;
        
        this.atualizando = true;
        
        try {
            this.atualizarCacheAtributos();
            this.verificarFadiga();
            
            this.calcularEsquiva();
            this.calcularBloqueio();
            this.calcularAparar();
            this.calcularDeslocamento();
            
            this.atualizarInterface();
            
        } catch (error) {
            console.error('Erro nos cálculos:', error);
        } finally {
            this.atualizando = false;
        }
    }
    
    calcularEsquiva() {
        const { dx, ht } = this.estado.atributos;
        const base = Math.floor((dx + ht) / 4) + this.config.base.esquiva;
        const modificador = this.estado.modificadores.esquiva;
        const bonusTotal = this.calcularBonusTotal();
        const redutorCarga = this.config.redutorCarga[this.estado.nivelCarga] || 0;
        
        let total = base + modificador + bonusTotal + redutorCarga;
        total = this.aplicarPenalidadeFadiga(total, 'esquiva');
        
        this.estado.defesas.esquiva = Math.max(total, 1);
    }
    
    calcularBloqueio() {
        if (this.estado.nh.escudo === null) {
            this.buscarNHEscudo();
        }
        
        const nhEscudo = this.estado.nh.escudo || (this.estado.atributos.dx + 5);
        const base = Math.floor(nhEscudo / 2) + this.config.base.bloqueio;
        const modificador = this.estado.modificadores.bloqueio;
        const bonusTotal = this.calcularBonusTotal();
        
        const total = base + modificador + bonusTotal;
        this.estado.defesas.bloqueio = Math.max(total, 1);
    }
    
    calcularAparar() {
        if (this.estado.nh.arma === null) {
            this.buscarNHArma();
        }
        
        const nhArma = this.estado.nh.arma;
        
        if (!nhArma || nhArma <= this.estado.atributos.dx) {
            this.estado.defesas.aparar = 0;
            return;
        }
        
        const base = Math.floor(nhArma / 2) + this.config.base.aparar;
        const modificador = this.estado.modificadores.aparar;
        const bonusTotal = this.calcularBonusTotal();
        
        const total = base + modificador + bonusTotal;
        this.estado.defesas.aparar = Math.max(total, 1);
    }
    
    calcularDeslocamento() {
        const { dx, ht } = this.estado.atributos;
        const base = (dx + ht) / 4;
        const modificador = this.estado.modificadores.deslocamento;
        const redutorCarga = this.config.redutorCarga[this.estado.nivelCarga] || 0;
        
        let total = base + modificador + redutorCarga;
        total = this.aplicarPenalidadeFadiga(total, 'deslocamento');
        
        this.estado.defesas.deslocamento = Math.max(total, 0);
    }
    
    calcularBonusTotal() {
        const { reflexos, escudo, capa, outros } = this.estado.bonus;
        return reflexos + escudo + capa + outros;
    }
    
    verificarFadiga() {
        try {
            const pfAtualInput = document.getElementById('pfAtualDisplay');
            const pfMaxElement = document.getElementById('pfMaxDisplay');
            
            let pfAtual = 10;
            let pfMaximo = 10;
            
            if (pfAtualInput) {
                pfAtual = parseInt(pfAtualInput.value) || 
                          parseInt(pfAtualInput.textContent) || 10;
            }
            
            if (pfMaxElement) {
                pfMaximo = parseInt(pfMaxElement.textContent) || 10;
            }
            
            const limiteFadiga = Math.ceil(pfMaximo / 3);
            const fadigaAtiva = pfAtual <= limiteFadiga;
            
            this.estado.fadiga = {
                ativa: fadigaAtiva,
                pfAtual: pfAtual,
                pfMaximo: pfMaximo,
                limiteFadiga: limiteFadiga
            };
            
            this.atualizarIndicadorFadiga();
            
        } catch (error) {
            // Silencioso em caso de erro
        }
    }
    
    aplicarPenalidadeFadiga(valor, tipoDefesa) {
        if (!this.estado.fadiga.ativa) {
            return valor;
        }
        
        if (tipoDefesa === 'esquiva' || tipoDefesa === 'deslocamento') {
            return Math.ceil(valor / 2);
        }
        
        return valor;
    }
    
    buscarNHs() {
        this.buscarNHEscudo();
        this.buscarNHArma();
    }
    
    buscarNHEscudo() {
        const dx = this.estado.atributos.dx;
        let nivelEscudo = 0;
        
        // Buscar texto de escudo na página
        const elementos = document.querySelectorAll('*');
        
        for (let elemento of elementos) {
            if (elemento.textContent && elemento.textContent.length < 300) {
                const texto = elemento.textContent.toLowerCase();
                
                if (texto.includes('escudo')) {
                    const numeros = texto.match(/(\d+)/g);
                    if (numeros && numeros.length > 0) {
                        nivelEscudo = parseInt(numeros[numeros.length - 1]) || 0;
                        break;
                    }
                }
            }
        }
        
        // Verificar cache
        if (nivelEscudo === 0) {
            const cache = sessionStorage.getItem('ultimoNivelEscudo');
            if (cache) {
                nivelEscudo = parseInt(cache);
            }
        }
        
        this.estado.nh.escudo = dx + nivelEscudo;
        
        if (nivelEscudo > 0) {
            sessionStorage.setItem('ultimoNivelEscudo', nivelEscudo);
        }
    }
    
    buscarNHArma() {
        const dx = this.estado.atributos.dx;
        let nivelArma = 0;
        
        const armas = [
            'adaga', 'dagger', 'espada', 'sword', 'machado', 'axe',
            'maça', 'mace', 'arco', 'bow', 'lanca', 'lança', 'spear',
            'martelo', 'hammer', 'faca', 'knife', 'bastão', 'staff'
        ];
        
        const armaEquipada = document.querySelector('.com-arma');
        if (armaEquipada) {
            const texto = armaEquipada.textContent.toLowerCase();
            
            for (let arma of armas) {
                if (texto.includes(arma)) {
                    const numeros = texto.match(/(\d+)/g);
                    if (numeros && numeros.length > 0) {
                        nivelArma = parseInt(numeros[0]) || 0;
                        break;
                    }
                }
            }
        }
        
        this.estado.nh.arma = nivelArma > 0 ? dx + nivelArma : dx;
    }
    
    atualizarInterface() {
        this.atualizarValoresDefesa();
        this.atualizarTotalBonus();
    }
    
    atualizarValoresDefesa() {
        if (this.elementos.esquivaTotal) {
            this.elementos.esquivaTotal.textContent = this.estado.defesas.esquiva;
        }
        
        if (this.elementos.bloqueioTotal) {
            this.elementos.bloqueioTotal.textContent = this.estado.defesas.bloqueio;
        }
        
        if (this.elementos.apararTotal) {
            this.elementos.apararTotal.textContent = this.estado.defesas.aparar || 0;
        }
        
        if (this.elementos.deslocamentoTotal) {
            this.elementos.deslocamentoTotal.textContent = this.estado.defesas.deslocamento.toFixed(2);
        }
    }
    
    atualizarTotalBonus() {
        const total = this.calcularBonusTotal();
        
        if (this.elementos.totalBonus) {
            const texto = total >= 0 ? `+${total}` : `${total}`;
            this.elementos.totalBonus.textContent = texto;
        }
    }
    
    atualizarIndicadorFadiga() {
        let indicador = document.getElementById('indicadorFadiga');
        
        if (!indicador) {
            indicador = document.createElement('div');
            indicador.id = 'indicadorFadiga';
            indicador.style.cssText = `
                margin: 10px 0;
                padding: 10px;
                border-radius: 6px;
                font-size: 13px;
                font-weight: bold;
                text-align: center;
                display: none;
                transition: all 0.3s ease;
            `;
            
            const bonusTotalDiv = document.querySelector('.bonus-total');
            if (bonusTotalDiv) {
                bonusTotalDiv.parentNode.insertBefore(indicador, bonusTotalDiv.nextSibling);
            }
        }
        
        if (this.estado.fadiga.ativa) {
            indicador.innerHTML = `⚠️ <strong>FADIGA ATIVA!</strong>`;
            indicador.style.display = 'block';
            indicador.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
            indicador.style.color = 'white';
            indicador.style.border = '2px solid #ff8a80';
        } else {
            indicador.style.display = 'none';
        }
    }
    
    corrigirBloqueioInicial() {
        const elemento = this.elementos.bloqueioTotal;
        if (!elemento) return;
        
        if (elemento.textContent.trim() === '8' && this.estado.defesas.bloqueio !== 8) {
            elemento.textContent = this.estado.defesas.bloqueio;
            this.estado.bloqueioForcado = true;
        }
    }
    
    iniciarMonitoramento() {
        this.monitorarNivelCarga();
        this.monitorarFadiga();
        this.monitorarPericias();
        this.iniciarAtualizacaoPeriodica();
    }
    
    monitorarNivelCarga() {
        const cargaElement = document.getElementById('nivelCarga');
        if (!cargaElement) return;
        
        const observer = new MutationObserver(() => {
            const novoNivel = cargaElement.textContent.toLowerCase().trim();
            
            if (novoNivel !== this.estado.nivelCarga) {
                this.estado.nivelCarga = novoNivel;
                this.calcularTudo();
            }
        });
        
        observer.observe(cargaElement, {
            childList: true,
            characterData: true,
            subtree: true
        });
        
        this.observadores.push(observer);
    }
    
    monitorarFadiga() {
        const pfInput = document.getElementById('pfAtualDisplay');
        if (!pfInput) return;
        
        pfInput.addEventListener('input', () => {
            setTimeout(() => {
                this.verificarFadiga();
                this.calcularTudo();
            }, 200);
        });
    }
    
    monitorarPericias() {
        const container = document.getElementById('pericias-aprendidas');
        if (!container) return;
        
        const observer = new MutationObserver(() => {
            this.estado.nh.escudo = null;
            this.estado.nh.arma = null;
            
            setTimeout(() => {
                this.buscarNHs();
                this.calcularTudo();
            }, 500);
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true
        });
        
        this.observadores.push(observer);
    }
    
    iniciarAtualizacaoPeriodica() {
        setInterval(() => {
            if (!this.atualizando) {
                this.calcularTudo();
            }
        }, 3000);
    }
    
    atualizarCacheAtributos() {
        if (this.elementos.dx) {
            this.estado.atributos.dx = parseInt(this.elementos.dx.value) || 10;
        }
        
        if (this.elementos.ht) {
            this.estado.atributos.ht = parseInt(this.elementos.ht.value) || 10;
        }
    }
    
    detectarNivelCarga() {
        try {
            const cargaElement = document.getElementById('nivelCarga');
            if (cargaElement) {
                this.estado.nivelCarga = cargaElement.textContent.toLowerCase().trim();
            }
        } catch (error) {
            this.estado.nivelCarga = 'nenhuma';
        }
    }
    
    forcarRecalculo() {
        this.estado.nh.escudo = null;
        this.estado.nh.arma = null;
        this.estado.bloqueioForcado = false;
        
        this.carregarValoresIniciais();
        this.buscarNHs();
        this.calcularTudo();
    }
    
    destruir() {
        this.observadores.forEach(observer => observer.disconnect());
        this.observadores = [];
        this.iniciado = false;
    }
}

// Sistema global
let sistemaDefesasGlobal = null;

function iniciarSistemaDefesas() {
    if (sistemaDefesasGlobal) return sistemaDefesasGlobal;
    
    sistemaDefesasGlobal = new SistemaDefesas();
    
    setTimeout(() => {
        sistemaDefesasGlobal.iniciar();
    }, 1000);
    
    return sistemaDefesasGlobal;
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    const combateTab = document.getElementById('combate');
    
    function verificarEIniciar() {
        if (combateTab && combateTab.classList.contains('active')) {
            iniciarSistemaDefesas();
        }
    }
    
    verificarEIniciar();
    
    if (combateTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    setTimeout(verificarEIniciar, 100);
                }
            });
        });
        
        observer.observe(combateTab, { attributes: true });
    }
});

// Funções globais para console
window.defesa = {
    iniciar: () => iniciarSistemaDefesas(),
    
    status: () => {
        if (sistemaDefesasGlobal) {
            console.log('Atributos:', sistemaDefesasGlobal.estado.atributos);
            console.log('Defesas:', sistemaDefesasGlobal.estado.defesas);
            console.log('Bônus:', sistemaDefesasGlobal.estado.bonus);
            console.log('Fadiga:', sistemaDefesasGlobal.estado.fadiga.ativa);
        }
    },
    
    recalcular: () => {
        if (sistemaDefesasGlobal) {
            sistemaDefesasGlobal.forcarRecalculo();
        }
    },
    
    destruir: () => {
        if (sistemaDefesasGlobal) {
            sistemaDefesasGlobal.destruir();
            sistemaDefesasGlobal = null;
        }
    }
};

// Atalhos de console
window.DS = () => defesa.status();
window.DR = () => defesa.recalcular();

// defesa.js - Continuação
// Sistema de Defesas Ativas - Parte 2

// Adicionando métodos de correção para o bug do bloqueio
SistemaDefesas.prototype.corrigirBloqueioAutomatico = function() {
    const elemento = document.getElementById('bloqueioTotal');
    if (!elemento) return;
    
    // Verificar se o valor está incorreto (8 é o valor bugado comum)
    if (elemento.textContent.trim() === '8' && this.estado.defesas.bloqueio !== 8) {
        elemento.textContent = this.estado.defesas.bloqueio;
        this.estado.bloqueioForcado = true;
        
        // Efeito visual sutil
        elemento.style.transition = 'all 0.3s ease';
        elemento.style.color = '#2ecc71';
        
        setTimeout(() => {
            elemento.style.color = '';
        }, 1000);
    }
};

// Método para sincronizar com o sistema de PV/PF existente
SistemaDefesas.prototype.sincronizarComSistemaPV = function() {
    // Sincronizar valores de PF para cálculo de fadiga
    const pfAtual = this.obterPFAtual();
    const pfMaximo = this.obterPFMaximo();
    
    if (pfAtual !== null && pfMaximo !== null) {
        const limiteFadiga = Math.ceil(pfMaximo / 3);
        this.estado.fadiga = {
            ativa: pfAtual <= limiteFadiga,
            pfAtual: pfAtual,
            pfMaximo: pfMaximo,
            limiteFadiga: limiteFadiga
        };
    }
    
    this.atualizarIndicadorFadiga();
};

SistemaDefesas.prototype.obterPFAtual = function() {
    try {
        const pfAtualDisplay = document.getElementById('pfAtualDisplay');
        if (pfAtualDisplay) {
            // Pode ser input ou span
            return parseInt(pfAtualDisplay.value || pfAtualDisplay.textContent) || 10;
        }
        
        // Tentar encontrar em outros locais comuns
        const possiveisElementos = [
            '#pfAtual',
            '.pv-pf-grid input[type="number"]',
            '.status-bar .bar-text'
        ];
        
        for (let seletor of possiveisElementos) {
            const elemento = document.querySelector(seletor);
            if (elemento && (elemento.value || elemento.textContent)) {
                const valor = parseInt(elemento.value || elemento.textContent);
                if (!isNaN(valor)) return valor;
            }
        }
        
        return 10; // Valor padrão
    } catch (error) {
        return 10;
    }
};

SistemaDefesas.prototype.obterPFMaximo = function() {
    try {
        const pfMaxDisplay = document.getElementById('pfMaxDisplay');
        if (pfMaxDisplay) {
            return parseInt(pfMaxDisplay.textContent) || 10;
        }
        
        // Buscar em elementos com texto de PF máximo
        const elementos = document.querySelectorAll('*');
        for (let elemento of elementos) {
            if (elemento.textContent && elemento.textContent.includes('PF Máx')) {
                const numeros = elemento.textContent.match(/\d+/g);
                if (numeros && numeros.length > 0) {
                    return parseInt(numeros[0]) || 10;
                }
            }
        }
        
        return 10; // Valor padrão
    } catch (error) {
        return 10;
    }
};

// Integração com botões de controle rápido
SistemaDefesas.prototype.configurarControlesRapidos = function() {
    const botoesDano = document.querySelectorAll('.btn-dano');
    const botoesCura = document.querySelectorAll('.btn-cura');
    
    // Configurar botões de dano
    botoesDano.forEach(botao => {
        botao.addEventListener('click', () => {
            setTimeout(() => {
                this.sincronizarComSistemaPV();
                this.calcularTudo();
            }, 300);
        });
    });
    
    // Configurar botões de cura
    botoesCura.forEach(botao => {
        botao.addEventListener('click', () => {
            setTimeout(() => {
                this.sincronizarComSistemaPV();
                this.calcularTudo();
            }, 300);
        });
    });
    
    // Botão de reset
    const btnReset = document.querySelector('.btn-reset');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            setTimeout(() => {
                this.sincronizarComSistemaPV();
                this.calcularTudo();
            }, 500);
        });
    }
};

// Monitorar mudanças na arma equipada
SistemaDefesas.prototype.monitorarArmaEquipada = function() {
    const containerArma = document.querySelector('.arma-equipada');
    if (!containerArma) return;
    
    const observer = new MutationObserver(() => {
        this.estado.nh.arma = null;
        setTimeout(() => {
            this.buscarNHArma();
            this.calcularTudo();
        }, 300);
    });
    
    observer.observe(containerArma, {
        childList: true,
        subtree: true,
        characterData: true
    });
    
    this.observadores.push(observer);
};

// Sistema de cache para melhor performance
SistemaDefesas.prototype.salvarCache = function() {
    try {
        const cache = {
            nivelEscudo: this.estado.nh.escudo ? this.estado.nh.escudo - this.estado.atributos.dx : 0,
            nivelArma: this.estado.nh.arma ? this.estado.nh.arma - this.estado.atributos.dx : 0,
            bonus: this.estado.bonus,
            modificadores: this.estado.modificadores,
            nivelCarga: this.estado.nivelCarga
        };
        
        localStorage.setItem('defesasCache', JSON.stringify(cache));
    } catch (error) {
        // Silencioso em caso de erro
    }
};

SistemaDefesas.prototype.carregarCache = function() {
    try {
        const cache = JSON.parse(localStorage.getItem('defesasCache'));
        if (cache) {
            // Aplicar cache se os atributos forem os mesmos
            const dx = this.estado.atributos.dx;
            
            if (cache.nivelEscudo) {
                this.estado.nh.escudo = dx + cache.nivelEscudo;
            }
            
            if (cache.nivelArma) {
                this.estado.nh.arma = dx + cache.nivelArma;
            }
            
            // Aplicar bônus e modificadores do cache
            Object.assign(this.estado.bonus, cache.bonus || {});
            Object.assign(this.estado.modificadores, cache.modificadores || {});
            
            this.estado.nivelCarga = cache.nivelCarga || 'nenhuma';
            
            // Atualizar inputs com valores do cache
            this.aplicarCacheAosInputs();
        }
    } catch (error) {
        // Silencioso em caso de erro
    }
};

SistemaDefesas.prototype.aplicarCacheAosInputs = function() {
    // Aplicar bônus do cache aos inputs
    Object.keys(this.estado.bonus).forEach(bonus => {
        const input = document.getElementById(`bonus${bonus.charAt(0).toUpperCase() + bonus.slice(1)}`);
        if (input) {
            input.value = this.estado.bonus[bonus];
        }
    });
    
    // Aplicar modificadores do cache
    Object.keys(this.estado.modificadores).forEach(mod => {
        const input = document.getElementById(`${mod}Mod`);
        if (input) {
            input.value = this.estado.modificadores[mod];
        }
    });
};

// Sistema de atualização em tempo real para atributos
SistemaDefesas.prototype.iniciarMonitoramentoAtributos = function() {
    // Monitorar seção de atributos se existir
    const secaoAtributos = document.querySelector('.atributos-container') || 
                          document.querySelector('.atributos-grid');
    
    if (secaoAtributos) {
        const observer = new MutationObserver(() => {
            setTimeout(() => {
                this.carregarValoresIniciais();
                this.calcularTudo();
            }, 500);
        });
        
        observer.observe(secaoAtributos, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['value', 'textContent']
        });
        
        this.observadores.push(observer);
    }
};

// Método para lidar com mudanças de aba
SistemaDefesas.prototype.configurarMonitoramentoAbas = function() {
    // Monitorar todas as abas que podem afetar defesas
    const abas = document.querySelectorAll('.tab-button, .nav-tab');
    
    abas.forEach(aba => {
        aba.addEventListener('click', () => {
            // Quando muda de aba, verificar se precisa recalcular
            setTimeout(() => {
                this.verificarMudancasContexto();
            }, 800);
        });
    });
};

SistemaDefesas.prototype.verificarMudancasContexto = function() {
    // Verificar se houve mudanças que afetam as defesas
    const dxAntigo = this.estado.atributos.dx;
    const htAntigo = this.estado.atributos.ht;
    
    this.carregarValoresIniciais();
    
    if (dxAntigo !== this.estado.atributos.dx || 
        htAntigo !== this.estado.atributos.ht) {
        this.calcularTudo();
    }
    
    // Verificar mudanças em equipamentos/perícias
    this.estado.nh.escudo = null;
    this.estado.nh.arma = null;
    this.buscarNHs();
    this.calcularTudo();
};

// Método para exportar/importar estado
SistemaDefesas.prototype.exportarEstado = function() {
    return {
        atributos: { ...this.estado.atributos },
        bonus: { ...this.estado.bonus },
        modificadores: { ...this.estado.modificadores },
        defesas: { ...this.estado.defesas },
        fadiga: { ...this.estado.fadiga },
        nivelCarga: this.estado.nivelCarga,
        timestamp: new Date().toISOString()
    };
};

SistemaDefesas.prototype.importarEstado = function(estado) {
    if (!estado || typeof estado !== 'object') return;
    
    Object.assign(this.estado.atributos, estado.atributos || {});
    Object.assign(this.estado.bonus, estado.bonus || {});
    Object.assign(this.estado.modificadores, estado.modificadores || {});
    Object.assign(this.estado.defesas, estado.defesas || {});
    
    if (estado.fadiga) {
        Object.assign(this.estado.fadiga, estado.fadiga);
    }
    
    if (estado.nivelCarga) {
        this.estado.nivelCarga = estado.nivelCarga;
    }
    
    this.atualizarInterface();
    this.aplicarCacheAosInputs();
};

// Adicionando estilos dinâmicos para feedback visual
SistemaDefesas.prototype.adicionarEstilosDinamicos = function() {
    const style = document.createElement('style');
    style.id = 'defesas-estilos-dinamicos';
    style.textContent = `
        .defesa-total.atualizado {
            animation: pulse-defesa 0.5s ease;
            background-color: rgba(46, 204, 113, 0.1);
            border-radius: 4px;
            padding: 2px 6px;
        }
        
        @keyframes pulse-defesa {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .indicador-fadiga {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-left: 5px;
            background-color: #e74c3c;
            animation: pulse-fadiga 2s infinite;
        }
        
        @keyframes pulse-fadiga {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
        }
        
        .bonus-input:focus {
            border-color: #d4af37;
            box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.2);
        }
    `;
    
    document.head.appendChild(style);
};

// Atualizar método iniciar para incluir novas funcionalidades
const iniciarOriginal = SistemaDefesas.prototype.iniciar;
SistemaDefesas.prototype.iniciar = function() {
    if (this.iniciado) return;
    
    // Executar método original
    iniciarOriginal.call(this);
    
    // Configurações adicionais
    this.adicionarEstilosDinamicos();
    this.carregarCache();
    this.configurarControlesRapidos();
    this.monitorarArmaEquipada();
    this.iniciarMonitoramentoAtributos();
    this.configurarMonitoramentoAbas();
    
    // Salvar cache periodicamente
    setInterval(() => this.salvarCache(), 10000);
    
    // Verificação periódica do bloqueio
    setInterval(() => this.corrigirBloqueioAutomatico(), 2000);
};

// Extensão para cálculo de RD (Resistência a Dano) se necessário
SistemaDefesas.prototype.calcularRDTotal = function() {
    // Este método pode ser expandido para calcular RD se necessário
    const rdInputs = document.querySelectorAll('.rd-input');
    let totalRD = 0;
    
    rdInputs.forEach(input => {
        totalRD += parseInt(input.value) || 0;
    });
    
    return totalRD;
};

// Método para lidar com penalidades de ataque
SistemaDefesas.prototype.aplicarPenalidadesAtaque = function(valorBase, tipoAtaque) {
    let penalidade = 0;
    
    // Verificar condições ativas
    const condicoesAtivas = document.querySelectorAll('.condicao-item.ativa');
    
    condicoesAtivas.forEach(condicao => {
        const nomeCondicao = condicao.textContent.toLowerCase();
        
        // Aplicar penalidades baseadas em condições
        if (nomeCondicao.includes('cegueira') || nomeCondicao.includes('surdo')) {
            penalidade -= 4;
        } else if (nomeCondicao.includes('atordoado')) {
            penalidade -= 2;
        } else if (nomeCondicao.includes('fatigado')) {
            penalidade -= 1;
        }
    });
    
    // Aplicar penalidade de carga
    const penalidadeCarga = this.config.redutorCarga[this.estado.nivelCarga] || 0;
    penalidade += penalidadeCarga;
    
    return Math.max(valorBase + penalidade, 1);
};

// Sistema de notificações para o usuário
SistemaDefesas.prototype.mostrarNotificacao = function(mensagem, tipo = 'info') {
    // Criar notificação temporária
    const notificacao = document.createElement('div');
    notificacao.className = `defesa-notificacao defesa-notificacao-${tipo}`;
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 6px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100px);
        transition: all 0.3s ease;
    `;
    
    // Estilos por tipo
    const estilosPorTipo = {
        info: 'background: linear-gradient(135deg, #3498db, #2980b9);',
        success: 'background: linear-gradient(135deg, #2ecc71, #27ae60);',
        warning: 'background: linear-gradient(135deg, #f39c12, #d35400);',
        error: 'background: linear-gradient(135deg, #e74c3c, #c0392b);'
    };
    
    notificacao.style.cssText += estilosPorTipo[tipo] || estilosPorTipo.info;
    
    document.body.appendChild(notificacao);
    
    // Animação de entrada
    setTimeout(() => {
        notificacao.style.opacity = '1';
        notificacao.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover após 3 segundos
    setTimeout(() => {
        notificacao.style.opacity = '0';
        notificacao.style.transform = 'translateX(100px)';
        
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 300);
    }, 3000);
};

// Sobrescrever método calcularTudo para incluir notificações
const calcularTudoOriginal = SistemaDefesas.prototype.calcularTudo;
SistemaDefesas.prototype.calcularTudo = function() {
    if (this.atualizando) return;
    
    this.atualizando = true;
    
    try {
        // Executar cálculo original
        calcularTudoOriginal.call(this);
        
        // Verificar mudanças significativas
        this.verificarMudancasSignificativas();
        
    } catch (error) {
        console.error('Erro nos cálculos:', error);
        this.mostrarNotificacao('Erro ao calcular defesas', 'error');
    } finally {
        this.atualizando = false;
    }
};

SistemaDefesas.prototype.verificarMudancasSignificativas = function() {
    // Comparar com valores anteriores para detectar mudanças grandes
    if (!this.valoresAnterios) {
        this.valoresAnterios = { ...this.estado.defesas };
        return;
    }
    
    // Verificar mudanças maiores que 2 pontos
    Object.keys(this.estado.defesas).forEach(defesa => {
        const diferenca = Math.abs(this.estado.defesas[defesa] - this.valoresAnterios[defesa]);
        
        if (diferenca >= 3) {
            this.mostrarNotificacao(
                `${defesa.charAt(0).toUpperCase() + defesa.slice(1)} alterada significativamente`,
                'info'
            );
        }
    });
    
    this.valoresAnterios = { ...this.estado.defesas };
};

// Finalização do sistema
console.log('✅ Sistema de Defesas carregado e pronto');

// Adicionar botão de ajuda flutuante
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const botaoAjuda = document.createElement('button');
        botaoAjuda.id = 'defesa-ajuda-flutuante';
        botaoAjuda.innerHTML = '❓';
        botaoAjuda.title = 'Ajuda do Sistema de Defesas';
        botaoAjuda.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: linear-gradient(135deg, #d4af37, #b8941f);
            color: white;
            border: none;
            font-size: 18px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
        `;
        
        botaoAjuda.addEventListener('mouseenter', () => {
            botaoAjuda.style.transform = 'scale(1.1)';
        });
        
        botaoAjuda.addEventListener('mouseleave', () => {
            botaoAjuda.style.transform = 'scale(1)';
        });
        
        botaoAjuda.addEventListener('click', () => {
            const ajudaTexto = `
🎮 SISTEMA DE DEFESAS ATIVAS 🎮

COMANDOS DISPONÍVEIS:

No console:
• DS() - Mostrar status do sistema
• DR() - Forçar recálculo completo
• defesa.iniciar() - Reiniciar sistema
• defesa.status() - Ver detalhes

FUNCIONALIDADES:
✓ Cálculo automático de defesas
✓ Sistema de fadiga integrado
✓ Bônus acumulativos
✓ Correção automática de bugs
✓ Monitoramento em tempo real

O sistema atualiza automaticamente quando:
• Atributos (DX/HT) mudam
• Bônus são alterados
• Estado de fadiga muda
• Perícias são modificadas
• Equipamentos são trocados
            `;
            
            alert(ajudaTexto);
        });
        
        document.body.appendChild(botaoAjuda);
    }, 2000);
});