// ===========================================
// DASHBOARD.JS - Sistema Direto e Funcional
// ===========================================

// Estado simplificado
let dashboardState = {
    pontosIniciais: 100,
    limiteDesvantagens: -75,
    status: 0,
    reputacao: 0,
    aparencia: 0,
    dinheiro: 0,
    nivelRiqueza: 'Médio',
    pesoEquipamentos: 0
};

// ===========================================
// 1. SISTEMA PARA SALVAR FOTO E PONTOS
// ===========================================
let dashboardSalvamento = {
    fotoBase64: null,
    pontosIniciaisSalvo: 100,
    limiteDesvantagensSalvo: -75,
    statusSalvo: 0,
    reputacaoSalva: 0,
    aparenciaSalva: 0
};

// Carregar dados salvos do localStorage
function carregarDadosSalvos() {
    try {
        const dados = localStorage.getItem('dashboardGURPS');
        if (dados) {
            const salvos = JSON.parse(dados);
            
            // Carregar foto
            if (salvos.fotoBase64) {
                dashboardSalvamento.fotoBase64 = salvos.fotoBase64;
            }
            
            // Carregar pontos iniciais
            if (salvos.pontosIniciaisSalvo !== undefined) {
                dashboardSalvamento.pontosIniciaisSalvo = salvos.pontosIniciaisSalvo;
                dashboardState.pontosIniciais = salvos.pontosIniciaisSalvo;
                const startPoints = document.getElementById('start-points');
                if (startPoints) {
                    startPoints.value = salvos.pontosIniciaisSalvo;
                }
            }
            
            // Carregar limite desvantagens
            if (salvos.limiteDesvantagensSalvo !== undefined) {
                dashboardSalvamento.limiteDesvantagensSalvo = salvos.limiteDesvantagensSalvo;
                dashboardState.limiteDesvantagens = salvos.limiteDesvantagensSalvo;
                const disLimit = document.getElementById('dis-limit');
                if (disLimit) {
                    disLimit.value = salvos.limiteDesvantagensSalvo;
                }
            }
            
            // Carregar status social
            if (salvos.statusSalvo !== undefined) {
                dashboardSalvamento.statusSalvo = salvos.statusSalvo;
                dashboardState.status = salvos.statusSalvo;
                const statusValue = document.getElementById('status-value');
                if (statusValue) {
                    statusValue.textContent = salvos.statusSalvo;
                }
            }
            
            if (salvos.reputacaoSalva !== undefined) {
                dashboardSalvamento.reputacaoSalva = salvos.reputacaoSalva;
                dashboardState.reputacao = salvos.reputacaoSalva;
                const repValue = document.getElementById('rep-value');
                if (repValue) {
                    repValue.textContent = salvos.reputacaoSalva;
                }
            }
            
            if (salvos.aparenciaSalva !== undefined) {
                dashboardSalvamento.aparenciaSalva = salvos.aparenciaSalva;
                dashboardState.aparencia = salvos.aparenciaSalva;
                const appValue = document.getElementById('app-value');
                if (appValue) {
                    appValue.textContent = salvos.aparenciaSalva;
                }
            }
            
            console.log('📥 Dados do dashboard carregados');
        }
    } catch (e) {
        console.log('❌ Erro ao carregar dados:', e);
    }
}

// Salvar dados no localStorage
function salvarDadosLocalmente() {
    try {
        dashboardSalvamento.pontosIniciaisSalvo = dashboardState.pontosIniciais;
        dashboardSalvamento.limiteDesvantagensSalvo = dashboardState.limiteDesvantagens;
        dashboardSalvamento.statusSalvo = dashboardState.status;
        dashboardSalvamento.reputacaoSalva = dashboardState.reputacao;
        dashboardSalvamento.aparenciaSalva = dashboardState.aparencia;
        
        localStorage.setItem('dashboardGURPS', JSON.stringify(dashboardSalvamento));
        console.log('💾 Dados salvos');
    } catch (e) {
        console.log('❌ Erro ao salvar:', e);
    }
}

// ===========================================
// 2. UPLOAD DE FOTO COM SALVAMENTO
// ===========================================
function configurarUploadFoto() {
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (!uploadInput || !photoPreview) return;
    
    // Carregar foto salva se existir
    if (dashboardSalvamento.fotoBase64) {
        photoPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = dashboardSalvamento.fotoBase64;
        img.alt = "Foto do Personagem";
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
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
            dashboardSalvamento.fotoBase64 = null;
            salvarDadosLocalmente();
        };
        photoPreview.appendChild(removeBtn);
    }
    
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // Salvar foto em Base64
                dashboardSalvamento.fotoBase64 = event.target.result;
                
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
                
                // Botão de remover
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
                    dashboardSalvamento.fotoBase64 = null;
                    salvarDadosLocalmente();
                };
                
                photoPreview.appendChild(removeBtn);
                
                // Salvar automaticamente
                salvarDadosLocalmente();
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Clique na foto
    photoPreview.parentElement.addEventListener('click', function(e) {
        if (!e.target.closest('.remove-photo-btn')) {
            uploadInput.click();
        }
    });
}

// ===========================================
// 3. INTEGRAÇÃO COM EQUIPAMENTOS
// ===========================================
function configurarIntegracaoEquipamentos() {
    console.log('🔄 Configurando integração com equipamentos...');
    
    // Escutar eventos do sistema de equipamentos
    document.addEventListener('equipamentosAtualizados', function(e) {
        if (e.detail) {
            console.log('📦 Dados recebidos dos equipamentos:', e.detail);
            
            // Atualizar dinheiro
            if (e.detail.dinheiro !== undefined) {
                dashboardState.dinheiro = e.detail.dinheiro;
                const moneyElem = document.getElementById('current-money');
                if (moneyElem) {
                    moneyElem.textContent = `$${e.detail.dinheiro}`;
                }
                
                // Atualizar também na aba de equipamentos
                const dinheiroEquip = document.getElementById('dinheiro-disponivel');
                if (dinheiroEquip) {
                    dinheiroEquip.textContent = `$${e.detail.dinheiro}`;
                }
                
                const dinheiroEquipBanner = document.getElementById('dinheiroEquipamento');
                if (dinheiroEquipBanner) {
                    dinheiroEquipBanner.textContent = `$${e.detail.dinheiro}`;
                }
            }
            
            // Atualizar peso
            if (e.detail.pesoAtual !== undefined) {
                dashboardState.pesoEquipamentos = e.detail.pesoAtual;
                const weightElem = document.getElementById('equip-weight');
                if (weightElem) {
                    weightElem.textContent = `${e.detail.pesoAtual.toFixed(1)} kg`;
                }
                
                // Atualizar também na aba de equipamentos
                const pesoAtualEquip = document.getElementById('pesoAtual');
                if (pesoAtualEquip) {
                    pesoAtualEquip.textContent = e.detail.pesoAtual.toFixed(1);
                }
            }
            
            // Atualizar nível de carga
            if (e.detail.nivelCargaAtual !== undefined) {
                const nivelCargaElem = document.getElementById('enc-level-display');
                if (nivelCargaElem) {
                    const niveis = {
                        'nenhuma': 'Nenhuma',
                        'leve': 'Leve',
                        'média': 'Média',
                        'pesada': 'Pesada',
                        'muito pesada': 'Muito Pesada',
                        'sobrecarregado': 'Sobrecarregado'
                    };
                    
                    nivelCargaElem.textContent = niveis[e.detail.nivelCargaAtual] || e.detail.nivelCargaAtual;
                    nivelCargaElem.className = 'enc-value ' + e.detail.nivelCargaAtual.replace(' ', '-');
                }
                
                // Atualizar também na aba de equipamentos
                const nivelCargaEquip = document.getElementById('nivelCarga');
                if (nivelCargaEquip) {
                    nivelCargaEquip.textContent = e.detail.nivelCargaAtual.toUpperCase();
                }
            }
            
            // Atualizar peso máximo
            if (e.detail.pesoMaximo !== undefined) {
                const pesoMaximoElem = document.getElementById('pesoMaximo');
                if (pesoMaximoElem) {
                    pesoMaximoElem.textContent = e.detail.pesoMaximo.toFixed(1);
                }
            }
        }
    });
    
    // Tentar pegar dados manualmente a cada 3 segundos (fallback)
    setInterval(function() {
        if (window.sistemaEquipamentos) {
            // Disparar evento de atualização
            const evento = new CustomEvent('equipamentosAtualizados', {
                detail: {
                    dinheiro: window.sistemaEquipamentos.dinheiro || 0,
                    pesoAtual: window.sistemaEquipamentos.pesoAtual || 0,
                    pesoMaximo: window.sistemaEquipamentos.pesoMaximo || 0,
                    nivelCargaAtual: window.sistemaEquipamentos.nivelCargaAtual || 'nenhuma',
                    penalidadesCarga: window.sistemaEquipamentos.penalidadesCarga || 'MOV +0 / DODGE +0'
                }
            });
            document.dispatchEvent(evento);
        }
    }, 3000);
}

// ===========================================
// 4. INICIALIZAÇÃO DIRETA (ATUALIZADA)
// ===========================================
function inicializarDashboard() {
    console.log('📊 Inicializando dashboard DIRETO...');
    
    // 1. Carregar dados salvos
    carregarDadosSalvos();
    
    // 2. Configurar upload de foto
    configurarUploadFoto();
    
    // 3. Configurar eventos
    configurarEventos();
    
    // 4. Configurar integração com equipamentos
    configurarIntegracaoEquipamentos();
    
    // 5. Forçar primeira atualização dos atributos
    setTimeout(() => {
        pegarValoresDiretos();
        atualizarTodosElementos();
    }, 200);
    
    // 6. Primeira atualização imediata
    setTimeout(atualizarDashboardCompleto, 100);
    
    // 7. Atualizar a cada 2 segundos
    setInterval(atualizarDashboardCompleto, 2000);
    
    console.log('✅ Dashboard pronto');
}

// ===========================================
// 5. CONFIGURAR EVENTOS COM SALVAMENTO
// ===========================================
function configurarEventos() {
    // Pontos iniciais
    const startPoints = document.getElementById('start-points');
    if (startPoints) {
        startPoints.addEventListener('change', function() {
            const valor = parseInt(this.value) || 100;
            dashboardState.pontosIniciais = valor;
            salvarDadosLocalmente();
            calcularSistemaPontos();
        });
    }
    
    // Limite desvantagens
    const disLimit = document.getElementById('dis-limit');
    if (disLimit) {
        disLimit.addEventListener('change', function() {
            const valor = parseInt(this.value) || -75;
            dashboardState.limiteDesvantagens = valor;
            salvarDadosLocalmente();
        });
    }
    
    // Botão de atualização
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            console.log('🔄 Atualização manual do dashboard');
            pegarValoresDiretos();
            atualizarTodosElementos();
            atualizarHorario();
        });
    }
}

// ===========================================
// 6. ATUALIZAÇÃO DE ATRIBUTOS (MELHORADA)
// ===========================================
// Esta função será chamada também da aba de atributos
function forcarAtualizacaoAtributos() {
    console.log('⚡ Forçando atualização de atributos...');
    
    // Pegar valores diretamente dos inputs
    const atributos = ['ST', 'DX', 'IQ', 'HT'];
    atributos.forEach(atributo => {
        const input = document.getElementById(atributo);
        const summaryElement = document.getElementById(`summary-${atributo.toLowerCase()}`);
        
        if (input && summaryElement) {
            const valor = input.value || 10;
            summaryElement.textContent = valor;
        }
    });
    
    // Atualizar cálculos baseados em ST
    atualizarCarga();
}

// ===========================================
// 7. FUNÇÕES ORIGINAIS (MANTIDAS COM PEQUENOS AJUSTES)
// ===========================================

// Atualização COMPLETA e DIRETA
function atualizarDashboardCompleto() {
    // 1. Pegar valores DIRETAMENTE das abas
    pegarValoresDiretos();
    
    // 2. Atualizar todos os elementos
    atualizarTodosElementos();
    
    // 3. Atualizar horário
    atualizarHorario();
}

// Pegar valores DIRETAMENTE dos elementos (MELHORADA)
function pegarValoresDiretos() {
    // Tentar pegar da aba de atributos
    const pontosGastosElement = document.getElementById('pontosGastos');
    if (pontosGastosElement) {
        const pontosGastos = parseInt(pontosGastosElement.textContent) || 0;
        const pointsAttr = document.getElementById('points-attr');
        if (pointsAttr) {
            pointsAttr.textContent = pontosGastos;
        }
    }
    
    // Pegar valores dos atributos
    const atributos = ['ST', 'DX', 'IQ', 'HT'];
    atributos.forEach(atributo => {
        const input = document.getElementById(atributo);
        const summaryElement = document.getElementById(`summary-${atributo.toLowerCase()}`);
        
        if (input && summaryElement) {
            const valor = input.value || 10;
            summaryElement.textContent = valor;
        }
    });
    
    // Pegar PV e PF
    const pvAtualElement = document.getElementById('pvAtual');
    const pfAtualElement = document.getElementById('pfAtual');
    
    if (pvAtualElement) {
        const pvAtual = pvAtualElement.value || 10;
        document.getElementById('summary-hp').textContent = pvAtual;
        document.getElementById('quick-hp').textContent = pvAtual;
    }
    
    if (pfAtualElement) {
        const pfAtual = pfAtualElement.value || 10;
        document.getElementById('summary-fp').textContent = pfAtual;
        document.getElementById('quick-fp').textContent = pfAtual;
    }
    
    // Pegar Vontade e Percepção
    const vontadeTotalElement = document.getElementById('VontadeTotal');
    const percepcaoTotalElement = document.getElementById('PercepcaoTotal');
    
    if (vontadeTotalElement) {
        const vontade = vontadeTotalElement.textContent || 10;
        document.getElementById('summary-will').textContent = vontade;
    }
    
    if (percepcaoTotalElement) {
        const percepcao = percepcaoTotalElement.textContent || 10;
        document.getElementById('summary-per').textContent = percepcao;
    }
}

// Atualizar todos os elementos do dashboard
function atualizarTodosElementos() {
    // 1. Calcular sistema de pontos
    calcularSistemaPontos();
    
    // 2. Atualizar status social
    atualizarStatusSocial();
    
    // 3. Atualizar finanças (agora usa dados dos equipamentos)
    // função mantida, mas agora usa dados atualizados
    
    // 4. Atualizar contadores
    atualizarContadores();
    
    // 5. Atualizar carga baseado em ST
    atualizarCarga();
    
    // 6. Atualizar identificação
    atualizarIdentificacao();
    
    // 7. Atualizar total social
    atualizarTotalSocial();
}

// Status Social - BOTÕES FUNCIONAIS (COM SALVAMENTO)
function ajustarModificador(tipo, valor) {
    let elementoValor;
    let elementoPontos;
    
    switch(tipo) {
        case 'status':
            elementoValor = document.getElementById('status-value');
            elementoPontos = document.getElementById('status-points-compact');
            break;
        case 'reputacao':
            elementoValor = document.getElementById('rep-value');
            elementoPontos = document.getElementById('reputacao-points-compact');
            break;
        case 'aparencia':
            elementoValor = document.getElementById('app-value');
            elementoPontos = document.getElementById('aparencia-points-compact');
            break;
        default:
            return;
    }
    
    if (!elementoValor) return;
    
    let valorAtual = parseInt(elementoValor.textContent) || 0;
    let novoValor = valorAtual + valor;
    
    // Limites
    if (tipo === 'status') {
        if (novoValor < -5) novoValor = -5;
        if (novoValor > 8) novoValor = 8;
    } else {
        if (novoValor < -4) novoValor = -4;
        if (novoValor > 4) novoValor = 4;
    }
    
    // Atualizar valor
    elementoValor.textContent = novoValor;
    
    // Atualizar pontos (5 pts por nível)
    const pontos = novoValor * 5;
    if (elementoPontos) {
        elementoPontos.textContent = `[${pontos}]`;
    }
    
    // Atualizar estado
    dashboardState[tipo] = novoValor;
    
    // Salvar
    salvarDadosLocalmente();
    
    // Atualizar total social
    atualizarTotalSocial();
    
    // Recalcular pontos
    calcularSistemaPontos();
}

function atualizarTotalSocial() {
    const status = parseInt(document.getElementById('status-value').textContent) || 0;
    const reputacao = parseInt(document.getElementById('rep-value').textContent) || 0;
    const aparencia = parseInt(document.getElementById('app-value').textContent) || 0;
    
    const total = status + reputacao + aparencia;
    const totalPontos = total * 5;
    
    // Atualizar total de pontos sociais
    const socialTotal = document.getElementById('social-total-points');
    if (socialTotal) {
        socialTotal.textContent = `${Math.abs(totalPontos)} pts`;
    }
    
    // Atualizar modificador total de reação
    const reacaoTotal = document.getElementById('reaction-total-compact');
    if (reacaoTotal) {
        const display = total >= 0 ? `+${total}` : total.toString();
        reacaoTotal.textContent = display;
    }
}

// Finanças simplificadas (AGORA USA DADOS DOS EQUIPAMENTOS)
function atualizarFinancas() {
    // Esta função não faz mais nada, os dados vêm dos equipamentos
    // Mantida para compatibilidade
}

// Carga baseada em ST (MELHORADA)
function atualizarCarga() {
    const st = parseInt(document.getElementById('summary-st').textContent) || 10;
    
    // Tabela de cargas
    const cargas = {
        1: { leve: 0.2, media: 0.3, pesada: 0.6, extrema: 1.0 },
        5: { leve: 5.0, media: 7.5, pesada: 15.0, extrema: 25.5 },
        10: { leve: 20.0, media: 30.0, pesada: 60.0, extrema: 100.0 },
        15: { leve: 45.0, media: 67.5, pesada: 135.0, extrema: 225.0 },
        20: { leve: 80.0, media: 120.0, pesada: 240.0, extrema: 400.0 }
    };
    
    // Encontrar carga apropriada
    let stKey = 10;
    if (st <= 5) stKey = 5;
    if (st <= 1) stKey = 1;
    if (st >= 15) stKey = 15;
    if (st >= 20) stKey = 20;
    
    const carga = cargas[stKey];
    
    // Atualizar limites (apenas se não tiver dados dos equipamentos)
    const limitLeve = document.getElementById('limit-light');
    const limitMedia = document.getElementById('limit-medium');
    const limitHeavy = document.getElementById('limit-heavy');
    const limitExtreme = document.getElementById('limit-extreme');
    
    if (limitLeve && !limitLeve.textContent.includes('kg')) {
        limitLeve.textContent = carga.leve.toFixed(1) + ' kg';
        limitMedia.textContent = carga.media.toFixed(1) + ' kg';
        limitHeavy.textContent = carga.pesada.toFixed(1) + ' kg';
        limitExtreme.textContent = carga.extrema.toFixed(1) + ' kg';
    }
}

// Contadores
function atualizarContadores() {
    const contadores = {
        'counter-advantages': 0,
        'counter-disadvantages': 0,
        'counter-skills': 0,
        'counter-spells': 0,
        'counter-languages': 1,
        'counter-relationships': 0
    };
    
    for (const [id, valor] of Object.entries(contadores)) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }
}

// Identificação
function atualizarIdentificacao() {
    const nomeInput = document.getElementById('characterName');
    if (nomeInput && nomeInput.value) {
        const charName = document.getElementById('char-name');
        if (charName) {
            charName.value = nomeInput.value;
        }
    }
}

// Atualizar horário
function atualizarHorario() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const lastUpdate = document.getElementById('last-update-time');
    if (lastUpdate) {
        lastUpdate.textContent = timeString;
    }
}

// ===========================================
// 8. EXPORTAÇÃO DAS FUNÇÕES PRINCIPAIS (ATUALIZADAS)
// ===========================================
window.definirPontosIniciais = function(valor) {
    const valorNumerico = parseInt(valor) || 100;
    dashboardState.pontosIniciais = valorNumerico;
    
    // Atualizar input
    const startPoints = document.getElementById('start-points');
    if (startPoints) {
        startPoints.value = valorNumerico;
    }
    
    // Salvar
    salvarDadosLocalmente();
    
    calcularSistemaPontos();
};

window.definirLimiteDesvantagens = function(valor) {
    const valorNumerico = parseInt(valor) || -75;
    dashboardState.limiteDesvantagens = valorNumerico;
    
    // Atualizar input
    const disLimit = document.getElementById('dis-limit');
    if (disLimit) {
        disLimit.value = valorNumerico;
    }
    
    // Salvar
    salvarDadosLocalmente();
};

window.ajustarModificador = ajustarModificador;
window.atualizarDashboard = atualizarDashboardCompleto;
window.inicializarDashboard = inicializarDashboard;

// Nova função para forçar atualização de atributos
window.forcarAtualizacaoAtributos = forcarAtualizacaoAtributos;

// ===========================================
// 9. OBSERVADOR PARA ATUALIZAÇÃO AUTOMÁTICA
// ===========================================
// Observar mudanças nos inputs de atributos
function observarMudancasAtributos() {
    const atributos = ['ST', 'DX', 'IQ', 'HT'];
    
    atributos.forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            input.addEventListener('input', function() {
                // Atualizar no dashboard imediatamente
                const summaryElement = document.getElementById(`summary-${atributo.toLowerCase()}`);
                if (summaryElement) {
                    summaryElement.textContent = this.value || 10;
                }
                
                // Atualizar carga se for ST
                if (atributo === 'ST') {
                    atualizarCarga();
                }
            });
            
            input.addEventListener('change', function() {
                // Forçar atualização completa
                setTimeout(atualizarDashboardCompleto, 100);
            });
        }
    });
}

// ===========================================
// 10. INICIALIZAÇÃO AUTOMÁTICA
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
    // Configurar observador de atributos
    observarMudancasAtributos();
    
    // Observar mudanças de aba
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const dashboardTab = document.getElementById('dashboard');
                if (dashboardTab && dashboardTab.classList.contains('active')) {
                    console.log('📊 Aba dashboard ativada!');
                    setTimeout(inicializarDashboard, 100);
                }
            }
        });
    });
    
    // Observar a aba dashboard
    const dashboardTab = document.getElementById('dashboard');
    if (dashboardTab) {
        observer.observe(dashboardTab, { attributes: true });
    }
    
    // Se a dashboard já estiver ativa ao carregar
    if (dashboardTab && dashboardTab.classList.contains('active')) {
        console.log('📊 Dashboard já está ativa!');
        setTimeout(inicializarDashboard, 500);
    }
});

// ===========================================
// 11. INTEGRAÇÃO COM O SISTEMA DE EQUIPAMENTOS
// ===========================================
// Esta função será chamada pelo sistema de equipamentos
window.atualizarDashboardComEquipamentos = function(dados) {
    if (dados) {
        const evento = new CustomEvent('equipamentosAtualizados', {
            detail: dados
        });
        document.dispatchEvent(evento);
    }
};