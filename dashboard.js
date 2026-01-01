// ===========================================
// DASHBOARD.JS - Sistema Completo da Dashboard
// ===========================================

class DashboardGURPS {
    constructor() {
        console.log('🎮 Inicializando Dashboard GURPS...');
        
        this.pontos = {
            inicial: 100,
            gastosAtributos: 0,
            vantagens: 0,
            desvantagens: 0,
            pericias: 0,
            magias: 0,
            limiteDesvantagens: -75
        };

        this.personagem = {
            nome: '',
            tipo: '',
            jogador: '',
            foto: null,
            aparencia: 0,
            riqueza: 0,
            status: 0,
            reputacao: 0
        };

        this.inicializado = false;
    }

    // ===== INICIALIZAÇÃO PRINCIPAL =====
    inicializar() {
        if (this.inicializado) return;
        
        console.log('⚙️ Configurando dashboard...');
        
        // 1. Carregar dados salvos
        this.carregarDados();
        
        // 2. Configurar eventos
        this.configurarEventos();
        
        // 3. Configurar upload de foto
        this.configurarUploadFoto();
        
        // 4. Iniciar observadores
        this.iniciarObservadores();
        
        // 5. Atualizar tudo
        this.atualizarTudo();
        
        this.inicializado = true;
        console.log('✅ Dashboard pronta!');
    }

    // ===== CARREGAMENTO DE DADOS =====
    carregarDados() {
        console.log('📂 Carregando dados...');
        
        // Carregar identificação
        this.carregarIdentificacao();
        
        // Carregar foto
        this.carregarFoto();
        
        // Carregar pontos de aparência e riqueza
        this.carregarPontosExternos();
        
        // Carregar configurações
        this.carregarConfiguracoes();
    }

    carregarIdentificacao() {
        ['char-name', 'char-type', 'char-player'].forEach(id => {
            const valor = localStorage.getItem(`dashboard_${id}`);
            const input = document.getElementById(id);
            if (valor && input) {
                input.value = valor;
                this.personagem[id.replace('char-', '')] = valor;
            }
        });
    }

    carregarFoto() {
        try {
            const fotoSalva = localStorage.getItem('dashboard_foto');
            if (fotoSalva) {
                this.exibirFoto(fotoSalva);
                this.personagem.foto = fotoSalva;
            }
        } catch (e) {
            console.warn('Erro ao carregar foto:', e);
        }
    }

    carregarPontosExternos() {
        // Carregar aparência
        const pontosAparencia = localStorage.getItem('gurps_pontos_aparencia');
        if (pontosAparencia) {
            this.personagem.aparencia = parseInt(pontosAparencia);
            console.log(`🎭 Aparência carregada: ${pontosAparencia} pontos`);
        }

        // Carregar riqueza
        const pontosRiqueza = localStorage.getItem('gurps_pontos_riqueza');
        if (pontosRiqueza) {
            this.personagem.riqueza = parseInt(pontosRiqueza);
            console.log(`💰 Riqueza carregada: ${pontosRiqueza} pontos`);
        }
    }

    carregarConfiguracoes() {
        const pontosInicial = localStorage.getItem('dashboard_pontos_inicial');
        const limiteDesv = localStorage.getItem('dashboard_limite_desvantagens');
        
        if (pontosInicial) {
            this.pontos.inicial = parseInt(pontosInicial);
            document.getElementById('start-points').value = pontosInicial;
        }
        
        if (limiteDesv) {
            this.pontos.limiteDesvantagens = parseInt(limiteDesv);
            document.getElementById('dis-limit').value = limiteDesv;
        }
    }

    // ===== UPLOAD DE FOTO =====
    configurarUploadFoto() {
        const uploadInput = document.getElementById('char-upload');
        const photoFrame = document.querySelector('.photo-frame');
        
        if (!uploadInput || !photoFrame) {
            console.error('❌ Elementos de foto não encontrados');
            return;
        }
        
        console.log('📸 Configurando upload de foto...');
        
        // Configurar clique no frame
        photoFrame.addEventListener('click', () => {
            uploadInput.click();
        });
        
        // Configurar mudança no input
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.processarFoto(file);
            }
        });
        
        // Verificar se já tem foto
        if (this.personagem.foto) {
            this.mostrarControlesFoto(true);
        }
    }

    processarFoto(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fotoData = e.target.result;
            
            // Exibir foto
            this.exibirFoto(fotoData);
            
            // Salvar
            this.salvarFoto(fotoData);
            
            // Mostrar controles
            this.mostrarControlesFoto(true);
            
            console.log('✅ Foto carregada com sucesso');
        };
        
        reader.onerror = () => {
            console.error('❌ Erro ao ler a foto');
        };
        
        reader.readAsDataURL(file);
    }

    exibirFoto(fotoData) {
        const photoPreview = document.getElementById('photo-preview');
        if (!photoPreview) return;
        
        // Limpar preview
        photoPreview.innerHTML = '';
        
        // Criar imagem
        const img = document.createElement('img');
        img.src = fotoData;
        img.alt = 'Foto do Personagem';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        
        // Adicionar imagem
        photoPreview.appendChild(img);
        
        // Adicionar classe
        photoPreview.parentElement.classList.add('has-photo');
    }

    mostrarControlesFoto(mostrar) {
        const photoControls = document.getElementById('photo-controls');
        if (photoControls) {
            photoControls.style.display = mostrar ? 'flex' : 'none';
        }
    }

    salvarFoto(fotoData) {
        try {
            localStorage.setItem('dashboard_foto', fotoData);
            this.personagem.foto = fotoData;
            console.log('💾 Foto salva no localStorage');
        } catch (e) {
            console.warn('⚠️ Não foi possível salvar a foto:', e);
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
        
        // Remover do localStorage
        localStorage.removeItem('dashboard_foto');
        this.personagem.foto = null;
        
        console.log('✅ Foto removida');
    }

    // ===== SISTEMA DE PONTOS =====
    configurarEventos() {
        console.log('⚡ Configurando eventos...');
        
        // Sistema de pontos
        document.getElementById('start-points')?.addEventListener('input', (e) => {
            this.pontos.inicial = parseInt(e.target.value) || 100;
            localStorage.setItem('dashboard_pontos_inicial', e.target.value);
            this.atualizarSaldo();
        });
        
        document.getElementById('dis-limit')?.addEventListener('input', (e) => {
            this.pontos.limiteDesvantagens = parseInt(e.target.value) || -75;
            localStorage.setItem('dashboard_limite_desvantagens', e.target.value);
            this.atualizarSaldo();
        });
        
        // Identificação
        ['char-name', 'char-type', 'char-player'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', (e) => {
                    const chave = id.replace('char-', '');
                    this.personagem[chave] = e.target.value;
                    localStorage.setItem(`dashboard_${id}`, e.target.value);
                });
            }
        });
        
        // Status social
        ['status-mod', 'rep-mod'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.atualizarReacaoTotal();
                });
            }
        });
    }

    iniciarObservadores() {
        console.log('👀 Iniciando observadores...');
        
        // Observar atributos principais
        this.observarAtributos();
        
        // Observar atributos secundários
        this.observarAtributosSecundarios();
        
        // Observar localStorage para mudanças externas
        window.addEventListener('storage', (e) => {
            if (e.key === 'gurps_pontos_aparencia' || e.key === 'gurps_pontos_riqueza') {
                console.log(`🔄 Mudança externa detectada: ${e.key}`);
                this.carregarPontosExternos();
                this.atualizarSistemaPontos();
                this.atualizarStatusSocial();
            }
        });
        
        // Escanear a cada 2 segundos para garantir sincronização
        setInterval(() => {
            this.verificarAtributos();
            this.verificarPontosExternos();
        }, 2000);
    }

    observarAtributos() {
        const atributos = ['attr-st', 'attr-dx', 'attr-iq', 'attr-ht'];
        
        const observer = new MutationObserver(() => {
            this.calcularPontosAtributos();
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

    observarAtributosSecundarios() {
        const secundarios = ['pv-current', 'fp-current', 'will-value', 'per-value', 'move-value'];
        
        const observer = new MutationObserver(() => {
            // Podemos adicionar lógica aqui se necessário
        });
        
        secundarios.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el, { characterData: true, childList: true });
        });
    }

    verificarAtributos() {
        try {
            // Verificar se os atributos principais existem
            const st = document.getElementById('attr-st');
            const dx = document.getElementById('attr-dx');
            const iq = document.getElementById('attr-iq');
            const ht = document.getElementById('attr-ht');
            
            if (st && dx && iq && ht) {
                // Se todos existem, calcular pontos
                this.calcularPontosAtributos();
            } else {
                console.log('⏳ Aguardando atributos carregarem...');
            }
        } catch (error) {
            console.warn('Erro ao verificar atributos:', error);
        }
    }

    verificarPontosExternos() {
        // Verificar se há novos pontos de aparência/riqueza
        const aparenciaAtual = parseInt(localStorage.getItem('gurps_pontos_aparencia')) || 0;
        const riquezaAtual = parseInt(localStorage.getItem('gurps_pontos_riqueza')) || 0;
        
        if (aparenciaAtual !== this.personagem.aparencia) {
            this.personagem.aparencia = aparenciaAtual;
            this.atualizarSistemaPontos();
            this.atualizarStatusSocial();
        }
        
        if (riquezaAtual !== this.personagem.riqueza) {
            this.personagem.riqueza = riquezaAtual;
            this.atualizarSistemaPontos();
            this.atualizarStatusSocial();
        }
    }

    calcularPontosAtributos() {
        try {
            const st = parseInt(document.getElementById('attr-st')?.textContent) || 10;
            const dx = parseInt(document.getElementById('attr-dx')?.textContent) || 10;
            const iq = parseInt(document.getElementById('attr-iq')?.textContent) || 10;
            const ht = parseInt(document.getElementById('attr-ht')?.textContent) || 10;
            
            // Cálculo GURPS padrão
            const custoST = (st - 10) * 10;
            const custoDX = (dx - 10) * 20;
            const custoIQ = (iq - 10) * 20;
            const custoHT = (ht - 10) * 10;
            
            this.pontos.gastosAtributos = custoST + custoDX + custoIQ + custoHT;
            
            console.log(`📊 Atributos calculados: ST=${st}, DX=${dx}, IQ=${iq}, HT=${ht}`);
            console.log(`💰 Gastos em atributos: ${this.pontos.gastosAtributos} pontos`);
            
            this.atualizarSistemaPontos();
        } catch (error) {
            console.warn('Erro ao calcular pontos de atributos:', error);
        }
    }

    // ===== ATUALIZAÇÕES DA DASHBOARD =====
    atualizarTudo() {
        console.log('🔄 Atualizando dashboard completa...');
        
        this.atualizarSistemaPontos();
        this.atualizarStatusSocial();
        this.atualizarReacaoTotal();
        this.atualizarTimestamp();
        this.atualizarResumo();
    }

    atualizarSistemaPontos() {
        console.log('🧮 Atualizando sistema de pontos...');
        
        // Calcular vantagens e desvantagens
        const vantagens = Math.max(this.personagem.aparencia, 0) + Math.max(this.personagem.riqueza, 0);
        const desvantagens = Math.min(this.personagem.aparencia, 0) + Math.min(this.personagem.riqueza, 0);
        
        // Atualizar displays
        this.atualizarElemento('points-adv', vantagens);
        this.atualizarElemento('points-dis', desvantagens);
        
        // Atualizar totais no resumo
        this.atualizarElemento('sum-advantages', vantagens);
        this.atualizarElemento('sum-disadvantages', Math.abs(desvantagens));
        
        // Calcular saldo total
        const totalGasto = this.pontos.gastosAtributos + 
                          vantagens + 
                          desvantagens + 
                          this.pontos.pericias + 
                          this.pontos.magias;
        
        const saldo = this.pontos.inicial - totalGasto;
        
        // Atualizar saldo
        this.atualizarElemento('points-balance', saldo);
        
        // Verificar se excedeu limite de desvantagens
        const balanceElement = document.getElementById('points-balance');
        if (balanceElement) {
            balanceElement.classList.remove('saldo-negativo', 'limite-excedido');
            
            if (saldo < 0) {
                balanceElement.classList.add('saldo-negativo');
            }
            
            if (desvantagens < this.pontos.limiteDesvantagens) {
                balanceElement.classList.add('limite-excedido');
            }
        }
        
        console.log(`💰 Saldo atual: ${saldo} pontos`);
    }

    atualizarStatusSocial() {
        console.log('🏛️ Atualizando status social...');
        
        // Atualizar aparência no card de características físicas
        this.atualizarAparenciaFisica();
        
        // Atualizar riqueza no card de status social
        this.atualizarRiquezaDisplay();
        
        // Atualizar modificador de aparência
        this.atualizarModificadorAparencia();
    }

    atualizarAparenciaFisica() {
        const aparenciaElement = document.getElementById('phys-appearance');
        if (!aparenciaElement) return;
        
        // Mapear pontos para nome de aparência
        const niveis = {
            '-24': 'Horrendo', '-20': 'Monstruoso', '-16': 'Hediondo',
            '-8': 'Feio', '-4': 'Sem Atrativos', '0': 'Comum',
            '4': 'Atraente', '12': 'Elegante', '16': 'Muito Elegante',
            '20': 'Lindo'
        };
        
        const nomeAparencia = niveis[this.personagem.aparencia] || 'Comum';
        aparenciaElement.textContent = nomeAparencia;
    }

    atualizarRiquezaDisplay() {
        const wealthElement = document.getElementById('wealth-level');
        const wealthCostElement = document.querySelector('.wealth-cost');
        
        if (!wealthElement) return;
        
        // Mapear pontos para nome de riqueza
        const niveis = {
            '-25': 'Falido', '-15': 'Pobre', '-10': 'Batalhador',
            '0': 'Médio', '10': 'Confortável', '20': 'Rico',
            '30': 'Muito Rico', '50': 'Podre de Rico'
        };
        
        const nomeRiqueza = niveis[this.personagem.riqueza] || 'Médio';
        wealthElement.textContent = nomeRiqueza;
        
        // Atualizar custo em pontos
        if (wealthCostElement) {
            wealthCostElement.textContent = `[${this.personagem.riqueza >= 0 ? '+' : ''}${this.personagem.riqueza} pts]`;
        }
    }

    atualizarModificadorAparencia() {
        const appModElement = document.getElementById('app-mod');
        if (!appModElement) return;
        
        // Calcular modificador baseado nos pontos de aparência
        let modificador = 0;
        if (this.personagem.aparencia > 0) {
            modificador = Math.floor(this.personagem.aparencia / 4);
        } else if (this.personagem.aparencia < 0) {
            modificador = Math.floor(this.personagem.aparencia / 4);
        }
        
        appModElement.textContent = modificador;
        this.atualizarReacaoTotal();
    }

    atualizarReacaoTotal() {
        const status = parseInt(document.getElementById('status-mod')?.textContent) || 0;
        const reputacao = parseInt(document.getElementById('rep-mod')?.textContent) || 0;
        const aparencia = parseInt(document.getElementById('app-mod')?.textContent) || 0;
        
        const total = status + reputacao + aparencia;
        const reactionElement = document.getElementById('reaction-total');
        
        if (reactionElement) {
            reactionElement.textContent = total >= 0 ? `+${total}` : total.toString();
        }
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
        // Atualizar contagens (pode ser expandido)
        this.atualizarElemento('sum-skills', this.pontos.pericias);
        this.atualizarElemento('sum-spells', this.pontos.magias);
        
        // Contar itens (exemplo)
        const itensCount = document.querySelectorAll('.equipment-item')?.length || 0;
        this.atualizarElemento('sum-items', itensCount);
    }

    atualizarSaldo() {
        this.atualizarSistemaPontos();
    }

    atualizarElemento(id, valor) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = valor;
        }
    }

    // ===== UTILIDADES =====
    salvarTudo() {
        try {
            // Salvar estado da dashboard
            const estado = {
                pontos: this.pontos,
                personagem: this.personagem,
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('dashboard_estado_completo', JSON.stringify(estado));
            console.log('💾 Estado completo salvo');
        } catch (e) {
            console.warn('Erro ao salvar estado:', e);
        }
    }

    // ===== INICIALIZAÇÃO PÚBLICA =====
    static iniciar() {
        if (!window.dashboardGURPS) {
            window.dashboardGURPS = new DashboardGURPS();
        }
        
        // Inicializar quando a aba estiver ativa
        const checkDashboard = () => {
            const dashboardTab = document.getElementById('dashboard');
            if (dashboardTab && dashboardTab.classList.contains('active')) {
                window.dashboardGURPS.inicializar();
            }
        };
        
        // Verificar agora
        checkDashboard();
        
        // Configurar observador para mudanças de aba
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    checkDashboard();
                }
            });
        });
        
        // Observar a aba dashboard
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab) {
            observer.observe(dashboardTab, { attributes: true });
        }
        
        console.log('🎯 DashboardGURPS carregado e pronto');
    }
}

// ===== INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM carregado, preparando dashboard...');
    DashboardGURPS.iniciar();
});

// ===== FUNÇÕES GLOBAIS =====
function removerFoto() {
    if (window.dashboardGURPS) {
        window.dashboardGURPS.removerFoto();
    }
}

// ===== TESTES =====
function testarDashboard() {
    console.log('🧪 Testando dashboard...');
    console.log('Instância:', window.dashboardGURPS);
    console.log('Pontos:', window.dashboardGURPS?.pontos);
    console.log('Personagem:', window.dashboardGURPS?.personagem);
    
    // Simular mudança de aparência
    localStorage.setItem('gurps_pontos_aparencia', '12');
    window.dashboardGURPS?.carregarPontosExternos();
    window.dashboardGURPS?.atualizarSistemaPontos();
}

// ===== EXPORTAÇÃO =====
window.DashboardGURPS = DashboardGURPS;
window.removerFoto = removerFoto;
window.testarDashboard = testarDashboard;