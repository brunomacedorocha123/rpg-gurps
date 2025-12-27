// vantagens.js - SISTEMA COMPLETO DE VANTAGENS
class VantagensSystem {
    constructor() {
        this.vantagensAdquiridas = [];
        this.filtroAtual = 'todos';
        this.vantagemAtual = null;
        this.modalAberto = false;
        this.init();
    }

    init() {
        console.log('Iniciando sistema de vantagens...');
        this.carregarCatalogoNaTela();
        this.setupEventListeners();
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
    }

    carregarCatalogoNaTela() {
        const container = document.querySelector('.lista-vantagens-scroll');
        if (!container) {
            console.error('Container .lista-vantagens-scroll não encontrado!');
            return;
        }
        
        const vantagens = filtrarVantagens(this.filtroAtual);
        console.log(`Carregando ${vantagens.length} vantagens...`);
        
        container.innerHTML = '';
        
        if (vantagens.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma vantagem encontrada</p>
                    <small>Tente outro filtro ou busca</small>
                </div>
            `;
            return;
        }
        
        vantagens.forEach(vantagem => {
            const div = this.criarElementoVantagem(vantagem);
            container.appendChild(div);
        });
        
        this.atualizarContadorVantagens(vantagens.length);
    }

    criarElementoVantagem(vantagem) {
        const div = document.createElement('div');
        div.className = 'vantagem-linha';
        div.dataset.id = vantagem.id;
        div.dataset.categorias = `${vantagem.categoria},${vantagem.tipo}`;
        
        const tipoTexto = vantagem.tipo === 'opcoes' ? 'Com Opções' : `${vantagem.custoBase} pts`;
        const icone = vantagem.icone || 'fa-star';
        
        div.innerHTML = `
            <div class="vantagem-info">
                <i class="fas ${icone}"></i>
                <div>
                    <strong>${vantagem.nome}</strong>
                    <small>${this.formatarCategoria(vantagem.categoria)} • ${tipoTexto}</small>
                </div>
            </div>
            <button class="btn-adicionar" data-vantagem-id="${vantagem.id}">
                <i class="fas fa-plus"></i>
            </button>
        `;
        
        return div;
    }

    setupEventListeners() {
        console.log('Configurando event listeners...');
        
        // Filtros - usando event delegation
        document.addEventListener('click', (e) => {
            // Filtros
            if (e.target.classList.contains('filtro-btn') || e.target.closest('.filtro-btn')) {
                const btn = e.target.classList.contains('filtro-btn') ? e.target : e.target.closest('.filtro-btn');
                const filtro = btn.dataset.filtro;
                console.log(`Filtro selecionado: ${filtro}`);
                
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filtroAtual = filtro;
                this.carregarCatalogoNaTela();
                return;
            }
            
            // Botão de adicionar vantagem
            if (e.target.classList.contains('btn-adicionar') || e.target.closest('.btn-adicionar')) {
                const btn = e.target.classList.contains('btn-adicionar') ? e.target : e.target.closest('.btn-adicionar');
                const idVantagem = btn.dataset.vantagemId;
                console.log(`Tentando abrir modal para: ${idVantagem}`);
                this.abrirModalVantagem(idVantagem);
                return;
            }
            
            // Botão de remover vantagem
            if (e.target.classList.contains('btn-remover-vantagem') || e.target.closest('.btn-remover-vantagem')) {
                const btn = e.target.classList.contains('btn-remover-vantagem') ? e.target : e.target.closest('.btn-remover-vantagem');
                const index = parseInt(btn.dataset.index);
                console.log(`Removendo vantagem no índice: ${index}`);
                this.removerVantagem(index);
                return;
            }
        });

        // Busca
        const buscaInput = document.getElementById('buscaVantagens');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                const termo = e.target.value.trim();
                console.log(`Buscando: "${termo}"`);
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
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('btn-cancelar')) {
                console.log('Fechando modal...');
                this.fecharModal();
                return;
            }
            
            // Confirmar vantagem
            if (e.target.classList.contains('btn-confirmar')) {
                console.log('Confirmando adição da vantagem...');
                this.confirmarVantagem();
                return;
            }
            
            // Atualizar cálculo de custo
            const modal = document.getElementById('modalVantagem');
            if (modal && modal.contains(e.target)) {
                if (e.target.name === 'nivel' || 
                    e.target.name === 'limitacao' || 
                    e.target.name === 'opcao') {
                    this.atualizarCalculoCusto();
                }
            }
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modalVantagem');
            if (this.modalAberto && e.target === modal) {
                console.log('Clicou fora do modal, fechando...');
                this.fecharModal();
            }
        });
    }

    abrirModalVantagem(idVantagem) {
        console.log(`Abrindo modal para vantagem ID: ${idVantagem}`);
        
        const vantagem = getVantagemPorId(idVantagem);
        if (!vantagem) {
            console.error(`Vantagem não encontrada: ${idVantagem}`);
            this.mostrarFeedback('❌ Vantagem não encontrada!');
            return;
        }
        
        this.vantagemAtual = vantagem;
        
        const modal = document.getElementById('modalVantagem');
        if (!modal) {
            console.error('Modal #modalVantagem não encontrado no DOM!');
            return;
        }
        
        let conteudoModal = '';
        
        if (!vantagem.configuracao) {
            // Vantagem simples (Ambidestria)
            conteudoModal = this.criarModalSimples(vantagem);
        } else {
            // Vantagem com opções
            switch(vantagem.configuracao.tipo) {
                case 'niveis-com-limites': // Aptidão Mágica
                    conteudoModal = this.criarModalNiveisComLimites(vantagem);
                    break;
                case 'opcoes-multiplas': // Abençoado e Adaptabilidade Cultural
                    conteudoModal = this.criarModalOpcoesMultiplas(vantagem);
                    break;
                default:
                    conteudoModal = this.criarModalSimples(vantagem);
            }
        }
        
        // Limpar e inserir conteúdo
        const modalContent = modal.querySelector('.vantagem-modal');
        if (!modalContent) {
            console.error('Elemento .vantagem-modal não encontrado no modal!');
            return;
        }
        
        modalContent.innerHTML = conteudoModal;
        modal.style.display = 'flex';
        modal.classList.add('active');
        this.modalAberto = true;
        
        console.log('Modal aberto com sucesso');
        
        // Inicializar cálculo de custo se necessário
        if (vantagem.configuracao) {
            this.atualizarCalculoCusto();
        }
    }

    criarModalSimples(vantagem) {
        return `
            <div class="modal-header">
                <h3><i class="fas ${vantagem.icone}"></i> ${vantagem.nome}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="vantagem-descricao">
                    <p>${vantagem.descricao}</p>
                </div>
                <div class="modal-custo-simples">
                    <h4><i class="fas fa-coins"></i> Custo Fixo: ${vantagem.custoBase} pontos</h4>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancelar">Cancelar</button>
                <button class="btn-confirmar" data-custo-final="${vantagem.custoBase}">
                    Adicionar por ${vantagem.custoBase} pts
                </button>
            </div>
        `;
    }

    criarModalNiveisComLimites(vantagem) {
        const config = vantagem.configuracao;
        let opcoesNiveis = '';
        
        config.niveis.forEach(nivel => {
            opcoesNiveis += `
                <label class="radio-label nivel-option">
                    <input type="radio" name="nivel" value="${nivel.nivel}" 
                           data-custo="${nivel.custo}" ${nivel.nivel === 0 ? 'checked' : ''}>
                    <span class="radio-custom"></span>
                    <span class="radio-text">
                        <strong>${vantagem.nome} ${nivel.nivel}</strong>
                        <small>${nivel.desc}</small>
                    </span>
                </label>
            `;
        });
        
        let opcoesLimitacoes = '';
        config.limitações.forEach(limit => {
            opcoesLimitacoes += `
                <label class="checkbox-label limitacao-option">
                    <input type="checkbox" name="limitacao" value="${limit.id}" 
                           data-percent="${limit.percent}">
                    <span class="checkbox-custom"></span>
                    <span class="checkbox-text">
                        <strong>${limit.nome} (${limit.percent}%)</strong>
                        <small>${limit.desc}</small>
                    </span>
                </label>
            `;
        });
        
        return `
            <div class="modal-header">
                <h3><i class="fas ${vantagem.icone}"></i> ${vantagem.nome}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="vantagem-descricao">
                    <p>${vantagem.descricao}</p>
                </div>
                
                <div class="config-section">
                    <h4><i class="fas fa-chart-line"></i> Nível da Aptidão</h4>
                    <div class="radio-group vertical">
                        ${opcoesNiveis}
                    </div>
                </div>
                
                <div class="config-section">
                    <h4><i class="fas fa-exclamation-triangle"></i> Limitações Especiais (opcional)</h4>
                    <div class="checkbox-group limitacoes-group">
                        ${opcoesLimitacoes}
                    </div>
                </div>
                
                <div class="resumo-custo">
                    <h4><i class="fas fa-calculator"></i> Resumo do Custo</h4>
                    <div class="custo-calculator">
                        <div class="custo-item">
                            <span>Custo Base:</span>
                            <span id="custoBaseCalc">5</span> pts
                        </div>
                        <div class="custo-item">
                            <span>Limitações:</span>
                            <span id="custoLimitacoesCalc">0%</span>
                        </div>
                        <div class="custo-total">
                            <span>Custo Final:</span>
                            <span id="custoTotalCalc">5</span> pts
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancelar">Cancelar</button>
                <button class="btn-confirmar" id="btnConfirmarVantagem" data-custo-final="5">
                    Adicionar por 5 pts
                </button>
            </div>
        `;
    }

    criarModalOpcoesMultiplas(vantagem) {
        const config = vantagem.configuracao;
        let opcoesHTML = '';
        
        config.opcoes.forEach((opcao, index) => {
            const descricaoCurta = opcao.desc.length > 100 ? opcao.desc.substring(0, 97) + '...' : opcao.desc;
            opcoesHTML += `
                <label class="radio-label opcao-option">
                    <input type="radio" name="opcao" value="${opcao.id}" 
                           data-custo="${opcao.custo}" ${index === 0 ? 'checked' : ''}>
                    <span class="radio-custom"></span>
                    <span class="radio-text">
                        <strong>${opcao.nome}</strong>
                        <small>${descricaoCurta} (${opcao.custo} pts)</small>
                    </span>
                </label>
            `;
        });
        
        return `
            <div class="modal-header">
                <h3><i class="fas ${vantagem.icone}"></i> ${vantagem.nome}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <div class="vantagem-descricao">
                    <p>${vantagem.descricao}</p>
                </div>
                
                <div class="config-section">
                    <h4><i class="fas fa-cogs"></i> Escolha uma Opção</h4>
                    <div class="radio-group vertical opcoes-group">
                        ${opcoesHTML}
                    </div>
                </div>
                
                <div class="resumo-custo-simples">
                    <h4><i class="fas fa-calculator"></i> Custo Final</h4>
                    <div class="custo-display">
                        <span id="custoFinalOpcao">${config.opcoes[0].custo}</span> pontos
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancelar">Cancelar</button>
                <button class="btn-confirmar" id="btnConfirmarVantagem" data-custo-final="${config.opcoes[0].custo}">
                    Adicionar por ${config.opcoes[0].custo} pts
                </button>
            </div>
        `;
    }

    atualizarCalculoCusto() {
        if (!this.vantagemAtual || !this.modalAberto) return;
        
        const modal = document.getElementById('modalVantagem');
        if (!modal) return;
        
        let custoFinal = 0;
        let descricao = '';
        
        if (!this.vantagemAtual.configuracao) {
            // Vantagem simples
            custoFinal = this.vantagemAtual.custoBase;
            descricao = this.vantagemAtual.nome;
        } 
        else if (this.vantagemAtual.configuracao.tipo === 'niveis-com-limites') {
            // Aptidão Mágica
            const nivelSelecionado = modal.querySelector('input[name="nivel"]:checked');
            if (!nivelSelecionado) return;
            
            const nivel = nivelSelecionado.value;
            const custoBase = parseInt(nivelSelecionado.dataset.custo);
            
            // Calcular limitações
            let percentTotal = 0;
            const limitacoesSelecionadas = [];
            modal.querySelectorAll('input[name="limitacao"]:checked').forEach(check => {
                const percent = parseInt(check.dataset.percent);
                percentTotal += percent;
                limitacoesSelecionadas.push(check.value);
            });
            
            // Calcular custo final
            custoFinal = custoBase;
            if (percentTotal < 0) {
                custoFinal = Math.max(1, Math.floor(custoBase * (100 + percentTotal) / 100));
            }
            
            // Atualizar display
            const custoBaseEl = document.getElementById('custoBaseCalc');
            const limitacoesEl = document.getElementById('custoLimitacoesCalc');
            const totalEl = document.getElementById('custoTotalCalc');
            
            if (custoBaseEl) custoBaseEl.textContent = custoBase;
            if (limitacoesEl) limitacoesEl.textContent = `${percentTotal}%`;
            if (totalEl) totalEl.textContent = custoFinal;
            
            descricao = `${this.vantagemAtual.nome} ${nivel}`;
            if (limitacoesSelecionadas.length > 0) {
                descricao += ` com ${limitacoesSelecionadas.join(', ')}`;
            }
        }
        else if (this.vantagemAtual.configuracao.tipo === 'opcoes-multiplas') {
            // Abençoado ou Adaptabilidade Cultural
            const opcaoSelecionada = modal.querySelector('input[name="opcao"]:checked');
            if (!opcaoSelecionada) return;
            
            custoFinal = parseInt(opcaoSelecionada.dataset.custo);
            const opcaoId = opcaoSelecionada.value;
            
            // Atualizar display
            const custoFinalEl = document.getElementById('custoFinalOpcao');
            if (custoFinalEl) custoFinalEl.textContent = custoFinal;
            
            const opcaoData = this.vantagemAtual.configuracao.opcoes.find(o => o.id === opcaoId);
            descricao = opcaoData ? opcaoData.nome : this.vantagemAtual.nome;
        }
        
        // Atualizar botão de confirmação
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        if (btnConfirmar) {
            btnConfirmar.textContent = `Adicionar por ${custoFinal} pts`;
            btnConfirmar.dataset.custoFinal = custoFinal;
        }
        
        return { custoFinal, descricao };
    }

    confirmarVantagem() {
        if (!this.vantagemAtual) {
            console.error('Nenhuma vantagem selecionada para confirmar!');
            return;
        }
        
        const modal = document.getElementById('modalVantagem');
        if (!modal) return;
        
        const btnConfirmar = modal.querySelector('.btn-confirmar');
        if (!btnConfirmar) return;
        
        const custoFinal = parseInt(btnConfirmar.dataset.custoFinal) || this.vantagemAtual.custoBase;
        
        let detalhes = {
            nome: this.vantagemAtual.nome,
            id: this.vantagemAtual.id,
            categoria: this.vantagemAtual.categoria,
            icone: this.vantagemAtual.icone,
            custo: custoFinal,
            timestamp: Date.now()
        };
        
        // Adicionar detalhes específicos
        if (this.vantagemAtual.configuracao) {
            if (this.vantagemAtual.configuracao.tipo === 'niveis-com-limites') {
                const nivelSelecionado = modal.querySelector('input[name="nivel"]:checked');
                if (nivelSelecionado) {
                    detalhes.nivel = nivelSelecionado.value;
                    detalhes.descricao = `${this.vantagemAtual.nome} ${nivelSelecionado.value}`;
                    
                    // Adicionar limitações
                    const limitacoes = [];
                    modal.querySelectorAll('input[name="limitacao"]:checked').forEach(check => {
                        limitacoes.push({
                            id: check.value,
                            percent: parseInt(check.dataset.percent)
                        });
                    });
                    if (limitacoes.length > 0) {
                        detalhes.limitacoes = limitacoes;
                        detalhes.descricao += ` com ${limitacoes.map(l => l.id).join(', ')}`;
                    }
                }
            }
            else if (this.vantagemAtual.configuracao.tipo === 'opcoes-multiplas') {
                const opcaoSelecionada = modal.querySelector('input[name="opcao"]:checked');
                if (opcaoSelecionada) {
                    const opcaoData = this.vantagemAtual.configuracao.opcoes.find(o => o.id === opcaoSelecionada.value);
                    if (opcaoData) {
                        detalhes.opcaoId = opcaoData.id;
                        detalhes.opcaoNome = opcaoData.nome;
                        detalhes.descricao = opcaoData.nome;
                    }
                }
            }
        } else {
            // Vantagem simples
            detalhes.descricao = this.vantagemAtual.descricao.substring(0, 80) + (this.vantagemAtual.descricao.length > 80 ? '...' : '');
        }
        
        // Adicionar à lista
        this.vantagensAdquiridas.push(detalhes);
        
        // Atualizar interface
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.fecharModal();
        
        // Feedback
        this.mostrarFeedback(`✅ ${detalhes.nome} adicionada por ${custoFinal} pts`);
        
        console.log('Vantagem adicionada:', detalhes);
    }

    fecharModal() {
        const modal = document.getElementById('modalVantagem');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
            this.modalAberto = false;
            this.vantagemAtual = null;
            console.log('Modal fechado');
        }
    }

    removerVantagem(index) {
        if (index >= 0 && index < this.vantagensAdquiridas.length) {
            const removida = this.vantagensAdquiridas.splice(index, 1)[0];
            this.atualizarListaAdquiridas();
            this.atualizarContadores();
            this.mostrarFeedback(`❌ ${removida.nome} removida`);
            console.log('Vantagem removida:', removida);
        }
    }

    atualizarListaAdquiridas() {
        const container = document.querySelector('.vantagens-escolhidas-scroll');
        if (!container) {
            console.error('Container .vantagens-escolhidas-scroll não encontrado!');
            return;
        }
        
        if (this.vantagensAdquiridas.length === 0) {
            container.innerHTML = `
                <div class="lista-vazia">
                    <i class="fas fa-star"></i>
                    <p>Nenhuma vantagem selecionada</p>
                    <small>Clique no botão "+" para adicionar</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        this.vantagensAdquiridas.forEach((vantagem, index) => {
            const div = document.createElement('div');
            div.className = 'vantagem-adquirida-item';
            
            let descricaoCurta = vantagem.descricao || vantagem.nome;
            if (descricaoCurta.length > 60) {
                descricaoCurta = descricaoCurta.substring(0, 57) + '...';
            }
            
            div.innerHTML = `
                <div class="vantagem-adquirida-info">
                    <i class="fas ${vantagem.icone}"></i>
                    <div>
                        <strong>${vantagem.nome}</strong>
                        <small>${descricaoCurta}</small>
                    </div>
                </div>
                <div class="vantagem-adquirida-acoes">
                    <span class="custo-badge">${vantagem.custo} pts</span>
                    <button class="btn-remover-vantagem" data-index="${index}" title="Remover">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(div);
        });
    }

    atualizarContadores() {
        const total = this.vantagensAdquiridas.length;
        const custoTotal = this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0);
        
        // Atualizar elementos
        const totalEl = document.getElementById('total-vantagens');
        const custoEl = document.getElementById('custo-vantagens');
        const pontosEl = document.getElementById('total-pontos-vantagens');
        
        if (totalEl) totalEl.textContent = `${total} vantagem${total !== 1 ? 's' : ''}`;
        if (custoEl) custoEl.textContent = `${custoTotal} ponto${custoTotal !== 1 ? 's' : ''}`;
        if (pontosEl) pontosEl.textContent = `${custoTotal} pts`;
    }

    atualizarContadorVantagens(count) {
        const elem = document.getElementById('contador-vantagens');
        if (elem) elem.textContent = count;
    }

    filtrarPorTexto(texto) {
        const container = document.querySelector('.lista-vantagens-scroll');
        if (!container) return;
        
        const vantagens = filtrarVantagens(this.filtroAtual);
        const textoLower = texto.toLowerCase().trim();
        
        if (!textoLower) {
            this.carregarCatalogoNaTela();
            return;
        }
        
        const filtradas = vantagens.filter(v => {
            const nomeNormalizado = v.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const textoNormalizado = textoLower.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return nomeNormalizado.includes(textoNormalizado);
        });
        
        if (filtradas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>Nenhuma vantagem encontrada</p>
                    <small>Tente outro termo de busca</small>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        filtradas.forEach(vantagem => {
            const div = this.criarElementoVantagem(vantagem);
            container.appendChild(div);
        });
        
        this.atualizarContadorVantagens(filtradas.length);
    }

    mostrarFeedback(mensagem) {
        // Remover feedback anterior
        const feedbackAntigo = document.getElementById('feedback-vantagens');
        if (feedbackAntigo) {
            feedbackAntigo.remove();
        }
        
        // Criar novo feedback
        const feedbackEl = document.createElement('div');
        feedbackEl.id = 'feedback-vantagens';
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
    salvarVantagens() {
        return {
            vantagens: this.vantagensAdquiridas,
            totalPontos: this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0)
        };
    }

    carregarVantagens(dados) {
        if (dados && dados.vantagens) {
            this.vantagensAdquiridas = dados.vantagens;
            this.atualizarListaAdquiridas();
            this.atualizarContadores();
            console.log(`Carregadas ${this.vantagensAdquiridas.length} vantagens salvas`);
        }
    }
}

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, verificando dependências...');
    
    // Verificar se o catálogo está disponível
    if (typeof filtrarVantagens === 'undefined' || typeof getVantagemPorId === 'undefined') {
        console.error('catalogo-vantagens.js não carregou corretamente!');
        setTimeout(() => {
            if (typeof filtrarVantagens === 'undefined') {
                console.error('Ainda não carregou. Verifique a ordem dos scripts.');
                alert('Erro: Catálogo de vantagens não carregou. Verifique o console.');
            }
        }, 1000);
        return;
    }
    
    console.log('Dependências carregadas, iniciando sistema...');
    
    // Pequeno delay para garantir que tudo está pronto
    setTimeout(() => {
        try {
            window.vantagensSystem = new VantagensSystem();
            console.log('✅ Sistema de vantagens iniciado com sucesso!', window.vantagensSystem);
        } catch (error) {
            console.error('❌ Erro ao iniciar sistema de vantagens:', error);
        }
    }, 100);
});

// Expor para uso global
if (typeof window !== 'undefined') {
    window.VantagensSystem = VantagensSystem;
}