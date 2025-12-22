// dashboard.js - Sistema de Dashboard para GURPS Tool
class DashboardManager {
    constructor() {
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
        // Configurar eventos para inputs da dashboard
        const ids = [
            'dashboardRaca', 'dashboardClasse', 'dashboardNivel', 'dashboardDescricao',
            'pontosTotais', 'limiteDesvantagens'
        ];

        ids.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', () => {
                    this.atualizarEstadoLocal(id, elemento.value);
                    
                    if (id === 'dashboardDescricao') {
                        this.atualizarContadorDescricao();
                    }
                    
                    if (id === 'pontosTotais') {
                        this.recalcularSaldo();
                    }
                    
                    this.atualizarDisplayPontos();
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
            });
        }
        
        if (nivelRiqueza) {
            nivelRiqueza.addEventListener('change', () => {
                this.atualizarFinanceiro();
            });
        }
    }

    iniciarMonitoramento() {
        setInterval(() => {
            this.coletarDadosAbas();
        }, 500);
    }

    coletarDadosAbas() {
        this.calcularAtributos();
        this.atualizarFinanceiro();
        this.coletarVantagensDesvantagens();
        this.coletarPericias();
        this.coletarMagias();
        this.recalcularSaldo();
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

    recalcularSaldo() {
        const total = parseInt(document.getElementById('pontosTotais')?.value) || this.estado.pontos.total;
        const { 
            gastosAtributos, 
            gastosVantagens, 
            gastosPericias, 
            gastosMagias,
            totalDesvantagens
        } = this.estado.pontos;

        const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
        const saldoDisponivel = total - gastosTotais + totalDesvantagens;
        
        this.estado.pontos.total = total;
        this.estado.pontos.saldoDisponivel = saldoDisponivel;
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
        const total = parseInt(document.getElementById('pontosTotais')?.value) || this.estado.pontos.total;
        const { 
            gastosAtributos, 
            gastosVantagens, 
            gastosPericias, 
            gastosMagias,
            totalDesvantagens,
            limiteDesvantagens
        } = this.estado.pontos;

        const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
        const saldoDisponivel = total - gastosTotais + totalDesvantagens;
        
        this.atualizarElemento('pontosGastos', gastosTotais);
        this.atualizarElemento('saldoDisponivel', saldoDisponivel);
        this.atualizarElemento('desvantagensAtuais', totalDesvantagens);
        
        const saldoElement = document.getElementById('saldoDisponivel');
        if (saldoElement) {
            saldoElement.style.color = saldoDisponivel < 0 ? '#e74c3c' :
                                      saldoDisponivel < 50 ? '#f39c12' : '#27ae60';
        }
        
        const desvElement = document.getElementById('desvantagensAtuais');
        if (desvElement) {
            desvElement.style.color = Math.abs(totalDesvantagens) > Math.abs(limiteDesvantagens) ? '#e74c3c' : '#9b59b6';
        }
    }

    atualizarDisplayFinanceiro() {
        this.atualizarElemento('nivelRiqueza', this.estado.financeiro.riqueza);
        this.atualizarElemento('saldoPersonagem', this.estado.financeiro.saldo);
    }

    atualizarDisplayResumo() {
        const total = parseInt(document.getElementById('pontosTotais')?.value) || this.estado.pontos.total;
        const { 
            gastosAtributos, 
            gastosVantagens, 
            gastosPericias, 
            gastosMagias,
            totalDesvantagens
        } = this.estado.pontos;

        const gastosTotais = gastosAtributos + gastosVantagens + gastosPericias + gastosMagias;
        const saldoDisponivel = total - gastosTotais + totalDesvantagens;
        
        this.atualizarElemento('gastosAtributos', gastosAtributos);
        this.atualizarElemento('gastosVantagens', gastosVantagens);
        this.atualizarElemento('gastosPericias', gastosPericias);
        this.atualizarElemento('gastosMagias', gastosMagias);
        this.atualizarElemento('gastosDesvantagens', totalDesvantagens);
        this.atualizarElemento('gastosTotal', saldoDisponivel);
        
        const totalElement = document.getElementById('gastosTotal');
        if (totalElement) {
            totalElement.style.color = saldoDisponivel < 0 ? '#9b59b6' :
                                      saldoDisponivel > total ? '#e74c3c' :
                                      saldoDisponivel > total * 0.8 ? '#f39c12' : '#27ae60';
        }
    }

    atualizarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            if (elemento.tagName === 'INPUT' && elemento.type === 'number') {
                if (parseInt(elemento.value) !== valor) {
                    elemento.value = valor;
                }
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

    atualizarEstadoLocal(id, valor) {
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
                break;
            case 'limiteDesvantagens':
                this.estado.pontos.limiteDesvantagens = parseInt(valor) || -50;
                break;
        }
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
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            window.dashboardManager = new DashboardManager();
            window.dashboardManager.inicializar();
        }
        
        // Observer para quando mudar para a aba dashboard
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.id === 'dashboard' && 
                    mutation.target.classList.contains('active')) {
                    if (!window.dashboardManager) {
                        window.dashboardManager = new DashboardManager();
                        window.dashboardManager.inicializar();
                    }
                }
            });
        });
        
        // Observar mudanças na aba dashboard
        if (dashboardTab) {
            observer.observe(dashboardTab, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
    }, 300);
});