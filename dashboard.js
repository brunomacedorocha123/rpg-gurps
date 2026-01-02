// ===========================================
// DASHBOARD.JS - COMPLETO E FUNCIONAL
// SÓ USA O QUE JÁ EXISTE NO LOCALSTORAGE
// ===========================================

let configPontos = {
    iniciais: 100,
    limite: -75
};

// ===== 1. UPLOAD DA FOTO =====
function configurarUploadFoto() {
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (!uploadInput || !photoPreview) return;
    
    // Carrega foto salva
    const fotoSalva = localStorage.getItem('gurps_foto_personagem');
    if (fotoSalva) {
        photoPreview.innerHTML = `
            <img src="${fotoSalva}" 
                 alt="Foto do Personagem" 
                 style="width:100%;height:100%;object-fit:cover;border-radius:7px;">
        `;
    }
    
    // Configura upload
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione apenas imagens!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreview.innerHTML = `
                <img src="${e.target.result}" 
                     alt="Foto do Personagem" 
                     style="width:100%;height:100%;object-fit:cover;border-radius:7px;">
            `;
            localStorage.setItem('gurps_foto_personagem', e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

// ===== 2. SISTEMA DE PONTOS =====
function configurarSistemaPontos() {
    const pontosIniciaisInput = document.getElementById('start-points');
    const limiteDesvInput = document.getElementById('dis-limit');
    
    // Carrega configuração salva
    const pontosSalvos = JSON.parse(localStorage.getItem('gurps_config_pontos') || '{"iniciais":100,"limite":-75}');
    configPontos = pontosSalvos;
    
    // Aplica valores
    pontosIniciaisInput.value = configPontos.iniciais;
    limiteDesvInput.value = configPontos.limite;
    
    // Salva quando mudar
    pontosIniciaisInput.addEventListener('change', function() {
        configPontos.iniciais = parseInt(this.value) || 100;
        localStorage.setItem('gurps_config_pontos', JSON.stringify(configPontos));
        calcularSaldoPontos();
    });
    
    limiteDesvInput.addEventListener('change', function() {
        configPontos.limite = parseInt(this.value) || -75;
        localStorage.setItem('gurps_config_pontos', JSON.stringify(configPontos));
        calcularSaldoPontos();
    });
    
    // Calcula saldo inicial
    calcularSaldoPontos();
}

// ===== 3. PEGA ATRIBUTOS DO LOCALSTORAGE =====
function carregarAtributos() {
    try {
        // Pega dados da aba de atributos
        const dadosAtributos = JSON.parse(localStorage.getItem('gurps_atributos') || '{}');
        
        if (dadosAtributos.atributos) {
            const att = dadosAtributos.atributos;
            
            // Atributos principais no dashboard
            document.getElementById('summary-st').textContent = att.ST || 10;
            document.getElementById('summary-dx').textContent = att.DX || 10;
            document.getElementById('summary-iq').textContent = att.IQ || 10;
            document.getElementById('summary-ht').textContent = att.HT || 10;
            
            // Calcula atributos secundários
            const pvTotal = (att.ST || 10) + (dadosAtributos.bonus?.PV || 0);
            const fpTotal = (att.HT || 10) + (dadosAtributos.bonus?.PF || 0);
            const vontadeTotal = (att.IQ || 10) + (dadosAtributos.bonus?.Vontade || 0);
            const percepcaoTotal = (att.IQ || 10) + (dadosAtributos.bonus?.Percepcao || 0);
            
            // Atualiza dashboard
            document.getElementById('summary-hp').textContent = pvTotal;
            document.getElementById('summary-fp').textContent = fpTotal;
            document.getElementById('summary-will').textContent = vontadeTotal;
            document.getElementById('summary-per').textContent = percepcaoTotal;
            
            // Status rápido
            document.getElementById('quick-hp').textContent = pvTotal;
            document.getElementById('quick-fp').textContent = fpTotal;
            
            // Calcula pontos gastos em atributos
            const custoST = ((att.ST || 10) - 10) * 10;
            const custoDX = ((att.DX || 10) - 10) * 20;
            const custoIQ = ((att.IQ || 10) - 10) * 20;
            const custoHT = ((att.HT || 10) - 10) * 10;
            const totalAtributos = custoST + custoDX + custoIQ + custoHT;
            
            // Atualiza no card de pontos
            document.getElementById('points-attr').textContent = totalAtributos;
            
            return totalAtributos;
        }
    } catch (error) {
        console.warn('Erro ao carregar atributos:', error);
    }
    return 0;
}

// ===== 4. CALCULA SALDO DE PONTOS =====
function calcularSaldoPontos() {
    // Pontos gastos em atributos
    const pontosAtributos = parseInt(document.getElementById('points-attr').textContent) || 0;
    
    // Pontos de outras categorias (inicialmente 0)
    const pontosVantagens = parseInt(document.getElementById('points-adv').textContent) || 0;
    const pontosDesvantagens = parseInt(document.getElementById('points-dis').textContent) || 0;
    const pontosPeculiaridades = parseInt(document.getElementById('points-pec').textContent) || 0;
    const pontosPericias = parseInt(document.getElementById('points-skills').textContent) || 0;
    const pontosTecnicas = parseInt(document.getElementById('points-tech').textContent) || 0;
    const pontosMagias = parseInt(document.getElementById('points-spells').textContent) || 0;
    
    // Total gasto
    const totalGasto = pontosAtributos + pontosVantagens + Math.abs(pontosDesvantagens) + 
                       pontosPeculiaridades + pontosPericias + pontosTecnicas + pontosMagias;
    
    // Saldo
    const saldo = configPontos.iniciais - totalGasto;
    
    // Atualiza display
    document.getElementById('total-points-spent').textContent = totalGasto + ' pts';
    document.getElementById('points-balance').textContent = saldo;
    
    // Status
    const statusIndicator = document.getElementById('points-status-indicator');
    const statusText = document.getElementById('points-status-text');
    
    if (saldo < 0) {
        document.getElementById('points-balance').classList.add('saldo-negativo');
        statusIndicator.style.background = '#f44336';
        statusText.textContent = 'Pontos negativos!';
        statusText.style.color = '#f44336';
    } else if (saldo === 0) {
        document.getElementById('points-balance').classList.remove('saldo-negativo');
        statusIndicator.style.background = '#4CAF50';
        statusText.textContent = 'Todos os pontos usados';
        statusText.style.color = '#4CAF50';
    } else {
        document.getElementById('points-balance').classList.remove('saldo-negativo');
        statusIndicator.style.background = '#FFC107';
        statusText.textContent = saldo + ' pontos disponíveis';
        statusText.style.color = '#FFC107';
    }
}

// ===== 5. STATUS SOCIAL =====
function configurarStatusSocial() {
    // Carrega valores salvos
    const sociaisSalvos = JSON.parse(localStorage.getItem('gurps_status_social') || '{"status":0,"reputacao":0,"aparencia":0}');
    
    document.getElementById('status-value').textContent = sociaisSalvos.status || 0;
    document.getElementById('rep-value').textContent = sociaisSalvos.reputacao || 0;
    document.getElementById('app-value').textContent = sociaisSalvos.aparencia || 0;
    
    calcularStatusSocial();
}

function calcularStatusSocial() {
    const status = parseInt(document.getElementById('status-value').textContent) || 0;
    const reputacao = parseInt(document.getElementById('rep-value').textContent) || 0;
    const aparencia = parseInt(document.getElementById('app-value').textContent) || 0;
    
    // Calcula pontos (Status: 5/pt, Rep/Apar: 5/nível)
    const pontosStatus = status * 5;
    const pontosReputacao = reputacao * 5;
    const pontosAparencia = aparencia * 5;
    const totalPontos = pontosStatus + pontosReputacao + pontosAparencia;
    
    // Atualiza display
    document.getElementById('status-points-compact').textContent = `[${pontosStatus}]`;
    document.getElementById('reputacao-points-compact').textContent = `[${pontosReputacao}]`;
    document.getElementById('aparencia-points-compact').textContent = `[${pontosAparencia}]`;
    document.getElementById('social-total-points').textContent = totalPontos + ' pts';
    
    // Total de reação
    const totalReacao = status + reputacao + aparencia;
    const totalElement = document.getElementById('reaction-total-compact');
    totalElement.textContent = (totalReacao >= 0 ? '+' : '') + totalReacao;
    
    // Cor baseada no valor
    totalElement.style.color = totalReacao > 0 ? '#4CAF50' : totalReacao < 0 ? '#f44336' : 'var(--text-gold)';
    
    // Se pontos sociais negativos, adiciona às desvantagens
    if (totalPontos < 0) {
        document.getElementById('points-dis').textContent = Math.abs(totalPontos);
    }
    
    calcularSaldoPontos();
}

// ===== 6. IDENTIFICAÇÃO =====
function configurarIdentificacao() {
    // Carrega dados salvos
    const dadosSalvos = JSON.parse(localStorage.getItem('gurps_identificacao') || '{}');
    
    document.getElementById('char-name').value = dadosSalvos.nome || '';
    document.getElementById('char-race').value = dadosSalvos.raca || 'Humano';
    document.getElementById('char-type').value = dadosSalvos.ocupacao || '';
    document.getElementById('char-player').value = dadosSalvos.jogador || '';
    
    // Salva automaticamente
    ['char-name', 'char-race', 'char-type', 'char-player'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function() {
                const dados = {
                    nome: document.getElementById('char-name').value,
                    raca: document.getElementById('char-race').value,
                    ocupacao: document.getElementById('char-type').value,
                    jogador: document.getElementById('char-player').value
                };
                localStorage.setItem('gurps_identificacao', JSON.stringify(dados));
            });
        }
    });
}

// ===== 7. FINANÇAS E CARGA =====
function atualizarFinancasCarga() {
    // Pega ST dos atributos
    const dadosAtributos = JSON.parse(localStorage.getItem('gurps_atributos') || '{}');
    const ST = dadosAtributos.atributos?.ST || 10;
    
    // Calcula limites de carga (simplificado)
    const limiteLeve = ST * 2;
    const limiteMedia = ST * 3;
    const limitePesada = ST * 6;
    const limiteExtrema = ST * 10;
    
    // Atualiza display
    document.getElementById('limit-light').textContent = limiteLeve.toFixed(1) + ' kg';
    document.getElementById('limit-medium').textContent = limiteMedia.toFixed(1) + ' kg';
    document.getElementById('limit-heavy').textContent = limitePesada.toFixed(1) + ' kg';
    document.getElementById('limit-extreme').textContent = limiteExtrema.toFixed(1) + ' kg';
}

// ===== 8. CONTADORES =====
function atualizarContadores() {
    // Atualiza hora
    const agora = new Date();
    document.getElementById('last-update-time').textContent = 
        agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
    
    // Contadores básicos (você pode expandir depois)
    document.getElementById('counter-advantages').textContent = '0';
    document.getElementById('counter-disadvantages').textContent = '0';
    document.getElementById('counter-skills').textContent = '0';
    document.getElementById('counter-spells').textContent = '0';
    document.getElementById('counter-languages').textContent = '1';
    document.getElementById('counter-relationships').textContent = '0';
}

// ===== 9. FUNÇÕES EXPORTADAS PARA O HTML =====
window.definirPontosIniciais = function(valor) {
    document.getElementById('start-points').value = valor;
    const event = new Event('change');
    document.getElementById('start-points').dispatchEvent(event);
};

window.definirLimiteDesvantagens = function(valor) {
    document.getElementById('dis-limit').value = valor;
    const event = new Event('change');
    document.getElementById('dis-limit').dispatchEvent(event);
};

window.ajustarModificador = function(tipo, valor) {
    const element = document.getElementById(tipo + '-value');
    let atual = parseInt(element.textContent) || 0;
    
    atual += valor;
    if (atual < -5) atual = -5;
    if (atual > 5) atual = 5;
    
    element.textContent = atual;
    
    // Salva
    const dados = {
        status: parseInt(document.getElementById('status-value').textContent) || 0,
        reputacao: parseInt(document.getElementById('rep-value').textContent) || 0,
        aparencia: parseInt(document.getElementById('app-value').textContent) || 0
    };
    localStorage.setItem('gurps_status_social', JSON.stringify(dados));
    
    calcularStatusSocial();
};

window.atualizarDashboard = function() {
    // Atualiza tudo
    carregarAtributos();
    calcularSaldoPontos();
    atualizarFinancasCarga();
    atualizarContadores();
    
    // Animação do botão
    const btn = document.querySelector('.refresh-btn');
    btn.classList.add('refreshing');
    setTimeout(() => btn.classList.remove('refreshing'), 500);
};

// ===== 10. INICIALIZAÇÃO =====
function inicializarDashboard() {
    console.log('🚀 Inicializando Dashboard...');
    
    // Configura tudo
    configurarUploadFoto();
    configurarIdentificacao();
    configurarSistemaPontos();
    configurarStatusSocial();
    
    // Carrega dados iniciais
    carregarAtributos();
    atualizarFinancasCarga();
    atualizarContadores();
    
    // Escuta mudanças no localStorage (de outras abas)
    window.addEventListener('storage', function(e) {
        if (e.key === 'gurps_atributos') {
            console.log('📥 Atualizando dashboard com novos atributos...');
            carregarAtributos();
            calcularSaldoPontos();
            atualizarFinancasCarga();
        }
    });
    
    console.log('✅ Dashboard pronto!');
}

// Inicializa quando a página carrega
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarDashboard);
} else {
    inicializarDashboard();
}