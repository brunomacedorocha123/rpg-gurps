// ===========================================
// DASHBOARD.JS - Sistema Integrado da Dashboard
// ===========================================

class DashboardGURPS {
    constructor() {
        this.personagem = {
            atributos: { ST: 10, DX: 10, IQ: 10, HT: 10 },
            aparencia: 0,
            riqueza: 0,
            vantagens: 0,
            desvantagens: 0,
            pericias: 0,
            magias: 0,
            pontosIniciais: 100,
            limiteDesvantagens: -75,
            foto: null
        };

        this.inicializado = false;
        this.observandoAtributos = false;
        
        console.log('⚔️ Iniciando Dashboard GURPS...');
    }

    // ===== INICIALIZAÇÃO =====
    inicializar() {
        if (this.inicializado) return;
        
        this.carregarEstado();
        this.configurarEventos();
        this.configurarUploadFoto();
        this.iniciarObservadores();
        this.atualizarDashboardCompleta();
        
        this.inicializado = true;
        console.log('✅ Dashboard inicializada');
    }

    // ===== CONFIGURAÇÃO DE EVENTOS =====
    configurarEventos() {
        // Sistema de pontos
        document.getElementById('start-points')?.addEventListener('input', (e) => {
            this.personagem.pontosIniciais = parseInt(e.target.value) || 100;
            this.atualizarSaldo();
            this.salvarEstado();
        });

        document.getElementById('dis-limit')?.addEventListener('input', (e) => {
            this.personagem.limiteDesvantagens = parseInt(e.target.value) || -75;
            this.atualizarSaldo();
            this.salvarEstado();
        });

        // Campos de identificação
        ['char-name', 'char-type', 'char-player'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    this.salvarEstado();
                });
            }
        });

        // Atualizar timestamp
        this.atualizarTimestamp();
        setInterval(() => this.atualizarTimestamp(), 60000);
    }

    // ===== OBSERVADORES DE ATRIBUTOS =====
    iniciarObservadores() {
        if (this.observandoAtributos) return;
        
        // Observar mudanças nos atributos
        this.observarAtributos();
        
        // Observar eventos de outros sistemas
        document.addEventListener('caracteristicasAtualizadas', (e) => {
            this.processarAtualizacaoCaracteristicas(e.detail);
        });

        // Observar localStorage para mudanças
        window.addEventListener('storage', (e) => {
            if (e.key === 'gurps_atributos' || 
                e.key === 'gurps_pontos_aparencia' || 
                e.key === 'gurps_pontos_riqueza') {
                this.carregarEstado();
                this.atualizarDashboardCompleta();
            }
        });

        this.observandoAtributos = true;
    }

    observarAtributos() {
        // Observar atributos principais
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'characterData' || mutation.type === 'childList') {
                    this.verificarMudancasAtributos();
                }
            });
        });

        // Observar elementos de atributos
        ['attr-st', 'attr-dx', 'attr-iq', 'attr-ht'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element, { 
                    characterData: true, 
                    childList: true, 
                    subtree: true 
                });
            }
        });
    }

    verificarMudancasAtributos() {
        try {
            const st = parseInt(document.getElementById('attr-st')?.textContent) || 10;
            const dx = parseInt(document.getElementById('attr-dx')?.textContent) || 10;
            const iq = parseInt(document.getElementById('attr-iq')?.textContent) || 10;
            const ht = parseInt(document.getElementById('attr-ht')?.textContent) || 10;
            
            this.personagem.atributos = { ST: st, DX: dx, IQ: iq, HT: ht };
            this.calcularPontosAtributos();
            this.atualizarDashboardCompleta();
        } catch (error) {
            console.warn('Erro ao verificar atributos:', error);
        }
    }

    // ===== PROCESSAMENTO DE PONTOS =====
    calcularPontosAtributos() {
        const { ST, DX, IQ, HT } = this.personagem.atributos;
        
        // Custo padrão GURPS
        const custoST = (ST - 10) * 10;
        const custoDX = (DX - 10) * 20;
        const custoIQ = (IQ - 10) * 20;
        const custoHT = (HT - 10) * 10;
        
        return custoST + custoDX + custoIQ + custoHT;
    }

    processarAtualizacaoCaracteristicas(detalhes) {
        switch (detalhes.tipo) {
            case 'aparencia':
                this.personagem.aparencia = detalhes.pontos;
                this.atualizarAparenciaDashboard(detalhes);
                break;
            case 'riqueza':
                this.personagem.riqueza = detalhes.pontos;
                this.atualizarRiquezaDashboard(detalhes);
                break;
        }
        
        this.atualizarSistemaPontos();
        this.salvarEstado();
    }

    // ===== ATUALIZAÇÕES DA DASHBOARD =====
    atualizarDashboardCompleta() {
        this.atualizarAtributosDashboard();
        this.atualizarAtributosSecundarios();
        this.atualizarSistemaPontos();
        this.atualizarTimestamp();
        this.salvarEstado();
    }

    atualizarAtributosDashboard() {
        const { ST, DX, IQ, HT } = this.personagem.atributos;
        
        // Atualizar valores
        this.atualizarElemento('attr-st', ST);
        this.atualizarElemento('attr-dx', DX);
        this.atualizarElemento('attr-iq', IQ);
        this.atualizarElemento('attr-ht', HT);
        
        // Atualizar detalhes
        this.atualizarDano(ST);
        this.atualizarEsquiva(DX);
        this.atualizarVontade(IQ);
        this.atualizarResistencia(HT);
    }

    atualizarDano(ST) {
        const dano = this.calcularDano(ST);
        this.atualizarElemento('attr-st-details', `Dano: ${dano.gdp}/${dano.geb}`);
    }

    calcularDano(ST) {
        // Tabela simplificada de dano
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

    atualizarEsquiva(DX) {
        const esquiva = Math.floor(DX / 2) + 3;
        this.atualizarElemento('attr-dx-details', `Esquiva: ${esquiva}`);
    }

    atualizarVontade(IQ) {
        this.atualizarElemento('attr-iq-details', `Vontade: ${IQ}`);
    }

    atualizarResistencia(HT) {
        this.atualizarElemento('attr-ht-details', `Resistência: ${HT}`);
    }

    atualizarAtributosSecundarios() {
        const { ST, DX, IQ, HT } = this.personagem.atributos;
        
        // PV = ST
        this.atualizarElemento('pv-current', ST);
        this.atualizarElemento('pv-max', ST);
        
        // PF = HT
        this.atualizarElemento('fp-current', HT);
        this.atualizarElemento('fp-max', HT);
        
        // Vontade = IQ
        this.atualizarElemento('will-value', IQ);
        
        // Percepção = IQ
        this.atualizarElemento('per-value', IQ);
        
        // Deslocamento = (HT + DX) / 4
        const deslocamento = ((HT + DX) / 4).toFixed(2);
        this.atualizarElemento('move-value', deslocamento);
    }

    atualizarAparenciaDashboard(detalhes) {
        const { pontos, nivel } = detalhes;
        
        // Atualizar card de características físicas
        this.atualizarElemento('phys-appearance', nivel || 'Comum');
        
        // Atualizar card de status social
        const modValue = Math.floor(pontos / 4); // Aproximação do modificador
        this.atualizarElemento('app-mod', modValue);
        
        // Atualizar reação total
        this.atualizarReacaoTotal();
    }

    atualizarRiquezaDashboard(detalhes) {
        const { pontos, nivel, rendaMensal } = detalhes;
        
        // Atualizar card de status social
        this.atualizarElemento('wealth-level', nivel || 'Médio');
        
        // Atualizar custo em pontos
        const custoElement = document.querySelector('.wealth-cost');
        if (custoElement) {
            custoElement.textContent = `[${pontos >= 0 ? '+' : ''}${pontos} pts]`;
        }
    }

    atualizarSistemaPontos() {
        // Calcular pontos de atributos
        const pontosAtributos = this.calcularPontosAtributos();
        
        // Separar vantagens e desvantagens
        const pontosPositivos = Math.max(this.personagem.aparencia, 0) + 
                               Math.max(this.personagem.riqueza, 0);
        
        const pontosNegativos = Math.min(this.personagem.aparencia, 0) + 
                               Math.min(this.personagem.riqueza, 0);
        
        // Atualizar displays
        this.atualizarElemento('points-adv', pontosPositivos);
        this.atualizarElemento('points-dis', pontosNegativos);
        
        // Calcular saldo
        const totalGasto = pontosAtributos + 
                          pontosPositivos + 
                          pontosNegativos + 
                          this.personagem.pericias + 
                          this.personagem.magias;
        
        const saldo = this.personagem.pontosIniciais - totalGasto;
        
        // Atualizar saldo
        this.atualizarElemento('points-balance', saldo);
        
        // Verificar limite de desvantagens
        if (pontosNegativos < this.personagem.limiteDesvantagens) {
            document.getElementById('points-balance')?.classList.add('limite-excedido');
        } else {
            document.getElementById('points-balance')?.classList.remove('limite-excedido');
        }
    }

    atualizarReacaoTotal() {
        // Obter modificadores
        const status = parseInt(document.getElementById('status-mod')?.textContent) || 0;
        const reputacao = parseInt(document.getElementById('rep-mod')?.textContent) || 0;
        const aparencia = parseInt(document.getElementById('app-mod')?.textContent) || 0;
        
        const total = status + reputacao + aparencia;
        this.atualizarElemento('reaction-total', total >= 0 ? `+${total}` : total);
    }

    atualizarTimestamp() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        this.atualizarElemento('current-time', timeString);
    }

    atualizarElemento(id, valor) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = valor;
        }
    }

    // ===== UPLOAD DE FOTO =====
    configurarUploadFoto() {
        const uploadInput = document.getElementById('char-upload');
        const photoPreview = document.getElementById('photo-preview');
        const photoControls = document.getElementById('photo-controls');
        
        if (!uploadInput || !photoPreview) return;
        
        // Configurar upload
        uploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                this.carregarFoto(file);
            }
        });
        
        // Carregar foto salva
        this.carregarFotoSalva();
    }

    carregarFoto(file) {
        const reader = new FileReader();
        const photoPreview = document.getElementById('photo-preview');
        const photoControls = document.getElementById('photo-controls');
        
        reader.onload = (e) => {
            // Criar imagem
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Foto do Personagem';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            
            // Limpar preview e adicionar imagem
            photoPreview.innerHTML = '';
            photoPreview.appendChild(img);
            photoPreview.parentElement.classList.add('has-photo');
            
            // Mostrar controles
            if (photoControls) {
                photoControls.style.display = 'flex';
            }
            
            // Salvar no localStorage (base64)
            try {
                localStorage.setItem('gurps_foto_personagem', e.target.result);
                this.personagem.foto = e.target.result;
                this.salvarEstado();
                console.log('📸 Foto salva com sucesso');
            } catch (error) {
                console.warn('Não foi possível salvar a foto:', error);
            }
        };
        
        reader.readAsDataURL(file);
    }

    carregarFotoSalva() {
        try {
            const fotoSalva = localStorage.getItem('gurps_foto_personagem');
            if (fotoSalva) {
                const photoPreview = document.getElementById('photo-preview');
                const photoControls = document.getElementById('photo-controls');
                
                if (photoPreview) {
                    const img = document.createElement('img');
                    img.src = fotoSalva;
                    img.alt = 'Foto do Personagem';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    
                    photoPreview.innerHTML = '';
                    photoPreview.appendChild(img);
                    photoPreview.parentElement.classList.add('has-photo');
                    
                    if (photoControls) {
                        photoControls.style.display = 'flex';
                    }
                    
                    this.personagem.foto = fotoSalva;
                    console.log('📸 Foto carregada do cache');
                }
            }
        } catch (error) {
            console.warn('Erro ao carregar foto:', error);
        }
    }

    removerFoto() {
        const photoPreview = document.getElementById('photo-preview');
        const photoControls = document.getElementById('photo-controls');
        const uploadInput = document.getElementById('char-upload');
        
        if (photoPreview) {
            // Restaurar placeholder
            photoPreview.innerHTML = `
                <div class="photo-placeholder">
                    <i class="fas fa-user-circle"></i>
                    <span>Clique para adicionar foto</span>
                    <small>Recomendado: 300x400px</small>
                </div>
            `;
            
            photoPreview.parentElement.classList.remove('has-photo');
            
            if (photoControls) {
                photoControls.style.display = 'none';
            }
            
            if (uploadInput) {
                uploadInput.value = '';
            }
            
            // Remover do localStorage
            localStorage.removeItem('gurps_foto_personagem');
            this.personagem.foto = null;
            this.salvarEstado();
            
            console.log('🗑️ Foto removida');
        }
    }

    // ===== ESTADO E PERSISTÊNCIA =====
    carregarEstado() {
        try {
            // Carregar estado do personagem
            const salvo = localStorage.getItem('gurps_dashboard_estado');
            if (salvo) {
                this.personagem = { ...this.personagem, ...JSON.parse(salvo) };
            }
            
            // Carregar pontos de outros sistemas
            this.personagem.aparencia = parseInt(localStorage.getItem('gurps_pontos_aparencia')) || 0;
            this.personagem.riqueza = parseInt(localStorage.getItem('gurps_pontos_riqueza')) || 0;
            
            // Carregar identificação
            ['char-name', 'char-type', 'char-player'].forEach(id => {
                const valor = localStorage.getItem(`gurps_${id}`);
                const input = document.getElementById(id);
                if (valor && input) {
                    input.value = valor;
                }
            });
            
            console.log('💾 Estado carregado');
        } catch (error) {
            console.warn('Erro ao carregar estado:', error);
        }
    }

    salvarEstado() {
        try {
            // Salvar estado do personagem
            localStorage.setItem('gurps_dashboard_estado', JSON.stringify(this.personagem));
            
            // Salvar identificação
            ['char-name', 'char-type', 'char-player'].forEach(id => {
                const input = document.getElementById(id);
                if (input) {
                    localStorage.setItem(`gurps_${id}`, input.value);
                }
            });
            
            console.log('💾 Estado salvo');
        } catch (error) {
            console.warn('Erro ao salvar estado:', error);
        }
    }

    // ===== UTILIDADES =====
    atualizarResumo() {
        // Esta função pode ser expandida para contar vantagens, desvantagens, etc.
        // Por enquanto, vamos atualizar valores básicos
        this.atualizarElemento('sum-advantages', 
            Math.max(this.personagem.aparencia, 0) + Math.max(this.personagem.riqueza, 0)
        );
        
        this.atualizarElemento('sum-disadvantages', 
            Math.abs(Math.min(this.personagem.aparencia, 0) + Math.min(this.personagem.riqueza, 0))
        );
    }

    // ===== EXPORTAÇÃO =====
    exportarPersonagem() {
        return {
            ...this.personagem,
            timestamp: new Date().toISOString(),
            atributosDetalhados: {
                ...this.personagem.atributos,
                dano: this.calcularDano(this.personagem.atributos.ST),
                esquiva: Math.floor(this.personagem.atributos.DX / 2) + 3
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
    
    // Inicializar quando a aba dashboard estiver ativa
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = document.getElementById('dashboard');
                if (tab && tab.classList.contains('active')) {
                    setTimeout(() => {
                        dashboardGURPS.inicializar();
                    }, 100);
                }
            }
        });
    });

    // Observar a aba dashboard
    const tabDashboard = document.getElementById('dashboard');
    if (tabDashboard) {
        observer.observe(tabDashboard, { attributes: true });
    }
    
    // Inicializar agora se já estiver ativa
    if (tabDashboard?.classList.contains('active')) {
        setTimeout(() => {
            dashboardGURPS.inicializar();
        }, 100);
    }
}

// ===== EXPORTAÇÃO PARA USO GLOBAL =====
window.DashboardGURPS = DashboardGURPS;
window.inicializarDashboard = inicializarDashboard;
window.dashboardGURPS = dashboardGURPS;
window.removerFoto = function() {
    if (dashboardGURPS) {
        dashboardGURPS.removerFoto();
    }
};

// ===== INICIALIZAR AUTOMATICAMENTE =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDashboard);
} else {
    inicializarDashboard();
}

// ===== FUNÇÃO PARA TESTE RÁPIDO =====
function testarDashboard() {
    console.log('🧪 Testando Dashboard...');
    console.log('Estado:', dashboardGURPS?.personagem);
    console.log('Atributos carregados:', dashboardGURPS?.personagem.atributos);
    console.log('Aparência:', dashboardGURPS?.personagem.aparencia);
    console.log('Riqueza:', dashboardGURPS?.personagem.riqueza);
}