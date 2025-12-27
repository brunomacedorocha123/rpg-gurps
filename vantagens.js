// vantagens.js - SISTEMA DE VANTAGENS (VERSÃO CORRIGIDA)
class VantagensSystem {
    constructor() {
        this.vantagensAdquiridas = [];
        this.filtroAtual = 'todos';
        this.init();
    }

    init() {
        this.carregarCatalogoNaTela();
        this.setupGlobalEventListeners();
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
        console.log('Vantagens carregadas:', vantagens.length);
        
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
        
        // Adicionar eventos aos botões recém-criados
        this.setupButtonsEvents();
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
            <button class="btn-adicionar" data-vantagem="${vantagem.id}">
                <i class="fas fa-plus"></i>
            </button>
        `;
        
        return div;
    }

    setupGlobalEventListeners() {
        console.log('Configurando event listeners globais...');
        
        // Filtros
        const filtros = document.querySelectorAll('.filtro-btn');
        filtros.forEach(btn => {
            btn.addEventListener('click', (e) => {
                console.log('Filtro clicado:', e.target.dataset.filtro);
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filtroAtual = e.target.dataset.filtro;
                this.carregarCatalogoNaTela();
            });
        });

        // Busca
        const buscaInput = document.getElementById('buscaVantagens');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                console.log('Buscando:', e.target.value);
                this.filtrarPorTexto(e.target.value);
            });
        }

        // Delegation para elementos dinâmicos
        document.addEventListener('click', (e) => {
            console.log('Click detectado no:', e.target.tagName, e.target.className);
            
            // Botão de adicionar vantagem
            if (e.target.closest('.btn-adicionar')) {
                const btn = e.target.closest('.btn-adicionar');
                const idVantagem = btn.dataset.vantagem;
                console.log('Botão adicionar clicado para:', idVantagem);
                this.abrirModalVantagem(idVantagem);
            }
            
            // Botão de remover vantagem adquirida
            if (e.target.closest('.btn-remover-vantagem')) {
                const btn = e.target.closest('.btn-remover-vantagem');
                const index = parseInt(btn.dataset.index);
                console.log('Botão remover clicado no índice:', index);
                this.removerVantagem(index);
            }
            
            // Fechar modal
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('btn-cancelar')) {
                console.log('Fechando modal...');
                this.fecharModal();
            }
            
            // Confirmar no modal
            if (e.target.classList.contains('btn-confirmar')) {
                console.log('Confirmando vantagem...');
                this.confirmarVantagem();
            }
        });

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modalVantagem');
            if (e.target === modal) {
                this.fecharModal();
            }
        });
    }

    setupButtonsEvents() {
        // Adicionar eventos específicos aos botões de adicionar
        const botoesAdicionar = document.querySelectorAll('.btn-adicionar');
        console.log('Botões adicionar encontrados:', botoesAdicionar.length);
        
        botoesAdicionar.forEach(btn => {
            // Remover listener antigo se existir
            btn.replaceWith(btn.cloneNode(true));
        });
    }

    abrirModalVantagem(idVantagem) {
        console.log('Abrindo modal para:', idVantagem);
        
        const vantagem = getVantagemPorId(idVantagem);
        if (!vantagem) {
            console.error('Vantagem não encontrada:', idVantagem);
            return;
        }
        
        const modal = document.getElementById('modalVantagem');
        if (!modal) {
            console.error('Modal #modalVantagem não encontrado!');
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
        
        modal.querySelector('.vantagem-modal').innerHTML = conteudoModal;
        modal.style.display = 'flex';
        modal.classList.add('active');
        
        console.log('Modal aberto com sucesso');
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
                    <h4>Custo Fixo: ${vantagem.custoBase} pontos</h4>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancelar">Cancelar</button>
                <button class="btn-confirmar" data-custo="${vantagem.custoBase}">
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
                        <small>${nivel.desc} (${nivel.custo} pts)</small>
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
                <button class="btn-confirmar" id="btnConfirmarVantagem">
                    Adicionar Vantagem
                </button>
            </div>
        `;
    }

    criarModalOpcoesMultiplas(vantagem) {
        const config = vantagem.configuracao;
        let opcoesHTML = '';
        
        config.opcoes.forEach((opcao, index) => {
            opcoesHTML += `
                <label class="radio-label opcao-option">
                    <input type="radio" name="opcao" value="${opcao.id}" 
                           data-custo="${opcao.custo}" ${index === 0 ? 'checked' : ''}>
                    <span class="radio-custom"></span>
                    <span class="radio-text">
                        <strong>${opcao.nome}</strong>
                        <small>${opcao.desc.substring(0, 100)}... (${opcao.custo} pts)</small>
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
                <button class="btn-confirmar" id="btnConfirmarVantagem">
                    Adicionar Vantagem
                </button>
            </div>
        `;
    }

    fecharModal() {
        const modal = document.getElementById('modalVantagem');
        if (modal) {
            modal.style.display = 'none';
            modal.classList.remove('active');
        }
    }

    confirmarVantagem() {
        const modal = document.getElementById('modalVantagem');
        const vantagemId = modal.querySelector('.modal-header h3').textContent.split(' ')[0].toLowerCase();
        
        const vantagem = getVantagemPorId(vantagemId);
        if (!vantagem) return;
        
        let detalhes = {
            nome: vantagem.nome,
            id: vantagem.id,
            categoria: vantagem.categoria,
            icone: vantagem.icone
        };
        
        let custoFinal = 0;
        
        if (!vantagem.configuracao) {
            // Vantagem simples
            custoFinal = vantagem.custoBase;
            detalhes.tipo = 'simples';
            detalhes.descricao = vantagem.descricao.substring(0, 60) + '...';
        } else if (vantagem.configuracao.tipo === 'niveis-com-limites') {
            // Aptidão Mágica
            const nivelSelecionado = modal.querySelector('input[name="nivel"]:checked');
            const nivel = nivelSelecionado.value;
            custoFinal = parseInt(nivelSelecionado.dataset.custo);
            
            detalhes.tipo = 'nivel';
            detalhes.nivel = nivel;
            detalhes.descricao = `${vantagem.nome} ${nivel}`;
        } else if (vantagem.configuracao.tipo === 'opcoes-multiplas') {
            // Abençoado ou Adaptabilidade
            const opcaoSelecionada = modal.querySelector('input[name="opcao"]:checked');
            const opcaoId = opcaoSelecionada.value;
            custoFinal = parseInt(opcaoSelecionada.dataset.custo);
            
            const opcaoData = vantagem.configuracao.opcoes.find(o => o.id === opcaoId);
            detalhes.tipo = 'opcao';
            detalhes.opcaoNome = opcaoData.nome;
            detalhes.descricao = opcaoData.nome;
        }
        
        detalhes.custo = custoFinal;
        detalhes.timestamp = Date.now();
        
        this.vantagensAdquiridas.push(detalhes);
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        this.fecharModal();
        
        this.mostrarFeedback(`✅ ${vantagem.nome} adicionada por ${custoFinal} pts`);
    }

    removerVantagem(index) {
        if (index >= 0 && index < this.vantagensAdquiridas.length) {
            const removida = this.vantagensAdquiridas.splice(index, 1)[0];
            this.atualizarListaAdquiridas();
            this.atualizarContadores();
            this.mostrarFeedback(`❌ ${removida.nome} removida`);
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
        
        const filtradas = vantagens.filter(v => 
            v.nome.toLowerCase().includes(textoLower) ||
            v.descricao.toLowerCase().includes(textoLower) ||
            v.categoria.toLowerCase().includes(textoLower)
        );
        
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
        // Criar elemento de feedback
        let feedbackEl = document.getElementById('feedback-vantagens');
        if (!feedbackEl) {
            feedbackEl = document.createElement('div');
            feedbackEl.id = 'feedback-vantagens';
            feedbackEl.className = 'feedback-message';
            document.body.appendChild(feedbackEl);
        }
        
        feedbackEl.textContent = mensagem;
        feedbackEl.classList.add('show');
        
        setTimeout(() => {
            feedbackEl.classList.remove('show');
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
}

// DEBUG: Verificar se está carregando
console.log('vantagens.js carregado');

// Inicializar sistema quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando sistema de vantagens...');
    
    // Verificar se o catálogo está disponível
    if (typeof filtrarVantagens === 'undefined') {
        console.error('catalogo-vantagens.js não carregou!');
        return;
    }
    
    // Esperar um pouco para garantir que tudo está pronto
    setTimeout(() => {
        window.vantagensSystem = new VantagensSystem();
        console.log('Sistema de vantagens iniciado:', window.vantagensSystem);
    }, 100);
});