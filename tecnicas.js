// ============================================
// TECNICAS.JS - SISTEMA COMPLETO 100% FUNCIONAL
// ============================================

// ===== 1. CONFIGURAÇÃO DO SISTEMA =====
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

// ===== 2. FUNÇÕES BÁSICAS DE CARREGAMENTO =====
function carregarTecnicas() {
  try {
    const salvo = localStorage.getItem('tecnicas_aprendidas');
    if (salvo) estadoTecnicas.aprendidas = JSON.parse(salvo);
    
    const pontos = localStorage.getItem('pontos_tecnicas');
    if (pontos) estadoTecnicas.pontosTotais = parseInt(pontos);
    
    console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) carregada(s)`);
  } catch (e) {
    console.error("❌ Erro ao carregar técnicas:", e);
  }
}

function salvarTecnicas() {
  try {
    localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
    localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
    console.log("💾 Técnicas salvas");
  } catch (e) {
    console.error("❌ Erro ao salvar técnicas:", e);
  }
}

// ===== 3. BUSCA DE PERÍCIAS - VERSÃO ROBUSTA =====
function buscarPericiasAprendidas() {
  // Tenta todas as fontes possíveis
  if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    return window.estadoPericias.periciasAprendidas;
  }
  
  // Tenta buscar do localStorage com diferentes chaves
  const chaves = ['gurps_pericias', 'pericias_aprendidas', 'pericias_personagem'];
  
  for (const chave of chaves) {
    try {
      const dados = localStorage.getItem(chave);
      if (dados) {
        const parsed = JSON.parse(dados);
        if (parsed.periciasAprendidas && Array.isArray(parsed.periciasAprendidas)) {
          return parsed.periciasAprendidas;
        }
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      // Continua para próxima chave
    }
  }
  
  return [];
}

function buscarPericiaExata(nomePericia) {
  const pericias = buscarPericiasAprendidas();
  
  // Normaliza o nome buscado
  const nomeBuscado = nomePericia.toLowerCase().trim();
  
  for (const pericia of pericias) {
    if (!pericia || !pericia.nome) continue;
    
    const nomeAtual = pericia.nome.toLowerCase().trim();
    const nomeCompleto = (pericia.nomeCompleto || pericia.nome).toLowerCase().trim();
    
    // Verificação robusta
    const matchExato = nomeAtual === nomeBuscado;
    const matchContem = nomeAtual.includes(nomeBuscado) || nomeCompleto.includes(nomeBuscado);
    const matchArco = nomeBuscado === 'arco' && (nomeAtual.includes('arco') || nomeCompleto.includes('arco'));
    const matchCavalgar = nomeBuscado === 'cavalgar' && (nomeAtual.includes('cavalgar') || nomeAtual.includes('cavalo') || nomeCompleto.includes('cavalgar'));
    
    if (matchExato || matchContem || matchArco || matchCavalgar) {
      return {
        tem: true,
        nivel: pericia.nivel || 0,
        nome: pericia.nome,
        nomeCompleto: pericia.nomeCompleto || pericia.nome
      };
    }
  }
  
  // Se não encontrou, tenta buscar no catálogo de perícias
  if (window.catalogoPericias) {
    // Função auxiliar para buscar no catálogo
    const todasPericias = window.obterTodasPericiasSimples ? window.obterTodasPericiasSimples() : [];
    const noCatalogo = todasPericias.find(p => {
      const nomeCatalogo = (p.nome || '').toLowerCase().trim();
      return nomeCatalogo === nomeBuscado || nomeCatalogo.includes(nomeBuscado);
    });
    
    if (noCatalogo) {
      return {
        tem: false, // Não está aprendida, mas existe no catálogo
        nivel: 0,
        nome: noCatalogo.nome,
        noCatalogo: true
      };
    }
  }
  
  return {
    tem: false,
    nivel: 0,
    nome: nomePericia,
    mensagem: "Perícia não encontrada"
  };
}

// ===== 4. CÁLCULO DO NH =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
  if (!tecnica) return { nh: 0, nhBase: 0, calculo: "Técnica não encontrada" };
  
  const periciaBase = buscarPericiaExata(tecnica.periciaBase);
  const nhBase = periciaBase.nivel;
  
  // NH inicial: NH base + modificador
  const nhInicial = nhBase + tecnica.modificadorBase;
  
  // NH final: NH inicial + níveis investidos, mas não excede NH base
  let nhFinal = nhInicial + niveisInvestidos;
  if (nhFinal > nhBase) {
    nhFinal = nhBase;
  }
  
  // Cálculo para exibição
  const calculo = `${nhBase}${tecnica.modificadorBase >= 0 ? '+' : ''}${tecnica.modificadorBase}${niveisInvestidos > 0 ? `+${niveisInvestidos}` : ''} = ${nhFinal}`;
  
  return {
    nh: nhFinal,
    nhBase: nhBase,
    nhInicial: nhInicial,
    periciaBase: periciaBase,
    calculo: calculo
  };
}

// ===== 5. RENDERIZAÇÃO DO CATÁLOGO =====
function renderizarCatalogoTecnicas() {
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
    
    // Busca pré-requisitos
    const arco = buscarPericiaExata("Arco");
    const cavalgar = buscarPericiaExata("Cavalgar");
    const prereqCumpridos = arco.tem && cavalgar.tem;
    
    // Calcula NH
    const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
    
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
          <span>Base: ${tecnica.periciaBase} (NH ${nhCalculo.nhBase})</span>
        </div>
        <div class="info-item">
          <i class="fas fa-arrow-down"></i>
          <span>Penalidade: ${tecnica.modificadorBase}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-calculator"></i>
          <span>NH: ${nhCalculo.nh}</span>
        </div>
      </div>
      
      <div class="tecnica-prereq">
        <strong><i class="fas fa-clipboard-check"></i> Pré-requisitos:</strong>
        <div class="prereq-status">
          <span class="${arco.tem ? 'cumprido' : 'pendente'}">
            <i class="fas fa-${arco.tem ? 'check' : 'times'}"></i>
            ${arco.nomeCompleto || arco.nome}
            ${arco.tem ? `(NH ${arco.nivel})` : ''}
          </span>
          <span class="${cavalgar.tem ? 'cumprido' : 'pendente'}">
            <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
            ${cavalgar.nomeCompleto || cavalgar.nome}
            ${cavalgar.tem ? `(NH ${cavalgar.nivel})` : ''}
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
  
  // Atualiza contador
  const contador = document.getElementById('contador-tecnicas');
  if (contador) {
    contador.textContent = `${CATALOGO_TECNICAS.length} técnica`;
  }
  
  console.log("✅ Catálogo renderizado");
}

// ===== 6. RENDERIZAÇÃO DAS TÉCNICAS APRENDIDAS =====
function renderizarTecnicasAprendidas() {
  const container = document.getElementById('tecnicas-aprendidas');
  if (!container) {
    console.error("❌ Container #tecnicas-aprendidas não encontrado");
    return;
  }
  
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
    
    const nhCalculo = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis);
    const periciaBaseInfo = buscarPericiaExata(tecnicaBase.periciaBase);
    
    const card = document.createElement('div');
    card.className = 'tecnica-aprendida-item';
    card.dataset.id = tecnicaAprendida.id;
    
    card.innerHTML = `
      <div class="tecnica-aprendida-header">
        <h3><i class="${tecnicaBase.icone}"></i> ${tecnicaBase.nome.toUpperCase()}</h3>
      </div>
      
      <div class="tecnica-aprendida-info">
        <div class="info-row">
          <span>PERÍCIA BASE:</span>
          <strong>${tecnicaBase.periciaBase} (NH ${nhCalculo.nhBase})</strong>
        </div>
        <div class="info-row">
          <span>PENALIDADE BASE:</span>
          <strong>${tecnicaBase.modificadorBase}</strong>
        </div>
        <div class="info-row">
          <span>NÍVEIS ADICIONAIS:</span>
          <strong>+${tecnicaAprendida.niveis || 0}</strong>
        </div>
      </div>
      
      <div class="tecnica-aprendida-resultado">
        <div class="resultado-label">PONTOS INVESTIDOS:</div>
        <div class="resultado-valor">${tecnicaAprendida.pontos || 0} PTS</div>
      </div>
      
      <div class="tecnica-aprendida-nh">
        <div class="nh-label">NH DA TÉCNICA:</div>
        <div class="nh-valor">${nhCalculo.nh}</div>
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
  
  console.log(`✅ ${estadoTecnicas.aprendidas.length} técnica(s) aprendida(s) renderizada(s)`);
}

// ===== 7. ATUALIZAÇÃO DE ESTATÍSTICAS =====
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
  
  console.log("📊 Estatísticas atualizadas");
}

// ===== 8. MODAL DA TÉCNICA =====
function abrirModalTecnica(id) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  if (!tecnica) {
    console.error("❌ Técnica não encontrada:", id);
    return;
  }
  
  const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
  
  // Busca pré-requisitos
  const arco = buscarPericiaExata("Arco");
  const cavalgar = buscarPericiaExata("Cavalgar");
  const prereqCumpridos = arco.tem && cavalgar.tem;
  
  // Busca perícia base
  const periciaBase = buscarPericiaExata(tecnica.periciaBase);
  const nhBase = periciaBase.nivel;
  
  // Valores iniciais
  const pontosIniciais = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
  const niveisIniciais = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
  
  // Cálculos
  const nhInicial = nhBase + tecnica.modificadorBase;
  const nhAtual = calcularNHTecnica(id, niveisIniciais).nh;
  
  // Modal
  const modal = document.getElementById('modal-tecnica');
  if (!modal) {
    console.error("❌ Modal #modal-tecnica não encontrado");
    return;
  }
  
  // HTML do modal
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
            <span>${arco.nomeCompleto || arco.nome}</span>
            <small>${arco.tem ? `NH ${arco.nivel}` : 'Faltando'}</small>
          </div>
          <div class="prereq-item ${cavalgar.tem ? 'cumprido' : 'nao-cumprido'}">
            <i class="fas fa-${cavalgar.tem ? 'check' : 'times'}"></i>
            <span>${cavalgar.nomeCompleto || cavalgar.nome}</span>
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
            <p>Arco: ${arco.tem ? '✓' : '✗'} | Cavalgar: ${cavalgar.tem ? '✓' : '✗'}</p>
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
  
  // Configura seleção inicial
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
  if (overlay) {
    overlay.style.display = 'flex';
  } else {
    console.error("❌ Overlay #modal-tecnica-overlay não encontrado");
  }
  
  // Inicializa dados da técnica selecionada
  tecnicaSelecionada = {
    id: id,
    pontos: pontosIniciais,
    niveis: niveisIniciais,
    nhBase: nhBase,
    modificador: tecnica.modificadorBase,
    nhInicial: nhInicial
  };
  
  console.log(`📋 Modal aberto: ${tecnica.nome}`);
}

function selecionarPontosTecnica(id, pontos, niveis, nhBase, modificador) {
  // Remove seleção de todas as opções
  document.querySelectorAll('.opcao-pontos').forEach(opcao => {
    opcao.classList.remove('selecionado');
  });
  
  // Adiciona seleção à opção clicada
  event.target.closest('.opcao-pontos').classList.add('selecionado');
  
  // Calcula NH
  const nhInicial = nhBase + modificador;
  const nhFinal = Math.min(nhInicial + niveis, nhBase);
  
  // Atualiza técnica selecionada
  tecnicaSelecionada = {
    id: id,
    pontos: pontos,
    niveis: niveis,
    nhBase: nhBase,
    modificador: modificador,
    nhInicial: nhInicial
  };
  
  // Atualiza resumo no modal
  const pontosDisplay = document.getElementById('pontos-resumo');
  const niveisDisplay = document.getElementById('niveis-resumo');
  const nhDisplay = document.getElementById('nh-resumo');
  
  if (pontosDisplay) pontosDisplay.textContent = pontos;
  if (niveisDisplay) niveisDisplay.textContent = `+${niveis}`;
  if (nhDisplay) nhDisplay.textContent = nhFinal;
  
  console.log(`⚙️ Pontos selecionados: ${pontos} pts, +${niveis} níveis, NH: ${nhFinal}`);
}

function confirmarTecnica(id) {
  if (!tecnicaSelecionada) {
    console.error("❌ Nenhuma técnica selecionada");
    return;
  }
  
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  if (!tecnica) {
    console.error("❌ Técnica não encontrada:", id);
    return;
  }
  
  const { pontos, niveis } = tecnicaSelecionada;
  
  // Verifica pré-requisitos novamente
  const arco = buscarPericiaExata("Arco");
  const cavalgar = buscarPericiaExata("Cavalgar");
  
  if (!arco.tem || !cavalgar.tem) {
    alert('❌ Pré-requisitos não cumpridos! Você precisa de Arco e Cavalgar.');
    console.error("❌ Pré-requisitos não cumpridos:", { arco: arco.tem, cavalgar: cavalgar.tem });
    return;
  }
  
  const indexExistente = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
  const nhCalculo = calcularNHTecnica(id, niveis);
  
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
    
    console.log(`🔄 Técnica atualizada: ${tecnica.nome}, NH: ${nhCalculo.nh}`);
    alert(`✅ ${tecnica.nome} atualizada! NH: ${nhCalculo.nh}`);
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
    
    console.log(`✨ Técnica adquirida: ${tecnica.nome}, NH: ${nhCalculo.nh}`);
    alert(`✅ ${tecnica.nome} adquirida! NH: ${nhCalculo.nh}`);
  }
  
  salvarTecnicas();
  fecharModalTecnica();
  renderizarTodasTecnicas();
}

function editarTecnica(id) {
  console.log(`✏️ Editando técnica: ${id}`);
  abrirModalTecnica(id);
}

function removerTecnica(id) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  if (!tecnica) return;
  
  if (!confirm(`Tem certeza que deseja remover a técnica "${tecnica.nome}"?`)) {
    return;
  }
  
  const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
  if (index === -1) {
    console.error("❌ Técnica não encontrada para remover:", id);
    return;
  }
  
  const tecnicaRemovida = estadoTecnicas.aprendidas[index];
  estadoTecnicas.pontosTotais -= tecnicaRemovida.pontos;
  estadoTecnicas.aprendidas.splice(index, 1);
  
  salvarTecnicas();
  renderizarTodasTecnicas();
  
  console.log(`🗑️ Técnica removida: ${tecnica.nome}`);
  alert(`🗑️ ${tecnicaRemovida.nome} removida!`);
}

function fecharModalTecnica() {
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
  
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
  console.log("🚪 Modal fechado");
}

// ===== 9. NOTIFICAÇÕES =====
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

// ===== 10. FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO =====
function renderizarTodasTecnicas() {
  console.log("🔄 Renderizando todas as técnicas...");
  renderizarCatalogoTecnicas();
  renderizarTecnicasAprendidas();
  atualizarEstatisticas();
  console.log("✅ Técnicas renderizadas com sucesso");
}

// ===== 11. INICIALIZAÇÃO DO SISTEMA =====
function inicializarTecnicas() {
  console.log("🔧 Inicializando sistema de técnicas...");
  
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
  
  // Fechar modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const overlay = document.getElementById('modal-tecnica-overlay');
      if (overlay && overlay.style.display === 'flex') {
        fecharModalTecnica();
      }
    }
  });
  
  // Renderiza tudo
  renderizarTodasTecnicas();
  
  console.log("✅ Sistema de técnicas inicializado");
}

// ===== 12. INICIALIZAÇÃO AUTOMÁTICA =====
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
});

// ===== 13. EXPORTAR FUNÇÕES PARA USO GLOBAL =====
window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.selecionarPontosTecnica = selecionarPontosTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;
window.renderizarTodasTecnicas = renderizarTodasTecnicas;
window.calcularNHTecnica = calcularNHTecnica;
window.buscarPericiaExata = buscarPericiaExata;

console.log("✅ TECNICAS.JS - SISTEMA 100% COMPLETO E FUNCIONAL CARREGADO");