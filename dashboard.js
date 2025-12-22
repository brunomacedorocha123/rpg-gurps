// ===========================================
// DASHBOARD MANAGER - VERSÃO COMPLETA
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
    }

    inicializar() {
        this.configurarSistemaFoto();
        this.configurarEventosDashboard();
        this.configurarMonitores();
        this.carregarDadosIniciais();
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
        const ids = [
            'dashboardRaca', 'dashboardClasse', 'dashboardNivel', 'dashboardDescricao',
            'pontosTotais', 'limiteDesvantagens', 'nivelAparencia', 'nivelRiqueza'
        ];

        ids.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', () => this.atualizarEstadoLocal(id, elemento.value));
                elemento.addEventListener('change', () => this.atualizarEstadoLocal(id, elemento.value));
            }
        });

        const textarea = document.getElementById('dashboardDescricao');
        if (textarea) {
            textarea.addEventListener('input', () => this.atualizarContadorDescricao());
        }

        const totalInput = document.getElementById('pontosTotais');
        if (totalInput) {
            totalInput.addEventListener('change', () => this.recalcularSaldo());
        }
    }

    configurarMonitores() {
        document.addEventListener('atributosAlterados', (e) => {
            this.atualizarAtributosDoEvento(e.detail);
        });

        document.addEventListener('vantagensAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.atualizarVantagensDesvantagens(e.detail.total);
            }
        });

        document.addEventListener('periciasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPericias = e.detail.total;
                this.recalcularSaldo();
                this.atualizarDisplay();
            }
        });

        document.addEventListener('magiasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosMagias = e.detail.total;
                this.recalcularSaldo();
                this.atualizarDisplay();
            }
        });
    }

    carregarDadosIniciais() {
        this.calcularAtributos();
        this.atualizarFinanceiro();
        this.recalcularSaldo();
        this.atualizarDisplay();
        this.atualizarContadorDescricao();
    }

    iniciarMonitoramento() {
        this.coletarDadosAbas();
        
        setInterval(() => {
            this.coletarDadosAbas();
        }, 1000);
    }

    coletarDadosAbas() {
        this.calcularAtributos();
        this.atualizarFinanceiro();
        this.coletarDadosExtras();
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

    atualizarAtributosDoEvento(detalhes) {
        if (!detalhes) return;
        
        this.estado.atributos.ST = detalhes.ST || 10;
        this.estado.atributos.DX = detalhes.DX || 10;
        this.estado.atributos.IQ = detalhes.IQ || 10;
        this.estado.atributos.HT = detalhes.HT || 10;
        
        this.estado.atributos.PV.max = detalhes.PV || this.estado.atributos.ST;
        this.estado.atributos.PF.max = detalhes.PF || this.estado.atributos.HT;
        
        if (detalhes.pontosGastos !== undefined) {
            this.estado.pontos.gastosAtributos = detalhes.pontosGastos;
        } else {
            this.calcularCustoAtributos(
                this.estado.atributos.ST,
                this.estado.atributos.DX,
                this.estado.atributos.IQ,
                this.estado.atributos.HT
            );
        }
        
        this.recalcularSaldo();
        this.atualizarDisplay();
    }

    atualizarVantagensDesvantagens(total) {
        if (total >= 0) {
            this.estado.pontos.gastosVantagens = total;
            this.estado.pontos.gastosDesvantagens = 0;
        } else {
            this.estado.pontos.gastosVantagens = 0;
            this.estado.pontos.gastosDesvantagens = Math.abs(total);
        }
        
        this.recalcularSaldo();
        this.atualizarDisplay();
    }

    atualizarFinanceiro() {
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        const nivelAparencia = document.getElementById('nivelAparencia');
        
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
        
        if (nivelAparencia) {
            const texto = nivelAparencia.options[nivelAparencia.selectedIndex].text;
            const nome = texto.split('[')[0].trim();
            this.estado.financeiro.aparencia = nome;
        }
    }

    coletarDadosExtras() {
        const vantagensTotal = this.obterValorNumerico('total-vantagens') || 0;
        if (vantagensTotal >= 0) {
            this.estado.pontos.gastosVantagens = vantagensTotal;
            this.estado.pontos.gastosDesvantagens = 0;
        } else {
            this.estado.pontos.gastosVantagens = 0;
            this.estado.pontos.gastosDesvantagens = Math.abs(vantagensTotal);
        }
        
        this.estado.pontos.gastosPericias = this.obterValorNumerico('pontos-pericias-total') || 0;
        this.estado.pontos.gastosMagias = this.obterValorNumerico('total-gasto-magia') || 0;
        this.estado.pontos.gastosTecnicas = this.obterValorNumerico('total-tecnicas') || 0;
        this.estado.pontos.gastosPeculiaridades = this.obterValorNumerico('total-peculiaridades') || 0;
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
        
        const gastosTotais = 
            this.estado.pontos.gastosAtributos + 
            this.estado.pontos.gastosVantagens + 
            this.estado.pontos.gastosPericias + 
            this.estado.pontos.gastosMagias +
            this.estado.pontos.gastosTecnicas +
            this.estado.pontos.gastosPeculiaridades;
        
        const pontosDesvantagens = this.estado.pontos.gastosDesvantagens;
        const saldoDisponivel = total - gastosTotais + pontosDesvantagens;
        
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
        
        this.atualizarBarra('barraPV', (PV.atual / PV.max) * 100);
        this.atualizarBarra('barraPF', (PF.atual / PF.max) * 100);
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
            saldoElement.style.color = saldoDisponivel < 0 ? '#e74c3c' :
                                      saldoDisponivel < 50 ? '#f39c12' : '#27ae60';
        }
        
        const desvElement = document.getElementById('desvantagensAtuais');
        if (desvElement) {
            desvElement.style.color = Math.abs(gastosDesvantagens) > Math.abs(limiteDesvantagens) ? '#e74c3c' : '#9b59b6';
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
        
        this.atualizarElemento('gastosAtributos', gastosAtributos);
        this.atualizarElemento('gastosVantagens', gastosVantagens);
        this.atualizarElemento('gastosDesvantagens', gastosDesvantagens);
        this.atualizarElemento('gastosPericias', gastosPericias);
        this.atualizarElemento('gastosMagias', gastosMagias);
        this.atualizarElemento('gastosTecnicas', gastosTecnicas);
        this.atualizarElemento('gastosPeculiaridades', gastosPeculiaridades);
        this.atualizarElemento('totalLiquido', saldoDisponivel);
        
        const totalElement = document.getElementById('totalLiquido');
        if (totalElement) {
            totalElement.style.color = saldoDisponivel < 0 ? '#e74c3c' :
                                      saldoDisponivel > this.estado.pontos.total ? '#e74c3c' :
                                      saldoDisponivel > this.estado.pontos.total * 0.8 ? '#f39c12' : '#27ae60';
        }
    }

    atualizarDisplayDistribuicao() {
        const total = this.estado.pontos.total;
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        const gastosVantagens = this.estado.pontos.gastosVantagens;
        const gastosPericiasMagias = this.estado.pontos.gastosPericias + this.estado.pontos.gastosMagias;
        const outros = this.estado.pontos.gastosTecnicas + this.estado.pontos.gastosPeculiaridades;
        
        const distribAtributos = total > 0 ? (gastosAtributos / total) * 100 : 0;
        const distribVantagens = total > 0 ? (gastosVantagens / total) * 100 : 0;
        const distribPericias = total > 0 ? (gastosPericiasMagias / total) * 100 : 0;
        const distribOutros = total > 0 ? (outros / total) * 100 : 0;
        
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
                this.recalcularSaldo();
                break;
            case 'limiteDesvantagens':
                this.estado.pontos.limiteDesvantagens = parseInt(valor) || -50;
                break;
            case 'nivelAparencia':
                this.estado.financeiro.aparencia = valor;
                break;
            case 'nivelRiqueza':
                this.estado.financeiro.riqueza = valor;
                this.atualizarFinanceiro();
                break;
        }
        
        this.atualizarDisplay();
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

    coletarDadosParaSalvar() {
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
            foto: this.fotoTemporaria,
            gastos: {
                atributos: this.estado.pontos.gastosAtributos,
                vantagens: this.estado.pontos.gastosVantagens,
                desvantagens: this.estado.pontos.gastosDesvantagens,
                pericias: this.estado.pontos.gastosPericias,
                magias: this.estado.pontos.gastosMagias,
                tecnicas: this.estado.pontos.gastosTecnicas,
                peculiaridades: this.estado.pontos.gastosPeculiaridades,
                saldo: this.estado.pontos.saldoDisponivel
            },
            atualizadoEm: new Date().toISOString()
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        if (dados.identificacao) {
            this.carregarElemento('dashboardRaca', dados.identificacao.raca);
            this.carregarElemento('dashboardClasse', dados.identificacao.classe);
            this.carregarElemento('dashboardNivel', dados.identificacao.nivel);
            this.carregarElemento('dashboardDescricao', dados.identificacao.descricao);
            
            this.estado.identificacao = { ...dados.identificacao };
        }
        
        if (dados.pontos) {
            this.carregarElemento('pontosTotais', dados.pontos.total);
            this.carregarElemento('limiteDesvantagens', dados.pontos.limiteDesvantagens);
            
            this.estado.pontos.total = dados.pontos.total || 150;
            this.estado.pontos.limiteDesvantagens = dados.pontos.limiteDesvantagens || -50;
        }
        
        if (dados.atributos) {
            this.estado.atributos = { ...dados.atributos };
        }
        
        if (dados.financeiro) {
            this.estado.financeiro = { ...dados.financeiro };
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
        
        this.recalcularSaldo();
        this.atualizarDisplay();
        this.atualizarContadorDescricao();
    }

    carregarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento && valor !== undefined && valor !== null) {
            if (elemento.tagName === 'INPUT' || elemento.tagName === 'TEXTAREA') {
                elemento.value = valor;
            } else {
                elemento.textContent = valor;
            }
        }
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
                    } else {
                        window.dashboardManager.atualizarDisplay();
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