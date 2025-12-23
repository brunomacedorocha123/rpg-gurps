// dashboard.js - SISTEMA FUNCIONAL DE DASHBOARD
// VERSÃO CORRIGIDA - REMOVIDAS SIMULAÇÕES

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
        this.ultimosAtributos = { ST: 10, DX: 10, IQ: 10, HT: 10 };
    }

    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 Inicializando DashboardManager...');
        
        // Configurar todos os componentes
        this.configurarFoto();
        this.configurarContadorDescricao();
        this.configurarPontos();
        this.configurarBotoes();
        
        // Inicializar monitoramento das outras abas
        this.iniciarMonitoramento();
        
        // Forçar atualização inicial
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('✅ DashboardManager pronto!');
    }

    // ===== MONITORAMENTO DAS OUTRAS ABAS =====
    iniciarMonitoramento() {
        // Monitorar mudanças na aba de atributos
        this.monitorarAtributos();
        
        // Monitorar outras abas (será implementado conforme necessário)
        this.monitorarCaracteristicas();
        
        // Verificar periodicamente por mudanças
        setInterval(() => {
            this.verificarMudancasAtributos();
        }, 2000);
    }

    monitorarAtributos() {
        // Esta função será chamada pela aba de atributos quando houver mudanças
        // Por enquanto, criamos um método público para ser chamado
        console.log('👁️ Monitorando atributos...');
    }

    monitorarCaracteristicas() {
        // Monitorar características (vantagens/desvantagens)
        console.log('👁️ Monitorando características...');
    }

    verificarMudancasAtributos() {
        // Verificar se há formulário de atributos na página
        const formAtributos = document.querySelector('#atributos form');
        if (!formAtributos) return;
        
        // Coletar valores atuais
        const atributosAtuais = {
            ST: this.obterValorAtributo('ST'),
            DX: this.obterValorAtributo('DX'),
            IQ: this.obterValorAtributo('IQ'),
            HT: this.obterValorAtributo('HT')
        };
        
        // Verificar se houve mudança
        let mudou = false;
        Object.keys(atributosAtuais).forEach(chave => {
            if (atributosAtuais[chave] !== this.ultimosAtributos[chave]) {
                mudou = true;
            }
        });
        
        // Se houve mudança, recalcular
        if (mudou) {
            console.log('🔄 Atributos alterados:', atributosAtuais);
            this.ultimosAtributos = { ...atributosAtuais };
            this.calcularPontosAtributos(atributosAtuais);
        }
    }

    obterValorAtributo(nome) {
        // Tentar diferentes seletores para encontrar o atributo
        const seletores = [
            `input[name="${nome}"], 
             input[id*="${nome.toLowerCase()}"], 
             input[placeholder*="${nome}"], 
             .atributo-${nome.toLowerCase()} input`
        ];
        
        let valor = 10; // Valor padrão
        
        // Verificar se existe um elemento específico para este atributo
        const elemento = document.querySelector(`[data-atributo="${nome}"]`) ||
                        document.getElementById(`atributo${nome}`) ||
                        document.getElementById(nome);
        
        if (elemento) {
            if (elemento.tagName === 'INPUT') {
                valor = parseInt(elemento.value) || 10;
            } else {
                valor = parseInt(elemento.textContent) || 10;
            }
        }
        
        return valor;
    }

    calcularPontosAtributos(atributos) {
        // Calcular pontos gastos em atributos baseado no sistema GURPS
        // Cada atributo acima de 10 custa 10 pontos por nível
        // Cada atributo abaixo de 10 dá -10 pontos por nível
        
        let totalPontos = 0;
        
        // Calcular custo para cada atributo
        Object.keys(atributos).forEach(chave => {
            const valor = atributos[chave];
            const diferenca = valor - 10;
            const custo = diferenca * 10; // 10 pontos por nível
            totalPontos += custo;
        });
        
        console.log(`💰 Custo total em atributos: ${totalPontos} pontos`);
        
        // Atualizar dashboard
        this.atualizarAtributosNoDashboard(atributos);
        this.atualizarCard('gastosAtributos', totalPontos);
        this.pontos.gastosAtributos = totalPontos;
        
        // Recalcular totais
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
    }

    atualizarAtributosNoDashboard(atributos) {
        // Atualizar valores dos atributos no dashboard
        if (atributos.ST) document.getElementById('atributoST').textContent = atributos.ST;
        if (atributos.DX) document.getElementById('atributoDX').textContent = atributos.DX;
        if (atributos.IQ) document.getElementById('atributoIQ').textContent = atributos.IQ;
        if (atributos.HT) document.getElementById('atributoHT').textContent = atributos.HT;
        
        // Atualizar PV (baseado em ST) e PF (baseado em HT)
        const pvBase = Math.max(atributos.ST, 10);
        const pfBase = Math.max(atributos.HT, 10);
        
        const pvElement = document.getElementById('valorPV');
        if (pvElement) {
            const partes = pvElement.textContent.split('/');
            const pvAtual = parseInt(partes[0]) || pvBase;
            pvElement.textContent = `${pvAtual}/${pvBase}`;
            
            // Atualizar barra de PV
            const barraPV = document.getElementById('barraPV');
            if (barraPV) {
                const porcentagem = (pvAtual / pvBase) * 100;
                barraPV.style.width = `${porcentagem}%`;
            }
        }
        
        const pfElement = document.getElementById('valorPF');
        if (pfElement) {
            const partes = pfElement.textContent.split('/');
            const pfAtual = parseInt(partes[0]) || pfBase;
            pfElement.textContent = `${pfAtual}/${pfBase}`;
            
            // Atualizar barra de PF
            const barraPF = document.getElementById('barraPF');
            if (barraPF) {
                const porcentagem = (pfAtual / pfBase) * 100;
                barraPF.style.width = `${porcentagem}%`;
            }
        }
    }

    // ===== MÉTODOS PÚBLICOS PARA OUTRAS ABAS =====
    atualizarAtributos(st, dx, iq, ht) {
        const atributos = { ST: st, DX: dx, IQ: iq, HT: ht };
        this.calcularPontosAtributos(atributos);
    }

    atualizarCaracteristicas(vantagens, desvantagens) {
        // Atualizar cards de vantagens e desvantagens
        const totalVantagens = vantagens.reduce((sum, item) => sum + (item.pontos || 0), 0);
        const totalDesvantagens = desvantagens.reduce((sum, item) => sum + (item.pontos || 0), 0);
        
        this.atualizarCard('gastosVantagens', totalVantagens);
        this.atualizarCard('gastosDesvantagens', totalDesvantagens);
        
        this.pontos.gastosVantagens = totalVantagens;
        this.pontos.gastosDesvantagens = totalDesvantagens;
        
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
    }

    atualizarPericias(pericias) {
        const totalPericias = pericias.reduce((sum, item) => sum + (item.pontos || 0), 0);
        this.atualizarCard('gastosPericias', totalPericias);
        this.pontos.gastosPericias = totalPericias;
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
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
                // Verificar se desvantagens ultrapassaram o limite
                if (this.pontos.gastosDesvantagens < limiteDesvantagens.value) {
                    alert(`⚠️ Atenção: Desvantagens (${this.pontos.gastosDesvantagens}) ultrapassaram o limite (${limiteDesvantagens.value})!`);
                }
            });
        }
    }

    configurarBotoes() {
        // Botões de PV
        const btnPVDiminuir = document.querySelectorAll('[onclick*="ajustarPV"]');
        btnPVDiminuir.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const valor = btn.textContent === '-' ? -1 : 1;
                this.ajustarPV(valor);
            });
        });
        
        // Botões de PF
        const btnPFDiminuir = document.querySelectorAll('[onclick*="ajustarPF"]');
        btnPFDiminuir.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const valor = btn.textContent === '-' ? -1 : 1;
                this.ajustarPF(valor);
            });
        });
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

    // ===== FUNÇÕES PARA TESTE =====
    testarAtributos() {
        console.log('🧪 TESTANDO ATRIBUTOS');
        
        // Simular valores de atributos diferentes
        const atributosTeste = {
            ST: 12,
            DX: 14,
            IQ: 13,
            HT: 11
        };
        
        this.atualizarAtributos(
            atributosTeste.ST,
            atributosTeste.DX,
            atributosTeste.IQ,
            atributosTeste.HT
        );
        
        console.log('Atributos atualizados:', atributosTeste);
        console.log('Pontos gastos em atributos:', this.pontos.gastosAtributos);
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
        if (tabBtn) {
            setTimeout(() => {
                if (!window.dashboardManager.inicializado) {
                    window.dashboardManager.inicializar();
                }
                window.dashboardManager.atualizarTudo();
            }, 100);
        }
    });
    
    // Tentar inicializar automaticamente se dashboard já estiver ativo
    setTimeout(() => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active') && !window.dashboardManager.inicializado) {
            window.dashboardManager.inicializar();
        }
    }, 500);
    
    // Exportar funções globais para outras abas usarem
    window.atualizarDashboardAtributos = function(st, dx, iq, ht) {
        if (window.dashboardManager) {
            window.dashboardManager.atualizarAtributos(st, dx, iq, ht);
        }
    };
    
    window.atualizarDashboardCaracteristicas = function(vantagens, desvantagens) {
        if (window.dashboardManager) {
            window.dashboardManager.atualizarCaracteristicas(vantagens, desvantagens);
        }
    };
    
    window.atualizarDashboardPericias = function(pericias) {
        if (window.dashboardManager) {
            window.dashboardManager.atualizarPericias(pericias);
        }
    };
    
    // Funções de ajuste manual
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
    
    // Função de teste
    window.testarDashboard = function() {
        if (window.dashboardManager) {
            window.dashboardManager.testarAtributos();
        }
    };
    
    console.log('✅ DashboardManager carregado! Use testarDashboard() para testar.');
})();