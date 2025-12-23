// dashboard.js - VERSÃO 100% COMPLETA E FUNCIONAL
class DashboardManager {
    constructor() {
        this.estado = {
            pontos: {
                total: 150,
                gastosAtributos: 0,
                gastosVantagens: 0,
                gastosDesvantagens: 0,
                gastosPericias: 0,
                gastosMagias: 0,
                gastosTecnicas: 0,
                gastosPeculiaridades: 0,
                gastosCaracteristicas: 0,
                saldoDisponivel: 150,
                limiteDesvantagens: -50,
                pontosGastosTotal: 0
            },
            caracteristicas: {
                aparência: 0,
                riqueza: 0,
                idiomas: 0,
                fisicas: 0
            },
            atributos: {
                ST: 10,
                DX: 10,
                IQ: 10,
                HT: 10,
                PV: { atual: 10, max: 10 },
                PF: { atual: 10, max: 10 },
                Vontade: 10,
                Percepcao: 10,
                Deslocamento: 5.00
            },
            identificacao: {
                raca: '',
                classe: '',
                nivel: '',
                descricao: ''
            },
            financeiro: {
                riqueza: 'Médio',
                saldo: '$2.000',
                aparencia: 'Média'
            },
            foto: null
        };
        
        this.fotoTemporaria = null;
        this.monitorAtivo = false;
        this.intervaloMonitor = null;
        this.ultimosAtributos = { ST: 10, DX: 10, IQ: 10, HT: 10 };
        this.ultimaAtualizacaoAtributos = 0;
        this.autoSaveTimeout = null;
        
        console.log('DashboardManager criado');
    }

    inicializar() {
        if (this.monitorAtivo) {
            console.log('DashboardManager já está ativo');
            return this;
        }
        
        console.log('Iniciando DashboardManager...');
        
        try {
            // Configurar eventos
            this.configurarEventosBasicos();
            this.configurarEventosAtributos();
            this.configurarEventosExternos();
            this.configurarBotoesVitalidade();
            this.configurarSistemaFoto();
            
            // Carregar dados iniciais
            this.carregarValoresIniciais();
            
            // Iniciar monitoramento
            this.iniciarMonitoramentoContinuo();
            
            // Forçar atualização inicial
            setTimeout(() => {
                this.calcularPontosAtributos();
                this.atualizarAtributosDerivados();
                this.recalcularSaldoCompleto();
                this.atualizarDisplayCompleto();
            }, 100);
            
            this.monitorAtivo = true;
            console.log('✅ DashboardManager inicializado com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar DashboardManager:', error);
        }
        
        return this;
    }

    // ==================== CONFIGURAÇÃO DE EVENTOS ====================
    configurarEventosBasicos() {
        // Pontos totais
        const pontosTotais = document.getElementById('pontosTotais');
        if (pontosTotais) {
            pontosTotais.addEventListener('change', (e) => {
                this.estado.pontos.total = parseInt(e.target.value) || 150;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            });
        }

        // Limite de desvantagens
        const limiteDesvantagens = document.getElementById('limiteDesvantagens');
        if (limiteDesvantagens) {
            limiteDesvantagens.addEventListener('change', (e) => {
                this.estado.pontos.limiteDesvantagens = parseInt(e.target.value) || -50;
                this.salvarAuto();
            });
        }

        // Identificação
        ['dashboardRaca', 'dashboardClasse', 'dashboardNivel'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', (e) => {
                    const campo = id.replace('dashboard', '').toLowerCase();
                    this.estado.identificacao[campo] = e.target.value;
                    this.salvarAuto();
                });
            }
        });

        // Descrição
        const descricao = document.getElementById('dashboardDescricao');
        if (descricao) {
            descricao.addEventListener('input', (e) => {
                this.estado.identificacao.descricao = e.target.value;
                const contador = document.getElementById('contadorDescricao');
                if (contador) contador.textContent = e.target.value.length;
                this.salvarAuto();
            });
        }
    }

    configurarEventosAtributos() {
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('change', () => this.verificarAtualizacaoAtributos());
                input.addEventListener('input', () => this.verificarAtualizacaoAtributos());
            }
        });
    }

    configurarEventosExternos() {
        // Aparência (compatível com SistemaAparencia)
        document.addEventListener('aparenciaAtualizada', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('📊 Aparência atualizada no dashboard:', e.detail.pontos);
                this.estado.caracteristicas.aparência = e.detail.pontos;
                this.recalcularGastosCaracteristicas();
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayResumo();
                this.salvarAuto();
            }
        });

        // Vantagens/Desvantagens
        document.addEventListener('vantagensAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.atualizarVantagensDesvantagens(e.detail.total);
            }
        });

        // Perícias
        document.addEventListener('periciasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPericias = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });

        // Magias
        document.addEventListener('magiasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosMagias = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });

        // Técnicas
        document.addEventListener('tecnicasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosTecnicas = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });

        // Peculiaridades
        document.addEventListener('peculiaridadesAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPeculiaridades = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });
    }

    configurarSistemaFoto() {
        const fotoUpload = document.getElementById('fotoUpload');
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        const btnRemoverFoto = document.getElementById('btnRemoverFoto');

        if (!fotoUpload || !fotoPreview) return;

        // Upload de foto
        fotoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoPreview.src = e.target.result;
                    fotoPreview.style.display = 'block';
                    if (fotoPlaceholder) fotoPlaceholder.style.display = 'none';
                    if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
                    
                    this.estado.foto = {
                        file: file,
                        dataUrl: e.target.result,
                        nome: file.name,
                        tipo: file.type,
                        tamanho: file.size
                    };
                    this.salvarAuto();
                };
                reader.readAsDataURL(file);
            }
        });

        // Remover foto
        if (btnRemoverFoto) {
            btnRemoverFoto.addEventListener('click', () => {
                fotoPreview.src = '';
                fotoPreview.style.display = 'none';
                if (fotoPlaceholder) fotoPlaceholder.style.display = 'flex';
                btnRemoverFoto.style.display = 'none';
                fotoUpload.value = '';
                this.estado.foto = null;
                this.salvarAuto();
            });
        }
    }

    configurarBotoesVitalidade() {
        // Botões PV
        const btnPVMais = document.getElementById('btnPVMais');
        const btnPVMenos = document.getElementById('btnPVMenos');
        const btnPFMais = document.getElementById('btnPFMais');
        const btnPFMenos = document.getElementById('btnPFMenos');

        if (btnPVMais) btnPVMais.addEventListener('click', () => this.ajustarPV(1));
        if (btnPVMenos) btnPVMenos.addEventListener('click', () => this.ajustarPV(-1));
        if (btnPFMais) btnPFMais.addEventListener('click', () => this.ajustarPF(1));
        if (btnPFMenos) btnPFMenos.addEventListener('click', () => this.ajustarPF(-1));
    }

    // ==================== CÁLCULOS ====================
    calcularPontosAtributos() {
        const st = this.obterValorElemento('ST', 10);
        const dx = this.obterValorElemento('DX', 10);
        const iq = this.obterValorElemento('IQ', 10);
        const ht = this.obterValorElemento('HT', 10);
        
        const custoST = (st - 10) * 10;
        const custoDX = (dx - 10) * 20;
        const custoIQ = (iq - 10) * 20;
        const custoHT = (ht - 10) * 10;
        
        const totalGastos = custoST + custoDX + custoIQ + custoHT;
        
        if (this.estado.pontos.gastosAtributos !== totalGastos) {
            this.estado.pontos.gastosAtributos = totalGastos;
            return true;
        }
        
        return false;
    }

    obterValorElemento(id, padrao) {
        const elemento = document.getElementById(id);
        if (!elemento) return padrao;
        
        if (elemento.tagName === 'INPUT') {
            return parseInt(elemento.value) || padrao;
        } else if (elemento.tagName === 'DIV' || elemento.tagName === 'SPAN') {
            return parseInt(elemento.textContent) || padrao;
        }
        
        return padrao;
    }

    recalcularGastosCaracteristicas() {
        const total = 
            this.estado.caracteristicas.aparência +
            this.estado.caracteristicas.riqueza +
            this.estado.caracteristicas.idiomas +
            this.estado.caracteristicas.fisicas;
        
        this.estado.pontos.gastosCaracteristicas = total;
    }

    atualizarVantagensDesvantagens(total) {
        if (total >= 0) {
            this.estado.pontos.gastosVantagens = total;
            this.estado.pontos.gastosDesvantagens = 0;
        } else {
            this.estado.pontos.gastosVantagens = 0;
            this.estado.pontos.gastosDesvantagens = Math.abs(total);
        }
        
        this.recalcularSaldoCompleto();
        this.atualizarDisplayPontos();
        this.salvarAuto();
    }

    recalcularSaldoCompleto() {
        const total = this.estado.pontos.total;
        
        // Gastos positivos (vantagens, atributos, etc.)
        const gastosPositivos = 
            this.estado.pontos.gastosAtributos + 
            this.estado.pontos.gastosVantagens + 
            this.estado.pontos.gastosPericias + 
            this.estado.pontos.gastosMagias +
            this.estado.pontos.gastosTecnicas +
            this.estado.pontos.gastosPeculiaridades +
            this.estado.pontos.gastosCaracteristicas;
        
        // Gastos negativos (desvantagens)
        const gastosNegativos = this.estado.pontos.gastosDesvantagens;
        
        // Cálculo final
        this.estado.pontos.saldoDisponivel = total - gastosPositivos + gastosNegativos;
        this.estado.pontos.pontosGastosTotal = gastosPositivos - gastosNegativos;
    }

    atualizarAtributosDerivados() {
        const st = this.obterValorElemento('ST', 10);
        const dx = this.obterValorElemento('DX', 10);
        const iq = this.obterValorElemento('IQ', 10);
        const ht = this.obterValorElemento('HT', 10);
        
        // Atualizar valores base
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        
        // Calcular PV e PF
        const pvMax = st;
        const pfMax = ht;
        
        this.estado.atributos.PV.max = pvMax;
        this.estado.atributos.PF.max = pfMax;
        
        // Ajustar valores atuais
        if (this.estado.atributos.PV.atual > pvMax) this.estado.atributos.PV.atual = pvMax;
        if (this.estado.atributos.PF.atual > pfMax) this.estado.atributos.PF.atual = pfMax;
        
        // Atributos derivados
        this.estado.atributos.Vontade = iq;
        this.estado.atributos.Percepcao = iq;
        this.estado.atributos.Deslocamento = (ht + dx) / 4;
        
        // Atualizar display
        this.atualizarDisplayAtributos();
    }

    // ==================== MONITORAMENTO ====================
    iniciarMonitoramentoContinuo() {
        if (this.intervaloMonitor) clearInterval(this.intervaloMonitor);
        
        this.intervaloMonitor = setInterval(() => {
            this.verificarMudancasAtributos();
        }, 300);
    }

    verificarMudancasAtributos() {
        const st = this.obterValorElemento('ST', 10);
        const dx = this.obterValorElemento('DX', 10);
        const iq = this.obterValorElemento('IQ', 10);
        const ht = this.obterValorElemento('HT', 10);
        
        if (st !== this.ultimosAtributos.ST || 
            dx !== this.ultimosAtributos.DX || 
            iq !== this.ultimosAtributos.IQ || 
            ht !== this.ultimosAtributos.HT) {
            
            this.ultimosAtributos = { ST: st, DX: dx, IQ: iq, HT: ht };
            this.verificarAtualizacaoAtributos();
        }
    }

    verificarAtualizacaoAtributos() {
        const agora = Date.now();
        if (agora - this.ultimaAtualizacaoAtributos < 100) return;
        
        this.ultimaAtualizacaoAtributos = agora;
        
        const atributosMudaram = this.calcularPontosAtributos();
        this.atualizarAtributosDerivados();
        
        if (atributosMudaram) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayPontos();
            this.salvarAuto();
        }
    }

    // ==================== DISPLAY ====================
    atualizarDisplayCompleto() {
        this.atualizarDisplayAtributos();
        this.atualizarDisplayPontos();
        this.atualizarDisplayFinanceiro();
        this.atualizarDisplayResumo();
    }

    atualizarDisplayAtributos() {
        const { ST, DX, IQ, HT, PV, PF, Vontade, Percepcao, Deslocamento } = this.estado.atributos;
        
        // Atributos básicos
        this.atualizarElemento('atributoST', ST);
        this.atualizarElemento('atributoDX', DX);
        this.atualizarElemento('atributoIQ', IQ);
        this.atualizarElemento('atributoHT', HT);
        
        // Vitalidade
        this.atualizarElemento('valorPV', `${PV.atual}/${PV.max}`);
        this.atualizarElemento('valorPF', `${PF.atual}/${PF.max}`);
        
        // Barras
        const porcentagemPV = (PV.atual / PV.max) * 100;
        const porcentagemPF = (PF.atual / PF.max) * 100;
        this.atualizarBarra('barraPV', porcentagemPV);
        this.atualizarBarra('barraPF', porcentagemPF);
        
        // Atributos derivados
        this.atualizarElemento('VontadeTotal', Vontade);
        this.atualizarElemento('PercepcaoTotal', Percepcao);
        this.atualizarElemento('DeslocamentoTotal', Deslocamento.toFixed(2));
        this.atualizarElemento('PVTotal', PV.max);
        this.atualizarElemento('PFTotal', PF.max);
    }

    atualizarDisplayPontos() {
        // Saldo disponível
        this.atualizarElemento('saldoDisponivel', this.estado.pontos.saldoDisponivel);
        
        // Pontos totais
        const pontosTotaisElement = document.getElementById('pontosTotais');
        if (pontosTotaisElement) {
            pontosTotaisElement.value = this.estado.pontos.total;
        }
    }

    atualizarDisplayFinanceiro() {
        const saldoPersonagem = document.getElementById('saldoPersonagem');
        if (saldoPersonagem) {
            saldoPersonagem.textContent = this.estado.financeiro.saldo;
        }
    }

    atualizarDisplayResumo() {
        // Gastos
        this.atualizarElemento('gastosAtributos', this.estado.pontos.gastosAtributos);
        this.atualizarElemento('gastosVantagens', this.estado.pontos.gastosVantagens);
        this.atualizarElemento('gastosDesvantagens', this.estado.pontos.gastosDesvantagens);
        this.atualizarElemento('totalLiquido', this.estado.pontos.saldoDisponivel);
        
        // Características
        const gastosCaracteristicas = document.getElementById('gastosCaracteristicas');
        if (gastosCaracteristicas) {
            gastosCaracteristicas.textContent = this.estado.pontos.gastosCaracteristicas;
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        
        const valorFormatado = typeof valor === 'number' 
            ? (id.includes('Deslocamento') ? valor.toFixed(2) : valor.toString())
            : (valor || '');
        
        if (elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT' || elemento.tagName === 'TEXTAREA') {
            if (elemento.value !== valorFormatado) {
                elemento.value = valorFormatado;
            }
        } else {
            if (elemento.textContent !== valorFormatado) {
                elemento.textContent = valorFormatado;
            }
        }
    }

    atualizarBarra(id, percentual) {
        const barra = document.getElementById(id);
        if (barra) {
            const percentualLimitado = Math.min(Math.max(percentual, 0), 100);
            barra.style.width = `${percentualLimitado}%`;
        }
    }

    // ==================== CONTROLES ====================
    ajustarPV(valor) {
        const novoPV = this.estado.atributos.PV.atual + valor;
        this.estado.atributos.PV.atual = Math.max(0, Math.min(novoPV, this.estado.atributos.PV.max));
        this.atualizarDisplayAtributos();
        this.salvarAuto();
    }

    ajustarPF(valor) {
        const novoPF = this.estado.atributos.PF.atual + valor;
        this.estado.atributos.PF.atual = Math.max(0, Math.min(novoPF, this.estado.atributos.PF.max));
        this.atualizarDisplayAtributos();
        this.salvarAuto();
    }

    // ==================== CARREGAMENTO INICIAL ====================
    carregarValoresIniciais() {
        try {
            const dadosSalvos = localStorage.getItem('gurps_dashboard_data');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                
                // Carregar identificação
                if (dados.identificacao) {
                    this.estado.identificacao = { ...this.estado.identificacao, ...dados.identificacao };
                    this.atualizarElemento('dashboardRaca', this.estado.identificacao.raca);
                    this.atualizarElemento('dashboardClasse', this.estado.identificacao.classe);
                    this.atualizarElemento('dashboardNivel', this.estado.identificacao.nivel);
                    this.atualizarElemento('dashboardDescricao', this.estado.identificacao.descricao);
                }
                
                // Carregar pontos
                if (dados.pontos) {
                    this.estado.pontos = { ...this.estado.pontos, ...dados.pontos };
                    this.atualizarElemento('pontosTotais', this.estado.pontos.total);
                    this.atualizarElemento('limiteDesvantagens', this.estado.pontos.limiteDesvantagens);
                }
                
                // Carregar características
                if (dados.caracteristicas) {
                    this.estado.caracteristicas = { ...this.estado.caracteristicas, ...dados.caracteristicas };
                    this.recalcularGastosCaracteristicas();
                }
                
                // Carregar atributos
                if (dados.atributos) {
                    this.estado.atributos = { ...this.estado.atributos, ...dados.atributos };
                    this.ultimosAtributos = {
                        ST: this.estado.atributos.ST,
                        DX: this.estado.atributos.DX,
                        IQ: this.estado.atributos.IQ,
                        HT: this.estado.atributos.HT
                    };
                }
                
                // Carregar foto
                if (dados.foto) {
                    this.estado.foto = dados.foto;
                    const fotoPreview = document.getElementById('fotoPreview');
                    if (fotoPreview && dados.foto.dataUrl) {
                        fotoPreview.src = dados.foto.dataUrl;
                        fotoPreview.style.display = 'block';
                        
                        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
                        const btnRemoverFoto = document.getElementById('btnRemoverFoto');
                        
                        if (fotoPlaceholder) fotoPlaceholder.style.display = 'none';
                        if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
                    }
                }
                
                console.log('✅ Dados carregados do localStorage');
            }
        } catch (e) {
            console.warn('⚠️ Erro ao carregar dados:', e);
        }
        
        // Contador de descrição
        const descricao = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        if (descricao && contador) {
            contador.textContent = descricao.value.length;
        }
    }

    // ==================== AUTO-SAVE ====================
    salvarAuto() {
        if (this.autoSaveTimeout) clearTimeout(this.autoSaveTimeout);
        
        this.autoSaveTimeout = setTimeout(() => {
            try {
                const dados = {
                    identificacao: this.estado.identificacao,
                    pontos: this.estado.pontos,
                    caracteristicas: this.estado.caracteristicas,
                    atributos: this.estado.atributos,
                    financeiro: this.estado.financeiro,
                    foto: this.estado.foto,
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('gurps_dashboard_data', JSON.stringify(dados));
            } catch (e) {
                console.error('❌ Erro ao salvar:', e);
            }
        }, 1000);
    }

    // ==================== MÉTODOS PÚBLICOS ====================
    obterDados() {
        return {
            identificacao: { ...this.estado.identificacao },
            pontos: { ...this.estado.pontos },
            atributos: { ...this.estado.atributos },
            financeiro: { ...this.estado.financeiro },
            caracteristicas: { ...this.estado.caracteristicas },
            foto: this.estado.foto ? { ...this.estado.foto } : null
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        if (dados.identificacao) {
            this.estado.identificacao = { ...this.estado.identificacao, ...dados.identificacao };
        }
        if (dados.pontos) {
            this.estado.pontos = { ...this.estado.pontos, ...dados.pontos };
        }
        if (dados.caracteristicas) {
            this.estado.caracteristicas = { ...this.estado.caracteristicas, ...dados.caracteristicas };
            this.recalcularGastosCaracteristicas();
        }
        if (dados.atributos) {
            this.estado.atributos = { ...this.estado.atributos, ...dados.atributos };
        }
        
        this.atualizarDisplayCompleto();
        this.recalcularSaldoCompleto();
    }

    destruir() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
            this.intervaloMonitor = null;
        }
        this.monitorAtivo = false;
    }
}

// ==================== INICIALIZAÇÃO GLOBAL ====================
(function() {
    let dashboardManagerInstance = null;
    
    function inicializarDashboard() {
        if (!dashboardManagerInstance) {
            try {
                dashboardManagerInstance = new DashboardManager();
                dashboardManagerInstance.inicializar();
                window.dashboardManager = dashboardManagerInstance;
                console.log('🌐 DashboardManager disponível globalmente como window.dashboardManager');
            } catch (error) {
                console.error('💥 Falha crítica ao inicializar DashboardManager:', error);
            }
        }
        return dashboardManagerInstance;
    }
    
    // Inicializar quando DOM estiver pronto
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            inicializarDashboard();
        }, 500);
    });
    
    // Exportar classe
    window.DashboardManager = DashboardManager;
    
    // Funções globais de conveniência
    window.ajustarPV = (valor) => {
        if (window.dashboardManager) window.dashboardManager.ajustarPV(valor);
    };
    
    window.ajustarPF = (valor) => {
        if (window.dashboardManager) window.dashboardManager.ajustarPF(valor);
    };
    
    window.obterDadosDashboard = () => {
        return window.dashboardManager ? window.dashboardManager.obterDados() : null;
    };
    
    window.carregarDadosDashboard = (dados) => {
        if (window.dashboardManager) window.dashboardManager.carregarDados(dados);
    };
    
    window.forcarAtualizacaoDashboard = () => {
        if (window.dashboardManager) {
            window.dashboardManager.recalcularSaldoCompleto();
            window.dashboardManager.atualizarDisplayCompleto();
        }
    };
})();