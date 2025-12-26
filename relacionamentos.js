// ===========================================
// SISTEMA DE RELACIONAMENTOS - GURPS CORRETO
// ===========================================

class SistemaRelacionamentos {
    constructor() {
        console.log('🏗️ Sistema de Relacionamentos iniciado');
        
        this.relacionamentos = [];
        
        // Configuração CORRETA GURPS
        this.config = {
            aliados: {
                custoBase: {
                    25: 1,   // 25% = 1 ponto
                    50: 2,   // 50% = 2 pontos
                    75: 3,   // 75% = 3 pontos
                    100: 5,  // 100% = 5 pontos
                    150: 10  // 150% = 10 pontos (máximo)
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
            }
        };
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
        
        // Seleção de tipo no modal
        document.querySelectorAll('.tipo-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selecionarTipo(e.currentTarget.dataset.tipo);
            });
        });
        
        // Botões Confirmar e Cancelar
        document.getElementById('btnConfirmar')?.addEventListener('click', () => this.salvarAliado());
        document.getElementById('btnCancelar')?.addEventListener('click', () => this.fecharModal());
    }
    
    // ===========================================
    // MODAL - CONTROLE
    // ===========================================
    
    abrirModal() {
        console.log('📝 Abrindo modal de relacionamentos');
        
        // Mostrar modal
        if (this.elementos.modal) {
            this.elementos.modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
        // Resetar para step 1
        this.mudarStep(1);
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
        
        // Ir para configuração
        setTimeout(() => {
            this.carregarConfiguracao(tipo);
        }, 300);
    }
    
    desselecionarTipos() {
        document.querySelectorAll('.tipo-option').forEach(option => {
            option.classList.remove('selected');
        });
    }
    
    // ===========================================
    // CONFIGURAÇÃO DINÂMICA
    // ===========================================
    
    mudarStep(stepNum) {
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
        this.atualizarBotoes(stepNum);
    }
    
    atualizarBotoes(stepAtual) {
        const btnPrev = document.getElementById('btnPrev');
        const btnNext = document.getElementById('btnNext');
        const btnConfirmar = document.getElementById('btnConfirmar');
        const btnCancelar = document.getElementById('btnCancelar');
        
        if (stepAtual === 1) {
            // Primeiro passo: escolher tipo
            if (btnPrev) btnPrev.style.display = 'none';
            if (btnNext) btnNext.style.display = 'none';
            if (btnConfirmar) btnConfirmar.style.display = 'none';
            if (btnCancelar) btnCancelar.style.display = 'inline-block';
        } else if (stepAtual === 2) {
            // Segundo passo: configuração
            if (btnPrev) btnPrev.style.display = 'inline-block';
            if (btnNext) btnNext.style.display = 'none';
            if (btnConfirmar) btnConfirmar.style.display = 'inline-block';
            if (btnCancelar) btnCancelar.style.display = 'inline-block';
        }
    }
    
    carregarConfiguracao(tipo) {
        console.log(`⚙️ Carregando configuração para: ${tipo}`);
        
        const step2 = document.getElementById('step2');
        if (!step2) return;
        
        if (tipo === 'aliado') {
            step2.innerHTML = this.getHTMLConfigAliado();
            this.setupControlesAliado();
            this.mudarStep(2);
        } else {
            // Para outros tipos, só mostra mensagem por enquanto
            step2.innerHTML = `
                <div class="config-placeholder">
                    <i class="fas fa-tools"></i>
                    <h4>Configuração de ${tipo}</h4>
                    <p>Em desenvolvimento...</p>
                    <button class="btn-cancelar" onclick="sistemaRelacionamentos.mudarStep(1)">
                        <i class="fas fa-arrow-left"></i> Voltar
                    </button>
                </div>
            `;
            this.mudarStep(2);
        }
    }
    
    getHTMLConfigAliado() {
        return `
            <div class="ally-config">
                <h4><i class="fas fa-shield-alt"></i> Configuração do Aliado</h4>
                
                <div class="form-group">
                    <label for="allyName">Nome do Aliado:</label>
                    <input type="text" id="allyName" class="form-control" 
                           placeholder="Ex: Sir Galhard, Cavaleiro Leal">
                </div>
                
                <div class="form-group">
                    <label for="allyDescription">Descrição:</label>
                    <textarea id="allyDescription" class="form-control" rows="3" 
                              placeholder="Descreva o aliado, sua história, aparência..."></textarea>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-chart-line"></i> Poder do Aliado</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="allyPower" value="25" checked>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>25%</strong> dos seus pontos <em>(1 ponto)</em>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="50">
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>50%</strong> dos seus pontos <em>(2 pontos)</em>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="75">
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>75%</strong> dos seus pontos <em>(3 pontos)</em>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="100">
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>100%</strong> dos seus pontos <em>(5 pontos)</em>
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyPower" value="150">
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>150%</strong> dos seus pontos <em>(10 pontos)</em>
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-calendar-alt"></i> Frequência de Aparição</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="allyFrequency" value="15" checked>
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Quase sempre</strong> (15 ou menos)
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyFrequency" value="12">
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Frequentemente</strong> (12 ou menos)
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyFrequency" value="9">
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Ocasionalmente</strong> (9 ou menos)
                            </span>
                        </label>
                        <label>
                            <input type="radio" name="allyFrequency" value="6">
                            <span class="radio-custom"></span>
                            <span class="radio-text">
                                <strong>Raramente</strong> (6 ou menos)
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-magic"></i> Modificadores Especiais</label>
                    <div class="checkbox-group">
                        <label>
                            <input type="checkbox" name="allyMods" value="invocavel">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Invocável</strong> (+100%)
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="lacaio">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Lacaio</strong> (+50%)
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="habilidades">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Habilidades Especiais</strong> (+50%)
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="afinidade">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Afinidade</strong> (-25%)
                            </span>
                        </label>
                        <label>
                            <input type="checkbox" name="allyMods" value="relutante">
                            <span class="checkbox-custom"></span>
                            <span class="checkbox-text">
                                <strong>Relutante</strong> (-50%)
                            </span>
                        </label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="isGroup">
                        <span class="checkbox-custom"></span>
                        <span class="checkbox-text">
                            <strong>É um grupo de aliados?</strong>
                        </span>
                    </label>
                    
                    <div id="groupConfig" style="display: none; margin-top: 10px;">
                        <label>Tamanho do Grupo:</label>
                        <select id="groupSize" class="form-control">
                            <option value="1">Individual (x1)</option>
                            <option value="6">6-10 membros (x6)</option>
                            <option value="11">11-20 membros (x8)</option>
                            <option value="21">21-50 membros (x10)</option>
                            <option value="51">51-100 membros (x12)</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    setupControlesAliado() {
        // Grupo
        const isGroupCheckbox = document.getElementById('isGroup');
        if (isGroupCheckbox) {
            isGroupCheckbox.addEventListener('change', (e) => {
                const groupConfig = document.getElementById('groupConfig');
                if (groupConfig) {
                    groupConfig.style.display = e.target.checked ? 'block' : 'none';
                }
            });
        }
    }
    
    // ===========================================
    // SALVAR ALIADO
    // ===========================================
    
    salvarAliado() {
        // Coletar dados
        const nome = document.getElementById('allyName')?.value.trim();
        const descricao = document.getElementById('allyDescription')?.value.trim();
        const poder = document.querySelector('input[name="allyPower"]:checked')?.value;
        const frequencia = document.querySelector('input[name="allyFrequency"]:checked')?.value;
        
        // Validação básica
        if (!nome) {
            alert('Digite o nome do aliado');
            return;
        }
        
        if (!poder) {
            alert('Selecione o poder do aliado');
            return;
        }
        
        // Calcular custo base
        let custoBase = this.config.aliados.custoBase[poder] || 0;
        
        // Aplicar modificadores
        let multiplicador = 1;
        const modificadores = document.querySelectorAll('input[name="allyMods"]:checked');
        modificadores.forEach(mod => {
            switch(mod.value) {
                case 'invocavel': multiplicador += 1.0; break;    // +100%
                case 'lacaio': multiplicador += 0.5; break;      // +50%
                case 'habilidades': multiplicador += 0.5; break; // +50%
                case 'afinidade': multiplicador -= 0.25; break;  // -25%
                case 'relutante': multiplicador -= 0.5; break;   // -50%
            }
        });
        
        // Aplicar grupo
        const isGroup = document.getElementById('isGroup')?.checked;
        let tamanhoGrupo = 1;
        if (isGroup) {
            tamanhoGrupo = parseInt(document.getElementById('groupSize')?.value || 1);
            let multiplicadorGrupo = 1;
            if (tamanhoGrupo <= 5) multiplicadorGrupo = 1;
            else if (tamanhoGrupo <= 10) multiplicadorGrupo = 6;
            else if (tamanhoGrupo <= 20) multiplicadorGrupo = 8;
            else if (tamanhoGrupo <= 50) multiplicadorGrupo = 10;
            else if (tamanhoGrupo <= 100) multiplicadorGrupo = 12;
            else multiplicadorGrupo = 12 + Math.floor(Math.log10(tamanhoGrupo/100)) * 6;
            
            multiplicador *= multiplicadorGrupo;
        }
        
        // Calcular custo final (arredonda para cima)
        let custoFinal = Math.ceil(custoBase * multiplicador);
        
        // Criar objeto aliado
        const aliado = {
            id: 'ally_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            tipo: 'aliado',
            nome: nome,
            descricao: descricao,
            config: {
                poder: parseInt(poder),
                frequencia: parseInt(frequencia),
                modificadores: Array.from(modificadores).map(m => m.value),
                grupo: isGroup,
                tamanhoGrupo: tamanhoGrupo
            },
            custo: custoFinal,
            criadoEm: new Date().toISOString()
        };
        
        // Adicionar à lista
        this.relacionamentos.push(aliado);
        
        // Salvar e atualizar
        this.salvarNoLocalStorage();
        this.atualizarLista();
        this.fecharModal();
        
        console.log('✅ Aliado salvo:', aliado);
        alert('Aliado adicionado com sucesso! Custo: ' + custoFinal + ' pontos');
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
            Object.values(this.elementos.contadores).forEach(el => {
                if (el) el.textContent = '0';
            });
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
            
            html += `
                <div class="relacionamento-item" data-id="${rel.id}">
                    <div class="relacionamento-header">
                        <div class="relacionamento-tipo ${rel.tipo}">
                            <i class="fas fa-${this.getIcone(rel.tipo)}"></i>
                            ${rel.tipo.toUpperCase()}
                        </div>
                        <div class="relacionamento-nome">
                            ${rel.nome}
                        </div>
                        <div class="relacionamento-custo">
                            ${rel.custo >= 0 ? '+' : ''}${rel.custo} pts
                        </div>
                    </div>
                    
                    <div class="relacionamento-descricao">
                        ${rel.descricao || 'Sem descrição'}
                    </div>
                    
                    ${this.getDetalhes(rel)}
                    
                    <div class="relacionamento-acoes">
                        <button class="btn-edit" onclick="sistemaRelacionamentos.editar('${rel.id}')">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn-delete" onclick="sistemaRelacionamentos.excluir('${rel.id}')">
                            <i class="fas fa-trash"></i> Remover
                        </button>
                    </div>
                </div>
            `;
        });
        
        this.elementos.lista.innerHTML = html;
        
        // Atualizar contadores
        Object.keys(contadores).forEach(tipo => {
            const el = this.elementos.contadores[tipo];
            if (el) el.textContent = contadores[tipo];
        });
        
        // Atualizar total
        if (this.elementos.contadores.total) {
            this.elementos.contadores.total.textContent = `${totalPontos >= 0 ? '+' : ''}${totalPontos} pts`;
        }
        
        // Atualizar resumo geral
        const totalResumo = document.getElementById('totalRelacionamentosResumo');
        if (totalResumo) {
            totalResumo.textContent = totalPontos >= 0 ? `+${totalPontos}` : totalPontos;
        }
    }
    
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
    
    getDetalhes(rel) {
        if (rel.tipo === 'aliado') {
            const freqText = {
                15: 'Quase sempre',
                12: 'Frequentemente',
                9: 'Ocasionalmente',
                6: 'Raramente'
            };
            
            return `
                <div class="relacionamento-detalhes">
                    <span><i class="fas fa-chart-line"></i> Poder: ${rel.config.poder}%</span>
                    <span><i class="fas fa-calendar-alt"></i> ${freqText[rel.config.frequencia] || 'N/A'}</span>
                    ${rel.config.grupo ? `<span><i class="fas fa-users"></i> Grupo: ${rel.config.tamanhoGrupo} membros</span>` : ''}
                </div>
            `;
        }
        return '';
    }
    
    editar(id) {
        console.log('✏️ Editando:', id);
        // Implementar edição
        alert('Edição em desenvolvimento...');
    }
    
    excluir(id) {
        if (!confirm('Tem certeza que deseja remover este relacionamento?')) {
            return;
        }
        
        this.relacionamentos = this.relacionamentos.filter(rel => rel.id !== id);
        this.salvarNoLocalStorage();
        this.atualizarLista();
        alert('Relacionamento removido');
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
        console.log('💾 Dados salvos');
    }
    
    carregarDoLocalStorage() {
        try {
            const dados = localStorage.getItem('vantagensRelacionamentos');
            if (dados) {
                const parsed = JSON.parse(dados);
                this.relacionamentos = parsed.relacionamentos || [];
                console.log('📂 Dados carregados:', this.relacionamentos.length);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar:', error);
        }
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

let sistemaRelacionamentos = null;

// Inicializa quando a DOM estiver pronta
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM carregado - inicializando relacionamentos');
    
    // Pequeno delay para garantir que tudo carregou
    setTimeout(() => {
        sistemaRelacionamentos = new SistemaRelacionamentos();
        window.sistemaRelacionamentos = sistemaRelacionamentos;
    }, 500);
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
window.initSistemaRelacionamentos = () => sistemaRelacionamentos = new SistemaRelacionamentos();
window.onVantagensTabActivated = onVantagensTabActivated;