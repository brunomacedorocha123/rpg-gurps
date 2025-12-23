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
                // NOVO: Pontos de Características
                gastosCaracteristicas: 0,
                saldoDisponivel: 150,
                limiteDesvantagens: -50,
                pontosGastosTotal: 0
            },
            caracteristicas: {
                // NOVO: Para armazenar pontos de características
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
            foto: null,
            userId: null,
            characterId: null
        };
        
        this.fotoTemporaria = null;
        this.monitorAtivo = false;
        this.intervaloMonitor = null;
        this.ultimosAtributos = { ST: 10, DX: 10, IQ: 10, HT: 10 };
        this.ultimaAtualizacaoAtributos = 0;
        
        // NOVO: Cache dos pontos de características
        this.pontosCaracteristicasCache = {
            aparência: 0,
            riqueza: 0,
            idiomas: 0,
            fisicas: 0,
            total: 0
        };
        
        // NOVO: Controle de salvamento automático
        this.autoSaveTimeout = null;
        this.autoSaveEnabled = true;
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
        
        // NOVO: Configurar monitoramento de características
        this.configurarMonitorCaracteristicas();
        
        return this;
    }

    // MÉTODO CRÍTICO: Cálculo automático dos pontos gastos com atributos
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
        
        // Atualizar o estado
        if (this.estado.pontos.gastosAtributos !== totalGastos) {
            this.estado.pontos.gastosAtributos = totalGastos;
            return true; // Houve mudança
        }
        
        return false; // Não houve mudança
    }

    // MÉTODO AUXILIAR: Obter valor de elemento com segurança
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

    // MÉTODO CRÍTICO: Atualizar atributos derivados (PV, PF, etc)
    atualizarAtributosDerivados() {
        // Coletar valores dos elementos na aba de atributos
        const st = this.obterValorElemento('ST', 10);
        const dx = this.obterValorElemento('DX', 10);
        const iq = this.obterValorElemento('IQ', 10);
        const ht = this.obterValorElemento('HT', 10);
        
        // Atualizar estado
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        
        // Tentar obter valores totais se existirem
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
        
        // Deslocamento - precisa de cálculo especial
        const deslocamentoElement = document.getElementById('DeslocamentoTotal');
        if (deslocamentoElement) {
            this.estado.atributos.Deslocamento = parseFloat(deslocamentoElement.textContent) || 5.00;
        } else {
            // Calcular manualmente se elemento não existe
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
        // Monitorar inputs de atributos diretamente
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('change', () => this.verificarAtualizacaoAtributos());
                input.addEventListener('input', () => this.verificarAtualizacaoAtributos());
            }
        });
    }

    // ===========================================
    // NOVO MÉTODO: Configurar monitoramento de características
    // ===========================================
    configurarMonitorCaracteristicas() {
        console.log('Configurando monitor de características...');
        
        // 1. ESCUTAR EVENTOS DA APARÊNCIA
        document.addEventListener('pontosAparenciaAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('🎭 Evento aparência recebido:', e.detail.pontos);
                this.atualizarPontosCaracteristicas('aparência', e.detail.pontos);
            }
        });

        // 2. ESCUTAR EVENTOS DA RIQUEZA
        document.addEventListener('pontosRiquezaAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('💰 Evento riqueza recebido:', e.detail.pontos);
                this.atualizarPontosCaracteristicas('riqueza', e.detail.pontos);
            }
        });

        // 3. ESCUTAR EVENTOS DE IDIOMAS
        document.addEventListener('pontosIdiomasAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('🌐 Evento idiomas recebido:', e.detail.pontos);
                this.atualizarPontosCaracteristicas('idiomas', e.detail.pontos);
            }
        });

        // 4. ESCUTAR EVENTOS DE CARACTERÍSTICAS FÍSICAS
        document.addEventListener('pontosFisicasAtualizados', (e) => {
            if (e.detail && typeof e.detail.pontos === 'number') {
                console.log('💪 Evento físicas recebido:', e.detail.pontos);
                this.atualizarPontosCaracteristicas('fisicas', e.detail.pontos);
            }
        });
    }

    // ===========================================
    // NOVO MÉTODO: Atualizar pontos de características específicas
    // ===========================================
    atualizarPontosCaracteristicas(tipo, pontos) {
        console.log(`📊 Atualizando ${tipo}: ${pontos} pontos`);
        
        // Atualizar cache
        this.pontosCaracteristicasCache[tipo] = pontos;
        
        // Recalcular total de características
        const totalCaracteristicas = 
            this.pontosCaracteristicasCache.aparência +
            this.pontosCaracteristicasCache.riqueza +
            this.pontosCaracteristicasCache.idiomas +
            this.pontosCaracteristicasCache.fisicas;
        
        // Atualizar estado
        this.estado.caracteristicas[tipo] = pontos;
        this.estado.pontos.gastosCaracteristicas = totalCaracteristicas;
        
        console.log(`📊 Total características: ${totalCaracteristicas}`);
        
        // Recalcular saldo completo
        this.recalcularSaldoCompleto();
        
        // Atualizar displays
        this.atualizarDisplayPontos();
        this.atualizarDisplayResumo();
        this.atualizarDisplayDistribuicao();
        
        // Atualizar UI da aba de características
        this.atualizarUICaracteristicas();
        
        // Salvar automaticamente
        this.salvarAuto();
        
        // Disparar evento para UI de características
        this.dispararEventoCaracteristicas();
    }

    // ===========================================
    // NOVO MÉTODO: Atualizar UI da aba de características
    // ===========================================
    atualizarUICaracteristicas() {
        // Atualizar totais nas abas de características
        const totalCaracteristicas = this.estado.pontos.gastosCaracteristicas;
        
        // Elemento totalCaracteristicas na aba de características
        const elTotal = document.getElementById('totalCaracteristicas');
        if (elTotal) {
            elTotal.textContent = totalCaracteristicas >= 0 ? 
                `+${totalCaracteristicas} pts` : `${totalCaracteristicas} pts`;
        }
        
        // Atualizar cada seção individualmente
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
        
        // Atualizar total da seção 1 (Aparência + Riqueza)
        const secao1 = pontosAparencia + pontosRiqueza;
        const elSecao1 = document.getElementById('totalSecao1');
        if (elSecao1) {
            elSecao1.textContent = secao1 >= 0 ? `+${secao1} pts` : `${secao1} pts`;
        }
        
        // Atualizar badges individuais
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

    // ===========================================
    // NOVO MÉTODO: Disparar evento para UI de características
    // ===========================================
    dispararEventoCaracteristicas() {
        const evento = new CustomEvent('dashboardCaracteristicasAtualizadas', {
            detail: {
                totalCaracteristicas: this.estado.pontos.gastosCaracteristicas,
                saldoDisponivel: this.estado.pontos.saldoDisponivel,
                aparência: this.estado.caracteristicas.aparência,
                riqueza: this.estado.caracteristicas.riqueza,
                idiomas: this.estado.caracteristicas.idiomas,
                fisicas: this.estado.caracteristicas.fisicas
            }
        });
        document.dispatchEvent(evento);
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
            this.salvarAuto();
        }
    }

    verificarAtualizacoesPendentes() {
        // Verificar se há mudanças nas características que não foram capturadas
        // Pode ser usado para integração futura
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

    // ===========================================
    // MÉTODO CRÍTICO: Recalcular saldo considerando TUDO
    // ===========================================
    recalcularSaldoCompleto() {
        const total = this.estado.pontos.total;
        
        // TODOS os gastos positivos (atributos, vantagens, características, etc.)
        const gastosPositivos = 
            this.estado.pontos.gastosAtributos + 
            this.estado.pontos.gastosVantagens + 
            this.estado.pontos.gastosPericias + 
            this.estado.pontos.gastosMagias +
            this.estado.pontos.gastosTecnicas +
            this.estado.pontos.gastosPeculiaridades +
            this.estado.pontos.gastosCaracteristicas; // CARACTERÍSTICAS AQUI!
        
        // Pontos ganhos com desvantagens (valor negativo)
        const pontosDesvantagens = this.estado.pontos.gastosDesvantagens;
        
        // CÁLCULO FINAL DO SALDO:
        // Saldo = Total - Gastos Positivos + Pontos de Desvantagens
        const saldoDisponivel = total - gastosPositivos + pontosDesvantagens;
        
        // Atualizar estado
        this.estado.pontos.saldoDisponivel = saldoDisponivel;
        this.estado.pontos.pontosGastosTotal = gastosPositivos - pontosDesvantagens;
        
        console.log(`📊 Recálculo saldo:
          Total: ${total}
          Gastos Positivos: ${gastosPositivos}
          Desvantagens: ${pontosDesvantagens}
          Saldo Final: ${saldoDisponivel}
          Características: ${this.estado.pontos.gastosCaracteristicas}`);
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
        
        // NOVO: Atualizar o elemento de pontos totais se existir
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
        
        // NOVO: Adicionar gastos de características se houver elemento
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

    // ===========================================
    // NOVO MÉTODO: Salvar automaticamente
    // ===========================================
    salvarAuto() {
        if (!this.autoSaveEnabled) return;
        
        // Salvar no localStorage imediatamente
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
            console.warn('Não foi possível salvar no localStorage:', e);
        }
        
        // Salvar no Firebase com debounce (a cada 5 segundos no máximo)
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        this.autoSaveTimeout = setTimeout(() => {
            this.salvarNoFirebase();
            this.autoSaveTimeout = null;
        }, 2000);
    }

    // ===========================================
    // MÉTODO: Salvar no Firebase
    // ===========================================
    async salvarNoFirebase() {
        try {
            const auth = firebase.auth();
            const user = auth.currentUser;
            
            if (!user) {
                console.log('Usuário não autenticado. Salvando apenas localmente.');
                return;
            }
            
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
                console.log('Dashboard atualizado no Firebase');
            }
            
        } catch (error) {
            console.error('Erro ao salvar no Firebase:', error);
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
            
            // Expor no escopo global
            window.dashboardManager = dashboardManagerInstance;
            
            console.log('✅ Dashboard Manager inicializado com sucesso!');
            
            // Forçar uma atualização inicial
            setTimeout(() => {
                dashboardManagerInstance.recalcularSaldoCompleto();
                dashboardManagerInstance.atualizarDisplayCompleto();
            }, 1000);
        }
    }
    
    // Inicializar quando a página carregar
    document.addEventListener('DOMContentLoaded', function() {
        // Aguardar um pouco para garantir que tudo esteja carregado
        setTimeout(() => {
            inicializarDashboard();
        }, 500);
    });
    
    // Exportar para uso global
    window.DashboardManager = DashboardManager;
    
    // Funções de utilidade global
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