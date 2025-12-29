// ============================================
// TECNICAS.JS - SISTEMA CORRETO
// ============================================

// ===== 1. CATÁLOGO DE TÉCNICAS =====
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

// ===== 2. ESTADO =====
let estadoTecnicas = {
  aprendidas: [],
  pontosTotais: 0
};
let tecnicaSelecionada = null;

// ===== 3. BUSCA DIRETA QUE FUNCIONA =====
function buscarPericiaExata(nomePericia) {
  console.log(`🔍 Buscando: "${nomePericia}"`);
  
  // Tenta no estado global primeiro
  if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
    for (let pericia of window.estadoPericias.periciasAprendidas) {
      if (!pericia) continue;
      const nomeAtual = (pericia.nomeCompleto || pericia.nome || "").toLowerCase();
      const nomeBuscado = nomePericia.toLowerCase();
      
      if (nomeAtual.includes(nomeBuscado) || nomeBuscado.includes(nomeAtual)) {
        console.log(`✅ Encontrada: ${pericia.nome} (NH: ${pericia.nivel})`);
        return {
          tem: true,
          nivel: pericia.nivel || 0,
          nome: pericia.nome,
          nomeCompleto: pericia.nomeCompleto || pericia.nome
        };
      }
    }
  }
  
  // Tenta no localStorage
  try {
    const dados = localStorage.getItem('gurps_pericias');
    if (dados) {
      const parsed = JSON.parse(dados);
      if (parsed.periciasAprendidas && Array.isArray(parsed.periciasAprendidas)) {
        for (let pericia of parsed.periciasAprendidas) {
          if (!pericia) continue;
          const nomeAtual = (pericia.nomeCompleto || pericia.nome || "").toLowerCase();
          const nomeBuscado = nomePericia.toLowerCase();
          
          if (nomeAtual.includes(nomeBuscado) || nomeBuscado.includes(nomeAtual)) {
            console.log(`✅ Encontrada no localStorage: ${pericia.nome} (NH: ${pericia.nivel})`);
            return {
              tem: true,
              nivel: pericia.nivel || 0,
              nome: pericia.nome,
              nomeCompleto: pericia.nomeCompleto || pericia.nome
            };
          }
        }
      }
    }
  } catch (e) {
    console.warn("Erro ao buscar no localStorage:", e);
  }
  
  console.warn(`❌ Não encontrou: "${nomePericia}"`);
  return {
    tem: false,
    nivel: 0,
    nome: nomePericia
  };
}

// ===== 4. CÁLCULO DO NH CORRETO =====
function calcularNHTecnica(tecnicaId, niveisInvestidos = 0) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === tecnicaId);
  if (!tecnica) return { nh: 0, calculo: "Técnica não encontrada" };
  
  // Busca o NH de Arco
  const infoArco = buscarPericiaExata("Arco");
  const nhArco = infoArco.nivel;
  
  // NH base da técnica: Arco -4
  const nhBaseTecnica = nhArco + tecnica.modificadorBase;
  
  // NH final: base + níveis investidos (mas não passa do NH de Arco)
  let nhFinal = nhBaseTecnica + niveisInvestidos;
  if (nhFinal > nhArco) nhFinal = nhArco;
  if (nhFinal < 0) nhFinal = 0;
  
  // Monta o cálculo para exibir
  const calculo = `Arco ${nhArco} -4 + ${niveisInvestidos} = ${nhFinal}`;
  
  console.log(`🧮 Cálculo: ${calculo}`);
  
  return {
    nh: nhFinal,
    nhArco: nhArco,
    nhBaseTecnica: nhBaseTecnica,
    calculo: calculo
  };
}

// ===== 5. RENDERIZA CATÁLOGO =====
function renderizarCatalogoTecnicas() {
  const container = document.getElementById('lista-tecnicas');
  if (!container) return;
  
  container.innerHTML = '';
  
  CATALOGO_TECNICAS.forEach(tecnica => {
    const jaAprendida = estadoTecnicas.aprendidas.find(t => t.id === tecnica.id);
    const infoArco = buscarPericiaExata("Arco");
    const infoCavalgar = buscarPericiaExata("Cavalgar");
    const prereqCumpridos = infoArco.tem && infoCavalgar.tem;
    const nhCalculo = calcularNHTecnica(tecnica.id, jaAprendida ? jaAprendida.niveis : 0);
    
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
    
    container.innerHTML += `
      <div class="tecnica-item">
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
            <span>Arco: NH ${nhCalculo.nhArco}</span>
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
            <span class="${infoArco.tem ? 'cumprido' : 'pendente'}">
              <i class="fas fa-${infoArco.tem ? 'check' : 'times'}"></i>
              Arco ${infoArco.tem ? `(NH ${infoArco.nivel})` : ''}
            </span>
            <span class="${infoCavalgar.tem ? 'cumprido' : 'pendente'}">
              <i class="fas fa-${infoCavalgar.tem ? 'check' : 'times'}"></i>
              Cavalgar ${infoCavalgar.tem ? `(NH ${infoCavalgar.nivel})` : ''}
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
      </div>
    `;
  });
  
  const contador = document.getElementById('contador-tecnicas');
  if (contador) {
    contador.textContent = `${CATALOGO_TECNICAS.length} técnica`;
  }
}

// ===== 6. RENDERIZA APRENDIDAS =====
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
    
    const nhCalculo = calcularNHTecnica(tecnicaAprendida.id, tecnicaAprendida.niveis);
    
    container.innerHTML += `
      <div class="tecnica-aprendida-item">
        <div class="tecnica-aprendida-header">
          <div class="tecnica-aprendida-nome">
            <i class="${tecnicaBase.icone}"></i>
            <span>${tecnicaBase.nome}</span>
          </div>
          <div class="tecnica-aprendida-nh">
            NH <span class="nh-valor">${nhCalculo.nh}</span>
          </div>
        </div>
        
        <div class="tecnica-aprendida-info">
          <div class="info-row">
            <span>Perícia Base:</span>
            <strong>${tecnicaBase.periciaBase}</strong>
          </div>
          <div class="info-row">
            <span>Níveis:</span>
            <strong>+${tecnicaAprendida.niveis}</strong>
          </div>
          <div class="info-row">
            <span>Pontos:</span>
            <strong>${tecnicaAprendida.pontos} pts</strong>
          </div>
        </div>
        
        <div class="tecnica-aprendida-calc">
          <div class="calc-label">Cálculo:</div>
          <div class="calc-formula">${nhCalculo.calculo}</div>
        </div>
        
        <div class="tecnica-aprendida-actions">
          <button class="btn-editar-tecnica" onclick="editarTecnica('${tecnicaAprendida.id}')">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-remover-tecnica" onclick="removerTecnica('${tecnicaAprendida.id}')">
            <i class="fas fa-trash"></i> Remover
          </button>
        </div>
      </div>
    `;
  });
}

// ===== 7. MODAL =====
function abrirModalTecnica(id) {
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  if (!tecnica) return;
  
  const tecnicaAprendida = estadoTecnicas.aprendidas.find(t => t.id === id);
  const infoArco = buscarPericiaExata("Arco");
  const infoCavalgar = buscarPericiaExata("Cavalgar");
  const prereqCumpridos = infoArco.tem && infoCavalgar.tem;
  
  const niveisIniciais = tecnicaAprendida ? tecnicaAprendida.niveis : 1;
  const pontosIniciais = tecnicaAprendida ? tecnicaAprendida.pontos : 2;
  const nhCalculo = calcularNHTecnica(id, niveisIniciais);
  
  const modal = document.getElementById('modal-tecnica');
  if (!modal) return;
  
  modal.innerHTML = `
    <div class="modal-tecnica-content">
      <div class="modal-tecnica-header">
        <h3><i class="${tecnica.icone}"></i> ${tecnica.nome}</h3>
        <button class="modal-tecnica-close" onclick="fecharModalTecnica()">&times;</button>
      </div>
      
      <div class="modal-tecnica-body">
        <div class="modal-tecnica-info">
          <div class="info-row">
            <span>Perícia Base:</span>
            <span class="info-value">${tecnica.periciaBase} (NH ${nhCalculo.nhArco})</span>
          </div>
          <div class="info-row">
            <span>Penalidade Base:</span>
            <span class="info-value">${tecnica.modificadorBase}</span>
          </div>
          <div class="info-row">
            <span>NH Base da Técnica:</span>
            <span class="info-value">${nhCalculo.nhBaseTecnica}</span>
          </div>
        </div>
        
        <div class="modal-tecnica-descricao">
          <p>${tecnica.descricao}</p>
        </div>
        
        <div class="modal-tecnica-prereq">
          <h4><i class="fas fa-clipboard-check"></i> Pré-requisitos</h4>
          <div class="prereq-item ${infoArco.tem ? 'cumprido' : 'pendente'}">
            <i class="fas fa-${infoArco.tem ? 'check' : 'times'}"></i>
            <span>Arco</span>
            <small>${infoArco.tem ? `NH ${infoArco.nivel}` : 'Não aprendida'}</small>
          </div>
          <div class="prereq-item ${infoCavalgar.tem ? 'cumprido' : 'pendente'}">
            <i class="fas fa-${infoCavalgar.tem ? 'check' : 'times'}"></i>
            <span>Cavalgar</span>
            <small>${infoCavalgar.tem ? `NH ${infoCavalgar.nivel}` : 'Não aprendida'}</small>
          </div>
        </div>
        
        ${prereqCumpridos ? `
        <div class="modal-tecnica-controles">
          <div class="controle-pontos">
            <h4>Investir Pontos</h4>
            <div class="pontos-opcoes">
              <div class="opcao-pontos ${pontosIniciais === 2 ? 'selecionado' : ''}" 
                   data-pontos="2" data-niveis="1"
                   onclick="selecionarOpcaoTecnica(this, '${id}')">
                <span class="pontos-valor">2 pts</span>
                <span class="niveis-valor">= +1 nível</span>
              </div>
              <div class="opcao-pontos ${pontosIniciais === 3 ? 'selecionado' : ''}" 
                   data-pontos="3" data-niveis="2"
                   onclick="selecionarOpcaoTecnica(this, '${id}')">
                <span class="pontos-valor">3 pts</span>
                <span class="niveis-valor">= +2 níveis</span>
              </div>
              <div class="opcao-pontos ${pontosIniciais === 4 ? 'selecionado' : ''}" 
                   data-pontos="4" data-niveis="3"
                   onclick="selecionarOpcaoTecnica(this, '${id}')">
                <span class="pontos-valor">4 pts</span>
                <span class="niveis-valor">= +3 níveis</span>
              </div>
              <div class="opcao-pontos ${pontosIniciais === 5 ? 'selecionado' : ''}" 
                   data-pontos="5" data-niveis="4"
                   onclick="selecionarOpcaoTecnica(this, '${id}')">
                <span class="pontos-valor">5 pts</span>
                <span class="niveis-valor">= +4 níveis</span>
              </div>
            </div>
          </div>
          
          <div class="visualizacao-nh">
            <h4>Cálculo do NH</h4>
            <div class="nh-calculado">
              <div class="nh-item">
                <span>NH Arco:</span>
                <strong>${nhCalculo.nhArco}</strong>
              </div>
              <div class="nh-item">
                <span>Penalidade:</span>
                <strong>${tecnica.modificadorBase}</strong>
              </div>
              <div class="nh-item">
                <span>Níveis Adicionais:</span>
                <strong id="nh-niveis">+${niveisIniciais}</strong>
              </div>
              <div class="nh-item total">
                <span>NH Final:</span>
                <strong id="nh-final">${nhCalculo.nh}</strong>
              </div>
            </div>
            <div class="formula-nh">
              <code id="formula-texto">${nhCalculo.calculo}</code>
            </div>
          </div>
        </div>
        
        <div class="modal-tecnica-resumo">
          <div class="resumo-item">
            <span>Pontos Investidos:</span>
            <strong id="resumo-pontos">${pontosIniciais}</strong>
          </div>
          <div class="resumo-item">
            <span>Níveis Adquiridos:</span>
            <strong id="resumo-niveis">+${niveisIniciais}</strong>
          </div>
          <div class="resumo-item">
            <span>NH da Técnica:</span>
            <strong id="resumo-nh">${nhCalculo.nh}</strong>
          </div>
        </div>
        ` : `
        <div class="modal-tecnica-alerta">
          <i class="fas fa-exclamation-triangle"></i>
          <div>
            <strong>Pré-requisitos incompletos!</strong>
            <p>Aprenda as perícias acima para adquirir esta técnica.</p>
          </div>
        </div>
        `}
      </div>
      
      <div class="modal-tecnica-footer">
        <div class="modal-custo-total">
          <span class="label">Custo Total:</span>
          <span class="valor" id="modal-custo-total">${pontosIniciais}</span>
          <span> pontos</span>
        </div>
        <div class="modal-actions">
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
    </div>
  `;
  
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) overlay.style.display = 'flex';
  
  tecnicaSelecionada = {
    id: id,
    niveis: niveisIniciais,
    pontos: pontosIniciais,
    nhArco: nhCalculo.nhArco,
    modificador: tecnica.modificadorBase
  };
}

function selecionarOpcaoTecnica(elemento, tecnicaId) {
  elemento.parentElement.querySelectorAll('.opcao-pontos').forEach(op => {
    op.classList.remove('selecionado');
  });
  elemento.classList.add('selecionado');
  
  const niveis = parseInt(elemento.dataset.niveis);
  const pontos = parseInt(elemento.dataset.pontos);
  
  tecnicaSelecionada = {
    ...tecnicaSelecionada,
    niveis: niveis,
    pontos: pontos
  };
  
  const nhFinal = Math.min(tecnicaSelecionada.nhArco - 4 + niveis, tecnicaSelecionada.nhArco);
  
  document.getElementById('resumo-pontos').textContent = pontos;
  document.getElementById('resumo-niveis').textContent = `+${niveis}`;
  document.getElementById('resumo-nh').textContent = nhFinal;
  document.getElementById('modal-custo-total').textContent = pontos;
  document.getElementById('nh-niveis').textContent = `+${niveis}`;
  document.getElementById('nh-final').textContent = nhFinal;
  document.getElementById('formula-texto').textContent = `Arco ${tecnicaSelecionada.nhArco} -4 + ${niveis} = ${nhFinal}`;
}

function confirmarTecnica(id) {
  if (!tecnicaSelecionada) return;
  const tecnica = CATALOGO_TECNICAS.find(t => t.id === id);
  if (!tecnica) return;
  
  const infoArco = buscarPericiaExata("Arco");
  const infoCavalgar = buscarPericiaExata("Cavalgar");
  if (!infoArco.tem || !infoCavalgar.tem) {
    alert('❌ Pré-requisitos não cumpridos!');
    return;
  }
  
  const { pontos, niveis } = tecnicaSelecionada;
  const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
  
  if (index >= 0) {
    estadoTecnicas.pontosTotais += (pontos - estadoTecnicas.aprendidas[index].pontos);
    estadoTecnicas.aprendidas[index] = {
      id: id,
      nome: tecnica.nome,
      icone: tecnica.icone,
      niveis: niveis,
      pontos: pontos,
      periciaBase: tecnica.periciaBase
    };
  } else {
    estadoTecnicas.aprendidas.push({
      id: id,
      nome: tecnica.nome,
      icone: tecnica.icone,
      niveis: niveis,
      pontos: pontos,
      periciaBase: tecnica.periciaBase
    });
    estadoTecnicas.pontosTotais += pontos;
  }
  
  localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
  localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
  
  fecharModalTecnica();
  renderizarTodasTecnicas();
}

function fecharModalTecnica() {
  const overlay = document.getElementById('modal-tecnica-overlay');
  if (overlay) overlay.style.display = 'none';
  tecnicaSelecionada = null;
}

function editarTecnica(id) {
  abrirModalTecnica(id);
}

function removerTecnica(id) {
  if (!confirm('Remover esta técnica?')) return;
  const index = estadoTecnicas.aprendidas.findIndex(t => t.id === id);
  if (index === -1) return;
  estadoTecnicas.pontosTotais -= estadoTecnicas.aprendidas[index].pontos;
  estadoTecnicas.aprendidas.splice(index, 1);
  localStorage.setItem('tecnicas_aprendidas', JSON.stringify(estadoTecnicas.aprendidas));
  localStorage.setItem('pontos_tecnicas', estadoTecnicas.pontosTotais.toString());
  renderizarTodasTecnicas();
}

// ===== 8. FUNÇÕES PRINCIPAIS =====
function carregarTecnicas() {
  const salvo = localStorage.getItem('tecnicas_aprendidas');
  if (salvo) estadoTecnicas.aprendidas = JSON.parse(salvo);
  const pontos = localStorage.getItem('pontos_tecnicas');
  if (pontos) estadoTecnicas.pontosTotais = parseInt(pontos);
}

function atualizarEstatisticas() {
  const total = document.getElementById('total-tecnicas');
  const pontos = document.getElementById('pontos-tecnicas');
  const pontosAprendidas = document.getElementById('pontos-tecnicas-aprendidas');
  if (total) total.textContent = estadoTecnicas.aprendidas.length;
  if (pontos) pontos.textContent = estadoTecnicas.pontosTotais;
  if (pontosAprendidas) pontosAprendidas.textContent = `${estadoTecnicas.pontosTotais} pts`;
}

function renderizarTodasTecnicas() {
  carregarTecnicas();
  renderizarCatalogoTecnicas();
  renderizarTecnicasAprendidas();
  atualizarEstatisticas();
}

// ===== 9. INICIALIZAÇÃO =====
function inicializarTecnicas() {
  carregarTecnicas();
  renderizarTodasTecnicas();
  
  const btnAtualizar = document.getElementById('btn-atualizar-tecnicas');
  if (btnAtualizar) {
    btnAtualizar.onclick = renderizarTodasTecnicas;
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.subtab-btn-pericias').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.dataset.subtab === 'tecnicas') {
        setTimeout(inicializarTecnicas, 100);
      }
    });
  });
  
  const abaTecnicas = document.getElementById('subtab-tecnicas');
  if (abaTecnicas && abaTecnicas.classList.contains('active')) {
    setTimeout(inicializarTecnicas, 200);
  }
});

window.inicializarTecnicas = inicializarTecnicas;
window.abrirModalTecnica = abrirModalTecnica;
window.fecharModalTecnica = fecharModalTecnica;
window.confirmarTecnica = confirmarTecnica;
window.editarTecnica = editarTecnica;
window.removerTecnica = removerTecnica;

console.log("✅ TECNICAS.JS - SISTEMA CORRETO CARREGADO");