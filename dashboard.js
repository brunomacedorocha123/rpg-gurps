// dashboard.js - VERSÃO COMPLETA QUE FUNCIONA
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar quando entrar na aba dashboard
    setTimeout(initDashboard, 1000);
});

function initDashboard() {
    console.log('=== DASHBOARD INICIANDO ===');
    
    // 1. CONFIGURAR TODOS OS EVENTOS
    configurarTodosEventos();
    
    // 2. CARREGAR DADOS DO PERSONAGEM
    carregarDadosPersonagem();
    
    // 3. CONFIGURAR SINCRONIZAÇÃO COM ATRIBUTOS
    configurarSincronizacaoAtributos();
    
    // 4. CONFIGURAR SISTEMA DE PONTOS
    configurarSistemaPontos();
    
    console.log('=== DASHBOARD PRONTA ===');
}

// ==================== EVENTOS ====================
function configurarTodosEventos() {
    // Inputs de identificação
    document.getElementById('char-name')?.addEventListener('input', function(e) {
        salvarCampo('nome', e.target.value);
    });
    
    document.getElementById('char-race')?.addEventListener('input', function(e) {
        salvarCampo('raca', e.target.value);
    });
    
    document.getElementById('char-type')?.addEventListener('input', function(e) {
        salvarCampo('ocupacao', e.target.value);
    });
    
    document.getElementById('char-player')?.addEventListener('input', function(e) {
        salvarCampo('jogador', e.target.value);
    });
    
    // Pontos iniciais
    document.getElementById('start-points')?.addEventListener('change', function(e) {
        const pontos = parseInt(e.target.value) || 100;
        salvarCampo('pontosIniciais', pontos);
        atualizarSaldoPontos();
    });
    
    // Limite desvantagens
    document.getElementById('dis-limit')?.addEventListener('change', function(e) {
        const limite = parseInt(e.target.value) || -75;
        salvarCampo('limiteDesvantagens', limite);
    });
    
    // Botão atualizar
    document.querySelector('.refresh-btn')?.addEventListener('click', function() {
        carregarDadosPersonagem();
        mostrarMensagem('Dashboard atualizada!');
    });
    
    // Upload de foto
    document.getElementById('char-upload')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.match('image.*')) {
            carregarImagem(file);
        }
    });
    
    // Botões de status social
    document.querySelectorAll('.mod-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tipo = this.closest('.mod-compact-row').querySelector('.mod-compact-label span').textContent.toLowerCase();
            const isMais = this.classList.contains('plus');
            ajustarStatusSocial(tipo, isMais ? 1 : -1);
        });
    });
}

// ==================== CARREGAR DADOS ====================
async function carregarDadosPersonagem() {
    try {
        // Se tem firebaseService, carregar do Firebase
        if (window.firebaseService && window.firebaseService.characterId) {
            const dados = await window.firebaseService.loadCharacter();
            if (dados) {
                aplicarDadosPersonagem(dados);
                return;
            }
        }
        
        // Se não, carregar do localStorage
        const localData = localStorage.getItem('gurps_personagem');
        if (localData) {
            const dados = JSON.parse(localData);
            aplicarDadosPersonagem(dados);
        }
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

function aplicarDadosPersonagem(dados) {
    // Identificação
    setValue('char-name', dados.nome || 'Novo Personagem');
    setValue('char-race', dados.raca || 'Humano');
    setValue('char-type', dados.ocupacao || 'Aventureiro');
    setValue('char-player', dados.jogador || '');
    setValue('start-points', dados.pontosIniciais || 100);
    setValue('dis-limit', dados.limiteDesvantagens || -75);
    
    // Atributos
    if (dados.atributos) {
        atualizarAtributos(dados.atributos);
    }
    
    // Pontos
    if (dados.pontos) {
        atualizarPontos(dados.pontos);
    }
    
    // Cargas
    if (dados.cargas) {
        atualizarCargas(dados.cargas);
    }
    
    // Contadores
    atualizarContadores(dados);
    
    // Foto
    if (dados.foto?.base64) {
        document.getElementById('photo-preview').innerHTML = `
            <img src="${dados.foto.base64}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
        `;
    }
    
    // Última atualização
    const agora = new Date();
    document.getElementById('last-update-time').textContent = 
        agora.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
}

// ==================== ATRIBUTOS ====================
function configurarSincronizacaoAtributos() {
    // Escutar eventos dos atributos
    document.addEventListener('atributos-atualizados', function(e) {
        if (e.detail) {
            atualizarAtributos(e.detail);
        }
    });
    
    // Se a função getAtributosPersonagem existe, usar ela
    if (typeof window.getAtributosPersonagem === 'function') {
        setTimeout(() => {
            const atributos = window.getAtributosPersonagem();
            if (atributos) {
                atualizarAtributos(atributos);
            }
        }, 2000);
    }
    
    // Verificar periodicamente
    setInterval(() => {
        if (typeof window.getAtributosPersonagem === 'function') {
            const atributos = window.getAtributosPersonagem();
            if (atributos) {
                atualizarAtributos(atributos);
            }
        }
    }, 5000);
}

function atualizarAtributos(atributos) {
    if (!atributos) return;
    
    // Atributos principais
    document.getElementById('summary-st').textContent = atributos.ST || 10;
    document.getElementById('summary-dx').textContent = atributos.DX || 10;
    document.getElementById('summary-iq').textContent = atributos.IQ || 10;
    document.getElementById('summary-ht').textContent = atributos.HT || 10;
    
    // Atributos secundários
    const bonus = atributos.bonus || {};
    const pv = Math.max((atributos.ST || 10) + (bonus.PV || 0), 1);
    const pf = Math.max((atributos.HT || 10) + (bonus.PF || 0), 1);
    const vontade = Math.max((atributos.IQ || 10) + (bonus.Vontade || 0), 1);
    const percepcao = Math.max((atributos.IQ || 10) + (bonus.Percepcao || 0), 1);
    
    document.getElementById('summary-hp').textContent = pv;
    document.getElementById('summary-fp').textContent = pf;
    document.getElementById('summary-will').textContent = vontade;
    document.getElementById('summary-per').textContent = percepcao;
    
    // Atualizar quick stats
    document.getElementById('quick-hp').textContent = pv;
    document.getElementById('quick-fp').textContent = pf;
}

// ==================== PONTOS ====================
function configurarSistemaPontos() {
    // Se existe pontosManager, usar ele
    if (window.pontosManager) {
        window.pontosManager.adicionarListener(function(dados) {
            atualizarDisplayPontos(dados);
        });
        
        // Carregar pontos
        setTimeout(() => {
            if (window.pontosManager.carregarPontos) {
                window.pontosManager.carregarPontos();
            }
        }, 1500);
    }
}

function atualizarPontos(dados) {
    if (!dados) return;
    
    // Total gasto
    document.getElementById('total-points-spent').textContent = (dados.total || 0) + " pts";
    
    // Distribuição
    if (dados.distribuicao) {
        document.getElementById('points-attr').textContent = dados.distribuicao.atributos || 0;
        document.getElementById('points-adv').textContent = Math.max(dados.distribuicao.vantagens || 0, 0);
        document.getElementById('points-dis').textContent = Math.abs(Math.min(dados.distribuicao.desvantagens || 0, 0));
        document.getElementById('points-skills').textContent = dados.distribuicao.pericias || 0;
        document.getElementById('points-tech').textContent = dados.distribuicao.técnicas || 0;
        document.getElementById('points-spells').textContent = dados.distribuicao.magias || 0;
    }
    
    atualizarSaldoPontos();
}

function atualizarDisplayPontos(dados) {
    if (!dados) return;
    
    // Total gasto
    const totalElement = document.getElementById('total-points-spent');
    if (totalElement) {
        totalElement.textContent = dados.total + " pts";
        totalElement.className = 'card-badge ' + (dados.status === 'excedido' ? 'negativo' : '');
    }
    
    // Distribuição
    if (dados.distribuicao) {
        document.getElementById('points-attr').textContent = dados.distribuicao.atributos || 0;
        document.getElementById('points-adv').textContent = Math.max(dados.distribuicao.vantagens || 0, 0);
        document.getElementById('points-dis').textContent = Math.abs(Math.min(dados.distribuicao.desvantagens || 0, 0));
        document.getElementById('points-pec').textContent = Math.abs(Math.min(dados.distribuicao.peculiaridades || 0, 0));
        document.getElementById('points-skills').textContent = dados.distribuicao.pericias || 0;
        document.getElementById('points-tech').textContent = dados.distribuicao.técnicas || 0;
        document.getElementById('points-spells').textContent = dados.distribuicao.magias || 0;
    }
    
    // Saldo
    atualizarSaldoPontos();
}

function atualizarSaldoPontos() {
    const pontosIniciais = parseInt(document.getElementById('start-points')?.value) || 100;
    let totalGasto = 0;
    
    // Tentar pegar do pontosManager
    if (window.pontosManager && window.pontosManager.totalPontos) {
        totalGasto = window.pontosManager.totalPontos;
    }
    
    const saldo = pontosIniciais - totalGasto;
    const saldoElement = document.getElementById('points-balance');
    
    if (saldoElement) {
        saldoElement.textContent = saldo;
        
        // Estilo
        const container = saldoElement.closest('.balance-value-container');
        if (container) {
            container.className = 'balance-value-container';
            if (saldo < 0) {
                container.classList.add('negativo');
                document.getElementById('points-status-text').textContent = 'Excedeu o limite!';
            } else if (saldo === 0) {
                container.classList.add('exato');
                document.getElementById('points-status-text').textContent = 'Perfeito!';
            } else if (saldo <= 10) {
                container.classList.add('baixo');
                document.getElementById('points-status-text').textContent = 'Poucos pontos restantes';
            } else {
                container.classList.add('positivo');
                document.getElementById('points-status-text').textContent = 'Personagem válido';
            }
        }
    }
}

// ==================== CARGAS ====================
function atualizarCargas(cargas) {
    if (!cargas) return;
    
    const formatar = (valor) => {
        return Number.isInteger(valor) ? valor.toString() : valor.toFixed(1);
    };
    
    document.getElementById('limit-light').textContent = formatar(cargas.leve || 0) + ' kg';
    document.getElementById('limit-medium').textContent = formatar(cargas.media || 0) + ' kg';
    document.getElementById('limit-heavy').textContent = formatar(cargas.pesada || 0) + ' kg';
    document.getElementById('limit-extreme').textContent = formatar(cargas.muitoPesada || 0) + ' kg';
}

// ==================== CONTADORES ====================
function atualizarContadores(dados) {
    document.getElementById('counter-advantages').textContent = dados.vantagens?.length || 0;
    document.getElementById('counter-disadvantages').textContent = dados.desvantagens?.length || 0;
    document.getElementById('counter-skills').textContent = dados.pericias?.length || 0;
    document.getElementById('counter-spells').textContent = dados.magias?.length || 0;
    document.getElementById('counter-languages').textContent = dados.idiomas?.length || 0;
    document.getElementById('counter-relationships').textContent = dados.relacionamentos?.length || 0;
}

// ==================== FUNÇÕES AUXILIARES ====================
function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value;
    }
}

async function salvarCampo(campo, valor) {
    // Salvar no localStorage
    const dadosAtuais = JSON.parse(localStorage.getItem('gurps_personagem') || '{}');
    dadosAtuais[campo] = valor;
    localStorage.setItem('gurps_personagem', JSON.stringify(dadosAtuais));
    
    // Salvar no Firebase se disponível
    if (window.firebaseService && window.firebaseService.saveModule) {
        try {
            await window.firebaseService.saveModule(campo, valor);
        } catch (error) {
            console.error('Erro ao salvar no Firebase:', error);
        }
    }
    
    mostrarMensagem('Campo salvo: ' + campo);
}

function carregarImagem(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById('photo-preview');
        preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">`;
        
        // Salvar
        salvarCampo('foto', {
            base64: e.target.result,
            tipo: file.type,
            nome: file.name,
            data: new Date().toISOString()
        });
    };
    reader.readAsDataURL(file);
}

function ajustarStatusSocial(tipo, valor) {
    const elementos = {
        'status': { value: 'status-value', points: 'status-points-compact' },
        'reputação': { value: 'rep-value', points: 'reputacao-points-compact' },
        'aparência': { value: 'app-value', points: 'aparencia-points-compact' }
    };
    
    const config = elementos[tipo];
    if (!config) return;
    
    const valueEl = document.getElementById(config.value);
    const pointsEl = document.getElementById(config.points);
    
    if (valueEl && pointsEl) {
        let atual = parseInt(valueEl.textContent) || 0;
        atual += valor;
        
        // Limites
        if (atual < -5) atual = -5;
        if (atual > 5) atual = 5;
        
        valueEl.textContent = atual >= 0 ? `+${atual}` : atual;
        pointsEl.textContent = `[${atual * 5}]`; // 5 pontos por nível
        
        // Cor
        valueEl.className = atual > 0 ? 'positivo' : atual < 0 ? 'negativo' : '';
        
        // Salvar
        salvarCampo('statusSocial.' + tipo, atual);
    }
}

function mostrarMensagem(texto) {
    const status = document.getElementById('statusAtributos');
    if (status) {
        status.innerHTML = `<i class="fas fa-check-circle"></i> <span>${texto}</span>`;
        status.classList.add('success');
        
        setTimeout(() => {
            status.innerHTML = '<i class="fas fa-info-circle"></i> <span>Sistema de atributos pronto.</span>';
            status.classList.remove('success');
        }, 3000);
    }
}

// ==================== EXPORTAR FUNÇÕES ====================
window.initDashboardTab = initDashboard;
window.atualizarDashboardAtributos = atualizarAtributos;
window.atualizarDashboardPontos = atualizarPontos;