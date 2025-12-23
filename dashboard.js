// dashboard.js - VERSÃO 100% FUNCIONAL
class DashboardManager {
    constructor() {
        console.log('🔥 DashboardManager criado');
        this.estado = {
            pontos: { total: 150, saldoDisponivel: 150 },
            caracteristicas: { aparência: 0 },
            atributos: { ST: 10, DX: 10, IQ: 10, HT: 10 },
            identificacao: { raca: '', classe: '' },
            financeiro: { riqueza: 'Médio' }
        };
        this.inicializado = false;
    }

    // ================ MÉTODO PRINCIPAL ================
    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 INICIANDO DASHBOARD');
        
        // 1. VERIFICAR SE OS ELEMENTOS EXISTEM
        this.verificarElementos();
        
        // 2. CONFIGURAR EVENTOS BÁSICOS
        this.configurarEventosBasicos();
        
        // 3. CONFIGURAR FOTO
        this.configurarSistemaFoto();
        
        // 4. INICIAR MONITORAMENTO
        this.iniciarMonitoramento();
        
        // 5. ATUALIZAR TUDO
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('✅ Dashboard inicializada!');
    }

    // ================ VERIFICAÇÃO ================
    verificarElementos() {
        console.log('🔍 Verificando elementos:');
        const elementos = [
            'dashboardRaca', 'dashboardClasse', 'dashboardNivel',
            'dashboardDescricao', 'pontosTotais', 'limiteDesvantagens',
            'saldoDisponivel', 'fotoUpload', 'fotoPreview'
        ];
        
        elementos.forEach(id => {
            const el = document.getElementById(id);
            if (!el) console.warn(`⚠️ Elemento #${id} não encontrado!`);
        });
    }

    // ================ EVENTOS BÁSICOS ================
    configurarEventosBasicos() {
        console.log('⚙️ Configurando eventos básicos');
        
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
        
        // Drag & drop
        const fotoWrapper = document.getElementById('fotoWrapper');
        if (fotoWrapper) {
            fotoWrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
                fotoWrapper.style.borderColor = 'var(--primary-gold)';
            });
            
            fotoWrapper.addEventListener('dragleave', () => {
                fotoWrapper.style.borderColor = '';
            });
            
            fotoWrapper.addEventListener('drop', (e) => {
                e.preventDefault();
                fotoWrapper.style.borderColor = '';
                if (e.dataTransfer.files[0]) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(e.dataTransfer.files[0]);
                    fotoUpload.files = dataTransfer.files;
                    fotoUpload.dispatchEvent(new Event('change'));
                }
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
                }
            }
        });
    }

    // ================ ATUALIZAÇÕES ================
    atualizarSaldo() {
        // Cálculo simples dos pontos gastos em atributos
        const stCusto = (this.estado.atributos.ST - 10) * 10;
        const dxCusto = (this.estado.atributos.DX - 10) * 20;
        const iqCusto = (this.estado.atributos.IQ - 10) * 20;
        const htCusto = (this.estado.atributos.HT - 10) * 10;
        
        const gastosAtributos = stCusto + dxCusto + iqCusto + htCusto;
        const saldo = this.estado.pontos.total - gastosAtributos;
        
        this.estado.pontos.saldoDisponivel = saldo;
        
        // Atualizar display
        this.atualizarDisplay();
    }

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

    atualizarTudo() {
        this.atualizarSaldo();
        this.atualizarDisplay();
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
        // Quando aparência for atualizada
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
            
            // Esperar um pouco antes de inicializar
            setTimeout(() => {
                dashboardInstance.inicializar();
                dashboardInstance.configurarEventosExternos();
            }, 800);
        }
        return dashboardInstance;
    }
    
    // Inicializar quando o DOM carregar
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inicializarDashboard);
    } else {
        setTimeout(inicializarDashboard, 500);
    }
    
    // Expor para uso global
    window.DashboardManager = DashboardManager;
    window.inicializarDashboard = inicializarDashboard;
})();

// ================ FUNÇÕES GLOBAIS ================
window.ajustarPV = function(valor) {
    console.log(`Ajustar PV: ${valor}`);
    // Implementação básica
    const pvEl = document.getElementById('valorPV');
    if (pvEl) {
        const partes = pvEl.textContent.split('/');
        let atual = parseInt(partes[0]) || 10;
        const max = parseInt(partes[1]) || 10;
        atual = Math.max(0, Math.min(atual + valor, max));
        pvEl.textContent = `${atual}/${max}`;
        
        // Atualizar barra
        const barra = document.getElementById('barraPV');
        if (barra) {
            const porcentagem = (atual / max) * 100;
            barra.style.width = `${porcentagem}%`;
        }
    }
};

window.ajustarPF = function(valor) {
    console.log(`Ajustar PF: ${valor}`);
    // Implementação básica
    const pfEl = document.getElementById('valorPF');
    if (pfEl) {
        const partes = pfEl.textContent.split('/');
        let atual = parseInt(partes[0]) || 10;
        const max = parseInt(partes[1]) || 10;
        atual = Math.max(0, Math.min(atual + valor, max));
        pfEl.textContent = `${atual}/${max}`;
        
        // Atualizar barra
        const barra = document.getElementById('barraPF');
        if (barra) {
            const porcentagem = (atual / max) * 100;
            barra.style.width = `${porcentagem}%`;
        }
    }
};

console.log('📊 Dashboard.js carregado e pronto!');