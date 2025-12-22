// dashboard.js - Sistema de Dashboard para GURPS Tool
class DashboardManager {
    constructor(characterManager) {
        this.characterManager = characterManager;
        this.estado = {
            pontos: {
                total: 150,
                gastosAtributos: 0,
                gastosVantagens: 0,
                gastosPericias: 0,
                gastosMagias: 0,
                totalDesvantagens: 0,
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
                saldo: '$2.000'
            }
        };
        
        this.fotoTemporaria = null;
        this.debounceTimer = null;
    }

    inicializar() {
        this.configurarSistemaFoto();
        this.configurarEventosDashboard();
        this.configurarMonitores();
        this.iniciarMonitoramento();
        
        this.characterManager.adicionarListener((dados) => {
            this.atualizarDashboard(dados);
        });
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
                    this.salvarAlteracoes();
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
                this.salvarAlteracoes();
            });
        }
    }

    configurarEventosDashboard() {
        const elementos = {
            // Identificação
            'dashboardRaca': 'identificacao.raca',
            'dashboardClasse': 'identificacao.classe',
            'dashboardNivel': 'identificacao.nivel',
            'dashboardDescricao': 'identificacao.descricao',
            
            // Pontos
            'pontosTotais': 'pontos.total',
            'limiteDesvantagens': 'pontos.limiteDesvantagens'
        };

        Object.entries(elementos).forEach(([id, caminho]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', () => {
                    this.atualizarEstado(caminho, elemento.value);
                    if (id === 'dashboardDescricao') {
                        this.atualizarContadorDescricao();
                    }
                    this.salvarAlteracoes();
                });
            }
        });

        this.atualizarContadorDescricao();
    }

    configurarMonitores() {
        this.monitorarAtributos();
        this.monitorarCaracteristicas();
    }

    monitorarAtributos() {
        const atributos = ['ST', 'DX', 'IQ', 'HT'];
        atributos.forEach(atributo => {
            const elemento = document.getElementById(atributo);
            if (elemento) {
                elemento.addEventListener('input', () => {
                    this.calcularAtributos();
                    this.salvarAlteracoes();
                });
            }
        });
    }

    monitorarCaracteristicas() {
        const nivelAparencia = document.getElementById('nivelAparencia');
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        
        if (nivelAparencia) {
            nivelAparencia.addEventListener('change', () => {
                this.atualizarFinanceiro();
                this.salvarAlteracoes();
            });
        }
        
        if (nivelRiqueza) {
            nivelRiqueza.addEventListener('change', () => {
                this.atualizarFinanceiro();
                this.salvarAlteracoes();
            });
        }
    }

    iniciarMonitoramento() {
        setInterval(() => {
            this.coletarDadosAbas();
        }, 1000);
    }

    coletarDadosAbas() {
        this.calcularAtributos();
        this.atualizarFinanceiro();
        this.coletarVantagensDesvantagens();
        this.coletarPericias();
        this.coletarMagias();
        this.calcularResumo();
        this.atualizarDisplay();
    }

    calcularAtributos() {
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;

        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        
        this.estado.atributos.PV.max = st;
        this.estado.atributos.PF.max = ht;
        
        if (this.estado.atributos.PV.atual > st) {
            this.estado.atributos.PV.atual = st;
        }
        if (this.estado.atributos.PF.atual > ht) {
            this.estado.atributos.PF.atual = ht;
        }

        this.calcularCustoAtributos(st, dx, iq, ht);
    }

    calcularCustoAtributos(st, dx, iq, ht) {
        const custoST = (st - 10) * 10;
        const custoDX = (dx - 10) * 20;
        const custoIQ = (iq - 10) * 20;
        const custoHT = (ht - 10) * 10;
        
        this.estado.pontos.gastosAtributos = custoST + custoDX + custoIQ + custoHT;
    }

    atualizarFinanceiro() {
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        if (nivelRiqueza) {
            const texto = nivelRiqueza.options[nivelRiqueza.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            this.estado.financeiro.riqueza = nome;
            
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
    }

    coletarVantagensDesvantagens() {
        const vantagensTotal = this.obterValorNumerico('total-vantagens') || 0;
        this.estado.pontos.gastosVantagens = Math.max(vantagensTotal, 0);
        this.estado.pontos.totalDesvantagens = Math.abs(Math.min(vantagensTotal, 0));
    }

    coletarPericias() {
        const periciasTotal = this.obterValorNumerico('pontos-pericias-total') || 0;
        this.estado.pontos.gastosPericias = periciasTotal;
    }

    coletarMagias() {
        const magiasTotal = this.obterValorNumerico('total-gasto-magia') || 0;
        this.estado.pontos.gastosMagias = magiasTotal;
    }

    obterValorNumerico(id) {
        const elemento = document.getElementById(id);
        if (!elemento) return 0;
        
        const texto = elemento.textContent || elemento.value || '';
        const match = texto.match(/[+-]?\d+/);
        return match ? parseInt(match[0]) : 0;
    }

    calcularResumo() {
        const { 
            gastosAtributos, 
            gastosVantagens, 
            gastosPericias, 
            gastosMagias,
            totalDesvantagens,
            total,
            limiteDesvantagens
        } = this.estado.pontos;

        const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
        const saldoDisponivel = total - gastosTotais + totalDesvantagens;
        
        this.estado.pontos.saldoDisponivel = saldoDisponivel;
        
        return {
            gastosTotais,
            saldoDisponivel,
            excedeDesvantagens: Math.abs(totalDesvantagens) > Math.abs(limiteDesvantagens)
        };
    }

    atualizarContadorDescricao() {
        const textarea = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        if (textarea && contador) {
            contador.textContent = textarea.value.length;
        }
    }

    atualizarDisplay() {
        this.atualizarDisplayAtributos();
        this.atualizarDisplayPontos();
        this.atualizarDisplayFinanceiro();
        this.atualizarDisplayResumo();
    }

    atualizarDisplayAtributos() {
        const { ST, DX, IQ, HT, PV, PF } = this.estado.atributos;
        
        this.atualizarElemento('atributoST', ST);
        this.atualizarElemento('atributoDX', DX);
        this.atualizarElemento('atributoIQ', IQ);
        this.atualizarElemento('atributoHT', HT);
        
        this.atualizarElemento('valorPV', `${PV.atual}/${PV.max}`);
        this.atualizarElemento('valorPF', `${PF.atual}/${PF.max}`);
        
        this.atualizarBarra('barraPV', (PV.atual / PV.max) * 100);
        this.atualizarBarra('barraPF', (PF.atual / PF.max) * 100);
    }

    atualizarDisplayPontos() {
        const resumo = this.calcularResumo();
        
        this.atualizarElemento('pontosGastos', this.estado.pontos.gastosAtributos + 
            this.estado.pontos.gastosVantagens + 
            this.estado.pontos.gastosPericias + 
            this.estado.pontos.gastosMagias);
        
        this.atualizarElemento('saldoDisponivel', resumo.saldoDisponivel);
        this.atualizarElemento('desvantagensAtuais', this.estado.pontos.totalDesvantagens);
        
        const saldoElement = document.getElementById('saldoDisponivel');
        if (saldoElement) {
            saldoElement.style.color = resumo.saldoDisponivel < 0 ? '#e74c3c' :
                                      resumo.saldoDisponivel < 50 ? '#f39c12' : '#27ae60';
        }
        
        const desvElement = document.getElementById('desvantagensAtuais');
        if (desvElement) {
            desvElement.style.color = resumo.excedeDesvantagens ? '#e74c3c' : '#9b59b6';
        }
    }

    atualizarDisplayFinanceiro() {
        this.atualizarElemento('nivelRiqueza', this.estado.financeiro.riqueza);
        this.atualizarElemento('saldoPersonagem', this.estado.financeiro.saldo);
    }

    atualizarDisplayResumo() {
        this.atualizarElemento('gastosAtributos', this.estado.pontos.gastosAtributos);
        this.atualizarElemento('gastosVantagens', this.estado.pontos.gastosVantagens);
        this.atualizarElemento('gastosPericias', this.estado.pontos.gastosPericias);
        this.atualizarElemento('gastosMagias', this.estado.pontos.gastosMagias);
        this.atualizarElemento('gastosDesvantagens', this.estado.pontos.totalDesvantagens);
        
        const resumo = this.calcularResumo();
        this.atualizarElemento('gastosTotal', resumo.saldoDisponivel);
        
        const totalElement = document.getElementById('gastosTotal');
        if (totalElement) {
            totalElement.style.color = resumo.saldoDisponivel < 0 ? '#9b59b6' :
                                      resumo.saldoDisponivel > this.estado.pontos.total ? '#e74c3c' :
                                      resumo.saldoDisponivel > this.estado.pontos.total * 0.8 ? '#f39c12' : '#27ae60';
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.tagName === 'INPUT' && elemento.type === 'number') {
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

    atualizarEstado(caminho, valor) {
        const partes = caminho.split('.');
        let obj = this.estado;
        
        for (let i = 0; i < partes.length - 1; i++) {
            if (!obj[partes[i]]) obj[partes[i]] = {};
            obj = obj[partes[i]];
        }
        
        const ultimaParte = partes[partes.length - 1];
        if (ultimaParte === 'total' || ultimaParte === 'limiteDesvantagens') {
            obj[ultimaParte] = parseInt(valor) || 0;
        } else {
            obj[ultimaParte] = valor;
        }
    }

    atualizarDashboard(dados) {
        if (dados.identificacao) {
            this.preencherIdentificacao(dados.identificacao);
        }
        
        if (dados.pontos) {
            this.estado.pontos = { ...this.estado.pontos, ...dados.pontos };
        }
        
        if (dados.atributos) {
            this.estado.atributos = { ...this.estado.atributos, ...dados.atributos };
        }
        
        if (dados.financeiro) {
            this.estado.financeiro = { ...this.estado.financeiro, ...dados.financeiro };
        }
        
        this.atualizarDisplay();
    }

    preencherIdentificacao(dados) {
        this.atualizarElemento('dashboardRaca', dados.raca || '');
        this.atualizarElemento('dashboardClasse', dados.classe || '');
        this.atualizarElemento('dashboardNivel', dados.nivel || '');
        this.atualizarElemento('dashboardDescricao', dados.descricao || '');
        this.atualizarContadorDescricao();
    }

    coletarDadosDashboard() {
        return {
            identificacao: {
                raca: document.getElementById('dashboardRaca')?.value || '',
                classe: document.getElementById('dashboardClasse')?.value || '',
                nivel: document.getElementById('dashboardNivel')?.value || '',
                descricao: document.getElementById('dashboardDescricao')?.value || ''
            },
            pontos: {
                total: parseInt(document.getElementById('pontosTotais')?.value) || 150,
                limiteDesvantagens: parseInt(document.getElementById('limiteDesvantagens')?.value) || -50
            },
            atributos: { ...this.estado.atributos },
            financeiro: { ...this.estado.financeiro },
            foto: this.fotoTemporaria
        };
    }

    salvarAlteracoes() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            const dados = this.coletarDadosDashboard();
            this.characterManager.salvarDadosParciais(dados);
        }, 500);
    }
}

// Inicialização quando a dashboard estiver ativa
document.addEventListener('DOMContentLoaded', function() {
    if (window.characterManager) {
        window.dashboardManager = new DashboardManager(window.characterManager);
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.id === 'dashboard' && 
                    mutation.target.classList.contains('active')) {
                    setTimeout(() => {
                        window.dashboardManager.inicializar();
                    }, 100);
                }
            });
        });
        
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab) {
            observer.observe(dashboardTab, { attributes: true, attributeFilter: ['class'] });
            
            if (dashboardTab.classList.contains('active')) {
                setTimeout(() => {
                    window.dashboardManager.inicializar();
                }, 300);
            }
        }
    }
});