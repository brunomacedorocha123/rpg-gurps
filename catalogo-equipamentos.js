// catalogo-equipamentos.js - VERSÃO COM CDT (CADÊNCIA DE TIROS)
class CatalogoEquipamentos {
  constructor() {
    this.catalogo = {
      "medieval": {
        "armasCorpoACorpo": [
          {
            id: "M800", nome: "Machado GEB+2", tipo: "arma-cc", era: "medieval", nt: 0,
            dano: "GeB+2", tipoDano: "corte", alcance: "1", peso: 2.0, st: 11, custo: 50,
            maos: 1, quantificavel: false, descricao: "Machado"
          },
          {
            id: "M801", nome: "Espada Larga", tipo: "arma-cc", era: "medieval", nt: 0,
            dano: "GeB+1", tipoDano: "corte",
            danoGDP: "GdP+1", tipoDanoGDP: "contusão",
            alcance: "1", peso: 1.5, st: 10, custo: 500,
            maos: 1.5, quantificavel: false, descricao: "Espada larga"
          },
          {
            id: "M802", nome: "Lança", tipo: "arma-cc", era: "medieval", nt: 0,
            dano: "GdP+3", tipoDano: "perfuração", alcance: "1,2", peso: 2.0, st: 9,
            custo: 40, maos: 2, quantificavel: false, descricao: "Lança de combate"
          },
          {
            id: "M803", nome: "Martelo de Guerra", tipo: "arma-cc", era: "medieval", nt: 0,
            dano: "GeB+3", tipoDano: "perfuração", alcance: "1,2", peso: 3.5, st: 12, custo: 100,
            maos: 2, quantificavel: false, descricao: "Martelo de guerra"
          },
          {
            id: "M804", nome: "Adaga", tipo: "arma-cc", era: "medieval", nt: 0,
            dano: "GdP-1", tipoDano: "perfuração", alcance: "C,1", peso: 0.125, st: 5,
            custo: 20, maos: 1, quantificavel: false, descricao: "Adaga pequena e afiada"
          },
          {
            id: "M805", nome: "Maça", tipo: "arma-cc", era: "medieval", nt: 0,
            dano: "GeB+3", tipoDano: "contusão", alcance: "1", peso: 2.5, st: 12, custo: 50,
            maos: 1, quantificavel: false, descricao: "Maça"
          }
        ],
        "armasDistancia": [
          {
            id: "M850", nome: "Arco Curto", tipo: "arma-dist", era: "medieval", nt: 0,
            dano: "GdP", tipoDano: "perfuração", prec: 0, alcance: "x10/x15", peso: 1.0,
            st: 7, custo: 50, magnit: "Flechas ", maos: 2, cdt: "1",
            quantificavel: false, descricao: "Arco curto"
          },
          {
            id: "M851", nome: "Besta", tipo: "arma-dist", era: "medieval", nt: 0,
            dano: "GdP+4", tipoDano: "perfuração", prec: 4, alcance: "x20/x25", peso: 3.0,
            st: 7, custo: 150, magnit: "Virote", maos: 2, cdt: "1",
            quantificavel: false, descricao: "Besta"
          },
          {
            id: "M852", nome: "Funda", tipo: "arma-dist", era: "medieval", nt: 0,
            dano: "GeB", tipoDano: "contusão", prec: 0, alcance: "x6/x10", peso: 0.25,
            st: 6, custo: 20, magnit: "Pedras", maos: 1, cdt: "1",
            quantificavel: true, descricao: "Funda"
          },
          {
            id: "M853", nome: "Arco Longo", tipo: "arma-dist", era: "medieval", nt: 0,
            dano: "GdP+2", tipoDano: "perfuração", prec: 3, alcance: "x15/x20", peso: 1.5,
            st: 8, custo: 200, magnit: "Flechas", maos: 2, cdt: "1",
            quantificavel: false, descricao: "Arco longo de precisão"
          }
        ],
        "armaduras": [
          {
            id: "M900", nome: "Armadura de Couro", tipo: "armadura", era: "medieval", nt: 0,
            local: "Tronco/Virilha", rd: 2, peso: 5.0, custo: 100, cl: 4, maos: 0,
            quantificavel: false, descricao: "Armadura de couro"
          },
          {
            id: "M901", nome: "Cota de Malha Longa", tipo: "armadura", era: "medieval", nt: 0,
            local: "Tronco/Virilha", rd: "4/2", peso: 12.5, custo: 230, cl: 3, maos: 0,
            quantificavel: false, descricao: "Cota de Malha Longa"
          },
          {
            id: "M902", nome: "Elmo de Bronze", tipo: "armadura", era: "medieval", nt: 0,
            local: "Cabeça", rd: 3, peso: 3.7, custo: 160, cl: 4, maos: 0,
            quantificavel: false, descricao: "Elmo de Bronze"
          },
          {
            id: "M903", nome: "Braçadeiras de Bronze", tipo: "armadura", era: "medieval", nt: 0,
            local: "Braços", rd: 3, peso: 4.5, custo: 180, cl: 4, maos: 0,
            quantificavel: false, descricao: "Braçadeiras de Bronze"
          },
          {
            id: "M904", nome: "Armadura de Escamas", tipo: "armadura", era: "medieval", nt: 0,
            local: "Tronco/Virilha", rd: 4, peso: 17.5, custo: 420, cl: 4, maos: 0,
            quantificavel: false, descricao: "Armadura de Escamas"
          }
        ],
        "escudos": [
          {
            id: "M950", nome: "Escudo Pequeno", tipo: "escudo", era: "medieval", nt: 0,
            bd: "+1", custo: 40, rdpv: "5/20", cl: 4, peso: 2.5, maos: 1,
            quantificavel: false, descricao: "Escudo leve para defesa"
          },
          {
            id: "M951", nome: "Escudo Médio", tipo: "escudo", era: "medieval", nt: 0,
            bd: "+2", custo: 60, rdpv: "7/40", cl: 4, peso: 7.5, maos: 1,
            quantificavel: false, descricao: "Escudo versátil"
          },
          {
            id: "M952", nome: "Escudo Grande", tipo: "escudo", era: "medieval", nt: 0,
            bd: "+3", custo: 90, rdpv: "9/60", cl: 4, peso: 12.5, maos: 1,
            quantificavel: false, descricao: "Escudo de proteção máxima"
          },
          {
            id: "M953", nome: "Broquel", tipo: "escudo", era: "medieval", nt: 0,
            bd: "+1", custo: 25, rdpv: "RD 5", cl: 4, peso: 1.0, maos: 1,
            quantificavel: false, descricao: "Escudo pequeno e ágil"
          }
        ],
        "equipamentosGerais": [
          {
            id: "M1000", nome: "Mochila (50kg)", tipo: "geral", era: "medieval",
            categoria: "Sobrevivencia", custo: 100, peso: 5.0, cl: 4, maos: 0,
            quantificavel: false, descricao: "Mochila"
          },
          {
            id: "M1001", nome: "Corda 3/4 (10m)", tipo: "geral", era: "medieval",
            categoria: "Sobrevivencia", custo: 25, peso: 2.5, cl: 0, maos: 0,
            quantificavel: true, descricao: "Corda 3/4"
          },
          {
            id: "M1002", nome: "Tocha (1 Hora)", tipo: "geral", era: "medieval",
            categoria: "Sobrevivencia", custo: 3, peso: 1.0, cl: 0, maos: 1,
            quantificavel: true, descricao: "Tocha"
          },
          {
            id: "M1003", nome: "Kit Básico para Primeiros Socorros", tipo: "geral", era: "medieval",
            categoria: "Saude", custo: 10, peso: 1.0, cl: 4, maos: 0,
            quantificavel: true, descricao: "Kit Básico para Primeiros Socorros"
          },
          {
            id: "M1004", nome: "Odre de Vinho (4L)", tipo: "geral", era: "medieval",
            categoria: "Sobrevivencia", custo: 10, peso: 0.125, cl: 0, maos: 0,
            quantificavel: true, descricao: "Odre de Vinho"
          },
          {
            id: "M1005", nome: "Ração de Viagem (1 dia)", tipo: "geral", era: "medieval",
            categoria: "Sobrevivencia", custo: 2, peso: 0.25, cl: 0, maos: 0,
            quantificavel: true, descricao: "Rações de viagem"
          }
        ]
      },
      "moderna": {
        "armasCorpoACorpo": [
          {
            id: "C2000", nome: "Faca Tática", tipo: "arma-cc", era: "moderna", nt: 0,
            dano: "1d-1", tipoDano: "corte", alcance: "C,1", peso: 0.3, st: 5, custo: 80,
            maos: 1, quantificavel: false, descricao: "Faca de combate tático"
          },
          {
            id: "C2001", nome: "Tonfa", tipo: "arma-cc", era: "moderna", nt: 0,
            dano: "1d+1", tipoDano: "contusão", alcance: "1", peso: 1.0, st: 8, custo: 120,
            maos: 1, quantificavel: false, descricao: "Tonfa policial"
          },
          {
            id: "C2002", nome: "Katana", tipo: "arma-cc", era: "moderna", nt: 0,
            dano: "2d+3", tipoDano: "corte", alcance: "1,2", peso: 2.5, st: 10, custo: 1200,
            maos: 1.5, quantificavel: false, descricao: "Katana de alta qualidade"
          },
          {
            id: "C2003", nome: "Bastão Retrátil", tipo: "arma-cc", era: "moderna", nt: 0,
            dano: "1d+2", tipoDano: "contusão", alcance: "1", peso: 1.2, st: 9, custo: 200,
            maos: 1, quantificavel: false, descricao: "Bastão retrátil tático"
          }
        ],
        "armasDistancia": [
          {
            id: "C2050", nome: "Pistola 9mm", tipo: "arma-dist", era: "moderna", nt: 0,
            dano: "2d+2", tipoDano: "perfuração", prec: 0, alcance: "150/200", peso: 1.0,
            st: 9, custo: 800, magnit: "Munição 9mm", maos: 1, cdt: "3",
            quantificavel: false, descricao: "Pistola semiautomática"
          },
          {
            id: "C2051", nome: "Rifle de Assalto", tipo: "arma-dist", era: "moderna", nt: 0,
            dano: "5d", tipoDano: "perfuração", prec: 0, alcance: "500/750", peso: 3.5,
            st: 10, custo: 2500, magnit: "Carregador 30 munições", maos: 2,
            cdt: "12", quantificavel: false, descricao: "Rifle de assalto automático"
          },
          {
            id: "C2052", nome: "Shotgun", tipo: "arma-dist", era: "moderna", nt: 0,
            dano: "4d", tipoDano: "perfuração", prec: 0, alcance: "50/100", peso: 3.0,
            st: 10, custo: 1200, magnit: "Cartuchos", maos: 2, cdt: "2x9",
            quantificavel: false, descricao: "Espingarda de cano duplo"
          },
          {
            id: "C2053", nome: "Pistola Laser", tipo: "arma-dist", era: "moderna", nt: 0,
            dano: "3d", tipoDano: "queimadura", prec: 0, alcance: "300/450", peso: 1.5,
            st: 8, custo: 5000, magnit: "Célula de Energia", maos: 1, cdt: "10",
            quantificavel: false, descricao: "Pistola de energia laser"
          }
        ],
        "armaduras": [
          {
            id: "C2100", nome: "Colete Balístico", tipo: "armadura", era: "moderna", nt: 0,
            local: "Torso", rd: 6, peso: 4.0, custo: 1200, cl: 2, maos: 0,
            quantificavel: false, descricao: "Colete à prova de balas"
          },
          {
            id: "C2101", nome: "Capacete Militar", tipo: "armadura", era: "moderna", nt: 0,
            local: "Cabeça", rd: 4, peso: 1.5, custo: 500, cl: 2, maos: 0,
            quantificavel: false, descricao: "Capacete balístico"
          },
          {
            id: "C2102", nome: "Armadura Corporal Completa", tipo: "armadura", era: "moderna", nt: 0,
            local: "Corpo Inteiro", rd: 8, peso: 12.0, custo: 8000, cl: 3, maos: 0,
            quantificavel: false, descricao: "Armadura militar completa"
          },
          {
            id: "C2103", nome: "Joelheiras e Cotoveleiras", tipo: "armadura", era: "moderna", nt: 0,
            local: "Braços, Pernas", rd: 2, peso: 1.0, custo: 300, cl: 2, maos: 0,
            quantificavel: false, descricao: "Proteção para articulações"
          }
        ],
        "escudos": [
          {
            id: "C2150", nome: "Escudo Anti-Motim", tipo: "escudo", era: "moderna", nt: 0,
            bd: "+3", custo: 800, rdpv: "PV 50", cl: 3, peso: 6.0, maos: 1,
            quantificavel: false, descricao: "Escudo transparente anti-projéteis"
          },
          {
            id: "C2151", nome: "Escudo Balístico Portátil", tipo: "escudo", era: "moderna", nt: 0,
            bd: "+2", custo: 1500, rdpv: "PV 40", cl: 3, peso: 3.5, maos: 1,
            quantificavel: false, descricao: "Escudo dobrável anti-balas"
          }
        ],
        "equipamentosGerais": [
          {
            id: "C2200", nome: "Mochila Tática (50kg)", tipo: "geral", era: "moderna",
            categoria: "Transporte", custo: 150, peso: 1.5, cl: 3, maos: 0,
            quantificavel: false, descricao: "Mochila militar tática"
          },
          {
            id: "C2201", nome: "Lanterna LED", tipo: "geral", era: "moderna",
            categoria: "Iluminação", custo: 40, peso: 0.3, cl: 3, maos: 1,
            quantificavel: false, descricao: "Lanterna de alta potência"
          },
          {
            id: "C2202", nome: "Kit Médico Avançado", tipo: "geral", era: "moderna",
            categoria: "Saúde", custo: 300, peso: 2.0, cl: 3, maos: 0,
            quantificavel: true, descricao: "Kit médico completo"
          },
          {
            id: "C2203", nome: "Tablet", tipo: "geral", era: "moderna",
            categoria: "Tecnologia", custo: 800, peso: 0.5, cl: 4, maos: 1,
            quantificavel: false, descricao: "Tablet com acesso à rede"
          },
          {
            id: "C2204", nome: "Ração de Combate (1 dia)", tipo: "geral", era: "moderna",
            categoria: "Sobrevivência", custo: 15, peso: 0.4, cl: 3, maos: 0,
            quantificavel: true, descricao: "Ração militar nutritiva"
          },
          {
            id: "C2205", nome: "Garrafa Térmica", tipo: "geral", era: "moderna",
            categoria: "Sobrevivência", custo: 30, peso: 0.6, cl: 3, maos: 0,
            quantificavel: false, descricao: "Garrafa que mantém temperatura"
          }
        ]
      }
    };
    
    this.inicializado = false;
    this.tabelasInicializadas = false;
    this.tabelasGeradas = new Set();
    
    this.inicializarQuandoPronto();
  }

  inicializarQuandoPronto() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.inicializar();
      });
    } else {
      this.inicializar();
    }
  }

  inicializar() {
    try {
      console.log(' Inicializando catálogo de equipamentos...');
      
      this.configurarFiltros();
      this.configurarBusca();
      
      this.inicializado = true;
      this.inicializarTabelas();
      
      const evento = new CustomEvent('catalogoPronto', {
        detail: { catalogo: this }
      });
      document.dispatchEvent(evento);
      
      console.log('✅ Catálogo de equipamentos inicializado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar catálogo:', error);
    }
  }

  configurarFiltros() {
    const filtroEra = document.getElementById('filtro-era');
    const filtroTipo = document.getElementById('filtro-tipo');
    
    if (filtroEra) {
      filtroEra.addEventListener('change', () => {
        this.aplicarFiltros();
      });
    }
    
    if (filtroTipo) {
      filtroTipo.addEventListener('change', () => {
        this.aplicarFiltros();
      });
    }
  }

  configurarBusca() {
    const buscaInput = document.getElementById('busca-catalogo');
    
    if (buscaInput) {
      buscaInput.addEventListener('input', () => {
        this.aplicarFiltros();
      });
      
      buscaInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          buscaInput.value = '';
          this.aplicarFiltros();
        }
      });
    }
  }

  aplicarFiltros() {
    const eraSelecionada = document.getElementById('filtro-era')?.value || 'todas';
    const tipoSelecionado = document.getElementById('filtro-tipo')?.value || 'todas';
    const termoBusca = document.getElementById('busca-catalogo')?.value.toLowerCase() || '';
    
    document.querySelectorAll('.categoria-section').forEach(section => {
      section.style.display = 'none';
    });
    
    let totalEquipamentos = 0;
    
    const categorias = ['armasCorpoACorpo', 'armasDistancia', 'armaduras', 'escudos', 'equipamentosGerais'];
    const mapeamentoCategorias = {
      'armasCorpoACorpo': 'armas-cc',
      'armasDistancia': 'armas-dist',
      'armaduras': 'armaduras',
      'escudos': 'escudos',
      'equipamentosGerais': 'geral'
    };
    
    categorias.forEach(categoriaCatalogo => {
      const categoriaHTML = mapeamentoCategorias[categoriaCatalogo];
      const section = document.querySelector(`[data-category="${categoriaHTML}"]`);
      
      if (!section) return;
      
      let equipamentosFiltrados = [];
      
      if (eraSelecionada === 'todas') {
        equipamentosFiltrados = [
          ...(this.catalogo.medieval[categoriaCatalogo] || []),
          ...(this.catalogo.moderna[categoriaCatalogo] || [])
        ];
      } else {
        equipamentosFiltrados = this.catalogo[eraSelecionada][categoriaCatalogo] || [];
      }
      
      if (tipoSelecionado !== 'todas') {
        if (tipoSelecionado !== categoriaHTML) {
          return;
        }
      }
      
      if (termoBusca) {
        equipamentosFiltrados = equipamentosFiltrados.filter(equipamento =>
          equipamento.nome.toLowerCase().includes(termoBusca) ||
          (equipamento.descricao && equipamento.descricao.toLowerCase().includes(termoBusca))
        );
      }
      
      const countElement = document.getElementById(`count-${categoriaHTML}`);
      if (countElement) {
        countElement.textContent = equipamentosFiltrados.length;
      }
      
      if (equipamentosFiltrados.length > 0) {
        section.style.display = 'block';
        totalEquipamentos += equipamentosFiltrados.length;
        
        if (!this.tabelasGeradas.has(categoriaHTML)) {
          this.atualizarTabelaCategoria(categoriaHTML, equipamentosFiltrados);
          this.tabelasGeradas.add(categoriaHTML);
        } else {
          this.atualizarDadosTabela(categoriaHTML, equipamentosFiltrados);
        }
      } else {
        section.style.display = 'none';
      }
    });
    
    this.mostrarMensagemSemResultados(totalEquipamentos === 0);
  }

  mostrarMensagemSemResultados(semResultados) {
    let mensagemContainer = document.getElementById('mensagem-sem-resultados');
    
    if (semResultados) {
      if (!mensagemContainer) {
        mensagemContainer = document.createElement('div');
        mensagemContainer.id = 'mensagem-sem-resultados';
        mensagemContainer.className = 'mensagem-sem-resultados';
        mensagemContainer.innerHTML = `
          <i class="fas fa-search fa-2x"></i>
          <h4>Nenhum equipamento encontrado</h4>
          <p>Tente ajustar os filtros ou a busca</p>
        `;
        
        const container = document.querySelector('.categorias-container');
        if (container) {
          container.prepend(mensagemContainer);
        }
      }
    } else if (mensagemContainer) {
      mensagemContainer.remove();
    }
  }

  inicializarTabelas() {
    if (this.tabelasInicializadas) {
      console.log('⚠️ Tabelas já inicializadas, evitando duplicação');
      return;
    }
    
    console.log(' Inicializando tabelas do catálogo...');
    this.atualizarContadores();
    this.aplicarFiltros();
    this.tabelasInicializadas = true;
    console.log('✅ Tabelas inicializadas com sucesso');
  }

  atualizarContadores() {
    const categorias = {
      'armas-cc': ['armasCorpoACorpo'],
      'armas-dist': ['armasDistancia'],
      'armaduras': ['armaduras'],
      'escudos': ['escudos'],
      'geral': ['equipamentosGerais']
    };
    
    Object.entries(categorias).forEach(([categoriaHTML, categoriasCatalogo]) => {
      let total = 0;
      
      categoriasCatalogo.forEach(categoriaCatalogo => {
        total += (this.catalogo.medieval[categoriaCatalogo] || []).length;
        total += (this.catalogo.moderna[categoriaCatalogo] || []).length;
      });
      
      const countElement = document.getElementById(`count-${categoriaHTML}`);
      if (countElement) {
        countElement.textContent = total;
      }
    });
  }

  atualizarTabelaCategoria(categoria, equipamentos) {
    const container = document.querySelector(`[data-category="${categoria}"] .table-container`);
    if (!container) return;
    
    console.log(` Atualizando tabela ${categoria} com ${equipamentos.length} itens`);
    
    if (equipamentos.length === 0) {
      container.innerHTML = `
        <div class="nenhum-equipamento-catalogo">
          <i class="fas fa-inbox fa-2x"></i>
          <div>Nenhum equipamento encontrado</div>
        </div>
      `;
      return;
    }
    
    let html = '';
    
    switch(categoria) {
      case 'armas-cc':
        html = this.gerarHTMLArmasCorpoACorpo(equipamentos);
        break;
      case 'armas-dist':
        html = this.gerarHTMLArmasDistancia(equipamentos);
        break;
      case 'armaduras':
        html = this.gerarHTMLArmaduras(equipamentos);
        break;
      case 'escudos':
        html = this.gerarHTMLEscudos(equipamentos);
        break;
      case 'geral':
        html = this.gerarHTMLEquipamentosGerais(equipamentos);
        break;
    }
    
    container.innerHTML = html;
  }

  atualizarDadosTabela(categoria, equipamentos) {
    const container = document.querySelector(`[data-category="${categoria}"] .table-container`);
    if (!container) return;
    
    if (equipamentos.length === 0) {
      container.innerHTML = `
        <div class="nenhum-equipamento-catalogo">
          <i class="fas fa-inbox fa-2x"></i>
          <div>Nenhum equipamento encontrado</div>
        </div>
      `;
      return;
    }
    
    const tbody = container.querySelector('tbody');
    if (tbody) {
      let html = '';
      
      switch(categoria) {
        case 'armas-cc':
          html = this.gerarHTMLCorpoArmasCorpoACorpo(equipamentos);
          break;
        case 'armas-dist':
          html = this.gerarHTMLCorpoArmasDistancia(equipamentos);
          break;
        case 'armaduras':
          html = this.gerarHTMLCorpoArmaduras(equipamentos);
          break;
        case 'escudos':
          html = this.gerarHTMLCorpoEscudos(equipamentos);
          break;
        case 'geral':
          html = this.gerarHTMLCorpoEquipamentosGerais(equipamentos);
          break;
      }
      
      tbody.innerHTML = html;
    }
  }

  // ========== TABELA DE ARMAS CORPO-A-CORPO ==========
  gerarHTMLArmasCorpoACorpo(equipamentos) {
    return `
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="col-nt">NT</th>
            <th class="col-nome">ARMA</th>
            <th class="col-dano">DANO</th>
            <th class="col-alcance">ALCANCE</th>
            <th class="col-peso">PESO</th>
            <th class="col-st">ST</th>
            <th class="col-maos">MÃOS</th>
            <th class="col-custo">CUSTO</th>
            <th class="col-acao">AÇÃO</th>
          </tr>
        </thead>
        <tbody>
          ${this.gerarHTMLCorpoArmasCorpoACorpo(equipamentos)}
        </tbody>
      </table>
    `;
  }

  gerarHTMLCorpoArmasCorpoACorpo(equipamentos) {
    return equipamentos.map(equipamento => {
      const temGDP = equipamento.danoGDP && equipamento.danoGDP !== "-";
      
      return `
        <tr class="era-${equipamento.era}" data-id="${equipamento.id}">
          <td class="col-nt">${equipamento.nt}</td>
          <td class="col-nome">
            <strong>${equipamento.nome}</strong>
            <div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>
            <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? ' Medieval' : ' Moderna'}</small>
          </td>
          <td class="col-dano">
            <div class="dano-vertical">
              ${temGDP ? `
              <div class="linha-dano">
                <span class="dano-titulo">GEB:</span>
                <span class="dano-valor">${equipamento.dano}</span>
                <span class="dano-tipo">${equipamento.tipoDano}</span>
              </div>
              <div class="linha-dano gdp-linha">
                <span class="dano-titulo">GDP:</span>
                <span class="dano-valor">${equipamento.danoGDP}</span>
                <span class="dano-tipo">${equipamento.tipoDanoGDP}</span>
              </div>
              ` : `
              <div class="linha-dano unico-dano">
                <span class="dano-titulo">GEB:</span>
                <span class="dano-valor">${equipamento.dano}</span>
                <span class="dano-tipo">${equipamento.tipoDano}</span>
              </div>
              `}
            </div>
          </td>
          <td class="col-alcance">${equipamento.alcance}</td>
          <td class="col-peso">${equipamento.peso} kg</td>
          <td class="col-st">${equipamento.st}</td>
          <td class="col-maos">
            <span class="badge-maos maos-${equipamento.maos}">
              ${this.obterIconeMaos(equipamento.maos)}
            </span>
          </td>
          <td class="col-custo">$${equipamento.custo}</td>
          <td class="col-acao">
            <button class="btn-comprar" data-item="${equipamento.id}">
              <i class="fas fa-shopping-cart"></i> COMPRAR
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // ========== TABELA DE ARMAS À DISTÂNCIA (COM CDT) ==========
  gerarHTMLArmasDistancia(equipamentos) {
    return `
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="col-nt">NT</th>
            <th class="col-nome">ARMA</th>
            <th class="col-dano">DANO</th>
            <th class="col-tipo">TIPO DANO</th>
            <th class="col-prec">PREC</th>
            <th class="col-alcance">ALCANCE</th>
            <th class="col-cdt">CDT</th>
            <th class="col-peso">PESO</th>
            <th class="col-maos">MÃOS</th>
            <th class="col-custo">CUSTO</th>
            <th class="col-mag">MAGNIT</th>
            <th class="col-acao">AÇÃO</th>
          </tr>
        </thead>
        <tbody>
          ${this.gerarHTMLCorpoArmasDistancia(equipamentos)}
        </tbody>
      </table>
    `;
  }

  gerarHTMLCorpoArmasDistancia(equipamentos) {
    return equipamentos.map(equipamento => `
      <tr class="era-${equipamento.era}" data-id="${equipamento.id}">
        <td class="col-nt">${equipamento.nt}</td>
        <td class="col-nome">
          <strong>${equipamento.nome}</strong>
          <div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>
          <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? ' Medieval' : ' Moderna'}</small>
        </td>
        <td class="col-dano">${equipamento.dano}</td>
        <td class="col-tipo">${equipamento.tipoDano}</td>
        <td class="col-prec">${equipamento.prec || '-'}</td>
        <td class="col-alcance">${equipamento.alcance}</td>
        <td class="col-cdt">${equipamento.cdt || '-'}</td>
        <td class="col-peso">${equipamento.peso} kg</td>
        <td class="col-maos">
          <span class="badge-maos maos-${equipamento.maos}">
            ${this.obterIconeMaos(equipamento.maos)}
          </span>
        </td>
        <td class="col-custo">$${equipamento.custo}</td>
        <td class="col-mag">${equipamento.magnit || '-'}</td>
        <td class="col-acao">
          <button class="btn-comprar" data-item="${equipamento.id}">
            <i class="fas fa-shopping-cart"></i> COMPRAR
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ========== TABELA DE ARMADURAS ==========
  gerarHTMLArmaduras(equipamentos) {
    return `
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="col-nt">NT</th>
            <th class="col-nome">ARMADURA</th>
            <th class="col-local">LOCAL</th>
            <th class="col-rd">RD</th>
            <th class="col-peso">PESO</th>
            <th class="col-custo">CUSTO</th>
            <th class="col-cl">CL</th>
            <th class="col-acao">AÇÃO</th>
          </tr>
        </thead>
        <tbody>
          ${this.gerarHTMLCorpoArmaduras(equipamentos)}
        </tbody>
      </table>
    `;
  }

  gerarHTMLCorpoArmaduras(equipamentos) {
    return equipamentos.map(equipamento => `
      <tr class="era-${equipamento.era}" data-id="${equipamento.id}">
        <td class="col-nt">${equipamento.nt}</td>
        <td class="col-nome">
          <strong>${equipamento.nome}</strong>
          <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? ' Medieval' : ' Moderna'}</small>
        </td>
        <td class="col-local">${equipamento.local}</td>
        <td class="col-rd">${equipamento.rd}</td>
        <td class="col-peso">${equipamento.peso} kg</td>
        <td class="col-custo">$${equipamento.custo}</td>
        <td class="col-cl">${equipamento.cl || '-'}</td>
        <td class="col-acao">
          <button class="btn-comprar" data-item="${equipamento.id}">
            <i class="fas fa-shopping-cart"></i> COMPRAR
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ========== TABELA DE ESCUDOS ==========
  gerarHTMLEscudos(equipamentos) {
    return `
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="col-nt">NT</th>
            <th class="col-nome">ESCUDO</th>
            <th class="col-bd">BD</th>
            <th class="col-custo">CUSTO</th>
            <th class="col-rdpv">RD/PV</th>
            <th class="col-cl">CL</th>
            <th class="col-peso">PESO</th>
            <th class="col-maos">MÃOS</th>
            <th class="col-acao">AÇÃO</th>
          </tr>
        </thead>
        <tbody>
          ${this.gerarHTMLCorpoEscudos(equipamentos)}
        </tbody>
      </table>
    `;
  }

  gerarHTMLCorpoEscudos(equipamentos) {
    return equipamentos.map(equipamento => `
      <tr class="era-${equipamento.era}" data-id="${equipamento.id}">
        <td class="col-nt">${equipamento.nt}</td>
        <td class="col-nome">
          <strong>${equipamento.nome}</strong>
          <div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>
          <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? ' Medieval' : ' Moderna'}</small>
        </td>
        <td class="col-bd">${equipamento.bd}</td>
        <td class="col-custo">$${equipamento.custo}</td>
        <td class="col-rdpv">${equipamento.rdpv}</td>
        <td class="col-cl">${equipamento.cl || '-'}</td>
        <td class="col-peso">${equipamento.peso} kg</td>
        <td class="col-maos">
          <span class="badge-maos maos-${equipamento.maos}">
            ${this.obterIconeMaos(equipamento.maos)}
          </span>
        </td>
        <td class="col-acao">
          <button class="btn-comprar" data-item="${equipamento.id}">
            <i class="fas fa-shopping-cart"></i> COMPRAR
          </button>
        </td>
      </tr>
    `).join('');
  }

  // ========== TABELA DE EQUIPAMENTOS GERAIS ==========
  gerarHTMLEquipamentosGerais(equipamentos) {
    return `
      <table class="catalog-table">
        <thead>
          <tr>
            <th class="col-categoria">CATEGORIA</th>
            <th class="col-nome">NOME</th>
            <th class="col-custo">CUSTO</th>
            <th class="col-peso">PESO</th>
            <th class="col-maos">MÃOS</th>
            <th class="col-cl">CL</th>
            <th class="col-acao">AÇÃO</th>
          </tr>
        </thead>
        <tbody>
          ${this.gerarHTMLCorpoEquipamentosGerais(equipamentos)}
        </tbody>
      </table>
    `;
  }

  gerarHTMLCorpoEquipamentosGerais(equipamentos) {
    return equipamentos.map(equipamento => {
      const quantificavel = equipamento.quantificavel === true;
      
      return `
        <tr class="era-${equipamento.era} ${quantificavel ? 'quantificavel' : ''}" data-id="${equipamento.id}">
          <td class="col-categoria">${equipamento.categoria}</td>
          <td class="col-nome">
            <strong>${equipamento.nome}</strong>
            ${equipamento.maos > 0 ? `<div class="maos-info">${this.obterTextoMaos(equipamento.maos)}</div>` : ''}
            <small class="era-badge era-${equipamento.era}">${equipamento.era === 'medieval' ? ' Medieval' : ' Moderna'}</small>
            ${quantificavel ? '<div class="quantificavel-badge"><i class="fas fa-layer-group"></i> Multiplo</div>' : ''}
          </td>
          <td class="col-custo">$${equipamento.custo}</td>
          <td class="col-peso">${equipamento.peso} kg</td>
          <td class="col-maos">
            ${equipamento.maos > 0 ? `
              <span class="badge-maos maos-${equipamento.maos}">
                ${this.obterIconeMaos(equipamento.maos)}
              </span>
            ` : '-'}
          </td>
          <td class="col-cl">${equipamento.cl || '-'}</td>
          <td class="col-acao">
            <button class="btn-comprar" data-item="${equipamento.id}">
              <i class="fas fa-shopping-cart"></i> COMPRAR
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  obterTextoMaos(maos) {
    switch(maos) {
      case 1: return '1 mão';
      case 1.5: return '1 ou 2 mãos';
      case 2: return '2 mãos';
      case 0: return 'Não usa mãos';
      default: return `${maos} mãos`;
    }
  }

  obterIconeMaos(maos) {
    switch(maos) {
      case 1: return '';
      case 1.5: return '';
      case 2: return '';
      case 0: return '─';
      default: return ''.repeat(maos);
    }
  }

  obterEquipamentoPorId(id) {
    for (const era in this.catalogo) {
      for (const categoria in this.catalogo[era]) {
        const equipamento = this.catalogo[era][categoria].find(item => item.id === id);
        if (equipamento) {
          return equipamento;
        }
      }
    }
    return null;
  }

  obterTodosEquipamentos() {
    const todos = [];
    for (const era in this.catalogo) {
      for (const categoria in this.catalogo[era]) {
        todos.push(...this.catalogo[era][categoria]);
      }
    }
    return todos;
  }

  isQuantificavel(id) {
    const equipamento = this.obterEquipamentoPorId(id);
    return equipamento ? equipamento.quantificavel === true : false;
  }

  buscarEquipamentos(termo) {
    termo = termo.toLowerCase();
    const resultados = [];
    
    for (const era in this.catalogo) {
      for (const categoria in this.catalogo[era]) {
        const encontrados = this.catalogo[era][categoria].filter(item =>
          item.nome.toLowerCase().includes(termo) ||
          (item.descricao && item.descricao.toLowerCase().includes(termo)) ||
          item.tipo.toLowerCase().includes(termo)
        );
        resultados.push(...encontrados);
      }
    }
    
    return resultados;
  }

  adicionarEquipamento(era, categoria, equipamento) {
    if (this.catalogo[era] && this.catalogo[era][categoria]) {
      const existe = this.catalogo[era][categoria].find(item => item.id === equipamento.id);
      if (!existe) {
        this.catalogo[era][categoria].push(equipamento);
        
        if (this.tabelasInicializadas) {
          this.aplicarFiltros();
        }
        
        return true;
      }
    }
    return false;
  }

  removerEquipamento(id) {
    for (const era in this.catalogo) {
      for (const categoria in this.catalogo[era]) {
        const index = this.catalogo[era][categoria].findIndex(item => item.id === id);
        if (index !== -1) {
          this.catalogo[era][categoria].splice(index, 1);
          
          if (this.tabelasInicializadas) {
            this.aplicarFiltros();
          }
          
          return true;
        }
      }
    }
    return false;
  }

  exportarCatalogo() {
    return JSON.parse(JSON.stringify(this.catalogo));
  }

  importarCatalogo(dados) {
    this.catalogo = { ...this.catalogo, ...dados };
    this.inicializado = false;
    this.tabelasInicializadas = false;
    this.tabelasGeradas.clear();
    
    setTimeout(() => this.inicializar(), 100);
  }
}

// Inicialização única do catálogo
let catalogoEquipamentos;

document.addEventListener('DOMContentLoaded', function() {
  console.log(' Iniciando carregamento do catálogo...');
  
  if (window.catalogoEquipamentos) {
    console.log('⚠️ Catálogo já inicializado, evitando duplicação');
    return;
  }
  
  const verificarAbaEquipamento = () => {
    const abaEquipamento = document.getElementById('equipamento');
    
    if (abaEquipamento && !catalogoEquipamentos) {
      console.log(' Aba de equipamento detectada, inicializando catálogo...');
      catalogoEquipamentos = new CatalogoEquipamentos();
      window.catalogoEquipamentos = catalogoEquipamentos;
    }
  };
  
  verificarAbaEquipamento();
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const tab = mutation.target;
        if (tab.id === 'equipamento' && tab.classList.contains('active')) {
          console.log(' Aba de equipamento ativada');
          setTimeout(verificarAbaEquipamento, 100);
        }
      }
    });
  });
  
  document.querySelectorAll('.tab-content').forEach(tab => {
    observer.observe(tab, { attributes: true });
  });
});

window.CatalogoEquipamentos = CatalogoEquipamentos;

console.log('✅ catalogo-equipamentos.js carregado com sucesso!');