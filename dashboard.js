// ================ DASHBOARD MANAGER - COMPLETO ================
class DashboardManager {
    constructor() {
        console.log('📊 DashboardManager inicializado');
        this.estado = {
            pontosGastosAtributos: 0,
            pontosGastosCaracteristicas: 0,
            pontosGastosVantagens: 0,
            pontosGastosDesvantagens: 0,
            pontosGastosPericias: 0,
            pontosGastosMagias: 0,
            pontosGastosTecnicas: 0,
            pontosGastosPeculiaridades: 0
        };
        this.inicializado = false;
    }

    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 DashboardManager: Inicializando...');
        
        this.configurarFotoPersonagem();
        this.configurarContadorDescricao();
        this.configurarControlePontos();
        this.configurarBotoesVitalidade();
        this.configurarOuvintes();
        
        this.inicializado = true;
        console.log('✅ DashboardManager: Pronto!');
    }

    configurarFotoPersonagem() {
        const fotoUpload = document.getElementById('fotoUpload');
        const btnRemoverFoto = document.getElementById('btnRemoverFoto');
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        
        if (!fotoUpload || !btnRemoverFoto || !fotoPreview || !fotoPlaceholder) {
            console.warn('⚠️ Elementos de foto não encontrados');
            return;
        }
        
        fotoUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    fotoPreview.src = event.target.result;
                    fotoPreview.style.display = 'block';
                    fotoPlaceholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
        
        btnRemoverFoto.addEventListener('click', () => {
            fotoPreview.src = '';
            fotoPreview.style.display = 'none';
            fotoPlaceholder.style.display = 'flex';
            fotoUpload.value = '';
        });
    }

    configurarContadorDescricao() {
        const descricaoInput = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        
        if (descricaoInput && contador) {
            contador.textContent = descricaoInput.value.length;
            descricaoInput.addEventListener('input', () => {
                contador.textContent = descricaoInput.value.length;
            });
        }
    }

    configurarControlePontos() {
        const pontosTotais = document.getElementById('pontosTotais');
        const limiteDesvantagens = document.getElementById('limiteDesvantagens');
        
        if (pontosTotais) {
            pontosTotais.addEventListener('change', () => {
                this.atualizarSaldoDisponivel();
            });
        }
        
        if (limiteDesvantagens) {
            limiteDesvantagens.addEventListener('change', () => {
                // Apenas armazena o valor
            });
        }
    }

    configurarBotoesVitalidade() {
        // PV
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
        
        // PF
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

    configurarOuvintes() {
        // Ouvir eventos de atributos
        document.addEventListener('atributosAlterados', (e) => {
            this.processarAtributosAlterados(e.detail);
        });
        
        // Ouvir eventos de características
        document.addEventListener('caracteristicasAtualizadas', (e) => {
            this.processarCaracteristicasAtualizadas(e.detail);
        });
    }

    processarAtributosAlterados(detalhes) {
        console.log('📥 Dashboard: Processando atributos alterados', detalhes);
        
        // Atualizar valores dos atributos
        if (detalhes.ST) document.getElementById('atributoST').textContent = detalhes.ST;
        if (detalhes.DX) document.getElementById('atributoDX').textContent = detalhes.DX;
        if (detalhes.IQ) document.getElementById('atributoIQ').textContent = detalhes.IQ;
        if (detalhes.HT) document.getElementById('atributoHT').textContent = detalhes.HT;
        
        // Atualizar PV/PF
        if (detalhes.PV) {
            const valorPV = document.getElementById('valorPV');
            if (valorPV) valorPV.textContent = `${detalhes.PV}/${detalhes.PV}`;
        }
        
        if (detalhes.PF) {
            const valorPF = document.getElementById('valorPF');
            if (valorPF) valorPF.textContent = `${detalhes.PF}/${detalhes.PF}`;
        }
        
        // Atualizar pontos gastos em atributos
        if (detalhes.pontosGastos !== undefined) {
            this.estado.pontosGastosAtributos = detalhes.pontosGastos;
            this.atualizarCardPontos('gastosAtributos', detalhes.pontosGastos);
            this.atualizarTotalLiquido();
            this.atualizarSaldoDisponivel();
        }
    }

    processarCaracteristicasAtualizadas(detalhes) {
        console.log('📥 Dashboard: Processando características atualizadas', detalhes);
        
        if (detalhes && detalhes.total !== undefined) {
            this.estado.pontosGastosPeculiaridades = detalhes.total;
            this.atualizarCardPontos('gastosPeculiaridades', detalhes.total);
            this.atualizarTotalLiquido();
            this.atualizarSaldoDisponivel();
        }
    }

    atualizarCardPontos(idCard, valor) {
        const elemento = document.getElementById(idCard);
        if (!elemento) {
            console.warn(`⚠️ Card não encontrado: ${idCard}`);
            return;
        }
        
        elemento.textContent = valor;
        
        // Aplicar estilo
        elemento.classList.remove('positivo', 'negativo', 'neutro');
        if (valor > 0) {
            elemento.classList.add('positivo');
        } else if (valor < 0) {
            elemento.classList.add('negativo');
        } else {
            elemento.classList.add('neutro');
        }
    }

    atualizarTotalLiquido() {
        const totalLiquido = document.getElementById('totalLiquido');
        if (!totalLiquido) return;
        
        const total = 
            this.estado.pontosGastosAtributos +
            this.estado.pontosGastosVantagens +
            this.estado.pontosGastosDesvantagens +
            this.estado.pontosGastosPericias +
            this.estado.pontosGastosMagias +
            this.estado.pontosGastosTecnicas +
            this.estado.pontosGastosPeculiaridades;
        
        totalLiquido.textContent = total;
        this.aplicarEstiloPontos(totalLiquido, total);
    }

    atualizarSaldoDisponivel() {
        const saldoDisponivel = document.getElementById('saldoDisponivel');
        const pontosTotais = document.getElementById('pontosTotais');
        
        if (!saldoDisponivel || !pontosTotais) return;
        
        const pontosDisponiveis = parseInt(pontosTotais.value) || 150;
        const totalGasto = this.calcularTotalGasto();
        const saldo = pontosDisponiveis - totalGasto;
        
        saldoDisponivel.textContent = saldo;
        
        if (saldo < 0) {
            saldoDisponivel.style.color = '#e74c3c';
            saldoDisponivel.style.fontWeight = 'bold';
        } else if (saldo === 0) {
            saldoDisponivel.style.color = '#f39c12';
            saldoDisponivel.style.fontWeight = 'bold';
        } else {
            saldoDisponivel.style.color = '#2ecc71';
            saldoDisponivel.style.fontWeight = 'normal';
        }
    }

    calcularTotalGasto() {
        return Object.values(this.estado).reduce((total, valor) => total + valor, 0);
    }

    aplicarEstiloPontos(elemento, valor) {
        if (!elemento) return;
        
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

    ajustarPV(valor) {
        const valorPV = document.getElementById('valorPV');
        if (!valorPV) return;
        
        const partes = valorPV.textContent.split('/');
        let atual = parseInt(partes[0]) || 10;
        let maximo = parseInt(partes[1]) || 10;
        
        atual = Math.max(0, Math.min(maximo, atual + valor));
        valorPV.textContent = `${atual}/${maximo}`;
        
        // Atualizar barra
        const barraPV = document.getElementById('barraPV');
        if (barraPV) {
            const porcentagem = (atual / maximo) * 100;
            barraPV.style.width = `${porcentagem}%`;
        }
    }

    ajustarPF(valor) {
        const valorPF = document.getElementById('valorPF');
        if (!valorPF) return;
        
        const partes = valorPF.textContent.split('/');
        let atual = parseInt(partes[0]) || 10;
        let maximo = parseInt(partes[1]) || 10;
        
        atual = Math.max(0, Math.min(maximo, atual + valor));
        valorPF.textContent = `${atual}/${maximo}`;
        
        // Atualizar barra
        const barraPF = document.getElementById('barraPF');
        if (barraPF) {
            const porcentagem = (atual / maximo) * 100;
            barraPF.style.width = `${porcentagem}%`;
        }
    }

    // ================ FUNÇÕES DE PERSISTÊNCIA ================
    coletarDadosParaSalvar() {
        return {
            dashboard: {
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
                gastos: this.estado,
                foto: document.getElementById('fotoPreview')?.src || ''
            }
        };
    }

    carregarDados(dados) {
        if (!dados?.dashboard) return;
        
        console.log('📥 Dashboard: Carregando dados', dados);
        
        // Identificação
        const identificacao = dados.dashboard.identificacao;
        if (identificacao) {
            if (document.getElementById('dashboardRaca') && identificacao.raca) 
                document.getElementById('dashboardRaca').value = identificacao.raca;
            if (document.getElementById('dashboardClasse') && identificacao.classe) 
                document.getElementById('dashboardClasse').value = identificacao.classe;
            if (document.getElementById('dashboardNivel') && identificacao.nivel) 
                document.getElementById('dashboardNivel').value = identificacao.nivel;
            if (document.getElementById('dashboardDescricao') && identificacao.descricao) {
                document.getElementById('dashboardDescricao').value = identificacao.descricao;
                const contador = document.getElementById('contadorDescricao');
                if (contador) contador.textContent = identificacao.descricao.length;
            }
        }
        
        // Pontos
        const pontos = dados.dashboard.pontos;
        if (pontos) {
            if (document.getElementById('pontosTotais')) 
                document.getElementById('pontosTotais').value = pontos.total || 150;
            if (document.getElementById('limiteDesvantagens')) 
                document.getElementById('limiteDesvantagens').value = pontos.limiteDesvantagens || -50;
        }
        
        // Atributos
        const atributos = dados.dashboard.atributos;
        if (atributos) {
            if (document.getElementById('atributoST')) 
                document.getElementById('atributoST').textContent = atributos.ST || 10;
            if (document.getElementById('atributoDX')) 
                document.getElementById('atributoDX').textContent = atributos.DX || 10;
            if (document.getElementById('atributoIQ')) 
                document.getElementById('atributoIQ').textContent = atributos.IQ || 10;
            if (document.getElementById('atributoHT')) 
                document.getElementById('atributoHT').textContent = atributos.HT || 10;
            if (document.getElementById('valorPV')) 
                document.getElementById('valorPV').textContent = `${atributos.PV || 10}/${atributos.PV || 10}`;
            if (document.getElementById('valorPF')) 
                document.getElementById('valorPF').textContent = `${atributos.PF || 10}/${atributos.PF || 10}`;
        }
        
        // Gastos
        const gastos = dados.dashboard.gastos;
        if (gastos) {
            this.estado = { ...gastos };
            
            // Atualizar cards
            this.atualizarCardPontos('gastosAtributos', gastos.pontosGastosAtributos || 0);
            this.atualizarCardPontos('gastosVantagens', gastos.pontosGastosVantagens || 0);
            this.atualizarCardPontos('gastosDesvantagens', gastos.pontosGastosDesvantagens || 0);
            this.atualizarCardPontos('gastosPericias', gastos.pontosGastosPericias || 0);
            this.atualizarCardPontos('gastosMagias', gastos.pontosGastosMagias || 0);
            this.atualizarCardPontos('gastosTecnicas', gastos.pontosGastosTecnicas || 0);
            this.atualizarCardPontos('gastosPeculiaridades', gastos.pontosGastosPeculiaridades || 0);
        }
        
        // Foto
        const foto = dados.dashboard.foto;
        if (foto && document.getElementById('fotoPreview') && foto !== '') {
            document.getElementById('fotoPreview').src = foto;
            document.getElementById('fotoPreview').style.display = 'block';
            document.getElementById('fotoPlaceholder').style.display = 'none';
        }
        
        // Atualizar totais
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
    }

    // ================ FUNÇÃO PARA TESTE ================
    testarDashboard() {
        console.log('🧪 TESTANDO DASHBOARD:');
        console.log('Estado:', this.estado);
        console.log('Inicializado:', this.inicializado);
        
        // Verificar elementos críticos
        const elementos = [
            'gastosAtributos',
            'gastosPeculiaridades',
            'totalLiquido',
            'saldoDisponivel',
            'atributoST',
            'atributoDX'
        ];
        
        elementos.forEach(id => {
            const el = document.getElementById(id);
            console.log(`${id}:`, el ? '✅' : '❌', el?.textContent);
        });
        
        // Simular atualização de atributos
        const eventoTeste = new CustomEvent('atributosAlterados', {
            detail: {
                ST: 12,
                DX: 14,
                IQ: 13,
                HT: 11,
                PV: 12,
                PF: 11,
                pontosGastos: 50
            }
        });
        document.dispatchEvent(eventoTeste);
    }
}

// ================ INICIALIZAÇÃO GLOBAL ================
(function() {
    console.log('📁 DashboardManager: Carregando...');
    
    // Criar instância global
    window.dashboardManager = new DashboardManager();
    
    // Inicializar quando a aba for aberta
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('[data-tab="dashboard"]');
        if (tabBtn && !window.dashboardManager.inicializado) {
            setTimeout(() => window.dashboardManager.inicializar(), 300);
        }
    });
    
    // Inicializar se já estiver na aba dashboard
    setTimeout(() => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
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
        if (window.dashboardManager) {
            window.dashboardManager.testarDashboard();
        }
    };
})();

console.log('📊 DashboardManager: Carregado com sucesso!');