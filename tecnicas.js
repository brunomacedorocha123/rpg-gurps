// ============================================
// TECNICAS.JS - SISTEMA COMPLETO E FUNCIONAL
// ============================================

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
  }
];

let estadoTecnicas = {
  aprendidas: [],
  pontosTotais: 0
};

let tecnicaSelecionada = null;

// ===== 1. FUNÇÕES BÁSICAS =====
function carregarTecnicas() {
  try {
    const salvo = localStorage.getItem('tecnicas_aprendidas');
    if (salvo) estadoTecnicas.aprendidas = JSON.parse(salvo);
    
    const pontos = localStorage.getItem('pontos_tecnicas');
    if (pontos) estadoTecnicas.pontosTotais = parseInt(pontos);
  } catch (e) {}
}

function salvarTecnicas() {
  localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
  localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
}

// ===== 2. BUSCAR PERÍCIAS =====
function buscarPericiasAprendidas() {
  // Tenta buscar do sistema principal
  if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    return window.estadoPericias.periciasAprendidas;
  }
  
  // Tenta buscar do localStorage
  try {
    const dados = localStorage.getItem('gurps_pericias');
    if (dados) {
      const parsed = JSON.parse(dados);
      if (parsed.periciasAprendidas) return parsed.periciasAprendidas;
    }
  } catch (e) {}
  
  return [];
}

function buscarPericiaExata(nomePericia) {
  const pericias = buscarPericiasAprendidas();
  
  // Procura a perícia pelo nome
  for (const pericia of pericias) {
    if (!pericia || !pericia.nome) continue;
    
    const nomeBase = pericia.nome.trim();
    const nomeCompleto = pericia.nomeCompleto || nomeBase;
    
    // Verifica se é exatamente a perícia
    if (nomeBase.toLowerCase() === nomePericia.toLowerCase()) {
      return { 
        tem: true, 
        nivel: pericia.nivel || 0,
        nome: nomeBase
      };
    }
    
    // Verifica se contém o nome (para casos como "Cavalgar")
    if (nomePericia.toLowerCase() === "cavalgar") {
      if (nomeCompleto.toLowerCase().includes("cavalgar")) {
        return { 
          tem: true, 
          nivel: pericia.nivel || 0,
          nome: nomeCompleto
        };
      }
    }
  }
  
  // Se não encontrou
  return { tem: false, nivel: 0, nome: nomePericia };
}

// ===== 3. CÁLCULO DO NH =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
  if (!tecnica) return 0;
  
  // Busca a perícia base
  const periciaBase = buscarPericiaExata(tecnica.periciaBase);
  const nhBase = periciaBase.nivel;
  
  // NH final = NH base + modificador + níveis investidos
  let nhFinal = nhBase + tecnica.modificadorBase + niveisInvestidos;
  
  // Limite: nunca excede o NH base
  if (nhFinal > nhBase) {
    nhFinal = nhBase;
  }
  
  return nhFinal;
}

// ===== 4. RENDERIZAÇÃO =====
function renderizarCatalogoTecnicas() {
  const container = document.getElementById('lista-tecnicas');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (CATALOGO_TECNICAS.length === 0) {
    container.innerHTML = '<div class="empty-state">Nenhuma técnica disponível</div>';
    return;
  }
  
  CATALOGO_TECNICAS.forEach(tecnica => {
    const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
    
    // Verifica pré-requisitos
    const arco = buscarPericiaExata("Arco");
    const cavalgar = buscarPericiaExata("Cavalgar");
    const prereqCumpridos = arco.tem && cavalgar.tem;
    
    // Calcula NH
    const nhFinal = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
    
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
    
    const card = document.createElement('div');
    card.className = 'tecnica-item';
    if (!prereqCumpridos) card.classList.add('bloqueada');
    card.dataset.id = tecnica.id;
    
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
          <span>Base: ${tecnica.periciaBase} (NH ${arco.nivel})</span>
        </div>
        <div class="info-item">
          <i class="fas fa-arrow-down"></i>
          <span>Penalidade: ${tecnica.modificadorBase}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-calculator"></i>
          <span>NH: ${nhFinal}</span>
        </div>
      </div>
      
      <div class="tecnica-prereq">
        <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
        <div class="prereq-status">
          <span class="${arco.tem ? 'cumprido' : 'pendente'}">
            <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i> Arco ${arco.tem ? `(NH ${arco.nivel})` : ''}
          </span>
          <span class="${cavalgar.tem ? 'cumprido' : 'pendente'}">
            <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i> Cavalgar ${cavalgar.tem ? `(NH ${cavalgar.nivel})` : ''}
          </span>
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
    
    // Busca a perícia base
    const periciaBase = buscarPericiaExata(tecnicaBase.periciaBase);
    
    // Calcula NH da técnica
    const nhFinal = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis);
    
    const card = document.createElement('div');
    card.className = 'tecnica-aprendida-item';
    card.dataset.id = tecnicaAprendida.id;
    
    card.innerHTML = `
      <div class="tecnica-aprendida-header">
        <div class="tecnica-aprendida-nome">
          <i class="${tecnicaBase.icone}"></i>
          <span>${tecnicaBase.nome.toUpperCase()}</span>
        </div>
      </div>
      
      <div class="tecnica-aprendida-info">
        <div class="info-row">
          <span>PERÍCIA BASE:</span>
          <strong>${tecnicaBase.periciaBase} (NH ${periciaBase.nivel})</strong>
        </div>
        <div class="info-row">
          <span>PENALIDADE BASE:</span>
          <strong>${tecnicaBase.modificadorBase}</strong>
        </div>
        <div class="info-row">
          <span>NÍVEIS ADICIONAIS:</span>
          <strong>+${tecnicaAprendida.niveis || 0}</strong>
        </div>
        <div class="info-row">
          <span>PONTOS INVESTIDOS:</span>
          <strong>${tecnicaAprendida.pontos || 0} PTS</strong>
        </div>
      </div>
      
      <div class="tecnica-aprendida-nh">
        NH DA TÉCNICA:
        <span class="nh-valor">${nhFinal}</span>
      </div>
      
      <div class="tecnica-aprendida-actions">
        <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
          <i class="fas fa-edit"></i> EDITAR
        </button>
        <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
          <i class="fas fa-times"></i> REMOVER
        </button>
      </div>
    `;
    
    container.appendChild(card);
  });
}

function atualizarEstatisticas() {
  const elementos = [
    { id: 'total-tecnicas', valor: estadoTecnicas.aprendidas.length },
    { id: 'pontos-tecnicas', valor: estadoTecnicas.pontosTotais },
    { id: 'pontos-tecnicas-aprendidas', valor: `${estadoTecnicas.pontosTotais} pts` }
  ];
  
  elementos.forEach(elem => {
    const el = document.getElementById(elem.id);
    if (el) el.textContent = elem.valor;
  });
}

// ===== 5. MODAL =====
function abrirModalTecnica(id) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  if (!tecnica) return;
  
  const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
  
  // Verifica pré-requisitos
  const arco = buscarPericiaExata("Arco");
  const cavalgar = buscarPericiaExata("Cavalgar");
  const prereqCumpridos = arco.tem && cavalgar.tem;
  
  // Busca perícia base
  const periciaBase = buscarPericiaExata(tecnica.periciaBase);
  const nhBase = periciaBase.nivel;
  
  const pontosIniciais = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
  const niveisIniciais = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
  
  // Calcula NH inicial
  const nhInicial = nhBase + tecnica.modificadorBase;
  const nhAtual = calcularNHTecnica(id, niveisIniciais);
  
  const modal = document.getElementById('modal-tecnica');
  if (!modal) return;
  
  const modalHTML = `
    <div class="modal-tecnica-content">
      <div class="modal-tecnica-header">
        <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
        <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
      </div>
      
      <div class="modal-tecnica-body">
        <div class="tecnica-modal-info">
          <div class="info-row">
            <span><strong>Perícia Base:</strong> ${tecnica.periciaBase}</span>
            <span><strong>NH Base:</strong> ${nhBase}</span>
          </div>
          <div class="info-row">
            <span><strong>Penalidade:</strong> ${tecnica.modificadorBase}</span>
            <span><strong>NH Inicial:</strong> ${nhInicial}</span>
          </div>
        </div>
        
        <div class="tecnica-modal-descricao">
          <p>${tecnica.descricao}</p>
        </div>
        
        <div class="tecnica-modal-prereq">
          <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
          <div class="prereq-item ${arco.tem ? 'cumprido' : 'nao-cumprido'}">
            <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i>
            <span>Arco</span>
            <small>${arco.tem ? `NH ${arco.nivel}` : 'Faltando'}</small>
          </div>
          <div class="prereq-item ${cavalgar.tem ? 'cumprido' : 'nao-cumprido'}">
            <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
            <span>Cavalgar</span>
            <small>${cavalgar.tem ? `NH ${cavalgar.nivel}` : 'Faltando'}</small>
          </div>
        </div>
        
        ${prereqCumpridos ? `
        <div class="tecnica-modal-pontos">
          <h4><i class="fas fa-coins"></i> Investir Pontos</h4>
          <div class="pontos-opcoes">
            <button class="opcao-pontos ${pontosIniciais === 2 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica('${id}', 2, 1, ${nhBase}, ${tecnica.modificadorBase})">
              <div class="pontos-valor">2 pontos</div>
              <div class="nivel-valor">+1 nível</div>
              <div class="nh-resultado">NH: ${Math.min(nhInicial + 1, nhBase)}</div>
            </button>
            <button class="opcao-pontos ${pontosIniciais === 3 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica('${id}', 3, 2, ${nhBase}, ${tecnica.modificadorBase})">
              <div class="pontos-valor">3 pontos</div>
              <div class="nivel-valor">+2 níveis</div>
              <div class="nh-resultado">NH: ${Math.min(nhInicial + 2, nhBase)}</div>
            </button>
            <button class="opcao-pontos ${pontosIniciais === 4 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica('${id}', 4, 3, ${nhBase}, ${tecnica.modificadorBase})">
              <div class="pontos-valor">4 pontos</div>
              <div class="nivel-valor">+3 níveis</div>
              <div class="nh-resultado">NH: ${Math.min(nhInicial + 3, nhBase)}</div>
            </button>
            <button class="opcao-pontos ${pontosIniciais === 5 ? 'selecionado' : ''}"
                onclick="selecionarPontosTecnica('${id}', 5, 4, ${nhBase}, ${tecnica.modificadorBase})">
              <div class="pontos-valor">5 pontos</div>
              <div class="nivel-valor">+4 níveis</div>
              <div class="nh-resultado">NH: ${Math.min(nhInicial + 4, nhBase)}</div>
            </button>
          </div>
        </div>
        
        <div class="tecnica-modal-resumo">
          <h4><i class="fas fa-calculator"></i> Resumo</h4>
          <div class="resumo-item">
            <span>Pontos Investidos:</span>
            <strong id="pontos-resumo">${pontosIniciais}</strong>
          </div>
          <div class="resumo-item">
            <span>Níveis Adicionais:</span>
            <strong id="niveis-resumo">+${niveisIniciais}</strong>
          </div>
          <div class="resumo-item">
            <span>NH da Técnica:</span>
            <strong id="nh-resumo">${nhAtual}</strong>
          </div>
        </div>
        ` : `
        <div class="prereq-alerta">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Pré-requisitos não cumpridos!</strong>
            <p>Você precisa aprender Arco e Cavalgar para adquirir esta técnica.</p>
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
  
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) overlay.style.display = 'flex';
  
  tecnicaSelecionada = {
    id: id,
    pontos: pontosIniciais,
    niveis: niveisIniciais,
    nhBase: nhBase,
    modificador: tecnica.modificadorBase,
    nhInicial: nhInicial
  };
}

function selecionarPontosTecnica(id, pontos, niveis, nhBase, modificador) {
  document.querySelectorAll('.opcao-pontos').forEach(opcao => {
    opcao.classList.remove('selecionado');
  });
  
  event.target.closest('.opcao-pontos').classList.add('selecionado');
  
  const nhInicial = nhBase + modificador;
  const nhFinal = Math.min(nhInicial + niveis, nhBase);
  
  tecnicaSelecionada = {
    id: id,
    pontos: pontos,
    niveis: niveis,
    nhBase: nhBase,
    modificador: modificador,
    nhInicial: nhInicial
  };
  
  const pontosDisplay = document.getElementById('pontos-resumo');
  const niveisDisplay = document.getElementById('niveis-resumo');
  const nhDisplay = document.getElementById('nh-resumo');
  
  if (pontosDisplay) pontosDisplay.textContent = pontos;
  if (niveisDisplay) niveisDisplay.textContent = `+${niveis}`;
  if (nhDisplay) nhDisplay.textContent = nhFinal;
}

function confirmarTecnica(id) {
  if (!tecnicaSelecionada) return;
  
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  const { pontos, niveis } = tecnicaSelecionada;
  
  const arco = buscarPericiaExata("Arco");
  const cavalgar = buscarPericiaExata("Cavalgar");
  
  if (!arco.tem || !cavalgar.tem) {
    alert('Pré-requisitos não cumpridos! Você precisa de Arco e Cavalgar.');
    return;
  }
  
  const periciaBase = buscarPericiaExata(tecnica.periciaBase);
  if (!periciaBase.tem) {
    alert(`Você precisa aprender ${tecnica.periciaBase} primeiro!`);
    return;
  }
  
  const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
  const nhFinal = calcularNHTecnica(id, niveis);
  
  if (indexExistente >= 0) {
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
  } else {
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
}

function fecharModalTecnica() {
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) overlay.style.display = 'none';
  
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
  
  setTimeout(() => notificacao.classList.add('show'), 10);
  
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
  carregarTecnicas();
  renderizarTodasTecnicas();
}

// ===== 8. EVENTOS =====
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
    btn.addEventListener('click', function() {
      const subtab = this.dataset.subtab;
      if (subtab === 'tecnicas') {
        setTimeout(inicializarTecnicas, 50);
      }
    });
  });
  
  const abaTecnicas = document.getElementById('subtab-tecnicas');
  if (abaTecnicas && abaTecnicas.classList.contains('active')) {
    setTimeout(inicializarTecnicas, 100);
  }
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('modal-tecnica-overlay');
      if (overlay && overlay.style.display === 'flex') {
        fecharModalTecnica();
      }
    }
  });
});

// ===== 9. EXPORTAR =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarPontosTecnica = selecionarPontosTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.calcularNHTecnica = calcularNHTecnica;