// dashboard.js - SISTEMA COMPLETO DE DASHBOARD
// VERSÃO 2.0 - Comunicação total com outras abas

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
        
        this.atributos = {
            ST: 10,
            DX: 10,
            IQ: 10,
            HT: 10,
            PV: { atual: 10, max: 10 },
            PF: { atual: 10, max: 10 }
        };
        
        this.financeiro = {
            nivelRiqueza: 'Médio',
            saldoPersonagem: '$2.000',
            nivelAparencia: 'Média'
        };
        
        this.identificacao = {
            raca: '',
            classe: '',
            nivel: '',
            descricao: ''
        };
        
        this.inicializado = false;
        this.ultimosAtributos = { ST: 10, DX: 10, IQ: 10, HT: 10 };
        
        // Inicializar com valores padrão
        this.atualizarResumoCards();
    }

    // ===== INICIALIZAÇÃO =====
    inicializar() {
        if (this.inicializado) return;
        console.log('🚀 Inicializando DashboardManager...');
        
        // Configurar todos os componentes
        this.configurarFoto();
        this.configurarContadorDescricao();
        this.configurarPontos();
        this.configurarBotoes();
        this.configurarIdentificacao();
        this.configurarFinanceiro();
        this.configurarEventos();
        
        // Carregar dados salvos
        this.carregarDadosSalvos();
        
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
                    this.salvarFoto(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        
        btnRemover.addEventListener('click', () => {
            preview.src = '';
            preview.style.display = 'none';
            placeholder.style.display = 'flex';
            fotoUpload.value = '';
            this.salvarFoto('');
        });
        
        // Carregar foto salva
        const fotoSalva = localStorage.getItem('dashboardFoto');
        if (fotoSalva) {
            preview.src = fotoSalva;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        }
    }

    configurarContadorDescricao() {
        const descricao = document.getElementById('dashboardDescricao');
        const contador = document.getElementById('contadorDescricao');
        
        if (descricao && contador) {
            // Carregar descrição salva
            const descricaoSalva = localStorage.getItem('dashboardDescricao');
            if (descricaoSalva) {
                descricao.value = descricaoSalva;
            }
            
            contador.textContent = descricao.value.length;
            descricao.addEventListener('input', () => {
                contador.textContent = descricao.value.length;
                this.identificacao.descricao = descricao.value;
                localStorage.setItem('dashboardDescricao', descricao.value);
            });
        }
    }

    configurarIdentificacao() {
        const inputs = ['dashboardRaca', 'dashboardClasse', 'dashboardNivel'];
        
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                // Carregar valor salvo
                const valorSalvo = localStorage.getItem(id);
                if (valorSalvo) {
                    input.value = valorSalvo;
                }
                
                input.addEventListener('input', () => {
                    localStorage.setItem(id, input.value);
                    
                    // Atualizar objeto identificacao
                    switch(id) {
                        case 'dashboardRaca':
                            this.identificacao.raca = input.value;
                            break;
                        case 'dashboardClasse':
                            this.identificacao.classe = input.value;
                            break;
                        case 'dashboardNivel':
                            this.identificacao.nivel = input.value;
                            break;
                    }
                });
            }
        });
    }

    configurarFinanceiro() {
        const niveisRiqueza = ['Mendigo', 'Pobre', 'Médio', 'Confortável', 'Rico', 'Muito Rico', 'Multimilionário'];
        const niveisAparencia = ['Horrível', 'Feia', 'Desagradável', 'Média', 'Atraente', 'Bonita', 'Lindo(a)', 'Transcendente'];
        
        // Configurar nível de riqueza
        const riquezaElement = document.getElementById('nivelRiqueza');
        if (riquezaElement) {
            riquezaElement.addEventListener('click', () => {
                const novoIndice = (niveisRiqueza.indexOf(this.financeiro.nivelRiqueza) + 1) % niveisRiqueza.length;
                this.financeiro.nivelRiqueza = niveisRiqueza[novoIndice];
                riquezaElement.textContent = this.financeiro.nivelRiqueza;
                this.salvarDados();
            });
        }
        
        // Configurar aparência
        const aparenciaElement = document.getElementById('nivelAparencia');
        if (aparenciaElement) {
            aparenciaElement.addEventListener('click', () => {
                const novoIndice = (niveisAparencia.indexOf(this.financeiro.nivelAparencia) + 1) % niveisAparencia.length;
                this.financeiro.nivelAparencia = niveisAparencia[novoIndice];
                aparenciaElement.textContent = this.financeiro.nivelAparencia;
                this.salvarDados();
            });
        }
        
        // Configurar saldo
        const saldoElement = document.getElementById('saldoPersonagem');
        if (saldoElement) {
            saldoElement.addEventListener('dblclick', () => {
                const novoSaldo = prompt('Digite o novo saldo:', this.financeiro.saldoPersonagem.replace('$', ''));
                if (novoSaldo !== null) {
                    this.financeiro.saldoPersonagem = '$' + parseFloat(novoSaldo).toFixed(2);
                    saldoElement.textContent = this.financeiro.saldoPersonagem;
                    this.salvarDados();
                }
            });
        }
    }

    configurarPontos() {
        const pontosTotais = document.getElementById('pontosTotais');
        const limiteDesvantagens = document.getElementById('limiteDesvantagens');
        
        if (pontosTotais) {
            const pontosSalvos = localStorage.getItem('pontosTotais');
            if (pontosSalvos) {
                pontosTotais.value = pontosSalvos;
            }
            
            pontosTotais.addEventListener('input', () => {
                localStorage.setItem('pontosTotais', pontosTotais.value);
                this.atualizarSaldoDisponivel();
            });
        }
        
        if (limiteDesvantagens) {
            const limiteSalvo = localStorage.getItem('limiteDesvantagens');
            if (limiteSalvo) {
                limiteDesvantagens.value = limiteSalvo;
            }
            
            limiteDesvantagens.addEventListener('input', () => {
                localStorage.setItem('limiteDesvantagens', limiteDesvantagens.value);
                this.verificarLimiteDesvantagens();
            });
        }
    }

    configurarBotoes() {
        // Botões de PV
        document.addEventListener('click', (e) => {
            if (e.target.closest('.vitalidade-btn')) {
                const btn = e.target.closest('.vitalidade-btn');
                if (btn.textContent === '-' || btn.getAttribute('onclick')?.includes('ajustarPV(-1)')) {
                    this.ajustarPV(-1);
                } else if (btn.textContent === '+' || btn.getAttribute('onclick')?.includes('ajustarPV(1)')) {
                    this.ajustarPV(1);
                }
            }
            
            if (e.target.closest('.vitalidade-btn')) {
                const btn = e.target.closest('.vitalidade-btn');
                if (btn.textContent === '-' || btn.getAttribute('onclick')?.includes('ajustarPF(-1)')) {
                    this.ajustarPF(-1);
                } else if (btn.textContent === '+' || btn.getAttribute('onclick')?.includes('ajustarPF(1)')) {
                    this.ajustarPF(1);
                }
            }
        });
    }

    configurarEventos() {
        // Escutar evento de alteração de atributos
        document.addEventListener('atributosAlterados', (event) => {
            if (event.detail) {
                console.log('📥 Dashboard recebeu dados dos atributos:', event.detail);
                this.processarDadosAtributos(event.detail);
            }
        });
        
        // Escutar eventos de outras abas
        document.addEventListener('vantagensAlteradas', (event) => {
            if (event.detail) {
                this.atualizarPontosVantagens(event.detail);
            }
        });
        
        document.addEventListener('desvantagensAlteradas', (event) => {
            if (event.detail) {
                this.atualizarPontosDesvantagens(event.detail);
            }
        });
        
        document.addEventListener('periciasAlteradas', (event) => {
            if (event.detail) {
                this.atualizarPontosPericias(event.detail);
            }
        });
        
        // Solicitar dados quando o dashboard for aberto
        document.addEventListener('tabChanged', (event) => {
            if (event.detail && event.detail.tab === 'dashboard') {
                // Solicitar dados atuais de todas as abas
                this.solicitarDadosTodasAbas();
            }
        });
        
        // Atualizar periodicamente
        setInterval(() => {
            this.verificarAtributos();
        }, 3000);
    }

    // ===== PROCESSAMENTO DE DADOS =====
    processarDadosAtributos(dados) {
        // Atualizar atributos
        this.atributos.ST = dados.ST || 10;
        this.atributos.DX = dados.DX || 10;
        this.atributos.IQ = dados.IQ || 10;
        this.atributos.HT = dados.HT || 10;
        
        // Calcular PV e PF base
        const pvBase = Math.max(this.atributos.ST, 10);
        const pfBase = Math.max(this.atributos.HT, 10);
        
        // Manter valores atuais se existirem, senão usar máximo
        if (this.atributos.PV.atual === 10 && this.atributos.PV.max === 10) {
            this.atributos.PV = { atual: pvBase, max: pvBase };
        } else {
            this.atributos.PV.max = pvBase;
        }
        
        if (this.atributos.PF.atual === 10 && this.atributos.PF.max === 10) {
            this.atributos.PF = { atual: pfBase, max: pfBase };
        } else {
            this.atributos.PF.max = pfBase;
        }
        
        // Atualizar pontos gastos
        if (dados.pontosAtributos !== undefined) {
            this.pontos.gastosAtributos = dados.pontosAtributos;
            this.atualizarCard('gastosAtributos', dados.pontosAtributos);
        }
        
        // Atualizar display
        this.atualizarDisplayAtributos();
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        
        // Salvar dados
        this.salvarDados();
    }

    atualizarDisplayAtributos() {
        // Atualizar valores dos atributos
        document.getElementById('atributoST').textContent = this.atributos.ST;
        document.getElementById('atributoDX').textContent = this.atributos.DX;
        document.getElementById('atributoIQ').textContent = this.atributos.IQ;
        document.getElementById('atributoHT').textContent = this.atributos.HT;
        
        // Atualizar PV
        const pvElement = document.getElementById('valorPV');
        const barraPV = document.getElementById('barraPV');
        if (pvElement) {
            pvElement.textContent = `${this.atributos.PV.atual}/${this.atributos.PV.max}`;
        }
        if (barraPV) {
            const porcentagem = (this.atributos.PV.atual / this.atributos.PV.max) * 100;
            barraPV.style.width = `${Math.min(100, Math.max(0, porcentagem))}%`;
            
            // Cor baseada na porcentagem
            if (porcentagem < 25) {
                barraPV.style.backgroundColor = '#e74c3c';
            } else if (porcentagem < 50) {
                barraPV.style.backgroundColor = '#f39c12';
            } else {
                barraPV.style.backgroundColor = '#2ecc71';
            }
        }
        
        // Atualizar PF
        const pfElement = document.getElementById('valorPF');
        const barraPF = document.getElementById('barraPF');
        if (pfElement) {
            pfElement.textContent = `${this.atributos.PF.atual}/${this.atributos.PF.max}`;
        }
        if (barraPF) {
            const porcentagem = (this.atributos.PF.atual / this.atributos.PF.max) * 100;
            barraPF.style.width = `${Math.min(100, Math.max(0, porcentagem))}%`;
            
            // Cor baseada na porcentagem
            if (porcentagem < 25) {
                barraPF.style.backgroundColor = '#e74c3c';
            } else if (porcentagem < 50) {
                barraPF.style.backgroundColor = '#f39c12';
            } else {
                barraPF.style.backgroundColor = '#3498db';
            }
        }
    }

    // ===== PONTOS DAS OUTRAS ABAS =====
    atualizarPontosVantagens(dados) {
        const total = dados.total || dados.pontos || 0;
        this.pontos.gastosVantagens = total;
        this.atualizarCard('gastosVantagens', total);
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        this.salvarDados();
    }

    atualizarPontosDesvantagens(dados) {
        const total = dados.total || dados.pontos || 0;
        this.pontos.gastosDesvantagens = total;
        this.atualizarCard('gastosDesvantagens', total);
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        this.verificarLimiteDesvantagens();
        this.salvarDados();
    }

    atualizarPontosPericias(dados) {
        const total = dados.total || dados.pontos || 0;
        this.pontos.gastosPericias = total;
        this.atualizarCard('gastosPericias', total);
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        this.salvarDados();
    }

    atualizarPontosMagias(dados) {
        const total = dados.total || dados.pontos || 0;
        this.pontos.gastosMagias = total;
        this.atualizarCard('gastosMagias', total);
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        this.salvarDados();
    }

    atualizarPontosTecnicas(dados) {
        const total = dados.total || dados.pontos || 0;
        this.pontos.gastosTecnicas = total;
        this.atualizarCard('gastosTecnicas', total);
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        this.salvarDados();
    }

    atualizarPontosPeculiaridades(dados) {
        const total = dados.total || dados.pontos || 0;
        this.pontos.gastosPeculiaridades = total;
        this.atualizarCard('gastosPeculiaridades', total);
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        this.salvarDados();
    }

    // ===== FUNÇÕES DE CONTROLE =====
    ajustarPV(valor) {
        this.atributos.PV.atual = Math.max(0, Math.min(this.atributos.PV.max, this.atributos.PV.atual + valor));
        this.atualizarDisplayAtributos();
        this.salvarDados();
    }

    ajustarPF(valor) {
        this.atributos.PF.atual = Math.max(0, Math.min(this.atributos.PF.max, this.atributos.PF.atual + valor));
        this.atualizarDisplayAtributos();
        this.salvarDados();
    }

    verificarAtributos() {
        // Verificar manualmente os atributos na aba de atributos
        const atributosInputs = {
            ST: document.querySelector('#atributos input[name="ST"], #atributos #ST'),
            DX: document.querySelector('#atributos input[name="DX"], #atributos #DX'),
            IQ: document.querySelector('#atributos input[name="IQ"], #atributos #IQ'),
            HT: document.querySelector('#atributos input[name="HT"], #atributos #HT')
        };
        
        let mudou = false;
        Object.keys(atributosInputs).forEach(chave => {
            if (atributosInputs[chave]) {
                const valor = parseInt(atributosInputs[chave].value) || 10;
                if (valor !== this.ultimosAtributos[chave]) {
                    mudou = true;
                    this.ultimosAtributos[chave] = valor;
                }
            }
        });
        
        if (mudou) {
            console.log('🔄 Atributos alterados manualmente:', this.ultimosAtributos);
            const pontosAtributos = (this.ultimosAtributos.ST - 10) * 10 +
                                   (this.ultimosAtributos.DX - 10) * 20 +
                                   (this.ultimosAtributos.IQ - 10) * 20 +
                                   (this.ultimosAtributos.HT - 10) * 10;
            
            this.processarDadosAtributos({
                ST: this.ultimosAtributos.ST,
                DX: this.ultimosAtributos.DX,
                IQ: this.ultimosAtributos.IQ,
                HT: this.ultimosAtributos.HT,
                pontosAtributos: pontosAtributos
            });
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
        
        // Atualizar todos os cards
        this.atualizarResumoCards();
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
            saldoElement.title = 'Você está usando mais pontos do que o permitido!';
        } else if (saldo === 0) {
            saldoElement.style.color = '#f39c12';
            saldoElement.style.fontWeight = 'bold';
            saldoElement.title = 'Você usou todos os pontos disponíveis';
        } else {
            saldoElement.style.color = '#2ecc71';
            saldoElement.style.fontWeight = 'normal';
            saldoElement.title = 'Pontos restantes disponíveis';
        }
    }

    verificarLimiteDesvantagens() {
        const limiteDesvantagens = document.getElementById('limiteDesvantagens');
        if (!limiteDesvantagens) return;
        
        const limite = parseInt(limiteDesvantagens.value) || -50;
        const desvantagensAtuais = this.pontos.gastosDesvantagens;
        
        if (desvantagensAtuais < limite) {
            const card = document.getElementById('gastosDesvantagens');
            if (card) {
                card.style.animation = 'pulse-alert 1s infinite';
                card.title = `ATENÇÃO: Desvantagens (${desvantagensAtuais}) ultrapassaram o limite (${limite})!`;
            }
        } else {
            const card = document.getElementById('gastosDesvantagens');
            if (card) {
                card.style.animation = '';
                card.title = `Desvantagens: ${desvantagensAtuais} pontos`;
            }
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
        
        // Tooltip informativo
        elemento.title = `${idCard.replace('gastos', '')}: ${valor} pontos`;
    }

    aplicarEstilo(elemento, valor) {
        elemento.classList.remove('positivo', 'negativo', 'neutro');
        
        if (valor > 0) {
            elemento.classList.add('positivo');
        } else if (valor < 0) {
            elemento.classList.add('negativo');
        } else {
            elemento.classList.add('neutro');
        }
    }

    atualizarResumoCards() {
        // Atualizar cores dos cards com base nos valores
        Object.keys(this.pontos).forEach(chave => {
            const elemento = document.getElementById(chave);
            if (elemento) {
                this.aplicarEstilo(elemento, this.pontos[chave]);
            }
        });
    }

    // ===== SISTEMA DE SOLICITAÇÃO =====
    solicitarDadosTodasAbas() {
        console.log('🔍 Solicitando dados de todas as abas...');
        
        // Disparar eventos para solicitar dados
        const eventos = [
            'dashboardSolicitaAtributos',
            'dashboardSolicitaVantagens',
            'dashboardSolicitaDesvantagens',
            'dashboardSolicitaPericias',
            'dashboardSolicitaMagias',
            'dashboardSolicitaTecnicas',
            'dashboardSolicitaPeculiaridades'
        ];
        
        eventos.forEach(evento => {
            setTimeout(() => {
                document.dispatchEvent(new Event(evento));
            }, 100);
        });
    }

    // ===== SISTEMA DE PERSISTÊNCIA =====
    salvarDados() {
        try {
            const dados = {
                pontos: this.pontos,
                atributos: this.atributos,
                financeiro: this.financeiro,
                identificacao: this.identificacao,
                ultimaAtualizacao: new Date().toISOString()
            };
            
            localStorage.setItem('dashboardDados', JSON.stringify(dados));
            console.log('💾 Dados do dashboard salvos');
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }

    carregarDadosSalvos() {
        try {
            const dadosSalvos = localStorage.getItem('dashboardDados');
            if (dadosSalvos) {
                const dados = JSON.parse(dadosSalvos);
                
                // Carregar pontos
                if (dados.pontos) {
                    Object.keys(dados.pontos).forEach(chave => {
                        if (this.pontos.hasOwnProperty(chave)) {
                            this.pontos[chave] = dados.pontos[chave];
                            this.atualizarCard(chave, dados.pontos[chave]);
                        }
                    });
                }
                
                // Carregar atributos
                if (dados.atributos) {
                    this.atributos = { ...this.atributos, ...dados.atributos };
                    this.atualizarDisplayAtributos();
                }
                
                // Carregar financeiro
                if (dados.financeiro) {
                    this.financeiro = dados.financeiro;
                    document.getElementById('nivelRiqueza').textContent = this.financeiro.nivelRiqueza;
                    document.getElementById('saldoPersonagem').textContent = this.financeiro.saldoPersonagem;
                    document.getElementById('nivelAparencia').textContent = this.financeiro.nivelAparencia;
                }
                
                // Carregar identificação
                if (dados.identificacao) {
                    this.identificacao = dados.identificacao;
                    document.getElementById('dashboardRaca').value = this.identificacao.raca || '';
                    document.getElementById('dashboardClasse').value = this.identificacao.classe || '';
                    document.getElementById('dashboardNivel').value = this.identificacao.nivel || '';
                    document.getElementById('dashboardDescricao').value = this.identificacao.descricao || '';
                }
                
                console.log('📂 Dados do dashboard carregados');
                this.atualizarTotalLiquido();
                this.atualizarSaldoDisponivel();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    salvarFoto(base64) {
        localStorage.setItem('dashboardFoto', base64);
    }

    // ===== FUNÇÃO PRINCIPAL =====
    atualizarTudo() {
        this.atualizarTotalLiquido();
        this.atualizarSaldoDisponivel();
        this.atualizarDisplayAtributos();
        this.verificarLimiteDesvantagens();
    }

    // ===== FUNÇÕES PARA OUTRAS ABAS =====
    atualizarAtributos(st, dx, iq, ht) {
        const pontosAtributos = (st - 10) * 10 + (dx - 10) * 20 + (iq - 10) * 20 + (ht - 10) * 10;
        
        this.processarDadosAtributos({
            ST: st,
            DX: dx,
            IQ: iq,
            HT: ht,
            pontosAtributos: pontosAtributos
        });
    }

    atualizarCaracteristicas(vantagens, desvantagens) {
        const totalVantagens = vantagens.reduce((sum, item) => sum + (item.pontos || 0), 0);
        const totalDesvantagens = desvantagens.reduce((sum, item) => sum + (item.pontos || 0), 0);
        
        this.atualizarPontosVantagens({ total: totalVantagens });
        this.atualizarPontosDesvantagens({ total: totalDesvantagens });
    }

    atualizarPericias(pericias) {
        const totalPericias = pericias.reduce((sum, item) => sum + (item.pontos || 0), 0);
        this.atualizarPontosPericias({ total: totalPericias });
    }

    // ===== FUNÇÕES DE TESTE =====
    testarAtributos() {
        console.log('🧪 TESTANDO ATRIBUTOS');
        
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
    }

    testarPontos() {
        console.log('🧪 TESTANDO PONTOS');
        
        // Simular pontos de várias categorias
        this.atualizarPontosVantagens({ total: 25 });
        this.atualizarPontosDesvantagens({ total: -15 });
        this.atualizarPontosPericias({ total: 40 });
        this.atualizarPontosMagias({ total: 30 });
        this.atualizarPontosTecnicas({ total: 20 });
        this.atualizarPontosPeculiaridades({ total: 10 });
        
        console.log('Pontos atualizados:', this.pontos);
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
(function() {
    console.log('📁 Carregando DashboardManager...');
    
    // Adicionar CSS para animações
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-alert {
            0% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(231, 76, 60, 0); }
            100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0); }
        }
        
        .resumo-card.positivo { background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%); }
        .resumo-card.negativo { background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); }
        .resumo-card.neutro { background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%); }
        
        .atributo-card { cursor: pointer; transition: transform 0.2s; }
        .atributo-card:hover { transform: translateY(-2px); }
        
        .vitalidade-bar { cursor: pointer; }
        .vitalidade-bar:hover { opacity: 0.8; }
    `;
    document.head.appendChild(style);
    
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
                window.dashboardManager.solicitarDadosTodasAbas();
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
    
    window.atualizarDashboardMagias = function(magias) {
        if (window.dashboardManager) {
            window.dashboardManager.atualizarPontosMagias(magias);
        }
    };
    
    window.atualizarDashboardTecnicas = function(tecnicas) {
        if (window.dashboardManager) {
            window.dashboardManager.atualizarPontosTecnicas(tecnicas);
        }
    };
    
    window.atualizarDashboardPeculiaridades = function(peculiaridades) {
        if (window.dashboardManager) {
            window.dashboardManager.atualizarPontosPeculiaridades(peculiaridades);
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
    
    // Funções de teste
    window.testarDashboard = function() {
        if (window.dashboardManager) {
            window.dashboardManager.testarAtributos();
            window.dashboardManager.testarPontos();
        }
    };
    
    // Função para exportar dados
    window.exportarDashboard = function() {
        if (window.dashboardManager) {
            const dados = {
                pontos: window.dashboardManager.pontos,
                atributos: window.dashboardManager.atributos,
                financeiro: window.dashboardManager.financeiro,
                identificacao: window.dashboardManager.identificacao
            };
            
            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };
    
    // Função para resetar dashboard
    window.resetarDashboard = function() {
        if (confirm('Tem certeza que deseja resetar todos os dados do dashboard?')) {
            localStorage.clear();
            location.reload();
        }
    };
    
    console.log('✅ DashboardManager carregado! Use testarDashboard() para testar.');
})();