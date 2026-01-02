// ===========================================
// DASHBOARD.JS - SISTEMA COMPLETO DE DASHBOARD
// ===========================================

// VARIÁVEIS GLOBAIS
let pontosTotais = {
    atributos: 0,
    vantagens: 0,
    desvantagens: 0,
    peculiaridades: 0,
    pericias: 0,
    tecnicas: 0,
    magias: 0,
    aparencia: 0,
    riqueza: 0,
    idiomas: 0
};

let pontosIniciais = 100;
let limiteDesvantagens = -75;
let saldoDisponivel = 100;

// ===========================================
// 1. SISTEMA DE UPLOAD DE FOTO
// ===========================================
function configurarUploadFoto() {
    console.log("🖼️ Configurando upload de foto...");
    
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    const photoFrame = document.querySelector('.photo-frame');
    
    if (!uploadInput || !photoPreview || !photoFrame) {
        console.log("❌ Elementos do upload não encontrados");
        return;
    }
    
    // Configurar clique no frame
    photoFrame.addEventListener('click', function() {
        console.log("📸 Clicou na foto, abrindo seletor...");
        uploadInput.click();
    });
    
    // Carregar foto salva
    carregarFotoSalva();
    
    // Configurar evento de upload
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) {
            console.log("❌ Nenhum arquivo selecionado");
            return;
        }
        
        console.log("📁 Arquivo selecionado:", file.name, file.type, file.size + " bytes");
        
        if (!file.type.match('image.*')) {
            showToast('❌ Por favor, selecione uma imagem válida (JPEG, PNG, etc.)', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) { // 5MB máximo
            showToast('⚠️ Imagem muito grande (máximo: 5MB)', 'warning');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            console.log("✅ Imagem carregada com sucesso");
            
            // Exibir preview
            photoPreview.innerHTML = `
                <img src="${event.target.result}" 
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
                     alt="Foto do personagem">
                <div class="foto-overlay">
                    <i class="fas fa-camera"></i> Alterar foto
                </div>
            `;
            
            // Salvar no localStorage
            try {
                localStorage.setItem('gurps_foto_personagem', event.target.result);
                showToast('✅ Foto do personagem salva!', 'success');
                console.log("💾 Foto salva no localStorage");
            } catch (error) {
                console.warn('❌ Erro ao salvar foto:', error);
                showToast('⚠️ Foto salva localmente (tamanho limitado)', 'info');
            }
        };
        
        reader.onerror = function() {
            console.error('❌ Erro ao ler arquivo');
            showToast('❌ Erro ao carregar imagem', 'error');
        };
        
        reader.readAsDataURL(file);
    });
}

function carregarFotoSalva() {
    const photoPreview = document.getElementById('photo-preview');
    if (!photoPreview) return;
    
    try {
        const fotoSalva = localStorage.getItem('gurps_foto_personagem');
        if (fotoSalva && fotoSalva.startsWith('data:image')) {
            console.log("🖼️ Carregando foto salva do localStorage");
            photoPreview.innerHTML = `
                <img src="${fotoSalva}" 
                     style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;"
                     alt="Foto do personagem">
                <div class="foto-overlay">
                    <i class="fas fa-camera"></i> Alterar foto
                </div>
            `;
        } else {
            console.log("📸 Nenhuma foto salva encontrada");
        }
    } catch (error) {
        console.warn('❌ Erro ao carregar foto:', error);
    }
}

// ===========================================
// 2. SISTEMA DE PONTOS DA APARÊNCIA
// ===========================================
function monitorarPontosAparencia() {
    console.log("🎭 Iniciando monitoramento de pontos de aparência...");
    
    // Buscar pontos atuais
    function buscarPontosAparencia() {
        try {
            // Primeiro, tenta pegar do select diretamente
            const select = document.getElementById('nivelAparencia');
            if (select) {
                const pontos = parseInt(select.value) || 0;
                console.log("🎭 Pontos do select de aparência:", pontos);
                return pontos;
            }
            
            // Se não encontrar, tenta do localStorage
            const pontosLS = localStorage.getItem('gurps_pontos_aparencia');
            if (pontosLS) {
                return parseInt(pontosLS);
            }
            
            return 0;
        } catch (error) {
            console.warn("❌ Erro ao buscar pontos de aparência:", error);
            return 0;
        }
    }
    
    // Atualizar no dashboard
    function atualizarPontosAparenciaNoDashboard() {
        const pontos = buscarPontosAparencia();
        console.log("🎭 Atualizando dashboard com pontos de aparência:", pontos);
        
        // Salvar nos pontos totais
        pontosTotais.aparencia = pontos;
        
        // Se for positivo (vantagem), adiciona ao card de vantagens
        if (pontos > 0) {
            const elementoVantagens = document.getElementById('points-adv');
            if (elementoVantagens) {
                elementoVantagens.textContent = pontos;
                elementoVantagens.classList.add('positivo');
                console.log(`✅ Aparência como vantagem: +${pontos} pts`);
            }
        }
        // Se for negativo (desvantagem), adiciona ao card de desvantagens
        else if (pontos < 0) {
            const elementoDesv = document.getElementById('points-dis');
            if (elementoDesv) {
                elementoDesv.textContent = Math.abs(pontos); // Valor absoluto
                elementoDesv.classList.add('negativo');
                console.log(`⚠️ Aparência como desvantagem: ${pontos} pts`);
            }
        }
        
        // Atualizar total de pontos gastos
        atualizarTotalPontosGastos();
        
        // Atualizar saldo
        atualizarSaldoPontos();
    }
    
    // Configurar eventos
    const selectAparencia = document.getElementById('nivelAparencia');
    if (selectAparencia) {
        selectAparencia.addEventListener('change', function() {
            console.log("🎭 Select de aparência alterado para:", this.value);
            setTimeout(atualizarPontosAparenciaNoDashboard, 300);
        });
    }
    
    // Ouvir eventos customizados
    document.addEventListener('caracteristicasAtualizadas', function(e) {
        if (e.detail && e.detail.tipo === 'aparencia') {
            console.log("🎭 Evento de atualização de aparência recebido");
            atualizarPontosAparenciaNoDashboard();
        }
    });
    
    document.addEventListener('dashboardUpdate', function(e) {
        if (e.detail && e.detail.tipo === 'aparencia') {
            console.log("🎭 Dashboard atualizando aparência");
            atualizarPontosAparenciaNoDashboard();
        }
    });
    
    // Verificar periodicamente (a cada 2 segundos)
    const intervalo = setInterval(function() {
        const select = document.getElementById('nivelAparencia');
        if (select && document.getElementById('caracteristicas').classList.contains('active')) {
            atualizarPontosAparenciaNoDashboard();
        }
    }, 2000);
    
    // Atualizar agora
    setTimeout(atualizarPontosAparenciaNoDashboard, 1500);
    
    return intervalo;
}

// ===========================================
// 3. SISTEMA DE PONTOS GERAL
// ===========================================
function definirPontosIniciais(valor) {
    pontosIniciais = parseInt(valor) || 100;
    console.log("🎯 Pontos iniciais definidos para:", pontosIniciais);
    atualizarSaldoPontos();
    salvarConfiguracoes();
}

function definirLimiteDesvantagens(valor) {
    limiteDesvantagens = parseInt(valor) || -75;
    console.log("⚠️ Limite de desvantagens definido para:", limiteDesvantagens);
    verificarLimites();
    salvarConfiguracoes();
}

function atualizarTotalPontosGastos() {
    // Calcular total de pontos gastos
    let totalGastos = 0;
    
    // Somar tudo (desvantagens são negativas)
    totalGastos += pontosTotais.atributos;
    totalGastos += pontosTotais.vantagens;
    totalGastos += pontosTotais.desvantagens; // Já é negativo
    totalGastos += pontosTotais.peculiaridades; // Negativo
    totalGastos += pontosTotais.aparencia; // Pode ser positivo ou negativo
    totalGastos += pontosTotais.riqueza; // Pode ser positivo ou negativo
    totalGastos += pontosTotais.idiomas;
    totalGastos += pontosTotais.pericias;
    totalGastos += pontosTotais.tecnicas;
    totalGastos += pontosTotais.magias;
    
    console.log("🧮 Total de pontos gastos calculado:", totalGastos);
    
    // Atualizar display
    const elementoTotal = document.getElementById('total-points-spent');
    if (elementoTotal) {
        elementoTotal.textContent = totalGastos + " pts";
        
        // Colorir baseado no valor
        elementoTotal.className = 'card-badge';
        if (totalGastos > pontosIniciais) {
            elementoTotal.classList.add('perigo');
        } else if (totalGastos < pontosIniciais) {
            elementoTotal.classList.add('sucesso');
        }
    }
    
    return totalGastos;
}

function atualizarSaldoPontos() {
    const totalGastos = atualizarTotalPontosGastos();
    saldoDisponivel = pontosIniciais - totalGastos;
    
    console.log("💰 Saldo disponível:", saldoDisponivel, "(Iniciais:", pontosIniciais, "- Gastos:", totalGastos, ")");
    
    // Atualizar display
    const elementoSaldo = document.getElementById('points-balance');
    const elementoStatus = document.getElementById('points-status-text');
    const elementoIndicador = document.getElementById('points-status-indicator');
    
    if (elementoSaldo) {
        elementoSaldo.textContent = saldoDisponivel;
        
        // Colorir o saldo
        elementoSaldo.parentElement.className = 'balance-value-container';
        if (saldoDisponivel < 0) {
            elementoSaldo.parentElement.classList.add('negativo');
            elementoStatus.textContent = 'Personagem INVÁLIDO (pontos negativos)';
            elementoIndicador.className = 'status-indicator perigo';
        } else if (saldoDisponivel === 0) {
            elementoSaldo.parentElement.classList.add('exato');
            elementoStatus.textContent = 'Personagem válido (pontos exatos)';
            elementoIndicador.className = 'status-indicator exato';
        } else if (saldoDisponivel <= 10) {
            elementoSaldo.parentElement.classList.add('baixo');
            elementoStatus.textContent = 'Personagem válido (poucos pontos sobrando)';
            elementoIndicador.className = 'status-indicator baixo';
        } else {
            elementoSaldo.parentElement.classList.add('positivo');
            elementoStatus.textContent = 'Personagem válido';
            elementoIndicador.className = 'status-indicator positivo';
        }
    }
    
    verificarLimites();
    return saldoDisponivel;
}

function verificarLimites() {
    // Verificar limite de desvantagens
    const totalDesvantagens = Math.abs(pontosTotais.desvantagens + pontosTotais.peculiaridades);
    const limite = Math.abs(limiteDesvantagens);
    
    if (totalDesvantagens > limite) {
        console.warn("⚠️ ATENÇÃO: Limite de desvantagens excedido!", totalDesvantagens, ">", limite);
        showToast(`⚠️ Limite de desvantagens excedido! (${totalDesvantagens}/${limite})`, 'warning');
    }
    
    // Verificar pontos negativos
    if (saldoDisponivel < 0) {
        console.error("❌ ERRO: Pontos negativos!", saldoDisponivel);
        showToast(`❌ Personagem inválido! Pontos negativos: ${saldoDisponivel}`, 'error');
    }
}

// ===========================================
// 4. SISTEMA DE DADOS DA IDENTIFICAÇÃO
// ===========================================
function atualizarDadosIdentificacao() {
    console.log("📇 Atualizando dados de identificação...");
    
    // Nome do personagem
    const charNameInput = document.getElementById('characterName');
    const charNameDisplay = document.getElementById('char-name');
    if (charNameInput && charNameDisplay) {
        charNameDisplay.value = charNameInput.value || "Sem nome";
    }
    
    // Raça (buscar do sistema de características)
    try {
        const raca = localStorage.getItem('gurps_raca') || "Humano";
        const charRace = document.getElementById('char-race');
        if (charRace) charRace.value = raca;
    } catch (e) {
        console.warn("Não foi possível carregar raça:", e);
    }
    
    // Ocupação
    try {
        const ocupacao = localStorage.getItem('gurps_ocupacao') || "Aventureiro";
        const charType = document.getElementById('char-type');
        if (charType) charType.value = ocupacao;
    } catch (e) {
        console.warn("Não foi possível carregar ocupação:", e);
    }
    
    // Jogador (do Firebase)
    const charPlayer = document.getElementById('char-player');
    if (charPlayer && currentUser) {
        charPlayer.value = currentUser.displayName || currentUser.email || "Jogador";
    }
    
    // PV e PF rápidos
    atualizarPVPFRapido();
}

function atualizarPVPFRapido() {
    // Buscar PV atual
    try {
        const pvAtual = localStorage.getItem('gurps_pv_atual') || 10;
        const pvMax = localStorage.getItem('gurps_pv_max') || 10;
        const quickHP = document.getElementById('quick-hp');
        if (quickHP) quickHP.textContent = `${pvAtual}/${pvMax}`;
    } catch (e) {
        console.warn("Não foi possível carregar PV:", e);
    }
    
    // Buscar PF atual
    try {
        const pfAtual = localStorage.getItem('gurps_pf_atual') || 10;
        const pfMax = localStorage.getItem('gurps_pf_max') || 10;
        const quickFP = document.getElementById('quick-fp');
        if (quickFP) quickFP.textContent = `${pfAtual}/${pfMax}`;
    } catch (e) {
        console.warn("Não foi possível carregar PF:", e);
    }
}

// ===========================================
// 5. SISTEMA DE STATUS SOCIAL
// ===========================================
function atualizarStatusSocial() {
    console.log("👑 Atualizando status social...");
    
    // Buscar pontos de status
    try {
        // Status
        const statusPontos = parseInt(localStorage.getItem('gurps_status_pontos')) || 0;
        const statusValue = document.getElementById('status-value');
        const statusPoints = document.getElementById('status-points-compact');
        if (statusValue) statusValue.textContent = statusPontos >= 0 ? `+${statusPontos}` : statusPontos;
        if (statusPoints) statusPoints.textContent = `[${statusPontos * 5} pts]`;
        
        // Reputação
        const repPontos = parseInt(localStorage.getItem('gurps_reputacao_pontos')) || 0;
        const repValue = document.getElementById('rep-value');
        const repPoints = document.getElementById('reputacao-points-compact');
        if (repValue) repValue.textContent = repPontos >= 0 ? `+${repPontos}` : repPontos;
        if (repPoints) repPoints.textContent = `[${repPontos * 5} pts]`;
        
        // Aparência (já temos no sistema principal)
        const appPontos = pontosTotais.aparencia || 0;
        const appValue = document.getElementById('app-value');
        const appPoints = document.getElementById('aparencia-points-compact');
        if (appValue) appValue.textContent = appPontos >= 0 ? `+${appPontos}` : appPontos;
        if (appPoints) appPoints.textContent = `[${appPontos} pts]`;
        
        // Total de reação
        const totalReacao = statusPontos + repPontos + Math.floor(appPontos / 4);
        const reactionTotal = document.getElementById('reaction-total-compact');
        if (reactionTotal) {
            reactionTotal.textContent = totalReacao >= 0 ? `+${totalReacao}` : totalReacao;
        }
        
        // Total de pontos sociais
        const totalSocial = (statusPontos * 5) + (repPontos * 5) + appPontos;
        const socialTotal = document.getElementById('social-total-points');
        if (socialTotal) {
            socialTotal.textContent = totalSocial + " pts";
        }
        
    } catch (error) {
        console.warn("Erro ao atualizar status social:", error);
    }
}

// ===========================================
// 6. SISTEMA DE FINANÇAS E CARGA
// ===========================================
function atualizarFinancasCarga() {
    console.log("💰 Atualizando finanças e carga...");
    
    // Dinheiro
    try {
        const dinheiro = parseFloat(localStorage.getItem('gurps_dinheiro')) || 0;
        const currentMoney = document.getElementById('current-money');
        if (currentMoney) currentMoney.textContent = `$${dinheiro.toFixed(2)}`;
    } catch (e) {
        console.warn("Erro ao carregar dinheiro:", e);
    }
    
    // Nível de riqueza
    try {
        const riquezaPontos = pontosTotais.riqueza || 0;
        let nivelRiqueza = "Médio";
        if (riquezaPontos <= -25) nivelRiqueza = "Falido";
        else if (riquezaPontos <= -15) nivelRiqueza = "Pobre";
        else if (riquezaPontos <= -10) nivelRiqueza = "Batalhador";
        else if (riquezaPontos >= 10) nivelRiqueza = "Confortável";
        else if (riquezaPontos >= 20) nivelRiqueza = "Rico";
        else if (riquezaPontos >= 30) nivelRiqueza = "Muito Rico";
        else if (riquezaPontos >= 50) nivelRiqueza = "Podre de Rico";
        
        const wealthDisplay = document.getElementById('wealth-level-display');
        if (wealthDisplay) {
            wealthDisplay.textContent = `${nivelRiqueza} [${riquezaPontos} pts]`;
        }
        
        const financeStatus = document.getElementById('finance-status');
        if (financeStatus) {
            financeStatus.textContent = nivelRiqueza;
            financeStatus.className = 'card-badge';
            if (riquezaPontos < 0) financeStatus.classList.add('negativo');
            else if (riquezaPontos > 0) financeStatus.classList.add('positivo');
        }
    } catch (e) {
        console.warn("Erro ao carregar riqueza:", e);
    }
    
    // Peso e carga
    atualizarCarga();
}

function atualizarCarga() {
    try {
        // Peso total
        const pesoTotal = parseFloat(localStorage.getItem('gurps_peso_total')) || 0;
        const equipWeight = document.getElementById('equip-weight');
        if (equipWeight) equipWeight.textContent = `${pesoTotal.toFixed(1)} kg`;
        
        // Força (ST) para calcular limites
        const ST = parseInt(document.getElementById('ST')?.value) || 10;
        
        // Calcular limites
        const leve = ST * 2;
        const media = ST * 3;
        const pesada = ST * 6;
        const extrema = ST * 10;
        
        // Atualizar displays
        const limitLight = document.getElementById('limit-light');
        const limitMedium = document.getElementById('limit-medium');
        const limitHeavy = document.getElementById('limit-heavy');
        const limitExtreme = document.getElementById('limit-extreme');
        
        if (limitLight) limitLight.textContent = `${leve.toFixed(1)} kg`;
        if (limitMedium) limitMedium.textContent = `${media.toFixed(1)} kg`;
        if (limitHeavy) limitHeavy.textContent = `${pesada.toFixed(1)} kg`;
        if (limitExtreme) limitExtreme.textContent = `${extrema.toFixed(1)} kg`;
        
        // Determinar nível de carga
        let nivelCarga = "Nenhuma";
        if (pesoTotal > extrema) nivelCarga = "Extrema";
        else if (pesoTotal > pesada) nivelCarga = "Pesada";
        else if (pesoTotal > media) nivelCarga = "Média";
        else if (pesoTotal > leve) nivelCarga = "Leve";
        
        const encLevel = document.getElementById('enc-level-display');
        if (encLevel) {
            encLevel.textContent = nivelCarga;
            encLevel.className = 'enc-value';
            if (nivelCarga === "Extrema") encLevel.classList.add('extrema');
            else if (nivelCarga === "Pesada") encLevel.classList.add('pesada');
            else if (nivelCarga === "Média") encLevel.classList.add('media');
            else if (nivelCarga === "Leve") encLevel.classList.add('leve');
        }
        
    } catch (error) {
        console.warn("Erro ao atualizar carga:", error);
    }
}

// ===========================================
// 7. RESUMO DE ATRIBUTOS
// ===========================================
function atualizarAtributosResumo() {
    console.log("💪 Atualizando resumo de atributos...");
    
    // Atributos principais
    const atributos = ['ST', 'DX', 'IQ', 'HT'];
    atributos.forEach(atributo => {
        const valor = document.getElementById(atributo)?.value || 10;
        const elemento = document.getElementById(`summary-${atributo.toLowerCase()}`);
        if (elemento) elemento.textContent = valor;
    });
    
    // Atributos secundários
    const secundarios = {
        'hp': 'PVTotal',
        'fp': 'PFTotal',
        'will': 'VontadeTotal',
        'per': 'PercepcaoTotal'
    };
    
    Object.entries(secundarios).forEach(([id, fonte]) => {
        const valor = document.getElementById(fonte)?.textContent || 10;
        const elemento = document.getElementById(`summary-${id}`);
        if (elemento) elemento.textContent = valor;
    });
}

// ===========================================
// 8. CONTADORES
// ===========================================
function atualizarContadores() {
    console.log("🔢 Atualizando contadores...");
    
    try {
        // Vantagens
        const vantagens = JSON.parse(localStorage.getItem('gurps_vantagens') || '[]');
        document.getElementById('counter-advantages').textContent = vantagens.length;
        pontosTotais.vantagens = vantagens.reduce((total, v) => total + (v.pontos || 0), 0);
        
        // Desvantagens
        const desvantagens = JSON.parse(localStorage.getItem('gurps_desvantagens') || '[]');
        document.getElementById('counter-disadvantages').textContent = desvantagens.length;
        pontosTotais.desvantagens = desvantagens.reduce((total, d) => total + (d.pontos || 0), 0);
        
        // Perícias
        const pericias = JSON.parse(localStorage.getItem('gurps_pericias') || '[]');
        document.getElementById('counter-skills').textContent = pericias.length;
        pontosTotais.pericias = pericias.reduce((total, p) => total + (p.pontos || 0), 0);
        
        // Magias
        const magias = JSON.parse(localStorage.getItem('gurps_magias') || '[]');
        document.getElementById('counter-spells').textContent = magias.length;
        pontosTotais.magias = magias.reduce((total, m) => total + (m.pontos || 0), 0);
        
        // Idiomas
        const idiomas = JSON.parse(localStorage.getItem('gurps_idiomas') || '[]');
        document.getElementById('counter-languages').textContent = idiomas.length + 1; // +1 para nativo
        pontosTotais.idiomas = idiomas.reduce((total, i) => total + (i.pontos || 0), 0);
        
        // Relacionamentos
        const relacionamentos = JSON.parse(localStorage.getItem('gurps_relacionamentos') || '[]');
        document.getElementById('counter-relationships').textContent = relacionamentos.length;
        
    } catch (error) {
        console.warn("Erro ao atualizar contadores:", error);
    }
    
    // Atualizar os displays de pontos
    atualizarDisplaysPontos();
}

function atualizarDisplaysPontos() {
    // Atualizar cada card de pontos
    const displays = {
        'points-attr': pontosTotais.atributos,
        'points-adv': pontosTotais.vantagens + (pontosTotais.aparencia > 0 ? pontosTotais.aparencia : 0),
        'points-dis': Math.abs(pontosTotais.desvantagens + (pontosTotais.aparencia < 0 ? pontosTotais.aparencia : 0)),
        'points-pec': Math.abs(pontosTotais.peculiaridades),
        'points-skills': pontosTotais.pericias,
        'points-tech': pontosTotais.tecnicas,
        'points-spells': pontosTotais.magias
    };
    
    Object.entries(displays).forEach(([id, valor]) => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
            
            // Aplicar classes de cor
            elemento.className = 'breakdown-value';
            if (id === 'points-adv' && valor > 0) elemento.classList.add('positivo');
            if (id === 'points-dis' && valor > 0) elemento.classList.add('negativo');
            if (id === 'points-pec' && valor > 0) elemento.classList.add('negativo');
        }
    });
}

// ===========================================
// 9. FUNÇÕES DE CONFIGURAÇÃO
// ===========================================
function salvarConfiguracoes() {
    try {
        const config = {
            pontosIniciais: pontosIniciais,
            limiteDesvantagens: limiteDesvantagens,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('gurps_dashboard_config', JSON.stringify(config));
        console.log("💾 Configurações salvas:", config);
    } catch (error) {
        console.warn("Erro ao salvar configurações:", error);
    }
}

function carregarConfiguracoes() {
    try {
        const config = JSON.parse(localStorage.getItem('gurps_dashboard_config') || '{}');
        if (config.pontosIniciais) {
            pontosIniciais = config.pontosIniciais;
            document.getElementById('start-points').value = pontosIniciais;
        }
        if (config.limiteDesvantagens) {
            limiteDesvantagens = config.limiteDesvantagens;
            document.getElementById('dis-limit').value = limiteDesvantagens;
        }
        console.log("📂 Configurações carregadas:", config);
    } catch (error) {
        console.warn("Erro ao carregar configurações:", error);
    }
}

// ===========================================
// 10. FUNÇÃO PRINCIPAL DO DASHBOARD
// ===========================================
function atualizarDashboard() {
    console.log("🔄 ATUALIZANDO DASHBOARD COMPLETO...");
    
    // 1. Configurações
    carregarConfiguracoes();
    
    // 2. Upload de foto
    configurarUploadFoto();
    
    // 3. Dados básicos
    atualizarDadosIdentificacao();
    
    // 4. Sistema de pontos
    atualizarTotalPontosGastos();
    atualizarSaldoPontos();
    
    // 5. Status social
    atualizarStatusSocial();
    
    // 6. Finanças e carga
    atualizarFinancasCarga();
    
    // 7. Atributos
    atualizarAtributosResumo();
    
    // 8. Contadores
    atualizarContadores();
    
    // 9. Atualizar hora
    document.getElementById('last-update-time').textContent = 
        new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    
    console.log("✅ Dashboard atualizado!");
    showToast('📊 Dashboard atualizado com sucesso!', 'success');
}

// ===========================================
// 11. INICIALIZAÇÃO COMPLETA
// ===========================================
function initDashboardTab() {
    console.log("📊 INICIALIZANDO DASHBOARD COMPLETO...");
    
    // Carregar configurações
    carregarConfiguracoes();
    
    // Configurar eventos dos controles
    const startPointsInput = document.getElementById('start-points');
    const disLimitInput = document.getElementById('dis-limit');
    
    if (startPointsInput) {
        startPointsInput.addEventListener('change', function() {
            definirPontosIniciais(this.value);
        });
    }
    
    if (disLimitInput) {
        disLimitInput.addEventListener('change', function() {
            definirLimiteDesvantagens(this.value);
        });
    }
    
    // Configurar botão de atualização
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', atualizarDashboard);
    }
    
    // Iniciar monitoramento de aparência
    setTimeout(() => {
        monitorarPontosAparencia();
    }, 1000);
    
    // Configurar upload de foto
    configurarUploadFoto();
    
    // Atualizar tudo agora
    setTimeout(atualizarDashboard, 500);
    
    // Atualizar a cada 30 segundos
    setInterval(atualizarDashboard, 30000);
    
    console.log("✅ Dashboard inicializado!");
}

// ===========================================
// 12. EVENTOS E EXPORTAÇÕES
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log("🏰 Dashboard pronto para inicialização");
    
    // Observar quando a aba dashboard for ativada
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const tab = mutation.target;
                if (tab.id === 'dashboard' && tab.classList.contains('active')) {
                    console.log("📊 Aba dashboard ativada!");
                    setTimeout(initDashboardTab, 100);
                }
            }
        });
    });
    
    // Observar a aba dashboard
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab) {
        observer.observe(dashboardTab, { attributes: true });
    }
    
    // Se já estiver ativa, inicializar agora
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        setTimeout(initDashboardTab, 500);
    }
});

// Ouvir eventos de outras abas
document.addEventListener('atributosAtualizados', atualizarDashboard);
document.addEventListener('caracteristicasAtualizadas', atualizarDashboard);
document.addEventListener('vantagensAtualizadas', atualizarDashboard);
document.addEventListener('periciasAtualizadas', atualizarDashboard);
document.addEventListener('magiaAtualizada', atualizarDashboard);
document.addEventListener('equipamentoAtualizado', atualizarDashboard);

// ===========================================
// 13. FUNÇÕES DE APOIO
// ===========================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('custom-toast');
    if (!toast) return;
    
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    
    toast.innerHTML = `<i class="fas fa-${icons[type] || 'info-circle'}"></i> ${message}`;
    toast.style.display = 'block';
    
    const bgColor = type === 'error' ? 'var(--accent-red)' : 
                   type === 'success' ? 'var(--accent-green)' : 
                   type === 'warning' ? 'var(--primary-gold)' : 
                   'var(--secondary-dark)';
    
    toast.style.background = bgColor;
    toast.style.animation = 'slideIn 0.3s ease';
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 3000);
}

// ===========================================
// 14. EXPORTAÇÃO PARA USO GLOBAL
// ===========================================
window.initDashboardTab = initDashboardTab;
window.atualizarDashboard = atualizarDashboard;
window.configurarUploadFoto = configurarUploadFoto;
window.monitorarPontosAparencia = monitorarPontosAparencia;
window.definirPontosIniciais = definirPontosIniciais;
window.definirLimiteDesvantagens = definirLimiteDesvantagens;

console.log("🚀 Dashboard.js carregado e pronto!");