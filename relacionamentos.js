// ===========================================
// SISTEMA DE RELACIONAMENTOS - GURPS
// ===========================================

class SistemaRelacionamentos {
    constructor() {
        console.log('🏗️ Inicializando Sistema de Relacionamentos');
        
        // Relacionamentos armazenados
        this.relacionamentos = [];
        this.tipoSelecionado = null;
        this.dadosTemporarios = {};
        
        // Configuração padrão GURPS
        this.config = {
            aliados: {
                custoPorPoder: {
                    25: 1,   // 25% dos pontos do PJ
                    50: 2,   // 50%
                    75: 3,   // 75%
                    100: 5,  // 100%
                    150: 10  // 150%
                },
                frequencias: {
                    6: { nome: 'Quase sempre', mult: 1.0, desc: '15 ou menos' },
                    9: { nome: 'Frequentemente', mult: 0.5, desc: '12 ou menos' },
                    12: { nome: 'Ocasionalmente', mult: 0.33, desc: '9 ou menos' },
                    15: { nome: 'Raramente', mult: 0.2, desc: '6 ou menos' }
                },
                modificadores: {
                    invocavel: { nome: 'Invocável', valor: 1.0 }, // +100%
                    lacaio: { nome: 'Lacaio', valor: 0.5 },       // +50%
                    habilidades: { nome: 'Habilidades Especiais', valor: 0.5 },
                    afinidade: { nome: 'Afinidade', valor: -0.25 }, // -25%
                    relutante: { nome: 'Relutante', valor: -0.5 }   // -50%
                }
            }
        };
        
        this.init();
    }
    
    // ===========================================
    // INICIALIZAÇÃO
    // ===========================================
    
    init() {
        console.log('🚀 SistemaRelacionamentos.init()');
        
        // Verificar se estamos na aba correta
        if (!this.estaNaAbaCorreta()) {
            console.log('⏳ Aguardando aba de Vantagens ficar ativa...');
            return;
        }
        
        this.setupElementos();
        
        // Se não encontrou elementos, tenta novamente em 500ms
        if (!this.elementos.btnAdicionar || !this.elementos.modal) {
            console.log('⏳ Elementos não encontrados, tentando novamente...');
            setTimeout(() => this.init(), 500);
            return;
        }
        
        this.setupEventListeners();
        this.carregarDoLocalStorage();
        this.atualizarContadores();
        
        console.log('✅ Sistema de Relacionamentos inicializado');
    }
    
    estaNaAbaCorreta() {
        const vantagensTab = document.getElementById('vantagens');
        if (!vantagensTab) return false;
        
        // Verifica se a aba de vantagens está ativa
        return vantagensTab.classList.contains('active');
    }
    
    setupElementos() {
        // Elementos principais
        this.elementos = {
            btnAdicionar: document.getElementById('btnAddRelacionamento'),
            modal: document.getElementById('modalRelacionamento'),
            lista: document.getElementById('relacionamentosLista'),
            contadores: {
                aliados: document.getElementById('countAliados'),
                contatos: document.getElementById('countContatos'),
                inimigos: document.getElementById('countInimigos'),
                patronos: document.getElementById('countPatronos'),
                total: document.getElementById('totalRelacionamentos')
            },
            // Elementos do modal
            modalClose: document.querySelector('.modal-close'),
            tipoOptions: document.querySelectorAll('.tipo-option'),
            step2: document.getElementById('step2'),
            btnPrev: document.getElementById('btnPrev'),
            btnNext: document.getElementById('btnNext'),
            btnSave: document.getElementById('btnSave'),
            // Inputs do modal
            relNome: document.getElementById('relNome'),
            relDescricao: document.getElementById('relDescricao'),
            // Resumo do modal
            resumoTipo: document.getElementById('resumoTipo'),
            resumoCustoBase: document.getElementById('resumoCustoBase'),
            resumoMods: document.getElementById('resumoMods'),
            resumoTotal: document.getElementById('resumoTotal')
        };
        
        console.log('🔍 Elementos encontrados:', {
            btnAdicionar: !!this.elementos.btnAdicionar,
            modal: !!this.elementos.modal,
            lista: !!this.elementos.lista
        });
    }
    
    setupEventListeners() {
        // Botão para abrir modal
        if (this.elementos.btnAdicionar) {
            console.log('🔗 Adicionando evento ao botão');
            this.elementos.btnAdicionar.addEventListener('click', () => this.abrirModal());
        } else {
            console.error('❌ Botão btnAdicionar não encontrado!');
        }
        
        // Fechar modal
        if (this.elementos.modalClose) {
            this.elementos.modalClose.addEventListener('click', () => this.fecharModal());
        }
        
        // Clicar fora do modal para fechar
        if (this.elementos.modal) {
            this.elementos.modal.addEventListener('click', (e) => {
                if (e.target === this.elementos.modal) {
                    this.fecharModal();
                }
            });
        }
        
        // Seleção de tipo no modal
        if (this.elementos.tipoOptions) {
            this.elementos.tipoOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    this.selecionarTipo(e.currentTarget.dataset.tipo);
                });
            });
        }
        
        // Botões de navegação do modal
        if (this.elementos.btnPrev) {
            this.elementos.btnPrev.addEventListener('click', () => this.stepAnterior());
        }
        
        if (this.elementos.btnNext) {
            this.elementos.btnNext.addEventListener('click', () => this.proximoStep());
        }
        
        if (this.elementos.btnSave) {
            this.elementos.btnSave.addEventListener('click', () => this.salvarRelacionamento());
        }
        
        // Filtros
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filtrarRelacionamentos(e.currentTarget.dataset.filter);
            });
        });
        
        // Inputs para atualizar cálculo em tempo real
        if (this.elementos.relNome) {
            this.elementos.relNome.addEventListener('input', () => this.atualizarResumoModal());
        }
        
        if (this.elementos.relDescricao) {
            this.elementos.relDescricao.addEventListener('input', () => this.atualizarResumoModal());
        }
    }
    
    // ===========================================
    // MODAL - CONTROLE
    // ===========================================
    
    abrirModal() {
        console.log('📝 Abrindo modal de relacionamentos');
        
        // Resetar dados temporários
        this.tipoSelecionado = null;
        this.dadosTemporarios = {};
        
        // Mostrar modal
        if (this.elementos.modal) {
            this.elementos.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            console.log('✅ Modal aberto');
        } else {
            console.error('❌ Modal não encontrado');
            return;
        }
        
        // Resetar para step 1
        this.mudarStep(1);
        
        // Limpar inputs
        if (this.elementos.relNome) this.elementos.relNome.value = '';
        if (this.elementos.relDescricao) this.elementos.relDescricao.value = '';
        
        // Atualizar resumo
        this.atualizarResumoModal();
    }
    
    fecharModal() {
        console.log('❌ Fechando modal');
        
        if (this.elementos.modal) {
            this.elementos.modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Resetar seleção
        this.desselecionarTipos();
    }
    
    selecionarTipo(tipo) {
        console.log(`🎯 Tipo selecionado: ${tipo}`);
        
        // Desselecionar todos
        this.desselecionarTipos();
        
        // Selecionar novo
        const option = document.querySelector(`.tipo-option[data-tipo="${tipo}"]`);
        if (option) {
            option.classList.add('selected');
        }
        
        this.tipoSelecionado = tipo;
        
        // Preparar dados temporários para este tipo
        this.prepararDadosTipo(tipo);
        
        // Ir para próximo step
        setTimeout(() => {
            this.proximoStep();
        }, 300);
    }
    
    desselecionarTipos() {
        document.querySelectorAll('.tipo-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    prepararDadosTipo(tipo) {
        // Inicializar dados temporários baseado no tipo
        this.dadosTemporarios = {
            tipo: tipo,
            nome: '',
            descricao: '',
            observacoes: '',
            custoTotal: 0
        };
        
        // Configurações específicas por tipo
        switch(tipo) {
            case 'aliado':
                this.dadosTemporarios.config = {
                    poder: 100, // % dos pontos do PJ (padrão: 100% = 5 pts)
                    frequencia: 12, // Ocasionalmente (9 ou menos)
                    modificadores: [],
                    grupo: false,
                    tamanhoGrupo: 1
                };
                break;
                
            case 'inimigo':
                this.dadosTemporarios.config = {
                    poder: 10, // Inimigo médio (-10 pts)
                    frequencia: 12, // Ocasionalmente
                    intensidade: 'médio'
                };
                break;
                
            case 'contato':
                this.dadosTemporarios.config = {
                    habilidade: '',
                    confiabilidade: 'normal',
                    frequencia: 12
                };
                break;
                
            case 'patrono':
                this.dadosTemporarios.config = {
                    poder: 15, // Patrono poderoso
                    frequencia: 9, // Frequentemente
                    influencia: 'alta'
                };
                break;
                
            case 'dependente':
                this.dadosTemporarios.config = {
                    afinidade: 'familiar',
                    habilidade: 'nenhuma',
                    frequencia: 6 // Quase sempre
                };
                break;
        }
    }
    
    // ===========================================
    // MODAL - NAVEGAÇÃO ENTRE STEPS
    // ===========================================
    
    mudarStep(stepNum) {
        console.log(`🔀 Mudando para step ${stepNum}`);
        
        // Esconder todos os steps
        document.querySelectorAll('.modal-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Mostrar step atual
        const stepElement = document.getElementById(`step${stepNum}`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
        
        // Atualizar visibilidade dos botões
        this.atualizarBotoesNavegacao(stepNum);
        
        // Carregar conteúdo dinâmico para step 2
        if (stepNum === 2 && this.tipoSelecionado) {
            this.carregarStepConfiguracao(this.tipoSelecionado);
        }
        
        // Atualizar resumo
        this.atualizarResumoModal();
    }
    
    atualizarBotoesNavegacao(stepAtual) {
        const btnPrev = this.elementos.btnPrev;
        const btnNext = this.elementos.btnNext;
        const btnSave = this.elementos.btnSave;
        
        if (!btnPrev || !btnNext || !btnSave) return;
        
        // Step 1: Apenas próximo
        if (stepAtual === 1) {
            btnPrev.style.display = 'none';
            btnNext.style.display = this.tipoSelecionado ? 'block' : 'none';
            btnSave.style.display = 'none';
        }
        // Step 2: Anterior e Próximo
        else if (stepAtual === 2) {
            btnPrev.style.display = 'block';
            btnNext.style.display = 'block';
            btnSave.style.display = 'none';
        }
        // Step 3: Anterior e Salvar
        else if (stepAtual === 3) {
            btnPrev.style.display = 'block';
            btnNext.style.display = 'none';
            btnSave.style.display = 'block';
            
            // Habilitar/desabilitar salvar baseado em validação
            btnSave.disabled = !this.validarDados();
        }
    }
    
    stepAnterior() {
        const stepAtual = this.obterStepAtual();
        if (stepAtual > 1) {
            this.mudarStep(stepAtual - 1);
        }
    }
    
    proximoStep() {
        const stepAtual = this.obterStepAtual();
        
        // Validação antes de avançar
        if (stepAtual === 1 && !this.tipoSelecionado) {
            alert('Por favor, selecione um tipo de relacionamento');
            return;
        }
        
        if (stepAtual === 2 && !this.validarConfiguracao()) {
            alert('Por favor, complete a configuração');
            return;
        }
        
        if (stepAtual < 3) {
            this.mudarStep(stepAtual + 1);
        }
    }
    
    obterStepAtual() {
        const stepAtivo = document.querySelector('.modal-step.active');
        if (stepAtivo) {
            return parseInt(stepAtivo.id.replace('step', ''));
        }
        return 1;
    }
    
    // ===========================================
    // MODAL - CONFIGURAÇÃO DINÂMICA (STEP 2)
    // ===========================================
    
    carregarStepConfiguracao(tipo) {
        console.log(`⚙️ Carregando configuração para: ${tipo}`);
        
        if (!this.elementos.step2) return;
        
        let conteudoHTML = '';
        
        switch(tipo) {
            case 'aliado':
                conteudoHTML = this.getHTMLConfigAliado();
                break;
                
            case 'inimigo':
                conteudoHTML = this.getHTMLConfigInimigo();
                break;
                
            case 'contato':
                conteudoHTML = `<div class="contato-config"><p>Configuração de Contato em breve...</p></div>`;
                break;
                
            case 'patrono':
                conteudoHTML = `<div class="patrono-config"><p>Configuração de Patrono em breve...</p></div>`;
                break;
                
            case 'dependente':
                conteudoHTML = `<div class="dependente-config"><p>Configuração de Dependente em breve...</p></div>`;
                break;
                
            default:
                conteudoHTML = '<p>Configuração não disponível para este tipo.</p>';
        }
        
        this.elementos.step2.innerHTML = conteudoHTML;
        
        // Adicionar event listeners aos controles recém-criados
        this.setupControlesConfiguracao(tipo);
    }
    
    getHTMLConfigAliado() {
        const config = this.dadosTemporarios.config || {};
        return `
            <div class="ally-config">
                <h4><i class="fas fa-shield-alt"></i> Configuração do Aliado</h4>
                
                <div class="config-section">
                    <h5><i class="fas fa-chart-line"></i> Poder do Aliado</h5>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="allyPower" value="25" ${config.poder == 25 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>25%</strong> dos seus pontos <em>(1 ponto)</em>
                                <small>Aliado fraco ou especializado</small>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="50" ${config.poder == 50 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>50%</strong> dos seus pontos <em>(2 pontos)</em>
                                <small>Aliado competente</small>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="75" ${config.poder == 75 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>75%</strong> dos seus pontos <em>(3 pontos)</em>
                                <small>Aliado muito capaz</small>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="100" ${!config.poder || config.poder == 100 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>100%</strong> dos seus pontos <em>(5 pontos)</em>
                                <small>Aliado com poder equivalente</small>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="150" ${config.poder == 150 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>150%</strong> dos seus pontos <em>(10 pontos)</em>
                                <small>Aliado poderoso (máximo permitido)</small>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="config-section">
                    <h5><i class="fas fa-calendar-alt"></i> Frequência de Aparição</h5>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="allyFrequency" value="6" ${config.frequencia == 6 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Quase sempre</strong> <em>(x1 custo)</em>
                                <small>Aparece em 15 ou menos (93.75% das aventuras)</small>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyFrequency" value="9" ${config.frequencia == 9 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Frequentemente</strong> <em>(x1/2 custo)</em>
                                <small>Aparece em 12 ou menos (74.1% das aventuras)</small>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyFrequency" value="12" ${!config.frequencia || config.frequencia == 12 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Ocasionalmente</strong> <em>(x1/3 custo)</em>
                                <small>Aparece em 9 ou menos (37.5% das aventuras)</small>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyFrequency" value="15" ${config.frequencia == 15 ? 'checked' : ''}>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Raramente</strong> <em>(x1/5 custo)</em>
                                <small>Aparece em 6 ou menos (9.3% das aventuras)</small>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="config-section">
                    <h5><i class="fas fa-magic"></i> Modificadores Especiais</h5>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" name="allyMods" value="invocavel" ${config.modificadores && config.modificadores.includes('invocavel') ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Invocável</strong> <em>(+100%)</em>
                                <small>Pode ser conjurado/chamado quando necessário</small>
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="lacaio" ${config.modificadores && config.modificadores.includes('lacaio') ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Lacaio</strong> <em>(+50%)</em>
                                <small>Lealdade incondicional (robôs, escravos mágicos)</small>
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="habilidades" ${config.modificadores && config.modificadores.includes('habilidades') ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Habilidades Especiais</strong> <em>(+50%)</em>
                                <small>Poderes desproporcionais ao seu valor</small>
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="afinidade" ${config.modificadores && config.modificadores.includes('afinidade') ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Afinidade</strong> <em>(-25%)</em>
                                <small>Danos e condições são compartilhados</small>
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="relutante" ${config.modificadores && config.modificadores.includes('relutante') ? 'checked' : ''}>
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Relutante</strong> <em>(-50%)</em>
                                <small>Aliado por coerção, pode se rebelar</small>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="config-section">
                    <label class="checkbox-label">
                        <input type="checkbox" id="isGroup" ${config.grupo ? 'checked' : ''}>
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-text">
                            <strong>É um grupo de aliados?</strong>
                            <small>Múltiplos aliados idênticos</small>
                        </span>
                    </label>
                    
                    <div id="groupConfig" style="display: ${config.grupo ? 'block' : 'none'}; margin-top: 15px;">
                        <label>Tamanho do Grupo:</label>
                        <select id="groupSize" class="form-control">
                            <option value="1" ${!config.tamanhoGrupo || config.tamanhoGrupo == 1 ? 'selected' : ''}>Individual (x1)</option>
                            <option value="6" ${config.tamanhoGrupo == 6 ? 'selected' : ''}>6-10 membros (x6)</option>
                            <option value="11" ${config.tamanhoGrupo == 11 ? 'selected' : ''}>11-20 membros (x8)</option>
                            <option value="21" ${config.tamanhoGrupo == 21 ? 'selected' : ''}>21-50 membros (x10)</option>
                            <option value="51" ${config.tamanhoGrupo == 51 ? 'selected' : ''}>51-100 membros (x12)</option>
                        </select>
                        <small class="form-text">Multiplicador aplicado ao custo base</small>
                    </div>
                </div>
            </div>
        `;
    }
    
    getHTMLConfigInimigo() {
        return `
            <div class="enemy-config">
                <h4><i class="fas fa-skull-crossbones"></i> Configuração do Inimigo</h4>
                <p>Configuração de Inimigo em breve...</p>
            </div>
        `;
    }
    
    setupControlesConfiguracao(tipo) {
        // Configura event listeners específicos para o tipo
        switch(tipo) {
            case 'aliado':
                this.setupControlesAliado();
                break;
        }
    }
    
    setupControlesAliado() {
        // Poder
        document.querySelectorAll('input[name="allyPower"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (!this.dadosTemporarios.config) this.dadosTemporarios.config = {};
                this.dadosTemporarios.config.poder = parseInt(e.target.value);
                this.atualizarResumoModal();
            });
        });
        
        // Frequência
        document.querySelectorAll('input[name="allyFrequency"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (!this.dadosTemporarios.config) this.dadosTemporarios.config = {};
                this.dadosTemporarios.config.frequencia = parseInt(e.target.value);
                this.atualizarResumoModal();
            });
        });
        
        // Modificadores
        document.querySelectorAll('input[name="allyMods"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.atualizarModificadoresAliado();
            });
        });
        
        // Grupo
        const isGroupCheckbox = document.getElementById('isGroup');
        if (isGroupCheckbox) {
            isGroupCheckbox.addEventListener('change', (e) => {
                if (!this.dadosTemporarios.config) this.dadosTemporarios.config = {};
                this.dadosTemporarios.config.grupo = e.target.checked;
                const groupConfig = document.getElementById('groupConfig');
                if (groupConfig) {
                    groupConfig.style.display = e.target.checked ? 'block' : 'none';
                }
                this.atualizarResumoModal();
            });
        }
        
        // Tamanho do grupo
        const groupSize = document.getElementById('groupSize');
        if (groupSize) {
            groupSize.addEventListener('change', (e) => {
                if (!this.dadosTemporarios.config) this.dadosTemporarios.config = {};
                this.dadosTemporarios.config.tamanhoGrupo = parseInt(e.target.value);
                this.atualizarResumoModal();
            });
        }
    }
    
    atualizarModificadoresAliado() {
        if (!this.dadosTemporarios.config) this.dadosTemporarios.config = {};
        const checkboxes = document.querySelectorAll('input[name="allyMods"]:checked');
        this.dadosTemporarios.config.modificadores = Array.from(checkboxes).map(cb => cb.value);
        this.atualizarResumoModal();
    }
    
    // ===========================================
    // CÁLCULOS DE PONTOS
    // ===========================================
    
    calcularCustoAliado() {
        const config = this.dadosTemporarios.config;
        if (!config) return 0;
        
        let custo = 0;
        
        // 1. Custo base pelo poder
        custo = this.config.aliados.custoPorPoder[config.poder] || 0;
        
        // 2. Multiplicador de frequência
        const freqConfig = this.config.aliados.frequencias[config.frequencia];
        if (freqConfig) {
            custo *= freqConfig.mult;
        }
        
        // 3. Modificadores (percentuais)
        let multModificadores = 1;
        if (config.modificadores) {
            config.modificadores.forEach(modKey => {
                const mod = this.config.aliados.modificadores[modKey];
                if (mod) {
                    multModificadores += mod.valor;
                }
            });
        }
        
        custo *= multModificadores;
        
        // 4. Multiplicador de grupo
        if (config.grupo && config.tamanhoGrupo) {
            const multGrupo = this.calcularMultiplicadorGrupo(config.tamanhoGrupo);
            custo *= multGrupo;
        }
        
        // Arredondar para cima (GURPS arredonda para cima)
        custo = Math.ceil(custo * 100) / 100;
        
        return custo;
    }
    
    calcularMultiplicadorGrupo(tamanho) {
        if (tamanho <= 5) return 1;
        if (tamanho <= 10) return 6;
        if (tamanho <= 20) return 8;
        if (tamanho <= 50) return 10;
        if (tamanho <= 100) return 12;
        // Para grupos maiores, adiciona +6 para cada aumento de 10x
        let mult = 12;
        let tamanhoAtual = 100;
        while (tamanhoAtual * 10 <= tamanho) {
            mult += 6;
            tamanhoAtual *= 10;
        }
        return mult;
    }
    
    // ===========================================
    // ATUALIZAÇÃO DO MODAL
    // ===========================================
    
    atualizarResumoModal() {
        if (!this.tipoSelecionado) return;
        
        // Atualizar tipo
        if (this.elementos.resumoTipo) {
            this.elementos.resumoTipo.textContent = this.tipoSelecionado.toUpperCase();
        }
        
        // Calcular custo base
        let custoBase = 0;
        let custoMods = 0;
        let custoTotal = 0;
        
        if (this.tipoSelecionado === 'aliado') {
            const custo = this.calcularCustoAliado();
            custoTotal = custo;
            
            // Para display no resumo
            if (this.dadosTemporarios.config && this.dadosTemporarios.config.poder) {
                custoBase = this.config.aliados.custoPorPoder[this.dadosTemporarios.config.poder] || 0;
            }
            
            // Calcular valor dos modificadores
            if (this.dadosTemporarios.config && this.dadosTemporarios.config.modificadores) {
                this.dadosTemporarios.config.modificadores.forEach(modKey => {
                    const mod = this.config.aliados.modificadores[modKey];
                    if (mod) {
                        custoMods += mod.valor * 100; // Converter para percentual
                    }
                });
            }
        }
        
        // Atualizar displays
        if (this.elementos.resumoCustoBase) {
            this.elementos.resumoCustoBase.textContent = `${custoBase} pts`;
        }
        
        if (this.elementos.resumoMods) {
            const sinal = custoMods >= 0 ? '+' : '';
            this.elementos.resumoMods.textContent = `${sinal}${custoMods}%`;
            this.elementos.resumoMods.className = custoMods >= 0 ? 'positivo' : 'negativo';
        }
        
        if (this.elementos.resumoTotal) {
            this.elementos.resumoTotal.textContent = `${custoTotal.toFixed(2)} pts`;
            this.dadosTemporarios.custoTotal = custoTotal;
        }
    }
    
    // ===========================================
    // VALIDAÇÃO
    // ===========================================
    
    validarConfiguracao() {
        if (!this.tipoSelecionado) return false;
        
        switch(this.tipoSelecionado) {
            case 'aliado':
                return this.validarConfigAliado();
            default:
                return true;
        }
    }
    
    validarConfigAliado() {
        const config = this.dadosTemporarios.config;
        return config && config.poder && config.frequencia;
    }
    
    validarDados() {
        // Verifica se tem nome
        if (!this.dadosTemporarios.nome || this.dadosTemporarios.nome.trim() === '') {
            return false;
        }
        
        // Verifica se tem configuração válida
        return this.validarConfiguracao();
    }
    
    // ===========================================
    // SALVAR RELACIONAMENTO
    // ===========================================
    
    salvarRelacionamento() {
        if (!this.validarDados()) {
            alert('Por favor, complete todos os campos obrigatórios');
            return;
        }
        
        // Obter nome e descrição dos inputs
        if (this.elementos.relNome) {
            this.dadosTemporarios.nome = this.elementos.relNome.value.trim();
        }
        
        if (this.elementos.relDescricao) {
            this.dadosTemporarios.descricao = this.elementos.relDescricao.value.trim();
        }
        
        // Gerar ID único
        const id = 'rel_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Criar objeto de relacionamento
        const relacionamento = {
            id: id,
            ...this.dadosTemporarios,
            criadoEm: new Date().toISOString()
        };
        
        // Adicionar à lista
        this.relacionamentos.push(relacionamento);
        
        // Salvar no localStorage
        this.salvarNoLocalStorage();
        
        // Atualizar interface
        this.atualizarListaRelacionamentos();
        this.atualizarContadores();
        this.atualizarPontosTotais();
        
        // Fechar modal e mostrar mensagem
        this.fecharModal();
        alert('Relacionamento adicionado com sucesso!');
        
        console.log('💾 Relacionamento salvo:', relacionamento);
    }
    
    // ===========================================
    // LISTA DE RELACIONAMENTOS
    // ===========================================
    
    atualizarListaRelacionamentos() {
        if (!this.elementos.lista) return;
        
        // Se não houver relacionamentos, mostrar empty state
        if (this.relacionamentos.length === 0) {
            this.elementos.lista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Nenhum relacionamento adicionado</p>
                    <small>Clique em "Adicionar Relacionamento" para começar</small>
                </div>
            `;
            return;
        }
        
        // Gerar HTML para cada relacionamento
        let html = '';
        this.relacionamentos.forEach(rel => {
            html += this.getHTMLRelacionamento(rel);
        });
        
        this.elementos.lista.innerHTML = html;
        
        // Adicionar event listeners aos botões de ação
        this.setupBotoesAcao();
    }
    
    getHTMLRelacionamento(rel) {
        let tipoClass = '';
        let tipoTexto = '';
        let icone = '';
        
        switch(rel.tipo) {
            case 'aliado':
                tipoClass = 'aliado';
                tipoTexto = 'ALIADO';
                icone = 'fas fa-shield-alt';
                break;
            case 'inimigo':
                tipoClass = 'inimigo';
                tipoTexto = 'INIMIGO';
                icone = 'fas fa-skull-crossbones';
                break;
            case 'contato':
                tipoClass = 'contato';
                tipoTexto = 'CONTATO';
                icone = 'fas fa-network-wired';
                break;
            case 'patrono':
                tipoClass = 'patrono';
                tipoTexto = 'PATRONO';
                icone = 'fas fa-crown';
                break;
            case 'dependente':
                tipoClass = 'dependente';
                tipoTexto = 'DEPENDENTE';
                icone = 'fas fa-heart';
                break;
        }
        
        return `
            <div class="relacionamento-item" data-id="${rel.id}">
                <div class="relacionamento-header">
                    <div class="relacionamento-tipo ${tipoClass}">
                        <i class="${icone}"></i>
                        ${tipoTexto}
                    </div>
                    <div class="relacionamento-nome">
                        ${rel.nome || 'Sem nome'}
                    </div>
                    <div class="relacionamento-custo">
                        ${rel.custoTotal >= 0 ? '+' : ''}${rel.custoTotal.toFixed(2)} pts
                    </div>
                </div>
                
                <div class="relacionamento-descricao">
                    ${rel.descricao || 'Sem descrição'}
                </div>
                
                ${this.getDetalhesRelacionamento(rel)}
                
                <div class="relacionamento-acoes">
                    <button class="btn-edit" data-id="${rel.id}">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" data-id="${rel.id}">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    }
    
    getDetalhesRelacionamento(rel) {
        if (rel.tipo === 'aliado' && rel.config) {
            const freq = this.config.aliados.frequencias[rel.config.frequencia];
            return `
                <div class="relacionamento-detalhes">
                    <span><i class="fas fa-chart-line"></i> Poder: ${rel.config.poder}%</span>
                    <span><i class="fas fa-calendar-alt"></i> ${freq ? freq.nome : 'N/A'}</span>
                    ${rel.config.grupo ? `<span><i class="fas fa-users"></i> Grupo: ${rel.config.tamanhoGrupo} membros</span>` : ''}
                </div>
            `;
        }
        return '';
    }
    
    setupBotoesAcao() {
        // Botões editar
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.editarRelacionamento(id);
            });
        });
        
        // Botões deletar
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.excluirRelacionamento(id);
            });
        });
    }
    
    editarRelacionamento(id) {
        console.log(`✏️ Editando relacionamento: ${id}`);
        // Implementar edição
        alert('Edição em breve...');
    }
    
    excluirRelacionamento(id) {
        if (!confirm('Tem certeza que deseja remover este relacionamento?')) {
            return;
        }
        
        this.relacionamentos = this.relacionamentos.filter(rel => rel.id !== id);
        this.salvarNoLocalStorage();
        this.atualizarListaRelacionamentos();
        this.atualizarContadores();
        this.atualizarPontosTotais();
        
        alert('Relacionamento removido');
    }
    
    // ===========================================
    // CONTADORES E TOTAIS
    // ===========================================
    
    atualizarContadores() {
        const contadores = {
            aliados: 0,
            contatos: 0,
            inimigos: 0,
            patronos: 0,
            dependentes: 0
        };
        
        this.relacionamentos.forEach(rel => {
            if (contadores.hasOwnProperty(rel.tipo)) {
                contadores[rel.tipo]++;
            }
        });
        
        // Atualizar displays
        Object.keys(contadores).forEach(tipo => {
            const el = this.elementos.contadores[tipo];
            if (el) {
                el.textContent = contadores[tipo];
            }
        });
    }
    
    atualizarPontosTotais() {
        let total = 0;
        
        this.relacionamentos.forEach(rel => {
            total += rel.custoTotal || 0;
        });
        
        if (this.elementos.contadores.total) {
            this.elementos.contadores.total.textContent = `${total >= 0 ? '+' : ''}${total.toFixed(2)} pts`;
        }
        
        // Atualizar também no resumo geral da aba
        const totalRelacionamentosResumo = document.getElementById('totalRelacionamentosResumo');
        if (totalRelacionamentosResumo) {
            totalRelacionamentosResumo.textContent = total >= 0 ? `+${total.toFixed(2)}` : total.toFixed(2);
        }
    }
    
    // ===========================================
    // FILTROS
    // ===========================================
    
    filtrarRelacionamentos(filtro) {
        console.log(`🔍 Filtrando por: ${filtro}`);
        
        // Atualizar botões de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filtro);
        });
        
        // Mostrar/ocultar relacionamentos
        document.querySelectorAll('.relacionamento-item').forEach(item => {
            if (filtro === 'all') {
                item.style.display = 'block';
            } else {
                const tipo = item.querySelector('.relacionamento-tipo').className.includes(filtro);
                item.style.display = tipo ? 'block' : 'none';
            }
        });
    }
    
    // ===========================================
    // PERSISTÊNCIA
    // ===========================================
    
    salvarNoLocalStorage() {
        const dados = {
            relacionamentos: this.relacionamentos,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('vantagensRelacionamentos', JSON.stringify(dados));
        console.log('💾 Relacionamentos salvos no localStorage');
    }
    
    carregarDoLocalStorage() {
        try {
            const dados = localStorage.getItem('vantagensRelacionamentos');
            if (dados) {
                const parsed = JSON.parse(dados);
                this.relacionamentos = parsed.relacionamentos || [];
                
                this.atualizarListaRelacionamentos();
                this.atualizarPontosTotais();
                console.log('✅ Relacionamentos carregados do localStorage:', this.relacionamentos.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar relacionamentos:', error);
        }
    }
    
    // ===========================================
    // MÉTODOS PÚBLICOS
    // ===========================================
    
    getDadosParaSalvar() {
        return {
            relacionamentos: this.relacionamentos,
            totalPontos: this.calcularTotalPontos()
        };
    }
    
    calcularTotalPontos() {
        let total = 0;
        this.relacionamentos.forEach(rel => {
            total += rel.custoTotal || 0;
        });
        return total;
    }
    
    resetar() {
        if (confirm('Tem certeza que deseja remover TODOS os relacionamentos?')) {
            this.relacionamentos = [];
            this.salvarNoLocalStorage();
            this.atualizarListaRelacionamentos();
            this.atualizarContadores();
            this.atualizarPontosTotais();
            alert('Todos os relacionamentos foram removidos');
        }
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL DIRETA
// ===========================================

let sistemaRelacionamentos = null;

// Função para inicialização manual
function initSistemaRelacionamentos() {
    console.log('🎯 initSistemaRelacionamentos() chamada');
    
    if (!sistemaRelacionamentos) {
        sistemaRelacionamentos = new SistemaRelacionamentos();
    }
    return sistemaRelacionamentos;
}

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA SIMPLES
// ===========================================

// Espera a página carregar completamente
window.addEventListener('load', function() {
    console.log('📄 Página completamente carregada - inicializando relacionamentos');
    
    // Pequeno delay para garantir que tudo está pronto
    setTimeout(function() {
        // Verifica se estamos na aba de Vantagens
        const vantagensTab = document.getElementById('vantagens');
        if (vantagensTab && vantagensTab.classList.contains('active')) {
            console.log('🎯 Aba Vantagens está ativa - inicializando sistema');
            initSistemaRelacionamentos();
        } else {
            console.log('⏳ Aguardando aba Vantagens ficar ativa...');
            
            // Observa mudanças na aba
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.attributeName === 'class' && 
                        vantagensTab.classList.contains('active') && 
                        !sistemaRelacionamentos) {
                        console.log('🔄 Aba Vantagens tornou-se ativa - inicializando agora');
                        setTimeout(() => {
                            initSistemaRelacionamentos();
                        }, 300);
                    }
                });
            });
            
            if (vantagensTab) {
                observer.observe(vantagensTab, { attributes: true });
            }
        }
    }, 1000); // 1 segundo para garantir que tudo carregou
});

// Também inicializa quando o usuário clicar na aba
document.addEventListener('click', function(e) {
    if (e.target.closest('.tab-btn') && e.target.closest('.tab-btn').dataset.tab === 'vantagens') {
        console.log('🎯 Usuário clicou na aba Vantagens');
        setTimeout(() => {
            if (!sistemaRelacionamentos) {
                initSistemaRelacionamentos();
            }
        }, 500);
    }
});

// Exporta para uso global
window.SistemaRelacionamentos = SistemaRelacionamentos;
window.initSistemaRelacionamentos = initSistemaRelacionamentos;
window.sistemaRelacionamentos = sistemaRelacionamentos;

// Função para debug/teste
window.testeRelacionamentos = function() {
    console.log('🧪 TESTANDO RELACIONAMENTOS');
    console.log('- Sistema criado:', !!sistemaRelacionamentos);
    console.log('- Botão encontrado:', !!document.getElementById('btnAddRelacionamento'));
    console.log('- Modal encontrado:', !!document.getElementById('modalRelacionamento'));
    
    const btn = document.getElementById('btnAddRelacionamento');
    if (btn) {
        console.log('🎯 Clicando no botão...');
        btn.click();
    }
};