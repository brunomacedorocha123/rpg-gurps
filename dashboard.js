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


// Inicialização DIRETA
function inicializarDashboard() {
  console.log(' Inicializando dashboard DIRETO...');
  
  // Configurar upload de foto
  configurarUploadFoto();
  
  // Configurar eventos
  configurarEventos();
  
  // Primeira atualização imediata
  setTimeout(atualizarDashboardCompleto, 100);
  
  // Atualizar a cada 2 segundos
  setInterval(atualizarDashboardCompleto, 2000);
  
  console.log('✅ Dashboard pronto');
}


// Atualização COMPLETA e DIRETA
function atualizarDashboardCompleto() {
  // 1. Pegar valores DIRETAMENTE das abas
  pegarValoresDiretos();
  
  // 2. Atualizar todos os elementos
  atualizarTodosElementos();
  
  // 3. Atualizar horário
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
  
  // 5. PEGAR STATUS SOCIAL (simulado por enquanto)
  // Isso será ajustado quando a aba de características estiver pronta
}


// Atualizar todos os elementos do dashboard
function atualizarTodosElementos() {
  console.log(' Atualizando elementos do dashboard...');
  
  // 1. Calcular sistema de pontos
  calcularSistemaPontos();
  
  // 2. Atualizar status social
  atualizarStatusSocial();
  
  // 3. Atualizar finanças
  atualizarFinancas();
  
  // 4. Atualizar contadores
  atualizarContadores();
  
  // 5. Atualizar carga baseado em ST
  atualizarCarga();
  
  // 6. Atualizar identificação
  atualizarIdentificacao();
}


// Calcular sistema de pontos DIRETAMENTE
function calcularSistemaPontos() {
  const pontosAtributos = parseInt(document.getElementById('points-attr').textContent) || 0;
  const pontosIniciais = parseInt(document.getElementById('start-points').value) || 100;
  
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
  
  // Atualizar pontos (5 pts por nível)
  const pontos = novoValor * 5;
  if (elementoPontos) {
    elementoPontos.textContent = `[${pontos}]`;
  }
  
  // Atualizar estado
  dashboardState[tipo] = novoValor;
  
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


// Finanças simplificadas
function atualizarFinancas() {
  // Simulado por enquanto
  document.getElementById('current-money').textContent = `$${dashboardState.dinheiro}`;
  document.getElementById('equip-weight').textContent = `${dashboardState.pesoEquipamentos.toFixed(1)} kg`;
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
  
  // Atualizar limites
  document.getElementById('limit-light').textContent = carga.leve.toFixed(1) + ' kg';
  document.getElementById('limit-medium').textContent = carga.media.toFixed(1) + ' kg';
  document.getElementById('limit-heavy').textContent = carga.pesada.toFixed(1) + ' kg';
  document.getElementById('limit-extreme').textContent = carga.extrema.toFixed(1) + ' kg';
  
  // Atualizar nível de carga
  const pesoAtual = dashboardState.pesoEquipamentos;
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


// Contadores
function atualizarContadores() {
  // Simulado por enquanto
  const contadores = {
    'counter-advantages': dashboardState.vantagens,
    'counter-disadvantages': dashboardState.desvantagens,
    'counter-skills': dashboardState.pericias,
    'counter-spells': dashboardState.magias,
    'counter-languages': dashboardState.idiomas,
    'counter-relationships': dashboardState.relacionamentos
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


// Upload de foto FUNCIONAL
function configurarUploadFoto() {
  const uploadInput = document.getElementById('char-upload');
  const photoPreview = document.getElementById('photo-preview');
  
  if (!uploadInput || !photoPreview) return;
  
  uploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      
      reader.onload = function(event) {
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
        };
        
        photoPreview.appendChild(removeBtn);
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


// Configurar eventos
function configurarEventos() {
  // Pontos iniciais
  const startPoints = document.getElementById('start-points');
  if (startPoints) {
    startPoints.addEventListener('change', function() {
      dashboardState.pontosIniciais = parseInt(this.value) || 100;
      calcularSistemaPontos();
    });
  }
  
  // Limite desvantagens
  const disLimit = document.getElementById('dis-limit');
  if (disLimit) {
    disLimit.addEventListener('change', function() {
      dashboardState.limiteDesvantagens = parseInt(this.value) || -75;
    });
  }
  
  // Botão de atualização
  const refreshBtn = document.querySelector('.refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', atualizarDashboardCompleto);
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


// EXPORTAÇÃO DAS FUNÇÕES PRINCIPAIS
window.definirPontosIniciais = function(valor) {
  dashboardState.pontosIniciais = parseInt(valor) || 100;
  calcularSistemaPontos();
};


window.definirLimiteDesvantagens = function(valor) {
  dashboardState.limiteDesvantagens = parseInt(valor) || -75;
};


window.ajustarModificador = ajustarModificador;
window.atualizarDashboard = atualizarDashboardCompleto;
window.inicializarDashboard = inicializarDashboard;


// Inicialização automática quando a aba dashboard for ativada
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
