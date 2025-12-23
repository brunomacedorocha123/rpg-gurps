// ===========================================
// DASHBOARD MANAGER - VERSÃO LIMPA
// ===========================================

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
        
        this.pontosCaracteristicasCache = {
            aparência: 0,
            riqueza: 0,
            idiomas: 0,
            fisicas: 0,
            total: 0
        };
        
        this.autoSaveTimeout = null;
        this.autoSaveEnabled = true;
    }

    inicializar() {
        this.configurarSistemaFoto();
        this.configurarEventosDashboard();
        this.configurarEventosAtributos();
        this.configurarEventosExternos();
        this.configurarMonitorCaracteristicas();
        this.configurarBotoesVitalidade();
        this.carregarValoresIniciais();
        this.iniciarMonitoramentoContinuo();
        this.forcarAtualizacaoInicial();
        
        return this;
    }

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

    atualizarAtributosDerivados() {
        const st = this.obterValorElemento('ST', 10);
        const dx = this.obterValorElemento('DX', 10);
        const iq = this.obterValorElemento('IQ', 10);
        const ht = this.obterValorElemento('HT', 10);
        
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        
        const pvTotal = this.obterValorElemento('PVTotal', st);
        const pfTotal = this.obterValorElemento('PFTotal', ht);
        const vontadeTotal = this.obterValorElemento('VontadeTotal', iq);
        const percepcaoTotal = this.obterValorElemento('PercepcaoTotal', iq);
        
        this.estado.atributos.PV.max = pvTotal;
        if (this.estado.atributos.PV.atual > pvTotal) {
            this.estado.atributos.PV.atual = pvTotal;
        }
        
        this.estado.atributos.PF.max = pfTotal;
        if (this.estado.atributos.PF.atual > pfTotal) {
            this.estado.atributos.PF.atual = pfTotal;
        }
        
        this.estado.atributos.Vontade = vontadeTotal;
        this.estado.atributos.Percepcao = percepcaoTotal;
        
        const deslocamentoElement = document.getElementById('DeslocamentoTotal');
        if (deslocamentoElement) {
            this.estado.atributos.Deslocamento = parseFloat(deslocamentoElement.textContent) || 5.00;
        } else {
            this.estado.atributos.Deslocamento = (ht + dx) / 4;
        }
        
        this.atualizarDisplayAtributos();
    }

    configurarSistemaFoto() {
        const fotoUpload = document.getElementById('fotoUpload');
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        const btnRemoverFoto = document.getElementById('btnRemoverFoto');

        if (!fotoUpload || !fotoPreview) return;

        fotoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoPreview.src = e.target.result;
                    fotoPreview.style.display = 'block';
                    if (fotoPlaceholder) fotoPlaceholder.style.display = 'none';
                    if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
                    this.fotoTemporaria = {
                        file: file,
                        dataUrl: e.target.result,
                        nome: file.name,
                        tipo: file.type,
                        tamanho: file.size
                    };
                    this.estado.foto = this.fotoTemporaria;
                    this.salvarAuto();
                };
                reader.readAsDataURL(file);
            }
        });

        if (btnRemoverFoto) {
            btnRemoverFoto.addEventListener('click', () => {
                fotoPreview.src = '';
                fotoPreview.style.display = 'none';
                if (fotoPlaceholder) fotoPlaceholder.style.display = 'flex';
                btnRemoverFoto.style.display = 'none';
                fotoUpload.value = '';
                this.fotoTemporaria = null;
                this.estado.foto = null;
                this.salvarAuto();
            });
        }

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

    configurarEventosDashboard() {
        const inputsPrincipais = [
            { id: 'dashboardRaca', tipo: 'text', callback: (v) => {
                this.estado.identificacao.raca = v;
                this.salvarAuto();
            }},
            { id: 'dashboardClasse', tipo: 'text', callback: (v) => {
                this.estado.identificacao.classe = v;
                this.salvarAuto();
            }},
            { id: 'dashboardNivel', tipo: 'text', callback: (v) => {
                this.estado.identificacao.nivel = v;
                this.salvarAuto();
            }},
            { id: 'pontosTotais', tipo: 'number', callback: (v) => {
                this.estado.pontos.total = parseInt(v) || 150;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.salvarAuto();
            }},
            { id: 'limiteDesvantagens', tipo: 'number', callback: (v) => {
                this.estado.pontos.limiteDesvantagens = parseInt(v) || -50;
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }}
        ];

        inputsPrincipais.forEach(({ id, tipo, callback }) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (tipo === 'number') {
                    elemento.addEventListener('input', () => callback(elemento.value));
                    elemento.addEventListener('change', () => callback(elemento.value));
                    elemento.addEventListener('blur', () => {
                        if (elemento.value === '' || isNaN(elemento.value)) {
                            elemento.value = id === 'pontosTotais' ? 150 : -50;
                            callback(elemento.value);
                        }
                    });
                } else {
                    elemento.addEventListener('input', () => callback(elemento.value));
                    elemento.addEventListener('change', () => callback(elemento.value));
                    elemento.addEventListener('blur', () => callback(elemento.value.trim()));
                }
            }
        });

        const selectsDashboard = [
            { id: 'nivelAparencia', callback: (v) => {
                this.estado.financeiro.aparencia = v;
                this.atualizarDisplayFinanceiro();
                this.salvarAuto();
            }},
            { id: 'nivelRiqueza', callback: (v) => {
                this.estado.financeiro.riqueza = v;
                this.calcularRendaDetalhada();
                this.atualizarDisplayFinanceiro();
                this.salvarAuto();
            }}
        ];

        selectsDashboard.forEach(({ id, callback }) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('change', () => {
                    const texto = elemento.options[elemento.selectedIndex]?.text;
                    if (texto) {
                        const valor = texto.split('[')[0].trim();
                        callback(valor);
                    }
                });
            }
        });

        const textareaDescricao = document.getElementById('dashboardDescricao');
        if (textareaDescricao) {
            textareaDescricao.addEventListener('input', () => {
                this.estado.identificacao.descricao = textareaDescricao.value;
                const contador = document.getElementById('contadorDescricao');
                if (contador) {
                    contador.textContent = textareaDescricao.value.length;
                }
                this.salvarAuto();
            });
            
            textareaDescricao.addEventListener('focus', () => {
                textareaDescricao.style.borderColor = 'var(--primary-gold)';
                textareaDescricao.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
            });
            
            textareaDescricao.addEventListener('blur', () => {
                textareaDescricao.style.borderColor = '';
                textareaDescricao.style.boxShadow = '';
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

    configurarMonitorCaracteristicas() {
        document.addEventListener('pontosAparenciaAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                this.atualizarPontosCaracteristicas('aparência', e.detail.pontos);
            }
        });

        document.addEventListener('pontosRiquezaAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                this.atualizarPontosCaracteristicas('riqueza', e.detail.pontos);
            }
        });

        document.addEventListener('pontosIdiomasAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                this.atualizarPontosCaracteristicas('idiomas', e.detail.pontos);
            }
        });

        document.addEventListener('pontosFisicasAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                this.atualizarPontosCaracteristicas('fisicas', e.detail.pontos);
            }
        });
    }

    atualizarPontosCaracteristicas(tipo, pontos) {
        this.pontosCaracteristicasCache[tipo] = pontos;
        
        const totalCaracteristicas = 
            this.pontosCaracteristicasCache.aparência +
            this.pontosCaracteristicasCache.riqueza +
            this.pontosCaracteristicasCache.idiomas +
            this.pontosCaracteristicasCache.fisicas;
        
        this.estado.caracteristicas[tipo] = pontos;
        this.estado.pontos.gastosCaracteristicas = totalCaracteristicas;
        
        this.recalcularSaldoCompleto();
        this.atualizarDisplayPontos();
        this.atualizarDisplayResumo();
        this.atualizarDisplayDistribuicao();
        this.atualizarUICaracteristicas();
        this.salvarAuto();
    }

    atualizarUICaracteristicas() {
        const totalCaracteristicas = this.estado.pontos.gastosCaracteristicas;
        
        const elTotal = document.getElementById('totalCaracteristicas');
        if (elTotal) {
            elTotal.textContent = totalCaracteristicas >= 0 ? 
                `+${totalCaracteristicas} pts` : `${totalCaracteristicas} pts`;
        }
        
        const pontosAparencia = this.estado.caracteristicas.aparência;
        const elResumoAparencia = document.getElementById('resumoAparencia');
        if (elResumoAparencia) {
            elResumoAparencia.textContent = pontosAparencia >= 0 ? 
                `+${pontosAparencia} pts` : `${pontosAparencia} pts`;
        }
        
        const pontosRiqueza = this.estado.caracteristicas.riqueza;
        const elResumoRiqueza = document.getElementById('resumoRiqueza');
        if (elResumoRiqueza) {
            elResumoRiqueza.textContent = pontosRiqueza >= 0 ? 
                `+${pontosRiqueza} pts` : `${pontosRiqueza} pts`;
        }
        
        const secao1 = pontosAparencia + pontosRiqueza;
        const elSecao1 = document.getElementById('totalSecao1');
        if (elSecao1) {
            elSecao1.textContent = secao1 >= 0 ? `+${secao1} pts` : `${secao1} pts`;
        }
        
        const badgeAparencia = document.getElementById('pontosAparencia');
        if (badgeAparencia) {
            badgeAparencia.textContent = pontosAparencia >= 0 ? 
                `+${pontosAparencia} pts` : `${pontosAparencia} pts`;
        }
        
        const badgeRiqueza = document.getElementById('pontosRiqueza');
        if (badgeRiqueza) {
            badgeRiqueza.textContent = pontosRiqueza >= 0 ? 
                `+${pontosRiqueza} pts` : `${pontosRiqueza} pts`;
        }
    }

    configurarEventosExternos() {
        document.addEventListener('vantagensAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.atualizarVantagensDesvantagens(e.detail.total);
            }
        });

        document.addEventListener('periciasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPericias = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });

        document.addEventListener('magiasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosMagias = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });

        document.addEventListener('tecnicasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosTecnicas = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });

        document.addEventListener('peculiaridadesAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPeculiaridades = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.atualizarDisplayPontos();
                this.salvarAuto();
            }
        });
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

    carregarValoresIniciais() {
        const inputsValores = [
            { id: 'dashboardRaca', alvo: 'identificacao.raca' },
            { id: 'dashboardClasse', alvo: 'identificacao.classe' },
            { id: 'dashboardNivel', alvo: 'identificacao.nivel' },
            { id: 'dashboardDescricao', alvo: 'identificacao.descricao' },
            { id: 'pontosTotais', alvo: 'pontos.total', tipo: 'number' },
            { id: 'limiteDesvantagens', alvo: 'pontos.limiteDesvantagens', tipo: 'number' }
        ];

        inputsValores.forEach(({ id, alvo, tipo }) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (tipo === 'number') {
                    this.estado[alvo.split('.')[0]][alvo.split('.')[1]] = parseInt(elemento.value) || (id === 'pontosTotais' ? 150 : -50);
                } else {
                    this.estado[alvo.split('.')[0]][alvo.split('.')[1]] = elemento.value || '';
                }
            }
        });

        this.calcularPontosAtributos();
        this.atualizarAtributosDerivados();
        this.calcularRendaDetalhada();
        this.recalcularSaldoCompleto();
        this.atualizarContadorDescricao();
        this.atualizarDisplayCompleto();
    }

    iniciarMonitoramentoContinuo() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
        }

        this.intervaloMonitor = setInterval(() => {
            this.verificarMudancasAtributos();
            this.verificarAtualizacoesPendentes();
        }, 300);

        this.monitorAtivo = true;
    }

    forcarAtualizacaoInicial() {
        setTimeout(() => {
            this.calcularPontosAtributos();
            this.atualizarAtributosDerivados();
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        }, 500);
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
        
        if (agora - this.ultimaAtualizacaoAtributos < 100) {
            return;
        }
        
        this.ultimaAtualizacaoAtributos = agora;
        
        const atributosMudaram = this.calcularPontosAtributos();
        
        this.atualizarAtributosDerivados();
        
        if (atributosMudaram) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
            this.salvarAuto();
        }
    }

    verificarAtualizacoesPendentes() {
        // Verificação silenciosa
    }

    atualizarVantagensDesvantagens(total) {
        const antigoVantagens = this.estado.pontos.gastosVantagens;
        const antigoDesvantagens = this.estado.pontos.gastosDesvantagens;
        
        if (total >= 0) {
            this.estado.pontos.gastosVantagens = total;
            this.estado.pontos.gastosDesvantagens = 0;
        } else {
            this.estado.pontos.gastosVantagens = 0;
            this.estado.pontos.gastosDesvantagens = Math.abs(total);
        }
        
        if (antigoVantagens !== this.estado.pontos.gastosVantagens || 
            antigoDesvantagens !== this.estado.pontos.gastosDesvantagens) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
            this.salvarAuto();
        }
    }

    calcularRendaDetalhada() {
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        if (!nivelRiqueza) return;
        
        const valor = parseInt(nivelRiqueza.value) || 0;
        const rendaBase = 1000;
        
        const multiplicadores = {
            '-25': 0.0,
            '-15': 0.2,
            '-10': 0.5,
            '0': 1.0,
            '10': 2.0,
            '20': 5.0,
            '30': 20.0,
            '50': 100.0
        };
        
        const multiplicador = multiplicadores[valor.toString()] || 1.0;
        const renda = Math.floor(rendaBase * multiplicador);
        
        this.estado.financeiro.saldo = `$${renda.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        
        const saldoPersonagemElement = document.getElementById('saldoPersonagem');
        if (saldoPersonagemElement) {
            saldoPersonagemElement.textContent = this.estado.financeiro.saldo;
        }
    }

    recalcularSaldoCompleto() {
        const total = this.estado.pontos.total;
        
        const gastosPositivos = 
            this.estado.pontos.gastosAtributos + 
            this.estado.pontos.gastosVantagens + 
            this.estado.pontos.gastosPericias + 
            this.estado.pontos.gastosMagias +
            this.estado.pontos.gastosTecnicas +
            this.estado.pontos.gastosPeculiaridades +
            this.estado.pontos.gastosCaracteristicas;
        
        const pontosDesvantagens = this.estado.pontos.gastosDesvantagens;
        
        const saldoDisponivel = total - gastosPositivos + pontosDesvantagens;
        
        this.estado.pontos.saldoDisponivel = saldoDisponivel;
        this.estado.pontos.pontosGastosTotal = gastosPositivos - pontosDesvantagens;
    }

    atualizarContadorDescricao() {
        const textarea = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        if (textarea && contador) {
            contador.textContent = textarea.value.length;
        }
    }

    atualizarDisplayCompleto() {
        this.atualizarDisplayAtributos();
        this.atualizarDisplayPontos();
        this.atualizarDisplayFinanceiro();
        this.atualizarDisplayResumo();
        this.atualizarDisplayDistribuicao();
    }

    atualizarDisplayAtributos() {
        const { ST, DX, IQ, HT, PV, PF } = this.estado.atributos;
        
        this.atualizarElemento('atributoST', ST);
        this.atualizarElemento('atributoDX', DX);
        this.atualizarElemento('atributoIQ', IQ);
        this.atualizarElemento('atributoHT', HT);
        
        this.atualizarElemento('valorPV', `${PV.atual}/${PV.max}`);
        this.atualizarElemento('valorPF', `${PF.atual}/${PF.max}`);
        
        const porcentagemPV = (PV.atual / PV.max) * 100;
        const porcentagemPF = (PF.atual / PF.max) * 100;
        
        this.atualizarBarra('barraPV', porcentagemPV);
        this.atualizarBarra('barraPF', porcentagemPF);
    }

    atualizarDisplayPontos() {
        const saldoDisponivel = this.estado.pontos.saldoDisponivel;
        this.atualizarElemento('saldoDisponivel', saldoDisponivel);
        
        const pontosTotaisElement = document.getElementById('pontosTotais');
        if (pontosTotaisElement && pontosTotaisElement.value !== this.estado.pontos.total.toString()) {
            pontosTotaisElement.value = this.estado.pontos.total;
        }
    }

    atualizarDisplayFinanceiro() {
        const saldoPersonagemElement = document.getElementById('saldoPersonagem');
        if (saldoPersonagemElement) {
            saldoPersonagemElement.textContent = this.estado.financeiro.saldo;
        }
        
        const nivelAparenciaElement = document.getElementById('nivelAparencia');
        if (nivelAparenciaElement) {
            nivelAparenciaElement.textContent = this.estado.financeiro.aparencia;
        }
    }

    atualizarDisplayResumo() {
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        const gastosVantagens = this.estado.pontos.gastosVantagens;
        const gastosDesvantagens = this.estado.pontos.gastosDesvantagens;
        const gastosCaracteristicas = this.estado.pontos.gastosCaracteristicas;
        const saldoDisponivel = this.estado.pontos.saldoDisponivel;
        
        this.atualizarElemento('gastosAtributos', gastosAtributos);
        this.atualizarElemento('gastosVantagens', gastosVantagens);
        this.atualizarElemento('gastosDesvantagens', gastosDesvantagens);
        this.atualizarElemento('totalLiquido', saldoDisponivel);
        
        const gastosCaracteristicasElement = document.getElementById('gastosCaracteristicas');
        if (gastosCaracteristicasElement) {
            gastosCaracteristicasElement.textContent = gastosCaracteristicas;
        }
    }

    atualizarDisplayDistribuicao() {
        const total = this.estado.pontos.total;
        if (total <= 0) return;
        
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        const gastosVantagens = this.estado.pontos.gastosVantagens;
        const gastosPericiasMagias = this.estado.pontos.gastosPericias + this.estado.pontos.gastosMagias;
        const outros = this.estado.pontos.gastosTecnicas + this.estado.pontos.gastosPeculiaridades + this.estado.pontos.gastosCaracteristicas;
        
        const gastosTotais = gastosAtributos + gastosVantagens + gastosPericiasMagias + outros;
        
        if (gastosTotais <= 0) return;
        
        const distribAtributos = (gastosAtributos / gastosTotais) * 100;
        const distribVantagens = (gastosVantagens / gastosTotais) * 100;
        const distribPericias = (gastosPericiasMagias / gastosTotais) * 100;
        const distribOutros = (outros / gastosTotais) * 100;
        
        this.atualizarBarra('distribAtributos', distribAtributos);
        this.atualizarBarra('distribVantagens', distribVantagens);
        this.atualizarBarra('distribPericias', distribPericias);
        this.atualizarBarra('distribOutros', distribOutros);
        
        this.atualizarElemento('distribAtributosValor', `${Math.round(distribAtributos)}%`);
        this.atualizarElemento('distribVantagensValor', `${Math.round(distribVantagens)}%`);
        this.atualizarElemento('distribPericiasValor', `${Math.round(distribPericias)}%`);
        this.atualizarElemento('distribOutrosValor', `${Math.round(distribOutros)}%`);
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

    salvarAuto() {
        if (!this.autoSaveEnabled) return;
        
        try {
            const data = {
                pontos: this.estado.pontos,
                caracteristicas: this.estado.caracteristicas,
                atributos: this.estado.atributos,
                identificacao: this.estado.identificacao,
                financeiro: this.estado.financeiro,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('gurps_dashboard_data', JSON.stringify(data));
        } catch (e) {
            // Silencioso
        }
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.salvarNoFirebase();
            this.autoSaveTimeout = null;
        }, 2000);
    }

    async salvarNoFirebase() {
        try {
            const auth = firebase.auth();
            const user = auth.currentUser;
            
            if (!user) return;
            
            const characterData = {
                dashboard_data: {
                    pontos: this.estado.pontos,
                    caracteristicas: this.estado.caracteristicas,
                    atributos: this.estado.atributos,
                    identificacao: this.estado.identificacao,
                    financeiro: this.estado.financeiro
                },
                updated_at: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            const db = firebase.firestore();
            
            if (this.estado.characterId) {
                await db.collection('characters').doc(this.estado.characterId).update(characterData);
            }
            
        } catch (error) {
            // Silencioso
        }
    }

    coletarDadosParaSalvar() {
        return {
            identificacao: this.estado.identificacao,
            pontos: this.estado.pontos,
            atributos: this.estado.atributos,
            financeiro: this.estado.financeiro,
            caracteristicas: this.estado.caracteristicas,
            foto: this.fotoTemporaria,
            dashboard: {
                atualizadoEm: new Date().toISOString()
            }
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        if (dados.identificacao) {
            this.estado.identificacao = { ...this.estado.identificacao, ...dados.identificacao };
            this.atualizarElemento('dashboardRaca', this.estado.identificacao.raca);
            this.atualizarElemento('dashboardClasse', this.estado.identificacao.classe);
            this.atualizarElemento('dashboardNivel', this.estado.identificacao.nivel);
            this.atualizarElemento('dashboardDescricao', this.estado.identificacao.descricao);
        }
        
        if (dados.pontos) {
            this.estado.pontos = { ...this.estado.pontos, ...dados.pontos };
            this.atualizarElemento('pontosTotais', this.estado.pontos.total);
            this.atualizarElemento('limiteDesvantagens', this.estado.pontos.limiteDesvantagens);
        }
        
        if (dados.caracteristicas) {
            this.estado.caracteristicas = { ...this.estado.caracteristicas, ...dados.caracteristicas };
            this.pontosCaracteristicasCache = {
                aparência: this.estado.caracteristicas.aparência,
                riqueza: this.estado.caracteristicas.riqueza,
                idiomas: this.estado.caracteristicas.idiomas,
                fisicas: this.estado.caracteristicas.fisicas,
                total: this.estado.pontos.gastosCaracteristicas
            };
        }
        
        if (dados.atributos) {
            this.estado.atributos = { ...this.estado.atributos, ...dados.atributos };
            this.ultimosAtributos = {
                ST: this.estado.atributos.ST,
                DX: this.estado.atributos.DX,
                IQ: this.estado.atributos.IQ,
                HT: this.estado.atributos.HT
            };
        }
        
        if (dados.foto) {
            this.fotoTemporaria = dados.foto;
            this.estado.foto = dados.foto;
            
            const fotoPreview = document.getElementById('fotoPreview');
            const fotoPlaceholder = document.getElementById('fotoPlaceholder');
            const btnRemoverFoto = document.getElementById('btnRemoverFoto');
            
            if (fotoPreview && dados.foto.dataUrl) {
                fotoPreview.src = dados.foto.dataUrl;
                fotoPreview.style.display = 'block';
                
                if (fotoPlaceholder) fotoPlaceholder.style.display = 'none';
                if (btnRemoverFoto) btnRemoverFoto.style.display = 'inline-block';
            }
        }
        
        this.recalcularSaldoCompleto();
        this.atualizarDisplayCompleto();
    }

    destruir() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
        }
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
            this.salvarNoFirebase();
        }
        
        this.monitorAtivo = false;
    }
}

// ===========================================
// INICIALIZAÇÃO GLOBAL
// ===========================================

(function() {
    let dashboardManagerInstance = null;
    
    function inicializarDashboard() {
        if (!dashboardManagerInstance) {
            dashboardManagerInstance = new DashboardManager();
            dashboardManagerInstance.inicializar();
            
            window.dashboardManager = dashboardManagerInstance;
            
            setTimeout(() => {
                dashboardManagerInstance.recalcularSaldoCompleto();
                dashboardManagerInstance.atualizarDisplayCompleto();
            }, 1000);
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            inicializarDashboard();
        }, 500);
    });
    
    window.DashboardManager = DashboardManager;
    
    window.atualizarDashboard = function() {
        if (dashboardManagerInstance) {
            dashboardManagerInstance.recalcularSaldoCompleto();
            dashboardManagerInstance.atualizarDisplayCompleto();
        }
    };
    
    window.obterPontosCaracteristicas = function() {
        return dashboardManagerInstance ? 
            dashboardManagerInstance.estado.pontos.gastosCaracteristicas : 0;
    };
    
    window.getDashboardManager = function() {
        return dashboardManagerInstance;
    };
})();

// Funções globais auxiliares
window.ajustarPV = function(valor) {
    const dashboard = window.dashboardManager;
    if (dashboard) dashboard.ajustarPV(valor);
};

window.ajustarPF = function(valor) {
    const dashboard = window.dashboardManager;
    if (dashboard) dashboard.ajustarPF(valor);
};

window.carregarDadosDashboard = function(dados) {
    const dashboard = window.dashboardManager;
    if (dashboard) dashboard.carregarDados(dados);
};

window.obterDadosDashboard = function() {
    const dashboard = window.dashboardManager;
    return dashboard ? dashboard.coletarDadosParaSalvar() : null;
};

window.salvarDashboard = function() {
    const dashboard = window.dashboardManager;
    if (dashboard) dashboard.salvarNoFirebase();
};