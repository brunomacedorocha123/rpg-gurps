// ===========================================
// DASHBOARD.JS - Dashboard com Firebase
// VERSÃO COMPLETA - INTEGRAÇÃO COM ATRIBUTOS
// ===========================================

// Verificar se Firebase está disponível
let firebaseReady = false;
let intervaloAtualizacao = null;

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
// FUNÇÕES PARA ATUALIZAR CARGAS DO ATRIBUTOS.JS
// ===========================================

// Função para atualizar limites de carga no dashboard
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
            elemento.textContent = cargas[chave].toFixed(1) + ' kg';
        }
    });
}

// Função para atualizar atributos no dashboard
function atualizarAtributosDashboard(dadosAtributos) {
    if (!dadosAtributos) {
        // Tentar obter dos atributos atuais
        if (typeof window.getAtributosPersonagem === 'function') {
            dadosAtributos = window.getAtributosPersonagem();
        }
    }
    
    if (!dadosAtributos) return;
    
    console.log('📊 Atualizando atributos no dashboard:', dadosAtributos);
    
    // Atributos principais
    const principais = {
        'summary-st': dadosAtributos.ST || 10,
        'summary-dx': dadosAtributos.DX || 10,
        'summary-iq': dadosAtributos.IQ || 10,
        'summary-ht': dadosAtributos.HT || 10
    };
    
    Object.entries(principais).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = valor;
            // Adicionar classe se for diferente de 10
            el.classList.remove('atributo-alterado');
            if (valor !== 10) el.classList.add('atributo-alterado');
        }
    });
    
    // Atributos derivados (calcula se não tem)
    let derivados = {};
    
    if (dadosAtributos.derivados) {
        derivados = {
            'summary-hp': dadosAtributos.derivados.PV || 10,
            'summary-fp': dadosAtributos.derivados.PF || 10,
            'summary-will': dadosAtributos.derivados.Vontade || 10,
            'summary-per': dadosAtributos.derivados.Percepcao || 10
        };
    } else if (dadosAtributos.bonus) {
        derivados = {
            'summary-hp': (dadosAtributos.ST || 10) + (dadosAtributos.bonus.PV || 0),
            'summary-fp': (dadosAtributos.HT || 10) + (dadosAtributos.bonus.PF || 0),
            'summary-will': (dadosAtributos.IQ || 10) + (dadosAtributos.bonus.Vontade || 0),
            'summary-per': (dadosAtributos.IQ || 10) + (dadosAtributos.bonus.Percepcao || 0)
        };
    }
    
    Object.entries(derivados).forEach(([id, valor]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = valor;
    });
    
    // Atualizar PV e PF atuais no card de identificação
    const quickHP = document.getElementById('quick-hp');
    const quickFP = document.getElementById('quick-fp');
    if (quickHP && derivados['summary-hp']) {
        quickHP.textContent = derivados['summary-hp'];
    }
    if (quickFP && derivados['summary-fp']) {
        quickFP.textContent = derivados['summary-fp'];
    }
    
    // Atualizar cargas se disponível
    if (typeof window.getCargasPersonagem === 'function') {
        const cargas = window.getCargasPersonagem();
        atualizarCargasDashboard(cargas);
    }
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
                        nome: file.name,
                        dataUpload: new Date().toISOString()
                    });
                    showToast('Foto do personagem salva!', 'success');
                } catch (error) {
                    console.error('Erro ao salvar foto:', error);
                    showToast('Erro ao salvar foto', 'error');
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
    
    console.log('💰 Atualizando display de pontos:', dados);
    
    // Total gasto
    const totalElement = document.getElementById('total-points-spent');
    if (totalElement) {
        totalElement.textContent = dados.total + " pts";
        
        // Estilo baseado no status
        totalElement.className = 'card-badge';
        if (dados.status === 'excedido') {
            totalElement.classList.add('negativo');
        } else if (dados.status === 'perfeito') {
            totalElement.classList.add('positivo');
        }
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
            if (saldo < 0) {
                container.classList.add('negativo');
                document.getElementById('points-status-text').textContent = 'Excedeu o limite!';
                document.getElementById('points-status-indicator').style.backgroundColor = '#f44336';
            } else if (saldo === 0) {
                container.classList.add('exato');
                document.getElementById('points-status-text').textContent = 'Perfeito!';
                document.getElementById('points-status-indicator').style.backgroundColor = '#4CAF50';
            } else if (saldo <= 10) {
                container.classList.add('baixo');
                document.getElementById('points-status-text').textContent = 'Poucos pontos restantes';
                document.getElementById('points-status-indicator').style.backgroundColor = '#ff9800';
            } else {
                container.classList.add('positivo');
                document.getElementById('points-status-text').textContent = 'Personagem válido';
                document.getElementById('points-status-indicator').style.backgroundColor = '#4CAF50';
            }
        }
    }
    
    // Distribuição por aba
    atualizarDistribuicao(dados.distribuicao);
}

// ===========================================
// 3. ATUALIZAR DISTRIBUIÇÃO DE PONTOS
// ===========================================
function atualizarDistribuicao(distribuicao) {
    if (!distribuicao) return;
    
    // Atributos
    const attrEl = document.getElementById('points-attr');
    if (attrEl && distribuicao.atributos !== undefined) {
        attrEl.textContent = distribuicao.atributos;
        attrEl.className = 'breakdown-value ' + 
            (distribuicao.atributos > 0 ? 'positivo' : '');
    }
    
    // Vantagens
    const vantagensEl = document.getElementById('points-adv');
    if (vantagensEl && distribuicao.vantagens !== undefined) {
        vantagensEl.textContent = Math.max(distribuicao.vantagens, 0);
        vantagensEl.className = 'breakdown-value ' + 
            (distribuicao.vantagens > 0 ? 'positivo' : '');
    }
    
    // Desvantagens
    const desvEl = document.getElementById('points-dis');
    if (desvEl && distribuicao.desvantagens !== undefined) {
        const valor = Math.abs(Math.min(distribuicao.desvantagens, 0));
        desvEl.textContent = valor;
        desvEl.className = 'breakdown-value ' + 
            (distribuicao.desvantagens < 0 ? 'negativo' : '');
    }
    
    // Peculiaridades
    const pecEl = document.getElementById('points-pec');
    if (pecEl && distribuicao.peculiaridades !== undefined) {
        pecEl.textContent = Math.abs(Math.min(distribuicao.peculiaridades, 0));
        pecEl.className = 'breakdown-value ' + 
            (distribuicao.peculiaridades < 0 ? 'negativo' : '');
    }
    
    // Perícias
    const skillsEl = document.getElementById('points-skills');
    if (skillsEl && distribuicao.pericias !== undefined) {
        skillsEl.textContent = distribuicao.pericias;
        skillsEl.className = 'breakdown-value ' + 
            (distribuicao.pericias > 0 ? 'positivo' : '');
    }
    
    // Técnicas
    const techEl = document.getElementById('points-tech');
    if (techEl && distribuicao.técnicas !== undefined) {
        techEl.textContent = distribuicao.técnicas;
        techEl.className = 'breakdown-value ' + 
            (distribuicao.técnicas > 0 ? 'positivo' : '');
    }
    
    // Magias
    const spellsEl = document.getElementById('points-spells');
    if (spellsEl && distribuicao.magias !== undefined) {
        spellsEl.textContent = distribuicao.magias;
        spellsEl.className = 'breakdown-value ' + 
            (distribuicao.magias > 0 ? 'positivo' : '');
    }
    
    // Aparência
    const appEl = document.getElementById('app-value');
    if (appEl && distribuicao.aparência !== undefined) {
        const pontos = distribuicao.aparência;
        appEl.textContent = pontos >= 0 ? `+${pontos}` : pontos.toString();
        appEl.className = pontos > 0 ? 'positivo' : pontos < 0 ? 'negativo' : '';
    }
}

// ===========================================
// 4. ATUALIZAR INFORMAÇÕES DO PERSONAGEM
// ===========================================
async function atualizarInformacoesPersonagem() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    try {
        const dados = await firebaseService.loadCharacter();
        if (!dados) return;
        
        console.log('📋 Carregando informações do personagem:', dados);
        
        // Nome do personagem
        const nomeEl = document.getElementById('char-name');
        if (nomeEl && dados.nome) {
            nomeEl.value = dados.nome;
        }
        
        // Raça (se disponível)
        const raceEl = document.getElementById('char-race');
        if (raceEl && dados.raça) {
            raceEl.value = dados.raça;
        }
        
        // Ocupação (se disponível)
        const typeEl = document.getElementById('char-type');
        if (typeEl && dados.ocupação) {
            typeEl.value = dados.ocupação;
        }
        
        // Jogador (se disponível)
        const playerEl = document.getElementById('char-player');
        if (playerEl && dados.jogador) {
            playerEl.value = dados.jogador;
        }
        
        // Riqueza e dinheiro
        const dinheiroEl = document.getElementById('current-money');
        if (dinheiroEl) {
            if (dados.riqueza?.rendaMensal) {
                const renda = dados.riqueza.rendaMensal;
                dinheiroEl.textContent = `$${renda.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`;
            } else if (dados.financeiro?.dinheiro) {
                dinheiroEl.textContent = `$${dados.financeiro.dinheiro}`;
            }
        }
        
        // Nível de riqueza
        const wealthEl = document.getElementById('wealth-level-display');
        if (wealthEl && dados.riqueza?.nível) {
            wealthEl.textContent = `${dados.riqueza.nível} [${dados.riqueza.pontos || 0} pts]`;
        }
        
        // Status social
        const socialPointsEl = document.getElementById('social-total-points');
        if (socialPointsEl) {
            const statusPoints = dados.statusSocial?.pontos || 0;
            socialPointsEl.textContent = `${statusPoints} pts`;
        }
        
        // Última atualização
        const horaEl = document.getElementById('last-update-time');
        if (horaEl) {
            const agora = new Date();
            horaEl.textContent = agora.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao carregar informações:', error);
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
        
        console.log('📊 Atualizando contadores:', dados);
        
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
            if (el) {
                el.textContent = quantidade;
                
                // Adicionar animação se mudou
                el.classList.remove('counter-updated');
                void el.offsetWidth; // Trigger reflow
                el.classList.add('counter-updated');
            }
        });
        
    } catch (error) {
        console.error('❌ Erro ao carregar contadores:', error);
    }
}

// ===========================================
// 6. CARREGAR FOTO DO PERSONAGEM
// ===========================================
async function carregarFotoPersonagem() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    try {
        const dados = await firebaseService.loadCharacter();
        if (!dados?.foto?.base64) {
            // Foto padrão
            const photoPreview = document.getElementById('photo-preview');
            if (photoPreview) {
                photoPreview.innerHTML = `
                    <div class="photo-placeholder">
                        <i class="fas fa-user-circle"></i>
                        <span>Foto do Personagem</span>
                        <small>Clique para adicionar</small>
                    </div>
                `;
            }
            return;
        }
        
        const photoPreview = document.getElementById('photo-preview');
        if (photoPreview) {
            photoPreview.innerHTML = `
                <img src="${dados.foto.base64}" 
                     style="width:100%;height:100%;object-fit:cover;border-radius:8px;"
                     alt="Foto do personagem">
            `;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar foto:', error);
    }
}

// ===========================================
// 7. CONFIGURAR CONTROLES DE STATUS SOCIAL
// ===========================================
function configurarStatusSocial() {
    // Status
    const statusValue = document.getElementById('status-value');
    const statusPoints = document.getElementById('status-points-compact');
    
    if (statusValue && statusPoints) {
        // Simulação - na prática pegaria do Firebase
        const statusAtual = 0;
        const pontosStatus = statusAtual * 5; // 5 pontos por nível
        
        statusValue.textContent = statusAtual >= 0 ? `+${statusAtual}` : statusAtual;
        statusPoints.textContent = `[${pontosStatus}]`;
        
        // Aplicar cor
        statusValue.className = '';
        if (statusAtual > 0) statusValue.classList.add('positivo');
        else if (statusAtual < 0) statusValue.classList.add('negativo');
    }
    
    // Reputação
    const repValue = document.getElementById('rep-value');
    const repPoints = document.getElementById('reputacao-points-compact');
    
    if (repValue && repPoints) {
        const repAtual = 0;
        const pontosRep = repAtual * 5;
        
        repValue.textContent = repAtual >= 0 ? `+${repAtual}` : repAtual;
        repPoints.textContent = `[${pontosRep}]`;
        
        repValue.className = '';
        if (repAtual > 0) repValue.classList.add('positivo');
        else if (repAtual < 0) repValue.classList.add('negativo');
    }
}

// ===========================================
// 8. CONFIGURAR PESO E CARGA
// ===========================================
async function configurarPesoCarga() {
    // Obter peso do equipamento (do módulo de equipamentos)
    if (typeof window.getPesoEquipamento === 'function') {
        const pesoEquip = window.getPesoEquipamento() || 0;
        const pesoEl = document.getElementById('equip-weight');
        if (pesoEl) {
            pesoEl.textContent = pesoEquip.toFixed(1) + ' kg';
        }
        
        // Determinar nível de carga baseado no ST
        if (typeof window.getCargasPersonagem === 'function') {
            const cargas = window.getCargasPersonagem();
            if (cargas) {
                let nivelCarga = 'Nenhuma';
                let encValue = document.getElementById('enc-level-display');
                
                if (pesoEquip <= cargas.nenhuma) nivelCarga = 'Nenhuma';
                else if (pesoEquip <= cargas.leve) nivelCarga = 'Leve';
                else if (pesoEquip <= cargas.media) nivelCarga = 'Média';
                else if (pesoEquip <= cargas.pesada) nivelCarga = 'Pesada';
                else nivelCarga = 'Muito Pesada';
                
                if (encValue) {
                    encValue.textContent = nivelCarga;
                    // Adicionar classe de cor
                    encValue.className = 'enc-value';
                    if (nivelCarga === 'Muito Pesada') encValue.classList.add('perigo');
                    else if (nivelCarga === 'Pesada') encValue.classList.add('alerta');
                }
            }
        }
    }
}

// ===========================================
// 9. ATUALIZAÇÃO COMPLETA DA DASHBOARD
// ===========================================
async function atualizarDashboardCompleta() {
    console.log('🔄 Atualizando dashboard completa...');
    
    if (!firebaseReady) {
        await waitForFirebase();
    }
    
    try {
        // Atualizar todas as seções
        await atualizarInformacoesPersonagem();
        await atualizarContadores();
        await carregarFotoPersonagem();
        
        // Atualizar atributos (da aba atributos)
        if (typeof window.getAtributosPersonagem === 'function') {
            atualizarAtributosDashboard(window.getAtributosPersonagem());
        } else {
            // Tentar carregar do Firebase
            const dados = await firebaseService.loadCharacter();
            if (dados?.atributos) {
                atualizarAtributosDashboard(dados.atributos);
            }
        }
        
        // Configurar controles
        configurarStatusSocial();
        await configurarPesoCarga();
        
        // Pontos são atualizados automaticamente via listener
        
        showToast('Dashboard atualizada!', 'success');
        
    } catch (error) {
        console.error('❌ Erro ao atualizar dashboard:', error);
        showToast('Erro ao atualizar dashboard', 'error');
    }
}

// ===========================================
// 10. CONFIGURAR ESCUTA EM TEMPO REAL
// ===========================================
function configurarEscutaTempoReal() {
    if (!firebaseReady || !firebaseService.characterId) return;
    
    console.log('👂 Configurando escuta em tempo real...');
    
    // Escutar mudanças no personagem
    firebaseService.subscribeToCharacter((dados) => {
        if (dados) {
            console.log('🔄 Dados atualizados em tempo real:', dados);
            
            // Atualizar nome
            const nomeEl = document.getElementById('char-name');
            if (nomeEl && dados.nome) {
                nomeEl.value = dados.nome;
            }
            
            // Atualizar atributos
            if (dados.atributos) {
                atualizarAtributosDashboard(dados.atributos);
            }
            
            // Atualizar pontos
            if (dados.pontos && pontosManager) {
                pontosManager.carregarPontos();
            }
            
            // Atualizar foto
            if (dados.foto?.base64) {
                carregarFotoPersonagem();
            }
            
            // Atualizar contadores
            atualizarContadores();
        }
    });
}

// ===========================================
// 11. INICIALIZAÇÃO DA DASHBOARD
// ===========================================
async function initDashboardTab() {
    console.log('🚀 Iniciando dashboard com Firebase...');
    
    // Mostrar loading
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'dashboard-loading';
    loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando dashboard...';
    document.querySelector('.dashboard-content')?.appendChild(loadingIndicator);
    
    try {
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
                if (firebaseReady) {
                    firebaseService.saveModule('config', { 
                        limiteDesvantagens: limite,
                        atualizadoEm: new Date().toISOString()
                    });
                    showToast(`Limite de desvantagens: ${limite} pontos`, 'info');
                }
            });
        }
        
        // Configurar pontos iniciais
        const startPoints = document.getElementById('start-points');
        if (startPoints) {
            startPoints.addEventListener('change', function() {
                const pontos = parseInt(this.value) || 100;
                if (firebaseReady) {
                    firebaseService.saveModule('config', { 
                        pontosIniciais: pontos,
                        atualizadoEm: new Date().toISOString()
                    });
                    
                    // Atualizar pontos manager
                    if (pontosManager) {
                        pontosManager.limitePontos = pontos;
                        pontosManager.notificarListeners();
                    }
                    
                    showToast(`Pontos iniciais: ${pontos}`, 'info');
                }
            });
        }
        
        // Aguardar Firebase estar pronto
        await waitForFirebase();
        
        // Configurar escuta em tempo real
        configurarEscutaTempoReal();
        
        // Atualizar dados iniciais
        await atualizarDashboardCompleta();
        
        // Configurar atualização periódica
        if (intervaloAtualizacao) clearInterval(intervaloAtualizacao);
        intervaloAtualizacao = setInterval(() => {
            atualizarDashboardCompleta();
        }, 60000); // Atualizar a cada 60 segundos
        
        // Remover loading
        loadingIndicator.remove();
        
        console.log('✅ Dashboard Firebase inicializada com sucesso');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar dashboard:', error);
        loadingIndicator.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Erro ao carregar dashboard';
        loadingIndicator.classList.add('error');
    }
}

// ===========================================
// 12. EVENTOS DO DOM E OBSERVADOR
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // Observar quando a aba dashboard for ativada
    const dashboardTab = document.getElementById('dashboard');
    
    if (dashboardTab) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    if (dashboardTab.classList.contains('active')) {
                        console.log('🎯 Dashboard ativada, iniciando...');
                        setTimeout(initDashboardTab, 100);
                    } else {
                        // Limpar quando sair da dashboard
                        if (intervaloAtualizacao) {
                            clearInterval(intervaloAtualizacao);
                            intervaloAtualizacao = null;
                            console.log('🛑 Dashboard desativada, limpando intervalos');
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
    
    // Sincronizar nome do personagem
    const charNameInput = document.getElementById('characterName');
    const dashNameInput = document.getElementById('char-name');
    
    if (charNameInput && dashNameInput) {
        charNameInput.addEventListener('input', function() {
            dashNameInput.value = this.value;
        });
        
        dashNameInput.addEventListener('input', function() {
            charNameInput.value = this.value;
        });
    }
});

// ===========================================
// 13. FUNÇÕES DE NOTIFICAÇÃO
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
// 14. FUNÇÕES AUXILIARES PARA OUTROS MÓDULOS
// ===========================================

// Função para outros módulos atualizarem o dashboard
function reportarAtualizacaoDashboard(module, dados) {
    console.log(`📣 ${module} reportando atualização:`, dados);
    
    switch(module) {
        case 'atributos':
            atualizarAtributosDashboard(dados);
            break;
        case 'pontos':
            if (pontosManager) {
                pontosManager.carregarPontos();
            }
            break;
        case 'equipamento':
            configurarPesoCarga();
            break;
    }
}

// ===========================================
// 15. EXPORTAR FUNÇÕES
// ===========================================
window.initDashboardTab = initDashboardTab;
window.atualizarDashboardCompleta = atualizarDashboardCompleta;
window.atualizarDashboardAtributos = atualizarAtributosDashboard;
window.atualizarCargasDashboard = atualizarCargasDashboard;
window.reportarAtualizacaoDashboard = reportarAtualizacaoDashboard;
window.showToast = showToast;

// Inicializar se já na dashboard
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

console.log('✅ dashboard.js (Firebase) carregado com funções de integração');