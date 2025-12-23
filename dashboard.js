// dashboard.js - VERSÃO COMPATÍVEL COM NOVO SISTEMA
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
                // NOVO: gastos separados por categoria de características
                gastosAparencia: 0,
                gastosRiqueza: 0,
                gastosIdiomas: 0,
                gastosCaracteristicasFisicas: 0,
                gastosAlturaPeso: 0,
                // Calculados
                saldoDisponivel: 150,
                limiteDesvantagens: -50,
                pontosGastosTotal: 0
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
        
        // Cache para monitoramento de atributos
        this.ultimosAtributos = { ST: 10, DX: 10, IQ: 10, HT: 10 };
        this.ultimaAtualizacaoAtributos = 0;
        
        // Flags
        this.monitorAtivo = false;
        this.intervaloMonitor = null;
        this.autoSaveTimeout = null;
        this.inicializado = false;
    }

    // ===========================================
    // INICIALIZAÇÃO PRINCIPAL
    // ===========================================
    inicializar() {
        if (this.inicializado) {
            console.log('DashboardManager já inicializado');
            return this;
        }
        
        console.log('Iniciando DashboardManager...');
        
        // Configurar eventos básicos
        this.configurarEventosBasicos();
        this.configurarEventosAtributos();
        this.configurarEventosExternos();
        this.configurarBotoesVitalidade();
        
        // Configurar sistema de foto
        this.configurarSistemaFoto();
        
        // Carregar valores iniciais
        this.carregarValoresIniciais();
        
        // Iniciar monitoramento
        this.iniciarMonitoramentoContinuo();
        
        // Forçar primeira atualização
        setTimeout(() => {
            this.calcularPontosAtributos();
            this.atualizarAtributosDerivados();
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
            this.atualizarDisplayDistribuicao();
        }, 300);
        
        this.inicializado = true;
        console.log('DashboardManager inicializado com sucesso!');
        
        return this;
    }

    // ===========================================
    // CONFIGURAÇÃO DE EVENTOS
    // ===========================================
    configurarEventosBasicos() {
        // Pontos totais
        const pontosTotaisElement = document.getElementById('pontosTotais');
        if (pontosTotaisElement) {
            pontosTotaisElement.addEventListener('input', (e) => {
                const valor = parseInt(e.target.value) || 150;
                this.estado.pontos.total = valor;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
            });
        }

        // Limite de desvantagens
        const limiteDesvantagensElement = document.getElementById('limiteDesvantagens');
        if (limiteDesvantagensElement) {
            limiteDesvantagensElement.addEventListener('input', (e) => {
                const valor = parseInt(e.target.value) || -50;
                this.estado.pontos.limiteDesvantagens = valor;
                this.salvarAuto();
            });
        }

        // Identificação
        const idsIdentificacao = ['dashboardRaca', 'dashboardClasse', 'dashboardNivel'];
        idsIdentificacao.forEach(id => {
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
        const descricaoElement = document.getElementById('dashboardDescricao');
        if (descricaoElement) {
            descricaoElement.addEventListener('input', (e) => {
                this.estado.identificacao.descricao = e.target.value;
                
                // Atualizar contador
                const contador = document.getElementById('contadorDescricao');
                if (contador) {
                    contador.textContent = e.target.value.length;
                }
                
                this.salvarAuto();
            });
        }
    }

    configurarEventosAtributos() {
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                // Usar input para resposta mais rápida
                input.addEventListener('input', () => this.verificarAtualizacaoAtributos());
                
                // Usar change para confirmação final
                input.addEventListener('change', () => {
                    this.verificarAtualizacaoAtributos();
                    this.salvarAuto();
                });
                
                // Garantir valores válidos
                input.addEventListener('blur', () => {
                    const valor = parseInt(input.value);
                    if (isNaN(valor) || valor < 1) {
                        input.value = 10;
                        this.verificarAtualizacaoAtributos();
                    }
                });
            }
        });
    }

    configurarEventosExternos() {
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
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
            }
        });

        // Magias
        document.addEventListener('magiasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosMagias = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
            }
        });

        // Técnicas
        document.addEventListener('tecnicasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosTecnicas = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
            }
        });

        // Peculiaridades
        document.addEventListener('peculiaridadesAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPeculiaridades = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
            }
        });

        // ===========================================
        // NOVO: Eventos das características
        // ===========================================
        
        // Aparência
        document.addEventListener('aparenciaAtualizada', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('Aparência atualizada:', e.detail.pontos);
                this.estado.pontos.gastosAparencia = e.detail.pontos;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
                
                // Atualizar badge na interface
                this.atualizarBadgeCaracteristicas('pontosAparencia', e.detail.pontos);
            }
        });

        // Riqueza (precisaremos criar este evento depois)
        document.addEventListener('riquezaAtualizada', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('Riqueza atualizada:', e.detail.pontos);
                this.estado.pontos.gastosRiqueza = e.detail.pontos;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
                
                // Atualizar badge
                this.atualizarBadgeCaracteristicas('pontosRiqueza', e.detail.pontos);
            }
        });

        // Idiomas (precisaremos criar este evento depois)
        document.addEventListener('idiomasAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('Idiomas atualizados:', e.detail.pontos);
                this.estado.pontos.gastosIdiomas = e.detail.pontos;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
                
                // Atualizar badge
                this.atualizarBadgeCaracteristicas('pontosIdiomas', e.detail.pontos);
            }
        });

        // Características Físicas (precisaremos criar este evento depois)
        document.addEventListener('caracteristicasFisicasAtualizadas', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('Características Físicas atualizadas:', e.detail.pontos);
                this.estado.pontos.gastosCaracteristicasFisicas = e.detail.pontos;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
                
                // Atualizar badge
                this.atualizarBadgeCaracteristicas('pontosCaracteristicas', e.detail.pontos);
            }
        });

        // Altura e Peso (precisaremos criar este evento depois)
        document.addEventListener('alturaPesoAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('Altura/Peso atualizados:', e.detail.pontos);
                this.estado.pontos.gastosAlturaPeso = e.detail.pontos;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
            }
        });
    }

    atualizarBadgeCaracteristicas(id, pontos) {
        const badge = document.getElementById(id);
        if (!badge) return;
        
        // Formatar texto
        const pontosTexto = pontos >= 0 ? `+${pontos} pts` : `${pontos} pts`;
        badge.textContent = pontosTexto;
        
        // Estilizar conforme tipo
        if (pontos > 0) {
            badge.style.background = 'linear-gradient(145deg, rgba(46, 204, 113, 0.2), rgba(39, 174, 96, 0.3))';
            badge.style.borderColor = '#2ecc71';
            badge.style.color = '#2ecc71';
        } else if (pontos < 0) {
            badge.style.background = 'linear-gradient(145deg, rgba(231, 76, 60, 0.2), rgba(192, 57, 43, 0.3))';
            badge.style.borderColor = '#e74c3c';
            badge.style.color = '#e74c3c';
        } else {
            badge.style.background = 'linear-gradient(145deg, rgba(52, 152, 219, 0.2), rgba(41, 128, 185, 0.3))';
            badge.style.borderColor = '#3498db';
            badge.style.color = '#3498db';
        }
    }

    configurarSistemaFoto() {
        const fotoUpload = document.getElementById('fotoUpload');
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        const btnRemoverFoto = document.getElementById('btnRemoverFoto');

        if (!fotoUpload || !fotoPreview) return;

        // Upload via input
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

        // Drag and drop
        const fotoWrapper = document.getElementById('fotoWrapper');
        if (fotoWrapper) {
            fotoWrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
                fotoWrapper.style.borderColor = 'var(--primary-gold)';
                fotoWrapper.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.5)';
            });

            fotoWrapper.addEventListener('dragleave', () => {
                fotoWrapper.style.borderColor = '';
                fotoWrapper.style.boxShadow = '';
            });

            fotoWrapper.addEventListener('drop', (e) => {
                e.preventDefault();
                fotoWrapper.style.borderColor = '';
                fotoWrapper.style.boxShadow = '';
                
                if (e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.type.startsWith('image/')) {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        fotoUpload.files = dataTransfer.files;
                        fotoUpload.dispatchEvent(new Event('change'));
                    }
                }
            });
        }
    }

    configurarBotoesVitalidade() {
        const configBotoes = [
            { id: 'btnPVMais', valor: 1, tipo: 'PV' },
            { id: 'btnPVMenos', valor: -1, tipo: 'PV' },
            { id: 'btnPFMais', valor: 1, tipo: 'PF' },
            { id: 'btnPFMenos', valor: -1, tipo: 'PF' }
        ];

        configBotoes.forEach(({ id, valor, tipo }) => {
            const botao = document.getElementById(id);
            if (botao) {
                botao.addEventListener('click', () => {
                    if (tipo === 'PV') {
                        this.ajustarPV(valor);
                    } else if (tipo === 'PF') {
                        this.ajustarPF(valor);
                    }
                });
            }
        });

        // Clique nas barras para ajustar
        const barrasVitalidade = ['barraPV', 'barraPF'];
        barrasVitalidade.forEach(id => {
            const barra = document.getElementById(id);
            if (barra) {
                barra.addEventListener('click', (e) => {
                    const rect = barra.parentElement.getBoundingClientRect();
                    const percentual = (e.clientX - rect.left) / rect.width;
                    const tipo = id === 'barraPV' ? 'PV' : 'PF';
                    
                    if (tipo === 'PV') {
                        const novoValor = Math.round(percentual * this.estado.atributos.PV.max);
                        this.estado.atributos.PV.atual = Math.max(0, Math.min(novoValor, this.estado.atributos.PV.max));
                        this.atualizarDisplayAtributos();
                        this.salvarAuto();
                    } else if (tipo === 'PF') {
                        const novoValor = Math.round(percentual * this.estado.atributos.PF.max);
                        this.estado.atributos.PF.atual = Math.max(0, Math.min(novoValor, this.estado.atributos.PF.max));
                        this.atualizarDisplayAtributos();
                        this.salvarAuto();
                    }
                });
            }
        });
    }

    // ===========================================
    // CÁLCULOS DE PONTOS
    // ===========================================
    calcularPontosAtributos() {
        const st = this.obterValorAtributo('ST');
        const dx = this.obterValorAtributo('DX');
        const iq = this.obterValorAtributo('IQ');
        const ht = this.obterValorAtributo('HT');
        
        // Cálculo padrão GURPS
        const custoST = (st - 10) * 10;
        const custoDX = (dx - 10) * 20;
        const custoIQ = (iq - 10) * 20;
        const custoHT = (ht - 10) * 10;
        
        const totalGastos = custoST + custoDX + custoIQ + custoHT;
        
        if (this.estado.pontos.gastosAtributos !== totalGastos) {
            this.estado.pontos.gastosAtributos = totalGastos;
            return true; // Houve mudança
        }
        
        return false; // Sem mudança
    }

    obterValorAtributo(id) {
        const elemento = document.getElementById(id);
        if (!elemento) return 10;
        
        if (elemento.tagName === 'INPUT') {
            return parseInt(elemento.value) || 10;
        }
        
        return 10;
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
        this.atualizarDisplayDistribuicao();
        this.salvarAuto();
    }

    // ===========================================
    // CÁLCULOS COMPLETOS
    // ===========================================
    recalcularSaldoCompleto() {
        const total = this.estado.pontos.total;
        
        // Somar todos os gastos POSITIVOS (vantagens, atributos, etc.)
        const gastosPositivos = 
            this.estado.pontos.gastosAtributos +
            this.estado.pontos.gastosVantagens +
            this.estado.pontos.gastosPericias +
            this.estado.pontos.gastosMagias +
            this.estado.pontos.gastosTecnicas +
            this.estado.pontos.gastosPeculiaridades +
            Math.max(0, this.estado.pontos.gastosAparencia) +
            Math.max(0, this.estado.pontos.gastosRiqueza) +
            Math.max(0, this.estado.pontos.gastosIdiomas) +
            Math.max(0, this.estado.pontos.gastosCaracteristicasFisicas) +
            Math.max(0, this.estado.pontos.gastosAlturaPeso);
        
        // Somar todos os gastos NEGATIVOS (desvantagens)
        const gastosNegativos = 
            this.estado.pontos.gastosDesvantagens +
            Math.abs(Math.min(0, this.estado.pontos.gastosAparencia)) +
            Math.abs(Math.min(0, this.estado.pontos.gastosRiqueza)) +
            Math.abs(Math.min(0, this.estado.pontos.gastosIdiomas)) +
            Math.abs(Math.min(0, this.estado.pontos.gastosCaracteristicasFisicas)) +
            Math.abs(Math.min(0, this.estado.pontos.gastosAlturaPeso));
        
        // Cálculo final: total - gastos positivos + gastos negativos
        this.estado.pontos.saldoDisponivel = total - gastosPositivos + gastosNegativos;
        this.estado.pontos.pontosGastosTotal = gastosPositivos - gastosNegativos;
    }

    // ===========================================
    // ATUALIZAÇÃO DE ATRIBUTOS DERIVADOS
    // ===========================================
    atualizarAtributosDerivados() {
        const st = this.obterValorAtributo('ST');
        const dx = this.obterValorAtributo('DX');
        const iq = this.obterValorAtributo('IQ');
        const ht = this.obterValorAtributo('HT');
        
        // Atualizar valores base
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        
        // Calcular PV e PF máximos
        const pvMax = st; // PV = ST
        const pfMax = ht; // PF = HT
        
        // Atualizar máximos
        this.estado.atributos.PV.max = pvMax;
        this.estado.atributos.PF.max = pfMax;
        
        // Ajustar valores atuais se excederem o máximo
        if (this.estado.atributos.PV.atual > pvMax) {
            this.estado.atributos.PV.atual = pvMax;
        }
        
        if (this.estado.atributos.PF.atual > pfMax) {
            this.estado.atributos.PF.atual = pfMax;
        }
        
        // Vontade e Percepção = IQ (por padrão)
        this.estado.atributos.Vontade = iq;
        this.estado.atributos.Percepcao = iq;
        
        // Deslocamento = (HT + DX) / 4
        this.estado.atributos.Deslocamento = (ht + dx) / 4;
        
        // Atualizar display
        this.atualizarDisplayAtributos();
    }

    // ===========================================
    // MONITORAMENTO CONTÍNUO
    // ===========================================
    iniciarMonitoramentoContinuo() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
        }

        this.intervaloMonitor = setInterval(() => {
            this.verificarMudancasAtributos();
        }, 200);

        this.monitorAtivo = true;
    }

    verificarMudancasAtributos() {
        const st = this.obterValorAtributo('ST');
        const dx = this.obterValorAtributo('DX');
        const iq = this.obterValorAtributo('IQ');
        const ht = this.obterValorAtributo('HT');
        
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
        
        // Debounce: evitar atualizações muito rápidas
        if (agora - this.ultimaAtualizacaoAtributos < 100) {
            return;
        }
        
        this.ultimaAtualizacaoAtributos = agora;
        
        // Verificar se os pontos de atributos mudaram
        const atributosMudaram = this.calcularPontosAtributos();
        
        // Sempre atualizar derivados
        this.atualizarAtributosDerivados();
        
        if (atributosMudaram) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayPontos();
            this.atualizarDisplayDistribuicao();
            this.salvarAuto();
        }
    }

    // ===========================================
    // ATUALIZAÇÃO DE DISPLAY
    // ===========================================
    atualizarDisplayCompleto() {
        this.atualizarDisplayAtributos();
        this.atualizarDisplayPontos();
        this.atualizarDisplayFinanceiro();
        this.atualizarDisplayDistribuicao();
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
        
        // Barras de vitalidade
        const porcentagemPV = (PV.atual / PV.max) * 100;
        const porcentagemPF = (PF.atual / PF.max) * 100;
        
        this.atualizarBarra('barraPV', porcentagemPV);
        this.atualizarBarra('barraPF', porcentagemPF);
        
        // Atributos derivados
        this.atualizarElemento('VontadeTotal', Vontade);
        this.atualizarElemento('PercepcaoTotal', Percepcao);
        this.atualizarElemento('DeslocamentoTotal', Deslocamento.toFixed(2));
        
        // PV e PF totais
        this.atualizarElemento('PVTotal', PV.max);
        this.atualizarElemento('PFTotal', PF.max);
    }

    atualizarDisplayPontos() {
        // Saldo disponível
        this.atualizarElemento('saldoDisponivel', this.estado.pontos.saldoDisponivel);
        
        // Gastos totais (se tiver elemento)
        const gastosTotaisElement = document.getElementById('gastosTotais');
        if (gastosTotaisElement) {
            gastosTotaisElement.textContent = this.estado.pontos.pontosGastosTotal;
        }
        
        // Gastos por categoria (se tiver elementos)
        this.atualizarElemento('gastosAtributos', this.estado.pontos.gastosAtributos);
        this.atualizarElemento('gastosVantagens', this.estado.pontos.gastosVantagens);
        this.atualizarElemento('gastosDesvantagens', this.estado.pontos.gastosDesvantagens);
    }

    atualizarDisplayFinanceiro() {
        const saldoPersonagemElement = document.getElementById('saldoPersonagem');
        if (saldoPersonagemElement) {
            saldoPersonagemElement.textContent = this.estado.financeiro.saldo;
        }
    }

    atualizarDisplayDistribuicao() {
        const totalGastos = this.estado.pontos.pontosGastosTotal;
        if (totalGastos <= 0) return;
        
        // Calcular percentuais
        const percentuais = {
            atributos: (this.estado.pontos.gastosAtributos / totalGastos) * 100,
            vantagens: (this.estado.pontos.gastosVantagens / totalGastos) * 100,
            pericias: ((this.estado.pontos.gastosPericias + this.estado.pontos.gastosMagias) / totalGastos) * 100,
            caracteristicas: ((
                Math.max(0, this.estado.pontos.gastosAparencia) +
                Math.max(0, this.estado.pontos.gastosRiqueza) +
                Math.max(0, this.estado.pontos.gastosIdiomas) +
                Math.max(0, this.estado.pontos.gastosCaracteristicasFisicas) +
                Math.max(0, this.estado.pontos.gastosAlturaPeso)
            ) / totalGastos) * 100,
            outros: ((this.estado.pontos.gastosTecnicas + this.estado.pontos.gastosPeculiaridades) / totalGastos) * 100
        };
        
        // Atualizar barras
        this.atualizarBarra('distribAtributos', percentuais.atributos);
        this.atualizarBarra('distribVantagens', percentuais.vantagens);
        this.atualizarBarra('distribPericias', percentuais.pericias);
        this.atualizarBarra('distribCaracteristicas', percentuais.caracteristicas);
        this.atualizarBarra('distribOutros', percentuais.outros);
        
        // Atualizar valores
        this.atualizarElemento('distribAtributosValor', `${Math.round(percentuais.atributos)}%`);
        this.atualizarElemento('distribVantagensValor', `${Math.round(percentuais.vantagens)}%`);
        this.atualizarElemento('distribPericiasValor', `${Math.round(percentuais.pericias)}%`);
        this.atualizarElemento('distribCaracteristicasValor', `${Math.round(percentuais.caracteristicas)}%`);
        this.atualizarElemento('distribOutrosValor', `${Math.round(percentuais.outros)}%`);
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        
        const valorFormatado = typeof valor === 'number' 
            ? valor.toString()
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

    // ===========================================
    // CONTROLES DE VITALIDADE
    // ===========================================
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

    // ===========================================
    // CARREGAMENTO INICIAL
    // ===========================================
    carregarValoresIniciais() {
        // Carregar do localStorage se existir
        try {
            const dadosSalvos = localStorage.getItem('gurps_dashboard');
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
                
                console.log('Dados carregados do localStorage');
            }
        } catch (e) {
            console.warn('Erro ao carregar dados do localStorage:', e);
        }
        
        // Atualizar contador de descrição
        const descricaoElement = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        if (descricaoElement && contador) {
            contador.textContent = descricaoElement.value.length;
        }
    }

    // ===========================================
    // AUTO-SAVE
    // ===========================================
    salvarAuto() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            try {
                // Salvar no localStorage
                localStorage.setItem('gurps_dashboard', JSON.stringify({
                    identificacao: this.estado.identificacao,
                    pontos: this.estado.pontos,
                    atributos: this.estado.atributos,
                    financeiro: this.estado.financeiro,
                    foto: this.estado.foto,
                    atualizadoEm: new Date().toISOString()
                }));
                
                console.log('Dados salvos no localStorage');
            } catch (e) {
                console.error('Erro ao salvar no localStorage:', e);
            }
            
            // TODO: Salvar no Firebase quando implementado
            // this.salvarNoFirebase();
            
            this.autoSaveTimeout = null;
        }, 1000);
    }

    // ===========================================
    // MÉTODOS PÚBLICOS
    // ===========================================
    obterDados() {
        return {
            identificacao: { ...this.estado.identificacao },
            pontos: { ...this.estado.pontos },
            atributos: { ...this.estado.atributos },
            financeiro: { ...this.estado.financeiro },
            foto: this.estado.foto ? { ...this.estado.foto } : null
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        // Carregar dados básicos
        if (dados.identificacao) {
            this.estado.identificacao = { ...this.estado.identificacao, ...dados.identificacao };
        }
        
        if (dados.pontos) {
            this.estado.pontos = { ...this.estado.pontos, ...dados.pontos };
        }
        
        if (dados.atributos) {
            this.estado.atributos = { ...this.estado.atributos, ...dados.atributos };
        }
        
        // Atualizar interface
        this.atualizarDisplayCompleto();
        this.recalcularSaldoCompleto();
    }

    destruir() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
            this.intervaloMonitor = null;
        }
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.salvarAuto();
        }
        
        this.monitorAtivo = false;
        this.inicializado = false;
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================
(function() {
    let dashboardInstance = null;
    
    function inicializarDashboard() {
        if (!dashboardInstance) {
            dashboardInstance = new DashboardManager();
            dashboardInstance.inicializar();
            
            // Expor globalmente
            window.dashboardManager = dashboardInstance;
            
            console.log('DashboardManager inicializado globalmente');
        }
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
        if (dashboardInstance) dashboardInstance.ajustarPV(valor);
    };
    
    window.ajustarPF = (valor) => {
        if (dashboardInstance) dashboardInstance.ajustarPF(valor);
    };
    
    window.obterDadosDashboard = () => {
        return dashboardInstance ? dashboardInstance.obterDados() : null;
    };
    
    window.carregarDadosDashboard = (dados) => {
        if (dashboardInstance) dashboardInstance.carregarDados(dados);
    };
    
    window.forcarAtualizacaoDashboard = () => {
        if (dashboardInstance) {
            dashboardInstance.recalcularSaldoCompleto();
            dashboardInstance.atualizarDisplayCompleto();
        }
    };
})();