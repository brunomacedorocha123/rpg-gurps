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
                limiteDesvantagens: -50
            },
            atributos: {
                ST: 10,
                DX: 10,
                IQ: 10,
                HT: 10,
                PV: { atual: 10, max: 10 },
                PF: { atual: 10, max: 10 }
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
            }
        };
        
        this.fotoTemporaria = null;
        this.monitorAtivo = false;
    }

    inicializar() {
        this.configurarSistemaFoto();
        this.configurarEventosDashboard();
        this.configurarMonitorAtributos();
        this.carregarValoresIniciais();
        this.iniciarMonitoramento();
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
                        dataUrl: e.target.result
                    };
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
            });
        }
    }

    configurarEventosDashboard() {
        // Eventos para inputs da dashboard
        const inputsDashboard = [
            'dashboardRaca', 'dashboardClasse', 'dashboardNivel', 
            'dashboardDescricao', 'pontosTotais', 'limiteDesvantagens',
            'nivelAparencia', 'nivelRiqueza'
        ];

        inputsDashboard.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', () => this.processarInputDashboard(id, elemento.value));
                elemento.addEventListener('change', () => this.processarInputDashboard(id, elemento.value));
            }
        });

        // Contador de caracteres para descrição
        const textareaDescricao = document.getElementById('dashboardDescricao');
        if (textareaDescricao) {
            textareaDescricao.addEventListener('input', () => {
                const contador = document.getElementById('contadorDescricao');
                if (contador) {
                    contador.textContent = textareaDescricao.value.length;
                }
                this.estado.identificacao.descricao = textareaDescricao.value;
            });
        }

        // Evento para pontos totais (atualizar saldo imediatamente)
        const pontosTotaisInput = document.getElementById('pontosTotais');
        if (pontosTotaisInput) {
            pontosTotaisInput.addEventListener('input', () => {
                this.estado.pontos.total = parseInt(pontosTotaisInput.value) || 150;
                this.recalcularSaldo();
                this.atualizarDisplayPontos();
            });
        }

        // Evento para limite de desvantagens
        const limiteDesvantagensInput = document.getElementById('limiteDesvantagens');
        if (limiteDesvantagensInput) {
            limiteDesvantagensInput.addEventListener('input', () => {
                this.estado.pontos.limiteDesvantagens = parseInt(limiteDesvantagensInput.value) || -50;
                this.atualizarDisplayPontos();
            });
        }
    }

    configurarMonitorAtributos() {
        // Escutar evento de atributos alterados (da aba atributos)
        document.addEventListener('atributosAlterados', (e) => {
            if (e.detail) {
                this.atualizarAtributosDoEvento(e.detail);
            }
        });

        // Monitorar alterações diretas nos atributos (backup)
        const atributosIds = ['ST', 'DX', 'IQ', 'HT'];
        atributosIds.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.atualizarAtributosDiretamente());
            }
        });
    }

    carregarValoresIniciais() {
        // Carregar valores iniciais dos inputs
        this.estado.identificacao.raca = document.getElementById('dashboardRaca')?.value || '';
        this.estado.identificacao.classe = document.getElementById('dashboardClasse')?.value || '';
        this.estado.identificacao.nivel = document.getElementById('dashboardNivel')?.value || '';
        this.estado.identificacao.descricao = document.getElementById('dashboardDescricao')?.value || '';
        
        // Carregar valores iniciais dos pontos
        this.estado.pontos.total = parseInt(document.getElementById('pontosTotais')?.value) || 150;
        this.estado.pontos.limiteDesvantagens = parseInt(document.getElementById('limiteDesvantagens')?.value) || -50;
        
        // Carregar valores financeiros iniciais
        this.atualizarFinanceiro();
        
        // Carregar atributos iniciais
        this.atualizarAtributosDiretamente();
        
        // Atualizar contador de descrição
        this.atualizarContadorDescricao();
        
        // Atualizar display completo
        this.atualizarDisplayCompleto();
    }

    iniciarMonitoramento() {
        // Iniciar monitoramento ativo de outras abas
        this.monitorAtivo = true;
        
        setInterval(() => {
            if (this.monitorAtivo) {
                this.coletarDadosOutrasAbas();
            }
        }, 1000);
    }

    processarInputDashboard(id, valor) {
        switch(id) {
            case 'dashboardRaca':
                this.estado.identificacao.raca = valor;
                break;
            case 'dashboardClasse':
                this.estado.identificacao.classe = valor;
                break;
            case 'dashboardNivel':
                this.estado.identificacao.nivel = valor;
                break;
            case 'dashboardDescricao':
                this.estado.identificacao.descricao = valor;
                break;
            case 'pontosTotais':
                this.estado.pontos.total = parseInt(valor) || 150;
                this.recalcularSaldo();
                this.atualizarDisplayPontos();
                break;
            case 'limiteDesvantagens':
                this.estado.pontos.limiteDesvantagens = parseInt(valor) || -50;
                this.atualizarDisplayPontos();
                break;
            case 'nivelAparencia':
                this.estado.financeiro.aparencia = valor;
                this.atualizarDisplayFinanceiro();
                break;
            case 'nivelRiqueza':
                this.estado.financeiro.riqueza = valor;
                this.calcularRenda();
                this.atualizarDisplayFinanceiro();
                break;
        }
    }

    atualizarAtributosDoEvento(detalhes) {
        if (!detalhes) return;
        
        // Atualizar atributos principais
        this.estado.atributos.ST = detalhes.ST || 10;
        this.estado.atributos.DX = detalhes.DX || 10;
        this.estado.atributos.IQ = detalhes.IQ || 10;
        this.estado.atributos.HT = detalhes.HT || 10;
        
        // Atualizar PV e PF
        this.estado.atributos.PV.max = detalhes.PV || this.estado.atributos.ST;
        this.estado.atributos.PF.max = detalhes.PF || this.estado.atributos.HT;
        
        // Ajustar valores atuais se necessário
        if (this.estado.atributos.PV.atual > this.estado.atributos.PV.max) {
            this.estado.atributos.PV.atual = this.estado.atributos.PV.max;
        }
        if (this.estado.atributos.PF.atual > this.estado.atributos.PF.max) {
            this.estado.atributos.PF.atual = this.estado.atributos.PF.max;
        }
        
        // Atualizar pontos gastos em atributos
        if (detalhes.pontosGastos !== undefined) {
            this.estado.pontos.gastosAtributos = detalhes.pontosGastos;
        } else {
            // Calcular pontos gastos manualmente
            const custoST = (this.estado.atributos.ST - 10) * 10;
            const custoDX = (this.estado.atributos.DX - 10) * 20;
            const custoIQ = (this.estado.atributos.IQ - 10) * 20;
            const custoHT = (this.estado.atributos.HT - 10) * 10;
            this.estado.pontos.gastosAtributos = custoST + custoDX + custoIQ + custoHT;
        }
        
        // Recalcular saldo e atualizar display
        this.recalcularSaldo();
        this.atualizarDisplayCompleto();
    }

    atualizarAtributosDiretamente() {
        // Buscar valores diretamente dos inputs da aba atributos
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;
        
        // Buscar PV e PF totais (se disponíveis)
        const pvElement = document.getElementById('PVTotal');
        const pfElement = document.getElementById('PFTotal');
        const pvTotal = pvElement ? parseInt(pvElement.textContent) || st : st;
        const pfTotal = pfElement ? parseInt(pfElement.textContent) || ht : ht;
        
        // Buscar pontos gastos em atributos
        const pontosGastosElement = document.getElementById('pontosGastos');
        const pontosGastos = pontosGastosElement ? parseInt(pontosGastosElement.textContent) || 0 : 0;
        
        // Atualizar estado
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        this.estado.atributos.PV.max = pvTotal;
        this.estado.atributos.PF.max = pfTotal;
        
        // Ajustar valores atuais se necessário
        if (this.estado.atributos.PV.atual > pvTotal) {
            this.estado.atributos.PV.atual = pvTotal;
        }
        if (this.estado.atributos.PF.atual > pfTotal) {
            this.estado.atributos.PF.atual = pfTotal;
        }
        
        // Atualizar pontos gastos
        this.estado.pontos.gastosAtributos = pontosGastos;
        
        // Recalcular e atualizar
        this.recalcularSaldo();
        this.atualizarDisplayCompleto();
    }

    coletarDadosOutrasAbas() {
        // Coletar dados de outras abas periodicamente
        
        // Coletar vantagens/desvantagens
        const vantagensElement = document.getElementById('total-vantagens');
        if (vantagensElement) {
            const texto = vantagensElement.textContent || '';
            const match = texto.match(/[+-]?\d+/);
            const total = match ? parseInt(match[0]) : 0;
            
            if (total >= 0) {
                this.estado.pontos.gastosVantagens = total;
                this.estado.pontos.gastosDesvantagens = 0;
            } else {
                this.estado.pontos.gastosVantagens = 0;
                this.estado.pontos.gastosDesvantagens = Math.abs(total);
            }
        }
        
        // Coletar perícias
        const periciasElement = document.getElementById('pontos-pericias-total');
        if (periciasElement) {
            const texto = periciasElement.textContent || '';
            const match = texto.match(/\d+/);
            this.estado.pontos.gastosPericias = match ? parseInt(match[0]) : 0;
        }
        
        // Coletar magias
        const magiasElement = document.getElementById('total-gasto-magia');
        if (magiasElement) {
            const texto = magiasElement.textContent || '';
            const match = texto.match(/\d+/);
            this.estado.pontos.gastosMagias = match ? parseInt(match[0]) : 0;
        }
        
        // Coletar técnicas (se existir)
        const tecnicasElement = document.getElementById('total-tecnicas');
        if (tecnicasElement) {
            const texto = tecnicasElement.textContent || '';
            const match = texto.match(/\d+/);
            this.estado.pontos.gastosTecnicas = match ? parseInt(match[0]) : 0;
        }
        
        // Coletar peculiaridades (se existir)
        const peculiaridadesElement = document.getElementById('total-peculiaridades');
        if (peculiaridadesElement) {
            const texto = peculiaridadesElement.textContent || '';
            const match = texto.match(/\d+/);
            this.estado.pontos.gastosPeculiaridades = match ? parseInt(match[0]) : 0;
        }
        
        // Recalcular saldo
        this.recalcularSaldo();
        
        // Atualizar display
        this.atualizarDisplayCompleto();
    }

    atualizarFinanceiro() {
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        const nivelAparencia = document.getElementById('nivelAparencia');
        
        if (nivelRiqueza) {
            const texto = nivelRiqueza.options[nivelRiqueza.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            this.estado.financeiro.riqueza = nome;
            this.calcularRenda();
        }
        
        if (nivelAparencia) {
            const texto = nivelAparencia.options[nivelAparencia.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            this.estado.financeiro.aparencia = nome;
        }
    }

    calcularRenda() {
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        if (!nivelRiqueza) return;
        
        const valor = parseInt(nivelRiqueza.value) || 0;
        const rendaBase = 1000;
        const multiplicadores = {
            '-25': 0, '-15': 0.2, '-10': 0.5, '0': 1,
            '10': 2, '20': 5, '30': 20, '50': 100
        };
        
        const multiplicador = multiplicadores[valor.toString()] || 1;
        const renda = Math.floor(rendaBase * multiplicador);
        this.estado.financeiro.saldo = `$${renda.toLocaleString('en-US')}`;
    }

    recalcularSaldo() {
        const total = this.estado.pontos.total;
        
        // Somar todos os gastos positivos
        const gastosPositivos = 
            this.estado.pontos.gastosAtributos + 
            this.estado.pontos.gastosVantagens + 
            this.estado.pontos.gastosPericias + 
            this.estado.pontos.gastosMagias +
            this.estado.pontos.gastosTecnicas +
            this.estado.pontos.gastosPeculiaridades;
        
        // Adicionar pontos das desvantagens (são pontos ganhos)
        const pontosDesvantagens = this.estado.pontos.gastosDesvantagens;
        
        // Calcular saldo: Total - Gastos + Desvantagens
        const saldoDisponivel = total - gastosPositivos + pontosDesvantagens;
        
        this.estado.pontos.saldoDisponivel = saldoDisponivel;
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
        
        // Atualizar atributos
        this.atualizarElemento('atributoST', ST);
        this.atualizarElemento('atributoDX', DX);
        this.atualizarElemento('atributoIQ', IQ);
        this.atualizarElemento('atributoHT', HT);
        
        // Atualizar PV e PF
        this.atualizarElemento('valorPV', `${PV.atual}/${PV.max}`);
        this.atualizarElemento('valorPF', `${PF.atual}/${PF.max}`);
        
        // Atualizar barras de progresso
        this.atualizarBarra('barraPV', (PV.atual / PV.max) * 100);
        this.atualizarBarra('barraPF', (PF.atual / PF.max) * 100);
    }

    atualizarDisplayPontos() {
        const total = this.estado.pontos.total;
        const saldoDisponivel = this.estado.pontos.saldoDisponivel;
        const gastosDesvantagens = this.estado.pontos.gastosDesvantagens;
        const limiteDesvantagens = this.estado.pontos.limiteDesvantagens;
        
        // Atualizar valores
        this.atualizarElemento('saldoDisponivel', saldoDisponivel);
        this.atualizarElemento('desvantagensAtuais', gastosDesvantagens);
        
        // Atualizar cores
        const saldoElement = document.getElementById('saldoDisponivel');
        if (saldoElement) {
            saldoElement.style.color = saldoDisponivel < 0 ? '#e74c3c' :
                                      saldoDisponivel < 50 ? '#f39c12' : '#27ae60';
        }
        
        const desvElement = document.getElementById('desvantagensAtuais');
        if (desvElement) {
            const excedeLimite = Math.abs(gastosDesvantagens) > Math.abs(limiteDesvantagens);
            desvElement.style.color = excedeLimite ? '#e74c3c' : '#9b59b6';
        }
    }

    atualizarDisplayFinanceiro() {
        this.atualizarElemento('nivelRiqueza', this.estado.financeiro.riqueza);
        this.atualizarElemento('saldoPersonagem', this.estado.financeiro.saldo);
        this.atualizarElemento('nivelAparencia', this.estado.financeiro.aparencia);
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
        
        // Atualizar todos os cards do resumo
        this.atualizarElemento('gastosAtributos', gastosAtributos);
        this.atualizarElemento('gastosVantagens', gastosVantagens);
        this.atualizarElemento('gastosDesvantagens', gastosDesvantagens);
        this.atualizarElemento('gastosPericias', gastosPericias);
        this.atualizarElemento('gastosMagias', gastosMagias);
        this.atualizarElemento('gastosTecnicas', gastosTecnicas);
        this.atualizarElemento('gastosPeculiaridades', gastosPeculiaridades);
        this.atualizarElemento('totalLiquido', saldoDisponivel);
        
        // Cor do total líquido
        const totalElement = document.getElementById('totalLiquido');
        if (totalElement) {
            totalElement.style.color = saldoDisponivel < 0 ? '#e74c3c' :
                                      saldoDisponivel > this.estado.pontos.total ? '#e74c3c' :
                                      saldoDisponivel > this.estado.pontos.total * 0.8 ? '#f39c12' : '#27ae60';
        }
    }

    atualizarDisplayDistribuicao() {
        const total = this.estado.pontos.total;
        if (total === 0) return;
        
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        const gastosVantagens = this.estado.pontos.gastosVantagens;
        const gastosPericiasMagias = this.estado.pontos.gastosPericias + this.estado.pontos.gastosMagias;
        const outros = this.estado.pontos.gastosTecnicas + this.estado.pontos.gastosPeculiaridades;
        
        // Calcular percentuais
        const distribAtributos = Math.min((gastosAtributos / total) * 100, 100);
        const distribVantagens = Math.min((gastosVantagens / total) * 100, 100);
        const distribPericias = Math.min((gastosPericiasMagias / total) * 100, 100);
        const distribOutros = Math.min((outros / total) * 100, 100);
        
        // Atualizar barras
        this.atualizarBarra('distribAtributos', distribAtributos);
        this.atualizarBarra('distribVantagens', distribVantagens);
        this.atualizarBarra('distribPericias', distribPericias);
        this.atualizarBarra('distribOutros', distribOutros);
        
        // Atualizar percentuais
        this.atualizarElemento('distribAtributosValor', `${Math.round(distribAtributos)}%`);
        this.atualizarElemento('distribVantagensValor', `${Math.round(distribVantagens)}%`);
        this.atualizarElemento('distribPericiasValor', `${Math.round(distribPericias)}%`);
        this.atualizarElemento('distribOutrosValor', `${Math.round(distribOutros)}%`);
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.tagName === 'INPUT' || elemento.tagName === 'SELECT') {
                elemento.value = valor;
            } else {
                elemento.textContent = valor;
            }
        }
    }

    atualizarBarra(id, percentual) {
        const barra = document.getElementById(id);
        if (barra) {
            barra.style.width = `${Math.min(Math.max(percentual, 0), 100)}%`;
        }
    }

    // Funções para controle de PV/PF
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

    // Funções para salvar/carregar
    coletarDadosParaSalvar() {
        return {
            identificacao: {
                raca: this.estado.identificacao.raca,
                classe: this.estado.identificacao.classe,
                nivel: this.estado.identificacao.nivel,
                descricao: this.estado.identificacao.descricao
            },
            pontos: {
                total: this.estado.pontos.total,
                limiteDesvantagens: this.estado.pontos.limiteDesvantagens,
                saldoDisponivel: this.estado.pontos.saldoDisponivel
            },
            atributos: { ...this.estado.atributos },
            financeiro: { ...this.estado.financeiro },
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
            atualizadoEm: new Date().toISOString()
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        // Carregar identificação
        if (dados.identificacao) {
            this.estado.identificacao = { ...dados.identificacao };
            this.atualizarElemento('dashboardRaca', dados.identificacao.raca);
            this.atualizarElemento('dashboardClasse', dados.identificacao.classe);
            this.atualizarElemento('dashboardNivel', dados.identificacao.nivel);
            this.atualizarElemento('dashboardDescricao', dados.identificacao.descricao);
        }
        
        // Carregar pontos
        if (dados.pontos) {
            this.estado.pontos.total = dados.pontos.total || 150;
            this.estado.pontos.limiteDesvantagens = dados.pontos.limiteDesvantagens || -50;
            this.estado.pontos.saldoDisponivel = dados.pontos.saldoDisponivel || 150;
            this.atualizarElemento('pontosTotais', this.estado.pontos.total);
            this.atualizarElemento('limiteDesvantagens', this.estado.pontos.limiteDesvantagens);
        }
        
        // Carregar atributos
        if (dados.atributos) {
            this.estado.atributos = { ...dados.atributos };
        }
        
        // Carregar financeiro
        if (dados.financeiro) {
            this.estado.financeiro = { ...dados.financeiro };
            this.atualizarElemento('nivelRiqueza', this.estado.financeiro.riqueza);
            this.atualizarElemento('nivelAparencia', this.estado.financeiro.aparencia);
        }
        
        // Carregar gastos
        if (dados.gastos) {
            this.estado.pontos.gastosAtributos = dados.gastos.atributos || 0;
            this.estado.pontos.gastosVantagens = dados.gastos.vantagens || 0;
            this.estado.pontos.gastosDesvantagens = dados.gastos.desvantagens || 0;
            this.estado.pontos.gastosPericias = dados.gastos.pericias || 0;
            this.estado.pontos.gastosMagias = dados.gastos.magias || 0;
            this.estado.pontos.gastosTecnicas = dados.gastos.tecnicas || 0;
            this.estado.pontos.gastosPeculiaridades = dados.gastos.peculiaridades || 0;
        }
        
        // Atualizar tudo
        this.recalcularSaldo();
        this.atualizarDisplayCompleto();
        this.atualizarContadorDescricao();
    }
}

// Inicialização automática quando a dashboard carrega
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        // Verificar se estamos na aba dashboard
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab) {
            // Inicializar dashboard manager
            window.dashboardManager = new DashboardManager();
            window.dashboardManager.inicializar();
        }
        
        // Observer para detectar quando a dashboard fica ativa
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.id === 'dashboard' && mutation.target.classList.contains('active')) {
                    // Se ainda não existe dashboard manager, criar um
                    if (!window.dashboardManager) {
                        window.dashboardManager = new DashboardManager();
                        window.dashboardManager.inicializar();
                    } else {
                        // Se já existe, apenas atualizar o display
                        window.dashboardManager.atualizarDisplayCompleto();
                    }
                }
            });
        });
        
        // Iniciar observer se a dashboard existir
        if (dashboardTab) {
            observer.observe(dashboardTab, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
    }, 300);
});

// Exportar funções para uso global
window.ajustarPV = function(valor) {
    if (window.dashboardManager) {
        window.dashboardManager.ajustarPV(valor);
    }
};

window.ajustarPF = function(valor) {
    if (window.dashboardManager) {
        window.dashboardManager.ajustarPF(valor);
    }
};