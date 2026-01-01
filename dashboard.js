// ===========================================
// DASHBOARD.JS - SISTEMA COMPLETO E FUNCIONAL
// ===========================================

class DashboardGURPS {
    constructor() {
        console.log('⚔️ Dashboard GURPS - Sistema Completo');
        this.inicializado = false;
        this.atributosAtuais = { ST: 10, DX: 10, IQ: 10, HT: 10 };
        this.observadorAtributos = null;
    }

    // ===== INICIALIZAÇÃO =====
    iniciar() {
        if (this.inicializado) return;
        console.log('🚀 Iniciando sistema completo...');
        
        // 1. Carregar tudo primeiro
        this.carregarEstadoCompleto();
        
        // 2. Configurar eventos PRIMEIRO
        this.configurarEventosCompletos();
        
        // 3. Iniciar observadores IMEDIATAMENTE
        this.iniciarObservadoresAtributos();
        
        // 4. Calcular pontos IMEDIATAMENTE
        this.atualizarCalculoPontos();
        
        // 5. Configurar upload CORRETO
        this.configurarUploadFotoFuncional();
        
        this.inicializado = true;
        console.log('✅ Sistema completo inicializado');
    }

    // ===== CARREGAMENTO =====
    carregarEstadoCompleto() {
        console.log('📂 Carregando estado completo...');
        
        // Carregar atributos do sistema de atributos
        try {
            const atributosSalvos = localStorage.getItem('gurps_atributos');
            if (atributosSalvos) {
                const dados = JSON.parse(atributosSalvos);
                if (dados.atributos) {
                    this.atributosAtuais = {
                        ST: dados.atributos.ST || 10,
                        DX: dados.atributos.DX || 10,
                        IQ: dados.atributos.IQ || 10,
                        HT: dados.atributos.HT || 10
                    };
                    
                    // ATUALIZAR NA INTERFACE IMEDIATAMENTE
                    this.atualizarAtributosInterface();
                    console.log('⚔️ Atributos carregados:', this.atributosAtuais);
                }
            }
        } catch (e) {
            console.warn('Erro ao carregar atributos:', e);
        }
        
        // Carregar pontos iniciais
        const pontosIniciais = localStorage.getItem('dashboard_pontos_iniciais');
        if (pontosIniciais) {
            document.getElementById('start-points').value = pontosIniciais;
        }
        
        // Carregar foto
        this.carregarFotoExistente();
    }

    atualizarAtributosInterface() {
        // Atualizar valores na dashboard
        document.getElementById('attr-st').textContent = this.atributosAtuais.ST;
        document.getElementById('attr-dx').textContent = this.atributosAtuais.DX;
        document.getElementById('attr-iq').textContent = this.atributosAtuais.IQ;
        document.getElementById('attr-ht').textContent = this.atributosAtuais.HT;
        
        // Atualizar detalhes
        this.atualizarDetalhesAtributos();
        
        // Atualizar atributos secundários
        this.atualizarAtributosSecundarios();
    }

    // ===== CÁLCULO DE PONTOS DOS ATRIBUTOS =====
    calcularGastosAtributos() {
        const { ST, DX, IQ, HT } = this.atributosAtuais;
        
        // CÁLCULO GURPS CORRETO:
        const custoST = (ST - 10) * 10;
        const custoDX = (DX - 10) * 20;
        const custoIQ = (IQ - 10) * 20;
        const custoHT = (HT - 10) * 10;
        
        const total = custoST + custoDX + custoIQ + custoHT;
        
        console.log('💰 Cálculo detalhado dos atributos:');
        console.log(`  ST ${ST}: ${custoST} pts`);
        console.log(`  DX ${DX}: ${custoDX} pts`);
        console.log(`  IQ ${IQ}: ${custoIQ} pts`);
        console.log(`  HT ${HT}: ${custoHT} pts`);
        console.log(`  TOTAL: ${total} pts`);
        
        return total;
    }

    atualizarSistemaPontosCompleto() {
        console.log('💵 Atualizando sistema de pontos...');
        
        // 1. Gastos com atributos
        const gastosAtributos = this.calcularGastosAtributos();
        
        // 2. Pontos iniciais
        const pontosIniciais = parseInt(document.getElementById('start-points').value) || 100;
        
        // 3. Vantagens e desvantagens (por enquanto 0)
        const vantagens = 0;
        const desvantagens = 0;
        
        // 4. Total gasto
        const totalGasto = gastosAtributos + vantagens + desvantagens;
        
        // 5. Saldo disponível
        const saldo = pontosIniciais - totalGasto;
        
        console.log('📊 Resumo financeiro:');
        console.log(`  Pontos iniciais: ${pontosIniciais}`);
        console.log(`  Gastos atributos: ${gastosAtributos}`);
        console.log(`  Vantagens: ${vantagens}`);
        console.log(`  Desvantagens: ${desvantagens}`);
        console.log(`  Total gasto: ${totalGasto}`);
        console.log(`  SALDO DISPONÍVEL: ${saldo}`);
        
        // ATUALIZAR INTERFACE
        this.atualizarInterfacePontos(gastosAtributos, vantagens, desvantagens, saldo);
        
        // Verificar limites
        this.verificarLimitesPontos(desvantagens, saldo);
    }

    atualizarInterfacePontos(gastosAtributos, vantagens, desvantagens, saldo) {
        // Atualizar vantagens e desvantagens
        document.getElementById('points-adv').textContent = vantagens;
        document.getElementById('points-dis').textContent = desvantagens;
        
        // Atualizar saldo
        const saldoElement = document.getElementById('points-balance');
        saldoElement.textContent = saldo;
        
        // Atualizar resumo
        document.getElementById('sum-advantages').textContent = vantagens;
        document.getElementById('sum-disadvantages').textContent = Math.abs(desvantagens);
        
        console.log(`✅ Interface atualizada - Saldo: ${saldo}`);
    }

    verificarLimitesPontos(desvantagens, saldo) {
        const saldoElement = document.getElementById('points-balance');
        const limiteDesv = parseInt(document.getElementById('dis-limit').value) || -75;
        
        saldoElement.classList.remove('saldo-negativo', 'limite-excedido');
        
        if (saldo < 0) {
            saldoElement.classList.add('saldo-negativo');
            console.warn('⚠️ SALDO NEGATIVO!');
        }
        
        if (desvantagens < limiteDesv) {
            saldoElement.classList.add('limite-excedido');
            console.warn('⚠️ LIMITE DE DESVANTAGENS EXCEDIDO!');
        }
    }

    // ===== OBSERVADORES DE ATRIBUTOS =====
    iniciarObservadoresAtributos() {
        console.log('👀 Iniciando observadores de atributos...');
        
        // Observar MUDANÇAS DIRETAS nos elementos
        this.observadorAtributos = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.id && mutation.target.id.startsWith('attr-')) {
                    this.processarMudancaAtributo(mutation.target.id, mutation.target.textContent);
                }
            });
        });
        
        // Observar CADA atributo individualmente
        ['attr-st', 'attr-dx', 'attr-iq', 'attr-ht'].forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                this.observadorAtributos.observe(elemento, {
                    characterData: true,
                    childList: true,
                    subtree: true
                });
            }
        });
        
        // Também verificar periodicamente
        setInterval(() => this.verificarAtributosPeriodicamente(), 1000);
    }

    processarMudancaAtributo(id, valorTexto) {
        const valor = parseInt(valorTexto) || 10;
        const tipo = id.replace('attr-', '').toUpperCase();
        
        if (this.atributosAtuais[tipo] !== valor) {
            console.log(`🔄 Atributo ${tipo} mudou: ${this.atributosAtuais[tipo]} → ${valor}`);
            
            this.atributosAtuais[tipo] = valor;
            
            // Atualizar detalhes
            this.atualizarDetalhesAtributos();
            
            // Atualizar atributos secundários
            this.atualizarAtributosSecundarios();
            
            // Atualizar cálculo de pontos
            this.atualizarCalculoPontos();
            
            // Sincronizar com localStorage
            this.sincronizarAtributos();
        }
    }

    verificarAtributosPeriodicamente() {
        try {
            const stAtual = parseInt(document.getElementById('attr-st').textContent) || 10;
            const dxAtual = parseInt(document.getElementById('attr-dx').textContent) || 10;
            const iqAtual = parseInt(document.getElementById('attr-iq').textContent) || 10;
            const htAtual = parseInt(document.getElementById('attr-ht').textContent) || 10;
            
            // Verificar se mudou
            if (stAtual !== this.atributosAtuais.ST || 
                dxAtual !== this.atributosAtuais.DX || 
                iqAtual !== this.atributosAtuais.IQ || 
                htAtual !== this.atributosAtuais.HT) {
                
                console.log('🔍 Sincronizando atributos...');
                this.atributosAtuais = { ST: stAtual, DX: dxAtual, IQ: iqAtual, HT: htAtual };
                this.atualizarCalculoPontos();
            }
        } catch (e) {
            console.warn('Erro na verificação periódica:', e);
        }
    }

    sincronizarAtributos() {
        try {
            localStorage.setItem('gurps_atributos', JSON.stringify({
                atributos: this.atributosAtuais,
                timestamp: new Date().toISOString()
            }));
        } catch (e) {
            console.warn('Erro ao sincronizar atributos:', e);
        }
    }

    // ===== DETALHES E ATRIBUTOS SECUNDÁRIOS =====
    atualizarDetalhesAtributos() {
        const { ST, DX, IQ, HT } = this.atributosAtuais;
        
        // ST: Dano
        const dano = this.calcularDano(ST);
        document.getElementById('attr-st-details').textContent = `Dano: ${dano.gdp}/${dano.geb}`;
        
        // DX: Esquiva
        const esquiva = Math.floor(DX / 2) + 3;
        document.getElementById('attr-dx-details').textContent = `Esquiva: ${esquiva}`;
        
        // IQ: Vontade
        document.getElementById('attr-iq-details').textContent = `Vontade: ${IQ}`;
        
        // HT: Resistência
        document.getElementById('attr-ht-details').textContent = `Resistência: ${HT}`;
    }

    calcularDano(ST) {
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
        const { ST, DX, IQ, HT } = this.atributosAtuais;
        
        // PV = ST
        document.getElementById('pv-current').textContent = ST;
        document.getElementById('pv-max').textContent = ST;
        
        // PF = HT
        document.getElementById('fp-current').textContent = HT;
        document.getElementById('fp-max').textContent = HT;
        
        // Vontade = IQ
        document.getElementById('will-value').textContent = IQ;
        
        // Percepção = IQ
        document.getElementById('per-value').textContent = IQ;
        
        // Deslocamento = (HT + DX) / 4
        const deslocamento = ((HT + DX) / 4).toFixed(2);
        document.getElementById('move-value').textContent = deslocamento;
    }

    // ===== UPLOAD DE FOTO FUNCIONAL =====
    configurarUploadFotoFuncional() {
        console.log('📸 Configurando upload de foto funcional...');
        
        const uploadInput = document.getElementById('char-upload');
        const photoFrame = document.querySelector('.photo-frame');
        const photoPreview = document.getElementById('photo-preview');
        
        if (!uploadInput || !photoFrame || !photoPreview) {
            console.error('❌ Elementos não encontrados');
            return;
        }
        
        // REMOVER EVENTOS EXISTENTES
        const novoFrame = photoFrame.cloneNode(true);
        photoFrame.parentNode.replaceChild(novoFrame, photoFrame);
        
        const novoInput = uploadInput.cloneNode(true);
        uploadInput.parentNode.replaceChild(novoInput, uploadInput);
        
        // NOVAS REFERÊNCIAS
        const inputRef = document.getElementById('char-upload');
        const frameRef = document.querySelector('.photo-frame');
        
        // CONFIGURAÇÃO SIMPLES E FUNCIONAL
        frameRef.addEventListener('click', (e) => {
            console.log('🖱️ Clique detectado no frame');
            inputRef.click();
        });
        
        inputRef.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                console.log('📁 Processando arquivo:', file.name);
                this.processarFoto(file);
            }
        });
        
        // Botão remover
        const deleteBtn = document.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.removerFoto();
            });
        }
        
        console.log('✅ Upload configurado - 1 clique funciona');
    }

    processarFoto(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const fotoData = e.target.result;
            
            // Exibir foto
            const photoPreview = document.getElementById('photo-preview');
            photoPreview.innerHTML = `<img src="${fotoData}" alt="Foto" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
            
            // Mostrar controles
            const photoControls = document.getElementById('photo-controls');
            if (photoControls) {
                photoControls.style.display = 'flex';
            }
            
            // Adicionar classe
            const photoFrame = document.querySelector('.photo-frame');
            photoFrame.classList.add('has-photo');
            
            // Salvar
            localStorage.setItem('gurps_foto_personagem', fotoData);
            
            console.log('✅ Foto carregada com sucesso');
        };
        
        reader.readAsDataURL(file);
    }

    carregarFotoExistente() {
        try {
            const fotoSalva = localStorage.getItem('gurps_foto_personagem');
            if (fotoSalva) {
                const photoPreview = document.getElementById('photo-preview');
                photoPreview.innerHTML = `<img src="${fotoSalva}" alt="Foto" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
                
                const photoFrame = document.querySelector('.photo-frame');
                photoFrame.classList.add('has-photo');
                
                const photoControls = document.getElementById('photo-controls');
                if (photoControls) {
                    photoControls.style.display = 'flex';
                }
                
                console.log('📸 Foto existente carregada');
            }
        } catch (e) {
            console.warn('Erro ao carregar foto:', e);
        }
    }

    removerFoto() {
        console.log('🗑️ Removendo foto...');
        
        const photoPreview = document.getElementById('photo-preview');
        photoPreview.innerHTML = `
            <div class="photo-placeholder">
                <i class="fas fa-user-circle"></i>
                <span>Clique para adicionar foto</span>
                <small>Recomendado: 300x400px</small>
            </div>
        `;
        
        const photoFrame = document.querySelector('.photo-frame');
        photoFrame.classList.remove('has-photo');
        
        const photoControls = document.getElementById('photo-controls');
        if (photoControls) {
            photoControls.style.display = 'none';
        }
        
        const uploadInput = document.getElementById('char-upload');
        uploadInput.value = '';
        
        localStorage.removeItem('gurps_foto_personagem');
        
        console.log('✅ Foto removida');
    }

    // ===== EVENTOS =====
    configurarEventosCompletos() {
        console.log('⚡ Configurando eventos...');
        
        // Sistema de pontos
        document.getElementById('start-points').addEventListener('input', (e) => {
            localStorage.setItem('dashboard_pontos_iniciais', e.target.value);
            this.atualizarCalculoPontos();
        });
        
        document.getElementById('dis-limit').addEventListener('input', () => {
            this.atualizarCalculoPontos();
        });
        
        // Forçar cálculo inicial
        this.atualizarCalculoPontos();
    }

    atualizarCalculoPontos() {
        console.log('🧮 Executando cálculo de pontos...');
        this.atualizarSistemaPontosCompleto();
    }

    // ===== INICIALIZAÇÃO GLOBAL =====
    static iniciar() {
        if (!window.dashboardGURPS) {
            window.dashboardGURPS = new DashboardGURPS();
        }
        
        // Inicializar quando a dashboard estiver ativa
        const verificarDashboard = () => {
            const dashboardTab = document.getElementById('dashboard');
            if (dashboardTab && dashboardTab.classList.contains('active')) {
                console.log('🎯 Dashboard ativa - Inicializando...');
                window.dashboardGURPS.iniciar();
            }
        };
        
        // Verificar agora
        verificarDashboard();
        
        // Observar mudanças
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
}

// ===== INICIALIZAÇÃO =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        DashboardGURPS.iniciar();
    });
} else {
    DashboardGURPS.iniciar();
}

// ===== FUNÇÕES GLOBAIS =====
window.removerFoto = function() {
    if (window.dashboardGURPS) {
        window.dashboardGURPS.removerFoto();
    }
};

// ===== DEBUG =====
console.log('🎮 dashboard.js carregado e pronto');