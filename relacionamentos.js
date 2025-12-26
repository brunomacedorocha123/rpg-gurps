// ===========================================
// SISTEMA DE RELACIONAMENTOS - VERSÃO COMPLETA CORRIGIDA
// ===========================================

class SistemaRelacionamentos {
    constructor() {
        console.log('🏗️ Sistema de Relacionamentos FUNCIONAL iniciado');
        
        this.relacionamentos = [];
        this.tipoSelecionado = null;
        this.stepAtual = 1;
        this.dadosTemporarios = {};
        this.relacionamentoEmEdicao = null;
        
        // Configuração GURPS CORRETA
        this.config = {
            aliados: {
                custoBase: {
                    25: 1,   // 25% = 1 ponto
                    50: 2,   // 50% = 2 pontos
                    75: 3,   // 75% = 3 pontos
                    100: 5,  // 100% = 5 pontos
                    150: 10  // 150% = 10 pontos
                },
                modificadores: {
                    invocavel: 2.0,   // ×2
                    lacaio: 1.5,      // ×1.5
                    habilidades: 1.5, // ×1.5
                    afinidade: 0.75,  // ×0.75
                    relutante: 0.5    // ×0.5
                },
                grupos: {
                    1: 1,    // Individual
                    6: 6,    // 6-10 membros
                    11: 8,   // 11-20 membros
                    21: 10,  // 21-50 membros
                    51: 12   // 51-100 membros
                }
            },
            inimigos: {
                custoBase: {
                    25: -1,
                    50: -2,
                    75: -3,
                    100: -5,
                    150: -10
                }
            }
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando Relacionamentos...');
        
        this.setupElementos();
        this.setupEventListeners();
        this.carregarDoLocalStorage();
        this.atualizarLista();
        
        console.log('✅ Sistema de Relacionamentos pronto');
    }
    
    setupElementos() {
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
            // Botões do modal
            btnVoltar: document.getElementById('btnVoltar'),
            btnProximo: document.getElementById('btnProximo'),
            btnCancelar: document.getElementById('btnCancelar'),
            btnConfirmar: document.getElementById('btnConfirmar'),
            // Resumo do modal
            resumoTipo: document.getElementById('resumoTipo'),
            resumoCustoBase: document.getElementById('resumoCustoBase'),
            resumoMods: document.getElementById('resumoMods'),
            resumoGrupo: document.getElementById('resumoGrupo'),
            resumoTotal: document.getElementById('resumoTotal')
        };
        
        // Inicializar botões
        this.atualizarBotoes();
    }
    
    setupEventListeners() {
        // Botão para abrir modal
        if (this.elementos.btnAdicionar) {
            this.elementos.btnAdicionar.addEventListener('click', () => this.abrirModal());
        }
        
        // Fechar modal
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.fecharModal());
        }
        
        // Clicar fora do modal para fechar
        if (this.elementos.modal) {
            this.elementos.modal.addEventListener('click', (e) => {
                if (e.target === this.elementos.modal) {
                    this.fecharModal();
                }
            });
        }
        
        // Tecla ESC para fechar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elementos.modal?.classList.contains('active')) {
                this.fecharModal();
            }
        });
        
        // Seleção de tipo no modal
        document.querySelectorAll('.tipo-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selecionarTipo(e.currentTarget.dataset.tipo);
            });
        });
        
        // Botões do modal
        if (this.elementos.btnVoltar) {
            this.elementos.btnVoltar.addEventListener('click', () => this.voltarStep());
        }
        
        if (this.elementos.btnProximo) {
            this.elementos.btnProximo.addEventListener('click', () => this.proximoStep());
        }
        
        if (this.elementos.btnCancelar) {
            this.elementos.btnCancelar.addEventListener('click', () => this.fecharModal());
        }
        
        if (this.elementos.btnConfirmar) {
            this.elementos.btnConfirmar.addEventListener('click', () => this.salvarRelacionamento());
        }
        
        // Botões de filtro
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filtrarRelacionamentos(e.currentTarget.dataset.filter);
            });
        });
    }
    
    // ===========================================
    // MODAL - CONTROLE
    // ===========================================
    
    abrirModal() {
        console.log('📝 Abrindo modal de relacionamentos');
        
        // Resetar dados temporários
        this.dadosTemporarios = {};
        this.tipoSelecionado = null;
        this.stepAtual = 1;
        this.relacionamentoEmEdicao = null;
        
        // Limpar inputs
        this.limparInputsModal();
        
        // Mostrar modal
        if (this.elementos.modal) {
            this.elementos.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // GARANTIR VISIBILIDADE DO MODAL E BOTÕES
            this.forcarVisibilidadeModal();
        }
        
        // Resetar para step 1
        this.mudarStep(1);
        this.desselecionarTipos();
        
        // Atualizar resumo
        this.atualizarResumoModal();
    }
    
    forcarVisibilidadeModal() {
        // Esperar um tick para garantir que o DOM foi atualizado
        setTimeout(() => {
            const modal = this.elementos.modal;
            if (!modal) return;
            
            // Garantir que o modal está visível
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.zIndex = '1000';
            
            // Garantir que o conteúdo do modal está visível
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.display = 'block';
                modalContent.style.visibility = 'visible';
                modalContent.style.opacity = '1';
            }
            
            // GARANTIR QUE O FOOTER E BOTÕES ESTEJAM VISÍVEIS
            this.forcarVisibilidadeBotoes();
        }, 50);
    }
    
    forcarVisibilidadeBotoes() {
        const modal = this.elementos.modal;
        if (!modal) return;
        
        // Forçar visibilidade do footer
        const footer = modal.querySelector('.modal-footer');
        if (footer) {
            footer.style.display = 'flex';
            footer.style.visibility = 'visible';
            footer.style.opacity = '1';
            footer.style.position = 'relative';
            footer.style.zIndex = '1001';
            footer.style.background = 'rgba(26, 18, 0, 0.95)';
            footer.style.borderTop = '2px solid var(--primary-gold)';
            footer.style.padding = '15px 20px';
        }
        
        // Forçar visibilidade de todos os botões
        const botoes = modal.querySelectorAll('.btn-voltar, .btn-proximo, .btn-cancelar, .btn-confirmar');
        botoes.forEach(btn => {
            if (btn) {
                btn.style.display = 'flex';
                btn.style.visibility = 'visible';
                btn.style.opacity = '1';
                btn.style.position = 'relative';
                btn.style.zIndex = '1002';
            }
        });
        
        // Atualizar botões conforme step atual
        this.atualizarBotoes();
    }
    
    limparInputsModal() {
        // Limpar inputs do step 3
        const relNome = document.getElementById('relNome');
        const relDescricao = document.getElementById('relDescricao');
        const relObservacoes = document.getElementById('relObservacoes');
        
        if (relNome) relNome.value = '';
        if (relDescricao) relDescricao.value = '';
        if (relObservacoes) relObservacoes.value = '';
        
        // Limpar configuração de aliado se existir
        const powerRadios = document.querySelectorAll('input[name="allyPower"]');
        if (powerRadios.length > 0) {
            powerRadios[0].checked = true; // Seleciona o primeiro
        }
        
        const modCheckboxes = document.querySelectorAll('input[name="allyMods"]');
        modCheckboxes.forEach(cb => cb.checked = false);
        
        const isGroupCheckbox = document.getElementById('isGroup');
        if (isGroupCheckbox) {
            isGroupCheckbox.checked = false;
            const groupConfig = document.getElementById('groupConfig');
            if (groupConfig) groupConfig.style.display = 'none';
        }
        
        const groupSizeSelect = document.getElementById('groupSize');
        if (groupSizeSelect) groupSizeSelect.value = '1';
    }
    
    fecharModal() {
        console.log('❌ Fechando modal');
        
        if (this.elementos.modal) {
            this.elementos.modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Resetar estilos forçados
            this.elementos.modal.style.display = 'none';
        }
        
        // Resetar dados temporários
        this.dadosTemporarios = {};
        this.tipoSelecionado = null;
        this.relacionamentoEmEdicao = null;
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
        this.dadosTemporarios.tipo = tipo;
        
        // Atualizar resumo
        this.atualizarResumoModal();
        
        // Ir para configuração
        this.proximoStep();
    }
    
    desselecionarTipos() {
        document.querySelectorAll('.tipo-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    // ===========================================
    // CONTROLE DE STEPS E BOTÕES
    // ===========================================
    
    mudarStep(stepNum) {
        this.stepAtual = stepNum;
        
        // Esconder todos os steps
        document.querySelectorAll('.modal-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Mostrar step atual
        const stepElement = document.getElementById(`step${stepNum}`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
        
        // Mostrar botões certos
        this.atualizarBotoes();
        
        // Carregar configuração se necessário
        if (stepNum === 2 && this.tipoSelecionado) {
            this.carregarConfiguracao(this.tipoSelecionado);
        }
        
        // Forçar visibilidade dos botões após mudar de step
        setTimeout(() => this.forcarVisibilidadeBotoes(), 100);
    }
    
    atualizarBotoes() {
        const btnVoltar = this.elementos.btnVoltar;
        const btnProximo = this.elementos.btnProximo;
        const btnCancelar = this.elementos.btnCancelar;
        const btnConfirmar = this.elementos.btnConfirmar;
        
        // Resetar todos para flex
        if (btnVoltar) btnVoltar.style.display = 'flex';
        if (btnProximo) btnProximo.style.display = 'flex';
        if (btnCancelar) btnCancelar.style.display = 'flex';
        if (btnConfirmar) btnConfirmar.style.display = 'flex';
        
        // Ajustar conforme step
        switch(this.stepAtual) {
            case 1: // Escolher tipo
                if (btnVoltar) btnVoltar.style.display = 'none';
                if (btnProximo) btnProximo.style.display = 'none';
                if (btnConfirmar) btnConfirmar.style.display = 'none';
                // Cancelar permanece visível
                break;
                
            case 2: // Configuração
                if (btnConfirmar) btnConfirmar.style.display = 'none';
                // Cancelar, Voltar e Próximo permanecem visíveis
                break;
                
            case 3: // Detalhes
                if (btnProximo) btnProximo.style.display = 'none';
                // Cancelar, Voltar e Confirmar permanecem visíveis
                break;
        }
        
        // Forçar visibilidade imediata
        if (btnCancelar) {
            btnCancelar.style.visibility = 'visible';
            btnCancelar.style.opacity = '1';
        }
        
        if (this.stepAtual === 3 && btnConfirmar) {
            btnConfirmar.style.visibility = 'visible';
            btnConfirmar.style.opacity = '1';
        }
    }
    
    voltarStep() {
        if (this.stepAtual > 1) {
            this.mudarStep(this.stepAtual - 1);
        }
    }
    
    proximoStep() {
        if (this.stepAtual < 3) {
            this.mudarStep(this.stepAtual + 1);
        }
    }
    
    // ===========================================
    // CONFIGURAÇÃO DINÂMICA
    // ===========================================
    
    carregarConfiguracao(tipo) {
        console.log(`⚙️ Carregando configuração para: ${tipo}`);
        
        const configContainer = document.querySelector('#step2 .config-container');
        if (!configContainer) return;
        
        if (tipo === 'aliado') {
            this.carregarConfigAliado(configContainer);
        } else {
            this.carregarConfigOutros(tipo, configContainer);
        }
        
        // Configurar listeners para atualização em tempo real
        this.configurarListenersConfiguracao();
        
        // Calcular custos iniciais
        setTimeout(() => this.calcularECustos(), 100);
    }
    
    carregarConfigAliado(container) {
        const template = document.getElementById('template-aliado');
        if (template) {
            container.innerHTML = template.innerHTML;
            
            // Configurar listener para grupo
            const isGroupCheckbox = container.querySelector('#isGroup');
            const groupConfig = container.querySelector('#groupConfig');
            
            if (isGroupCheckbox && groupConfig) {
                isGroupCheckbox.addEventListener('change', (e) => {
                    groupConfig.style.display = e.target.checked ? 'block' : 'none';
                    this.calcularECustos();
                });
            }
            
            // Configurar listeners para rádios e checkboxes
            container.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(input => {
                input.addEventListener('change', () => this.calcularECustos());
            });
            
            // Configurar listener para select do grupo
            const groupSizeSelect = container.querySelector('#groupSize');
            if (groupSizeSelect) {
                groupSizeSelect.addEventListener('change', () => this.calcularECustos());
            }
            
            // Inicializar com valores padrão
            this.dadosTemporarios.poder = 25; // Valor padrão
            this.dadosTemporarios.modificadores = [];
            this.dadosTemporarios.grupo = false;
            this.dadosTemporarios.tamanhoGrupo = 1;
        }
    }
    
    carregarConfigOutros(tipo, container) {
        const template = document.getElementById('template-outros');
        if (template) {
            container.innerHTML = template.innerHTML;
            
            // Atualizar título
            const h4 = container.querySelector('h4');
            if (h4) {
                h4.innerHTML = `<i class="fas fa-${this.getIcone(tipo)}"></i> Configuração de ${this.getNomeTipo(tipo)}`;
            }
            
            // Configurar listener para select
            const powerSelect = container.querySelector('#otherPower');
            if (powerSelect) {
                powerSelect.addEventListener('change', () => this.calcularECustos());
                this.dadosTemporarios.poder = parseInt(powerSelect.value);
            }
        }
    }
    
    configurarListenersConfiguracao() {
        // Listeners para inputs de nome e descrição no step 3
        const relNome = document.getElementById('relNome');
        const relDescricao = document.getElementById('relDescricao');
        const relObservacoes = document.getElementById('relObservacoes');
        
        if (relNome) {
            relNome.addEventListener('input', (e) => {
                this.dadosTemporarios.nome = e.target.value;
            });
        }
        
        if (relDescricao) {
            relDescricao.addEventListener('input', (e) => {
                this.dadosTemporarios.descricao = e.target.value;
            });
        }
        
        if (relObservacoes) {
            relObservacoes.addEventListener('input', (e) => {
                this.dadosTemporarios.observacoes = e.target.value;
            });
        }
    }
    
    // ===========================================
    // CÁLCULO DE CUSTOS
    // ===========================================
    
    calcularECustos() {
        if (!this.tipoSelecionado) return;
        
        let custoBase = 0;
        let multiplicador = 1;
        let multiplicadorGrupo = 1;
        let modificadoresTexto = [];
        
        if (this.tipoSelecionado === 'aliado') {
            // Poder
            const powerRadio = document.querySelector('input[name="allyPower"]:checked');
            if (powerRadio) {
                const poder = parseInt(powerRadio.value);
                custoBase = this.config.aliados.custoBase[poder] || 0;
                this.dadosTemporarios.poder = poder;
            }
            
            // Modificadores
            const modCheckboxes = document.querySelectorAll('input[name="allyMods"]:checked');
            modificadoresTexto = [];
            
            modCheckboxes.forEach(mod => {
                const valorMod = this.config.aliados.modificadores[mod.value];
                if (valorMod) {
                    multiplicador *= valorMod;
                    
                    // Adicionar texto do modificador
                    let texto = '';
                    switch(mod.value) {
                        case 'invocavel': texto = 'Invocável (×2)'; break;
                        case 'lacaio': texto = 'Lacaio (×1.5)'; break;
                        case 'habilidades': texto = 'Habilidades (×1.5)'; break;
                        case 'afinidade': texto = 'Afinidade (×0.75)'; break;
                        case 'relutante': texto = 'Relutante (×0.5)'; break;
                    }
                    if (texto) modificadoresTexto.push(texto);
                }
            });
            
            this.dadosTemporarios.modificadores = Array.from(modCheckboxes).map(m => m.value);
            
            // Grupo
            const isGroupCheckbox = document.getElementById('isGroup');
            if (isGroupCheckbox?.checked) {
                const groupSizeSelect = document.getElementById('groupSize');
                if (groupSizeSelect) {
                    const tamanho = parseInt(groupSizeSelect.value);
                    
                    // Encontrar o multiplicador correto
                    for (const [limite, mult] of Object.entries(this.config.aliados.grupos)) {
                        if (tamanho <= parseInt(limite)) {
                            multiplicadorGrupo = mult;
                            break;
                        }
                    }
                    
                    this.dadosTemporarios.grupo = true;
                    this.dadosTemporarios.tamanhoGrupo = tamanho;
                }
            } else {
                this.dadosTemporarios.grupo = false;
                this.dadosTemporarios.tamanhoGrupo = 1;
            }
            
        } else if (this.tipoSelecionado === 'inimigo') {
            // Para inimigos, usar configuração básica
            const powerSelect = document.getElementById('otherPower');
            if (powerSelect) {
                custoBase = parseInt(powerSelect.value) * -1; // Negativo para inimigos
                this.dadosTemporarios.poder = parseInt(powerSelect.value);
            }
        } else {
            // Para outros tipos
            const powerSelect = document.getElementById('otherPower');
            if (powerSelect) {
                custoBase = parseInt(powerSelect.value);
                this.dadosTemporarios.poder = parseInt(powerSelect.value);
            }
        }
        
        // Calcular custo final (arredondar para cima para valores inteiros)
        const custoFinal = Math.ceil(custoBase * multiplicador * multiplicadorGrupo);
        
        // Atualizar dados temporários
        this.dadosTemporarios.custoBase = custoBase;
        this.dadosTemporarios.multiplicador = multiplicador;
        this.dadosTemporarios.multiplicadorGrupo = multiplicadorGrupo;
        this.dadosTemporarios.custoFinal = custoFinal;
        
        // Atualizar resumo no modal
        this.atualizarResumoModal(custoBase, modificadoresTexto, multiplicadorGrupo, custoFinal);
    }
    
    atualizarResumoModal(custoBase = 0, modificadoresTexto = [], multiplicadorGrupo = 1, custoFinal = 0) {
        // Tipo
        if (this.elementos.resumoTipo) {
            this.elementos.resumoTipo.textContent = this.getNomeTipo(this.tipoSelecionado) || '-';
        }
        
        // Custo Base
        if (this.elementos.resumoCustoBase) {
            this.elementos.resumoCustoBase.textContent = `${custoBase >= 0 ? '+' : ''}${custoBase} pts`;
            this.elementos.resumoCustoBase.style.color = custoBase >= 0 ? '#4caf50' : '#f44336';
        }
        
        // Modificadores
        if (this.elementos.resumoMods) {
            if (modificadoresTexto.length > 0) {
                this.elementos.resumoMods.textContent = modificadoresTexto.join(', ');
            } else {
                this.elementos.resumoMods.textContent = 'Nenhum';
            }
        }
        
        // Multiplicador Grupo
        if (this.elementos.resumoGrupo) {
            if (multiplicadorGrupo > 1) {
                this.elementos.resumoGrupo.textContent = `×${multiplicadorGrupo}`;
            } else {
                this.elementos.resumoGrupo.textContent = '×1';
            }
        }
        
        // Total
        if (this.elementos.resumoTotal) {
            this.elementos.resumoTotal.textContent = `${custoFinal >= 0 ? '+' : ''}${custoFinal} pts`;
            
            // Colorir conforme o valor
            if (custoFinal > 0) {
                this.elementos.resumoTotal.style.color = '#4caf50';
                this.elementos.resumoTotal.style.fontWeight = 'bold';
            } else if (custoFinal < 0) {
                this.elementos.resumoTotal.style.color = '#f44336';
                this.elementos.resumoTotal.style.fontWeight = 'bold';
            } else {
                this.elementos.resumoTotal.style.color = 'var(--text-gold)';
                this.elementos.resumoTotal.style.fontWeight = 'bold';
            }
        }
    }
    
    // ===========================================
    // SALVAR RELACIONAMENTO
    // ===========================================
    
    salvarRelacionamento() {
        // Coletar dados finais
        const nome = document.getElementById('relNome')?.value.trim();
        const descricao = document.getElementById('relDescricao')?.value.trim();
        const observacoes = document.getElementById('relObservacoes')?.value.trim();
        
        // Validação básica
        if (!nome) {
            alert('Digite o nome do relacionamento');
            document.getElementById('relNome')?.focus();
            return;
        }
        
        if (!this.tipoSelecionado) {
            alert('Selecione um tipo de relacionamento');
            return;
        }
        
        // Garantir que temos os dados de custo
        if (typeof this.dadosTemporarios.custoFinal === 'undefined') {
            this.calcularECustos();
        }
        
        // Criar objeto do relacionamento
        const relacionamento = {
            id: this.relacionamentoEmEdicao || `${this.tipoSelecionado}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            tipo: this.tipoSelecionado,
            nome: nome,
            descricao: descricao || '',
            observacoes: observacoes || '',
            config: { ...this.dadosTemporarios },
            custo: this.dadosTemporarios.custoFinal || 0,
            criadoEm: this.relacionamentoEmEdicao ? this.obterDataExistente(this.relacionamentoEmEdicao) : new Date().toISOString(),
            atualizadoEm: new Date().toISOString()
        };
        
        // Limpar dados temporários de cálculo do objeto salvo
        delete relacionamento.config.custoBase;
        delete relacionamento.config.multiplicador;
        delete relacionamento.config.multiplicadorGrupo;
        delete relacionamento.config.custoFinal;
        
        // Se estiver editando, remover o antigo
        if (this.relacionamentoEmEdicao) {
            this.relacionamentos = this.relacionamentos.filter(r => r.id !== this.relacionamentoEmEdicao);
        }
        
        // Adicionar à lista
        this.relacionamentos.push(relacionamento);
        
        // Salvar e atualizar
        this.salvarNoLocalStorage();
        this.atualizarLista();
        this.fecharModal();
        
        console.log('✅ Relacionamento salvo:', relacionamento);
        
        // Mostrar confirmação
        const custo = relacionamento.custo;
        const tipoNome = this.getNomeTipo(this.tipoSelecionado);
        const acao = this.relacionamentoEmEdicao ? 'atualizado' : 'adicionado';
        alert(`${tipoNome} "${nome}" ${acao} com sucesso!\nCusto: ${custo >= 0 ? '+' : ''}${custo} pontos`);
    }
    
    obterDataExistente(id) {
        const existente = this.relacionamentos.find(r => r.id === id);
        return existente ? existente.criadoEm : new Date().toISOString();
    }
    
    // ===========================================
    // LISTA DE RELACIONAMENTOS
    // ===========================================
    
    atualizarLista() {
        if (!this.elementos.lista) return;
        
        // Se não houver relacionamentos
        if (this.relacionamentos.length === 0) {
            this.elementos.lista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Nenhum relacionamento adicionado</p>
                    <small>Clique em "Adicionar Relacionamento" para começar</small>
                </div>
            `;
            
            // Zerar contadores
            this.atualizarContadores();
            return;
        }
        
        // Gerar HTML para cada relacionamento
        let html = '';
        let contadores = {
            aliados: 0,
            contatos: 0,
            inimigos: 0,
            patronos: 0,
            dependentes: 0
        };
        let totalPontos = 0;
        
        this.relacionamentos.forEach(rel => {
            contadores[rel.tipo]++;
            totalPontos += rel.custo || 0;
            
            html += this.getHTMLRelacionamento(rel);
        });
        
        this.elementos.lista.innerHTML = html;
        
        // Atualizar contadores
        this.atualizarContadores(contadores, totalPontos);
    }
    
    getHTMLRelacionamento(rel) {
        const icone = this.getIcone(rel.tipo);
        const tipoNome = this.getNomeTipo(rel.tipo);
        const custoFormatado = rel.custo >= 0 ? `+${rel.custo}` : rel.custo;
        
        let detalhesHTML = '';
        
        if (rel.tipo === 'aliado' && rel.config) {
            const poder = rel.config.poder ? `${rel.config.poder}%` : 'N/A';
            const grupo = rel.config.grupo && rel.config.tamanhoGrupo > 1 ? 
                `Grupo: ${rel.config.tamanhoGrupo} membros` : null;
            const modCount = rel.config.modificadores?.length || 0;
            
            detalhesHTML = `
                <div class="relacionamento-detalhes">
                    <span><i class="fas fa-chart-line"></i> Poder: ${poder}</span>
                    ${grupo ? `<span><i class="fas fa-users"></i> ${grupo}</span>` : ''}
                    ${modCount > 0 ? `<span><i class="fas fa-magic"></i> ${modCount} mod.</span>` : ''}
                </div>
            `;
        }
        
        return `
            <div class="relacionamento-item" data-id="${rel.id}" data-tipo="${rel.tipo}">
                <div class="relacionamento-header">
                    <div class="relacionamento-tipo ${rel.tipo}">
                        <i class="fas fa-${icone}"></i>
                        ${tipoNome.toUpperCase()}
                    </div>
                    <div class="relacionamento-nome">
                        ${rel.nome}
                    </div>
                    <div class="relacionamento-custo">
                        ${custoFormatado} pts
                    </div>
                </div>
                
                ${rel.descricao ? `<div class="relacionamento-descricao">${rel.descricao}</div>` : ''}
                
                ${detalhesHTML}
                
                ${rel.observacoes ? `<div class="relacionamento-observacoes"><small><i class="fas fa-info-circle"></i> ${rel.observacoes}</small></div>` : ''}
                
                <div class="relacionamento-acoes">
                    <button class="btn-edit" onclick="sistemaRelacionamentos.editarRelacionamento('${rel.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-delete" onclick="sistemaRelacionamentos.excluirRelacionamento('${rel.id}')">
                        <i class="fas fa-trash"></i> Remover
                    </button>
                </div>
            </div>
        `;
    }
    
    atualizarContadores(contadores = null, totalPontos = 0) {
        if (contadores) {
            // Atualizar contadores específicos
            Object.keys(contadores).forEach(tipo => {
                const el = this.elementos.contadores[tipo];
                if (el) el.textContent = contadores[tipo];
            });
        } else {
            // Zerar todos os contadores
            Object.values(this.elementos.contadores).forEach(el => {
                if (el) el.textContent = '0';
            });
        }
        
        // Atualizar total
        if (this.elementos.contadores.total) {
            this.elementos.contadores.total.textContent = `${totalPontos >= 0 ? '+' : ''}${totalPontos} pts`;
        }
        
        // Atualizar resumo geral
        const totalResumo = document.getElementById('totalRelacionamentosResumo');
        if (totalResumo) {
            totalResumo.textContent = totalPontos >= 0 ? `+${totalPontos}` : totalPontos;
            
            // Atualizar total geral da aba
            this.atualizarTotalGeral();
        }
    }
    
    atualizarTotalGeral() {
        try {
            const totalAtributos = parseInt(document.getElementById('totalAtributos')?.textContent || 0);
            const totalStatusRep = parseInt(document.getElementById('totalStatusRep')?.textContent || 0);
            const totalRelacionamentos = parseInt(document.getElementById('totalRelacionamentosResumo')?.textContent || 0);
            
            const totalGeral = totalAtributos + totalStatusRep + totalRelacionamentos;
            const totalGeralElement = document.getElementById('totalGeral');
            
            if (totalGeralElement) {
                totalGeralElement.textContent = totalGeral >= 0 ? `+${totalGeral}` : totalGeral;
            }
        } catch (error) {
            console.error('Erro ao atualizar total geral:', error);
        }
    }
    
    // ===========================================
    // FILTROS
    // ===========================================
    
    filtrarRelacionamentos(filtro) {
        // Atualizar botões de filtro ativos
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const btnAtivo = document.querySelector(`.filter-btn[data-filter="${filtro}"]`);
        if (btnAtivo) {
            btnAtivo.classList.add('active');
        }
        
        // Mostrar/ocultar relacionamentos
        const todosItens = document.querySelectorAll('.relacionamento-item');
        
        todosItens.forEach(item => {
            if (filtro === 'all' || item.dataset.tipo === filtro) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    // ===========================================
    // CRUD OPERATIONS
    // ===========================================
    
    editarRelacionamento(id) {
        console.log('✏️ Editando relacionamento:', id);
        
        const relacionamento = this.relacionamentos.find(r => r.id === id);
        if (!relacionamento) {
            alert('Relacionamento não encontrado');
            return;
        }
        
        // Guardar ID para edição
        this.relacionamentoEmEdicao = id;
        
        // Preencher modal com dados existentes
        this.abrirModal();
        
        // Selecionar tipo
        setTimeout(() => {
            this.selecionarTipo(relacionamento.tipo);
            
            // Preencher dados
            setTimeout(() => {
                // Preencher step 3
                const relNome = document.getElementById('relNome');
                const relDescricao = document.getElementById('relDescricao');
                const relObservacoes = document.getElementById('relObservacoes');
                
                if (relNome) relNome.value = relacionamento.nome;
                if (relDescricao) relDescricao.value = relacionamento.descricao || '';
                if (relObservacoes) relObservacoes.value = relacionamento.observacoes || '';
                
                // Para aliados, preencher configurações
                if (relacionamento.tipo === 'aliado' && relacionamento.config) {
                    setTimeout(() => {
                        // Poder
                        const powerRadio = document.querySelector(`input[name="allyPower"][value="${relacionamento.config.poder}"]`);
                        if (powerRadio) powerRadio.checked = true;
                        
                        // Modificadores
                        if (relacionamento.config.modificadores) {
                            relacionamento.config.modificadores.forEach(modValue => {
                                const modCheckbox = document.querySelector(`input[name="allyMods"][value="${modValue}"]`);
                                if (modCheckbox) modCheckbox.checked = true;
                            });
                        }
                        
                        // Grupo
                        if (relacionamento.config.grupo) {
                            const isGroupCheckbox = document.getElementById('isGroup');
                            const groupSizeSelect = document.getElementById('groupSize');
                            
                            if (isGroupCheckbox) {
                                isGroupCheckbox.checked = true;
                                const groupConfig = document.getElementById('groupConfig');
                                if (groupConfig) groupConfig.style.display = 'block';
                            }
                            
                            if (groupSizeSelect && relacionamento.config.tamanhoGrupo) {
                                groupSizeSelect.value = relacionamento.config.tamanhoGrupo;
                            }
                        }
                        
                        // Calcular custos
                        setTimeout(() => this.calcularECustos(), 200);
                    }, 300);
                } else if (relacionamento.config && relacionamento.config.poder) {
                    // Para outros tipos
                    setTimeout(() => {
                        const powerSelect = document.getElementById('otherPower');
                        if (powerSelect) {
                            powerSelect.value = relacionamento.config.poder;
                            this.calcularECustos();
                        }
                    }, 300);
                }
                
                // Ir para step 3
                this.mudarStep(3);
                
            }, 500);
        }, 100);
    }
    
    excluirRelacionamento(id) {
        if (!confirm('Tem certeza que deseja remover este relacionamento?')) {
            return;
        }
        
        this.relacionamentos = this.relacionamentos.filter(rel => rel.id !== id);
        this.salvarNoLocalStorage();
        this.atualizarLista();
        
        alert('Relacionamento removido com sucesso!');
    }
    
    // ===========================================
    // UTILITÁRIOS
    // ===========================================
    
    getIcone(tipo) {
        switch(tipo) {
            case 'aliado': return 'shield-alt';
            case 'inimigo': return 'skull-crossbones';
            case 'contato': return 'network-wired';
            case 'patrono': return 'crown';
            case 'dependente': return 'heart';
            default: return 'user';
        }
    }
    
    getNomeTipo(tipo) {
        switch(tipo) {
            case 'aliado': return 'Aliado';
            case 'inimigo': return 'Inimigo';
            case 'contato': return 'Contato';
            case 'patrono': return 'Patrono';
            case 'dependente': return 'Dependente';
            default: return tipo;
        }
    }
    
    // ===========================================
    // PERSISTÊNCIA
    // ===========================================
    
    salvarNoLocalStorage() {
        const dados = {
            relacionamentos: this.relacionamentos,
            timestamp: new Date().toISOString(),
            version: '2.0'
        };
        
        try {
            localStorage.setItem('vantagensRelacionamentos', JSON.stringify(dados));
            console.log('💾 Dados salvos:', this.relacionamentos.length, 'relacionamentos');
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
        }
    }
    
    carregarDoLocalStorage() {
        try {
            const dados = localStorage.getItem('vantagensRelacionamentos');
            if (dados) {
                const parsed = JSON.parse(dados);
                
                // Migração de versão antiga se necessário
                if (parsed.version === '2.0') {
                    this.relacionamentos = parsed.relacionamentos || [];
                } else {
                    // Converter da versão antiga
                    this.relacionamentos = this.migrarDadosAntigos(parsed.relacionamentos || []);
                }
                
                console.log('📂 Dados carregados:', this.relacionamentos.length, 'relacionamentos');
            }
        } catch (error) {
            console.error('❌ Erro ao carregar:', error);
            this.relacionamentos = [];
        }
    }
    
    migrarDadosAntigos(dadosAntigos) {
        return dadosAntigos.map(item => {
            // Converter estrutura antiga para nova
            return {
                id: item.id || `${item.tipo}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                tipo: item.tipo,
                nome: item.nome,
                descricao: item.descricao || '',
                observacoes: item.observacoes || '',
                config: item.config || {},
                custo: item.custo || 0,
                criadoEm: item.criadoEm || new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            };
        });
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

let sistemaRelacionamentos = null;

// Inicializa quando a DOM estiver pronta
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - inicializando sistema de relacionamentos');
    
    // Pequeno delay para garantir que tudo carregou
    setTimeout(() => {
        if (!sistemaRelacionamentos) {
            sistemaRelacionamentos = new SistemaRelacionamentos();
            window.sistemaRelacionamentos = sistemaRelacionamentos;
        }
    }, 100);
});

// Inicializa quando a aba de Vantagens é ativada
function onVantagensTabActivated() {
    if (!sistemaRelacionamentos) {
        sistemaRelacionamentos = new SistemaRelacionamentos();
        window.sistemaRelacionamentos = sistemaRelacionamentos;
    }
}

// Exporta para uso global
window.SistemaRelacionamentos = SistemaRelacionamentos;
window.initSistemaRelacionamentos = () => {
    sistemaRelacionamentos = new SistemaRelacionamentos();
    window.sistemaRelacionamentos = sistemaRelacionamentos;
};
window.onVantagensTabActivated = onVantagensTabActivated;