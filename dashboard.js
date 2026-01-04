// ===========================================
// DASHBOARD.JS - VERSÃO FINAL
// ===========================================

// Estado do dashboard
let dashboardInicializado = false;

// ===========================================
// 1. INICIALIZAÇÃO
// ===========================================
function initDashboardTab() {
    if (dashboardInicializado) return;
    
    // Configurar eventos
    configurarEventosDashboard();
    
    // Carregar dados do personagem
    carregarDadosPersonagem();
    
    // Escutar mudanças em tempo real
    configurarEscutaFirebase();
    
    // Configurar sistema de pontos
    configurarSistemaPontos();
    
    dashboardInicializado = true;
    
    // Atualizar interface inicial
    atualizarInterfaceDashboard();
}

function configurarEventosDashboard() {
    // Campos de identificação
    document.getElementById('char-name')?.addEventListener('change', function() {
        salvarCampoDashboard('nome', this.value);
    });
    
    document.getElementById('char-race')?.addEventListener('change', function() {
        salvarCampoDashboard('raca', this.value);
    });
    
    document.getElementById('char-type')?.addEventListener('change', function() {
        salvarCampoDashboard('ocupacao', this.value);
    });
    
    document.getElementById('char-player')?.addEventListener('change', function() {
        salvarCampoDashboard('jogador', this.value);
    });
    
    // Pontos iniciais
    document.getElementById('start-points')?.addEventListener('change', function() {
        const pontos = parseInt(this.value) || 100;
        salvarCampoDashboard('pontosIniciais', pontos);
        atualizarSaldoPontos();
    });
    
    // Limite desvantagens
    document.getElementById('dis-limit')?.addEventListener('change', function() {
        const limite = parseInt(this.value) || -75;
        salvarCampoDashboard('limiteDesvantagens', limite);
    });
    
    // Botão atualizar
    document.querySelector('.refresh-btn')?.addEventListener('click', function() {
        carregarDadosPersonagem();
    });
    
    // Upload de foto
    document.getElementById('char-upload')?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            carregarFoto(file);
        }
    });
}

// ===========================================
// 2. CARREGAMENTO DE DADOS
// ===========================================
async function carregarDadosPersonagem() {
    if (!window.firebaseService || !window.firebaseService.characterId) return;
    
    try {
        // Carregar dados do personagem
        const dados = await firebaseService.loadCharacter();
        
        if (dados) {
            // Atualizar dados da dashboard
            atualizarDadosDashboard(dados);
            
            // Atualizar atributos se existirem
            if (dados.atributos) {
                atualizarAtributosDashboard(dados.atributos);
            }
            
            // Atualizar pontos se existirem
            if (dados.pontos || window.pontosManager) {
                atualizarPontosDashboard(dados.pontos);
            }
            
            // Atualizar cargas se existirem
            if (dados.cargas || (window.getCargasPersonagem && typeof window.getCargasPersonagem === 'function')) {
                atualizarCargasDashboard(dados.cargas || window.getCargasPersonagem());
            }
            
            // Atualizar contadores
            atualizarContadoresDashboard(dados);
        }
        
    } catch (error) {
        // Falha silenciosa
    }
}

function atualizarDadosDashboard(dados) {
    // Nome do personagem
    const nomeInput = document.getElementById('char-name');
    if (nomeInput && dados.nome) {
        nomeInput.value = dados.nome;
    }
    
    // Raça
    const racaInput = document.getElementById('char-race');
    if (racaInput && dados.raca) {
        racaInput.value = dados.raca;
    }
    
    // Ocupação
    const ocupacaoInput = document.getElementById('char-type');
    if (ocupacaoInput && dados.ocupacao) {
        ocupacaoInput.value = dados.ocupacao;
    }
    
    // Jogador
    const jogadorInput = document.getElementById('char-player');
    if (jogadorInput && dados.jogador) {
        jogadorInput.value = dados.jogador;
    }
    
    // Pontos iniciais
    const pontosInput = document.getElementById('start-points');
    if (pontosInput && dados.pontosIniciais !== undefined) {
        pontosInput.value = dados.pontosIniciais;
    }
    
    // Limite desvantagens
    const limiteInput = document.getElementById('dis-limit');
    if (limiteInput && dados.limiteDesvantagens !== undefined) {
        limiteInput.value = dados.limiteDesvantagens;
    }
    
    // Status
    if (dados.status) {
        atualizarStatusPersonagem(dados.status);
    }
}

// ===========================================
// 3. ATUALIZAÇÃO DE ATRIBUTOS
// ===========================================
function atualizarAtributosDashboard(atributos) {
    if (!atributos) return;
    
    // Atributos principais
    const elementos = {
        'summary-st': atributos.ST || 10,
        'summary-dx': atributos.DX || 10,
        'summary-iq': atributos.IQ || 10,
        'summary-ht': atributos.HT || 10
    };
    
    Object.entries(elementos).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    });
    
    // Calcular atributos derivados
    const bonus = atributos.bonus || {};
    
    const pvTotal = Math.max((atributos.ST || 10) + (bonus.PV || 0), 1);
    const pfTotal = Math.max((atributos.HT || 10) + (bonus.PF || 0), 1);
    const vontadeTotal = Math.max((atributos.IQ || 10) + (bonus.Vontade || 0), 1);
    const percepcaoTotal = Math.max((atributos.IQ || 10) + (bonus.Percepcao || 0), 1);
    
    // Atualizar derivados
    document.getElementById('summary-hp')?.textContent = pvTotal;
    document.getElementById('summary-fp')?.textContent = pfTotal;
    document.getElementById('summary-will')?.textContent = vontadeTotal;
    document.getElementById('summary-per')?.textContent = percepcaoTotal;
    
    // Atualizar PV e FP rápidos
    document.getElementById('quick-hp')?.textContent = pvTotal;
    document.getElementById('quick-fp')?.textContent = pfTotal;
}

// ===========================================
// 4. SISTEMA DE PONTOS
// ===========================================
function configurarSistemaPontos() {
    if (!window.pontosManager) return;
    
    // Escutar atualizações do pontos manager
    window.pontosManager.adicionarListener(atualizarDisplayPontos);
    
    // Carregar pontos existentes
    setTimeout(() => {
        if (window.firebaseService?.characterId) {
            window.pontosManager.carregarPontos();
        }
    }, 1000);
}

function atualizarPontosDashboard(dadosPontos) {
    if (!dadosPontos) return;
    
    // Total gasto
    const totalElement = document.getElementById('total-points-spent');
    if (totalElement) {
        totalElement.textContent = (dadosPontos.total || 0) + " pts";
    }
    
    // Saldo disponível
    atualizarSaldoPontos();
    
    // Distribuição
    if (dadosPontos.distribuicao) {
        atualizarDistribuicaoPontos(dadosPontos.distribuicao);
    }
}

function atualizarDisplayPontos(dados) {
    if (!dados) return;
    
    // Total gasto
    const totalElement = document.getElementById('total-points-spent');
    if (totalElement) {
        totalElement.textContent = dados.total + " pts";
        
        // Estilo
        totalElement.className = 'card-badge';
        if (dados.status === 'excedido') {
            totalElement.classList.add('negativo');
        }
    }
    
    // Saldo
    const saldoElement = document.getElementById('points-balance');
    if (saldoElement) {
        const pontosIniciais = parseInt(document.getElementById('start-points')?.value) || 100;
        const saldo = pontosIniciais - dados.total;
        saldoElement.textContent = saldo;
        
        // Estilo do saldo
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
    
    // Distribuição
    if (dados.distribuicao) {
        atualizarDistribuicaoPontos(dados.distribuicao);
    }
}

function atualizarSaldoPontos() {
    if (!window.pontosManager) return;
    
    const pontosIniciais = parseInt(document.getElementById('start-points')?.value) || 100;
    const totalGasto = window.pontosManager.totalPontos || 0;
    const saldo = pontosIniciais - totalGasto;
    
    document.getElementById('points-balance')?.textContent = saldo;
}

function atualizarDistribuicaoPontos(distribuicao) {
    // Atributos
    const attrEl = document.getElementById('points-attr');
    if (attrEl && distribuicao.atributos !== undefined) {
        attrEl.textContent = distribuicao.atributos;
    }
    
    // Vantagens
    const advEl = document.getElementById('points-adv');
    if (advEl && distribuicao.vantagens !== undefined) {
        advEl.textContent = Math.max(distribuicao.vantagens, 0);
    }
    
    // Desvantagens
    const disEl = document.getElementById('points-dis');
    if (disEl && distribuicao.desvantagens !== undefined) {
        disEl.textContent = Math.abs(Math.min(distribuicao.desvantagens, 0));
    }
    
    // Peculiaridades
    const pecEl = document.getElementById('points-pec');
    if (pecEl && distribuicao.peculiaridades !== undefined) {
        pecEl.textContent = Math.abs(Math.min(distribuicao.peculiaridades, 0));
    }
    
    // Perícias
    const skillsEl = document.getElementById('points-skills');
    if (skillsEl && distribuicao.pericias !== undefined) {
        skillsEl.textContent = distribuicao.pericias;
    }
    
    // Técnicas
    const techEl = document.getElementById('points-tech');
    if (techEl && distribuicao.técnicas !== undefined) {
        techEl.textContent = distribuicao.técnicas;
    }
    
    // Magias
    const spellsEl = document.getElementById('points-spells');
    if (spellsEl && distribuicao.magias !== undefined) {
        spellsEl.textContent = distribuicao.magias;
    }
}

// ===========================================
// 5. CARGA E FINANÇAS
// ===========================================
function atualizarCargasDashboard(cargas) {
    if (!cargas) return;
    
    const elementos = {
        'limit-light': 'leve',
        'limit-medium': 'media', 
        'limit-heavy': 'pesada',
        'limit-extreme': 'muitoPesada'
    };
    
    Object.entries(elementos).forEach(([id, chave]) => {
        const elemento = document.getElementById(id);
        if (elemento && cargas[chave] !== undefined) {
            // Formatar para mostrar decimais corretamente
            let valor = cargas[chave];
            elemento.textContent = Number.isInteger(valor) ? valor.toString() : valor.toFixed(1) + ' kg';
        }
    });
}

// ===========================================
// 6. CONTADORES
// ===========================================
function atualizarContadoresDashboard(dados) {
    const contadores = {
        'counter-advantages': dados.vantagens?.length || 0,
        'counter-disadvantages': dados.desvantagens?.length || 0,
        'counter-skills': dados.pericias?.length || 0,
        'counter-spells': dados.magias?.length || 0,
        'counter-languages': dados.idiomas?.length || 0,
        'counter-relationships': dados.relacionamentos?.length || 0
    };
    
    Object.entries(contadores).forEach(([id, quantidade]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = quantidade;
        }
    });
}

// ===========================================
// 7. SALVAMENTO NO FIREBASE
// ===========================================
async function salvarCampoDashboard(campo, valor) {
    if (!window.firebaseService || !window.firebaseService.characterId) return;
    
    try {
        await window.firebaseService.saveModule(campo, valor);
    } catch (error) {
        // Falha silenciosa
    }
}

async function carregarFoto(file) {
    if (!file.type.match('image.*')) return;
    
    const reader = new FileReader();
    reader.onload = async function(event) {
        const photoPreview = document.getElementById('photo-preview');
        if (photoPreview) {
            photoPreview.innerHTML = `
                <img src="${event.target.result}" 
                     style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
            `;
        }
        
        // Salvar no Firebase
        if (window.firebaseService) {
            try {
                await window.firebaseService.saveModule('foto', {
                    base64: event.target.result,
                    tipo: file.type,
                    nome: file.name
                });
            } catch (error) {
                // Falha silenciosa
            }
        }
    };
    
    reader.readAsDataURL(file);
}

// ===========================================
// 8. ESCUTA EM TEMPO REAL
// ===========================================
function configurarEscutaFirebase() {
    if (!window.firebaseService) return;
    
    // Escutar eventos do Firebase
    document.addEventListener('firebase-loaded', function(e) {
        if (e.detail) {
            atualizarDadosDashboard(e.detail);
            
            if (e.detail.atributos) {
                atualizarAtributosDashboard(e.detail.atributos);
            }
            
            if (e.detail.pontos) {
                atualizarPontosDashboard(e.detail.pontos);
            }
        }
    });
    
    document.addEventListener('firebase-saved', function(e) {
        if (e.detail?.module === 'atributos') {
            atualizarAtributosDashboard(e.detail.data);
        }
        
        if (e.detail?.module === 'pontos') {
            atualizarPontosDashboard(e.detail.data);
        }
    });
    
    // Escutar mudanças dos atributos.js
    if (typeof window.getAtributosPersonagem === 'function') {
        // Atualizar periodicamente
        setInterval(() => {
            const atributos = window.getAtributosPersonagem();
            if (atributos) {
                atualizarAtributosDashboard(atributos);
            }
        }, 2000);
    }
}

// ===========================================
// 9. FUNÇÕES AUXILIARES
// ===========================================
function atualizarInterfaceDashboard() {
    // Atualizar hora da última atualização
    const agora = new Date();
    const horaEl = document.getElementById('last-update-time');
    if (horaEl) {
        horaEl.textContent = agora.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

function atualizarStatusPersonagem(status) {
    // Aqui você pode adicionar lógica para atualizar o status visual
    const statusElement = document.querySelector('.dashboard-header p');
    if (statusElement) {
        if (status === 'rascunho') {
            statusElement.textContent = 'Personagem em construção';
        } else if (status === 'ativo') {
            statusElement.textContent = 'Personagem pronto para aventura';
        } else if (status === 'arquivado') {
            statusElement.textContent = 'Personagem arquivado';
        }
    }
}

// ===========================================
// 10. INICIALIZAÇÃO AUTOMÁTICA
// ===========================================
// Verificar se a dashboard está ativa e inicializar
document.addEventListener('DOMContentLoaded', function() {
    const dashboardTab = document.getElementById('dashboard');
    
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        // Aguardar um pouco para garantir que tudo carregou
        setTimeout(initDashboardTab, 500);
    }
    
    // Observar mudanças de aba
    if (dashboardTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    if (dashboardTab.classList.contains('active')) {
                        setTimeout(initDashboardTab, 100);
                    }
                }
            });
        });
        
        observer.observe(dashboardTab, { attributes: true });
    }
});

// Exportar função principal
window.initDashboardTab = initDashboardTab;

// Função para ser chamada por outras abas
window.atualizarDashboardAtributos = function(atributos) {
    atualizarAtributosDashboard(atributos);
};

window.atualizarDashboardPontos = function(pontos) {
    atualizarPontosDashboard(pontos);
};

// Inicializar se já estiver na dashboard
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            setTimeout(initDashboardTab, 1000);
        }
    });
} else {
    if (document.getElementById('dashboard')?.classList.contains('active')) {
        setTimeout(initDashboardTab, 1000);
    }
}