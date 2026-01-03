// ===========================================
// DASHBOARD.JS - Dashboard com Firebase
// ===========================================

// Verificar se Firebase está disponível
let firebaseReady = false;

// Aguardar Firebase carregar
function waitForFirebase() {
    return new Promise((resolve) => {
        const check = () => {
            if (typeof firebaseService !== 'undefined' && 
                typeof pontosManager !== 'undefined') {
                firebaseReady = true;
                resolve(true);
            } else {
                setTimeout(check, 500);
            }
        };
        check();
    });
}

// ===========================================
// 1. UPLOAD DE FOTO
// ===========================================
function configurarUploadFoto() {
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (!uploadInput || !photoPreview) return;
    
    // Evento de upload
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file || !file.type.match('image.*')) return;
        
        const reader = new FileReader();
        reader.onload = async function(event) {
            // Atualizar preview
            photoPreview.innerHTML = `
                <img src="${event.target.result}" 
                     style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
            `;
            
            // Salvar no Firebase se disponível
            if (firebaseReady && firebaseService.characterId) {
                try {
                    await firebaseService.saveModule('foto', {
                        base64: event.target.result,
                        tipo: file.type,
                        nome: file.name
                    });
                } catch (error) {
                    console.error('Erro ao salvar foto:', error);
                }
            }
        };
        
        reader.readAsDataURL(file);
    });
}

// ===========================================
// 2. ATUALIZAR PONTOS NA DASHBOARD
// ===========================================
function configurarSistemaPontos() {
    // Listener para atualizações de pontos
    if (typeof pontosManager !== 'undefined') {
        pontosManager.adicionarListener(atualizarDisplayPontos);
        
        // Carregar pontos iniciais
        setTimeout(() => {
            if (firebaseService?.characterId) {
                pontosManager.carregarPontos();
            }
        }, 1000);
    }
}

function atualizarDisplayPontos(dados) {
    if (!dados) return;
    
    // Total gasto
    const totalElement = document.getElementById('total-points-spent');
    if (totalElement) {
        totalElement.textContent = dados.total + " pts";
    }
    
    // Saldo
    const saldoElement = document.getElementById('points-balance');
    if (saldoElement) {
        const saldo = dados.disponivel;
        saldoElement.textContent = saldo;
        
        // Aplicar estilos
        const container = saldoElement.closest('.balance-value-container');
        if (container) {
            container.className = 'balance-value-container';
            if (saldo < 0) container.classList.add('negativo');
            else if (saldo === 0) container.classList.add('exato');
            else if (saldo <= 10) container.classList.add('baixo');
            else container.classList.add('positivo');
        }
    }
    
    // Distribuição
    if (dados.distribuicao) {
        atualizarDistribuicao(dados.distribuicao);
    }
}

// ===========================================
// 3. ATUALIZAR DISTRIBUIÇÃO DE PONTOS
// ===========================================
function atualizarDistribuicao(distribuicao) {
    // Vantagens
    const vantagensEl = document.getElementById('points-adv');
    if (vantagensEl && distribuicao.vantagens) {
        vantagensEl.textContent = Math.max(distribuicao.vantagens, 0);
        vantagensEl.className = 'breakdown-value ' + 
            (distribuicao.vantagens > 0 ? 'positivo' : '');
    }
    
    // Desvantagens
    const desvEl = document.getElementById('points-dis');
    if (desvEl && distribuicao.desvantagens) {
        desvEl.textContent = Math.abs(Math.min(distribuicao.desvantagens, 0));
        desvEl.className = 'breakdown-value ' + 
            (distribuicao.desvantagens < 0 ? 'negativo' : '');
    }
    
    // Aparência
    const appEl = document.getElementById('app-value');
    if (appEl && distribuicao.aparencia) {
        const pontos = distribuicao.aparencia;
        appEl.textContent = pontos >= 0 ? `+${pontos}` : pontos;
        appEl.className = pontos > 0 ? 'positivo' : pontos < 0 ? 'negativo' : '';
    }
}

// ===========================================
// 4. ATUALIZAR ATRIBUTOS
// ===========================================
async function atualizarAtributosDashboard() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    try {
        const dados = await firebaseService.loadCharacter();
        if (!dados?.atributos) return;
        
        const att = dados.atributos;
        
        // Atributos principais
        const principais = {
            'summary-st': att.ST || 10,
            'summary-dx': att.DX || 10,
            'summary-iq': att.IQ || 10,
            'summary-ht': att.HT || 10
        };
        
        Object.entries(principais).forEach(([id, valor]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = valor;
        });
        
        // Atributos derivados
        if (att.bonus) {
            const bonus = att.bonus;
            const derivados = {
                'summary-hp': (att.ST || 10) + (bonus.PV || 0),
                'summary-fp': (att.HT || 10) + (bonus.PF || 0),
                'summary-will': (att.IQ || 10) + (bonus.Vontade || 0),
                'summary-per': (att.IQ || 10) + (bonus.Percepcao || 0)
            };
            
            Object.entries(derivados).forEach(([id, valor]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = valor;
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar atributos:', error);
    }
}

// ===========================================
// 5. ATUALIZAR CONTADORES
// ===========================================
async function atualizarContadores() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    try {
        const dados = await firebaseService.loadCharacter();
        if (!dados) return;
        
        // Contadores das categorias
        const contadores = {
            'counter-advantages': dados.vantagens?.length || 0,
            'counter-disadvantages': dados.desvantagens?.length || 0,
            'counter-skills': dados.pericias?.length || 0,
            'counter-spells': dados.magias?.length || 0,
            'counter-languages': dados.idiomas?.length || 0,
            'counter-relationships': dados.relacionamentos?.length || 0
        };
        
        // Atualizar UI
        Object.entries(contadores).forEach(([id, quantidade]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = quantidade;
        });
        
    } catch (error) {
        console.error('Erro ao carregar contadores:', error);
    }
}

// ===========================================
// 6. ATUALIZAR INFORMAÇÕES BÁSICAS
// ===========================================
async function atualizarInformacoesBasicas() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    try {
        const dados = await firebaseService.loadCharacter();
        if (!dados) return;
        
        // Nome do personagem
        const nomeEl = document.getElementById('char-name');
        if (nomeEl && dados.nome) {
            nomeEl.value = dados.nome;
        }
        
        // Riqueza
        const dinheiroEl = document.getElementById('current-money');
        if (dinheiroEl && dados.riqueza?.rendaMensal) {
            const renda = dados.riqueza.rendaMensal;
            dinheiroEl.textContent = `$${renda.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }
        
        // Última atualização
        const horaEl = document.getElementById('last-update-time');
        if (horaEl) {
            horaEl.textContent = new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
    } catch (error) {
        console.error('Erro ao carregar informações:', error);
    }
}

// ===========================================
// 7. CARREGAR FOTO DO PERSONAGEM
// ===========================================
async function carregarFotoPersonagem() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    try {
        const dados = await firebaseService.loadCharacter();
        if (!dados?.foto?.base64) return;
        
        const photoPreview = document.getElementById('photo-preview');
        if (photoPreview) {
            photoPreview.innerHTML = `
                <img src="${dados.foto.base64}" 
                     style="width:100%;height:100%;object-fit:cover;border-radius:8px;">
            `;
        }
    } catch (error) {
        // Silencioso - foto é opcional
    }
}

// ===========================================
// 8. ATUALIZAÇÃO COMPLETA DA DASHBOARD
// ===========================================
async function atualizarDashboardCompleta() {
    if (!firebaseReady) {
        await waitForFirebase();
    }
    
    // Atualizar todas as seções
    await atualizarAtributosDashboard();
    await atualizarContadores();
    await atualizarInformacoesBasicas();
    await carregarFotoPersonagem();
    
    // Pontos são atualizados automaticamente via listener
}

// ===========================================
// 9. CONFIGURAR ESCUTA EM TEMPO REAL
// ===========================================
function configurarEscutaTempoReal() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    // Escutar mudanças no personagem
    firebaseService.subscribeToCharacter((dados) => {
        if (dados) {
            // Atualizar informações básicas
            const nomeEl = document.getElementById('char-name');
            if (nomeEl && dados.nome) {
                nomeEl.value = dados.nome;
            }
            
            // Atualizar contadores
            atualizarContadores();
            
            // Atualizar atributos
            if (dados.atributos) {
                atualizarAtributosDashboard();
            }
            
            // Atualizar foto
            if (dados.foto?.base64) {
                carregarFotoPersonagem();
            }
        }
    });
}

// ===========================================
// 10. INICIALIZAÇÃO DA DASHBOARD
// ===========================================
async function initDashboardTab() {
    console.log('Iniciando dashboard com Firebase...');
    
    // Configurar componentes
    configurarUploadFoto();
    configurarSistemaPontos();
    
    // Botão de atualização manual
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            atualizarDashboardCompleta();
            if (pontosManager) {
                pontosManager.carregarPontos();
            }
        });
    }
    
    // Configurar limite de desvantagens
    const disLimit = document.getElementById('dis-limit');
    if (disLimit) {
        disLimit.addEventListener('change', function() {
            const limite = parseInt(this.value) || -75;
            // Salvar configuração
            if (firebaseReady) {
                firebaseService.saveModule('config', { limiteDesvantagens: limite });
            }
        });
    }
    
    // Configurar pontos iniciais
    const startPoints = document.getElementById('start-points');
    if (startPoints) {
        startPoints.addEventListener('change', function() {
            const pontos = parseInt(this.value) || 100;
            // Salvar configuração
            if (firebaseReady) {
                firebaseService.saveModule('config', { pontosIniciais: pontos });
            }
        });
    }
    
    // Aguardar Firebase estar pronto
    await waitForFirebase();
    
    // Configurar escuta em tempo real
    configurarEscutaTempoReal();
    
    // Atualizar dados iniciais
    atualizarDashboardCompleta();
    
    // Configurar atualização periódica
    if (intervaloAtualizacao) clearInterval(intervaloAtualizacao);
    intervaloAtualizacao = setInterval(() => {
        atualizarDashboardCompleta();
    }, 30000); // Atualizar a cada 30 segundos
    
    console.log('Dashboard Firebase inicializada');
}

// ===========================================
// 11. EVENTOS DO DOM
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // Observar quando a aba dashboard for ativada
    const dashboardTab = document.getElementById('dashboard');
    
    if (dashboardTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    if (dashboardTab.classList.contains('active')) {
                        setTimeout(initDashboardTab, 100);
                    } else {
                        // Limpar quando sair da dashboard
                        if (intervaloAtualizacao) {
                            clearInterval(intervaloAtualizacao);
                            intervaloAtualizacao = null;
                        }
                    }
                }
            });
        });
        
        observer.observe(dashboardTab, { attributes: true });
        
        // Se já estiver ativa
        if (dashboardTab.classList.contains('active')) {
            setTimeout(initDashboardTab, 500);
        }
    }
});

// ===========================================
// 12. FUNÇÕES DE NOTIFICAÇÃO
// ===========================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('custom-toast');
    if (!toast) return;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
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
// 13. EXPORTAR FUNÇÕES
// ===========================================
window.initDashboardTab = initDashboardTab;
window.atualizarDashboardCompleta = atualizarDashboardCompleta;
window.showToast = showToast;

console.log('Dashboard.js (Firebase) carregado');