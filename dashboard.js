// ===========================================
// DASHBOARD.GURPS.JS - Sistema Completo de Dashboard
// ===========================================

class DashboardGURPS {
    constructor() {
        console.log('🎮 Inicializando Dashboard GURPS...');
        
        // Estado do dashboard
        this.estado = {
            atributos: {
                ST: 10,
                DX: 10, 
                IQ: 10,
                HT: 10
            },
            bonus: {
                PV: 0,
                PF: 0,
                Vontade: 0,
                Percepcao: 0,
                Deslocamento: 0
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
                magias: 0
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
                tipo: "",
                foto: null
            }
        };
        
        this.inicializado = false;
        this.intervaloMonitoramento = null;
    }

    // ===========================================
    // INICIALIZAÇÃO COMPLETA
    // ===========================================

    iniciar() {
        if (this.inicializado) return;
        
        console.log('🚀 Dashboard GURPS iniciando...');
        
        // 1. Configurar todos os eventos
        this.configurarEventosCompletos();
        
        // 2. Carregar dados salvos
        this.carregarDadosSalvos();
        
        // 3. Sincronizar com sistemas existentes
        this.sincronizarComSistemas();
        
        // 4. Atualizar dashboard visual
        this.atualizarDashboardCompleto();
        
        // 5. Iniciar monitoramento contínuo
        this.iniciarMonitoramentoContinuo();
        
        this.inicializado = true;
        console.log('✅ Dashboard GURPS COMPLETO inicializado!');
    }

    configurarEventosCompletos() {
        // 1. Eventos para atributos principais
        this.configurarEventosAtributos();
        
        // 2. Eventos para bônus
        this.configurarEventosBonus();
        
        // 3. Eventos de identificação
        this.configurarEventosIdentificacao();
        
        // 4. Eventos de características físicas
        this.configurarEventosCaracteristicas();
        
        // 5. Eventos de sistema de pontos
        this.configurarEventosPontos();
        
        // 6. Eventos de equipamento
        this.configurarEventosEquipamento();
        
        // 7. Ouvir eventos do sistema de atributos
        this.configurarOuvinteSistemaAtributos();
    }

    // ===========================================
    // SISTEMA DE ATRIBUTOS - CONEXÃO DIRETA
    // ===========================================

    configurarEventosAtributos() {
        const atributos = ['ST', 'DX', 'IQ', 'HT'];
        
        atributos.forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                // Quando mudar via input
                input.addEventListener('input', () => {
                    this.sincronizarAtributo(atributo);
                });
                
                // Quando perder foco
                input.addEventListener('change', () => {
                    this.sincronizarAtributo(atributo);
                });
                
                console.log(`✅ Monitorando atributo: ${atributo}`);
            } else {
                console.warn(`⚠️ Input não encontrado: ${atributo}`);
            }
        });
    }

    sincronizarAtributo(atributo) {
        const input = document.getElementById(atributo);
        if (!input) return;
        
        const valor = parseInt(input.value) || 10;
        this.estado.atributos[atributo] = valor;
        
        // Atualizar dashboard imediatamente
        this.atualizarDashboardCompleto();
    }

    configurarEventosBonus() {
        const bonusList = ['PV', 'PF', 'Vontade', 'Percepcao', 'Deslocamento'];
        
        bonusList.forEach(bonus => {
            const input = document.getElementById('bonus' + bonus);
            if (input) {
                input.addEventListener('input', () => {
                    this.sincronizarBonus(bonus);
                });
                
                input.addEventListener('change', () => {
                    this.sincronizarBonus(bonus);
                });
                
                console.log(`✅ Monitorando bônus: ${bonus}`);
            } else {
                console.warn(`⚠️ Input de bônus não encontrado: bonus${bonus}`);
            }
        });
    }

    sincronizarBonus(bonus) {
        const input = document.getElementById('bonus' + bonus);
        if (!input) return;
        
        let valor;
        if (bonus === 'Deslocamento') {
            valor = parseFloat(input.value) || 0;
        } else {
            valor = parseInt(input.value) || 0;
        }
        
        this.estado.bonus[bonus] = valor;
        this.atualizarDashboardCompleto();
    }

    configurarOuvinteSistemaAtributos() {
        // Ouvir eventos do sistema de atributos se existir
        if (typeof personagemAtributos !== 'undefined') {
            console.log('🔗 Conectado ao sistema de atributos');
            
            // Observar mudanças periódicas
            setInterval(() => {
                this.sincronizarComObjetoAtributos();
            }, 500);
        }
    }

    sincronizarComObjetoAtributos() {
        if (typeof personagemAtributos === 'undefined') return;
        
        // Sincronizar atributos principais
        this.estado.atributos.ST = personagemAtributos.ST || 10;
        this.estado.atributos.DX = personagemAtributos.DX || 10;
        this.estado.atributos.IQ = personagemAtributos.IQ || 10;
        this.estado.atributos.HT = personagemAtributos.HT || 10;
        
        // Sincronizar bônus
        if (personagemAtributos.bonus) {
            this.estado.bonus.PV = personagemAtributos.bonus.PV || 0;
            this.estado.bonus.PF = personagemAtributos.bonus.PF || 0;
            this.estado.bonus.Vontade = personagemAtributos.bonus.Vontade || 0;
            this.estado.bonus.Percepcao = personagemAtributos.bonus.Percepcao || 0;
            this.estado.bonus.Deslocamento = personagemAtributos.bonus.Deslocamento || 0;
        }
    }

    // ===========================================
    // IDENTIFICAÇÃO
    // ===========================================

    configurarEventosIdentificacao() {
        // Nome do personagem
        const nomeInput = document.getElementById('char-name');
        if (nomeInput) {
            nomeInput.addEventListener('input', (e) => {
                this.estado.identificacao.nome = e.target.value;
                this.salvarDados();
            });
            
            // Carregar valor salvo
            nomeInput.value = this.estado.identificacao.nome;
        }
        
        // Tipo do personagem
        const tipoInput = document.getElementById('char-type');
        if (tipoInput) {
            tipoInput.addEventListener('input', (e) => {
                this.estado.identificacao.tipo = e.target.value;
                this.salvarDados();
            });
            
            // Carregar valor salvo
            tipoInput.value = this.estado.identificacao.tipo;
        }
        
        // Foto do personagem
        const uploadInput = document.getElementById('char-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                this.manipularUploadFoto(e);
            });
        }
    }

    manipularUploadFoto(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            this.estado.identificacao.foto = e.target.result;
            
            // Atualizar preview
            const preview = document.getElementById('photo-preview');
            if (preview) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Foto do Personagem">`;
                preview.style.backgroundImage = `url(${e.target.result})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
            }
            
            this.salvarDados();
        };
        reader.readAsDataURL(file);
    }

    // ===========================================
    // CARACTERÍSTICAS FÍSICAS
    // ===========================================

    configurarEventosCaracteristicas() {
        // Descrição física
        const descInput = document.getElementById('phys-description');
        if (descInput) {
            descInput.addEventListener('input', (e) => {
                this.estado.caracteristicas.descricao = e.target.value;
                this.salvarDados();
            });
            
            // Carregar valor salvo
            descInput.value = this.estado.caracteristicas.descricao;
        }
        
        // Sincronizar com sistema de características físicas se existir
        this.sincronizarComSistemaCaracteristicas();
    }

    sincronizarComSistemaCaracteristicas() {
        if (typeof sistemaCaracteristicasFisicas === 'undefined') return;
        
        setInterval(() => {
            try {
                const dados = sistemaCaracteristicasFisicas.exportarDados();
                if (dados.caracteristicasFisicas) {
                    const fisicas = dados.caracteristicasFisicas;
                    
                    this.estado.caracteristicas.altura = fisicas.altura || 1.70;
                    this.estado.caracteristicas.peso = fisicas.peso || 70;
                    this.estado.caracteristicas.idade = fisicas.visual?.idade || 25;
                    this.estado.caracteristicas.aparência = 
                        fisicas.conformidade?.dentroDaFaixa ? "Normal" : "Fora da Faixa";
                    
                    this.atualizarDashboardCompleto();
                }
            } catch (error) {
                // Sistema não disponível ainda
            }
        }, 1000);
    }

    // ===========================================
    // SISTEMA DE PONTOS
    // ===========================================

    configurarEventosPontos() {
        // Pontos iniciais
        const pontosInput = document.getElementById('start-points');
        if (pontosInput) {
            pontosInput.addEventListener('change', (e) => {
                this.estado.pontos.inicial = parseInt(e.target.value) || 150;
                this.atualizarDashboardCompleto();
                this.salvarDados();
            });
            
            pontosInput.value = this.estado.pontos.inicial;
        }
        
        // Limite desvantagens
        const limiteInput = document.getElementById('dis-limit');
        if (limiteInput) {
            limiteInput.addEventListener('change', (e) => {
                // Apenas atualizar visualmente
                this.atualizarDashboardCompleto();
                this.salvarDados();
            });
        }
    }

    // ===========================================
    // EQUIPAMENTO
    // ===========================================

    configurarEventosEquipamento() {
        // Monitorar peso do equipamento
        setInterval(() => {
            this.atualizarEquipamento();
        }, 2000);
    }

    atualizarEquipamento() {
        const ST = this.estado.atributos.ST;
        const peso = this.estado.equipamento.peso;
        
        // Calcular nível de carga
        let nivel = 'Nenhuma';
        let porcentagem = 0;
        
        if (ST <= 0) ST = 10;
        
        if (peso <= ST) {
            nivel = 'Nenhuma';
            porcentagem = (peso / ST) * 25;
        } else if (peso <= ST * 2) {
            nivel = 'Leve';
            porcentagem = 25 + ((peso - ST) / ST) * 25;
        } else if (peso <= ST * 3) {
            nivel = 'Média';
            porcentagem = 50 + ((peso - ST * 2) / ST) * 25;
        } else if (peso <= ST * 6) {
            nivel = 'Pesada';
            porcentagem = 75 + ((peso - ST * 3) / (ST * 3)) * 25;
        } else {
            nivel = 'Muito Pesada';
            porcentagem = 100;
        }
        
        this.estado.equipamento.nivelCarga = nivel;
        this.atualizarElemento('enc-level', nivel);
        
        // Atualizar barra
        const barra = document.getElementById('enc-fill');
        if (barra) {
            barra.style.width = `${Math.min(100, porcentagem)}%`;
        }
        
        // Nota
        const nota = document.getElementById('enc-note');
        if (nota) {
            if (nivel === 'Muito Pesada') {
                nota.textContent = 'Acima da capacidade';
            } else {
                nota.textContent = `Peso atual: ${peso.toFixed(1)} kg`;
            }
        }
    }

    // ===========================================
    // ATUALIZAÇÃO COMPLETA DO DASHBOARD
    // ===========================================

    atualizarDashboardCompleto() {
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
        this.atualizarEquipamentoVisual();
        
        // 7. Resumo
        this.atualizarResumo();
        
        // 8. Timestamp
        this.atualizarTimestamp();
        
        // Salvar dados
        this.salvarDados();
    }

    atualizarAtributosPrincipais() {
        const { ST, DX, IQ, HT } = this.estado.atributos;
        
        // Atualizar valores principais
        this.atualizarElemento('attr-st', ST);
        this.atualizarElemento('attr-dx', DX);
        this.atualizarElemento('attr-iq', IQ);
        this.atualizarElemento('attr-ht', HT);
        
        // Atualizar detalhes
        this.atualizarDetalhesAtributos();
    }

    atualizarDetalhesAtributos() {
        const { ST, DX, IQ, HT } = this.estado.atributos;
        
        // Calcular dano base
        let danoGDP = '1d-2', danoGEB = '1d';
        if (window.danoTable && ST >= 1 && ST <= 40) {
            const stKey = Math.min(Math.max(ST, 1), 40);
            if (window.danoTable[stKey]) {
                danoGDP = window.danoTable[stKey].gdp;
                danoGEB = window.danoTable[stKey].geb;
            }
        }
        
        // Calcular esquiva
        const esquivaBase = Math.floor((DX + HT) / 4) + 3;
        
        // Atualizar elementos
        this.atualizarElemento('attr-st-details', `Dano: ${danoGDP}/${danoGEB}`);
        this.atualizarElemento('attr-dx-details', `Esquiva: ${esquivaBase}`);
        this.atualizarElemento('attr-iq-details', `Vontade: ${IQ}`);
        this.atualizarElemento('attr-ht-details', `Resistência: ${HT}`);
    }

    atualizarAtributosSecundarios() {
        const { ST, DX, IQ, HT } = this.estado.atributos;
        const bonus = this.estado.bonus;
        
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
    }

    atualizarSistemaPontos() {
        const { ST, DX, IQ, HT } = this.estado.atributos;
        
        // Calcular custos dos atributos
        const custoST = (ST - 10) * 10;
        const custoDX = (DX - 10) * 20;
        const custoIQ = (IQ - 10) * 20;
        const custoHT = (HT - 10) * 10;
        const gastosAtributos = custoST + custoDX + custoIQ + custoHT;
        
        // Total gasto (atributos + outras coisas)
        const totalGastos = gastosAtributos + this.estado.pontos.vantagens + 
                           this.estado.pontos.desvantagens + this.estado.pontos.pericias + 
                           this.estado.pontos.magias;
        
        this.estado.pontos.gastos = totalGastos;
        
        // Calcular saldo
        const saldo = this.estado.pontos.inicial - totalGastos;
        
        // Atualizar elementos
        this.atualizarElemento('points-balance', saldo);
        this.atualizarElemento('points-adv', this.estado.pontos.vantagens);
        this.atualizarElemento('points-dis', this.estado.pontos.desvantagens);
        this.atualizarElemento('points-skills', this.estado.pontos.pericias);
        this.atualizarElemento('points-spells', this.estado.pontos.magias);
        
        // Estilizar saldo
        const balanceElement = document.getElementById('points-balance');
        if (balanceElement) {
            if (saldo > 0) {
                balanceElement.style.color = '#27ae60';
                balanceElement.classList.add('positivo');
                balanceElement.classList.remove('negativo', 'neutro');
            } else if (saldo < 0) {
                balanceElement.style.color = '#e74c3c';
                balanceElement.classList.add('negativo');
                balanceElement.classList.remove('positivo', 'neutro');
            } else {
                balanceElement.style.color = '#f39c12';
                balanceElement.classList.add('neutro');
                balanceElement.classList.remove('positivo', 'negativo');
            }
        }
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

    atualizarEquipamentoVisual() {
        const { peso, valor, nivelCarga } = this.estado.equipamento;
        
        // Atualizar elementos
        this.atualizarElemento('equip-weight', `${peso.toFixed(1)} kg`);
        this.atualizarElemento('equip-value', `$${valor}`);
        this.atualizarElemento('enc-level', nivelCarga);
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
        
        this.atualizarElemento('current-time', timestamp);
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.textContent !== valor.toString()) {
                elemento.textContent = valor;
                elemento.classList.add('dashboard-updated');
                
                setTimeout(() => {
                    elemento.classList.remove('dashboard-updated');
                }, 500);
            }
        }
    }

    // ===========================================
    // MONITORAMENTO CONTÍNUO
    // ===========================================

    iniciarMonitoramentoContinuo() {
        // Parar intervalo anterior se existir
        if (this.intervaloMonitoramento) {
            clearInterval(this.intervaloMonitoramento);
        }
        
        // Atualizar a cada 2 segundos
        this.intervaloMonitoramento = setInterval(() => {
            this.atualizarDashboardCompleto();
        }, 2000);
    }

    // ===========================================
    // SISTEMA DE SALVAMENTO
    // ===========================================

    carregarDadosSalvos() {
        try {
            const dados = localStorage.getItem('gurps_dashboard_completo');
            if (dados) {
                const parsed = JSON.parse(dados);
                this.estado = { ...this.estado, ...parsed };
                console.log('📂 Dados do dashboard carregados');
                return true;
            }
        } catch (error) {
            console.warn('Não foi possível carregar dados do dashboard:', error);
        }
        return false;
    }

    salvarDados() {
        try {
            localStorage.setItem('gurps_dashboard_completo', JSON.stringify(this.estado));
            return true;
        } catch (error) {
            console.warn('Não foi possível salvar dados do dashboard:', error);
            return false;
        }
    }

    // ===========================================
    // SINCORNIZAÇÃO COM OUTROS SISTEMAS
    // ===========================================

    sincronizarComSistemas() {
        // Sincronizar com sistema de atributos
        this.sincronizarComObjetoAtributos();
        
        // Sincronizar com sistema de características físicas
        this.sincronizarComSistemaCaracteristicas();
    }

    // ===========================================
    // FUNÇÕES PÚBLICAS
    // ===========================================

    atualizarPontos(tipo, valor) {
        if (this.estado.pontos[tipo] !== undefined) {
            this.estado.pontos[tipo] = valor;
            this.atualizarDashboardCompleto();
            return true;
        }
        return false;
    }

    atualizarEquipamentoPeso(peso) {
        this.estado.equipamento.peso = parseFloat(peso) || 0;
        this.atualizarDashboardCompleto();
    }

    atualizarEquipamentoValor(valor) {
        this.estado.equipamento.valor = parseFloat(valor) || 0;
        this.atualizarDashboardCompleto();
    }

    forcarAtualizacao() {
        this.atualizarDashboardCompleto();
    }

    obterEstado() {
        return JSON.parse(JSON.stringify(this.estado));
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

// Criar instância global
window.dashboardGURPS = new DashboardGURPS();

// Função para inicializar quando a aba for ativa
function inicializarDashboardQuandoAtivo() {
    const tabDashboard = document.getElementById('dashboard');
    
    if (tabDashboard && tabDashboard.classList.contains('active')) {
        setTimeout(() => {
            window.dashboardGURPS.iniciar();
        }, 300);
    }
}

// Observar mudanças na aba
const observerDashboard = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            const tab = mutation.target;
            if (tab.id === 'dashboard') {
                if (tab.classList.contains('active')) {
                    // Pequeno delay para garantir tudo carregou
                    setTimeout(() => {
                        if (window.dashboardGURPS && !window.dashboardGURPS.inicializado) {
                            window.dashboardGURPS.iniciar();
                        }
                    }, 200);
                }
            }
        }
    });
});

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM carregado - preparando dashboard...');
    
    const tabDashboard = document.getElementById('dashboard');
    if (tabDashboard) {
        observerDashboard.observe(tabDashboard, { attributes: true });
        
        // Se a aba já estiver ativa, inicializar
        if (tabDashboard.classList.contains('active')) {
            setTimeout(() => {
                window.dashboardGURPS.iniciar();
            }, 500);
        }
    }
    
    // Também ouvir cliques nos botões de navegação
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('[data-tab]');
        if (tabBtn && tabBtn.dataset.tab === 'dashboard') {
            setTimeout(() => {
                if (window.dashboardGURPS && !window.dashboardGURPS.inicializado) {
                    window.dashboardGURPS.iniciar();
                } else if (window.dashboardGURPS) {
                    window.dashboardGURPS.forcarAtualizacao();
                }
            }, 300);
        }
    });
});

// ===========================================
// CSS PARA ANIMAÇÕES
// ===========================================

const dashboardCSS = `
.dashboard-updated {
    animation: pulse 0.3s ease;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

/* Estilos para status de pontos */
.positivo { color: #27ae60 !important; }
.negativo { color: #e74c3c !important; }
.neutro { color: #f39c12 !important; }

/* Barra de carga */
.enc-fill {
    transition: width 0.5s ease;
    border-radius: 5px;
    background: linear-gradient(90deg, #2ecc71, #27ae60);
}

.enc-fill.nenhuma { background: linear-gradient(90deg, #2ecc71, #27ae60); }
.enc-fill.leve { background: linear-gradient(90deg, #f1c40f, #f39c12); }
.enc-fill.media { background: linear-gradient(90deg, #e67e22, #d35400); }
.enc-fill.pesada { background: linear-gradient(90deg, #e74c3c, #c0392b); }
.enc-fill.muito-pesada { background: linear-gradient(90deg, #c0392b, #7d3c98); }

/* Foto do personagem */
.photo-preview {
    width: 100%;
    height: 150px;
    background: rgba(30, 22, 10, 0.5);
    border: 3px dashed var(--wood-light);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.photo-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
`;

// Adicionar CSS ao documento
if (!document.getElementById('dashboard-gurps-css')) {
    const style = document.createElement('style');
    style.id = 'dashboard-gurps-css';
    style.textContent = dashboardCSS;
    document.head.appendChild(style);
}

// ===========================================
// FUNÇÕES GLOBAIS DE TESTE
// ===========================================

// Função de teste
window.testarDashboard = function() {
    console.log('🧪 Testando dashboard...');
    console.log('Estado atual:', window.dashboardGURPS.obterEstado());
    window.dashboardGURPS.forcarAtualizacao();
    console.log('✅ Dashboard atualizado!');
};

// Função para simular mudanças
window.simularMudancaAtributo = function(atributo, valor) {
    if (window.dashboardGURPS.estado.atributos[atributo] !== undefined) {
        window.dashboardGURPS.estado.atributos[atributo] = valor;
        window.dashboardGURPS.forcarAtualizacao();
        console.log(`${atributo} alterado para ${valor}`);
    }
};

console.log('✅ dashboard.gurps.js CARREGADO - Sistema completo pronto!');