// ===========================================
// DASHBOARD.JS - SISTEMA COMPLETO
// ===========================================

class DashboardGURPS {
    constructor() {
        console.log('🎮 Inicializando Dashboard GURPS...');
        
        this.estado = {
            // Identificação
            nome: '',
            tipo: '',
            jogador: '',
            foto: null,
            
            // Atributos
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
            
            // Status Social
            aparenciaPontos: 0,
            riquezaPontos: 0,
            status: 0,
            reputacao: 0,
            
            // Características Físicas
            altura: '1.70 m',
            peso: '70 kg',
            idade: '25 anos',
            aparencia: 'Comum',
            descricao: ''
        };
        
        this.observers = [];
        this.inicializado = false;
    }

    // ===== INICIALIZAÇÃO =====
    iniciar() {
        if (this.inicializado) return;
        
        console.log('⚙️ Configurando sistema...');
        
        // Carregar tudo
        this.carregarTudo();
        
        // Configurar eventos
        this.configurarEventos();
        
        // Iniciar observadores
        this.iniciarObservadores();
        
        // Atualizar interface
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('✅ Dashboard inicializada');
    }

    // ===== CARREGAMENTO =====
    carregarTudo() {
        console.log('📂 Carregando dados...');
        
        // Carregar do localStorage
        this.carregarLocalStorage();
        
        // Carregar de outros sistemas
        this.carregarDeOutrosSistemas();
        
        // Aplicar na interface
        this.aplicarEstado();
    }

    carregarLocalStorage() {
        try {
            const salvo = localStorage.getItem('gurps_dashboard_completo');
            if (salvo) {
                const dados = JSON.parse(salvo);
                this.estado = { ...this.estado, ...dados };
                console.log('💾 Estado carregado do localStorage');
            }
        } catch (e) {
            console.warn('Erro ao carregar do localStorage:', e);
        }
    }

    carregarDeOutrosSistemas() {
        // Carregar aparência
        const pontosAparencia = localStorage.getItem('gurps_pontos_aparencia');
        if (pontosAparencia) {
            this.estado.aparenciaPontos = parseInt(pontosAparencia) || 0;
            this.atualizarAparencia(this.estado.aparenciaPontos);
        }

        // Carregar riqueza
        const pontosRiqueza = localStorage.getItem('gurps_pontos_riqueza');
        if (pontosRiqueza) {
            this.estado.riquezaPontos = parseInt(pontosRiqueza) || 0;
            this.atualizarRiqueza(this.estado.riquezaPontos);
        }

        // Carregar atributos
        const atributosSalvos = localStorage.getItem('gurps_atributos');
        if (atributosSalvos) {
            try {
                const atributos = JSON.parse(atributosSalvos);
                if (atributos.atributos) {
                    this.estado.ST = atributos.atributos.ST || 10;
                    this.estado.DX = atributos.atributos.DX || 10;
                    this.estado.IQ = atributos.atributos.IQ || 10;
                    this.estado.HT = atributos.atributos.HT || 10;
                }
            } catch (e) {
                console.warn('Erro ao carregar atributos:', e);
            }
        }
    }

    aplicarEstado() {
        // Aplicar identificação
        this.aplicarIdentificacao();
        
        // Aplicar atributos
        this.aplicarAtributos();
        
        // Aplicar sistema de pontos
        this.aplicarSistemaPontos();
        
        // Aplicar status social
        this.aplicarStatusSocial();
    }

    aplicarIdentificacao() {
        const elementos = {
            'char-name': this.estado.nome,
            'char-type': this.estado.tipo,
            'char-player': this.estado.jogador,
            'phys-height': this.estado.altura,
            'phys-weight': this.estado.peso,
            'phys-age': this.estado.idade,
            'phys-appearance': this.estado.aparencia,
            'phys-description': this.estado.descricao
        };

        for (const [id, valor] of Object.entries(elementos)) {
            const element = document.getElementById(id);
            if (element) {
                if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
                    element.value = valor;
                } else {
                    element.textContent = valor;
                }
            }
        }

        // Aplicar foto
        if (this.estado.foto) {
            this.exibirFoto(this.estado.foto);
        }
    }

    aplicarAtributos() {
        // Atualizar atributos principais
        this.atualizarElemento('attr-st', this.estado.ST);
        this.atualizarElemento('attr-dx', this.estado.DX);
        this.atualizarElemento('attr-iq', this.estado.IQ);
        this.atualizarElemento('attr-ht', this.estado.HT);

        // Calcular detalhes
        this.calcularDetalhesAtributos();
        
        // Atualizar atributos secundários
        this.atualizarAtributosSecundarios();
    }

    aplicarSistemaPontos() {
        // Configurações
        this.atualizarElemento('start-points', this.estado.pontosIniciais, true);
        this.atualizarElemento('dis-limit', this.estado.limiteDesvantagens, true);
        
        // Calcular pontos
        this.calcularPontosAtributos();
        this.atualizarSistemaPontos();
    }

    aplicarStatusSocial() {
        // Status e reputação
        this.atualizarElemento('status-mod', this.estado.status);
        this.atualizarElemento('rep-mod', this.estado.reputacao);
        
        // Aparência já foi atualizada
        this.atualizarReacaoTotal();
    }

    // ===== UPLOAD DE FOTO =====
    configurarUploadFoto() {
        console.log('📸 Configurando upload de foto...');
        
        const uploadInput = document.getElementById('char-upload');
        const photoFrame = document.querySelector('.photo-frame');
        const deleteBtn = document.querySelector('.delete-btn');
        
        if (!uploadInput || !photoFrame) return;

        // Clique no frame
        photoFrame.addEventListener('click', () => uploadInput.click());

        // Mudança no input
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processarFoto(file);
            }
        });

        // Botão remover
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removerFoto();
            });
        }
    }

    processarFoto(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fotoData = e.target.result;
            
            // Exibir foto
            this.exibirFoto(fotoData);
            
            // Salvar no estado
            this.estado.foto = fotoData;
            
            // Mostrar controles
            this.mostrarControlesFoto(true);
            
            // Salvar
            this.salvarEstado();
            
            console.log('✅ Foto processada');
        };
        
        reader.readAsDataURL(file);
    }

    exibirFoto(fotoData) {
        const photoPreview = document.getElementById('photo-preview');
        if (!photoPreview) return;
        
        // Limpar e criar imagem
        photoPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = fotoData;
        img.alt = 'Foto do Personagem';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        
        photoPreview.appendChild(img);
        photoPreview.parentElement.classList.add('has-photo');
    }

    mostrarControlesFoto(mostrar) {
        const photoControls = document.getElementById('photo-controls');
        if (photoControls) {
            photoControls.style.display = mostrar ? 'flex' : 'none';
        }
    }

    carregarFotoSalva() {
        if (this.estado.foto) {
            this.exibirFoto(this.estado.foto);
            this.mostrarControlesFoto(true);
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
        
        // Remover classe
        photoPreview.parentElement.classList.remove('has-photo');
        
        // Esconder controles
        this.mostrarControlesFoto(false);
        
        // Limpar input
        const uploadInput = document.getElementById('char-upload');
        if (uploadInput) uploadInput.value = '';
        
        // Limpar estado
        this.estado.foto = null;
        this.salvarEstado();
        
        console.log('✅ Foto removida');
    }

    // ===== SISTEMA DE ATRIBUTOS =====
    calcularDetalhesAtributos() {
        // ST: Dano
        const dano = this.calcularDano(this.estado.ST);
        this.atualizarElemento('attr-st-details', `Dano: ${dano.gdp}/${dano.geb}`);
        
        // DX: Esquiva
        const esquiva = Math.floor(this.estado.DX / 2) + 3;
        this.atualizarElemento('attr-dx-details', `Esquiva: ${esquiva}`);
        
        // IQ: Vontade
        this.atualizarElemento('attr-iq-details', `Vontade: ${this.estado.IQ}`);
        
        // HT: Resistência
        this.atualizarElemento('attr-ht-details', `Resistência: ${this.estado.HT}`);
    }

    calcularDano(ST) {
        // Tabela simplificada de dano GURPS
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
        return { gdp: "2d-1", geb: "3d+1" };
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

    calcularPontosAtributos() {
        // Cálculo GURPS padrão
        const custoST = (this.estado.ST - 10) * 10;
        const custoDX = (this.estado.DX - 10) * 20;
        const custoIQ = (this.estado.IQ - 10) * 20;
        const custoHT = (this.estado.HT - 10) * 10;
        
        this.estado.gastosAtributos = custoST + custoDX + custoIQ + custoHT;
        return this.estado.gastosAtributos;
    }

    // ===== SISTEMA DE PONTOS =====
    atualizarSistemaPontos() {
        console.log('🧮 Atualizando sistema de pontos...');
        
        // Separar vantagens e desvantagens
        const vantagens = Math.max(this.estado.aparenciaPontos, 0) + 
                         Math.max(this.estado.riquezaPontos, 0);
        
        const desvantagens = Math.min(this.estado.aparenciaPontos, 0) + 
                           Math.min(this.estado.riquezaPontos, 0);
        
        // Atualizar displays
        this.atualizarElemento('points-adv', vantagens);
        this.atualizarElemento('points-dis', desvantagens);
        
        // Atualizar resumo
        this.atualizarElemento('sum-advantages', vantagens);
        this.atualizarElemento('sum-disadvantages', Math.abs(desvantagens));
        
        // Calcular saldo total
        const totalGasto = this.estado.gastosAtributos + 
                          vantagens + 
                          desvantagens + 
                          this.estado.pericias + 
                          this.estado.magias;
        
        const saldo = this.estado.pontosIniciais - totalGasto;
        
        // Atualizar saldo
        this.atualizarElemento('points-balance', saldo);
        
        // Verificar limites
        this.verificarLimites(desvantagens, saldo);
        
        console.log(`💰 Saldo: ${saldo} | Vantagens: ${vantagens} | Desvantagens: ${desvantagens}`);
    }

    verificarLimites(desvantagens, saldo) {
        const balanceElement = document.getElementById('points-balance');
        if (!balanceElement) return;
        
        balanceElement.classList.remove('saldo-negativo', 'limite-excedido');
        
        if (saldo < 0) {
            balanceElement.classList.add('saldo-negativo');
        }
        
        if (desvantagens < this.estado.limiteDesvantagens) {
            balanceElement.classList.add('limite-excedido');
        }
    }

    // ===== STATUS SOCIAL =====
    atualizarAparencia(pontos) {
        this.estado.aparenciaPontos = pontos;
        
        // Mapear pontos para nome
        const niveis = {
            '-24': 'Horrendo', '-20': 'Monstruoso', '-16': 'Hediondo',
            '-8': 'Feio', '-4': 'Sem Atrativos', '0': 'Comum',
            '4': 'Atraente', '12': 'Elegante', '16': 'Muito Elegante',
            '20': 'Lindo'
        };
        
        this.estado.aparencia = niveis[pontos] || 'Comum';
        this.atualizarElemento('phys-appearance', this.estado.aparencia);
        
        // Atualizar modificador
        this.atualizarModificadorAparencia();
        
        // Atualizar sistema de pontos
        this.atualizarSistemaPontos();
    }

    atualizarRiqueza(pontos) {
        this.estado.riquezaPontos = pontos;
        
        // Mapear pontos para nome
        const niveis = {
            '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
            '0': 'Médio', '10': 'Confortável', '20': 'Rico',
            '30': 'Muito Rico', '50': 'Podre de Rico'
        };
        
        const nomeRiqueza = niveis[pontos] || 'Médio';
        this.atualizarElemento('wealth-level', nomeRiqueza);
        
        // Atualizar custo
        const wealthCost = document.querySelector('.wealth-cost');
        if (wealthCost) {
            wealthCost.textContent = `[${pontos >= 0 ? '+' : ''}${pontos} pts]`;
        }
        
        // Atualizar sistema de pontos
        this.atualizarSistemaPontos();
    }

    atualizarModificadorAparencia() {
        const pontos = this.estado.aparenciaPontos;
        let modificador = 0;
        
        if (pontos > 0) {
            modificador = Math.floor(pontos / 4);
        } else if (pontos < 0) {
            modificador = Math.floor(pontos / 4);
        }
        
        this.atualizarElemento('app-mod', modificador);
        this.atualizarReacaoTotal();
    }

    atualizarReacaoTotal() {
        const status = parseInt(document.getElementById('status-mod')?.textContent) || 0;
        const reputacao = parseInt(document.getElementById('rep-mod')?.textContent) || 0;
        const aparencia = parseInt(document.getElementById('app-mod')?.textContent) || 0;
        
        const total = status + reputacao + aparencia;
        this.atualizarElemento('reaction-total', total >= 0 ? `+${total}` : total.toString());
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    configurarEventos() {
        console.log('⚡ Configurando eventos...');
        
        // Upload de foto
        this.configurarUploadFoto();
        
        // Identificação
        this.configurarIdentificacao();
        
        // Sistema de pontos
        this.configurarSistemaPontos();
        
        // Status social
        this.configurarStatusSocial();
        
        // Características físicas
        this.configurarCaracteristicasFisicas();
    }

    configurarIdentificacao() {
        ['char-name', 'char-type', 'char-player'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    const campo = id.replace('char-', '');
                    this.estado[campo] = e.target.value;
                    this.salvarEstado();
                });
            }
        });
    }

    configurarSistemaPontos() {
        // Pontos iniciais
        const startPoints = document.getElementById('start-points');
        if (startPoints) {
            startPoints.addEventListener('input', (e) => {
                this.estado.pontosIniciais = parseInt(e.target.value) || 100;
                this.atualizarSistemaPontos();
                this.salvarEstado();
            });
        }

        // Limite desvantagens
        const disLimit = document.getElementById('dis-limit');
        if (disLimit) {
            disLimit.addEventListener('input', (e) => {
                this.estado.limiteDesvantagens = parseInt(e.target.value) || -75;
                this.atualizarSistemaPontos();
                this.salvarEstado();
            });
        }
    }

    configurarStatusSocial() {
        ['status-mod', 'rep-mod'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.atualizarReacaoTotal();
                    this.salvarEstado();
                });
            }
        });
    }

    configurarCaracteristicasFisicas() {
        const campos = ['phys-height', 'phys-weight', 'phys-age'];
        
        campos.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', (e) => {
                    const campo = id.replace('phys-', '');
                    this.estado[campo] = e.target.value;
                    this.salvarEstado();
                });
            }
        });

        // Descrição
        const descricao = document.getElementById('phys-description');
        if (descricao) {
            descricao.addEventListener('input', (e) => {
                this.estado.descricao = e.target.value;
                this.salvarEstado();
            });
        }
    }

    // ===== OBSERVADORES =====
    iniciarObservadores() {
        console.log('👀 Iniciando observadores...');
        
        // Observar atributos principais
        this.observarAtributos();
        
        // Observar localStorage para mudanças externas
        window.addEventListener('storage', (e) => {
            this.processarMudancaStorage(e);
        });
        
        // Verificar periodicamente
        setInterval(() => this.verificarMudancas(), 2000);
    }

    observarAtributos() {
        const atributos = ['attr-st', 'attr-dx', 'attr-iq', 'attr-ht'];
        
        const observer = new MutationObserver(() => {
            this.atualizarAtributosDaInterface();
        });
        
        atributos.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                observer.observe(el, { 
                    characterData: true, 
                    childList: true, 
                    subtree: true 
                });
            }
        });
    }

    atualizarAtributosDaInterface() {
        try {
            const st = parseInt(document.getElementById('attr-st')?.textContent) || 10;
            const dx = parseInt(document.getElementById('attr-dx')?.textContent) || 10;
            const iq = parseInt(document.getElementById('attr-iq')?.textContent) || 10;
            const ht = parseInt(document.getElementById('attr-ht')?.textContent) || 10;
            
            if (st !== this.estado.ST || dx !== this.estado.DX || 
                iq !== this.estado.IQ || ht !== this.estado.HT) {
                
                this.estado.ST = st;
                this.estado.DX = dx;
                this.estado.IQ = iq;
                this.estado.HT = ht;
                
                this.calcularDetalhesAtributos();
                this.atualizarAtributosSecundarios();
                this.atualizarSistemaPontos();
                this.salvarEstado();
                
                console.log('📊 Atributos atualizados:', { st, dx, iq, ht });
            }
        } catch (error) {
            console.warn('Erro ao atualizar atributos:', error);
        }
    }

    processarMudancaStorage(e) {
        if (e.key === 'gurps_pontos_aparencia') {
            const pontos = parseInt(e.newValue) || 0;
            this.atualizarAparencia(pontos);
            console.log('🎭 Aparência atualizada:', pontos);
        }
        
        if (e.key === 'gurps_pontos_riqueza') {
            const pontos = parseInt(e.newValue) || 0;
            this.atualizarRiqueza(pontos);
            console.log('💰 Riqueza atualizada:', pontos);
        }
        
        if (e.key === 'gurps_atributos') {
            try {
                const dados = JSON.parse(e.newValue);
                if (dados.atributos) {
                    this.estado.ST = dados.atributos.ST || 10;
                    this.estado.DX = dados.atributos.DX || 10;
                    this.estado.IQ = dados.atributos.IQ || 10;
                    this.estado.HT = dados.atributos.HT || 10;
                    
                    this.aplicarAtributos();
                    this.atualizarSistemaPontos();
                    console.log('⚔️ Atributos atualizados do localStorage');
                }
            } catch (error) {
                console.warn('Erro ao processar atributos:', error);
            }
        }
    }

    verificarMudancas() {
        // Verificar aparência
        const aparenciaAtual = parseInt(localStorage.getItem('gurps_pontos_aparencia')) || 0;
        if (aparenciaAtual !== this.estado.aparenciaPontos) {
            this.atualizarAparencia(aparenciaAtual);
        }
        
        // Verificar riqueza
        const riquezaAtual = parseInt(localStorage.getItem('gurps_pontos_riqueza')) || 0;
        if (riquezaAtual !== this.estado.riquezaPontos) {
            this.atualizarRiqueza(riquezaAtual);
        }
    }

    // ===== ATUALIZAÇÕES =====
    atualizarTudo() {
        console.log('🔄 Atualizando tudo...');
        
        this.atualizarTimestamp();
        this.atualizarResumo();
        this.salvarEstado();
    }

    atualizarTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        this.atualizarElemento('current-time', timeString);
    }

    atualizarResumo() {
        // Atualizar contagens
        this.atualizarElemento('sum-skills', this.estado.pericias);
        this.atualizarElemento('sum-spells', this.estado.magias);
        
        // Contar itens (exemplo)
        const itensCount = 0; // Você pode implementar contagem real aqui
        this.atualizarElemento('sum-items', itensCount);
    }

    atualizarElemento(id, valor, isInput = false) {
        const element = document.getElementById(id);
        if (!element) return;
        
        if (isInput && (element.tagName === 'INPUT' || element.tagName === 'SELECT')) {
            element.value = valor;
        } else if (element.tagName === 'TEXTAREA') {
            element.value = valor;
        } else {
            element.textContent = valor;
        }
    }

    // ===== PERSISTÊNCIA =====
    salvarEstado() {
        try {
            localStorage.setItem('gurps_dashboard_completo', JSON.stringify(this.estado));
            console.log('💾 Estado salvo');
        } catch (e) {
            console.warn('Erro ao salvar estado:', e);
        }
    }

    // ===== EXPORTAÇÃO =====
    exportarDados() {
        return {
            ...this.estado,
            timestamp: new Date().toISOString(),
            atributosDetalhados: {
                ST: this.estado.ST,
                DX: this.estado.DX,
                IQ: this.estado.IQ,
                HT: this.estado.HT,
                dano: this.calcularDano(this.estado.ST),
                esquiva: Math.floor(this.estado.DX / 2) + 3
            }
        };
    }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let dashboardGURPS = null;

function inicializarDashboard() {
    if (!dashboardGURPS) {
        dashboardGURPS = new DashboardGURPS();
    }
    
    // Inicializar quando a dashboard estiver ativa
    const verificarDashboard = () => {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
            setTimeout(() => {
                dashboardGURPS.iniciar();
            }, 100);
        }
    };
    
    // Verificar agora
    verificarDashboard();
    
    // Observar mudanças de aba
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                verificarDashboard();
            }
        });
    });
    
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab) {
        observer.observe(dashboardTab, { attributes: true });
    }
}

// ===== FUNÇÕES GLOBAIS =====
function removerFoto() {
    if (dashboardGURPS) {
        dashboardGURPS.removerFoto();
    }
}

function testarDashboard() {
    console.log('🧪 Testando dashboard...');
    console.log('Instância:', dashboardGURPS);
    console.log('Estado:', dashboardGURPS?.estado);
    console.log('Pontos aparência:', dashboardGURPS?.estado.aparenciaPontos);
    console.log('Pontos riqueza:', dashboardGURPS?.estado.riquezaPontos);
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDashboard);
} else {
    inicializarDashboard();
}

// ===== EXPORTAÇÃO =====
window.DashboardGURPS = DashboardGURPS;
window.dashboardGURPS = dashboardGURPS;
window.removerFoto = removerFoto;
window.testarDashboard = testarDashboard;