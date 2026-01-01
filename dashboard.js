// ===========================================
// DASHBOARD.JS - Sistema Completo de Dashboard GURPS - 100% ATUALIZADO
// ===========================================

// Estado global do dashboard
let dashboardState = {
    personagem: {
        nome: "",
        tipo: "",
        jogador: "",
        foto: null,
        // ATRIBUTOS PRINCIPAIS (serão sincronizados)
        atributos: {
            ST: 10,
            DX: 10,
            IQ: 10,
            HT: 10
        },
        // BÔNUS DOS ATRIBUTOS
        bonus: {
            PV: 0,
            PF: 0,
            Vontade: 0,
            Percepcao: 0,
            Deslocamento: 0
        },
        caracteristicasFisicas: {
            altura: "1.70 m",
            peso: "70 kg",
            idade: "25 anos",
            aparência: "Comum",
            descricao: ""
        },
        pontos: {
            iniciais: 100,
            gastos: 0,
            vantagens: 0,
            desvantagens: 0,
            pericias: 0,
            magias: 0,
            saldo: 100
        },
        statusSocial: {
            riqueza: "Médio",
            status: 0,
            reputacao: 0,
            aparência: 0,
            reacao: 0
        },
        equipamento: {
            peso: 0,
            valor: 0,
            carga: "Nenhuma"
        },
        resumo: {
            vantagens: 0,
            desvantagens: 0,
            pericias: 0,
            magias: 0,
            itens: 0,
            idiomas: 1
        }
    },
    ultimaAtualizacao: null
};

// ===== FUNÇÕES DE SINCRONIZAÇÃO DE ATRIBUTOS =====

// 1. Função para pegar atributos do localStorage da aba Atributos
function getAtributosDoStorage() {
    try {
        const dados = localStorage.getItem('gurps_atributos');
        if (dados) {
            return JSON.parse(dados);
        }
    } catch (error) {
        console.warn('Erro ao ler atributos do storage:', error);
    }
    return null;
}

// 2. Função para sincronizar todos os atributos
function sincronizarAtributosDashboard() {
    const dadosAtributos = getAtributosDoStorage();
    
    if (dadosAtributos) {
        // Atualiza atributos principais
        if (dadosAtributos.atributos) {
            const attrs = dadosAtributos.atributos;
            dashboardState.personagem.atributos.ST = attrs.ST || 10;
            dashboardState.personagem.atributos.DX = attrs.DX || 10;
            dashboardState.personagem.atributos.IQ = attrs.IQ || 10;
            dashboardState.personagem.atributos.HT = attrs.HT || 10;
            
            // Atualiza valores na tela
            atualizarAtributosTela();
        }
        
        // Atualiza bônus
        if (dadosAtributos.bonus) {
            const bonus = dadosAtributos.bonus;
            dashboardState.personagem.bonus.PV = bonus.PV || 0;
            dashboardState.personagem.bonus.PF = bonus.PF || 0;
            dashboardState.personagem.bonus.Vontade = bonus.Vontade || 0;
            dashboardState.personagem.bonus.Percepcao = bonus.Percepcao || 0;
            dashboardState.personagem.bonus.Deslocamento = bonus.Deslocamento || 0;
            
            // Atualiza atributos secundários
            atualizarAtributosSecundariosTela();
        }
        
        // Atualiza custos
        atualizarCustosAtributos();
        
        // Atualiza timestamp
        atualizarTimestamp();
        
        console.log('🔄 Atributos sincronizados:', dashboardState.personagem.atributos);
        return true;
    }
    return false;
}

// 3. Função para atualizar atributos na tela
function atualizarAtributosTela() {
    const attrs = dashboardState.personagem.atributos;
    
    // Atualiza valores principais
    document.getElementById('attr-st').textContent = attrs.ST;
    document.getElementById('attr-dx').textContent = attrs.DX;
    document.getElementById('attr-iq').textContent = attrs.IQ;
    document.getElementById('attr-ht').textContent = attrs.HT;
    
    // Atualiza detalhes
    atualizarDetalhesAtributos();
    
    // Adiciona efeito visual de atualização
    ['attr-st', 'attr-dx', 'attr-iq', 'attr-ht'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add('updated');
            setTimeout(() => elemento.classList.remove('updated'), 500);
        }
    });
}

// 4. Função para atualizar detalhes dos atributos
function atualizarDetalhesAtributos() {
    const ST = dashboardState.personagem.atributos.ST;
    const DX = dashboardState.personagem.atributos.DX;
    const IQ = dashboardState.personagem.atributos.IQ;
    const HT = dashboardState.personagem.atributos.HT;
    const bonus = dashboardState.personagem.bonus;
    
    // Tabela de dano simplificada
    const danoTable = {
        1: "1d-6/1d-5", 2: "1d-6/1d-5", 3: "1d-5/1d-4", 4: "1d-5/1d-4",
        5: "1d-4/1d-3", 6: "1d-4/1d-3", 7: "1d-3/1d-2", 8: "1d-3/1d-2",
        9: "1d-2/1d-1", 10: "1d-2/1d", 11: "1d-1/1d+1", 12: "1d/1d+2",
        13: "1d/2d-1", 14: "1d/2d", 15: "1d+1/2d+1", 16: "1d+1/2d+2",
        17: "1d+2/3d-1", 18: "1d+2/3d", 19: "2d-1/3d+1", 20: "2d-1/3d+2",
        21: "2d/4d-1", 22: "2d/4d", 23: "2d+1/4d+1", 24: "2d+1/4d+2",
        25: "2d+2/5d-1", 26: "2d+2/5d", 27: "3d-1/5d+1", 28: "3d-1/5d+1",
        29: "3d/5d+2", 30: "3d/5d+2", 31: "3d+1/6d-1", 32: "3d+1/6d-1",
        33: "3d+2/6d", 34: "3d+2/6d", 35: "4d-1/6d+1", 36: "4d-1/6d+1",
        37: "4d/6d+2", 38: "4d/6d+2", 39: "4d+1/7d-1", 40: "4d+1/7d-1"
    };
    
    const stKey = Math.min(Math.max(ST, 1), 40);
    const dano = danoTable[stKey] || "1d-2/1d";
    
    // Esquiva = 8 + floor((DX - 10) / 2)
    const esquiva = 8 + Math.floor((DX - 10) / 2);
    
    // Vontade total = IQ + bônus
    const vontadeTotal = Math.max(IQ + (bonus.Vontade || 0), 1);
    
    // Resistência = HT
    const resistencia = HT;
    
    document.getElementById('attr-st-details').textContent = `Dano: ${dano}`;
    document.getElementById('attr-dx-details').textContent = `Esquiva: ${esquiva}`;
    document.getElementById('attr-iq-details').textContent = `Vontade: ${vontadeTotal}`;
    document.getElementById('attr-ht-details').textContent = `Resistência: ${resistencia}`;
}

// 5. Função para atualizar atributos secundários na tela
function atualizarAtributosSecundariosTela() {
    const attrs = dashboardState.personagem.atributos;
    const bonus = dashboardState.personagem.bonus;
    
    // Pontos de Vida (PV = ST + bônus)
    const pvTotal = Math.max(attrs.ST + bonus.PV, 1);
    document.getElementById('pv-current').textContent = pvTotal;
    document.getElementById('pv-max').textContent = pvTotal;
    
    // Pontos de Fadiga (PF = HT + bônus)
    const pfTotal = Math.max(attrs.HT + bonus.PF, 1);
    document.getElementById('fp-current').textContent = pfTotal;
    document.getElementById('fp-max').textContent = pfTotal;
    
    // Vontade (IQ + bônus)
    const vontadeTotal = Math.max(attrs.IQ + bonus.Vontade, 1);
    document.getElementById('will-value').textContent = vontadeTotal;
    
    // Percepção (IQ + bônus)
    const percepcaoTotal = Math.max(attrs.IQ + bonus.Percepcao, 1);
    document.getElementById('per-value').textContent = percepcaoTotal;
    
    // Deslocamento (HT+DX)/4 + bônus
    const deslocamentoBase = (attrs.HT + attrs.DX) / 4;
    const deslocamentoTotal = (deslocamentoBase + bonus.Deslocamento).toFixed(2);
    document.getElementById('move-value').textContent = deslocamentoTotal;
    
    // Efeito visual de atualização
    ['pv-current', 'fp-current', 'will-value', 'per-value', 'move-value'].forEach(id => {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.classList.add('updated');
            setTimeout(() => elemento.classList.remove('updated'), 500);
        }
    });
}

// 6. Função para atualizar custos dos atributos
function atualizarCustosAtributos() {
    const attrs = dashboardState.personagem.atributos;
    
    // Cálculo de custos
    const custoST = (attrs.ST - 10) * 10;
    const custoDX = (attrs.DX - 10) * 20;
    const custoIQ = (attrs.IQ - 10) * 20;
    const custoHT = (attrs.HT - 10) * 10;
    
    const totalAtributos = custoST + custoDX + custoIQ + custoHT;
    
    // Atualiza pontos gastos com atributos
    const outrosGastos = 
        dashboardState.personagem.pontos.vantagens + 
        dashboardState.personagem.pontos.pericias + 
        dashboardState.personagem.pontos.magias +
        Math.abs(dashboardState.personagem.pontos.desvantagens);
    
    dashboardState.personagem.pontos.gastos = totalAtributos + outrosGastos;
    
    // Calcula saldo
    const saldo = dashboardState.personagem.pontos.iniciais - dashboardState.personagem.pontos.gastos;
    dashboardState.personagem.pontos.saldo = saldo;
    
    // Atualiza na tela
    const balanceElement = document.getElementById('points-balance');
    if (balanceElement) {
        balanceElement.textContent = dashboardState.personagem.pontos.saldo;
        
        // Destaca se estiver negativo
        if (saldo < 0) {
            balanceElement.classList.add('excedido');
            balanceElement.classList.remove('positivo');
        } else if (saldo > 0) {
            balanceElement.classList.remove('excedido');
            balanceElement.classList.add('positivo');
        } else {
            balanceElement.classList.remove('excedido', 'positivo');
        }
        
        // Efeito visual
        balanceElement.classList.add('updated');
        setTimeout(() => balanceElement.classList.remove('updated'), 500);
    }
}

// ===== FUNÇÕES PARA GERENCIAR FOTO =====

function configurarUploadFoto() {
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    const photoControls = document.getElementById('photo-controls');
    
    if (!uploadInput || !photoPreview) return;
    
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Verifica tamanho da imagem (máx 5MB)
            if (file.size > 5 * 1024 * 1024) {
                mostrarNotificacao('A imagem é muito grande. Por favor, escolha uma imagem menor que 5MB.', 'error');
                return;
            }
            
            // Verifica tipo da imagem
            if (!file.type.match('image/jpeg') && !file.type.match('image/png') && !file.type.match('image/gif')) {
                mostrarNotificacao('Por favor, escolha uma imagem JPEG, PNG ou GIF.', 'error');
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                atualizarFotoPreview(e.target.result);
                
                // Salva no estado
                dashboardState.personagem.foto = e.target.result;
                salvarDadosDashboard();
                
                mostrarNotificacao('Foto do personagem atualizada com sucesso!', 'success');
                console.log('📸 Foto atualizada');
            };
            
            reader.onerror = function() {
                mostrarNotificacao('Erro ao carregar a imagem. Por favor, tente novamente.', 'error');
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Carrega foto salva se existir
    if (dashboardState.personagem.foto) {
        atualizarFotoPreview(dashboardState.personagem.foto);
    }
}

function atualizarFotoPreview(fotoData) {
    const photoPreview = document.getElementById('photo-preview');
    const photoControls = document.getElementById('photo-controls');
    
    if (!photoPreview) return;
    
    // Remove placeholder se existir
    const placeholder = photoPreview.querySelector('.photo-placeholder');
    if (placeholder) {
        placeholder.remove();
    }
    
    // Remove imagem antiga se existir
    const imgAntiga = photoPreview.querySelector('img');
    if (imgAntiga) {
        imgAntiga.remove();
    }
    
    // Cria nova imagem
    const img = document.createElement('img');
    img.src = fotoData;
    img.alt = 'Foto do Personagem';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';
    
    // Adiciona animação
    img.style.opacity = '0';
    img.style.transform = 'scale(0.9)';
    
    photoPreview.appendChild(img);
    
    // Animação de entrada
    setTimeout(() => {
        img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
    }, 10);
    
    // Mostra controles
    if (photoControls) {
        photoControls.style.display = 'flex';
        setTimeout(() => {
            photoControls.style.opacity = '1';
            photoControls.style.transform = 'translateY(0)';
        }, 300);
    }
    
    // Adiciona classe para indicar que tem foto
    photoPreview.classList.add('has-photo');
}

function removerFoto() {
    if (confirm('Tem certeza que deseja remover a foto do personagem?')) {
        const photoPreview = document.getElementById('photo-preview');
        const photoControls = document.getElementById('photo-controls');
        const uploadInput = document.getElementById('char-upload');
        
        // Remove imagem
        const img = photoPreview.querySelector('img');
        if (img) {
            img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            img.style.opacity = '0';
            img.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                img.remove();
                
                // Restaura placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'photo-placeholder';
                placeholder.innerHTML = `
                    <i class="fas fa-user-circle"></i>
                    <span>Clique para adicionar foto</span>
                    <small>Recomendado: 300x400px</small>
                `;
                
                photoPreview.appendChild(placeholder);
                photoPreview.classList.remove('has-photo');
                
                // Esconde controles com animação
                if (photoControls) {
                    photoControls.style.opacity = '0';
                    photoControls.style.transform = 'translateY(10px)';
                    setTimeout(() => {
                        photoControls.style.display = 'none';
                    }, 300);
                }
                
                // Limpa input de upload
                if (uploadInput) {
                    uploadInput.value = '';
                }
                
                // Remove do estado
                dashboardState.personagem.foto = null;
                salvarDadosDashboard();
                
                mostrarNotificacao('Foto removida com sucesso.', 'info');
            }, 300);
        }
    }
}

// ===== FUNÇÕES DE INICIALIZAÇÃO =====

function inicializarDashboard() {
    console.log('📊 Inicializando Dashboard GURPS...');
    
    // 1. Carrega dados salvos
    carregarDadosDashboard();
    
    // 2. Configura eventos
    configurarEventosDashboard();
    
    // 3. Configura upload de foto
    configurarUploadFoto();
    
    // 4. Configura sincronização em tempo real
    configurarSincronizacaoTempoReal();
    
    // 5. Configura atualização de tempo
    configurarAtualizacaoTempo();
    
    // 6. Inicializa com valores
    sincronizarAtributosDashboard(); // Primeira sincronização
    atualizarDashboardCompleto();
    
    console.log('✅ Dashboard inicializado');
}

function configurarEventosDashboard() {
    // Identificação
    const nomeInput = document.getElementById('char-name');
    const tipoInput = document.getElementById('char-type');
    const jogadorInput = document.getElementById('char-player');
    
    if (nomeInput) {
        nomeInput.addEventListener('input', debounce(function() {
            dashboardState.personagem.nome = this.value;
            salvarDadosDashboard();
        }, 500));
    }
    
    if (tipoInput) {
        tipoInput.addEventListener('input', debounce(function() {
            dashboardState.personagem.tipo = this.value;
            salvarDadosDashboard();
        }, 500));
    }
    
    if (jogadorInput) {
        jogadorInput.addEventListener('input', debounce(function() {
            dashboardState.personagem.jogador = this.value;
            salvarDadosDashboard();
        }, 500));
    }
    
    // Sistema de Pontos
    const pontosIniciais = document.getElementById('start-points');
    const limiteDesvantagens = document.getElementById('dis-limit');
    
    if (pontosIniciais) {
        pontosIniciais.addEventListener('change', function() {
            const valor = parseInt(this.value) || 100;
            if (valor < 0) {
                this.value = 0;
                dashboardState.personagem.pontos.iniciais = 0;
            } else if (valor > 1000) {
                this.value = 1000;
                dashboardState.personagem.pontos.iniciais = 1000;
            } else {
                dashboardState.personagem.pontos.iniciais = valor;
            }
            atualizarCustosAtributos();
            salvarDadosDashboard();
        });
    }
    
    if (limiteDesvantagens) {
        limiteDesvantagens.addEventListener('change', function() {
            const valor = parseInt(this.value) || -75;
            if (valor > 0) {
                this.value = 0;
                dashboardState.personagem.pontos.limiteDesvantagens = 0;
            } else if (valor < -200) {
                this.value = -200;
                dashboardState.personagem.pontos.limiteDesvantagens = -200;
            } else {
                dashboardState.personagem.pontos.limiteDesvantagens = valor;
            }
            verificarLimiteDesvantagens();
            salvarDadosDashboard();
        });
    }
    
    // Características Físicas
    const descricaoFisica = document.getElementById('phys-description');
    if (descricaoFisica) {
        descricaoFisica.addEventListener('input', debounce(function() {
            dashboardState.personagem.caracteristicasFisicas.descricao = this.value;
            salvarDadosDashboard();
        }, 500));
    }
    
    // Configura botões de controle da foto
    const editBtn = document.querySelector('.edit-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    
    if (editBtn) {
        editBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            document.getElementById('char-upload').click();
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removerFoto();
        });
    }
}

function configurarSincronizacaoTempoReal() {
    console.log('⏱️ Configurando sincronização em tempo real...');
    
    // 1. Sincroniza a cada 500ms
    setInterval(sincronizarAtributosDashboard, 500);
    
    // 2. Monitora eventos de storage (se abrir em outra aba)
    window.addEventListener('storage', function(e) {
        if (e.key === 'gurps_atributos') {
            console.log('📡 Evento de storage detectado, sincronizando...');
            setTimeout(sincronizarAtributosDashboard, 100);
        }
    });
    
    // 3. Força sincronização ao focar na aba
    window.addEventListener('focus', function() {
        console.log('🎯 Dashboard em foco, sincronizando...');
        setTimeout(sincronizarAtributosDashboard, 100);
    });
}

function configurarAtualizacaoTempo() {
    function atualizarRelogio() {
        const agora = new Date();
        const hora = agora.getHours().toString().padStart(2, '0');
        const minuto = agora.getMinutes().toString().padStart(2, '0');
        const segundo = agora.getSeconds().toString().padStart(2, '0');
        
        const timeElement = document.getElementById('current-time');
        if (timeElement) {
            timeElement.textContent = `${hora}:${minuto}:${segundo}`;
        }
        
        dashboardState.ultimaAtualizacao = agora;
    }
    
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
}

// ===== FUNÇÕES DE ATUALIZAÇÃO DO DASHBOARD =====

function atualizarDashboardCompleto() {
    atualizarIdentificacao();
    atualizarCaracteristicasFisicas();
    atualizarSistemaPontos();
    atualizarStatusSocial();
    atualizarEquipamento();
    atualizarResumo();
    atualizarTimestamp();
}

function atualizarIdentificacao() {
    const nomeElement = document.getElementById('char-name');
    const tipoElement = document.getElementById('char-type');
    const jogadorElement = document.getElementById('char-player');
    
    if (nomeElement && dashboardState.personagem.nome) {
        nomeElement.value = dashboardState.personagem.nome;
    }
    
    if (tipoElement && dashboardState.personagem.tipo) {
        tipoElement.value = dashboardState.personagem.tipo;
    }
    
    if (jogadorElement && dashboardState.personagem.jogador) {
        jogadorElement.value = dashboardState.personagem.jogador;
    }
}

function atualizarCaracteristicasFisicas() {
    const fisicas = dashboardState.personagem.caracteristicasFisicas;
    
    document.getElementById('phys-height').textContent = fisicas.altura;
    document.getElementById('phys-weight').textContent = fisicas.peso;
    document.getElementById('phys-age').textContent = fisicas.idade;
    document.getElementById('phys-appearance').textContent = fisicas.aparência;
    
    const descricaoElement = document.getElementById('phys-description');
    if (descricaoElement) {
        descricaoElement.value = fisicas.descricao || '';
    }
}

function atualizarSistemaPontos() {
    const pontos = dashboardState.personagem.pontos;
    
    const pontosIniciaisElement = document.getElementById('start-points');
    if (pontosIniciaisElement) {
        pontosIniciaisElement.value = pontos.iniciais;
    }
    
    document.getElementById('points-adv').textContent = pontos.vantagens;
    document.getElementById('points-dis').textContent = pontos.desvantagens;
    document.getElementById('points-skills').textContent = pontos.pericias;
    document.getElementById('points-spells').textContent = pontos.magias;
    
    // Verifica limite de desvantagens
    verificarLimiteDesvantagens();
}

function verificarLimiteDesvantagens() {
    const limiteDesvElement = document.getElementById('dis-limit');
    if (limiteDesvElement) {
        const limite = parseInt(limiteDesvElement.value) || -75;
        const desvantagens = Math.abs(dashboardState.personagem.pontos.desvantagens);
        
        if (desvantagens > Math.abs(limite)) {
            limiteDesvElement.classList.add('excedido');
            mostrarNotificacao(`Atenção: Limite de desvantagens excedido em ${desvantagens - Math.abs(limite)} pontos!`, 'warning');
        } else {
            limiteDesvElement.classList.remove('excedido');
        }
    }
}

function atualizarStatusSocial() {
    const status = dashboardState.personagem.statusSocial;
    
    document.getElementById('wealth-level').textContent = status.riqueza;
    document.getElementById('status-mod').textContent = status.status;
    document.getElementById('rep-mod').textContent = status.reputacao;
    document.getElementById('app-mod').textContent = status.aparência;
    document.getElementById('reaction-total').textContent = `+${status.reacao}`;
    
    const custoRiqueza = {
        "Pobre": -25,
        "Empobrecido": -15,
        "Médio": 0,
        "Confortável": 10,
        "Rico": 20,
        "Muito Rico": 30,
        "Filantropo": 50
    };
    
    const custo = custoRiqueza[status.riqueza] || 0;
    const wealthCostElement = document.querySelector('.wealth-cost');
    if (wealthCostElement) {
        wealthCostElement.textContent = `[${custo >= 0 ? '+' : ''}${custo} pts]`;
    }
}

function atualizarEquipamento() {
    const equip = dashboardState.personagem.equipamento;
    
    document.getElementById('equip-weight').textContent = `${equip.peso.toFixed(1)} kg`;
    document.getElementById('equip-value').textContent = `$${equip.valor}`;
    
    atualizarBarraCarga(equip.peso);
}

function atualizarBarraCarga(peso) {
    const barraFill = document.getElementById('enc-fill');
    const encNote = document.getElementById('enc-note');
    const encLevel = document.getElementById('enc-level');
    
    if (!barraFill || !encNote || !encLevel) return;
    
    let nivel = "Nenhuma";
    let porcentagem = 0;
    const st = dashboardState.personagem.atributos.ST;
    
    // Calcula limites baseados na ST
    const cargaNenhuma = st * 1.0;
    const cargaLeve = st * 2.0;
    const cargaMedia = st * 3.0;
    const cargaPesada = st * 6.0;
    const cargaMuitoPesada = st * 10.0;
    
    if (peso <= cargaNenhuma) {
        nivel = "Nenhuma";
        porcentagem = (peso / cargaNenhuma) * 100;
        encNote.textContent = `Até ${cargaNenhuma.toFixed(1)} kg`;
        barraFill.style.background = 'linear-gradient(90deg, var(--accent-green), var(--primary-gold))';
    } else if (peso <= cargaLeve) {
        nivel = "Leve";
        porcentagem = (peso / cargaLeve) * 100;
        encNote.textContent = `Até ${cargaLeve.toFixed(1)} kg`;
        barraFill.style.background = 'linear-gradient(90deg, #4CAF50, #8BC34A)';
    } else if (peso <= cargaMedia) {
        nivel = "Média";
        porcentagem = (peso / cargaMedia) * 100;
        encNote.textContent = `Até ${cargaMedia.toFixed(1)} kg`;
        barraFill.style.background = 'linear-gradient(90deg, #FFC107, #FF9800)';
    } else if (peso <= cargaPesada) {
        nivel = "Pesada";
        porcentagem = (peso / cargaPesada) * 100;
        encNote.textContent = `Até ${cargaPesada.toFixed(1)} kg`;
        barraFill.style.background = 'linear-gradient(90deg, #FF9800, #F44336)';
    } else {
        nivel = "Muito Pesada";
        porcentagem = Math.min((peso / cargaMuitoPesada) * 100, 100);
        encNote.textContent = `Acima de ${cargaPesada.toFixed(1)} kg`;
        barraFill.style.background = 'linear-gradient(90deg, #F44336, #D32F2F)';
    }
    
    // Animação suave da barra
    barraFill.style.transition = 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    barraFill.style.width = `${Math.min(porcentagem, 100)}%`;
    
    // Atualiza nível
    dashboardState.personagem.equipamento.carga = nivel;
    encLevel.textContent = nivel;
    
    // Efeito visual
    encLevel.classList.add('updated');
    setTimeout(() => encLevel.classList.remove('updated'), 500);
}

function atualizarResumo() {
    const resumo = dashboardState.personagem.resumo;
    
    document.getElementById('sum-advantages').textContent = resumo.vantagens;
    document.getElementById('sum-disadvantages').textContent = resumo.desvantagens;
    document.getElementById('sum-skills').textContent = resumo.pericias;
    document.getElementById('sum-spells').textContent = resumo.magias;
    document.getElementById('sum-items').textContent = resumo.itens;
    document.getElementById('sum-languages').textContent = resumo.idiomas;
}

function atualizarTimestamp() {
    const agora = new Date();
    const dataFormatada = agora.toLocaleDateString('pt-BR');
    const horaFormatada = agora.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = `${dataFormatada} ${horaFormatada}`;
    }
}

// ===== FUNÇÕES UTILITÁRIAS =====

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function mostrarNotificacao(mensagem, tipo = 'info') {
    // Remove notificação anterior se existir
    const notificacaoAnterior = document.querySelector('.dashboard-notification');
    if (notificacaoAnterior) {
        notificacaoAnterior.remove();
    }
    
    // Cria nova notificação
    const notificacao = document.createElement('div');
    notificacao.className = `dashboard-notification ${tipo}`;
    notificacao.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : tipo === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${mensagem}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Adiciona ao dashboard
    const dashboard = document.querySelector('.dashboard-gurps');
    if (dashboard) {
        dashboard.appendChild(notificacao);
        
        // Animação de entrada
        setTimeout(() => {
            notificacao.style.opacity = '1';
            notificacao.style.transform = 'translateY(0)';
        }, 10);
        
        // Configura botão de fechar
        const closeBtn = notificacao.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notificacao.style.opacity = '0';
                notificacao.style.transform = 'translateY(-20px)';
                setTimeout(() => notificacao.remove(), 300);
            });
        }
        
        // Remove automaticamente após 5 segundos
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.style.opacity = '0';
                notificacao.style.transform = 'translateY(-20px)';
                setTimeout(() => notificacao.remove(), 300);
            }
        }, 5000);
    }
}

// ===== FUNÇÕES DE SALVAMENTO E CARREGAMENTO =====

function salvarDadosDashboard() {
    try {
        localStorage.setItem('gurps_dashboard', JSON.stringify(dashboardState));
        console.log('💾 Dashboard salvo');
    } catch (error) {
        console.warn('Não foi possível salvar dashboard:', error);
    }
}

function carregarDadosDashboard() {
    try {
        const dadosSalvos = localStorage.getItem('gurps_dashboard');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            
            // Mescla dados salvos com estado padrão
            dashboardState = {
                ...dashboardState,
                ...dados,
                personagem: {
                    ...dashboardState.personagem,
                    ...(dados.personagem || {})
                }
            };
            
            console.log('📂 Dashboard carregado do localStorage');
            return true;
        }
    } catch (error) {
        console.warn('Não foi possível carregar dashboard:', error);
    }
    return false;
}

// ===== FUNÇÕES PÚBLICAS =====

function atualizarResumoContagens(vantagens, desvantagens, pericias, magias, itens, idiomas) {
    dashboardState.personagem.resumo = {
        vantagens: vantagens || 0,
        desvantagens: desvantagens || 0,
        pericias: pericias || 0,
        magias: magias || 0,
        itens: itens || 0,
        idiomas: idiomas || 1
    };
    
    dashboardState.personagem.pontos.vantagens = vantagens || 0;
    dashboardState.personagem.pontos.desvantagens = -(desvantagens || 0);
    dashboardState.personagem.pontos.pericias = pericias || 0;
    dashboardState.personagem.pontos.magias = magias || 0;
    
    atualizarResumo();
    atualizarCustosAtributos();
    verificarLimiteDesvantagens();
    salvarDadosDashboard();
}

function atualizarEquipamentoContagem(peso, valor) {
    dashboardState.personagem.equipamento.peso = peso || 0;
    dashboardState.personagem.equipamento.valor = valor || 0;
    
    atualizarEquipamento();
    atualizarResumoContagens(
        dashboardState.personagem.resumo.vantagens,
        dashboardState.personagem.resumo.desvantagens,
        dashboardState.personagem.resumo.pericias,
        dashboardState.personagem.resumo.magias,
        Math.max(Math.floor(peso / 2), 0),
        dashboardState.personagem.resumo.idiomas
    );
}

function atualizarStatusSocialValores(riqueza, status, reputacao, aparência, reacao) {
    dashboardState.personagem.statusSocial = {
        riqueza: riqueza || "Médio",
        status: status || 0,
        reputacao: reputacao || 0,
        aparência: aparência || 0,
        reacao: reacao || 0
    };
    
    atualizarStatusSocial();
    salvarDadosDashboard();
}

function atualizarCaracteristicasFisicasValores(altura, peso, idade, aparência, descricao) {
    dashboardState.personagem.caracteristicasFisicas = {
        altura: altura || "1.70 m",
        peso: peso || "70 kg",
        idade: idade || "25 anos",
        aparência: aparência || "Comum",
        descricao: descricao || ""
    };
    
    atualizarCaracteristicasFisicas();
    salvarDadosDashboard();
}

// ===== INICIALIZAÇÃO =====

function initDashboard() {
    console.log('🚀 Inicializando Dashboard GURPS...');
    
    // Adiciona estilos para notificações
    const style = document.createElement('style');
    style.textContent = `
        .dashboard-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(40, 30, 15, 0.95), rgba(30, 22, 10, 0.95));
            border: 2px solid var(--primary-gold);
            border-radius: 10px;
            padding: 15px 20px;
            display: flex;
            align-items: center;
            gap: 15px;
            color: var(--text-gold);
            font-family: 'Cinzel', serif;
            font-size: 0.95rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.4);
            z-index: 10000;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s ease, transform 0.3s ease;
            max-width: 400px;
            backdrop-filter: blur(10px);
        }
        
        .dashboard-notification.success {
            border-color: #4CAF50;
            background: linear-gradient(135deg, rgba(46, 125, 50, 0.9), rgba(27, 94, 32, 0.9));
        }
        
        .dashboard-notification.error {
            border-color: #F44336;
            background: linear-gradient(135deg, rgba(211, 47, 47, 0.9), rgba(183, 28, 28, 0.9));
        }
        
        .dashboard-notification.warning {
            border-color: #FF9800;
            background: linear-gradient(135deg, rgba(245, 124, 0, 0.9), rgba(230, 81, 0, 0.9));
        }
        
        .dashboard-notification.info {
            border-color: #2196F3;
            background: linear-gradient(135deg, rgba(30, 136, 229, 0.9), rgba(13, 71, 161, 0.9));
        }
        
        .dashboard-notification i {
            font-size: 1.2rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            cursor: pointer;
            padding: 5px;
            margin-left: auto;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .updated {
            animation: pulse 0.5s ease;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        .excedido {
            color: #ff6b6b !important;
            animation: pulse 2s infinite;
        }
        
        .positivo {
            color: #4CAF50 !important;
        }
    `;
    document.head.appendChild(style);
    
    // Aguarda um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        try {
            inicializarDashboard();
            console.log('🎉 Dashboard pronto! Os atributos serão atualizados em tempo real.');
            
            // Mostra notificação de boas-vindas
            mostrarNotificacao('Dashboard GURPS inicializado com sucesso!', 'success');
            
            // Teste inicial
            console.log('Valores iniciais dos atributos:', dashboardState.personagem.atributos);
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
            mostrarNotificacao('Erro ao inicializar o dashboard. Por favor, recarregue a página.', 'error');
        }
    }, 100);
}

// ===== EXPORTA FUNÇÕES =====

window.initDashboard = initDashboard;
window.atualizarResumoContagens = atualizarResumoContagens;
window.atualizarEquipamentoContagem = atualizarEquipamentoContagem;
window.atualizarStatusSocialValores = atualizarStatusSocialValores;
window.atualizarCaracteristicasFisicasValores = atualizarCaracteristicasFisicasValores;
window.sincronizarAtributosDashboard = sincronizarAtributosDashboard;
window.removerFoto = removerFoto;

// Inicializa automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('dashboard')) {
            initDashboard();
        }
    });
} else {
    if (document.getElementById('dashboard')) {
        initDashboard();
    }
}

// Debug: Adiciona botão de teste no console
window.debugDashboard = function() {
    console.log('=== DEBUG DASHBOARD ===');
    console.log('Estado:', dashboardState);
    console.log('Atributos localStorage:', localStorage.getItem('gurps_atributos'));
    console.log('Dashboard localStorage:', localStorage.getItem('gurps_dashboard'));
    
    // Força sincronização
    sincronizarAtributosDashboard();
    
    // Testa notificação
    mostrarNotificacao('Teste de notificação do dashboard!', 'info');
};