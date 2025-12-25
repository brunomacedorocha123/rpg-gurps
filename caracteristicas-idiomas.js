// ===========================================
// CARACTERÍSTICAS-IDIOMAS.JS
// Sistema de idiomas com desvantagens de alfabetização
// ===========================================

class SistemaIdiomas {
    constructor() {
        this.idiomaMaterno = {
            nome: 'Comum',
            nivelFala: 6,
            nivelEscrita: 6,
            custoTotal: 0
        };
        
        this.idiomasAdicionais = [];
        
        // Níveis de proficiência
        this.niveisFala = [
            { valor: 0, nome: 'Nenhum', custo: 0, descricao: 'Não fala o idioma' },
            { valor: 2, nome: 'Rudimentar', custo: 2, descricao: 'Vocabulário limitado, erros frequentes' },
            { valor: 4, nome: 'Sotaque', custo: 4, descricao: 'Pronúncia estrangeira perceptível' },
            { valor: 6, nome: 'Nativo', custo: 6, descricao: 'Fala como nativo' }
        ];
        
        this.niveisEscrita = [
            { valor: 0, nome: 'Nenhum', custo: 0, descricao: 'Não escreve o idioma' },
            { valor: 2, nome: 'Rudimentar', custo: 1, descricao: 'Escreve apenas palavras simples' },
            { valor: 4, nome: 'Sotaque', custo: 2, descricao: 'Escreve bem, mas com erros ocasionais' },
            { valor: 6, nome: 'Nativo', custo: 3, descricao: 'Escreve fluentemente' }
        ];
        
        // Desvantagens de alfabetização
        this.desvantagensAlfabetizacao = [
            { valor: 0, nome: 'Alfabetizado', descricao: 'Consegue ler e escrever normalmente', pontos: 0 },
            { valor: -2, nome: 'Semianalfabeto', descricao: 'Só consegue ler e escrever palavras simples', pontos: -2 },
            { valor: -3, nome: 'Analfabeto', descricao: 'Não consegue ler nem escrever', pontos: -3 }
        ];

        this.alfabetizacaoAtual = 0; // 0 = alfabetizado
        this.inicializado = false;
        this.carregarDoLocalStorage();
    }
    
    inicializar() {
        if (this.inicializado) return;
        
        this.configurarEventos();
        this.atualizarPreviewCusto();
        this.atualizarDisplay();
        this.inicializado = true;
        
        // Notificar sistema de pontos
        this.notificarAtualizacao();
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
        });
        
        // Eventos para alfabetização
        const radiosAlfabetizacao = document.querySelectorAll('input[name="alfabetizacao"]');
        radiosAlfabetizacao.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.alfabetizacaoAtual = parseInt(e.target.value);
                this.atualizarDescricaoAlfabetizacao();
                this.salvarNoLocalStorage();
                this.notificarAtualizacao();
            });
        });
        
        // Input do idioma materno
        const inputMaterno = document.getElementById('idiomaMaternoNome');
        if (inputMaterno) {
            inputMaterno.addEventListener('change', () => {
                this.idiomaMaterno.nome = inputMaterno.value;
                this.salvarNoLocalStorage();
            });
        }
    }
    
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
                preview.style.color = custo > 0 ? '#27ae60' : '#95a5a6';
            }
        }
    }
    
    adicionarIdioma() {
        const inputNome = document.getElementById('novoIdiomaNome');
        const nomeDigitado = inputNome ? inputNome.value.trim() : '';
        
        if (!nomeDigitado) {
            alert('Por favor, digite um nome para o idioma!');
            inputNome?.focus();
            return;
        }
        
        if (this.idiomaJaExiste(nomeDigitado)) {
            alert('Este idioma já foi adicionado!');
            return;
        }
        
        const selectFala = document.getElementById('novoIdiomaFala');
        const selectEscrita = document.getElementById('novoIdiomaEscrita');
        
        const nivelFala = selectFala ? parseInt(selectFala.value) : 2;
        const nivelEscrita = selectEscrita ? parseInt(selectEscrita.value) : 0;
        
        const custoTotal = this.calcularCustoIdioma(nivelFala, nivelEscrita);
        
        const novoIdioma = {
            id: Date.now(),
            nome: nomeDigitado,
            nivelFala: nivelFala,
            nivelEscrita: nivelEscrita,
            custoTotal: custoTotal,
            dataAdicao: new Date().toISOString()
        };
        
        this.idiomasAdicionais.push(novoIdioma);
        
        // Limpar formulário
        if (inputNome) {
            inputNome.value = '';
            inputNome.focus();
        }
        
        // Resetar para valores padrão
        if (selectFala) selectFala.value = '2';
        if (selectEscrita) selectEscrita.value = '0';
        
        this.atualizarPreviewCusto();
        this.atualizarDisplay();
        this.salvarNoLocalStorage();
        this.notificarAtualizacao();
    }

    idiomaJaExiste(nome) {
        return this.idiomasAdicionais.some(idioma => 
            idioma.nome.toLowerCase() === nome.toLowerCase()
        );
    }
    
    removerIdioma(id) {
        this.idiomasAdicionais = this.idiomasAdicionais.filter(i => i.id !== id);
        this.atualizarDisplay();
        this.salvarNoLocalStorage();
        this.notificarAtualizacao();
    }
    
    calcularCustoIdioma(nivelFala, nivelEscrita) {
        const nivelFalaObj = this.niveisFala.find(n => n.valor === nivelFala);
        const nivelEscritaObj = this.niveisEscrita.find(n => n.valor === nivelEscrita);
        
        const custoFala = nivelFalaObj ? nivelFalaObj.custo : 0;
        const custoEscrita = nivelEscritaObj ? nivelEscritaObj.custo : 0;
        
        return custoFala + custoEscrita;
    }
    
    calcularPontosIdiomas() {
        // Pontos dos idiomas adicionais
        const pontosIdiomas = this.idiomasAdicionais.reduce((total, idioma) => total + idioma.custoTotal, 0);
        
        // Adicionar desvantagem de alfabetização (valor negativo)
        const pontosAlfabetizacao = this.alfabetizacaoAtual;
        
        return pontosIdiomas + pontosAlfabetizacao;
    }
    
    atualizarDisplay() {
        this.atualizarListaIdiomas();
        this.atualizarPontos();
        this.atualizarDescricaoAlfabetizacao();
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
            
            return `
                <div class="idioma-item">
                    <div class="idioma-info">
                        <strong>${idioma.nome}</strong>
                        <div class="idioma-niveis">
                            <small><i class="fas fa-comment"></i> ${nivelFala} | <i class="fas fa-pen"></i> ${nivelEscrita}</small>
                        </div>
                    </div>
                    <div class="idioma-actions">
                        <span class="idioma-custo">+${idioma.custoTotal}</span>
                        <button class="btn-remove-idioma" data-id="${idioma.id}" title="Remover idioma">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    atualizarPontos() {
        const badge = document.getElementById('pontosIdiomas');
        if (badge) {
            const pontos = this.calcularPontosIdiomas();
            const textoPontos = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            
            badge.textContent = textoPontos;
            badge.className = 'pontos-badge';
            
            if (pontos > 0) {
                badge.classList.add('positivo');
            } else if (pontos < 0) {
                badge.classList.add('negativo');
            }
        }
    }
    
    atualizarDescricaoAlfabetizacao() {
        const descElement = document.getElementById('descAlfabetizacao');
        const desvantagem = this.desvantagensAlfabetizacao.find(d => d.valor === this.alfabetizacaoAtual);
        
        if (descElement && desvantagem) {
            descElement.textContent = desvantagem.descricao;
        }
        
        // Marcar o radio correto
        const radio = document.querySelector(`input[name="alfabetizacao"][value="${this.alfabetizacaoAtual}"]`);
        if (radio) {
            radio.checked = true;
        }
    }
    
    obterTextoNivel(nivel, tipo) {
        const niveis = tipo === 'fala' ? this.niveisFala : this.niveisEscrita;
        const nivelObj = niveis.find(n => n.valor === nivel);
        return nivelObj ? nivelObj.nome : 'Desconhecido';
    }

    notificarAtualizacao() {
        const pontos = this.calcularPontosIdiomas();
        const tipo = pontos >= 0 ? 'vantagem' : 'desvantagem';
        
        const evento = new CustomEvent('caracteristicasAtualizadas', {
            detail: {
                tipo: 'idiomas',
                pontos: pontos,
                tipoPontos: tipo,
                totalIdiomas: this.idiomasAdicionais.length,
                alfabetizacao: this.alfabetizacaoAtual,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(evento);
    }

    // LOCAL STORAGE
    salvarNoLocalStorage() {
        try {
            const dados = {
                idiomaMaterno: this.idiomaMaterno,
                idiomasAdicionais: this.idiomasAdicionais,
                alfabetizacao: this.alfabetizacaoAtual,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gurps_idiomas', JSON.stringify(dados));
        } catch (error) {
            console.warn('Não foi possível salvar idiomas:', error);
        }
    }

    carregarDoLocalStorage() {
        try {
            const dadosSalvos = localStorage.getItem('gurps_idiomas');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                
                if (dados.idiomaMaterno) {
                    this.idiomaMaterno = dados.idiomaMaterno;
                    const input = document.getElementById('idiomaMaternoNome');
                    if (input) input.value = this.idiomaMaterno.nome;
                }
                
                if (dados.idiomasAdicionais) {
                    this.idiomasAdicionais = dados.idiomasAdicionais;
                }
                
                if (dados.alfabetizacao !== undefined) {
                    this.alfabetizacaoAtual = dados.alfabetizacao;
                }
                
                return true;
            }
        } catch (error) {
            console.warn('Não foi possível carregar idiomas:', error);
        }
        return false;
    }

    // EXPORTAÇÃO DE DADOS
    exportarDados() {
        return {
            idiomas: {
                idiomaMaterno: this.idiomaMaterno,
                idiomasAdicionais: this.idiomasAdicionais,
                alfabetizacao: this.alfabetizacaoAtual,
                pontosTotais: this.calcularPontosIdiomas(),
                totalIdiomas: this.idiomasAdicionais.length
            }
        };
    }

    carregarDados(dados) {
        if (dados.idiomas) {
            if (dados.idiomas.idiomaMaterno) {
                this.idiomaMaterno = dados.idiomas.idiomaMaterno;
                const input = document.getElementById('idiomaMaternoNome');
                if (input) input.value = this.idiomaMaterno.nome;
            }
            
            if (dados.idiomas.idiomasAdicionais) {
                this.idiomasAdicionais = dados.idiomas.idiomasAdicionais;
            }
            
            if (dados.idiomas.alfabetizacao !== undefined) {
                this.alfabetizacaoAtual = dados.idiomas.alfabetizacao;
            }
            
            this.atualizarDisplay();
            return true;
        }
        return false;
    }

    // VALIDAÇÃO
    validarIdiomas() {
        const pontos = this.calcularPontosIdiomas();
        const desvantagem = this.desvantagensAlfabetizacao.find(d => d.valor === this.alfabetizacaoAtual);
        
        return {
            valido: true,
            pontos: pontos,
            totalIdiomas: this.idiomasAdicionais.length,
            alfabetizacao: desvantagem?.nome || 'Desconhecido',
            mensagem: `Idiomas: ${this.idiomasAdicionais.length} adicionais, ${desvantagem?.nome || 'Alfabetizado'} (${pontos >= 0 ? '+' : ''}${pontos} pts)`
        };
    }
}

// INICIALIZAÇÃO GLOBAL
let sistemaIdiomas = null;

function inicializarSistemaIdiomas() {
    if (!sistemaIdiomas) {
        sistemaIdiomas = new SistemaIdiomas();
    }
    sistemaIdiomas.inicializar();
    return sistemaIdiomas;
}

// EVENTOS DO DOM
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar quando a aba de características for ativa
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'caracteristicas' && tab.classList.contains('active')) {
                    // Verificar se é a sub-aba correta
                    const subtabAtiva = document.querySelector('#subtab-social-aparencia.active');
                    if (subtabAtiva) {
                        setTimeout(inicializarSistemaIdiomas, 100);
                    }
                }
            }
        });
    });

    // Observar a aba principal
    const tabCaracteristicas = document.getElementById('caracteristicas');
    if (tabCaracteristicas) {
        observer.observe(tabCaracteristicas, { attributes: true });
    }
});

// Evento para troca de sub-abas
document.addEventListener('click', function(e) {
    if (e.target.closest('.subtab-btn')) {
        const btn = e.target.closest('.subtab-btn');
        const subtabId = btn.dataset.subtab;
        
        if (subtabId === 'social-aparencia') {
            setTimeout(inicializarSistemaIdiomas, 100);
        }
    }
});

// SISTEMA DE SUB-ABAS
document.addEventListener('DOMContentLoaded', function() {
    // Configurar navegação entre sub-abas
    const subtabButtons = document.querySelectorAll('.subtab-btn');
    const subtabPanes = document.querySelectorAll('.subtab-pane');
    
    subtabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const subtabId = this.dataset.subtab;
            
            // Remover classe active de todos
            subtabButtons.forEach(btn => btn.classList.remove('active'));
            subtabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Adicionar classe active ao selecionado
            this.classList.add('active');
            const targetPane = document.getElementById(`subtab-${subtabId}`);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
});

// EXPORTAR PARA USO GLOBAL
window.SistemaIdiomas = SistemaIdiomas;
window.inicializarSistemaIdiomas = inicializarSistemaIdiomas;
window.sistemaIdiomas = sistemaIdiomas;