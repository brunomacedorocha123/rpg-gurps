// ===========================================
// DASHBOARD MANAGER - VERSÃO COMPLETA E TOTAL
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
        
        this.fotoTemporaria = null;
        this.monitorAtivo = false;
        this.intervaloMonitor = null;
        this.ultimosAtributos = { ST: 10, DX: 10, IQ: 10, HT: 10 };
    }

    inicializar() {
        this.configurarSistemaFoto();
        this.configurarEventosDashboard();
        this.configurarEventosAtributos();
        this.configurarEventosExternos();
        this.configurarBotoesVitalidade();
        this.carregarValoresIniciais();
        this.iniciarMonitoramentoContinuo();
        this.forcarAtualizacaoInicial();
        return this;
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
            { id: 'dashboardRaca', tipo: 'text', callback: (v) => this.estado.identificacao.raca = v },
            { id: 'dashboardClasse', tipo: 'text', callback: (v) => this.estado.identificacao.classe = v },
            { id: 'dashboardNivel', tipo: 'text', callback: (v) => this.estado.identificacao.nivel = v },
            { id: 'pontosTotais', tipo: 'number', callback: (v) => {
                this.estado.pontos.total = parseInt(v) || 150;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayPontos();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
            }},
            { id: 'limiteDesvantagens', tipo: 'number', callback: (v) => {
                this.estado.pontos.limiteDesvantagens = parseInt(v) || -50;
                this.atualizarDisplayPontos();
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
            }},
            { id: 'nivelRiqueza', callback: (v) => {
                this.estado.financeiro.riqueza = v;
                this.calcularRendaDetalhada();
                this.atualizarDisplayFinanceiro();
            }}
        ];

        selectsDashboard.forEach(({ id, callback }) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('change', () => {
                    const valor = elemento.options[elemento.selectedIndex].text.split('[')[0].trim();
                    callback(valor);
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
            });
            
            textareaDescricao.addEventListener('focus', () => {
                textareaDescricao.style.borderColor = 'var(--primary-gold)';
                textareaDescricao.style.boxShadow = '0 0 0 3px rgba(212, 175, 55, 0.1)';
            });
            
            textareaDescricao.addEventListener('blur', () => {
                textareaDescricao.style.borderColor = '';
                textareaDescricao.style.boxShadow = '';
            });
        }
    }

    configurarEventosAtributos() {
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.processarAtributosAlterados(e.detail);
            }
        });

        const atributosParaMonitorar = ['ST', 'DX', 'IQ', 'HT'];
        atributosParaMonitorar.forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('change', () => this.atualizarAtributosDiretamente());
                input.addEventListener('input', () => this.atualizarAtributosDiretamente());
            }
        });

        const derivadosParaMonitorar = ['PVTotal', 'PFTotal', 'VontadeTotal', 'PercepcaoTotal', 'DeslocamentoTotal'];
        derivadosParaMonitorar.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                const observer = new MutationObserver(() => {
                    this.atualizarAtributosDerivados();
                });
                observer.observe(elemento, { childList: true, characterData: true, subtree: true });
            }
        });

        const bonusParaMonitorar = ['bonusPV', 'bonusPF', 'bonusVontade', 'bonusPercepcao', 'bonusDeslocamento'];
        bonusParaMonitorar.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.atualizarAtributosDerivados());
                input.addEventListener('input', () => this.atualizarAtributosDerivados());
            }
        });
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
            }
        });

        document.addEventListener('magiasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosMagias = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.atualizarDisplayPontos();
            }
        });

        document.addEventListener('tecnicasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosTecnicas = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.atualizarDisplayPontos();
            }
        });

        document.addEventListener('peculiaridadesAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPeculiaridades = e.detail.total;
                this.recalcularSaldoCompleto();
                this.atualizarDisplayResumo();
                this.atualizarDisplayDistribuicao();
                this.atualizarDisplayPontos();
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
                
                botao.addEventListener('mousedown', () => {
                    botao.style.transform = 'scale(0.95)';
                    botao.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.3)';
                });
                
                botao.addEventListener('mouseup', () => {
                    botao.style.transform = '';
                    botao.style.boxShadow = '';
                });
                
                botao.addEventListener('mouseleave', () => {
                    botao.style.transform = '';
                    botao.style.boxShadow = '';
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
                    } else if (tipo === 'PF') {
                        const novoValor = Math.round(percentual * this.estado.atributos.PF.max);
                        this.estado.atributos.PF.atual = Math.max(0, Math.min(novoValor, this.estado.atributos.PF.max));
                        this.atualizarDisplayAtributos();
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

        const selectsValores = [
            { id: 'nivelAparencia', alvo: 'financeiro.aparencia' },
            { id: 'nivelRiqueza', alvo: 'financeiro.riqueza' }
        ];

        selectsValores.forEach(({ id, alvo }) => {
            const elemento = document.getElementById(id);
            if (elemento && elemento.selectedIndex >= 0) {
                const texto = elemento.options[elemento.selectedIndex].text.split('[')[0].trim();
                this.estado[alvo.split('.')[0]][alvo.split('.')[1]] = texto;
            }
        });

        this.atualizarAtributosDiretamente();
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
            this.coletarDadosAbasExternas();
            this.verificarAtualizacoesPendentes();
        }, 300);

        this.monitorAtivo = true;
    }

    forcarAtualizacaoInicial() {
        setTimeout(() => {
            this.atualizarAtributosDiretamente();
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        }, 500);

        setTimeout(() => {
            this.atualizarAtributosDiretamente();
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        }, 1000);
    }

    processarAtributosAlterados(detalhes) {
        if (!detalhes) return;
        
        const atributosAntigos = { ...this.estado.atributos };
        
        this.estado.atributos.ST = detalhes.ST || 10;
        this.estado.atributos.DX = detalhes.DX || 10;
        this.estado.atributos.IQ = detalhes.IQ || 10;
        this.estado.atributos.HT = detalhes.HT || 10;
        
        this.estado.atributos.PV.max = detalhes.PV || this.estado.atributos.ST;
        this.estado.atributos.PF.max = detalhes.PF || this.estado.atributos.HT;
        this.estado.atributos.Vontade = detalhes.Vontade || this.estado.atributos.IQ;
        this.estado.atributos.Percepcao = detalhes.Percepcao || this.estado.atributos.IQ;
        this.estado.atributos.Deslocamento = detalhes.Deslocamento || 5.00;
        
        if (this.estado.atributos.PV.atual > this.estado.atributos.PV.max) {
            this.estado.atributos.PV.atual = this.estado.atributos.PV.max;
        }
        
        if (this.estado.atributos.PF.atual > this.estado.atributos.PF.max) {
            this.estado.atributos.PF.atual = this.estado.atributos.PF.max;
        }
        
        if (detalhes.pontosGastos !== undefined) {
            this.estado.pontos.gastosAtributos = detalhes.pontosGastos;
        } else {
            const custoST = (this.estado.atributos.ST - 10) * 10;
            const custoDX = (this.estado.atributos.DX - 10) * 20;
            const custoIQ = (this.estado.atributos.IQ - 10) * 20;
            const custoHT = (this.estado.atributos.HT - 10) * 10;
            this.estado.pontos.gastosAtributos = custoST + custoDX + custoIQ + custoHT;
        }
        
        const atributosMudaram = 
            atributosAntigos.ST !== this.estado.atributos.ST ||
            atributosAntigos.DX !== this.estado.atributos.DX ||
            atributosAntigos.IQ !== this.estado.atributos.IQ ||
            atributosAntigos.HT !== this.estado.atributos.HT;
        
        if (atributosMudaram) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        } else {
            this.atualizarDisplayAtributos();
            this.atualizarDisplayResumo();
            this.atualizarDisplayPontos();
        }
    }

    atualizarAtributosDiretamente() {
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;
        
        const pvElement = document.getElementById('PVTotal');
        const pfElement = document.getElementById('PFTotal');
        const vontadeElement = document.getElementById('VontadeTotal');
        const percepcaoElement = document.getElementById('PercepcaoTotal');
        const deslocamentoElement = document.getElementById('DeslocamentoTotal');
        
        const pvTotal = pvElement ? parseInt(pvElement.textContent) || st : st;
        const pfTotal = pfElement ? parseInt(pfElement.textContent) || ht : ht;
        const vontadeTotal = vontadeElement ? parseInt(vontadeElement.textContent) || iq : iq;
        const percepcaoTotal = percepcaoElement ? parseInt(percepcaoElement.textContent) || iq : iq;
        const deslocamentoTotal = deslocamentoElement ? parseFloat(deslocamentoElement.textContent) || 5.00 : 5.00;
        
        const pontosGastosElement = document.getElementById('pontosGastos');
        const pontosGastos = pontosGastosElement ? parseInt(pontosGastosElement.textContent) || 0 : 0;
        
        const atributosAntigos = { ...this.estado.atributos };
        
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        this.estado.atributos.PV.max = pvTotal;
        this.estado.atributos.PF.max = pfTotal;
        this.estado.atributos.Vontade = vontadeTotal;
        this.estado.atributos.Percepcao = percepcaoTotal;
        this.estado.atributos.Deslocamento = deslocamentoTotal;
        
        if (this.estado.atributos.PV.atual > pvTotal) {
            this.estado.atributos.PV.atual = pvTotal;
        }
        
        if (this.estado.atributos.PF.atual > pfTotal) {
            this.estado.atributos.PF.atual = pfTotal;
        }
        
        this.estado.pontos.gastosAtributos = pontosGastos;
        
        const atributosMudaram = 
            atributosAntigos.ST !== st ||
            atributosAntigos.DX !== dx ||
            atributosAntigos.IQ !== iq ||
            atributosAntigos.HT !== ht ||
            atributosAntigos.PV.max !== pvTotal ||
            atributosAntigos.PF.max !== pfTotal;
        
        if (atributosMudaram) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        }
    }

    atualizarAtributosDerivados() {
        const pvElement = document.getElementById('PVTotal');
        const pfElement = document.getElementById('PFTotal');
        const vontadeElement = document.getElementById('VontadeTotal');
        const percepcaoElement = document.getElementById('PercepcaoTotal');
        const deslocamentoElement = document.getElementById('DeslocamentoTotal');
        
        if (pvElement) {
            const pvTotal = parseInt(pvElement.textContent) || this.estado.atributos.ST;
            this.estado.atributos.PV.max = pvTotal;
            if (this.estado.atributos.PV.atual > pvTotal) {
                this.estado.atributos.PV.atual = pvTotal;
            }
        }
        
        if (pfElement) {
            const pfTotal = parseInt(pfElement.textContent) || this.estado.atributos.HT;
            this.estado.atributos.PF.max = pfTotal;
            if (this.estado.atributos.PF.atual > pfTotal) {
                this.estado.atributos.PF.atual = pfTotal;
            }
        }
        
        if (vontadeElement) {
            this.estado.atributos.Vontade = parseInt(vontadeElement.textContent) || this.estado.atributos.IQ;
        }
        
        if (percepcaoElement) {
            this.estado.atributos.Percepcao = parseInt(percepcaoElement.textContent) || this.estado.atributos.IQ;
        }
        
        if (deslocamentoElement) {
            this.estado.atributos.Deslocamento = parseFloat(deslocamentoElement.textContent) || 5.00;
        }
        
        this.atualizarDisplayAtributos();
    }

    verificarMudancasAtributos() {
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;
        
        if (st !== this.ultimosAtributos.ST || 
            dx !== this.ultimosAtributos.DX || 
            iq !== this.ultimosAtributos.IQ || 
            ht !== this.ultimosAtributos.HT) {
            
            this.ultimosAtributos = { ST: st, DX: dx, IQ: iq, HT: ht };
            this.atualizarAtributosDiretamente();
        }
    }

    coletarDadosAbasExternas() {
        const elementosParaColetar = [
            { id: 'total-vantagens', tipo: 'vantagensDesvantagens' },
            { id: 'pontos-pericias-total', tipo: 'pericias' },
            { id: 'total-gasto-magia', tipo: 'magias' },
            { id: 'total-tecnicas', tipo: 'tecnicas' },
            { id: 'total-peculiaridades', tipo: 'peculiaridades' },
            { id: 'pontosGastos', tipo: 'atributos' }
        ];

        let dadosAtualizados = false;

        elementosParaColetar.forEach(({ id, tipo }) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                const texto = elemento.textContent || elemento.value || '';
                const match = texto.match(/[+-]?\d+/);
                const valor = match ? parseInt(match[0]) : 0;

                switch(tipo) {
                    case 'vantagensDesvantagens':
                        if (valor >= 0) {
                            if (this.estado.pontos.gastosVantagens !== valor) {
                                this.estado.pontos.gastosVantagens = valor;
                                this.estado.pontos.gastosDesvantagens = 0;
                                dadosAtualizados = true;
                            }
                        } else {
                            if (this.estado.pontos.gastosDesvantagens !== Math.abs(valor)) {
                                this.estado.pontos.gastosVantagens = 0;
                                this.estado.pontos.gastosDesvantagens = Math.abs(valor);
                                dadosAtualizados = true;
                            }
                        }
                        break;
                    
                    case 'pericias':
                        if (this.estado.pontos.gastosPericias !== valor) {
                            this.estado.pontos.gastosPericias = valor;
                            dadosAtualizados = true;
                        }
                        break;
                    
                    case 'magias':
                        if (this.estado.pontos.gastosMagias !== valor) {
                            this.estado.pontos.gastosMagias = valor;
                            dadosAtualizados = true;
                        }
                        break;
                    
                    case 'tecnicas':
                        if (this.estado.pontos.gastosTecnicas !== valor) {
                            this.estado.pontos.gastosTecnicas = valor;
                            dadosAtualizados = true;
                        }
                        break;
                    
                    case 'peculiaridades':
                        if (this.estado.pontos.gastosPeculiaridades !== valor) {
                            this.estado.pontos.gastosPeculiaridades = valor;
                            dadosAtualizados = true;
                        }
                        break;
                    
                    case 'atributos':
                        if (this.estado.pontos.gastosAtributos !== valor) {
                            this.estado.pontos.gastosAtributos = valor;
                            dadosAtualizados = true;
                        }
                        break;
                }
            }
        });

        if (dadosAtualizados) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayResumo();
            this.atualizarDisplayDistribuicao();
            this.atualizarDisplayPontos();
        }
    }

    verificarAtualizacoesPendentes() {
        const elementosParaVerificar = [
            'atributoST', 'atributoDX', 'atributoIQ', 'atributoHT',
            'valorPV', 'valorPF', 'barraPV', 'barraPF',
            'saldoDisponivel', 'desvantagensAtuais',
            'gastosAtributos', 'gastosVantagens', 'gastosDesvantagens',
            'gastosPericias', 'gastosMagias', 'gastosTecnicas', 'gastosPeculiaridades',
            'totalLiquido', 'distribAtributos', 'distribVantagens',
            'distribPericias', 'distribOutros'
        ];

        elementosParaVerificar.forEach(id => {
            const elemento = document.getElementById(id);
            if (!elemento) {
                this.atualizarDisplayCompleto();
                return;
            }
        });
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
            this.atualizarDisplayResumo();
            this.atualizarDisplayDistribuicao();
            this.atualizarDisplayPontos();
        }
    }

    calcularRendaDetalhada() {
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        if (!nivelRiqueza) return;
        
        const valor = parseInt(nivelRiqueza.value) || 0;
        const rendaBase = 1000;
        
        const multiplicadores = {
            '-25': 0.0,   // Muito pobre
            '-15': 0.2,   // Pobre
            '-10': 0.5,   // Abaixo da média
            '0': 1.0,     // Médio
            '10': 2.0,    // Confortável
            '20': 5.0,    // Rico
            '30': 20.0,   // Muito rico
            '50': 100.0   // Extremamente rico
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
            this.estado.pontos.gastosPeculiaridades;
        
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
            
            if (textarea.value.length > 450) {
                contador.style.color = '#e74c3c';
                contador.style.fontWeight = 'bold';
            } else if (textarea.value.length > 400) {
                contador.style.color = '#f39c12';
                contador.style.fontWeight = 'bold';
            } else {
                contador.style.color = '';
                contador.style.fontWeight = '';
            }
        }
    }

    atualizarDisplayCompleto() {
        this.atualizarDisplayAtributos();
        this.atualizarDisplayPontos();
        this.atualizarDisplayFinanceiro();
        this.atualizarDisplayResumo();
        this.atualizarDisplayDistribuicao();
        this.atualizarEstilosDinamicos();
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
        
        const barraPV = document.getElementById('barraPV');
        const barraPF = document.getElementById('barraPF');
        
        if (barraPV) {
            if (porcentagemPV < 25) {
                barraPV.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            } else if (porcentagemPV < 50) {
                barraPV.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                barraPV.style.background = 'linear-gradient(90deg, #2ecc71, #27ae60)';
            }
        }
        
        if (barraPF) {
            if (porcentagemPF < 25) {
                barraPF.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            } else if (porcentagemPF < 50) {
                barraPF.style.background = 'linear-gradient(90deg, #f39c12, #e67e22)';
            } else {
                barraPF.style.background = 'linear-gradient(90deg, #3498db, #2980b9)';
            }
        }
    }

    atualizarDisplayPontos() {
        const total = this.estado.pontos.total;
        const saldoDisponivel = this.estado.pontos.saldoDisponivel;
        const gastosDesvantagens = this.estado.pontos.gastosDesvantagens;
        const limiteDesvantagens = this.estado.pontos.limiteDesvantagens;
        const gastosTotais = this.estado.pontos.pontosGastosTotal;
        
        this.atualizarElemento('saldoDisponivel', saldoDisponivel);
        this.atualizarElemento('desvantagensAtuais', gastosDesvantagens);
        
        const pontosGastosElement = document.getElementById('pontosGastos');
        if (pontosGastosElement) {
            pontosGastosElement.textContent = gastosTotais;
        }
        
        const saldoElement = document.getElementById('saldoDisponivel');
        if (saldoElement) {
            if (saldoDisponivel < 0) {
                saldoElement.style.color = '#e74c3c';
                saldoElement.style.fontWeight = 'bold';
                saldoElement.style.textShadow = '0 0 5px rgba(231, 76, 60, 0.5)';
            } else if (saldoDisponivel < 30) {
                saldoElement.style.color = '#f39c12';
                saldoElement.style.fontWeight = 'bold';
                saldoElement.style.textShadow = 'none';
            } else if (saldoDisponivel < 50) {
                saldoElement.style.color = '#f1c40f';
                saldoElement.style.fontWeight = 'normal';
                saldoElement.style.textShadow = 'none';
            } else {
                saldoElement.style.color = '#27ae60';
                saldoElement.style.fontWeight = 'normal';
                saldoElement.style.textShadow = 'none';
            }
        }
        
        const desvElement = document.getElementById('desvantagensAtuais');
        if (desvElement) {
            const excedeLimite = Math.abs(gastosDesvantagens) > Math.abs(limiteDesvantagens);
            const pertoLimite = Math.abs(gastosDesvantagens) > Math.abs(limiteDesvantagens) * 0.8;
            
            if (excedeLimite) {
                desvElement.style.color = '#e74c3c';
                desvElement.style.fontWeight = 'bold';
                desvElement.style.textShadow = '0 0 5px rgba(231, 76, 60, 0.5)';
            } else if (pertoLimite) {
                desvElement.style.color = '#f39c12';
                desvElement.style.fontWeight = 'bold';
                desvElement.style.textShadow = 'none';
            } else {
                desvElement.style.color = '#9b59b6';
                desvElement.style.fontWeight = 'normal';
                desvElement.style.textShadow = 'none';
            }
        }
        
        const pontosTotaisInput = document.getElementById('pontosTotais');
        if (pontosTotaisInput && parseInt(pontosTotaisInput.value) !== total) {
            pontosTotaisInput.value = total;
        }
        
        const limiteInput = document.getElementById('limiteDesvantagens');
        if (limiteInput && parseInt(limiteInput.value) !== limiteDesvantagens) {
            limiteInput.value = limiteDesvantagens;
        }
    }

    atualizarDisplayFinanceiro() {
        this.atualizarElemento('nivelRiqueza', this.estado.financeiro.riqueza);
        this.atualizarElemento('saldoPersonagem', this.estado.financeiro.saldo);
        this.atualizarElemento('nivelAparencia', this.estado.financeiro.aparencia);
        
        const nivelRiquezaSelect = document.getElementById('nivelRiqueza');
        if (nivelRiquezaSelect) {
            for (let i = 0; i < nivelRiquezaSelect.options.length; i++) {
                const option = nivelRiquezaSelect.options[i];
                const texto = option.text.split('[')[0].trim();
                if (texto === this.estado.financeiro.riqueza) {
                    nivelRiquezaSelect.selectedIndex = i;
                    break;
                }
            }
        }
        
        const nivelAparenciaSelect = document.getElementById('nivelAparencia');
        if (nivelAparenciaSelect) {
            for (let i = 0; i < nivelAparenciaSelect.options.length; i++) {
                const option = nivelAparenciaSelect.options[i];
                const texto = option.text.split('[')[0].trim();
                if (texto === this.estado.financeiro.aparencia) {
                    nivelAparenciaSelect.selectedIndex = i;
                    break;
                }
            }
        }
    }

    atualizarDisplayResumo() {
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        const gastosVantagens = this.estado.pontos.gastosVantagens;
        const gastosDesvantagens = this.estado.pontos.gastosDesvantagens;
        const gastosPericias = this.estado.pontos.gastosPericias;
        const gastosMagias = this.estado.pontos.gastosMagias;
        const gastosTecnicas = this.estado.pontos.gastosTecnicas;
        const gastosPeculiaridades = this.estado.pontos.gastosPeculiaridades;
        const saldoDisponivel = this.estado.pontos.saldoDisponivel;
        
        this.atualizarElemento('gastosAtributos', gastosAtributos);
        this.atualizarElemento('gastosVantagens', gastosVantagens);
        this.atualizarElemento('gastosDesvantagens', gastosDesvantagens);
        this.atualizarElemento('gastosPericias', gastosPericias);
        this.atualizarElemento('gastosMagias', gastosMagias);
        this.atualizarElemento('gastosTecnicas', gastosTecnicas);
        this.atualizarElemento('gastosPeculiaridades', gastosPeculiaridades);
        this.atualizarElemento('totalLiquido', saldoDisponivel);
        
        const cardsResumo = [
            { id: 'gastosAtributos', valor: gastosAtributos },
            { id: 'gastosVantagens', valor: gastosVantagens },
            { id: 'gastosDesvantagens', valor: gastosDesvantagens },
            { id: 'gastosPericias', valor: gastosPericias },
            { id: 'gastosMagias', valor: gastosMagias },
            { id: 'gastosTecnicas', valor: gastosTecnicas },
            { id: 'gastosPeculiaridades', valor: gastosPeculiaridades },
            { id: 'totalLiquido', valor: saldoDisponivel }
        ];
        
        cardsResumo.forEach(({ id, valor }) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (id === 'gastosDesvantagens' && valor > 0) {
                    elemento.style.color = '#9b59b6';
                    elemento.style.fontWeight = 'bold';
                } else if (id === 'totalLiquido') {
                    if (valor < 0) {
                        elemento.style.color = '#e74c3c';
                        elemento.style.fontWeight = 'bold';
                    } else if (valor < 50) {
                        elemento.style.color = '#f39c12';
                        elemento.style.fontWeight = 'bold';
                    } else {
                        elemento.style.color = '#27ae60';
                        elemento.style.fontWeight = 'normal';
                    }
                } else if (valor > 0) {
                    elemento.style.color = '#3498db';
                    elemento.style.fontWeight = 'bold';
                } else {
                    elemento.style.color = '#7f8c8d';
                    elemento.style.fontWeight = 'normal';
                }
            }
        });
    }

    atualizarDisplayDistribuicao() {
        const total = this.estado.pontos.total;
        if (total <= 0) {
            this.atualizarBarra('distribAtributos', 0);
            this.atualizarBarra('distribVantagens', 0);
            this.atualizarBarra('distribPericias', 0);
            this.atualizarBarra('distribOutros', 0);
            
            this.atualizarElemento('distribAtributosValor', '0%');
            this.atualizarElemento('distribVantagensValor', '0%');
            this.atualizarElemento('distribPericiasValor', '0%');
            this.atualizarElemento('distribOutrosValor', '0%');
            return;
        }
        
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        const gastosVantagens = this.estado.pontos.gastosVantagens;
        const gastosPericiasMagias = this.estado.pontos.gastosPericias + this.estado.pontos.gastosMagias;
        const outros = this.estado.pontos.gastosTecnicas + this.estado.pontos.gastosPeculiaridades;
        
        const gastosTotais = gastosAtributos + gastosVantagens + gastosPericiasMagias + outros;
        
        const distribAtributos = gastosTotais > 0 ? (gastosAtributos / gastosTotais) * 100 : 0;
        const distribVantagens = gastosTotais > 0 ? (gastosVantagens / gastosTotais) * 100 : 0;
        const distribPericias = gastosTotais > 0 ? (gastosPericiasMagias / gastosTotais) * 100 : 0;
        const distribOutros = gastosTotais > 0 ? (outros / gastosTotais) * 100 : 0;
        
        this.atualizarBarra('distribAtributos', distribAtributos);
        this.atualizarBarra('distribVantagens', distribVantagens);
        this.atualizarBarra('distribPericias', distribPericias);
        this.atualizarBarra('distribOutros', distribOutros);
        
        this.atualizarElemento('distribAtributosValor', `${Math.round(distribAtributos)}%`);
        this.atualizarElemento('distribVantagensValor', `${Math.round(distribVantagens)}%`);
        this.atualizarElemento('distribPericiasValor', `${Math.round(distribPericias)}%`);
        this.atualizarElemento('distribOutrosValor', `${Math.round(distribOutros)}%`);
        
        const barrasDistribuicao = [
            { id: 'distribAtributos', cor: '3498db' },
            { id: 'distribVantagens', cor: '2ecc71' },
            { id: 'distribPericias', cor: 'e74c3c' },
            { id: 'distribOutros', cor: 'f39c12' }
        ];
        
        barrasDistribuicao.forEach(({ id, cor }) => {
            const barra = document.getElementById(id);
            if (barra) {
                barra.style.background = `linear-gradient(90deg, #${cor}, #${cor}dd)`;
            }
        });
    }

    atualizarEstilosDinamicos() {
        const cardsAtributos = document.querySelectorAll('.atributo-card');
        cardsAtributos.forEach(card => {
            const valorElement = card.querySelector('.atributo-value');
            if (valorElement) {
                const valor = parseInt(valorElement.textContent) || 10;
                if (valor > 12) {
                    card.style.borderColor = '#2ecc71';
                    card.style.boxShadow = '0 0 10px rgba(46, 204, 113, 0.3)';
                } else if (valor < 8) {
                    card.style.borderColor = '#e74c3c';
                    card.style.boxShadow = '0 0 10px rgba(231, 76, 60, 0.3)';
                } else {
                    card.style.borderColor = '';
                    card.style.boxShadow = '';
                }
            }
        });
        
        const cardsPonto = document.querySelectorAll('.ponto-card');
        cardsPonto.forEach(card => {
            if (card.classList.contains('ponto-disponivel')) {
                const valorElement = card.querySelector('.ponto-value');
                if (valorElement) {
                    const valor = parseInt(valorElement.textContent) || 0;
                    if (valor < 0) {
                        card.style.borderColor = '#e74c3c';
                        card.style.background = 'linear-gradient(145deg, rgba(231, 76, 60, 0.1), rgba(192, 57, 43, 0.15))';
                    } else if (valor < 30) {
                        card.style.borderColor = '#f39c12';
                        card.style.background = 'linear-gradient(145deg, rgba(243, 156, 18, 0.1), rgba(230, 126, 34, 0.15))';
                    } else {
                        card.style.borderColor = '';
                        card.style.background = '';
                    }
                }
            }
        });
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (!elemento) return;
        
        const valorAtual = elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT' || elemento.tagName === 'TEXTAREA' 
            ? elemento.value 
            : elemento.textContent;
        
        const valorFormatado = typeof valor === 'number' 
            ? (id.includes('Deslocamento') ? valor.toFixed(2) : valor.toString())
            : (valor || '');
        
        if (valorAtual !== valorFormatado) {
            if (elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT' || elemento.tagName === 'TEXTAREA') {
                elemento.value = valorFormatado;
            } else {
                elemento.textContent = valorFormatado;
            }
            
            if (elemento.tagName === 'INPUT' && elemento.type === 'number') {
                elemento.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }
    }

    atualizarBarra(id, percentual) {
        const barra = document.getElementById(id);
        if (barra) {
            const percentualLimitado = Math.min(Math.max(percentual, 0), 100);
            const percentualAtual = parseFloat(barra.style.width) || 0;
            
            if (Math.abs(percentualAtual - percentualLimitado) > 0.5) {
                barra.style.width = `${percentualLimitado}%`;
                
                barra.style.transition = 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                
                setTimeout(() => {
                    barra.style.transition = '';
                }, 500);
            }
        }
    }

    ajustarPV(valor) {
        const novoPV = this.estado.atributos.PV.atual + valor;
        this.estado.atributos.PV.atual = Math.max(0, Math.min(novoPV, this.estado.atributos.PV.max));
        this.atualizarDisplayAtributos();
        
        const elemento = document.getElementById('valorPV');
        if (elemento) {
            elemento.style.transform = 'scale(1.1)';
            elemento.style.color = valor > 0 ? '#2ecc71' : '#e74c3c';
            setTimeout(() => {
                elemento.style.transform = '';
                elemento.style.color = '';
            }, 300);
        }
    }

    ajustarPF(valor) {
        const novoPF = this.estado.atributos.PF.atual + valor;
        this.estado.atributos.PF.atual = Math.max(0, Math.min(novoPF, this.estado.atributos.PF.max));
        this.atualizarDisplayAtributos();
        
        const elemento = document.getElementById('valorPF');
        if (elemento) {
            elemento.style.transform = 'scale(1.1)';
            elemento.style.color = valor > 0 ? '#3498db' : '#e74c3c';
            setTimeout(() => {
                elemento.style.transform = '';
                elemento.style.color = '';
            }, 300);
        }
    }

    coletarDadosParaSalvar() {
        const dadosParaSalvar = {
            identificacao: {
                raca: this.estado.identificacao.raca,
                classe: this.estado.identificacao.classe,
                nivel: this.estado.identificacao.nivel,
                descricao: this.estado.identificacao.descricao
            },
            pontos: {
                total: this.estado.pontos.total,
                limiteDesvantagens: this.estado.pontos.limiteDesvantagens,
                saldoDisponivel: this.estado.pontos.saldoDisponivel,
                pontosGastosTotal: this.estado.pontos.pontosGastosTotal
            },
            atributos: {
                ST: this.estado.atributos.ST,
                DX: this.estado.atributos.DX,
                IQ: this.estado.atributos.IQ,
                HT: this.estado.atributos.HT,
                PV: { ...this.estado.atributos.PV },
                PF: { ...this.estado.atributos.PF },
                Vontade: this.estado.atributos.Vontade,
                Percepcao: this.estado.atributos.Percepcao,
                Deslocamento: this.estado.atributos.Deslocamento
            },
            financeiro: {
                riqueza: this.estado.financeiro.riqueza,
                saldo: this.estado.financeiro.saldo,
                aparencia: this.estado.financeiro.aparencia
            },
            gastos: {
                atributos: this.estado.pontos.gastosAtributos,
                vantagens: this.estado.pontos.gastosVantagens,
                desvantagens: this.estado.pontos.gastosDesvantagens,
                pericias: this.estado.pontos.gastosPericias,
                magias: this.estado.pontos.gastosMagias,
                tecnicas: this.estado.pontos.gastosTecnicas,
                peculiaridades: this.estado.pontos.gastosPeculiaridades
            },
            foto: this.fotoTemporaria,
            dashboard: {
                atualizadoEm: new Date().toISOString(),
                versao: '1.0.0',
                hash: Date.now().toString(36) + Math.random().toString(36).substr(2)
            }
        };
        
        return dadosParaSalvar;
    }

    carregarDados(dados) {
        if (!dados) return;
        
        if (dados.identificacao) {
            this.estado.identificacao.raca = dados.identificacao.raca || '';
            this.estado.identificacao.classe = dados.identificacao.classe || '';
            this.estado.identificacao.nivel = dados.identificacao.nivel || '';
            this.estado.identificacao.descricao = dados.identificacao.descricao || '';
            
            this.atualizarElemento('dashboardRaca', this.estado.identificacao.raca);
            this.atualizarElemento('dashboardClasse', this.estado.identificacao.classe);
            this.atualizarElemento('dashboardNivel', this.estado.identificacao.nivel);
            this.atualizarElemento('dashboardDescricao', this.estado.identificacao.descricao);
        }
        
        if (dados.pontos) {
            this.estado.pontos.total = dados.pontos.total || 150;
            this.estado.pontos.limiteDesvantagens = dados.pontos.limiteDesvantagens || -50;
            this.estado.pontos.saldoDisponivel = dados.pontos.saldoDisponivel || 150;
            this.estado.pontos.pontosGastosTotal = dados.pontos.pontosGastosTotal || 0;
            
            this.atualizarElemento('pontosTotais', this.estado.pontos.total);
            this.atualizarElemento('limiteDesvantagens', this.estado.pontos.limiteDesvantagens);
        }
        
        if (dados.atributos) {
            this.estado.atributos.ST = dados.atributos.ST || 10;
            this.estado.atributos.DX = dados.atributos.DX || 10;
            this.estado.atributos.IQ = dados.atributos.IQ || 10;
            this.estado.atributos.HT = dados.atributos.HT || 10;
            this.estado.atributos.PV = dados.atributos.PV || { atual: 10, max: 10 };
            this.estado.atributos.PF = dados.atributos.PF || { atual: 10, max: 10 };
            this.estado.atributos.Vontade = dados.atributos.Vontade || 10;
            this.estado.atributos.Percepcao = dados.atributos.Percepcao || 10;
            this.estado.atributos.Deslocamento = dados.atributos.Deslocamento || 5.00;
            
            this.ultimosAtributos = {
                ST: this.estado.atributos.ST,
                DX: this.estado.atributos.DX,
                IQ: this.estado.atributos.IQ,
                HT: this.estado.atributos.HT
            };
        }
        
        if (dados.financeiro) {
            this.estado.financeiro.riqueza = dados.financeiro.riqueza || 'Médio';
            this.estado.financeiro.saldo = dados.financeiro.saldo || '$2.000';
            this.estado.financeiro.aparencia = dados.financeiro.aparencia || 'Média';
            
            this.atualizarElemento('nivelRiqueza', this.estado.financeiro.riqueza);
            this.atualizarElemento('nivelAparencia', this.estado.financeiro.aparencia);
            
            this.calcularRendaDetalhada();
        }
        
        if (dados.gastos) {
            this.estado.pontos.gastosAtributos = dados.gastos.atributos || 0;
            this.estado.pontos.gastosVantagens = dados.gastos.vantagens || 0;
            this.estado.pontos.gastosDesvantagens = dados.gastos.desvantagens || 0;
            this.estado.pontos.gastosPericias = dados.gastos.pericias || 0;
            this.estado.pontos.gastosMagias = dados.gastos.magias || 0;
            this.estado.pontos.gastosTecnicas = dados.gastos.tecnicas || 0;
            this.estado.pontos.gastosPeculiaridades = dados.gastos.peculiaridades || 0;
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
                
                if (fotoPlaceholder) {
                    fotoPlaceholder.style.display = 'none';
                }
                
                if (btnRemoverFoto) {
                    btnRemoverFoto.style.display = 'inline-block';
                }
            }
        }
        
        this.recalcularSaldoCompleto();
        this.atualizarDisplayCompleto();
        this.atualizarContadorDescricao();
        
        setTimeout(() => {
            this.atualizarAtributosDiretamente();
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        }, 100);
    }

    destruir() {
        if (this.intervaloMonitor) {
            clearInterval(this.intervaloMonitor);
            this.intervaloMonitor = null;
        }
        
        this.monitorAtivo = false;
        
        document.removeEventListener('atributosAlterados', this.processarAtributosAlterados);
        document.removeEventListener('vantagensAlteradas', this.atualizarVantagensDesvantagens);
        document.removeEventListener('periciasAlteradas', this.processarPericiasAlteradas);
        document.removeEventListener('magiasAlteradas', this.processarMagiasAlteradas);
        document.removeEventListener('tecnicasAlteradas', this.processarTecnicasAlteradas);
        document.removeEventListener('peculiaridadesAlteradas', this.processarPeculiaridadesAlteradas);
    }
}

// Inicialização global da dashboard
(function() {
    let dashboardManagerInstance = null;
    
    function inicializarDashboard() {
        const dashboardTab = document.getElementById('dashboard');
        if (!dashboardTab) {
            setTimeout(inicializarDashboard, 100);
            return;
        }
        
        if (!dashboardManagerInstance) {
            dashboardManagerInstance = new DashboardManager();
            dashboardManagerInstance.inicializar();
        }
        
        dashboardManagerInstance.atualizarDisplayCompleto();
    }
    
    function verificarAbaAtiva() {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            if (!dashboardManagerInstance) {
                dashboardManagerInstance = new DashboardManager();
                dashboardManagerInstance.inicializar();
            } else {
                dashboardManagerInstance.atualizarDisplayCompleto();
                dashboardManagerInstance.forcarAtualizacaoInicial();
            }
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            inicializarDashboard();
            
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.target.id === 'dashboard' && mutation.attributeName === 'class') {
                        verificarAbaAtiva();
                    }
                });
            });
            
            const dashboardTab = document.getElementById('dashboard');
            if (dashboardTab) {
                observer.observe(dashboardTab, { 
                    attributes: true, 
                    attributeFilter: ['class'] 
                });
            }
            
            window.addEventListener('beforeunload', function() {
                if (dashboardManagerInstance) {
                    dashboardManagerInstance.destruir();
                }
            });
        }, 300);
    });
    
    window.DashboardManager = DashboardManager;
    window.dashboardManager = null;
    
    Object.defineProperty(window, 'dashboardManager', {
        get: function() {
            if (!dashboardManagerInstance) {
                dashboardManagerInstance = new DashboardManager();
                dashboardManagerInstance.inicializar();
            }
            return dashboardManagerInstance;
        },
        set: function(value) {
            dashboardManagerInstance = value;
        }
    });
})();

// Exportar funções globais
window.ajustarPV = function(valor) {
    if (window.dashboardManager) {
        window.dashboardManager.ajustarPV(valor);
    } else {
        const dashboardManager = new DashboardManager();
        dashboardManager.inicializar();
        dashboardManager.ajustarPV(valor);
    }
};

window.ajustarPF = function(valor) {
    if (window.dashboardManager) {
        window.dashboardManager.ajustarPF(valor);
    } else {
        const dashboardManager = new DashboardManager();
        dashboardManager.inicializar();
        dashboardManager.ajustarPF(valor);
    }
};

window.atualizarDashboardCompleta = function() {
    if (window.dashboardManager) {
        window.dashboardManager.atualizarDisplayCompleto();
        window.dashboardManager.forcarAtualizacaoInicial();
    } else {
        const dashboardManager = new DashboardManager();
        dashboardManager.inicializar();
        dashboardManager.atualizarDisplayCompleto();
        dashboardManager.forcarAtualizacaoInicial();
    }
};

window.carregarDadosDashboard = function(dados) {
    if (window.dashboardManager) {
        window.dashboardManager.carregarDados(dados);
    } else {
        const dashboardManager = new DashboardManager();
        dashboardManager.inicializar();
        dashboardManager.carregarDados(dados);
    }
};

window.obterDadosDashboard = function() {
    if (window.dashboardManager) {
        return window.dashboardManager.coletarDadosParaSalvar();
    } else {
        const dashboardManager = new DashboardManager();
        dashboardManager.inicializar();
        return dashboardManager.coletarDadosParaSalvar();
    }
};

// Disparar evento quando a dashboard estiver pronta
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const evento = new CustomEvent('dashboardPronta', {
            detail: { 
                carregada: true, 
                timestamp: new Date().toISOString(),
                versao: '1.0.0'
            }
        });
        document.dispatchEvent(evento);
    }, 500);
});