// dashboard.js - VERSÃO CORRIGIDA (PV/PF FUNCIONANDO)
class DashboardManager {
    constructor() {
        console.log('🔥 DashboardManager criado');
        this.estado = {
            pontos: { 
                total: 150, 
                saldoDisponivel: 150,
                limiteDesvantagens: -50 
            },
            caracteristicas: { aparência: 0 },
            atributos: { 
                ST: 10, 
                DX: 10, 
                IQ: 10, 
                HT: 10,
                PV: { atual: 10, max: 10 },
                PF: { atual: 10, max: 10 }
            },
            identificacao: { raca: '', classe: '', descricao: '' },
            financeiro: { riqueza: 'Médio' }
        };
        this.inicializado = false;
    }

    // ================ MÉTODO PRINCIPAL ================
    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 INICIANDO DASHBOARD');
        
        // 1. CONFIGURAR EVENTOS BÁSICOS
        this.configurarEventosBasicos();
        
        // 2. CONFIGURAR FOTO
        this.configurarSistemaFoto();
        
        // 3. CONFIGURAR BOTÕES PV/PF
        this.configurarBotoesVitalidade();
        
        // 4. CARREGAR VALORES INICIAIS
        this.carregarValoresIniciais();
        
        // 5. INICIAR MONITORAMENTO
        this.iniciarMonitoramento();
        
        // 6. ATUALIZAR TUDO
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('✅ Dashboard inicializada!');
    }

    // ================ EVENTOS BÁSICOS ================
    configurarEventosBasicos() {
        // Pontos totais
        const pontosInput = document.getElementById('pontosTotais');
        if (pontosInput) {
            pontosInput.addEventListener('input', (e) => {
                this.estado.pontos.total = parseInt(e.target.value) || 150;
                this.atualizarSaldo();
            });
        }
        
        // Limite desvantagens
        const limiteInput = document.getElementById('limiteDesvantagens');
        if (limiteInput) {
            limiteInput.addEventListener('input', (e) => {
                this.estado.pontos.limiteDesvantagens = parseInt(e.target.value) || -50;
            });
        }
        
        // Identificação
        ['dashboardRaca', 'dashboardClasse', 'dashboardNivel'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    const campo = id.replace('dashboard', '').toLowerCase();
                    this.estado.identificacao[campo] = e.target.value;
                });
            }
        });
        
        // Descrição com contador
        const descricao = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        if (descricao && contador) {
            descricao.addEventListener('input', (e) => {
                this.estado.identificacao.descricao = e.target.value;
                contador.textContent = e.target.value.length;
            });
        }
    }

    // ================ BOTÕES PV/PF ================
    configurarBotoesVitalidade() {
        console.log('❤️ Configurando botões PV/PF');
        
        // Botão PV +
        const btnPVMais = document.getElementById('btnPVMais');
        if (btnPVMais) {
            btnPVMais.addEventListener('click', () => this.ajustarPV(1));
        }
        
        // Botão PV -
        const btnPVMenos = document.getElementById('btnPVMenos');
        if (btnPVMenos) {
            btnPVMenos.addEventListener('click', () => this.ajustarPV(-1));
        }
        
        // Botão PF +
        const btnPFMais = document.getElementById('btnPFMais');
        if (btnPFMais) {
            btnPFMais.addEventListener('click', () => this.ajustarPF(1));
        }
        
        // Botão PF -
        const btnPFMenos = document.getElementById('btnPFMenos');
        if (btnPFMenos) {
            btnPFMenos.addEventListener('click', () => this.ajustarPF(-1));
        }
        
        // Barras clicáveis
        ['barraPV', 'barraPF'].forEach(id => {
            const barra = document.getElementById(id);
            if (barra) {
                barra.addEventListener('click', (e) => this.clicarBarraVitalidade(id, e));
            }
        });
    }

    ajustarPV(valor) {
        const novoPV = this.estado.atributos.PV.atual + valor;
        this.estado.atributos.PV.atual = Math.max(0, Math.min(novoPV, this.estado.atributos.PV.max));
        this.atualizarDisplayVitalidade();
    }

    ajustarPF(valor) {
        const novoPF = this.estado.atributos.PF.atual + valor;
        this.estado.atributos.PF.atual = Math.max(0, Math.min(novoPF, this.estado.atributos.PF.max));
        this.atualizarDisplayVitalidade();
    }

    clicarBarraVitalidade(tipo, e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percentual = (e.clientX - rect.left) / rect.width;
        
        if (tipo === 'barraPV') {
            const novoValor = Math.round(percentual * this.estado.atributos.PV.max);
            this.estado.atributos.PV.atual = Math.max(0, Math.min(novoValor, this.estado.atributos.PV.max));
        } else if (tipo === 'barraPF') {
            const novoValor = Math.round(percentual * this.estado.atributos.PF.max);
            this.estado.atributos.PF.atual = Math.max(0, Math.min(novoValor, this.estado.atributos.PF.max));
        }
        
        this.atualizarDisplayVitalidade();
    }

    // ================ SISTEMA DE FOTO ================
    configurarSistemaFoto() {
        const fotoUpload = document.getElementById('fotoUpload');
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        const btnRemover = document.getElementById('btnRemoverFoto');
        
        if (!fotoUpload || !fotoPreview) return;
        
        // Upload
        fotoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoPreview.src = e.target.result;
                    fotoPreview.style.display = 'block';
                    if (fotoPlaceholder) fotoPlaceholder.style.display = 'none';
                    if (btnRemover) btnRemover.style.display = 'inline-block';
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Remover
        if (btnRemover) {
            btnRemover.addEventListener('click', () => {
                fotoPreview.src = '';
                fotoPreview.style.display = 'none';
                if (fotoPlaceholder) fotoPlaceholder.style.display = 'flex';
                btnRemover.style.display = 'none';
                fotoUpload.value = '';
            });
        }
    }

    // ================ MONITORAMENTO ================
    iniciarMonitoramento() {
        // Monitorar atributos ST, DX, IQ, HT
        setInterval(() => {
            this.monitorarAtributos();
        }, 500);
    }

    monitorarAtributos() {
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            const input = document.getElementById(atributo);
            if (input) {
                const valor = parseInt(input.value) || 10;
                if (this.estado.atributos[atributo] !== valor) {
                    this.estado.atributos[atributo] = valor;
                    this.atualizarSaldo();
                    this.atualizarMaximos();
                }
            }
        });
    }

    // ================ CÁLCULOS ================
    atualizarMaximos() {
        // Atualizar máximos baseados em ST e HT
        this.estado.atributos.PV.max = this.estado.atributos.ST;
        this.estado.atributos.PF.max = this.estado.atributos.HT;
        
        // Ajustar valores atuais se necessário
        if (this.estado.atributos.PV.atual > this.estado.atributos.PV.max) {
            this.estado.atributos.PV.atual = this.estado.atributos.PV.max;
        }
        if (this.estado.atributos.PF.atual > this.estado.atributos.PF.max) {
            this.estado.atributos.PF.atual = this.estado.atributos.PF.max;
        }
    }

    atualizarSaldo() {
        // Cálculo dos pontos gastos em atributos
        const stCusto = (this.estado.atributos.ST - 10) * 10;
        const dxCusto = (this.estado.atributos.DX - 10) * 20;
        const iqCusto = (this.estado.atributos.IQ - 10) * 20;
        const htCusto = (this.estado.atributos.HT - 10) * 10;
        
        const gastosAtributos = stCusto + dxCusto + iqCusto + htCusto;
        const saldo = this.estado.pontos.total - gastosAtributos;
        
        this.estado.pontos.saldoDisponivel = saldo;
        this.atualizarDisplay();
    }

    // ================ CARREGAR VALORES ================
    carregarValoresIniciais() {
        // Carregar valores dos inputs se existirem
        const pontosInput = document.getElementById('pontosTotais');
        if (pontosInput) {
            this.estado.pontos.total = parseInt(pontosInput.value) || 150;
        }
        
        const limiteInput = document.getElementById('limiteDesvantagens');
        if (limiteInput) {
            this.estado.pontos.limiteDesvantagens = parseInt(limiteInput.value) || -50;
        }
        
        // Atualizar máximos
        this.atualizarMaximos();
    }

    // ================ ATUALIZAÇÕES DE DISPLAY ================
    atualizarDisplay() {
        // Saldo
        const saldoEl = document.getElementById('saldoDisponivel');
        if (saldoEl) {
            saldoEl.textContent = this.estado.pontos.saldoDisponivel;
        }
        
        // Atributos
        ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
            const el = document.getElementById(`atributo${atributo}`);
            if (el) {
                el.textContent = this.estado.atributos[atributo];
            }
        });
    }

    atualizarDisplayVitalidade() {
        // PV
        const valorPV = document.getElementById('valorPV');
        if (valorPV) {
            valorPV.textContent = `${this.estado.atributos.PV.atual}/${this.estado.atributos.PV.max}`;
        }
        
        const barraPV = document.getElementById('barraPV');
        if (barraPV) {
            const porcentagemPV = (this.estado.atributos.PV.atual / this.estado.atributos.PV.max) * 100;
            barraPV.style.width = `${porcentagemPV}%`;
        }
        
        // PF
        const valorPF = document.getElementById('valorPF');
        if (valorPF) {
            valorPF.textContent = `${this.estado.atributos.PF.atual}/${this.estado.atributos.PF.max}`;
        }
        
        const barraPF = document.getElementById('barraPF');
        if (barraPF) {
            const porcentagemPF = (this.estado.atributos.PF.atual / this.estado.atributos.PF.max) * 100;
            barraPF.style.width = `${porcentagemPF}%`;
        }
    }

    atualizarTudo() {
        this.atualizarSaldo();
        this.atualizarDisplay();
        this.atualizarDisplayVitalidade();
    }

    // ================ GETTERS ================
    getEstado() {
        return this.estado;
    }

    getPontos() {
        return this.estado.pontos;
    }

    // ================ EVENTOS EXTERNOS ================
    configurarEventosExternos() {
        document.addEventListener('aparenciaAtualizada', (e) => {
            if (e.detail && e.detail.pontos !== undefined) {
                this.estado.caracteristicas.aparência = e.detail.pontos;
                this.atualizarSaldo();
            }
        });
    }
}

// ================ INICIALIZAÇÃO GLOBAL ================
(function() {
    let dashboardInstance = null;
    
    function inicializarDashboard() {
        if (!dashboardInstance) {
            dashboardInstance = new DashboardManager();
            window.dashboardManager = dashboardInstance;
            
            setTimeout(() => {
                dashboardInstance.inicializar();
                dashboardInstance.configurarEventosExternos();
            }, 800);
        }
        return dashboardInstance;
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarDashboard);
    } else {
        setTimeout(inicializarDashboard, 500);
    }
    
    window.DashboardManager = DashboardManager;
    window.inicializarDashboard = inicializarDashboard;
})();

// ================ FUNÇÕES GLOBAIS ================
window.ajustarPV = function(valor) {
    const dashboard = window.dashboardManager;
    if (dashboard) {
        dashboard.ajustarPV(valor);
    } else {
        console.warn('DashboardManager não inicializado');
    }
};

window.ajustarPF = function(valor) {
    const dashboard = window.dashboardManager;
    if (dashboard) {
        dashboard.ajustarPF(valor);
    } else {
        console.warn('DashboardManager não inicializado');
    }
};

console.log('📊 Dashboard.js carregado e pronto!');