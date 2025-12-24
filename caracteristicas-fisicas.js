// =============================================
// caracteristicas-fisicas.js - SISTEMA COMPLETO
// =============================================

// SISTEMA PRINCIPAL DE CARACTERÍSTICAS FÍSICAS
class SistemaCaracteristicasFisicas {
    constructor() {
        // Configuração inicial
        this.caracteristicasSelecionadas = [];
        this.dadosVisuais = this.obterDadosVisuaisPadrao();
        this.inicializado = false;
        
        // Banco de dados das características
        this.bancoCaracteristicas = {
            "magro": { 
                pontos: -5,
                tipo: "desvantagem",
                nome: "Magro",
                efeitos: "Peso = 2/3 do normal. -2 ST vs derrubar, -2 Disfarce. HT máxima 14.",
                pesoMultiplicador: 0.67,
                modificadores: {
                    stDerrubar: -2,
                    disfarce: -2,
                    htMaxima: 14
                },
                icone: "fas fa-person-walking",
                conflitos: ["acima-peso", "gordo", "muito-gordo"]
            },
            "acima-peso": { 
                pontos: -1,
                tipo: "desvantagem", 
                nome: "Acima do Peso",
                efeitos: "Peso = 130% da média. -1 Disfarce, +1 Natação, +1 ST vs derrubar.",
                pesoMultiplicador: 1.3,
                modificadores: {
                    disfarce: -1,
                    natacao: 1,
                    stDerrubar: 1
                },
                icone: "fas fa-weight-hanging",
                conflitos: ["magro", "gordo", "muito-gordo"]
            },
            "gordo": { 
                pontos: -3,
                tipo: "desvantagem",
                nome: "Gordo",
                efeitos: "Peso = 150% da média. -2 Disfarce, +3 Natação, +2 ST vs derrubar. HT máxima 15.",
                pesoMultiplicador: 1.5,
                modificadores: {
                    disfarce: -2,
                    natacao: 3,
                    stDerrubar: 2,
                    htMaxima: 15
                },
                icone: "fas fa-weight-hanging",
                conflitos: ["magro", "acima-peso", "muito-gordo"]
            },
            "muito-gordo": { 
                pontos: -5,
                tipo: "desvantagem",
                nome: "Muito Gordo",
                efeitos: "Peso dobrado. -3 Disfarce, +5 Natação, +3 ST vs derrubar. HT máxima 13.",
                pesoMultiplicador: 2.0,
                modificadores: {
                    disfarce: -3,
                    natacao: 5,
                    stDerrubar: 3,
                    htMaxima: 13
                },
                icone: "fas fa-weight-hanging",
                conflitos: ["magro", "acima-peso", "gordo"]
            },
            "nanismo": { 
                pontos: -15,
                tipo: "desvantagem",
                nome: "Nanismo",
                efeitos: "Altura máxima: 1.32m. MT -1, -1 Deslocamento. -2 Disfarce/Perseguição.",
                modificadores: {
                    tamanho: -1,
                    deslocamento: -1,
                    disfarce: -2,
                    perseguicao: -2
                },
                icone: "fas fa-arrow-down",
                conflitos: ["gigantismo"]
            },
            "gigantismo": { 
                pontos: 0,
                tipo: "vantagem",
                nome: "Gigantismo",
                efeitos: "Altura acima do máximo racial. MT +1, +1 Deslocamento. -2 Disfarce/Perseguição.",
                modificadores: {
                    tamanho: 1,
                    deslocamento: 1,
                    disfarce: -2,
                    perseguicao: -2
                },
                icone: "fas fa-arrow-up",
                conflitos: ["nanismo"]
            }
        };

        // Inicialização
        this.inicializarQuandoPronto();
    }

    // ===== MÉTODOS DE INICIALIZAÇÃO =====

    inicializarQuandoPronto() {
        // Espera a aba de características físicas ser carregada
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const subtab = document.getElementById('fisicas-subtab');
                    if (subtab && subtab.style.display !== 'none') {
                        setTimeout(() => {
                            if (!this.inicializado) {
                                this.inicializar();
                            }
                        }, 100);
                    }
                }
            });
        });

        const fisicasSubtab = document.getElementById('fisicas-subtab');
        if (fisicasSubtab) {
            observer.observe(fisicasSubtab, { attributes: true });
        }

        // Também inicializar quando a aba principal for carregada
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                if (!this.inicializado) {
                    this.inicializar();
                }
            }, 500);
        });
    }

    inicializar() {
        if (this.inicializado) return;
        
        console.log('💪 Sistema de Características Físicas inicializando...');
        
        this.carregarDadosSalvos();
        this.configurarEventosCaracteristicas();
        this.configurarEventosVisuais();
        this.atualizarDisplayCaracteristicas();
        this.atualizarDisplayVisuais();
        this.inicializado = true;
        
        console.log('✅ Sistema de Características Físicas inicializado');
    }

    // ===== MÉTODOS PARA CARACTERÍSTICAS ESPECIAIS =====

    configurarEventosCaracteristicas() {
        // Configurar botões de adicionar características
        document.querySelectorAll('.btn-add-caracteristica').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tipo = e.currentTarget.dataset.tipo;
                this.toggleCaracteristica(tipo);
            });
        });

        // Eventos de entrada para características visuais
        document.querySelectorAll('.visual-input, .visual-select, .descricao-textarea').forEach(element => {
            element.addEventListener('input', () => {
                this.salvarDadosVisuais();
            });
            element.addEventListener('change', () => {
                this.salvarDadosVisuais();
            });
        });

        // Botão salvar características visuais
        const btnSalvar = document.querySelector('.btn-salvar');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => {
                this.salvarDadosVisuais();
                this.mostrarMensagem('Características visuais salvas!', 'sucesso');
            });
        }
    }

    toggleCaracteristica(tipo) {
        const caracteristica = this.bancoCaracteristicas[tipo];
        if (!caracteristica) return;

        const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
        
        if (jaSelecionada) {
            this.removerCaracteristica(jaSelecionada.id);
        } else {
            this.adicionarCaracteristica(tipo);
        }
    }

    adicionarCaracteristica(tipo) {
        const caracteristica = this.bancoCaracteristicas[tipo];
        if (!caracteristica) return;

        // Verificar conflitos
        this.removerCaracteristicasConflitantes(tipo);

        const caracteristicaObj = {
            id: Date.now() + Math.random(),
            tipo: tipo,
            nome: caracteristica.nome,
            pontos: caracteristica.pontos,
            efeitos: caracteristica.efeitos,
            pesoMultiplicador: caracteristica.pesoMultiplicador,
            modificadores: caracteristica.modificadores,
            icone: caracteristica.icone,
            dataAdicao: new Date()
        };

        this.caracteristicasSelecionadas.push(caracteristicaObj);
        this.atualizarDisplayCaracteristicas();
        this.salvarDados();
        
        // Comunicar com sistema de altura/peso
        this.comunicarComAlturaPeso();
        
        this.mostrarMensagem(`${caracteristica.nome} adicionado!`, 'sucesso');
    }

    removerCaracteristicasConflitantes(tipoNova) {
        const caracteristica = this.bancoCaracteristicas[tipoNova];
        if (!caracteristica || !caracteristica.conflitos) return;

        caracteristica.conflitos.forEach(tipoConflito => {
            this.removerCaracteristicaPorTipo(tipoConflito);
        });
    }

    removerCaracteristicaPorTipo(tipo) {
        const index = this.caracteristicasSelecionadas.findIndex(c => c.tipo === tipo);
        if (index !== -1) {
            const removida = this.caracteristicasSelecionadas[index];
            this.caracteristicasSelecionadas.splice(index, 1);
            this.atualizarDisplayCaracteristicas();
            this.salvarDados();
            this.comunicarComAlturaPeso();
            this.mostrarMensagem(`${removida.nome} removido!`, 'sucesso');
        }
    }

    removerCaracteristica(id) {
        const index = this.caracteristicasSelecionadas.findIndex(c => c.id === id);
        if (index !== -1) {
            const caracteristicaRemovida = this.caracteristicasSelecionadas[index];
            this.caracteristicasSelecionadas.splice(index, 1);
            this.atualizarDisplayCaracteristicas();
            this.salvarDados();
            this.comunicarComAlturaPeso();
            this.mostrarMensagem(`${caracteristicaRemovida.nome} removido!`, 'sucesso');
        }
    }

    // ===== MÉTODOS PARA CARACTERÍSTICAS VISUAIS =====

    configurarEventosVisuais() {
        // Configurar eventos para todos os campos visuais
        const camposVisuais = ['corOlhos', 'cabelo', 'corPele', 'genero', 'idade', 'maos', 'descricaoFisica'];
        
        camposVisuais.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', () => {
                    this.salvarDadosVisuais();
                });
                elemento.addEventListener('change', () => {
                    this.salvarDadosVisuais();
                });
            }
        });

        // Botão de salvar explícito
        const btnSalvar = document.querySelector('.btn-salvar');
        if (btnSalvar) {
            btnSalvar.addEventListener('click', () => {
                this.salvarDadosVisuaisCompleto();
            });
        }
    }

    salvarDadosVisuais() {
        this.dadosVisuais = {
            corOlhos: document.getElementById('corOlhos')?.value || 'Castanhos',
            cabelo: document.getElementById('cabelo')?.value || 'Castanho',
            corPele: document.getElementById('corPele')?.value || 'Clara',
            genero: document.getElementById('genero')?.value || 'Masculino',
            idade: parseInt(document.getElementById('idade')?.value) || 25,
            maos: document.getElementById('maos')?.value || 'Destro',
            descricaoFisica: document.getElementById('descricaoFisica')?.value || ''
        };
        
        this.salvarDados();
    }

    salvarDadosVisuaisCompleto() {
        this.salvarDadosVisuais();
        this.mostrarMensagem('Características visuais salvas com sucesso!', 'sucesso');
        
        // Disparar evento para outros sistemas
        const evento = new CustomEvent('caracteristicasVisuaisAlteradas', {
            detail: this.dadosVisuais
        });
        document.dispatchEvent(evento);
    }

    obterDadosVisuaisPadrao() {
        return {
            corOlhos: 'Castanhos',
            cabelo: 'Castanho',
            corPele: 'Clara',
            genero: 'Masculino',
            idade: 25,
            maos: 'Destro',
            descricaoFisica: 'Este personagem possui uma estatura média, com ombros largos e postura ereta. Seus cabelos castanhos são curtos e bem cuidados, e seus olhos castanhos transmitem uma expressão determinada. Uma pequena cicatriz percorre sua testa do lado esquerdo.'
        };
    }

    // ===== MÉTODOS DE DISPLAY =====

    atualizarDisplayCaracteristicas() {
        this.atualizarListaCaracteristicas();
        this.atualizarCaracteristicasSelecionadas();
        this.atualizarBadgePontos();
    }

    atualizarListaCaracteristicas() {
        const container = document.querySelector('.caracteristicas-lista');
        if (!container) return;

        container.innerHTML = Object.entries(this.bancoCaracteristicas).map(([tipo, dados]) => {
            const jaSelecionada = this.caracteristicasSelecionadas.find(c => c.tipo === tipo);
            const textoBotao = jaSelecionada ? 'Remover' : 'Adicionar';
            const classeBotao = jaSelecionada ? 'btn-add-caracteristica added' : 'btn-add-caracteristica';
            
            return `
                <div class="caracteristica-item" data-tipo="${tipo}">
                    <div class="caracteristica-info">
                        <strong>${dados.nome}</strong>
                        <small>${dados.pontos >= 0 ? '+' : ''}${dados.pontos} pts | ${dados.efeitos}</small>
                    </div>
                    <button class="${classeBotao}" data-tipo="${tipo}">
                        ${textoBotao}
                    </button>
                </div>
            `;
        }).join('');

        // Reconfigurar eventos dos botões
        this.reconfigurarEventosBotoes();
    }

    atualizarCaracteristicasSelecionadas() {
        const container = document.getElementById('caracteristicasSelecionadas');
        if (!container) return;

        if (this.caracteristicasSelecionadas.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; color: var(--wood-light); padding: 20px; font-style: italic;">
                    Nenhuma característica selecionada
                </div>
            `;
            return;
        }

        container.innerHTML = this.caracteristicasSelecionadas.map(carac => `
            <div class="caracteristica-selecionada">
                <div>
                    <strong style="color: var(--text-light);">${carac.nome}</strong>
                    <div class="efeitos" style="color: var(--wood-light); font-size: 0.85em; margin-top: 4px;">
                        ${carac.efeitos}
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="color: ${carac.pontos >= 0 ? '#27ae60' : '#e74c3c'}; font-weight: bold;">
                        ${carac.pontos >= 0 ? '+' : ''}${carac.pontos} pts
                    </span>
                    <button onclick="sistemaCaracteristicasFisicas.removerCaracteristica(${carac.id})" 
                            style="background: rgba(139, 0, 0, 0.3); color: #ff6b6b; border: 1px solid rgba(139, 0, 0, 0.3); border-radius: 5px; padding: 6px; cursor: pointer; transition: all 0.3s ease;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    atualizarBadgePontos() {
        const badge = document.getElementById('pontosCaracteristicas');
        if (badge) {
            const pontos = this.calcularPontosTotais();
            badge.textContent = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
            badge.style.background = pontos > 0 ? 'rgba(39, 174, 96, 0.3)' : 
                                    pontos < 0 ? 'rgba(231, 76, 60, 0.3)' : 'rgba(212, 175, 55, 0.3)';
            badge.style.color = pontos > 0 ? '#27ae60' : 
                              pontos < 0 ? '#e74c3c' : '#d4af37';
        }
    }

    atualizarDisplayVisuais() {
        // Preencher campos visuais com dados salvos
        if (this.dadosVisuais) {
            document.getElementById('corOlhos').value = this.dadosVisuais.corOlhos;
            document.getElementById('cabelo').value = this.dadosVisuais.cabelo;
            document.getElementById('corPele').value = this.dadosVisuais.corPele;
            document.getElementById('genero').value = this.dadosVisuais.genero;
            document.getElementById('idade').value = this.dadosVisuais.idade;
            document.getElementById('maos').value = this.dadosVisuais.maos;
            document.getElementById('descricaoFisica').value = this.dadosVisuais.descricaoFisica;
        }
    }

    reconfigurarEventosBotoes() {
        document.querySelectorAll('.btn-add-caracteristica').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tipo = e.currentTarget.dataset.tipo;
                this.toggleCaracteristica(tipo);
            });
        });
    }

    // ===== MÉTODOS DE CÁLCULO =====

    calcularPontosTotais() {
        return this.caracteristicasSelecionadas.reduce((total, carac) => total + carac.pontos, 0);
    }

    getMultiplicadorPeso() {
        const caracteristicaPeso = this.caracteristicasSelecionadas.find(c => c.pesoMultiplicador);
        return caracteristicaPeso ? caracteristicaPeso.pesoMultiplicador : 1.0;
    }

    temNanismo() {
        return this.caracteristicasSelecionadas.some(c => c.tipo === 'nanismo');
    }

    getModificadores() {
        const modificadores = {};
        
        this.caracteristicasSelecionadas.forEach(carac => {
            if (carac.modificadores) {
                Object.entries(carac.modificadores).forEach(([chave, valor]) => {
                    if (!modificadores[chave]) {
                        modificadores[chave] = 0;
                    }
                    modificadores[chave] += valor;
                });
            }
        });
        
        return modificadores;
    }

    // ===== COMUNICAÇÃO COM OUTROS SISTEMAS =====

    comunicarComAlturaPeso() {
        if (window.sistemaAlturaPeso) {
            // Disparar evento para sistema de altura/peso
            const evento = new CustomEvent('caracteristicasFisicasAlteradas', {
                detail: {
                    caracteristicas: this.caracteristicasSelecionadas,
                    multiplicadorPeso: this.getMultiplicadorPeso(),
                    temNanismo: this.temNanismo(),
                    modificadores: this.getModificadores()
                }
            });
            document.dispatchEvent(evento);
        }
    }

    // ===== PERSISTÊNCIA DE DADOS =====

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('sistemaCaracteristicasFisicas');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                
                // Carregar características selecionadas
                if (dados.caracteristicasSelecionadas) {
                    this.caracteristicasSelecionadas = dados.caracteristicasSelecionadas;
                }
                
                // Carregar dados visuais
                if (dados.dadosVisuais) {
                    this.dadosVisuais = dados.dadosVisuais;
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar dados salvos:', error);
        }
    }

    salvarDados() {
        try {
            const dadosParaSalvar = {
                caracteristicasSelecionadas: this.caracteristicasSelecionadas,
                dadosVisuais: this.dadosVisuais,
                pontosTotais: this.calcularPontosTotais(),
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('sistemaCaracteristicasFisicas', JSON.stringify(dadosParaSalvar));
            
            // Disparar evento de salvamento
            const evento = new CustomEvent('caracteristicasFisicasSalvas', {
                detail: dadosParaSalvar
            });
            document.dispatchEvent(evento);
            
        } catch (error) {
            console.warn('⚠️ Erro ao salvar dados:', error);
        }
    }

    // ===== SUPABASE E EXPORTAÇÃO =====

    exportarDados() {
        return {
            caracteristicasFisicas: {
                selecionadas: this.caracteristicasSelecionadas,
                pontosTotais: this.calcularPontosTotais(),
                modificadores: this.getModificadores(),
                multiplicadorPeso: this.getMultiplicadorPeso(),
                temNanismo: this.temNanismo()
            },
            caracteristicasVisuais: this.dadosVisuais
        };
    }

    carregarDados(dados) {
        try {
            // Carregar características físicas
            if (dados.caracteristicasFisicas && dados.caracteristicasFisicas.selecionadas) {
                this.caracteristicasSelecionadas = dados.caracteristicasFisicas.selecionadas;
            }
            
            // Carregar características visuais
            if (dados.caracteristicasVisuais) {
                this.dadosVisuais = dados.caracteristicasVisuais;
            }
            
            this.atualizarDisplayCaracteristicas();
            this.atualizarDisplayVisuais();
            this.comunicarComAlturaPeso();
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            return false;
        }
    }

    // ===== UTILITÁRIOS =====

    mostrarMensagem(mensagem, tipo) {
        const statusDiv = document.getElementById('statusCaracteristicasFisicas');
        if (!statusDiv) return;
        
        const cores = {
            sucesso: 'sucesso',
            erro: 'erro',
            info: 'info'
        };
        
        statusDiv.textContent = mensagem;
        statusDiv.className = `status-message ${cores[tipo] || 'info'}`;
        
        // Animar
        statusDiv.classList.add('pulse');
        setTimeout(() => {
            statusDiv.classList.remove('pulse');
        }, 500);
        
        // Auto-ocultar se for sucesso/erro
        if (tipo === 'sucesso' || tipo === 'erro') {
            setTimeout(() => {
                statusDiv.textContent = 'Sistema de características físicas pronto';
                statusDiv.className = 'status-message info';
            }, 3000);
        }
    }

    resetarParaPadrao() {
        this.caracteristicasSelecionadas = [];
        this.dadosVisuais = this.obterDadosVisuaisPadrao();
        
        this.atualizarDisplayCaracteristicas();
        this.atualizarDisplayVisuais();
        this.comunicarComAlturaPeso();
        this.salvarDados();
        
        this.mostrarMensagem('Dados resetados para padrão!', 'sucesso');
    }

    validarDados() {
        const erros = [];
        
        // Validar idade
        const idade = parseInt(document.getElementById('idade')?.value);
        if (idade < 0 || idade > 150 || isNaN(idade)) {
            erros.push('Idade inválida (0-150)');
        }
        
        // Validar descrição física
        const descricao = document.getElementById('descricaoFisica')?.value || '';
        if (descricao.length > 1000) {
            erros.push('Descrição física muito longa (max 1000 caracteres)');
        }
        
        return {
            valido: erros.length === 0,
            erros: erros,
            pontosCaracteristicas: this.calcularPontosTotais(),
            totalCaracteristicas: this.caracteristicasSelecionadas.length
        };
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaCaracteristicasFisicas;

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    sistemaCaracteristicasFisicas = new SistemaCaracteristicasFisicas();
    
    // Função global para abrir subtab
    window.openSubTab = function(subtabName) {
        // Esconder todas as subtabs
        document.querySelectorAll('.subtab-content').forEach(subtab => {
            subtab.classList.remove('active');
            subtab.style.display = 'none';
        });
        
        // Remover classe active de todos os botões
        document.querySelectorAll('.subtab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Mostrar a subtab selecionada
        const subtab = document.getElementById(`${subtabName}-subtab`);
        if (subtab) {
            subtab.classList.add('active');
            subtab.style.display = 'block';
            
            // Ativar o botão correspondente
            const btn = document.querySelector(`.subtab-btn[onclick*="${subtabName}"]`);
            if (btn) btn.classList.add('active');
            
            // Inicializar sistema se for a subtab de físicas
            if (subtabName === 'fisicas' && sistemaCaracteristicasFisicas && !sistemaCaracteristicasFisicas.inicializado) {
                setTimeout(() => {
                    sistemaCaracteristicasFisicas.inicializar();
                }, 100);
            }
        }
    };
    
    // Se a subtab física já estiver ativa, inicializar
    const fisicasSubtab = document.getElementById('fisicas-subtab');
    if (fisicasSubtab && fisicasSubtab.classList.contains('active')) {
        setTimeout(() => {
            if (sistemaCaracteristicasFisicas && !sistemaCaracteristicasFisicas.inicializado) {
                sistemaCaracteristicasFisicas.inicializar();
            }
        }, 300);
    }
});

// ===== FUNÇÕES GLOBAIS =====

// Função para salvar características visuais (chamada pelo HTML)
window.salvarCaracteristicasVisuais = function() {
    if (sistemaCaracteristicasFisicas) {
        sistemaCaracteristicasFisicas.salvarDadosVisuaisCompleto();
    }
};

// Função para obter dados completos
window.getDadosCaracteristicasFisicas = function() {
    return sistemaCaracteristicasFisicas ? sistemaCaracteristicasFisicas.exportarDados() : null;
};

// Função para validar dados
window.validarCaracteristicasFisicas = function() {
    return sistemaCaracteristicasFisicas ? sistemaCaracteristicasFisicas.validarDados() : { valido: false, erros: ['Sistema não inicializado'] };
};

// Função para resetar
window.resetarCaracteristicasFisicas = function() {
    if (sistemaCaracteristicasFisicas) {
        if (confirm('Tem certeza que deseja resetar todas as características físicas?')) {
            sistemaCaracteristicasFisicas.resetarParaPadrao();
        }
    }
};

// ===== EXPORTAÇÃO =====
window.SistemaCaracteristicasFisicas = SistemaCaracteristicasFisicas;
window.sistemaCaracteristicasFisicas = sistemaCaracteristicasFisicas;

console.log('💪 Sistema de Características Físicas carregado e pronto!');