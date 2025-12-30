// ===== SISTEMA CORE DE MAGIA =====
class SistemaMagia {
  constructor() {
    this.magiasAprendidas = [];
    this.magiaSelecionada = null;
    this.pontosSelecionados = 1;
    this.magiaEditando = null;
    this.iqTimeout = null;
    this.htTimeout = null;
    this.aptidaoTimeout = null;
    
    this.inicializarSistema();
  }

  inicializarSistema() {
    this.carregarDadosSalvos();
    this.configurarObservadorAtributosMagia();
    this.configurarFiltrosManualmente();
    this.configurarEventos();
    this.atualizarInterface();
    
    setTimeout(() => {
      this.atualizarStatusMagico();
      this.filtrarCatalogo();
    }, 100);
  }

  configurarFiltrosManualmente() {
    document.querySelectorAll('.filtro-header').forEach(header => {
      const newHeader = header.cloneNode(true);
      header.parentNode.replaceChild(newHeader, header);
    });

    setTimeout(() => {
      const headerEscolas = document.querySelector('.filtro-header[onclick*="escolas-submenu"]');
      if (headerEscolas) {
        headerEscolas.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleSubmenu('escolas-submenu');
        });
      }

      const headerClasses = document.querySelector('.filtro-header[onclick*="classes-submenu"]');
      if (headerClasses) {
        headerClasses.addEventListener('click', (e) => {
          e.stopPropagation();
          this.toggleSubmenu('classes-submenu');
        });
      }

      const todasEscolas = document.getElementById('escola-todas');
      if (todasEscolas) {
        todasEscolas.addEventListener('change', (e) => {
          const escolasCheckboxes = document.querySelectorAll('.escola-checkbox');
          const isChecked = e.target.checked;
          
          escolasCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.disabled = isChecked;
          });
          
          this.filtrarCatalogo();
        });
      }

      const todasClasses = document.getElementById('classe-todas');
      if (todasClasses) {
        todasClasses.addEventListener('change', (e) => {
          const classesCheckboxes = document.querySelectorAll('.classe-checkbox');
          const isChecked = e.target.checked;
          
          classesCheckboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            checkbox.disabled = isChecked;
          });
          
          this.filtrarCatalogo();
        });
      }

      document.querySelectorAll('.escola-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          this.verificarTodasEscolas();
          this.filtrarCatalogo();
        });
      });

      document.querySelectorAll('.classe-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          this.verificarTodasClasses();
          this.filtrarCatalogo();
        });
      });

      const buscaInput = document.getElementById('busca-magias');
      if (buscaInput) {
        buscaInput.addEventListener('input', () => {
          this.filtrarCatalogo();
        });
      }
    }, 150);
  }

  toggleSubmenu(submenuId) {
    const submenu = document.getElementById(submenuId);
    if (!submenu) return;

    document.querySelectorAll('.filtro-submenu').forEach(otherMenu => {
      if (otherMenu.id !== submenuId && otherMenu.classList.contains('active')) {
        otherMenu.classList.remove('active');
        const otherHeader = otherMenu.previousElementSibling;
        if (otherHeader) {
          const icon = otherHeader.querySelector('.fa-chevron-down, .fa-chevron-up');
          if (icon) icon.className = 'fas fa-chevron-down';
        }
      }
    });

    submenu.classList.toggle('active');
    const header = submenu.previousElementSibling;
    if (header) {
      const icon = header.querySelector('.fa-chevron-down, .fa-chevron-up');
      if (icon) {
        icon.className = submenu.classList.contains('active') ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
      }
    }
  }

  verificarTodasEscolas() {
    const todasEscolas = document.getElementById('escola-todas');
    const escolasCheckboxes = document.querySelectorAll('.escola-checkbox:not([disabled])');
    const todasMarcadas = Array.from(escolasCheckboxes).every(checkbox => checkbox.checked);
    
    if (todasEscolas) {
      todasEscolas.checked = todasMarcadas;
    }
  }

  verificarTodasClasses() {
    const todasClasses = document.getElementById('classe-todas');
    const classesCheckboxes = document.querySelectorAll('.classe-checkbox:not([disabled])');
    const todasMarcadas = Array.from(classesCheckboxes).every(checkbox => checkbox.checked);
    
    if (todasClasses) {
      todasClasses.checked = todasMarcadas;
    }
  }

  configurarObservadorAtributosMagia() {
    const iqInput = document.getElementById('IQ');
    if (iqInput) {
      iqInput.addEventListener('input', () => {
        clearTimeout(this.iqTimeout);
        this.iqTimeout = setTimeout(() => {
          this.atualizarStatusMagico();
          this.atualizarNHsMagias();
        }, 300);
      });
    }

    const htInput = document.getElementById('HT');
    if (htInput) {
      htInput.addEventListener('input', () => {
        clearTimeout(this.htTimeout);
        this.htTimeout = setTimeout(() => {
          this.atualizarStatusMagico();
        }, 300);
      });
    }

    const aptidaoInput = document.getElementById('aptidao-magica');
    if (aptidaoInput) {
      aptidaoInput.addEventListener('input', () => {
        clearTimeout(this.aptidaoTimeout);
        this.aptidaoTimeout = setTimeout(() => {
          this.atualizarStatusMagico();
          this.atualizarNHsMagias();
        }, 300);
      });
    }

    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-plus, .btn-minus');
      if (btn) {
        setTimeout(() => {
          const container = btn.closest('.atributo-container');
          if (container) {
            const input = container.querySelector('input[type="number"]');
            if (input) {
              if (input.id === 'IQ') {
                this.atualizarStatusMagico();
                this.atualizarNHsMagias();
              } else if (input.id === 'HT') {
                this.atualizarStatusMagico();
              } else if (input.id === 'aptidao-magica') {
                this.atualizarStatusMagico();
                this.atualizarNHsMagias();
              }
            }
          }
        }, 100);
      }
    });
  }

  atualizarStatusMagico() {
    const iq = this.obterIQ();
    const ht = this.obterHT();
    
    const iqMagicoElem = document.getElementById('iq-magico');
    if (iqMagicoElem) {
      iqMagicoElem.textContent = iq;
    }
    
    const manaBaseElem = document.getElementById('mana-base');
    if (manaBaseElem) {
      manaBaseElem.textContent = ht;
    }
    
    const manaAtualElem = document.getElementById('mana-atual');
    if (manaAtualElem) {
      const manaAtual = parseInt(manaAtualElem.value) || 0;
      if (manaAtual > ht) {
        manaAtualElem.value = ht;
      }
      manaAtualElem.max = ht;
    }
  }

  atualizarNHsMagias() {
    this.magiasAprendidas.forEach(magia => {
      if (typeof catalogoMagias !== 'undefined') {
        const magiaBase = catalogoMagias.find(m => m.id === magia.id);
        if (magiaBase) {
          magia.nivel = this.calcularNH(magiaBase, magia.pontos);
        }
      }
    });
    
    this.atualizarListaAprendidas();
    this.salvarDados();
  }

  obterEscolasSelecionadas() {
    const todasEscolas = document.getElementById('escola-todas');
    if (todasEscolas && todasEscolas.checked) {
      return [];
    }

    const escolas = [];
    const escolasCheckboxes = document.querySelectorAll('.escola-checkbox:checked');
    escolasCheckboxes.forEach(checkbox => {
      const escolaId = checkbox.id.replace('escola-', '');
      escolas.push(escolaId);
    });

    return escolas;
  }

  obterClassesSelecionadas() {
    const todasClasses = document.getElementById('classe-todas');
    if (todasClasses && todasClasses.checked) {
      return [];
    }

    const classes = [];
    const classesCheckboxes = document.querySelectorAll('.classe-checkbox:checked');
    classesCheckboxes.forEach(checkbox => {
      const classeId = checkbox.id.replace('classe-', '');
      classes.push(classeId);
    });

    return classes;
  }

  filtrarCatalogo() {
    if (typeof catalogoMagias === 'undefined') {
      return;
    }

    const buscaInput = document.getElementById('busca-magias');
    const termoBusca = buscaInput ? buscaInput.value.toLowerCase().trim() : '';

    const escolasSelecionadas = this.obterEscolasSelecionadas();
    const classesSelecionadas = this.obterClassesSelecionadas();

    const magiasFiltradas = catalogoMagias.filter(magia => {
      if (termoBusca && termoBusca.length > 0) {
        const nomeMatch = magia.nome.toLowerCase().includes(termoBusca);
        const descMatch = magia.descricao.toLowerCase().includes(termoBusca);
        if (!nomeMatch && !descMatch) {
          return false;
        }
      }

      if (escolasSelecionadas.length > 0 && !escolasSelecionadas.includes(magia.escola)) {
        return false;
      }

      if (classesSelecionadas.length > 0 && !classesSelecionadas.includes(magia.classe)) {
        return false;
      }

      return true;
    });

    this.mostrarMagiasFiltradas(magiasFiltradas);
  }

  mostrarMagiasFiltradas(magias) {
    const container = document.getElementById('lista-magias');
    if (!container) return;

    if (magias.length === 0) {
      container.innerHTML = '<div class="nenhuma-magia">Nenhuma magia encontrada</div>';
      return;
    }

    container.innerHTML = magias.map(magia => {
      const magiaAprendida = this.magiasAprendidas.find(m => m.id === magia.id);
      const jaAprendida = !!magiaAprendida;
      
      return `
        <div class="magia-item-catalogo ${jaAprendida ? 'aprendida' : ''}" 
             onclick="sistemaMagia.mostrarDetalhesMagia(${magia.id})">
          <div class="magia-nome">
            ${magia.nome}
            ${jaAprendida ? '<span class="magia-aprendida-badge">✓ Aprendida</span>' : ''}
          </div>
          <div class="magia-info-rapida">
            <span class="magia-escola">${this.formatarEscola(magia.escola)}</span>
            <span class="magia-classe">${this.formatarClasse(magia.classe)}</span>
            <span class="magia-custo">${magia.custoMana} mana</span>
            <span class="magia-nh">NH ${magia.nhBase}</span>
          </div>
          <div class="magia-descricao-curta">${magia.descricao.substring(0, 100)}...</div>
          <div class="magia-controles">
            ${jaAprendida ?
              `<button class="btn-editar-magia" 
                   onclick="event.stopPropagation(); sistemaMagia.abrirModalEdicao(${magia.id})">
                <i class="fas fa-edit"></i> Editar (NH ${magiaAprendida.nivel})
              </button>` :
              `<button class="btn-aprender-magia" 
                   onclick="event.stopPropagation(); sistemaMagia.abrirModalAprendizagem(${magia.id})">
                <i class="fas fa-plus-circle"></i> Aprender
              </button>`
            }
            <button class="btn-detalhes-magia" 
                onclick="event.stopPropagation(); sistemaMagia.mostrarDetalhesMagiaModal(${magia.id})">
              <i class="fas fa-info-circle"></i> Detalhes
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  obterIQ() {
    const elemento = document.getElementById('IQ');
    return elemento ? parseInt(elemento.value) || 10 : 10;
  }

  obterHT() {
    const elemento = document.getElementById('HT');
    return elemento ? parseInt(elemento.value) || 10 : 10;
  }

  obterAptidao() {
    const elemento = document.getElementById('aptidao-magica');
    return elemento ? parseInt(elemento.value) || 0 : 0;
  }

  calcularNH(magia, pontos) {
    const iq = this.obterIQ();
    const aptidao = this.obterAptidao();
    const bonus = this.calcularBonus(pontos, magia.dificuldade);
    
    return iq + aptidao + bonus;
  }

  calcularBonus(pontos, dificuldade) {
    const tabelaBonus = {
      'Difícil': {
        1: -2,  2: -1,  4: 0,   8: 1,   12: 2,  16: 3,
        20: 4,  24: 5,  28: 6,  32: 7,  36: 8,  40: 9,
        44: 10,  48: 11,  52: 12
      }
    };
    
    return tabelaBonus[dificuldade]?.[pontos] || 0;
  }

  abrirModalAprendizagem(id) {
    if (typeof catalogoMagias !== 'undefined') {
      this.magiaSelecionada = catalogoMagias.find(m => m.id === id);
      if (!this.magiaSelecionada) return;

      this.pontosSelecionados = 1;
      this.magiaEditando = null;
      this.mostrarModalCompra();
    }
  }

  abrirModalEdicao(id) {
    this.magiaEditando = this.magiasAprendidas.find(m => m.id === id);
    if (!this.magiaEditando) return;

    if (typeof catalogoMagias !== 'undefined') {
      this.magiaSelecionada = catalogoMagias.find(m => m.id === id);
    }
    this.pontosSelecionados = this.magiaEditando.pontos || 1;
    
    this.mostrarModalCompra();
  }

  mostrarModalCompra() {
    const magia = this.magiaSelecionada;
    if (!magia) return;

    const editando = !!this.magiaEditando;
    const nhCalculado = this.calcularNH(magia, this.pontosSelecionados);

    const modalHTML = `
      <div class="modal-magia-overlay" id="modal-magia-compra">
        <div class="modal-magia">
          <div class="modal-magia-header">
            <h3><i class="fas fa-hat-wizard"></i> ${editando ? 'Editar Magia' : 'Aprender Magia'}</h3>
            <button class="modal-magia-close" id="btn-fechar-modal-magia">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-magia-body">
            <div class="magia-modal-info">
              <h4>${magia.nome}</h4>
              <div class="magia-modal-detalhes">
                <div class="info-row">
                  <span>Escola:</span>
                  <span>${this.formatarEscola(magia.escola)}</span>
                </div>
                <div class="info-row">
                  <span>Classe:</span>
                  <span>${this.formatarClasse(magia.classe)}</span>
                </div>
                <div class="info-row">
                  <span>Custo de Mana:</span>
                  <span>${magia.custoMana}</span>
                </div>
                <div class="info-row">
                  <span>Duração:</span>
                  <span>${magia.duracao}</span>
                </div>
              </div>
            </div>

            <div class="magia-modal-descricao">
              <p>${magia.descricao}</p>
            </div>

            <div class="magia-modal-pontos">
              <h4><i class="fas fa-star"></i> Pontos a Investir</h4>
              <div class="controle-pontos-magia">
                <button class="btn-controle-magia" id="btn-diminuir-pontos-magia">
                  <i class="fas fa-minus"></i>
                </button>
                <div class="pontos-display">
                  <div class="pontos-valor">${this.pontosSelecionados}</div>
                  <div class="pontos-label">pontos</div>
                </div>
                <button class="btn-controle-magia" id="btn-aumentar-pontos-magia">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
              
              <div class="nh-calculado">
                <div class="nh-label">NH Calculado:</div>
                <div class="nh-valor">${nhCalculado}</div>
                <div class="nh-detalhes">
                  IQ ${this.obterIQ()} + Apt ${this.obterAptidao()} + 
                  ${this.calcularBonus(this.pontosSelecionados, magia.dificuldade)} (bônus)
                </div>
              </div>
            </div>
          </div>

          <div class="modal-magia-footer">
            <div class="modal-magia-custo">
              <span>Custo:</span>
              <strong>${this.pontosSelecionados} pontos</strong>
            </div>
            <div class="modal-magia-botoes">
              ${editando ? 
                `<button class="btn-remover-magia" id="btn-remover-magia-modal">
                  <i class="fas fa-trash"></i> Remover
                </button>` : ''
              }
              <button class="btn-cancelar-magia" id="btn-cancelar-magia">
                Cancelar
              </button>
              <button class="btn-confirmar-magia" id="btn-confirmar-magia">
                ${editando ? 'Atualizar' : 'Aprender'} Magia
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const modalExistente = document.getElementById('modal-magia-compra');
    if (modalExistente) modalExistente.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos do modal
    this.configurarEventosModal();
  }

  configurarEventosModal() {
    // Fechar modal
    document.getElementById('btn-fechar-modal-magia')?.addEventListener('click', () => {
      this.fecharModalCompra();
    });

    document.getElementById('btn-cancelar-magia')?.addEventListener('click', () => {
      this.fecharModalCompra();
    });

    // Botões de controle de pontos
    document.getElementById('btn-aumentar-pontos-magia')?.addEventListener('click', () => {
      this.aumentarPontosCompra();
      this.atualizarModalCompra();
    });

    document.getElementById('btn-diminuir-pontos-magia')?.addEventListener('click', () => {
      this.diminuirPontosCompra();
      this.atualizarModalCompra();
    });

    // Confirmar compra
    document.getElementById('btn-confirmar-magia')?.addEventListener('click', () => {
      this.confirmarAprendizagem();
    });

    // Remover magia
    const btnRemover = document.getElementById('btn-remover-magia-modal');
    if (btnRemover) {
      btnRemover.addEventListener('click', () => {
        if (this.magiaEditando) {
          this.removerMagia(this.magiaEditando.id);
          this.fecharModalCompra();
        }
      });
    }

    // Fechar ao clicar fora
    document.getElementById('modal-magia-compra')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-magia-overlay')) {
        this.fecharModalCompra();
      }
    });
  }

  aumentarPontosCompra() {
    const custos = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
    const indexAtual = custos.indexOf(this.pontosSelecionados);
    
    if (indexAtual < custos.length - 1) {
      this.pontosSelecionados = custos[indexAtual + 1];
    }
  }

  diminuirPontosCompra() {
    const custos = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52];
    const indexAtual = custos.indexOf(this.pontosSelecionados);
    
    if (indexAtual > 0) {
      this.pontosSelecionados = custos[indexAtual - 1];
    }
  }

  atualizarModalCompra() {
    const magia = this.magiaSelecionada;
    if (!magia) return;

    const nhCalculado = this.calcularNH(magia, this.pontosSelecionados);
    
    const pontosDisplay = document.querySelector('.pontos-valor');
    const nhElement = document.querySelector('.nh-valor');
    const detalhesElement = document.querySelector('.nh-detalhes');
    const btnComprar = document.getElementById('btn-confirmar-magia');
    
    if (pontosDisplay) {
      pontosDisplay.textContent = this.pontosSelecionados;
    }
    
    if (nhElement) {
      nhElement.textContent = nhCalculado;
    }
    
    if (detalhesElement) {
      const iq = this.obterIQ();
      const aptidao = this.obterAptidao();
      const bonus = this.calcularBonus(this.pontosSelecionados, magia.dificuldade);
      detalhesElement.textContent = `IQ ${iq} + Apt ${aptidao} + ${bonus} (bônus)`;
    }
    
    if (btnComprar) {
      const editando = !!this.magiaEditando;
      btnComprar.textContent = `${editando ? 'Atualizar' : 'Aprender'} Magia`;
    }
  }

  fecharModalCompra() {
    const modal = document.getElementById('modal-magia-compra');
    if (modal) modal.remove();
    this.magiaSelecionada = null;
    this.magiaEditando = null;
    this.pontosSelecionados = 1;
  }

  confirmarAprendizagem() {
    if (!this.magiaSelecionada) return;

    const magiaData = {
      ...this.magiaSelecionada,
      pontos: this.pontosSelecionados,
      nivel: this.calcularNH(this.magiaSelecionada, this.pontosSelecionados),
      dataAprendizagem: new Date().toISOString()
    };

    if (this.magiaEditando) {
      const index = this.magiasAprendidas.findIndex(m => m.id === this.magiaSelecionada.id);
      if (index !== -1) {
        this.magiasAprendidas[index] = magiaData;
      }
    } else {
      this.magiasAprendidas.push(magiaData);
    }
    
    this.fecharModalCompra();
    this.atualizarInterface();
    this.salvarDados();
  }

  removerMagia(id) {
    this.magiasAprendidas = this.magiasAprendidas.filter(m => m.id !== id);
    this.atualizarInterface();
    this.salvarDados();
  }

  mostrarDetalhesMagiaModal(id) {
    if (typeof catalogoMagias === 'undefined') return;

    const magia = catalogoMagias.find(m => m.id === id);
    if (!magia) return;

    const modalHTML = `
      <div class="modal-magia-overlay" id="modal-detalhes-magia">
        <div class="modal-magia modal-detalhes">
          <div class="modal-magia-header">
            <h3><i class="fas fa-info-circle"></i> Detalhes da Magia</h3>
            <button class="modal-magia-close" id="btn-fechar-detalhes-magia">
              <i class="fas fa-times"></i>
            </button>
          </div>
          
          <div class="modal-magia-body">
            <div class="detalhes-magia-header">
              <h4>${magia.nome}</h4>
              <div class="detalhes-tags">
                <span class="tag-escola">${this.formatarEscola(magia.escola)}</span>
                <span class="tag-classe">${this.formatarClasse(magia.classe)}</span>
                <span class="tag-dificuldade">${magia.dificuldade}</span>
              </div>
            </div>

            <div class="detalhes-magia-info">
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label"><i class="fas fa-bolt"></i> Custo de Mana:</span>
                  <span class="info-value">${magia.custoMana}</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><i class="fas fa-clock"></i> Duração:</span>
                  <span class="info-value">${magia.duracao}</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><i class="fas fa-hourglass-half"></i> Tempo de Conjuração:</span>
                  <span class="info-value">${magia.tempoOperacao}</span>
                </div>
                <div class="info-item">
                  <span class="info-label"><i class="fas fa-bullseye"></i> NH Base:</span>
                  <span class="info-value">${magia.nhBase}</span>
                </div>
                ${magia.preRequisitos ? `
                <div class="info-item full-width">
                  <span class="info-label"><i class="fas fa-list-check"></i> Pré-requisitos:</span>
                  <span class="info-value">${magia.preRequisitos}</span>
                </div>
                ` : ''}
              </div>
            </div>

            <div class="detalhes-magia-descricao">
              <h5><i class="fas fa-scroll"></i> Descrição</h5>
              <p>${magia.descricao}</p>
            </div>
          </div>

          <div class="modal-magia-footer">
            <button class="btn-fechar-detalhes" id="btn-fechar-detalhes-magia-2">
              Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    const modalExistente = document.getElementById('modal-detalhes-magia');
    if (modalExistente) modalExistente.remove();

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos do modal de detalhes
    document.getElementById('btn-fechar-detalhes-magia')?.addEventListener('click', () => {
      this.fecharModalDetalhes();
    });
    
    document.getElementById('btn-fechar-detalhes-magia-2')?.addEventListener('click', () => {
      this.fecharModalDetalhes();
    });
    
    document.getElementById('modal-detalhes-magia')?.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-magia-overlay')) {
        this.fecharModalDetalhes();
      }
    });
  }

  fecharModalDetalhes() {
    const modal = document.getElementById('modal-detalhes-magia');
    if (modal) modal.remove();
  }

  mostrarDetalhesMagia(id) {
    if (typeof catalogoMagias === 'undefined') return;

    const magia = catalogoMagias.find(m => m.id === id);
    if (!magia) return;

    const container = document.getElementById('detalhes-magia-content');
    if (!container) return;

    const magiaAprendida = this.magiasAprendidas.find(m => m.id === id);
    const jaAprendida = !!magiaAprendida;

    container.innerHTML = `
      <div class="detalhes-magia-card">
        <div class="detalhes-header">
          <h4>${magia.nome}</h4>
          ${jaAprendida ? 
            `<span class="detalhes-status">
              <i class="fas fa-check-circle"></i> Aprendida - NH ${magiaAprendida.nivel}
            </span>` : ''
          }
        </div>
        
        <div class="detalhes-tags">
          <span class="tag-escola">${this.formatarEscola(magia.escola)}</span>
          <span class="tag-classe">${this.formatarClasse(magia.classe)}</span>
          <span class="tag-dificuldade">${magia.dificuldade}</span>
        </div>

        <div class="detalhes-info-grid">
          <div class="info-item">
            <span class="info-label">Custo de Mana:</span>
            <span class="info-value">${magia.custoMana}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Duração:</span>
            <span class="info-value">${magia.duracao}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Tempo de Conjuração:</span>
            <span class="info-value">${magia.tempoOperacao}</span>
          </div>
          <div class="info-item">
            <span class="info-label">NH Base:</span>
            <span class="info-value">${magia.nhBase}</span>
          </div>
          ${magia.preRequisitos ? `
          <div class="info-item full">
            <span class="info-label">Pré-requisitos:</span>
            <span class="info-value">${magia.preRequisitos}</span>
          </div>
          ` : ''}
        </div>

        <div class="detalhes-descricao">
          <h5>Descrição</h5>
          <p>${magia.descricao}</p>
        </div>

        <div class="detalhes-acoes">
          ${jaAprendida ?
            `<button class="btn-editar-detalhes" onclick="sistemaMagia.abrirModalEdicao(${magia.id})">
              <i class="fas fa-edit"></i> Editar Magia
            </button>` :
            `<button class="btn-aprender-detalhes" onclick="sistemaMagia.abrirModalAprendizagem(${magia.id})">
              <i class="fas fa-plus-circle"></i> Aprender Esta Magia
            </button>`
          }
          <button class="btn-ver-mais" onclick="sistemaMagia.mostrarDetalhesMagiaModal(${magia.id})">
            <i class="fas fa-expand"></i> Ver Mais Detalhes
          </button>
        </div>
      </div>
    `;
  }

  atualizarInterface() {
    this.atualizarStatusMagico();
    this.atualizarListaAprendidas();
    this.filtrarCatalogo();
    this.atualizarDashboard();
  }

  atualizarListaAprendidas() {
    const container = document.getElementById('magias-aprendidas');
    const pontosTotal = this.magiasAprendidas.reduce((sum, m) => sum + (m.pontos || 0), 0);

    const pontosMagiaTotal = document.getElementById('pontos-magia-total');
    const totalGastoMagia = document.getElementById('total-gasto-magia');
    
    if (pontosMagiaTotal) {
      pontosMagiaTotal.textContent = `[${pontosTotal} pts]`;
    }
    if (totalGastoMagia) {
      totalGastoMagia.textContent = pontosTotal;
    }

    if (this.magiasAprendidas.length === 0) {
      if (container) {
        container.innerHTML = `
          <div class="nenhuma-magia-aprendida">
            <i class="fas fa-hat-wizard"></i>
            <div>Nenhuma magia aprendida</div>
            <small>As magias que você aprender aparecerão aqui</small>
          </div>
        `;
      }
    } else {
      if (container) {
        container.innerHTML = this.magiasAprendidas.map(magia => {
          const nhAtual = magia.nivel || this.calcularNH(magia, magia.pontos);
          return `
            <div class="magia-aprendida-item">
              <div class="magia-aprendida-header">
                <div class="magia-aprendida-nome">${magia.nome}</div>
                <div class="magia-aprendida-pontos">${magia.pontos} pts</div>
              </div>
              <div class="magia-aprendida-info">
                <span class="info-item">
                  <i class="fas fa-bolt"></i> ${magia.custoMana} mana
                </span>
                <span class="info-item">
                  <i class="fas fa-bullseye"></i> NH ${nhAtual}
                </span>
                <span class="info-item">
                  <i class="fas fa-graduation-cap"></i> ${this.formatarEscola(magia.escola)}
                </span>
              </div>
              <div class="magia-aprendida-controles">
                <button class="btn-editar-magia" onclick="sistemaMagia.abrirModalEdicao(${magia.id})">
                  <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-detalhes-magia" onclick="sistemaMagia.mostrarDetalhesMagiaModal(${magia.id})">
                  <i class="fas fa-info-circle"></i> Detalhes
                </button>
                <button class="btn-remover-magia" onclick="sistemaMagia.removerMagia(${magia.id})">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  atualizarDashboard() {
    const totalPontos = this.calcularTotalPontos();
    const gastoMagiasElement = document.getElementById('gastoMagias');
    
    if (gastoMagiasElement) {
      gastoMagiasElement.textContent = totalPontos;
    }
    
    if (typeof atualizarPontos === 'function') {
      setTimeout(() => {
        atualizarPontos();
      }, 100);
    }
  }

  calcularTotalPontos() {
    return this.magiasAprendidas.reduce((sum, magia) => sum + (magia.pontos || 0), 0);
  }

  configurarEventos() {
    const manaAtualInput = document.getElementById('mana-atual');
    if (manaAtualInput) {
      manaAtualInput.addEventListener('change', () => {
        this.atualizarMana();
      });
    }

    const bonusManaInput = document.getElementById('bonus-mana');
    if (bonusManaInput) {
      bonusManaInput.addEventListener('change', () => {
        this.atualizarStatusMagico();
      });
    }

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.filtro-grupo')) {
        document.querySelectorAll('.filtro-submenu.active').forEach(submenu => {
          submenu.classList.remove('active');
          const header = submenu.previousElementSibling;
          if (header) {
            const icon = header.querySelector('.fa-chevron-down, .fa-chevron-up');
            if (icon) icon.className = 'fas fa-chevron-down';
          }
        });
      }
    });

    const magiaTab = document.getElementById('magia');
    if (magiaTab) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            if (magiaTab.classList.contains('active')) {
              setTimeout(() => {
                this.atualizarStatusMagico();
                this.filtrarCatalogo();
              }, 50);
            }
          }
        });
      });
      
      observer.observe(magiaTab, { attributes: true });
    }
  }

  atualizarMana() {
    const manaAtualElem = document.getElementById('mana-atual');
    const manaBaseElem = document.getElementById('mana-base');
    
    if (manaAtualElem && manaBaseElem) {
      const manaAtual = parseInt(manaAtualElem.value) || 0;
      const manaMaxima = parseInt(manaBaseElem.textContent) || 10;
      
      if (manaAtual > manaMaxima) {
        manaAtualElem.value = manaMaxima;
      }
    }
  }

  formatarEscola(escola) {
    const escolas = {
      'agua': 'Água',
      'ar': 'Ar',
      'compreensao': 'Compreensão/Empatia',
      'controle-mente': 'Controle da Mente',
      'controle-corpo': 'Controle do Corpo',
      'cura': 'Cura',
      'deslocamento': 'Deslocamento',
      'fogo': 'Fogo',
      'luz-trevas': 'Luz e Trevas',
      'necromancia': 'Necromancia',
      'portal': 'Portal',
      'protecao': 'Proteção e Aviso',
      'reconhecimento': 'Reconhecimento',
      'terra': 'Terra',
      'metamagica': 'Metamágica'
    };
    return escolas[escola] || escola;
  }

  formatarClasse(classe) {
    const classes = {
      'comuns': 'Comuns',
      'area': 'Área',
      'toque': 'Toque',
      'projetil': 'Projétil',
      'bloqueio': 'Bloqueio',
      'informacao': 'Informação',
      'resistiveis': 'Resistíveis',
      'especiais': 'Especiais'
    };
    return classes[classe] || classe;
  }

  salvarDados() {
    try {
      const dados = {
        magiasAprendidas: this.magiasAprendidas,
        timestamp: new Date().getTime()
      };
      localStorage.setItem('sistemaMagia', JSON.stringify(dados));
    } catch (e) {
      // Silencioso em caso de erro
    }
  }

  carregarDadosSalvos() {
    try {
      const dadosSalvos = localStorage.getItem('sistemaMagia');
      if (dadosSalvos) {
        const dados = JSON.parse(dadosSalvos);
        if (dados.magiasAprendidas && Array.isArray(dados.magiasAprendidas)) {
          this.magiasAprendidas = dados.magiasAprendidas;
        }
      }
    } catch (e) {
      localStorage.removeItem('sistemaMagia');
    }
  }
}

// ===== INICIALIZAÇÃO GLOBAL =====
let sistemaMagia;

document.addEventListener('DOMContentLoaded', function() {
  sistemaMagia = new SistemaMagia();
  window.sistemaMagia = sistemaMagia;
  
  const magiaTab = document.getElementById('magia');
  if (magiaTab) {
    magiaTab.addEventListener('click', () => {
      setTimeout(() => {
        if (sistemaMagia && magiaTab.classList.contains('active')) {
          sistemaMagia.atualizarStatusMagico();
          sistemaMagia.filtrarCatalogo();
        }
      }, 100);
    });
  }
});

// ===== FUNÇÕES GLOBAIS PARA HTML =====
window.toggleSubmenu = (submenuId) => {
  if (sistemaMagia) sistemaMagia.toggleSubmenu(submenuId);
};