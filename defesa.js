// defesa.js - Sistema Dinâmico de Defesas Ativas
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
    }
    
    iniciar() {
        if (this.iniciado) return;
        
        try {
            this.carregarElementos();
            this.carregarValoresIniciais();
            this.configurarEventos();
            this.calcularTudo();
            this.iniciarMonitoramento();
            
            this.iniciado = true;
            
            console.log('✅ Sistema de defesas iniciado');
            
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
    
    carregarValoresIniciais() {
        // Carrega DX e HT do sistema de atributos
        if (this.elementos.dx) {
            this.estado.atributos.dx = parseInt(this.elementos.dx.value) || 10;
        }
        
        if (this.elementos.ht) {
            this.estado.atributos.ht = parseInt(this.elementos.ht.value) || 10;
        }
        
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
    
    calcularTudo() {
        if (this.atualizando) return;
        
        this.atualizando = true;
        
        try {
            // Atualiza atributos antes de calcular
            this.atualizarAtributos();
            
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
            return;
        }
        
        // Fórmula: (NH Escudo) / 2 + 3 (arredondado para baixo)
        const base = Math.floor(nhEscudo / 2) + 3;
        const modificador = this.estado.modificadores.bloqueio;
        const bonusTotal = this.calcularBonusTotal();
        
        const total = base + modificador + bonusTotal;
        
        // Mínimo 1
        this.estado.defesas.bloqueio = Math.max(total, 1);
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
            return;
        }
        
        // Fórmula: (NH Arma) / 2 + 3 (arredondado para baixo)
        const base = Math.floor(nhArma / 2) + 3;
        const modificador = this.estado.modificadores.aparar;
        const bonusTotal = this.calcularBonusTotal();
        
        const total = base + modificador + bonusTotal;
        
        // Mínimo 1
        this.estado.defesas.aparar = Math.max(total, 1);
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
    }
    
    buscarNHs() {
        this.buscarNHEscudo();
        this.buscarNHArma();
    }
    
    buscarNHEscudo() {
        const dx = this.estado.atributos.dx;
        let nivelEscudo = 0;
        
        // Método 1: Buscar no sistema de perícias aprendidas
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            const periciasEscudo = window.estadoPericias.periciasAprendidas.filter(p => {
                if (!p) return false;
                const nome = p.nomeCompleto || p.nome || '';
                return nome.includes('Escudo');
            });
            
            if (periciasEscudo.length > 0) {
                const pericia = periciasEscudo[0];
                nivelEscudo = pericia.nivel || pericia.pontos || 0;
            }
        }
        
        // Método 2: Buscar em localStorage
        if (nivelEscudo === 0) {
            try {
                const dados = localStorage.getItem('gurps_pericias');
                if (dados) {
                    const parsed = JSON.parse(dados);
                    if (parsed.periciasAprendidas) {
                        const escudo = parsed.periciasAprendidas.find(p => {
                            if (!p) return false;
                            const nome = p.nomeCompleto || p.nome || '';
                            return nome.includes('Escudo');
                        });
                        
                        if (escudo) {
                            nivelEscudo = escudo.nivel || escudo.pontos || 0;
                        }
                    }
                }
            } catch (e) {
                // Silencioso
            }
        }
        
        // NH = DX + Nível da Perícia
        this.estado.nh.escudo = nivelEscudo > 0 ? dx + nivelEscudo : null;
    }
    
    buscarNHArma() {
        const dx = this.estado.atributos.dx;
        let nivelArma = 0;
        let nomeArma = '';
        
        // Lista de perícias de arma do catálogo
        const periciasArma = [
            'Adaga', 'Espada', 'Machado', 'Maça', 'Arco', 'Lança',
            'Martelo', 'Faca', 'Bastão', 'Rapieira', 'Sabre', 'Terçado'
        ];
        
        // Buscar no sistema de perícias aprendidas
        if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
            for (let pericia of window.estadoPericias.periciasAprendidas) {
                if (!pericia) continue;
                
                const nome = pericia.nomeCompleto || pericia.nome || '';
                
                for (let arma of periciasArma) {
                    if (nome.includes(arma)) {
                        nivelArma = pericia.nivel || pericia.pontos || 0;
                        nomeArma = arma;
                        break;
                    }
                }
                
                if (nivelArma > 0) break;
            }
        }
        
        // Se não encontrou, tenta localStorage
        if (nivelArma === 0) {
            try {
                const dados = localStorage.getItem('gurps_pericias');
                if (dados) {
                    const parsed = JSON.parse(dados);
                    if (parsed.periciasAprendidas) {
                        for (let pericia of parsed.periciasAprendidas) {
                            if (!pericia) continue;
                            
                            const nome = pericia.nomeCompleto || pericia.nome || '';
                            
                            for (let arma of periciasArma) {
                                if (nome.includes(arma)) {
                                    nivelArma = pericia.nivel || pericia.pontos || 0;
                                    nomeArma = arma;
                                    break;
                                }
                            }
                            
                            if (nivelArma > 0) break;
                        }
                    }
                }
            } catch (e) {
                // Silencioso
            }
        }
        
        // NH = DX + Nível da Perícia (se tiver perícia)
        // Se não tiver perícia de arma, aparar será 0
        this.estado.nh.arma = nivelArma > 0 ? dx + nivelArma : null;
        this.estado.nomeArma = nomeArma;
    }
    
    calcularBonusTotal() {
        const { reflexos, escudo, capa, outros } = this.estado.bonus;
        return reflexos + escudo + capa + outros;
    }
    
    getRedutorCarga(nivelCarga) {
        const redutores = {
            'nenhuma': 0,
            'leve': -1,
            'média': -2,
            'pesada': -3,
            'muito pesada': -4
        };
        return redutores[nivelCarga] || 0;
    }
    
    verificarFadiga() {
        try {
            // Tenta pegar PF atual do sistema de PV/PF
            const pfAtualElement = document.getElementById('pfAtualDisplay');
            const pfMaxElement = document.getElementById('pfMaxDisplay');
            
            let pfAtual = 10;
            let pfMaximo = 10;
            
            if (pfAtualElement) {
                pfAtual = parseInt(pfAtualElement.value) || 
                          parseInt(pfAtualElement.textContent) || 10;
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
    
    atualizarInterface() {
        this.atualizarValoresDefesa();
        this.atualizarTotalBonus();
        this.corrigirValoresIncorretos();
    }
    
    atualizarValoresDefesa() {
        if (this.elementos.esquivaTotal) {
            this.elementos.esquivaTotal.textContent = this.estado.defesas.esquiva;
        }
        
        if (this.elementos.bloqueioTotal) {
            // Se bloqueio é 0, mostra "—" ou "0"
            this.elementos.bloqueioTotal.textContent = 
                this.estado.defesas.bloqueio > 0 ? this.estado.defesas.bloqueio : "—";
        }
        
        if (this.elementos.apararTotal) {
            // Se aparar é 0, mostra "—" ou "0"
            this.elementos.apararTotal.textContent = 
                this.estado.defesas.aparar > 0 ? this.estado.defesas.aparar : "—";
        }
        
        if (this.elementos.deslocamentoTotal) {
            this.elementos.deslocamentoTotal.textContent = 
                this.estado.defesas.deslocamento.toFixed(2);
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
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: bold;
                text-align: center;
                display: none;
            `;
            
            const container = document.querySelector('.bonus-defesa');
            if (container) {
                container.appendChild(indicador);
            }
        }
        
        if (this.estado.fadiga.ativa) {
            indicador.innerHTML = `
                <i class="fas fa-exclamation-triangle"></i> FADIGA ATIVA!
                <small>Esquiva e Deslocamento pela metade</small>
            `;
            indicador.style.display = 'block';
            indicador.style.background = '#e74c3c';
            indicador.style.color = 'white';
        } else {
            indicador.style.display = 'none';
        }
    }
    
    corrigirValoresIncorretos() {
        // Corrige o bug comum do bloqueio (valor 8 fixo)
        const bloqueioElement = document.getElementById('bloqueioTotal');
        if (bloqueioElement && bloqueioElement.textContent.trim() === '8') {
            if (this.estado.defesas.bloqueio !== 8) {
                bloqueioElement.textContent = 
                    this.estado.defesas.bloqueio > 0 ? this.estado.defesas.bloqueio : "—";
            }
        }
        
        // Corrige aparar se não tiver arma
        const apararElement = document.getElementById('apararTotal');
        if (apararElement && this.estado.defesas.aparar === 0) {
            apararElement.textContent = "—";
        }
    }
    
    configurarEventos() {
        // Eventos para bônus
        ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
            const input = document.getElementById(`bonus${bonus}`);
            if (input) {
                let timeout;
                
                const handler = () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        const valor = parseInt(input.value) || 0;
                        this.estado.bonus[bonus.toLowerCase()] = valor;
                        this.calcularTudo();
                    }, 300);
                };
                
                input.addEventListener('input', handler);
                input.addEventListener('change', handler);
            }
        });
        
        // Eventos para modificadores
        ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
            const input = document.getElementById(`${defesa}Mod`);
            if (input) {
                input.addEventListener('change', () => {
                    this.estado.modificadores[defesa] = parseInt(input.value) || 0;
                    this.calcularTudo();
                });
            }
        });
        
        // Eventos para botões +/-
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
    
    iniciarMonitoramento() {
        // Monitora mudanças em DX e HT
        this.monitorarAtributos();
        
        // Monitora nível de carga
        this.monitorarNivelCarga();
        
        // Monitora fadiga (PF)
        this.monitorarFadiga();
        
        // Atualiza periodicamente
        this.iniciarAtualizacaoPeriodica();
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
                    }, 500);
                });
            }
        });
    }
    
    atualizarAtributos() {
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
    
    iniciarAtualizacaoPeriodica() {
        // Atualiza a cada 2 segundos para garantir sincronia
        setInterval(() => {
            if (!this.atualizando) {
                this.calcularTudo();
            }
        }, 2000);
    }
    
    forcarRecalculo() {
        this.estado.nh.escudo = null;
        this.estado.nh.arma = null;
        
        this.carregarValoresIniciais();
        this.calcularTudo();
    }
    
    mostrarStatus() {
        console.log('=== STATUS DEFESAS ===');
        console.log('Atributos:', this.estado.atributos);
        console.log('Defesas:', this.estado.defesas);
        console.log('NHs:', this.estado.nh);
        console.log('Fadiga:', this.estado.fadiga.ativa);
        console.log('=====================');
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
            sistemaDefesasGlobal.mostrarStatus();
        }
    },
    recalcular: () => {
        if (sistemaDefesasGlobal) {
            sistemaDefesasGlobal.forcarRecalculo();
        }
    }
};

// Atalhos de console
window.DS = () => defesa.status();
window.DR = () => defesa.recalcular();

console.log('✅ Sistema de Defesas dinâmico carregado!');
console.log('💡 Comandos: DS() - Status, DR() - Recalcular');