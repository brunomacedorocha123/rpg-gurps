// ============================================
// TECNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

console.log("🎯 SISTEMA DE TÉCNICAS INICIADO");

// ===== 1. CONFIGURAÇÃO =====
const CATALOGO_TECNICAS = [
  {
    id: "arquearia-montada",
    nome: "Arquearia Montada",
    icone: "fas fa-horse",
    descricao: "Atirar com arco enquanto cavalga. Penalidade base de -4. Cada nível investido reduz esta penalidade em 1. O NH da técnica nunca pode exceder o NH em Arco.",
    dificuldade: "Difícil",
    periciaBase: "Arco",
    atributo: "DX",
    modificadorBase: -4,
    prereq: ["Arco", "Cavalgar"],
    custoTabela: { 2: 1, 3: 2, 4: 3, 5: 4 }
  },
  {
    id: "ataque-preciso",
    nome: "Ataque Preciso",
    icone: "fas fa-bullseye",
    descricao: "Aumenta a chance de acertar pontos vitais. +1 por nível para ataques direcionados.",
    dificuldade: "Difícil",
    periciaBase: "Esgrima",
    atributo: "DX",
    modificadorBase: -2,
    prereq: ["Esgrima 12+"],
    custoTabela: { 2: 1, 3: 2, 4: 3, 5: 4 }
  },
  {
    id: "defesa-atleta",
    nome: "Defesa de Atleta",
    icone: "fas fa-running",
    descricao: "Usar agilidade para defender-se em movimento. +1 por nível na Defesa.",
    dificuldade: "Média",
    periciaBase: "Esquiva",
    atributo: "DX",
    modificadorBase: 0,
    prereq: ["Esquiva 10+"],
    custoTabela: { 1: 0, 2: 1, 3: 2, 4: 3 }
  }
];

let estadoTecnicas = {
  aprendidas: [],
  pontosTotais: 0
};

let tecnicaSelecionada = null;

// ===== 2. FUNÇÕES BÁSICAS =====
function carregarTecnicas() {
  try {
    const salvo = localStorage.getItem('tecnicas_aprendidas');
    if (salvo) estadoTecnicas.aprendidas = JSON.parse(salvo);
    
    const pontos = localStorage.getItem('pontos_tecnicas');
    if (pontos) estadoTecnicas.pontosTotais = parseInt(pontos);
    
    console.log(`📊 ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
  } catch (e) {
    console.error("Erro ao carregar:", e);
  }
}

function salvarTecnicas() {
  localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
  localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
}

// ===== 3. CONEXÃO COM PERÍCIAS =====
function buscarPericiasAprendidas() {
  if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    return window.estadoPericias.periciasAprendidas;
  }
  
  try {
    const dados = localStorage.getItem('gurps_pericias');
    if (dados) {
      const parsed = JSON.parse(dados);
      if (parsed.periciasAprendidas) return parsed.periciasAprendidas;
    }
  } catch (e) {}
  
  return [];
}

function temPericia(nomePericia, nivelMinimo = 0) {
  const pericias = buscarPericiasAprendidas();
  
  for (const pericia of pericias) {
    if (!pericia || !pericia.nome) continue;
    
    const nomeBase = pericia.nome.trim();
    const nomeCompleto = pericia.nomeCompleto || nomeBase;
    const nivel = pericia.nivel || 0;
    
    if (nomeBase.toLowerCase().includes(nomePericia.toLowerCase()) || 
        nomeCompleto.toLowerCase().includes(nomePericia.toLowerCase())) {
      if (nivel >= nivelMinimo) {
        return { tem: true, nivel: nivel };
      }
      return { tem: false, nivel: nivel, falta: nivelMinimo - nivel };
    }
  }
  
  return { tem: false, nivel: 0 };
}

// ===== 4. RENDERIZAÇÃO =====
function renderizarCatalogoTecnicas() {
  console.log("🎨 Renderizando catálogo...");
  
  const container = document.getElementById('lista-tecnicas');
  if (!container) {
    console.error("❌ Container #lista-tecnicas não encontrado");
    return;
  }
  
  container.innerHTML = '';
  
  if (CATALOGO_TECNICAS.length === 0) {
    container.innerHTML = '<div class="empty-state">Nenhuma técnica disponível</div>';
    return;
  }
  
  CATALOGO_TECNICAS.forEach(tecnica => {
    const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
    
    // Verifica pré-requisitos
    const prereqStatus = verificarPrereqTecnica(tecnica);
    const prereqCumpridos = prereqStatus.todosCumpridos;
    
    // Determina status
    let statusClass = 'disponivel';
    let statusText = 'Disponível';
    let btnText = 'Adquirir';
    let btnIcon = 'fa-plus-circle';
    let disabled = false;
    
    if (jaAprendida) {
      statusClass = 'aprendida';
      statusText = 'Aprendida';
      btnText = 'Editar';
      btnIcon = 'fa-edit';
    } else if (!prereqCumpridos) {
      statusClass = 'bloqueada';
      statusText = 'Pré-requisitos';
      btnText = 'Ver Pré-requisitos';
      btnIcon = 'fa-lock';
      disabled = true;
    }
    
    // Cria o card
    const card = document.createElement('div');
    card.className = 'tecnica-item';
    card.dataset.id = tecnica.id;
    
    if (statusClass === 'bloqueada') {
      card.style.opacity = '0.7';
      card.classList.add('bloqueada');
    }
    
    card.innerHTML = `
      <div class="tecnica-header">
        <div class="tecnica-nome-container">
          <div class="tecnica-nome">
            <i class="${tecnica.icone}"></i>
            ${tecnica.nome}
          </div>
          <div class="tecnica-tags">
            <span class="tecnica-dificuldade ${tecnica.dificuldade.toLowerCase()}">${tecnica.dificuldade}</span>
            <span class="tecnica-tipo">${tecnica.periciaBase}</span>
          </div>
        </div>
        <div class="tecnica-status">
          <span class="tecnica-status-badge ${statusClass}">${statusText}</span>
        </div>
      </div>
      
      <div class="tecnica-descricao">
        <p>${tecnica.descricao}</p>
      </div>
      
      <div class="tecnica-info-rapida">
        <div class="info-item">
          <i class="fas fa-bullseye"></i>
          <span>Base: ${tecnica.periciaBase}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-arrow-up"></i>
          <span>Mod: ${tecnica.modificadorBase}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-coins"></i>
          <span>Custo: 2 pts/nível</span>
        </div>
      </div>
      
      <div class="tecnica-prereq">
        <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
        <span>${tecnica.prereq.join(', ')}</span>
        <div class="prereq-status">
          ${prereqStatus.itens.map(item => `
            <span class="${item.cumprido ? 'cumprido' : 'pendente'}">
              <i class="fas fa-${item.cumprido ? 'check' : 'times'}"></i> ${item.nome}
            </span>
          `).join('')}
        </div>
      </div>
      
      <div class="tecnica-actions">
        <button class="btn-tecnica ${statusClass}"
            onclick="abrirModalTecnica('${tecnica.id}')"
            ${disabled ? 'disabled' : ''}>
          <i class="fas ${btnIcon}"></i>
          ${btnText}
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
  
  // Atualiza contador
  const contador = document.getElementById('contador-tecnicas');
  if (contador) {
    contador.textContent = `${CATALOGO_TECNICAS.length} técnicas`;
  }
  
  console.log("✅ Catálogo renderizado");
}

function verificarPrereqTecnica(tecnica) {
  const itens = [];
  let todosCumpridos = true;
  
  tecnica.prereq.forEach(req => {
    // Verifica se tem nível mínimo (ex: "Arco 12+")
    const match = req.match(/(.+?)\s*(\d+)\+?/);
    let nomePericia, nivelMinimo = 0;
    
    if (match) {
      nomePericia = match[1].trim();
      nivelMinimo = parseInt(match[2]);
    } else {
      nomePericia = req.trim();
    }
    
    const resultado = temPericia(nomePericia, nivelMinimo);
    itens.push({
      nome: req,
      cumprido: resultado.tem,
      nivel: resultado.nivel,
      falta: resultado.falta
    });
    
    if (!resultado.tem) todosCumpridos = false;
  });
  
  return { itens, todosCumpridos };
}

function renderizarTecnicasAprendidas() {
  const container = document.getElementById('tecnicas-aprendidas');
  if (!container) return;
  
  if (estadoTecnicas.aprendidas.length === 0) {
    container.innerHTML = `
      <div class="nenhuma-tecnica-aprendida">
        <i class="fas fa-tools"></i>
        <div>Nenhuma técnica aprendida</div>
        <small>As técnicas que você adquirir aparecerão aqui</small>
      </div>
    `;
    return;
  }
  
  container.innerHTML = '';
  
  estadoTecnicas.aprendidas.forEach(tecnicaAprendida => {
    const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
    if (!tecnicaBase) return;
    
    const periciaBase = temPericia(tecnicaBase.periciaBase);
    const nhBase = periciaBase.tem ? periciaBase.nivel : 0;
    const nhTecnica = Math.min(
      nhBase + (tecnicaAprendida.niveis || 0) + tecnicaBase.modificadorBase,
      nhBase
    );
    
    const card = document.createElement('div');
    card.className = 'tecnica-aprendida-item';
    card.dataset.id = tecnicaAprendida.id;
    
    card.innerHTML = `
      <div class="tecnica-aprendida-header">
        <div class="tecnica-aprendida-nome">
          <i class="${tecnicaBase.icone}"></i>
          <span>${tecnicaBase.nome}</span>
        </div>
        <div class="tecnica-aprendida-nh">
          NH <span class="nh-valor">${nhTecnica}</span>
        </div>
      </div>
      
      <div class="tecnica-aprendida-info">
        <div class="info-row">
          <span>Perícia Base:</span>
          <strong>${tecnicaBase.periciaBase} (NH ${nhBase})</strong>
        </div>
        <div class="info-row">
          <span>Níveis:</span>
          <strong>+${tecnicaAprendida.niveis || 0}</strong>
        </div>
        <div class="info-row">
          <span>Pontos:</span>
          <strong>${tecnicaAprendida.pontos || 0} pts</strong>
        </div>
      </div>
      
      <div class="tecnica-aprendida-actions">
        <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
          <i class="fas fa-times"></i> Remover
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function atualizarEstatisticas() {
  // Estatísticas principais
  const elementos = [
    { id: 'total-tecnicas', valor: estadoTecnicas.aprendidas.length },
    { id: 'pontos-tecnicas', valor: estadoTecnicas.pontosTotais },
    { id: 'pontos-tecnicas-aprendidas', valor: `${estadoTecnicas.pontosTotais} pts` }
  ];
  
  elementos.forEach(elem => {
    const el = document.getElementById(elem.id);
    if (el) el.textContent = elem.valor;
  });
  
  // Calcula nível médio
  let nivelTotal = 0;
  let custoTotal = 0;
  
  estadoTecnicas.aprendidas.forEach(tecnicaAprendida => {
    const tecnicaBase = CATALOGO_TECNICAS.find(t => t.id === tecnicaAprendida.id);
    if (tecnicaBase) {
      const periciaBase = temPericia(tecnicaBase.periciaBase);
      const nhBase = periciaBase.tem ? periciaBase.nivel : 0;
      const nhTecnica = Math.min(
        nhBase + (tecnicaAprendida.niveis || 0) + tecnicaBase.modificadorBase,
        nhBase
      );
      nivelTotal += nhTecnica;
      custoTotal += tecnicaAprendida.pontos || 0;
    }
  });
  
  const nivelMedioEl = document.getElementById('nivel-medio-tecnicas');
  const custoTotalEl = document.getElementById('custo-total-tecnicas');
  
  if (nivelMedioEl) {
    nivelMedioEl.textContent = estadoTecnicas.aprendidas.length > 0 
      ? Math.round(nivelTotal / estadoTecnicas.aprendidas.length) 
      : 0;
  }
  
  if (custoTotalEl) {
    custoTotalEl.textContent = `${custoTotal} pts`;
  }
}

// ===== 5. MODAL =====
function abrirModalTecnica(id) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  if (!tecnica) return;
  
  const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
  
  // Verifica pré-requisitos
  const prereqStatus = verificarPrereqTecnica(tecnica);
  const prereqCumpridos = prereqStatus.todosCumpridos;
  
  // Verifica perícia base
  const periciaBase = temPericia(tecnica.periciaBase);
  const nhBase = periciaBase.nivel || 0;
  
  // Remove conteúdo de loading do modal
  const modal = document.getElementById('modal-tecnica');
  if (!modal) return;
  
  // Cria o conteúdo do modal
  const modalHTML = `
    <div class="modal-tecnica-content">
      <div class="modal-tecnica-header">
        <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
        <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
      </div>
      
      <div class="modal-tecnica-body">
        <div class="tecnica-modal-info">
          <div class="info-row">
            <span><strong>Dificuldade:</strong> ${tecnica.dificuldade}</span>
          </div>
          <div class="info-row">
            <span><strong>Perícia Base:</strong> ${tecnica.periciaBase} (NH ${nhBase})</span>
          </div>
          <div class="info-row">
            <span><strong>Modificador Base:</strong> ${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}</span>
          </div>
        </div>
        
        <div class="tecnica-modal-descricao">
          <p><strong>Descrição:</strong> ${tecnica.descricao}</p>
        </div>
        
        <div class="tecnica-modal-prereq">
          <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
          ${prereqStatus.itens.map(item => `
            <div class="prereq-item ${item.cumprido ? 'cumprido' : 'nao-cumprido'}">
              <i class="fas fa-${item.cumprido ? 'check' : 'times'}"></i>
              <span>${item.nome}</span>
              ${item.cumprido ? `<small>(NH ${item.nivel})</small>` : ''}
              ${!item.cumprido && item.falta ? `<small class="falta">Falta ${item.falta}</small>` : ''}
            </div>
          `).join('')}
        </div>
        
        ${prereqCumpridos ? `
        <div class="tecnica-modal-pontos">
          <h4><i class="fas fa-coins"></i> Investir Pontos</h4>
          <p class="instrucao">Selecione quantos pontos deseja investir na técnica:</p>
          <div class="pontos-opcoes">
            <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 2 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica(2, 1, ${nhBase}, ${tecnica.modificadorBase})"
                ${tecnicaAprendida && tecnicaAprendida.niveis >= 1 ? '' : ''}>
              <div class="pontos-valor">2 pontos</div>
              <div class="nivel-valor">+1 nível</div>
              <div class="nh-resultado">NH: ${Math.min(nhBase + 1 + tecnica.modificadorBase, nhBase)}</div>
            </button>
            <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 3 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica(3, 2, ${nhBase}, ${tecnica.modificadorBase})"
                ${tecnicaAprendida && tecnicaAprendida.niveis >= 2 ? '' : ''}>
              <div class="pontos-valor">3 pontos</div>
              <div class="nivel-valor">+2 níveis</div>
              <div class="nh-resultado">NH: ${Math.min(nhBase + 2 + tecnica.modificadorBase, nhBase)}</div>
            </button>
            <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 4 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica(4, 3, ${nhBase}, ${tecnica.modificadorBase})"
                ${tecnicaAprendida && tecnicaAprendida.niveis >= 3 ? '' : ''}>
              <div class="pontos-valor">4 pontos</div>
              <div class="nivel-valor">+3 níveis</div>
              <div class="nh-resultado">NH: ${Math.min(nhBase + 3 + tecnica.modificadorBase, nhBase)}</div>
            </button>
            <button class="opcao-pontos ${tecnicaAprendida && tecnicaAprendida.pontos === 5 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica(5, 4, ${nhBase}, ${tecnica.modificadorBase})"
                ${tecnicaAprendida && tecnicaAprendida.niveis >= 4 ? '' : ''}>
              <div class="pontos-valor">5 pontos</div>
              <div class="nivel-valor">+4 níveis</div>
              <div class="nh-resultado">NH: ${Math.min(nhBase + 4 + tecnica.modificadorBase, nhBase)}</div>
            </button>
          </div>
        </div>
        
        <div class="tecnica-modal-resumo">
          <h4><i class="fas fa-calculator"></i> Resumo</h4>
          <div class="resumo-item">
            <span>Custo:</span>
            <strong id="custo-modal">${tecnicaAprendida ? tecnicaAprendida.pontos : 2}</strong>
            <span> pontos</span>
          </div>
          <div class="resumo-item">
            <span>Níveis Adicionais:</span>
            <strong id="niveis-modal">${tecnicaAprendida ? tecnicaAprendida.niveis : 1}</strong>
          </div>
          <div class="resumo-item">
            <span>NH Final:</span>
            <strong id="nh-modal">${Math.min(nhBase + (tecnicaAprendida ? tecnicaAprendida.niveis : 1) + tecnica.modificadorBase, nhBase)}</strong>
          </div>
        </div>
        ` : `
        <div class="prereq-alerta">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Pré-requisitos não cumpridos!</strong>
            <p>Você precisa cumprir todos os pré-requisitos para adquirir esta técnica.</p>
          </div>
        </div>
        `}
      </div>
      
      <div class="modal-tecnica-footer">
        <button class="btn-modal btn-modal-cancelar" onclick="fecharModalTecnica()">
          <i class="fas fa-times"></i> Cancelar
        </button>
        <button class="btn-modal btn-modal-confirmar"
            onclick="confirmarTecnica('${id}')"
            id="btn-confirmar-tecnica"
            ${prereqCumpridos ? '' : 'disabled'}>
          <i class="fas fa-check"></i> ${tecnicaAprendida ? 'Atualizar' : 'Adquirir'}
        </button>
      </div>
    </div>
  `;
  
  modal.innerHTML = modalHTML;
  
  // Seleciona opção inicial baseada na técnica aprendida (se houver)
  if (tecnicaAprendida) {
    const opcaoSelecionada = document.querySelector(`.opcao-pontos.selecionado`);
    if (!opcaoSelecionada) {
      const primeiraOpcao = document.querySelector('.opcao-pontos');
      if (primeiraOpcao) primeiraOpcao.classList.add('selecionado');
    }
  } else {
    const primeiraOpcao = document.querySelector('.opcao-pontos');
    if (primeiraOpcao) primeiraOpcao.classList.add('selecionado');
  }
  
  // Mostra o modal
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) overlay.style.display = 'flex';
  
  // Inicializa dados da técnica selecionada
  tecnicaSelecionada = {
    id: id,
    pontos: tecnicaAprendida ? tecnicaAprendida.pontos : 2,
    niveis: tecnicaAprendida ? tecnicaAprendida.niveis : 1,
    nhBase: nhBase,
    modificador: tecnica.modificadorBase
  };
}

function selecionarPontosTecnica(pontos, niveis, nhBase, modificador) {
  // Remove seleção de todas as opções
  document.querySelectorAll('.opcao-pontos').forEach(opcao => {
    opcao.classList.remove('selecionado');
  });
  
  // Adiciona seleção à opção clicada
  event.target.classList.add('selecionado');
  
  // Atualiza técnica selecionada
  tecnicaSelecionada = {
    ...tecnicaSelecionada,
    pontos: pontos,
    niveis: niveis
  };
  
  // Atualiza resumo no modal
  const custoDisplay = document.getElementById('custo-modal');
  const niveisDisplay = document.getElementById('niveis-modal');
  const nhDisplay = document.getElementById('nh-modal');
  
  if (custoDisplay) custoDisplay.textContent = pontos;
  if (niveisDisplay) niveisDisplay.textContent = niveis;
  if (nhDisplay) {
    const nhFinal = Math.min(nhBase + niveis + modificador, nhBase);
    nhDisplay.textContent = nhFinal;
  }
}

function confirmarTecnica(id) {
  if (!tecnicaSelecionada) return;
  
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  const { pontos, niveis } = tecnicaSelecionada;
  
  // Verifica pré-requisitos novamente
  const prereqStatus = verificarPrereqTecnica(tecnica);
  
  if (!prereqStatus.todosCumpridos) {
    mostrarNotificacao('❌ Pré-requisitos não cumpridos!', 'error');
    return;
  }
  
  const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
  
  if (indexExistente >= 0) {
    // Atualizar técnica existente
    const pontosAntigos = estadoTecnicas.aprendidas[indexExistente].pontos;
    estadoTecnicas.pontosTotais += (pontos - pontosAntigos);
    
    estadoTecnicas.aprendidas[indexExistente] = {
      id: id,
      nome: tecnica.nome,
      icone: tecnica.icone,
      niveis: niveis,
      pontos: pontos,
      periciaBase: tecnica.periciaBase,
      modificadorBase: tecnica.modificadorBase
    };
    
    mostrarNotificacao(`✅ ${tecnica.nome} atualizada!`, 'success');
  } else {
    // Adicionar nova técnica
    estadoTecnicas.aprendidas.push({
      id: id,
      nome: tecnica.nome,
      icone: tecnica.icone,
      niveis: niveis,
      pontos: pontos,
      periciaBase: tecnica.periciaBase,
      modificadorBase: tecnica.modificadorBase
    });
    estadoTecnicas.pontosTotais += pontos;
    
    mostrarNotificacao(`✅ ${tecnica.nome} adquirida!`, 'success');
  }
  
  salvarTecnicas();
  fecharModalTecnica();
  renderizarTodasTecnicas();
}

function editarTecnica(id) {
  abrirModalTecnica(id);
}

function removerTecnica(id) {
  if (!confirm('Tem certeza que deseja remover esta técnica?')) return;
  
  const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
  if (index === -1) return;
  
  const tecnicaRemovida = estadoTecnicas.aprendidas[index];
  estadoTecnicas.pontosTotais -= tecnicaRemovida.pontos;
  estadoTecnicas.aprendidas.splice(index, 1);
  
  salvarTecnicas();
  renderizarTodasTecnicas();
  
  mostrarNotificacao(`🗑️ ${tecnicaRemovida.nome} removida!`, 'warning');
}

function fecharModalTecnica() {
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) overlay.style.display = 'none';
  
  // Restaura conteúdo de loading
  const modal = document.getElementById('modal-tecnica');
  if (modal) {
    modal.innerHTML = `
      <div class="modal-tecnica-loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Carregando técnica...</p>
      </div>
    `;
  }
  
  tecnicaSelecionada = null;
}

// ===== 6. UTILIDADES =====
function mostrarNotificacao(mensagem, tipo = 'info') {
  // Remove notificações antigas
  const notificacoesAntigas = document.querySelectorAll('.notificacao-tecnica');
  notificacoesAntigas.forEach(n => n.remove());
  
  const notificacao = document.createElement('div');
  notificacao.className = `notificacao-tecnica ${tipo}`;
  notificacao.innerHTML = `
    <div class="notificacao-conteudo">
      <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'warning' ? 'exclamation-triangle' : tipo === 'error' ? 'times-circle' : 'info-circle'}"></i>
      <span>${mensagem}</span>
    </div>
    <button class="notificacao-fechar" onclick="this.parentElement.remove()">&times;</button>
  `;
  
  document.body.appendChild(notificacao);
  
  // Anima entrada
  setTimeout(() => notificacao.classList.add('show'), 10);
  
  // Remove após 5 segundos
  setTimeout(() => {
    if (notificacao.parentNode) {
      notificacao.classList.remove('show');
      setTimeout(() => {
        if (notificacao.parentNode) notificacao.parentNode.removeChild(notificacao);
      }, 300);
    }
  }, 5000);
}

// ===== 7. INICIALIZAÇÃO =====
function renderizarTodasTecnicas() {
  renderizarCatalogoTecnicas();
  renderizarTecnicasAprendidas();
  atualizarEstatisticas();
}

function inicializarTecnicas() {
  console.log("🔧 Inicializando técnicas...");
  
  carregarTecnicas();
  
  // Botão de atualizar
  const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
  if (btnAtualizar) {
    btnAtualizar.addEventListener('click', () => {
      console.log("🔄 Atualizando técnicas...");
      renderizarTodasTecnicas();
      mostrarNotificacao('Técnicas atualizadas!', 'info');
    });
  }
  
  // Fechar modal ao clicar fora
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        fecharModalTecnica();
      }
    });
  }
  
  // Renderiza
  renderizarTodasTecnicas();
  
  console.log("✅ Técnicas inicializadas");
}

// ===== 8. INICIALIZAÇÃO AUTOMÁTICA =====
document.addEventListener('DOMContentLoaded', function() {
  console.log("📄 DOM carregado - Configurando técnicas");
  
  // Quando clicar na aba de técnicas
  document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
    btn.addEventListener('click', function() {
      const subtab = this.dataset.subtab;
      
      if (subtab === 'tecnicas') {
        console.log("🎯 Aba de técnicas ativada");
        setTimeout(inicializarTecnicas, 50);
      }
    });
  });
  
  // Se já estiver na aba técnicas
  const abaTecnicas = document.getElementById('subtab-tecnicas');
  if (abaTecnicas && abaTecnicas.classList.contains('active')) {
    console.log("✅ Aba de técnicas já ativa");
    setTimeout(inicializarTecnicas, 100);
  }
  
  // Fechar modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('modal-tecnica-overlay');
      if (overlay && overlay.style.display === 'flex') {
        fecharModalTecnica();
      }
    }
  });
});

// ===== 9. EXPORTAR FUNÇÕES =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarPontosTecnica = selecionarPontosTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.temPericia = temPericia;

console.log("✅ TECNICAS.JS - SISTEMA COMPLETO PRONTO");