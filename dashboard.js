// ============================================
// DASHBOARD.JS - VERSÃO COMPLETA E FUNCIONAL
// ============================================

class DashboardGURPS {
    constructor() {
        this.dadosPersonagem = {};
        this.atributosAtuais = {};
        this.pontosAtuais = {};
        this.cargasAtuais = {};
        this.intervaloAtualizacao = null;
        this.inicializado = false;
        
        this.init();
    }
    
    async init() {
        console.log('🚀 Inicializando Dashboard GURPS...');
        
        // Aguardar DOM carregar
        if (document.readyState !== 'loading') {
            await this.initialize();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        }
    }
    
    async initialize() {
        try {
            // 1. Configurar eventos
            this.configurarEventos();
            
            // 2. Carregar dados iniciais
            await this.carregarDadosIniciais();
            
            // 3. Iniciar sistema de pontos
            this.iniciarSistemaPontos();
            
            // 4. Configurar sincronização
            this.configurarSincronizacao();
            
            // 5. Atualizar interface
            this.atualizarTudo();
            
            this.inicializado = true;
            console.log('✅ Dashboard inicializada com sucesso!');
            
            this.mostrarMensagem('Dashboard carregada com sucesso!', 'success');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
            this.mostrarMensagem('Erro ao carregar dashboard', 'error');
        }
    }
    
    // ============================================
    // 1. CONFIGURAR EVENTOS
    // ============================================
    
    configurarEventos() {
        console.log('🔧 Configurando eventos da dashboard...');
        
        // EVENTOS DE IDENTIFICAÇÃO
        this.configurarEventosIdentificacao();
        
        // EVENTOS DO SISTEMA DE PONTOS
        this.configurarEventosPontos();
        
        // EVENTOS DE STATUS SOCIAL
        this.configurarEventosStatusSocial();
        
        // EVENTOS DE FINANÇAS
        this.configurarEventosFinancas();
        
        // BOTÕES DE AÇÃO
        this.configurarBotoesAcao();
    }
    
    configurarEventosIdentificacao() {
        // Inputs de identificação
        ['char-name', 'char-race', 'char-type', 'char-player'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                // Remover readonly se existir
                input.removeAttribute('readonly');
                
                input.addEventListener('input', () => {
                    this.salvarDado(id.replace('char-', ''), input.value);
                });
                
                input.addEventListener('blur', () => {
                    this.salvarDado(id.replace('char-', ''), input.value);
                });
            }
        });
        
        // Upload de foto
        const uploadInput = document.getElementById('char-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                this.processarUploadFoto(e.target.files[0]);
            });
        }
    }
    
    configurarEventosPontos() {
        // Pontos iniciais
        const pontosInput = document.getElementById('start-points');
        if (pontosInput) {
            pontosInput.addEventListener('change', () => {
                const valor = parseInt(pontosInput.value) || 100;
                this.salvarConfiguracaoPontos('pontosIniciais', valor);
                this.atualizarSaldoPontos();
            });
        }
        
        // Limite de desvantagens
        const limiteInput = document.getElementById('dis-limit');
        if (limiteInput) {
            limiteInput.addEventListener('change', () => {
                const valor = parseInt(limiteInput.value) || -75;
                this.salvarConfiguracaoPontos('limiteDesvantagens', valor);
            });
        }
    }
    
    configurarEventosStatusSocial() {
        // Botões de ajuste
        document.querySelectorAll('[onclick*="ajustarModificador"]').forEach(btn => {
            const originalOnclick = btn.getAttribute('onclick');
            const match = originalOnclick.match(/ajustarModificador\('(.+)',\s*(-?\d+)\)/);
            
            if (match) {
                const [_, tipo, valor] = match;
                btn.addEventListener('click', () => {
                    this.ajustarModificadorSocial(tipo, parseInt(valor));
                });
            }
        });
        
        // Inputs diretos
        ['status', 'reputacao', 'aparencia'].forEach(tipo => {
            const input = document.getElementById(`${tipo}-value`);
            if (input) {
                input.addEventListener('change', () => {
                    this.atualizarModificadorSocial(tipo, input.value);
                });
            }
        });
    }
    
    configurarEventosFinancas() {
        // Nível de riqueza
        const riquezaSelect = document.getElementById('wealth-level');
        if (riquezaSelect) {
            riquezaSelect.addEventListener('change', () => {
                this.atualizarRiqueza(riquezaSelect.value);
            });
        }
    }
    
    configurarBotoesAcao() {
        // Botão de atualizar
        const refreshBtn = document.querySelector('.refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.atualizarTudo());
        }
        
        // Botão de sincronizar com Firebase
        const syncBtn = document.querySelector('.btn-sync');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.sincronizarComFirebase());
        }
    }
    
    // ============================================
    // 2. CARREGAMENTO DE DADOS
    // ============================================
    
    async carregarDadosIniciais() {
        console.log('📥 Carregando dados iniciais...');
        
        try {
            // 1. Carregar identificação
            await this.carregarIdentificacao();
            
            // 2. Carregar atributos (da aba atributos)
            await this.carregarAtributos();
            
            // 3. Carregar pontos
            await this.carregarPontos();
            
            // 4. Carregar status social
            await this.carregarStatusSocial();
            
            // 5. Carregar finanças e carga
            await this.carregarFinancasCarga();
            
            // 6. Atualizar hora
            this.atualizarHoraAtualizacao();
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    
    async carregarIdentificacao() {
        // Tentar do localStorage primeiro
        const dadosLocal = localStorage.getItem('gurps_personagem_completo');
        if (dadosLocal) {
            this.dadosPersonagem = JSON.parse(dadosLocal);
            
            // Preencher inputs
            const campos = {
                'char-name': 'nome',
                'char-race': 'raca',
                'char-type': 'ocupacao',
                'char-player': 'jogador'
            };
            
            for (const [id, campo] of Object.entries(campos)) {
                const input = document.getElementById(id);
                if (input && this.dadosPersonagem[campo]) {
                    input.value = this.dadosPersonagem[campo];
                }
            }
            
            // Carregar foto se existir
            if (this.dadosPersonagem.foto) {
                this.carregarFoto(this.dadosPersonagem.foto);
            }
        }
    }
    
    async carregarAtributos() {
        // Método 1: Tentar pegar do localStorage (que atributos.js salva)
        const dadosAtributosLocal = localStorage.getItem('gurps_atributos');
        if (dadosAtributosLocal) {
            try {
                this.atributosAtuais = JSON.parse(dadosAtributosLocal);
                this.atualizarAtributosDashboard(this.atributosAtuais);
                console.log('✅ Atributos carregados do localStorage');
                return;
            } catch (error) {
                console.error('Erro ao parsear atributos do localStorage:', error);
            }
        }
        
        // Método 2: Tentar pegar da função global do atributos.js
        if (typeof window.getAtributosPersonagem === 'function') {
            try {
                this.atributosAtuais = window.getAtributosPersonagem();
                if (this.atributosAtuais) {
                    this.atualizarAtributosDashboard(this.atributosAtuais);
                    console.log('✅ Atributos carregados da função global');
                    return;
                }
            } catch (error) {
                console.error('Erro ao pegar atributos da função global:', error);
            }
        }
        
        // Método 3: Valores padrão
        this.atributosAtuais = {
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
        };
        
        this.atualizarAtributosDashboard(this.atributosAtuais);
        console.log('⚠️ Atributos carregados com valores padrão');
    }
    
    async carregarPontos() {
        // Tentar do localStorage
        const pontosLocal = localStorage.getItem('gurps_pontos');
        if (pontosLocal) {
            try {
                this.pontosAtuais = JSON.parse(pontosLocal);
                this.atualizarDisplayPontos(this.pontosAtuais);
            } catch (error) {
                console.error('Erro ao carregar pontos:', error);
            }
        }
        
        // Se existir pontosManager, usar ele
        if (window.pontosManager) {
            try {
                const pontosData = window.pontosManager.getResumo();
                this.atualizarDisplayPontos(pontosData);
            } catch (error) {
                console.error('Erro ao pegar dados do pontosManager:', error);
            }
        }
    }
    
    async carregarStatusSocial() {
        const statusLocal = localStorage.getItem('gurps_status_social');
        if (statusLocal) {
            try {
                const statusData = JSON.parse(statusLocal);
                this.atualizarStatusSocial(statusData);
            } catch (error) {
                console.error('Erro ao carregar status social:', error);
            }
        }
    }
    
    async carregarFinancasCarga() {
        // Carregar cargas
        if (typeof window.getCargasPersonagem === 'function') {
            try {
                this.cargasAtuais = window.getCargasPersonagem();
                if (this.cargasAtuais) {
                    this.atualizarCargasDashboard(this.cargasAtuais);
                }
            } catch (error) {
                console.error('Erro ao carregar cargas:', error);
            }
        }
        
        // Carregar finanças
        const financasLocal = localStorage.getItem('gurps_financas');
        if (financasLocal) {
            try {
                const financasData = JSON.parse(financasLocal);
                this.atualizarFinancas(financasData);
            } catch (error) {
                console.error('Erro ao carregar finanças:', error);
            }
        }
    }
    
    // ============================================
    // 3. ATUALIZAÇÃO DE ATRIBUTOS
    // ============================================
    
    atualizarAtributosDashboard(dadosAtributos) {
        if (!dadosAtributos) return;
        
        console.log('🔄 Atualizando atributos na dashboard:', dadosAtributos);
        
        // Atributos principais
        const st = dadosAtributos.ST || 10;
        const dx = dadosAtributos.DX || 10;
        const iq = dadosAtributos.IQ || 10;
        const ht = dadosAtributos.HT || 10;
        
        // Atualizar display
        this.atualizarElemento('dashboard-ST', st);
        this.atualizarElemento('dashboard-DX', dx);
        this.atualizarElemento('dashboard-IQ', iq);
        this.atualizarElemento('dashboard-HT', ht);
        
        // Atualizar resumo
        this.atualizarElemento('summary-st', st);
        this.atualizarElemento('summary-dx', dx);
        this.atualizarElemento('summary-iq', iq);
        this.atualizarElemento('summary-ht', ht);
        
        // Calcular atributos derivados
        const bonus = dadosAtributos.bonus || {};
        
        const pvBase = st;
        const pvBonus = bonus.PV || 0;
        const pvTotal = Math.max(pvBase + pvBonus, 1);
        
        const pfBase = ht;
        const pfBonus = bonus.PF || 0;
        const pfTotal = Math.max(pfBase + pfBonus, 1);
        
        const vontadeBase = iq;
        const vontadeBonus = bonus.Vontade || 0;
        const vontadeTotal = Math.max(vontadeBase + vontadeBonus, 1);
        
        const percepcaoBase = iq;
        const percepcaoBonus = bonus.Percepcao || 0;
        const percepcaoTotal = Math.max(percepcaoBase + percepcaoBonus, 1);
        
        const deslocamentoBase = (ht + dx) / 4;
        const deslocamentoBonus = bonus.Deslocamento || 0;
        const deslocamentoTotal = (parseFloat(deslocamentoBase) + parseFloat(deslocamentoBonus)).toFixed(2);
        
        // Atualizar totais
        this.atualizarElemento('dashboard-HP', pvTotal);
        this.atualizarElemento('dashboard-FP', pfTotal);
        this.atualizarElemento('dashboard-WILL', vontadeTotal);
        this.atualizarElemento('dashboard-PER', percepcaoTotal);
        this.atualizarElemento('dashboard-MOVE', deslocamentoTotal);
        
        // Atualizar resumo
        this.atualizarElemento('summary-hp', pvTotal);
        this.atualizarElemento('summary-fp', pfTotal);
        this.atualizarElemento('summary-will', vontadeTotal);
        this.atualizarElemento('summary-per', percepcaoTotal);
        
        // Atualizar quick stats
        this.atualizarElemento('quick-hp', pvTotal);
        this.atualizarElemento('quick-fp', pfTotal);
        this.atualizarElemento('quick-hp-max', pvTotal);
        this.atualizarElemento('quick-fp-max', pfTotal);
        
        // Atualizar ST para dano
        this.atualizarElemento('current-ST-damage', st);
        
        // Calcular custos
        this.calcularCustosAtributos(dadosAtributos);
        
        // Atualizar cargas baseadas no ST
        this.atualizarCargasBaseST(st);
        
        // Atualizar dano base
        this.atualizarDanoBase(st);
    }
    
    calcularCustosAtributos(dadosAtributos) {
        const ST = dadosAtributos.ST || 10;
        const DX = dadosAtributos.DX || 10;
        const IQ = dadosAtributos.IQ || 10;
        const HT = dadosAtributos.HT || 10;
        
        const custoST = (ST - 10) * 10;
        const custoDX = (DX - 10) * 20;
        const custoIQ = (IQ - 10) * 20;
        const custoHT = (HT - 10) * 10;
        
        this.atualizarElemento('custo-ST', custoST);
        this.atualizarElemento('custo-DX', custoDX);
        this.atualizarElemento('custo-IQ', custoIQ);
        this.atualizarElemento('custo-HT', custoHT);
        
        const totalGastos = custoST + custoDX + custoIQ + custoHT;
        
        // Reportar para pontos manager
        if (window.pontosManager && typeof window.pontosManager.atualizarPontosAba === 'function') {
            window.pontosManager.atualizarPontosAba('atributos', totalGastos);
        }
        
        // Atualizar na distribuição de pontos
        this.atualizarElemento('points-attr', totalGastos);
        
        return totalGastos;
    }
    
    atualizarCargasBaseST(ST) {
        const cargasTable = {
            10: { nenhuma: 10.0, leve: 20.0, media: 30.0, pesada: 60.0, muitoPesada: 100.0 },
            11: { nenhuma: 12.0, leve: 24.0, media: 36.0, pesada: 72.0, muitoPesada: 120.0 },
            12: { nenhuma: 14.5, leve: 29.0, media: 43.5, pesada: 87.0, muitoPesada: 145.0 },
            13: { nenhuma: 17.0, leve: 34.0, media: 51.0, pesada: 102.0, muitoPesada: 170.0 },
            14: { nenhuma: 19.5, leve: 39.0, media: 58.5, pesada: 117.0, muitoPesada: 195.0 },
            15: { nenhuma: 22.5, leve: 45.0, media: 67.5, pesada: 135.0, muitoPesada: 225.0 }
        };
        
        const cargas = cargasTable[ST] || cargasTable[10];
        
        if (cargas) {
            this.atualizarElemento('limit-none', cargas.nenhuma + ' kg');
            this.atualizarElemento('limit-light', cargas.leve + ' kg');
            this.atualizarElemento('limit-medium', cargas.media + ' kg');
            this.atualizarElemento('limit-heavy', cargas.pesada + ' kg');
            this.atualizarElemento('limit-extreme', cargas.muitoPesada + ' kg');
        }
    }
    
    atualizarDanoBase(ST) {
        const tabelaDano = {
            10: { gdp: '1d-2', geb: '1d' },
            11: { gdp: '1d-1', geb: '1d+1' },
            12: { gdp: '1d', geb: '1d+2' },
            13: { gdp: '1d', geb: '2d-1' },
            14: { gdp: '1d', geb: '2d' },
            15: { gdp: '1d+1', geb: '2d+1' }
        };
        
        const dano = tabelaDano[ST] || tabelaDano[10];
        
        if (dano) {
            this.atualizarElemento('damage-gdp', dano.gdp);
            this.atualizarElemento('damage-geb', dano.geb);
        }
    }
    
    // ============================================
    // 4. SISTEMA DE PONTOS
    // ============================================
    
    iniciarSistemaPontos() {
        console.log('💰 Iniciando sistema de pontos...');
        
        // Se existir pontosManager, integrar com ele
        if (window.pontosManager) {
            window.pontosManager.adicionarListener((dados) => {
                this.atualizarDisplayPontos(dados);
            });
            
            // Carregar pontos existentes
            setTimeout(() => {
                if (window.pontosManager.carregarPontos) {
                    window.pontosManager.carregarPontos();
                }
            }, 1000);
        }
        
        // Configurar valores iniciais
        const pontosIniciais = document.getElementById('start-points');
        const limiteDesv = document.getElementById('dis-limit');
        
        if (pontosIniciais) {
            pontosIniciais.value = this.dadosPersonagem.pontosIniciais || 100;
        }
        
        if (limiteDesv) {
            limiteDesv.value = this.dadosPersonagem.limiteDesvantagens || -75;
        }
    }
    
    atualizarDisplayPontos(dadosPontos) {
        if (!dadosPontos) return;
        
        console.log('📊 Atualizando display de pontos:', dadosPontos);
        
        // Total gasto
        const totalGasto = dadosPontos.total || 0;
        this.atualizarElemento('total-points-spent', totalGasto + ' pts');
        
        // Distribuição
        if (dadosPontos.distribuicao) {
            const dist = dadosPontos.distribuicao;
            
            this.atualizarElemento('points-attr', dist.atributos || 0);
            this.atualizarElemento('points-adv', Math.max(dist.vantagens || 0, 0));
            this.atualizarElemento('points-dis', Math.abs(Math.min(dist.desvantagens || 0, 0)));
            this.atualizarElemento('points-pec', Math.abs(Math.min(dist.peculiaridades || 0, 0)));
            this.atualizarElemento('points-skills', dist.pericias || 0);
            this.atualizarElemento('points-tech', dist.técnicas || 0);
            this.atualizarElemento('points-spells', dist.magias || 0);
        }
        
        // Atualizar saldo
        this.atualizarSaldoPontos(totalGasto);
    }
    
    atualizarSaldoPontos(totalGasto = 0) {
        const pontosIniciaisInput = document.getElementById('start-points');
        const pontosIniciais = pontosIniciaisInput ? parseInt(pontosIniciaisInput.value) || 100 : 100;
        
        const saldo = pontosIniciais - totalGasto;
        const saldoElement = document.getElementById('points-balance');
        
        if (saldoElement) {
            saldoElement.textContent = saldo;
            
            // Estilizar o saldo
            const container = saldoElement.closest('.balance-value-container');
            const statusText = document.getElementById('points-status-text');
            const statusIndicator = document.getElementById('points-status-indicator');
            
            if (container && statusText && statusIndicator) {
                // Resetar classes
                container.className = 'balance-value-container';
                statusText.className = 'status-text';
                
                if (saldo < 0) {
                    // Excedeu
                    container.classList.add('negativo');
                    statusText.textContent = 'EXCEDEU O LIMITE!';
                    statusText.classList.add('negativo');
                    statusIndicator.style.backgroundColor = '#dc3545';
                } else if (saldo === 0) {
                    // Perfeito
                    container.classList.add('exato');
                    statusText.textContent = 'PERFEITO!';
                    statusText.classList.add('positivo');
                    statusIndicator.style.backgroundColor = '#28a745';
                } else if (saldo <= 10) {
                    // Poucos pontos
                    container.classList.add('baixo');
                    statusText.textContent = 'Poucos pontos restantes';
                    statusText.classList.add('warning');
                    statusIndicator.style.backgroundColor = '#ffc107';
                } else {
                    // Normal
                    container.classList.add('positivo');
                    statusText.textContent = 'Personagem válido';
                    statusText.classList.add('positivo');
                    statusIndicator.style.backgroundColor = '#28a745';
                }
            }
        }
    }
    
    salvarConfiguracaoPontos(chave, valor) {
        if (!this.dadosPersonagem.config) {
            this.dadosPersonagem.config = {};
        }
        
        this.dadosPersonagem.config[chave] = valor;
        this.salvarDado('config', this.dadosPersonagem.config);
    }
    
    // ============================================
    // 5. STATUS SOCIAL
    // ============================================
    
    ajustarModificadorSocial(tipo, valor) {
        const input = document.getElementById(`${tipo}-value`);
        if (!input) return;
        
        let valorAtual = parseInt(input.value) || 0;
        valorAtual += valor;
        
        // Limites: -5 a +5
        if (valorAtual < -5) valorAtual = -5;
        if (valorAtual > 5) valorAtual = 5;
        
        input.value = valorAtual;
        this.atualizarModificadorSocial(tipo, valorAtual);
    }
    
    atualizarModificadorSocial(tipo, valor) {
        const valorNum = parseInt(valor) || 0;
        
        // Atualizar display
        const valueElement = document.getElementById(`${tipo}-value`);
        const pointsElement = document.getElementById(`${tipo}-points`);
        
        if (valueElement) {
            valueElement.value = valorNum;
            valueElement.classList.remove('positivo', 'negativo');
            
            if (valorNum > 0) {
                valueElement.classList.add('positivo');
            } else if (valorNum < 0) {
                valueElement.classList.add('negativo');
            }
        }
        
        // Calcular pontos (5 pontos por nível)
        const pontos = valorNum * 5;
        if (pointsElement) {
            pointsElement.textContent = `[${pontos}]`;
        }
        
        // Salvar no localStorage
        this.salvarStatusSocial();
        
        // Calcular total de reação
        this.calcularTotalReacao();
    }
    
    calcularTotalReacao() {
        let total = 0;
        
        // Status
        const statusInput = document.getElementById('status-value');
        if (statusInput) {
            total += parseInt(statusInput.value) || 0;
        }
        
        // Reputação
        const repInput = document.getElementById('reputacao-value');
        if (repInput) {
            total += parseInt(repInput.value) || 0;
        }
        
        // Aparência
        const appInput = document.getElementById('aparencia-value');
        if (appInput) {
            total += parseInt(appInput.value) || 0;
        }
        
        // Atualizar display
        const totalElement = document.getElementById('reaction-total');
        if (totalElement) {
            totalElement.textContent = total >= 0 ? `+${total}` : total.toString();
            totalElement.classList.remove('positivo', 'negativo');
            
            if (total > 0) {
                totalElement.classList.add('positivo');
            } else if (total < 0) {
                totalElement.classList.add('negativo');
            }
        }
    }
    
    salvarStatusSocial() {
        const statusSocial = {
            status: parseInt(document.getElementById('status-value')?.value) || 0,
            reputacao: parseInt(document.getElementById('reputacao-value')?.value) || 0,
            aparencia: parseInt(document.getElementById('aparencia-value')?.value) || 0
        };
        
        localStorage.setItem('gurps_status_social', JSON.stringify(statusSocial));
        this.dadosPersonagem.statusSocial = statusSocial;
        this.salvarDado('statusSocial', statusSocial);
    }
    
    atualizarStatusSocial(statusSocial) {
        if (!statusSocial) return;
        
        this.atualizarModificadorSocial('status', statusSocial.status || 0);
        this.atualizarModificadorSocial('reputacao', statusSocial.reputacao || 0);
        this.atualizarModificadorSocial('aparencia', statusSocial.aparencia || 0);
    }
    
    // ============================================
    // 6. FINANÇAS E CARGA
    // ============================================
    
    atualizarRiqueza(valor) {
        const riquezaPontos = {
            '0': 'Pobre [0 pts]',
            '5': 'Médio [5 pts]',
            '10': 'Confortável [10 pts]',
            '15': 'Rico [15 pts]',
            '20': 'Muito Rico [20 pts]',
            '25': 'Filantropo [25 pts]'
        };
        
        const displayElement = document.getElementById('wealth-level-display');
        if (displayElement) {
            displayElement.textContent = riquezaPontos[valor] || 'Médio [5 pts]';
        }
        
        // Salvar
        const financas = {
            nivelRiqueza: valor,
            nivelRiquezaTexto: riquezaPontos[valor] || 'Médio [5 pts]'
        };
        
        localStorage.setItem('gurps_financas', JSON.stringify(financas));
        this.dadosPersonagem.financas = financas;
        this.salvarDado('financas', financas);
    }
    
    atualizarFinancas(financasData) {
        if (!financasData) return;
        
        if (financasData.nivelRiqueza) {
            const select = document.getElementById('wealth-level');
            if (select) {
                select.value = financasData.nivelRiqueza;
            }
            
            const display = document.getElementById('wealth-level-display');
            if (display) {
                display.textContent = financasData.nivelRiquezaTexto || 'Médio [5 pts]';
            }
        }
    }
    
    atualizarCargasDashboard(cargas) {
        if (!cargas) return;
        
        // Formatar valores
        const formatarValor = (valor) => {
            if (Number.isInteger(valor)) {
                return valor.toString();
            }
            return valor.toFixed(1);
        };
        
        // Atualizar limites (resumo)
        this.atualizarElemento('limit-light', formatarValor(cargas.leve || 0) + ' kg');
        this.atualizarElemento('limit-medium', formatarValor(cargas.media || 0) + ' kg');
        this.atualizarElemento('limit-heavy', formatarValor(cargas.pesada || 0) + ' kg');
        this.atualizarElemento('limit-extreme', formatarValor(cargas.muitoPesada || 0) + ' kg');
    }
    
    // ============================================
    // 7. FUNÇÕES UTILITÁRIAS
    // ============================================
    
    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }
    
    async salvarDado(chave, valor) {
        // Salvar no objeto local
        this.dadosPersonagem[chave] = valor;
        
        // Salvar no localStorage
        localStorage.setItem('gurps_personagem_completo', JSON.stringify(this.dadosPersonagem));
        
        console.log(`💾 Dashboard: ${chave} =`, valor);
        
        // Se estiver conectado ao Firebase, salvar lá também
        if (window.firebaseService && typeof window.firebaseService.saveModule === 'function') {
            try {
                await window.firebaseService.saveModule(chave, valor);
                console.log(`✅ ${chave} salvo no Firebase`);
            } catch (error) {
                console.error(`❌ Erro ao salvar ${chave} no Firebase:`, error);
            }
        }
    }
    
    processarUploadFoto(arquivo) {
        if (!arquivo || !arquivo.type.startsWith('image/')) return;
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            if (preview) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Foto do personagem" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
                    <button class="remove-photo-btn" onclick="dashboard.removeFoto()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            
            // Salvar dados da foto
            const fotoData = {
                base64: e.target.result,
                tipo: arquivo.type,
                nome: arquivo.name,
                tamanho: arquivo.size,
                dataUpload: new Date().toISOString()
            };
            
            this.salvarDado('foto', fotoData);
            this.mostrarMensagem('Foto carregada com sucesso!', 'success');
        };
        
        reader.readAsDataURL(arquivo);
    }
    
    carregarFoto(fotoData) {
        const preview = document.getElementById('photo-preview');
        if (preview && fotoData.base64) {
            preview.innerHTML = `
                <img src="${fotoData.base64}" alt="Foto do personagem" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
                <button class="remove-photo-btn" onclick="dashboard.removeFoto()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }
    }
    
    removeFoto() {
        const preview = document.getElementById('photo-preview');
        if (preview) {
            preview.innerHTML = `
                <div class="photo-placeholder">
                    <i class="fas fa-user-circle"></i>
                    <span>Clique para adicionar foto</span>
                    <small>PNG, JPG (max. 2MB)</small>
                </div>
            `;
        }
        
        this.dadosPersonagem.foto = null;
        localStorage.setItem('gurps_personagem_completo', JSON.stringify(this.dadosPersonagem));
        
        this.mostrarMensagem('Foto removida', 'info');
    }
    
    atualizarHoraAtualizacao() {
        const agora = new Date();
        const horaElement = document.getElementById('last-update-time');
        if (horaElement) {
            horaElement.textContent = agora.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
    
    configurarSincronizacao() {
        // Escutar eventos de atualização dos atributos
        document.addEventListener('atributos-atualizados', (e) => {
            if (e.detail) {
                this.atualizarAtributosDashboard(e.detail);
            }
        });
        
        // Atualizar periodicamente
        this.intervaloAtualizacao = setInterval(() => {
            this.atualizarHoraAtualizacao();
            
            // Verificar se há novos dados dos atributos
            if (typeof window.getAtributosPersonagem === 'function') {
                const novosAtributos = window.getAtributosPersonagem();
                if (novosAtributos && JSON.stringify(novosAtributos) !== JSON.stringify(this.atributosAtuais)) {
                    this.atributosAtuais = novosAtributos;
                    this.atualizarAtributosDashboard(novosAtributos);
                }
            }
        }, 3000); // A cada 3 segundos
    }
    
    // ============================================
    // 8. AÇÕES PRINCIPAIS
    // ============================================
    
    async atualizarTudo() {
        console.log('🔄 Atualizando dashboard...');
        
        await this.carregarAtributos();
        await this.carregarPontos();
        this.calcularTotalReacao();
        this.atualizarHoraAtualizacao();
        
        this.mostrarMensagem('Dashboard atualizada!', 'success');
    }
    
    async sincronizarComFirebase() {
        if (!window.firebaseService) {
            this.mostrarMensagem('Firebase não disponível', 'error');
            return;
        }
        
        this.mostrarMensagem('Sincronizando com Firebase...', 'loading');
        
        try {
            // Salvar todos os dados da dashboard
            await this.salvarDado('dashboard_completo', this.dadosPersonagem);
            
            // Se existir atributos atuais, salvar também
            if (this.atributosAtuais) {
                await window.firebaseService.saveModule('atributos', this.atributosAtuais);
            }
            
            this.mostrarMensagem('✅ Sincronização completa!', 'success');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.mostrarMensagem('Erro na sincronização', 'error');
        }
    }
    
    mostrarMensagem(texto, tipo = 'info') {
        const mensagemElement = document.getElementById('dashboard-messages');
        if (!mensagemElement) return;
        
        const icones = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle',
            loading: 'fa-spinner fa-spin'
        };
        
        const icone = icones[tipo] || 'fa-info-circle';
        
        mensagemElement.innerHTML = `
            <div class="message ${tipo}">
                <i class="fas ${icone}"></i>
                <span>${texto}</span>
            </div>
        `;
        
        // Auto-remover após 5 segundos (exceto loading)
        if (tipo !== 'loading') {
            setTimeout(() => {
                mensagemElement.innerHTML = '';
            }, 5000);
        }
    }
    
    // ============================================
    // 9. INICIALIZAÇÃO AUTOMÁTICA
    // ============================================
    
    static initDashboard() {
        // Criar instância global
        if (!window.dashboard) {
            window.dashboard = new DashboardGURPS();
        }
        
        // Iniciar quando a aba for ativada
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        if (dashboardTab.classList.contains('active')) {
                            // Aguardar um pouco e inicializar
                            setTimeout(() => {
                                if (!window.dashboard?.inicializado) {
                                    window.dashboard = new DashboardGURPS();
                                } else {
                                    window.dashboard.atualizarTudo();
                                }
                            }, 100);
                        } else if (window.dashboard?.intervaloAtualizacao) {
                            // Limpar intervalo quando sair da dashboard
                            clearInterval(window.dashboard.intervaloAtualizacao);
                            window.dashboard.intervaloAtualizacao = null;
                        }
                    }
                });
            });
            
            observer.observe(dashboardTab, { attributes: true });
            
            // Se já estiver ativa, iniciar
            if (dashboardTab.classList.contains('active')) {
                setTimeout(() => {
                    window.dashboard = new DashboardGURPS();
                }, 500);
            }
        }
    }
}

// ============================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', DashboardGURPS.initDashboard);
} else {
    DashboardGURPS.initDashboard();
}

// Exportar funções principais
window.initDashboardTab = () => window.dashboard?.init();
window.atualizarDashboard = () => window.dashboard?.atualizarTudo();
window.sincronizarAtributos = () => window.dashboard?.sincronizarComFirebase();

console.log('✅ dashboard.js carregado (classe completa)');