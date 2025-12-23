// dashboard.js - VERSÃO COMPLETA E FUNCIONAL
class DashboardManager {
    constructor() {
        console.log('📊 DashboardManager criado');
        
        this.estado = {
            pontos: {
                total: 150,
                limiteDesvantagens: -50,
                gastosAtributos: 0,
                gastosVantagens: 0,
                gastosDesvantagens: 0,
                gastosPericias: 0,
                gastosMagias: 0,
                gastosTecnicas: 0,
                gastosPeculiaridades: 0
            },
            atributos: {
                ST: 10,
                DX: 10,
                IQ: 10,
                HT: 10,
                PV: 10,
                PF: 10
            },
            caracteristicas: {
                aparencia: 0,
                riqueza: 0,
                idiomas: 0,
                fisicas: 0
            },
            identificacao: {
                raca: '',
                classe: '',
                nivel: '',
                descricao: ''
            }
        };
        
        this.inicializado = false;
    }

    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 Inicializando DashboardManager...');
        
        // 1. Configurar inputs de identificação
        this.configurarIdentificacao();
        
        // 2. Configurar sistema de pontos
        this.configurarPontos();
        
        // 3. Configurar sistema de foto
        this.configurarFoto();
        
        // 4. Configurar ouvinte para atributos
        this.configurarOuvinteAtributos();
        
        // 5. Configurar ouvinte para características
        this.configurarOuvinteCaracteristicas();
        
        // 6. Calcular valores iniciais
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('✅ DashboardManager inicializado!');
    }

    // ================ IDENTIFICAÇÃO ================
    configurarIdentificacao() {
        // Raça
        const racaInput = document.getElementById('dashboardRaca');
        if (racaInput) {
            racaInput.addEventListener('input', () => {
                this.estado.identificacao.raca = racaInput.value;
            });
        }
        
        // Classe
        const classeInput = document.getElementById('dashboardClasse');
        if (classeInput) {
            classeInput.addEventListener('input', () => {
                this.estado.identificacao.classe = classeInput.value;
            });
        }
        
        // Nível
        const nivelInput = document.getElementById('dashboardNivel');
        if (nivelInput) {
            nivelInput.addEventListener('input', () => {
                this.estado.identificacao.nivel = nivelInput.value;
            });
        }
        
        // Descrição
        const descricaoInput = document.getElementById('dashboardDescricao');
        if (descricaoInput) {
            descricaoInput.addEventListener('input', () => {
                this.estado.identificacao.descricao = descricaoInput.value;
                
                // Contador de caracteres
                const contador = document.getElementById('contadorDescricao');
                if (contador) {
                    contador.textContent = descricaoInput.value.length;
                }
            });
        }
    }

    // ================ PONTOS ================
    configurarPontos() {
        // Pontos totais
        const pontosTotais = document.getElementById('pontosTotais');
        if (pontosTotais) {
            pontosTotais.addEventListener('change', () => {
                this.estado.pontos.total = parseInt(pontosTotais.value) || 150;
                this.atualizarSaldo();
            });
            
            pontosTotais.addEventListener('input', () => {
                this.estado.pontos.total = parseInt(pontosTotais.value) || 150;
                this.atualizarSaldo();
            });
        }
        
        // Limite de desvantagens
        const limiteDesvantagens = document.getElementById('limiteDesvantagens');
        if (limiteDesvantagens) {
            limiteDesvantagens.addEventListener('change', () => {
                this.estado.pontos.limiteDesvantagens = parseInt(limiteDesvantagens.value) || -50;
            });
            
            limiteDesvantagens.addEventListener('input', () => {
                this.estado.pontos.limiteDesvantagens = parseInt(limiteDesvantagens.value) || -50;
            });
        }
    }

    // ================ FOTO ================
    configurarFoto() {
        const fotoUpload = document.getElementById('fotoUpload');
        const btnRemoverFoto = document.getElementById('btnRemoverFoto');
        const fotoPreview = document.getElementById('fotoPreview');
        const fotoPlaceholder = document.getElementById('fotoPlaceholder');
        
        if (fotoUpload) {
            fotoUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        if (fotoPreview) {
                            fotoPreview.src = event.target.result;
                            fotoPreview.style.display = 'block';
                        }
                        if (fotoPlaceholder) {
                            fotoPlaceholder.style.display = 'none';
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (btnRemoverFoto) {
            btnRemoverFoto.addEventListener('click', () => {
                if (fotoPreview) {
                    fotoPreview.src = '';
                    fotoPreview.style.display = 'none';
                }
                if (fotoPlaceholder) {
                    fotoPlaceholder.style.display = 'flex';
                }
                if (fotoUpload) {
                    fotoUpload.value = '';
                }
            });
        }
    }

    // ================ OUVINTE PARA ATRIBUTOS ================
    configurarOuvinteAtributos() {
        console.log('👂 Configurando ouvinte para atributos...');
        
        document.addEventListener('atributosAlterados', (e) => {
            console.log('📥 Evento de atributos recebido:', e.detail);
            
            if (e.detail) {
                // Atualizar atributos no estado
                this.estado.atributos.ST = e.detail.ST || 10;
                this.estado.atributos.DX = e.detail.DX || 10;
                this.estado.atributos.IQ = e.detail.IQ || 10;
                this.estado.atributos.HT = e.detail.HT || 10;
                this.estado.atributos.PV = e.detail.PV || 10;
                this.estado.atributos.PF = e.detail.PF || 10;
                
                // Atualizar pontos gastos em atributos
                this.estado.pontos.gastosAtributos = e.detail.pontosGastos || 0;
                
                console.log('💰 Pontos gastos em atributos:', this.estado.pontos.gastosAtributos);
                
                // Atualizar displays
                this.atualizarDisplayAtributos();
                this.atualizarResumoGastos();
                this.atualizarSaldo();
                
                console.log('✅ Atributos atualizados no dashboard');
            }
        });
    }

    // ================ OUVINTE PARA CARACTERÍSTICAS ================
    configurarOuvinteCaracteristicas() {
        console.log('👂 Configurando ouvinte para características...');
        
        document.addEventListener('caracteristicasAtualizadas', (e) => {
            console.log('📥 Evento de características recebido:', e.detail);
            
            if (e.detail) {
                // Atualizar características no estado
                this.estado.caracteristicas.aparencia = e.detail.detalhes?.aparencia || 0;
                this.estado.caracteristicas.riqueza = e.detail.detalhes?.riqueza || 0;
                this.estado.caracteristicas.idiomas = e.detail.detalhes?.idiomas || 0;
                this.estado.caracteristicas.fisicas = e.detail.detalhes?.caracteristicas || 0;
                
                // Atualizar pontos gastos em peculiaridades (onde vão as características)
                this.estado.pontos.gastosPeculiaridades = e.detail.total || 0;
                
                console.log('💰 Pontos gastos em características:', this.estado.pontos.gastosPeculiaridades);
                
                // Atualizar displays
                this.atualizarFinanceiro();
                this.atualizarResumoGastos();
                this.atualizarSaldo();
                
                console.log('✅ Características atualizadas no dashboard');
            }
        });
    }

    // ================ ATUALIZAÇÕES DE DISPLAY ================
    atualizarDisplayAtributos() {
        console.log('🔄 Atualizando display de atributos...');
        
        // Atributos básicos
        const stElement = document.getElementById('atributoST');
        const dxElement = document.getElementById('atributoDX');
        const iqElement = document.getElementById('atributoIQ');
        const htElement = document.getElementById('atributoHT');
        
        if (stElement) stElement.textContent = this.estado.atributos.ST;
        if (dxElement) dxElement.textContent = this.estado.atributos.DX;
        if (iqElement) iqElement.textContent = this.estado.atributos.IQ;
        if (htElement) htElement.textContent = this.estado.atributos.HT;
        
        // Pontos de Vida
        const valorPV = document.getElementById('valorPV');
        const barraPV = document.getElementById('barraPV');
        if (valorPV) {
            valorPV.textContent = `${this.estado.atributos.PV}/${this.estado.atributos.PV}`;
        }
        if (barraPV) {
            barraPV.style.width = '100%';
        }
        
        // Pontos de Fadiga
        const valorPF = document.getElementById('valorPF');
        const barraPF = document.getElementById('barraPF');
        if (valorPF) {
            valorPF.textContent = `${this.estado.atributos.PF}/${this.estado.atributos.PF}`;
        }
        if (barraPF) {
            barraPF.style.width = '100%';
        }
    }

    atualizarFinanceiro() {
        console.log('🔄 Atualizando financeiro...');
        
        // Nível de riqueza
        const nivelRiqueza = document.getElementById('nivelRiqueza');
        if (nivelRiqueza) {
            const riqueza = this.estado.caracteristicas.riqueza;
            if (riqueza >= 50) nivelRiqueza.textContent = "Podre de Rico";
            else if (riqueza >= 30) nivelRiqueza.textContent = "Muito Rico";
            else if (riqueza >= 20) nivelRiqueza.textContent = "Rico";
            else if (riqueza >= 10) nivelRiqueza.textContent = "Confortável";
            else if (riqueza === 0) nivelRiqueza.textContent = "Médio";
            else if (riqueza >= -10) nivelRiqueza.textContent = "Batalhador";
            else if (riqueza >= -15) nivelRiqueza.textContent = "Pobre";
            else nivelRiqueza.textContent = "Falido";
        }
        
        // Saldo do personagem (simulação)
        const saldoPersonagem = document.getElementById('saldoPersonagem');
        if (saldoPersonagem) {
            const riqueza = this.estado.caracteristicas.riqueza;
            if (riqueza >= 50) saldoPersonagem.textContent = "$20.000";
            else if (riqueza >= 30) saldoPersonagem.textContent = "$10.000";
            else if (riqueza >= 20) saldoPersonagem.textContent = "$5.000";
            else if (riqueza >= 10) saldoPersonagem.textContent = "$2.000";
            else if (riqueza === 0) saldoPersonagem.textContent = "$1.000";
            else if (riqueza >= -10) saldoPersonagem.textContent = "$500";
            else if (riqueza >= -15) saldoPersonagem.textContent = "$200";
            else saldoPersonagem.textContent = "$100";
        }
        
        // Aparência
        const nivelAparencia = document.getElementById('nivelAparencia');
        if (nivelAparencia) {
            const aparencia = this.estado.caracteristicas.aparencia;
            if (aparencia >= 20) nivelAparencia.textContent = "Lindo";
            else if (aparencia >= 16) nivelAparencia.textContent = "Muito Elegante";
            else if (aparencia >= 12) nivelAparencia.textContent = "Elegante";
            else if (aparencia >= 4) nivelAparencia.textContent = "Atraente";
            else if (aparencia === 0) nivelAparencia.textContent = "Comum";
            else if (aparencia >= -4) nivelAparencia.textContent = "Sem Atrativos";
            else if (aparencia >= -8) nivelAparencia.textContent = "Feio";
            else if (aparencia >= -16) nivelAparencia.textContent = "Hediondo";
            else if (aparencia >= -20) nivelAparencia.textContent = "Monstruoso";
            else nivelAparencia.textContent = "Horrendo";
        }
    }

    atualizarResumoGastos() {
        console.log('💰 Atualizando resumo de gastos...');
        console.log('Gastos Atributos:', this.estado.pontos.gastosAtributos);
        console.log('Gastos Peculiaridades:', this.estado.pontos.gastosPeculiaridades);
        
        // Atributos
        const gastosAtributos = document.getElementById('gastosAtributos');
        if (gastosAtributos) {
            gastosAtributos.textContent = this.estado.pontos.gastosAtributos;
            this.aplicarEstiloPontos(gastosAtributos, this.estado.pontos.gastosAtributos);
        }
        
        // Vantagens
        const gastosVantagens = document.getElementById('gastosVantagens');
        if (gastosVantagens) {
            gastosVantagens.textContent = this.estado.pontos.gastosVantagens;
            this.aplicarEstiloPontos(gastosVantagens, this.estado.pontos.gastosVantagens);
        }
        
        // Desvantagens
        const gastosDesvantagens = document.getElementById('gastosDesvantagens');
        if (gastosDesvantagens) {
            gastosDesvantagens.textContent = this.estado.pontos.gastosDesvantagens;
            this.aplicarEstiloPontos(gastosDesvantagens, this.estado.pontos.gastosDesvantagens);
        }
        
        // Perícias
        const gastosPericias = document.getElementById('gastosPericias');
        if (gastosPericias) {
            gastosPericias.textContent = this.estado.pontos.gastosPericias;
            this.aplicarEstiloPontos(gastosPericias, this.estado.pontos.gastosPericias);
        }
        
        // Magias
        const gastosMagias = document.getElementById('gastosMagias');
        if (gastosMagias) {
            gastosMagias.textContent = this.estado.pontos.gastosMagias;
            this.aplicarEstiloPontos(gastosMagias, this.estado.pontos.gastosMagias);
        }
        
        // Técnicas
        const gastosTecnicas = document.getElementById('gastosTecnicas');
        if (gastosTecnicas) {
            gastosTecnicas.textContent = this.estado.pontos.gastosTecnicas;
            this.aplicarEstiloPontos(gastosTecnicas, this.estado.pontos.gastosTecnicas);
        }
        
        // Peculiaridades (onde vão as características)
        const gastosPeculiaridades = document.getElementById('gastosPeculiaridades');
        if (gastosPeculiaridades) {
            gastosPeculiaridades.textContent = this.estado.pontos.gastosPeculiaridades;
            this.aplicarEstiloPontos(gastosPeculiaridades, this.estado.pontos.gastosPeculiaridades);
        }
        
        // Total líquido
        const totalLiquido = document.getElementById('totalLiquido');
        if (totalLiquido) {
            const total = this.calcularTotalGastos();
            totalLiquido.textContent = total;
            this.aplicarEstiloPontos(totalLiquido, total);
        }
    }

    calcularTotalGastos() {
        return this.estado.pontos.gastosAtributos +
               this.estado.pontos.gastosVantagens +
               this.estado.pontos.gastosDesvantagens +
               this.estado.pontos.gastosPericias +
               this.estado.pontos.gastosMagias +
               this.estado.pontos.gastosTecnicas +
               this.estado.pontos.gastosPeculiaridades;
    }

    atualizarSaldo() {
        const saldoDisponivel = document.getElementById('saldoDisponivel');
        if (saldoDisponivel) {
            const saldo = this.estado.pontos.total - this.calcularTotalGastos();
            saldoDisponivel.textContent = saldo;
            
            // Aplicar estilo baseado no saldo
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

    // ================ FUNÇÕES DE CONTROLE ================
    ajustarPV(valor) {
        this.estado.atributos.PV = Math.max(1, this.estado.atributos.PV + valor);
        this.atualizarDisplayAtributos();
    }

    ajustarPF(valor) {
        this.estado.atributos.PF = Math.max(1, this.estado.atributos.PF + valor);
        this.atualizarDisplayAtributos();
    }

    // ================ FUNÇÃO PRINCIPAL ================
    atualizarTudo() {
        console.log('🔄 Atualizando tudo no dashboard...');
        this.atualizarDisplayAtributos();
        this.atualizarFinanceiro();
        this.atualizarResumoGastos();
        this.atualizarSaldo();
    }

    // ================ FUNÇÕES PARA SALVAR/CARREGAR ================
    coletarDadosParaSalvar() {
        return {
            identificacao: this.estado.identificacao,
            pontos: this.estado.pontos,
            atributos: this.estado.atributos,
            caracteristicas: this.estado.caracteristicas,
            atualizadoEm: new Date().toISOString()
        };
    }

    carregarDados(dados) {
        if (!dados) return;
        
        console.log('📥 Carregando dados no dashboard:', dados);
        
        // Carregar identificação
        if (dados.identificacao) {
            this.estado.identificacao = { ...dados.identificacao };
            
            // Preencher inputs
            const racaInput = document.getElementById('dashboardRaca');
            const classeInput = document.getElementById('dashboardClasse');
            const nivelInput = document.getElementById('dashboardNivel');
            const descricaoInput = document.getElementById('dashboardDescricao');
            
            if (racaInput && dados.identificacao.raca) racaInput.value = dados.identificacao.raca;
            if (classeInput && dados.identificacao.classe) classeInput.value = dados.identificacao.classe;
            if (nivelInput && dados.identificacao.nivel) nivelInput.value = dados.identificacao.nivel;
            if (descricaoInput && dados.identificacao.descricao) {
                descricaoInput.value = dados.identificacao.descricao;
                
                // Atualizar contador
                const contador = document.getElementById('contadorDescricao');
                if (contador) {
                    contador.textContent = descricaoInput.value.length;
                }
            }
        }
        
        // Carregar pontos
        if (dados.pontos) {
            this.estado.pontos = { ...dados.pontos };
            
            // Atualizar inputs
            const pontosTotais = document.getElementById('pontosTotais');
            const limiteDesvantagens = document.getElementById('limiteDesvantagens');
            
            if (pontosTotais) pontosTotais.value = dados.pontos.total || 150;
            if (limiteDesvantagens) limiteDesvantagens.value = dados.pontos.limiteDesvantagens || -50;
        }
        
        // Carregar atributos
        if (dados.atributos) {
            this.estado.atributos = { ...dados.atributos };
        }
        
        // Carregar características
        if (dados.caracteristicas) {
            this.estado.caracteristicas = { ...dados.caracteristicas };
        }
        
        // Atualizar displays
        setTimeout(() => this.atualizarTudo(), 100);
    }
}

// ================ INICIALIZAÇÃO GLOBAL ================
(function() {
    console.log('📁 Carregando DashboardManager...');
    
    // Criar instância global
    window.dashboardManager = new DashboardManager();
    
    // Inicializar quando a aba dashboard for ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'class') {
                const dashboardTab = document.getElementById('dashboard');
                if (dashboardTab && dashboardTab.classList.contains('active') && !window.dashboardManager.inicializado) {
                    setTimeout(() => {
                        window.dashboardManager.inicializar();
                    }, 300);
                }
            }
        });
    });
    
    // Observar mudanças nas tabs
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab) {
        observer.observe(dashboardTab, { attributes: true });
    }
    
    // Tentar inicializar automaticamente após 2 segundos
    setTimeout(() => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active') && !window.dashboardManager.inicializado) {
            window.dashboardManager.inicializar();
        }
    }, 2000);
    
    // Inicializar quando clicar na tab
    document.addEventListener('click', function(e) {
        const tabBtn = e.target.closest('.tab-btn');
        if (tabBtn && tabBtn.getAttribute('data-tab') === 'dashboard' && !window.dashboardManager.inicializado) {
            setTimeout(() => {
                window.dashboardManager.inicializar();
            }, 300);
        }
    });
})();

// ================ FUNÇÕES GLOBAIS PARA HTML ================
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

// ================ DEBUG ================
window.testarDashboard = function() {
    console.log('=== 🧪 TESTE DO DASHBOARD ===');
    console.log('Dashboard Manager:', window.dashboardManager ? '✅' : '❌');
    console.log('Inicializado:', window.dashboardManager?.inicializado ? '✅' : '❌');
    console.log('Estado atual:', window.dashboardManager?.estado);
    
    // Testar elementos críticos
    const elementosCriticos = [
        'gastosAtributos',
        'gastosPeculiaridades',
        'totalLiquido',
        'saldoDisponivel',
        'atributoST',
        'atributoDX'
    ];
    
    elementosCriticos.forEach(id => {
        const elemento = document.getElementById(id);
        console.log(`${id}:`, elemento ? '✅' : '❌');
    });
    
    console.log('=== FIM DO TESTE ===');
};

console.log('📊 DashboardManager carregado!');