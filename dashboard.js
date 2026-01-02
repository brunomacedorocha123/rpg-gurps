// ===========================================
// DASHBOARD.JS - SISTEMA COMPLETO E INTEGRADO
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
  pesoEquipamentos: 0,
  // NOVO: Salvar foto
  fotoBase64: null,
  // NOVO: Sistema de integração
  sistemaEquipamentosConectado: false,
  equipamentosData: {
    dinheiro: 0,
    pesoAtual: 0,
    pesoMaximo: 0,
    nivelCargaAtual: 'nenhuma',
    penalidadesCarga: 'MOV +0 / DODGE +0'
  }
};

// ===========================================
// 1. SISTEMA DE SALVAMENTO DA FOTO
// ===========================================
function configurarUploadFotoComSalvamento() {
  const uploadInput = document.getElementById('char-upload');
  const photoPreview = document.getElementById('photo-preview');
  
  if (!uploadInput || !photoPreview) return;
  
  // 1.1. Carregar foto salva se existir
  carregarFotoSalva();
  
  // 1.2. Configurar novo upload
  uploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = function(event) {
        // Salvar em Base64
        dashboardState.fotoBase64 = event.target.result;
        
        // Atualizar preview
        photoPreview.innerHTML = '';
        const img = document.createElement('img');
        img.src = dashboardState.fotoBase64;
        img.alt = "Foto do Personagem";
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        
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
          dashboardState.fotoBase64 = null;
          salvarDadosDashboardNoFirebase();
        };
        
        photoPreview.appendChild(removeBtn);
        
        // Salvar automaticamente
        salvarDadosDashboardNoFirebase();
      };
      
      reader.readAsDataURL(file);
    }
  });
}

// Carregar foto salva
function carregarFotoSalva() {
  if (dashboardState.fotoBase64) {
    const photoPreview = document.getElementById('photo-preview');
    if (photoPreview) {
      photoPreview.innerHTML = '';
      const img = document.createElement('img');
      img.src = dashboardState.fotoBase64;
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
        const uploadInput = document.getElementById('char-upload');
        if (uploadInput) uploadInput.value = '';
        dashboardState.fotoBase64 = null;
        salvarDadosDashboardNoFirebase();
      };
      photoPreview.appendChild(removeBtn);
    }
  }
}

// ===========================================
// 2. SISTEMA DE PONTOS INICIAIS (SALVAR VALOR)
// ===========================================
function configurarPontosIniciaisComSalvamento() {
  const startPoints = document.getElementById('start-points');
  if (!startPoints) return;
  
  // Carregar valor salvo
  const pontosSalvos = localStorage.getItem('dashboard_pontos_iniciais');
  if (pontosSalvos) {
    startPoints.value = pontosSalvos;
    dashboardState.pontosIniciais = parseInt(pontosSalvos) || 100;
    
    // Atualizar cálculo imediatamente
    calcularSistemaPontos();
  }
  
  // Salvar quando mudar
  startPoints.addEventListener('change', function() {
    const valor = parseInt(this.value) || 100;
    dashboardState.pontosIniciais = valor;
    
    // Salvar no localStorage
    localStorage.setItem('dashboard_pontos_iniciais', valor.toString());
    
    // Salvar no Firebase
    salvarDadosDashboardNoFirebase();
    
    // Atualizar cálculo
    calcularSistemaPontos();
  });
}

// ===========================================
// 3. INTEGRAÇÃO COM SISTEMA DE EQUIPAMENTOS
// ===========================================
function configurarIntegracaoEquipamentos() {
  console.log('🔄 Configurando integração com sistema de equipamentos...');
  
  // 3.1. Tentar conectar com sistema de equipamentos
  conectarComSistemaEquipamentos();
  
  // 3.2. Configurar escuta de eventos
  document.addEventListener('equipamentosAtualizados', (e) => {
    if (e.detail) {
      atualizarDashboardComDadosEquipamentos(e.detail);
    }
  });
  
  // 3.3. Observar quando aba de equipamentos é aberta
  const abaEquipamento = document.getElementById('equipamento');
  if (abaEquipamento) {
    const observer = new MutationObserver(() => {
      if (abaEquipamento.classList.contains('active')) {
        // Quando equipamentos é aberto, tentar reconectar
        setTimeout(conectarComSistemaEquipamentos, 500);
      }
    });
    observer.observe(abaEquipamento, { attributes: true });
  }
  
  // 3.4. Atualização periódica (backup)
  setInterval(() => {
    if (dashboardState.sistemaEquipamentosConectado) {
      atualizarDadosEquipamentos();
    }
  }, 5000);
}

// Conectar com sistema de equipamentos
function conectarComSistemaEquipamentos() {
  if (window.sistemaEquipamentos) {
    console.log('✅ Sistema de equipamentos encontrado!');
    dashboardState.sistemaEquipamentosConectado = true;
    atualizarDadosEquipamentos();
  } else {
    // Tentar novamente em 1 segundo
    setTimeout(conectarComSistemaEquipamentos, 1000);
  }
}

// Atualizar dados dos equipamentos
function atualizarDadosEquipamentos() {
  if (!window.sistemaEquipamentos) return;
  
  const dados = {
    dinheiro: window.sistemaEquipamentos.dinheiro || 0,
    pesoAtual: window.sistemaEquipamentos.pesoAtual || 0,
    pesoMaximo: window.sistemaEquipamentos.pesoMaximo || 0,
    nivelCargaAtual: window.sistemaEquipamentos.nivelCargaAtual || 'nenhuma',
    penalidadesCarga: window.sistemaEquipamentos.penalidadesCarga || 'MOV +0 / DODGE +0'
  };
  
  atualizarDashboardComDadosEquipamentos(dados);
}

// Atualizar dashboard com dados dos equipamentos
function atualizarDashboardComDadosEquipamentos(dados) {
  // Salvar no estado
  dashboardState.equipamentosData = dados;
  
  // 3.5. ATUALIZAR DINHEIRO
  if (dados.dinheiro !== undefined) {
    dashboardState.dinheiro = dados.dinheiro;
    
    const dinheiroElem = document.getElementById('current-money');
    if (dinheiroElem) {
      dinheiroElem.textContent = `$${dados.dinheiro}`;
    }
    
    // Atualizar também no banner do equipamento (se existir)
    const dinheiroBanner = document.getElementById('dinheiroEquipamento');
    if (dinheiroBanner) {
      dinheiroBanner.textContent = `$${dados.dinheiro}`;
    }
    
    // Atualizar dinheiro disponível
    const dinheiroDisponivel = document.getElementById('dinheiro-disponivel');
    if (dinheiroDisponivel) {
      dinheiroDisponivel.textContent = `$${dados.dinheiro}`;
    }
  }
  
  // 3.6. ATUALIZAR PESO
  if (dados.pesoAtual !== undefined) {
    dashboardState.pesoEquipamentos = dados.pesoAtual;
    
    const pesoElem = document.getElementById('equip-weight');
    if (pesoElem) {
      pesoElem.textContent = `${dados.pesoAtual.toFixed(1)} kg`;
    }
    
    // Atualizar também na seção de carga da aba equipamentos
    const pesoAtualElem = document.getElementById('pesoAtual');
    if (pesoAtualElem) {
      pesoAtualElem.textContent = dados.pesoAtual.toFixed(1);
    }
  }
  
  // 3.7. ATUALIZAR NÍVEL DE CARGA
  if (dados.nivelCargaAtual !== undefined) {
    const nivelCargaElem = document.getElementById('enc-level-display');
    if (nivelCargaElem) {
      // Traduzir para português
      const nivelTraduzido = traduzirNivelCarga(dados.nivelCargaAtual);
      nivelCargaElem.textContent = nivelTraduzido;
      
      // Adicionar classe CSS
      nivelCargaElem.className = 'enc-value ' + dados.nivelCargaAtual.replace(' ', '-');
    }
    
    // Atualizar também na aba equipamentos
    const nivelCargaEquip = document.getElementById('nivelCarga');
    if (nivelCargaEquip) {
      nivelCargaEquip.textContent = dados.nivelCargaAtual.toUpperCase();
    }
  }
  
  // 3.8. ATUALIZAR LIMITES DE CARGA (baseado no ST)
  if (dados.pesoMaximo !== undefined && window.sistemaEquipamentos) {
    // Pegar capacidade de carga do sistema de equipamentos
    if (window.sistemaEquipamentos.capacidadeCarga) {
      const capacidade = window.sistemaEquipamentos.capacidadeCarga;
      
      const limitLeve = document.getElementById('limit-light');
      const limitMedia = document.getElementById('limit-medium');
      const limitHeavy = document.getElementById('limit-heavy');
      const limitExtreme = document.getElementById('limit-extreme');
      
      if (limitLeve) limitLeve.textContent = capacidade.leve.toFixed(1) + ' kg';
      if (limitMedia) limitMedia.textContent = capacidade.media.toFixed(1) + ' kg';
      if (limitHeavy) limitHeavy.textContent = capacidade.pesada.toFixed(1) + ' kg';
      if (limitExtreme) limitExtreme.textContent = capacidade.muitoPesada.toFixed(1) + ' kg';
    }
  }
  
  // 3.9. ATUALIZAR PESO MÁXIMO
  if (dados.pesoMaximo !== undefined) {
    const pesoMaximoElem = document.getElementById('pesoMaximo');
    if (pesoMaximoElem) {
      pesoMaximoElem.textContent = dados.pesoMaximo.toFixed(1);
    }
  }
  
  // 3.10. ATUALIZAR PENALIDADES
  if (dados.penalidadesCarga !== undefined) {
    const penalidadesElem = document.getElementById('penalidadesCarga');
    if (penalidadesElem) {
      penalidadesElem.textContent = dados.penalidadesCarga;
    }
  }
  
  console.log('📊 Dashboard atualizado com dados dos equipamentos');
}

// Traduzir nível de carga
function traduzirNivelCarga(nivel) {
  const traducoes = {
    'nenhuma': 'Nenhuma',
    'leve': 'Leve',
    'média': 'Média',
    'pesada': 'Pesada',
    'muito pesada': 'Muito Pesada',
    'sobrecarregado': 'Sobrecarregado'
  };
  
  return traducoes[nivel] || nivel;
}

// ===========================================
// 4. SISTEMA DE SALVAMENTO NO FIREBASE
// ===========================================
function salvarDadosDashboardNoFirebase() {
  // Verificar se temos acesso ao Firebase
  if (!window.currentCharacterId || !window.db || !window.currentUser) {
    console.log('⚠️ Firebase não disponível para salvar dados do dashboard');
    
    // Salvar localmente como fallback
    salvarDadosDashboardLocalmente();
    return;
  }
  
  // Preparar dados para salvar
  const dadosParaSalvar = {
    fotoBase64: dashboardState.fotoBase64,
    pontosIniciais: dashboardState.pontosIniciais,
    limiteDesvantagens: dashboardState.limiteDesvantagens,
    status: dashboardState.status,
    reputacao: dashboardState.reputacao,
    aparencia: dashboardState.aparencia,
    dinheiro: dashboardState.dinheiro,
    nivelRiqueza: dashboardState.nivelRiqueza,
    pesoEquipamentos: dashboardState.pesoEquipamentos,
    dashboardUpdatedAt: new Date().toISOString()
  };
  
  // Salvar no Firebase
  try {
    window.db.collection('characters').doc(window.currentCharacterId).update({
      dashboardData: dadosParaSalvar
    });
    console.log('💾 Dados do dashboard salvos no Firebase');
  } catch (error) {
    console.log('❌ Erro ao salvar dados do dashboard:', error);
    
    // Fallback: salvar localmente
    salvarDadosDashboardLocalmente();
  }
}

// Salvar localmente (fallback)
function salvarDadosDashboardLocalmente() {
  try {
    localStorage.setItem('dashboard_data', JSON.stringify({
      fotoBase64: dashboardState.fotoBase64,
      pontosIniciais: dashboardState.pontosIniciais,
      limiteDesvantagens: dashboardState.limiteDesvantagens
    }));
  } catch (e) {
    console.log('❌ Erro ao salvar localmente:', e);
  }
}

// Carregar dados do Firebase
async function carregarDadosDashboardDoFirebase() {
  if (!window.currentCharacterId || !window.db) return;
  
  try {
    const doc = await window.db.collection('characters').doc(window.currentCharacterId).get();
    if (doc.exists) {
      const data = doc.data();
      if (data.dashboardData) {
        const dashData = data.dashboardData;
        
        // Carregar foto
        if (dashData.fotoBase64) {
          dashboardState.fotoBase64 = dashData.fotoBase64;
          carregarFotoSalva();
        }
        
        // Carregar pontos iniciais
        if (dashData.pontosIniciais) {
          dashboardState.pontosIniciais = dashData.pontosIniciais;
          const startPoints = document.getElementById('start-points');
          if (startPoints) {
            startPoints.value = dashData.pontosIniciais;
            
            // Forçar atualização do sistema de pontos
            setTimeout(() => {
              if (typeof window.definirPontosIniciais === 'function') {
                window.definirPontosIniciais(dashData.pontosIniciais);
              }
              calcularSistemaPontos();
            }, 500);
          }
        }
        
        // Carregar outros dados
        if (dashData.limiteDesvantagens) {
          dashboardState.limiteDesvantagens = dashData.limiteDesvantagens;
          const disLimit = document.getElementById('dis-limit');
          if (disLimit) disLimit.value = dashData.limiteDesvantagens;
        }
        
        if (dashData.dinheiro) {
          dashboardState.dinheiro = dashData.dinheiro;
          const moneyElem = document.getElementById('current-money');
          if (moneyElem) moneyElem.textContent = `$${dashData.dinheiro}`;
        }
        
        console.log('📥 Dados do dashboard carregados do Firebase');
      }
    }
  } catch (error) {
    console.log('⚠️ Não foi possível carregar dados do dashboard:', error);
    
    // Tentar carregar do localStorage
    carregarDadosDashboardLocalmente();
  }
}

// Carregar localmente (fallback)
function carregarDadosDashboardLocalmente() {
  try {
    const saved = localStorage.getItem('dashboard_data');
    if (saved) {
      const data = JSON.parse(saved);
      
      if (data.fotoBase64) {
        dashboardState.fotoBase64 = data.fotoBase64;
        carregarFotoSalva();
      }
      
      if (data.pontosIniciais) {
        dashboardState.pontosIniciais = data.pontosIniciais;
        const startPoints = document.getElementById('start-points');
        if (startPoints) startPoints.value = data.pontosIniciais;
      }
      
      if (data.limiteDesvantagens) {
        dashboardState.limiteDesvantagens = data.limiteDesvantagens;
        const disLimit = document.getElementById('dis-limit');
        if (disLimit) disLimit.value = data.limiteDesvantagens;
      }
    }
  } catch (e) {
    console.log('❌ Erro ao carregar dados locais:', e);
  }
}

// ===========================================
// 5. FUNÇÕES ORIGINAIS DO DASHBOARD (MANTIDAS)
// ===========================================

// Inicialização DIRETA
function inicializarDashboard() {
  console.log(' Inicializando dashboard COMPLETO...');
  
  // 1. Carregar dados salvos primeiro
  carregarDadosDashboardDoFirebase();
  
  // 2. Configurar upload de foto COM SALVAMENTO
  configurarUploadFotoComSalvamento();
  
  // 3. Configurar pontos iniciais COM SALVAMENTO
  configurarPontosIniciaisComSalvamento();
  
  // 4. Configurar integração com equipamentos
  configurarIntegracaoEquipamentos();
  
  // 5. Configurar eventos originais
  configurarEventos();
  
  // 6. Primeira atualização imediata
  setTimeout(atualizarDashboardCompleto, 100);
  
  // 7. Atualizar a cada 2 segundos
  setInterval(atualizarDashboardCompleto, 2000);
  
  console.log('✅ Dashboard COMPLETO pronto');
}

// Atualização COMPLETA e DIRETA
function atualizarDashboardCompleto() {
  // 1. Pegar valores DIRETAMENTE das abas
  pegarValoresDiretos();
  
  // 2. Atualizar integração com equipamentos (se conectado)
  if (dashboardState.sistemaEquipamentosConectado) {
    atualizarDadosEquipamentos();
  }
  
  // 3. Atualizar todos os elementos
  atualizarTodosElementos();
  
  // 4. Atualizar horário
  atualizarHorario();
}

// Pegar valores DIRETAMENTE dos elementos
function pegarValoresDiretos() {
  console.log(' Buscando valores diretos...');
  
  // 1. PEGAR PONTOS DE ATRIBUTOS DIRETAMENTE DA ABA
  const pontosGastosElement = document.getElementById('pontosGastos');
  if (pontosGastosElement) {
    const pontosGastos = parseInt(pontosGastosElement.textContent) || 0;
    console.log('Pontos gastos encontrados:', pontosGastos);
    
    // Atualizar no dashboard
    const pointsAttr = document.getElementById('points-attr');
    if (pointsAttr) {
      pointsAttr.textContent = pontosGastos;
    }
  } else {
    console.warn('❌ Elemento pontosGastos não encontrado');
  }
  
  // 2. PEGAR VALORES DOS ATRIBUTOS DIRETAMENTE
  const atributos = ['ST', 'DX', 'IQ', 'HT'];
  atributos.forEach(atributo => {
    const input = document.getElementById(atributo);
    const summaryElement = document.getElementById(`summary-${atributo.toLowerCase()}`);
    
    if (input && summaryElement) {
      const valor = input.value || 10;
      summaryElement.textContent = valor;
    }
  });
  
  // 3. PEGAR PV E PF DA ABA DE COMBATE
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
  
  // 4. PEGAR VONTADE E PERCEPÇÃO DIRETAMENTE
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
  console.log(' Atualizando elementos do dashboard...');
  
  // 1. Calcular sistema de pontos
  calcularSistemaPontos();
  
  // 2. Atualizar status social
  atualizarStatusSocial();
  
  // 3. Atualizar finanças (já atualizado pela integração)
  // atualizarFinancas(); // REMOVIDO - agora usa dados dos equipamentos
  
  // 4. Atualizar contadores
  atualizarContadores();
  
  // 5. Atualizar carga baseado em ST
  atualizarCarga();
  
  // 6. Atualizar identificação
  atualizarIdentificacao();
  
  // 7. Atualizar nível de riqueza
  atualizarNivelRiqueza();
}

// Calcular sistema de pontos DIRETAMENTE
function calcularSistemaPontos() {
  const pontosAtributos = parseInt(document.getElementById('points-attr').textContent) || 0;
  const pontosIniciais = parseInt(document.getElementById('start-points').value) || dashboardState.pontosIniciais || 100;
  
  // Somar outros pontos (simulados por enquanto)
  const pontosVantagens = 0;
  const pontosDesvantagens = 0;
  const pontosPericias = 0;
  const pontosMagias = 0;
  
  const totalGasto = pontosAtributos + pontosVantagens + pontosDesvantagens +
           pontosPericias + pontosMagias;
  
  const pontosRestantes = pontosIniciais - totalGasto;
  
  // Atualizar elementos
  document.getElementById('total-points-spent').textContent = `${totalGasto} pts`;
  document.getElementById('points-balance').textContent = pontosRestantes;
  
  // Atualizar status do saldo
  const indicator = document.getElementById('points-status-indicator');
  const text = document.getElementById('points-status-text');
  
  if (pontosRestantes > 0) {
    indicator.style.backgroundColor = '#4CAF50';
    text.textContent = 'Personagem válido - pontos disponíveis';
    text.style.color = '#4CAF50';
  } else if (pontosRestantes === 0) {
    indicator.style.backgroundColor = '#FFC107';
    text.textContent = 'Personagem completo - todos pontos usados';
    text.style.color = '#FFC107';
  } else {
    indicator.style.backgroundColor = '#f44336';
    text.textContent = 'ATENÇÃO: Pontos excedidos!';
    text.style.color = '#f44336';
  }
}

// Status Social - BOTÕES FUNCIONAIS
function ajustarModificador(tipo, valor) {
  console.log(`Ajustando ${tipo} por ${valor}`);
  
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
  
  // Atualizar estado
  dashboardState[tipo] = novoValor;
  
  // Atualizar pontos (5 pts por nível)
  const pontos = novoValor * 5;
  if (elementoPontos) {
    elementoPontos.textContent = `[${pontos}]`;
  }
  
  // Atualizar total social
  atualizarTotalSocial();
  
  // Recalcular pontos
  calcularSistemaPontos();
  
  // Salvar no Firebase
  salvarDadosDashboardNoFirebase();
}

function atualizarTotalSocial() {
  const status = parseInt(document.getElementById('status-value').textContent) || dashboardState.status || 0;
  const reputacao = parseInt(document.getElementById('rep-value').textContent) || dashboardState.reputacao || 0;
  const aparencia = parseInt(document.getElementById('app-value').textContent) || dashboardState.aparencia || 0;
  
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

// Finanças (AGORA USA DADOS DOS EQUIPAMENTOS)
function atualizarFinancas() {
  // Agora usa dados dos equipamentos, não precisa fazer nada aqui
  // A função foi movida para atualizarDashboardComDadosEquipamentos()
}

// Carga baseada em ST
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
  
  // Se não tiver dados dos equipamentos, atualizar com valores padrão
  if (!dashboardState.sistemaEquipamentosConectado) {
    // Atualizar limites
    document.getElementById('limit-light').textContent = carga.leve.toFixed(1) + ' kg';
    document.getElementById('limit-medium').textContent = carga.media.toFixed(1) + ' kg';
    document.getElementById('limit-heavy').textContent = carga.pesada.toFixed(1) + ' kg';
    document.getElementById('limit-extreme').textContent = carga.extrema.toFixed(1) + ' kg';
    
    // Atualizar nível de carga
    const pesoAtual = dashboardState.pesoEquipamentos || 0;
    const encLevel = document.getElementById('enc-level-display');
    
    if (pesoAtual <= 0) {
      encLevel.textContent = 'Nenhuma';
      encLevel.className = 'enc-value safe';
    } else if (pesoAtual <= carga.leve) {
      encLevel.textContent = 'Leve';
      encLevel.className = 'enc-value light';
    } else if (pesoAtual <= carga.media) {
      encLevel.textContent = 'Média';
      encLevel.className = 'enc-value medium';
    } else if (pesoAtual <= carga.pesada) {
      encLevel.textContent = 'Pesada';
      encLevel.className = 'enc-value heavy';
    } else {
      encLevel.textContent = 'Extrema';
      encLevel.className = 'enc-value extreme';
    }
  }
}

// Atualizar nível de riqueza
function atualizarNivelRiqueza() {
  // Pegar valor do select de riqueza na aba características
  const selectRiqueza = document.getElementById('nivelRiqueza');
  if (selectRiqueza) {
    const valor = selectRiqueza.value;
    const texto = selectRiqueza.options[selectRiqueza.selectedIndex].text;
    
    dashboardState.nivelRiqueza = texto.split('[')[0].trim();
    
    // Atualizar display
    const wealthDisplay = document.getElementById('wealth-level-display');
    if (wealthDisplay) {
      wealthDisplay.textContent = `${dashboardState.nivelRiqueza} [${valor} pts]`;
    }
    
    const financeStatus = document.getElementById('finance-status');
    if (financeStatus) {
      financeStatus.textContent = dashboardState.nivelRiqueza;
    }
  }
}

// Contadores
function atualizarContadores() {
  // Simulado por enquanto
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

// Configurar eventos
function configurarEventos() {
  // Pontos iniciais (já configurado em configurarPontosIniciaisComSalvamento)
  
  // Limite desvantagens
  const disLimit = document.getElementById('dis-limit');
  if (disLimit) {
    disLimit.addEventListener('change', function() {
      const valor = parseInt(this.value) || -75;
      dashboardState.limiteDesvantagens = valor;
      salvarDadosDashboardNoFirebase();
    });
  }
  
  // Botão de atualização
  const refreshBtn = document.querySelector('.refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', atualizarDashboardCompleto);
  }
  
  // Nível de riqueza (observar mudanças)
  const selectRiqueza = document.getElementById('nivelRiqueza');
  if (selectRiqueza) {
    selectRiqueza.addEventListener('change', function() {
      atualizarNivelRiqueza();
      salvarDadosDashboardNoFirebase();
    });
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
// EXPORTAÇÃO DAS FUNÇÕES PRINCIPAIS
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
  localStorage.setItem('dashboard_pontos_iniciais', valorNumerico.toString());
  salvarDadosDashboardNoFirebase();
  
  // Recalcular
  calcularSistemaPontos();
};

window.definirLimiteDesvantagens = function(valor) {
  dashboardState.limiteDesvantagens = parseInt(valor) || -75;
  salvarDadosDashboardNoFirebase();
};

window.ajustarModificador = ajustarModificador;
window.atualizarDashboard = atualizarDashboardCompleto;
window.inicializarDashboard = inicializarDashboard;

// ===========================================
// NOVAS FUNÇÕES DE INTEGRAÇÃO
// ===========================================
window.atualizarDashboardComEquipamentos = function() {
  if (dashboardState.sistemaEquipamentosConectado) {
    atualizarDadosEquipamentos();
  }
};

window.integrarComEquipamentos = function() {
  configurarIntegracaoEquipamentos();
};

// ===========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ===========================================
document.addEventListener('DOMContentLoaded', function() {
  // Observar mudanças de aba
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const dashboardTab = document.getElementById('dashboard');
        if (dashboardTab && dashboardTab.classList.contains('active')) {
          console.log(' Aba dashboard ativada!');
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
    console.log(' Dashboard já está ativa!');
    setTimeout(inicializarDashboard, 500);
  }
});