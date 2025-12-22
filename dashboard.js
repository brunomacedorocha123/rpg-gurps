// ===========================================
// DASHBOARD MANAGER - VERSÃO COMPLETA INTEGRADA
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
        this.inicializando = false;
    }

    inicializar() {
        if (this.inicializando) return;
        this.inicializando = true;
        
        this.configurarSistemaFoto();
        this.configurarEventosDashboard();
        this.configurarEventosAtributos();
        this.configurarMonitores();
        this.carregarDadosIniciais();
        this.iniciarMonitoramentoAtivo();
        
        this.inicializando = false;
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
        // Configurar inputs da dashboard
        const inputs = [
            {id: 'dashboardRaca', callback: (v) => this.estado.identificacao.raca = v},
            {id: 'dashboardClasse', callback: (v) => this.estado.identificacao.classe = v},
            {id: 'dashboardNivel', callback: (v) => this.estado.identificacao.nivel = v},
            {id: 'dashboardDescricao', callback: (v) => this.estado.identificacao.descricao = v},
            {id: 'pontosTotais', callback: (v) => {
                this.estado.pontos.total = parseInt(v) || 150;
                this.recalcularSaldo();
            }},
            {id: 'limiteDesvantagens', callback: (v) => {
                this.estado.pontos.limiteDesvantagens = parseInt(v) || -50;
            }},
            {id: 'nivelAparencia', callback: (v) => this.estado.financeiro.aparencia = v},
            {id: 'nivelRiqueza', callback: (v) => {
                this.estado.financeiro.riqueza = v;
                this.calcularRenda();
            }}
        ];

        inputs.forEach(({id, callback}) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.addEventListener('input', () => callback(elemento.value));
                elemento.addEventListener('change', () => callback(elemento.value));
            }
        });

        // Contador de caracteres da descrição
        const textarea = document.getElementById('dashboardDescricao');
        if (textarea) {
            textarea.addEventListener('input', () => this.atualizarContadorDescricao());
        }
    }

    configurarEventosAtributos() {
        // Monitorar alterações diretas nos atributos
        const atributos = ['ST', 'DX', 'IQ', 'HT'];
        atributos.forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                input.addEventListener('change', () => this.atualizarAtributosDiretamente());
                input.addEventListener('input', () => this.atualizarAtributosDiretamente());
            }
        });

        // Monitorar alterações nos bônus de PV/PF
        ['bonusPV', 'bonusPF'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.atualizarAtributosDiretamente());
                input.addEventListener('input', () => this.atualizarAtributosDiretamente());
            }
        });
    }

    configurarMonitores() {
        // Monitorar evento de atributos alterados
        document.addEventListener('atributosAlterados', (e) => {
            this.processarAtributosAlterados(e.detail);
        });

        // Monitorar evento de vantagens/desvantagens
        document.addEventListener('vantagensAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.atualizarVantagensDesvantagens(e.detail.total);
            }
        });

        // Monitorar evento de perícias
        document.addEventListener('periciasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosPericias = e.detail.total;
                this.recalcularSaldo();
                this.atualizarDisplayCompleto();
            }
        });

        // Monitorar evento de magias
        document.addEventListener('magiasAlteradas', (e) => {
            if (e.detail && typeof e.detail.total === 'number') {
                this.estado.pontos.gastosMagias = e.detail.total;
                this.recalcularSaldo();
                this.atualizarDisplayCompleto();
            }
        });
    }

    carregarDadosIniciais() {
        this.atualizarAtributosDiretamente();
        this.calcularRenda();
        this.recalcularSaldo();
        this.atualizarDisplayCompleto();
        this.atualizarContadorDescricao();
    }

    iniciarMonitoramentoAtivo() {
        // Monitorar ativamente a cada 500ms para garantir sincronização
        setInterval(() => {
            this.verificarAtributosAtualizados();
        }, 500);
    }

    verificarAtributosAtualizados() {
        // Verificar se os atributos na aba atributos foram alterados
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;

        // Se os valores forem diferentes dos atuais, atualizar
        if (st !== this.estado.atributos.ST || 
            dx !== this.estado.atributos.DX || 
            iq !== this.estado.atributos.IQ || 
            ht !== this.estado.atributos.HT) {
            
            this.atualizarAtributosDiretamente();
        }
    }

    atualizarAtributosDiretamente() {
        // Buscar valores diretamente dos inputs
        const st = parseInt(document.getElementById('ST')?.value) || 10;
        const dx = parseInt(document.getElementById('DX')?.value) || 10;
        const iq = parseInt(document.getElementById('IQ')?.value) || 10;
        const ht = parseInt(document.getElementById('HT')?.value) || 10;
        
        // Buscar PV e PF totais
        const pvTotal = parseInt(document.getElementById('PVTotal')?.textContent) || st;
        const pfTotal = parseInt(document.getElementById('PFTotal')?.textContent) || ht;
        
        // Buscar pontos gastos em atributos
        const pontosGastos = parseInt(document.getElementById('pontosGastos')?.textContent) || 0;

        // Atualizar estado
        this.estado.atributos.ST = st;
        this.estado.atributos.DX = dx;
        this.estado.atributos.IQ = iq;
        this.estado.atributos.HT = ht;
        this.estado.atributos.PV.max = pvTotal;
        this.estado.atributos.PF.max = pfTotal;
        
        // Ajustar PV/PF atuais se necessário
        if (this.estado.atributos.PV.atual > pvTotal) {
            this.estado.atributos.PV.atual = pvTotal;
        }
        if (this.estado.atributos.PF.atual > pfTotal) {
            this.estado.atributos.PF.atual = pfTotal;
        }

        // Atualizar pontos gastos em atributos
        this.estado.pontos.gastosAtributos = pontosGastos;

        // Recalcular tudo
        this.recalcularSaldo();
        this.atualizarDisplayCompleto();
    }

    processarAtributosAlterados(detalhes) {
        if (!detalhes) return;
        
        // Atualizar atributos do evento
        this.estado.atributos.ST = detalhes.ST || 10;
        this.estado.atributos.DX = detalhes.DX || 10;
        this.estado.atributos.IQ = detalhes.IQ || 10;
        this.estado.atributos.HT = detalhes.HT || 10;
        
        // Atualizar PV e PF
        this.estado.atributos.PV.max = detalhes.PV || this.estado.atributos.ST;
        this.estado.atributos.PF.max = detalhes.PF || this.estado.atributos.HT;
        
        // Atualizar pontos gastos
        if (detalhes.pontosGastos !== undefined) {
            this.estado.pontos.gastosAtributos = detalhes.pontosGastos;
        }
        
        // Recalcular tudo
        this.recalcularSaldo();
        this.atualizarDisplayCompleto();
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
        this.atualizarDisplayCompleto();
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
        
        // Adicionar pontos das desvantagens (são pontos ganhos, então subtraem do gasto)
        const pontosDesvantagens = this.estado.pontos.gastosDesvantagens;
        
        // Saldo = Total - Gastos + Desvantagens
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
        
        // Atualizar valores dos atributos
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
        const gastosAtributos = this.estado.pontos.gastosAtributos;
        
        // Atualizar cards de pontos
        this.atualizarElemento('saldoDisponivel', saldoDisponivel);
        this.atualizarElemento('desvantagensAtuais', gastosDesvantagens);
        
        // Atualizar cores baseadas nos valores
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
        
        // Atualizar total de pontos gastos (se existir)
        const pontosGastosElement = document.getElementById('pontosGastos');
        if (pontosGastosElement) {
            const gastosTotais = 
                gastosAtributos + 
                this.estado.pontos.gastosVantagens + 
                this.estado.pontos.gastosPericias + 
                this.estado.pontos.gastosMagias +
                this.estado.pontos.gastosTecnicas +
                this.estado.pontos.gastosPeculiaridades;
            pontosGastosElement.textContent = gastosTotais;
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
        const distribAtributos = (gastosAtributos / total) * 100;
        const distribVantagens = (gastosVantagens / total) * 100;
        const distribPericias = (gastosPericiasMagias / total) * 100;
        const distribOutros = (outros / total) * 100;
        
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
            if (elemento.tagName === 'INPUT') {
                if (elemento.type === 'number') {
                    const current = parseInt(elemento.value) || 0;
                    if (current !== valor) {
                        elemento.value = valor;
                    }
                } else {
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

    // Funções para salvar/carregar dados
    coletarDadosParaSalvar() {
        return {
            identificacao: {
                raca: document.getElementById('dashboardRaca')?.value || '',
                classe: document.getElementById('dashboardClasse')?.value || '',
                nivel: document.getElementById('dashboardNivel')?.value || '',
                descricao: document.getElementById('dashboardDescricao')?.value || ''
            },
            pontos: {
                total: this.estado.pontos.total,
                limiteDesvantagens: this.estado.pontos.limiteDesvantagens
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
                peculiaridades: this.estado.pontos.gastosPeculiaridades
            },
            atualizadoEm: new Date().toISOString()
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        // Carregar identificação
        if (dados.identificacao) {
            this.carregarElemento('dashboardRaca', dados.identificacao.raca);
            this.carregarElemento('dashboardClasse', dados.identificacao.classe);
            this.carregarElemento('dashboardNivel', dados.identificacao.nivel);
            this.carregarElemento('dashboardDescricao', dados.identificacao.descricao);
            this.estado.identificacao = { ...dados.identificacao };
        }
        
        // Carregar pontos
        if (dados.pontos) {
            this.estado.pontos.total = dados.pontos.total || 150;
            this.estado.pontos.limiteDesvantagens = dados.pontos.limiteDesvantagens || -50;
            this.carregarElemento('pontosTotais', this.estado.pontos.total);
            this.carregarElemento('limiteDesvantagens', this.estado.pontos.limiteDesvantagens);
        }
        
        // Carregar atributos
        if (dados.atributos) {
            this.estado.atributos = { ...dados.atributos };
        }
        
        // Carregar financeiro
        if (dados.financeiro) {
            this.estado.financeiro = { ...dados.financeiro };
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
        
        // Recalcular e atualizar
        this.recalcularSaldo();
        this.atualizarDisplayCompleto();
        this.atualizarContadorDescricao();
    }

    carregarElemento(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento && valor !== undefined && valor !== null) {
            if (elemento.tagName === 'INPUT' || elemento.tagName === 'TEXTAREA' || elemento.tagName === 'SELECT') {
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
        if (dashboardTab) {
            window.dashboardManager = new DashboardManager();
            window.dashboardManager.inicializar();
        }
        
        // Observer para quando a aba dashboard ficar ativa
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.target.id === 'dashboard' && 
                    mutation.target.classList.contains('active')) {
                    if (!window.dashboardManager) {
                        window.dashboardManager = new DashboardManager();
                        window.dashboardManager.inicializar();
                    } else {
                        window.dashboardManager.atualizarDisplayCompleto();
                    }
                }
            });
        });
        
        if (dashboardTab) {
            observer.observe(dashboardTab, { 
                attributes: true, 
                attributeFilter: ['class'] 
            });
        }
    }, 300);
});

// Exportar funções globais
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