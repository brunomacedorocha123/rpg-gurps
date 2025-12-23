// dashboard.js - COMPLETO E FUNCIONAL
// ATUALIZA AUTOMATICAMENTE OS CARDS DE RESUMO

// ===== SISTEMA PRINCIPAL =====
class DashboardManager {
    constructor() {
        console.log('📊 DashboardManager criado');
        this.pontos = {
            gastosAtributos: 0,
            gastosVantagens: 0,
            gastosDesvantagens: 0,
            gastosPericias: 0,
            gastosMagias: 0,
            gastosTecnicas: 0,
            gastosPeculiaridades: 0
        };
        this.inicializado = false;
    }

    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 Inicializando DashboardManager...');
        
        // Configurar todos os componentes
        this.configurarFoto();
        this.configurarContadorDescricao();
        this.configurarPontos();
        this.configurarBotoes();
        this.configurarOuvintes();
        
        // Forçar atualização inicial
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('✅ DashboardManager pronto!');
    }

    // ===== CONFIGURAÇÕES BÁSICAS =====
    configurarFoto() {
        const fotoUpload = document.getElementById('fotoUpload');
        const btnRemover = document.getElementById('btnRemoverFoto');
        const preview = document.getElementById('fotoPreview');
        const placeholder = document.getElementById('fotoPlaceholder');
        
        if (!fotoUpload || !btnRemover || !preview || !placeholder) return;
        
        fotoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                    placeholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
        
        btnRemover.addEventListener('click', () => {
            preview.src = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            fotoUpload.value = '';
        });
    }

    configurarContadorDescricao() {
        const descricao = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        
        if (descricao && contador) {
            contador.textContent = descricao.value.length;
            descricao.addEventListener('input', () => {
                contador.textContent = descricao.value.length;
            });
        }
    }

    configurarPontos() {
        const pontosTotais = document.getElementById('pontosTotais');
        const limiteDesvantagens = document.getElementById('limiteDesvantagens');
        
        if (pontosTotais) {
            pontosTotais.addEventListener('input', () => {
                this.atualizarSaldoDisponivel();
            });
        }
        
        if (limiteDesvantagens) {
            limiteDesvantagens.addEventListener('input', () => {
                // Apenas atualiza o valor
            });
        }
    }

    configurarBotoes() {
        // Botões de PV
        const btnPVDiminuir = document.querySelector('[onclick*="ajustarPV(-1)"]');
        const btnPVAumentar = document.querySelector('[onclick*="ajustarPV(1)"]');
        
        if (btnPVDiminuir) {
            btnPVDiminuir.addEventListener('click', (e) => {
                e.preventDefault();
                this.ajustarPV(-1);
            });
        }
        
        if (btnPVAumentar) {
            btnPVAumentar.addEventListener('click', (e) => {
                e.preventDefault();
                this.ajustarPV(1);
            });
        }
        
        // Botões de PF
        const btnPFDiminuir = document.querySelector('[onclick*="ajustarPF(-1)"]');
        const btnPFAumentar = document.querySelector('[onclick*="ajustarPF(1)"]');
        
        if (btnPFDiminuir) {
            btnPFDiminuir.addEventListener('click', (e) => {
                e.preventDefault();
                this.ajustarPF(-1);
            });
        }
        
        if (btnPFAumentar) {
            btnPFAumentar.addEventListener('click', (e) => {
                e.preventDefault();
                this.ajustarPF(1);
            });
        }
    }

    // ===== OUVINTES DE EVENTOS =====
    configurarOuvintes() {
        // Ouvir eventos de atributos
        document.addEventListener('atributosAlterados', (e) => {
            console.log('📥 Dashboard: Recebendo atributos', e.detail);
            this.atualizarComAtributos(e.detail);
        });
        
        // Ouvir eventos de características
        document.addEventListener('caracteristicasAtualizadas', (e) => {
            console.log('📥 Dashboard: Recebendo características', e.detail);
            this.atualizarComCaracteristicas(e.detail);
        });
    }

    // ===== ATUALIZAÇÕES COM DADOS EXTERNOS =====
    atualizarComAtributos(dados) {
        if (!dados) return;
        
        // Atualizar valores dos atributos
        if (dados.ST) document.getElementById('atributoST').textContent = dados.ST;
        if (dados.DX) document.getElementById('atributoDX').textContent = dados.DX;
        if (dados.IQ) document.getElementById('atributoIQ').textContent = dados.IQ;
        if (dados.HT) document.getElementById('atributoHT').textContent = dados.HT;
        
        // Atualizar PV/PF
        if (dados.PV) {
            const pvElement = document.getElementById('valorPV');
            if (pvElement) pvElement.textContent = `${dados.PV}/${dados.PV}`;
        }
        
        if (dados.PF) {
            const pfElement = document.getElementById('valorPF');
            if (pfElement) pfElement.textContent = `${dados.PF}/${dados.PF}`;
        }
        
        // ATUALIZAR CARD DE ATRIBUTOS
        if (dados.pontosGastos !== undefined) {
            this.pontos.gastosAtributos = dados.pontosGastos;
            this.atualizarCard('gastosAtributos', dados.pontosGastos);
            this.atualizarTotalLiquido();
            this.atualizarSaldoDisponivel();
        }
    }

    atualizarComCaracteristicas(dados) {
        if (!dados) return;
        
        // ATUALIZAR CARD DE PECULIARIDADES (onde vão as características)
        if (dados.total !== undefined) {
            this.pontos.gastosPeculiaridades = dados.total;
            this.atualizarCard('gastosPeculiaridades', dados.total);
            this.atualizarTotalLiquido();
            this.atualizarSaldoDisponivel();
        }
    }

    // ===== ATUALIZAÇÃO DE CARDS =====
    atualizarCard(idCard, valor) {
        const elemento = document.getElementById(idCard);
        if (!elemento) {
            console.warn(`⚠️ Card não encontrado: ${idCard}`);
            return;
        }
        
        elemento.textContent = valor;
        this.aplicarEstilo(elemento, valor);
    }

    aplicarEstilo(elemento, valor) {
        if (valor > 0) {
            elemento.style.color = '#2ecc71';
            elemento.style.fontWeight = 'bold';
        } else if (valor < 0) {
            elemento.style.color = '#e74c3c';
            elemento.style.fontWeight = 'bold';
        } else {
            elemento.style.color = '#95a5a6';
            elemento.style.fontWeight = 'normal';
        }
    }

    // ===== CÁLCULOS =====
    calcularTotalGastos() {
        return Object.values(this.pontos).reduce((total, valor) => total + valor, 0);
    }

    atualizarTotalLiquido() {
        const totalLiquido = document.getElementById('totalLiquido');
        if (!totalLiquido) return;
        
        const total = this.calcularTotalGastos();
        totalLiquido.textContent = total;
        this.aplicarEstilo(totalLiquido, total);
    }

    atualizarSaldoDisponivel() {
        const saldoElement = document.getElementById('saldoDisponivel');
        const pontosTotais = document.getElementById('pontosTotais');
        
        if (!saldoElement || !pontosTotais) return;
        
        const pontos = parseInt(pontosTotais.value) || 150;
        const gastos = this.calcularTotalGastos();
        const saldo = pontos - gastos;
        
        saldoElement.textContent = saldo;
        
        if (saldo < 0) {
            saldoElement.style.color = '#e74c3c';
            saldoElement.style.fontWeight = 'bold';
        } else if (saldo === 0) {
            saldoElement.style.color = '#f39c12';
            saldoElement.style.fontWeight = 'bold';
        } else {
            saldoElement.style.color = '#2ecc71';
            saldoElement.style.fontWeight = 'normal';
        }
    }

    // ===== FUNÇÕES DE CONTROLE =====
    ajustarPV(valor) {
        const pvElement = document.getElementById('valorPV');
        if (!pvElement) return;
        
        const partes = pvElement.textContent.split('/');
        let atual = parseInt(partes[0]) || 10;
        let maximo = parseInt(partes[1]) || 10;
        
        atual = Math.max(0, Math.min(maximo, atual + valor));
        pvElement.textContent = `${atual}/${maximo}`;
        
        // Atualizar barra
        const barraPV = document.getElementById('barraPV');
        if (barraPV) {
            const porcentagem = (atual / maximo) * 100;
            barraPV.style.width = `${porcentagem}%`;
        }
    }

    ajustarPF(valor) {
        const pfElement = document.getElementById('valorPF');
        if (!pfElement) return;
        
        const partes = pfElement.textContent.split('/');
        let atual = parseInt(partes[0]) || 10;
        let maximo = parseInt(partes[1]) || 10;
        
        atual = Math.max(0, Math.min(maximo, atual + valor));
        pfElement.textContent = `${atual}/${maximo}`;
        
        // Atualizar barra
        const barraPF = document.getElementById('barraPF');
        if (barraPF) {
            const porcentagem = (atual / maximo) * 100;
            barraPF.style.width = `${porcentagem}%`;
        }
    }

    // ===== FUNÇÃO PRINCIPAL =====
    atualizarTudo() {
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
    }

    // ===== FUNÇÕES PARA SALVAR/CARREGAR =====
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
            atributos: {
                ST: parseInt(document.getElementById('atributoST')?.textContent) || 10,
                DX: parseInt(document.getElementById('atributoDX')?.textContent) || 10,
                IQ: parseInt(document.getElementById('atributoIQ')?.textContent) || 10,
                HT: parseInt(document.getElementById('atributoHT')?.textContent) || 10,
                PV: parseInt(document.getElementById('valorPV')?.textContent.split('/')[0]) || 10,
                PF: parseInt(document.getElementById('valorPF')?.textContent.split('/')[0]) || 10
            },
            gastos: this.pontos,
            foto: document.getElementById('fotoPreview')?.src || ''
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        // Carregar identificação
        if (dados.identificacao) {
            const id = dados.identificacao;
            if (document.getElementById('dashboardRaca') && id.raca) 
                document.getElementById('dashboardRaca').value = id.raca;
            if (document.getElementById('dashboardClasse') && id.classe) 
                document.getElementById('dashboardClasse').value = id.classe;
            if (document.getElementById('dashboardNivel') && id.nivel) 
                document.getElementById('dashboardNivel').value = id.nivel;
            if (document.getElementById('dashboardDescricao') && id.descricao) {
                document.getElementById('dashboardDescricao').value = id.descricao;
                const contador = document.getElementById('contadorDescricao');
                if (contador) contador.textContent = id.descricao.length;
            }
        }
        
        // Carregar pontos
        if (dados.pontos) {
            if (document.getElementById('pontosTotais')) 
                document.getElementById('pontosTotais').value = dados.pontos.total || 150;
            if (document.getElementById('limiteDesvantagens')) 
                document.getElementById('limiteDesvantagens').value = dados.pontos.limiteDesvantagens || -50;
        }
        
        // Carregar atributos
        if (dados.atributos) {
            const attr = dados.atributos;
            if (document.getElementById('atributoST')) 
                document.getElementById('atributoST').textContent = attr.ST || 10;
            if (document.getElementById('atributoDX')) 
                document.getElementById('atributoDX').textContent = attr.DX || 10;
            if (document.getElementById('atributoIQ')) 
                document.getElementById('atributoIQ').textContent = attr.IQ || 10;
            if (document.getElementById('atributoHT')) 
                document.getElementById('atributoHT').textContent = attr.HT || 10;
            if (document.getElementById('valorPV')) 
                document.getElementById('valorPV').textContent = `${attr.PV || 10}/${attr.PV || 10}`;
            if (document.getElementById('valorPF')) 
                document.getElementById('valorPF').textContent = `${attr.PF || 10}/${attr.PF || 10}`;
        }
        
        // Carregar gastos
        if (dados.gastos) {
            this.pontos = { ...dados.gastos };
            
            // Atualizar cards
            Object.keys(this.pontos).forEach(chave => {
                const idCard = 'gastos' + chave.charAt(0).toUpperCase() + chave.slice(1);
                this.atualizarCard(idCard, this.pontos[chave]);
            });
        }
        
        // Carregar foto
        if (dados.foto && dados.foto !== '' && document.getElementById('fotoPreview')) {
            document.getElementById('fotoPreview').src = dados.foto;
            document.getElementById('fotoPreview').style.display = 'block';
            document.getElementById('fotoPlaceholder').style.display = 'none';
        }
        
        // Atualizar tudo
        this.atualizarTudo();
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
(function() {
    console.log('📁 Carregando DashboardManager...');
    
    // Criar instância global
    window.dashboardManager = new DashboardManager();
    
    // Inicializar quando a aba for aberta
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('[data-tab="dashboard"]');
        if (tabBtn && !window.dashboardManager.inicializado) {
            setTimeout(() => window.dashboardManager.inicializar(), 300);
        }
    });
    
    // Tentar inicializar automaticamente
    setTimeout(() => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active') && !window.dashboardManager.inicializado) {
            window.dashboardManager.inicializar();
        }
    }, 1000);
    
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
    
    window.testarDashboard = function() {
        console.log('🧪 TESTANDO DASHBOARD');
        console.log('Estado:', window.dashboardManager?.pontos);
        
        // Simular evento de atributos
        const evento = new CustomEvent('atributosAlterados', {
            detail: {
                ST: 12,
                DX: 14,
                IQ: 13,
                HT: 11,
                PV: 12,
                PF: 11,
                pontosGastos: 60
            }
        });
        document.dispatchEvent(evento);
        
        // Verificar cards
        const cards = ['gastosAtributos', 'gastosPeculiaridades', 'totalLiquido', 'saldoDisponivel'];
        cards.forEach(id => {
            const el = document.getElementById(id);
            console.log(`${id}:`, el?.textContent);
        });
    };
})();

console.log('✅ DashboardManager carregado!');