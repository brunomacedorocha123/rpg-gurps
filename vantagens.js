// vantagens.js - SISTEMA DE VANTAGENS
class VantagensSystem {
    constructor() {
        this.vantagensAdquiridas = [];
        this.filtroAtual = 'todos';
        this.init();
    }

    init() {
        this.carregarCatalogoNaTela();
        this.setupEventListeners();
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
    }

    carregarCatalogoNaTela() {
        const container = document.querySelector('.lista-vantagens-scroll');
        if (!container) return;
        
        const vantagens = filtrarVantagens(this.filtroAtual);
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
        
        div.innerHTML = `
            <div class="vantagem-info">
                <i class="fas ${vantagem.icone}"></i>
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

    formatarCategoria(cat) {
        const categorias = {
            'mental': 'Mental',
            'fisica': 'Física',
            'social': 'Social'
        };
        return categorias[cat] || cat;
    }

    setupEventListeners() {
        // Filtros
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filtroAtual = e.target.dataset.filtro;
                this.carregarCatalogoNaTela();
            });
        });

        // Botões de adicionar
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-adicionar')) {
                const btn = e.target.closest('.btn-adicionar');
                const idVantagem = btn.dataset.vantagem;
                this.abrirModalVantagem(idVantagem);
            }
            
            // Remover vantagem adquirida
            if (e.target.closest('.btn-remover-vantagem')) {
                const btn = e.target.closest('.btn-remover-vantagem');
                const index = parseInt(btn.dataset.index);
                this.removerVantagem(index);
            }
        });

        // Busca
        const buscaInput = document.getElementById('buscaVantagens');
        if (buscaInput) {
            buscaInput.addEventListener('input', (e) => {
                this.filtrarPorTexto(e.target.value);
            });
        }

        // Fechar modal ao clicar fora
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modalVantagem');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    abrirModalVantagem(idVantagem) {
        const vantagem = getVantagemPorId(idVantagem);
        if (!vantagem) return;
        
        const modal = document.getElementById('modalVantagem');
        if (!modal) return;
        
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
            }
        }
        
        modal.querySelector('.vantagem-modal').innerHTML = conteudoModal;
        modal.style.display = 'block';
        
        this.setupModalEvents(vantagem);
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
                        <small>${opcao.desc} (${opcao.custo} pts)</small>
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

    setupModalEvents(vantagem) {
        const modal = document.getElementById('modalVantagem');
        const modalContent = modal.querySelector('.vantagem-modal');
        
        // Fechar modal
        modalContent.querySelector('.modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modalContent.querySelector('.btn-cancelar').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Confirmar adição
        const btnConfirmar = modalContent.querySelector('.btn-confirmar');
        btnConfirmar.addEventListener('click', () => {
            this.adicionarVantagem(vantagem);
            modal.style.display = 'none';
        });
        
        // Para Aptidão Mágica - calculadora de custo
        if (vantagem.configuracao && vantagem.configuracao.tipo === 'niveis-com-limites') {
            this.setupCalculadoraCusto(vantagem);
        }
        
        // Para opções múltiplas - atualizar custo
        if (vantagem.configuracao && vantagem.configuracao.tipo === 'opcoes-multiplas') {
            this.setupOpcoesMultiplas(vantagem);
        }
    }

    setupCalculadoraCusto(vantagem) {
        const atualizarCusto = () => {
            const nivelSelecionado = document.querySelector('input[name="nivel"]:checked');
            if (!nivelSelecionado) return;
            
            const custoBase = parseInt(nivelSelecionado.dataset.custo);
            
            // Calcular limitações
            let percentTotal = 0;
            document.querySelectorAll('input[name="limitacao"]:checked').forEach(check => {
                percentTotal += parseInt(check.dataset.percent);
            });
            
            // Calcular custo final
            let custoFinal = custoBase;
            if (percentTotal < 0) {
                custoFinal = Math.max(1, Math.floor(custoBase * (100 + percentTotal) / 100));
            }
            
            // Atualizar display
            document.getElementById('custoBaseCalc').textContent = custoBase;
            document.getElementById('custoLimitacoesCalc').textContent = `${percentTotal}%`;
            document.getElementById('custoTotalCalc').textContent = custoFinal;
            
            // Atualizar botão
            const btnConfirmar = document.getElementById('btnConfirmarVantagem');
            btnConfirmar.textContent = `Adicionar por ${custoFinal} pts`;
            btnConfirmar.dataset.custoFinal = custoFinal;
        };
        
        // Ouvir mudanças
        document.querySelectorAll('input[name="nivel"]').forEach(radio => {
            radio.addEventListener('change', atualizarCusto);
        });
        
        document.querySelectorAll('input[name="limitacao"]').forEach(check => {
            check.addEventListener('change', atualizarCusto);
        });
        
        atualizarCusto();
    }

    setupOpcoesMultiplas(vantagem) {
        const atualizarCusto = () => {
            const opcaoSelecionada = document.querySelector('input[name="opcao"]:checked');
            if (!opcaoSelecionada) return;
            
            const custo = parseInt(opcaoSelecionada.dataset.custo);
            document.getElementById('custoFinalOpcao').textContent = custo;
            
            const btnConfirmar = document.getElementById('btnConfirmarVantagem');
            btnConfirmar.textContent = `Adicionar por ${custo} pts`;
            btnConfirmar.dataset.custoFinal = custo;
            btnConfirmar.dataset.opcaoId = opcaoSelecionada.value;
        };
        
        document.querySelectorAll('input[name="opcao"]').forEach(radio => {
            radio.addEventListener('change', atualizarCusto);
        });
        
        atualizarCusto();
    }

    adicionarVantagem(vantagem) {
        const modal = document.getElementById('modalVantagem');
        const modalContent = modal.querySelector('.vantagem-modal');
        
        let detalhes = {
            nome: vantagem.nome,
            id: vantagem.id,
            categoria: vantagem.categoria,
            icone: vantagem.icone
        };
        
        let custoFinal = 0;
        
        // Determinar custo baseado no tipo de vantagem
        if (!vantagem.configuracao) {
            // Vantagem simples
            custoFinal = vantagem.custoBase;
            detalhes.tipo = 'simples';
            detalhes.descricao = vantagem.descricao;
            
        } else if (vantagem.configuracao.tipo === 'niveis-com-limites') {
            // Aptidão Mágica
            const nivelSelecionado = modalContent.querySelector('input[name="nivel"]:checked');
            const nivel = nivelSelecionado.value;
            const custoBase = parseInt(nivelSelecionado.dataset.custo);
            
            // Limitações selecionadas
            const limitacoes = [];
            modalContent.querySelectorAll('input[name="limitacao"]:checked').forEach(check => {
                limitacoes.push({
                    id: check.value,
                    percent: parseInt(check.dataset.percent)
                });
            });
            
            // Calcular custo final
            let percentTotal = limitacoes.reduce((sum, l) => sum + l.percent, 0);
            custoFinal = custoBase;
            if (percentTotal < 0) {
                custoFinal = Math.max(1, Math.floor(custoBase * (100 + percentTotal) / 100));
            }
            
            detalhes.tipo = 'nivel-com-limites';
            detalhes.nivel = nivel;
            detalhes.custoBase = custoBase;
            detalhes.limitacoes = limitacoes;
            detalhes.percentTotal = percentTotal;
            detalhes.descricao = `Aptidão Mágica ${nivel}` + 
                (limitacoes.length > 0 ? ` com ${limitacoes.map(l => l.id).join(', ')}` : '');
                
        } else if (vantagem.configuracao.tipo === 'opcoes-multiplas') {
            // Abençoado ou Adaptabilidade Cultural
            const opcaoSelecionada = modalContent.querySelector('input[name="opcao"]:checked');
            const opcaoId = opcaoSelecionada.value;
            custoFinal = parseInt(opcaoSelecionada.dataset.custo);
            
            const opcaoData = vantagem.configuracao.opcoes.find(o => o.id === opcaoId);
            
            detalhes.tipo = 'opcao-multipla';
            detalhes.opcaoId = opcaoId;
            detalhes.opcaoNome = opcaoData.nome;
            detalhes.descricao = opcaoData.desc;
        }
        
        detalhes.custo = custoFinal;
        detalhes.timestamp = Date.now();
        
        this.vantagensAdquiridas.push(detalhes);
        this.atualizarListaAdquiridas();
        this.atualizarContadores();
        
        // Feedback visual
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
        if (!container) return;
        
        if (this.vantagensAdquiridas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
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
        const textoLower = texto.toLowerCase();
        
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
        // Criar ou reusar elemento de feedback
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

    // Método para exportar dados (útil para salvar no personagem)
    exportarDados() {
        return {
            vantagens: this.vantagensAdquiridas,
            totalPontos: this.vantagensAdquiridas.reduce((sum, v) => sum + v.custo, 0)
        };
    }

    // Método para importar dados (útil para carregar personagem)
    importarDados(dados) {
        if (dados && dados.vantagens) {
            this.vantagensAdquiridas = dados.vantagens;
            this.atualizarListaAdquiridas();
            this.atualizarContadores();
        }
    }
}

// Inicializar sistema quando o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    window.vantagensSystem = new VantagensSystem();
});

// Expor para uso global
if (typeof window !== 'undefined') {
    window.VantagensSystem = VantagensSystem;
}