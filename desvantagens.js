// desvantagens.js - SISTEMA COMPLETO DE DESVANTAGENS
class DesvantagensSystem {
    constructor() {
        this.desvantagensAdquiridas = [];
        this.filtroAtual = 'todos';
        this.desvantagemAtual = null;
        this.modalAberto = false;
        this.init();
    }

    init() {
        console.log('Iniciando sistema de desvantagens...');
        this.carregarCatalogoNaTela();
        this.setupEventListeners();
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
    }

    carregarCatalogoNaTela() {
        const container = document.querySelector('.lista-desvantagens-scroll');
        if (!container) {
            console.error('Container .lista-desvantagens-scroll não encontrado!');
            return;
        }
        
        const desvantagens = filtrarDesvantagens(this.filtroAtual);
        console.log(`Carregando ${desvantagens.length} desvantagens...`);
        
        container.innerHTML = '';
        
        if (desvantagens.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma desvantagem encontrada</p>
                    <small>Tente outro filtro ou busca</small>
                </div>
            `;
            return;
        }
        
        desvantagens.forEach(desvantagem => {
            const div = this.criarElementoDesvantagem(desvantagem);
            container.appendChild(div);
        });
        
        this.atualizarContadorDesvantagens(desvantagens.length);
    }

    criarElementoDesvantagem(desvantagem) {
        const div = document.createElement('div');
        div.className = 'desvantagem-linha';
        div.dataset.id = desvantagem.id;
        div.dataset.categorias = `${desvantagem.categoria},${desvantagem.tipo}`;
        
        let tipoTexto = '';
        if (desvantagem.tipo === 'opcoes') {
            tipoTexto = 'Com Opções';
        } else if (desvantagem.tipo === 'selecao') {
            tipoTexto = 'Seleção Múltipla';
        } else {
            tipoTexto = `${Math.abs(desvantagem.custoBase)} pts`;
        }
        
        const icone = desvantagem.icone || 'fa-exclamation-triangle';
        
        div.innerHTML = `
            <div class="desvantagem-info">
                <i class="fas ${icone}"></i>
                <div>
                    <strong>${desvantagem.nome}</strong>
                    <small>${this.formatarCategoria(desvantagem.categoria)} • ${tipoTexto}</small>
                </div>
            </div>
            <button class="btn-adicionar-desvantagem" data-desvantagem-id="${desvantagem.id}">
                <i class="fas fa-plus"></i>
            </button>
        `;
        
        return div;
    }

    setupEventListeners() {
        console.log('Configurando event listeners para desvantagens...');
        
        // Filtros - usando event delegation
        document.addEventListener('click', (e) => {
            // Filtros de desvantagens
            if (e.target.classList.contains('filtro-btn-desvantagens') || e.target.closest('.filtro-btn-desvantagens')) {
                const btn = e.target.classList.contains('filtro-btn-desvantagens') ? e.target : e.target.closest('.filtro-btn-desvantagens');
                const filtro = btn.dataset.filtro;
                console.log(`Filtro selecionado: ${filtro}`);
                
                document.querySelectorAll('.filtro-btn-desvantagens').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filtroAtual = filtro;
                this.carregarCatalogoNaTela();
                return;
            }
            
            // Botão de adicionar desvantagem
            if (e.target.classList.contains('btn-adicionar-desvantagem') || e.target.closest('.btn-adicionar-desvantagem')) {
                const btn = e.target.classList.contains('btn-adicionar-desvantagem') ? e.target : e.target.closest('.btn-adicionar-desvantagem');
                const idDesvantagem = btn.dataset.desvantagemId;
                console.log(`Tentando abrir modal para: ${idDesvantagem}`);
                this.abrirModalDesvantagem(idDesvantagem);
                return;
            }
            
            // Botão de remover desvantagem
            if (e.target.classList.contains('btn-remover-desvantagem') || e.target.closest('.btn-remover-desvantagem')) {
                const btn = e.target.classList.contains('btn-remover-desvantagem') ? e.target : e.target.closest('.btn-remover-desvantagem');
                const index = parseInt(btn.dataset.index);
                console.log(`Removendo desvantagem no índice: ${index}`);
                this.removerDesvantagem(index);
                return;
            }
        });

        // Busca de desvantagens
        const buscaInput = document.getElementById('buscaDesvantagens');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                const termo = e.target.value.trim();
                console.log(`Buscando desvantagens: "${termo}"`);
                this.filtrarPorTexto(termo);
            });
        }

        // Eventos do modal (configurados quando o modal é aberto)
        this.setupModalEventDelegation();
    }

    setupModalEventDelegation() {
        document.addEventListener('click', (e) => {
            if (!this.modalAberto) return;
            
            // Fechar modal
            if (e.target.classList.contains('modal-close-desvantagem') || 
                e.target.classList.contains('btn-cancelar-desvantagem')) {
                console.log('Fechando modal de desvantagem...');
                this.fecharModal();
                return;
            }
            
            // Confirmar desvantagem
            if (e.target.classList.contains('btn-confirmar-desvantagem')) {
                console.log('Confirmando adição da desvantagem...');
                this.confirmarDesvantagem();
                return;
            }
            
            // Atualizar cálculo de custo
            const modal = document.getElementById('modalDesvantagem');
            if (modal && modal.contains(e.target)) {
                if (e.target.name === 'opcao-alcoolismo' || 
                    e.target.name === 'fobia' ||
                    e.target.type === 'checkbox') {
                    this.atualizarCalculoCusto();
                }
            }
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modalDesvantagem');
            if (this.modalAberto && e.target === modal) {
                console.log('Clicou fora do modal, fechando...');
                this.fecharModal();
            }
        });
    }

    abrirModalDesvantagem(idDesvantagem) {
        console.log(`Abrindo modal para desvantagem ID: ${idDesvantagem}`);
        
        const desvantagem = getDesvantagemPorId(idDesvantagem);
        if (!desvantagem) {
            console.error(`Desvantagem não encontrada: ${idDesvantagem}`);
            this.mostrarFeedback('❌ Desvantagem não encontrada!');
            return;
        }
        
        this.desvantagemAtual = desvantagem;
        
        const modal = document.getElementById('modalDesvantagem');
        if (!modal) {
            console.error('Modal #modalDesvantagem não encontrado no DOM!');
            return;
        }
        
        let conteudoModal = '';
        
        if (!desvantagem.configuracao) {
            // Desvantagem simples (Altruísmo)
            conteudoModal = this.criarModalSimples(desvantagem);
        } else {
            // Desvantagem com configuração
            switch(desvantagem.configuracao.tipo) {
                case 'opcoes-multiplas': // Alcoolismo
                    conteudoModal = this.criarModalOpcoesMultiplas(desvantagem);
                    break;
                case 'selecao-multipla': // Fobias
                    conteudoModal = this.criarModalSelecaoMultipla(desvantagem);
                    break;
                default:
                    conteudoModal = this.criarModalSimples(desvantagem);
            }
        }
        
        // Limpar e inserir conteúdo
        const modalContent = modal.querySelector('.desvantagem-modal');
        if (!modalContent) {
            console.error('Elemento .desvantagem-modal não encontrado no modal!');
            return;
        }
        
        modalContent.innerHTML = conteudoModal;
        modal.style.display = 'flex';
        modal.classList.add('active');
        this.modalAberto = true;
        
        console.log('Modal de desvantagem aberto com sucesso');
        
        // Inicializar cálculo de custo se necessário
        if (desvantagem.configuracao) {
            this.atualizarCalculoCusto();
        }
    }

    criarModalSimples(desvantagem) {
        return `
            <div class="modal-header">
                <h3><i class="fas ${desvantagem.icone}"></i> ${desvantagem.nome}</h3>
                <button class="modal-close-desvantagem">&times;</button>
            </div>
            <div class="modal-body">
                <div class="desvantagem-descricao">
                    <p>${desvantagem.descricao}</p>
                </div>
                <div class="modal-custo-simples">
                    <h4><i class="fas fa-coins"></i> Custo: ${Math.abs(desvantagem.custoBase)} pontos</h4>
                    <small class="text-negativo">Valor negativo (desvantagem)</small>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancelar-desvantagem">Cancelar</button>
                <button class="btn-confirmar-desvantagem" data-custo-final="${desvantagem.custoBase}">
                    Adicionar por ${desvantagem.custoBase} pts
                </button>
            </div>
        `;
    }

    criarModalOpcoesMultiplas(desvantagem) {
        const config = desvantagem.configuracao;
        let opcoesHTML = '';
        
        config.opcoes.forEach((opcao, index) => {
            opcoesHTML += `
                <label class="radio-label opcao-alcoolismo">
                    <input type="radio" name="opcao-alcoolismo" value="${opcao.id}" 
                           data-custo="${opcao.custo}" ${index === 0 ? 'checked' : ''}>
                    <span class="radio-custom"></span>
                    <span class="radio-text">
                        <strong>${opcao.nome} (${opcao.custo} pts)</strong>
                        <small>${opcao.desc}</small>
                    </span>
                </label>
            `;
        });
        
        return `
            <div class="modal-header">
                <h3><i class="fas ${desvantagem.icone}"></i> ${desvantagem.nome}</h3>
                <button class="modal-close-desvantagem">&times;</button>
            </div>
            <div class="modal-body">
                <div class="desvantagem-descricao">
                    <p>${desvantagem.descricao}</p>
                </div>
                
                <div class="config-section">
                    <h4><i class="fas fa-exclamation-circle"></i> Tipo de Alcoolismo</h4>
                    <div class="radio-group vertical">
                        ${opcoesHTML}
                    </div>
                </div>
                
                <div class="resumo-custo-simples">
                    <h4><i class="fas fa-calculator"></i> Custo Final</h4>
                    <div class="custo-display negativo">
                        <span id="custoFinalOpcao">${config.opcoes[0].custo}</span> pontos
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancelar-desvantagem">Cancelar</button>
                <button class="btn-confirmar-desvantagem" id="btnConfirmarDesvantagem" data-custo-final="${config.opcoes[0].custo}">
                    Adicionar por ${config.opcoes[0].custo} pts
                </button>
            </div>
        `;
    }

    criarModalSelecaoMultipla(desvantagem) {
        const config = desvantagem.configuracao;
        let opcoesHTML = '';
        
        config.opcoes.forEach((opcao, index) => {
            opcoesHTML += `
                <label class="checkbox-label fobia-option">
                    <input type="checkbox" name="fobia" value="${opcao.id}" 
                           data-custo="${opcao.custo}">
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                        <strong>${opcao.nome} (${opcao.custo} pts)</strong>
                        <small>${opcao.desc}</small>
                    </span>
                </label>
            `;
        });
        
        return `
            <div class="modal-header">
                <h3><i class="fas ${desvantagem.icone}"></i> ${desvantagem.nome}</h3>
                <button class="modal-close-desvantagem">&times;</button>
            </div>
            <div class="modal-body">
                <div class="desvantagem-descricao">
                    <p>${desvantagem.descricao}</p>
                    <div class="info-box">
                        <i class="fas fa-info-circle"></i>
                        <p>Você pode selecionar múltiplas fobias. O custo será a soma dos valores negativos.</p>
                    </div>
                </div>
                
                <div class="config-section fobias-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Selecione as Fobias</h4>
                    <div class="checkbox-group fobias-group">
                        ${opcoesHTML}
                    </div>
                </div>
                
                <div class="resumo-custo-multiplo">
                    <h4><i class="fas fa-calculator"></i> Resumo do Custo</h4>
                    <div class="custo-calculator">
                        <div class="custo-item">
                            <span>Fobias selecionadas:</span>
                            <span id="contadorFobias">0</span>
                        </div>
                        <div class="custo-total negativo">
                            <span>Custo Total:</span>
                            <span id="custoTotalFobias">0</span> pts
                        </div>
                        <div class="info-selecao">
                            <small>Máximo: ${config.maximo} fobias</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancelar-desvantagem">Cancelar</button>
                <button class="btn-confirmar-desvantagem" id="btnConfirmarFobias" data-custo-final="0">
                    Adicionar 0 fobias (0 pts)
                </button>
            </div>
        `;
    }

    atualizarCalculoCusto() {
        if (!this.desvantagemAtual || !this.modalAberto) return;
        
        const modal = document.getElementById('modalDesvantagem');
        if (!modal) return;
        
        let custoFinal = 0;
        let descricao = '';
        let detalhes = [];
        
        if (!this.desvantagemAtual.configuracao) {
            // Desvantagem simples (Altruísmo)
            custoFinal = this.desvantagemAtual.custoBase;
            descricao = this.desvantagemAtual.nome;
        } 
        else if (this.desvantagemAtual.configuracao.tipo === 'opcoes-multiplas') {
            // Alcoolismo
            const opcaoSelecionada = modal.querySelector('input[name="opcao-alcoolismo"]:checked');
            if (!opcaoSelecionada) return;
            
            custoFinal = parseInt(opcaoSelecionada.dataset.custo);
            const opcaoId = opcaoSelecionada.value;
            
            const opcaoData = this.desvantagemAtual.configuracao.opcoes.find(o => o.id === opcaoId);
            descricao = opcaoData ? opcaoData.nome : this.desvantagemAtual.nome;
            detalhes.push(opcaoId);
            
            // Atualizar display
            const custoFinalEl = document.getElementById('custoFinalOpcao');
            if (custoFinalEl) custoFinalEl.textContent = custoFinal;
        }
        else if (this.desvantagemAtual.configuracao.tipo === 'selecao-multipla') {
            // Fobias
            const fobiasSelecionadas = [];
            let totalFobias = 0;
            
            modal.querySelectorAll('input[name="fobia"]:checked').forEach(check => {
                const id = check.value;
                const custo = parseInt(check.dataset.custo);
                fobiasSelecionadas.push({
                    id: id,
                    nome: this.desvantagemAtual.configuracao.opcoes.find(o => o.id === id).nome,
                    custo: custo
                });
                custoFinal += custo;
                totalFobias++;
            });
            
            // Atualizar contadores
            const contadorFobias = document.getElementById('contadorFobias');
            const custoTotalFobias = document.getElementById('custoTotalFobias');
            
            if (contadorFobias) contadorFobias.textContent = totalFobias;
            if (custoTotalFobias) custoTotalFobias.textContent = custoFinal;
            
            // Montar descrição
            if (fobiasSelecionadas.length === 0) {
                descricao = "Nenhuma fobia selecionada";
            } else if (fobiasSelecionadas.length === 1) {
                descricao = fobiasSelecionadas[0].nome;
            } else {
                descricao = `${fobiasSelecionadas.length} fobias`;
            }
            
            detalhes = fobiasSelecionadas;
        }
        
        // Atualizar botão de confirmação
        const btnConfirmar = modal.querySelector('.btn-confirmar-desvantagem');
        if (btnConfirmar) {
            if (this.desvantagemAtual.configuracao && this.desvantagemAtual.configuracao.tipo === 'selecao-multipla') {
                btnConfirmar.textContent = `Adicionar ${detalhes.length} fobia${detalhes.length !== 1 ? 's' : ''} (${custoFinal} pts)`;
            } else {
                btnConfirmar.textContent = `Adicionar por ${custoFinal} pts`;
            }
            btnConfirmar.dataset.custoFinal = custoFinal;
        }
        
        return { custoFinal, descricao, detalhes };
    }

    confirmarDesvantagem() {
        if (!this.desvantagemAtual) {
            console.error('Nenhuma desvantagem selecionada para confirmar!');
            return;
        }
        
        const modal = document.getElementById('modalDesvantagem');
        if (!modal) return;
        
        const btnConfirmar = modal.querySelector('.btn-confirmar-desvantagem');
        if (!btnConfirmar) return;
        
        const custoFinal = parseInt(btnConfirmar.dataset.custoFinal) || this.desvantagemAtual.custoBase;
        
        // Para fobias, verificar se selecionou pelo menos uma
        if (this.desvantagemAtual.configuracao && this.desvantagemAtual.configuracao.tipo === 'selecao-multipla') {
            const fobiasSelecionadas = modal.querySelectorAll('input[name="fobia"]:checked');
            if (fobiasSelecionadas.length === 0) {
                this.mostrarFeedback('❌ Selecione pelo menos uma fobia!');
                return;
            }
        }
        
        let detalhes = {
            nome: this.desvantagemAtual.nome,
            id: this.desvantagemAtual.id,
            categoria: this.desvantagemAtual.categoria,
            icone: this.desvantagemAtual.icone,
            custo: custoFinal,
            timestamp: Date.now()
        };
        
        // Adicionar detalhes específicos
        if (this.desvantagemAtual.configuracao) {
            if (this.desvantagemAtual.configuracao.tipo === 'opcoes-multiplas') {
                const opcaoSelecionada = modal.querySelector('input[name="opcao-alcoolismo"]:checked');
                if (opcaoSelecionada) {
                    const opcaoData = this.desvantagemAtual.configuracao.opcoes.find(o => o.id === opcaoSelecionada.value);
                    if (opcaoData) {
                        detalhes.opcaoId = opcaoData.id;
                        detalhes.opcaoNome = opcaoData.nome;
                        detalhes.descricao = opcaoData.nome;
                    }
                }
            }
            else if (this.desvantagemAtual.configuracao.tipo === 'selecao-multipla') {
                // Para fobias, criar uma entrada para cada fobia
                const fobiasSelecionadas = [];
                modal.querySelectorAll('input[name="fobia"]:checked').forEach(check => {
                    const fobiaId = check.value;
                    const fobiaData = this.desvantagemAtual.configuracao.opcoes.find(o => o.id === fobiaId);
                    if (fobiaData) {
                        fobiasSelecionadas.push({
                            id: fobiaId,
                            nome: fobiaData.nome,
                            custo: fobiaData.custo,
                            descricao: fobiaData.desc
                        });
                    }
                });
                
                detalhes.fobias = fobiasSelecionadas;
                detalhes.quantidadeFobias = fobiasSelecionadas.length;
                detalhes.descricao = fobiasSelecionadas.length === 1 ? 
                    fobiasSelecionadas[0].nome : 
                    `${fobiasSelecionadas.length} fobias`;
            }
        } else {
            // Desvantagem simples
            detalhes.descricao = this.desvantagemAtual.descricao.substring(0, 80) + 
                (this.desvantagemAtual.descricao.length > 80 ? '...' : '');
        }
        
        // Adicionar à lista
        this.desvantagensAdquiridas.push(detalhes);
        
        // Atualizar interface
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.fecharModal();
        
        // Feedback
        const pontosTexto = Math.abs(custoFinal) + " pts";
        this.mostrarFeedback(`✅ ${detalhes.descricao} adicionada por ${custoFinal} pts`);
        
        console.log('Desvantagem adicionada:', detalhes);
    }

    fecharModal() {
        const modal = document.getElementById('modalDesvantagem');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            this.modalAberto = false;
            this.desvantagemAtual = null;
            console.log('Modal de desvantagem fechado');
        }
    }

    removerDesvantagem(index) {
        if (index >= 0 && index < this.desvantagensAdquiridas.length) {
            const removida = this.desvantagensAdquiridas.splice(index, 1)[0];
            this.atualizarListaAdquiridas();
            this.atualizarContadores();
            this.mostrarFeedback(`❌ ${removida.nome} removida`);
            console.log('Desvantagem removida:', removida);
        }
    }

    atualizarListaAdquiridas() {
        const container = document.querySelector('.desvantagens-escolhidas-scroll');
        if (!container) {
            console.error('Container .desvantagens-escolhidas-scroll não encontrado!');
            return;
        }
        
        if (this.desvantagensAdquiridas.length === 0) {
            container.innerHTML = `
                <div class="lista-vazia">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Nenhuma desvantagem selecionada</p>
                    <small>Clique no botão "+" para adicionar</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.desvantagensAdquiridas.forEach((desvantagem, index) => {
            const div = document.createElement('div');
            div.className = 'desvantagem-adquirida-item';
            
            let descricaoCurta = desvantagem.descricao || desvantagem.nome;
            if (descricaoCurta.length > 60) {
                descricaoCurta = descricaoCurta.substring(0, 57) + '...';
            }
            
            div.innerHTML = `
                <div class="desvantagem-adquirida-info">
                    <i class="fas ${desvantagem.icone}"></i>
                    <div>
                        <strong>${desvantagem.nome}</strong>
                        <small>${descricaoCurta}</small>
                    </div>
                </div>
                <div class="desvantagem-adquirida-acoes">
                    <span class="custo-badge negativo">${desvantagem.custo} pts</span>
                    <button class="btn-remover-desvantagem" data-index="${index}" title="Remover">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(div);
        });
    }

    atualizarContadores() {
        const total = this.desvantagensAdquiridas.length;
        const custoTotal = this.desvantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        
        // Atualizar elementos (ajustar IDs conforme seu HTML)
        const totalEl = document.getElementById('total-desvantagens');
        const custoEl = document.getElementById('custo-desvantagens');
        const pontosEl = document.getElementById('total-pontos-desvantagens');
        
        if (totalEl) totalEl.textContent = `${total} desvantagem${total !== 1 ? 's' : ''}`;
        if (custoEl) custoEl.textContent = `${custoTotal} ponto${custoTotal !== 1 ? 's' : ''}`;
        if (pontosEl) pontosEl.textContent = `${custoTotal} pts`;
    }

    atualizarContadorDesvantagens(count) {
        const elem = document.getElementById('contador-desvantagens');
        if (elem) elem.textContent = count;
    }

    filtrarPorTexto(texto) {
        const container = document.querySelector('.lista-desvantagens-scroll');
        if (!container) return;
        
        const desvantagens = filtrarDesvantagens(this.filtroAtual);
        const textoLower = texto.toLowerCase().trim();
        
        if (!textoLower) {
            this.carregarCatalogoNaTela();
            return;
        }
        
        const filtradas = desvantagens.filter(v => {
            const nomeNormalizado = v.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const textoNormalizado = textoLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return nomeNormalizado.includes(textoNormalizado);
        });
        
        if (filtradas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma desvantagem encontrada</p>
                    <small>Tente outro termo de busca</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        filtradas.forEach(desvantagem => {
            const div = this.criarElementoDesvantagem(desvantagem);
            container.appendChild(div);
        });
        
        this.atualizarContadorDesvantagens(filtradas.length);
    }

    mostrarFeedback(mensagem) {
        // Remover feedback anterior
        const feedbackAntigo = document.getElementById('feedback-desvantagens');
        if (feedbackAntigo) {
            feedbackAntigo.remove();
        }
        
        // Criar novo feedback
        const feedbackEl = document.createElement('div');
        feedbackEl.id = 'feedback-desvantagens';
        feedbackEl.className = 'feedback-message';
        feedbackEl.textContent = mensagem;
        document.body.appendChild(feedbackEl);
        
        // Mostrar
        setTimeout(() => {
            feedbackEl.classList.add('show');
        }, 10);
        
        // Remover após 3 segundos
        setTimeout(() => {
            feedbackEl.classList.remove('show');
            setTimeout(() => {
                if (feedbackEl.parentNode) {
                    feedbackEl.remove();
                }
            }, 300);
        }, 3000);
    }

    formatarCategoria(cat) {
        const categorias = {
            'mental': 'Mental',
            'fisica': 'Física',
            'social': 'Social'
        };
        return categorias[cat] || cat;
    }

    // Métodos para salvar/carregar
    salvarDesvantagens() {
        return {
            desvantagens: this.desvantagensAdquiridas,
            totalPontos: this.desvantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0)
        };
    }

    carregarDesvantagens(dados) {
        if (dados && dados.desvantagens) {
            this.desvantagensAdquiridas = dados.desvantagens;
            this.atualizarListaAdquiridas();
            this.atualizarContadores();
            console.log(`Carregadas ${this.desvantagensAdquiridas.length} desvantagens salvas`);
        }
    }
}

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, verificando dependências de desvantagens...');
    
    // Verificar se o catálogo está disponível
    if (typeof filtrarDesvantagens === 'undefined' || typeof getDesvantagemPorId === 'undefined') {
        console.error('catalogo-desvantagens.js não carregou corretamente!');
        setTimeout(() => {
            if (typeof filtrarDesvantagens === 'undefined') {
                console.error('Ainda não carregou. Verifique a ordem dos scripts.');
                alert('Erro: Catálogo de desvantagens não carregou. Verifique o console.');
            }
        }, 1000);
        return;
    }
    
    console.log('Dependências de desvantagens carregadas, iniciando sistema...');
    
    // Pequeno delay para garantir que tudo está pronto
    setTimeout(() => {
        try {
            window.desvantagensSystem = new DesvantagensSystem();
            console.log('✅ Sistema de desvantagens iniciado com sucesso!', window.desvantagensSystem);
        } catch (error) {
            console.error('❌ Erro ao iniciar sistema de desvantagens:', error);
        }
    }, 100);
});

// Expor para uso global
if (typeof window !== 'undefined') {
    window.DesvantagensSystem = DesvantagensSystem;
}