// caracteristicas-idiomas.js
// ===== SISTEMA DE IDIOMAS - GURPS =====
// Baseado no código original fornecido

class SistemaIdiomas {
    constructor() {
        // Configurações iniciais
        this.idiomaMaterno = {
            nome: 'Comum',
            nivelFala: 6,
            nivelEscrita: 6,
            custoTotal: 0
        };
        
        this.idiomasAdicionais = [];
        
        // Desvantagens de alfabetização (NOVO!)
        this.desvantagensAlfabetizacao = [
            { id: 'analfabeto', nome: 'Analfabeto', pontos: -3, descricao: 'Não sabe ler nem escrever', icone: 'fas fa-book-dead', tipo: 'desvantagem' },
            { id: 'semi-analfabeto', nome: 'Semi-analfabeto', pontos: -2, descricao: 'Lê e escreve com extrema dificuldade', icone: 'fas fa-book-reader', tipo: 'desvantagem' }
        ];
        
        this.desvantagemSelecionada = null; // Pode ser 'analfabeto', 'semi-analfabeto' ou null
        
        // Níveis de proficiência em idiomas
        this.niveisFala = [
            { valor: 0, nome: 'Nenhum', custo: 0 },
            { valor: 2, nome: 'Rudimentar', custo: 2 },
            { valor: 4, nome: 'Sotaque', custo: 4 },
            { valor: 6, nome: 'Nativo', custo: 6 }
        ];
        
        this.niveisEscrita = [
            { valor: 0, nome: 'Nenhum', custo: 0 },
            { valor: 2, nome: 'Rudimentar', custo: 1 },
            { valor: 4, nome: 'Sotaque', custo: 2 },
            { valor: 6, nome: 'Nativo', custo: 3 }
        ];

        this.inicializado = false;
        
        // Inicializa quando a aba for carregada
        this.inicializarQuandoPronto();
    }
    
    inicializarQuandoPronto() {
        // Espera a aba de características ser carregada
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const tab = mutation.target;
                    if (tab.id === 'caracteristicas-tab' && tab.style.display !== 'none') {
                        setTimeout(() => {
                            if (!this.inicializado) {
                                this.inicializar();
                            }
                        }, 100);
                    }
                }
            });
        });

        const caracteristicasTab = document.getElementById('caracteristicas-tab');
        if (caracteristicasTab) {
            observer.observe(caracteristicasTab, { attributes: true });
        }
    }
    
    inicializar() {
        if (this.inicializado) return;
        
        console.log('🗣️ Sistema de Idiomas inicializando...');
        
        this.configurarEventos();
        this.atualizarPreviewCusto();
        this.atualizarDisplay();
        this.inicializado = true;
        this.notificarPontosTotais();
        
        console.log('✅ Sistema de Idiomas inicializado');
    }
    
    configurarEventos() {
        // Botão adicionar idioma
        const btnAdicionar = document.getElementById('btnAdicionarIdioma');
        if (btnAdicionar) {
            btnAdicionar.addEventListener('click', () => {
                this.adicionarIdioma();
            });
        }
        
        // Atualizar preview quando níveis mudarem
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        if (selectFala) {
            selectFala.addEventListener('change', () => this.atualizarPreviewCusto());
        }
        if (selectEscrita) {
            selectEscrita.addEventListener('change', () => this.atualizarPreviewCusto());
        }
        
        // Enter no input de novo idioma
        const inputNovoIdioma = document.getElementById('novoIdiomaNome');
        if (inputNovoIdioma) {
            inputNovoIdioma.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.adicionarIdioma();
                }
            });
        }
        
        // Event delegation para remoção de idiomas
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-remove-idioma')) {
                const button = e.target.closest('.btn-remove-idioma');
                const idiomaId = parseInt(button.dataset.id);
                this.removerIdioma(idiomaId);
            }
            
            // Desvantagens de alfabetização (NOVO!)
            if (e.target.closest('.btn-desvantagem-alfabetizacao')) {
                const button = e.target.closest('.btn-desvantagem-alfabetizacao');
                const desvantagemId = button.dataset.id;
                this.selecionarDesvantagemAlfabetizacao(desvantagemId);
            }
            
            // Remover desvantagem de alfabetização (NOVO!)
            if (e.target.closest('.btn-remove-desvantagem')) {
                this.removerDesvantagemAlfabetizacao();
            }
        });
        
        // Idioma materno
        const inputIdiomaMaterno = document.getElementById('idiomaMaternoNome');
        if (inputIdiomaMaterno) {
            inputIdiomaMaterno.addEventListener('input', () => {
                this.idiomaMaterno.nome = inputIdiomaMaterno.value;
                this.atualizarDisplay();
            });
        }
    }
    
    // ===== DESVANTAGENS DE ALFABETIZAÇÃO (NOVO!) =====
    
    selecionarDesvantagemAlfabetizacao(desvantagemId) {
        const desvantagem = this.desvantagensAlfabetizacao.find(d => d.id === desvantagemId);
        if (desvantagem) {
            this.desvantagemSelecionada = desvantagemId;
            
            // Se selecionar analfabeto ou semi-analfabeto, remover todos os idiomas com escrita
            if (desvantagemId === 'analfabeto' || desvantagemId === 'semi-analfabeto') {
                this.idiomasAdicionais = this.idiomasAdicionais.map(idioma => {
                    // Mantém o idioma, mas remove escrita
                    return {
                        ...idioma,
                        nivelEscrita: 0,
                        custoTotal: this.calcularCustoIdioma(idioma.nivelFala, 0)
                    };
                });
            }
            
            this.atualizarDisplay();
            this.notificarPontosTotais();
        }
    }
    
    removerDesvantagemAlfabetizacao() {
        this.desvantagemSelecionada = null;
        this.atualizarDisplay();
        this.notificarPontosTotais();
    }
    
    getDesvantagemAlfabetizacaoAtiva() {
        if (!this.desvantagemSelecionada) return null;
        return this.desvantagensAlfabetizacao.find(d => d.id === this.desvantagemSelecionada);
    }
    
    getPontosDesvantagemAlfabetizacao() {
        const desvantagem = this.getDesvantagemAlfabetizacaoAtiva();
        return desvantagem ? desvantagem.pontos : 0;
    }
    
    // ===== IDIOMAS ADICIONAIS =====
    
    atualizarPreviewCusto() {
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        if (selectFala && selectEscrita) {
            const nivelFala = parseInt(selectFala.value);
            const nivelEscrita = parseInt(selectEscrita.value);
            const custo = this.calcularCustoIdioma(nivelFala, nivelEscrita);
            
            const preview = document.getElementById('custoIdiomaPreview');
            if (preview) {
                preview.textContent = `${custo >= 0 ? '+' : ''}${custo} pts`;
                preview.style.color = custo >= 0 ? '#27ae60' : '#e74c3c';
            }
        }
    }
    
    adicionarIdioma() {
        const inputNome = document.getElementById('novoIdiomaNome');
        const nomeDigitado = inputNome ? inputNome.value.trim() : '';
        
        if (!nomeDigitado) {
            this.mostrarAlerta('Por favor, digite um nome para o idioma!', 'erro');
            inputNome?.focus();
            return;
        }
        
        if (this.idiomaJaExiste(nomeDigitado)) {
            this.mostrarAlerta('Este idioma já foi adicionado!', 'erro');
            return;
        }
        
        // Verificar se o jogador é analfabeto/semi-analfabeto
        const desvantagemAtiva = this.getDesvantagemAlfabetizacaoAtiva();
        if ((desvantagemAtiva?.id === 'analfabeto' || desvantagemAtiva?.id === 'semi-analfabeto')) {
            this.mostrarAlerta(`Você é ${desvantagemAtiva.nome.toLowerCase()}! A escrita será definida como "Nenhum".`, 'info');
        }
        
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        let nivelFala = selectFala ? parseInt(selectFala.value) : 2;
        let nivelEscrita = selectEscrita ? parseInt(selectEscrita.value) : 0;
        
        // Forçar escrita 0 se for analfabeto/semi-analfabeto
        if (desvantagemAtiva && (desvantagemAtiva.id === 'analfabeto' || desvantagemAtiva.id === 'semi-analfabeto')) {
            nivelEscrita = 0;
        }
        
        const custoTotal = this.calcularCustoIdioma(nivelFala, nivelEscrita);
        
        const novoIdioma = {
            id: Date.now(),
            nome: nomeDigitado,
            nivelFala: nivelFala,
            nivelEscrita: nivelEscrita,
            custoTotal: custoTotal
        };
        
        this.idiomasAdicionais.push(novoIdioma);
        
        // Limpar formulário
        if (inputNome) {
            inputNome.value = '';
            inputNome.focus();
        }
        
        if (selectFala) selectFala.value = '6'; // Reset para Nativo
        if (selectEscrita) selectEscrita.value = '0'; // Reset para Nenhum
        
        this.atualizarPreviewCusto();
        this.atualizarDisplay();
        this.notificarPontosTotais();
        
        this.mostrarAlerta(`Idioma "${nomeDigitado}" adicionado com sucesso!`, 'sucesso');
    }

    idiomaJaExiste(nome) {
        return this.idiomasAdicionais.some(idioma => 
            idioma.nome.toLowerCase() === nome.toLowerCase()
        );
    }
    
    removerIdioma(id) {
        this.idiomasAdicionais = this.idiomasAdicionais.filter(i => i.id !== id);
        this.atualizarDisplay();
        this.notificarPontosTotais();
        
        this.mostrarAlerta('Idioma removido!', 'info');
    }
    
    calcularCustoIdioma(nivelFala, nivelEscrita) {
        const nivelFalaObj = this.niveisFala.find(n => n.valor === nivelFala);
        const nivelEscritaObj = this.niveisEscrita.find(n => n.valor === nivelEscrita);
        
        const custoFala = nivelFalaObj ? nivelFalaObj.custo : 0;
        const custoEscrita = nivelEscritaObj ? nivelEscritaObj.custo : 0;
        
        return custoFala + custoEscrita;
    }
    
    calcularPontosIdiomas() {
        return this.idiomasAdicionais.reduce((total, idioma) => total + idioma.custoTotal, 0);
    }
    
    calcularPontosTotais() {
        const pontosIdiomas = this.calcularPontosIdiomas();
        const pontosDesvantagem = this.getPontosDesvantagemAlfabetizacao();
        return pontosIdiomas + pontosDesvantagem;
    }
    
    atualizarDisplay() {
        this.atualizarDesvantagensAlfabetizacao(); // NOVO!
        this.atualizarListaIdiomas();
        this.atualizarPontos();
        this.atualizarIdiomaMaterno();
    }
    
    // NOVO: Atualizar display das desvantagens de alfabetização
    atualizarDesvantagensAlfabetizacao() {
        const container = document.getElementById('desvantagensAlfabetizacaoContainer');
        if (!container) {
            // Criar container se não existir
            const antesLista = document.querySelector('.adicionar-idioma');
            if (antesLista) {
                const novoContainer = document.createElement('div');
                novoContainer.id = 'desvantagensAlfabetizacaoContainer';
                novoContainer.className = 'desvantagens-alfabetizacao';
                antesLista.parentNode.insertBefore(novoContainer, antesLista);
            } else {
                return;
            }
        }
        
        const desvantagemAtiva = this.getDesvantagemAlfabetizacaoAtiva();
        
        if (desvantagemAtiva) {
            container.innerHTML = `
                <div class="desvantagem-ativa" style="background: rgba(231, 76, 60, 0.1); border: 2px solid #e74c3c; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <i class="${desvantagemAtiva.icone}" style="color: #e74c3c;"></i>
                            <strong style="color: #e74c3c; margin-left: 10px;">${desvantagemAtiva.nome}</strong>
                            <div style="color: #fff; font-size: 0.9em; margin-top: 5px;">
                                <span style="color: #e74c3c; font-weight: bold;">${desvantagemAtiva.pontos} pts</span> | ${desvantagemAtiva.descricao}
                            </div>
                        </div>
                        <button class="btn-remove-desvantagem" style="background: #e74c3c; color: white; border: none; border-radius: 5px; padding: 5px 10px; cursor: pointer;">
                            <i class="fas fa-times"></i> Remover
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="desvantagens-opcoes" style="margin-bottom: 20px;">
                    <h4 style="color: var(--text-light); margin-bottom: 10px; font-size: 1.1rem;">
                        <i class="fas fa-exclamation-triangle"></i> Desvantagens de Alfabetização
                    </h4>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                        ${this.desvantagensAlfabetizacao.map(desv => `
                            <button class="btn-desvantagem-alfabetizacao" data-id="${desv.id}" 
                                style="background: rgba(231, 76, 60, 0.2); border: 2px solid #e74c3c; color: #e74c3c; padding: 10px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: bold;">
                                <i class="${desv.icone}"></i>
                                ${desv.nome} (${desv.pontos} pts)
                            </button>
                        `).join('')}
                    </div>
                    <div style="color: var(--wood-light); font-size: 0.9em; margin-top: 10px;">
                        Selecione uma desvantagem se seu personagem tiver dificuldades com leitura/escrita
                    </div>
                </div>
            `;
        }
    }
    
    atualizarListaIdiomas() {
        const container = document.getElementById('listaIdiomasAdicionais');
        const totalElement = document.getElementById('totalIdiomas');
        
        if (!container) return;
        
        if (totalElement) {
            totalElement.textContent = this.idiomasAdicionais.length;
        }

        if (this.idiomasAdicionais.length === 0) {
            container.innerHTML = '<div class="empty-state">Nenhum idioma adicional adicionado</div>';
            return;
        }
        
        container.innerHTML = this.idiomasAdicionais.map(idioma => {
            const nivelFala = this.obterTextoNivel(idioma.nivelFala, 'fala');
            const nivelEscrita = this.obterTextoNivel(idioma.nivelEscrita, 'escrita');
            const desvantagemAtiva = this.getDesvantagemAlfabetizacaoAtiva();
            
            let escritaIcone = '📝';
            if (desvantagemAtiva && (desvantagemAtiva.id === 'analfabeto' || desvantagemAtiva.id === 'semi-analfabeto')) {
                escritaIcone = '🚫'; // Bloqueado se for analfabeto
            }
            
            return `
                <div class="idioma-item">
                    <div class="idioma-info">
                        <strong>${idioma.nome}</strong>
                        <div class="idioma-niveis">
                            <small>🗣️ ${nivelFala} | ${escritaIcone} ${nivelEscrita}</small>
                        </div>
                    </div>
                    <div class="idioma-actions">
                        <span class="idioma-custo" style="background: ${idioma.custoTotal > 0 ? 'rgba(39, 174, 96, 0.3)' : 'rgba(149, 165, 166, 0.3)'}; color: ${idioma.custoTotal > 0 ? '#27ae60' : '#95a5a6'};">+${idioma.custoTotal}</span>
                        <button class="btn-remove-idioma" data-id="${idioma.id}">
                            <i class="fas fa-trash" style="color: #e74c3c;"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    atualizarIdiomaMaterno() {
        const desvantagemAtiva = this.getDesvantagemAlfabetizacaoAtiva();
        const elementoNativo = document.querySelector('.idioma-materno-nativo');
        
        if (elementoNativo) {
            if (desvantagemAtiva && (desvantagemAtiva.id === 'analfabeto' || desvantagemAtiva.id === 'semi-analfabeto')) {
                elementoNativo.innerHTML = `
                    <div style="color: #e74c3c;">
                        <i class="fas fa-exclamation-circle"></i> Nativo (0 pts)<br>
                        <small style="color: #e74c3c; font-size: 0.8em;">${desvantagemAtiva.nome} - escrita bloqueada</small>
                    </div>
                `;
            } else {
                elementoNativo.innerHTML = 'Nativo (0 pts)';
            }
        }
    }
    
    atualizarPontos() {
        const badge = document.getElementById('pontosIdiomas');
        if (badge) {
            const pontos = this.calcularPontosTotais();
            const pontosTexto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            badge.textContent = pontosTexto;
            
            // Cor baseada nos pontos
            if (pontos < 0) {
                badge.style.background = '#e74c3c'; // Vermelho para desvantagem
                badge.style.color = '#fff';
            } else if (pontos > 0) {
                badge.style.background = '#27ae60'; // Verde para vantagem
                badge.style.color = '#fff';
            } else {
                badge.style.background = '#95a5a6'; // Cinza para neutro
                badge.style.color = '#fff';
            }
            
            badge.style.fontWeight = 'bold';
        }
    }
    
    obterTextoNivel(nivel, tipo) {
        const niveis = tipo === 'fala' ? this.niveisFala : this.niveisEscrita;
        const nivelObj = niveis.find(n => n.valor === nivel);
        return nivelObj ? nivelObj.nome : 'Desconhecido';
    }
    
    mostrarAlerta(mensagem, tipo = 'info') {
        // Você pode implementar um sistema de toast ou usar alert
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        
        // Exemplo simples com alert
        // alert(mensagem);
    }
    
    notificarPontosTotais() {
        const pontos = this.calcularPontosTotais();
        const pontosIdiomas = this.calcularPontosIdiomas();
        const pontosDesvantagem = this.getPontosDesvantagemAlfabetizacao();
        
        const evento = new CustomEvent('idiomasPontosAtualizados', {
            detail: {
                pontosTotais: pontos,
                pontosIdiomas: pontosIdiomas,
                pontosDesvantagem: pontosDesvantagem,
                totalIdiomas: this.idiomasAdicionais.length,
                desvantagemAlfabetizacao: this.getDesvantagemAlfabetizacaoAtiva(),
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
        
        // Notificar sistema principal
        const eventoPrincipal = new CustomEvent('caracteristicasPontosAtualizados', {
            detail: {
                tipo: 'idiomas',
                pontos: pontos,
                custoAbsoluto: Math.abs(pontos),
                isVantagem: pontos > 0,
                isDesvantagem: pontos < 0,
                detalhes: {
                    idiomas: this.idiomasAdicionais.length,
                    desvantagem: this.desvantagemSelecionada
                }
            }
        });
        document.dispatchEvent(eventoPrincipal);
    }

    // ===== MÉTODOS PARA INTEGRAÇÃO =====
    
    exportarDados() {
        return {
            idiomaMaterno: this.idiomaMaterno,
            idiomasAdicionais: this.idiomasAdicionais,
            desvantagemAlfabetizacao: this.desvantagemSelecionada,
            pontosTotais: this.calcularPontosTotais(),
            pontosIdiomas: this.calcularPontosIdiomas(),
            pontosDesvantagem: this.getPontosDesvantagemAlfabetizacao()
        };
    }

    carregarDados(dados) {
        if (dados.idiomaMaterno) {
            this.idiomaMaterno = dados.idiomaMaterno;
            const input = document.getElementById('idiomaMaternoNome');
            if (input) input.value = this.idiomaMaterno.nome;
        }
        
        if (dados.idiomasAdicionais) {
            this.idiomasAdicionais = dados.idiomasAdicionais;
        }
        
        if (dados.desvantagemAlfabetizacao) {
            this.desvantagemSelecionada = dados.desvantagemAlfabetizacao;
        }
        
        this.atualizarDisplay();
        this.notificarPontosTotais();
    }

    resetarParaPadrao() {
        this.idiomaMaterno = {
            nome: 'Comum',
            nivelFala: 6,
            nivelEscrita: 6,
            custoTotal: 0
        };
        
        this.idiomasAdicionais = [];
        this.desvantagemSelecionada = null;
        
        const input = document.getElementById('idiomaMaternoNome');
        if (input) input.value = 'Comum';
        
        this.atualizarDisplay();
        this.notificarPontosTotais();
    }

    validarIdiomas() {
        const pontos = this.calcularPontosTotais();
        const totalIdiomas = this.idiomasAdicionais.length;
        const desvantagem = this.getDesvantagemAlfabetizacaoAtiva();
        
        let mensagem = `Idiomas: ${totalIdiomas} idioma(s) adicional(is)`;
        if (desvantagem) {
            mensagem += ` | ${desvantagem.nome} (${desvantagem.pontos} pts)`;
        }
        mensagem += ` | Total: ${pontos >= 0 ? '+' : ''}${pontos} pts`;
        
        return {
            valido: true,
            pontos: pontos,
            totalIdiomas: totalIdiomas,
            desvantagem: desvantagem,
            mensagem: mensagem
        };
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaIdiomas;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    sistemaIdiomas = new SistemaIdiomas();
    
    // Também inicializar se a aba já estiver ativa
    const caracteristicasTab = document.getElementById('caracteristicas-tab');
    if (caracteristicasTab && caracteristicasTab.style.display !== 'none') {
        setTimeout(() => {
            if (sistemaIdiomas && !sistemaIdiomas.inicializado) {
                sistemaIdiomas.inicializar();
            }
        }, 300);
    }
});

// ===== FUNÇÕES GLOBAIS PARA ACESSO =====
window.adicionarIdioma = function() {
    if (sistemaIdiomas) {
        sistemaIdiomas.adicionarIdioma();
    }
};

window.getPontosIdiomas = function() {
    return sistemaIdiomas ? sistemaIdiomas.calcularPontosTotais() : 0;
};

window.getIdiomasDetalhes = function() {
    if (!sistemaIdiomas) return null;
    
    return {
        idiomaMaterno: sistemaIdiomas.idiomaMaterno,
        idiomasAdicionais: sistemaIdiomas.idiomasAdicionais,
        desvantagem: sistemaIdiomas.getDesvantagemAlfabetizacaoAtiva(),
        pontosTotais: sistemaIdiomas.calcularPontosTotais()
    };
};

window.validarIdiomas = function() {
    return sistemaIdiomas ? sistemaIdiomas.validarIdiomas() : { valido: false, mensagem: 'Sistema não inicializado' };
};

// Exportar para uso em outros sistemas
window.SistemaIdiomas = SistemaIdiomas;
window.sistemaIdiomas = sistemaIdiomas;

console.log('📦 Sistema de Idiomas carregado e pronto!');