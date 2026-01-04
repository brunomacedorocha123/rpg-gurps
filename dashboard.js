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
        
        if (document.readyState !== 'loading') {
            await this.initialize();
        } else {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        }
    }
    
    async initialize() {
        try {
            // 1. Carregar dados iniciais
            await this.carregarDadosIniciais();
            
            // 2. Configurar eventos
            this.configurarEventos();
            
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
    // 1. CARREGAMENTO DE DADOS
    // ============================================
    
    async carregarDadosIniciais() {
        console.log('📥 Carregando dados iniciais...');
        
        try {
            // 1. Carregar identificação
            await this.carregarIdentificacao();
            
            // 2. Carregar atributos
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
            this.preencherInput('char-name', this.dadosPersonagem.nome || '');
            this.preencherInput('char-race', this.dadosPersonagem.raca || '');
            this.preencherInput('char-type', this.dadosPersonagem.ocupacao || '');
            this.preencherInput('char-player', this.dadosPersonagem.jogador || '');
            
            // Configurar select de raça
            if (this.dadosPersonagem.raca) {
                const raceSelect = document.getElementById('char-race');
                if (raceSelect) {
                    raceSelect.value = this.dadosPersonagem.raca;
                }
            }
            
            // Carregar foto se existir
            if (this.dadosPersonagem.foto) {
                this.carregarFoto(this.dadosPersonagem.foto);
            }
        } else {
            // Dados padrão se não existir
            this.dadosPersonagem = {
                nome: '',
                raca: '',
                ocupacao: '',
                jogador: '',
                foto: null
            };
        }
    }
    
    preencherInput(id, valor) {
        const input = document.getElementById(id);
        if (input) {
            input.value = valor;
        }
    }
    
    async carregarAtributos() {
        // Método 1: Tentar pegar do localStorage
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
        // Método 1: Tentar do localStorage
        const pontosLocal = localStorage.getItem('gurps_pontos');
        if (pontosLocal) {
            try {
                this.pontosAtuais = JSON.parse(pontosLocal);
                this.atualizarDisplayPontos(this.pontosAtuais);
                console.log('✅ Pontos carregados do localStorage');
                return;
            } catch (error) {
                console.error('Erro ao carregar pontos do localStorage:', error);
            }
        }
        
        // Método 2: Se existir pontosManager, usar ele
        if (window.pontosManager) {
            try {
                const pontosData = window.pontosManager.getResumo();
                if (pontosData) {
                    this.atualizarDisplayPontos(pontosData);
                    console.log('✅ Pontos carregados do pontosManager');
                    return;
                }
            } catch (error) {
                console.error('Erro ao pegar dados do pontosManager:', error);
            }
        }
        
        // Método 3: Valores padrão
        this.pontosAtuais = {
            total: 0,
            distribuicao: {
                atributos: 0,
                vantagens: 0,
                desvantagens: 0,
                peculiaridades: 0,
                pericias: 0,
                técnicas: 0,
                magias: 0
            }
        };
        
        this.atualizarDisplayPontos(this.pontosAtuais);
        console.log('⚠️ Pontos carregados com valores padrão');
    }
    
    async carregarStatusSocial() {
        // Método 1: Tentar do localStorage
        const statusLocal = localStorage.getItem('gurps_status_social');
        if (statusLocal) {
            try {
                const statusData = JSON.parse(statusLocal);
                this.atualizarStatusSocial(statusData);
                console.log('✅ Status social carregado do localStorage');
                return;
            } catch (error) {
                console.error('Erro ao carregar status social:', error);
            }
        }
        
        // Método 2: Valores padrão
        const statusData = {
            status: 0,
            reputacao: 0,
            aparencia: 0
        };
        
        this.atualizarStatusSocial(statusData);
        console.log('⚠️ Status social carregado com valores padrão');
    }
    
    async carregarFinancasCarga() {
        // Carregar cargas
        if (typeof window.getCargasPersonagem === 'function') {
            try {
                this.cargasAtuais = window.getCargasPersonagem();
                if (this.cargasAtuais) {
                    this.atualizarCargasDashboard(this.cargasAtuais);
                    console.log('✅ Cargas carregadas da função global');
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
                console.log('✅ Finanças carregadas do localStorage');
            } catch (error) {
                console.error('Erro ao carregar finanças:', error);
            }
        }
    }
    
    // ============================================
    // 2. CONFIGURAÇÃO DE EVENTOS
    // ============================================
    
    configurarEventos() {
        console.log('🔧 Configurando eventos da dashboard...');
        
        // EVENTOS DE IDENTIFICAÇÃO (EDITÁVEIS)
        this.configurarEventosIdentificacao();
        
        // EVENTOS DO SISTEMA DE PONTOS
        this.configurarEventosPontos();
        
        // EVENTOS DE STATUS SOCIAL (CONSERTADOS)
        this.configurarEventosStatusSocial();
        
        // EVENTOS DE FINANÇAS
        this.configurarEventosFinancas();
        
        // BOTÕES DE AÇÃO
        this.configurarBotoesAcao();
    }
    
    configurarEventosIdentificacao() {
        // Inputs de identificação (todos editáveis)
        const inputsIdentificacao = [
            { id: 'char-name', campo: 'nome' },
            { id: 'char-type', campo: 'ocupacao' },
            { id: 'char-player', campo: 'jogador' }
        ];
        
        inputsIdentificacao.forEach(({ id, campo }) => {
            const input = document.getElementById(id);
            if (input) {
                // Remover readonly se existir
                input.removeAttribute('readonly');
                input.classList.add('editable');
                
                // Evento de input em tempo real
                input.addEventListener('input', (e) => {
                    this.salvarDado(campo, e.target.value);
                });
                
                // Evento de blur (quando sai do campo)
                input.addEventListener('blur', (e) => {
                    this.salvarDado(campo, e.target.value);
                });
            }
        });
        
        // Select de raça
        const raceSelect = document.getElementById('char-race');
        if (raceSelect) {
            raceSelect.addEventListener('change', (e) => {
                this.salvarDado('raca', e.target.value);
            });
        }
        
        // Upload de foto
        const uploadInput = document.getElementById('char-upload');
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.processarUploadFoto(file);
                }
            });
        }
        
        // Evento para clicar na foto
        const photoFrame = document.querySelector('.photo-frame');
        if (photoFrame) {
            photoFrame.addEventListener('click', () => {
                uploadInput.click();
            });
        }
    }
    
    configurarEventosPontos() {
        // Pontos iniciais
        const pontosInput = document.getElementById('start-points');
        if (pontosInput) {
            pontosInput.addEventListener('change', (e) => {
                const valor = parseInt(e.target.value) || 100;
                this.salvarConfiguracaoPontos('pontosIniciais', valor);
                this.atualizarSaldoPontos();
            });
            
            // Botões de ajuste de pontos
            const btnMinus = pontosInput.parentElement?.querySelector('.btn-setting-minus');
            const btnPlus = pontosInput.parentElement?.querySelector('.btn-setting-plus');
            
            if (btnMinus) {
                btnMinus.addEventListener('click', () => {
                    pontosInput.value = parseInt(pontosInput.value) - 25;
                    pontosInput.dispatchEvent(new Event('change'));
                });
            }
            
            if (btnPlus) {
                btnPlus.addEventListener('click', () => {
                    pontosInput.value = parseInt(pontosInput.value) + 25;
                    pontosInput.dispatchEvent(new Event('change'));
                });
            }
        }
        
        // Limite de desvantagens
        const limiteInput = document.getElementById('dis-limit');
        if (limiteInput) {
            limiteInput.addEventListener('change', (e) => {
                const valor = parseInt(e.target.value) || -75;
                this.salvarConfiguracaoPontos('limiteDesvantagens', valor);
            });
            
            // Botões de ajuste do limite
            const btnMinus = limiteInput.parentElement?.querySelector('.btn-setting-minus');
            const btnPlus = limiteInput.parentElement?.querySelector('.btn-setting-plus');
            
            if (btnMinus) {
                btnMinus.addEventListener('click', () => {
                    limiteInput.value = parseInt(limiteInput.value) - 5;
                    limiteInput.dispatchEvent(new Event('change'));
                });
            }
            
            if (btnPlus) {
                btnPlus.addEventListener('click', () => {
                    limiteInput.value = parseInt(limiteInput.value) + 5;
                    limiteInput.dispatchEvent(new Event('change'));
                });
            }
        }
        
        // Botão de recalcular pontos
        const btnRecalcular = document.querySelector('[onclick*="redistribuirPontos"]');
        if (btnRecalcular) {
            btnRecalcular.addEventListener('click', () => {
                this.atualizarSaldoPontos();
                this.mostrarMensagem('Pontos recalculados!', 'success');
            });
        }
    }
    
    configurarEventosStatusSocial() {
        console.log('🔧 Configurando eventos de status social...');
        
        // Configurar botões de ajuste de status
        this.configurarBotaoSocial('status', -1);
        this.configurarBotaoSocial('status', 1);
        this.configurarBotaoSocial('reputacao', -1);
        this.configurarBotaoSocial('reputacao', 1);
        this.configurarBotaoSocial('aparencia', -1);
        this.configurarBotaoSocial('aparencia', 1);
        
        // Configurar inputs diretos
        ['status', 'reputacao', 'aparencia'].forEach(tipo => {
            const inputId = `${tipo}-value`;
            const input = document.getElementById(inputId);
            
            if (input) {
                // Remover readonly se existir
                input.removeAttribute('readonly');
                
                input.addEventListener('change', (e) => {
                    const valor = parseInt(e.target.value) || 0;
                    this.atualizarModificadorSocial(tipo, valor);
                });
                
                input.addEventListener('blur', (e) => {
                    const valor = parseInt(e.target.value) || 0;
                    this.atualizarModificadorSocial(tipo, valor);
                });
            }
        });
        
        // Configurar seleção de riqueza
        const wealthSelect = document.getElementById('wealth-level');
        if (wealthSelect) {
            wealthSelect.addEventListener('change', (e) => {
                this.atualizarRiqueza(e.target.value);
            });
        }
    }
    
    configurarBotaoSocial(tipo, valor) {
        // Encontrar botões pelo onclick
        const buttons = document.querySelectorAll(`[onclick*="ajustarModificadorSocial('${tipo}', ${valor})"]`);
        
        buttons.forEach(button => {
            // Remover o onclick antigo
            button.removeAttribute('onclick');
            
            // Adicionar novo evento
            button.addEventListener('click', () => {
                this.ajustarModificadorSocial(tipo, valor);
            });
        });
    }
    
    configurarEventosFinancas() {
        // Nível de riqueza
        const riquezaSelect = document.getElementById('wealth-level');
        if (riquezaSelect) {
            riquezaSelect.addEventListener('change', (e) => {
                this.atualizarRiqueza(e.target.value);
            });
        }
    }
    
    configurarBotoesAcao() {
        // Botão de atualizar
        const refreshBtn = document.querySelector('.refresh-btn');
        if (!refreshBtn) {
            // Criar botão se não existir
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                const btn = document.createElement('button');
                btn.className = 'btn-refresh';
                btn.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar';
                btn.addEventListener('click', () => this.atualizarTudo());
                headerActions.insertBefore(btn, headerActions.firstChild);
            }
        } else {
            refreshBtn.addEventListener('click', () => this.atualizarTudo());
        }
        
        // Botão de sincronizar com Firebase
        const syncBtn = document.querySelector('.btn-sync');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.sincronizarComFirebase());
        }
        
        // Botão de editar atributos
        const editAttrBtn = document.querySelector('[onclick*="window.location.href=\'#atributos\'"]');
        if (editAttrBtn) {
            editAttrBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Alternar para aba de atributos
                const event = new CustomEvent('change-tab', { detail: { tabId: 'atributos' } });
                document.dispatchEvent(event);
            });
        }
        
        // Botão de exportar atributos
        const exportAttrBtn = document.querySelector('[onclick*="exportarAtributos"]');
        if (exportAttrBtn) {
            exportAttrBtn.addEventListener('click', () => this.exportarAtributos());
        }
    }
    
    // ============================================
    // 3. SISTEMA DE PONTOS
    // ============================================
    
    iniciarSistemaPontos() {
        console.log('💰 Iniciando sistema de pontos...');
        
        // Se existir pontosManager, integrar com ele
        if (window.pontosManager) {
            console.log('✅ PontosManager encontrado, configurando integração...');
            
            // Adicionar listener para atualizações
            window.pontosManager.adicionarListener((dados) => {
                console.log('📊 Pontos atualizados:', dados);
                this.atualizarDisplayPontos(dados);
            });
            
            // Carregar pontos existentes
            setTimeout(() => {
                if (window.pontosManager.carregarPontos) {
                    window.pontosManager.carregarPontos();
                }
                
                // Atualizar pontos atuais
                this.pontosAtuais = window.pontosManager.getResumo() || this.pontosAtuais;
                this.atualizarDisplayPontos(this.pontosAtuais);
                
            }, 1000);
        } else {
            console.log('⚠️ PontosManager não encontrado, usando sistema interno');
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
        
        // Atualizar saldo inicial
        this.atualizarSaldoPontos();
    }
    
    atualizarDisplayPontos(dadosPontos) {
        if (!dadosPontos) {
            console.warn('⚠️ Dados de pontos vazios');
            return;
        }
        
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
    
    atualizarSaldoPontos(totalGasto = null) {
        const pontosIniciaisInput = document.getElementById('start-points');
        const pontosIniciais = pontosIniciaisInput ? parseInt(pontosIniciaisInput.value) || 100 : 100;
        
        const gasto = totalGasto !== null ? totalGasto : (this.pontosAtuais.total || 0);
        const saldo = pontosIniciais - gasto;
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
    // 4. STATUS SOCIAL (CONSERTADO)
    // ============================================
    
    ajustarModificadorSocial(tipo, valor) {
        console.log(`🔧 Ajustando ${tipo} em ${valor}`);
        
        const inputId = `${tipo}-value`;
        const input = document.getElementById(inputId);
        
        if (!input) {
            console.error(`❌ Input ${inputId} não encontrado`);
            return;
        }
        
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
        
        console.log(`📊 Atualizando ${tipo} para ${valorNum}`);
        
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
        const repInput = document.getElementById('rep-value');
        if (repInput) {
            total += parseInt(repInput.value) || 0;
        }
        
        // Aparência
        const appInput = document.getElementById('app-value');
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
            reputacao: parseInt(document.getElementById('rep-value')?.value) || 0,
            aparencia: parseInt(document.getElementById('app-value')?.value) || 0
        };
        
        localStorage.setItem('gurps_status_social', JSON.stringify(statusSocial));
        this.dadosPersonagem.statusSocial = statusSocial;
        this.salvarDado('statusSocial', statusSocial);
    }
    
    atualizarStatusSocial(statusSocial) {
        if (!statusSocial) return;
        
        console.log('📊 Carregando status social:', statusSocial);
        
        this.atualizarModificadorSocial('status', statusSocial.status || 0);
        this.atualizarModificadorSocial('reputacao', statusSocial.reputacao || 0);
        this.atualizarModificadorSocial('aparencia', statusSocial.aparencia || 0);
    }
    
    // ============================================
    // 5. FINANÇAS E CARGA
    // ============================================
    
    atualizarRiqueza(valor) {
        console.log(`💰 Atualizando riqueza para ${valor}`);
        
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
        this.atualizarElemento('limit-none', formatarValor(cargas.nenhuma || 0) + ' kg');
        this.atualizarElemento('limit-light', formatarValor(cargas.leve || 0) + ' kg');
        this.atualizarElemento('limit-medium', formatarValor(cargas.media || 0) + ' kg');
        this.atualizarElemento('limit-heavy', formatarValor(cargas.pesada || 0) + ' kg');
        this.atualizarElemento('limit-extreme', formatarValor(cargas.muitoPesada || 0) + ' kg');
    }
    
    // ============================================
    // 6. ATUALIZAÇÃO DE ATRIBUTOS
    // ============================================
    
    atualizarAtributosDashboard(dadosAtributos) {
        if (!dadosAtributos) {
            console.warn('⚠️ Dados de atributos vazios');
            return;
        }
        
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
        
        // Disparar evento de atualização
        const event = new CustomEvent('atributos-atualizados', {
            detail: dadosAtributos
        });
        document.dispatchEvent(event);
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
    // 7. FUNÇÕES UTILITÁRIAS
    // ============================================
    
    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        } else {
            console.warn(`⚠️ Elemento ${id} não encontrado`);
        }
    }
    
    async salvarDado(chave, valor) {
        console.log(`💾 Salvando ${chave}:`, valor);
        
        // Salvar no objeto local
        this.dadosPersonagem[chave] = valor;
        
        // Salvar no localStorage
        localStorage.setItem('gurps_personagem_completo', JSON.stringify(this.dadosPersonagem));
        
        // Se estiver conectado ao Firebase, salvar lá também
        if (window.firebaseService && typeof window.firebaseService.saveModule === 'function') {
            try {
                await window.firebaseService.saveModule(chave, valor);
                console.log(`✅ ${chave} salvo no Firebase`);
            } catch (error) {
                console.error(`❌ Erro ao salvar ${chave} no Firebase:`, error);
            }
        } else if (window.saveCharacterData && typeof window.saveCharacterData === 'function') {
            try {
                await window.saveCharacterData(chave, valor);
                console.log(`✅ ${chave} salvo via função global`);
            } catch (error) {
                console.error(`❌ Erro ao salvar via função global:`, error);
            }
        }
        
        // Atualizar display se for nome
        if (chave === 'nome' && valor) {
            const charNameDisplay = document.getElementById('character-name-display');
            if (charNameDisplay) {
                charNameDisplay.textContent = valor;
            }
        }
    }
    
    processarUploadFoto(arquivo) {
        if (!arquivo || !arquivo.type.startsWith('image/')) {
            this.mostrarMensagem('Por favor, selecione uma imagem válida', 'error');
            return;
        }
        
        // Verificar tamanho (max 2MB)
        if (arquivo.size > 2 * 1024 * 1024) {
            this.mostrarMensagem('A imagem deve ter no máximo 2MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const preview = document.getElementById('photo-preview');
            if (preview) {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Foto do personagem" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
                    <button class="remove-photo-btn" onclick="window.dashboard.removeFoto()">
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
        
        reader.onerror = () => {
            this.mostrarMensagem('Erro ao carregar a foto', 'error');
        };
        
        reader.readAsDataURL(arquivo);
    }
    
    carregarFoto(fotoData) {
        const preview = document.getElementById('photo-preview');
        if (preview && fotoData.base64) {
            preview.innerHTML = `
                <img src="${fotoData.base64}" alt="Foto do personagem" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
                <button class="remove-photo-btn" onclick="window.dashboard.removeFoto()">
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
        
        // Escutar eventos de atualização de pontos
        document.addEventListener('pontos-atualizados', (e) => {
            if (e.detail) {
                this.atualizarDisplayPontos(e.detail);
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
            
            // Verificar se há novos dados de pontos
            if (window.pontosManager && typeof window.pontosManager.getResumo === 'function') {
                const novosPontos = window.pontosManager.getResumo();
                if (novosPontos && JSON.stringify(novosPontos) !== JSON.stringify(this.pontosAtuais)) {
                    this.pontosAtuais = novosPontos;
                    this.atualizarDisplayPontos(novosPontos);
                }
            }
        }, 3000);
    }
    
    // ============================================
    // 8. AÇÕES PRINCIPAIS
    // ============================================
    
    async atualizarTudo() {
        console.log('🔄 Atualizando dashboard completa...');
        
        await this.carregarAtributos();
        await this.carregarPontos();
        this.calcularTotalReacao();
        this.atualizarHoraAtualizacao();
        
        this.mostrarMensagem('Dashboard atualizada!', 'success');
    }
    
    async sincronizarComFirebase() {
        if (!window.firebaseService && !window.saveCharacterData) {
            this.mostrarMensagem('Firebase não disponível', 'error');
            return;
        }
        
        this.mostrarMensagem('Sincronizando com Firebase...', 'loading');
        
        try {
            // Salvar todos os dados da dashboard
            await this.salvarDado('dashboard_completo', this.dadosPersonagem);
            
            // Se existir atributos atuais, salvar também
            if (this.atributosAtuais) {
                if (window.firebaseService && typeof window.firebaseService.saveModule === 'function') {
                    await window.firebaseService.saveModule('atributos', this.atributosAtuais);
                } else if (window.saveCharacterData) {
                    await window.saveCharacterData('atributos', this.atributosAtuais);
                }
            }
            
            // Se existir pontos, salvar também
            if (window.pontosManager) {
                const pontosData = window.pontosManager.getResumo();
                if (pontosData) {
                    localStorage.setItem('gurps_pontos', JSON.stringify(pontosData));
                }
            }
            
            this.mostrarMensagem('✅ Sincronização completa!', 'success');
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.mostrarMensagem('Erro na sincronização', 'error');
        }
    }
    
    exportarAtributos() {
        const dados = {
            atributos: this.atributosAtuais,
            dadosPersonagem: this.dadosPersonagem,
            pontos: this.pontosAtuais,
            dataExportacao: new Date().toISOString()
        };
        
        const dadosStr = JSON.stringify(dados, null, 2);
        const blob = new Blob([dadosStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `personagem-gurps-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.mostrarMensagem('Atributos exportados com sucesso!', 'success');
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
window.sincronizarDashboardComFirebase = () => window.dashboard?.sincronizarComFirebase();
window.exportarPersonagemCompleto = () => window.dashboard?.exportarAtributos();

// Funções de compatibilidade para o HTML
window.salvarDadoDashboard = (chave, valor) => window.dashboard?.salvarDado(chave, valor);
window.ajustarModificadorSocial = (tipo, valor) => window.dashboard?.ajustarModificadorSocial(tipo, valor);
window.atualizarModificadorSocial = (tipo, valor) => window.dashboard?.atualizarModificadorSocial(tipo, valor);
window.atualizarRiqueza = (valor) => window.dashboard?.atualizarRiqueza(valor);
window.atualizarConfiguracaoPontos = () => window.dashboard?.atualizarSaldoPontos();
window.redistribuirPontos = () => window.dashboard?.atualizarSaldoPontos();
window.sincronizarTudo = () => window.dashboard?.sincronizarComFirebase();

console.log('✅ dashboard.js carregado (versão corrigida e funcional)');