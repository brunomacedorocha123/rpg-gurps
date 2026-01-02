// ===========================================
// DASHBOARD.JS - Sistema Central de Controle
// ===========================================

// Estado global do dashboard
let dashboardState = {
    // Sistema de Pontos
    pontosIniciais: 100,
    limiteDesvantagens: -75,
    
    // Status Social
    status: 0,
    reputacao: 0,
    aparencia: 0,
    
    // Finanças
    dinheiro: 0,
    nivelRiqueza: 'Médio',
    pesoEquipamentos: 0,
    
    // Contadores
    vantagens: 0,
    desvantagens: 0,
    pericias: 0,
    magias: 0,
    idiomas: 1,
    relacionamentos: 0,
    
    // Atributos (serão sincronizados)
    ST: 10,
    DX: 10,
    IQ: 10,
    HT: 10,
    PV: 10,
    PF: 10,
    Vontade: 10,
    Percepcao: 10
};

// ===========================================
// SISTEMA DE PONTOS - CÁLCULOS E CONTROLE
// ===========================================

function definirPontosIniciais(valor) {
    if (valor < 0) valor = 0;
    if (valor > 1000) valor = 1000;
    
    dashboardState.pontosIniciais = parseInt(valor);
    document.getElementById('start-points').value = valor;
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

function definirLimiteDesvantagens(valor) {
    if (valor > 0) valor = 0;
    
    dashboardState.limiteDesvantagens = parseInt(valor);
    document.getElementById('dis-limit').value = valor;
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

function calcularPontosGastos() {
    // 1. Pontos em Atributos (do atributos.js)
    const ST = dashboardState.ST || 10;
    const DX = dashboardState.DX || 10;
    const IQ = dashboardState.IQ || 10;
    const HT = dashboardState.HT || 10;
    
    const custoST = (ST - 10) * 10;
    const custoDX = (DX - 10) * 20;
    const custoIQ = (IQ - 10) * 20;
    const custoHT = (HT - 10) * 10;
    
    const pontosAtributos = custoST + custoDX + custoIQ + custoHT;
    
    // 2. Pontos em Status Social
    const pontosStatus = dashboardState.status * 5; // Cada nível de status custa 5 pontos
    const pontosReputacao = Math.abs(dashboardState.reputacao) * 5; // Cada nível custa 5
    const pontosAparencia = dashboardState.aparencia * 5; // Cada nível custa 5
    
    const pontosSociais = pontosStatus + pontosReputacao + pontosAparencia;
    
    // 3. Outros (valores fictícios - serão substituídos por dados reais)
    const pontosVantagens = dashboardState.vantagens * 5; // Estimativa
    const pontosDesvantagens = dashboardState.desvantagens * -5; // Negativo
    const pontosPericias = dashboardState.pericias * 2; // Estimativa
    const pontosMagias = dashboardState.magias * 3; // Estimativa
    const pontosPeculiaridades = 0; // Placeholder
    const pontosTecnicas = 0; // Placeholder
    
    // Atualizar display
    document.getElementById('points-attr').textContent = pontosAtributos;
    document.getElementById('points-adv').textContent = pontosVantagens;
    document.getElementById('points-dis').textContent = pontosDesvantagens;
    document.getElementById('points-skills').textContent = pontosPericias;
    document.getElementById('points-spells').textContent = pontosMagias;
    document.getElementById('points-pec').textContent = pontosPeculiaridades;
    document.getElementById('points-tech').textContent = pontosTecnicas;
    
    // Calcular total gasto
    const totalGasto = pontosAtributos + pontosVantagens + pontosDesvantagens + 
                      pontosPericias + pontosMagias + pontosSociais +
                      pontosPeculiaridades + pontosTecnicas;
    
    document.getElementById('total-points-spent').textContent = `${totalGasto} pts`;
    
    // Calcular saldo
    const saldo = dashboardState.pontosIniciais - totalGasto;
    document.getElementById('points-balance').textContent = saldo;
    
    // Atualizar status do saldo
    atualizarStatusSaldo(saldo);
    
    return totalGasto;
}

function atualizarStatusSaldo(saldo) {
    const indicator = document.getElementById('points-status-indicator');
    const text = document.getElementById('points-status-text');
    
    if (saldo > 0) {
        indicator.style.backgroundColor = '#4CAF50'; // Verde
        text.textContent = 'Personagem válido - pontos disponíveis';
        text.style.color = '#4CAF50';
    } else if (saldo === 0) {
        indicator.style.backgroundColor = '#FFC107'; // Amarelo
        text.textContent = 'Personagem completo - todos pontos usados';
        text.style.color = '#FFC107';
    } else {
        indicator.style.backgroundColor = '#f44336'; // Vermelho
        text.textContent = 'ATENÇÃO: Pontos excedidos!';
        text.style.color = '#f44336';
    }
}

// ===========================================
// STATUS SOCIAL - CONTROLE
// ===========================================

function ajustarModificador(tipo, valor) {
    // Mapear tipos para IDs corretos
    const typeMap = {
        'status': 'status',
        'reputacao': 'rep',
        'aparencia': 'app'
    };
    
    const displayId = typeMap[tipo];
    if (!displayId) {
        console.error('Tipo inválido:', tipo);
        return;
    }
    
    const currentSpan = document.getElementById(`${displayId}-value`);
    const currentPoints = document.getElementById(`${tipo}-points-compact`);
    
    if (!currentSpan) {
        console.error('Elemento não encontrado:', `${displayId}-value`);
        return;
    }
    
    let currentValue = parseInt(currentSpan.textContent) || 0;
    let newValue = currentValue + valor;
    
    // Limites
    if (tipo === 'status') {
        if (newValue < -5) newValue = -5;
        if (newValue > 8) newValue = 8;
    } else if (tipo === 'reputacao' || tipo === 'aparencia') {
        if (newValue < -4) newValue = -4;
        if (newValue > 4) newValue = 4;
    }
    
    // Atualizar estado
    dashboardState[tipo] = newValue;
    
    // Atualizar display
    currentSpan.textContent = newValue;
    
    // Calcular pontos (cada nível custa 5 pontos)
    const pontos = newValue * 5;
    if (currentPoints) {
        currentPoints.textContent = `[${pontos}]`;
    }
    
    // Atualizar total de pontos sociais
    const totalSocial = (dashboardState.status + dashboardState.reputacao + dashboardState.aparencia) * 5;
    const socialPointsElement = document.getElementById('social-total-points');
    if (socialPointsElement) {
        socialPointsElement.textContent = `${Math.abs(totalSocial)} pts`;
    }
    
    // Atualizar modificador total de reação
    const reacaoTotal = dashboardState.status + dashboardState.reputacao + dashboardState.aparencia;
    const display = reacaoTotal >= 0 ? `+${reacaoTotal}` : reacaoTotal.toString();
    const reactionElement = document.getElementById('reaction-total-compact');
    if (reactionElement) {
        reactionElement.textContent = display;
    }
    
    // Recalcular sistema de pontos
    atualizarSistemaPontos();
    salvarEstadoDashboard();
}

// ===========================================
// SINCRONIZAÇÃO COM ATRIBUTOS.JS
// ===========================================

function sincronizarAtributos() {
    try {
        // TENTATIVA 1: Verificar se atributos.js está carregado
        if (typeof personagemAtributos !== 'undefined') {
            console.log('✅ atributos.js detectado, sincronizando...');
            
            // Pegar valores principais
            dashboardState.ST = personagemAtributos.ST || 10;
            dashboardState.DX = personagemAtributos.DX || 10;
            dashboardState.IQ = personagemAtributos.IQ || 10;
            dashboardState.HT = personagemAtributos.HT || 10;
            
            // Calcular valores secundários
            const pvBase = dashboardState.ST;
            const pvBonus = personagemAtributos.bonus?.PV || 0;
            dashboardState.PV = Math.max(pvBase + pvBonus, 1);
            
            const pfBase = dashboardState.HT;
            const pfBonus = personagemAtributos.bonus?.PF || 0;
            dashboardState.PF = Math.max(pfBase + pfBonus, 1);
            
            const vontadeBase = dashboardState.IQ;
            const vontadeBonus = personagemAtributos.bonus?.Vontade || 0;
            dashboardState.Vontade = Math.max(vontadeBase + vontadeBonus, 1);
            
            const percepcaoBase = dashboardState.IQ;
            const percepcaoBonus = personagemAtributos.bonus?.Percepcao || 0;
            dashboardState.Percepcao = Math.max(percepcaoBase + percepcaoBonus, 1);
            
            // Atualizar dashboard
            atualizarDashboardAtributos();
        } else {
            // TENTATIVA 2: Tentar pegar diretamente dos inputs
            console.log('⚠️ atributos.js não detectado, tentando pegar valores dos inputs...');
            
            const stInput = document.getElementById('ST');
            const dxInput = document.getElementById('DX');
            const iqInput = document.getElementById('IQ');
            const htInput = document.getElementById('HT');
            
            if (stInput && dxInput && iqInput && htInput) {
                dashboardState.ST = parseInt(stInput.value) || 10;
                dashboardState.DX = parseInt(dxInput.value) || 10;
                dashboardState.IQ = parseInt(iqInput.value) || 10;
                dashboardState.HT = parseInt(htInput.value) || 10;
                
                // Calcular valores secundários
                dashboardState.PV = dashboardState.ST;
                dashboardState.PF = dashboardState.HT;
                dashboardState.Vontade = dashboardState.IQ;
                dashboardState.Percepcao = dashboardState.IQ;
                
                atualizarDashboardAtributos();
            } else {
                console.warn('⚠️ Inputs de atributos não encontrados');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao sincronizar atributos:', error);
    }
}

function atualizarDashboardAtributos() {
    console.log('📊 Atualizando atributos no dashboard:', {
        ST: dashboardState.ST,
        DX: dashboardState.DX,
        IQ: dashboardState.IQ,
        HT: dashboardState.HT,
        PV: dashboardState.PV,
        PF: dashboardState.PF
    });
    
    // Atualizar resumo de atributos
    document.getElementById('summary-st').textContent = dashboardState.ST;
    document.getElementById('summary-dx').textContent = dashboardState.DX;
    document.getElementById('summary-iq').textContent = dashboardState.IQ;
    document.getElementById('summary-ht').textContent = dashboardState.HT;
    
    // Atualizar valores secundários
    document.getElementById('summary-hp').textContent = dashboardState.PV;
    document.getElementById('summary-fp').textContent = dashboardState.PF;
    document.getElementById('summary-will').textContent = dashboardState.Vontade;
    document.getElementById('summary-per').textContent = dashboardState.Percepcao;
    
    // Atualizar status rápido
    document.getElementById('quick-hp').textContent = dashboardState.PV;
    document.getElementById('quick-fp').textContent = dashboardState.PF;
    
    // Calcular limites de carga baseados em ST
    calcularLimitesCarga(dashboardState.ST);
    
    // Recalcular sistema de pontos
    atualizarSistemaPontos();
}

function calcularLimitesCarga(ST) {
    // Tabela simplificada de cargas
    const cargasTable = {
        1: { leve: 0.2, media: 0.3, pesada: 0.6, extrema: 1.0 },
        2: { leve: 0.8, media: 1.2, pesada: 2.4, extrema: 4.0 },
        3: { leve: 1.8, media: 2.7, pesada: 5.4, extrema: 9.0 },
        4: { leve: 3.2, media: 4.8, pesada: 9.6, extrema: 16.0 },
        5: { leve: 5.0, media: 7.5, pesada: 15.0, extrema: 25.5 },
        6: { leve: 7.2, media: 10.8, pesada: 21.6, extrema: 36.0 },
        7: { leve: 9.8, media: 14.7, pesada: 29.4, extrema: 49.0 },
        8: { leve: 13.0, media: 19.5, pesada: 39.0, extrema: 65.0 },
        9: { leve: 16.0, media: 24.0, pesada: 48.0, extrema: 80.0 },
        10: { leve: 20.0, media: 30.0, pesada: 60.0, extrema: 100.0 },
        11: { leve: 24.0, media: 36.0, pesada: 72.0, extrema: 120.0 },
        12: { leve: 29.0, media: 43.5, pesada: 87.0, extrema: 145.0 },
        13: { leve: 34.0, media: 51.0, pesada: 102.0, extrema: 170.0 },
        14: { leve: 39.0, media: 58.5, pesada: 117.0, extrema: 195.0 },
        15: { leve: 45.0, media: 67.5, pesada: 135.0, extrema: 225.0 },
        16: { leve: 51.0, media: 76.5, pesada: 153.0, extrema: 255.0 },
        17: { leve: 58.0, media: 87.0, pesada: 174.0, extrema: 294.0 },
        18: { leve: 65.0, media: 97.5, pesada: 195.0, extrema: 325.0 },
        19: { leve: 72.0, media: 108.0, pesada: 216.0, extrema: 360.0 },
        20: { leve: 80.0, media: 120.0, pesada: 240.0, extrema: 400.0 }
    };
    
    let stKey = ST;
    if (ST > 20) stKey = 20;
    if (ST < 1) stKey = 1;
    
    const cargas = cargasTable[stKey] || cargasTable[10];
    
    // Atualizar display
    document.getElementById('limit-light').textContent = cargas.leve.toFixed(1) + ' kg';
    document.getElementById('limit-medium').textContent = cargas.media.toFixed(1) + ' kg';
    document.getElementById('limit-heavy').textContent = cargas.pesada.toFixed(1) + ' kg';
    document.getElementById('limit-extreme').textContent = cargas.extrema.toFixed(1) + ' kg';
    
    // Calcular nível de carga atual
    atualizarNivelCarga(dashboardState.pesoEquipamentos, cargas);
}

function atualizarNivelCarga(peso, limites) {
    const encLevel = document.getElementById('enc-level-display');
    if (!encLevel) return;
    
    // Remover classes anteriores
    encLevel.classList.remove('safe', 'light', 'medium', 'heavy', 'extreme');
    
    if (peso <= 0) {
        encLevel.textContent = 'Nenhuma';
        encLevel.classList.add('safe');
    } else if (peso <= limites.leve) {
        encLevel.textContent = 'Leve';
        encLevel.classList.add('light');
    } else if (peso <= limites.media) {
        encLevel.textContent = 'Média';
        encLevel.classList.add('medium');
    } else if (peso <= limites.pesada) {
        encLevel.textContent = 'Pesada';
        encLevel.classList.add('heavy');
    } else {
        encLevel.textContent = 'Extrema';
        encLevel.classList.add('extreme');
    }
}

// ===========================================
// FINANÇAS E CARGA
// ===========================================

function atualizarFinancas() {
    // Dinheiro
    const dinheiro = dashboardState.dinheiro;
    document.getElementById('current-money').textContent = `$${dinheiro}`;
    
    // Nível de riqueza
    const pontosRiqueza = calcularPontosRiqueza();
    document.getElementById('wealth-level-display').textContent = 
        `${dashboardState.nivelRiqueza} [${pontosRiqueza} pts]`;
    
    // Peso
    document.getElementById('equip-weight').textContent = 
        `${dashboardState.pesoEquipamentos.toFixed(1)} kg`;
    
    // Status financeiro
    atualizarStatusFinanceiro();
}

function calcularPontosRiqueza() {
    const niveis = {
        'Miserável': -25,
        'Muito Pobre': -15,
        'Pobre': -10,
        'Abaixo da média': -5,
        'Médio': 0,
        'Confortável': 10,
        'Rico': 20,
        'Muito Rico': 30,
        'Opulento': 50
    };
    
    return niveis[dashboardState.nivelRiqueza] || 0;
}

function atualizarStatusFinanceiro() {
    const statusElement = document.getElementById('finance-status');
    if (!statusElement) return;
    
    if (dashboardState.dinheiro < 100) {
        statusElement.textContent = 'Baixo';
        statusElement.style.backgroundColor = '#f44336';
    } else if (dashboardState.dinheiro < 1000) {
        statusElement.textContent = 'Médio';
        statusElement.style.backgroundColor = '#FFC107';
    } else {
        statusElement.textContent = 'Alto';
        statusElement.style.backgroundColor = '#4CAF50';
    }
}

// ===========================================
// UPLOAD DE FOTO - CORREÇÃO
// ===========================================

function configurarUploadFoto() {
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (!uploadInput || !photoPreview) {
        console.error('❌ Elementos de upload de foto não encontrados');
        return;
    }
    
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Limpar placeholder
                photoPreview.innerHTML = '';
                
                // Criar imagem
                const img = document.createElement('img');
                img.src = event.target.result;
                img.alt = "Foto do Personagem";
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '8px';
                
                // Adicionar à preview
                photoPreview.appendChild(img);
                
                // Adicionar botão de remover
                const removeBtn = document.createElement('button');
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.className = 'remove-photo-btn';
                removeBtn.title = 'Remover foto';
                removeBtn.onclick = function(e) {
                    e.stopPropagation();
                    photoPreview.innerHTML = `
                        <div class="photo-placeholder">
                            <i class="fas fa-user-circle"></i>
                            <span>Foto do Personagem</span>
                            <small>Opcional</small>
                        </div>`;
                    uploadInput.value = '';
                };
                
                photoPreview.appendChild(removeBtn);
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Clique na área de upload
    photoPreview.parentElement.addEventListener('click', function(e) {
        if (!e.target.closest('.remove-photo-btn')) {
            uploadInput.click();
        }
    });
}

// ===========================================
// CONTADORES
// ===========================================

function atualizarContadores() {
    // Atualizar todos os contadores
    document.getElementById('counter-advantages').textContent = dashboardState.vantagens;
    document.getElementById('counter-disadvantages').textContent = dashboardState.desvantagens;
    document.getElementById('counter-skills').textContent = dashboardState.pericias;
    document.getElementById('counter-spells').textContent = dashboardState.magias;
    document.getElementById('counter-languages').textContent = dashboardState.idiomas;
    document.getElementById('counter-relationships').textContent = dashboardState.relacionamentos;
    
    // Atualizar horário da última atualização
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('last-update-time').textContent = timeString;
}

// ===========================================
// FUNÇÃO PRINCIPAL DE ATUALIZAÇÃO
// ===========================================

function atualizarSistemaPontos() {
    calcularPontosGastos();
}

function atualizarDashboard() {
    console.log('🔄 Atualizando dashboard...');
    
    // Sincronizar com atributos.js
    sincronizarAtributos();
    
    // Atualizar todos os sistemas
    atualizarSistemaPontos();
    atualizarFinancas();
    atualizarContadores();
    
    // Salvar estado
    salvarEstadoDashboard();
    
    console.log('✅ Dashboard atualizado');
}

// ===========================================
// SALVAMENTO E CARREGAMENTO
// ===========================================

function salvarEstadoDashboard() {
    try {
        localStorage.setItem('gurps_dashboard', JSON.stringify(dashboardState));
        console.log('💾 Estado do dashboard salvo');
    } catch (error) {
        console.warn('Não foi possível salvar dashboard:', error);
    }
}

function carregarEstadoDashboard() {
    try {
        const dados = localStorage.getItem('gurps_dashboard');
        if (dados) {
            const savedState = JSON.parse(dados);
            
            // Mesclar com estado atual (preservando valores padrão)
            Object.keys(savedState).forEach(key => {
                if (dashboardState.hasOwnProperty(key)) {
                    dashboardState[key] = savedState[key];
                }
            });
            
            console.log('📂 Estado do dashboard carregado:', dashboardState);
            
            // Restaurar configurações
            if (document.getElementById('start-points')) {
                document.getElementById('start-points').value = dashboardState.pontosIniciais;
            }
            if (document.getElementById('dis-limit')) {
                document.getElementById('dis-limit').value = dashboardState.limiteDesvantagens;
            }
            
            // Restaurar status social
            if (document.getElementById('status-value')) {
                document.getElementById('status-value').textContent = dashboardState.status;
            }
            if (document.getElementById('rep-value')) {
                document.getElementById('rep-value').textContent = dashboardState.reputacao;
            }
            if (document.getElementById('app-value')) {
                document.getElementById('app-value').textContent = dashboardState.aparencia;
            }
            
            // Atualizar pontos sociais
            if (document.getElementById('status-points-compact')) {
                document.getElementById('status-points-compact').textContent = 
                    `[${dashboardState.status * 5}]`;
            }
            if (document.getElementById('reputacao-points-compact')) {
                document.getElementById('reputacao-points-compact').textContent = 
                    `[${dashboardState.reputacao * 5}]`;
            }
            if (document.getElementById('aparencia-points-compact')) {
                document.getElementById('aparencia-points-compact').textContent = 
                    `[${dashboardState.aparencia * 5}]`;
            }
            
            // Atualizar modificador total de reação
            const reacaoTotal = dashboardState.status + dashboardState.reputacao + dashboardState.aparencia;
            const display = reacaoTotal >= 0 ? `+${reacaoTotal}` : reacaoTotal.toString();
            if (document.getElementById('reaction-total-compact')) {
                document.getElementById('reaction-total-compact').textContent = display;
            }
            
            return true;
        }
    } catch (error) {
        console.warn('Não foi possível carregar dashboard:', error);
    }
    return false;
}

// ===========================================
// FORÇAR SINCRONIZAÇÃO MANUAL
// ===========================================

function forcarSincronizacaoAtributos() {
    console.log('🔄 Forçando sincronização com atributos...');
    
    // Tentar múltiplas abordagens
    const abordagens = [
        // Abordagem 1: atributos.js global
        () => {
            if (typeof personagemAtributos !== 'undefined') {
                return personagemAtributos;
            }
            return null;
        },
        
        // Abordagem 2: Inputs diretos
        () => {
            const st = document.getElementById('ST');
            const dx = document.getElementById('DX');
            const iq = document.getElementById('IQ');
            const ht = document.getElementById('HT');
            
            if (st && dx && iq && ht) {
                return {
                    ST: parseInt(st.value) || 10,
                    DX: parseInt(dx.value) || 10,
                    IQ: parseInt(iq.value) || 10,
                    HT: parseInt(ht.value) || 10,
                    bonus: {
                        PV: 0,
                        PF: 0,
                        Vontade: 0,
                        Percepcao: 0
                    }
                };
            }
            return null;
        },
        
        // Abordagem 3: localStorage
        () => {
            try {
                const dados = localStorage.getItem('gurps_atributos');
                if (dados) {
                    return JSON.parse(dados);
                }
            } catch (e) {}
            return null;
        }
    ];
    
    let dadosAtributos = null;
    
    for (let abordagem of abordagens) {
        dadosAtributos = abordagem();
        if (dadosAtributos) {
            console.log('✅ Dados de atributos encontrados via abordagem:', abordagem.name || 'desconhecida');
            break;
        }
    }
    
    if (dadosAtributos) {
        if (dadosAtributos.atributos) {
            // Formato do atributos.js
            dashboardState.ST = dadosAtributos.atributos.ST || 10;
            dashboardState.DX = dadosAtributos.atributos.DX || 10;
            dashboardState.IQ = dadosAtributos.atributos.IQ || 10;
            dashboardState.HT = dadosAtributos.atributos.HT || 10;
        } else {
            // Formato direto
            dashboardState.ST = dadosAtributos.ST || 10;
            dashboardState.DX = dadosAtributos.DX || 10;
            dashboardState.IQ = dadosAtributos.IQ || 10;
            dashboardState.HT = dadosAtributos.HT || 10;
        }
        
        atualizarDashboardAtributos();
        return true;
    }
    
    console.warn('⚠️ Não foi possível encontrar dados de atributos');
    return false;
}

// ===========================================
// INICIALIZAÇÃO
// ===========================================

function inicializarDashboard() {
    console.log('📊 Inicializando dashboard...');
    
    // Carregar estado salvo
    carregarEstadoDashboard();
    
    // Configurar event listeners
    if (document.getElementById('start-points')) {
        document.getElementById('start-points').addEventListener('change', function() {
            definirPontosIniciais(this.value);
        });
    }
    
    if (document.getElementById('dis-limit')) {
        document.getElementById('dis-limit').addEventListener('change', function() {
            definirLimiteDesvantagens(this.value);
        });
    }
    
    // Configurar botão de atualização
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', atualizarDashboard);
    }
    
    // Configurar upload de foto
    configurarUploadFoto();
    
    // Forçar sincronização inicial com atributos
    setTimeout(() => {
        forcarSincronizacaoAtributos();
        atualizarDashboard();
    }, 500);
    
    // Sincronizar periodicamente
    setInterval(() => {
        forcarSincronizacaoAtributos();
    }, 3000);
    
    // Observar mudanças na aba
    observarMudancasAba();
    
    console.log('✅ Dashboard inicializado');
}

function observarMudancasAba() {
    // Observar cliques em tabs
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Quando mudar para dashboard, atualizar
            if (this.getAttribute('onclick') && this.getAttribute('onclick').includes('dashboard')) {
                setTimeout(() => {
                    forcarSincronizacaoAtributos();
                    atualizarDashboard();
                }, 300);
            }
        });
    });
}

// ===========================================
// FUNÇÕES DE TESTE/DEMO
// ===========================================

function simularDadosAleatorios() {
    // Simular contadores
    dashboardState.vantagens = Math.floor(Math.random() * 10) + 1;
    dashboardState.desvantagens = Math.floor(Math.random() * 8) + 1;
    dashboardState.pericias = Math.floor(Math.random() * 20) + 5;
    dashboardState.magias = Math.floor(Math.random() * 15);
    dashboardState.idiomas = Math.floor(Math.random() * 3) + 1;
    dashboardState.relacionamentos = Math.floor(Math.random() * 5);
    
    // Simular finanças
    dashboardState.dinheiro = Math.floor(Math.random() * 5000);
    dashboardState.pesoEquipamentos = Math.random() * 50;
    
    atualizarDashboard();
}

// ===========================================
// EXPORTAR FUNÇÕES
// ===========================================

window.definirPontosIniciais = definirPontosIniciais;
window.definirLimiteDesvantagens = definirLimiteDesvantagens;
window.ajustarModificador = ajustarModificador;
window.atualizarDashboard = atualizarDashboard;
window.sincronizarAtributos = sincronizarAtributos;
window.forcarSincronizacaoAtributos = forcarSincronizacaoAtributos;
window.inicializarDashboard = inicializarDashboard;
window.simularDadosAleatorios = simularDadosAleatorios;

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na aba dashboard
    const dashboardTab = document.getElementById('dashboard');
    const isDashboardActive = dashboardTab && dashboardTab.classList.contains('active');
    
    // Se dashboard estiver ativa ou se for a única aba visível
    if (isDashboardActive || document.querySelector('.dashboard-gurps')) {
        setTimeout(inicializarDashboard, 1000);
    }
    
    // Também inicializar se detectar elementos do dashboard
    if (document.getElementById('summary-st')) {
        setTimeout(inicializarDashboard, 1500);
    }
});

// Fallback: inicializar após um tempo
setTimeout(() => {
    if (!window.dashboardInicializado && document.getElementById('summary-st')) {
        console.log('⏱️ Inicializando dashboard por timeout...');
        inicializarDashboard();
        window.dashboardInicializado = true;
    }
}, 2000);