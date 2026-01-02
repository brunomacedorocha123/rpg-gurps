// ===========================================
// DASHBOARD.JS - Integração com Atributos
// ===========================================

function inicializarDashboard() {
    console.log('📊 Inicializando dashboard...');
    
    // Configura upload de foto
    configurarUploadFoto();
    
    // Carrega dados do localStorage
    carregarDadosDashboard();
    
    // Configura sistema de pontos
    configurarSistemaPontos();
    
    // Sincroniza com atributos
    sincronizarAtributos();
    
    // Configura status social
    configurarStatusSocial();
    
    // Atualiza contadores
    atualizarContadores();
    
    // Configura atualização automática
    configurarAtualizacaoAutomatica();
    
    console.log('✅ Dashboard inicializado');
}

function configurarUploadFoto() {
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (!uploadInput || !photoPreview) return;
    
    // Carrega foto salva
    const fotoSalva = localStorage.getItem('gurps_foto_personagem');
    if (fotoSalva) {
        photoPreview.innerHTML = `<img src="${fotoSalva}" alt="Foto do Personagem" style="width:100%;height:100%;object-fit:cover;border-radius:7px;">`;
    }
    
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.match('image.*')) {
            alert('Por favor, selecione apenas imagens!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            photoPreview.innerHTML = `<img src="${e.target.result}" alt="Foto do Personagem" style="width:100%;height:100%;object-fit:cover;border-radius:7px;">`;
            localStorage.setItem('gurps_foto_personagem', e.target.result);
        };
        reader.readAsDataURL(file);
    });
}

function carregarDadosDashboard() {
    // Carrega identificação
    const dados = JSON.parse(localStorage.getItem('gurps_dados_identificacao') || '{}');
    
    if (dados.nome) document.getElementById('char-name').value = dados.nome;
    if (dados.raca) document.getElementById('char-race').value = dados.raca;
    if (dados.ocupacao) document.getElementById('char-type').value = dados.ocupacao;
    if (dados.jogador) document.getElementById('char-player').value = dados.jogador;
    
    // Salva automaticamente ao digitar
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
                localStorage.setItem('gurps_dados_identificacao', JSON.stringify(dados));
            });
        }
    });
}

function configurarSistemaPontos() {
    const pontosIniciais = document.getElementById('start-points');
    const limiteDesvantagens = document.getElementById('dis-limit');
    
    // Carrega valores salvos
    const pontosSalvos = JSON.parse(localStorage.getItem('gurps_sistema_pontos') || '{}');
    
    if (pontosSalvos.pontosIniciais) {
        pontosIniciais.value = pontosSalvos.pontosIniciais;
    }
    
    if (pontosSalvos.limiteDesvantagens) {
        limiteDesvantagens.value = pontosSalvos.limiteDesvantagens;
    }
    
    // Salva ao alterar
    pontosIniciais.addEventListener('change', salvarConfigPontos);
    limiteDesvantagens.addEventListener('change', salvarConfigPontos);
    
    function salvarConfigPontos() {
        const dados = {
            pontosIniciais: parseInt(pontosIniciais.value) || 100,
            limiteDesvantagens: parseInt(limiteDesvantagens.value) || -75
        };
        localStorage.setItem('gurps_sistema_pontos', JSON.stringify(dados));
        calcularSaldoPontos();
    }
}

function sincronizarAtributos() {
    // Tenta obter dados diretamente da aba de atributos
    if (window.obterDadosAtributos) {
        const dados = window.obterDadosAtributos();
        atualizarAtributosNoDashboard(dados);
    } else {
        // Fallback: carrega do localStorage
        const dadosSalvos = localStorage.getItem('gurps_atributos_dashboard');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            atualizarAtributosNoDashboard(dados);
        }
    }
    
    // Calcula saldo de pontos
    calcularSaldoPontos();
}

function atualizarAtributosNoDashboard(dados) {
    if (!dados) return;
    
    // Atributos principais
    if (dados.atributos) {
        document.getElementById('summary-st').textContent = dados.atributos.ST || 10;
        document.getElementById('summary-dx').textContent = dados.atributos.DX || 10;
        document.getElementById('summary-iq').textContent = dados.atributos.IQ || 10;
        document.getElementById('summary-ht').textContent = dados.atributos.HT || 10;
        
        // Atributos secundários
        const pvTotal = (dados.atributos.ST || 10) + (dados.bonus?.PV || 0);
        const fpTotal = (dados.atributos.HT || 10) + (dados.bonus?.PF || 0);
        const vontadeTotal = (dados.atributos.IQ || 10) + (dados.bonus?.Vontade || 0);
        const percepcaoTotal = (dados.atributos.IQ || 10) + (dados.bonus?.Percepcao || 0);
        
        document.getElementById('summary-hp').textContent = pvTotal;
        document.getElementById('summary-fp').textContent = fpTotal;
        document.getElementById('summary-will').textContent = vontadeTotal;
        document.getElementById('summary-per').textContent = percepcaoTotal;
        
        // Status rápido
        document.getElementById('quick-hp').textContent = pvTotal;
        document.getElementById('quick-fp').textContent = fpTotal;
    }
    
    // Pontos gastos
    if (dados.pontosGastosAtributos !== undefined) {
        document.getElementById('points-attr').textContent = dados.pontosGastosAtributos;
    }
}

function calcularSaldoPontos() {
    const pontosIniciais = parseInt(document.getElementById('start-points').value) || 100;
    const pontosAtributos = parseInt(document.getElementById('points-attr').textContent) || 0;
    const pontosVantagens = parseInt(document.getElementById('points-adv').textContent) || 0;
    const pontosDesvantagens = parseInt(document.getElementById('points-dis').textContent) || 0;
    const pontosPeculiaridades = parseInt(document.getElementById('points-pec').textContent) || 0;
    const pontosPericias = parseInt(document.getElementById('points-skills').textContent) || 0;
    const pontosTecnicas = parseInt(document.getElementById('points-tech').textContent) || 0;
    const pontosMagias = parseInt(document.getElementById('points-spells').textContent) || 0;
    
    const totalGasto = pontosAtributos + pontosVantagens + pontosDesvantagens + 
                      pontosPeculiaridades + pontosPericias + pontosTecnicas + pontosMagias;
    
    const saldo = pontosIniciais - totalGasto;
    
    // Atualiza total gasto
    document.getElementById('total-points-spent').textContent = totalGasto + ' pts';
    
    // Atualiza saldo
    const saldoElement = document.getElementById('points-balance');
    saldoElement.textContent = saldo;
    
    // Atualiza status
    const statusIndicator = document.getElementById('points-status-indicator');
    const statusText = document.getElementById('points-status-text');
    
    if (saldo < 0) {
        saldoElement.classList.add('saldo-negativo');
        statusIndicator.style.background = '#f44336';
        statusText.textContent = 'Pontos negativos!';
        statusText.style.color = '#f44336';
    } else if (saldo === 0) {
        saldoElement.classList.remove('saldo-negativo');
        statusIndicator.style.background = '#4CAF50';
        statusText.textContent = 'Todos os pontos usados';
        statusText.style.color = '#4CAF50';
    } else {
        saldoElement.classList.remove('saldo-negativo');
        statusIndicator.style.background = '#FFC107';
        statusText.textContent = saldo + ' pontos disponíveis';
        statusText.style.color = '#FFC107';
    }
}

function configurarStatusSocial() {
    // Carrega valores salvos
    const sociaisSalvos = JSON.parse(localStorage.getItem('gurps_status_social') || '{"status":0,"reputacao":0,"aparencia":0}');
    
    document.getElementById('status-value').textContent = sociaisSalvos.status || 0;
    document.getElementById('rep-value').textContent = sociaisSalvos.reputacao || 0;
    document.getElementById('app-value').textContent = sociaisSalvos.aparencia || 0;
    
    // Calcula valores iniciais
    calcularPontosSociais();
}

function calcularPontosSociais() {
    const status = parseInt(document.getElementById('status-value').textContent) || 0;
    const reputacao = parseInt(document.getElementById('rep-value').textContent) || 0;
    const aparencia = parseInt(document.getElementById('app-value').textContent) || 0;
    
    // Pontos (Status: 5/pt, Rep/Apar: 5/nível)
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
    
    // Cor
    if (totalReacao > 0) {
        totalElement.style.color = '#4CAF50';
    } else if (totalReacao < 0) {
        totalElement.style.color = '#f44336';
    } else {
        totalElement.style.color = 'var(--text-gold)';
    }
    
    // Atualiza pontos (negativos vão para desvantagens, positivos para vantagens)
    if (totalPontos < 0) {
        document.getElementById('points-dis').textContent = Math.abs(totalPontos);
    }
    
    calcularSaldoPontos();
}

function atualizarContadores() {
    // Exemplo - pode ser conectado com outras abas
    document.getElementById('last-update-time').textContent = 
        new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
}

function configurarAtualizacaoAutomatica() {
    // Escuta eventos de atualização de atributos
    window.addEventListener('atributosAtualizados', function(event) {
        if (event.detail) {
            atualizarAtributosNoDashboard(event.detail);
            calcularSaldoPontos();
        }
    });
    
    // Atualiza quando o storage muda (outra aba)
    window.addEventListener('storage', function(e) {
        if (e.key === 'gurps_atributos_dashboard') {
            try {
                const dados = JSON.parse(e.newValue);
                atualizarAtributosNoDashboard(dados);
                calcularSaldoPontos();
            } catch (error) {
                console.warn('Erro ao processar atualização:', error);
            }
        }
    });
}

// Funções exportadas para o HTML
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
    const elementId = tipo === 'status' ? 'status-value' : 
                     tipo === 'reputacao' ? 'rep-value' : 'app-value';
    const element = document.getElementById(elementId);
    let current = parseInt(element.textContent) || 0;
    
    current += valor;
    if (current < -5) current = -5;
    if (current > 5) current = 5;
    
    element.textContent = current;
    
    // Salva
    const dados = {
        status: parseInt(document.getElementById('status-value').textContent) || 0,
        reputacao: parseInt(document.getElementById('rep-value').textContent) || 0,
        aparencia: parseInt(document.getElementById('app-value').textContent) || 0
    };
    localStorage.setItem('gurps_status_social', JSON.stringify(dados));
    
    calcularPontosSociais();
};

window.atualizarDashboard = function() {
    sincronizarAtributos();
    calcularSaldoPontos();
    atualizarContadores();
    
    // Anima botão
    const btn = document.querySelector('.refresh-btn');
    btn.classList.add('refreshing');
    setTimeout(() => btn.classList.remove('refreshing'), 500);
};

// Inicializa quando a DOM estiver pronta
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            inicializarDashboard();
        }
    });
} else {
    if (document.getElementById('dashboard')?.classList.contains('active')) {
        inicializarDashboard();
    }
}