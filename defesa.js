// defesa.js - SISTEMA COMPLETO COM CARGA AUTOMÁTICA - VERSÃO INTEGRADA
class SistemaDefesas {
  constructor() {
    this.estado = {
      atributos: { dx: 10, ht: 10 },
      bonus: {
        reflexos: 0,
        escudo: 0,
        capa: 0,
        outros: 0
      },
      modificadores: {
        esquiva: 0,
        bloqueio: 0,
        aparar: 0,
        deslocamento: 0
      },
      defesas: {
        esquiva: 0,
        bloqueio: 0,
        aparar: 0,
        deslocamento: 0
      },
      // NOVOS CAMPOS PARA CARGA
      nivelCarga: 'nenhuma',
      redutorCarga: 0,
      pesoAtual: 0,
      pesoMaximo: 100,
      // FIM DOS NOVOS CAMPOS
      nh: { escudo: null, arma: null },
      fadiga: {
        ativa: false,
        pfAtual: 10,
        pfMaximo: 10,
        limiteFadiga: 4
      }
    };
    
    this.elementos = {};
    this.observadores = [];
    this.atualizando = false;
    this.iniciado = false;
    
    // NOVO: Cache para monitoramento de carga
    this.cargaObservers = [];
    this.ultimaCargaDetectada = null;
  }
  
  iniciar() {
    if (this.iniciado) return;
    
    try {
      this.carregarElementos();
      this.carregarValoresIniciais();
      this.configurarEventos();
      
      // NOVO: Iniciar monitoramento de carga
      this.iniciarMonitoramentoCarga();
      this.detectarNivelCargaInicial();
      
      this.calcularTudo();
      this.iniciarMonitoramento();
      
      this.iniciado = true;
      
      console.log('✅ Sistema de defesas iniciado com monitoramento de carga');
      
    } catch (error) {
      console.error('Erro ao iniciar sistema de defesas:', error);
    }
  }
  
  carregarElementos() {
    // Atributos (vêm do sistema de atributos)
    this.elementos.dx = document.getElementById('DX');
    this.elementos.ht = document.getElementById('HT');
    
    // Inputs de bônus
    this.elementos.bonusReflexos = document.getElementById('bonusReflexos');
    this.elementos.bonusEscudo = document.getElementById('bonusEscudo');
    this.elementos.bonusCapa = document.getElementById('bonusCapa');
    this.elementos.bonusOutros = document.getElementById('bonusOutros');
    
    // Totais de defesa
    this.elementos.esquivaTotal = document.getElementById('esquivaTotal');
    this.elementos.bloqueioTotal = document.getElementById('bloqueioTotal');
    this.elementos.apararTotal = document.getElementById('apararTotal');
    this.elementos.deslocamentoTotal = document.getElementById('deslocamentoTotal');
    
    // Total de bônus
    this.elementos.totalBonus = document.getElementById('totalBonus');
    
    // NOVO: Elementos para exibição de carga
    this.elementos.cargaContainer = document.querySelector('.defesas-card .card-body');
    this.elementos.esquivaInfo = document.querySelector('.defesa-item:nth-child(1) .defesa-info');
  }
  
  carregarValoresIniciais() {
    // Carrega DX e HT do sistema de atributos
    if (this.elementos.dx) {
      this.estado.atributos.dx = parseInt(this.elementos.dx.value) || 10;
    }
    
    if (this.elementos.ht) {
      this.estado.atributos.ht = parseInt(this.elementos.ht.value) || 10;
    }
    
    // Carrega bônus
    ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
      const input = document.getElementById(`bonus${bonus}`);
      if (input) {
        this.estado.bonus[bonus.toLowerCase()] = parseInt(input.value) || 0;
      }
    });
    
    // Carrega modificadores
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      const input = document.getElementById(`${defesa}Mod`);
      if (input) {
        this.estado.modificadores[defesa] = parseInt(input.value) || 0;
      }
    });
  }
  
  // NOVO MÉTODO: Detectar nível de carga inicial
  detectarNivelCargaInicial() {
    try {
      // Método 1: Buscar do sistema de equipamentos
      if (window.sistemaEquipamentos) {
        this.estado.nivelCarga = window.sistemaEquipamentos.nivelCargaAtual || 'nenhuma';
        this.estado.pesoAtual = window.sistemaEquipamentos.pesoAtual || 0;
        this.estado.pesoMaximo = window.sistemaEquipamentos.pesoMaximo || 100;
      }
      
      // Método 2: Buscar do elemento HTML (se existir)
      const cargaElement = document.getElementById('nivelCarga');
      if (cargaElement && cargaElement.textContent) {
        const nivel = cargaElement.textContent.toLowerCase().trim();
        if (nivel) {
          this.estado.nivelCarga = nivel;
        }
      }
      
      // Método 3: Buscar do localStorage (backup)
      try {
        const cargaSalva = localStorage.getItem('gurps_nivel_carga');
        if (cargaSalva) {
          const dados = JSON.parse(cargaSalva);
          if (dados.nivel) {
            this.estado.nivelCarga = dados.nivel;
            this.estado.pesoAtual = dados.pesoAtual || 0;
            this.estado.pesoMaximo = dados.pesoMaximo || 100;
          }
        }
      } catch (e) {
        // Silencioso
      }
      
      // Calcular redutor baseado no nível
      this.estado.redutorCarga = this.getRedutorCarga(this.estado.nivelCarga);
      
      console.log('📦 Nível de carga detectado:', this.estado.nivelCarga, 'Redutor:', this.estado.redutorCarga);
      
    } catch (error) {
      console.warn('Não foi possível detectar nível de carga inicial:', error);
      this.estado.nivelCarga = 'nenhuma';
      this.estado.redutorCarga = 0;
    }
  }
  
  // NOVO MÉTODO: Iniciar monitoramento de carga
  iniciarMonitoramentoCarga() {
    // Método 1: Observar eventos do sistema de equipamentos
    document.addEventListener('equipamentosAtualizados', (e) => {
      if (e.detail && e.detail.nivelCargaAtual) {
        this.atualizarNivelCarga(e.detail.nivelCargaAtual, e.detail.pesoAtual, e.detail.pesoMaximo);
      }
    });
    
    // Método 2: Observar elemento HTML de carga
    this.iniciarObservadorElementoCarga();
    
    // Método 3: Polling periódico (fallback)
    this.iniciarPollingCarga();
  }
  
  // NOVO MÉTODO: Observar elemento HTML de carga
  iniciarObservadorElementoCarga() {
    const cargaElement = document.getElementById('nivelCarga');
    if (!cargaElement) {
      // Tentar encontrar em outro lugar
      setTimeout(() => this.iniciarObservadorElementoCarga(), 1000);
      return;
    }
    
    const observer = new MutationObserver(() => {
      const novoNivel = cargaElement.textContent.toLowerCase().trim();
      if (novoNivel && novoNivel !== this.ultimaCargaDetectada) {
        this.ultimaCargaDetectada = novoNivel;
        this.atualizarNivelCarga(novoNivel);
      }
    });
    
    observer.observe(cargaElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
    
    this.cargaObservers.push(observer);
  }
  
  // NOVO MÉTODO: Polling periódico para carga
  iniciarPollingCarga() {
    setInterval(() => {
      if (this.atualizando) return;
      
      // Buscar do sistema de equipamentos
      if (window.sistemaEquipamentos && 
          window.sistemaEquipamentos.nivelCargaAtual &&
          window.sistemaEquipamentos.nivelCargaAtual !== this.estado.nivelCarga) {
        
        this.atualizarNivelCarga(
          window.sistemaEquipamentos.nivelCargaAtual,
          window.sistemaEquipamentos.pesoAtual,
          window.sistemaEquipamentos.pesoMaximo
        );
      }
    }, 2000); // Verificar a cada 2 segundos
  }
  
  // NOVO MÉTODO: Atualizar nível de carga
  atualizarNivelCarga(novoNivel, pesoAtual = null, pesoMaximo = null) {
    const nivelFormatado = novoNivel.toLowerCase().trim();
    
    // Se não mudou, não faz nada
    if (nivelFormatado === this.estado.nivelCarga) return;
    
    const redutorAntigo = this.estado.redutorCarga;
    this.estado.nivelCarga = nivelFormatado;
    this.estado.redutorCarga = this.getRedutorCarga(nivelFormatado);
    
    if (pesoAtual !== null) this.estado.pesoAtual = pesoAtual;
    if (pesoMaximo !== null) this.estado.pesoMaximo = pesoMaximo;
    
    console.log('🔄 Nível de carga atualizado:', nivelFormatado, 'Redutor:', this.estado.redutorCarga);
    
    // Salvar no localStorage
    try {
      localStorage.setItem('gurps_nivel_carga', JSON.stringify({
        nivel: nivelFormatado,
        pesoAtual: this.estado.pesoAtual,
        pesoMaximo: this.estado.pesoMaximo,
        timestamp: new Date().getTime()
      }));
    } catch (e) {
      // Silencioso
    }
    
    // Recalcular defesas que são afetadas pela carga
    this.calcularEsquiva();
    this.calcularDeslocamento();
    this.atualizarInterface();
    
    // Mostrar feedback visual discreto
    this.mostrarFeedbackCarga(nivelFormatado, redutorAntigo !== this.estado.redutorCarga);
  }
  
  // NOVO MÉTODO: Obter redutor de carga
  getRedutorCarga(nivelCarga) {
    const nivel = nivelCarga.toLowerCase().trim();
    
    const redutores = {
      'nenhuma': 0,
      'leve': -1,
      'média': -2,
      'media': -2, // Alternativo sem acento
      'pesada': -3,
      'muito pesada': -4,
      'muito-pesada': -4,
      'sobrecarregado': -4 // Tratado como muito pesada
    };
    
    return redutores[nivel] || 0;
  }
  
  calcularTudo() {
    if (this.atualizando) return;
    
    this.atualizando = true;
    
    try {
      // Atualiza atributos antes de calcular
      this.atualizarAtributos();
      
      // Busca NH das perícias aprendidas (MANTIDO IGUAL)
      this.buscarNHs();
      
      // Calcula cada defesa
      this.calcularEsquiva();
      this.calcularBloqueio();   // MANTIDO IGUAL
      this.calcularAparar();     // MANTIDO IGUAL
      this.calcularDeslocamento();
      
      // Atualiza interface
      this.atualizarInterface();
      
    } catch (error) {
      console.error('Erro nos cálculos:', error);
    } finally {
      this.atualizando = false;
    }
  }
  
  // MODIFICADO: Adicionar redutor de carga na esquiva
  calcularEsquiva() {
    const { dx, ht } = this.estado.atributos;
    
    // Fórmula: (DX + HT) / 4 + 3 (arredondado para baixo)
    const base = Math.floor((dx + ht) / 4) + 3;
    const modificador = this.estado.modificadores.esquiva;
    const bonusTotal = this.calcularBonusTotal();
    
    // NOVO: Aplicar redutor de carga
    const totalBase = base + modificador + bonusTotal;
    let totalComCarga = totalBase + this.estado.redutorCarga;
    
    // Aplica penalidade de fadiga (MANTIDO)
    totalComCarga = this.aplicarPenalidadeFadiga(totalComCarga, 'esquiva');
    
    // Mínimo 1
    this.estado.defesas.esquiva = Math.max(totalComCarga, 1);
    
    // DEBUG
    console.log(`🎯 Esquiva: ${base}[base] + ${modificador}[mod] + ${bonusTotal}[bonus] + ${this.estado.redutorCarga}[carga] = ${this.estado.defesas.esquiva}`);
  }
  
  // MANTIDO IGUAL (não é afetado por carga)
  calcularBloqueio() {
    // Se não tem NH de escudo ou ainda não buscou
    if (this.estado.nh.escudo === null) {
      this.buscarNHEscudo();
    }
    
    const nhEscudo = this.estado.nh.escudo;
    
    // Se não tem escudo (NH é igual ao DX ou menos), bloqueio = 0
    if (!nhEscudo || nhEscudo <= this.estado.atributos.dx) {
      this.estado.defesas.bloqueio = 0;
      return;
    }
    
    // Fórmula: (NH Escudo) / 2 + 3 (arredondado para baixo)
    const base = Math.floor(nhEscudo / 2) + 3;
    const modificador = this.estado.modificadores.bloqueio;
    const bonusTotal = this.calcularBonusTotal();
    
    const total = base + modificador + bonusTotal;
    
    // Mínimo 1
    this.estado.defesas.bloqueio = Math.max(total, 1);
  }
  
  // MANTIDO IGUAL (não é afetado por carga)
  calcularAparar() {
    // Se não tem NH de arma ou ainda não buscou
    if (this.estado.nh.arma === null) {
      this.buscarNHArma();
    }
    
    const nhArma = this.estado.nh.arma;
    
    // Se não tem arma (NH é igual ao DX ou não tem perícia), aparar = 0
    if (!nhArma || nhArma <= this.estado.atributos.dx) {
      this.estado.defesas.aparar = 0;
      return;
    }
    
    // Fórmula: (NH Arma) / 2 + 3 (arredondado para baixo)
    const base = Math.floor(nhArma / 2) + 3;
    const modificador = this.estado.modificadores.aparar;
    const bonusTotal = this.calcularBonusTotal();
    
    const total = base + modificador + bonusTotal;
    
    // Mínimo 1
    this.estado.defesas.aparar = Math.max(total, 1);
  }
  
  // MODIFICADO: Adicionar redutor de carga no deslocamento
  calcularDeslocamento() {
    const { dx, ht } = this.estado.atributos;
    
    // Fórmula: (DX + HT) / 4
    const base = (dx + ht) / 4;
    const modificador = this.estado.modificadores.deslocamento;
    
    // NOVO: Aplicar redutor de carga
    // Deslocamento usa redutor diferente: -20% por nível
    const redutorPercentual = this.getRedutorPercentualCarga(this.estado.nivelCarga);
    let total = base + modificador;
    
    if (redutorPercentual > 0) {
      total = total * (1 - redutorPercentual);
    }
    
    // Aplica penalidade de fadiga (MANTIDO)
    total = this.aplicarPenalidadeFadiga(total, 'deslocamento');
    
    // Mínimo 0
    this.estado.defesas.deslocamento = Math.max(total, 0);
    
    // DEBUG
    console.log(`🏃 Deslocamento: ${base.toFixed(2)}[base] + ${modificador}[mod] - ${redutorPercentual*100}%[carga] = ${this.estado.defesas.deslocamento.toFixed(2)}`);
  }
  
  // NOVO MÉTODO: Redutor percentual para deslocamento
  getRedutorPercentualCarga(nivelCarga) {
    const nivel = nivelCarga.toLowerCase().trim();
    
    const redutores = {
      'nenhuma': 0,
      'leve': 0.2,      // -20%
      'média': 0.4,     // -40%
      'media': 0.4,     // Alternativo
      'pesada': 0.6,    // -60%
      'muito pesada': 0.8, // -80%
      'muito-pesada': 0.8,
      'sobrecarregado': 0.8
    };
    
    return redutores[nivel] || 0;
  }
  
  // MANTIDO IGUAL
  buscarNHs() {
    this.buscarNHEscudo();
    this.buscarNHArma();
  }
  
  // MANTIDO IGUAL
  buscarNHEscudo() {
    const dx = this.estado.atributos.dx;
    let nivelEscudo = 0;
    
    // Método 1: Buscar no sistema de perícias aprendidas
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      const periciasEscudo = window.estadoPericias.periciasAprendidas.filter(p => {
        if (!p) return false;
        const nome = p.nomeCompleto || p.nome || '';
        return nome.includes('Escudo');
      });
      
      if (periciasEscudo.length > 0) {
        const pericia = periciasEscudo[0];
        nivelEscudo = pericia.nivel || pericia.pontos || 0;
      }
    }
    
    // Método 2: Buscar em localStorage
    if (nivelEscudo === 0) {
      try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
          const parsed = JSON.parse(dados);
          if (parsed.periciasAprendidas) {
            const escudo = parsed.periciasAprendidas.find(p => {
              if (!p) return false;
              const nome = p.nomeCompleto || p.nome || '';
              return nome.includes('Escudo');
            });
            
            if (escudo) {
              nivelEscudo = escudo.nivel || escudo.pontos || 0;
            }
          }
        }
      } catch (e) {
        // Silencioso
      }
    }
    
    // NH = DX + Nível da Perícia
    this.estado.nh.escudo = nivelEscudo > 0 ? dx + nivelEscudo : null;
  }
  
  // MANTIDO IGUAL
  buscarNHArma() {
    const dx = this.estado.atributos.dx;
    let nivelArma = 0;
    let nomeArma = '';
    
    // Lista de perícias de arma do catálogo
    const periciasArma = [
      'Adaga', 'Espada', 'Machado', 'Maça', 'Arco', 'Lança',
      'Martelo', 'Faca', 'Bastão', 'Rapieira', 'Sabre', 'Terçado'
    ];
    
    // Buscar no sistema de perícias aprendidas
    if (window.estadoPericias && window.estadoPericias.periciasAprendidas) {
      for (let pericia of window.estadoPericias.periciasAprendidas) {
        if (!pericia) continue;
        
        const nome = pericia.nomeCompleto || pericia.nome || '';
        
        for (let arma of periciasArma) {
          if (nome.includes(arma)) {
            nivelArma = pericia.nivel || pericia.pontos || 0;
            nomeArma = arma;
            break;
          }
        }
        
        if (nivelArma > 0) break;
      }
    }
    
    // Se não encontrou, tenta localStorage
    if (nivelArma === 0) {
      try {
        const dados = localStorage.getItem('gurps_pericias');
        if (dados) {
          const parsed = JSON.parse(dados);
          if (parsed.periciasAprendidas) {
            for (let pericia of parsed.periciasAprendidas) {
              if (!pericia) continue;
              
              const nome = pericia.nomeCompleto || pericia.nome || '';
              
              for (let arma of periciasArma) {
                if (nome.includes(arma)) {
                  nivelArma = pericia.nivel || pericia.pontos || 0;
                  nomeArma = arma;
                  break;
                }
              }
              
              if (nivelArma > 0) break;
            }
          }
        }
      } catch (e) {
        // Silencioso
      }
    }
    
    // NH = DX + Nível da Perícia (se tiver perícia)
    // Se não tiver perícia de arma, aparar será 0
    this.estado.nh.arma = nivelArma > 0 ? dx + nivelArma : null;
    this.estado.nomeArma = nomeArma;
  }
  
  // MANTIDO IGUAL
  calcularBonusTotal() {
    const { reflexos, escudo, capa, outros } = this.estado.bonus;
    return reflexos + escudo + capa + outros;
  }
  
  // MANTIDO IGUAL
  verificarFadiga() {
    try {
      // Tenta pegar PF atual do sistema de PV/PF
      const pfAtualElement = document.getElementById('pfAtualDisplay');
      const pfMaxElement = document.getElementById('pfMaxDisplay');
      
      let pfAtual = 10;
      let pfMaximo = 10;
      
      if (pfAtualElement) {
        pfAtual = parseInt(pfAtualElement.value) ||
             parseInt(pfAtualElement.textContent) || 10;
      }
      
      if (pfMaxElement) {
        pfMaximo = parseInt(pfMaxElement.textContent) || 10;
      }
      
      const limiteFadiga = Math.ceil(pfMaximo / 3);
      const fadigaAtiva = pfAtual <= limiteFadiga;
      
      this.estado.fadiga = {
        ativa: fadigaAtiva,
        pfAtual: pfAtual,
        pfMaximo: pfMaximo,
        limiteFadiga: limiteFadiga
      };
      
      this.atualizarIndicadorFadiga();
      
    } catch (error) {
      // Silencioso em caso de erro
    }
  }
  
  // MANTIDO IGUAL
  aplicarPenalidadeFadiga(valor, tipoDefesa) {
    if (!this.estado.fadiga.ativa) {
      return valor;
    }
    
    if (tipoDefesa === 'esquiva' || tipoDefesa === 'deslocamento') {
      return Math.ceil(valor / 2);
    }
    
    return valor;
  }
  
  // MODIFICADO: Adicionar indicação de carga na interface
  atualizarInterface() {
    this.atualizarValoresDefesa();
    this.atualizarTotalBonus();
    this.corrigirValoresIncorretos();
    
    // NOVO: Atualizar indicador de carga
    this.atualizarIndicadorCarga();
  }
  
  atualizarValoresDefesa() {
    if (this.elementos.esquivaTotal) {
      this.elementos.esquivaTotal.textContent = this.estado.defesas.esquiva;
    }
    
    if (this.elementos.bloqueioTotal) {
      // Se bloqueio é 0, mostra "—" ou "0"
      this.elementos.bloqueioTotal.textContent =
        this.estado.defesas.bloqueio > 0 ? this.estado.defesas.bloqueio : "—";
    }
    
    if (this.elementos.apararTotal) {
      // Se aparar é 0, mostra "—" ou "0"
      this.elementos.apararTotal.textContent =
        this.estado.defesas.aparar > 0 ? this.estado.defesas.aparar : "—";
    }
    
    if (this.elementos.deslocamentoTotal) {
      this.elementos.deslocamentoTotal.textContent =
        this.estado.defesas.deslocamento.toFixed(2);
    }
  }
  
  atualizarTotalBonus() {
    const total = this.calcularBonusTotal();
    
    if (this.elementos.totalBonus) {
      const texto = total >= 0 ? `+${total}` : `${total}`;
      this.elementos.totalBonus.textContent = texto;
    }
  }
  
  // NOVO MÉTODO: Atualizar indicador de carga
  atualizarIndicadorCarga() {
    // Encontrar ou criar indicador de carga
    let indicadorCarga = document.getElementById('indicadorCargaDefesa');
    
    if (!indicadorCarga && this.elementos.esquivaInfo) {
      // Criar indicador discreto
      indicadorCarga = document.createElement('div');
      indicadorCarga.id = 'indicadorCargaDefesa';
      indicadorCarga.className = 'indicador-carga';
      
      // Inserir após a info da esquiva
      this.elementos.esquivaInfo.parentNode.insertBefore(
        indicadorCarga,
        this.elementos.esquivaInfo.nextElementSibling
      );
    }
    
    if (indicadorCarga) {
      const nivel = this.estado.nivelCarga;
      const redutor = this.estado.redutorCarga;
      const peso = this.estado.pesoAtual.toFixed(1);
      const max = this.estado.pesoMaximo.toFixed(1);
      
      // Só mostrar se tiver carga
      if (nivel !== 'nenhuma' && redutor < 0) {
        const texto = this.getTextoIndicadorCarga(nivel, redutor, peso, max);
        indicadorCarga.innerHTML = texto;
        indicadorCarga.style.display = 'block';
        
        // Adicionar classe baseada no nível
        indicadorCarga.className = `indicador-carga carga-${nivel.replace(' ', '-')}`;
      } else {
        indicadorCarga.style.display = 'none';
      }
    }
  }
  
  // NOVO MÉTODO: Obter texto do indicador
  getTextoIndicadorCarga(nivel, redutor, peso, max) {
    const icones = {
      'leve': '🟡',
      'média': '🟠',
      'media': '🟠',
      'pesada': '🔴',
      'muito pesada': '🔴',
      'muito-pesada': '🔴',
      'sobrecarregado': '💀'
    };
    
    const icone = icones[nivel] || '⚪';
    const nivelFormatado = nivel.charAt(0).toUpperCase() + nivel.slice(1);
    
    return `
      <div class="carga-info" title="Carga atual: ${peso}kg / ${max}kg">
        <span class="carga-icone">${icone}</span>
        <span class="carga-texto">${nivelFormatado} (${redutor} Esquiva)</span>
      </div>
    `;
  }
  
  // NOVO MÉTODO: Feedback visual discreto
  mostrarFeedbackCarga(novoNivel, redutorMudou) {
    if (!redutorMudou) return;
    
    // Criar feedback temporário
    const feedback = document.createElement('div');
    feedback.className = 'feedback-carga';
    feedback.innerHTML = `
      <i class="fas fa-weight-hanging"></i>
      <span>Carga: ${novoNivel.toUpperCase()} (${this.estado.redutorCarga} Esquiva)</span>
    `;
    
    feedback.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 11px;
      z-index: 1000;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s;
      border-left: 3px solid ${this.getCorCarga(novoNivel)};
    `;
    
    const cardDefesas = document.querySelector('.defesas-card');
    if (cardDefesas) {
      cardDefesas.appendChild(feedback);
      
      setTimeout(() => {
        feedback.style.opacity = '1';
        feedback.style.transform = 'translateY(0)';
      }, 10);
      
      setTimeout(() => {
        feedback.style.opacity = '0';
        feedback.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          if (feedback.parentNode) feedback.parentNode.removeChild(feedback);
        }, 300);
      }, 2000);
    }
  }
  
  // NOVO MÉTODO: Cor baseada no nível de carga
  getCorCarga(nivel) {
    const cores = {
      'nenhuma': '#2ecc71',
      'leve': '#f39c12',
      'média': '#e67e22',
      'media': '#e67e22',
      'pesada': '#e74c3c',
      'muito pesada': '#c0392b',
      'muito-pesada': '#c0392b',
      'sobrecarregado': '#7f8c8d'
    };
    return cores[nivel] || '#95a5a6';
  }
  
  // MANTIDO IGUAL
  atualizarIndicadorFadiga() {
    let indicador = document.getElementById('indicadorFadiga');
    
    if (!indicador) {
      indicador = document.createElement('div');
      indicador.id = 'indicadorFadiga';
      indicador.style.cssText = `
        margin: 10px 0;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
        text-align: center;
        display: none;
      `;
      
      const container = document.querySelector('.bonus-defesa');
      if (container) {
        container.appendChild(indicador);
      }
    }
    
    if (this.estado.fadiga.ativa) {
      indicador.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i> FADIGA ATIVA!
        <small>Esquiva e Deslocamento pela metade</small>
      `;
      indicador.style.display = 'block';
      indicador.style.background = '#e74c3c';
      indicador.style.color = 'white';
    } else {
      indicador.style.display = 'none';
    }
  }
  
  // MANTIDO IGUAL
  corrigirValoresIncorretos() {
    // Corrige o bug comum do bloqueio (valor 8 fixo)
    const bloqueioElement = document.getElementById('bloqueioTotal');
    if (bloqueioElement && bloqueioElement.textContent.trim() === '8') {
      if (this.estado.defesas.bloqueio !== 8) {
        bloqueioElement.textContent =
          this.estado.defesas.bloqueio > 0 ? this.estado.defesas.bloqueio : "—";
      }
    }
    
    // Corrige aparar se não tiver arma
    const apararElement = document.getElementById('apararTotal');
    if (apararElement && this.estado.defesas.aparar === 0) {
      apararElement.textContent = "—";
    }
  }
  
  // MANTIDO IGUAL
  configurarEventos() {
    // Eventos para bônus
    ['Reflexos', 'Escudo', 'Capa', 'Outros'].forEach(bonus => {
      const input = document.getElementById(`bonus${bonus}`);
      if (input) {
        let timeout;
        
        const handler = () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            const valor = parseInt(input.value) || 0;
            this.estado.bonus[bonus.toLowerCase()] = valor;
            this.calcularTudo();
          }, 300);
        };
        
        input.addEventListener('input', handler);
        input.addEventListener('change', handler);
      }
    });
    
    // Eventos para modificadores
    ['esquiva', 'bloqueio', 'aparar', 'deslocamento'].forEach(defesa => {
      const input = document.getElementById(`${defesa}Mod`);
      if (input) {
        input.addEventListener('change', () => {
          this.estado.modificadores[defesa] = parseInt(input.value) || 0;
          this.calcularTudo();
        });
      }
    });
    
    // Eventos para botões +/-
    document.querySelectorAll('.defesa-controle').forEach(container => {
      const minus = container.querySelector('.minus');
      const plus = container.querySelector('.plus');
      const input = container.querySelector('.mod-input');
      
      if (minus && plus && input) {
        const id = input.id;
        const defesa = id.replace('Mod', '');
        
        minus.addEventListener('click', () => {
          const valorAtual = parseInt(input.value) || 0;
          input.value = valorAtual - 1;
          this.estado.modificadores[defesa] = valorAtual - 1;
          this.calcularTudo();
        });
        
        plus.addEventListener('click', () => {
          const valorAtual = parseInt(input.value) || 0;
          input.value = valorAtual + 1;
          this.estado.modificadores[defesa] = valorAtual + 1;
          this.calcularTudo();
        });
      }
    });
  }
  
  // MODIFICADO: Adicionar monitoramento de carga
  iniciarMonitoramento() {
    // Monitora mudanças em DX e HT
    this.monitorarAtributos();
    
    // Monitora nível de carga (JÁ FEITO NO iniciarMonitoramentoCarga)
    
    // Monitora fadiga (PF)
    this.monitorarFadiga();
    
    // Atualiza periodicamente
    this.iniciarAtualizacaoPeriodica();
  }
  
  // MANTIDO IGUAL
  monitorarAtributos() {
    ['DX', 'HT'].forEach(atributo => {
      const input = document.getElementById(atributo);
      if (input) {
        let timeout;
        
        input.addEventListener('input', () => {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            this.atualizarAtributos();
            this.calcularTudo();
          }, 500);
        });
      }
    });
  }
  
  // MANTIDO IGUAL
  atualizarAtributos() {
    if (this.elementos.dx) {
      this.estado.atributos.dx = parseInt(this.elementos.dx.value) || 10;
    }
    
    if (this.elementos.ht) {
      this.estado.atributos.ht = parseInt(this.elementos.ht.value) || 10;
    }
  }
  
  // MANTIDO IGUAL
  monitorarFadiga() {
    const pfInput = document.getElementById('pfAtualDisplay');
    if (!pfInput) return;
    
    pfInput.addEventListener('input', () => {
      setTimeout(() => {
        this.verificarFadiga();
        this.calcularTudo();
      }, 200);
    });
  }
  
  // MANTIDO IGUAL
  iniciarAtualizacaoPeriodica() {
    // Atualiza a cada 2 segundos para garantir sincronia
    setInterval(() => {
      if (!this.atualizando) {
        this.calcularTudo();
      }
    }, 2000);
  }
  
  // MANTIDO IGUAL
  forcarRecalculo() {
    this.estado.nh.escudo = null;
    this.estado.nh.arma = null;
    
    this.carregarValoresIniciais();
    this.calcularTudo();
  }
  
  // MANTIDO IGUAL
  mostrarStatus() {
    console.log('=== STATUS DEFESAS ===');
    console.log('Atributos:', this.estado.atributos);
    console.log('Defesas:', this.estado.defesas);
    console.log('Carga:', this.estado.nivelCarga, `(${this.estado.redutorCarga})`);
    console.log('NHs:', this.estado.nh);
    console.log('Fadiga:', this.estado.fadiga.ativa);
    console.log('=====================');
  }
}


// Sistema global
let sistemaDefesasGlobal = null;

function iniciarSistemaDefesas() {
  if (sistemaDefesasGlobal) return sistemaDefesasGlobal;
  
  sistemaDefesasGlobal = new SistemaDefesas();
  
  setTimeout(() => {
    sistemaDefesasGlobal.iniciar();
  }, 1000);
  
  return sistemaDefesasGlobal;
}

// Inicialização automática
document.addEventListener('DOMContentLoaded', function() {
  const combateTab = document.getElementById('combate');
  
  function verificarEIniciar() {
    if (combateTab && combateTab.classList.contains('active')) {
      iniciarSistemaDefesas();
    }
  }
  
  verificarEIniciar();
  
  if (combateTab) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === 'class') {
          setTimeout(verificarEIniciar, 100);
        }
      });
    });
    
    observer.observe(combateTab, { attributes: true });
  }
});

// Funções globais para console
window.defesa = {
  iniciar: () => iniciarSistemaDefesas(),
  status: () => {
    if (sistemaDefesasGlobal) {
      sistemaDefesasGlobal.mostrarStatus();
    }
  },
  recalcular: () => {
    if (sistemaDefesasGlobal) {
      sistemaDefesasGlobal.forcarRecalculo();
    }
  },
  // NOVO: Comando para forçar atualização de carga
  atualizarCarga: (nivel) => {
    if (sistemaDefesasGlobal) {
      sistemaDefesasGlobal.atualizarNivelCarga(nivel);
    }
  }
};

// Atalhos de console
window.DS = () => defesa.status();
window.DR = () => defesa.recalcular();
window.DC = (nivel) => defesa.atualizarCarga(nivel);

console.log('✅ Sistema de Defesas dinâmico COM CARGA carregado!');
console.log(' Comandos: DS() - Status, DR() - Recalcular, DC("leve") - Testar carga');