// ===========================================
// DASHBOARD MANAGER - VERSÃO COMPLETA E FUNCIONAL
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
        this.ultimaAtualizacaoAtributos = 0;
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

    // MÉTODO CRÍTICO: Cálculo automático dos pontos gastos com atributos
    calcularPontosAtributos() {
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;
        
        const custoST = (st - 10) * 10;
        const custoDX = (dx - 10) * 20;
        const custoIQ = (iq - 10) * 20;
        const custoHT = (ht - 10) * 10;
        
        const totalGastos = custoST + custoDX + custoIQ + custoHT;
        
        // Atualizar o estado
        if (this.estado.pontos.gastosAtributos !== totalGastos) {
            this.estado.pontos.gastosAtributos = totalGastos;
            return true; // Houve mudança
        }
        
        return false; // Não houve mudança
    }

    // MÉTODO CRÍTICO: Atualizar atributos derivados (PV, PF, etc)
    atualizarAtributosDerivados() {
        // Coletar valores dos elementos na aba de atributos
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;
        
        // Coletar valores totais calculados pelo atributos.js
        const pvElement = document.getElementById('PVTotal');
        const pfElement = document.getElementById('PFTotal');
        const vontadeElement = document.getElementById('VontadeTotal');
        const percepcaoElement = document.getElementById('PercepcaoTotal');
        const deslocamentoElement = document.getElementById('DeslocamentoTotal');
        
        // Atualizar estado
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        
        if (pvElement) {
            const pvTotal = parseInt(pvElement.textContent) || st;
            this.estado.atributos.PV.max = pvTotal;
            if (this.estado.atributos.PV.atual > pvTotal) {
                this.estado.atributos.PV.atual = pvTotal;
            }
        }
        
        if (pfElement) {
            const pfTotal = parseInt(pfElement.textContent) || ht;
            this.estado.atributos.PF.max = pfTotal;
            if (this.estado.atributos.PF.atual > pfTotal) {
                this.estado.atributos.PF.atual = pfTotal;
            }
        }
        
        if (vontadeElement) {
            this.estado.atributos.Vontade = parseInt(vontadeElement.textContent) || iq;
        }
        
        if (percepcaoElement) {
            this.estado.atributos.Percepcao = parseInt(percepcaoElement.textContent) || iq;
        }
        
        if (deslocamentoElement) {
            this.estado.atributos.Deslocamento = parseFloat(deslocamentoElement.textContent) || 5.00;
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
        // Monitorar inputs de atributos diretamente
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('change', () => this.verificarAtualizacaoAtributos());
                input.addEventListener('input', () => this.verificarAtualizacaoAtributos());
            }
        });

        // Monitorar elementos derivados
        ['PVTotal', 'PFTotal', 'VontadeTotal', 'PercepcaoTotal', 'DeslocamentoTotal'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                const observer = new MutationObserver(() => {
                    this.atualizarAtributosDerivados();
                });
                observer.observe(elemento, { 
                    childList: true, 
                    characterData: true, 
                    subtree: true 
                });
            }
        });
    }

    configurarEventosExternos() {
        // Eventos para quando outras abas forem implementadas
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

        // Calcular pontos de atributos inicialmente
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
            this.coletarDadosAbasExternas();
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

        setTimeout(() => {
            this.calcularPontosAtributos();
            this.atualizarAtributosDerivados();
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        }, 1000);
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
            this.verificarAtualizacaoAtributos();
        }
    }

    verificarAtualizacaoAtributos() {
        const agora = Date.now();
        
        // Evitar atualizações muito rápidas (debounce)
        if (agora - this.ultimaAtualizacaoAtributos < 100) {
            return;
        }
        
        this.ultimaAtualizacaoAtributos = agora;
        
        // Calcular pontos de atributos
        const atributosMudaram = this.calcularPontosAtributos();
        
        // Atualizar atributos derivados
        this.atualizarAtributosDerivados();
        
        // Se os pontos de atributos mudaram, recalcular tudo
        if (atributosMudaram) {
            this.recalcularSaldoCompleto();
            this.atualizarDisplayCompleto();
        }
    }

    coletarDadosAbasExternas() {
        // Esta função monitora elementos de outras abas (quando implementadas)
        // Por enquanto, apenas monitora atributos que já estão sendo gerenciados
        
        // Coletar pontos de vantagens/desvantagens (quando existirem)
        const vantagensElement = document.getElementById('total-vantagens');
        if (vantagensElement) {
            const texto = vantagensElement.textContent || '';
            const match = texto.match(/[+-]?\d+/);
            const valor = match ? parseInt(match[0]) : 0;

            if (valor >= 0) {
                if (this.estado.pontos.gastosVantagens !== valor) {
                    this.estado.pontos.gastosVantagens = valor;
                    this.estado.pontos.gastosDesvantagens = 0;
                    this.recalcularSaldoCompleto();
                    this.atualizarDisplayCompleto();
                }
            } else {
                if (this.estado.pontos.gastosDesvantagens !== Math.abs(valor)) {
                    this.estado.pontos.gastosVantagens = 0;
                    this.estado.pontos.gastosDesvantagens = Math.abs(valor);
                    this.recalcularSaldoCompleto();
                    this.atualizarDisplayCompleto();
                }
            }
        }
    }

    verificarAtualizacoesPendentes() {
        // Verificar se todos os elementos necessários estão presentes
        const elementosEssenciais = [
            'atributoST', 'atributoDX', 'atributoIQ', 'atributoHT',
            'valorPV', 'valorPF', 'saldoDisponivel', 'gastosAtributos',
            'totalLiquido'
        ];

        let algumFaltando = false;
        elementosEssenciais.forEach(id => {
            if (!document.getElementById(id)) {
                algumFaltando = true;
            }
        });

        if (algumFaltando) {
            this.atualizarDisplayCompleto();
        }
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
        
        // Pontos gastos em atributos, vantagens, perícias, etc
        const gastosPositivos = 
            this.estado.pontos.gastosAtributos + 
            this.estado.pontos.gastosVantagens + 
            this.estado.pontos.gastosPericias + 
            this.estado.pontos.gastosMagias +
            this.estado.pontos.gastosTecnicas +
            this.estado.pontos.gastosPeculiaridades;
        
        // Pontos ganhos com desvantagens (valor negativo)
        const pontosDesvantagens = this.estado.pontos.gastosDesvantagens;
        
        // Cálculo do saldo: Total - Gastos + Pontos de Desvantagens
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
        
        this.atualizarElemento('saldoDisponivel', saldoDisponivel);
        this.atualizarElemento('desvantagensAtuais', gastosDesvantagens);
        
        const saldoElement = document.getElementById('saldoDisponivel');
        if (saldoElement) {
            if (saldoDisponivel < 0) {
                saldoElement.style.color = '#e74c3c';
                saldoElement.style.fontWeight = 'bold';
            } else if (saldoDisponivel < 30) {
                saldoElement.style.color = '#f39c12';
                saldoElement.style.fontWeight = 'bold';
            } else if (saldoDisponivel < 50) {
                saldoElement.style.color = '#f1c40f';
                saldoElement.style.fontWeight = 'normal';
            } else {
                saldoElement.style.color = '#27ae60';
                saldoElement.style.fontWeight = 'normal';
            }
        }
        
        const desvElement = document.getElementById('desvantagensAtuais');
        if (desvElement) {
            const excedeLimite = Math.abs(gastosDesvantagens) > Math.abs(limiteDesvantagens);
            const pertoLimite = Math.abs(gastosDesvantagens) > Math.abs(limiteDesvantagens) * 0.8;
            
            if (excedeLimite) {
                desvElement.style.color = '#e74c3c';
                desvElement.style.fontWeight = 'bold';
            } else if (pertoLimite) {
                desvElement.style.color = '#f39c12';
                desvElement.style.fontWeight = 'bold';
            } else {
                desvElement.style.color = '#9b59b6';
                desvElement.style.fontWeight = 'normal';
            }
        }
    }

    atualizarDisplayFinanceiro() {
        const saldoPersonagemElement = document.getElementById('saldoPersonagem');
        if (saldoPersonagemElement) {
            saldoPersonagemElement.textContent = this.estado.financeiro.saldo;
        }
    }

    atualizarDisplayResumo() {
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        const gastosVantagens = this.estado.pontos.gastosVantagens;
        const gastosDesvantagens = this.estado.pontos.gastosDesvantagens;
        const saldoDisponivel = this.estado.pontos.saldoDisponivel;
        
        this.atualizarElemento('gastosAtributos', gastosAtributos);
        this.atualizarElemento('gastosVantagens', gastosVantagens);
        this.atualizarElemento('gastosDesvantagens', gastosDesvantagens);
        this.atualizarElemento('totalLiquido', saldoDisponivel);
        
        // Aplicar estilos de cores
        const cardsResumo = [
            { id: 'gastosAtributos', valor: gastosAtributos },
            { id: 'gastosVantagens', valor: gastosVantagens },
            { id: 'gastosDesvantagens', valor: gastosDesvantagens },
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
    }

    ajustarPF(valor) {
        const novoPF = this.estado.atributos.PF.atual + valor;
        this.estado.atributos.PF.atual = Math.max(0, Math.min(novoPF, this.estado.atributos.PF.max));
        this.atualizarDisplayAtributos();
    }

    coletarDadosParaSalvar() {
        return {
            identificacao: this.estado.identificacao,
            pontos: this.estado.pontos,
            atributos: this.estado.atributos,
            financeiro: this.estado.financeiro,
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
        
        if (dados.atributos) {
            this.estado.atributos = { ...this.estado.atributos, ...dados.atributos };
            this.ultimosAtributos = {
                ST: this.estado.atributos.ST,
                DX: this.estado.atributos.DX,
                IQ: this.estado.atributos.IQ,
                HT: this.estado.atributos.HT
            };
        }
        
        if (dados.financeiro) {
            this.estado.financeiro = { ...this.estado.financeiro, ...dados.financeiro };
            this.atualizarElemento('nivelRiqueza', this.estado.financeiro.riqueza);
            this.atualizarElemento('nivelAparencia', this.estado.financeiro.aparencia);
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
        this.monitorAtivo = false;
    }
}

// Inicialização automática
(function() {
    let dashboardManagerInstance = null;
    
    function inicializarDashboard() {
        if (!dashboardManagerInstance) {
            dashboardManagerInstance = new DashboardManager();
            dashboardManagerInstance.inicializar();
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            inicializarDashboard();
        }, 300);
    });
    
    window.DashboardManager = DashboardManager;
    window.dashboardManager = {
        getInstance: function() {
            if (!dashboardManagerInstance) {
                dashboardManagerInstance = new DashboardManager();
                dashboardManagerInstance.inicializar();
            }
            return dashboardManagerInstance;
        }
    };
})();

// Funções globais
window.ajustarPV = function(valor) {
    const dashboard = window.dashboardManager.getInstance();
    dashboard.ajustarPV(valor);
};

window.ajustarPF = function(valor) {
    const dashboard = window.dashboardManager.getInstance();
    dashboard.ajustarPF(valor);
};

window.atualizarDashboardCompleta = function() {
    const dashboard = window.dashboardManager.getInstance();
    dashboard.atualizarDisplayCompleto();
};

window.carregarDadosDashboard = function(dados) {
    const dashboard = window.dashboardManager.getInstance();
    dashboard.carregarDados(dados);
};

window.obterDadosDashboard = function() {
    const dashboard = window.dashboardManager.getInstance();
    return dashboard.coletarDadosParaSalvar();
};