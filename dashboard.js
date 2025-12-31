// ===========================================
// DASHBOARD.JS - Sistema de Dashboard GURPS
// ===========================================

// Estado global do dashboard
let dashboardState = {
    personagem: {
        nome: "",
        tipo: "",
        foto: null,
        atributos: {
            ST: 10,
            DX: 10,
            IQ: 10,
            HT: 10
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

// ===== FUNÇÕES DE INICIALIZAÇÃO =====

function inicializarDashboard() {
    console.log('📊 Inicializando Dashboard GURPS...');
    
    // Carrega dados salvos
    carregarDadosDashboard();
    
    // Configura eventos
    configurarEventosDashboard();
    
    // Configura atualização automática de tempo
    configurarAtualizacaoTempo();
    
    // Configura upload de foto
    configurarUploadFoto();
    
    // Inicializa com valores padrão
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
            dashboardState.personagem.pontos.iniciais = parseInt(this.value);
            atualizarSistemaPontos();
            salvarDadosDashboard();
        });
    }
    
    if (limiteDesvantagens) {
        limiteDesvantagens.addEventListener('change', function() {
            // Apenas atualiza o estado, o cálculo será feito em atualizarSistemaPontos()
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
    
    // Atualização automática dos atributos quando mudarem na aba de atributos
    configurarObservadorAtributos();
}

function configurarObservadorAtributos() {
    // Monitora mudanças no localStorage dos atributos
    window.addEventListener('storage', function(e) {
        if (e.key === 'gurps_atributos') {
            console.log('🔄 Atributos atualizados no localStorage');
            sincronizarAtributos();
        }
    });
    
    // Também verifica periodicamente
    setInterval(sincronizarAtributos, 1000);
}

function sincronizarAtributos() {
    try {
        const dadosAtributos = localStorage.getItem('gurps_atributos');
        if (dadosAtributos) {
            const atributos = JSON.parse(dadosAtributos);
            
            // Atualiza os atributos principais no dashboard
            if (atributos.atributos) {
                dashboardState.personagem.atributos = atributos.atributos;
                
                // Atualiza valores na tela
                document.getElementById('attr-st').textContent = atributos.atributos.ST || 10;
                document.getElementById('attr-dx').textContent = atributos.atributos.DX || 10;
                document.getElementById('attr-iq').textContent = atributos.atributos.IQ || 10;
                document.getElementById('attr-ht').textContent = atributos.atributos.HT || 10;
                
                // Calcula danos baseados em ST
                atualizarDanosAtributos(atributos.atributos.ST);
                
                // Calcula esquiva baseada em DX
                const esquiva = 8 + Math.floor((atributos.atributos.DX - 10) / 2);
                document.getElementById('attr-dx-details').textContent = `Esquiva: ${esquiva}`;
                
                // Atualiza Vontade e Percepção baseados em IQ
                if (atributos.bonus) {
                    const vontade = (atributos.atributos.IQ || 10) + (atributos.bonus.Vontade || 0);
                    const percepcao = (atributos.atributos.IQ || 10) + (atributos.bonus.Percepcao || 0);
                    
                    document.getElementById('attr-iq-details').textContent = `Vontade: ${vontade}`;
                    document.getElementById('will-value').textContent = vontade;
                    document.getElementById('per-value').textContent = percepcao;
                }
            }
            
            // Atualiza atributos secundários
            if (atributos.bonus) {
                const ST = atributos.atributos?.ST || 10;
                const HT = atributos.atributos?.HT || 10;
                const DX = atributos.atributos?.DX || 10;
                
                // Pontos de Vida (PV = ST + bônus)
                const pvBase = ST;
                const pvBonus = atributos.bonus.PV || 0;
                const pvTotal = Math.max(pvBase + pvBonus, 1);
                
                document.getElementById('pv-current').textContent = pvTotal;
                document.getElementById('pv-max').textContent = pvTotal;
                
                // Pontos de Fadiga (PF = HT + bônus)
                const pfBase = HT;
                const pfBonus = atributos.bonus.PF || 0;
                const pfTotal = Math.max(pfBase + pfBonus, 1);
                
                document.getElementById('fp-current').textContent = pfTotal;
                document.getElementById('fp-max').textContent = pfTotal;
                
                // Deslocamento (HT+DX)/4 + bônus
                const deslocamentoBase = (HT + DX) / 4;
                const deslocamentoBonus = atributos.bonus.Deslocamento || 0;
                const deslocamentoTotal = (deslocamentoBase + deslocamentoBonus).toFixed(2);
                
                document.getElementById('move-value').textContent = deslocamentoTotal;
            }
            
            // Atualiza custo dos pontos
            atualizarCustosAtributos(atributos.atributos);
            
            // Atualiza timestamp
            atualizarTimestamp();
        }
    } catch (error) {
        console.warn('Erro ao sincronizar atributos:', error);
    }
}

function atualizarDanosAtributos(ST) {
    // Tabela de dano simplificada
    const danoTable = {
        1: "1d-6/1d-5", 2: "1d-6/1d-5", 3: "1d-5/1d-4", 4: "1d-5/1d-4",
        5: "1d-4/1d-3", 6: "1d-4/1d-3", 7: "1d-3/1d-2", 8: "1d-3/1d-2",
        9: "1d-2/1d-1", 10: "1d-2/1d", 11: "1d-1/1d+1", 12: "1d/1d+2",
        13: "1d/2d-1", 14: "1d/2d", 15: "1d+1/2d+1", 16: "1d+1/2d+2",
        17: "1d+2/3d-1", 18: "1d+2/3d", 19: "2d-1/3d+1", 20: "2d-1/3d+2"
    };
    
    const stKey = Math.min(Math.max(ST, 1), 20);
    const dano = danoTable[stKey] || "1d-2/1d";
    document.getElementById('attr-st-details').textContent = `Dano: ${dano}`;
}

function atualizarCustosAtributos(atributos) {
    const custoST = (atributos.ST - 10) * 10;
    const custoDX = (atributos.DX - 10) * 20;
    const custoIQ = (atributos.IQ - 10) * 20;
    const custoHT = (atributos.HT - 10) * 10;
    
    const totalAtributos = custoST + custoDX + custoIQ + custoHT;
    
    // Atualiza o saldo de pontos
    const pontosIniciais = dashboardState.personagem.pontos.iniciais;
    const outrosGastos = dashboardState.personagem.pontos.vantagens + 
                        dashboardState.personagem.pontos.pericias + 
                        dashboardState.personagem.pontos.magias +
                        Math.abs(dashboardState.personagem.pontos.desvantagens); // desvantagens são negativos
    
    const saldo = pontosIniciais - totalAtributos - outrosGastos;
    
    dashboardState.personagem.pontos.gastos = totalAtributos + outrosGastos;
    dashboardState.personagem.pontos.saldo = Math.max(saldo, 0);
    
    document.getElementById('points-balance').textContent = dashboardState.personagem.pontos.saldo;
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
                // Cria imagem
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'cover';
                img.style.borderRadius = '5px';
                
                // Limpa preview e adiciona imagem
                photoPreview.innerHTML = '';
                photoPreview.appendChild(img);
                
                // Salva no estado
                dashboardState.personagem.foto = e.target.result;
                salvarDadosDashboard();
                
                // Adiciona classe para indicar que tem foto
                photoPreview.classList.add('has-photo');
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
    
    // Atualiza imediatamente e a cada segundo
    atualizarRelogio();
    setInterval(atualizarRelogio, 1000);
}

// ===== FUNÇÕES DE ATUALIZAÇÃO DO DASHBOARD =====

function atualizarDashboardCompleto() {
    atualizarIdentificacao();
    atualizarAtributosPrincipais();
    atualizarAtributosSecundarios();
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
    
    // Restaura foto se existir
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

function atualizarAtributosPrincipais() {
    // Os atributos principais são atualizados via sincronizarAtributos()
    // Esta função mantém a consistência inicial
    sincronizarAtributos();
}

function atualizarAtributosSecundarios() {
    // Já é feito em sincronizarAtributos()
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
    document.getElementById('points-balance').textContent = pontos.saldo;
    
    // Atualiza limite de desvantagens
    const limiteDesvElement = document.getElementById('dis-limit');
    if (limiteDesvElement) {
        // Verifica se as desvantagens excedem o limite
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
    
    // Calcula custo da riqueza (simplificado)
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
    document.getElementById('enc-level').textContent = equip.carga;
    
    // Calcula barra de carga (simplificado)
    atualizarBarraCarga(equip.peso);
}

function atualizarBarraCarga(peso) {
    // Valores de exemplo baseados em ST 10
    const limites = {
        "Nenhuma": 10,
        "Leve": 20,
        "Média": 30,
        "Pesada": 40,
        "Muito Pesada": 50
    };
    
    const barraFill = document.getElementById('enc-fill');
    const encNote = document.getElementById('enc-note');
    
    if (!barraFill || !encNote) return;
    
    // Determina nível atual
    let nivel = "Nenhuma";
    let porcentagem = 0;
    
    if (peso <= 10) {
        nivel = "Nenhuma";
        porcentagem = (peso / 10) * 100;
        encNote.textContent = "Até 10 kg";
    } else if (peso <= 20) {
        nivel = "Leve";
        porcentagem = (peso / 20) * 100;
        encNote.textContent = "Até 20 kg";
    } else if (peso <= 30) {
        nivel = "Média";
        porcentagem = (peso / 30) * 100;
        encNote.textContent = "Até 30 kg";
    } else if (peso <= 40) {
        nivel = "Pesada";
        porcentagem = (peso / 40) * 100;
        encNote.textContent = "Até 40 kg";
    } else {
        nivel = "Muito Pesada";
        porcentagem = Math.min((peso / 50) * 100, 100);
        encNote.textContent = "Acima de 40 kg";
    }
    
    // Atualiza visual
    barraFill.style.width = `${Math.min(porcentagem, 100)}%`;
    
    // Muda cor baseado no nível
    if (nivel === "Muito Pesada") {
        barraFill.style.background = 'linear-gradient(90deg, #ff6b6b, #ff5252)';
    } else if (nivel === "Pesada") {
        barraFill.style.background = 'linear-gradient(90deg, #ffa726, #ff9800)';
    } else {
        barraFill.style.background = 'linear-gradient(90deg, var(--accent-green), var(--primary-gold))';
    }
    
    // Atualiza nível no estado
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
        minute: '2-digit' 
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
            
            console.log('📂 Dashboard carregado');
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
    
    // Atualiza pontos também
    dashboardState.personagem.pontos.vantagens = vantagens || 0;
    dashboardState.personagem.pontos.desvantagens = -(desvantagens || 0); // Negativo
    dashboardState.personagem.pontos.pericias = pericias || 0;
    dashboardState.personagem.pontos.magias = magias || 0;
    
    atualizarResumo();
    atualizarSistemaPontos();
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
        Math.floor(peso / 5) || 0, // Estimativa de itens baseada no peso
        dashboardState.personagem.resumo.idiomas
    );
}

// ===== INICIALIZAÇÃO =====

function initDashboard() {
    console.log('📊 Inicializando Dashboard...');
    
    // Aguarda um pouco para garantir que o DOM está pronto
    setTimeout(() => {
        inicializarDashboard();
        
        // Atualiza o dashboard periodicamente (a cada 5 segundos)
        setInterval(() => {
            sincronizarAtributos();
        }, 5000);
    }, 100);
}

// ===== EXPORTA FUNÇÕES =====

window.initDashboard = initDashboard;
window.atualizarResumoContagens = atualizarResumoContagens;
window.atualizarEquipamentoContagem = atualizarEquipamentoContagem;

// Inicializa automaticamente se a aba estiver visível
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        if (document.getElementById('dashboard')?.classList.contains('active')) {
            initDashboard();
        }
    });
} else {
    if (document.getElementById('dashboard')?.classList.contains('active')) {
        initDashboard();
    }
}