// ===========================================
// DASHBOARD.JS - SISTEMA COMPLETO DE ATRIBUTOS
// ===========================================

class DashboardGURPS {
    constructor() {
        console.log('🎮 Dashboard GURPS - Sistema de Atributos');
        
        this.estado = {
            // Atributos principais (VALORES REAIS)
            ST: 10,
            DX: 10,
            IQ: 10,
            HT: 10,
            
            // Sistema de Pontos
            pontosIniciais: 100,
            limiteDesvantagens: -75,
            gastosAtributos: 0,
            vantagens: 0,
            desvantagens: 0,
            pericias: 0,
            magias: 0,
            
            // Identificação
            foto: null
        };
        
        this.observandoAtributos = false;
        this.inicializado = false;
    }

    // ===== INICIALIZAÇÃO PRINCIPAL =====
    iniciar() {
        if (this.inicializado) return;
        
        console.log('⚙️ Inicializando sistema de atributos...');
        
        // 1. Carregar dados
        this.carregarDados();
        
        // 2. Configurar eventos
        this.configurarEventosBasicos();
        
        // 3. Configurar upload de foto (arrumado)
        this.configurarUploadFotoCorrigido();
        
        // 4. Iniciar observadores de atributos
        this.iniciarObservadoresAtributos();
        
        // 5. Calcular tudo
        this.calcularTudo();
        
        this.inicializado = true;
        console.log('✅ Sistema de atributos pronto');
    }

    // ===== CARREGAMENTO DE DADOS =====
    carregarDados() {
        console.log('📂 Carregando dados...');
        
        // Carregar estado salvo da dashboard
        this.carregarEstadoSalvo();
        
        // Carregar atributos do sistema de atributos
        this.carregarAtributosDoSistema();
        
        // Carregar foto
        this.carregarFotoSalva();
        
        // Aplicar valores iniciais
        this.aplicarValoresIniciais();
    }

    carregarEstadoSalvo() {
        try {
            const salvo = localStorage.getItem('gurps_dashboard_estado');
            if (salvo) {
                const dados = JSON.parse(salvo);
                this.estado = { ...this.estado, ...dados };
                console.log('💾 Estado carregado');
            }
        } catch (e) {
            console.warn('Erro ao carregar estado:', e);
        }
    }

    carregarAtributosDoSistema() {
        try {
            const atributosSalvos = localStorage.getItem('gurps_atributos');
            if (atributosSalvos) {
                const dados = JSON.parse(atributosSalvos);
                
                if (dados.atributos) {
                    // Pegar valores REAIS dos atributos
                    this.estado.ST = dados.atributos.ST || 10;
                    this.estado.DX = dados.atributos.DX || 10;
                    this.estado.IQ = dados.atributos.IQ || 10;
                    this.estado.HT = dados.atributos.HT || 10;
                    
                    console.log('⚔️ Atributos carregados:', {
                        ST: this.estado.ST,
                        DX: this.estado.DX,
                        IQ: this.estado.IQ,
                        HT: this.estado.HT
                    });
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar atributos:', e);
        }
    }

    carregarFotoSalva() {
        try {
            const fotoSalva = localStorage.getItem('gurps_foto_personagem');
            if (fotoSalva) {
                this.estado.foto = fotoSalva;
                console.log('📸 Foto carregada do cache');
            }
        } catch (e) {
            console.warn('Erro ao carregar foto:', e);
        }
    }

    aplicarValoresIniciais() {
        // Aplicar pontos iniciais e limite
        const startPoints = document.getElementById('start-points');
        const disLimit = document.getElementById('dis-limit');
        
        if (startPoints) startPoints.value = this.estado.pontosIniciais;
        if (disLimit) disLimit.value = this.estado.limiteDesvantagens;
        
        // Aplicar atributos na interface
        this.atualizarAtributosNaInterface();
        
        // Aplicar foto se existir
        if (this.estado.foto) {
            this.exibirFoto(this.estado.foto);
        }
    }

    // ===== SISTEMA DE ATRIBUTOS =====
    atualizarAtributosNaInterface() {
        console.log('🔄 Atualizando atributos na interface...');
        
        // Atualizar valores principais
        this.atualizarElemento('attr-st', this.estado.ST);
        this.atualizarElemento('attr-dx', this.estado.DX);
        this.atualizarElemento('attr-iq', this.estado.IQ);
        this.atualizarElemento('attr-ht', this.estado.HT);
        
        // Atualizar detalhes
        this.calcularDetalhesAtributos();
        
        // Atualizar atributos secundários
        this.atualizarAtributosSecundarios();
        
        // Calcular pontos
        this.calcularPontosAtributos();
    }

    calcularDetalhesAtributos() {
        // ST: Dano
        const dano = this.calcularDanoBase(this.estado.ST);
        this.atualizarElemento('attr-st-details', `Dano: ${dano.gdp}/${dano.geb}`);
        
        // DX: Esquiva
        const esquiva = Math.floor(this.estado.DX / 2) + 3;
        this.atualizarElemento('attr-dx-details', `Esquiva: ${esquiva}`);
        
        // IQ: Vontade
        this.atualizarElemento('attr-iq-details', `Vontade: ${this.estado.IQ}`);
        
        // HT: Resistência
        this.atualizarElemento('attr-ht-details', `Resistência: ${this.estado.HT}`);
    }

    calcularDanoBase(ST) {
        // Tabela de dano GURPS (simplificada)
        if (ST <= 5) return { gdp: "1d-4", geb: "1d-3" };
        if (ST <= 7) return { gdp: "1d-3", geb: "1d-2" };
        if (ST <= 9) return { gdp: "1d-2", geb: "1d-1" };
        if (ST <= 10) return { gdp: "1d-2", geb: "1d" };
        if (ST <= 12) return { gdp: "1d-1", geb: "1d+1" };
        if (ST <= 13) return { gdp: "1d", geb: "1d+2" };
        if (ST <= 14) return { gdp: "1d", geb: "2d" };
        if (ST <= 15) return { gdp: "1d+1", geb: "2d+1" };
        if (ST <= 16) return { gdp: "1d+1", geb: "2d+2" };
        if (ST <= 17) return { gdp: "1d+2", geb: "3d-1" };
        if (ST <= 18) return { gdp: "1d+2", geb: "3d" };
        if (ST <= 19) return { gdp: "2d-1", geb: "3d+1" };
        if (ST <= 20) return { gdp: "2d-1", geb: "3d+2" };
        return { gdp: "2d", geb: "4d" };
    }

    atualizarAtributosSecundarios() {
        // Pontos de Vida (PV) = ST
        this.atualizarElemento('pv-current', this.estado.ST);
        this.atualizarElemento('pv-max', this.estado.ST);
        
        // Pontos de Fadiga (PF) = HT
        this.atualizarElemento('fp-current', this.estado.HT);
        this.atualizarElemento('fp-max', this.estado.HT);
        
        // Vontade = IQ
        this.atualizarElemento('will-value', this.estado.IQ);
        
        // Percepção = IQ
        this.atualizarElemento('per-value', this.estado.IQ);
        
        // Deslocamento = (HT + DX) / 4
        const deslocamento = ((this.estado.HT + this.estado.DX) / 4).toFixed(2);
        this.atualizarElemento('move-value', deslocamento);
    }

    // ===== CÁLCULO DE PONTOS DOS ATRIBUTOS =====
    calcularPontosAtributos() {
        console.log('🧮 Calculando pontos dos atributos...');
        
        // Cálculo GURPS PADRÃO:
        // ST: 10 pontos por nível acima/abaixo de 10
        // DX: 20 pontos por nível
        // IQ: 20 pontos por nível  
        // HT: 10 pontos por nível
        
        const custoST = (this.estado.ST - 10) * 10;
        const custoDX = (this.estado.DX - 10) * 20;
        const custoIQ = (this.estado.IQ - 10) * 20;
        const custoHT = (this.estado.HT - 10) * 10;
        
        this.estado.gastosAtributos = custoST + custoDX + custoIQ + custoHT;
        
        console.log(`📊 Cálculo detalhado:`);
        console.log(`  ST: ${this.estado.ST} = ${custoST} pts`);
        console.log(`  DX: ${this.estado.DX} = ${custoDX} pts`);
        console.log(`  IQ: ${this.estado.IQ} = ${custoIQ} pts`);
        console.log(`  HT: ${this.estado.HT} = ${custoHT} pts`);
        console.log(`  TOTAL ATRIBUTOS: ${this.estado.gastosAtributos} pts`);
        
        // Atualizar sistema de pontos
        this.atualizarSistemaPontos();
        
        return this.estado.gastosAtributos;
    }

    atualizarSistemaPontos() {
        console.log('💰 Atualizando sistema de pontos...');
        
        // 1. Gastos com atributos
        const gastosAtributos = this.estado.gastosAtributos;
        
        // 2. Vantagens e desvantagens (por enquanto zero)
        const vantagens = 0; // Vamos adicionar depois
        const desvantagens = 0; // Vamos adicionar depois
        
        // 3. Total gasto
        const totalGasto = gastosAtributos + vantagens + desvantagens + 
                          this.estado.pericias + this.estado.magias;
        
        // 4. Saldo disponível
        const saldo = this.estado.pontosIniciais - totalGasto;
        
        console.log(`💵 Cálculo do saldo:`);
        console.log(`  Pontos iniciais: ${this.estado.pontosIniciais}`);
        console.log(`  Gastos atributos: ${gastosAtributos}`);
        console.log(`  Vantagens: ${vantagens}`);
        console.log(`  Desvantagens: ${desvantagens}`);
        console.log(`  Total gasto: ${totalGasto}`);
        console.log(`  Saldo disponível: ${saldo}`);
        
        // Atualizar interface
        this.atualizarElemento('points-adv', vantagens);
        this.atualizarElemento('points-dis', desvantagens);
        this.atualizarElemento('points-balance', saldo);
        
        // Atualizar resumo
        this.atualizarElemento('sum-advantages', vantagens);
        this.atualizarElemento('sum-disadvantages', Math.abs(desvantagens));
        
        // Verificar se está negativo ou excedeu limite
        this.verificarStatusSaldo(saldo, desvantagens);
        
        // Salvar estado
        this.salvarEstado();
    }

    verificarStatusSaldo(saldo, desvantagens) {
        const balanceElement = document.getElementById('points-balance');
        if (!balanceElement) return;
        
        // Remover classes anteriores
        balanceElement.classList.remove('saldo-negativo', 'limite-excedido');
        
        // Verificar saldo negativo
        if (saldo < 0) {
            balanceElement.classList.add('saldo-negativo');
            console.warn('⚠️ SALDO NEGATIVO!');
        }
        
        // Verificar limite de desvantagens
        if (desvantagens < this.estado.limiteDesvantagens) {
            balanceElement.classList.add('limite-excedido');
            console.warn('⚠️ LIMITE DE DESVANTAGENS EXCEDIDO!');
        }
    }

    // ===== UPLOAD DE FOTO CORRIGIDO =====
    configurarUploadFotoCorrigido() {
        console.log('📸 Configurando upload de foto (corrigido)...');
        
        const uploadInput = document.getElementById('char-upload');
        const photoFrame = document.querySelector('.photo-frame');
        const photoPreview = document.getElementById('photo-preview');
        
        if (!uploadInput || !photoFrame || !photoPreview) {
            console.error('❌ Elementos de foto não encontrados');
            return;
        }
        
        // REMOVER TODOS OS EVENTLISTENERS ANTIGOS
        const newFrame = photoFrame.cloneNode(true);
        photoFrame.parentNode.replaceChild(newFrame, photoFrame);
        
        const newInput = uploadInput.cloneNode(true);
        uploadInput.parentNode.replaceChild(newInput, uploadInput);
        
        // NOVAS REFERÊNCIAS
        const newUploadInput = document.getElementById('char-upload');
        const newPhotoFrame = document.querySelector('.photo-frame');
        
        // CONFIGURAR CLIQUE ÚNICO - SEM BUG
        newPhotoFrame.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖱️ Clique no frame de foto');
            newUploadInput.click();
        }, { once: false });
        
        // CONFIGURAR UPLOAD
        newUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                console.log('📁 Arquivo selecionado:', file.name);
                this.processarFotoUpload(file);
            }
        });
        
        // Configurar botão remover
        const deleteBtn = document.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removerFoto();
            });
        }
        
        // Configurar botão editar
        const editBtn = document.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                newUploadInput.click();
            });
        }
        
        console.log('✅ Upload de foto configurado corretamente');
    }

    processarFotoUpload(file) {
        console.log('🔄 Processando foto...');
        
        const reader = new FileReader();
        
        reader.onload = (e) => {
            console.log('✅ Foto carregada com sucesso');
            const fotoData = e.target.result;
            
            // Exibir foto
            this.exibirFoto(fotoData);
            
            // Salvar
            this.estado.foto = fotoData;
            localStorage.setItem('gurps_foto_personagem', fotoData);
            
            // Mostrar controles
            this.mostrarControlesFoto(true);
            
            // Salvar estado
            this.salvarEstado();
        };
        
        reader.onerror = () => {
            console.error('❌ Erro ao ler a foto');
        };
        
        reader.readAsDataURL(file);
    }

    exibirFoto(fotoData) {
        const photoPreview = document.getElementById('photo-preview');
        if (!photoPreview) return;
        
        // Limpar completamente
        photoPreview.innerHTML = '';
        
        // Criar nova imagem
        const img = new Image();
        img.onload = () => {
            console.log('🖼️ Imagem carregada no preview');
        };
        
        img.src = fotoData;
        img.alt = 'Foto do Personagem';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        
        photoPreview.appendChild(img);
        
        // Adicionar classe para CSS
        const photoContainer = photoPreview.closest('.photo-frame');
        if (photoContainer) {
            photoContainer.classList.add('has-photo');
        }
    }

    mostrarControlesFoto(mostrar) {
        const photoControls = document.getElementById('photo-controls');
        if (photoControls) {
            photoControls.style.display = mostrar ? 'flex' : 'none';
        }
    }

    removerFoto() {
        console.log('🗑️ Removendo foto...');
        
        const photoPreview = document.getElementById('photo-preview');
        if (!photoPreview) return;
        
        // Restaurar placeholder
        photoPreview.innerHTML = `
            <div class="photo-placeholder">
                <i class="fas fa-user-circle"></i>
                <span>Clique para adicionar foto</span>
                <small>Recomendado: 300x400px</small>
            </div>
        `;
        
        // Remover classe has-photo
        const photoContainer = photoPreview.closest('.photo-frame');
        if (photoContainer) {
            photoContainer.classList.remove('has-photo');
        }
        
        // Esconder controles
        this.mostrarControlesFoto(false);
        
        // Limpar input
        const uploadInput = document.getElementById('char-upload');
        if (uploadInput) {
            uploadInput.value = '';
        }
        
        // Limpar estado
        this.estado.foto = null;
        localStorage.removeItem('gurps_foto_personagem');
        
        // Salvar estado
        this.salvarEstado();
        
        console.log('✅ Foto removida');
    }

        // ===== OBSERVADORES DE ATRIBUTOS =====
    iniciarObservadoresAtributos() {
        if (this.observandoAtributos) return;
        
        console.log('👀 Iniciando observadores de atributos...');
        
        // Observar mudanças nos atributos da interface
        this.observarAtributosInterface();
        
        // Observar localStorage para mudanças do sistema de atributos
        this.observarLocalStorageAtributos();
        
        // Verificar periodicamente
        this.iniciarVerificacaoPeriodica();
        
        this.observandoAtributos = true;
    }

    observarAtributosInterface() {
        const atributosIds = ['attr-st', 'attr-dx', 'attr-iq', 'attr-ht'];
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    this.verificarMudancasAtributos();
                }
            });
        });
        
        atributosIds.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element, { 
                    characterData: true, 
                    childList: true, 
                    subtree: true 
                });
                console.log(`👁️ Observando: ${id}`);
            }
        });
    }

    verificarMudancasAtributos() {
        try {
            const stElement = document.getElementById('attr-st');
            const dxElement = document.getElementById('attr-dx');
            const iqElement = document.getElementById('attr-iq');
            const htElement = document.getElementById('attr-ht');
            
            if (!stElement || !dxElement || !iqElement || !htElement) {
                console.log('⏳ Aguardando elementos de atributos...');
                return;
            }
            
            const st = parseInt(stElement.textContent.trim()) || 10;
            const dx = parseInt(dxElement.textContent.trim()) || 10;
            const iq = parseInt(iqElement.textContent.trim()) || 10;
            const ht = parseInt(htElement.textContent.trim()) || 10;
            
            // Verificar se realmente mudou
            if (st !== this.estado.ST || dx !== this.estado.DX || 
                iq !== this.estado.IQ || ht !== this.estado.HT) {
                
                console.log('🔄 Atributos mudaram:', { st, dx, iq, ht });
                
                // Atualizar estado
                this.estado.ST = st;
                this.estado.DX = dx;
                this.estado.IQ = iq;
                this.estado.HT = ht;
                
                // Recalcular tudo
                this.calcularTudo();
                
                // Salvar no localStorage do sistema de atributos também
                this.sincronizarComSistemaAtributos();
            }
        } catch (error) {
            console.warn('Erro ao verificar atributos:', error);
        }
    }

    observarLocalStorageAtributos() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'gurps_atributos') {
                console.log('🔄 Mudança nos atributos detectada no localStorage');
                setTimeout(() => {
                    this.carregarAtributosDoSistema();
                    this.calcularTudo();
                }, 100);
            }
        });
    }

    sincronizarComSistemaAtributos() {
        try {
            // Salvar no formato do sistema de atributos
            const dadosAtributos = {
                atributos: {
                    ST: this.estado.ST,
                    DX: this.estado.DX,
                    IQ: this.estado.IQ,
                    HT: this.estado.HT
                },
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('gurps_atributos', JSON.stringify(dadosAtributos));
            console.log('🔄 Atributos sincronizados com sistema');
        } catch (e) {
            console.warn('Erro ao sincronizar atributos:', e);
        }
    }

    iniciarVerificacaoPeriodica() {
        // Verificar a cada 1.5 segundos para garantir sincronização
        setInterval(() => {
            this.verificarSincronizacaoAtributos();
        }, 1500);
    }

    verificarSincronizacaoAtributos() {
        // Verificar se os atributos na interface estão iguais ao estado
        const stElement = document.getElementById('attr-st');
        const dxElement = document.getElementById('attr-dx');
        const iqElement = document.getElementById('attr-iq');
        const htElement = document.getElementById('attr-ht');
        
        if (!stElement || !dxElement || !iqElement || !htElement) return;
        
        const stInterface = parseInt(stElement.textContent) || 10;
        const dxInterface = parseInt(dxElement.textContent) || 10;
        const iqInterface = parseInt(iqElement.textContent) || 10;
        const htInterface = parseInt(htElement.textContent) || 10;
        
        if (stInterface !== this.estado.ST || dxInterface !== this.estado.DX ||
            iqInterface !== this.estado.IQ || htInterface !== this.estado.HT) {
            
            console.log('🔁 Corrigindo sincronização de atributos...');
            this.atualizarAtributosNaInterface();
        }
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    configurarEventosBasicos() {
        console.log('⚡ Configurando eventos básicos...');
        
        // Sistema de pontos
        this.configurarEventosPontos();
        
        // Características físicas
        this.configurarEventosCaracteristicas();
    }

    configurarEventosPontos() {
        // Pontos iniciais
        const startPoints = document.getElementById('start-points');
        if (startPoints) {
            startPoints.addEventListener('input', (e) => {
                this.estado.pontosIniciais = parseInt(e.target.value) || 100;
                this.atualizarSistemaPontos();
                this.salvarEstado();
            });
        }

        // Limite de desvantagens
        const disLimit = document.getElementById('dis-limit');
        if (disLimit) {
            disLimit.addEventListener('input', (e) => {
                this.estado.limiteDesvantagens = parseInt(e.target.value) || -75;
                this.atualizarSistemaPontos();
                this.salvarEstado();
            });
        }
    }

    configurarEventosCaracteristicas() {
        // Descrição física
        const descricao = document.getElementById('phys-description');
        if (descricao) {
            descricao.addEventListener('input', (e) => {
                this.salvarEstado();
            });
        }
        
        // Campos de altura, peso, idade
        ['phys-height', 'phys-weight', 'phys-age'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.salvarEstado();
                });
            }
        });
    }

    // ===== CÁLCULO GERAL =====
    calcularTudo() {
        console.log('🧮 Calculando tudo...');
        
        // 1. Detalhes dos atributos
        this.calcularDetalhesAtributos();
        
        // 2. Atributos secundários
        this.atualizarAtributosSecundarios();
        
        // 3. Pontos dos atributos
        this.calcularPontosAtributos();
        
        // 4. Sistema de pontos completo
        this.atualizarSistemaPontos();
        
        // 5. Timestamp
        this.atualizarTimestamp();
        
        console.log('✅ Cálculos completos');
    }

    // ===== UTILITÁRIOS =====
    atualizarElemento(id, valor) {
        const element = document.getElementById(id);
        if (element) {
            // Verificar se é input ou texto normal
            if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                element.value = valor;
            } else {
                element.textContent = valor;
            }
            return true;
        }
        return false;
    }

    atualizarTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        this.atualizarElemento('current-time', timeString);
    }

    // ===== PERSISTÊNCIA =====
    salvarEstado() {
        try {
            localStorage.setItem('gurps_dashboard_estado', JSON.stringify(this.estado));
            console.log('💾 Estado salvo');
        } catch (e) {
            console.warn('Erro ao salvar estado:', e);
        }
    }

    // ===== INICIALIZAÇÃO AUTOMÁTICA =====
    static iniciarDashboard() {
        if (!window.dashboardGURPS) {
            window.dashboardGURPS = new DashboardGURPS();
        }
        
        // Função para verificar se a dashboard está ativa
        const verificarDashboardAtiva = () => {
            const dashboardTab = document.getElementById('dashboard');
            if (dashboardTab && dashboardTab.classList.contains('active')) {
                console.log('🎯 Dashboard ativa - Inicializando...');
                window.dashboardGURPS.iniciar();
            }
        };
        
        // Verificar agora
        verificarDashboardAtiva();
        
        // Observar mudanças na aba
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    verificarDashboardAtiva();
                }
            });
        });
        
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab) {
            observer.observe(dashboardTab, { attributes: true });
        }
        
        // Também verificar após um tempo para garantir
        setTimeout(verificarDashboardAtiva, 500);
    }
}

// ===== FUNÇÕES GLOBAIS =====
function removerFoto() {
    if (window.dashboardGURPS) {
        window.dashboardGURPS.removerFoto();
    } else {
        console.error('❌ Dashboard não inicializada');
    }
}

function testarAtributos() {
    console.log('🧪 Testando sistema de atributos...');
    
    if (!window.dashboardGURPS) {
        console.error('❌ Dashboard não inicializada');
        return;
    }
    
    console.log('Estado atual:', window.dashboardGURPS.estado);
    
    // Teste de cálculo
    const gastos = window.dashboardGURPS.calcularPontosAtributos();
    console.log(`Gastos com atributos: ${gastos} pontos`);
    
    // Mostrar saldo
    const saldo = parseInt(document.getElementById('points-balance')?.textContent) || 0;
    console.log(`Saldo disponível: ${saldo} pontos`);
    
    // Verificar se cálculo está correto
    const pontosIniciais = window.dashboardGURPS.estado.pontosIniciais;
    const saldoCalculado = pontosIniciais - gastos;
    console.log(`Cálculo manual: ${pontosIniciais} - ${gastos} = ${saldoCalculado}`);
    
    if (saldo !== saldoCalculado) {
        console.warn('⚠️ DISCREPÂNCIA NO CÁLCULO!');
    }
}

// ===== INICIALIZAÇÃO =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM carregado - Preparando dashboard');
        DashboardGURPS.iniciarDashboard();
    });
} else {
    console.log('⚡ DOM já carregado - Inicializando dashboard');
    DashboardGURPS.iniciarDashboard();
}

// ===== EXPORTAÇÃO =====
window.DashboardGURPS = DashboardGURPS;
window.removerFoto = removerFoto;
window.testarAtributos = testarAtributos;
window.dashboardGURPS = null; // Será inicializado automaticamente

// ===== DEBUG =====
console.log('🎮 Script dashboard.js carregado');