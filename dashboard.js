// ===========================================
// DASHBOARD.JS - Sistema Completo de Dashboard GURPS
// ===========================================

// Estado global do dashboard
let dashboardState = {
    personagem: {
        nome: "",
        tipo: "",
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
            dashboardState.personagem.atributos.ST = dadosAtributos.atributos.ST || 10;
            dashboardState.personagem.atributos.DX = dadosAtributos.atributos.DX || 10;
            dashboardState.personagem.atributos.IQ = dadosAtributos.atributos.IQ || 10;
            dashboardState.personagem.atributos.HT = dadosAtributos.atributos.HT || 10;
            
            // Atualiza valores na tela
            atualizarAtributosTela();
        }
        
        // Atualiza bônus
        if (dadosAtributos.bonus) {
            dashboardState.personagem.bonus.PV = dadosAtributos.bonus.PV || 0;
            dashboardState.personagem.bonus.PF = dadosAtributos.bonus.PF || 0;
            dashboardState.personagem.bonus.Vontade = dadosAtributos.bonus.Vontade || 0;
            dashboardState.personagem.bonus.Percepcao = dadosAtributos.bonus.Percepcao || 0;
            dashboardState.personagem.bonus.Deslocamento = dadosAtributos.bonus.Deslocamento || 0;
            
            // Atualiza atributos secundários
            atualizarAtributosSecundariosTela();
        }
        
        // Atualiza custos
        atualizarCustosAtributos();
        
        // Atualiza timestamp
        atualizarTimestamp();
        
        console.log('🔄 Atributos sincronizados:', dashboardState.personagem.atributos);
    }
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
}

// 4. Função para atualizar detalhes dos atributos
function atualizarDetalhesAtributos() {
    const ST = dashboardState.personagem.atributos.ST;
    const DX = dashboardState.personagem.atributos.DX;
    const IQ = dashboardState.personagem.atributos.IQ;
    
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
    
    // Vontade base = IQ
    const vontadeBase = IQ;
    
    document.getElementById('attr-st-details').textContent = `Dano: ${dano}`;
    document.getElementById('attr-dx-details').textContent = `Esquiva: ${esquiva}`;
    document.getElementById('attr-iq-details').textContent = `Vontade: ${vontadeBase}`;
    document.getElementById('attr-ht-details').textContent = `Resistência: ${dashboardState.personagem.atributos.HT}`;
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
    
    // Atualiza também o detalhe de vontade no atributo IQ
    document.getElementById('attr-iq-details').textContent = `Vontade: ${vontadeTotal}`;
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
    dashboardState.personagem.pontos.gastos = totalAtributos + 
        dashboardState.personagem.pontos.vantagens + 
        dashboardState.personagem.pontos.pericias + 
        dashboardState.personagem.pontos.magias +
        Math.abs(dashboardState.personagem.pontos.desvantagens);
    
    // Calcula saldo
    const saldo = dashboardState.personagem.pontos.iniciais - dashboardState.personagem.pontos.gastos;
    dashboardState.personagem.pontos.saldo = Math.max(saldo, 0);
    
    // Atualiza na tela
    document.getElementById('points-balance').textContent = dashboardState.personagem.pontos.saldo;
    
    // Destaca se estiver negativo
    const balanceElement = document.getElementById('points-balance');
    if (saldo < 0) {
        balanceElement.style.color = '#ff6b6b';
        balanceElement.style.fontWeight = 'bold';
    } else {
        balanceElement.style.color = '';
        balanceElement.style.fontWeight = '';
    }
}

// ===== FUNÇÕES DE INICIALIZAÇÃO =====

function inicializarDashboard() {
    console.log('📊 Inicializando Dashboard GURPS...');
    
    // 1. Carrega dados salvos
    carregarDadosDashboard();
    
    // 2. Configura eventos
    configurarEventosDashboard();
    
    // 3. Configura sincronização em tempo real
    configurarSincronizacaoTempoReal();
    
    // 4. Inicializa com valores
    sincronizarAtributosDashboard(); // Primeira sincronização
    atualizarDashboardCompleto();
    
    console.log('✅ Dashboard inicializado');
}

function configurarEventosDashboard() {
    // Identificação
    const nomeInput = document.getElementById('char-name');
    const tipoInput = document.getElementById('char-type');
    
    if (nomeInput) {
        nomeInput.addEventListener('input', function() {
            dashboardState.personagem.nome = this.value;
            salvarDadosDashboard();
        });
    }
    
    if (tipoInput) {
        tipoInput.addEventListener('input', function() {
            dashboardState.personagem.tipo = this.value;
            salvarDadosDashboard();
        });
    }
    
    // Sistema de Pontos
    const pontosIniciais = document.getElementById('start-points');
    const limiteDesvantagens = document.getElementById('dis-limit');
    
    if (pontosIniciais) {
        pontosIniciais.addEventListener('change', function() {
            dashboardState.personagem.pontos.iniciais = parseInt(this.value) || 100;
            atualizarCustosAtributos(); // Recalcula saldo
            salvarDadosDashboard();
        });
    }
    
    if (limiteDesvantagens) {
        limiteDesvantagens.addEventListener('change', function() {
            salvarDadosDashboard();
        });
    }
    
    // Características Físicas
    const descricaoFisica = document.getElementById('phys-description');
    if (descricaoFisica) {
        descricaoFisica.addEventListener('input', function() {
            dashboardState.personagem.caracteristicasFisicas.descricao = this.value;
            salvarDadosDashboard();
        });
    }
    
    // Configura upload de foto
    configurarUploadFoto();
}

function configurarSincronizacaoTempoReal() {
    console.log('⏱️ Configurando sincronização em tempo real...');
    
    // 1. Sincroniza a cada 500ms (muito rápido)
    setInterval(sincronizarAtributosDashboard, 500);
    
    // 2. Também monitora eventos de storage (se abrir em outra aba)
    window.addEventListener('storage', function(e) {
        if (e.key === 'gurps_atributos') {
            console.log('📡 Evento de storage detectado, sincronizando...');
            setTimeout(sincronizarAtributosDashboard, 100);
        }
    });
    
    // 3. Monitora mudanças nos inputs dos atributos (se estiverem na mesma página)
    ['ST', 'DX', 'IQ', 'HT'].forEach(atributo => {
        const input = document.getElementById(atributo);
        if (input) {
            input.addEventListener('input', function() {
                setTimeout(sincronizarAtributosDashboard, 300);
            });
        }
    });
    
    // 4. Atualiza o relógio
    configurarAtualizacaoTempo();
}

function configurarUploadFoto() {
    const uploadInput = document.getElementById('char-upload');
    const photoPreview = document.getElementById('photo-preview');
    
    if (!uploadInput || !photoPreview) return;
    
    uploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '5px';
                
                photoPreview.innerHTML = '';
                photoPreview.appendChild(img);
                photoPreview.classList.add('has-photo');
                
                dashboardState.personagem.foto = e.target.result;
                salvarDadosDashboard();
            };
            
            reader.readAsDataURL(file);
        }
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
    
    if (nomeElement && dashboardState.personagem.nome) {
        nomeElement.value = dashboardState.personagem.nome;
    }
    
    if (tipoElement && dashboardState.personagem.tipo) {
        tipoElement.value = dashboardState.personagem.tipo;
    }
    
    // Restaura foto
    if (dashboardState.personagem.foto) {
        const photoPreview = document.getElementById('photo-preview');
        if (photoPreview) {
            const img = document.createElement('img');
            img.src = dashboardState.personagem.foto;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '5px';
            
            photoPreview.innerHTML = '';
            photoPreview.appendChild(img);
            photoPreview.classList.add('has-photo');
        }
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
    
    // O saldo é atualizado em atualizarCustosAtributos()
    
    // Verifica limite de desvantagens
    const limiteDesvElement = document.getElementById('dis-limit');
    if (limiteDesvElement) {
        const limite = parseInt(limiteDesvElement.value) || -75;
        if (Math.abs(pontos.desvantagens) > Math.abs(limite)) {
            limiteDesvElement.style.borderColor = '#f44336';
            limiteDesvElement.style.color = '#f44336';
        } else {
            limiteDesvElement.style.borderColor = '';
            limiteDesvElement.style.color = '';
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
    document.querySelector('.wealth-cost').textContent = `[${custo >= 0 ? '+' : ''}${custo} pts]`;
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
    
    if (!barraFill || !encNote) return;
    
    let nivel = "Nenhuma";
    let porcentagem = 0;
    let st = dashboardState.personagem.atributos.ST;
    
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
    } else if (peso <= cargaLeve) {
        nivel = "Leve";
        porcentagem = (peso / cargaLeve) * 100;
        encNote.textContent = `Até ${cargaLeve.toFixed(1)} kg`;
    } else if (peso <= cargaMedia) {
        nivel = "Média";
        porcentagem = (peso / cargaMedia) * 100;
        encNote.textContent = `Até ${cargaMedia.toFixed(1)} kg`;
    } else if (peso <= cargaPesada) {
        nivel = "Pesada";
        porcentagem = (peso / cargaPesada) * 100;
        encNote.textContent = `Até ${cargaPesada.toFixed(1)} kg`;
    } else {
        nivel = "Muito Pesada";
        porcentagem = Math.min((peso / cargaMuitoPesada) * 100, 100);
        encNote.textContent = `Acima de ${cargaPesada.toFixed(1)} kg`;
    }
    
    barraFill.style.width = `${Math.min(porcentagem, 100)}%`;
    
    if (nivel === "Muito Pesada") {
        barraFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff5252)';
    } else if (nivel === "Pesada") {
        barraFill.style.background = 'linear-gradient(90deg, #ffa726, #ff9800)';
    } else {
        barraFill.style.background = 'linear-gradient(90deg, var(--accent-green), var(--primary-gold))';
    }
    
    dashboardState.personagem.equipamento.carga = nivel;
    document.getElementById('enc-level').textContent = nivel;
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

// ===== FUNÇÕES DE SALVAMENTO E CARREGAMENTO =====

function salvarDadosDashboard() {
    try {
        localStorage.setItem('gurps_dashboard', JSON.stringify(dashboardState));
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
    atualizarCustosAtributos(); // Recalcula pontos
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

// ===== INICIALIZAÇÃO =====

function initDashboard() {
    console.log('🚀 Inicializando Dashboard GURPS...');
    
    // Aguarda um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        try {
            inicializarDashboard();
            console.log('🎉 Dashboard pronto! Os atributos serão atualizados em tempo real.');
            
            // Teste inicial
            console.log('Valores iniciais dos atributos:', dashboardState.personagem.atributos);
        } catch (error) {
            console.error('❌ Erro ao inicializar dashboard:', error);
        }
    }, 100);
}

// ===== EXPORTA FUNÇÕES =====

window.initDashboard = initDashboard;
window.atualizarResumoContagens = atualizarResumoContagens;
window.atualizarEquipamentoContagem = atualizarEquipamentoContagem;
window.sincronizarAtributosDashboard = sincronizarAtributosDashboard; // Para testes

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
    sincronizarAtributosDashboard();
};